"""Tone-locked PBR surfaces for the blockout materials (needs bpy).

A blockout material (`bo-<name>`, one shared Principled BSDF) is rebuilt in place. Rules that hold for every family:

* Tone-lock. The blockout colour stays the authority: base colour = blockout colour x (scan / scan mean), where the scan's mean
  linear albedo comes from dress.lock.json, so the scan only supplies detail around the build file's tone. A share `chroma` of the
  scan's own per-channel variation is kept; the rest is its luminance variation. Roughness is handled the same way.
* World-space box projection (no dependence on the boxes' UVs) with a second sample at another rotation, scale and offset blended
  by a low-frequency mask (a cheap stochastic tiling), a macro brightness mask, and shader-mask grime (ambient-occlusion dirt in
  corners, up-facing dust, dampness near the ground).
* Alpha, metallic and emission are never replaced. A material with alpha below 1 (glass, haze), or one the config marks `dirt-only`,
  only gets a dirt mask on its roughness. A surface that emits (the heartstream cave walls) keeps its emission colour and strength,
  modulated by the same detail ratio so the light it gives away keeps its mean.
* Detail comes from the diffuse map as a bump (the box projection has no tangents for a normal map). OIDN is fed the albedo and the
  shading normal, so the bump reaches the denoiser's guide pass.
* Sizes are metres at scene scale `K` (the bark world is built in millimetres and scaled by 1000): tile sizes multiply by K.
"""
import json
import os

import bpy

from . import seeds

_LOCK = None


def lock(dress_dir):
    global _LOCK
    if _LOCK is None:
        with open(os.path.join(dress_dir, "dress.lock.json"), encoding="utf-8") as f:
            _LOCK = json.load(f)
    return _LOCK


def cache_dir(dress_dir):
    return os.environ.get("DRESS_CACHE") or os.path.join(os.path.dirname(os.path.abspath(dress_dir)), "cache")


class B:
    """Small node-building helper."""

    def __init__(self, nt):
        self.nt, self.x = nt, -1200

    def n(self, idname, label=None, **props):
        nd = self.nt.nodes.new(idname)
        nd.location = (self.x, 0)
        self.x += 40
        if label:
            nd.label = label
        for k, v in props.items():
            setattr(nd, k, v)
        return nd

    def link(self, a, b):
        self.nt.links.new(a, b)

    def val(self, v):
        nd = self.n("ShaderNodeValue")
        nd.outputs[0].default_value = v
        return nd.outputs[0]

    def math(self, op, a, b=None, clamp=False):
        nd = self.n("ShaderNodeMath", operation=op, use_clamp=clamp)
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                nd.inputs[i].default_value = v
            else:
                self.link(v, nd.inputs[i])
        return nd.outputs[0]

    def mix(self, a, b, fac=1.0, blend="MIX", clamp=False):
        """RGBA mix. a and b are sockets or (r, g, b) tuples; fac a socket or a float."""
        nd = self.n("ShaderNodeMix", data_type="RGBA", blend_type=blend, clamp_result=clamp)
        if isinstance(fac, (int, float)):
            nd.inputs[0].default_value = fac
        else:
            self.link(fac, nd.inputs[0])
        for idx, v in ((6, a), (7, b)):
            if isinstance(v, (tuple, list)):
                nd.inputs[idx].default_value = (v[0], v[1], v[2], 1.0)
            else:
                self.link(v, nd.inputs[idx])
        return nd.outputs[2]

    def gray(self, f):
        nd = self.n("ShaderNodeCombineColor")
        for i in range(3):
            self.link(f, nd.inputs[i])
        return nd.outputs[0]

    def lum(self, col):
        nd = self.n("ShaderNodeRGBToBW")
        self.link(col, nd.inputs[0])
        return nd.outputs[0]

    def mapr(self, v, a0, a1, b0=0.0, b1=1.0, clamp=True):
        nd = self.n("ShaderNodeMapRange", clamp=clamp)
        if not isinstance(v, (int, float)):
            self.link(v, nd.inputs[0])
        for i, x in ((1, a0), (2, a1), (3, b0), (4, b1)):
            nd.inputs[i].default_value = x
        return nd.outputs[0]


def _load(path, nonc=False):
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = "Non-Color" if nonc else "sRGB"
    return im


class Sampler:
    """World-space box-projected samples of one or two images with the stochastic second sample (shared mapping nodes)."""

    def __init__(self, b, tile, seed_key, stochastic=True, blend=0.18):
        self.b, self.blend, self.stoch = b, blend, stochastic
        geo = b.n("ShaderNodeNewGeometry")
        self.pos = geo.outputs["Position"]
        self.nrm = geo.outputs["Normal"]
        u = seeds.unit(seed_key, "u")
        v = seeds.unit(seed_key, "v")
        self.mapA = self._mapping(1.0 / tile, (0, 0, 0), (0, 0, 0))
        self.mapB = self._mapping(1.0 / (tile * 0.79), (0.0, 0.0, 0.0), (u * 9.0, v * 9.0, (u + v) * 4.0)) if stochastic else None  # offset and scale only: a rotation skews wood grain
        if stochastic:
            nz = b.n("ShaderNodeTexNoise", noise_dimensions="3D")
            nz.inputs["Scale"].default_value = 0.31 / tile
            nz.inputs["Detail"].default_value = 1.0
            b.link(self.pos, nz.inputs["Vector"])
            self.mask = b.mapr(nz.outputs["Fac"], 0.43, 0.57)

    def _mapping(self, scale, rot, loc):
        m = self.b.n("ShaderNodeMapping", vector_type="POINT")
        m.inputs["Scale"].default_value = (scale, scale, scale)
        m.inputs["Rotation"].default_value = rot
        m.inputs["Location"].default_value = loc
        self.b.link(self.pos, m.inputs["Vector"])
        return m.outputs[0]

    def tex(self, im):
        b = self.b

        def one(vec):
            t = b.n("ShaderNodeTexImage", projection="BOX", projection_blend=self.blend, interpolation="Linear", extension="REPEAT")
            t.image = im
            b.link(vec, t.inputs["Vector"])
            return t.outputs["Color"]

        a = one(self.mapA)
        if not self.stoch:
            return a
        return b.mix(a, one(self.mapB), self.mask)


def noise(b, pos, scale, detail=2.0, rough=0.55, dist=0.0):
    nz = b.n("ShaderNodeTexNoise", noise_dimensions="3D")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = detail
    nz.inputs["Roughness"].default_value = rough
    nz.inputs["Distortion"].default_value = dist
    b.link(pos, nz.inputs["Vector"])
    return nz.outputs["Fac"]


def voronoi(b, pos, scale, feature="F1", out="Distance"):
    v = b.n("ShaderNodeTexVoronoi", feature=feature, voronoi_dimensions="3D")
    v.inputs["Scale"].default_value = scale
    b.link(pos, v.inputs["Vector"])
    return v.outputs[out]


def around_one(b, f, amp):
    """1 + amp * (f - 0.5) * 2 : a multiplier with mean about 1 for a 0..1 noise f."""
    return b.math("ADD", b.math("MULTIPLY", b.math("SUBTRACT", f, 0.5), 2.0 * amp), 1.0)


# ---------------------------------------------------------------- families: each returns (ratio colour, rough multiplier, height)
def fam_scan(b, p, ctx, K, mat_name):
    lk = lock(ctx["dress_dir"])["assets"][p["scan"]]
    root = os.path.join(cache_dir(ctx["dress_dir"]), "textures", p["scan"])
    res = p.get("res", "1k")
    diff = lk["albedo_file"].replace("_1k", "_" + res).replace("_2k", "_" + res)
    if not os.path.exists(os.path.join(root, diff)):
        diff = lk["albedo_file"]
    res_px = 2048 if "_2k" in diff else 1024
    s = Sampler(b, p["tile_m"] * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=p.get("stochastic", True))
    col = s.tex(_load(os.path.join(root, diff)))
    mean = lk["mean_albedo_linear"]
    ratio = b.mix(b.gray(b.math("DIVIDE", b.lum(col), max(1e-4, 0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2]))),
                  b.mix(col, tuple(mean), 1.0, "DIVIDE"), p.get("chroma", 0.35))
    rmult = None
    rf = lk.get("roughness_file")
    if rf:
        rf = rf.replace("_1k", "_" + res).replace("_2k", "_" + res)
        if not os.path.exists(os.path.join(root, rf)):
            rf = lk["roughness_file"]
        rt = s.tex(_load(os.path.join(root, rf), nonc=True))
        rmult = b.math("DIVIDE", b.lum(rt), max(0.05, lk["mean_roughness"]))
    ctx["record"]["textures"][p["scan"]] = {"file": diff, "md5": lk["files"][diff]["md5"], "res_px": res_px, "tile_m": p["tile_m"],
                                          "texels_per_m": round(res_px / p["tile_m"], 1), "licence": lk["licence"], "K": K}
    # macro brightness: a low-frequency mask so big areas do not read as one tone
    macro = around_one(b, noise(b, s.pos, 0.9 / (p["tile_m"] * K), 1.0), p.get("macro", 0.10))
    ratio = b.mix(ratio, b.gray(macro), 1.0, "MULTIPLY")
    return ratio, rmult, b.lum(col), s


def fam_noise(b, p, ctx, K, mat_name):
    """Concrete, plaster, painted wall, dirt without a scan: pores and mottling from noise and Voronoi cells."""
    s = Sampler(b, p.get("tile_m", 1.5) * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False)
    t = p.get("tile_m", 1.5) * K
    n1 = noise(b, s.pos, 1.3 / t, 4.0, 0.6)
    n2 = noise(b, s.pos, 14.0 / t, 3.0, 0.7)
    pores = b.mapr(voronoi(b, s.pos, 55.0 / t), 0.0, 0.18, 0.88, 1.0)
    detail = b.math("MULTIPLY", b.math("MULTIPLY", around_one(b, n1, p.get("macro", 0.09)), around_one(b, n2, p.get("fine", 0.05))), pores)
    height = b.math("ADD", b.math("MULTIPLY", n2, 0.6), b.math("MULTIPLY", pores, 0.4))
    return b.gray(detail), b.math("ADD", b.math("MULTIPLY", n1, 0.4), 0.8), height, s


def fam_grid(b, p, ctx, K, mat_name):
    """Vinyl, linoleum or acoustic ceiling tile: a brick bond (square tiles), per-tile variation, dark joints, speckle."""
    s = Sampler(b, 1.0 * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False)
    t = p.get("tile_m", 0.6) * K
    mp = b.n("ShaderNodeMapping", vector_type="POINT")
    mp.inputs["Scale"].default_value = (1.0 / t,) * 3
    b.link(s.pos, mp.inputs["Vector"])
    br = b.n("ShaderNodeTexBrick", offset=p.get("bond_offset", 0.0), squash=1.0)
    br.inputs["Scale"].default_value = 1.0
    br.inputs["Mortar Size"].default_value = p.get("joint", 0.012)
    br.inputs["Mortar Smooth"].default_value = 0.1
    br.inputs["Bias"].default_value = 0.0
    br.inputs["Brick Width"].default_value = 1.0
    br.inputs["Row Height"].default_value = 1.0
    br.inputs["Color1"].default_value = (1.03, 1.03, 1.03, 1)
    br.inputs["Color2"].default_value = (0.97, 0.97, 0.97, 1)
    br.inputs["Mortar"].default_value = (p.get("joint_tone", 0.72),) * 3 + (1,)
    b.link(mp.outputs[0], br.inputs["Vector"])
    speck = around_one(b, noise(b, s.pos, 70.0 / t, 1.0, 0.5), p.get("fine", 0.04))
    mac = around_one(b, noise(b, s.pos, 0.5 / t, 2.0, 0.6), p.get("macro", 0.06))
    col = b.mix(b.mix(br.outputs["Color"], b.gray(speck), 1.0, "MULTIPLY"), b.gray(mac), 1.0, "MULTIPLY")
    joint = b.math("SUBTRACT", 1.0, br.outputs["Fac"])
    return col, b.math("ADD", b.math("MULTIPLY", joint, 0.0), 1.0), b.math("MULTIPLY", joint, 1.0), s


def fam_wallpaper(b, p, ctx, K, mat_name):
    """Plain printed paper: faint vertical stripe, paper grain, mottling. No lettering, no figures."""
    s = Sampler(b, 1.0 * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False)
    t = p.get("tile_m", 0.18) * K
    sep = b.n("ShaderNodeSeparateXYZ")
    b.link(s.pos, sep.inputs[0])
    # stripe along the horizontal wall axis: x + y (a wall faces x or y), repeats every `t`
    ax = b.math("ADD", sep.outputs["X"], sep.outputs["Y"])
    wave = b.n("ShaderNodeTexWave", wave_type="BANDS", bands_direction="X", wave_profile="SIN")
    wave.inputs["Scale"].default_value = 1.0 / t
    wave.inputs["Distortion"].default_value = 0.4
    wave.inputs["Detail"].default_value = 1.0
    cmb = b.n("ShaderNodeCombineXYZ")
    b.link(ax, cmb.inputs["X"])
    b.link(sep.outputs["Z"], cmb.inputs["Z"])
    b.link(cmb.outputs[0], wave.inputs["Vector"])
    stripe = around_one(b, wave.outputs["Fac"], p.get("stripe", 0.035))
    grain = around_one(b, noise(b, s.pos, 160.0 / (p.get("tile_m", 0.18) * K), 1.0, 0.5), p.get("fine", 0.03))
    mott = around_one(b, noise(b, s.pos, 1.1 / (p.get("tile_m", 0.18) * K) * 0.18, 3.0, 0.6), p.get("macro", 0.08))
    col = b.gray(b.math("MULTIPLY", b.math("MULTIPLY", stripe, grain), mott))
    return col, b.math("ADD", b.math("MULTIPLY", mott, 0.3), 0.7), b.math("MULTIPLY", grain, 0.5), s


def fam_metal(b, p, ctx, K, mat_name):
    """Painted or bare metal: fine scratches (thin Voronoi edges), mottled wear, no rust unless asked."""
    s = Sampler(b, 1.0 * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False)
    t = p.get("tile_m", 0.5) * K
    edge = voronoi(b, s.pos, 38.0 / t, "DISTANCE_TO_EDGE")
    scr = b.mapr(edge, 0.0, 0.04, 0.78, 1.0)
    mott = around_one(b, noise(b, s.pos, 3.0 / t, 4.0, 0.6), p.get("macro", 0.10))
    fine = around_one(b, noise(b, s.pos, 120.0 / t, 1.0, 0.5), 0.03)
    col = b.gray(b.math("MULTIPLY", b.math("MULTIPLY", scr, mott), fine))
    rough = b.math("ADD", b.math("MULTIPLY", b.math("SUBTRACT", 1.0, scr), 2.2), b.math("MULTIPLY", mott, 0.5))
    return col, b.math("ADD", rough, 0.25), b.math("MULTIPLY", scr, 0.6), s


def fam_tissue(b, p, ctx, K, mat_name):
    """Abstract wet membrane for the heartstream marrow (no CC0 scan exists): mottled folds and fine pores, never a wound.
    A cell pattern gives soft ridges; the wet look comes from low roughness with wide breakup, not from darker or redder spots."""
    s = Sampler(b, 1.0 * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False)
    t = p.get("tile_m", 2.0) * K
    folds = noise(b, s.pos, 0.9 / t, 5.0, 0.6, 1.2)

    def warped(scale, warp_scale, amp):
        """The position pushed by a vector noise, so one cell size does not read as a regular spot pattern (G8)."""
        nz = b.n("ShaderNodeTexNoise", noise_dimensions="3D")
        nz.inputs["Scale"].default_value = warp_scale / t
        nz.inputs["Detail"].default_value = 2.0
        b.link(s.pos, nz.inputs["Vector"])
        off = b.n("ShaderNodeVectorMath", operation="SUBTRACT")
        b.link(nz.outputs["Color"], off.inputs[0])
        off.inputs[1].default_value = (0.5, 0.5, 0.5)
        sc = b.n("ShaderNodeVectorMath", operation="SCALE")
        b.link(off.outputs[0], sc.inputs[0])
        sc.inputs["Scale"].default_value = amp * t
        add = b.n("ShaderNodeVectorMath", operation="ADD")
        b.link(s.pos, add.inputs[0])
        b.link(sc.outputs[0], add.inputs[1])
        return add.outputs[0], scale / t

    pa, sa = warped(2.3, 1.1, 1.3)
    pb, sb = warped(5.7, 2.3, 0.9)
    cells_a = voronoi(b, pa, sa, "F1", "Distance")
    cells_b = voronoi(b, pb, sb, "F1", "Distance")
    cells = b.math("ADD", b.math("MULTIPLY", cells_a, 0.6), b.math("MULTIPLY", cells_b, 0.4))
    ridge = b.mapr(cells, 0.05, 0.6, 1.0, 0.95)
    pores = around_one(b, noise(b, s.pos, 38.0 / t, 3.0, 0.65), p.get("fine", 0.06))
    col = b.gray(b.math("MULTIPLY", b.math("MULTIPLY", around_one(b, folds, p.get("macro", 0.18)), ridge), pores))
    rough = b.math("ADD", b.math("MULTIPLY", folds, 0.7), 0.55)
    height = b.math("ADD", b.math("MULTIPLY", ridge, 0.6), b.math("MULTIPLY", folds, 0.5))
    return col, rough, height, s


def fam_foliage(b, p, ctx, K, mat_name):
    """Conifer or leaf canopy seen from far: fine clumped light/dark variation around the blockout green."""
    s = Sampler(b, 1.0 * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False)
    t = p.get("tile_m", 3.0) * K
    clump = noise(b, s.pos, 1.6 / t, 3.0, 0.65)
    fine = noise(b, s.pos, 22.0 / t, 3.0, 0.7)
    col = b.gray(b.math("MULTIPLY", around_one(b, clump, p.get("macro", 0.35)), around_one(b, fine, p.get("fine", 0.22))))
    return col, b.math("ADD", b.math("MULTIPLY", fine, 0.2), 0.9), b.math("MULTIPLY", fine, 1.0), s


FAMILIES = {"scan": fam_scan, "noise": fam_noise, "grid": fam_grid, "wallpaper": fam_wallpaper, "metal": fam_metal,
            "tissue": fam_tissue, "foliage": fam_foliage}


# ---------------------------------------------------------------- the surface
def dress_material(mat, p, ctx, K, key):
    """Rebuild `mat` (a blockout material) in place from the config entry `p`. Returns a record dict."""
    nt = mat.node_tree
    old = nt.nodes.get("Principled BSDF")
    col0 = tuple(old.inputs["Base Color"].default_value)[:3]
    rough0 = old.inputs["Roughness"].default_value
    metal0 = old.inputs["Metallic"].default_value
    alpha0 = old.inputs["Alpha"].default_value
    ek = "Emission Color" if "Emission Color" in old.inputs else "Emission"
    emit0 = old.inputs["Emission Strength"].default_value
    ecol0 = tuple(old.inputs[ek].default_value)[:3]
    fam = p["family"]
    rec = {"family": fam, "scan": p.get("scan"), "blockout_color": [round(c, 4) for c in col0], "alpha": alpha0, "emission": emit0}
    ctx["record"]["materials"][key] = rec
    dirt_only = fam == "dirt-only" or alpha0 < 0.999
    nt.nodes.clear()
    b = B(nt)
    out = b.n("ShaderNodeOutputMaterial")
    bs = b.n("ShaderNodeBsdfPrincipled")
    b.link(bs.outputs["BSDF"], out.inputs["Surface"])
    bs.inputs["Metallic"].default_value = metal0
    bs.inputs["Alpha"].default_value = alpha0
    for k in ("Specular IOR Level",):
        if k in bs.inputs and "specular" in p:
            bs.inputs[k].default_value = p["specular"]
    if p.get("sss"):
        bs.inputs["Subsurface Weight"].default_value = p["sss"]
        bs.inputs["Subsurface Radius"].default_value = (0.3, 0.1, 0.1)
    geo = b.n("ShaderNodeNewGeometry")
    pos, nrm = geo.outputs["Position"], geo.outputs["Normal"]
    if dirt_only:  # glass, haze: keep colour and alpha, break up the roughness only
        bs.inputs["Base Color"].default_value = (*col0, 1.0)
        bs.inputs[ek].default_value = (*ecol0, 1.0)
        bs.inputs["Emission Strength"].default_value = emit0
        n1 = noise(b, pos, 5.0 / K, 4.0, 0.6)
        n2 = noise(b, pos, 90.0 / K, 2.0, 0.6)
        r = b.math("ADD", b.math("MULTIPLY", n1, p.get("dirt", 0.22)), b.math("MULTIPLY", n2, 0.05))
        bs.inputs["Roughness"].default_value = rough0
        b.link(b.math("ADD", r, rough0 * 0.8, clamp=True), bs.inputs["Roughness"])
        rec["dirt_only"] = True
        return rec
    ratio, rmult, height, s = FAMILIES[fam](b, p, ctx, K, key)
    # tone-lock: blockout colour x ratio
    base = b.mix(ratio, col0, 1.0, "MULTIPLY", clamp=True)
    # grime: ambient-occlusion dirt, up-facing dust, dampness near the ground
    g = ctx["grime"]
    gs = p.get("grime", 1.0) * g.get("strength", 1.0)
    if gs > 0:
        ao = b.n("ShaderNodeAmbientOcclusion", samples=8, inside=False, only_local=False)
        ao.inputs["Distance"].default_value = g.get("ao_distance_m", 0.45) * K
        aom = b.math("SUBTRACT", 1.0, b.math("MULTIPLY", b.math("SUBTRACT", 1.0, ao.outputs["AO"]), g.get("ao", 0.30) * gs))
        sep = b.n("ShaderNodeSeparateXYZ")
        b.link(pos, sep.inputs[0])
        nsep = b.n("ShaderNodeSeparateXYZ")
        b.link(nrm, nsep.inputs[0])
        upf = b.mapr(nsep.outputs["Z"], 0.72, 1.0)
        nz = noise(b, pos, 2.2 / K, 3.0, 0.6)
        dust = b.math("MULTIPLY", b.math("MULTIPLY", upf, b.mapr(nz, 0.35, 0.75)), g.get("dust", 0.16) * gs)
        damp_h = g.get("damp_height_m", 0.6) * K
        zf = b.math("SUBTRACT", 1.0, b.mapr(sep.outputs["Z"], ctx["floor_z"] * K, ctx["floor_z"] * K + damp_h))
        damp = b.math("MULTIPLY", b.math("MULTIPLY", zf, b.mapr(noise(b, pos, 1.7 / K, 3.0, 0.6), 0.3, 0.8)), g.get("damp", 0.14) * gs)
        base = b.mix(base, b.mix(base, (0.74, 0.7, 0.64), 1.0, "MULTIPLY"), dust)  # dust lightens and greys a little
        base = b.mix(base, b.gray(aom), 1.0, "MULTIPLY")
        base = b.mix(base, b.gray(b.math("SUBTRACT", 1.0, damp)), 1.0, "MULTIPLY")
        ctx["record"]["grime_used"] = True
    tg = g.get("tone_gain", 1.0) * p.get("gain", 1.0)  # per-location albedo gain that keeps the frame's tone (grime and bounce darken a little)
    if abs(tg - 1.0) > 1e-4:
        base = b.mix(base, (tg, tg, tg), 1.0, "MULTIPLY", clamp=True)
    bs.inputs["Base Color"].default_value = (*col0, 1.0)
    b.link(base, bs.inputs["Base Color"])
    rtone = rough0
    if rmult is not None:
        r = b.math("MULTIPLY", rmult, rtone, clamp=True)
    else:
        r = b.math("MULTIPLY", b.math("ADD", 1.0, b.math("MULTIPLY", b.math("SUBTRACT", 1.0, b.lum(ratio)), 0.5)), rtone, clamp=True)
    bs.inputs["Roughness"].default_value = rough0
    b.link(b.math("MAXIMUM", b.math("MINIMUM", r, 1.0), 0.04), bs.inputs["Roughness"])
    if p.get("bump", 0.35) > 0 and height is not None:
        bp = b.n("ShaderNodeBump")
        bp.inputs["Strength"].default_value = p.get("bump", 0.35)
        bp.inputs["Distance"].default_value = p.get("bump_m", 0.004) * K
        b.link(height, bp.inputs["Height"])
        b.link(bp.outputs["Normal"], bs.inputs["Normal"])
    if emit0 > 0:  # emission keeps colour and strength; the colour carries the detail ratio (mean 1)
        bs.inputs[ek].default_value = (*ecol0, 1.0)
        b.link(b.mix(ratio, ecol0, 1.0, "MULTIPLY"), bs.inputs[ek])
        bs.inputs["Emission Strength"].default_value = emit0
    return rec

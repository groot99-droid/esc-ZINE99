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

    def __init__(self, b, tile, seed_key, stochastic=True, blend=0.18, pos=None, obj_jitter=0.0, third=False):
        """pos: a position socket to sample at instead of the world position (course offsets, domain warp). obj_jitter: metres of a
        per-object random offset (Object Info > Random), so pieces of one material never share a tile phase. third: a third sample
        (another scale and offset, its own mask) for surfaces where two samples still repeat (R1)."""
        self.b, self.blend, self.stoch = b, blend, stochastic
        geo = b.n("ShaderNodeNewGeometry")
        self.wpos = geo.outputs["Position"]
        self.pos = pos if pos is not None else self.wpos
        self.nrm = geo.outputs["Normal"]
        if obj_jitter:
            self.pos = jitter_pos(b, self.pos, obj_jitter)
        u = seeds.unit(seed_key, "u")
        v = seeds.unit(seed_key, "v")
        self.mapA = self._mapping(1.0 / tile, (0, 0, 0), (0, 0, 0))
        self.mapB = self._mapping(1.0 / (tile * 0.79), (0.0, 0.0, 0.0), (u * 9.0, v * 9.0, (u + v) * 4.0)) if stochastic else None  # offset and scale only: a rotation skews wood grain
        self.mapC = self._mapping(1.0 / (tile * 1.27), (0.0, 0.0, 0.0), (v * 13.0, u * 11.0, (u - v) * 5.0)) if (stochastic and third) else None
        if stochastic:
            nz = b.n("ShaderNodeTexNoise", noise_dimensions="3D")
            nz.inputs["Scale"].default_value = 0.31 / tile
            nz.inputs["Detail"].default_value = 1.0
            b.link(self.pos, nz.inputs["Vector"])
            self.mask = b.mapr(nz.outputs["Fac"], 0.43, 0.57)
            if self.mapC is not None:
                nz2 = b.n("ShaderNodeTexNoise", noise_dimensions="3D")
                nz2.inputs["Scale"].default_value = 0.53 / tile
                nz2.inputs["Detail"].default_value = 1.0
                b.link(self.pos, nz2.inputs["Vector"])
                self.mask2 = b.mapr(nz2.outputs["Fac"], 0.47, 0.6)

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
        ab = b.mix(a, one(self.mapB), self.mask)
        if self.mapC is None:
            return ab
        return b.mix(ab, one(self.mapC), self.mask2)


def jitter_pos(b, pos, metres):
    """pos + a per-object random offset of up to `metres` on each axis (Object Info > Random, three decorrelated fractions)."""
    oi = b.n("ShaderNodeObjectInfo")
    r = oi.outputs["Random"]
    cmb = b.n("ShaderNodeCombineXYZ")
    for i, k in enumerate((1.0, 7.31, 13.7)):
        f = r if k == 1.0 else b.math("FRACT", b.math("MULTIPLY", r, k))
        b.link(b.math("MULTIPLY", f, metres), cmb.inputs[i])
    add = b.n("ShaderNodeVectorMath", operation="ADD")
    b.link(pos, add.inputs[0])
    b.link(cmb.outputs[0], add.inputs[1])
    return add.outputs[0]


def courses(b, pos, p, K, seed_key):
    """Board or log courses along Z (R1): every course of height h gets its own texture offset along the wall, a value and hue
    jitter, and a dark seam (chinking) at its edges. Returns (sample position, colour multiplier socket, seam factor 0..1 where 0 is
    the seam). A floor has one Z, so it reads as one course."""
    c = p["courses"]
    h = c.get("h_m", 0.2) * K
    sep = b.n("ShaderNodeSeparateXYZ")
    b.link(pos, sep.inputs[0])
    zc = b.math("DIVIDE", sep.outputs["Z"], h)
    if c.get("vary", 0.0) > 0:  # course heights vary: z warped by two incommensurate sines (monotonic, quasi-periodic)
        v = min(c["vary"], 1.0)
        w1 = b.math("SINE", b.math("MULTIPLY", zc, 2 * 3.14159265 / 3.7))
        w2 = b.math("SINE", b.math("MULTIPLY", zc, 2 * 3.14159265 / 5.3))
        zc = b.math("ADD", zc, b.math("ADD", b.math("MULTIPLY", w1, 0.3 * v), b.math("MULTIPLY", w2, 0.22 * v)))
    idx = b.math("FLOOR", zc)
    fr = b.math("SUBTRACT", zc, idx)
    wn = b.n("ShaderNodeTexWhiteNoise", noise_dimensions="1D")
    b.link(b.math("ADD", idx, seeds.unit(seed_key, "courses") * 97.0), wn.inputs["W"])
    cs = b.n("ShaderNodeSeparateColor")
    b.link(wn.outputs["Color"], cs.inputs[0])
    off = b.n("ShaderNodeCombineXYZ")
    b.link(b.math("MULTIPLY", wn.outputs["Value"], 23.0 * K), off.inputs[0])
    b.link(b.math("MULTIPLY", cs.outputs[1], 23.0 * K), off.inputs[1])
    add = b.n("ShaderNodeVectorMath", operation="ADD")
    b.link(pos, add.inputs[0])
    b.link(off.outputs[0], add.inputs[1])
    val = around_one(b, wn.outputs["Value"], c.get("jitter", 0.08))
    hue = c.get("hue", 0.04)
    tint = b.n("ShaderNodeCombineColor")
    for i in range(3):
        b.link(b.math("MULTIPLY", around_one(b, cs.outputs[i], hue), val), tint.inputs[i])
    seam_w = c.get("seam_m", 0.012) * K / h
    edge = b.math("MINIMUM", fr, b.math("SUBTRACT", 1.0, fr))
    seam = b.mapr(edge, 0.0, max(seam_w, 1e-4), 0.0, 1.0)
    # R3: the round profile of a log across its course (0 at the seams, 1 at the middle): sqrt(1 - (2 fr - 1)^2)
    x = b.math("SUBTRACT", b.math("MULTIPLY", fr, 2.0), 1.0)
    prof = b.math("SQRT", b.math("MAXIMUM", b.math("SUBTRACT", 1.0, b.math("MULTIPLY", x, x)), 0.0))
    return add.outputs[0], tint.outputs[0], seam, prof


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
    skey = "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name)
    cpos, ctint, cseam, cprof = None, None, None, None
    if p.get("courses"):
        g = b.n("ShaderNodeNewGeometry")
        cpos, ctint, cseam, cprof = courses(b, g.outputs["Position"], p, K, skey)
    s = Sampler(b, p["tile_m"] * K, skey, stochastic=p.get("stochastic", True), pos=cpos,
                obj_jitter=p.get("obj_jitter_m", 0.0) * K, third=p.get("third", False))
    col = s.tex(_load(os.path.join(root, diff)))
    mean = lk["mean_albedo_linear"]
    ratio = b.mix(b.gray(b.math("DIVIDE", b.lum(col), max(1e-4, 0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2]))),
                  b.mix(col, tuple(mean), 1.0, "DIVIDE"), p.get("chroma", 0.35))
    if p.get("contrast", 1.0) != 1.0:  # P1: the scan's detail around the build tone at a share (a blotchy scan reads as mould at 1.0)
        ratio = b.mix((1.0, 1.0, 1.0), ratio, p["contrast"])
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
    height = b.lum(col)
    if p.get("macro2"):  # a second, much larger brightness field (R1): whole areas a few percent lighter or darker
        ratio = b.mix(ratio, b.gray(around_one(b, noise(b, s.pos, 0.17 / K, 2.0, 0.5), p["macro2"])), 1.0, "MULTIPLY")
    if ctint is not None:
        ratio = b.mix(ratio, ctint, 1.0, "MULTIPLY")
        dark = p["courses"].get("seam_tone", 0.35)
        ratio = b.mix(ratio, b.gray(b.mapr(cseam, 0.0, 1.0, dark, 1.0)), 1.0, "MULTIPLY")
        height = b.math("MULTIPLY", height, b.mapr(cseam, 0.0, 1.0, 0.2, 1.0))
        rd = p["courses"].get("round_m", 0.0)
        if rd > 0:  # R3: logs read round: the profile goes into the bump (depth round_m) and shades the log's top and bottom a little
            height = b.math("ADD", height, b.math("MULTIPLY", cprof, rd / max(p.get("bump_m", 0.004), 1e-5)))
            sh = p["courses"].get("round_shade", 0.18)
            ratio = b.mix(ratio, b.gray(b.mapr(cprof, 0.0, 0.8, 1.0 - sh, 1.0 + sh * 0.25)), 1.0, "MULTIPLY")
    return ratio, rmult, height, s


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
    if p.get("board_m"):  # R2/R3: boards (a board ceiling, a plank wall): long along `board_axis`, tile_m wide
        col, rmult, height = _boards(b, p, ctx, K, mat_name, s, t)
        if p.get("detail_scan"):
            ds = dict(p["detail_scan"], family="scan")
            dratio, _, dh, _ = fam_scan(b, ds, ctx, K, mat_name + "/detail")
            col = b.mix(col, dratio, 1.0, "MULTIPLY")
            height = b.math("ADD", height, b.math("MULTIPLY", dh, ds.get("height", 0.3)))
        return col, rmult, height, s
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
    tj = p.get("tile_jitter", 0.03)
    br.inputs["Color1"].default_value = (1.0 + tj, 1.0 + tj, 1.0 + tj, 1)
    br.inputs["Color2"].default_value = (1.0 - tj, 1.0 - tj, 1.0 - tj, 1)
    br.inputs["Mortar"].default_value = (p.get("joint_tone", 0.72),) * 3 + (1,)
    b.link(mp.outputs[0], br.inputs["Vector"])
    speck = around_one(b, noise(b, s.pos, 70.0 / t, 1.0, 0.5), p.get("fine", 0.04))
    mac = around_one(b, noise(b, s.pos, 0.5 / t, 2.0, 0.6), p.get("macro", 0.06))
    col = b.mix(b.mix(br.outputs["Color"], b.gray(speck), 1.0, "MULTIPLY"), b.gray(mac), 1.0, "MULTIPLY")
    joint = b.math("SUBTRACT", 1.0, br.outputs["Fac"])
    height = b.math("MULTIPLY", joint, 1.0)
    if p.get("detail_scan"):  # R1: a scan's luminance detail (scratches, wear, speckle) over the tiles, stochastic, tone-neutral
        ds = dict(p["detail_scan"], family="scan")
        dratio, _, dh, _ = fam_scan(b, ds, ctx, K, mat_name + "/detail")
        col = b.mix(col, dratio, 1.0, "MULTIPLY")
        height = b.math("ADD", height, b.math("MULTIPLY", dh, ds.get("height", 0.3)))
    return col, b.math("ADD", b.math("MULTIPLY", joint, p.get("joint_rough", 0.0)), 1.0), height, s


def _boards(b, p, ctx, K, mat_name, s, t):
    """R3: boards without the Brick texture. Blender's brick tint is a weak hash of (row, column): with a fixed row offset it lines up
    into diagonal staircases of darker boards (the R2 cabin ceiling). Here every row gets its own random butt-joint offset and every
    board its own white-noise value and a faint lengthwise grain. Returns (colour, roughness multiplier, height)."""
    ax = "xyz".index(p.get("board_axis", "x"))
    ra_name = p.get("row_axis", "y" if ax == 0 else "x")
    L = p["board_m"] * K
    sep = b.n("ShaderNodeSeparateXYZ")
    b.link(s.pos, sep.inputs[0])
    key = seeds.unit("%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), "boards") * 97.0
    if ra_name == "xy":  # P1: vertical boards on walls facing either axis (the row runs along x + y, as the wallpaper stripe)
        v = b.math("DIVIDE", b.math("ADD", sep.outputs[0], sep.outputs[1]), t)
    else:
        v = b.math("DIVIDE", sep.outputs["xyz".index(ra_name)], t)
    row = b.math("FLOOR", v)
    wr = b.n("ShaderNodeTexWhiteNoise", noise_dimensions="1D")
    b.link(b.math("ADD", row, key), wr.inputs["W"])
    u = b.math("ADD", b.math("DIVIDE", sep.outputs[ax], L), wr.outputs["Value"])  # a random butt-joint offset per row
    colm = b.math("FLOOR", u)
    cmb = b.n("ShaderNodeCombineXYZ")
    b.link(colm, cmb.inputs[0])
    b.link(row, cmb.inputs[1])
    cmb.inputs[2].default_value = key
    wb = b.n("ShaderNodeTexWhiteNoise", noise_dimensions="3D")
    b.link(cmb.outputs[0], wb.inputs["Vector"])
    tj = p.get("tile_jitter", 0.03)
    val = b.math("ADD", 1.0, b.math("MULTIPLY", b.math("SUBTRACT", wb.outputs["Value"], 0.5), 2.0 * tj))
    fu, fv = b.math("SUBTRACT", u, colm), b.math("SUBTRACT", v, row)
    dv = b.math("MULTIPLY", b.math("MINIMUM", fv, b.math("SUBTRACT", 1.0, fv)), t)
    du = b.math("MULTIPLY", b.math("MINIMUM", fu, b.math("SUBTRACT", 1.0, fu)), L)
    jw = p.get("joint", 0.012) * t
    fac = b.mapr(b.math("MINIMUM", du, dv), jw * 0.45, jw, 1.0, 0.0)  # 1 in the joint
    # lengthwise grain (brush or saw marks): noise stretched along the board, its phase shifted per board
    gm = b.n("ShaderNodeMapping", vector_type="POINT")
    gsc = [60.0 / t] * 3
    gsc[ax] = 1.5 / t
    gm.inputs["Scale"].default_value = tuple(gsc)
    add = b.n("ShaderNodeVectorMath", operation="ADD")
    b.link(s.pos, add.inputs[0])
    b.link(b.math("MULTIPLY", wb.outputs["Value"], 31.0 * t), add.inputs[1])
    b.link(add.outputs[0], gm.inputs["Vector"])
    grain = around_one(b, noise(b, gm.outputs[0], 1.0, 3.0, 0.6), p.get("grain", 0.03))
    speck = around_one(b, noise(b, s.pos, 70.0 / t, 1.0, 0.5), p.get("fine", 0.04))
    mac = around_one(b, noise(b, s.pos, 0.5 / t, 2.0, 0.6), p.get("macro", 0.06))
    face = b.math("MULTIPLY", b.math("MULTIPLY", b.math("MULTIPLY", val, grain), speck), mac)
    jt = p.get("joint_tone", 0.72)
    col = b.gray(b.math("ADD", b.math("MULTIPLY", face, b.math("SUBTRACT", 1.0, fac)), b.math("MULTIPLY", fac, jt)))
    height = b.math("ADD", b.math("SUBTRACT", 1.0, fac), b.math("MULTIPLY", grain, 0.3))
    rmult = b.math("ADD", b.math("MULTIPLY", b.math("SUBTRACT", 1.0, fac), p.get("joint_rough", 0.0)), 1.0)
    return col, rmult, height


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
    height = b.math("MULTIPLY", grain, 0.5)
    if p.get("seam_m"):  # R1: butt joints between paper strips, a little darker, slightly lifted
        sw = p["seam_m"] * K
        fr = b.math("FRACT", b.math("DIVIDE", ax, sw))
        e = b.math("MULTIPLY", b.math("MINIMUM", fr, b.math("SUBTRACT", 1.0, fr)), sw)
        seam = b.mapr(e, 0.0, 0.0025 * K, 0.0, 1.0)
        col = b.mix(col, b.gray(b.mapr(seam, 0.0, 1.0, p.get("seam_tone", 0.86), 1.0)), 1.0, "MULTIPLY")
        height = b.math("ADD", height, b.math("MULTIPLY", b.math("SUBTRACT", 1.0, seam), 0.6))
    if p.get("yellow"):  # R1: paper yellows toward the ceiling (smoke and age)
        y = p["yellow"]
        up = b.mapr(sep.outputs["Z"], (ctx["floor_z"] + y.get("from_m", 1.4)) * K, (ctx["floor_z"] + y.get("to_m", 2.6)) * K)
        col = b.mix(col, b.mix(col, tuple(y.get("tint", [1.0, 0.95, 0.82])), 1.0, "MULTIPLY"), up)
    return col, b.math("ADD", b.math("MULTIPLY", mott, 0.3), 0.7), height, s


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


def _warp(b, pos, scale, amp, detail=2.0):
    """pos + amp x (vector noise - 0.5): domain warp."""
    nz = b.n("ShaderNodeTexNoise", noise_dimensions="3D")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = detail
    b.link(pos, nz.inputs["Vector"])
    off = b.n("ShaderNodeVectorMath", operation="SUBTRACT")
    b.link(nz.outputs["Color"], off.inputs[0])
    off.inputs[1].default_value = (0.5, 0.5, 0.5)
    sc = b.n("ShaderNodeVectorMath", operation="SCALE")
    b.link(off.outputs[0], sc.inputs[0])
    sc.inputs["Scale"].default_value = amp
    add = b.n("ShaderNodeVectorMath", operation="ADD")
    b.link(pos, add.inputs[0])
    b.link(sc.outputs[0], add.inputs[1])
    return add.outputs[0]


def edge_mask(b, fade, floor=0.3):
    """R2: 1 inside a box piece's faces, falling to `floor` within `fade` (scene units) of the face's edges. Uses the undeformed box
    coordinate (Generated, 0..1 over the piece's box), the object-space normal (the axis a face looks along is ignored) and the piece's
    size from its object property `dress_dims` (set by dress.py on every displaced piece). Works in the displacement socket."""
    tc = b.n("ShaderNodeTexCoord")
    at = b.n("ShaderNodeAttribute")
    at.attribute_type = "OBJECT"
    at.attribute_name = "dress_dims"
    gs, ns, ds = b.n("ShaderNodeSeparateXYZ"), b.n("ShaderNodeSeparateXYZ"), b.n("ShaderNodeSeparateXYZ")
    b.link(tc.outputs["Generated"], gs.inputs[0])
    b.link(tc.outputs["Normal"], ns.inputs[0])
    b.link(at.outputs["Vector"], ds.inputs[0])
    # R3: the distance to the nearest edge is the second smallest of the three per-axis distances to the box's faces (the smallest is
    # the face the point lies on). R2 picked the face axis from the shading normal, which bends to 45 degrees in the smooth-shaded ring
    # along every edge: both axes dropped out there, the mask jumped back to 1 right at the edge and the displacement folded over
    # into black slits.
    es = []
    for ax in ("X", "Y", "Z"):
        g = gs.outputs[ax]
        es.append(b.math("MULTIPLY", b.math("MINIMUM", g, b.math("SUBTRACT", 1.0, g)), ds.outputs[ax]))
    mn = b.math("MINIMUM", b.math("MINIMUM", es[0], es[1]), es[2])
    mx = b.math("MAXIMUM", b.math("MAXIMUM", es[0], es[1]), es[2])
    d = b.math("SUBTRACT", b.math("SUBTRACT", b.math("ADD", b.math("ADD", es[0], es[1]), es[2]), mn), mx)
    return b.mapr(d, 0.0, fade, floor, 1.0)


def fam_membrane(b, p, ctx, K, mat_name):
    """R1 abstract wet membrane (heartstream marrow): layered procedural, no image, no periodicity.

    Position: per-object random offset (no two pieces share a phase), stretched along Z (`stretch`, fibres run down the walls), then
    domain-warped. Albedo: a two-octave fold field, vein lines at two scales (darker for `vein_dark` > 0, faintly brighter vessels
    for `vein_dark` < 0, with a colour shift `vein_tint` that stays small on the region mean), fine pores. Roughness is absolute (wet 0.25 to matte 0.65, driven by a separate
    noise and the veins); the coat, subsurface and displacement are set by dress_material from the config. Nothing wound-like."""
    skey = "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name)
    s = Sampler(b, 1.0 * K, skey, stochastic=False, obj_jitter=p.get("obj_jitter_m", 40.0) * K)
    st = p.get("stretch", 3.0)
    mp = b.n("ShaderNodeMapping", vector_type="POINT")
    mp.inputs["Scale"].default_value = (1.0 / K, 1.0 / K, 1.0 / (K * st))
    mp.inputs["Location"].default_value = (seeds.unit(skey, "x") * 50.0, seeds.unit(skey, "y") * 50.0, seeds.unit(skey, "z") * 50.0)
    b.link(s.pos, mp.inputs["Vector"])
    q = _warp(b, mp.outputs[0], 0.45, p.get("warp", 0.6) * 1.6)  # metres-scale coordinates from here on
    folds = noise(b, q, 0.55, 3.0, 0.55)
    folds2 = noise(b, q, 2.1, 2.0, 0.6)
    # veins: zero-crossing lines of warped noise (meandering, continuous, no cell network) at two scales
    qv = _warp(b, q, 1.7, 0.18)
    v1 = b.math("ABSOLUTE", b.math("SUBTRACT", noise(b, qv, 1.0 / p.get("vein_m", 0.35), 2.0, 0.5), 0.5))
    v2 = b.math("ABSOLUTE", b.math("SUBTRACT", noise(b, _warp(b, q, 6.0, 0.05), 1.0 / p.get("vein_fine_m", 0.08), 1.0, 0.5), 0.5))
    vein1 = b.mapr(v1, 0.0, p.get("vein_w", 0.035), 1.0, 0.0)
    vein2 = b.math("MULTIPLY", b.mapr(v2, 0.0, p.get("vein_w", 0.035) * 0.7, 1.0, 0.0), 0.5)
    vmask = b.mapr(noise(b, q, 0.8, 2.0), 0.35, 0.65, 0.35, 1.0)  # veins fade in and out
    vein = b.math("MULTIPLY", b.math("MAXIMUM", vein1, vein2), vmask)
    pores = around_one(b, noise(b, q, 38.0, 2.0, 0.6), p.get("fine", 0.05))
    val = b.math("MULTIPLY", b.math("MULTIPLY", around_one(b, folds, p.get("macro", 0.22)), around_one(b, folds2, p.get("macro", 0.22) * 0.5)), pores)
    val = b.math("MULTIPLY", val, b.math("SUBTRACT", 1.0, b.math("MULTIPLY", vein, p.get("vein_dark", 0.35))))
    vt = p.get("vein_tint", [1.06, 0.86, 0.98])
    tint = b.mix((1.0, 1.0, 1.0), tuple(vt), vein)
    col = b.mix(b.gray(val), tint, 1.0, "MULTIPLY")
    ov = p.get("overlay")
    ovl = None
    if ov:  # R1: a generated seamless image (dress.lock.json `generated`, not CC0) as a luminance detail overlay, stochastic, tone-neutral
        lk = lock(ctx["dress_dir"])["generated"][ov["image"]]
        path = os.path.join(cache_dir(ctx["dress_dir"]), "textures", ov["image"], lk["albedo_file"])
        so = Sampler(b, ov.get("tile_m", 1.2) * K, skey + "/overlay", stochastic=True, obj_jitter=37.0 * K, third=True)
        img = so.tex(_load(path))
        mean = lk["mean_albedo_linear"]
        ml = 0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2]
        ovl = b.lum(img)
        orat = b.mix(b.gray(b.math("DIVIDE", ovl, ml)), b.mix(img, tuple(mean), 1.0, "DIVIDE"), ov.get("chroma", 0.15))
        col = b.mix(col, b.mix(col, orat, 1.0, "MULTIPLY"), ov.get("strength", 0.5))
        ctx["record"]["textures"][ov["image"]] = {"file": lk["albedo_file"], "md5": lk["files"][lk["albedo_file"]]["md5"], "licence": lk["licence"],
                                                  "tile_m": ov.get("tile_m", 1.2), "generated": True}
    wet = noise(b, q, 0.9, 3.0, 0.6)
    r0, r1 = p.get("rough_range", [0.25, 0.65])
    rough = b.mapr(b.math("ADD", wet, b.math("MULTIPLY", vein, 0.25)), 0.35, 0.7, r0, r1)
    s.rough_abs = rough
    # fibres: fine striations along the (stretched) Z axis, only in the bump
    fmp = b.n("ShaderNodeMapping", vector_type="POINT")
    fmp.inputs["Scale"].default_value = (1.0, 1.0, 1.0 / p.get("fibre_stretch", 6.0))
    b.link(q, fmp.inputs["Vector"])
    fib = noise(b, fmp.outputs[0], 1.0 / p.get("fibre_m", 0.03), 2.0, 0.5)
    vsign = p.get("vein_relief", 0.25)  # > 0: veins stand proud of the surface (vessels under a membrane), < 0: grooves
    height = b.math("ADD", b.math("ADD", b.math("MULTIPLY", folds, 0.7), b.math("MULTIPLY", folds2, 0.3)), b.math("MULTIPLY", vein, vsign))
    height = b.math("ADD", height, b.math("MULTIPLY", fib, p.get("fibre", 0.12)))
    if ovl is not None:
        height = b.math("ADD", height, b.math("MULTIPLY", ovl, ov.get("height", 1.0)))
    ridges = noise(b, _warp(b, fmp.outputs[0], 0.7, 0.8), 1.0 / p.get("ridge_m", 0.6), 4.0, 0.65)  # warped, multi-octave: no regular stripe spacing
    rw = p.get("disp_ridge", 0.4)  # R2: less of the fine ridge noise in the true displacement (thin flakes on grazing silhouettes)
    s.disp_height = b.math("ADD", b.math("MULTIPLY", folds, 1.0 - rw), b.math("MULTIPLY", ridges, rw))
    return col, None, height, s


def fam_foliage(b, p, ctx, K, mat_name):
    """Conifer or leaf canopy seen from far: fine clumped light/dark variation around the blockout green."""
    s = Sampler(b, 1.0 * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False, obj_jitter=p.get("obj_jitter_m", 0.0) * K)
    t = p.get("tile_m", 3.0) * K
    clump = noise(b, s.pos, 1.6 / t, 3.0, 0.65)
    fine = noise(b, s.pos, 22.0 / t, 3.0, 0.7)
    val = b.math("MULTIPLY", around_one(b, clump, p.get("macro", 0.35)), around_one(b, fine, p.get("fine", 0.22)))
    height = b.math("MULTIPLY", fine, 1.0)
    tr = p.get("trunks")
    if tr:  # R1: a forest block seen from the road: dark vertical gaps between stems, warped so the spacing is not regular
        sp = tr.get("spacing_m", 1.6) * K
        mp = b.n("ShaderNodeMapping", vector_type="POINT")
        mp.inputs["Scale"].default_value = (1.0 / sp, 1.0 / sp, 0.06 / sp)  # stretched along Z: bands run up the block
        b.link(_warp(b, s.pos, 0.35 / sp, 0.5 * sp), mp.inputs["Vector"])
        band = b.mapr(noise(b, mp.outputs[0], 1.0, 3.0, 0.55), 0.5 - tr.get("width", 0.35) * 0.5, 0.5 + tr.get("width", 0.35) * 0.5)
        gap = b.math("MULTIPLY", band, tr.get("dark", 0.45))
        val = b.math("MULTIPLY", val, b.math("SUBTRACT", 1.0 + tr.get("dark", 0.45) * 0.5, gap))  # mean stays near 1
        height = b.math("SUBTRACT", height, band)
    us = p.get("underside")
    if us:  # R2: a tree that casts no shadow still darkens under its skirts (normal facing down) and brightens on top
        gn = b.n("ShaderNodeNewGeometry")
        ns = b.n("ShaderNodeSeparateXYZ")
        b.link(gn.outputs["Normal"], ns.inputs[0])
        val = b.math("MULTIPLY", val, b.mapr(ns.outputs["Z"], -0.7, 0.8, 1.0 - us, 1.0 + us * 0.35))
    col = b.gray(val)
    return col, b.math("ADD", b.math("MULTIPLY", fine, 0.2), 0.9), height, s


def fam_paper(b, p, ctx, K, mat_name):
    """P1: blank paper, parchment or vellum (no lettering): long fibres, a laid-line ripple, soft creases and sparse foxing spots.
    Foxing is a faint warm tint, never a stain in the red band."""
    s = Sampler(b, 1.0 * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False, obj_jitter=7.0 * K)
    t = p.get("tile_m", 0.3) * K
    fib = noise(b, _warp(b, s.pos, 3.0 / t, 0.05 * t), 90.0 / t, 3.0, 0.7)
    sep = b.n("ShaderNodeSeparateXYZ")
    b.link(s.pos, sep.inputs[0])
    laid = b.math("SINE", b.math("MULTIPLY", b.math("ADD", sep.outputs["X"], sep.outputs["Y"]), 2 * 3.14159265 / (0.0012 * K * p.get("laid_scale", 1.0))))
    crease_v = b.math("ABSOLUTE", b.math("SUBTRACT", noise(b, _warp(b, s.pos, 1.5 / t, 0.2 * t), 0.9 / t, 2.0, 0.5), 0.5))
    crease = b.mapr(crease_v, 0.0, 0.012, 1.0, 0.0)
    mott = around_one(b, noise(b, s.pos, 1.4 / t, 3.0, 0.6), p.get("macro", 0.06))
    val = b.math("MULTIPLY", b.math("MULTIPLY", around_one(b, fib, p.get("fine", 0.05)), mott),
                 b.math("ADD", 1.0, b.math("MULTIPLY", laid, p.get("laid", 0.008))))
    val = b.math("MULTIPLY", val, b.math("SUBTRACT", 1.0, b.math("MULTIPLY", crease, p.get("crease", 0.06))))
    col = b.gray(val)
    fx = p.get("foxing", 0.0)
    if fx > 0:
        vo = voronoi(b, jitter_pos(b, s.pos, 11.0 * K), 9.0 / t, "F1", "Distance")
        spot = b.math("MULTIPLY", b.mapr(vo, 0.0, 0.12, 1.0, 0.0), b.mapr(noise(b, s.pos, 2.0 / t, 2.0), 0.55, 0.7))
        col = b.mix(col, b.mix(col, (0.86, 0.78, 0.62), 1.0, "MULTIPLY"), b.math("MULTIPLY", spot, fx))
    height = b.math("ADD", b.math("MULTIPLY", fib, 0.4), b.math("MULTIPLY", crease, -0.8))
    return col, b.math("ADD", b.math("MULTIPLY", fib, 0.2), 0.9), height, s


def fam_leather(b, p, ctx, K, mat_name):
    """P1: leather (book covers, seats): a pebbled grain of small warped cells, soft creases, rubbed lighter patches."""
    s = Sampler(b, 1.0 * K, "%s/%s/%s" % (ctx["game"], ctx["location"], mat_name), stochastic=False, obj_jitter=5.0 * K)
    t = p.get("tile_m", 0.2) * K
    cells = voronoi(b, _warp(b, s.pos, 30.0 / t, 0.01 * t), 60.0 / t, "F1", "Distance")
    grain = b.mapr(cells, 0.0, 0.5, 0.0, 1.0)
    crease = b.mapr(b.math("ABSOLUTE", b.math("SUBTRACT", noise(b, _warp(b, s.pos, 2.0 / t, 0.15 * t), 1.6 / t, 3.0, 0.55), 0.5)), 0.0, 0.02, 1.0, 0.0)
    rub = around_one(b, noise(b, s.pos, 1.2 / t, 3.0, 0.6), p.get("macro", 0.12))
    val = b.math("MULTIPLY", b.math("MULTIPLY", around_one(b, grain, p.get("fine", 0.06)), rub),
                 b.math("SUBTRACT", 1.0, b.math("MULTIPLY", crease, 0.12)))
    height = b.math("SUBTRACT", grain, b.math("MULTIPLY", crease, 0.7))
    return b.gray(val), b.math("ADD", b.math("MULTIPLY", grain, 0.25), b.math("MULTIPLY", rub, 0.65)), height, s


FAMILIES = {"scan": fam_scan, "noise": fam_noise, "grid": fam_grid, "wallpaper": fam_wallpaper, "metal": fam_metal,
            "tissue": fam_tissue, "foliage": fam_foliage, "membrane": fam_membrane, "paper": fam_paper, "leather": fam_leather}


def p1_grime(b, p, ctx, K, pos, nrm, base, height, rough_add):
    """P1 grime set as shader masks (no decal quads, no z-fighting). Returns (base, height, rough_add, metal_mask).

    streaks  {amount, tint, scale_m, top_frac}: water stains, soot or rust runs hanging from the top of a vertical face
    cracks   {amount, scale_m, width, share, tint}: thin meandering hairline cracks in patches (dark, or light veins with tint > 1)
    rust     {amount, share, scale_m, tint, low_m}: rust on metal: blotches, more near the ground; lowers metallic, raises roughness
    """
    metal_mask = None
    gen = b.n("ShaderNodeTexCoord")
    gsep = b.n("ShaderNodeSeparateXYZ")
    b.link(gen.outputs["Generated"], gsep.inputs[0])
    nsep = b.n("ShaderNodeSeparateXYZ")
    b.link(nrm, nsep.inputs[0])
    vert = b.mapr(b.math("ABSOLUTE", nsep.outputs["Z"]), 0.35, 0.15)
    st = p.get("streaks")
    if st:
        sc = st.get("scale_m", 0.35) * K
        mp = b.n("ShaderNodeMapping", vector_type="POINT")
        mp.inputs["Scale"].default_value = (1.0 / sc, 1.0 / sc, 0.07 / sc)
        b.link(_warp(b, pos, 0.6 / sc, 0.15 * sc), mp.inputs["Vector"])
        runs = b.mapr(noise(b, mp.outputs[0], 1.0, 4.0, 0.6), 0.52, 0.72)
        top = b.mapr(gsep.outputs["Z"], 1.0 - st.get("top_frac", 0.7), 1.0, 0.0, 1.0)
        top = b.math("POWER", top, 0.7)
        brk = b.mapr(noise(b, pos, 0.9 / sc, 2.0), 0.35, 0.6)
        m = b.math("MULTIPLY", b.math("MULTIPLY", b.math("MULTIPLY", runs, top), b.math("MULTIPLY", vert, brk)), st.get("amount", 0.3))
        base = b.mix(base, b.mix(base, tuple(st.get("tint", [0.78, 0.74, 0.66])), 1.0, "MULTIPLY"), m)
        rough_add = b.math("MULTIPLY", m, 0.08) if rough_add is None else b.math("ADD", rough_add, b.math("MULTIPLY", m, 0.08))
    ck = p.get("cracks")
    if ck:
        sc = ck.get("scale_m", 0.6) * K
        q = _warp(b, pos, 1.3 / sc, 0.25 * sc)
        v = b.math("ABSOLUTE", b.math("SUBTRACT", noise(b, q, 1.0 / sc, 3.0, 0.55), 0.5))
        line = b.mapr(v, 0.0, ck.get("width", 0.008), 1.0, 0.0)
        share = ck.get("share", 0.35)
        patch = b.mapr(noise(b, pos, 0.25 / sc, 2.0), 1.0 - share, 1.0 - share + 0.12)
        m = b.math("MULTIPLY", b.math("MULTIPLY", line, patch), ck.get("amount", 0.5))
        base = b.mix(base, b.mix(base, tuple(ck.get("tint", [0.45, 0.43, 0.4])), 1.0, "MULTIPLY"), m)
        if height is not None:
            height = b.math("SUBTRACT", height, b.math("MULTIPLY", m, ck.get("depth", 1.2)))
    ru = p.get("rust")
    if ru:
        sc = ru.get("scale_m", 0.5) * K
        sh = ru.get("share", 0.3)
        blot = b.mapr(noise(b, _warp(b, pos, 1.0 / sc, 0.2 * sc), 1.0 / sc, 5.0, 0.68), 1.0 - sh, 1.0 - sh + 0.1)
        low = b.math("SUBTRACT", 1.0, b.mapr(gsep.outputs["Z"], 0.0, ru.get("low_frac", 0.35)))  # more rust toward the piece's bottom
        lowm = b.math("MULTIPLY", low, b.mapr(noise(b, pos, 3.0 / sc, 3.0), 0.5, 0.7))
        m = b.math("MULTIPLY", b.math("MINIMUM", b.math("ADD", blot, lowm), 1.0), ru.get("amount", 0.6))
        fine = around_one(b, noise(b, pos, 25.0 / sc, 3.0, 0.7), 0.25)
        rc = b.mix(b.gray(fine), tuple(ru.get("tint", [0.32, 0.17, 0.08])), 1.0, "MULTIPLY")
        base = b.mix(base, rc, m)
        rough_add = b.math("MULTIPLY", m, 0.35) if rough_add is None else b.math("ADD", rough_add, b.math("MULTIPLY", m, 0.35))
        if height is not None:
            height = b.math("ADD", height, b.math("MULTIPLY", b.math("MULTIPLY", m, fine), 0.6))
        metal_mask = m
    return base, height, rough_add, metal_mask


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
    if p.get("periodic"):  # a regular built pattern (brick bond, tiles): G8 treats it like a tile grid
        rec["periodic"] = True
    if p.get("g7_min"):  # P2b ruling: the detail-gain bar for clean painted, varnished, papered and fabric surfaces
        rec["g7_min"] = p["g7_min"]
    ctx["record"]["materials"][key] = rec
    if p.get("base_color"):  # R3: another albedo hue at the build colour's luminance (x base_lum); emission keeps the build colour
        bc = p["base_color"]
        l0 = 0.2126 * col0[0] + 0.7152 * col0[1] + 0.0722 * col0[2]
        lb = max(1e-5, 0.2126 * bc[0] + 0.7152 * bc[1] + 0.0722 * bc[2])
        k_ = l0 / lb * p.get("base_lum", 1.0)
        col0 = tuple(min(1.0, c * k_) for c in bc)
        rec["base_color"] = [round(c, 4) for c in col0]
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
        bs.inputs["Subsurface Radius"].default_value = tuple(p.get("sss_radius", (0.3, 0.1, 0.1)))
        if "sss_scale_m" in p and "Subsurface Scale" in bs.inputs:
            bs.inputs["Subsurface Scale"].default_value = p["sss_scale_m"] * K
    if p.get("coat"):  # a clear coat: wax on a floor, a wet film on a membrane
        bs.inputs["Coat Weight"].default_value = p["coat"]
        bs.inputs["Coat Roughness"].default_value = p.get("coat_roughness", 0.1)
        rec["coat"] = p["coat"]
    geo = b.n("ShaderNodeNewGeometry")
    pos, nrm = geo.outputs["Position"], geo.outputs["Normal"]
    if fam == "water":  # R1: still water (puddles): dark absorbing base, glassy top, a faint ripple normal; emission kept
        d = p.get("dark", 0.35)
        bs.inputs["Base Color"].default_value = (col0[0] * d, col0[1] * d, col0[2] * d, 1.0)
        bs.inputs["Roughness"].default_value = p.get("roughness", 0.03)
        bs.inputs["IOR"].default_value = 1.33
        if "Specular IOR Level" in bs.inputs:
            bs.inputs["Specular IOR Level"].default_value = p.get("specular", 0.7)
        bs.inputs[ek].default_value = (*ecol0, 1.0)
        bs.inputs["Emission Strength"].default_value = emit0
        bp = b.n("ShaderNodeBump")
        bp.inputs["Strength"].default_value = p.get("ripple", 0.08)
        bp.inputs["Distance"].default_value = 0.002 * K
        b.link(noise(b, pos, 9.0 / K, 2.0, 0.5), bp.inputs["Height"])
        b.link(bp.outputs["Normal"], bs.inputs["Normal"])
        rec["water"] = True
        return rec
    if dirt_only:  # glass, haze: keep colour and alpha, break up the roughness only
        bs.inputs["Base Color"].default_value = (*col0, 1.0)
        bs.inputs[ek].default_value = (*ecol0, 1.0)
        bs.inputs["Emission Strength"].default_value = emit0
        fr = p.get("frost")
        if fr:  # R2: wired, frosted safety glass: mottled frost, a fine square wire mesh, cloudy wipe marks; mean tone kept near 1
            mot = around_one(b, noise(b, pos, 1.0 / (fr.get("mottle_m", 0.35) * K), 4.0, 0.6), fr.get("mottle", 0.1))
            wipe = around_one(b, noise(b, _warp(b, pos, 0.8 / K, 0.3 * K), 2.2 / K, 3.0, 0.7), fr.get("wipe", 0.06))
            val = b.math("MULTIPLY", mot, wipe)
            if fr.get("wire_m"):
                tcn = b.n("ShaderNodeTexCoord")
                nsep, psep = b.n("ShaderNodeSeparateXYZ"), b.n("ShaderNodeSeparateXYZ")
                b.link(tcn.outputs["Normal"], nsep.inputs[0])
                b.link(pos, psep.inputs[0])
                w = None
                for ax in ("X", "Y", "Z"):
                    f = b.math("FRACT", b.math("DIVIDE", psep.outputs[ax], fr["wire_m"] * K))
                    ln = b.mapr(b.math("MINIMUM", f, b.math("SUBTRACT", 1.0, f)), 0.0, fr.get("wire_w", 0.06), 1.0, 0.0)
                    ln = b.math("MULTIPLY", ln, b.mapr(b.math("ABSOLUTE", nsep.outputs[ax]), 0.5, 0.9, 1.0, 0.0))
                    w = ln if w is None else b.math("MAXIMUM", w, ln)
                dark = fr.get("wire_dark", 0.35)
                val = b.math("MULTIPLY", val, b.math("ADD", b.math("SUBTRACT", 1.0, b.math("MULTIPLY", w, dark)), dark * fr.get("wire_share", 0.12)))
            b.link(b.mix(b.gray(val), col0, 1.0, "MULTIPLY", clamp=True), bs.inputs["Base Color"])
            if "Transmission Weight" in bs.inputs and fr.get("transmission"):
                bs.inputs["Transmission Weight"].default_value = fr["transmission"]
            rec["frost"] = fr
        n1 = noise(b, pos, 5.0 / K, 4.0, 0.6)
        n2 = noise(b, pos, 90.0 / K, 2.0, 0.6)
        r = b.math("ADD", b.math("MULTIPLY", n1, p.get("dirt", 0.22)), b.math("MULTIPLY", n2, 0.05))
        rb = fr.get("rough", rough0) if fr else rough0
        bs.inputs["Roughness"].default_value = rb
        b.link(b.math("ADD", r, rb * 0.8, clamp=True), bs.inputs["Roughness"])
        rec["dirt_only"] = True
        return rec
    ratio, rmult, height, s = FAMILIES[fam](b, p, ctx, K, key)
    # tone-lock: blockout colour x ratio
    base = b.mix(ratio, col0, 1.0, "MULTIPLY", clamp=True)
    sep = b.n("ShaderNodeSeparateXYZ")
    b.link(pos, sep.inputs[0])
    rough_add = None
    # R1 wear: paint patches, scuffs near the floor, worn edges (bevel-normal mask)
    if p.get("patches"):
        pc = p["patches"]
        vo = b.n("ShaderNodeTexVoronoi", feature="F1", voronoi_dimensions="3D")
        vo.inputs["Scale"].default_value = 1.0 / (pc.get("size_m", 0.9) * K)
        vo.inputs["Randomness"].default_value = 1.0
        b.link(jitter_pos(b, pos, 30.0 * K), vo.inputs["Vector"])
        cs = b.n("ShaderNodeSeparateColor")
        b.link(vo.outputs["Color"], cs.inputs[0])
        sh = pc.get("share", 0.3)
        on = b.mapr(cs.outputs[0], 1.0 - sh, 1.0 - sh + 0.01)
        shift = b.math("MULTIPLY", b.math("SUBTRACT", cs.outputs[1], 0.5), 2.0 * pc.get("amount", 0.05))
        base = b.mix(base, b.gray(b.math("ADD", 1.0, b.math("MULTIPLY", on, shift))), 1.0, "MULTIPLY")
        rough_add = b.math("MULTIPLY", on, b.math("MULTIPLY", cs.outputs[2], pc.get("rough", 0.08)))
    if p.get("scuffs"):
        sc_ = p["scuffs"]
        mp = b.n("ShaderNodeMapping", vector_type="POINT")
        mp.inputs["Scale"].default_value = (2.5 / K, 2.5 / K, 34.0 / K)  # streaks run along the wall
        b.link(pos, mp.inputs["Vector"])
        st = b.mapr(noise(b, mp.outputs[0], 1.0, 5.0, 0.62, 0.4), 0.58, 0.72)
        zf = b.math("SUBTRACT", 1.0, b.mapr(sep.outputs["Z"], ctx["floor_z"] * K, ctx["floor_z"] * K + sc_.get("height_m", 0.9) * K))
        m = b.math("MULTIPLY", b.math("MULTIPLY", st, b.math("POWER", zf, 1.5)), sc_.get("amount", 0.3))
        base = b.mix(base, b.mix(base, tuple(sc_.get("tint", [0.55, 0.52, 0.48])), 1.0, "MULTIPLY"), m)
        rough_add = m if rough_add is None else b.math("ADD", rough_add, m)
    bev = None
    if p.get("edge_wear") or p.get("round_m"):
        bev = b.n("ShaderNodeBevel", samples=6)
        bev.inputs["Radius"].default_value = (p.get("round_m") or p["edge_wear"].get("radius_m", 0.02)) * K
    if p.get("edge_wear"):
        ew = p["edge_wear"]
        dot = b.n("ShaderNodeVectorMath", operation="DOT_PRODUCT")
        b.link(bev.outputs["Normal"], dot.inputs[0])
        b.link(nrm, dot.inputs[1])
        edge = b.mapr(dot.outputs["Value"], 0.985, 0.8)
        brk = b.mapr(noise(b, pos, ew.get("break_scale", 7.0) / K, 4.0, 0.65), 0.38, 0.62)
        em = b.math("MULTIPLY", b.math("MULTIPLY", edge, brk), ew.get("amount", 0.6))
        base = b.mix(base, b.mix(base, tuple(ew.get("tint", [1.25, 1.22, 1.18])), 1.0, "MULTIPLY", clamp=True), em)
        er = b.math("MULTIPLY", em, ew.get("rough", 0.15))
        rough_add = er if rough_add is None else b.math("ADD", rough_add, er)
    if p.get("micro"):  # P1: fine surface relief (trowel stipple, brush and grain marks, weave slubs) at a few millimetres, where a
        # scan's own detail is too low-frequency to read at room distance; mean albedo kept (around 1)
        mc = p["micro"]
        ms = mc.get("scale_m", 0.012) * K
        mpos = pos
        if mc.get("stretch"):  # brush or grain marks: stretched along one axis
            mmap = b.n("ShaderNodeMapping", vector_type="POINT")
            st_ = mc["stretch"]
            mmap.inputs["Scale"].default_value = (1.0, 1.0, 1.0 / st_) if mc.get("axis", "z") == "z" else (1.0 / st_, 1.0, 1.0)
            b.link(pos, mmap.inputs["Vector"])
            mpos = mmap.outputs[0]
        mn = noise(b, mpos, 1.0 / ms, 4.0, 0.62, 0.2)
        mv = noise(b, mpos, 0.31 / ms, 2.0, 0.5)
        base = b.mix(base, b.gray(b.math("MULTIPLY", around_one(b, mn, mc.get("albedo", 0.05)), around_one(b, mv, mc.get("albedo", 0.05)))), 1.0, "MULTIPLY")
        if height is not None:
            height = b.math("ADD", height, b.math("MULTIPLY", b.math("ADD", mn, b.math("MULTIPLY", mv, 0.5)), mc.get("height", 0.6)))
        rec["micro"] = mc
    if p.get("streaks") or p.get("cracks") or p.get("rust"):  # P1 grime set (shader masks)
        base, height, rough_add, mm = p1_grime(b, p, ctx, K, pos, nrm, base, height, rough_add)
        if mm is not None and metal0 > 0:
            b.link(b.math("MULTIPLY", b.math("SUBTRACT", 1.0, mm), metal0), bs.inputs["Metallic"])
        rec["p1_grime"] = sorted(k for k in ("streaks", "cracks", "rust") if p.get(k))
    # grime: ambient-occlusion dirt, up-facing dust, dampness near the ground
    g = ctx["grime"]
    gs = p.get("grime", 1.0) * g.get("strength", 1.0)
    if gs > 0:
        ao = b.n("ShaderNodeAmbientOcclusion", samples=8, inside=False, only_local=False)
        ao.inputs["Distance"].default_value = g.get("ao_distance_m", 0.45) * K
        aom = b.math("SUBTRACT", 1.0, b.math("MULTIPLY", b.math("SUBTRACT", 1.0, ao.outputs["AO"]), g.get("ao", 0.30) * gs))
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
    if p.get("tint"):  # R1 per-material colour correction toward the build file's hue (a multiplier near 1 per channel)
        base = b.mix(base, tuple(p["tint"]), 1.0, "MULTIPLY", clamp=True)
    rec["gain"] = round(tg, 4)
    bs.inputs["Base Color"].default_value = (*col0, 1.0)
    b.link(base, bs.inputs["Base Color"])
    rtone = rough0
    if getattr(s, "rough_abs", None) is not None:
        r = s.rough_abs
    elif rmult is not None:
        r = b.math("MULTIPLY", rmult, rtone, clamp=True)
    else:
        r = b.math("MULTIPLY", b.math("ADD", 1.0, b.math("MULTIPLY", b.math("SUBTRACT", 1.0, b.lum(ratio)), 0.5)), rtone, clamp=True)
    if p.get("rough_scale"):
        r = b.math("MULTIPLY", r, p["rough_scale"])
    if rough_add is not None:
        r = b.math("ADD", r, rough_add)
    bs.inputs["Roughness"].default_value = rough0
    b.link(b.math("MAXIMUM", b.math("MINIMUM", r, 1.0), 0.04), bs.inputs["Roughness"])
    if p.get("bump", 0.35) > 0 and height is not None:
        bp = b.n("ShaderNodeBump")
        bp.inputs["Strength"].default_value = p.get("bump", 0.35)
        bp.inputs["Distance"].default_value = p.get("bump_m", 0.004) * K
        b.link(height, bp.inputs["Height"])
        if bev is not None and p.get("round_m"):  # the bevel normal under the bump: box edges catch light like rounded ones
            b.link(bev.outputs["Normal"], bp.inputs["Normal"])
        b.link(bp.outputs["Normal"], bs.inputs["Normal"])
    elif bev is not None and p.get("round_m"):
        b.link(bev.outputs["Normal"], bs.inputs["Normal"])
    if p.get("displace_m") and getattr(s, "disp_height", None) is not None:  # true displacement (dress.py subdivides the pieces)
        dn = b.n("ShaderNodeDisplacement")
        dn.inputs["Midlevel"].default_value = p.get("displace_mid", 0.5)  # 0: outward only (pieces only grow, so joints never open)
        dn.inputs["Scale"].default_value = p["displace_m"] * K
        dh = s.disp_height
        if p.get("edge_fade_m"):  # R2: displacement fades toward the piece's box edges, so a silhouette edge never shows stepped slabs
            em_ = edge_mask(b, p["edge_fade_m"] * K, p.get("edge_floor", 0.3))
            mid = p.get("edge_mid", 0.5)  # toward the field's middle, not to zero: no groove along the edge, the corner just flattens
            dh = b.math("ADD", mid, b.math("MULTIPLY", b.math("SUBTRACT", dh, mid), em_))
            rec["edge_fade_m"] = p["edge_fade_m"]
        b.link(dh, dn.inputs["Height"])
        b.link(dn.outputs["Displacement"], out.inputs["Displacement"])
        try:
            mat.displacement_method = "BOTH"
        except Exception:
            mat.cycles.displacement_method = "BOTH"
        rec["displace_m"] = p["displace_m"]
        rec["subdiv"] = p.get("subdiv", 6)
    if emit0 > 0:  # emission keeps colour and strength; the colour carries the detail ratio (mean 1)
        bs.inputs[ek].default_value = (*ecol0, 1.0)
        b.link(b.mix(ratio, ecol0, 1.0, "MULTIPLY"), bs.inputs[ek])
        bs.inputs["Emission Strength"].default_value = emit0
    return rec

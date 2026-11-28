"""P2b particle-like effects as kits (needs bpy): dust motes, rain streaks, falling snow and flame cards.

Every effect is one mesh of many small faces, grouped under `atmos/` (left out of the id pass, the ray grid and the dress counts,
like the sky and window plates) and visible to camera rays only: no shadow, no bounce, no reflection, so the scene's light is the
build file's (G1, G11). Motes, rain and snow are lit by the scene's own lights through their diffuse/glossy shading as seen by the
camera; flame cards glow (camera-only emission) and add no light. Positions come from the location seed; nothing within
`clear_m` of a camera, nothing inside a prop's box.
"""
import math
import random

import bmesh
import bpy
from mathutils import Matrix, Vector

from . import materials, seeds

HIDE = ("visible_shadow", "visible_diffuse", "visible_glossy", "visible_transmission", "visible_volume_scatter")


def _extent(ctx, interior_only_below_ceiling=True):
    K = ctx["K"]
    pcs = [o for o in ctx["pieces"] if not o.hide_render and o.get("role") not in ("sky",)]
    pts = [o.matrix_world @ Vector(c) for o in pcs for c in o.bound_box]
    lo = [min(p[i] for p in pts) for i in range(3)]
    hi = [max(p[i] for p in pts) for i in range(3)]
    ceil = [o for o in pcs if o.get("role") == "ceiling"]
    if ceil and interior_only_below_ceiling:
        hi[2] = min(min((o.matrix_world @ Vector(c)).z for c in o.bound_box) for o in ceil)
    lo[2] = ctx["floor_z"] * K
    return lo, hi


def _prop_boxes(ctx):
    out = []
    for _pr, o in ctx["made"]:
        if o.type not in ("MESH", "EMPTY"):
            continue
        objs = [o] + [c for c in o.children_recursive if c.type == "MESH"]
        pts = [x.matrix_world @ Vector(c) for x in objs if x.type == "MESH" for c in x.bound_box]
        if pts:
            out.append(([min(p[i] for p in pts) for i in range(3)], [max(p[i] for p in pts) for i in range(3)], o))
    return out


def _cam_only_material(name, base, rough=0.6, emit=None, alpha=1.0):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    b = materials.B(nt)
    out = b.n("ShaderNodeOutputMaterial")
    bs = b.n("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (*base, 1.0)
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Alpha"].default_value = alpha
    if emit is not None:
        ek = "Emission Color" if "Emission Color" in bs.inputs else "Emission"
        bs.inputs[ek].default_value = (*emit[0], 1.0)
        bs.inputs["Emission Strength"].default_value = emit[1]
    tr = b.n("ShaderNodeBsdfTransparent")
    lp = b.n("ShaderNodeLightPath")
    mx = b.n("ShaderNodeMixShader")
    b.link(lp.outputs["Is Camera Ray"], mx.inputs[0])
    b.link(tr.outputs["BSDF"], mx.inputs[1])
    b.link(bs.outputs["BSDF"], mx.inputs[2])
    b.link(mx.outputs["Shader"], out.inputs["Surface"])
    return mat


def _points(ctx, spec, lo, hi, n, rng, boxes, z_lo=None, z_hi=None):
    K = ctx["K"]
    cams = [Vector(v[0]) for v in ctx["views"].values()]
    clear = spec.get("clear_m", 0.8) * K
    out = []
    tries = 0
    zl = lo[2] if z_lo is None else z_lo
    zh = hi[2] if z_hi is None else z_hi
    while len(out) < n and tries < n * 20:
        tries += 1
        p = Vector((rng.uniform(lo[0], hi[0]), rng.uniform(lo[1], hi[1]), rng.uniform(zl, zh)))
        if any((p - c).length < clear for c in cams):
            continue
        mg = spec.get("prop_margin_m", 0.0) * K
        if any(b[0][0] - mg <= p.x <= b[1][0] + mg and b[0][1] - mg <= p.y <= b[1][1] + mg and b[0][2] - mg <= p.z <= b[1][2] + mg for b in boxes):
            continue
        out.append(p)
    return out


def _mesh_obj(col, name, bm, mat, group):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(mat)
    ob["dress_group"] = group
    for k in HIDE:
        setattr(ob, k, False)
    col.objects.link(ob)
    return ob


def motes(ctx, spec, col):
    """Dust motes: tiny lit specks floating in the room (interiors) or near the ground (outdoors)."""
    K = ctx["K"]
    rng = random.Random(seeds.unit("%s/%s/motes" % (ctx["game"], ctx["location"]), "m") * 1e9)
    lo, hi = _extent(ctx)
    hi2 = min(hi[2], lo[2] + spec.get("top_m", 3.0) * K)
    vol = max((hi[0] - lo[0]) * (hi[1] - lo[1]) * (hi2 - lo[2]) / K ** 3, 1e-3)
    n = int(min(spec.get("max", 1500), vol * spec.get("per_m3", 0.5)))
    pts = _points(ctx, spec, lo, hi, n, rng, _prop_boxes(ctx), lo[2] + 0.3 * K, hi2)
    bm = bmesh.new()
    r = spec.get("radius_m", 0.003) * K
    for p in pts:
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r * rng.uniform(0.6, 1.4), matrix=Matrix.Translation(p))
    mat = _cam_only_material("dress-motes", tuple(spec.get("color", [0.85, 0.82, 0.76])), 0.8)
    return [_mesh_obj(col, "dress-motes", bm, mat, "atmos/motes")] if pts else []


def precip(ctx, spec, col):
    """Rain streaks (thin tilted quads) or snowflakes (small flat flakes) through the location's volume, camera-only."""
    K = ctx["K"]
    kind = spec.get("kind", "rain")
    rng = random.Random(seeds.unit("%s/%s/%s" % (ctx["game"], ctx["location"], kind), "p") * 1e9)
    lo, hi = _extent(ctx, interior_only_below_ceiling=True)
    hi2 = lo[2] + spec.get("top_m", 8.0) * K
    # only where the cameras look: a box around every view's first 25 m, inside the extent
    pts = []
    vols = []
    for v in ctx["views"].values():
        c, t = Vector(v[0]), Vector(v[1])
        d = (t - c)
        d = d.normalized() * min(spec.get("depth_m", 25.0) * K, max(d.length * 1.5, 5.0 * K))
        a, b2 = c, c + d
        vl = [max(lo[i], min(a[i], b2[i]) - 4.0 * K) for i in range(2)] + [lo[2]]
        vh = [min(hi[i], max(a[i], b2[i]) + 4.0 * K) for i in range(2)] + [hi2]
        if vl[0] < vh[0] and vl[1] < vh[1]:
            vols.append((vl, vh))
    boxes = _prop_boxes(ctx)
    for vl, vh in vols:
        vol = (vh[0] - vl[0]) * (vh[1] - vl[1]) * (vh[2] - vl[2]) / K ** 3
        n = int(min(spec.get("max", 3000), vol * spec.get("per_m3", 0.4)))
        pts += _points(ctx, spec, vl, vh, n, rng, boxes)
    bm = bmesh.new()
    tilt = math.radians(spec.get("tilt_deg", 8.0))
    for p in pts:
        if kind == "rain":
            L, w = spec.get("length_m", 0.5) * K * rng.uniform(0.7, 1.3), spec.get("width_m", 0.004) * K
            ang = rng.uniform(0, math.pi)
            dx, dy = math.cos(ang) * w, math.sin(ang) * w
            sx = math.sin(tilt) * L
            vs = [bm.verts.new((p.x - dx, p.y - dy, p.z)), bm.verts.new((p.x + dx, p.y + dy, p.z)),
                  bm.verts.new((p.x + dx + sx, p.y + dy, p.z + L)), bm.verts.new((p.x - dx + sx, p.y - dy, p.z + L))]
        else:
            s = spec.get("flake_m", 0.008) * K * rng.uniform(0.6, 1.4)
            ang = rng.uniform(0, math.pi)
            ux, uy = math.cos(ang) * s, math.sin(ang) * s
            vs = [bm.verts.new((p.x - ux, p.y - uy, p.z - s * 0.3)), bm.verts.new((p.x + ux, p.y + uy, p.z - s * 0.3)),
                  bm.verts.new((p.x + ux * 0.6, p.y + uy * 0.6, p.z + s)), bm.verts.new((p.x - ux * 0.6, p.y - uy * 0.6, p.z + s))]
        bm.faces.new(vs)
    if kind == "rain":
        mat = _cam_only_material("dress-rain", (0.75, 0.78, 0.82), 0.15, alpha=spec.get("alpha", 0.35))
    else:
        mat = _cam_only_material("dress-snow", (0.92, 0.93, 0.95), 0.9, alpha=spec.get("alpha", 0.9))
    return [_mesh_obj(col, "dress-" + kind, bm, mat, "atmos/" + kind)] if pts else []


def flames(ctx, spec, col):
    """Flame cards on fire props (fire ring, campfire, brazier, hearth, torch, candle): two crossed quads with a soft flame-shaped
    glow seen by the camera only; they add no light (the build file's fire light stays the only light)."""
    import re
    K = ctx["K"]
    rx = re.compile(spec.get("match", r"fire|campfire|brazier|hearth|torch|candle"))
    out = []
    mat = bpy.data.materials.get("dress-flame")
    if mat is None:
        mat = bpy.data.materials.new("dress-flame")
        mat.use_nodes = True
        nt = mat.node_tree
        nt.nodes.clear()
        b = materials.B(nt)
        o_ = b.n("ShaderNodeOutputMaterial")
        tc = b.n("ShaderNodeTexCoord")
        sep = b.n("ShaderNodeSeparateXYZ")
        b.link(tc.outputs["UV"], sep.inputs[0])
        u = b.math("ABSOLUTE", b.math("SUBTRACT", sep.outputs["X"], 0.5))
        v = sep.outputs["Y"]
        width = b.math("MULTIPLY", b.math("SUBTRACT", 1.0, v), 0.5)  # narrows to the tip
        nz = materials.noise(b, tc.outputs["UV"], 6.0, 3.0, 0.6)
        shape = b.mapr(b.math("SUBTRACT", u, b.math("MULTIPLY", width, b.math("ADD", 0.7, b.math("MULTIPLY", nz, 0.6)))), 0.0, -0.08, 0.0, 1.0)
        shape = b.math("MULTIPLY", shape, b.mapr(v, 0.0, 0.08, 0.0, 1.0))
        col_ = b.mix((1.0, 0.45, 0.1), (1.0, 0.85, 0.45), b.mapr(v, 0.0, 0.6, 1.0, 0.0))
        em = b.n("ShaderNodeEmission")
        b.link(col_, em.inputs["Color"])
        em.inputs["Strength"].default_value = spec.get("strength", 6.0)
        tr = b.n("ShaderNodeBsdfTransparent")
        mx = b.n("ShaderNodeMixShader")
        lp = b.n("ShaderNodeLightPath")
        fac = b.math("MULTIPLY", shape, lp.outputs["Is Camera Ray"])
        b.link(fac, mx.inputs[0])
        b.link(tr.outputs["BSDF"], mx.inputs[1])
        b.link(em.outputs["Emission"], mx.inputs[2])
        b.link(mx.outputs["Shader"], o_.inputs["Surface"])
    cands = [(lo, hi, o) for lo, hi, o in _prop_boxes(ctx) if rx.search(o.name)]
    for o in ctx["pieces"]:  # a fire built as a blockout piece (fire-pit, hearth)
        mn = o.material_slots[0].material.name if o.material_slots and o.material_slots[0].material else ""
        if not o.hide_render and (rx.search(o.name) or rx.search(mn)):
            pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
            cands.append(([min(p[i] for p in pts) for i in range(3)], [max(p[i] for p in pts) for i in range(3)], o))
    for lo, hi, o in cands:
        cx, cy = (lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2
        w = min(hi[0] - lo[0], hi[1] - lo[1]) * spec.get("width_share", 0.3)
        h = w * spec.get("aspect", 1.3)
        z0 = lo[2] + (hi[2] - lo[2]) * spec.get("base_share", 1.0)  # on top of the pit: the card never covers its stones
        bm = bmesh.new()
        uvl = bm.loops.layers.uv.new("UVMap")
        for ang in (0.0, math.pi / 2):
            dx, dy = math.cos(ang) * w / 2, math.sin(ang) * w / 2
            vs = [bm.verts.new((cx - dx, cy - dy, z0)), bm.verts.new((cx + dx, cy + dy, z0)),
                  bm.verts.new((cx + dx, cy + dy, z0 + h)), bm.verts.new((cx - dx, cy - dy, z0 + h))]
            f = bm.faces.new(vs)
            for lp_, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                lp_[uvl].uv = uv
        out.append(_mesh_obj(col, "dress-flame-" + o.name, bm, mat, "atmos/flame"))
    return out


def crowns_round(ctx, spec, col):
    """P5 ruling: round (broadleaf) crowns. Every blockout piece whose material is listed (a sphere or ellipsoid crown) gets a branch
    structure of leaf clumps: 3 to 5 crooked limbs from the crown's base out to its shell, each carrying noise-swollen clumps, plus
    clumps over the shell, so the silhouette breaks up like a real crown. Clumps share the crown's own colour through the R3 foliage
    family; no shadow and no bounce (as the R3 trees), so the scene's light is unchanged."""
    from . import kits
    K = ctx["K"]
    out = []
    names = set(spec.get("materials", []))
    for o in sorted(ctx["pieces"], key=lambda x: x.name):
        if o.hide_render or not o.material_slots or not o.material_slots[0].material:
            continue
        mn = o.material_slots[0].material.name[3:].split("@")[0]
        if mn not in names:
            continue
        pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
        lo = [min(p[i] for p in pts) for i in range(3)]
        hi = [max(p[i] for p in pts) for i in range(3)]
        c = Vector(((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2))
        r = Vector(((hi[0] - lo[0]) / 2, (hi[1] - lo[1]) / 2, (hi[2] - lo[2]) / 2))
        if min(r) < 0.2 * K:
            continue
        rng = random.Random(seeds.unit("%s/%s/%s" % (ctx["game"], ctx["location"], o.name), "crown") * 1e9)
        col0 = tuple(o.material_slots[0].material.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value)[:3] \
            if o.material_slots[0].material.node_tree.nodes.get("Principled BSDF") else (0.25, 0.3, 0.15)
        mat = kits._kit_material(ctx, K, dict(spec, color=col0), "crown-" + mn)
        bm = bmesh.new()
        base = Vector((c.x, c.y, lo[2] + r.z * 0.2))
        n_limb = rng.randint(3, 5)
        cl_r = min(r) * spec.get("clump_share", 0.32)
        for li in range(n_limb):
            ang = li / n_limb * 2 * math.pi + rng.uniform(-0.4, 0.4)
            tip = c + Vector((math.cos(ang) * r.x * 0.75, math.sin(ang) * r.y * 0.75, rng.uniform(-0.1, 0.5) * r.z))
            for t in (0.45, 0.75, 1.0):
                p = base.lerp(tip, t) + Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-0.5, 1))) * cl_r * 0.4
                bmesh.ops.create_icosphere(bm, subdivisions=2, radius=cl_r * rng.uniform(0.7, 1.15) * (0.7 + 0.3 * t), matrix=Matrix.Translation(p))
        for _ in range(spec.get("shell_clumps", 14)):  # clumps over the shell break the round silhouette
            u, v = rng.uniform(0, 2 * math.pi), rng.uniform(-0.3, 1.0)
            d = Vector((math.cos(u) * math.sqrt(1 - v * v), math.sin(u) * math.sqrt(1 - v * v), v))
            p = c + Vector((d.x * r.x, d.y * r.y, d.z * r.z)) * rng.uniform(0.78, 0.95)
            bmesh.ops.create_icosphere(bm, subdivisions=2, radius=cl_r * rng.uniform(0.6, 1.0), matrix=Matrix.Translation(p))
        for v in bm.verts:  # swell each clump with noise so none is a clean sphere
            n = math.sin(v.co.x * 7.1 / K + rng.random()) * math.sin(v.co.y * 6.3 / K) * math.sin(v.co.z * 5.7 / K)
            v.co += (v.co - c).normalized() * n * cl_r * 0.25
        ob = _mesh_obj(col, "dress-crown-" + o.name, bm, mat, "kits/crowns_round")
        for k in ("visible_shadow", "visible_diffuse", "visible_glossy", "visible_transmission", "visible_volume_scatter"):
            setattr(ob, k, k == "visible_diffuse" and False)
        ob.visible_camera = True
        out.append(ob)
    return out

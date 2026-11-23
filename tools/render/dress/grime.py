"""Discrete grime decals (needs bpy): soft water stains and scuffs as thin planes 2 mm off a wall, with a procedural alpha mask.

Large-area grime (corner dirt, dust, dampness) is part of every surface material (materials.py); this module only adds the few
separate marks. Never on a prop's footprint, never within 0.3 m of a camera, never in the Man Eater red-brown band (the layer is
denied there altogether by rules.json). Count and strength come from the location config; positions from the location seed.
"""
import math

import bpy
from mathutils import Vector

from . import materials, seeds


def _bbox(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    return [min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts), max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)]


def _decal_material(name, tint, opacity):
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    b = materials.B(nt)
    out = b.n("ShaderNodeOutputMaterial")
    bs = b.n("ShaderNodeBsdfPrincipled")
    b.link(bs.outputs["BSDF"], out.inputs["Surface"])
    tc = b.n("ShaderNodeTexCoord")
    uv = tc.outputs["UV"]
    # radial falloff x two noises: an irregular soft blob
    sub = b.n("ShaderNodeVectorMath", operation="SUBTRACT")
    b.link(uv, sub.inputs[0])
    sub.inputs[1].default_value = (0.5, 0.5, 0.0)
    ln = b.n("ShaderNodeVectorMath", operation="LENGTH")
    b.link(sub.outputs[0], ln.inputs[0])
    rad = b.mapr(ln.outputs["Value"], 0.18, 0.5, 1.0, 0.0)
    n1 = materials.noise(b, uv, 4.0, 4.0, 0.6, 0.5)
    n2 = materials.noise(b, uv, 22.0, 3.0, 0.6)
    a = b.math("MULTIPLY", b.math("MULTIPLY", rad, b.mapr(n1, 0.3, 0.7)), b.mapr(n2, 0.25, 0.8, 0.55, 1.0))
    a = b.math("MULTIPLY", a, opacity, clamp=True)
    bs.inputs["Base Color"].default_value = (*tint, 1.0)
    bs.inputs["Roughness"].default_value = 0.9
    b.link(a, bs.inputs["Alpha"])
    return mat


def stains(ctx, spec, col):
    """spec: {count, size_m [lo, hi], tint [r, g, b], opacity, z_m [lo, hi], on_materials: [...] (blockout materials), name}."""
    K = ctx["K"]
    cams = [Vector(v[0]) for v in ctx["views"].values()]
    pbx = []
    for pr, o in ctx["made"]:
        pts = [o.matrix_world @ Vector(c) for c in o.bound_box] if o.type == "MESH" else []
        if pts:
            pbx.append((min(p.x for p in pts) - 0.4 * K, min(p.y for p in pts) - 0.4 * K, max(p.x for p in pts) + 0.4 * K, max(p.y for p in pts) + 0.4 * K))
    # full 3D boxes of the props (+10 cm): a decal quad is 2 mm off its wall, so a prop that touches the wall (binoculars on a sill) would be
    # covered by a quad whose centre is outside the prop's 0.4 m footprint
    p3 = []
    for pr, o in ctx["made"]:
        pts = [o.matrix_world @ Vector(c) for c in o.bound_box] if o.type == "MESH" else []
        if pts:
            p3.append(tuple(f(q[i] for q in pts) + (-0.1 * K if f is min else 0.1 * K) for f in (min, max) for i in (0, 1, 2)))
    walls = [o for o in sorted(ctx["pieces"], key=lambda o: o.name) if o.get("role") == "wall" and not o.hide_render
             and (not spec.get("on_materials") or (o.active_material and o.active_material.name[3:] in spec["on_materials"]))]
    if not walls:
        return []
    rng = seeds.rng(ctx["game"], ctx["location"], "decals", spec.get("name", "stains"))
    mat = _decal_material("dress-decal-" + spec.get("name", "stains"), spec.get("tint", [0.16, 0.13, 0.1]), spec.get("opacity", 0.33))
    room = None
    fl = [_bbox(o) for o in ctx["pieces"] if o.get("role") == "floor" and not o.hide_render]
    if fl:
        room = (sum((b[0] + b[3]) / 2 for b in fl) / len(fl), sum((b[1] + b[4]) / 2 for b in fl) / len(fl))
    out, tries = [], 0
    lo_s, hi_s = spec.get("size_m", [0.5, 1.2])
    zr = spec.get("z_m", [0.3, 2.3])
    while len(out) < spec.get("count", 6) and tries < 200:
        tries += 1
        w = walls[rng.randrange(len(walls))]
        b = _bbox(w)
        sx, sy, sz = b[3] - b[0], b[4] - b[1], b[5] - b[2]
        if sz < 0.8 * K or max(sx, sy) < 0.6 * K:
            continue
        size = (lo_s + rng.random() * (hi_s - lo_s)) * K
        z = min((zr[0] + rng.random() * (zr[1] - zr[0])) * K, b[5] - size * 0.3)
        if sx >= sy:
            x = b[0] + (0.1 + 0.8 * rng.random()) * sx
            low = room is None or room[1] < (b[1] + b[4]) / 2
            loc = (x, (b[1] - 0.002 * K) if low else (b[4] + 0.002 * K), z)
            rot = (math.pi / 2, 0, 0 if low else math.pi)
        else:
            y = b[1] + (0.1 + 0.8 * rng.random()) * sy
            low = room is None or room[0] < (b[0] + b[3]) / 2
            loc = ((b[0] - 0.002 * K) if low else (b[3] + 0.002 * K), y, z)
            rot = (math.pi / 2, 0, math.pi / 2 if low else -math.pi / 2)
        if any(a <= loc[0] <= c and bb <= loc[1] <= d for a, bb, c, d in pbx):
            continue
        hw, hz = size * 0.5, size * 1.3 * 0.5 + 0.05 * K
        along_x = sx >= sy
        dbox = (loc[0] - (hw if along_x else 0.02 * K), loc[1] - (0.02 * K if along_x else hw), loc[2] - hz,
                loc[0] + (hw if along_x else 0.02 * K), loc[1] + (0.02 * K if along_x else hw), loc[2] + hz)
        if any(all(dbox[i] <= pb[i + 3] and dbox[i + 3] >= pb[i] for i in range(3)) for pb in p3):
            continue
        if any((Vector(loc) - c).length < 0.3 * K + size for c in cams):
            continue
        bpy.ops.mesh.primitive_plane_add(size=1)
        ob = bpy.context.active_object
        ob.name = "dress-stain-%d" % len(out)
        ob.scale = (size, size * (0.7 + 0.6 * rng.random()), 1)
        ob.location = loc
        ob.rotation_euler = rot
        ob.data.materials.append(mat)
        ob["dress_group"] = "decals/" + spec.get("name", "stains")
        ob.visible_shadow = False
        for c in list(ob.users_collection):
            c.objects.unlink(ob)
        col.objects.link(ob)
        out.append(ob)
    return out


def decals_layer(ctx, specs):
    col = ctx["collection"]("DRESS/decals")
    rec = {"sets": {}, "objects": 0}
    for spec in specs:
        objs = stains(ctx, spec, col)
        rec["sets"][spec.get("name", "stains")] = {"objects": len(objs)}
        rec["objects"] += len(objs)
    return rec

"""Seeded scatter (needs bpy): pebbles, rubble, twigs, grass tufts, nodules, placed by placement.py.

Layout rules: positions come from the location's grid (so every scene of a location shares one layout), are culled to the scene's
own view cones (camera, player, overview) plus a margin, and never sit on a prop's footprint (plus margin), on a taller piece, in the
player-start disc, in the camera's foreground corridor, or within `near_camera_m` of a camera. Variants are shared meshes
(linked duplicates), so the unique triangle count stays small and the expanded count is the instance count x the variant size.
"""
import math
import random

import bmesh
import bpy
from mathutils import Vector

from . import materials, placement, seeds


# ---------------------------------------------------------------- variant meshes (unit size: about 1 m across before scale)
def _mesh_from(name, verts, faces):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    for p in me.polygons:
        p.use_smooth = True
    return me


def _lump(name, rng, rough=0.22, squash=0.55, subdiv=1):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv + 1, radius=0.5)
    for v in bm.verts:
        k = 1.0 + (rng.random() - 0.5) * 2 * rough
        v.co.x *= k * (0.9 + 0.3 * rng.random())
        v.co.y *= k * (0.9 + 0.3 * rng.random())
        v.co.z *= k * squash
    for v in bm.verts:  # flatten the underside so it sits on the ground
        v.co.z = max(v.co.z, -0.28 * squash)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return me


def _twig(name, rng):
    seg, sides = 4, 5
    verts, faces = [], []
    bend = Vector(((rng.random() - 0.5) * 0.25, (rng.random() - 0.5) * 0.25, 0))
    for i in range(seg + 1):
        t = i / seg
        r = 0.5 * (1.0 - 0.85 * t)  # unit: diameter 1 at the base; the object scale sets the real thickness
        cx, cy = bend.x * t * t, bend.y * t * t
        for j in range(sides):
            a = 2 * math.pi * j / sides
            verts.append((cx + r * math.cos(a) * 0.04, cy + r * math.sin(a) * 0.04, t))
    for i in range(seg):
        for j in range(sides):
            a, b = i * sides + j, i * sides + (j + 1) % sides
            faces.append((a, b, b + sides, a + sides))
    return _mesh_from(name, verts, faces)


def _tuft(name, rng, blades=9):
    verts, faces = [], []
    for b in range(blades):
        ang = rng.random() * 2 * math.pi
        lean = 0.12 + rng.random() * 0.35
        h = 0.55 + rng.random() * 0.45
        w = 0.022 + rng.random() * 0.012
        ox, oy = rng.random() * 0.08 - 0.04, rng.random() * 0.08 - 0.04
        dx, dy = math.cos(ang), math.sin(ang)
        px, py = -dy, dx
        base = len(verts)
        for i in range(4):
            t = i / 3.0
            ww = w * (1.0 - 0.9 * t * t)
            bx, by = ox + dx * lean * t * t * h, oy + dy * lean * t * t * h
            verts.append((bx - px * ww, by - py * ww, t * h))
            verts.append((bx + px * ww, by + py * ww, t * h))
        for i in range(3):
            a = base + i * 2
            faces.append((a, a + 1, a + 3, a + 2))
    return _mesh_from(name, verts, faces)


def _nodule(name, rng):
    return _lump(name, rng, rough=0.12, squash=0.8, subdiv=1)


KINDS = {  # kind -> (variant builder, variants, size range in metres, shadow cast)
    "pebbles": (lambda n, r: _lump(n, r, 0.25, 0.55), 4, (0.05, 0.22)),
    "rubble": (lambda n, r: _lump(n, r, 0.38, 0.62), 4, (0.12, 0.55)),
    "nodules": (_nodule, 3, (0.15, 0.6)),
    "twigs": (_twig, 4, (0.25, 0.9)),
    "grass": (_tuft, 3, (0.18, 0.45)),
}


def _material_for(ctx, kind, spec, K):
    """A scatter material: a Principled base with the blockout-style entry rebuilt through materials.dress_material."""
    name = "dress-scatter-%s" % spec.get("name", kind)
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bs = mat.node_tree.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = (*spec["color"], 1.0)
    bs.inputs["Roughness"].default_value = spec.get("roughness", 0.9)
    mat.diffuse_color = (*spec["color"], 1.0)
    fam = dict(spec.get("surface", {"family": "noise", "tile_m": 0.4}))
    fam.setdefault("grime", 0.5)
    fam.setdefault("bump", 0.0 if kind in ("grass", "twigs") else 0.25)
    materials.dress_material(mat, fam, ctx, K, name)
    if kind == "grass":
        mat.use_backface_culling = False
    return mat


def _bbox(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    return (min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts), max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts))


def scatter_layer(ctx, specs):
    """Run every scatter set of the location's config. Returns the layer record."""
    sc, K = ctx["sc"], ctx["K"]
    col = ctx["collection"]("DRESS/scatter")
    cones = [placement.view_cone(v[0], v[1], v[2]) for v in ctx["views"].values()]
    rec = {"sets": {}, "instances": 0, "triangles_unique": 0, "triangles_expanded": 0}
    prop_boxes = []
    for pr, o in ctx["made"]:
        meshes = [o] if o.type == "MESH" else [c for c in o.children_recursive if c.type == "MESH"]  # a model is a root empty with meshes below it
        if not meshes:
            continue
        bbs = [_bbox(c) for c in meshes]
        prop_boxes.append(([min(x[0] for x in bbs), min(x[1] for x in bbs), min(x[2] for x in bbs), max(x[3] for x in bbs), max(x[4] for x in bbs), max(x[5] for x in bbs)], pr))
    pbx = []
    for (b, pr) in prop_boxes:
        m = 0.30 * K
        pbx.append((b[0] - m, b[1] - m, b[3] + m, b[4] + m))
    cams = [v[0] for v in ctx["views"].values()]
    ps = ctx.get("player_start")
    for spec in specs:
        kind = spec["kind"]
        if kind not in KINDS:
            continue
        build, nvar, (smin, smax) = KINDS[kind]
        name = spec.get("name", kind)
        rng = seeds.rng(ctx["game"], ctx["location"], "scatter", name, "variants")
        meshes = [build("dress-%s-%d" % (name, i), rng) for i in range(nvar)]
        mat = _material_for(ctx, kind, spec, K)
        for me in meshes:
            me.materials.append(mat)
        tri = sum(len(m.polygons) for m in meshes)
        # surfaces
        want = spec.get("on", {})
        surfaces = []
        for ob in ctx["pieces"]:
            pid = ob.name[3:]
            mname = ob.active_material.name[3:] if ob.active_material else ""
            if pid in want.get("pieces", []) or mname in want.get("materials", []) or ob.get("role") in want.get("roles", []):
                if ob.hide_render:
                    continue
                surfaces.append(ob)
        out_cnt, srec = 0, []
        for sob in sorted(surfaces, key=lambda o: o.name):
            bb = _bbox(sob)
            z_top = bb[5]
            rect = (bb[0], bb[1], bb[3], bb[4])
            if rect[2] - rect[0] < 0.05 or rect[3] - rect[1] < 0.05:
                continue
            obst = list(pbx)
            for other in ctx["pieces"]:
                if other is sob or other.hide_render or other.get("role") == "sky":
                    continue
                if other in surfaces and other.get("role") in ("floor", "terrain"):
                    continue
                ob2 = _bbox(other)
                blocks = (ob2[5] - z_top > 0.03 * K or other.get("role") == "water") and ob2[2] < z_top + 1.0 * K
                if blocks:
                    obst.append((ob2[0] - 0.05 * K, ob2[1] - 0.05 * K, ob2[3] + 0.05 * K, ob2[4] + 0.05 * K))
            keep = []
            if ps:
                keep.append((ps[0], ps[1], 0.7 * K))
            for v in ctx["views"].values():
                keep.extend(placement.corridor_keepouts(v[0], v[1], radius=0.3 * K))
            for c in cams:
                keep.append((c[0], c[1], spec.get("near_camera_m", 0.9) * K))
            pts = placement.place("%s/%s/%s/%s" % (ctx["game"], ctx["location"], name, sob.name), rect, z_top, spec["density"] / (K * K),
                                  cones, spec.get("max_dist_m", 40.0) * K, obst, keep, limit=spec.get("limit", 6000), thin_far=spec.get("thin_far", 0.5))
            for i, p in enumerate(pts):
                v = min(int(p["v"] * nvar), nvar - 1)
                s = (smin + (smax - smin) * (p["s"] ** 2)) * K * spec.get("scale", 1.0)
                ob = bpy.data.objects.new("dress-%s-%d" % (name, out_cnt), meshes[v])
                ob.location = (p["x"], p["y"], p["z"] - 0.01 * K)
                ob.rotation_euler = (0, 0, p["r"] * 2 * math.pi)
                zs = s * (1.0 if kind in ("grass", "twigs") else 0.6 + 0.5 * p["s"])
                ob.scale = (s, s, zs) if kind != "twigs" else (s * 0.4, s * 0.4, s)
                if kind == "twigs":
                    ob.rotation_euler = (math.radians(86 + 8 * p["s"]), 0, p["r"] * 2 * math.pi)
                    ob.location.z = p["z"] + 0.012 * K
                ob["dress_group"] = "scatter/" + name
                col.objects.link(ob)
                out_cnt += 1
            srec.append({"surface": sob.name[3:], "instances": len(pts)})
        rec["sets"][name] = {"kind": kind, "instances": out_cnt, "variants": nvar, "tris_per_variant": tri // nvar, "surfaces": srec}
        rec["instances"] += out_cnt
        rec["triangles_unique"] += tri
        rec["triangles_expanded"] += out_cnt * (tri // nvar)
    return rec

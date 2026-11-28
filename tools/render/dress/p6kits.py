"""P6b kits (needs bpy): light-fitting bodies around the scene's own lights, and bookshelf bays with book blocks.

Fixture bodies are seen by camera rays only (no shadow, bounce or reflection), so the scene's light is the build file's. Shelves are
furniture: real geometry along the longest wall of a library or archive, clear of props, doors and cameras.
"""
import random

import bmesh
import bpy
from mathutils import Matrix, Vector

from . import kits, seeds
from .p2fx import _mesh_obj, _prop_boxes


def _box(bm, lo, hi):
    c = ((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2)
    m = Matrix.Translation(c) @ Matrix.Diagonal((hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2], 1.0))
    bmesh.ops.create_cube(bm, size=1.0, matrix=m)


def fixtures(ctx, spec, col):
    K = ctx["K"]
    ceil = [o for o in ctx["pieces"] if o.get("role") == "ceiling" and not o.hide_render]
    if not ceil:
        return []
    cz = min(min((o.matrix_world @ Vector(c)).z for c in o.bound_box) for o in ceil)
    mat = kits._kit_material(ctx, K, dict(spec, color=spec.get("color", [0.62, 0.62, 0.6])), "fixture")
    bm = bmesh.new()
    n = 0
    for L in sorted((o for o in bpy.data.objects if o.type == "LIGHT"), key=lambda o: o.name):
        p = L.matrix_world.translation
        if cz - p.z > spec.get("near_ceiling_m", 0.7) * K or p.z > cz:
            continue
        if L.data.type == "AREA":
            sx = L.data.size * L.scale.x
            sy = (L.data.size_y if L.data.shape in ("RECTANGLE", "ELLIPSE") else L.data.size) * L.scale.y
            if max(sx, sy) > spec.get("max_panel_m", 1.5) * K:  # a room-sized fill light is not a fitting: no tray over it
                continue
            lo = (p.x - sx / 2 - 0.03 * K, p.y - sy / 2 - 0.03 * K, p.z + 0.01 * K)
            hi = (p.x + sx / 2 + 0.03 * K, p.y + sy / 2 + 0.03 * K, min(cz, p.z + 0.07 * K))
            if hi[2] - lo[2] < 0.01 * K:
                continue
            _box(bm, lo, hi)
        else:
            r = spec.get("shade_r_m", 0.16) * K
            top = p.z + 0.05 * K
            bmesh.ops.create_cone(bm, cap_ends=False, segments=16, radius1=r, radius2=r * 0.35, depth=0.14 * K,
                                  matrix=Matrix.Translation((p.x, p.y, top + 0.02 * K)))
            if cz - top > 0.05 * K:
                bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.006 * K, radius2=0.006 * K, depth=cz - top,
                                      matrix=Matrix.Translation((p.x, p.y, (cz + top) / 2)))
        n += 1
    if not n:
        bm.free()
        return []
    return [_mesh_obj(col, "dress-fixtures", bm, mat, "kits/fixtures")]


def shelves(ctx, spec, col):
    K = ctx["K"]
    wall = next((o for o in ctx["pieces"] if o.name == "bo-" + spec["wall"]), None)
    if wall is None:
        return []
    pts = [wall.matrix_world @ Vector(c) for c in wall.bound_box]
    lo = [min(p[i] for p in pts) for i in range(3)]
    hi = [max(p[i] for p in pts) for i in range(3)]
    along_x = (hi[0] - lo[0]) >= (hi[1] - lo[1])
    rng = random.Random(seeds.unit("%s/%s/shelves" % (ctx["game"], ctx["location"]), "s") * 1e9)
    fz = ctx["floor_z"] * K
    depth = 0.34 * K
    H = min(spec.get("height_m", 2.1) * K, (hi[2] - fz) * 0.85)
    bayw = spec.get("bay_m", 0.95) * K
    cams = [Vector(v[0]) for v in ctx["views"].values()]
    mc = sum(cams, Vector()) / max(len(cams), 1)
    if along_x:
        inside = mc.y > (lo[1] + hi[1]) / 2
        face, a0, a1 = (hi[1] if inside else lo[1]), lo[0], hi[0]
    else:
        inside = mc.x > (lo[0] + hi[0]) / 2
        face, a0, a1 = (hi[0] if inside else lo[0]), lo[1], hi[1]
    sgn = 1 if inside else -1

    def world(u, d, z):
        return (u, face + sgn * d, z) if along_x else (face + sgn * d, u, z)

    def wbox(bm, a, b):
        _box(bm, [min(a[i], b[i]) for i in range(3)], [max(a[i], b[i]) for i in range(3)])

    boxes = _prop_boxes(ctx)
    frame = kits._kit_material(ctx, K, dict(spec, color=spec.get("frame_color", [0.24, 0.16, 0.1]),
                                            surface={"family": "grid", "tile_m": 0.14, "board_m": 2.4, "board_axis": "z", "row_axis": "xy",
                                                     "grain": 0.06, "bump": 0.3}), "shelf-frame")
    book = kits._kit_material(ctx, K, dict(spec, color=spec.get("book_color", [0.32, 0.2, 0.13]),
                                           surface={"family": "grid", "tile_m": 0.035, "board_m": 0.3, "board_axis": "z", "row_axis": "xy",
                                                    "joint": 0.08, "joint_tone": 0.45, "tile_jitter": 0.25, "bump": 0.4}), "books")
    bf, bb = bmesh.new(), bmesh.new()
    nb = 0
    u = a0 + 0.3 * K
    t = 0.025 * K
    while u + bayw < a1 - 0.3 * K and nb < spec.get("max_bays", 8):
        l, h = world(u, 0.0, fz), world(u + bayw, depth, fz + H)
        bl = [min(l[i], h[i]) for i in range(3)]
        bh = [max(l[i], h[i]) for i in range(3)]
        g = 0.25 * K
        clash = any(not (bh[0] + g < b[0][0] or bl[0] - g > b[1][0] or bh[1] + g < b[0][1] or bl[1] - g > b[1][1]) for b in boxes)
        clash = clash or any(bl[0] - 0.8 * K < c.x < bh[0] + 0.8 * K and bl[1] - 0.8 * K < c.y < bh[1] + 0.8 * K for c in cams)
        if not clash:
            for uu in (u, u + bayw - t):
                wbox(bf, world(uu, 0.0, fz), world(uu + t, depth, fz + H))
            ns = 5
            for k in range(ns + 1):
                z = fz + 0.08 * K + k * (H - 0.1 * K) / ns
                wbox(bf, world(u, 0.0, z), world(u + bayw, depth, z + t))
                if k == ns:
                    continue
                x = u + t
                while x < u + bayw - t - 0.05 * K:
                    w = rng.uniform(0.12, 0.42) * K
                    if rng.random() < 0.15:
                        x += w * 0.5
                        continue
                    hh = (H - 0.1 * K) / ns * rng.uniform(0.6, 0.85)
                    wbox(bb, world(x, 0.03 * K, z + t), world(min(x + w, u + bayw - t), depth - 0.04 * K, z + t + hh))
                    x += w + rng.uniform(0.0, 0.03) * K
            nb += 1
        u += bayw + 0.02 * K
    if not nb:
        bf.free()
        bb.free()
        return []
    out = [_mesh_obj(col, "dress-shelf-frames", bf, frame, "kits/shelves"), _mesh_obj(col, "dress-books", bb, book, "kits/shelves")]
    for o in out:  # furniture: casts shadow and takes light like a piece; only the props' own light is checked by G11
        o.visible_shadow = True
        o.visible_diffuse = True
        o.visible_glossy = True
    return out

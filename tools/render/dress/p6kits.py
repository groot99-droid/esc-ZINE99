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


def _piece_boxes(ctx, pids):
    out = []
    for o in sorted(ctx["pieces"], key=lambda x: x.name):
        if o.hide_render or o.name[3:] not in pids:
            continue
        pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
        out.append((o.name[3:], [min(p[i] for p in pts) for i in range(3)], [max(p[i] for p in pts) for i in range(3)]))
    return out


def sills(ctx, spec, col):
    """P6c: a window sill under every listed window piece (projecting `depth_m` into the room on both faces) and, for panes that do
    not emit light and are wider than `mullion_min_m`, one mullion and one transom bar. Lit panes get no bars: they stay uncovered."""
    K = ctx["K"]
    mat = kits._kit_material(ctx, K, spec, spec.get("name", "sills"))
    bm = bmesh.new()
    lit = set(spec.get("lit_pieces", []))
    n = 0
    for pid, lo, hi in _piece_boxes(ctx, set(spec.get("pieces", []))):
        size = [hi[i] - lo[i] for i in range(3)]
        ax = 0 if size[0] < size[1] else 1
        ln = 1 - ax
        d, t = spec.get("depth_m", 0.07) * K, spec.get("thick_m", 0.035) * K
        a, b = [0, 0, lo[2] - t - spec.get("drop_m", 0.07) * K], [0, 0, lo[2] - spec.get("drop_m", 0.07) * K]
        a[ax], b[ax] = lo[ax] - d, hi[ax] + d
        a[ln], b[ln] = lo[ln] - 0.09 * K, hi[ln] + 0.09 * K
        _box(bm, a, b)
        n += 1
        if pid not in lit and size[ln] >= spec.get("mullion_min_m", 1.0) * K:
            w = spec.get("bar_m", 0.035) * K
            mid = (lo[ln] + hi[ln]) / 2
            a, b = [0, 0, lo[2]], [0, 0, hi[2]]
            a[ax], b[ax] = lo[ax] - 0.01 * K, hi[ax] + 0.01 * K
            a[ln], b[ln] = mid - w / 2, mid + w / 2
            _box(bm, a, b)
            zt = lo[2] + size[2] * 0.62
            a, b = [0, 0, zt - w / 2], [0, 0, zt + w / 2]
            a[ax], b[ax] = lo[ax] - 0.01 * K, hi[ax] + 0.01 * K
            a[ln], b[ln] = lo[ln], hi[ln]
            _box(bm, a, b)
    if not n:
        bm.free()
        return []
    o = _mesh_obj(col, "dress-sills", bm, mat, "kits/" + spec.get("name", "sills"))
    o.visible_shadow = o.visible_diffuse = o.visible_glossy = True
    return [o]


def door_leaves(ctx, spec, col):
    """P6c: an open door leaf beside every listed door opening (a dark doorway with no leaf in the build): hinged at one jamb, swung
    90 degrees into the room on the side the views look from. Left out where it would come within `clear_m` of a camera or touch a
    prop; it never covers the opening itself."""
    K = ctx["K"]
    mat = kits._kit_material(ctx, K, spec, spec.get("name", "door_leaves"))
    cams = [Vector(v[0]) for v in ctx["views"].values()]
    mc = sum(cams, Vector()) / max(len(cams), 1)
    props = _prop_boxes(ctx)
    bm = bmesh.new()
    n = 0
    gaps = [(None, [x * K for x in g[0]], [x * K for x in g[1]]) for g in spec.get("gap_boxes", [])]  # openings under a `-head` piece
    for pid, lo, hi in _piece_boxes(ctx, set(spec.get("pieces", []))) + gaps:
        size = [hi[i] - lo[i] for i in range(3)]
        ax = 0 if size[0] < size[1] else 1
        ln = 1 - ax
        width, th = size[ln], spec.get("thick_m", 0.045) * K
        if width < 0.5 * K or size[2] < 1.6 * K:
            continue
        sgn = 1 if mc[ax] > (lo[ax] + hi[ax]) / 2 else -1
        face = hi[ax] if sgn > 0 else lo[ax]
        for hinge in (lo[ln], hi[ln]):
            a, b = [0, 0, lo[2] + 0.01 * K], [0, 0, lo[2] + min(size[2], 2.05 * K)]
            a[ax], b[ax] = (face, face + sgn * width) if sgn > 0 else (face + sgn * width, face)
            inner = hinge + (0.02 * K if hinge == lo[ln] else -0.02 * K)
            a[ln], b[ln] = (inner - th, inner) if hinge == lo[ln] else (inner, inner + th)
            bl = [min(a[i], b[i]) for i in range(3)]
            bh = [max(a[i], b[i]) for i in range(3)]
            g = spec.get("clear_m", 0.6) * K
            near = any(bl[0] - g < c.x < bh[0] + g and bl[1] - g < c.y < bh[1] + g for c in cams)
            hit = any(not (bh[0] < p[0][0] or bl[0] > p[1][0] or bh[1] < p[0][1] or bl[1] > p[1][1] or bh[2] < p[0][2] or bl[2] > p[1][2])
                      for p in props)
            if not near and not hit:
                _box(bm, bl, bh)
                n += 1
                break
    if not n:
        bm.free()
        return []
    o = _mesh_obj(col, "dress-door-leaves", bm, mat, "kits/" + spec.get("name", "door_leaves"))
    o.visible_shadow = o.visible_diffuse = o.visible_glossy = True
    return [o]

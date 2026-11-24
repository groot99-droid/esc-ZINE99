"""R2 procedural conifers (needs bpy): tiered, ragged branch skirts instead of a smooth cone, as dressing kits.

conifer_wrap: a tiered crown over each blockout crown piece (the smooth cone stays inside as the dark heart of the tree).
treeline: spruces along the faces of the big forest blocks, so a flat green wall gets trunks, skirts and a ragged skyline.
Trees are bodies only (no light); a tree near a hero prop can be told not to cast a shadow (G11).
"""
import math

import bmesh
import bpy
from mathutils import Vector

from . import seeds


def _bbox(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    return [min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts), max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)]


def _branch(bm, rng, z, r, droop, a, width):
    """R3: one feathered branch from the trunk out to radius r at angle a: a drooping strip of 5 segments whose edge zig-zags
    (needle sprays), turned a little about its own axis so neighbours catch the light differently."""
    ca, sa = math.cos(a), math.sin(a)
    px, py = -sa, ca
    roll = (rng.random() - 0.5) * 0.9
    seg = 5
    left, right = [], []
    for i in range(seg + 1):
        t = i / float(seg)
        rr = r * (0.06 + 0.94 * t)
        zz = z - droop * (t ** 1.6) + droop * 0.25 * max(0.0, t - 0.8) * 5.0 * 0.2
        w = width * (1.0 - 0.8 * t) * (1.0 if i % 2 == 1 else 0.55) * (0.8 + 0.4 * rng.random())
        cx, cy = rr * ca, rr * sa
        dzl, dzr = w * math.sin(roll), -w * math.sin(roll)
        left.append(bm.verts.new((cx + px * w * math.cos(roll), cy + py * w * math.cos(roll), zz + dzl)))
        right.append(bm.verts.new((cx - px * w * math.cos(roll), cy - py * w * math.cos(roll), zz + dzr)))
    for i in range(seg):
        bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))


def conifer_mesh(name, rng, trunk=True, crown_from=None, radius=0.16, tiers=None, style="fan"):
    """A unit-height spruce: a thin trunk and `tiers` drooping star-shaped branch skirts, each turned and sized at random, smaller toward
    the top. `radius` is the lowest skirt's radius as a share of the height. About 500 triangles."""
    bm = bmesh.new()
    if trunk:
        r0 = [bm.verts.new((0.012 * math.cos(i * math.pi / 3), 0.012 * math.sin(i * math.pi / 3), 0.0)) for i in range(6)]
        r1 = [bm.verts.new((0.004 * math.cos(i * math.pi / 3), 0.004 * math.sin(i * math.pi / 3), 0.97)) for i in range(6)]
        for i in range(6):
            bm.faces.new((r0[i], r0[(i + 1) % 6], r1[(i + 1) % 6], r1[i]))
    z0 = crown_from if crown_from is not None else 0.2 + rng.random() * 0.14
    n = tiers or rng.randint(12, 17)
    for t in range(n):
        f = t / float(n - 1)
        z = z0 + (0.985 - z0) * (f ** 0.92) + (rng.random() - 0.5) * 0.015
        r = radius * (1.0 - f) ** 0.85 * (0.8 + 0.4 * rng.random()) + 0.012
        m = rng.randint(7, 11)
        rot = rng.random() * 2 * math.pi
        droop = r * (0.45 + 0.35 * rng.random())
        if style == "branches":  # R3: many feathered branches instead of one star-shaped skirt (no flat paper triangles)
            nb = rng.randint(26, 36)
            for k in range(nb):
                a = rot + 2 * math.pi * k / nb + (rng.random() - 0.5) * 0.3
                rk = r * (0.75 + 0.45 * rng.random())
                _branch(bm, rng, z + (rng.random() - 0.5) * 0.02, rk, droop * (0.8 + 0.4 * rng.random()), a, 2 * math.pi * rk / nb * 0.32)
            continue
        c = bm.verts.new((0, 0, z + r * 0.18))
        ring = []
        for k in range(2 * m):
            a = rot + k * math.pi / m + (rng.random() - 0.5) * 0.25
            if k % 2 == 0:
                rr, dz = r * (0.8 + 0.35 * rng.random()), -droop * (0.85 + 0.3 * rng.random())
            else:
                rr, dz = r * (0.38 + 0.2 * rng.random()), -droop * 0.45
            ring.append(bm.verts.new((rr * math.cos(a), rr * math.sin(a), z + dz)))
        for k in range(2 * m):
            bm.faces.new((c, ring[k], ring[(k + 1) % (2 * m)]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return me


def foliage_mat(ctx, K, spec, key, kit_material):
    s = dict(spec)
    if "color" not in s:
        mr = ctx["record"]["materials"].get(spec.get("color_from", "conifer"), {})
        s["color"] = mr.get("blockout_color", [0.12, 0.2, 0.1])
    s.setdefault("surface", {"family": "foliage", "tile_m": 1.2, "macro": 0.45, "fine": 0.35, "bump": 0.6, "bump_m": 0.03, "obj_jitter_m": 40.0})
    s.setdefault("roughness", 0.85)
    s["grime"] = 0.0
    return kit_material(ctx, K, s, key)


def _no_shadow_near_heroes(ctx, ob, spec):
    rr = spec.get("no_shadow_near_props_m")
    if not rr:
        return
    K = ctx["K"]
    p = ob.matrix_world.translation
    for pr, o in ctx["made"]:
        if pr.get("role") != "hero":
            continue
        q = o.matrix_world.translation
        if math.hypot(p.x - q.x, p.y - q.y) < rr * K:
            ob.visible_shadow = False
            return


def conifer_wrap(ctx, spec, col, kit_material):
    K = ctx["K"]
    rng = seeds.rng(ctx["game"], ctx["location"], "kit", spec.get("name", "conifer_wrap"))
    mat = foliage_mat(ctx, K, spec, spec.get("name", "conifer_wrap"), kit_material)
    out = []
    want = set(spec.get("pieces", []))
    sub = spec.get("name_contains")
    for ob in sorted(ctx["pieces"], key=lambda o: o.name):
        pid = ob.name[3:]
        if ob.hide_render or not (pid in want or (sub and sub in pid)):
            continue
        b = _bbox(ob)
        h = (b[5] - b[2]) * spec.get("height_gain", 1.08)
        rad = max(b[3] - b[0], b[4] - b[1]) / 2 * spec.get("radius_gain", 1.3)
        me = conifer_mesh("dress-crown-%s" % pid, rng, trunk=False, crown_from=0.0, radius=rad / h, tiers=rng.randint(13, 18), style=spec.get("style", "fan"))
        me.materials.append(mat)
        o = bpy.data.objects.new("dress-crown-%s" % pid, me)
        o.location = ((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, b[2] + (b[5] - b[2]) * spec.get("lift", 0.06))
        o.scale = (h, h, h)
        o.rotation_euler = (0, 0, rng.random() * 2 * math.pi)
        o["dress_group"] = "kits/" + spec.get("name", "conifer_wrap")
        col.objects.link(o)
        _no_shadow_near_heroes(ctx, o, spec)
        if spec.get("hide_piece_from_camera"):  # the smooth cone keeps lighting the scene as built; the camera sees the tiers
            ob.visible_camera = False
        out.append(o)
    return out


def treeline(ctx, spec, col, kit_material):
    K = ctx["K"]
    rng = seeds.rng(ctx["game"], ctx["location"], "kit", spec.get("name", "treeline"))
    mat = foliage_mat(ctx, K, spec, spec.get("name", "treeline"), kit_material)
    variants = []
    for i in range(spec.get("variants", 6)):
        me = conifer_mesh("dress-spruce-%d" % i, rng, radius=spec.get("radius", 0.15), style=spec.get("style", "fan"))
        me.materials.append(mat)
        variants.append(me)
    mats = set(spec.get("materials", ["conifer"]))
    cams = [Vector(v[0]) for v in ctx["views"].values()]
    maxd = spec.get("max_dist_m", 140.0) * K
    sp = spec.get("spacing_m", 4.0) * K
    rows = spec.get("rows") or [{"offset_m": spec.get("offset_m", [-1.2, 1.0]), "height": spec.get("height", [0.8, 1.45]), "spacing_m": spec.get("spacing_m", 4.0)}]
    avoid = [_bbox(o) for o in ctx["pieces"] if not o.hide_render and o.active_material
             and o.active_material.name[3:].split("@")[0] in set(spec.get("avoid_materials", []))]
    am = spec.get("avoid_margin_m", 0.5) * K
    out = []
    for ob in sorted(ctx["pieces"], key=lambda o: o.name):
        if ob.hide_render or not ob.active_material or ob.active_material.name[3:].split("@")[0] not in mats:
            continue
        b = _bbox(ob)
        if min(b[3] - b[0], b[4] - b[1]) < spec.get("min_size_m", 8.0) * K:
            continue
        H = b[5] - b[2]
        faces = [((b[0], b[1]), (b[3], b[1]), (0, -1)), ((b[0], b[4]), (b[3], b[4]), (0, 1)),
                 ((b[0], b[1]), (b[0], b[4]), (-1, 0)), ((b[3], b[1]), (b[3], b[4]), (1, 0))]
        for (a, e, nrm), row in [(f_, r_) for f_ in faces for r_ in rows]:
            off, hr = row["offset_m"], row["height"]
            L = math.hypot(e[0] - a[0], e[1] - a[1])
            n = max(1, int(L / (row.get("spacing_m", spec.get("spacing_m", 4.0)) * K)))
            for i in range(n):
                t = (i + 0.5 + (rng.random() - 0.5) * 0.9) / n
                o_ = off[0] + (off[1] - off[0]) * rng.random()
                hu, sx, sy, rz, vi = rng.random(), rng.random(), rng.random(), rng.random(), rng.random()
                x = a[0] + (e[0] - a[0]) * t + nrm[0] * o_ * K
                y = a[1] + (e[1] - a[1]) * t + nrm[1] * o_ * K
                vis = any(math.hypot(x - c.x, y - c.y) < maxd and ((x - c.x) * nrm[0] + (y - c.y) * nrm[1]) < 0 for c in cams)
                if not vis:
                    continue
                if any(bb[0] - am <= x <= bb[3] + am and bb[1] - am <= y <= bb[4] + am for bb in avoid):
                    continue
                h = H * (hr[0] + (hr[1] - hr[0]) * hu ** 1.3)
                # R3: no tree (crown included) within 1 m of a camera (G10c)
                if any(math.hypot(x - c.x, y - c.y) < h * spec.get("radius", 0.15) * 1.4 + 1.0 * K for c in cams):
                    continue
                o = bpy.data.objects.new("dress-spruce-%s-%d" % (ob.name[3:], len(out)), variants[int(vi * len(variants)) % len(variants)])
                o.location = (x, y, b[2] - 0.05 * K)
                o.scale = (h * (0.85 + 0.3 * sx), h * (0.85 + 0.3 * sy), h)
                o.rotation_euler = (0, 0, rz * 2 * math.pi)
                o["dress_group"] = "kits/" + spec.get("name", "treeline")
                col.objects.link(o)
                _no_shadow_near_heroes(ctx, o, spec)
                out.append(o)
    return out

"""R3 swollen fillets (needs bpy): organic walls meet the floor in a soft bulge instead of a CG box corner (heartstream marrow).

Kit `swell`: a noise-swollen, round-capped tube of the wall's own (dressed) material along every bottom edge (and, with `top`, the
top edge) of each piece of the named materials and roles. Only a quarter of the tube shows (the rest is inside the wall and the
floor), so it reads as a quarter-round swelling. Lengths within `prop_margin_m` of a prop or `camera_clear_m` of a camera are cut out.
"""
import math

import bmesh
import bpy
from mathutils import Vector
from mathutils import noise as mnoise

from . import seeds


def _bbox(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    return [min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts), max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)]


def tube_mesh(name, a, b, r0, rng, noise_amp=0.22, seg=0.1, ring=18, cap=True):
    """A tube from a to b (scene units) of radius r0 swollen by 3D noise, with rounded caps reaching r0 past both ends."""
    a, b = Vector(a), Vector(b)
    d = b - a
    L = d.length
    if L < 1e-6 or r0 <= 0:
        return None
    dz = d.normalized()
    up = Vector((0, 0, 1)) if abs(dz.z) < 0.9 else Vector((1, 0, 0))
    ex = dz.cross(up).normalized()
    ey = dz.cross(ex).normalized()
    ext = r0 if cap else 0.0
    n = max(2, int((L + 2 * ext) / seg))
    off = Vector((rng.random() * 100.0, rng.random() * 100.0, rng.random() * 100.0))
    bm = bmesh.new()
    rings = []
    for i in range(n + 1):
        s = -ext + (L + 2 * ext) * i / n
        if s < 0 and ext > 0:
            k = math.sqrt(max(0.0, 1.0 - (s / ext) ** 2))
        elif s > L and ext > 0:
            k = math.sqrt(max(0.0, 1.0 - ((s - L) / ext) ** 2))
        else:
            k = 1.0
        c = a + dz * s
        along = 1.0 + 0.6 * noise_amp * mnoise.noise(Vector((s / r0 * 0.35, off.y, off.z)))
        rr = []
        for j in range(ring):
            th = 2 * math.pi * j / ring
            dirv = ex * math.cos(th) + ey * math.sin(th)
            q = (c + dirv * r0) / r0 * 0.9 + off
            sw = (1.0 + noise_amp * mnoise.noise(q) + 0.5 * noise_amp * mnoise.noise(q * 2.7 + off)) * along
            rr.append(bm.verts.new(c + dirv * (r0 * max(0.04, k) * sw)))
        rings.append(rr)
    for i in range(n):
        for j in range(ring):
            bm.faces.new((rings[i][j], rings[i][(j + 1) % ring], rings[i + 1][(j + 1) % ring], rings[i + 1][j]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return me


def runs_clear(p0, p1, z, blocked, step):
    """Split the edge p0-p1 (xy) into runs (t0, t1) whose sample points are not blocked(x, y, z)."""
    L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
    n = max(1, int(L / step))
    runs, cur = [], None
    for i in range(n + 1):
        t = i / n
        x, y = p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t
        if not blocked(x, y, z):
            cur = (cur[0], t) if cur else (t, t)
        elif cur:
            runs.append(cur)
            cur = None
    if cur:
        runs.append(cur)
    return runs


def swell(ctx, spec, col):
    K = ctx["K"]
    mats = set(spec.get("materials", []))
    roles = set(spec.get("roles", ["wall", "structure"]))
    rng = seeds.rng(ctx["game"], ctx["location"], "kit", spec.get("name", "swell"))
    rlo, rhi = spec.get("radius_m", [0.25, 0.45])
    pm = spec.get("prop_margin_m", 0.5) * K
    fz = ctx["floor_z"] * K
    pboxes = []
    for pr, o in ctx["made"]:
        ms = [o] if o.type == "MESH" else [c for c in o.children_recursive if c.type == "MESH"]
        for m_ in ms:
            bb = _bbox(m_)
            pboxes.append((bb[0] - pm, bb[1] - pm, bb[3] + pm, bb[4] + pm))
    cams = [Vector(v[0]) for v in ctx["views"].values()]
    cc = spec.get("camera_clear_m", 1.2) * K

    def blocked(x, y, z):
        if any(bx[0] <= x <= bx[2] and bx[1] <= y <= bx[3] for bx in pboxes):
            return True
        return any(math.hypot(x - c.x, y - c.y) < cc and abs(z - c.z) < 2.5 * K for c in cams)

    out = []
    for ob in sorted(ctx["pieces"], key=lambda o: o.name):
        if ob.hide_render or not ob.active_material:
            continue
        mname = ob.active_material.name[3:].split("@")[0]
        if mname not in mats or ob.get("role") not in roles:
            continue
        b = _bbox(ob)
        levels = []
        if abs(b[2] - fz) < 0.1 * K:
            levels.append(b[2])
        if spec.get("top"):
            levels.append(b[5])
        for z in levels:
            edges = [((b[0], b[1]), (b[3], b[1])), ((b[0], b[4]), (b[3], b[4])), ((b[0], b[1]), (b[0], b[4])), ((b[3], b[1]), (b[3], b[4]))]
            for (p0, p1) in edges:
                L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
                if L < 0.3 * K:
                    continue
                for (t0, t1) in runs_clear(p0, p1, z, blocked, 0.1 * K):
                    if (t1 - t0) * L < 0.4 * K:
                        continue
                    r = (rlo + (rhi - rlo) * rng.random()) * K
                    a = (p0[0] + (p1[0] - p0[0]) * t0, p0[1] + (p1[1] - p0[1]) * t0, z)
                    e = (p0[0] + (p1[0] - p0[0]) * t1, p0[1] + (p1[1] - p0[1]) * t1, z)
                    me = tube_mesh("dress-swell-%s-%d" % (ob.name[3:], len(out)), a, e, r, rng, spec.get("noise", 0.22), spec.get("segment_m", 0.12) * K)
                    if me is None:
                        continue
                    me.materials.append(ob.active_material)
                    o2 = bpy.data.objects.new(me.name, me)
                    o2["dress_group"] = "kits/" + spec.get("name", "swell")
                    col.objects.link(o2)
                    out.append(o2)
    return out

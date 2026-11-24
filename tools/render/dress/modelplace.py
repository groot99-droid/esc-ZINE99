"""Placement maths for the `props` layer (whole models put into a scene at render time). Pure Python, no Blender.

A `props` entry in a location config names one model file and lists where its copies go:

    {"model": "wooden-chair", "glb": "man-eater/wooden-chair.glb", "md5": "...",
     "scenes": ["d1_rec_room"],                      # optional: only these scenes of the location
     "hide_pieces": ["chair-1", ...],                # blockout pieces this model replaces (hidden in the render only)
     "hide_props": [],                               # props this model replaces (hidden in the render only)
     "scale": 0.92 | [sx, sy, sz],                   # or "dims_m": [w, d, h] (null keeps that axis uniform with the others)
     "rot_deg": [rx, ry, rz],                        # Euler XYZ like Blender, applied after the scale
     "items": [{"at": [x, y, z], "yaw_deg": 30}, ...] | "ring": {...} | "row": {...}}

`at` is the bottom centre of a copy's world box (its lowest point rests on z). Scale is applied in the model's own frame
(before any rotation), so a non-uniform scale squashes the model along its own axes. Sizes are metres (scenes built in
millimetres multiply by K in the bpy layer).
"""
import math


def axis_scale(model_dims, spec):
    """Per-axis scale (model frame) for a spec or item: `scale` (number or 3 numbers), else `dims_m` (target size per axis;
    a null axis takes the mean scale of the given ones), else `height_m` (uniform), else 1."""
    if spec.get("scale") is not None:
        s = spec["scale"]
        return [float(s)] * 3 if isinstance(s, (int, float)) else [float(x) for x in s]
    if spec.get("dims_m") is not None:
        d = spec["dims_m"]
        given = [d[i] / max(model_dims[i], 1e-9) for i in range(3) if d[i] is not None]
        if not given:
            return [1.0, 1.0, 1.0]
        m = math.exp(sum(math.log(g) for g in given) / len(given))
        return [d[i] / max(model_dims[i], 1e-9) if d[i] is not None else m for i in range(3)]
    if spec.get("height_m") is not None:
        k = spec["height_m"] / max(model_dims[2], 1e-9)
        return [k, k, k]
    return [1.0, 1.0, 1.0]


def euler_matrix(rot_deg):
    """3x3 rotation of Blender's Euler XYZ (R = Rz @ Ry @ Rx) as nested lists."""
    rx, ry, rz = (math.radians(a) for a in rot_deg)
    cx, sx, cy, sy, cz, sz = math.cos(rx), math.sin(rx), math.cos(ry), math.sin(ry), math.cos(rz), math.sin(rz)
    return [[cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
            [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
            [-sy, cy * sx, cy * cx]]


def _mul(m, v):
    return [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
            m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]]


def rotation_of(spec, item):
    """Total Euler rotation of a copy: the spec's `rot_deg` with the item's `yaw_deg` added about Z."""
    r = list(item.get("rot_deg", spec.get("rot_deg", [0.0, 0.0, 0.0])))
    r[2] = r[2] + float(item.get("yaw_deg", 0.0))
    return r


def world_box(model_lo, model_hi, scale, rot_deg, at):
    """Axis-aligned world box (lo, hi) of a scaled, rotated copy whose box bottom centre sits at `at`, and the offset that
    moves the scaled-rotated model there (location of the copy's root, the model's own origin mapped)."""
    R = euler_matrix(rot_deg)
    pts = []
    for x in (model_lo[0], model_hi[0]):
        for y in (model_lo[1], model_hi[1]):
            for z in (model_lo[2], model_hi[2]):
                pts.append(_mul(R, [x * scale[0], y * scale[1], z * scale[2]]))
    lo = [min(p[i] for p in pts) for i in range(3)]
    hi = [max(p[i] for p in pts) for i in range(3)]
    off = [at[0] - (lo[0] + hi[0]) / 2, at[1] - (lo[1] + hi[1]) / 2, at[2] - lo[2]]
    return [lo[i] + off[i] for i in range(3)], [hi[i] + off[i] for i in range(3)], off


def expand_items(spec):
    """The copies of a spec: explicit `items`, a `ring` around a centre ({center, radius, n, start_deg, step_deg, face:
    "in"|"out", yaw_offset_deg, z}) or a `row` ({start, step, n, yaw_deg}). Ring yaw makes the model's -Y front face the
    centre ("in") or away from it; a yaw_offset_deg turns every copy further."""
    out = [dict(it) for it in spec.get("items", [])]
    rg = spec.get("ring")
    if rg:
        cx, cy = rg["center"][:2]
        z = rg.get("z", rg["center"][2] if len(rg["center"]) > 2 else 0.0)
        n = int(rg["n"])
        step = rg.get("step_deg", 360.0 / n)
        for i in range(n):
            a = math.radians(rg.get("start_deg", 0.0) + i * step)
            x, y = cx + rg["radius"] * math.cos(a), cy + rg["radius"] * math.sin(a)
            # the model's front is -Y: yaw t turns -Y into (sin t, -cos t); facing the centre needs that = (-cos a, -sin a)
            yaw = math.degrees(a) - 90.0 if rg.get("face", "in") == "in" else math.degrees(a) + 90.0
            out.append({"at": [x, y, z], "yaw_deg": yaw + rg.get("yaw_offset_deg", 0.0)})
    rw = spec.get("row")
    if rw:
        for i in range(int(rw["n"])):
            out.append({"at": [rw["start"][k] + i * rw["step"][k] for k in range(3)], "yaw_deg": rw.get("yaw_deg", 0.0)})
    return out


def front_dir(rot_deg):
    """World direction the model's -Y front faces after a rotation."""
    return _mul(euler_matrix(rot_deg), [0.0, -1.0, 0.0])


def seg_box(p0, p1, lo, hi):
    """True when the segment p0-p1 passes through the box (slab method)."""
    t0, t1 = 0.0, 1.0
    for i in range(3):
        d = p1[i] - p0[i]
        if abs(d) < 1e-12:
            if p0[i] < lo[i] or p0[i] > hi[i]:
                return False
            continue
        a, b = (lo[i] - p0[i]) / d, (hi[i] - p0[i]) / d
        if a > b:
            a, b = b, a
        t0, t1 = max(t0, a), min(t1, b)
        if t0 > t1:
            return False
    return True


def point_box_dist(p, lo, hi):
    return math.sqrt(sum(max(lo[i] - p[i], 0.0, p[i] - hi[i]) ** 2 for i in range(3)))


def clearance(lo, hi, views, near_m=0.3, look_frac=0.9):
    """Findings for one copy's world box against every view {name: (location, look_at, lens)}: the camera inside or within
    near_m of the box (G10 clearance), and the box on the camera's line to its look-at point (up to look_frac of the way,
    so a copy that is itself the look-at target does not count). Returns a list of strings, empty when clear."""
    out = []
    for name, v in sorted(views.items()):
        cam, look = v[0], v[1]
        d = point_box_dist(cam, lo, hi)
        if d < near_m:
            out.append("%s camera %.2f m from the box" % (name, d))
        end = [cam[i] + (look[i] - cam[i]) * look_frac for i in range(3)]
        if seg_box(cam, end, lo, hi):
            out.append("%s sightline to the look-at point crosses the box" % name)
    return out


def path_clear(lo, hi, points, radius=0.45):
    """Findings for walk-path points (player start, door centres): a box footprint within `radius` of a point (2D, the box
    reaching below 2 m above that point's floor)."""
    out = []
    for name, p in points:
        dx = max(lo[0] - p[0], 0.0, p[0] - hi[0])
        dy = max(lo[1] - p[1], 0.0, p[1] - hi[1])
        if math.hypot(dx, dy) < radius and lo[2] < p[2] + 2.0:
            out.append("%s within %.2f m of the footprint" % (name, math.hypot(dx, dy)))
    return out

"""Seeded scatter placement and view culling, pure Python (no Blender), so the layout can be tested and shared by all scenes of a location.

Points come from a jittered grid: one candidate per cell, the cell's own hash decides its position, whether it exists (density below
one per cell) and its variant, scale and rotation. A cell therefore yields the same point in every scene of the location; a scene
only decides which cells it needs (inside a view cone, within a distance cap) and which candidates an obstacle removes.
"""
import math

from .seeds import seed_for, unit


def cell_point(salt, ci, cj, cell, x0, y0, keep):
    """The candidate of grid cell (ci, cj): (x, y, variant_u, scale_u, rot_u) or None when the cell is empty."""
    k = "%s/%d/%d" % (salt, ci, cj)
    if unit(k, "keep") >= keep:
        return None
    return (x0 + (ci + 0.1 + 0.8 * unit(k, "x")) * cell, y0 + (cj + 0.1 + 0.8 * unit(k, "y")) * cell,
            unit(k, "v"), unit(k, "s"), unit(k, "r"))


def view_cone(loc, look, lens_mm, aspect=16 / 9.0, sensor_mm=36.0, margin_deg=14.0):
    """(origin, unit forward, half angle in radians) of a cone that contains the camera's frustum plus a margin."""
    hf = math.atan(sensor_mm / 2.0 / lens_mm)
    vf = math.atan(sensor_mm / aspect / 2.0 / lens_mm)
    half = math.atan(math.hypot(math.tan(hf), math.tan(vf))) + math.radians(margin_deg)
    d = [look[i] - loc[i] for i in range(3)]
    n = math.sqrt(sum(c * c for c in d)) or 1.0
    return tuple(loc), tuple(c / n for c in d), min(half, math.radians(89.0))


def in_cone(cone, p, near_free=1.5):
    o, f, half = cone
    d = [p[i] - o[i] for i in range(3)]
    n = math.sqrt(sum(c * c for c in d))
    if n < 1e-6:
        return True
    return n <= near_free or sum(d[i] * f[i] for i in range(3)) / n >= math.cos(half)


def cells_in_cones(cones, rect, cell, max_dist):
    """Grid cells of rect = (x0, y0, x1, y1) that can fall in any cone within max_dist of its origin (bounding-box prefilter then cone test)."""
    x0, y0, x1, y1 = rect
    seen = set()
    for c in cones:
        o = c[0]
        ia, ib = int(math.floor((max(x0, o[0] - max_dist) - x0) / cell)), int(math.floor((min(x1, o[0] + max_dist) - x0) / cell))
        ja, jb = int(math.floor((max(y0, o[1] - max_dist) - y0) / cell)), int(math.floor((min(y1, o[1] + max_dist) - y0) / cell))
        for i in range(max(ia, 0), ib + 1):
            for j in range(max(ja, 0), jb + 1):
                seen.add((i, j))
    return sorted(seen)


def value_noise(salt, x, y, scale):
    """R2: smooth 2D value noise in 0..1 (hashed lattice, smoothstep blend), stable per salt; `scale` is the feature size."""
    u, v = x / scale, y / scale
    i, j = math.floor(u), math.floor(v)
    fu, fv = u - i, v - j
    su, sv = fu * fu * (3 - 2 * fu), fv * fv * (3 - 2 * fv)
    a, b = unit(salt, "vn", i, j), unit(salt, "vn", i + 1, j)
    c, d = unit(salt, "vn", i, j + 1), unit(salt, "vn", i + 1, j + 1)
    return (a * (1 - su) + b * su) * (1 - sv) + (c * (1 - su) + d * su) * sv


def patch_keep(salt, x, y, patch):
    """R2: patchy density (meadow clumps and bare ground instead of an even field): two octaves of value noise, kept above `cut`."""
    s = patch.get("scale_m", 2.5)
    n = 0.65 * value_noise(salt + "/p1", x, y, s) + 0.35 * value_noise(salt + "/p2", x, y, s * 0.37)
    cut, soft = patch.get("cut", 0.45), patch.get("soft", 0.08)
    t = (n - cut) / soft
    return unit(salt, "pk", round(x, 3), round(y, 3)) < max(0.0, min(1.0, t))


def place(salt, rect, z_top, density_per_100m2, cones, max_dist, obstacles=(), keepouts=(), limit=6000, thin_far=0.5, patch=None, jitter=0.8):
    """All instances of one scatter set on one rectangular surface, as dicts {x, y, z, v, s, r}, nearest first.

    density_per_100m2: instances per 100 m2. obstacles: (x0, y0, x1, y1) footprints to leave empty. keepouts: (x, y, radius) discs
    (player start, camera corridor points). thin_far: at max_dist the keep chance falls to this share (a hashed, so stable, thinning).
    patch (R2): {"scale_m", "cut", "soft"} keeps only the points where a low-frequency noise is above `cut` (clumps and gaps).
    jitter (R2): the share of the cell a point may move over (0.8 default; 1.6 lets neighbours overlap, so no grid shows).
    """
    cell = math.sqrt(100.0 / max(density_per_100m2, 1e-6))
    keep_cell = min(1.0, density_per_100m2 * cell * cell / 100.0)  # = 1 when the cell is at least as big as 100/density
    x0, y0, x1, y1 = rect
    out = []
    for ci, cj in cells_in_cones(cones, rect, cell, max_dist):
        pt = cell_point(salt, ci, cj, cell, x0, y0, keep_cell)
        if pt is None:
            continue
        x, y = pt[0], pt[1]
        if jitter != 0.8:  # R2: wider jitter, centred on the cell
            k = "%s/%d/%d" % (salt, ci, cj)
            x = x0 + (ci + 0.5 + jitter * (unit(k, "x") - 0.5)) * cell
            y = y0 + (cj + 0.5 + jitter * (unit(k, "y") - 0.5)) * cell
        if patch and not patch_keep(salt, x, y, patch):
            continue
        if not (x0 <= x <= x1 and y0 <= y <= y1):
            continue
        p = (x, y, z_top)
        dist = min(math.dist(p, c[0]) for c in cones)
        if dist > max_dist or not any(in_cone(c, p) for c in cones):
            continue
        if unit(salt, ci, cj, "far") > 1.0 - (1.0 - thin_far) * (dist / max_dist):
            continue
        if any(a <= x <= c and b <= y <= d for a, b, c, d in obstacles):
            continue
        if any(math.hypot(x - kx, y - ky) <= kr for kx, ky, kr in keepouts):
            continue
        out.append({"x": x, "y": y, "z": z_top, "v": pt[2], "s": pt[3], "r": pt[4], "d": dist})
    out.sort(key=lambda r: (r["d"], r["x"], r["y"]))
    return out[:limit]


def corridor_keepouts(loc, look, step=1.0, radius=0.35, length=None):
    """Discs along the camera's line of sight (ground projection), so nothing sits right in the middle of the view's foreground."""
    dx, dy = look[0] - loc[0], look[1] - loc[1]
    n = math.hypot(dx, dy)
    if n < 1e-6:
        return []
    ux, uy = dx / n, dy / n
    length = min(n, length if length else 6.0)
    k = int(length / step) + 1
    return [(loc[0] + ux * step * i, loc[1] + uy * step * i, radius) for i in range(k)]


def cluster(pts, cl, K, rect, obstacles=(), keepouts=(), salt="c"):
    """R1: every point gets min..max satellites within radius_m (hashed from the point, so stable), kept inside rect and clear of the
    obstacles and keep-out discs. Returns the points followed by the satellites."""
    import random
    more = []
    for p in pts:
        r = random.Random(seed_for(salt, "cluster", round(p["x"], 4), round(p["y"], 4)))
        for _ in range(r.randint(cl.get("min", 2), cl.get("max", 6))):
            a, d = r.random() * 2 * math.pi, (0.25 + r.random()) * cl.get("radius_m", 0.5) * K
            q = dict(p, x=p["x"] + d * math.cos(a), y=p["y"] + d * math.sin(a), v=r.random(), s=r.random() * 0.8, r=r.random())
            if not (rect[0] <= q["x"] <= rect[2] and rect[1] <= q["y"] <= rect[3]):
                continue
            if any(a0 <= q["x"] <= c0 and b0 <= q["y"] <= d0 for a0, b0, c0, d0 in obstacles):
                continue
            if any(math.hypot(q["x"] - kx, q["y"] - ky) <= kr for kx, ky, kr in keepouts):
                continue
            more.append(q)
    return pts + more


def rect_dist(x, y, rect):
    """Distance in the plane from (x, y) to the rectangle (x0, y0, x1, y1); 0 inside."""
    dx = max(rect[0] - x, 0.0, x - rect[2])
    dy = max(rect[1] - y, 0.0, y - rect[3])
    return math.hypot(dx, dy)

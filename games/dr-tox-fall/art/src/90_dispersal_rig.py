"""Shared art: the dispersal rig, drawn by code as the reference image for its 3D prop.

The rig's generated reference image was refused twice by the image service's safety system, and its
prompt was not reworded to get past that; the author asked for it drawn here instead. The prompt in
`assets/assets.json` stays the spec: a compact wheeled steel aerosol dispersal rig, two pressure tanks,
a nozzle arm, hoses, a small dark CRT screen in a housing, a riveted plate stamped RCC, rust-ochre
residue around the nozzle; worn matte steel, no chrome; one whole object, centred, three-quarter view
from slightly above, on plain white. It belongs to no mode, so it keeps no mode's graphic style: it is
drawn as plainly as code allows, a solid object for a modeller to read.

Geometry is in metres in a small dimetric projection (x along the rig, y into the picture, z up); each
face is drawn in its own plane through an SVG matrix, in centimetres, so plates, screens and rivets sit
on the faces they belong to. Light comes from the upper left: tops lightest, fronts mid, right sides dark.
"""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G

K = 330.0                                   # pixels per metre
XD, YD, ZD = (0.92, 0.30), (0.56, -0.25), (0.0, -0.95)
OX, OY = 182.0, 690.0

STEEL = {"top": "#b3b9b8", "front": "#8d9696", "side": "#636c6d", "edge": "#2b3132"}
TANK = ("#c2c7c5", "#97a09f", "#6b7475", "#3c4344")
DARK = "#232829"


def P3(x, y, z):
    return (OX + K * (x * XD[0] + y * YD[0] + z * ZD[0]), OY + K * (x * XD[1] + y * YD[1] + z * ZD[1]))


def m(u, v, origin):
    """An SVG matrix taking a plane's local centimetres (u, v) to the page; u and v are world axes."""
    s = K / 100
    e, g = P3(*origin)
    return f"matrix({f(u[0] * s)} {f(u[1] * s)} {f(v[0] * s)} {f(v[1] * s)} {f(e)} {f(g)})"


def front(a, y0):     # the plane y = y0, local (x cm, -z cm)
    a.open("g", transform=m(XD, (-ZD[0], -ZD[1]), (0, y0, 0)))


def side(a, x0):      # the plane x = x0, local (y cm, -z cm)
    a.open("g", transform=m(YD, (-ZD[0], -ZD[1]), (x0, 0, 0)))


def top(a, z0):       # the plane z = z0, local (x cm, y cm)
    a.open("g", transform=m(XD, YD, (0, 0, z0)))


def lin(a, stops, x2=0, y2=1):
    """A linear gradient over the shape's box with per-stop opacity: stops are (offset, colour, opacity)."""
    gid = a.uid("lin")
    s = "".join(f'<stop offset="{f(o * 100)}%" stop-color="{c}" stop-opacity="{f(op)}"/>' for o, c, op in stops)
    a.defn(f'<linearGradient id="{gid}" x1="0" y1="0" x2="{x2}" y2="{y2}">{s}</linearGradient>')
    return f"url(#{gid})"


def wear(a, x, y, w, h, n=14, grime=0.35, rust=0.0):
    """Scuffs, a grime fall-off toward the bottom and, if asked, rust freckles along the lower edge, all
    in the current plane's local units."""
    a.rect(x, y, w, h, fill=lin(a, [(0, "#000", 0), (0.6, "#000", grime * 0.25), (1, "#1a1408", grime)]))
    for _ in range(n):
        sx, sy = x + a.rng.uniform(0.05, 0.95) * w, y + a.rng.uniform(0.08, 0.92) * h
        ln, ang = a.rng.uniform(2, 9), math.radians(a.rng.uniform(-35, 35))
        a.line(sx, sy, sx + ln * math.cos(ang), sy + ln * math.sin(ang), stroke="#e4e8e6",
               stroke_width=a.rng.uniform(0.3, 0.7), opacity=a.rng.uniform(0.25, 0.55), stroke_linecap="round")
    if rust:
        a.stipple(x, y + h * 0.7, w, h * 0.3, n=int(90 * rust), r=(0.3, 1.1), fill=kit.RUST, opacity=0.45,
                  density=lambda px, py: (py - (y + h * 0.7)) / (h * 0.3))
        a.stipple(x, y + h * 0.82, w, h * 0.18, n=int(50 * rust), r=(0.3, 0.8), fill=kit.OCHRE, opacity=0.4)


def rivets(a, pts, r=0.9):
    for x, y in pts:
        a.circle(x + 0.25, y + 0.3, r, fill=DARK, opacity=0.6)
        a.circle(x, y, r, fill="#a9b0af", stroke=DARK, stroke_width=0.3)
        a.circle(x - r * 0.3, y - r * 0.3, r * 0.35, fill="#dfe3e1", opacity=0.8)


def box(a, x0, x1, y0, y1, z0, z1, col=STEEL, sw=1.6):
    """A steel box: its top, front (y = y0) and right side (x = x1) faces, with edge lines."""
    for face, fill in (("top", col["top"]), ("front", col["front"]), ("side", col["side"])):
        if face == "top":
            pts = [P3(x0, y0, z1), P3(x1, y0, z1), P3(x1, y1, z1), P3(x0, y1, z1)]
        elif face == "front":
            pts = [P3(x0, y0, z0), P3(x1, y0, z0), P3(x1, y0, z1), P3(x0, y0, z1)]
        else:
            pts = [P3(x1, y0, z0), P3(x1, y1, z0), P3(x1, y1, z1), P3(x1, y0, z1)]
        a.poly(pts, fill=fill, stroke=col["edge"], stroke_width=sw, stroke_linejoin="round")
    # a lit edge along the top's front and right rims
    a.poly([P3(x0, y0, z1), P3(x1, y0, z1), P3(x1, y1, z1)], closed=False, fill="none", stroke="#dde1df",
           stroke_width=1.2, opacity=0.7)


def ellipse_pts(cx, cy, z, r, n=72):
    return [P3(cx + r * math.cos(2 * math.pi * k / n), cy + r * math.sin(2 * math.pi * k / n), z) for k in range(n)]


def near_arc(pts):
    """The nearer half of a projected horizontal circle: from its leftmost to its rightmost point by the
    lower (nearer) side."""
    n = len(pts)
    il = min(range(n), key=lambda i: pts[i][0])
    ir = max(range(n), key=lambda i: pts[i][0])
    a1 = [pts[(il + k) % n] for k in range((ir - il) % n + 1)]
    a2 = [pts[(il - k) % n] for k in range((il - ir) % n + 1)]
    return a1 if sum(p[1] for p in a1) / len(a1) > sum(p[1] for p in a2) / len(a2) else a2


def far_arc(pts):
    n = len(pts)
    near = near_arc(pts)
    return [p for p in pts if p not in near[1:-1]]


def d_of(pts, closed=False):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if closed else "")


def cylinder(a, cx, cy, r, z0, z1, shades=TANK, dome=0.0, bands=()):
    """An upright cylinder, shaded across its width, with an optional domed head and strap bands."""
    lo, hi = ellipse_pts(cx, cy, z0, r), ellipse_pts(cx, cy, z1, r)
    nb, nt = near_arc(lo), near_arc(hi)
    body = [nt[0]] + [nb[0]] + nb[1:] + [nt[-1]] + list(reversed(nt))[1:]
    grad = lin(a, [(0, shades[1], 1), (0.22, shades[0], 1), (0.5, shades[1], 1), (0.85, shades[2], 1),
                   (1, shades[3], 1)], x2=1, y2=0)
    a.path(d_of(body, True), fill=grad, stroke=STEEL["edge"], stroke_width=1.6, stroke_linejoin="round")
    # grime toward the foot
    a.path(d_of(body, True), fill=lin(a, [(0, "#000", 0), (0.7, "#000", 0.05), (1, "#1a1408", 0.35)]))
    for zb in bands:
        arc = near_arc(ellipse_pts(cx, cy, zb, r * 1.012))
        a.path(d_of(arc), fill="none", stroke=shades[3], stroke_width=7, opacity=0.85)
        a.path(d_of(arc), fill="none", stroke=shades[0], stroke_width=1.4, opacity=0.6,
               transform="translate(0,-2.4)")
        mid = arc[len(arc) // 3]
        a.rect(mid[0] - 5, mid[1] - 6, 10, 11, rx=1.5, fill=shades[2], stroke=STEEL["edge"], stroke_width=1)
    if dome:
        L, R = nt[0], nt[-1]
        cxp = (L[0] + R[0]) / 2
        hgt = K * dome * 0.95
        topy = min(p[1] for p in hi) - hgt
        dd = (f"M{f(L[0])},{f(L[1])} C{f(L[0])},{f(L[1] - hgt * 0.9)} {f(cxp - (R[0] - L[0]) * 0.28)},{f(topy)} "
              f"{f(cxp)},{f(topy)} C{f(cxp + (R[0] - L[0]) * 0.28)},{f(topy)} {f(R[0])},{f(R[1] - hgt * 0.9)} "
              f"{f(R[0])},{f(R[1])} " + " ".join(f"L{f(x)},{f(y)}" for x, y in reversed(nt[:-1])) + "Z")
        a.path(dd, fill=grad, stroke=STEEL["edge"], stroke_width=1.6, stroke_linejoin="round")
        a.path(dd, fill=a.radial([(0, "#f1f3f2", 0.55), (0.6, "#f1f3f2", 0), (1, "#000", 0)], cx=0.32, cy=0.35,
                                 r=0.5))
        # the weld seam where the head meets the shell
        a.path(d_of(nt), fill="none", stroke=shades[3], stroke_width=2.2, opacity=0.8)
        return topy, cxp
    a.path(d_of(hi, True), fill=shades[0], stroke=STEEL["edge"], stroke_width=1.4)
    return min(p[1] for p in hi), (nt[0][0] + nt[-1][0]) / 2


def tube(a, d, w=10, dark="#30373a", mid="#5a6366", light="#9aa3a4"):
    """A round bar or hose along path d: an outline, a body and a thin highlight on the upper left."""
    a.path(d, fill="none", stroke=DARK, stroke_width=w + 3, stroke_linecap="round", stroke_linejoin="round")
    a.path(d, fill="none", stroke=dark, stroke_width=w, stroke_linecap="round", stroke_linejoin="round")
    a.path(d, fill="none", stroke=mid, stroke_width=w * 0.55, stroke_linecap="round", stroke_linejoin="round",
           transform=f"translate({f(-w * 0.12)},{f(-w * 0.14)})")
    a.path(d, fill="none", stroke=light, stroke_width=max(1.0, w * 0.16), stroke_linecap="round",
           stroke_linejoin="round", opacity=0.75, transform=f"translate({f(-w * 0.24)},{f(-w * 0.28)})")


def wheel(a, x, y, z, r=0.17, w=0.09):
    """A solid rubber caster in the x-z plane, its hub toward the viewer, a little tread depth behind."""
    front(a, y + w)
    a.circle(x * 100, -z * 100, r * 100, fill="#151819")
    a.close()
    front(a, y)
    cx, cy, rr = x * 100, -z * 100, r * 100
    a.circle(cx, cy, rr, fill="#22272a", stroke="#0c0e0f", stroke_width=1.2)
    a.circle(cx, cy, rr * 0.82, fill="none", stroke="#3a4144", stroke_width=1.6)
    a.circle(cx, cy, rr * 0.5, fill="#7f8889", stroke="#2b3132", stroke_width=1)
    a.circle(cx, cy, rr * 0.5, fill=a.radial([(0, "#c9cecc", 0.7), (1, "#c9cecc", 0)], cx=0.35, cy=0.35, r=0.6))
    for k in range(5):
        t = 2 * math.pi * k / 5 + 0.3
        a.circle(cx + rr * 0.33 * math.cos(t), cy + rr * 0.33 * math.sin(t), 0.9, fill="#2b3132")
    a.circle(cx, cy, rr * 0.14, fill="#4a5254", stroke="#1b1f20", stroke_width=0.8)
    a.path(f"M{f(cx - rr * 0.78)},{f(cy - rr * 0.35)} A{f(rr * 0.85)},{f(rr * 0.85)} 0 0 1 {f(cx - rr * 0.1)},"
           f"{f(cy - rr * 0.84)}", fill="none", stroke="#5c6467", stroke_width=1.5, opacity=0.7)
    a.close()


@asset(G, "shared-dispersal-rig", group="pieces", title="Dispersal rig (3D prop reference)", w=1024, h=1024,
       row=kit.row("shared", "3D prop reference: dispersal-rig (assets.json), drawn by code"))
def dispersal_rig(a: Art):
    """A compact wheeled aerosol dispersal rig in worn matte steel, seen three-quarter from slightly above
    on plain white: a low riveted cabinet on four solid casters with a push bar, two strapped pressure
    tanks with domed heads, gauges and hand valves, hoses looping from the valves to an upright mast, a
    jointed nozzle arm reaching forward to a flared nozzle crusted with rust and ochre residue, a small
    dark CRT screen set in a steel housing with two knobs, and a riveted plate stamped RCC on the
    cabinet's front. One object, whole, no figure, no other thing."""
    a.rect(0, 0, 1024, 1024, fill="#ffffff")
    # ---- casters behind, then the cabinet ------------------------------------------------------------
    wheel(a, 0.22, 0.86, 0.17)
    wheel(a, 1.38, 0.86, 0.17)
    box(a, 0.0, 1.6, 0.0, 0.95, 0.24, 0.62)
    # the caster forks under the cabinet
    for x in (0.22, 1.38):
        front(a, -0.02)
        a.rect(x * 100 - 7, -24, 14, 9, fill="#4f585a", stroke=DARK, stroke_width=0.8)
        a.close()
    # cabinet front: panel seams, louvres, wear, the RCC plate
    front(a, 0.0)
    a.rect(4, -58, 152, 30, fill="none", stroke="#5f6869", stroke_width=0.9)
    a.line(52, -58, 52, -28, stroke="#5f6869", stroke_width=0.9)
    a.line(108, -58, 108, -28, stroke="#5f6869", stroke_width=0.9)
    for k in range(6):
        a.rect(10, -55 + k * 4.4, 36, 1.8, rx=0.9, fill="#3b4243")
        a.rect(10, -54.3 + k * 4.4, 36, 0.6, fill="#c5cbca", opacity=0.5)
    a.rect(116, -50, 3, 12, rx=1.2, fill="#3b4243")          # a latch
    a.rect(140, -50, 3, 12, rx=1.2, fill="#3b4243")
    wear(a, 0, -62, 160, 38, n=22, grime=0.45, rust=1.0)
    a.rect(58.5, -55.5, 44, 22, rx=1.6, fill="#000", opacity=0.3)
    kit.plate(a, 57, -57, 44, 22, "RCC", fill="#a7aeac", ink="#262b2c", size=11, sw=0.9, rivets=False)
    rivets(a, [(59.2, -54.8), (98.8, -54.8), (59.2, -37.2), (98.8, -37.2)], r=0.85)
    a.rect(57, -57, 44, 22, rx=1.6, fill=lin(a, [(0, "#000", 0), (1, "#3a2a14", 0.25)]))
    rivets(a, [(2 + k * 12.3, -60) for k in range(14)], r=0.6)
    rivets(a, [(2 + k * 12.3, -26) for k in range(14)], r=0.6)
    a.close()
    side(a, 1.6)
    for k in range(5):
        a.rect(18 + k * 12, -52, 7, 22, rx=1, fill="#30373a")
    wear(a, 0, -62, 95, 38, n=10, grime=0.5, rust=0.8)
    rivets(a, [(2 + k * 11.5, -60) for k in range(9)], r=0.6)
    a.close()
    top(a, 0.62)
    wear(a, 0, 0, 160, 95, n=26, grime=0.08)
    a.close()
    # ---- the push bar at the back left ---------------------------------------------------------------
    b0, b1 = P3(0.04, 0.12, 0.62), P3(0.04, 0.82, 0.62)
    t0, t1 = P3(-0.08, 0.12, 1.22), P3(-0.08, 0.82, 1.22)
    tube(a, f"M{f(b1[0])},{f(b1[1])} L{f(t1[0])},{f(t1[1])} L{f(t0[0])},{f(t0[1])}", w=9)
    grip0, grip1 = P3(-0.08, 0.3, 1.22), P3(-0.08, 0.64, 1.22)
    a.path(f"M{f(grip0[0])},{f(grip0[1])} L{f(grip1[0])},{f(grip1[1])}", stroke="#1d2122", stroke_width=13,
           stroke_linecap="round")
    tube(a, f"M{f(t0[0])},{f(t0[1])} L{f(b0[0])},{f(b0[1])}", w=9)
    # ---- the mast at the back right (behind the far tank's reach) ------------------------------------
    mb, mt = P3(1.3, 0.78, 0.62), P3(1.3, 0.78, 1.62)
    tube(a, f"M{f(mb[0])},{f(mb[1])} L{f(mt[0])},{f(mt[1])}", w=16)
    for z in (0.66, 1.62):
        cylinder(a, 1.3, 0.78, 0.055, z - 0.03, z + 0.02, shades=("#a5adac", "#7d8687", "#555e60", "#2f3638"))
    # ---- two pressure tanks --------------------------------------------------------------------------
    heads = []
    for (cx, cy) in ((0.42, 0.5), (0.9, 0.42)):
        cylinder(a, cx, cy, 0.2, 0.62, 0.7, shades=("#9aa2a1", "#79827f", "#555d5e", "#30373a"))  # foot ring
        topy, hx = cylinder(a, cx, cy, 0.19, 0.7, 1.36, dome=0.13, bands=(0.82, 1.22))
        heads.append((cx, cy, topy, hx))
        # a gauge on the near face
        gx, gy = P3(cx + 0.06, cy - 0.185, 1.05)
        a.circle(gx + 1.5, gy + 2, 17, fill="#000", opacity=0.25)
        a.circle(gx, gy, 17, fill="#5c6566", stroke=DARK, stroke_width=1.6)
        a.circle(gx, gy, 12.5, fill="#d8d6cc", stroke="#3a4142", stroke_width=1)
        for k in range(7):
            t = math.radians(150 + k * 40)
            a.line(gx + 9.5 * math.cos(t), gy + 9.5 * math.sin(t), gx + 12 * math.cos(t), gy + 12 * math.sin(t),
                   stroke="#2b3132", stroke_width=0.9)
        a.line(gx, gy, gx + 8 * math.cos(math.radians(-20)), gy + 8 * math.sin(math.radians(-20)), stroke=kit.BLOOD2,
               stroke_width=1.6, stroke_linecap="round")
        a.circle(gx, gy, 1.8, fill="#2b3132")
        a.path(f"M{f(gx - 9)},{f(gy - 7)} A12,12 0 0 1 {f(gx + 4)},{f(gy - 11)}", fill="none", stroke="#ffffff",
               stroke_width=1.4, opacity=0.6)
        # rust weep under the gauge
        a.path(f"M{f(gx - 3)},{f(gy + 17)} q2,30 -1,58 M{f(gx + 4)},{f(gy + 17)} q1,18 0,32", fill="none",
               stroke=kit.RUST, stroke_width=1.6, opacity=0.35, stroke_linecap="round")
    # valves and hand wheels on the heads
    for (cx, cy, topy, hx) in heads:
        cylinder(a, cx, cy, 0.035, 1.44, 1.53, shades=("#a9b1b0", "#7f8889", "#575f61", "#2f3638"))
        vx, vy = P3(cx, cy, 1.55)
        a.ellipse(vx, vy, 24, 10, fill="none", stroke=DARK, stroke_width=6)
        a.ellipse(vx, vy, 24, 10, fill="none", stroke="#6b5a3e", stroke_width=3.5)
        a.ellipse(vx - 1, vy - 1.5, 24, 10, fill="none", stroke="#a08a62", stroke_width=1, opacity=0.6)
        a.line(vx - 23, vy, vx + 23, vy, stroke="#4a3f2c", stroke_width=2.5)
        a.line(vx, vy - 9, vx, vy + 9, stroke="#4a3f2c", stroke_width=2.5)
        a.circle(vx, vy, 4, fill="#3a4142")
    # ---- hoses from the valves to the mast -----------------------------------------------------------
    m1 = P3(1.3, 0.78, 1.18)
    m2 = P3(1.3, 0.78, 1.32)
    for (cx, cy, topy, hx), mp, sag in zip(heads, (m1, m2), (95, 60)):
        s = P3(cx + 0.03, cy - 0.05, 1.47)
        e1 = (s[0] + 40, s[1] - 18)
        tube(a, f"M{f(s[0])},{f(s[1])} C{f(e1[0])},{f(e1[1])} {f(mp[0] - 120)},{f(mp[1] + sag)} {f(mp[0] - 6)},"
                f"{f(mp[1])}", w=11, dark="#1b1e1f", mid="#2f3436", light="#5d6567")
        a.rect(mp[0] - 14, mp[1] - 7, 12, 14, rx=2, fill="#8b9393", stroke=DARK, stroke_width=1.2)
        a.rect(s[0] - 7, s[1] - 6, 14, 12, rx=2, fill="#8b9393", stroke=DARK, stroke_width=1.2)
    # ---- the nozzle arm ------------------------------------------------------------------------------
    j0 = P3(1.3, 0.78, 1.64)
    j1 = P3(1.56, 0.62, 1.86)
    j2 = P3(1.84, 0.36, 1.78)
    tube(a, f"M{f(j0[0])},{f(j0[1])} L{f(j1[0])},{f(j1[1])}", w=16)
    tube(a, f"M{f(j1[0])},{f(j1[1])} L{f(j2[0])},{f(j2[1])}", w=14)
    # a hydraulic strut under the first limb
    s0, s1 = P3(1.3, 0.78, 1.42), P3(1.46, 0.68, 1.79)
    tube(a, f"M{f(s0[0])},{f(s0[1])} L{f(s1[0])},{f(s1[1])}", w=6, dark="#3c4446", mid="#6f797b", light="#c3c9c8")
    for (jx, jy) in (j0, j1):
        a.circle(jx, jy, 13, fill="#6f797a", stroke=DARK, stroke_width=1.6)
        a.circle(jx - 3, jy - 3, 5, fill="#b9c0bf", opacity=0.7)
        a.circle(jx, jy, 3.2, fill="#2b3132")
    # the flared nozzle, pointing forward and down
    dx, dy = j2[0] - j1[0], j2[1] - j1[1]
    ln = math.hypot(dx, dy)
    ux, uy = dx / ln, dy / ln
    nx, ny = -uy, ux
    tip = (j2[0] + ux * 58, j2[1] + uy * 58)
    cone = [(j2[0] + nx * 9, j2[1] + ny * 9), (j2[0] + ux * 30 + nx * 11, j2[1] + uy * 30 + ny * 11),
            (tip[0] + nx * 22, tip[1] + ny * 22), (tip[0] - nx * 22, tip[1] - ny * 22),
            (j2[0] + ux * 30 - nx * 11, j2[1] + uy * 30 - ny * 11), (j2[0] - nx * 9, j2[1] - ny * 9)]
    a.poly(cone, fill=lin(a, [(0, "#9aa2a2", 1), (0.5, "#6a7374", 1), (1, "#3b4243", 1)], x2=0, y2=1),
           stroke=DARK, stroke_width=1.6, stroke_linejoin="round")
    a.ellipse(tip[0], tip[1], 8.5, 22.5, transform=f"rotate({f(math.degrees(math.atan2(uy, ux)))} {f(tip[0])} "
              f"{f(tip[1])})", fill="#141617", stroke="#3a4142", stroke_width=1.6)
    a.circle(j2[0], j2[1], 10, fill="#7d8687", stroke=DARK, stroke_width=1.4)
    # residue: a crust ringing the mouth and down the cone, and freckles on the arm
    ang = f"rotate({f(math.degrees(math.atan2(uy, ux)))} {f(tip[0])} {f(tip[1])})"
    a.ellipse(tip[0], tip[1], 8.5, 22.5, transform=ang, fill="none", stroke=kit.RUST, stroke_width=4.5, opacity=0.85)
    a.ellipse(tip[0], tip[1], 8.5, 22.5, transform=ang, fill="none", stroke=kit.OCHRE, stroke_width=1.8,
              opacity=0.9, stroke_dasharray="5 3 2 4")
    cone_clip = a.clip(f'<polygon points="{" ".join(f"{f(x)},{f(y)}" for x, y in cone)}"/>')
    a.open("g", clip_path=cone_clip)
    a.stipple(tip[0] - 40, tip[1] - 40, 80, 80, n=520, r=(0.6, 2.0), fill=kit.OCHRE, opacity=0.8,
              density=lambda px, py: max(0.0, 1 - math.hypot(px - tip[0], py - tip[1]) / 34))
    a.stipple(tip[0] - 40, tip[1] - 40, 80, 80, n=360, r=(0.5, 1.6), fill=kit.RUST, opacity=0.75,
              density=lambda px, py: max(0.0, 1 - math.hypot(px - tip[0], py - tip[1]) / 44))
    a.close()
    for k in range(3):
        sx, sy = tip[0] + nx * (k - 1) * 12, tip[1] + ny * (k - 1) * 12
        a.path(f"M{f(sx)},{f(sy)} q{f(1 + k)},8 {f(k * 0.5)},{f(9 + k * 5)}", fill="none",
               stroke=kit.RUST if k % 2 else kit.OCHRE, stroke_width=2.2 - k * 0.3, opacity=0.6,
               stroke_linecap="round")
    a.stipple(j2[0] - 30, j2[1] - 24, 60, 44, n=70, r=(0.4, 1.2), fill=kit.RUST, opacity=0.45,
              density=lambda px, py: max(0.0, 1 - math.hypot(px - j2[0], py - j2[1]) / 26))
    # ---- the CRT housing on the front right of the deck -----------------------------------------------
    hx0, hx1, hy0, hy1, hz0, hz1 = 1.08, 1.56, 0.06, 0.42, 0.62, 1.08
    box(a, hx0, hx1, hy0, hy1, hz0, hz1, col={"top": "#a9b0af", "front": "#828b8b", "side": "#5b6465",
                                              "edge": "#262b2c"})
    front(a, hy0)
    x0, w_ = hx0 * 100, (hx1 - hx0) * 100
    a.rect(x0 + 4, -104, w_ - 8, 30, rx=3, fill="#3e4546", stroke="#262b2c", stroke_width=0.8)   # the bezel
    a.rect(x0 + 6.5, -101.5, w_ - 20, 25, rx=5, fill="#0f1415", stroke="#050707", stroke_width=0.8)
    a.rect(x0 + 6.5, -101.5, w_ - 20, 25, rx=5,
           fill=a.radial([(0, "#2f4544", 0.9), (0.7, "#142021", 0.6), (1, "#0a0f10", 0)], cx=0.45, cy=0.45, r=0.6))
    for k in range(9):
        a.line(x0 + 8, -99 + k * 2.6, x0 + w_ - 16, -99 + k * 2.6, stroke="#000", stroke_width=0.5, opacity=0.35)
    a.path(f"M{f(x0 + 9)},{f(-98)} q8,-2 16,0", fill="none", stroke="#d7e3e1", stroke_width=0.9, opacity=0.5)
    for k, yy in enumerate((-96, -86)):
        kx = x0 + w_ - 7.5
        a.circle(kx, yy, 2.6, fill="#22272a", stroke="#0c0e0f", stroke_width=0.4)
        a.line(kx, yy, kx + 1.6 * math.cos(1 + k), yy - 1.6 * math.sin(1 + k), stroke="#9aa2a2", stroke_width=0.5)
    a.rect(x0 + 4, -70, w_ - 8, 3, rx=0.8, fill="#3e4546")      # a vent slot
    a.rect(x0 + 4, -65, w_ - 8, 3, rx=0.8, fill="#3e4546")
    wear(a, x0, -108, w_, 46, n=10, grime=0.4, rust=0.5)
    rivets(a, [(x0 + 2, -106), (x0 + w_ - 2, -106), (x0 + 2, -64), (x0 + w_ - 2, -64)], r=0.7)
    a.close()
    side(a, hx1)
    y0_, d_ = hy0 * 100, (hy1 - hy0) * 100
    for k in range(4):
        a.rect(y0_ + 6 + k * 7, -100, 3.5, 22, rx=1, fill="#30373a")
    wear(a, y0_, -108, d_, 46, n=6, grime=0.45, rust=0.4)
    a.close()
    top(a, hz1)
    wear(a, hx0 * 100, hy0 * 100, (hx1 - hx0) * 100, (hy1 - hy0) * 100, n=6, grime=0.05)
    a.close()
    # a cable from the housing back to the mast
    c0, c1 = P3(1.4, 0.42, 1.0), P3(1.3, 0.7, 0.95)
    tube(a, f"M{f(c0[0])},{f(c0[1])} Q{f(c0[0] + 30)},{f(c0[1] - 50)} {f(c1[0] + 4)},{f(c1[1])}", w=5,
         dark="#151718", mid="#24282a", light="#4a5153")
    # ---- casters in front ----------------------------------------------------------------------------
    wheel(a, 0.22, -0.06, 0.17)
    wheel(a, 1.38, -0.06, 0.17)

"""The Endless Temple: palette and shared drawing helpers for the code-drawn art."""
import math

from artkit import asset, f

G = "endless-temple"

# Style bible (DEEP_DIVE.md section 4)
WALNUT = "#22170E"
VELLUM = "#F3EAD2"
GOLD = "#D4A23A"
SAGE = "#8FA58A"
SKIN = "#BFD8C2"
SILVER = "#C9CED6"
OCHRE = "#C58B3A"
BRUISE = "#5B3A6B"
LANTERN = "#E0782A"
FROST = "#0E1622"
# working tones mixed from the ten
INK = "#33241A"        # brown-black dip-pen line, never pure black
INK2 = "#5A4230"
VELLUM_D = "#E2D4B2"
VELLUM_S = "#CDBB93"
WALNUT_L = "#4A3220"
LEATHER = "#5A3220"
GOLD_D = "#9A6F1E"
GOLD_L = "#F0D488"
SAGE_D = "#5F7A5E"
SKIN_D = "#8FB39A"
BRASS = "#C9A24A"
BRASS_D = "#8D6A26"
BRASS_L = "#E8CB7C"
STEEL = "#9AA4AA"
VERD = "#5F9A86"
CLAY = "#C08E5E"
CLAY_L = "#DBAE7E"
CLAY_D = "#7E5232"

CHAPTERS = [
    ("c1", "The Waking"), ("c2", "The Storyteller's Circle"), ("c3", "The Keeper's Rounds"),
    ("c4", "The Silver Dunes"), ("c5", "The Weather-Clerk of Hollin"), ("c6", "The Father's Mark"),
    ("c7", "The Long Procession"), ("c8", "The Unlit Shelf"), ("c9", "The End of the Sand"),
]
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]


def reg(id, group, title, w, h, row, doc, fn, *args, **kw):
    """Register one member of a family: fn(a, *args, **kw) with its own id, title and description."""
    def draw(a):
        fn(a, *args, **kw)
    draw.__doc__ = doc
    return asset(G, id, group=group, title=title, w=w, h=h, row=row)(draw)


# ---- geometry ---------------------------------------------------------------------------------
def crom(pts, step=6.0, closed=False):
    """Dense points along a Catmull-Rom curve through pts."""
    p = list(pts)
    if len(p) < 2:
        return p
    if closed:
        p = [p[-1]] + p + [p[0], p[1]]
    else:
        p = [p[0]] + p + [p[-1]]
    out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        n = max(2, int(math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step))
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(tuple(p[-2]))
    return out


def pd(pts, closed=False):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if closed else "")


def pen_d(a, pts, w=3.0, taper=(0.25, 0.3), wob=0.3, step=None):
    """The outline of a dip-pen stroke through pts: swelling, uneven, tapering at both ends."""
    L = sum(math.hypot(x2 - x1, y2 - y1) for (x1, y1), (x2, y2) in zip(pts, pts[1:]))
    c = crom(pts, step or max(4.0, L / 26))
    n = len(c)
    if n < 2:
        return ""
    ph = a.rng.uniform(0, 6.28)
    left, right = [], []
    for i, (x, y) in enumerate(c):
        x0, y0 = c[max(0, i - 1)]
        x1, y1 = c[min(n - 1, i + 1)]
        d = math.hypot(x1 - x0, y1 - y0) or 1
        nx, ny = -(y1 - y0) / d, (x1 - x0) / d
        t = i / (n - 1)
        k = 1.0
        if taper[0] and t < taper[0]:
            k = 0.18 + 0.82 * (t / taper[0]) ** 0.7
        if taper[1] and t > 1 - taper[1]:
            k = min(k, 0.12 + 0.88 * ((1 - t) / taper[1]) ** 0.8)
        k *= 1 + wob * math.sin(ph + t * 9.0) + a.rng.uniform(-wob, wob) * 0.4
        # a pen is broader on the down-stroke
        k *= 0.8 + 0.35 * abs(ny)
        h = max(0.25, w * k / 2)
        left.append((x + nx * h, y + ny * h))
        right.append((x - nx * h, y - ny * h))
    return pd(left + right[::-1], closed=True)


def pen(a, pts, w=3.0, color=INK, taper=(0.25, 0.3), wob=0.3, step=None, **kw):
    a.path(pen_d(a, pts, w, taper, wob, step), fill=color, **kw)


def pens(a, strokes, w=3.0, color=INK, **kw):
    """Several pen strokes in one path element."""
    a.path(" ".join(pen_d(a, s, w, **{k: v for k, v in kw.items() if k in ("taper", "wob", "step")}) for s in strokes),
           fill=color, **{k: v for k, v in kw.items() if k not in ("taper", "wob", "step")})


def curve(a, pts, w=1.6, color=INK, closed=False, **kw):
    kw.setdefault("fill", "none")
    kw.setdefault("stroke_linecap", "round")
    kw.setdefault("stroke_linejoin", "round")
    a.path(a.smooth_d(pts, closed), stroke=color, stroke_width=w, **kw)


def blob_d(a, cx, cy, rx, ry, n=11, jit=0.22, rot=0.0):
    pts = []
    ca, sa = math.cos(rot), math.sin(rot)
    for i in range(n):
        t = 2 * math.pi * i / n
        k = 1 + a.rng.uniform(-jit, jit)
        x, y = rx * k * math.cos(t), ry * k * math.sin(t)
        pts.append((cx + x * ca - y * sa, cy + x * sa + y * ca))
    return a.smooth_d(pts, closed=True)


def grain(a, x, y, w, h, alpha=0.25, freq=0.9, color=None, clip=None):
    """Paper grain over a box (used inside books, never in the temple)."""
    fid = a.uid("gr")
    rgb = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0"
    if color:
        r, g, b = (int(color[i:i + 2], 16) / 255 for i in (1, 3, 5))
        rgb = f"0 0 0 0 {f(r)}  0 0 0 0 {f(g)}  0 0 0 0 {f(b)}"
    a.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%">'
           f'<feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="2" seed="{a.rng.randint(1, 900)}"/>'
           f'<feColorMatrix values="{rgb}  0 0 0 {f(alpha)} 0"/></filter>')
    kw = {"clip_path": clip} if clip else {}
    a.rect(x, y, w, h, filter=f"url(#{fid})", **kw)


def wash(a, d, color, opacity, rough=None, edge=None, ew=2.0):
    """A gouache or watercolour bloom: a translucent fill with a darker pooled edge."""
    a.path(d, fill=color, opacity=opacity, filter=rough)
    a.path(d, fill="none", stroke=edge or color, stroke_width=ew, opacity=min(1, opacity + 0.2), filter=rough)


def gold(a, span=180):
    """Gold leaf as a reflecting gradient in user space (so it also paints hairlines)."""
    gid = a.uid("gold")
    a.defn(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="{span}" y2="{f(span * .7)}" '
           f'spreadMethod="reflect"><stop offset="0" stop-color="{GOLD_L}"/><stop offset="0.45" stop-color="{GOLD}"/>'
           f'<stop offset="0.75" stop-color="{GOLD_D}"/><stop offset="1" stop-color="{GOLD}"/></linearGradient>')
    return f"url(#{gid})"


def brass(a, span=160):
    gid = a.uid("brass")
    a.defn(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="{span}" y2="{span}" '
           f'spreadMethod="reflect"><stop offset="0" stop-color="{BRASS_L}"/><stop offset="0.5" stop-color="{BRASS}"/>'
           f'<stop offset="1" stop-color="{BRASS_D}"/></linearGradient>')
    return f"url(#{gid})"


def leather(a, color=LEATHER, x=0, y=0, w=None, h=None, vig=0.6, rx=0):
    w = a.w if w is None else w
    h = a.h if h is None else h
    a.rect(x, y, w, h, fill=color, rx=rx)
    cl = a.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="{rx}"/>')
    grain(a, x, y, w, h, 0.4, 0.65, clip=cl)
    grain(a, x, y, w, h, 0.28, 0.035, clip=cl)
    if vig:
        gid = a.radial([(0, "#000", 0), (0.6, "#000", 0), (1, "#140904", vig)], 0.5, 0.5, 0.75)
        a.rect(x, y, w, h, fill=gid, rx=rx)


def page(a, color=VELLUM, x=0, y=0, w=None, h=None, g=0.22, edge=0.35, rx=0):
    """A vellum sheet with grain and a faint darkening toward its edges."""
    w = a.w if w is None else w
    h = a.h if h is None else h
    a.rect(x, y, w, h, fill=color, rx=rx)
    cl = a.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="{rx}"/>')
    grain(a, x, y, w, h, g, 0.8, clip=cl)
    if edge:
        gid = a.radial([(0, "#8a6a3a", 0), (0.62, "#8a6a3a", 0), (1, "#6a4a22", edge)], 0.5, 0.5, 0.78)
        a.rect(x, y, w, h, fill=gid, rx=rx)


def glow(a, cx, cy, r, color=GOLD, strength=0.6):
    a.circle(cx, cy, r, fill=a.radial([(0, color, strength), (0.5, color, strength * 0.35), (1, color, 0)]))


# ---- motifs -----------------------------------------------------------------------------------
def leaf_d(x, y, L, ang, wd=0.36, curl=0.12):
    """A pointed leaf from (x, y), length L, direction ang (radians)."""
    ca, sa = math.cos(ang), math.sin(ang)

    def T(u, v):
        return f"{f(x + u * ca - v * sa)},{f(y + u * sa + v * ca)}"
    w = L * wd
    return (f"M{T(0, 0)} C{T(L * .25, -w)} {T(L * .7, -w * (1 - curl))} {T(L, L * curl * .4)} "
            f"C{T(L * .7, w * (1 + curl))} {T(L * .25, w)} {T(0, 0)}Z")


def leaf(a, x, y, L, ang, fill=SAGE, wd=0.36, line=INK, lw=1.4, vein=True, **kw):
    a.path(leaf_d(x, y, L, ang, wd), fill=fill, stroke=line, stroke_width=lw, stroke_linejoin="round", **kw)
    if vein:
        a.line(x + L * .1 * math.cos(ang), y + L * .1 * math.sin(ang), x + L * .85 * math.cos(ang),
               y + L * .85 * math.sin(ang), stroke=line, stroke_width=lw * .6, opacity=.7, **kw)


def woody_leaf(a, x, y, L, ang, fill=OCHRE):
    """The large woody leaf 'like the ears of the Zorlop': broad, ribbed, notched at the tip."""
    ca, sa = math.cos(ang), math.sin(ang)

    def T(u, v):
        return (x + u * ca - v * sa, y + u * sa + v * ca)
    w = L * 0.3
    out = [T(0, 0), T(L * .2, -w * .8), T(L * .55, -w), T(L * .85, -w * .6), T(L, -w * .05), T(L * .93, w * .2),
           T(L * .98, w * .5), T(L * .7, w * .95), T(L * .35, w * .9), T(L * .1, w * .45)]
    a.path(a.smooth_d(out, closed=True), fill=fill, stroke=INK, stroke_width=max(1.2, L / 60), stroke_linejoin="round")
    d = []
    for k in range(1, 6):
        u = L * (0.12 + 0.15 * k)
        for s in (-1, 1):
            p0, p1 = T(u * .8, 0), T(u + L * .08, s * w * (0.75 if k < 5 else 0.4))
            d.append(f"M{f(p0[0])},{f(p0[1])}Q{f((p0[0] + p1[0]) / 2 + sa * 3)},{f((p0[1] + p1[1]) / 2)} {f(p1[0])},{f(p1[1])}")
    p0, p1 = T(-L * .12, 0), T(L * .9, 0)
    d.append(f"M{f(p0[0])},{f(p0[1])}L{f(p1[0])},{f(p1[1])}")
    a.path("".join(d), fill="none", stroke=INK, stroke_width=max(0.9, L / 110), opacity=0.75, stroke_linecap="round")


def vine(a, pts, color=SAGE_D, w=3.0, leaves=6, lsize=22, lfill=SAGE, side=1, tendril=True):
    """A stem through pts with alternating leaves; returns the dense stem points."""
    c = crom(pts, 8)
    a.path(pd(c), fill="none", stroke=color, stroke_width=w, stroke_linecap="round", stroke_linejoin="round")
    n = len(c)
    for k in range(leaves):
        i = int((k + 0.6) * (n - 2) / leaves)
        x, y = c[i]
        x1, y1 = c[min(n - 1, i + 2)]
        ang = math.atan2(y1 - y, x1 - x) + side * (1 if k % 2 else -1) * 1.0
        leaf(a, x, y, lsize * a.rng.uniform(0.8, 1.15), ang, fill=lfill, lw=1.1)
    if tendril:
        x, y = c[-1]
        a.path(f"M{f(x)},{f(y)} q{f(side * 10)},-12 {f(side * 2)},-18 q{f(-side * 8)},-4 {f(-side * 6)},4 q2,6 6,3",
               fill="none", stroke=color, stroke_width=w * .6, stroke_linecap="round")
    return c


def stip(a, x, y, w, h, n=200, r=(0.6, 1.6), fill=INK, opacity=1.0, density=None):
    """Cheap stipple: round-capped zero-length strokes, in three size buckets (about 12 bytes a dot)."""
    buckets = [[], [], []]
    for _ in range(n):
        px, py = x + a.rng.random() * w, y + a.rng.random() * h
        if density and a.rng.random() > density(px, py):
            continue
        buckets[a.rng.choice((0, 0, 0, 1, 1, 2))].append(f"M{px:.0f},{py:.0f}h0")
    for k, b in enumerate(buckets):
        if b:
            a.path("".join(b), fill="none", stroke=fill, stroke_width=f(2 * (r[0] + (r[1] - r[0]) * k / 2)),
                   stroke_linecap="round", opacity=opacity)


def sand(a, x, y, w, h, n=300, density=None, r=(0.5, 1.5), op=0.9):
    """Silver sand with ochre grains in it."""
    stip(a, x, y, w, h, int(n * .6), r, "#AEB4C0", op, density)
    stip(a, x, y, w, h, int(n * .25), r, OCHRE, op, density)
    stip(a, x, y, w, h, int(n * .15), (r[0], r[1] * .8), "#FFFFFF", op * .85, density)


def sand_pile(a, cx, base, wd, ht, n=260):
    """A small drift of silver sand sitting on a line."""
    d = f"M{f(cx - wd)},{f(base)} Q{f(cx - wd * .3)},{f(base - ht * 1.5)} {f(cx + wd * .15)},{f(base - ht)} Q{f(cx + wd * .6)},{f(base - ht * .5)} {f(cx + wd)},{f(base)}Z"
    a.path(d, fill="#D5D8DF", stroke=INK2, stroke_width=0.8, opacity=0.95)
    cl = a.clip(f'<path d="{d}"/>')
    a.open("g", clip_path=cl)
    sand(a, cx - wd, base - ht * 1.3, wd * 2, ht * 1.3, n=n, r=(0.5, 1.3))
    a.close()


def gear_d(cx, cy, r, teeth=None, depth=9, rot=0.0):
    n = teeth or max(8, int(r / 6.5))
    pts = []
    for i in range(n):
        a0 = rot + 2 * math.pi * i / n
        step = 2 * math.pi / n
        for t, rr in ((0.0, r - depth / 2), (0.18, r + depth / 2), (0.5, r + depth / 2), (0.68, r - depth / 2)):
            ang = a0 + t * step
            pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    return pd(pts, closed=True)


def gear(a, cx, cy, r, fill=BRASS, rot=0.0, depth=9, dark=BRASS_D, light=BRASS_L, hole="#1E1510"):
    a.path(gear_d(cx, cy, r, depth=depth, rot=rot), fill=fill, stroke="#3A2A12", stroke_width=max(1.2, r / 30),
           stroke_linejoin="round")
    a.circle(cx, cy, r - depth - 2, fill="none", stroke=dark, stroke_width=max(1.5, r / 22))
    a.circle(cx, cy, r * 0.6, fill=dark)
    nsp = 5 if r > 50 else 4
    for k in range(nsp):
        t = rot + 2 * math.pi * k / nsp
        a.circle(cx + r * 0.37 * math.cos(t), cy + r * 0.37 * math.sin(t), r * 0.15, fill=hole)
    a.circle(cx, cy, r * 0.2, fill=STEEL, stroke="#3A2A12", stroke_width=1.3)
    a.circle(cx, cy, max(2, r * 0.06), fill="#2A1C12")
    a.path(f"M{f(cx - r + depth + 3)},{f(cy)} A{f(r - depth - 3)},{f(r - depth - 3)} 0 0,1 {f(cx)},{f(cy - r + depth + 3)}",
           fill="none", stroke=light, stroke_width=max(1.5, r / 26), opacity=0.7, stroke_linecap="round")


def arc_arrow(a, cx, cy, r, cw, color=VERD, w=4):
    a0, a1 = (-2.4, -0.6) if cw else (-0.6, -2.4)
    x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
    x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
    a.path(f"M{f(x0)},{f(y0)} A{f(r)},{f(r)} 0 0,{1 if cw else 0} {f(x1)},{f(y1)}", fill="none", stroke=color,
           stroke_width=w, stroke_linecap="round")
    t = a1 + (math.pi / 2 if cw else -math.pi / 2)
    hx, hy = math.cos(t), math.sin(t)
    nx, ny = -hy, hx
    s = w * 3
    a.poly([(x1 + hx * s, y1 + hy * s), (x1 + nx * s * .6, y1 + ny * s * .6), (x1 - nx * s * .6, y1 - ny * s * .6)], fill=color)


def wedge(a, x, y, ang=0.0, s=1.0, dark=CLAY_D, deep="#5A3820", light=CLAY_L, sharp=False):
    """One pressed cuneiform wedge: a triangular head and a tapering tail."""
    ca, sa = math.cos(ang), math.sin(ang)

    def T(u, v):
        return (x + (u * ca - v * sa) * s, y + (u * sa + v * ca) * s)
    a.poly([T(0, -7), T(0, 7), T(11, 0)], fill=dark)
    a.poly([T(0, -7), T(11, 0), T(3, -1)], fill=deep)
    a.poly([T(9, -1.6), T(26, -0.4), T(26, 0.4), T(9, 1.6)], fill=dark)
    p, q = T(0, 7), T(11, 0)
    a.line(p[0], p[1], q[0], q[1], stroke=light, stroke_width=1.6 if sharp else 1)
    if sharp:
        p, q = T(-1.5, -8), T(-1.5, 8)
        a.line(p[0], p[1], q[0], q[1], stroke=light, stroke_width=1.4)


def wedges_d(a, x0, x1, cy, spread=12, s=0.8, gap=(8, 20)):
    """A register's worth of wedge signs between x0 and x1, as (x, y, ang, s) tuples."""
    out = []
    x = x0
    while x < x1 - 30:
        sw = a.rng.uniform(34, 66)
        for _ in range(a.rng.randint(2, 4)):
            out.append((x + a.rng.uniform(0, max(1, sw - 24)), cy + a.rng.uniform(-spread, spread * .7),
                        a.rng.choice([0, 0, 0, math.pi / 2, math.pi / 4, -math.pi / 4]), s * a.rng.uniform(0.8, 1.05)))
        x += sw + a.rng.uniform(*gap)
    return out


def fleuron(a, cx, cy, s=1.0, rot=0, fill=GOLD, eye=LEATHER, petals=4):
    a.open("g", transform=f"translate({f(cx)} {f(cy)}) rotate({rot}) scale({f(s)})")
    for k in range(petals):
        t = k * 360 / petals
        a.path("M0,0 C10,-14 8,-34 0,-46 C-8,-34 -10,-14 0,0Z", fill=fill, transform=f"rotate({f(t)})")
        a.path("M0,0 C14,-6 26,-4 30,-18 C18,-20 8,-14 0,0Z", fill=fill, transform=f"rotate({f(t + 180 / petals)})")
    a.circle(0, 0, 6, fill=eye, stroke=fill, stroke_width=2)
    a.close()


def whiplash(a, x, y, sx, sy, s=1.0, ink=INK, gold_=GOLD_D, leaf_fill=SAGE):
    """An art nouveau corner tendril."""
    pts = [(0, 0), (90, 10), (150, 70), (120, 140), (60, 120), (80, 80), (130, 90)]
    pen(a, [(x + sx * u * s, y + sy * v * s) for u, v in pts], w=5 * s + 1, color=ink, taper=(0.05, 0.5))
    pts2 = [(0, 0), (20, 100), (80, 170), (190, 170), (230, 120)]
    pen(a, [(x + sx * u * s, y + sy * v * s) for u, v in pts2], w=3 * s + 0.6, color=gold_, taper=(0.05, 0.5))
    for u, v in ((150, 70), (80, 170), (190, 170)):
        cx, cy = x + sx * u * s, y + sy * v * s
        a.path(f"M{f(cx)},{f(cy)} q{f(sx * 22 * s)},{f(-sy * 26 * s)} {f(sx * 46 * s)},{f(-sy * 6 * s)} "
               f"q{f(-sx * 22 * s)},{f(sy * 26 * s)} {f(-sx * 46 * s)},{f(sy * 6 * s)}Z", fill=leaf_fill, stroke=ink,
               stroke_width=1.2)


def cup_side(a, cx, base, s=1.0, tea=0.8, body=VELLUM, band=SAGE, line=INK, saucer=True, tea_col="#8C6A2A", steam=False):
    """Elaris's cup from the side: a wide low bowl with one sage band, a small handle, an optional saucer.
    `base` is the y the cup stands on; tea is 0..1."""
    w, h = 62 * s, 54 * s
    top = base - h - (6 * s if saucer else 0)
    bot = base - (6 * s if saucer else 0)
    if saucer:
        a.ellipse(cx, base - 3 * s, w * 0.95, 7 * s, fill=body, stroke=line, stroke_width=1.6 * s)
    d = (f"M{f(cx - w / 2)},{f(top)} C{f(cx - w / 2)},{f(top + h * .75)} {f(cx - w * .32)},{f(bot)} {f(cx - w * .16)},{f(bot)} "
         f"L{f(cx + w * .16)},{f(bot)} C{f(cx + w * .32)},{f(bot)} {f(cx + w / 2)},{f(top + h * .75)} {f(cx + w / 2)},{f(top)}Z")
    # handle
    a.path(f"M{f(cx + w * .47)},{f(top + h * .16)} c{f(22 * s)},{f(-4 * s)} {f(24 * s)},{f(26 * s)} {f(-6 * s)},{f(30 * s)}",
           fill="none", stroke=line, stroke_width=6 * s, stroke_linecap="round")
    a.path(f"M{f(cx + w * .47)},{f(top + h * .16)} c{f(22 * s)},{f(-4 * s)} {f(24 * s)},{f(26 * s)} {f(-6 * s)},{f(30 * s)}",
           fill="none", stroke=body, stroke_width=3 * s, stroke_linecap="round")
    a.path(d, fill=body, stroke=line, stroke_width=1.8 * s, stroke_linejoin="round")
    cl = a.clip(f'<path d="{d}"/>')
    a.open("g", clip_path=cl)
    a.rect(cx - w / 2, top + h * .3, w, h * .16, fill=band, opacity=.9)
    a.rect(cx - w / 2, top, w * .22, h, fill="#fff", opacity=.35)
    a.rect(cx + w * .22, top, w * .3, h, fill=INK2, opacity=.16)
    a.close()
    a.ellipse(cx, top, w / 2, 7 * s, fill="#E9DFC4", stroke=line, stroke_width=1.6 * s)
    if tea > 0:
        k = 0.55 + 0.4 * tea
        a.ellipse(cx, top + (1 - tea) * 5 * s + 1.5 * s, w / 2 * k, 5.2 * s * k, fill=tea_col, opacity=0.92)
        a.path(f"M{f(cx - w * .2 * k)},{f(top + 1 * s)} q{f(w * .12)},{f(-2.5 * s)} {f(w * .24)},0", fill="none", stroke=GOLD_L,
               stroke_width=1.2 * s, opacity=.8, stroke_linecap="round")
    if steam:
        for k in (-1, 0, 1):
            x = cx + k * 12 * s
            curve(a, [(x, top - 8 * s), (x - 6 * s, top - 24 * s), (x + 6 * s, top - 40 * s), (x - 3 * s, top - 58 * s)],
                  w=1.5 * s, color=INK2, opacity=.5)
    return top


def cup_top(a, cx, cy, r, tea=1.0, tea_col="#8C6A2A", body=VELLUM, line=INK, leaves=8):
    """The cup from above: rim, tea, a few floating leaves, the handle to the right."""
    a.path(f"M{f(cx + r * .9)},{f(cy - r * .22)} c{f(r * .55)},{f(-r * .1)} {f(r * .55)},{f(r * .54)} 0,{f(r * .44)}",
           fill="none", stroke=line, stroke_width=r * .2, stroke_linecap="round")
    a.path(f"M{f(cx + r * .9)},{f(cy - r * .22)} c{f(r * .55)},{f(-r * .1)} {f(r * .55)},{f(r * .54)} 0,{f(r * .44)}",
           fill="none", stroke=body, stroke_width=r * .12, stroke_linecap="round")
    a.circle(cx, cy, r, fill=body, stroke=line, stroke_width=max(1.6, r * .035))
    a.circle(cx, cy, r * .86, fill="#E6DBBC", stroke=INK2, stroke_width=1)
    if tea > 0:
        rr = r * (0.42 + 0.4 * tea)
        a.circle(cx, cy, rr, fill=a.radial([(0, "#A98838", 1), (0.7, tea_col, 1), (1, "#5E4418", 1)], 0.42, 0.4, 0.62))
        for _ in range(leaves):
            t, q = a.rng.uniform(0, 6.28), a.rng.uniform(0, rr * .75)
            x, y = cx + q * math.cos(t), cy + q * math.sin(t)
            a.path(leaf_d(x, y, r * .16, a.rng.uniform(0, 6.28), 0.3), fill=SAGE_D, opacity=.85)
        a.path(f"M{f(cx - rr * .7)},{f(cy - rr * .35)} A{f(rr)},{f(rr)} 0 0,1 {f(cx - rr * .1)},{f(cy - rr * .8)}", fill="none",
               stroke="#fff", stroke_width=max(1.5, r * .04), opacity=.45, stroke_linecap="round")
    else:
        a.circle(cx, cy, r * .5, fill="#DDD0AC", stroke=INK2, stroke_width=.8, opacity=.8)
        a.stipple(cx - r * .4, cy - r * .3, r * .8, r * .7, n=40, r=(0.8, 2), fill="#6E5A2A", opacity=.7,
                  density=lambda x, y: 1 - math.hypot(x - cx - r * .1, y - cy - r * .1) / (r * .45))


def tea_ring(a, cx, cy, r, color="#8C6A2A", op=0.5, gap=0.0, wd=None):
    """The ring a cup leaves on a table: an uneven, broken stain."""
    wd = wd or r * 0.09
    rough = a.roughen(max(2, r * .05), 0.05)
    dash = None
    if gap:
        c = 2 * math.pi * r
        dash = f"{f(c * (1 - gap) * .6)} {f(c * gap * .5)} {f(c * (1 - gap) * .4)} {f(c * gap * .5)}"
    a.circle(cx, cy, r, fill="none", stroke=color, stroke_width=wd, opacity=op, filter=rough, stroke_dasharray=dash)
    a.circle(cx + r * .02, cy + r * .015, r * 1.045, fill="none", stroke=color, stroke_width=wd * .3, opacity=op * 1.3,
             filter=rough, stroke_dasharray=dash)
    a.circle(cx, cy, r * .93, fill=color, opacity=op * .1, filter=rough)


def gold_text(a, x, y, s, size, g=None, shadow="#1A0B05", spacing=2, anchor="middle", weight="bold", family="serif", **kw):
    """Tooled lettering: a pressed shadow, the gold, a thin highlight."""
    g = g or gold(a)
    base = dict(size=size, family=family, text_anchor=anchor, letter_spacing=spacing, font_weight=weight, **kw)
    a.text(x + size * .035, y + size * .05, s, fill=shadow, opacity=.75, **base)
    a.text(x, y, s, fill=g, **base)
    a.text(x - size * .012, y - size * .018, s, fill="none", stroke=GOLD_L, stroke_width=max(.4, size * .012), opacity=.6, **base)


def hand(a, x, y, s, size=26, color="#3B2A4A", rot=-2.0, anchor="start", **kw):
    """Maudric's hand: a slanted, slightly uneven cursive in purple-brown ink."""
    a.text(x, y, s, size=size, family="cursive", fill=color, font_style="italic", text_anchor=anchor,
           transform=f"rotate({f(rot + a.rng.uniform(-.6, .6))} {f(x)} {f(y)})", **kw)


def fillet(a, x, y, w, h, g, wd=4, inner=10, rx=0):
    """A bookbinder's thick-thin gold fillet."""
    a.rect(x, y, w, h, fill="none", stroke=g, stroke_width=wd, rx=rx)
    a.rect(x + inner, y + inner, w - 2 * inner, h - 2 * inner, fill="none", stroke=g, stroke_width=max(.8, wd * .3),
           rx=max(0, rx - inner * .6))


def roll(a, x, y, w, h, g, step=20, size=4.5):
    """A stamped diamond roll around a rectangle."""
    d = []
    n = max(1, int(w / step))
    for i in range(n + 1):
        px = x + w * i / n
        for py in (y, y + h):
            d.append(f"M{f(px)},{f(py - size)}l{f(size)},{f(size)}l{f(-size)},{f(size)}l{f(-size)},{f(-size)}Z")
    m = max(1, int(h / step))
    for j in range(1, m):
        py = y + h * j / m
        for px in (x, x + w):
            d.append(f"M{f(px)},{f(py - size)}l{f(size)},{f(size)}l{f(-size)},{f(size)}l{f(-size)},{f(-size)}Z")
    a.path("".join(d), fill=g)


def sunbeam(a, x0, y0, x1, y1, w0, w1, color=GOLD_L, op=0.35):
    """One warm shaft of light from (x0, y0) to (x1, y1)."""
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L, dx / L
    gid = a.uid("beam")
    a.defn(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{f(x0)}" y1="{f(y0)}" x2="{f(x1)}" y2="{f(y1)}">'
           f'<stop offset="0" stop-color="{color}" stop-opacity="{f(op)}"/><stop offset="1" stop-color="{color}" stop-opacity="0"/>'
           f'</linearGradient>')
    a.poly([(x0 + nx * w0, y0 + ny * w0), (x0 - nx * w0, y0 - ny * w0), (x1 - nx * w1, y1 - ny * w1), (x1 + nx * w1, y1 + ny * w1)],
           fill=f"url(#{gid})")


def limb(a, pts, w, fill, line=INK, lw=1.8, smooth=True):
    """An outlined limb: a round-capped stroke in the line colour under a narrower one in the fill."""
    d = a.smooth_d(pts) if smooth else pd(pts)
    a.path(d, fill="none", stroke=line, stroke_width=w + 2 * lw, stroke_linecap="round", stroke_linejoin="round")
    a.path(d, fill="none", stroke=fill, stroke_width=w, stroke_linecap="round", stroke_linejoin="round")


def shape(a, pts, fill, line=INK, lw=2.0, closed=True, **kw):
    a.path(a.smooth_d(pts, closed=closed), fill=fill, stroke=line, stroke_width=lw, stroke_linejoin="round", **kw)

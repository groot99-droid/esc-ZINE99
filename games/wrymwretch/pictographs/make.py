"""Wrymwretch gameplay pictographs. Built by tools/pictographs/build.py.

Seven pages, seven styles (docs/graphic_styles.json): ink-wash scroll, erased graphite, gilded star
atlas, illuminated initials, stained glass, Byzantine mosaic and low-poly crystal. All keep the
game's realm palette (DESIGN.md section 15).
"""
import math

from core import H, W, Pic, f, register

G = "wrymwretch"

# realm palette (DESIGN.md section 15)
MOSS, AMBER = "#4f6b2e", "#d79a2b"          # West
PALEBLUE, SILVER = "#a9c8e4", "#c7ccd3"     # North
OCHRE, MOLTEN = "#c88a2e", "#e8571c"        # South
SEA, PEARL = "#1f5f8b", "#eae4d6"           # East
VIOLET, OBSIDIAN = "#5b3a7a", "#1a1520"     # Below
GOLD, STARWHITE = "#d4a72c", "#fbf6e4"      # Above
SUNGOLD, MOONSILVER, BONE = "#e2b33c", "#d9dde2", "#f3eee2"   # Wrymreach
PAPER, GRAPHITE = "#f1e8d6", "#45464a"      # forgetting
REALMS = [(MOSS, AMBER), (PALEBLUE, SILVER), (OCHRE, MOLTEN), (SEA, PEARL), (VIOLET, OBSIDIAN), (GOLD, STARWHITE)]


# ---- shared helpers ----------------------------------------------------------------------------
def catmull(pts, n=10):
    """Sample a Catmull-Rom curve through pts."""
    q = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(q) - 2):
        p0, p1, p2, p3 = q[i - 1], q[i], q[i + 1], q[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(pts[-1])
    return out


def brush_poly(p, pts, width, profile=lambda t: math.sin(math.pi * t) ** 0.6, jitter=0.6, n=12):
    """A tapered brush stroke along a curve, as a polygon."""
    c = catmull(pts, n)
    left, right = [], []
    for i, (x, y) in enumerate(c):
        a = c[max(0, i - 1)]
        b = c[min(len(c) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        w = width * max(0.04, profile(i / (len(c) - 1))) / 2
        w *= 1 + p.rng.uniform(-0.12, 0.12)
        left.append((x + nx * w + p.rng.uniform(-jitter, jitter), y + ny * w))
        right.append((x - nx * w, y - ny * w + p.rng.uniform(-jitter, jitter)))
    return left + right[::-1]


def pd(pts, close=True):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if close else "")


def ridge(rng, x0, x1, base, amp, rough=0.55, levels=7):
    """Midpoint-displacement ridgeline."""
    n = 2 ** levels
    ys = [0.0] * (n + 1)
    ys[0], ys[n] = rng.uniform(-amp, amp) * .3, rng.uniform(-amp, amp) * .3
    step, scale = n, amp
    while step > 1:
        half = step // 2
        for i in range(half, n, step):
            ys[i] = (ys[i - half] + ys[i + half]) / 2 + rng.uniform(-scale, scale)
        step, scale = half, scale * rough
    return [(x0 + (x1 - x0) * i / n, base + ys[i]) for i in range(n + 1)]


def split_poly(poly, px, py, dx, dy):
    """Cut a convex polygon by a line; returns the two halves (either may be short)."""
    a, b = [], []
    m = len(poly)
    for i in range(m):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % m]
        s1 = (x1 - px) * dy - (y1 - py) * dx
        s2 = (x2 - px) * dy - (y2 - py) * dx
        (a if s1 >= 0 else b).append((x1, y1))
        if (s1 >= 0) != (s2 >= 0):
            t = s1 / (s1 - s2)
            q = (x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)
            a.append(q)
            b.append(q)
    return a, b


def area(poly):
    return abs(sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1]
                   for i in range(len(poly)))) / 2


def shatter(rng, poly, cuts):
    """Split a convex polygon into pieces by random cuts through its biggest pieces."""
    pieces = [poly]
    for _ in range(cuts):
        pieces.sort(key=area)
        big = pieces.pop()
        cx = sum(x for x, _ in big) / len(big)
        cy = sum(y for _, y in big) / len(big)
        ang = rng.uniform(0, math.pi)
        a, b = split_poly(big, cx + rng.uniform(-8, 8), cy + rng.uniform(-8, 8), math.cos(ang), math.sin(ang))
        pieces += [x for x in (a, b) if len(x) >= 3]
    return pieces


def shade(hexc, k):
    """Lighten (k>0) or darken (k<0) a hex colour."""
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5))
    if k >= 0:
        r, g, b = (int(c + (255 - c) * k) for c in (r, g, b))
    else:
        r, g, b = (int(c * (1 + k)) for c in (r, g, b))
    return f"#{r:02x}{g:02x}{b:02x}"


def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{int(x + (y - x) * t):02x}" for x, y in zip(a, b))


def in_poly(x, y, poly):
    inside = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


# ---- 2D: Twin flight -----------------------------------------------------------------------------
@register(G, "twin-flight")
def twin_flight(p: Pic):
    """Twin flight (2D): a side-scrolling flight painted as an ink-wash handscroll. Aetherius, a dragon
    in a few brush strokes with Aeris on his back, rides a pale-blue current the player has drawn with
    the gift Turn the wind, past a dark crosswind gust; mountains fade into mist below. The ribbon at
    the top shows how far along the scroll the pair has flown toward the far peak, the ink rings mark
    scale hits taken, and the brush bar is the stamina left for wing beats."""
    r = p.rng
    # silk mount and rollers
    p.rect(0, 0, W, H, fill="#2e241c")
    p.rect(0, 0, W, H, fill=p.gradient([(0, "#3a2c20"), (0.5, "#2a2019"), (1, "#3a2c20")], 0, 0, 1, 0))
    px0, px1, py0, py1 = 54, 1146, 34, 766
    p.rect(px0 - 6, py0 - 6, px1 - px0 + 12, py1 - py0 + 12, fill="#8c6f45")
    p.rect(px0, py0, px1 - px0, py1 - py0, fill="#efe6d1")
    gid = p.uid("grain")
    p.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="0.012 0.35" numOctaves="3" seed="{p.seed % 997}"/>'
           f'<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.25  0 0 0 0.22 0"/></filter>')
    p.rect(px0, py0, px1 - px0, py1 - py0, filter=f"url(#{gid})")
    for x in (px0 - 24, px1 + 4):
        p.rect(x, py0 - 26, 20, py1 - py0 + 52, rx=6, fill=p.gradient([(0, "#2a1a10"), (0.5, "#7a5634"), (1, "#2a1a10")], 0, 0, 1, 0))
    clip = p.clip(f'<rect x="{px0}" y="{py0}" width="{px1 - px0}" height="{py1 - py0}"/>')
    p.open("g", clip_path=clip)
    # sky wash
    p.rect(px0, py0, px1 - px0, 300, fill=p.gradient([(0, "#c9c6bb"), (1, "#efe6d1")]), opacity=0.55)
    # mountains: far to near, each wash fading into mist at its foot
    layers = [(330, 150, 0.16, 6), (420, 170, 0.28, 3.5), (520, 150, 0.45, 2), (640, 110, 0.78, 0.8)]
    for i, (base, amp, op, bl) in enumerate(layers):
        pts = ridge(r, px0 - 40, px1 + 40, base, amp, rough=0.58 - i * 0.03)
        # sharpen into peaks
        pts = [(x, y - amp * 0.9 * max(0, math.sin(x / (90 + 40 * i) + i * 1.7)) ** 3) for x, y in pts]
        lg = p.uid("mist")
        p.defn(f'<linearGradient id="{lg}" x1="0" y1="0" x2="0" y2="1">'
               f'<stop offset="0%" stop-color="#1c1b1a" stop-opacity="{f(op)}"/>'
               f'<stop offset="45%" stop-color="#2a2928" stop-opacity="{f(op * 0.55)}"/>'
               f'<stop offset="100%" stop-color="#2a2928" stop-opacity="0"/></linearGradient>')
        d = pd(pts, close=False) + f" L{px1 + 40},{base + amp + 120} L{px0 - 40},{base + amp + 120}Z"
        p.path(d, fill=f"url(#{lg})", filter=p.blur(bl))
        # dry-brush texture strokes (cun) on the near slopes
        if i >= 2:
            for _ in range(70):
                k = r.randrange(len(pts))
                x, y = pts[k]
                L = r.uniform(18, 50)
                p.path(f"M{f(x)},{f(y + r.uniform(4, 30))} q{f(-L * .3)},{f(L * .5)} {f(-L * .1)},{f(L)}",
                       fill="none", stroke="#1c1b1a", stroke_width=r.uniform(0.8, 2.2), opacity=op * 0.5)
    # mist bands
    for y in (470, 585, 690):
        p.ellipse(600 + r.uniform(-200, 200), y, 700, 34, fill="#efe6d1", opacity=0.75, filter=p.blur(14))
    # foreground cliff with a pine, lower left
    cliff = [(px0 - 10, 640), (140, 600), (230, 640), (300, 720), (320, py1 + 10), (px0 - 10, py1 + 10)]
    p.path(p.smooth_d(cliff, closed=True), fill="#1c1b1a", opacity=0.85, filter=p.blur(1.2))
    trunk = [(150, 650), (172, 590), (160, 540), (196, 480), (230, 450)]
    p.path(pd(brush_poly(p, trunk, 22, profile=lambda t: 1 - 0.7 * t)), fill="#151413")
    tc = catmull(trunk, 6)
    for k, idx in enumerate((8, 12, 16, 20, 23)):
        bx, by = tc[idx]
        side = 1 if k % 2 == 0 else -1
        reach = 90 - k * 12
        bend = [(bx, by), (bx + side * reach * 0.5, by - 8), (bx + side * reach, by - 4)]
        p.path(pd(brush_poly(p, bend, 7, profile=lambda t: 1 - 0.8 * t)), fill="#151413")
        # needle clump: a flat fan of short dry strokes
        nx, ny = bx + side * reach * 0.7, by - 10
        for j in range(26):
            a = math.radians(-90 + r.uniform(-75, 75))
            L = r.uniform(14, 34)
            p.line(nx + r.uniform(-reach * .35, reach * .35), ny + r.uniform(-4, 6),
                   nx + L * math.cos(a) * 0.9, ny + L * math.sin(a) * 0.45, stroke="#151413",
                   stroke_width=r.uniform(1, 2.6), stroke_linecap="round", opacity=0.75)
    # the current Aetherius has turned: pale-blue wash ribbon with curling ends
    cur = [(260, 470), (420, 430), (600, 360), (790, 330), (960, 360), (1120, 320)]
    p.path(pd(brush_poly(p, cur, 46, profile=lambda t: 0.4 + 0.6 * math.sin(math.pi * t)), True),
           fill=PALEBLUE, opacity=0.55, filter=p.blur(3))
    for off in (-10, 4, 16):
        p.path(p.smooth_d([(x, y + off) for x, y in cur]), fill="none", stroke="#6f9cc6",
               stroke_width=1.6, stroke_dasharray="26 12", opacity=0.8)
    for cx, cy in [(300, 462), (1080, 330)]:
        sp = [(cx + 6 * t * math.cos(t * 1.1), cy + 6 * t * math.sin(t * 1.1)) for t in [i / 3 for i in range(30)]]
        p.path(p.smooth_d(sp), fill="none", stroke="#6f9cc6", stroke_width=2)
    # crosswind gust coming against the pair (hazard): dark dry-brush streaks
    for k in range(9):
        y0 = 210 + k * 9 + r.uniform(-3, 3)
        x0 = 860 + r.uniform(-20, 30)
        p.path(pd(brush_poly(p, [(x0 + 260, y0 - 10), (x0 + 120, y0 + 4), (x0, y0 - 6)], r.uniform(3, 8)), True),
               fill="#1c1b1a", opacity=r.uniform(0.35, 0.75))
    p.path("M870,214 q-40,10 -30,40 q10,22 34,8", fill="none", stroke="#1c1b1a", stroke_width=4, stroke_linecap="round")
    # Aetherius: body in one sweeping stroke, wings in two, head and whiskers
    ink = "#121110"
    body = [(380, 400), (450, 360), (530, 390), (610, 360), (680, 320), (740, 300), (790, 296)]
    p.path(pd(brush_poly(p, body, 44, profile=lambda t: (0.15 + t * 0.85) ** 0.8 * min(1, (1 - t) * 6 + .35))), fill=ink)
    tail = [(380, 400), (330, 420), (290, 400), (270, 370)]
    p.path(pd(brush_poly(p, tail, 18, profile=lambda t: 1 - t)), fill=ink)
    # dry tail-tip strokes
    for j in range(5):
        p.path(f"M{270 + j},{370 - j * 2} q-14,-18 -6,-36", fill="none", stroke=ink, stroke_width=1.2, opacity=0.6)
    wing1 = [(600, 360), (560, 260), (500, 190), (430, 170)]
    wing2 = [(640, 345), (650, 240), (700, 170), (760, 140)]
    for wg, wd in ((wing1, 34), (wing2, 30)):
        p.path(pd(brush_poly(p, wg, wd, profile=lambda t: (1 - t) ** 0.7 + 0.05)), fill=ink, opacity=0.92)
        # trailing feathering of a half-dry brush
        c = catmull(wg, 4)
        for k in range(len(c) - 1):
            x, y = c[k]
            p.line(x, y, x - r.uniform(30, 60), y + r.uniform(40, 80), stroke=ink, stroke_width=r.uniform(0.6, 1.8), opacity=0.35)
    p.path("M790,296 q30,-14 52,0 q-14,10 -34,16 q-18,0 -18,-16z", fill=ink)
    p.circle(812, 293, 3.2, fill="#efe6d1")
    for w in (1, -1):
        p.path(f"M840,{298 + w * 2} q40,{w * 20} 80,{w * 6}", fill="none", stroke=ink, stroke_width=1.6, stroke_linecap="round")
    # Aeris riding: a few strokes, scarf streaming in North blue
    p.path(pd(brush_poly(p, [(660, 318), (664, 290), (668, 270)], 12)), fill=ink)
    p.circle(669, 262, 7, fill=ink)
    p.path(pd(brush_poly(p, [(668, 276), (640, 270), (610, 280), (590, 268)], 8, profile=lambda t: 1 - 0.8 * t)), fill="#4a7fb0")
    # wing-beat puffs under the wings
    for k in range(3):
        p.path(f"M{560 + k * 30},{420 + k * 8} q10,10 22,0", fill="none", stroke="#6f9cc6", stroke_width=2, opacity=0.7)
    p.close()
    # HUD in the scroll's own idiom: progress ribbon with the far peak at its end
    p.line(120, 62, 1060, 62, stroke="#3a3936", stroke_width=2)
    p.path("M1060,62 l20,-26 l14,14 l12,-20 l22,32z", fill="#1c1b1a")
    pos = 120 + (1060 - 120) * 0.46
    p.line(120, 62, pos, 62, stroke="#1c1b1a", stroke_width=6, stroke_linecap="round")
    p.path(f"M{f(pos - 10)},62 q10,-16 22,-4 q-10,2 -22,4z", fill="#1c1b1a")
    for k, fill in enumerate([1, 0, 0]):
        cx = 110 + k * 46
        p.circle(cx, 110, 15, fill="#a42a1c" if fill else "none", stroke="#1c1b1a", stroke_width=3, opacity=0.85)
    p.text(84, 150, "SCALE HITS", size=14, family="serif", fill="#3a3936", letter_spacing=2)
    # stamina brush bar
    p.path(pd(brush_poly(p, [(84, 186), (200, 184), (260, 187)], 14, profile=lambda t: 0.9 - 0.5 * t)), fill="#1c1b1a")
    p.rect(84, 178, 260, 16, fill="none", stroke="#3a3936", stroke_width=1, opacity=0.5)
    p.text(84, 214, "STAMINA", size=14, family="serif", fill="#3a3936", letter_spacing=2)
    # red seal
    p.rect(1050, 640, 64, 64, fill="#a42a1c", rx=4, filter=p.roughen(3, 0.08))
    p.path("M1062,654 h40 M1082,654 v40 M1064,676 h36 M1066,694 h32", stroke="#efe6d1", stroke_width=5, fill="none")


# ---- 2D: Forgetting run -------------------------------------------------------------------------
@register(G, "forgetting-run")
def forgetting_run(p: Pic):
    """Forgetting run (2D): a side-on run drawn in graphite on paper. On the left a wall of blank paper
    is erasing the world, leaving eraser crumbs where the ground was; the runner leaps onto the stretch
    of path they are holding Recall on, drawn solid and dark. Ahead the path is only a faint outline
    until it is remembered, a lit touchstone lantern refills Focus, and the outpost gates at the right
    edge are still only half inked in."""
    r = p.rng
    p.paper(PAPER, grain=0.14, fibre=1.1)
    EDGE = 300
    lead = dict(stroke=GRAPHITE, fill="none", stroke_linecap="round")

    def strength(x):
        """How remembered the world is at x: erased behind the edge, dense round the runner, faint ahead."""
        if x < EDGE:
            return 0.0
        if x < EDGE + 120:
            return (x - EDGE) / 120 * 0.9
        if x < 780:
            return 0.9
        return max(0.12, 0.9 - (x - 780) / 300)

    # sketched hills behind: hatching whose density follows memory
    hill = ridge(r, 0, W, 330, 70, 0.5, 6)
    strokes = []
    for _ in range(2600):
        x = r.uniform(EDGE - 30, W)
        hy = min(y for (hx, y) in hill if abs(hx - x) < 12) if True else 0
        y = r.uniform(hy, 560)
        s = strength(x)
        if r.random() > s * (1 - (y - hy) / 300):
            continue
        L = r.uniform(6, 16)
        strokes.append(f"M{f(x)},{f(y)}l{f(L * .7)},{f(-L * .7)}")
    p.path("".join(strokes), stroke=GRAPHITE, stroke_width=0.8, opacity=0.45, fill="none")
    # hill contour, broken where memory thins
    seg = []
    for (x, y) in hill:
        if r.random() < strength(x) + 0.05:
            seg.append((x, y))
        elif len(seg) > 1:
            p.wobble(seg, amp=1.2, step=10, stroke_width=1.6, opacity=0.8, **lead)
            seg = []
        else:
            seg = []
    if len(seg) > 1:
        p.wobble(seg, amp=1.2, step=10, stroke_width=1.6, opacity=0.8, **lead)
    # sketchy trees on the hill
    for k in range(9):
        tx = EDGE + 60 + k * 95 + r.uniform(-20, 20)
        s = strength(tx)
        ty = min(y for (hx, y) in hill if abs(hx - tx) < 12)
        for j in range(int(3 + s * 5)):
            p.wobble([(tx, ty + 6), (tx + r.uniform(-3, 3), ty - 60)], amp=1.5, step=8, stroke_width=1, opacity=0.3 + s * 0.5, **lead)
            p.path(f"M{f(tx - 22)},{f(ty - 20 - j)} L{f(tx)},{f(ty - 72 - j)} L{f(tx + 22)},{f(ty - 20 - j)}",
                   stroke=GRAPHITE, stroke_width=1, fill="none", opacity=(0.25 + s * 0.4))
    # the ground: platforms
    plats = [(40, 250, 600), (290, 470, 600), (520, 760, 560), (800, 930, 520), (960, 1180, 560)]
    for x0, x1, y in plats:
        if x1 < EDGE:
            continue
        a = max(x0, EDGE)
        if x0 >= 780:   # unremembered: faint dashed outline
            p.wobble([(x0, H + 10), (x0, y), (x1, y), (x1, H + 10)], amp=1, step=16, closed=False, stroke=GRAPHITE,
                     stroke_width=1.4, fill="none", stroke_dasharray="9 8", opacity=0.45)
            continue
        if x0 >= 520:   # the stretch held by Recall: solid, cross-hatched
            p.rect(x0, y, x1 - x0, H - y, fill="#d9d2c2")
            cl = p.clip(f'<rect x="{x0}" y="{y}" width="{x1 - x0}" height="{H - y}"/>')
            p.hatch(x0, y, x1 - x0, H - y, angle=40, spacing=4, clip=cl, stroke=GRAPHITE, stroke_width=1.1, jitter=1)
            p.hatch(x0, y, x1 - x0, 40, angle=-35, spacing=5, clip=cl, stroke=GRAPHITE, stroke_width=0.9, jitter=1)
            for k in range(2):
                p.wobble([(x0 + k, y), (x0 + k, H)], amp=1, step=14, stroke_width=2, **lead)
                p.wobble([(x1 - k, y), (x1 - k, H)], amp=1, step=14, stroke_width=2, **lead)
            for k in range(3):
                p.wobble([(x0, y + k), (x1, y + k)], amp=0.8, step=12, stroke_width=2.6, **lead)
            continue
        # behind the runner: drawn but crumbling toward the edge
        cl = p.clip(f'<rect x="{a}" y="{y}" width="{x1 - a}" height="{H - y}"/>')
        p.hatch(a, y, x1 - a, H - y, angle=40, spacing=6, clip=cl, stroke=GRAPHITE, stroke_width=1, jitter=2, opacity=0.6)
        p.wobble([(a, y), (x1, y)], amp=1, step=12, stroke_width=2.2, **lead)
        p.wobble([(x1, y), (x1, H)], amp=1, step=14, stroke_width=1.8, **lead)
        # bites taken out by the edge
        for k in range(14):
            bx = a + r.uniform(0, 110) ** 1.0
            p.circle(bx, y + r.uniform(-4, H - y), r.uniform(6, 22), fill=PAPER)
    # the blank paper wall: a torn, slightly raised sheet
    edge_pts = [(EDGE + r.uniform(-14, 14) + 6 * math.sin(yy / 30), yy) for yy in range(-10, H + 20, 18)]
    sheet = [(0, -10)] + edge_pts + [(0, H + 20)]
    p.path(pd(sheet), fill="#000", opacity=0.12, filter=p.blur(8), transform="translate(8,0)")
    p.path(pd(sheet), fill="#f8f3e8")
    p.path(pd(edge_pts, close=False), fill="none", stroke="#b9b1a0", stroke_width=1.5)
    # eraser smudges and crumbs
    for _ in range(8):
        y = r.uniform(80, 760)
        p.ellipse(EDGE - r.uniform(30, 160), y, r.uniform(60, 120), r.uniform(8, 18), fill=GRAPHITE, opacity=0.06, filter=p.blur(6))
    crumbs = []
    for _ in range(140):
        x = EDGE + abs(r.gauss(0, 50)) - 10
        y = r.choice([600, 600, 560, 520]) + r.gauss(10, 22)
        rr = r.uniform(1.5, 4.5)
        crumbs.append(f"M{f(x)},{f(y)}c{f(rr)},{f(-rr)} {f(rr * 2.5)},{f(rr * .4)} {f(rr * 1.2)},{f(rr * 1.4)}"
                      f"c{f(-rr)},{f(rr * .6)} {f(-rr * 1.8)},0 {f(-rr * 1.2)},{f(-rr * 1.4)}z")
    p.path("".join(crumbs), fill="#cfc6b3", stroke="#9a917f", stroke_width=0.6)
    # speed marks: the edge is moving right
    for k in range(5):
        y = 140 + k * 110
        p.path(f"M{EDGE + 20},{y} h{40 + k * 6}", stroke=GRAPHITE, stroke_width=1.2, opacity=0.4, fill="none")
    p.path(f"M{EDGE + 80},{385} l18,0 m-8,-8 l8,8 l-8,8", stroke=GRAPHITE, stroke_width=2, fill="none", opacity=0.6)
    # recall shimmer: the solidified 6 m glints
    for k in range(10):
        x = 540 + k * 23
        p.path(f"M{x},548 l4,-14 l4,14", stroke="#8a7a50", stroke_width=1.2, fill="none", opacity=0.6)
    # the runner mid-leap, sketched in layered strokes
    rx, ry = 505, 450
    fig = [[(rx, ry - 70), (rx + 4, ry - 20)],                       # torso
           [(rx + 2, ry - 55), (rx + 34, ry - 70), (rx + 52, ry - 92)],  # arm forward
           [(rx + 2, ry - 55), (rx - 28, ry - 40), (rx - 46, ry - 52)],  # arm back
           [(rx + 4, ry - 20), (rx + 36, ry - 6), (rx + 40, ry + 22)],   # leg forward
           [(rx + 4, ry - 20), (rx - 20, ry + 6), (rx - 52, ry + 2)]]    # leg trailing
    for limb in fig:
        for k in range(3):
            p.path(p.smooth_d([(x + r.uniform(-2, 2), y + r.uniform(-2, 2)) for x, y in limb]), stroke=GRAPHITE,
                   stroke_width=4 - k, fill="none", stroke_linecap="round", opacity=0.85)
    for k in range(4):
        p.circle(rx + 2 + r.uniform(-1.5, 1.5), ry - 88 + r.uniform(-1.5, 1.5), 14, fill="none", stroke=GRAPHITE, stroke_width=1.4)
    p.circle(rx + 2, ry - 88, 13, fill="#bdb6a6", opacity=0.6)
    # cloak streaming back
    p.path(f"M{rx - 2},{ry - 72} q-40,8 -70,-6 q20,20 64,26z", fill=GRAPHITE, opacity=0.5)
    # jump arc
    p.path(f"M{rx - 120},{600} Q{rx - 40},{ry - 40} {rx + 120},{548}", fill="none", stroke=GRAPHITE,
           stroke_width=1.2, stroke_dasharray="3 7", opacity=0.6)
    # touchstone lantern on the far platform, glowing (erased highlight rays)
    lx, ly = 880, 470
    p.circle(lx, ly, 70, fill=p.radial([(0, "#f6d27a", 0.55), (1, "#f6d27a", 0)]))
    for k in range(16):
        a = 2 * math.pi * k / 16
        p.line(lx + 26 * math.cos(a), ly + 26 * math.sin(a), lx + 56 * math.cos(a), ly + 56 * math.sin(a),
               stroke=GRAPHITE, stroke_width=1, opacity=0.4)
    p.wobble([(lx - 14, ly - 18), (lx + 14, ly - 18), (lx + 18, ly + 22), (lx - 18, ly + 22)], closed=True, amp=1,
             step=8, stroke=GRAPHITE, stroke_width=2, fill="#f8e7b4")
    p.path(f"M{lx - 10},{ly - 18} q10,-22 20,0 M{lx},{ly + 22} v28", stroke=GRAPHITE, stroke_width=2, fill="none")
    p.path(f"M{lx},{ly + 10} q-6,-10 0,-20 q6,10 0,20z", fill="#c98a2a")
    # the outpost gates at the right edge, inking in from outline
    gx = 1030
    for k, (x0, x1) in enumerate([(gx, gx + 26), (gx + 104, gx + 130)]):
        p.wobble([(x0, 560), (x0, 330), (x1, 330), (x1, 560)], amp=1, step=10, stroke=GRAPHITE, stroke_width=1.6,
                 fill="none", opacity=0.75 if k == 0 else 0.35)
    p.wobble([(gx - 12, 330), (gx + 142, 330), (gx + 142, 304), (gx - 12, 304)], closed=True, amp=1, step=10,
             stroke=GRAPHITE, stroke_width=1.6, fill="none", opacity=0.6)
    cl = p.clip(f'<rect x="{gx - 12}" y="300" width="80" height="262"/>')
    p.hatch(gx - 12, 300, 154, 262, angle=60, spacing=7, clip=cl, stroke=GRAPHITE, stroke_width=0.9, opacity=0.6)
    for k in range(6):
        p.line(gx + 30 + k * 13, 340, gx + 30 + k * 13, 560, stroke=GRAPHITE, stroke_width=1, stroke_dasharray="6 6", opacity=0.35)
    # HUD: focus and destination progress, in pencil
    p.text(340, 60, "FOCUS", size=18, family="monospace", fill=GRAPHITE)
    p.wobble([(420, 44), (700, 44), (700, 64), (420, 64)], closed=True, amp=0.8, step=12, stroke=GRAPHITE, stroke_width=1.5, fill="none")
    cl = p.clip('<rect x="420" y="44" width="170" height="20"/>')
    p.hatch(420, 44, 280, 20, angle=60, spacing=4, clip=cl, stroke=GRAPHITE, stroke_width=1.2)
    p.text(740, 60, "GATES 62%", size=18, family="monospace", fill=GRAPHITE)
    p.text(340, 96, "hold RECALL: the next 6 m stay drawn for 3 s", size=17, family="monospace", fill=GRAPHITE, opacity=0.8)


# ---- 1D: Star Chart -----------------------------------------------------------------------------
def gold_defs(p):
    g = p.uid("gold")
    p.defn(f'<linearGradient id="{g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff2b0"/>'
           f'<stop offset="35%" stop-color="#e3b74a"/><stop offset="60%" stop-color="#a87618"/>'
           f'<stop offset="100%" stop-color="#f3d27a"/></linearGradient>')
    return f"url(#{g})"


@register(G, "star-chart")
def star_chart(p: Pic):
    """Star Chart (1D): a gilded star atlas, gold-leaf stars on lapis. The player is redrawing the
    Stag from fragments of lore: four of its lines are already laid in gold, and a fifth is being
    dragged from the last star toward the next antler star, while a flickering false star waits to
    break any line that touches it. Torn paper fragments on the right give the constraints, and the
    name at the top fills in letter by letter as the constellation comes right."""
    r = p.rng
    gold = gold_defs(p)
    # lapis ground with veins and pyrite flecks
    p.rect(0, 0, W, H, fill="#1d2f6e")
    lid = p.uid("lapis")
    p.defn(f'<filter id="{lid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="0.008" numOctaves="4" seed="{p.seed % 991}"/>'
           f'<feColorMatrix values="0 0 0 0 0.10  0 0 0 0 0.20  0 0 0 0 0.62  0 0 -2.2 2.0 -0.25"/></filter>')
    p.rect(0, 0, W, H, filter=f"url(#{lid})")
    p.vignette(0.55, "#070c24")
    p.stipple(0, 0, W, H, n=900, r=(0.4, 1.3), fill="#e0bb5a", opacity=0.55)
    # atlas frame: double gilt rule with degree ticks
    p.rect(22, 22, W - 44, H - 44, fill="none", stroke=gold, stroke_width=6)
    p.rect(40, 40, W - 80, H - 80, fill="none", stroke=gold, stroke_width=1.5)
    ticks = []
    for k in range(0, 113):
        x = 40 + k * (W - 80) / 112
        L = 10 if k % 8 == 0 else 5
        ticks.append(f"M{f(x)},40v{L}M{f(x)},{H - 40}v{-L}")
    for k in range(0, 73):
        y = 40 + k * (H - 80) / 72
        L = 10 if k % 8 == 0 else 5
        ticks.append(f"M40,{f(y)}h{L}M{W - 40},{f(y)}h{-L}")
    p.path("".join(ticks), stroke="#e3b74a", stroke_width=1, fill="none")
    # celestial graticule over the field
    fx0, fy0, fx1, fy1 = 60, 110, 790, 760
    cl = p.clip(f'<rect x="{fx0}" y="{fy0}" width="{fx1 - fx0}" height="{fy1 - fy0 - 30}"/>')
    p.open("g", clip_path=cl, opacity=0.35)
    for k in range(1, 7):
        p.circle(420, 1150, 420 + k * 95, fill="none", stroke="#e3b74a", stroke_width=0.8)
    for k in range(-6, 7):
        a = math.radians(-90 + k * 9)
        p.line(420, 1150, 420 + 1400 * math.cos(a), 1150 + 1400 * math.sin(a), stroke="#e3b74a", stroke_width=0.6)
    p.close()

    def star(x, y, s, op=1.0):
        pts = Pic.star_pts(x, y, s, s * 0.28, n=4, rot=-90)
        p.poly(pts, fill=gold, opacity=op)
        pts = Pic.star_pts(x, y, s * 0.6, s * 0.2, n=4, rot=-45)
        p.poly(pts, fill=gold, opacity=op * 0.9)
        p.circle(x, y, s * 0.22, fill="#fff6cf", opacity=op)

    # background stars, spread so they never crowd the Stag
    stag = [(250, 610), (330, 560), (420, 520), (470, 430), (420, 350), (380, 270), (320, 210), (520, 360)]
    placed = list(stag)
    for _ in range(400):
        x, y = r.uniform(fx0 + 20, fx1 - 20), r.uniform(fy0 + 20, fy1 - 50)
        if all(math.hypot(x - a, y - b) > 60 for a, b in placed):
            placed.append((x, y))
            star(x, y, r.uniform(5, 11), 0.75)
        if len(placed) > 34:
            break
    # fragments of the figure: faint antlers and back, in hairline gold
    p.open("g", opacity=0.3, fill="none", stroke="#f3d27a", stroke_width=1.4)
    p.path("M240,640 C300,600 380,560 440,540 C500,520 520,470 480,430 M470,430 C450,380 400,330 380,270 "
           "M380,270 C360,240 330,220 300,190 M400,330 C440,300 480,290 520,250 M520,360 C560,380 600,420 610,470")
    p.path("M250,610 c-30,30 -40,70 -30,110 M330,560 c0,40 -10,80 -20,120")
    p.close()
    # drawn constellation lines (laid in gold)
    done = [(0, 1), (1, 2), (2, 3), (3, 4)]
    for a, b in done:
        (x1, y1), (x2, y2) = stag[a], stag[b]
        p.line(x1, y1, x2, y2, stroke="#7a5310", stroke_width=7, stroke_linecap="round", opacity=0.6)
        p.line(x1, y1, x2, y2, stroke=gold, stroke_width=4, stroke_linecap="round")
    # the line being dragged
    (x1, y1) = stag[4]
    cx, cy = 360, 300
    p.line(x1, y1, cx, cy, stroke="#fff2b0", stroke_width=3, stroke_dasharray="10 8", stroke_linecap="round")
    p.circle(stag[5][0], stag[5][1], 26, fill="none", stroke="#fff2b0", stroke_width=2, stroke_dasharray="4 5")
    for i, (x, y) in enumerate(stag):
        star(x, y, 20 if i in (2, 3) else 15)
    # a false star, flickering
    fx, fy = 470, 270
    star(fx, fy, 13, 0.5)
    for k, rr in enumerate((22, 32, 42)):
        p.circle(fx, fy, rr, fill="none", stroke="#9fb6ff", stroke_width=1.5, stroke_dasharray="3 6", opacity=0.7 - k * 0.2)
    p.text(fx + 30, fy - 20, "false star", size=16, family="serif", font_style="italic", fill="#c9d6ff")
    # stylus cursor
    p.poly([(cx, cy), (cx - 8, cy - 40), (cx - 2, cy - 42), (cx + 6, cy - 6)], fill="#f3eee2")
    p.poly([(cx - 8, cy - 40), (cx - 12, cy - 90), (cx - 2, cy - 92), (cx - 2, cy - 42)], fill="#7a5634")
    # the name, filling in
    name = "THE STAG"
    filled = 5
    for i, ch in enumerate(name):
        x = 150 + i * 62 - (30 if i > 3 else 0)
        if i < filled:
            p.text(x, 92, ch, size=56, family="serif", fill=gold, font_weight="bold")
        else:
            p.text(x, 92, ch, size=56, family="serif", fill="none", stroke="#e3b74a", stroke_width=1.2, font_weight="bold")
    # torn fragment strips on the right
    frags = ["The Stag's antlers are five", "stars climbing to the left.",
             "No line of the Stag", "crosses another.",
             "Its heart is the brightest;", "it touches three others."]
    for k in range(3):
        x0, y0, w, h = 830, 140 + k * 170, 320, 120
        top = [(x0 + t, y0 + r.uniform(-5, 5)) for t in range(0, w + 1, 12)]
        bot = [(x0 + t, y0 + h + r.uniform(-6, 6)) for t in range(w, -1, -12)]
        poly = top + bot
        rot = r.uniform(-3, 3)
        p.open("g", transform=f"rotate({f(rot)} {x0 + w / 2} {y0 + h / 2})", opacity=0.45 if k == 2 else 1)
        p.path(pd(poly), fill="#000", opacity=0.35, transform="translate(5,6)", filter=p.blur(3))
        p.path(pd(poly), fill="#efe2bf")
        p.stipple(x0, y0, w, h, n=120, r=(0.4, 1.0), fill="#8a6a3a", opacity=0.4)
        p.text(x0 + 18, y0 + 50, frags[2 * k], size=21, family="serif", font_style="italic", fill="#3a2a14")
        p.text(x0 + 18, y0 + 82, frags[2 * k + 1], size=21, family="serif", font_style="italic", fill="#3a2a14")
        p.close()
    p.text(842, 652, "(dimmed: a wrong attempt)", size=15, family="serif", font_style="italic", fill="#c9d6ff")
    # Name it button
    p.rect(900, 680, 200, 54, rx=6, fill="#13204d", stroke=gold, stroke_width=3)
    p.text(938, 716, "NAME IT", size=26, family="serif", fill=gold, letter_spacing=3)


# ---- 1D: The Slipping Glyph ---------------------------------------------------------------------
def glyph_parts():
    """Four families of parts, each a set of stroke paths in a 100 x 100 box."""
    crowns = ["M25,22 Q50,2 75,22", "M25,26 L50,8 L75,26", "M30,14 H70 M50,14 V26", "M28,10 L50,26 L72,10",
              "M30,24 Q30,8 50,8 Q70,8 70,24"]
    stems = ["M50,28 V72", "M50,28 Q36,50 50,72", "M42,28 V72 M58,28 V72", "M50,28 V64 Q50,74 40,72",
             "M50,28 L40,50 L60,50 L50,72"]
    feet = ["M28,82 H72", "M30,76 Q50,96 70,76", "M50,74 L32,92 M50,74 L68,92", "M50,84 m-10,0 a10,8 0 1,0 20,0 a10,8 0 1,0 -20,0",
            "M30,92 L50,76 L70,92"]
    marks = ["M82,50 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0", "M76,44 L88,56 M88,44 L76,56", "M82,40 L90,50 L82,60 L74,50Z",
             "M76,56 L82,42 L88,56", "M18,50 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0"]
    return crowns, stems, feet, marks


def vine_border(p, x0, y0, x1, y1, stem, leaf, berry):
    """A scrolling vine round a rectangle: sine stem with leaves and gold bezants."""
    r = p.rng
    edges = [((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))]
    for (ax, ay), (bx, by) in edges:
        L = math.hypot(bx - ax, by - ay)
        ux, uy = (bx - ax) / L, (by - ay) / L
        nx, ny = -uy, ux
        pts = []
        n = int(L / 6)
        for i in range(n + 1):
            t = i * L / n
            s = 9 * math.sin(t / 22)
            pts.append((ax + ux * t + nx * s, ay + uy * t + ny * s))
        p.path(p.smooth_d(pts[::2]), fill="none", stroke=stem, stroke_width=3)
        for i in range(0, n, 5):
            t = i * L / n
            side = 1 if (i // 5) % 2 else -1
            x, y = pts[i]
            ang = math.degrees(math.atan2(uy, ux)) + side * 55
            p.ellipse(x + nx * side * 12, y + ny * side * 12, 11, 4.5, fill=leaf,
                      transform=f"rotate({f(ang)} {f(x + nx * side * 12)} {f(y + ny * side * 12)})")
            if i % 15 == 0:
                p.circle(x - nx * side * 13, y - ny * side * 13, 4, fill=berry, stroke="#7a5310", stroke_width=0.8)
        # tendril curls
        for i in range(3, n, 11):
            x, y = pts[i]
            p.path(f"M{f(x)},{f(y)} q{f(nx * 14)},{f(ny * 14)} {f(nx * 6 + ux * 8)},{f(ny * 6 + uy * 8)}",
                   fill="none", stroke=stem, stroke_width=1.4)


@register(G, "slipping-glyph")
def slipping_glyph(p: Pic):
    """The Slipping Glyph (1D): a carved surface of glyphs drawn as painted, gilded initials inside a
    vine border. Only the glyph under the gold focus circle is lit and holds still; a glyph just
    outside it is mid-change, its old parts sliding away as new ones appear, while one part (here the
    foot) stays the same. The rune key on the left does not slip, and the slots on the right take one
    rune per row: the first row is solved, the second is being chosen."""
    r = p.rng
    gold = gold_defs(p)
    p.paper("#ecdfbf", grain=0.3, fibre=0.7)
    p.vignette(0.35, "#5a4020")
    # outer illumination: coloured bars and the vine
    p.rect(26, 26, W - 52, H - 52, fill="none", stroke="#2b4c8c", stroke_width=10)
    p.rect(26, 26, W - 52, H - 52, fill="none", stroke=gold, stroke_width=3)
    vine_border(p, 54, 54, W - 54, H - 54, "#2f5a2a", MOSS, gold)
    # corner bosses
    for cx, cy in [(54, 54), (W - 54, 54), (W - 54, H - 54), (54, H - 54)]:
        p.circle(cx, cy, 20, fill="#a3322a", stroke=gold, stroke_width=4)
        p.circle(cx, cy, 7, fill=gold)
    crowns, stems, feet, marks = glyph_parts()
    fields = ["#2b4c8c", "#a3322a", MOSS, VIOLET, SEA, "#a3322a", "#2b4c8c", OCHRE]
    gx0, gy0, cell = 300, 112, 144
    lit = (1, 1)            # the glyph under focus
    slipping = (1, 2)       # the glyph mid-change
    focus = (gx0 + lit[1] * cell + 64, gy0 + lit[0] * cell + 64)
    mid = p.uid("focus")
    soft = p.blur(18)
    p.defn(f'<mask id="{mid}"><rect x="0" y="0" width="{W}" height="{H}" fill="#fff"/>'
           f'<circle cx="{focus[0]}" cy="{focus[1]}" r="96" fill="#000" filter="{soft}"/></mask>')
    for row in range(4):
        for col in range(4):
            x, y = gx0 + col * cell, gy0 + row * cell
            field = fields[(row * 4 + col * 3) % len(fields)]
            # gilt ground with a painted field and white filigree
            p.rect(x, y, 128, 128, fill=gold)
            p.rect(x + 6, y + 6, 116, 116, fill="#7a5310", opacity=0.5)
            p.rect(x + 9, y + 9, 110, 110, fill=field)
            fil = []
            for k in range(4):
                for j in range(4):
                    fx, fy = x + 22 + k * 28, y + 22 + j * 28
                    fil.append(f"M{fx - 2},{fy}a2,2 0 1,0 4,0a2,2 0 1,0 -4,0")
                    fil.append(f"M{fx + 10},{fy + 14}l3,-3l3,3l-3,3z")
            p.path("".join(fil), fill="#f3eee2", opacity=0.45)
            parts = [r.choice(crowns), r.choice(stems), r.choice(feet), r.choice(marks)]
            t = f"translate({x + 14},{y + 14}) scale(1)"
            if (row, col) == slipping:
                # old parts sliding out, new ones fading in; the foot (stable) stays put
                old = [r.choice(crowns), r.choice(stems), parts[2], r.choice(marks)]
                p.path(" ".join([old[0], old[1], old[3]]), fill="none", stroke="#f3eee2", stroke_width=9,
                       stroke_linecap="round", opacity=0.3, transform=f"translate({x + 26},{y + 8})")
                p.path(" ".join([old[0], old[1], old[3]]), fill="none", stroke="#f3eee2", stroke_width=9,
                       stroke_linecap="round", opacity=0.15, transform=f"translate({x + 38},{y + 2})")
                for k in range(4):
                    p.line(x + 24, y + 30 + k * 18, x + 104, y + 24 + k * 18, stroke="#f3eee2", stroke_width=1.2,
                           stroke_dasharray="2 6", opacity=0.6)
                p.path(" ".join([parts[0], parts[1], parts[3]]), fill="none", stroke="#f3eee2", stroke_width=9,
                       stroke_linecap="round", opacity=0.75, transform=t)
                p.path(parts[2], fill="none", stroke=gold, stroke_width=10, stroke_linecap="round", transform=t)
            else:
                p.path(" ".join(parts), fill="none", stroke="#3a2a14", stroke_width=12, stroke_linecap="round",
                       opacity=0.35, transform=f"translate({x + 16},{y + 17})")
                p.path(" ".join(parts), fill="none", stroke="#f3eee2", stroke_width=9, stroke_linecap="round", transform=t)
                if (row, col) == lit:
                    p.path(parts[1], fill="none", stroke=gold, stroke_width=10, stroke_linecap="round", transform=t)
    # darkness everywhere but the focus circle
    p.rect(gx0 - 20, gy0 - 20, 4 * cell + 24, 4 * cell + 24, fill="#1a1208", opacity=0.45, mask=f"url(#{mid})")
    p.circle(focus[0], focus[1], 92, fill="none", stroke=gold, stroke_width=5)
    p.circle(focus[0], focus[1], 100, fill="none", stroke="#f3d27a", stroke_width=1.5, stroke_dasharray="4 6")
    p.text(focus[0] + 112, focus[1] - 74, "slipping", size=17, family="serif", font_style="italic", fill="#3a2a14")
    # rune key, left margin (fixed runes, ink on vellum)
    p.text(110, 118, "KEY", size=22, family="serif", fill="#a3322a", letter_spacing=4)
    for k in range(12):
        x, y = 96 + (k % 2) * 76, 140 + (k // 2) * 92
        p.rect(x, y, 62, 62, fill="#f6eed7", stroke="#7a5310", stroke_width=1.5)
        rune = [crowns[k % 5], stems[(k * 2) % 5], feet[(k * 3) % 5], marks[(k + 1) % 5]]
        p.path(" ".join(rune), fill="none", stroke="#2b2015", stroke_width=6, stroke_linecap="round",
               transform=f"translate({x + 6},{y + 6}) scale(0.5)")
    # slots, right margin
    p.text(930, 118, "ROWS", size=22, family="serif", fill="#a3322a", letter_spacing=4)
    for row in range(4):
        x, y = 940, gy0 + row * cell + 26
        p.rect(x, y, 82, 82, fill="#f6eed7", stroke=gold, stroke_width=4)
        if row == 0:
            rune = [crowns[2], stems[4], feet[0], marks[1]]
            p.path(" ".join(rune), fill="none", stroke="#a3322a", stroke_width=7, stroke_linecap="round",
                   transform=f"translate({x + 6},{y + 6}) scale(0.7)")
            p.path(f"M{x + 100},{y + 44} l10,12 l22,-28", fill="none", stroke=MOSS, stroke_width=5)
        elif row == 1:
            p.rect(x - 5, y - 5, 92, 92, fill="none", stroke="#a3322a", stroke_width=2, stroke_dasharray="6 5")
            p.text(x + 31, y + 56, "?", size=40, family="serif", fill="#a3322a")
    p.text(296, 726, "Watch what stays. Sketches blur in five seconds.", size=20, family="serif", font_style="italic", fill="#3a2a14")


# ---- 1D: Concentration --------------------------------------------------------------------------
@register(G, "concentration")
def concentration(p: Pic):
    """Concentration (1D): a memory match laid out as a stained-glass window of twelve cards. Two
    cards just turned show the same healer's face and are lighting up as a pair; two pairs are
    already kept; one card has blanked to clear glass and can only be matched from memory. On the
    right the kept faces line up, the flips left are counted, and a glass candle burns down to the
    next blanking."""
    r = p.rng
    lead = "#17161a"
    # stone surround and back light
    p.rect(0, 0, W, H, fill="#24222a")
    p.stipple(0, 0, W, H, n=1500, r=(0.6, 2.2), fill="#3a3742", opacity=0.6)
    p.rect(40, 40, 760, 720, rx=18, fill=p.radial([(0, "#fff4cf", 0.9), (1, "#ffb86b", 0.15)], 0.5, 0.45, 0.7))
    jewels = ["#1f4fa8", "#a01a2a", "#1d7a4a", "#d29a1c", "#5a2a8a", "#0f6f86"]
    faces = {0: ("#d29a1c", "#6a3a18"), 1: ("#e0b48a", "#2a1a10"), 2: ("#c9a07a", "#8a2a10"),
             3: ("#e6c49c", "#3a3a5a"), 4: ("#d8aa7c", "#1a1a1a"), 5: ("#caa080", "#6a6a6a")}
    # layout: 4 x 3 cards. state: back, face(pair), kept(pair), blank, turned(pair)
    layout = ["back", ("kept", 1), "back", ("turned", 3),
              ("kept", 0), "back", "blank", "back",
              "back", ("turned", 3), ("kept", 1), ("kept", 0)]
    cw, ch, gx, gy = 168, 216, 66, 64

    def face(x, y, w, h, pair, glow):
        skin, hair = faces[pair]
        cx, cy = x + w / 2, y + h * 0.44
        # background broken into jewel glass
        bg = shatter(r, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], 11)
        for k, pc in enumerate(bg):
            p.path(pd(pc), fill=shade(jewels[(pair + k) % len(jewels)], r.uniform(-0.25, 0.15)),
                   stroke=lead, stroke_width=4, stroke_linejoin="round")
        # hair, head, neck, robe
        p.path(f"M{f(cx - 46)},{f(cy + 20)} Q{f(cx - 54)},{f(cy - 62)} {f(cx)},{f(cy - 66)} Q{f(cx + 54)},{f(cy - 62)} "
               f"{f(cx + 46)},{f(cy + 20)}Z", fill=hair, stroke=lead, stroke_width=5)
        p.path(f"M{f(cx - 22)},{f(cy + 40)} L{f(cx + 22)},{f(cy + 40)} L{f(cx + 60)},{f(y + h)} L{f(cx - 60)},{f(y + h)}Z",
               fill=jewels[(pair + 2) % 6], stroke=lead, stroke_width=5)
        p.ellipse(cx, cy - 6, 32, 40, fill=skin, stroke=lead, stroke_width=5)
        for s in (-1, 1):
            p.path(f"M{f(cx + s * 18)},{f(cy - 10)} q{f(s * -6)},-6 {f(s * -12)},0 q{f(s * 6)},6 {f(s * 12)},0z",
                   fill="#2a2440", stroke=lead, stroke_width=2)
        p.path(f"M{f(cx - 8)},{f(cy + 16)} q8,6 16,0", fill="none", stroke=lead, stroke_width=3)
        p.path(f"M{f(cx)},{f(cy - 4)} v12", fill="none", stroke=lead, stroke_width=2)
        # painted shading lines (grisaille)
        p.path(f"M{f(cx - 26)},{f(cy - 20)} q-4,20 4,38", fill="none", stroke="#6a4a2a", stroke_width=2, opacity=0.5)
        # name banner
        p.rect(x + 14, y + h - 42, w - 28, 26, fill=PEARL, stroke=lead, stroke_width=4)
        for k in range(5):
            p.line(x + 24 + k * (w - 48) / 4, y + h - 34, x + 34 + k * (w - 48) / 4, y + h - 24, stroke="#5a4a3a",
                   stroke_width=2, opacity=0.6)
        if glow:
            p.rect(x - 6, y - 6, w + 12, h + 12, fill="none", stroke="#ffe08a", stroke_width=6, opacity=0.9, filter=p.blur(3))

    for i, state in enumerate(layout):
        x = 70 + (i % 4) * (cw + 18)
        y = 70 + (i // 4) * (ch + 14)
        p.rect(x - 7, y - 7, cw + 14, ch + 14, fill=lead, rx=4)
        if state == "back":
            # quarry glazing: diamonds in alternating ruby and blue
            cl = p.clip(f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}"/>')
            p.open("g", clip_path=cl)
            s = 34
            for j in range(-1, int(ch / s * 2) + 2):
                for k in range(-1, int(cw / s) + 2):
                    cx = x + k * s + (s / 2 if j % 2 else 0)
                    cy = y + j * s / 2
                    col = "#7a1420" if (j + k) % 3 == 0 else "#183a80"
                    p.poly([(cx, cy - s / 2), (cx + s / 2, cy), (cx, cy + s / 2), (cx - s / 2, cy)],
                           fill=shade(col, r.uniform(-0.2, 0.25)), stroke=lead, stroke_width=3)
            p.close()
            p.circle(x + cw / 2, y + ch / 2, 22, fill="#d29a1c", stroke=lead, stroke_width=4)
            p.poly(Pic.star_pts(x + cw / 2, y + ch / 2, 14, 6, 6), fill="#fff0b0", stroke=lead, stroke_width=1.5)
        elif state == "blank":
            p.rect(x, y, cw, ch, fill="#eef3f2")
            p.rect(x, y, cw, ch, fill=p.gradient([(0, "#ffffff"), (1, "#cfdcdc")], 0, 0, 1, 1), opacity=0.6)
            for k in range(4):
                p.line(x + 20 + k * 40, y, x - 40 + k * 40, y + ch, stroke="#ffffff", stroke_width=10, opacity=0.5)
            # ghost of the lead lines, nothing else left
            p.ellipse(x + cw / 2, y + ch * 0.4, 32, 40, fill="none", stroke="#9fb0b0", stroke_width=2, stroke_dasharray="5 6")
            p.rect(x + 14, y + ch - 42, cw - 28, 26, fill="none", stroke="#9fb0b0", stroke_width=2, stroke_dasharray="5 6")
            p.text(x + 26, y + ch / 2 + 74, "blanked", size=18, family="serif", font_style="italic", fill="#6a8080")
        else:
            kind, pair = state
            face(x, y, cw, ch, pair, glow=(kind == "turned"))
            if kind == "kept":
                p.circle(x + cw - 18, y + 18, 12, fill="#d29a1c", stroke=lead, stroke_width=3)
    # cursor (pointing hand, simple arrow)
    ax, ay = 70 + 1 * (cw + 18) + 120, 70 + 2 * (ch + 14) + 150
    p.poly([(ax, ay), (ax + 4, ay + 44), (ax + 14, ay + 34), (ax + 24, ay + 54), (ax + 32, ay + 50), (ax + 22, ay + 30),
            (ax + 36, ay + 28)], fill="#fffaf0", stroke=lead, stroke_width=3)
    # right column: tracery panel
    px = 840
    p.rect(px, 40, 320, 720, rx=14, fill="#1b1a20", stroke="#4a4652", stroke_width=3)
    p.text(px + 30, 92, "PAIRS KEPT", size=22, family="serif", fill="#e8d7a8", letter_spacing=3)
    for k, pair in enumerate([0, 1]):
        cx, cy = px + 70 + k * 90, 150
        pcs = shatter(r, Pic.ngon(cx, cy, 36, 12), 5)
        for j, pc in enumerate(pcs):
            p.path(pd(pc), fill=shade(jewels[(pair + j) % 6], -0.1), stroke=lead, stroke_width=3)
        p.ellipse(cx, cy, 14, 18, fill=faces[pair][0], stroke=lead, stroke_width=3)
    p.circle(px + 250, 150, 36, fill="none", stroke="#ffe08a", stroke_width=3, stroke_dasharray="6 6")
    p.text(px + 30, 250, "FLIPS LEFT", size=22, family="serif", fill="#e8d7a8", letter_spacing=3)
    p.text(px + 30, 320, "18", size=64, family="serif", fill="#ffe08a")
    p.text(px + 130, 320, "/ 30", size=30, family="serif", fill="#8a8494")
    p.text(px + 30, 400, "NEXT BLANK", size=22, family="serif", fill="#e8d7a8", letter_spacing=3)
    # glass candle burning down
    cx = px + 160
    p.ellipse(cx, 470, 40, 60, fill=p.radial([(0, "#fff2b0", 0.9), (1, "#ff9a3a", 0)]))
    p.path(f"M{cx},{430} q-16,30 0,62 q16,-32 0,-62z", fill="#ffd25a", stroke=lead, stroke_width=3)
    p.path(f"M{cx},{456} q-6,14 0,28 q6,-14 0,-28z", fill="#fff6d0")
    p.rect(cx - 30, 500, 60, 150, fill="#f0e6d0", stroke=lead, stroke_width=5)
    for k in range(4):
        p.line(cx - 30, 530 + k * 30, cx + 30, 530 + k * 30, stroke=lead, stroke_width=3)
    p.path(f"M{cx - 30},{506} q12,14 20,0 q8,18 18,6", fill="#fff", stroke=lead, stroke_width=2)
    p.rect(cx - 52, 650, 104, 20, fill="#5a3a8a", stroke=lead, stroke_width=4)
    p.text(px + 30, 720, "in 3 flips", size=24, family="serif", font_style="italic", fill="#e8d7a8")


# ---- 1D: Six Realms -----------------------------------------------------------------------------
@register(G, "six-realms")
def six_realms(p: Pic):
    """Six Realms (1D): the tribes' hex board game laid as a Byzantine mosaic, nineteen hexes in
    tesserae on a gold ground. Wrymreach is the gold-and-silver centre, the six Thresholds ring it in
    realm colours, and the twelve homes lie outside; one home has already fallen to the forgetting
    tide and another is dimming for next round. The player's Sky piece leaps three hexes in a straight
    line over an enemy toward a Threshold, while the hex the enemy Dark piece threatens is ringed in
    red."""
    r = p.rng
    q = lambda v: int(round(v))
    groups: dict[str, list[str]] = {}

    def tile(x, y, s, ang, col):
        c, sn = math.cos(ang), math.sin(ang)
        h = s / 2 - 0.8
        pts = [(x + (-h * c + h * sn), y + (-h * sn - h * c)), (x + (h * c + h * sn), y + (h * sn - h * c)),
               (x + (h * c - h * sn), y + (h * sn + h * c)), (x + (-h * c - h * sn), y + (-h * sn + h * c))]
        pts = [(a + r.uniform(-0.7, 0.7), b + r.uniform(-0.7, 0.7)) for a, b in pts]
        d = f"M{q(pts[0][0])} {q(pts[0][1])}" + "".join(
            f"l{q(pts[i][0]) - q(pts[i - 1][0])} {q(pts[i][1]) - q(pts[i - 1][1])}" for i in (1, 2, 3)) + "z"
        groups.setdefault(col, []).append(d)

    def vary(col, n=3, spread=0.16):
        return shade(col, r.choice([-spread, -spread / 2, 0, spread / 2, spread][:n + 2]))

    # grout and gold ground, laid in straight courses with slight drift
    p.rect(0, 0, W, H, fill="#3a3024")
    golds = ["#c9a227", "#d8b13a", "#b8901d", "#e6c55c", "#a8841c"]
    s = 19
    for j in range(int(H / s) + 1):
        off = (j % 2) * s / 2
        for i in range(int(W / s) + 2):
            tile(i * s - off + r.uniform(-1, 1), j * s + s / 2, s, r.uniform(-0.06, 0.06), r.choice(golds))
    for col, ds in groups.items():
        p.path("".join(ds), fill=col)
    groups.clear()
    # board
    R = 86
    cx0, cy0 = 520, 400
    axial = [(a, b) for a in range(-2, 3) for b in range(-2, 3) if abs(a + b) <= 2]
    centres = {}
    for a, b in axial:
        x = cx0 + math.sqrt(3) * R * (a + b / 2)
        y = cy0 + 1.5 * R * b
        centres[(a, b)] = (x, y)
    ring1 = [(1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1)]
    ring_of = lambda h: max(abs(h[0]), abs(h[1]), abs(h[0] + h[1]))
    realm_of = {}
    for i, h in enumerate(ring1):
        realm_of[h] = i
    for h in axial:
        if ring_of(h) == 2:
            ang = math.atan2(centres[h][1] - cy0, centres[h][0] - cx0)
            best = min(range(6), key=lambda i: abs(math.remainder(
                ang - math.atan2(centres[ring1[i]][1] - cy0, centres[ring1[i]][0] - cx0), 2 * math.pi)))
            realm_of[h] = best
    void, dimming = (2, -2), (-2, 2)
    # dark bed for each hex
    for h, (x, y) in centres.items():
        p.poly(Pic.ngon(x, y, R + 3, 6, 30), fill="#2a241c")
    ts = 10.5
    for h, (x, y) in centres.items():
        rg = ring_of(h)
        k = 0
        rr = R - 5
        while rr > ts * 0.6:
            per = 6 * rr
            n = max(1, int(per / ts))
            for t in range(n):
                u = t / n * 6
                side = int(u)
                fr = u - side
                a1 = math.radians(30 + 60 * side)
                a2 = math.radians(30 + 60 * (side + 1))
                px = x + rr * (math.cos(a1) * (1 - fr) + math.cos(a2) * fr)
                py = y + rr * (math.sin(a1) * (1 - fr) + math.sin(a2) * fr)
                ang = math.atan2(math.sin(a2) - math.sin(a1), math.cos(a2) - math.cos(a1))
                if rg == 0:
                    col = vary(SUNGOLD if (k % 2 == 0) else MOONSILVER)
                elif h == void:
                    if r.random() < 0.55:
                        continue
                    col = vary("#b9b2a2")
                elif rg == 1:
                    main, sec = REALMS[realm_of[h]]
                    col = vary(sec if k in (0, 4) else main)
                else:
                    main, sec = REALMS[realm_of[h]]
                    base = shade(main, 0.25) if k % 3 else main
                    col = vary(mix(base, "#9a948a", 0.6) if h == dimming else base)
                tile(px, py, ts, ang, col)
            rr -= ts
            k += 1
        # the centre stone
        tile(x, y, ts, 0.3, vary(SUNGOLD if rg == 0 else (REALMS[realm_of[h]][1] if rg == 1 else REALMS[realm_of[h]][0])))
    for col, ds in groups.items():
        p.path("".join(ds), fill=col)
    groups.clear()
    # pieces: discs of tesserae with a rim marking the side
    pieces = [((0, 1), 1, "elder"), ((1, -2), 4, "elder"), ((-1, -1), 2, "elder"),
              ((-1, 2), 1, "player"), ((1, 1), 2, "player"), ((0, 2), 0, "player")]

    def piece(x, y, realm, side):
        main, sec = REALMS[realm]
        p.circle(x + 4, y + 6, 40, fill="#000", opacity=0.35, filter=p.blur(4))
        p.circle(x, y, 40, fill="#2a241c")
        rr = 35
        k = 0
        while rr > 4:
            n = max(1, int(2 * math.pi * rr / 9))
            for t in range(n):
                a = 2 * math.pi * t / n
                col = (BONE if side == "player" else OBSIDIAN) if k == 0 else (sec if k == 2 else main)
                tile(x + rr * math.cos(a), y + rr * math.sin(a), 9, a + math.pi / 2, vary(col, spread=0.1))
            rr -= 9
            k += 1

    for h, realm, side in pieces:
        piece(*centres[h], realm, side)
    for col, ds in groups.items():
        p.path("".join(ds), fill=col)
    groups.clear()
    # emblems (wing for Sky, eye for Dark, leaf for Wood, block for Earth)
    em = {1: "M-16,6 Q0,-22 16,6 Q0,-6 -16,6z", 4: "M-18,0 Q0,-14 18,0 Q0,14 -18,0z M-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0",
          2: "M-12,-12 h24 v24 h-24z", 0: "M0,-18 Q16,0 0,18 Q-16,0 0,-18z"}
    for h, realm, side in pieces:
        x, y = centres[h]
        p.path(em[realm], fill=BONE if side == "elder" else OBSIDIAN, opacity=0.9, transform=f"translate({f(x)},{f(y)})")
    # the move: Sky leaps three hexes in a straight line, over the enemy, to a Threshold
    (sx, sy), (ex, ey) = centres[(-1, 2)], centres[(-1, -1)]
    ex, ey = centres[(-1, 1)]
    tx, ty = centres[(-1, 1)]
    a0 = centres[(-1, 2)]
    a3 = centres[(2, -1)]
    path_hexes = [(-1, 2), (0, 1), (1, 0)]
    pts = [centres[h] for h in path_hexes]
    p.path(f"M{f(pts[0][0])},{f(pts[0][1] - 30)} Q{f(pts[1][0])},{f(pts[1][1] - 150)} {f(pts[2][0])},{f(pts[2][1] - 30)}",
           fill="none", stroke="#2a241c", stroke_width=14, stroke_linecap="round", opacity=0.7)
    p.path(f"M{f(pts[0][0])},{f(pts[0][1] - 30)} Q{f(pts[1][0])},{f(pts[1][1] - 150)} {f(pts[2][0])},{f(pts[2][1] - 30)}",
           fill="none", stroke=PEARL, stroke_width=8, stroke_dasharray="4 10", stroke_linecap="round")
    hx, hy = pts[2][0], pts[2][1] - 30
    p.poly([(hx + 4, hy + 8), (hx - 30, hy - 20), (hx - 4, hy - 30)], fill=PEARL, stroke="#2a241c", stroke_width=3)
    p.poly(Pic.ngon(*centres[(1, 0)], R - 4, 6, 30), fill="none", stroke=PEARL, stroke_width=4, stroke_dasharray="10 6")
    # threatened hex, ringed in red tesserae
    tx, ty = centres[(0, 0)]
    for t in range(36):
        u = t / 36 * 6
        side = int(u)
        fr = u - side
        a1, a2 = math.radians(30 + 60 * side), math.radians(30 + 60 * (side + 1))
        tile(tx + (R - 2) * (math.cos(a1) * (1 - fr) + math.cos(a2) * fr),
             ty + (R - 2) * (math.sin(a1) * (1 - fr) + math.sin(a2) * fr), 11, 0.4, vary("#b0241c", spread=0.1))
    for col, ds in groups.items():
        p.path("".join(ds), fill=col)
    groups.clear()
    # side plaques: round and tide
    for y, top, big in [(70, "ROUND", "7"), (300, "TIDE IN", "2"), (530, "HELD", "2 - 1")]:
        p.rect(950, y, 210, 180, rx=10, fill="#2a241c")
        p.rect(958, y + 8, 194, 164, rx=6, fill="#efe6cf")
        p.text(976, y + 52, top, size=24, family="serif", fill="#5b3a7a", letter_spacing=3)
        p.text(976, y + 130, big, size=64, family="serif", fill="#7a1a14")


# ---- 1D: Heartstone -----------------------------------------------------------------------------
@register(G, "heartstone")
def heartstone(p: Pic):
    """Heartstone (1D): resonance crafting in low-poly facets on a Stonekeeper's bench. Four crystal
    shards sit in a faceted ring setting; above each, a beat line shows how far its pitch is from the
    target chord at the top: a fast wobble is far, a slow one is close, and a straight line is right.
    One shard is cracked from earlier strikes, a fifth is being lifted from the tray below, and the
    row of hammers counts the strikes left."""
    r = p.rng
    # faceted background: jittered triangle mesh, obsidian above, molten glow below
    cols, rows = 16, 11
    gx, gy = W / cols, H / rows
    pts = [[(i * gx + (r.uniform(-gx * .35, gx * .35) if 0 < i < cols else 0),
             j * gy + (r.uniform(-gy * .35, gy * .35) if 0 < j < rows else 0)) for i in range(cols + 1)] for j in range(rows + 1)]
    for j in range(rows):
        for i in range(cols):
            a, b, c, d = pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]
            for tri in ((a, b, c), (a, c, d)) if (i + j) % 2 else ((a, b, d), (b, c, d)):
                my = sum(y for _, y in tri) / 3
                mx = sum(x for x, _ in tri) / 3
                t = my / H
                base = mix(OBSIDIAN, "#4a2418", t ** 1.6)
                glow = max(0, 1 - math.hypot(mx - 600, my - 820) / 600)
                col = mix(base, MOLTEN, glow * 0.45)
                col = shade(col, r.uniform(-0.18, 0.12))
                p.poly(tri, fill=col, stroke=col, stroke_width=0.6)
    # target chord as a faceted waveform panel
    p.poly([(250, 30), (950, 30), (980, 70), (950, 130), (250, 130), (220, 70)], fill="#2a1a22", stroke=OCHRE, stroke_width=2)
    wave = []
    for k in range(0, 141):
        x = 260 + k * 5
        y = 80 + 22 * math.sin(k * 0.21) + 12 * math.sin(k * 0.53 + 1) + 6 * math.sin(k * 0.9)
        wave.append((x, y))
    p.path(pd(wave[::2], close=False), fill="none", stroke=STARWHITE, stroke_width=3, stroke_linejoin="bevel")
    p.text(262, 56, "TARGET CHORD", size=14, family="sans-serif", fill=OCHRE, letter_spacing=3)
    # ring setting: faceted band
    cx, cy, R0, R1 = 600, 410, 150, 196
    n = 24
    for k in range(n):
        a1, a2 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
        quad = [(cx + R0 * math.cos(a1), cy + R0 * math.sin(a1)), (cx + R1 * math.cos(a1), cy + R1 * math.sin(a1)),
                (cx + R1 * math.cos(a2), cy + R1 * math.sin(a2)), (cx + R0 * math.cos(a2), cy + R0 * math.sin(a2))]
        light = 0.5 + 0.5 * math.cos(a1 + 2.2)
        p.poly(quad, fill=mix("#5a3a1a", "#f0c060", light), stroke="#2a1608", stroke_width=1)
    # the pitch wheel at the centre: 12 facets, the target steps lit
    target_steps = {0, 4, 7, 10}
    for k in range(12):
        a1, a2 = 2 * math.pi * k / 12 - math.pi / 2, 2 * math.pi * (k + 1) / 12 - math.pi / 2
        tri = [(cx, cy), (cx + 120 * math.cos(a1), cy + 120 * math.sin(a1)), (cx + 120 * math.cos(a2), cy + 120 * math.sin(a2))]
        lit = k in target_steps
        p.poly(tri, fill=shade(OCHRE if lit else "#3a2a2a", r.uniform(-0.15, 0.15) + (0.1 if lit else 0)),
               stroke="#1a1010", stroke_width=1.5)
    p.circle(cx, cy, 26, fill=OBSIDIAN, stroke=OCHRE, stroke_width=2)
    # four slots with shards; beat line above each
    slots = [(-90, 0, MOSS, 0), (0, 4, SEA, 1), (90, 9, VIOLET, 2), (180, 10, MOLTEN, 3)]
    state = {0: "still", 1: "slow", 2: "fast", 3: "still"}
    cracks = {0: 0, 1: 1, 2: 2, 3: 0}
    for ang, step, col, idx in slots:
        a = math.radians(ang - 90 + 45)
        sx, sy = cx + 173 * math.cos(a), cy + 173 * math.sin(a)
        p.circle(sx, sy, 50, fill="#2a1608", stroke="#f0c060", stroke_width=3)
        palette = [shade(col, k) for k in (0.45, 0.2, -0.05, -0.3, 0.1, -0.45, 0.3)]
        shard = p.facets(sx, sy, 40, palette, n=7, irregular=0.2, stroke="#ffffff", stroke_width=0.6, stroke_opacity=0.5)
        for c in range(cracks[idx]):
            zz = [(sx - 30 + c * 20, sy - 30)]
            for k in range(4):
                zz.append((zz[-1][0] + r.uniform(4, 12), zz[-1][1] + 15))
            p.path(pd(zz, close=False), fill="none", stroke="#fff", stroke_width=2)
        # beat line, set outside the ring
        bx, by = cx + 300 * math.cos(a), cy + 280 * math.sin(a)
        p.poly([(bx - 80, by - 26), (bx + 80, by - 26), (bx + 92, by), (bx + 80, by + 26), (bx - 80, by + 26), (bx - 92, by)],
               fill="#1a1016", stroke=col, stroke_width=2.5)
        freq = {"still": 0, "slow": 0.09, "fast": 0.5}[state[idx]]
        amp = {"still": 0, "slow": 15, "fast": 15}[state[idx]]
        wl = [(bx - 74 + k * 4, by + amp * math.sin(k * 4 * freq) * (0.6 + 0.4 * math.sin(k * 0.2))) for k in range(38)]
        p.path(pd(wl, close=False), fill="none", stroke=STARWHITE if state[idx] == "still" else col, stroke_width=2.5)
        p.line(sx, sy, bx, by, stroke=col, stroke_width=1, stroke_dasharray="3 5", opacity=0.6)
    # pitch lines between neighbouring shards (the chord being tuned)
    sp = []
    for ang, *_ in slots:
        a = math.radians(ang - 90 + 45)
        sp.append((cx + 173 * math.cos(a), cy + 173 * math.sin(a)))
    for i in range(4):
        (x1, y1), (x2, y2) = sp[i], sp[(i + 1) % 4]
        p.line(x1, y1, x2, y2, stroke=STARWHITE, stroke_width=1.2, opacity=0.35)
    # the tray below, faceted wood-stone
    p.poly([(140, 668), (1060, 668), (1100, 712), (1060, 780), (140, 780), (100, 712)], fill="#3a2414", stroke=OCHRE, stroke_width=2)
    tray_cols = [AMBER, PALEBLUE, OCHRE, PEARL, GOLD, MOSS, SEA]
    for k, col in enumerate(tray_cols):
        tx = 200 + k * 130
        if k == 3:
            continue
        p.facets(tx, 722, 26, [shade(col, j) for j in (0.4, 0.1, -0.2, -0.4, 0.2)], n=5, irregular=0.3)
    # shard being lifted, with drop shadow and cursor
    lx, ly = 590, 610
    p.ellipse(590, 724, 34, 10, fill="#000", opacity=0.4)
    p.facets(lx, ly, 30, [shade(PEARL, j) for j in (0.3, 0.0, -0.25, -0.45, 0.15, -0.1)], n=6, irregular=0.25)
    p.poly([(lx + 18, ly + 6), (lx + 22, ly + 46), (lx + 32, ly + 36), (lx + 42, ly + 56), (lx + 50, ly + 52),
            (lx + 40, ly + 32), (lx + 54, ly + 30)], fill=STARWHITE, stroke=OBSIDIAN, stroke_width=2)
    # hammers: strikes left
    for k in range(6):
        hx, hy = 960 + (k % 3) * 66, 200 + (k // 3) * 90
        used = k >= 4
        c1, c2 = ("#6a6a72", "#3a3a40") if used else ("#d0d4dc", "#8a8e98")
        p.poly([(hx - 22, hy - 10), (hx + 22, hy - 14), (hx + 26, hy + 2), (hx - 22, hy + 6)], fill=c1, opacity=0.45 if used else 1)
        p.poly([(hx + 22, hy - 14), (hx + 30, hy - 6), (hx + 26, hy + 2)], fill=c2, opacity=0.45 if used else 1)
        p.poly([(hx - 3, hy + 4), (hx + 3, hy + 4), (hx + 5, hy + 50), (hx - 5, hy + 50)], fill="#7a4a24", opacity=0.45 if used else 1)
    p.text(960, 170, "STRIKES 4", size=16, family="sans-serif", fill=OCHRE, letter_spacing=3)
    # strike button
    p.poly([(980, 400), (1150, 400), (1170, 440), (1150, 480), (980, 480), (960, 440)], fill=MOLTEN, stroke=STARWHITE, stroke_width=2)
    p.text(1008, 452, "STRIKE", size=30, family="sans-serif", fill=STARWHITE, letter_spacing=4, font_weight="bold")

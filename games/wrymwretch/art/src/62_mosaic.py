"""Six Realms: the board and eight pieces, laid in tesserae (Byzantine mosaic)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Six Realms pieces and board, with blank tessera and Wyrmguard"
BOARD = kit.data("six_realms")["board"]
GROUT = "#2a241c"
GOLDS = ["#c9a227", "#d8b13a", "#b8901d", "#e6c55c", "#a8841c"]
SUN, MOON = "#e2b33c", "#d9dde2"
# each realm's tesserae: main, light, dark
TONES = [(kit.shade(r["acc"], -0.18), kit.shade(r["acc"], 0.25), kit.shade(r["acc"], -0.5)) for r in kit.REALMS]


def inside(i, x, y):
    """Is (x, y), in the emblem's unit square, inside emblem i? (6 = the Wyrmguard's wyrm.)"""
    if i == 0:
        return abs(y) < 1 and abs(x) < 0.46 * (1 - y * y) ** 0.8
    if i == 1:
        return _in_poly(x, y, WING)
    if i == 2:
        return abs(y) < 1 and abs(x) < 0.62 and abs(x) * 0.93 + abs(y) < 1.0
    if i == 3:
        return x * x + (y - 0.28) ** 2 < 0.5 or (-1 < y < 0.3 and abs(x) < (y + 1) * 0.5)
    if i == 4:
        return x * x + y * y < 1 and (x - 0.42) ** 2 + y * y > 0.62
    if i == 5:
        return abs(x) ** 0.6 + abs(y) ** 0.6 < 1
    # the wyrm: an S with a head
    return (abs(y) < 0.86 and abs(x - 0.42 * math.sin(y * 3.3)) < 0.2) or math.hypot(x + 0.2, y + 0.86) < 0.3


WING = [(-1, .4), (-.72, -.35), (-.2, -.82), (.5, -.9), (1, -.6), (.52, -.42), (.78, -.12), (.32, -.14), (.42, .22), (-.02, .1), (-.1, .56), (-.5, .26)]


def _in_poly(x, y, poly):
    ins = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            ins = not ins
        j = i
    return ins


class Tiles:
    def __init__(self, a):
        self.a, self.groups = a, {}

    def tile(self, x, y, s, ang, col, gap=0.9):
        r = self.a.rng
        c, sn = math.cos(ang), math.sin(ang)
        h = s / 2 - gap
        pts = [(x + (-h * c + h * sn), y + (-h * sn - h * c)), (x + (h * c + h * sn), y + (h * sn - h * c)),
               (x + (h * c - h * sn), y + (h * sn + h * c)), (x + (-h * c - h * sn), y + (-h * sn + h * c))]
        q = [(round(px + r.uniform(-0.8, 0.8)), round(py + r.uniform(-0.8, 0.8))) for px, py in pts]
        d = f"M{q[0][0]} {q[0][1]}" + "".join(f"l{q[i][0] - q[i - 1][0]} {q[i][1] - q[i - 1][1]}" for i in (1, 2, 3)) + "z"
        self.groups.setdefault(col, []).append(d)

    def flush(self):
        for col, ds in self.groups.items():
            self.a.path("".join(ds), fill=col)
        self.groups.clear()

    def vary(self, col, spread=0.14):
        return kit.shade(col, self.a.rng.choice([-spread, -spread / 2, 0, spread / 2, spread]))


def gold_ground(a, x, y, w, h, s=20):
    """Gold ground as a repeating pattern of four tesserae, so it costs almost nothing."""
    pid = a.uid("gold")
    r = a.rng
    cells = "".join(f'<rect x="{i * s + 1.2 + r.uniform(-0.6, 0.6):.1f}" y="{j * s + 1.2 + r.uniform(-0.6, 0.6):.1f}" width="{s - 2.4:.1f}" height="{s - 2.4:.1f}" '
                    f'fill="{r.choice(GOLDS)}" transform="rotate({r.uniform(-3, 3):.1f} {i * s + s / 2} {j * s + s / 2})"/>'
                    for i in range(5) for j in range(5))
    a.defn(f'<pattern id="{pid}" width="{5 * s}" height="{5 * s}" patternUnits="userSpaceOnUse">{cells}</pattern>')
    a.rect(x, y, w, h, fill=GROUT)
    a.rect(x, y, w, h, fill=f"url(#{pid})")


def disc(a, T, cx, cy, R, emblem_i, main, light, rim, worn=0.0, ts=8.6):
    r = a.rng
    a.circle(cx + 5, cy + 8, R + 6, fill="#000", opacity=0.4, filter=a.blur(5))
    a.circle(cx, cy, R + 5, fill=GROUT)
    rr, k = R, 0
    while rr > ts * 0.45:
        n = max(1, int(2 * math.pi * rr / ts))
        off = r.uniform(0, 6.28)
        for t in range(n):
            an = off + 2 * math.pi * t / n
            x, y = cx + rr * math.cos(an), cy + rr * math.sin(an)
            if worn and r.random() < worn:
                continue
            if k == 0:
                col = rim
            elif emblem_i is not None and inside(emblem_i, (x - cx) / (R * 0.7), (y - cy) / (R * 0.7)):
                col = light
            else:
                col = main if k != 1 else kit.shade(main, -0.25)
            T.tile(x, y, ts, an + math.pi / 2, T.vary(col, 0.1))
        rr -= ts
        k += 1
    if emblem_i is not None and (not worn or r.random() > worn):
        T.tile(cx, cy, ts, 0.3, T.vary(light if inside(emblem_i, 0, 0) else main, 0.1))
    T.flush()


# ---- phase 3 (2026-11-16): the pieces redrawn. The ring-sampled emblems blurred to mush at tessera scale, and in play a
# disc is drawn 62 px wide. Now each emblem is an outline laid in tesserae the way a mosaicist lays it (andamento): one
# course of dark tesserae on the emblem's outline, inset courses of pale ones following it inward, and the ground's
# rings stopping a course short of the outline. Fewer, larger, higher-contrast tesserae, so the silhouette reads small.
def _circle(cx, cy, r, n=28, a0=0.0, a1=2 * math.pi):
    return [(cx + r * math.cos(a0 + (a1 - a0) * k / n), cy + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]


def _crescent():
    outer = _circle(0, 0, 0.95, 30, math.radians(55), math.radians(305))
    # the inner arc: a circle at (0.42, 0) of radius 0.72, the part inside the outer circle, walked back through its left side
    inner = _circle(0.38, 0, 0.7, 24, math.radians(-128), math.radians(-232))
    return outer + inner


def _wyrm():
    left, right = [], []
    n = 22
    for k in range(n + 1):
        y = -0.62 + 1.5 * k / n
        x = 0.42 * math.sin(y * 3.3)
        dx = 0.42 * 3.3 * math.cos(y * 3.3) * 1.5 / n
        L = math.hypot(dx, 1.5 / n)
        nx, ny = (1.5 / n) / L, -dx / L
        w = 0.17 * (0.55 + 0.45 * math.sin(math.pi * min(1, k / n + 0.1)))
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    head = _circle(-0.2, -0.82, 0.24, 14)
    return [left + right[::-1], head]


EMB = {
    0: [[(0, -1), (0.32, -0.62), (0.44, -0.1), (0.36, 0.42), (0.12, 0.8), (0, 1), (-0.12, 0.8), (-0.36, 0.42), (-0.44, -0.1), (-0.32, -0.62)]],
    1: [WING],
    2: [[(0, -1), (0.62, -0.42), (0.62, 0.46), (0, 1), (-0.62, 0.46), (-0.62, -0.42)]],
    3: [[(0, -1), (0.22, -0.55), (0.62, 0.05)] + _circle(0, 0.32, 0.66, 18, math.radians(-25), math.radians(205))[1:] + [(-0.62, 0.05), (-0.22, -0.55)]],
    4: [_crescent()],
    5: [[(0, -1), (0.2, -0.2), (1, 0), (0.2, 0.2), (0, 1), (-0.2, 0.2), (-1, 0), (-0.2, -0.2)]],
    6: _wyrm(),
}
# the emblem's own vein: a centre line in the light courses (leaf rib, crystal facet, wing quill)
VEIN = {0: [(0, -0.8), (0, 0.85)], 2: [(0, -1), (0, 1)], 1: [(-0.85, 0.32), (0.75, -0.62)]}


def _inside_any(polys, x, y):
    return any(_in_poly(x, y, pl) for pl in polys)


def _walk(pts, step):
    """Points every `step` along a closed polyline, with the direction there."""
    out, carry = [], 0.0
    P = pts + [pts[0]]
    for (x1, y1), (x2, y2) in zip(P, P[1:]):
        L = math.hypot(x2 - x1, y2 - y1)
        if L == 0:
            continue
        ang = math.atan2(y2 - y1, x2 - x1)
        d = carry
        while d < L:
            out.append((x1 + (x2 - x1) * d / L, y1 + (y2 - y1) * d / L, ang))
            d += step
        carry = d - L
    return out


def _inset(poly, k):
    """The polygon shrunk toward its centroid by k (a fraction of its size)."""
    cx = sum(p[0] for p in poly) / len(poly)
    cy = sum(p[1] for p in poly) / len(poly)
    return [(cx + (x - cx) * (1 - k), cy + (y - cy) * (1 - k)) for x, y in poly]


def disc2(a, T, cx, cy, R, ei, main, light, rim, contour, worn=0.0, ts=10.5):
    r = a.rng
    a.circle(cx + 5, cy + 8, R + 6, fill="#000", opacity=0.4, filter=a.blur(5))
    a.circle(cx, cy, R + 5, fill=GROUT)
    S = R * 0.66   # the emblem's unit, in px
    polys = [[(cx + x * S, cy + y * S) for x, y in pl] for pl in EMB[ei]] if ei is not None else []
    near = lambda x, y: any(_in_poly(x, y, pl) for pl in polys) or any(  # inside, or within a course of the outline
        min(math.hypot(x - px, y - py) for px, py, _ in _walk(pl, ts * 0.5)) < ts * 0.95 for pl in polys)
    # the ground: rings from the rim inward, a course short of the emblem
    rr, k = R, 0
    while rr > ts * 0.45:
        n = max(1, int(2 * math.pi * rr / ts))
        off = r.uniform(0, 6.28)
        for t in range(n):
            an = off + 2 * math.pi * t / n
            x, y = cx + rr * math.cos(an), cy + rr * math.sin(an)
            if (worn and r.random() < worn) or (polys and near(x, y)):
                continue
            col = rim if k == 0 else (kit.shade(main, -0.28) if k == 1 else main)
            T.tile(x, y, ts, an + math.pi / 2, T.vary(col, 0.09))
        rr -= ts
        k += 1
    # the outline: one course of dark tesserae laid along it
    for pl in polys:
        for x, y, ang in _walk(pl, ts * 0.92):
            if worn and r.random() < worn:
                continue
            T.tile(x, y, ts * 0.95, ang, T.vary(contour, 0.08))
    # the fill: inset courses following the outline inward
    for pl in polys:
        span = max(max(p[0] for p in pl) - min(p[0] for p in pl), max(p[1] for p in pl) - min(p[1] for p in pl))
        kk = 1
        while True:
            frac = kk * ts * 1.0 / (span / 2)
            if frac >= 0.97:
                break
            ip = _inset(pl, frac)
            for x, y, ang in _walk(ip, ts * 0.92):
                if (worn and r.random() < worn) or not _in_poly(x, y, pl):   # a concave emblem (the crescent) keeps its hollow
                    continue
                T.tile(x, y, ts * 0.9, ang, T.vary(light, 0.06))
            kk += 1
        ccx = sum(p[0] for p in pl) / len(pl)
        ccy = sum(p[1] for p in pl) / len(pl)
        if _in_poly(ccx, ccy, pl):
            T.tile(ccx, ccy, ts * 0.9, 0.2, T.vary(light, 0.06))
    T.flush()
    if ei in VEIN:
        (x1, y1), (x2, y2) = VEIN[ei]
        a.path(f"M{f(cx + x1 * S)},{f(cy + y1 * S)} L{f(cx + x2 * S)},{f(cy + y2 * S)}", stroke=contour, stroke_width=2.4, opacity=0.55, stroke_linecap="round")


MOVES = ["Moves 1 hex; leaves a Grove", "Up to 3 in a line, jumping", "Moves 1; safe at home; raises a Stone", "Up to 2; may push a piece",
         "Moves 1, or swaps within 2", "Moves 1; shelters its neighbours"]


def reg_piece(i):
    realm = kit.REALMS[i]

    @asset(G, f"realms-piece-{realm['tribe'].lower()}", group="pieces", title=f"Six Realms piece: {realm['tribe']}", w=240, h=240, row=ROW)
    def draw(a: Art):
        a.open("g", class_="plate")   # the gold ground; on the board the disc stands alone
        gold_ground(a, 0, 0, 240, 240)
        a.rect(0, 0, 240, 240, fill=a.radial([(0.4, "#000000", 0), (1, "#000000", 0.45)], 0.5, 0.5, 0.75))
        a.close()
        T = Tiles(a)
        main, light, dark = TONES[i]
        disc2(a, T, 120, 116, 96, i, dark if i in (4,) else main, "#f6f0dc" if i != 5 else "#fff3c0", kit.BONE, "#14111a")
        a.circle(120, 116, 101, fill="none", stroke="#fff", stroke_width=1.2, opacity=0.25)
    draw.__doc__ = (f"Six Realms piece in tesserae on a gold ground: the {realm['tribe']} tribe, its emblem laid in pale stone on {realm['name']} colour, "
                    f"outlined by one course of near-black tesserae and filled in courses that follow the outline (redrawn 2026-11-16 to read "
                    f"at tessera scale), bone-white rim. {MOVES[i]}.")
    return draw


for _i in range(6):
    reg_piece(_i)


@asset(G, "realms-piece-blank-tessera", group="pieces", title="Six Realms piece: the blank tessera", w=240, h=240, row=ROW)
def blank_tessera(a: Art):
    """The blank tessera, the Remnants' neutral piece: one large unlaid tile, bone-grey and cracked, with no emblem. The gold
    ground round it has gone dull, as pieces beside it lose their powers."""
    gold_ground(a, 0, 0, 240, 240)
    a.circle(120, 120, 150, fill=a.radial([(0, "#8e8a80", 0.95), (0.55, "#8e8a80", 0.8), (1, "#8e8a80", 0)]))
    a.rect(0, 0, 240, 240, fill=a.radial([(0.4, "#000000", 0), (1, "#000000", 0.45)], 0.5, 0.5, 0.75))
    pts = [(52, 60), (184, 50), (192, 186), (60, 192)]
    a.path(kit.pd(pts), fill="#000", opacity=0.45, filter=a.blur(5), transform="translate(6,9)")
    a.path(kit.pd([(46, 54), (190, 44), (198, 192), (54, 198)]), fill=GROUT)
    a.path(kit.pd(pts), fill=a.gradient([(0, "#efeadb"), (0.5, "#d2ccbb"), (1, "#a39c8a")], 0, 0, 1, 1), filter=a.roughen(3, 0.06))
    cl = a.clip(f'<path d="{kit.pd(pts)}"/>')
    kit.cracks(a, 60, 60, 120, 120, n=5, length=90, clip=cl, width=1.1)
    a.path("M58,66 L180,56", stroke="#fff", stroke_width=3, opacity=0.6, fill="none")
    a.stipple(56, 56, 130, 130, n=60, r=(0.5, 1.4), fill="#6d6759", opacity=0.6)


@asset(G, "realms-piece-wyrmguard", group="pieces", title="Six Realms piece: the Wyrmguard", w=240, h=240, row=ROW)
def wyrmguard(a: Art):
    """The worn seventh colour from Ilvarra's board: a Wyrmguard piece in bone and tarnished silver, a coiled wyrm for its
    emblem, tesserae missing where it has been handled for an age."""
    gold_ground(a, 0, 0, 240, 240)
    a.rect(0, 0, 240, 240, fill=a.radial([(0.4, "#000000", 0), (1, "#000000", 0.45)], 0.5, 0.5, 0.75))
    T = Tiles(a)
    disc2(a, T, 120, 116, 96, 6, "#59616d", kit.BONE, "#aab1bb", "#14111a", worn=0.05)


@asset(G, "realms-board", group="maps", title="The Six Realms board", w=1200, h=1200, row=ROW)
def board(a: Art):
    """The Six Realms board as a Byzantine mosaic on a gold ground: nineteen hexes in tesserae, Wrymreach at the centre in sun
    gold and moon silver, the six Thresholds round it each with its tribe's emblem, and the twelve homes outside in realm colours."""
    r = a.rng
    gold_ground(a, 0, 0, 1200, 1200, s=24)
    a.rect(0, 0, 1200, 1200, fill=a.radial([(0.5, "#000000", 0), (1, "#000000", 0.4)], 0.5, 0.5, 0.75))
    T = Tiles(a)
    # border: two courses, bone and void
    for k in range(60):
        for side in range(4):
            t = 30 + k * 19.3
            x, y = [(t, 22), (1178, t), (1200 - t, 1178), (22, 1200 - t)][side]
            T.tile(x, y, 18, 0, T.vary(kit.BONE if k % 2 else "#1a1c30", 0.08))
            x2, y2 = [(t, 42), (1158, t), (1200 - t, 1158), (42, 1200 - t)][side]
            if 2 <= k <= 57:
                T.tile(x2, y2, 18, 0, T.vary("#8E97A3" if k % 2 else kit.BONE, 0.08))
    T.flush()
    R, ts = 112, 15.5
    cx0, cy0 = 600, 600
    for hx in BOARD["hexes"]:
        q, rr_ = hx["q"], hx["r"]
        x, y = cx0 + R * 1.5 * q, cy0 + R * math.sqrt(3) * (rr_ + q / 2)
        a.poly(a.ngon(x, y, R + 4, 6, 0), fill=GROUT)
        i = kit.REALM_IX.get(hx["realm"]) if hx["realm"] else None
        k, rr = 0, R - 7
        while rr > ts * 0.6:
            n = max(1, int(6 * rr / ts))
            for t in range(n):
                u = t / n * 6
                side = int(u)
                fr = u - side
                a1, a2 = math.radians(60 * side), math.radians(60 * (side + 1))
                px = x + rr * (math.cos(a1) * (1 - fr) + math.cos(a2) * fr)
                py = y + rr * (math.sin(a1) * (1 - fr) + math.sin(a2) * fr)
                ang = math.atan2(math.sin(a2) - math.sin(a1), math.cos(a2) - math.cos(a1))
                if hx["kind"] == "centre":
                    d = math.hypot(px - x, py - y)
                    an = math.atan2(py - y, px - x)
                    spiral = math.sin(an * 1 + d / 14) > 0
                    col = "#14152a" if d < 30 else (SUN if spiral else MOON)
                elif hx["kind"] == "threshold":
                    main, light, dark = TONES[i]
                    col = "#f4eeda" if inside(i, (px - x) / 50, (py - y) / 50) else (dark if k in (0, 1) else main)
                else:
                    main, light, dark = TONES[i]
                    col = light if k % 3 == 1 else main
                    if k == 0:
                        col = kit.BONE
                T.tile(px, py, ts, ang, T.vary(col))
            rr -= ts
            k += 1
        if hx["kind"] == "centre":
            col = "#14152a"
        else:
            col = "#f4eeda" if hx["kind"] == "threshold" and inside(i, 0, 0) else TONES[i][0]
        T.tile(x, y, ts, 0.3, T.vary(col))
    T.flush()
    a.circle(600, 600, 26, fill=kit.VIOLET, opacity=0.5, filter=a.blur(8))
    a.rect(0, 0, 1200, 1200, fill=a.radial([(0, "#fff8dc", 0.12), (1, "#fff8dc", 0)], 0.35, 0.3, 0.6))

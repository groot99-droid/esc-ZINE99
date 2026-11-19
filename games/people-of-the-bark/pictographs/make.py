"""People of the Bark gameplay pictographs. Built by tools/pictographs/build.py."""
import math

from core import H, W, Pic, f, register

G = "people-of-the-bark"

# The game's palette (DESIGN.md section 15): bark umber and grey-brown, lichen sage and lime,
# sap amber and gold, lantern orange.
UMBER, UMBER_D, GREYBROWN = "#5a3d2b", "#3a281c", "#7d6c5a"
SAGE, LIME = "#8fa37a", "#c4d65a"
AMBER, GOLD, LANTERN = "#d9902a", "#f0c050", "#e8742a"
PAPER = "#efe2c4"


# ---------------------------------------------------------------------------------------------
# Crack runner: pixel art
# ---------------------------------------------------------------------------------------------
PIX16 = ["#1b120c", "#2e2016", "#4a3324", "#5a3d2b", "#7a5a40", "#7d6c5a", "#a8977f", "#8fa37a",
         "#c4d65a", "#d9902a", "#f0c050", "#e8742a", "#b8402a", "#efe2c4", "#c9b99a", "#fff6dc"]


def emit_pixels(p, buf, size):
    """Emit a cell buffer as run-merged rects, one path per colour."""
    by_col = {}
    for j, row in enumerate(buf):
        i = 0
        while i < len(row):
            c = row[i]
            k = i
            while k < len(row) and row[k] == c:
                k += 1
            if c is not None:
                by_col.setdefault(c, []).append(f"M{i * size},{j * size}h{(k - i) * size}v{size}h{-(k - i) * size}z")
            i = k
    for c, ds in by_col.items():
        p.path("".join(ds), fill=PIX16[c], shape_rendering="crispEdges")


def stamp(buf, x, y, rows, pal):
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch in pal and 0 <= y + j < len(buf) and 0 <= x + i < len(buf[0]):
                buf[y + j][x + i] = pal[ch]


@register(G, "crack-runner")
def crack_runner(p: Pic):
    """Crack runner (2D): Mossa, in her long red scarf, leaps from ledge to ledge up a crack in the
    bark, carrying a reading between cities. Sap drips from above, a mite walks the next ledge, a
    lichen tuft waits to bounce her higher, and a sheet of dust is falling after a tremor. The strip
    at the top shows her mark on the route and the tremor due ahead; the brace marker is lit."""
    S = 10
    cw, ch = W // S, H // S
    r = p.rng
    # bark: vertical ridges with dithered shading
    ridge = [r.choice([2, 3, 3, 4]) for _ in range(cw)]
    buf = []
    for j in range(ch):
        row = []
        for i in range(cw):
            v = ridge[i]
            if (i + j) % 2 == 0 and r.random() < 0.18:
                v = max(1, v - 1)
            if i % 7 == 0:
                v = 1
            row.append(v)
        buf.append(row)
    # the crack: a channel climbing from lower left to upper right
    centre = [62 - i * 0.42 + 4 * math.sin(i / 6.0) for i in range(cw)]
    half = [13 + 2 * math.sin(i / 4.3) for i in range(cw)]
    for i in range(cw):
        top, bot = int(centre[i] - half[i]), int(centre[i] + half[i])
        for j in range(max(6, top), min(ch, bot)):
            d = min(j - top, bot - j)
            buf[j][i] = 0 if d > 3 else 1
            if d == 0:
                buf[j][i] = 5
    # ledges: stepped platforms along the crack
    ledges = []
    x = 2
    while x < cw - 6:
        w = r.randint(9, 14)
        y = int(centre[x + w // 2] + half[x + w // 2] * 0.35) - (len(ledges) % 2) * 5
        ledges.append((x, y, w))
        for i in range(x, min(cw, x + w)):
            buf[y][i] = 6
            buf[y + 1][i] = 4
            buf[y + 2][i] = 3
            if (i - x) % 3 == 0:
                buf[y + 3][i] = 2
        x += w + r.randint(3, 5)
    # sap drips from the crack's upper lip
    for dx in (34, 35, 66):
        top = int(centre[dx] - half[dx]) + 1
        for j in range(top, top + 9):
            buf[j][dx] = 9 if j < top + 7 else 10
        buf[top + 11][dx] = 10
        buf[top + 12][dx] = 9
    # falling dust sheet on the right: a dithered curtain
    for j in range(20, ch - 4):
        for i in range(94, 104):
            if (i + j) % 2 == 0 and r.random() < 0.55 + 0.3 * math.sin(j / 5):
                buf[j][i] = 14
    # lichen tuft on ledge 1, mite on ledge 4
    lx, ly, lw = ledges[1]
    stamp(buf, lx + 3, ly - 3, [".g.g.", "ggGgg", "gGGGg"], {"g": 7, "G": 8})
    mx, my, mw = ledges[4]
    stamp(buf, mx + 4, my - 3, [".m.m.", "mMMMm", "m.m.m"], {"m": 12, "M": 11})
    # Mossa mid-jump above ledge 2, scarf trailing
    ax, ay, aw = ledges[2]
    mos = ["....hh....",
           "...hhhh...",
           "...hFFh...",
           "...FFFF...",
           "rrrrSSr...",
           ".rrrSSSrr.",
           "....SSS..r",
           "...SS.SS..",
           "..SS...SS.",
           "..s.....s."]
    big = [("".join(c * 2 for c in row)) for row in mos for _ in (0, 1)]
    stamp(buf, ax + aw - 8, ay - 26, big, {"h": 1, "F": 13, "S": 6, "r": 12, "s": 1})
    # jump arc: dotted gold pixels to the next ledge
    nx, ny, nw = ledges[3]
    sx, sy = ax + aw + 13, ay - 14
    ex, ey = nx + 3, ny - 1
    for t in range(1, 9):
        u = t / 9
        px = int(sx + (ex - sx) * u)
        py = int(sy + (ey - sy) * u - 10 * math.sin(math.pi * u))
        buf[py][px] = 10
    # HUD: bark strip with route, Mossa's mark and the tremor mark
    for j in range(0, 6):
        for i in range(cw):
            buf[j][i] = 1 if j in (0, 5) else 3
    for i in range(6, cw - 6):
        buf[2][i] = 13 if i % 2 else 6
        buf[3][i] = 6
    for i, c in ((6, 7), (cw - 7, 7)):
        stamp(buf, i - 1, 1, ["CCC", "CCC", "CCC", "CCC"], {"C": c})
    stamp(buf, 46, 1, [".r.", "rrr", "rrr", ".r."], {"r": 12})          # Mossa
    stamp(buf, 74, 1, ["o.o", ".o.", "o.o", "o.o"], {"o": 11})          # tremor due
    # brace marker
    stamp(buf, 110, 9, ["..oo..", ".oooo.", "oowwoo", "oowwoo", "oooooo", "oowwoo", ".oooo.", "..oo.."],
          {"o": 11, "w": 15})
    emit_pixels(p, buf, S)
    p.text(964, 152, "BRACE", size=22, family="monospace", fill=PIX16[15], font_weight="bold")
    p.text(30, 46, "HIGHRIDGE", size=16, family="monospace", fill=PIX16[15])
    p.text(1060, 46, "LOWRIDGE", size=16, family="monospace", fill=PIX16[15])
    p.text(30, 780, "SEG 2/3   2:41", size=22, family="monospace", fill=PIX16[10], font_weight="bold")


# ---------------------------------------------------------------------------------------------
# Crack defence: isometric diorama
# ---------------------------------------------------------------------------------------------
def shade(hexc, k):
    c = [int(hexc[i:i + 2], 16) for i in (1, 3, 5)]
    c = [max(0, min(255, int(v * k))) for v in c]
    return "#" + "".join(f"{v:02x}" for v in c)


@register(G, "crack-defence")
def crack_defence(p: Pic):
    """Crack defence (2D): the crack is a diorama of bark blocks, held by five barricade lines.
    Captain Burr's warriors, spears up, stand at the near lines while a huge ground beetle pushes
    against the far barricade; an amber pool of sap-glue slows it. The bar above shows five notches,
    one already lost, and the beetle's will draining."""
    p.rect(0, 0, W, H, fill=p.gradient([(0, "#2b1d14"), (1, "#5a3d2b")]))
    p.vignette(0.5)
    s, ox, oy = 54, 360, 262

    def P(x, y, z):
        return p.iso(x, y, z, s, ox, oy)

    def cube(x, y, z, col, h=1.0, w=1.0, d=1.0):
        top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]
        left = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]
        right = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]
        sw = dict(stroke="#1b120c", stroke_width=1.2, stroke_linejoin="round")
        p.poly(left, fill=shade(col, 0.72), **sw)
        p.poly(right, fill=shade(col, 0.52), **sw)
        p.poly(top, fill=col, **sw)
        # bark grain on the top
        a, b = P(x + 0.2, y + 0.5, z + h), P(x + w - 0.2, y + 0.5, z + h)
        p.line(*a, *b, stroke=shade(col, 0.8), stroke_width=1)

    NX, NY = 14, 5
    items = []
    r = p.rng
    # the plinth
    base = [P(0, 0, 0), P(NX, 0, 0), P(NX, NY, 0), P(NX, NY, -0.6), P(0, NY, -0.6), P(0, NY, 0)]
    p.poly([P(0, NY, 0), P(NX, NY, 0), P(NX, NY, -0.7), P(0, NY, -0.7)], fill="#24180f")
    p.poly([P(NX, 0, 0), P(NX, NY, 0), P(NX, NY, -0.7), P(NX, 0, -0.7)], fill="#170f0a")
    for x in range(NX):
        for y in range(NY):
            if y == 0:
                hgt = r.choice([3, 3, 4, 4, 5])        # back wall of the crack
                for z in range(hgt):
                    items.append((x + y, z, lambda x=x, y=y, z=z: cube(x, y, z, r.choice([UMBER, "#6a4a33", GREYBROWN]))))
            elif y == NY - 1 and x % 3 == 0:
                items.append((x + y, 0, lambda x=x, y=y: cube(x, y, 0, GREYBROWN, h=0.6)))
                items.append((x + y, 0.1, lambda x=x, y=y: cube(x, y, 0, "#6a4a33", h=0.5)))
            else:
                items.append((x + y, -1, lambda x=x, y=y: cube(x, y, -0.3, "#6a4a33" if (x + y) % 2 else UMBER, h=0.3)))
    # lichen on the wall tops
    # barricade lines at x = 2, 5, 8, 11, 13 (13 has fallen)
    lines_x = [1.6, 4.6, 7.6, 10.6, 12.6]
    for k, bx in enumerate(lines_x):
        fallen = k == 4
        for y in range(1, NY):
            hb = 0.35 if fallen else 0.9
            items.append((bx + y + 0.2, 0.5, lambda bx=bx, y=y, hb=hb, fallen=fallen:
                          cube(bx, y, 0, "#9a7a52" if not fallen else "#4a3324", h=hb, w=0.35)))
            if not fallen:
                # sharpened splinter stakes
                def stakes(bx=bx, y=y):
                    for t in (0.25, 0.75):
                        a = P(bx + 0.17, y + t, 0.9)
                        b = P(bx + 0.17, y + t, 1.35)
                        p.line(*a, *b, stroke="#e6cfa0", stroke_width=4, stroke_linecap="round")
                items.append((bx + y + 0.25, 1, stakes))
    # sap-glue pool before line 4
    def pool():
        pts = []
        for i in range(24):
            a = 2 * math.pi * i / 24
            rr = 1.0 + 0.15 * math.sin(i * 1.7)
            pts.append(P(11.6 + rr * 0.7 * math.cos(a), 2.5 + rr * 1.3 * math.sin(a), 0.01))
        p.poly(pts, fill=AMBER, opacity=0.85, stroke=GOLD, stroke_width=2)
        for i in range(6):
            q = P(11.3 + r.random() * 0.8, 1.8 + r.random() * 1.5, 0.01)
            p.circle(*q, 3 + r.random() * 3, fill=GOLD, opacity=0.8)
    items.append((13.0, -0.5, pool))

    # the beetle: a domed shell of stacked iso ellipses
    def beetle():
        cx, cy = 12.3, 2.6
        bx, by = P(cx, cy, 0.4)
        p.ellipse(bx, by + 40, 120, 40, fill="#000", opacity=0.35)
        for leg in range(3):
            for sgn in (-1, 1):
                a = P(cx - 0.6 + leg * 0.6, cy + sgn * 0.6, 0.6)
                b = P(cx - 0.9 + leg * 0.7, cy + sgn * 1.4, 0)
                p.path(f"M{f(a[0])},{f(a[1])} Q{f((a[0] + b[0]) / 2)},{f(min(a[1], b[1]) - 30)} {f(b[0])},{f(b[1])}",
                       fill="none", stroke="#120c08", stroke_width=6, stroke_linecap="round")
        grad = p.radial([(0, "#4d5a4a", 1), (0.55, "#1e2420", 1), (1, "#0c0f0d", 1)], cx=0.38, cy=0.3)
        p.ellipse(bx, by - 20, 115, 72, fill=grad, stroke="#000", stroke_width=2)
        p.line(bx - 8, by - 90, bx + 20, by + 48, stroke="#000", stroke_width=3)
        hx, hy = P(cx - 1.25, cy + 0.2, 0.7)
        p.ellipse(hx, hy, 40, 30, fill="#151a17", stroke="#000", stroke_width=2)
        for sgn in (-1, 1):
            p.path(f"M{f(hx - 20)},{f(hy + sgn * 8)} q-40,{sgn * 6} -52,{sgn * 30}", fill="none",
                   stroke="#0c0f0d", stroke_width=7, stroke_linecap="round")
        p.ellipse(bx - 40, by - 55, 26, 12, fill="#cfe0c8", opacity=0.35)
    items.append((14.2, 2, beetle))

    # warriors at lines 2 and 3, Burr at line 3
    def warrior(x, y, crest=False, lead=False):
        def draw():
            fx, fy = P(x, y, 0)
            p.open("g", transform=f"translate({f(fx)} {f(fy)}) scale(1.45) translate({f(-fx)} {f(-fy)})")
            p.ellipse(fx, fy, 12, 5, fill="#000", opacity=0.4)
            p.path(f"M{f(fx - 9)},{f(fy)} L{f(fx - 6)},{f(fy - 34)} L{f(fx + 6)},{f(fy - 34)} L{f(fx + 9)},{f(fy)}Z",
                   fill="#8a6a48", stroke="#1b120c", stroke_width=1.5)
            p.circle(fx, fy - 44, 10, fill="#d9b88a", stroke="#1b120c", stroke_width=1.5)
            p.path(f"M{f(fx - 11)},{f(fy - 46)} a11,11 0 0,1 22,0Z", fill="#4a3324")
            if crest:
                p.path(f"M{f(fx - 4)},{f(fy - 56)} q8,-22 22,-14 q-10,2 -14,16Z", fill=LANTERN, stroke="#1b120c")
            p.line(fx + 12, fy + 4, fx + 18, fy - 70, stroke="#e6cfa0", stroke_width=3)
            p.poly([(fx + 18, fy - 70), (fx + 14, fy - 58), (fx + 22, fy - 58)], fill="#f6e8c8")
            p.close()
        items.append((x + y + 0.3, 0.6, draw))
    for wy in (1.6, 2.8, 3.9):
        warrior(4.1, wy)
    warrior(7.1, 1.7)
    warrior(7.1, 3.4, crest=True)
    warrior(10.1, 2.5)
    for key, z, fn in sorted(items, key=lambda t: (t[0], t[1])):
        fn()
    # fall-back arrow from line 4 toward line 3
    a, b = P(10.4, 4.6, 1.8), P(8.2, 4.6, 1.8)
    p.path(f"M{f(a[0])},{f(a[1])} L{f(b[0])},{f(b[1])}", stroke=GOLD, stroke_width=5, fill="none",
           stroke_dasharray="14 8")
    p.poly([(b[0] - 4, b[1] - 3), (b[0] + 18, b[1] - 14), (b[0] + 12, b[1] + 10)], fill=GOLD)
    # HUD: five notches and the will bar
    hx, hy = 690, 40
    p.rect(hx - 16, hy - 16, 480, 124, rx=10, fill="#1b120c", opacity=0.85, stroke=GOLD, stroke_width=2)
    p.text(hx, hy + 14, "LINES", size=18, family="sans-serif", fill="#efe2c4", letter_spacing=3)
    for k in range(5):
        on = k < 4
        p.poly([(hx + 90 + k * 54, hy - 2), (hx + 132 + k * 54, hy - 2), (hx + 122 + k * 54, hy + 22),
                (hx + 80 + k * 54, hy + 22)], fill=LIME if on else "#3a281c", stroke="#efe2c4", stroke_width=1.5)
    p.text(hx, hy + 70, "WILL", size=18, family="sans-serif", fill="#efe2c4", letter_spacing=3)
    p.rect(hx + 80, hy + 52, 360, 24, fill="#3a281c", stroke="#efe2c4", stroke_width=1.5)
    p.rect(hx + 82, hy + 54, 360 * 0.38, 20, fill=LANTERN)
    p.text(1150, 750, "LINE 5 FALLEN  \u00b7  SOUND THE FALL-BACK", size=20, family="sans-serif", fill=GOLD,
           text_anchor="end", letter_spacing=2)
    p.text(hx + 300, hy + 100, "beetle: read as monster", size=16, family="serif", font_style="italic", fill=GOLD)


# ---------------------------------------------------------------------------------------------
# Omen Spread: marginalia drolleries
# ---------------------------------------------------------------------------------------------
INK, RUBRIC, AZURE, LEAF = "#2b1d14", "#a8321e", "#2f4f8a", "#5f7a3e"


def vine(p, pts, leaves=True, stroke=INK, width=2.2):
    p.path(p.smooth_d(pts), fill="none", stroke=stroke, stroke_width=width, stroke_linecap="round")
    r = p.rng
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        side = 1 if i % 2 else -1
        # a curling tendril
        d = f"M{f(x)},{f(y)}"
        for k in range(1, 10):
            a = side * k * 0.55
            rr = 26 - k * 2.3
            d += f" L{f(x + side * rr * math.cos(a) * 0.9 + side * k * 2)},{f(y + rr * math.sin(a) * 0.9 - 10)}"
        p.path(d, fill="none", stroke=stroke, stroke_width=1.3)
        if leaves:
            lx, ly = x - side * 14, y + 8
            col = r.choice([LEAF, RUBRIC, AZURE, GOLD])
            p.path(f"M{f(x)},{f(y)} Q{f(lx - side * 4)},{f(ly - 16)} {f(lx - side * 18)},{f(ly + 4)} "
                   f"Q{f(lx)},{f(ly + 10)} {f(x)},{f(y)}Z", fill=col, stroke=INK, stroke_width=1)


def snail(p, x, y, s=1.0):
    p.path(f"M{f(x - 40 * s)},{f(y)} q{f(10 * s)},{f(-14 * s)} {f(30 * s)},{f(-10 * s)} l{f(56 * s)},0 "
           f"q{f(14 * s)},0 {f(18 * s)},{f(10 * s)}Z", fill="#d8c49a", stroke=INK, stroke_width=1.5)
    for sgn in (0, 1):
        p.line(x - 36 * s, y - 8 * s, x - 48 * s - sgn * 6 * s, y - 30 * s + sgn * 4, stroke=INK, stroke_width=1.5)
        p.circle(x - 48 * s - sgn * 6 * s, y - 30 * s + sgn * 4, 2.5 * s, fill=INK)
    d = ""
    for k in range(60):
        a = k * 0.32
        rr = 30 * s * (1 - k / 66)
        d += ("M" if k == 0 else "L") + f"{f(x + 14 * s + rr * math.cos(a))},{f(y - 30 * s + rr * math.sin(a))}"
    p.circle(x + 14 * s, y - 30 * s, 30 * s, fill=GOLD, stroke=INK, stroke_width=1.5)
    p.path(d, fill="none", stroke=RUBRIC, stroke_width=2)


def grotesque(p, x, y, s=1.0, flip=1):
    """A long-necked hybrid: bird head, hare ears, leafy tail."""
    k = flip
    p.ellipse(x, y, 34 * s, 20 * s, fill=AZURE, stroke=INK, stroke_width=1.5)
    p.path(f"M{f(x + k * 24 * s)},{f(y - 10 * s)} C{f(x + k * 50 * s)},{f(y - 40 * s)} {f(x + k * 30 * s)},{f(y - 70 * s)} "
           f"{f(x + k * 52 * s)},{f(y - 80 * s)}", fill="none", stroke=INK, stroke_width=6 * s)
    p.path(f"M{f(x + k * 24 * s)},{f(y - 10 * s)} C{f(x + k * 50 * s)},{f(y - 40 * s)} {f(x + k * 30 * s)},{f(y - 70 * s)} "
           f"{f(x + k * 52 * s)},{f(y - 80 * s)}", fill="none", stroke=AZURE, stroke_width=3.5 * s)
    hx, hy = x + k * 56 * s, y - 84 * s
    p.circle(hx, hy, 12 * s, fill="#e8d6b0", stroke=INK, stroke_width=1.5)
    p.poly([(hx + k * 10 * s, hy - 3 * s), (hx + k * 30 * s, hy + 2 * s), (hx + k * 10 * s, hy + 5 * s)], fill=GOLD,
           stroke=INK, stroke_width=1)
    p.circle(hx + k * 3 * s, hy - 3 * s, 2 * s, fill=INK)
    for e in (-1, 1):
        p.ellipse(hx - k * 6 * s + e * 4 * s, hy - 22 * s, 4 * s, 13 * s, fill="#e8d6b0", stroke=INK, stroke_width=1)
    for lx in (-14, 12):
        p.path(f"M{f(x + lx * s)},{f(y + 16 * s)} l{f(-4 * s)},{f(22 * s)} l{f(8 * s)},0", fill="none", stroke=INK,
               stroke_width=2)
    vine(p, [(x - k * 32 * s, y), (x - k * 60 * s, y + 10 * s), (x - k * 80 * s, y - 14 * s),
             (x - k * 104 * s, y - 4 * s)], stroke=INK, width=2)


def sigil(p, kind, x, y, s=1.0, col=INK):
    if kind == "eye":
        p.path(f"M{f(x - 22 * s)},{f(y)} Q{f(x)},{f(y - 20 * s)} {f(x + 22 * s)},{f(y)} Q{f(x)},{f(y + 20 * s)} "
               f"{f(x - 22 * s)},{f(y)}Z", fill="none", stroke=col, stroke_width=2.5)
        p.circle(x, y, 6 * s, fill=col)
    elif kind == "spear":
        p.line(x, y + 24 * s, x, y - 14 * s, stroke=col, stroke_width=3)
        p.poly([(x, y - 28 * s), (x - 8 * s, y - 12 * s), (x + 8 * s, y - 12 * s)], fill=col)
        p.line(x - 9 * s, y + 6 * s, x + 9 * s, y + 6 * s, stroke=col, stroke_width=2)
    else:  # quill
        p.path(f"M{f(x - 14 * s)},{f(y + 24 * s)} Q{f(x - 4 * s)},{f(y - 4 * s)} {f(x + 16 * s)},{f(y - 26 * s)} "
               f"Q{f(x + 10 * s)},{f(y + 4 * s)} {f(x - 14 * s)},{f(y + 24 * s)}Z", fill="none", stroke=col,
               stroke_width=2.5)
        p.line(x - 14 * s, y + 24 * s, x + 8 * s, y - 12 * s, stroke=col, stroke_width=1.5)


def suit_mark(p, suit, x, y, s=1.0):
    if suit == "tremor":
        d = f"M{f(x - 22 * s)},{f(y)}"
        for k in range(1, 12):
            d += f" L{f(x - 22 * s + k * 4 * s)},{f(y + (10 if k % 2 else -10) * s * (1 - abs(k - 6) / 7))}"
        p.path(d, fill="none", stroke=RUBRIC, stroke_width=2.5, stroke_linejoin="round")
    elif suit == "rain":
        p.path(f"M{f(x)},{f(y - 14 * s)} Q{f(x + 12 * s)},{f(y + 4 * s)} {f(x)},{f(y + 12 * s)} "
               f"Q{f(x - 12 * s)},{f(y + 4 * s)} {f(x)},{f(y - 14 * s)}Z", fill=AZURE)
    elif suit == "leaf":
        p.path(f"M{f(x - 14 * s)},{f(y + 10 * s)} Q{f(x - 10 * s)},{f(y - 14 * s)} {f(x + 14 * s)},{f(y - 12 * s)} "
               f"Q{f(x + 10 * s)},{f(y + 10 * s)} {f(x - 14 * s)},{f(y + 10 * s)}Z", fill=LEAF)
    else:
        p.circle(x, y, 9 * s, fill="none", stroke=RUBRIC, stroke_width=2.5)


def card(p, cx, cy, w, h, rot, title, suit, sig, weight, face=True, glow=False):
    p.open("g", transform=f"rotate({f(rot)} {f(cx)} {f(cy)})")
    if glow:
        p.rect(cx - w / 2 - 10, cy - h / 2 - 10, w + 20, h + 20, rx=16, fill=GOLD, opacity=0.35)
    p.rect(cx - w / 2 + 5, cy - h / 2 + 6, w, h, rx=10, fill="#000", opacity=0.18)
    p.rect(cx - w / 2, cy - h / 2, w, h, rx=10, fill="#f7ecd2" if face else "#7a3a22", stroke=INK, stroke_width=2)
    if face:
        p.rect(cx - w / 2 + 8, cy - h / 2 + 8, w - 16, h - 16, rx=6, fill="none", stroke=RUBRIC, stroke_width=1.2)
        sigil(p, sig, cx, cy - h * 0.12, 1.3)
        suit_mark(p, suit, cx - w / 2 + 26, cy - h / 2 + 28, 0.8)
        for k in range(weight):
            p.circle(cx + w / 2 - 22 - k * 13, cy - h / 2 + 26, 4.5, fill=GOLD, stroke=INK, stroke_width=1)
        p.text(cx, cy + h / 2 - 22, title, size=13, family="serif", fill=INK, text_anchor="middle",
               font_style="italic")
    else:
        for k in range(5):
            p.rect(cx - w / 2 + 10 + k * 4, cy - h / 2 + 10 + k * 4, w - 20 - k * 8, h - 20 - k * 8, rx=6,
                   fill="none", stroke=GOLD, stroke_width=0.8, opacity=0.6)
        p.text(cx, cy + 6, "?", size=40, family="serif", fill=GOLD, text_anchor="middle")
    p.close()


@register(G, "omen-spread")
def omen_spread(p: Pic):
    """Omen Spread (1D): a manuscript page with the Tremor event card at its centre. Two Omen cards
    are already laid, The Braced Wall at the Root and The Long Scroll at the Branch, and a third,
    The Shaken Lamp, is being lifted from the fanned hand toward the empty Crown slot. Drolleries
    crawl the margins: a snail, a long-necked beast, vines; the Balance Rope hangs on the left and
    the reader's preview line is written on the right beside the face-down Backyard card."""
    p.paper(PAPER, grain=0.28, fibre=0.7)
    p.vignette(0.35, "#6b4a20")
    # ruled text block frame, double rule in red
    for k, col in ((0, RUBRIC), (8, INK)):
        p.rect(160 + k, 40 + k, 880 - 2 * k, 720 - 2 * k, fill="none", stroke=col, stroke_width=1.5)
    # margin vines down both sides and across the foot
    r = p.rng
    for x0 in (80, 1120):
        pts = [(x0 + 22 * math.sin(i * 0.9 + x0), 40 + i * 62) for i in range(13)]
        vine(p, pts)
    vine(p, [(180 + i * 70, 778 + 8 * math.sin(i * 1.3)) for i in range(13)], leaves=True)
    # gold bezants along the top rule
    for i in range(16):
        p.circle(200 + i * 54, 26, 6, fill=GOLD, stroke=INK, stroke_width=1)
    # drolleries
    snail(p, 1000, 754, 0.9)
    grotesque(p, 96, 720, 0.9, flip=1)
    grotesque(p, 1100, 190, 0.75, flip=-1)
    # the Balance Rope: three twisted strands, left margin
    cols = [GOLD, RUBRIC, AZURE]
    for k in range(3):
        d = ""
        for i in range(60):
            y = 120 + i * 8
            x = 130 + 10 * math.sin(i * 0.5 + k * 2.1)
            d += ("M" if i == 0 else "L") + f"{f(x)},{f(y)}"
        p.path(d, fill="none", stroke=cols[k], stroke_width=4.5, stroke_linecap="round")
    for k, sg in enumerate(("eye", "spear", "quill")):
        sigil(p, sg, 118 + k * 13, 92 - k * 0, 0.45, col=cols[k])
    p.circle(130, 330, 10, fill=GOLD, stroke=INK, stroke_width=1.5)
    # slots
    slots = {"ROOT": (380, 400), "BRANCH": (820, 400), "CROWN": (600, 175)}
    for name, (x, y) in slots.items():
        p.rect(x - 70, y - 98, 140, 196, rx=10, fill="none", stroke=RUBRIC, stroke_width=2, stroke_dasharray="6 6")
        p.text(x, y + 124, name, size=18, family="serif", fill=RUBRIC, text_anchor="middle", letter_spacing=4)
    # event card at the centre
    card(p, 600, 410, 150, 210, 0, "TREMOR", "tremor", "eye", 2, glow=True)
    p.rect(545, 330, 110, 34, fill=RUBRIC)
    p.text(600, 354, "EVENT", size=18, family="serif", fill="#f7ecd2", text_anchor="middle", letter_spacing=4)
    card(p, 380, 400, 140, 196, -3, "The Braced Wall", "tremor", "spear", 2)
    card(p, 820, 400, 140, 196, 2, "The Long Scroll", "tremor", "quill", 3)
    # the card in flight toward the Crown
    card(p, 640, 225, 140, 196, 9, "The Shaken Lamp", "tremor", "eye", 1, glow=True)
    p.path("M660,610 C720,520 700,380 650,330", fill="none", stroke=GOLD, stroke_width=3, stroke_dasharray="4 8")
    # the hand, fanned at the foot
    hand = [("The Full Cup", "rain", "eye", 3), ("The Last Leaf", "leaf", "eye", 3),
            ("The Biting Thing", "mandible", "spear", 3)]
    for k, (t, su, sg, wt) in enumerate(hand):
        a = -14 + k * 14
        cx = 470 + k * 120
        card(p, cx, 662 + abs(a) * 1.2, 130, 180, a, t, su, sg, wt)
    # backyard card, face down, and the preview line
    card(p, 1000, 620, 110, 150, 6, "", "", "", 0, face=False)
    p.text(1050, 528, "Backyard", size=16, family="serif", fill=INK, text_anchor="end", font_style="italic")
    p.text(1020, 96, "It is a Message.", size=30, family="serif", fill=INK, font_style="italic",
           text_anchor="end")
    p.text(1020, 126, "The Scroll House will answer it.", size=19, family="serif", fill=RUBRIC,
           font_style="italic", text_anchor="end")
    # illuminated initial
    p.rect(180, 60, 74, 74, fill=AZURE, stroke=GOLD, stroke_width=3)
    p.text(217, 120, "T", size=64, family="serif", fill=GOLD, text_anchor="middle", font_weight="bold")


# ---------------------------------------------------------------------------------------------
# Sap Kitchen: alchemical diagram
# ---------------------------------------------------------------------------------------------
def alch_symbol(p, name, x, y, s=1.0, col=INK, w=2.4):
    k = dict(fill="none", stroke=col, stroke_width=w, stroke_linejoin="round", stroke_linecap="round")
    if name == "sap":            # a drop in a circle
        p.circle(x, y, 18 * s, **k)
        p.path(f"M{f(x)},{f(y - 11 * s)} Q{f(x + 9 * s)},{f(y + 3 * s)} {f(x)},{f(y + 9 * s)} "
               f"Q{f(x - 9 * s)},{f(y + 3 * s)} {f(x)},{f(y - 11 * s)}Z", **k)
    elif name == "lichen":       # triangle over a cross
        p.poly([(x, y - 18 * s), (x - 16 * s, y + 8 * s), (x + 16 * s, y + 8 * s)], **k)
        p.line(x, y + 8 * s, x, y + 22 * s, **k)
        p.line(x - 8 * s, y + 15 * s, x + 8 * s, y + 15 * s, **k)
    elif name == "pollen":       # dotted sun
        p.circle(x, y, 12 * s, **k)
        p.circle(x, y, 3 * s, fill=col)
        for i in range(8):
            a = i * math.pi / 4
            p.circle(x + 19 * s * math.cos(a), y + 19 * s * math.sin(a), 2.2 * s, fill=col)
    elif name == "honeydew":     # crescent over a line
        p.path(f"M{f(x + 6 * s)},{f(y - 18 * s)} A16,16 0 1,0 {f(x + 6 * s)},{f(y + 12 * s)} "
               f"A12,12 0 1,1 {f(x + 6 * s)},{f(y - 18 * s)}Z", **k)
        p.line(x - 16 * s, y + 20 * s, x + 16 * s, y + 20 * s, **k)
    elif name == "resin":        # circle with a bar and a hook
        p.circle(x, y - 4 * s, 12 * s, **k)
        p.line(x - 18 * s, y - 4 * s, x + 18 * s, y - 4 * s, **k)
        p.path(f"M{f(x)},{f(y + 8 * s)} v{f(10 * s)} q0,{f(6 * s)} {f(6 * s)},{f(6 * s)}", **k)
    elif name == "ash":          # inverted triangle with a bar
        p.poly([(x - 16 * s, y - 14 * s), (x + 16 * s, y - 14 * s), (x, y + 16 * s)], **k)
        p.line(x - 22 * s, y - 2 * s, x + 22 * s, y - 2 * s, **k)
    elif name == "frost":        # six-armed star
        for i in range(3):
            a = i * math.pi / 3
            p.line(x - 18 * s * math.cos(a), y - 18 * s * math.sin(a), x + 18 * s * math.cos(a),
                   y + 18 * s * math.sin(a), **k)
        p.circle(x, y, 5 * s, **k)
    elif name == "leafskin":     # leaf with a vein and a cross-stroke
        p.path(f"M{f(x - 16 * s)},{f(y + 14 * s)} Q{f(x - 14 * s)},{f(y - 16 * s)} {f(x + 16 * s)},{f(y - 16 * s)} "
               f"Q{f(x + 14 * s)},{f(y + 14 * s)} {f(x - 16 * s)},{f(y + 14 * s)}Z", **k)
        p.line(x - 16 * s, y + 14 * s, x + 10 * s, y - 10 * s, **k)


def arrow(p, x1, y1, x2, y2, col=INK, w=2.4, bend=0.0, head=12):
    mx, my = (x1 + x2) / 2 - (y2 - y1) * bend, (y1 + y2) / 2 + (x2 - x1) * bend
    p.path(f"M{f(x1)},{f(y1)} Q{f(mx)},{f(my)} {f(x2)},{f(y2)}", fill="none", stroke=col, stroke_width=w)
    a = math.atan2(y2 - my, x2 - mx)
    p.poly([(x2, y2), (x2 - head * math.cos(a - 0.4), y2 - head * math.sin(a - 0.4)),
            (x2 - head * math.cos(a + 0.4), y2 - head * math.sin(a + 0.4))], fill=col)


@register(G, "sap-kitchen")
def sap_kitchen(p: Pic):
    """Sap Kitchen (1D): Old Resin's cooking drawn as an alchemical diagram. Around a great circle sit
    the eight ingredient symbols; numbered arrows carry sap, then pollen, then honeydew into the
    pot at the centre, set over a middle fire with three stirs and a long boil. Beneath, the pot
    resolves into one of three vessels, food, sealant or offering, and the food flask is lit: a
    Pollen Cake has been found."""
    p.paper("#ead9b4", grain=0.32, fibre=0.6)
    p.vignette(0.45, "#4a2a10")
    cx, cy, R = 600, 335, 238
    # concentric circles and degree ticks of the opus
    for rr, wdt in ((R + 30, 1), (R, 3), (R - 60, 1.2), (130, 2)):
        p.circle(cx, cy, rr, fill="none", stroke=INK, stroke_width=wdt)
    ticks = []
    for i in range(120):
        a = 2 * math.pi * i / 120
        l = 14 if i % 10 == 0 else 6
        ticks.append(f"M{f(cx + (R + 30) * math.cos(a))},{f(cy + (R + 30) * math.sin(a))}"
                     f"L{f(cx + (R + 30 - l) * math.cos(a))},{f(cy + (R + 30 - l) * math.sin(a))}")
    p.path("".join(ticks), stroke=INK, stroke_width=1.2, fill="none")
    # the hexagram of transformation, faint, behind the pot
    for rot in (-90, 90):
        p.poly(Pic.ngon(cx, cy, R - 60, 3, rot), fill="none", stroke=AMBER, stroke_width=1.5, opacity=0.8)
    # ingredients round the ring
    names = ["sap", "lichen", "pollen", "honeydew", "resin", "ash", "frost", "leafskin"]
    labels = ["SAP", "LICHEN", "POLLEN", "HONEYDEW", "RESIN", "ASH", "FROST", "LEAF-SKIN"]
    pos = {}
    for i, n in enumerate(names):
        a = -math.pi / 2 + 2 * math.pi * i / 8
        x, y = cx + (R - 30) * math.cos(a), cy + (R - 30) * math.sin(a)
        pos[n] = (x, y, a)
        chosen = n in ("sap", "pollen", "honeydew")
        p.circle(x, y, 28, fill="#f4e6c4" if not chosen else "#f8d98a", stroke=INK, stroke_width=1.5)
        alch_symbol(p, n, x, y, 0.85, col=RUBRIC if chosen else INK)
        lx, ly = cx + (R + 58) * math.cos(a), cy + (R + 58) * math.sin(a)
        p.text(lx, ly + 6, labels[i], size=15, family="serif", fill=INK, text_anchor="middle", letter_spacing=2)
    # numbered arrows of the order added
    for k, n in enumerate(("sap", "pollen", "honeydew")):
        x, y, a = pos[n]
        sx, sy = x - 34 * math.cos(a), y - 34 * math.sin(a)
        ex, ey = cx + 112 * math.cos(a), cy + 112 * math.sin(a)
        arrow(p, sx, sy, ex, ey, col=RUBRIC, w=3, bend=0.12)
        mx, my = (sx + ex) / 2 + 20 * math.sin(a), (sy + ey) / 2 - 20 * math.cos(a)
        p.circle(mx, my, 13, fill=RUBRIC)
        p.text(mx, my + 6, str(k + 1), size=17, family="serif", fill="#f7ecd2", text_anchor="middle",
               font_weight="bold")
    # the pot: a round-bellied vessel over the fire triangle
    p.path(f"M{cx - 78},{cy - 40} Q{cx - 98},{cy + 60} {cx},{cy + 70} Q{cx + 98},{cy + 60} {cx + 78},{cy - 40}Z",
           fill=UMBER, stroke=INK, stroke_width=3)
    p.ellipse(cx, cy - 40, 78, 16, fill=AMBER, stroke=INK, stroke_width=3)
    p.ellipse(cx - 20, cy - 43, 30, 5, fill=GOLD, opacity=0.8)
    for k in range(5):
        x = cx - 40 + k * 20 + p.rng.uniform(-4, 4)
        p.circle(x, cy - 66 - (k % 2) * 14, 5 + (k % 3), fill="none", stroke=AMBER, stroke_width=2)
    # stir paddle with three tally marks
    p.line(cx + 30, cy - 48, cx + 92, cy - 150, stroke=INK, stroke_width=5, stroke_linecap="round")
    for k in range(3):
        p.line(cx + 108 + k * 10, cy - 150, cx + 104 + k * 10, cy - 128, stroke=RUBRIC, stroke_width=3)
    # fire: alchemical fire triangle with middle heat
    p.poly([(cx, cy + 76), (cx - 34, cy + 128), (cx + 34, cy + 128)], fill=LANTERN, stroke=INK, stroke_width=2.5)
    p.text(cx, cy + 122, "II", size=18, family="serif", fill=INK, text_anchor="middle", font_weight="bold")
    # hourglass for the long boil
    hx, hy = cx - 150, cy + 20
    p.poly([(hx - 18, hy - 26), (hx + 18, hy - 26), (hx - 18, hy + 26), (hx + 18, hy + 26)], fill="none",
           stroke=INK, stroke_width=2.5)
    p.poly([(hx - 10, hy + 18), (hx + 10, hy + 18), (hx, hy + 6)], fill=AMBER)
    p.text(hx, hy + 48, "LONG", size=13, family="serif", fill=INK, text_anchor="middle", letter_spacing=2)
    # left column: the thickness square (heat x boil)
    tx, ty = 40, 70
    p.text(tx, ty - 16, "HEAT × BOIL", size=15, family="serif", fill=INK, letter_spacing=2)
    cells = [["Runny", "Syrup"], ["Syrup", "Glue"], ["Glue", "Hard"]]
    for j, row in enumerate(cells):
        for i, t in enumerate(row):
            hit = (j, i) == (1, 1)
            p.rect(tx + i * 66, ty + j * 40, 66, 40, fill="#f8d98a" if hit else "none", stroke=INK, stroke_width=1.5)
            p.text(tx + 33 + i * 66, ty + 26 + j * 40, t, size=14, family="serif", fill=INK, text_anchor="middle",
                   font_style="italic")
    # three output vessels along the foot
    outs = [("FOOD", LIME, True), ("SEALANT", GREYBROWN, False), ("OFFERING", GOLD, False)]
    for k, (lab, col, lit) in enumerate(outs):
        vx, vy = 300 + k * 300, 712
        if lit:
            p.circle(vx, vy - 20, 64, fill=p.radial([(0, GOLD, 0.8), (1, GOLD, 0)]))
        p.path(f"M{vx - 12},{vy - 70} v24 q-36,14 -36,46 q0,30 48,30 q48,0 48,-30 q0,-32 -36,-46 v-24Z",
               fill=col if lit else "none", stroke=INK, stroke_width=2.5)
        if not lit:
            p.hatch(vx - 36, vy - 30, 72, 54, angle=35, spacing=7, stroke=col, stroke_width=1.2,
                    clip=p.clip(f'<ellipse cx="{vx}" cy="{vy}" rx="34" ry="28"/>'))
        p.text(vx, vy + 50, lab, size=16, family="serif", fill=INK, text_anchor="middle", letter_spacing=3)
    arrow(p, cx - 40, cy + 140, 320, 632, col=INK, w=2.5, bend=-0.08)
    arrow(p, cx, cy + 190, cx, 632, col=INK, w=1.2)
    arrow(p, cx + 40, cy + 140, 880, 632, col=INK, w=1.2, bend=0.08)
    # right column: the recipe book, twelve silhouettes, four found
    bx, by = 1010, 60
    p.rect(bx - 12, by - 26, 186, 300, fill="#f4e6c4", stroke=INK, stroke_width=1.5)
    p.text(bx + 80, by - 6, "RECIPES", size=14, family="serif", fill=INK, text_anchor="middle", letter_spacing=3)
    found = {0, 1, 2, 7}
    for n in range(12):
        x, y = bx + 20 + (n % 3) * 54, by + 30 + (n // 3) * 64
        if n in found:
            p.circle(x, y, 18, fill=AMBER if n != 2 else LIME, stroke=INK, stroke_width=1.5)
            if n == 2:
                p.circle(x, y, 25, fill="none", stroke=RUBRIC, stroke_width=2)
        else:
            p.circle(x, y, 18, fill="none", stroke=INK, stroke_width=1, stroke_dasharray="3 4")
        p.text(x, y + 38, str(n + 1), size=11, family="serif", fill=INK, text_anchor="middle")
    p.text(bx + 80, by + 300, "“sweet”", size=22, family="serif", fill=RUBRIC, text_anchor="middle",
           font_style="italic")


# ---------------------------------------------------------------------------------------------
# The Ring Door: dendrochronology letterpress
# ---------------------------------------------------------------------------------------------
@register(G, "ring-door")
def ring_door(p: Pic):
    """The Ring Door (1D): the knot face printed like a cross-section of a tree, four rings of
    growth lines around a heart. A crack runs straight up from the centre: the line. Two rings
    already have their grain notch on it; the player turns the third clockwise, and the arrows show
    the ring inside it turning back the other way, because the rings are linked. The margins count
    moves against par and list the glyphs revealed so far."""
    p.paper("#f1e7d0", grain=0.35, fibre=1.1)
    ink = "#5a3424"
    rough = p.roughen(2.2, 0.06)
    cx, cy = 600, 410
    radii = [70, 140, 210, 280, 350]          # boundaries: heart, rings 4..1
    offsets = [0, 0, 2, 3, 5][::-1]           # steps off the line, outer to inner
    r = p.rng
    harm = [(r.uniform(2, 6), r.uniform(0, 6.28), k) for k in (2, 3, 5)]

    def wob(rr, a):
        return rr + sum(amp * math.sin(k * a + ph) * rr / 300 for amp, ph, k in harm)

    def ring_d(rr, n=140):
        return "M" + " L".join(f"{f(cx + wob(rr, 2 * math.pi * i / n) * math.cos(2 * math.pi * i / n))},"
                               f"{f(cy + wob(rr, 2 * math.pi * i / n) * math.sin(2 * math.pi * i / n))}"
                               for i in range(n)) + "Z"

    # second colour first (misregistered amber underprint for early/late wood bands)
    p.open("g", transform="translate(4 -3)", opacity=0.55)
    for k in range(4):
        p.path(ring_d(radii[k + 1] - 22) + ring_d(radii[k] + 18), fill=AMBER, fill_rule="evenodd")
    p.close()
    p.open("g", filter=rough)
    # dense annual lines inside each ring band
    d = []
    for k in range(4):
        r0, r1 = radii[k], radii[k + 1]
        n = r.randint(9, 14)
        acc = r0
        for i in range(n):
            acc += (r1 - r0) / n * r.uniform(0.6, 1.4)
            if acc < r1 - 4:
                d.append(ring_d(acc, 90))
    p.path("".join(d), fill="none", stroke=ink, stroke_width=1.1, opacity=0.8)
    for rr in radii:
        p.path(ring_d(rr), fill="none", stroke=ink, stroke_width=4.5)
    # heart: pith and medullary rays
    p.circle(cx, cy, 16, fill=ink)
    for i in range(36):
        a = 2 * math.pi * i / 36 + r.uniform(-0.04, 0.04)
        l1, l2 = r.uniform(20, 60), r.uniform(120, 340)
        p.line(cx + l1 * math.cos(a), cy + l1 * math.sin(a), cx + l2 * math.cos(a), cy + l2 * math.sin(a),
               stroke=ink, stroke_width=0.6, opacity=0.5)
    p.close()
    # the line: a radial crack to the top
    crack = [(cx, cy - 18)]
    for i in range(1, 15):
        crack.append((cx + r.uniform(-5, 5), cy - 18 - i * 30))
    p.path(p.smooth_d(crack), fill="none", stroke="#2b1810", stroke_width=6)
    p.path(p.smooth_d(crack), fill="none", stroke=GOLD, stroke_width=1.5)
    # grain notch per ring (outer ring k=3 .. inner k=0)
    for band in range(4):
        r0, r1 = radii[band], radii[band + 1]
        step = offsets[band]
        a = -math.pi / 2 + step * 2 * math.pi / 8
        on = step == 0
        w = 0.09
        pts = [(cx + r0 * math.cos(a - w * 140 / r0), cy + r0 * math.sin(a - w * 140 / r0)),
               (cx + r1 * math.cos(a - w * 70 / r0 * 0.8), cy + r1 * math.sin(a - w * 70 / r0 * 0.8)),
               (cx + r1 * math.cos(a + w * 70 / r0 * 0.8), cy + r1 * math.sin(a + w * 70 / r0 * 0.8)),
               (cx + r0 * math.cos(a + w * 140 / r0), cy + r0 * math.sin(a + w * 140 / r0))]
        p.poly(pts, fill=LIME if on else LANTERN, stroke="#2b1810", stroke_width=2.5)
        # eight position pips on each ring
        for s8 in range(8):
            b = -math.pi / 2 + s8 * math.pi / 4
            rr = (r0 + r1) / 2
            if s8 != step:
                p.circle(cx + rr * math.cos(b), cy + rr * math.sin(b), 3, fill=ink, opacity=0.7)
    # turning arrows: ring 2 (band index 2) clockwise, band 1 anticlockwise
    def arc_arrow(rr, a0, a1, col, w=7):
        n = 30
        pts = [(cx + rr * math.cos(a0 + (a1 - a0) * i / n), cy + rr * math.sin(a0 + (a1 - a0) * i / n)) for i in
               range(n + 1)]
        p.path(p.smooth_d(pts), fill="none", stroke=col, stroke_width=w, stroke_linecap="round")
        (x1, y1), (x2, y2) = pts[-2], pts[-1]
        a = math.atan2(y2 - y1, x2 - x1)
        p.poly([(x2 + 18 * math.cos(a), y2 + 18 * math.sin(a)),
                (x2 + 14 * math.cos(a + 2.2), y2 + 14 * math.sin(a + 2.2)),
                (x2 + 14 * math.cos(a - 2.2), y2 + 14 * math.sin(a - 2.2))], fill=col)
    arc_arrow(245, 0.15, 0.95, "#2b1810")
    arc_arrow(175, 1.6, 0.85, RUBRIC)
    p.circle(cx + 245 * math.cos(0.15), cy + 245 * math.sin(0.15), 10, fill="#2b1810")
    # glyphs on aligned rings, printed at the top
    def glyph(x, y, kind, col="#2b1810"):
        if kind == 0:
            p.poly(Pic.star_pts(x, y, 13, 5, 6), fill=col)
        elif kind == 1:
            p.path(f"M{f(x - 12)},{f(y + 8)} q12,-26 24,0", fill="none", stroke=col, stroke_width=3)
            p.line(x, y - 12, x, y + 10, stroke=col, stroke_width=3)
        elif kind == 2:
            for i in range(3):
                p.line(x - 12, y - 8 + i * 8, x + 12, y - 8 + i * 8, stroke=col, stroke_width=3)
        else:
            p.circle(x, y, 11, fill="none", stroke=col, stroke_width=3)
            p.circle(x, y, 3, fill=col)
    p.rect(cx - 30, cy - 345, 60, 50, fill="#f1e7d0")
    glyph(cx, cy - 320, 0)
    p.rect(cx - 30, cy - 275, 60, 50, fill="#f1e7d0")
    glyph(cx, cy - 250, 1)
    # letterpress type in the margins
    tp = dict(family="serif", fill="#2b1810")
    p.text(70, 120, "THE DEEP KNOT", size=26, letter_spacing=4, font_weight="bold", **tp)
    p.line(70, 136, 300, 136, stroke="#2b1810", stroke_width=3)
    p.text(70, 230, "MOVES", size=22, letter_spacing=6, **tp)
    p.text(70, 320, "05", size=96, font_weight="bold", **tp)
    p.text(76, 323, "05", size=96, font_weight="bold", family="serif", fill=AMBER, opacity=0.35)
    p.text(70, 400, "PAR", size=22, letter_spacing=6, **tp)
    p.text(70, 470, "09", size=64, **tp)
    p.text(70, 560, "click: clockwise", size=18, font_style="italic", **tp)
    p.text(70, 586, "the next ring in", size=18, font_style="italic", **tp)
    p.text(70, 612, "turns back", size=18, font_style="italic", **tp)
    p.text(1130, 120, "CHRONICLE", size=22, letter_spacing=4, text_anchor="end", font_weight="bold", **tp)
    p.line(960, 136, 1130, 136, stroke="#2b1810", stroke_width=3)
    for k in range(4):
        y = 200 + k * 110
        if k < 2:
            glyph(1080, y, k)
            p.text(1040, y + 7, f"RING {k + 1}", size=18, text_anchor="end", **tp)
        else:
            p.rect(1062, y - 18, 36, 36, fill="none", stroke="#2b1810", stroke_width=1.5, stroke_dasharray="4 4")
            p.text(1040, y + 7, f"RING {k + 1}", size=18, text_anchor="end", opacity=0.45, **tp)
    # printer's rule and corner fleurons
    p.rect(30, 30, W - 60, H - 60, fill="none", stroke="#2b1810", stroke_width=2)
    for x, y in ((30, 30), (W - 30, 30), (30, H - 30), (W - 30, H - 30)):
        p.poly(Pic.star_pts(x, y, 14, 5, 4, 45), fill=AMBER, stroke="#2b1810", stroke_width=1.2)


# ---------------------------------------------------------------------------------------------
# Trunk and Shadow: knotwork board
# ---------------------------------------------------------------------------------------------
def plait(p, x0, y0, x1, y1, col, w=8, period=40, amp=7):
    """Two interlaced strands along a straight line, over-under at each crossing."""
    L = math.hypot(x1 - x0, y1 - y0)
    ux, uy = (x1 - x0) / L, (y1 - y0) / L
    nx, ny = -uy, ux
    n = int(L / period)
    for strand in (0, 1):
        for seg in range(n):
            if (seg + strand) % 2:
                continue
            pts = []
            for i in range(9):
                t = (seg + i / 8) * period
                s = amp * math.sin(t / period * math.pi + strand * math.pi)
                pts.append((x0 + ux * t + nx * s, y0 + uy * t + ny * s))
            d = p.smooth_d(pts)
            p.path(d, fill="none", stroke="#140d08", stroke_width=w + 4, stroke_linecap="butt")
            p.path(d, fill="none", stroke=col, stroke_width=w, stroke_linecap="butt")
    for strand in (0, 1):
        for seg in range(n):
            if not (seg + strand) % 2:
                continue
            pts = []
            for i in range(9):
                t = (seg + i / 8) * period
                s = amp * math.sin(t / period * math.pi + strand * math.pi)
                pts.append((x0 + ux * t + nx * s, y0 + uy * t + ny * s))
            d = p.smooth_d(pts)
            p.path(d, fill="none", stroke="#140d08", stroke_width=w + 4, stroke_linecap="butt")
            p.path(d, fill="none", stroke=col, stroke_width=w, stroke_linecap="butt")


def triquetra(p, x, y, r, col):
    for k in range(3):
        a = -math.pi / 2 + k * 2 * math.pi / 3
        cx, cy = x + r * 0.5 * math.cos(a), y + r * 0.5 * math.sin(a)
        p.circle(cx, cy, r * 0.62, fill="none", stroke="#140d08", stroke_width=6)
        p.circle(cx, cy, r * 0.62, fill="none", stroke=col, stroke_width=3)


@register(G, "trunk-and-shadow")
def trunk_and_shadow(p: Pic):
    """Trunk and Shadow (1D): the festival board, five columns by eight rows, whose paths are
    interlaced bands: a piece may move only where a band runs. Four lime Folk climb from the Root
    row toward the Crown while the dark two-by-two Shadow comes down; one Folk rests safe on a knot
    square, and the squares another can reach glow. Rule cards sit on the left, Captain Burr waits
    as the opponent on the right, and the round counter stands at seven of sixteen."""
    p.rect(0, 0, W, H, fill="#24170f")
    p.paper("#2e1f15", grain=0.25, fibre=0.5)
    COLS, ROWS, C = 5, 8, 80
    bx, by = 400, 72
    r = p.rng
    # the flake: irregular board outline
    flake = []
    for i in range(36):
        a = 2 * math.pi * i / 36
        rx, ry = COLS * C / 2 + 34, ROWS * C / 2 + 30
        k = 1 + r.uniform(-0.03, 0.04)
        flake.append((bx + COLS * C / 2 + rx * k * math.cos(a) * min(1.0, 1.25 * abs(math.cos(a)) + 0.35),
                      by + ROWS * C / 2 + ry * k * math.sin(a) * min(1.0, 1.25 * abs(math.sin(a)) + 0.35)))
    p.poly(flake, fill="#7a5a3c", stroke="#140d08", stroke_width=4)
    p.rect(bx, by, COLS * C, ROWS * C, fill="#8c6a48")
    # carved square grid (faint)
    p.grid(bx, by, COLS * C, ROWS * C, C, stroke="#5a3d2b", stroke_width=1.2)
    # open cracks: a spanning tree plus extras
    edges = set()
    seen = {(0, 0)}
    frontier = [((0, 0), (1, 0)), ((0, 0), (0, 1))]
    while frontier:
        a, b = frontier.pop(r.randrange(len(frontier)))
        if b in seen:
            continue
        seen.add(b)
        edges.add((a, b) if a < b else (b, a))
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            c = (b[0] + dx, b[1] + dy)
            if 0 <= c[0] < COLS and 0 <= c[1] < ROWS and c not in seen:
                frontier.append((b, c))
    for i in range(COLS):
        for j in range(ROWS):
            for c in ((i + 1, j), (i, j + 1)):
                if c[0] < COLS and c[1] < ROWS and r.random() < 0.35:
                    edges.add(((i, j), c))

    def ctr(c):
        return bx + c[0] * C + C / 2, by + (ROWS - 1 - c[1]) * C + C / 2   # row 0 is the Root (bottom)

    knots = {(0, 3), (4, 2), (2, 5), (3, 6)}
    reach = {(1, 2), (1, 3), (2, 2)}
    for c in knots:
        x, y = ctr(c)
        p.rect(x - C / 2 + 3, y - C / 2 + 3, C - 6, C - 6, fill="#5a3d2b")
    for c in reach:
        x, y = ctr(c)
        p.rect(x - C / 2 + 3, y - C / 2 + 3, C - 6, C - 6, fill=LIME, opacity=0.35)
    # Root and Crown rows tinted
    p.rect(bx, by + (ROWS - 1) * C, COLS * C, C, fill=SAGE, opacity=0.25)
    p.rect(bx, by, COLS * C, C, fill=GOLD, opacity=0.25)
    # bands: verticals first, then horizontals, then re-lay alternating verticals on top at nodes
    def band(x1, y1, x2, y2):
        p.line(x1, y1, x2, y2, stroke="#140d08", stroke_width=22, stroke_linecap="butt")
        p.line(x1, y1, x2, y2, stroke=GOLD, stroke_width=15, stroke_linecap="butt")
        p.line(x1, y1, x2, y2, stroke="#a8701e", stroke_width=2)
    vert = [e for e in edges if e[0][0] == e[1][0]]
    hori = [e for e in edges if e[0][1] == e[1][1]]
    for a, b in vert:
        band(*ctr(a), *ctr(b))
    for a, b in hori:
        band(*ctr(a), *ctr(b))
    vset = set(vert)
    for i in range(COLS):
        for j in range(ROWS):
            if (i + j) % 2:
                continue
            x, y = ctr((i, j))
            up = ((i, j), (i, j + 1)) in vset
            dn = ((i, j - 1), (i, j)) in vset
            if up or dn:
                band(x, y - (16 if up else 0) - (0 if up else 0), x, y + (16 if dn else 0))
    for c in knots:
        triquetra(p, *ctr(c), 22, LANTERN)
    # the Shadow: a 2x2 dark token with a knot border
    sx, sy = ctr((2, 5))
    sx, sy = sx - C / 2 + C, sy - C / 2
    p.rect(sx - C + 6, sy - C + 6, 2 * C - 12, 2 * C - 12, rx=18, fill="#0b0705", opacity=0.82,
           stroke="#3a2a40", stroke_width=6)
    p.rect(sx - C + 18, sy - C + 18, 2 * C - 36, 2 * C - 36, rx=12, fill="none", stroke="#6a5a78",
           stroke_width=2, stroke_dasharray="10 6")
    # Shadow's next move shaded below it
    p.rect(sx - C + 4, sy + C + 4, 2 * C - 8, C - 8, fill="#000", opacity=0.25)
    # Folk pieces
    def folk(c, safe=False):
        x, y = ctr(c)
        p.circle(x, y + 3, 22, fill="#000", opacity=0.4)
        p.circle(x, y, 22, fill=LIME, stroke="#140d08", stroke_width=3)
        p.circle(x, y - 8, 7, fill="#2e1f15")
        p.path(f"M{f(x - 10)},{f(y + 14)} q10,-22 20,0", fill="#2e1f15")
        if safe:
            p.circle(x, y, 30, fill="none", stroke=GOLD, stroke_width=3, stroke_dasharray="5 4")
    folk((1, 1))
    folk((0, 3), safe=True)
    folk((3, 0))
    folk((4, 4))
    arrow(p, *ctr((1, 1)), ctr((1, 3))[0], ctr((1, 3))[1] + 26, col="#f7ecd2", w=4, bend=0.15, head=16)
    # knotwork frame round the board
    x0, y0, x1, y1 = bx - 54, by - 50, bx + COLS * C + 54, by + ROWS * C + 50
    for a, b in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        plait(p, *a, *b, SAGE, w=7, period=34, amp=6)
    p.text(bx + COLS * C / 2, by - 14, "CROWN", size=16, family="serif", fill="#f7ecd2", text_anchor="middle",
           letter_spacing=6)
    p.text(bx + COLS * C / 2, by + ROWS * C + 30, "ROOT", size=16, family="serif", fill="#f7ecd2",
           text_anchor="middle", letter_spacing=6)
    # rule cards on the left
    rules = [("GUST", "every 3rd round"), ("TREMOR", "every 4th round"), ("SPEAR", "push the Shadow"),
             ("THE HAND", "round 10")]
    for k, (t, sub) in enumerate(rules):
        x, y = 70, 70 + k * 168
        lit = k == 1
        p.rect(x, y, 240, 140, rx=10, fill="#3a281c", stroke=GOLD if lit else "#7a5a3c", stroke_width=4 if lit else 2)
        plait(p, x + 14, y + 20, x + 226, y + 20, AMBER if lit else GREYBROWN, w=4, period=20, amp=4)
        p.text(x + 120, y + 78, t, size=26, family="serif", fill="#f7ecd2", text_anchor="middle", letter_spacing=3)
        p.text(x + 120, y + 108, sub, size=17, family="serif", fill=SAGE, text_anchor="middle", font_style="italic")
    # opponent portrait: Burr's crested helmet in a knot roundel
    ox, oy = 1010, 220
    p.circle(ox, oy, 120, fill="#3a281c", stroke="#140d08", stroke_width=4)
    for k in range(24):
        a = 2 * math.pi * k / 24
        p.circle(ox + 120 * math.cos(a), oy + 120 * math.sin(a), 13, fill="none", stroke=SAGE, stroke_width=4)
    p.path(f"M{ox - 52},{oy + 70} L{ox - 52},{oy - 10} Q{ox},{oy - 80} {ox + 52},{oy - 10} L{ox + 52},{oy + 70} "
           f"L{ox + 22},{oy + 70} L{ox + 22},{oy + 10} L{ox - 22},{oy + 10} L{ox - 22},{oy + 70}Z",
           fill=GREYBROWN, stroke="#140d08", stroke_width=3)
    p.path(f"M{ox - 30},{oy - 46} Q{ox + 10},{oy - 130} {ox + 80},{oy - 90} Q{ox + 30},{oy - 80} {ox + 16},{oy - 46}Z",
           fill=LANTERN, stroke="#140d08", stroke_width=3)
    p.text(ox, oy + 160, "CAPTAIN BURR", size=22, family="serif", fill="#f7ecd2", text_anchor="middle",
           letter_spacing=3)
    p.text(ox, oy + 190, "charges the nearest", size=17, family="serif", fill=SAGE, text_anchor="middle",
           font_style="italic")
    # round counter
    for k in range(16):
        x, y = 880 + (k % 8) * 34, 560 + (k // 8) * 40
        p.circle(x, y, 12, fill=AMBER if k < 7 else "none", stroke=GOLD, stroke_width=2)
    p.text(1000, 660, "ROUND 7 / 16", size=22, family="serif", fill="#f7ecd2", text_anchor="middle",
           letter_spacing=3)


# ---------------------------------------------------------------------------------------------
# Tremor Scroll: seismograph drum
# ---------------------------------------------------------------------------------------------
@register(G, "tremor-scroll")
def tremor_scroll(p: Pic):
    """Tremor Scroll (1D): the scholars' record as a smoked-paper drum, one scratched line per day
    read left to right through dawn, noon and dusk. In winter the tremors come only at noon on sun
    days, and every seventh day a faint ripple runs at noon on every face at once. The last three
    lines are still blank smoke, and the player has pencilled their forecast in gold: a ripple on
    day fourteen."""
    p.rect(0, 0, W, H, fill=p.gradient([(0, "#3a2a1e"), (1, "#1a120c")]))
    r = p.rng
    x0, x1, y0, y1 = 150, 1080, 110, 640
    # the drum body, shaded as a cylinder
    drum = p.gradient([(0, "#060504"), (0.15, "#1d1a17"), (0.45, "#2e2a26"), (0.7, "#1d1a17"), (1, "#040303")],
                      x1=0, y1=0, x2=1, y2=0)
    # end rims in brass
    for x in (x0 - 20, x1 + 20):
        p.ellipse(x, (y0 + y1) / 2, 30, (y1 - y0) / 2 + 26, fill=p.gradient([(0, "#8a6a30"), (1, "#3a2a14")]),
                  stroke="#140d08", stroke_width=3)
    p.rect(x0 - 20, y0 - 20, x1 - x0 + 40, y1 - y0 + 40, fill=drum)
    # axle
    p.rect(40, (y0 + y1) / 2 - 10, 100, 20, fill="#6a5030", stroke="#140d08", stroke_width=2)
    p.rect(x1 + 40, (y0 + y1) / 2 - 10, 100, 20, fill="#6a5030", stroke="#140d08", stroke_width=2)
    # soot texture
    p.stipple(x0 - 20, y0 - 20, x1 - x0 + 40, y1 - y0 + 40, n=900, r=(0.4, 1.2), fill="#5a5048", opacity=0.5)
    days, rowh = 14, (y1 - y0) / 14
    weather = ["sun", "frost", "sun", "sun", "storm", "sun", "sun", "frost", "sun", "rain", "sun", "sun", "frost", "sun"]
    trace = "#f0e8dc"

    def tx(t):  # cylinder foreshortening across the visible face
        return (x0 + x1) / 2 + (x1 - x0) / 2 * math.sin((t - 0.5) * math.pi * 0.92) / math.sin(0.46 * math.pi)

    for d in range(days):
        base = y0 + rowh * (d + 0.6)
        if d >= 11:
            # blank forecast line: only the faintest track
            p.line(tx(0.02), base, tx(0.98), base + rowh * 0.3, stroke=trace, stroke_width=0.5, opacity=0.2)
            continue
        pts = []
        n = 260
        for i in range(n + 1):
            t = i / n
            y = base + rowh * 0.3 * t + r.uniform(-0.6, 0.6)
            amp = 0
            if weather[d] == "sun" and abs(t - 0.5) < 0.06:
                amp = 9 * math.cos((t - 0.5) / 0.06 * math.pi / 2) * math.sin(t * 900)
            if (d + 1) % 7 == 0 and abs(t - 0.5) < 0.16:
                amp += 4 * math.cos((t - 0.5) / 0.16 * math.pi / 2) * math.sin(t * 260)
            pts.append((tx(t), y + amp))
        p.path("M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts), fill="none", stroke=trace, stroke_width=1.3,
               opacity=0.9 if (d + 1) % 7 else 1)
        # face arrow (south) over a noon burst
        if weather[d] == "sun":
            ax, ay = tx(0.5) + 22, base - 6
            p.line(ax, ay - 7, ax, ay + 5, stroke=trace, stroke_width=1.5)
            p.poly([(ax - 4, ay + 3), (ax + 4, ay + 3), (ax, ay + 9)], fill=trace)
    # the seventh day highlighted
    by = y0 + rowh * 6.6
    p.rect(tx(0.33), by - 16, tx(0.67) - tx(0.33), 30, rx=12, fill="none", stroke=GOLD, stroke_width=2,
           stroke_dasharray="5 5")
    # weather marks scratched at the left of each line
    for d in range(days):
        x, y = tx(0.035), y0 + rowh * (d + 0.55)
        w = weather[d]
        k = dict(stroke=trace, stroke_width=1.4, fill="none")
        if w == "sun":
            p.circle(x, y, 5, **k)
            for i in range(6):
                a = i * math.pi / 3
                p.line(x + 7 * math.cos(a), y + 7 * math.sin(a), x + 10 * math.cos(a), y + 10 * math.sin(a), **k)
        elif w == "frost":
            for i in range(3):
                a = i * math.pi / 3
                p.line(x - 8 * math.cos(a), y - 8 * math.sin(a), x + 8 * math.cos(a), y + 8 * math.sin(a), **k)
        elif w == "rain":
            for i in range(3):
                p.line(x - 6 + i * 6, y - 6, x - 9 + i * 6, y + 6, **k)
        else:
            p.poly([(x - 2, y - 9), (x - 6, y + 1), (x + 1, y + 1), (x - 3, y + 10), (x + 6, y - 3), (x - 1, y - 3)],
                   **k)
    # forecast pencil marks in gold on the blank lines
    for d, mark in ((11, "none"), (12, "sun"), (13, "tread")):
        base = y0 + rowh * (d + 0.6) + rowh * 0.15
        x = tx(0.5)
        if mark == "none":
            p.circle(x, base, 8, fill="none", stroke=GOLD, stroke_width=2.5)
            p.line(x - 8, base + 8, x + 8, base - 8, stroke=GOLD, stroke_width=2.5)
        elif mark == "sun":
            p.path(f"M{f(x - 30)},{f(base)} l10,-9 l10,18 l10,-18 l10,18 l10,-9", fill="none", stroke=GOLD,
                   stroke_width=2.5)
        else:
            pts = [(x - 90 + i * 3, base + 5 * math.sin(i * 0.9)) for i in range(61)]
            p.path("M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts), fill="none", stroke=GOLD, stroke_width=2.5)
            for a in (0, 1, 2, 3):
                ang = a * math.pi / 2
                p.line(x + 110, base, x + 110 + 14 * math.cos(ang), base + 14 * math.sin(ang), stroke=GOLD,
                       stroke_width=2.5)
    # the stylus arm resting at the start of the next line
    sx, sy = tx(0.08), y0 + rowh * 11.6
    p.path(f"M{f(sx)},{f(sy)} L{f(sx + 70)},{f(sy - 160)} L{f(sx + 320)},{f(y0 - 70)}", fill="none",
           stroke="#b8923e", stroke_width=7, stroke_linejoin="round")
    p.circle(sx + 320, y0 - 70, 14, fill="#6a5030", stroke="#140d08", stroke_width=2)
    p.circle(sx, sy, 4, fill=GOLD)
    # day-part labels and day numbers
    for t, lab in ((0.2, "DAWN"), (0.5, "NOON"), (0.8, "DUSK")):
        p.text(tx(t), y0 - 34, lab, size=18, family="monospace", fill="#d8c8a8", text_anchor="middle",
               letter_spacing=4)
    for d in range(days):
        p.text(x1 + 74, y0 + rowh * (d + 0.75), f"{d + 1:02d}", size=14, family="monospace",
               fill=GOLD if d >= 11 else "#d8c8a8", text_anchor="middle")
    # Fenn's margin strip
    p.rect(150, 690, 930, 64, fill="#e9dcc0", stroke="#140d08", stroke_width=2)
    p.text(176, 731, "FORECAST: 12 none · 13 noon, south, 1 · 14 the ripple, every face", size=21,
           family="monospace", fill="#3a281c")

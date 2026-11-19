"""Trunk and Shadow, as a knotwork board: the board, six pieces and eleven rule cards."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Board, pieces, 11 rule cards"
DARK, EDGE, BOARD, BOARD_D = "#2e1f15", "#140d08", "#8c6a48", "#7a5a3c"
CREAM = "#f7ecd2"


UP = ["11111", "11011", "10111", "11111", "11101", "11111", "11111", "00000"]
RIGHT = ["0011", "0101", "1000", "1110", "0111", "1001", "0010", "1101"]
KNOTS = [(1, 2), (3, 3), (0, 5), (4, 5)]


def ground(a):
    a.rect(0, 0, a.w, a.h, fill="#24170f")
    a.paper(DARK, grain=0.25, fibre=0.5)


def band(a, x1, y1, x2, y2, w=15, col=kit.GOLD):
    a.line(x1, y1, x2, y2, stroke=EDGE, stroke_width=w + 7, stroke_linecap="butt")
    a.line(x1, y1, x2, y2, stroke=col, stroke_width=w, stroke_linecap="butt")
    a.line(x1, y1, x2, y2, stroke="#a8701e", stroke_width=max(1.2, w * 0.13))


def frame(a, x0, y0, x1, y1, col=kit.SAGE, w=6, period=30, amp=5):
    for (ax, ay), (bx, by) in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        kit.plait(a, ax, ay, bx, by, col, w=w, period=period, amp=amp)
    for x, y in ((x0, y0), (x1, y0), (x0, y1), (x1, y1)):
        a.circle(x, y, w * 1.6, fill=EDGE)
        a.circle(x, y, w * 1.0, fill=col)


# ---------------------------------------------------------------------------------------------
# the board
# ---------------------------------------------------------------------------------------------
@asset(G, "tns-board", group="maps", title="Trunk and Shadow: the board", w=800, h=1100, row=ROW)
def board(a: Art):
    """The festival board carved into a flat flake: five columns by eight rows, the Root row at the foot and the
    Crown row at the head. Its paths are interlaced gold bands, and a piece may move only where a band runs.
    Four squares carry a knot, where a Folk cannot be hidden."""
    ground(a)
    COLS, ROWS, C = 5, 8, 108
    bx, by = 130, 116
    r = a.rng
    flake = []
    for i in range(40):
        t = 2 * math.pi * i / 40
        rx, ry = COLS * C / 2 + 52, ROWS * C / 2 + 50
        k = 1 + r.uniform(-0.025, 0.035)
        flake.append((bx + COLS * C / 2 + rx * k * math.cos(t) * min(1.0, 1.3 * abs(math.cos(t)) + 0.36),
                      by + ROWS * C / 2 + ry * k * math.sin(t) * min(1.0, 1.3 * abs(math.sin(t)) + 0.36)))
    a.poly([(x + 6, y + 9) for x, y in flake], fill="#000", opacity=0.45)
    a.poly(flake, fill=BOARD_D, stroke=EDGE, stroke_width=4, filter=kit.bark_fx(a, light="#fff0d8", freq=(0.02, 0.006), scale=3, el=55))
    a.rect(bx, by, COLS * C, ROWS * C, fill=BOARD, opacity=0.75)
    a.grid(bx, by, COLS * C, ROWS * C, C, stroke=kit.UMBER, stroke_width=1.4)
    a.rect(bx, by + (ROWS - 1) * C, COLS * C, C, fill=kit.SAGE, opacity=0.3)
    a.rect(bx, by, COLS * C, C, fill=kit.GOLD, opacity=0.3)
    # open cracks: the festival board the web game plays on (web/games/people-of-the-bark/trunk-and-shadow.js
    # carries the same two tables). UP[j][i]: square (i, j) opens upward; RIGHT[j][i]: it opens to the right.
    edges = set()
    for j in range(ROWS):
        for i in range(COLS):
            if UP[j][i] == "1":
                edges.add(((i, j), (i, j + 1)))
            if i < COLS - 1 and RIGHT[j][i] == "1":
                edges.add(((i, j), (i + 1, j)))

    def ctr(c):
        return bx + c[0] * C + C / 2, by + (ROWS - 1 - c[1]) * C + C / 2
    knots = set(KNOTS)
    for c in knots:
        x, y = ctr(c)
        a.rect(x - C / 2 + 4, y - C / 2 + 4, C - 8, C - 8, fill=kit.UMBER)
    vert = [e for e in edges if e[0][0] == e[1][0]]
    hori = [e for e in edges if e[0][1] == e[1][1]]
    for p, q in vert:
        band(a, *ctr(p), *ctr(q), w=19)
    for p, q in hori:
        band(a, *ctr(p), *ctr(q), w=19)
    vset = set(vert)
    for i in range(COLS):
        for j in range(ROWS):
            x, y = ctr((i, j))
            up, dn = ((i, j), (i, j + 1)) in vset, ((i, j - 1), (i, j)) in vset
            if (i + j) % 2 == 0 and (up or dn):
                band(a, x, y - (22 if up else 0), x, y + (22 if dn else 0), w=19)
            deg = sum(1 for e in edges if (i, j) in e)
            if deg == 1:
                a.circle(x, y, 15, fill=EDGE)
                a.circle(x, y, 10.5, fill=kit.GOLD)
    for c in knots:
        kit.triquetra(a, *ctr(c), 30, kit.LANTERN)
    frame(a, bx - 62, by - 66, bx + COLS * C + 62, by + ROWS * C + 66, w=8, period=36, amp=6.5)
    a.text(400, by - 22, "CROWN", size=20, family="serif", fill=CREAM, text_anchor="middle", letter_spacing=10)
    a.text(400, by + ROWS * C + 40, "ROOT", size=20, family="serif", fill=CREAM, text_anchor="middle", letter_spacing=10)
    for k in range(16):
        a.circle(400 - 7.5 * 24 + k * 24, 1064, 7, fill="none", stroke=kit.GOLD, stroke_width=1.8)
    a.vignette(0.45)


# ---------------------------------------------------------------------------------------------
# pieces
# ---------------------------------------------------------------------------------------------
def piece_ground(a):
    ground(a)
    a.circle(100, 100, 92, fill=a.radial([(0, "#5a3d2b", 0.9), (1, "#5a3d2b", 0)]))


def folk_token(a, x, y, rr, col=kit.LIME):
    a.circle(x, y + rr * 0.14, rr, fill="#000", opacity=0.45)
    a.circle(x, y, rr, fill=col, stroke=EDGE, stroke_width=rr * 0.13)
    a.circle(x, y, rr * 0.82, fill="none", stroke=EDGE, stroke_width=rr * 0.04, stroke_dasharray="2 4")
    a.circle(x, y - rr * 0.34, rr * 0.3, fill=DARK)
    a.path(f"M{f(x - rr * 0.36)},{f(y + rr * 0.6)} q{f(rr * 0.36)},{f(-rr * 1.1)} {f(rr * 0.72)},0 Z", fill=DARK)
    a.ellipse(x - rr * 0.36, y - rr * 0.5, rr * 0.2, rr * 0.11, fill="#fff", opacity=0.35, transform=f"rotate(-30 {f(x - rr * 0.36)} {f(y - rr * 0.5)})")


def shadow_token(a, x, y, half):
    a.rect(x - half, y - half, 2 * half, 2 * half, rx=half * 0.22, fill="#0b0705", stroke="#3a2a40", stroke_width=half * 0.08)
    a.rect(x - half * 0.82, y - half * 0.82, half * 1.64, half * 1.64, rx=half * 0.14, fill="none", stroke="#6a5a78", stroke_width=half * 0.03,
           stroke_dasharray=f"{f(half * 0.12)} {f(half * 0.08)}")


def leaf_token(a, x, y, s):
    a.path(f"M{f(x)},{f(y - 34 * s)} Q{f(x + 28 * s)},{f(y - 12 * s)} {f(x + 16 * s)},{f(y + 18 * s)} Q{f(x + 6 * s)},{f(y + 32 * s)} {f(x)},{f(y + 36 * s)} "
           f"Q{f(x - 6 * s)},{f(y + 32 * s)} {f(x - 16 * s)},{f(y + 18 * s)} Q{f(x - 28 * s)},{f(y - 12 * s)} {f(x)},{f(y - 34 * s)}Z", fill="#c8702a",
           stroke=EDGE, stroke_width=3 * s)
    a.path(f"M{f(x)},{f(y - 30 * s)} V{f(y + 44 * s)} M{f(x)},{f(y - 8 * s)} l{f(12 * s)},{f(-9 * s)} M{f(x)},{f(y - 8 * s)} l{f(-12 * s)},{f(-9 * s)} "
           f"M{f(x)},{f(y + 8 * s)} l{f(12 * s)},{f(-9 * s)} M{f(x)},{f(y + 8 * s)} l{f(-12 * s)},{f(-9 * s)}", fill="none", stroke=EDGE,
           stroke_width=1.8 * s)


def beetle_token(a, x, y, s):
    for i in (-1, 0, 1):
        for sg in (-1, 1):
            a.path(f"M{f(x + sg * 20 * s)},{f(y + i * 14 * s)} l{f(sg * 16 * s)},{f(-6 * s + i * 6 * s)} l{f(sg * 6 * s)},{f(10 * s)}", fill="none",
                   stroke=EDGE, stroke_width=3.4 * s, stroke_linecap="round", stroke_linejoin="round")
    a.ellipse(x, y + 4 * s, 26 * s, 34 * s, fill="#2e3a34", stroke=EDGE, stroke_width=3 * s)
    a.line(x, y - 28 * s, x, y + 38 * s, stroke=EDGE, stroke_width=1.6 * s)
    a.ellipse(x, y - 34 * s, 13 * s, 10 * s, fill="#1e2420", stroke=EDGE, stroke_width=3 * s)
    a.path(f"M{f(x - 6 * s)},{f(y - 42 * s)} q{f(-10 * s)},{f(-8 * s)} {f(-4 * s)},{f(-18 * s)} M{f(x + 6 * s)},{f(y - 42 * s)} q{f(10 * s)},{f(-8 * s)} {f(4 * s)},{f(-18 * s)}",
           fill="none", stroke=EDGE, stroke_width=3 * s, stroke_linecap="round")
    a.ellipse(x - 10 * s, y - 8 * s, 6 * s, 14 * s, fill="#cfe0c8", opacity=0.3)


def hand_token(a, x, y, s, col="#0b0705"):
    """Twig's Hand: five fingers and a palm, drawn the way a child cuts a shape out."""
    d = f"M{f(x - 52 * s)},{f(y - 40 * s)}"
    lens = (34, 52, 60, 50, 30)
    for i, ln in enumerate(lens):
        fx = x - 52 * s + i * 21 * s
        d += f" V{f(y - 10 * s + ln * s)} a{f(8.5 * s)},{f(8.5 * s)} 0 0,0 {f(17 * s)},0 V{f(y - 40 * s)} h{f(4 * s)}"
    d += f" V{f(y - 62 * s)} H{f(x - 52 * s)}Z"
    a.path(d, fill=col, stroke="#6a5a78", stroke_width=2.4 * s, stroke_linejoin="round")
    a.path(f"M{f(x - 44 * s)},{f(y - 50 * s)} H{f(x + 44 * s)}", stroke="#6a5a78", stroke_width=1.4 * s, stroke_dasharray=f"{f(6 * s)} {f(5 * s)}")


def hollow_token(a, x, y, half):
    a.rect(x - half, y - half, 2 * half, 2 * half, fill=BOARD, stroke=EDGE, stroke_width=3)
    pts = [(x - half * 0.8, y - half * 0.7), (x - half * 0.2, y - half * 0.86), (x + half * 0.74, y - half * 0.72), (x + half * 0.84, y + half * 0.1),
           (x + half * 0.66, y + half * 0.8), (x - half * 0.3, y + half * 0.84), (x - half * 0.84, y + half * 0.5)]
    a.poly(pts, fill="#14191c", stroke=EDGE, stroke_width=3, stroke_linejoin="round")
    cp = a.clip('<polygon points="' + " ".join(f"{f(px)},{f(py)}" for px, py in pts) + '"/>')
    a.open("g", clip_path=cp)
    for k in range(6):
        yy = y - half * 0.8 + k * half * 0.32
        row = [(x - half + i * half * 0.25, yy + half * 0.08 * math.sin(i * 1.4 + k)) for i in range(9)]
        a.path(a.smooth_d(row), fill="none", stroke=kit.CHALK, stroke_width=half * 0.14, opacity=0.28, stroke_linecap="round")
        a.path(a.smooth_d([(px, py - half * 0.08) for px, py in row]), fill="none", stroke=kit.CHALK, stroke_width=1.2, opacity=0.7)
    a.close()
    band(a, x - half, y, x - half * 0.72, y, w=half * 0.2)
    band(a, x + half * 0.74, y, x + half, y, w=half * 0.2)


PIECES = [
    ("folk", "Folk", lambda a: folk_token(a, 100, 100, 64),
     "A Folk: a lime counter with a small dark figure on it, one of the player's four."),
    ("shadow", "The Shadow", lambda a: (shadow_token(a, 100, 100, 78), kit.triquetra(a, 100, 100, 26, "#6a5a78")),
     "The Shadow: a two-by-two token of near-black with a dashed inner border and a faint knot at its centre."),
    ("leaf", "Leaf token", lambda a: (a.circle(100, 104, 70, fill="#000", opacity=0.3), a.circle(100, 100, 70, fill=BOARD, stroke=EDGE, stroke_width=5),
                                      leaf_token(a, 100, 96, 1.35)),
     "The leaf token of the Leaf rule: a copper leaf on a wooden disc, which falls one square a round down its column."),
    ("beetle", "Beetle piece", lambda a: (a.circle(100, 104, 78, fill="#000", opacity=0.3), a.circle(100, 100, 78, fill=kit.GOLD, stroke=EDGE, stroke_width=5),
                                          a.circle(100, 100, 68, fill="none", stroke=EDGE, stroke_width=1.2, stroke_dasharray="3 5"), beetle_token(a, 100, 108, 1.15)),
     "The beetle piece of the Mandible rule: a beetle seen from above on a gold disc; read as a god it blocks, read as a monster "
     "it hides any Folk it touches."),
    ("hand", "The Hand", lambda a: hand_token(a, 100, 104, 1.35),
     "The Hand, Twig's piece: five fingers and a palm cut out of something dark the way a child cuts a shape, as wide as the board."),
    ("hollow-square", "Hollow square", lambda a: hollow_token(a, 100, 100, 78),
     "The Hollow square: a square of the board fallen out for good, its bands cut short at the edges, and under it pale ribbed "
     "galleries in cold chalk grey."),
]
for key, name, fn, doc in PIECES:
    def _mk(fn=fn, doc=doc):
        def draw(a: Art):
            piece_ground(a)
            fn(a)
        draw.__doc__ = doc
        return draw
    asset(G, f"tns-piece-{key}", group="pieces", title=f"Trunk and Shadow piece: {name}", w=200, h=200, row=ROW)(_mk())


# ---------------------------------------------------------------------------------------------
# rule cards: a small board that shows the rule
# ---------------------------------------------------------------------------------------------
MC, MX, MY = 44, 40, 106      # mini-board cell, origin; 5 columns by 4 rows


def cell(i, j):
    return MX + i * MC + MC / 2, MY + (3 - j) * MC + MC / 2


def mini(a, knots=((1, 1),)):
    a.rect(MX - 6, MY - 6, 5 * MC + 12, 4 * MC + 12, rx=6, fill=EDGE)
    a.rect(MX, MY, 5 * MC, 4 * MC, fill=BOARD)
    a.grid(MX, MY, 5 * MC, 4 * MC, MC, stroke=kit.UMBER, stroke_width=1)
    for j in range(4):
        a.line(MX + MC / 2, MY + j * MC + MC / 2, MX + 4.5 * MC, MY + j * MC + MC / 2, stroke=kit.GOLD, stroke_width=5, opacity=0.55)
    for i in range(5):
        a.line(MX + i * MC + MC / 2, MY + MC / 2, MX + i * MC + MC / 2, MY + 3.5 * MC, stroke=kit.GOLD, stroke_width=5, opacity=0.55)
    for c in knots:
        x, y = cell(*c)
        a.rect(x - MC / 2 + 2, y - MC / 2 + 2, MC - 4, MC - 4, fill=kit.UMBER)
        kit.triquetra(a, x, y, 12, kit.LANTERN)


def mfolk(a, i, j, **kw):
    folk_token(a, *cell(i, j), 14, **kw)


def mshadow(a, i, j):
    """The Shadow covering cells (i, j) to (i + 1, j + 1)."""
    x, y = cell(i, j)
    shadow_token(a, x + MC / 2, y - MC / 2, MC - 5)


def mghost(a, i, j, col=CREAM):
    x, y = cell(i, j)
    a.rect(x - MC / 2 + 5, y - MC * 1.5 + 5, 2 * MC - 10, 2 * MC - 10, rx=8, fill="none", stroke=col, stroke_width=2.2,
           stroke_dasharray="6 5")


def marrow(a, c1, c2, col=CREAM, bend=0.0, shorten=14, **kw):
    x1, y1 = cell(*c1)
    x2, y2 = cell(*c2)
    L = math.hypot(x2 - x1, y2 - y1) or 1
    ux, uy = (x2 - x1) / L, (y2 - y1) / L
    kit.arrow(a, x1 + ux * shorten, y1 + uy * shorten, x2 - ux * 4, y2 - uy * 4, col=col, w=3.2, bend=bend, head=11, **kw)


def r_gust(a):
    mini(a)
    for i, j in ((0, 2), (3, 3), (4, 1)):
        mfolk(a, i, j)
        marrow(a, (i, j), (i, j - 1), shorten=16)
    mfolk(a, 1, 1)
    kit.suit_mark(a, "wind", MX + 2.5 * MC, MY + 0.5 * MC, 1.1, col=CREAM)


def r_blessing(a):
    mini(a, knots=())
    for c in ((1, 1), (3, 2), (2, 3)):
        x, y = cell(*c)
        a.rect(x - MC / 2 + 2, y - MC / 2 + 2, MC - 4, MC - 4, fill="#9cb4c8")
        kit.suit_mark(a, "rain", x, y, 0.9)
    mfolk(a, 1, 0)
    marrow(a, (1, 0), (1, 1), shorten=16)
    marrow(a, (1, 1), (1, 3), col=kit.GOLD, bend=-0.3, shorten=10)


def r_prophecy(a):
    mini(a)
    mshadow(a, 0, 2)
    mghost(a, 2, 2)
    x, y = cell(2, 2)
    kit.arrow(a, x - MC * 0.42, y - MC / 2, x + MC * 0.3, y - MC / 2, col=CREAM, w=3, head=11)
    mfolk(a, 0, 0)
    mfolk(a, 4, 0)
    kit.suit_mark(a, "song", MX + 4.5 * MC, MY + 3.5 * MC - MC * 3 + MC * 2, 0.9)


def r_tremor(a):
    mini(a)
    for (i, j), (di, dj) in (((0, 0), (1, 0)), ((2, 1), (1, 0)), ((3, 2), (-1, 0)), ((1, 3), (-1, 0))):
        mfolk(a, i, j)
        marrow(a, (i, j), (i + di, j + dj), col=kit.RUBRIC if dj == 0 else CREAM, shorten=16)
    kit.suit_mark(a, "tremor", MX + 4.4 * MC, MY + 0.5 * MC, 0.9, col=CREAM)


def r_leaf(a):
    mini(a)
    x, y = cell(3, 3)
    leaf_token(a, x, y - 2, 0.42)
    for j in (2, 1):
        x, y = cell(3, j)
        a.circle(x, y, 4, fill="#c8702a", opacity=0.8)
    marrow(a, (3, 3), (3, 0), col="#c8702a", shorten=20)
    mfolk(a, 3, 0)
    mfolk(a, 0, 1)


def r_mandible(a):
    mini(a)
    x, y = cell(2, 2)
    a.circle(x, y, 19, fill=kit.GOLD, stroke=EDGE, stroke_width=2)
    beetle_token(a, x, y + 2, 0.34)
    mfolk(a, 2, 0)
    marrow(a, (2, 0), (2, 1), shorten=16)
    x, y = cell(2, 1)
    a.path(f"M{x - 12},{y - 22} h24", stroke=kit.RUBRIC, stroke_width=4, stroke_linecap="round")
    mfolk(a, 4, 2)


def r_spear(a):
    mini(a)
    mshadow(a, 2, 2)
    mfolk(a, 1, 1)
    x, y = cell(1, 2)
    kit.sigil(a, "spear", x - 2, y, 0.6, col=CREAM, w=2.4)
    kit.arrow(a, MX + 4.1 * MC, MY + 1 * MC, MX + 4.9 * MC, MY + 1 * MC, col=kit.RUBRIC, w=4, head=12)


def r_quill(a):
    mini(a)
    mshadow(a, 0, 2)
    for n, (i, j) in enumerate(((1, 2), (2, 1))):
        mghost(a, i, j, col=kit.GOLD if n else CREAM)
        x, y = cell(i, j)
        a.circle(x + MC / 2 + n * 14, y - MC / 2, 11, fill=CREAM, stroke=EDGE, stroke_width=1.5)
        a.text(x + MC / 2 + n * 14, y - MC / 2 + 5, str(n + 1), size=14, family="serif", fill=EDGE, text_anchor="middle", font_weight="bold")
    mfolk(a, 4, 0)
    mfolk(a, 0, 0)


def r_eye(a):
    mini(a)
    mshadow(a, 2, 2)
    x, y = cell(2, 2)
    kit.sigil(a, "eye", x + MC / 2, y - MC / 2, 0.9, col=kit.GOLD, w=2.6)
    for k in range(3):
        rr = 34 + k * 12
        a.path(f"M{f(x + MC / 2 - rr)},{f(y + MC * 0.72)} q{f(rr)},{f(14 + k * 4)} {f(2 * rr)},0", fill="none", stroke=kit.GOLD, stroke_width=2.4 - k * 0.5,
               opacity=1 - k * 0.25)
    mfolk(a, 1, 0)
    mfolk(a, 3, 0)
    mfolk(a, 0, 1)


def r_hand(a):
    mini(a)
    hand_token(a, MX + 2.5 * MC, MY + 1.5 * MC + 8, 1.0)
    for i in (0, 2, 4):
        mfolk(a, i, 0)
    for i in (0, 4):
        kit.arrow(a, MX + i * MC + MC / 2 + (10 if i == 0 else -10), MY + 2.1 * MC, MX + i * MC + MC / 2 + (4 if i == 0 else -4), MY + 3.0 * MC, col=CREAM, w=2.6,
                  head=10, stroke_dasharray="5 4")


def r_hollow(a):
    mini(a)
    x, y = cell(2, 1)
    hollow_token(a, x, y, MC / 2 - 1)
    mfolk(a, 1, 1)
    mfolk(a, 3, 2)
    for k in range(4):
        a.circle(MX + 3.6 * MC + k * 13, MY + 0.5 * MC, 5, fill=kit.CHALK if k == 3 else "none", stroke=CREAM, stroke_width=1.6)


RULES = [
    ("gust", "GUST", "from Wind", ["Every 3rd round, every Folk", "not on a knot slides 1 down"], r_gust),
    ("blessing", "BLESSING", "from Rain", ["3 rain squares: a Folk ending", "its move there moves again"], r_blessing),
    ("prophecy", "PROPHECY", "from Song", ["The Shadow must announce", "its next move one turn ahead"], r_prophecy),
    ("tremor", "TREMOR", "from Tremor", ["Every 4th round, all Folk shift", "1 square along this pattern"], r_tremor),
    ("leaf", "LEAF", "from Leaf", ["A leaf falls 1 square per round;", "a Folk it lands on is hidden for good"], r_leaf),
    ("mandible", "MANDIBLE", "from Mandible", ["A beetle on the board: a god blocks,", "a monster hides any Folk it touches"], r_mandible),
    ("spear", "SPEAR", "Spear policy", ["Once per game,", "push the Shadow 1 square"], r_spear),
    ("quill", "QUILL", "Quill policy", ["See the Shadow’s", "next 2 moves"], r_quill),
    ("eye", "EYE", "Eye policy", ["Once per game, a chant:", "the Shadow skips a turn"], r_eye),
    ("hand", "THE HAND", "winter only (Twig)", ["Round 10: a Hand comes down on a row", "and sets every piece on the Root row"], r_hand),
    ("hollow-square", "HOLLOW SQUARE", "from the Pulse reading", ["Every fourth round one square", "falls out of the board for good"], r_hollow),
]


def rule_card(a, key, title, src, lines, pic):
    cold = key == "hollow-square"
    cp = a.clip('<rect x="1" y="1" width="298" height="418" rx="14"/>')
    a.open("g", clip_path=cp)
    ground(a)
    a.rect(10, 10, 280, 400, rx=9, fill="#3a281c", stroke=kit.CHALK if cold else kit.GOLD, stroke_width=2)
    kit.plait(a, 30, 34, 270, 34, kit.CHALK if cold else kit.AMBER, w=4.5, period=20, amp=4)
    a.text(150, 80, title, size=26 if len(title) < 10 else 21, family="serif", fill=CREAM, text_anchor="middle", letter_spacing=3,
           font_weight="bold")
    pic(a)
    for i, ln in enumerate(lines):
        a.text(150, 324 + i * 21, ln, size=14.5, family="serif", fill=CREAM, text_anchor="middle")
    a.text(150, 386, src, size=13, family="serif", fill=kit.SAGE, text_anchor="middle", font_style="italic")
    kit.plait(a, 60, 398, 240, 398, kit.SAGE, w=3, period=18, amp=3)
    a.close()
    a.rect(1, 1, 298, 418, rx=14, fill="none", stroke=EDGE, stroke_width=2)


for key, title, src, lines, pic in RULES:
    def _mk(key=key, title=title, src=src, lines=lines, pic=pic):
        def draw(a: Art):
            rule_card(a, key, title, src, lines, pic)
        draw.__doc__ = (f"Rule card {title.title()} ({src}): " + " ".join(lines) + ". A small knotwork board above the words shows the "
                        "rule happening.")
        return draw
    asset(G, f"tns-rule-{key}", group="cards", title=f"Rule card: {title.title()}", w=300, h=420, row=ROW)(_mk())

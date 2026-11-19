"""The Stuffed Ones: the shared hand for the art drawn by code.

Palette and rules from DEEP_DIVE.md section 4: cedar, attic dust, moss, rust, sky, bone thread and
night; hunger runs amber to red and is the only saturated colour. Every drawn line is a row of
stitches (the ruled lithograph plates excepted). Textures: felt fibre, counted weave, tissue.
"""
import math

from artkit import f

G = "stuffed-ones"

CEDAR = "#5B3A24"
DUST = "#D9CBB0"
MOSS = "#6F7A4B"
RUST = "#A8512E"
SKY = "#8FA9B5"
BONE = "#F2EBDD"
NIGHT = "#2E3A47"
AMBER = "#E0902A"
RED = "#B3261E"
INK = "#2b1e15"
LINEN = "#d8c8a6"
TISSUE = "#eadfc4"


def mix(c1, c2, t):
    t = max(0.0, min(1.0, t))
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(a, b))


def dark(c, t=0.3):
    return mix(c, "#150d08", t)


def light(c, t=0.3):
    return mix(c, BONE, t)


def warmth(t):
    return mix(DUST, AMBER, t * 2) if t < 0.5 else mix(AMBER, RED, (t - 0.5) * 2)


CEDAR_D = dark(CEDAR, 0.4)
FELTS = [MOSS, RUST, SKY, light(RUST, 0.45), mix(MOSS, DUST, 0.45), mix(SKY, NIGHT, 0.35), mix(CEDAR, DUST, 0.3),
         mix(RUST, CEDAR, 0.45)]


# ---- path builders --------------------------------------------------------------------------------
def C(x, y, r):
    return f"M{f(x - r)},{f(y)}a{f(r)},{f(r)} 0 1,0 {f(2 * r)},0a{f(r)},{f(r)} 0 1,0 {f(-2 * r)},0z"


def E(x, y, rx, ry):
    return f"M{f(x - rx)},{f(y)}a{f(rx)},{f(ry)} 0 1,0 {f(2 * rx)},0a{f(rx)},{f(ry)} 0 1,0 {f(-2 * rx)},0z"


def R(x, y, w, h, r=0):
    if not r:
        return f"M{f(x)},{f(y)}h{f(w)}v{f(h)}h{f(-w)}z"
    return (f"M{f(x + r)},{f(y)}h{f(w - 2 * r)}a{r},{r} 0 0,1 {r},{r}v{f(h - 2 * r)}a{r},{r} 0 0,1 -{r},{r}"
            f"h{f(-(w - 2 * r))}a{r},{r} 0 0,1 -{r},-{r}v{f(-(h - 2 * r))}a{r},{r} 0 0,1 {r},-{r}z")


def P(*pts):
    return "M" + "L".join(f"{f(x)},{f(y)}" for x, y in pts) + "z"


def star(cx, cy, r1, r2, n=5, rot=-90):
    pts = []
    for i in range(2 * n):
        r = r1 if i % 2 == 0 else r2
        a = math.radians(rot + 180 * i / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return P(*pts)


def spiral_d(cx, cy, r0, r1, turns, n=60, start=0.0):
    pts = []
    for i in range(n + 1):
        t = i / n
        a = start + t * turns * 2 * math.pi
        r = r0 + (r1 - r0) * t
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return "M" + "L".join(f"{f(x)},{f(y)}" for x, y in pts)


# ---- surfaces -------------------------------------------------------------------------------------
def felt_filter(a, shadow=0.35, sd=2.2, dy=3, freq=1.1):
    """Soft shadow under a cut-felt shape plus light and dark fibre flecks inside it."""
    key = ("_felt", shadow, sd, dy, freq)
    cache = a.__dict__.setdefault("_cache", {})
    if key not in cache:
        fid = a.uid("felt")
        s = a.seed % 97 + 1
        a.defn(f'<filter id="{fid}" x="-15%" y="-15%" width="130%" height="130%">'
               f'<feGaussianBlur in="SourceAlpha" stdDeviation="{f(sd)}"/><feOffset dx="{f(dy * 0.6)}" dy="{f(dy)}"/>'
               f'<feComponentTransfer result="s"><feFuncA type="linear" slope="{f(shadow)}"/></feComponentTransfer>'
               f'<feTurbulence type="fractalNoise" baseFrequency="{f(freq)}" numOctaves="2" seed="{s}" result="n"/>'
               f'<feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 0.96  0 0 0 0 0.88  0 0 0 -1.2 0.45"/>'
               f'<feComposite in2="SourceAlpha" operator="in" result="l"/>'
               f'<feColorMatrix in="n" values="0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 1.3 -0.74"/>'
               f'<feComposite in2="SourceAlpha" operator="in" result="d"/>'
               f'<feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/><feMergeNode in="l"/>'
               f'<feMergeNode in="d"/></feMerge></filter>')
        cache[key] = f"url(#{fid})"
    return cache[key]


def weave_pattern(a, cell=3.0, lightc=BONE, darkc=INK, lo=0.28, do=0.16):
    key = ("_weave", cell, lightc, darkc, lo, do)
    cache = a.__dict__.setdefault("_cache", {})
    if key not in cache:
        pid = a.uid("wv")
        c = cell
        a.defn(f'<pattern id="{pid}" width="{f(2 * c)}" height="{f(2 * c)}" patternUnits="userSpaceOnUse">'
               f'<path d="M0,{f(c * .5)}H{f(2 * c)}M0,{f(c * 1.5)}H{f(2 * c)}" stroke="{lightc}" stroke-width="{f(c * .45)}" '
               f'opacity="{lo}"/><path d="M{f(c * .5)},0V{f(2 * c)}M{f(c * 1.5)},0V{f(2 * c)}" stroke="{darkc}" '
               f'stroke-width="{f(c * .4)}" opacity="{do}"/></pattern>')
        cache[key] = f"url(#{pid})"
    return cache[key]


def linen(a, color=LINEN, cell=3.0, grain=0.22, x=0, y=0, w=None, h=None):
    """Counted linen: flat colour, a two-thread weave and a little grain."""
    w = a.w if w is None else w
    h = a.h if h is None else h
    if x == 0 and y == 0 and w == a.w and h == a.h:
        a.paper(color, grain=grain, fibre=0.8)
    else:
        a.rect(x, y, w, h, fill=color)
    a.rect(x, y, w, h, fill=weave_pattern(a, cell))


def lamp(a, cx, cy, r, color=AMBER, strength=0.5):
    """A practical light: a soft pool of warm light."""
    a.circle(cx, cy, r, fill=a.radial([(0, color, strength), (0.6, color, strength * 0.35), (1, color, 0)]))


def shade(a, strength=0.5, color="#1a0f08"):
    a.vignette(strength, color)


# ---- stitches -------------------------------------------------------------------------------------
def thread(a, d, color=BONE, w=2.6, dash="8 5", shadow=True, **kw):
    """A row of stitches along a path."""
    if shadow:
        a.path(d, fill="none", stroke="#1a0f08", stroke_width=w, stroke_dasharray=dash, stroke_linecap="round",
               opacity=0.3, transform="translate(0.8 1.4)")
    a.path(d, fill="none", stroke=color, stroke_width=w, stroke_dasharray=dash, stroke_linecap="round", **kw)


def whip(a, d, color=BONE, w=1.8, depth=8, gap=7):
    """Whip (or blanket) stitches over the edge of a path: short ticks across it, and the laid thread."""
    a.path(d, fill="none", stroke=color, stroke_width=depth, stroke_dasharray=f"{f(w)} {f(gap)}")
    a.path(d, fill="none", stroke=color, stroke_width=w * 0.8, stroke_dasharray=f"{f(gap + w - 1.5)} 1.5", opacity=0.9)


def felt(a, d, color, edge=None, depth=8, gap=7, w=1.8, flt=None, **kw):
    """A cut-felt shape with shadow and fibre; edge is the thread colour of its whip stitch."""
    a.path(d, fill=color, filter=flt or felt_filter(a), **kw)
    if edge:
        a.open("g", **({"transform": kw["transform"]} if "transform" in kw else {}))
        whip(a, d, edge, w=w, depth=depth, gap=gap)
        a.close()


def button(a, x, y, r, color, thr=BONE, holes=4, shadow=True):
    if shadow:
        a.circle(x + r * 0.12, y + r * 0.18, r, fill="#1a0f08", opacity=0.3)
    a.circle(x, y, r, fill=color, stroke=dark(color, 0.4), stroke_width=max(0.8, r * 0.09))
    a.circle(x, y, r * 0.7, fill="none", stroke=dark(color, 0.22), stroke_width=max(0.6, r * 0.07))
    a.path(f"M{f(x - r * .62)},{f(y - r * .3)}a{f(r * .7)},{f(r * .7)} 0 0,1 {f(r * .7)},{f(-r * .42)}", fill="none",
           stroke=light(color, 0.6), stroke_width=max(0.6, r * 0.09), stroke_linecap="round", opacity=0.8)
    h = r * 0.27
    pts = [(-h, -h), (h, -h), (-h, h), (h, h)] if holes == 4 else [(-h, 0), (h, 0)]
    for dx, dy in pts:
        a.circle(x + dx, y + dy, r * 0.11, fill=dark(color, 0.65))
    if holes == 4:
        a.path(f"M{f(x - h)},{f(y - h)}L{f(x + h)},{f(y + h)}M{f(x + h)},{f(y - h)}L{f(x - h)},{f(y + h)}", stroke=thr,
               stroke_width=r * 0.13, stroke_linecap="round")
    else:
        a.path(f"M{f(x - h)},{f(y)}L{f(x + h)},{f(y)}", stroke=thr, stroke_width=r * 0.16, stroke_linecap="round")


# ---- cross-stitch ---------------------------------------------------------------------------------
FONT = {
    "A": ["...X...", "..X.X..", "..X.X..", ".X...X.", ".X...X.", ".XXXXX.", ".X...X.", ".X...X.", "XXX.XXX"],
    "B": ["XXXXX..", ".X...X.", ".X...X.", ".X...X.", ".XXXX..", ".X...X.", ".X...X.", ".X...X.", "XXXXX.."],
    "C": ["..XXX.X", ".X...XX", "X.....X", "X......", "X......", "X......", "X.....X", ".X...X.", "..XXX.."],
    "D": ["XXXXX..", ".X...X.", ".X....X", ".X....X", ".X....X", ".X....X", ".X....X", ".X...X.", "XXXXX.."],
    "E": ["XXXXXXX", ".X....X", ".X.....", ".X..X..", ".XXXX..", ".X..X..", ".X.....", ".X....X", "XXXXXXX"],
    "F": ["XXXXXXX", ".X....X", ".X.....", ".X..X..", ".XXXX..", ".X..X..", ".X.....", ".X.....", "XXX...."],
    "G": ["..XXX.X", ".X...XX", "X.....X", "X......", "X......", "X...XXX", "X.....X", ".X...XX", "..XXX.X"],
    "H": ["XXX.XXX", ".X...X.", ".X...X.", ".X...X.", ".XXXXX.", ".X...X.", ".X...X.", ".X...X.", "XXX.XXX"],
    "I": ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X..", "..X..", "XXXXX"],
    "J": ["..XXXXX", "....X..", "....X..", "....X..", "....X..", "....X..", "X...X..", "X...X..", ".XXX..."],
    "K": ["XXX.XXX", ".X...X.", ".X..X..", ".X.X...", ".XX....", ".X.X...", ".X..X..", ".X...X.", "XXX.XXX"],
    "L": ["XXX....", ".X.....", ".X.....", ".X.....", ".X.....", ".X.....", ".X.....", ".X....X", "XXXXXXX"],
    "M": ["XX.....XX", ".XX...XX.", ".X.X.X.X.", ".X.X.X.X.", ".X..X..X.", ".X..X..X.", ".X.....X.", ".X.....X.",
          "XXX...XXX"],
    "N": ["XX...XXX", ".XX...X.", ".X.X..X.", ".X.X..X.", ".X..X.X.", ".X..X.X.", ".X...XX.", ".X...XX.", "XXX...X."],
    "O": ["..XXX..", ".X...X.", "X.....X", "X.....X", "X.....X", "X.....X", "X.....X", ".X...X.", "..XXX.."],
    "P": ["XXXXXX.", ".X....X", ".X....X", ".X....X", ".XXXXX.", ".X.....", ".X.....", ".X.....", "XXX...."],
    "Q": ["..XXX..", ".X...X.", "X.....X", "X.....X", "X.....X", "X.....X", "X..X..X", ".X..XX.", "..XXX.X"],
    "R": ["XXXXXX.", ".X....X", ".X....X", ".X....X", ".XXXXX.", ".X.X...", ".X..X..", ".X...X.", "XXX..XX"],
    "S": [".XXXX.X", "X....XX", "X.....X", "X......", ".XXXXX.", "......X", "X.....X", "XX....X", "X.XXXX."],
    "T": ["XXXXXXX", "X..X..X", "...X...", "...X...", "...X...", "...X...", "...X...", "...X...", "..XXX.."],
    "U": ["XXX.XXX", ".X...X.", ".X...X.", ".X...X.", ".X...X.", ".X...X.", ".X...X.", ".X...X.", "..XXX.."],
    "V": ["XXX.XXX", ".X...X.", ".X...X.", ".X...X.", "..X.X..", "..X.X..", "..X.X..", "...X...", "...X..."],
    "W": ["XXX...XXX", ".X.....X.", ".X.....X.", ".X..X..X.", ".X..X..X.", ".X.X.X.X.", ".X.X.X.X.", "..X...X..",
          "..X...X.."],
    "X": ["XXX.XXX", ".X...X.", "..X.X..", "..X.X..", "...X...", "..X.X..", "..X.X..", ".X...X.", "XXX.XXX"],
    "Y": ["XXX.XXX", ".X...X.", "..X.X..", "..X.X..", "...X...", "...X...", "...X...", "...X...", "..XXX.."],
    "Z": ["XXXXXXX", "X....X.", "....X..", "....X..", "...X...", "..X....", "..X....", ".X....X", "XXXXXXX"],
    " ": ["...."] * 9,
    ",": ["..", "..", "..", "..", "..", "..", "..", ".X", "X."],
    ".": [".", ".", ".", ".", ".", ".", ".", ".", "X"],
    ":": [".", ".", ".", "X", ".", ".", ".", "X", "."],
    "'": [".X", "X.", "..", "..", "..", "..", "..", "..", ".."],
}


def text_cells(s):
    """Cells (i, j) of a line of cross-stitch lettering, and its width in cells."""
    out, x = [], 0
    for ch in s.upper():
        g = FONT.get(ch, FONT[" "])
        for j, row in enumerate(g):
            for i, c in enumerate(row):
                if c == "X":
                    out.append((x + i, j))
        x += len(g[0]) + 1
    return out, max(0, x - 1)


def crosses(a, cells, x0, y0, cs, color, w=None, shadow=None, **kw):
    """One cross-stitch per cell: runs of cells filled with a pattern of one cross."""
    w = w or cs * 0.32
    m = cs * 0.2
    k = cs - m

    def pat(col, op=1.0):
        pid = a.uid("x")
        a.defn(f'<pattern id="{pid}" x="{f(x0)}" y="{f(y0)}" width="{f(cs)}" height="{f(cs)}" patternUnits="userSpaceOnUse">'
               f'<path d="M{f(m)},{f(m)}L{f(k)},{f(k)}M{f(k)},{f(m)}L{f(m)},{f(k)}" stroke="{col}" stroke-width="{f(w)}" '
               f'stroke-linecap="round" opacity="{f(op)}"/></pattern>')
        return f"url(#{pid})"
    rows = {}
    for i, j in cells:
        rows.setdefault(j, []).append(i)
    d = []
    for j, xs in sorted(rows.items()):
        xs = sorted(set(xs))
        st = prev = xs[0]
        for i in xs[1:] + [None]:
            if i is not None and i == prev + 1:
                prev = i
                continue
            n = prev - st + 1
            d.append(f"M{f(x0 + st * cs)},{f(y0 + j * cs)}h{f(n * cs)}v{f(cs)}h{f(-n * cs)}z")
            if i is not None:
                st = prev = i
    d = "".join(d)
    if not d:
        return
    if shadow:
        a.path(d, fill=pat(shadow, 0.55), transform=f"translate({f(cs * 0.22)} {f(cs * 0.26)})")
    a.path(d, fill=pat(color), **kw)


def xtext(a, s, x, y, cs, color, shadow=None, align="left", **kw):
    cells, wc = text_cells(s)
    if align == "center":
        x -= wc * cs / 2
    elif align == "right":
        x -= wc * cs
    crosses(a, cells, x, y, cs, color, shadow=shadow, **kw)
    return wc * cs


def band(a, x, y, w, cs, color, color2=None, seed=0, rows=5, unit=6):
    """A sampler band: a small mirrored motif repeated along a line, drawn in cross-stitch."""
    import random
    r = random.Random(seed * 7919 + 13)
    half = [[r.random() < 0.46 for _ in range(unit // 2)] for _ in range(rows)]
    for row in half:
        row[r.randrange(unit // 2)] = True
    n = int(w / cs / (unit + 1))
    x += (w - (n * (unit + 1) - 1) * cs) / 2
    c1, c2 = [], []
    for k in range(n):
        for j in range(rows):
            for i in range(unit):
                ii = i if i < unit // 2 else unit - 1 - i
                if half[j][ii]:
                    (c2 if (j == rows // 2 and ii == unit // 2 - 1) else c1).append((k * (unit + 1) + i, j))
    crosses(a, c1, x, y, cs, color)
    if c2:
        crosses(a, c2, x, y, cs, color2 or color)


SPRITES = {
    "bear": [".XX.....XX.", "XXXX...XXXX", ".XXXXXXXXX.", ".XXXXXXXXX.", ".XXoXXXoXX.", ".XXXXXXXXX.", ".XXXXnXXXX.",
             "..XXXXXXX..", "XXXXXXXXXXX", "XXXXXXXXXXX", ".XXXXXXXXX.", ".XXX...XXX."],
    "cat": ["X.........X", "XX.......XX", "XXXXXXXXXXX", ".XXXXXXXXX.", ".XXoXXXoXX.", ".XXXXXXXXX.", ".XXXXnXXXX.",
            "..XXXXXXX..", ".XXXXXXXXX.", "XXXXXXXXXXX", ".XXXXXXXXX.", ".XXX...XXX."],
    "rabbit": [".XX.....XX.", ".XX.....XX.", ".XX.....XX.", ".XXX...XXX.", ".XXXXXXXXX.", ".XXoXXXoXX.", ".XXXXnXXXX.",
               "..XXXXXXX..", ".XXXXXXXXX.", "XXXXXXXXXXX", ".XXXXXXXXX.", ".XXX...XXX."],
    "dog": ["...........", "..XXXXXXX..", "XXXXXXXXXXX", "XXXXXXXXXXX", "XXXoXXXoXXX", "XX.XXXXX.XX", "...XXnXX...",
            "..XXXXXXX..", ".XXXXXXXXX.", "XXXXXXXXXXX", ".XXXXXXXXX.", ".XXX...XXX."],
}


def sprite(a, kind, x, y, cs, color, eye=INK, nose=None):
    rows = SPRITES[kind]
    body = [(i, j) for j, r in enumerate(rows) for i, c in enumerate(r) if c == "X"]
    eyes = [(i, j) for j, r in enumerate(rows) for i, c in enumerate(r) if c == "o"]
    nos = [(i, j) for j, r in enumerate(rows) for i, c in enumerate(r) if c == "n"]
    crosses(a, body, x, y, cs, color)
    crosses(a, eyes, x, y, cs, eye)
    crosses(a, nos, x, y, cs, nose or dark(color, 0.5))


# ---- the small pictures (each in a 100 x 100 box): (layer, path) in drawing order ------------------
# layers: m main cloth, a accent cloth, h hole or dark detail, w warm, l line of stitches
def _ring(cx, cy, r):
    return C(cx, cy, r)


ICONS = {
    "door": [("m", "M26,90V32a24,24 0 0,1 48,0V90Z"), ("l", "M36,84V36a14,14 0 0,1 28,0V84"), ("h", C(64, 60, 3.6))],
    "lamp": [("a", R(47, 46, 6, 34) + "M32,90h36l-7,-11h-22z"), ("m", P((28, 50), (72, 50), (61, 16), (39, 16))),
             ("l", "M34,42h32")],
    "two": [("m", C(33, 52, 19) + C(68, 46, 19)), ("h", C(28, 47, 2.4) + C(38, 47, 2.4) + C(28, 57, 2.4) + C(38, 57, 2.4)
            + C(63, 41, 2.4) + C(73, 41, 2.4) + C(63, 51, 2.4) + C(73, 51, 2.4)), ("l", "M33,52m-12,0a12,12 0 1,0 24,0"),],
    "bird": [("m", "M14,58q10,-24 36,-20q10,-14 24,-6l12,3l-10,5q0,24 -26,28q-20,2 -36,-10z"),
             ("a", "M34,54q16,-10 28,2q-10,14 -28,-2z"), ("h", C(72, 39, 2.4)), ("l", "M46,70v16M56,69v17")],
    "tree": [("a", R(45, 66, 10, 24)), ("m", P((50, 8), (74, 40), (63, 40), (82, 68), (18, 68), (37, 40), (26, 40))),
             ("l", "M50,22v38")],
    "hearth": [("m", "M12,90V42a38,32 0 0,1 76,0V90h-16V46a22,20 0 0,0 -44,0V90Z"),
               ("w", "M50,46q16,16 7,31q-2,9 -7,11q-12,-5 -9,-18q2,-11 9,-24z"), ("l", "M8,92h84")],
    "knot": [("L", "M12,62C26,16 74,18 64,48C56,72 30,70 38,46C46,18 80,28 88,62")],
    "key": [("m", C(30, 36, 18) + R(44, 32, 46, 8) + R(72, 40, 7, 14) + R(84, 40, 5, 10)), ("h", C(30, 36, 8))],
    "moon": [("m", "M62,12a38,38 0 1,0 22,66a32,32 0 1,1 -22,-66z"), ("a", star(76, 30, 8, 3.2))],
    "star": [("m", star(50, 52, 40, 16)), ("l", C(50, 52, 9))],
    "cup": [("a", E(46, 86, 32, 5)), ("m", "M20,34h52v22a26,26 0 0,1 -52,0z"), ("L", "M72,40q20,0 17,13q-3,10 -19,8"),
            ("l", "M36,26q-7,-8 0,-16M54,26q-7,-8 0,-16")],
    "chair": [("m", R(28, 8, 9, 84) + R(28, 50, 44, 9) + R(63, 50, 9, 42) + R(28, 14, 38, 7) + R(28, 30, 38, 7)),
              ("l", "M37,74h26")],
    "window": [("m", R(20, 12, 60, 70)), ("h", R(27, 19, 20, 26) + R(53, 19, 20, 26) + R(27, 51, 20, 26)
               + R(53, 51, 20, 26)), ("a", R(14, 82, 72, 7))],
    "stair": [("m", "M10,90V72h18V54h18V36h18V18h26v72z"), ("l", "M14,62L72,6M14,62v10M72,6v12M43,34v20")],
    "bell": [("m", "M50,14q26,2 26,36q0,14 11,24h-74q11,-10 11,-24q0,-34 26,-36z"), ("a", C(50, 82, 8)), ("l", "M50,4v10M30,62h40")],
    "needle": [("l", "M82,18q-34,-10 -42,18t-30,12"), ("m", P((86, 8), (92, 14), (26, 82), (12, 90), (20, 76))),
               ("h", E(82, 18, 2.2, 4.5))],
    "scissors": [("m", P((45, 56), (68, 6), (76, 10), (55, 60)) + P((55, 56), (32, 6), (24, 10), (45, 60))),
                 ("L", C(33, 76, 11) + C(67, 76, 11)), ("h", C(50, 50, 3))],
    "thimble": [("m", "M28,84V40a22,24 0 0,1 44,0V84z"), ("a", R(22, 80, 56, 9, 3)),
                ("h", "".join(C(36 + 9 * i + (4.5 if j % 2 else 0), 34 + 10 * j, 1.8) for j in range(4) for i in range(3)))],
    "spool": [("a", R(31, 22, 38, 56)), ("m", R(22, 10, 56, 12, 3) + R(22, 78, 56, 12, 3)),
              ("l", "M31,31h38M31,40h38M31,49h38M31,58h38M31,67h38M69,58q16,6 14,26")],
    "button": [("m", C(50, 50, 36)), ("l", C(50, 50, 26)), ("h", C(42, 42, 4) + C(58, 42, 4) + C(42, 58, 4) + C(58, 58, 4))],
    "mushroom": [("a", "M40,52h20q-3,20 7,38h-34q10,-18 7,-38z"), ("m", "M10,54q4,-42 40,-42t40,42z"),
                 ("h", C(32, 36, 5) + C(54, 26, 6) + C(72, 42, 4.4))],
    "leaf": [("m", "M12,86Q8,28 86,12Q92,82 12,86Z"), ("l", "M18,80L78,22M36,62l4,-20M36,62l20,2M54,44l2,-16M54,44l16,2")],
    "fish": [("m", "M8,50q28,-30 58,0q-28,30 -58,0z" + P((60, 50), (90, 28), (84, 50), (90, 72))), ("h", C(26, 46, 3)),
             ("l", "M38,36q7,14 0,28M48,40q5,10 0,20")],
    "boot": [("a", R(24, 84, 68, 7, 2)), ("m", "M28,10h28v42q24,7 32,22v10H28z"), ("l", "M34,22h16M34,32h16M34,42h16")],
    "hat": [("m", "M30,62q0,-42 20,-42t20,42z"), ("a", E(50, 66, 42, 10)), ("l", "M31,54h38")],
    "candle": [("a", R(26, 84, 48, 7, 2)), ("m", R(41, 38, 18, 46)), ("w", "M50,8q11,13 0,27q-11,-14 0,-27z"),
               ("l", "M50,32v6")],
    "acorn": [("m", "M26,46h48q0,34 -24,46q-24,-12 -24,-46z"), ("a", "M18,48q0,-28 32,-28t32,28z"),
              ("l", "M50,20v-12M30,34h40M26,42h48")],
    "feather": [("m", "M18,92Q10,40 60,8Q96,20 72,56Q54,82 18,92Z"), ("l", "M20,90L66,18M36,66l-11,-9M44,54l-13,-9M52,42"
                "l-12,-9M46,62l15,2M56,48l15,2")],
    "bed": [("m", R(8, 52, 84, 18) + R(8, 24, 9, 66) + R(83, 40, 9, 50)), ("a", R(20, 39, 24, 13, 5)),
            ("l", "M48,54v14M62,54v14M74,54v14")],
    "book": [("m", "M8,24q21,-9 42,2q21,-11 42,-2v58q-21,-9 -42,2q-21,-11 -42,-2z"),
             ("l", "M50,27v56M17,38q13,-5 25,0M17,50q13,-5 25,0M17,62q13,-5 25,0M58,38q13,-5 25,0M58,50q13,-5 25,0")],
    # memories and the rest
    "nametag": [("m", "M10,32h58l22,18l-22,18H10z"), ("h", C(72, 50, 4.4)), ("l", "M20,54h40M78,48q10,-12 12,-30")],
    "car": [("a", C(28, 74, 10) + C(72, 74, 10)), ("m", "M6,62q2,-13 15,-15l10,-19h36l13,19q13,2 14,15v10H6z"),
            ("h", P((36, 35), (48, 35), (48, 48), (29, 48)) + P((54, 35), (64, 35), (73, 48), (54, 48)))],
    "hand": [("m", "M28,92V58L15,42q-5,-9 4,-9l13,11V18q0,-6 6,-6t6,6v18V12q0,-6 6,-6t6,6v24V18q0,-6 6,-6t6,6v24V30q0,-6 "
              "5.5,-6t5.5,6v32q0,18 -14,30z"), ("l", "M36,72q14,6 30,-4")],
    "peaks": [("m", P((4, 86), (34, 28), (50, 58), (66, 20), (96, 86))),
              ("a", P((34, 28), (26, 44), (34, 40), (42, 44)) + P((66, 20), (57, 38), (66, 33), (75, 38))),
              ("w", P((40, 86), (54, 64), (68, 86)))],
    "footprints": [("m", E(32, 30, 10, 15) + E(32, 56, 7, 7) + E(66, 52, 10, 15) + E(66, 78, 7, 7))],
    "postcard": [("m", R(8, 24, 84, 54, 2)), ("a", R(70, 30, 16, 18)), ("l", "M50,30v42M56,56h28M56,64h28"),
                 ("h", C(78, 39, 3))],
    "speech": [("m", "M10,16h80v48H48L30,84V64H10z"), ("l", "M22,32h56M22,46h38")],
    "keyhole": [("m", R(28, 8, 44, 84, 8)), ("h", C(50, 40, 10) + P((45, 46), (55, 46), (61, 74), (39, 74))),
                ("l", C(38, 18, 1.5) + C(62, 18, 1.5) + C(38, 82, 1.5) + C(62, 82, 1.5))],
    "notes": [("m", E(20, 72, 10, 8) + E(49, 62, 10, 8) + E(78, 52, 10, 8)), ("L", "M29,72V30M58,62V20M87,52V10")],
    "photo": [("m", R(12, 10, 76, 82, 2)), ("h", R(20, 18, 60, 56)), ("a", "M30,54q2,-24 20,-24t20,24z" + R(45, 54, 10, 16))],
    "strap": [("m", P((4, 36), (96, 28), (96, 54), (4, 62))), ("a", R(40, 20, 26, 50, 4)), ("h", R(47, 29, 12, 32)),
              ("l", "M8,42L36,40M8,56L36,54M70,36L92,34M70,50L92,48")],
    "map": [("m", P((8, 24), (36, 14), (64, 24), (92, 14), (92, 78), (64, 88), (36, 78), (8, 88))),
            ("l", "M36,14v64M64,24v64M16,72q12,-22 26,-8t32,-30"), ("w", star(78, 32, 7, 3, 4, 45))],
    "compass": [("m", C(50, 56, 36) + R(43, 6, 14, 14, 3)), ("a", C(50, 56, 27)), ("w", P((50, 32), (56, 56), (44, 56))),
                ("h", P((50, 80), (56, 56), (44, 56)))],
    "pot": [("m", "M16,46h68v22q0,22 -34,22t-34,-22z"), ("a", R(10, 38, 80, 10, 4)),
            ("l", "M34,30q-7,-9 0,-18M50,30q-7,-9 0,-18M66,30q-7,-9 0,-18")],
    "bearhead": [("m", C(50, 54, 31) + C(24, 27, 13) + C(76, 27, 13)), ("a", E(50, 64, 13, 10) + C(24, 27, 6) + C(76, 27, 6)),
                 ("h", C(39, 47, 3.8) + C(61, 47, 3.8) + P((46, 59), (54, 59), (50, 64))), ("l", "M50,64v6")],
    "cathead": [("m", C(50, 58, 30) + P((22, 46), (22, 10), (48, 32)) + P((78, 46), (78, 10), (52, 32))),
                ("a", P((27, 36), (27, 20), (38, 32)) + P((73, 36), (73, 20), (62, 32))),
                ("h", C(39, 52, 3.8) + C(61, 52, 3.8) + P((46, 62), (54, 62), (50, 67))),
                ("l", "M22,62h12M22,70l12,-3M66,62h12M66,67l12,3")],
    "rabbithead": [("m", E(50, 66, 26, 24) + E(37, 26, 9, 25) + E(63, 26, 9, 25)), ("a", E(37, 26, 4, 17) + E(63, 26, 4, 17)),
                   ("h", C(41, 60, 3.6) + C(59, 60, 3.6) + P((47, 69), (53, 69), (50, 73))), ("l", "M50,73v6")],
    "doghead": [("m", E(50, 54, 27, 30)), ("a", "M26,34q-18,6 -12,38q12,4 16,-12z" + "M74,34q18,6 12,38q-12,4 -16,-12z"
                 + E(50, 68, 14, 11)), ("h", C(40, 46, 3.8) + C(60, 46, 3.8) + E(50, 63, 5, 3.6)), ("l", "M50,66v8")],
    "fire": [("m", P((14, 78), (82, 92), (86, 83), (18, 69)) + P((86, 78), (18, 92), (14, 83), (82, 69))),
             ("w", "M50,12q24,26 11,50q-4,10 -11,13q-16,-7 -13,-27q2,-15 13,-36z")],
    "doorajar": [("m", R(18, 6, 64, 88)), ("w", R(26, 14, 48, 80)), ("m", P((26, 14), (58, 22), (58, 90), (26, 94))),
                 ("h", C(51, 58, 3.2)), ("l", "M58,94l36,-6")],
    "pillow": [("m", "M6,58q44,-14 88,0q5,14 0,28q-44,9 -88,0q-5,-14 0,-28z"), ("a", C(50, 38, 15) + C(37, 25, 7) + C(63, 25, 7)),
               ("h", C(45, 36, 2.2) + C(55, 36, 2.2)), ("l", "M16,64q34,-9 68,0")],
    "mirror": [("m", E(50, 40, 30, 34) + R(45, 72, 10, 16) + E(50, 90, 22, 5)), ("a", E(50, 40, 22, 26)),
               ("l", "M38,34q8,-12 20,-12")],
    "binoculars": [("m", R(16, 28, 28, 58, 9) + R(56, 28, 28, 58, 9) + R(42, 40, 16, 16)), ("a", R(20, 16, 20, 14, 3)
                   + R(60, 16, 20, 14, 3)), ("h", C(30, 74, 8) + C(70, 74, 8))],
    "sketchbook": [("m", R(14, 12, 60, 78, 3)), ("l", "M22,12v78M34,58q10,-22 22,-8t8,16"),
                   ("a", P((78, 24), (88, 29), (62, 84), (52, 90), (53, 79)))],
    "cabin": [("a", R(16, 50, 68, 40)), ("m", P((6, 52), (50, 14), (94, 52)) + R(66, 18, 9, 20)),
              ("h", R(44, 64, 12, 26)), ("w", R(23, 60, 13, 13) + R(64, 60, 13, 13)), ("l", "M16,64h24M16,78h24M60,78h24")],
    "collar": [("L", E(50, 44, 36, 22)), ("a", R(39, 58, 22, 15, 3)), ("m", C(50, 86, 8)), ("h", R(45, 62, 10, 7))],
    "spiral": [("L", spiral_d(50, 50, 4, 42, 3.2, 70))],
    "eye": [("m", "M6,50q44,-40 88,0q-44,40 -88,0z"), ("a", C(50, 50, 17)), ("h", C(50, 50, 8))],
}


def icon(a, name, x, y, s, main, accent=None, linec=None, hole=None, warm=AMBER, as_felt=False, edge=None, lw=3.2,
         dash="5 4", over=None):
    """Draw one of the small pictures with its top-left at (x, y), 100 * s across."""
    accent = accent or light(main, 0.45)
    linec = linec or BONE
    hole = hole or INK
    a.open("g", transform=f"translate({f(x)} {f(y)}) scale({f(s)})")
    flt = felt_filter(a) if as_felt else None
    for lay, d in ICONS[name]:
        if lay in "maw":
            col = {"m": main, "a": accent, "w": warm}[lay]
            if as_felt:
                a.path(d, fill=col, filter=flt)
                if edge:
                    whip(a, d, edge, w=1.2 / max(s, 0.3), depth=5 / max(s, 0.5), gap=5 / max(s, 0.5))
            else:
                a.path(d, fill=col)
                if over:
                    a.path(d, fill=over)
        elif lay == "h":
            a.path(d, fill=hole)
        elif lay == "l":
            a.path(d, fill="none", stroke=linec, stroke_width=lw, stroke_dasharray=dash, stroke_linecap="round")
        elif lay == "L":
            a.path(d, fill="none", stroke=dark(main, 0.4), stroke_width=lw * 2.6, stroke_linecap="round", opacity=0.5,
                   transform="translate(1 1.6)")
            a.path(d, fill="none", stroke=main, stroke_width=lw * 2.2, stroke_linecap="round")
            a.path(d, fill="none", stroke=light(main, 0.5), stroke_width=lw * 0.5, stroke_dasharray="2 5",
                   stroke_linecap="round")
    a.close()


def tag(a, x, y, w, h, s, color=BONE, ink=INK, size=None, rot=0, family="serif", italic=True):
    """A small cloth name tag, hemmed, with a word on it."""
    a.open("g", transform=f"rotate({f(rot)} {f(x + w / 2)} {f(y + h / 2)})")
    a.path(R(x, y, w, h, 3), fill=color, filter=felt_filter(a))
    a.path(R(x + 4, y + 4, w - 8, h - 8, 2), fill="none", stroke=mix(color, ink, 0.45), stroke_width=1.2, stroke_dasharray="4 3")
    if s:
        a.text(x + w / 2, y + h / 2 + (size or h * 0.42) * 0.36, s, size=size or h * 0.42, family=family, fill=ink,
               text_anchor="middle", **({"font_style": "italic"} if italic else {}))
    a.close()


def satin(a, color=INK, angle=35, gap=3.0, w=1.0, op=0.3):
    """A pattern of long parallel stitches, to lay over a filled shape so it reads as satin stitch."""
    pid = a.uid("sat")
    a.defn(f'<pattern id="{pid}" width="{f(gap)}" height="{f(gap)}" patternUnits="userSpaceOnUse" '
           f'patternTransform="rotate({angle})"><path d="M0,0H{f(gap)}" stroke="{color}" stroke-width="{f(w)}" '
           f'opacity="{op}"/></pattern>')
    return f"url(#{pid})"

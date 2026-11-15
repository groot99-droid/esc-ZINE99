"""Tooling motifs: small line pictures drawn in a box of -50..50, in whatever paint the caller passes.
Used by the Naming's stamps, the chapter headings and the ornaments."""
import math

from artkit import f


def _S(g, w=3.0):
    return dict(fill="none", stroke=g, stroke_width=w, stroke_linecap="round", stroke_linejoin="round")


def _dots(a, g, pts, r=1.6):
    a.path("".join(f"M{f(x - r)},{f(y)}a{r},{r} 0 1,0 {2 * r},0a{r},{r} 0 1,0 {-2 * r},0" for x, y in pts), fill=g)


def desert(a, g):
    S = _S(g)
    a.path("M-46,14 H46", **S)
    a.path("M-18,14 A18,18 0 0,1 18,14Z", fill=g)
    for k in range(7):
        t = math.pi * (k + 0.5) / 7
        a.line(-26 * math.cos(t), 14 - 26 * math.sin(t), -36 * math.cos(t), 14 - 36 * math.sin(t), **_S(g, 2))
    for y, x0, x1 in ((24, -34, -6), (24, 8, 30), (33, -20, 22), (42, -8, 8)):
        a.path(f"M{x0},{y} H{x1}", **_S(g, 2))


def eternity(a, g):
    S = _S(g, 2.4)
    for k in range(6):
        s = 0.72 ** k
        a.path(f"M{f(-46 * s)},{f(36 * s - 4)} Q0,{f(8 * s - 4)} {f(46 * s)},{f(36 * s - 4)}", **_S(g, 3 * s + .8))
    _dots(a, g, [(0, -14), (0, -22), (0, -29), (0, -35), (0, -40)], 1.5)
    a.path("M-10,-40 q10,-8 20,0", **S)


def sand_sea(a, g):
    S = _S(g)
    a.path("M-46,26 C-30,26 -22,-8 2,-22 C22,-32 38,-18 34,-4 C32,6 18,6 16,-4 C14,-12 24,-14 26,-8", **S)
    a.path("M-46,38 H46", **_S(g, 2))
    a.path("M-34,26 C-22,22 -12,4 2,-8 M-20,28 C-10,22 0,10 8,4 M-4,30 C6,26 14,18 20,10", **_S(g, 1.6))
    _dots(a, g, [(36, 6), (42, 14), (30, 16), (40, 24), (26, 26), (44, 30), (34, 30)], 1.4)


def dunes(a, g):
    a.path("M-46,34 C-34,2 -18,-6 -6,-10 C-10,6 -12,20 -6,34Z", fill=g, opacity=.9)
    a.path("M-12,34 C-2,6 14,-2 24,-4 C20,10 20,22 26,34Z", fill=g, opacity=.7)
    a.path("M18,34 C26,16 36,10 46,10 V34Z", fill=g, opacity=.5)
    a.path("M-46,40 H46 M-30,-22 h10 M8,-26 h14 M-4,-34 h8", **_S(g, 2))


def silver(a, g):
    for x, y, s in ((0, -4, 1), (-28, 18, .5), (26, 22, .6), (-22, -26, .45), (28, -22, .35)):
        a.path(f"M{f(x)},{f(y - 26 * s)} Q{f(x + 3 * s)},{f(y - 3 * s)} {f(x + 26 * s)},{f(y)} Q{f(x + 3 * s)},{f(y + 3 * s)} "
               f"{f(x)},{f(y + 26 * s)} Q{f(x - 3 * s)},{f(y + 3 * s)} {f(x - 26 * s)},{f(y)} Q{f(x - 3 * s)},{f(y - 3 * s)} "
               f"{f(x)},{f(y - 26 * s)}Z", fill=g)
    _dots(a, g, [(-40, -4), (40, 2), (2, 36), (-6, -40), (14, 38), (-36, 34)], 1.5)


def moon(a, g):
    a.path("M12,-36 A36,36 0 1,0 30,22 A28,28 0 1,1 12,-36Z", fill=g)
    for x, y, s in ((26, -14, 7), (38, 2, 4), (20, 6, 3)):
        a.path(f"M{x},{y - s} L{x + s * .3},{y - s * .3} L{x + s},{y} L{x + s * .3},{y + s * .3} L{x},{y + s} "
               f"L{x - s * .3},{y + s * .3} L{x - s},{y} L{x - s * .3},{y - s * .3}Z", fill=g)


def vines(a, g):
    S = _S(g, 2.6)
    a.path("M-44,36 C-20,30 -26,2 -4,0 C16,-2 10,-28 36,-34", **S)
    a.path("M-4,0 C6,14 26,10 40,22 M-26,22 C-30,6 -40,0 -44,-14 M10,-18 C0,-26 -6,-36 -18,-38", **_S(g, 2))
    for x, y, r in ((-14, 12, 200), (16, -8, 20), (28, 14, 60), (-36, 4, 250), (-4, -30, 160), (24, -30, 300)):
        a.path("M0,0 C5,-7 14,-7 18,0 C14,7 5,7 0,0Z", fill=g, transform=f"translate({x} {y}) rotate({r})")
    a.path("M36,-34 q8,-2 6,6 q-2,5 -6,2", **_S(g, 2))


def waves(a, g):
    for j, y in enumerate((-22, 2, 26)):
        d = "".join(f"M{-46 + i * 23 + (11 if j % 2 else 0)},{y} q11.5,-18 23,0" for i in range(4 if not j % 2 else 3))
        a.path(d, **_S(g, 3.2 - j * .5))
        _dots(a, g, [(-34.5 + i * 23 + (11 if j % 2 else 0), y + 6) for i in range(4 if not j % 2 else 3)], 1.3)


def xandri(a, g):
    """A boy in profile: head-cloth, pack strap, looking up and out."""
    a.path("M-8,40 C-10,24 -6,16 2,12 C-8,8 -14,-4 -10,-16 C-6,-30 10,-34 20,-26 C28,-20 28,-10 26,-4 L32,6 L25,8 "
           "C26,14 24,20 14,20 C16,28 22,34 30,40Z", fill=g)
    a.path("M-12,-18 C-6,-36 14,-40 24,-28 C12,-30 -2,-26 -12,-18Z M-12,-18 C-22,-10 -24,4 -30,12 C-22,10 -14,2 -10,-8", fill=g)
    a.path("M-2,14 L12,40", **_S("#3a1a0e", 3.4))
    a.circle(16, -12, 2.2, fill="#3a1a0e")


def explorer(a, g):
    S = _S(g)
    a.path("M-30,40 L-18,-38", **S)  # staff
    a.path("M-22,-30 q-8,-6 -2,-12", **_S(g, 2))
    a.path("M-2,-22 h26 q8,0 8,8 v26 q0,8 -8,8 h-26 q-8,0 -8,-8 v-26 q0,-8 8,-8Z", **S)  # pack
    a.path("M-10,-6 H32 M4,-22 q7,-14 14,0 M6,6 h10 v10 h-10Z", **_S(g, 2))
    _dots(a, g, [(-40, 44), (-34, 38)], 2)


def father(a, g):
    """An open journal with a leaf-cord laid across it."""
    S = _S(g)
    a.path("M0,-22 C-12,-30 -30,-30 -44,-24 V28 C-30,22 -12,22 0,30 C12,22 30,22 44,28 V-24 C30,-30 12,-30 0,-22Z M0,-22 V30", **S)
    a.path("M-36,-14 h26 M-36,-4 h26 M-36,6 h18 M10,-14 h26 M10,-4 h14", **_S(g, 1.6))
    a.path("M8,10 C18,2 30,18 40,8", **_S(g, 2.4))
    a.path("M40,8 C46,2 50,10 44,14Z", fill=g)


def son(a, g):
    """A small footprint walking inside a large one."""
    a.path("M-20,-40 C0,-44 16,-30 14,-6 C12,10 18,22 12,36 C8,46 -12,46 -18,36 C-24,24 -12,12 -18,-4 C-22,-18 -30,-36 -20,-40Z",
           **_S(g, 3))
    a.path("M-6,2 C2,0 8,8 6,18 C5,26 8,30 4,36 C2,40 -8,40 -10,34 C-12,28 -6,24 -8,16 C-10,10 -12,4 -6,2Z", fill=g)
    _dots(a, g, [(26, -30), (32, -20), (36, -8), (36, 4)], 2.2)


def xadra(a, g):
    """The head shaman's cane and the feather tied to it."""
    a.path("M-8,44 L2,-30 C4,-42 18,-42 20,-32 C21,-26 16,-22 12,-24", **_S(g, 4))
    a.path("M0,-12 C-14,-18 -30,-14 -40,-2 C-26,-2 -12,-4 0,-12Z", fill=g)
    a.path("M0,-12 C-12,-12 -26,-8 -40,-2", **_S("#3a1a0e", 1.2))
    a.path("M-2,2 h8 M-3,8 h8", **_S(g, 2))
    _dots(a, g, [(22, 30), (30, 20), (26, 40), (36, 34)], 1.8)


def shaman(a, g):
    """A feather headdress over a plain band."""
    for k in range(7):
        r = -60 + k * 20
        L = 40 - abs(k - 3) * 5
        a.path(f"M0,0 C6,{-L * .4} 5,{-L * .8} 0,{-L} C-5,{-L * .8} -6,{-L * .4} 0,0Z", fill=g,
               transform=f"translate(0 16) rotate({r})")
    a.path("M-36,22 Q0,10 36,22 L34,32 Q0,20 -34,32Z", fill=g)
    _dots(a, g, [(-24, 40), (-8, 37), (8, 37), (24, 40)], 2.2)


def storyteller(a, g):
    """A fire, and the curl of a voice rising from beside it."""
    a.path("M0,34 C-22,34 -24,10 -10,-2 C-10,8 -4,10 -2,2 C0,-10 -6,-18 4,-30 C4,-16 18,-10 16,6 C20,2 22,-2 22,-6 "
           "C30,10 22,34 0,34Z", fill=g)
    a.path("M-34,40 L34,40 M-28,34 L28,44 M-28,44 L28,34", **_S(g, 3))
    a.path("M-30,-12 C-40,-22 -30,-36 -18,-32 C-10,-29 -12,-18 -20,-20", **_S(g, 2.2))


def xandrixes(a, g):
    """Only a back: a long scaled ridge rising out of the sand."""
    a.path("M-46,22 C-30,-14 16,-22 46,14", **_S(g, 3.4))
    d = []
    for k in range(9):
        t = (k + .5) / 9
        x = -46 + 92 * t
        y = 22 - 34 * math.sin(math.pi * t ** .85) + 4
        d.append(f"M{f(x - 5)},{f(y + 6)} q5,-9 10,0")
        if k % 2:
            d.append(f"M{f(x - 5)},{f(y + 15)} q5,-9 10,0")
    a.path("".join(d), **_S(g, 1.8))
    a.path("M-50,28 H50 M-38,36 h22 M-4,36 h30 M-20,43 h36", **_S(g, 2))


def wondering(a, g):
    """A raised hand under one star."""
    a.path("M-14,44 C-16,26 -18,14 -16,2 L-18,-18 C-18,-24 -11,-24 -10,-18 L-9,-4 L-8,-26 C-8,-32 -1,-32 0,-26 L0,-6 "
           "L3,-28 C4,-34 11,-33 10,-27 L8,-4 L13,-20 C15,-26 21,-23 20,-18 L14,6 C22,0 28,2 24,8 C18,14 14,20 12,28 L12,44Z",
           fill=g)
    a.path("M28,-40 L30,-33 L37,-31 L30,-29 L28,-22 L26,-29 L19,-31 L26,-33Z", fill=g)


def lizard(a, g):
    a.path("M0,-42 C8,-40 10,-30 6,-24 C12,-16 12,-2 6,8 C4,20 10,28 20,30 C28,31 32,24 28,20", **_S(g, 6))
    a.path("M5,-18 L24,-28 L30,-22 M-3,-18 L-22,-26 L-28,-18 M6,2 L26,8 L30,16 M-2,4 L-22,10 L-24,20", **_S(g, 2.6))
    a.circle(0, -40, 5.5, fill=g)
    _dots(a, "#3a1a0e", [(-2.5, -42), (2.5, -42)], 1.1)


def end(a, g):
    """A line that walks toward the frame and stops short of it."""
    a.path("M-46,10 H10", **_S(g, 3.4))
    _dots(a, g, [(18, 10), (25, 10), (31, 10), (36, 10)], 1.6)
    a.path("M44,-34 V40", **_S(g, 2))
    a.path("M40,-34 h8 M40,40 h8", **_S(g, 2))
    a.path("M-46,22 h20 M-40,30 h30 M-16,-6 q8,-10 16,0", **_S(g, 1.6))


def proof(a, g):
    """A cairn of five stones, a strip of cloth tied to the top one."""
    for x, y, rx, ry in ((0, 32, 30, 9), (-4, 16, 22, 8), (3, 2, 16, 7), (-2, -11, 11, 6), (1, -22, 7, 5)):
        a.ellipse(x, y, rx, ry, fill=g)
        a.ellipse(x, y, rx, ry, fill="none", stroke="#3a1a0e", stroke_width=1.2)
    a.path("M4,-26 C14,-36 24,-28 34,-36 M4,-26 C14,-26 20,-18 30,-22", **_S(g, 2.4))
    a.path("M-44,42 H44", **_S(g, 2))


def further(a, g):
    """Footprints that go on past a pole."""
    a.path("M-8,36 V-30", **_S(g, 3.2))
    a.path("M-8,-30 L10,-24 L-8,-16Z", fill=g)
    steps = [(-40, 34, 0), (-28, 24, 1), (-16, 40, 0), (4, 22, 1), (14, 8, 0), (26, -2, 1), (34, -18, 0), (44, -28, 1)]
    for x, y, k in steps:
        a.ellipse(x, y, 5.5, 3, fill=g, transform=f"rotate(-40 {x} {y})", opacity=1 if x < 20 else .75)


def leaf_m(a, g):
    a.path("M-36,34 C-40,-4 -14,-34 30,-38 C40,-6 22,28 -14,34 C-22,35 -30,36 -36,34Z", **_S(g, 3))
    a.path("M-42,42 L22,-28 M-22,18 C-22,6 -20,-2 -14,-10 M-8,6 C-8,-6 -4,-14 2,-22 M-20,20 C-8,22 2,20 10,16 "
           "M-6,6 C6,8 16,4 22,-2 M8,-10 C16,-10 24,-14 28,-20", **_S(g, 1.8))


def wake(a, g):
    """A smooth packed track opening behind something that has gone on."""
    a.path("M0,-40 C-6,-10 -24,20 -42,42 M0,-40 C6,-10 24,20 42,42", **_S(g, 3))
    a.path("M0,-22 V40 M-12,6 V40 M12,6 V40 M-24,28 V42 M24,28 V42", **_S(g, 1.5))
    a.path("M-10,-40 q10,-10 20,0", **_S(g, 2.4))
    _dots(a, g, [(-40, -10), (-32, 0), (-44, 8), (40, -12), (34, 2), (44, 10), (-30, -22), (30, -24)], 1.5)


def mark(a, g):
    """A pole in a ring of stones."""
    a.path("M0,26 V-40", **_S(g, 3.4))
    a.path("M0,-40 C10,-36 14,-30 24,-32 C16,-26 10,-22 0,-24Z", fill=g)
    for k in range(9):
        t = 2 * math.pi * k / 9 + .2
        a.ellipse(34 * math.cos(t), 28 + 11 * math.sin(t), 6.5, 4, fill=g)
    a.path("M-4,-6 h8 M-4,2 h8", **_S(g, 2))


# ---- chapter emblems (some reuse the stamps) ---------------------------------------------------
def window(a, g):
    """An arched window with a beam of light leaving it."""
    a.path("M-22,34 V-10 A22,22 0 0,1 22,-10 V34Z M0,-32 V34 M-22,2 H22", **_S(g, 3))
    a.path("M22,-6 L46,30 M22,8 L40,38 M22,22 L32,42", **_S(g, 1.6))


def broom(a, g):
    a.path("M26,-40 L-10,10", **_S(g, 3.4))
    a.path("M-18,4 L-2,18 L-22,42 L-42,26Z", fill=g)
    a.path("M-28,24 l8,8 M-24,14 l12,12", **_S("#3a1a0e", 1.4))
    _dots(a, g, [(6, 38), (14, 34), (22, 40), (30, 36), (38, 40), (16, 42)], 1.6)


def umbrella(a, g):
    a.path("M-40,0 A40,34 0 0,1 40,0 Q30,-8 20,0 Q10,-8 0,0 Q-10,-8 -20,0 Q-30,-8 -40,0Z", fill=g)
    a.path("M0,-34 V32 q0,10 -10,8", **_S(g, 3))
    a.path("M-36,18 l-6,14 M-22,24 l-6,14 M24,18 l-6,14 M38,22 l-6,14", **_S(g, 2))


def lanterns(a, g):
    a.path("M-46,-22 Q0,-2 46,-22", **_S(g, 2))
    for x, y, s in ((-30, -8, 1), (0, 0, 1.2), (30, -8, 1)):
        a.path(f"M{x},{y - 6 * s} v{6 * s}", **_S(g, 1.6))
        a.path(f"M{f(x - 8 * s)},{y} h{f(16 * s)} l{f(-3 * s)},{f(20 * s)} h{f(-10 * s)}Z", fill=g)
        a.path(f"M{x},{f(y + 6 * s)} v{f(8 * s)}", **_S("#3a1a0e", 1.6))
    a.path("M-40,40 H40", **_S(g, 2))


def candle(a, g):
    a.path("M-9,40 V-4 H9 V40Z", fill=g)
    a.path("M0,-12 C-8,-22 0,-28 0,-40 C8,-30 10,-20 0,-12Z", fill=g)
    a.path("M-22,40 H22 M9,6 q8,4 4,12", **_S(g, 3))
    for r in (22, 32):
        a.path(f"M{-r},-26 A{r},{r} 0 0,1 {r},-26", **_S(g, 1.2))


def fire_circle(a, g):
    storyteller(a, g)


def herd(a, g):
    """Three backs on a horizon, and the smooth line they leave."""
    a.path("M-46,10 H46", **_S(g, 2))
    for x, s in ((-24, .7), (2, 1), (28, .6)):
        a.path(f"M{x - 16 * s},10 Q{x},{10 - 20 * s} {x + 16 * s},10Z", fill=g)
    a.path("M-40,24 C-10,20 10,30 44,24 M-30,36 C-6,32 12,40 36,36", **_S(g, 1.8))


STAMPS = [
    # (id, word, thread, fn)
    ("desert", "DESERT", "place", desert), ("eternity", "ETERNITY", "place", eternity),
    ("sand-sea", "SAND SEA", "place", sand_sea), ("dunes", "DUNES", "place", dunes),
    ("silver", "SILVER", "place", silver), ("moon", "MOON", "place", moon),
    ("vines", "VINES", "place", vines), ("waves", "WAVES", "place", waves),
    ("xandri", "XANDRI", "person", xandri), ("explorer", "EXPLORER", "person", explorer),
    ("father", "FATHER", "person", father), ("son", "SON", "person", son),
    ("xadra", "XADRA", "person", xadra), ("shaman", "SHAMAN", "person", shaman),
    ("storyteller", "STORYTELLER", "person", storyteller), ("xandrixes", "XANDRIXES", "person", xandrixes),
    ("wondering", "WONDERING", "person", wondering), ("lizard", "LIZARD", "person", lizard),
    ("end", "END", "want", end), ("proof", "PROOF", "want", proof), ("further", "FURTHER", "want", further),
    ("leaf", "LEAF", "want", leaf_m), ("wake", "WAKE", "want", wake), ("mark", "MARK", "want", mark),
]
EMBLEMS = [window, storyteller, broom, sand_sea, umbrella, mark, lanterns, candle, herd]

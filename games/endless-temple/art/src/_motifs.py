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

# ---- motifs for the other books' tiles and the three sand-book tiles without one (added 2026-11-15) ----
def hollin(a, g):
    """Three roofs of Hollin under one long cloud."""
    a.path("M-42,36 V10 L-28,-4 L-14,10 V36Z M-8,36 V2 L8,-16 L24,2 V36Z M28,36 V14 L37,4 L46,14 V36Z", fill=g)
    a.path("M-36,-24 a10,10 0 0,1 16,-8 a14,14 0 0,1 26,0 a10,10 0 0,1 16,8Z", **_S(g, 2.4))
    a.path("M-2,36 v-12 h8 v12", **_S("#3a1a0e", 1.6))


def hill(a, g):
    """One round hill with a path up it."""
    a.path("M-46,36 Q0,-44 46,36Z", fill=g, opacity=.85)
    a.path("M-6,34 q14,-12 2,-24 q-10,-10 4,-22", **_S("#3a1a0e", 2))
    a.path("M0,-12 v-22 l14,6 l-14,6", **_S(g, 2.4))


def sky(a, g):
    """Open sky: two clouds and three birds over a low horizon."""
    a.path("M-46,38 H46", **_S(g, 2))
    a.path("M-40,6 a9,9 0 0,1 14,-8 a12,12 0 0,1 22,0 a9,9 0 0,1 12,8Z M6,-18 a7,7 0 0,1 11,-6 a10,10 0 0,1 18,0 a7,7 0 0,1 9,6Z", **_S(g, 2.4))
    a.path("M-30,-30 q5,-6 10,0 q5,-6 10,0 M10,16 q5,-6 10,0 q5,-6 10,0 M-18,24 q4,-5 8,0 q4,-5 8,0", **_S(g, 1.8))


def bell_loft(a, g):
    """A loft tower with its bell in the arch."""
    a.path("M-22,40 V-14 L0,-40 L22,-14 V40", **_S(g, 3))
    a.path("M-12,24 V0 A12,12 0 0,1 12,0 V24", **_S(g, 2))
    a.path("M-8,14 Q-8,-2 0,-4 Q8,-2 8,14Z", fill=g)
    _dots(a, g, [(0, 19)], 3)
    a.path("M-34,40 H34", **_S(g, 2.4))


def pell(a, g):
    """A small child in a long scarf, looking up."""
    a.path("M-8,40 L-4,4 Q2,-2 8,4 L12,40Z", fill=g)
    _dots(a, g, [(2, -14)], 11)
    a.path("M-8,0 Q-26,-6 -40,6 M-8,4 Q-24,6 -36,20", **_S(g, 3.4))
    a.path("M22,-34 l6,10 M34,-28 l4,10 M26,-6 l4,10", **_S(g, 1.8))


def clerk(a, g):
    """The Clerk's tall-backed chair."""
    a.path("M-16,40 V-38 H16 V40 M-16,-38 q16,-10 32,0", **_S(g, 3))
    a.path("M-22,6 H22 V16 H-22Z", fill=g)
    a.path("M-10,-28 V0 M0,-30 V0 M10,-28 V0 M-20,16 V40 M20,16 V40", **_S(g, 2))


def bakers(a, g):
    """A scored loaf, still steaming."""
    a.path("M-40,22 Q-40,-8 0,-8 Q40,-8 40,22 Q0,34 -40,22Z", fill=g)
    a.path("M-22,2 l10,14 M-4,-2 l10,16 M14,2 l10,14", **_S("#3a1a0e", 2.4))
    a.path("M-14,-18 q-6,-8 0,-14 q6,-6 0,-12 M6,-18 q-6,-8 0,-14 q6,-6 0,-12", **_S(g, 2))


def bell_ringer(a, g):
    """A bell swung on its rope."""
    a.path("M-4,-40 V-26", **_S(g, 2.4))
    a.path("M-26,14 Q-22,-26 -2,-26 Q18,-26 22,14 Q-2,22 -26,14Z", fill=g, transform="rotate(14 -2 -26)")
    _dots(a, g, [(-10, 24)], 4.5)
    a.path("M30,-40 q-6,30 4,48 q6,14 -2,30", **_S(g, 2.4))
    a.path("M-40,-6 q-6,8 0,16 M-46,-12 q-10,14 0,28", **_S(g, 1.6))


def tomorrow(a, g):
    """A sun not yet over the horizon, and an arrow toward it."""
    a.path("M-46,10 H46", **_S(g, 2.4))
    a.path("M4,10 A18,18 0 0,1 40,10Z", fill=g)
    for k in range(5):
        t = math.pi * (k + 0.5) / 5
        a.line(22 - 24 * math.cos(t), 10 - 24 * math.sin(t), 22 - 32 * math.cos(t), 10 - 32 * math.sin(t), **_S(g, 2))
    a.path("M-42,30 H-6 M-16,22 L-6,30 L-16,38", **_S(g, 2.6))


def fair_weather(a, g):
    """A whole sun, with one small cloud passing under it."""
    _dots(a, g, [(0, -8)], 15)
    for k in range(10):
        t = 2 * math.pi * k / 10
        a.line(21 * math.cos(t), -8 + 21 * math.sin(t), 30 * math.cos(t), -8 + 30 * math.sin(t), **_S(g, 2.2))
    a.path("M8,36 a8,8 0 0,1 12,-8 a11,11 0 0,1 20,2 a7,7 0 0,1 4,6Z", **_S(g, 2.2))


def road(a, g):
    """A road running to one point."""
    a.path("M-40,40 L-4,-34 M40,40 L4,-34", **_S(g, 3))
    a.path("M0,38 V24 M0,14 V4 M0,-4 V-12 M0,-18 V-24", **_S(g, 2.2))
    a.path("M-46,-34 H46", **_S(g, 1.6))


def plain(a, g):
    """A flat plain: one long horizon and little on it."""
    a.path("M-46,6 H46", **_S(g, 3))
    a.path("M-40,20 H-8 M4,20 H40 M-28,32 H24", **_S(g, 1.8))
    a.path("M26,6 v-10 M26,-4 l-5,-6 M26,-4 l5,-6", **_S(g, 1.8))


def grey_grass(a, g):
    """Three tufts of long grass bent one way."""
    for x, s in ((-28, .8), (0, 1.1), (28, .9)):
        for k in range(5):
            a.path(f"M{f(x + (k - 2) * 3)},36 Q{f(x + (k - 2) * 6 + 6 * s)},{f(36 - 30 * s)} {f(x + (k - 2) * 9 + 16 * s)},{f(36 - (44 - abs(k - 2) * 6) * s)}", **_S(g, 2))
    a.path("M-46,38 H46", **_S(g, 2))


def dusk(a, g):
    """A sun half gone under the horizon, and the first two stars."""
    a.path("M-46,8 H46", **_S(g, 2.4))
    a.path("M-18,8 A18,18 0 0,1 18,8Z", fill=g, opacity=.8)
    a.path("M-34,18 H34 M-24,28 H24 M-12,38 H12", **_S(g, 1.8))
    for x, y, s in ((-30, -24, 1), (26, -30, .7)):
        a.path(f"M{x},{y - 8 * s} L{x + 2 * s},{y - 2 * s} L{x + 8 * s},{y} L{x + 2 * s},{y + 2 * s} L{x},{y + 8 * s} L{x - 2 * s},{y + 2 * s} L{x - 8 * s},{y} L{x - 2 * s},{y - 2 * s}Z", fill=g)


def oda(a, g):
    """A hooded walker with a lantern on a pole."""
    a.path("M-22,40 L-16,-6 Q-6,-34 8,-6 L12,40Z", fill=g)
    a.path("M4,-10 L34,-34", **_S(g, 2.4))
    a.path("M28,-30 h12 l-2,16 h-8Z", fill=g)
    a.path("M-10,-8 q6,6 12,0", **_S("#3a1a0e", 1.8))


def scribe(a, g):
    """A quill, and the line it has just written."""
    a.path("M30,-40 C6,-30 -8,-8 -16,18 L-10,20 C2,2 22,-10 34,-34Z", fill=g)
    a.path("M-16,18 L-24,34", **_S(g, 2.6))
    a.path("M-40,40 q8,-8 16,0 q8,8 16,0 q8,-8 16,0 q8,8 16,0", **_S(g, 2))


def pilgrims(a, g):
    """Three hooded pilgrims walking in a file."""
    for x, s in ((-28, .8), (0, 1), (28, .8)):
        a.path(f"M{f(x - 10 * s)},36 L{f(x - 7 * s)},{f(36 - 34 * s)} Q{f(x)},{f(36 - 60 * s)} {f(x + 7 * s)},{f(36 - 34 * s)} L{f(x + 10 * s)},36Z", fill=g)
    a.path("M-46,40 H46", **_S(g, 2))


def masks(a, g):
    """One plain mask with its ties."""
    a.path("M-24,-22 Q0,-38 24,-22 Q28,14 0,36 Q-28,14 -24,-22Z", **_S(g, 3))
    a.path("M-16,-8 q7,-6 14,0 M2,-8 q7,-6 14,0", **_S(g, 2.6))
    a.path("M-6,16 h12", **_S(g, 2))
    a.path("M-24,-18 q-14,-2 -20,8 M24,-18 q14,-2 20,8", **_S(g, 1.8))


def city(a, g):
    """A far city: towers, a dome and one gate."""
    a.path("M-44,36 V4 H-30 V36Z M-26,36 V-18 H-12 V36Z M12,36 V-28 H24 V36Z M30,36 V-4 H44 V36Z", fill=g)
    a.path("M-8,36 V4 A8,10 0 0,1 8,4 V36", **_S(g, 2.6))
    a.path("M-19,-18 V-30 M18,-28 V-40", **_S(g, 2))
    a.path("M-46,38 H46", **_S(g, 2))


def answer(a, g):
    """A key."""
    a.path("M-10,-14 m-16,0 a16,16 0 1,0 32,0 a16,16 0 1,0 -32,0", **_S(g, 3.4))
    a.path("M2,-2 L34,30 M24,20 l-8,8 M32,28 l-8,8", **_S(g, 3.4))


def edge(a, g):
    """Ground that stops, and what falls from it."""
    a.path("M-46,-6 H6 V40", **_S(g, 3.2))
    a.path("M-40,6 H-8 M-36,18 H-6 M-40,30 H-8", **_S(g, 1.6))
    _dots(a, g, [(16, 2), (22, 14), (18, 26), (28, 34), (34, 20)], 2)


def ending(a, g):
    """A closed book with its ribbon out."""
    a.path("M-30,-34 H26 Q34,-34 34,-26 V34 H-30Z", **_S(g, 3))
    a.path("M-20,-34 V34 M-8,-14 H22 M-8,-2 H22", **_S(g, 2))
    a.path("M6,34 V46 L12,40 L18,46 V34Z", fill=g)


def never_ending(a, g):
    """An endless loop over a line of dunes."""
    a.path("M0,-12 C-12,-34 -40,-30 -40,-12 C-40,6 -12,10 0,-12 C12,-34 40,-30 40,-12 C40,6 12,10 0,-12Z", **_S(g, 3.2))
    a.path("M-46,34 Q-30,18 -16,34 Q0,18 16,34 Q30,18 46,34", **_S(g, 2.2))


def zorlop(a, g):
    """Three broad woody leaves, fallen: the beast itself is never shown."""
    for x, y, r in ((-20, 8, -40), (4, -6, 5), (24, 14, 50)):
        a.path("M0,26 C-20,10 -18,-20 0,-34 C18,-20 20,10 0,26Z M0,26 V-28", transform=f"translate({x} {y}) rotate({r})", **_S(g, 2.6))
    a.path("M-40,40 H40", **_S(g, 1.8))


def past_the_mark(a, g):
    """The marker flag, and a track of prints going on beyond it."""
    a.path("M-26,36 V-34 L-6,-26 L-26,-18", **_S(g, 3))
    _dots(a, g, [(-36, 36), (-26, 38), (-16, 36)], 3)
    _dots(a, g, [(0, 30), (12, 22), (24, 26), (34, 16), (44, 20)], 2.4)
    a.path("M28,-2 L44,-2 M38,-8 L44,-2 L38,4", **_S(g, 2.2))


STAMPS_BASE = len(STAMPS)
STAMPS += [
    ("hollin", "HOLLIN", "place", hollin), ("hill", "HILL", "place", hill), ("sky", "SKY", "place", sky),
    ("bell-loft", "BELL-LOFT", "place", bell_loft), ("pell", "PELL", "person", pell), ("clerk", "CLERK", "person", clerk),
    ("bakers", "BAKERS", "person", bakers), ("bell-ringer", "BELL-RINGER", "person", bell_ringer),
    ("tomorrow", "TOMORROW", "want", tomorrow), ("windows", "WINDOWS", "want", window),
    ("fair-weather", "FAIR WEATHER", "want", fair_weather),
    ("road", "ROAD", "place", road), ("plain", "PLAIN", "place", plain), ("grey-grass", "GREY GRASS", "place", grey_grass),
    ("dusk", "DUSK", "place", dusk), ("oda", "ODA", "person", oda), ("scribe", "SCRIBE", "person", scribe),
    ("pilgrims", "PILGRIMS", "person", pilgrims), ("masks", "MASKS", "person", masks), ("city", "CITY", "want", city),
    ("answer", "ANSWER", "want", answer), ("edge", "EDGE", "want", edge), ("ending", "ENDING", "want", ending),
    ("never-ending", "NEVER-ENDING", "place", never_ending), ("zorlop", "ZORLOP", "person", zorlop),
    ("past-the-mark", "PAST THE MARK", "want", past_the_mark),
]
EMBLEMS = [window, storyteller, broom, sand_sea, umbrella, mark, lanterns, candle, herd]

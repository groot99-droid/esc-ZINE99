"""The pattern walk's glyph kit (op-art geometric): eight modules a lost site is written in, and six
detail saplings that tell one candidate glyph from another."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
S = 480
DARK = "#0f3a33"


def field(a, clear=178, pulse=(240, 240)):
    """Pearl ground and the exactly spaced lattice of small trees, swelling in rings round the centre."""
    a.rect(0, 0, S, S, fill=kit.PEARL)
    d = []
    step = 20
    for j in range(-1, S // step + 2):
        for i in range(-1, S // step + 2):
            x, y = i * step + (step / 2 if j % 2 else 0), j * step
            dist = math.hypot(x - pulse[0], y - pulse[1])
            if dist < clear - 4:
                continue
            rr = 1.8 + 3.0 * (0.5 + 0.5 * math.sin(dist / 15))
            d.append(f"M{f(x - rr)},{f(y)}a{f(rr)},{f(rr)} 0 1,0 {f(2 * rr)},0a{f(rr)},{f(rr)} 0 1,0 {f(-2 * rr)},0")
    a.path("".join(d), fill="#111", opacity=0.42)
    for q in range(3):
        a.circle(pulse[0], pulse[1], clear - q * 6, fill="none", stroke="#111", stroke_width=1.2, opacity=0.5)


def label(a, s):
    a.rect(16, S - 50, 18 + len(s) * 14.2, 32, fill=kit.PEARL, stroke="#111", stroke_width=1.5)
    a.text(24, S - 28, s, size=17, family="sans-serif", fill="#111", font_weight="bold", letter_spacing="2")


def T(a, x, y, r, color=kit.OS_GREEN, rings=3):
    kit.tree(a, x, y, r, color, rings)


def square(a, cx, cy, half, n, r, rot=0.0, color=kit.OS_GREEN):
    c, s = math.cos(rot), math.sin(rot)
    for side in range(4):
        for i in range(n):
            t = -half + 2 * half * i / n
            x, y = [(t, -half), (half, t), (-t, half), (-half, -t)][side]
            T(a, cx + x * c - y * s, cy + x * s + y * c, r, color)


def module(key, name, doc, clear=178):
    def deco(fn):
        @asset(G, f"glyph-{key}", group="backdrops", title=f"Glyph kit: {name}", w=S, h=S,
               row="Glyph kit: 8 modules, 6 detail saplings")
        def draw(a: Art):
            field(a, clear)
            fn(a)
            label(a, name.upper())
        draw.__doc__ = doc + (" Other-side green on pearl, every tree a set of concentric rings, in a lattice of exactly "
                              "spaced dots that swells in rings; nothing casts a shadow.")
        return draw
    return deco


@module("post", "post", "The post module: one large tree of five rings standing where a site's numbered cedar post stood.")
def g_post(a):
    T(a, 240, 240, 70, DARK, 7)
    for i in range(12):
        t = 2 * math.pi * i / 12
        T(a, 240 + 122 * math.cos(t), 240 + 122 * math.sin(t), 9)


@module("table", "table", "The table module: four trees at a camp table's corners and smaller ones along its two benches.")
def g_table(a):
    for x, y in ((150, 180), (330, 180), (150, 300), (330, 300)):
        T(a, x, y, 30, DARK, 5)
    for k in range(5):
        T(a, 168 + k * 36, 136, 10); T(a, 168 + k * 36, 344, 10)
    for k in range(4):
        T(a, 186 + k * 36, 240, 7, kit.OS_GREEN, 2)


@module("ring", "fire ring", "The fire ring module: a circle of twelve trees where the stones were, and nothing at all in the middle.")
def g_ring(a):
    for i in range(12):
        t = 2 * math.pi * i / 12
        T(a, 240 + 104 * math.cos(t), 240 + 104 * math.sin(t), 22, DARK, 4)
    for i in range(24):
        t = 2 * math.pi * (i + 0.5) / 24
        T(a, 240 + 150 * math.cos(t), 240 + 150 * math.sin(t), 7, kit.OS_GREEN, 2)


@module("pad", "tent pad", "The tent pad module: a true square of small trees, empty inside.")
def g_pad(a):
    square(a, 240, 240, 112, 7, 15)
    square(a, 240, 240, 76, 5, 6, color=DARK)


@module("persons", "persons", "The persons module: a tent pad with three trees standing inside it, one for each person who slept there.")
def g_persons(a):
    square(a, 240, 240, 118, 8, 12)
    for k in range(3):
        T(a, 240 + (k - 1) * 66, 240, 28, DARK, 5)


@module("path", "path", "The path module: stepping trees at one exact interval, alternately dark and light, the regular rhythm that is safe to walk.", clear=0)
def g_path(a):
    a.poly([(0, 330), (480, 90), (480, 210), (0, 450)], fill=kit.PEARL, opacity=0.96)
    for k in range(9):
        x, y = 30 + k * 54, 376 - k * 27
        a.circle(x, y, 22, fill="#111" if k % 2 == 0 else kit.PEARL, stroke="#111", stroke_width=3)
        a.circle(x, y, 9, fill=kit.PEARL if k % 2 == 0 else "#111")


@module("decoy", "decoy pad", "The decoy module: the same tent pad with its trees a half-step out of interval, which is how a wrong glyph gives itself away.")
def g_decoy(a):
    r = a.rng
    for side in range(4):
        for i in range(7):
            t = -112 + 224 * i / 7 + (16 if i % 2 else 0)
            x, y = [(t, -112), (112, t), (-t, 112), (-112, -t)][side]
            T(a, 240 + x, 240 + y, 15 if i % 2 == 0 else 11)
    for k in range(2):
        T(a, 204 + k * 96, 240 + k * 22, 28, DARK, 5)


@module("whole", "glyph", "A whole glyph assembled from the kit: post, table corners, fire ring and tent pad with two person trees, the way one lost site is written.", clear=206)
def g_whole(a):
    T(a, 120, 150, 26, DARK, 5)
    for x, y in ((170, 300), (250, 300), (170, 352), (250, 352)):
        T(a, x, y, 13, DARK)
    for i in range(10):
        t = 2 * math.pi * i / 10
        T(a, 340 + 40 * math.cos(t), 180 + 40 * math.sin(t), 9)
    square(a, 232, 96, 46, 5, 7)
    for k in range(2):
        T(a, 218 + k * 28, 96, 9, DARK)


def sapling(key, name, doc):
    def deco(fn):
        @asset(G, f"sapling-{key}", group="backdrops", title=f"Detail saplings: {name}", w=S, h=S,
               row="Glyph kit: 8 modules, 6 detail saplings")
        def draw(a: Art):
            field(a, 190)
            fn(a)
            label(a, name.upper())
        draw.__doc__ = doc + (" Saplings are the smallest trees in the kit, two rings each, set on the pearl ground among "
                              "the lattice; a written row in Tam's notebook is what tells the player to look for them.")
        return draw
    return deco


def sap(a, pts, r=7, color=DARK):
    for x, y in pts:
        kit.tree(a, x, y, r, color, 2)


@sapling("wheel", "wheel", "The wheel: two rings of saplings with spokes and a frame between them, the bicycle of site 17 written in trees.")
def s_wheel(a):
    for cx in (150, 330):
        sap(a, [(cx + 62 * math.cos(2 * math.pi * i / 14), 270 + 62 * math.sin(2 * math.pi * i / 14)) for i in range(14)])
        sap(a, [(cx, 270)], 10)
        sap(a, [(cx + 30 * math.cos(2 * math.pi * i / 4 + .6), 270 + 30 * math.sin(2 * math.pi * i / 4 + .6)) for i in range(4)], 4, kit.OS_GREEN)
    frame = [(150, 270), (210, 180), (300, 180), (240, 270)]
    for (x1, y1), (x2, y2) in zip(frame, frame[1:] + frame[:1]):
        sap(a, [(x1 + (x2 - x1) * t / 4, y1 + (y2 - y1) * t / 4) for t in range(1, 4)], 5, kit.OS_GREEN)
    sap(a, [(300, 180), (314, 150), (292, 138)], 6); sap(a, [(196, 160), (224, 160)], 6)


@sapling("kettle", "kettle", "The kettle: a round body of saplings with a spout and a hooped handle, site 5's blue enamel kettle written in trees.")
def s_kettle(a):
    sap(a, [(230 + 84 * math.cos(2 * math.pi * i / 18), 280 + 70 * math.sin(2 * math.pi * i / 18)) for i in range(18)])
    sap(a, [(230 + 46 * math.cos(2 * math.pi * i / 9), 284 + 36 * math.sin(2 * math.pi * i / 9)) for i in range(9)], 4, kit.OS_GREEN)
    sap(a, [(318, 256), (340, 236), (360, 214), (378, 196)], 8)
    sap(a, [(230 + 70 * math.cos(math.radians(t)), 214 + 84 * math.sin(math.radians(t))) for t in range(200, 345, 18)], 5)
    sap(a, [(230, 200)], 11)


@sapling("cedar", "tall cedar", "The tall cedar: one great tree of nine rings with saplings fallen in a line beside it, site 16 written in trees.")
def s_cedar(a):
    kit.tree(a, 210, 230, 96, DARK, 9)
    sap(a, [(322 + k * 14, 300 + k * 13) for k in range(6)], 6)
    sap(a, [(210 + 128 * math.cos(2 * math.pi * i / 10 + .3), 230 + 128 * math.sin(2 * math.pi * i / 10 + .3)) for i in range(7)], 5, kit.OS_GREEN)


@sapling("crooked-pad", "crooked pad", "The crooked pad: a tent pad's square of saplings turned a few degrees off the lattice, a tent pitched badly, written in trees.")
def s_crooked(a):
    square(a, 240, 240, 108, 7, 8, rot=0.3, color=DARK)
    square(a, 240, 240, 108, 7, 3, rot=0.0)
    sap(a, [(214, 236), (244, 246), (274, 256)], 12)


@sapling("owl-box", "owl box", "The owl box: a small box of saplings with a dark hole, high on a line of trunk trees, site 7 written in trees.")
def s_owl(a):
    sap(a, [(240, 100 + k * 34) for k in range(10)], 9)
    square(a, 240, 200, 56, 5, 7, color=DARK)
    a.circle(240, 196, 24, fill=kit.PEARL); a.circle(240, 196, 22, fill="#111"); a.circle(240, 196, 9, fill=kit.PEARL)
    sap(a, [(176, 132), (208, 116), (240, 104), (272, 116), (304, 132)], 6)


@sapling("pool", "shallow pool", "The shallow pool: three still rings of saplings, widening, with two stone trees at the edge, site 9 written in trees.")
def s_pool(a):
    for k, (rx, n) in enumerate(((40, 8), (86, 16), (132, 26))):
        sap(a, [(240 + rx * math.cos(2 * math.pi * i / n), 250 + rx * 0.62 * math.sin(2 * math.pi * i / n)) for i in range(n)],
            7 - k, DARK if k != 1 else kit.OS_GREEN)
    kit.tree(a, 132, 136, 26, DARK, 4); kit.tree(a, 336, 124, 20, DARK, 4)

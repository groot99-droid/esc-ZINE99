"""Cat's Cradle (1D, string figures): chalk and poster paint on the painted sky.

Sky Room's walls in flat, matte poster paint (sky blue, field green, a few lumpy white clouds), with
chalk drawn over them: dusty, broken white strokes. Clinical white light, no shadow. This is memory,
the only page outside the comic idiom. The children are only hands; their names are in chalk."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "cats-cradle"
CHALK = "#f7f7f2"
KIDS = (("reese", "Reese", "#f7f7f2"), ("cally", "Cally", "#f4e7a1"), ("carmy", "Carmy", "#f2c6c6"),
        ("rolan", "Rolan", "#f3c999"))
SKY2, FIELD2 = "#6f9bcb", "#6f9850"


def chalk(a, pts, color=CHALK, sw=6, closed=False, passes=2, **kw):
    """A chalk stroke: two or three slightly different wobbly passes, dusty and broken."""
    for k in range(passes):
        a.wobble(pts, amp=1.6, step=10, closed=closed, stroke=color, stroke_width=sw * (1 - .25 * k),
                 stroke_linecap="round", stroke_linejoin="round", opacity=0.85 - .25 * k,
                 stroke_dasharray=None if k == 0 else f"{a.rng.randint(14, 30)} {a.rng.randint(3, 8)}", **kw)


def poster_cloud(a, cx, cy, s):
    pts = []
    for k in range(14):
        t = 2 * math.pi * k / 14
        r = 1 + .18 * math.sin(3 * t) + a.rng.uniform(-.06, .06)
        pts.append((cx + 90 * s * r * math.cos(t), cy + 36 * s * r * math.sin(t)))
    a.path(a.smooth_d(pts, closed=True), fill="#f4f7fb")


@asset(G, "cats-cradle-sky-wall", group="backdrops", title="Cat's Cradle backdrop: Sky Room's painted wall",
       w=1280, h=720, row=kit.row(M, "Backdrop"))
def sky_wall(a: Art):
    """Sky Room's concrete wall painted with a blue sky and green fields in flat poster paint, brush marks
    showing in the blue, a few lumpy white clouds and a painted sun that does not shine; flat white light,
    a strip of bare concrete at the floor where the paint stops."""
    a.rect(0, 0, 1280, 720, fill=kit.SKY)
    rough = a.roughen(3, 0.05)
    for k in range(18):
        y = 20 + k * 26
        a.path(f"M{a.rng.randint(-40, 200)},{y} C400,{y + a.rng.randint(-8, 8)} 900,{y + a.rng.randint(-8, 8)} {a.rng.randint(1100, 1320)},{y}",
               fill="none", stroke=SKY2, stroke_width=a.rng.uniform(4, 10), opacity=0.35, filter=rough)
    a.circle(1080, 130, 60, fill="#f2dc8a", filter=rough)
    for cx, cy, s in ((240, 140, 1.2), (620, 90, 0.9), (860, 220, 1.0), (380, 300, 0.7)):
        poster_cloud(a, cx, cy, s)
    a.path("M0,470 C200,430 420,450 640,440 C860,430 1080,410 1280,450 L1280,650 L0,650Z", fill=kit.FIELD, filter=rough)
    a.path("M0,520 C300,490 700,520 1280,500 L1280,650 L0,650Z", fill=FIELD2, opacity=0.6, filter=rough)
    a.rect(0, 650, 1280, 70, fill="#c4cdcb")
    a.line(0, 650, 1280, 650, stroke="#8a9a99", stroke_width=3)
    a.rect(0, 0, 1280, 720, fill="#ffffff", opacity=0.08)


@asset(G, "cats-cradle-play-mat", group="backdrops", title="Cat's Cradle: the play mat (the centre of the page)",
       w=900, h=600, row=kit.row(M, "Backdrop"))
def play_mat(a: Art):
    """The Sky Room play mat seen from above, where the string figure is made: a worn square of flat
    poster-paint squares in faded field green and sky blue, chalk dust smudged across it."""
    cols = (kit.FIELD, kit.SKY, "#e9ecea", FIELD2)
    for r in range(4):
        for c in range(6):
            a.rect(c * 150, r * 150, 150, 150, fill=cols[(r + c) % 4], opacity=0.92)
    a.rect(0, 0, 900, 600, fill="none", stroke="#8a9a99", stroke_width=6)
    a.stipple(0, 0, 900, 600, n=500, r=(0.8, 2.4), fill="#ffffff", opacity=0.35)


def hand(a, cx, cy, s, rot, color, ghost=False):
    """A child's hand in chalk, palm and two raised fingers that hold the string."""
    ca, sa = math.cos(math.radians(rot)), math.sin(math.radians(rot))

    def t(x, y):
        return (cx + (x * ca - y * sa) * s, cy + (x * sa + y * ca) * s)
    palm = [t(-20, 12), t(-22, -10), t(-9, -22), t(11, -20), t(22, -4), t(18, 16), t(0, 22)]
    kw = dict(stroke_dasharray="3 9") if ghost else {}
    if ghost:
        a.wobble(palm, amp=1.2, step=8, closed=True, stroke=color, stroke_width=4, opacity=0.5, **kw)
        for fx in (-11, 9):
            a.wobble([t(fx, -20), t(fx * 1.2, -58)], amp=1, step=8, stroke=color, stroke_width=5, opacity=0.5,
                     stroke_linecap="round", **kw)
        return
    a.path(a.smooth_d(palm, closed=True), fill=color, opacity=0.25)
    chalk(a, palm, color, sw=5, closed=True)
    for fx in (-11, 9):
        chalk(a, [t(fx, -20), t(fx * 1.2, -58)], color, sw=9)
    chalk(a, [t(-22, 2), t(-40, -14)], color, sw=8, passes=1)     # thumb
    for fx in (16, 24):                                            # two fingers folded down
        chalk(a, [t(fx - 4, -16), t(fx + 2, -30), t(fx + 8, -24), t(fx + 6, -12)], color, sw=6, passes=1)


def hand_asset(key, name, color):
    def draw(a: Art):
        hand(a, 120, 150, 2.3, 0, color)
        a.circle(98, 14, 6, fill=color, opacity=0.6)
        a.circle(140, 14, 6, fill=color, opacity=0.6)
    draw.__doc__ = (f"{name}'s hand in chalk, palm up with two fingers raised to hold a crossing, drawn in "
                    f"{name}'s own chalk colour so the page can tell the four children apart by hand alone.")
    asset(G, f"cats-cradle-hand-{key}", group="pieces", title=f"Hand: {name}", w=240, h=240,
          row=kit.row(M, "Hands, one per child"))(draw)


for _k, _n, _c in KIDS:
    hand_asset(_k, _n, _c)


@asset(G, "cats-cradle-hand-ghost", group="pieces", title="Hand: blank chalk ghost (the leash)", w=240, h=240,
       row=kit.row(M, "Hands, one per child"))
def hand_ghost(a: Art):
    """A pair of fingers and a palm in faint dotted chalk with nothing filled in: the ghost hands of the
    leash figure, three of which cannot hold the string."""
    hand(a, 120, 150, 2.3, 0, CHALK, ghost=True)
    for k in range(5):
        a.circle(60 + k * 30, 220 - (k % 2) * 8, 2, fill=CHALK, opacity=0.4)


FIGS = (("cradle", "The Cradle", [(-1, -.3), (1, -.3), (1, .3), (-1, .3)], [((-1, -.3), (1, .3)), ((1, -.3), (-1, .3))]),
        ("soldiers-bed", "Soldier's Bed", [(-1, -.5), (1, -.5), (1, .5), (-1, .5)],
         [((-1, -.5), (0, 0)), ((1, -.5), (0, 0)), ((-1, .5), (0, 0)), ((1, .5), (0, 0)), ((-1, 0), (1, 0))]),
        ("candles", "Candles", [(-1, -.6), (-.4, -.6), (.4, -.6), (1, -.6), (1, .6), (-1, .6)],
         [((-.4, -.6), (-.4, .6)), ((.4, -.6), (.4, .6)), ((-1, 0), (1, 0))]),
        ("diamonds", "Diamonds", [(-1, 0), (-.5, -.6), (0, 0), (.5, -.6), (1, 0), (.5, .6), (0, 0), (-.5, .6)],
         [((-1, 0), (1, 0))]))


def figure_asset(i, key, name, outline, cross):
    def draw(a: Art):
        a.rect(0, 0, 360, 260, fill=kit.SKY)
        a.rect(0, 190, 360, 70, fill=kit.FIELD)
        a.rect(6, 6, 348, 248, fill="none", stroke=CHALK, stroke_width=3, opacity=0.6)
        cx, cy, s = 180, 112, 120
        pts = [(cx + x * s, cy + y * s * .9) for x, y in outline]
        chalk(a, pts, CHALK, sw=5, closed=True)
        for (x1, y1), (x2, y2) in cross:
            chalk(a, [(cx + x1 * s, cy + y1 * s * .9), (cx + x2 * s, cy + y2 * s * .9)], CHALK, sw=4)
        for x, y in outline:
            a.circle(cx + x * s, cy + y * s * .9, 6, fill=CHALK, opacity=0.8)
        kit.label(a, 180, 238, name.upper(), size=22, family="sans-serif", fill=CHALK, anchor="middle",
                  letter_spacing="3", font_weight="bold")
    draw.__doc__ = (f"Target string figure {i + 1}, {name}: the finished figure drawn in white chalk on a small "
                    f"painted-sky card, its name in chalk capitals underneath. Shown small at the top of the page.")
    asset(G, f"cats-cradle-figure-{key}", group="cards", title=f"Target figure: {name}", w=360, h=260,
          row=kit.row(M, "Target figures"))(draw)


for _i, _fg in enumerate(FIGS):
    figure_asset(_i, *_fg)


def name_asset(key, name, color):
    def draw(a: Art):
        chalk(a, [(10, 70), (230, 66)], color, sw=3, passes=1)
        kit.label(a, 120, 54, name, size=46, family="cursive", fill=color, anchor="middle", opacity=0.9)
        kit.label(a, 121, 55, name, size=46, family="cursive", fill="none", stroke=color, stroke_width=1,
                  anchor="middle", opacity=0.5, stroke_dasharray="6 4")
        for k in range(6):
            a.circle(30 + k * 36, 78 + (k % 2) * 3, 1.6, fill=color, opacity=0.5)
    draw.__doc__ = f"{name}'s name written in chalk in {name}'s colour, underlined, for the bottom edge of the page."
    asset(G, f"cats-cradle-name-{key}", group="documents", title=f"Chalk name: {name}", w=240, h=90,
          row=kit.row(M, "Chalk names along the bottom"))(draw)


for _k, _n, _c in KIDS:
    name_asset(_k, _n, _c)


@asset(G, "cats-cradle-gratitude", group="documents", title="Chalk caption: Gratitude.", w=480, h=140,
       row=kit.row(M, "The leash"))
def gratitude(a: Art):
    """The warm caption the leash figure gives every time a ghost hand fails: the single word Gratitude.
    in neat chalk on a strip of painted sky, too tidy, like a teacher's hand."""
    a.rect(0, 0, 480, 140, fill=kit.SKY)
    poster_cloud(a, 400, 30, 0.5)
    kit.label(a, 240, 92, "Gratitude.", size=58, family="serif", fill=CHALK, anchor="middle", font_style="italic")
    chalk(a, [(110, 112), (370, 110)], kit.GOLD, sw=3, passes=1)
    a.rect(4, 4, 472, 132, fill="none", stroke=CHALK, stroke_width=2, opacity=0.5)


@asset(G, "cats-cradle-speaker", group="pieces", title="The program's speaker on the painted wall", w=200, h=200,
       row=kit.row(M, "The leash"))
def speaker(a: Art):
    """A round speaker grille set into the painted sky, painted over in the same blue so it nearly
    disappears: the program listening. Concentric chalk rings show when it speaks."""
    a.circle(100, 100, 60, fill=SKY2)
    for r in range(8, 56, 8):
        a.circle(100, 100, r, fill="none", stroke=kit.SKY, stroke_width=3)
    for x in (52, 148):
        a.circle(x, 100, 4, fill="#5a7ea8")
    for r in (72, 86):
        a.wobble(kit.arc_pts(100, 100, r, -50, 50), amp=1, step=8, stroke=CHALK, stroke_width=3, opacity=0.6)

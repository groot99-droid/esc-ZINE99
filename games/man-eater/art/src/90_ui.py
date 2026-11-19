"""UI ornaments for every page: frost corners in four states, the breath line, the clip, punch holes, dividers."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, GREEN, SODIUM, STEEL, FROST, SNOW, BRUISE = (kit.INK, kit.CREAM, kit.GREEN, kit.SODIUM, kit.STEEL,
                                                         kit.FROST, kit.SNOW, kit.BRUISE)
ROW = "UI ornaments: frost corners (4 states), breath line, clip, punch holes, dividers"

STATES = ["a first feathering", "a hand's width", "half the corner", "the whole corner, needles crossing"]
for _i, _what in enumerate(STATES):
    def _mk(i=_i, what=_what):
        def fn(a: Art):
            lv = (i + 1) / 4
            r = 90 + 330 * lv
            g = a.radial([(0, SNOW, 0.85), (0.6, SNOW, 0.3 * lv + 0.1), (1, SNOW, 0)])
            a.circle(0, 0, r * 0.85, fill=g)
            kit.frost(a, 0, 0, 3, 87, r, n=5 + i * 2, color="#7f8c96", op=0.6, haze=False, sw=1.8, budget=200 + i * 120)
            kit.frost(a, 0, 0, 3, 87, r * 0.92, n=5 + i * 2, color=SNOW, op=0.95, haze=False, sw=1.1, budget=200 + i * 120)
            # rime along the two edges
            d = ""
            for k in range(int(r / 9)):
                t = k * 9 + a.rng.uniform(0, 5)
                L = (1 - t / r) * 26 * (0.4 + a.rng.random())
                d += f"M{f(t)},0l{f(a.rng.uniform(-3, 3))},{f(L)}M0,{f(t)}l{f(L)},{f(a.rng.uniform(-3, 3))}"
            a.path(d, stroke=SNOW, stroke_width=1.4, stroke_linecap="round", opacity=0.9)
            a.path(f"M0,0 H{f(r)} M0,0 V{f(r)}", stroke=SNOW, stroke_width=3, opacity=0.5)
        fn.__doc__ = (f"Frost corner, state {i + 1} of four ({what}): feathered ice crystals growing from the top left "
                      f"corner of a page over a pale haze, on a transparent ground; mirror it for the other corners.")
        return fn
    asset(G, f"frost-corner-{_i + 1}", group="ui", title=f"Frost corner, state {_i + 1}", w=440, h=440, row=ROW)(_mk())


@asset(G, "breath-line", group="ui", title="The breath line", w=900, h=140, row=ROW)
def breath(a: Art):
    """The breath line that shows warmth: a thin white line drawn left to right that begins as full round
    plumes of breath and thins, plume by plume, to a hair with frost needles on it."""
    pts = [(30 + i * 28, 78 + 8 * math.sin(i * 0.9) * (1 - i / 34)) for i in range(31)]
    a.path(a.smooth_d(pts), fill="none", stroke="#7f8c96", stroke_width=3.4, opacity=0.5, stroke_linecap="round")
    a.path(a.smooth_d(pts), fill="none", stroke=SNOW, stroke_width=2, stroke_linecap="round")
    soft = a.blur(3)
    a.open("g", filter=soft)
    for i in range(9):
        x = 60 + i * 92
        k = 1 - i / 9
        for j in range(4):
            a.circle(x + j * 13 * k, 70 - j * 11 * k, (9 + j * 6) * k + 1.5, fill=SNOW, opacity=(0.75 - j * 0.14) * (0.4 + 0.6 * k))
    a.close()
    d = ""
    for i in range(18):
        x = 520 + i * 20
        L = (i / 18) * 20
        d += f"M{x},80l{f(a.rng.uniform(-4, 4))},{f(-L)}M{x + 8},80l{f(a.rng.uniform(-4, 4))},{f(L * 0.8)}"
    a.path(d, stroke=SNOW, stroke_width=1.3, stroke_linecap="round", opacity=0.9)
    a.path("M26,58 v44 M874,66 v28", stroke="#7f8c96", stroke_width=2)


@asset(G, "clip", group="ui", title="The clipboard clip", w=600, h=220, row=ROW)
def clip(a: Art):
    """The spring clip from the top of the orderly's clipboard: pressed steel with a rolled lip, two rivets, a
    hanging hole, scratches, and the stencilled form number; it throws a long shadow down the page."""
    a.poly([(70, 150), (530, 150), (560, 214), (100, 214)], fill="#000", opacity=0.28, filter=a.blur(8))
    body = a.gradient([(0, "#c9cdd0"), (0.45, "#9aa0a4"), (1, "#6f7578")])
    a.rect(60, 40, 480, 112, rx=16, fill=body, stroke=INK, stroke_width=4)
    a.rect(60, 132, 480, 24, rx=8, fill="#5c6266", stroke=INK, stroke_width=4)
    a.rect(74, 50, 452, 10, rx=5, fill="#fff", opacity=0.4)
    a.rect(235, 20, 130, 56, rx=14, fill=body, stroke=INK, stroke_width=4)
    a.rect(270, 34, 60, 18, rx=9, fill="#2b2e30", stroke=INK, stroke_width=2)
    for x in (110, 490):
        a.circle(x, 96, 13, fill="#7b8185", stroke=INK, stroke_width=3)
        a.circle(x - 3, 93, 4, fill="#e3e6e8")
    kit.stencil(a, 300, 112, "7-F", 40, fill="#3c4144", anchor="middle")
    d = "".join(f"M{f(a.rng.uniform(80, 500))},{f(a.rng.uniform(64, 128))}l{f(a.rng.uniform(14, 50))},{f(a.rng.uniform(-5, 5))}"
                for _ in range(16))
    a.path(d, stroke="#e3e6e8", stroke_width=1, opacity=0.6)
    kit.frost(a, 540, 152, 190, 260, 80, n=4, haze=False, budget=80)


@asset(G, "punch-holes", group="ui", title="Punch holes", w=140, h=700, row=ROW)
def punch_holes(a: Art):
    """The left margin of a form: three punched holes down a strip of typing paper, one torn out to the edge
    and one mended with a gummed ring, the red margin rule beside them."""
    a.rect(0, 0, 140, 700, fill=kit.PAPER)
    cl = a.clip('<rect width="140" height="700"/>')
    kit.speckle(a, cl, 0, 0, 140, 700, color="#6f6750", strength=0.2)
    a.line(118, 0, 118, 700, stroke=FROST, stroke_width=1.5)
    a.path("".join(f"M0,{y}H140" for y in range(40, 700, 34)), stroke=FROST, stroke_width=0.8, opacity=0.5)
    for i, y in enumerate((110, 350, 590)):
        if i == 1:
            a.circle(56, y, 30, fill="#F6F2E6", stroke="#b9b29c", stroke_width=1.5)
            a.circle(56, y, 30, fill="none", stroke="#000", stroke_width=1, opacity=0.15)
        a.circle(56, y, 16, fill="#2b2e30")
        a.path(f"M40,{y}A16,16 0 0 1 72,{y}", fill="none", stroke="#000", stroke_width=3, opacity=0.6)
        if i == 2:
            a.poly([(0, y - 9), (44, y - 12), (44, y + 12), (0, y + 15)], fill="#2b2e30")
            a.wobble([(0, y - 9), (44, y - 12)], amp=2, step=6, stroke="#b9b29c", stroke_width=2)
            a.wobble([(0, y + 15), (44, y + 12)], amp=2, step=6, stroke="#b9b29c", stroke_width=2)
    kit.typed(a, 126, 670, "7-F", size=13, anchor="end")
    kit.frost(a, 0, 0, 5, 85, 110, n=4, color="#8f9aa3", op=0.8, budget=90)


W, H = 900, 90


@asset(G, "divider-typed", group="ui", title="Divider: typed rule with the empty 22:00 box", w=W, h=H, row=ROW)
def div_typed(a: Art):
    """A divider typed on the machine: a row of hyphens struck a little unevenly, broken in the middle by the
    time 22:00 and an empty ruled box."""
    for i in range(22):
        for x in (20 + i * 15, 566 + i * 15):
            a.text(x, 52 + a.rng.uniform(-1.5, 1.5), "-", size=26, family="monospace", fill=INK,
                   opacity=a.rng.uniform(0.6, 1.0))
    kit.typed(a, 362, 54, "22:00", size=24)
    a.rect(444, 30, 108, 34, fill="none", stroke=INK, stroke_width=2.2)
    kit.carbon(a, 100, 30, 700, 30, n=2, op=0.1)


@asset(G, "divider-stencil", group="ui", title="Divider: stencilled crate bar", w=W, h=H, row=ROW)
def div_stencil(a: Art):
    """A divider sprayed through a crate stencil: a heavy bar cut by bridges, an arrow at each end pointing
    inward, and the form number in the gap."""
    a.open("g", filter=a.roughen(2.5, 0.08))
    for x0, x1 in ((70, 380), (520, 830)):
        x = x0
        while x < x1:
            w = min(54, x1 - x)
            a.rect(x, 36, w - 8, 18, fill=INK)
            x += 54
    a.poly([(20, 45), (58, 24), (58, 66)], fill=INK)
    a.poly([(880, 45), (842, 24), (842, 66)], fill=INK)
    a.close()
    kit.stencil(a, 450, 60, "7-F", 44, anchor="middle")
    a.stipple(60, 56, 780, 16, n=90, r=(0.5, 1.6), fill=INK, opacity=0.5)


@asset(G, "divider-perforation", group="ui", title="Divider: perforation with frost", w=W, h=H, row=ROW)
def div_perf(a: Art):
    """A divider that is a tear-off line: a row of perforations across the page with a scissors mark at the
    left, the paper already started to tear at the right, and frost growing along it."""
    a.path("".join(f"M{60 + i * 16},45h8" for i in range(46)), stroke=INK, stroke_width=3, stroke_linecap="round")
    a.circle(34, 34, 9, fill="none", stroke=INK, stroke_width=2.5)
    a.circle(34, 58, 9, fill="none", stroke=INK, stroke_width=2.5)
    a.path("M40,40 L70,56 M40,52 L70,36", stroke=INK, stroke_width=2.5, stroke_linecap="round")
    a.wobble([(800, 45), (826, 40), (850, 50), (880, 42)], amp=3, step=6, stroke=INK, stroke_width=2)
    a.poly([(800, 45), (880, 36), (880, 52)], fill="#000", opacity=0.12)
    for x in (300, 470, 610):
        kit.frost(a, x, 45, 200, 340, 36, n=3, haze=False, color="#7f8c96", op=0.9, sw=1.4, budget=30)
        kit.frost(a, x, 45, 20, 160, 30, n=3, haze=False, color=SNOW, op=0.95, budget=30)

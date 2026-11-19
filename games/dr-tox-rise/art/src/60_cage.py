"""The Cage (1D, titration): comic colourist's flats.

A heavy, even comic line and flat unshaded colour filled to it: no gradients, no rendering, no texture.
Amber against green, never at equal weight: the green front is always the smaller mass on any piece
that carries both. The reagent is the invented A9, counted in drops; no real substance appears."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "cage"
LN = "#141414"
L = dict(stroke=LN, stroke_width=5, stroke_linejoin="round")
L2 = dict(stroke=LN, stroke_width=3, stroke_linejoin="round")
STEEL, STEEL2, GLASS = "#b8c1c0", "#8a9a99", "#dce8e6"
WALL, LAMP = "#cfd6d4", "#2a2116"


def flask_d(cx, by, w, h):
    """An Erlenmeyer flask: neck, shoulders, wide flat base. Base centre at (cx, by)."""
    nw = w * .24
    return kit.P([(cx - nw / 2, by - h), (cx + nw / 2, by - h), (cx + nw / 2, by - h * .62), (cx + w / 2, by - h * .08),
                  (cx + w / 2 - 8, by), (cx - w / 2 + 8, by), (cx - w / 2, by - h * .08), (cx - nw / 2, by - h * .62)], True)


@asset(G, "cage-bench-2217", group="backdrops", title="The Cage backdrop: the bench in the hospital room (2217)",
       w=1280, h=720, row=kit.row(M, "Backdrops, one per place"))
def bench_2217(a: Art):
    """The bench a fifteen-year-old built, in flat colourist's fills: pale clinical wall, two IV poles,
    steel trays clamped between them, a strip light above, clear tubing in a loose loop; the middle of
    the bench is left clear for the flask and the dropper."""
    a.rect(0, 0, 1280, 720, fill=WALL)
    a.rect(0, 0, 1280, 60, fill="#e9ecea", **L)
    a.rect(440, 60, 400, 18, fill="#ffffff", **L2)
    a.rect(0, 560, 1280, 160, fill="#a9b4b2", **L)
    for x in (120, 1160):
        a.rect(x - 8, 120, 16, 440, fill=STEEL2, **L2)
        a.rect(x - 60, 116, 120, 12, fill=STEEL2, **L2)
    for y in (300, 430):
        a.rect(100, y, 1080, 22, fill=STEEL, **L)
        for x in (100, 1158):
            a.rect(x, y - 8, 22, 38, fill=STEEL2, **L2)
    a.rect(60, 540, 1160, 26, fill=STEEL, **L)
    a.path("M1160,200 C1250,260 1240,420 1180,480", fill="none", stroke="#ffffff", stroke_width=10)
    a.path("M1160,200 C1250,260 1240,420 1180,480", fill="none", stroke=LN, stroke_width=2)
    for x in (180, 260, 960, 1040):
        a.rect(x, 268, 50, 32, fill=STEEL2, **L2)


@asset(G, "cage-lab", group="backdrops", title="The Cage backdrop: his own lab in Snakehead", w=1280, h=720,
       row=kit.row(M, "Backdrops, one per place"))
def lab(a: Art):
    """His own lab under the amber work lamp, in flats: near-black walls, one hard cone of flat amber light
    from a hanging lamp onto the bench, and the shielded locker standing open at the right."""
    a.rect(0, 0, 1280, 720, fill="#0f0d0b")
    a.poly([(560, 110), (720, 110), (1020, 560), (260, 560)], fill="#3a2a12")
    a.poly([(600, 110), (680, 110), (860, 560), (420, 560)], fill="#5a4218")
    a.path("M590,110 L690,110 L670,70 L610,70Z", fill="#2a2a2a", **L)
    a.line(640, 0, 640, 70, stroke="#2a2a2a", stroke_width=8)
    a.rect(612, 104, 56, 10, fill=kit.GOLD, **L2)
    a.rect(0, 560, 1280, 160, fill="#1c1813", **L)
    a.rect(160, 540, 960, 26, fill="#4a3e2c", **L)
    a.rect(1060, 200, 180, 340, fill="#2b3536", **L)
    a.rect(1076, 216, 148, 308, fill=kit.AMBER, **L2)
    for y in (300, 400):
        a.rect(1076, y, 148, 10, fill="#2b3536")
    for k in range(4):
        a.path(kit.vial_d(1100 + k * 34, 280, 16, 40), fill=kit.GOLD, **L2)


@asset(G, "cage-flask", group="pieces", title="Flask (standard)", w=320, h=400, row=kit.row(M, "Apparatus"))
def flask(a: Art):
    """The titration flask, empty, in flat pale glass tint inside a heavy line, with three printed
    graduation marks on the side; the green front and the amber band are filled into it at run time."""
    a.path(flask_d(160, 386, 280, 360), fill=GLASS, **L)
    a.rect(132, 20, 56, 14, fill=GLASS, **L2)
    for k, y in enumerate((300, 250, 200)):
        a.line(70 + k * 12, y, 110 + k * 12, y, stroke=LN, stroke_width=3)
    a.path("M200,90 L204,150", fill="none", stroke="#ffffff", stroke_width=6)


@asset(G, "cage-flask-large", group="pieces", title="Flask (large, for a batch to take outside)", w=420, h=460,
       row=kit.row(M, "Apparatus"))
def flask_large(a: Art):
    """The larger flask of the second batch, wider and taller, with a clamp ring round the neck and four
    graduation marks."""
    a.path(flask_d(210, 446, 380, 420), fill=GLASS, **L)
    a.rect(170, 16, 80, 16, fill=GLASS, **L2)
    a.rect(150, 70, 120, 20, fill=STEEL2, **L2)
    for k, y in enumerate((380, 330, 280, 230)):
        a.line(80 + k * 14, y, 130 + k * 14, y, stroke=LN, stroke_width=3)


@asset(G, "cage-dropper", group="pieces", title="Dropper on its stand", w=240, h=520, row=kit.row(M, "Apparatus"))
def dropper(a: Art):
    """The dropper on a steel ring stand: a burette-like tube of flat amber A9 with a black stopcock and a
    fine tip, clamped to an upright rod on a heavy base."""
    a.rect(20, 470, 200, 36, rx=6, fill=STEEL2, **L)
    a.rect(40, 30, 16, 450, fill=STEEL, **L2)
    a.rect(40, 120, 110, 16, fill=STEEL2, **L2)
    a.rect(120, 40, 44, 300, rx=10, fill=GLASS, **L)
    a.rect(126, 70, 32, 262, rx=6, fill=kit.AMBER)
    for y in range(90, 330, 30):
        a.line(126, y, 140, y, stroke=LN, stroke_width=2)
    a.rect(116, 340, 52, 24, rx=4, fill=LN)
    a.rect(164, 344, 34, 14, rx=3, fill=LN)
    a.path("M134,364 L150,364 L144,420 L140,420Z", fill=GLASS, **L2)
    kit.label(a, 142, 30, "A9", size=26, anchor="middle", fill=LN, font_weight="bold")


@asset(G, "cage-drop", group="pieces", title="A drop of A9", w=40, h=56, row=kit.row(M, "Apparatus"))
def drop(a: Art):
    """One falling drop of A9: a flat amber teardrop in a heavy line, with one white highlight stroke."""
    a.path("M20,4 C24,18 36,28 36,38 C36,48 28,54 20,54 C12,54 4,48 4,38 C4,28 16,18 20,4Z", fill=kit.AMBER, **L2)
    a.path("M12,36 C12,30 14,28 16,26", fill="none", stroke="#ffffff", stroke_width=3, stroke_linecap="round")
    a.line(20, 0, 20, 2, stroke=LN, stroke_width=1)
    a.circle(26, 44, 2, fill=kit.GOLD)
    a.circle(14, 46, 1.5, fill=kit.GOLD)


@asset(G, "cage-cap", group="pieces", title="Flask cap (cap the batch)", w=120, h=90, row=kit.row(M, "Apparatus"))
def cap(a: Art):
    """The cap that stops the drip: a squat flat-grey stopper with a lead ring, drawn ready to press home."""
    a.path("M30,40 L90,40 L82,80 L38,80Z", fill="#5e6b6c", **L)
    a.rect(16, 18, 88, 24, rx=6, fill="#3a4243", **L)
    a.line(30, 30, 90, 30, stroke=kit.TEAL3, stroke_width=3)
    a.line(46, 52, 74, 52, stroke=LN, stroke_width=2)
    a.line(48, 64, 72, 64, stroke=LN, stroke_width=2)


@asset(G, "cage-shield-plate", group="pieces", title="Lead shield plate", w=140, h=320, row=kit.row(M, "Apparatus"))
def shield_plate(a: Art):
    """A lead shield plate to drag beside the flask: a tall flat slab in dull grey with a handle cut-out
    and four bolt heads. It slows the front on its side."""
    a.rect(10, 10, 120, 300, rx=8, fill="#6e7a79", **L)
    a.rect(44, 30, 52, 20, rx=10, fill="#2b3536", **L2)
    for x, y in ((26, 80), (114, 80), (26, 290), (114, 290)):
        a.circle(x, y, 6, fill=STEEL, **L2)
    kit.label(a, 70, 200, "Pb", size=34, anchor="middle", fill="#3a4243", font_weight="bold")


@asset(G, "cage-side-bar", group="pieces", title="Side bar: LEAKY, ENDPOINT, HOT", w=180, h=560, row=kit.row(M, "Instrument"))
def side_bar(a: Art):
    """The instrument's side bar in flats: a tall column split into three bands. LEAKY at the top in pale
    teal, ENDPOINT in the middle as a narrow amber window, HOT at the bottom in a small green band,
    smaller than the amber. Lettered in black capitals."""
    a.rect(20, 20, 140, 520, rx=10, fill="#e9ecea", **L)
    a.rect(20, 20, 140, 240, rx=10, fill="#a9bdbc", **L2)
    a.rect(20, 260, 140, 110, fill=kit.AMBER, **L)
    a.rect(20, 370, 140, 64, fill=kit.GREEN, **L2)
    for y, t, c in ((150, "LEAKY", LN), (326, "ENDPOINT", LN), (411, "HOT", LN)):
        kit.label(a, 90, y, t, size=22 if len(t) < 6 else 19, anchor="middle", fill=c, font_weight="bold",
                  letter_spacing="2", fit=116 if len(t) > 6 else None)
    for y in range(40, 540, 20):
        a.line(150, y, 160, y, stroke=LN, stroke_width=2)


@asset(G, "cage-counter", group="pieces", title="Drop counter (frame)", w=280, h=110, row=kit.row(M, "Instrument"))
def counter(a: Art):
    """The drop counter's frame, top left of the page: a flat cream panel with DROPS lettered small and a
    dark window for the number, and a tiny amber drop beside it."""
    a.rect(6, 6, 268, 98, rx=10, fill="#f3eedf", **L)
    kit.label(a, 26, 40, "DROPS", size=20, fill=LN, font_weight="bold", letter_spacing="3")
    a.rect(26, 52, 160, 40, rx=4, fill="#1c1c1c", **L2)
    for k in range(3):
        a.rect(36 + k * 50, 60, 40, 24, rx=2, fill="#2e2e2e")
    a.path("M226,30 C230,44 246,54 246,66 C246,78 236,84 226,84 C216,84 206,78 206,66 C206,54 222,44 226,30Z",
           fill=kit.AMBER, **L2)


def result(key, name, doses, desc, band):
    def draw(a: Art):
        a.rect(0, 0, 400, 560, fill="#f3eedf")
        a.rect(10, 10, 380, 540, rx=14, fill="#f3eedf", **L)
        a.path(kit.vial_d(200, 250, 120, 300), fill=GLASS, **L)
        lv = {"steady": 0.78, "leaky": 0.55, "hot": 0.9}[key]
        top = 400 - 260 * lv
        a.path(kit.vial_d(200, 250, 120, 300), fill=kit.AMBER, clip_path=a.clip(f'<rect x="0" y="{f(top)}" width="400" height="560"/>'))
        if key == "hot":
            a.rect(140, top, 120, 26, fill=kit.GREEN, clip_path=a.clip(kit_path_clip(a)))
        if key == "leaky":
            a.rect(150, top - 6, 100, 10, fill=kit.TEAL2)
        a.path(kit.vial_d(200, 250, 120, 300), fill="none", **L)
        a.rect(30, 432, 340, 3, fill=LN)
        kit.label(a, 200, 476, name, size=44, anchor="middle", fill=LN, font_weight="bold", letter_spacing="4")
        kit.label(a, 200, 520, f"{doses} DOSES", size=24, anchor="middle", fill=band, font_weight="bold", letter_spacing="3")
    draw.__doc__ = desc
    asset(G, f"cage-result-{key}", group="cards", title=f"Batch result: {name.title()} ({doses} doses)", w=400, h=560,
          row=kit.row(M, "Result cards"))(draw)


def kit_path_clip(a):
    return '<path d="' + kit.vial_d(200, 250, 120, 300) + '"/>'


result("steady", "STEADY", 4, "The result card for a batch capped on the endpoint: a vial filled flat amber to "
       "its shoulder, STEADY lettered under it and 4 DOSES in amber.", "#8a5a10")
result("leaky", "LEAKY", 4, "The result card for a batch capped short of the endpoint: the vial lower, a thin "
       "gray-teal line floating on the amber, LEAKY and 4 DOSES. Pulse's floor rises next chapter.", "#5E7375")
result("hot", "HOT", 3, "The result card for a batch run past the endpoint: the vial full, a thin band of green "
       "riding the top of the amber, never as much green as amber; HOT and 3 DOSES.", "#3f7a28")


@asset(G, "cage-syringe", group="pieces", title="The lead-shielded syringe", w=520, h=120, row=kit.row(M, "The dose"))
def syringe(a: Art):
    """The lead-shielded syringe in flats: a heavy grey shield over the barrel with a window showing the
    amber dose, a plunger and a fine needle. The bible's first signature image's one object."""
    kit.syringe(a, 110, 60, 400, body="#5e6b6c", line=LN, sw=4)
    for k in range(3):
        a.line(190 + k * 40, 44, 190 + k * 40, 50, stroke=LN, stroke_width=2)

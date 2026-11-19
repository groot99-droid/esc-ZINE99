"""Barrier escort (2D, scroll): Franco-Belgian ligne claire.

One even outline everywhere (3 px, near-black), flat colour fills, no hatching, no gradients, no cast
shadow: HOPE's world as it wants to be seen. Hard-light walls are clean pale-gold bars. The penned
people are people, each with a white name tag; nothing here scores them. Three parallax layers for the
lower-ring corridor (far opaque; mid and near transparent)."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "barrier-escort"
LN = "#1b1b1b"
SW = 3
L = dict(stroke=LN, stroke_width=SW, stroke_linejoin="round")
DECK, PILLAR, FLOOR, WALLC = "#9fb0ae", "#b9c6c4", "#8c9897", "#c9d3d1"
HARD, HARD2 = "#f6e2a8", "#fff6dc"
PW, PH = 1920, 540
CLOTH = ("#7d8f7a", "#a46a4a", "#5e6f8a", "#8a7a5e", "#9a5a5a", "#6a8a8a")


@asset(G, "barrier-escort-far", group="backdrops", title="Barrier escort: lower ring (far layer)", w=PW, h=PH,
       row=kit.row(M, "Parallax backdrops: the lower-ring corridor, three layers"))
def far(a: Art):
    """The lower ring's far layer in clear line: the concrete deck overhead, and through the gap below it
    the distant glass towers of the city in flat pale teal, one of them lit warm at the top."""
    a.rect(0, 0, PW, PH, fill="#dfe6e4")
    for k, x in enumerate(range(-40, PW, 170)):
        h = 160 + (k * 53) % 140
        a.rect(x, 330 - h, 110, h + 40, fill="#b7c7c6" if k % 3 else "#a9bbba", **L)
        for y in range(330 - h + 20, 350, 34):
            a.line(x + 14, y, x + 96, y, stroke=LN, stroke_width=1.5)
        if k == 6:
            a.rect(x + 20, 330 - h - 40, 70, 40, fill=kit.GOLD, **L)
    a.rect(0, 0, PW, 150, fill=DECK, **L)
    for x in range(0, PW, 240):
        a.line(x, 0, x, 150, stroke=LN, stroke_width=SW)
    a.rect(0, 370, PW, 170, fill=FLOOR, **L)


@asset(G, "barrier-escort-mid", group="backdrops", title="Barrier escort: lower ring (mid layer)", w=PW, h=PH,
       row=kit.row(M, "Parallax backdrops: the lower-ring corridor, three layers"))
def mid(a: Art):
    """The corridor's mid layer, transparent behind: square concrete pillars, shopfronts with plastic
    sheeting stapled over them, water drums and a hand-lettered sign, all in even outline and flat colour."""
    for i, x in enumerate(range(0, PW, 320)):
        a.rect(x + 20, 150, 50, 290, fill=PILLAR, **L)
        a.rect(x + 90, 220, 210, 200, fill=WALLC, **L)
        a.rect(x + 104, 236, 182, 150, fill="#e9efee", **L)
        a.path(f"M{x + 104},236 L{x + 150},386 M{x + 196},236 L{x + 240},386", fill="none", stroke=LN, stroke_width=1.5)
        a.rect(x + 104, 236, 182, 14, fill="#d9e2e0", **L)
        for k in range(2):
            dx = x + 130 + k * 70
            a.rect(dx, 400, 46, 40, rx=6, fill=CLOTH[(i + k) % len(CLOTH)], **L)
            a.line(dx, 414, dx + 46, 414, stroke=LN, stroke_width=1.5)


@asset(G, "barrier-escort-near", group="backdrops", title="Barrier escort: lower ring (near layer)", w=PW, h=PH,
       row=kit.row(M, "Parallax backdrops: the lower-ring corridor, three layers"))
def near(a: Art):
    """The near layer, transparent behind: a foreground guard rail and a run of conduit along the bottom,
    with a pillar edge every so often, drawn in the same even line."""
    a.rect(0, 490, PW, 18, fill="#7d8988", **L)
    for x in range(0, PW, 120):
        a.rect(x + 10, 440, 10, 100, fill="#7d8988", **L)
    a.rect(0, 440, PW, 10, fill="#7d8988", **L)
    for x in range(400, PW, 900):
        a.rect(x, 0, 80, PH, fill=PILLAR, **L)
        a.line(x + 20, 0, x + 20, PH, stroke=LN, stroke_width=1.5)


# ---- figures -----------------------------------------------------------------------------------
FW, FH = 200, 320


def ground_line(a, x, w=60):
    a.line(x - w, FH - 10, x + w, FH - 10, stroke=LN, stroke_width=SW, stroke_linecap="round")


def aegis_body(a, x, arms_out=False):
    a.path(kit.figure_d(x, FH - 10, 1.85, stride=12), fill="#f4ead2", **L)
    a.path(kit.P([(x - 26, 82), (x + 26, 82), (x + 22, 110), (x - 22, 110)], True), fill=kit.AMBER, **L)
    if arms_out:
        for s in (-1, 1):
            a.path(kit.P([(x + s * 24, 80), (x + s * 96, 64), (x + s * 98, 76), (x + s * 26, 96)], True), fill="#f4ead2", **L)
            a.circle(x + s * 92, 70, 7, fill=kit.GOLD, **L)
    for s in (-1, 1):
        a.circle(x + s * 30, 170, 6, fill=kit.GOLD, **L)        # the faint light at the wrists


@asset(G, "barrier-escort-aegis", group="figures", title="Aegis running", w=FW, h=FH, row=kit.row(M, "Aegis and the other hero"))
def aegis(a: Art):
    """Aegis mid-stride in clear line: an upright figure in pale cream with an amber chest band and a
    small gold point of light at each wrist, the bible's “amber-lit” and no more. No face; his design
    system is not built yet."""
    ground_line(a, 100)
    for k in range(3):
        a.line(14, 110 + k * 40, 50, 110 + k * 40, stroke=LN, stroke_width=2, stroke_linecap="round")
    aegis_body(a, 110)


@asset(G, "barrier-escort-aegis-absorb", group="figures", title="Aegis absorbing a canister cloud", w=FW, h=FH,
       row=kit.row(M, "Aegis and the other hero"))
def aegis_absorb(a: Art):
    """Aegis standing still with both arms out inside a flat pale-green-grey cloud outline, drawing the
    toxin in; small round puffs travel toward his wrists."""
    a.path("M20,250 C0,180 30,110 80,120 C100,60 160,70 170,120 C210,130 210,240 180,262Z", fill="#cfd8c8", **L)
    aegis_body(a, 100, arms_out=True)
    for x, y in ((30, 150), (170, 160), (40, 220), (160, 230)):
        a.circle(x, y, 8, fill="#e3e9dc", **L)
    ground_line(a, 100)


@asset(G, "barrier-escort-other-hero", group="figures", title="The other hero (a line of motion)", w=FW, h=FH,
       row=kit.row(M, "Aegis and the other hero"))
def other_hero(a: Art):
    """The other hero as the page shows her: a dark slate silhouette leaning into an unhurried stride,
    a long sweep of motion lines behind her that the player cannot steer. She never needs a wall."""
    for k in range(4):
        a.path(f"M0,{100 + k * 50} C40,{96 + k * 50} 70,{94 + k * 50} 100,{100 + k * 50}", fill="none", stroke=LN,
               stroke_width=2, stroke_linecap="round")
    a.path(kit.person_d(130, FH - 10, 1.85, broad=0.95, lean=12), fill="#3c4a52", **L)
    ground_line(a, 130)


def person(key, title, doc, color, scale=1.85, broad=1.0, extra=None, back=False):
    def draw(a: Art):
        ground_line(a, 100, 50)
        a.path(kit.person_d(100, FH - 10, scale, broad=broad), fill=color, **L)
        if back:
            a.line(100, FH - 10 - 150 * scale + 34 * scale, 100, FH - 10 - 60 * scale, stroke=LN, stroke_width=1.5)
        if extra:
            extra(a)
    draw.__doc__ = doc
    asset(G, f"barrier-escort-{key}", group="figures", title=title, w=FW, h=FH,
          row=kit.row(M, "People in the corridor"))(draw)


def _drum(a):
    a.rect(120, 190, 54, 70, rx=8, fill="#5e6f8a", **L)
    a.line(120, 210, 174, 210, stroke=LN, stroke_width=1.5)
    a.line(120, 240, 174, 240, stroke=LN, stroke_width=1.5)


def _bundle(a):
    a.rect(60, 160, 40, 34, fill="#e9efee", **L)
    a.line(60, 177, 100, 177, stroke=LN, stroke_width=1.5)
    a.line(80, 160, 80, 194, stroke=LN, stroke_width=1.5)


def _child(a):
    for x in (92, 108):
        a.rect(x - 6, FH - 16, 12, 6, rx=2, fill="#2b3536", **L)


person("insurgent", "Insurgent with a water drum", "An Insurgent in clear line, a person in a muted green coat carrying "
       "a blue water drum: someone the plague left behind, holding the corridor with what the towers never took.",
       CLOTH[0], broad=1.15, extra=_drum)
person("bystander", "Bystander with a bundle", "A bystander in a rust-red coat holding a small wrapped bundle against "
       "the chest, caught in the corridor when the transport came.", CLOTH[1], extra=_bundle)
person("child", "A child, seen from behind", "A child seen from behind and small in the frame, in a blue coat with the "
       "seam of the hood drawn down the back: present in the corridor, never shown from the front.", CLOTH[2],
       scale=1.0, back=True, extra=_child)


@asset(G, "barrier-escort-crew", group="figures", title="Barricade crew", w=320, h=FH, row=kit.row(M, "People in the corridor"))
def crew(a: Art):
    """Two of a barricade crew lifting a sheet of scrap between them, in flat ochre and slate coats: the
    people who rebuild ahead of the transport unless a wall stops them."""
    a.line(20, FH - 10, 300, FH - 10, stroke=LN, stroke_width=SW)
    a.path(kit.person_d(90, FH - 10, 1.7, broad=1.1, lean=6), fill=CLOTH[3], **L)
    a.path(kit.person_d(230, FH - 10, 1.7, broad=1.1, lean=-6), fill=CLOTH[5], **L)
    a.path(kit.P([(70, 130), (250, 110), (256, 150), (76, 170)], True), fill="#b0a48a", **L)
    a.line(150, 120, 156, 160, stroke=LN, stroke_width=1.5)


# ---- pieces ------------------------------------------------------------------------------------
@asset(G, "barrier-escort-transport", group="pieces", title="The transport", w=640, h=300, row=kit.row(M, "The escort"))
def transport(a: Art):
    """The transport the escort guards, side-on in clear line: a flat-nosed slate-grey truck with a boxed
    cargo bed, round wheels with plain hubs, and RCC stamped small on the bed's corner plate."""
    a.rect(20, 60, 420, 170, rx=6, fill="#7f9192", **L)
    for x in range(60, 440, 70):
        a.line(x, 60, x, 230, stroke=LN, stroke_width=1.5)
    a.path(kit.P([(440, 110), (560, 110), (610, 170), (610, 230), (440, 230)], True), fill="#9fb0ae", **L)
    a.path(kit.P([(460, 124), (548, 124), (584, 168), (460, 168)], True), fill="#dfe6e4", **L)
    a.rect(10, 226, 610, 22, fill="#5e6b6c", **L)
    for x in (110, 330, 520):
        a.circle(x, 256, 36, fill="#2b3536", **L)
        a.circle(x, 256, 12, fill="#9fb0ae", **L)
    kit.plate(a, 30, 190, 90, 30, "RCC", fill="#c4cdcb", ink=LN, sw=2)


@asset(G, "barrier-escort-wall", group="pieces", title="Hard-light wall (one bar)", w=60, h=420, row=kit.row(M, "Aegis's walls"))
def wall(a: Art):
    """One hard-light wall as a clean upright bar: pale gold with a bright inner core and an even outline,
    no glow, no shading. Stretched along the line the player drags."""
    a.rect(6, 4, 48, 412, rx=6, fill=HARD, **L)
    a.rect(22, 16, 16, 388, rx=4, fill=HARD2)
    for y in (60, 210, 360):
        a.line(14, y, 46, y, stroke=LN, stroke_width=1.5)


@asset(G, "barrier-escort-wall-cap", group="pieces", title="Hard-light wall end cap", w=60, h=60, row=kit.row(M, "Aegis's walls"))
def wall_cap(a: Art):
    """The rounded end of a hard-light bar, where a drawn wall begins or ends."""
    a.circle(30, 30, 24, fill=HARD, **L)
    a.circle(30, 30, 10, fill=HARD2, **L)
    a.line(30, 6, 30, 14, stroke=LN, stroke_width=1.5)
    a.line(30, 46, 30, 54, stroke=LN, stroke_width=1.5)
    a.line(6, 30, 14, 30, stroke=LN, stroke_width=1.5)
    a.line(46, 30, 54, 30, stroke=LN, stroke_width=1.5)


@asset(G, "barrier-escort-barricade", group="pieces", title="Barricade", w=360, h=220, row=kit.row(M, "The escort"))
def barricade(a: Art):
    """A barricade across the corridor: an overturned cart, two crates and a sheet of corrugated scrap,
    each a flat colour inside the same even line. The transport stops at a standing one."""
    a.path(kit.P([(20, 210), (40, 120), (180, 100), (200, 210)], True), fill="#8a7a5e", **L)
    for k in range(5):
        a.line(50 + k * 30, 210, 60 + k * 26, 114, stroke=LN, stroke_width=1.5)
    a.rect(190, 130, 80, 80, fill="#b0a48a", **L)
    a.rect(260, 90, 80, 120, fill="#a46a4a", **L)
    a.line(260, 150, 340, 150, stroke=LN, stroke_width=1.5)
    a.circle(70, 206, 14, fill="#2b3536", **L)


@asset(G, "barrier-escort-canister", group="pieces", title="Toxin canister", w=100, h=160, row=kit.row(M, "Load"))
def canister(a: Art):
    """A canister lobbed into the corridor: a squat grey cylinder with a hazard band and a valve cap."""
    a.rect(14, 30, 72, 120, rx=12, fill="#8a9a99", **L)
    a.rect(14, 70, 72, 26, fill="#e3c75a", **L)
    for x in (26, 46, 66):
        a.line(x, 70, x + 10, 96, stroke=LN, stroke_width=2)
    a.rect(38, 10, 24, 20, fill="#5e6b6c", **L)


@asset(G, "barrier-escort-cloud", group="pieces", title="Canister cloud (absorb for Load)", w=300, h=200, row=kit.row(M, "Load"))
def cloud(a: Art):
    """The cloud a canister leaves: a flat, lumpy, pale grey-green shape in an even outline with a few
    rounder puffs inside it. Standing in it gives Aegis Load."""
    a.path("M30,170 C0,120 30,70 80,80 C100,20 190,20 210,70 C270,60 300,130 260,170Z", fill="#cfd8c8", **L)
    for x, y, r in ((90, 120, 22), (160, 100, 28), (220, 140, 18), (130, 150, 16)):
        a.circle(x, y, r, fill="#e3e9dc", **L)


@asset(G, "barrier-escort-debris", group="pieces", title="Thrown debris", w=120, h=100, row=kit.row(M, "The escort"))
def debris(a: Art):
    """A chunk of broken concrete thrown from a barricade, flat grey with two crack lines and a speed line."""
    a.path(kit.P([(20, 60), (40, 22), (90, 18), (108, 56), (80, 86), (34, 84)], True), fill="#b9c6c4", **L)
    a.path("M50,30 L60,56 L48,76 M86,30 L72,52", fill="none", stroke=LN, stroke_width=1.5)
    for y in (40, 56, 70):
        a.line(0, y, 16, y + 4, stroke=LN, stroke_width=2, stroke_linecap="round")


@asset(G, "barrier-escort-emitter", group="pieces", title="Barrier emitter stamped RCC", w=200, h=240,
       row=kit.row(M, "Aegis's walls"))
def emitter(a: Art):
    """A barrier emitter bolted to the floor, the plate on it stamped RCC: the Exception in the
    Terminology Rule, where the State's signage still says what HOPE will not. Nell's hand goes here."""
    a.rect(40, 120, 120, 110, fill="#7f9192", **L)
    a.path(kit.P([(60, 120), (80, 40), (120, 40), (140, 120)], True), fill="#9fb0ae", **L)
    a.rect(84, 20, 32, 24, rx=4, fill=HARD, **L)
    kit.plate(a, 56, 150, 88, 50, "RCC", fill="#c4cdcb", ink=LN, sw=2)


@asset(G, "barrier-escort-name-tag", group="pieces", title="Name tag (blank, for a penned person)", w=180, h=60,
       row=kit.row(M, "The penned"))
def name_tag(a: Art):
    """The white tag that appears on a wall bar when it pens a person, blank for the name the page sets in
    it: a small rounded card hung from the bar by a short line. Never a score."""
    a.line(90, 0, 90, 12, stroke=LN, stroke_width=2)
    a.rect(6, 12, 168, 42, rx=8, fill="#ffffff", **L)
    a.circle(90, 12, 4, fill=LN)
    a.line(20, 44, 160, 44, stroke="#c4cdcb", stroke_width=1)
    a.circle(20, 24, 4, fill="none", stroke=LN, stroke_width=1.5)


@asset(G, "barrier-escort-load-gauge", group="pieces", title="Load gauge (frame)", w=320, h=60, row=kit.row(M, "HUD"))
def load_gauge(a: Art):
    """The Load gauge frame in clear line: a long rounded slot with ten even ticks and LOAD lettered at the
    left; the pale gold fill is drawn into it at run time."""
    a.rect(4, 14, 312, 34, rx=17, fill="#f4f1e6", **L)
    for k in range(1, 10):
        a.line(70 + k * 24, 18, 70 + k * 24, 26, stroke=LN, stroke_width=1.5)
    kit.label(a, 20, 38, "LOAD", size=16, fill=LN, font_weight="bold", letter_spacing="2")


@asset(G, "barrier-escort-distance-bar", group="pieces", title="Transport distance bar (frame)", w=640, h=60,
       row=kit.row(M, "HUD"))
def distance_bar(a: Art):
    """The transport's distance bar: a long ruled track with a start post and a flag post, and a small
    transport outline at the left to mark which way the progress fills."""
    a.line(60, 32, 610, 32, stroke=LN, stroke_width=SW)
    for k in range(12):
        a.line(60 + k * 50, 26, 60 + k * 50, 38, stroke=LN, stroke_width=1.5)
    a.line(610, 8, 610, 52, stroke=LN, stroke_width=SW)
    a.poly([(610, 8), (634, 16), (610, 24)], fill=kit.GOLD, **L)
    a.rect(6, 18, 40, 22, rx=3, fill="#7f9192", **L)
    a.circle(16, 42, 5, fill="#2b3536", **L)
    a.circle(38, 42, 5, fill="#2b3536", **L)

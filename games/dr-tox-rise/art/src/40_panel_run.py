"""Panel run (2D, scroll): noir spotted-black brush ink.

Heavy brushed blacks spotted across the panel, white paper left as light, white gutters that skip time.
No grey and no hatching: a shape is black or it is paper. The two signal colours appear only where the
Pulse and the shunt are (a dart, the green corners of the Toxin panel). Three sites, each as three
parallax layers (far is opaque; mid and near are transparent and slide over it)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "panel-run"
INK, PAPER = kit.INK, "#f4f1ea"
PW, PH = 1920, 540          # one panel's scroll strip


def brush(a, pts, w0, w1=None, **kw):
    """A tapered brush stroke along pts: width w0 at the start, w1 (default thin) at the end."""
    w1 = w0 * 0.15 if w1 is None else w1
    left, right = [], []
    n = len(pts)
    for i, (x, y) in enumerate(pts):
        x0, y0 = pts[max(0, i - 1)]
        x2, y2 = pts[min(n - 1, i + 1)]
        dx, dy = x2 - x0, y2 - y0
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        t = i / max(1, n - 1)
        w = (w0 + (w1 - w0) * t) / 2 * (1 + a.rng.uniform(-.12, .12))
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    kw.setdefault("fill", INK)
    a.path(a.smooth_d(left + right[::-1], closed=True), **kw)


def spot(a, cx, cy, rx, ry, n=9, **kw):
    """A spotted black: an irregular brushed mass."""
    pts = []
    for k in range(n):
        t = 2 * math.pi * k / n
        r = 1 + a.rng.uniform(-.28, .22)
        pts.append((cx + rx * r * math.cos(t), cy + ry * r * math.sin(t)))
    kw.setdefault("fill", INK)
    a.path(a.smooth_d(pts, closed=True), **kw)


def dry_edge(a, x, y, w, h, n=40):
    """Dry-brush flecks along the top edge of a black mass."""
    for _ in range(n):
        px = x + a.rng.random() * w
        brush(a, [(px, y + a.rng.uniform(-4, 4)), (px + a.rng.uniform(10, 50), y - a.rng.uniform(0, 14))],
              a.rng.uniform(2, 6))


# ---- backdrops ---------------------------------------------------------------------------------
SITES = {"research": "the research floor (Panel run 1)", "depot": "the cold-storage depot (Panel run 2)",
         "snakehead": "the Snakehead escape (Panel run 3)"}


def far(a, site):
    a.rect(0, 0, PW, PH, fill=PAPER)
    rough = a.roughen(2.5, 0.06)
    a.open("g", filter=rough)
    if site == "research":
        a.rect(0, 0, PW, 70, fill=INK)
        for x in range(80, PW, 320):          # strip lights, paper left white beneath
            a.rect(x, 70, 200, 10, fill=INK)
        for x in range(0, PW, 480):           # observation glass bays, black frames, white panes
            a.rect(x + 40, 130, 380, 220, fill="none", stroke=INK, stroke_width=14)
            brush(a, [(x + 60, 330), (x + 200, 200), (x + 300, 150)], 10, 2)
            spot(a, x + 340, 300, 70, 40)
        a.rect(0, 430, PW, 110, fill=INK)
        dry_edge(a, 0, 430, PW, 60)
    elif site == "depot":
        a.rect(0, 0, PW, 40, fill=INK)
        for x in range(0, PW, 360):           # freezer doors, heavy handles
            a.rect(x + 30, 60, 300, 380, fill="none", stroke=INK, stroke_width=12)
            a.rect(x + 280, 210, 20, 90, fill=INK)
            spot(a, x + 90, 380, 110, 60)
            for k in range(6):
                a.line(x + 50 + k * 44, 70, x + 50 + k * 44, 120, stroke=INK, stroke_width=4)
        a.rect(0, 440, PW, 100, fill=INK)
        dry_edge(a, 0, 440, PW, 60)
    else:
        a.rect(0, 0, PW, PH, fill=INK)
        for x in range(0, PW, 420):           # concrete arches cut out of the black as paper
            a.path(f"M{x + 40},460 L{x + 40},180 Q{x + 210},60 {x + 380},180 L{x + 380},460Z", fill=PAPER)
            spot(a, x + 140, 380, 120, 80)
            brush(a, [(x + 60, 200), (x + 210, 110), (x + 360, 200)], 18, 18)
            a.rect(x + 196, 150, 28, 20, fill=PAPER, stroke=INK, stroke_width=4)
        dry_edge(a, 0, 460, PW, 50)
    a.close()


def mid(a, site):
    rough = a.roughen(2.0, 0.07)
    a.open("g", filter=rough)
    if site == "research":
        for x in range(60, PW, 380):          # lab benches with fume hoods
            a.rect(x, 330, 260, 24, fill=INK)
            a.rect(x + 20, 354, 20, 90, fill=INK)
            a.rect(x + 220, 354, 20, 90, fill=INK)
            a.rect(x + 40, 210, 180, 120, fill="none", stroke=INK, stroke_width=8)
            a.path(f"M{x + 60},310 l20,-40 l20,40Z M{x + 140},310 l14,-60 l14,60Z", fill=INK)
            spot(a, x + 200, 300, 30, 20)
    elif site == "depot":
        for x in range(40, PW, 300):          # racks of crates
            a.rect(x, 140, 12, 300, fill=INK)
            a.rect(x + 200, 140, 12, 300, fill=INK)
            for y in (200, 300, 400):
                a.rect(x, y, 212, 10, fill=INK)
                for k in range(2):
                    bx = x + 20 + k * 95
                    a.rect(bx, y - 52, 80, 52, fill=PAPER, stroke=INK, stroke_width=5)
                    a.line(bx, y - 52, bx + 80, y, stroke=INK, stroke_width=3)
            spot(a, x + 150, 420, 50, 22)
    else:
        for x in range(0, PW, 240):           # pipes and cell doors
            a.rect(x + 40, 220, 120, 230, fill=INK)
            a.rect(x + 70, 250, 60, 16, fill=PAPER)
        brush(a, [(0, 110), (PW / 2, 104), (PW, 112)], 26, 26)
        brush(a, [(0, 150), (PW / 2, 156), (PW, 146)], 14, 14)
        for x in range(120, PW, 360):
            a.rect(x, 96, 18, 64, fill=INK)
    a.close()


def near(a, site):
    rough = a.roughen(2.5, 0.05)
    a.open("g", filter=rough)
    for x in range(0, PW, 640):
        if site == "research":
            a.rect(x + 500, 0, 70, PH, fill=INK)                    # a column
            brush(a, [(x + 560, 0), (x + 580, PH)], 18, 4, fill=INK)
            a.path(f"M{x + 120},0 L{x + 140},120 L{x + 100},120Z", fill=INK)   # hanging lamp
            spot(a, x + 120, 128, 30, 10)
        elif site == "depot":
            for k in range(7):                                      # strip curtain
                a.rect(x + 420 + k * 20, 0, 12, 360 + (k % 3) * 30, fill=INK, opacity=0.9)
            spot(a, x + 160, PH - 20, 220, 70)
        else:
            brush(a, [(x + 40, PH), (x + 140, 300), (x + 300, 200), (x + 520, 180)], 60, 30)   # a fallen beam
            spot(a, x + 80, PH - 10, 160, 90)
            a.rect(x + 560, 0, 60, PH, fill=INK)
    a.close()


def backdrop(site, layer):
    fn = {"far": far, "mid": mid, "near": near}[layer]

    def draw(a: Art):
        fn(a, site)
    opaque = "opaque, the back of the panel" if layer == "far" else "transparent, for parallax over the far layer"
    draw.__doc__ = (f"Panel run backdrop, {SITES[site]}, {layer} layer ({opaque}): noir brush ink, spotted "
                    f"blacks and paper whites, no grey.")
    asset(G, f"panel-run-{site}-{layer}", group="backdrops", title=f"Panel run: {site} ({layer} layer)", w=PW, h=PH,
          row=kit.row(M, "Parallax backdrops, three sites by three layers"))(draw)


for _s in SITES:
    for _l in ("far", "mid", "near"):
        backdrop(_s, _l)


# ---- figures: Alexander's poses, the guard, the dog, the Observers ----------------------------
FW, FH = 200, 320
ALEX = dict(fill=kit.WHITE, stroke=INK, stroke_width=5, stroke_linejoin="round")


def shadow(a, x, w=70):
    brush(a, [(x - w, FH - 12), (x + w, FH - 12)], 14, 4)
    for k in range(3):
        fx = x - w + a.rng.uniform(0, 2 * w)
        brush(a, [(fx, FH - 6), (fx + a.rng.uniform(14, 30), FH - 4)], 3)


@asset(G, "panel-run-alex-walk", group="figures", title="Alexander: walk", w=FW, h=FH, row=kit.row(M, "Alexander's poses"))
def alex_walk(a: Art):
    """Alexander walking, the bible's silhouette: narrow, upright, long-necked, too thin to be dangerous.
    Paper-white with a brush outline so he reads against spotted blacks; a short black floor shadow."""
    shadow(a, 100)
    a.path(kit.figure_d(100, FH - 14, 1.9, lean=6, stride=14), **ALEX)
    brush(a, [(108, 120), (118, 180), (122, 200)], 6, 2)          # the clear line from the shunt


@asset(G, "panel-run-alex-crouch", group="figures", title="Alexander: crouch", w=FW, h=FH, row=kit.row(M, "Alexander's poses"))
def alex_crouch(a: Art):
    """Alexander crouched low on one knee, head down, the long back bent: still narrow, still contained."""
    shadow(a, 100, 80)
    pts = [(78, 120), (90, 118), (94, 134), (120, 150), (150, 200), (150, 250), (168, 306), (150, 306),
           (130, 258), (104, 262), (96, 306), (40, 306), (40, 290), (76, 286), (84, 230), (70, 170), (74, 140)]
    a.path(kit.P(pts, True), **ALEX)
    a.path("M78,120 a14,16 0 1,1 16,0Z", **ALEX)


@asset(G, "panel-run-alex-cover", group="figures", title="Alexander: in cover against a wall", w=FW, h=FH,
       row=kit.row(M, "Alexander's poses"))
def alex_cover(a: Art):
    """Alexander pressed flat to a wall edge, which is a black brushed bar on the right; his face turned
    away, one shoulder against the black."""
    a.rect(140, 0, 60, FH, fill=INK)
    dry_edge(a, 140, 0, 4, 1, n=3)
    a.path(kit.figure_d(110, FH - 14, 1.9, lean=-4, stride=4), **ALEX)
    brush(a, [(126, 70), (140, 110), (138, 170)], 8, 3)


@asset(G, "panel-run-alex-climb", group="figures", title="Alexander: climb a marked edge", w=FW, h=FH,
       row=kit.row(M, "Alexander's poses"))
def alex_climb(a: Art):
    """Alexander hanging from a ledge by both hands, body long below it, feet against the wall: a black
    ledge with a white chalk tick marking it as climbable."""
    a.rect(0, 40, FW, 26, fill=INK)
    a.path("M30,34 l10,-14 l10,14", fill="none", stroke=PAPER, stroke_width=4)
    body = [(84, 66), (92, 40), (100, 40), (100, 70), (110, 70), (112, 40), (120, 40), (124, 74), (126, 110),
            (124, 190), (128, 280), (118, 284), (106, 200), (100, 280), (90, 280), (92, 190), (86, 110)]
    a.path(kit.P(body, True), **ALEX)
    a.path("M96,76 a12,14 0 1,0 20,0Z", **ALEX)
    dry_edge(a, 0, 40, FW, 1, n=6)


@asset(G, "panel-run-alex-dart", group="figures", title="Alexander: drawing a dart from the shunt", w=FW, h=FH,
       row=kit.row(M, "Alexander's poses"))
def alex_dart(a: Art):
    """Alexander side-on with the right arm straight out, the dart just released; a near-black red line
    runs from the shunt at his wrist along the forearm. The only colour on the figure."""
    shadow(a, 80)
    a.path(kit.figure_d(80, FH - 14, 1.9, lean=-4, stride=12), **ALEX)
    arm = [(92, 82), (190, 92), (190, 104), (94, 100)]
    a.path(kit.P(arm, True), **ALEX)
    a.line(120, 96, 186, 98, stroke=kit.BLOOD2, stroke_width=4)
    a.circle(120, 96, 5, fill=kit.BLOOD, stroke=INK, stroke_width=2)


@asset(G, "panel-run-guard", group="figures", title="Guard with a torch", w=FW, h=FH, row=kit.row(M, "Guards and the dog"))
def guard(a: Art):
    """A facility guard as a solid black brushed silhouette, broad and heavy beside Alexander's thin one,
    a torch held out in the right hand. The cone itself is the separate torch-cone piece."""
    shadow(a, 90, 80)
    a.path(kit.person_d(90, FH - 14, 1.9, broad=1.25), fill=INK)
    brush(a, [(120, 120), (170, 140)], 22, 18)
    a.rect(160, 128, 34, 20, fill=INK)
    a.rect(190, 132, 8, 12, fill=PAPER, stroke=INK, stroke_width=2)


@asset(G, "panel-run-dog", group="figures", title="The depot dog", w=320, h=200, row=kit.row(M, "Guards and the dog"))
def dog(a: Art):
    """The depot's dog in profile as a black brushed silhouette, nose down and working a scent: it
    ignores cover. A few white scent strokes trail from the floor to its nose."""
    body = [(40, 120), (70, 84), (180, 80), (230, 70), (262, 96), (300, 120), (292, 132), (250, 124), (230, 120),
            (222, 180), (206, 180), (200, 132), (110, 130), (96, 180), (80, 180), (78, 130), (40, 126), (14, 100)]
    a.path(a.smooth_d(body, closed=True), fill=INK)
    a.path("M240,76 l10,-26 l12,24Z", fill=INK)
    for k in range(4):
        a.path(f"M{310 - k * 30},{186 - k * 6} q8,-14 -2,-26", fill="none", stroke=INK, stroke_width=2, stroke_dasharray="4 5")
    brush(a, [(20, 190), (300, 190)], 10, 4)


def observer(key, title, doc, fn, w=FW, h=FH):
    fn.__doc__ = doc
    asset(G, f"panel-run-{key}", group="figures", title=title, w=w, h=h, row=kit.row(M, "The Observers in the gutters"))(fn)


def split(a: Art):
    shadow(a, 100, 90)
    pts = [(40, 300), (30, 240), (52, 190), (60, 150), (90, 130), (120, 134), (150, 160), (170, 210), (176, 260),
           (190, 300), (150, 300), (140, 262), (110, 270), (84, 262), (76, 300)]
    a.path(a.smooth_d(pts, closed=True), fill=INK)
    a.path("M92,128 a22,18 0 1,1 40,6Z", fill=INK)
    brush(a, [(60, 170), (90, 230), (150, 250)], 4, 2, fill=PAPER)      # the seam between the halves


def cauldron(a: Art):
    shadow(a, 100)
    a.path(kit.person_d(100, FH - 14, 1.85, broad=1.1), fill=INK)
    for k in range(9):
        a.circle(100 + 46 * math.cos(k * 0.7), 150 + 60 * math.sin(k * 1.3), 6 + k % 3 * 3, fill=PAPER, stroke=INK, stroke_width=2)


def ghost(a: Art):
    a.path(kit.person_d(100, FH - 14, 1.85), fill="none", stroke=INK, stroke_width=3, stroke_dasharray="3 9")
    a.path("M70,300 l30,-30 l30,30", fill="none", stroke=INK, stroke_width=6, stroke_linecap="round")
    brush(a, [(40, 312), (160, 312)], 6, 2)
    for k in range(3):
        brush(a, [(60 + k * 30, 296), (66 + k * 30, 290)], 3)


def twins(a: Art):
    shadow(a, 160, 120)
    a.path(kit.person_d(120, FH - 14, 1.7), fill=INK)
    a.path(kit.person_d(200, FH - 14, 1.7), fill=INK)
    for r in (36, 62, 88):
        a.path(f"M{f(160 - r)},{f(150 - r * .4)} A{r},{r} 0 0,1 {f(160 + r)},{f(150 - r * .4)}", fill="none",
               stroke=INK, stroke_width=4, stroke_dasharray="14 8")


observer("split", "The Split (carries him over a gap)", "The Split as a black silhouette, half human and half "
         "toad, crouched to leap: a broad low body, a pale seam drawn down where the halves meet. In the gutter "
         "he carries Alexander over a gap.", split)
observer("cauldron", "The Cauldron (clears a doorway)", "The Cauldron as a black silhouette pitted with pale "
         "round boils: the acid that clears a doorway, drawn as bubbles cut from the ink.", cauldron)
observer("ghost", "The Ghost (walks ahead unseen)", "The Ghost: no body at all, only a sparse dotted outline "
         "and the chalk chevron he leaves on the floor to mark a safe panel.", ghost)
observer("twins", "The Resonance Twins (open the last wall)", "The Resonance Twins, two black silhouettes side "
         "by side with dashed arcs of sound rising between them: they open the last wall and pay for it.", twins,
         w=320)


# ---- pieces ------------------------------------------------------------------------------------
@asset(G, "panel-run-torch-cone", group="pieces", title="Torch cone (a guard's light)", w=480, h=220,
       row=kit.row(M, "Hazards and cover"))
def torch_cone(a: Art):
    """A guard's torch cone, a wedge of bare paper widening to the right, edged with a dry black brush
    line. Transparent outside the wedge; laid over the panel where the guard faces."""
    a.poly([(0, 110), (480, 10), (480, 210)], fill=PAPER, opacity=0.92)
    brush(a, [(0, 110), (240, 60), (480, 10)], 8, 3)
    brush(a, [(0, 110), (240, 160), (480, 210)], 8, 3)
    for k in range(5):
        a.line(40 + k * 90, 110, 480, 30 + k * 40, stroke=INK, stroke_width=1, opacity=0.25)


@asset(G, "panel-run-camera", group="pieces", title="Security camera with its sweep", w=320, h=240,
       row=kit.row(M, "Hazards and cover"))
def camera(a: Art):
    """A wall camera on a bracket, a black block with a white lens ring; a pale dashed sweep below it
    marks the arc it turns through."""
    a.rect(0, 20, 30, 60, fill=INK)
    brush(a, [(30, 50), (90, 60)], 12, 10)
    a.path("M80,40 L190,56 L186,96 L80,84Z", fill=INK)
    a.circle(190, 76, 14, fill=PAPER, stroke=INK, stroke_width=5)
    a.path("M120,90 L40,236 M120,90 L310,210", fill="none", stroke=INK, stroke_width=3, stroke_dasharray="10 8")
    a.path("M40,236 Q170,260 310,210", fill="none", stroke=INK, stroke_width=3, stroke_dasharray="10 8")


@asset(G, "panel-run-dart", group="pieces", title="A dart from the shunt", w=160, h=48, row=kit.row(M, "Hazards and cover"))
def dart(a: Art):
    """One dart in flight: a slim black needle with a brushed tail and a near-black red channel down it."""
    brush(a, [(4, 24), (60, 24)], 2, 14)
    a.path("M60,18 L140,22 L156,24 L140,26 L60,30Z", fill=INK)
    a.line(70, 24, 136, 24, stroke=kit.BLOOD2, stroke_width=3)
    a.circle(64, 24, 3, fill=kit.BLOOD)
    for k, y in enumerate((12, 36, 24)):
        brush(a, [(8 + k * 6, y), (40 + k * 6, y)], 2, 0.5)


@asset(G, "panel-run-crate", group="pieces", title="Crate (cover)", w=220, h=180, row=kit.row(M, "Hazards and cover"))
def crate(a: Art):
    """A shipping crate to hide behind, outlined in brush, half its face lost in a spotted black shadow."""
    a.rect(10, 20, 200, 150, fill=PAPER, stroke=INK, stroke_width=8)
    a.line(10, 20, 210, 170, stroke=INK, stroke_width=6)
    a.line(10, 95, 210, 95, stroke=INK, stroke_width=5)
    spot(a, 160, 130, 60, 50)
    brush(a, [(0, 176), (220, 176)], 10, 4)


@asset(G, "panel-run-exit", group="pieces", title="Panel exit door", w=200, h=320, row=kit.row(M, "Hazards and cover"))
def exit_door(a: Art):
    """A door at a panel's edge, ajar: a black frame, a slab of paper-white light from the gap, the way out."""
    a.rect(20, 20, 160, 290, fill=INK)
    a.poly([(60, 40), (160, 40), (160, 300), (60, 300)], fill=PAPER)
    a.poly([(60, 40), (100, 60), (100, 290), (60, 300)], fill=INK)
    brush(a, [(160, 300), (200, 318)], 10, 2)
    a.rect(84, 160, 10, 24, fill=PAPER)


@asset(G, "panel-run-ledge", group="pieces", title="Climbable edge marker", w=200, h=80, row=kit.row(M, "Hazards and cover"))
def ledge(a: Art):
    """A marked edge: a short black ledge with a chalk-white chevron scratched on it, the only kind of
    edge he can climb."""
    a.rect(0, 30, 200, 30, fill=INK)
    dry_edge(a, 0, 30, 200, 1, n=10)
    a.path("M80,52 l20,-16 l20,16", fill="none", stroke=PAPER, stroke_width=5, stroke_linecap="round")


@asset(G, "panel-run-frame", group="pieces", title="Panel frame (transparent centre)", w=960, h=540,
       row=kit.row(M, "Page furniture"))
def frame(a: Art):
    """A panel border drawn with a loaded brush: heavy black edges that thicken at the corners, the
    centre left clear so the panel's layers show through."""
    for pts in (((6, 8), (954, 6)), ((954, 6), (956, 534)), ((956, 534), (6, 532)), ((6, 532), (8, 8))):
        brush(a, [pts[0], ((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2), pts[1]], 16, 12)
    for x, y, dx, dy in ((10, 10, 30, 14), (950, 10, -30, 14), (10, 530, 30, -14), (950, 530, -30, -14)):
        brush(a, [(x, y), (x + dx, y + dy)], 6, 1)


@asset(G, "panel-run-gutter-arrow", group="pieces", title="Gutter arrow (choose the next panel)", w=200, h=120,
       row=kit.row(M, "Page furniture"))
def gutter_arrow(a: Art):
    """The arrow drawn across a white gutter to the next panel the player chose: a fat black brush curve
    ending in an amber head, the one warm mark on the page furniture."""
    brush(a, [(10, 20), (60, 30), (110, 60), (150, 90)], 22, 14)
    a.poly([(136, 66), (196, 108), (128, 112)], fill=kit.AMBER, stroke=INK, stroke_width=4)
    for k in range(3):
        brush(a, [(20 + k * 22, 44 + k * 8), (34 + k * 22, 50 + k * 8)], 3)


@asset(G, "panel-run-locker", group="pieces", title="Arlo Benn's locker", w=240, h=360, row=kit.row(M, "Found things"))
def locker(a: Art):
    """The depot guard's locker standing open: black steel in brush, and taped inside the door a child's
    drawing, a house and a sun in a few loose strokes, the one soft thing in the depot."""
    a.rect(20, 20, 120, 330, fill=INK)
    a.poly([(140, 20), (226, 40), (226, 330), (140, 350)], fill=PAPER, stroke=INK, stroke_width=6)
    a.rect(156, 90, 56, 70, fill="#fbf8f0", stroke=INK, stroke_width=2, transform="rotate(4 184 125)")
    a.path("M166,148 l0,-20 l14,-12 l14,12 l0,20Z", fill="none", stroke=INK, stroke_width=2)
    a.circle(202, 102, 7, fill="none", stroke=INK, stroke_width=2)
    for k in range(4):
        a.rect(36, 50 + k * 70, 88, 6, fill=PAPER, opacity=0.3)


# ---- documents: captions, the plate, the Toxin panel -------------------------------------------
@asset(G, "panel-run-caption", group="documents", title="Panel caption box (blank)", w=480, h=90,
       row=kit.row(M, "Captions"))
def caption(a: Art):
    """A hand-ruled caption box for the comic page, warm off-white with a brushed black edge: text such
    as “Pulse 112. Hold.” is set in it at run time."""
    a.rect(6, 6, 468, 78, fill="#fff8e6")
    for pts in (((6, 6), (474, 6)), ((474, 6), (474, 84)), ((474, 84), (6, 84)), ((6, 84), (6, 6))):
        brush(a, [pts[0], pts[1]], 6, 5)


@asset(G, "panel-run-caption-later", group="documents", title="Gutter caption: THREE MINUTES LATER.", w=480, h=90,
       row=kit.row(M, "Captions"))
def caption_later(a: Art):
    """The gutter caption that skips time, hand-lettered in black capitals on the warm caption box:
    THREE MINUTES LATER."""
    caption(a)
    kit.label(a, 240, 58, "THREE MINUTES LATER.", size=32, anchor="middle", fill=INK, font_weight="bold",
              fit=420, letter_spacing="1")


@asset(G, "panel-run-rcc-plate", group="documents", title="The first RCC plate", w=420, h=180,
       row=kit.row(M, "Found things"))
def rcc_plate(a: Art):
    """The first RCC plate found on a break-in: riveted steel in noir ink, black with paper-white stamped
    letters and a line of small type, half in brushed shadow. It fills a card on the pin board."""
    a.rect(10, 10, 400, 160, rx=8, fill=INK)
    a.rect(24, 24, 372, 132, rx=6, fill="none", stroke=PAPER, stroke_width=3)
    for x, y in ((22, 22), (398, 22), (22, 158), (398, 158)):
        a.circle(x, y, 5, fill=PAPER)
    kit.label(a, 210, 104, "RCC", size=76, anchor="middle", fill=PAPER, font_weight="bold", letter_spacing="12")
    kit.label(a, 210, 138, "ROCKCORE CHEMICAL CORP.", size=16, anchor="middle", fill=PAPER,
              letter_spacing="2", fit=330)
    for k in range(5):
        brush(a, [(300 + k * 18, 168), (320 + k * 18, 150)], 4)


@asset(G, "panel-run-toxin-panel", group="documents", title="The Toxin State panel (the suit failing)", w=960, h=540,
       row=kit.row(M, "Pulse at 100"))
def toxin_panel(a: Art):
    """Pulse 100: the one panel the Toxin State gets. Green creeps in from the four corners over the ink;
    in the middle, a black silhouette at the wrong proportion, shoulders too high, a joint too many,
    with straps snapping and plates lifting away from it in white flecks. The panel cuts before any act."""
    a.rect(0, 0, 960, 540, fill=PAPER)
    for cx, cy in ((0, 0), (960, 0), (0, 540), (960, 540)):
        spot(a, cx, cy, 200, 150)
    for cx, cy in ((0, 0), (960, 0), (0, 540), (960, 540)):
        a.circle(cx, cy, 280, fill=a.radial([(0, kit.GREEN, 0.95), (0.55, kit.GREEN, 0.55), (1, kit.GREEN, 0)]))
    a.rect(0, 470, 960, 70, fill=INK)
    body = [(400, 480), (420, 380), (350, 330), (330, 250), (360, 150), (400, 96), (440, 120), (462, 70),
            (498, 52), (526, 80), (560, 60), (630, 110), (650, 200), (600, 250), (640, 300), (590, 360),
            (600, 480), (540, 480), (520, 400), (470, 410), (460, 480)]
    a.path(kit.P(body, True), fill=INK, stroke=PAPER, stroke_width=4, stroke_linejoin="round")
    for x1, y1, x2, y2 in ((380, 200, 340, 130), (610, 160, 680, 120), (420, 330, 360, 380)):   # straps snapping
        a.line(x1, y1, x2, y2, stroke=INK, stroke_width=8)
        a.line(x2, y2, x2 + (x2 - x1) * .2, y2 + (y2 - y1) * .2, stroke=PAPER, stroke_width=3, stroke_dasharray="4 4")
    for k in range(12):            # plates and straps flying off, cut from the ink
        an = a.rng.uniform(0, 2 * math.pi)
        r = a.rng.uniform(140, 230)
        x, y = 490 + r * math.cos(an), 300 + r * .8 * math.sin(an)
        a.rect(x, y, a.rng.uniform(16, 34), a.rng.uniform(6, 14), fill=PAPER, stroke=INK, stroke_width=3,
               transform=f"rotate({a.rng.randint(0, 180)} {f(x)} {f(y)})")
    for x, y in ((486, 84), (510, 82)):
        a.circle(x, y, 5, fill=kit.GREEN)
    frame(a)

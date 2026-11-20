"""Two Pans (1D, balance): two-colour pulp, red and black.

Red and black inks only on rough pulp stock: heavy black shadows, red flat fills, the balance drawn as a
pulp cover's centrepiece. The pans are labelled only BLACK and RED; the unit is the pip, stamped on tokens
as dots. Nothing on the page names a substance, a quantity of one, or a route. The dial's window (black
between 70 and 78 percent of the whole) and, in Two Pans 3 only, the heart band (86 to 90) are printed on
it; the pointer reads the share of BLACK."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "two-pans"
BLK, RED, PULP = "#1a1a1a", kit.PULP_RED, "#e8dcc2"
L = dict(stroke=BLK, stroke_width=5, stroke_linejoin="round", stroke_linecap="round")


def pulp(a, grain=0.45):
    a.paper(PULP, grain=grain, fibre=0.7)


def title_band(a, w, h=110, text="THE TWO PANS"):
    a.rect(0, 0, w, h, fill=RED)
    kit.label(a, 44, h * .76, text, size=h * .66, family="serif", fill=BLK, font_weight="bold", letter_spacing="4")
    a.rect(0, h, w, 8, fill=BLK)


# ---- covers -------------------------------------------------------------------------------------
def cover(key, what, scene):
    def draw(a: Art):
        pulp(a)
        scene(a)
        title_band(a, 1280)
        a.poly([(500, 690), (780, 690), (860, 720), (420, 720)], fill=BLK, opacity=0.85)
        a.rect(0, 690, 1280, 30, fill=BLK)
        a.rect(1040, 20, 210, 70, fill=PULP, stroke=BLK, stroke_width=4)
        kit.label(a, 1145, 66, {"bench": "No. 1", "suite": "No. 2", "core": "No. 3"}[key], size=34, family="serif",
                  fill=BLK, anchor="middle", font_weight="bold")
    draw.__doc__ = (f"Two Pans cover, {what}: a pulp cover in red and black on rough stock, the red title band THE TWO "
                    f"PANS with an issue number, the scene in heavy black shadow and red flats down both sides, the "
                    f"middle left clear for the balance.")
    asset(G, f"two-pans-cover-{key}", group="backdrops", title=f"Two Pans: cover ({key})", w=1280, h=720,
          row=kit.row(M, "Covers: one per appearance"))(draw)


def scene_bench(a):
    a.rect(0, 520, 1280, 170, fill=BLK)
    a.rect(0, 510, 1280, 14, fill=RED)
    for k, (x, h) in enumerate(((90, 150), (190, 120), (290, 170), (1000, 140), (1100, 110), (1190, 160))):
        a.path(kit.jar_d(x, 512, 80, h), fill=RED if k % 2 else BLK, stroke=BLK, stroke_width=5)
    a.path(kit.lamp_d(200, 240, 1.2), fill=BLK)
    a.poly([(130, 240), (270, 240), (380, 510), (20, 510)], fill=RED, opacity=0.35)


def scene_suite(a):
    a.rect(0, 560, 1280, 130, fill=BLK)
    for x in (60, 1060):                                  # treatment chairs as black silhouettes, red seats
        a.path(f"M{x},{560} L{x + 40},{360} L{x + 70},{360} L{x + 60},{470} L{x + 180},{470} L{x + 190},{560}Z", fill=BLK)
        a.rect(x + 66, 450, 120, 20, fill=RED)
    for x in (300, 900):                                  # glass to the floor: the plain below
        a.rect(x, 140, 80, 420, fill="none", stroke=BLK, stroke_width=4)
        a.hatch(x, 440, 80, 120, angle=0, spacing=8, stroke=BLK, stroke_width=2,
                clip=a.clip(f'<rect x="{x}" y="440" width="80" height="120"/>'))


def scene_core(a):
    a.rect(0, 118, 1280, 572, fill=BLK, opacity=0.9)
    a.circle(640, 260, 420, fill=PULP, opacity=0.18)
    a.path(kit.lamp_d(640, 200, 1.1), fill=RED, stroke=BLK, stroke_width=5)
    a.line(640, 145, 640, 118, stroke=RED, stroke_width=6)
    a.poly([(574, 200), (706, 200), (1000, 690), (280, 690)], fill=RED, opacity=0.28)
    for x in (80, 1160):
        a.rect(x - 20, 180, 40, 510, fill=BLK, stroke=RED, stroke_width=2)


cover("bench", "the bench in Snakehead with the cult's rite jars and the lamp (Two Pans 1)", scene_bench)
cover("suite", "the clinical suite, treatment chairs and glass to the floor (Two Pans 2)", scene_suite)
cover("core", "the hub's core under one lamp (Two Pans 3)", scene_core)


# ---- the balance --------------------------------------------------------------------------------
@asset(G, "two-pans-stand", group="pieces", title="Two Pans: the stand and pivot", w=300, h=520,
       row=kit.row(M, "The balance"))
def stand(a: Art):
    """The balance's stand: a heavy black column on a stepped foot with a red pivot boss at the top
    (centre 150, 40), a slab of black shadow falling right."""
    a.poly([(150, 500), (296, 500), (250, 470), (150, 470)], fill=BLK, opacity=0.5)
    a.rect(132, 40, 36, 430, fill=BLK)
    a.rect(140, 60, 6, 400, fill=PULP, opacity=0.35)
    a.rect(40, 470, 220, 26, fill=BLK)
    a.rect(70, 450, 160, 24, fill=BLK)
    a.circle(150, 40, 30, fill=RED, **L)
    a.circle(150, 40, 8, fill=BLK)


@asset(G, "two-pans-beam", group="pieces", title="Two Pans: the beam (rotates about its centre)", w=720, h=60,
       row=kit.row(M, "The balance"))
def beam(a: Art):
    """The beam: a long black bar tapering to hooks at both ends, its centre (360, 30) bored for the
    pivot; rotate it about the centre."""
    a.path("M20,22 L340,14 L380,14 L700,22 L700,38 L380,46 L340,46 L20,38Z", fill=BLK)
    a.circle(360, 30, 18, fill=PULP, stroke=BLK, stroke_width=5)
    for x in (20, 700):
        a.circle(x, 30, 12, fill="none", stroke=BLK, stroke_width=5)
    a.line(60, 24, 320, 20, stroke=PULP, stroke_width=2, opacity=0.4)


def pan(color, label_text):
    def draw(a: Art):
        cx = 130
        a.circle(cx, 10, 8, fill="none", stroke=BLK, stroke_width=4)
        a.line(cx, 18, 30, 190, stroke=BLK, stroke_width=4)
        a.line(cx, 18, 230, 190, stroke=BLK, stroke_width=4)
        a.line(cx, 18, cx, 190, stroke=BLK, stroke_width=2)
        a.path(f"M10,190 Q{cx},290 250,190Z", fill=color, **L)
        a.path(f"M10,190 L250,190", **L)
        a.path(f"M40,206 Q{cx},250 220,206", fill="none", stroke=PULP if color == BLK else BLK, stroke_width=2, opacity=0.5)
        kit.label(a, cx, 226, label_text, size=22, family="sans-serif", fill=PULP if color == BLK else BLK, anchor="middle",
                  font_weight="bold", letter_spacing="3")
    draw.__doc__ = (f"Two Pans: the {label_text} pan hanging from its hook on three chains, a deep dish filled flat "
                    f"{'black' if color == BLK else 'red'}, its name lettered on the dish. Hook at the top centre; tokens "
                    f"sit along the rim.")
    asset(G, f"two-pans-pan-{label_text.lower()}", group="pieces", title=f"Two Pans: the {label_text} pan", w=260, h=290,
          row=kit.row(M, "The balance"))(draw)


pan(BLK, "BLACK")
pan(RED, "RED")


@asset(G, "two-pans-pointer", group="pieces", title="Two Pans: the pointer (pivot at the bottom)", w=40, h=260,
       row=kit.row(M, "The dial and pointer"))
def pointer(a: Art):
    """The pointer: a long black needle with a red tip, pointing straight up from a pivot at (20, 240);
    rotate it to read the share of BLACK."""
    a.path("M20,6 L28,230 L12,230Z", fill=BLK)
    a.path("M20,6 L25,60 L15,60Z", fill=RED)
    a.circle(20, 240, 16, fill=BLK)
    a.circle(20, 240, 5, fill=RED)
    a.line(20, 70, 20, 220, stroke=PULP, stroke_width=1, opacity=0.4)


def dial(heart):
    def draw(a: Art):
        cx, cy, r = 280, 250, 200

        def pt(p, rr):
            t = math.radians(180 + 180 * p)
            return cx + rr * math.cos(t), cy + rr * math.sin(t)

        def band(p0, p1, color, w=34):
            x0, y0 = pt(p0, r - 20)
            x1, y1 = pt(p1, r - 20)
            a.path(f"M{f(x0)},{f(y0)} A{r - 20},{r - 20} 0 0,1 {f(x1)},{f(y1)}", fill="none", stroke=color, stroke_width=w)
        a.path(f"M{cx - r},{cy} A{r},{r} 0 0,1 {cx + r},{cy}", fill="none", stroke=BLK, stroke_width=8)
        band(0.70, 0.78, RED)
        if heart:
            band(0.86, 0.90, BLK, 34)
            band(0.86, 0.90, PULP, 6)
        for k in range(11):
            x0, y0 = pt(k / 10, r)
            x1, y1 = pt(k / 10, r - (26 if k % 5 == 0 else 14))
            a.line(x0, y0, x1, y1, stroke=BLK, stroke_width=4)
        xw, yw = pt(0.74, r + 30)
        kit.label(a, xw, yw, "WINDOW", size=20, fill=RED, anchor="middle", font_weight="bold", letter_spacing="2")
        if heart:
            xh, yh = pt(0.88, r + 30)
            kit.label(a, xh + 12, yh + 8, "HEART", size=18, fill=BLK, anchor="middle", font_weight="bold", letter_spacing="2")
        kit.label(a, cx - r - 20, cy + 32, "ALL RED", size=18, fill=RED, anchor="start", font_weight="bold")
        kit.label(a, cx + r + 20, cy + 32, "ALL BLACK", size=18, fill=BLK, anchor="end", font_weight="bold")
        a.circle(cx, cy, 6, fill=BLK)
    draw.__doc__ = ("Two Pans dial: a half-circle scale in black with ticks at every tenth, ALL RED at the left end and "
                    "ALL BLACK at the right, and a red band printed on it from 70 to 78 percent black, the WINDOW"
                    + (", with a second black band from 86 to 90 percent, HEART, where his heart would hold (Two Pans 3)."
                       if heart else ".") + " The pointer's pivot is the centre of the arc's base (280, 250).")
    asset(G, "two-pans-dial-heart" if heart else "two-pans-dial", group="pieces",
          title="Two Pans: the dial with the window and the heart band" if heart else "Two Pans: the dial with the window",
          w=560, h=300, row=kit.row(M, "The dial and pointer"))(draw)


dial(False)
dial(True)


def token(n):
    def draw(a: Art):
        a.circle(42, 44, 34, fill=BLK)                     # shadow
        a.circle(38, 38, 34, fill=PULP, stroke=BLK, stroke_width=5)
        a.circle(38, 38, 26, fill="none", stroke=RED, stroke_width=3)
        a.path("M18,22 A26,26 0 0,1 40,12", fill="none", stroke="#ffffff", stroke_width=2, opacity=0.5)
        pos = {1: [(0, 0)], 2: [(-9, -9), (9, 9)], 3: [(-11, -11), (0, 0), (11, 11)],
               4: [(-10, -10), (10, -10), (-10, 10), (10, 10)], 5: [(-11, -11), (11, -11), (0, 0), (-11, 11), (11, 11)],
               6: [(-10, -12), (10, -12), (-10, 0), (10, 0), (-10, 12), (10, 12)]}[n]
        for dx, dy in pos:
            a.circle(38 + dx, 38 + dy, 4.5, fill=BLK)
    draw.__doc__ = (f"A pip token stamped with {n} dot{'s' if n > 1 else ''}: a struck disc printed in the pulp's paper "
                    f"colour with a red inner ring and a heavy black shadow, the invented unit of the page.")
    asset(G, f"two-pans-token-{n}", group="pieces", title=f"Two Pans: pip token, {n}", w=80, h=80,
          row=kit.row(M, "Pip tokens (1 to 6)"))(draw)


for _n in range(1, 7):
    token(_n)


@asset(G, "two-pans-tray", group="pieces", title="Two Pans: the token tray", w=560, h=130,
       row=kit.row(M, "Pip tokens (1 to 6)"))
def tray(a: Art):
    """The token tray along the bottom of the page: a solid black tray with six red-rimmed wells for the
    tokens and TOKENS lettered in red at the left."""
    a.rect(4, 14, 552, 112, rx=10, fill=BLK)
    for k in range(6):
        a.circle(170 + k * 64, 70, 28, fill="#2a2a2a", stroke=RED, stroke_width=3)
    kit.label(a, 22, 78, "TOKENS", size=20, fill=RED, font_weight="bold", letter_spacing="2")


# ---- ui -------------------------------------------------------------------------------------------
def caption(key, lines, what, w=360, h=110, fill="#ffffff", ink=RED):
    def draw(a: Art):
        a.rect(10, 10, w - 14, h - 14, fill=BLK)
        a.rect(4, 4, w - 14, h - 14, fill=fill, stroke=BLK, stroke_width=4)
        a.line(22, h - 22, w - 40, h - 22, stroke=ink, stroke_width=1.5, opacity=0.5)
        for k, ln in enumerate(lines):
            kit.label(a, 22, 44 + k * 34, ln, size=26, fill=ink, font_weight="bold", letter_spacing="1",
                      fit=kit.fitw(ln, 26, w - 50, .66))
    draw.__doc__ = f"Two Pans caption box: {what}, lettered in heavy capitals in a pulp caption box with a black drop shadow."
    asset(G, f"two-pans-{key}", group="ui", title=f"Two Pans: caption, {' '.join(lines)}", w=w, h=h,
          row=kit.row(M, "Captions and plates"))(draw)


caption("caption-heart", ("HERE, HIS HEART", "WOULD HOLD."), "the red caption over the heart band, the only words the page says about it")
caption("caption-refuse", ("IT WILL NOT REST", "THERE."), "shown when too much RED knocks the beam and the tokens jump out of the pan",
        fill=BLK, ink=PULP)


@asset(G, "two-pans-load", group="ui", title="Two Pans: the load plate (number laid in)", w=300, h=90,
       row=kit.row(M, "Captions and plates"))
def load(a: Art):
    """The stated load, as a pulp price flash: a red starburst corner and LOAD in black capitals, PIPS
    under the space where the number is laid in."""
    a.rect(4, 4, 292, 82, fill=PULP, stroke=BLK, stroke_width=4)
    pts = []
    for k in range(16):
        r = 40 if k % 2 == 0 else 26
        t = math.radians(k * 22.5)
        pts.append((50 + r * math.cos(t), 45 + r * 0.9 * math.sin(t)))
    a.poly(pts, fill=RED, stroke=BLK, stroke_width=3)
    kit.label(a, 50, 52, "LOAD", size=17, fill=BLK, anchor="middle", font_weight="bold")
    kit.label(a, 270, 76, "PIPS", size=16, fill=BLK, anchor="end", font_weight="bold", letter_spacing="2")
    a.line(110, 60, 220, 60, stroke=BLK, stroke_width=1.5, opacity=0.5)


@asset(G, "two-pans-confirm", group="ui", title="Two Pans: REST IT (confirm)", w=260, h=90,
       row=kit.row(M, "Captions and plates"))
def confirm(a: Art):
    """The confirm button as a pulp cover's banner: REST IT in pulp-paper capitals on a black slab with a
    red underline; usable only when the pointer rests."""
    a.rect(10, 12, 246, 74, fill=RED)
    a.rect(4, 4, 246, 74, fill=BLK)
    kit.label(a, 127, 54, "REST IT", size=34, family="serif", fill=PULP, anchor="middle", font_weight="bold", letter_spacing="4")
    a.line(40, 66, 214, 66, stroke=RED, stroke_width=3)
    a.circle(22, 41, 4, fill=RED)
    a.circle(232, 41, 4, fill=RED)


# ---- documents ------------------------------------------------------------------------------------
@asset(G, "two-pans-jar", group="documents", title="Two Pans: a rite jar (Two Pans 1)", w=160, h=200,
       row=kit.row(M, "What is weighed: jars and the rack"))
def jar(a: Art):
    """One of the cult's rite jars as the pulp draws it: a wide jar with a screw lid, filled half red and
    half black in two flat bands, a torn paper label with a ring drawn on it, a black shadow; it stands for
    a load of tokens and says nothing about what is in it."""
    a.path(kit.jar_d(86, 196, 130, 180), fill=BLK, opacity=0.9)
    a.path(kit.jar_d(80, 190, 130, 180), fill=PULP, **L)
    a.rect(24, 100, 112, 40, fill=RED)
    a.rect(24, 140, 112, 40, fill=BLK)
    a.rect(26, 10, 108, 26, fill=BLK)
    a.rect(44, 70, 72, 46, fill=PULP, stroke=BLK, stroke_width=3, transform="rotate(-6 80 93)")
    a.circle(80, 93, 12, fill="none", stroke=BLK, stroke_width=3)


@asset(G, "two-pans-rack", group="documents", title="Two Pans: RCC's rack of vials (Two Pans 2)", w=420, h=220,
       row=kit.row(M, "What is weighed: jars and the rack"))
def rack(a: Art):
    """The suite's rack as a pulp would print it: a black steel rack with twelve vials, nine filled black
    and three red, a stamped RCC plate on the front. It sits in the window, and always did; it carries no
    other label."""
    a.rect(14, 200, 400, 14, fill=BLK, opacity=0.6)
    a.rect(10, 60, 400, 140, fill=PULP, **L)
    for k in range(12):
        x = 40 + k * 30
        a.path(kit.vial_d(x, 110, 18, 70), fill=RED if k in (2, 6, 10) else BLK, stroke=BLK, stroke_width=2)
    a.rect(10, 150, 400, 12, fill=BLK)
    a.rect(160, 166, 100, 28, fill=BLK)
    kit.label(a, 210, 187, "RCC", size=20, fill=PULP, anchor="middle", font_weight="bold", letter_spacing="4")

"""The Manifold (1D, flow routing): mail-order comic advert.

The gauntlet as the comics' back pages would sell it: a coupon advert on cheap yellowed stock, shouting
red headlines, numbered callouts in gold circles, small-print sales copy, starbursts and a dashed
clip-out border. The flow is an invented unit, a bead, drawn in the near-black red of his blood; the
device is matte black with clear tubing (Part VI section 7: no chrome, no gloss).

Gauntlet geometry (for the module): valve centres at x = 220 + 110 k (k = 0..5), y = 150 of the 1000 by
260 gauntlet; the fifth-outlet socket is centred at (930, 150)."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "manifold"
INK = kit.INK
STOCK = "#f4ecd2"
RED = "#B3261E"
TUBE = "#dfe7e8"
BODY = "#2a2a2a"
VALVES = [220 + 110 * k for k in range(6)]


def headline(a, x, y, s, size, w, color=RED, anchor="start"):
    kit.label(a, x + 3, y + 3, s, size=size, fill=INK, font_weight="bold", anchor=anchor, fit=kit.fitw(s, size, w, .62))
    kit.label(a, x, y, s, size=size, fill=color, font_weight="bold", anchor=anchor, fit=kit.fitw(s, size, w, .62))


def small_print(a, x, y, w, lines, size=14):
    for k, ln in enumerate(lines):
        kit.label(a, x, y + k * size * 1.35, ln, size=size, family="serif", fill=INK, fit=kit.fitw(ln, size, w, .48))


@asset(G, f"{M}-advert", group="documents", title="The advert page (backdrop)", w=1280, h=720,
       row=kit.row(M, "The advert page, headlines and coupon"))
def advert(a: Art):
    """The page: a comic's back cover on yellowed stock with a dashed clip-out border, a blank band at the
    top for the headline, the device's place across the middle, columns of tiny sales copy down the sides
    and a MAIL TODAY strip at the foot."""
    a.paper(STOCK, grain=0.25)
    a.rect(20, 20, 1240, 680, fill="none", stroke=INK, stroke_width=4, stroke_dasharray="18 10")
    a.path("M14,40 l16,-8 l-6,16Z", fill=INK)
    a.rect(44, 44, 1192, 120, fill="#fbf4dc", stroke=INK, stroke_width=2)
    a.rect(44, 180, 1192, 300, fill="none", stroke=INK, stroke_width=1.5, stroke_dasharray="4 4")
    small_print(a, 52, 520, 340, ["Hand-plumbed! Six valves, every one a choice!",
                                  "Four barrels from a single line! Precision",
                                  "routing for the discerning operator.",
                                  "Back-pressure? Not with proper care!",
                                  "Satisfaction not guaranteed. Results vary.",
                                  "No chrome. No gloss. Ships in plain wrap."])
    a.rect(44, 640, 820, 40, fill=INK)
    kit.label(a, 60, 668, "MAIL TODAY!  SEND NO MONEY!  ALLOW 6 TO 8 WEEKS", size=22, fill=STOCK, font_weight="bold",
              letter_spacing="2", fit=780)


@asset(G, f"{M}-headline-1", group="documents", title="Headline: AMAZING! FOUR BARRELS FROM ONE LINE!", w=1000, h=120,
       row=kit.row(M, "The advert page, headlines and coupon"))
def headline_1(a: Art):
    """The first page's shouting headline in heavy red capitals with a black drop shadow: AMAZING! FOUR
    BARRELS FROM ONE LINE!, and a small italic line under it."""
    headline(a, 20, 66, "AMAZING! FOUR BARRELS FROM ONE LINE!", 52, 960)
    a.line(560, 82, 980, 82, stroke=RED, stroke_width=4)
    a.line(600, 90, 980, 90, stroke=INK, stroke_width=1.5)
    kit.label(a, 22, 104, "Route it yourself. Every valve a choice.", size=22, family="serif", fill=INK,
              font_style="italic")


@asset(G, f"{M}-headline-2", group="documents", title="Headline: NEW! NOW WITH A FIFTH OUTLET!", w=1000, h=120,
       row=kit.row(M, "The advert page, headlines and coupon"))
def headline_2(a: Art):
    """The second page's headline, chapter 9: NEW! NOW WITH A FIFTH OUTLET! in red capitals, a starburst
    behind NEW!, and a small italic line: Capped at the factory. Yours to decide."""
    a.path(kit.star_d(70, 52, 64, 44, n=14), fill=kit.GOLD, stroke=INK, stroke_width=3)
    kit.label(a, 70, 64, "NEW!", size=34, anchor="middle", fill=RED, font_weight="bold")
    headline(a, 150, 66, "NOW WITH A FIFTH OUTLET!", 52, 830)
    kit.label(a, 152, 104, "Capped at the factory. Yours to decide.", size=22, family="serif", fill=INK,
              font_style="italic")


@asset(G, f"{M}-gauntlet", group="pieces", title="The gauntlet: spine, line and numbered callouts", w=1000, h=260,
       row=kit.row(M, "The gauntlet, valves, barrels and the fifth outlet"))
def gauntlet(a: Art):
    """The gauntlet laid out like a product shot: a matte black forearm piece, the clear line in from the
    wrist shunt at the left carrying a dark red core, the manifold pipe along the spine with six empty
    valve sockets, and above each a gold callout circle numbered 1 to 6 with a leader line; a stub at the
    right end for the fifth outlet."""
    a.rect(100, 90, 790, 130, rx=40, fill=BODY, stroke=INK, stroke_width=5)
    for k in range(5):
        a.line(180 + k * 150, 96, 170 + k * 150, 214, stroke="#3a3a3a", stroke_width=3)
    a.path("M0,150 C40,150 70,150 110,150", fill="none", stroke=TUBE, stroke_width=18)
    a.path("M0,150 C40,150 70,150 110,150", fill="none", stroke=kit.BLOOD2, stroke_width=7)
    a.circle(18, 150, 16, fill="#3a3a3a", stroke=INK, stroke_width=3)
    a.line(110, 150, 900, 150, stroke=TUBE, stroke_width=20)
    a.line(110, 150, 900, 150, stroke=kit.BLOOD2, stroke_width=6, opacity=0.7)
    a.rect(896, 132, 30, 36, fill="#3a3a3a", stroke=INK, stroke_width=3)
    for k, vx in enumerate(VALVES):
        a.circle(vx, 150, 30, fill="#3a3a3a", stroke=INK, stroke_width=4)
        a.line(vx, 180, vx, 222, stroke=TUBE, stroke_width=10)
        a.line(vx, 74, vx, 118, stroke=INK, stroke_width=2)
        a.circle(vx, 50, 24, fill=kit.GOLD, stroke=INK, stroke_width=3)
        kit.label(a, vx, 60, str(k + 1), size=28, anchor="middle", font_weight="bold")


def valve(a, angle, label_text):
    a.circle(40, 34, 27, fill="#e9e3cf", stroke=INK, stroke_width=4)
    a.open("g", transform=f"rotate({angle} 40 34)")
    a.rect(17, 28, 46, 12, rx=6, fill=INK)
    a.circle(40, 34, 5, fill=kit.GOLD)
    a.close()
    kit.label(a, 40, 77, label_text, size=11, anchor="middle", font_weight="bold", letter_spacing="1")


@asset(G, f"{M}-valve-shut", group="pieces", title="Valve: shut", w=80, h=80,
       row=kit.row(M, "The gauntlet, valves, barrels and the fifth outlet"))
def valve_shut(a: Art):
    """A valve wheel in the advert's flat style, handle across the pipe: shut."""
    valve(a, 90, "SHUT")


@asset(G, f"{M}-valve-half", group="pieces", title="Valve: half", w=80, h=80,
       row=kit.row(M, "The gauntlet, valves, barrels and the fifth outlet"))
def valve_half(a: Art):
    """A valve wheel with its handle at forty-five degrees: half."""
    valve(a, 45, "HALF")


@asset(G, f"{M}-valve-open", group="pieces", title="Valve: open", w=80, h=80,
       row=kit.row(M, "The gauntlet, valves, barrels and the fifth outlet"))
def valve_open(a: Art):
    """A valve wheel with its handle along the pipe: open."""
    valve(a, 0, "OPEN")


@asset(G, f"{M}-barrel", group="pieces", title="A barrel (empty glass, fill marks)", w=80, h=240,
       row=kit.row(M, "The gauntlet, valves, barrels and the fifth outlet"))
def barrel(a: Art):
    """One of the four syringe barrels hanging below the spine, drawn as clear glass with a black cap and
    six fill marks, one per bead it wants; the fill is laid inside it at run time."""
    a.line(40, 0, 40, 30, stroke=TUBE, stroke_width=10)
    a.rect(14, 30, 52, 22, rx=4, fill=BODY, stroke=INK, stroke_width=3)
    a.rect(18, 52, 44, 160, rx=6, fill="#f5f8f8", opacity=0.75, stroke=INK, stroke_width=3)
    for k in range(1, 7):
        y = 212 - k * 26
        a.line(18, y, 30, y, stroke=INK, stroke_width=2)
        kit.label(a, 66, y + 4, str(k), size=10, fill=INK)
    a.path("M34,212 L46,212 L40,236Z", fill=BODY, stroke=INK, stroke_width=2)
    a.line(26, 60, 26, 200, stroke="#ffffff", stroke_width=3, opacity=0.8)


@asset(G, f"{M}-bead", group="pieces", title="A bead of flow", w=32, h=32,
       row=kit.row(M, "The gauntlet, valves, barrels and the fifth outlet"))
def bead(a: Art):
    """A bead of flow, the page's invented unit: a dark red round with a black keyline and a printed
    white highlight."""
    a.circle(16, 16, 12, fill=kit.BLOOD2, stroke=INK, stroke_width=2.5)
    a.circle(12, 12, 3, fill="#ffffff", opacity=0.7)
    a.circle(16, 16, 7, fill="#6a1a20", opacity=0.6)
    a.path("M8,22 C12,26 20,26 24,22", fill="none", stroke=INK, stroke_width=1, opacity=0.5)
    a.circle(22, 10, 1, fill="#ffffff", opacity=0.6)


@asset(G, f"{M}-outlet-capped", group="pieces", title="The fifth outlet, capped", w=140, h=80,
       row=kit.row(M, "The gauntlet, valves, barrels and the fifth outlet"))
def outlet_capped(a: Art):
    """The fifth outlet at the end of the spine with a heavy gray cap screwed on and CAPPED stencilled
    under it."""
    a.line(0, 34, 70, 34, stroke=TUBE, stroke_width=18)
    a.rect(64, 12, 50, 44, rx=4, fill="#777", stroke=INK, stroke_width=4)
    for k in range(4):
        a.line(72 + k * 10, 14, 72 + k * 10, 54, stroke=INK, stroke_width=1.5)
    kit.label(a, 70, 76, "CAPPED", size=16, anchor="middle", font_weight="bold", letter_spacing="2")


@asset(G, f"{M}-outlet-open", group="pieces", title="The fifth outlet, routed (the resin line)", w=140, h=80,
       row=kit.row(M, "The gauntlet, valves, barrels and the fifth outlet"))
def outlet_open(a: Art):
    """The fifth outlet routed: the cap off and a short clear line leading away out of frame, a dark red
    core in it; where it goes is not shown."""
    a.line(0, 34, 70, 34, stroke=TUBE, stroke_width=18)
    a.line(0, 34, 70, 34, stroke=kit.BLOOD2, stroke_width=6)
    a.path("M70,34 C100,34 110,40 140,58", fill="none", stroke=TUBE, stroke_width=12)
    a.path("M70,34 C100,34 110,40 140,58", fill="none", stroke=kit.BLOOD2, stroke_width=4)
    a.rect(62, 20, 14, 28, fill="#3a3a3a", stroke=INK, stroke_width=3)
    kit.label(a, 40, 76, "ROUTED", size=16, anchor="middle", font_weight="bold", letter_spacing="2", fill=RED)


@asset(G, f"{M}-coupon", group="documents", title="The coupon corner: PULSE PER DART", w=360, h=200,
       row=kit.row(M, "The advert page, headlines and coupon"))
def coupon(a: Art):
    """The clip-out coupon in the corner: a dashed border with a scissors mark, PULSE PER DART in bold, a
    blank box for the number this routing costs, and fill-in lines below it like an order form."""
    a.rect(8, 8, 344, 184, fill="#fffaf0", stroke=INK, stroke_width=3, stroke_dasharray="10 7")
    a.path("M2,30 l14,-6 l-4,12 M2,18 l14,6", fill="none", stroke=INK, stroke_width=2)
    kit.label(a, 28, 46, "PULSE PER DART", size=26, font_weight="bold", fit=300)
    a.rect(28, 62, 140, 80, fill="#ffffff", stroke=INK, stroke_width=2.5)
    for k, t in enumerate(("NAME", "ADDRESS", "")):
        y = 84 + k * 28
        if t:
            kit.label(a, 184, y - 4, t, size=11, family="serif")
        a.line(184, y + 4, 330, y + 4, stroke=INK, stroke_width=1.2)
    kit.label(a, 28, 178, "Exact routing: +6.  Mail no money.", size=15, family="serif", font_style="italic")


@asset(G, f"{M}-backpressure", group="pieces", title="Starburst: BACK-PRESSURE!", w=260, h=180,
       row=kit.row(M, "Starbursts"))
def backpressure(a: Art):
    """A red starburst lettered BACK-PRESSURE! in white capitals with a black keyline, the advert's way of
    showing flow that meets a shut valve with nowhere to go."""
    a.path(kit.star_d(130, 90, 124, 74, n=16), fill=RED, stroke=INK, stroke_width=4)
    a.path(kit.star_d(130, 90, 108, 70, n=16, rot=-80), fill="none", stroke=kit.GOLD, stroke_width=2)
    for x1, y1, x2, y2 in ((4, 30, 22, 40), (2, 150, 20, 140), (238, 24, 256, 14), (240, 160, 256, 172)):
        a.line(x1, y1, x2, y2, stroke=INK, stroke_width=3, stroke_linecap="round")
    kit.label(a, 130, 84, "BACK-", size=30, anchor="middle", fill="#ffffff", font_weight="bold")
    kit.label(a, 130, 116, "PRESSURE!", size=30, anchor="middle", fill="#ffffff", font_weight="bold", fit=150)


@asset(G, f"{M}-burst", group="pieces", title="Starburst (blank, for a number or a cry)", w=200, h=200,
       row=kit.row(M, "Starbursts"))
def burst(a: Art):
    """A blank gold starburst with a red inner ring, the advert's exclamation; a number or a word is set
    in its middle at run time (a test draw, the confirmed routing)."""
    a.path(kit.star_d(100, 100, 94, 66, n=18), fill=kit.GOLD, stroke=INK, stroke_width=4)
    a.circle(100, 100, 54, fill="#fffaf0", stroke=RED, stroke_width=4)
    a.circle(100, 100, 46, fill="none", stroke=INK, stroke_width=1.5, stroke_dasharray="4 3")
    for k in range(4):
        a.line(30 + k * 6, 20 + k * 4, 40 + k * 6, 30 + k * 4, stroke=INK, stroke_width=2)

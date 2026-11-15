"""Title lettering, the eight cast marks, the HUD ornaments and the two thread objects."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW_T = "Title lettering, carved, with a ring counter"
ROW_M = "Cast marks (silhouette glyphs)"
ROW_U = "UI ornaments: Rope, season wheel, bark-song crack, frames, sigils"


# ---------------------------------------------------------------------------------------------
# title
# ---------------------------------------------------------------------------------------------
@asset(G, "title-lettering", group="title", title="People of the Bark: carved title", w=1600, h=500, row=ROW_T)
def title(a: Art):
    """The game's name cut deep into lit bark, lichen growing in the cuts, with the ring counter beside it:
    seven growth rings round a pith, one for each chapter, and Twig's kite on its thread above the last
    letter."""
    kit.bark(a, base="#9a7150", scale=11, freq=(0.016, 0.003))
    a.rect(0, 0, a.w, a.h, fill="#1b120c", opacity=0.3)
    kit.fissures(a, 0, 0, a.w, a.h, n=9, opacity=0.7)
    kit.glow(a, 250, 300, 420, kit.LANTERN, 0.5)
    # ring counter
    a.circle(252, 252, 176, fill="#000", opacity=0.28)
    a.circle(250, 250, 172, fill="#caa173", filter=kit.bark_fx(a, freq=(0.02, 0.02), scale=4, octaves=3))
    kit.rings(a, 250, 250, 7, r0=24, gap=21, width=5, lit_last=kit.GOLD)
    a.path("M250,250 L250,60", stroke=kit.CRACK, stroke_width=5, stroke_linecap="round")
    a.path("M250,250 L250,60", stroke=kit.GOLD, stroke_width=1.2)
    a.circle(250, 250, 172, fill="none", stroke=kit.CRACK, stroke_width=7)
    for i in range(7):
        ang = -math.pi / 2 + (i + 1) * 0.32
        a.circle(250 + 196 * math.cos(ang), 250 + 196 * math.sin(ang), 5, fill=kit.GOLD if i < 1 else kit.CRACK,
                 stroke=kit.GOLD, stroke_width=1.2)
    # lettering
    rough = a.roughen(3.2, 0.035)

    def cut(x, y, s, size, tl):
        kw = dict(size=size, family="serif", font_weight="bold", textLength=tl, lengthAdjust="spacingAndGlyphs")
        a.open("g", filter=rough)
        a.text(x + 5, y + 5, s, fill="#f2c48c", opacity=0.8, **kw)
        a.text(x - 2, y - 3, s, fill="#000", opacity=0.6, **kw)
        a.text(x, y, s, fill="#150d08", **kw)
        a.close()
        cp = a.clip(f'<text x="{x}" y="{y}" font-size="{size}" font-family="serif" font-weight="bold" '
                    f'textLength="{tl}" lengthAdjust="spacingAndGlyphs">{s}</text>')
        a.open("g", clip_path=cp)
        a.rect(x, y - size * 0.25, tl, size * 0.3, fill=a.gradient([(0, "#e8742a"), (1, "#e8742a")]), opacity=0.22)
        a.stipple(x, y - size * 0.3, tl, size * 0.34, n=int(tl * 0.5), r=(1.2, 3.4), fill=kit.LIME, opacity=0.8)
        a.stipple(x, y - size * 0.2, tl, size * 0.24, n=int(tl * 0.3), r=(1, 2.6), fill=kit.SAGE, opacity=0.9)
        a.close()
    cut(520, 170, "PEOPLE OF THE", 104, 900)
    cut(505, 430, "BARK", 300, 930)
    # lanterns in the furrows and the kite
    for x, y in ((478, 120), (1470, 215), (1040, 208), (700, 222), (1500, 420)):
        kit.lantern(a, x, y, 0.9, halo=46)
    kit.kite(a, 1492, 62, 1.6, string_to=(1420, 196))
    kit.dust(a, 0, 0, a.w, a.h, n=260, opacity=0.35)
    a.vignette(0.75)


# ---------------------------------------------------------------------------------------------
# cast marks
# ---------------------------------------------------------------------------------------------
def mark_ground(a, accent):
    a.circle(120, 120, 116, fill=kit.CRACK)
    a.circle(120, 120, 108, fill=kit.PAPER, filter=kit.bark_fx(a, light="#fff4dc", freq=(0.5, 0.06), scale=1.6,
                                                               octaves=2, el=60))
    a.circle(120, 120, 108, fill="none", stroke=kit.INK, stroke_width=2)
    a.circle(120, 120, 98, fill="none", stroke=accent, stroke_width=2.5, stroke_dasharray="2 7",
             stroke_linecap="round")
    a.path("M40,196 Q120,182 200,196", fill="none", stroke=kit.INK, stroke_width=3, stroke_linecap="round")


def _mossa(a):
    kit.person(a, 112, 196, 1.5, kind="plain", lean=14, stride=13, arms=((-20, -52), (18, -58)), sil=kit.INK)
    a.open("g", transform="translate(112 196) rotate(14) scale(1.5)")
    kit.scarf(a, kit.RUBRIC, kit.INK, long=44)
    a.close()
    for i in range(3):
        a.line(34 + i * 6, 150 + i * 14, 62 + i * 6, 150 + i * 14, stroke=kit.INK, stroke_width=2, opacity=0.5,
               stroke_linecap="round")


def _pell(a):
    def ex(b):
        kit.cane(b, 19, -58, kit.INK)
        b.rect(-27, -56, 12, 17, fill=kit.GOLD, stroke=kit.INK, stroke_width=1, transform="rotate(-12 -21 -48)")
        b.path("M-28,-50 l3,1 M-28,-46 l3,1", stroke=kit.INK, stroke_width=1)
    kit.person(a, 118, 198, 1.55, kind="robe", lean=7, arms=((-17, -46), (18, -50)), sil=kit.INK, extra=ex)


def _burr(a):
    def ex(b):
        kit.spear(b, 21, -114, kit.INK, tip=kit.PAPER)
    kit.person(a, 112, 198, 1.5, kind="plate", arms=((-15, -44), (20, -56)), stride=7, sil=kit.INK, extra=ex,
               crest=kit.LANTERN)
    a.open("g", transform="translate(112 198) scale(1.5)")
    a.path("M-6,-98 Q4,-120 22,-110 Q10,-108 6,-97Z", fill=kit.LANTERN, stroke=kit.INK, stroke_width=1)
    a.close()


def _fenn(a):
    def ex(b):
        b.path("M-9,-67 L8,-44", stroke=kit.PAPER, stroke_width=1.5)
        b.rect(4, -48, 16, 13, rx=2, fill=kit.AMBER, stroke=kit.INK, stroke_width=1)
        b.path("M-19,-62 Q-28,-80 -22,-96 Q-17,-80 -19,-62Z", fill=kit.PAPER, stroke=kit.INK, stroke_width=1)
    kit.person(a, 122, 198, 1.5, kind="apron", lean=-4, arms=((-19, -62), (12, -44)), sil=kit.INK, extra=ex)
    a.path("M40,84 l8,-10 l8,20 l8,-20 l8,10", fill="none", stroke=kit.RUBRIC, stroke_width=2.5, stroke_linejoin="round")


def _resin(a):
    def ex(b):
        b.line(20, -44, 26, -96, stroke=kit.INK, stroke_width=2.4, stroke_linecap="round")
        b.path("M17,-100 a9,8 0 0,0 18,0Z", fill=kit.AMBER, stroke=kit.INK, stroke_width=1.2)
        b.path("M-12,-38 L12,-38 L14,-14 Q0,-10 -14,-14Z", fill=kit.INK)
    kit.person(a, 110, 198, 1.42, kind="plain", lean=-3, arms=((-16, -40), (20, -46)), stride=6, sil=kit.INK, extra=ex)
    a.path("M146,48 q-6,-8 0,-16 M158,52 q6,-9 0,-18", fill="none", stroke=kit.AMBER, stroke_width=2.2,
           stroke_linecap="round")


def _twig(a):
    kit.person(a, 96, 198, 1.02, kind="plain", lean=-6, arms=((-12, -44), (16, -84)), stride=8, sil=kit.INK)
    kit.kite(a, 160, 62, 2.0, col=kit.LIME, string_to=(112, 114))
    a.path("M163,90 q8,10 -2,20 q-8,10 4,20", fill="none", stroke=kit.INK, stroke_width=1.3)


def _hollow(a):
    kit.person(a, 120, 200, 1.5, kind="robe", arms=((-26, -88), (26, -88)), sil=kit.INK)
    for i, rr in enumerate((26, 40, 54)):
        a.path(f"M{120 - rr},{62 - i * 2} A{rr},{rr} 0 0,1 {120 + rr},{62 - i * 2}", fill="none", stroke=kit.GOLD,
               stroke_width=3 - i * 0.6, stroke_linecap="round", opacity=1 - i * 0.22)


def _sorrel(a):
    a.rect(150, 30, 60, 172, fill=kit.INK, clip_path=a.clip('<circle cx="120" cy="120" r="106"/>'))

    def ex(b):
        b.line(-18, -40, -30, -66, stroke=kit.INK, stroke_width=2.4, stroke_linecap="round")
        b.rect(-38, -74, 14, 9, rx=2, fill=kit.INK, transform="rotate(-25 -31 -70)")
    kit.person(a, 122, 198, 1.48, kind="plain", lean=11, arms=((-18, -40), (17, -70)), stride=7, sil=kit.INK, extra=ex)
    for i in range(5):
        a.path(f"M{166 + (i % 2) * 10},{70 + i * 20} l10,-5 l-3,9 l11,-4", fill="none", stroke=kit.CHALK,
               stroke_width=2.2, stroke_linecap="round", stroke_linejoin="round")


CAST = [
    ("mossa", "Mossa, the messenger", kit.RUBRIC, _mossa, "Mossa running, leaning into it, her long red scarf streaming behind."),
    ("pell", "Elder Pell", kit.GOLD, _pell, "Elder Pell, hooded, on his cane, one notched card held out at arm's length."),
    ("burr", "Captain Burr", kit.LANTERN, _burr, "Captain Burr at attention with his polished spear, the orange crest on his helmet."),
    ("fenn", "Fenn of the Scroll House", kit.RUBRIC, _fenn, "Fenn with her satchel, a quill lifted, and the tremor glyph she draws in every margin."),
    ("resin", "Old Resin", kit.AMBER, _resin, "Old Resin in her apron, raising a ladle of sap to taste it."),
    ("twig", "Twig", kit.LIME, _twig, "Twig, small, one arm up on the thread of a bark-flake kite."),
    ("hollow", "Chanter Hollow", kit.GOLD, _hollow, "Chanter Hollow, robed, both arms raised, the chant ringing out above him."),
    ("sorrel", "Sorrel, wall-listener of Lowridge", kit.CHALK, _sorrel, "Sorrel with her tapping mallet, ear laid to a wall that ticks back in cold chalk grey."),
]
for key, name, accent, fn, doc in CAST:
    def _mk(fn=fn, accent=accent, doc=doc):
        def draw(a: Art):
            mark_ground(a, accent)
            fn(a)
        draw.__doc__ = "Cast mark, an ink silhouette on a bark-paper roundel. " + doc
        return draw
    asset(G, f"mark-{key}", group="figures", title=f"Cast mark: {name}", w=240, h=240, row=ROW_M)(_mk())


# ---------------------------------------------------------------------------------------------
# HUD ornaments
# ---------------------------------------------------------------------------------------------
@asset(G, "ui-balance-rope", group="ui", title="The Balance Rope", w=200, h=640, row=ROW_U)
def ui_rope(a: Art):
    """The Balance Rope: three twisted strands, gold for the Eye, red for the Spear and blue for the Quill,
    hung from a carved peg with the three sigils above, and the knot that marks a twelve-point lead."""
    cols = [kit.GOLD, kit.RUBRIC, kit.AZURE]
    a.rect(30, 20, 140, 70, rx=10, fill="#a67c56", filter=kit.bark_fx(a, scale=5), stroke=kit.CRACK, stroke_width=3)
    for k, sg in enumerate(kit.SIGILS):
        kit.sigil(a, sg, 60 + k * 40, 56, 0.62, col=kit.PAPER, w=2.2)
    for k in range(3):
        for under in (True, False):
            d = ""
            for i in range(100):
                y = 92 + i * 5
                x = 100 + 13 * math.sin(i * 0.26 + k * 2.094)
                d += ("M" if i == 0 else "L") + f"{f(x)},{f(y)}"
            a.path(d, fill="none", stroke=kit.CRACK if under else cols[k], stroke_width=11 if under else 7.5,
                   stroke_linecap="round")
    # the lead knot
    a.ellipse(100, 300, 26, 17, fill=kit.GOLD, stroke=kit.CRACK, stroke_width=3)
    a.path("M78,296 Q100,284 122,296 M80,306 Q100,316 120,306", fill="none", stroke=kit.CRACK, stroke_width=2)
    for k in range(3):
        x = 82 + k * 18
        a.path(f"M{x},586 q-4,22 2,40 M{x + 5},586 q4,20 -1,38", fill="none", stroke=cols[k], stroke_width=3,
               stroke_linecap="round")
    for i in range(13):
        a.line(148, 110 + i * 38, 160 if i % 4 else 170, 110 + i * 38, stroke=kit.PAPER, stroke_width=2, opacity=0.8)


@asset(G, "ui-season-wheel", group="ui", title="Season wheel", w=400, h=400, row=ROW_U)
def ui_wheel(a: Art):
    """The season wheel: a slice of knot wood quartered into spring, summer, autumn and winter, each with its
    own mark, the year's turn dark at the top, and a splinter pointer resting on autumn."""
    cx = cy = 200
    a.circle(cx, cy + 4, 190, fill="#000", opacity=0.35)
    a.circle(cx, cy, 186, fill="#b08a62", filter=kit.bark_fx(a, freq=(0.03, 0.03), scale=4, octaves=3))
    tints = [kit.LIME, kit.GOLD, kit.LANTERN, kit.PAPER]
    for q in range(4):
        a0 = -math.pi / 2 + 0.3 + q * (2 * math.pi - 0.6) / 4
        a1 = a0 + (2 * math.pi - 0.6) / 4
        pts = [(cx + 178 * math.cos(a0 + (a1 - a0) * i / 16), cy + 178 * math.sin(a0 + (a1 - a0) * i / 16)) for i in range(17)]
        pts += [(cx + 70 * math.cos(a1 - (a1 - a0) * i / 16), cy + 70 * math.sin(a1 - (a1 - a0) * i / 16)) for i in range(17)]
        a.poly(pts, fill=tints[q], opacity=0.42, stroke=kit.CRACK, stroke_width=2.5)
        am = (a0 + a1) / 2
        mx, my = cx + 132 * math.cos(am), cy + 132 * math.sin(am)
        if q == 0:      # a rain bead on a sprout
            kit.suit_mark(a, "rain", mx, my - 6, 1.5, col=kit.AZURE)
            a.path(f"M{f(mx - 14)},{f(my + 22)} q14,-14 28,0", fill="none", stroke=kit.CRACK, stroke_width=3)
        elif q == 1:    # a high sun
            a.circle(mx, my, 13, fill=kit.GOLD, stroke=kit.CRACK, stroke_width=2.5)
            for i in range(8):
                t = i * math.pi / 4
                a.line(mx + 19 * math.cos(t), my + 19 * math.sin(t), mx + 28 * math.cos(t), my + 28 * math.sin(t),
                       stroke=kit.CRACK, stroke_width=3, stroke_linecap="round")
        elif q == 2:    # a falling leaf
            kit.suit_mark(a, "leaf", mx, my, 1.9, col=kit.LANTERN)
        else:           # frost
            kit.alch_symbol(a, "frost", mx, my, 1.25, col=kit.CRACK, w=3)
    # the Shadow's wedge
    pts = [(cx + 178 * math.cos(-math.pi / 2 - 0.3 + 0.6 * i / 8), cy + 178 * math.sin(-math.pi / 2 - 0.3 + 0.6 * i / 8)) for i in range(9)]
    pts += [(cx + 70 * math.cos(-math.pi / 2 + 0.3 - 0.6 * i / 8), cy + 70 * math.sin(-math.pi / 2 + 0.3 - 0.6 * i / 8)) for i in range(9)]
    a.poly(pts, fill=kit.CRACK, opacity=0.92, stroke=kit.CRACK, stroke_width=2.5)
    for i in range(5):
        a.line(cx - 20 + i * 10, 40, cx - 26 + i * 13, 16 + abs(i - 2) * 5, stroke=kit.GREYBROWN, stroke_width=5,
               stroke_linecap="round")
    a.circle(cx, cy, 68, fill=kit.UMBER_D, stroke=kit.CRACK, stroke_width=3)
    kit.rings(a, cx, cy, 5, r0=10, gap=11, width=2.6, stroke=kit.CRACK, light="#c99a6a")
    # pointer on autumn
    ang = -math.pi / 2 + 0.3 + 2.5 * (2 * math.pi - 0.6) / 4
    a.open("g", transform=f"rotate({f(math.degrees(ang))} {cx} {cy})")
    a.poly([(cx - 8, cy - 7), (cx + 96, cy), (cx - 8, cy + 7)], fill=kit.PAPER, stroke=kit.CRACK, stroke_width=2.5)
    a.close()
    a.circle(cx, cy, 9, fill=kit.GOLD, stroke=kit.CRACK, stroke_width=2.5)
    a.circle(cx, cy, 186, fill="none", stroke=kit.CRACK, stroke_width=6)


@asset(G, "ui-bark-song", group="ui", title="Bark-song crack", w=1200, h=140, row=ROW_U)
def ui_song(a: Art):
    """The bark-song: a thin crack along the foot of the screen that widens from left to right as the bark's
    integrity falls, glowing at the two marks where the bark groans (40) and where a plate gives (25)."""
    kit.bark(a, base="#9a7150", scale=7)
    a.rect(0, 0, a.w, a.h, fill="#1b120c", opacity=0.35)
    r = a.rng
    top, bot = [], []
    for i in range(61):
        x = i * 20
        wdt = 1 + 26 * (i / 60) ** 1.8
        c = 70 + r.uniform(-7, 7)
        top.append((x, c - wdt / 2 - r.uniform(0, 3)))
        bot.append((x, c + wdt / 2 + r.uniform(0, 3)))
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in top + bot[::-1]) + "Z"
    for gx in (720, 900):
        kit.glow(a, gx, 70, 90, kit.LANTERN, 0.8)
    a.path(d, fill="#f2c48c", opacity=0.5, transform="translate(2 3)")
    a.path(d, fill="#0d0805")
    for gx, lab in ((720, "40"), (900, "25")):
        a.poly([(gx - 9, 16), (gx + 9, 16), (gx, 34)], fill=kit.GOLD, stroke=kit.CRACK, stroke_width=1.5)
        a.poly([(gx - 9, 124), (gx + 9, 124), (gx, 106)], fill=kit.GOLD, stroke=kit.CRACK, stroke_width=1.5)
        a.text(gx + 16, 30, lab, size=18, family="serif", fill=kit.GOLD, font_weight="bold")
    for i in range(14):
        x = 980 + r.uniform(0, 200)
        a.line(x, 70 + r.uniform(-14, 14), x + r.uniform(-18, 18), 70 + r.choice([-1, 1]) * r.uniform(24, 46),
               stroke="#0d0805", stroke_width=r.uniform(1, 2.4), stroke_linecap="round")
    kit.dust(a, 900, 0, 300, 140, n=60, opacity=0.5)


def _frame_knots(a, x0, y0, x1, y1, col):
    for (ax, ay), (bx, by) in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        kit.plait(a, ax, ay, bx, by, col, w=5, period=30, amp=5)


@asset(G, "ui-frame-bark", group="ui", title="Carved-bark frame", w=800, h=600, row=ROW_U)
def ui_frame_bark(a: Art):
    """A carved-bark panel frame for the 3D HUD: a furrowed border with a lichen-green plait cut into it, a
    lantern at each upper corner and a dark, empty field for the panel's contents."""
    kit.bark(a, base="#a67c56", scale=9)
    a.rect(0, 0, a.w, a.h, fill="none", stroke=kit.CRACK, stroke_width=10)
    a.rect(64, 64, a.w - 128, a.h - 128, rx=14, fill="#f2c48c", opacity=0.5, transform="translate(3 3)")
    a.rect(64, 64, a.w - 128, a.h - 128, rx=14, fill="#140d08")
    a.rect(64, 64, a.w - 128, a.h - 128, rx=14, fill=a.radial([(0, kit.UMBER, 0.55), (1, kit.UMBER, 0)]))
    _frame_knots(a, 34, 34, a.w - 34, a.h - 34, kit.SAGE)
    for x in (34, a.w - 34):
        kit.lantern(a, x, 34, 1.3, halo=70)
        a.circle(x, a.h - 34, 9, fill=kit.CRACK, stroke=kit.SAGE, stroke_width=3)
    kit.dust(a, 64, 64, a.w - 128, 200, n=50, opacity=0.25)


@asset(G, "ui-frame-paper", group="ui", title="Bark-paper page frame", w=800, h=600, row=ROW_U)
def ui_frame_paper(a: Art):
    """A bark-paper page frame for the 1D pages: a double rule in red and brown ink, gold bezants along the
    head, vines climbing both margins, a sap stain, and a snail crossing the foot."""
    kit.bark_paper(a, vig=0.4)
    kit.stain(a, 640, 470, 90)
    kit.stain(a, 610, 440, 40, opacity=0.12)
    kit.double_rule(a, 70, 54, 660, 480, gap=7)
    for i in range(14):
        a.circle(100 + i * 46, 36, 6, fill=kit.GOLD, stroke=kit.INK, stroke_width=1)
    for x0 in (36, 764):
        kit.vine(a, [(x0 + 12 * math.sin(i * 1.1 + x0), 50 + i * 50) for i in range(11)], curl=0.9)
    kit.vine(a, [(90 + i * 62, 566 + 6 * math.sin(i * 1.4)) for i in range(11)], curl=0.8)
    kit.snail(a, 610, 560, 0.62)


@asset(G, "ui-divider", group="ui", title="Divider: the Long Crack", w=600, h=120, row=ROW_U)
def ui_divider(a: Art):
    """A divider: the Long Crack drawn as one inked line with a ring counter at its centre, a lantern bead at
    each end, and a vine leaf either side."""
    kit.bark_paper(a, vig=0)
    r = a.rng
    for x0, x1 in ((30, 252), (348, 570)):
        pts = [(x0 + (x1 - x0) * i / 9, 60 + r.uniform(-5, 5)) for i in range(10)]
        a.path(a.smooth_d(pts), fill="none", stroke=kit.INK, stroke_width=3, stroke_linecap="round")
        a.path(a.smooth_d([(x, y + 4) for x, y in pts[2:8]]), fill="none", stroke=kit.RUBRIC, stroke_width=1.2)
    kit.rings(a, 300, 60, 4, r0=8, gap=9, width=2.2, stroke=kit.INK, light=kit.PAPER_D)
    for x in (30, 570):
        a.circle(x, 60, 8, fill=kit.GOLD, stroke=kit.INK, stroke_width=1.5)
    for x, sg in ((150, 1), (450, -1)):
        a.path(f"M{x},58 q{sg * 10},-26 {sg * 30},-22 q{-sg * 4},20 {-sg * 30},22Z", fill=kit.LEAF, stroke=kit.INK,
               stroke_width=1.2)


def _token(a, col):
    a.circle(80, 83, 72, fill="#000", opacity=0.3)
    a.circle(80, 80, 72, fill="#b08a62", filter=kit.bark_fx(a, freq=(0.04, 0.012), scale=5))
    a.circle(80, 80, 72, fill="none", stroke=kit.CRACK, stroke_width=4)
    a.circle(80, 80, 61, fill=col, opacity=0.9, stroke=kit.CRACK, stroke_width=2)
    a.circle(80, 80, 61, fill=a.radial([(0, "#fff6dc", 0.35), (1, "#000000", 0.25)], cx=0.35, cy=0.3, r=0.8))


for sg, col, who in (("eye", kit.GOLD, "the Knot"), ("spear", kit.RUBRIC, "the Battlements"), ("quill", kit.AZURE, "the Scroll House")):
    def _mk(sg=sg, col=col, who=who):
        def draw(a: Art):
            _token(a, col)
            kit.sigil(a, sg, 82, 84 if sg != "eye" else 82, 1.75, col="#000", w=5)
            kit.sigil(a, sg, 80, 82 if sg != "eye" else 80, 1.75, col=kit.PAPER if sg != "eye" else kit.CRACK, w=4.5)
        draw.__doc__ = f"The {sg} sigil of {who}, cut into a bark token and filled with its strand's colour."
        return draw
    asset(G, f"ui-sigil-{sg}", group="ui", title=f"Sigil: {sg} ({who})", w=160, h=160, row=ROW_U)(_mk())


@asset(G, "ui-icon-sap", group="ui", title="Sap jar", w=160, h=160, row=ROW_U)
def ui_sap(a: Art):
    """The sap jar: a round-bellied clay jar two-thirds full of glowing amber sap, one drop on its lip."""
    kit.glow(a, 80, 96, 76, kit.AMBER, 0.55)
    a.path("M56,34 h48 v14 q34,16 34,54 q0,40 -58,40 q-58,0 -58,-40 q0,-38 34,-54Z", fill=kit.UMBER, stroke=kit.CRACK,
           stroke_width=4, stroke_linejoin="round")
    cp = a.clip('<path d="M60,50 q-34,16 -34,52 q0,36 54,36 q54,0 54,-36 q0,-36 -34,-52Z"/>')
    a.rect(20, 84, 120, 70, fill=a.gradient([(0, kit.GOLD), (1, kit.AMBER)]), clip_path=cp)
    a.ellipse(80, 84, 50, 7, fill="#ffe9a8", opacity=0.8, clip_path=cp)
    a.path("M40,98 q-4,18 6,30", fill="none", stroke="#fff6dc", stroke_width=4, stroke_linecap="round", opacity=0.6)
    a.rect(52, 28, 56, 12, rx=5, fill=kit.GREYBROWN, stroke=kit.CRACK, stroke_width=3)
    kit.suit_mark(a, "rain", 110, 56, 0.9, col=kit.AMBER)


@asset(G, "ui-icon-food", group="ui", title="Food basket", w=160, h=160, row=ROW_U)
def ui_food(a: Art):
    """The food basket: a woven lichen-fibre basket holding a loaf, a pollen cake and a sprig of lichen."""
    a.ellipse(80, 140, 62, 9, fill="#000", opacity=0.3)
    a.circle(62, 62, 26, fill=kit.GOLD, stroke=kit.CRACK, stroke_width=3)
    a.stipple(42, 42, 40, 40, n=40, r=(1, 2), fill=kit.AMBER)
    a.path("M70,70 q30,-34 54,-4 q-4,12 -54,4Z", fill="#c99a6a", stroke=kit.CRACK, stroke_width=3)
    a.path("M84,56 l6,8 M98,52 l5,9 M110,56 l3,8", stroke=kit.CRACK, stroke_width=2)
    for dx in (-8, 0, 8):
        a.path(f"M{92 + dx},74 q{dx * 0.5},-22 {dx * 1.6},-34", fill="none", stroke=kit.LEAF, stroke_width=4,
               stroke_linecap="round")
    a.path("M20,74 H140 L126,138 H34Z", fill=kit.AMBER, stroke=kit.CRACK, stroke_width=4, stroke_linejoin="round")
    cp = a.clip('<path d="M20,74 H140 L126,138 H34Z"/>')
    a.hatch(20, 74, 120, 64, angle=40, spacing=11, stroke=kit.UMBER, stroke_width=3, clip=cp)
    a.hatch(20, 74, 120, 64, angle=-40, spacing=11, stroke=kit.CRACK, stroke_width=1.4, clip=cp)
    a.rect(16, 68, 128, 12, rx=6, fill=kit.GOLD, stroke=kit.CRACK, stroke_width=3)


@asset(G, "ui-icon-hands", group="ui", title="Hands", w=160, h=160, row=ROW_U)
def ui_hands(a: Art):
    """Hands: three bark people shoulder to shoulder, a tapper, a carver and a carrier, counted as the city's
    working hands."""
    a.ellipse(80, 146, 66, 8, fill="#000", opacity=0.3)
    kit.person(a, 40, 146, 1.1, cloth=kit.SAGE, arms=((-14, -44), (15, -60)), flip=-1,
               extra=lambda b: b.line(15, -60, 22, -84, stroke=kit.INK, stroke_width=2.4))
    kit.person(a, 120, 146, 1.1, cloth=kit.AMBER, arms=((-14, -42), (14, -62)),
               extra=lambda b: b.rect(8, -78, 16, 14, rx=2, fill=kit.UMBER, stroke=kit.INK, stroke_width=1.2))
    kit.person(a, 80, 150, 1.3, cloth=kit.GREYBROWN, arms=((-15, -42), (15, -42)))


# ---------------------------------------------------------------------------------------------
# thread
# ---------------------------------------------------------------------------------------------
@asset(G, "thread-own", group="thread", title="Thread: a knock answered from the other side of a wall", w=480, h=480)
def thread_own(a: Art):
    """The game's own thread object: a wall of bark seen in section. On the warm side a small figure has just
    knocked and leans in to listen, a lantern at her feet; on the cold side, in thin paper galleries ribbed with
    mud, the same three marks come back in chalk grey. Nothing on that side is shown but its walls."""
    a.rect(0, 0, 480, 480, fill="#1b120c")
    # warm side
    a.rect(0, 0, 250, 480, fill="#8a6344", filter=kit.bark_fx(a, scale=8))
    a.rect(0, 0, 250, 480, fill="#1b120c", opacity=0.45)
    kit.glow(a, 120, 400, 260, kit.LANTERN, 0.8)
    # cold side: galleries
    a.rect(292, 0, 188, 480, fill="#10161a")
    r = a.rng
    for i in range(7):
        y = 30 + i * 66 + r.uniform(-8, 8)
        pts = [(292 + k * 24, y + 14 * math.sin(k * 0.9 + i)) for k in range(9)]
        a.path(a.smooth_d(pts), fill="none", stroke=kit.CHALK, stroke_width=r.uniform(14, 22), opacity=0.16,
               stroke_linecap="round")
        a.path(a.smooth_d([(x, yy - 12) for x, yy in pts]), fill="none", stroke=kit.CHALK, stroke_width=1.2, opacity=0.6)
        a.path(a.smooth_d([(x, yy + 12) for x, yy in pts]), fill="none", stroke=kit.CHALK, stroke_width=1.2, opacity=0.35)
    for i in range(16):
        x = 300 + r.uniform(0, 170)
        a.line(x, 0, x + r.uniform(-10, 10), 480, stroke=kit.CHALK, stroke_width=0.6, opacity=0.18)
    # the wall, in section
    a.rect(250, 0, 42, 480, fill="#6a4a33")
    a.hatch(250, 0, 42, 480, angle=62, spacing=7, stroke="#1b120c", stroke_width=1.3,
            clip=a.clip('<rect x="250" y="0" width="42" height="480"/>'))
    a.line(250, 0, 250, 480, stroke="#f2c48c", stroke_width=2.5)
    a.line(292, 0, 292, 480, stroke=kit.CHALK, stroke_width=2.5)
    # the knock and its answer
    for k in range(3):
        rr = 16 + k * 16
        a.path(f"M250,{250 - rr} A{rr},{rr} 0 0,0 250,{250 + rr}", fill="none", stroke=kit.GOLD, stroke_width=3.2 - k * 0.7,
               opacity=1 - k * 0.22)
        a.path(f"M292,{250 - rr} A{rr},{rr} 0 0,1 292,{250 + rr}", fill="none", stroke=kit.CHALK, stroke_width=3.2 - k * 0.7,
               opacity=1 - k * 0.22)
    for k in range(3):
        a.circle(224, 226 + k * 24, 4, fill=kit.GOLD)
        a.circle(318, 226 + k * 24, 4, fill=kit.CHALK)
    # the plugged door, low down
    a.ellipse(300, 430, 13, 17, fill="#3b4447", stroke=kit.CHALK, stroke_width=1.5)
    a.ellipse(299, 430, 7, 10, fill="#1b2023")
    kit.person(a, 196, 440, 1.75, kind="plain", lean=13, cloth=kit.SAGE, arms=((-12, -42), (19, -66)), stride=8,
               extra=lambda b: (b.line(-12, -42, -24, -62, stroke=kit.INK, stroke_width=2.4, stroke_linecap="round"),
                                b.rect(-33, -70, 14, 9, rx=2, fill=kit.UMBER, stroke=kit.INK, stroke_width=1,
                                       transform="rotate(-25 -26 -66)")))
    kit.lantern(a, 118, 428, 1.3, halo=70)
    kit.dust(a, 0, 200, 250, 280, n=70, opacity=0.5)
    a.vignette(0.6)


@asset(G, "thread-guest", group="thread", title="Thread (guest): a slip that says You're at the far end", w=480, h=480)
def thread_guest(a: Art):
    """The object this game hides for the collection: a runner's slip of bark-paper pinned to the wall of a
    crack with a splinter, lit by one lantern. In a quick hand it says: You're at the far end."""
    kit.bark(a, base="#8a6344", scale=10)
    a.rect(0, 0, 480, 480, fill="#1b120c", opacity=0.4)
    kit.fissures(a, 0, 0, 480, 480, n=4)
    kit.glow(a, 110, 380, 300, kit.LANTERN, 0.7)
    a.open("g", transform="rotate(-6 250 230)")
    a.path("M96,170 L404,160 L410,290 L330,300 L318,292 L92,298Z", fill="#000", opacity=0.4, transform="translate(6 8)")
    a.path("M96,170 L404,160 L410,290 L330,300 L318,292 L92,298Z", fill=kit.PAPER, stroke=kit.INK, stroke_width=1.5,
           filter=a.roughen(2.5, 0.05))
    a.path("M96,170 L404,160 L410,290 L330,300 L318,292 L92,298Z", fill=a.gradient([(0, "#e8742a"), (1, "#e8742a")]),
           opacity=0.12)
    a.line(118, 262, 386, 254, stroke=kit.RUBRIC, stroke_width=1, opacity=0.7)
    a.text(250, 222, "You’re at", size=44, family="cursive", fill=kit.INK, text_anchor="middle", font_style="italic")
    a.text(250, 252 + 22, "the far end", size=44, family="cursive", fill=kit.INK, text_anchor="middle", font_style="italic")
    a.path("M120,188 l8,-10 l8,20 l8,-20 l8,10", fill="none", stroke=kit.RUBRIC, stroke_width=2, stroke_linejoin="round")
    a.close()
    a.poly([(246, 120), (258, 122), (250, 196)], fill="#e6cfa0", stroke=kit.CRACK, stroke_width=1.5)
    a.ellipse(252, 121, 9, 5, fill="#c9a877", stroke=kit.CRACK, stroke_width=1.5)
    kit.lantern(a, 96, 404, 1.5, halo=80)
    kit.dust(a, 0, 150, 480, 330, n=80, opacity=0.45)
    a.vignette(0.7)

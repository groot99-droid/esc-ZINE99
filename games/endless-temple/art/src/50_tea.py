"""Tea Blending: nine jar labels, the cup's five ring states, and six pages of Maudric's pantry ledger."""
import math

from artkit import Art, f, sibling

K = sibling(__file__, "_kit")
HB = sibling(__file__, "_herbs")
ROW_L = "Jar labels (nine herbs) and cup-ring states (5)"
ROW_P = "Ledger pages, front and back, with Maudric's hand"
INK = "#4A3220"
RED = "#A0412B"


def marks(a, cx, y, vals, ink=INK, size=1.0):
    """Depth, length and binding as pips: a filled bar for each point, a red ring for each point below nought."""
    for k, (v, lab) in enumerate(zip(vals, "DLB")):
        x = cx + (k - 1) * 84 * size
        a.path(f"M{f(x - 36 * size)},{f(y - 20 * size)} h{f(72 * size)} v{f(34 * size)} q{f(-36 * size)},{f(12 * size)} "
               f"{f(-72 * size)},0Z", fill="#F8F0DA", stroke=ink, stroke_width=1.4)
        a.text(x - 24 * size, y + 8 * size, lab, size=22 * size, family="serif", fill=ink, font_weight="bold")
        if v == 0:
            a.line(x - 2 * size, y + 1, x + 22 * size, y + 1, stroke=ink, stroke_width=1.2, stroke_dasharray="2 4", opacity=.7)
        for j in range(abs(v)):
            if v > 0:
                a.rect(x - 4 * size + j * 11 * size, y - 12 * size, 7 * size, 22 * size, rx=1.5, fill=ink)
            else:
                a.circle(x + 1 * size + j * 12 * size, y, 4.6 * size, fill="none", stroke=RED, stroke_width=2.2)


def label(a: Art, idx):
    hid, name, d, l, b, tint = HB.HERBS[idx]
    hand_made = hid == "gutter-sand"
    a.rect(0, 0, a.w, a.h, fill="#DCE5DC")                       # the jar's glass behind the label
    a.rect(0, 0, 40, a.h, fill="#fff", opacity=.35)
    a.rect(a.w - 30, 0, 30, a.h, fill="#7A8A80", opacity=.25)
    # the label: an arched nouveau panel
    P = "M22,402 V120 C22,52 80,22 150,22 C220,22 278,52 278,120 V402 Q150,418 22,402Z"
    a.path(P, fill="#F5ECD4" if not hand_made else "#EDE4CC", stroke=INK, stroke_width=3.4, stroke_linejoin="round")
    cl = a.clip(f'<path d="{P}"/>')
    K.grain(a, 0, 0, a.w, a.h, .22, .8, clip=cl)
    if hand_made:
        # the ninth jar is his own: a plain slip, ruled by hand, named in Elaris's upright pen
        a.path("M40,396 V124 C40,70 90,42 150,42 C210,42 260,70 260,124 V396", fill="none", stroke=K.INK2, stroke_width=1.2,
               stroke_dasharray="7 5")
    else:
        a.path("M36,394 V122 C36,66 86,38 150,38 C214,38 264,66 264,122 V394", fill="none", stroke=K.GOLD_D, stroke_width=1.6)
        # whiplash stems up both sides, in the herb's own tint
        for sx, x in ((1, 36), (-1, 264)):
            pts = [(x, 392), (x + sx * 16, 330), (x - sx * 4, 270), (x + sx * 18, 210), (x + sx * 2, 150), (x + sx * 30, 96)]
            K.pen(a, pts, w=5, color=K.SAGE_D, taper=(.05, .5))
            for k in (1, 2, 3, 4):
                ax, ay = pts[k]
                K.leaf(a, ax, ay, 26, -math.pi / 2 + sx * (.9 if k % 2 else 2.2), fill=tint, lw=1.1, wd=.34)
            a.path(f"M{x + sx * 30},96 q{sx * 16},-16 {sx * 6},-28 q{-sx * 10},-6 {-sx * 10},6 q2,8 8,5", fill="none",
                   stroke=K.SAGE_D, stroke_width=2.4, stroke_linecap="round")
    # the picture, in a round window
    a.circle(150, 168, 84, fill="#FBF5E4", stroke=INK, stroke_width=2.2)
    if not hand_made:
        a.circle(150, 168, 92, fill="none", stroke=K.GOLD_D, stroke_width=1.2)
        K.wash(a, K.blob_d(a, 150, 172, 60, 54, jit=.14), tint, .22)
    HB.herb(a, hid, 150, 168, 1.12)
    # the name
    if hand_made:
        a.text(150, 298, "gutter sand", size=34, family="cursive", fill=K.INK, text_anchor="middle", font_style="italic",
               transform="rotate(-2 150 298)")
        a.path("M70,308 q80,8 160,-2", stroke=K.INK, stroke_width=1.4, fill="none")
    else:
        size = 30 if len(name) < 8 else 26 if len(name) < 11 else 24 if len(name) < 13 else 21
        a.path("M40,268 Q150,248 260,268 V312 Q150,330 40,312Z", fill=INK)
        a.path("M46,273 Q150,254 254,273 M46,307 Q150,325 254,307", fill="none", stroke=K.GOLD, stroke_width=1)
        a.text(150, 290 + size * .34, name, size=size, family="serif", fill="#F5ECD4", text_anchor="middle",
               letter_spacing=2 if len(name) < 13 else 1, font_weight="bold")
    marks(a, 150, 356, (d, l, b))
    a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, "#ffffff"), (.2, "#ffffff"), (1, "#3A2A1A")], 0, 0, 1, 0), opacity=.1)


for _i, (_hid, _name, _d, _l, _b, _t) in enumerate(HB.HERBS):
    K.reg(f"label-{_hid}", "pieces", f"Jar label: {_name.title()}", 300, 420, ROW_L,
          f"The apothecary label on the {_name.lower()} jar: the herb drawn in a round window between whiplash stems, its name, "
          f"and its marks for depth {_d}, length {_l} and binding {_b}."
          if _hid != "gutter-sand" else
          "The ninth jar's label, a plain hand-ruled slip: an open book's gutter and the silver sand swept out of it, "
          "named in pen, with its marks for depth 2, length 0 and binding minus 3.", label, _i)


# ---- the cup and its ring ------------------------------------------------------------------------
RINGS = [
    ("clear", "steep 0 to 19", 0.0),
    ("faint", "steep 20 to 39", 0.25),
    ("set", "steep 40 to 59", 0.5),
    ("wide", "steep 60 to 79", 0.75),
    ("stained", "steep 80 and over", 1.0),
]


def table(a, dark=0.0):
    a.rect(0, 0, a.w, a.h, fill="#3B2617")
    d = []
    for k in range(26):
        y = k * 13 + a.rng.uniform(-3, 3)
        d.append(a.smooth_d([(x, y + 5 * math.sin(x / 70 + k * 1.3) + a.rng.uniform(-1.5, 1.5)) for x in range(-10, a.w + 30, 40)]))
    a.path(" ".join(d), fill="none", stroke="#22150B", stroke_width=1.3, opacity=.7)
    a.path(" ".join(d[::3]), fill="none", stroke="#6A4A2C", stroke_width=.8, opacity=.6, transform="translate(0 4)")
    a.ellipse(250, 60, 16, 7, fill="none", stroke="#22150B", stroke_width=1.2, opacity=.7)


def cup_ring(a: Art, idx):
    key, band, t = RINGS[idx]
    table(a)
    cx, cy, r = 160, 164, 74
    # the sunbeam reaches the table less as the habit sets
    if t < 1:
        K.sunbeam(a, -20, -40, 330, 360, 50, 120, K.GOLD_L, .42 * (1 - t))
    # old rings, where the cup was set down before
    for k in range(int(t * 4)):
        ox, oy = [(54, 40), (-46, 52), (40, -50), (-58, -30)][k]
        K.tea_ring(a, cx + ox, cy + oy, r * .93, color="#C59A4A", op=.16 + .05 * k, gap=.4)
    # the steep ring itself: wider and darker with each band
    if t > 0:
        K.tea_ring(a, cx + 3, cy + 4, r * (1.07 + .05 * t), color="#D6A542", op=.3 + .5 * t, wd=3 + 13 * t,
                   gap=.34 * (1 - t))
    if idx == 4:
        a.circle(cx + 3, cy + 4, r * 1.22, fill="none", stroke="#8C5E1E", stroke_width=2, opacity=.7, stroke_dasharray="14 3")
    a.ellipse(cx + 10, cy + 12, r * 1.02, r * .98, fill="#140B05", opacity=.5, filter=a.blur(6))
    K.cup_top(a, cx, cy, r, tea=.95, tea_col=["#9A8A3E", "#94782F", "#8C6A2A", "#7A5420", "#5E3C16"][idx], leaves=5 + idx)
    if idx == 4:
        # three spoons already in the cup, which the player did not add
        for k, ang in enumerate((-50, -15, 22)):
            a.open("g", transform=f"translate({cx} {cy}) rotate({ang})")
            a.path("M-4,-10 L-3,-128 q3,-6 6,0 L4,-10Z", fill=K.STEEL, stroke=K.INK, stroke_width=1.2)
            a.ellipse(0, -8, 9, 13, fill="#C9CED6", stroke=K.INK, stroke_width=1.2, opacity=.8)
            a.close()
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#000", 0), (.55, "#000", 0), (1, "#0A0502", .35 + .45 * t)], .5, .5, .72))


for _i, (_k, _band, _t) in enumerate(RINGS):
    K.reg(f"cup-ring-{_i + 1}-{_k}", "pieces", f"Cup ring, state {_i + 1} ({_band})", 320, 320, ROW_L,
          f"The cup on the walnut table from above, at {_band}: "
          + ["no ring yet, and the sunbeam full across the wood.",
             "a thin broken ring under the foot, the sunbeam a little shorter.",
             "a set ring, an older one beside it, the light withdrawing.",
             "a wide dark ring over three older ones, the wood nearly in shade.",
             "a ring stained deep into the wood, four older ones round it, no sunbeam, and three spoons already in the cup."][_i],
          cup_ring, _i)


# ---- Maudric's pantry ledger ---------------------------------------------------------------------
PAPER = "#E9DEC0"
HANDC = "#3B2A4A"


def ledger_page(a, back=False, no=1):
    """A ruled ledger leaf: feint lines, a red margin, the sewing at the gutter, foxing."""
    W, H = a.w, a.h
    K.page(a, PAPER, g=.26, edge=.45)
    gx = W - 46 if not back else 46          # the gutter side
    mx = 120 if not back else W - 120        # the red margin
    a.path("".join(f"M0,{y}H{W}" for y in range(190, H - 60, 46)), stroke="#8FA0B4", stroke_width=1, opacity=.6, fill="none")
    a.path(f"M{mx},0V{H}M{mx + (4 if not back else -4)},0V{H}", stroke=RED, stroke_width=1, opacity=.6, fill="none")
    a.path(f"M0,150H{W}M0,156H{W}", stroke="#8FA0B4", stroke_width=1.2, opacity=.7, fill="none")
    # the gutter: shadow, sewing holes and thread
    side = 1 if not back else 0
    a.rect(W - 70 if not back else 0, 0, 70, H, fill=a.gradient([(0, "#5A3A1A"), (1, PAPER)], side, 0, 1 - side, 0), opacity=.4)
    for k in range(5):
        y = 140 + k * 205
        a.circle(gx, y, 4, fill="#4A3220", opacity=.8)
        a.path(f"M{gx},{y} v90", stroke="#C9B48A", stroke_width=2.2, opacity=.9)
    # foxing
    for _ in range(9):
        x, y, r = a.rng.uniform(40, W - 40), a.rng.uniform(40, H - 40), a.rng.uniform(4, 16)
        a.path(K.blob_d(a, x, y, r, r * .8, n=7, jit=.3), fill="#A8763A", opacity=a.rng.uniform(.08, .2))
    a.text(W - 110 if back else 86, H - 34, str(no), size=20, family="serif", fill=K.INK2, opacity=.8, text_anchor="middle")
    return mx


def row_y(k):
    return 190 + 46 * k - 8


def p_front1(a):
    """Jars kept, with their three marks."""
    mx = ledger_page(a, False, 3)
    K.hand(a, 150, 126, "Jars kept in the pantry", 42, HANDC)
    for x, lab in ((470, "depth"), (570, "length"), (670, "binding")):
        K.hand(a, x, 180, lab, 24, HANDC, rot=-6, anchor="middle")
    a.path("M420,160V960M520,160V960M620,160V960", stroke="#8FA0B4", stroke_width=1, opacity=.7, fill="none")
    names = ["Mint (base)", "Seer's sprig", "Honeymoss", "Clove-bark", "Dune-vine pith", "Stormcress", "Ember root", "Lamp-ash"]
    for k, (hid, _, d, l, b, _t) in enumerate(HB.HERBS[:8]):
        y = row_y(2 * k + 2)
        HB.herb(a, hid, 74, y - 22, .5)
        K.hand(a, 144, y, names[k], 32, HANDC)
        for x, v in ((470, d), (570, l), (670, b)):
            K.hand(a, x, y, ("−" + str(-v)) if v < 0 else str(v), 34, RED if v < 0 else HANDC, anchor="middle", rot=0)
    K.tea_ring(a, 610, 990, 56, op=.34, gap=.2)


def recipe(a, y, title, spoons, mark, sketch):
    K.hand(a, 150, y, title, 30, HANDC)
    K.hand(a, 176, y + 46, spoons, 30, HANDC)
    K.hand(a, 176, y + 92, f"steep to mark {mark}", 26, K.INK2)
    for k, hid in enumerate(sketch):
        HB.herb(a, hid, 600 + k * 62 - (len(sketch) - 1) * 31, y + 40, .46)


def p_front2(a):
    """Recipes for the first three books."""
    ledger_page(a, False, 5)
    K.hand(a, 150, 126, "What opens a book", 42, HANDC)
    recipe(a, row_y(2), "Depth 3 or more", "sprig, honeymoss, honeymoss", 3, ["seers-sprig", "honeymoss", "honeymoss"])
    recipe(a, row_y(6), "Depth 5, length 4", "sprig, sprig, clove", 3, ["seers-sprig", "seers-sprig", "clove-bark"])
    a.path("M150,%d q200,10 420,-4" % (row_y(9) + 12), stroke=HANDC, stroke_width=1.2, fill="none", opacity=.7)
    recipe(a, row_y(11), "Depth 5, binding 1 or less", "sprig, dune-vine, honeymoss", 3,
           ["seers-sprig", "dune-vine-pith", "honeymoss"])
    K.hand(a, 150, row_y(16), "for long sand, clove... and", 34, HANDC, rot=-3)
    K.hand(a, 150, row_y(17) + 6, "something from the sand itself", 34, HANDC, rot=-3)
    K.tea_ring(a, 150, 250, 50, op=.28, gap=.3)


def p_front3(a):
    """The later recipes, and the last one, left unfinished."""
    ledger_page(a, False, 7)
    recipe(a, row_y(0) - 20, "Depth 7, length 5", "sprig, stormcress, dune-vine", 5, ["seers-sprig", "stormcress", "dune-vine-pith"])
    recipe(a, row_y(4), "Depth 6, length 6, binding 2", "sprig, dune-vine, dune-vine", 4,
           ["seers-sprig", "dune-vine-pith", "dune-vine-pith"])
    y = row_y(9)
    a.path(f"M140,{y - 30} h540", stroke=HANDC, stroke_width=1.6, opacity=.7)
    K.hand(a, 150, y + 30, "For leaving a book that", 38, HANDC, rot=-2)
    K.hand(a, 150, y + 82, "is still going:", 38, HANDC, rot=-2)
    K.hand(a, 190, y + 150, "sprig, and what the", 38, HANDC, rot=-3)
    K.hand(a, 190, y + 202, "book gives back", 38, HANDC, rot=-3)
    # the pen stops; a blot; the rest of the leaf is empty but for a ring
    K.pen(a, [(520, y + 196), (560, y + 200), (640, y + 190)], w=3, color=HANDC, taper=(.1, .8))
    a.path(K.blob_d(a, 652, y + 196, 12, 9, n=9, jit=.4), fill=HANDC, filter=a.roughen(3, .1))
    HB.herb(a, "seers-sprig", 110, y + 160, .5)
    K.sand(a, 60, 960, 680, 70, n=260, r=(.6, 1.7), density=lambda x, yy: max(0, (x - 300) / 440) * ((yy - 960) / 70))
    K.tea_ring(a, 540, 900, 60, op=.36, gap=.15)


def tally(a, x, y, n, col=HANDC, heavy_last=False):
    """n days as five-bar gates."""
    d = []
    for k in range(n):
        g, j = divmod(k, 5)
        gx = x + g * 62
        if j < 4:
            d.append(f"M{f(gx + j * 10 + a.rng.uniform(-1, 1))},{f(y - 30 + a.rng.uniform(-2, 2))}"
                     f"l{f(a.rng.uniform(-2, 2))},{f(30 + a.rng.uniform(-2, 2))}")
        else:
            d.append(f"M{f(gx - 6)},{f(y - 6 + a.rng.uniform(-3, 3))}L{f(gx + 38)},{f(y - 26 + a.rng.uniform(-3, 3))}")
    a.path("".join(d), stroke=col, stroke_width=2.6, stroke_linecap="round", fill="none")
    if heavy_last:
        g, j = divmod(n - 1, 5)
        a.path(f"M{f(x + g * 62 - 8)},{f(y - 4)}L{f(x + g * 62 + 42)},{f(y - 28)}", stroke=col, stroke_width=6, stroke_linecap="round")


def p_back1(a):
    """The back of the ledger: a count of days, one to twenty."""
    ledger_page(a, True, 1)
    for k in range(4):
        y = row_y(2 + k * 4) + 8
        K.hand(a, 90, y, ["five", "ten", "fifteen", "twenty"][k], 30, HANDC, rot=-3)
        tally(a, 300, y, 5 * (k + 1))
    K.tea_ring(a, 520, 250, 52, op=.2, gap=.4)
    # what he was reading, drawn small in the corner: dunes, and a walker on leaves
    K.pens(a, [[(380, 900), (450, 870), (520, 896), (600, 860), (690, 890)], [(420, 940), (520, 920), (620, 944), (700, 926)],
               [(390, 980), (470, 968), (560, 984)]], w=2.6, color=HANDC, taper=(.2, .4))
    K.pens(a, [[(556, 858), (558, 830)], [(558, 830), (566, 814)], [(558, 838), (548, 848)], [(558, 836), (570, 842)],
               [(556, 858), (548, 872)], [(556, 858), (566, 872)]], w=2.4, color=HANDC, taper=(.1, .3))
    a.circle(568, 808, 4.5, fill=HANDC)
    a.path("M540,874 q8,-5 16,0 M560,874 q8,-5 16,0", stroke=HANDC, stroke_width=2, fill="none", stroke_linecap="round")
    K.tea_ring(a, 250, 940, 58, op=.3, gap=.2)
    K.sand(a, 40, 980, 300, 60, n=90, r=(.6, 1.5))


def p_back2(a):
    """Days twenty-one to forty; the entry for day thirty-one; the count stops."""
    ledger_page(a, True, 2)
    tally(a, 90, row_y(1) + 8, 25)
    tally(a, 90, row_y(3) + 8, 30)
    y = row_y(5)
    K.hand(a, 90, y + 20, "Day thirty-one.", 40, HANDC, rot=-2)
    K.hand(a, 90, y + 72, "I meant to turn at the cairn.", 36, HANDC, rot=-2)
    K.hand(a, 90, y + 122, "I did not turn.", 36, HANDC, rot=-3)
    K.hand(a, 90, y + 172, "I cannot say why.", 36, HANDC, rot=-3)
    tally(a, 90, row_y(11) + 8, 35)
    tally(a, 90, row_y(13) + 8, 40, heavy_last=True)
    K.hand(a, 600, row_y(13) + 8, "forty", 34, HANDC, rot=-4)
    # nothing after: rings, and sand in the gutter
    for (x, yy, r, op) in ((300, 900, 60, .4), (360, 930, 58, .3), (250, 950, 56, .22)):
        K.tea_ring(a, x, yy, r, op=op, gap=.15)
    K.sand(a, 0, 150, 90, 900, n=260, r=(.6, 1.6), density=lambda x, yy: max(0, 1 - x / 80) * (.3 + .7 * yy / 1050))


def p_back3(a):
    """The count laid against the father's journal: both stop at forty."""
    ledger_page(a, True, 3)
    tally(a, 90, row_y(1) + 8, 40, heavy_last=True)
    K.hand(a, 600, row_y(1) + 8, "forty", 34, HANDC, rot=-4)
    # the journal slip, in another hand, laid across the leaf
    a.open("g", transform="rotate(-4 400 480)")
    a.rect(128, 328, 560, 250, fill="#000", opacity=.25, filter=a.blur(8))
    a.rect(120, 320, 560, 250, fill="#EAD9B0", stroke=K.INK2, stroke_width=1.2)
    K.grain(a, 120, 320, 560, 250, .25, .8)
    a.path("M120,320 l14,10 l12,-9 l16,10 l12,-10 l18,9 l10,-8", stroke=K.INK2, stroke_width=1, fill="none", opacity=.6)
    for k, ln in enumerate(("Day forty.", "The leaves hold.", "The track goes on.")):
        a.text(160, 392 + k * 58, ln, size=42, family="serif", fill="#5A3A1E", font_style="italic")
    K.pen(a, [(160, 548), (300, 544), (360, 548)], w=2.4, color="#5A3A1E", taper=(.1, .8))
    K.woody_leaf(a, 560, 520, 90, -.5)
    a.close()
    # under it, his own line again, and a ring where the cup stood while he read
    y = row_y(11)
    K.hand(a, 90, y + 20, "I did not turn.", 36, HANDC, rot=-3)
    K.tea_ring(a, 520, 880, 74, op=.5, gap=.08)
    K.tea_ring(a, 470, 910, 70, op=.24, gap=.3)
    K.sand(a, 0, 150, 110, 900, n=360, r=(.6, 1.7), density=lambda x, yy: max(0, 1 - x / 100) * (.3 + .7 * yy / 1050))
    K.sand_pile(a, 60, 1090, 110, 40, n=240)


PAGES = [
    ("front-1-jars", "Ledger, front: the jars kept", p_front1,
     "A front page of Maudric's pantry ledger: the eight jars drawn small in the margin, each with its depth, length and "
     "binding entered in his slanted hand, and a tea ring at the foot."),
    ("front-2-recipes", "Ledger, front: what opens a book", p_front2,
     "A front page of the ledger: three recipes with their herbs sketched beside them, and the hint for the sand book "
     "written aslant at the foot."),
    ("front-3-unfinished", "Ledger, front: the unfinished recipe", p_front3,
     "The last front page of the ledger: two recipes, then the recipe for leaving a book that is still going, which "
     "stops in a blot; sand has got into the leaf."),
    ("back-1-days", "Ledger, back: the day count begins", p_back1,
     "The ledger turned over: a count of days in five-bar gates, five, ten, fifteen, twenty."),
    ("back-2-thirty-one", "Ledger, back: day thirty-one", p_back2,
     "The back of the ledger: the count runs on past thirty, the entry for day thirty-one, and the tallies stop at a "
     "heavy fortieth stroke over three tea rings."),
    ("back-3-forty", "Ledger, back: forty, against the journal", p_back3,
     "The back of the ledger with a slip of the father's journal laid across it: both counts stop at forty, and a deep "
     "tea ring marks where the cup stood."),
]
for _id, _t, _fn, _doc in PAGES:
    K.reg(f"ledger-{_id}", "documents", _t, 800, 1100, ROW_P, _doc, _fn)

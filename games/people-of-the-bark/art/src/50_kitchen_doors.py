"""Sap Kitchen recipe plates (alchemical diagram) and the Ring Doors with their new chronicle glyphs
(dendrochronology letterpress)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW_R = "Recipe plates, 1 to 13"
ROW_D = "Doors and new chronicle glyphs"
INK, RUB = kit.INK, kit.RUBRIC
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"]
CAT = {"food": (kit.LIME, "FOOD"), "sealant": (kit.GREYBROWN, "SEALANT"), "offering": (kit.GOLD, "OFFERING")}


# ---------------------------------------------------------------------------------------------
# what each pot makes (drawn in a 150 x 110 box, origin top-left)
# ---------------------------------------------------------------------------------------------
def steam(a, x, y, n=3, col=INK):
    for i in range(n):
        a.path(f"M{x + i * 12},{y} q-6,-8 0,-16 q6,-8 0,-16", fill="none", stroke=col, stroke_width=1.5, stroke_linecap="round",
               opacity=0.7)


def p_syrup(a):
    a.path("M40,36 h60 v10 q16,8 16,30 q0,28 -46,28 q-46,0 -46,-28 q0,-22 16,-30Z", fill=kit.PAPER, stroke=INK, stroke_width=2)
    a.path("M30,70 q40,10 80,0 q0,30 -40,30 q-40,0 -40,-30Z", fill=kit.AMBER, stroke=INK, stroke_width=1.2)
    a.line(110, 4, 82, 40, stroke=INK, stroke_width=4, stroke_linecap="round")
    a.path("M78,40 q-6,14 -4,30 q6,-4 8,-30Z", fill=kit.GOLD, stroke=INK, stroke_width=1)


def loaf(a, col, slashes=3, w=100, x0=25, y0=30):
    a.path(f"M{x0},{y0 + 60} Q{x0 - 6},{y0} {x0 + w / 2},{y0} Q{x0 + w + 6},{y0} {x0 + w},{y0 + 60}Z", fill=col, stroke=INK,
           stroke_width=2)
    for i in range(slashes):
        x = x0 + w * (i + 1) / (slashes + 1)
        a.path(f"M{x - 8},{y0 + 34} q8,-22 16,-22", fill="none", stroke=INK, stroke_width=1.6, stroke_linecap="round")
    a.line(x0 - 8, y0 + 62, x0 + w + 8, y0 + 62, stroke=INK, stroke_width=2)


def p_loaf(a):
    loaf(a, "#9a9a5a")
    a.stipple(30, 36, 90, 46, n=36, r=(1, 2), fill=kit.LEAF, opacity=0.8)


def p_cake(a):
    a.path("M20,60 a55,16 0 0,1 110,0 v26 a55,16 0 0,1 -110,0Z", fill=kit.GOLD, stroke=INK, stroke_width=2)
    a.ellipse(75, 60, 55, 16, fill="#f8d98a", stroke=INK, stroke_width=1.6)
    a.path("M75,60 L118,50 M75,60 L112,71", stroke=INK, stroke_width=1.4)
    a.stipple(28, 48, 94, 24, n=26, r=(1.2, 2.4), fill=kit.AMBER)
    kit.alch_symbol(a, "pollen", 75, 22, 0.5, w=1.4)


def p_broth(a):
    a.path("M16,50 h118 q-4,48 -59,48 q-55,0 -59,-48Z", fill=kit.PAPER, stroke=INK, stroke_width=2)
    a.ellipse(75, 50, 59, 11, fill="#d8dca0", stroke=INK, stroke_width=1.6)
    for x, y, rr in ((50, 46, 7), (66, 52, 5), (84, 46, 8), (100, 52, 5), (40, 53, 4)):
        a.circle(x, y, rr, fill="#f4f1dc", stroke=INK, stroke_width=1)
    steam(a, 62, 34)


def p_glue(a):
    a.path("M24,44 h74 v52 q-37,12 -74,0Z", fill=kit.UMBER, stroke=INK, stroke_width=2)
    a.ellipse(61, 44, 37, 9, fill=kit.AMBER, stroke=INK, stroke_width=1.6)
    a.line(126, 6, 76, 44, stroke=INK, stroke_width=5, stroke_linecap="round")
    a.path("M68,38 l14,12 l-18,8Z", fill=kit.PAPER_D, stroke=INK, stroke_width=1.2)
    a.path("M70,54 q-4,20 2,34 q4,-18 2,-34", fill=kit.GOLD, stroke=INK, stroke_width=0.8)


def crack_ground(a):
    a.rect(6, 18, 138, 84, rx=4, fill="#b08a62", stroke=INK, stroke_width=1.6)
    a.path("M70,18 l8,18 l-12,14 l14,18 l-10,16 l6,18", fill="none", stroke=INK, stroke_width=4, stroke_linejoin="round")


def p_ashpatch(a):
    crack_ground(a)
    a.ellipse(74, 60, 34, 24, fill="#8a8a84", stroke=INK, stroke_width=1.8)
    a.stipple(44, 40, 60, 40, n=60, r=(0.8, 2), fill=INK, opacity=0.7)
    kit.alch_symbol(a, "ash", 124, 34, 0.4, w=1.3)


def p_plaster(a):
    crack_ground(a)
    a.open("g", transform="rotate(-18 75 60)")
    a.path("M30,60 Q50,30 120,40 Q110,84 40,82Z", fill="#c8a04a", stroke=INK, stroke_width=1.8)
    a.path("M34,62 L116,44 M60,56 l-4,-14 M80,52 l-2,-14 M64,58 l6,16 M88,52 l8,18", fill="none", stroke=INK, stroke_width=1)
    a.close()
    for x, y in ((34, 40), (116, 82)):
        a.circle(x, y, 4, fill=kit.AMBER, stroke=INK, stroke_width=1)


def tear(a, x, y, s, col, core=None):
    a.path(f"M{x},{y - 34 * s} Q{x + 26 * s},{y + 4 * s} {x},{y + 22 * s} Q{x - 26 * s},{y + 4 * s} {x},{y - 34 * s}Z", fill=col,
           stroke=INK, stroke_width=2)
    a.path(f"M{x - 9 * s},{y - 2 * s} q-2,{10 * s} {7 * s},{15 * s}", fill="none", stroke="#fff6dc", stroke_width=3, opacity=0.7,
           stroke_linecap="round")
    if core:
        a.circle(x + 2 * s, y + 4 * s, 7 * s, fill=core)


def p_gold_tear(a):
    for i in range(12):
        t = i * math.pi / 6
        a.line(75 + 36 * math.cos(t), 58 + 36 * math.sin(t), 75 + 48 * math.cos(t), 58 + 48 * math.sin(t), stroke=RUB,
               stroke_width=1.5, stroke_linecap="round")
    tear(a, 75, 62, 1.0, kit.GOLD)


def p_ember(a):
    a.circle(75, 62, 46, fill=a.radial([(0, kit.LANTERN, 0.7), (1, kit.LANTERN, 0)]))
    tear(a, 75, 62, 1.0, kit.AMBER, core=kit.LANTERN)
    a.path("M18,100 h114 l-10,8 h-94Z", fill=kit.UMBER, stroke=INK, stroke_width=1.4)


def p_frost_candy(a):
    a.line(75, 104, 75, 60, stroke=INK, stroke_width=4, stroke_linecap="round")
    for pts, col in (([(75, 10), (98, 40), (84, 72), (62, 70), (52, 38)], "#f4f8fa"), ([(75, 10), (84, 72), (62, 70)], "#d6e4ea"),
                     ([(98, 40), (118, 54), (84, 72)], "#e4eef2"), ([(52, 38), (34, 56), (62, 70)], "#c8dae2")):
        a.poly(pts, fill=col, stroke=INK, stroke_width=1.5, stroke_linejoin="round")
    kit.alch_symbol(a, "frost", 124, 24, 0.42, w=1.3)
    kit.alch_symbol(a, "frost", 26, 30, 0.3, w=1.1)


def p_winter_bread(a):
    loaf(a, "#7a5a3a", slashes=0, w=116, x0=17, y0=24)
    kit.alch_symbol(a, "frost", 75, 58, 0.9, col=kit.PAPER, w=2.4)
    a.stipple(22, 30, 106, 20, n=30, r=(0.8, 1.8), fill=kit.PAPER, opacity=0.9)


def p_pell(a):
    a.path("M50,70 h50 q-2,30 -25,30 q-23,0 -25,-30Z", fill=kit.PAPER, stroke=INK, stroke_width=2)
    tear(a, 75, 46, 0.75, kit.GOLD)
    a.path("M128,104 V30 q0,-10 -9,-8", fill="none", stroke=INK, stroke_width=3.5, stroke_linecap="round")
    a.rect(10, 50, 28, 40, rx=3, fill=kit.PAPER, stroke=INK, stroke_width=1.5, transform="rotate(-10 24 70)")
    for y in (60, 68, 80):
        a.poly([(6, y - 3), (11, y), (7, y + 3)], fill=INK)


def p_plug(a):
    a.rect(6, 14, 138, 90, rx=4, fill=kit.CHALK, stroke=INK, stroke_width=1.6)
    for k in range(1, 8):
        a.line(6, 14 + k * 11, 144, 14 + k * 11, stroke="#7d878a", stroke_width=0.9)
    a.ellipse(75, 60, 38, 32, fill="#22282b", stroke=INK, stroke_width=1.8)
    for x, y, rr in ((60, 52, 13), (82, 48, 15), (74, 68, 16), (94, 66, 11), (56, 70, 10), (70, 40, 9)):
        a.circle(x, y, rr, fill="#c9b47a", stroke=INK, stroke_width=1.1)
        a.circle(x - rr * 0.3, y - rr * 0.3, rr * 0.25, fill="#f4ecc8", opacity=0.8)
    for x, y in ((40, 28), (112, 90), (116, 30)):
        a.path(f"M{x},{y} l5,-3 l-1,5 l6,-2", fill="none", stroke="#4d575a", stroke_width=1.4, stroke_linecap="round")


RECIPES = [
    (1, "Groove Syrup", "food", "low", "long", "Syrup", [], False, (0, 2), "sticky", "Food +6", p_syrup),
    (2, "Lichen Loaf", "food", "high", "long", "Hard", ["lichen"], False, (3, 4), "firm", "Food +8", p_loaf),
    (3, "Pollen Cake", "food", "high", "long", "Hard", ["pollen", "honeydew"], False, (3, 4), "sweet", "Food +10", p_cake),
    (4, "Dew Broth", "food", "low", "short", "Runny", ["honeydew", "lichen"], False, (5, 6), "thin", "Food +7", p_broth),
    (5, "Ridge Glue", "sealant", "middle", "long", "Glue", ["resin"], False, (0, 2), "holds", "Integrity +4", p_glue),
    (6, "Ashpatch", "sealant", "high", "short", "Glue", ["resin", "ash"], True, (3, 4), "gritty", "Integrity +6", p_ashpatch),
    (7, "Leaf-skin Plaster", "sealant", "high", "long", "Hard", ["leafskin", "resin"], False, (0, 2), "keeps", "Integrity +5", p_plaster),
    (8, "Gold Tear", "offering", "low", "short", "Runny", ["pollen", "honeydew"], False, (0, 2), "gold", "Knot +3", p_gold_tear),
    (9, "Ember Drop", "offering", "middle", "short", "Syrup", ["ash", "pollen"], False, (0, 2), "warm", "Knot +3", p_ember),
    (10, "Frost Candy", "food", "high", "long", "Hard", ["frost", "honeydew"], False, (0, 2), "glassy", "Food +9", p_frost_candy),
    (11, "Winter Bread", "food", "high", "long", "Hard", ["lichen", "leafskin", "frost"], False, (3, 4), "filling", "Food +12", p_winter_bread),
    (12, "Pell’s Tear", "offering", "low", "long", "Syrup", ["frost", "pollen", "resin"], False, (0, 2), "last", "Knot +5, once", p_pell),
    (13, "Gallery Plug", "sealant", "middle", "long", "Glue", ["ash", "leafskin"], False, (5, 6), "wrong", "sour sap only", p_plug),
]
LABEL = {"sap": "SAP", "lichen": "LICHEN", "pollen": "POLLEN", "honeydew": "HONEYDEW", "resin": "RESIN", "ash": "ASH",
         "frost": "FROST", "leafskin": "LEAF-SKIN"}


def recipe_plate(a, n, name, cat, heat, boil, thick, ings, ordered, stirs, hint, effect, pic):
    sour = n == 13
    a.paper("#ead9b4" if not sour else "#e2dccb", grain=0.3, fibre=0.6)
    a.vignette(0.4, "#4a2a10")
    kit.stain(a, 330 + (n * 37) % 50, 470 - (n * 53) % 300, 34 + (n * 7) % 20, opacity=0.14)
    a.rect(14, 14, 392, 532, fill="none", stroke=INK, stroke_width=1.6)
    a.rect(20, 20, 380, 520, fill="none", stroke=INK, stroke_width=0.7)
    col, cat_lab = CAT[cat]
    # head
    a.circle(54, 56, 24, fill="#f4e6c4", stroke=INK, stroke_width=1.6)
    a.text(54, 63, ROMAN[n - 1], size=20 if n < 8 or n > 9 else 16, family="serif", fill=RUB, text_anchor="middle", font_weight="bold")
    a.text(228, 54, name.upper(), size=23, family="serif", fill=INK, text_anchor="middle", letter_spacing=2.5, font_weight="bold")
    a.text(228, 76, cat_lab, size=12, family="serif", fill=RUB, text_anchor="middle", letter_spacing=5)
    a.line(100, 86, 356, 86, stroke=INK, stroke_width=1)
    # the opus circle
    cx, cy, R = 232, 222, 104
    a.circle(cx, cy, R + 18, fill="none", stroke=INK, stroke_width=0.9)
    a.circle(cx, cy, R, fill="none", stroke=INK, stroke_width=2.2)
    ticks = "".join(f"M{f(cx + (R + 18) * math.cos(t))},{f(cy + (R + 18) * math.sin(t))}L{f(cx + (R + 18 - (9 if i % 6 == 0 else 4)) * math.cos(t))},"
                    f"{f(cy + (R + 18 - (9 if i % 6 == 0 else 4)) * math.sin(t))}" for i, t in ((i, 2 * math.pi * i / 72) for i in range(72)))
    a.path(ticks, stroke=INK, stroke_width=1, fill="none")
    m = len(ings) + 1
    a.poly(a.ngon(cx, cy, R, max(3, m), -90), fill="none", stroke=kit.AMBER if not sour else "#7d878a", stroke_width=1.3)
    items = ["sap"] + ings
    for i, ing in enumerate(items):
        t = -math.pi / 2 + 2 * math.pi * i / max(3, m)
        x, y = cx + R * math.cos(t), cy + R * math.sin(t)
        a.circle(x, y, 23, fill="#f8d98a" if not (sour and ing == "sap") else kit.CHALK, stroke=INK, stroke_width=1.4)
        kit.alch_symbol(a, ing, x, y, 0.7, col=RUB if i else INK, w=2)
        lx, ly = cx + (R + 44) * math.cos(t), cy + (R + 40) * math.sin(t)
        lab = LABEL[ing] if not (sour and ing == "sap") else "SOUR SAP"
        if i == 0:
            a.text(x + 30, y - 10, lab, size=10.5, family="serif", fill=INK, letter_spacing=1.5)
        else:
            a.text(lx, ly + 4, lab, size=10.5, family="serif", fill=INK, text_anchor="middle", letter_spacing=1.5)
        sx, sy = x - 27 * math.cos(t), y - 27 * math.sin(t)
        ex, ey = cx + 46 * math.cos(t), cy + 46 * math.sin(t)
        kit.arrow(a, sx, sy, ex, ey, col=RUB if i else INK, w=2, bend=0.1, head=9)
        if ordered and i:
            mx, my = (sx + ex) / 2 + 13 * math.sin(t), (sy + ey) / 2 - 13 * math.cos(t)
            a.circle(mx, my, 9, fill=RUB)
            a.text(mx, my + 4.5, str(i), size=12, family="serif", fill=kit.PAPER, text_anchor="middle", font_weight="bold")
    # pot at the centre
    a.path(f"M{cx - 34},{cy - 16} Q{cx - 42},{cy + 28} {cx},{cy + 32} Q{cx + 42},{cy + 28} {cx + 34},{cy - 16}Z", fill=kit.UMBER,
           stroke=INK, stroke_width=2.2)
    a.ellipse(cx, cy - 16, 34, 8, fill=col if cat != "sealant" else kit.AMBER, stroke=INK, stroke_width=2)
    if stirs[0] >= 5:
        for dx, rr in ((-16, 6), (-2, 8), (14, 6), (4, 4)):
            a.circle(cx + dx, cy - 22 - rr * 0.5, rr, fill="#f4f1dc", stroke=INK, stroke_width=1)
    # left column: heat, boil, stirs
    hx = 52
    lvl = {"low": 1, "middle": 2, "high": 3}[heat]
    a.poly([(hx, 122), (hx - 22, 160), (hx + 22, 160)], fill=(kit.GOLD, kit.AMBER, kit.LANTERN)[lvl - 1], stroke=INK, stroke_width=2)
    a.text(hx, 155, "I" * lvl, size=14, family="serif", fill=INK, text_anchor="middle", font_weight="bold")
    a.text(hx, 176, heat.upper(), size=9.5, family="serif", fill=INK, text_anchor="middle", letter_spacing=1.5)
    a.poly([(hx - 14, 196), (hx + 14, 196), (hx - 14, 236), (hx + 14, 236)], fill="none", stroke=INK, stroke_width=2)
    if boil == "long":
        a.poly([(hx - 9, 232), (hx + 9, 232), (hx, 219)], fill=kit.AMBER)
    else:
        a.poly([(hx - 9, 200), (hx + 9, 200), (hx, 213)], fill=kit.AMBER)
    a.text(hx, 252, boil.upper(), size=9.5, family="serif", fill=INK, text_anchor="middle", letter_spacing=1.5)
    a.line(hx - 4, 330, hx + 10, 270, stroke=INK, stroke_width=4, stroke_linecap="round")
    a.ellipse(hx - 6, 336, 7, 11, fill=kit.PAPER_D, stroke=INK, stroke_width=1.5, transform=f"rotate(14 {hx - 6} 336)")
    for k in range(6):
        on = k < stirs[1]
        sure = k < max(1, stirs[0]) if stirs[0] else False
        y = 352 + (k // 3) * 12
        x = hx - 12 + (k % 3) * 12
        a.circle(x, y, 4.2, fill=RUB if sure else (kit.GOLD if on else "none"), stroke=INK, stroke_width=1.1)
    a.text(hx, 388, f"{stirs[0]}–{stirs[1]} STIRS", size=9.5, family="serif", fill=INK, text_anchor="middle", letter_spacing=1)
    # what comes out
    kit.arrow(a, cx, cy + 126, cx, cy + 158, col=INK, w=2, head=9)
    a.text(cx, cy + 148 - 34 + 34, "", size=1)
    a.open("g", transform=f"translate({cx - 75} 396)")
    pic(a)
    a.close()
    a.text(cx + 100, 392, thick.upper(), size=11, family="serif", fill=INK, text_anchor="middle", letter_spacing=2,
           transform=f"rotate(90 {cx + 112} 420)")
    a.line(34, 512, 386, 512, stroke=INK, stroke_width=0.8)
    a.text(40, 532, f"“{hint}”", size=19, family="serif", fill=RUB, font_style="italic")
    a.text(380, 531, effect, size=14, family="serif", fill=INK, text_anchor="end", letter_spacing=1)
    if sour:
        a.path("M300,452 l12,-7 l-3,11 l14,-5 l-4,10 l12,-4", fill="none", stroke="#6f797c", stroke_width=2, stroke_linecap="round",
               stroke_linejoin="round")


for rec in RECIPES:
    def _mk(rec=rec):
        n, name, cat, heat, boil, thick, ings, ordered, stirs, hint, effect, pic = rec

        def draw(a: Art):
            recipe_plate(a, *rec)
        what = ", ".join(LABEL[i].lower() for i in ings) or "sap only"
        draw.__doc__ = (f"Recipe plate {n}, {name}, as an alchemical diagram: {what} carried into the pot, {heat} heat, a {boil} "
                        f"boil, {stirs[0]} to {stirs[1]} stirs, and below it the {thick.lower()} thing that comes out. "
                        f"Old Resin's hint word is “{hint}”." + (" The Gallery Plug is the one plate that asks for froth and "
                                                                          "sour sap, and the only one touched with chalk grey." if n == 13 else ""))
        return draw
    slug = rec[1].lower().replace("’", "").replace(" ", "-")
    asset(G, f"recipe-{rec[0]:02d}-{slug}", group="documents", title=f"Recipe plate {rec[0]}: {rec[1]}", w=420, h=560, row=ROW_R)(_mk())


# ---------------------------------------------------------------------------------------------
# the Ring Doors
# ---------------------------------------------------------------------------------------------
DINK = "#5a3424"
DTYPE = "#2b1810"


def chron(a, x, y, kind, col=DTYPE, s=1.0):
    """Chronicle glyphs: 0 first ring, 1 grooves, 2 the flake, 3 two shadows, 4 scroll house, then the four
    new ones: 5 the floor went first, 6 the pulse, 7 turned since, 8 the eaten arc."""
    k = dict(fill="none", stroke=col, stroke_width=3 * s, stroke_linecap="round", stroke_linejoin="round")
    if kind == 0:
        a.circle(x, y, 11 * s, **k)
        a.circle(x, y, 3 * s, fill=col)
    elif kind == 1:
        for i in (-1, 0, 1):
            a.line(x + i * 8 * s, y - 12 * s, x + i * 8 * s, y + 12 * s, **k)
    elif kind == 2:
        a.path(f"M{f(x - 12 * s)},{f(y - 10 * s)} h{f(24 * s)} M{f(x - 6 * s)},{f(y)} l{f(12 * s)},{f(4 * s)} l{f(-4 * s)},{f(9 * s)} l{f(-10 * s)},{f(-5 * s)}Z", **k)
    elif kind == 3:
        a.circle(x - 6 * s, y, 8 * s, fill=col)
        a.circle(x + 7 * s, y, 8 * s, **k)
    elif kind == 4:
        a.path(f"M{f(x - 12 * s)},{f(y)} l{f(5 * s)},{f(-9 * s)} l{f(5 * s)},{f(18 * s)} l{f(5 * s)},{f(-18 * s)} l{f(5 * s)},{f(9 * s)}", **k)
    elif kind == 5:
        a.path(f"M{f(x - 14 * s)},{f(y - 2 * s)} h{f(28 * s)}", **dict(k, stroke_dasharray=f"{f(5 * s)} {f(5 * s)}"))
        a.path(f"M{f(x - 9 * s)},{f(y - 4 * s)} v{f(-6 * s)} a{f(4 * s)},{f(4 * s)} 0 0,1 {f(8 * s)},0 v{f(6 * s)} M{f(x + 3 * s)},{f(y - 4 * s)} v{f(-4 * s)} "
               f"a{f(3 * s)},{f(3 * s)} 0 0,1 {f(6 * s)},0 v{f(4 * s)}", **dict(k, stroke_width=2 * s))
        for i in range(4):
            a.circle(x - 10 * s + i * 7 * s, y + 8 * s, 1.8 * s, fill=col)
    elif kind == 6:
        a.circle(x, y, 13 * s, **dict(k, stroke_width=2 * s))
        for i in range(3):
            a.path(f"M{f(x - 8 * s)},{f(y - 6 * s + i * 6 * s)} l{f(5 * s)},{f(-3 * s)} l{f(-1 * s)},{f(5 * s)} l{f(6 * s)},{f(-2 * s)}",
                   **dict(k, stroke_width=1.8 * s))
    elif kind == 7:
        a.path(f"M{f(x + 11 * s)},{f(y - 5 * s)} A{f(12 * s)},{f(12 * s)} 0 1,0 {f(x + 6 * s)},{f(y + 10 * s)}", **k)
        a.poly([(x + 11 * s, y - 14 * s), (x + 17 * s, y - 2 * s), (x + 5 * s, y - 3 * s)], fill=col)
        a.line(x, y - 18 * s, x, y - 8 * s, **dict(k, stroke_width=2 * s))
    else:
        a.path(f"M{f(x - 12 * s)},{f(y + 4 * s)} A{f(12.6 * s)},{f(12.6 * s)} 0 1,1 {f(x + 4 * s)},{f(y + 12 * s)}", **k)
        for t in (2.0, 2.4, 2.8):
            a.circle(x + 12.6 * s * math.cos(t), y + 12.6 * s * math.sin(t), 1.8 * s, fill=col)


def door(a, title, sub, rings, positions, offsets, glyphs, par, stiff=None, eaten=None, sealed=False, note=()):
    a.paper("#f1e7d0", grain=0.35, fibre=1.1)
    rough = a.roughen(2.0, 0.06)
    cx, cy = 400, 432
    r = a.rng
    heart, outer = 58, 318
    step = (outer - heart) / rings
    radii = [heart + i * step for i in range(rings + 1)]        # index 0 = heart edge; band i between radii[i], radii[i+1]
    harm = [(r.uniform(2, 6), r.uniform(0, 6.28), k) for k in (2, 3, 5)]

    def wob(rr, t):
        return rr + sum(amp * math.sin(k * t + ph) * rr / 300 for amp, ph, k in harm)

    def ring_d(rr, n=64, t0=0.0, t1=2 * math.pi, close=True):
        pts = [(cx + wob(rr, t0 + (t1 - t0) * i / n) * math.cos(t0 + (t1 - t0) * i / n),
                cy + wob(rr, t0 + (t1 - t0) * i / n) * math.sin(t0 + (t1 - t0) * i / n)) for i in range(n + (0 if close else 1))]
        return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if close else "")
    # amber underprint, off register
    a.open("g", transform="translate(4 -3)", opacity=0.55)
    for b in range(rings):
        a.path(ring_d(radii[b + 1] - step * 0.3) + ring_d(radii[b] + step * 0.25), fill=kit.AMBER, fill_rule="evenodd")
    a.close()
    a.open("g", filter=rough)
    d = []
    for b in range(rings):
        r0, r1 = radii[b], radii[b + 1]
        n = r.randint(4, 6)
        acc = r0
        for i in range(n):
            acc += (r1 - r0) / n * r.uniform(0.7, 1.3)
            if acc < r1 - 4:
                d.append(ring_d(acc, 56))
    a.path("".join(d), fill="none", stroke=DINK, stroke_width=1.1, opacity=0.8)
    for rr in radii:
        a.path(ring_d(rr), fill="none", stroke=DINK, stroke_width=4.2)
    a.circle(cx, cy, 14, fill=DINK)
    for i in range(30):
        t = 2 * math.pi * i / 30 + r.uniform(-0.04, 0.04)
        l1, l2 = r.uniform(18, 50), r.uniform(110, outer - 6)
        a.line(cx + l1 * math.cos(t), cy + l1 * math.sin(t), cx + l2 * math.cos(t), cy + l2 * math.sin(t), stroke=DINK,
               stroke_width=0.6, opacity=0.5)
    a.close()
    # the eaten arc: one band, three positions, where the ring drags nothing
    if eaten is not None:
        b, p0 = eaten
        t0 = -math.pi / 2 + (p0 - 0.5) * 2 * math.pi / positions
        t1 = t0 + 3 * 2 * math.pi / positions
        r0, r1 = radii[b] + 3, radii[b + 1] - 3
        pts = [(cx + r1 * math.cos(t0 + (t1 - t0) * i / 20), cy + r1 * math.sin(t0 + (t1 - t0) * i / 20)) for i in range(21)]
        pts += [(cx + r0 * math.cos(t1 - (t1 - t0) * i / 20), cy + r0 * math.sin(t1 - (t1 - t0) * i / 20)) for i in range(21)]
        a.poly(pts, fill="#f1e7d0", stroke=kit.CHALK, stroke_width=2, stroke_dasharray="3 4")
        cp = a.clip('<polygon points="' + " ".join(f"{f(x)},{f(y)}" for x, y in pts) + '"/>')
        a.open("g", clip_path=cp)
        bx0, by0 = min(x for x, _ in pts), min(y for _, y in pts)
        bx1, by1 = max(x for x, _ in pts), max(y for _, y in pts)
        a.stipple(bx0, by0, bx1 - bx0, by1 - by0, n=260, r=(0.8, 2.2), fill="#8d979a", opacity=0.9)
        a.close()
    # the line
    crack = [(cx, cy - 16)] + [(cx + r.uniform(-4, 4), cy - 16 - i * 26) for i in range(1, 13)]
    a.path(a.smooth_d(crack), fill="none", stroke=DTYPE, stroke_width=6, stroke_linecap="round")
    a.path(a.smooth_d(crack), fill="none", stroke=kit.GOLD if not sealed else kit.CHALK, stroke_width=1.5)
    # notches, pips and glyphs
    for b in range(rings):
        r0, r1 = radii[b], radii[b + 1]
        rr = (r0 + r1) / 2
        off = offsets[b]
        t = -math.pi / 2 + off * 2 * math.pi / positions
        on = off == 0
        w = 15 / rr
        pts = [(cx + (r0 + 2) * math.cos(t - w * 1.5), cy + (r0 + 2) * math.sin(t - w * 1.5)),
               (cx + (r1 - 2) * math.cos(t - w * 0.7), cy + (r1 - 2) * math.sin(t - w * 0.7)),
               (cx + (r1 - 2) * math.cos(t + w * 0.7), cy + (r1 - 2) * math.sin(t + w * 0.7)),
               (cx + (r0 + 2) * math.cos(t + w * 1.5), cy + (r0 + 2) * math.sin(t + w * 1.5))]
        a.poly(pts, fill=(kit.LIME if on else kit.LANTERN) if not sealed else kit.CHALK, stroke=DTYPE, stroke_width=2.4)
        for s8 in range(positions):
            if s8 != off:
                t2 = -math.pi / 2 + s8 * 2 * math.pi / positions
                a.circle(cx + rr * math.cos(t2), cy + rr * math.sin(t2), 2.8, fill=DINK, opacity=0.7)
        # the ring's glyph, a quarter turn on from its notch
        t3 = t + math.pi / 2
        gx, gy = cx + rr * math.cos(t3), cy + rr * math.sin(t3)
        a.circle(gx, gy, min(22, step * 0.42), fill="#f1e7d0", stroke=DTYPE, stroke_width=1.2)
        chron(a, gx, gy, glyphs[b], s=min(1.0, step / 52))
        if stiff == b:
            for tt in (t + 2.4, t + 2.9, t - 2.4):
                a.path(ring_d(rr, 8, tt, tt + 0.3, close=False), fill="none", stroke=DTYPE, stroke_width=step * 0.5, opacity=0.2)
                a.path(ring_d(rr - 6, 6, tt, tt + 0.3, close=False) + ring_d(rr + 6, 6, tt, tt + 0.3, close=False), fill="none",
                       stroke=DTYPE, stroke_width=2)
    if sealed:
        a.circle(cx, cy, 30, fill=kit.CHALK, stroke=DTYPE, stroke_width=3)
        a.stipple(cx - 26, cy - 26, 52, 52, n=40, r=(1, 2.4), fill="#5d676a")
    # letterpress type
    tp = dict(family="serif", fill=DTYPE)
    a.text(44, 70, title, size=30, letter_spacing=4, font_weight="bold", **tp)
    a.line(44, 84, 44 + len(title) * 24, 84, stroke=DTYPE, stroke_width=3)
    a.text(44, 108, sub, size=15, font_style="italic", **tp)
    a.text(756, 62, "PAR", size=16, letter_spacing=6, text_anchor="end", **tp)
    a.text(760, 112, f"{par:02d}", size=58, font_weight="bold", family="serif", fill=kit.AMBER, opacity=0.5, text_anchor="end")
    a.text(756, 108, f"{par:02d}", size=58, font_weight="bold", text_anchor="end", **tp)
    for i, ln in enumerate(note):
        a.text(44, 742 + i * 20, ln, size=15, font_style="italic", **tp)
    a.text(756, 762, f"{rings} rings · {positions} positions", size=14, letter_spacing=2, text_anchor="end", **tp)
    a.rect(20, 20, 760, 760, fill="none", stroke=DTYPE, stroke_width=2)
    for x, y in ((20, 20), (780, 20), (20, 780), (780, 780)):
        a.poly(a.star_pts(x, y, 12, 4.5, 4, 45), fill=kit.AMBER, stroke=DTYPE, stroke_width=1.2)


DOORS = [
    ("first-ring", "The Door of the First Ring", dict(title="THE FIRST RING", sub="Knotholm", rings=3, positions=8, offsets=[5, 2, 3],
                                                     glyphs=[1, 0, 0][::-1] and [3, 1, 0], par=6, note=("turn a ring, and the next one in", "turns back")),
     "The Door of the First Ring printed as a slice of knot: three rings of growth lines, each with its grain notch off the line "
     "and its year-glyph, the oldest glyph on the outermost ring."),
    ("deep-knot", "The Deep Knot", dict(title="THE DEEP KNOT", sub="one ring is stiff", rings=4, positions=8, offsets=[3, 6, 2, 5],
                                        glyphs=[4, 3, 2, 1], par=9, stiff=2, note=("the stiff ring turns", "two steps a click")),
     "The Deep Knot door: four rings, one of them stiff and printed with heavier bars, its third ring carrying the glyph of the "
     "Great Flake."),
    ("heartwood", "The Heartwood Door", dict(title="THE HEARTWOOD", sub="someone has turned it since", rings=5, positions=12,
                                             offsets=[7, 2, 10, 4, 9], glyphs=[6, 8, 7, 5, 2], par=14, eaten=(1, 3),
                                             note=("over the eaten arc", "ring four drags nothing")),
     "The Heartwood Door: five rings of twelve positions, not where the chronicle says the Knot left it. Across three positions of "
     "ring four the wood is gone to pale frass, the eaten arc, where turning drags nothing."),
    ("heartwood-sealed", "The Heartwood Door, sealed", dict(title="THE HEARTWOOD, CLOSED", sub="turned out of line and plugged", rings=5,
                                                            positions=12, offsets=[6, 1, 8, 3, 10], glyphs=[6, 8, 7, 5, 2], par=11,
                                                            eaten=(1, 9), sealed=True, note=("every notch off the line:", "the door will not open again")),
     "The Heartwood Door closed for winter: the pattern the rings must be turned to, every notch staggered off the line, the pith "
     "plugged and the line itself gone cold grey."),
]
for key, name, kw, doc in DOORS:
    def _mk(kw=kw, doc=doc):
        def draw(a: Art):
            door(a, **kw)
        draw.__doc__ = doc
        return draw
    asset(G, f"door-{key}", group="maps", title=name, w=800, h=800, row=ROW_D)(_mk())


GLYPHS = [
    ("floor-went-first", 5, "The floor went first", "Underhollow as Sorrel's grandmother told it: dwellings standing on a broken line, the floor under them gone to dots."),
    ("pulse", 6, "The Pulse", "A ring with small ticks inside it and nothing else: a rhythm that comes from no face of the Trunk."),
    ("turned-since", 7, "Turned since", "A ring with a turning arrow and its notch off the line: someone has turned the door since the Knot left it."),
    ("eaten-arc", 8, "The eaten arc", "A ring with part of its round missing and three specks where the wood was."),
]
for key, kind, name, doc in GLYPHS:
    def _mk(kind=kind, name=name, doc=doc):
        def draw(a: Art):
            a.paper("#f1e7d0", grain=0.35, fibre=1.1)
            a.rect(14, 14, 212, 212, fill="none", stroke=DTYPE, stroke_width=2)
            a.rect(22, 22, 196, 196, fill="none", stroke=DTYPE, stroke_width=0.8)
            a.circle(124, 101, 62, fill=kit.AMBER if kind != 6 and kind != 8 else kit.CHALK, opacity=0.55)
            a.open("g", filter=a.roughen(1.8, 0.07))
            a.circle(120, 104, 62, fill="none", stroke=DINK, stroke_width=2.5)
            chron(a, 120, 104, kind, s=3.0)
            a.close()
            a.text(120, 204, name.upper(), size=13 if len(name) < 16 else 11.5, family="serif", fill=DTYPE, text_anchor="middle",
                   letter_spacing=2.5 if len(name) < 16 else 1.2, font_weight="bold")
            for x, y in ((14, 14), (226, 14), (14, 226), (226, 226)):
                a.poly(a.star_pts(x, y, 8, 3, 4, 45), fill=kit.AMBER, stroke=DTYPE, stroke_width=1)
        draw.__doc__ = "A new chronicle glyph, printed letterpress in brown over an off-register tint. " + doc
        return draw
    asset(G, f"glyph-{key}", group="pieces", title=f"Chronicle glyph: {name}", w=240, h=240, row=ROW_D)(_mk())


# ---------------------------------------------------------------------------------------------
# Phase 3: the Heartwood interior, opened (the web build's stand-in for the Blender render that
# DEEP_DIVE.md section 4 lists). Only walls, mud and one lantern: nothing alive is drawn.
# ---------------------------------------------------------------------------------------------
@asset(G, "heartwood-interior-open", group="maps", title="The Heartwood, opened", w=1200, h=800, row=ROW_D)
def heartwood_interior_open(a: Art):
    """Through the round door of concentric rings, the inside of the Trunk: a tall dark void walled in thin pale layers
    like paper, ribbed with dried mud, a lantern on the threshold lighting a few centimetres, and cold chalk grey
    beyond. Chanter Hollow's offering bowls stand empty by the crack in the sill. Nothing alive is shown."""
    import math as _m
    r = a.rng
    a.rect(0, 0, 1200, 800, fill="#1b120c")
    kit.bark(a, 0, 0, 1200, 800, base="#7a5a40", scale=10, freq=(0.02, 0.004))
    a.rect(0, 0, 1200, 800, fill="#1b120c", opacity=0.45)
    cx, cy, R = 600, 420, 330
    # the opening: a void that goes a long way down
    hole = a.clip(f'<circle cx="{cx}" cy="{cy}" r="{R - 46}"/>')
    a.open("g", clip_path=hole)
    a.rect(0, 0, 1200, 800, fill=a.gradient([(0, "#0d0a09"), (0.55, "#2a2b2c"), (1, "#0b0807")]))
    # paper walls: thin pale layers receding, each a little greyer and smaller
    for k in range(9):
        t = k / 8
        w = 520 - t * 380
        x0, x1 = cx - w / 2, cx + w / 2
        top, bot = 120 + t * 210, 760 - t * 250
        col = kit.mix("#d9d2c0", kit.CHALK, min(1, t * 1.2))
        op = 0.9 - t * 0.55
        for side, x in ((-1, x0), (1, x1)):
            pts = [(x + side * (6 * _m.sin(j * 1.7 + k)), top + (bot - top) * j / 10) for j in range(11)]
            a.path(a.smooth_d(pts), fill="none", stroke=col, stroke_width=10 - t * 7, opacity=op)
            a.path(a.smooth_d([(px - side * 5, py) for px, py in pts]), fill="none", stroke="#5d676a", stroke_width=2, opacity=op * 0.8)
        # mud ribs across the gap between the walls
        for j in range(3):
            y = top + (bot - top) * (0.25 + 0.25 * j) + r.uniform(-8, 8)
            a.path(f"M{f(x0)},{f(y)} Q{f(cx)},{f(y + 14 - t * 8)} {f(x1)},{f(y)}", fill="none", stroke="#6a5644", stroke_width=5 - t * 3,
                   opacity=op * 0.7, stroke_linecap="round")
    # cold chalk light far down, and the lantern's few centimetres near the sill
    kit.glow(a, cx, 330, 160, kit.CHALK, 0.35)
    kit.glow(a, cx - 90, 690, 210, kit.LANTERN, 0.8)
    a.close()
    # the door's rings, standing open round the hole
    for i in range(7):
        rr = R - 40 + i * 7
        a.circle(cx + 2, cy + 3, rr, fill="none", stroke="#e9b77c", stroke_width=2.2, opacity=0.4)
        a.circle(cx, cy, rr, fill="none", stroke="#3a281c" if i % 2 else "#5a3d2b", stroke_width=6)
    a.circle(cx, cy, R - 46, fill="none", stroke="#0d0805", stroke_width=5)
    # the sill: a crack in it, the offering bowls by it, empty
    a.path(f"M{cx - 250},{cy + 250} Q{cx},{cy + 300} {cx + 250},{cy + 250} L{cx + 290},{cy + 330} H{cx - 290}Z", fill="#4a3324", stroke="#1b120c",
           stroke_width=3)
    a.path(f"M{cx + 30},{cy + 270} l12,22 l-8,16 l14,22", fill="none", stroke="#0d0805", stroke_width=5, stroke_linecap="round")
    for bx in (cx + 92, cx + 150, cx + 204):
        a.ellipse(bx, cy + 296, 22, 7, fill="#2a1d14", stroke="#e9b77c", stroke_width=1.6)
        a.path(f"M{bx - 22},{cy + 296} Q{bx},{cy + 320} {bx + 22},{cy + 296}", fill="#6a4a33", stroke="#1b120c", stroke_width=1.6)
    kit.lantern(a, cx - 90, cy + 262, 1.6, halo=70)
    kit.dust(a, cx - 260, 120, 520, 560, n=200, col="#e6eef0", opacity=0.35)
    a.vignette(0.55)

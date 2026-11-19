"""UI ornaments: ink-glyph prompts, fleurons, corner folds, the bookmark ribbon and the cup vignette."""
import math

from artkit import Art, f, sibling

K = sibling(__file__, "_kit")
ROW = "UI ornaments: ink-glyph prompts, fleurons, corner folds, ribbon, cup vignette"
INK = K.INK


# ---- ink-glyph prompts (160 x 160) ---------------------------------------------------------------
def P(a, strokes, w=5.5, **kw):
    K.pens(a, strokes, w=w, color=INK, **kw)


def g_read(a):
    P(a, [[(80, 58), (60, 46), (34, 46), (26, 52)], [(80, 58), (100, 46), (126, 46), (134, 52)], [(26, 52), (26, 108)],
          [(134, 52), (134, 108)], [(26, 108), (50, 100), (70, 104), (80, 114)], [(134, 108), (110, 100), (90, 104), (80, 114)],
          [(80, 58), (80, 112)]])
    P(a, [[(40, 64), (66, 62)], [(40, 78), (66, 76)], [(94, 62), (120, 64)], [(94, 76), (112, 77)]], w=3)


def g_take(a):
    P(a, [[(54, 124), (48, 96), (40, 76), (46, 70), (58, 84)], [(58, 84), (56, 44), (64, 42), (68, 76)],
          [(68, 76), (70, 34), (79, 34), (80, 74)], [(80, 74), (86, 40), (95, 42), (92, 78)],
          [(92, 78), (102, 56), (110, 60), (104, 90), (98, 124)]])
    P(a, [[(52, 130), (100, 130)]], w=4)


def g_sip(a):
    P(a, [[(40, 74), (44, 104), (60, 118), (92, 118), (108, 104), (112, 74)], [(36, 74), (116, 74)],
          [(112, 82), (130, 80), (130, 100), (108, 104)], [(46, 128), (106, 128)]])
    P(a, [[(62, 62), (56, 50), (66, 42), (60, 30)], [(84, 62), (78, 50), (88, 42), (82, 30)]], w=3.2)


def g_set_down(a):
    P(a, [[(48, 50), (52, 76), (64, 86), (90, 86), (102, 76), (106, 50)], [(44, 50), (110, 50)],
          [(106, 58), (122, 56), (122, 72), (102, 76)]])
    P(a, [[(77, 94), (77, 112)], [(68, 106), (77, 116), (86, 106)]], w=4)
    a.ellipse(77, 128, 36, 8, fill="none", stroke=INK, stroke_width=3, stroke_dasharray="12 5")


def g_sweep(a):
    P(a, [[(116, 28), (70, 88)]], w=6.5)
    P(a, [[(58, 84), (82, 100)], [(58, 84), (36, 120)], [(82, 100), (66, 136)], [(36, 120), (66, 136)], [(66, 92), (48, 126)],
          [(74, 98), (58, 132)]], w=4)
    K.stip(a, 80, 110, 60, 30, n=22, r=(1.2, 2.6), fill=INK, opacity=.9)


def g_wind(a):
    # the clock key
    a.circle(52, 60, 22, fill="none", stroke=INK, stroke_width=6)
    a.circle(52, 60, 8, fill=INK)
    P(a, [[(70, 72), (118, 110)], [(104, 98), (94, 110)], [(116, 108), (106, 120)]], w=6)
    a.path("M92,40 A34,34 0 0,1 122,70", fill="none", stroke=INK, stroke_width=4, stroke_linecap="round")
    a.poly([(126, 82), (114, 70), (130, 66)], fill=INK)


def g_climb(a):
    P(a, [[(52, 132), (64, 28)], [(96, 132), (108, 28)]], w=6, taper=(.05, .1))
    P(a, [[(54, 112), (98, 112)], [(57, 90), (101, 90)], [(59, 68), (103, 68)], [(62, 46), (106, 46)]], w=4.4)
    P(a, [[(122, 70), (122, 36)], [(114, 46), (122, 34), (130, 46)]], w=3.6)


def g_light(a):
    a.path("M80,84 C62,64 80,50 80,26 C98,50 104,66 80,84Z", fill=INK)
    a.path("M80,78 C72,68 80,62 80,50 C88,62 90,70 80,78Z", fill=K.VELLUM)
    P(a, [[(80, 84), (80, 96)], [(56, 98), (104, 98)], [(60, 98), (64, 126), (96, 126), (100, 98)], [(46, 132), (114, 132)]])
    P(a, [[(42, 44), (30, 36)], [(118, 44), (130, 36)], [(36, 70), (22, 70)], [(124, 70), (138, 70)]], w=3.2)


def g_look_away(a):
    # an eye turned hard aside: the iris at the far corner, the gaze leaving the page
    P(a, [[(22, 84), (50, 56), (104, 54), (134, 82)]], w=7)
    P(a, [[(22, 84), (56, 104), (104, 104), (134, 82)]], w=4)
    a.path("M112,60 A22,22 0 0,0 112,102 L132,82Z", fill=INK)
    a.circle(116, 78, 5, fill=K.VELLUM)
    P(a, [[(40, 46), (34, 34)], [(62, 38), (60, 24)], [(86, 36), (88, 22)]], w=3.2, taper=(.1, .6))
    P(a, [[(100, 126), (136, 122)], [(124, 112), (138, 122), (126, 134)]], w=3.6)


def g_one_more(a):
    # one more page: a leaf turning
    P(a, [[(40, 36), (40, 128)], [(40, 128), (112, 128)], [(40, 36), (92, 36)], [(112, 128), (112, 62)]])
    a.path("M92,36 L112,62 L88,60Z", fill=INK)
    P(a, [[(54, 60), (78, 60)], [(54, 78), (98, 78)], [(54, 96), (98, 96)], [(54, 112), (84, 112)]], w=3)
    a.path("M120,112 A26,26 0 0,0 132,76", fill="none", stroke=INK, stroke_width=4, stroke_linecap="round")
    a.poly([(134, 62), (124, 78), (140, 80)], fill=INK)


GLYPHS = [
    ("read", "Read", g_read, "an open book"), ("take", "Take", g_take, "an open hand"), ("sip", "Sip", g_sip, "the cup, steaming"),
    ("set-down", "Set the cup down", g_set_down, "the cup lowered onto its own ring"),
    ("sweep", "Sweep", g_sweep, "a broom and swept grains"), ("wind", "Wind the clock", g_wind, "the clock key and a turning arrow"),
    ("climb", "Climb", g_climb, "a ladder"), ("light", "Light a lamp", g_light, "a lamp flame"),
    ("look-away", "Look away", g_look_away, "an eye with its lid lowered and the gaze gone aside"),
    ("one-more-page", "One more page", g_one_more, "a leaf with its corner turning"),
]


def glyph(a: Art, fn):
    rough = a.roughen(4, .05)
    a.circle(84, 86, 68, fill=K.WALNUT, opacity=.3, filter=a.blur(5))
    a.circle(80, 80, 70, fill=K.VELLUM, stroke=K.INK2, stroke_width=1.6, filter=rough)
    K.grain(a, 10, 10, 140, 140, .2, .8, clip=a.clip('<circle cx="80" cy="80" r="69"/>'))
    fn(a)
    K.stip(a, 20, 20, 120, 120, n=7, r=(.8, 2), fill=INK, opacity=.7)


for _id, _t, _fn, _what in GLYPHS:
    K.reg(f"glyph-{_id}", "ui", f"Ink glyph: {_t}", 160, 160, ROW,
          f"The prompt for {_t.lower()}: {_what}, drawn with a dip pen on a small round of vellum.", glyph, _fn)


# ---- fleurons (600 x 120) ------------------------------------------------------------------------
def rules(a, gap=70, col=K.GOLD_D):
    for sx in (-1, 1):
        K.pen(a, [(300 + sx * gap, 60), (300 + sx * 150, 58), (300 + sx * 222, 60)], w=4.6, color=col, taper=(.05, .7))
        K.pen(a, [(300 + sx * (gap + 14), 68), (300 + sx * 130, 67), (300 + sx * 176, 68)], w=1.6, color=col, taper=(.05, .7))
        a.path(f"M{300 + sx * gap},60 l{sx * -8},-7 l{sx * -8},7 l{sx * 8},7Z", fill=col)


def f_leaf(a):
    rules(a, 86)
    for sx in (-1, 1):
        K.vine(a, [(300, 78), (300 + sx * 30, 60), (300 + sx * 66, 54)], color=K.SAGE_D, w=2.6, leaves=3, lsize=24, side=sx,
               tendril=False)
    K.leaf(a, 300, 80, 46, -math.pi / 2, fill=K.SAGE, wd=.42, lw=1.5)
    a.circle(300, 88, 5, fill=K.GOLD, stroke=INK, stroke_width=1)


def f_sand(a):
    rules(a, 64)
    a.path("M278,26 H322 L304,58 L322,94 H278 L296,58Z", fill=K.VELLUM, stroke=INK, stroke_width=2.2, stroke_linejoin="round")
    a.path("M286,34 H314 L300,56Z M300,62 L312,90 H288Z", fill="#D5D8DF", stroke=K.INK2, stroke_width=.8)
    a.path("M272,24 H328 M272,96 H328", stroke=INK, stroke_width=3.4, stroke_linecap="round")
    a.line(300, 56, 300, 80, stroke=K.OCHRE, stroke_width=1.4)
    for sx in (-1, 1):
        K.sand(a, 300 + sx * 90 - 60, 70, 120, 14, n=60, r=(.6, 1.6))


def f_moon(a):
    rules(a, 70)
    a.path("M306,26 A34,34 0 1,0 328,84 A28,28 0 1,1 306,26Z", fill=K.SILVER, stroke=INK, stroke_width=2)
    for x, y, s in ((264, 40, 7), (340, 44, 5), (276, 86, 4), (346, 76, 3)):
        a.path(f"M{x},{y - s} L{x + s * .3},{y - s * .3} L{x + s},{y} L{x + s * .3},{y + s * .3} L{x},{y + s} "
               f"L{x - s * .3},{y + s * .3} L{x - s},{y} L{x - s * .3},{y - s * .3}Z", fill=K.GOLD_D)
    for sx in (-1, 1):
        K.pen(a, [(300 + sx * 100, 84), (300 + sx * 150, 70), (300 + sx * 200, 84)], w=2.4, color=K.INK2, taper=(.3, .3))


def f_vine(a):
    rules(a, 96, col=K.BRUISE)
    K.pen(a, [(214, 66), (250, 40), (290, 70), (330, 46), (386, 62)], w=7, color=K.BRUISE, taper=(.2, .2))
    for pts in ([(250, 40), (240, 24), (254, 16)], [(290, 70), (296, 92), (282, 98)], [(330, 46), (346, 28), (360, 34)]):
        K.pen(a, pts, w=3.4, color=K.BRUISE, taper=(.05, .7))
    for x, y, ang in ((266, 52, -1.2), (312, 60, 1.2), (352, 50, -1.0)):
        K.leaf(a, x, y, 20, ang, fill="#8A6A9A", lw=1.1)


def f_wave(a):
    rules(a, 104, col=K.INK2)
    for j, y in enumerate((48, 68, 86)):
        d = "".join(f"M{232 + i * 34 + (17 if j % 2 else 0)},{y} q17,-22 34,0" for i in range(4 if not j % 2 else 3))
        a.path(d, fill="none", stroke=[INK, K.INK2, K.OCHRE][j], stroke_width=3.4 - j * .7, stroke_linecap="round")
    K.sand(a, 236, 20, 130, 20, n=40, r=(.6, 1.6))


def f_cup(a):
    rules(a, 84)
    top = K.cup_side(a, 296, 98, .8, tea=.8)
    for k in (-1, 0, 1):
        x = 296 + k * 11
        K.curve(a, [(x, top - 6), (x - 4, top - 14), (x + 4, top - 22), (x - 1, top - 30)], w=1.3, color=K.INK2, opacity=.6)


FLEURONS = [
    ("leaf", "leaf", f_leaf, "a sage leaf between two sprigs"), ("sand", "sandglass", f_sand, "a small sandglass, grains spilt along the rule"),
    ("moon", "moon", f_moon, "a silver crescent, four stars and two dune lines"), ("vine", "dune-vine", f_vine, "a knot of purple dune-vine"),
    ("wave", "sand waves", f_wave, "three rows of sand waves"), ("cup", "cup", f_cup, "the cup on its saucer, steaming"),
]


def fleuron_strip(a: Art, fn):
    K.page(a, K.VELLUM, g=.2, edge=.25)
    a.open("g", transform="translate(300 60) scale(1.3) translate(-300 -60)")
    fn(a)
    a.close()


for _id, _t, _fn, _what in FLEURONS:
    K.reg(f"fleuron-{_id}", "ui", f"Fleuron: {_t}", 600, 120, ROW,
          f"A divider for the journal and the chapter pages: {_what}, between tapering pen rules.", fleuron_strip, _fn)


# ---- corner folds (240 x 240) --------------------------------------------------------------------
FOLDS = [
    ("rest", "at rest", 46, "a small dog-ear at the top right of a page"),
    ("lifted", "lifted", 96, "the corner lifted, the word Leave showing on its underside"),
    ("turned", "turned", 170, "the corner turned right back to show the walnut table under the page"),
    ("pinned", "pinned", 46, "the dog-ear held down by a brass pin: this page may not be left yet"),
]


def fold(a: Art, idx):
    key, _, s, _ = FOLDS[idx]
    a.rect(0, 0, 240, 240, fill="#3B2617")
    a.path("".join(f"M0,{y}C80,{y + 6} 160,{y - 6} 240,{y}" for y in range(8, 240, 14)), stroke="#22150B", stroke_width=1.2,
           fill="none", opacity=.7)
    # the page, with its corner gone
    pg = f"M0,14 H{226 - s} L226,{14 + s} V240 H0Z"
    a.path(pg, fill="#000", opacity=.35, transform="translate(5 6)", filter=a.blur(4))
    a.path(pg, fill=K.VELLUM, stroke=K.INK2, stroke_width=1.2)
    K.grain(a, 0, 0, 240, 240, .2, .8, clip=a.clip(f'<path d="{pg}"/>'))
    a.path("M20,70 H150 M20,100 H190 M20,130 H190 M20,160 H170 M20,190 H190", stroke=K.VELLUM_S, stroke_width=3, stroke_linecap="round")
    # the folded flap
    fl = f"M{226 - s},14 L226,{14 + s} L{226 - s},{14 + s}Z"
    a.path(fl, fill="#000", opacity=.3, transform="translate(-4 5)", filter=a.blur(3))
    a.path(fl, fill=a.gradient([(0, "#D8C9A4"), (1, "#F7F0DC")], 1, 0, 0, 1), stroke=INK, stroke_width=1.6, stroke_linejoin="round")
    K.pen(a, [(226 - s, 14), (226, 14 + s)], w=2.6, color=INK, taper=(.1, .1))
    if key in ("lifted", "turned"):
        size = 22 if key == "lifted" else 34
        a.text(226 - s * .62, 14 + s * .82, "Leave", size=size, family="serif", fill=INK, font_style="italic", text_anchor="middle",
               transform=f"rotate(-45 {226 - s * .62} {14 + s * .82})")
    if key == "turned":
        K.pen(a, [(226 - s * .9, 14 + s * .96), (226 - s * .2, 14 + s * .96)], w=2, color=K.GOLD_D)
    if key == "pinned":
        cx, cy = 226 - s * .66, 14 + s * .66
        a.circle(cx + 2, cy + 3, 11, fill="#000", opacity=.35)
        a.circle(cx, cy, 11, fill=K.BRASS, stroke=INK, stroke_width=1.6)
        a.circle(cx - 3, cy - 3, 3.5, fill=K.BRASS_L)
        a.line(cx + 6, cy + 8, cx + 16, cy + 22, stroke=K.STEEL, stroke_width=2.4, stroke_linecap="round")


for _i, (_k, _t, _s, _what) in enumerate(FOLDS):
    K.reg(f"corner-fold-{_k}", "ui", f"Corner fold: {_t}", 240, 240, ROW,
          f"The Leave corner of a full-page game: {_what}.", fold, _i)


# ---- the bookmark ribbon (600 x 120) -------------------------------------------------------------
def weave(a, d, col, edge):
    a.path(d, fill=col, stroke=INK, stroke_width=1.8, stroke_linejoin="round")
    cl = a.clip(f'<path d="{d}"/>')
    a.hatch(0, 20, 600, 80, angle=60, spacing=7, clip=cl, stroke=edge, stroke_width=1, opacity=.5)
    a.hatch(0, 20, 600, 80, angle=-60, spacing=7, clip=cl, stroke="#fff", stroke_width=.7, opacity=.25)


def r_empty(a):
    a.path("M30,42 H570 V78 H30Z", fill="none", stroke=K.INK2, stroke_width=1.6, stroke_dasharray="9 7")
    a.path("M30,60 H570", stroke=K.INK2, stroke_width=.8, opacity=.4, stroke_dasharray="2 8")
    for x in (30, 570):
        a.circle(x, 60, 5, fill=K.VELLUM, stroke=K.INK2, stroke_width=1.4)


def r_grown(a):
    weave(a, "M20,42 C200,36 400,48 580,42 V78 C400,84 200,72 20,78Z", K.SAGE, K.SAGE_D)
    a.path("M20,48 C200,42 400,54 580,48 M20,72 C200,66 400,78 580,72", stroke=K.GOLD_D, stroke_width=1.4, fill="none")


def r_end(a):
    weave(a, "M20,42 C160,36 300,48 440,42 L500,40 L470,60 L504,82 L440,78 C300,84 160,72 20,78Z", K.SAGE, K.SAGE_D)
    a.path("M20,48 C160,42 300,54 440,48 M20,72 C160,66 300,78 440,72", stroke=K.GOLD_D, stroke_width=1.4, fill="none")
    K.stip(a, 500, 30, 80, 60, n=26, r=(1, 2.4), fill="#B8861C", opacity=.9)


def r_maudric(a):
    # older, purple gone grey, frayed, tied in a knot: it marks the quicker way past the books he read
    weave(a, "M20,44 C120,38 200,50 280,44 L276,78 C200,84 120,72 20,76Z", "#8A7A94", K.BRUISE)
    weave(a, "M320,44 C400,38 480,50 540,46 L560,52 L544,58 L566,66 L546,70 L560,80 C480,84 400,72 322,78Z", "#8A7A94", K.BRUISE)
    a.path(K.blob_d(a, 300, 60, 30, 24, n=9, jit=.12), fill="#7A6A86", stroke=INK, stroke_width=1.8)
    K.curve(a, [(284, 50), (300, 64), (318, 52)], w=1.6)
    K.curve(a, [(286, 72), (302, 60), (316, 72)], w=1.6)
    for k in range(7):
        y = 48 + k * 5
        a.line(560, y, 574 + a.rng.uniform(0, 14), y + a.rng.uniform(-3, 3), stroke=K.BRUISE, stroke_width=1.2, opacity=.8)
    a.circle(300, 60, 4, fill=K.BRASS, stroke=INK, stroke_width=1)


RIBBONS = [
    ("empty", "an empty length", r_empty, "an empty length, dashed, waiting for the next right junction"),
    ("grown", "a grown length", r_grown, "a woven sage length with gold selvedges, one right junction passed"),
    ("end", "the leading end", r_end, "the ribbon's swallow-tail end, gold motes just ahead of it"),
    ("maudric", "Maudric's ribbon", r_maudric, "an older ribbon gone grey-purple, knotted and frayed, with a brass bead in the knot"),
]


def ribbon(a: Art, fn):
    a.paper("#F2ECDC", grain=0.16)
    a.path("M0,104 H600", stroke="#2F2A22", stroke_width=1.3)
    fn(a)


for _id, _t, _fn, _what in RIBBONS:
    K.reg(f"ribbon-{_id}", "ui", f"Bookmark ribbon: {_t}", 600, 120, ROW,
          f"The progress ribbon across the top of the stacks: {_what}.", ribbon, _fn)


# ---- the cup vignette (240 x 240) ----------------------------------------------------------------
LEVELS = [("full", 1.0, "full, three wisps of steam"), ("three-quarters", .78, "three-quarters full"), ("half", .56, "half full, one wisp of steam"),
          ("quarter", .34, "a quarter full, tide rings above the tea"), ("dregs", .14, "down to the dregs; the sip prompt shows"),
          ("empty", 0, "empty: leaves and a stain, and the page closes")]


def cup_vig(a: Art, idx):
    key, t, _ = LEVELS[idx]
    rough = a.roughen(6, .04)
    K.wash(a, K.blob_d(a, 120, 124, 104, 100, jit=.08), K.VELLUM, .96, rough, edge=K.VELLUM_S)
    K.wash(a, K.blob_d(a, 118, 128, 84, 78, jit=.14), [K.GOLD, K.GOLD, K.OCHRE, K.OCHRE, K.SILVER, K.SILVER][idx], .22, rough)
    K.grain(a, 0, 0, 240, 240, .16, .8, clip=a.clip('<circle cx="120" cy="124" r="100"/>'))
    cx, cy, r = 112, 132, 62
    a.ellipse(cx + 6, cy + 10, r * 1.05, r, fill=K.WALNUT, opacity=.25, filter=a.blur(5))
    K.cup_top(a, cx, cy, r, tea=t, leaves=int(2 + 6 * t))
    # tide rings where the tea stood
    for k in range(idx):
        lv = LEVELS[k][1]
        if lv > t:
            a.circle(cx, cy, r * (0.42 + 0.4 * lv), fill="none", stroke="#8C6A2A", stroke_width=1.2, opacity=.45,
                     stroke_dasharray=f"{20 + k * 7} {5 + k * 2}")
    for k in range(max(0, 3 - idx)):
        x = cx - 18 + k * 18
        K.pen(a, [(x, cy - r - 4), (x - 7, cy - r - 22), (x + 6, cy - r - 38), (x - 2, cy - r - 54)], w=3, color=K.INK2,
              taper=(.2, .7), opacity=.6)
    if key == "dregs":
        # the sip prompt, small, at the rim
        a.circle(196, 60, 22, fill=K.VELLUM, stroke=INK, stroke_width=1.6)
        K.pens(a, [[(186, 56), (188, 68), (204, 68), (206, 56)], [(184, 56), (208, 56)], [(196, 50), (194, 44)]], w=2.6, color=INK)
    if key == "empty":
        K.pen(a, [(40, 200), (120, 214), (200, 198)], w=2.6, color=K.INK2, taper=(.3, .3))


for _i, (_k, _t, _what) in enumerate(LEVELS):
    K.reg(f"cup-vignette-{_i + 1}-{_k}", "ui", f"Cup vignette: {_k.replace('-', ' ')}", 240, 240, ROW,
          f"The cup in the corner of a book, seen from above on a torn round of vellum: {_what}.", cup_vig, _i)

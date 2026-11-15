"""The Clasps: six mechanisms as clockwork cutaways in flat brass tones."""
import math

from artkit import Art, f, sibling

K = sibling(__file__, "_kit")
ROW = "Clasp mechanisms, including the closing clasp"
EDGE = "#3A2A12"
COPPER = "#B4693A"
PIT = "#1E1510"


def cover(a, col, win, strap="#6B3A22", thread="#D8B878", frost=False):
    """A leather cover with a cutaway window into its works, and two stitched straps."""
    K.leather(a, col, vig=.6)
    for y in (46, a.h - 46):
        a.rect(0, y - 20, a.w, 40, fill=strap, stroke="#2A1408", stroke_width=2)
        a.stitch([(0, y - 12), (a.w, y - 12)], 8, 6, stroke=thread, stroke_width=1.6)
        a.stitch([(0, y + 12), (a.w, y + 12)], 8, 6, stroke=thread, stroke_width=1.6)
    a.path(win, fill=PIT, stroke="#120B07", stroke_width=10, stroke_linejoin="round")
    a.path(win, fill="none", stroke="#8A5E3C", stroke_width=2.5, transform="translate(5 5)", opacity=.8)
    cl = a.clip(f'<path d="{win}"/>')
    a.hatch(0, 0, a.w, a.h, angle=30, spacing=11, clip=cl, stroke="#2E2219", stroke_width=1.2)
    return cl


def plate(a, x, y, w, h, fill, rx=6, screws=True):
    a.rect(x + 4, y + 6, w, h, rx=rx, fill="#000", opacity=.35)
    a.rect(x, y, w, h, rx=rx, fill=fill, stroke=EDGE, stroke_width=2.4)
    a.path(f"M{x + rx},{y + 3} H{x + w - rx}", stroke=K.BRASS_L, stroke_width=2, opacity=.6, stroke_linecap="round")
    if screws:
        for sx, sy in ((x + 12, y + 12), (x + w - 12, y + 12), (x + 12, y + h - 12), (x + w - 12, y + h - 12)):
            a.circle(sx, sy, 5, fill=K.STEEL, stroke=EDGE, stroke_width=1.2)
            a.line(sx - 3, sy - 2, sx + 3, sy + 2, stroke=EDGE, stroke_width=1.2)


def furniture(a, moves="00"):
    """Reset lever top left, move counter top right, hint sigil bottom right."""
    a.rect(24, 90, 110, 54, rx=6, fill=PIT, stroke=K.BRASS, stroke_width=2)
    a.line(50, 130, 92, 100, stroke=K.STEEL, stroke_width=8, stroke_linecap="round")
    a.circle(92, 100, 9, fill="#A0412B", stroke=EDGE, stroke_width=1.2)
    a.rect(a.w - 150, 90, 126, 54, rx=6, fill=PIT, stroke=K.BRASS, stroke_width=2)
    a.text(a.w - 87, 126, f"MOVES {moves}", size=19, family="monospace", fill=K.BRASS_L, text_anchor="middle")
    sx, sy = a.w - 76, a.h - 130
    K.glow(a, sx, sy, 54, "#F6DC8A", .7)
    a.poly(Art.star_pts(sx, sy, 26, 11, 8), fill=K.BRASS_L, stroke=EDGE, stroke_width=1.5)
    a.circle(sx, sy, 6, fill=K.VERD)


def arrow(a, x0, y0, x1, y1, col=K.VERD, w=5):
    a.line(x0, y0, x1, y1, stroke=col, stroke_width=w, stroke_linecap="round")
    t = math.atan2(y1 - y0, x1 - x0)
    s = w * 3
    a.poly([(x1 + s * math.cos(t), y1 + s * math.sin(t)), (x1 + s * .7 * math.cos(t + 2.1), y1 + s * .7 * math.sin(t + 2.1)),
            (x1 + s * .7 * math.cos(t - 2.1), y1 + s * .7 * math.sin(t - 2.1))], fill=col)


# ---- 1: sliding bolt -----------------------------------------------------------------------------
def c_bolt(a: Art, frost=False, ox=250, oy=170, cell=96, tabs=None, own_cover=True):
    cols, rows = 5, 4
    if own_cover:
        cover(a, "#4A2B18", f"M{ox - 50},{oy - 44} H{ox + cols * cell + 150} V{oy + rows * cell + 44} H{ox - 50}Z")
    a.rect(ox - 14, oy - 14, cols * cell + 28, rows * cell + 28, rx=8, fill="#4A3424", stroke="#2A1C12", stroke_width=3)
    a.grid(ox, oy, cols * cell, rows * cell, cell, stroke="#2A1C12", stroke_width=1.2)
    # the release slot, on the right of the second row
    a.rect(ox + cols * cell + 10, oy + cell + 14, 110, cell - 28, rx=6, fill=PIT, stroke=K.BRASS, stroke_width=2,
           stroke_dasharray="8 6")
    arrow(a, ox + cols * cell + 26, oy + cell * 1.5, ox + cols * cell + 84, oy + cell * 1.5)
    tabs = tabs or [(0, 1, 2, 1, "bolt"), (2, 0, 1, 2, K.STEEL), (3, 1, 1, 2, COPPER), (0, 2, 2, 1, K.STEEL), (4, 0, 1, 1, K.BRASS_D),
                    (2, 3, 2, 1, COPPER), (4, 2, 1, 2, K.STEEL)][:6 if own_cover else 7]
    for (cx, cy, w, h, kind) in tabs:
        x, y = ox + cx * cell + 5, oy + cy * cell + 5
        fill = K.BRASS if kind == "bolt" else kind
        plate(a, x, y, w * cell - 10, h * cell - 10, fill, rx=8, screws=False)
        if kind == "bolt":
            a.rect(x + 16, y + 20, w * cell - 42, h * cell - 50, rx=4, fill="none", stroke=K.BRASS_D, stroke_width=3)
            a.poly([(x + w * cell - 44, y + 26), (x + w * cell - 22, y + h * cell / 2 - 5), (x + w * cell - 44, y + h * cell - 36)],
                   fill=K.BRASS_L, stroke=EDGE, stroke_width=1.5)
        else:
            # a finger groove
            g = "".join(f"M{f(x + w * cell / 2 - 16 + k * 8)},{f(y + h * cell / 2 - 14)}v20" for k in range(4))
            a.path(g, stroke=EDGE, stroke_width=2, opacity=.5, stroke_linecap="round")
    if own_cover:
        furniture(a, "04")


# ---- 2: lever bank -------------------------------------------------------------------------------
def c_levers(a: Art):
    cover(a, "#3F2A1A", "M150,170 H850 V600 H150Z")
    plate(a, 190, 470, 620, 70, K.BRASS_D)
    up = [True, False, True, True, False]
    for k in range(5):
        x = 250 + k * 125
        # the link rods to its neighbours
        if k < 4:
            a.path(f"M{x},{430} q62,-34 125,0", fill="none", stroke=K.STEEL, stroke_width=5)
            a.circle(x + 62, 413, 6, fill=K.BRASS, stroke=EDGE, stroke_width=1.2)
        ang = -58 if up[k] else -6
        a.open("g", transform=f"translate({x} 470) rotate({ang})")
        a.rect(-14, -210, 28, 220, rx=12, fill=K.BRASS if up[k] else COPPER, stroke=EDGE, stroke_width=2.4)
        a.rect(-8, -200, 6, 190, rx=3, fill=K.BRASS_L, opacity=.6)
        a.circle(0, -206, 24, fill=K.WALNUT_L, stroke=EDGE, stroke_width=2.4)
        a.circle(-6, -212, 7, fill="#fff", opacity=.2)
        a.close()
        a.circle(x, 470, 20, fill=K.STEEL, stroke=EDGE, stroke_width=2.4)
        a.circle(x, 470, 6, fill=PIT)
        a.text(x, 524, str(k + 1), size=22, family="serif", fill=K.BRASS_L, text_anchor="middle", font_weight="bold")
    # pressing one flips it and its neighbours
    for x in (375, 500, 625):
        K.arc_arrow(a, x, 470, 46, x != 500, w=3)
    a.path("M500,250 v60", stroke=K.VERD, stroke_width=5, stroke_linecap="round")
    a.poly([(500, 326), (488, 306), (512, 306)], fill=K.VERD)
    furniture(a, "01")


# ---- 3: strap fold -------------------------------------------------------------------------------
def strap(a, x0, y0, x1, y1, wd, col, thread, buckle=True):
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy)
    ang = math.degrees(math.atan2(dy, dx))
    a.open("g", transform=f"translate({f(x0)} {f(y0)}) rotate({f(ang)})")
    a.rect(4, -wd / 2 + 7, L, wd, rx=4, fill="#000", opacity=.4)
    a.rect(0, -wd / 2, L, wd, rx=4, fill=col, stroke="#2A1408", stroke_width=2)
    a.stitch([(6, -wd / 2 + 7), (L - 6, -wd / 2 + 7)], 8, 6, stroke=thread, stroke_width=1.5)
    a.stitch([(6, wd / 2 - 7), (L - 6, wd / 2 - 7)], 8, 6, stroke=thread, stroke_width=1.5)
    if buckle:
        a.rect(L - 70, -wd / 2 - 6, 46, wd + 12, rx=6, fill="none", stroke=K.BRASS, stroke_width=7)
        a.rect(L - 70, -wd / 2 - 6, 46, wd + 12, rx=6, fill="none", stroke=EDGE, stroke_width=1.2)
        a.line(L - 66, 0, L - 30, 0, stroke=K.STEEL, stroke_width=5, stroke_linecap="round")
        for k in range(3):
            a.circle(L - 100 - k * 26, 0, 4, fill=PIT)
    a.close()


def c_straps(a: Art):
    K.leather(a, "#34404C", vig=.6)
    K.fillet(a, 40, 40, 920, 670, K.brass(a), wd=3, inner=9)
    # the hasp, under everything
    plate(a, 430, 310, 140, 130, K.BRASS)
    a.circle(500, 375, 30, fill=K.BRASS_D, stroke=EDGE, stroke_width=2)
    a.path("M500,360 v30 M488,375 h24", stroke=K.BRASS_L, stroke_width=4, stroke_linecap="round")
    th = "#D8C8A8"
    # three layers: two under, two across, two on top
    strap(a, 90, 250, 910, 250, 54, "#59402C", th)
    strap(a, 90, 500, 910, 500, 54, "#59402C", th)
    strap(a, 330, 90, 330, 690, 54, "#6E5238", th)
    strap(a, 670, 90, 670, 690, 54, "#6E5238", th)
    strap(a, 150, 640, 860, 130, 54, "#86664A", th)
    strap(a, 150, 110, 860, 620, 54, "#86664A", th)
    # the top strap may lift: nothing lies across it
    K.glow(a, 505, 365, 70, K.VERD, .3)
    for k, (x, y) in enumerate(((880, 606), (880, 146), (330, 706), (670, 706), (930, 250), (930, 500))):
        a.circle(x, y, 17, fill=PIT, stroke=K.BRASS, stroke_width=2)
        a.text(x, y + 7, str(k + 1), size=20, family="serif", fill=K.BRASS_L, text_anchor="middle", font_weight="bold")
    a.path("M800,560 q30,-30 60,-16", fill="none", stroke=K.VERD, stroke_width=5, stroke_linecap="round")
    a.poly([(874, 548), (852, 536), (856, 560)], fill=K.VERD)
    furniture(a, "00")


# ---- 4: gear train -------------------------------------------------------------------------------
RAD = {1: 38, 2: 56, 3: 74}


def pegboard(a, ox, oy, sp, cols=5, rows=4):
    a.rect(ox - 56, oy - 56, (cols - 1) * sp + 112, (rows - 1) * sp + 112, rx=12, fill="#4A3424", stroke="#2A1C12", stroke_width=3)
    for j in range(rows):
        for i in range(cols):
            a.circle(ox + i * sp, oy + j * sp, 8, fill="#2A1C12")
            a.circle(ox + i * sp, oy + j * sp, 4.5, fill=K.STEEL)


def c_gears(a: Art):
    cover(a, "#4E4438", "M150,130 H860 L880,560 H140Z")
    ox, oy, sp = 270, 200, 112
    pegboard(a, ox, oy, sp)
    # the knob and its crank on the left, the latch gear on the right; the board between them is open
    kx, ky = ox, oy + sp
    K.gear(a, kx, ky, RAD[1], K.BRASS)
    a.line(kx, ky, kx - 96, ky + 40, stroke=K.STEEL, stroke_width=11, stroke_linecap="round")
    a.circle(kx - 96, ky + 40, 16, fill=K.WALNUT_L, stroke="#2A1C12", stroke_width=3)
    K.arc_arrow(a, kx, ky, RAD[1] + 18, True)
    lx, ly = ox + 4 * sp, oy + 2 * sp
    K.gear(a, lx, ly, RAD[1], K.BRASS, rot=.3)
    a.circle(lx, ly, RAD[1] + 18, fill="none", stroke=K.VERD, stroke_width=3, stroke_dasharray="5 7")
    K.arc_arrow(a, lx, ly, RAD[1] + 18, True)
    a.rect(lx + 30, ly + RAD[1] + 2, 90, 18, fill=K.BRASS_D, stroke=EDGE, stroke_width=2)
    a.rect(lx + 96, ly + RAD[1] - 16, 60, 54, rx=5, fill=K.STEEL, stroke=EDGE, stroke_width=2.4)
    # one gear already placed, turning the other way
    K.gear(a, ox + sp, oy + sp, RAD[3], COPPER, rot=.1, dark="#8A4A24")
    K.arc_arrow(a, ox + sp, oy + sp, RAD[3] + 16, False)
    # ghost seats: where the remaining gears could go
    for (i, j, s) in ((2, 2, 1), (3, 2, 3)):
        a.circle(ox + i * sp, oy + j * sp, RAD[s] + 4, fill="none", stroke=K.BRASS_L, stroke_width=1.8, stroke_dasharray="6 7",
                 opacity=.7)
    # the tray: six gears, four needed
    a.rect(170, 590, 660, 110, rx=10, fill=PIT, stroke=K.BRASS_D, stroke_width=2.4)
    for k, (s, col) in enumerate(((1, K.STEEL), (1, K.BRASS), (2, K.STEEL), (2, COPPER), (3, K.BRASS), (3, K.STEEL))):
        K.gear(a, 232 + k * 108, 645, RAD[s] * .56, col, rot=k * .4, depth=6)
        a.text(232 + k * 108 + 36, 692, str(s), size=15, family="monospace", fill=K.BRASS_L)
    furniture(a, "02")


# ---- 5: the black book ---------------------------------------------------------------------------
def c_black(a: Art):
    K.leather(a, "#0E1622", vig=.75)
    # one candle, lower left: the only light, and the only way to melt the frost
    K.glow(a, 150, 560, 380, K.LANTERN, .45)
    cl = a.clip('<rect x="0" y="0" width="1000" height="750"/>')
    # stage two and three show through the window: the bolt housing and the last gear
    win = "M240,150 H900 V600 H240Z"
    a.path(win, fill=PIT, stroke="#05080D", stroke_width=10)
    a.hatch(240, 150, 660, 450, angle=30, spacing=11, clip=a.clip(f'<path d="{win}"/>'), stroke="#1B2636", stroke_width=1.2)
    c_bolt(a, ox=290, oy=200, cell=70, own_cover=False)
    gx, gy = 800, 480
    K.gear(a, gx, gy, 62, K.BRASS, rot=.2)
    K.gear(a, gx - 96, gy + 40, 38, K.STEEL, rot=.5)
    K.arc_arrow(a, gx, gy, 80, False)          # the last gear must turn counter-clockwise
    # stage one: three straps, stiff with frost, across the window
    th = "#AEBBCB"
    strap(a, 200, 240, 950, 240, 50, "#27313F", th)
    strap(a, 200, 430, 950, 430, 50, "#27313F", th)
    strap(a, 560, 110, 560, 650, 50, "#313C4C", th)
    for (x, y, w, h) in ((200, 212, 750, 56), (200, 402, 750, 56), (532, 110, 56, 540)):
        K.stip(a, x, y, w, h, n=260, r=(.6, 1.9), fill="#E6EEF8", opacity=.9,
               density=lambda px, py: min(1, .15 + math.hypot(px - 150, py - 560) / 700))
    d = "".join(f"M{x},{266 if x % 2 else 456}v{f(a.rng.uniform(5, 20))}" for x in range(420, 940, 13))
    a.path(d, stroke="#E6EEF8", stroke_width=2, stroke_linecap="round", fill="none", opacity=.85)
    # where the candle has reached, the frost is gone and the leather is wet
    a.path("M200,402 h150 v56 h-150Z", fill="#3A2A1A", opacity=.45)
    # the candle: each melt shortens it
    a.rect(132, 590, 36, 96, fill="#E8E0CC", stroke=EDGE, stroke_width=2)
    for k in range(3):
        a.line(132, 610 + k * 24, 146, 610 + k * 24, stroke=EDGE, stroke_width=1.6)
    a.path("M150,588 C136,570 150,560 150,540 C164,560 166,574 150,588Z", fill=K.GOLD_L, stroke=K.LANTERN, stroke_width=2)
    a.ellipse(150, 690, 44, 10, fill=K.BRASS_D, stroke=EDGE, stroke_width=2)
    a.path("M168,600 q10,10 2,26", stroke="#E8E0CC", stroke_width=6, fill="none", stroke_linecap="round")
    furniture(a, "11")


# ---- 6: the closing clasp ------------------------------------------------------------------------
def c_close(a: Art):
    K.leather(a, "#6B4A26", vig=.6)
    g = K.brass(a)
    K.fillet(a, 40, 40, 920, 670, g, wd=3, inner=9)
    # the fore-edge of the sand book runs down the middle: boards either side, pages between, sand leaving them
    a.rect(470, 0, 60, 750, fill=K.VELLUM_D)
    a.path("".join(f"M{x},0V750" for x in range(476, 530, 6)), stroke=K.VELLUM_S, stroke_width=1.2)
    a.rect(456, 0, 14, 750, fill="#4A3018")
    a.rect(530, 0, 14, 750, fill="#4A3018")
    K.sand(a, 440, 0, 120, 750, n=420, r=(.6, 1.8), density=lambda x, y: max(0, 1 - abs(x - 500) / 60) * (.3 + .7 * y / 750))
    K.sand_pile(a, 500, 750, 190, 60, n=420)
    # the catch plate on the left board, with its pin
    plate(a, 190, 300, 200, 150, K.BRASS)
    a.circle(330, 375, 20, fill=K.STEEL, stroke=EDGE, stroke_width=2.4)
    a.circle(330, 375, 7, fill=PIT)
    a.rect(232, 352, 60, 46, rx=6, fill=K.BRASS_D, stroke=EDGE, stroke_width=2)
    # the hasp on the right board: hinged, standing open, its eye not yet over the pin
    plate(a, 620, 300, 190, 150, K.BRASS)
    for y in (322, 375, 428):
        a.rect(604, y - 14, 36, 28, rx=8, fill=K.BRASS_D, stroke=EDGE, stroke_width=2)
    a.line(622, 300, 622, 450, stroke=K.STEEL, stroke_width=5)
    a.open("g", transform="rotate(-24 622 375)")
    a.path("M622,340 H470 Q400,340 400,375 Q400,410 470,410 H622Z", fill=K.BRASS_L, stroke=EDGE, stroke_width=2.6)
    a.path("M470,356 H600 M470,394 H600", stroke=K.BRASS_D, stroke_width=2.4)
    a.circle(442, 375, 21, fill=PIT, stroke=EDGE, stroke_width=2.4)
    a.close()
    a.path("M616,330 l-178,-78", stroke="#000", stroke_width=14, opacity=.18, stroke_linecap="round",
           transform="translate(10 40)")
    # the one move: swing it down and shut
    a.path("M410,250 A150,150 0 0,0 372,330", fill="none", stroke=K.VERD, stroke_width=6, stroke_linecap="round")
    a.poly([(366, 348), (358, 322), (384, 328)], fill=K.VERD)
    # the cup, set down on the cover while he does it: a ring under it
    K.tea_ring(a, 780, 590, 66, color="#3A2410", op=.45, gap=.1)
    K.cup_top(a, 772, 580, 58, tea=.5, leaves=4)
    furniture(a, "00")


CLASPS = [
    ("c3a-sliding-bolt", "Sliding bolt", c_bolt,
     "A cutaway of the first clasp: six brass, steel and copper tabs in a four by five housing, the two-wide bolt tab "
     "with its arrow, and the release slot waiting on the right."),
    ("c3b-lever-bank", "Lever bank", c_levers,
     "A cutaway of the lever bank: five brass levers on one rail, three raised and two flat, joined to their neighbours "
     "by link rods so that pressing one flips three."),
    ("c5-strap-fold", "Strap fold", c_straps,
     "Six stitched leather straps crossing a slate cover in three layers over a brass hasp; only a strap with nothing "
     "across it will lift, and the top one is ready."),
    ("c7-gear-train", "Gear train", c_gears,
     "A five by four peg board in a cutaway: the cranked knob on the left, the latch gear and its bolt on the right, one "
     "copper gear placed and turning against them, and six gears in the tray."),
    ("c8-black-book", "The black book's compound clasp", c_black,
     "The black book by one candle: three straps stiff with frost across a window onto a sliding bolt and a last gear "
     "that must turn counter-clockwise. Where the candle has reached, the frost is gone, and the candle is shorter."),
    ("closing-clasp", "The closing clasp", c_close,
     "The sand book's own clasp, seen open across its fore-edge: a hinged hasp standing clear of its pin, an arrow that "
     "swings it shut, sand still leaving the pages, and the cup set down beside it on the cover."),
]
for _id, _t, _fn, _doc in CLASPS:
    K.reg(f"clasp-{_id}", "maps", f"Clasp: {_t}", 1000, 750, ROW, _doc, _fn)

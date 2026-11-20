"""Dr. Tox: Altrulan gameplay pictographs. Built by tools/pictographs/build.py.

Altrulan is the bible's second phase, drawn in its own register: "Sculptural, textured, non-comic
illustration style" (Part I). Every page here is a made surface: carved stone, wet plaster, wax on
paper, slip on clay, cast bronze, hammered gold.
"""
import math

from core import H, W, Pic, f, register

G = "dr-tox-altrulan"

# palette (DESIGN.md section 15)
LIME, LIME2, LIME3 = "#E8E0CF", "#CFC4AE", "#A89C84"     # limestone and lime plaster
TERRA, TERRA2, SLIP = "#B5653A", "#8E4A2C", "#E9D9BC"    # terracotta and cream slip
BRONZE, BRONZE2, BRONZE3 = "#A07A3C", "#6B5530", "#C9A25E"
VERDI = "#5E8A80"                                         # matte verdigris (never luminous)
GOLD, GOLD2, GOLD3 = "#D9B45A", "#A9852F", "#F3DE9A"     # gold leaf, repousse shadow and light
VINE, MOSS = "#5F6B3A", "#8C8F55"
FUNGUS = "#CFE6EA"                                        # fungus light, pale blue-white
AMBER = "#D99A2B"                                         # the sacrament (and the old cage's colour)
TEAL = "#5E7375"                                          # the Age, where it shows through
SKY = "#7FA9D6"                                           # the Sky-Daughter
OCHRE, LAPIS, TERREVERTE, SINOPIA = "#C98F3B", "#3F5E8C", "#8A957A", "#9A4A30"
HEEL = "#151311"                                          # heelball wax
PAPER = "#F4F1E8"


def relief(p: Pic, d, base, light, shadow, depth=4, **kw):
    """A shape carved in low relief: a shadow edge down-right, a lit edge up-left, then the face."""
    p.path(d, fill=shadow, transform=f"translate({depth} {depth})")
    p.path(d, fill=light, transform=f"translate({-depth / 2} {-depth / 2})")
    p.path(d, fill=base, **kw)


def pts_d(pts, closed=True):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if closed else "")


def robed(x, y, s=1.0):
    """A robed walking figure, feet at (x, y), simplified as for a frieze."""
    h = 110 * s
    return pts_d([(x - 7 * s, y - h), (x + 8 * s, y - h), (x + 10 * s, y - h + 16 * s), (x + 5 * s, y - h + 22 * s),
                  (x + 18 * s, y - h + 34 * s), (x + 24 * s, y), (x - 20 * s, y), (x - 14 * s, y - h + 36 * s),
                  (x - 6 * s, y - h + 22 * s), (x - 10 * s, y - h + 14 * s)])


# ---- 2D: Root-way (carved stone frieze) ----------------------------------------------------------
@register(G, "rootway")
def rootway(p: Pic):
    """Root-way (2D): a long carved limestone frieze read left to right. The Glass Mountains stand as
    carved pillars; between them run vines carved like ropes, and on the city's breath they swell into
    bridges (a carved ripple in the upper register marks the breath, in and out). The keeper leads in
    low relief along a swollen vine with her staff braced, and the pilgrims follow in a file, the
    slowest last; a child walks at her father's side. One tower is still: its vine hangs straight and
    dry and the file must go the long way round inside it. A meander border along the foot carries a
    marker for how far the band has come."""
    p.paper(LIME, grain=0.35, fibre=0.7)
    p.stipple(0, 0, W, H, n=1400, r=(0.6, 1.8), fill=LIME3, opacity=0.35)
    # the frieze band and its mouldings
    p.rect(0, 70, W, 26, fill=LIME2)
    p.rect(0, 92, W, 6, fill=LIME3)
    p.rect(0, 640, W, 8, fill=LIME3)
    p.rect(0, 648, W, 92, fill=LIME2)
    # meander border with the progress marker
    x = 20
    while x < W - 40:
        p.path(f"M{x},726 l0,-56 l40,0 l0,40 l-24,0 l0,-20 l10,0", fill="none", stroke=LIME3, stroke_width=6)
        x += 52
    p.circle(430, 694, 14, fill=AMBER, stroke=BRONZE2, stroke_width=3)
    # the breath register: carved ripples, swelling then slack
    for i, r in enumerate((26, 44, 62)):
        p.ellipse(150, 140, r * 1.6, r * 0.55, fill="none", stroke=LIME3, stroke_width=5, opacity=0.9 - i * 0.2)
    p.text(250, 150, "IN", size=26, family="serif", fill=LIME3, font_weight="bold")
    p.text(1040, 150, "OUT", size=26, family="serif", fill=LIME3, font_weight="bold")
    p.path("M300,140 C520,110 760,110 1010,140", fill="none", stroke=LIME3, stroke_width=4, stroke_dasharray="14 10")
    # towers: carved pillars, one of them still
    towers = [(90, "live"), (420, "live"), (760, "still"), (1090, "live")]
    for tx, kind in towers:
        d = pts_d([(tx - 46, 640), (tx - 40, 190), (tx - 20, 170), (tx + 20, 170), (tx + 40, 190), (tx + 46, 640)])
        relief(p, d, LIME2 if kind == "live" else "#c2b9a6", "#f6f0e2", LIME3, depth=6)
        for yy in range(220, 620, 46):
            p.line(tx - 34, yy, tx + 34, yy, stroke=LIME3, stroke_width=2, opacity=0.7)
        if kind == "still":
            p.line(tx + 52, 230, tx + 52, 600, stroke=LIME3, stroke_width=7, stroke_dasharray="3 9")
            p.text(tx - 36, 205, "STILL", size=20, family="serif", fill=LIME3, font_weight="bold")
    # vines as carved ropes between living towers; the first swollen into a bridge
    def vine(x1, x2, y, sag, swell):
        top = f"M{x1},{y} C{x1 + (x2 - x1) * 0.3},{y + sag - swell} {x1 + (x2 - x1) * 0.7},{y + sag - swell} {x2},{y}"
        p.path(top, fill="none", stroke=LIME3, stroke_width=26 + swell * 0.3, transform="translate(4 5)")
        p.path(top, fill="none", stroke="#f6f0e2", stroke_width=22 + swell * 0.3, transform="translate(-2 -2)")
        p.path(top, fill="none", stroke=MOSS, stroke_width=20 + swell * 0.3, opacity=0.55)
        for k in range(1, 9):
            t = k / 9
            xx = x1 + (x2 - x1) * t
            yy = y + (sag - swell) * 4 * t * (1 - t) * 0.75
            p.line(xx - 6, yy - 10, xx + 6, yy + 10, stroke=VINE, stroke_width=3, opacity=0.8)
    vine(136, 374, 470, 70, 60)    # swollen: a bridge
    vine(466, 714, 430, 110, 10)   # slack
    vine(806, 1044, 470, 90, 50)
    # the file on the swollen vine: keeper first, staff braced, then pilgrims
    walkers = [(330, 1.05, "keeper"), (285, 0.95, "p"), (248, 0.95, "p"), (220, 0.62, "child"), (196, 0.95, "p"), (160, 0.85, "slow")]
    for x, s, who in walkers:
        y = 470 + 70 * 4 * ((x - 136) / 238) * (1 - (x - 136) / 238) * 0.75 - 60 * 4 * ((x - 136) / 238) * (1 - (x - 136) / 238) * 0.75
        relief(p, robed(x, y - 6, s), LIME2 if who != "keeper" else BRONZE3, "#fbf6ea", LIME3, depth=4)
        if who == "keeper":
            p.line(x + 22, y - 110, x + 34, y - 4, stroke=BRONZE2, stroke_width=6, stroke_linecap="round")
            p.circle(x + 22, y - 112, 6, fill=AMBER)
    # the Ghost: only wet footprints ahead on the next vine
    for k, xx in enumerate((480, 512, 544, 576)):
        p.ellipse(xx, 428 + k * 6, 7, 4, fill=FUNGUS, stroke=LIME3, stroke_width=1.5)
    p.text(470, 395, "his footprints", size=18, family="serif", fill=LIME3, font_style="italic")


# ---- 2D: Fresco walk (buon fresco on cracked plaster) --------------------------------------------
@register(G, "fresco")
def fresco(p: Pic):
    """Fresco walk (2D): a scripture wall in true fresco, earth pigments laid into wet lime plaster in
    daily patches whose seams still show. Painted left to right: the Suit-Demons on their Mountains,
    the Caged coming up out of the cave with amber in his arm, Aleglethan's halos round the Heart of the
    Mountain. Cracks branch through it; at one the plaster has flaked away and the old concrete beneath
    shows in cold grey with a painted line in a hand that is not scripture's (STAY OUTSIDE THE RING). The
    keeper walks a scaffold plank with a trowel and a pot, the day's plaster still wet ahead of her and a
    band of daylight moving along the wall: mend the crack while the patch is wet, or lean in and look."""
    p.paper(LIME, grain=0.4, fibre=0.55)
    # giornate: irregular day patches
    seams = [(0, 0), (260, 30), (520, 0), (780, 40), (1010, 10), (W, 0)]
    for (x1, j1), (x2, j2) in zip(seams, seams[1:]):
        p.wobble([(x1, 60 + j1), (x2, 60 + j2), (x2, 560), (x1, 560)], amp=3, closed=True,
                 fill="#efe6d2" if x1 % 520 else "#ebe1cb", stroke=LIME2, stroke_width=2)
    # painted scenes in earth pigments
    # the Mountains and the Suit-Demons
    for i, (mx, mh) in enumerate(((60, 330), (150, 400), (230, 300))):
        p.poly([(mx - 40, 520), (mx - 30, 520 - mh), (mx + 30, 520 - mh), (mx + 40, 520)], fill=TERREVERTE, opacity=0.75)
        p.rect(mx - 18, 520 - mh - 26, 36, 26, fill=SINOPIA, opacity=0.9)  # a seated demon in a suit, as a block
        p.circle(mx, 520 - mh - 36, 10, fill=SINOPIA)
    p.text(40, 552, "THE SUIT-DEMONS ON THEIR MOUNTAINS", size=15, family="serif", fill=SINOPIA)
    # the Caged with amber in his arm
    p.path(robed(420, 520, 2.6), fill=OCHRE, opacity=0.85)
    p.circle(452, 300, 16, fill=AMBER, stroke=SINOPIA, stroke_width=2)
    p.path("M404,236 l0,-30 M436,236 l0,-30", stroke=SINOPIA, stroke_width=3)  # the cage's bars, as a crown
    p.text(318, 552, "THE CAGED COMES UP", size=15, family="serif", fill=SINOPIA)
    # Aleglethan's halos round the Heart of the Mountain
    for r in (40, 64, 88, 112):
        p.circle(890, 300, r, fill="none", stroke=GOLD, stroke_width=7, opacity=0.85)
    p.path(robed(890, 420, 1.9), fill=LAPIS, opacity=0.8)
    p.text(790, 552, "ALEGLETHAN SETS HIS HALOS", size=15, family="serif", fill=SINOPIA)
    # cracks
    def crack(pts, w=2.5):
        p.wobble(pts, amp=2.5, step=10, stroke="#5b5144", stroke_width=w)
    crack([(520, 70), (548, 170), (536, 260), (566, 360), (552, 480)], 3)
    crack([(548, 170), (600, 196), (640, 186)])
    crack([(566, 360), (606, 392)])
    crack([(1060, 90), (1040, 220), (1080, 330)])
    # a flake gone: the Age beneath in cold grey
    flake = [(600, 300), (700, 280), (740, 330), (724, 420), (640, 438), (596, 390)]
    p.poly(flake, fill=TEAL)
    p.hatch(596, 280, 150, 160, angle=80, spacing=6, clip=p.clip(f'<polygon points="{" ".join(f"{a},{b}" for a, b in flake)}"/>'),
            stroke="#4a5d5f", stroke_width=1)
    p.wobble(flake, amp=2, closed=True, stroke=LIME2, stroke_width=5)
    p.text(610, 352, "STAY OUTSIDE", size=20, family="sans-serif", fill="#141414", font_weight="bold")
    p.text(626, 380, "THE RING", size=20, family="sans-serif", fill="#141414", font_weight="bold")
    # the band of moving daylight
    p.rect(250, 60, 210, 500, fill="#fff6dc", opacity=0.22)
    # scaffold and keeper
    p.rect(0, 600, W, 16, fill=TERRA2)
    for lx in (120, 520, 920):
        p.poly([(lx, 616), (lx + 60, 616), (lx + 80, 760), (lx - 20, 760)], fill="none", stroke=TERRA2, stroke_width=8)
    p.path(robed(520, 600, 1.4), fill="#6f5a45")
    p.line(540, 486, 584, 446, stroke="#3d3229", stroke_width=6, stroke_linecap="round")
    p.poly([(580, 434), (602, 440), (592, 460)], fill="#9a8f80")
    p.ellipse(470, 596, 22, 10, fill=LIME2, stroke="#6f5a45", stroke_width=3)
    # choices
    p.rect(760, 640, 180, 44, fill=PAPER, stroke=SINOPIA, stroke_width=3)
    p.text(780, 670, "MEND (wet)", size=22, family="serif", fill=SINOPIA)
    p.rect(960, 640, 180, 44, fill=PAPER, stroke=TEAL, stroke_width=3)
    p.text(990, 670, "LOOK IN", size=22, family="serif", fill=TEAL)
    p.text(40, 700, "the day's plaster dries as the light moves", size=20, family="serif", fill=TERRA2, font_style="italic")


# ---- 1D: Rubbing (heelball brass rubbing) ---------------------------------------------------------
@register(G, "rubbing")
def rubbing(p: Pic):
    """Rubbing (1D): a sheet of white paper over the brass of the Twelve, weighted at its corners, and
    a block of black heelball wax. Where it has been rubbed the brass comes up black and every engraved
    line stays white: twelve standing figures in two rows, the tallest ringed with halos. The rest of the
    sheet is still blank paper with the faint shadow of the brass beneath. A corner turned back shows the
    brass's other face, an older plate whose raised letters RCC come up black where the wax has passed."""
    p.paper("#3b3530", grain=0.4)
    # the paper sheet
    sx, sy, sw, sh = 140, 70, 840, 640
    p.rect(sx + 8, sy + 10, sw, sh, fill="#000", opacity=0.35)
    p.rect(sx, sy, sw, sh, fill=PAPER)
    # weights
    for wx, wy in ((sx - 10, sy - 10), (sx + sw - 50, sy - 10), (sx - 10, sy + sh - 50), (sx + sw - 50, sy + sh - 50)):
        p.rect(wx, wy, 60, 60, fill="#6d6458", stroke="#2a2622", stroke_width=3)
    # rubbed region: a big irregular black field with white engraved lines
    region = [(sx + 40, sy + 40), (sx + 560, sy + 30), (sx + 600, sy + 260), (sx + 520, sy + 420), (sx + 300, sy + 470),
              (sx + 60, sy + 430)]
    p.poly(region, fill=HEEL)
    clip = p.clip(f'<polygon points="{" ".join(f"{a},{b}" for a, b in region)}"/>')
    p.hatch(sx, sy, 640, 520, angle=20, spacing=3, clip=clip, stroke="#2b2724", stroke_width=1.2)
    # the Twelve, as white engraved lines, two rows
    p.open("g", clip_path=clip)
    for row, (y0, s) in enumerate(((sy + 230, 1.15), (sy + 430, 1.15))):
        for i in range(6):
            x = sx + 90 + i * 92
            tall = row == 0 and i == 2
            sc = s * (1.3 if tall else 1.0)
            p.path(robed(x, y0, sc), fill="none", stroke=PAPER, stroke_width=3)
            if tall:
                for r in (24, 36, 48):
                    p.circle(x, y0 - 110 * sc - 4, r, fill="none", stroke=PAPER, stroke_width=3)
    p.close()
    # unrubbed: the faint shadow of what is still under the paper
    for i in range(6):
        p.path(robed(sx + 90 + i * 92, sy + 600, 1.15), fill="none", stroke="#ddd8cc", stroke_width=2)
    # stroke marks at the edge of the rubbing
    for k in range(14):
        x = sx + 600 + p.rng.uniform(-30, 30)
        y = sy + 80 + k * 26
        p.line(x, y, x + p.rng.uniform(30, 70), y + p.rng.uniform(-8, 8), stroke=HEEL, stroke_width=5, opacity=0.6,
               stroke_linecap="round")
    # the heelball block
    p.rect(sx + 640, sy + 300, 120, 56, fill=HEEL, transform=f"rotate(-18 {sx + 700} {sy + 328})")
    p.rect(sx + 646, sy + 304, 108, 8, fill="#3a3632", transform=f"rotate(-18 {sx + 700} {sy + 328})")
    # the turned-back corner: the brass's other face
    cx, cy = sx + sw, sy + sh
    p.poly([(cx - 260, cy), (cx, cy - 220), (cx, cy)], fill="#c9b37a")
    p.poly([(cx - 260, cy), (cx, cy - 220), (cx - 300, cy - 260)], fill=PAPER, stroke="#bdb6a6", stroke_width=2)
    p.rect(cx - 210, cy - 120, 170, 70, fill=HEEL, transform=f"rotate(-40 {cx - 125} {cy - 85})")
    p.text(cx - 196, cy - 70, "RCC", size=46, family="sans-serif", fill="#a59a84", font_weight="bold",
           transform=f"rotate(-40 {cx - 125} {cy - 85})")
    p.text(1000, 120, "the brass", size=22, family="serif", fill="#e8e2d4", font_style="italic")
    p.text(1000, 150, "of the Twelve", size=22, family="serif", fill="#e8e2d4", font_style="italic")
    p.text(1000, 520, "its other", size=22, family="serif", fill="#e8e2d4", font_style="italic")
    p.text(1000, 550, "face", size=22, family="serif", fill="#e8e2d4", font_style="italic")


# ---- 1D: The Measure (slip-glazed terracotta) ----------------------------------------------------
@register(G, "measure")
def measure(p: Pic):
    """The Measure (1D): the keeper's vessels on a terracotta floor, all slip-glazed: a cup of three,
    a jug of five and a jar of eight lulls (an invented unit), unmarked, cream slip over red clay with
    sgraffito lines scratched through. An amber pour runs from the jug into the cup. In front, a
    pilgrim's bowl whose target is four, shown as four incised strokes. To one side the open Toad the
    store is poured from, and set apart under its corded seal, the Last Toad; at the other, the Ghost's
    white flask with its glaze line, never used for the sacrament. Above, the pours so far are scratched
    as a row of tallies, and a crossed tally for each lull poured to the earth."""
    p.paper(TERRA, grain=0.35, fibre=0.6)
    # floor tiles
    for i in range(0, W, 120):
        for j in range(420, H, 90):
            p.rect(i + 3, j + 3, 114, 84, fill=TERRA2 if (i // 120 + j // 90) % 2 else "#a85b33", opacity=0.55)
    p.rect(0, 400, W, 22, fill=TERRA2)

    def vessel(cx, base, w, h, label, level):
        body = (f"M{cx - w * 0.28},{base - h} C{cx - w * 0.3},{base - h * 0.85} {cx - w * 0.62},{base - h * 0.6} "
                f"{cx - w * 0.5},{base - h * 0.2} L{cx - w * 0.36},{base} L{cx + w * 0.36},{base} "
                f"L{cx + w * 0.5},{base - h * 0.2} C{cx + w * 0.62},{base - h * 0.6} {cx + w * 0.3},{base - h * 0.85} "
                f"{cx + w * 0.28},{base - h}Z")
        p.path(body, fill=TERRA2, transform="translate(6 6)", opacity=0.6)
        p.path(body, fill=TERRA)
        # cream slip dipped to a wavy line above the foot
        clip = p.clip(f'<path d="{body}"/>')
        p.path(f"M{cx - w},{base - h * 0.25} Q{cx - w * 0.3},{base - h * 0.2} {cx},{base - h * 0.28} "
               f"T{cx + w},{base - h * 0.24} L{cx + w},{base - h - 10} L{cx - w},{base - h - 10}Z", fill=SLIP, clip_path=clip)
        # sgraffito lines
        for k in range(3):
            yy = base - h * (0.5 + k * 0.1)
            p.path(f"M{cx - w * 0.4},{yy} Q{cx},{yy - 8} {cx + w * 0.4},{yy}", fill="none", stroke=TERRA2, stroke_width=2,
                   clip_path=clip)
        p.ellipse(cx, base - h, w * 0.28, 8, fill=TERRA2)
        if level:
            p.ellipse(cx, base - h + 4, w * 0.24, 6, fill=AMBER, opacity=0.9)
        p.text(cx - 8, base + 34, label, size=26, family="serif", fill=SLIP, font_weight="bold")

    vessel(250, 380, 120, 120, "3", True)
    vessel(450, 380, 160, 190, "5", True)
    vessel(680, 380, 200, 260, "8", False)
    # the pour from the jug into the cup
    p.path("M392,196 C350,150 300,190 268,262", fill="none", stroke=AMBER, stroke_width=9, stroke_linecap="round")
    # the pilgrim's bowl with the target, four incised strokes
    p.path("M420,560 Q520,660 620,560 Z", fill=SLIP, stroke=TERRA2, stroke_width=4)
    p.ellipse(520, 560, 100, 18, fill=AMBER, opacity=0.85, stroke=TERRA2, stroke_width=3)
    for k in range(4):
        p.line(486 + k * 22, 600, 486 + k * 22, 630, stroke=TERRA2, stroke_width=5)
    p.text(450, 690, "a pilgrim's measure", size=24, family="serif", fill=SLIP, font_style="italic")
    # the open Toad and the Last Toad under its seal
    p.path("M900,380 C860,330 870,230 940,220 C1010,230 1020,330 980,380Z", fill=AMBER, stroke=TERRA2, stroke_width=4)
    p.ellipse(940, 222, 34, 8, fill=TERRA2)
    p.text(902, 420, "the Toad", size=22, family="serif", fill=SLIP)
    p.path("M1060,380 C1030,340 1036,280 1090,272 C1144,280 1150,340 1120,380Z", fill="#b47a24", stroke=TERRA2, stroke_width=4)
    p.circle(1090, 272, 20, fill="#9b8f7f", stroke=TERRA2, stroke_width=3)
    p.line(1066, 300, 1114, 300, stroke="#5a4636", stroke_width=4)
    p.line(1066, 312, 1114, 312, stroke="#5a4636", stroke_width=4)
    p.text(1034, 420, "the Last Toad", size=22, family="serif", fill=SLIP)
    # the Ghost's flask, white, with its glaze line
    p.path("M100,560 C80,520 90,480 120,470 L120,440 L140,440 L140,470 C170,480 180,520 160,560Z", fill="#f3efe6",
           stroke=TERRA2, stroke_width=3)
    p.line(96, 510, 164, 510, stroke=SKY, stroke_width=3)
    p.text(64, 600, "his flask", size=22, family="serif", fill=SLIP, font_style="italic")
    # tallies of pours along the top, scratched; one crossed (poured to the earth)
    p.rect(40, 30, W - 80, 70, fill=SLIP, opacity=0.85)
    for k in range(9):
        x = 70 + k * 46
        for j in range(3):
            p.line(x + j * 9, 46, x + j * 9, 84, stroke=TERRA2, stroke_width=3)
    p.line(470, 50, 500, 80, stroke=TERRA2, stroke_width=4)
    p.line(500, 50, 470, 80, stroke=TERRA2, stroke_width=4)
    p.text(560, 76, "NOTHING RETURNS TO THE TOAD", size=26, family="serif", fill=TERRA2, font_weight="bold")


# ---- 1D: The Mill (cast bronze with patina) ------------------------------------------------------
@register(G, "mill")
def mill(p: Pic):
    """The Mill (1D): a nine men's morris board cast as a bronze plaque, three nested squares joined at
    their midpoints, every point a raised boss. The keeper's pieces are polished bronze; the Ghost's are
    the same casting gone dark with matte verdigris patina. Across the board a mill of his, three in a
    row, is lit by a raised bar, and one of her pieces has been lifted off the board. At the plaque's edge
    two bronze hands, nothing more of him, make a sign; her side of the border is cast with a line of
    verse, his with the shape of a desk and a chair."""
    p.paper("#2a2620", grain=0.3)
    # the plaque
    px, py, pw = 280, 80, 640
    p.rect(px + 10, py + 12, pw, pw, fill="#000", opacity=0.45)
    p.rect(px, py, pw, pw, fill=BRONZE2, rx=18)
    p.rect(px + 10, py + 10, pw - 20, pw - 20, fill=BRONZE, rx=12)
    p.stipple(px + 10, py + 10, pw - 20, pw - 20, n=900, r=(0.6, 2.0), fill=BRONZE2, opacity=0.5)
    # patina blooms in the low places
    for _ in range(12):
        p.ellipse(px + p.rng.uniform(40, pw - 40), py + p.rng.uniform(40, pw - 40), p.rng.uniform(14, 40),
                  p.rng.uniform(8, 22), fill=VERDI, opacity=0.25)
    cx, cy = px + pw / 2, py + pw / 2
    sizes = (250, 170, 90)
    for s in sizes:
        p.rect(cx - s + 3, cy - s + 3, 2 * s, 2 * s, fill="none", stroke=BRONZE2, stroke_width=10)
        p.rect(cx - s, cy - s, 2 * s, 2 * s, fill="none", stroke=BRONZE3, stroke_width=7)
    for a, b in (((cx, cy - 250), (cx, cy - 90)), ((cx, cy + 90), (cx, cy + 250)),
                 ((cx - 250, cy), (cx - 90, cy)), ((cx + 90, cy), (cx + 250, cy))):
        p.line(a[0] + 3, a[1] + 3, b[0] + 3, b[1] + 3, stroke=BRONZE2, stroke_width=10)
        p.line(*a, *b, stroke=BRONZE3, stroke_width=7)
    points = []
    for s in sizes:
        for dx, dy in ((-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0)):
            points.append((cx + dx * s, cy + dy * s))
    for x, y in points:
        p.circle(x + 2, y + 2, 11, fill=BRONZE2)
        p.circle(x, y, 10, fill=BRONZE3)

    def piece(x, y, his):
        p.circle(x + 4, y + 5, 24, fill="#000", opacity=0.4)
        p.circle(x, y, 24, fill=VERDI if his else BRONZE3, stroke=BRONZE2, stroke_width=3)
        p.circle(x - 7, y - 8, 8, fill="#86aba2" if his else "#f1d79a", opacity=0.8)
    his = [points[0], points[1], points[2], points[12], points[20]]
    hers = [points[7], points[9], points[15], points[17], points[22]]
    for x, y in his:
        piece(x, y, True)
    for x, y in hers:
        piece(x, y, False)
    # his mill along the top row, lit by a raised bar
    p.rect(points[0][0] - 30, points[0][1] - 40, 2 * 250 + 60, 12, fill=GOLD3, opacity=0.9, rx=6)
    # her lifted piece, off the board
    piece(px + pw + 90, py + 120, False)
    p.text(px + pw + 50, py + 180, "taken", size=22, family="serif", fill=BRONZE3, font_style="italic")
    # the Ghost's hands at the edge, signing
    for hx, rot in ((150, -12), (210, 14)):
        p.path(f"M{hx},640 l-18,-90 l10,-4 l14,60 l2,-80 l12,0 l2,80 l10,-74 l12,2 l-6,80 l14,-60 l10,4 l-12,90Z",
               fill=VERDI, stroke=BRONZE2, stroke_width=3, transform=f"rotate({rot} {hx} 640)")
    p.text(110, 700, "a desk; a chair", size=22, family="serif", fill=BRONZE3, font_style="italic")
    # her verse cast in the border
    p.text(px + 40, py + pw + 50, "AND THE CAGED WENT UP THE MOUNTAIN ON THE BREATH", size=20, family="serif", fill=BRONZE3,
           font_weight="bold")


# ---- 1D: The Peal (repousse gold) ------------------------------------------------------------------
@register(G, "peal")
def peal(p: Pic):
    """The Peal (1D): a sheet of gold worked in repousse, hammered up from behind. Along the top six
    bells rise as domed bosses, each numbered by punched dots. Below them the rows of a touch are chased
    into the gold line by line, rounds first (123456), and the path of one bell through the rows is
    raised as a ridge, as change ringers draw a method's line. Each row may only swap neighbours, and
    no row may come twice; a row marked with a struck punch is the one where the next call goes. A
    striped woollen sally hangs at the side. The whole surface carries small hammer marks."""
    p.paper(GOLD2, grain=0.25)
    p.rect(40, 30, W - 80, H - 60, fill=GOLD, rx=24)
    # hammer marks
    for _ in range(520):
        x, y = p.rng.uniform(50, W - 50), p.rng.uniform(40, H - 40)
        p.ellipse(x, y, p.rng.uniform(5, 11), p.rng.uniform(3, 6), fill=GOLD3 if p.rng.random() < 0.5 else GOLD2,
                  opacity=0.22)
    # the bells as domed bosses
    for i in range(6):
        bx, by, r = 200 + i * 150, 140, 52 - i * 2
        bell = (f"M{bx - r * 0.45},{by - r * 0.7} Q{bx},{by - r * 1.05} {bx + r * 0.45},{by - r * 0.7} "
                f"L{bx + r * 0.6},{by + r * 0.3} Q{bx + r * 0.75},{by + r * 0.62} {bx + r},{by + r * 0.72} "
                f"L{bx - r},{by + r * 0.72} Q{bx - r * 0.75},{by + r * 0.62} {bx - r * 0.6},{by + r * 0.3}Z")
        p.path(bell, fill=GOLD2, transform="translate(6 7)")
        p.path(bell, fill=GOLD3, transform="translate(-2 -2)")
        p.path(bell, fill="#E2BE66")
        p.ellipse(bx - r * 0.25, by - r * 0.2, r * 0.18, r * 0.5, fill=GOLD3, opacity=0.6)
        for k in range(i + 1):
            p.circle(bx - (i * 7) + k * 14, by + r * 0.45, 3.5, fill=GOLD2)
    # the rows of plain hunt on six, chased
    row = [1, 2, 3, 4, 5, 6]
    rows = [row[:]]
    for k in range(10):
        r = rows[-1][:]
        start = 0 if k % 2 == 0 else 1
        for j in range(start, 5, 2):
            r[j], r[j + 1] = r[j + 1], r[j]
        rows.append(r)
    x0, y0, dx, dy = 360, 250, 52, 42
    for n, r in enumerate(rows):
        for j, b in enumerate(r):
            p.text(x0 + j * dx, y0 + n * dy, str(b), size=28, family="monospace", fill=GOLD2, font_weight="bold")
    # the path of the treble (bell 1) raised as a ridge
    pts = [(x0 + r.index(1) * dx + 9, y0 + n * dy - 10) for n, r in enumerate(rows)]
    d = "M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts)
    p.path(d, fill="none", stroke=GOLD2, stroke_width=12, transform="translate(3 4)", stroke_linejoin="round")
    p.path(d, fill="none", stroke=GOLD3, stroke_width=8, stroke_linejoin="round")
    # a punched mark where the next call goes
    p.circle(x0 - 40, y0 + 6 * dy - 10, 10, fill=GOLD2)
    p.text(x0 - 170, y0 + 6 * dy - 2, "BOB", size=26, family="serif", fill=GOLD2, font_weight="bold")
    # the sally
    p.line(1080, 60, 1080, 520, stroke="#7a5a2a", stroke_width=6)
    for k in range(8):
        p.rect(1068, 300 + k * 26, 24, 26, fill=("#7c2a26", "#e8dcc0", "#2e4a6a")[k % 3], rx=4)
    p.text(120, 720, "only neighbours change; no row twice; home to rounds", size=24, family="serif", fill=GOLD2,
           font_style="italic")

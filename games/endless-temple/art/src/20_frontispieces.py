"""Chapter frontispieces: an illuminated initial with a margin vine that gains sand."""
import math

from artkit import Art, f, sibling

K = sibling(__file__, "_kit")
ROW = "Chapter frontispieces: illuminated initial with a margin vine that gains sand"
INK = K.INK


def wrap(s, n):
    out, line = [], ""
    for w in s.split():
        if len(line) + len(w) + 1 > n and line:
            out.append(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        out.append(line)
    return out


# ---- the nine pictures behind the initials, each drawn in a 400 x 400 box ------------------------
def sc_waking(a):
    a.rect(0, 0, 400, 400, fill="#6B4A2C")
    a.rect(0, 250, 400, 150, fill="#4A3220")
    for k in range(9):
        a.line(-40 + k * 60, 250, -120 + k * 80, 400, stroke=K.WALNUT, stroke_width=1.2, opacity=.6)
    # window
    a.path("M210,60 A60,60 0 0,1 330,60 V200 H210Z", fill="#F6E6A8", stroke=K.WALNUT, stroke_width=6)
    a.path("M270,2 V200 M210,110 H330", stroke=K.WALNUT, stroke_width=4, fill="none")
    K.wash(a, K.blob_d(a, 262, 130, 28, 18), K.SAGE, .6)
    # the sunbeams, 'like growing vines of light'
    K.sunbeam(a, 270, 120, 60, 400, 50, 150, K.GOLD_L, .75)
    for k in range(4):
        pts = [(260 - k * 6, 190), (220 - k * 26, 250), (190 - k * 30, 300 + k * 6), (120 - k * 22, 360)]
        K.pen(a, pts, w=3.2, color="#F3D27A", taper=(.1, .6))
        x, y = pts[2]
        K.leaf(a, x, y, 18, 2.4 + k * .3, fill="#F3D27A", line="#C9962E", lw=.8)
    # bed foot and blanket
    a.path("M0,300 Q60,270 150,290 L170,400 H0Z", fill=K.SAGE_D, stroke=INK, stroke_width=2)
    a.path("M0,320 Q60,292 156,312 M0,350 Q70,320 162,344", stroke=INK, stroke_width=1.2, fill="none", opacity=.6)
    a.rect(150, 262, 16, 138, fill=K.WALNUT, stroke=INK, stroke_width=1.5)


def sc_circle(a):
    a.rect(0, 0, 400, 400, fill="#1B1A2E")
    a.circle(310, 70, 30, fill=K.SILVER)
    a.circle(298, 62, 30, fill="#1B1A2E")
    K.stip(a, 0, 0, 400, 180, n=40, r=(.6, 1.6), fill="#E8E2D0", opacity=.8)
    a.path("M0,270 Q200,230 400,270 V400 H0Z", fill="#5A2E1A")
    K.glow(a, 200, 300, 190, K.LANTERN, .8)
    # the fire
    a.path("M200,330 C170,330 168,296 186,280 C186,294 194,296 196,286 C198,270 190,260 204,244 C204,262 222,270 220,292 "
           "C226,286 228,282 228,276 C240,298 230,330 200,330Z", fill=K.LANTERN, stroke="#7A2E10", stroke_width=1.5)
    a.path("M200,326 C186,326 184,306 196,298 C198,310 206,300 204,288 C214,300 216,326 200,326Z", fill=K.GOLD_L)
    # seated listeners as dark shapes, rim-lit; one small hand raised
    for x, s, hand in ((40, 1.2, 0), (104, 1.0, 0), (150, .8, 1), (262, .95, 0), (320, 1.1, 0), (372, 1.25, 0)):
        y = 330 + abs(x - 200) * .12
        d = (f"M{f(x - 26 * s)},{f(y + 60)} C{f(x - 30 * s)},{f(y)} {f(x - 16 * s)},{f(y - 34 * s)} {f(x - 4 * s)},{f(y - 38 * s)} "
             f"C{f(x - 14 * s)},{f(y - 48 * s)} {f(x - 8 * s)},{f(y - 68 * s)} {f(x + 4 * s)},{f(y - 66 * s)} "
             f"C{f(x + 16 * s)},{f(y - 64 * s)} {f(x + 16 * s)},{f(y - 46 * s)} {f(x + 8 * s)},{f(y - 38 * s)} "
             f"C{f(x + 22 * s)},{f(y - 30 * s)} {f(x + 30 * s)},{f(y)} {f(x + 28 * s)},{f(y + 60)}Z")
        a.path(d, fill="#1A0F12")
        side = 1 if x < 200 else -1
        a.path(f"M{f(x + side * 8 * s)},{f(y - 62 * s)} q{f(side * 12 * s)},{f(14 * s)} {f(side * 4 * s)},{f(26 * s)}",
               stroke=K.LANTERN, stroke_width=2, fill="none", opacity=.9, stroke_linecap="round")
        if hand:
            a.path(f"M{f(x + 10)},{f(y - 30)} L{f(x + 22)},{f(y - 82)}", stroke="#1A0F12", stroke_width=7, stroke_linecap="round")
            a.path(f"M{f(x + 22)},{f(y - 82)} l-5,-12 m5,12 l1,-14 m-1,14 l7,-11", stroke="#1A0F12", stroke_width=3,
                   stroke_linecap="round", fill="none")
            a.path(f"M{f(x + 14)},{f(y - 34)} L{f(x + 25)},{f(y - 80)}", stroke=K.LANTERN, stroke_width=1.6, opacity=.9)
    # the cane, upright at the edge of the light
    a.line(296, 250, 290, 330, stroke="#C58B3A", stroke_width=3.5, stroke_linecap="round")


def sc_rounds(a):
    a.rect(0, 0, 400, 400, fill="#5E4428")
    for j in range(4):
        y = 30 + j * 78
        a.rect(0, y + 62, 400, 12, fill=K.WALNUT)
        x = 4
        while x < 396:
            w = a.rng.uniform(12, 26)
            h = a.rng.uniform(40, 60)
            col = a.rng.choice([K.SAGE_D, K.OCHRE, "#7A3B26", K.WALNUT_L, "#8C6A2A", K.BRUISE, "#3A4A40"])
            a.rect(x, y + 62 - h, w, h, fill=col, stroke=INK, stroke_width=1)
            if a.rng.random() < .5:
                a.line(x + 2, y + 62 - h + 8, x + w - 2, y + 62 - h + 8, stroke=K.GOLD, stroke_width=1.5)
            x += w + a.rng.uniform(0, 3)
    a.path("M0,336 H400 V400 H0Z", fill="#3A2616")
    K.sunbeam(a, 420, 20, 60, 380, 30, 120, K.GOLD_L, .5)
    # broom
    a.line(120, 120, 86, 340, stroke="#C9A06A", stroke_width=7, stroke_linecap="round")
    a.path("M70,330 L104,336 L116,392 L52,384Z", fill=K.OCHRE, stroke=INK, stroke_width=2)
    a.path("M66,352 L112,360 M70,340 L62,384 M84,342 L78,388 M96,344 L96,390", stroke=INK, stroke_width=1.2, fill="none")
    K.sand_pile(a, 250, 392, 130, 38, n=420)
    K.sand(a, 130, 370, 260, 30, n=160)


def sc_dunes(a):
    a.rect(0, 0, 400, 400, fill="#1E2740")
    a.circle(300, 80, 40, fill="#EEF0F4")
    K.glow(a, 300, 80, 120, "#EEF0F4", .35)
    K.stip(a, 0, 0, 400, 200, n=50, r=(.5, 1.5), fill="#fff", opacity=.8)
    a.path("M0,230 C80,190 160,210 240,180 C300,160 360,180 400,170 V400 H0Z", fill="#8D94A8")
    # the wave
    a.path("M0,300 C60,290 110,180 190,150 C240,134 290,160 280,196 C274,216 250,214 248,196 C230,220 220,280 300,300 "
           "C340,310 380,300 400,304 V400 H0Z", fill=K.SILVER, stroke=INK, stroke_width=2.2)
    a.path("M30,300 C80,280 130,200 196,172 M70,304 C110,280 150,230 210,196 M120,310 C150,290 180,250 224,224",
           stroke="#7C8496", stroke_width=1.6, fill="none")
    K.stip(a, 240, 130, 110, 110, n=110, r=(.8, 2.2), fill="#EEF0F4", opacity=.9,
              density=lambda x, y: 1 - math.hypot(x - 286, y - 180) / 70)
    # purple vines 'like thick webs'
    for pts in ([(0, 350), (80, 330), (150, 356), (230, 340), (320, 366), (400, 350)],
                [(60, 400), (110, 360), (150, 356), (170, 318)], [(230, 340), (270, 380), (300, 400)],
                [(320, 366), (350, 330), (400, 322)], [(80, 330), (60, 316), (20, 316)]):
        K.pen(a, pts, w=6, color=K.BRUISE, taper=(.1, .2))
    for x, y in ((50, 380), (366, 388)):
        a.path("".join(f"M{x},{y} l{f(18 * math.cos(t))},{f(-18 * math.sin(t))}" for t in (math.pi * k / 8 for k in range(9))),
               stroke="#2E3A30", stroke_width=1.6, fill="none")


def sc_hollin(a):
    a.rect(0, 0, 400, 400, fill="#8A93A0")
    K.wash(a, K.blob_d(a, 200, 80, 210, 70, jit=.15), "#3E4654", .95)
    K.wash(a, K.blob_d(a, 130, 110, 120, 50, jit=.2), "#2E3440", .8)
    a.path("M210,120 l-16,34 h14 l-18,44", stroke=K.GOLD_L, stroke_width=3, fill="none", stroke_linejoin="round")
    # rooftops
    roofs = [(0, 300, 90, 70), (70, 270, 100, 90), (160, 310, 80, 60), (230, 250, 90, 100), (310, 290, 100, 80)]
    for x, y, w, h in roofs:
        a.path(f"M{x},{y + h + 60} V{y + 30} L{x + w / 2},{y} L{x + w},{y + 30} V{y + h + 60}Z", fill="#59616E", stroke=INK,
               stroke_width=2)
        a.path(f"M{x - 6},{y + 34} L{x + w / 2},{y - 2} L{x + w + 6},{y + 34}", stroke=INK, stroke_width=3.5, fill="none",
               stroke_linejoin="round")
        a.rect(x + w / 2 - 9, y + 44, 18, 24, fill=K.GOLD_L if x in (70, 310) else "#2E3440", stroke=INK, stroke_width=1.4)
    a.rect(262, 190, 26, 64, fill="#59616E", stroke=INK, stroke_width=2)   # the bell-loft
    a.path("M256,192 L275,168 L294,192Z", fill="#3E4654", stroke=INK, stroke_width=2)
    a.hatch(0, 0, 400, 400, angle=70, spacing=13, stroke="#DCE2EA", stroke_width=1, opacity=.55, jitter=4)
    # Pell's umbrella, small, lifted by the gusts
    a.path("M120,200 A30,24 0 0,1 180,200 Q165,194 150,200 Q135,194 120,200Z", fill="#7A3B26", stroke=INK, stroke_width=1.6)
    a.path("M150,178 V226", stroke=INK, stroke_width=2)
    a.path("M150,226 l-3,22 M150,232 l8,10", stroke=INK, stroke_width=2.4, stroke_linecap="round")


def sc_mark(a):
    a.rect(0, 0, 400, 400, fill="#D9C49A")
    K.wash(a, K.blob_d(a, 200, 90, 220, 80, jit=.15), "#EAD9B0", .9)
    a.circle(200, 120, 36, fill="#F6ECCB")
    a.path("M0,240 C90,220 150,236 220,222 C290,210 350,226 400,216 V400 H0Z", fill="#B98950", stroke=INK2(), stroke_width=1.5)
    a.path("M0,300 C120,270 260,300 400,280 V400 H0Z", fill="#9A6A38")
    # the smooth track going on
    a.path("M150,400 C170,330 196,270 204,224 L214,224 C226,270 262,330 300,400Z", fill="#D8B878", opacity=.85)
    # the pole, its cord, the ring of stones
    a.line(200, 150, 204, 330, stroke=K.WALNUT, stroke_width=7, stroke_linecap="round")
    K.pen(a, [(202, 170), (230, 180), (250, 168), (276, 184)], w=5, color=K.OCHRE, taper=(.05, .5))
    K.leaf(a, 276, 184, 26, .4, fill=K.OCHRE, lw=1.2)
    for k in range(10):
        t = 2 * math.pi * k / 10
        x, y = 202 + 78 * math.cos(t), 336 + 22 * math.sin(t)
        a.ellipse(x, y, 13, 8, fill="#7A6A58" if k % 2 else "#94836E", stroke=INK, stroke_width=1.4)
    a.path("M40,250 l10,-3 M70,262 l12,-3 M330,246 l12,-2 M350,300 l14,-2 M30,330 l12,-2", stroke=INK, stroke_width=1.4,
           opacity=.6)


def INK2():
    return K.INK2


def sc_procession(a):
    a.rect(0, 0, 400, 400, fill="#8E8A82")
    K.wash(a, K.blob_d(a, 200, 90, 230, 90, jit=.12), "#6F6A66", .7)
    K.glow(a, 330, 150, 150, K.LANTERN, .5)
    a.path("M0,290 C100,270 280,290 400,262 V400 H0Z", fill="#6E6656")
    a.path("M0,330 C120,310 260,330 400,300 V400 H0Z", fill="#59513F")
    # the written road: a wet ink stroke
    K.pen(a, [(0, 356), (90, 340), (190, 344), (290, 322), (400, 300)], w=16, color="#2A2018", taper=(0, .5), wob=.25)
    for k, x in enumerate((50, 110, 170, 230)):
        y = 338 - k * 5
        s = 1 - k * .06
        a.path(f"M{f(x - 15 * s)},{f(y)} C{f(x - 15 * s)},{f(y - 50 * s)} {f(x - 8 * s)},{f(y - 70 * s)} {x},{f(y - 72 * s)} "
               f"C{f(x + 8 * s)},{f(y - 70 * s)} {f(x + 15 * s)},{f(y - 50 * s)} {f(x + 15 * s)},{f(y)}Z", fill="#3A332C",
               stroke=INK, stroke_width=1.6)
        a.ellipse(x + 2, y - 86 * s, 10 * s, 12 * s, fill="#E8E0CC", stroke=INK, stroke_width=1.4)   # the mask
        a.path(f"M{f(x - 2)},{f(y - 88 * s)} h3 M{f(x + 5)},{f(y - 88 * s)} h3", stroke=INK, stroke_width=1.6)
        a.line(x + 16 * s, y - 50 * s, x + 26 * s, y - 104 * s, stroke=INK, stroke_width=2)
        K.glow(a, x + 27 * s, y - 108 * s, 26, K.LANTERN, .9)
        a.rect(x + 22 * s, y - 116 * s, 10 * s, 14 * s, fill=K.LANTERN, stroke=INK, stroke_width=1.2)
    K.stip(a, 0, 240, 400, 60, n=140, r=(.6, 1.4), fill="#4A4438", opacity=.6)


def sc_unlit(a):
    a.rect(0, 0, 400, 400, fill=K.FROST)
    for j in range(3):
        y = 110 + j * 110
        a.rect(0, y, 400, 12, fill="#1B2636")
        K.stip(a, 0, y - 4, 400, 10, n=90, r=(.6, 1.6), fill="#C9D6E6", opacity=.7)
        x = 6
        while x < 394:
            w = a.rng.uniform(14, 28)
            h = a.rng.uniform(58, 86)
            a.rect(x, y - h, w, h, fill="#151E2C", stroke="#243246", stroke_width=1)
            x += w + a.rng.uniform(0, 4)
    # one candle; its small radius; the black book beside it
    K.glow(a, 150, 180, 120, K.LANTERN, .55)
    a.rect(143, 180, 14, 40, fill="#E8E0CC", stroke=INK, stroke_width=1.2)
    a.path("M150,178 C142,168 150,160 150,148 C158,160 160,170 150,178Z", fill=K.GOLD_L)
    a.rect(190, 146, 44, 74, fill="#05080D", stroke="#3A4A60", stroke_width=1.6)
    a.path("M190,170 h44 M190,200 h44", stroke="#3A4A60", stroke_width=3)
    a.rect(206, 164, 12, 12, fill="#556A80")
    K.stip(a, 186, 140, 54, 14, n=50, r=(.6, 1.5), fill="#DCE6F2", opacity=.9)
    a.path("M176,240 q30,10 70,2", stroke="#8FA0B4", stroke_width=1, fill="none", opacity=.5)


def sc_end(a):
    a.rect(0, 0, 400, 400, fill="#E9D3A6")
    K.wash(a, K.blob_d(a, 200, 70, 240, 70, jit=.12), "#F3E3C0", .9)
    K.wash(a, K.blob_d(a, 120, 120, 120, 34, jit=.2), "#D9B6C8", .5)
    a.path("M0,190 H400 V400 H0Z", fill="#C9CED6")
    a.path("M0,190 H400", stroke=INK, stroke_width=1.4)
    # three backs, far off
    for x, s in ((150, 1.0), (196, .7), (232, .5)):
        a.path(f"M{f(x - 22 * s)},190 Q{x},{f(190 - 20 * s)} {f(x + 22 * s)},190Z", fill="#6E6656")
    # the wake
    a.path("M120,400 C150,320 172,250 184,192 L200,192 C226,250 270,320 330,400Z", fill="#E4E0D6", stroke=INK2(), stroke_width=1.2)
    for k in range(7):
        y = 210 + k * k * 3.6
        a.path(f"M{f(184 - (y - 192) * .3 + 6)},{f(y)} q{f(10 + k * 3)},{f(4 + k)} {f(22 + k * 8)},0", stroke="#9AA0AC",
               stroke_width=1.2, fill="none")
    for x0, y0, dx in ((0, 250, 70), (300, 240, 90), (20, 320, 80), (330, 330, 70), (260, 280, 50)):
        a.path(f"M{x0},{y0} q{dx / 2},-16 {dx},0", stroke="#8D94A8", stroke_width=1.6, fill="none")
    # a boy on leaf shoes, small, walking in it
    a.path("M214,330 l-2,-34 l8,-18 M212,296 l-10,16 M218,280 l10,14", stroke=INK, stroke_width=3.2, fill="none",
           stroke_linecap="round", stroke_linejoin="round")
    a.circle(222, 270, 6, fill="#5A3A24", stroke=INK, stroke_width=1.2)
    a.rect(206, 284, 9, 14, rx=2, fill=K.OCHRE, stroke=INK, stroke_width=1)
    K.woody_leaf(a, 200, 334, 30, 0.1)
    K.woody_leaf(a, 222, 322, 24, -.1)


SCENES = [sc_waking, sc_circle, sc_rounds, sc_dunes, sc_hollin, sc_mark, sc_procession, sc_unlit, sc_end]
INITIALS = "WSKDHFPUE"
KEYWORD = ["Waking", "Storyteller's Circle", "Keeper's Rounds", "Silver Dunes", "Weather-Clerk of Hollin", "Father's Mark",
           "Long Procession", "Unlit Shelf", "End of the Sand"]
QUOTES = [
    "The sun peered in through an open window, and off in the distance, a peculiar cuckoo clock cooed.",
    "My hand shot up almost by instinct.",
    "every book was alive, and inside of it, an entire universe.",
    "The sand looked like shining sheets of silver dotted with splendid purple vines",
    "Somebody has to write tomorrow.",
    "Day forty. The leaves hold. The track goes on.",
    "His hand shakes. The road shakes with it.",
    "For in the great darkness, no light can be found…",
    "He then tied the leaves about his feet and began his journey again.",
]
PAGES = [K.VELLUM, K.VELLUM, K.VELLUM, "#EFE6D0", "#E4E4DE", "#EEDFC0", "#DAD6CC", "#D6DAE0", "#F1E6CC"]


def frontispiece(a: Art, i):
    name = K.CHAPTERS[i][1]
    K.page(a, PAGES[i], g=.25, edge=.4)
    W, H = a.w, a.h
    g = K.gold(a)
    leak = i / 8.0
    # the margin vine: up the left margin and along the foot of the page
    stem = [(690, 1020), (560, 1040), (420, 1012), (280, 1040), (150, 1010), (84, 930), (100, 800), (64, 660), (98, 520),
            (60, 380), (92, 250), (70, 140), (120, 70)]
    leafcol = [K.SAGE, K.SAGE, K.SAGE, "#9BA88A", "#8B9A94", K.OCHRE, "#A89878", "#8FA0B4", "#C9A46A"][i]
    c = K.vine(a, stem, color=K.SAGE_D if i != 7 else "#5A6A7C", w=4.5, leaves=17, lsize=40, lfill=leafcol)
    # buds of gold
    for k in (10, 38, 70, 104, 150):
        if k < len(c):
            a.circle(c[k][0] + 10, c[k][1] - 8, 5, fill=g, stroke=INK, stroke_width=1)
    # sand: sits on the leaves and drifts at the foot, more with every chapter
    if i:
        for k in range(1 + i * 2):
            j = int(len(c) * (0.08 + 0.5 * k / (1 + i * 2)))
            x, y = c[j]
            K.sand_pile(a, x + a.rng.uniform(-10, 10), y - 2, 18 + 5 * leak * 4, 6 + 10 * leak, n=60)
        hgt = 20 + 110 * leak
        d = (f"M0,{H} V{f(H - hgt * .5)} C{f(W * .2)},{f(H - hgt * 1.3)} {f(W * .45)},{f(H - hgt * .5)} {f(W * .62)},{f(H - hgt * .7)} "
             f"C{f(W * .8)},{f(H - hgt * .95)} {f(W * .92)},{f(H - hgt * .3)} {W},{f(H - hgt * .45)} V{H}Z")
        a.path(d, fill="#D5D8DF", stroke=K.INK2, stroke_width=1, opacity=.96)
        cl = a.clip(f'<path d="{d}"/>')
        a.open("g", clip_path=cl)
        K.sand(a, 0, H - hgt * 1.3, W, hgt * 1.3, n=int(500 + 1400 * leak), r=(.6, 1.8))
        a.close()
        K.sand(a, 0, H - hgt * 1.6 - 30, W, hgt * .8 + 30, n=int(120 * leak + 30), r=(.5, 1.4), op=.8)
    if i == 7:
        K.stip(a, 0, 0, W, H, n=500, r=(.6, 1.8), fill="#F4F8FC", opacity=.9,
                  density=lambda x, y: max(0, 1 - min(x, W - x, y) / 120))
    # the illuminated initial
    bx, by, bs = 210, 120, 400
    a.rect(bx - 16, by - 16, bs + 32, bs + 32, fill=K.WALNUT)
    a.rect(bx - 16, by - 16, bs + 32, bs + 32, fill="none", stroke=g, stroke_width=6)
    cl = a.clip(f'<rect x="{bx}" y="{by}" width="{bs}" height="{bs}"/>')
    a.open("g", clip_path=cl)
    a.open("g", transform=f"translate({bx} {by})")
    SCENES[i](a)
    a.close()
    K.grain(a, bx, by, bs, bs, .22, .8)
    a.close()
    a.rect(bx, by, bs, bs, fill="none", stroke=INK, stroke_width=2.5)
    K.roll(a, bx - 8, by - 8, bs + 16, bs + 16, g, step=25, size=3.4)
    for cx, cy in ((bx - 16, by - 16), (bx + bs + 16, by - 16), (bx - 16, by + bs + 16), (bx + bs + 16, by + bs + 16)):
        K.fleuron(a, cx, cy, .42, 45, fill=g, eye=K.WALNUT)
    # the letter
    ch = INITIALS[i]
    lx, ly = bx + 118, by + 300
    base = dict(size=330, family="serif", font_weight="bold", text_anchor="middle")
    a.text(lx + 7, ly + 9, ch, fill="#140A05", opacity=.6, **base)
    a.text(lx, ly, ch, fill=g, stroke=K.WALNUT, stroke_width=5, paint_order="stroke", **base)
    a.text(lx - 2, ly - 3, ch, fill="none", stroke=K.GOLD_L, stroke_width=1.6, opacity=.8, **base)
    # chapter number, name and the quoted line beneath
    a.text(410, 596, f"CHAPTER {K.ROMAN[i]}", size=26, family="serif", fill=K.GOLD_D, letter_spacing=8, text_anchor="middle")
    a.path("M300,612 H520", stroke=K.GOLD_D, stroke_width=1.5)
    nm = "The " + KEYWORD[i]
    a.text(410, 672, nm, size=56 if len(nm) < 18 else 46 if len(nm) < 24 else 40, family="serif", fill=INK,
           font_weight="bold", text_anchor="middle")
    q = wrap("\u201c" + QUOTES[i] + "\u201d", 36)
    y0 = 752
    for k, ln in enumerate(q):
        a.text(410, y0 + k * 46, ln, size=33, family="serif", fill=INK, font_style="italic", text_anchor="middle")
    yy = min(y0 + len(q) * 46 + 16, 930)
    a.path(f"M250,{yy} H380 M440,{yy} H570", stroke=K.GOLD_D, stroke_width=1.4)
    K.fleuron(a, 410, yy, .4, 45, fill=K.GOLD_D, eye=PAGES[i])


for _i, (_cid, _name) in enumerate(K.CHAPTERS):
    K.reg(f"frontis-{_cid}", "chapters", f"Frontispiece {K.ROMAN[_i]}: {_name}", 800, 1100, ROW,
          f"The frontispiece for chapter {K.ROMAN[_i]}, {_name}: a gold initial {INITIALS[_i]} set over a small gouache "
          f"picture of the chapter, its name and one quoted line on vellum, and a vine climbing the margin that carries "
          f"{'no sand yet' if _i == 0 else 'more silver sand than the chapter before'}.", frontispiece, _i)

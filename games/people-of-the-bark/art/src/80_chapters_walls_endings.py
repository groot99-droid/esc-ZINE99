"""Chapter cards (one more ring on each), the saying wall and the Roll, and a drawn card for each ending:
the bark above, the yard below."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW_C = "Chapter cards, one more ring on each"
ROW_W = "Saying wall and Roll templates"
ROW_E = "Ending diptychs: the bark above, the yard below"
CR = kit.CRACK
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"]


def ridge(a, x0, x1, y, n=7, lit=True, col=CR, s=1.0, people=0):
    """A city ridge in silhouette: a ledge, round dwellings on it, lantern doors."""
    r = a.rng
    a.path(f"M{x0},{y} Q{(x0 + x1) / 2},{y - 16 * s} {x1},{y} L{x1},{y + 26 * s} Q{(x0 + x1) / 2},{y + 40 * s} {x0},{y + 22 * s}Z", fill=col)
    for i in range(n):
        x = x0 + (x1 - x0) * (i + 0.5) / n + r.uniform(-8, 8) * s
        w, h = r.uniform(20, 30) * s, r.uniform(26, 40) * s
        yy = y - 6 * s
        a.path(f"M{f(x - w)},{f(yy)} Q{f(x - w)},{f(yy - h)} {f(x)},{f(yy - h)} Q{f(x + w)},{f(yy - h)} {f(x + w)},{f(yy)}Z", fill=col)
        if lit and i % 3 != 1:
            kit.glow(a, x, yy - 8 * s, 34 * s, kit.LANTERN, 0.8)
            a.path(f"M{f(x - 5 * s)},{f(yy)} v{f(-10 * s)} a{f(5 * s)},{f(5 * s)} 0 0,1 {f(10 * s)},0 v{f(10 * s)}Z", fill=kit.GOLD)
    for k in range(people):
        x = x0 + (x1 - x0) * r.uniform(0.08, 0.92)
        kit.person(a, x, y - 4 * s, 0.34 * s, sil=col, arms=((-14, -60), (16, -70)), stride=7, flip=r.choice([-1, 1]))


def zig(a, x, y, h, col=kit.GOLD, w=5):
    r = a.rng
    pts, yy, sg = [(x, y)], y, 1
    while yy < y + h:
        yy += r.uniform(26, 44)
        pts.append((x + sg * r.uniform(12, 26), yy))
        sg = -sg
    d = "M" + " L".join(f"{f(px)},{f(py)}" for px, py in pts)
    a.path(d, fill="none", stroke=CR, stroke_width=w + 4, stroke_linejoin="round", stroke_linecap="round")
    a.path(d, fill="none", stroke=col, stroke_width=w, stroke_linejoin="round", stroke_linecap="round")


# ---------------------------------------------------------------------------------------------
# chapter scenes (drawn in the right half: x 760..1560, y 90..560)
# ---------------------------------------------------------------------------------------------
def ch_tremor(a):
    kit.glow(a, 1500, 480, 520, kit.GOLD, 0.5)
    for x in (880, 1120, 1380):
        zig(a, x, 110, 260)
    ridge(a, 800, 1540, 500, n=9, people=5)
    kit.kite(a, 1470, 250, 2.2, col=kit.PAPER_D, string_to=(1420, 470))
    a.stipple(780, 100, 780, 380, n=260, r=(1, 3.2), fill="#ffe9c0", opacity=0.55)


def ch_spring(a):
    r = a.rng
    for x in (860, 1040, 1230, 1420):
        a.path(f"M{x - 22},90 Q{x - 34},320 {x - 18},560 H{x + 18} Q{x + 34},320 {x + 22},90Z", fill=CR, opacity=0.55)
    for x, y, rr in ((860, 190, 46), (1040, 380, 64), (1230, 210, 38), (1420, 330, 54), (1230, 470, 30)):
        a.ellipse(x, y, rr, rr * 0.9, fill="#dfe9ea", opacity=0.55, stroke="#f4f8fa", stroke_width=2)
        a.ellipse(x - rr * 0.35, y - rr * 0.4, rr * 0.3, rr * 0.16, fill="#ffffff", opacity=0.85)
        a.path(f"M{f(x - rr * 0.6)},{f(y + rr * 0.4)} Q{x},{f(y + rr * 0.78)} {f(x + rr * 0.6)},{f(y + rr * 0.4)}", fill="none", stroke="#ffffff",
               stroke_width=2, opacity=0.6)
        a.line(x, y - rr - 6, x, y - rr - 60, stroke="#f4f8fa", stroke_width=2.5, opacity=0.5, stroke_linecap="round")
    for _ in range(26):
        x, y = r.uniform(790, 1540), r.uniform(120, 540)
        for dx, dy, rr in ((-9, 0, 7), (0, -3, 10), (9, 1, 6)):
            a.ellipse(x + dx, y + dy, rr, rr * 0.62, fill=kit.SAGE, stroke=CR, stroke_width=1)
            a.ellipse(x + dx - 1, y + dy - 2, rr * 0.5, rr * 0.3, fill=kit.LIME)
    ridge(a, 930, 1150, 540, n=3, s=0.8)


def ch_summer(a):
    kit.glow(a, 1160, 420, 520, kit.AMBER, 0.55)
    # the beetle, behind: a dome and two feelers, no more
    a.path("M840,560 Q860,170 1180,160 Q1500,170 1520,560Z", fill="#141a17", opacity=0.94)
    a.path("M1180,160 V560 M990,220 Q930,380 950,560 M1370,220 Q1430,380 1410,560", fill="none", stroke="#2e3a34", stroke_width=5)
    a.path("M900,360 Q960,240 1080,200", fill="none", stroke="#cfe0c8", stroke_width=10, opacity=0.22, stroke_linecap="round")
    a.path("M1100,170 Q1040,80 960,90 M1260,170 Q1320,80 1400,90", fill="none", stroke="#141a17", stroke_width=9, stroke_linecap="round")
    # the battlement in front
    a.path("M780,520 H1560 V600 H780Z", fill=CR)
    for i in range(13):
        a.rect(790 + i * 60, 492, 34, 30, fill=CR)
    for x, cr in ((860, None), (980, None), (1100, kit.LANTERN), (1240, None), (1380, None), (1480, None)):
        kit.person(a, x, 494, 0.62, kind="plate", sil=CR, arms=((-12, -44), (18, -58)), extra=lambda b: kit.spear(b, 20, -116, CR, tip=kit.PAPER))
        if cr:
            a.path(f"M{x - 4},{494 - 61} q7,-15 18,-8 q-8,1 -10,9Z", fill=cr)


def ch_autumn(a):
    kit.glow(a, 1300, 250, 460, kit.LANTERN, 0.45)
    a.open("g", transform="rotate(28 1260 290)")
    a.path("M1260,90 Q1420,210 1360,400 Q1310,480 1260,500 Q1210,480 1160,400 Q1100,210 1260,90Z", fill="#c8702a", stroke=CR, stroke_width=5)
    a.path("M1260,100 V560 M1260,200 l70,-50 M1260,200 l-70,-50 M1260,290 l84,-56 M1260,290 l-84,-56 M1260,380 l66,-48 M1260,380 l-66,-48", fill="none",
           stroke=CR, stroke_width=3.5)
    a.path("M1200,170 Q1150,280 1190,400", fill="none", stroke=kit.GOLD, stroke_width=12, opacity=0.3, stroke_linecap="round")
    a.close()
    a.path("M760,520 Q1100,470 1560,540", fill="none", stroke=CR, stroke_width=46, stroke_linecap="round")
    a.path("M800,506 Q1100,462 1500,520", fill="none", stroke="#c99a6a", stroke_width=3, opacity=0.6)
    for x, y, k in ((860, 492, "robe"), (930, 486, "apron"), (1000, 482, "plain"), (1070, 480, "robe")):
        kit.person(a, x, y, 0.6, kind=k, sil=CR, arms=((-14, -60), (20, -84)))
    for x, y, rot in ((840, 180, 40), (980, 300, 110), (1480, 150, 200), (1500, 420, 70)):
        a.path("M0,-14 Q11,-5 7,7 Q3,14 0,16 Q-3,14 -7,7 Q-11,-5 0,-14Z", fill="#b8862a", stroke=CR, stroke_width=1.5,
               transform=f"translate({x} {y}) rotate({rot}) scale(1.6)")


def ch_winter(a):
    r = a.rng
    for x in range(790, 1560, 34):
        ln = r.uniform(30, 150)
        a.poly([(x - 9, 90), (x + 9, 90), (x + r.uniform(-3, 3), 90 + ln)], fill="#eef3f4", opacity=0.85, stroke="#ffffff", stroke_width=1)
    a.stipple(770, 90, 800, 470, n=380, r=(1, 3), fill="#ffffff", opacity=0.75)
    ridge(a, 860, 1500, 500, n=7, lit=False)
    a.path("M860,500 Q1180,484 1500,500", fill="none", stroke="#eef3f4", stroke_width=7, stroke_linecap="round")
    # one door lit, and a cane left leaning beside it
    kit.glow(a, 1180, 480, 150, kit.LANTERN, 0.9)
    a.path("M1168,494 v-22 a12,12 0 0,1 24,0 v22Z", fill=kit.GOLD)
    a.path("M1226,496 L1214,410 q-2,-12 -14,-8", fill="none", stroke=CR, stroke_width=6, stroke_linecap="round")
    a.path("M1226,496 L1214,410 q-2,-12 -14,-8", fill="none", stroke="#c99a6a", stroke_width=2, stroke_linecap="round")


def ch_shadow(a):
    ridge(a, 800, 1540, 520, n=9, people=3)
    for i, ln in enumerate((330, 430, 470, 420, 280)):
        x = 860 + i * 150
        a.path(f"M{x - 52},60 Q{x - 60},{60 + ln * 0.6} {x - 36},{60 + ln} Q{x},{60 + ln + 60} {x + 36},{60 + ln} Q{x + 60},{60 + ln * 0.6} {x + 52},60Z",
               fill="#050302", opacity=0.86, filter=a.blur(6) if i == 0 else None)
    a.rect(760, 60, 800, 150, fill="#050302", opacity=0.86)
    for x in (880, 1040, 1210, 1370, 1500):
        kit.glow(a, x, 500, 46, kit.LANTERN, 0.95)
    kit.kite(a, 1500, 310, 2.0, col=kit.GOLD, string_to=(1470, 490))


def ch_pullback(a):
    cx, cy, rr = 1160, 320, 240
    a.circle(cx + 6, cy + 8, rr + 10, fill="#000", opacity=0.4)
    cp = a.clip(f'<circle cx="{cx}" cy="{cy}" r="{rr}"/>')
    a.open("g", clip_path=cp)
    a.rect(cx - rr, cy - rr, 2 * rr, 2 * rr, fill=kit.SKY)
    for x, y, w in ((1040, 190, 70), (1250, 150, 90)):
        a.ellipse(x, y, w, 22, fill="#ffffff", opacity=0.8)
    a.rect(cx - rr, cy + 80, 2 * rr, rr, fill=kit.GRASS)
    for i in range(24):
        x = cx - rr + i * 21
        a.path(f"M{x},{cy + 40} l8,-8 l8,8 V{cy + 86} h-16Z", fill=kit.FENCE, stroke="#9aa3a0", stroke_width=1)
    a.rect(cx + 110, cy - 20, 150, 104, fill="#e8dcc8", stroke="#9a8f7c", stroke_width=1.5)
    a.poly([(cx + 100, cy - 20), (cx + 185, cy - 70), (cx + 270, cy - 20)], fill="#a8644a", stroke="#7a4a36", stroke_width=1.5)
    a.rect(cx + 150, cy + 30, 30, 54, fill="#7a5a40")
    a.path(f"M{cx - 96},{cy + 150} Q{cx - 84},{cy} {cx - 92},{cy - 100} H{cx - 48} Q{cx - 56},{cy} {cx - 40},{cy + 150}Z", fill="#7a5a40", stroke="#4a3324",
           stroke_width=2)
    for x, y, w in ((cx - 70, cy - 150, 110), (cx - 140, cy - 100, 80), (cx, cy - 110, 84), (cx - 70, cy - 70, 100)):
        a.circle(x, y, w * 0.62, fill="#5c8a3e")
    for x, y, w in ((cx - 90, cy - 170, 60), (cx - 20, cy - 130, 40)):
        a.circle(x, y, w * 0.6, fill="#73a257")
    a.close()
    a.circle(cx, cy, rr, fill="none", stroke=CR, stroke_width=12)
    a.circle(cx, cy, rr + 16, fill="none", stroke="#e9b77c", stroke_width=2, opacity=0.6)


CHAPTERS = [
    ("the-tremor", "THE TREMOR", "Dawn", "#a67c56", ch_tremor,
     "dawn on Highridge with three cracks of gold shaking down the wall, dust in the light and Twig's kite over the roofs"),
    ("spring", "SPRING", "The Rain Blessing", "#8f8c5c", ch_spring,
     "beads of rain as big as houses sliding down the grooves over green tufts of lichen"),
    ("summer", "SUMMER", "Trials and Monsters", "#b89c72", ch_summer,
     "the battlements manned, spears up, and behind them a dome as wide as the city with two feelers above it"),
    ("autumn", "AUTUMN", "The Falling Leaves", "#a8683a", ch_autumn,
     "one copper leaf the size of a country falling past four listeners on the Branch"),
    ("winter", "WINTER", "The Sap Sleeps", "#9c9c98", ch_winter,
     "icicles and falling frost over a dark city with one door lit and a cane left leaning beside it"),
    ("the-shadow", "THE SHADOW", "The Coming of the Shadow", "#7a5a44", ch_shadow,
     "five long fingers of dark lying down the wall onto a row of lanterns, a kite still up in the last light"),
    ("the-pull-back", "THE PULL-BACK", "", "#a67c56", ch_pullback,
     "a round window cut in the bark onto plain daylight: a lawn, a fence, a house, and one ordinary tree"),
]


def chapter_card(a, n, word, sub, tone, scene):
    kit.bark(a, base=tone, scale=11, freq=(0.016, 0.003))
    a.rect(0, 0, a.w, a.h, fill=CR, opacity=0.42 if n != 5 else 0.28)
    kit.fissures(a, 0, 0, a.w, a.h, n=8, opacity=0.55)
    kit.glow(a, 330, 430, 520, kit.LANTERN, 0.45)
    scene(a)
    # the ring counter
    cx, cy = 340, 400
    a.circle(cx + 5, cy + 7, 282, fill="#000", opacity=0.4)
    a.circle(cx, cy, 276, fill="#caa173", filter=kit.bark_fx(a, freq=(0.02, 0.02), scale=4, octaves=3))
    a.circle(cx, cy, 276, fill="none", stroke=CR, stroke_width=9)
    kit.rings(a, cx, cy, n, r0=34, gap=36, width=6.5, lit_last=kit.GOLD)
    a.path(f"M{cx},{cy} L{cx},{cy - 276}", stroke=CR, stroke_width=6, stroke_linecap="round")
    a.path(f"M{cx},{cy} L{cx},{cy - 276}", stroke=kit.GOLD, stroke_width=1.4)
    for i in range(7):
        t = math.pi / 2 + (i - 3) * 0.16
        a.circle(cx + 310 * math.cos(t), cy + 310 * math.sin(t), 8, fill=kit.GOLD if i < n else CR, stroke=kit.GOLD, stroke_width=1.6)
    # lettering
    a.rect(0, 660, a.w, 240, fill=a.gradient([(0, "#000000"), (1, "#000000")]), opacity=0.35)
    rough = a.roughen(2.4, 0.04)
    a.open("g", filter=rough)
    size = min(128, int((830 / len(word) - 10) / 0.74))
    kit.carve(a, 720, 800, word, size=size, anchor="start", spacing=10, depth=4, light="#f2c48c")
    a.close()
    a.text(722, 690, f"CHAPTER {ROMAN[n - 1]}", size=30, family="serif", fill=kit.GOLD, letter_spacing=10)
    if sub:
        a.text(724, 856, sub, size=44, family="serif", fill=kit.PAPER, font_style="italic", opacity=0.92)
    kit.dust(a, 0, 0, a.w, a.h, n=260, opacity=0.3)
    a.vignette(0.7)


for n, (key, word, sub, tone, scene, what) in enumerate(CHAPTERS, 1):
    def _mk(n=n, word=word, sub=sub, tone=tone, scene=scene, what=what):
        def draw(a: Art):
            chapter_card(a, n, word, sub, tone, scene)
        draw.__doc__ = (f"Chapter card {n}: a slice of knot with {n} growth ring{'s' if n > 1 else ''}, the newest lit gold, beside "
                        f"{what}. The chapter's name is cut into the bark below.")
        return draw
    asset(G, f"chapter-{n}-{key}", group="chapters", title=f"Chapter {n}: {word.title()}", w=1600, h=900, row=ROW_C)(_mk())


# ---------------------------------------------------------------------------------------------
# the saying wall and the Roll
# ---------------------------------------------------------------------------------------------
@asset(G, "saying-wall", group="documents", title="The saying wall", w=1600, h=900, row=ROW_W)
def saying_wall(a: Art):
    """The temple wall where each reading's Crown card is painted as a saying: six cartouches brushed onto the
    bark in pale lichen paint, each with a roundel for its suit. One is filled, in Pell's words, and five wait
    empty. A paint pot and a frayed-twig brush stand on the ledge, and a lantern lights the wall from below."""
    kit.bark(a, base="#9a7150", scale=10, freq=(0.02, 0.004))
    a.rect(0, 0, a.w, a.h, fill=CR, opacity=0.38)
    kit.fissures(a, 0, 0, a.w, a.h, n=7, opacity=0.5)
    kit.glow(a, 800, 900, 900, kit.LANTERN, 0.6)
    paint = "#e6ecc0"
    rough = a.roughen(3.5, 0.05)
    r = a.rng
    slots = [(110 + (i % 2) * 720, 90 + (i // 2) * 232) for i in range(6)]
    for i, (x, y) in enumerate(slots):
        w, h = 660, 180
        a.open("g", filter=rough)
        a.rect(x, y, w, h, rx=26, fill=paint, opacity=0.1 if i else 0.16)
        a.rect(x, y, w, h, rx=26, fill="none", stroke=paint, stroke_width=7, opacity=0.9 if i == 0 else 0.5,
               stroke_dasharray=None if i == 0 else "30 16")
        a.circle(x + 78, y + h / 2, 44, fill="none", stroke=paint, stroke_width=5, opacity=0.9 if i == 0 else 0.5)
        if i == 0:
            kit.sigil(a, "eye", x + 78, y + h / 2, 1.25, col=paint, w=5)
            a.text(x + 150, y + 82, "A card means", size=58, family="serif", fill=paint, font_style="italic")
            a.text(x + 150, y + 146, "what we do after it.", size=58, family="serif", fill=paint, font_style="italic")
        else:
            for k in range(2):
                a.line(x + 150, y + 76 + k * 60, x + w - 50, y + 76 + k * 60, stroke=paint, stroke_width=3, opacity=0.3, stroke_dasharray="4 14",
                       stroke_linecap="round")
        a.close()
        if i == 0:
            for k in range(5):
                dx = x + 170 + r.uniform(0, 420)
                a.line(dx, y + h, dx, y + h + r.uniform(14, 46), stroke=paint, stroke_width=4, opacity=0.7, stroke_linecap="round")
    # the ledge, pot and brush
    a.path("M0,826 Q800,800 1600,826 V900 H0Z", fill=CR)
    a.path("M0,826 Q800,800 1600,826", fill="none", stroke="#e9b77c", stroke_width=3, opacity=0.6)
    a.path("M1340,760 h96 l-10,70 h-76Z", fill=kit.UMBER, stroke=CR, stroke_width=4)
    a.ellipse(1388, 760, 48, 12, fill=paint, stroke=CR, stroke_width=4)
    a.line(1470, 690, 1404, 764, stroke=CR, stroke_width=10, stroke_linecap="round")
    a.line(1470, 690, 1404, 764, stroke="#c99a6a", stroke_width=5, stroke_linecap="round")
    for k in range(5):
        a.line(1404, 764, 1388 + k * 5, 784, stroke=paint, stroke_width=3, stroke_linecap="round")
    kit.lantern(a, 250, 800, 2.2, halo=150)
    kit.dust(a, 0, 300, a.w, 600, n=240, opacity=0.35)
    a.vignette(0.7)


@asset(G, "roll-of-the-bark", group="documents", title="The Roll of the Bark", w=800, h=1100, row=ROW_W)
def roll(a: Art):
    """The Roll of the Bark on the Knot temple wall: a tall panel smoothed into the bark, the title cut across
    its head, and under it a carved line for each person lost this year, a name and one habit. Two lines are cut;
    ten more are ruled and waiting. Lichen has started in the oldest letters and a lantern stands at the foot."""
    kit.bark(a, base="#9a7150", scale=10, freq=(0.03, 0.005))
    a.rect(0, 0, a.w, a.h, fill=CR, opacity=0.4)
    kit.glow(a, 400, 1100, 760, kit.LANTERN, 0.6)
    a.path("M70,170 Q70,60 400,56 Q730,60 730,170 V1010 H70Z", fill="#000", opacity=0.45, transform="translate(6 8)")
    a.path("M70,170 Q70,60 400,56 Q730,60 730,170 V1010 H70Z", fill="#b89268",
           filter=kit.bark_fx(a, light="#ffe2b8", freq=(0.012, 0.03), scale=3, octaves=3, el=50))
    a.path("M70,170 Q70,60 400,56 Q730,60 730,170 V1010 H70Z", fill="none", stroke=CR, stroke_width=8)
    a.path("M92,180 Q92,84 400,80 Q708,84 708,180 V988 H92Z", fill="none", stroke=CR, stroke_width=2, opacity=0.7)
    kit.rings(a, 400, 150, 3, r0=10, gap=10, width=3, stroke=CR, light="#f2d0a0")
    rough = a.roughen(1.6, 0.05)
    a.open("g", filter=rough)
    kit.carve(a, 400, 248, "THE ROLL", size=62, spacing=10, depth=2.5, light="#f6dcb0")
    kit.carve(a, 400, 296, "OF THE BARK", size=34, spacing=10, depth=2, light="#f6dcb0")
    a.close()
    a.line(150, 322, 650, 322, stroke=CR, stroke_width=3)
    a.line(150, 325, 650, 325, stroke="#f6dcb0", stroke_width=1.5, opacity=0.7)
    lines = [("Hob,", "who counted ridges to fall asleep"), ("Wren,", "who saved the last sip for whoever came in late")]
    y = 384
    for i in range(12):
        if i < 2:
            name, habit = lines[i]
            a.open("g", filter=rough)
            kit.carve(a, 128, y, name, size=30, anchor="start", spacing=2, depth=1.6, light="#f6dcb0")
            kit.carve(a, 128 + (76 if i == 0 else 92), y, habit, size=20 if i == 0 else 19, anchor="start", spacing=0.4, depth=1.2,
                      light="#f6dcb0", weight="normal")
            a.close()
        else:
            a.line(128, y, 672, y, stroke=CR, stroke_width=1.6, opacity=0.5, stroke_dasharray="2 9", stroke_linecap="round")
        a.poly([(100, y - 12), (112, y - 6), (100, y)], fill=CR, opacity=0.8)
        y += 50
    a.stipple(120, 220, 300, 90, n=40, r=(1.2, 3), fill=kit.SAGE, opacity=0.85)
    a.stipple(120, 230, 220, 70, n=18, r=(1, 2.4), fill=kit.LIME, opacity=0.9)
    a.path("M0,1030 Q400,1010 800,1030 V1100 H0Z", fill=CR)
    kit.lantern(a, 400, 1020, 2.2, halo=170)
    kit.dust(a, 0, 500, 800, 600, n=160, opacity=0.4)
    a.vignette(0.7)


# ---------------------------------------------------------------------------------------------
# endings: the bark above, the yard below
# ---------------------------------------------------------------------------------------------
TOP_H, BAND_Y, BAND_H = 470, 470, 104
YARD_Y = BAND_Y + BAND_H
YARD_H = 900 - YARD_Y


def top_open(a, tone="#9a7150", dark=0.42):
    a.open("g", clip_path=a.clip(f'<rect x="0" y="0" width="1600" height="{TOP_H}"/>'))
    kit.bark(a, 0, 0, 1600, TOP_H, base=tone, scale=10, freq=(0.018, 0.0035))
    a.rect(0, 0, 1600, TOP_H, fill=CR, opacity=dark)


def yard_open(a, sky=kit.SKY, grass=kit.GRASS, horizon=120, fence=True):
    """The backyard: plain deep-focus daylight. No words, and no face."""
    a.open("g", clip_path=a.clip(f'<rect x="0" y="0" width="1600" height="{YARD_H}"/>'), transform=f"translate(0 {YARD_Y})")
    a.rect(0, 0, 1600, YARD_H, fill=sky)
    if fence:
        d = "".join(f"M{4 + i * 30},{horizon - 58} l11,-11 l11,11 V{horizon + 4} h-22Z" for i in range(54))
        a.path(d, fill=kit.FENCE, stroke="#9aa3a0", stroke_width=1.2)
        a.rect(0, horizon - 40, 1600, 6, fill=kit.FENCE, stroke="#9aa3a0", stroke_width=1)
    a.rect(0, horizon, 1600, YARD_H - horizon, fill=grass)
    a.path("".join(f"M{12 + i * 26},{horizon + 20 + (i * 53) % 170} l3,-10 l3,10" for i in range(61)), fill="none", stroke="#5c8a3e", stroke_width=1.6)


def yard_trunk(a, x, w=150, top=0):
    a.path(f"M{x},{top} H{x + w} Q{x + w - 12},{YARD_H * 0.6} {x + w + 34},{YARD_H} H{x - 30} Q{x + 12},{YARD_H * 0.6} {x},{top}Z", fill="#7a5a40",
           stroke="#4a3324", stroke_width=2.5)
    r = a.rng
    a.path("".join(f"M{f(x + r.uniform(10, w - 10))},{f(r.uniform(top, YARD_H - 80))} q{f(r.uniform(-6, 6))},30 0,{f(r.uniform(50, 90))}" for _ in range(16)),
           fill="none", stroke="#4a3324", stroke_width=2)


def band(a, name, line, as_written=False):
    a.rect(0, BAND_Y, 1600, BAND_H, fill="#1b120c")
    a.rect(0, BAND_Y, 1600, BAND_H, fill="#6a4a33", filter=kit.bark_fx(a, scale=6, freq=(0.02, 0.01)), opacity=0.9)
    a.rect(0, BAND_Y, 1600, BAND_H, fill=CR, opacity=0.45)
    a.line(0, BAND_Y, 1600, BAND_Y, stroke=kit.GOLD, stroke_width=2)
    a.line(0, BAND_Y + BAND_H, 1600, BAND_Y + BAND_H, stroke=kit.GOLD, stroke_width=2)
    kit.rings(a, 70, BAND_Y + BAND_H / 2, 3, r0=8, gap=9, width=2.6, stroke=CR, light="#e9b77c", lit_last=kit.GOLD)
    kit.carve(a, 124, BAND_Y + 66, name.upper(), size=46, anchor="start", spacing=5, depth=2.4, light="#f2c48c", fill="#0d0805")
    a.text(1560, BAND_Y + 62, line, size=27 if len(line) < 60 else 24, family="serif", fill=kit.PAPER, font_style="italic", text_anchor="end")
    if as_written:
        a.text(1560, BAND_Y + 92, "AS WRITTEN", size=13, family="serif", fill=kit.GOLD, text_anchor="end", letter_spacing=6)


def long_crack(a, pts, w=30):
    d = a.smooth_d(pts)
    a.path(d, fill="none", stroke="#e9b77c", stroke_width=w + 6, opacity=0.35, stroke_linecap="round", transform="translate(3 4)")
    a.path(d, fill="none", stroke="#0d0805", stroke_width=w, stroke_linecap="round")


def e_shadow_passes(a):
    top_open(a, dark=0.3)
    a.rect(0, 0, 1600, TOP_H, fill=a.gradient([(0, "#f0c050"), (1, "#f0c050")]), opacity=0.0)
    a.rect(700, 0, 900, TOP_H, fill=a.gradient([(0, "#1b120c"), (1, "#f0c050")], x1=0, y1=0, x2=1, y2=0), opacity=0.5)
    kit.glow(a, 1600, 200, 700, kit.GOLD, 0.7)
    long_crack(a, [(60, 470), (300, 380), (520, 400), (760, 280), (1000, 300), (1240, 170), (1600, 110)])
    ridge(a, 120, 560, 250, n=5, people=4, s=0.9)
    ridge(a, 900, 1380, 430, n=5, people=5, s=0.9)
    kit.person(a, 800, 268, 0.9, lean=16, stride=13, arms=((-20, -52), (18, -58)), cloth=kit.GREYBROWN,
               extra=lambda b: kit.scarf(b, kit.RUBRIC, kit.INK, long=44))
    kit.kite(a, 1330, 90, 2.6, col=kit.PAPER, string_to=(1180, 400))
    # at the feast, Fenn lays her ear on the wall
    a.rect(430, 150, 16, 96, fill=CR)
    kit.person(a, 404, 246, 0.7, kind="apron", lean=12, cloth=kit.GREYBROWN, arms=((-12, -42), (18, -70)))
    kit.dust(a, 600, 0, 1000, TOP_H, n=220, opacity=0.5)
    a.close()
    yard_open(a)
    yard_trunk(a, 120)
    a.rect(1160, -40, 440, 170, fill="#e8dcc8", stroke="#9a8f7c", stroke_width=2)
    a.rect(1320, 20, 76, 112, fill="#7a5a40", stroke="#4a3324", stroke_width=2)
    a.circle(1384, 80, 4, fill="#e0b040")
    a.rect(1200, 10, 80, 60, fill="#bcd3e0", stroke="#9a8f7c", stroke_width=2)
    a.path("M1300,132 h116 l20,24 h-156Z", fill="#c9c2b4", stroke="#9a8f7c", stroke_width=1.5)
    # someone walking back to the house, seen from behind and far off
    a.ellipse(1000, 214, 30, 7, fill="#000", opacity=0.2)
    a.path("M984,210 L988,150 M1012,210 L1008,150", stroke="#4a5a6e", stroke_width=12, stroke_linecap="round")
    a.path("M974,80 Q1000,66 1026,80 L1022,156 H978Z", fill="#6f86a0", stroke="#4a5a6e", stroke_width=2)
    a.path("M976,88 L966,140 M1024,88 L1034,140", stroke="#6f86a0", stroke_width=10, stroke_linecap="round")
    a.circle(1000, 56, 18, fill="#6a4a33")
    a.close()


def e_war(a):
    top_open(a, tone="#7a5a44", dark=0.62)
    for (x0, x1, y) in ((60, 520, 150), (460, 1000, 250), (900, 1560, 140), (1040, 1580, 380)):
        ridge(a, x0, x1, y, n=5, lit=False, s=0.8)
        for k in range(3):
            fx = x0 + (x1 - x0) * (k + 0.5) / 3
            kit.glow(a, fx, y - 40, 110, kit.LANTERN, 0.9)
            a.path(f"M{fx - 10},{y - 22} q-8,-22 10,-44 q4,16 14,22 q4,14 -6,22Z", fill=kit.GOLD, stroke=kit.LANTERN, stroke_width=3)
    # Burr alone, polishing a spear that is no longer clean
    a.path("M120,470 Q360,410 640,470Z", fill=CR)
    kit.glow(a, 250, 430, 170, kit.LANTERN, 0.7)
    kit.person(a, 380, 446, 1.5, kind="plate", lean=-8, cloth="#9a7a52", crest=kit.LANTERN, arms=((-6, -40), (18, -44)), stride=3,
               extra=lambda b: (b.line(-40, -30, 46, -56, stroke=kit.INK, stroke_width=2.4, stroke_linecap="round"),
                                b.poly([(58, -60), (44, -62), (46, -50)], fill=kit.RUBRIC, stroke=kit.INK, stroke_width=1),
                                b.rect(2, -48, 12, 8, fill=kit.PAPER, stroke=kit.INK, stroke_width=0.8)))
    kit.lantern(a, 250, 440, 1.8, halo=90)
    kit.dust(a, 0, 0, 1600, TOP_H, n=200, opacity=0.4)
    a.close()
    yard_open(a)
    yard_trunk(a, 1260, w=170)
    # a hand held up, the other picking a splinter out of a fingertip. No face.
    a.path("M300,330 L330,170 L470,150 L520,330Z", fill="#6f86a0", stroke="#4a5a6e", stroke_width=2.5)
    a.path("M344,176 Q340,110 372,60 Q384,40 398,58 L394,96 Q402,40 420,34 Q436,36 432,60 L430,100 Q442,56 458,60 Q470,66 464,90 "
           "L456,124 Q474,100 484,110 Q492,122 478,150 Q470,190 440,196 Z", fill="#e3b896", stroke="#9a6a4a", stroke_width=2.5, stroke_linejoin="round")
    a.line(424, 36, 430, 14, stroke="#4a3324", stroke_width=3, stroke_linecap="round")
    a.path("M820,330 L760,200 L640,160 L600,330Z", fill="#6f86a0", stroke="#4a5a6e", stroke_width=2.5)
    a.path("M650,170 Q560,150 500,80 Q478,56 452,40 Q440,34 440,46 Q470,70 480,96 Q520,150 560,190 Q610,220 660,214Z", fill="#e3b896",
           stroke="#9a6a4a", stroke_width=2.5, stroke_linejoin="round")
    a.close()


def e_edge(a):
    top_open(a, dark=0.34)
    # the bark curving away to the right, into light
    a.path(f"M1180,0 Q1420,{TOP_H / 2} 1180,{TOP_H} H1600 V0Z", fill=a.gradient([(0, "#f0c050"), (1, "#fff6dc")], x1=0, y1=0, x2=1, y2=0), opacity=0.92)
    a.path(f"M1180,0 Q1420,{TOP_H / 2} 1180,{TOP_H}", fill="none", stroke=CR, stroke_width=6)
    a.path(f"M1120,0 Q1350,{TOP_H / 2} 1120,{TOP_H}", fill="none", stroke=CR, stroke_width=2, opacity=0.5)
    kit.glow(a, 1300, 235, 520, kit.GOLD, 0.5)
    ridge(a, 420, 1040, 400, n=6, people=3)
    kit.person(a, 1010, 380, 1.3, lean=4, stride=5, arms=((-13, -40), (18, -86)), cloth=kit.GREYBROWN,
               extra=lambda b: kit.scarf(b, kit.RUBRIC, kit.INK, long=36))
    for x, y in ((1150, 140), (1200, 260), (1178, 380)):
        a.line(x, y, x - 6, y - 46, stroke=CR, stroke_width=7, stroke_linecap="round")
        a.line(x, y, x - 6, y - 46, stroke="#e6cfa0", stroke_width=3.5, stroke_linecap="round")
        a.path(f"M{x - 6},{y - 46} l18,5 l-17,8Z", fill=kit.AZURE, stroke=CR, stroke_width=1.2)
    # Fenn's map: the shape the Shadow had, and an edge drawn outside it, and one inside
    a.open("g", transform="rotate(-5 230 220)")
    a.rect(70, 60, 330, 330, fill="#000", opacity=0.4, transform="translate(6 8)")
    a.rect(70, 60, 330, 330, fill=kit.PAPER, stroke=kit.INK, stroke_width=2)
    for i, ln in enumerate((120, 160, 176, 156, 104)):
        x = 150 + i * 38
        a.path(f"M{x - 13},{330 - ln} a13,13 0 0,1 26,0 V300 h-26Z", fill="none", stroke=kit.INK, stroke_width=2, stroke_dasharray="5 4")
    a.rect(137, 290, 178, 60, rx=18, fill="none", stroke=kit.INK, stroke_width=2, stroke_dasharray="5 4")
    a.path("M380,70 Q330,220 380,380", fill="none", stroke=kit.RUBRIC, stroke_width=3)
    a.path("M100,120 q10,-8 20,0 t20,0 t20,0", fill="none", stroke=kit.CHALK, stroke_width=3)
    a.path("M96,116 Q170,90 250,110", fill="none", stroke="#7d878a", stroke_width=1.2, stroke_dasharray="2 4")
    for k in range(4):
        kit.suit_mark(a, "tremor", 110 + k * 26, 366, 0.4)
    a.close()
    kit.dust(a, 900, 0, 700, TOP_H, n=160, opacity=0.5)
    a.close()
    # the rise goes on: the yard, the fence, the next yard, and the one after
    a.open("g", clip_path=a.clip(f'<rect x="0" y="0" width="1600" height="{YARD_H}"/>'), transform=f"translate(0 {YARD_Y})")
    a.rect(0, 0, 1600, YARD_H, fill="#8fbf68")
    for k, (y, h, g) in enumerate(((0, 60, "#9cc878"), (66, 96, "#86b860"), (170, 170, "#7fae5a"))):
        a.rect(0, y, 1600, h, fill=g)
        a.rect(0, y + h - 2, 1600, 8, fill=kit.FENCE, stroke="#9aa3a0", stroke_width=1)
        step = 150 + k * 110
        for i in range(int(1600 / step) + 2):
            x = i * step - (k * 60)
            a.rect(x, y, 6, h, fill=kit.FENCE, stroke="#9aa3a0", stroke_width=0.8)
            if (i + k) % 2 == 0:
                a.rect(x + step * 0.5, y + h * 0.2, step * 0.3, h * 0.4, fill="#e8dcc8", stroke="#9a8f7c", stroke_width=1.2)
                a.rect(x + step * 0.48, y + h * 0.14, step * 0.34, h * 0.12, fill="#a8644a")
            a.circle(x + step * 0.25, y + h * 0.55, 10 + k * 9, fill="#5c8a3e")
            a.circle(x + step * 0.25 - 3 - k * 2, y + h * 0.55 - 3 - k * 2, 5 + k * 5, fill="#73a257")
    a.circle(390, 250, 46, fill="#4a7a34")
    a.circle(374, 236, 26, fill="#73a257")
    a.circle(390, 250, 9, fill="#7a5a40")
    a.close()


def e_flake(a):
    top_open(a, dark=0.4)
    # the new edge: raw pale wood where the plate was
    a.path(f"M900,0 L940,90 L880,180 L960,290 L900,380 L950,{TOP_H} H1600 V0Z", fill="#e2c090")
    a.path(f"M900,0 L940,90 L880,180 L960,290 L900,380 L950,{TOP_H}", fill="none", stroke=CR, stroke_width=7, stroke_linejoin="round")
    r = a.rng
    a.path("".join(f"M{f(r.uniform(980, 1580))},{f(r.uniform(0, TOP_H - 80))} q{f(r.uniform(-8, 8))},40 0,{f(r.uniform(60, 120))}" for _ in range(26)),
           fill="none", stroke="#b8946a", stroke_width=3)
    a.rect(900, 0, 700, TOP_H, fill=CR, opacity=0.25)
    # pale galleries showing in the raw wood: only walls
    for x, y in ((1100, 120), (1300, 260), (1180, 380), (1460, 150)):
        pts = [(x + k * 30, y + 12 * math.sin(k * 1.3 + x)) for k in range(5)]
        a.path(a.smooth_d(pts), fill="none", stroke="#5d676a", stroke_width=20, stroke_linecap="round", opacity=0.8)
        a.path(a.smooth_d(pts), fill="none", stroke=kit.CHALK, stroke_width=13, stroke_linecap="round")
    ridge(a, 120, 860, 400, n=7, people=0)
    kit.glow(a, 420, 360, 220, kit.LANTERN, 0.85)
    # Old Resin lights the pot
    a.path("M392,396 h70 l-8,-44 h-54Z", fill=kit.UMBER, stroke=CR, stroke_width=3)
    a.ellipse(427, 352, 28, 7, fill=kit.AMBER, stroke=CR, stroke_width=2)
    a.path("M416,412 q-8,-12 10,-22 q10,12 0,22Z", fill=kit.GOLD, stroke=kit.LANTERN, stroke_width=2)
    kit.person(a, 344, 396, 1.0, lean=6, cloth=kit.AMBER, arms=((-12, -40), (26, -52)),
               extra=lambda b: b.line(26, -52, 44, -78, stroke=kit.INK, stroke_width=2.4, stroke_linecap="round"))
    # someone starts carving the first ring of a new door
    a.circle(690, 250, 62, fill="#b08a62", stroke=CR, stroke_width=4)
    a.path("M690,188 A62,62 0 0,1 752,250", fill="none", stroke=kit.GOLD, stroke_width=6, stroke_linecap="round")
    kit.person(a, 760, 392, 1.0, flip=-1, cloth=kit.SAGE, arms=((-12, -40), (20, -110)), lean=-6)
    for x in (560, 610, 840):
        kit.person(a, x, 394, 0.8, kind="robe" if x == 610 else "plain", cloth=kit.GREYBROWN, flip=1 if x < 800 else -1)
    kit.dust(a, 0, 0, 1600, TOP_H, n=220, opacity=0.4)
    a.close()
    yard_open(a)
    yard_trunk(a, 100, w=170)
    a.path("M132,60 l70,-10 l30,60 l-50,50 l-56,-30Z", fill="#e2c090", stroke="#b8946a", stroke_width=2)
    # the flake, face down in the grass; its underside is not solid
    a.ellipse(900, 250, 250, 26, fill="#000", opacity=0.18)
    a.path("M660,236 L720,170 L880,150 L1060,164 L1140,220 L1080,262 L880,274 L720,266Z", fill="#c9a877", stroke="#7a5a40", stroke_width=3,
           stroke_linejoin="round")
    for i in range(34):
        x, y = r.uniform(720, 1080), r.uniform(172, 256)
        a.ellipse(x, y, r.uniform(6, 16), r.uniform(4, 8), fill="#5a4a3a", stroke="#3a2a1c", stroke_width=1,
                  transform=f"rotate({f(r.uniform(-30, 30))} {f(x)} {f(y)})")
    a.path("M660,236 L720,266 L880,274 L1080,262 L1140,220 L1136,238 L1082,280 L880,292 L716,284Z", fill="#7a5a40", stroke="#4a3324",
           stroke_width=2)
    a.close()


def e_ring(a):
    top_open(a, dark=0.36)
    kit.glow(a, 800, 150, 800, kit.GOLD, 0.45)
    # the band of colour that circles the world
    pts_t = [(i * 100, 150 + 16 * math.sin(i * 0.7)) for i in range(17)]
    pts_b = [(i * 100, 250 + 16 * math.sin(i * 0.7 + 0.4)) for i in range(17)]
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts_t + pts_b[::-1]) + "Z"
    a.path(d, fill="#000", opacity=0.4, transform="translate(0 12)")
    a.path(d, fill=kit.RUBRIC, stroke=CR, stroke_width=3)
    a.path(a.smooth_d([(x, y + 30) for x, y in pts_t]), fill="none", stroke="#e0705a", stroke_width=10, opacity=0.6)
    a.path(a.smooth_d([(x, y - 16) for x, y in pts_b]), fill="none", stroke="#6a1a10", stroke_width=6, opacity=0.5)
    cp = a.clip(f'<path d="{d}"/>')
    a.hatch(0, 120, 1600, 160, angle=90, spacing=7, stroke="#7a2416", stroke_width=1, clip=cp, opacity=0.6)
    ridge(a, 160, 1440, 420, n=11, people=0)
    for x, k, fl in ((300, "robe", 1), (420, "robe", 1), (560, "plain", 1), (700, "apron", 1), (860, "robe", -1), (1010, "plate", -1), (1160, "plain", -1),
                     (1290, "robe", -1)):
        kit.person(a, x, 414, 0.78, kind=k, flip=fl, cloth=(kit.GREYBROWN, "#8f8a70", kit.SAGE)[x % 3], arms=((-18, -88), (20, -90)),
                   crest=kit.LANTERN if k == "plate" else None)
    kit.kite(a, 1380, 330, 2.0, col=kit.PAPER, string_to=(1330, 400))
    # they count it with the others
    kit.rings(a, 110, 360, 4, r0=10, gap=11, width=3, stroke=CR, light="#e9b77c", lit_last=kit.RUBRIC)
    kit.dust(a, 0, 0, 1600, TOP_H, n=220, opacity=0.4)
    a.close()
    yard_open(a)
    yard_trunk(a, 380, w=190)
    a.path("M370,150 Q480,176 596,150 L598,196 Q480,222 366,196Z", fill=kit.RUBRIC, stroke="#6a1a10", stroke_width=2.5)
    a.path("M560,170 q40,10 46,60 l-20,-8 l-10,22 q-10,-40 -30,-56Z", fill=kit.RUBRIC, stroke="#6a1a10", stroke_width=2.5)
    a.circle(560, 174, 13, fill="#c8402a", stroke="#6a1a10", stroke_width=2.5)
    # over the fence, a stump
    a.path("M1100,130 Q1104,84 1120,60 L1300,60 Q1316,84 1320,130Z", fill="#8a6a4c", stroke="#4a3324", stroke_width=2.5)
    a.ellipse(1210, 60, 90, 22, fill="#e2c090", stroke="#4a3324", stroke_width=2.5)
    for rr in (70, 50, 30, 12):
        a.ellipse(1210, 60, rr, rr * 0.24, fill="none", stroke="#b8946a", stroke_width=1.6)
    # the fence in front of it
    d2 = "".join(f"M{1030 + i * 30},{120 - 58} l11,-11 l11,11 V124 h-22Z" for i in range(12))
    a.path(d2, fill=kit.FENCE, stroke="#9aa3a0", stroke_width=1.2, opacity=0.55)
    a.close()


ENDINGS = [
    ("the-shadow-passes", "The Shadow Passes", "Even the smallest world is a universe to the ones who live in it.", True, e_shadow_passes,
     "Above, light comes back from the east edge, the people come out of the knots, Twig's kite goes up, Mossa starts up the Long "
     "Crack and Fenn lays her ear on the wall. Below, someone walks back across the yard to the house, seen from behind."),
    ("the-war-on-the-god", "The War on the God", "They won. The Trunk will remember it as long as they do.", False, e_war,
     "Above, the bark at night with a victory fire on every ridge and Burr alone, polishing a spear that is no longer clean. "
     "Below, a hand held up while another picks a splinter from its fingertip; no face is shown."),
    ("the-edge-of-the-world", "The Edge of the World", "They did not know what lay past the edge. They knew there was one.", False, e_edge,
     "Above, Mossa at the top of Highridge at dawn looking to where the bark curves away, the scholars' stakes along it, and Fenn's "
     "map with the Shadow's five arms, an outer edge and an inner one. Below, the rise goes on over the yard, the fence and the next yards."),
    ("the-flake", "The Flake", "The Trunk shrugged. They began again.", False, e_flake,
     "Above, the survivors at the raw new edge of their city: Old Resin lights the pot and someone cuts the first ring of a new "
     "door. Below, a flake of bark lies face down in the grass, and its underside is not solid."),
    ("the-ring", "The Ring", "The god had left them a ring. They counted it with the others.", False, e_ring,
     "Above, a band of colour circles the world and the people lift their arms to it as to a covenant. Below, a ribbon is tied "
     "round the trunk and, over the fence, there is a stump."),
]
for key, name, line, aw, fn, what in ENDINGS:
    def _mk(name=name, line=line, aw=aw, fn=fn, what=what):
        def draw(a: Art):
            a.rect(0, 0, 1600, 900, fill="#1b120c")
            fn(a)
            band(a, name, line, aw)
            a.rect(0, 0, 1600, TOP_H, fill=a.radial([(0.55, "#000000", 0), (1, "#000000", 0.6)], r=0.75))
            a.rect(3, 3, 1594, 894, fill="none", stroke="#1b120c", stroke_width=6)
        draw.__doc__ = f"Ending card, {name}" + (" (as written)" if aw else "") + f": the bark above, the yard below. {what}"
        return draw
    asset(G, f"ending-{key}", group="endings", title=f"Ending: {name}", w=1600, h=900, row=ROW_E)(_mk())

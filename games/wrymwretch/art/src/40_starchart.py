"""Star Chart: three atlas plates and nine figure overlays, gold leaf on lapis. Stars and lines come from data/star_chart.json."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Star Chart plates and figure overlays"
CHART = kit.data("star_chart")
PAGES = CHART["pages"]
CONS = {c["id"]: c for p in PAGES for c in p["constellations"]}
STARS = {s["id"]: s for c in CONS.values() for s in c["stars"]}
SILVERINK = "#dfe6f2"

# hairline figures, in the chart's own coordinates (0..100, y up): lists of curves
FIG = {
    "stag": [[(26, 48), (31, 54)], [(22, 55), (28, 62)], [(17, 63), (23, 71)], [(12, 70), (14, 78)],
             [(30, 40), (34, 50), (32, 60), (28, 69)], [(34, 50), (38, 55)], [(32, 60), (37, 66)],
             [(30, 40), (25, 37), (22, 33), (25, 30.5), (30, 33), (33, 36)],
             [(33, 36), (38, 31), (46, 29), (54, 27), (59, 21)], [(30, 33), (34, 24), (42, 19), (52, 18), (59, 21)],
             [(36, 22), (34, 12), (35, 5)], [(42, 19), (43, 7)], [(52, 18), (50, 7)], [(58, 20), (60, 8)], [(59, 21), (63, 24)]],
    "gale_harp": [[(50, 85), (55.6, 60.3)], [(50, 85), (44.4, 60.3)], [(50, 85), (50, 59)], [(50, 85), (59.5, 64)], [(50, 85), (40.5, 64)],
                  [(64, 80), (70, 83), (73, 78), (69, 74), (66, 77)], [(36, 80), (30, 83), (27, 78), (31, 74), (34, 77)],
                  [(66, 66), (74, 66), (78, 61)], [(34, 66), (26, 66), (22, 61)], [(44, 57), (50, 54), (56, 57)]],
    "first_light": [[(78, 40), (66, 28)], [(78, 40), (90, 28)], [(78, 40), (68, 53)], [(78, 40), (88, 53)], [(78, 40), (78, 60)], [(78, 40), (78, 24)],
                    [(78 + 4 * math.cos(t), 40 + 4 * math.sin(t)) for t in [i * math.pi / 6 for i in range(13)]],
                    [(78 + 15 * math.cos(t), 40 + 15 * math.sin(t)) for t in [i * math.pi / 14 for i in range(8)]],
                    [(78 + 15 * math.cos(t), 40 + 15 * math.sin(t)) for t in [math.pi + i * math.pi / 14 for i in range(10)]]],
    "moons_tear": [[(25 + 14 * math.cos(t), 30 + 14 * math.sin(t)) for t in [0.9 + i * 0.3 for i in range(16)]],
                   [(29 + 11 * math.cos(t), 32 + 11 * math.sin(t)) for t in [1.2 + i * 0.3 for i in range(14)]],
                   [(25, 20), (22, 13.5), (25, 9), (28, 13.5), (25, 20)], [(21, 7), (25, 5), (29, 7)], [(19, 3.5), (25, 1.5), (31, 3.5)]],
    "delvers_lamp": [[(75, 41), (66, 37), (64, 30), (69, 24), (75, 23)], [(75, 41), (84, 37), (86, 30), (81, 24), (75, 23)],
                     [(75, 27), (72.6, 31), (75, 37), (77.4, 31), (75, 27)], [(75, 55), (77, 58), (75, 60), (73, 58), (75, 55)],
                     [(68, 15), (82, 15)], [(70, 12.5), (80, 12.5)], [(62, 34), (57, 36)], [(88, 34), (93, 36)], [(63, 26), (58, 23)], [(87, 26), (92, 23)]],
    "eclipse": [[(25 + 13.5 * math.cos(t), 75 + 13.5 * math.sin(t)) for t in [i * math.pi / 12 for i in range(25)]],
                [(28.5 + 11 * math.cos(t), 77 + 11 * math.sin(t)) for t in [i * math.pi / 12 for i in range(25)]],
                [(8, 75), (4, 75)], [(10, 84), (7, 87)], [(10, 66), (7, 63)], [(25, 92), (25, 96)], [(25, 58), (25, 54)], [(42, 75), (46, 75)]],
    "scholars_lamp": [[(70, 79), (71, 68), (77, 63), (84, 64), (87, 71), (82, 81), (70, 79)], [(56, 90), (63, 90), (70, 84)], [(57, 87.5), (63, 87), (68, 82)],
                      [(94, 55), (97.5, 50), (94, 46), (96.5, 41)], [(91, 56), (89, 50), (91, 45)], [(74, 61), (84, 59)]],
    "the_scholar": [[(43, 78), (41.5, 87), (50, 93), (58.5, 87), (57, 78)], [(40, 72), (33, 52), (35, 30), (39, 14)], [(60, 72), (66, 52), (64, 30), (61, 14)],
                    [(39, 14), (50, 11), (61, 14)], [(73, 50), (76, 47), (79, 50), (76, 55), (73, 50)], [(76, 57), (76, 62)], [(81, 55), (85, 58)], [(71, 55), (67, 58)]],
    "sigil": [[(45 + 44 * math.cos(t), 55 + 38 * math.sin(t)) for t in [i * math.pi / 20 for i in range(41)]],
              [(45 + 47 * math.cos(t), 55 + 41 * math.sin(t)) for t in [0.3 + i * math.pi / 20 for i in range(9)]],
              [(45 + 47 * math.cos(t), 55 + 41 * math.sin(t)) for t in [3.4 + i * math.pi / 20 for i in range(9)]]],
}
SIGIL_I = PAGES[0]["sigil"]["lines"]
SIGIL_III = PAGES[2]["sigil"]["lines"]


def gold(a):
    return kit.gold_grad(a)


def lapis(a, x=0, y=0, w=None, h=None):
    w = a.w if w is None else w
    h = a.h if h is None else h
    a.rect(x, y, w, h, fill="#1d2f6e")
    lid = a.uid("lapis")
    a.defn(f'<filter id="{lid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="0.008" numOctaves="4" seed="{a.seed % 991}"/>'
           f'<feColorMatrix values="0 0 0 0 0.10  0 0 0 0 0.20  0 0 0 0 0.62  0 0 -2.2 2.0 -0.25"/></filter>')
    a.rect(x, y, w, h, filter=f"url(#{lid})")
    a.vignette(0.55, "#070c24")
    a.stipple(x, y, w, h, n=int(w * h / 1100), r=(0.4, 1.3), fill="#e0bb5a", opacity=0.55)


def star(a, x, y, s, g, op=1.0):
    a.poly(a.star_pts(x, y, s, s * 0.28, n=4, rot=-90), fill=g, opacity=op)
    a.poly(a.star_pts(x, y, s * 0.6, s * 0.2, n=4, rot=-45), fill=g, opacity=op * 0.9)
    a.circle(x, y, s * 0.22, fill="#fff6cf", opacity=op)


def frame(a, g, m=22):
    w, h = a.w, a.h
    a.rect(m, m, w - 2 * m, h - 2 * m, fill="none", stroke=g, stroke_width=6)
    a.rect(m + 18, m + 18, w - 2 * m - 36, h - 2 * m - 36, fill="none", stroke=g, stroke_width=1.5)
    ticks = []
    n = int((w - 2 * m - 36) / 9.6)
    for k in range(n + 1):
        x = m + 18 + k * (w - 2 * m - 36) / n
        L = 10 if k % 8 == 0 else 5
        ticks.append(f"M{f(x)},{m + 18}v{L}M{f(x)},{h - m - 18}v{-L}")
    n = int((h - 2 * m - 36) / 9.6)
    for k in range(n + 1):
        y = m + 18 + k * (h - 2 * m - 36) / n
        L = 10 if k % 8 == 0 else 5
        ticks.append(f"M{m + 18},{f(y)}h{L}M{w - m - 18},{f(y)}h{-L}")
    a.path("".join(ticks), stroke="#e3b74a", stroke_width=1, fill="none")


def figure(a, key, M, op=0.3, color="#f3d27a", width=1.4):
    a.open("g", opacity=op, fill="none", stroke=color, stroke_width=width, stroke_linecap="round")
    a.path(" ".join(a.smooth_d([M(x, y) for x, y in c]) for c in FIG.get(key, [])))
    a.close()


def lines(a, pairs, M, g, width=4.0, missing=()):
    for s1, s2 in pairs:
        if s1 in missing or s2 in missing:
            continue
        (x1, y1), (x2, y2) = M(STARS[s1]["x"], STARS[s1]["y"]), M(STARS[s2]["x"], STARS[s2]["y"])
        a.line(x1, y1, x2, y2, stroke="#7a5310", stroke_width=width * 1.8, stroke_linecap="round", opacity=0.6)
        a.line(x1, y1, x2, y2, stroke=g, stroke_width=width, stroke_linecap="round")


def cons_stars(a, c, M, g, k=1.0, missing=()):
    for s in c["stars"]:
        x, y = M(s["x"], s["y"])
        if s["id"] in missing:
            a.circle(x, y, 15 * k, fill="none", stroke=SILVERINK, stroke_width=1.6, stroke_dasharray="4 5")
            continue
        star(a, x, y, (22 if s["mag"] == 1 else 14) * k, g)


def other_stars(a, page, M, g):
    for s in page["other_stars"]:
        x, y = M(s["x"], s["y"])
        star(a, x, y, 9, g, 0.55 if s.get("false") else 0.8)
        if s.get("false"):
            for k, rr in enumerate((16, 24, 32)):
                a.circle(x, y, rr, fill="none", stroke="#9fb6ff", stroke_width=1.3, stroke_dasharray="3 6", opacity=0.7 - k * 0.2)


def name_label(a, c, M, g, dy=-1, size=24):
    xs = [s["x"] for s in c["stars"]]
    ys = [s["y"] for s in c["stars"]]
    x, y = M((min(xs) + max(xs)) / 2, min(ys) if dy < 0 else max(ys))
    a.text(x, y + (44 if dy < 0 else -34), c["name"].upper(), size=size, family="serif", fill=g, text_anchor="middle", letter_spacing=4)


def graticule(a, x0, y0, x1, y1):
    cl = a.clip(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/>')
    cx, cy = (x0 + x1) / 2, y1 + (y1 - y0) * 0.55
    a.open("g", clip_path=cl, opacity=0.3)
    for k in range(1, 9):
        a.circle(cx, cy, (y1 - y0) * (0.5 + k * 0.16), fill="none", stroke="#e3b74a", stroke_width=0.8)
    for k in range(-7, 8):
        an = math.radians(-90 + k * 8)
        a.line(cx, cy, cx + 3000 * math.cos(an), cy + 3000 * math.sin(an), stroke="#e3b74a", stroke_width=0.6)
    a.close()


def plate(a, n, heading):
    g = gold(a)
    lapis(a)
    frame(a, g)
    graticule(a, 60, 150, 1140, 1130)
    kit.carved_text(a, 600, 112, heading, 40, fill=g, spacing=10, k=1.2)
    a.text(600, 1166, f"PLATE {kit.ROMAN[n]}", size=18, family="serif", fill="#e3b74a", text_anchor="middle", letter_spacing=8)
    for cx in (150, 1050):
        a.poly(a.star_pts(cx, 98, 16, 4, n=4), fill=g)
    return g


def M_plate(x, y):
    return 115 + x * 9.7, 1100 - y * 9.3


@asset(G, "chart-plate-priory", group="maps", title="Star Chart plate I: the Priory sky", w=1200, h=1200, row=ROW)
def plate1(a: Art):
    """Star Chart plate I, a gilded star atlas on lapis: the First Light, the Gale Harp and the Stag laid in gold leaf with
    their figures in hairline, and across all three, in cold silver, the lines that move on their own into the Sigil."""
    g = plate(a, 1, "THE PRIORY SKY")
    page = PAGES[0]
    for c in page["constellations"]:
        figure(a, c["id"], M_plate)
    # the Sigil, forming: silver, not gold
    for s1, s2 in SIGIL_I:
        (x1, y1), (x2, y2) = M_plate(STARS[s1]["x"], STARS[s1]["y"]), M_plate(STARS[s2]["x"], STARS[s2]["y"])
        a.line(x1, y1, x2, y2, stroke=kit.VIOLET, stroke_width=7, opacity=0.5, stroke_linecap="round")
        a.line(x1, y1, x2, y2, stroke=SILVERINK, stroke_width=1.8, stroke_dasharray="14 8", stroke_linecap="round")
    other_stars(a, page, M_plate, g)
    for c in page["constellations"]:
        lines(a, c["lines"], M_plate, g)
        cons_stars(a, c, M_plate, g)
    name_label(a, CONS["first_light"], M_plate, g, dy=1)
    name_label(a, CONS["gale_harp"], M_plate, g, dy=1)
    name_label(a, CONS["stag"], M_plate, g, dy=-1)


@asset(G, "chart-plate-moot", group="maps", title="Star Chart plate II: the sky over the Moot", w=1200, h=1200, row=ROW)
def plate2(a: Art):
    """Star Chart plate II: the Moon's Tear, the Delver's Lamp and the Eclipse in gold on lapis, four false stars ringed where
    they flicker, and the Scholar's Lamp with one star missing. One line toward the empty place has drawn itself, in silver
    ink and a careful hand."""
    g = plate(a, 2, "THE SKY OVER THE MOOT")
    page = PAGES[1]
    for c in page["constellations"]:
        figure(a, c["id"], M_plate)
    other_stars(a, page, M_plate, g)
    miss = ("sl7",)
    for c in page["constellations"]:
        lines(a, c["lines"], M_plate, g, missing=miss)
        cons_stars(a, c, M_plate, g, missing=miss)
    # the second reader's line
    (x1, y1), (x2, y2) = M_plate(STARS["sl6"]["x"], STARS["sl6"]["y"]), M_plate(STARS["sl7"]["x"], STARS["sl7"]["y"])
    a.line(x1, y1, x2, y2, stroke=SILVERINK, stroke_width=6, opacity=0.25, stroke_linecap="round")
    a.path(a.wobble_d([(x1, y1), (x1 + (x2 - x1) * 0.8, y1 + (y2 - y1) * 0.8)], 0.8, 10), fill="none", stroke=SILVERINK, stroke_width=2.2, stroke_linecap="round")
    name_label(a, CONS["moons_tear"], M_plate, g, dy=1)
    name_label(a, CONS["delvers_lamp"], M_plate, g, dy=-1)
    name_label(a, CONS["eclipse"], M_plate, g, dy=-1)
    c = CONS["scholars_lamp"]
    x, y = M_plate(64, 90)
    a.text(x, y - 46, c["name"].upper(), size=24, family="serif", fill=g, text_anchor="middle", letter_spacing=4)


@asset(G, "chart-plate-expanse", group="maps", title="Star Chart plate III: the Expanse", w=1200, h=1200, row=ROW)
def plate3(a: Art):
    """Star Chart plate III: the Sigil gilded black over twelve stars, two of its lines already lifted, and beneath it the
    hairline of an empty hood and robe. The twelfth star, out at the end of one arm, is silver: it is the one that was placed."""
    g = plate(a, 3, "THE EXPANSE")
    page = PAGES[2]
    M = lambda x, y: (140 + x * 9.2, 1120 - y * 9.6)
    figure(a, "the_scholar", M, op=0.5)
    other_stars(a, page, M, g)
    c = CONS["the_scholar"]
    # the man beneath, where his lines will go: hairline only
    for s1, s2 in c["lines"]:
        (x1, y1), (x2, y2) = M(STARS[s1]["x"], STARS[s1]["y"]), M(STARS[s2]["x"], STARS[s2]["y"])
        a.line(x1, y1, x2, y2, stroke="#f3d27a", stroke_width=1.2, stroke_dasharray="3 7", opacity=0.6)
    # the Sigil: black gilding, to be unpicked
    for i, (s1, s2) in enumerate(SIGIL_III):
        (x1, y1), (x2, y2) = M(STARS[s1]["x"], STARS[s1]["y"]), M(STARS[s2]["x"], STARS[s2]["y"])
        if i in (4, 6):   # lifted: only the bruise of it left
            a.line(x1, y1, x2, y2, stroke=kit.VIOLET, stroke_width=8, opacity=0.35, stroke_linecap="round")
            a.line(x1, y1, x2, y2, stroke=SILVERINK, stroke_width=1.2, stroke_dasharray="2 9", opacity=0.7)
            continue
        a.line(x1, y1, x2, y2, stroke=g, stroke_width=9, stroke_linecap="round", opacity=0.8)
        a.line(x1, y1, x2, y2, stroke="#0b0d1a", stroke_width=6, stroke_linecap="round")
        a.line(x1, y1, x2, y2, stroke=kit.VIOLET, stroke_width=1.4, stroke_linecap="round", opacity=0.9)
    for s in c["stars"]:
        x, y = M(s["x"], s["y"])
        if s["id"] == "sc12":
            star(a, x, y, 17, SILVERINK)
            a.circle(x, y, 27, fill="none", stroke=SILVERINK, stroke_width=1.4, stroke_dasharray="4 5")
        else:
            star(a, x, y, 22 if s["mag"] == 1 else 14, g)
    a.text(600, 1128, "THE SIGIL, UNDONE", size=20, family="serif", fill=g, text_anchor="middle", letter_spacing=6)


OVERLAYS = [("first_light", 5, "light split in two; its brightest star touches all the others"),
            ("gale_harp", 1, "a seven-starred harp no line of which crosses another, wind curling off its frame"),
            ("stag", 0, "a stag whose antlers are five stars climbing to the left"),
            ("moons_tear", 3, "a crescent moon letting one tear fall"),
            ("delvers_lamp", 2, "a miner's lamp on its hook, flame inside"),
            ("eclipse", 4, "one disc sliding over another"),
            ("scholars_lamp", 5, "an oil lamp with a long handle and a trail of smoke"),
            ("sigil", None, "seven lines struck across other figures' stars, ringed like a seal"),
            ("the_scholar", 5, "an empty hood and robe with a lamp held out at arm's length, twelve stars, the last in silver")]


def reg_overlay(key, realm, what):
    title = "The Sigil of Izladar" if key == "sigil" else CONS[key]["name"]

    @asset(G, f"chart-figure-{key.replace('_', '-')}", group="pieces", title=f"Star figure: {title}", w=480, h=480, row=ROW)
    def draw(a: Art):
        g = gold(a)
        lapis(a)
        frame(a, g, m=12)
        if key == "sigil":
            ids = sorted({s for ln in SIGIL_I for s in ln})
            pts = [(STARS[i]["x"], STARS[i]["y"]) for i in ids]
        else:
            pts = [(s["x"], s["y"]) for s in CONS[key]["stars"]]
        allp = pts + [q for c in FIG.get(key, []) for q in c]
        x0, x1 = min(x for x, _ in allp), max(x for x, _ in allp)
        y0, y1 = min(y for _, y in allp), max(y for _, y in allp)
        sc = min(330 / (x1 - x0), 300 / (y1 - y0))
        M = lambda x, y: (240 + (x - (x0 + x1) / 2) * sc, 222 - (y - (y0 + y1) / 2) * sc)
        figure(a, key, M, op=0.75, width=1.6)
        if key == "sigil":
            for s1, s2 in SIGIL_I:
                (xa, ya), (xb, yb) = M(STARS[s1]["x"], STARS[s1]["y"]), M(STARS[s2]["x"], STARS[s2]["y"])
                a.line(xa, ya, xb, yb, stroke=g, stroke_width=8, stroke_linecap="round", opacity=0.8)
                a.line(xa, ya, xb, yb, stroke="#0b0d1a", stroke_width=5, stroke_linecap="round")
                a.line(xa, ya, xb, yb, stroke=kit.VIOLET, stroke_width=1.3, stroke_linecap="round")
            for i in ids:
                x, y = M(STARS[i]["x"], STARS[i]["y"])
                star(a, x, y, 13, SILVERINK)
        else:
            c = CONS[key]
            lines(a, c["lines"], M, g, width=3.4)
            for s in c["stars"]:
                x, y = M(s["x"], s["y"])
                if s["id"] == "sc12":
                    star(a, x, y, 14, SILVERINK)
                else:
                    star(a, x, y, 19 if s["mag"] == 1 else 12, g)
        a.rect(60, 408, 360, 40, fill="#101a45", stroke=g, stroke_width=1.5)
        a.text(240, 436, title.upper(), size=20 if len(title) < 18 else 17, family="serif", fill=g, text_anchor="middle", letter_spacing=3)
        if realm is not None:
            kit.emblem(a, realm, 60, 60, 15, kit.shade(kit.REALMS[realm]["acc"], 0.3), line="#101a45", raised=False)
    draw.__doc__ = f"Figure overlay for the Star Chart, gold leaf on lapis: {title}, {what}."
    return draw


for _k, _r, _w in OVERLAYS:
    reg_overlay(_k, _r, _w)

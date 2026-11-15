"""Reconcile's paper: five states of the survey map sheet and six of the legend strip.
Topographic survey print: brown contours, black road, green-ink official type, Tam's pencil on top."""
import math
import random

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
W, H = 1100, 800
CX, CY, RX, RY = 560, 440, 300, 250
PEAKS = [(330, 300, 170, 1.0), (800, 520, 150, 0.75), (760, 170, 120, 0.5), (150, 650, 150, -0.4),
         (560, 420, 120, -0.25)]


def hgt(x, y):
    v = 0
    for px, py, s, k in PEAKS:
        v += k * math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * s * s))
    return v + 0.05 * math.sin(x / 53) * math.cos(y / 67)


def theta(n):
    """Site n's angle on the loop: 1-12 up the west leg, 13-24 up the east, the entrance at the south."""
    return 106 + (n - 1) * 156 / 11 if n <= 12 else 74 - (n - 13) * 156 / 11


def on_loop(t, k=1.0):
    return CX + RX * k * math.cos(math.radians(t)), CY + RY * k * math.sin(math.radians(t))


def site_xy(n):
    return on_loop(theta(n), 1.12)


FEATURE = {7: "owl box", 9: "pool", 12: "creek bend", 16: "tall cedar", 21: "split boulder", 22: "shared ring"}

# state: (first printed site, title printed, scale segments, Tam's pencil)
SHEETS = [
    ("all", 1, True, 6, "A"), ("from-7", 7, True, 5, "B"), ("from-12", 12, True, 4, "C"),
    ("from-16", 16, False, 3, "D"), ("the-five", 20, False, 2, "E"),
]


def sheet(key, first, titled, scale, note):
    @asset(G, f"map-{key}", group="maps", title=f"Map sheet, printing sites {first} to 24", w=W, h=H,
           row="Map sheets (5) and legend strips (6)")
    def draw(a: Art):
        a.paper("#F4EDD9", grain=0.1, fibre=1.1)
        five = first == 20
        # contours
        for i, lev in enumerate([x / 16 for x in range(-6, 15)]):
            d = kit.contours(hgt, 30, 30, W - 60, H - 60, 10, lev)
            if d:
                idx = i % 4 == 0
                a.path(d, fill="none", stroke="#9B6A3C", stroke_width=1.8 if idx else 0.8,
                       opacity=(0.9 if idx else 0.6) * (0.55 if five else 1), stroke_linejoin="round")
        # the creek along the west leg, to the gravel bar
        creek = [(30, 720), (120, 640), (170, 520), (150, 400), (200, 280), (260, 170), (330, 90), (380, 30)]
        a.path(a.smooth_d(creek), fill="none", stroke="#3D7FA6", stroke_width=3.2, opacity=0.5 if five else 0.9)
        if not five:
            a.stipple(132, 500, 50, 40, n=40, r=(1, 2), fill="#9B6A3C", opacity=0.7)
        # the loop road: double black line with a gravel fill
        t0, t1 = (-96, -12) if five else (0, 360)
        pts = [on_loop(t) for t in range(t0, t1 + 1, 6)]
        d = a.smooth_d(pts[:-1], closed=True) if not five else a.smooth_d(pts)
        a.path(d, fill="none", stroke="#222", stroke_width=10)
        a.path(d, fill="none", stroke="#F4EDD9", stroke_width=6)
        if not five:
            spur = a.smooth_d([(CX - 40, H - 30), (CX - 30, 740), on_loop(90)])
            a.path(spur, fill="none", stroke="#222", stroke_width=10)
            a.path(spur, fill="none", stroke="#F4EDD9", stroke_width=6)
            for t in (40, 150, 215, 330):                      # one-way arrows
                x, y = on_loop(t)
                a.poly([(-7, -4), (7, 0), (-7, 4)], fill="#222", transform=f"translate({f(x)} {f(y)}) rotate({t + 90})")
        # sites
        for n in range(1, 25):
            x, y = site_xy(n)
            lx, ly = on_loop(theta(n), 1.25)
            if n < first:
                # the crease where the old ink was
                a.rect(x - 9.5, y - 9.5, 20, 20, fill="none", stroke="#fffdf4", stroke_width=1.6, opacity=0.8)
                a.rect(x - 10.5, y - 10.5, 20, 20, fill="none", stroke="#b5a988", stroke_width=1, opacity=0.6)
                continue
            a.rect(x - 10, y - 10, 20, 20, fill="#222")
            a.text(lx, ly + 6, str(n), size=17, family="sans-serif", fill="#222", text_anchor="middle",
                   font_weight="bold")
            if n in FEATURE and (n >= 20 or not five):
                fx, fy = on_loop(theta(n), 1.42)
                a.text(fx, fy + 4, FEATURE[n], size=12.5, family="sans-serif", fill=kit.INK, font_style="italic",
                       text_anchor="end" if fx < CX else "start")
        # booth, payphone, register, the highway
        if not five:
            bx, by = CX - 66, 742
            a.rect(bx, by, 26, 20, fill=kit.RED); a.poly([(bx - 4, by), (bx + 13, by - 12), (bx + 30, by)], fill="#222")
            a.text(bx - 8, by + 16, "booth", size=13, family="sans-serif", fill=kit.INK, text_anchor="end", font_style="italic")
            if first <= 12:
                x, y = on_loop(theta(12), 0.86)
                a.rect(x - 5, y - 5, 10, 10, fill="none", stroke="#222", stroke_width=2)
                a.text(x + 10, y + 5, "register", size=12.5, family="sans-serif", fill=kit.INK, font_style="italic")
            a.path(f"M30,{H - 34}H{W - 30}", stroke="#222", stroke_width=3, stroke_dasharray="16 6")
        # fold lines
        for x in (W / 3, 2 * W / 3):
            a.line(x, 0, x, H, stroke="#8a7e62", stroke_width=1.2, opacity=0.35)
            a.rect(x, 0, 10, H, fill=a.gradient([(0, "#8a7e62"), (1, "#F4EDD9")], 0, 0, 1, 0), opacity=0.16)
        a.line(0, H / 2, W, H / 2, stroke="#8a7e62", stroke_width=1.2, opacity=0.35)
        # neat line, title block
        a.rect(30, 30, W - 60, H - 60, fill="none", stroke="#3b3426", stroke_width=2.5)
        a.rect(38, 38, W - 76, H - 76, fill="none", stroke="#3b3426", stroke_width=0.7)
        a.rect(52, 52, 330, 96, fill="#F4EDD9", stroke=kit.INK, stroke_width=1.4)
        if titled:
            kit.printed(a, 68, 96, "HOLLIN CREEK", size=34, letter_spacing="5")
            kit.printed(a, 70, 130, f"CAMPGROUND · SITES {first if first > 1 else 1}–24" if first < 7 else
                        f"CAMPGROUND · SITES {first}–24", size=14, letter_spacing="3", font_weight="normal")
        else:
            kit.groove(a, 68, 96, "HOLLIN CREEK", size=34, family="sans-serif", font_style="normal",
                       font_weight="bold", letter_spacing="5")
            kit.printed(a, 70, 130, "SITES 20–24" if five else f"CAMPGROUND · SITES {first}–24", size=14,
                        letter_spacing="3", font_weight="normal")
        # north arrow and the scale bar, which shortens a step behind the loop
        a.poly([(1010, 70), (1024, 122), (1010, 110), (996, 122)], fill="#222")
        a.text(1010, 146, "N", size=18, family="serif", fill="#222", text_anchor="middle")
        sx, sy = 780, 736
        for k in range(6):
            if k < scale:
                a.rect(sx + k * 40, sy, 40, 8, fill="#222" if k % 2 == 0 else "#F4EDD9", stroke="#222", stroke_width=1)
            else:
                a.rect(sx + k * 40, sy, 40, 8, fill="none", stroke="#b5a988", stroke_width=0.8, opacity=0.7)
        a.text(sx, sy - 8, "0", size=12, family="sans-serif", fill="#222")
        a.text(sx + scale * 40, sy - 8, f"{scale * 50} m", size=12, family="sans-serif", fill="#222", text_anchor="middle")
        # Tam's pencil
        if note == "A":
            kit.pencil(a, [on_loop(t, 1.14 + 0.09 * math.sin(t / 7)) for t in range(96, 148, 4)]
                       + [on_loop(t, 1.36) for t in range(146, 94, -4)], w=2.4, closed=True, smooth=True)
            kit.hand(a, 60, 664, "Marisol says it starts at four.", size=24, rot=-3)
            kit.hand(a, 64, 694, "I counted from one.", size=24, rot=-3)
        elif note == "B":
            x1, y1 = site_xy(13)
            kit.pencil(a, [(CX, CY), (x1 - 70, y1 - 40)], w=3.2, amp=1.5)
            kit.hand(a, CX - 40, CY - 14, "by noon?", size=26)
            x2, y2 = site_xy(17)
            kit.pencil(a, [(CX, CY), (x2 - 60, y2 + 10)], w=3.2, amp=1.5)
            kit.hand(a, CX + 60, CY + 50, "by dark?", size=26)
        elif note == "C":
            x2, y2 = site_xy(17)
            kit.pencil(a, [(x2 - 30, y2 - 26), (x2 + 30, y2 - 26), (x2 + 30, y2 + 26), (x2 - 30, y2 + 26)], w=2.2, closed=True)
            kit.hand(a, x2 - 250, y2 + 8, "bike, onions, a tent", size=20, rot=-2)
            kit.hand(a, x2 - 250, y2 + 32, "pitched crooked", size=20, rot=-2)
            kit.tally(a, 70, 670, 24 - 11, h=30, gap=10)
        elif note == "D":
            # the forecast line will not stay on the map: only its groove
            x1, y1 = site_xy(19)
            a.line(CX, CY, x1 - 60, y1, stroke="#fffdf4", stroke_width=3, opacity=0.8)
            a.line(CX, CY + 1.5, x1 - 60, y1 + 1.5, stroke="#b5a988", stroke_width=1.5, opacity=0.7)
        kit.tooth(a, 0.07)
    draw.__doc__ = (f"The campground's survey map as Reconcile shows it when it prints sites {first} to 24: brown "
                    "contours, the creek, the one-way loop road with black site squares, a scale bar and a north "
                    "arrow. " + ("Every site is printed, and Tam's pencil rings the three that are not on the ground."
                                 if first == 1 else "The squares that have gone leave only creases where the ink was"
                                 + (", the title block is blank and the scale bar has shortened." if not titled
                                    else ", and the scale bar is a segment shorter.")))
    return draw


for _s in SHEETS:
    sheet(*_s)


# ---- legend strips -----------------------------------------------------------------------------------
LW, LH = 1100, 340
STRIPS = [("24", 1, 0), ("21", 4, 1), ("18", 7, 2), ("13", 12, 3), ("5", 20, 4), ("far-side", 20, 5)]


def strip(key, first, step):
    @asset(G, f"legend-{key}", group="maps", title=f"Legend strip, step {step}: entries {first} to 24", w=LW, h=LH,
           row="Map sheets (5) and legend strips (6)")
    def draw(a: Art):
        far = step == 5
        a.paper("#F1F0EA" if far else "#F4EDD9", grain=0.04 if far else 0.1, fibre=1.1)
        ink = kit.OS_GREEN if far else kit.INK
        a.rect(20, 18, LW - 40, LH - 36, fill="none", stroke=ink, stroke_width=2.2)
        a.rect(26, 24, LW - 52, LH - 48, fill="none", stroke=ink, stroke_width=0.6)
        kit.printed(a, 42, 56, "LEGEND", size=22, color=ink, letter_spacing="6")
        if step < 4:
            kit.printed(a, 170, 55, "HOLLIN CREEK", size=13, color=ink, letter_spacing="3", font_weight="normal")
        elif not far:
            kit.groove(a, 170, 55, "HOLLIN CREEK", size=13, family="sans-serif", font_style="normal", letter_spacing="3")
        # key to the symbols, at the right of the heading
        kx = 640
        for sym, word in (("pad", "tent pad"), ("table", "table"), ("ring", "fire ring")):
            symbol(a, sym, kx, 50, ink)
            a.text(kx + 18, 55, word, size=13, family="sans-serif", fill=ink)
            kx += 140
        a.line(42, 68, LW - 42, 68, stroke=ink, stroke_width=0.8)
        entries = list(range(first, 25))
        cols, cw, rh = 6, 172, 44
        for k in range(24):
            col, row = k % cols, k // cols
            x, y = 44 + col * cw, 102 + row * rh
            if k >= len(entries):
                # the box keeps its height: where an entry was, only its pressure
                if not far:
                    a.rect(x + 0.8, y - 17.2, 26, 26, fill="none", stroke="#fffdf4", stroke_width=1.3, opacity=0.8)
                    a.rect(x, y - 18, 26, 26, fill="none", stroke="#b5a988", stroke_width=0.8, opacity=0.5)
                    a.line(x + 36, y - 3, x + 150, y - 3, stroke="#b5a988", stroke_width=0.8, opacity=0.35)
                continue
            n = entries[k]
            a.rect(x, y - 18, 26, 26, fill=ink)
            a.text(x + 13, y + 1, str(n), size=14, family="sans-serif", fill="#F4EDD9", text_anchor="middle", font_weight="bold")
            for j, sym in enumerate(("pad", "table", "ring")):
                symbol(a, sym, x + 44 + j * 22, y - 5, ink)
            if n in FEATURE:
                a.text(x + 36, y + 17, FEATURE[n], size=11.5, family="sans-serif", fill=ink, font_style="italic")
            a.line(x + 106, y - 4, x + 156, y - 4, stroke=ink, stroke_width=0.8, stroke_dasharray="1 4")
        if step in (1, 2):
            kit.hand(a, 700, 300, "Numbering's always started at four?" if step == 1 else "counted: 24 posts on day 1", size=21)
        if step == 3:
            kit.tally(a, 720, 266, 13, h=28, gap=9)
            kit.hand(a, 890, 290, "left", size=22)
        if not far:
            a.line(LW / 2, 0, LW / 2, LH, stroke="#8a7e62", stroke_width=1.2, opacity=0.3)
            kit.tooth(a, 0.07)
    draw.__doc__ = (f"The map's legend strip in green printed ink at erasure step {step}: one entry for each of sites "
                    f"{first} to 24 with its tent pad, table and fire ring symbols. The box keeps its height, so "
                    + ("nothing is missing yet." if step == 0 else "the entries have closed up and a blank band has "
                       "grown at the bottom" + (", on paper that is slightly too clean." if step == 5 else
                                                 ", marked only by the pressure of the lost rows.")))
    return draw


def symbol(a, sym, x, y, ink):
    if sym == "pad":
        a.rect(x - 7, y - 7, 14, 14, fill="none", stroke=ink, stroke_width=1.6)
    elif sym == "table":
        a.rect(x - 8, y - 4, 16, 8, fill=ink)
        a.line(x - 8, y - 7, x + 8, y - 7, stroke=ink, stroke_width=1.4); a.line(x - 8, y + 7, x + 8, y + 7, stroke=ink, stroke_width=1.4)
    else:
        a.circle(x, y, 6.5, fill="none", stroke=ink, stroke_width=2.4, stroke_dasharray="3 1.6")


for _s in STRIPS:
    strip(*_s)

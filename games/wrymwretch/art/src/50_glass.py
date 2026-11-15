"""Concentration: stained-glass card faces. Six ward patients, ten creatures, Ilvarra's twelve memories, a back and one clear pane."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Concentration glass faces (patients, creatures, Ilvarra's memories)"
W, H = 300, 420
LEAD = "#17161a"
JEWEL = {"ruby": "#a01a2a", "blue": "#1f4fa8", "green": "#1d7a4a", "amber": "#d29a1c", "violet": "#5a2a8a", "teal": "#0f6f86",
         "sky": "#7fb0dc", "orange": "#c9601f", "pearl": "#eae4d6", "night": "#16204a", "smoke": "#6d6a78"}
GROUND = [("green", "amber"), ("sky", "pearl"), ("orange", "amber"), ("teal", "blue"), ("violet", "night"), ("night", "amber")]
BEST = {c["id"]: c for c in kit.data("bestiary")["creatures"]}


def L(a, d, fill, w=4, **kw):
    """One piece of glass with its lead came."""
    a.path(d, fill=fill, stroke=LEAD, stroke_width=w, stroke_linejoin="round", stroke_linecap="round", **kw)


def G_(a, d, w=2, op=0.6, col="#3a2a1a"):
    """Grisaille: painted line on the glass."""
    a.path(d, fill="none", stroke=col, stroke_width=w, stroke_linecap="round", opacity=op)


def card(a, ground, banner, cuts=12, light=(0.5, 0.4)):
    """The shared frame: lead surround, a border of small quarries, a field of broken jewel glass, a name pane."""
    r = a.rng
    a.rect(0, 0, W, H, rx=10, fill=LEAD)
    c1, c2 = (JEWEL[k] for k in ground)
    # border quarries
    n, m = 9, 13
    for k in range(n):
        for y in (10, H - 26):
            x = 10 + k * (W - 20) / n
            a.rect(x + 1.5, y + 1.5, (W - 20) / n - 3, 13, fill=kit.shade(JEWEL["ruby"] if k % 2 else JEWEL["amber"], r.uniform(-0.2, 0.15)))
    for k in range(m):
        for x in (10, W - 26):
            y = 26 + k * (H - 52) / m
            a.rect(x + 1.5, y + 1.5, 13, (H - 52) / m - 3, fill=kit.shade(JEWEL["blue"] if k % 2 else JEWEL["amber"], r.uniform(-0.2, 0.15)))
    # field
    x0, y0, x1, y1 = 28, 28, W - 28, H - 70
    for k, pc in enumerate(kit.shatter(r, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], cuts)):
        cx = sum(x for x, _ in pc) / len(pc)
        cy = sum(y for _, y in pc) / len(pc)
        d = math.hypot(cx - W * light[0], cy - H * light[1]) / 220
        L(a, kit.pd(pc), kit.shade(kit.mix(c1, c2, 0.25 if k % 3 else 0.8), 0.28 - d * 0.55 + r.uniform(-0.08, 0.08)), w=3)
    # name pane
    a.rect(28, H - 66, W - 56, 38, fill=JEWEL["pearl"], stroke=LEAD, stroke_width=4)
    if banner:
        a.text(W / 2, H - 40, banner.upper(), size=17 if len(banner) < 17 else 14, family="serif", fill="#2a2018", text_anchor="middle",
               letter_spacing=2 if len(banner) < 17 else 1, font_weight="bold")
    return (x0, y0, x1, y1)


def finish(a):
    """Light through the glass, and the unevenness of it."""
    a.rect(14, 14, W - 28, H - 28, fill=a.radial([(0, "#fff6d8", 0.3), (0.6, "#fff6d8", 0.05), (1, "#000000", 0.28)], 0.5, 0.4, 0.75))
    a.stipple(26, 26, W - 52, H - 96, n=90, r=(0.5, 1.6), fill="#ffffff", opacity=0.25)
    a.path(f"M40,{H - 80} L{W - 60},40", stroke="#ffffff", stroke_width=14, opacity=0.06, fill="none")


# ---- the ward ------------------------------------------------------------------------------------
PATIENTS = [
    dict(skin="#e3c3a0", hair="#c9c9cf", style="long", eyes="closed", age=True, blanket="blue", wing=1, n=0.96),
    dict(skin="#d9a877", hair="#3a2418", style="long", eyes="aside", age=False, blanket="ruby", wing=-1, n=1.0),
    dict(skin="#edd2b4", hair="#b0672a", style="tousle", eyes="wide", age=False, blanket="amber", wing=1, n=0.84),
    dict(skin="#c58f62", hair="#1d1a22", style="bun", eyes="closed", age=False, blanket="teal", wing=-1, n=1.0),
    dict(skin="#8f5e3c", hair="#22201f", style="crop", eyes="open", age=False, blanket="violet", wing=1, n=1.04),
    dict(skin="#e8d3bd", hair="#eeeae0", style="braid", eyes="half", age=True, blanket="green", wing=-1, n=0.94),
]


def elf(a, pt):
    cx, cy, s = 150, 170, pt["n"]
    sk, hr = pt["skin"], pt["hair"]
    wsd = pt["wing"]
    # the drooping wing behind one shoulder
    for k in range(5):
        x = cx + wsd * (52 + k * 13)
        L(a, f"M{x},{cy - 30 + k * 12} q{wsd * 22},{50 + k * 4} {wsd * 4},{150 - k * 8} q{-wsd * 16},{-60} {-wsd * 10},{-150 + k * 8}z",
          kit.shade(JEWEL["pearl"] if k % 2 else JEWEL["sky"], -0.05 * k), w=3)
    # hair behind
    if pt["style"] in ("long", "braid"):
        L(a, f"M{cx - 50 * s},{cy + 10} Q{cx - 62 * s},{cy - 70 * s} {cx},{cy - 74 * s} Q{cx + 62 * s},{cy - 70 * s} {cx + 50 * s},{cy + 10} L{cx + 58 * s},{cy + 110} L{cx - 58 * s},{cy + 110}Z", hr)
    elif pt["style"] == "bun":
        L(a, f"M{cx - 20},{cy - 78} a22,20 0 1,1 40,0z", hr)
        L(a, f"M{cx - 46},{cy + 4} Q{cx - 56},{cy - 66} {cx},{cy - 68} Q{cx + 56},{cy - 66} {cx + 46},{cy + 4}Z", hr)
    elif pt["style"] == "tousle":
        L(a, f"M{cx - 44},{cy} L{cx - 56},{cy - 40} L{cx - 38},{cy - 52} L{cx - 40},{cy - 78} L{cx - 14},{cy - 66} L{cx + 4},{cy - 86} L{cx + 18},{cy - 64} L{cx + 44},{cy - 72} L{cx + 40},{cy - 46} L{cx + 56},{cy - 34} L{cx + 44},{cy}Z", hr)
    else:
        L(a, f"M{cx - 42 * s},{cy - 8} Q{cx - 50 * s},{cy - 64 * s} {cx},{cy - 64 * s} Q{cx + 50 * s},{cy - 64 * s} {cx + 42 * s},{cy - 8}Z", hr)
    # blanket and neck
    L(a, f"M{cx - 16},{cy + 36} L{cx + 16},{cy + 36} L{cx + 20},{cy + 70} L{cx - 20},{cy + 70}Z", kit.shade(sk, -0.12))
    bl = JEWEL[pt["blanket"]]
    L(a, f"M28,{H - 70} L28,{cy + 96} Q{cx - 60},{cy + 50} {cx - 14},{cy + 62} L{cx},{cy + 84} L{cx + 14},{cy + 62} Q{cx + 60},{cy + 50} {W - 28},{cy + 96} L{W - 28},{H - 70}Z", bl)
    L(a, f"M{cx},{cy + 84} L{cx - 30},{H - 70} L{cx + 34},{H - 70}Z", kit.shade(bl, 0.2), w=3)
    G_(a, f"M{cx - 70},{cy + 100} q10,40 0,80 M{cx + 74},{cy + 100} q-12,40 -2,80 M{cx - 100},{cy + 110} q8,30 2,66", 2, 0.5, "#0b0b10")
    # ears, pointed
    for sd in (-1, 1):
        L(a, f"M{cx + sd * 34 * s},{cy - 14} L{cx + sd * 70 * s},{cy - 40} L{cx + sd * 38 * s},{cy + 10}Z", kit.shade(sk, -0.06), w=3)
    # face
    L(a, f"M{cx - 38 * s},{cy - 16} Q{cx - 40 * s},{cy - 58 * s} {cx},{cy - 58 * s} Q{cx + 40 * s},{cy - 58 * s} {cx + 38 * s},{cy - 16} Q{cx + 34 * s},{cy + 30 * s} {cx},{cy + 46 * s} Q{cx - 34 * s},{cy + 30 * s} {cx - 38 * s},{cy - 16}Z", sk)
    if pt["style"] == "braid":
        L(a, f"M{cx - 40},{cy - 26} Q{cx},{cy - 76} {cx + 40},{cy - 26} Q{cx},{cy - 50} {cx - 40},{cy - 26}Z", hr, w=3)
        G_(a, f"M{cx - 26},{cy - 42} l8,-8 M{cx - 10},{cy - 50} l8,-8 M{cx + 8},{cy - 52} l8,8 M{cx + 24},{cy - 44} l6,8", 2, 0.5)
    if pt["style"] == "crop":   # a healer's band
        L(a, f"M{cx - 39},{cy - 30} Q{cx},{cy - 44} {cx + 39},{cy - 30} L{cx + 39},{cy - 20} Q{cx},{cy - 32} {cx - 39},{cy - 20}Z", JEWEL["pearl"], w=3)
    ey = cy - 6
    for sd in (-1, 1):
        ex = cx + sd * 16 * s
        if pt["eyes"] == "closed":
            G_(a, f"M{ex - 9},{ey} q9,7 18,0", 2.6, 0.9, LEAD)
        elif pt["eyes"] == "half":
            G_(a, f"M{ex - 9},{ey} q9,-5 18,0", 2.6, 0.9, LEAD)
            a.circle(ex, ey + 1, 2.4, fill=LEAD)
        else:
            rr = 6.4 if pt["eyes"] == "wide" else 4.4
            a.path(f"M{ex - 10},{ey} q10,{-rr * 1.6} 20,0 q-10,{rr * 1.6} -20,0z", fill="#f6f2e6", stroke=LEAD, stroke_width=2)
            a.circle(ex + (3 if pt["eyes"] == "aside" else 0), ey, rr * 0.55, fill="#23324f")
        G_(a, f"M{ex - 11},{ey - 12} q11,-6 22,-1", 2.2, 0.75, kit.shade(hr, -0.4) if hr != "#eeeae0" else "#8a8578")
    G_(a, f"M{cx},{cy - 2} q-5,16 0,20 q4,1 6,-2", 2, 0.7)
    G_(a, f"M{cx - 9},{cy + 30 * s} q9,{4 if pt['eyes'] != 'wide' else -3} 18,0", 2.4, 0.85, "#5a2018")
    if pt["age"]:
        G_(a, f"M{cx - 28},{cy + 6} q4,10 2,18 M{cx + 28},{cy + 6} q-4,10 -2,18 M{cx - 14},{cy - 34} h28 M{cx - 10},{cy - 40} h20", 1.6, 0.5)
    G_(a, f"M{cx - 31 * s},{cy - 26} q-5,26 6,48", 2, 0.35)


def reg_patient(i, pt):
    @asset(G, f"glass-patient-{i + 1}", group="cards", title=f"Ward patient {kit.ROMAN[i + 1]}", w=W, h=H, row=ROW)
    def draw(a: Art):
        card(a, ("sky", "pearl") if i % 2 == 0 else ("blue", "sky"), f"The ward · {kit.ROMAN[i + 1]}", cuts=10)
        elf(a, pt)
        finish(a)
    draw.__doc__ = ("Concentration card in stained glass: a patient of the sky-city ward, wrapped in a blanket with one wing drooping, "
                    + ["an old elf asleep.", "a dark-haired elf looking away.", "a child, wide awake.", "an elf with bound hair, eyes shut.",
                       "an elf in a healer's band, watching.", "a white-braided elder, half awake."][i])
    return draw


for _i, _p in enumerate(PATIENTS):
    reg_patient(_i, _p)


# ---- the bestiary --------------------------------------------------------------------------------
def c_stag(a):
    sil = "#d6dbe2"
    for sd in (-1, 1):   # antlers
        L(a, f"M{150 + sd * 16},128 Q{150 + sd * 46},96 {150 + sd * 40},50 L{150 + sd * 50},52 Q{150 + sd * 62},100 {150 + sd * 28},136Z", sil, w=3)
        for k, (ty, tl) in enumerate(((104, 34), (82, 30), (62, 24))):
            L(a, f"M{150 + sd * 44},{ty} L{150 + sd * (52 + tl)},{ty - 26 + k * 4} L{150 + sd * 50},{ty + 12}Z", sil, w=3)
    for sd in (-1, 1):
        L(a, f"M{150 + sd * 24},140 L{150 + sd * 66},124 L{150 + sd * 34},164Z", "#b9a27c", w=3)
    L(a, "M118,140 Q150,116 182,140 L172,214 Q150,262 128,214Z", "#c9b48a")
    L(a, "M134,224 Q150,246 166,224 L160,246 Q150,256 140,246Z", "#3a2a22", w=3)
    for sd in (-1, 1):
        a.path(f"M{150 + sd * 22},166 q{sd * -8},-8 {sd * -16},0 q{sd * 8},7 {sd * 16},0z", fill="#1a1a22", stroke=LEAD, stroke_width=2)
    L(a, "M96,350 L112,250 Q150,226 188,250 L204,350Z", "#a8926c")
    G_(a, "M150,150 v60 M128,270 q22,14 44,0")
    for x, y in ((60, 300), (84, 326), (232, 304), (214, 330)):   # prints that glow where the moss is whole
        a.ellipse(x, y, 7, 10, fill="#e9f2c8", stroke=LEAD, stroke_width=2)


def c_fox(a):
    gy = "#9aa0a8"
    L(a, "M190,330 Q262,310 250,236 Q244,214 224,224 Q236,280 176,300Z", gy)
    L(a, "M236,226 Q252,216 250,236 Q246,250 232,246Z", "#f1ede2", w=3)
    L(a, "M104,350 Q96,250 150,236 Q204,250 196,350Z", gy)
    L(a, "M128,350 Q126,290 150,270 Q174,290 172,350Z", "#f1ede2", w=3)
    for sd in (-1, 1):
        L(a, f"M{150 + sd * 18},160 L{150 + sd * 62},92 L{150 + sd * 58},178Z", gy)
        L(a, f"M{150 + sd * 30},156 L{150 + sd * 54},116 L{150 + sd * 52},166Z", "#3b3a44", w=2)
    L(a, "M96,180 Q150,128 204,180 Q190,228 150,262 Q110,228 96,180Z", gy)
    L(a, "M124,210 Q150,196 176,210 Q168,236 150,262 Q132,236 124,210Z", "#f1ede2", w=3)
    a.circle(150, 256, 6, fill=LEAD)
    for sd in (-1, 1):
        a.path(f"M{150 + sd * 34},190 q{sd * -10},-10 {sd * -20},2 q{sd * 10},6 {sd * 20},-2z", fill="#e7c566", stroke=LEAD, stroke_width=2)
        a.circle(150 + sd * 24, 190, 2.6, fill=LEAD)
    # borrowed voices
    for k, (x, y) in enumerate(((60, 110), (236, 96), (70, 60))):
        a.path(f"M{x},{y} q14,-18 30,-4 q10,12 -2,22 q-12,8 -20,-2", fill="none", stroke="#f1ede2", stroke_width=3, stroke_linecap="round", opacity=0.9)


def tube(a, pts, width, col, rings=None, ring_col=None):
    """A lead-lined body along a curve, with segment rings."""
    c = kit.catmull(pts, 8)
    d = a.smooth_d(pts)
    a.path(d, fill="none", stroke=LEAD, stroke_width=width + 8, stroke_linecap="round", stroke_linejoin="round")
    a.path(d, fill="none", stroke=col, stroke_width=width, stroke_linecap="round", stroke_linejoin="round")
    out = []
    for i in range(3, len(c) - 3, rings or 4):
        (x0, y0), (x1, y1) = c[i - 1], c[i + 1]
        ln = math.hypot(x1 - x0, y1 - y0) or 1
        nx, ny = -(y1 - y0) / ln * width / 2, (x1 - x0) / ln * width / 2
        out.append(f"M{f(c[i][0] + nx)},{f(c[i][1] + ny)}L{f(c[i][0] - nx)},{f(c[i][1] - ny)}")
    a.path("".join(out), fill="none", stroke=ring_col or LEAD, stroke_width=2.4, opacity=0.8)
    return c


def c_cloud_serpent(a):
    for cx, cy, s in ((84, 96, 1.0), (226, 150, 0.8), (214, 318, 1.0), (72, 250, 0.8)):
        L(a, f"M{cx - 40 * s},{cy + 14 * s} q{-10 * s},{-26 * s} {18 * s},{-28 * s} q{8 * s},{-22 * s} {32 * s},{-8 * s} q{26 * s},{-6 * s} {26 * s},{18 * s} q{12 * s},{16 * s} {-10 * s},{20 * s}z", "#eef1f4", w=3)
    body = [(60, 336), (110, 300), (190, 316), (236, 268), (196, 222), (110, 220), (70, 176), (104, 128), (172, 120), (204, 92)]
    tube(a, body, 26, "#a9c7e8", rings=3)
    a.path(a.smooth_d(body), fill="none", stroke="#e6f0fa", stroke_width=6, stroke_linecap="round", opacity=0.7, transform="translate(-3,-5)")
    L(a, "M188,104 L210,58 L256,66 L262,96 L226,120Z", "#c9dcf0")
    L(a, "M210,58 L196,36 L226,52Z", "#eef1f4", w=3)
    a.circle(234, 82, 4.5, fill=LEAD)
    G_(a, "M260,84 q14,-4 18,-18 M262,94 q14,8 22,2", 2.6, 0.9, LEAD)


def c_moth(a):
    pale = "#efe9da"
    for sd in (-1, 1):
        L(a, f"M{150 + sd * 8},170 Q{150 + sd * 70},70 {150 + sd * 118},104 Q{150 + sd * 128},170 {150 + sd * 70},206 Q{150 + sd * 30},206 {150 + sd * 8},190Z", pale)
        L(a, f"M{150 + sd * 8},196 Q{150 + sd * 60},214 {150 + sd * 92},262 Q{150 + sd * 70},310 {150 + sd * 30},282 Q{150 + sd * 12},250 {150 + sd * 8},214Z", "#d8d2e6")
        L(a, f"M{150 + sd * 78},140 a16,16 0 1,0 0.1,0z", JEWEL["amber"], w=3)
        a.poly(a.star_pts(150 + sd * 78, 156, 9, 3, n=4), fill="#fff6cf")
        G_(a, f"M{150 + sd * 12},180 Q{150 + sd * 60},130 {150 + sd * 108},118 M{150 + sd * 14},188 Q{150 + sd * 64},176 {150 + sd * 112},160 M{150 + sd * 14},212 Q{150 + sd * 50},240 {150 + sd * 74},276", 1.6, 0.5)
        G_(a, f"M{150 + sd * 4},128 Q{150 + sd * 18},90 {150 + sd * 40},80", 2.4, 0.9, LEAD)
    L(a, "M140,150 Q150,120 160,150 L162,250 Q150,286 138,250Z", "#b9a888")
    G_(a, "M140,180 h20 M140,204 h20 M141,228 h18", 2, 0.6)
    a.stipple(50, 290, 200, 56, n=40, r=(1.5, 3.5), fill="#fff6cf", opacity=0.9)


def c_crawler(a):
    r = a.rng
    for sd in (-1, 1):
        for k in range(5):
            y = 150 + k * 34
            a.path(f"M{150 + sd * 30},{y} L{150 + sd * 76},{y - 26} L{150 + sd * 108},{y + 14}", fill="none", stroke=LEAD, stroke_width=9, stroke_linejoin="miter")
            a.path(f"M{150 + sd * 30},{y} L{150 + sd * 76},{y - 26} L{150 + sd * 108},{y + 14}", fill="none", stroke="#f0c9a0", stroke_width=4, stroke_linejoin="miter")
    cols = ["#f3d9b8", "#e0762e", "#f7ead2", "#c9601f", "#fbf1df", "#e59a5c"]
    seg = [(150, 86, 30), (150, 140, 44), (150, 206, 50), (150, 270, 40), (150, 318, 24)]
    for k, (cx, cy, rr) in enumerate(seg):
        pts = kit.rot(a.ngon(cx, cy, rr, 6, 0), 0.5 if k % 2 else 0, cx, cy)
        for j in range(6):
            L(a, kit.pd([(cx, cy), pts[j], pts[(j + 1) % 6]]), cols[(j + k) % 6], w=2.5)
    for sd in (-1, 1):
        a.circle(150 + sd * 12, 78, 4, fill=LEAD)
        a.path(f"M{150 + sd * 12},60 L{150 + sd * 34},36", stroke=LEAD, stroke_width=4, fill="none")


def c_wurm(a):
    for k in range(6):   # strata it swims through
        y = 60 + k * 54
        G_(a, f"M30,{y} q60,{-16 + k * 4} 120,0 t120,6", 2.4, 0.5, "#1a1208")
    body = [(48, 336), (76, 250), (136, 204), (208, 222), (244, 168), (216, 108), (160, 92)]
    c = tube(a, body, 30, "#e9e2d0", rings=3)
    for i in range(4, len(c) - 6, 3):   # ribs of old bone
        (x0, y0), (x1, y1) = c[i - 1], c[i + 1]
        ln = math.hypot(x1 - x0, y1 - y0) or 1
        nx, ny = -(y1 - y0) / ln, (x1 - x0) / ln
        for sd in (-1, 1):
            bx, by = c[i][0] + sd * nx * 19, c[i][1] + sd * ny * 19
            a.line(bx, by, bx + sd * nx * 16, by + sd * ny * 16, stroke=LEAD, stroke_width=7, stroke_linecap="round")
            a.line(bx, by, bx + sd * nx * 16, by + sd * ny * 16, stroke="#cfc7b2", stroke_width=3, stroke_linecap="round")
    L(a, "M172,70 L122,62 L86,92 L122,124 L172,116Z", "#e9e2d0")
    L(a, "M86,92 L122,100 L122,124Z", "#8a7f68", w=2.5)
    G_(a, "M100,92 l10,-8 M112,96 l6,-10", 2.4, 0.8, LEAD)
    a.circle(142, 84, 7, fill=LEAD)
    a.circle(142, 84, 3, fill=JEWEL["orange"])


def c_moonfish(a):
    sil = "#dfe4ea"
    a.circle(150, 180, 104, fill="#fff6d8", opacity=0.25)
    L(a, "M232,180 L282,128 L270,180 L282,236Z", "#b9c2ce")
    L(a, "M150,84 Q130,56 168,52 Q176,70 172,88Z M150,276 Q134,304 170,308 Q176,290 170,274Z", "#b9c2ce")
    L(a, "M150,84 a96,96 0 1,0 0.1,0z", sil)
    L(a, "M150,100 a80,80 0 1,0 0.1,0 a62,74 0 1,1 -0.1,0z", "#f7f4ea", w=3, transform="rotate(-24 150 180)")
    a.circle(104, 160, 13, fill="#f7f4ea", stroke=LEAD, stroke_width=3)
    a.circle(101, 160, 5.5, fill=LEAD)
    G_(a, "M78,200 q12,10 26,4 M176,120 q30,20 34,60 M170,236 q20,-10 34,-30", 2, 0.5)
    for x, y, rr in ((70, 96, 7), (52, 124, 4.5), (86, 70, 5)):
        a.circle(x, y, rr, fill="none", stroke="#f7f4ea", stroke_width=2.5)


def c_tide_serpent(a):
    dull = "#56636b"
    for k in range(3):
        y = 250 + k * 26
        L(a, f"M28,{y + 20} q30,-30 62,0 t62,0 t62,0 t58,0 V352 H28Z", kit.shade(JEWEL["teal"], -0.1 * k), w=3)
    for cx in (92, 208):   # coils through the water
        L(a, f"M{cx - 44},262 Q{cx - 44},170 {cx},170 Q{cx + 44},170 {cx + 44},262 L{cx + 18},262 Q{cx + 18},200 {cx},200 Q{cx - 18},200 {cx - 18},262Z", dull)
        for k in range(5):
            an = math.radians(200 + k * 35)
            G_(a, f"M{f(cx + 20 * math.cos(an))},{f(232 + 34 * math.sin(an) - 20)} l{f(18 * math.cos(an))},{f(22 * math.sin(an))}", 2, 0.7, "#0b0d12")
    L(a, "M136,262 Q130,120 164,76 Q196,70 200,100 Q176,110 166,262Z", dull)
    L(a, "M164,76 L214,54 L232,84 L200,104 Q184,104 176,92Z", kit.shade(dull, 0.15))
    a.circle(204, 76, 5, fill="#d8d2b0", stroke=LEAD, stroke_width=2)
    L(a, "M150,116 L112,92 L140,150Z M146,170 L108,156 L142,206Z", "#2c3a42", w=3)
    a.rect(28, 250, 244, 100, fill="#0b0d12", opacity=0.18)   # scales gone dull as oil


def c_hound(a):
    blk = "#1c1a24"
    a.ellipse(150, 338, 112, 10, fill="#000", opacity=0.4)
    for x in (112, 222):
        L(a, f"M{x},250 h20 l-2,86 h-18z", "#12111a", w=3)
    L(a, "M70,226 Q38,216 34,172 Q56,198 82,204Z", blk, w=3)
    L(a, "M70,238 Q68,204 110,202 L200,196 Q238,198 240,236 L234,262 Q160,276 82,264Z", blk)
    for x in (84, 196):
        L(a, f"M{x},246 h22 l-2,90 h-20z", blk, w=3)
    L(a, "M198,204 L210,148 L200,108 L226,130 L266,144 L284,166 L250,178 L242,216Z", blk)
    L(a, "M210,148 L200,108 L226,130Z", "#3a3550", w=2.5)
    G_(a, "M238,152 q12,6 26,2 M110,214 q46,10 92,-6", 2, 0.7, "#8a6cc0")
    # no eyes; its breath finds what is hidden
    for k in range(4):
        a.path(f"M{282 - k * 2},{168 + k * 4} q{-20 - k * 8},{30 + k * 6} {-60 - k * 26},{20 + k * 22}", fill="none", stroke="#c9b3ee", stroke_width=3.6 - k * 0.6,
               stroke_linecap="round", opacity=0.95 - k * 0.15)


def c_owl(a):
    wh = "#f3f1ea"
    L(a, "M70,340 Q44,200 96,120 L204,120 Q256,200 230,340Z", wh)
    for sd in (-1, 1):
        L(a, f"M{150 + sd * 52},170 Q{150 + sd * 106},220 {150 + sd * 84},330 Q{150 + sd * 50},300 {150 + sd * 40},220Z", "#dcd8cc")
        L(a, f"M{150 + sd * 16},112 L{150 + sd * 64},74 L{150 + sd * 62},126Z", wh, w=3)
    L(a, "M92,130 Q150,84 208,130 Q212,186 150,206 Q88,186 92,130Z", "#e9e5d8")
    for sd in (-1, 1):
        a.circle(150 + sd * 30, 150, 23, fill=JEWEL["amber"], stroke=LEAD, stroke_width=4)
        a.circle(150 + sd * 30, 150, 10, fill=LEAD)
        a.circle(150 + sd * 27, 146, 3, fill="#fff")
    L(a, "M140,170 L160,170 L150,194Z", "#c98a2a", w=3)
    r = a.rng
    for _ in range(15):   # stars in its feathers
        x, y = r.uniform(86, 214), r.uniform(214, 330)
        a.poly(a.star_pts(x, y, r.uniform(5, 9), 2, n=4), fill=JEWEL["amber"], stroke=LEAD, stroke_width=0.8)
    for sd in (-1, 1):
        L(a, f"M{150 + sd * 22},340 l{sd * -8},16 M{150 + sd * 22},340 l0,18 M{150 + sd * 22},340 l{sd * 8},16", "none", w=4)


CREATURES = [("grove_stag", 0, c_stag), ("whisperfox", 0, c_fox), ("cloud_serpent", 1, c_cloud_serpent), ("star_moth", 1, c_moth),
             ("crystal_crawler", 2, c_crawler), ("fossil_wurm", 2, c_wurm), ("moonfish", 3, c_moonfish), ("tide_serpent", 3, c_tide_serpent),
             ("shadehound", 4, c_hound), ("starborn_owl", 5, c_owl)]


def reg_creature(key, realm, fn):
    c = BEST[key]

    @asset(G, f"glass-{key.replace('_', '-')}", group="cards", title=c["name"], w=W, h=H, row=ROW)
    def draw(a: Art):
        card(a, ("violet", "sky") if key == "shadehound" else GROUND[realm], c["name"], cuts=12)
        fn(a)
        finish(a)
    draw.__doc__ = f"Concentration card in stained glass, lead-lined jewel colours of the {kit.REALMS[realm]['name']}: the {c['name']}. {c['lore']}"
    return draw


for _k, _r, _f in CREATURES:
    reg_creature(_k, _r, _f)


# ---- Ilvarra's memories --------------------------------------------------------------------------
def cendre_lines(sd_short=1):
    """Cendre's head, front on: the lead lines only. One horn is shorter than the other."""
    horn_l = "M112,150 Q84,96 100,44 Q118,92 136,138Z"
    horn_r = "M188,150 Q210,116 204,86 Q190,112 164,138Z"
    skull = "M104,150 Q150,116 196,150 L204,214 Q186,262 172,318 Q150,338 128,318 Q114,262 96,214Z"
    brow = "M108,196 Q130,180 146,200 M192,196 Q170,180 154,200"
    snout = "M132,300 Q150,288 168,300 M150,214 V288"
    frill = "M104,160 L62,150 L84,200 L60,214 L96,236 M196,160 L238,150 L216,200 L240,214 L204,236"
    return horn_l, horn_r, skull, brow, snout, frill


def m_cendre_face(a):
    hl, hr_, skull, brow, snout, frill = cendre_lines()
    em = "#c9521f"
    L(a, frill + " L196,160 L104,160Z", "#7a2a14")
    L(a, hl, "#e9e2d0")
    L(a, hr_, "#e9e2d0")
    L(a, skull, em)
    L(a, "M128,318 Q150,338 172,318 L166,292 Q150,284 134,292Z", kit.shade(em, -0.3), w=3)
    L(a, "M118,224 Q150,206 182,224 L172,286 Q150,276 128,286Z", kit.shade(em, 0.25), w=3)
    for sd in (-1, 1):
        a.path(f"M{150 + sd * 16},214 q{sd * 14},-16 {sd * 34},-6 q{sd * -10},14 {sd * -34},6z", fill=JEWEL["amber"], stroke=LEAD, stroke_width=3)
        a.path(f"M{150 + sd * 32},202 v12", stroke=LEAD, stroke_width=3)
        a.circle(150 + sd * 10, 308, 3, fill=LEAD)
    G_(a, brow + " " + snout, 2.4, 0.8, "#2a0f08")
    G_(a, "M100,56 q8,30 22,60 M196,96 q-8,16 -20,30", 1.8, 0.6)


def m_cendre_name(a):
    L(a, "M40,120 L260,120 L260,250 L40,250Z", JEWEL["pearl"])
    L(a, "M40,120 L24,140 L40,160Z M260,120 L276,140 L260,160Z M40,250 L24,230 L40,210Z M260,250 L276,230 L260,210Z", JEWEL["ruby"], w=3)
    a.text(150, 204, "CENDRE", size=50, family="serif", fill="#2a1410", text_anchor="middle", letter_spacing=3, font_weight="bold", textLength=196, lengthAdjust="spacingAndGlyphs")
    G_(a, "M56,136 H244 M56,234 H244", 2, 0.6, "#7a2a14")
    for x in (70, 150, 230):   # embers above, ash below
        L(a, f"M{x},100 q-16,-26 0,-52 q16,26 0,52z", JEWEL["orange"], w=3)
        L(a, f"M{x},90 q-6,-12 0,-24 q6,12 0,24z", JEWEL["amber"], w=2)
    a.stipple(40, 268, 220, 70, n=60, r=(1.5, 3.5), fill="#d8d2c4", opacity=0.9)


def m_rim(a):
    L(a, "M28,350 L28,206 L96,196 L128,222 L118,350Z", "#8e97a3")
    L(a, "M272,350 L272,176 L212,168 L180,206 L190,350Z", "#6d7684")
    L(a, "M118,350 L128,222 L150,280 L180,206 L190,350Z", "#0b0d1a")
    L(a, "M146,350 L150,280 L156,350Z", kit.VIOLET, w=2)
    a.circle(204, 86, 30, fill=JEWEL["amber"], stroke=LEAD, stroke_width=4)
    a.circle(94, 76, 22, fill="#dfe4ea", stroke=LEAD, stroke_width=4)
    # her fire on the rim, and the tents
    L(a, "M62,196 q-14,-22 0,-44 q14,22 0,44z", JEWEL["orange"], w=3)
    L(a, "M62,190 q-5,-10 0,-20 q5,10 0,20z", JEWEL["amber"], w=2)
    for x in (222, 248):
        L(a, f"M{x - 14},172 L{x},146 L{x + 14},172Z", JEWEL["pearl"], w=3)
    G_(a, "M40,240 q30,10 60,0 M210,220 q30,12 54,2 M36,290 q36,8 70,-2 M204,280 q30,10 60,0", 2, 0.5, LEAD)


def m_rim_sound(a):
    L(a, "M28,350 L28,300 Q150,250 272,300 L272,350Z", "#8e97a3")
    for k in range(6):   # wind over the wound
        y = 80 + k * 32
        a.path(f"M40,{y} q50,-28 100,0 t100,0 q20,10 10,24 q-12,10 -22,-2", fill="none", stroke=LEAD, stroke_width=9, stroke_linecap="round")
        a.path(f"M40,{y} q50,-28 100,0 t100,0 q20,10 10,24 q-12,10 -22,-2", fill="none", stroke=["#eef1f4", "#a9c7e8"][k % 2], stroke_width=4.5, stroke_linecap="round")
    G_(a, "M60,320 q40,-16 80,-10 M170,306 q40,0 80,16", 2, 0.5, LEAD)


def m_bridge(a):
    L(a, "M28,350 L28,228 L80,222 L92,350Z", "#6d7684")
    L(a, "M272,350 L272,212 L226,208 L210,350Z", "#8e97a3")
    for k in range(7):
        x = 86 + k * 20
        y = 226 + 12 * math.sin(k / 6 * math.pi) - k * 2
        L(a, f"M{x},{y - 9} q9,-7 18,0 l1,16 q-10,7 -20,0z", "#e9e2d0", w=3)
        a.path(f"M{x + 9},{y + 12} q-14,40 4,84", fill="none", stroke=LEAD, stroke_width=7, stroke_linecap="round")
        a.path(f"M{x + 9},{y + 12} q-14,40 4,84", fill="none", stroke="#e9e2d0", stroke_width=3, stroke_linecap="round")
    a.circle(150, 96, 40, fill="#dfe4ea", stroke=LEAD, stroke_width=4)
    G_(a, "M130,84 q10,10 4,24 M160,80 q8,6 6,16", 2, 0.4)


def m_bridge_sound(a):
    # the bones hum: ribs ringing, each with its rings
    for k, x in enumerate((70, 118, 166, 214)):
        hgt = 150 + (k % 2) * 40
        a.path(f"M{x},340 q-20,{-hgt * .5} 16,{-hgt}", fill="none", stroke=LEAD, stroke_width=16, stroke_linecap="round")
        a.path(f"M{x},340 q-20,{-hgt * .5} 16,{-hgt}", fill="none", stroke="#e9e2d0", stroke_width=9, stroke_linecap="round")
        for j in range(3):
            a.path(f"M{x + 26 + j * 12},{340 - hgt + 10 - j * 8} q{16 + j * 4},{20 + j * 6} 0,{46 + j * 14}", fill="none", stroke=[JEWEL["amber"], "#f3d27a", "#fff6cf"][j],
                   stroke_width=3.4 - j * 0.6, stroke_linecap="round")
    G_(a, "M30,344 H270", 3, 0.8, LEAD)
    a.poly(a.star_pts(244, 70, 16, 4, n=4), fill="#fff6cf", stroke=LEAD, stroke_width=2)


def m_banner(realm):
    def draw(a):
        acc = kit.REALMS[realm]["acc"]
        a.path("M82,56 V350", stroke=LEAD, stroke_width=12, stroke_linecap="round")
        a.path("M82,56 V350", stroke="#c9b48a", stroke_width=6, stroke_linecap="round")
        L(a, "M82,52 l-10,-16 l10,-12 l10,12z", JEWEL["amber"], w=3)
        ban = "M88,70 Q150,54 210,74 Q236,82 254,70 L250,236 Q226,250 206,240 Q150,222 88,238Z"
        L(a, ban, kit.shade(acc, -0.1))
        L(a, "M88,70 Q150,54 210,74 Q236,82 254,70 L253,100 Q228,112 208,102 Q150,84 88,100Z", kit.shade(acc, 0.3), w=3)
        L(a, "M88,208 Q150,192 206,210 Q226,220 251,206 L250,236 Q226,250 206,240 Q150,222 88,238Z", kit.shade(acc, -0.4), w=3)
        kit.emblem(a, realm, 168, 156, 40, "#f7f1de", line=LEAD, raised=False)
        a.path(kit.EMBLEM[realm], fill="none", stroke=LEAD, stroke_width=0.09, transform="translate(168,156) scale(40)")
        G_(a, "M130,82 q-8,70 4,146 M214,90 q8,60 -2,136", 2, 0.4, LEAD)
        for k in range(3):   # the tails
            x = 100 + k * 54
            L(a, f"M{x},{236 - k * 3} l8,60 l14,-22 l14,24 l6,-62z", kit.shade(acc, -0.25 + 0.2 * (k % 2)), w=3)
    return draw


MEMORIES = [("cendre-face", "Cendre", ("orange", "night"), m_cendre_face, "her dragon's face, ember-coloured, one horn shorter than the other."),
            ("cendre-name", "Her name", ("ruby", "amber"), m_cendre_name, "the name CENDRE lettered on a pearl pane between embers and ash."),
            ("rim", "The Rim", ("night", "violet"), m_rim, "the Rim of Wrymreach: two cliffs, the wound between them, her fire and the tents, sun and moon above."),
            ("rim-sound", "Wind over the wound", ("night", "sky"), m_rim_sound, "the sound of the Rim: bands of wind curling over the chasm."),
            ("bridge", "The bone bridge", ("violet", "night"), m_bridge, "the bridge of vertebrae and ribs across the chasm under the moon."),
            ("bridge-sound", "The bones hum", ("night", "amber"), m_bridge_sound, "the sound of the bridge: wyrm ribs ringing, each with its rings of gold.")]
for _i, _r in enumerate(kit.REALMS):
    MEMORIES.append((f"banner-{_r['key']}", f"{_r['tribe']} banner", GROUND[_i], m_banner(_i),
                     f"one of the Imprisonment's six banners: the {_r['tribe']} tribe's, in its realm's colour with its emblem."))


def reg_memory(key, name, ground, fn, what):
    @asset(G, f"glass-memory-{key}", group="cards", title=f"Ilvarra's memory: {name}", w=W, h=H, row=ROW)
    def draw(a: Art):
        card(a, ground, name, cuts=9)
        fn(a)
        finish(a)
    draw.__doc__ = f"Concentration card in stained glass, one of Ilvarra's memories: {what}"
    return draw


for _m in MEMORIES:
    reg_memory(*_m)


@asset(G, "glass-back", group="cards", title="Concentration card back", w=W, h=H, row=ROW)
def back(a: Art):
    """The back of every Concentration card: quarry glazing in ruby and blue diamonds round a gold boss with a six-pointed star."""
    r = a.rng
    a.rect(0, 0, W, H, rx=10, fill=LEAD)
    cl = a.clip(f'<rect x="14" y="14" width="{W - 28}" height="{H - 28}"/>')
    a.open("g", clip_path=cl)
    s = 46
    for j in range(-1, int(H / s * 2) + 2):
        for k in range(-1, int(W / s) + 2):
            cx = 14 + k * s + (s / 2 if j % 2 else 0)
            cy = 14 + j * s / 2
            col = JEWEL["ruby"] if (j + k) % 3 == 0 else "#183a80"
            a.poly([(cx, cy - s / 2), (cx + s / 2, cy), (cx, cy + s / 2), (cx - s / 2, cy)], fill=kit.shade(col, r.uniform(-0.2, 0.25)), stroke=LEAD, stroke_width=3)
    a.close()
    for rr, col in ((62, JEWEL["pearl"]), (50, JEWEL["amber"])):
        a.circle(W / 2, H / 2, rr, fill=col, stroke=LEAD, stroke_width=5)
    for i in range(6):
        kit.emblem(a, i, W / 2 + 56 * math.cos(math.radians(-90 + i * 60)) * 0, H / 2, 0.01, "none", raised=False)
    a.poly(a.star_pts(W / 2, H / 2, 40, 17, 6), fill="#fff0b0", stroke=LEAD, stroke_width=3)
    a.circle(W / 2, H / 2, 9, fill=JEWEL["ruby"], stroke=LEAD, stroke_width=3)
    for i, realm in enumerate(kit.REALMS):
        an = math.radians(-90 + i * 60)
        a.circle(W / 2 + 56 * math.cos(an), H / 2 + 56 * math.sin(an), 5, fill=realm["acc"], stroke=LEAD, stroke_width=1.5)
    finish(a)


@asset(G, "glass-cendre-blank", group="cards", title="Cendre's pane, blanked", w=W, h=H, row=ROW)
def blank(a: Art):
    """Cendre's face gone to clear glass before the first flip: nothing left in the pane but the lead lines, and in them, one
    horn shorter than the other."""
    a.rect(0, 0, W, H, rx=10, fill=LEAD)
    a.rect(14, 14, W - 28, H - 28, fill="#e9f0ef")
    a.rect(14, 14, W - 28, H - 28, fill=a.gradient([(0, "#ffffff"), (1, "#c3d2d2")], 0, 0, 1, 1), opacity=0.7)
    for k in range(5):
        a.line(40 + k * 60, 14, -60 + k * 60, H - 14, stroke="#ffffff", stroke_width=14, opacity=0.5)
    hl, hr_, skull, brow, snout, frill = cendre_lines()
    for d in (frill, hl, hr_, skull):
        a.path(d, fill="none", stroke="#59676a", stroke_width=3.2, stroke_linejoin="round", opacity=0.85)
    a.path(brow + " " + snout, fill="none", stroke="#8fa0a2", stroke_width=1.6, stroke_dasharray="5 6")
    a.rect(28, H - 66, W - 56, 38, fill="none", stroke="#59676a", stroke_width=3)
    a.rect(14, 14, W - 28, H - 28, fill="none", stroke="#8fa0a2", stroke_width=1.5)
    a.stipple(20, 20, W - 40, H - 40, n=70, r=(0.6, 1.8), fill="#ffffff", opacity=0.8)

"""Title lettering and the eight chapter plates."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK, PAPER, SAIL = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK, kit.PAPER, kit.SAIL)

ADV = {"L": .62, "O": .76, "R": .70, "D": .76, "S": .58, "E": .64, "A": .74, "T": .64, "H": .76, "F": .58}


def word(a: Art, s, x, y, size, pat, ink, skip_o=True):
    """Engraved capitals set letter by letter; returns the centre of each O, which is left for the spiral."""
    holes = []
    for ch in s:
        adv = ADV[ch] * size
        cx = x + adv / 2
        if ch == "O" and skip_o:
            holes.append((cx, y - size * 0.33))
        else:
            kw = dict(size=size, family="serif", text_anchor="middle", font_weight="bold")
            a.text(cx + size * 0.022, y + size * 0.028, ch, fill=ink, opacity=0.28, **kw)
            a.text(cx, y, ch, fill=PAPER, stroke=PAPER, stroke_width=size * 0.05, stroke_linejoin="round", **kw)
            a.text(cx, y, ch, fill=pat, stroke=ink, stroke_width=size * 0.014, stroke_linejoin="round", **kw)
        x += adv
    return holes, x


@asset(G, "title-lettering", group="title", title="The Lord of the Sea: title lettering", w=1600, h=500,
       row="Title lettering, spiral in the O")
def title(a: Art):
    """The title cut as engraved capitals: LORD in ruled hatching, SEA in wave hatching, and the O of LORD a
    clockwise sea-ink spiral, over a horizon that is calm on the left and wild on the right."""
    m = kit.plate(a)
    # the horizon behind the lettering: Order on the left, Wild on the right, dawn from low left
    a.circle(150, 372, 300, fill=a.radial([(0, GOLD, 0.5), (0.5, GOLD, 0.14), (1, GOLD, 0)]))
    kit.calm(a, m + 14, 800, 372, 452, rows=11, sw=(0.5, 1.2))
    kit.sea(a, 800, a.w - m - 14, 372, 452, rows=11, fn=kit.swell(amp=9, wl=170, sharp=0.6), col=GREEN, sw=(0.6, 1.5),
            step=10)
    a.line(m + 14, 372, a.w - m - 14, 372, stroke=INK, stroke_width=1.4)
    for i in range(6):
        kit.buoy(a, 120 + i * 118, 384 + (i % 2) * 22, 0.55 + (i % 2) * 0.25)
    kit.ship(a, "sloop", 1420, 396, 0.42, ang=-9, helm=True)
    for gx, gy in ((1180, 330), (1230, 318), (1500, 335)):
        kit.gull(a, gx, gy, 0.8)
    # lettering
    ruled = kit.pattern(a, INK, gap=4.2, sw=1.5, bg="#40557e")
    waved = kit.pattern(a, GREEN, gap=4.6, sw=1.6, wave=True, bg="#73a99b")
    size = 232
    base = 318
    wl = sum(ADV[c] for c in "LORD") * size
    ws = sum(ADV[c] for c in "SEA") * size
    mid = 190
    x0 = (a.w - (wl + mid + ws)) / 2
    holes, x1 = word(a, "LORD", x0, base, size, ruled, INK)
    word(a, "SEA", x1 + mid, base, size, waved, "#1d4a41")
    kit.smallcaps(a, x0 + 8, 112, "The", size=54, col=INK, anchor="start")
    kit.italic(a, x1 + mid / 2, base - 62, "of the", size=60, col=INK)
    a.path(f"M{f(x1 + 44)},{f(base - 30)} h{f(mid - 88)}", stroke=INK, stroke_width=1.2)
    kit.spiral(a, x1 + mid / 2, base - 8, 1, 12, 2.2, stroke_width=1.6)
    # the spiral in the O
    (ox, oy), = holes
    R = size * 0.335
    pts = kit.spiral_pts(ox, oy, 3, R, 3.25, cw=True, start=120)
    d = a.smooth_d(pts)
    a.path(d, fill="none", stroke=INK, stroke_width=20, stroke_linecap="round", opacity=0.25,
           transform="translate(5,6)")
    a.path(d, fill="none", stroke=PAPER, stroke_width=24, stroke_linecap="round")
    a.path(d, fill="none", stroke="#234f45", stroke_width=17, stroke_linecap="round")
    a.path(d, fill="none", stroke=SEAINK, stroke_width=13, stroke_linecap="round")
    a.path(d, fill="none", stroke=FOAM, stroke_width=1.3, stroke_linecap="round", opacity=0.8, stroke_dasharray="14 5")
    # rule and imprint
    kit.frame(a, m + 10, m + 10, a.w - 2 * m - 20, a.h - 2 * m - 20, sw=1.6, gap=5)
    a.rect(a.w / 2 - 250, a.h - m - 26, 500, 32, fill=PAPER)
    kit.smallcaps(a, a.w / 2, a.h - m - 3, "Everything has a lord", size=17, col=TEA)


# ---- chapter plates --------------------------------------------------------------------------------

CHAPTERS = ["The Shore Between Worlds", "The Princess on the Shore", "The Ordered Sea",
            "What Is Left of the Old Sea", "The Open Chart", "Debts and Halls", "The Lord of Tea", "The Tideline"]
WX, WY, WW, WH = 96, 84, 1408, 560


def sand(a, x, y, w, h, n=900):
    a.stipple(x, y, w, h, n=n, r=(0.5, 1.4), fill=TEA, opacity=0.55,
              density=lambda px, py: 0.25 + 0.75 * (py - y) / h)


def footprints(a, pts, col=INK, lurch=10, s=1.0):
    """A track of bare prints that sways from side to side."""
    for i, ((x1, y1), (x2, y2)) in enumerate(zip(pts, pts[1:])):
        ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
        side = 1 if i % 2 else -1
        nx, ny = -(y2 - y1), (x2 - x1)
        L = math.hypot(nx, ny) or 1
        px, py = x1 + nx / L * side * lurch, y1 + ny / L * side * lurch
        a.ellipse(px, py, 9 * s, 4.2 * s, fill=col, opacity=0.8, transform=f"rotate({f(ang + side * 14)} {f(px)} {f(py)})")
        a.ellipse(px + 11 * s * math.cos(math.radians(ang)), py + 11 * s * math.sin(math.radians(ang)), 3.4 * s, 3 * s,
                  fill=col, opacity=0.8)


def scene_shore(a):
    hz = WY + 300
    kit.sky(a, WX, WX + WW, WY, hz, sun=(WX + 210, hz - 6, 40))
    kit.cloud(a, WX + 560, WY + 170, 300)
    kit.cloud(a, WX + 1010, WY + 120, 220, n=4)
    kit.sea(a, WX, WX + WW, hz, WY + WH, rows=26, fn=kit.swell(amp=13, wl=300, sharp=0.35), sw=(0.5, 1.8))
    a.line(WX, hz, WX + WW, hz, stroke=INK, stroke_width=1.3)
    kit.ship(a, "sloop", WX + 900, hz + 58, 1.25, ang=-3, sails=False)
    kit.ship(a, "skiff", WX + 1060, hz + 92, 0.9, ang=4)
    a.path(f"M{WX + 985},{hz + 62} q30,30 52,26", fill="none", stroke=INK, stroke_width=1)
    # the cabin's lintel and its xylophone of glass
    a.rect(WX, WY, WW, 46, fill=INK)
    a.rect(WX, WY, WW, 46, fill=kit.pattern(a, PAPER, gap=5, sw=0.8, opacity=0.5))
    for i in range(13):
        bx = WX + 70 + i * 104 + a.rng.uniform(-14, 14)
        cord = a.rng.uniform(20, 130)
        kit.bottle(a, bx, WY + 46 + cord, s=a.rng.uniform(0.85, 1.25), ang=a.rng.uniform(-9, 9),
                   glass=a.rng.choice([GREEN, SEAINK, TEA, GOLD, FOAM]), tag=(i == 8), cord=cord + 4)


def scene_princess(a):
    hz = WY + 170
    kit.sky(a, WX, WX + WW, WY, hz, sun=(WX + 150, hz - 4, 30))
    kit.sea(a, WX, WX + WW, hz, WY + 330, rows=12, fn=kit.swell(amp=7, wl=240), sw=(0.5, 1.2))
    a.line(WX, hz, WX + WW, hz, stroke=INK, stroke_width=1.2)
    kit.ship(a, "sloop", WX + 300, hz + 36, 0.7, ang=-2, sails=False)
    shore = [(WX, WY + 330), (WX + 300, WY + 300), (WX + 700, WY + 340), (WX + 1100, WY + 296), (WX + WW, WY + 320)]
    a.path(a.smooth_d(shore) + f" L{WX + WW},{WY + WH} L{WX},{WY + WH}Z", fill=PAPER, stroke=INK, stroke_width=1.6)
    for k in range(1, 4):
        a.path(a.smooth_d([(x, y + k * 11) for x, y in shore]), fill="none", stroke=INK, stroke_width=0.8,
               stroke_dasharray=f"{60 - k * 12} {8 + k * 9}", opacity=0.8)
    sand(a, WX, WY + 330, WW, WH - 330, n=1300)
    track = [(WX + 330 + i * 52, WY + 330 + 150 * math.exp(-i * 0.12) + 26 * math.sin(i * 1.1)) for i in range(11)]
    footprints(a, track, lurch=17, s=1.15)
    neat = [(WX + 1330 - i * 44, WY + 520 - i * 13) for i in range(10)]
    footprints(a, neat, lurch=6, s=0.7)
    cx, cy = WX + 905, WY + 410
    for i in range(14):
        an = i * 0.45
        a.line(cx + 34 * math.cos(an), cy + 20 * math.sin(an), cx + (58 + 14 * (i % 3)) * math.cos(an),
               cy + (34 + 8 * (i % 3)) * math.sin(an), stroke=INK, stroke_width=1.3, stroke_linecap="round")
    for (px, py, rot) in ((cx + 70, cy + 30, 18), (cx - 26, cy + 74, -24), (cx + 150, cy - 4, -8)):
        a.open("g", transform=f"translate({px},{py}) rotate({rot})")
        a.rect(0, 0, 74, 52, fill=LAMP, stroke=INK, stroke_width=1.3)
        for j in range(4):
            kit.script(a, 8, 13 + j * 10, 58, size=0.5)
        a.close()
    kit.wax(a, cx + 132, cy + 72, 9)


def scene_ordered(a):
    hz = WY + 250
    kit.sky(a, WX, WX + WW, WY, hz, gap=6)
    kit.calm(a, WX, WX + WW, hz, WY + WH, rows=30, sw=(0.5, 1.5))
    a.line(WX, hz, WX + WW, hz, stroke=INK, stroke_width=1.4)
    kit.lighthouse(a, WX + 1250, hz, 170, beam=-560)
    a.path(f"M{WX + 1130},{hz} q60,-34 120,-30 q90,2 150,30z", fill=INK)
    for i in range(4):
        kit.ship(a, "merchant", WX + 250 + i * 215, hz + 10, 0.42 + i * 0.03, hatchsails=False)
    for row in range(4):
        t = row / 3
        y = hz + 48 + 250 * t ** 1.4
        n = 9 - row
        for i in range(n + 1):
            kit.buoy(a, WX + 60 + (WW - 120) * i / n + row * 30, y, 0.6 + 0.9 * t, lit=(i + row) % 4 == 0)
    kit.ship(a, "cutter", WX + 1010, hz + 150, 0.75, flip=True)
    kit.ship(a, "sloop", WX + 250, hz + 244, 0.95, helm=True, ang=-1)
    for k in range(1, 4):
        a.ellipse(WX + 395, hz + 262, 22 * k, 5 * k, fill="none", stroke=SEAINK, stroke_width=1.6 - k * 0.3)


def scene_oldsea(a):
    hz = WY + 250
    kit.sky(a, WX, WX + WW, WY, hz, sun=(WX + 170, hz - 10, 36))
    for (cx, cy, cw) in ((WX + 500, WY + 120, 420), (WX + 980, WY + 90, 380), (WX + 1210, WY + 180, 300)):
        kit.cloud(a, cx, cy, cw, n=6)
        a.rect(cx, cy, cw * 0.96, 34, fill=kit.pattern(a, VIOLET, gap=4, sw=1.1, ang=64), opacity=0.8)
    fn = kit.plus(kit.swell(amp=20, wl=330, sharp=0.6), kit.bump(WX + 780, 250, 250, t0=0.62, tw=0.5, lean=0.5))
    a.path(f"M{WX},{hz + 8} H{WX + WW} V{WY + WH} H{WX}Z", fill=GREEN, opacity=0.16)
    kit.sea(a, WX - 20, WX + WW + 20, hz + 8, WY + WH + 24, rows=34, fn=fn, sw=(0.5, 2.1), step=12, shade=0.2)
    crest = [(WX + 600 + i * 24, hz + 8 + (WH - 250) * 0.62 ** 1.5 + fn(WX + 600 + i * 24, 0.62) - 6) for i in range(15)]
    kit.foam(a, crest, n=4)
    kit.ship(a, "sloop", WX + 640, hz + 96, 1.45, ang=-27, helm=True)
    kit.spiral(a, WX + 608, hz - 28, 2, 26, 2.6, stroke_width=2.2)
    for gx, gy, s in ((WX + 930, WY + 220, 1.2), (WX + 990, WY + 250, 0.9), (WX + 330, WY + 200, 1), (WX + 1130, WY + 280, 0.8)):
        kit.gull(a, gx, gy, s)


PORTS = {"home": (0.16, 0.56), "lanes": (0.33, 0.27), "unwritten": (0.28, 0.86), "salt": (0.45, 0.62),
         "strait": (0.56, 0.22), "pearl": (0.63, 0.84), "spice": (0.73, 0.52), "halls": (0.86, 0.26)}
LANES = [("home", "lanes"), ("home", "unwritten"), ("home", "salt"), ("lanes", "strait"), ("unwritten", "salt"),
         ("salt", "pearl"), ("strait", "spice"), ("pearl", "spice"), ("pearl", "halls"), ("spice", "halls"),
         ("lanes", "spice"), ("strait", "halls")]


def island(a, cx, cy, r, n=9, squash=0.6, fill=PAPER, hatch=True, col=INK):
    pts = []
    for i in range(n):
        ang = 2 * math.pi * i / n
        rr = r * a.rng.uniform(0.6, 1.15)
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang) * squash))
    d = a.smooth_d(pts, closed=True)
    for k in (3, 2, 1):
        a.path(d, fill="none", stroke=col, stroke_width=0.7, opacity=0.5,
               transform=f"translate({f(cx)},{f(cy)}) scale({1 + k * 0.09}) translate({f(-cx)},{f(-cy)})")
    a.path(d, fill=fill, stroke=col, stroke_width=1.5)
    if hatch:
        a.path(d, fill=kit.pattern(a, col, gap=4, sw=0.6, ang=-35), opacity=0.35)
    return pts


def scene_chart(a):
    a.rect(WX, WY, WW, WH, fill="#fff", opacity=0.25)
    a.grid(WX, WY, WW, WH, 70.4, stroke=INK, stroke_width=0.4, opacity=0.5)
    P = {k: (WX + u * WW, WY + v * WH) for k, (u, v) in PORTS.items()}
    rx, ry = WX + WW * 0.115, WY + WH * 0.24
    for ang in range(0, 360, 30):
        r = math.radians(ang)
        a.line(rx, ry, rx + 1500 * math.cos(r), ry + 1500 * math.sin(r), stroke=INK, stroke_width=0.4, opacity=0.5)
    a.circle(rx, ry, 100, fill=PAPER)
    kit.rose(a, rx, ry, 92, labels=False)
    for (p, q) in LANES:
        (x1, y1), (x2, y2) = P[p], P[q]
        a.line(x1, y1, x2, y2, stroke=RED, stroke_width=1.6, stroke_dasharray="9 6")
    names = dict(kit.REGIONS)
    for k, (x, y) in P.items():
        if k != "unwritten":
            island(a, x + 26, y - 30, 58 if k != "halls" else 46)
        else:
            kit.sea(a, x - 150, x + 150, y - 60, y + 30, rows=7, fn=kit.swell(amp=8, wl=120, sharp=0.5), col=GREEN,
                    step=10, persp=1)
        a.circle(x, y, 8, fill=PAPER, stroke=INK, stroke_width=2)
        a.circle(x, y, 3, fill=RED if k not in ("home", "unwritten") else SEAINK)
        kit.italic(a, x, y + 30, names[k], size=22)
    kit.sea(a, WX + WW - 250, WX + WW, WY + WH - 150, WY + WH, rows=9, fn=kit.swell(amp=8, wl=130, sharp=0.5), col=GREEN,
            step=10, persp=1)
    a.rect(WX + 30, WY + WH - 44, 300, 10, fill=PAPER, stroke=INK, stroke_width=1)
    for i in range(0, 6, 2):
        a.rect(WX + 30 + i * 50, WY + WH - 44, 50, 10, fill=INK)


def palace(a, x, y, w, col=INK):
    """The king's halls: arcades, a dome, a sea-gate."""
    a.rect(x - w / 2, y - w * 0.2, w, w * 0.2, fill=SAIL, stroke=col, stroke_width=1.5)
    n = 11
    for i in range(n):
        ax = x - w / 2 + (i + 0.5) * w / n
        a.path(f"M{f(ax - w / n * 0.3)},{f(y)} v{f(-w * 0.09)} a{f(w / n * 0.3)},{f(w / n * 0.34)} 0 0,1 {f(w / n * 0.6)},0 v{f(w * 0.09)}z",
               fill=col if i != n // 2 else PAPER, stroke=col, stroke_width=1)
    a.rect(x - w * 0.3, y - w * 0.34, w * 0.6, w * 0.14, fill=SAIL, stroke=col, stroke_width=1.5)
    a.path("".join(f"M{f(x - w * 0.3 + (i + 0.5) * w * 0.6 / 8 - 4)},{f(y - w * 0.23)}v{f(-w * 0.07)}h8v{f(w * 0.07)}z" for i in range(8)),
           fill=col)
    a.path(f"M{f(x - w * 0.12)},{f(y - w * 0.34)} a{f(w * 0.12)},{f(w * 0.13)} 0 0,1 {f(w * 0.24)},0z", fill=SAIL, stroke=col,
           stroke_width=1.5)
    a.path(f"M{f(x - w * 0.12)},{f(y - w * 0.34)} a{f(w * 0.12)},{f(w * 0.13)} 0 0,1 {f(w * 0.24)},0z",
           fill=kit.pattern(a, col, gap=3.5, sw=0.7, ang=90), opacity=0.6)
    a.line(x, y - w * 0.47, x, y - w * 0.58, stroke=col, stroke_width=1.6)
    a.path(f"M{f(x)},{f(y - w * 0.58)} l30,5 l-30,7z", fill=RED)
    for sx in (-1, 1):
        tx = x + sx * w * 0.44
        a.rect(tx - w * 0.04, y - w * 0.38, w * 0.08, w * 0.38, fill=SAIL, stroke=col, stroke_width=1.5)
        a.path(f"M{f(tx - w * 0.05)},{f(y - w * 0.38)} L{f(tx)},{f(y - w * 0.48)} L{f(tx + w * 0.05)},{f(y - w * 0.38)}Z", fill=col)
        a.rect(tx - 3, y - w * 0.3, 6, 12, fill=col)


def scene_halls(a):
    hz = WY + 280
    kit.sky(a, WX, WX + WW, WY, hz, gap=6)
    kit.cloud(a, WX + 150, WY + 110, 300)
    kit.calm(a, WX, WX + WW, hz, WY + WH, rows=26)
    a.path(f"M{WX + 330},{hz} q90,-60 300,-64 q260,-4 420,64z", fill=PAPER, stroke=INK, stroke_width=1.5)
    a.path(f"M{WX + 330},{hz} q90,-60 300,-64 q260,-4 420,64z", fill=kit.pattern(a, INK, gap=4, sw=0.7, ang=-30),
           opacity=0.4)
    palace(a, WX + 700, hz - 58, 440)
    a.line(WX, hz, WX + WW, hz, stroke=INK, stroke_width=1.3)
    for i, bx in enumerate((150, 430, 720, 1010, 1280)):
        kit.ship(a, "cutter", WX + bx, hz + 110 + (i % 2) * 34, 0.62 + (i % 2) * 0.08, flip=i > 2)
    a.path(kit.chain_d([(WX + 220 + i * 60, hz + 142 + 14 * math.sin(i * 0.9)) for i in range(18)], link=9), fill="none",
           stroke=INK, stroke_width=1.1)
    kit.ship(a, "sloop", WX + 180, hz + 246, 0.85, helm=True, ang=-2)
    a.rect(WX + 150, hz + 258, 26, 16, fill=GOLD, stroke=INK, stroke_width=1.2)
    kit.wax(a, WX + 1280, WY + 120, 44, emblem=lambda cx, cy, r: kit.company_mark(a, cx, cy, r), ribbon=INK)


def scene_teahouse(a):
    hz = WY + 330
    kit.sky(a, WX, WX + WW, WY, hz, gap=6)
    kit.calm(a, WX + 480, WX + WW, hz, WY + WH, rows=22)
    kit.sea(a, WX - 20, WX + 520, hz, WY + WH + 20, rows=24, fn=kit.plus(kit.swell(amp=22, wl=260, sharp=0.7),
            kit.bump(WX + 160, 180, 120, t0=0.5)), col=VIOLET, sw=(0.6, 2), step=10)
    for (cx, cy, cw) in ((WX + 10, WY + 90, 420), (WX + 200, WY + 190, 340)):
        kit.cloud(a, cx, cy, cw, n=6)
        a.rect(cx, cy, cw * 0.96, 40, fill=kit.pattern(a, VIOLET, gap=4, sw=1.1, ang=64), opacity=0.85)
    a.line(WX, hz, WX + WW, hz, stroke=INK, stroke_width=1.3)
    # the counting-house, afloat on its pilings, lit from above
    bx, bw, top = WX + 640, 620, WY + 96
    a.path(f"M{bx + bw / 2},{top - 70} L{bx - 130},{hz + 40} L{bx + bw + 130},{hz + 40}Z",
           fill=a.gradient([(0, LAMP), (1, PAPER)]), opacity=0.8)
    a.rect(bx, top + 40, bw, hz - top - 60, fill=SAIL, stroke=INK, stroke_width=2)
    a.rect(bx, top + 40, bw, hz - top - 60, fill=kit.pattern(a, INK, gap=5, sw=0.7), opacity=0.5)
    a.path(f"M{bx - 24},{top + 40} L{bx + 40},{top} H{bx + bw - 40} L{bx + bw + 24},{top + 40}Z", fill=INK)
    for r in range(3):
        for c in range(9):
            wx, wy = bx + 30 + c * 64, top + 62 + r * 62
            a.rect(wx, wy, 34, 42, fill=GOLD if (r * 9 + c) % 5 else LAMP, stroke=INK, stroke_width=1.4)
            a.path(f"M{wx + 17},{wy}v42M{wx},{wy + 21}h34", stroke=INK, stroke_width=0.8)
    a.rect(bx - 30, hz - 20, bw + 60, 16, fill=INK)
    for i in range(12):
        px = bx - 10 + i * (bw + 20) / 11
        a.rect(px - 5, hz - 4, 10, 120, fill=INK)
        a.path(f"M{px - 14},{hz + 116}h28", stroke=INK, stroke_width=1)
    a.line(bx + bw / 2, top, bx + bw / 2, top - 62, stroke=INK, stroke_width=2)
    a.circle(bx + bw / 2, top - 70, 13, fill=LAMP, stroke=INK, stroke_width=1.6)
    for k in range(1, 4):
        a.circle(bx + bw / 2, top - 70, 13 + k * 12, fill="none", stroke=INK, stroke_width=0.6, stroke_dasharray="3 5")
    a.path(kit.chain_d([(bx - 30, hz - 10), (bx - 130, hz + 80), (bx - 250, hz + 190)], link=10), fill="none", stroke=INK,
           stroke_width=1.2)
    kit.ship(a, "sloop", WX + 250, hz + 150, 0.9, ang=-16, helm=True)


def scene_tideline(a):
    hz = WY + 220
    mid = WX + WW / 2
    kit.sky(a, WX, WX + WW, WY, hz, sun=(WX + 180, hz - 8, 42))
    kit.calm(a, WX, mid, hz, WY + 380, rows=13)
    kit.sea(a, mid, WX + WW, hz, WY + 380, rows=13, fn=kit.swell(amp=13, wl=210, sharp=0.6), col=GREEN, step=10)
    a.line(WX, hz, WX + WW, hz, stroke=INK, stroke_width=1.3)
    shore = [(WX, WY + 372), (WX + 350, WY + 392), (mid, WY + 366), (WX + 1050, WY + 394), (WX + WW, WY + 370)]
    a.path(a.smooth_d(shore) + f" L{WX + WW},{WY + WH} L{WX},{WY + WH}Z", fill=PAPER, stroke=INK, stroke_width=1.5)
    for k in range(1, 4):
        a.path(a.smooth_d([(x, y + k * 12) for x, y in shore]), fill="none", stroke=INK, stroke_width=0.8,
               stroke_dasharray=f"{70 - k * 14} {8 + k * 9}", opacity=0.8)
    sand(a, WX, WY + 380, WW, WH - 380, n=1100)
    footprints(a, [(mid - 330 + i * 48, WY + WH - 20 - i * 9 + 16 * math.sin(i * 1.3)) for i in range(6)], lurch=15, s=1.3)
    # the stone
    sx, sy = mid, WY + 400
    a.open("g", transform=f"translate({sx},{sy + 40}) scale(1.75) translate({-sx},{-sy})")
    a.ellipse(sx + 46, sy + 4, 96, 13, fill=INK, opacity=0.25)
    stone = [(sx - 52, sy), (sx - 46, sy - 120), (sx - 20, sy - 176), (sx + 26, sy - 170), (sx + 50, sy - 104), (sx + 56, sy)]
    a.path(a.wobble_d(stone, 3, 30, closed=True), fill=PAPER, stroke=INK, stroke_width=2.2, stroke_linejoin="round")
    a.path(a.wobble_d(stone, 3, 30, closed=True), fill=kit.pattern(a, INK, gap=4, sw=0.8, ang=-58), opacity=0.5)
    a.path(pd_half(sx, sy), fill=PAPER, opacity=0.85)
    kit.spiral(a, sx - 8, sy - 92, 2, 28, 3, stroke_width=3)
    for k in range(1, 4):
        a.ellipse(sx, sy + 6, 60 + k * 26, 6 + k * 3, fill="none", stroke=SEAINK, stroke_width=1.6 - 0.3 * k)
    a.close()


def pd_half(sx, sy):
    return f"M{sx - 50},{sy} L{sx - 44},{sy - 120} L{sx - 20},{sy - 172} L{sx - 4},{sy - 172} L{sx - 6},{sy}Z"


SCENES = [scene_shore, scene_princess, scene_ordered, scene_oldsea, scene_chart, scene_halls, scene_teahouse,
          scene_tideline]


def make_chapter(i):
    @asset(G, f"chapter-{i + 1:02d}", group="chapters", title=f"Chapter plate {kit.ROMAN[i]}: {CHAPTERS[i]}", w=1600,
           h=900, row="Chapter plates I–VIII")
    def chapter(a: Art):
        a.desc = (f"Chapter plate {kit.ROMAN[i]}, {CHAPTERS[i]}: an engraved view inside a plate mark, with the numeral "
                  f"and the chapter's title cut below it.")
        m = kit.plate(a)
        clip = a.clip(f'<rect x="{WX}" y="{WY}" width="{WW}" height="{WH}"/>')
        a.open("g", clip_path=clip)
        SCENES[i](a)
        a.close()
        kit.frame(a, WX, WY, WW, WH, sw=2.2, gap=-7)
        y = WY + WH + 62
        kit.smallcaps(a, a.w / 2, y, f"Chapter {kit.ROMAN[i]}", size=26, col=RED)
        a.text(a.w / 2, y + 66, CHAPTERS[i], size=58, family="serif", fill=INK, text_anchor="middle", font_style="italic")
        for sgn in (-1, 1):
            a.line(a.w / 2 + sgn * 130, y - 9, a.w / 2 + sgn * 560, y - 9, stroke=INK, stroke_width=1)
            kit.spiral(a, a.w / 2 + sgn * 590, y - 9, 1, 13, 2.3, cw=sgn < 0, stroke_width=1.6)
    chapter.__doc__ = f"Chapter plate {kit.ROMAN[i]}, {CHAPTERS[i]}: an engraved view with its numeral and title."
    return chapter


for _i in range(8):
    make_chapter(_i)

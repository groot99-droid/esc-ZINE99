"""The Deep: four depth bands, the eight hulls of the Standing Fleet and twelve glowing specimens."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK, LINE, ABYSS, DEEP1 = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK, kit.LINE, kit.ABYSS,
    kit.DEEP1)
ROW = "The Deep: 4 depth bands, 8 Standing Fleet hulls, 12 glowing specimens"
MINT, LILAC, AMBER = "#7FD6BD", "#A99BE0", "#F0C36A"


def gauge(a, d0, d1, x=58, col=LINE):
    """The depth gauge in the left margin."""
    a.line(x, 60, x, a.h - 60, stroke=col, stroke_width=1.2, opacity=0.8)
    n = 10
    for i in range(n + 1):
        y = 60 + (a.h - 120) * i / n
        a.line(x - (12 if i % 5 == 0 else 6), y, x, y, stroke=col, stroke_width=1, opacity=0.8)
        if i % 5 == 0:
            a.text(x - 18, y + 5, f"{int(d0 + (d1 - d0) * i / n)}", size=15, family="serif", fill=col, text_anchor="end",
                   font_style="italic", opacity=0.9)
    a.text(x - 30, 40, "m", size=14, family="serif", fill=col, font_style="italic", opacity=0.8)


def weed(a, x, y, h, col=LINE, n=3, sw=1.2, op=0.7):
    for j in range(n):
        pts = [(x + j * 9 + 10 * math.sin(i * 0.9 + j) * (i / 8), y - h * (i / 8) * (1 - j * 0.15)) for i in range(9)]
        a.path(a.smooth_d(pts), fill="none", stroke=col, stroke_width=sw, opacity=op, stroke_linecap="round")


def floor(a, y, col=LINE, op=0.6, ruled=False):
    pts = [(i * 80, y + 10 * math.sin(i * 0.8) + 5 * math.sin(i * 2.1)) for i in range(int(a.w / 80) + 2)]
    a.path(a.smooth_d(pts) + f" L{a.w},{a.h} L0,{a.h}Z", fill=ABYSS, stroke=col, stroke_width=1.4, opacity=1)
    if ruled:
        for k in range(1, 9):
            a.line(0, y + 14 + k * k * 1.6 + k * 6, a.w, y + 14 + k * k * 1.6 + k * 6, stroke=col, stroke_width=0.6, opacity=op * 0.6)
    else:
        for k in range(1, 6):
            a.path(a.smooth_d([(x, yy + k * 13) for x, yy in pts]), fill="none", stroke=col, stroke_width=0.6, opacity=op * 0.6,
                   stroke_dasharray=f"{40 + k * 12} {10 + k * 5}")
    a.stipple(0, y, a.w, a.h - y, n=int(a.w * 0.12), r=(0.5, 1.4), fill=col, opacity=op * 0.7)


BANDS = [
    ("0-20", "0 to 20 metres: bright", 0, 20, "#4b8fb0", "#17466d", 30, 0.55,
     "the bright band under the surface: light shafts, the underside of the waves, pilings and weed, a line engraving in white on blue"),
    ("20-60", "20 to 60 metres: blue", 20, 60, "#1c4f78", "#0d2743", 20, 0.38,
     "the blue band: the last of the shafts, Ide's pearl bank as a ledge of shells, a dredge chain swinging through"),
    ("60-150", "60 to 150 metres: dark", 60, 150, "#0e2742", "#070f1e", 11, 0.24,
     "the dark band: sparse white line, the trench wall, an abandoned net and the ribs of a hull"),
    ("150-below", "below 150 metres: only what glows", 150, 240, "#070f1e", "#04070d", 4, 0.12,
     "the band below 150 metres: almost no line at all, only glowing specimens and the sand of the floor"),
]


def make_band(i, key, name, d0, d1, c0, c1, rows, op, what):
    @asset(G, f"deep-band-{i + 1}", group="backdrops", title=f"The Deep, {name}", w=1600, h=900, row=ROW)
    def band(a: Art):
        a.paper(c1, grain=0.28)
        a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, c0), (1, c1)]))
        r = a.rng
        if i < 2:
            for k in range(7):
                x = 180 + k * 210 + r.uniform(-40, 40)
                w = r.uniform(40, 110)
                a.path(f"M{f(x)},0 l{f(-260)},{a.h} h{f(w * 1.8)} l{f(260 - w * 0.8)},{-a.h}z", fill=FOAM,
                       opacity=(0.1 if i == 0 else 0.045))
        kit.sea(a, 0, a.w, 80 if i else 150, a.h - 40, rows=rows, fn=kit.swell(amp=10 + i * 3, wl=520 - i * 60, drift=40),
                col=LINE, sw=(0.5, 1.0), step=20, shade=0, persp=1, opacity=op)
        if i == 0:
            # the surface, from below
            fn = kit.swell(amp=16, wl=260, sharp=0.6)
            pts = [(x, 70 + fn(x, 1)) for x in range(0, a.w + 20, 16)]
            a.path(kit.pd(pts) + f" L{a.w},0 L0,0Z", fill=FOAM, opacity=0.35)
            a.path(kit.pd(pts), fill="none", stroke=FOAM, stroke_width=2.2)
            for k in range(3):
                a.path(kit.pd([(x, y + 12 + k * 13) for x, y in pts]), fill="none", stroke=FOAM, stroke_width=1, opacity=0.5 - k * 0.12,
                       stroke_dasharray=f"{50 - k * 10} {12 + k * 8}")
            for px in (1180, 1300, 1420):
                a.rect(px - 16, 40, 32, a.h, fill=DEEP1, stroke=LINE, stroke_width=1.3)
                a.rect(px - 16, 40, 32, a.h, fill=kit.pattern(a, LINE, gap=6, sw=0.6, ang=90), opacity=0.5)
                for k in range(9):
                    a.circle(px - 16 + r.uniform(0, 32), r.uniform(100, 860), r.uniform(3, 7), fill="none", stroke=LINE, stroke_width=0.8)
                weed(a, px - 22, 520 + r.uniform(0, 200), 150, n=2)
            a.path(kit.chain_d([(1200, 240), (1260, 330), (1300, 300), (1400, 420), (1420, 380)], link=14), fill="none", stroke=LINE,
                   stroke_width=1.2, opacity=0.9)
            for k in range(26):
                a.circle(r.uniform(120, 1560), r.uniform(120, 860), r.uniform(1.5, 5), fill="none", stroke=FOAM, stroke_width=0.9, opacity=0.7)
        if i == 1:
            ledge = [(0, 640), (200, 610), (420, 650), (640, 700), (760, 780), (800, 900)]
            a.path(a.smooth_d(ledge) + " L0,900Z", fill="#0a1d33", stroke=LINE, stroke_width=1.5)
            a.path(a.smooth_d(ledge) + " L0,900Z", fill=kit.pattern(a, LINE, gap=7, sw=0.6, ang=24), opacity=0.35)
            for k in range(16):
                sx, sy = 40 + k * 40, 640 + 30 * math.sin(k * 0.7) + (k > 9) * (k - 9) * 14
                a.path(f"M{f(sx - 12)},{f(sy)} a12,9 0 0,1 24,0z M{f(sx - 9)},{f(sy)} l9,-8 l9,8 M{f(sx)},{f(sy)} v-9", fill="none", stroke=LINE,
                       stroke_width=1, opacity=0.9)
                if k % 5 == 2:
                    a.circle(sx, sy - 14, 3.2, fill=FOAM)
                    a.circle(sx, sy - 14, 12, fill=a.radial([(0, FOAM, 0.6), (1, FOAM, 0)]))
            for wx in (120, 330, 520):
                weed(a, wx, 640, 170, n=3)
            a.path(kit.chain_d([(1120, -10), (1130, 200), (1180, 420), (1290, 610), (1440, 720)], link=18), fill="none", stroke=LINE,
                   stroke_width=1.4, opacity=0.95)
            a.path("M1440,720 l40,10 l-6,40 l-46,-8z M1474,770 q-30,40 -70,30", fill="none", stroke=LINE, stroke_width=1.6)
            a.line(900, 900, 960, 300, stroke=LINE, stroke_width=2.2, opacity=0.8)
            a.line(900, 520, 1010, 500, stroke=LINE, stroke_width=1.6, opacity=0.8)
            for k in range(5):
                a.line(960 - k * 8, 300 + k * 80, 1010 - k * 30, 500 + k * 80, stroke=LINE, stroke_width=0.6, opacity=0.5)
        if i == 2:
            wall = [(1600, 0), (1380, 120), (1440, 300), (1300, 470), (1360, 660), (1240, 900)]
            a.path(a.smooth_d(wall) + " L1600,900Z", fill="#050b16", stroke=LINE, stroke_width=1.4, opacity=0.9)
            a.path(a.smooth_d(wall) + " L1600,900Z", fill=kit.pattern(a, LINE, gap=9, sw=0.6, ang=70), opacity=0.25)
            # an abandoned net
            for k in range(11):
                a.path(a.smooth_d([(300 + k * 34 + 30 * math.sin(j * 0.6 + k * 0.3), 80 + j * 62) for j in range(9)]), fill="none",
                       stroke=LINE, stroke_width=0.8, opacity=0.6)
            for j in range(9):
                a.path(a.smooth_d([(300 + k * 34 + 30 * math.sin(j * 0.6 + k * 0.3), 80 + j * 62 + 10 * math.sin(k)) for k in range(11)]),
                       fill="none", stroke=LINE, stroke_width=0.8, opacity=0.6)
            for k in range(6):
                a.circle(300 + k * 68, 70, 7, fill=DEEP1, stroke=LINE, stroke_width=1.2)
            # ribs of a hull
            a.path("M720,860 q200,-60 480,-10", fill="none", stroke=LINE, stroke_width=2.2)
            for k in range(11):
                x = 760 + k * 40
                a.path(f"M{x},{850 - 26 * math.sin(k * 0.3)} q-30,-90 14,-{150 + 30 * math.sin(k * 0.9)}", fill="none", stroke=LINE,
                       stroke_width=1.5, opacity=0.9)
            kit.radiolarian(a, 1090, 300, 16, MINT, n=8)
            kit.radiolarian(a, 220, 720, 12, LILAC, n=6, kind=1)
        if i == 3:
            floor(a, 760, op=0.35)
            for k in range(22):
                col = r.choice([MINT, LILAC, AMBER, FOAM])
                x, y, rr = r.uniform(120, 1540), r.uniform(60, 720), r.uniform(5, 15)
                if k % 3 == 0:
                    kit.radiolarian(a, x, y, rr, col, n=r.choice([6, 8, 10]), kind=k % 2)
                else:
                    a.circle(x, y, rr * 2.4, fill=a.radial([(0, col, 0.55), (1, col, 0)]))
                    a.circle(x, y, rr * 0.3, fill=col)
            # the stirred current is the other light
            pts = [(260 + k * 90, 560 + 70 * math.sin(k * 0.7)) for k in range(9)]
            a.path(a.smooth_d(pts), fill="none", stroke=SEAINK, stroke_width=26, opacity=0.25, stroke_linecap="round")
            a.path(a.smooth_d(pts), fill="none", stroke=MINT, stroke_width=2, stroke_linecap="round", opacity=0.9)
            for k in range(8):
                x = 200 + k * 180
                a.path(f"M{x},760 v-{90 + (k % 3) * 60}", stroke=LINE, stroke_width=1, opacity=0.14)
        kit.snow(a, 0, 0, a.w, a.h, n=[420, 320, 240, 150][i], opacity=0.45)
        a.vignette(0.5 + i * 0.1, color="#02040a")
        gauge(a, d0, d1)
        kit.italic(a, a.w - 40, a.h - 28, f"Plate {kit.ROMAN[i]}. The Deep, {name}.", size=17, col=LINE, anchor="end", opacity=0.85)
    band.__doc__ = f"The Deep's backdrop for {what}, with the depth gauge in the left margin."
    return band


for _i, _b in enumerate(BANDS):
    make_band(_i, *_b)


# ---- the Standing Fleet ------------------------------------------------------------------------------
HULLS = [("merchant", 1.25, False, "a three-masted merchantman, the flagship, whose ballast is the compact stone"),
         ("brig", 1.5, True, "a two-masted brig with a high stern"),
         ("cutter", 1.45, False, "an old revenue cutter, her gunports open and empty"),
         ("ketch", 1.9, True, "a ketch, mainmast gone at the hounds"),
         ("lugger", 2.3, False, "a fishing lugger, nets still on her yards"),
         ("galley", 1.45, True, "a royal galley, her oars shipped"),
         ("pinnace", 2.1, False, "a pinnace with two short masts"),
         ("packet", 1.6, True, "a packet schooner, booms swung out")]


def make_hull(i, kind, s, flip, what):
    @asset(G, f"fleet-hull-{i + 1}", group="backdrops", title=f"Standing Fleet hull {i + 1}: {kind}", w=520, h=680, row=ROW)
    def hull(a: Art):
        a.paper(ABYSS, grain=0.3)
        a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, "#03050a"), (0.7, "#0a1626"), (1, "#0d1d30")]))
        r = a.rng
        fy = 560
        # the lane behind: the next hulls in their row
        for k, (dx, sc) in enumerate(((-150, 0.45), (170, 0.5))):
            a.open("g", opacity=0.22)
            kit.ship(a, HULLS[(i + 3 + k * 2) % 8][0], a.w / 2 + dx, fy - 36, s * sc, sails=False, ink=LINE, fill=ABYSS, lw=1.6)
            a.close()
        floor(a, fy, ruled=True, op=0.55)
        D = kit.SHIPS[kind]["D"]
        kit.ship(a, kind, a.w / 2, fy - D * s + 6, s, flip=flip, sails=False, ink=LINE, fill="#0c1a2c", bell=True, lw=1 / s * 1.5,
                 ang=r.uniform(-2.5, 2.5))
        # growth, and the dark the masts rise into
        for k in range(5):
            weed(a, a.w / 2 + r.uniform(-150, 150), fy + 4, r.uniform(30, 70), n=2, op=0.5)
        for k in range(4):
            x = a.w / 2 + r.uniform(-130, 130)
            y = r.uniform(200, 380)
            a.path(f"M{f(x)},{f(y)} q{f(r.uniform(-14, 14))},{f(30)} {f(r.uniform(-8, 8))},{f(r.uniform(50, 90))}", fill="none", stroke=LINE,
                   stroke_width=0.8, opacity=0.5)
        a.rect(0, 0, a.w, 330, fill=a.gradient([(0, "#03050a"), (1, "#03050a")]), opacity=0)
        gid = a.uid("fade")
        a.defn(f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050a" stop-opacity="1"/>'
               f'<stop offset="1" stop-color="#03050a" stop-opacity="0"/></linearGradient>')
        a.rect(0, 0, a.w, 300, fill=f"url(#{gid})")
        # the bell at the bow glows a little; a specimen keeps the lane
        bx = a.w / 2 + (-1 if flip else 1) * (kit.SHIPS[kind]["L"] / 2 + D * 0.3) * s
        a.circle(bx, fy - D * s * 1.6, 44, fill=a.radial([(0, GOLD, 0.4), (1, GOLD, 0)]))
        kit.radiolarian(a, 70 + (i % 3) * 30 if not flip else a.w - 80, 400 + (i % 4) * 22, 11 + i % 3, [MINT, LILAC, AMBER][i % 3], n=6 + 2 * (i % 3),
                        kind=i % 2)
        kit.snow(a, 0, 0, a.w, a.h, n=140, opacity=0.4)
        kit.frame(a, 16, 16, a.w - 32, a.h - 32, col=LINE, sw=1, gap=4)
        kit.italic(a, a.w / 2, a.h - 34, f"Fig. {i + 1}", size=18, col=LINE, opacity=0.9)
    hull.__doc__ = (f"A hull of the Standing Fleet, upright on the trench floor at 140 metres: {what}. White line on blue-black, "
                    f"masts rising into darkness, a small bell at the bow, the floor ruled like a ledger.")
    return hull


for _i, _h in enumerate(HULLS):
    make_hull(_i, *_h)


# ---- specimens ---------------------------------------------------------------------------------------

def sp_radiolarian(a, c, col):
    kit.radiolarian(a, c, c, 62, col, n=8, kind=0, sw=1.3)


def sp_spined(a, c, col):
    kit.radiolarian(a, c, c, 46, col, n=6, kind=1, sw=1.3)
    a.path(a.smooth_d(kit.Art.ngon(c, c, 46, 6, rot=30), closed=True), fill="none", stroke=col, stroke_width=1)


def sp_lattice(a, c, col):
    kit.radiolarian(a, c, c, 74, col, n=12, kind=0, sw=1.1)
    for k in (0.3, 0.42):
        a.poly(kit.Art.ngon(c, c, 74 * k, 6, rot=k * 100), fill="none", stroke=col, stroke_width=1)


def sp_sun(a, c, col):
    a.circle(c, c, 150, fill=a.radial([(0, col, 0.5), (0.5, col, 0.14), (1, col, 0)]))
    d = ""
    for k in range(48):
        ang = k * math.pi / 24
        L = 120 if k % 2 == 0 else 86
        d += f"M{f(c + 30 * math.cos(ang))},{f(c + 30 * math.sin(ang))}L{f(c + L * math.cos(ang))},{f(c + L * math.sin(ang))}"
    a.path(d, stroke=col, stroke_width=0.9, fill="none")
    a.circle(c, c, 30, fill="none", stroke=col, stroke_width=1.6)
    for k in range(7):
        ang = k * 0.9
        a.circle(c + 14 * math.cos(ang), c + 14 * math.sin(ang), 5.5, fill="none", stroke=col, stroke_width=1)
    a.circle(c, c, 5, fill=col)


def sp_jelly(a, c, col):
    a.circle(c, c - 30, 130, fill=a.radial([(0, col, 0.45), (1, col, 0)]))
    a.path(f"M{c - 78},{c - 20} a78,74 0 0,1 156,0 q-20,16 -39,0 q-20,16 -39,0 q-20,16 -39,0 q-20,16 -39,0z", fill=col, fill_opacity=0.14,
           stroke=col, stroke_width=1.7)
    for k in range(-3, 4):
        a.path(f"M{c + k * 22},{c - 22} Q{c + k * 26},{c - 80} {c},{c - 94}", fill="none", stroke=col, stroke_width=0.8, opacity=0.8)
    for k in range(9):
        x = c - 68 + k * 17
        pts = [(x + 9 * math.sin(j * 0.9 + k), c - 14 + j * (14 + (k % 3) * 3)) for j in range(9)]
        a.path(a.smooth_d(pts), fill="none", stroke=col, stroke_width=1 if k % 2 else 1.6, opacity=0.9)


def sp_comb(a, c, col):
    a.circle(c, c, 140, fill=a.radial([(0, col, 0.4), (1, col, 0)]))
    a.ellipse(c, c, 62, 96, fill=col, fill_opacity=0.1, stroke=col, stroke_width=1.6)
    for k in range(-3, 4):
        rx = abs(k) * 20 + 2
        a.ellipse(c, c, rx, 96, fill="none", stroke=col, stroke_width=3.2, stroke_dasharray="1.5 6", opacity=0.95)
    a.path(f"M{c},{c + 96} q-30,40 -10,70 M{c},{c + 96} q30,40 6,76", fill="none", stroke=col, stroke_width=1)
    a.circle(c, c - 96, 5, fill=col)


def sp_pen(a, c, col):
    a.circle(c, c - 10, 140, fill=a.radial([(0, col, 0.35), (1, col, 0)]))
    stem = [(c - 10 + 16 * math.sin(j * 0.5), c + 130 - j * 26) for j in range(11)]
    a.path(a.smooth_d(stem), fill="none", stroke=col, stroke_width=2.4, stroke_linecap="round")
    for j, (x, y) in enumerate(stem[2:], 2):
        L = 64 * math.sin((j - 1) / 10 * math.pi) + 10
        for sgn in (-1, 1):
            a.path(f"M{f(x)},{f(y)} q{f(sgn * L * 0.5)},{f(-L * 0.5)} {f(sgn * L)},{f(-L * 0.3)}", fill="none", stroke=col, stroke_width=1.2)
            for t in (0.4, 0.7, 1.0):
                a.circle(x + sgn * L * t, y - L * 0.3 * t - L * 0.12 * math.sin(t * 3), 2, fill=col)


def sp_star(a, c, col):
    a.circle(c, c, 150, fill=a.radial([(0, col, 0.4), (1, col, 0)]))
    for k in range(5):
        ang = k * 2 * math.pi / 5 - 1.57
        pts = [(c + (20 + j * 14) * math.cos(ang + 0.32 * math.sin(j * 0.8 + k)), c + (20 + j * 14) * math.sin(ang + 0.32 * math.sin(j * 0.8 + k)))
               for j in range(9)]
        a.path(a.smooth_d(pts), fill="none", stroke=col, stroke_width=5, stroke_linecap="round", opacity=0.35)
        a.path(a.smooth_d(pts), fill="none", stroke=col, stroke_width=5, stroke_dasharray="1.6 5")
        a.path(a.smooth_d(pts), fill="none", stroke=col, stroke_width=1)
    a.poly(kit.Art.ngon(c, c, 24, 5, rot=-90), fill=col, fill_opacity=0.2, stroke=col, stroke_width=1.6)
    a.poly(kit.Art.star_pts(c, c, 14, 6, 5), fill="none", stroke=col, stroke_width=1)


def sp_shell(a, c, col):
    a.circle(c, c, 150, fill=a.radial([(0, col, 0.4), (1, col, 0)]))
    pts = kit.spiral_pts(c + 6, c + 4, 4, 100, 3.2, cw=True, start=40, n=110)
    a.path(a.smooth_d(pts), fill="none", stroke=col, stroke_width=2)
    for k in range(10, len(pts), 5):
        x, y = pts[k]
        ang = math.atan2(y - c - 4, x - c - 6)
        rr = math.hypot(x - c - 6, y - c - 4)
        inner = rr * 0.7
        a.path(f"M{f(x)},{f(y)} Q{f(c + 6 + rr * 0.92 * math.cos(ang - 0.2))},{f(c + 4 + rr * 0.92 * math.sin(ang - 0.2))} "
               f"{f(c + 6 + inner * math.cos(ang - 0.12))},{f(c + 4 + inner * math.sin(ang - 0.12))}", fill="none", stroke=col, stroke_width=0.9)
    a.circle(c + 6, c + 4, 4, fill=col)


def sp_salp(a, c, col):
    a.circle(c, c, 150, fill=a.radial([(0, col, 0.3), (1, col, 0)]))
    for k in range(9):
        ang = -2.4 + k * 0.42
        x, y = c + 96 * math.cos(ang) * (1 - k * 0.02), c + 20 + 90 * math.sin(ang)
        rot = math.degrees(ang) + 90
        a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(rot)})")
        a.rect(-20, -13, 40, 26, rx=11, fill=col, fill_opacity=0.12, stroke=col, stroke_width=1.4)
        a.path("M-10,-13 v26 M0,-13 v26 M10,-13 v26", stroke=col, stroke_width=0.7, fill="none")
        a.circle(8, 0, 4, fill=col)
        a.close()


def sp_siphon(a, c, col):
    a.circle(c, c, 150, fill=a.radial([(0, col, 0.3), (1, col, 0)]))
    stem = [(c - 60 + j * 12 + 18 * math.sin(j * 0.7), c - 120 + j * 24) for j in range(11)]
    a.path(a.smooth_d(stem), fill="none", stroke=col, stroke_width=1.6)
    for j, (x, y) in enumerate(stem):
        if j < 4:
            for sgn in (-1, 1):
                a.path(f"M{f(x)},{f(y)} q{sgn * 22},-6 {sgn * 26},12 q{-sgn * 10},8 {-sgn * 26},-12z", fill=col, fill_opacity=0.15, stroke=col,
                       stroke_width=1.2)
        else:
            t = [(x + (8 + k * 5) * (1 if j % 2 else -1) + 5 * math.sin(k + j), y + k * 12) for k in range(7)]
            a.path(a.smooth_d(t), fill="none", stroke=col, stroke_width=0.9)
            a.circle(t[-1][0], t[-1][1], 2.4, fill=col)
    a.ellipse(stem[0][0], stem[0][1] - 10, 8, 13, fill=col, fill_opacity=0.3, stroke=col, stroke_width=1.3)


def sp_fish(a, c, col):
    a.circle(c + 50, c - 40, 80, fill=a.radial([(0, col, 0.6), (1, col, 0)]))
    a.path(f"M{c + 80},{c + 10} Q{c + 30},{c - 44} {c - 50},{c - 6} L{c - 104},{c - 36} L{c - 92},{c + 8} L{c - 104},{c + 46} L{c - 50},{c + 20} "
           f"Q{c + 30},{c + 58} {c + 80},{c + 10}Z", fill=ABYSS, stroke=col, stroke_width=1.7, stroke_linejoin="round")
    a.path(f"M{c + 80},{c + 10} l-36,6 M{c - 10},{c - 28} l-14,-26 l34,18 M{c + 6},{c + 34} l-10,22 l26,-14", fill="none", stroke=col,
           stroke_width=1.2)
    a.circle(c + 50, c - 4, 9, fill="none", stroke=col, stroke_width=1.5)
    a.circle(c + 50, c - 4, 3, fill=col)
    for k in range(9):
        a.circle(c + 30 - k * 14, c + 22 + 5 * math.sin(k * 0.6) - k * 0.5, 2.6, fill=col)
    for k in range(5):
        a.circle(c + 10 - k * 14, c - 2, 1.6, fill=col, opacity=0.8)
    a.path(f"M{c + 40},{c - 26} q0,-34 22,-30", fill="none", stroke=col, stroke_width=1.2)
    a.circle(c + 62, c - 56, 5, fill=col)


SPECIMENS = [("radiolarian", sp_radiolarian, MINT, "a radiolarian, an eight-rayed lattice sphere"),
             ("spined", sp_spined, LILAC, "a six-spined radiolarian with barbed rays"),
             ("lattice", sp_lattice, AMBER, "a twelve-rayed lattice shell within a shell"),
             ("sun-animalcule", sp_sun, FOAM, "a sun animalcule, all fine rays"),
             ("jelly", sp_jelly, LILAC, "a bell jelly trailing its tentacles"),
             ("comb-jelly", sp_comb, MINT, "a comb jelly with its eight rows of beating plates"),
             ("sea-pen", sp_pen, AMBER, "a sea pen, a lit feather on a stalk"),
             ("brittle-star", sp_star, MINT, "a brittle star with five jointed arms"),
             ("spiral-shell", sp_shell, FOAM, "a chambered shell cut to show its clockwise spiral"),
             ("salp-chain", sp_salp, LILAC, "a chain of salps curled like a bracelet"),
             ("siphonophore", sp_siphon, MINT, "a siphonophore: swimming bells above, fishing lines below"),
             ("lantern-fish", sp_fish, AMBER, "a lantern fish with its row of lights and its lure")]


def make_specimen(i, key, fn, col, what):
    @asset(G, f"specimen-{i + 1:02d}-{key}", group="backdrops", title=f"Glowing specimen {i + 1}: {key.replace('-', ' ')}", w=360, h=360,
           row=ROW)
    def specimen(a: Art):
        a.paper(ABYSS, grain=0.3)
        a.circle(180, 172, 168, fill=a.radial([(0, "#12263c", 1), (1, ABYSS, 1)]))
        kit.snow(a, 0, 0, a.w, a.h, n=90, opacity=0.35)
        a.open("g", transform="translate(180,172) scale(0.86) translate(-180,-180)")
        fn(a, 180, col)
        a.close()
        a.circle(180, 172, 166, fill="none", stroke=LINE, stroke_width=1, opacity=0.5)
        a.circle(180, 172, 171, fill="none", stroke=LINE, stroke_width=0.5, opacity=0.5)
        kit.italic(a, 180, 348, f"Fig. {i + 1}", size=16, col=LINE, opacity=0.9)
    specimen.__doc__ = f"A glowing specimen of the Deep, drawn as a naturalist's lithograph in light on blue-black: {what}."
    return specimen


for _i, _s in enumerate(SPECIMENS):
    make_specimen(_i, *_s)

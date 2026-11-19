"""Dead Reckoning on a nautical plotting sheet: five sheets, four instruments and the lead line."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK, PENCIL = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK, kit.PENCIL)
ROW = "Dead Reckoning: 5 sheets, 4 instruments, lead line"
SHEET = "#E7E8DA"


def sheetpaper(a, m=40, grid=80.0):
    a.paper(SHEET, grain=0.1)
    a.grid(m, m, a.w - 2 * m, a.h - 2 * m, grid, stroke=INK, stroke_width=0.5, opacity=0.35)
    a.grid(m, m, a.w - 2 * m, a.h - 2 * m, grid / 5, stroke=INK, stroke_width=0.3, opacity=0.14)
    a.rect(m, m, a.w - 2 * m, a.h - 2 * m, fill="none", stroke=INK, stroke_width=2)
    a.rect(m - 8, m - 8, a.w - 2 * m + 16, a.h - 2 * m + 16, fill="none", stroke=INK, stroke_width=6, stroke_dasharray="40 40")
    a.rect(m - 11, m - 11, a.w - 2 * m + 22, a.h - 2 * m + 22, fill="none", stroke=INK, stroke_width=0.8)


def tide_table(a, x, y, rows, title="TIDAL STREAM", rot=-2):
    a.open("g", transform=f"translate({x},{y}) rotate({rot})")
    a.rect(4, 5, 230, 44 + len(rows) * 24, fill="#000", opacity=0.2)
    a.rect(0, 0, 230, 44 + len(rows) * 24, fill="#FBF9EE", stroke=TEA, stroke_width=0.8)
    a.text(14, 22, title, size=14, family="sans-serif", fill=INK, font_weight="bold", letter_spacing=1.5)
    a.text(14, 40, "HR   SET   RATE", size=12, family="monospace", fill=RED)
    for j, row in enumerate(rows):
        a.text(14, 62 + j * 24, row, size=14, family="monospace", fill=INK)
    a.circle(115, 8, 6, fill=RED, stroke="#000", stroke_width=0.8)
    a.close()


def clock(a, x, y, hours, r=44):
    a.circle(x, y, r, fill="#FBF9EE", stroke=INK, stroke_width=2)
    a.path(f"M{x},{y} L{x},{y - r} A{r},{r} 0 {1 if hours > 6 else 0},1 {f(x + r * math.sin(hours / 12 * 6.283))},{f(y - r * math.cos(hours / 12 * 6.283))}Z",
           fill=GOLD, opacity=0.5)
    a.circle(x, y, r - 5, fill="none", stroke=INK, stroke_width=5, stroke_dasharray=f"1.2 {2 * math.pi * (r - 5) / 12 - 1.2:.3f}")
    a.line(x, y, x + (r - 10) * math.sin(hours / 12 * 6.283), y - (r - 10) * math.cos(hours / 12 * 6.283), stroke=INK, stroke_width=2.4)
    a.text(x, y + r + 20, f"{hours} h", size=14, family="sans-serif", fill=INK, text_anchor="middle", font_weight="bold")


def arrow(a, x1, y1, x2, y2, col, sw=2.0, heads=1, dash=None):
    a.line(x1, y1, x2, y2, stroke=col, stroke_width=sw, stroke_dasharray=dash, stroke_linecap="round")
    ang = math.atan2(y2 - y1, x2 - x1)
    for k in range(heads):
        t = 0.55 + k * 0.09 if heads > 1 else 0.55
        mx, my = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
        a.path(f"M{f(mx - 11 * math.cos(ang - 0.45))},{f(my - 11 * math.sin(ang - 0.45))} L{f(mx)},{f(my)} "
               f"L{f(mx - 11 * math.cos(ang + 0.45))},{f(my - 11 * math.sin(ang + 0.45))}", fill="none", stroke=col, stroke_width=sw,
               stroke_linecap="round")


def fix(a, x, y, label):
    a.circle(x, y, 9, fill="none", stroke=INK, stroke_width=2)
    a.circle(x, y, 2.4, fill=INK)
    a.text(x + 16, y + 22, label, size=15, family="sans-serif", fill=INK, font_weight="bold")


def dr(a, x, y, label):
    a.path(f"M{x - 10},{y} a10,10 0 0,1 20,0z", fill="none", stroke=PENCIL, stroke_width=2)
    a.circle(x, y, 2.4, fill=PENCIL)
    a.text(x - 16, y - 16, label, size=15, family="sans-serif", fill=PENCIL, font_weight="bold", text_anchor="end")


def target(a, x, y, r):
    a.circle(x, y, r, fill=RED, fill_opacity=0.07, stroke=RED, stroke_width=1.8, stroke_dasharray="9 6")
    a.path(f"M{x - 9},{y}h18M{x},{y - 9}v18", stroke=RED, stroke_width=1.6)


def rock(a, x, y, s=1.0):
    a.path(f"M{f(x - 22 * s)},{f(y + 12 * s)} l{f(9 * s)},{f(-22 * s)} l{f(11 * s)},{f(9 * s)} l{f(8 * s)},{f(-15 * s)} l{f(15 * s)},{f(28 * s)}z", fill=INK)
    a.ellipse(x, y + 4 * s, 40 * s, 22 * s, fill="none", stroke=INK, stroke_width=1, stroke_dasharray="2 4")
    a.path(f"M{f(x - 6 * s)},{f(y - 30 * s)}h{f(12 * s)}M{f(x)},{f(y - 36 * s)}v{f(12 * s)}", stroke=INK, stroke_width=1.6)


def wreck_mark(a, x, y):
    a.path(f"M{x - 18},{y} h36 M{x - 10},{y - 8} v16 M{x},{y - 10} v20 M{x + 10},{y - 8} v16", stroke=INK, stroke_width=2, stroke_linecap="round")
    a.ellipse(x, y, 30, 18, fill="none", stroke=INK, stroke_width=1, stroke_dasharray="2 4")


def leg(a, pts, labels):
    for ((x1, y1), (x2, y2)), lab in zip(zip(pts, pts[1:]), labels):
        a.path(a.wobble_d([(x1, y1), (x2, y2)], 0.7, 40), fill="none", stroke=PENCIL, stroke_width=2.2)
        ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        flip = 180 if abs(ang) > 90 else 0
        a.text(mx, my - 10, lab, size=15, family="sans-serif", fill=PENCIL, text_anchor="middle", font_style="italic",
               transform=f"rotate({f(ang + flip)} {f(mx)} {f(my)})")
        for t in (0.33, 0.66):
            px, py = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            r = math.radians(ang + 90)
            a.line(px - 6 * math.cos(r), py - 6 * math.sin(r), px + 6 * math.cos(r), py + 6 * math.sin(r), stroke=PENCIL, stroke_width=1.6)


def scalebar(a, x, y, nm=50.0):
    a.rect(x, y, 6 * nm, 9, fill="#FBF9EE", stroke=INK, stroke_width=1)
    for i in range(0, 6, 2):
        a.rect(x + i * nm, y, nm, 9, fill=INK)
    for i in range(7):
        a.text(x + i * nm, y + 20 if nm != 50.0 else y + 26, str(i), size=12, family="sans-serif", fill=INK, text_anchor="middle")
    kit.italic(a, x + 6 * nm + 20, y + 10, "nautical miles", size=14, anchor="start")


def coast(a, pts, hatch=True):
    d = a.smooth_d(pts)
    a.path(d + "Z", fill="#d8d2b4", stroke=INK, stroke_width=1.6)
    if hatch:
        a.path(d + "Z", fill=kit.pattern(a, INK, gap=5, sw=0.6, ang=-40), opacity=0.4)


def smudge(a, x, y, w, h):
    a.ellipse(x, y, w, h, fill=PENCIL, opacity=0.1, filter=a.blur(8))


@asset(G, "reckon-unwritten", group="maps", title="Dead Reckoning sheet: off the chart's edge", w=1600, h=900, row=ROW)
def r_unwritten(a: Art):
    """The first plot, as the sheet lies before the pencil touches it: 46 points to the nautical mile, the engraved
    coast stopping at the left, the last fix, two rocks, the target ring and the rose. The leg, the tide arrows and
    the clock are the player's to lay, so the sheet carries none."""
    NM, OX, OY = 46.0, 40.0, 822.0      # the module plots on this grid: x east and y north in nautical miles
    X = lambda nm: OX + nm * NM
    Y = lambda nm: OY - nm * NM
    sheetpaper(a, grid=NM * 5)
    coast(a, [(40, 40), (120, 40), (150, 200), (118, 380), (128, 560), (96, 700), (150, 800), (132, 860), (40, 860)])
    a.line(250, 40, 250, 860, stroke=INK, stroke_width=1.2, stroke_dasharray="14 8")
    a.text(262, 60, "here the chart ends", size=15, family="serif", fill=INK, font_style="italic")
    kit.sea(a, 270, 1560, 120, 820, rows=9, fn=kit.swell(amp=12, wl=260, sharp=0.5), col=GREEN, sw=(0.8, 0.8), step=18, persp=1, opacity=0.3)
    for (rx, ry) in ((17.2, 6.1), (11.5, 12.6)):
        a.circle(X(rx), Y(ry), 0.8 * NM, fill="none", stroke=INK, stroke_width=1, stroke_dasharray="2 4")
        rock(a, X(rx), Y(ry) + 2, 0.8)
    target(a, X(24), Y(15), 2 * NM)
    fix(a, X(3), Y(4), "FIX 0600")
    kit.rose(a, X(27.6), Y(3.6), 3 * NM * 0.86)
    scalebar(a, X(8), 836, NM)


@asset(G, "reckon-strait", group="maps", title="Dead Reckoning sheet: the Lamplit Strait", w=1600, h=900, row=ROW)
def r_strait(a: Art):
    """The Strait plot: two legs between wreck marks, the tide reversing after the second hour, and gold bearing
    lines struck from each lit light to cross on the track."""
    sheetpaper(a)
    coast(a, [(40, 40), (1560, 40), (1560, 150), (1200, 210), (900, 170), (600, 240), (300, 190), (40, 260)])
    coast(a, [(40, 860), (40, 700), (320, 640), (620, 690), (900, 640), (1250, 700), (1560, 650), (1560, 860)])
    lights = [(330, 196), (900, 176), (1380, 190), (620, 684), (1250, 694)]
    for i, (lx, ly) in enumerate(lights):
        a.circle(lx, ly, 22, fill=GOLD, opacity=0.35)
        a.poly(Art.star_pts(lx, ly, 13, 5, 5), fill=GOLD, stroke=INK, stroke_width=1.2)
    for wx, wy in ((520, 400), (760, 520), (1040, 380), (1180, 520), (860, 330)):
        wreck_mark(a, wx, wy)
    pts = [(200, 470), (700, 430), (1380, 460)]
    for (lx, ly), (tx, ty) in ((lights[0], (430, 452)), (lights[3], (430, 452)), (lights[1], (980, 442)), (lights[4], (980, 442))):
        a.line(lx, ly, tx + (tx - lx) * 0.12, ty + (ty - ly) * 0.12, stroke=GOLD, stroke_width=1.8, stroke_dasharray="10 5")
    fix(a, 200, 470, "FIX 2000")
    leg(a, pts, ["C 085° T   S 4 kn", "C 092° T   S 4 kn"])
    arrow(a, 700, 430, 760, 400, SEAINK, 2.2, heads=3)
    arrow(a, 1380, 460, 1300, 496, SEAINK, 2.2, heads=3)
    dr(a, 1300, 496, "DR 2400")
    target(a, 1330, 470, 60)
    tide_table(a, 70, 290, ["20  080°  2.0", "21  080°  1.0", "22  260°  1.0", "23  260°  2.5"], rot=2)
    clock(a, 1480, 330, 4)
    kit.rose(a, 1470, 560, 62, labels=False)
    scalebar(a, 620, 590)


@asset(G, "reckon-blockade", group="maps", title="Dead Reckoning sheet: the blockade", w=1600, h=900, row=ROW)
def r_blockade(a: Art):
    """The blockade plot: three legs threaded between the patrol sweeps, each sweep an arc in ledger red marked
    with its hour, to arrive at the halls' sea-gate inside the one hour of slack water."""
    sheetpaper(a)
    coast(a, [(1180, 40), (1560, 40), (1560, 420), (1420, 400), (1300, 300), (1280, 160)])
    a.rect(1330, 150, 90, 40, fill="#FBF9EE", stroke=INK, stroke_width=1.6)
    a.path("M1352,150 a24,20 0 0,1 46,0z", fill="#FBF9EE", stroke=INK, stroke_width=1.6)
    kit.smallcaps(a, 1420, 240, "The Halls", size=15)
    for i, (cx, cy, r, a0, a1, hr) in enumerate(((1330, 330, 330, 100, 190, "0100"), (1330, 330, 500, 110, 200, "0200"),
                                                 (1330, 330, 690, 120, 196, "0300"), (1330, 330, 900, 128, 188, "0400"))):
        a.path(kit.arc_d(cx, cy, r, a0, a1), fill="none", stroke=RED, stroke_width=2.2, stroke_dasharray="16 7")
        ax, ay = cx + r * math.cos(math.radians(a0 + 6)), cy + r * math.sin(math.radians(a0 + 6))
        a.rect(ax - 26, ay - 12, 52, 22, fill=SHEET, stroke=RED, stroke_width=1)
        a.text(ax, ay + 4, hr, size=13, family="monospace", fill=RED, text_anchor="middle")
        mx, my = cx + r * math.cos(math.radians((a0 + a1) / 2)), cy + r * math.sin(math.radians((a0 + a1) / 2))
        a.open("g", transform=f"translate({f(mx)},{f(my)}) scale(0.16)", opacity=0.9)
        kit.ship(a, "cutter", 0, 0, 1, ink=RED, lw=3)
        a.close()
    pts = [(160, 760), (560, 520), (900, 640), (1250, 370)]
    fix(a, 160, 760, "FIX 0030")
    leg(a, pts, ["C 058° T   S 5 kn", "C 110° T   S 4 kn", "C 050° T   S 5 kn"])
    arrow(a, 560, 520, 610, 560, SEAINK, 2.2, heads=3)
    arrow(a, 900, 640, 940, 600, SEAINK, 2.2, heads=3)
    target(a, 1262, 356, 34)
    dr(a, 1250, 370, "DR 0430")
    tide_table(a, 70, 70, ["01  110°  2.0", "02  110°  1.0", "03  slack  0.0", "04  290°  1.5"])
    a.rect(74, 180, 222, 24, fill=GOLD, opacity=0.3, transform="rotate(-2 70 70)")
    clock(a, 420, 120, 4)
    kit.rose(a, 330, 380, 100)
    scalebar(a, 620, 800)


@asset(G, "reckon-lane", group="maps", title="Dead Reckoning sheet: laying a lane", w=1600, h=900, row=ROW)
def r_lane(a: Art):
    """Laying a safe lane: one leg from a port to open water, inked over the pencil as a double rule with buoys at
    its hours, the calm it costs shown as ruled hatching either side."""
    sheetpaper(a)
    coast(a, [(40, 860), (40, 480), (200, 420), (330, 520), (300, 700), (420, 860)])
    for k in range(5):
        a.rect(150 + k * 26, 560 + k * 16, 20, 20, fill=INK)
    kit.smallcaps(a, 210, 760, "Port", size=16)
    kit.sea(a, 480, 1560, 80, 840, rows=10, fn=kit.swell(amp=12, wl=260, sharp=0.5), col=GREEN, sw=(0.8, 0.8), step=18, persp=1, opacity=0.3)
    x1, y1, x2, y2 = 330, 600, 1360, 250
    ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
    L = math.hypot(x2 - x1, y2 - y1)
    a.open("g", transform=f"translate({x1},{y1}) rotate({f(ang)})")
    a.rect(0, -70, L, 140, fill=SHEET)
    a.rect(0, -70, L, 140, fill=kit.pattern(a, INK, gap=7, sw=0.8), opacity=0.5)
    a.path(f"M0,-26 H{f(L)} M0,26 H{f(L)}", stroke=INK, stroke_width=3)
    a.path(f"M0,0 H{f(L)}", stroke=PENCIL, stroke_width=1.6, stroke_dasharray="12 8")
    a.close()
    for t in (0.25, 0.5, 0.75, 1.0):
        bx, by = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
        kit.buoy(a, bx, by - 34, 1.2, lit=True)
        kit.buoy(a, bx + 18, by + 50, 1.2)
    fix(a, x1, y1, "FIX")
    leg(a, [(x1, y1 - 96), (x2, y2 - 96)], ["C 064° T   S 4 kn"])
    target(a, x2, y2, 70)
    tide_table(a, 620, 620, ["00  064°  1.0", "01  064°  1.0", "02  064°  1.0"])
    clock(a, 1480, 110, 3)
    kit.rose(a, 1320, 660, 120)
    scalebar(a, 620, 800)


@asset(G, "reckon-back-plot", group="maps", title="Dead Reckoning sheet: the back-plot", w=1600, h=900, row=ROW)
def r_backplot(a: Art):
    """The back-plot made at a Tide Reckoning: from the cross where a boat was found, the tide is laid off
    backwards hour by hour to the ring where it went over, with the error widening as a cone in wild water."""
    sheetpaper(a)
    kit.sea(a, 40, 1560, 80, 840, rows=10, fn=kit.swell(amp=14, wl=280, sharp=0.5), col=GREEN, sw=(0.8, 0.8), step=18, persp=1, opacity=0.3)
    coast(a, [(40, 40), (520, 40), (420, 150), (220, 190), (40, 300)])
    found = (1240, 660)
    pts = [found, (1050, 590), (840, 560), (640, 470), (470, 420)]
    a.path(f"M{found[0]},{found[1]} L{pts[-1][0] - 30},{pts[-1][1] - 110} L{pts[-1][0] + 20},{pts[-1][1] + 110}Z", fill=SEAINK, opacity=0.13)
    a.path(f"M{found[0]},{found[1]} L{pts[-1][0] - 30},{pts[-1][1] - 110} M{found[0]},{found[1]} L{pts[-1][0] + 20},{pts[-1][1] + 110}",
           stroke=SEAINK, stroke_width=1.2, stroke_dasharray="6 6", fill="none")
    for i, ((xa, ya), (xb, yb)) in enumerate(zip(pts, pts[1:])):
        arrow(a, xa, ya, xb, yb, PENCIL, 2.2, heads=3, dash="12 7")
        a.circle(xb, yb, 4, fill=PENCIL)
        a.text(xb, yb + 28, f"−{i + 1} h", size=15, family="sans-serif", fill=PENCIL, text_anchor="middle", font_style="italic")
    a.path(f"M{found[0] - 14},{found[1] - 14} l28,28 M{found[0] + 14},{found[1] - 14} l-28,28", stroke=RED, stroke_width=3.4, stroke_linecap="round")
    a.text(found[0] + 24, found[1] + 6, "FOUND 0900", size=15, family="sans-serif", fill=RED, font_weight="bold")
    ox, oy = pts[-1]
    for k in range(1, 4):
        a.ellipse(ox, oy, 26 * k, 12 * k, fill="none", stroke=SEAINK, stroke_width=2.2 - k * 0.4)
    kit.spiral(a, ox, oy, 1, 12, 2.2, stroke_width=2)
    a.text(ox - 20, oy - 52, "WENT OVER 0500", size=15, family="sans-serif", fill=SEAINK, font_weight="bold", text_anchor="middle")
    a.line(ox, oy + 30, ox, oy + 160, stroke=PENCIL, stroke_width=1.4, stroke_dasharray="3 5")
    a.path(f"M{ox - 7},{oy + 160} h14 l-3,26 h-8z", fill=PENCIL)
    a.text(ox + 16, oy + 150, "14 fm", size=14, family="sans-serif", fill=PENCIL, font_style="italic")
    tide_table(a, 1250, 70, ["05  250°  1.5", "06  245°  2.0", "07  240°  2.0", "08  250°  1.5"], rot=2)
    clock(a, 1150, 120, 4)
    kit.rose(a, 1380, 360, 110)
    scalebar(a, 120, 800)
    smudge(a, 800, 620, 140, 50)


# ---- instruments -------------------------------------------------------------------------------------
IW, IH = 520, 340
BRASS, BRASS2 = "#C9A24A", "#8A6A2F"


def tray(a):
    a.paper(SHEET, grain=0.1)
    a.grid(0, 0, a.w, a.h, 80, stroke=INK, stroke_width=0.5, opacity=0.3)
    a.grid(0, 0, a.w, a.h, 16, stroke=INK, stroke_width=0.3, opacity=0.12)


@asset(G, "instrument-parallel-rule", group="pieces", title="Dead Reckoning: the parallel rule", w=IW, h=IH, row=ROW)
def i_rule(a: Art):
    """The parallel rule: two ebony bars edged in brass and joined by two swinging brass arms, lying open across
    the sheet with a pencilled course along its edge."""
    tray(a)
    a.path(a.wobble_d([(20, 300), (500, 116)], 0.7, 40), fill="none", stroke=PENCIL, stroke_width=2)
    a.open("g", transform="translate(260,170) rotate(-21)")
    for y in (-78, 36):
        a.rect(-214, y + 6, 430, 44, rx=3, fill="#000", opacity=0.22)
        a.rect(-218, y, 430, 44, rx=3, fill="#2a2420", stroke="#000", stroke_width=1.2)
        a.rect(-218, y, 430, 7, fill=BRASS)
        a.rect(-218, y + 37, 430, 7, fill=BRASS)
        a.path("".join(f"M{-210 + k * 10},{y + 7}v{9 if k % 5 == 0 else 5}" for k in range(42)), stroke=BRASS, stroke_width=1)
        a.path(f"M-200,{y + 22} h396", stroke="#fff", stroke_width=1, opacity=0.2)
    for x in (-130, 100):
        a.path(f"M{x},{-56} L{x + 44},{58}", stroke=BRASS2, stroke_width=17, stroke_linecap="round")
        a.path(f"M{x},{-56} L{x + 44},{58}", stroke=BRASS, stroke_width=12, stroke_linecap="round")
        for (px, py) in ((x, -56), (x + 44, 58)):
            a.circle(px, py, 5, fill=BRASS2, stroke="#000", stroke_width=0.8)
    a.close()


@asset(G, "instrument-dividers", group="pieces", title="Dead Reckoning: the dividers", w=IW, h=IH, row=ROW)
def i_dividers(a: Art):
    """A pair of brass dividers stepping off a distance: steel points on two pencilled marks, the hinge bright."""
    tray(a)
    a.path(a.wobble_d([(60, 286), (470, 286)], 0.6, 40), fill="none", stroke=PENCIL, stroke_width=2)
    for x in (170, 362):
        a.path(f"M{x - 7},{279}l14,14M{x + 7},{279}l-14,14", stroke=PENCIL, stroke_width=1.8)
    hx, hy = 266, 50
    for tx in (170, 362):
        a.path(f"M{hx + 4},{hy + 6} L{tx + 4},{292}", stroke="#000", stroke_width=10, opacity=0.15, stroke_linecap="round")
    for tx, sgn in ((170, -1), (362, 1)):
        mx, my = hx + (tx - hx) * 0.66, hy + (286 - hy) * 0.66
        a.path(f"M{hx},{hy} L{mx},{my}", stroke=BRASS2, stroke_width=15, stroke_linecap="round")
        a.path(f"M{hx},{hy} L{mx},{my}", stroke=BRASS, stroke_width=10, stroke_linecap="round")
        a.path(f"M{hx + sgn * 2},{hy + 10} L{mx + sgn * 2},{my - 6}", stroke="#fff", stroke_width=1.6, opacity=0.5)
        a.path(f"M{f(mx - 5)},{f(my)} L{tx},{286} L{f(mx + 5)},{f(my)}Z", fill="#9aa0a8", stroke="#333", stroke_width=1)
    a.circle(hx, hy, 17, fill=BRASS, stroke=BRASS2, stroke_width=3)
    a.circle(hx, hy, 6, fill=BRASS2)
    a.rect(hx - 5, hy - 40, 10, 26, rx=3, fill=BRASS, stroke=BRASS2, stroke_width=2)
    a.path(kit.arc_d(hx, hy, 150, 68, 112), fill="none", stroke=PENCIL, stroke_width=1, stroke_dasharray="4 5")


@asset(G, "instrument-pencil", group="pieces", title="Dead Reckoning: the pencil", w=IW, h=IH, row=ROW)
def i_pencil(a: Art):
    """A carpenter-sharpened pencil in dawn gold lying beside the line and the three-arrow tide vector it has just
    drawn, shavings beside it."""
    tray(a)
    a.path(a.wobble_d([(40, 250), (300, 130)], 0.7, 40), fill="none", stroke=PENCIL, stroke_width=2.2)
    a.path("M300,130 l120,-10", stroke=SEAINK, stroke_width=2.4)
    for t in (0.5, 0.62, 0.74):
        x, y = 300 + 120 * t, 130 - 10 * t
        a.path(f"M{f(x - 10)},{f(y - 6)} L{f(x)},{f(y)} L{f(x - 9)},{f(y + 8)}", fill="none", stroke=SEAINK, stroke_width=2.4)
    a.open("g", transform="translate(250,214) rotate(-25)")
    a.rect(-176, 0, 320, 26, fill="#000", opacity=0.18, transform="translate(4,8)")
    a.rect(-180, -13, 300, 26, fill=GOLD, stroke="#7a5a18", stroke_width=1.4)
    a.path("M-180,-4 h300 M-180,5 h300", stroke="#7a5a18", stroke_width=1, opacity=0.6)
    a.path("M120,-13 L176,0 L120,13Z", fill="#e7cfa0", stroke="#7a5a18", stroke_width=1.4)
    a.path("M158,-4 L176,0 L158,4Z", fill=PENCIL)
    a.rect(-200, -13, 20, 26, fill=RED, stroke="#5e1818", stroke_width=1.2)
    a.rect(-184, -13, 8, 26, fill=BRASS)
    a.close()
    for (x, y, r) in ((420, 250, 20), (452, 276, -40), (400, 286, 70)):
        a.path(f"M{x},{y} q14,-10 26,2 q-12,12 -26,-2z", fill="#e7cfa0", stroke="#7a5a18", stroke_width=1, transform=f"rotate({r} {x} {y})")


@asset(G, "instrument-eraser", group="pieces", title="Dead Reckoning: the eraser", w=IW, h=IH, row=ROW)
def i_eraser(a: Art):
    """A block of india rubber, one corner worn round, on a rubbed-out leg whose ghost still shows, with crumbs."""
    tray(a)
    a.path(a.wobble_d([(40, 240), (480, 110)], 0.7, 40), fill="none", stroke=PENCIL, stroke_width=2.2, opacity=0.22)
    a.ellipse(230, 190, 150, 46, fill=SHEET, opacity=0.8, filter=a.blur(8), transform="rotate(-16 230 190)")
    a.path(a.wobble_d([(40, 240), (130, 214)], 0.7, 40), fill="none", stroke=PENCIL, stroke_width=2.2)
    a.open("g", transform="translate(300,160) rotate(-14)")
    a.path("M-70,-28 h126 q22,0 22,22 v40 h-148z", fill="#000", opacity=0.2, transform="translate(6,10)")
    a.path("M-70,-28 h126 q22,0 22,22 v40 h-148z", fill="#b7654f", stroke="#6e3524", stroke_width=1.6)
    a.path("M-70,-28 h126 q22,0 22,22 v6 h-148z", fill="#cf8068")
    a.path("M-70,34 h148", stroke="#6e3524", stroke_width=3, opacity=0.5)
    a.stipple(-66, -24, 140, 54, n=70, r=(0.5, 1.4), fill="#6e3524", opacity=0.5)
    a.close()
    r = a.rng
    for k in range(26):
        x, y = r.uniform(120, 420), r.uniform(214, 290)
        a.path(f"M{f(x)},{f(y)} q{f(r.uniform(3, 8))},{f(r.uniform(-4, 4))} {f(r.uniform(6, 14))},{f(r.uniform(-3, 3))}", fill="none",
               stroke="#6e3524", stroke_width=2.2, stroke_linecap="round", opacity=0.7)


@asset(G, "lead-line", group="pieces", title="Dead Reckoning: the lead line", w=IW, h=IH, row=ROW)
def i_lead(a: Art):
    """The sounding lead and its line: a tapered lead weight with tallow in its hollow foot, the line coiled
    clockwise beside it and marked with leather and red bunting at its fathoms."""
    tray(a)
    pts = kit.spiral_pts(330, 176, 18, 124, 4.4, cw=True, start=200, n=130)
    d = a.smooth_d(pts)
    a.path(d, fill="none", stroke="#000", stroke_width=11, opacity=0.14, transform="translate(4,6)")
    a.path(d, fill="none", stroke="#6b5a3a", stroke_width=9, stroke_linecap="round")
    a.path(d, fill="none", stroke="#cdb98c", stroke_width=6, stroke_linecap="round")
    a.path(d, fill="none", stroke="#6b5a3a", stroke_width=6, stroke_dasharray="1.6 6")
    for k, col in ((40, RED), (78, "#3a2a1a"), (108, RED)):
        x, y = pts[k]
        a.path(f"M{f(x)},{f(y)} l-6,18 l8,-4 l6,8z", fill=col, stroke="#000", stroke_width=0.8)
    ex, ey = pts[-1]
    a.path(f"M{f(ex)},{f(ey)} Q150,330 104,214", fill="none", stroke="#6b5a3a", stroke_width=9, stroke_linecap="round")
    a.path(f"M{f(ex)},{f(ey)} Q150,330 104,214", fill="none", stroke="#cdb98c", stroke_width=6, stroke_linecap="round")
    a.open("g", transform="translate(96,150) rotate(-12)")
    a.path("M-16,-88 h32 l14,150 q-30,14 -60,0z", fill="#000", opacity=0.2, transform="translate(6,8)")
    a.path("M-16,-88 h32 l14,150 q-30,14 -60,0z", fill="#7d838c", stroke="#33373d", stroke_width=1.8)
    a.path("M-8,-84 l-12,140", stroke="#fff", stroke_width=4, opacity=0.35, stroke_linecap="round")
    a.rect(-30, -60, 60, 120, fill=kit.pattern(a, "#33373d", gap=5, sw=0.8, ang=80), opacity=0.35, clip_path=None)
    a.circle(0, -74, 7, fill=SHEET, stroke="#33373d", stroke_width=1.8)
    a.ellipse(0, 64, 22, 7, fill="#e9dfbf", stroke="#33373d", stroke_width=1.4)
    a.stipple(-16, 59, 32, 9, n=14, r=(0.6, 1.4), fill=TEA)
    a.close()

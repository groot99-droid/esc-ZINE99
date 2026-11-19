"""The Tea Board in blue-and-white export porcelain: three boards, five piece types, the crack and the tide dial."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, GOLD, SEAINK = kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.GOLD, kit.SEAINK
COB, COB2, WASH, GLAZE = kit.COB, kit.COB2, kit.WASH, kit.GLAZE
ROW = "The Tea Board: 3 boards, 5 piece types, crack, tide dial"

PORTS = {"Home": (240, 420), "Tidewater": (420, 250), "Unwritten": (380, 600), "Salt": (560, 470),
         "Strait": (680, 230), "Pearl": (760, 610), "Spice": (860, 400), "Halls": (1000, 260)}
LANES = [("Home", "Tidewater"), ("Home", "Unwritten"), ("Home", "Salt"), ("Tidewater", "Strait"),
         ("Unwritten", "Salt"), ("Salt", "Pearl"), ("Strait", "Spice"), ("Pearl", "Spice"), ("Pearl", "Halls"),
         ("Spice", "Halls"), ("Tidewater", "Spice"), ("Strait", "Halls")]


def glaze(a, tint=0.5):
    a.rect(0, 0, a.w, a.h, fill=GLAZE)
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#fff", 0.9), (0.6, "#fff", 0), (1, WASH, tint)], 0.4, 0.35, 0.8))


def beads(a, x, y, w, h, gap=16, r=5, col=COB):
    a.rect(x, y, w, h, fill="none", stroke=col, stroke_width=r * 2, stroke_dasharray=f"0.1 {gap}", stroke_linecap="round")


def fret(a, x, y, w, h, cell=28, col=COB, sw=3):
    d = []
    n = int(w / cell)
    cell = w / n
    for i in range(n):
        x0 = x + i * cell
        d.append(f"M{f(x0)},{f(y + h)} V{f(y + 4)} H{f(x0 + cell - 6)} V{f(y + h - 6)} H{f(x0 + 8)} V{f(y + 12)} "
                 f"H{f(x0 + cell - 14)} V{f(y + h - 14)}")
    a.path(" ".join(d), fill="none", stroke=col, stroke_width=sw)


def pagoda(a, x, y, s=1.0):
    a.open("g", transform=f"translate({f(x)},{f(y)}) scale({f(s)})")
    a.path("M-40,-10 Q0,-30 40,-10 L30,-18 Q0,-36 -30,-18Z", fill=COB)
    a.rect(-26, -10, 52, 30, fill=GLAZE, stroke=COB, stroke_width=2.5)
    a.path("".join(f"M{k},-10V20" for k in range(-20, 24, 8)), stroke=COB2, stroke_width=1.2)
    a.path("M-30,-40 Q0,-56 30,-40 L22,-46 Q0,-62 -22,-46Z", fill=COB)
    a.rect(-16, -40, 32, 22, fill=GLAZE, stroke=COB, stroke_width=2)
    a.line(0, -60, 0, -50, stroke=COB, stroke_width=3)
    a.close()


def willow(a, x, y, s=1.0):
    a.open("g", transform=f"translate({f(x)},{f(y)}) scale({f(s)})")
    a.path("M0,0 q-10,-60 6,-120 q4,-20 -6,-40", fill="none", stroke=COB, stroke_width=7, stroke_linecap="round")
    for k in range(13):
        x0 = -62 + k * 11
        top = -150 + abs(k - 6) * 6
        a.path(f"M{0 + (k - 6) * 3},{-150} Q{x0},{top - 20} {x0},{top + 40} q-4,40 2,{70 - abs(k - 6) * 5}", fill="none", stroke=COB if k % 2 else COB2,
               stroke_width=2.2, stroke_linecap="round")
        for j in range(4):
            a.path(f"M{x0},{top + 50 + j * 16} l-5,6 M{x0},{top + 56 + j * 16} l5,6", stroke=COB2, stroke_width=1.4, fill="none")
    a.close()


def doves(a, x, y, s=1.0):
    for dx, dy, fl in ((-34, 0, 1), (34, -16, -1)):
        a.open("g", transform=f"translate({f(x + dx * s)},{f(y + dy * s)}) scale({f(fl * s)},{f(s)})")
        a.path("M-30,0 Q-10,-26 6,-6 Q20,-30 44,-26 Q30,-10 12,4 Q4,14 -12,10 L-34,20 L-22,6Z", fill=COB)
        a.path("M-2,-4 Q12,-16 30,-20", fill="none", stroke=GLAZE, stroke_width=2)
        a.close()


def bridge(a, x, y, s=1.0):
    a.open("g", transform=f"translate({f(x)},{f(y)}) scale({f(s)})")
    a.path("M-90,20 Q0,-50 90,20", fill="none", stroke=COB, stroke_width=7)
    a.path("M-90,2 Q0,-66 90,2", fill="none", stroke=COB, stroke_width=3)
    a.path("".join(f"M{k},{-0.0062 * k * k * -1 * 0 + (k * k) / 8100 * 52 - 50 + 20}V{(k * k) / 8100 * 52 - 32 - 16}" for k in range(-80, 81, 16)),
           stroke=COB, stroke_width=2.4, fill="none")
    for k in (-46, 0, 46):
        a.path(f"M{k - 16},20 a16,20 0 0,1 32,0", fill="none", stroke=COB, stroke_width=3)
    a.close()


def junk(a, x, y, s=1.0):
    a.open("g", transform=f"translate({f(x)},{f(y)}) scale({f(s)})")
    a.path("M-50,0 Q0,22 56,-6 L44,16 Q0,30 -40,16Z", fill=COB)
    a.path("M-6,-2 V-78 M-36,-70 H22 L28,-10 H-40Z", fill=GLAZE, stroke=COB, stroke_width=2.6)
    a.path("M-38,-55 H24 M-39,-40 H26 M-40,-25 H27", stroke=COB2, stroke_width=1.5)
    a.close()


def board(a, names, lanes, style):
    glaze(a)
    a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, WASH, gap=13, sw=1, wave=True, opacity=0.55))
    # the border
    a.rect(16, 16, a.w - 32, a.h - 32, fill="none", stroke=COB, stroke_width=10)
    if style >= 1:
        a.rect(34, 34, a.w - 68, a.h - 68, fill=GLAZE, stroke=COB, stroke_width=2)
        fret(a, 40, 40, a.w - 80, 30)
        fret(a, 40, a.h - 70, a.w - 80, 30)
        a.rect(34, 78, a.w - 68, a.h - 156, fill="none", stroke=COB, stroke_width=2)
    if style == 2:
        beads(a, 50, 94, a.w - 100, a.h - 188, gap=17, r=4.5)
        a.rect(64, 108, a.w - 128, a.h - 216, fill="none", stroke=COB, stroke_width=3)
    if style == 0:
        beads(a, 40, 40, a.w - 80, a.h - 80, gap=20, r=6)
        a.rect(60, 60, a.w - 120, a.h - 120, fill="none", stroke=COB, stroke_width=3)
    xs = [PORTS[n][0] for n in names]
    ys = [PORTS[n][1] for n in names]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    X0, X1 = (330, 1270) if style == 2 else ((420, 1180) if style == 0 else (340, 1240))
    Y0, Y1 = (230, 570) if style else (250, 640)
    P = {n: (X0 + (PORTS[n][0] - x0) / (x1 - x0) * (X1 - X0), Y0 + (PORTS[n][1] - y0) / (y1 - y0) * (Y1 - Y0)) for n in names}
    # corner pictures: the willow pattern
    willow(a, 190, a.h - 150, 1.25)
    doves(a, a.w / 2 + (120 if style else 0), 170 if style else 150, 1.3)
    if style:
        bridge(a, a.w - 250, a.h - 150, 1.2)
        junk(a, 190, 230, 1.1)
    if style == 0:
        junk(a, a.w - 240, a.h - 190, 1.3)
    # lanes: willow-pattern routes of three slots
    for li, (p, q) in enumerate(LANES):
        if (p, q) not in lanes:
            continue
        (xa, ya), (xb, yb) = P[p], P[q]
        dx, dy = xb - xa, yb - ya
        L = math.hypot(dx, dy)
        nx, ny = -dy / L, dx / L
        bow = 26 * (1 if li % 2 else -1)
        mx, my = (xa + xb) / 2 + nx * bow, (ya + yb) / 2 + ny * bow
        d = f"M{f(xa)},{f(ya)} Q{f(mx)},{f(my)} {f(xb)},{f(yb)}"
        a.path(d, fill="none", stroke=COB, stroke_width=13)
        a.path(d, fill="none", stroke=GLAZE, stroke_width=8)
        a.path(d, fill="none", stroke=COB2, stroke_width=8, stroke_dasharray="2 9")
        for t in (0.3, 0.5, 0.7):
            sx = (1 - t) ** 2 * xa + 2 * t * (1 - t) * mx + t * t * xb
            sy = (1 - t) ** 2 * ya + 2 * t * (1 - t) * my + t * t * yb
            a.circle(sx, sy, 19, fill=GLAZE, stroke=COB, stroke_width=3)
            a.circle(sx, sy, 13, fill="none", stroke=COB2, stroke_width=1, stroke_dasharray="2 3")
        kit.italic(a, mx + nx * 26, my + ny * 26 + 5, f"L{li + 1}", size=17, col=COB)
    for n in names:
        x, y = P[n]
        a.circle(x, y, 56, fill=GLAZE, stroke=COB, stroke_width=4)
        a.circle(x, y, 48, fill="none", stroke=COB, stroke_width=1.5)
        pagoda(a, x, y + 14, 0.9)
        tw = len(n) * 13 + 36
        a.rect(x - tw / 2, y + 62, tw, 28, rx=4, fill=GLAZE, stroke=COB, stroke_width=1.5)
        kit.smallcaps(a, x, y + 82, n, size=16, col=COB)
    return P


def trays(a):
    for x, lab in ((370, "Hymns"), (a.w - 790, "Chests")):
        a.rect(x, a.h - 196, 420, 70, rx=10, fill=GLAZE, stroke=COB, stroke_width=3)
        a.rect(x + 6, a.h - 190, 408, 58, rx=7, fill="none", stroke=COB2, stroke_width=1)
        kit.smallcaps(a, x + 210, a.h - 154, lab, size=17, col=WASH)


@asset(G, "tea-board-parlour", group="maps", title="The Tea Board: the tavern parlour board", w=1600, h=900, row=ROW)
def board_parlour(a: Art):
    """The parlour Tea Board in blue-and-white porcelain: four ports as pagodas (Home, Tidewater, Unwritten, Salt)
    joined by four willow-pattern lanes of three slots each, inside a beaded border, with a willow, doves and a junk."""
    board(a, ["Home", "Tidewater", "Unwritten", "Salt"], [LANES[0], LANES[1], LANES[2], LANES[4]], 0)


@asset(G, "tea-board-comptroller", group="maps", title="The Tea Board: the Comptroller's board", w=1600, h=900, row=ROW)
def board_comptroller(a: Art):
    """The Comptroller's Tea Board: six ports and their lanes in cobalt on white, key-fret bands above and below,
    reserves trays at the foot, and the willow-pattern bridge."""
    names = ["Home", "Tidewater", "Unwritten", "Salt", "Strait", "Spice"]
    board(a, names, [l for l in LANES if l[0] in names and l[1] in names], 1)
    trays(a)


@asset(G, "tea-board-final", group="maps", title="The Tea Board: the Lord of Tea's board", w=1600, h=900, row=ROW)
def board_final(a: Art):
    """The Lord of Tea's own board: all eight ports and twelve lanes, a fret and a beaded border, reserves trays,
    and a well at top right where the tide dial sits."""
    board(a, list(PORTS), LANES, 2)
    trays(a)
    a.circle(a.w - 190, 230, 96, fill=GLAZE, stroke=COB, stroke_width=4)
    a.circle(a.w - 190, 230, 84, fill="none", stroke=COB2, stroke_width=1.5, stroke_dasharray="3 5")
    kit.smallcaps(a, a.w - 190, 236, "Tide", size=18, col=WASH)


# ---- pieces ------------------------------------------------------------------------------------------
PW = 240


def tile(a):
    glaze(a, 0.7)
    a.rect(8, 8, PW - 16, PW - 16, fill="none", stroke=COB, stroke_width=3)
    beads(a, 18, 18, PW - 36, PW - 36, gap=11, r=2.5, col=COB2)
    a.ellipse(PW / 2 + 6, 176, 64, 14, fill=INK, opacity=0.2)


@asset(G, "piece-chest", group="pieces", title="Tea Board piece: Chest", w=PW, h=PW, row=ROW)
def piece_chest(a: Art):
    """A Company Chest: a small ink-blue tea chest with the leaf mark on its face, corded, lit from above."""
    tile(a)
    a.path("M60,92 L120,70 L180,92 L120,114Z", fill="#3a5796", stroke=INK, stroke_width=3, stroke_linejoin="round")
    a.path("M60,92 V150 L120,174 V114Z", fill=INK, stroke=INK, stroke_width=3, stroke_linejoin="round")
    a.path("M180,92 V150 L120,174 V114Z", fill="#16223a", stroke=INK, stroke_width=3, stroke_linejoin="round")
    a.path("M90,81 L150,103 M150,81 L90,103", stroke=LAMP, stroke_width=1.6, opacity=0.7)
    a.open("g", transform="matrix(1,0.4,0,1,90,140)")
    kit.company_mark(a, 0, 0, 16, col=LAMP, opacity=0.9, sw=2)
    a.close()
    a.path("M66,100 l48,20 M66,140 l48,20 M174,100 l-48,20 M174,140 l-48,20", stroke=WASH, stroke_width=1.2, opacity=0.7)
    a.path("M100,76 L160,98", stroke="#fff", stroke_width=2, opacity=0.5)


@asset(G, "piece-hymn", group="pieces", title="Tea Board piece: Hymn", w=PW, h=PW, row=ROW)
def piece_hymn(a: Art):
    """A Hymn: a pebble of sea-glass, frosted green, with a clockwise spiral worn into its face."""
    tile(a)
    pts = [(120 + (58 + 7 * math.sin(k * 1.9)) * math.cos(k * 0.698), 126 + (44 + 5 * math.sin(k * 2.7)) * math.sin(k * 0.698)) for k in range(9)]
    d = a.smooth_d(pts, closed=True)
    a.path(d, fill="#1f5246", transform="translate(0,8)")
    a.path(d, fill=a.radial([(0, "#cdeee2", 1), (0.6, "#7fbfa9", 1), (1, GREEN, 1)], 0.4, 0.3, 0.8), stroke="#1f5246", stroke_width=2.4)
    kit.spiral(a, 120, 126, 2, 30, 2.8, stroke="#1f5246", stroke_width=3.2, opacity=0.75)
    a.path("M82,104 q14,-22 44,-22", fill="none", stroke="#fff", stroke_width=5, stroke_linecap="round", opacity=0.75)
    a.stipple(70, 90, 100, 70, n=50, r=(0.5, 1.2), fill="#fff", opacity=0.6)


def debt_marker(a, cx, cy, s=1.0):
    rx, ry, th = 56 * s, 24 * s, 20 * s
    a.path(f"M{f(cx - rx)},{f(cy - th)} v{f(th)} a{f(rx)},{f(ry)} 0 0,0 {f(2 * rx)},0 v{f(-th)}z", fill="#dfe5f2", stroke=COB, stroke_width=2.8,
           stroke_linejoin="round")
    a.path(f"M{f(cx - rx)},{f(cy - th * 0.45)} a{f(rx)},{f(ry)} 0 0,0 {f(2 * rx)},0", fill="none", stroke=COB2, stroke_width=5, stroke_dasharray="2 7")
    a.ellipse(cx, cy - th, rx, ry, fill=GLAZE, stroke=COB, stroke_width=2.8)
    a.ellipse(cx, cy - th, rx * 0.84, ry * 0.82, fill="none", stroke=COB2, stroke_width=1.2, stroke_dasharray="2 4")
    a.ellipse(cx, cy - th, rx * 0.68, ry * 0.64, fill=RED, stroke="#5e1818", stroke_width=2)
    a.text(cx, cy - th + 7 * s, "Dr.", size=19 * s, family="serif", fill=LAMP, text_anchor="middle", font_style="italic")


@asset(G, "piece-debt", group="pieces", title="Tea Board piece: Debt", w=PW, h=PW, row=ROW)
def piece_debt(a: Art):
    """A Debt marker: a thick porcelain counter with a ledger-red centre marked Dr."""
    tile(a)
    debt_marker(a, 120, 160, 1.3)


@asset(G, "piece-named-debt", group="pieces", title="Tea Board piece: Named Debt", w=PW, h=PW, row=ROW)
def piece_named_debt(a: Art):
    """A Named Debt for the final match: the same red-centred counter with a paper label tied to it, a name from the
    toll written on the label."""
    tile(a)
    debt_marker(a, 108, 172, 1.05)
    a.path("M132,120 q30,-40 50,-58", fill="none", stroke=TEA, stroke_width=1.6)
    a.open("g", transform="rotate(-12 170 60)")
    a.path("M120,40 h96 v40 h-96 l-12,-20z", fill=LAMP, stroke=INK, stroke_width=1.6, stroke_linejoin="round")
    a.circle(122, 60, 3, fill=INK)
    a.text(170, 68, "Corran", size=22, family="serif", fill=kit.BLUEBLACK, text_anchor="middle", font_style="italic")
    a.close()


@asset(G, "piece-clause", group="pieces", title="Tea Board piece: Clause", w=PW, h=PW, row=ROW)
def piece_clause(a: Art):
    """A Clause token: a folded slip of vellum with one line underlined in red and a pin through it."""
    tile(a)
    a.open("g", transform="rotate(-8 120 124)")
    a.path("M56,84 h128 v82 h-128z", fill="#EBDDB8", stroke=TEA, stroke_width=1.6)
    a.path("M56,84 l64,30 l64,-30", fill="none", stroke=TEA, stroke_width=1.2, opacity=0.7)
    for j in range(3):
        kit.script(a, 70, 126 + j * 15, 100, size=0.7)
    a.path(a.wobble_d([(68, 147), (172, 147)], 0.8, 12), fill="none", stroke=RED, stroke_width=2.6)
    a.close()
    a.line(150, 96, 160, 112, stroke="#555", stroke_width=2)
    a.circle(150, 96, 8, fill=RED, stroke="#000", stroke_width=1)
    a.circle(147, 93, 2.4, fill="#fff", opacity=0.7)


@asset(G, "tea-board-crack", group="pieces", title="Tea Board: a cracked lane", w=640, h=240, row=ROW)
def crack(a: Art):
    """A lane of the porcelain board cracked by a second Stir in one High tide: a dark fracture runs through its
    three slots with hairlines either side and one chip gone, and it scores for no one."""
    glaze(a, 0.7)
    a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, WASH, gap=13, sw=1, wave=True, opacity=0.55))
    d = "M30,150 Q320,60 610,130"
    a.path(d, fill="none", stroke=COB, stroke_width=15)
    a.path(d, fill="none", stroke=GLAZE, stroke_width=9)
    a.path(d, fill="none", stroke=COB2, stroke_width=9, stroke_dasharray="2 9")
    for sx, sy in ((180, 116), (320, 104), (460, 110)):
        a.circle(sx, sy, 26, fill=GLAZE, stroke=COB, stroke_width=3.4)
    r = a.rng
    pts = [(0, 96)]
    while pts[-1][0] < a.w:
        x, y = pts[-1]
        pts.append((x + r.uniform(14, 34), 112 + r.uniform(-13, 13) + (x / a.w - 0.5) * 30))
    a.path(kit.pd(pts), fill="none", stroke="#000", stroke_width=5, opacity=0.2, transform="translate(2,3)", stroke_linejoin="bevel")
    a.path(kit.pd(pts), fill="none", stroke="#10182c", stroke_width=2.6, stroke_linejoin="bevel")
    for k in range(3, len(pts) - 2, 3):
        x, y = pts[k]
        hl = [(x, y)]
        for j in range(4):
            hl.append((hl[-1][0] + r.uniform(-12, 12), hl[-1][1] + (1 if k % 2 else -1) * r.uniform(6, 15)))
        a.path(kit.pd(hl), fill="none", stroke="#10182c", stroke_width=0.9, opacity=0.8)
    cx, cy = pts[7]
    a.path(f"M{f(cx)},{f(cy)} l22,-14 l14,10 l-8,20 l-20,2z", fill="#c9c2b2", stroke="#10182c", stroke_width=1.4)
    a.path(f"M{f(cx + 4)},{f(cy)} l16,-8 l8,8", fill="none", stroke="#fff", stroke_width=1.4)


@asset(G, "tide-dial", group="pieces", title="Tea Board: the tide dial", w=420, h=420, row=ROW)
def tide_dial(a: Art):
    """The tide clock as a porcelain dial: four phases of two rounds each, Low ruled, High in wave hatching, a pivot
    at the centre: the cobalt hand is the game's to turn, so the face carries none."""
    glaze(a, 0.7)
    c = 210
    a.circle(c, c, 196, fill=GLAZE, stroke=COB, stroke_width=6)
    beads(a, 0, 0, 0, 0)
    a.circle(c, c, 182, fill="none", stroke=COB, stroke_width=9, stroke_dasharray="0.1 14.3", stroke_linecap="round")
    a.circle(c, c, 166, fill="none", stroke=COB, stroke_width=2)
    fills = [kit.pattern(a, COB, gap=6, sw=1.6), None, kit.pattern(a, COB, gap=7, sw=1.8, wave=True), None]
    names = ["Low", "Rising", "High", "Falling"]
    for q in range(4):
        a0 = -180 + q * 90
        x0, y0 = c + 166 * math.cos(math.radians(a0)), c + 166 * math.sin(math.radians(a0))
        x1, y1 = c + 166 * math.cos(math.radians(a0 + 90)), c + 166 * math.sin(math.radians(a0 + 90))
        if fills[q]:
            a.path(f"M{c},{c} L{f(x0)},{f(y0)} A166,166 0 0,1 {f(x1)},{f(y1)}Z", fill=fills[q], opacity=0.55)
        a.line(c, c, x0, y0, stroke=COB, stroke_width=3)
        am = math.radians(a0 + 45)
        a.line(c + 150 * math.cos(am), c + 150 * math.sin(am), c + 166 * math.cos(am), c + 166 * math.sin(am), stroke=COB, stroke_width=2)
        for t in (22.5, 67.5):
            ar = math.radians(a0 + t)
            a.circle(c + 132 * math.cos(ar), c + 132 * math.sin(ar), 9, fill=GLAZE, stroke=COB, stroke_width=2.4)
        tx, ty = c + 84 * math.cos(am), c + 84 * math.sin(am)
        a.rect(tx - 52, ty - 16, 104, 30, rx=5, fill=GLAZE, stroke=COB, stroke_width=1.4)
        kit.smallcaps(a, tx, ty + 5, names[q], size=15, col=COB)
    a.path(a.smooth_d(kit.spiral_pts(c, c, 2, 20, 2.4)), fill="none", stroke=SEAINK, stroke_width=3)
    a.circle(c, c, 24, fill="none", stroke=COB, stroke_width=3)
    a.circle(c, c, 7, fill=INK)

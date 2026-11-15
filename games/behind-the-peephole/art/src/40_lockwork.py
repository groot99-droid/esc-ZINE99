"""Lockwork: five lock plates as patent exploded views. Fine ink line on cream, parts pulled apart along
dotted axes and numbered."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK = kit.INK
PP = "#f4eedd"
PART = "#f7f1e2"
ROW = "Lock plates (drawer, stair, wafer, safe, lever)"
AXIS = dict(stroke=INK, stroke_width=0.8, stroke_dasharray="2 5")


def cyl_v(a, x, y, w, h):
    ry = w * 0.22
    a.path(f"M{f(x)},{f(y)} V{f(y + h)} A{f(w / 2)},{f(ry)} 0 0,0 {f(x + w)},{f(y + h)} V{f(y)}", fill=PART, stroke=INK, stroke_width=1.1)
    a.ellipse(x + w / 2, y, w / 2, ry, fill=PART, stroke=INK, stroke_width=1.1)
    for k in range(5):
        xx = x + w * (0.62 + k * 0.08)
        a.line(xx, y + ry * 0.9, xx, y + h + ry * 0.6, stroke=INK, stroke_width=0.45)


def spring(a, x, y, w, h, turns=8):
    pts = [(x + (w if i % 2 else 0), y + h * i / (2 * turns)) for i in range(2 * turns + 1)]
    a.poly(pts, closed=False, fill="none", stroke=INK, stroke_width=1)


def leader(a, x1, y1, x2, y2, num):
    a.path(f"M{f(x1)},{f(y1)} Q{f((x1 + x2) / 2 + 12)},{f(y1)} {f(x2)},{f(y2)}", fill="none", stroke=INK, stroke_width=0.6)
    a.text(x1 + (-6 if x1 < x2 else 6), y1 + 5, str(num), size=17, family="serif", fill=INK,
           text_anchor="end" if x1 < x2 else "start", font_style="italic")


def cyl_h(a, x0, x1, cy, r, shade=11):
    a.path(f"M{x0},{cy - r} H{x1} A{r * 0.35},{r} 0 0,1 {x1},{cy + r} H{x0}", fill=PART, stroke=INK, stroke_width=1.6)
    a.ellipse(x0, cy, r * 0.35, r, fill=PART, stroke=INK, stroke_width=1.6)
    for k in range(1, shade + 1):
        t = k / (shade + 1)
        y = cy + r * math.sin(t * math.pi / 2)
        a.line(x0 + r * 0.3, y, x1 + r * 0.35 * math.cos(t * math.pi / 2) - 4, y, stroke=INK, stroke_width=0.45)


def hatched(a, x, y, w, h, rx=0, angle=60, spacing=7):
    a.rect(x, y, w, h, rx=rx, fill=PART, stroke=INK, stroke_width=1.6)
    a.hatch(x, y, w, h, angle=angle, spacing=spacing, stroke=INK, stroke_width=0.35,
            clip=a.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="{rx}"/>'))


def gauge(a, lo, hi, at, gx=92, gy0=170, gy1=690):
    a.rect(gx - 14, gy0, 28, gy1 - gy0, fill=PART, stroke=INK, stroke_width=1.3)
    for v in range(0, 101, 5):
        y = gy1 - (gy1 - gy0) * v / 100
        L = 14 if v % 25 == 0 else 7
        a.line(gx + 14, y, gx + 14 + L, y, stroke=INK, stroke_width=0.8)
        if v % 25 == 0:
            a.text(gx + 34, y + 5, str(v), size=13, family="serif", fill=INK)
    b0, b1 = gy1 - (gy1 - gy0) * hi / 100, gy1 - (gy1 - gy0) * lo / 100
    a.hatch(gx - 14, b0, 28, b1 - b0, angle=45, spacing=4, stroke=INK, stroke_width=0.6,
            clip=a.clip(f'<rect x="{gx - 14}" y="{f(b0)}" width="28" height="{f(b1 - b0)}"/>'))
    n = gy1 - (gy1 - gy0) * at / 100
    a.poly([(gx - 30, n - 7), (gx - 16, n), (gx - 30, n + 7)], fill=INK)
    a.text(gx, gy0 - 14, "TENSION", size=12, family="serif", fill=INK, text_anchor="middle", letter_spacing=2)


def sheet(a, n, name, note):
    a.paper(PP, grain=0.18, fibre=1.2)
    a.rect(22, 22, a.w - 44, a.h - 44, fill="none", stroke=INK, stroke_width=1.2)
    a.text(600, 60, f"Sheet {n} of 5", size=18, family="serif", fill=INK, text_anchor="middle")
    a.text(600, 96, f"FIG. {n}", size=30, family="serif", fill=INK, text_anchor="middle", font_style="italic", letter_spacing=4)
    a.text(a.w - 50, a.h - 68, name, size=22, family="serif", fill=INK, text_anchor="end", font_style="italic")
    a.text(a.w - 50, a.h - 44, note, size=15, family="serif", fill=INK, text_anchor="end")


def pin_stack(a, x, top, kl, spool=False, lift=0):
    spring(a, x - 9, top - 60, 18, 46)
    if spool:
        a.path(f"M{x - 13},{top} h26 v8 h-6 v18 h6 v10 h-26 v-10 h6 v-18 h-6 z", fill=PART, stroke=INK, stroke_width=1.1)
    else:
        cyl_v(a, x - 12, top + lift * 0.4, 24, 34)
    ky = top + 52 + lift
    a.path(f"M{x - 11},{ky} V{ky + kl} L{x},{ky + kl + 12} L{x + 11},{ky + kl} V{ky}", fill=PART, stroke=INK, stroke_width=1.1)
    a.ellipse(x, ky, 11, 3, fill=PART, stroke=INK, stroke_width=1.1)
    for k in range(3):
        a.line(x + 3 + k * 3, ky + 3, x + 3 + k * 3, ky + kl - 2, stroke=INK, stroke_width=0.4)


def tumbler(a, pins, spools, binding, hx, hw, plug_y=520):
    hy, hh, pr = 150, 120, 56
    a.path(f"M{hx},{hy + hh} V{hy + 30} Q{hx},{hy} {hx + 30},{hy} H{hx + hw - 30} Q{hx + hw},{hy} {hx + hw},{hy + 30} V{hy + hh}Z",
           fill=PART, stroke=INK, stroke_width=1.6)
    a.hatch(hx, hy, hw, hh, angle=60, spacing=7, stroke=INK, stroke_width=0.35,
            clip=a.clip(f'<rect x="{hx}" y="{hy}" width="{hw}" height="{hh}" rx="30"/>'))
    step = (hw - 140) / max(1, pins - 1)
    xs = [hx + 70 + i * step for i in range(pins)]
    for x in xs:
        a.rect(x - 14, hy + 12, 28, hh - 12, fill=PP, stroke=INK, stroke_width=1)
        a.line(x, 112, x, plug_y - 30, **AXIS)
    cyl_h(a, hx, hx + hw + 20, plug_y, pr)
    a.path(f"M{hx - 8},{plug_y - 8} H{hx + hw - 20} L{hx + hw},{plug_y + 8} H{hx - 8}", fill="none", stroke=INK, stroke_width=0.8)
    for x in xs:
        a.ellipse(x, plug_y - pr + 2, 13, 4, fill=PP, stroke=INK, stroke_width=0.8)
    a.line(hx - 60, plug_y - pr - 2, hx + hw + 70, plug_y - pr - 2, stroke=INK, stroke_width=1, stroke_dasharray="16 4 3 4")
    a.text(hx + hw + 76, plug_y - pr + 4, "S", size=18, family="serif", fill=INK, font_style="italic")
    lens = [52, 38, 60, 44, 30]
    for i, x in enumerate(xs):
        pin_stack(a, x, 352, lens[(i * 2 + pins) % 5], spool=i in spools, lift=-38 if i == binding else 0)
    return xs, pr


@asset(G, "lock-drawer", group="maps", title="Lock plate: the desk drawer, three pins", w=1200, h=800, row=ROW)
def drawer(a: Art):
    """Patent plate of the desk drawer's three-pin tumbler, pulled apart along dotted axes: shell, springs, driver
    and key pins, plug, the hook pick under the first binding pin, and the drawer front with its escutcheon."""
    sheet(a, 1, "The desk drawer", "pin tumbler, three pins; band 20 to 70")
    xs, pr = tumbler(a, 3, (), 0, 420, 420)
    gauge(a, 20, 70, 44)
    # drawer front, in elevation at the left of the plug
    hatched(a, 190, 440, 150, 170, rx=4, angle=0, spacing=9)
    a.circle(265, 520, 30, fill=PART, stroke=INK, stroke_width=1.4)
    a.path("M265,506 a8,8 0 1,1 0.1,0 M259,520 L255,542 H275 L271,520", fill=PP, stroke=INK, stroke_width=1.1)
    a.line(340, 520, 420, 520, **AXIS)
    bx = xs[0]
    a.path(f"M1150,540 H{bx + 40} Q{bx + 14},540 {bx + 10},514 Q{bx + 8},502 {bx},494", fill="none", stroke=INK, stroke_width=5, stroke_linecap="round")
    a.path(f"M400,550 V660 H680", fill="none", stroke=INK, stroke_width=6, stroke_linejoin="round")
    a.path(f"M400,550 V660 H680", fill="none", stroke=PART, stroke_width=2, stroke_linejoin="round")
    a.path(f"M{bx + 30},470 C{bx + 50},440 {bx + 50},400 {bx + 26},378", fill="none", stroke=INK, stroke_width=1.4)
    a.poly([(bx + 26, 370), (bx + 20, 384), (bx + 33, 382)], fill=INK)
    leader(a, 370, 175, 424, 200, 10)
    leader(a, 400, 308, xs[0] - 10, 316, 12)
    leader(a, 960, 380, xs[2] + 14, 372, 14)
    leader(a, 960, 440, xs[2] + 12, 430, 16)
    leader(a, 960, 610, 860, 560, 20)
    leader(a, 230, 410, 250, 442, 30)
    leader(a, 720, 700, 660, 662, 24)


@asset(G, "lock-stair", group="maps", title="Lock plate: the stair door, five pins, two spools", w=1200, h=800, row=ROW)
def stair(a: Art):
    """Patent plate of the stair door's five-pin tumbler with two spool pins, exploded and numbered, with an end view
    of the plug turned five degrees into a false set."""
    sheet(a, 2, "The stair door", "five pins, two spools; band 35 to 55")
    xs, pr = tumbler(a, 5, (1, 3), 2, 290, 600)
    gauge(a, 35, 55, 46)
    bx = xs[2]
    a.path(f"M1160,540 H{bx + 40} Q{bx + 14},540 {bx + 10},514 Q{bx + 8},502 {bx},494", fill="none", stroke=INK, stroke_width=5, stroke_linecap="round")
    a.path("M270,550 V660 H560", fill="none", stroke=INK, stroke_width=6, stroke_linejoin="round")
    a.path("M270,550 V660 H560", fill="none", stroke=PART, stroke_width=2, stroke_linejoin="round")
    # end view: plug in shell, rotated 5 degrees
    ex, ey = 720, 656
    a.circle(ex, ey, 64, fill=PART, stroke=INK, stroke_width=1.6)
    a.hatch(ex - 64, ey - 64, 128, 128, angle=60, spacing=6, stroke=INK, stroke_width=0.35, clip=a.clip(f'<circle cx="{ex}" cy="{ey}" r="64"/>'))
    a.circle(ex, ey, 40, fill=PP, stroke=INK, stroke_width=1.4)
    a.open("g", transform=f"rotate(5 {ex} {ey})")
    a.rect(ex - 5, ey - 30, 10, 60, fill=PART, stroke=INK, stroke_width=1)
    a.close()
    a.line(ex, ey - 84, ex, ey + 84, **AXIS)
    a.path(f"M{ex},{ey - 76} A76,76 0 0,1 {f(ex + 76 * math.sin(math.radians(14)))},{f(ey - 76 * math.cos(math.radians(14)))}", fill="none", stroke=INK, stroke_width=1.2)
    a.text(ex + 30, ey - 80, "5°", size=16, family="serif", fill=INK, font_style="italic")
    a.text(ex, ey + 104, "FIG. 2a", size=15, family="serif", fill=INK, text_anchor="middle", font_style="italic")
    leader(a, 240, 175, 296, 200, 10)
    leader(a, 250, 308, xs[0] - 10, 316, 12)
    leader(a, xs[3] + 60, 340, xs[3] + 14, 366, 16)
    leader(a, xs[1] - 60, 384, xs[1] - 14, 372, 16)
    leader(a, 1000, 470, 930, 500, 20)
    leader(a, 600, 700, 540, 662, 24)
    leader(a, 830, 600, 772, 620, 32)


@asset(G, "lock-wafer", group="maps", title="Lock plate: lost property, five wafers and the jiggler ring", w=1200, h=800, row=ROW)
def wafer(a: Art):
    """Patent plate of the lost-property cabinet's wafer lock: five flat wafers drawn out of the plug at their depths, a
    ring of eight jiggler keys fanned beside it, and a blank with a file."""
    sheet(a, 3, "Lost property", "wafer lock, five wafers; ten insertions")
    cyl_h(a, 230, 700, 300, 60)
    a.path("M222,292 H690 L706,308 H222", fill="none", stroke=INK, stroke_width=0.8)
    xs = [300 + i * 82 for i in range(5)]
    depth = [2, 4, 1, 3, 2]
    for i, x in enumerate(xs):
        a.rect(x - 6, 240, 12, 12, fill=PP, stroke=INK, stroke_width=0.8)
        a.line(x, 130, x, 250, **AXIS)
        y = 150 + (4 - depth[i]) * 6
        a.rect(x - 22, y, 44, 62, rx=3, fill=PART, stroke=INK, stroke_width=1.2)
        a.rect(x - 10, y + 14 + depth[i] * 4, 20, 22, fill=PP, stroke=INK, stroke_width=0.9)
        a.rect(x + 22, y + 22, 7, 14, fill=PART, stroke=INK, stroke_width=0.9)
        for k in range(3):
            a.line(x + 12 + k * 3, y + 4, x + 12 + k * 3, y + 58, stroke=INK, stroke_width=0.4)
        a.text(x, 128, str(depth[i]) if i in (0, 3) else "?", size=17, family="serif", fill=INK, text_anchor="middle", font_style="italic")
    # the jiggler ring: eight keys fanned on a split ring
    rx, ry = 880, 330
    a.circle(rx, ry, 46, fill="none", stroke=INK, stroke_width=3)
    a.circle(rx, ry, 41, fill="none", stroke=INK, stroke_width=0.6)
    r = a.rng
    for k in range(8):
        ang = -200 + k * 32
        a.open("g", transform=f"rotate({ang} {rx} {ry})")
        a.circle(rx + 62, ry, 20, fill=PART, stroke=INK, stroke_width=1.2)
        a.circle(rx + 52, ry, 6, fill=PP, stroke=INK, stroke_width=0.9)
        cuts = [r.randint(1, 4) for _ in range(5)]
        d = f"M{rx + 80},{ry - 9} H{rx + 190} L{rx + 198},{ry} "
        for j, c in enumerate(reversed(cuts)):
            xx = rx + 186 - j * 20
            d += f"L{xx},{ry + 9 - c * 2.4} L{xx - 10},{ry + 9 - c * 2.4} L{xx - 14},{ry + 9} "
        d += f"H{rx + 80}Z"
        a.path(d, fill=PART, stroke=INK, stroke_width=1.1)
        a.line(rx + 84, ry - 3, rx + 188, ry - 3, stroke=INK, stroke_width=0.4)
        a.close()
    # the key in the lock, rocking; clicks counted
    a.path("M706,300 H770 L790,290 V310 L770,300", fill=PART, stroke=INK, stroke_width=1.2)
    a.path("M140,300 h70", **AXIS)
    for k in range(3):
        a.path(f"M{200 - k * 14},{270} q-10,30 0,60", fill="none", stroke=INK, stroke_width=1)
    # blank and file
    a.path("M250,560 h150 l10,10 l-10,10 h-150 Z", fill=PART, stroke=INK, stroke_width=1.2)
    a.circle(226, 570, 24, fill=PART, stroke=INK, stroke_width=1.2)
    a.circle(214, 570, 7, fill=PP, stroke=INK, stroke_width=0.9)
    a.poly([(470, 640), (760, 600), (764, 614), (474, 660)], fill=PART, stroke=INK, stroke_width=1.2)
    a.hatch(470, 596, 300, 70, angle=40, spacing=5, stroke=INK, stroke_width=0.5, clip=a.clip('<polygon points="470,640 760,600 764,614 474,660"/>'))
    a.poly([(400, 652), (470, 640), (474, 660), (404, 672)], fill=INK)
    # the clicks dial: 0 to 5
    for k in range(6):
        a.circle(260 + k * 40, 700, 12, fill=INK if k < 3 else PART, stroke=INK, stroke_width=1.2)
    a.text(510, 706, "clicks: three of five", size=17, family="serif", fill=INK, font_style="italic")
    leader(a, 180, 230, 240, 262, 40)
    leader(a, 760, 170, xs[4] + 26, 186, 42)
    leader(a, 1040, 200, 990, 250, 44)
    leader(a, 180, 520, 220, 548, 46)
    leader(a, 820, 640, 760, 606, 48)


@asset(G, "lock-safe", group="maps", title="Lock plate: the back-office safe, three wheels", w=1200, h=800, row=ROW)
def safe(a: Art):
    """Patent plate of the back-office safe: the numbered dial, spindle and three gated wheels drawn apart on one
    dotted axis, the fence above waiting for the gates, and a strip of graph paper plotting the contact points."""
    sheet(a, 4, "The back-office safe", "dial 0 to 99, three numbers; sweep between rings")
    cy = 330
    a.line(90, cy, 1130, cy, **AXIS)
    # dial, face on
    dx = 230
    a.circle(dx, cy, 128, fill=PART, stroke=INK, stroke_width=1.8)
    a.circle(dx, cy, 100, fill=PP, stroke=INK, stroke_width=1)
    d = []
    for k in range(100):
        t = math.radians(k * 3.6 - 90)
        L = 14 if k % 10 == 0 else (9 if k % 5 == 0 else 5)
        d.append(f"M{f(dx + 126 * math.cos(t))},{f(cy + 126 * math.sin(t))}L{f(dx + (126 - L) * math.cos(t))},{f(cy + (126 - L) * math.sin(t))}")
        if k % 10 == 0:
            a.text(dx + 86 * math.cos(t), cy + 86 * math.sin(t) + 5, str(k), size=14, family="serif", fill=INK, text_anchor="middle")
    a.path("".join(d), stroke=INK, stroke_width=0.9, fill="none")
    a.circle(dx, cy, 44, fill=PART, stroke=INK, stroke_width=1.4)
    for k in range(24):
        t = math.radians(k * 15)
        a.line(dx + 36 * math.cos(t), cy + 36 * math.sin(t), dx + 44 * math.cos(t), cy + 44 * math.sin(t), stroke=INK, stroke_width=0.8)
    a.poly([(dx - 8, cy - 150), (dx + 8, cy - 150), (dx, cy - 132)], fill=INK)
    # spindle
    a.rect(360, cy - 7, 110, 14, fill=PART, stroke=INK, stroke_width=1.1)
    # three wheels, in perspective as ellipses with a gate each
    for i, wx in enumerate((560, 720, 880)):
        a.ellipse(wx, cy, 34, 104, fill=PART, stroke=INK, stroke_width=1.5)
        a.ellipse(wx + 10, cy, 34, 104, fill=PART, stroke=INK, stroke_width=1.5)
        a.ellipse(wx + 10, cy, 9, 26, fill=PP, stroke=INK, stroke_width=1)
        ga = math.radians([-78, -36, -110][i])
        gx_, gy_ = wx + 10 + 34 * math.cos(ga), cy + 104 * math.sin(ga)
        a.rect(gx_ - 8, gy_ - 6, 16, 22, fill=PP, stroke=INK, stroke_width=1)
        for k in range(4):
            a.path(f"M{wx + 18 + k * 5},{cy - 96 + k * 6} q14,96 0,{192 - k * 12}", fill="none", stroke=INK, stroke_width=0.4)
        a.circle(wx + 10 + 20 * math.cos(ga + 2), cy + 60 * math.sin(ga + 2), 4, fill=INK)   # drive pin
        a.text(wx + 10, cy + 136, ["I", "II", "III"][i], size=18, family="serif", fill=INK, text_anchor="middle", font_style="italic")
    # the fence and lever above the wheels
    a.path("M520,180 H930 V196 H520 Z", fill=PART, stroke=INK, stroke_width=1.3)
    a.path("M930,172 H1040 L1060,204 H930 Z", fill=PART, stroke=INK, stroke_width=1.3)
    a.circle(1040, 190, 6, fill=PP, stroke=INK, stroke_width=1)
    for wx in (570, 730, 890):
        a.line(wx, 196, wx, 226, **AXIS)
    # the handle
    a.circle(1050, cy + 40, 30, fill=PART, stroke=INK, stroke_width=1.4)
    a.path(f"M1050,{cy + 40} L1120,{cy + 110}", stroke=INK, stroke_width=9, stroke_linecap="round")
    a.path(f"M1050,{cy + 40} L1120,{cy + 110}", stroke=PART, stroke_width=4, stroke_linecap="round")
    # the graph paper: gaps between contact points at the ten test positions
    gx0, gy0, gw, gh = 150, 540, 560, 180
    a.rect(gx0, gy0, gw, gh, fill="#f9f6ec", stroke=INK, stroke_width=1)
    a.grid(gx0, gy0, gw, gh, 14, stroke="#7fa08a", stroke_width=0.4)
    vals = [0.5, 0.2, 0.55, 0.6, 0.5, 0.62, 0.58, 0.52, 0.6, 0.56]
    vals[1], vals[2] = 0.16, 0.22
    pts = [(gx0 + 28 + i * 56, gy0 + gh - 20 - v * 130) for i, v in enumerate(vals)]
    a.wobble(pts, amp=0.8, step=30, stroke=kit.CARBON, stroke_width=1.6)
    for i, (x, y) in enumerate(pts):
        a.circle(x, y, 3.5, fill=kit.CARBON)
        a.text(x, gy0 + gh + 18, str(i * 10), size=12, family="monospace", fill=INK, text_anchor="middle")
    a.circle(pts[1][0], pts[1][1], 12, fill="none", stroke=kit.CARBON, stroke_width=1.2)
    a.text(gx0, gy0 - 10, "gap between contact points, by test number", size=15, family="serif", fill=INK, font_style="italic")
    # bells over the dial
    kit.bell(a, 820, 600, 60, fill=PART, stroke=INK)
    for k in (1, 2, 3):
        a.path(f"M{820 - 36 - k * 11},584 q-8,16 0,32 M{820 + 36 + k * 11},584 q8,16 0,32", fill="none", stroke=INK, stroke_width=1)
    a.text(820, 676, "each ring masks the clicks: three seconds", size=15, family="serif", fill=INK, text_anchor="middle", font_style="italic")
    leader(a, 110, 190, 150, 240, 50)
    leader(a, 420, 290, 410, 322, 52)
    leader(a, 500, 250, 548, 280, 54)
    leader(a, 980, 250, 892, 232, 56)
    leader(a, 480, 150, 540, 182, 58)
    leader(a, 1130, 300, 1070, 350, 60)


@asset(G, "lock-lever", group="maps", title="Lock plate: your own door, two levers, worked from the wrong side", w=1200, h=800, row=ROW)
def lever(a: Art):
    """Patent plate of the lever lock in the office door: the case opened, two levers lifted toward the gate while the
    bolt is thrown, the key drawn apart on its axis, and above the keyhole the brass rose, which goes dark when someone looks in."""
    sheet(a, 5, "The office door", "lever lock, two levers; work only while the rose is lit")
    # the door edge and the rose, 20 cm above the keyhole
    a.rect(120, 130, 190, 590, fill=PART, stroke=INK, stroke_width=1.6)
    a.hatch(120, 130, 190, 590, angle=88, spacing=11, stroke=INK, stroke_width=0.3, clip=a.clip('<rect x="120" y="130" width="190" height="590"/>'), jitter=3)
    kit.rose(a, 215, 300, 34, lit=None, flat=PART)
    a.circle(215, 300, 34 * 0.62, fill="none", stroke=INK, stroke_width=1.2)
    for k in range(8):
        t = 2 * math.pi * k / 8 - math.pi / 2
        a.circle(215 + 21 * math.cos(t), 300 + 21 * math.sin(t), 12.2, fill="none", stroke=INK, stroke_width=1)
    a.circle(215, 300, 9, fill=INK)
    a.path("M215,520 a11,11 0 1,1 0.1,0 M208,538 L203,574 H227 L222,538", fill=PP, stroke=INK, stroke_width=1.3)
    a.circle(215, 531, 11, fill=INK)
    a.poly([(208, 538), (203, 574), (227, 574), (222, 538)], fill=INK)
    a.line(96, 300, 96, 531, stroke=INK, stroke_width=0.9)
    for yy in (300, 531):
        a.line(88, yy + 5, 104, yy - 5, stroke=INK, stroke_width=1.4)
        a.line(96, yy, 180, yy, stroke=INK, stroke_width=0.4)
    a.text(84, 420, "200", size=13, family="serif", fill=INK, text_anchor="middle", transform="rotate(-90 84 420)")
    # the lock case, opened, drawn out to the right along the keyhole axis
    a.line(240, 531, 1130, 531, **AXIS)
    cx0, cy0 = 430, 330
    a.rect(cx0, cy0, 400, 330, rx=6, fill=PART, stroke=INK, stroke_width=1.8)
    a.rect(cx0 + 8, cy0 + 8, 384, 314, rx=3, fill=PP, stroke=INK, stroke_width=0.6)
    # the bolt, thrown to the left, with its stump
    a.rect(cx0 - 70, cy0 + 40, 300, 54, fill=PART, stroke=INK, stroke_width=1.5)
    a.hatch(cx0 - 70, cy0 + 40, 70, 54, angle=45, spacing=5, stroke=INK, stroke_width=0.4, clip=a.clip(f'<rect x="{cx0 - 70}" y="{cy0 + 40}" width="70" height="54"/>'))
    a.rect(cx0 + 150, cy0 + 94, 20, 30, fill=INK)
    # two levers, pivoted at the right, each with a gate; one lifted, one not yet
    for i, lift in enumerate((-9, 0)):
        px, py = cx0 + 350, cy0 + 150 + i * 26
        a.open("g", transform=f"rotate({lift} {px} {py})")
        d = (f"M{px + 14},{py - 22} H{cx0 + 60} Q{cx0 + 40},{py + 30} {cx0 + 70},{py + 78} H{px - 40} Q{px + 20},{py + 60} {px + 14},{py - 22}Z")
        a.path(d, fill=PART, stroke=INK, stroke_width=1.3, opacity=0.96)
        a.path(f"M{cx0 + 130},{py - 4} h90 v18 h-36 v22 h-18 v-22 h-36 Z", fill=PP, stroke=INK, stroke_width=1)
        a.circle(px, py, 6, fill=PP, stroke=INK, stroke_width=1)
        for k in range(4):
            a.line(cx0 + 90 + k * 60, py + 62 + k * 0, cx0 + 120 + k * 60, py + 70, stroke=INK, stroke_width=0.4)
        a.close()
        a.path(f"M{px + 30},{py - 20} q22,30 6,62", fill="none", stroke=INK, stroke_width=1.1)   # leaf spring
    # arrows: lift
    a.path(f"M{cx0 + 100},{cy0 + 300} C{cx0 + 80},{cy0 + 270} {cx0 + 84},{cy0 + 250} {cx0 + 100},{cy0 + 236}", fill="none", stroke=INK, stroke_width=1.4)
    a.poly([(cx0 + 104, cy0 + 228), (cx0 + 92, cy0 + 240), (cx0 + 106, cy0 + 244)], fill=INK)
    # keyhole in the case
    a.circle(cx0 + 200, 531 + 60, 16, fill=PP, stroke=INK, stroke_width=1.2)
    # the key, further right on the axis: bow, shank, two-step bit
    kx = 900
    a.ellipse(kx + 190, 531, 34, 44, fill=PART, stroke=INK, stroke_width=1.5)
    a.ellipse(kx + 190, 531, 18, 26, fill=PP, stroke=INK, stroke_width=1)
    a.rect(kx, 524, 160, 14, fill=PART, stroke=INK, stroke_width=1.3)
    a.path(f"M{kx + 6},538 v40 h18 v-12 h14 v12 h18 v-40", fill=PART, stroke=INK, stroke_width=1.3)
    for k in range(4):
        a.line(kx + 10 + k * 36, 534, kx + 36 + k * 36, 534, stroke=INK, stroke_width=0.4)
    # the wrong side: an eye mark at the rose
    a.path("M330,300 q40,-30 80,0 q-40,30 -80,0Z", fill=PP, stroke=INK, stroke_width=1.1)
    a.circle(370, 300, 10, fill=INK)
    a.line(256, 300, 326, 300, **AXIS)
    a.text(330, 262, "while dark: freeze", size=15, family="serif", fill=INK, font_style="italic")
    leader(a, 380, 190, 250, 280, 70)
    leader(a, 360, 600, 232, 560, 72)
    leader(a, 900, 300, 834, 350, 74)
    leader(a, 380, 470, cx0 - 40, 424, 76)
    leader(a, 900, 430, cx0 + 300, cy0 + 150, 78)
    leader(a, 900, 470, cx0 + 310, cy0 + 196, 78)
    leader(a, 1010, 640, 960, 580, 80)

"""A Journey Into the Heartstream gameplay pictographs. Built by tools/pictographs/build.py."""
import math

from core import H, W, Pic, f, register

G = "heartstream"

# palette (DESIGN.md section 15)
MARROW, MARROW2, GLOW = "#1E3557", "#2F5D8C", "#7FB2E0"
DEEP, RIVER, HILITE = "#7A1020", "#B3202E", "#E0603A"
GOLD, BONE = "#F2B544", "#E8DCC4"


# ---- shared helpers ---------------------------------------------------------------------------
def hand_d(cx, cy, s=1.0, rot=0.0, spread=1.0):
    """Path data for an open hand (palm and five fingers), for stencils and gestures."""
    a0 = math.radians(rot)
    parts = []

    def pt(x, y):
        return (cx + (x * math.cos(a0) - y * math.sin(a0)) * s, cy + (x * math.sin(a0) + y * math.cos(a0)) * s)

    # palm
    palm = [pt(math.cos(t) * 26, math.sin(t) * 30 + 8) for t in [i * math.pi / 10 for i in range(20)]]
    parts.append("M" + " L".join(f"{f(x)},{f(y)}" for x, y in palm) + "Z")
    fingers = [(-30, 52, -38 * spread, 0.85), (-13, 72, -12 * spread, 1.0), (4, 76, 2, 1.05),
               (20, 68, 14 * spread, 0.95), (36, 40, 52 * spread, 0.8)]
    for (bx, ln, ang, wd) in fingers:
        a = math.radians(ang - 90)
        ux, uy = math.cos(a), math.sin(a)
        nx, ny = -uy, ux
        w = 7.5 * wd
        base = (bx * 0.75, -12 if abs(bx) < 30 else 6)
        q = [(base[0] + nx * w, base[1] + ny * w), (base[0] + ux * ln + nx * w, base[1] + uy * ln + ny * w),
             (base[0] + ux * (ln + w) , base[1] + uy * (ln + w)),
             (base[0] + ux * ln - nx * w, base[1] + uy * ln - ny * w), (base[0] - nx * w, base[1] - ny * w)]
        q = [pt(x, y) for x, y in q]
        parts.append("M" + " L".join(f"{f(x)},{f(y)}" for x, y in q) + "Z")
    return " ".join(parts)


def grain_lines(p, x, y, w, h, n, color, opacity, amp=3.0, sw=0.8):
    """Long wavy parallel lines: wood grain for a printing block, or grain in bone."""
    for i in range(n):
        yy = y + h * (i + p.rng.random() * 0.6) / n
        pts = []
        ph = p.rng.uniform(0, 6.3)
        k = p.rng.uniform(0.004, 0.012)
        for xx in range(int(x), int(x + w) + 40, 40):
            pts.append((xx, yy + amp * math.sin(xx * k + ph) + p.rng.uniform(-0.6, 0.6)))
        p.path(p.smooth_d(pts), fill="none", stroke=color, stroke_width=sw, opacity=opacity)


# ---- 2D: river section (woodblock wave print) --------------------------------------------------
@register(G, "river-section")
def river_section(p: Pic):
    """River section (2D): the raft drifts left to right along the surface of the blood river, cut as a
    woodblock print. Four brothers row on the beat; one lifts his oar as a glowing tendril rises
    beneath him, glass-lantern cells drift toward a splash, and far below an immune beast's single eye
    begins to open, so the river is about to hush. A thin vessel line at the top carries the raft's
    glyph toward a small heart."""
    key = "#2a0a10"
    SURF = 280
    # bokashi sky inside the artery: carmine down to a pale salmon at the surface
    p.rect(0, 0, W, SURF, fill=p.gradient([(0, DEEP), (0.55, RIVER), (1, "#f0b08a")]))
    # artery wall folds hanging from the top, flat colour with a keyline
    pts = [(0, 0)]
    x = 0
    while x < W:
        x2 = x + p.rng.uniform(90, 160)
        pts += [(x + (x2 - x) * 0.5, 70 + p.rng.uniform(0, 40)), (x2, 40)]
        x = x2
    pts += [(W, 0)]
    p.path(p.smooth_d(pts[1:-1]) + f" L{W},0 L0,0Z", fill=DEEP, stroke=key, stroke_width=4)
    # the low valve fold ahead (bow-down to pass under)
    p.path("M900,0 C905,120 930,190 975,205 C1020,190 1040,120 1045,0Z", fill=DEEP, stroke=key, stroke_width=5)
    for i in range(5):
        p.path(f"M{915 + i * 25},20 C{920 + i * 25},110 {935 + i * 20},160 {960 + i * 6},185",
               fill="none", stroke=HILITE, stroke_width=2, opacity=0.6)
    # wood grain over the sky block
    grain_lines(p, 0, 0, W, SURF, 22, key, 0.12, amp=4)

    # below the surface: flat bands, darker with depth
    bands = [(SURF, RIVER), (420, "#981a28"), (560, DEEP), (690, "#5a0b17")]
    for i, (y0, c) in enumerate(bands):
        y1 = bands[i + 1][0] if i + 1 < len(bands) else H
        top = [(xx, y0 + 10 * math.sin(xx * 0.012 + i)) for xx in range(-40, W + 80, 60)]
        p.path(p.smooth_d(top) + f" L{W + 40},{H} L-40,{H}Z", fill=c)
    # carved current lines: long gouged curves in a pale tint
    for j in range(16):
        y0 = SURF + 40 + j * 30 + p.rng.uniform(-6, 6)
        x0 = p.rng.uniform(-100, 600)
        ln = p.rng.uniform(240, 520)
        pts = [(x0 + t * ln / 6, y0 + 8 * math.sin(t * 1.1 + j)) for t in range(7)]
        p.path(p.smooth_d(pts), fill="none", stroke=HILITE if j < 8 else RIVER, stroke_width=3,
               stroke_linecap="round", opacity=0.55)
        p.path(p.smooth_d([(x + 700, y + 14) for x, y in pts]), fill="none", stroke=HILITE, stroke_width=2,
               stroke_linecap="round", opacity=0.35)

    # immune beast at the bottom: one dark carved shape, a single eye opening
    p.path("M150,800 C180,690 330,640 520,650 C700,660 840,700 900,800Z", fill="#3d0610", stroke=key, stroke_width=5)
    for i in range(7):
        p.path(f"M{230 + i * 85},{705 - (i % 3) * 6} q30,-18 60,0", fill="none", stroke="#6a1020", stroke_width=3)
    p.path("M470,705 Q520,672 570,705 Q520,724 470,705Z", fill=GOLD, stroke=key, stroke_width=4)
    p.ellipse(520, 704, 9, 12, fill=key)
    p.path("M470,705 Q520,684 570,705", fill="none", stroke=key, stroke_width=6)  # heavy lid, half open
    for i, r in enumerate((60, 95, 130)):
        p.path(f"M{520 - r},{704 - r * 0.25} Q520,{704 - r * 0.9} {520 + r},{704 - r * 0.25}", fill="none",
               stroke=GOLD, stroke_width=2, opacity=0.5 - i * 0.13, stroke_dasharray="10 8")

    # tendrils: silk lines rising, one about to break the surface, tip glowing (the tell)
    tendrils = [(470, 430, 0.0), (300, 560, 0.0), (760, 520, 0.0), (612, SURF + 18, 1.0)]
    for bx, top, hot in tendrils:
        pts = []
        for k in range(9):
            t = k / 8
            yy = H - (H - top) * t
            pts.append((bx + 26 * math.sin(t * 5 + bx) * (1 - t * 0.5), yy))
        p.path(p.smooth_d(pts), fill="none", stroke=BONE, stroke_width=4 if hot else 3, opacity=0.9 if hot else 0.55)
        tx, ty = pts[-1]
        if hot:
            p.circle(tx, ty, 26, fill=GOLD, opacity=0.35)
            p.circle(tx, ty, 14, fill=GOLD, opacity=0.6)
        p.circle(tx, ty, 6, fill=GOLD if hot else BONE, stroke=key, stroke_width=2)
    # glass-lantern cells drifting toward the splash at the stern
    for cx, cy, r in [(150, 360, 26), (210, 430, 18), (90, 470, 22), (980, 400, 24)]:
        p.ellipse(cx, cy, r * 1.3, r, fill=BONE, opacity=0.25, stroke=BONE, stroke_width=3)
        p.ellipse(cx - r * 0.3, cy - r * 0.3, r * 0.4, r * 0.25, fill=BONE, opacity=0.8)
        p.circle(cx + r * 0.2, cy + r * 0.1, r * 0.25, fill=key, opacity=0.5)
        if cx < 400:
            p.path(f"M{cx + r * 1.4},{cy} l22,-8 m-22,8 l22,8", fill="none", stroke=BONE, stroke_width=2, opacity=0.7)

    # the raft on the surface, then the keyed wave crests along the line
    p.path(f"M330,{SURF - 6} C360,{SURF + 30} 640,{SURF + 34} 700,{SURF - 8} L690,{SURF - 22} L340,{SURF - 22}Z",
           fill=BONE, stroke=key, stroke_width=5)
    for i in range(9):
        xx = 360 + i * 37
        p.line(xx, SURF - 18, xx + 6, SURF + 16, stroke="#c9b48e", stroke_width=3)
    # brothers: slender figures, large hands on the oars
    bro = [(400, "down"), (480, "down"), (560, "down"), (630, "up")]
    for i, (bx, oar) in enumerate(bro):
        col = MARROW2 if i % 2 else "#6a5a8a"  # blue-born skin reddening
        p.path(f"M{bx - 12},{SURF - 22} L{bx - 7},{SURF - 78} L{bx + 9},{SURF - 78} L{bx + 13},{SURF - 22}Z",
               fill=col, stroke=key, stroke_width=4)
        p.circle(bx + 1, SURF - 94, 15, fill=col, stroke=key, stroke_width=4)
        if oar == "down":
            p.line(bx + 4, SURF - 64, bx - 70, SURF + 52, stroke=key, stroke_width=6, stroke_linecap="round")
            p.path(f"M{bx - 70},{SURF + 52} l-14,22 l22,6 z", fill=BONE, stroke=key, stroke_width=3)
            p.circle(bx - 12, SURF - 46, 8, fill=col, stroke=key, stroke_width=3)
        else:
            p.line(bx + 4, SURF - 66, bx + 60, SURF - 150, stroke=key, stroke_width=6, stroke_linecap="round")
            p.path(f"M{bx + 60},{SURF - 150} l8,-24 l14,10 z", fill=BONE, stroke=key, stroke_width=3)
            p.circle(bx + 22, SURF - 92, 8, fill=col, stroke=key, stroke_width=3)
            p.text(bx + 70, SURF - 112, "LIFT", size=20, family="sans-serif", fill=BONE, font_weight="bold")
    # wave crests: a row of keyed curls with claw fingers of foam
    x = -30
    while x < W + 30:
        big = 840 <= x <= 1100
        h = p.rng.uniform(70, 95) if big else p.rng.uniform(16, 34)
        wdt = p.rng.uniform(150, 190) if big else p.rng.uniform(70, 110)
        if 320 < x < 700:  # leave the raft clear
            x += wdt * 0.7
            continue
        d = (f"M{x},{SURF + 4} C{x + wdt * 0.3},{SURF - h * 0.4} {x + wdt * 0.55},{SURF - h * 1.1} "
             f"{x + wdt * 0.8},{SURF - h} C{x + wdt * 0.95},{SURF - h * 0.95} {x + wdt},{SURF - h * 0.7} "
             f"{x + wdt * 0.88},{SURF - h * 0.55} C{x + wdt * 0.9},{SURF - h * 0.2} {x + wdt},{SURF} Z")
        p.path(d, fill=RIVER, stroke=key, stroke_width=4)
        p.path(f"M{x + wdt * 0.12},{SURF} C{x + wdt * 0.35},{SURF - h * 0.5} {x + wdt * 0.55},{SURF - h * 0.95} "
               f"{x + wdt * 0.8},{SURF - h * 0.92}", fill="none", stroke=BONE, stroke_width=3 if big else 2)
        # claw fingers at the lip
        nf = 6 if big else 3
        for k in range(nf):
            a = math.radians(-40 + k * (160 / nf))
            fx, fy = x + wdt * 0.84, SURF - h * 0.98
            ln = (22 if big else 9) * (1 - k / (nf + 2))
            p.path(f"M{f(fx)},{f(fy)} q{f(math.cos(a) * ln)},{f(math.sin(a) * ln - ln * 0.6)} "
                   f"{f(math.cos(a) * ln * 1.4)},{f(math.sin(a) * ln * 0.6)}", fill="none", stroke=BONE,
                   stroke_width=3 if big else 2, stroke_linecap="round")
        x += wdt * 0.72
    # spray dots over the big swell
    for _ in range(40):
        p.circle(p.rng.uniform(860, 1110), p.rng.uniform(150, 250), p.rng.uniform(1.5, 4), fill=BONE, opacity=0.85)
    p.line(0, SURF, W, SURF, stroke=key, stroke_width=3)

    # progress: thin vessel line, raft glyph, small heart (no distance number)
    p.rect(0, 0, W, 54, fill=key)
    p.line(60, 28, 1100, 28, stroke=HILITE, stroke_width=2)
    p.path("M430,28 l-16,-8 h32 z", fill=BONE)
    p.path("M1130,38 C1100,18 1112,6 1130,18 C1148,6 1160,18 1130,38Z", fill=GOLD)
    # cartouche, as on a print
    p.rect(1060, 70, 112, 150, fill=BONE, stroke=key, stroke_width=4)
    p.rect(1068, 78, 96, 134, fill="none", stroke=key, stroke_width=1.5)
    for i, ch in enumerate("HUSH"):
        p.text(1101, 112 + i * 28, ch, size=26, family="serif", fill=key, font_weight="bold")
    p.rect(8, 62, W - 16, H - 70, fill="none", stroke=key, stroke_width=8)


# ---- 2D: the climb (cave painting) -------------------------------------------------------------
@register(G, "climb")
def climb(p: Pic):
    """The climb (2D): a side-on shaft painted on rock in ochre and charcoal, with hand stencils blown
    around it. At a ledge too high for one, a brother braces at the foot while the brother above
    reaches down and pulls the next one up on the beat. Finger-dot holds zigzag upward, firm ones ringed;
    light grows at the top and the rock warms from blue to red. Tally strokes count the lifts."""
    char = "#1d1612"
    p.rect(0, 0, W, H, fill=p.gradient([(0, "#e9c39a"), (0.5, "#d8c3a2"), (1, "#a9b4bd")]))
    # rock: flaked patches, cracks, mineral stipple
    rough = p.roughen(9, 0.02)
    p.open("g", filter=rough)
    for _ in range(70):
        cx, cy, r = p.rng.uniform(0, W), p.rng.uniform(0, H), p.rng.uniform(30, 120)
        pts = [(cx + r * math.cos(t) * p.rng.uniform(0.6, 1.1), cy + r * 0.6 * math.sin(t) * p.rng.uniform(0.6, 1.1))
               for t in [k * math.pi / 5 for k in range(10)]]
        shade = p.rng.choice(["#c9a57e", "#e6d2b0", "#b89c80", "#9fa9b0", "#d9b48a"])
        p.path(p.smooth_d(pts, closed=True), fill=shade, opacity=0.35)
    p.close()
    for _ in range(14):
        x, y = p.rng.uniform(0, W), p.rng.uniform(0, H)
        pts = [(x, y)]
        for _ in range(5):
            x += p.rng.uniform(-40, 40)
            y += p.rng.uniform(10, 50)
            pts.append((x, y))
        p.wobble(pts, amp=2, step=10, stroke="#5b4636", stroke_width=1.2, opacity=0.45)
    p.stipple(0, 0, W, H, n=1800, r=(0.5, 1.8), fill="#5b4636", opacity=0.35)

    # light at the top of the shaft
    p.ellipse(600, -20, 330, 170, fill=p.radial([(0, "#fff3d0", 1), (0.5, GOLD, 0.8), (1, HILITE, 0)]))

    # hand stencils: ochre blown around a hand, leaving the rock bare inside
    stencils = [(140, 180, 0.95, -18, DEEP), (1050, 140, 0.85, 20, RIVER), (110, 560, 0.8, 8, RIVER),
                (1080, 600, 1.0, -10, DEEP), (260, 380, 0.6, 30, char), (960, 380, 0.65, -25, RIVER)]
    for (sx, sy, s, rot, col) in stencils:
        blow = p.radial([(0, col, 0.85), (0.55, col, 0.55), (1, col, 0)])
        p.circle(sx, sy + 20 * s, 120 * s, fill=blow)
        p.stipple(sx - 120 * s, sy - 100 * s, 240 * s, 240 * s, n=220, r=(0.6, 1.8), fill=col, opacity=0.6,
                  density=lambda x, y, sx=sx, sy=sy, s=s: max(0, 1 - math.hypot(x - sx, y - sy - 20 * s) / (120 * s)))
        p.path(hand_d(sx, sy, s, rot), fill="#e3cdaa", stroke="none", opacity=0.92)

    # the shaft walls, charcoal
    lw = [(360 + 30 * math.sin(y * 0.01), y) for y in range(-10, H + 20, 40)]
    rw = [(840 + 30 * math.sin(y * 0.012 + 2), y) for y in range(-10, H + 20, 40)]
    for wall in (lw, rw):
        p.wobble(wall, amp=3, step=12, stroke=char, stroke_width=7, stroke_linecap="round", opacity=0.85)
        p.wobble([(x + 14 * (1 if wall is lw else -1), y) for x, y in wall], amp=3, step=12, stroke=char,
                 stroke_width=2, opacity=0.5)

    # ledge too high for one
    LED = 340
    p.wobble([(400, LED), (560, LED - 4), (700, LED + 2), (820, LED)], amp=2.5, step=10, stroke=char,
             stroke_width=12, stroke_linecap="round")
    p.wobble([(560, LED), (558, 470)], amp=2, step=10, stroke=char, stroke_width=6, opacity=0.7)
    # finger-dot holds, zigzagging; firm ones ringed (on the beat)
    for k in range(16):
        y = 760 - k * 46
        x = 600 + 150 * math.sin(k * 1.3) + p.rng.uniform(-20, 20)
        if LED - 30 < y < LED + 30:
            continue
        firm = k % 3 == 0
        for j in range(3):
            p.circle(x + j * 9 - 9, y + p.rng.uniform(-3, 3), 4.5, fill=RIVER, opacity=0.9)
        if firm:
            p.wobble([(x - 26 + 26 * math.cos(t), y + 15 * math.sin(t)) for t in [i * 0.42 for i in range(16)]],
                     amp=1.5, step=6, stroke=RIVER, stroke_width=2.5)

    def figure(x, y, pose, col):
        """An ochre stick figure: tapered body, round head, line limbs."""
        sw = dict(stroke=col, stroke_width=9, stroke_linecap="round", fill="none")
        if pose == "brace":       # crouched at the ledge foot, shoulders as a step
            p.path(f"M{x},{y} Q{x + 6},{y - 40} {x + 2},{y - 70}", **sw)
            p.circle(x - 14, y - 82, 15, fill=col)
            p.path(f"M{x},{y} L{x - 24},{y + 30} L{x - 34},{y + 70} M{x},{y} L{x + 28},{y + 34} L{x + 22},{y + 70}", **sw)
            p.path(f"M{x + 2},{y - 60} L{x + 40},{y - 70} L{x + 50},{y - 100}", **sw)
            p.path(f"M{x + 2},{y - 60} L{x - 30},{y - 40} L{x - 46},{y - 64}", **sw)
        elif pose == "reach":     # kneeling on the ledge, arm down
            p.path(f"M{x},{y} Q{x + 12},{y - 34} {x + 30},{y - 60}", **sw)
            p.circle(x + 40, y - 76, 15, fill=col)
            p.path(f"M{x},{y} L{x + 34},{y - 2} M{x},{y} L{x - 30},{y + 2}", **sw)
            p.path(f"M{x + 22},{y - 46} L{x + 6},{y + 24} L{x - 4},{y + 62}", **sw)
            p.path(f"M{x + 24},{y - 48} L{x + 60},{y - 20}", **sw)
        elif pose == "hang":      # hanging from the clasp, legs kicking
            p.path(f"M{x},{y} L{x + 4},{y + 70}", **sw)
            p.circle(x - 6, y + 2, 15, fill=col)
            p.path(f"M{x + 2},{y + 18} L{x - 4},{y - 34}", **sw)
            p.path(f"M{x + 2},{y + 18} L{x + 34},{y + 40} L{x + 46},{y + 22}", **sw)
            p.path(f"M{x + 4},{y + 70} L{x - 22},{y + 110} M{x + 4},{y + 70} L{x + 30},{y + 104} L{x + 40},{y + 130}", **sw)
        elif pose == "climb":
            p.path(f"M{x},{y} L{x + 6},{y - 60}", **sw)
            p.circle(x + 8, y - 76, 14, fill=col)
            p.path(f"M{x + 4},{y - 44} L{x - 22},{y - 76} M{x + 4},{y - 44} L{x + 30},{y - 30}", **sw)
            p.path(f"M{x},{y} L{x - 22},{y + 22} L{x - 18},{y + 52} M{x},{y} L{x + 26},{y + 30}", **sw)

    figure(520, LED - 14, "reach", DEEP)
    figure(512, LED + 72, "hang", RIVER)
    figure(690, LED + 150, "brace", "#7a3a20")
    figure(700, 700, "climb", char)
    # the clasp: two hands meet, ringed for the beat
    for r, o in ((22, 0.9), (36, 0.5), (52, 0.25)):
        p.circle(510, LED + 58, r, fill="none", stroke=GOLD, stroke_width=4, opacity=o)
    # pulse marks for the three on-beat pulls
    for i in range(3):
        p.wobble([(420 + i * 22, LED + 30), (430 + i * 22, LED + 60)], amp=1, step=6, stroke=DEEP, stroke_width=5,
                 stroke_linecap="round")
    # tally of lifts cut beside the shaft
    for i in range(4):
        p.wobble([(900 + i * 18, 250), (904 + i * 18, 320)], amp=1.5, step=8, stroke=char, stroke_width=6,
                 stroke_linecap="round")
    p.wobble([(890, 300), (980, 270)], amp=1.5, step=8, stroke=char, stroke_width=5, stroke_linecap="round")
    p.text(892, 360, "LIFTS", size=22, family="sans-serif", fill=char, opacity=0.7, letter_spacing=3)
    p.vignette(0.55, "#2a1a10")


# ---- 1D: the carving (scrimshaw) ---------------------------------------------------------------
@register(G, "carving")
def carving(p: Pic):
    """The Carving (1D): a bone blank on a slab, engraved like scrimshaw in black lines on ivory. The
    faint dotted outline of a hook lies over the blank; the chisel drags a straight stroke along the
    grain, and a knot sits in the way where a cross-grain cut would split it. On the left a row of
    notches counts the strokes left under the recipient's mark; on the right a lamp burns down."""
    ink, red = "#1a1410", DEEP
    p.paper("#efe3c8", grain=0.25, fibre=1.1)
    # scrimshaw ground: the slab is all fine engraved hatching, the blank stays bare ivory
    BX, BY, BW, BH = 470, 70, 260, 600
    blank = (f"M{BX + 40},{BY + 30} C{BX + 110},{BY - 10} {BX + 200},{BY} {BX + BW - 30},{BY + 50} "
             f"C{BX + BW + 10},{BY + 220} {BX + BW - 10},{BY + 420} {BX + BW - 40},{BY + BH - 40} "
             f"C{BX + 170},{BY + BH + 20} {BX + 70},{BY + BH + 10} {BX + 30},{BY + BH - 50} "
             f"C{BX - 10},{BY + 420} {BX},{BY + 200} {BX + 40},{BY + 30}Z")
    slab = p.clip(f'<rect x="300" y="30" width="600" height="700"/>')
    p.hatch(300, 30, 600, 700, angle=20, spacing=6, clip=slab, stroke=ink, stroke_width=0.8, opacity=0.55)
    p.hatch(300, 30, 600, 700, angle=-50, spacing=9, clip=slab, stroke=ink, stroke_width=0.6, opacity=0.35)
    p.rect(300, 30, 600, 700, fill="none", stroke=ink, stroke_width=2)
    p.path(blank, fill="#f3e9d2", stroke=ink, stroke_width=2.5)
    clipb = p.clip(f'<path d="{blank}"/>')
    # grain lines running the length of the bone
    p.open("g", clip_path=clipb)
    for i in range(26):
        x0 = BX + 6 + i * 10
        pts = [(x0 + 6 * math.sin(y * 0.02 + i * 0.7) + (14 * math.exp(-((y - 380) / 50) ** 2) if 560 < x0 < 660 else 0), y)
               for y in range(BY - 10, BY + BH + 30, 30)]
        p.path(p.smooth_d(pts), fill="none", stroke=ink, stroke_width=0.9, opacity=0.6)
    # a knot: concentric engraved rings
    for r in range(4, 34, 5):
        p.ellipse(612, 380, r * 1.0, r * 1.5, fill="none", stroke=ink, stroke_width=1.1)
    p.ellipse(612, 380, 4, 6, fill=ink)
    p.ellipse(530, 560, 10, 16, fill="none", stroke=ink, stroke_width=1)
    p.ellipse(530, 560, 4, 7, fill=ink)
    # slivers already taken: cross-hatched channels outside the hook
    cuts = [((BX + 20, BY + 120), (BX + 100, BY + 300)), ((BX + 240, BY + 90), (BX + 210, BY + 260)),
            ((BX + 30, BY + 400), (BX + 90, BY + 560)), ((BX + 250, BY + 470), (BX + 190, BY + 590))]
    for (x1, y1), (x2, y2) in cuts:
        L = math.hypot(x2 - x1, y2 - y1)
        nx, ny = -(y2 - y1) / L * 10, (x2 - x1) / L * 10
        p.poly([(x1 + nx, y1 + ny), (x2 + nx, y2 + ny), (x2 - nx, y2 - ny), (x1 - nx, y1 - ny)], fill="#d8c8a6",
               stroke=ink, stroke_width=1.2)
        for k in range(int(L / 5)):
            t = k * 5 / L
            cx, cy = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            p.line(cx - nx, cy - ny, cx + nx * 0.6 + 3, cy + ny * 0.6, stroke=ink, stroke_width=0.7)
    p.close()
    # the hook form: faint dotted outline over the blank
    hook = ("M600,140 C560,150 545,210 552,300 C560,400 570,470 560,540 C552,600 500,620 478,585 "
            "C462,560 470,520 505,515")
    p.path(hook, fill="none", stroke=ink, stroke_width=3, stroke_dasharray="2 9", stroke_linecap="round")
    p.path(hook, fill="none", stroke=ink, stroke_width=14, opacity=0.06)
    # the stroke being drawn: along the grain, a third of the blank long, sliver curling off
    p.line(650, 160, 668, 330, stroke=red, stroke_width=3, stroke_dasharray="12 6")
    p.path("M668,330 l-10,-22 l18,2z", fill=red)
    for k in range(6):
        y = 175 + k * 26
        p.path(f"M{652 + k * 2.6},{y} q{14 + k},{4} {10 + k},{14}", fill="none", stroke=ink, stroke_width=1.4)
    # the chisel, engraved: blade and wrapped handle
    p.open("g", transform="rotate(-6 690 300)")
    p.poly([(662, 330), (676, 330), (680, 400), (658, 400)], fill="#f3e9d2", stroke=ink, stroke_width=2)
    p.hatch(658, 330, 22, 70, angle=90, spacing=3, clip=p.clip('<polygon points="662,330 676,330 680,400 658,400"/>'),
            stroke=ink, stroke_width=0.6)
    p.rect(652, 400, 34, 170, rx=12, fill="#f3e9d2", stroke=ink, stroke_width=2.5)
    for k in range(14):
        p.path(f"M652,{410 + k * 11} q17,6 34,0", fill="none", stroke=ink, stroke_width=1.2)
    p.close()
    # the recipient's mark cut into the grip end (red, as scrimshaw is sometimes coloured)
    p.path("M590,640 l14,-26 l14,26 M597,628 h14", fill="none", stroke=red, stroke_width=3, stroke_linecap="round")

    # left third: mark, temperament glyph, five forms, stroke notches
    p.text(60, 90, "FOR", size=20, family="serif", fill=ink, letter_spacing=4)
    p.circle(150, 150, 46, fill="none", stroke=ink, stroke_width=2)
    p.path("M126,172 l24,-46 l24,46 M136,156 h28", fill="none", stroke=red, stroke_width=5, stroke_linecap="round")
    for k in range(18):
        a = k * math.pi / 9
        p.line(150 + 52 * math.cos(a), 150 + 52 * math.sin(a), 150 + 60 * math.cos(a), 150 + 60 * math.sin(a),
               stroke=ink, stroke_width=1.5)
    p.text(60, 250, "dreams", size=22, family="serif", fill=ink, font_style="italic")
    forms = {"hook": "M0,-30 C-10,-26 -12,-6 -10,10 C-8,26 -16,32 -24,26",
             "awl": "M0,-32 L6,-6 L2,32 L-2,32 L-6,-6Z",
             "comb": "M-20,-14 H20 V0 H-20Z M-18,0 V22 M-10,0 V22 M-2,0 V22 M6,0 V22 M14,0 V22",
             "scraper": "M-22,-10 Q0,-30 22,-10 L16,24 H-16Z",
             "flute": "M-5,-32 H5 V32 H-5Z M0,-18 v1 M0,-4 v1 M0,10 v1"}
    for i, (nm, d) in enumerate(forms.items()):
        cx, cy = 80 + (i % 3) * 80, 330 + (i // 3) * 100
        if nm == "hook":
            p.rect(cx - 36, cy - 44, 72, 88, fill="none", stroke=red, stroke_width=2)
        p.path(d, transform=f"translate({cx},{cy})", fill="none", stroke=ink, stroke_width=2)
        p.text(cx - 20, cy + 42, nm, size=13, family="serif", fill=ink)
    # stroke notches: 24, 9 used
    p.text(60, 560, "STROKES", size=18, family="serif", fill=ink, letter_spacing=3)
    for i in range(24):
        x = 60 + (i % 12) * 19
        y = 580 + (i // 12) * 50
        if i < 9:
            p.line(x, y, x + 8, y + 34, stroke=ink, stroke_width=2, opacity=0.35)
        else:
            p.path(f"M{x},{y} l4,34 l4,-34", fill="none", stroke=ink, stroke_width=2.4)

    # right third: the lamp burning down
    p.path("M1000,560 q60,-10 120,0 l-12,40 h-96z", fill="#f3e9d2", stroke=ink, stroke_width=2.5)
    p.hatch(990, 560, 140, 40, angle=0, spacing=4, clip=p.clip('<path d="M1000,560 q60,-10 120,0 l-12,40 h-96z"/>'),
            stroke=ink, stroke_width=0.7)
    p.path("M1060,555 C1040,520 1060,490 1060,470 C1075,500 1082,525 1060,555Z", fill="#f3e9d2", stroke=ink,
           stroke_width=2)
    p.path("M1060,548 C1052,530 1060,512 1061,500 C1068,520 1068,535 1060,548Z", fill=red, opacity=0.8)
    for k in range(10):
        a = -math.pi / 2 + (k - 4.5) * 0.25
        p.line(1060 + 40 * math.cos(a), 515 + 40 * math.sin(a), 1060 + 60 * math.cos(a), 515 + 60 * math.sin(a),
               stroke=ink, stroke_width=1)
    p.rect(1010, 620, 100, 50, fill="none", stroke=ink, stroke_width=2.5)
    p.text(1030, 653, "DONE", size=22, family="serif", fill=ink, letter_spacing=2)
    p.text(990, 120, "THE GIFT", size=22, family="serif", fill=ink, letter_spacing=4)
    p.text(990, 150, "true · rough · keepsake", size=15, family="serif", fill=ink, font_style="italic")
    # scrimshaw rope border
    for side in range(4):
        n = 60 if side % 2 == 0 else 40
        for k in range(n):
            if side == 0:
                x, y = 20 + k * (W - 40) / n, 18
            elif side == 2:
                x, y = 20 + k * (W - 40) / n, H - 18
            elif side == 1:
                x, y = W - 18, 20 + k * (H - 40) / n
            else:
                x, y = 18, 20 + k * (H - 40) / n
            p.path(f"M{f(x - 5)},{f(y + 5)} q5,-10 10,-10", fill="none", stroke=ink, stroke_width=2)
    p.rect(30, 30, W - 60, H - 60, fill="none", stroke=ink, stroke_width=1.2)


# ---- 1D: marrow-song (bead-string notation) ----------------------------------------------------
@register(G, "marrow-song")
def marrow_song(p: Pic):
    """Marrow-Song (1D): the group's song as beads on strands across a vertebral membrane. Each slot
    holds one brother's phrase of four beads, height for pitch, a large bead for the accent; the knots
    between slots glow green for a smooth join, amber for a rough one, grey for a break. A play-head
    of light runs along the song, and the last bead of the verse sits home at the lowest height. Each
    player's tray of spare phrases waits below."""
    p.rect(0, 0, W, H, fill=p.gradient([(0, "#11203a"), (0.5, MARROW), (1, "#0d1a30")]))
    p.ellipse(600, 330, 700, 260, fill=p.radial([(0, MARROW2, 0.55), (1, MARROW2, 0)]))
    p.stipple(0, 0, W, H, n=500, r=(0.6, 1.8), fill=GLOW, opacity=0.35)
    seats = [GLOW, BONE, HILITE, GOLD]
    X0, SW, NS = 70, 132.5, 8
    TOP, STEP = 170, 46   # height 5 at TOP, height 1 at TOP + 4*STEP

    def hy(hgt):
        return TOP + (5 - hgt) * STEP

    # membrane with vertebra slots
    p.rect(X0 - 20, TOP - 50, NS * SW + 40, 4 * STEP + 100, rx=40, fill="#ffffff", opacity=0.05,
           stroke=GLOW, stroke_width=1.5)
    for s in range(NS):
        x = X0 + s * SW
        p.path(f"M{x + 6},{TOP - 40} q{SW / 2 - 6},-18 {SW - 12},0 v{4 * STEP + 80} q-{SW / 2 - 6},18 -{SW - 12},0z",
               fill=MARROW2, opacity=0.25, stroke=GLOW, stroke_width=1, stroke_opacity=0.4)
    for hgt in range(1, 6):
        p.line(X0 - 10, hy(hgt), X0 + NS * SW + 10, hy(hgt), stroke=GLOW, stroke_width=0.8, opacity=0.25,
               stroke_dasharray="2 6")
        p.text(X0 - 44, hy(hgt) + 6, str(hgt), size=16, family="monospace", fill=GLOW, opacity=0.6)
    # phrases, generated so that joins vary and the verse ends home on 1
    phrases = []
    last = 3
    for s in range(NS):
        start = max(1, min(5, last + p.rng.choice([0, 1, -1, 2, -3, 1])))
        ph = [start]
        for _ in range(3):
            ph.append(max(1, min(5, ph[-1] + p.rng.choice([-2, -1, 0, 1, 1, 2]))))
        if s == NS - 1:
            ph[-1], ph[-2] = 1, min(ph[-2], 2)
        phrases.append((ph, seats[s % 4], 0 if s % 2 == 0 else 2))
        last = ph[-1]
    playhead = X0 + 5.4 * SW
    joins = {"smooth": "#7ed38a", "rough": "#f0a640", "break": "#8c8c8c"}
    for s, (ph, col, acc) in enumerate(phrases):
        xs = [X0 + s * SW + 22 + k * 29 for k in range(4)]
        pts = [(x, hy(h)) for x, h in zip(xs, ph)]
        p.path(p.smooth_d(pts), fill="none", stroke=col, stroke_width=2.5, opacity=0.8)
        for k, (x, y) in enumerate(pts):
            r = 15 if k == acc else 10
            lit = abs(x - playhead) < 40
            if lit:
                p.circle(x, y, r + 14, fill=col, opacity=0.25)
            p.circle(x, y, r, fill=col, stroke="#0b1424", stroke_width=2)
            p.circle(x - r * 0.35, y - r * 0.35, r * 0.3, fill="#ffffff", opacity=0.6)
        if s + 1 < NS:
            d = abs(ph[-1] - phrases[s + 1][0][0])
            kind = "smooth" if d <= 1 else "rough" if d == 2 else "break"
            nx, ny = X0 + (s + 1) * SW + 22, hy(phrases[s + 1][0][0])
            jx, jy = (pts[-1][0] + nx) / 2, (pts[-1][1] + ny) / 2
            if kind == "break":
                p.path(f"M{f(pts[-1][0])},{f(pts[-1][1])} L{f(jx - 6)},{f(jy)}", stroke="#8c8c8c", stroke_width=2,
                       stroke_dasharray="3 4", fill="none")
                p.path(f"M{f(jx + 6)},{f(jy)} L{f(nx)},{f(ny)}", stroke="#8c8c8c", stroke_width=2,
                       stroke_dasharray="3 4", fill="none")
            else:
                p.path(p.smooth_d([pts[-1], (jx, jy), (nx, ny)]), fill="none", stroke=joins[kind], stroke_width=2.5)
            p.circle(jx, jy, 8, fill=joins[kind], opacity=0.3)
            p.rect(jx - 5, jy - 5, 10, 10, fill=joins[kind], transform=f"rotate(45 {f(jx)} {f(jy)})")
    # home: the last bead, ringed
    hx, hyy = X0 + 7 * SW + 22 + 3 * 29, hy(1)
    for r, o in ((22, 0.7), (34, 0.4), (48, 0.2)):
        p.circle(hx, hyy, r, fill="none", stroke=GOLD, stroke_width=3, opacity=o)
    p.text(hx - 34, hyy + 68, "HOME", size=18, family="sans-serif", fill=GOLD, letter_spacing=3)
    # play-head
    p.rect(playhead - 3, TOP - 60, 6, 4 * STEP + 120, fill=GLOW, opacity=0.9)
    p.rect(playhead - 18, TOP - 60, 36, 4 * STEP + 120, fill=GLOW, opacity=0.12)
    p.path(f"M{playhead - 12},{TOP - 72} h24 l-12,14z", fill=GLOW)
    # trays: each seat's spare phrases
    for i, col in enumerate(seats):
        tx = 70 + i * 270
        p.rect(tx, 560, 240, 150, rx=18, fill="#0b1424", opacity=0.6, stroke=col, stroke_width=2)
        p.text(tx + 16, 590, f"SEAT {'ABCD'[i]}", size=16, family="sans-serif", fill=col, letter_spacing=3)
        for j in range(2):
            ph = [p.rng.randint(1, 5) for _ in range(4)]
            xs = [tx + 30 + j * 110 + k * 22 for k in range(4)]
            ys = [690 - h * 16 for h in ph]
            p.path(p.smooth_d(list(zip(xs, ys))), fill="none", stroke=col, stroke_width=2, opacity=0.6)
            for k, (x, y) in enumerate(zip(xs, ys)):
                p.circle(x, y, 9 if k == (0 if j else 2) else 6.5, fill=col, opacity=0.85)
    # cursor dragging a phrase from seat C's tray
    p.path("M770,640 l0,34 l9,-9 l7,15 l6,-3 l-7,-14 l13,0z", fill="#ffffff", stroke="#0b1424", stroke_width=1.5)
    # header: harmony and the Sing button
    p.text(70, 70, "MARROW-SONG  ·  VERSE ONE", size=24, family="sans-serif", fill=BONE, letter_spacing=4)
    p.text(820, 70, "HARMONY", size=18, family="sans-serif", fill=GLOW, letter_spacing=3)
    p.rect(930, 50, 160, 22, rx=11, fill="none", stroke=GLOW, stroke_width=1.5)
    p.rect(932, 52, 118, 18, rx=9, fill="#7ed38a")
    p.rect(1100, 46, 64, 30, rx=15, fill=GOLD)
    p.text(1110, 68, "SING", size=16, family="sans-serif", fill="#0b1424", font_weight="bold")
    # heartbeat rim
    p.rect(10, 10, W - 20, H - 20, rx=24, fill="none", stroke=HILITE, stroke_width=3, opacity=0.6)


# ---- 1D: bone counters (linocut) ---------------------------------------------------------------
@register(G, "bone-counters")
def bone_counters(p: Pic):
    """Bone Counters (1D): the sowing board cut as a linocut, bold black on cream with gouge marks in
    the pits. A hand drops one counter on the beat into the next hollow; the carved arrow shows the
    sowing running anticlockwise past the player's keep. One hollow is rung, ringed in red, and the
    row of heartbeat marks below shows which drop rang on time."""
    ink, cream, red = "#15100c", "#efe4cc", RIVER
    p.paper(cream, grain=0.2, fibre=0.7)
    rough = p.roughen(4, 0.05)
    p.open("g", filter=rough)
    # the block: black field with cut radiating lines at the edges
    p.rect(40, 150, 1120, 480, rx=110, fill=ink)
    for k in range(120):
        a = k / 120 * 2 * math.pi
        cx, cy = 600 + 560 * math.cos(a), 390 + 240 * math.sin(a)
        ln = p.rng.uniform(14, 40)
        p.line(cx, cy, cx - math.cos(a) * ln, cy - math.sin(a) * ln * 0.6, stroke=cream, stroke_width=3,
               stroke_linecap="round")
    # rim tally of rounds won, cut in
    for i in range(2):
        p.line(150 + i * 16, 190, 150 + i * 16, 225, stroke=cream, stroke_width=6, stroke_linecap="round")
    for i in range(1):
        p.line(1030 + i * 16, 555, 1030 + i * 16, 590, stroke=cream, stroke_width=6, stroke_linecap="round")

    hollows = {}
    for row, y in ((0, 300), (1, 480)):
        for i in range(5):
            hollows[(row, i)] = (300 + i * 150, y)
    counts = {(0, 0): 4, (0, 1): 3, (0, 2): 0, (0, 3): 5, (0, 4): 3,
              (1, 0): 2, (1, 1): 4, (1, 2): 0, (1, 3): 3, (1, 4): 4}

    def pit(cx, cy, rx, ry):
        p.ellipse(cx, cy, rx, ry, fill=cream)
        # gouge marks: short black crescents left in the pit
        for _ in range(9):
            a = p.rng.uniform(0, 2 * math.pi)
            rr = p.rng.uniform(0.25, 0.8)
            x, y = cx + rx * rr * math.cos(a), cy + ry * rr * math.sin(a)
            p.path(f"M{f(x - 9)},{f(y)} q9,{f(p.rng.uniform(-6, 6))} 18,0", fill="none", stroke=ink,
                   stroke_width=2.5, stroke_linecap="round")

    for (row, i), (cx, cy) in hollows.items():
        pit(cx, cy, 58, 52)
    pit(140, 390, 60, 150)   # opponent's keep (left)
    pit(1060, 390, 60, 150)  # your keep (right)

    def counter(x, y, fill=ink, s=1.0):
        p.ellipse(x, y, 15 * s, 11 * s, fill=fill, transform=f"rotate({p.rng.randint(-30, 30)} {f(x)} {f(y)})")
        p.path(f"M{f(x - 6 * s)},{f(y - 3 * s)} q6,-4 12,0", fill="none", stroke=cream, stroke_width=2)

    for key, n in counts.items():
        cx, cy = hollows[key]
        for k in range(n):
            a = k * 2.4 + p.rng.uniform(-0.2, 0.2)
            rr = 8 + 7 * math.sqrt(k)
            counter(cx + rr * math.cos(a), cy + rr * math.sin(a) * 0.9)
    for k in range(9):
        counter(140 + p.rng.uniform(-24, 24), 290 + k * 22)
    for k in range(7):
        counter(1060 + p.rng.uniform(-24, 24), 320 + k * 22)
    counter(1060, 470, fill=red, s=1.3)  # your carved counter piece, first in your keep
    p.close()

    # the rung hollow (exactly three after an on-beat drop): red ring
    rx_, ry_ = hollows[(0, 4)]
    p.ellipse(rx_, ry_, 70, 64, fill="none", stroke=red, stroke_width=8)
    p.ellipse(rx_, ry_, 82, 76, fill="none", stroke=red, stroke_width=3, stroke_dasharray="6 8")
    # sowing path: anticlockwise along your row toward your keep, carved arrow in red
    pts = [hollows[(1, 1)], (500, 570), (680, 560), (840, 560), (980, 520), (1040, 470)]
    p.path(p.smooth_d(pts), fill="none", stroke=red, stroke_width=7, stroke_dasharray="20 12", stroke_linecap="round")
    p.path("M1040,470 l-30,8 l14,-30z", fill=red)
    # the big hand, reaching down from above, letting one counter fall into the next hollow
    hx, hy = hollows[(1, 2)]
    arm = (f"M{hx + 30},-10 C{hx + 40},120 {hx + 60},200 {hx + 70},250 C{hx + 90},300 {hx + 70},350 {hx + 40},368 "
           f"C{hx + 20},380 {hx - 8},372 {hx - 22},352 C{hx - 40},330 {hx - 46},300 {hx - 30},270 "
           f"C{hx - 30},200 {hx - 40},100 {hx - 60},-10Z")
    p.path(arm, fill=cream, stroke=ink, stroke_width=8, stroke_linejoin="round")
    armclip = p.clip(f'<path d="{arm}"/>')
    p.hatch(hx - 70, -10, 160, 230, angle=80, spacing=14, clip=armclip, stroke=ink, stroke_width=3, jitter=3)
    p.path(f"M{hx - 34},228 C{hx},238 {hx + 40},236 {hx + 66},226", fill="none", stroke=ink, stroke_width=6)
    p.path(f"M{hx - 32},244 C{hx},254 {hx + 40},252 {hx + 68},242", fill="none", stroke=ink, stroke_width=4)
    # folded fingers: carved grooves between them, and the thumb pressed over the pinch
    for k in range(3):
        x0 = hx - 12 + k * 22
        p.path(f"M{x0},{318 + k * 2} C{x0 - 2},{336} {x0 - 3},{350} {x0 - 6},{366 - k * 3}", fill="none",
               stroke=ink, stroke_width=4, stroke_linecap="round")
    p.path(f"M{hx + 64},282 C{hx + 30},300 {hx + 10},330 {hx + 4},356", fill="none", stroke=ink, stroke_width=6,
           stroke_linecap="round")
    # the falling counter with cut motion lines
    counter(hx, hy - 52, fill=red, s=1.4)
    for k in range(3):
        p.line(hx - 22 + k * 22, 392 + abs(k - 1) * 8, hx - 22 + k * 22, 412 + abs(k - 1) * 8,
               stroke=cream, stroke_width=5, stroke_linecap="round")
    # the beat row: heartbeat cuts, the current drop in red
    for i in range(12):
        x = 140 + i * 80
        on = i in (0, 1, 2, 4, 5, 7, 8, 9)
        cur = i == 9
        col = red if cur else ink
        p.path(f"M{x},{720} l14,0 l8,-28 l10,48 l8,-20 l14,0", fill="none", stroke=col,
               stroke_width=6 if cur else 4, stroke_linejoin="round", opacity=1 if on or cur else 0.35)
        if not on:
            p.line(x + 10, 750, x + 40, 750, stroke=ink, stroke_width=3, opacity=0.35)
    p.text(40, 80, "BONE COUNTERS", size=44, family="serif", fill=ink, font_weight="bold", letter_spacing=6)
    p.text(40, 118, "sow on the beat", size=24, family="serif", fill=red, font_style="italic")


# ---- 1D: the branch chart (red-ink anatomical plate) -------------------------------------------
@register(G, "branch-chart")
def branch_chart(p: Pic):
    """The Branch Chart (1D): an anatomical plate in fine red ink on vellum. Vessels branch from a
    glowing point, the raft, like a river delta; the lit junction shows three branches marked with
    current arrows, tendril ticks, width and a calm-pool ring, while patrols stay hidden. The brothers'
    counter pieces stand on the branches as votes, and a pulse line along the foot shortens as the
    junction's time runs out."""
    red, faint = "#9e1b24", "#c98a7e"
    p.paper("#f1e4c6", grain=0.28, fibre=0.8)
    for _ in range(7):  # vellum stains
        p.ellipse(p.rng.uniform(0, W), p.rng.uniform(0, H), p.rng.uniform(80, 220), p.rng.uniform(60, 160),
                  fill=p.radial([(0, "#c8a874", 0.18), (1, "#c8a874", 0)]))
    # plate border
    p.rect(30, 30, W - 60, H - 60, fill="none", stroke=red, stroke_width=2)
    p.rect(40, 40, W - 80, H - 80, fill="none", stroke=red, stroke_width=0.8)
    p.text(60, 80, "PLATE VI", size=22, family="serif", fill=red, letter_spacing=6)
    p.text(860, 80, "the delta, from the raft", size=22, family="serif", fill=red, font_style="italic")

    segs = []

    def vessel(x, y, ang, wdt, depth, lit=False):
        """Recursive red-ink vessel: tapering double line with engraved shading."""
        ln = (150 if depth > 3 else 110) * p.rng.uniform(0.75, 1.15)
        pts = [(x, y)]
        a = ang
        for k in range(5):
            a += p.rng.uniform(-0.12, 0.12)
            pts.append((pts[-1][0] + math.cos(a) * ln / 5, pts[-1][1] + math.sin(a) * ln / 5))
        segs.append((pts, wdt, lit))
        ex, ey = pts[-1]
        if depth <= 0 or ex > 1120 or ey < 110 or ey > 660:
            return
        n = 2 if p.rng.random() < 0.75 else 3
        for i in range(n):
            na = a + (i - (n - 1) / 2) * p.rng.uniform(0.45, 0.7)
            vessel(ex, ey, na, max(0.8, wdt * p.rng.uniform(0.55, 0.72)), depth - 1)

    RX, RY = 150, 400
    # the lit junction: three chosen branches from the main trunk
    trunk = [(RX, RY), (240, 396), (330, 404), (420, 400)]
    JX, JY = 420, 400
    branches = []
    for i, ang in enumerate((-0.62, 0.0, 0.6)):
        branches.append((ang, (14, 9, 5)[i]))
    for ang, wdt in branches:
        vessel(JX, JY, ang, wdt, 5, lit=True)
    # faint back-vessels toward the edges behind the raft
    for ang in (2.5, 3.6, 3.1):
        vessel(RX, RY, ang, 3, 1)
    # draw: capillaries first, then vessels with engraved shading
    segs.sort(key=lambda s: s[1])
    p.open("g", clip_path=p.clip('<rect x="44" y="96" width="1112" height="560"/>'))
    for pts, wdt, lit in segs:
        d = p.smooth_d(pts)
        if wdt > 2.5:
            p.path(d, fill="none", stroke=red, stroke_width=wdt + 3, stroke_linecap="round")
            p.path(d, fill="none", stroke="#f1e4c6", stroke_width=max(1, wdt - 1), stroke_linecap="round")
            p.path(d, fill="none", stroke=red, stroke_width=0.6, stroke_dasharray="1 3", opacity=0.8)
        else:
            p.path(d, fill="none", stroke=faint if not lit else red, stroke_width=wdt, stroke_linecap="round")
    p.close()
    p.path(p.smooth_d(trunk), fill="none", stroke=red, stroke_width=26, stroke_linecap="round")
    p.path(p.smooth_d(trunk), fill="none", stroke="#f1e4c6", stroke_width=18, stroke_linecap="round")
    for k in range(30):  # engraved cross-shading across the trunk
        x = 160 + k * 9
        p.line(x, 392, x + 4, 410, stroke=red, stroke_width=0.8)
    # the lit junction: halo and branch annotations
    p.circle(JX, JY, 40, fill="none", stroke=red, stroke_width=1.5, stroke_dasharray="3 5")
    ann = [(-0.62, 3, 0, False, "a"), (0.0, 2, 2, True, "b"), (0.6, 1, 1, False, "c")]
    for (ang, cur, ten, calm, lab) in ann:
        bx, by = JX + math.cos(ang) * 120, JY + math.sin(ang) * 120
        for k in range(cur):  # current arrows
            ax, ay = bx + math.cos(ang) * (k * 22 - 10), by + math.sin(ang) * (k * 22 - 10) - 22
            p.path(f"M{f(ax)},{f(ay)} l{f(math.cos(ang + 2.6) * 10)},{f(math.sin(ang + 2.6) * 10)} "
                   f"M{f(ax)},{f(ay)} l{f(math.cos(ang - 2.6) * 10)},{f(math.sin(ang - 2.6) * 10)}",
                   fill="none", stroke=red, stroke_width=2.2)
        for k in range(ten):  # tendril ticks
            tx, ty = bx + math.cos(ang) * (k * 14 + 30), by + math.sin(ang) * (k * 14 + 30)
            p.path(f"M{f(tx)},{f(ty + 6)} q-5,10 3,18 q6,6 -2,12", fill="none", stroke=red, stroke_width=1.4)
        if calm:
            cx, cy = bx + math.cos(ang) * 150, by + math.sin(ang) * 150
            for r in (12, 20, 28):
                p.circle(cx, cy, r, fill="none", stroke=red, stroke_width=1.2)
        lx, ly = bx + math.cos(ang) * 60 + 30, by + math.sin(ang) * 60 - 40
        p.line(bx + math.cos(ang) * 40, by + math.sin(ang) * 40, lx, ly + 6, stroke=red, stroke_width=0.6)
        p.text(lx + 4, ly, lab, size=24, family="serif", fill=red, font_style="italic")
    # patrol hidden: a listening mark over branch c, uncertain
    p.text(JX + math.cos(0.6) * 230, JY + math.sin(0.6) * 230 + 6, "?", size=36, family="serif", fill=red,
           opacity=0.7)
    # votes: counter pieces standing on branches
    votes = [(-0.62, 200, MARROW2), (0.0, 200, "#6a5a8a"), (0.0, 236, MARROW2), (0.6, 210, "#8a4a5a")]
    for ang, dist, col in votes:
        vx, vy = JX + math.cos(ang) * dist, JY + math.sin(ang) * dist
        p.ellipse(vx, vy + 22, 26, 8, fill=red, opacity=0.25)
        p.path(f"M{f(vx - 18)},{f(vy + 20)} Q{f(vx - 22)},{f(vy - 22)} {f(vx)},{f(vy - 32)} "
               f"Q{f(vx + 22)},{f(vy - 22)} {f(vx + 18)},{f(vy + 20)}Z", fill=BONE, stroke="#3a2a20", stroke_width=2.5)
        p.circle(vx, vy - 6, 7, fill=col)
    # the glowing point: the raft
    p.circle(RX, RY, 70, fill=p.radial([(0, GOLD, 0.95), (0.35, HILITE, 0.6), (1, HILITE, 0)]))
    p.circle(RX, RY, 9, fill="#fff6dc", stroke=red, stroke_width=2)
    p.text(RX - 30, RY + 92, "the raft", size=18, family="serif", fill=red, font_style="italic")
    # pieces waiting along the bottom edge
    for i in range(4):
        vx = 90 + i * 52
        p.path(f"M{vx - 16},{712} Q{vx - 20},{676} {vx},{668} Q{vx + 20},{676} {vx + 16},{712}Z",
               fill=BONE, stroke="#3a2a20", stroke_width=2, opacity=0.35)
    # timer: a pulse line that shortens
    pts = []
    for k in range(60):
        x = 320 + k * 13
        y = 700 + (-34 if k % 12 == 5 else 18 if k % 12 == 6 else 0)
        pts.append((x, y))
    cut = 38
    p.path("M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts[:cut]), fill="none", stroke=red, stroke_width=2.4)
    p.path("M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts[cut - 1:]), fill="none", stroke=red, stroke_width=1,
           opacity=0.25, stroke_dasharray="2 4")
    p.circle(pts[cut - 1][0], pts[cut - 1][1], 6, fill=red)
    # legend, plate style
    p.text(880, 640, "Fig. a  strong current", size=16, family="serif", fill=red)
    p.text(880, 662, "Fig. b  calm pool, tendrils", size=16, family="serif", fill=red)
    p.text(880, 684, "Fig. c  narrow; listen", size=16, family="serif", fill=red)

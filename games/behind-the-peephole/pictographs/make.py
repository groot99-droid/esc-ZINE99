"""Behind the Peephole gameplay pictographs. Built by tools/pictographs/build.py.

Palette (DESIGN.md section 15): bottle-green wallpaper, tobacco amber lamplight, brass, river grey,
cream paper, carbon blue. Red only as evidence (here: the "met" thread on the Mosaic).
"""
import math

from core import H, W, Pic, f, register

G = "behind-the-peephole"

BOTTLE = "#1f3d2c"
BOTTLE_D = "#13271c"
BOTTLE_L = "#2f5a40"
AMBER = "#e0a24a"
AMBER_L = "#f6cf86"
BRASS = "#b8913f"
BRASS_L = "#e3c47a"
RIVER = "#6f7c80"
CREAM = "#efe6cf"
INK = "#1c1a17"
CARBON = "#2a3a8c"
EVIDENCE = "#a3302a"


def _rot(pts, cx, cy, deg):
    a = math.radians(deg)
    ca, sa = math.cos(a), math.sin(a)
    return [(cx + (x - cx) * ca - (y - cy) * sa, cy + (x - cx) * sa + (y - cy) * ca) for x, y in pts]


def _box(x, y, w, h):
    return [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]


# ------------------------------------------------------------------------------------------------
# The eye at the hole: fisheye gouache
# ------------------------------------------------------------------------------------------------
EYE_C = (600, 375)
EYE_R = 315
ROOM_S = 0.62  # room plane to lens scale


def _fe(pts, k=0.32, step=10):
    """Subdivide a polygon in room-plane coordinates (relative to the lens centre) and bend it
    through a barrel distortion, so straight walls bow like a door viewer's lens."""
    cx, cy = EYE_C
    out = []
    seq = list(pts) + [pts[0]]
    for (x1, y1), (x2, y2) in zip(seq, seq[1:]):
        n = max(1, int(math.hypot(x2 - x1, y2 - y1) / step))
        for i in range(n):
            t = i / n
            x, y = (x1 + (x2 - x1) * t) * ROOM_S, (y1 + (y2 - y1) * t) * ROOM_S
            r = math.hypot(x, y) / EYE_R
            s = (1 + k) / (1 + k * r * r)
            out.append((cx + x * s, cy + y * s))
    return out


def _paint(p, pts, color, rough=None, **kw):
    p.poly(_fe(pts), fill=color, filter=rough, **kw)


@register(G, "eye-at-the-hole")
def eye_at_the_hole(p: Pic):
    """The eye at the hole (2D): the player's eye at a door viewer fitted backwards. A guest's room
    is painted in warm opaque gouache inside one curved circle; everything else is the dark door.
    The guest has set a case down beside the lamp, and the view is held still on it: the amber
    ring around the lens is three-quarters closed, about to catch the beat as a clue card."""
    r = p.rng
    cx, cy = EYE_C
    # the door: almost black wood, lit only where the lens throws light
    p.rect(0, 0, W, H, fill="#0b0907")
    glow = p.radial([(0, "#6a4220", 0.9), (0.45, "#3a2414", 0.6), (1, "#0b0907", 0)], cx=0.5, cy=0.47, r=0.5)
    p.ellipse(cx, cy, 620, 560, fill=glow)
    grain = []
    for i in range(70):
        y0 = r.uniform(-40, H + 40)
        amp, ph, fr = r.uniform(4, 16), r.uniform(0, 6.3), r.uniform(0.004, 0.01)
        pts = [(x, y0 + amp * math.sin(ph + x * fr) + 30 * math.exp(-((x - cx) / 260) ** 2) * math.sin(i))
               for x in range(-20, W + 40, 40)]
        grain.append(p.smooth_d(pts))
    p.path(" ".join(grain), fill="none", stroke="#c88a4a", stroke_width=1.1, opacity=0.18)
    p.vignette(0.9)
    # brass escutcheon round the lens
    p.circle(cx, cy, EYE_R + 34, fill=p.radial([(0, BRASS_L, 1), (0.8, BRASS, 1), (1, "#5d4518", 1)], cx=0.42, cy=0.38, r=0.6))
    p.circle(cx, cy, EYE_R + 34, fill="none", stroke="#3b2a0e", stroke_width=3)
    for i in range(48):
        a = 2 * math.pi * i / 48
        p.line(cx + (EYE_R + 8) * math.cos(a), cy + (EYE_R + 8) * math.sin(a),
               cx + (EYE_R + 30) * math.cos(a), cy + (EYE_R + 30) * math.sin(a),
               stroke="#6b5220", stroke_width=1.2, opacity=0.6)

    clip = p.clip(f'<circle cx="{cx}" cy="{cy}" r="{EYE_R}"/>')
    rough = p.roughen(5, 0.05)
    p.open("g", clip_path=clip)
    # wall: bottle-green wallpaper with stripes, bowed by the lens
    _paint(p, _box(-600, -520, 1200, 760), BOTTLE)
    for x in range(-600, 600, 46):
        _paint(p, _box(x, -520, 14, 760), BOTTLE_L, opacity=0.55)
        _paint(p, _box(x + 24, -520, 4, 760), "#3d6b4c", opacity=0.5)
    # picture rail and skirting
    _paint(p, _box(-600, -250, 1200, 14), "#4a3420")
    _paint(p, _box(-600, 222, 1200, 20), "#3a2716")
    # floor: worn carpet, tobacco
    _paint(p, _box(-600, 240, 1200, 400), "#7a4a24")
    for i in range(16):
        y = 255 + i * 22
        _paint(p, _box(-600, y, 1200, 6), "#8f5a2c", opacity=0.6)
    # window at left with river-grey night and blind
    _paint(p, _box(-470, -200, 170, 230), "#2b3540")
    _paint(p, _box(-470, -200, 170, 90), RIVER, opacity=0.65)
    for y in range(-195, 28, 18):
        _paint(p, _box(-470, y, 170, 5), "#4c5a60", opacity=0.8)
    _paint(p, _box(-480, 30, 190, 14), "#5a3e22")
    # bed at left
    _paint(p, _box(-430, 70, 300, 170), "#d9c7a3", rough)
    _paint(p, _box(-430, 70, 300, 46), "#efe2c4", rough)
    _paint(p, _box(-450, 10, 26, 230), "#4a2f1a")
    _paint(p, _box(-430, 150, 300, 90), "#6c7d5c", rough)
    # desk and lamp at right
    _paint(p, _box(110, 40, 300, 22), "#5a3a1e")
    _paint(p, _box(120, 62, 22, 180), "#4a2f18")
    _paint(p, _box(380, 62, 22, 180), "#4a2f18")
    _paint(p, _box(250, -60, 10, 100), BRASS)
    _paint(p, [(200, -60), (310, -60), (285, -130), (225, -130)], "#2f5a40", rough)
    # lamp pool: the warm heart of the image
    pool = p.radial([(0, AMBER_L, 0.95), (0.35, AMBER, 0.6), (1, AMBER, 0)], r=0.5)
    (lpx, lpy), = _fe([(255, -40)])
    p.ellipse(lpx, lpy, 200, 170, fill=pool)
    # the case on the desk: the beat
    _paint(p, _box(300, -2, 92, 44), "#3b2a1c", rough)
    _paint(p, _box(332, -14, 28, 14), BRASS)
    _paint(p, _box(300, 14, 92, 4), BRASS_L)
    # the guest: a painted cut-out, three-quarter back, hand leaving the case
    body = [(150, 240), (150, 40), (165, -40), (205, -70), (255, -66), (290, -30), (300, 30), (322, 6),
            (330, 18), (300, 70), (282, 40), (276, 240)]
    _paint(p, body, "#2a2a33", rough)
    _paint(p, [(168, -40), (205, -68), (255, -64), (284, -30), (280, 60), (178, 60)], "#38384a", rough)
    p.ellipse(*_fe([(222, -110)])[0], 34 * 0.75, 40 * 0.75, fill="#6b4a32", filter=rough)
    p.ellipse(*_fe([(208, -122)])[0], 32 * 0.75, 30 * 0.75, fill="#2a1e16", filter=rough)
    # foreground: the arm of an armchair at the bottom edge, very near and very big
    _paint(p, [(-600, 330), (-160, 300), (-100, 340), (-120, 640), (-600, 640)], "#4b2a1a", rough)
    _paint(p, [(-600, 330), (-160, 300), (-110, 322), (-600, 360)], "#6a3d24", rough)
    # gouache strokes: short opaque dabs over everything, same family colours
    dabs = {BOTTLE_L: [], "#9a6a3a": [], AMBER_L: [], "#e9dcbc": []}
    for _ in range(520):
        x, y = r.uniform(-520, 520), r.uniform(-520, 520)
        if math.hypot(x, y) > 520:
            continue
        if y < 230:
            col = BOTTLE_L if x < 100 or r.random() < 0.4 else AMBER_L
        else:
            col = "#9a6a3a"
        if -430 < x < -130 and 70 < y < 150:
            col = "#e9dcbc"
        (px, py), = _fe([(x, y)])
        a = r.uniform(-0.5, 0.5) + (math.pi / 2 if y < 230 else 0)
        L = r.uniform(6, 16)
        dabs[col].append(f"M{f(px - L * math.cos(a))},{f(py - L * math.sin(a))}L{f(px + L * math.cos(a))},{f(py + L * math.sin(a))}")
    for col, ds in dabs.items():
        p.path("".join(ds), fill="none", stroke=col, stroke_width=4.5, stroke_linecap="round", opacity=0.35)
    # lens rim: soft dark edge, and a glint
    p.circle(cx, cy, EYE_R, fill=p.radial([(0, "#000", 0), (0.78, "#000", 0), (1, "#000", 0.85)], r=0.5))
    p.ellipse(cx - 150, cy - 170, 70, 26, fill="#ffffff", opacity=0.12, transform=f"rotate(-35 {cx - 150} {cy - 170})")
    p.close()
    # inner half of the circle, where a beat must sit
    p.circle(cx, cy, EYE_R / 2, fill="none", stroke=AMBER_L, stroke_width=1.2, stroke_dasharray="3 9", opacity=0.6)
    # the catch ring: three quarters closed
    circ = 2 * math.pi * (EYE_R + 14)
    p.circle(cx, cy, EYE_R + 14, fill="none", stroke="#2a1a0c", stroke_width=10)
    p.circle(cx, cy, EYE_R + 14, fill="none", stroke=AMBER, stroke_width=7, stroke_linecap="round",
             stroke_dasharray=f"{f(circ * 0.76)} {f(circ)}", transform=f"rotate(-90 {cx} {cy})")
    # clue cards fanned at bottom-left, caught tonight
    for i in range(4):
        x0, y0 = 60 + i * 34, 640
        pts = _rot(_box(x0, y0, 92, 124), x0 + 46, y0 + 160, -24 + i * 12)
        p.poly(pts, fill=CREAM, stroke="#6b5a3a", stroke_width=1)
        (ax, ay), (bx, by) = pts[0], pts[1]
        for k in range(3):
            t = 0.25 + k * 0.18
            q = _rot([(x0 + 14, y0 + 30 + k * 26), (x0 + 78, y0 + 30 + k * 26)], x0 + 46, y0 + 160, -24 + i * 12)
            p.line(*q[0], *q[1], stroke="#7a6a52", stroke_width=1.5, opacity=0.7)
    p.text(60, 615, "CAUGHT TONIGHT  4", size=16, family="sans-serif", fill=AMBER, letter_spacing=3)
    # room number plate on the door
    p.rect(cx - 60, 26, 120, 40, rx=4, fill=BRASS, stroke="#3b2a0e", stroke_width=2)
    p.text(cx, 56, "404", size=28, family="serif", fill="#2a1a0c", text_anchor="middle", font_weight="bold")
    p.text(W - 60, H - 40, "HOLD STILL", size=18, family="sans-serif", fill=AMBER_L, text_anchor="end",
           letter_spacing=4, opacity=0.8)


# ------------------------------------------------------------------------------------------------
# Corridor race: architect's technical section
# ------------------------------------------------------------------------------------------------
def _dim(p, x1, x2, y, label, ext_from=None, size=15, color=INK):
    p.line(x1, y, x2, y, stroke=color, stroke_width=0.9)
    for x in (x1, x2):
        p.line(x - 5, y + 5, x + 5, y - 5, stroke=color, stroke_width=1.6)
        if ext_from is not None:
            p.line(x, ext_from, x, y + (6 if y < ext_from else -6), stroke=color, stroke_width=0.5)
    p.text((x1 + x2) / 2, y - 6, label, size=size, family="monospace", fill=color, text_anchor="middle",
           letter_spacing=1)


@register(G, "corridor-race")
def corridor_race(p: Pic):
    """Corridor race (2D): the service passage drawn as a technical-pen long section, the 14 m the
    camera sees. The player runs east from 404 toward 405, whose rose has brightened because its
    guest is home; between them, dimensioned and hatched, lie the four loose boards that creak if
    run over. A key plan above shows the whole 64 m passage and where this view sits in it."""
    r = p.rng
    p.paper("#f3efe4", grain=0.12, fibre=1.6)
    pen = dict(stroke=INK, fill="none")
    # border and title block
    p.rect(24, 24, W - 48, H - 48, stroke_width=2.2, **pen)
    p.rect(32, 32, W - 64, H - 64, stroke_width=0.6, **pen)
    # ---- key plan: whole passage, 64 m
    kx, ky, kw = 90, 92, 1020
    s = kw / 64
    p.text(kx, ky - 22, "KEY PLAN  1:400", size=14, family="monospace", fill=INK, letter_spacing=2)
    p.rect(kx, ky, kw, 26, stroke_width=1.2, **pen)
    p.hatch(kx + 18 * s, ky, 8 * s, 26, angle=45, spacing=4, stroke=INK, stroke_width=0.4,
            clip=p.clip(f'<rect x="{f(kx + 18 * s)}" y="{ky}" width="{f(8 * s)}" height="26"/>'))
    for m, lab in [(8, "401"), (16, "402"), (28, "403"), (36, "404"), (46, "405"), (56, "406")]:
        x = kx + m * s
        p.line(x, ky, x, ky - 8, stroke=INK, stroke_width=1.2)
        p.text(x, ky + 46, lab, size=12, family="monospace", fill=INK, text_anchor="middle")
    p.text(kx, ky + 46, "OFFICE", size=12, family="monospace", fill=INK)
    p.text(kx + kw, ky + 46, "STAIR", size=12, family="monospace", fill=INK, text_anchor="end")
    p.rect(kx + 34 * s, ky - 6, 14 * s, 38, stroke="#c0392b", stroke_width=1.6, fill="none", stroke_dasharray="6 3")
    p.text(kx + 41 * s, ky - 12, "VIEW", size=11, family="monospace", fill="#c0392b", text_anchor="middle")

    # ---- long section, 34 m to 48 m
    m0, m1 = 34, 48
    X0, X1 = 90, 1110
    sx = (X1 - X0) / (m1 - m0)
    FL = 520  # floor line
    CE = FL - 3.0 * sx  # ceiling at 3.0 m

    def X(m):
        return X0 + (m - m0) * sx

    def Y(h):
        return FL - h * sx

    # floor slab and ceiling slab, cut: heavy outline and concrete hatch + stipple
    for y0, h0 in [(FL, 34), (CE - 30, 30)]:
        cl = p.clip(f'<rect x="{X0}" y="{f(y0)}" width="{X1 - X0}" height="{h0}"/>')
        p.hatch(X0, y0, X1 - X0, h0, angle=45, spacing=9, stroke=INK, stroke_width=0.5, clip=cl)
        p.open("g", clip_path=cl)
        p.stipple(X0, y0, X1 - X0, h0, n=500, r=(0.4, 1.1), fill=INK)
        p.close()
        p.rect(X0, y0, X1 - X0, h0, stroke_width=2.6, **pen)
    # floorboards: the four loose ones at 38-41 m drawn lifted, with a creak
    for i, m in enumerate(range(38, 42)):
        x = X(m)
        lift = 3 + (i % 2) * 2
        p.poly([(x + 2, FL - lift), (x + sx - 2, FL - lift + (2 if i % 2 else -1)), (x + sx - 2, FL), (x + 2, FL)],
               fill="#e6dcc4", stroke=INK, stroke_width=1.2)
        for k in range(3):
            a = math.radians(-120 + k * 30)
            cxk, cyk = x + sx / 2, FL - 16
            p.path(f"M{f(cxk + 10 * math.cos(a))},{f(cyk + 10 * math.sin(a))} "
                   f"A10,10 0 0,1 {f(cxk + 10 * math.cos(a + 0.5))},{f(cyk + 10 * math.sin(a + 0.5))}",
                   stroke=INK, stroke_width=0.8, fill="none", opacity=0.0)
    # wainscot and dado rail
    p.line(X0, Y(1.0), X1, Y(1.0), stroke=INK, stroke_width=1.4)
    p.line(X0, Y(1.05), X1, Y(1.05), stroke=INK, stroke_width=0.6)
    wd = []
    m = m0
    while m < m1:
        wd.append(f"M{f(X(m))},{f(Y(0.12))}V{f(Y(0.92))}")
        m += 0.6
    p.path("".join(wd), stroke=INK, stroke_width=0.4, fill="none")
    # pipes along the ceiling
    for h in (2.7, 2.58):
        p.line(X0, Y(h), X1, Y(h), stroke=INK, stroke_width=1.0)
    m = m0 + 0.4
    while m < m1:
        p.rect(X(m) - 4, Y(2.76), 8, 0.24 * sx, stroke=INK, stroke_width=0.8, fill="#f3efe4")
        m += 2.5
    # doors: 404 at 36 m, 405 at 46 m (elevations beyond the cut, thin line)
    for m, lab, lit in [(36, "404", False), (46, "405", True)]:
        x, w_, h_ = X(m) - 0.45 * sx, 0.9 * sx, 2.1 * sx
        p.rect(x, FL - h_, w_, h_, stroke=INK, stroke_width=1.3, fill="none")
        p.rect(x + 8, FL - h_ + 8, w_ - 16, h_ * 0.42, stroke=INK, stroke_width=0.6, fill="none")
        p.rect(x + 8, FL - h_ * 0.5, w_ - 16, h_ * 0.42, stroke=INK, stroke_width=0.6, fill="none")
        rx, ry = X(m), Y(1.55)
        if lit:
            p.circle(rx, ry, 30, fill=p.radial([(0, AMBER_L, 0.95), (0.5, AMBER, 0.5), (1, AMBER, 0)]))
        p.circle(rx, ry, 7, stroke=INK, stroke_width=1.4, fill=AMBER if lit else "none")
        p.circle(rx, ry, 2.4, fill=INK)
        p.text(rx, FL - h_ - 12, lab, size=18, family="monospace", fill=INK, text_anchor="middle", font_weight="bold")
    # linen alcove hint at the right edge? no: lost-property cabinet stub at 34-34.6 m
    p.rect(X0, Y(1.8), 0.5 * sx, 1.8 * sx, stroke=INK, stroke_width=1.0, fill="none")
    p.hatch(X0, Y(1.8), 0.5 * sx, 1.8 * sx, angle=-45, spacing=6, stroke=INK, stroke_width=0.35,
            clip=p.clip(f'<rect x="{X0}" y="{f(Y(1.8))}" width="{f(0.5 * sx)}" height="{f(1.8 * sx)}"/>'))
    # the runner: architect's scale figure, mid stride
    fx, fy = X(37.2), FL
    body = (f"M{f(fx - 26)},{fy} L{f(fx - 6)},{f(fy - 54)} L{f(fx + 24)},{fy - 2} "
            f"M{f(fx - 6)},{f(fy - 54)} L{f(fx + 4)},{f(fy - 106)} "
            f"M{f(fx + 2)},{f(fy - 96)} L{f(fx + 32)},{f(fy - 72)} M{f(fx + 2)},{f(fy - 96)} L{f(fx - 30)},{f(fy - 82)}")
    p.path(body, stroke=INK, stroke_width=4.5, stroke_linecap="round", stroke_linejoin="round", fill="none")
    p.circle(fx + 7, fy - 120, 11, fill=INK)
    # motion arrow toward 405
    p.line(fx + 50, Y(1.25), X(44.6), Y(1.25), stroke=INK, stroke_width=1.2, stroke_dasharray="10 5")
    p.poly([(X(44.6), Y(1.25) - 7), (X(44.6) + 16, Y(1.25)), (X(44.6), Y(1.25) + 7)], fill=INK)
    p.text(X(42.6), Y(1.25) - 10, "RUN 4.0 m/s", size=13, family="monospace", fill=INK, text_anchor="middle")
    # dimension chains
    _dim(p, X(36), X(46), Y(3.0) - 60, "10 000", ext_from=Y(2.1) - 30)
    _dim(p, X(38), X(42), FL + 72, "4 LOOSE BOARDS  38-41 m", ext_from=FL)
    _dim(p, X(m0), X(38), FL + 72, "4 000", ext_from=FL)
    _dim(p, X(42), X(m1), FL + 72, "6 000", ext_from=FL)
    _dim(p, X(m0), X(m1), FL + 112, "VIEW  14 000", ext_from=FL + 36)
    # level markers on left
    for h, lab in [(0, "+0.00 FFL"), (1.0, "+1.00 DADO"), (3.0, "+3.00 SOFFIT")]:
        y = Y(h)
        p.poly([(X1 + 12, y), (X1 + 24, y - 10), (X1 + 36, y)], fill="none", stroke=INK, stroke_width=1)
        p.text(X1 + 4, y - 14, lab, size=10, family="monospace", fill=INK, text_anchor="end")
    # callout bubble on the boards
    bx, by = X(40), Y(1.9)
    p.circle(bx, by, 22, stroke=INK, stroke_width=1.2, fill="#f3efe4")
    p.text(bx, by + 6, "A", size=18, family="monospace", fill=INK, text_anchor="middle")
    p.line(bx, by + 22, X(40), FL - 8, stroke=INK, stroke_width=0.7)
    # notes and title block
    ty = H - 118
    p.rect(40, ty, W - 80, 86, stroke_width=1.4, **pen)
    p.line(760, ty, 760, ty + 86, stroke=INK, stroke_width=1.0)
    p.line(980, ty, 980, ty + 86, stroke=INK, stroke_width=1.0)
    notes = ["A  LOOSE BOARDS: RUNNING CREAKS +25 TO ROOMS WITHIN 12 m.",
             "   WALK, CRAWL OR HOP. 405 ROSE LIT: GUEST HOME, BELL x5."]
    for i, n_ in enumerate(notes):
        p.text(56, ty + 32 + i * 26, n_, size=15, family="monospace", fill=INK, letter_spacing=0.5)
    p.text(776, ty + 34, "SECTION B-B", size=20, family="monospace", fill=INK, font_weight="bold", letter_spacing=2)
    p.text(776, ty + 62, "SERVICE PASSAGE, 4F", size=13, family="monospace", fill=INK)
    p.text(996, ty + 34, "SCALE 1:50", size=15, family="monospace", fill=INK)
    p.text(996, ty + 62, "SHEET 4 / 7", size=15, family="monospace", fill=INK)
    # north arrow-ish east arrow
    p.circle(1110, 92 + 13, 0.1, fill=INK)


# ------------------------------------------------------------------------------------------------
# Lockwork: patent exploded view
# ------------------------------------------------------------------------------------------------
def _cyl_v(p, x, y, w, h, n=None, shade=True):
    """A small vertical cylinder in fine line: top ellipse, sides, shading hatch on the right."""
    ry = w * 0.22
    p.path(f"M{f(x)},{f(y)} V{f(y + h)} A{f(w / 2)},{f(ry)} 0 0,0 {f(x + w)},{f(y + h)} V{f(y)}",
           fill="#f7f1e2", stroke=INK, stroke_width=1.1)
    p.ellipse(x + w / 2, y, w / 2, ry, fill="#f7f1e2", stroke=INK, stroke_width=1.1)
    if shade:
        k = 0
        while k < 5:
            xx = x + w * (0.62 + k * 0.08)
            p.line(xx, y + ry * 0.9, xx, y + h + ry * 0.6, stroke=INK, stroke_width=0.45)
            k += 1


def _spring(p, x, y, w, h, turns=8):
    pts = [(x + (w if i % 2 else 0), y + h * i / (2 * turns)) for i in range(2 * turns + 1)]
    p.poly(pts, closed=False, fill="none", stroke=INK, stroke_width=1)


def _leader(p, x1, y1, x2, y2, num):
    p.path(f"M{f(x1)},{f(y1)} Q{f((x1 + x2) / 2 + 12)},{f(y1)} {f(x2)},{f(y2)}", fill="none", stroke=INK, stroke_width=0.6)
    p.text(x1 + (-6 if x1 < x2 else 6), y1 + 5, str(num), size=17, family="serif", fill=INK,
           text_anchor="end" if x1 < x2 else "start", font_style="italic")


@register(G, "lockwork")
def lockwork(p: Pic):
    """Lockwork (1D): the stair-door pin tumbler drawn as a patent sheet, every part pulled apart
    along dotted axes and numbered. The tension wrench turns the plug while the hook pick lifts the
    one binding pin toward the dashed shear line; the spool pin waits beside it to give a false
    set. The tension gauge on the left sits inside its safe band."""
    p.paper("#f4eedd", grain=0.18, fibre=1.2)
    r = p.rng
    p.text(600, 62, "Sheet 2 of 4", size=18, family="serif", fill=INK, text_anchor="middle")
    p.text(600, 96, "FIG. 3", size=30, family="serif", fill=INK, text_anchor="middle", font_style="italic",
           letter_spacing=4)
    # housing (shell), cut in half, lifted above
    hx, hy, hw, hh = 300, 150, 640, 120
    p.path(f"M{hx},{hy + hh} V{hy + 30} Q{hx},{hy} {hx + 30},{hy} H{hx + hw - 30} Q{hx + hw},{hy} {hx + hw},{hy + 30} V{hy + hh}",
           fill="#f7f1e2", stroke=INK, stroke_width=1.6)
    p.line(hx, hy + hh, hx + hw, hy + hh, stroke=INK, stroke_width=1.6)
    p.hatch(hx, hy, hw, hh, angle=60, spacing=7, stroke=INK, stroke_width=0.35,
            clip=p.clip(f'<rect x="{hx}" y="{hy}" width="{hw}" height="{hh}" rx="30"/>'))
    pin_x = [hx + 80 + i * 110 for i in range(5)]
    for x in pin_x:
        p.rect(x - 14, hy + 12, 28, hh - 12, fill="#f4eedd", stroke=INK, stroke_width=1)
    # springs and driver pins, exploded upward from their chambers
    axis = dict(stroke=INK, stroke_width=0.8, stroke_dasharray="2 5")
    plug_y = 520
    for i, x in enumerate(pin_x):
        p.line(x, 112, x, plug_y - 30, **axis)
    # plug: a long horizontal cylinder, exploded down
    px0, px1, pr = 300, 960, 56
    p.path(f"M{px0},{plug_y - pr} H{px1} A{pr * 0.35},{pr} 0 0,1 {px1},{plug_y + pr} H{px0}",
           fill="#f7f1e2", stroke=INK, stroke_width=1.6)
    p.ellipse(px0, plug_y, pr * 0.35, pr, fill="#f7f1e2", stroke=INK, stroke_width=1.6)
    p.path(f"M{px0 - 8},{plug_y - 8} H{px1 - 40} L{px1 - 20},{plug_y + 8} H{px0 - 8}", fill="none", stroke=INK, stroke_width=0.8)
    # longitudinal shading on the plug's lower half: lines whose spacing tightens toward the edge
    for k in range(1, 12):
        t = k / 12
        y = plug_y + pr * math.sin(t * math.pi / 2)
        p.line(px0 + 14, y, px1 + pr * 0.35 * math.cos(t * math.pi / 2) - 4, y, stroke=INK, stroke_width=0.45)
    for x in pin_x:
        p.ellipse(x, plug_y - pr + 2, 13, 4, fill="#f4eedd", stroke=INK, stroke_width=0.8)
    # shear line
    p.line(240, plug_y - pr - 2, 1010, plug_y - pr - 2, stroke=INK, stroke_width=1, stroke_dasharray="16 4 3 4")
    p.text(1016, plug_y - pr + 4, "S", size=18, family="serif", fill=INK, font_style="italic")
    # pin stacks between housing and plug, pulled apart
    for i, x in enumerate(pin_x):
        _spring(p, x - 9, 292, 18, 46)
        top = 352
        binding = i == 2
        spool = i == 3
        lift = -38 if binding else 0
        # driver pin
        if spool:
            p.path(f"M{x - 13},{top} h26 v8 h-6 v18 h6 v10 h-26 v-10 h6 v-18 h-6 z",
                   fill="#f7f1e2", stroke=INK, stroke_width=1.1)
        else:
            _cyl_v(p, x - 12, top + lift * 0.4, 24, 34)
        # key pin with pointed tip, different lengths
        kl = [52, 38, 60, 44, 30][i]
        ky = 404 + lift
        p.path(f"M{x - 11},{ky} V{ky + kl} L{x},{ky + kl + 12} L{x + 11},{ky + kl} V{ky}", fill="#f7f1e2",
               stroke=INK, stroke_width=1.1)
        p.ellipse(x, ky, 11, 3, fill="#f7f1e2", stroke=INK, stroke_width=1.1)
        for k in range(3):
            p.line(x + 3 + k * 3, ky + 3, x + 3 + k * 3, ky + kl - 2, stroke=INK, stroke_width=0.4)
    # the binding pin, emphasised: arrow up
    bx = pin_x[2]
    p.path(f"M{bx + 30},{470} C{bx + 50},{440} {bx + 50},{400} {bx + 26},{378}", fill="none", stroke=INK, stroke_width=1.4)
    p.poly([(bx + 26, 370), (bx + 20, 384), (bx + 33, 382)], fill=INK)
    # hook pick, entering the keyway from the right, its tip under the binding pin
    hy0 = plug_y + 4
    p.path(f"M1180,{hy0 + 16} H{bx + 40} Q{bx + 14},{hy0 + 16} {bx + 10},{hy0 - 10} Q{bx + 8},{hy0 - 22} {bx},{hy0 - 30}",
           fill="none", stroke=INK, stroke_width=5, stroke_linecap="round")
    p.path(f"M1180,{hy0 + 16} H{bx + 40}", fill="none", stroke="#f7f1e2", stroke_width=2)
    p.rect(1010, hy0 + 6, 170, 22, fill="#f7f1e2", stroke=INK, stroke_width=1.2)
    p.hatch(1010, hy0 + 6, 170, 22, angle=0, spacing=4, stroke=INK, stroke_width=0.4,
            clip=p.clip(f'<rect x="1010" y="{hy0 + 6}" width="170" height="22"/>'))
    # tension wrench: L-shaped, below-left, torque arrow
    wy = plug_y + pr + 20
    p.path(f"M{px0 - 10},{plug_y + 30} V{wy + 40} H{px0 + 280}", fill="none", stroke=INK, stroke_width=6,
           stroke_linejoin="round")
    p.path(f"M{px0 - 10},{plug_y + 30} V{wy + 40} H{px0 + 280}", fill="none", stroke="#f7f1e2", stroke_width=2,
           stroke_linejoin="round")
    p.path(f"M{px0 + 300},{wy + 60} A60,60 0 0,1 {px0 + 240},{wy + 110}", fill="none", stroke=INK, stroke_width=1.3)
    p.poly([(px0 + 240, wy + 110), (px0 + 256, wy + 112), (px0 + 246, wy + 98)], fill=INK)
    # tension gauge at left: a vertical scale 0-100 with the band 35-55 marked
    gx, gy0, gy1 = 110, 160, 700
    p.rect(gx - 14, gy0, 28, gy1 - gy0, fill="#f7f1e2", stroke=INK, stroke_width=1.3)
    for v in range(0, 101, 5):
        y = gy1 - (gy1 - gy0) * v / 100
        L = 14 if v % 25 == 0 else 7
        p.line(gx + 14, y, gx + 14 + L, y, stroke=INK, stroke_width=0.8)
        if v % 25 == 0:
            p.text(gx + 34, y + 5, str(v), size=13, family="serif", fill=INK)
    b0 = gy1 - (gy1 - gy0) * 0.55
    b1 = gy1 - (gy1 - gy0) * 0.35
    p.hatch(gx - 14, b0, 28, b1 - b0, angle=45, spacing=4, stroke=INK, stroke_width=0.6,
            clip=p.clip(f'<rect x="{gx - 14}" y="{f(b0)}" width="28" height="{f(b1 - b0)}"/>'))
    needle = gy1 - (gy1 - gy0) * 0.46
    p.poly([(gx - 30, needle - 7), (gx - 16, needle), (gx - 30, needle + 7)], fill=INK)
    # numerals with leader lines
    _leader(p, 250, 175, hx + 6, 200, 10)
    _leader(p, pin_x[0] - 60, 300, pin_x[0] - 10, 312, 12)
    _leader(p, pin_x[1] - 40, 350, pin_x[1] - 12, 366, 14)
    _leader(p, pin_x[3] + 60, 330, pin_x[3] + 13, 364, 16)
    _leader(p, pin_x[4] + 60, 420, pin_x[4] + 11, 430, 18)
    _leader(p, 250, 470, px0 - 14, plug_y - 20, 20)
    _leader(p, 1060, 600, 1040, hy0 + 18, 22)
    _leader(p, 250, 660, px0 - 10, wy + 30, 24)
    _leader(p, 180, gy0 + 40, gx + 14, gy0 + 60, 26)
    p.text(bx + 58, 432, "28", size=17, family="serif", fill=INK, font_style="italic")
    # caption and picks left, as a patent's inventor block
    p.text(1150, 740, "Inventor: the night clerk", size=16, family="serif", fill=INK, text_anchor="end", font_style="italic")
    p.text(1150, 764, "picks remaining: 3", size=14, family="serif", fill=INK, text_anchor="end")
    for i in range(3):
        x = 900 + i * 40
        p.path(f"M{x},{722} v-40 q0,-10 8,-12", fill="none", stroke=INK, stroke_width=2.5, stroke_linecap="round")


# ------------------------------------------------------------------------------------------------
# The Statement: carbon-copy typewriter form
# ------------------------------------------------------------------------------------------------
def _type(p, x, y, s, size=17, color=CARBON, step=None, ink=(0.6, 0.95)):
    """Typewriter text, one glyph at a time: each strike lands a little off and a little lighter
    or darker, as on a carbon copy."""
    r = p.rng
    step = step or size * 0.6
    out = []
    for i, ch in enumerate(s):
        if ch == " ":
            continue
        dx, dy, op = r.uniform(-0.7, 0.7), r.uniform(-0.9, 0.9), r.uniform(*ink)
        out.append(f'<text x="{f(x + i * step + dx)}" y="{f(y + dy)}" opacity="{f(op)}">'
                   f'{"&amp;" if ch == "&" else "&lt;" if ch == "<" else ch}</text>')
    p.raw(f'<g font-family="monospace" font-size="{size}" fill="{color}">' + "".join(out) + "</g>")


def _stamp(p, cx, cy, w, h, text, color, rot, size=26):
    rough = p.roughen(3.5, 0.09)
    p.open("g", transform=f"rotate({rot} {cx} {cy})", opacity=0.82, filter=rough)
    p.rect(cx - w / 2, cy - h / 2, w, h, rx=6, fill="none", stroke=color, stroke_width=4)
    p.rect(cx - w / 2 + 6, cy - h / 2 + 6, w - 12, h - 12, rx=4, fill="none", stroke=color, stroke_width=1.5)
    p.text(cx, cy + size * 0.36, text, size=size, family="sans-serif", fill=color, text_anchor="middle",
           font_weight="bold", letter_spacing=3)
    p.close()


@register(G, "statement")
def statement(p: Pic):
    """The Statement (1D): the morning's signed statement as a typed carbon copy. A logic grid of
    six rooms against objects and acts is filled with typed crosses and ticks; the rows already
    signed and correct carry a violet stamp, a wrong one is struck through, and the pen hovers
    over the last empty cell before signing."""
    r = p.rng
    p.rect(0, 0, W, H, fill="#d9d4c4")
    # the onion-skin copy, slightly askew
    p.open("g", transform="rotate(-1.2 600 400)")
    p.rect(50, 30, 1100, 760, fill="#f1eee4")
    p.paper("#f1eee4", grain=0.0)
    p.rect(50, 30, 1100, 760, fill="#f1eee4", stroke="#b9b3a2", stroke_width=1)
    # carbon smudges: soft blue clouds, fingerprints
    bl = p.blur(14)
    for _ in range(9):
        p.ellipse(r.uniform(80, 1120), r.uniform(60, 760), r.uniform(30, 110), r.uniform(10, 40),
                  fill=CARBON, opacity=r.uniform(0.04, 0.1), filter=bl,
                  transform=f"rotate({r.uniform(-30, 30):.0f} 600 400)")
    fx, fy = 1040, 700
    for k in range(9):
        p.ellipse(fx, fy, 10 + k * 3.2, 14 + k * 4, fill="none", stroke=CARBON, stroke_width=1.1,
                  opacity=0.12, transform=f"rotate(20 {fx} {fy})")
    # header
    _type(p, 90, 82, "RIVER HOTEL  -  NIGHT LOG  -  STATEMENT", size=22)
    _type(p, 90, 112, "NIGHT 2.   CATEGORIES: ROOM x OBJECT x ACT     COPY 2 OF 2", size=15)
    _type(p, 90, 124, "_" * 82, size=15, step=12.4)
    # the grid, typed: rows 401-406, objects (6) then acts (6)
    objs = ["CASE", "ENVL", "KEYS", "PHOT", "NEEDL", "LEDG"]
    acts = ["SOLD", "HID", "GAVE", "BURN", "COPY", "KEPT"]
    gx, gy, cw, ch = 190, 230, 50, 42
    for j, lab in enumerate(objs + acts):
        x = gx + j * cw + (24 if j >= 6 else 0)
        p.open("g", transform=f"rotate(-60 {x + 30} {gy - 10})")
        _type(p, x + 30, gy - 10, lab, size=14, step=9)
        p.close()
    truth_o = [0, 3, 5, 1, 4, 2]
    truth_a = [2, 1, 4, 0, 5, 3]
    for i in range(6):
        y = gy + i * ch
        _type(p, 100, y + 28, f"{401 + i}", size=19)
        for j in range(12):
            x = gx + j * cw + (24 if j >= 6 else 0)
            p.rect(x, y, cw, ch, fill="none", stroke=CARBON, stroke_width=0.9, opacity=0.75)
            tj = truth_o[i] if j < 6 else truth_a[i] + 6
            if i == 5 and j >= 6:
                continue  # last row still being worked
            if j == tj:
                _type(p, x + 16, y + 29, "V", size=22, ink=(0.85, 1))
                _type(p, x + 18, y + 29, "/", size=22, ink=(0.7, 0.9))
            elif r.random() < 0.75 or i < 4:
                _type(p, x + 18, y + 28, "X", size=19, ink=(0.45, 0.8))
    # last row: acts partly crossed, one cell circled where the pen hovers
    i, y = 5, gy + 5 * ch
    for j in range(6, 12):
        x = gx + j * cw + 24
        if j in (6, 8, 10):
            _type(p, x + 18, y + 28, "X", size=19, ink=(0.45, 0.8))
    hx, hy = gx + 9 * cw + 24 + cw / 2, y + ch / 2
    p.ellipse(hx, hy, 34, 26, fill="none", stroke=INK, stroke_width=1.6, opacity=0.8,
              transform=f"rotate(-8 {hx} {hy})", stroke_dasharray="60 6")
    # strike-through on a wrong row (row 404)
    wy = gy + 3 * ch + ch / 2
    p.path(p.wobble_d([(92, wy), (gx + 12 * cw + 30, wy - 3)], amp=1.2, step=40), fill="none", stroke=INK,
           stroke_width=2.2, opacity=0.75)
    # typed statement lines at right
    sx0 = 880
    lines = [("401", "CASE", "GAVE"), ("402", "PHOT", "HID"), ("403", "LEDG", "COPY"),
             ("404", "ENVL", "SOLD"), ("405", "NEEDL", "KEPT")]
    _type(p, sx0, 232, "STATEMENT", size=17)
    _type(p, sx0, 244, "_" * 18, size=15, step=12.4)
    for k, (rm, o, a) in enumerate(lines):
        _type(p, sx0, 278 + k * 34, f"{rm}  {o:<5} {a}", size=17)
    _type(p, sx0, 278 + 5 * 34, "406  KEYS  ....", size=17, ink=(0.3, 0.55))
    # stamps on correct rows
    _stamp(p, 1000, 560, 220, 64, "ENTERED", "#5a3d8a", -9, size=28)
    _stamp(p, 620, 690, 250, 70, "NIGHT 2", CARBON, 6, size=30)
    # second look counter and signature line
    _type(p, 90, 560, "SECOND LOOK:  [X]  [ ]", size=17)
    _type(p, 90, 610, "ROOM 401 RETURNED WITH THE CASE AND GAVE IT AWAY.", size=17)
    _type(p, 90, 660, "SIGNED: ______________________", size=17)
    _type(p, 90, 740, "COPY - NOT VALID WITHOUT THE SEAL OF THE MANAGEMENT", size=13, ink=(0.3, 0.6))
    p.close()
    # fountain-pen nib hovering over the circled cell
    nx, ny = 700, 470
    nib = [(nx, ny), (nx + 26, ny - 50), (nx + 70, ny - 150), (nx + 110, ny - 130), (nx + 52, ny - 34)]
    p.poly(nib, fill="#2a2a2a")
    p.poly([(nx, ny), (nx + 20, ny - 46), (nx + 44, ny - 36)], fill=BRASS_L)
    p.line(nx + 4, ny - 6, nx + 28, ny - 38, stroke="#2a2a2a", stroke_width=1.5)
    p.circle(nx + 25, ny - 38, 3, fill="#2a2a2a")
    p.poly([(nx + 70, ny - 150), (nx + 110, ny - 130), (nx + 200, ny - 300), (nx + 160, ny - 320)], fill="#14261b")
    p.poly([(nx + 160, ny - 320), (nx + 200, ny - 300), (nx + 230, ny - 360), (nx + 190, ny - 380)], fill=BRASS)


# ------------------------------------------------------------------------------------------------
# Night Patience: art deco playing cards on green baize
# ------------------------------------------------------------------------------------------------
CW_, CH_ = 92, 132
GOLD = "#d4ad57"
SUIT_RED = "#9b3a26"


def _suit(p, s, x, y, size, color):
    k = size / 20
    if s == "S":
        d = (f"M{f(x)},{f(y - 10 * k)} C{f(x + 14 * k)},{f(y)} {f(x + 12 * k)},{f(y + 10 * k)} {f(x)},{f(y + 4 * k)} "
             f"C{f(x - 12 * k)},{f(y + 10 * k)} {f(x - 14 * k)},{f(y)} {f(x)},{f(y - 10 * k)}Z "
             f"M{f(x)},{f(y + 2 * k)} L{f(x + 4 * k)},{f(y + 12 * k)} L{f(x - 4 * k)},{f(y + 12 * k)}Z")
    elif s == "H":
        d = (f"M{f(x)},{f(y + 10 * k)} C{f(x - 16 * k)},{f(y - 2 * k)} {f(x - 8 * k)},{f(y - 14 * k)} {f(x)},{f(y - 5 * k)} "
             f"C{f(x + 8 * k)},{f(y - 14 * k)} {f(x + 16 * k)},{f(y - 2 * k)} {f(x)},{f(y + 10 * k)}Z")
    elif s == "D":
        d = f"M{f(x)},{f(y - 11 * k)} L{f(x + 8 * k)},{f(y)} L{f(x)},{f(y + 11 * k)} L{f(x - 8 * k)},{f(y)}Z"
    else:
        d = "".join(f"M{f(x + dx * k - 5 * k)},{f(y + dy * k)}a{f(5 * k)},{f(5 * k)} 0 1,0 {f(10 * k)},0"
                    f"a{f(5 * k)},{f(5 * k)} 0 1,0 {f(-10 * k)},0" for dx, dy in [(0, -5), (-5, 2), (5, 2)])
        d += f"M{f(x)},{f(y)} L{f(x + 4 * k)},{f(y + 12 * k)} L{f(x - 4 * k)},{f(y + 12 * k)}Z"
    p.path(d, fill=color)


def _card_back(p, x, y):
    p.rect(x, y, CW_, CH_, rx=7, fill="#0f2a1e", stroke=GOLD, stroke_width=1.5)
    p.rect(x + 6, y + 6, CW_ - 12, CH_ - 12, rx=4, fill="none", stroke=GOLD, stroke_width=0.8)
    cx, cy = x + CW_ / 2, y + CH_ / 2
    # stepped fan / sunburst from the bottom
    for k in range(9):
        a = math.radians(-160 + k * 17.5)
        p.line(cx, y + CH_ - 14, cx + 70 * math.cos(a), y + CH_ - 14 + 70 * math.sin(a), stroke=GOLD,
               stroke_width=0.7, opacity=0.8)
    for k, rr in enumerate((16, 28, 40)):
        p.path(f"M{f(cx - rr)},{f(y + CH_ - 14)} A{rr},{rr} 0 0,1 {f(cx + rr)},{f(y + CH_ - 14)}", fill="none",
               stroke=GOLD, stroke_width=1.1)
    for k in range(4):
        w = 46 - k * 10
        p.rect(cx - w / 2, y + 16 + k * 7, w, 5, fill=GOLD, opacity=0.85)


def _card_face(p, x, y, rank, suit, rot=0):
    col = SUIT_RED if suit in "HD" else "#13140f"
    p.open("g", transform=f"rotate({rot} {x + CW_ / 2} {y + CH_ / 2})" if rot else None)
    p.rect(x + 3, y + 4, CW_, CH_, rx=7, fill="#000", opacity=0.3)
    p.rect(x, y, CW_, CH_, rx=7, fill="#f3ead2", stroke="#7a6630", stroke_width=1.2)
    # deco frame: stepped corners
    fx0, fy0, fx1, fy1 = x + 8, y + 8, x + CW_ - 8, y + CH_ - 8
    st = 6
    frame = [(fx0 + 2 * st, fy0), (fx1 - 2 * st, fy0), (fx1 - 2 * st, fy0 + st), (fx1 - st, fy0 + st),
             (fx1 - st, fy0 + 2 * st), (fx1, fy0 + 2 * st), (fx1, fy1 - 2 * st), (fx1 - st, fy1 - 2 * st),
             (fx1 - st, fy1 - st), (fx1 - 2 * st, fy1 - st), (fx1 - 2 * st, fy1), (fx0 + 2 * st, fy1),
             (fx0 + 2 * st, fy1 - st), (fx0 + st, fy1 - st), (fx0 + st, fy1 - 2 * st), (fx0, fy1 - 2 * st),
             (fx0, fy0 + 2 * st), (fx0 + st, fy0 + 2 * st), (fx0 + st, fy0 + st), (fx0 + 2 * st, fy0 + st)]
    p.poly(frame, fill="none", stroke=GOLD, stroke_width=1.1)
    p.text(x + 14, y + 30, rank, size=20, family="serif", fill=col, font_weight="bold")
    _suit(p, suit, x + 22, y + 44, 9, col)
    _suit(p, suit, x + CW_ / 2, y + CH_ / 2 + 8, 26, col)
    # fan above the pip
    cx, cy = x + CW_ / 2, y + CH_ / 2 - 14
    for k in range(5):
        a = math.radians(-150 + k * 30)
        p.line(cx, cy, cx + 22 * math.cos(a), cy + 22 * math.sin(a), stroke=GOLD, stroke_width=0.9)
    p.close()


@register(G, "night-patience")
def night_patience(p: Pic):
    """Night Patience (1D): solitaire on green baize under the office lamp. Six columns sit under
    brass room numbers 401 to 406; a red-on-black run is being carried onto a black seven, a dotted
    arc showing where it lands. On the spike at the right, one card from another deck has slipped
    out of the stock, its face handwritten."""
    r = p.rng
    p.paper("#1d4a32", grain=0.4, fibre=1.8)
    p.rect(0, 0, W, H, fill=p.radial([(0, "#f6cf86", 0.22), (0.6, "#1d4a32", 0), (1, "#000", 0.55)], cx=0.45, cy=0.4, r=0.75))
    # deco border inlay in gold: stepped corners all round
    m = 18
    p.rect(m, m, W - 2 * m, H - 2 * m, fill="none", stroke=GOLD, stroke_width=2, opacity=0.7)
    p.rect(m + 8, m + 8, W - 2 * m - 16, H - 2 * m - 16, fill="none", stroke=GOLD, stroke_width=0.8, opacity=0.6)
    for cx_, cy_, sx_, sy_ in [(m + 8, m + 8, 1, 1), (W - m - 8, m + 8, -1, 1), (m + 8, H - m - 8, 1, -1),
                               (W - m - 8, H - m - 8, -1, -1)]:
        for k in range(4):
            rr = 18 + k * 14
            p.path(f"M{f(cx_ + sx_ * rr)},{f(cy_)} A{rr},{rr} 0 0,{1 if sx_ * sy_ > 0 else 0} {f(cx_)},{f(cy_ + sy_ * rr)}",
                   fill="none", stroke=GOLD, stroke_width=1, opacity=0.55)
    # stock and waste, top left
    for k in range(5):
        _card_back(p, 60 + k * 1.5, 50 - k * 1.5)
    _card_face(p, 180, 50, "8", "C")
    p.text(60 + CW_ / 2, 206, "PEEK 1", size=13, family="sans-serif", fill=GOLD, text_anchor="middle", letter_spacing=2)
    # foundations top right
    fnd = [("4", "H"), ("2", "S"), ("A", "D"), (None, None)]
    for k, (rk, st) in enumerate(fnd):
        x = 640 + k * 112
        if rk:
            _card_face(p, x, 50, rk, st)
        else:
            p.rect(x, 50, CW_, CH_, rx=7, fill="none", stroke=GOLD, stroke_width=1.2, stroke_dasharray="5 4", opacity=0.7)
            _suit(p, "C", x + CW_ / 2, 50 + CH_ / 2, 24, GOLD)
    # tableau: six columns under brass room numbers
    cols = [[("K", "S")], [("Q", "H")], [("9", "D")], [("7", "S")], [("J", "C")], [("5", "D")]]
    downs = [0, 1, 2, 3, 4, 5]
    tx0, ty0 = 70, 250
    for c in range(6):
        x = tx0 + c * 132
        p.rect(x + 22, ty0 - 34, 48, 22, rx=3, fill=p.gradient([(0, BRASS_L), (1, BRASS)]), stroke="#5d4518", stroke_width=1)
        p.text(x + 46, ty0 - 17, str(401 + c), size=15, family="serif", fill="#2a1a0c", text_anchor="middle", font_weight="bold")
        y = ty0
        for k in range(downs[c]):
            _card_back(p, x, y)
            y += 22
        for rk, st in cols[c]:
            _card_face(p, x, y, rk, st)
            y += 34
    # the run being carried: 6 of hearts and 5 of spades, lifted above column four's black seven
    target = (tx0 + 3 * 132, ty0 + 3 * 22)
    lx, ly = 905 - 60, 470
    p.path(f"M{tx0 + 5 * 132 + 46},{ty0 + 5 * 22 + 20} Q{lx + 120},{ly - 120} {lx + 46},{ly + 20}", fill="none",
           stroke=GOLD, stroke_width=0, opacity=0)
    p.path(f"M{lx + 10},{ly + 40} Q{target[0] + 120},{target[1] + 260} {target[0] + 46},{target[1] + 150}",
           fill="none", stroke=GOLD, stroke_width=2.5, stroke_dasharray="2 10", stroke_linecap="round")
    p.poly([(target[0] + 46, target[1] + 140), (target[0] + 38, target[1] + 160), (target[0] + 58, target[1] + 156)], fill=GOLD)
    p.rect(lx - 6, ly + 10, CW_ + 22, CH_ + 50, rx=10, fill="#000", opacity=0.35, filter=p.blur(8))
    _card_face(p, lx, ly, "6", "H", rot=-6)
    _card_face(p, lx + 6, ly + 34, "5", "S", rot=-6)
    # the spike on the right edge with the slipped card
    sx, sy = 1088, 260
    p.circle(sx, sy + 330, 28, fill=p.radial([(0, BRASS_L, 1), (1, "#5d4518", 1)], cx=0.4, cy=0.35))
    p.line(sx, sy - 40, sx, sy + 320, stroke="#c9c2b0", stroke_width=4, stroke_linecap="round")
    p.open("g", transform=f"rotate(7 {sx} {sy + 120})")
    p.rect(sx - 66, sy + 30, 132, 190, rx=6, fill="#000", opacity=0.3, filter=p.blur(6))
    p.rect(sx - 70, sy + 20, 132, 190, rx=8, fill="#f7f2e6", stroke="#6f7c80", stroke_width=1.5)
    p.rect(sx - 62, sy + 28, 116, 174, rx=4, fill="none", stroke=RIVER, stroke_width=0.8)
    for k in range(6):
        p.line(sx - 58, sy + 30 + k * 30, sx + 50, sy + 30 + k * 30, stroke=RIVER, stroke_width=0.4, opacity=0.6)
    p.text(sx - 56, sy + 50, "3", size=20, family="serif", fill=RIVER)
    lines_ = ["Don't watch", "one door", "too long.", "They see", "the dark."]
    for k, ln in enumerate(lines_):
        p.text(sx - 4, sy + 84 + k * 24, ln, size=17, family="serif", fill="#1a2a5a", font_style="italic",
               text_anchor="middle", transform=f"rotate({r.uniform(-3, 3):.1f} {sx} {sy + 84 + k * 24})")
    p.circle(sx, sy + 24, 4, fill="#3a3a3a")
    p.close()
    # the clock, bottom right
    ccx, ccy = 1090, 700
    p.circle(ccx, ccy, 46, fill="#f3ead2", stroke=GOLD, stroke_width=3)
    for k in range(12):
        a = math.radians(k * 30)
        p.line(ccx + 36 * math.sin(a), ccy - 36 * math.cos(a), ccx + 42 * math.sin(a), ccy - 42 * math.cos(a),
               stroke="#13140f", stroke_width=2 if k % 3 == 0 else 1)
    p.line(ccx, ccy, ccx + 18 * math.sin(math.radians(0.75 * 360 / 12 * 1 + 345)), ccy - 18 * math.cos(math.radians(345)),
           stroke="#13140f", stroke_width=3, stroke_linecap="round")
    p.line(ccx, ccy, ccx + 32 * math.sin(math.radians(270)), ccy - 32 * math.cos(math.radians(270)),
           stroke="#13140f", stroke_width=2, stroke_linecap="round")
    p.text(60, 760, "PASSES LEFT  2", size=15, family="sans-serif", fill=GOLD, letter_spacing=3)


# ------------------------------------------------------------------------------------------------
# The Mosaic: cork-board collage
# ------------------------------------------------------------------------------------------------
def _pin(p, x, y, color):
    p.ellipse(x + 4, y + 6, 8, 4, fill="#000", opacity=0.35)
    p.circle(x, y, 9, fill=color, stroke="#000", stroke_width=0.6, stroke_opacity=0.4)
    p.circle(x - 3, y - 3, 3, fill="#fff", opacity=0.6)


def _card(p, x, y, w, h, rot, fill="#f4efe2"):
    cx, cy = x + w / 2, y + h / 2
    p.open("g", transform=f"rotate({rot:.1f} {f(cx)} {f(cy)})")
    p.rect(x + 5, y + 7, w, h, fill="#000", opacity=0.28)
    p.rect(x, y, w, h, fill=fill, stroke="#b8ab8a", stroke_width=0.8)


@register(G, "mosaic")
def mosaic(p: Pic):
    """The Mosaic (1D): the cork board where six guests' cards hang in a row, places and objects
    above them, stamped statement slips below. A red thread pulled taut between 402 and 404 has
    just proved true, and its question card is pinned at the top; a blue dashed thread from 401 to
    the Bonded House is taut too, while a wrong guess hangs slack. Spools of four thread colours
    wait on the right."""
    r = p.rng
    # cork: warm base, layered specks of darker and lighter granules
    p.rect(0, 0, W, H, fill="#b5824e")
    p.stipple(0, 0, W, H, n=2600, r=(0.8, 2.6), fill="#8a5a30")
    p.stipple(0, 0, W, H, n=1500, r=(0.6, 1.8), fill="#d7a874")
    p.stipple(0, 0, W, H, n=800, r=(1.0, 3.0), fill="#6e4422")
    p.vignette(0.5)
    # frame
    p.rect(0, 0, W, H, fill="none", stroke="#4a2f18", stroke_width=26)
    p.rect(13, 13, W - 26, H - 26, fill="none", stroke="#7a5230", stroke_width=3)
    # ---- six guest cards across the middle
    gy = 330
    guests = []
    for i in range(6):
        x = 60 + i * 168
        rot = r.uniform(-4, 4)
        _card(p, x, gy, 130, 170, rot)
        p.rect(x + 12, gy + 12, 106, 100, fill="#2e3a33")
        # painted head-and-shoulders silhouette, back-lit by the room's lamp colour
        lamp = ["#e8ecf2", "#7b9ad0", "#dfe6d6", "#e8c060", "#8fd0c8", "#d06a5a"][i]
        p.circle(x + 65, gy + 60, 48, fill=lamp, opacity=0.35, filter=p.blur(10))
        p.path(f"M{x + 25},{gy + 112} Q{x + 30},{gy + 78} {x + 65},{gy + 76} Q{x + 100},{gy + 78} {x + 105},{gy + 112}Z",
               fill="#1a1d1c")
        p.ellipse(x + 65, gy + 56, 17, 21, fill="#1a1d1c")
        p.text(x + 65, gy + 145, str(401 + i), size=26, family="monospace", fill=INK, text_anchor="middle", font_weight="bold")
        p.close()
        _pin(p, x + 65, gy + 8, ["#c33", "#2a5ab0", "#d9b02a", "#eee", "#c33", "#2a5ab0"][i])
        guests.append((x + 65, gy + 8))
    # ---- places and objects above
    things = [("BONDED HOUSE", 70, 140), ("THE CASE", 300, 120), ("THE LEDGER", 520, 150),
              ("THE GALA", 820, 120), ("STRANGER", 1010, 160)]
    tpins = {}
    for lab, x, y in things:
        w = 22 + len(lab) * 11
        rot = r.uniform(-5, 5)
        _card(p, x, y, w, 64, rot, fill="#efe4c8")
        p.line(x + 8, y + 22, x + w - 8, y + 22, stroke="#c26a5a", stroke_width=1, opacity=0.7)
        for k in range(2):
            p.line(x + 8, y + 36 + k * 12, x + w - 8, y + 36 + k * 12, stroke="#8aa0c0", stroke_width=0.7, opacity=0.6)
        p.text(x + w / 2, y + 48, lab, size=17, family="monospace", fill=INK, text_anchor="middle")
        p.close()
        _pin(p, x + w / 2, y + 8, "#ddd")
        tpins[lab] = (x + w / 2, y + 8)
    # ---- typed statement slips below
    for i in range(5):
        x, y = 70 + i * 205, 580 + (i % 2) * 22
        _card(p, x, y, 180, 64, r.uniform(-3, 3), fill="#f6f3ea")
        p.text(x + 12, y + 26, f"{401 + i} - NIGHT {2 + i % 3}", size=14, family="monospace", fill=CARBON)
        p.text(x + 12, y + 48, ["CASE  GAVE", "PHOTO HID", "LEDGER COPY", "ENVELOPE", "NEEDLE KEPT"][i], size=14,
               family="monospace", fill=CARBON)
        p.circle(x + 150, y + 34, 18, fill="none", stroke="#5a3d8a", stroke_width=2.5, opacity=0.7)
        p.close()
        _pin(p, x + 90, y + 6, "#eee")
    # ---- question cards along the top edge
    for i, (q, x) in enumerate([("What did she give him?", 340), ("Who is he guarding it for?", 700)]):
        _card(p, x, 28, 300, 52, r.uniform(-2, 2), fill="#fff8d8")
        p.text(x + 150, 61, q, size=19, family="serif", fill=INK, text_anchor="middle", font_style="italic")
        p.close()
        _pin(p, x + 150, 34, "#c33")
    # ---- threads
    def taut(a, b, color, width=3, **kw):
        p.line(*a, *b, stroke="#000", stroke_width=width + 2, opacity=0.25, transform="translate(3 5)")
        kw.setdefault("stroke_linecap", "round")
        p.line(*a, *b, stroke=color, stroke_width=width, **kw)

    a, b = guests[1], guests[3]
    p.path(f"M{f(a[0])},{f(a[1])} Q{f((a[0] + b[0]) / 2)},{f(a[1] - 150)} {f(b[0])},{f(b[1])}", fill="none",
           stroke=EVIDENCE, stroke_width=4, stroke_linecap="round")
    p.path(f"M{f(a[0] + 3)},{f(a[1] + 5)} Q{f((a[0] + b[0]) / 2 + 3)},{f(a[1] - 145)} {f(b[0] + 3)},{f(b[1] + 5)}",
           fill="none", stroke="#000", stroke_width=3, opacity=0.25)
    # thread from the taut link up to its question card
    q0 = (490, 34)
    taut(((a[0] + b[0]) / 2, a[1] - 75), q0, EVIDENCE, width=1.6, stroke_dasharray="1 0")
    taut(guests[0], tpins["BONDED HOUSE"], "#2a5ab0", width=3, stroke_dasharray="12 7")
    taut(tpins["BONDED HOUSE"], (850, 34), "#2a5ab0", width=1.6)
    # family: yellow double between 405 and 406
    c, d = guests[4], guests[5]
    for off in (-3, 3):
        p.line(c[0], c[1] + off, d[0], d[1] + off, stroke="#e2c23a", stroke_width=2)
    # after: white dotted 403 -> the case
    taut(guests[2], tpins["THE CASE"], "#f5f2ea", width=3, stroke_dasharray="1 7", stroke_linecap="round")
    # a false link hanging slack: 404 to the gala
    e, g = guests[3], tpins["THE GALA"]
    p.path(f"M{f(e[0])},{f(e[1])} C{f(e[0] + 40)},{f(e[1] + 160)} {f(g[0] - 40)},{f(g[1] + 260)} {f(g[0])},{f(g[1])}",
           fill="none", stroke=EVIDENCE, stroke_width=2.5, opacity=0.8)
    # ---- spools on the right
    for i, (col, dash) in enumerate([(EVIDENCE, None), ("#2a5ab0", "8 5"), ("#e2c23a", None), ("#f5f2ea", "1 5")]):
        sx, sy = 1130, 300 + i * 70
        p.rect(sx - 28, sy - 24, 56, 8, rx=2, fill="#c8a06a", stroke="#5a3a1a", stroke_width=1)
        p.rect(sx - 28, sy + 16, 56, 8, rx=2, fill="#c8a06a", stroke="#5a3a1a", stroke_width=1)
        p.rect(sx - 22, sy - 16, 44, 32, fill=col)
        for k in range(6):
            p.line(sx - 22, sy - 14 + k * 6, sx + 22, sy - 12 + k * 6, stroke="#000", stroke_width=0.6, opacity=0.25)
    p.text(1130, 270, "LENGTHS 4", size=13, family="monospace", fill="#f5f2ea", text_anchor="middle")

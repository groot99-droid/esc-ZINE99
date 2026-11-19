"""Climb backdrops: two sequences in three parallax planes, and the Stencil Wall. Cave painting: ochre and
charcoal on rock, hand stencils blown around a hand."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Climb backdrops, 2 sequences × 3 planes, and the Stencil Wall"
W, H = 900, 1600
CHAR, OCH = kit.CHAR, kit.OCHRE
ROCKS = {1: [(0, "#d9c3a0"), (0.5, "#b9b4ac"), (1, "#8fa2b6")], 2: [(0, "#f2c48a"), (0.35, "#e2a878"), (1, "#cdbb9c")]}


def rock(a, stops, w, h, patches=70, cracks=14):
    a.rect(0, 0, w, h, fill=a.gradient(stops))
    a.open("g", filter=a.roughen(9, 0.02))
    for _ in range(patches):
        cx, cy, r = a.rng.uniform(0, w), a.rng.uniform(0, h), a.rng.uniform(30, 130)
        pts = [(cx + r * math.cos(t) * a.rng.uniform(.6, 1.1), cy + r * .6 * math.sin(t) * a.rng.uniform(.6, 1.1)) for t in [k * math.pi / 5 for k in range(10)]]
        a.path(a.smooth_d(pts, closed=True), fill=a.rng.choice(["#c9a57e", "#e6d2b0", "#b89c80", "#9fa9b0", "#d9b48a"]), opacity=0.33)
    a.close()
    for _ in range(cracks):
        x, y = a.rng.uniform(0, w), a.rng.uniform(0, h)
        pts = [(x, y)]
        for _ in range(6):
            x += a.rng.uniform(-40, 40)
            y += a.rng.uniform(10, 60)
            pts.append((x, y))
        a.wobble(pts, amp=2, step=10, stroke="#5b4636", stroke_width=1.3, opacity=0.45)
    kit.speckle(a, 0, 0, w, h, "#5b4636", opacity=0.5, freq=0.45)
    a.stipple(0, 0, w, h, n=int(w * h / 6000), r=(1, 2.4), fill="#5b4636", opacity=0.3)


def stencil(a, sx, sy, s, rot, col, bare="#e3cdaa", dots=140):
    a.circle(sx, sy + 20 * s, 120 * s, fill=a.radial([(0, col, 0.85), (0.55, col, 0.55), (1, col, 0)]))
    if dots:
        a.stipple(sx - 120 * s, sy - 100 * s, 240 * s, 240 * s, n=dots, r=(0.6, 1.9), fill=col, opacity=0.6,
                  density=lambda x, y: max(0, 1 - math.hypot(x - sx, y - sy - 20 * s) / (120 * s)))
    a.path(kit.hand_d(sx, sy, s, rot), fill=bare, opacity=0.93)


def painted(a, x, y, s, col, pose=0):
    """A small painted climber: tapered body, round head, line limbs, in ochre."""
    sw = dict(stroke=col, stroke_width=8 * s, stroke_linecap="round", fill="none")
    a.path(f"M{f(x)},{f(y)} L{f(x + 5 * s)},{f(y - 58 * s)}", **sw)
    a.circle(x + 7 * s, y - 74 * s, 13 * s, fill=col)
    if pose == 0:
        a.path(f"M{f(x + 4 * s)},{f(y - 44 * s)} L{f(x - 22 * s)},{f(y - 78 * s)} M{f(x + 4 * s)},{f(y - 44 * s)} L{f(x + 30 * s)},{f(y - 30 * s)}", **sw)
        a.path(f"M{f(x)},{f(y)} L{f(x - 22 * s)},{f(y + 22 * s)} L{f(x - 18 * s)},{f(y + 50 * s)} M{f(x)},{f(y)} L{f(x + 26 * s)},{f(y + 30 * s)}", **sw)
    elif pose == 1:     # reaching up
        a.path(f"M{f(x + 4 * s)},{f(y - 46 * s)} L{f(x - 8 * s)},{f(y - 104 * s)} M{f(x + 4 * s)},{f(y - 46 * s)} L{f(x + 26 * s)},{f(y - 100 * s)}", **sw)
        a.path(f"M{f(x)},{f(y)} L{f(x - 14 * s)},{f(y + 50 * s)} M{f(x)},{f(y)} L{f(x + 16 * s)},{f(y + 50 * s)}", **sw)
    else:               # braced, a step
        a.path(f"M{f(x + 4 * s)},{f(y - 46 * s)} L{f(x + 36 * s)},{f(y - 58 * s)} L{f(x + 44 * s)},{f(y - 86 * s)} M{f(x + 4 * s)},{f(y - 46 * s)} L{f(x - 28 * s)},{f(y - 30 * s)}", **sw)
        a.path(f"M{f(x)},{f(y)} L{f(x - 24 * s)},{f(y + 28 * s)} L{f(x - 30 * s)},{f(y + 56 * s)} M{f(x)},{f(y)} L{f(x + 28 * s)},{f(y + 30 * s)} L{f(x + 22 * s)},{f(y + 56 * s)}", **sw)


def far(a, n):
    rock(a, ROCKS[n], W, H, patches=90, cracks=18)
    # light at the top of the shaft; heat in the second sequence
    a.ellipse(450, -30, 420, 260 if n == 1 else 420, fill=a.radial([(0, "#fff3d0", 1), (0.5, kit.GOLD, 0.75), (1, kit.HILITE, 0)]))
    if n == 2:
        a.rect(0, 0, W, 700, fill=a.gradient([(0, kit.RIVER), (1, "#e2a878")]), opacity=0.3)
    # what earlier groups painted, half worn away: rows of four climbers, a raft at the top
    for row in range(5):
        y = 1420 - row * 290 + a.rng.uniform(-20, 20)
        x0 = a.rng.uniform(90, 200) if row % 2 else a.rng.uniform(480, 560)
        for k in range(4 if row != 2 else 3):
            painted(a, x0 + k * 62 + a.rng.uniform(-6, 6), y - k * 26, 0.62, kit.DEEP if (row + k) % 3 else OCH, pose=(k + row) % 2)
    a.rect(0, 0, W, H, fill=ROCKS[n][1][1], opacity=0.42)   # the wear over them
    kit.speckle(a, 0, 0, W, H, "#e6d2b0", opacity=0.7, freq=0.3, cut=5.4)
    a.vignette(0.5, "#2a1a10")


def mid(a, n):
    r = a.rng
    lw = [(210 + 34 * math.sin(y * 0.008 + n), y) for y in range(-10, H + 20, 40)]
    rw = [(690 + 34 * math.sin(y * 0.0095 + 2 + n), y) for y in range(-10, H + 20, 40)]
    for wall, s in ((lw, 1), (rw, -1)):
        a.wobble(wall, amp=3, step=12, stroke=CHAR, stroke_width=8, stroke_linecap="round", opacity=0.88)
        a.wobble([(x + 15 * s, y) for x, y in wall], amp=3, step=12, stroke=CHAR, stroke_width=2.4, opacity=0.5)
        for (x, y) in wall[::3]:     # charcoal rubbed outward from the wall
            a.wobble([(x - 12 * s, y), (x - 70 * s, y + r.uniform(-14, 14))], amp=3, step=9, stroke=CHAR, stroke_width=r.uniform(3, 9), opacity=0.22, stroke_linecap="round")
    ledges = [1300, 820, 330]
    for i, ly in enumerate(ledges):
        x0, x1 = (250, 520) if i % 2 == 0 else (400, 660)
        a.wobble([(x0, ly), ((x0 + x1) / 2, ly - 5), (x1, ly + 2)], amp=2.5, step=10, stroke=CHAR, stroke_width=13, stroke_linecap="round")
        a.wobble([(x0 + 10, ly + 16), (x1 - 20, ly + 20)], amp=2, step=10, stroke=CHAR, stroke_width=3, opacity=0.5)
        a.wobble([((x0 + x1) / 2, ly + 8), ((x0 + x1) / 2 - 4, ly + 150)], amp=2, step=10, stroke=CHAR, stroke_width=5, opacity=0.6)
        for t in range(i + 1 + (3 if n == 2 else 0)):       # the count of lifts, tallied beside each ledge
            tx = (x1 + 40 if i % 2 == 0 else x0 - 150) + t * 16
            a.wobble([(tx, ly - 60), (tx + 4, ly - 10)], amp=1.5, step=8, stroke=CHAR, stroke_width=5, stroke_linecap="round", opacity=0.8)
    for k in range(33):     # finger-dot holds, zigzagging; firm ones ringed
        y = 1560 - k * 47
        x = 450 + 170 * math.sin(k * 1.3 + n) + r.uniform(-20, 20)
        if any(abs(y - ly) < 34 for ly in ledges):
            continue
        col = kit.RIVER if n == 1 or y > 700 else kit.DEEP
        for j in range(3):
            a.circle(x + j * 10 - 10, y + r.uniform(-3, 3), 5, fill=col, opacity=0.92)
        if k % 3 == 0:
            a.wobble([(x + 30 * math.cos(t), y + 17 * math.sin(t)) for t in [i * 0.42 for i in range(16)]], amp=1.5, step=6, stroke=col, stroke_width=2.8)
    for k, y in enumerate((1120, 560) if n == 1 else (1180, 700, 200)):     # an earlier group's stencil: always firm
        stencil(a, 300 if k % 2 else 600, y, 0.42, -12 + k * 20, kit.DEEP, dots=40)
    # the breathing wall: where the shaft narrows on the fourth beat
    for y in ((980,) if n == 1 else (1010, 470)):
        for s, x in ((1, 236), (-1, 664)):
            for j in range(4):
                a.wobble([(x + s * j * 16, y - 34), (x + s * (j * 16 + 26), y), (x + s * j * 16, y + 34)], amp=1.5, step=9, stroke=OCH, stroke_width=5,
                         stroke_linecap="round", opacity=0.9 - j * .18)


def near(a, n):
    r = a.rng
    for side, s in ((0, 1), (W, -1)):       # the rock nearest the eye, dark, at the edges
        pts = [(side, -20)]
        y = -20
        while y < H + 40:
            pts.append((side + s * r.uniform(40, 150), y))
            y += r.uniform(90, 170)
        pts.append((side, H + 20))
        a.path(a.smooth_d(pts) + "Z", fill="#2a1d16", opacity=0.94, filter=a.roughen(7, 0.03))
        kit.gouges(a, side - 150 if s < 0 else 0, 0, 150, H, 110, "#6a5240", ang=80, spread=18, ln=(14, 40), sw=3,
                   density=lambda x, y, side=side: 1.0 if abs(x - side) < 60 else 0.0)
    big = [(170, 300, 1.25, -20, kit.DEEP), (730, 620, 1.1, 18, kit.RIVER), (180, 1010, 1.0, 10, OCH), (720, 1330, 1.3, -14, kit.DEEP)]
    if n == 2:
        big = [(720, 260, 1.2, 16, kit.RIVER), (170, 560, 1.3, -10, kit.DEEP), (740, 930, 1.0, -22, kit.DEEP), (190, 1290, 1.15, 24, OCH)]
    for sx, sy, s, rot, col in big:
        stencil(a, sx, sy, s, rot, col, bare="#e8d3ae", dots=260)
    if n == 2:      # heat shimmer at the top
        for k in range(9):
            y = 40 + k * 26
            a.path(a.smooth_d([(x, y + 9 * math.sin(x * .03 + k * 1.7)) for x in range(160, 760, 40)]), fill="none", stroke=kit.RIVER, stroke_width=3,
                   opacity=0.5 - k * .045, stroke_linecap="round")
    else:           # cold breath at the foot
        a.rect(0, 1250, W, 350, fill=a.gradient([(0, "#8fa2b6"), (1, kit.MARROW2)]), opacity=0.28)


for _n in (1, 2):
    for _pl, _fn in (("far", far), ("mid", mid), ("near", near)):
        def _draw(a, n=_n, fn=_fn):
            fn(a, n)
        _what = {"far": "the far plane: the rock of the shaft, light growing at the top, and the worn paintings of groups that climbed before",
                 "mid": "the middle plane, on a clear ground: charcoal shaft walls, three ledges too high for one, finger-dot holds with the firm ones ringed, an old firm stencil and the chevrons of the breathing wall",
                 "near": "the near plane, on a clear ground: dark rock at the edges and large hand stencils blown in red and ochre"}[_pl]
        _draw.__doc__ = f"Climb sequence {_n} ({'cold, from the marrow' if _n == 1 else 'hot, under the river'}), {_what}; a cave painting."
        asset(G, f"climb-{_n}-{_pl}", group="backdrops", title=f"Climb {_n}, {_pl} plane", w=W, h=H, row=ROW)(_draw)


@asset(G, "climb-stencil-wall", group="backdrops", title="The Stencil Wall", w=1600, h=900, row=ROW)
def stencil_wall(a: Art):
    """The Stencil Wall: a gallery of hand stencils blown on rock in rows of four, one row for every group that
    ever climbed. Some rows hold three hands and a gap. One bare row, low on the wall, is lit and waiting,
    and four small painted figures reach toward it."""
    rock(a, [(0, "#d6b890"), (0.6, "#d9c3a0"), (1, "#a9a8a6")], 1600, 900, patches=90, cracks=16)
    cols = [kit.DEEP, kit.RIVER, OCH, CHAR]
    ids = []
    for c in cols:
        sid, gid = a.uid("st"), a.uid("sg")
        a.defn(f'<radialGradient id="{gid}"><stop offset="0%" stop-color="{c}" stop-opacity="0.85"/><stop offset="55%" stop-color="{c}" stop-opacity="0.5"/>'
               f'<stop offset="100%" stop-color="{c}" stop-opacity="0"/></radialGradient>'
               f'<g id="{sid}"><circle cx="0" cy="8" r="42" fill="url(#{gid})"/><path d="{kit.hand_d(0, 0, 0.36)}" fill="#e6d0ac" opacity="0.94"/></g>')
        ids.append(sid)
    bare = (4, 5)       # column group, row
    for row in range(7):
        for g in range(8):
            gx, gy = 70 + g * 190 + (row % 2) * 26, 78 + row * 104
            col = ids[a.rng.randrange(4) if a.rng.random() < 0.5 else (row + g) % 4]
            if (g, row) == bare:
                a.ellipse(gx + 66, gy, 120, 58, fill=a.radial([(0, kit.GOLD, 0.75), (0.6, kit.GOLD, 0.3), (1, kit.GOLD, 0)]))
                for k in range(4):
                    a.wobble([(gx + k * 44 + 14 * math.cos(t), gy + 18 * math.sin(t)) for t in [i * .5 for i in range(14)]], amp=1, step=5, stroke=kit.GOLD,
                             stroke_width=2.5, stroke_dasharray="3 5")
                continue
            gap = a.rng.random() < 0.16 and a.rng.randrange(4)
            gapk = a.rng.randrange(4) if gap is not False and a.rng.random() < 0.9 and gap else None
            for k in range(4):
                if k == gapk:
                    continue
                a.raw(f'<use href="#{col}" transform="translate({f(gx + k * 40 + a.rng.uniform(-3, 3))},{f(gy + a.rng.uniform(-6, 6))}) rotate({f(a.rng.uniform(-16, 16))}) '
                      f'scale({f(a.rng.uniform(.9, 1.12))})" opacity="{f(a.rng.uniform(.55, 1))}"/>')
    kit.speckle(a, 0, 0, 1600, 900, "#e6d2b0", opacity=0.6, freq=0.3, cut=5.4)
    # four at the foot of the wall, reaching
    gx, gy = 70 + bare[0] * 190 + 26, 78 + bare[1] * 104
    for k in range(4):
        painted(a, gx - 8 + k * 46, 860, 0.9, [kit.DEEP, OCH, kit.RIVER, kit.DEEP][k], pose=1)
    a.wobble([(gx - 80, 906), (gx + 240, 902)], amp=2, step=10, stroke=CHAR, stroke_width=9, stroke_linecap="round", opacity=0.8)
    a.vignette(0.6, "#2a1a10")

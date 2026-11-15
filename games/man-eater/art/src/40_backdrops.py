"""Backdrops: the four night halls as a lit sheet, the three yard plates, and the prints developed from them."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, GREEN, SODIUM, STEEL, FROST, SNOW, BRUISE = (kit.INK, kit.CREAM, kit.GREEN, kit.SODIUM, kit.STEEL,
                                                         kit.FROST, kit.SNOW, kit.BRUISE)
ROW_C = "Halls backdrops and cut-outs (Fisk at five heights, guard, orderly, Jax, sheet, flashlight)"
ROW_Y = "Yard plates and developed prints"
FLOOR, CEIL = 760, 60
M = (FLOOR - CEIL) / 4.57  # pixels per metre: the halls are 15 feet high


def Y(m):
    return FLOOR - m * M


def _door(a, x, soft, label=None, ajar=False, heavy=False):
    w, top = 150, Y(2.75)
    a.rect(x - 10, top - 12, w + 20, FLOOR - top + 12, fill=INK, opacity=0.9, filter=soft)
    a.rect(x, top, w, FLOOR - top, fill="#39352d" if not ajar else "#C9B37A", filter=soft)
    if ajar:
        a.poly([(x, top), (x + 46, top + 24), (x + 46, FLOOR), (x, FLOOR)], fill=INK, opacity=0.92)
        a.poly([(x + 46, FLOOR), (x + w, FLOOR), (x + w + 260, 900), (x - 40, 900)], fill=SODIUM, opacity=0.4,
               filter=a.blur(10))
    else:
        a.path(f"M{x + 12},{top + 14}h{w - 24}v{(FLOOR - top) * 0.42}h{-(w - 24)}z M{x + 12},{top + (FLOOR - top) * 0.5}"
               f"h{w - 24}v{(FLOOR - top) * 0.44}h{-(w - 24)}z", fill="none", stroke=INK, stroke_width=3, opacity=0.8)
        # the steel lever at 2.4 m; the brass knob a man can reach
        a.rect(x + w - 54, Y(2.4), 42, 7, rx=3, fill=INK)
        a.circle(x + w - 22, Y(1.0), 6, fill="#8a7a55")
    if heavy:
        a.circle(x + w / 2, Y(1.3), 30, fill="none", stroke=INK, stroke_width=7)
        a.path(f"M{x + w / 2 - 30},{Y(1.3)}h60M{x + w / 2},{Y(1.3) - 30}v60", stroke=INK, stroke_width=5)
        for hy in (Y(2.3), Y(0.4)):
            a.rect(x - 16, hy, 40, 14, fill=INK)
    if label:
        kit.stencil(a, x + w / 2, top - 26, label, 24, fill="#39352d", anchor="middle")


def _drain(a, x, mist=0.0):
    a.rect(x, FLOOR + 6, 70, 12, fill="#000")
    a.path("".join(f"M{x + 6 + i * 10},{FLOOR + 6}v12" for i in range(7)), stroke="#5c5346", stroke_width=2.5)
    if mist:
        g = a.radial([(0, SNOW, 0.75 * mist), (1, SNOW, 0)])
        a.ellipse(x + 35, FLOOR - 30, 150, 110, fill=g)
        kit.frost(a, x + 35, FLOOR + 6, 200, 340, 90 * mist, n=4, haze=False, op=0.8)


def _hall(a, night):
    rng = a.rng
    fade = night == 7
    a.rect(0, 0, 1600, 900, fill="#b7b09c")
    glow = a.radial([(0, "#F3EAD2", 1), (0.6, CREAM if not fade else "#D2D0C8", 1), (1, "#9c9480" if not fade else "#96989a", 1)],
                    cx=0.4, cy=0.36, r=0.8)
    a.rect(0, 0, 1600, 900, fill=glow)
    kit.hatch_in(a, 0, 0, 1600, 900, angle=0, spacing=6, stroke="#6d6450", stroke_width=0.5, opacity=0.2)
    kit.hatch_in(a, 0, 0, 1600, 900, angle=90, spacing=6, stroke="#6d6450", stroke_width=0.5, opacity=0.13)
    soft, softer = a.blur(2.2), a.blur(9)
    # ceiling shadow and the frosted windows at 3.5 m, their light falling long and down
    a.rect(0, 0, 1600, CEIL, fill=INK, opacity=0.85, filter=soft)
    wins = list(range(90, 1600, 300 if night != 7 else 210))
    for wx in wins:
        a.rect(wx, Y(4.25), 150, Y(3.5) - Y(4.25), fill="#FBF7EA", opacity=0.95)
        a.path(f"M{wx + 75},{Y(4.25)}V{Y(3.5)}M{wx},{(Y(4.25) + Y(3.5)) / 2}h150", stroke=INK, stroke_width=6, filter=soft)
        a.rect(wx - 6, Y(4.25) - 6, 162, Y(3.5) - Y(4.25) + 12, fill="none", stroke=INK, stroke_width=6, filter=soft)
        a.poly([(wx, Y(3.5)), (wx + 150, Y(3.5)), (wx + 390, FLOOR), (wx + 170, FLOOR)], fill="#fff", opacity=0.16)
        kit.frost(a, wx, Y(3.5), 280, 350, 50 + night * 7, n=3, haze=False, color="#8f9aa3", op=0.7, budget=60)
    # claw marks, at 3.6 m
    for cx in ((520, 1290) if night != 2 else (700,)):
        for i in range(4):
            a.wobble([(cx + i * 16, Y(3.75)), (cx + i * 16 + 30, Y(2.95))], amp=2.5, step=22, stroke=INK, stroke_width=4,
                     opacity=0.55, stroke_linecap="round", filter=soft)
    # the pipe run at 2.7 m
    a.rect(0, Y(2.7) - 8, 1600, 16, fill=INK, filter=soft)
    a.rect(0, Y(2.7) - 30, 1600, 8, fill=INK, opacity=0.8, filter=soft)
    a.path("".join(f"M{bx},{Y(2.7) - 36}v52" for bx in range(60, 1600, 170)), stroke=INK, stroke_width=9, filter=soft)
    for vx in ((400, 1180) if night in (4, 6) else (980,)):
        a.circle(vx, Y(2.7), 20, fill="none", stroke=INK, stroke_width=7, filter=soft)
        a.line(vx, Y(2.7) - 20, vx, Y(2.7) + 20, stroke=INK, stroke_width=5)
    # the night's own furniture
    if night == 2:
        for i, dx in enumerate((150, 520, 890)):
            _door(a, dx, soft, label=f"BUNK {i + 3}")
        _door(a, 1300, soft, label="LATRINE")
        _drain(a, 1120)
        a.rect(730, Y(0.9), 120, Y(0.15) - Y(0.9), fill="none", stroke=INK, stroke_width=6, filter=soft)
        a.path("".join(f"M{742 + i * 14},{Y(0.9)}V{Y(0.15)}" for i in range(8)), stroke=INK, stroke_width=5, filter=soft)
        # the frozen print, forty centimetres
        kit.frost(a, 1010, FLOOR + 30, 0, 360, 46, n=6, op=0.9)
        a.ellipse(1010, FLOOR + 30, 0.4 * M * 0.55, 9, fill="#000", opacity=0.75)
        a.ellipse(1010 + 0.4 * M * 0.62, FLOOR + 30, 8, 6, fill="#000", opacity=0.75)
    elif night == 4:
        _door(a, 120, soft, label="MAIL")
        _door(a, 560, soft, label="FILES", ajar=True)
        a.rect(1130, CEIL, 470, FLOOR - CEIL, fill=INK, opacity=0.93, filter=soft)   # the corner
        kit.stencil(a, 1160, Y(3.0), "OFFICERS", 30, fill="#8f876f")
        a.poly([(1130, CEIL), (1130, FLOOR), (980, FLOOR)], fill=INK, opacity=0.25, filter=softer)
        a.path(f"M930,{Y(2.7) - 40}V{FLOOR}M990,{Y(2.7) - 40}V{FLOOR}" + "".join(
            f"M930,{Y(2.7) - 20 + ry * 40:.0f}h60" for ry in range(11)), stroke=INK, stroke_width=6, fill="none", filter=soft)
        _drain(a, 380)
    elif night == 6:
        _door(a, 80, soft, label="LAUNDRY")
        _door(a, 880, soft, label="COLD STORE", heavy=True)
        for sx, sw_ in ((330, 230), (600, 200)):
            a.path(f"M{sx - 30},{Y(2.55)} Q{sx + sw_ / 2},{Y(2.4)} {sx + sw_ + 30},{Y(2.55)}", fill="none", stroke=INK,
                   stroke_width=3)
            a.rect(sx, Y(2.5), sw_, Y(0.35) - Y(2.5), fill="#EFE8D4", stroke="#6d6450", stroke_width=2, opacity=0.95)
            a.path("".join(f"M{sx + 20 + i * 38},{Y(2.5)}V{Y(0.35)}" for i in range(int(sw_ / 38))), stroke="#8f876f",
                   stroke_width=8, opacity=0.4)
        for dx, m in ((250, 0.6), (760, 0.9), (1120, 1.0)):
            _drain(a, dx, mist=m)
        # the stair door where the plan left a void: hatched, no handle on this side
        a.rect(1340, Y(2.75), 170, FLOOR - Y(2.75), fill=INK, opacity=0.9, filter=soft)
        kit.hatch_in(a, 1352, Y(2.75) + 12, 146, FLOOR - Y(2.75) - 12, angle=45, spacing=14, stroke=CREAM, stroke_width=2,
                     opacity=0.5)
        a.path(f"M1352,{FLOOR - 4} l36,-40 l36,0 l0,-40 l36,0 l0,-40 l38,0", fill="none", stroke=CREAM, stroke_width=3,
               opacity=0.7)
    else:
        for dx in (140, 520, 900):
            _door(a, dx, soft, ajar=dx == 520)
        # the far end: an open way, pale, and the cold coming along the floor
        a.rect(1360, Y(4.2), 240, FLOOR - Y(4.2), fill=a.gradient([(0, "#ffffff"), (1, "#dfe5e8")]), filter=softer)
        a.rect(1340, Y(4.25), 22, FLOOR - Y(4.25), fill=INK, filter=soft)
        g = a.radial([(0, SNOW, 0.9), (1, SNOW, 0)])
        a.ellipse(1480, FLOOR, 520, 150, fill=g)
        for fx in range(700, 1600, 150):
            kit.frost(a, fx, FLOOR + 4, 185, 355, 60 + (fx - 700) * 0.14, n=4, haze=False, budget=70)
    # floor
    a.rect(0, FLOOR, 1600, 900 - FLOOR, fill="#2a2420")
    a.rect(0, FLOOR, 1600, 5, fill="#0d0b09")
    a.path("".join(f"M{x},{FLOOR + 5}L{x - 60},900" for x in range(100, 1700, 180)), stroke="#3a322b", stroke_width=2)
    if night in (2, 4, 6, 7):
        # redraw what stands on the floor line so the floor does not cover it
        pass
    kit.stencil(a, 40, 880, f"NIGHT {night}", 26, fill="#8f876f")
    kit.frost_corners(a, 0.05 + 0.07 * night, op=0.7)
    a.vignette(0.5)


HALLS = {2: ("bunk to latrine", "bunk doors with a lever high and a knob low, the latrine at the end, one drain, and a "
             "print forty centimetres long frozen into the floor"),
         4: ("bunk to officers' wing", "the file room door held open with sodium light spilled across the floor, a ladder "
             "to the pipes, and the dark corner of the officers' wing the shadow reaches first"),
         6: ("bunk to cold store", "laundry sheets hung across the way, three drains breathing cold, the cold store's "
             "wheel door and the hatched stair door the floor plan said had to be there"),
         7: ("toward the call", "no guards, every window lit, a door standing open, the colour gone out of the sheet and "
             "frost running along the floor from the pale far end")}
for _n, (_route, _what) in HALLS.items():
    def _mk(n=_n, route=_route, what=_what):
        def fn(a: Art):
            _hall(a, n)
        fn.__doc__ = (f"Silhouette halls backdrop for night {n}, {route}: the tall hall side-on as a lit cream sheet, windows "
                      f"at 3.5 m throwing light long and down, the pipe run at 2.7 m, claw marks higher than a man; {what}.")
        return fn
    asset(G, f"halls-night-{_n}", group="backdrops", title=f"Silhouette halls backdrop, night {_n}: {_route}", w=1600,
          h=900, row=ROW_C)(_mk())


# ---- the yard from the air ------------------------------------------------------------------------
X0, Y0, X1, Y1 = 50, 50, 1550, 830


def _roof(a, bx, by, bw, bh, sh=44):
    a.poly([(bx + bw, by), (bx + bw + sh, by + sh * 0.8), (bx + bw + sh, by + bh + sh * 0.8), (bx + sh, by + bh + sh * 0.8),
            (bx, by + bh)], fill="#4f595f", opacity=0.75)
    a.rect(bx, by, bw, bh, fill="#a5adb2")
    a.line(bx, by + bh / 2, bx + bw, by + bh / 2, stroke="#6f787e", stroke_width=3)
    a.path("".join(f"M{bx + t * 14},{by}v{bh}" for t in range(1, int(bw / 14))), stroke="#8c959b", stroke_width=1)


def _trees(a, x0, x1, y0, y1, n, skip=None):
    a.open("g", filter=a.roughen(9, 0.07), fill="#2e3439")
    for _ in range(n):
        cx, cy = a.rng.uniform(x0, x1), a.rng.uniform(y0, y1)
        if skip and skip(cx, cy):
            continue
        r = a.rng.uniform(12, 30)
        a.circle(cx, cy, r, opacity=0.85)
        a.circle(cx + r * 0.9, cy + r * 0.8, r * 0.8, opacity=0.25)
    a.close()


def _wire(a, y_at, posts=40):
    a.path("M" + " L".join(f"{X0 + i * (X1 - X0) / 20:.0f},{y_at(X0 + i * (X1 - X0) / 20):.0f}" for i in range(21)),
           fill="none", stroke="#2c3338", stroke_width=2)
    d = ""
    for kx in range(posts + 1):
        x = X0 + kx * (X1 - X0) / posts
        y = y_at(x)
        d += f"M{x - 3:.0f},{y:.0f}a3,3 0 1,0 6,0a3,3 0 1,0 -6,0M{x:.0f},{y:.0f}l14,11"
    a.path(d, fill="#2c3338", stroke="#59636a", stroke_width=1.5)


def _trail(a, path, size, step, bare=False, color="#3f4a52", fade=0.0, start_left=True):
    pts = []
    for (ax, ay), (bx, by) in zip(path, path[1:]):
        n = max(1, int(math.hypot(bx - ax, by - ay) / step))
        for i in range(n):
            t = i / n
            pts.append((ax + (bx - ax) * t, ay + (by - ay) * t, math.atan2(by - ay, bx - ax)))
    for i, (x, y, ang) in enumerate(pts):
        age = 1 - i / max(1, len(pts))
        kit.footprint(a, x, y, ang, size, color=color, left=(i % 2 == 0) == start_left, opacity=1 - age * fade, bare=bare)
    return pts


def _plate_base(a):
    a.rect(0, 0, 1600, 900, fill="#111")
    a.rect(X0, Y0, X1 - X0, Y1 - Y0, fill=a.gradient([(0, "#e6eaec"), (1, "#cdd3d6")], 0, 0, 1, 1))
    a.open("g", clip_path=a.clip(f'<rect x="{X0}" y="{Y0}" width="{X1 - X0}" height="{Y1 - Y0}"/>'))
    for i in range(16):
        y = Y0 + a.rng.uniform(0, Y1 - Y0)
        pts = [(X0 + k * 110, y + 20 * math.sin(k * 0.7 + i) + a.rng.uniform(-8, 8)) for k in range(15)]
        a.path(a.smooth_d(pts), fill="none", stroke="#b4bcc1", stroke_width=a.rng.uniform(6, 22), opacity=0.33)


def _plate_finish(a, night, frame, label):
    a.close()
    kit.film(a, X0, Y0, X1 - X0, Y1 - Y0, 0.55, 1.5)
    a.rect(X0, Y0, X1 - X0, Y1 - Y0, fill=a.radial([(0.6, "#000", 0), (1, "#000", 0.38)], r=0.72))
    d = ""
    for gx in range(X0, X1 + 1, 100):
        for gy in range(Y0 + 80, Y1, 100):
            d += f"M{gx - 6},{gy}h12M{gx},{gy - 6}v12"
    for gx in range(X0, X1 + 1, 25):
        L = 14 if (gx - X0) % 100 == 0 else 7
        d += f"M{gx},{Y0}v{L}M{gx},{Y1}v{-L}"
    a.path(d, stroke="#111", stroke_width=1.2, opacity=0.7, fill="none")
    a.path("".join(f"M{k + 10},12h18v22h-18zM{k + 10},{900 - 44}h18v22h-18z" for k in range(0, 1600, 40)), fill="#2a2a2a")
    for i, x in enumerate((200, 760, 1320)):
        a.text(x, 884, f"FRAME {frame + i:03d}", size=15, family="monospace", fill="#cfcfcf")
    a.text(X0 + 16, Y1 - 18, label, size=20, family="monospace", fill="#111", font_weight="bold")
    # the compass tick the lab adds
    a.path(f"M{X1 - 60},{Y1 - 30}v-50l-9,16m9,-16l9,16", fill="none", stroke="#111", stroke_width=2.5)
    a.text(X1 - 60, Y1 - 88, "N", size=18, family="monospace", fill="#111", text_anchor="middle", font_weight="bold")
    kit.frost_corners(a, 0.04 + night * 0.035, op=0.6)


def _tower(a, x, y, lx, ly, r=90):
    a.line(x, y, lx, ly, stroke="#fff", stroke_width=30, opacity=0.16)
    a.circle(lx, ly, r, fill=a.radial([(0, "#fff", 0.95), (0.8, "#fff", 0.55), (1, "#fff", 0)]))
    a.rect(x - 15, y - 15, 30, 30, fill="#2c3338")
    a.poly([(x + 15, y - 15), (x + 50, y + 16), (x + 50, y + 46), (x + 15, y + 15)], fill="#4f595f", opacity=0.7)


@asset(G, "yard-plate-night-3", group="backdrops", title="Snow line plate, night 3: barracks to the kennel shed",
       w=1600, h=900, row=ROW_Y)
def yard3(a: Art):
    """An aerial reconnaissance print of the yard on night 3: barracks roofs with long shadows along the bottom,
    the kennel shed and its pen at the top, the wire between, the tower's searchlight circle on the snow
    and a lamp patrol's old track, with grid ticks and frame numbers on the film edge."""
    _plate_base(a)
    for b in ((120, 650, 330, 120), (540, 690, 280, 100), (1150, 670, 280, 110)):
        _roof(a, *b)
    a.rect(280, 640, 40, 14, fill="#2c3338")
    _trees(a, X0, X1, Y0, 150, 34, skip=lambda x, y: 820 < x < 1140)
    a.poly([(980, 160), (1100, 160), (1140, 190), (1140, 270), (1020, 270)], fill="#4f595f", opacity=0.75)
    a.rect(960, 130, 130, 110, fill="#a5adb2")
    a.path("".join(f"M{960 + t * 13},130v110" for t in range(1, 10)), stroke="#8c959b", stroke_width=1)
    a.rect(880, 104, 300, 200, fill="none", stroke="#4a545b", stroke_width=2.5, stroke_dasharray="4 6")
    _wire(a, lambda x: 380 - (x - X0) * 0.03)
    patrol = [(60, 560), (300, 520), (620, 560), (900, 500), (1250, 540), (1540, 500)]
    a.path(a.smooth_d(patrol), fill="none", stroke="#6c767c", stroke_width=7, stroke_dasharray="3 9", opacity=0.8)
    _tower(a, 1440, 400, 1130, 470)
    a.path(a.smooth_d([(700, 300), (1150, 330), (1250, 500), (900, 600), (620, 470)], closed=True), fill="none",
           stroke="#fff", stroke_width=2, stroke_dasharray="10 9", opacity=0.75)
    _plate_finish(a, 3, 47, "N3  0247H  YARD  1:600")


@asset(G, "yard-plate-night-5", group="backdrops", title="Snow line plate, night 5: the bare prints to the adit", w=1600,
       h=900, row=ROW_Y)
def yard5(a: Art):
    """An aerial print of the east yard on night 5: the latrine block at the lower left, deep drifts, and a line of
    bare prints two metres apart that the wind has not filled, running to the black mouth of the adit in
    the bank at the upper right; two patrol tracks cross the plate."""
    _plate_base(a)
    _roof(a, 100, 660, 260, 110)
    a.rect(330, 700, 30, 26, fill="#2c3338")
    for dx, dy, rx, ry in ((560, 560, 170, 70), (980, 640, 200, 60), (760, 330, 150, 60), (1260, 420, 120, 50)):
        a.ellipse(dx, dy, rx, ry, fill="#aab3b9", opacity=0.6, filter=a.blur(14))
        a.ellipse(dx - 20, dy - 14, rx * 0.8, ry * 0.6, fill="#f3f6f7", opacity=0.6, filter=a.blur(10))
    # the bank and the adit
    a.open("g", filter=a.roughen(12, 0.03))
    a.poly([(1050, Y0), (X1, Y0), (X1, 330), (1380, 300), (1250, 190), (1120, 150)], fill="#7d878d")
    a.poly([(1120, Y0), (X1, Y0), (X1, 250), (1400, 220), (1290, 130)], fill="#59636a")
    a.close()
    a.ellipse(1330, 250, 46, 30, fill="#0c0d0e")
    a.path("M1284,250 a46,30 0 0 1 92,0", fill="none", stroke="#2c3338", stroke_width=6)
    a.poly([(1290, 276), (1370, 276), (1330, 380), (1240, 370)], fill="#8f989d", opacity=0.6)
    _trees(a, X0, 1000, Y0, 130, 24)
    _wire(a, lambda x: 210 + (x - X0) * 0.02 if x < 1040 else -100)
    for p in ([(60, 470), (400, 430), (800, 470), (1100, 400), (1540, 460)],
              [(500, 830), (560, 640), (700, 520), (720, 300), (640, 60)]):
        a.path(a.smooth_d(p), fill="none", stroke="#6c767c", stroke_width=7, stroke_dasharray="3 9", opacity=0.8)
    _trail(a, [(372, 700), (560, 610), (800, 520), (1040, 400), (1220, 320), (1310, 268)], 46, 96, bare=True,
           color="#22282c")
    _tower(a, 180, 330, 520, 380, r=80)
    a.text(830, 560, "2 M", size=17, family="monospace", fill="#111", font_weight="bold")
    a.path("M800,540 l86,-42", stroke="#111", stroke_width=1.5)
    _plate_finish(a, 5, 88, "N5  0031H  EAST YARD  1:600")


@asset(G, "yard-plate-night-7", group="backdrops", title="Snow line plate, night 7: the wire and the open strip", w=1600,
       h=900, row=ROW_Y)
def yard7(a: Art):
    """An aerial print of the perimeter on night 7: the barracks at the bottom edge, the fence posts and the wire
    with one gap marked, then four hundred metres of open snow with nothing on it to hide behind, and the
    tree line along the top; both towers' lights are on the strip."""
    _plate_base(a)
    _roof(a, 160, 760, 380, 60, sh=30)
    _roof(a, 700, 770, 300, 50, sh=30)
    _trees(a, X0, X1, Y0, 150, 60)
    a.open("g", filter=a.roughen(10, 0.05), fill="#2e3439")
    a.rect(X0, Y0, X1 - X0, 60, opacity=0.85)
    a.close()
    _wire(a, lambda x: 640 + (x - X0) * 0.015, posts=56)
    # the gap, as Jax's knots gave it
    gx = 610
    a.rect(gx - 6, 628, 46, 40, fill="#dfe4e6")
    a.path(f"M{gx - 14},612 v-22 h62 v22", fill="none", stroke="#111", stroke_width=2)
    a.text(gx + 17, 582, "GAP", size=16, family="monospace", fill="#111", text_anchor="middle", font_weight="bold")
    # the strip, measured
    a.path("M1460,636 V168 M1448,636 h24 M1448,168 h24", stroke="#111", stroke_width=2, fill="none")
    a.text(1440, 410, "400 M", size=20, family="monospace", fill="#111", text_anchor="end", font_weight="bold")
    a.path("".join(f"M1454,{636 - i * 46.8:.0f}h12" for i in range(1, 10)), stroke="#111", stroke_width=1.5)
    _tower(a, 110, 610, 420, 440, r=110)
    _tower(a, 1500, 700, 1150, 520, r=110)
    patrol = [(60, 700), (500, 712), (900, 700), (1540, 722)]
    a.path(a.smooth_d(patrol), fill="none", stroke="#6c767c", stroke_width=7, stroke_dasharray="3 9", opacity=0.8)
    _plate_finish(a, 7, 110, "N7  2214H  PERIMETER  1:1200")


# ---- developed prints, the morning after ---------------------------------------------------------
PW, PH = 1000, 780


def _print_frame(a, frame, caption, lines):
    a.rect(0, 0, PW, PH, fill="#4b3a2a")
    kit.hatch_in(a, 0, 0, PW, PH, angle=6, spacing=7, stroke="#3d2e20", stroke_width=2, jitter=2)
    a.open("g", transform="rotate(-1.5 500 390)")
    a.rect(92, 72, 830, 640, fill="#000", opacity=0.4, filter=a.blur(8))
    a.rect(80, 60, 830, 640, fill="#F1EEE6")
    a.rect(110, 90, 770, 480, fill=a.gradient([(0, "#e3e7e9"), (1, "#c9cfd3")], 0, 0, 1, 1))
    return a.clip('<rect x="110" y="90" width="770" height="480"/>')


def _print_finish(a, frame, caption, lines, stamp_text=None):
    kit.film(a, 110, 90, 770, 480, 0.6, 1.3)
    a.rect(110, 90, 770, 480, fill=a.radial([(0.6, "#000", 0), (1, "#000", 0.4)], r=0.72))
    a.path("".join(f"M{gx},90v10M{gx},570v-10" for gx in range(110, 881, 35)), stroke="#111", stroke_width=1.2)
    a.text(124, 558, f"FRAME {frame}", size=18, family="monospace", fill="#111", font_weight="bold")
    kit.typed(a, 110, 612, caption, size=24)
    for i, ln in enumerate(lines):
        kit.typed(a, 110, 646 + i * 28, ln, size=19)
    if stamp_text:
        kit.stamp(a, 740, 640, stamp_text, w=250, h=64, rot=-5, opacity=0.9, patch=0.7)
    kit.frost_corners(a, 0.16, x=80, y=60, w=830, h=640, op=0.9)
    a.close()
    a.rect(410, 20, 180, 76, rx=12, fill="#9aa0a4", stroke="#3c4144", stroke_width=3)
    a.rect(450, 36, 100, 18, rx=9, fill="#3c4144")
    a.rect(410, 84, 180, 14, fill="#6f7578")
    a.vignette(0.4)


@asset(G, "print-followed", group="documents", title="Developed print: boot prints, followed", w=PW, h=PH, row=ROW_Y)
def print_followed(a: Art):
    """A developed aerial print on the orderly's clipboard: a line of thirty-centimetre boot prints across the
    snow and a patrol's own prints laid toe-ward along them, a ruler printed in for scale; the caption
    is typed underneath."""
    cl = _print_frame(a, 51, "", [])
    a.open("g", clip_path=cl)
    main = [(130, 500), (300, 420), (480, 380), (650, 300), (860, 210)]
    _trail(a, main, 42, 40)
    _trail(a, [(x + 26, y + 30) for x, y in main[:-1]] + [(770, 280)], 46, 44, color="#6c767c")
    a.path(a.smooth_d([(x + 40, y + 60) for x, y in main]), fill="none", stroke="#111", stroke_width=1.5,
           stroke_dasharray="8 6")
    a.poly([(782, 246), (800, 268), (772, 268)], fill="#111")
    a.rect(140, 120, 240, 16, fill="#111")
    a.path("".join(f"M{140 + i * 40},120v16" for i in range(1, 6)), stroke="#eee", stroke_width=2)
    a.text(140, 158, "0        30 CM", size=16, family="monospace", fill="#111")
    a.close()
    _print_finish(a, "051", "N3 YARD. PRINTS 30 CM.", ["Followed toe-ward."])


@asset(G, "print-photographed", group="documents", title="Developed print: bare prints, photographed", w=PW, h=PH,
       row=ROW_Y)
def print_photographed(a: Art):
    """A developed aerial print on the clipboard: three bare prints thirty-eight centimetres long and two metres
    apart, a patrol's boot track stepping straight over them, each big print ringed in grease pencil;
    the caption says they were photographed and not followed."""
    cl = _print_frame(a, 93, "", [])
    a.open("g", clip_path=cl)
    _trail(a, [(120, 180), (400, 330), (700, 300), (880, 420)], 34, 34, color="#6c767c")
    big = _trail(a, [(190, 520), (480, 390), (790, 250)], 96, 300, bare=True, color="#1f2428")
    for (x, y, ang) in big + [(790, 250, -0.42)]:
        a.wobble(kit.circ_pts(x, y, 78, 18, ry=64), amp=3, step=14, closed=True, stroke="#111", stroke_width=3)
    kit.footprint(a, 790, 250, -0.42, 96, color="#1f2428", bare=True, left=True)
    a.path("M200,560 L470,438", stroke="#111", stroke_width=2, stroke_dasharray="10 6")
    a.text(300, 536, "2 M", size=20, family="monospace", fill="#111", font_weight="bold")
    a.close()
    _print_finish(a, "093", "N5 EAST YARD. PRINTS 38 CM.", ["Photographed, not followed."])


@asset(G, "print-frame-112", group="documents", title="Developed print: Frame 112", w=PW, h=PH, row=ROW_Y)
def print_112(a: Art):
    """Frame 112 on the clipboard: one line of deep prints running from the wire across the open strip to the
    trees, and nothing else on the snow; it does not show that the line was walked twice. The typed
    caption reads: No crossing."""
    cl = _print_frame(a, 112, "", [])
    a.open("g", clip_path=cl)
    _trees(a, 110, 880, 80, 140, 26)
    a.rect(110, 90, 770, 26, fill="#2e3439", opacity=0.85)
    a.path("M110,520 L880,530", stroke="#2c3338", stroke_width=2)
    a.path("".join(f"M{x},{520 + (x - 110) * 0.013:.0f}l10,8" for x in range(120, 880, 24)), stroke="#2c3338",
           stroke_width=3)
    line = [(430, 524), (450, 420), (480, 320), (470, 220), (500, 136)]
    a.path(a.smooth_d(line), fill="none", stroke="#aab3b9", stroke_width=30, opacity=0.5, filter=a.blur(6))
    _trail(a, line, 50, 30, color="#161a1d")
    a.close()
    _print_finish(a, "112", "N7 PERIMETER.", ["No crossing."])

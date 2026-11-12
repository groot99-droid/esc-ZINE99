"""Project: Man Eater gameplay pictographs. Built by tools/pictographs/build.py."""
import math

from core import H, W, Pic, f, register

G = "man-eater"


@register(G, "floor-plan")
def floor_plan(p: Pic):
    """Floor Plan (1D): Fisk draws the ground floor from memory as a blueprint. Each hall he paces in
    is ruled in white; on the east side the walls refuse to close, and the dimension line shows the
    18 to 24 paces that are missing. The pencil cursor waits at the open end."""
    p.paper("#1d3f73", grain=0.22, fibre=1.4)
    p.grid(60, 60, W - 120, H - 160, 20, stroke="#ffffff", stroke_width=0.4, opacity=0.25)
    p.grid(60, 60, W - 120, H - 160, 100, stroke="#ffffff", stroke_width=0.8, opacity=0.35)
    ink = dict(stroke="#f4f7ff", stroke_width=5, stroke_linecap="square")
    # rooms drawn in memory: slightly wobbly white walls
    rooms = [[(140, 160), (420, 160), (420, 360), (140, 360)],
             [(140, 380), (420, 380), (420, 600), (140, 600)],
             [(440, 160), (700, 160), (700, 600), (440, 600)]]
    for r in rooms:
        p.wobble(r, amp=1.4, step=30, closed=True, **ink)
    # the tall hall running east, which never closes
    p.wobble([(700, 300), (930, 300)], amp=1.2, step=30, **ink)
    p.wobble([(700, 460), (880, 460)], amp=1.2, step=30, **ink)
    p.wobble([(930, 300), (930, 250), (1060, 250)], amp=1.2, step=30, **ink)
    for x in range(890, 1010, 18):
        p.line(x, 460, x + 9, 460, stroke="#f4f7ff", stroke_width=3, opacity=0.5)
    # dimension line for the missing paces
    p.line(880, 520, 1060, 520, stroke="#ffd36b", stroke_width=2)
    for x in (880, 1060):
        p.line(x, 505, x, 535, stroke="#ffd36b", stroke_width=2)
    p.text(905, 555, "18-24 PACES ?", size=22, family="monospace", fill="#ffd36b")
    # door swings and labels
    for x, y, lab in [(280, 260, "BUNK"), (280, 490, "MESS"), (570, 380, "HALL B")]:
        p.text(x - 40, y, lab, size=20, family="monospace", fill="#cfe0ff")
    p.path("M420,250 a40,40 0 0,1 -40,40", fill="none", stroke="#cfe0ff", stroke_width=2)
    # pencil cursor
    p.poly([(1068, 236), (1110, 194), (1124, 208), (1082, 250)], fill="#ffd36b")
    p.poly([(1060, 258), (1068, 236), (1082, 250)], fill="#f4f7ff")
    p.rect(60, H - 90, W - 120, 50, fill="none", stroke="#f4f7ff", stroke_width=2)
    p.text(80, H - 56, "FLOOR PLAN  /  GROUND  /  DRAWN FROM MEMORY, DAY 4", size=22, family="monospace", fill="#f4f7ff")


# ---- palette (DESIGN.md section 15) -------------------------------------------------------------
GREEN, CREAM, SNOW, PRINT = "#5E7363", "#D9D2BF", "#EEF1F2", "#7C8C99"
SODIUM, STEEL, INK, BRUISE = "#D9A441", "#8A8F93", "#1B1D1F", "#5A4F5E"



def _fig(p: Pic, x, base, h, stride=0.0, lean=0.0, **kw):
    """A cut-out walking man, feet at (x, base), height h, made of flat polygons."""
    s = h / 180.0
    head = (x + lean * s * 10, base - 168 * s)
    parts = []
    # torso
    parts.append([(x - 27 * s + lean * 6 * s, base - 152 * s), (x + 27 * s + lean * 6 * s, base - 152 * s),
                  (x + 20 * s, base - 86 * s), (x - 20 * s, base - 86 * s)])
    parts.append([(x - 9 * s + lean * 7 * s, base - 160 * s), (x + 9 * s + lean * 7 * s, base - 160 * s),
                  (x + 9 * s + lean * 6 * s, base - 148 * s), (x - 9 * s + lean * 6 * s, base - 148 * s)])
    # legs
    for sg in (-1, 1):
        a = stride * sg
        hip = (x + 8 * s * sg * 0.4, base - 90 * s)
        knee = (hip[0] + math.sin(a) * 45 * s, base - 48 * s)
        foot = (knee[0] + math.sin(a * 0.6) * 40 * s, base)
        parts.append([(hip[0] - 13 * s, hip[1]), (hip[0] + 13 * s, hip[1]), (knee[0] + 11 * s, knee[1]),
                      (foot[0] + 20 * s, foot[1]), (foot[0] - 9 * s, foot[1]), (knee[0] - 11 * s, knee[1])])
    # arms
    for sg in (-1, 1):
        a = -stride * sg * 0.8
        sh = (x + 18 * s * sg * 0.6 + lean * 6 * s, base - 145 * s)
        el = (sh[0] + math.sin(a) * 30 * s, base - 115 * s)
        hd = (el[0] + math.sin(a) * 28 * s, base - 85 * s)
        parts.append([(sh[0] - 10 * s, sh[1]), (sh[0] + 10 * s, sh[1]), (el[0] + 8 * s, el[1]),
                      (hd[0] + 7 * s, hd[1]), (hd[0] - 7 * s, hd[1]), (el[0] - 8 * s, el[1])])
    for pts in parts:
        p.poly(pts, **kw)
    p.circle(head[0], head[1], 18 * s, **kw)
    return head


@register(G, "silhouette-halls")
def silhouette_halls(p: Pic):
    """Silhouette halls (2D): a side-scrolling night hall played as a shadow-puppet show. Fisk, a black
    cut-out on rods, crouches in the dark below a moonlit cream wall, but his shadow climbs the wall
    to the ceiling, taller than he is. Round the corner on the right a guard's flashlight cone is
    about to catch the shadow before it catches him; small marks on the floor line show the
    footsteps he is listening for."""
    rng = p.rng
    # the theatre: dark frame around a lit sheet
    p.rect(0, 0, W, H, fill="#120f0c")
    glow = p.radial([(0, "#f3ead2", 1), (0.55, CREAM, 1), (1, "#9c9480", 1)], cx=0.42, cy=0.38, r=0.75)
    p.rect(70, 50, W - 140, 590, fill=glow)
    # cloth weave of the sheet
    p.hatch(70, 50, W - 140, 590, angle=0, spacing=5, stroke="#6d6450", stroke_width=0.4, opacity=0.18,
            clip=p.clip('<rect x="70" y="50" width="1060" height="590"/>'))
    p.hatch(70, 50, W - 140, 590, angle=90, spacing=5, stroke="#6d6450", stroke_width=0.4, opacity=0.12,
            clip=p.clip('<rect x="70" y="50" width="1060" height="590"/>'))
    soft = p.blur(3.5)
    softer = p.blur(9)
    floor = 560
    # high frosted windows at 3.5 m: pale panes with cut-out mullions
    for i, wx in enumerate(range(150, 1000, 230)):
        p.rect(wx, 78, 120, 70, fill="#fbf7ea", opacity=0.9)
        p.line(wx + 60, 78, wx + 60, 148, stroke=INK, stroke_width=5, filter=soft)
        p.line(wx, 113, wx + 120, 113, stroke=INK, stroke_width=5, filter=soft)
        # moonbeams falling long and down
        p.poly([(wx, 148), (wx + 120, 148), (wx + 200, floor), (wx + 40, floor)], fill="#ffffff", opacity=0.13)
    # the pipe run at 2.7 m, with brackets
    p.rect(70, 196, 1060, 14, fill=INK, filter=soft)
    for bx in range(110, 1130, 120):
        p.rect(bx, 190, 8, 30, fill=INK, filter=soft)
    # the corner wall at the right edge
    p.rect(1000, 50, 130, 590, fill=INK, opacity=0.92, filter=soft)
    # the long shadow of Fisk thrown up the wall, reaching the pipes and the ceiling (blurred, tall)
    p.open("g", filter=softer, opacity=0.55)
    _fig(p, 470, floor, 470, stride=0.15, lean=1.5, fill=INK)
    p.close()
    # the shadow's head pokes past the corner: it arrives first
    p.ellipse(985, 210, 34, 26, fill=INK, opacity=0.5, filter=softer)
    # Fisk himself: a crisp black cut-out crouching, with rods and joint pins
    fx = 370
    head = _fig(p, fx, floor, 175, stride=0.6, lean=3.5, fill=INK)
    for (jx, jy) in [(fx + 8, floor - 98), (fx - 12, floor - 52), (fx + 18, floor - 52), (fx + 10, floor - 155),
                     head]:
        p.circle(jx, jy, 3.2, fill="#7a6a4c")
    for (rx, ry) in [(fx + 16, floor - 125), (head[0], head[1] + 10)]:
        p.line(rx, ry, rx + rng.uniform(-30, 30), H, stroke="#2b2620", stroke_width=3)
    # the guard: cut-out silhouette behind the corner with a flashlight cone sweeping left
    gx = 1065
    _fig(p, gx, floor, 205, stride=0.1, fill="#050505")
    cone = [(gx - 30, floor - 120), (720, floor - 300), (720, floor - 10)]
    p.poly(cone, fill="#fff6cf", opacity=0.55, filter=softer)
    p.poly(cone, fill="none", stroke="#fff6cf", stroke_width=2, opacity=0.5)
    p.line(gx + 6, floor - 165, gx + 6, H, stroke="#2b2620", stroke_width=3)
    # floor line and the heard footsteps (listen)
    p.rect(70, floor, 1060, 80, fill="#2a2420")
    for k, sx in enumerate(range(760, 990, 38)):
        y = floor + 18 + (k % 2) * 12
        p.ellipse(sx, y, 10, 4, fill=SODIUM, opacity=0.35 + 0.1 * k)
    # floor drains as cut-out grates
    for dx in (210, 640):
        p.rect(dx, floor + 4, 46, 10, fill="#000")
        for t in range(5):
            p.line(dx + 5 + t * 9, floor + 4, dx + 5 + t * 9, floor + 14, stroke="#4c443a", stroke_width=2)
    # lit door pane: a pool of light
    p.ellipse(560, floor + 6, 70, 10, fill="#fff3c2", opacity=0.35)
    # progress strip at the top: the hall as drawn on Floor Plan
    p.rect(70, 14, 1060, 26, fill="#221d18")
    for i in range(14):
        known = i < 9
        p.rect(80 + i * 74, 19, 66, 16, fill=CREAM if known else "none", stroke=CREAM, stroke_width=1,
               opacity=0.8 if known else 0.4)
    p.circle(80 + 4 * 74 + 33, 27, 5, fill=SODIUM)
    # proscenium frame, curtain folds
    for side in (0, 1):
        x0 = 0 if side == 0 else W - 70
        for i in range(7):
            p.rect(x0 + i * 10, 0, 6, H, fill="#3a1f1a" if i % 2 else "#2a1612")
    p.rect(0, 640, W, H - 640, fill="#16110d")
    p.text(90, 720, "NIGHT 4  /  BUNK TO OFFICERS' WING  /  HE IS SEEN BY HIS SHADOW FIRST", size=21,
           family="monospace", fill="#cdbf9e")
    p.text(90, 752, "crouch shortens the shadow 40%", size=18, family="monospace", fill="#8a7d60")


def _footprint(p: Pic, x, y, ang, size, sharp, left, **kw):
    """One boot print seen from above."""
    off = 9 if left else -9
    ca, sa = math.cos(ang), math.sin(ang)
    px, py = x - sa * off, y + ca * off
    rot = math.degrees(ang) + 90
    op = kw.pop("opacity", 1)
    p.open("g", transform=f"translate({f(px)},{f(py)}) rotate({f(rot)})", opacity=op)
    p.ellipse(0, -size * 0.18, size * 0.2, size * 0.32, fill="#3f4a52" if sharp else "#9aa4ab")
    p.ellipse(0, size * 0.32, size * 0.15, size * 0.16, fill="#3f4a52" if sharp else "#9aa4ab")
    p.close()




@register(G, "snow-line")
def snow_line(p: Pic):
    """Snow line (2D): the yard crossing seen as a grainy aerial reconnaissance print. Fisk is a dark
    dot with a breath plume, heading for the kennel shed at the top; behind him a trail of sharp
    boot prints stays in the snow, older ones softening. A lamp patrol has found the trail and turns
    to follow it, while the searchlight circle sweeps its loop between him and the wire."""
    rng = p.rng
    p.rect(0, 0, W, H, fill="#111")
    # the print area
    X0, Y0, X1, Y1 = 60, 50, 1140, 720
    snowg = p.gradient([(0, "#e4e8ea"), (1, "#cfd5d8")], 0, 0, 1, 1)
    p.rect(X0, Y0, X1 - X0, Y1 - Y0, fill=snowg)
    # drifts: soft wind bands
    p.open("g", clip_path=p.clip(f'<rect x="{X0}" y="{Y0}" width="{X1 - X0}" height="{Y1 - Y0}"/>'))
    for i in range(14):
        y = Y0 + rng.uniform(0, Y1 - Y0)
        pts = [(X0 + 20 + k * 80, y + 18 * math.sin(k * 0.7 + i) + rng.uniform(-6, 6)) for k in range(13)]
        p.path(p.smooth_d(pts), fill="none", stroke="#b8c0c5", stroke_width=rng.uniform(6, 18), opacity=0.35)
    p.close()
    # buildings: barracks roofs with long shadows (bottom), kennel shed (top)
    for bx, by, bw, bh in [(130, 560, 260, 110), (450, 590, 220, 90), (880, 600, 200, 80)]:
        p.poly([(bx + bw, by), (bx + bw + 40, by + 30), (bx + bw + 40, by + bh + 30), (bx + 40, by + bh + 30),
                (bx, by + bh)], fill="#59636a", opacity=0.75)
        p.rect(bx, by, bw, bh, fill="#a5adb2")
        p.line(bx, by + bh / 2, bx + bw, by + bh / 2, stroke="#6f787e", stroke_width=3)
        for t in range(int(bw / 14)):
            p.line(bx + t * 14, by, bx + t * 14, by + bh, stroke="#8c959b", stroke_width=1)
    # kennel shed and its pen at the top
    p.poly([(700, 120), (800, 120), (830, 140), (830, 210), (730, 210)], fill="#59636a", opacity=0.75)
    p.rect(700, 100, 100, 90, fill="#a5adb2")
    p.rect(640, 80, 220, 160, fill="none", stroke="#4a545b", stroke_width=2, stroke_dasharray="4 5")
    # the wire: a fence line with posts across the upper yard
    p.line(X0, 300, X1, 270, stroke="#2c3338", stroke_width=2)
    for k in range(30):
        x = X0 + k * 37
        p.circle(x, 300 - (x - X0) * 30 / (X1 - X0), 3, fill="#2c3338")
    # trees beyond the wire (stippled clumps)
    for _ in range(30):
        cx, cy = rng.uniform(X0, X1), rng.uniform(Y0 + 5, 120)
        if 620 < cx < 880:
            continue
        p.stipple(cx - 26, cy - 22, 52, 44, n=90, r=(1, 3), fill="#2e3439",
                  density=lambda x, y, cx=cx, cy=cy: max(0, 1 - math.hypot(x - cx, y - cy) / 26))
    # Fisk's path: from the barracks door up toward the kennel shed
    path = [(300, 560), (330, 500), (390, 450), (470, 420), (560, 380), (640, 330), (690, 300)]
    pts = []
    for (ax, ay), (bx, by) in zip(path, path[1:]):
        n = int(math.hypot(bx - ax, by - ay) / 26)
        for i in range(n):
            t = i / n
            pts.append((ax + (bx - ax) * t, ay + (by - ay) * t, math.atan2(by - ay, bx - ax)))
    for i, (x, y, a) in enumerate(pts):
        age = 1 - i / len(pts)
        _footprint(p, x, y, a, 34, sharp=age < 0.65, left=i % 2 == 0, opacity=1 - age * 0.55)
    fx, fy = 700, 292
    # breath plume
    for k in range(6):
        p.circle(fx + 14 + k * 7, fy - 12 - k * 6, 5 + k * 2.2, fill="#ffffff", opacity=0.55 - k * 0.07)
    p.circle(fx, fy, 11, fill=INK)
    # reticle on Fisk
    p.circle(fx, fy, 34, fill="none", stroke="#111", stroke_width=1.5)
    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        p.line(fx + dx * 26, fy + dy * 26, fx + dx * 46, fy + dy * 46, stroke="#111", stroke_width=1.5)
    # the patrol on the trail with its lamp, and its own track
    px_, py_ = 360, 470
    trail = [(250, 720), (270, 640), (300, 580), (px_ - 10, py_ + 30)]
    p.path(p.smooth_d(trail), fill="none", stroke="#6c767c", stroke_width=6, stroke_dasharray="3 7", opacity=0.8)
    p.poly([(px_, py_), (px_ + 110, py_ - 90), (px_ + 140, py_ - 40)], fill="#fff6d6", opacity=0.6)
    p.circle(px_, py_, 9, fill="#222")
    p.circle(px_ + 8, py_ - 6, 4, fill=SODIUM)
    # searchlight circle sweeping its loop
    loop = [(520, 210), (900, 260), (980, 430), (700, 500), (480, 380)]
    p.path(p.smooth_d(loop, closed=True), fill="none", stroke="#ffffff", stroke_width=2,
           stroke_dasharray="10 8", opacity=0.8)
    p.circle(860, 420, 70, fill=p.radial([(0, "#ffffff", 0.95), (0.8, "#ffffff", 0.6), (1, "#ffffff", 0)]))
    p.line(1100, 470, 860, 420, stroke="#ffffff", stroke_width=26, opacity=0.18)
    p.rect(1090, 455, 26, 26, fill="#2c3338")
    # photographic grain over the print
    gid = p.uid("film")
    p.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="1.6" numOctaves="1" seed="{p.seed % 991}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0'
           f'  0 0 0 0 0  0 0 0 0.55 -0.12"/></filter>')
    p.rect(X0, Y0, X1 - X0, Y1 - Y0, filter=f"url(#{gid})")
    p.rect(X0, Y0, X1 - X0, Y1 - Y0, fill=p.radial([(0.6, "#000", 0), (1, "#000", 0.35)], r=0.72))
    # grid ticks and fiducial crosses
    for gx in range(X0, X1 + 1, 90):
        for gy in range(Y0, Y1 + 1, 90):
            p.line(gx - 5, gy, gx + 5, gy, stroke="#111", stroke_width=1, opacity=0.6)
            p.line(gx, gy - 5, gx, gy + 5, stroke="#111", stroke_width=1, opacity=0.6)
    for gx in range(X0, X1 + 1, 30):
        L = 12 if (gx - X0) % 90 == 0 else 6
        p.line(gx, Y0, gx, Y0 + L, stroke="#111", stroke_width=1.2)
        p.line(gx, Y1, gx, Y1 - L, stroke="#111", stroke_width=1.2)
    # film edge with frame numbers
    for k in range(0, W, 40):
        p.rect(k + 10, 14, 18, 22, rx=3, fill="#2a2a2a")
        p.rect(k + 10, H - 40, 18, 22, rx=3, fill="#2a2a2a")
    for i, x in enumerate((140, 560, 980)):
        p.text(x, 746, f"FRAME 0{47 + i}", size=16, family="monospace", fill="#cfcfcf")
    p.text(X0 + 14, Y1 - 16, "N3  0247H  YARD  1:600", size=18, family="monospace", fill="#111")
    p.text(fx + 50, fy + 50, "F", size=20, family="monospace", fill="#111", font_weight="bold")


# ---- stencil helpers ----------------------------------------------------------------------------
def _stencil_text(p: Pic, x, y, s, size, fill, bg, anchor="start"):
    """Army stencil type: heavy letters with the bridges cut through them."""
    p.text(x, y, s, size=size, family="monospace", fill=fill, font_weight="bold", text_anchor=anchor,
           letter_spacing=size * 0.08)
    w = len(s) * size * 0.68
    x0 = x - (w / 2 if anchor == "middle" else 0)
    for i in range(len(s)):
        cx = x0 + (i + 0.5) * size * 0.68
        p.rect(cx - size * 0.035, y - size * 0.78, size * 0.07, size * 0.82, fill=bg)


def _suit(p: Pic, kind, cx, cy, r, fill):
    """Suit marks drawn as stencil shapes (hand, key, anchor, house, spark, star)."""
    if kind == "hand":
        p.rect(cx - r * 0.5, cy - r * 0.1, r, r * 0.9, rx=r * 0.2, fill=fill)
        for i in range(4):
            p.rect(cx - r * 0.5 + i * r * 0.27, cy - r * 0.85, r * 0.2, r * 0.8, rx=r * 0.1, fill=fill)
        p.poly([(cx + r * 0.45, cy + r * 0.2), (cx + r * 0.85, cy - r * 0.3), (cx + r * 0.95, cy - r * 0.15),
                (cx + r * 0.5, cy + r * 0.5)], fill=fill)
    elif kind == "key":
        p.circle(cx - r * 0.45, cy, r * 0.42, fill=fill)
        p.rect(cx - r * 0.1, cy - r * 0.1, r * 1.0, r * 0.2, fill=fill)
        p.rect(cx + r * 0.55, cy, r * 0.15, r * 0.35, fill=fill)
        p.rect(cx + r * 0.8, cy, r * 0.15, r * 0.25, fill=fill)
    elif kind == "anchor":
        p.rect(cx - r * 0.08, cy - r * 0.8, r * 0.16, r * 1.5, fill=fill)
        p.rect(cx - r * 0.45, cy - r * 0.55, r * 0.9, r * 0.14, fill=fill)
        p.path(f"M{f(cx - r * 0.8)},{f(cy + r * 0.1)} Q{f(cx)},{f(cy + r * 1.2)} {f(cx + r * 0.8)},{f(cy + r * 0.1)} "
               f"L{f(cx + r * 0.6)},{f(cy + r * 0.25)} Q{f(cx)},{f(cy + r * 0.85)} {f(cx - r * 0.6)},{f(cy + r * 0.25)}Z",
               fill=fill)
    elif kind == "house":
        p.poly([(cx - r * 0.8, cy - r * 0.1), (cx, cy - r * 0.85), (cx + r * 0.8, cy - r * 0.1)], fill=fill)
        p.rect(cx - r * 0.6, cy - r * 0.05, r * 1.2, r * 0.85, fill=fill)
    elif kind == "spark":
        p.poly([(cx + r * 0.2, cy - r), (cx - r * 0.5, cy + r * 0.1), (cx - r * 0.05, cy + r * 0.1),
                (cx - r * 0.25, cy + r), (cx + r * 0.5, cy - r * 0.15), (cx + r * 0.05, cy - r * 0.15)], fill=fill)
    else:
        p.poly(Pic.star_pts(cx, cy, r, r * 0.42), fill=fill)


def _card(p: Pic, x, y, rot, rank, suit, w=120, h=172, worn=0.5, stamp=None, face="#e9e2cf"):
    rough = p.roughen(2.2, 0.06)
    p.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(rot)})")
    p.rect(-w / 2 + 4, -h / 2 + 6, w, h, rx=8, fill="#000", opacity=0.35)
    p.rect(-w / 2, -h / 2, w, h, rx=8, fill=face, stroke="#7b7258", stroke_width=1.5, filter=rough)
    # wear: scuffs and a corner crease
    for _ in range(int(10 * worn)):
        sx, sy = p.rng.uniform(-w / 2, w / 2), p.rng.uniform(-h / 2, h / 2)
        p.ellipse(sx, sy, p.rng.uniform(3, 14), p.rng.uniform(1, 4), fill="#b7ab8a", opacity=0.35)
    p.line(w / 2 - 22, -h / 2, w / 2, -h / 2 + 22, stroke="#a99e80", stroke_width=1)
    p.rect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, rx=4, fill="none", stroke=INK, stroke_width=2,
           stroke_dasharray="14 4")
    _stencil_text(p, -w / 2 + 14, -h / 2 + 42, str(rank), 34, INK, face)
    _suit(p, suit, 0, 18, w * 0.26, INK)
    _stencil_text(p, 0, h / 2 - 16, suit.upper()[:5], 15, "#4d4638", face, anchor="middle")
    if stamp:
        p.open("g", transform="rotate(-24)", opacity=0.82)
        p.rect(-w * 0.5, -15, w * 1.0, 28, fill="none", stroke="#9b2f22", stroke_width=3)
        p.text(0, 6, stamp, size=16, family="monospace", fill="#9b2f22", font_weight="bold", text_anchor="middle")
        p.close()
    p.close()


@register(G, "short-rations")
def short_rations(p: Pic):
    """Short Rations (1D): a trick-taking card game for bread, on the card table seen from above, drawn
    as stencilled ration-issue cards. Fisk's hand of eight is fanned at the bottom; three cards of the
    current trick lie in the centre beside the bread basket, which holds one loaf fewer than there are
    seats. The deck shrinks as chairs empty: the suit of a departed player is stamped withdrawn and
    taken out, and two chairs at the table stand pushed in."""
    rng = p.rng
    p.paper("#3d4a3f", grain=0.3, fibre=0.7)
    # the round table, felt and steel rim
    p.circle(600, 400, 330, fill="#55524a")
    p.circle(600, 400, 318, fill=GREEN)
    p.stipple(300, 90, 600, 620, n=1800, r=(0.5, 1.3), fill="#4a5c4f",
              density=lambda x, y: 1 if math.hypot(x - 600, y - 400) < 312 else 0)
    # six chairs: four occupied (a mug, a bid chalk mark), two pushed in and empty
    seats = ["hand", "key", "anchor", "house", "spark", "star"]
    for i, s in enumerate(seats):
        a = math.radians(90 + i * 60)
        empty = s in ("house", "spark")
        r = 340 if empty else 372
        cx, cy = 600 + math.cos(a) * r, 400 + math.sin(a) * r
        if i == 0:
            continue
        p.open("g", transform=f"translate({f(cx)},{f(cy)}) rotate({f(math.degrees(a) + 90)})")
        p.rect(-46, -26, 92, 52, rx=8, fill="#2c2a25" if empty else "#4a463d", stroke="#1b1a16", stroke_width=2)
        p.rect(-46, 18, 92, 12, fill="#1b1a16")
        if not empty:
            _suit(p, s, 0, -2, 14, "#d8cfb4")
        p.close()
    # bread basket in the centre: N seats - 1 loaves, two already gone
    p.ellipse(600, 330, 110, 62, fill="#6b4f2e")
    p.hatch(490, 268, 220, 124, angle=60, spacing=7, stroke="#4d3920", stroke_width=2,
            clip=p.clip('<ellipse cx="600" cy="330" rx="104" ry="56"/>'))
    p.hatch(490, 268, 220, 124, angle=-60, spacing=7, stroke="#8a6a41", stroke_width=1.5,
            clip=p.clip('<ellipse cx="600" cy="330" rx="104" ry="56"/>'))
    for k, (lx, ly) in enumerate([(560, 318), (630, 322), (595, 346)]):
        p.ellipse(lx, ly, 38, 20, fill="#c99a5b", stroke="#7d5a2c", stroke_width=2)
        for c in range(3):
            p.line(lx - 18 + c * 14, ly - 12, lx - 10 + c * 14, ly + 6, stroke="#e2bf88", stroke_width=3)
    _stencil_text(p, 600, 420, "BREAD 3", 22, "#e9e2cf", GREEN, anchor="middle")
    # the trick in play
    trick = [(500, 470, -14, 6, "key"), (600, 500, 4, 8, "hand"), (700, 470, 16, 3, "anchor")]
    for x, y, rot, rk, st in trick:
        _card(p, x, y, rot, rk, st, w=96, h=138, worn=0.6)
    # the shrinking deck at the left: a squat stack, withdrawn suits beside it
    for k in range(9):
        p.rect(70 + k * 0.6, 130 - k * 3, 120, 172, rx=8, fill="#d8cfb6" if k % 2 else "#cfc5aa",
               stroke="#6f6750", stroke_width=1)
    p.rect(70 + 5.4, 130 - 27, 120, 172, rx=8, fill="#e0d7bf", stroke="#6f6750", stroke_width=1.5)
    _stencil_text(p, 135, 200, "32", 52, INK, "#e0d7bf", anchor="middle")
    _stencil_text(p, 135, 240, "IN ISSUE", 15, "#4d4638", "#e0d7bf", anchor="middle")
    _card(p, 128, 470, -8, 8, "house", w=100, h=144, worn=1, stamp="WITHDRAWN", face="#d4cab0")
    _card(p, 150, 600, 6, 8, "spark", w=100, h=144, worn=1, stamp="WITHDRAWN", face="#d4cab0")
    # bids chalked top right
    p.rect(940, 60, 210, 210, fill="#24221e", stroke="#5d584c", stroke_width=3)
    _stencil_text(p, 960, 100, "BIDS", 26, "#e9e2cf", "#24221e")
    for i, (s, b, t) in enumerate([("hand", 3, 2), ("key", 2, 1), ("anchor", 4, 1), ("star", 0, 0)]):
        _suit(p, s, 975, 132 + i * 34, 11, "#e9e2cf")
        p.text(1000, 140 + i * 34, f"{b}", size=22, family="monospace", fill="#e9e2cf")
        for k in range(t):
            p.line(1050 + k * 12, 124 + i * 34, 1050 + k * 12, 144 + i * 34, stroke=SODIUM, stroke_width=3)
    # Fisk's hand fanned at the bottom
    hand = [(1, "key"), (2, "hand"), (4, "anchor"), (5, "star"), (7, "hand"), (3, "key"), (8, "star"), (6, "anchor")]
    for i, (rk, st) in enumerate(hand):
        a = -28 + i * 8
        x = 600 + math.sin(math.radians(a)) * 520
        y = 1215 - math.cos(math.radians(a)) * 520
        lift = -26 if i == 4 else 0
        _card(p, x, y + lift, a, rk, st, worn=0.4)
    # the player's cursor: a finger point above the raised card
    cx_, cy_ = 600 + math.sin(math.radians(4)) * 520, 1215 - math.cos(math.radians(4)) * 520 - 130
    p.poly([(cx_, cy_ + 34), (cx_ - 16, cy_), (cx_ + 16, cy_)], fill=SODIUM, stroke=INK, stroke_width=2)
    p.vignette(0.55)


def _icon_man(p: Pic, x, y, s, fill):
    p.circle(x, y - 34 * s, 8 * s, fill=fill)
    p.poly([(x - 10 * s, y - 24 * s), (x + 10 * s, y - 24 * s), (x + 8 * s, y - 2 * s), (x - 8 * s, y - 2 * s)],
           fill=fill)
    p.rect(x - 8 * s, y - 2 * s, 6 * s, 20 * s, fill=fill)
    p.rect(x + 2 * s, y - 2 * s, 6 * s, 20 * s, fill=fill)


def _icon_piece(p: Pic, x, y, s, fill):
    p.path(f"M{f(x - 16 * s)},{f(y + 8 * s)} L{f(x - 12 * s)},{f(y - 10 * s)} Q{f(x)},{f(y - 16 * s)} "
           f"{f(x + 14 * s)},{f(y - 9 * s)} L{f(x + 16 * s)},{f(y + 9 * s)}Z", fill=fill)


def _icon_pill(p: Pic, x, y, s, fill):
    p.rect(x - 15 * s, y - 7 * s, 30 * s, 14 * s, rx=7 * s, fill=fill)


def _icon_eye(p: Pic, x, y, s, fill):
    p.path(f"M{f(x - 18 * s)},{f(y)} Q{f(x)},{f(y - 14 * s)} {f(x + 18 * s)},{f(y)} Q{f(x)},{f(y + 14 * s)} "
           f"{f(x - 18 * s)},{f(y)}Z", fill=fill)
    p.circle(x, y, 5 * s, fill="#f1ece0")


def _icon_napkin(p: Pic, x, y, s, fill):
    p.poly([(x - 16 * s, y - 14 * s), (x + 16 * s, y - 14 * s), (x - 16 * s, y + 14 * s)], fill=fill)


def _icon_mouth(p: Pic, x, y, s, fill):
    p.path(f"M{f(x - 18 * s)},{f(y - 4 * s)} Q{f(x)},{f(y + 16 * s)} {f(x + 18 * s)},{f(y - 4 * s)}Z", fill=fill)


@register(G, "tray")
def tray(p: Pic):
    """The Tray (1D): the noon portioning game told as an Isotype chart of counted flat icons. Across the
    top, the orderly's gaze runs its eight-second cycle and rests on Fisk for three; below, the cut
    ration lies as six pieces on the tray, with the pill beside it. Each row counts where the pieces
    went (to the mouth, into the napkin that holds three, passed to Jax, left on the tray), and the
    bottom row shows the man growing a step taller for every piece eaten."""
    p.paper("#efe9dc", grain=0.12)
    red, green, grey = "#b8462e", GREEN, STEEL
    # the gaze cycle: 8 eye icons, three dark (resting on Fisk)
    p.text(60, 92, "GAZE", size=24, family="sans-serif", fill=INK, font_weight="bold", letter_spacing=3)
    for i in range(8):
        on = i in (3, 4, 5)
        _icon_eye(p, 260 + i * 70, 84, 1.3, INK if on else "#c9c2b2")
    p.text(830, 92, "3 s of 8 on you", size=20, family="sans-serif", fill=INK)
    p.rect(256 + 3 * 70 - 36, 58, 70 * 3, 52, fill="none", stroke=red, stroke_width=3)
    # the tray: a steel plate with the slab cut into six, the pill, the broth
    p.rect(60, 140, 1080, 190, rx=14, fill="#c9ccce")
    p.rect(76, 156, 1048, 158, rx=10, fill="none", stroke=grey, stroke_width=3)
    p.text(96, 196, "TRAY", size=22, family="sans-serif", fill=INK, font_weight="bold", letter_spacing=3)
    for i in range(6):
        _icon_piece(p, 300 + i * 92, 236, 2.2, BRUISE)
        if i:
            p.line(300 + i * 92 - 46, 200, 300 + i * 92 - 46, 272, stroke="#efe9dc", stroke_width=4,
                   stroke_dasharray="6 5")
    _icon_pill(p, 900, 236, 1.8, "#efe9dc")
    p.circle(1030, 236, 46, fill=SODIUM)
    p.circle(1030, 236, 32, fill="#e6c27a")
    # the knife cursor mid-cut
    p.poly([(760, 175), (774, 175), (770, 300), (766, 300)], fill=INK)
    p.rect(756, 140, 22, 40, rx=4, fill="#3a3a3a")
    # rows of counted icons
    rows = [("TO MOUTH", _icon_mouth, 3, red, "eaten"), ("NAPKIN", _icon_napkin, 2, "#f7f4ec", "of 3"),
            ("TO JAX", _icon_piece, 1, green, "passed"), ("LEFT", _icon_piece, 0, grey, "+5 suspicion each")]
    y = 390
    for label, icon, n, col, note in rows:
        p.line(60, y + 32, 1140, y + 32, stroke="#d4ccbb", stroke_width=1)
        p.text(60, y + 10, label, size=22, family="sans-serif", fill=INK, font_weight="bold", letter_spacing=2)
        for k in range(n):
            x = 300 + k * 74
            if icon is _icon_napkin:
                _icon_napkin(p, x, y, 1.6, "#ffffff")
                p.poly([(x - 26, y - 22), (x + 26, y - 22), (x - 26, y + 22)], fill="none", stroke=INK, stroke_width=2)
                _icon_piece(p, x - 6, y - 4, 1.0, BRUISE)
            elif icon is _icon_mouth:
                _icon_piece(p, x, y, 1.6, col)
            else:
                _icon_piece(p, x, y, 1.6, col)
        # empty slots in outline, so the count reads against the whole
        cap = 3 if label == "NAPKIN" else 6
        for k in range(n, cap if label != "TO MOUTH" else 6):
            x = 300 + k * 74
            p.path(f"M{f(x - 26)},{f(y + 13)} L{f(x - 19)},{f(y - 16)} Q{f(x)},{f(y - 26)} {f(x + 22)},{f(y - 14)} "
                   f"L{f(x + 26)},{f(y + 14)}Z", fill="none", stroke="#bdb5a3", stroke_width=2,
                   stroke_dasharray="5 4")
        p.text(780, y + 8, note, size=20, family="sans-serif", fill="#5b5548")
        y += 74
    # the body row: a man icon per day, taller with each piece eaten
    p.text(60, 760, "FISK", size=22, family="sans-serif", fill=INK, font_weight="bold", letter_spacing=2)
    for k in range(7):
        s = 0.9 + k * 0.17
        _icon_man(p, 320 + k * 110, 772 - 18 * s, s, INK if k < 4 else "#bdb5a3")
    p.text(1110, 760, "+2", size=26, family="sans-serif", fill=red, font_weight="bold", text_anchor="end")


@register(G, "chart")
def chart(p: Pic):
    """The Chart (1D): Fisk's own measurements on medical graph paper, read like a doctor's chart. Typed
    axes run Day 1 to Day 7; his height is plotted in pencil and it lies along the printed target
    curve on the sheet slid half under it, which shows the change is on schedule. The current day's
    column is outlined, two telling points are circled, and the hypothesis card ROUTINE is stamped
    broken."""
    rng = p.rng
    p.rect(0, 0, W, H, fill="#4b3a2a")
    p.hatch(0, 0, W, H, angle=8, spacing=6, stroke="#3f3022", stroke_width=2, jitter=1.5)  # clipboard board
    # second sheet (the target), slid under at an angle
    p.open("g", transform="translate(140,90) rotate(3)")
    p.rect(0, 0, 980, 660, fill="#efe7d6")
    p.close()
    # main sheet: medical graph paper
    X, Y, Wd, Ht = 90, 70, 1020, 690
    p.rect(X + 6, Y + 8, Wd, Ht, fill="#000", opacity=0.3)
    p.rect(X, Y, Wd, Ht, fill="#f5f2e6")
    gx0, gy0, gw, gh = 190, 170, 860, 440
    p.grid(gx0, gy0, gw, gh, 10, stroke="#9cc3a8", stroke_width=0.5)
    p.grid(gx0, gy0, gw, gh, 50, stroke="#6fa384", stroke_width=1.1)
    # header typed
    p.text(X + 30, Y + 44, "CASE 7-F   FISK   HT (cm)", size=24, family="monospace", fill=INK)
    p.text(X + Wd - 30, Y + 44, "WARD B", size=24, family="monospace", fill=INK, text_anchor="end")
    # axes
    p.line(gx0, gy0, gx0, gy0 + gh, stroke=INK, stroke_width=2)
    p.line(gx0, gy0 + gh, gx0 + gw, gy0 + gh, stroke=INK, stroke_width=2)
    days = 7
    colw = gw / days
    vmin, vmax = 170, 300
    def yv(v):
        return gy0 + gh - (v - vmin) / (vmax - vmin) * gh
    for v in range(vmin, vmax + 1, 20):
        p.text(gx0 - 12, yv(v) + 6, str(v), size=17, family="monospace", fill=INK, text_anchor="end")
    for d in range(days):
        p.text(gx0 + colw * (d + 0.5), gy0 + gh + 30, f"D{d + 1}", size=18, family="monospace", fill=INK,
               text_anchor="middle")
    # the printed target curve (red, dashed band)
    def target(t):
        return 178 + 105 * (t / 6) ** 1.6
    tp = [(gx0 + colw * (d + 0.5), yv(target(d))) for d in range(days)]
    hi = [(x, y - 14) for x, y in tp]
    lo = [(x, y + 14) for x, y in tp]
    p.path(p.smooth_d(hi) + " L" + " L".join(f"{f(x)},{f(y)}" for x, y in reversed(lo)) + "Z",
           fill="#c0392b", opacity=0.12)
    p.path(p.smooth_d(tp), fill="none", stroke="#c0392b", stroke_width=2.5, stroke_dasharray="9 6")
    p.text(tp[-1][0] - 10, tp[-1][1] - 22, "TARGET", size=17, family="monospace", fill="#c0392b",
           text_anchor="end")
    # Fisk's plotted height through day 5 (pencil), tracking the target
    meas = []
    for d in range(5):
        v = target(d) + rng.uniform(-4, 4)
        meas.append((gx0 + colw * (d + 0.5), yv(v)))
    p.wobble(meas, amp=0.8, step=8, stroke="#2e2e2e", stroke_width=3)
    for x, y in meas:
        p.line(x - 7, y - 7, x + 7, y + 7, stroke=INK, stroke_width=2.5)
        p.line(x - 7, y + 7, x + 7, y - 7, stroke=INK, stroke_width=2.5)
    # current day column outlined (day 5)
    p.rect(gx0 + colw * 4, gy0 - 6, colw, gh + 12, fill="none", stroke=SODIUM, stroke_width=4)
    # the two selected cells circled in pencil
    for x, y in (meas[2], meas[4]):
        p.wobble([(x + 22 * math.cos(t / 6), y + 18 * math.sin(t / 6)) for t in range(0, 40)], amp=1.2, step=6,
                 stroke="#2b4c7e", stroke_width=2)
    # a pulse trace (second row) faint in the lower band
    pts = []
    for i in range(0, int(gw), 6):
        x = gx0 + i
        d = i / colw
        base = gy0 + gh - 40 + d * 3
        spike = -38 if (i // 6) % 14 == 0 else (14 if (i // 6) % 14 == 1 else 0)
        pts.append((x, base + spike + rng.uniform(-1.5, 1.5)))
    p.path("M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts), fill="none", stroke="#2e6a4a", stroke_width=1.2,
           opacity=0.6)
    # hypothesis cards along the bottom
    for i, (lab, stamp) in enumerate([("CLIMATE", "BROKEN"), ("ROUTINE", "BROKEN"), ("VITAMINS", None)]):
        cx = 260 + i * 270
        p.rect(cx - 110, 662, 220, 70, fill="#fffdf4", stroke="#7d7a6c", stroke_width=1.5,
               transform=f"rotate({f(rng.uniform(-2, 2))} {cx} 697)")
        p.text(cx, 706, lab, size=24, family="monospace", fill=INK, text_anchor="middle")
        if stamp:
            p.rect(cx + 20, 640, 120, 36, fill="#fffdf4", stroke="#a3271a", stroke_width=3, opacity=0.9,
                   transform=f"rotate(-12 {cx + 80} 658)")
            p.line(cx - 90, 698, cx + 90, 698, stroke="#a3271a", stroke_width=3)
            p.text(cx + 80, 667, stamp, size=22, family="monospace", fill="#a3271a", text_anchor="middle",
                   font_weight="bold", opacity=0.9, transform=f"rotate(-12 {cx + 80} 658)")
    # pencil hovering
    p.poly([(1000, 680), (1100, 560), (1116, 574), (1016, 694)], fill=SODIUM)
    p.poly([(992, 704), (1000, 680), (1016, 694)], fill="#e8d7b4")
    # clipboard clip
    p.rect(470, 30, 260, 70, rx=12, fill="#9aa0a4", stroke="#5c6266", stroke_width=3)
    p.rect(540, 46, 120, 20, rx=10, fill="#5c6266")

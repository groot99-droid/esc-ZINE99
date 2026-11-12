"""The Endless Temple gameplay pictographs. Built by tools/pictographs/build.py."""
import math

from core import H, W, Pic, f, register

G = "endless-temple"

# Palette (DESIGN.md section 15)
HONEY = "#d4a23a"
SAGE = "#8fa07a"
WALNUT = "#5a3d27"
SKIN = "#cfe3b8"
SILVER = "#c9ccd3"
OCHRE = "#c98a3a"
BRUISE = "#6e4a78"
SEPIA = "#3a2a1c"
CREAM = "#f3ead2"


# ---- shared helpers ---------------------------------------------------------------------------
def blob_d(p, cx, cy, rx, ry, n=11, jit=0.22):
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        k = 1 + p.rng.uniform(-jit, jit)
        pts.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    return p.smooth_d(pts, closed=True)


def grain_rect(p, x, y, w, h, alpha=0.25, freq=0.9):
    fid = p.uid("gr")
    p.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%">'
           f'<feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="2" seed="{p.rng.randint(1, 900)}"/>'
           f'<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {f(alpha)} 0"/></filter>')
    p.rect(x, y, w, h, filter=f"url(#{fid})")


def wash(p, d, color, opacity, rough, edge=None):
    """A watercolour bloom: a roughened translucent fill with a darker pooled edge."""
    p.path(d, fill=color, opacity=opacity, filter=rough)
    p.path(d, fill="none", stroke=edge or color, stroke_width=2.2, opacity=min(1, opacity + 0.15), filter=rough)


def gear_d(cx, cy, r, teeth=None, depth=9, rot=0.0):
    n = teeth or max(8, int(r / 6.5))
    pts = []
    for i in range(n):
        a0 = rot + 2 * math.pi * i / n
        step = 2 * math.pi / n
        for t, rr in ((0.0, r - depth / 2), (0.18, r + depth / 2), (0.5, r + depth / 2), (0.68, r - depth / 2)):
            a = a0 + t * step
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + "Z"


def arc_arrow(p, cx, cy, r, cw, **kw):
    """A three-quarter arrow around a centre showing a turning direction."""
    a0, a1 = (-2.4, -0.6) if cw else (-0.6, -2.4)
    x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
    x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
    sweep = 1 if cw else 0
    p.path(f"M{f(x0)},{f(y0)} A{f(r)},{f(r)} 0 0,{sweep} {f(x1)},{f(y1)}", fill="none", **kw)
    # arrowhead tangent at end
    t = a1 + (math.pi / 2 if cw else -math.pi / 2)
    hx, hy = math.cos(t), math.sin(t)
    nx, ny = -hy, hx
    s = 12
    p.poly([(x1 + hx * s, y1 + hy * s), (x1 + nx * s * .55, y1 + ny * s * .55), (x1 - nx * s * .55, y1 - ny * s * .55)],
           fill=kw.get("stroke", "#000"))


# ---- 2D: Living illustration -------------------------------------------------------------------
@register(G, "living-illustration")
def living_illustration(p: Pic):
    """Living illustration (2D): the storybook page comes alive and Xandri rides it side-on, left to
    right, surfing the face of a travelling sand wave under a silver moon. Behind him a wave lip curls
    over to swallow a rider who slows; prickle bushes and purple vine webs wait ahead to jump. In the
    top margin his own ink line draws itself toward the small pole of his father's mark."""
    p.paper("#3a2a1d", grain=0.35)
    # the open page, its stacked edges and the gutter
    px0, py0, px1, py1 = 70, 34, 1150, 770
    for i in range(6, 0, -1):
        p.rect(px0 + i * 3, py0 + i * 2, px1 - px0, py1 - py0, fill="#e6dbbd", stroke="#a8946c", stroke_width=0.8)
    p.rect(px0, py0, px1 - px0, py1 - py0, fill=CREAM)
    grain_rect(p, px0, py0, px1 - px0, py1 - py0, 0.22, 0.75)
    page = p.clip(f'<rect x="{px0}" y="{py0}" width="{px1 - px0}" height="{py1 - py0}"/>')
    rough = p.roughen(9, 0.025)
    soft = p.roughen(4, 0.06)
    p.open("g", clip_path=page)

    # sky blooms: silver, a little bruise, the moon
    for _ in range(5):
        wash(p, blob_d(p, p.rng.uniform(250, 1050), p.rng.uniform(170, 300), p.rng.uniform(140, 240), p.rng.uniform(50, 90)),
             p.rng.choice([SILVER, "#b8c0cf", "#d7d0df"]), 0.35, rough)
    wash(p, blob_d(p, 980, 205, 62, 62, jit=0.06), "#eef0f4", 0.9, soft, edge="#9aa1b0")
    p.wobble([(940, 170), (960, 150), (990, 145)], amp=1.2, step=10, stroke=SEPIA, stroke_width=1.6)
    for i in range(14):
        a = 2 * math.pi * i / 14
        p.wobble([(980 + 80 * math.cos(a), 205 + 80 * math.sin(a)), (980 + 96 * math.cos(a), 205 + 96 * math.sin(a))],
                 amp=1, step=8, stroke=SEPIA, stroke_width=1.1, opacity=0.6)

    # far dunes (silver-ochre), mid dunes, the main wave
    def ridge(base, amp, period, phase, x0=40, x1=1180):
        return [(x, base - amp * (0.5 + 0.5 * math.sin(x / period + phase))) for x in range(x0, x1 + 1, 40)]

    far = ridge(400, 40, 90, 1.0)
    wash(p, p.smooth_d(far) + f" L1180,800 L40,800Z", "#d9c49a", 0.55, rough)
    p.wobble(far, amp=1.5, step=18, stroke=SEPIA, stroke_width=1.3, opacity=0.6)

    crest_x, crest_y = 700, 300

    def wave_y(x):
        k = 230 if x < crest_x else 95
        return 560 - 260 * math.exp(-((x - crest_x) / k) ** 2) + 10 * math.sin(x / 45)

    face = [(x, wave_y(x)) for x in range(40, 1181, 20)]
    wash(p, p.smooth_d(face) + " L1180,800 L40,800Z", OCHRE, 0.62, rough, edge="#9c5f22")
    wash(p, blob_d(p, 560, 520, 220, 70), "#b5722c", 0.35, rough)
    wash(p, blob_d(p, 900, 600, 200, 60), "#e0b064", 0.4, rough)
    p.wobble(face, amp=1.8, step=16, stroke=SEPIA, stroke_width=2.6)
    # sand texture lines on the face, following the slope
    for i in range(28):
        x = p.rng.uniform(120, 1100)
        y = wave_y(x) + p.rng.uniform(25, 200)
        p.wobble([(x, y), (x + 50, wave_y(x + 50) + (y - wave_y(x)))], amp=1.2, step=12,
                 stroke=SEPIA, stroke_width=1, opacity=0.45)

    # the breaking lip curling forward over a shadowed hollow
    hollow = [(crest_x + 10, wave_y(crest_x + 10)), (crest_x + 70, crest_y + 40), (crest_x + 120, crest_y + 90),
              (crest_x + 150, wave_y(crest_x + 150)), (crest_x + 60, wave_y(crest_x + 60) + 10)]
    wash(p, p.smooth_d(hollow, closed=True), "#7a4a1e", 0.55, soft)
    lip = [(crest_x - 30, wave_y(crest_x - 30)), (crest_x + 30, crest_y - 40), (crest_x + 110, crest_y - 38),
           (crest_x + 170, crest_y + 10), (crest_x + 180, crest_y + 80), (crest_x + 150, crest_y + 70),
           (crest_x + 135, crest_y + 30), (crest_x + 95, crest_y + 2), (crest_x + 40, crest_y + 10),
           (crest_x + 5, wave_y(crest_x + 5))]
    wash(p, p.smooth_d(lip, closed=True), "#d99a48", 0.85, soft, edge="#8a5420")
    p.path(p.smooth_d(lip[:6]), fill="none", stroke=SEPIA, stroke_width=2.6, filter=soft)
    p.path(p.smooth_d(lip[5:9]), fill="none", stroke=SEPIA, stroke_width=1.6, filter=soft)
    # spray off the lip
    p.stipple(crest_x + 80, crest_y - 80, 200, 200, n=300, r=(0.8, 2.6), fill="#8a5420", opacity=0.75,
              density=lambda x, y: max(0, 1 - math.hypot(x - (crest_x + 150), y - (crest_y + 40)) / 120))

    # Xandri on his board, on the face just ahead of the lip
    rx = 560
    ry = wave_y(rx)
    slope = (wave_y(rx + 5) - wave_y(rx - 5)) / 10
    ang = math.atan(slope)
    ca, sa = math.cos(ang), math.sin(ang)
    bx0, by0 = rx - 60 * ca, ry - 60 * sa - 6
    bx1, by1 = rx + 60 * ca, ry + 60 * sa - 6
    p.path(f"M{f(bx0)},{f(by0)} Q{f(rx)},{f(ry + 6)} {f(bx1)},{f(by1)} Q{f(rx)},{f(ry - 14)} {f(bx0)},{f(by0)}Z",
           fill=SAGE, stroke=SEPIA, stroke_width=2.2)
    hip = (rx - 6, ry - 64)
    fl, fr = (rx - 30 * ca, ry - 30 * sa - 12), (rx + 28 * ca, ry + 28 * sa - 12)
    knee_l, knee_r = (rx - 32, ry - 40), (rx + 18, ry - 38)
    ink = dict(stroke=SEPIA, stroke_width=3.2, stroke_linecap="round", stroke_linejoin="round")
    p.wobble([fl, knee_l, hip, knee_r, fr], amp=1.2, step=10, **ink)
    neck = (rx + 10, ry - 112)
    p.wobble([hip, neck], amp=1.2, step=10, **ink)
    wash(p, blob_d(p, rx + 2, ry - 92, 22, 30, jit=0.1), WALNUT, 0.55, soft)
    p.wobble([(rx - 60, ry - 108), (rx - 20, ry - 100), neck, (rx + 50, ry - 88), (rx + 78, ry - 104)], amp=1.4, step=10, **ink)
    p.circle(rx + 18, ry - 132, 15, fill=CREAM, stroke=SEPIA, stroke_width=2.6)
    p.path(f"M{rx + 6},{ry - 144} q12,-12 26,-2", fill="none", stroke=SEPIA, stroke_width=2.4)
    # the father's cord, flying back from his waist
    cord = [(rx - 2, ry - 80)] + [(rx - 20 - 22 * i, ry - 84 - 14 * math.sin(i * 1.3)) for i in range(1, 6)]
    p.path(p.smooth_d(cord), fill="none", stroke=OCHRE, stroke_width=3.2, stroke_linecap="round")
    # speed lines behind
    for i in range(7):
        y = ry - 130 + i * 18
        x = rx - 120 - p.rng.uniform(0, 60)
        p.wobble([(x - p.rng.uniform(70, 150), y + 10), (x, y)], amp=0.8, step=14, stroke=SEPIA, stroke_width=1.4, opacity=0.7)

    # hazards ahead: prickle bushes and a vine web
    def prickle(cx, cy, s):
        wash(p, blob_d(p, cx, cy, 34 * s, 22 * s), SAGE, 0.75, soft, edge="#55663f")
        for k in range(16):
            a = math.pi + math.pi * k / 15
            p.line(cx + 26 * s * math.cos(a), cy + 18 * s * math.sin(a), cx + 42 * s * math.cos(a), cy + 32 * s * math.sin(a),
                   stroke=SEPIA, stroke_width=1.4)

    prickle(980, wave_y(980) - 8, 1.0)
    prickle(1090, wave_y(1090) - 6, 0.8)
    prickle(250, wave_y(250) - 4, 0.9)
    vx, vy = 880, wave_y(880) + 110
    for k in range(9):
        a = math.pi * k / 8
        p.wobble([(vx, vy), (vx + 90 * math.cos(a), vy - 70 * math.sin(a))], amp=2, step=12,
                 stroke=BRUISE, stroke_width=2)
    for rr in (25, 50, 75):
        p.wobble([(vx + rr * 1.2 * math.cos(math.pi * k / 8), vy - rr * math.sin(math.pi * k / 8)) for k in range(9)],
                 amp=2, step=10, stroke=BRUISE, stroke_width=1.6)
    wash(p, blob_d(p, vx, vy - 30, 100, 50), BRUISE, 0.22, rough)
    p.close()

    # top margin: the line drawing itself toward the father's mark
    mx = [(130 + i * 22, 78 + 10 * math.sin(i * 0.55)) for i in range(28)]
    p.path(p.smooth_d(mx), fill="none", stroke=SEPIA, stroke_width=2.2, stroke_linecap="round")
    nx, ny = mx[-1]
    p.poly([(nx + 4, ny), (nx + 30, ny - 22), (nx + 36, ny - 16), (nx + 10, ny + 6)], fill=SEPIA)
    p.path(f"M{f(nx + 6)},{f(ny)} l-8,6", stroke=SEPIA, stroke_width=1.5)
    p.line(nx + 40, ny + 2, 900, 80, stroke=SEPIA, stroke_width=1.4, stroke_dasharray="2 9", opacity=0.6)
    p.line(920, 96, 920, 52, stroke=SEPIA, stroke_width=2.4)
    p.poly([(920, 52), (944, 60), (920, 68)], fill=OCHRE, stroke=SEPIA, stroke_width=1.2)
    p.text(952, 86, "the mark", size=20, family="serif", fill=SEPIA, font_style="italic")
    p.text(560, 752, "~ 47 ~", size=20, family="serif", fill=SEPIA, opacity=0.7)
    # gutter shadow on the left of the page
    gid = p.uid("gut")
    p.defn(f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1a0c" stop-opacity="0.45"/>'
           f'<stop offset="1" stop-color="#2a1a0c" stop-opacity="0"/></linearGradient>')
    p.rect(px0, py0, 90, py1 - py0, fill=f"url(#{gid})")


# ---- 2D: The stacks -----------------------------------------------------------------------------
@register(G, "stacks")
def stacks(p: Pic):
    """The stacks (2D): Elaris rides a rolling ladder through shelves that never end, drawn in one
    fine line with no single true perspective: shelves run into the distance, hang from the ceiling,
    and drop down a shaft at once. A stream of gold sand motes thickens along the aisle that leads to
    the calling book glowing at the far end, while the ladders up and down are the wrong branches.
    A book falls with its shadow showing first, and the bookmark ribbon across the top has grown
    three of its four lengths."""
    p.paper("#f2ecdc", grain=0.18)
    L = dict(stroke="#2f2a22", stroke_width=1.2, fill="none", stroke_linecap="round")
    vx, vy = 640, 400
    x0, y0, x1, y1 = 20, 60, 1180, 790
    r = 0.80
    frames = []
    for i in range(13):
        s = r ** i
        frames.append((vx + (x0 - vx) * s, vy + (y0 - vy) * s, vx + (x1 - vx) * s, vy + (y1 - vy) * s))
    def lerp(a, b, t):
        return a + (b - a) * t
    d = []
    # depth rings
    for i, (a, b, c, e) in enumerate(frames[1:], 1):
        d.append(f"M{f(a)},{f(b)}H{f(c)}V{f(e)}H{f(a)}Z")
    # wall shelves (left and right): radial lines at shelf heights, books between rings
    shelves = [0.0, 0.17, 0.34, 0.51, 0.68, 0.85, 1.0]
    for t in shelves:
        for side in (0, 2):
            xa = frames[0][side]
            ya = lerp(frames[0][1], frames[0][3], t)
            d.append(f"M{f(xa)},{f(ya)}L{f(vx + (xa - vx) * r ** 12)},{f(vy + (ya - vy) * r ** 12)}")
    # ceiling: upside-down shelves (contradiction); floor: plank aisle
    for t in (0.2, 0.4, 0.6, 0.8):
        xa = lerp(frames[0][0], frames[0][2], t)
        d.append(f"M{f(xa)},{f(y0)}L{f(vx + (xa - vx) * r ** 12)},{f(vy + (y0 - vy) * r ** 12)}")
        d.append(f"M{f(xa)},{f(y1)}L{f(vx + (xa - vx) * r ** 12)},{f(vy + (y1 - vy) * r ** 12)}")
    p.path("".join(d), **L)
    # book spines on the walls and ceiling
    sp = []
    for i in range(len(frames) - 1):
        fa, fb = frames[i], frames[i + 1]
        for side in (0, 2):
            for k in range(len(shelves) - 1):
                n = max(2, int(14 * r ** i))
                for j in range(1, n):
                    t = j / n
                    xs = lerp(fa[side], fb[side], t)
                    ya = lerp(lerp(fa[1], fa[3], shelves[k]), lerp(fb[1], fb[3], shelves[k]), t)
                    yb = lerp(lerp(fa[1], fa[3], shelves[k + 1]), lerp(fb[1], fb[3], shelves[k + 1]), t)
                    h = (yb - ya) * p.rng.uniform(0.55, 0.92)
                    sp.append(f"M{f(xs)},{f(yb)}V{f(yb - h)}")
                    if p.rng.random() < 0.08:
                        sp.append(f"M{f(xs)},{f(yb)}L{f(xs + (yb - ya) * 0.25 * (1 if side == 0 else -1))},{f(yb - h)}")
        # ceiling books hang downward
        for k in range(4):
            n = max(2, int(10 * r ** i))
            for j in range(1, n):
                t = j / n
                xa = lerp(lerp(fa[0], fa[2], 0.2 + 0.2 * k), lerp(fa[0], fa[2], 0.4 + 0.2 * k), (j + 0.5) / n)
                ya = lerp(fa[1], fb[1], 0.5)
                xb = vx + (xa - vx) * (r ** 0.5)
                hh = (fb[1] - fa[1]) * 0 + 40 * r ** i * p.rng.uniform(0.6, 1)
                sp.append(f"M{f(xb)},{f(lerp(fa[1], fb[1], 0.5))}v{f(hh)}")
    p.path("".join(sp), stroke="#2f2a22", stroke_width=0.9, fill="none", opacity=0.85)

    # a ladder that climbs up into the ceiling shelves (wrong branch), and one down a shaft
    def ladder(xa, ya, xb, yb, w, rungs=10):
        dx, dy = xb - xa, yb - ya
        Lg = math.hypot(dx, dy)
        nx, ny = -dy / Lg * w / 2, dx / Lg * w / 2
        q = [f"M{f(xa + nx)},{f(ya + ny)}L{f(xb + nx)},{f(yb + ny)}M{f(xa - nx)},{f(ya - ny)}L{f(xb - nx)},{f(yb - ny)}"]
        for k in range(1, rungs):
            t = k / rungs
            cx, cy = xa + dx * t, ya + dy * t
            q.append(f"M{f(cx + nx)},{f(cy + ny)}L{f(cx - nx)},{f(cy - ny)}")
        p.path("".join(q), **L)

    # contradiction: an opening in the right wall shows a shaft of shelves rising to a second vanishing point
    f2, f3 = frames[2], frames[3]
    ox0, ox1 = f2[2] - 4, f3[2] + 4
    oy0 = lerp(f2[1], f2[3], 0.34)
    oy1 = lerp(f2[1], f2[3], 0.68)
    p.path(f"M{f(ox0)},{f(oy0)}L{f(ox1)},{f(oy0 + 30)}L{f(ox1)},{f(oy1 - 30)}L{f(ox0)},{f(oy1)}Z", fill="#f2ecdc",
           stroke="#2f2a22", stroke_width=1.2)
    cl2 = p.clip(f'<path d="M{f(ox0)},{f(oy0)}L{f(ox1)},{f(oy0 + 30)}L{f(ox1)},{f(oy1 - 30)}L{f(ox0)},{f(oy1)}Z"/>')
    p.open("g", clip_path=cl2)
    v2x, v2y = (ox0 + ox1) / 2 + 30, oy0 - 900
    qq = []
    for k in range(14):
        xb = ox0 - 40 + k * 14
        qq.append(f"M{f(xb)},{f(oy1)}L{f(v2x + (xb - v2x) * 0.1)},{f(v2y)}")
    for k in range(8):
        yy = oy1 - k * k * 3.2
        qq.append(f"M{f(ox0 - 40)},{f(yy)}H{f(ox1 + 40)}")
    p.path("".join(qq), **L)
    p.close()
    fa = frames[4]
    ladder(fa[0] + 140, fa[3] - 2, fa[0] + 160, fa[1] + 4, 34, 12)
    # floor hatch and shaft with its own vanishing point below
    hx, hy = 760, 640
    p.path(f"M{hx - 70},{hy}L{hx + 70},{hy}L{hx + 100},{hy + 46}L{hx - 100},{hy + 46}Z", **L)
    for k in range(1, 7):
        s = 0.85 ** k
        p.path(f"M{f(hx - 70 * s)},{f(hy + 46 + 22 * k)}L{f(hx + 70 * s)},{f(hy + 46 + 22 * k)}", **L)
    ladder(hx, hy + 6, hx + 8, hy + 150, 26, 7)

    # the calling book at the vanishing point
    cb = frames[11]
    bxc, byc = vx, vy + 4
    p.circle(bxc, byc, 60, fill=p.radial([(0, HONEY, 0.55), (1, HONEY, 0)]))
    for k in range(18):
        a = 2 * math.pi * k / 18
        p.line(bxc + 16 * math.cos(a), byc + 16 * math.sin(a), bxc + 34 * math.cos(a), byc + 34 * math.sin(a),
               stroke="#9a6d12", stroke_width=1)
    p.rect(bxc - 9, byc - 12, 18, 24, fill=HONEY, stroke="#2f2a22", stroke_width=1.2)

    # the mote stream: sand motes flow from the rider toward the book, thick on the true aisle
    def stream(pts, n, spread, rmax, op):
        for _ in range(n):
            t = p.rng.random() ** 0.8
            seg = t * (len(pts) - 1)
            i = min(int(seg), len(pts) - 2)
            u = seg - i
            x = lerp(pts[i][0], pts[i + 1][0], u)
            y = lerp(pts[i][1], pts[i + 1][1], u)
            sc = 1 - 0.75 * t
            p.circle(x + p.rng.gauss(0, spread * sc), y + p.rng.gauss(0, spread * sc), p.rng.uniform(0.8, rmax) * sc + 0.4,
                     fill="#b8861c", opacity=op)

    stream([(330, 470), (430, 440), (530, 420), (600, 408), (640, 404)], 420, 26, 3.6, 0.85)
    stream([(470, 430), (520, 360), (530, 300)], 30, 14, 2.4, 0.4)   # thinning up the wrong ladder
    stream([(560, 440), (700, 560), (760, 650)], 26, 16, 2.4, 0.35)  # thinning down the shaft

    # Elaris on a rolling ladder on the near-left wall, pushing along the rail
    rail_y = 300
    p.line(40, rail_y, 380, rail_y + 40, **L)
    lx = 250
    ladder(lx, rail_y + 22, lx - 80, 770, 46, 14)
    for wx in (lx - 103, lx - 57):
        p.circle(wx, 772, 9, **L)
    fx, fy = lx - 34, 520
    p.open("g", transform=f"translate({fx} {fy}) scale(1.6) translate({-fx} {-fy})")
    body = [(fx, fy - 60), (fx + 8, fy - 6)]
    p.circle(fx - 2, fy - 76, 13, fill="#f2ecdc", **{k: v for k, v in L.items() if k != "fill"})
    p.path(f"M{f(body[0][0])},{f(body[0][1])}L{f(body[1][0])},{f(body[1][1])}", **L)
    p.path(f"M{fx},{fy - 50}L{fx + 30},{fy - 66}L{fx + 46},{fy - 90}", **L)  # arm reaching along the rail
    p.path(f"M{fx},{fy - 46}L{fx - 20},{fy - 22}", **L)
    p.path(f"M{fx + 8},{fy - 6}L{fx - 14},{fy + 30}M{fx + 8},{fy - 6}L{fx + 20},{fy + 34}", **L)
    p.path(f"M{fx - 12},{fy - 58}L{fx - 30},{fy + 10}L{fx + 20},{fy + 10}L{fx + 6},{fy - 58}", **L)  # robe
    p.close()
    for k in range(4):
        p.line(lx + 40 + k * 14, 360 + k * 6, lx + 90 + k * 22, 372 + k * 8, **L)  # motion lines

    # a falling book, its shadow first
    bxf, byf = 470, 560
    p.path(f"M{bxf},{byf}l40,-14l14,30l-40,14Z M{bxf},{byf}l6,8l40,-14", **L)
    for k in range(3):
        p.line(bxf + 20, byf - 40 - k * 16, bxf + 26, byf - 26 - k * 16, **L)
    p.ellipse(bxf + 24, 744, 40, 8, fill="none", stroke="#2f2a22", stroke_width=1.2, stroke_dasharray="3 4")

    # bookmark ribbon across the top: three of four lengths grown
    p.rect(0, 0, W, 54, fill="#f2ecdc")
    p.line(0, 54, W, 54, **L)
    seg_w = 230
    for k in range(4):
        x = 120 + k * (seg_w + 20)
        if k < 3:
            p.rect(x, 16, seg_w, 22, fill=SAGE, stroke="#2f2a22", stroke_width=1.2)
        else:
            p.rect(x, 16, seg_w, 22, fill="none", stroke="#2f2a22", stroke_width=1.2, stroke_dasharray="4 5")
    p.poly([(120 + 3 * (seg_w + 20) - 20, 16), (120 + 3 * (seg_w + 20) - 6, 27), (120 + 3 * (seg_w + 20) - 20, 38)],
           fill=SAGE, stroke="#2f2a22", stroke_width=1.2)
    p.text(30, 34, "3 / 4", size=18, family="serif", fill="#2f2a22")


# ---- 1D: Tea Blending ---------------------------------------------------------------------------
@register(G, "tea-blending")
def tea_blending(p: Pic):
    """Tea Blending (1D): an apothecary label framed in whiplash curves. Three jars of herbs stand
    across the top, each label showing its depth, length and binding marks; one spoon of seer's
    sprig arcs from a jar toward the cup of mint, where two of three spoon slots are already full.
    The steep ring around the cup is turned to mark 4, and the requirement card below asks for depth
    6, length 6 and binding no more than 2."""
    p.paper("#e9dfc4", grain=0.25)
    ink = "#4a3220"
    gold = "#b98a2a"
    # outer frame: double rule with whiplash tendrils in the corners
    p.rect(26, 26, W - 52, H - 52, fill="none", stroke=ink, stroke_width=4, rx=26)
    p.rect(40, 40, W - 80, H - 80, fill="none", stroke=gold, stroke_width=1.6, rx=18)

    def whiplash(x, y, sx, sy):
        pts = [(0, 0), (90, 10), (150, 70), (120, 140), (60, 120), (80, 80), (130, 90)]
        d = p.smooth_d([(x + sx * a, y + sy * b) for a, b in pts])
        p.path(d, fill="none", stroke=ink, stroke_width=5, stroke_linecap="round")
        pts2 = [(0, 0), (20, 100), (80, 170), (190, 170), (230, 120)]
        p.path(p.smooth_d([(x + sx * a, y + sy * b) for a, b in pts2]), fill="none", stroke=gold, stroke_width=3,
               stroke_linecap="round")
        for k, (a, b) in enumerate([(150, 70), (80, 170), (190, 170)]):
            cx, cy = x + sx * a, y + sy * b
            p.path(f"M{f(cx)},{f(cy)} q{f(sx * 22)},{f(-sy * 26)} {f(sx * 46)},{f(-sy * 6)} "
                   f"q{f(-sx * 22)},{f(sy * 26)} {f(-sx * 46)},{f(sy * 6)}Z", fill=SAGE, stroke=ink, stroke_width=1.6)

    whiplash(50, 50, 1, 1)
    whiplash(W - 50, 50, -1, 1)
    whiplash(50, H - 50, 1, -1)
    whiplash(W - 50, H - 50, -1, -1)
    # central arch panel
    p.path("M150,760 L150,250 C150,120 330,80 600,80 C870,80 1050,120 1050,250 L1050,760",
           fill="#f5ecd4", stroke=ink, stroke_width=3)
    p.path("M170,760 L170,256 C170,140 340,100 600,100 C860,100 1030,140 1030,256 L1030,760",
           fill="none", stroke=gold, stroke_width=1.4)
    # long vertical whiplash stems up the panel sides
    for sx, x in ((1, 150), (-1, 1050)):
        pts = [(x, 760), (x - sx * 40, 620), (x + sx * 10, 520), (x - sx * 50, 420), (x - sx * 10, 330)]
        p.path(p.smooth_d(pts), fill="none", stroke=SAGE, stroke_width=6, stroke_linecap="round")
        for k in range(1, 4):
            ax, ay = pts[k]
            p.path(f"M{f(ax)},{f(ay)} q{f(-sx * 30)},-30 {f(-sx * 64)},-12 q{f(sx * 28)},26 {f(sx * 64)},12Z",
                   fill=SAGE, stroke=ink, stroke_width=1.4)

    # three jars
    jars = [("SEER'S SPRIG", (3, 0, 1), "#7f9a5c"), ("DUNE-VINE", (1, 2, 0), "#c98a3a"), ("HONEYMOSS", (0, 1, -2), HONEY)]
    for i, (name, marks, herb) in enumerate(jars):
        cx = 360 + i * 240
        top, bot = 160, 330
        glass = (f"M{cx - 52},{top + 30} q0,-14 14,-16 h76 q14,2 14,16 v{bot - top - 50} "
                 f"q0,20 -20,20 h-64 q-20,0 -20,-20Z")
        p.path(glass, fill="#dfe8de", stroke=ink, stroke_width=2.6, opacity=0.95)
        # herbs floating inside
        for _ in range(26):
            hx = cx + p.rng.uniform(-38, 38)
            hy = p.rng.uniform(top + 70, bot - 6)
            a = p.rng.uniform(0, 360)
            p.ellipse(hx, hy, 6, 2.6, fill=herb, transform=f"rotate({f(a)} {f(hx)} {f(hy)})", opacity=0.9)
        p.rect(cx - 44, top - 10, 88, 22, rx=6, fill=WALNUT, stroke=ink, stroke_width=2)
        # nouveau label on the jar
        p.path(f"M{cx - 66},{top + 52} q66,-26 132,0 v66 q-66,22 -132,0Z", fill="#f8f0da", stroke=ink, stroke_width=1.8)
        p.text(cx, top + 78, name, size=15, family="serif", fill=ink, text_anchor="middle", letter_spacing=1)
        for k, (v, lab) in enumerate(zip(marks, "DLB")):
            mx = cx - 50 + k * 38
            p.text(mx, top + 108, lab, size=15, family="serif", fill=ink, font_weight="bold")
            for j in range(abs(v)):
                if v > 0:
                    p.rect(mx + 14, top + 102 - j * 8, 14, 5, fill=ink)
                else:
                    p.circle(mx + 18 + j * 10, top + 103, 4, fill="none", stroke="#a0412b", stroke_width=2)
    # the spoon arc from the sprig jar to the cup
    p.path("M360,340 C380,420 470,450 540,470", fill="none", stroke=ink, stroke_width=2, stroke_dasharray="3 7")
    p.path("M520,458 q22,-10 34,4 q-6,16 -30,10Z", fill="#c8c0a8", stroke=ink, stroke_width=1.8)
    p.line(520, 462, 470, 448, stroke=ink, stroke_width=3, stroke_linecap="round")
    p.ellipse(538, 461, 9, 4, fill="#7f9a5c")
    # the cup from above with its steep ring
    ccx, ccy = 600, 560
    marks = 5
    for k in range(marks):
        a0 = math.radians(200 + k * 28)
        a1 = math.radians(200 + k * 28 + 24)
        rr = 150
        width = 10 + 5 * k
        on = k == 3
        p.path(f"M{f(ccx + rr * math.cos(a0))},{f(ccy + rr * math.sin(a0))} A{rr},{rr} 0 0,1 "
               f"{f(ccx + rr * math.cos(a1))},{f(ccy + rr * math.sin(a1))}",
               fill="none", stroke=HONEY if on else "#cdbf9b", stroke_width=width, stroke_linecap="butt")
        am = math.radians(200 + k * 28 + 12)
        p.text(ccx + (rr + 34) * math.cos(am), ccy + (rr + 34) * math.sin(am) + 7, str(k + 1), size=22, family="serif",
               fill=ink, text_anchor="middle", font_weight="bold" if on else "normal")
    p.circle(ccx, ccy, 150, fill="none", stroke=ink, stroke_width=1.2, stroke_dasharray="2 6")
    p.circle(ccx, ccy, 112, fill="#f8f0da", stroke=ink, stroke_width=3)
    p.circle(ccx, ccy, 92, fill=p.radial([(0, "#b9c98a", 1), (1, "#7c8f4e", 1)]), stroke=ink, stroke_width=2)
    for _ in range(18):
        a = p.rng.uniform(0, 2 * math.pi)
        rr = p.rng.uniform(0, 70)
        x, y = ccx + rr * math.cos(a), ccy + rr * math.sin(a)
        p.ellipse(x, y, 8, 3.4, fill="#56703a", transform=f"rotate({f(math.degrees(a))} {f(x)} {f(y)})")
    # three spoon slots
    for k in range(3):
        sx = 840 + k * 0
        sy = 470 + k * 70
        p.ellipse(sx, sy, 34, 22, fill="#f8f0da" if k == 2 else "#cfc3a3", stroke=ink, stroke_width=2,
                  stroke_dasharray="5 5" if k == 2 else None)
        if k < 2:
            p.ellipse(sx, sy, 22, 12, fill=["#c98a3a", HONEY][k])
    # the steep needle pointing at mark 4
    am = math.radians(200 + 3 * 28 + 12)
    p.line(ccx + 118 * math.cos(am), ccy + 118 * math.sin(am), ccx + 168 * math.cos(am), ccy + 168 * math.sin(am),
           stroke=ink, stroke_width=4, stroke_linecap="round")
    # requirement card
    p.rect(290, 712, 620, 44, rx=10, fill="#f8f0da", stroke=ink, stroke_width=2.2)
    p.text(600, 742, "DEPTH ≥ 6  ·  LENGTH ≥ 6  ·  BINDING ≤ 2", size=22, family="serif",
           fill=ink, text_anchor="middle", letter_spacing=2)


# ---- 1D: The Naming -----------------------------------------------------------------------------
@register(G, "naming")
def naming(p: Pic):
    """The Naming (1D): a leather title page tooled in gold fillets and stamped fleurons, with the
    cartouche at its centre half filled. "The Never-Ending Dunes and The" is set in gold, two slots
    still stand blind, and the tile "Wondering" is lifted from the Person tray toward the next one.
    Below, the Place, Person and Want trays hold stamped motif tiles, and sand runs down the gutter at
    the page's edge until the name is inscribed."""
    p.paper("#5b2e1c", grain=0.45, fibre=0.6)
    grain_rect(p, 0, 0, W, H, 0.35, 0.02)
    p.vignette(0.65, "#1a0b05")
    gold = p.gradient([(0, "#f3d27a"), (0.45, "#c9962e"), (0.55, "#a57618"), (1, "#e9c25e")], 0, 0, 1, 1)
    G_ = dict(stroke=gold, fill="none")
    # fillets: thick-thin border
    p.rect(60, 40, W - 100, H - 80, stroke_width=5, **G_)
    p.rect(74, 54, W - 128, H - 108, stroke_width=1.4, **G_)
    # roll: a repeated stamped dot-and-diamond along the inner border
    d = []
    x = 92
    while x < W - 70:
        for y in (66, H - 66):
            d.append(f"M{f(x)},{f(y - 5)}l5,5l-5,5l-5,-5Z")
        x += 22
    y = 86
    while y < H - 80:
        for xx in (86, W - 66):
            d.append(f"M{f(xx)},{f(y - 5)}l5,5l-5,5l-5,-5Z")
        y += 22
    p.path("".join(d), fill=gold)

    def fleuron(cx, cy, s, rot=0):
        p.open("g", transform=f"translate({f(cx)} {f(cy)}) rotate({rot}) scale({f(s)})")
        for k in range(4):
            a = k * 90
            p.path("M0,0 C10,-14 8,-34 0,-46 C-8,-34 -10,-14 0,0Z", fill=gold, transform=f"rotate({a})")
            p.path("M0,0 C14,-6 26,-4 30,-18 C18,-20 8,-14 0,0Z", fill=gold, transform=f"rotate({a + 45})")
        p.circle(0, 0, 6, fill="#5b2e1c", stroke=gold, stroke_width=2)
        p.close()

    for cx, cy in ((120, 100), (W - 100, 100), (120, H - 100), (W - 100, H - 100)):
        fleuron(cx, cy, 0.9)
    # ring of templates (1 to 4 slots)
    for k in range(4):
        cx = 360 + k * 160
        on = k == 3
        p.rect(cx - 60, 110, 120, 44, rx=22, stroke_width=3 if on else 1.4, **G_)
        for j in range(k + 1):
            sw = 90 / (k + 1)
            p.rect(cx - 45 + j * (sw + 2), 124, sw - 4, 16, fill=gold if on else "none", stroke=gold, stroke_width=1,
                   opacity=1 if on else 0.6)
    # the cartouche
    cx, cy = 620, 330
    cart = (f"M{cx - 380},{cy} C{cx - 380},{cy - 80} {cx - 330},{cy - 120} {cx - 250},{cy - 120} "
            f"L{cx + 250},{cy - 120} C{cx + 330},{cy - 120} {cx + 380},{cy - 80} {cx + 380},{cy} "
            f"C{cx + 380},{cy + 80} {cx + 330},{cy + 120} {cx + 250},{cy + 120} L{cx - 250},{cy + 120} "
            f"C{cx - 330},{cy + 120} {cx - 380},{cy + 80} {cx - 380},{cy}Z")
    p.path(cart, fill="#4a2314", stroke=gold, stroke_width=4)
    p.path(cart, fill="none", stroke=gold, stroke_width=1.2, transform=f"translate({cx} {cy}) scale(0.94) translate({-cx} {-cy})")
    for sx in (-1, 1):
        fleuron(cx + sx * 395, cy, 0.55, 45)
    words = [("THE", True), ("NEVER-ENDING", True), ("DUNES", True), ("AND THE", True), ("", False), ("", False)]
    rows = [words[:3], words[3:]]
    for ri, row in enumerate(rows):
        yy = cy - 34 + ri * 72
        widths = [max(110, len(w) * 22 + 30) if w else 200 for w, _ in row]
        tot = sum(widths) + 18 * (len(row) - 1)
        x = cx - tot / 2
        for (w, filled), wd in zip(row, widths):
            if filled:
                p.text(x + wd / 2, yy + 14, w, size=34, family="serif", fill=gold, text_anchor="middle", letter_spacing=3,
                       font_weight="bold")
            else:
                p.rect(x, yy - 22, wd, 46, rx=6, fill="#3a1a0e", stroke="#2a1008", stroke_width=3)
                p.rect(x + 3, yy - 19, wd - 6, 40, rx=5, fill="none", stroke="#7a4a30", stroke_width=1.2,
                       stroke_dasharray="6 5")
            x += wd + 18
    # trays of motif tiles
    trays = [("PLACE", ["DESERT", "SILVER", "MOON", "WAVES"]),
             ("PERSON", ["XANDRI", "FATHER", "SHAMAN", "XANDRIXES"]),
             ("WANT", ["END", "PROOF", "FURTHER", "MARK"])]
    for t, (lab, tiles) in enumerate(trays):
        tx = 140 + t * 320
        ty = 500
        p.rect(tx, ty, 290, 210, rx=10, fill="#4a2314", stroke=gold, stroke_width=2)
        p.text(tx + 145, ty + 30, lab, size=20, family="serif", fill=gold, text_anchor="middle", letter_spacing=6)
        p.line(tx + 40, ty + 42, tx + 250, ty + 42, stroke=gold, stroke_width=1)
        for k, w in enumerate(tiles):
            gx = tx + 18 + (k % 2) * 132
            gy = ty + 58 + (k // 2) * 70
            p.rect(gx, gy, 122, 52, rx=4, fill="#6b3824", stroke=gold, stroke_width=1.6)
            p.rect(gx + 4, gy + 4, 114, 44, rx=3, fill="none", stroke=gold, stroke_width=0.6)
            p.text(gx + 61, gy + 33, w, size=17 if len(w) < 8 else 13, family="serif", fill=gold, text_anchor="middle",
                   letter_spacing=1)
    # the lifted tile, casting a shadow, on its way to the empty slot
    lx, ly = 690, 420
    p.rect(lx + 8, ly + 12, 170, 56, rx=4, fill="#1a0b05", opacity=0.5)
    p.rect(lx, ly, 170, 56, rx=4, fill="#7a4029", stroke=gold, stroke_width=2.4, transform=f"rotate(-5 {lx + 85} {ly + 28})")
    p.text(lx + 85, ly + 36, "WONDERING", size=20, family="serif", fill=gold, text_anchor="middle", letter_spacing=2,
           transform=f"rotate(-5 {lx + 85} {ly + 28})", font_weight="bold")
    p.path("M770,560 C780,520 770,490 760,480", fill="none", stroke=gold, stroke_width=2, stroke_dasharray="4 6")
    # gutter on the left, running with sand
    p.rect(1080, 160, 40, 560, fill="#3a1a0e", stroke=gold, stroke_width=1.2)
    p.stipple(1084, 160, 32, 560, n=900, r=(0.6, 1.8), fill="#e3c98f",
              density=lambda x, y: 0.4 + 0.6 * abs(math.sin(y / 40)))


# ---- 1D: The Clasps -----------------------------------------------------------------------------
@register(G, "clasps")
def clasps(p: Pic):
    """The Clasps (1D): a cutaway through a book cover shows a brass gear train on a five by four peg
    board. The crank turns the first gear clockwise and each meshing gear turns the other way, so the
    player is placing the last gear from the tray to make the latch gear turn clockwise and draw the
    bolt. A reset lever sits top left, the move counter top right, the hint sigil glows bottom right."""
    p.paper("#3b2416", grain=0.4, fibre=0.7)
    grain_rect(p, 0, 0, W, H, 0.3, 0.03)
    brass, brass_d, brass_l = "#c9a24a", "#8d6a26", "#e6c776"
    steel, copper, verd = "#9aa4aa", "#b4693a", "#5f9a86"
    # the cutaway window into the cover
    win = "M210,110 L1010,96 L1040,250 L1020,690 L640,712 L230,700 L196,420Z"
    p.path(win, fill="#1e1510", stroke="#120b07", stroke_width=10)
    p.path(win, fill="none", stroke="#7a5236", stroke_width=3, transform="translate(6 6)")
    cl = p.clip(f'<path d="{win}"/>')
    p.hatch(196, 96, 850, 620, angle=30, spacing=10, clip=cl, stroke="#2e2219", stroke_width=1.2)
    # peg board
    ox, oy, sp = 330, 200, 130
    p.rect(ox - 60, oy - 60, 4 * sp + 120, 3 * sp + 120, rx=12, fill="#4a3424", stroke="#2a1c12", stroke_width=3)
    pegs = [(ox + i * sp, oy + j * sp) for j in range(4) for i in range(5)]
    for x, y in pegs:
        p.circle(x, y, 9, fill="#2a1c12")
        p.circle(x, y, 5, fill=steel)
    radii = {1: 45, 2: 65, 3: 85}
    # chain on row 2: knob(s1), s3, s1, [s3 missing], latch s1
    chain = [((0, 2), 1, brass), ((1, 2), 3, copper), ((2, 2), 1, brass), ((3, 2), 3, None), ((4, 2), 1, brass)]

    def gear(cx, cy, size, fill, rot=0):
        r = radii[size]
        p.path(gear_d(cx, cy, r, rot=rot), fill=fill, stroke="#3a2a12", stroke_width=2)
        p.circle(cx, cy, r - 12, fill="none", stroke=brass_d, stroke_width=3)
        p.circle(cx, cy, r * 0.62, fill=brass_d if fill != copper else "#8a4a24")
        nsp = 5 if size > 1 else 4
        for k in range(nsp):
            a = rot + 2 * math.pi * k / nsp
            hx, hy = cx + r * 0.38 * math.cos(a), cy + r * 0.38 * math.sin(a)
            p.circle(hx, hy, r * 0.15, fill="#1e1510")
        p.circle(cx, cy, r * 0.2, fill=steel, stroke="#3a2a12", stroke_width=1.5)
        p.circle(cx, cy, 4, fill="#2a1c12")
        # flat highlight: a lighter crescent on the upper left
        p.path(f"M{f(cx - r + 8)},{f(cy)} A{r - 8},{r - 8} 0 0,1 {f(cx)},{f(cy - r + 8)}", fill="none",
               stroke=brass_l, stroke_width=3, opacity=0.7)

    for idx, ((i, j), size, fill) in enumerate(chain):
        cx, cy = ox + i * sp, oy + j * sp
        if fill is None:
            p.circle(cx, cy, radii[size] + 6, fill="none", stroke=brass_l, stroke_width=2, stroke_dasharray="6 7")
            continue
        gear(cx, cy, size, fill, rot=idx * 0.3)
        cw = idx % 2 == 0
        arc_arrow(p, cx, cy, radii[size] + 22, cw, stroke=verd, stroke_width=4)
    # decoy gear on another peg (off the chain)
    gear(ox + 1 * sp, oy + 0 * sp, 1, steel, rot=0.2)
    # the held gear hovering above its peg, with its own shadow
    hx, hy = ox + 3 * sp + 40, oy + 2 * sp - 150
    p.circle(ox + 3 * sp + 10, oy + 2 * sp + 12, radii[3], fill="#000", opacity=0.3)
    gear(hx, hy, 3, copper, rot=0.1)
    p.path(f"M{hx - 20},{hy + 96} q-10,40 -40,60", fill="none", stroke=brass_l, stroke_width=3, stroke_dasharray="5 6")
    # the crank on the knob
    kx, ky = ox, oy + 2 * sp
    p.line(kx, ky, kx - 110, ky + 40, stroke=steel, stroke_width=12, stroke_linecap="round")
    p.circle(kx - 110, ky + 40, 18, fill=WALNUT, stroke="#2a1c12", stroke_width=3)
    # latch gear drives a rack and the bolt
    lx, ly = ox + 4 * sp, oy + 2 * sp
    rack_y = ly + radii[1] + 4
    p.rect(lx - 60, rack_y, 230, 22, fill=brass_d, stroke="#3a2a12", stroke_width=2)
    tooth = "".join(f"M{lx - 56 + k * 14},{rack_y} l5,-8 h4 l5,8" for k in range(16))
    p.path(tooth, fill=brass_d, stroke="#3a2a12", stroke_width=1.2)
    p.rect(lx + 150, rack_y - 26, 150, 74, rx=6, fill=steel, stroke="#3a2a12", stroke_width=3)
    p.rect(lx + 166, rack_y - 14, 118, 50, rx=4, fill="none", stroke="#6c767c", stroke_width=2)
    # arrow: the bolt draws back when the latch turns clockwise
    p.line(lx + 270, rack_y - 46, lx + 180, rack_y - 46, stroke=verd, stroke_width=5, stroke_linecap="round")
    p.poly([(lx + 166, rack_y - 46), (lx + 186, rack_y - 58), (lx + 186, rack_y - 34)], fill=verd)
    # leather straps of the cover crossing the margins
    for y in (40, 740):
        p.rect(0, y - 18, W, 36, fill="#6b3a22", stroke="#2a1408", stroke_width=2)
        p.stitch([(0, y - 10), (W, y - 10)], 8, 6, stroke="#d8b878", stroke_width=1.6)
        p.stitch([(0, y + 10), (W, y + 10)], 8, 6, stroke="#d8b878", stroke_width=1.6)
    # tray of remaining gears (bottom), counter, reset lever, hint sigil
    p.rect(330, 650, 300, 70, rx=8, fill="#2a1c12", stroke=brass_d, stroke_width=2)
    for k, s in enumerate((2, 2)):
        p.open("g", transform=f"translate({390 + k * 140} 685) scale(0.42) translate({-390 - k * 140} -685)")
        gear(390 + k * 140, 685, s, steel)
        p.close()
    p.rect(1040, 70, 140, 56, rx=6, fill="#1e1510", stroke=brass, stroke_width=2)
    p.text(1110, 108, "MOVES 07", size=20, family="monospace", fill=brass_l, text_anchor="middle")
    p.rect(26, 70, 120, 56, rx=6, fill="#1e1510", stroke=brass, stroke_width=2)
    p.line(56, 112, 100, 78, stroke=steel, stroke_width=8, stroke_linecap="round")
    p.circle(100, 78, 10, fill="#a0412b")
    p.text(110, 116, "R", size=16, family="sans-serif", fill=brass_l)
    sx, sy = 1110, 600
    p.circle(sx, sy, 60, fill=p.radial([(0, "#f6dc8a", 0.85), (1, "#f6dc8a", 0)]))
    p.poly(Pic.star_pts(sx, sy, 30, 12, 8), fill=brass_l, stroke="#3a2a12", stroke_width=1.5)
    p.circle(sx, sy, 7, fill=verd)


# ---- 1D: The Rule Tablet ------------------------------------------------------------------------
@register(G, "rule-tablet")
def rule_tablet(p: Pic):
    """The Rule Tablet (1D): a clay tablet of eight ruled registers, each rule pressed in wedge marks
    and numbered by its count of upright wedges, with key words underlined. A test has just run:
    rule 5 lights with its word underlined in red, and a watcher's shadow has begun to fall across the
    tablet's right edge. Below, three clay Way tokens sit in the plan row beside the Want token, with
    the Test stone and the cracked Break stone to the right."""
    p.paper("#2c241c", grain=0.4)
    p.stipple(0, 0, W, H, n=1800, r=(0.6, 1.8), fill="#c9a879", opacity=0.25)
    clay, clay_l, clay_d = "#c08e5e", "#d9ab7b", "#7e5232"
    tx0, ty0, tx1, ty1 = 160, 30, 900, 620
    sh = p.blur(10)
    p.rect(tx0 + 14, ty0 + 18, tx1 - tx0, ty1 - ty0, rx=46, fill="#000", opacity=0.55, filter=sh)
    rough = p.roughen(6, 0.03)
    p.rect(tx0, ty0, tx1 - tx0, ty1 - ty0, rx=46, fill=p.radial([(0, clay_l, 1), (0.7, clay, 1), (1, "#9a6a40", 1)], 0.45, 0.4, 0.75),
           filter=rough)
    grain_rect(p, tx0 + 10, ty0 + 10, tx1 - tx0 - 20, ty1 - ty0 - 20, 0.35, 0.5)

    def wedge(x, y, ang, s=1.0):
        """One pressed wedge: a triangular head and a tapering tail."""
        ca, sa = math.cos(ang), math.sin(ang)
        def T(u, v):
            return (x + (u * ca - v * sa) * s, y + (u * sa + v * ca) * s)
        p.poly([T(0, -7), T(0, 7), T(11, 0)], fill=clay_d)
        p.poly([T(0, -7), T(11, 0), T(3, -1)], fill="#5a3820")
        p.poly([T(9, -1.6), T(26, -0.4), T(26, 0.4), T(9, 1.6)], fill=clay_d)
        p.line(T(0, 7)[0], T(0, 7)[1], T(11, 0)[0], T(11, 0)[1], stroke=clay_l, stroke_width=1)

    reg_h = (ty1 - ty0 - 60) / 8
    hot = 4
    for k in range(8):
        y = ty0 + 30 + k * reg_h
        if k == hot:
            p.rect(tx0 + 24, y + 2, tx1 - tx0 - 48, reg_h - 4, rx=6, fill="#f2c27a", opacity=0.45)
        # ruled line between registers: a double incised line
        if k:
            p.line(tx0 + 26, y, tx1 - 26, y, stroke=clay_d, stroke_width=2.2)
            p.line(tx0 + 26, y + 2.5, tx1 - 26, y + 2.5, stroke=clay_l, stroke_width=1)
        cy = y + reg_h / 2
        # numeral: k+1 upright wedges, stacked in two rows when many
        n = k + 1
        for j in range(n):
            col, row = j % 4, j // 4
            wedge(tx0 + 46 + col * 11, cy - 16 + row * 18 - (0 if n > 4 else -8), math.pi / 2, 0.62)
        p.line(tx0 + 104, y + 6, tx0 + 104, y + reg_h - 6, stroke=clay_d, stroke_width=1.6)
        # signs across the register
        x = tx0 + 124
        nsigns = 0
        key = p.rng.randrange(2, 6)
        while x < tx1 - 70:
            sw = p.rng.uniform(40, 74)
            nw = p.rng.randint(2, 5)
            for _ in range(nw):
                ang = p.rng.choice([0, 0, 0, math.pi / 2, math.pi / 4, -math.pi / 4])
                wedge(x + p.rng.uniform(0, sw - 26), cy + p.rng.uniform(-12, 8), ang, p.rng.uniform(0.7, 0.95))
            if nsigns == key:
                col = "#b22d1c" if k == hot else clay_d
                wid = 4 if k == hot else 1.8
                p.line(x - 4, cy + 21, x + sw, cy + 21, stroke=col, stroke_width=wid, stroke_linecap="round")
            x += sw + p.rng.uniform(8, 22)
            nsigns += 1
    # the watcher's shadow along the right edge
    shadow = p.blur(18)
    p.path(f"M{tx1 + 80},{ty1 + 40} C{tx1 - 20},{ty1 - 100} {tx1 - 70},{ty0 + 260} {tx1 - 40},{ty0 + 140} "
           f"C{tx1 - 90},{ty0 + 120} {tx1 - 90},{ty0 + 60} {tx1 - 40},{ty0 + 50} C{tx1 + 10},{ty0 + 50} {tx1 + 20},{ty0 + 120} "
           f"{tx1 - 10},{ty0 + 140} C{tx1 + 60},{ty0 + 200} {tx1 + 120},{ty1 - 60} {tx1 + 200},{ty1 + 40}Z",
           fill="#120c08", opacity=0.55, filter=shadow)
    # scrutiny tally marks pressed in the frame corner
    for k in range(3):
        p.line(tx1 - 70 + k * 12, ty1 - 22, tx1 - 76 + k * 12, ty1 - 6, stroke="#b22d1c", stroke_width=3)

    def token(cx, cy, w, h, label, signs, tint=clay):
        p.rect(cx - w / 2 + 6, cy - h / 2 + 8, w, h, rx=16, fill="#000", opacity=0.45, filter=sh)
        p.rect(cx - w / 2, cy - h / 2, w, h, rx=16, fill=p.radial([(0, clay_l, 1), (1, tint, 1)], 0.4, 0.35, 0.8))
        for s in range(signs):
            wedge(cx - w / 2 + 18 + s * ((w - 50) / max(1, signs - 1) if signs > 1 else 0), cy - 6,
                  p.rng.choice([0, math.pi / 2, math.pi / 4]), 0.75)
        p.text(cx, cy + h / 2 - 10, label, size=13, family="sans-serif", fill="#3a2414", text_anchor="middle",
               letter_spacing=2)

    # want token and the plan row of three ways
    token(250, 712, 150, 100, "WANT", 3, tint="#b0905a")
    p.text(250, 650, "", size=10)
    for k in range(3):
        cx = 440 + k * 170
        p.rect(cx - 72, 656, 144, 112, rx=18, fill="none", stroke="#c9a879", stroke_width=1.6, stroke_dasharray="6 6")
        token(cx, 712, 128, 92, f"WAY {k + 1}", 3)
    # spare way tokens in the tray on the right
    for k in range(4):
        cx, cy = 1000 + (k % 2) * 110, 420 + (k // 2) * 100
        token(cx, cy, 96, 72, "", 2, tint="#a97a4c")
    # Test stone (smooth) and Break stone (cracked)
    for cx, cy, lab, crack in ((990, 640, "TEST", False), (1110, 640, "BREAK", True)):
        p.ellipse(cx + 6, cy + 10, 52, 44, fill="#000", opacity=0.45, filter=sh)
        p.ellipse(cx, cy, 52, 44, fill=p.radial([(0, "#bfc1b8", 1), (1, "#6d6f68", 1)], 0.35, 0.3, 0.8))
        if crack:
            p.wobble([(cx - 30, cy - 30), (cx - 6, cy - 4), (cx + 4, cy + 10), (cx + 24, cy + 34)], amp=3, step=8,
                     stroke="#2a2420", stroke_width=2.4)
            p.wobble([(cx - 6, cy - 4), (cx + 26, cy - 14)], amp=2, step=8, stroke="#2a2420", stroke_width=1.6)
        p.text(cx, cy + 74, lab, size=16, family="sans-serif", fill="#e8d6b4", text_anchor="middle", letter_spacing=3)
    # a finger-pressed arrow from plan row to test stone
    p.path("M940,700 q20,-30 6,-50", fill="none", stroke="#e8d6b4", stroke_width=2, stroke_dasharray="4 6")
    p.text(1050, 120, "RULE 5", size=26, family="serif", fill="#f2c27a", text_anchor="middle", letter_spacing=3)
    p.text(1050, 152, "trodden", size=22, family="serif", fill="#e8d6b4", text_anchor="middle", font_style="italic")
    p.line(1000, 160, 1100, 160, stroke="#b22d1c", stroke_width=3)

"""Missing Campsites gameplay pictographs. Built by tools/pictographs/build.py.

Palette from DESIGN.md section 15: cedar posts, sun-faded greens, dust gold, the van's dull red;
night torch amber in a blue-black field; the other side's pearl sky and greens with no yellow;
paper in cream stock, graphite grey and printed forest-green ink.
"""
import math

from core import H, W, Pic, f, register

G = "missing-campsites"

CEDAR = "#8a5a3b"
AMBER = "#ffb35c"
NIGHT = "#0d1220"
PEARL = "#ecebe6"
GREEN_OS = "#2e6a5c"      # other-side green, no yellow
GREEN_INK = "#2f6b3a"     # printed forest-green ink
CREAM = "#f1ead6"
GRAPHITE = "#4a4a4c"
DUST = "#c9a54a"
VAN_RED = "#9c3b30"


# ---- shared helpers ------------------------------------------------------------------------------
def loop_pts(cx, cy, rx, ry, n, wob=0.0, rng=None, start=-90):
    """Points round an oval loop road (site order runs clockwise from the entrance)."""
    out = []
    for i in range(n):
        a = math.radians(start + 360 * i / n)
        k = 1 + (rng.uniform(-wob, wob) if rng and wob else 0)
        out.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    return out


def tally(p, x, y, n, h=34, gap=11, **kw):
    """Pencil tally marks in gates of five, drawn by hand."""
    kw.setdefault("stroke", GRAPHITE)
    kw.setdefault("stroke_width", 2.2)
    kw.setdefault("stroke_linecap", "round")
    cx = x
    for g in range(0, n, 5):
        k = min(5, n - g)
        for i in range(min(k, 4)):
            r = p.rng
            p.wobble([(cx + i * gap, y), (cx + i * gap + r.uniform(-2, 2), y + h)], amp=0.9, step=10, **kw)
        if k == 5:
            p.wobble([(cx - 6, y + h * 0.8), (cx + 3 * gap + 6, y + h * 0.2)], amp=0.9, step=10, **kw)
        cx += 4 * gap + 18


def crayon(p, pts, color, width=10, passes=4, closed=False, filt=None, opacity=0.8):
    """Waxy broken strokes: several thin jittered passes with gaps, roughened."""
    for _ in range(passes):
        r = p.rng
        dash = f"{f(r.uniform(14, 40))} {f(r.uniform(1.5, 6))} {f(r.uniform(6, 22))} {f(r.uniform(1, 4))}"
        off = (r.uniform(-width * .3, width * .3), r.uniform(-width * .3, width * .3))
        q = [(x + off[0], y + off[1]) for x, y in pts]
        p.path(p.wobble_d(q, amp=width * 0.18, step=16, closed=closed), fill="none", stroke=color,
               stroke_width=f(width * r.uniform(0.35, 0.6)), stroke_linecap="round", stroke_linejoin="round",
               stroke_dasharray=dash, opacity=f(opacity * r.uniform(0.6, 1)), filter=filt)


def crayon_fill(p, pts, color, width=7, angle=35, spacing=7, filt=None, opacity=0.65):
    """Scribble-fill a closed shape with back-and-forth crayon strokes, clipped to it."""
    xs = [x for x, _ in pts]; ys = [y for _, y in pts]
    inner = "<polygon points=\"" + " ".join(f"{f(x)},{f(y)}" for x, y in pts) + "\"/>"
    clip = p.clip(inner)
    x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
    a = math.radians(angle); ca, sa = math.cos(a), math.sin(a)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    R = math.hypot(x1 - x0, y1 - y0) / 2 + 10
    d = []
    k = -R
    flip = False
    while k <= R:
        px, py = cx - sa * k, cy + ca * k
        a1 = (px - ca * R, py - sa * R); a2 = (px + ca * R, py + sa * R)
        if flip:
            a1, a2 = a2, a1
        d.append(p.wobble_d([a1, a2], amp=1.6, step=22)[1:])
        flip = not flip
        k += spacing * p.rng.uniform(0.7, 1.3)
    p.open("g", clip_path=clip)
    p.path("M" + " L".join(d), fill="none", stroke=color, stroke_width=width, stroke_linecap="round",
           stroke_linejoin="round", opacity=f(opacity), filter=filt,
           stroke_dasharray=f"{f(p.rng.uniform(30, 60))} 3 {f(p.rng.uniform(10, 30))} 2")
    p.close()


def contour_segments(field, x0, y0, w, h, step, level):
    """Marching squares: path data for one iso-level of field(x, y)."""
    nx, ny = int(w / step), int(h / step)
    vals = [[field(x0 + i * step, y0 + j * step) for i in range(nx + 1)] for j in range(ny + 1)]
    d = []

    def lerp(pa, pb, va, vb):
        t = (level - va) / (vb - va) if vb != va else 0.5
        return pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t

    for j in range(ny):
        for i in range(nx):
            v = [vals[j][i], vals[j][i + 1], vals[j + 1][i + 1], vals[j + 1][i]]
            c = [(x0 + i * step, y0 + j * step), (x0 + (i + 1) * step, y0 + j * step),
                 (x0 + (i + 1) * step, y0 + (j + 1) * step), (x0 + i * step, y0 + (j + 1) * step)]
            pts = []
            for e in range(4):
                a, b = e, (e + 1) % 4
                if (v[a] >= level) != (v[b] >= level):
                    pts.append(lerp(c[a], c[b], v[a], v[b]))
            if len(pts) >= 2:
                d.append(f"M{f(pts[0][0])},{f(pts[0][1])}L{f(pts[1][0])},{f(pts[1][1])}")
            if len(pts) == 4:
                d.append(f"M{f(pts[2][0])},{f(pts[2][1])}L{f(pts[3][0])},{f(pts[3][1])}")
    return "".join(d)


# ---- 2D: Torchlight loop -------------------------------------------------------------------------
@register(G, "torchlight-loop")
def torchlight_loop(p: Pic):
    """Torchlight loop (2D): seen from above at night, Tam walks the gravel road with one amber circle
    of torchlight; everything outside it is smudged charcoal dark. Inside the light, post 14 stands
    with its gravel apron and fire ring, ready to be ticked; just ahead, where post 13 stood, the
    light shows only forest floor and the road narrows. The tally strip on the right holds Tam's
    pencil ticks while the printed counter reads 13."""
    r = p.rng
    p.rect(0, 0, W, H, fill="#141518")
    # charcoal smudges: big blurred dark masses and lighter rubbed patches
    soft = p.blur(38)
    for _ in range(26):
        g = r.randint(14, 46)
        p.ellipse(r.uniform(0, W), r.uniform(0, H), r.uniform(80, 260), r.uniform(50, 160),
                  fill=f"rgb({g},{g},{g + 4})", opacity=f(r.uniform(0.4, 0.9)), filter=soft)
    # tree crowns from above, barely there: charcoal rubbed in circles
    rough = p.roughen(9, 0.05)
    crowns = []
    for _ in range(46):
        x, y = r.uniform(-40, W + 40), r.uniform(-40, H + 40)
        if 200 < y + (x - 600) * 0.32 < 560 and 260 < x < 900:
            continue
        crowns.append((x, y))
        rr = r.uniform(40, 90)
        d = []
        for k in range(5):
            d.append(p.smooth_d([(x + (rr - k * 7) * math.cos(t) * r.uniform(.9, 1.1),
                                  y + (rr - k * 7) * math.sin(t) * r.uniform(.9, 1.1))
                                 for t in [i * math.pi / 5 for i in range(10)]], closed=True))
        p.path("".join(d), fill="none", stroke="#3a3c42", stroke_width=2.4, opacity=0.5, filter=rough)
    # the road, running diagonally: faint charcoal edges outside the light
    def road(t):
        return -60 + t * 1320, 430 - (t * 1320 - 660) * 0.32
    edge_a = [(road(t)[0], road(t)[1] - 48) for t in [i / 12 for i in range(13)]]
    edge_b = [(road(t)[0], road(t)[1] + 48) for t in [i / 12 for i in range(13)]]
    for e in (edge_a, edge_b):
        p.wobble(e, amp=3, step=30, stroke="#5a5b60", stroke_width=5, opacity=0.35, filter=rough)
    # long charcoal strokes over everything (the drawing hand)
    for _ in range(140):
        x, y = r.uniform(0, W), r.uniform(0, H)
        a = r.gauss(-0.32, 0.2); L = r.uniform(60, 240)
        p.line(x, y, x + L * math.cos(a), y + L * math.sin(a), stroke="#000", stroke_width=f(r.uniform(2, 9)),
               opacity=f(r.uniform(0.08, 0.3)), stroke_linecap="round", filter=rough)
    # a post outside the light, behind Tam: a dim silhouette only
    p.rect(258, 488, 26, 26, fill="#26272b", stroke="#3c3d42", stroke_width=2, filter=rough)
    # ---- inside the torch circle ----
    cx, cy, R = 600, 430, 245
    clip = p.clip(f'<circle cx="{cx}" cy="{cy}" r="{R}"/>')
    p.open("g", clip_path=clip)
    p.rect(cx - R, cy - R, 2 * R, 2 * R, fill="#5b4a33")
    # forest floor: needles and leaf litter
    d = []
    for _ in range(900):
        x, y = cx + r.uniform(-R, R), cy + r.uniform(-R, R)
        a = r.uniform(0, math.pi); L = r.uniform(5, 14)
        d.append(f"M{f(x)},{f(y)}l{f(L * math.cos(a))},{f(L * math.sin(a))}")
    p.path("".join(d), stroke="#3a2c1c", stroke_width=1.4, opacity=0.8)
    p.stipple(cx - R, cy - R, 2 * R, 2 * R, n=500, r=(1.5, 4), fill="#7a6243", opacity=0.6)
    # gravel road, narrowed by a hand's width where post 13 went (to the right of Tam)
    def width_at(x):
        return 44 if x < 720 else 44 - min(12, (x - 720) * 0.25)
    top = [(x, 430 - (x - 600) * 0.32 - width_at(x)) for x in range(360, 860, 20)]
    bot = [(x, 430 - (x - 600) * 0.32 + width_at(x)) for x in range(840, 340, -20)]
    p.path(p.wobble_d(top + bot, amp=2, step=18, closed=True), fill="#a49478")
    gx = []
    for _ in range(700):
        x = r.uniform(360, 860)
        w_ = width_at(x)
        y = 430 - (x - 600) * 0.32 + r.uniform(-w_, w_)
        gx.append((x, y))
    p.path("".join(f"M{f(x)},{f(y)}h{f(r.uniform(2, 5))}v{f(r.uniform(2, 4))}h{f(-r.uniform(2, 5))}z" for x, y in gx),
           fill="#cbbd9e", opacity=0.8)
    # post 14 (left, below the road) with its gravel apron and fire ring
    px_, py_ = 500, 515
    p.ellipse(px_ + 10, py_ + 20, 96, 64, fill="#b3a585")
    p.stipple(px_ - 86, py_ - 44, 192, 128, n=260, r=(1, 2.6), fill="#d8ccb0",
              density=lambda x, y: 1 if ((x - px_ - 10) / 96) ** 2 + ((y - py_ - 20) / 64) ** 2 < 1 else 0)
    p.circle(px_ + 50, py_ + 26, 26, fill="#2b2420", stroke="#77706a", stroke_width=7, stroke_dasharray="9 3")
    p.rect(px_ - 22, py_ - 22, 30, 30, fill=CEDAR, stroke="#4a2e1c", stroke_width=2)
    for k in range(1, 4):
        p.circle(px_ - 7, py_ - 7, k * 4, fill="none", stroke="#5c3a24", stroke_width=1)
    p.text(px_ - 34, py_ - 30, "14", size=30, family="sans-serif", fill="#f6e7c8", font_weight="bold")
    # where post 13 stood: forest floor only, an empty place marked by its absence
    p.circle(720, 300, 40, fill="none", stroke="#f6e7c8", stroke_width=3, stroke_dasharray="5 7", opacity=0.85)
    p.text(700, 254, "13?", size=22, family="sans-serif", fill="#f6e7c8", opacity=0.75)
    # Tam from above: shoulders, head, the torch held forward
    p.ellipse(600, 432, 30, 20, fill="#2a3346")
    p.circle(600, 430, 13, fill="#3b2b22")
    p.rect(624, 418, 22, 9, fill="#222", transform="rotate(-18 624 422)")
    p.close()
    # light falloff: warm centre, burnt edge into the dark
    glow = p.radial([(0, "#fff0c8", 0.28), (0.5, AMBER, 0.14), (0.8, "#5a2c0c", 0.25), (0.95, "#1a0f08", 0.75), (1, "#141518", 1)],
                    cx=0.5, cy=0.5, r=0.5)
    p.circle(cx, cy, R + 2, fill=glow)
    halo = p.blur(26)
    p.circle(cx, cy, R + 14, fill="none", stroke="#141518", stroke_width=26, filter=halo, opacity=0.8)
    p.circle(cx, cy, R + 40, fill="none", stroke=AMBER, stroke_width=10, opacity=0.12, filter=halo)
    # paper grain over all
    gid = p.uid("cgrain")
    p.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="1.3" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  '
           f'0 0 0 0.16 0"/></filter>')
    p.rect(0, 0, W, H, filter=f"url(#{gid})")
    # HUD: printed counter top left, pencil tally strip right, pencil loop strip at the bottom
    p.rect(30, 28, 180, 46, fill="#0b0c0f", opacity=0.75)
    p.text(46, 60, "POSTS: 13", size=26, family="monospace", fill="#e9e2d2")
    p.rect(1080, 40, 92, 660, fill="#e8e1cf", opacity=0.92)
    p.text(1092, 72, "TALLY", size=17, family="monospace", fill=GRAPHITE)
    for k in range(4):
        tally(p, 1094, 96 + k * 58, 5 if k < 3 else 2, h=36, gap=9)
    p.wobble([(1094, 335), (1160, 335)], amp=1, step=12, stroke=GRAPHITE, stroke_width=1.4)
    p.text(1094, 370, "19-15", size=16, family="monospace", fill=GRAPHITE)
    p.text(1094, 394, "14 ...", size=16, family="monospace", fill=GRAPHITE)
    p.rect(250, 716, 700, 58, fill="#e8e1cf", opacity=0.9)
    lp = loop_pts(600, 745, 300, 18, 24)
    p.wobble(lp, amp=1.2, step=14, closed=True, stroke=GRAPHITE, stroke_width=1.6)
    for i, (x, y) in enumerate(lp):
        p.circle(x, y, 2.6, fill=GRAPHITE)
    p.circle(*lp[13], 7, fill=AMBER, stroke="#3a2a10", stroke_width=2)
    p.text(40, 770, "T  tick", size=18, family="monospace", fill="#d9cfb8")


# ---- 2D: The pattern walk ------------------------------------------------------------------------
def tree(p, x, y, r=9, color=GREEN_OS, rings=3):
    """An op-art tree: concentric rings, alternately ink and ground."""
    for k in range(rings, 0, -1):
        p.circle(x, y, r * k / rings, fill=color if (rings - k) % 2 == 0 else PEARL)


def glyph(p, ox, oy, s=1.0, crooked=0.0, wheel=False, persons=2, label=None, color=GREEN_OS, dim=False):
    """A lost site written in trees: post, table corners, fire ring, tent pad with person trees."""
    op = 0.6 if dim else 1
    p.open("g", opacity=f(op))
    T = lambda x, y, r=8: tree(p, ox + x * s, oy + y * s, r * s * 1.45, color)
    T(-58, -50, 13)                                   # the post
    for x, y in [(-30, 18), (14, 18), (-30, 44), (14, 44)]:
        T(x, y, 7)                                    # table corners
    for i in range(10):                               # fire ring
        a = 2 * math.pi * i / 10
        T(54 + 22 * math.cos(a), -34 + 22 * math.sin(a), 5)
    # tent pad: a square of trees, rotated if crooked
    c, sn = math.cos(crooked), math.sin(crooked)
    pad = []
    for i in range(5):
        for side in range(4):
            t = -26 + 13 * i
            x, y = [(t, -26), (26, t), (-t, 26), (-26, -t)][side]
            pad.append((x, y))
    for x, y in pad:
        T(-10 + x * c - y * sn, -96 + x * sn + y * c, 4.5)
    for k in range(persons):
        T(-10 + (k - (persons - 1) / 2) * 14, -96, 5)
    if wheel:                                         # a wheel-ring of saplings: the bicycle
        for i in range(14):
            a = 2 * math.pi * i / 14
            T(84 + 26 * math.cos(a), 40 + 26 * math.sin(a), 3)
    p.close()
    if label:
        p.text(ox - 74 * s, oy + 82 * s, label, size=f(20 * s), family="sans-serif", fill="#111",
               font_weight="bold", opacity=f(op))


@register(G, "pattern-walk")
def pattern_walk(p: Pic):
    """The pattern walk (2D): on the other side, seen from high above, every tree stands exactly where
    a lost thing stood, so each lost campsite is a glyph of trees: the post, four table corners, a
    ring for the fire, a square tent pad. Tam stands on glyph 18 with three candidate glyphs ahead;
    only one shows the detail Tam wrote for site 17, a wheel of saplings and a crooked pad, and the
    regular rhythm of the trees leads to it. A wrong step whites out and returns Tam to the last true
    glyph."""
    p.rect(0, 0, W, H, fill=PEARL)
    # op-art field: a perfectly regular lattice of tree dots whose size pulses in rings around Tam,
    # so the forest seems to bulge toward the walker
    tx, ty = 600, 610
    d = []
    step = 22
    for j in range(-1, H // step + 2):
        for i in range(-1, W // step + 2):
            x, y = i * step + (step / 2 if j % 2 else 0), j * step
            dist = math.hypot(x - tx, y - ty)
            rr = 2.2 + 3.4 * (0.5 + 0.5 * math.sin(dist / 18))
            # pull the lattice slightly toward Tam (a lens bulge)
            k = 1 - 0.10 * math.exp(-(dist / 380) ** 2)
            x2, y2 = tx + (x - tx) * k, ty + (y - ty) * k
            d.append(f"M{f(x2 - rr)},{f(y2)}a{f(rr)},{f(rr)} 0 1,0 {f(2 * rr)},0a{f(rr)},{f(rr)} 0 1,0 {f(-2 * rr)},0")
    p.path("".join(d), fill="#111", opacity=0.42)
    # clear ground under the glyphs so they read whole
    spots = {"18": (600, 610), "19": (300, 700), "a": (300, 250), "b": (600, 215), "c": (900, 270)}
    for k, (x, y) in spots.items():
        p.circle(x, y, 150, fill=PEARL, opacity=0.95)
        for q in range(3):
            p.circle(x, y, 150 - q * 6, fill="none", stroke="#111", stroke_width=1.2, opacity=0.5)
    # the safe path: the rhythm of exactly spaced stepping trees, black and white alternating
    def stepping(a, b, n, dim=False):
        for i in range(1, n):
            t = i / n
            x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            p.circle(x, y, 9, fill="#111" if i % 2 else PEARL, stroke="#111", stroke_width=2,
                     opacity=0.4 if dim else 1)
    stepping(spots["19"], spots["18"], 9)
    stepping(spots["18"], spots["b"], 12)
    for k in ("a", "c"):
        stepping(spots["18"], spots[k], 12, dim=True)
    # glyphs: where Tam came from, where Tam is, and three candidates ahead
    glyph(p, *spots["19"], s=1.0, persons=3, label="19")
    glyph(p, *spots["18"], s=1.15, persons=2, label="18")
    glyph(p, *spots["a"], s=1.1, persons=4, dim=True)
    glyph(p, *spots["b"], s=1.15, persons=2, crooked=0.32, wheel=True, color="#0f3a33")
    glyph(p, *spots["c"], s=1.1, persons=2, dim=True)
    # Tam: a small dark figure on the glyph, with no shadow (nothing casts one here)
    p.circle(608, 640, 14, fill="#111")
    p.circle(608, 640, 6, fill=PEARL)
    # the Sites page strip, Tam's pencil row for the site being looked for
    p.rect(940, 520, 236, 250, fill="#f7f3e8", stroke="#111", stroke_width=2)
    for k in range(6):
        p.line(952, 572 + k * 32, 1164, 572 + k * 32, stroke="#9bb4ad", stroke_width=1)
    p.text(954, 554, "SITES", size=18, family="monospace", fill="#111", font_weight="bold")
    p.text(954, 600, "17  bike, onions,", size=19, family="serif", fill=GRAPHITE, font_style="italic")
    p.text(954, 630, "tent pitched", size=19, family="serif", fill=GRAPHITE, font_style="italic")
    p.text(954, 660, "crooked", size=19, family="serif", fill=GRAPHITE, font_style="italic")
    p.text(954, 696, "16  ---", size=19, family="serif", fill="#999")
    p.text(954, 730, "15  ---", size=19, family="serif", fill="#999")
    # glyph countdown, pencil strip on the left
    p.rect(24, 24, 70, 300, fill="#f7f3e8", stroke="#111", stroke_width=2)
    for i, n in enumerate(range(19, 11, -1)):
        y = 56 + i * 34
        p.text(38, y, str(n), size=20, family="monospace", fill="#111" if n >= 18 else "#aaa")
        if n >= 18:
            p.line(34, y - 7, 84, y - 7, stroke=GRAPHITE, stroke_width=2)
    p.text(20, 780, "DRIFT 0", size=18, family="monospace", fill="#111")


# ---- 1D: Reconcile -------------------------------------------------------------------------------
@register(G, "reconcile")
def reconcile(p: Pic):
    """Reconcile (1D): a topographic survey sheet of the campground, contour lines round the hill and
    the loop road with its numbered site squares; squares 1 to 6 have already gone from the print.
    Under it, the green-ink legend has a missing row. On the right, Tam's notebook rows set each site
    Here, Gone or Unknown against Ground, Map, Legend and Photos, and a pencil forecast line crosses
    the loop to say where the loss will reach by noon."""
    r = p.rng
    p.paper(CREAM, grain=0.18, fibre=1.1)
    mx, my, mw, mh = 34, 34, 680, 500
    p.rect(mx, my, mw, mh, fill="#f6f0dc", stroke="#3b3426", stroke_width=2.5)
    # terrain: a hill, a saddle, a creek valley
    peaks = [(260, 200, 140, 1.0), (560, 380, 120, 0.7), (520, 120, 90, 0.45), (150, 450, 110, -0.35)]
    def hgt(x, y):
        v = 0
        for px, py, s, a in peaks:
            v += a * math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * s * s))
        return v + 0.06 * math.sin(x / 47) * math.cos(y / 61)
    clipm = p.clip(f'<rect x="{mx}" y="{my}" width="{mw}" height="{mh}"/>')
    p.open("g", clip_path=clipm)
    for i, lev in enumerate([x / 20 for x in range(-6, 20)]):
        dd = contour_segments(hgt, mx, my, mw, mh, 8, lev)
        if dd:
            idx = i % 5 == 0
            p.path(dd, fill="none", stroke="#9b6a3c", stroke_width=2 if idx else 0.9, opacity=0.95 if idx else 0.7,
                   stroke_linecap="round")
    # the creek
    creek = [(mx, 470), (120, 430), (210, 470), (300, 520), (380, 540)]
    p.path(p.smooth_d(creek), fill="none", stroke="#3d7fa6", stroke_width=3)
    p.close()
    # the loop road and its sites (printed black, double line)
    lp = loop_pts(380, 300, 230, 150, 24, wob=0.04, rng=r, start=150)
    road_d = p.smooth_d(lp, closed=True)
    p.path(road_d, fill="none", stroke="#222", stroke_width=9)
    p.path(road_d, fill="none", stroke="#f6f0dc", stroke_width=5)
    p.path(p.smooth_d([(mx, 520), (60, 470), lp[0]]), fill="none", stroke="#222", stroke_width=9)
    p.path(p.smooth_d([(mx, 520), (60, 470), lp[0]]), fill="none", stroke="#f6f0dc", stroke_width=5)
    for i, (x, y) in enumerate(lp):
        n = i + 1
        ox, oy = (x - 380) * 0.16, (y - 300) * 0.16
        sx, sy = x + ox, y + oy
        if n <= 6:
            p.rect(sx - 9, sy - 9, 18, 18, fill="none", stroke="#9a9283", stroke_width=1, stroke_dasharray="2 3")
            continue
        p.rect(sx - 9, sy - 9, 18, 18, fill="#222")
        p.text(sx + (12 if ox >= 0 else -34), sy + 6, str(n), size=14, family="sans-serif", fill="#222")
    # booth at the entrance
    p.rect(44, 506, 24, 18, fill=VAN_RED)
    # forecast: a graphite line dragged across the loop, landing between 12 and 15
    a, b = lp[11], lp[14]
    p.wobble([(380, 300), ((a[0] + b[0]) / 2 + 8, (a[1] + b[1]) / 2 + 12)], amp=1.4, step=10,
             stroke=GRAPHITE, stroke_width=3.5, stroke_linecap="round")
    p.text(400, 290, "by noon?", size=20, family="serif", fill=GRAPHITE, font_style="italic")
    # survey furniture: north arrow, scale bar
    p.poly([(670, 60), (680, 100), (670, 92), (660, 100)], fill="#222")
    p.text(664, 120, "N", size=16, family="serif", fill="#222")
    for k in range(4):
        p.rect(560 + k * 30, 510, 30, 7, fill="#222" if k % 2 == 0 else "#f6f0dc", stroke="#222", stroke_width=1)
    # legend strip in green ink, one row missing
    ly = 556
    p.rect(mx, ly, mw, 210, fill="none", stroke=GREEN_INK, stroke_width=2)
    p.text(mx + 14, ly + 30, "LEGEND", size=18, family="sans-serif", fill=GREEN_INK, font_weight="bold",
           letter_spacing="3")
    rows = [("7", "tent pad"), ("8", "table"), ("9", "fire ring"), (None, None), ("11", "tent pad"),
            ("12", "table"), ("13", "fire ring"), ("14", "tent pad")]
    for i, (n, what) in enumerate(rows):
        col, row = i // 4, i % 4
        x, y = mx + 20 + col * 330, ly + 62 + row * 38
        if n is None:
            p.rect(x - 6, y - 22, 300, 32, fill="none", stroke=GREEN_INK, stroke_width=1.5, stroke_dasharray="5 5")
            p.text(x + 110, y, "?", size=22, family="serif", fill=VAN_RED, font_weight="bold")
            continue
        p.rect(x, y - 15, 16, 16, fill=GREEN_INK)
        p.text(x + 28, y, f"{n}", size=17, family="sans-serif", fill=GREEN_INK, font_weight="bold")
        p.text(x + 62, y, what, size=17, family="sans-serif", fill=GREEN_INK)
        p.line(x + 150, y - 6, x + 280, y - 6, stroke=GREEN_INK, stroke_width=0.8, stroke_dasharray="1 4")
    # right: the notebook's Sites page
    nx = 744
    p.rect(nx, 34, 422, 732, fill="#fbf8ee", stroke="#b9b09a", stroke_width=1.5)
    chips = ["Ground", "Map", "Legend", "Photos"]
    for i, c in enumerate(chips):
        x = nx + 14 + i * 101
        p.rect(x, 50, 92, 34, rx=17, fill="#fff" if i != 2 else "#e6efe2",
               stroke=GREEN_INK, stroke_width=2 if i == 2 else 1.2)
        p.text(x + 12, 73, c, size=16, family="sans-serif", fill=GREEN_INK)
    heads = ["#", "Seen", "Map", "Leg.", "Note"]
    hx = [nx + 14, nx + 56, nx + 118, nx + 176, nx + 236]
    for x, h in zip(hx, heads):
        p.text(x, 120, h, size=15, family="sans-serif", fill=GREEN_INK, font_weight="bold")
    p.line(nx + 46, 100, nx + 46, 750, stroke="#d58a7a", stroke_width=1.2)
    notes = ["kettle", "", "", "heron sign", "", "", "creek, wet", "photo: clear", "", "", "", "", "", "", "", "", ""]
    status = ["G", "G", "G", "G", "G", "G", "?", "H", "H", "H", "H", "?", "H", "H", "H", "H", "H"]
    for i in range(17):
        y = 152 + i * 35
        p.line(nx + 10, y + 9, nx + 410, y + 9, stroke="#a9c3cf", stroke_width=1)
        n = i + 1
        p.text(hx[0], y, str(n), size=15, family="monospace", fill=GRAPHITE)
        st = status[i]
        mark = {"G": "Gone", "H": "Here", "?": "?"}[st]
        p.text(hx[1], y, mark, size=16, family="serif", fill=GRAPHITE, font_style="italic")
        mp = "-" if n <= 6 else "#"
        lg = "-" if n <= 6 or n == 10 else "#"
        p.text(hx[2] + 10, y, mp, size=16, family="monospace", fill="#222")
        p.text(hx[3] + 10, y, lg, size=16, family="monospace", fill=GREEN_INK)
        if notes[i]:
            p.text(hx[4], y, notes[i], size=16, family="serif", fill=GRAPHITE, font_style="italic")
    # the row being set now
    p.rect(nx + 8, 152 + 9 * 35 - 24, 406, 32, fill="none", stroke=VAN_RED, stroke_width=2.5)
    p.text(hx[4], 152 + 9 * 35, "...", size=18, family="serif", fill=VAN_RED)


# ---- 1D: Pack List -------------------------------------------------------------------------------
@register(G, "pack-list")
def pack_list(p: Pic):
    """Pack List (1D): in wax crayon on brown kraft paper, the friends sit round the fire as cards,
    with one empty seat nobody filled. The chain of packed items runs in a band above; one of them,
    a blue enamel kettle, was never added by anyone and is circled. Below, Tam's tray of item tiles
    holds the same kettle, and the button to say nobody said that."""
    r = p.rng
    p.paper("#b98b5a", grain=0.45, fibre=0.7)
    fx = p.roughen(5, 0.09)
    # kraft fibres
    d = []
    for _ in range(260):
        x, y = r.uniform(0, W), r.uniform(0, H); a = r.uniform(-0.3, 0.3); L = r.uniform(10, 40)
        d.append(f"M{f(x)},{f(y)}l{f(L * math.cos(a))},{f(L * math.sin(a))}")
    p.path("".join(d), stroke="#8f6538", stroke_width=1, opacity=0.5)
    # the fire
    cx, cy = 430, 450
    stones = loop_pts(cx, cy, 92, 80, 11)
    for x, y in stones:
        crayon_fill(p, Pic.ngon(x, y, 20, 6, r.uniform(0, 60)), "#6e6b66", width=6, filt=fx, opacity=0.9)
        crayon(p, Pic.ngon(x, y, 20, 6), "#3b3734", width=6, passes=2, closed=True, filt=fx)
    crayon_fill(p, Pic.ngon(cx, cy, 70, 12), "#2b1d14", width=8, filt=fx, opacity=0.8)
    for color, scale in [("#d8401f", 1.0), ("#f08a24", 0.72), ("#ffd23f", 0.42)]:
        pts = []
        for i in range(14):
            a = 2 * math.pi * i / 14
            rr = (62 if i % 2 == 0 else 30) * scale * r.uniform(0.8, 1.2)
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
        crayon_fill(p, pts, color, width=7, spacing=6, angle=r.uniform(0, 180), filt=fx, opacity=0.9)
        crayon(p, pts, color, width=7, passes=2, closed=True, filt=fx)
    # seats as cards round the ring: five friends and one empty
    names = ["Tam", "June", "Dell", "Rafe", "Ines", ""]
    colors = ["#2b5d8a", "#3f7d3a", "#9c3b30", "#6b3f8a", "#c48a1a", None]
    for i, (nm, col) in enumerate(zip(names, colors)):
        a = math.radians(90 + 60 * i)
        x, y = cx + 235 * math.cos(a), cy + 205 * math.sin(a)
        card = [(x - 58, y - 40), (x + 58, y - 40), (x + 58, y + 40), (x - 58, y + 40)]
        if col is None:
            crayon(p, card, "#f4ead2", width=5, passes=2, closed=True, filt=fx, opacity=0.9)
            p.text(x - 10, y + 12, "?", size=34, family="serif", fill="#f4ead2")
            continue
        crayon_fill(p, card, "#f4ead2", width=9, spacing=6, filt=fx, opacity=0.85)
        crayon(p, card, col, width=7, passes=3, closed=True, filt=fx)
        crayon(p, [(x - 16, y - 2), (x, y - 22), (x + 16, y - 2)], col, width=6, passes=2, filt=fx)
        p.text(x - 30, y + 26, nm, size=22, family="sans-serif", fill=col, font_weight="bold")
    # the spoken chain in a band above
    crayon_fill(p, [(30, 26), (1170, 26), (1170, 140), (30, 140)], "#e9dcbd", width=10, spacing=8,
                angle=2, filt=fx, opacity=0.7)
    p.text(50, 66, "I packed my bag, and in it I put", size=22, family="serif", fill="#3b2a1a",
           font_style="italic")
    chain = ["a tarp", "the torch", "marshmallows", "a blue enamel kettle", "rope"]
    x = 50
    for i, w_ in enumerate(chain):
        op = 1 - 0.13 * (len(chain) - 1 - i)
        p.text(x, 118, w_, size=26, family="sans-serif", fill="#2b1d14", opacity=f(max(op, 0.4)),
               font_weight="bold")
        L = len(w_) * 14.5
        if w_.startswith("a blue"):
            crayon(p, [(x - 14 + (L + 28) / 2 + (L / 2 + 20) * math.cos(t), 110 + 30 * math.sin(t))
                       for t in [k * math.pi / 9 for k in range(19)]], "#c22a1e", width=8, passes=3, filt=fx)
        x += L + 34
    # Tam's tray: 4 x 4 item tiles drawn in pencil and crayon
    tx0, ty0, ts = 790, 250, 92
    crayon_fill(p, [(tx0 - 18, ty0 - 18), (tx0 + 4 * ts + 8, ty0 - 18), (tx0 + 4 * ts + 8, ty0 + 4 * ts + 8),
                    (tx0 - 18, ty0 + 4 * ts + 8)], "#5a3b20", width=10, spacing=8, filt=fx, opacity=0.5)
    icons = ["tarp", "torch", "mallow", "kettle", "rope", "boot", "map", "tent",
             "cup", "sock", "pan", "hat", "book", "rope2", "pole", "bag"]
    for k, ic in enumerate(icons):
        i, j = k % 4, k // 4
        x, y = tx0 + i * ts, ty0 + j * ts
        sq = [(x + 4, y + 4), (x + ts - 6, y + 4), (x + ts - 6, y + ts - 6), (x + 4, y + ts - 6)]
        crayon_fill(p, sq, "#f4ead2", width=10, spacing=6, filt=fx, opacity=0.9)
        cx2, cy2 = x + ts / 2 - 1, y + ts / 2 - 1
        ink = "#3a3a3a"
        if ic == "kettle":
            crayon_fill(p, Pic.ngon(cx2, cy2 + 6, 24, 10), "#2f6fb5", width=6, spacing=5, filt=fx, opacity=0.95)
            crayon(p, [(cx2 + 22, cy2), (cx2 + 34, cy2 - 10)], "#2f6fb5", width=6, passes=2, filt=fx)
            crayon(p, [(cx2 - 14, cy2 - 14), (cx2, cy2 - 30), (cx2 + 14, cy2 - 14)], "#1d3d66", width=5, passes=2, filt=fx)
            crayon(p, sq, "#c22a1e", width=8, passes=3, closed=True, filt=fx)
        elif k % 4 == 0:
            crayon(p, [(cx2 - 22, cy2 + 16), (cx2, cy2 - 20), (cx2 + 22, cy2 + 16)], ink, width=5, passes=2,
                   closed=True, filt=fx)
        elif k % 4 == 1:
            crayon(p, [(cx2 - 24, cy2), (cx2 + 18, cy2)], ink, width=12, passes=3, filt=fx)
            crayon(p, Pic.ngon(cx2 + 22, cy2, 8, 6), "#e2b13c", width=6, passes=2, closed=True, filt=fx)
        elif k % 4 == 2:
            crayon(p, Pic.ngon(cx2, cy2, 20, 8), ink, width=5, passes=2, closed=True, filt=fx)
        else:
            crayon(p, [(cx2 - 22, cy2 - 18), (cx2 + 22, cy2 + 18)], ink, width=5, passes=2, filt=fx)
            crayon(p, [(cx2 - 22, cy2 + 18), (cx2 + 22, cy2 - 18)], ink, width=5, passes=2, filt=fx)
    # the button
    btn = [(790, 660), (1150, 660), (1150, 740), (790, 740)]
    crayon_fill(p, btn, "#c22a1e", width=10, spacing=6, filt=fx, opacity=0.9)
    crayon(p, btn, "#5c140e", width=6, passes=3, closed=True, filt=fx)
    p.text(818, 712, "Nobody said that.", size=30, family="sans-serif", fill="#fff4dc", font_weight="bold")


# ---- 1D: Foil Supper -----------------------------------------------------------------------------
PINK = "#ff4f9a"
TEAL = "#0aa0a6"


def riso(p, draw, dx=5, dy=-4):
    """Draw a figure in teal, then again in pink knocked out of register, multiplied."""
    p.open("g", style="mix-blend-mode:multiply")
    draw(TEAL, 0, 0)
    p.close()
    p.open("g", style="mix-blend-mode:multiply", transform=f"translate({dx} {dy})")
    draw(PINK, 0, 0)
    p.close()


@register(G, "foil-supper")
def foil_supper(p: Pic):
    """Foil Supper (1D): a two-colour risograph recipe card of the camp table from above. On the left
    the cooler shelf of ingredient tiles with their counts; in the middle foil packets, each with four
    spaces for Base, Body, Fat and Flavour, one of them still empty while an olive-oil tile is dragged
    in with its pencil score. On the right the recipe card with its heading gone blank, and along the
    bottom the coal bar burning down."""
    r = p.rng
    p.paper("#f6efe3", grain=0.22, fibre=1.2)
    # coarse riso speckle
    p.stipple(0, 0, W, H, n=900, r=(0.6, 1.4), fill=TEAL, opacity=0.25)
    p.stipple(0, 0, W, H, n=900, r=(0.6, 1.4), fill=PINK, opacity=0.25)
    # title band
    def band(c, ox, oy):
        p.rect(30 + ox, 26 + oy, 1140, 66, fill=c, opacity=0.85)
    riso(p, band)
    p.text(52, 74, "FOIL SUPPER  /  DAY 2", size=36, family="sans-serif", fill="#f6efe3", font_weight="bold",
           letter_spacing="4")
    # cooler shelf: ingredient tiles with halftone fills
    items = [("POTATO", 6, "pink"), ("SAUSAGE", 4, "teal"), ("LENTIL", 3, "teal"), ("OLIVE OIL", 2, "pink"),
             ("SALT", 9, "teal"), ("CORN", 0, "pink"), ("BUTTER", 0, "teal"), ("ONION", 0, "pink")]
    p.rect(30, 116, 260, 590, fill="none", stroke=TEAL, stroke_width=3)
    p.text(46, 146, "COOLER", size=20, family="sans-serif", fill=TEAL, font_weight="bold", letter_spacing="3")
    for i, (nm, n, c) in enumerate(items):
        y = 162 + i * 66
        col = PINK if c == "pink" else TEAL
        gone = n == 0
        p.halftone(46, y, 64, 54, lambda x, yy, g=gone: 0.25 if g else 0.9 - (x - 46) / 120, cell=8, angle=r.choice([15, 45, 75]),
                   fill=col, opacity=0.9)
        p.rect(46, y, 64, 54, fill="none", stroke=col, stroke_width=2)
        p.text(122, y + 26, nm, size=17, family="sans-serif", fill="#2a2a2a" if not gone else "#9a9a9a",
               font_weight="bold")
        p.text(122, y + 48, f"x{n}", size=17, family="monospace", fill=col)
        if gone:
            p.line(118, y + 20, 270, y + 20, stroke=PINK, stroke_width=3)
    # foil packets: 2 x 2 sheets with four role spaces each
    roles = ["BASE", "BODY", "FAT", "FLAVOUR"]
    fills = [["POTATO", "SAUSAGE", "OIL", "SALT"], ["POTATO", "LENTIL", "OIL", "SALT"],
             ["POTATO", "SAUSAGE", "", "SALT"], ["SALT", "LENTIL", "OIL", "SALT"]]
    scores = ["3", "3", "", "1"]
    for k in range(4):
        i, j = k % 2, k // 2
        x, y = 320 + i * 262, 116 + j * 300
        def sheet(c, ox, oy, x=x, y=y):
            pts = [(x + ox, y + oy), (x + 240 + ox, y + 8 + oy), (x + 236 + ox, y + 270 + oy), (x + 4 + ox, y + 262 + oy)]
            p.poly(pts, fill="none", stroke=c, stroke_width=3)
        riso(p, sheet)
        # crinkled foil: halftone gradient inside
        p.halftone(x + 6, y + 10, 228, 250, lambda xx, yy, x=x, y=y: 0.15 + 0.35 * abs(math.sin((xx - x) / 23 + (yy - y) / 31)),
                   cell=10, angle=45, fill=TEAL, opacity=0.55)
        for q, role in enumerate(roles):
            bx, by = x + 14 + (q % 2) * 112, y + 22 + (q // 2) * 116
            empty = fills[k][q] == ""
            p.rect(bx, by, 100, 100, fill="#f6efe3" if empty else PINK, opacity=1 if empty else 0.78,
                   stroke=PINK if empty else "none", stroke_width=3, stroke_dasharray="8 6" if empty else None)
            p.text(bx + 8, by + 22, role, size=13, family="sans-serif", fill=TEAL if empty else "#f6efe3",
                   font_weight="bold", letter_spacing="2")
            if not empty:
                p.text(bx + 8, by + 64, fills[k][q], size=16, family="sans-serif", fill="#3a0f24", font_weight="bold")
        if scores[k]:
            p.circle(x + 222, y + 18, 22, fill=TEAL)
            p.text(x + 214, y + 27, scores[k], size=24, family="sans-serif", fill="#f6efe3", font_weight="bold")
    # the dragged tile over the empty FAT space, with its pencil score
    tx, ty = 320 + 14 + 0 + 30, 116 + 300 + 22 + 116 - 30
    def drag(c, ox, oy):
        p.rect(tx + ox, ty + oy, 100, 100, fill=c, opacity=0.85, transform=f"rotate(-8 {tx + 50} {ty + 50})")
    riso(p, drag, dx=7, dy=-5)
    p.text(tx + 10, ty + 60, "OLIVE OIL", size=15, family="sans-serif", fill="#f6efe3", font_weight="bold",
           transform=f"rotate(-8 {tx + 50} {ty + 50})")
    p.text(tx + 106, ty + 10, "= 3", size=28, family="serif", fill=GRAPHITE, font_style="italic")
    # hand cursor
    p.poly([(tx + 70, ty + 80), (tx + 92, ty + 128), (tx + 98, ty + 108), (tx + 118, ty + 120)], fill="#222")
    # recipe card, heading blank
    cx0 = 862
    def card(c, ox, oy):
        p.rect(cx0 + ox, 116 + oy, 308, 470, fill="none", stroke=c, stroke_width=3)
    riso(p, card)
    p.rect(cx0 + 20, 136, 268, 40, fill="none", stroke=PINK, stroke_width=2, stroke_dasharray="4 6")
    lines = ["2 potatoes, or any root", "1 sausage each", "a pat of butter", "", "salt & pepper",
             "fold tight, 3 folds", "coals 25 min"]
    for i, ln in enumerate(lines):
        y = 222 + i * 46
        p.line(cx0 + 20, y + 10, cx0 + 288, y + 10, stroke=TEAL, stroke_width=1.2, opacity=0.7)
        if ln:
            p.text(cx0 + 24, y, ln, size=19, family="serif", fill="#3a0f24", font_style="italic")
    p.text(cx0 + 20, 560, "card: Bea", size=15, family="monospace", fill=TEAL)
    # notebook margin
    p.rect(cx0, 604, 308, 102, fill=TEAL, opacity=0.18)
    p.text(cx0 + 14, 640, "copied: no", size=18, family="monospace", fill=TEAL)
    p.text(cx0 + 14, 676, "diners 5 + 1", size=18, family="monospace", fill=PINK)
    # coal bar
    p.rect(30, 724, 1140, 52, fill="none", stroke=TEAL, stroke_width=3)
    p.halftone(32, 726, 1136, 48, lambda x, y: max(0.0, 1 - (x - 32) / 760), cell=9, angle=30, fill=PINK)
    p.halftone(32, 726, 1136, 48, lambda x, y: max(0.0, 0.8 - (x - 32) / 900), cell=9, angle=75, fill=TEAL, opacity=0.8)
    p.text(1040, 760, "COALS 1:12", size=18, family="monospace", fill=TEAL, font_weight="bold")


# ---- 1D: The Ranger's Book -----------------------------------------------------------------------
@register(G, "rangers-book")
def rangers_book(p: Pic):
    """The Ranger's Book (1D): the ranger's logbook open across the page, ruled in columns and worked
    in graphite. The check-in rows have closed up where lost sites were, and the permit numbers skip.
    On the right, the day's totals say 12 sites and 35 persons while Tam's pencil sums reach 9 and 26;
    a dashed ghost row is being dragged into the gap after site 1, filled from the shortfall."""
    r = p.rng
    p.rect(0, 0, W, H, fill="#3a3530")
    p.stipple(0, 0, W, H, n=500, r=(0.8, 2), fill="#2a2622")
    # the open book
    for side in (0, 1):
        x = 40 + side * 566
        p.rect(x, 40, 554, 720, fill="#efe8d4")
    sh = p.gradient([(0, "#efe8d4"), (0.85, "#d9d0b8"), (1, "#a59a80")], 0, 0, 1, 0)
    p.rect(500, 40, 94, 720, fill=sh)
    sh2 = p.gradient([(0, "#a59a80"), (0.15, "#d9d0b8"), (1, "#efe8d4")], 0, 0, 1, 0)
    p.rect(606, 40, 90, 720, fill=sh2)
    gid = p.uid("lgrain")
    p.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="0.85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  '
           f'0 0 0 0 0.2  0 0 0 0.12 0"/></filter>')
    p.rect(40, 40, 1120, 720, filter=f"url(#{gid})")
    # left page: ruled columns
    cols = [("SITE", 60), ("PARTY", 120), ("PERS.", 270), ("NTS", 340), ("FEE", 396), ("PERMIT", 466)]
    for nm, x in cols:
        p.text(x, 92, nm, size=15, family="sans-serif", fill=GREEN_INK, font_weight="bold", letter_spacing="1")
    for nm, x in cols[1:]:
        p.line(x - 10, 70, x - 10, 740, stroke="#c58f86", stroke_width=1)
    for k in range(18):
        y = 110 + k * 35
        p.line(54, y, 590, y, stroke="#9fb9c4", stroke_width=1)
    rows = [(1, "Okafor", 2, 401), (3, "Lund", 4, 403), (4, "Diaz", 3, 404), (6, "Moss", 2, 406),
            (7, "Pryce", 5, 407), (8, "Hale", 1, 408), (10, "Kerr", 2, 410), (11, "Abe", 4, 411),
            (12, "Wren", 3, 412)]
    for i, (s, party, pers, permit) in enumerate(rows):
        y = 136 + i * 35 + (35 if i >= 1 else 0)
        p.text(66, y, str(s), size=19, family="serif", fill="#33302c")
        p.text(120, y, party, size=19, family="serif", fill="#33302c", font_style="italic")
        tally(p, 270, y - 18, pers, h=20, gap=7, stroke_width=1.6)
        p.text(346, y, "1", size=19, family="serif", fill="#33302c")
        p.text(396, y, "$18", size=19, family="serif", fill="#33302c")
        skip = i > 0 and permit - rows[i - 1][3] > 1
        p.text(466, y, f"0{permit}", size=19, family="monospace",
               fill=VAN_RED if skip else "#33302c")
        if skip:
            p.wobble([(462, y + 6), (540, y + 6)], amp=1, step=12, stroke=GRAPHITE, stroke_width=1.6)
    # the ghost row, dashed, being dragged in after site 1
    gy = 136 + 35
    p.rect(54, gy - 26, 536, 34, fill="#f7f2e2", stroke=GRAPHITE, stroke_width=2, stroke_dasharray="7 5",
           transform="rotate(-1.2 320 160)")
    p.text(66, gy - 2, "2", size=21, family="serif", fill=GRAPHITE, font_style="italic", font_weight="bold")
    p.text(120, gy - 2, "?", size=21, family="serif", fill=GRAPHITE, font_style="italic")
    tally(p, 270, gy - 20, 3, h=20, gap=7, stroke="#7a7a7c", stroke_width=1.6)
    p.text(346, gy - 2, "1", size=21, family="serif", fill=GRAPHITE, font_style="italic")
    p.text(396, gy - 2, "$18", size=21, family="serif", fill=GRAPHITE, font_style="italic")
    p.text(466, gy - 2, "0402", size=19, family="monospace", fill=GRAPHITE)
    # pencil column sums along the foot
    fy = 136 + 10 * 35 + 30
    p.wobble([(260, fy - 22), (590, fy - 22)], amp=1, step=14, stroke=GRAPHITE, stroke_width=2)
    p.text(270, fy + 6, "26", size=26, family="serif", fill=GRAPHITE, font_style="italic")
    p.text(380, fy + 6, "$162", size=24, family="serif", fill=GRAPHITE, font_style="italic")
    p.text(120, fy + 6, "9 rows", size=22, family="serif", fill=GRAPHITE, font_style="italic")
    # pencil shading scribble in the margin (graphite rubbed)
    p.hatch(56, fy + 40, 520, 140, angle=62, spacing=5, jitter=1.4, stroke=GRAPHITE, stroke_width=0.8,
            opacity=0.35, clip=p.clip(f'<rect x="56" y="{fy + 40}" width="520" height="140" rx="40"/>'))
    p.text(80, fy + 110, "permits skip: 402  405  409", size=21, family="serif", fill="#2b2b2d",
           font_style="italic")
    # right page: the day's totals, and Tam's working beside each
    p.text(640, 92, "DAY TOTALS", size=17, family="sans-serif", fill=GREEN_INK, font_weight="bold", letter_spacing="2")
    p.text(900, 92, "TAM'S SUM", size=17, family="sans-serif", fill=GREEN_INK, font_weight="bold", letter_spacing="2")
    for k in range(18):
        y = 110 + k * 35
        p.line(630, y, 1150, y, stroke="#9fb9c4", stroke_width=1)
    p.line(880, 70, 880, 740, stroke="#c58f86", stroke_width=1)
    totals = [("Occupied sites", "12", "9"), ("Persons", "35", "26"), ("Fees", "$216", "$162"),
              ("Envelopes", "12", "9")]
    for i, (nm, tot, mine) in enumerate(totals):
        y = 176 + i * 105
        p.text(640, y, nm, size=22, family="serif", fill="#1f2a44")
        p.text(780, y + 34, tot, size=34, family="serif", fill="#1f2a44", font_weight="bold")
        p.text(910, y + 34, mine, size=32, family="serif", fill=GRAPHITE, font_style="italic")
        p.text(1010, y + 34, "≠", size=34, family="serif", fill=VAN_RED)
        diff = {"12": "3", "35": "9", "$216": "$54"}.get(tot, "3")
        p.text(1060, y + 34, diff, size=30, family="serif", fill=GRAPHITE, font_style="italic")
        p.ellipse(1080 if len(diff) > 1 else 1070, y + 24, 38, 26, fill="none", stroke=GRAPHITE, stroke_width=1.6)
    # ghost-row tray: blank rows waiting
    p.text(640, 610, "GHOST ROWS", size=16, family="sans-serif", fill=GREEN_INK, font_weight="bold", letter_spacing="2")
    for k in range(2):
        y = 630 + k * 46
        p.rect(640 + k * 14, y, 470, 34, fill="#f7f2e2", stroke=GRAPHITE, stroke_width=1.6, stroke_dasharray="7 5")
        p.text(660 + k * 14, y + 24, "5?   ?   _   1   $18   04__" if k == 0 else "9?   ?   _   1   $18   04__",
               size=18, family="monospace", fill="#777")
    # a pencil lying across the page
    p.open("g", transform="rotate(-28 980 520)")
    p.rect(820, 512, 300, 18, fill=DUST)
    p.rect(820, 512, 300, 6, fill="#e2c46a")
    p.poly([(1120, 512), (1150, 521), (1120, 530)], fill="#e6c9a0")
    p.poly([(1140, 518), (1150, 521), (1140, 524)], fill="#333")
    p.rect(800, 512, 22, 18, fill="#c0c0c0")
    p.rect(786, 512, 16, 18, fill="#d27a7a")
    p.close()

"""Missing Campsites: palette, shared helpers, the three media pens and the icon library.

Style bible (DEEP_DIVE.md section 4): one pencil weight for a camper's hand, a green printed hairline
for anything official, paper tooth on every flat surface, each mode in its own medium.
"""
import math
import random

from artkit import f

G = "missing-campsites"

CEDAR = "#7A4A2E"
GREEN = "#6F8A5B"
GOLD = "#C9A862"
RED = "#8E3B32"
AMBER = "#F2A541"
NIGHT = "#0E1622"
PEARL = "#DAD9D2"
PAPER = "#F1E9D6"
GRAPHITE = "#4A4A48"
INK = "#2F6B3A"          # printed forest-green ink
OS_GREEN = "#2E6A5C"     # other-side green, no yellow in it
KRAFT = "#B98B5A"
PINK = "#FF4F9A"
TEAL = "#0AA0A6"
RULE = "#A9C3CF"
MARGIN = "#D58A7A"
ERASED = "#F8F4E8"

# wax crayon colours
C_BLUE, C_RED, C_YEL, C_GRN, C_BRN = "#2f6fb5", "#c22a1e", "#e2b13c", "#3f7d3a", "#6b4226"
C_GRY, C_BLK, C_WHT, C_ORG, C_PUR = "#77736c", "#33302c", "#f4ead2", "#e07b2a", "#6b3f8a"


# ---- surfaces ------------------------------------------------------------------------------------
def tooth(a, strength=0.14, white=False, freq=1.2):
    """Paper tooth over everything drawn so far."""
    gid = a.uid("tooth")
    v = "1" if white else "0"
    a.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="{freq}" numOctaves="2" seed="{a.seed % 89 + 1}"/><feColorMatrix values="0 0 0 0 {v}  '
           f'0 0 0 0 {v}  0 0 0 0 {v}  0 0 0 {f(strength)} 0"/></filter>')
    a.rect(0, 0, a.w, a.h, filter=f"url(#{gid})")


def notebook(a, x=0, y=0, w=None, h=None, step=34, top=60, margin=None, color="#F6F1E2"):
    """Tam's notebook paper: ruled blue lines and a red margin."""
    w = a.w if w is None else w
    h = a.h if h is None else h
    a.rect(x, y, w, h, fill=color)
    d = []
    yy = y + top
    while yy < y + h - 6:
        d.append(f"M{f(x)},{f(yy)}h{f(w)}")
        yy += step
    a.path("".join(d), stroke=RULE, stroke_width=1, fill="none")
    if margin:
        a.line(x + margin, y, x + margin, y + h, stroke=MARGIN, stroke_width=1.2)


def pfilter(a):
    """One pencil-grain filter per asset."""
    if not hasattr(a, "_pf"):
        a._pf = a.roughen(1.6, 0.55)
    return a._pf


def wax(a):
    if not hasattr(a, "_wax"):
        a._wax = a.roughen(4, 0.11)
    return a._wax


def pencil(a, pts, w=2.2, amp=1.1, closed=False, color=GRAPHITE, op=0.9, step=12, smooth=False, fill="none"):
    d = a.smooth_d(pts, closed) if smooth else a.wobble_d(pts, amp, step, closed)
    a.path(d, fill=fill, stroke=color, stroke_width=w, stroke_linecap="round", stroke_linejoin="round",
           opacity=op, filter=pfilter(a))


def hand(a, x, y, s, size=24, color=GRAPHITE, rot=None, **kw):
    """A camper's handwriting (pencil)."""
    if rot is None:
        rot = a.rng.uniform(-1.2, 1.2)
    kw.setdefault("font_style", "italic")
    a.text(x, y, s, size=size, family="serif", fill=color, transform=f"rotate({f(rot)} {f(x)} {f(y)})", **kw)


def printed(a, x, y, s, size=16, color=INK, **kw):
    kw.setdefault("font_weight", "bold")
    kw.setdefault("letter_spacing", "2")
    a.text(x, y, s, size=size, family="sans-serif", fill=color, **kw)


def groove(a, x, y, s, size=24, family="serif", **kw):
    """A lost line: only the pressure of the pen is left in the paper."""
    kw.setdefault("font_style", "italic")
    a.text(x + 0.8, y + 0.9, s, size=size, family=family, fill="#fffdf4", opacity=0.75, **kw)
    a.text(x, y, s, size=size, family=family, fill="#b9ad90", opacity=0.42, **kw)


def tally(a, x, y, n, h=34, gap=11, **kw):
    kw.setdefault("stroke", GRAPHITE)
    kw.setdefault("stroke_width", 2.2)
    kw.setdefault("stroke_linecap", "round")
    cx = x
    for g in range(0, n, 5):
        k = min(5, n - g)
        for i in range(min(k, 4)):
            a.wobble([(cx + i * gap, y), (cx + i * gap + a.rng.uniform(-2, 2), y + h)], amp=0.9, step=10, **kw)
        if k == 5:
            a.wobble([(cx - 6, y + h * 0.8), (cx + 3 * gap + 6, y + h * 0.2)], amp=0.9, step=10, **kw)
        cx += 4 * gap + 18


def loop_pts(cx, cy, rx, ry, n, wob=0.0, rng=None, start=-90):
    out = []
    for i in range(n):
        t = math.radians(start + 360 * i / n)
        k = 1 + (rng.uniform(-wob, wob) if rng and wob else 0)
        out.append((cx + rx * k * math.cos(t), cy + ry * k * math.sin(t)))
    return out


# ---- wax crayon ----------------------------------------------------------------------------------
def crayon(a, pts, color, width=10, passes=3, closed=False, opacity=0.85):
    for _ in range(passes):
        r = a.rng
        dash = f"{f(r.uniform(14, 40))} {f(r.uniform(1.5, 5))} {f(r.uniform(6, 22))} {f(r.uniform(1, 4))}"
        ox, oy = r.uniform(-width * .3, width * .3), r.uniform(-width * .3, width * .3)
        q = [(x + ox, y + oy) for x, y in pts]
        a.path(a.wobble_d(q, amp=width * 0.16, step=14, closed=closed), fill="none", stroke=color,
               stroke_width=f(width * r.uniform(0.4, 0.62)), stroke_linecap="round", stroke_linejoin="round",
               stroke_dasharray=dash, opacity=f(opacity * r.uniform(0.7, 1)))


def crayon_fill(a, pts, color, width=7, angle=35, spacing=6, opacity=0.8):
    xs = [x for x, _ in pts]; ys = [y for _, y in pts]
    clip = a.clip('<polygon points="' + " ".join(f"{f(x)},{f(y)}" for x, y in pts) + '"/>')
    x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
    t = math.radians(angle); ca, sa = math.cos(t), math.sin(t)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    R = math.hypot(x1 - x0, y1 - y0) / 2 + 8
    d, k, flip = [], -R, False
    while k <= R:
        px, py = cx - sa * k, cy + ca * k
        p1, p2 = (px - ca * R, py - sa * R), (px + ca * R, py + sa * R)
        if flip:
            p1, p2 = p2, p1
        d.append(a.wobble_d([p1, p2], amp=1.4, step=26)[1:])
        flip = not flip
        k += spacing * a.rng.uniform(0.75, 1.25)
    a.open("g", clip_path=clip)
    a.path("M" + " L".join(d), fill="none", stroke=color, stroke_width=width, stroke_linecap="round",
           stroke_linejoin="round", opacity=f(opacity),
           stroke_dasharray=f"{f(a.rng.uniform(30, 60))} 3 {f(a.rng.uniform(10, 30))} 2")
    a.close()


# ---- contours (topographic survey print) ---------------------------------------------------------
def contours(field, x0, y0, w, h, step, level):
    """Marching squares, chained into polylines: compact path data for one iso-level."""
    nx, ny = int(w / step), int(h / step)
    v = [[field(x0 + i * step, y0 + j * step) for i in range(nx + 1)] for j in range(ny + 1)]
    segs = {}

    def edge_pt(key):
        i, j, hz = key
        if hz:
            a_, b_ = v[j][i], v[j][i + 1]
            t = (level - a_) / (b_ - a_) if b_ != a_ else .5
            return x0 + (i + t) * step, y0 + j * step
        a_, b_ = v[j][i], v[j + 1][i]
        t = (level - a_) / (b_ - a_) if b_ != a_ else .5
        return x0 + i * step, y0 + (j + t) * step

    def link(k1, k2):
        segs.setdefault(k1, []).append(k2)
        segs.setdefault(k2, []).append(k1)

    for j in range(ny):
        for i in range(nx):
            c = [v[j][i] >= level, v[j][i + 1] >= level, v[j + 1][i + 1] >= level, v[j + 1][i] >= level]
            keys = [(i, j, 1), (i + 1, j, 0), (i, j + 1, 1), (i, j, 0)]
            cross = [keys[e] for e in range(4) if c[e] != c[(e + 1) % 4]]
            if len(cross) == 2:
                link(cross[0], cross[1])
            elif len(cross) == 4:
                link(cross[0], cross[1]); link(cross[2], cross[3])
    out, seen = [], set()
    starts = [k for k, n in segs.items() if len(n) == 1] + list(segs)
    for s in starts:
        if s in seen:
            continue
        chain, cur, prev = [s], s, None
        seen.add(s)
        while True:
            nxt = [n for n in segs[cur] if n != prev and n not in seen]
            if not nxt:
                closed = len(segs[cur]) == 2 and chain[0] in segs[cur] and len(chain) > 2
                break
            prev, cur = cur, nxt[0]
            seen.add(cur)
            chain.append(cur)
        pts = [edge_pt(k) for k in chain]
        out.append("M" + " ".join(f"{x:.0f},{y:.0f}" for x, y in pts) + ("Z" if closed else ""))
    return "".join(out)


# ---- op-art trees --------------------------------------------------------------------------------
def tree(a, x, y, r=9, color=OS_GREEN, rings=3, ground=PEARL):
    for k in range(rings, 0, -1):
        a.circle(x, y, r * k / rings, fill=color if (rings - k) % 2 == 0 else ground)


# ---- shapes in unit coordinates ------------------------------------------------------------------
def C(cx, cy, r, n=14):
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def E(cx, cy, rx, ry, rot=0, n=14):
    t = math.radians(rot); ca, sa = math.cos(t), math.sin(t)
    out = []
    for i in range(n):
        x, y = rx * math.cos(2 * math.pi * i / n), ry * math.sin(2 * math.pi * i / n)
        out.append((cx + x * ca - y * sa, cy + x * sa + y * ca))
    return out


def R(cx, cy, w, h, rot=0):
    t = math.radians(rot); ca, sa = math.cos(t), math.sin(t)
    return [(cx + x * ca - y * sa, cy + x * sa + y * ca)
            for x, y in [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]]


def A(cx, cy, r, a0, a1, n=8, ry=None):
    ry = r if ry is None else ry
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def _lum(c):
    c = c.lstrip("#")
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    return 0.3 * r + 0.59 * g + 0.11 * b, r, g, b


# ---- pens: the same icon in three media ----------------------------------------------------------
class Pen:
    def __init__(self, a, cx, cy, s):
        self.a, self.cx, self.cy, self.s = a, cx, cy, s

    def P(self, pts):
        return [(self.cx + x * self.s, self.cy + y * self.s) for x, y in pts]

    def dots(self, pts, color=C_WHT, r=0.04):
        for x, y in pts:
            self.fill(C(x, y, r, 6), color)


class CrayonPen(Pen):
    """Wax crayon on kraft paper."""
    def fill(self, pts, color):
        crayon_fill(self.a, self.P(pts), color, width=max(4, self.s * 0.1), spacing=max(3.5, self.s * 0.075),
                    angle=self.a.rng.uniform(20, 70), opacity=0.9)

    def line(self, pts, color=C_BLK, w=1.0, closed=False):
        crayon(self.a, self.P(pts), color, width=max(3, self.s * 0.085 * w), passes=2, closed=closed)


class PencilPen(Pen):
    """Graphite on notebook paper: one pencil weight, hatching for tone."""
    def fill(self, pts, color):
        a, q = self.a, self.P(pts)
        lum = _lum(color)[0]
        a.poly(q, fill=ERASED, opacity=0.9)
        if lum < 215:
            xs = [x for x, _ in q]; ys = [y for _, y in q]
            clip = a.clip('<polygon points="' + " ".join(f"{f(x)},{f(y)}" for x, y in q) + '"/>')
            sp = 3.2 if lum < 80 else 4.6 if lum < 130 else 6.5
            a.hatch(min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys), angle=a.rng.uniform(50, 68), spacing=sp,
                    clip=clip, jitter=0.9, stroke=GRAPHITE, stroke_width=1.1, opacity=0.75)
            if lum < 80:
                a.hatch(min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys), angle=-35, spacing=5,
                        clip=clip, jitter=0.9, stroke=GRAPHITE, stroke_width=0.9, opacity=0.6)
        pencil(a, q, w=1.9, amp=0.7, closed=True, step=9)

    def line(self, pts, color=C_BLK, w=1.0, closed=False):
        pencil(self.a, self.P(pts), w=1.5 + 0.7 * w, amp=0.7, closed=closed, step=9)


class RisoPen(Pen):
    """Two inks, pink and teal, out of register; halftone fills."""
    def _pat(self, ink, dense):
        a = self.a
        key = f"_rp{ink}{dense}"
        if not hasattr(a, key):
            pid = a.uid("ht")
            r = 2.5 if dense else 1.5
            rot = 20 if ink == TEAL else 65
            a.defn(f'<pattern id="{pid}" width="6.5" height="6.5" patternUnits="userSpaceOnUse" '
                   f'patternTransform="rotate({rot})"><circle cx="3.2" cy="3.2" r="{r}" fill="{ink}"/></pattern>')
            setattr(a, key, f"url(#{pid})")
        return getattr(a, key)

    def fill(self, pts, color):
        a, q = self.a, self.P(pts)
        lum, r, g, b = _lum(color)
        if lum > 225:
            a.poly(q, fill="#F6EFE3")
            a.poly(q, fill="none", stroke=TEAL, stroke_width=2)
            return
        warm = r > b + 25 and not (abs(r - g) < 14 and abs(g - b) < 14)
        ink = PINK if warm else TEAL
        dx, dy = (3.5, -2.5) if ink == PINK else (0, 0)
        a.open("g", style="mix-blend-mode:multiply", transform=f"translate({dx} {dy})")
        a.poly(q, fill=ink, opacity=0.22 if lum > 110 else 0.5)
        a.poly(q, fill=self._pat(ink, lum < 170))
        a.close()
        other = TEAL if ink == PINK else PINK
        a.poly(q, fill="none", stroke=TEAL, stroke_width=2.2, stroke_linejoin="round")
        if lum < 90:
            a.open("g", style="mix-blend-mode:multiply", transform="translate(3.5 -2.5)")
            a.poly(q, fill=self._pat(other, False))
            a.close()

    def line(self, pts, color=C_BLK, w=1.0, closed=False):
        a, q = self.a, self.P(pts)
        d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in q) + ("Z" if closed else "")
        warm = _lum(color)[1] > _lum(color)[3] + 40
        a.path(d, fill="none", stroke=PINK if warm else TEAL, stroke_width=f(2.2 + 1.4 * w), stroke_linecap="round",
               stroke_linejoin="round", style="mix-blend-mode:multiply",
               transform="translate(3.5 -2.5)" if warm else None)


# ---- the icon library (unit coordinates, y down, roughly -0.9..0.9) --------------------------------
def i_tarp(p):
    q = [(-.7, -.3), (.6, -.5), (.78, .35), (-.6, .5)]
    p.fill(q, C_BLUE); p.line(q, C_BLK, closed=True)
    for (x, y), (u, v) in zip(q, [(-.92, -.5), (.8, -.72), (.95, .55), (-.82, .7)]):
        p.line([(x, y), (u, v)], C_BRN, .7)
    p.line([(-.65, .1), (.7, -.08)], C_BLK, .6)


def i_torch(p):
    p.fill([(.3, -.42), (.92, -.8), (.98, .12), (.42, .02)], C_YEL)
    p.fill(R(-.2, .12, .95, .3, -20), C_RED); p.line(R(-.2, .12, .95, .3, -20), C_BLK, closed=True)
    p.fill(R(.33, -.07, .26, .46, -20), C_GRY); p.line(R(.33, -.07, .26, .46, -20), C_BLK, closed=True)
    p.line([(-.35, .1), (-.15, .03)], C_BLK, .8)


def i_marshmallows(p):
    p.line([(-.85, .75), (.6, -.5)], C_BRN, 1)
    for t in (0.55, 0.72, 0.9):
        x, y = -.85 + 1.45 * t, .75 - 1.25 * t
        p.fill(R(x, y, .3, .26, -40), C_WHT); p.line(R(x, y, .3, .26, -40), C_BLK, .7, closed=True)
    p.line(A(-.3, -.3, .2, 200, 330, 5), C_ORG, .7)


def i_kettle(p):
    p.line(A(0, -.2, .46, 195, 345, 8, .5), C_BLK, .9)
    p.fill([(.36, .0), (.74, -.3), (.86, -.22), (.5, .25)], C_BLUE)
    p.fill(E(0, .2, .52, .44), C_BLUE); p.line(E(0, .2, .52, .44), C_BLK, closed=True)
    p.fill(E(0, -.22, .32, .09), "#1d3d66"); p.fill(C(0, -.36, .07, 8), C_BLK)
    p.dots([(-.25, .1), (.1, .3), (-.1, .45), (.28, .08), (-.3, .36)], C_WHT, .035)


def i_rope(p):
    for k in range(3):
        p.line(E(0, .05, .62 - k * .16, .42 - k * .11), C_YEL if k % 2 == 0 else C_BRN, 1.1, closed=True)
    p.line([(.55, .2), (.8, .5), (.6, .75)], C_YEL, 1.1)
    p.line(R(0, -.34, .14, .2), C_BLK, .7, closed=True)


def i_bicycle(p):
    for x in (-.5, .5):
        p.line(C(x, .3, .33, 16), C_BLK, 1, closed=True)
        p.line([(x - .2, .3), (x + .2, .3)], C_GRY, .4); p.line([(x, .1), (x, .5)], C_GRY, .4)
    p.line([(-.5, .3), (-.12, -.2), (.32, -.2), (.02, .3), (-.5, .3)], C_RED, 1.1)
    p.line([(.32, -.2), (.5, .3)], C_RED, 1.1); p.line([(-.12, -.2), (.02, .3)], C_RED, .9)
    p.line([(-.24, -.34), (-.02, -.34)], C_BLK, 1.2); p.line([(-.12, -.34), (-.12, -.2)], C_BLK, .7)
    p.line([(.32, -.2), (.36, -.48), (.16, -.55)], C_BLK, 1)
    p.line([(.02, .3), (-.1, .52), (-.3, .62), (-.44, .5)], C_GRY, .6)      # the chain that slips


def i_heron(p):
    p.line([(-.5, .25), (-.5, .85)], C_BRN, 1.2); p.line([(.5, .25), (.5, .85)], C_BRN, 1.2)
    p.fill(R(0, -.15, 1.5, .9), C_GRN); p.line(R(0, -.15, 1.5, .9), C_BLK, closed=True)
    p.fill(E(-.05, -.02, .3, .17, -15), C_WHT)
    p.line([(.15, -.1), (.3, -.3), (.18, -.45), (.3, -.55)], C_WHT, 1)
    p.line([(.3, -.55), (.55, -.5)], C_YEL, .8)
    p.line([(-.1, .1), (-.14, .28)], C_WHT, .6); p.line([(.02, .12), (.04, .28)], C_WHT, .6)


def i_sleeping_bag(p):
    q = [(-.8, -.22), (.35, -.36), (.7, -.2), (.82, .08), (.7, .34), (.35, .46), (-.8, .34)]
    p.fill(q, C_PUR); p.line(q, C_BLK, closed=True)
    p.fill(E(.5, .06, .2, .24), C_WHT); p.line(E(.5, .06, .2, .24), C_BLK, .7, closed=True)
    p.line([(-.75, .06), (-.4, .0), (-.1, .08), (.25, .02)], C_YEL, .6)
    p.line([(-.5, -.26), (-.5, .37)], C_BLK, .6)


def i_notebook(p):
    p.fill(R(-.05, 0, .95, 1.25, -8), C_GRN); p.line(R(-.05, 0, .95, 1.25, -8), C_BLK, closed=True)
    p.line([(.22, -.62), (.38, .55)], C_BLK, .9)
    p.fill(R(-.12, -.2, .5, .26, -8), C_WHT)
    p.line([(.62, .7), (.86, -.5)], C_YEL, 1.3); p.line([(.86, -.5), (.9, -.66)], C_BLK, .8)


def i_number(p):
    p.fill(R(0, .05, 1.25, .8, 6), C_WHT); p.line(R(0, .05, 1.25, .8, 6), C_BLK, .8, closed=True)
    for k in range(7):
        x = -.48 + k * .16
        p.line([(x, .2 + .02 * k), (x + .05, -.02 + .02 * k), (x + .1, .16 + .02 * k)], C_BLUE, .6)
    p.line(A(-.2, -.5, .3, 200, 340, 6, .18), C_BLK, 1.2)
    p.fill(C(-.48, -.52, .1, 8), C_BLK); p.fill(C(.08, -.52, .1, 8), C_BLK)


def i_boots(p):
    for dx, col in ((.22, "#4d2f1b"), (-.12, C_BRN)):
        q = [(-.42 + dx, -.62), (-.02 + dx, -.62), (.02 + dx, .08), (.5 + dx, .24), (.56 + dx, .52), (-.42 + dx, .52)]
        p.fill(q, col); p.line(q, C_BLK, closed=True)
        p.line([(-.42 + dx, .42), (.56 + dx, .42)], C_BLK, .7)
    for k in range(3):
        p.line([(-.3, -.42 + k * .17), (-.1, -.36 + k * .17)], C_YEL, .6)


def i_map(p):
    xs = [-.75, -.25, .25, .75]
    for k in range(3):
        up = -.08 if k % 2 == 0 else .08
        q = [(xs[k], -.5 + up), (xs[k + 1], -.5 - up), (xs[k + 1], .55 - up), (xs[k], .55 + up)]
        p.fill(q, C_WHT); p.line(q, C_BLK, .8, closed=True)
    p.line(E(0, .02, .42, .26), C_GRN, .8, closed=True)
    p.line([(-.7, .4), (-.35, .2)], C_GRN, .7)
    p.fill(R(.3, -.1, .1, .1), C_RED)


def i_tent(p):
    q = [(-.8, .5), (-.1, -.6), (.8, .5)]
    p.fill(q, C_ORG); p.line(q, C_BLK, closed=True)
    p.fill([(-.28, .5), (-.1, -.1), (.1, .5)], "#5a2a12")
    p.line([(-.1, -.6), (-.1, -.78)], C_BLK, .7)
    p.line([(-.8, .5), (-.95, .62)], C_BRN, .6); p.line([(.8, .5), (.95, .62)], C_BRN, .6)
    p.line([(-.95, .62), (.95, .62)], C_GRN, .8)


def i_cup(p):
    p.line(A(.42, .1, .24, -80, 80, 6, .22), C_BLK, 1)
    q = [(-.42, -.3), (.42, -.3), (.36, .5), (-.36, .5)]
    p.fill(q, C_WHT); p.line(q, C_BLK, closed=True)
    p.line(E(0, -.3, .42, .1), C_BLUE, 1, closed=True)
    p.line(A(-.05, -.55, .12, 90, 270, 4), C_GRY, .5); p.line(A(.1, -.72, .1, -90, 90, 4), C_GRY, .5)


def i_socks(p):
    for dx, col in ((-.3, C_RED), (.3, C_BLUE)):
        q = [(dx - .18, -.65), (dx + .16, -.65), (dx + .18, .15), (dx + .42, .4), (dx + .3, .62), (dx - .2, .45)]
        p.fill(q, col); p.line(q, C_BLK, .8, closed=True)
        p.line([(dx - .18, -.45), (dx + .16, -.45)], C_WHT, .8); p.line([(dx - .18, -.3), (dx + .16, -.3)], C_WHT, .8)


def i_pan(p):
    p.fill(R(.62, .3, .62, .15, 18), C_BLK)
    p.fill(C(-.15, .0, .5, 16), C_BLK); p.line(C(-.15, .0, .36, 14), C_GRY, .7, closed=True)
    p.fill(E(-.2, .02, .2, .16, 20), C_WHT); p.fill(C(-.18, .02, .07, 8), C_YEL)


def i_hat(p):
    p.fill(E(0, .25, .85, .26), C_YEL)
    q = [(-.42, .22), (-.36, -.3), (0, -.48), (.36, -.3), (.42, .22)]
    p.fill(q, C_YEL); p.line(q, C_BLK, .9)
    p.line(E(0, .25, .85, .26), C_BLK, .9, closed=True)
    p.line([(-.4, .08), (0, .16), (.4, .08)], C_RED, 1.1)


def i_book(p):
    p.fill(R(.04, .06, 1.0, 1.25, 7), C_WHT)
    p.fill(R(-.04, 0, 1.0, 1.25, 7), C_RED); p.line(R(-.04, 0, 1.0, 1.25, 7), C_BLK, closed=True)
    p.line([(-.2, -.28), (.22, -.22)], C_YEL, .9); p.line([(-.22, -.1), (.1, -.06)], C_YEL, .6)
    p.line([(.2, .62), (.24, .88), (.34, .76)], C_BLUE, .8)


def i_pegs(p):
    for k, x in enumerate((-.5, -.05, .4)):
        p.line([(x, .7), (x + .18, -.5), (x + .36, -.42)], C_GRY if k != 1 else C_BLK, 1.1)
    p.line([(-.7, .78), (.75, .78)], C_GRN, .6)


def i_rucksack(p):
    q = [(-.5, .7), (-.56, -.1), (-.36, -.62), (.36, -.62), (.56, -.1), (.5, .7)]
    p.fill(q, C_GRN); p.line(q, C_BLK, closed=True)
    p.fill(R(0, .3, .6, .42), "#2a5527"); p.line(R(0, .3, .6, .42), C_BLK, .7, closed=True)
    p.line([(-.5, -.2), (0, -.02), (.5, -.2)], C_BLK, .8)
    p.line([(0, -.02), (0, .1)], C_YEL, 1); p.line(A(0, -.62, .2, 180, 360, 5), C_BRN, .9)


def i_matches(p):
    for k, x in enumerate((-.3, -.1, .12, .3)):
        p.line([(x, -.1), (x + (k - 1.5) * .08, -.68)], C_BRN, .6)
        p.fill(C(x + (k - 1.5) * .08, -.72, .07, 7), C_RED)
    p.fill(R(0, .25, 1.1, .7), C_YEL); p.line(R(0, .25, 1.1, .7), C_BLK, closed=True)
    p.fill(R(0, .5, 1.1, .16), C_BRN)
    p.line(A(0, .18, .2, 200, 520, 8, .26), C_RED, .8)


def i_compass(p):
    p.fill(C(0, .05, .66, 18), C_WHT); p.line(C(0, .05, .66, 18), C_BLK, 1.1, closed=True)
    p.line(C(0, .05, .52, 16), C_GRY, .4, closed=True)
    p.fill([(0, -.42), (.12, .05), (-.12, .05)], C_RED); p.fill([(0, .52), (.12, .05), (-.12, .05)], C_BLK)
    p.line(C(0, -.76, .1, 8), C_BLK, .7, closed=True)


def i_walkie(p):
    p.line([(-.2, -.35), (-.2, -.9)], C_BLK, 1.1)
    p.fill(R(0, .2, .62, 1.15), C_BLK); p.line(R(0, .2, .62, 1.15), C_GRY, .7, closed=True)
    for k in range(4):
        p.line([(-.18, .22 + k * .12), (.18, .22 + k * .12)], C_GRY, .5)
    p.fill(C(.12, -.14, .11, 8), C_YEL); p.fill(R(-.1, -.14, .2, .14), C_GRN)


def i_camera(p):
    p.fill(R(-.3, -.42, .34, .16), C_BLK)
    p.fill(R(0, .05, 1.35, .8), C_BLK); p.line(R(0, .05, 1.35, .8), C_GRY, .6, closed=True)
    p.fill(C(0, .08, .3, 14), C_GRY); p.fill(C(0, .08, .17, 10), "#1d3d66"); p.dots([(-.06, .02)], C_WHT, .04)
    p.fill(R(.45, -.2, .2, .12), C_YEL)


def i_foil(p):
    q = [(-.1, -.1), (.8, -.45), (.9, .25), (.1, .6)]
    p.fill(q, C_WHT); p.line(q, C_GRY, .7, closed=True)
    p.line([(.2, .1), (.75, -.12)], C_GRY, .4); p.line([(.3, .32), (.8, .08)], C_GRY, .4)
    p.fill(R(-.3, .1, .36, 1.2, -20), C_GRY); p.line(R(-.3, .1, .36, 1.2, -20), C_BLK, closed=True)
    p.line(E(-.5, -.45, .18, .08, -20), C_BLK, .6, closed=True)


def i_cooler(p):
    p.line(A(0, -.35, .5, 190, 350, 6, .42), C_BLK, .9)
    p.fill(R(0, .2, 1.35, .75), C_RED); p.line(R(0, .2, 1.35, .75), C_BLK, closed=True)
    p.fill(R(0, -.28, 1.42, .22), C_WHT); p.line(R(0, -.28, 1.42, .22), C_BLK, .8, closed=True)
    p.fill(R(0, .2, .2, .14), C_WHT)


def i_lantern(p):
    p.line(A(0, -.42, .34, 180, 360, 6, .4), C_BLK, .8)
    p.fill([(-.26, -.3), (.26, -.3), (.34, .4), (-.34, .4)], C_YEL)
    p.fill([(0, -.1), (.12, .2), (0, .32), (-.12, .2)], C_ORG)
    p.line([(-.26, -.3), (-.34, .4)], C_BLK, .8); p.line([(.26, -.3), (.34, .4)], C_BLK, .8)
    p.fill(R(0, -.38, .5, .16), C_GRN); p.fill(R(0, .5, .8, .2), C_GRN)
    p.line(R(0, .5, .8, .2), C_BLK, .7, closed=True)


def i_cards(p):
    for rot, dx in ((-22, -.3), (0, 0), (22, .3)):
        p.fill(R(dx, .05 + abs(dx) * .3, .6, .95, rot), C_WHT)
        p.line(R(dx, .05 + abs(dx) * .3, .6, .95, rot), C_BLK, .7, closed=True)
    p.fill([(0, -.2), (.16, .05), (0, .3), (-.16, .05)], C_RED)
    p.fill(C(-.36, 0, .08, 7), C_BLK); p.fill(C(.38, .0, .08, 7), C_RED)


def i_firewood(p):
    for x, y in ((-.35, .25), (.35, .25), (0, -.25)):
        p.fill(C(x, y, .36, 12), C_BRN); p.line(C(x, y, .36, 12), C_BLK, .8, closed=True)
        p.line(C(x, y, .2, 9), C_YEL, .5, closed=True); p.fill(C(x, y, .05, 6), C_BLK)
    p.line([(-.75, .1), (0, .72), (.75, .1)], C_YEL, .7)


def i_toothbrush(p):
    p.line([(-.8, .55), (.45, -.3)], C_BLUE, 1.6)
    p.fill(R(.52, -.5, .5, .22, -34), C_WHT); p.line(R(.52, -.5, .5, .22, -34), C_BLK, .6, closed=True)
    for k in range(4):
        p.line([(.34 + k * .11, -.36 - k * .075), (.26 + k * .11, -.5 - k * .075)], C_GRY, .4)


def i_bottle(p):
    p.fill(R(0, -.68, .22, .16), C_BLK)
    q = [(-.14, -.6), (.14, -.6), (.32, -.3), (.32, .72), (-.32, .72), (-.32, -.3)]
    p.fill(q, C_BLUE); p.line(q, C_BLK, closed=True)
    p.line([(-.32, .0), (.32, .0)], C_WHT, .8); p.line([(-.32, .3), (.32, .3)], C_WHT, .8)
    p.line(A(.32, -.1, .25, -90, 90, 5, .4), C_BRN, .7)


def i_knife(p):
    p.fill([(-.1, -.12), (.85, -.3), (.6, .02), (-.05, .1)], C_GRY); p.line([(-.1, -.12), (.85, -.3), (.6, .02)], C_BLK, .7)
    p.fill(R(-.42, .14, .85, .3, -14), C_RED); p.line(R(-.42, .14, .85, .3, -14), C_BLK, closed=True)
    p.fill(C(-.7, .2, .06, 6), C_WHT); p.line([(-.45, .08), (-.32, .2)], C_WHT, .5); p.line([(-.45, .2), (-.32, .08)], C_WHT, .5)


def i_blanket(p):
    for k in range(3):
        y = .42 - k * .34
        p.fill(R(0, y, 1.35, .3), C_RED if k != 1 else C_GRN); p.line(R(0, y, 1.35, .3), C_BLK, .8, closed=True)
        for x in (-.4, 0, .4):
            p.line([(x, y - .15), (x, y + .15)], C_YEL if k != 1 else C_WHT, .5)
    p.line(A(-.68, .08, .14, 90, 270, 4, .5), C_BLK, .7)


def i_mallet(p):
    p.line([(-.6, .7), (.25, -.2)], C_BRN, 1.5)
    p.fill(R(.35, -.32, .85, .45, -45), C_BRN); p.line(R(.35, -.32, .85, .45, -45), C_BLK, closed=True)
    p.line([(.1, -.3), (.36, -.56)], C_YEL, .5)


def i_thermos(p):
    p.fill(R(0, -.6, .44, .28), C_GRY); p.line(R(0, -.6, .44, .28), C_BLK, .7, closed=True)
    p.fill(R(0, .15, .56, 1.2), C_GRN); p.line(R(0, .15, .56, 1.2), C_BLK, closed=True)
    p.line([(-.28, -.2), (.28, -.2)], C_YEL, .8); p.line([(-.28, .5), (.28, .5)], C_YEL, .8)


def i_keys(p):
    p.line(C(-.1, -.4, .28, 12), C_GRY, 1, closed=True)
    p.line([(-.05, -.12), (.3, .6)], C_GRY, 1.1); p.line([(.18, .36), (.34, .3)], C_GRY, .7); p.line([(.25, .5), (.4, .44)], C_GRY, .7)
    p.line([(-.2, -.14), (-.4, .5)], C_YEL, 1); p.line([(-.36, .34), (-.5, .3)], C_YEL, .7)
    p.fill(R(.42, -.3, .5, .3, 20), C_RED); p.line(R(.42, -.3, .5, .3, 20), C_BLK, .7, closed=True)


# things the sites held (the List)
def i_washing_line(p):
    p.line([(-.8, .8), (-.8, -.6)], C_BRN, 1.2); p.line([(.8, .8), (.8, -.6)], C_BRN, 1.2)
    p.line([(-.8, -.5), (-.3, -.36), (.3, -.36), (.8, -.5)], C_BLK, .6)
    p.fill([(-.6, -.42), (-.28, -.36), (-.3, .2), (-.6, .14)], C_BLUE)
    p.fill([(-.12, -.36), (.2, -.36), (.2, .0), (-.12, .0)], C_RED)
    p.fill([(.36, -.38), (.6, -.44), (.62, .3), (.38, .3)], C_WHT); p.line([(.36, -.38), (.6, -.44), (.62, .3), (.38, .3)], C_BLK, .5, closed=True)


def i_camp_chair(p):
    p.line([(-.5, .8), (.4, -.1)], C_GRY, 1); p.line([(.5, .8), (-.4, -.1)], C_GRY, 1)
    p.fill([(-.45, -.1), (.45, -.1), (.36, .12), (-.36, .12)], C_GRN)
    p.fill([(-.42, -.75), (.42, -.75), (.4, -.3), (-.4, -.3)], C_GRN)
    p.line([(-.42, -.75), (-.45, -.1)], C_BLK, .8); p.line([(.42, -.75), (.45, -.1)], C_BLK, .8)


def i_hammock(p):
    p.line([(-.85, .8), (-.8, -.8)], C_BRN, 1.5); p.line([(.85, .8), (.8, -.8)], C_BRN, 1.5)
    q = [(-.78, -.3), (-.4, .1), (0, .22), (.4, .1), (.78, -.3), (.4, .34), (0, .46), (-.4, .34)]
    p.fill(q, C_YEL); p.line(q, C_BLK, .8, closed=True)
    p.line([(-.4, .1), (-.4, .34)], C_RED, .5); p.line([(0, .22), (0, .46)], C_RED, .5); p.line([(.4, .1), (.4, .34)], C_RED, .5)


def i_dog_bowl(p):
    q = [(-.5, -.1), (.5, -.1), (.7, .45), (-.7, .45)]
    p.fill(q, C_RED); p.line(q, C_BLK, closed=True)
    p.fill(E(0, -.1, .5, .12), C_BLUE); p.line(E(0, -.1, .5, .12), C_BLK, .7, closed=True)
    p.line([(-.25, .22), (.25, .22)], C_WHT, 1.2); p.fill(C(-.3, .22, .08, 6), C_WHT); p.fill(C(.3, .22, .08, 6), C_WHT)


def i_fishing_rod(p):
    p.line([(-.8, .7), (.7, -.75)], C_BRN, 1)
    p.fill(C(-.5, .5, .15, 9), C_GRY); p.line(C(-.5, .5, .15, 9), C_BLK, .6, closed=True)
    p.line([(.7, -.75), (.72, -.1), (.6, .4)], C_BLK, .4)
    p.fill(C(.6, .46, .1, 8), C_RED); p.line(A(.6, .7, .3, 200, 340, 5, .08), C_BLUE, .6)


def i_owl_box(p):
    p.line([(.0, -.9), (.05, .9)], C_BRN, 2.4)
    p.fill(R(0, .05, .8, 1.0), C_BRN); p.line(R(0, .05, .8, 1.0), C_BLK, closed=True)
    p.fill([(-.52, -.42), (.52, -.6), (.52, -.44), (-.52, -.26)], C_BLK)
    p.fill(C(0, -.05, .2, 12), C_BLK)
    p.line([(-.3, .38), (.3, .38)], C_BLK, .6); p.line([(-.14, .28), (.14, .28)], C_YEL, .5)


def i_kite(p):
    q = [(0, -.8), (.45, -.25), (0, .35), (-.45, -.25)]
    p.fill(q, C_RED); p.line(q, C_BLK, closed=True)
    p.line([(0, -.8), (0, .35)], C_BLK, .5); p.line([(-.45, -.25), (.45, -.25)], C_BLK, .5)
    p.line([(0, .35), (.15, .5), (-.05, .62), (.2, .76), (.05, .88)], C_BLUE, .7)
    p.fill(R(.15, .5, .14, .08, 30), C_YEL); p.fill(R(.2, .76, .14, .08, -20), C_YEL)


def i_pool(p):
    for k in range(3):
        p.line(E(0, .15, .78 - k * .22, .36 - k * .1), C_BLUE, .8, closed=True)
    p.fill(E(-.6, -.3, .2, .12), C_GRY); p.fill(E(.5, -.38, .26, .14), C_GRY)
    p.line(A(0, .15, .12, 180, 360, 4, .05), C_BLUE, .6)
    p.line([(-.3, -.6), (-.26, -.34)], C_GRN, .6); p.line([(-.2, -.66), (-.18, -.34)], C_GRN, .6)


def i_guitar(p):
    p.fill(R(.5, -.5, .16, .85, 45), C_BRN)
    p.fill(C(-.3, .32, .42, 14), C_YEL); p.fill(C(.02, 0, .3, 12), C_YEL)
    p.line(C(-.3, .32, .42, 14), C_BLK, .8, closed=True)
    p.fill(C(-.14, .16, .13, 9), C_BLK)
    p.line([(-.4, .42), (.78, -.76)], C_BLK, .4); p.fill(R(.82, -.82, .2, .16, 45), C_BLK)


def i_paddle(p):
    p.line([(-.7, .75), (.3, -.3)], C_BRN, 1.2)
    p.fill(E(.5, -.5, .36, .17, -46), C_BRN); p.line(E(.5, -.5, .36, .17, -46), C_BLK, .8, closed=True)
    p.line([(-.78, .66), (-.62, .84)], C_BLK, 1.1)


def i_milk(p):
    q = [(-.12, -.8), (.12, -.8), (.14, -.4), (.3, -.15), (.3, .5), (-.3, .5), (-.3, -.15), (-.14, -.4)]
    p.fill(q, C_WHT); p.line(q, C_BLK, closed=True)
    p.fill(R(0, -.84, .3, .1), C_BLUE)
    for k, y in enumerate((.2, .42, .64)):
        p.line([(-.85, y), (-.5, y - .08), (-.15, y), (.2, y - .08), (.55, y), (.88, y - .08)], C_BLUE, .8)


def i_windbreak(p):
    xs = [-.8, -.27, .27, .8]
    for k in range(3):
        q = [(xs[k], -.4), (xs[k + 1], -.4), (xs[k + 1], .5), (xs[k], .5)]
        p.fill(q, (C_BLUE, C_YEL, C_RED)[k])
    for x in xs:
        p.line([(x, -.62), (x, .78)], C_BRN, 1)
    p.line([(-.8, -.4), (.8, -.4)], C_BLK, .5)


def i_wagon(p):
    p.fill(R(-.05, .05, 1.2, .5), C_RED); p.line(R(-.05, .05, 1.2, .5), C_BLK, closed=True)
    for x in (-.45, .35):
        p.fill(C(x, .45, .2, 10), C_BLK); p.fill(C(x, .45, .07, 6), C_WHT)
    p.line([(.55, .1), (.85, -.5), (.72, -.58)], C_BLK, 1)


def i_radio(p):
    p.line([(.4, -.3), (.75, -.85)], C_GRY, .7)
    p.fill(R(0, .15, 1.4, .85), C_BRN); p.line(R(0, .15, 1.4, .85), C_BLK, closed=True)
    p.fill(C(-.32, .18, .26, 12), C_BLK); p.line(C(-.32, .18, .14, 8), C_GRY, .4, closed=True)
    p.fill(R(.34, .0, .46, .22), C_WHT); p.line([(.3, -.1), (.3, .1)], C_RED, .5)
    p.fill(C(.2, .38, .07, 6), C_YEL); p.fill(C(.46, .38, .07, 6), C_YEL)


def i_cedar(p):
    p.line([(0, .9), (0, -.6)], C_BRN, 1.6)
    for k in range(5):
        y = -.62 + k * .28
        w = .18 + k * .13
        q = [(0, y - .22), (w, y + .12), (w * .5, y + .06), (0, y + .14), (-w * .5, y + .06), (-w, y + .12)]
        p.fill(q, C_GRN); p.line(q, C_BLK, .6, closed=True)
    p.line([(-.3, .9), (.3, .9)], C_GRN, .6)


def i_tyre_swing(p):
    p.line([(-.85, -.75), (.85, -.82)], C_BRN, 1.8)
    p.line([(-.1, -.76), (-.14, .0)], C_YEL, .7); p.line([(.2, -.78), (.16, .0)], C_YEL, .7)
    p.line(E(.02, .32, .44, .36), C_BLK, 2.2, closed=True)
    p.line(E(.02, .32, .22, .18), C_GRY, .5, closed=True)


def i_pole_lantern(p):
    p.line([(-.3, .9), (-.3, -.7), (-.1, -.85), (.2, -.75), (.25, -.5)], C_BLK, 1)
    p.fill([(.1, -.45), (.4, -.45), (.46, .05), (.04, .05)], C_YEL)
    p.line([(.1, -.45), (.4, -.45), (.46, .05), (.04, .05)], C_BLK, .8, closed=True)
    p.fill(R(.25, .1, .5, .1), C_GRN)
    p.line([(-.55, .9), (-.05, .9)], C_GRN, .6)


# food (Foil Supper)
def i_potatoes(p):
    for x, y, r in ((-.3, .2, .42), (.35, .3, .36), (.1, -.3, .38)):
        q = E(x, y, r, r * .72, 20 * x * 3)
        p.fill(q, C_BRN); p.line(q, C_BLK, .8, closed=True)
        p.dots([(x - .1, y), (x + .12, y + .08), (x + .02, y - .12)], C_BLK, .03)


def i_corn(p):
    p.fill([(-.75, .45), (-.2, .0), (-.3, .6)], C_GRN); p.fill([(-.6, .7), (.0, .3), (-.1, .8)], C_GRN)
    q = E(.1, -.05, .72, .28, -30)
    p.fill(q, C_YEL); p.line(q, C_BLK, .8, closed=True)
    for k in range(5):
        t = -.4 + k * .22
        p.line([(t + .1 - .12, -.05 - t * .58 - .2), (t + .1 + .12, -.05 - t * .58 + .2)], C_ORG, .4)
    p.line([(-.45, .26), (.6, -.36)], C_ORG, .4)


def i_sausages(p):
    for k, (x, y, rot) in enumerate(((-.4, -.25, -25), (.1, .05, 15), (.45, .42, -20))):
        q = E(x, y, .42, .17, rot, 12)
        p.fill(q, C_RED); p.line(q, C_BLK, .8, closed=True)
    p.line([(-.02, -.42), (-.12, -.06)], C_BRN, .5); p.line([(.5, .14), (.1, .5)], C_BRN, .5)


def i_lentil_cakes(p):
    for y in (.3, -.02):
        p.fill(E(0, y + .16, .6, .22), "#5a3a1a"); p.fill(E(0, y, .6, .22), C_BRN)
        p.line(E(0, y, .6, .22), C_BLK, .8, closed=True)
    p.dots([(-.3, -.04), (.0, .04), (.25, -.06), (-.1, -.1), (.36, .04)], C_YEL, .035)
    p.line(A(.0, -.5, .16, 90, 270, 4), C_GRY, .4)


def i_butter(p):
    p.fill(R(0, .3, 1.4, .6, -4), C_WHT); p.line(R(0, .3, 1.4, .6, -4), C_GRY, .5, closed=True)
    for x, y in ((-.3, .1), (.3, .2)):
        p.fill(R(x, y, .46, .3, -8), C_YEL); p.line(R(x, y, .46, .3, -8), C_BLK, .7, closed=True)
        p.fill([(x - .26, y - .12), (x - .14, y - .26), (x + .32, y - .32), (x + .2, y - .18)], C_YEL)


def i_olive_oil(p):
    p.fill(R(0, -.72, .2, .16), C_BLK)
    q = [(-.1, -.64), (.1, -.64), (.12, -.3), (.34, .0), (.34, .75), (-.34, .75), (-.34, .0), (-.12, -.3)]
    p.fill(q, C_GRN); p.line(q, C_BLK, closed=True)
    p.fill(R(0, .36, .5, .4), C_WHT); p.fill(E(0, .36, .1, .15), C_GRN)


def i_onions(p):
    for x, y, r in ((-.32, .25, .4), (.36, .3, .36)):
        q = [(x, y - r), (x + r * .9, y - r * .2), (x + r * .6, y + r * .8), (x, y + r), (x - r * .6, y + r * .8), (x - r * .9, y - r * .2)]
        p.fill(q, C_ORG); p.line(q, C_BLK, .8, closed=True)
        p.line([(x, y - r), (x - .06, y - r - .34), (x + .1, y - r - .5)], C_GRN, .7)
        p.line([(x - r * .3, y - r * .5), (x - r * .36, y + r * .6)], C_BRN, .4)
        p.line([(x - .08, y + r), (x - .12, y + r + .12)], C_BRN, .4); p.line([(x + .06, y + r), (x + .1, y + r + .12)], C_BRN, .4)


def i_ramps(p):
    for dx, rot in ((-.3, -18), (.25, 14)):
        q = E(dx, -.25, .2, .55, rot, 12)
        p.fill(q, C_GRN); p.line(q, C_BLK, .7, closed=True)
        p.line([(dx, -.6), (dx * .5, .3)], "#2a5527", .4)
        p.line([(dx * .6, .25), (dx * .2, .6), (dx * .1, .82)], C_RED, .9)
        p.fill(C(dx * .1, .82, .07, 6), C_WHT)


def i_salt(p):
    q = [(-.3, -.35), (.3, -.35), (.4, .7), (-.4, .7)]
    p.fill(q, C_WHT); p.line(q, C_BLK, closed=True)
    p.fill([(-.3, -.35), (-.2, -.62), (.2, -.62), (.3, -.35)], C_GRY)
    p.dots([(-.08, -.5), (.08, -.5), (0, -.44)], C_BLK, .03)
    p.line([(-.2, .2), (.2, .2)], C_BLUE, 1.2)
    p.dots([(-.5, -.75), (-.42, -.55), (-.6, -.6)], C_GRY, .03)


def i_pepper(p):
    p.fill(C(0, -.6, .2, 10), C_BLK)
    q = [(-.2, -.45), (.2, -.45), (.34, .1), (.26, .72), (-.26, .72), (-.34, .1)]
    p.fill(q, C_BRN); p.line(q, C_BLK, closed=True)
    p.line([(-.3, .1), (.3, .1)], C_BLK, .6)
    p.dots([(.5, .55), (.62, .68), (.48, .74), (-.52, .66)], C_BLK, .04)


def i_grey_apples(p):
    for x, y, r in ((-.3, .15, .44), (.4, .28, .36)):
        q = [(x, y - r * .8), (x + r * .6, y - r), (x + r, y - r * .1), (x + r * .6, y + r), (x, y + r * .85),
             (x - r * .6, y + r), (x - r, y - r * .1), (x - r * .6, y - r)]
        p.fill(q, C_GRY); p.line(q, C_BLK, .8, closed=True)
        p.line([(x, y - r * .8), (x + .06, y - r - .22)], C_BLK, .7)


def i_nothing_salt(p):
    q = [(-.3, -.35), (.3, -.35), (.4, .7), (-.4, .7)]
    p.line(q, C_GRY, .7, closed=True)
    p.line([(-.3, -.35), (-.2, -.62), (.2, -.62), (.3, -.35)], C_GRY, .7)
    p.line(C(0, .2, .16, 9), C_GRY, .5, closed=True)


def i_foil_sheet(p):
    q = [(-.75, -.5), (.65, -.62), (.8, .5), (-.62, .62)]
    p.fill(q, C_GRY); p.line(q, C_BLK, .8, closed=True)
    p.line([(-.6, -.1), (-.1, .05), (.72, -.1)], C_WHT, .5); p.line([(-.1, -.56), (-.1, .05), (.1, .56)], C_WHT, .5)
    for x, y in ((-.36, -.26), (.3, -.3), (-.36, .3), (.36, .28)):
        p.line(R(x, y, .36, .3), C_BLK, .4, closed=True)


def i_packet(p):
    q = [(-.7, .0), (-.45, -.3), (.45, -.3), (.7, .0), (.45, .5), (-.45, .5)]
    p.fill(q, C_GRY); p.line(q, C_BLK, closed=True)
    p.line([(-.7, .0), (.7, .0)], C_BLK, .7); p.line([(-.45, -.3), (-.3, .0)], C_WHT, .5); p.line([(.45, -.3), (.3, .0)], C_WHT, .5)
    for x in (-.25, .05, .32):
        p.line([(x, -.42), (x + .08, -.56), (x - .04, -.7), (x + .06, -.86)], C_ORG, .5)


ICONS = {k[2:]: v for k, v in list(globals().items()) if k.startswith("i_")}

"""Forgetting run: four graphite sketch sets, one per run, each being erased from its trailing edge."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Forgetting run sketch sets, one per run"
W, H = 1600, 900
GR = kit.GRAPHITE


class Pencil:
    def __init__(self, a, strength):
        self.a, self.s = a, strength
        self.lead = dict(stroke=GR, fill="none", stroke_linecap="round")

    def hatch(self, n, box, top=None, ang=-0.78, L=(6, 16), op=0.45, w=0.8, k=1.0):
        """Short strokes whose density follows memory. top(x) bounds them from above."""
        a, r = self.a, self.a.rng
        x0, y0, x1, y1 = box
        ca, sa = math.cos(ang), math.sin(ang)
        d = []
        for _ in range(n):
            x, y = r.uniform(x0, x1), r.uniform(y0, y1)
            if top and y < top(x):
                continue
            if r.random() > self.s(x, y) * k:
                continue
            ll = r.uniform(*L)
            d.append(f"M{f(x)},{f(y)}l{f(ll * ca)},{f(ll * sa)}")
        if d:
            a.path("".join(d), stroke=GR, stroke_width=w, opacity=op, fill="none")

    def line(self, pts, w=1.6, passes=2, amp=1.2, closed=False, fill="none", dash=None, op=None):
        """A contour, gone over twice; it fades and breaks where memory is thin."""
        a = self.a
        mx = sum(x for x, _ in pts) / len(pts)
        my = sum(y for _, y in pts) / len(pts)
        s = self.s(mx, my) if op is None else op
        if s < 0.04:
            return
        for k in range(passes):
            a.path(a.wobble_d(pts, amp, 12, closed), stroke=GR, stroke_width=w * (1 - 0.3 * k), fill=fill if k == 0 else "none",
                   stroke_linecap="round", opacity=min(1, 0.25 + s * 0.75), stroke_dasharray=dash)

    def outline(self, pts, closed=False):
        """Unremembered: a faint dashed outline."""
        self.a.path(self.a.wobble_d(pts, 1, 16, closed), stroke=GR, stroke_width=1.3, fill="none", stroke_dasharray="9 8", opacity=0.45)

    def solid(self, x0, y, x1, depth=None):
        """Ground held by Recall: dense cross-hatch."""
        a = self.a
        depth = depth or (H - y)
        a.rect(x0, y, x1 - x0, depth, fill="#d9d2c2")
        cl = a.clip(f'<rect x="{f(x0)}" y="{f(y)}" width="{f(x1 - x0)}" height="{f(depth)}"/>')
        a.hatch(x0, y, x1 - x0, depth, angle=40, spacing=5, clip=cl, stroke=GR, stroke_width=1.1, jitter=1)
        a.hatch(x0, y, x1 - x0, min(depth, 46), angle=-35, spacing=6, clip=cl, stroke=GR, stroke_width=0.9, jitter=1)
        for k in range(3):
            a.wobble([(x0, y + k), (x1, y + k)], amp=0.8, step=12, stroke_width=2.6, **self.lead)
        a.wobble([(x0, y), (x0, y + depth)], amp=1, step=14, stroke_width=2, **self.lead)
        a.wobble([(x1, y), (x1, y + depth)], amp=1, step=14, stroke_width=2, **self.lead)

    def lantern(self, x, y, s=1.0, label=None):
        """A touchstone: a lit lantern, its glow rubbed out of the graphite."""
        a = self.a
        a.circle(x, y, 80 * s, fill=a.radial([(0, "#f6d27a", 0.6), (1, "#f6d27a", 0)]))
        d = []
        for k in range(16):
            an = 2 * math.pi * k / 16
            d.append(f"M{f(x + 28 * s * math.cos(an))},{f(y + 28 * s * math.sin(an))}L{f(x + 58 * s * math.cos(an))},{f(y + 58 * s * math.sin(an))}")
        a.path("".join(d), stroke=GR, stroke_width=1, opacity=0.4, fill="none")
        a.wobble([(x - 14 * s, y - 18 * s), (x + 14 * s, y - 18 * s), (x + 18 * s, y + 22 * s), (x - 18 * s, y + 22 * s)], closed=True, amp=1, step=8,
                 stroke=GR, stroke_width=2, fill="#f8e7b4")
        a.path(f"M{f(x - 10 * s)},{f(y - 18 * s)} q{f(10 * s)},{f(-22 * s)} {f(20 * s)},0 M{f(x)},{f(y + 22 * s)} v{f(26 * s)}", stroke=GR, stroke_width=2, fill="none")
        a.path(f"M{f(x)},{f(y + 10 * s)} q{f(-6 * s)},{f(-10 * s)} 0,{f(-20 * s)} q{f(6 * s)},{f(10 * s)} 0,{f(20 * s)}z", fill="#c98a2a")
        if label:
            a.text(x, y + 66 * s, label, size=14, family="monospace", fill=GR, text_anchor="middle", opacity=0.8)

    def blank_wall(self, edge, vertical=True):
        """The blank paper: a torn, slightly raised sheet over what was there, with eraser crumbs."""
        a, r = self.a, self.a.rng
        if vertical:
            pts = [(edge + r.uniform(-14, 14) + 6 * math.sin(yy / 30), yy) for yy in range(-10, H + 20, 18)]
            sheet = [(-10, -10)] + pts + [(-10, H + 20)]
            tr = "translate(9,0)"
        else:
            pts = [(xx, edge + r.uniform(-12, 12) + 6 * math.sin(xx / 34)) for xx in range(-10, W + 20, 18)]
            sheet = [(-10, H + 10)] + pts + [(W + 10, H + 10)]
            tr = "translate(0,-9)"
        a.path(kit.pd(sheet), fill="#000", opacity=0.13, filter=a.blur(8), transform=tr)
        a.path(kit.pd(sheet), fill="#f8f3e8")
        a.path(kit.pd(pts, False), fill="none", stroke="#b9b1a0", stroke_width=1.5)
        crumbs = []
        for _ in range(150):
            t = r.choice(pts)
            off = abs(r.gauss(0, 46)) + 4
            x, y = (t[0] + off, t[1] + r.uniform(-9, 9)) if vertical else (t[0] + r.uniform(-9, 9), t[1] - off)
            rr = r.uniform(1.5, 4.5)
            crumbs.append(f"M{f(x)},{f(y)}c{f(rr)},{f(-rr)} {f(rr * 2.5)},{f(rr * .4)} {f(rr * 1.2)},{f(rr * 1.4)}"
                          f"c{f(-rr)},{f(rr * .6)} {f(-rr * 1.8)},0 {f(-rr * 1.2)},{f(-rr * 1.4)}z")
        a.path("".join(crumbs), fill="#cfc6b3", stroke="#9a917f", stroke_width=0.6)
        for _ in range(7):   # smudges where the rubber dragged
            if vertical:
                a.ellipse(edge - r.uniform(40, 200), r.uniform(60, H - 60), r.uniform(60, 130), r.uniform(8, 18), fill=GR, opacity=0.06, filter=a.blur(6))
            else:
                a.ellipse(r.uniform(80, W - 80), edge + r.uniform(40, 120), r.uniform(60, 130), r.uniform(8, 16), fill=GR, opacity=0.06, filter=a.blur(6))

    def title(self, n, name, x=None, y=64):
        a = self.a
        x = W - 60 if x is None else x
        a.text(x, y, f"RUN {n}", size=20, family="monospace", fill=GR, text_anchor="end", letter_spacing=3)
        a.text(x, y + 28, name, size=22, family="serif", font_style="italic", fill=GR, text_anchor="end")
        a.wobble([(x - 300, y + 40), (x, y + 40)], amp=1, step=14, stroke=GR, stroke_width=1.2, opacity=0.6)


def strength_x(edge, clear, far, floor=0.12):
    """Erased behind the edge, dense round the runner, faint toward the unremembered."""
    def s(x, y=0):
        if x < edge:
            return 0.0
        if x < edge + 140:
            return (x - edge) / 140 * 0.9
        if x < clear:
            return 0.9
        return max(floor, 0.9 - (x - clear) / (far - clear) * 0.8)
    return s


def fir(p, x, y, hgt):
    a, r = p.a, p.a.rng
    s = p.s(x, y)
    if s < 0.05:
        return
    p.line([(x, y + 4), (x + r.uniform(-3, 3), y - hgt)], w=1.4, passes=1 + int(s * 2))
    d = []
    for k in range(int(3 + s * 6)):
        yy = y - hgt * (0.25 + 0.7 * k / (3 + s * 6))
        wd = hgt * 0.26 * (1 - (y - yy) / hgt * 0.8)
        d.append(f"M{f(x - wd)},{f(yy + wd * .5)} L{f(x)},{f(yy - 6)} L{f(x + wd)},{f(yy + wd * .5)}")
    a.path("".join(d), stroke=GR, stroke_width=1, fill="none", opacity=0.2 + s * 0.55)


@asset(G, "run-outpost", group="backdrops", title="Forgetting run I: the outpost gates", w=W, h=H, row=ROW)
def run_outpost(a: Art):
    """Sketch set for the first forgetting run, in graphite: the forest path to the ranger outpost. Blank paper eats the
    world from the left; the ground near it is dense pencil, the path ahead a dashed outline, and the palisade gates at
    the right edge are still only half inked in. Three touchstone lanterns stand along the way."""
    # four layers a mode can take apart: plate (paper), far (hill and firs), fore (path, lanterns, edge), gate
    a.open("g", class_="plate")
    a.paper(kit.PAPER, grain=0.14, fibre=1.1)
    a.close()
    a.open("g", class_="far")
    r = a.rng
    EDGE = 250
    p = Pencil(a, strength_x(EDGE, 900, 1500))
    hill = kit.ridge(r, 0, W, 380, 60, 0.5, 6)
    hy = lambda x: hill[max(0, min(len(hill) - 1, int(x / W * (len(hill) - 1))))][1]
    p.hatch(3200, (EDGE - 20, 300, W, 640), top=hy, op=0.4)
    seg = []
    for q in hill:
        if r.random() < p.s(q[0]) + 0.05:
            seg.append(q)
        else:
            if len(seg) > 1:
                p.line(seg, w=1.6, passes=1)
            seg = []
    if len(seg) > 1:
        p.line(seg, w=1.6, passes=1)
    for k in range(17):
        x = EDGE + 30 + k * 76 + r.uniform(-22, 22)
        fir(p, x, hy(x) + r.uniform(0, 30), r.uniform(120, 240))
    a.close()
    a.open("g", class_="fore")
    # the path: remembered, held, unremembered
    plats = [(60, 420, 660), (470, 700, 640), (760, 1010, 610), (1080, 1230, 570), (1290, 1600, 620)]
    for i, (x0, x1, y) in enumerate(plats):
        if i >= 3:
            p.outline([(x0, H + 10), (x0, y), (x1, y), (x1, H + 10)])
        elif i == 2:
            p.solid(x0, y, x1)
        else:
            x0 = max(x0, EDGE)
            cl = a.clip(f'<rect x="{x0}" y="{y}" width="{x1 - x0}" height="{H - y}"/>')
            a.hatch(x0, y, x1 - x0, H - y, angle=40, spacing=6, clip=cl, stroke=GR, stroke_width=1, jitter=2, opacity=0.6)
            a.wobble([(x0, y), (x1, y)], amp=1, step=12, stroke_width=2.2, **p.lead)
            a.wobble([(x1, y), (x1, H)], amp=1, step=14, stroke_width=1.8, **p.lead)
            if i == 0:
                for _ in range(16):
                    a.circle(EDGE + r.uniform(0, 130), y + r.uniform(-4, H - y), r.uniform(6, 22), fill=kit.PAPER)
    # roots, ferns and stones on the remembered ground
    for x, y in ((520, 640), (640, 640), (820, 610), (940, 610)):
        a.path(f"M{x},{y} q-10,-30 -26,-34 M{x},{y} q4,-34 0,-46 M{x},{y} q14,-26 28,-30", stroke=GR, stroke_width=1.3, fill="none", opacity=0.8)
    p.lantern(580, 580, 0.9)
    p.lantern(900, 548, 0.9)
    p.lantern(1160, 506, 0.9)
    a.close()
    a.open("g", class_="gate")
    # the outpost gates, inking in from outline: two towers, a lintel, a half-drawn door
    gx, gy = 1370, 620
    p.line([(gx, gy), (gx, gy - 300), (gx + 46, gy - 300), (gx + 46, gy)], w=1.8, op=0.8)
    p.line([(gx - 10, gy - 300), (gx + 23, gy - 356), (gx + 56, gy - 300)], w=1.8, op=0.8, closed=True)
    p.outline([(gx + 170, gy), (gx + 170, gy - 300), (gx + 216, gy - 300), (gx + 216, gy)])
    p.outline([(gx + 160, gy - 300), (gx + 193, gy - 356), (gx + 226, gy - 300)], closed=True)
    p.line([(gx + 46, gy - 250), (gx + 170, gy - 250), (gx + 170, gy - 222), (gx + 46, gy - 222)], w=1.5, op=0.6, closed=True)
    cl = a.clip(f'<rect x="{gx - 12}" y="{gy - 360}" width="110" height="362"/>')
    a.hatch(gx - 12, gy - 360, 240, 362, angle=60, spacing=7, clip=cl, stroke=GR, stroke_width=0.9, opacity=0.6)
    d = "".join(f"M{gx + 58 + k * 14},{gy - 216} V{gy}" for k in range(8))
    a.path(d, stroke=GR, stroke_width=1, stroke_dasharray="6 6", opacity=0.4, fill="none")
    for k in range(7):   # palisade stakes trailing off into outline
        x = gx - 60 - k * 34
        p.line([(x, gy - 40), (x, gy - 150 - (k % 2) * 14), (x + 12, gy - 168 - (k % 2) * 14), (x + 24, gy - 150 - (k % 2) * 14), (x + 24, gy - 40)],
               w=1.2, passes=1, op=max(0.1, 0.5 - k * 0.07))
    a.path(f"M{gx + 23},{gy - 356} v-60 M{gx + 23},{gy - 412} q30,6 50,-4 q-18,16 -50,24", stroke=GR, stroke_width=1.6, fill="none", opacity=0.7)
    a.close()
    a.open("g", class_="fore")
    p.blank_wall(EDGE)
    for k in range(5):
        a.path(f"M{EDGE + 22},{130 + k * 120} h{44 + k * 6}", stroke=GR, stroke_width=1.2, opacity=0.4, fill="none")
    p.title("I", "the outpost gates")
    a.close()


@asset(G, "run-surface", group="backdrops", title="Forgetting run II: the surface light", w=W, h=H, row=ROW)
def run_surface(a: Art):
    """Sketch set for the second forgetting run, which climbs: a water column in graphite, rock ledges zigzagging up toward
    the light at the surface, air bubbles as touchstones, kelp and the monolith's shoulder; the blank paper rises from below."""
    a.paper(kit.PAPER, grain=0.14, fibre=1.1)
    r = a.rng
    EDGE = 730

    def s(x, y=0):
        if y > EDGE:
            return 0.0
        if y > EDGE - 130:
            return (EDGE - y) / 130 * 0.9
        if y > 330:
            return 0.9
        return max(0.14, 0.9 - (330 - y) / 330 * 0.8)
    p = Pencil(a, s)
    # the light: rays rubbed out from the top centre
    a.ellipse(800, -20, 520, 260, fill=a.radial([(0, "#f6d27a", 0.45), (1, "#f6d27a", 0)]))
    p.hatch(3400, (0, 60, W, EDGE + 10), ang=1.25, L=(10, 30), op=0.34, k=0.8)
    for k in range(11):
        x = 800 + (k - 5) * 60
        a.poly([(x - 8, 0), (x + 8, 0), (x + (k - 5) * 90 + 40, 620), (x + (k - 5) * 90 - 40, 620)], fill=kit.PAPER, opacity=0.5, filter=a.blur(8))
    # the surface, seen from beneath: outline only until reached
    surf = [(x, 96 + 12 * math.sin(x / 70)) for x in range(0, W + 40, 40)]
    p.outline(surf)
    p.outline([(x, y + 22) for x, y in surf[4:30]])
    # rock walls
    for sd in (0, 1):
        wall = kit.ridge(r, 0, H, 0, 50, 0.6, 6)
        pts = [((150 + e + 60 * math.sin(yy / 140)) if sd == 0 else (W - 150 - e - 60 * math.sin(yy / 120)), yy) for yy, e in wall]
        seg = [q for q in pts if q[1] < EDGE + 20]
        for i in range(0, len(seg) - 6, 6):
            p.line(seg[i:i + 7], w=2, passes=2)
        box = (0, 0, 260, EDGE) if sd == 0 else (W - 260, 0, W, EDGE)
        p.hatch(700, box, ang=0.6, L=(8, 20), op=0.5, w=1)
    # ledges zigzagging up: held, remembered, unremembered
    ledges = [(300, 520, 640, 1), (620, 860, 560, 2), (980, 1240, 470, 1), (700, 900, 380, 1), (380, 600, 290, 0), (640, 860, 200, 0)]
    for x0, x1, y, st in ledges:
        if st == 0:
            p.outline([(x0, y + 34), (x0 + 14, y), (x1 - 10, y), (x1, y + 30)], closed=True)
        elif st == 2:
            p.solid(x0, y, x1, 40)
        else:
            p.line([(x0, y + 30), (x0 + 12, y), (x1 - 12, y + 2), (x1, y + 34), (x0 + 60, y + 44)], w=2, closed=True, fill="#e2dccd")
            cl = a.clip(f'<rect x="{x0}" y="{y}" width="{x1 - x0}" height="44"/>')
            a.hatch(x0, y, x1 - x0, 44, angle=30, spacing=7, clip=cl, stroke=GR, stroke_width=0.9, opacity=0.6)
    # kelp
    for x in (340, 470, 1050, 1180, 1290):
        pts = [(x + 22 * math.sin(i * 1.2 + x), 760 - i * 62) for i in range(7)]
        seg = [q for q in pts if q[1] < EDGE]
        if len(seg) > 2:
            a.path(a.smooth_d(seg), stroke=GR, stroke_width=2.2, fill="none", opacity=0.75)
            for i, (bx, by) in enumerate(seg[1:]):
                sdn = 1 if i % 2 else -1
                a.path(f"M{f(bx)},{f(by)} q{sdn * 26},-18 {sdn * 36},-50 q{-sdn * 20},16 {-sdn * 36},50z", stroke=GR, stroke_width=1, fill="#ddd6c6", opacity=0.75)
    # the monolith's shoulder, lower right, its rows refusing to hold
    p.line([(1330, 760), (1338, 420), (1372, 392), (1408, 424), (1416, 760)], w=2.2, fill="#d6cfbf")
    d = "".join(f"M{1350 + c * 16},{450 + rr * 60} v{f(r.uniform(12, 24))}" for rr in range(4) for c in range(4))
    a.path(d, stroke=GR, stroke_width=1.6, fill="none", opacity=0.6)
    a.ellipse(1374, 560, 60, 150, fill=kit.PAPER, opacity=0.45, filter=a.blur(10))
    # air bubbles: the touchstones
    for x, y, rr in ((560, 590, 30), (1090, 420, 34), (800, 330, 30), (500, 240, 26), (745, 150, 24)):
        a.circle(x, y, rr * 2.2, fill=a.radial([(0, "#f6d27a", 0.5), (1, "#f6d27a", 0)]))
        for k in range(2):
            a.circle(x + r.uniform(-1, 1), y + r.uniform(-1, 1), rr, fill="#f8f3e8" if k == 0 else "none", stroke=GR, stroke_width=1.6, opacity=min(1, 0.3 + s(x, y)))
        a.path(f"M{x - rr * .55},{y - rr * .2} q{rr * .1},{-rr * .45} {rr * .5},{-rr * .55}", stroke=GR, stroke_width=1.4, fill="none", opacity=0.7)
        for k in range(3):
            a.circle(x + r.uniform(-rr, rr), y + rr + 16 + k * 16, 4 - k, fill="none", stroke=GR, stroke_width=1, opacity=0.6)
    # the swimmer, climbing
    sx, sy = 700, 500
    for limb in ([(sx, sy), (sx + 10, sy - 46)], [(sx + 8, sy - 36), (sx + 26, sy - 70), (sx + 22, sy - 100)], [(sx + 8, sy - 36), (sx - 22, sy - 30), (sx - 34, sy - 6)],
                 [(sx, sy), (sx - 16, sy + 30), (sx - 6, sy + 62)], [(sx, sy), (sx + 18, sy + 26), (sx + 10, sy + 56)]):
        for k in range(3):
            a.path(a.smooth_d([(x + r.uniform(-2, 2), y + r.uniform(-2, 2)) for x, y in limb]), stroke=GR, stroke_width=4 - k, fill="none", stroke_linecap="round", opacity=0.85)
    a.circle(sx + 13, sy - 58, 11, fill="#bdb6a6", stroke=GR, stroke_width=1.6)
    p.blank_wall(EDGE, vertical=False)
    for k in range(6):
        a.path(f"M{180 + k * 250},{EDGE - 30} v-{40 + (k % 3) * 8} m-7,9 l7,-9 l7,9", stroke=GR, stroke_width=1.3, opacity=0.45, fill="none")
    p.title("II", "the surface light", y=EDGE + 70)


@asset(G, "run-bone-bridge", group="backdrops", title="Forgetting run III: the bone bridge", w=W, h=H, row=ROW)
def run_bridge(a: Art):
    """Sketch set for the third forgetting run, the escort: a bridge of wyrm vertebrae and ribs across the chasm in graphite,
    gaps in it shown as dashed outline, Remnant archers small and faceless on a ledge above, and halfway over, a cloaked
    figure drawn only in outline: Ilvarra, when the curse has taken why she is running."""
    a.paper(kit.PAPER, grain=0.14, fibre=1.1)
    r = a.rng
    EDGE = 230
    p = Pencil(a, strength_x(EDGE, 980, 1560, 0.16))
    # the chasm's far wall and depth
    p.hatch(2600, (EDGE, 80, W, 880), ang=1.45, L=(14, 40), op=0.3, k=0.55)
    far = kit.ridge(r, 0, W, 250, 60, 0.6, 6)
    for i in range(0, len(far) - 8, 8):
        p.line(far[i:i + 9], w=1.3, passes=1)
    # the ledge above with archers
    ledge = [(820, 190), (980, 176), (1180, 200), (1330, 184), (1420, 214)]
    p.line(ledge, w=2.2)
    p.hatch(500, (820, 190, 1420, 290), ang=1.2, L=(8, 22), op=0.5)
    for x in (900, 1040, 1250):
        y = 186
        op = min(1, 0.3 + p.s(x))
        a.path(f"M{x - 12},{y} q-4,-40 12,-58 q16,18 12,58z", fill="#d9d2c2", stroke=GR, stroke_width=1.6, opacity=op)
        a.ellipse(x, y - 66, 8, 10, fill="#f8f3e8", stroke=GR, stroke_width=1.6, opacity=op)   # the blank mask
        a.path(f"M{x - 26},{y - 70} q-12,34 0,68 M{x - 26},{y - 70} L{x - 26},{y - 2} M{x - 26},{y - 36} h34", stroke=GR, stroke_width=1.3, fill="none", opacity=op)
    # the bridge: vertebrae in a shallow sag, ribs hanging beneath
    by = lambda x: 560 + 50 * math.sin((x - 200) / 1300 * math.pi)
    gaps = [(700, 790), (1130, 1260)]
    x = EDGE - 40
    while x < 1500:
        wd = r.uniform(58, 74)
        y = by(x)
        gap = any(g0 < x + wd / 2 < g1 for g0, g1 in gaps)
        vert = [(x, y - 12), (x + wd * 0.2, y - 20), (x + wd * 0.8, y - 20), (x + wd, y - 12), (x + wd, y + 14), (x + wd * 0.5, y + 22), (x, y + 14)]
        if gap or x > 1280:
            p.outline(vert, closed=True)
        else:
            held = 800 < x < 1120
            p.line(vert, w=2.2 if held else 1.6, closed=True, fill="#d9d2c2" if held else "#ebe4d4", passes=3 if held else 2)
            if held:
                cl = a.clip(f'<rect x="{f(x)}" y="{f(y - 20)}" width="{f(wd)}" height="44"/>')
                a.hatch(x, y - 20, wd, 44, angle=40, spacing=5, clip=cl, stroke=GR, stroke_width=1, jitter=1)
            p.line([(x + wd / 2, y - 20), (x + wd / 2 + 4, y - 50)], w=3, passes=1)    # the spine's process
            rib = [(x + wd / 2, y + 20), (x + wd / 2 - 30, y + 110), (x + wd / 2 + 10, y + 210), (x + wd / 2 + 70, y + 250)]
            c = kit.catmull(rib, 6)
            p.line(c, w=2, amp=0.6, passes=2)
            p.line([(q[0] + 9, q[1] + 2) for q in c[:-3]], w=1, amp=0.6, passes=1)
        x += wd + 8
    # the cliffs either end
    p.line([(EDGE - 20, 548), (330, 540), (380, 600), (350, 760), (400, H + 10)], w=2.4)
    p.hatch(500, (EDGE, 540, 400, H), ang=1.1, L=(10, 26), op=0.55)
    p.outline([(W + 10, 520), (1500, 528), (1450, 590), (1480, 740), (1440, H + 10)])
    p.outline([(1500, 528), (1500, 380), (1530, 350), (1560, 380), (1560, 524)])   # the far side's marker stone
    # Ilvarra, drawn in outline: you Recall a person
    ix, iy = 760, by(760) - 22
    fig = [(ix - 26, iy), (ix - 20, iy - 70), (ix - 8, iy - 108), (ix + 8, iy - 108), (ix + 24, iy - 66), (ix + 34, iy)]
    a.path(a.smooth_d(fig) + "Z", fill=kit.PAPER, opacity=0.8)
    p.outline(fig, closed=True)
    a.circle(ix, iy - 124, 15, fill=kit.PAPER, stroke=GR, stroke_width=1.3, stroke_dasharray="6 6", opacity=0.6)
    a.path(f"M{ix + 22},{iy - 70} l40,-70", stroke=GR, stroke_width=1.3, stroke_dasharray="9 8", fill="none", opacity=0.5)   # her spear
    # the runner ahead of her, turned back, one hand out
    rx, ry = 900, by(900) - 22
    for limb in ([(rx, ry - 70), (rx + 2, ry - 22)], [(rx, ry - 58), (rx - 30, ry - 60), (rx - 58, ry - 66)], [(rx, ry - 58), (rx + 18, ry - 36)],
                 [(rx + 2, ry - 22), (rx - 14, ry)], [(rx + 2, ry - 22), (rx + 18, ry)]):
        for k in range(3):
            a.path(a.smooth_d([(x + r.uniform(-2, 2), y + r.uniform(-2, 2)) for x, y in limb]), stroke=GR, stroke_width=4 - k, fill="none", stroke_linecap="round", opacity=0.85)
    a.circle(rx - 2, ry - 86, 13, fill="#bdb6a6", stroke=GR, stroke_width=1.6)
    p.lantern(1010, by(1010) - 70, 0.8)
    p.blank_wall(EDGE)
    p.title("III", "the bone bridge", y=780)


@asset(G, "run-expanse", group="backdrops", title="Forgetting run IV: the Astral Expanse", w=W, h=H, row=ROW)
def run_expanse(a: Art):
    """Sketch set for the last forgetting run: the Expanse in graphite, platforms that exist only for recorded places, each
    carrying a small sketch of what was kept (a tree, a spire, a crystal, a lantern), forgotten ones mere dotted outlines.
    The route bends toward the voice, drawn as broken rings with nothing inside them."""
    a.paper(kit.PAPER, grain=0.14, fibre=1.1)
    r = a.rng
    EDGE = 210
    p = Pencil(a, strength_x(EDGE, 1000, 1560, 0.14))
    # stars as small pencil crosses, and long drifting lines: reality thinning
    d = []
    for _ in range(170):
        x, y = r.uniform(EDGE, W), r.uniform(20, H - 20)
        s = r.uniform(3, 7)
        d.append(f"M{f(x - s)},{f(y)}h{f(2 * s)}M{f(x)},{f(y - s)}v{f(2 * s)}")
    a.path("".join(d), stroke=GR, stroke_width=0.9, fill="none", opacity=0.5)
    for k in range(9):
        y = 90 + k * 95
        p.line([(EDGE, y + r.uniform(-20, 20)), (700, y + r.uniform(-50, 50)), (1200, y + r.uniform(-50, 50)), (W, y + r.uniform(-30, 30))], w=0.8, passes=1, amp=3, op=0.2)
    # the voice: broken rings, nothing in them
    vx, vy = 1420, 300
    a.circle(vx, vy, 210, fill=a.radial([(0, "#f8f3e8", 0.95), (0.5, "#f8f3e8", 0.6), (1, "#f8f3e8", 0)]))
    for k in range(7):
        rr = 34 + k * 26
        a.circle(vx, vy, rr, fill="none", stroke=GR, stroke_width=1.6 - k * 0.15, stroke_dasharray=f"{20 + k * 9} {10 + k * 5}", opacity=0.7 - k * 0.07,
                 transform=f"rotate({f(r.uniform(0, 360))} {vx} {vy})")
    # the route, bending
    route = [(330, 640), (520, 560), (760, 600), (930, 470), (1120, 520), (1260, 390), (1390, 320)]
    a.path(a.smooth_d(route), stroke=GR, stroke_width=1.3, stroke_dasharray="3 9", fill="none", opacity=0.6)

    def platform(x, y, wd, state):
        top = [(x - wd / 2, y), (x - wd * 0.3, y - 8), (x + wd * 0.3, y - 8), (x + wd / 2, y)]
        under = [(x + wd / 2, y), (x + wd * 0.25, y + 46), (x + r.uniform(-10, 10), y + 96), (x - wd * 0.3, y + 40), (x - wd / 2, y)]
        if state == 0:
            p.outline(top + under[1:], closed=True)
            return
        if state == 2:
            a.path(kit.pd(top + under[1:]), fill="#d9d2c2")
            cl = a.clip(f'<path d="{kit.pd(top + under[1:])}"/>')
            a.hatch(x - wd / 2, y - 10, wd, 110, angle=40, spacing=5, clip=cl, stroke=GR, stroke_width=1.1, jitter=1)
        p.line(top + under[1:], w=2.2 if state == 2 else 1.7, closed=True, fill="none" if state == 2 else "#e6dfcf", passes=3 if state == 2 else 2, op=0.9)
        if state == 1:
            cl = a.clip(f'<path d="{kit.pd(top + under[1:])}"/>')
            a.hatch(x - wd / 2, y - 10, wd, 110, angle=70, spacing=8, clip=cl, stroke=GR, stroke_width=0.9, opacity=0.6)

    def keep(kind, x, y):
        ln = dict(stroke=GR, stroke_width=1.5, fill="none", stroke_linecap="round", opacity=0.9)
        if kind == "tree":     # the split tree
            a.path(f"M{x - 5},{y} q-4,-40 -18,-78 M{x + 5},{y} q6,-40 22,-74 M{x - 5},{y} l5,-26 l5,26 M{x - 20},{y - 70} q-18,-10 -30,-2 M{x - 16},{y - 60} q-8,-22 4,-36"
                   f" M{x + 24},{y - 68} q16,-12 30,-6 M{x + 18},{y - 56} q2,-24 -10,-34", **ln)
        elif kind == "spire":
            a.path(f"M{x - 12},{y} V{y - 70} L{x},{y - 104} L{x + 12},{y - 70} V{y} M{x - 30},{y} v-40 l10,-18 l10,18 v40 M{x + 22},{y} v-30 l8,-14 l8,14 v30 M{x},{y - 104} v-18", **ln)
        elif kind == "crystal":
            a.path(f"M{x - 8},{y} L{x - 16},{y - 50} L{x - 6},{y - 70} L{x + 4},{y - 48} L{x + 2},{y} M{x + 2},{y} L{x + 22},{y - 34} L{x + 30},{y - 20} L{x + 20},{y} M{x - 16},{y - 50} L{x + 4},{y - 48}"
                   f" M{x - 10},{y} L{x - 30},{y - 24} L{x - 24},{y}", **ln)
        elif kind == "arch":
            a.path(f"M{x - 30},{y} V{y - 50} Q{x},{y - 96} {x + 30},{y - 50} V{y} M{x - 18},{y} V{y - 46} Q{x},{y - 76} {x + 18},{y - 46} V{y}", **ln)
        elif kind == "wave":
            a.path(f"M{x - 36},{y - 10} q12,-22 24,0 q12,22 24,0 q12,-22 24,0 M{x - 30},{y - 30} q10,-16 20,0 q10,16 20,0 M{x},{y - 44} a12,12 0 1,0 0.1,0", **ln)

    platform(330, 660, 220, 1); keep("tree", 330, 652)
    platform(540, 580, 160, 1); keep("arch", 540, 572)
    p.lantern(590, 520, 0.6)
    platform(760, 620, 190, 2); keep("crystal", 780, 612)
    platform(940, 490, 170, 2); keep("spire", 950, 482)
    platform(1120, 540, 170, 0)
    platform(1270, 410, 150, 0)
    platform(700, 320, 150, 0)     # a realm below 20: no platform, only where it was
    platform(1050, 250, 130, 1); keep("wave", 1050, 242)
    platform(480, 250, 130, 0)
    p.lantern(960, 420, 0.6)
    # the runner on the held ground
    rx, ry = 800, 612
    for limb in ([(rx, ry - 70), (rx + 4, ry - 22)], [(rx + 2, ry - 56), (rx + 32, ry - 70), (rx + 50, ry - 92)], [(rx + 2, ry - 56), (rx - 26, ry - 42)],
                 [(rx + 4, ry - 22), (rx + 30, ry - 8), (rx + 34, ry)], [(rx + 4, ry - 22), (rx - 18, ry)]):
        for k in range(3):
            a.path(a.smooth_d([(x + r.uniform(-2, 2), y + r.uniform(-2, 2)) for x, y in limb]), stroke=GR, stroke_width=4 - k, fill="none", stroke_linecap="round", opacity=0.85)
    a.circle(rx + 2, ry - 86, 13, fill="#bdb6a6", stroke=GR, stroke_width=1.6)
    p.blank_wall(EDGE)
    p.title("IV", "the Astral Expanse", y=800)

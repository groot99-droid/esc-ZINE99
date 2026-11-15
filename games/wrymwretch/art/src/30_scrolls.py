"""Twin flight: seven ink-wash scroll backdrops, one per realm and the chasm."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Twin flight scroll backdrops, six realms and the chasm"
W, H = 1600, 900
INKC = kit.WASH


class Wash:
    """Shared blurs and wash gradients for one scroll, so the file stays small."""

    def __init__(self, a):
        self.a = a
        self.b = {k: a.blur(k) for k in (1.5, 4, 10, 22)}

    def fade(self, op, down=True, col=INKC):
        a = self.a
        lg = a.uid("w")
        y1, y2 = (0, 1) if down else (1, 0)
        a.defn(f'<linearGradient id="{lg}" x1="0" y1="{y1}" x2="0" y2="{y2}">'
               f'<stop offset="0%" stop-color="{col}" stop-opacity="{f(op)}"/>'
               f'<stop offset="50%" stop-color="{col}" stop-opacity="{f(op * 0.5)}"/>'
               f'<stop offset="100%" stop-color="{col}" stop-opacity="0"/></linearGradient>')
        return f"url(#{lg})"

    def range(self, base, amp, op, blur, peak=0.0, period=120, rough=0.56, depth=200, cun=0):
        """A mountain wash fading into mist at its foot."""
        a, r = self.a, self.a.rng
        pts = kit.ridge(r, -40, W + 40, base, amp, rough)
        ph = r.uniform(0, 6)
        if peak:
            pts = [(x, y - amp * peak * max(0, math.sin(x / period + ph)) ** 3) for x, y in pts]
        a.path(kit.pd(pts, False) + f" L{W + 40},{base + amp + depth} L-40,{base + amp + depth}Z", fill=self.fade(op), filter=self.b[blur])
        d = []
        for _ in range(cun):
            x, y = pts[r.randrange(len(pts))]
            L = r.uniform(18, 60)
            d.append(f"M{f(x)},{f(y + r.uniform(4, 40))}q{f(-L * .3)},{f(L * .5)} {f(-L * .1)},{f(L)}")
        if d:
            a.path("".join(d), fill="none", stroke=INKC, stroke_width=1.3, opacity=op * 0.55)
        return pts

    def mist(self, y, op=0.75, rx=900, ry=34):
        self.a.ellipse(W / 2 + self.a.rng.uniform(-260, 260), y, rx, ry, fill=kit.SILK, opacity=op, filter=self.b[22])


def finish(a, i, name, sub):
    """Colophon: the place's name down the right edge and the realm's seal."""
    a.rect(0, 0, W, H, fill="none", stroke="#8c6f45", stroke_width=10)
    a.rect(14, 14, W - 28, H - 28, fill="none", stroke="#2e241c", stroke_width=1.2, opacity=0.6)
    a.rect(W - 104, 50, 66, 40 + len(name) * 20, fill=kit.SILK, opacity=0.86, stroke="#2e241c", stroke_width=1)
    a.text(W - 60, 70, name.upper(), size=22, family="serif", fill="#2a2826", letter_spacing=6,
           transform=f"rotate(90 {W - 60} 70)")
    a.text(W - 86, 70, sub, size=16, family="serif", font_style="italic", fill="#55514a", transform=f"rotate(90 {W - 86} 70)")
    if i is not None:
        kit.seal_stamp(a, i, W - 96, H - 104, 56)


def reg(key, i, title, doc):
    def deco(fn):
        @asset(G, f"scroll-{key}", group="backdrops", title=title, w=W, h=H, row=ROW)
        def draw(a: Art):
            kit.silk(a, kit.REALMS[i]["acc"] if i is not None else kit.VIOLET)
            fn(a, Wash(a), kit.REALMS[i]["acc"] if i is not None else kit.VIOLET)
        draw.__doc__ = doc
        return draw
    return deco


@reg("west", 0, "Scroll: Cedarheart Forest", "Twin flight backdrop for the West, an ink-wash handscroll: the canopy of Cedarheart, great trunks "
     "receding into mist, hanging vines, and far off the split tree with its pale crack; one moss-green wash of dappled sun.")
def west(a, w, acc):
    r = a.rng
    a.circle(1080, 250, 210, fill=acc, opacity=0.3, filter=w.b[22])
    w.range(640, 60, 0.16, 10)
    # far trunks
    for k in range(13):
        x = 40 + k * 124 + r.uniform(-40, 40)
        wd = r.uniform(26, 60)
        kit.brush(a, [(x, -20), (x + r.uniform(-14, 14), 300), (x + r.uniform(-20, 20), 620), (x + r.uniform(-10, 10), H + 20)], wd,
                  lambda t: 0.8 + 0.2 * t, fill=INKC, opacity=0.14, filter=w.b[4])
    w.mist(520, 0.6)
    # the split tree, far right of centre: a trunk parted by a crack left as bare silk
    sx = 1130
    kit.brush(a, [(sx, 60), (sx - 8, 330), (sx + 6, 600), (sx - 4, 880)], 120, lambda t: 0.75 + 0.3 * t, fill=INKC, opacity=0.42, filter=w.b[1.5])
    a.path(kit.crack_d(r, sx + 4, 130, 1.55, 520, 22, 0.3), fill="none", stroke=kit.SILK, stroke_width=5, stroke_linejoin="round", opacity=0.95)
    a.path(kit.crack_d(r, sx + 2, 150, 1.6, 300, 16, 0.2), fill="none", stroke=INKC, stroke_width=1.2, opacity=0.7)
    # middle trunks with boughs
    for x, wd, op in ((250, 90, 0.5), (640, 70, 0.4), (1420, 100, 0.55)):
        tr = [(x, -20), (x + 16, 260), (x - 10, 560), (x + 8, H + 20)]
        kit.brush(a, tr, wd, lambda t: 0.8 + 0.3 * t, fill=INKC, opacity=op, filter=w.b[1.5])
        c = kit.catmull(tr, 6)
        for k in range(5):
            bx, by = c[3 + k * 3]
            sd = 1 if k % 2 else -1
            L = r.uniform(120, 240)
            bough = [(bx, by), (bx + sd * L * 0.5, by - 30), (bx + sd * L, by - 10 + r.uniform(-20, 20))]
            kit.brush(a, bough, 18, lambda t: 1 - 0.85 * t, fill=INKC, opacity=op + 0.1)
            for _ in range(16):   # foliage: flat dabs, some in moss
                px, py = bx + sd * L * r.uniform(0.4, 1.05), by - 16 + r.gauss(0, 20)
                a.ellipse(px, py, r.uniform(14, 34), r.uniform(5, 10), fill=r.choice([INKC, INKC, kit.shade(acc, -0.4)]),
                          opacity=r.uniform(0.3, 0.7), transform=f"rotate({f(r.uniform(-25, 25))} {f(px)} {f(py)})")
    # canopy roof and hanging vines
    top = kit.ridge(r, -40, W + 40, 70, 46, 0.6, 6)
    a.path(kit.pd(top, False) + f" L{W + 40},-40 L-40,-40Z", fill=INKC, opacity=0.78, filter=w.b[4])
    for _ in range(22):
        x = r.uniform(20, W - 20)
        L = r.uniform(90, 330)
        a.path(f"M{f(x)},{f(60 + r.uniform(0, 40))} q{f(r.uniform(-30, 30))},{f(L * .5)} {f(r.uniform(-16, 16))},{f(L)}", fill="none",
               stroke=INKC, stroke_width=r.uniform(1, 2.6), opacity=r.uniform(0.35, 0.75), stroke_linecap="round")
    # near trunk cropping the left edge, and the root floor
    kit.brush(a, [(60, -20), (30, 300), (70, 620), (20, H + 20)], 210, lambda t: 0.85 + 0.25 * t, fill="#121113", opacity=0.92)
    for k in range(9):
        a.path(f"M{f(30 + k * 14)},{f(80 + k * 30)} q14,90 -6,{f(170 + k * 12)}", fill="none", stroke=kit.SILK, stroke_width=1.4, opacity=0.25)
    floor = kit.ridge(r, -40, W + 40, 838, 26, 0.6, 6)
    a.path(kit.pd(floor, False) + f" L{W + 40},{H + 40} L-40,{H + 40}Z", fill="#121113", opacity=0.9, filter=w.b[1.5])
    w.mist(770, 0.7)
    finish(a, 0, "Cedarheart Forest", "West")


@reg("north", 1, "Scroll: Galewing Peaks", "Twin flight backdrop for the North: needle peaks fading into paper and three drifting sky-cities, "
     "rock hanging in cloud with towers and torn sails; the one colour is the pale blue of cold cloud light.")
def north(a, w, acc):
    r = a.rng
    a.rect(0, 0, W, 420, fill=w.fade(0.5, True, kit.shade(acc, -0.1)))
    w.range(520, 150, 0.15, 10, peak=1.2, period=150)
    w.range(620, 170, 0.26, 4, peak=1.4, period=110, cun=40)
    w.mist(560, 0.8)
    w.range(760, 150, 0.5, 1.5, peak=1.3, period=170, cun=90)

    def city(cx, cy, s, op):
        # hanging rock: wide top, dry strokes trailing down
        rock = [(cx - 150 * s, cy), (cx - 90 * s, cy + 70 * s), (cx - 20 * s, cy + 190 * s), (cx + 40 * s, cy + 90 * s), (cx + 150 * s, cy + 8 * s)]
        a.path(a.smooth_d(rock) + "Z", fill=INKC, opacity=op, filter=w.b[1.5])
        for _ in range(int(26 * s)):
            x = cx + r.uniform(-120, 120) * s
            a.line(x, cy + r.uniform(20, 90) * s, x + r.uniform(-6, 6), cy + r.uniform(110, 240) * s, stroke=INKC,
                   stroke_width=r.uniform(0.6, 2), opacity=op * 0.5)
        # towers
        for k in range(int(5 + 3 * s)):
            x = cx + (-120 + k * 240 / (4 + 3 * s)) * s + r.uniform(-8, 8)
            hgt = r.uniform(50, 150) * s
            wd = r.uniform(12, 22) * s
            a.path(f"M{f(x - wd / 2)},{f(cy + 6)} V{f(cy - hgt)} L{f(x)},{f(cy - hgt - wd * 1.6)} L{f(x + wd / 2)},{f(cy - hgt)} V{f(cy + 6)}Z",
                   fill=INKC, opacity=min(1, op + 0.12))
            if k % 2 == 0:   # a sail, torn
                a.path(f"M{f(x)},{f(cy - hgt * 0.9)} q{f(40 * s)},{f(8 * s)} {f(70 * s)},{f(-10 * s)} q{f(-30 * s)},{f(26 * s)} {f(-70 * s)},{f(40 * s)}Z",
                       fill=kit.shade(acc, -0.3), opacity=0.7)
        a.ellipse(cx, cy + 16 * s, 220 * s, 22 * s, fill=kit.SILK, opacity=0.8, filter=w.b[10])

    city(1180, 300, 0.7, 0.4)
    city(520, 250, 1.0, 0.7)
    city(1420, 520, 0.5, 0.3)
    # wind: long dry streaks
    for k in range(16):
        y = r.uniform(120, 640)
        x = r.uniform(0, W - 400)
        kit.brush(a, [(x, y), (x + 180, y - 10 + r.uniform(-6, 6)), (x + 380, y + r.uniform(-14, 14))], r.uniform(2, 6), fill=kit.shade(acc, -0.35), opacity=r.uniform(0.2, 0.5))
    # near crag, lower right
    crag = [(W + 20, 520), (1500, 560), (1440, 680), (1330, 760), (1280, H + 20), (W + 20, H + 20)]
    a.path(a.smooth_d(crag) + "Z", fill="#121113", opacity=0.92, filter=w.b[1.5])
    w.mist(840, 0.7)
    finish(a, 1, "Galewing Peaks", "North")


@reg("south", 2, "Scroll: Mosswhisper Depths", "Twin flight backdrop for the South: a cavern in ink wash, stalactites above and broken floor "
     "below, strata in dry-brush lines, crystal clusters left as bare silk, and one molten seam glowing orange along the rock.")
def south(a, w, acc):
    r = a.rng
    a.rect(0, 0, W, H, fill=INKC, opacity=0.2)
    a.ellipse(800, 880, 1000, 200, fill=acc, opacity=0.35, filter=w.b[22])
    # far galleries
    for base, op in ((300, 0.16), (380, 0.24)):
        pts = kit.ridge(r, -40, W + 40, base, 90, 0.6, 6)
        a.path(kit.pd(pts, False) + f" L{W + 40},-40 L-40,-40Z", fill=INKC, opacity=op, filter=w.b[10])
    for base, op in ((640, 0.18), (700, 0.3)):
        pts = kit.ridge(r, -40, W + 40, base, 80, 0.6, 6)
        a.path(kit.pd(pts, False) + f" L{W + 40},{H + 40} L-40,{H + 40}Z", fill=INKC, opacity=op, filter=w.b[10])
    # strata lines across the back wall
    d = []
    for k in range(34):
        y = 260 + k * 14 + r.uniform(-4, 4)
        x = r.uniform(0, 900)
        d.append(f"M{f(x)},{f(y)} q{f(r.uniform(120, 300))},{f(r.uniform(-18, 18))} {f(r.uniform(300, 700))},{f(r.uniform(-10, 10))}")
    a.path("".join(d), fill="none", stroke=INKC, stroke_width=1.1, opacity=0.22)
    # ceiling with stalactites
    top = kit.ridge(r, -40, W + 40, 150, 50, 0.6, 6)
    a.path(kit.pd(top, False) + f" L{W + 40},-40 L-40,-40Z", fill="#121113", opacity=0.92, filter=w.b[1.5])
    for _ in range(30):
        x, y = top[r.randrange(len(top))]
        L = r.uniform(40, 230)
        wd = L * r.uniform(0.12, 0.22)
        a.path(f"M{f(x - wd)},{f(y - 6)} Q{f(x)},{f(y + L * 0.5)} {f(x + r.uniform(-4, 4))},{f(y + L)} Q{f(x + wd * .4)},{f(y + L * 0.4)} {f(x + wd)},{f(y - 6)}Z",
               fill="#121113", opacity=r.uniform(0.6, 0.95))
    # floor with stalagmites
    floor = kit.ridge(r, -40, W + 40, 790, 44, 0.6, 6)
    for _ in range(18):
        x, y = floor[r.randrange(len(floor))]
        L = r.uniform(30, 150)
        wd = L * r.uniform(0.16, 0.3)
        a.path(f"M{f(x - wd)},{f(y + 8)} Q{f(x - wd * .3)},{f(y - L * 0.5)} {f(x)},{f(y - L)} Q{f(x + wd * .5)},{f(y - L * 0.4)} {f(x + wd)},{f(y + 8)}Z",
               fill="#121113", opacity=r.uniform(0.6, 0.95))
    a.path(kit.pd(floor, False) + f" L{W + 40},{H + 40} L-40,{H + 40}Z", fill="#121113", opacity=0.94, filter=w.b[1.5])
    # the molten seam
    seam = [(x, y + 34 + 10 * math.sin(x / 70)) for x, y in floor[::6]]
    a.path(a.smooth_d(seam), fill="none", stroke=acc, stroke_width=14, opacity=0.5, filter=w.b[4], stroke_linecap="round")
    a.path(a.smooth_d(seam), fill="none", stroke=kit.shade(acc, 0.35), stroke_width=2.4, stroke_dasharray="60 14 20 10", stroke_linecap="round")
    # crystal clusters: silk shards with one ink edge
    for cx, cy, s in ((330, 770, 1.3), (980, 800, 1.0), (1330, 760, 1.5), (640, 180, -1.0), (1180, 170, -1.2)):
        a.circle(cx, cy - 40 * s, 120, fill=kit.SILK, opacity=0.25, filter=w.b[22])
        for k in range(7):
            an = math.radians(-90 + (k - 3) * 17 + r.uniform(-6, 6))
            L = r.uniform(50, 120) * abs(s)
            wd = r.uniform(8, 16) * abs(s)
            tx, ty = cx + L * math.cos(an), cy + L * math.sin(an) * (1 if s > 0 else -1)
            nx, ny = -math.sin(an) * wd, math.cos(an) * wd * (1 if s > 0 else -1)
            bx, by = cx + (k - 3) * 9, cy
            a.poly([(bx - nx, by - ny), (tx - nx * .5, ty - ny * .5 + 8), (tx, ty), (bx + nx, by + ny)], fill=kit.SILK, opacity=0.9,
                   stroke=INKC, stroke_width=1.4)
            a.poly([(bx, by), (tx, ty), (bx + nx, by + ny)], fill=kit.mix(kit.SILK, acc, 0.35), opacity=0.8)
    finish(a, 2, "Mosswhisper Depths", "South")


@reg("east", 3, "Scroll: Tidecaller Shores", "Twin flight backdrop for the East, under water: the surface a brushed line near the top with light "
     "falling through it, kelp rising from the seabed, moonfish, and far to the right the dark slab of the monolith; one sea-blue wash.")
def east(a, w, acc):
    r = a.rng
    a.rect(0, 150, W, H - 150, fill=acc, opacity=0.22)
    a.rect(0, 420, W, 480, fill=w.fade(0.42, False, kit.shade(acc, -0.55)))
    # light shafts
    for k in range(9):
        x = 100 + k * 180 + r.uniform(-50, 50)
        wd = r.uniform(30, 90)
        a.poly([(x, 150), (x + wd, 150), (x + wd - 260, 900), (x - 300, 900)], fill=kit.SILK, opacity=r.uniform(0.12, 0.3), filter=w.b[10])
    # surface
    surf = [(x, 150 + 14 * math.sin(x / 90) + r.uniform(-5, 5)) for x in range(-40, W + 80, 60)]
    kit.brush(a, surf, 16, lambda t: 0.7 + 0.3 * math.sin(t * 40), fill=kit.shade(acc, -0.5), opacity=0.85)
    for k in range(3):
        a.path(a.smooth_d([(x + 30, y + 22 + k * 18) for x, y in surf]), fill="none", stroke=kit.shade(acc, -0.4), stroke_width=1.2,
               stroke_dasharray=f"{50 - k * 10} {26 + k * 12}", opacity=0.5 - k * 0.1)
    # the oil-still sky above the water: a few gull-less strokes and a low moon
    a.circle(360, 84, 34, fill="none", stroke=INKC, stroke_width=1.5, opacity=0.5)
    a.circle(360, 84, 34, fill=kit.SILK, opacity=0.7)
    # far seabed and the monolith
    w.range(700, 70, 0.22, 10)
    mx = 1290
    a.path(f"M{mx - 44},{790} L{mx - 36},{330} L{mx + 2},{300} L{mx + 40},{336} L{mx + 50},{790}Z", fill="#121113", opacity=0.82, filter=w.b[1.5])
    d = []
    for row in range(4):
        for col in range(4):
            gx, gy = mx - 26 + col * 17, 380 + row * 60
            d.append(f"M{gx},{gy} v{f(r.uniform(14, 26))} M{gx - 5},{gy + 6} h{f(r.uniform(6, 12))}")
    a.path("".join(d), fill="none", stroke=kit.SILK, stroke_width=2, opacity=0.5)
    a.circle(mx, 520, 150, fill=kit.SILK, opacity=0.14, filter=w.b[22])
    # kelp
    for k in range(17):
        x = 50 + k * 96 + r.uniform(-36, 36)
        if abs(x - mx) < 90:
            continue
        hgt = r.uniform(260, 600)
        op = r.uniform(0.35, 0.9)
        pts = [(x + 26 * math.sin(i * 1.1 + k), 900 - i * hgt / 6) for i in range(7)]
        kit.brush(a, pts, r.uniform(8, 16), lambda t: 1 - 0.8 * t, fill=INKC, opacity=op)
        c = kit.catmull(pts, 4)
        for i in range(2, len(c) - 1, 3):
            bx, by = c[i]
            sd = 1 if (i // 3) % 2 else -1
            a.path(f"M{f(bx)},{f(by)} q{f(sd * 30)},{f(-26)} {f(sd * 44)},{f(-64)} q{f(-sd * 26)},{f(22)} {f(-sd * 44)},{f(64)}Z", fill=INKC, opacity=op * 0.8)
    # moonfish: round, silver, left as silk
    for _ in range(11):
        px, py = r.uniform(150, 1150), r.uniform(280, 660)
        s = r.uniform(7, 15)
        a.ellipse(px, py, s * 1.3, s, fill=kit.SILK, stroke=INKC, stroke_width=1.3, opacity=0.95)
        a.path(f"M{f(px - s * 1.3)},{f(py)} l{f(-s)},{f(-s * .7)} v{f(s * 1.4)}z", fill=kit.SILK, stroke=INKC, stroke_width=1.1)
        a.circle(px + s * 0.6, py - s * 0.2, 1.4, fill=INKC)
    # seabed
    bed = kit.ridge(r, -40, W + 40, 842, 24, 0.6, 6)
    a.path(kit.pd(bed, False) + f" L{W + 40},{H + 40} L-40,{H + 40}Z", fill="#121113", opacity=0.92, filter=w.b[1.5])
    a.stipple(0, 300, W, 500, n=160, r=(1, 3), fill=kit.SILK, opacity=0.5)
    finish(a, 3, "Tidecaller Shores", "East")


@reg("below", 4, "Scroll: Duskbane Underworld", "Twin flight backdrop for Below: labyrinth halls in heavy ink, arcades of pillars receding, "
     "torch-pools and skylight shafts left pale as the only light, their edges tinged violet; shadow to blink between.")
def below(a, w, acc):
    r = a.rng
    a.rect(0, 0, W, H, fill=INKC, opacity=0.62)
    a.rect(0, 0, W, H, fill=acc, opacity=0.12)
    # skylight shafts
    for x, wd in ((330, 120), (840, 80), (1250, 150)):
        a.poly([(x, 0), (x + wd, 0), (x + wd + 190, H), (x - 60, H)], fill=kit.SILK, opacity=0.5, filter=w.b[22])
        a.poly([(x + wd * .3, 0), (x + wd * .7, 0), (x + wd * .7 + 130, H), (x + 30, H)], fill=kit.SILK, opacity=0.4, filter=w.b[10])
    # far arcade
    for row, (y0, y1, n, op, wd) in enumerate(((250, 700, 15, 0.3, 26), (170, 780, 9, 0.55, 46))):
        step = (W + 200) / n
        for k in range(n + 1):
            x = -100 + k * step + (step / 2 if row else 0)
            a.rect(x - wd / 2, y0, wd, y1 - y0, fill=INKC, opacity=op, filter=w.b[1.5])
            a.path(f"M{f(x + wd / 2)},{f(y0 + 60)} Q{f(x + step / 2)},{f(y0 - 90)} {f(x + step - wd / 2)},{f(y0 + 60)} V{f(y0 - 120)} H{f(x + wd / 2)}Z",
                   fill=INKC, opacity=op, filter=w.b[1.5])
            a.rect(x - wd * 0.8, y1 - 24, wd * 1.6, 24, fill=INKC, opacity=op)
    # torches: pale pools the dark swallows
    for x, y in ((180, 470), (600, 500), (1030, 460), (1460, 510)):
        a.circle(x, y, 96, fill=kit.SILK, opacity=0.55, filter=w.b[22])
        a.circle(x, y, 120, fill="none", stroke=acc, stroke_width=10, opacity=0.4, filter=w.b[10])
        a.path(f"M{x},{y + 10} q-12,-22 0,-44 q12,22 0,44z", fill=kit.SILK, stroke=INKC, stroke_width=1.5)
        a.line(x, y + 10, x, y + 70, stroke=INKC, stroke_width=5)
    # ceiling vault and floor, near black
    top = kit.ridge(r, -40, W + 40, 90, 30, 0.5, 6)
    a.path(kit.pd(top, False) + f" L{W + 40},-40 L-40,-40Z", fill="#0f0e11", opacity=0.96, filter=w.b[4])
    a.rect(0, 800, W, 100, fill="#0f0e11", opacity=0.96)
    d = []
    for k in range(40):   # flagstones
        x = k * 42 + r.uniform(-6, 6)
        d.append(f"M{f(x)},800 l{f((x - 800) * 0.12)},100")
    a.path("".join(d) + "M0,832 H1600 M0,868 H1600", fill="none", stroke=kit.SILK, stroke_width=1, opacity=0.14)
    # near pillar and a hanging chain
    a.rect(1010, -10, 150, 920, fill="#0f0e11", opacity=0.97)
    a.rect(986, 700, 198, 210, fill="#0f0e11")
    a.path("M1020,60 q16,300 -4,640 M1150,40 q-12,330 6,690", fill="none", stroke=kit.SILK, stroke_width=1.2, opacity=0.18)
    a.path("M700,60 " + "".join(f"q{6 if k % 2 else -6},10 0,20 " for k in range(13)), fill="none", stroke=INKC, stroke_width=3)
    a.path("M688,320 h24 l8,34 h-40z", fill=INKC)
    a.circle(700, 346, 60, fill=acc, opacity=0.4, filter=w.b[10])
    finish(a, 4, "Duskbane Underworld", "Below")


@reg("above", 5, "Scroll: the High Realm", "Twin flight backdrop for Above: the star-lit Priory's spires and domes over a forest of crystalline "
     "trees, the sky a dark wash pricked with gold stars, sun and moon facing each other in star gold and bare silk.")
def above(a, w, acc):
    r = a.rng
    a.rect(0, 0, W, 620, fill=w.fade(0.72, True, "#14152a"))
    gold = kit.shade(acc, -0.12)
    a.stipple(0, 0, W, 520, n=420, r=(0.7, 2.2), fill=gold, opacity=0.9, density=lambda x, y: 1 - y / 560)
    for _ in range(16):
        x, y, s = r.uniform(40, W - 140), r.uniform(30, 380), r.uniform(6, 13)
        a.poly(a.star_pts(x, y, s, s * 0.25, n=4), fill=gold)
    # sun and moon
    a.circle(300, 200, 110, fill=acc, opacity=0.5, filter=w.b[10])
    a.circle(300, 200, 62, fill=gold)
    a.circle(1240, 170, 60, fill=kit.SILK)
    a.circle(1262, 158, 54, fill="#3a394a", opacity=0.75)
    w.range(640, 90, 0.2, 10, peak=0.8, period=200)
    w.mist(650, 0.7)
    # the Priory: spires and domes
    px = 780
    for k, (dx, hgt, wd) in enumerate(((-250, 250, 34), (-170, 380, 40), (-90, 300, 50), (0, 520, 64), (96, 340, 46), (180, 420, 38), (262, 230, 30))):
        x, base = px + dx, 760
        op = 0.82 if abs(dx) < 200 else 0.6
        a.rect(x - wd / 2, base - hgt, wd, hgt, fill=INKC, opacity=op)
        if k % 2:
            a.path(f"M{f(x - wd * .7)},{f(base - hgt)} Q{f(x - wd * .7)},{f(base - hgt - wd)} {f(x)},{f(base - hgt - wd * 1.5)} Q{f(x + wd * .7)},{f(base - hgt - wd)} {f(x + wd * .7)},{f(base - hgt)}Z",
                   fill=INKC, opacity=op)
        else:
            a.path(f"M{f(x - wd * .6)},{f(base - hgt)} L{f(x)},{f(base - hgt - wd * 2.6)} L{f(x + wd * .6)},{f(base - hgt)}Z", fill=INKC, opacity=op)
        a.line(x, base - hgt - wd * 1.5, x, base - hgt - wd * 3.2, stroke=INKC, stroke_width=2)
        for j in range(int(hgt / 60)):   # lit windows
            a.rect(x - 3, base - hgt + 20 + j * 56, 6, 18, fill=gold, opacity=0.9)
    a.path(f"M{px - 300},760 Q{px},700 {px + 310},760 V790 H{px - 300}Z", fill=INKC, opacity=0.85)

    def ctree(x, y, L, an, depth, op):
        x2, y2 = x + L * math.cos(an), y + L * math.sin(an)
        a.line(x, y, x2, y2, stroke=INKC, stroke_width=max(1, depth * 1.6), opacity=op, stroke_linecap="round")
        if depth == 0:
            a.poly(a.star_pts(x2, y2, 7, 2, n=4), fill=gold, opacity=0.9)
            return
        for sd in (-1, 1):
            ctree(x2, y2, L * 0.68, an + sd * math.radians(r.choice((30, 60))), depth - 1, op)

    for x in (120, 330, 1210, 1400, 1530):
        ctree(x, 860, r.uniform(90, 140), -math.pi / 2, 4, r.uniform(0.6, 0.9))
    floor = kit.ridge(r, -40, W + 40, 846, 18, 0.5, 6)
    a.path(kit.pd(floor, False) + f" L{W + 40},{H + 40} L-40,{H + 40}Z", fill="#121113", opacity=0.92)
    w.mist(800, 0.5)
    finish(a, 5, "The High Realm", "Above")


@asset(G, "scroll-chasm", group="backdrops", title="Scroll: the chasm of Wrymreach", w=W, h=H, row=ROW)
def chasm(a: Art):
    """Twin flight backdrop for the Ghost-fire descent: the chasm walls in black ink with the ribs of ancient wyrms arching out
    of them, and six bands of ghost-fire, one in each realm's colour, stepping down toward a violet-white light at the bottom."""
    kit.silk(a, kit.VIOLET)
    w = Wash(a)
    r = a.rng
    a.rect(0, 0, W, H, fill=INKC, opacity=0.5)
    a.ellipse(800, 930, 520, 300, fill="#d9c8ff", opacity=0.8, filter=w.b[22])
    a.ellipse(800, 900, 900, 420, fill=kit.VIOLET, opacity=0.35, filter=w.b[22])
    # six ghost-fire bands, one per dragon
    for k, realm in enumerate(kit.REALMS):
        y = 130 + k * 118
        pts = [(x, y + 16 * math.sin(x / 130 + k * 1.7) + r.uniform(-6, 6)) for x in range(-40, W + 80, 80)]
        a.path(kit.pd(kit.brush_poly(a, pts, 54, lambda t: 0.5 + 0.5 * math.sin(math.pi * t))), fill=realm["acc"], opacity=0.42, filter=w.b[10])
        a.path(a.smooth_d(pts), fill="none", stroke=kit.shade(realm["acc"], 0.4), stroke_width=1.6, stroke_dasharray="70 30 14 30", opacity=0.8)
    # walls
    for sd in (0, 1):
        edge = kit.ridge(r, 0, H, 0, 70, 0.62, 6)
        base = 330 if sd == 0 else W - 330
        wall = [((base + (e if sd == 0 else -e) + (1 if sd == 0 else -1) * (-120 + 150 * (yy / H) ** 1.6)), yy) for yy, e in edge]
        outer = -60 if sd == 0 else W + 60
        d = kit.pd(wall, False) + f" L{outer},{H + 20} L{outer},-20Z"
        a.path(d, fill="#0f0e11", opacity=0.6, filter=w.b[10])
        a.path(d, fill="#0f0e11", opacity=0.95, transform=f"translate({-46 if sd == 0 else 46},0)")
        dd = []
        for _ in range(90):   # dry strokes down the rock
            x, y = wall[r.randrange(len(wall))]
            x += (-1 if sd == 0 else 1) * r.uniform(50, 300)
            dd.append(f"M{f(x)},{f(y)} q{f(r.uniform(-10, 10))},{f(r.uniform(20, 60))} {f(r.uniform(-8, 8))},{f(r.uniform(60, 130))}")
        a.path("".join(dd), fill="none", stroke=kit.SILK, stroke_width=1.2, opacity=0.14)
        # wyrm ribs arching out of the wall: bone left as bare silk
        for k in range(5):
            y = 170 + k * 150 + r.uniform(-20, 20)
            x0 = base - 20 if sd == 0 else base + 20
            reach = (300 - k * 26) * (1 if sd == 0 else -1)
            rib = [(x0 - reach * 0.2, y + 40), (x0 + reach * 0.35, y - 44), (x0 + reach * 0.85, y - 10), (x0 + reach, y + 90)]
            a.path(kit.pd(kit.brush_poly(a, rib, 30 - k * 2, lambda t: 1 - 0.8 * t)), fill=kit.SILK, stroke=INKC, stroke_width=1.6, opacity=0.95)
            a.path(a.smooth_d([(x, yy + 5) for x, yy in rib[:3]]), fill="none", stroke=INKC, stroke_width=1, opacity=0.5, stroke_dasharray="18 9")
    # a spine across the top, vertebra by vertebra
    for k in range(24):
        x = 360 + k * 38
        y = 46 + 16 * math.sin(k / 3.2)
        a.path(f"M{f(x - 13)},{f(y - 9)} q13,-9 26,0 l3,18 q-16,9 -32,0z", fill=kit.SILK, stroke=INKC, stroke_width=1.4, opacity=0.92)
        a.line(x, y - 12, x, y - 34 + 8 * math.sin(k), stroke=kit.SILK, stroke_width=4, stroke_linecap="round", opacity=0.85)
    a.rect(0, 0, W, H, fill="none", stroke="#8c6f45", stroke_width=10)
    a.text(W - 60, 70, "WRYMREACH", size=22, family="serif", fill=kit.SILK, letter_spacing=6, transform=f"rotate(90 {W - 60} 70)")
    a.text(W - 86, 70, "the Ghost-fire descent", size=16, family="serif", font_style="italic", fill=kit.SILK, opacity=0.8, transform=f"rotate(90 {W - 86} 70)")

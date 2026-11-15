"""The eye at the hole: plate overlays (night variants) and the six gap strips. Fisheye gouache: opaque
paint, no line, one colour of light per room."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW_O = "Plate overlays (case, towel, banner, boats, pinned pictures)"
ROW_G = "Gap strips"
W, H = 640, 480


class Paint:
    """A gouache study: a rough-edged patch of a room, lit by that room's lamp."""

    def __init__(self, a, room, surface="#5a3a1e", horizon=300, wall=True, pool=(0.5, 0.45)):
        self.a, self.room = a, room
        self.lamp = kit.ROOMS[room][1]
        self.rough = a.roughen(5, 0.05)
        self.soft = a.roughen(2.2, 0.08)
        r = a.rng
        blob = []
        for i in range(26):
            t = 2 * math.pi * i / 26
            k = 1 + r.uniform(-0.05, 0.05)
            sx = abs(math.cos(t)) ** 0.55 * (1 if math.cos(t) >= 0 else -1)
            sy = abs(math.sin(t)) ** 0.55 * (1 if math.sin(t) >= 0 else -1)
            blob.append((W / 2 + sx * (W / 2 - 22) * k, H / 2 + sy * (H / 2 - 20) * k))
        cid = a.clip(f'<path d="{a.smooth_d(blob, closed=True)}"/>')
        a.open("g", clip_path=cid)
        if wall:
            kit.wallpaper(a, 0, 0, W, horizon)
            a.rect(0, horizon - 14, W, 14, fill="#3a2716")
        a.rect(0, horizon, W, H - horizon, fill=surface)
        self.horizon = horizon
        self.pool = pool

    def light(self, strength=0.5, r=0.55):
        a = self.a
        a.rect(0, 0, W, H, fill=a.radial([(0, self.lamp, strength), (0.5, self.lamp, strength * 0.35), (1, self.lamp, 0)],
                                         cx=self.pool[0], cy=self.pool[1], r=r))

    def p(self, pts, col, soft=False, **kw):
        self.a.poly(pts, fill=col, filter=self.soft if soft else self.rough, **kw)

    def e(self, cx, cy, rx, ry, col, **kw):
        self.a.ellipse(cx, cy, rx, ry, fill=col, filter=self.soft, **kw)

    def end(self, dark=0.55):
        a = self.a
        a.rect(0, 0, W, H, fill=a.radial([(0, "#000", 0), (0.6, "#000", 0.1), (1, "#000", dark)], r=0.72))
        a.close()

    def tag(self, s):
        self.a.text(W / 2, H - 6, s, size=12, family="monospace", fill="#d9cdaf", text_anchor="middle", letter_spacing=2,
                    opacity=0.75)


def overlay(key, room, title):
    def deco(fn):
        @asset(G, f"overlay-{room}-{key}", group="backdrops", title=f"Plate overlay, {room}: {title}", w=W, h=H, row=ROW_O)
        def draw(a: Art):
            fn(a)
        draw.__doc__ = fn.__doc__
        return draw
    return deco


@overlay("case", 403, "the case that was not there yesterday")
def case_closed(a):
    """Gouache overlay for room 403 from night three: a flat hard case, wider than the chair it leans on,
    stood against the bottle-green wall under the north-light bulb."""
    s = Paint(a, 403, surface="#6d4526", horizon=330)
    kit.dabs(a, 0, 330, W, 150, ["#8f5a2c", "#5a3418"], n=90, angle=0)
    s.light(0.42)
    a.ellipse(330, 372, 230, 26, fill="#000", opacity=0.45, filter=a.blur(10))
    c = kit.rot(kit.box(140, 92, 360, 276), 320, 230, -4)
    s.p(c, "#2d2119")
    s.p(kit.rot(kit.box(152, 104, 336, 252), 320, 230, -4), "#3b2a1c")
    s.p(kit.rot(kit.box(152, 104, 336, 40), 320, 230, -4), "#4d3826", opacity=0.9)
    for cx, cy in [(148, 100), (492, 100), (148, 360), (492, 360)]:
        (x, y), = kit.rot([(cx, cy)], 320, 230, -4)
        s.e(x, y, 17, 17, kit.BRASS)
    for lx in (236, 404):
        (x, y), = kit.rot([(lx, 98)], 320, 230, -4)
        s.p(kit.box(x - 16, y - 6, 32, 18), kit.BRASS_L)
    (hx, hy), = kit.rot([(320, 82)], 320, 230, -4)
    a.path(f"M{f(hx - 46)},{f(hy + 8)} Q{f(hx)},{f(hy - 34)} {f(hx + 46)},{f(hy + 2)}", fill="none", stroke="#1c140e", stroke_width=11,
           stroke_linecap="round", filter=s.soft)
    kit.dabs(a, 150, 110, 340, 250, ["#4d3826", "#241a13", "#5a4430"], n=70, angle=-0.07, op=0.4)
    s.p([(60, 330), (120, 330), (128, 480), (40, 480)], "#3a2415")  # chair leg, near
    s.end()


@overlay("case-open", 403, "the backing peeled")
def case_open(a):
    """Gouache overlay for room 403 on night four: the case open on the bedspread, the small dark oil of a
    woman holding a candle to a door, and ledger pages folded out of its backing."""
    s = Paint(a, 403, surface="#d5c6a2", horizon=150)
    kit.dabs(a, 0, 150, W, 330, ["#e6dabb", "#bfae88", "#cbbb96"], n=160, angle=0.15, L=(8, 22), width=6)
    s.light(0.4)
    s.p([(70, 190), (560, 170), (590, 430), (50, 440)], "#2d2119")
    s.p([(88, 204), (544, 186), (570, 416), (70, 424)], "#5b2f2a")  # lining
    # the painting, face up
    s.p([(130, 222), (330, 214), (338, 388), (126, 394)], "#4a3520")
    s.p([(144, 234), (318, 228), (324, 376), (140, 380)], "#17120e", soft=True)
    s.p([(250, 246), (300, 244), (304, 370), (252, 372)], "#2a2016", soft=True)      # the door in the picture
    s.p([(196, 290), (228, 286), (238, 374), (184, 376)], "#3b2c24", soft=True)      # the woman
    s.e(212, 276, 12, 14, "#8a6a4e")
    a.circle(246, 300, 22, fill=a.radial([(0, "#fff0b8", 0.95), (0.3, kit.AMBER_L, 0.6), (1, kit.AMBER, 0)]))
    s.e(246, 300, 3, 6, "#fff6d8")
    # the peeled backing and the folded pages
    s.p([(360, 216), (532, 206), (548, 380), (372, 392)], "#8a7350")
    s.p([(360, 216), (440, 212), (398, 300), (364, 304)], "#b29a70")
    for i, (dx, dy, dg) in enumerate([(0, 0, -5), (18, 26, 4), (40, 58, -2)]):
        pg = kit.rot(kit.box(410 + dx, 232 + dy, 120, 88), 470 + dx, 276 + dy, dg)
        s.p(pg, "#efe6cf" if i else "#e4d8ba", soft=True)
        for k in range(5):
            q = kit.rot([(420 + dx, 246 + dy + k * 14), (518 + dx, 246 + dy + k * 14)], 470 + dx, 276 + dy, dg)
            a.line(*q[0], *q[1], stroke="#3b4a86", stroke_width=2.2, opacity=0.5, stroke_dasharray="14 5 22 4 8 6")
    # white cotton glove left on the lid edge
    s.p([(80, 150), (150, 140), (170, 178), (150, 196), (96, 200)], "#f1ede2", soft=True)
    for k in range(4):
        s.p([(98 + k * 15, 120 + abs(k - 1.5) * 5), (110 + k * 15, 120 + abs(k - 1.5) * 5), (112 + k * 15, 158), (96 + k * 15, 158)], "#f1ede2", soft=True)
    s.end()


@overlay("towel", 406, "terry cloth over the rose")
def towel(a):
    """Gouache overlay for a blind lens: terry cloth hung over the brass rose, too near to focus, its loops
    lit from behind by the red-shaded bedside lamp."""
    r = a.rng
    s = Paint(a, 406, surface="#e9e2d2", horizon=0, wall=False)
    a.rect(0, 0, W, H, fill="#e3dccb")
    pid = a.uid("terry")
    a.defn(f'<pattern id="{pid}" width="14" height="12" patternUnits="userSpaceOnUse">'
           '<path d="M1,9 q3,-9 6,0 M8,4 q3,-9 6,0" fill="none" stroke="#9c8f74" stroke-width="2" stroke-linecap="round"/>'
           '<path d="M2,10 q3,-9 6,0" fill="none" stroke="#fffaf0" stroke-width="1" stroke-linecap="round" opacity="0.8"/></pattern>')
    a.rect(0, 0, W, H, fill=f"url(#{pid})")
    for x in (120, 290, 470):   # folds
        w_ = r.uniform(50, 90)
        a.rect(x, 0, w_, H, fill=a.gradient([(0, "#000"), (0.5, "#7a6a55"), (1, "#fff")], x1=0, y1=0, x2=1, y2=0), opacity=0.22)
    a.circle(320, 250, 74, fill=a.radial([(0, "#fff", 0.5), (0.7, "#fff", 0.1), (1, "#5a4a3a", 0.35)]))   # the rose pressing through
    a.circle(320, 250, 74, fill="none", stroke="#7a6a55", stroke_width=5, opacity=0.25, filter=a.blur(4))
    a.rect(0, 60, W, 26, fill="#a9b4b6", opacity=0.55)   # the hotel's woven stripe
    a.rect(0, 96, W, 6, fill="#a9b4b6", opacity=0.55)
    s.light(0.5, r=0.6)
    s.end(0.75)


@overlay("banner-sewn", 406, "one letter a night")
def banner_sewn(a):
    """Gouache overlay for room 406: the banner folded on the bed so that only the edges of its sewn letters
    show, a needle and blue thread left in the newest one."""
    s = Paint(a, 406, surface="#7c8d6a", horizon=120)
    kit.dabs(a, 0, 120, W, 360, ["#8c9c78", "#66775a"], n=140, angle=0.1, L=(8, 20), width=6)
    s.light(0.45)
    a.ellipse(330, 390, 250, 30, fill="#000", opacity=0.35, filter=a.blur(10))
    for i in range(4):   # folded layers
        y = 190 + i * 44
        s.p([(90 - i * 6, y), (560 + i * 5, y - 14), (566 + i * 5, y + 48), (86 - i * 6, y + 62)], ["#f3efe2", "#e2dccb", "#f3efe2", "#d9d2c0"][i])
    # letter edges: cut cloth, never a whole word
    blue = "#28457a"
    s.p([(130, 196), (176, 192), (182, 232), (160, 234), (150, 212), (136, 236)], blue, soft=True)
    s.p([(230, 190), (262, 188), (266, 230), (236, 232)], blue, soft=True)
    s.p([(330, 186), (400, 182), (402, 198), (378, 200), (380, 228), (352, 230), (350, 202), (330, 204)], blue, soft=True)
    s.p([(470, 180), (520, 178), (524, 196), (494, 198), (496, 226), (472, 228)], blue, soft=True)
    a.path("M130,196 L176,192 L182,232 M330,186 L400,182 M470,180 L520,178", fill="none", stroke="#f3efe2", stroke_width=1.6,
           stroke_dasharray="5 4", opacity=0.9)
    # needle and thread
    a.path("M496,226 C520,270 440,300 470,340 S560,360 540,400", fill="none", stroke=blue, stroke_width=2.4)
    a.line(488, 204, 540, 150, stroke="#d8dadb", stroke_width=3.2, stroke_linecap="round")
    a.circle(538, 152, 2, fill="#28457a")
    s.end()


@overlay("banner-rolled", 406, "rolled and tied")
def banner_rolled(a):
    """Gouache overlay for room 406 on night six: the banner rolled and tied with the blue rope, leaning in
    the corner by the sill with the red-shaded lamp behind it."""
    s = Paint(a, 406, surface="#6d4526", horizon=360, pool=(0.72, 0.3))
    s.light(0.55)
    # lamp with red shade
    s.p([(430, 150), (540, 150), (520, 70), (450, 70)], "#b5483c")
    s.p([(480, 150), (492, 150), (492, 250), (480, 250)], kit.BRASS)
    s.p([(380, 250), (640, 250), (640, 270), (380, 270)], "#4a2f18")
    a.circle(486, 150, 120, fill=a.radial([(0, "#ffd9c0", 0.6), (1, kit.ROOMS[406][1], 0)]))
    roll = kit.rot(kit.box(210, 40, 74, 360), 247, 220, 9)
    a.ellipse(260, 400, 110, 18, fill="#000", opacity=0.45, filter=a.blur(8))
    s.p(roll, "#eee8d8")
    s.p(kit.rot(kit.box(210, 40, 22, 360), 247, 220, 9), "#fffdf4", opacity=0.8)
    s.p(kit.rot(kit.box(262, 40, 22, 360), 247, 220, 9), "#b9b09a", opacity=0.9)
    (tx, ty), = kit.rot([(247, 40)], 247, 220, 9)
    s.e(tx, ty, 37, 12, "#cfc7b2")
    a.path(f"M{f(tx - 20)},{f(ty)} a20,6 0 1,0 40,0 a12,4 0 1,0 -24,0", fill="none", stroke="#8a826e", stroke_width=2)
    for yy in (130, 300):
        q = kit.rot([(206, yy), (288, yy + 4)], 247, 220, 9)
        for k in range(3):
            a.line(q[0][0], q[0][1] + k * 7, q[1][0], q[1][1] + k * 7, stroke="#2b56a0", stroke_width=5.5, stroke_linecap="round")
    a.path("M262,304 q40,30 20,70 q-12,20 16,34", fill="none", stroke="#2b56a0", stroke_width=5.5, stroke_linecap="round")
    s.end()


def _boat(s, x, y, k, col="#f3efe2", sh="#c9c2b0"):
    s.p([(x - 40 * k, y), (x + 40 * k, y), (x + 24 * k, y + 20 * k), (x - 24 * k, y + 20 * k)], col, soft=True)
    s.p([(x, y - 34 * k), (x + 22 * k, y), (x - 20 * k, y)], col, soft=True)
    s.p([(x, y - 34 * k), (x + 22 * k, y), (x, y)], sh, soft=True)
    s.p([(x - 24 * k, y + 20 * k), (x + 24 * k, y + 20 * k), (x + 30 * k, y + 12 * k), (x - 30 * k, y + 12 * k)], sh, soft=True, opacity=0.6)


def _boats(n, night):
    @overlay(f"boats-{n}", 406, f"{n} paper boat{'s' if n > 1 else ''} on the sill")
    def boats(a):
        s = Paint(a, 406, surface="#4a3420", horizon=300, wall=False, pool=(0.2, 0.75))
        # the window: river-grey night, a far bank of lights
        a.rect(0, 0, W, 300, fill=a.gradient([(0, "#1b232b"), (0.7, "#39464f"), (1, kit.RIVER)]))
        kit.dabs(a, 0, 190, W, 100, [kit.RIVER, "#8a979a", "#2f3b44"], n=110, angle=0, L=(10, 30), width=5, op=0.45)
        for k in range(14):
            x = a.rng.uniform(20, W - 20)
            a.rect(x, 176 + a.rng.uniform(-6, 6), 3, 3, fill=kit.AMBER_L, opacity=0.8)
            a.rect(x, 184, 3, a.rng.uniform(14, 44), fill=kit.AMBER, opacity=0.25)
        for x in (0, 312, 620):
            a.rect(x, 0, 20, 300, fill="#3a2716")
        a.rect(0, 300, W, 26, fill="#6b4a2a")
        kit.dabs(a, 0, 300, W, 180, ["#5a3e22", "#3a2716"], n=60, angle=0, op=0.4)
        s.light(0.5)
        xs = [W / 2 + (i - (n - 1) / 2) * (560 / max(n, 4)) for i in range(n)]
        for i, x in enumerate(xs):
            k = 1.25 if n == 1 else (1.0 if n == 4 else 0.82)
            a.ellipse(x + 6, 322, 40 * k, 6, fill="#000", opacity=0.4, filter=a.blur(3))
            _boat(s, x, 300 - a.rng.uniform(0, 3), k, col="#f3efe2" if i < n - 1 or n == 1 else "#fffaf0")
        s.end()
    boats.__doc__ = (f"Gouache overlay for room 406 on night {night}: {n} folded paper boat{'s' if n > 1 else ''} on the "
                     "window sill, the river and the far bank's lamps behind, lit pink by the red-shaded lamp.")


for _n, _night in ((1, "one"), (4, "four"), (7, "six")):
    _boats(_n, _night)


def _watercolour(s, x, y, w, h, deg, subject, dot):
    """A small pinned watercolour with the brass dot in its corner (filled if the rose was dark)."""
    a = s.a
    cx, cy = x + w / 2, y + h / 2
    a.open("g", transform=f"rotate({deg} {f(cx)} {f(cy)})")
    a.rect(x + 4, y + 5, w, h, fill="#000", opacity=0.3)
    a.rect(x, y, w, h, fill="#f4efe2")
    ix, iy, iw, ih = x + w * .07, y + h * .08, w * .86, h * .72
    wash = a.blur(1.6)
    if subject == "river":
        a.rect(ix, iy, iw, ih * .5, fill="#aeb9bb", filter=wash)
        a.rect(ix, iy + ih * .5, iw, ih * .5, fill=kit.RIVER, filter=wash)
        a.rect(ix, iy + ih * .42, iw, ih * .1, fill="#3d4a4e", filter=wash, opacity=0.8)
        for k in range(5):
            a.rect(ix + iw * (0.1 + k * 0.18), iy + ih * .56, iw * .04, ih * .3, fill=kit.AMBER_L, opacity=0.6, filter=wash)
    else:  # the valet door, the rose a dot
        a.rect(ix, iy, iw, ih, fill="#35503f", filter=wash)
        a.rect(ix + iw * .3, iy + ih * .08, iw * .4, ih * .92, fill="#5a3e26", filter=wash)
        a.rect(ix + iw * .36, iy + ih * .16, iw * .28, ih * .3, fill="#4a3120", filter=wash)
        a.circle(ix + iw * .5, iy + ih * .58, max(2.4, w * .028), fill="#0a0806" if dot else kit.AMBER_L)
    a.circle(x + w * .9, y + h * .9, max(2.2, w * .028), fill=kit.BRASS if dot else "none", stroke=kit.BRASS, stroke_width=1.2)
    a.circle(cx, y + 7, 4, fill="#c9c2b0", stroke="#555", stroke_width=0.6)
    a.close()


def _pictures(n, night, title):
    @overlay(f"pictures-{n}", 403, title)
    def pics(a):
        s = Paint(a, 403, surface="#5a3a1e", horizon=400)
        s.light(0.5)
        r = a.rng
        dots = [False, True, False, True, True, False, True]
        cols = n if n <= 3 else (n + 1) // 2
        for i in range(n):
            row, col = (0, i) if n <= 3 else (i // cols, i % cols)
            w_ = 150 if n <= 3 else 120
            x = W / 2 + (col - (cols - 1) / 2) * (w_ + 30) - w_ / 2 + (20 if row else 0)
            y = (120 if n <= 3 else 50) + row * 170
            _watercolour(s, x, y, w_, w_ * 0.8, r.uniform(-5, 5), "river", dots[i])
        s.p([(60, 400), (580, 400), (580, 420), (60, 420)], "#6b4a2a")
        s.end()
    pics.__doc__ = (f"Gouache overlay for room 403 by night {night}: {n} small watercolours of the river pinned to the "
                    "green wallpaper, each with a brass dot in its corner, some filled and some hollow.")


_pictures(2, "two", "two rivers pinned up")
_pictures(5, "five", "five rivers, some dots filled")


@overlay("sitting", 403, "the picture that faces the rose")
def sitting(a):
    """Gouache overlay for The Sitting on night four: Mara's picture pinned facing the lens, a painting of the
    valet door with the rose a black dot, and her pencil line under it."""
    s = Paint(a, 403, surface="#5a3a1e", horizon=480)
    s.light(0.6, r=0.7)
    _watercolour(s, 150, 40, 340, 330, -2, "door", True)
    a.open("g", transform="rotate(-2 320 205)")
    kit.hand(a, 320, 335, ["Eleven times. I count too."], size=21, color="#4a4a4a", tilt=1.2)
    kit.hand(a, 320, 361, ["Don't stop."], size=21, color="#4a4a4a", tilt=1.2)
    a.close()
    # her gloved hand at the lower edge, still holding the pencil
    s.p([(470, 480), (452, 410), (484, 380), (530, 392), (560, 480)], "#f1ede2", soft=True)
    a.line(448, 372, 520, 440, stroke="#c9a23a", stroke_width=7, stroke_linecap="round")
    a.line(444, 368, 450, 374, stroke="#2a2a2a", stroke_width=4, stroke_linecap="round")
    s.end(0.5)


@overlay("photograph", 401, "the photograph, face up")
def photograph(a):
    """Gouache overlay for room 401 on night three: on the desk under the white lamp, beside the laid-out kit, a
    photograph left face up of a woman at her own door."""
    s = Paint(a, 401, surface="#5a3a1e", horizon=110, pool=(0.45, 0.5))
    kit.dabs(a, 0, 110, W, 370, ["#6b4626", "#4a2f18"], n=120, angle=0, L=(10, 28), width=5)
    s.light(0.6)
    # the kit laid out in one order
    for i, (w_, h_, c) in enumerate([(26, 150, "#2a2a2f"), (22, 120, "#55595c"), (30, 96, "#2a2a2f"), (18, 132, "#3d4a3a")]):
        s.p(kit.box(70 + i * 46, 180 + (150 - h_), w_, h_), c, soft=True)
    s.p(kit.box(60, 350, 190, 16), "#d9d2c0", soft=True)   # folded cloth edge under them
    ph = kit.rot(kit.box(330, 170, 220, 170), 440, 255, 8)
    a.poly(kit.rot(kit.box(338, 180, 220, 170), 440, 255, 8), fill="#000", opacity=0.35, filter=a.blur(5))
    s.p(ph, "#f4efe2", soft=True)
    s.p(kit.rot(kit.box(342, 182, 196, 132), 440, 255, 8), "#3a3f42", soft=True)
    s.p(kit.rot(kit.box(420, 190, 70, 124), 440, 255, 8), "#6a6f70", soft=True)      # a door, ajar
    s.p(kit.rot([(392, 314), (392, 250), (404, 232), (424, 232), (434, 250), (436, 314)], 440, 255, 8), "#1b1d1f", soft=True)
    (hx, hy), = kit.rot([(413, 220)], 440, 255, 8)
    s.e(hx, hy, 12, 14, "#c9c2b0")
    (gx, gy), = kit.rot([(440, 286)], 440, 255, 8)
    s.e(gx, gy, 7, 6, "#f1ede2")      # a white glove on the handle
    s.end()


@overlay("needle", 402, "the hollow needle")
def needle(a):
    """Gouache overlay for room 402 on night four: knitting on the arm of the chair in the television's blue,
    one needle drawn out and unscrewed at the cap."""
    s = Paint(a, 402, surface="#4b2a1a", horizon=250, pool=(0.3, 0.3))
    s.light(0.6)
    a.rect(0, 0, 260, 200, fill=kit.ROOMS[402][1], opacity=0.25, filter=a.blur(30))
    s.p([(0, 250), (640, 230), (640, 480), (0, 480)], "#5a3420")
    s.p([(0, 250), (640, 230), (640, 262), (0, 286)], "#774a30")
    # the knitting: a river-grey rectangle of rows and a ball of wool
    s.p([(150, 210), (380, 196), (392, 330), (160, 344)], "#7f8f95")
    for k in range(9):
        a.line(156, 224 + k * 13, 386, 210 + k * 13, stroke="#5d6c72", stroke_width=3, stroke_dasharray="6 4", opacity=0.8)
    s.e(480, 330, 56, 52, "#8c9ca2")
    for k in range(7):
        a.ellipse(480, 330, 52, 14 + k * 5, fill="none", stroke="#5d6c72", stroke_width=2, opacity=0.7, transform=f"rotate({k * 26} 480 330)")
    a.path("M392,300 C420,360 430,300 452,350", fill="none", stroke="#8c9ca2", stroke_width=4)
    a.line(130, 232, 420, 176, stroke="#d8dadb", stroke_width=7, stroke_linecap="round")
    # the second needle, out, its cap off and a curl of paper showing
    a.line(250, 420, 520, 404, stroke="#d8dadb", stroke_width=7, stroke_linecap="round")
    a.line(250, 420, 262, 419, stroke="#101010", stroke_width=5)
    s.p(kit.rot(kit.box(210, 412, 24, 14), 222, 419, -3), "#b9bcbd", soft=True)
    s.p([(236, 414), (256, 410), (258, 428), (238, 430)], "#efe6cf", soft=True)
    s.end()


@overlay("miniature", 404, "one miniature, into the sink")
def miniature(a):
    """Gouache overlay for room 404: on the edge of the basin under the yellow bulb, one empty miniature on its
    side and the hotel notepad with the day's number."""
    s = Paint(a, 404, surface="#d9d5c8", horizon=200, pool=(0.6, 0.35))
    a.rect(0, 0, W, 200, fill="#c9c4b2")
    pid = a.uid("tile")
    a.defn(f'<pattern id="{pid}" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M0,0H64V64" fill="none" '
           'stroke="#9a957f" stroke-width="2"/></pattern>')
    a.rect(0, 0, W, 200, fill=f"url(#{pid})")
    s.light(0.6)
    # the basin: an ellipse of shadow and the plughole
    s.e(250, 410, 300, 130, "#bdb9aa")
    s.e(250, 430, 250, 100, "#a9a596")
    s.e(250, 440, 16, 8, "#2a2a2a")
    a.path("M250,300 q-6,60 0,132", fill="none", stroke="#c98a3a", stroke_width=3, opacity=0.5)   # the last of it
    # the bottle on its side
    a.ellipse(430, 268, 80, 10, fill="#000", opacity=0.3, filter=a.blur(4))
    s.p(kit.box(370, 228, 110, 36), "#7a4a1c", soft=True)
    s.p(kit.box(480, 236, 30, 20), "#7a4a1c", soft=True)
    s.p(kit.box(510, 234, 18, 24), "#2a2a2a", soft=True)
    s.p(kit.box(392, 230, 56, 32), "#efe6cf", soft=True)
    a.rect(374, 232, 100, 6, fill="#fff", opacity=0.35)
    # the notepad
    a.open("g", transform="rotate(-7 130 250)")
    a.rect(74, 196, 120, 96, fill="#000", opacity=0.25)
    a.rect(70, 190, 120, 96, fill="#f4efe2")
    a.rect(70, 190, 120, 14, fill=kit.BOTTLE)
    kit.hand(a, 130, 256, ["400"], size=40, color="#3a3a3a", tilt=2)
    a.close()
    s.end()


# ---- the gap: a strip at floor level ------------------------------------------------------------
GW, GH = 1600, 144
FLOORS = {401: "#6a5a48", 402: "#3d4a66", 403: "#6d7265", 404: "#7a5a22", 405: "#2f5a56", 406: "#7a3a30"}


def _shoe(a, x, y, s, col, sole="#15110d", flip=False, rough=None):
    k = -1 if flip else 1
    a.path(f"M{f(x)},{f(y)} h{f(k * 46 * s)} q{f(k * 14 * s)},{f(-2 * s)} {f(k * 10 * s)},{f(-12 * s)} q{f(-k * 16 * s)},{f(-10 * s)} {f(-k * 30 * s)},{f(-14 * s)} "
           f"l{f(-k * 4 * s)},{f(-22 * s)} h{f(-k * 20 * s)}Z", fill=col, filter=rough)
    a.rect(min(x, x + k * 56 * s), y - 1, 56 * s, 5 * s, fill=sole)


def _gap(room, title, doc, things):
    @asset(G, f"gap-{room}", group="backdrops", title=f"Gap strip, {room}: {title}", w=GW, h=GH, row=ROW_G)
    def strip(a: Art):
        lamp = kit.ROOMS[room][1]
        r = a.rng
        rough = a.roughen(3, 0.06)
        a.rect(0, 0, GW, GH, fill="#070605")
        # far skirting and wall foot
        a.rect(0, 0, GW, 30, fill=kit.BOTTLE_D)
        a.rect(0, 26, GW, 16, fill="#2a1c10")
        # carpet plane, lit from one pool
        a.rect(0, 42, GW, GH - 42, fill=FLOORS[room])
        kit.dabs(a, 0, 44, GW, GH - 46, [FLOORS[room], "#000", "#fff"], n=260, angle=0, L=(10, 34), width=4, op=0.12)
        things(a, r, rough, lamp)
        px = {401: 0.3, 402: 0.72, 403: 0.5, 404: 0.25, 405: 0.6, 406: 0.42}[room]
        a.rect(0, 0, GW, GH, fill=a.radial([(0, lamp, 0.42), (0.5, lamp, 0.12), (1, "#000", 0)], cx=px, cy=0.6, r=0.5))
        a.rect(0, 0, GW, GH, fill=a.gradient([(0, "#000"), (0.5, "#000"), (1, "#000")]), opacity=0.0)
        dark = a.gradient([(0, "#000"), (0.12, "#000"), (0.5, "#000")], x1=0, y1=0, x2=1, y2=0)
        a.rect(0, 0, GW, GH, fill=a.radial([(0, "#000", 0), (0.55, "#000", 0.25), (1, "#000", 0.92)], cx=px, cy=0.5, r=0.62))
        # the door's bottom edge above, the threshold bar below: the gap itself
        a.rect(0, 0, GW, 12, fill="#050403")
        a.rect(0, GH - 14, GW, 14, fill="#0b0806")
        a.rect(0, GH - 15, GW, 2, fill=kit.BRASS, opacity=0.5)
    strip.__doc__ = doc
    return strip


def _legs(a, xs, y0=42, y1=120, w=16, col="#1a120b"):
    for x in xs:
        a.rect(x, y0, w, y1 - y0, fill=col)
        a.rect(x - 3, y1 - 5, w + 6, 6, fill=col)


def _g401(a, r, rough, lamp):
    a.rect(120, 12, 520, 56, fill="#d9d2c0")           # bedspread hem, folded back a hand's width
    a.rect(120, 60, 520, 8, fill="#b9b09a")
    _legs(a, [130, 620])
    _legs(a, [820, 960], w=7, col="#8a8f92")           # the ironing board
    a.line(824, 44, 964, 118, stroke="#8a8f92", stroke_width=5)
    a.line(964, 44, 824, 118, stroke="#8a8f92", stroke_width=5)
    for x, flip in ((1100, False), (1190, False)):     # boots, side by side, red clay on the welt
        a.path(f"M{x},118 h70 q10,-4 6,-16 q-18,-10 -38,-12 l-2,-52 h-34 Z", fill="#231c16", filter=rough)
        a.rect(x - 2, 114, 80, 6, fill="#0d0a08")
        kit.dabs(a, x, 104, 76, 12, [kit.EVIDENCE], n=14, angle=0, L=(3, 8), width=3, op=0.85)
    a.rect(1330, 70, 150, 50, rx=10, fill="#3d4a3a", filter=rough)     # the kit bag
    a.path("M1360,70 q45,-36 90,0", fill="none", stroke="#2a332a", stroke_width=6)


def _g402(a, r, rough, lamp):
    a.rect(0, 30, 260, 20, fill="#101010")             # the main door's foot at the left, an envelope under it
    a.poly([(150, 84), (268, 76), (274, 98), (156, 108)], fill="#efe6cf", filter=rough)
    a.line(152, 86, 270, 78, stroke="#b8ab8a", stroke_width=1.5)
    _legs(a, [420, 560], col="#2a1a10")                # armchair
    a.rect(400, 12, 190, 50, rx=8, fill="#4b2a1a")
    a.circle(760, 100, 22, fill="#8c9ca2", filter=rough)   # the wool has rolled
    a.path("M740,104 C660,120 620,84 566,96", fill="none", stroke="#8c9ca2", stroke_width=3)
    for k in range(5):
        a.ellipse(760, 100, 20, 6 + k * 3, fill="none", stroke="#5d6c72", stroke_width=1.4, transform=f"rotate({k * 34} 760 100)")
    _shoe(a, 980, 120, 1.0, "#3a2a3a", rough=rough)   # low court shoes, toes together
    _shoe(a, 1110, 120, 1.0, "#3a2a3a", flip=True, rough=rough)
    a.rect(1250, 12, 300, 80, fill="#14181f")          # the television stand; its blue on the carpet
    a.rect(1270, 92, 12, 28, fill="#14181f")
    a.rect(1520, 92, 12, 28, fill="#14181f")


def _g403(a, r, rough, lamp):
    _legs(a, [200, 330], w=10, col="#3a2716")          # the desk chair
    _legs(a, [90, 520], w=18, col="#3a2716")           # the desk
    a.poly([(640, 12), (1010, 12), (1030, 120), (626, 120)], fill="#2d2119", filter=rough)   # the case, on edge
    for x in (640, 1006):
        a.circle(x, 108, 12, fill=kit.BRASS)
    a.rect(626, 60, 404, 5, fill="#4d3826")
    for x in (1130, 1222):                             # boots with salt rime
        a.path(f"M{x},118 h66 q8,-4 4,-14 q-16,-8 -34,-10 l-2,-66 h-30 Z", fill="#2a2420", filter=rough)
        kit.dabs(a, x, 96, 70, 18, ["#f1ede2"], n=18, angle=0, L=(2, 6), width=2.2, op=0.8)
    a.rect(1370, 78, 46, 42, fill="#a9b4b6", opacity=0.6)   # the water jar
    a.rect(1370, 96, 46, 24, fill=kit.RIVER, opacity=0.8)
    a.line(1392, 40, 1400, 96, stroke="#c9a23a", stroke_width=4)


def _g404(a, r, rough, lamp):
    a.rect(60, 12, 600, 44, fill="#cbbb96")
    _legs(a, [70, 640])
    a.rect(300, 96, 54, 20, rx=5, fill="#7a4a1c", filter=rough)       # a miniature rolled under the bed
    a.rect(354, 100, 16, 12, fill="#7a4a1c")
    a.rect(370, 99, 10, 14, fill="#2a2a2a")
    _shoe(a, 820, 120, 1.05, "#101010", rough=rough)   # waiter's black shoes, one on its side
    a.path("M950,120 h70 q8,-20 -8,-26 h-50 q-14,6 -12,26Z", fill="#101010", filter=rough)
    a.poly([(1120, 60), (1300, 52), (1310, 110), (1128, 120)], fill="#f1ede2", filter=rough)   # the catering jacket, dropped
    kit.dabs(a, 1130, 60, 170, 50, [kit.GOLD], n=16, L=(1, 3), width=3, op=0.9)
    a.rect(1400, 12, 160, 30, fill="#1a120b")


def _g405(a, r, rough, lamp):
    _legs(a, [140, 600], w=18, col="#1a120b")
    a.path("M0,104 C200,84 300,126 480,102 S760,120 900,96 S1200,124 1600,100", fill="none", stroke="#101010", stroke_width=5)
    a.path("M200,116 C420,100 600,122 880,110", fill="none", stroke="#3a3a3a", stroke_width=3)
    a.rect(700, 60, 190, 60, rx=8, fill="#22262b", filter=rough)       # one bag, three laptops
    for k in range(3):
        a.rect(716, 52 - k * 5, 158, 5, fill="#8a8f92")
    a.poly([(1000, 120), (1010, 40), (1090, 44), (1084, 120)], fill="#c9a23a", filter=rough)   # the cereal box
    a.rect(1016, 60, 60, 26, fill="#efe6cf")
    kit.dabs(a, 1090, 104, 120, 14, ["#d9b46a"], n=18, L=(1, 3), width=4, op=0.9)
    for x in (1300, 1380):                              # socked feet, crossed
        a.path(f"M{x},120 h60 q10,-10 0,-18 h-36 l-4,-60 h-24Z", fill="#8a8f92", filter=rough)
        a.rect(x + 4, 60, 20, 8, fill=kit.EVIDENCE, opacity=0.0)


def _g406(a, r, rough, lamp):
    a.rect(40, 12, 420, 40, fill="#7c8d6a")
    _legs(a, [50, 440])
    # two people sitting on the floor: two pairs of feet, soles toward one another
    for x, col, flip in ((640, "#f1ede2", False), (720, "#f1ede2", False), (900, "#30343a", True), (980, "#30343a", True)):
        _shoe(a, x, 120, 0.9, col, flip=flip, rough=rough, sole="#8a826e" if not flip else "#15110d")
    a.poly([(770, 100), (850, 94), (854, 116), (774, 120)], fill="#3a3f42", filter=rough)   # a photograph on the floor
    a.poly([(774, 103), (846, 98), (849, 113), (777, 117)], fill="#8a8f92", filter=rough)
    for k in range(4):                                  # the blue rope
        a.ellipse(1180, 108 - k * 5, 60 - k * 4, 10, fill="none", stroke="#2b56a0", stroke_width=6)
    a.poly([(1340, 118), (1400, 118), (1388, 104), (1352, 104)], fill="#f3efe2")           # a boat that fell
    a.poly([(1370, 82), (1386, 104), (1356, 104)], fill="#d9d2c0")


_gap(401, "boots, red clay on the welt",
     "The gap under 401's valet door: the bedspread's folded hem, the legs of an ironing board, a pair of boots set "
     "side by side with red clay on the welts, and the kit bag, in white lamplight.", _g401)
_gap(402, "an envelope under the main door",
     "The gap under 402's valet door: a cream envelope pushed under the main door, a ball of wool rolled from the "
     "armchair, two court shoes toe to toe, and the television's blue on the carpet.", _g402)
_gap(403, "the case on its edge",
     "The gap under 403's valet door: the desk's legs, the flat case stood on its edge with brass corners, boots "
     "rimed with salt and a jar of paint water, under a north-light bulb.", _g403)
_gap(404, "a miniature under the bed",
     "The gap under 404's valet door: a miniature bottle rolled under the bed, a waiter's black shoes, one on its "
     "side, and a white catering jacket flecked with gold on the floor in yellow light.", _g404)
_gap(405, "cables and cereal",
     "The gap under 405's valet door: cables across the carpet, one bag holding three laptops, a cereal box with a "
     "spill beside it, and two socked feet in the glow of a screen.", _g405)
_gap(406, "two pairs of feet",
     "The gap under 406's valet door on night four: two pairs of feet where two people sit on the floor, a "
     "photograph lying between them, the coil of blue rope and a fallen paper boat in red-shaded light.", _g406)

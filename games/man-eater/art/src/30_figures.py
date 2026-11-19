"""Figures: the hands at the card table, and the shadow-puppet cut-outs of the halls."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, GREEN, SODIUM, STEEL, FROST, SNOW, BRUISE = (kit.INK, kit.CREAM, kit.GREEN, kit.SODIUM, kit.STEEL,
                                                         kit.FROST, kit.SNOW, kit.BRUISE)
ROW_H = "Hands at the table, one pair per seat"
ROW_C = "Halls backdrops and cut-outs (Fisk at five heights, guard, orderly, Jax, sheet, flashlight)"
W, H = 640, 440


def _table(a, s):
    """The baize at one seat, from above: the rim along the near edge, the suit chalked on the cloth."""
    a.paper(GREEN, grain=0.0)
    kit.speckle(a, a.clip(f'<rect width="{W}" height="{H}"/>'), 0, 0, W, H, color="#26302a", strength=0.5)
    pool = a.radial([(0, SODIUM, 0.34), (0.6, SODIUM, 0.1), (1, SODIUM, 0)], cx=0.42, cy=0.3, r=0.75)
    a.rect(0, 0, W, H, fill=pool)
    a.path(f"M0,{H - 46} Q{W / 2},{H - 98} {W},{H - 46} V{H} H0Z", fill="#4b4942", stroke="#191814", stroke_width=3)
    a.path(f"M0,{H - 40} Q{W / 2},{H - 92} {W},{H - 40}", fill="none", stroke="#8a8f93", stroke_width=2, opacity=0.6)
    kit.suit(a, s, W / 2, 62, 34, color=CREAM, sw=3.4)
    a.open("g", opacity=0.5)
    kit.suit(a, s, W / 2 + 2, 63, 34, color=CREAM, sw=1.2)
    a.close()


def _cardback(a, x, y, rot, w=62, h=88):
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(rot)})")
    a.rect(-w / 2 + 3, -h / 2 + 4, w, h, rx=5, fill="#000", opacity=0.3)
    a.rect(-w / 2, -h / 2, w, h, rx=5, fill=kit.CARD, stroke="#5d5644", stroke_width=1.5)
    a.rect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, rx=3, fill="none", stroke=INK, stroke_width=1.5, stroke_dasharray="8 3")
    a.path(f"M{-w / 2 + 10},{-h / 2 + 10}L{w / 2 - 10},{h / 2 - 10}M{w / 2 - 10},{-h / 2 + 10}L{-w / 2 + 10},{h / 2 - 10}",
           stroke=INK, stroke_width=1.2, opacity=0.5)
    a.close()


def _pencil(a, x1, y1, x2, y2):
    ang = math.atan2(y2 - y1, x2 - x1)
    L = math.hypot(x2 - x1, y2 - y1)
    a.open("g", transform=f"translate({f(x1)},{f(y1)}) rotate({f(math.degrees(ang))})")
    a.rect(4, 7, L - 16, 8, fill="#000", opacity=0.25)
    a.rect(0, -4.5, L - 16, 9, fill=SODIUM, stroke=INK, stroke_width=1.5)
    a.line(0, -1.5, L - 16, -1.5, stroke="#f0d28a", stroke_width=1.5)
    a.rect(-9, -4.5, 9, 9, fill=STEEL, stroke=INK, stroke_width=1.5)
    a.poly([(L - 16, -4.5), (L, 0), (L - 16, 4.5)], fill="#e8d7b4", stroke=INK, stroke_width=1.5)
    a.poly([(L - 5, -1.5), (L, 0), (L - 5, 1.5)], fill=INK)
    a.close()


def _finish(a):
    kit.film(a, 0, 0, W, H, 0.22)
    a.vignette(0.5)


def _hands(seat, title, doc):
    def deco(fn):
        def run(a: Art):
            _table(a, seat)
            fn(a)
            _finish(a)
        run.__doc__ = doc
        asset(G, f"hands-{kit.OWNER[seat].lower()}", group="figures", title=title, w=W, h=H, row=ROW_H)(run)
        return fn
    return deco


@_hands("hands", "Fisk's hands at the table",
        "Fisk's seat from above: one hand flat on three cards face down, the other holding the pencil over the open "
        "notebook where the list is kept, the suit of Hands chalked on the baize.")
def _fisk(a):
    a.open("g", transform="rotate(8 470 150)")
    a.rect(396, 76, 200, 150, fill="#000", opacity=0.3)
    a.rect(390, 70, 200, 150, fill=kit.PAPER, stroke="#8d866f", stroke_width=1)
    a.path("".join(f"M402,{y}H578" for y in range(98, 210, 22)), stroke=FROST, stroke_width=1, opacity=0.6, fill="none")
    a.text(404, 116, "L15. My file has", size=19, family="cursive", fill="#3b3a38")
    a.text(404, 138, "tomorrow in it.", size=19, family="cursive", fill="#3b3a38")
    a.text(404, 160, "Typed.", size=19, family="cursive", fill="#3b3a38")
    a.close()
    for i in range(3):
        _cardback(a, 150 + i * 30, 190 + abs(i - 1) * 6, -22 + i * 16)
    kit.hand_top(a, 190, 318, rot=-14, side=1, spread=1.3, sleeve="#56664f")
    _pencil(a, 430, 300, 498, 196)
    kit.hand_top(a, 440, 330, rot=10, side=-1, curl=(0.75, 0.7, 0.45, 0.2), thumb=30, thumb_curl=0.5, sleeve="#56664f")


@_hands("keys", "Jax's hands at the table",
        "Jax's seat from above: one finger tapping the cloth, two rings of sound spreading from it, and a bootlace "
        "with his knots in it trailing from the other fist; the suit of Keys, inherited with the chair.")
def _jax(a):
    pts = [(120, 330), (150, 250), (210, 200), (290, 180), (360, 150), (420, 160)]
    a.path(a.smooth_d([(x + 3, y + 5) for x, y in pts]), fill="none", stroke="#000", stroke_width=6, opacity=0.3)
    a.path(a.smooth_d(pts), fill="none", stroke="#2a221a", stroke_width=6, stroke_linecap="round")
    a.path(a.smooth_d(pts), fill="none", stroke="#7a6850", stroke_width=1.6, stroke_dasharray="3 5")
    for x, y in pts[1:-1]:
        a.circle(x, y, 9.5, fill="#2a221a", stroke="#7a6850", stroke_width=1.6)
        a.path(f"M{x - 5},{y + 2}q5,-8 10,0", fill="none", stroke="#7a6850", stroke_width=1.5)
    kit.hand_top(a, 170, 330, rot=-24, side=1, scale=0.95, curl=(0.9, 0.9, 0.9, 0.85), thumb=24, thumb_curl=0.7,
                 sleeve="#4f5f52")
    for r in (16, 28, 42):
        a.path(f"M{474 - r},{168} A{r},{r * 0.6} 0 0 1 {474 + r},{168}", fill="none", stroke=CREAM, stroke_width=2,
               opacity=0.75 - r * 0.012, stroke_dasharray="6 5")
    kit.hand_top(a, 440, 330, rot=12, side=-1, scale=0.95, curl=(0.85, 0.85, 0.8, 0.0), thumb=20, thumb_curl=0.6,
                 sleeve="#4f5f52")


@_hands("anchors", "Pell's hands at the table",
        "Pell's seat from above: an old cook's broad, spotted hands squaring the deck he keeps, thumbs along its "
        "edge, the suit of Anchors chalked above.")
def _pell(a):
    for i in range(7):
        a.rect(270 - i * 0.8, 150 - i * 2.4, 100, 140, rx=6, fill="#d2c8ae" if i % 2 else "#c4b99d", stroke="#5d5644",
               stroke_width=1.2, transform="rotate(-4 320 220)")
    _cardback(a, 315, 206, -4, w=100, h=140)
    for sx, side, rot in ((212, 1, 32), (432, -1, -32)):
        kit.hand_top(a, sx, 318, rot=rot, side=side, scale=1.18, curl=(0.25, 0.2, 0.15, 0.1), thumb=58, spread=0.7,
                     skin=kit.SKIN2, sleeve="#5b6a58", cuff="#e9e4d6")
    a.stipple(150, 150, 340, 180, n=120, r=(0.8, 2.2), fill="#8f8266", opacity=0.55,
              density=lambda x, y: 1 if (abs(x - 240) < 44 or abs(x - 404) < 44) and 170 < y < 300 else 0)


@_hands("houses", "Duarte's hands at the table",
        "Duarte's seat from above: one hand holding a letter flat while the other writes it in pencil, the envelope "
        "waiting beside it with a house drawn where the address goes; the suit of Houses.")
def _duarte(a):
    a.open("g", transform="rotate(-6 300 210)")
    a.rect(196, 116, 230, 170, fill="#000", opacity=0.3)
    a.rect(190, 110, 230, 170, fill=kit.PAPER)
    for i in range(6):
        y = 136 + i * 22
        ln = 200 if i < 4 else (120 if i == 4 else 0)
        if ln:
            pts = [(204 + t * 6, y + 3.4 * math.sin(t * 1.9 + i * 2) * (0.2 if t % 6 == 0 else 1)) for t in range(int(ln / 6))]
            a.wobble(pts, amp=1.2, step=5, stroke="#4b4a47", stroke_width=1.5, opacity=0.85)
    a.close()
    a.open("g", transform="rotate(14 520 150)")
    a.rect(464, 104, 130, 84, fill="#000", opacity=0.3)
    a.rect(460, 100, 130, 84, fill=kit.PAPER, stroke="#8d866f", stroke_width=1)
    a.path("M460,100 L525,146 L590,100", fill="none", stroke="#a59d86", stroke_width=1.5)
    kit.suit(a, "houses", 525, 160, 13, color="#4b4a47", sw=1.5)
    a.close()
    kit.hand_top(a, 214, 322, rot=-8, side=1, spread=1.2, sleeve="#56664f")
    _pencil(a, 424, 300, 372, 226)
    kit.hand_top(a, 440, 334, rot=-16, side=-1, curl=(0.75, 0.7, 0.45, 0.2), thumb=30, thumb_curl=0.5, sleeve="#56664f")


@_hands("sparks", "Kimura's hands at the table",
        "Kimura's seat from above: the radio operator's headphones set down on the cloth, their cord running off "
        "the table, and his fingers resting one to a card on the tricks he is counting; the suit of Sparks.")
def _kimura(a):
    a.path(a.smooth_d([(150, 160), (120, 220), (60, 250), (0, 300)]), fill="none", stroke=INK, stroke_width=4)
    a.path("M150,150 Q205,70 260,150", fill="none", stroke="#000", stroke_width=14, opacity=0.25, transform="translate(4,6)")
    a.path("M150,150 Q205,70 260,150", fill="none", stroke="#2c2f31", stroke_width=12)
    a.path("M150,150 Q205,76 260,150", fill="none", stroke=STEEL, stroke_width=2)
    for cx in (150, 260):
        a.circle(cx + 4, 158, 30, fill="#000", opacity=0.3)
        a.circle(cx, 152, 30, fill="#2c2f31", stroke=INK, stroke_width=2)
        a.circle(cx, 152, 19, fill="#4a4e51")
        a.circle(cx, 152, 5, fill=STEEL)
    for i in range(4):
        _cardback(a, 372 + i * 50, 196 - i * 6, -6 + i * 5, w=48, h=68)
    kit.hand_top(a, 200, 326, rot=-10, side=1, curl=(0.5, 0.4, 0.3, 0.3), thumb=40, sleeve="#56664f")
    kit.hand_top(a, 452, 322, rot=14, side=-1, spread=1.9, thumb=64, sleeve="#56664f")


@_hands("stars", "Hollis's hands at the table",
        "Hollis's seat from above: the youngest man's thin hands closed round the one loaf he has won, cuffs too "
        "long for his wrists; the suit of Stars.")
def _hollis(a):
    a.ellipse(326, 232, 84, 46, fill="#000", opacity=0.3, filter=a.blur(5))
    a.ellipse(320, 222, 82, 44, fill="#b98f55", stroke="#5d4424", stroke_width=3)
    a.ellipse(312, 212, 62, 24, fill="#d3ad73", opacity=0.7)
    for c in range(4):
        a.line(274 + c * 28, 198, 292 + c * 28, 236, stroke="#f0d9aa", stroke_width=6, stroke_linecap="round")
    for sx, side, rot in ((226, 1, 44), (414, -1, -44)):
        kit.hand_top(a, sx, 306, rot=rot, side=side, scale=0.9, curl=(0.5, 0.45, 0.4, 0.35), thumb=44, thumb_curl=0.2,
                     spread=0.8, sleeve="#56664f", cuff="#4c5e51")


@_hands("stamp", "Sam's hands at the table",
        "Sam's seat from above: a pressed cuff and a hand flat on a typed form, the other closed round the wooden "
        "handle of the project stamp, the red pad open beside it; his suit is the stamp itself.")
def _sam(a):
    a.open("g", transform="rotate(-5 250 200)")
    a.rect(136, 106, 250, 180, fill="#000", opacity=0.3)
    a.rect(130, 100, 250, 180, fill=kit.PAPER)
    kit.typed(a, 146, 128, "Results required: 1", size=17)
    a.path("".join(f"M146,{y}H364" for y in range(150, 270, 22)), stroke=INK, stroke_width=1, opacity=0.5, fill="none")
    a.close()
    kit.stamp(a, 300, 160, "7-F", w=80, h=40, rot=-12, patch=0.5, opacity=0.9)
    a.rect(486, 108, 110, 78, rx=6, fill="#000", opacity=0.3)
    a.rect(480, 100, 110, 78, rx=6, fill="#2c2f31", stroke=INK, stroke_width=2)
    a.rect(490, 110, 90, 58, rx=3, fill=kit.RED)
    kit.speckle(a, a.clip('<rect x="490" y="110" width="90" height="58"/>'), 490, 110, 90, 58, color="#5c1a12", strength=0.5)
    kit.hand_top(a, 212, 324, rot=-6, side=1, spread=0.9, sleeve="#30343a", cuff="#ECE8DC")
    kit.hand_top(a, 440, 330, rot=6, side=-1, curl=(0.85, 0.85, 0.85, 0.85), thumb=22, thumb_curl=0.7, sleeve="#30343a",
                 cuff="#ECE8DC")
    a.circle(446, 262, 27, fill="#000", opacity=0.3)
    a.circle(440, 254, 26, fill="#7a5a36", stroke=INK, stroke_width=2.5)
    a.circle(432, 246, 9, fill="#b08a5a", opacity=0.8)
    a.rect(408, 280, 64, 12, rx=3, fill="#3a2a18", stroke=INK, stroke_width=2, opacity=0.0)


# ---- cut-outs -----------------------------------------------------------------------------------
CW, CH, BASE, K = 520, 800, 760, 2.08
HEIGHTS = [(178, "as he arrived"), (218, "past the lintel"), (258, "the pipes in reach"), (298, "his shadow on the ceiling"),
           (338, "the last number on the target curve")]


def _cast(a, draw):
    """The puppet's shadow on the sheet behind it: taller than the man, soft, and cut off by the ceiling."""
    a.open("g", clip_path=a.clip(f'<rect width="{a.w}" height="{BASE}"/>'))
    a.open("g", transform=f"translate(70,{BASE}) scale(1.0,1.6) translate(0,{-BASE})", opacity=0.26, filter=a.blur(7))
    draw(False)
    a.close()
    a.close()
    draw(True)
    a.rect(0, BASE, a.w, 3, fill=INK, opacity=0.5)


def _cap(a, J, peak=True):
    hx, hy = J["head"]
    rx, ry = J["hr"]
    fc = J["face"]
    a.poly([(hx - rx * 1.05, hy - ry * 0.45), (hx + rx * 1.05, hy - ry * 0.45), (hx + rx * 1.2, hy - ry * 1.25),
            (hx - rx * 1.2, hy - ry * 1.25)], fill=INK)
    if peak:
        a.poly([(hx + fc * rx * 0.6, hy - ry * 0.55), (hx + fc * rx * 2.0, hy - ry * 0.3), (hx + fc * rx * 0.6, hy - ry * 0.3)],
               fill=INK)


for _i, (_h, _note) in enumerate(HEIGHTS):
    def _mk(i=_i, hcm=_h, note=_note):
        def fn(a: Art):
            poses = [dict(stride=0.26, arms=((0.32, 0.25), (-0.3, 0.2))),
                     dict(stride=0.3, arms=((0.36, 0.3), (-0.34, 0.15))),
                     dict(stride=0.2, arms=((2.5, 0.35), (-0.2, 0.2))),
                     dict(stride=0.24, arms=((0.3, 0.5), (-0.18, 0.4))),
                     dict(stride=0.16, arms=((0.2, 0.3), (-0.05, 0.25)), head_tilt=0.5)]

            def draw(real):
                kit.puppet(a, 170, BASE, hcm, k=K, pins=real, rods=False, **poses[i])
            _cast(a, draw)
        fn.__doc__ = (f"Fisk as a black shadow-puppet cut-out at {hcm} cm ({note}), side-on and walking, brass pins at "
                      f"his joints and his soft shadow thrown taller than he is on the sheet behind.")
        return fn
    asset(G, f"cutout-fisk-{_h}", group="figures", title=f"Halls cut-out: Fisk at {_h} cm", w=CW, h=CH, row=ROW_C)(_mk())


@asset(G, "cutout-fisk-stoop", group="figures", title="Halls cut-out: Fisk folded down to pass for a man", w=CW, h=CH,
       row=ROW_C)
def fisk_stoop(a: Art):
    """Fisk at nearly three metres folding himself down to the height of an orderly, knees bent deep and
    back bowed, hands almost on the floor: the stoop that gets an eater past a hung sheet."""
    def draw(real):
        kit.puppet(a, 120, BASE, 298, k=K, crouch=0.9, lean=0.75, stride=0.16, arms=((0.15, -0.5), (-0.2, -0.3)),
                   pins=real, head_tilt=-0.5)
    _cast(a, draw)


def _torch(a, x, y, face, ang=0.0, lit=True, length=250):
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(math.degrees(ang) * face)}) scale({face},1)")
    if lit:
        g = a.gradient([(0, "#FFF3C4"), (1, "#FFF3C4")], 0, 0, 1, 0)
        cone = a.uid("cone")
        a.defn(f'<linearGradient id="{cone}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF3C4" '
               f'stop-opacity="0.85"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></linearGradient>')
        a.poly([(14, -5), (length, -length * 0.3), (length, length * 0.3), (14, 5)], fill=f"url(#{cone})")
    a.rect(-18, -5, 26, 10, fill=INK)
    a.poly([(8, -5), (16, -9), (16, 9), (8, 5)], fill=INK)
    a.close()


@asset(G, "cutout-guard", group="figures", title="Halls cut-out: the guard", w=CW, h=CH, row=ROW_C)
def guard(a: Art):
    """A guard as a black cut-out: peaked cap, belt and holster, a flashlight held out ahead of him with its
    cone of light the only pale thing in the hall."""
    def draw(real):
        J = kit.puppet(a, 150, BASE, 182, k=K, stride=0.2, lean=0.03, arms=((1.15, 0.35), (-0.2, 0.15)), pins=real)
        _cap(a, J)
        hx, hy = J["hip"]
        a.rect(hx - 16, hy - 22, 32, 8, fill=INK)
        a.poly([(hx - 20, hy - 14), (hx - 6, hy - 14), (hx - 8, hy + 22), (hx - 20, hy + 18)], fill=INK)
        tx, ty = J["hand0"]
        _torch(a, tx + 10, ty - 2, 1, ang=0.12, lit=real)
    _cast(a, draw)


@asset(G, "cutout-guard-ran", group="figures", title="Halls cut-out: the guard who backs away", w=CW, h=CH, row=ROW_C)
def guard_ran(a: Art):
    """The guard who has seen only a shadow as high as the ceiling: leaning back on his heels with both hands
    up, his flashlight dropped and rolling, its cone lying flat along the floor."""
    def draw(real):
        J = kit.puppet(a, 250, BASE, 182, k=K, face=-1, stride=0.34, lean=-0.26, arms=((-2.2, -0.5), (-1.7, -0.7)),
                       pins=real, head_tilt=-0.3)
        _cap(a, J)
        _torch(a, 150, BASE - 8, -1, ang=0.0, lit=real, length=150)
    _cast(a, draw)


@asset(G, "cutout-orderly", group="figures", title="Halls cut-out: the orderly", w=CW, h=CH, row=ROW_C)
def orderly(a: Art):
    """The orderly as a black cut-out: a long coat to the knee, a clipboard held against the chest, the head
    bent to it; he never looks at a face."""
    def draw(real):
        J = kit.puppet(a, 160, BASE, 176, k=K, stride=0.14, lean=0.1, arms=((0.75, 1.5), (0.6, 1.3)), pins=real,
                       head_tilt=0.35)
        hx, hy = J["hip"]
        sx, sy = J["sh"]
        a.poly([(sx - 26, sy + 8), (sx + 24, sy + 6), (hx + 34, hy + 150), (hx - 36, hy + 150)], fill=INK)
        tx, ty = J["hand0"]
        a.poly([(tx - 6, ty - 46), (tx + 30, ty - 40), (tx + 24, ty + 14), (tx - 12, ty + 8)], fill=INK)
        if real:
            a.poly([(tx - 2, ty - 40), (tx + 25, ty - 35), (tx + 20, ty + 8), (tx - 7, ty + 3)], fill=CREAM, opacity=0.9)
            a.path(f"M{tx + 2},{ty - 28}l17,3M{tx + 1},{ty - 19}l17,3M{tx},{ty - 10}l12,2", stroke=INK, stroke_width=1.6)
    _cast(a, draw)


@asset(G, "cutout-jax", group="figures", title="Halls cut-out: Jax", w=CW, h=CH, row=ROW_C)
def jax(a: Art):
    """Jax as a black cut-out, a head shorter than Fisk was on day one: shoulders up against the cold, one hand
    holding the knotted bootlace that is his count of the fence posts."""
    def draw(real):
        J = kit.puppet(a, 170, BASE, 168, k=K, stride=0.24, lean=0.16, arms=((0.5, 0.9), (-0.25, 0.3)), pins=real)
        tx, ty = J["hand0"]
        pts = [(tx + 6, ty), (tx + 12, ty + 40), (tx + 4, ty + 84), (tx + 14, ty + 128), (tx + 8, ty + 160)]
        a.path(a.smooth_d(pts), fill="none", stroke=INK, stroke_width=3.5, stroke_linecap="round")
        for px, py in pts[1:-1]:
            a.circle(px, py, 6, fill=INK)
        hx, hy = J["head"]
        a.poly([(hx - 16, hy + 14), (hx + 20, hy + 10), (hx + 22, hy + 30), (hx - 20, hy + 34)], fill=INK)
    _cast(a, draw)


@asset(G, "cutout-sheet", group="pieces", title="Halls cut-out: the hung laundry sheet", w=560, h=800, row=ROW_C)
def sheet(a: Art):
    """A laundry sheet pegged to a line across the hall, lit from behind so its folds show as bands of cream
    and shade; a shape behind it reads only by its height."""
    a.path("M0,70 Q280,104 560,70", fill="none", stroke=INK, stroke_width=4)
    top = [(40 + i * 48, 78 + 22 * math.sin(math.pi * (40 + i * 48) / 560) + (4 if i % 2 else 0)) for i in range(11)]
    bot = [(520 - i * 48, 742 + 10 * math.sin(i * 1.3)) for i in range(11)]
    d = a.smooth_d(top) + " L" + " L".join(f"{f(x)},{f(y)}" for x, y in bot) + "Z"
    cl = a.clip(f'<path d="{d}"/>')
    a.path(d, fill="#E9E2CF", stroke=INK, stroke_width=2, opacity=0.96)
    a.open("g", clip_path=cl)
    for i in range(11):
        x = 40 + i * 48
        a.rect(x - 10, 60, 20 + (i % 3) * 5, 720, fill=a.gradient([(0, "#8f876f"), (0.5, "#b8b097"), (1, "#E9E2CF")], 0, 0, 1, 0),
               opacity=0.55)
        a.rect(x + 22, 60, 9, 720, fill="#fff", opacity=0.35)
    # a tall shape behind, only a darkening
    a.open("g", opacity=0.22, filter=a.blur(10))
    kit.puppet(a, 280, 770, 190, k=3.2, pins=False, stride=0.1)
    a.close()
    kit.speckle(a, cl, 0, 60, 560, 720, color="#5d5644", strength=0.3, freq=0.7)
    a.close()
    for i in range(0, 11, 2):
        x, y = top[i]
        a.rect(x - 5, y - 20, 10, 34, rx=2, fill="#6b5a45", stroke=INK, stroke_width=1.5)
        a.line(x, y - 20, x, y + 14, stroke=INK, stroke_width=1)
    kit.stencil(a, 420, 716, "LDY 7", 22, fill="#5d5644")
    a.wobble([(x, y) for x, y in reversed(bot)], amp=1.5, step=12, stroke="#8f876f", stroke_width=3, opacity=0.7)


@asset(G, "cutout-flashlight", group="pieces", title="Halls cut-out: the flashlight and its cone", w=800, h=340, row=ROW_C)
def flashlight(a: Art):
    """A guard's flashlight and the cone it throws down the hall: hard and pale at the lens, thinning to nothing,
    with dust standing in it. Whatever the cone holds for a second and a half is seen."""
    cone = a.uid("cone")
    a.defn(f'<linearGradient id="{cone}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF3C4" '
           f'stop-opacity="0.92"/><stop offset="0.6" stop-color="#FFF3C4" stop-opacity="0.4"/><stop offset="1" '
           f'stop-color="#FFF3C4" stop-opacity="0"/></linearGradient>')
    a.poly([(128, 158), (790, 20), (790, 320), (128, 182)], fill=f"url(#{cone})")
    a.poly([(128, 164), (790, 110), (790, 230), (128, 176)], fill=f"url(#{cone})", opacity=0.6)
    a.stipple(180, 40, 600, 260, n=140, r=(0.8, 2.2), fill="#fff", opacity=0.7,
              density=lambda x, y: max(0, 1 - abs(y - 170) / ((x - 100) * 0.22)) * (1 - (x - 180) / 640))
    a.rect(18, 152, 84, 36, rx=6, fill=INK)
    a.poly([(100, 152), (130, 136), (130, 204), (100, 188)], fill=INK)
    a.rect(38, 146, 22, 8, rx=2, fill=INK)
    for x in (30, 44, 58, 72):
        a.line(x, 156, x, 184, stroke="#4a4e51", stroke_width=2)
    a.ellipse(130, 170, 5, 32, fill="#FFF8DC")
    a.circle(64, 170, 3, fill="#8a7a55")
    a.line(64, 170, 70, 340, stroke="#2b2620", stroke_width=3)

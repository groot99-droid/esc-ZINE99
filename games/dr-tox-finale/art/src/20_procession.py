"""Procession (2D, scroll): photocopied punk-zine collage.

Black toner on grey photocopy paper, figures cut out and pasted with a white cut edge, ransom-note
banner lettering, staples and strips of tape, toner streaks. The one colour on the page is what was pasted
on, never printed: the red tape (the arrow, STOP) and the scrap of shroud green that is him. Nobody is hurt
on the page; the shield line is a row of cut-out shields. Everyone in the march is an adult."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "procession"
TONER, PAPER, PAPER2 = kit.COPY, kit.COPYPAPER, "#d6d1c4"
TAPE, RED = "#efe7b8", kit.PULP_RED
FONTS = ("serif", "sans-serif", "monospace")


def toner(a, x, y, w, h, n=6, op=(0.05, 0.14)):
    """Vertical toner streaks down a sheet."""
    for _ in range(n):
        a.rect(x + a.rng.uniform(0, w), y, a.rng.uniform(2, 9), h, fill=TONER, opacity=a.rng.uniform(*op))


def specks(a, x, y, w, h, n=160):
    a.stipple(x, y, w, h, n=n, r=(0.6, 1.8), fill=TONER, opacity=0.45)


def cutout(a, d, fill=TONER, edge=7, rot=0, cx=0, cy=0):
    """A figure cut from a photocopy and pasted down: a white cut edge, the toner shape on it."""
    t = f"rotate({f(rot)} {f(cx)} {f(cy)})" if rot else None
    a.path(d, fill="#ffffff", stroke="#ffffff", stroke_width=edge, stroke_linejoin="round", transform=t)
    a.path(d, fill=fill, transform=t)


def ransom(a, x, y, text, size=40, seed_rot=6, pad=0.18):
    """Ransom-note lettering: each letter on its own scrap, alternating paper, toner and grey, mixed
    families, a little rotated. (x, y) is the baseline start. Returns the end x."""
    w = size * 0.92
    for i, ch in enumerate(text):
        if ch == " ":
            x += size * 0.42
            continue
        bg = ("#ffffff", TONER, PAPER2, "#ffffff")[i % 4]
        fg = "#ffffff" if bg == TONER else TONER
        r = a.rng.uniform(-seed_rot, seed_rot)
        cx, cy = x + w / 2, y - size * 0.38
        a.rect(x, y - size * (1 + pad), w, size * (1.0 + 2 * pad) * 0.92, fill=bg, stroke=TONER, stroke_width=max(1.5, size / 22),
               transform=f"rotate({f(r)} {f(cx)} {f(cy)})")
        kit.label(a, cx, y - size * 0.05, ch, size=size * 0.86, family=FONTS[i % 3], fill=fg, anchor="middle",
                  font_weight="bold", transform=f"rotate({f(r)} {f(cx)} {f(cy)})")
        x += w + size * 0.06
    return x


def staple(a, x, y, rot=0):
    a.rect(x, y, 30, 4, fill="#8a8a88", transform=f"rotate({f(rot)} {f(x + 15)} {f(y + 2)})")
    a.rect(x, y + 4, 30, 1.5, fill="#5a5a58", transform=f"rotate({f(rot)} {f(x + 15)} {f(y + 2)})")


def tape(a, x, y, w, h, rot=0):
    a.rect(x, y, w, h, fill=TAPE, opacity=0.62, transform=f"rotate({f(rot)} {f(x + w / 2)} {f(y + h / 2)})")


# ---- backdrops: two runs, three parallax layers each --------------------------------------------
def layer_far(a, perimeter):
    a.paper(PAPER, grain=0.5, fibre=1.2)
    toner(a, 0, 0, 1920, 540, 9)
    a.rect(0, 330, 1920, 210, fill=PAPER2)
    a.hatch(0, 330, 1920, 210, angle=8, spacing=6, stroke=TONER, stroke_width=1, opacity=0.18)
    if perimeter:                                  # the arcology, big and near, floodlit
        cutout(a, kit.P([(560, 330), (1360, 330), (1320, 280), (600, 280)], True), edge=6)
        for tx, tw, th in ((640, 140, 200), (800, 120, 270), (940, 150, 240), (1110, 130, 170)):
            cutout(a, kit.P([(tx, 282), (tx + tw, 282), (tx + tw, 282 - th), (tx, 282 - th)], True), edge=6)
            for k in range(1, th // 22):
                a.line(tx + 6, 282 - k * 22, tx + tw - 6, 282 - k * 22, stroke=PAPER2, stroke_width=1.2, opacity=0.6)
        for x in range(520, 1420, 100):
            a.circle(x, 300, 34, fill="#ffffff", opacity=0.7)
    else:                                          # the road at dawn: the city small on the horizon
        for tx, tw, th in ((1300, 40, 70), (1346, 34, 96), (1386, 44, 84), (1436, 32, 56)):
            cutout(a, kit.P([(tx, 330), (tx + tw, 330), (tx + tw, 330 - th), (tx, 330 - th)], True), edge=4)
        a.circle(420, 200, 70, fill="#ffffff", opacity=0.75)
        a.hatch(350, 130, 140, 140, angle=0, spacing=7, stroke=TONER, stroke_width=1, opacity=0.25,
                clip=a.clip('<circle cx="420" cy="200" r="70"/>'))
    specks(a, 0, 0, 1920, 540, 240)


def layer_mid(a, perimeter):
    """Mid layer: transparent above, pasted cut-outs along a band."""
    if perimeter:                                  # the perimeter fence and floodlight masts
        a.rect(0, 360, 1920, 14, fill=TONER)
        for x in range(0, 1920, 24):
            a.line(x, 300, x + 24, 374, stroke=TONER, stroke_width=1.5)
            a.line(x + 24, 300, x, 374, stroke=TONER, stroke_width=1.5)
        a.rect(0, 296, 1920, 6, fill=TONER)
        for x in (240, 720, 1200, 1680):
            cutout(a, kit.P([(x - 6, 374), (x + 6, 374), (x + 4, 150), (x - 4, 150)], True), edge=5)
            cutout(a, kit.P([(x - 40, 150), (x + 40, 150), (x + 34, 126), (x - 34, 126)], True), edge=5)
            a.path(f"M{x - 34},150 L{x - 140},374 L{x + 140},374 L{x + 34},150Z", fill="#ffffff", opacity=0.35)
        for x in (420, 980, 1500):                  # the shield line's barricade blocks
            cutout(a, kit.P([(x, 374), (x + 160, 374), (x + 150, 330), (x + 10, 330)], True), edge=5)
            kit.label(a, x + 80, 362, "RCC", size=22, fill="#ffffff", anchor="middle", font_weight="bold", letter_spacing="3")
    else:                                          # carts, tents and banner poles of the camp behind
        for k, x in enumerate((120, 520, 900, 1300, 1700)):
            cutout(a, kit.P([(x, 380), (x + 70, 300), (x + 140, 380)], True), edge=6, rot=a.rng.uniform(-3, 3), cx=x + 70, cy=340)
            a.line(x + 70, 300, x + 70, 230, stroke=TONER, stroke_width=4)
            a.rect(x + 70, 230, 70, 34, fill="#ffffff", stroke=TONER, stroke_width=2,
                   transform=f"rotate({f(a.rng.uniform(-6, 6))} {x + 105} 247)")
            a.path(kit.P([(x + 80, 254), (x + 92, 240), (x + 104, 254), (x + 118, 238), (x + 132, 254)]), fill="none",
                   stroke=TONER, stroke_width=3)
        a.rect(0, 380, 1920, 6, fill=TONER, opacity=0.5)
    for k in range(6):
        staple(a, 80 + k * 320 + a.rng.uniform(-30, 30), 110 + a.rng.uniform(-40, 40), a.rng.uniform(-20, 20))
    for k in range(3):
        tape(a, 300 + k * 600 + a.rng.uniform(-40, 40), 40 + a.rng.uniform(0, 60), 110, 28, a.rng.uniform(-14, 14))


def layer_near(a, perimeter):
    """Near layer: the road surface at the bottom, transparent above; dropped tracts and tread."""
    a.rect(0, 440, 1920, 100, fill=PAPER2)
    a.rect(0, 440, 1920, 5, fill=TONER)
    a.hatch(0, 440, 1920, 100, angle=-10, spacing=9, stroke=TONER, stroke_width=1.4, opacity=0.35,
            clip=a.clip('<rect x="0" y="440" width="1920" height="100"/>'))
    for k in range(9):
        x = 80 + k * 210 + a.rng.uniform(-30, 30)
        a.rect(x, 470 + a.rng.uniform(0, 40), 46, 32, fill="#ffffff", stroke=TONER, stroke_width=1.5,
               transform=f"rotate({f(a.rng.uniform(-30, 30))} {f(x + 23)} 496)")
    if perimeter:
        for x in (260, 1010, 1640):
            a.circle(x, 500, 46, fill="#ffffff", opacity=0.55)
        for x in (600, 1400):
            cutout(a, kit.P([(x, 540), (x + 200, 540), (x + 190, 470), (x + 10, 470)], True), edge=6)
    toner(a, 0, 0, 1920, 540, 4, (0.03, 0.07))


for _run, _per, _title in (("road", False, "the plain road at dawn (Procession 1)"),
                           ("perimeter", True, "the floodlit perimeter (Procession 2)")):
    for _lay, _fn, _what in (("far", layer_far, "far layer, opaque: sky, horizon and the city as pasted cut-outs"),
                             ("mid", layer_mid, "mid layer, transparent above: pasted props on a band"),
                             ("near", layer_near, "near layer, transparent above: the road surface and dropped tracts")):
        def _draw(a, fn=_fn, per=_per):
            fn(a, per)
        _draw.__doc__ = (f"Procession backdrop, {_title}, {_what}, all in black toner on grey photocopy paper with "
                         f"staples, tape and toner streaks. Tiles horizontally.")
        asset(G, f"procession-{_run}-{_lay}", group="backdrops", title=f"Procession: {_title} ({_lay} layer)",
              w=1920, h=540, row=kit.row(M, "Parallax backdrops, three layers per run"))(_draw)


# ---- figures: transparent sprites, feet on the bottom edge --------------------------------------
def tox_sprite(a, closed=True, hand=False, dart=False):
    x, y = a.w / 2, a.h - 6
    s = 1.7
    lean = 14 if dart else 0
    d = kit.tox_d(x, y, s, closed=closed, lean=lean)
    a.path(d, fill="#ffffff", stroke="#ffffff", stroke_width=9, stroke_linejoin="round")
    a.path(d, fill=kit.SHROUD)
    a.hatch(x - 60, y - 280, 120, 280, angle=70, spacing=6, stroke=TONER, stroke_width=1, opacity=0.35,
            clip=a.clip(f'<path d="{d}"/>'))
    if not closed:
        a.path(kit.tox_legs_d(x, y, s), fill=TONER)
    if hand:
        a.path(f"M{x + 26},{y - 200} L{x + 52},{y - 286} L{x + 66},{y - 286} L{x + 50},{y - 196}Z", fill=kit.SHROUD,
               stroke="#ffffff", stroke_width=4)
        a.path(f"M{x + 48},{y - 286} l-4,-20 l6,0 l4,18 l2,-24 l6,0 l0,24 l4,-20 l6,2 l-2,24 l6,-10 l5,4 l-8,22Z",
               fill=TONER, stroke="#ffffff", stroke_width=2)
    if dart:
        for k in range(3):
            a.line(x - 70 - k * 14, y - 150 + k * 40, x - 30 - k * 14, y - 150 + k * 40, stroke=TONER, stroke_width=4)
    tape(a, x - 30, y - 274, 60, 18, -8)


@asset(G, "procession-tox", group="figures", title="Procession: Dr. Tox, shroud closed (walking)", w=200, h=320,
       row=kit.row(M, "Figures: Dr. Tox"))
def p_tox(a: Art):
    """Dr. Tox pasted in as the one coloured scrap on the page: a narrow, hooded figure cut from shroud-green
    paper with a white cut edge, toner hatching on it, a strip of tape at the hood."""
    tox_sprite(a)


@asset(G, "procession-tox-open", group="figures", title="Procession: Dr. Tox, shroud open", w=200, h=320,
       row=kit.row(M, "Figures: Dr. Tox"))
def p_tox_open(a: Art):
    """The same cut-out with the shroud open from the shoulders, the narrow black figure showing down the
    front: the wider breath ring."""
    tox_sprite(a, closed=False)


@asset(G, "procession-tox-hand", group="figures", title="Procession: Dr. Tox, a hand raised (Stop.)", w=200, h=320,
       row=kit.row(M, "Figures: Dr. Tox"))
def p_tox_hand(a: Art):
    """The shroud cut-out with one arm raised and an open black glove at the top: the raised hand that
    says stop. A second's stillness."""
    tox_sprite(a, hand=True)


@asset(G, "procession-tox-dart", group="figures", title="Procession: Dr. Tox, darting (Procession 2)", w=200, h=320,
       row=kit.row(M, "Figures: Dr. Tox"))
def p_tox_dart(a: Art):
    """The shroud cut-out leaning hard forward with three toner speed lines behind it: the dart at the
    floodlight masts, Procession 2 only."""
    tox_sprite(a, dart=True)


MARCHERS = (
    ("walk-a", "a marcher walking, coat and bag", dict(lean=4), None),
    ("walk-b", "a marcher walking, a broader coat", dict(lean=-2, broad=1.25), None),
    ("banner", "a marcher carrying a banner pole with a photocopied cut-out on it", dict(lean=2), "banner"),
    ("jerrican", "a marcher carrying a water jerrican", dict(hunch=4), "jerrican"),
    ("reach", "a marcher reaching forward on purpose, one arm out: someone who wants into the ring", dict(lean=18), "reach"),
    ("stopped", "a marcher who has stopped and stepped back, both hands low and open", dict(lean=-10), "stopped"),
    ("home", "a marcher turned the other way, walking home: the back of the coat", dict(lean=-6, broad=1.1), "home"),
)


def marcher(key, what, kw, prop):
    def draw(a: Art):
        x, y = a.w / 2, a.h - 6
        s = 2.25
        d = kit.person_d(x, y, s, **kw)
        if prop == "banner":
            a.line(x + 40, y - 30, x + 52, y - 300, stroke="#ffffff", stroke_width=10)
            a.line(x + 40, y - 30, x + 52, y - 300, stroke=TONER, stroke_width=5)
            a.rect(x + 2, y - 312, 92, 56, fill="#ffffff", stroke=TONER, stroke_width=2, transform=f"rotate(-4 {x + 48} {y - 284})")
            a.circle(x + 48, y - 284, 18, fill="none", stroke=TONER, stroke_width=4)
            for k in range(8):
                t = k / 8 * 6.283
                a.circle(x + 48 + 18 * math.cos(t), y - 284 + 18 * math.sin(t), 3, fill=TONER)
        cutout(a, d, edge=8)
        if prop is None:                 # a coat seam and a bag strap, scratched into the toner
            a.line(x, y - 210, x, y - 96, stroke=PAPER2, stroke_width=2, opacity=0.6)
            a.line(x - 22, y - 196, x + 30, y - 120, stroke=PAPER2, stroke_width=3, opacity=0.7)
            a.rect(x + 22, y - 128, 30, 34, rx=4, fill=TONER, stroke=PAPER2, stroke_width=2)
        if prop == "jerrican":
            cutout(a, kit.P([(x + 30, y - 90), (x + 70, y - 90), (x + 72, y - 30), (x + 28, y - 30)], True), edge=5)
            a.rect(x + 40, y - 100, 14, 10, fill=TONER)
        elif prop == "reach":
            a.path(f"M{x + 30},{y - 200} C{x + 60},{y - 196} {x + 80},{y - 186} {x + 96},{y - 170}", fill="none",
                   stroke="#ffffff", stroke_width=20, stroke_linecap="round")
            a.path(f"M{x + 30},{y - 200} C{x + 60},{y - 196} {x + 80},{y - 186} {x + 96},{y - 170}", fill="none",
                   stroke=TONER, stroke_width=12, stroke_linecap="round")
        elif prop == "stopped":
            for sx in (-1, 1):
                a.path(f"M{x + sx * 40},{y - 150} l{sx * 16},26 l{sx * 4},-4", fill="none", stroke=TONER, stroke_width=8,
                       stroke_linecap="round")
        elif prop == "home":
            a.rect(x - 22, y - 200, 44, 70, rx=8, fill=PAPER2, stroke=TONER, stroke_width=2, opacity=0.9)
            a.line(x - 22, y - 186, x + 22, y - 186, stroke=TONER, stroke_width=2)
        a.stipple(x - 60, y - 290, 120, 290, n=70, r=(0.6, 1.4), fill="#ffffff", opacity=0.5,
                  density=lambda px, py: 0.6)
    draw.__doc__ = (f"Procession figure: {what}, cut from a photocopy with a white cut edge and pasted in black "
                    f"toner; no face, an adult. Name, want and one word are lettered above at run time.")
    asset(G, f"procession-marcher-{key}", group="figures", title=f"Procession: marcher ({key})", w=200, h=320,
          row=kit.row(M, "Figures: the march (cut-outs)"))(draw)


for _m in MARCHERS:
    marcher(*_m)


@asset(G, "procession-shield", group="figures", title="Procession: the shield line (State security)", w=200, h=320,
       row=kit.row(M, "Figures: the shield line (Procession 2)"))
def p_shield(a: Art):
    """A State security shield bearer cut from a photocopy: a helmeted outline behind a tall riot shield
    stamped RCC, the shield's face pasted on in grey paper; used in a row."""
    x, y = a.w / 2, a.h - 6
    cutout(a, kit.person_d(x - 10, y, 2.2, broad=1.3), edge=8)
    a.path(f"M{x - 34},{y - 268} C{x - 34},{y - 296} {x + 14},{y - 296} {x + 14},{y - 268}Z", fill=TONER)
    cutout(a, kit.P([(x - 20, y - 4), (x + 70, y - 4), (x + 76, y - 230), (x - 14, y - 236)], True), fill=PAPER2, edge=8)
    a.path(kit.P([(x - 20, y - 4), (x + 70, y - 4), (x + 76, y - 230), (x - 14, y - 236)], True), fill="none", stroke=TONER,
           stroke_width=4)
    a.rect(x + 6, y - 200, 48, 30, fill=TONER)
    kit.label(a, x + 30, y - 178, "RCC", size=18, fill="#ffffff", anchor="middle", font_weight="bold", letter_spacing="2")
    a.hatch(x - 20, y - 160, 96, 150, angle=80, spacing=7, stroke=TONER, stroke_width=1, opacity=0.35,
            clip=a.clip(f'<path d="{kit.P([(x - 20, y - 4), (x + 70, y - 4), (x + 76, y - 230), (x - 14, y - 236)], True)}"/>'))


# ---- pieces --------------------------------------------------------------------------------------
@asset(G, "procession-ring", group="pieces", title="Procession: the breath ring (torn white circle)", w=400, h=140,
       row=kit.row(M, "The breath ring"))
def p_ring(a: Art):
    """His breath ring as the zine has it: a flattened circle torn from white paper and pasted on the road
    under him, its edge dashed with toner, the middle left empty. Scale it to the radius."""
    d = a.wobble_d([(200 + 192 * math.cos(t / 40 * 6.283), 70 + 64 * math.sin(t / 40 * 6.283))
                    for t in range(40)], amp=4, step=20, closed=True)
    a.path(d, fill="#f7f4ec", opacity=0.85)
    a.path(d, fill="none", stroke=TONER, stroke_width=3, stroke_dasharray="4 3 12 3")
    a.ellipse(200, 70, 150, 44, fill="none", stroke=TONER, stroke_width=1, opacity=0.3)
    tape(a, 20, 52, 50, 16, -20)
    tape(a, 330, 64, 50, 16, 16)


@asset(G, "procession-cart", group="pieces", title="Procession: Dov's copier on its handcart", w=360, h=260,
       row=kit.row(M, "Obstacles: carts, poles and tracts"))
def p_cart(a: Art):
    """The salvaged copier strapped to a two-wheeled handcart, cut out in toner with a white edge, a
    stack of tract pages blowing off the top: it blocks the road and drops pages."""
    cutout(a, kit.P([(30, 190), (330, 190), (330, 210), (30, 210)], True), edge=6)
    cutout(a, kit.P([(80, 190), (290, 190), (290, 80), (80, 80)], True), edge=6)
    a.rect(100, 96, 170, 20, fill=PAPER2)
    a.rect(110, 130, 40, 12, fill="#ffffff")
    for cx in (90, 280):
        a.circle(cx, 220, 30, fill="#ffffff")
        a.circle(cx, 220, 26, fill=TONER)
        a.circle(cx, 220, 8, fill=PAPER2)
    a.line(330, 200, 354, 150, stroke=TONER, stroke_width=8)
    for k in range(4):
        a.rect(150 + k * 34, 50 - k * 12, 40, 28, fill="#ffffff", stroke=TONER, stroke_width=1.5,
               transform=f"rotate({-10 + k * 14} {170 + k * 34} {64 - k * 12})")
    a.line(80, 150, 290, 120, stroke=TONER, stroke_width=4)


@asset(G, "procession-pole", group="pieces", title="Procession: a banner pole planted in the road", w=160, h=360,
       row=kit.row(M, "Obstacles: carts, poles and tracts"))
def p_pole(a: Art):
    """A banner pole stuck upright in a bucket of stones with a photocopied cut-out on top: a ring of
    names; it blocks the walk."""
    cutout(a, kit.P([(40, 356), (120, 356), (112, 300), (48, 300)], True), edge=6)
    a.line(80, 300, 80, 60, stroke="#ffffff", stroke_width=12)
    a.line(80, 300, 80, 60, stroke=TONER, stroke_width=6)
    a.circle(80, 70, 56, fill="#ffffff", stroke=TONER, stroke_width=3)
    for k in range(12):
        t = k / 12 * 6.283
        px, py = 80 + 38 * math.cos(t), 70 + 38 * math.sin(t)
        kit.label(a, px, py + 4, "ABCDEFGHJKLM"[k] + "." , size=11, family="monospace", fill=TONER, anchor="middle",
                  font_weight="bold", transform=f"rotate({f(math.degrees(t) + 90)} {f(px)} {f(py)})")
    a.circle(80, 70, 22, fill="none", stroke=TONER, stroke_width=2)
    staple(a, 66, 18, 4)


@asset(G, "procession-tract", group="pieces", title="Procession: a tract page dropped on the road", w=120, h=90,
       row=kit.row(M, "Obstacles: carts, poles and tracts"))
def p_tract(a: Art):
    """A single photocopied tract page lying on the road, folded once, a cartoon panel and lines of type:
    anyone who stops to pick it up slows."""
    a.path("M10,20 L104,8 L112,74 L18,84Z", fill="#ffffff", stroke=TONER, stroke_width=2)
    a.line(58, 14, 64, 80, stroke=TONER, stroke_width=1, opacity=0.5)
    a.rect(22, 24, 30, 22, fill="none", stroke=TONER, stroke_width=1.5)
    a.circle(37, 35, 6, fill="none", stroke=TONER, stroke_width=1.5)
    for k in range(4):
        a.line(22, 54 + k * 6, 52, 53 + k * 6, stroke=TONER, stroke_width=1.5)
        a.line(68, 22 + k * 12, 100, 20 + k * 12, stroke=TONER, stroke_width=1.5)


def mast(a, lit):
    x = a.w / 2
    if lit:
        a.path(f"M{x - 30},70 L{x - 110},{a.h} L{x + 110},{a.h} L{x + 30},70Z", fill="#ffffff", opacity=0.6)
    cutout(a, kit.P([(x - 7, a.h - 4), (x + 7, a.h - 4), (x + 5, 70), (x - 5, 70)], True), edge=6)
    cutout(a, kit.P([(x - 46, 70), (x + 46, 70), (x + 38, 40), (x - 38, 40)], True), edge=6)
    for k in range(4):
        a.circle(x - 30 + k * 20, 60, 6, fill="#ffffff" if lit else TONER, stroke=TONER, stroke_width=2)
    if not lit:
        tape(a, x - 50, 44, 100, 24, -12)
        a.rect(x - 50, 44, 100, 24, fill=TONER, opacity=0.5, transform=f"rotate(-12 {x} 56)")


@asset(G, "procession-mast-lit", group="pieces", title="Procession: a floodlight mast, lit", w=240, h=480,
       row=kit.row(M, "Floodlight masts (Procession 2)"))
def p_mast_lit(a: Art):
    """A floodlight mast cut from toner with four lamps showing white and a wedge of bare paper under it,
    the light the guns see by."""
    mast(a, True)


@asset(G, "procession-mast-dark", group="pieces", title="Procession: a floodlight mast, blacked out", w=240, h=480,
       row=kit.row(M, "Floodlight masts (Procession 2)"))
def p_mast_dark(a: Art):
    """The same mast after a dart: the lamps filled black and a strip of blacked tape across them, no
    wedge of light for twenty seconds."""
    mast(a, False)


@asset(G, "procession-front-banner", group="pieces", title="Procession: the banner at the head of the march", w=560, h=200,
       row=kit.row(M, "The front"))
def p_front(a: Art):
    """The banner at the head of the march between two poles: HE IS THE RING in ransom-note letters cut
    from photocopies, stapled to a sheet; reaching it is reaching the front."""
    a.line(20, 196, 20, 10, stroke=TONER, stroke_width=8)
    a.line(540, 196, 540, 10, stroke=TONER, stroke_width=8)
    a.path("M20,24 L540,18 L536,130 L24,136Z", fill=PAPER, stroke=TONER, stroke_width=3)
    specks(a, 24, 20, 512, 112, 80)
    ransom(a, 40, 100, "HE IS THE RING", size=34)
    for x in (30, 520):
        staple(a, x - 10, 30, 70)


@asset(G, "procession-arrow", group="pieces", title="Procession: the red tape arrow (him, to the front)", w=300, h=80,
       row=kit.row(M, "Progress: the red tape arrow"))
def p_arrow(a: Art):
    """A strip of red tape torn and stuck down as an arrow pointing right, toward the front: the one red
    on the page that is not a word."""
    a.path("M4,26 L222,20 L224,6 L296,40 L224,74 L222,58 L6,56 L12,42Z", fill=RED, opacity=0.92)
    for x in (40, 75, 110, 145, 180):
        a.line(x, 24, x + 4, 54, stroke="#ffffff", stroke_width=1, opacity=0.25)


@asset(G, "procession-tape", group="pieces", title="Procession: a strip of tape (ornament)", w=160, h=48,
       row=kit.row(M, "Ornaments: tape and staples"))
def p_tape(a: Art):
    """A torn strip of yellowed clear tape, for pasting a label or a cut-out down at run time."""
    a.path("M4,8 L150,4 L156,14 L152,24 L157,36 L150,44 L6,44 L2,34 L7,24 L2,14Z", fill=TAPE, opacity=0.7)
    a.line(10, 12, 148, 9, stroke="#ffffff", stroke_width=1.5, opacity=0.5)
    for x in (40, 90, 130):
        a.circle(x, 30, 1.5, fill=TONER, opacity=0.3)


@asset(G, "procession-staple", group="pieces", title="Procession: a staple (ornament)", w=48, h=24,
       row=kit.row(M, "Ornaments: tape and staples"))
def p_staple(a: Art):
    """One office staple, seen flat, with its shadow, for pinning things to the page."""
    a.rect(6, 10, 36, 5, fill="#8a8a88")
    a.rect(6, 15, 36, 2, fill="#5a5a58")
    a.rect(4, 9, 3, 8, fill="#7a7a78")
    a.rect(41, 9, 3, 8, fill="#7a7a78")
    a.rect(8, 18, 32, 2, fill=TONER, opacity=0.2)
    a.line(8, 11, 40, 11, stroke="#c8c8c6", stroke_width=1)
    a.circle(6, 13, 1, fill="#5a5a58")


# ---- ui -----------------------------------------------------------------------------------------
@asset(G, "procession-strip", group="ui", title="Procession: the column strip (the march from above)", w=1200, h=80,
       row=kit.row(M, "Progress strip: the march as cut-out heads"))
def p_strip(a: Art):
    """The strip across the top of the page: a torn band of grey photocopy with the march as a column of
    forty cut-out heads, and a pasted FRONT label at the right end. His red arrow is laid over it at run
    time."""
    a.path("M4,8 L1196,4 L1194,74 L6,76Z", fill=PAPER2, stroke=TONER, stroke_width=3)
    for k in range(40):
        x = 30 + k * 26.5
        a.circle(x, 42 + (k % 3 - 1) * 4, 9, fill=TONER, opacity=0.85)
    a.rect(1100, 12, 86, 54, fill=PAPER, stroke=TONER, stroke_width=3, transform="rotate(3 1143 39)")
    kit.label(a, 1143, 48, "FRONT", size=20, fill=TONER, anchor="middle", font_weight="bold", transform="rotate(3 1143 39)")
    staple(a, 1110, 14, -10)


@asset(G, "procession-name-tag", group="ui", title="Procession: a name tag (blank, for name, want and word)", w=260, h=96,
       row=kit.row(M, "Labels over followers"))
def p_tag(a: Art):
    """A torn slip of white paper taped at a slant, three typed lines ruled faintly on it: a follower's
    name, want and one word are typed onto it at run time."""
    a.path("M8,14 L250,6 L254,82 L12,90Z", fill="#ffffff", stroke=TONER, stroke_width=2)
    for k in range(3):
        a.line(22, 34 + k * 20, 236, 30 + k * 20, stroke=TONER, stroke_width=0.8, opacity=0.25)
    tape(a, 100, -2, 60, 16, -4)
    specks(a, 10, 8, 240, 80, 30)


@asset(G, "procession-stop", group="ui", title="Procession: STOP. (ransom letters, red)", w=300, h=110,
       row=kit.row(M, "Words: the raised hand and the front"))
def p_stop(a: Art):
    """STOP. in ransom-note letters with the last scrap cut from red tape: the word over the raised hand."""
    ransom(a, 14, 84, "STOP", size=58)
    a.rect(258, 46, 26, 40, fill=RED, transform="rotate(8 271 66)")
    kit.label(a, 271, 80, ".", size=50, fill="#ffffff", anchor="middle", font_weight="bold")


@asset(G, "procession-go-home", group="ui", title="Procession: GO HOME. (ransom letters)", w=480, h=110,
       row=kit.row(M, "Words: the raised hand and the front"))
def p_go_home(a: Art):
    """GO HOME. in ransom-note letters, his words at the front of the march as the zine would print them."""
    x = ransom(a, 12, 84, "GO HOME", size=56)
    a.rect(x + 4, 50, 24, 36, fill="#ffffff", stroke=TONER, stroke_width=2, transform=f"rotate(-6 {f(x + 16)} 68)")
    kit.label(a, x + 16, 82, ".", size=46, fill=TONER, anchor="middle", font_weight="bold")

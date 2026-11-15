"""Short Rations: fifty-six stencilled ration-issue card faces, the back, and the WITHDRAWN overprint."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, GREEN, SODIUM, STEEL, FROST, SNOW, BRUISE, RED = (kit.INK, kit.CREAM, kit.GREEN, kit.SODIUM, kit.STEEL,
                                                              kit.FROST, kit.SNOW, kit.BRUISE, kit.RED)
ROW = "Card faces (7 suits x 8), back, WITHDRAWN overprint"
CW, CH = 300, 420
PENCIL = "#3b3a38"
WORDS = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT"]


def _blank(a, face=kit.CARD, wear=0.5):
    cl = a.clip('<rect x="4" y="4" width="292" height="412" rx="16"/>')
    a.rect(4, 4, 292, 412, rx=16, fill=face, stroke="#6f6750", stroke_width=2)
    kit.speckle(a, cl, 0, 0, CW, CH, color="#6f6750", strength=0.22, freq=0.8)
    a.open("g", clip_path=cl)
    for _ in range(int(3 + 9 * wear)):
        sx, sy = a.rng.uniform(10, 290), a.rng.uniform(10, 410)
        a.ellipse(sx, sy, a.rng.uniform(6, 30), a.rng.uniform(1.5, 6), fill="#b3a786", opacity=0.3,
                  transform=f"rotate({f(a.rng.uniform(-40, 40))} {f(sx)} {f(sy)})")
    c = a.rng.choice([(296, 4, -1, 1), (4, 416, 1, -1), (296, 416, -1, -1)])
    L = a.rng.uniform(26, 54)
    a.line(c[0] + c[2] * L, c[1], c[0], c[1] + c[3] * L, stroke="#9b9072", stroke_width=1.5)
    a.poly([(c[0] + c[2] * L, c[1]), (c[0], c[1]), (c[0], c[1] + c[3] * L)], fill="#000", opacity=0.06)
    a.close()
    return cl


def _pips(n):
    """Playing-card layouts in a unit box."""
    L = {1: [(0.5, 0.5)], 2: [(0.3, 0.28), (0.7, 0.72)], 3: [(0.28, 0.22), (0.5, 0.5), (0.72, 0.78)],
         4: [(0.27, 0.25), (0.73, 0.25), (0.27, 0.75), (0.73, 0.75)],
         5: [(0.25, 0.2), (0.75, 0.2), (0.5, 0.5), (0.25, 0.8), (0.75, 0.8)],
         6: [(0.25, 0.17), (0.75, 0.17), (0.25, 0.5), (0.75, 0.5), (0.25, 0.83), (0.75, 0.83)],
         7: [(0.25, 0.15), (0.75, 0.15), (0.5, 0.33), (0.25, 0.52), (0.75, 0.52), (0.25, 0.86), (0.75, 0.86)],
         8: [(0.25, 0.13), (0.75, 0.13), (0.5, 0.3), (0.25, 0.48), (0.75, 0.48), (0.5, 0.67), (0.25, 0.86), (0.75, 0.86)]}
    return L[n]


def _pic_hands(a, n):
    def one(x, y, k, s, side):
        # count index first, then middle, ring, little, and the thumb last
        up = [k >= 4, k >= 3, k >= 2, k >= 1]
        curl = tuple(0.0 if u else 0.92 for u in up)
        kit.hand_top(a, x, y, rot=0, side=side, scale=s, curl=curl, thumb=58 if k >= 5 else 14,
                     thumb_curl=0.0 if k >= 5 else 0.9, sleeve=None, shadow=False, spread=1.25)
        a.rect(x - 30 * s, y + 4 * s, 60 * s, 30 * s, rx=4, fill="#56664f", stroke=INK, stroke_width=2)
        a.path("".join(f"M{f(x - 22 * s + i * 9 * s)},{f(y + 10 * s)}l{f(4 * s)},{f(16 * s)}" for i in range(6)), stroke=INK,
               stroke_width=1, opacity=0.4)
    if n <= 5:
        one(150, 304, n, 1.28, 1)
    else:
        one(100, 300, 5, 0.92, 1)
        one(204, 300, n - 5, 0.92, -1)


def _pic_keys(a, n):
    cx, cy = 150, 138
    a.path(a.wobble_d(kit.circ_pts(cx, cy, 24, 16), 1.0, 8, True), fill="none", stroke=INK, stroke_width=4)
    a.path(a.wobble_d(kit.circ_pts(cx, cy, 24, 16), 1.0, 8, True), fill="none", stroke=STEEL, stroke_width=1.4)
    span = min(150, 28 * n)
    for i in range(n):
        ang = (-span / 2 + span * (i + 0.5) / n) if n > 1 else 0
        L = a.rng.uniform(112, 150) - abs(ang) * 0.25
        a.open("g", transform=f"translate({cx},{cy}) rotate({f(ang + a.rng.uniform(-3, 3))}) translate(0,22)")
        a.path(a.wobble_d(kit.circ_pts(0, 14, 14, 10, ry=16), 0.8, 7, True), fill=STEEL, stroke=INK, stroke_width=2.6)
        a.circle(0, 10, 4.5, fill=kit.CARD, stroke=INK, stroke_width=1.5)
        a.wobble([(0, 30), (0, L)], amp=0.8, step=12, stroke=INK, stroke_width=4.6, stroke_linecap="round")
        teeth = a.rng.randint(2, 4)
        sd = a.rng.choice((-1, 1))
        for t in range(teeth):
            ty = L - 4 - t * 9
            a.line(0, ty, sd * a.rng.uniform(7, 15), ty, stroke=INK, stroke_width=4)
        a.close()


def _pic_anchors(a, n):
    kit.suit(a, "anchors", 108, 282, 56, color=INK, sw=5)
    kit.suit(a, "anchors", 109, 283, 56, color=FROST, sw=1.6)
    # the chain: one link a card
    pts = []
    for i in range(n):
        t = i / 7
        pts.append((110 + 96 * math.sin(t * 2.9) + 4 * i, 222 - i * 15.5))
    for i, (x, y) in enumerate(pts):
        if i + 1 < len(pts):
            ang = math.degrees(math.atan2(pts[i + 1][1] - y, pts[i + 1][0] - x))
        elif i:
            ang = math.degrees(math.atan2(y - pts[i - 1][1], x - pts[i - 1][0]))
        else:
            ang = -60
        rx, ry = (15, 8.5) if i % 2 == 0 else (15, 4.5)
        a.open("g", transform=f"rotate({f(ang)} {f(x)} {f(y)})")
        a.path(a.wobble_d(kit.circ_pts(x, y, rx, 12, ry=ry), 0.7, 6, True), fill="none", stroke=INK, stroke_width=4)
        a.path(a.wobble_d(kit.circ_pts(x, y, rx, 12, ry=ry), 0.5, 6, True), fill="none", stroke=FROST, stroke_width=1.2)
        a.close()
    # water
    for wy in (318, 332):
        a.wobble([(48 + i * 12, wy + 3 * math.sin(i * 1.3 + wy)) for i in range(18)], amp=0.8, step=8, stroke=FROST,
                 stroke_width=2)


def _pic_houses(a, n):
    hill = [(40, 300), (90, 282), (150, 290), (210, 270), (262, 284)]
    back = [(40, 232), (100, 216), (160, 226), (262, 204)]
    spots = []
    front = min(n, 4)
    for i in range(front):
        spots.append((62 + i * (176 / max(1, front - 1)) if front > 1 else 150, 262 - (i % 2) * 10, 27))
    for i in range(n - front):
        spots.append((76 + i * 50, 190 - (i % 2) * 12, 19))
    if n > 4:
        a.wobble(back, amp=1.5, step=12, stroke=PENCIL, stroke_width=1.6, opacity=0.8)
    for x, y, r in sorted(spots, key=lambda s: s[2]):
        a.rect(x - r * 0.7, y - r * 0.05, r * 1.4, r * 0.9, fill=kit.CARD)
        kit.suit(a, "houses", x, y, r, color=INK, sw=2.8 if r > 22 else 2.2)
        a.rect(x + r * 0.3, y - r * 0.95, r * 0.22, r * 0.5, fill=INK)
    # one window lit: the first house, where the letters go
    x, y, r = spots[0]
    a.rect(x - r * 0.52, y + r * 0.2, r * 0.3, r * 0.3, fill=SODIUM, stroke=INK, stroke_width=1.5)
    a.wobble([(x + r * 0.4, y - r), (x + r * 0.55, y - r * 1.5), (x + r * 0.35, y - r * 1.9), (x + r * 0.6, y - r * 2.4)],
             amp=1.5, step=8, stroke=PENCIL, stroke_width=1.6, opacity=0.7)
    a.wobble(hill, amp=1.5, step=12, stroke=INK, stroke_width=2.4)
    kit.hatch_in(a, 40, 296, 222, 40, angle=-18, spacing=7, stroke=GREEN, stroke_width=1.6, opacity=0.8, jitter=2)


def _pic_sparks(a, n):
    bx, by, top = 150, 338, 196
    a.path(f"M{bx - 30},{by} L{bx},{top} L{bx + 30},{by}", fill="none", stroke=INK, stroke_width=3.2, stroke_linejoin="round")
    d = ""
    for i in range(5):
        t0, t1 = i / 5, (i + 1) / 5
        y0, y1 = by - (by - top) * t0, by - (by - top) * t1
        w0, w1 = 30 * (1 - t0), 30 * (1 - t1)
        d += f"M{f(bx - w0)},{f(y0)}L{f(bx + w1)},{f(y1)}M{f(bx + w0)},{f(y0)}L{f(bx - w1)},{f(y1)}"
    a.path(d, stroke=INK, stroke_width=1.6, fill="none")
    a.line(bx, top, bx, top - 26, stroke=INK, stroke_width=3)
    a.line(bx - 50, by, bx + 50, by, stroke=INK, stroke_width=3)
    for r in (24, 40):
        a.path(f"M{f(bx - r)},{f(top - 26)} A{r},{r} 0 0 1 {f(bx + r)},{f(top - 26)}", fill="none", stroke=PENCIL,
               stroke_width=1.4, stroke_dasharray="5 5", opacity=0.7)
    for i in range(n):
        ang = math.radians(-90 + (i - (n - 1) / 2) * (200 / max(n, 4)))
        rr = 78 if (i % 2 == 0 or n < 5) else 58
        x, y = bx + math.cos(ang) * rr, top - 26 + math.sin(ang) * rr * 0.92
        a.open("g", transform=f"rotate({f(math.degrees(ang) + 90)} {f(x)} {f(y)})")
        kit.suit(a, "sparks", x, y, 17, color=INK, sw=2.4, fill=SODIUM)
        a.close()


CONST = [(0.5, 0.12), (0.2, 0.3), (0.78, 0.36), (0.42, 0.5), (0.12, 0.62), (0.86, 0.66), (0.6, 0.78), (0.3, 0.86)]


def _pic_stars(a, n):
    x0, y0, w, h = 44, 112, 212, 180
    pts = [(x0 + px * w, y0 + py * h) for px, py in CONST[:n]]
    if n > 1:
        a.wobble(pts, amp=0.8, step=14, stroke=PENCIL, stroke_width=1.2, opacity=0.6, stroke_dasharray="4 4")
    for i, (x, y) in enumerate(pts):
        r = 15 + (i * 7 % 5) * 2
        a.open("g", transform=f"rotate({f(a.rng.uniform(-14, 14))} {f(x)} {f(y)})")
        a.circle(x, y, r * 0.5, fill=kit.CARD)
        kit.suit(a, "stars", x, y, r, color=BRUISE, sw=2.6)
        a.close()
    # the wire he means to be the other side of, next week
    a.wobble([(38, 322), (262, 318)], amp=0.8, step=16, stroke=INK, stroke_width=1.6)
    a.wobble([(38, 334), (262, 330)], amp=0.8, step=16, stroke=INK, stroke_width=1.6)
    for i in range(6):
        px = 46 + i * 42
        a.wobble([(px, 344), (px + 1, 306)], amp=0.6, step=10, stroke=INK, stroke_width=3.4, stroke_linecap="round")
        a.line(px + 1, 306, px + 9, 300, stroke=INK, stroke_width=2.4)


def _pic_stamp(a, n):
    a.path("".join(f"M48,{y}H252" for y in range(128, 340, 22)), stroke=FROST, stroke_width=1, opacity=0.7, fill="none")
    kit.typed(a, 48, 122, "RESULTS", size=12, fill=PENCIL, ghost=False)
    a.open("g", filter=kit.ink_filter(a, 0.55, 1.5), opacity=0.88)
    for i, (px, py) in enumerate(_pips(n)):
        x, y = 54 + px * 192, 126 + py * 206
        r = 30 if n <= 4 else 25
        a.open("g", transform=f"rotate({f(a.rng.uniform(-28, 28))} {f(x)} {f(y)})")
        kit.suit(a, "stamp", x, y, r, color=RED, sw=3.2)
        a.close()
    a.close()


PICS = {"hands": _pic_hands, "keys": _pic_keys, "anchors": _pic_anchors, "houses": _pic_houses, "sparks": _pic_sparks,
        "stars": _pic_stars, "stamp": _pic_stamp}
WHAT = {"hands": "a hand counting {n} on its fingers", "keys": "a ring carrying {n}",
        "anchors": "an anchor on a chain of {n}", "houses": "a hillside of {n}, one window lit",
        "sparks": "a radio mast throwing {n}", "stars": "{n} over the wire, joined in pencil",
        "stamp": "the project stamp struck {n} on a form"}
UNIT = {"hands": "", "keys": " keys", "anchors": " links", "houses": " houses", "sparks": " sparks", "stars": " stars",
        "stamp": " times"}


def _face(a, s, n):
    _blank(a, wear=a.rng.uniform(0.2, 0.9))
    a.rect(16, 16, 268, 388, rx=9, fill="none", stroke=INK, stroke_width=2.4, stroke_dasharray="20 5")
    col = kit.TINT[s] if s != "hands" else INK

    def index():
        kit.stencil(a, 28, 78, str(n), 60)
        kit.suit(a, s, 47, 102, 13, color=RED if s == "stamp" else INK, sw=2)
    index()
    a.open("g", transform=f"rotate(180 {CW / 2} {CH / 2})")
    index()
    a.close()
    # issue punches: one hole a rank
    for i in range(8):
        x = 110 + i * 22
        if i < n:
            a.circle(x, 44, 6.5, fill=INK)
            a.circle(x - 1.5, 42.5, 2, fill="#4a4e51")
        else:
            a.circle(x, 44, 6.5, fill="none", stroke=INK, stroke_width=1.3, stroke_dasharray="3 2.5")
    kit.typed(a, 108, 72, f"ISSUE {n}/8", size=13, ghost=False)
    PICS[s](a, n)
    kit.stencil(a, 30, 388, s.upper() if s != "stamp" else "7-F", 22, fill=col if s not in ("sparks",) else "#8a6a1c")
    kit.typed(a, 32, 364, WORDS[n - 1], size=13, ghost=False, fill=PENCIL)


for _s in kit.SUITS:
    for _n in range(1, 9):
        def _mk(s=_s, n=_n):
            def fn(a: Art):
                _face(a, s, n)
            fn.__doc__ = (f"Ration-issue card, the {n} of {s.capitalize()} ({kit.OWNER[s]}'s suit): worn card stock, the rank "
                          f"in army stencil at two corners, {n} of eight issue holes punched, and drawn by hand in the "
                          f"middle " + WHAT[s].format(n=f"{n}{UNIT[s]}") + ".")
            return fn
        asset(G, f"card-{_s}-{_n}", group="cards", title=f"Short Rations: {_n} of {_s.capitalize()}", w=CW, h=CH,
              row=ROW)(_mk())


@asset(G, "card-back", group="cards", title="Short Rations: card back", w=CW, h=CH, row=ROW)
def card_back(a: Art):
    """The back of the ration-issue deck: institutional green crossed with a stencilled lattice, a cream roundel
    in the middle carrying the form number, worn pale at the corners where six men have dealt it."""
    cl = _blank(a, face="#4d6052", wear=0.3)
    a.open("g", clip_path=cl)
    kit.hatch_in(a, 22, 22, 256, 376, angle=45, spacing=22, stroke=CREAM, stroke_width=5, opacity=0.5)
    kit.hatch_in(a, 22, 22, 256, 376, angle=-45, spacing=22, stroke=CREAM, stroke_width=5, opacity=0.5)
    kit.hatch_in(a, 22, 22, 256, 376, angle=45, spacing=22, stroke="#4d6052", stroke_width=1.5)
    for cx, cy in ((4, 4), (296, 4), (4, 416), (296, 416)):
        a.circle(cx, cy, 46, fill=a.radial([(0, CREAM, 0.6), (1, CREAM, 0)]))
    a.close()
    a.rect(16, 16, 268, 388, rx=9, fill="none", stroke=CREAM, stroke_width=5)
    a.rect(24, 24, 252, 372, rx=5, fill="none", stroke=CREAM, stroke_width=1.5, stroke_dasharray="12 4")
    a.circle(150, 210, 74, fill=CREAM, stroke=INK, stroke_width=3)
    a.circle(150, 210, 64, fill="none", stroke=INK, stroke_width=1.5, stroke_dasharray="6 4")
    kit.stencil(a, 150, 226, "7-F", 46, anchor="middle")
    kit.typed(a, 150, 182, "RATION", size=14, anchor="middle", ghost=False)
    kit.typed(a, 150, 252, "ISSUE", size=14, anchor="middle", ghost=False)
    for y in (70, 350):
        a.rect(84, y - 20, 132, 30, fill="#4d6052")
        kit.stencil(a, 150, y, "ISSUE", 24, fill=CREAM, anchor="middle")
    kit.speckle(a, cl, 0, 0, CW, CH, color="#1b1d1f", strength=0.3, freq=0.9)


@asset(G, "card-withdrawn-overprint", group="cards", title="Short Rations: the WITHDRAWN overprint", w=CW, h=CH, row=ROW)
def withdrawn(a: Art):
    """The rubber stamp that marks an empty chair's eight: WITHDRAWN in red, boxed, struck crooked across the
    card with a fainter second strike beside it and flecks where the pad was too wet. Transparent, to
    lay over any eight."""
    kit.stamp(a, 158, 226, "WITHDRAWN", w=286, h=64, rot=-27, opacity=0.25, patch=1.3)
    kit.stamp(a, 150, 214, "WITHDRAWN", w=286, h=64, rot=-24, opacity=0.92, patch=0.75)
    a.open("g", fill=RED, opacity=0.7)
    for _ in range(16):
        x, y = a.rng.uniform(30, 270), a.rng.uniform(110, 320)
        a.circle(x, y, a.rng.uniform(0.8, 2.6))
    a.close()
    a.wobble([(34, 330), (120, 292)], amp=1.5, step=12, stroke=RED, stroke_width=2, opacity=0.35)

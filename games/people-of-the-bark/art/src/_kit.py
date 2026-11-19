"""People of the Bark: the palette and the shared hand for the art drawn by code.

Palette and rules are DEEP_DIVE.md section 4 (the style bible). Several helpers are copied from
`pictographs/make.py` so the cards, plates, doors and boards sit beside the pictographs.
"""
import math

from artkit import f

G = "people-of-the-bark"
UMBER, UMBER_D, CRACK, GREYBROWN = "#5a3d2b", "#3a281c", "#1b120c", "#7d6c5a"
SAGE, LIME = "#8fa37a", "#c4d65a"
AMBER, GOLD, LANTERN = "#d9902a", "#f0c050", "#e8742a"
PAPER, PAPER_D = "#efe2c4", "#d8c49a"
CHALK = "#b9c2c4"                      # the Pulse alone
INK, RUBRIC, AZURE, LEAF = "#2b1d14", "#a8321e", "#2f4f8a", "#5f7a3e"
SKIN = "#d9b88a"
GRASS, SKY, FENCE = "#7fae5a", "#bfdcec", "#f4f1e6"   # the backyard: ordinary daylight

SUITS = ["wind", "rain", "song", "tremor", "leaf", "mandible"]
SIGILS = ["eye", "spear", "quill"]


def shade(hexc, k):
    c = [int(hexc[i:i + 2], 16) for i in (1, 3, 5)]
    c = [max(0, min(255, int(v * k))) for v in c]
    return "#" + "".join(f"{v:02x}" for v in c)


def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{int(x + (y - x) * t):02x}" for x, y in zip(a, b))


# ---------------------------------------------------------------------------------------------
# bark: the macro diorama surface, lit by one low warm source
# ---------------------------------------------------------------------------------------------
def bark_fx(a, light="#ffc890", freq=(0.028, 0.005), scale=9, az=205, el=38, octaves=4):
    """A filter that turns any flat shape into lit, furrowed bark. Returns 'url(#id)'."""
    fid = a.uid("bark")
    a.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">'
           f'<feTurbulence type="fractalNoise" baseFrequency="{freq[0]} {freq[1]}" numOctaves="{octaves}" '
           f'seed="{a.seed % 991}"/>'
           f'<feDiffuseLighting surfaceScale="{scale}" diffuseConstant="1.2" lighting-color="{light}">'
           f'<feDistantLight azimuth="{az}" elevation="{el}"/></feDiffuseLighting>'
           f'<feBlend in2="SourceGraphic" mode="multiply"/><feComposite in2="SourceGraphic" operator="in"/>'
           f'</filter>')
    return f"url(#{fid})"


def bark(a, x=0, y=0, w=None, h=None, base="#a67c56", **kw):
    w = a.w if w is None else w
    h = a.h if h is None else h
    a.rect(x, y, w, h, fill=base, filter=bark_fx(a, **kw))


def fissure_d(a, x, y0, y1, wander=18, step=26):
    """A wandering vertical crack as a closed sliver."""
    r = a.rng
    pts, yy, xx = [], y0, x
    while yy < y1:
        pts.append((xx, yy))
        yy += step * r.uniform(0.6, 1.4)
        xx += r.uniform(-wander, wander)
    pts.append((xx, y1))
    n = len(pts)
    left = [(px - (2 + 7 * math.sin(math.pi * i / max(1, n - 1)) * r.uniform(0.5, 1.2)), py)
            for i, (px, py) in enumerate(pts)]
    right = [(px + (2 + 7 * math.sin(math.pi * i / max(1, n - 1)) * r.uniform(0.5, 1.2)), py)
             for i, (px, py) in enumerate(pts)]
    return "M" + " L".join(f"{f(px)},{f(py)}" for px, py in left + right[::-1]) + "Z"


def fissures(a, x, y, w, h, n=6, fill=CRACK, opacity=0.85):
    r = a.rng
    d = []
    for i in range(n):
        fx = x + w * (i + r.uniform(0.2, 0.8)) / n
        y0 = y + h * r.uniform(-0.05, 0.3)
        d.append(fissure_d(a, fx, y0, y0 + h * r.uniform(0.35, 0.9)))
    a.path("".join(d), fill=fill, opacity=opacity)


def glow(a, x, y, r, col=LANTERN, strength=0.9):
    a.circle(x, y, r, fill=a.radial([(0, col, strength), (0.35, col, strength * 0.45), (1, col, 0)]))


def lantern(a, x, y, s=1.0, halo=60):
    """A glow-lichen lantern: a small bright bead with a wide soft halo."""
    glow(a, x, y, halo * s, LANTERN, 0.75)
    a.circle(x, y, 5 * s, fill=GOLD)
    a.circle(x, y, 2.4 * s, fill="#fff6dc")


def dust(a, x, y, w, h, n=120, col="#ffe9c0", opacity=0.5):
    a.stipple(x, y, w, h, n=n, r=(0.5, 1.8), fill=col, opacity=opacity)


def carve(a, x, y, s, size=60, anchor="middle", fill=CRACK, light="#e9b77c", spacing=4, family="serif", depth=2.5,
          weight="bold"):
    """Lettering cut into the bark: a lit lower-right lip, then the dark cut."""
    kw = dict(size=size, family=family, text_anchor=anchor, letter_spacing=spacing, font_weight=weight)
    a.text(x + depth, y + depth, s, fill=light, opacity=0.75, **kw)
    a.text(x - depth * 0.5, y - depth * 0.5, s, fill="#000", opacity=0.5, **kw)
    a.text(x, y, s, fill=fill, **kw)


def rings(a, cx, cy, n, r0=14, gap=11, stroke=CRACK, light="#e9b77c", width=3.2, wob=0.06, lit_last=None):
    """A ring counter: n carved growth rings round a pith. The newest ring may be lit."""
    r = a.rng
    ph = [r.uniform(0, 6.28) for _ in range(3)]

    def d(rr, dx=0.0, dy=0.0):
        pts = []
        for i in range(48):
            t = 2 * math.pi * i / 48
            k = 1 + wob * (math.sin(2 * t + ph[0]) * 0.5 + math.sin(3 * t + ph[1]) * 0.3 + math.sin(5 * t + ph[2]) * 0.2)
            pts.append((cx + dx + rr * k * math.cos(t), cy + dy + rr * k * math.sin(t)))
        return a.smooth_d(pts, closed=True)
    a.circle(cx, cy, r0 * 0.45, fill=stroke)
    for i in range(n):
        rr = r0 + i * gap
        a.path(d(rr, 1.6, 1.6), fill="none", stroke=light, stroke_width=width * 0.7, opacity=0.6)
        last = lit_last and i == n - 1
        a.path(d(rr), fill="none", stroke=lit_last if last else stroke, stroke_width=width * (1.25 if last else 1))


# ---------------------------------------------------------------------------------------------
# the people: large heads, long thin limbs
# ---------------------------------------------------------------------------------------------
def person(a, x, y, s=1.0, kind="plain", lean=0.0, flip=1, arms=((-13, -40), (13, -40)), stride=4, cloth=GREYBROWN,
           skin=SKIN, ink=INK, sil=None, extra=None, crest=None, eye=True, hood=None):
    """A bark person about 100*s tall, feet at (x, y). kind: plain, robe, plate, apron.
    `arms` are the two hand positions in local units (feet 0,0; head top about -98).
    `extra(a)` draws accessories in the same local frame. `sil` paints a flat silhouette."""
    a.open("g", transform=f"translate({f(x)} {f(y)}) rotate({f(lean)}) scale({f(s * flip, )} {f(s)})")
    if sil:
        cloth = skin = ink = sil
    lk = dict(fill="none", stroke=ink, stroke_width=3.0, stroke_linecap="round", stroke_linejoin="round")

    def arm(side, hx, hy):
        sx, sy = side * 8, -64
        mx, my = (sx + hx) / 2 + side * 3, (sy + hy) / 2 + 4
        a.path(f"M{f(sx)},{f(sy)} L{f(mx)},{f(my)} L{f(hx)},{f(hy)}", **dict(lk, stroke_width=2.6))
        a.circle(hx, hy, 2.2, fill=skin, stroke=ink, stroke_width=0.8)
    arm(-1, *arms[0])
    if kind != "robe":
        a.path(f"M-4,-40 L{f(-4 - stride * 0.7)},-20 L{f(-5 - stride)},0 l-5,0", **lk)
        a.path(f"M4,-40 L{f(4 + stride * 0.4)},-20 L{f(5 + stride)},0 l5,0", **lk)
    else:
        a.path("M-7,-6 l-1,6 l-4,0 M7,-6 l1,6 l4,0", **lk)
    bk = dict(fill=cloth, stroke=ink, stroke_width=1.4, stroke_linejoin="round")
    if kind == "robe":
        a.path("M-9,-69 L9,-69 Q14,-40 17,-5 Q0,-1 -17,-5 Q-14,-40 -9,-69Z", **bk)
        a.path("M0,-66 L1,-6", fill="none", stroke=ink, stroke_width=0.9, opacity=0.6)
    else:
        a.path("M-9,-69 L9,-69 L11,-38 Q0,-34 -11,-38Z", **bk)
        if kind == "plate":
            a.path("M-10,-58 L10,-58 M-10.5,-48 L10.5,-48", fill="none", stroke=ink, stroke_width=1.2)
            a.path("M-13,-70 l8,-2 l0,7 l-8,2Z M13,-70 l-8,-2 l0,7 l8,2Z", fill=shade(cloth, 1.25) if not sil else sil,
                   stroke=ink, stroke_width=1)
        elif kind == "apron":
            a.path("M-6,-64 L6,-64 L7,-30 L-7,-30Z", fill=PAPER if not sil else sil, stroke=ink, stroke_width=1)
            if not sil:
                a.circle(2, -46, 2.2, fill=ink, opacity=0.7)
                a.circle(-3, -38, 1.4, fill=ink, opacity=0.7)
    if kind == "robe" or hood:
        hc = hood or cloth
        a.path("M-16,-72 Q-20,-102 0,-103 Q14,-102 13,-90 L10,-72 Q0,-66 -16,-72Z", fill=hc if not sil else sil,
               stroke=ink, stroke_width=1.4)
        a.circle(3, -84, 10.5, fill=skin, stroke=ink, stroke_width=1.2)
    else:
        a.circle(0, -84, 14, fill=skin, stroke=ink, stroke_width=1.4)
        if kind == "plate":
            a.path("M-14.5,-85 A14.5,14.5 0 0,1 14.5,-85 L15,-81 L-15,-81Z", fill=UMBER if not sil else sil,
                   stroke=ink, stroke_width=1.2)
            if crest:
                a.path("M-6,-98 Q4,-120 22,-110 Q10,-108 6,-97Z", fill=crest if not sil else sil, stroke=ink,
                       stroke_width=1.2)
        else:
            a.path("M-14,-86 A14,14 0 0,1 12,-91 Q0,-90 -14,-86Z", fill=UMBER_D if not sil else sil)
    if eye and not sil:
        a.circle(6 if kind != "robe" else 8, -85, 1.7, fill=ink)
    arm(1, *arms[1])
    if extra:
        extra(a)
    a.close()


def cane(a, x=16, top=-52, col=INK):
    a.path(f"M{f(x)},0 L{f(x)},{f(top)} q0,-7 -6,-6", fill="none", stroke=col, stroke_width=2.4, stroke_linecap="round")


def spear(a, x=17, top=-112, col=INK, tip="#f6e8c8"):
    a.line(x, 2, x, top + 12, stroke=col, stroke_width=2.2, stroke_linecap="round")
    a.poly([(x, top), (x - 4, top + 14), (x + 4, top + 14)], fill=tip, stroke=col, stroke_width=1)


def scarf(a, col=RUBRIC, ink=INK, long=38):
    a.path(f"M-9,-70 Q0,-64 9,-70 L8,-66 Q0,-60 -9,-66Z M-8,-67 Q{f(-long * 0.5)},-74 {f(-long)},-62 "
           f"Q{f(-long - 8)},-58 {f(-long - 14)},-66 l2,8 Q{f(-long * 0.6)},-56 -8,-62Z", fill=col, stroke=ink,
           stroke_width=1)


def kite(a, x, y, s=1.0, tail=((0, 0),), col=PAPER_D, ink=INK, string_to=None):
    """Twig's kite: a bark flake on a spider-silk thread."""
    if string_to:
        mx, my = (x + string_to[0]) / 2 + 10 * s, (y + string_to[1]) / 2 + 14 * s
        a.path(f"M{f(x)},{f(y + 12 * s)} Q{f(mx)},{f(my)} {f(string_to[0])},{f(string_to[1])}", fill="none",
               stroke=ink, stroke_width=0.9 * max(0.6, s), opacity=0.8)
    pts = [(x, y - 16 * s), (x + 10 * s, y - 3 * s), (x + 3 * s, y + 13 * s), (x - 9 * s, y + 2 * s)]
    a.poly(pts, fill=col, stroke=ink, stroke_width=1.2 * max(0.7, s), stroke_linejoin="round")
    a.line(x, y - 16 * s, x + 3 * s, y + 13 * s, stroke=ink, stroke_width=0.7)
    a.line(x - 9 * s, y + 2 * s, x + 10 * s, y - 3 * s, stroke=ink, stroke_width=0.7)


# ---------------------------------------------------------------------------------------------
# marginalia (Omen Spread), from the pictographs
# ---------------------------------------------------------------------------------------------
def vine(p, pts, leaves=True, stroke=INK, width=2.0, curl=1.0, cols=(LEAF, RUBRIC, AZURE, GOLD)):
    p.path(p.smooth_d(pts), fill="none", stroke=stroke, stroke_width=width, stroke_linecap="round")
    r = p.rng
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        side = 1 if i % 2 else -1
        d = f"M{f(x)},{f(y)}"
        for k in range(1, 9):
            ang = side * k * 0.6
            rr = (20 - k * 2.2) * curl
            d += f" L{f(x + side * rr * math.cos(ang) * 0.9 + side * k * 1.5 * curl)},{f(y + rr * math.sin(ang) * 0.9 - 8 * curl)}"
        p.path(d, fill="none", stroke=stroke, stroke_width=width * 0.55)
        if leaves:
            lx, ly = x - side * 10 * curl, y + 6 * curl
            col = r.choice(cols)
            p.path(f"M{f(x)},{f(y)} Q{f(lx - side * 3)},{f(ly - 12 * curl)} {f(lx - side * 13 * curl)},{f(ly + 3)} "
                   f"Q{f(lx)},{f(ly + 8 * curl)} {f(x)},{f(y)}Z", fill=col, stroke=INK, stroke_width=0.9)


def snail(p, x, y, s=1.0, shell=GOLD):
    p.path(f"M{f(x - 40 * s)},{f(y)} q{f(10 * s)},{f(-14 * s)} {f(30 * s)},{f(-10 * s)} l{f(56 * s)},0 "
           f"q{f(14 * s)},0 {f(18 * s)},{f(10 * s)}Z", fill=PAPER_D, stroke=INK, stroke_width=1.3)
    for sgn in (0, 1):
        p.line(x - 36 * s, y - 8 * s, x - 48 * s - sgn * 6 * s, y - 30 * s + sgn * 4, stroke=INK, stroke_width=1.2)
        p.circle(x - 48 * s - sgn * 6 * s, y - 30 * s + sgn * 4, 2.2 * s, fill=INK)
    d = ""
    for k in range(40):
        ang = k * 0.45
        rr = 28 * s * (1 - k / 44)
        d += ("M" if k == 0 else "L") + f"{f(x + 14 * s + rr * math.cos(ang))},{f(y - 28 * s + rr * math.sin(ang))}"
    p.circle(x + 14 * s, y - 28 * s, 28 * s, fill=shell, stroke=INK, stroke_width=1.3)
    p.path(d, fill="none", stroke=RUBRIC, stroke_width=1.6)


def sigil(p, kind, x, y, s=1.0, col=INK, w=2.5):
    if kind == "eye":
        p.path(f"M{f(x - 22 * s)},{f(y)} Q{f(x)},{f(y - 20 * s)} {f(x + 22 * s)},{f(y)} Q{f(x)},{f(y + 20 * s)} "
               f"{f(x - 22 * s)},{f(y)}Z", fill="none", stroke=col, stroke_width=w, stroke_linejoin="round")
        p.circle(x, y, 6 * s, fill=col)
    elif kind == "spear":
        p.line(x, y + 24 * s, x, y - 14 * s, stroke=col, stroke_width=w * 1.2, stroke_linecap="round")
        p.poly([(x, y - 28 * s), (x - 8 * s, y - 12 * s), (x + 8 * s, y - 12 * s)], fill=col)
        p.line(x - 9 * s, y + 6 * s, x + 9 * s, y + 6 * s, stroke=col, stroke_width=w * 0.8, stroke_linecap="round")
    else:
        p.path(f"M{f(x - 14 * s)},{f(y + 24 * s)} Q{f(x - 4 * s)},{f(y - 4 * s)} {f(x + 16 * s)},{f(y - 26 * s)} "
               f"Q{f(x + 10 * s)},{f(y + 4 * s)} {f(x - 14 * s)},{f(y + 24 * s)}Z", fill="none", stroke=col,
               stroke_width=w, stroke_linejoin="round")
        p.line(x - 14 * s, y + 24 * s, x + 8 * s, y - 12 * s, stroke=col, stroke_width=w * 0.6)


def suit_mark(p, suit, x, y, s=1.0, col=None):
    if suit == "tremor":
        d = f"M{f(x - 22 * s)},{f(y)}"
        for k in range(1, 12):
            d += f" L{f(x - 22 * s + k * 4 * s)},{f(y + (10 if k % 2 else -10) * s * (1 - abs(k - 6) / 7))}"
        p.path(d, fill="none", stroke=col or RUBRIC, stroke_width=2.2 * s, stroke_linejoin="round")
    elif suit == "rain":
        p.path(f"M{f(x)},{f(y - 15 * s)} Q{f(x + 13 * s)},{f(y + 4 * s)} {f(x)},{f(y + 12 * s)} "
               f"Q{f(x - 13 * s)},{f(y + 4 * s)} {f(x)},{f(y - 15 * s)}Z", fill=col or AZURE)
    elif suit == "leaf":
        p.path(f"M{f(x - 14 * s)},{f(y + 10 * s)} Q{f(x - 10 * s)},{f(y - 14 * s)} {f(x + 14 * s)},{f(y - 12 * s)} "
               f"Q{f(x + 10 * s)},{f(y + 10 * s)} {f(x - 14 * s)},{f(y + 10 * s)}Z", fill=col or LEAF)
        p.line(x - 14 * s, y + 10 * s, x + 6 * s, y - 6 * s, stroke=PAPER, stroke_width=1.1 * s)
    elif suit == "wind":
        p.path(f"M{f(x - 18 * s)},{f(y - 4 * s)} h{f(22 * s)} a{f(6 * s)},{f(6 * s)} 0 1,0 {f(-6 * s)},{f(-6 * s)} "
               f"M{f(x - 18 * s)},{f(y + 5 * s)} h{f(30 * s)} a{f(5 * s)},{f(5 * s)} 0 1,1 {f(-5 * s)},{f(5 * s)}",
               fill="none", stroke=col or SAGE, stroke_width=2.4 * s, stroke_linecap="round")
    elif suit == "song":
        p.ellipse(x - 5 * s, y + 9 * s, 6.5 * s, 5 * s, fill=col or GOLD, stroke=INK, stroke_width=0.8)
        p.path(f"M{f(x + 1 * s)},{f(y + 9 * s)} v{f(-22 * s)} q{f(10 * s)},{f(2 * s)} {f(10 * s)},{f(11 * s)}",
               fill="none", stroke=INK, stroke_width=1.8 * s, stroke_linecap="round")
    else:  # mandible
        for sg in (-1, 1):
            p.path(f"M{f(x + sg * 3 * s)},{f(y + 12 * s)} Q{f(x + sg * 20 * s)},{f(y + 4 * s)} {f(x + sg * 12 * s)},{f(y - 14 * s)} "
                   f"Q{f(x + sg * 10 * s)},{f(y)} {f(x + sg * 3 * s)},{f(y + 4 * s)}", fill=col or RUBRIC, stroke=INK,
                   stroke_width=0.8)


# ---------------------------------------------------------------------------------------------
# alchemical diagram (Sap Kitchen), from the pictographs
# ---------------------------------------------------------------------------------------------
def alch_symbol(p, name, x, y, s=1.0, col=INK, w=2.2):
    k = dict(fill="none", stroke=col, stroke_width=w, stroke_linejoin="round", stroke_linecap="round")
    if name == "sap":
        p.circle(x, y, 18 * s, **k)
        p.path(f"M{f(x)},{f(y - 11 * s)} Q{f(x + 9 * s)},{f(y + 3 * s)} {f(x)},{f(y + 9 * s)} "
               f"Q{f(x - 9 * s)},{f(y + 3 * s)} {f(x)},{f(y - 11 * s)}Z", **k)
    elif name == "lichen":
        p.poly([(x, y - 18 * s), (x - 16 * s, y + 8 * s), (x + 16 * s, y + 8 * s)], **k)
        p.line(x, y + 8 * s, x, y + 22 * s, **k)
        p.line(x - 8 * s, y + 15 * s, x + 8 * s, y + 15 * s, **k)
    elif name == "pollen":
        p.circle(x, y, 12 * s, **k)
        p.circle(x, y, 3 * s, fill=col)
        for i in range(8):
            ang = i * math.pi / 4
            p.circle(x + 19 * s * math.cos(ang), y + 19 * s * math.sin(ang), 2.2 * s, fill=col)
    elif name == "honeydew":
        p.path(f"M{f(x + 6 * s)},{f(y - 18 * s)} A{f(16 * s)},{f(16 * s)} 0 1,0 {f(x + 6 * s)},{f(y + 12 * s)} "
               f"A{f(12 * s)},{f(12 * s)} 0 1,1 {f(x + 6 * s)},{f(y - 18 * s)}Z", **k)
        p.line(x - 16 * s, y + 20 * s, x + 16 * s, y + 20 * s, **k)
    elif name == "resin":
        p.circle(x, y - 4 * s, 12 * s, **k)
        p.line(x - 18 * s, y - 4 * s, x + 18 * s, y - 4 * s, **k)
        p.path(f"M{f(x)},{f(y + 8 * s)} v{f(10 * s)} q0,{f(6 * s)} {f(6 * s)},{f(6 * s)}", **k)
    elif name == "ash":
        p.poly([(x - 16 * s, y - 14 * s), (x + 16 * s, y - 14 * s), (x, y + 16 * s)], **k)
        p.line(x - 22 * s, y - 2 * s, x + 22 * s, y - 2 * s, **k)
    elif name == "frost":
        for i in range(3):
            ang = i * math.pi / 3
            p.line(x - 18 * s * math.cos(ang), y - 18 * s * math.sin(ang), x + 18 * s * math.cos(ang),
                   y + 18 * s * math.sin(ang), **k)
        p.circle(x, y, 5 * s, **k)
    elif name in ("leafskin", "leaf_skin"):
        p.path(f"M{f(x - 16 * s)},{f(y + 14 * s)} Q{f(x - 14 * s)},{f(y - 16 * s)} {f(x + 16 * s)},{f(y - 16 * s)} "
               f"Q{f(x + 14 * s)},{f(y + 14 * s)} {f(x - 16 * s)},{f(y + 14 * s)}Z", **k)
        p.line(x - 16 * s, y + 14 * s, x + 10 * s, y - 10 * s, **k)


def arrow(p, x1, y1, x2, y2, col=INK, w=2.4, bend=0.0, head=12, **kw):
    mx, my = (x1 + x2) / 2 - (y2 - y1) * bend, (y1 + y2) / 2 + (x2 - x1) * bend
    p.path(f"M{f(x1)},{f(y1)} Q{f(mx)},{f(my)} {f(x2)},{f(y2)}", fill="none", stroke=col, stroke_width=w, **kw)
    ang = math.atan2(y2 - my, x2 - mx)
    p.poly([(x2, y2), (x2 - head * math.cos(ang - 0.4), y2 - head * math.sin(ang - 0.4)),
            (x2 - head * math.cos(ang + 0.4), y2 - head * math.sin(ang + 0.4))], fill=col)


# ---------------------------------------------------------------------------------------------
# knotwork (Trunk and Shadow), from the pictographs, lighter on elements
# ---------------------------------------------------------------------------------------------
def plait(p, x0, y0, x1, y1, col, w=8, period=40, amp=7, edge="#140d08"):
    """Two interlaced strands along a line: each strand is one path, with over-under bridges."""
    L = math.hypot(x1 - x0, y1 - y0)
    ux, uy = (x1 - x0) / L, (y1 - y0) / L
    nx, ny = -uy, ux
    n = max(1, round(L / period))
    per = L / n

    def strand(k, t0, t1, steps):
        pts = []
        for i in range(steps + 1):
            t = t0 + (t1 - t0) * i / steps
            s = amp * math.sin(t / per * math.pi + k * math.pi)
            pts.append((x0 + ux * t + nx * s, y0 + uy * t + ny * s))
        return "M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts)
    for k in (0, 1):
        d = strand(k, 0, L, n * 6)
        p.path(d, fill="none", stroke=edge, stroke_width=w + 3.5)
        p.path(d, fill="none", stroke=col, stroke_width=w)
    # bridges: strand 0 passes over at every other crossing
    db = "".join(strand(0, (j - 0.22) * per, (j + 0.22) * per, 3) for j in range(1, n, 2))
    if db:
        p.path(db, fill="none", stroke=edge, stroke_width=w + 3.5)
        p.path(db, fill="none", stroke=col, stroke_width=w)


def triquetra(p, x, y, r, col, edge="#140d08"):
    for k in range(3):
        ang = -math.pi / 2 + k * 2 * math.pi / 3
        cx, cy = x + r * 0.5 * math.cos(ang), y + r * 0.5 * math.sin(ang)
        p.circle(cx, cy, r * 0.62, fill="none", stroke=edge, stroke_width=r * 0.27)
        p.circle(cx, cy, r * 0.62, fill="none", stroke=col, stroke_width=r * 0.14)


# ---------------------------------------------------------------------------------------------
# pixel art (Crack runner): sixteen colours
# ---------------------------------------------------------------------------------------------
PIX16 = ["#1b120c", "#2e2016", "#4a3324", "#5a3d2b", "#7a5a40", "#7d6c5a", "#a8977f", "#8fa37a",
         "#c4d65a", "#d9902a", "#f0c050", "#e8742a", "#b8402a", "#efe2c4", "#c9b99a", "#fff6dc"]


def pixbuf(cw, ch, fill=None):
    return [[fill] * cw for _ in range(ch)]


def stamp(buf, x, y, rows, pal, flip=False):
    for j, row in enumerate(rows):
        if flip:
            row = row[::-1]
        for i, ch in enumerate(row):
            if ch in pal and 0 <= y + j < len(buf) and 0 <= x + i < len(buf[0]):
                buf[y + j][x + i] = pal[ch]


def emit_pixels(p, buf, size, ox=0, oy=0, palette=PIX16):
    """Emit a cell buffer as merged rects (runs, then equal runs stacked), one path per colour."""
    runs = {}
    for j, row in enumerate(buf):
        i = 0
        while i < len(row):
            c = row[i]
            k = i
            while k < len(row) and row[k] == c:
                k += 1
            if c is not None:
                runs.setdefault((c, i, k - i), []).append(j)
            i = k
    by_col = {}
    for (c, i, w), js in runs.items():
        j0 = prev = js[0]
        for j in js[1:] + [None]:
            if j is not None and j == prev + 1:
                prev = j
                continue
            by_col.setdefault(c, []).append(f"M{i},{j0}h{w}v{prev - j0 + 1}h{-w}z")
            if j is not None:
                j0 = prev = j
    p.open("g", transform=f"translate({f(ox)} {f(oy)}) scale({size})", shape_rendering="crispEdges")
    for c in sorted(by_col):
        p.path("".join(by_col[c]), fill=palette[c])
    p.close()


# ---------------------------------------------------------------------------------------------
# isometric diorama (Crack defence)
# ---------------------------------------------------------------------------------------------
class Iso:
    def __init__(self, a, s, ox, oy):
        self.a, self.s, self.ox, self.oy = a, s, ox, oy
        self.items = []

    def P(self, x, y, z):
        return self.ox + (x - y) * self.s * 0.866, self.oy + (x + y) * self.s * 0.5 - z * self.s

    def cube(self, x, y, z, col, h=1.0, w=1.0, d=1.0, grain=True, edge=CRACK, sw=1.1):
        a, P = self.a, self.P
        top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]
        left = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]
        right = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]
        k = dict(stroke=edge, stroke_width=sw, stroke_linejoin="round")
        a.poly(left, fill=shade(col, 0.7), **k)
        a.poly(right, fill=shade(col, 0.48), **k)
        a.poly(top, fill=col, **k)
        if grain:
            p1, p2 = P(x + 0.2 * w, y + 0.5 * d, z + h), P(x + 0.8 * w, y + 0.5 * d, z + h)
            a.line(*p1, *p2, stroke=shade(col, 0.78), stroke_width=1)

    def add(self, key, fn):
        self.items.append((key, len(self.items), fn))

    def flush(self):
        for _, _, fn in sorted(self.items, key=lambda t: (t[0], t[1])):
            fn()
        self.items = []


def iso_folk(a, fx, fy, s=1.0, crest=None, cloth="#8a6a48", spear_up=True, skin=SKIN, robe=False, door=False):
    """A small diorama figure standing at screen point (fx, fy)."""
    a.open("g", transform=f"translate({f(fx)} {f(fy)}) scale({f(s)})")
    a.ellipse(0, 0, 12, 5, fill="#000", opacity=0.4)
    if door:
        a.path("M-16,-50 l14,-6 l0,40 l-14,6Z", fill="#9a7a52", stroke=CRACK, stroke_width=1.3)
        a.circle(-6, -34, 1.6, fill=CRACK)
    if robe:
        a.path("M-10,0 L-6,-36 L6,-36 L10,0Z", fill=cloth, stroke=CRACK, stroke_width=1.4)
    else:
        a.path("M-5,0 L-4,-16 M5,0 L4,-16", stroke=CRACK, stroke_width=3, fill="none", stroke_linecap="round")
        a.path("M-8,-14 L-6,-36 L6,-36 L8,-14Z", fill=cloth, stroke=CRACK, stroke_width=1.4)
    a.circle(0, -46, 10.5, fill=skin, stroke=CRACK, stroke_width=1.4)
    a.path("M-11,-48 a11,11 0 0,1 22,0Z", fill=UMBER_D if not robe else cloth, stroke=CRACK, stroke_width=1)
    if crest:
        a.path("M-4,-58 q8,-22 22,-14 q-10,2 -14,16Z", fill=crest, stroke=CRACK, stroke_width=1)
    if spear_up:
        a.line(12, 4, 17, -72, stroke="#e6cfa0", stroke_width=2.6, stroke_linecap="round")
        a.poly([(17.5, -80), (13, -66), (21, -66)], fill="#f6e8c8", stroke=CRACK, stroke_width=0.8)
    a.close()


# ---------------------------------------------------------------------------------------------
# papers and frames
# ---------------------------------------------------------------------------------------------
def bark_paper(a, tone=PAPER, grain=0.28, fibre=0.7, vig=0.3, vcol="#6b4a20"):
    a.paper(tone, grain=grain, fibre=fibre)
    if vig:
        a.vignette(vig, vcol)


def stain(a, x, y, r, col=AMBER, opacity=0.18):
    """A sap stain: a soft ring, darker at the rim."""
    a.circle(x, y, r, fill=a.radial([(0, col, opacity * 0.5), (0.8, col, opacity * 0.7), (0.93, col, opacity * 1.6),
                                     (1, col, 0)]))


def double_rule(a, x, y, w, h, c1=RUBRIC, c2=INK, gap=5, rx=0):
    a.rect(x, y, w, h, rx=rx, fill="none", stroke=c1, stroke_width=1.4)
    a.rect(x + gap, y + gap, w - 2 * gap, h - 2 * gap, rx=max(0, rx - gap), fill="none", stroke=c2, stroke_width=1)

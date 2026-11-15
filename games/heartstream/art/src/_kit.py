"""A Journey Into the Heartstream: palette and shared drawing helpers for the code-drawn art.

Line is cut, not drawn: gouges for the linocut and woodblock pieces, scratches for scrimshaw, blown
edges for stencils. Helpers here are shared by every file in this folder (hand_d and grain_lines come
from the game's pictographs)."""
import math

from artkit import f

G = "heartstream"
MARROW, MARROW2, GLOW = "#1E3557", "#2F5D8C", "#7FB2E0"
DEEP, RIVER, HILITE = "#7A1020", "#B3202E", "#E0603A"
GOLD, BONE = "#F2B544", "#E8DCC4"
GREY = "#8C7A78"                       # the backwater only
INK, KEY, NIGHT = "#17110f", "#2a0a10", "#0e1a2e"
IVORY, CREAM, VELLUM = "#efe3c8", "#f0e6cf", "#e6d6b4"
CHAR, OCHRE = "#1d1612", "#b5622a"
MARKS = ("ring", "notch", "spiral", "fork", "star", "wave")
TEMPERS = (("laughs", GOLD), ("argues", HILITE), ("dreams", GLOW), ("fears", BONE))
ROMAN = ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX")
CHAPTERS = ("The Marrow Lights", "The Gift", "The Marrow-Song", "The Recognition", "The Ascent", "The River",
            "The Delta", "The Heart", "Alone")
RAMP = (MARROW, "#25456f", MARROW2, "#4a3560", "#6a2845", DEEP, RIVER, "#a8431f", "#5a0b17")


def P(pts, closed=False):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if closed else "")


def circ_d(cx, cy, r):
    return f"M{f(cx - r)},{f(cy)}a{f(r)},{f(r)} 0 1,0 {f(2 * r)},0a{f(r)},{f(r)} 0 1,0 {f(-2 * r)},0Z"


def mark_d(kind, cx, cy, s):
    """Path data for one of the six marks (ring, notch, spiral, fork, star, wave), radius s."""
    def p(x, y):
        return f"{f(cx + x * s)},{f(cy + y * s)}"
    if kind == "ring":
        return circ_d(cx, cy, 0.72 * s)
    if kind == "notch":
        return f"M{p(-.62, -.7)} L{p(0, .72)} L{p(.62, -.7)}"
    if kind == "spiral":
        pts = []
        for i in range(40):
            t = i / 39
            r, an = 0.08 + 0.74 * t, t * 2.3 * 2 * math.pi + 1.2
            pts.append((cx + r * s * math.cos(an), cy + r * s * math.sin(an)))
        return P(pts)
    if kind == "fork":
        return f"M{p(0, .82)} L{p(0, .05)} M{p(-.6, -.78)} L{p(0, .05)} L{p(.6, -.78)}"
    if kind == "star":
        d = []
        for an in (90, 30, 150):
            c, sn = math.cos(math.radians(an)) * .8, math.sin(math.radians(an)) * .8
            d.append(f"M{p(-c, -sn)} L{p(c, sn)}")
        return " ".join(d)
    if kind == "wave":
        return f"M{p(-.85, .15)} C{p(-.55, -.8)} {p(-.3, -.8)} {p(0, 0)} C{p(.3, .8)} {p(.55, .8)} {p(.85, -.15)}"
    raise ValueError(kind)


def draw_mark(a, kind, cx, cy, s, color=DEEP, sw=None, light=None, **kw):
    sw = sw or max(2.0, s * 0.16)
    d = mark_d(kind, cx, cy, s)
    if light:
        a.path(d, fill="none", stroke=light, stroke_width=sw * 0.6, stroke_linecap="round", stroke_linejoin="round",
               transform=f"translate({f(sw * .35)},{f(sw * .4)})", opacity=0.7)
    a.path(d, fill="none", stroke=color, stroke_width=sw, stroke_linecap="round", stroke_linejoin="round", **kw)


def hand_d(cx, cy, s=1.0, rot=0.0, spread=1.0, curl=1.0):
    """Path data for an open hand (palm and five fingers); curl < 1 shortens the fingers (a closing hand)."""
    a0 = math.radians(rot)
    parts = []

    def pt(x, y):
        return (cx + (x * math.cos(a0) - y * math.sin(a0)) * s, cy + (x * math.sin(a0) + y * math.cos(a0)) * s)

    palm = [pt(math.cos(t) * 26, math.sin(t) * 30 + 8) for t in [i * math.pi / 10 for i in range(20)]]
    parts.append(P(palm, True))
    fingers = [(-30, 52, -38 * spread, 0.85), (-13, 72, -12 * spread, 1.0), (4, 76, 2, 1.05),
               (20, 68, 14 * spread, 0.95), (36, 40, 52 * spread, 0.8)]
    for (bx, ln, ang, wd) in fingers:
        ln *= curl
        an = math.radians(ang - 90)
        ux, uy = math.cos(an), math.sin(an)
        nx, ny = -uy, ux
        w = 7.5 * wd
        base = (bx * 0.75, -12 if abs(bx) < 30 else 6)
        q = [(base[0] + nx * w, base[1] + ny * w), (base[0] + ux * ln + nx * w, base[1] + uy * ln + ny * w),
             (base[0] + ux * (ln + w), base[1] + uy * (ln + w)),
             (base[0] + ux * ln - nx * w, base[1] + uy * ln - ny * w), (base[0] - nx * w, base[1] - ny * w)]
        parts.append(P([pt(x, y) for x, y in q], True))
    return " ".join(parts)


def fist_d(cx, cy, s=1.0, rot=0.0, point=False):
    """A closed hand seen from the back: a rounded block of knuckles, a thumb across; point=True adds a finger."""
    a0 = math.radians(rot)

    def pt(x, y):
        return (cx + (x * math.cos(a0) - y * math.sin(a0)) * s, cy + (x * math.sin(a0) + y * math.cos(a0)) * s)
    body = [(-30, 30), (-34, -6), (-26, -26), (-12, -32), (2, -34), (16, -31), (28, -22), (32, 0), (28, 30), (0, 38)]
    d = [P([pt(x, y) for x, y in body], True)]
    thumb = [(-34, 4), (-48, -8), (-44, -24), (-30, -22), (-22, -6)]
    d.append(P([pt(x, y) for x, y in thumb], True))
    if point:
        d.append(P([pt(x, y) for x, y in [(-22, -24), (-24, -92), (-16, -102), (-8, -92), (-8, -28)]], True))
    return " ".join(d)


def grain_lines(a, x, y, w, h, n, color, opacity, amp=3.0, sw=0.8, vertical=False):
    """Long wavy parallel lines: wood grain for a printing block, or grain in bone."""
    for i in range(n):
        t = (i + a.rng.random() * 0.6) / n
        ph, k = a.rng.uniform(0, 6.3), a.rng.uniform(0.004, 0.012)
        pts = []
        if vertical:
            xx = x + w * t
            for yy in range(int(y), int(y + h) + 40, 40):
                pts.append((xx + amp * math.sin(yy * k + ph) + a.rng.uniform(-0.6, 0.6), yy))
        else:
            yy = y + h * t
            for xx in range(int(x), int(x + w) + 40, 40):
                pts.append((xx, yy + amp * math.sin(xx * k + ph) + a.rng.uniform(-0.6, 0.6)))
        a.path(a.smooth_d(pts), fill="none", stroke=color, stroke_width=sw, opacity=opacity)


def gouges(a, x, y, w, h, n, color, ang=None, ln=(8, 22), sw=3.0, spread=25, density=None, centre=None, **kw):
    """Short cut marks: the chatter a gouge leaves. ang in degrees (None: random); centre=(x, y) makes them
    radiate from a point; density(x, y) -> 0..1 thins them."""
    d = []
    for _ in range(n):
        px, py = x + a.rng.random() * w, y + a.rng.random() * h
        if density and a.rng.random() > density(px, py):
            continue
        if centre:
            an = math.atan2(py - centre[1], px - centre[0]) + math.radians(a.rng.uniform(-spread, spread) * 0.3)
        else:
            an = math.radians((a.rng.uniform(0, 180) if ang is None else ang + a.rng.uniform(-spread, spread)))
        L = a.rng.uniform(*ln)
        d.append(f"M{f(px)},{f(py)}l{f(math.cos(an) * L)},{f(math.sin(an) * L)}")
    if d:
        a.path("".join(d), fill="none", stroke=color, stroke_width=sw, stroke_linecap="round", **kw)


def scratch(a, d, sw=1.6, ink=INK, light="#fffaf0", **kw):
    """A scrimshaw line: a pale burr beside an inked scratch."""
    if light:
        a.path(d, fill="none", stroke=light, stroke_width=sw * 0.8, stroke_linecap="round", stroke_linejoin="round",
               transform="translate(0.9,1)", opacity=0.6)
    kw.setdefault("stroke_linecap", "round")
    kw.setdefault("stroke_linejoin", "round")
    a.path(d, fill="none", stroke=ink, stroke_width=sw, **kw)


def hatch_pat(a, color, spacing=6, sw=1.5, ang=35, opacity=1.0):
    """A pattern of parallel scratches; returns 'url(#id)'."""
    pid = a.uid("pat")
    a.defn(f'<pattern id="{pid}" patternUnits="userSpaceOnUse" width="{spacing}" height="{spacing}" '
           f'patternTransform="rotate({ang})"><line x1="0" y1="0" x2="0" y2="{spacing}" stroke="{color}" '
           f'stroke-width="{sw}" opacity="{opacity}"/></pattern>')
    return f"url(#{pid})"


def caps(a, x, y, s, size=24, fill=INK, spacing=4, anchor="middle", family="serif", **kw):
    a.text(x, y, s, size=size, family=family, fill=fill, text_anchor=anchor, letter_spacing=spacing, **kw)


def cut_text(a, x, y, s, size, fill, ink=INK, light=None, spacing=4, anchor="middle", sw=None, **kw):
    """Lettering that reads as cut: a pale burr, the fill, then a keyline."""
    kw.setdefault("font_weight", "bold")
    if light:
        a.text(x + size * .025, y + size * .03, s, size=size, fill=light, text_anchor=anchor, letter_spacing=spacing,
               opacity=0.7, **kw)
    a.text(x, y, s, size=size, fill=fill, text_anchor=anchor, letter_spacing=spacing, stroke=ink,
           stroke_width=sw if sw is not None else max(1.0, size * 0.02), stroke_linejoin="round",
           paint_order="stroke", **kw)


def heart_d(cx, cy, s):
    return (f"M{f(cx)},{f(cy + s)} C{f(cx - s * 1.5)},{f(cy - s * .1)} {f(cx - s * .9)},{f(cy - s * 1.1)} {f(cx)},{f(cy - s * .35)} "
            f"C{f(cx + s * .9)},{f(cy - s * 1.1)} {f(cx + s * 1.5)},{f(cy - s * .1)} {f(cx)},{f(cy + s)}Z")


def bone_grad(a):
    return a.gradient([(0, "#f6ecd6"), (0.6, BONE), (1, "#d2c09c")])


def blob_d(a, cx, cy, rx, ry, n=12, jitter=0.12):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        k = 1 + a.rng.uniform(-jitter, jitter)
        pts.append((cx + rx * k * math.cos(t), cy + ry * k * math.sin(t)))
    return a.smooth_d(pts, closed=True)


def lozenge_d(cx, cy, rx, ry):
    """The counter piece: a rounded lozenge."""
    return (f"M{f(cx - rx)},{f(cy)} C{f(cx - rx)},{f(cy - ry * .7)} {f(cx - rx * .5)},{f(cy - ry)} {f(cx)},{f(cy - ry)} "
            f"C{f(cx + rx * .5)},{f(cy - ry)} {f(cx + rx)},{f(cy - ry * .7)} {f(cx + rx)},{f(cy)} "
            f"C{f(cx + rx)},{f(cy + ry * .7)} {f(cx + rx * .5)},{f(cy + ry)} {f(cx)},{f(cy + ry)} "
            f"C{f(cx - rx * .5)},{f(cy + ry)} {f(cx - rx)},{f(cy + ry * .7)} {f(cx - rx)},{f(cy)}Z")


def block_open(a, m=22, color=INK, rough=3.0, paper=CREAM, grain=0.28):
    """A block print: cream paper, then an inked block with a torn edge. Close with a.close()."""
    a.paper(paper, grain=grain)
    a.open("g", filter=a.roughen(rough, 0.035))
    a.rect(m, m, a.w - 2 * m, a.h - 2 * m, fill=color)
    return a.clip(f'<rect x="{m}" y="{m}" width="{a.w - 2 * m}" height="{a.h - 2 * m}"/>')


def brother(a, x, y, h, col, key=KEY, pose="sit", sw=None, wrist=None):
    """A small slender Blue-Born with large hands, standing on (x, y); h is his height."""
    sw = sw or max(2, h * 0.045)
    u = h / 100.0
    a.path(f"M{f(x - 13 * u)},{f(y)} L{f(x - 8 * u)},{f(y - 62 * u)} L{f(x + 9 * u)},{f(y - 62 * u)} L{f(x + 14 * u)},{f(y)}Z",
           fill=col, stroke=key, stroke_width=sw, stroke_linejoin="round")
    a.circle(x + 1 * u, y - 80 * u, 16 * u, fill=col, stroke=key, stroke_width=sw)
    arms = {"sit": [(-26, -30), (26, -30)], "out": [(-44, -52), (46, -52)], "up": [(-30, -104), (32, -104)],
            "reach": [(40, -86), (-24, -28)], "hush": [(-18, -34), (16, -34)], "row": [(-34, -24), (-18, -34)]}[pose]
    for hx, hy in arms:
        a.line(x + (6 if hx > 0 else -5) * u, y - 54 * u, x + hx * u, y + hy * u, stroke=key, stroke_width=sw * 2.2,
               stroke_linecap="round")
        a.line(x + (6 if hx > 0 else -5) * u, y - 54 * u, x + hx * u, y + hy * u, stroke=col, stroke_width=sw * 1.1,
               stroke_linecap="round")
        a.circle(x + hx * u, y + hy * u, 8.5 * u, fill=wrist or col, stroke=key, stroke_width=sw * .8)


def raft(a, x, y, w, key=KEY, fill=BONE, sw=4, mark=None):
    """The raft riding the surface at y: a pale living hull with ribs."""
    a.path(f"M{f(x)},{f(y - 6)} C{f(x + w * .08)},{f(y + 32)} {f(x + w * .84)},{f(y + 36)} {f(x + w)},{f(y - 8)} "
           f"L{f(x + w - 10)},{f(y - 22)} L{f(x + 10)},{f(y - 22)}Z", fill=fill, stroke=key, stroke_width=sw,
           stroke_linejoin="round")
    n = max(4, int(w / 40))
    for i in range(n):
        xx = x + w * (i + 0.8) / (n + 0.6)
        a.line(xx, y - 18, xx + 6, y + 14, stroke="#c9b48e", stroke_width=sw * .6)
    if mark:
        a.ellipse(x + w * .5, y - 2, 16, 11, fill="#f7efdc", stroke=key, stroke_width=1.5)
        draw_mark(a, mark, x + w * .5, y - 2, 8, color=DEEP, sw=2)


def crests(a, x0, x1, surf, key=KEY, fill=RIVER, foam=BONE, big=None, skip=None, hs=(16, 34), sw=4):
    """A row of keyed woodblock wave curls with claw fingers of foam, along the surface line."""
    x = x0
    while x < x1:
        isbig = bool(big and big(x))
        h = a.rng.uniform(70, 100) if isbig else a.rng.uniform(*hs)
        wdt = a.rng.uniform(150, 200) if isbig else a.rng.uniform(70, 115)
        if skip and skip(x):
            x += wdt * 0.7
            continue
        a.path(f"M{f(x)},{f(surf + 4)} C{f(x + wdt * .3)},{f(surf - h * .4)} {f(x + wdt * .55)},{f(surf - h * 1.1)} "
               f"{f(x + wdt * .8)},{f(surf - h)} C{f(x + wdt * .95)},{f(surf - h * .95)} {f(x + wdt)},{f(surf - h * .7)} "
               f"{f(x + wdt * .88)},{f(surf - h * .55)} C{f(x + wdt * .9)},{f(surf - h * .2)} {f(x + wdt)},{f(surf)} Z",
               fill=fill, stroke=key, stroke_width=sw, stroke_linejoin="round")
        a.path(f"M{f(x + wdt * .12)},{f(surf)} C{f(x + wdt * .35)},{f(surf - h * .5)} {f(x + wdt * .55)},{f(surf - h * .95)} "
               f"{f(x + wdt * .8)},{f(surf - h * .92)}", fill="none", stroke=foam, stroke_width=3 if isbig else 2)
        nf = 6 if isbig else 3
        for k in range(nf):
            an = math.radians(-40 + k * (160 / nf))
            fx, fy = x + wdt * 0.84, surf - h * 0.98
            ln = (22 if isbig else 9) * (1 - k / (nf + 2))
            a.path(f"M{f(fx)},{f(fy)} q{f(math.cos(an) * ln)},{f(math.sin(an) * ln - ln * .6)} "
                   f"{f(math.cos(an) * ln * 1.4)},{f(math.sin(an) * ln * .6)}", fill="none", stroke=foam,
                   stroke_width=3 if isbig else 2, stroke_linecap="round")
        x += wdt * 0.72


def lamp(a, x, y, s=1.0, lit=1.0, ink=INK, glow=GOLD):
    """A marrow lamp: a small bone cup with a steady flame; lit 0..1 dims it."""
    if lit > 0.05:
        a.circle(x, y - 26 * s, 46 * s * lit, fill=a.radial([(0, glow, 0.7 * lit), (1, glow, 0)]))
        a.path(f"M{f(x)},{f(y - 44 * s * (0.5 + lit / 2))} C{f(x + 12 * s)},{f(y - 22 * s)} {f(x + 7 * s)},{f(y - 8 * s)} {f(x)},{f(y - 8 * s)} "
               f"C{f(x - 7 * s)},{f(y - 8 * s)} {f(x - 12 * s)},{f(y - 22 * s)} {f(x)},{f(y - 44 * s * (0.5 + lit / 2))}Z",
               fill=glow, stroke=ink, stroke_width=1.5 * s, opacity=0.4 + 0.6 * lit)
    a.path(f"M{f(x - 22 * s)},{f(y - 8 * s)} L{f(x + 22 * s)},{f(y - 8 * s)} L{f(x + 15 * s)},{f(y + 12 * s)} L{f(x - 15 * s)},{f(y + 12 * s)}Z",
           fill=BONE, stroke=ink, stroke_width=2 * s, stroke_linejoin="round")


def temper_glyph(a, name, cx, cy, s, color, sw=None):
    """The four temperament glyphs: laughs (a smile under three rays), argues (two chevrons meeting),
    dreams (a crescent under a dot), fears (a dot under a sheltering arc)."""
    sw = sw or max(2.0, s * 0.16)
    kw = dict(fill="none", stroke=color, stroke_width=sw, stroke_linecap="round", stroke_linejoin="round")
    if name == "laughs":
        a.path(f"M{f(cx - s * .75)},{f(cy)} Q{f(cx)},{f(cy + s * 1.1)} {f(cx + s * .75)},{f(cy)}", **kw)
        for k in (-1, 0, 1):
            a.path(f"M{f(cx + k * s * .5)},{f(cy - s * .35)} l{f(k * s * .18)},{f(-s * .45)}", **kw)
    elif name == "argues":
        a.path(f"M{f(cx - s * .95)},{f(cy - s * .7)} L{f(cx - s * .28)},{f(cy)} L{f(cx - s * .95)},{f(cy + s * .7)} "
               f"M{f(cx + s * .95)},{f(cy - s * .7)} L{f(cx + s * .28)},{f(cy)} L{f(cx + s * .95)},{f(cy + s * .7)}", **kw)
    elif name == "dreams":
        a.path(f"M{f(cx - s * .75)},{f(cy - s * .1)} Q{f(cx)},{f(cy + s * 1.2)} {f(cx + s * .75)},{f(cy - s * .1)} "
               f"Q{f(cx)},{f(cy + s * .55)} {f(cx - s * .75)},{f(cy - s * .1)}Z", **kw)
        a.circle(cx, cy - s * .6, sw * 0.9, fill=color)
    else:
        a.path(f"M{f(cx - s * .85)},{f(cy + s * .35)} Q{f(cx)},{f(cy - s * 1.3)} {f(cx + s * .85)},{f(cy + s * .35)}", **kw)
        a.circle(cx, cy + s * .35, sw * 0.9, fill=color)


def speckle(a, x, y, w, h, color, opacity=0.4, freq=0.5, cut=5.0, gain=9.0):
    """Sparse mineral speckle from a noise filter (cheap in bytes, unlike a thousand dots)."""
    fid = a.uid("spk")
    r, g, b = (int(color[i:i + 2], 16) / 255 for i in (1, 3, 5))
    a.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="1" '
           f'seed="{a.rng.randint(1, 900)}"/><feColorMatrix values="0 0 0 0 {r:.2f}  0 0 0 0 {g:.2f}  0 0 0 0 {b:.2f}  0 0 0 {f(gain)} {f(-cut)}"/></filter>')
    a.rect(x, y, w, h, filter=f"url(#{fid})", opacity=opacity)


def solid(a, d, fill, ink=INK, sw=6, **kw):
    """Several overlapping shapes as one silhouette: keyline first, then the fill over its inner half."""
    a.path(d, fill=ink, stroke=ink, stroke_width=sw * 2, stroke_linejoin="round", **kw)
    a.path(d, fill=fill, **kw)

"""Project: Man Eater: the palette and the shared hand for the art drawn by code.

Typewriter, stencil and ruled forms; carbon smudge and photo grain; frost that grows from the corners
of every page; light from high up. One red, for rubber stamps only.
"""
import math

from artkit import f

G = "man-eater"
GREEN, CREAM, SNOW, FROST = "#5E7363", "#D9D2BF", "#EEF1F2", "#7C8C99"
SODIUM, STEEL, INK, BRUISE = "#D9A441", "#8A8F93", "#1B1D1F", "#5A4F5E"
RED = "#9B2F22"
PAPER, CARD, PRUSSIAN, BLUELINE = "#E6DFCC", "#DDD4BD", "#1D3F73", "#F4F7FF"
SKIN, SKIN2 = "#E0D5BC", "#C6B99E"
SUITS = ["hands", "keys", "anchors", "houses", "sparks", "stars", "stamp"]
OWNER = {"hands": "Fisk", "keys": "Jax", "anchors": "Pell", "houses": "Duarte", "sparks": "Kimura",
         "stars": "Hollis", "stamp": "Sam"}
TINT = {"hands": INK, "keys": STEEL, "anchors": FROST, "houses": GREEN, "sparks": SODIUM, "stars": BRUISE,
        "stamp": RED}


# ---- type ---------------------------------------------------------------------------------------
def typed(a, x, y, s, size=20, fill=INK, anchor="start", ghost=True, **kw):
    """Typewriter text with a faint carbon ghost."""
    if ghost:
        a.text(x + size * 0.05, y + size * 0.04, s, size=size, family="monospace", fill=fill, text_anchor=anchor,
               opacity=0.22, **kw)
    a.text(x, y, s, size=size, family="monospace", fill=fill, text_anchor=anchor, **kw)


def stencil(a, x, y, s, size, fill=INK, anchor="start", opacity=None):
    """Army stencil type: heavy monospace with a bridge cut through each letter."""
    ls = size * 0.1
    adv = size * 0.6 + ls
    n = len(s)
    w = n * adv
    x0 = x - (w / 2 if anchor == "middle" else w if anchor == "end" else 0)
    mid = a.uid("st")
    cuts = "".join(f'<rect x="{f(x0 + (i + 0.5) * adv - ls / 2 - size * 0.04)}" y="{f(y - size * 0.8)}" '
                   f'width="{f(size * 0.08)}" height="{f(size * 1.0)}" fill="#000"/>' for i, ch in enumerate(s)
                   if ch not in " .:/-1")
    a.defn(f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="{f(x0 - size)}" y="{f(y - size * 1.2)}" '
           f'width="{f(w + 2 * size)}" height="{f(size * 1.8)}"><rect x="{f(x0 - size)}" y="{f(y - size * 1.2)}" '
           f'width="{f(w + 2 * size)}" height="{f(size * 1.8)}" fill="#fff"/>{cuts}</mask>')
    a.open("g", mask=f"url(#{mid})", opacity=opacity)
    a.text(x0, y, s, size=size, family="monospace", fill=fill, font_weight="bold", letter_spacing=f(ls))
    a.close()
    return w


BLOCK = {  # stroke paths in a 100 x 140 box, and the stencil bridges cut out of them
    "P": ("M13,127 V13 H57 A30,30 0 0 1 57,73 H13", [(27, 0, 7, 86)]),
    "R": ("M13,127 V13 H57 A30,30 0 0 1 57,73 H13 M52,73 L87,127", [(27, 0, 7, 86)]),
    "O": ("M43,13 H57 A30,30 0 0 1 87,43 V97 A30,30 0 0 1 57,127 H43 A30,30 0 0 1 13,97 V43 A30,30 0 0 1 43,13 Z",
          [(46.5, 0, 7, 30), (46.5, 110, 7, 30)]),
    "J": ("M72,13 V97 A29.5,30 0 0 1 13,97", [(40, 108, 7, 32)]),
    "E": ("M87,13 H13 V127 H87 M13,70 H72", [(27, 0, 7, 140)]),
    "C": ("M87,43 A30,30 0 0 0 57,13 H43 A30,30 0 0 0 13,43 V97 A30,30 0 0 0 43,127 H57 A30,30 0 0 0 87,97",
          [(46.5, 0, 7, 30), (46.5, 110, 7, 30)]),
    "T": ("M3,13 H97 M50,13 V127", [(0, 27, 100, 7)]),
    "M": ("M13,127 V13 L50,84 L87,13 V127", [(27, 34, 46, 7)]),
    "A": ("M11,127 L50,13 L89,127 M27,92 H73", [(46.5, 76, 7, 30), (46.5, 0, 7, 34)]),
    "N": ("M13,127 V13 L87,127 V13", [(26, 36, 44, 7), (30, 98, 45, 7)]),
    "H": ("M13,13 V127 M87,13 V127 M13,70 H87", [(27, 56, 7, 28), (66, 56, 7, 28)]),
    "L": ("M13,13 V127 H87", [(27, 100, 7, 40)]),
    "D": ("M13,13 H50 A37,37 0 0 1 87,50 V90 A37,37 0 0 1 50,127 H13 Z", [(27, 0, 7, 30), (27, 110, 7, 30)]),
    ":": ("M38,38 H62 V62 H38 Z M38,92 H62 V116 H38 Z", []),
}


def block_text(a, x, y, s, h, fill=INK, sw=25, gap=16, bridges=True, **kw):
    """Drawn stencil capitals, baseline-free: (x, y) is the top-left; h is the cap height."""
    k = h / 140
    cx = x
    for ch in s:
        if ch == " ":
            cx += 62 * k
            continue
        d, cuts = BLOCK[ch]
        key = f"blk{ord(ch)}"
        mid = None
        if bridges and cuts:
            mid = getattr(a, "_blk", {}).get(key)
            if mid is None:
                mid = a.uid("bm")
                if not hasattr(a, "_blk"):
                    a._blk = {}
                a._blk[key] = mid
                rs = "".join(f'<rect x="{c[0]}" y="{c[1]}" width="{c[2]}" height="{c[3]}" fill="#000"/>' for c in cuts)
                a.defn(f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="160">'
                       f'<rect x="-10" y="-10" width="120" height="160" fill="#fff"/>{rs}</mask>')
        a.open("g", transform=f"translate({f(cx)},{f(y)}) scale({k:.4f})", mask=f"url(#{mid})" if mid else None)
        a.path(d, fill=fill if ch == ":" else "none", stroke=fill, stroke_width=0.01 if ch == ":" else sw,
               stroke_linejoin="miter", stroke_miterlimit=8, **kw)
        a.close()
        cx += (100 + gap) * k if ch != ":" else (70 + gap) * k
    return cx - x


def block_width(s, h, gap=16):
    k = h / 140
    return sum(62 * k if ch == " " else (70 + gap) * k if ch == ":" else (100 + gap) * k for ch in s) - gap * k


# ---- surfaces and wear --------------------------------------------------------------------------
def film(a, x, y, w, h, strength=0.5, freq=1.5):
    """Photographic grain over a box."""
    gid = a.uid("film")
    a.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="{freq}" numOctaves="1" seed="{a.seed % 991}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0'
           f'  0 0 0 0 0  0 0 0 {f(strength)} -0.1"/></filter>')
    a.rect(x, y, w, h, filter=f"url(#{gid})")


def carbon(a, x, y, w, h, n=4, op=0.10):
    """Carbon-paper smudges."""
    bl = a.blur(14)
    a.open("g", filter=bl)
    for _ in range(n):
        cx, cy = x + a.rng.random() * w, y + a.rng.random() * h
        a.ellipse(cx, cy, a.rng.uniform(30, 110), a.rng.uniform(10, 34), fill=INK, opacity=op,
                  transform=f"rotate({f(a.rng.uniform(-30, 30))} {f(cx)} {f(cy)})")
    a.close()


def _branch(rng, x, y, ang, L, depth, out, budget):
    steps = max(2, int(L / 20))
    px, py = x, y
    seg = [f"M{round(px)},{round(py)}"]
    kids = []
    for i in range(steps):
        if budget[0] <= 0:
            break
        budget[0] -= 1
        ang += rng.uniform(-0.14, 0.14)
        nx, ny = px + math.cos(ang) * L / steps, py + math.sin(ang) * L / steps
        seg.append(f"l{round(nx) - round(px)},{round(ny) - round(py)}")
        if depth > 0 and i > 0:
            for sg in (-1, 1):
                if rng.random() < 0.7:
                    kids.append((nx, ny, ang + sg * rng.uniform(0.5, 0.95), L * (1 - i / steps) * rng.uniform(0.25, 0.5)))
        px, py = nx, ny
    out.append("".join(seg))
    for kx, ky, ka, kl in kids:
        if kl > 7:
            _branch(rng, kx, ky, ka, kl, depth - 1, out, budget)


def frost(a, x, y, a0, a1, reach, n=7, color=SNOW, op=0.85, haze=True, sw=1.0, budget=260):
    """Frost growing out of a point between two angles (degrees): a haze and feathered crystals."""
    if reach <= 0:
        return
    if haze:
        g = a.radial([(0, color, op * 0.55), (0.5, color, op * 0.18), (1, color, 0)])
        a.circle(x, y, reach * 0.75, fill=g)
    out = []
    n = max(3, int(n * 1.6))
    b = [budget]
    for i in range(n):
        ang = math.radians(a0 + (a1 - a0) * (i + a.rng.uniform(0.15, 0.85)) / n)
        _branch(a.rng, x, y, ang, reach * a.rng.uniform(0.45, 1.0), 2 if reach > 90 else 1, out, b)
    a.path("".join(out), fill="none", stroke=color, stroke_width=sw, stroke_linecap="round", opacity=op)


def frost_corners(a, level, color=SNOW, op=0.8, x=0, y=0, w=None, h=None):
    """Frost from the four corners of a page; level 0 to 1 is how far it has grown."""
    w = a.w if w is None else w
    h = a.h if h is None else h
    r = min(w, h) * (0.12 + 0.5 * level)
    if level <= 0:
        return
    n = 5 + int(level * 5)
    for (cx, cy, a0) in ((x, y, 0), (x + w, y, 90), (x + w, y + h, 180), (x, y + h, 270)):
        rr = r * a.rng.uniform(0.7, 1.0)
        a.open("g", clip_path=a.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"/>'))
        g = a.radial([(0, color, op * 0.6), (0.6, color, op * 0.2), (1, color, 0)])
        a.circle(cx, cy, rr * 0.8, fill=g)
        frost(a, cx, cy, a0 + 4, a0 + 86, rr, n=n, color="#7f8c96", op=op * 0.55, haze=False, sw=1.6)
        frost(a, cx + 1, cy + 1, a0 + 4, a0 + 86, rr, n=n, color=color, op=op, haze=False, sw=0.9)
        a.close()


def ink_filter(a, patch=1.0, wob=2.5):
    """Rubber-stamp ink: patchy coverage and a slightly torn edge."""
    fid = a.uid("ink")
    s = a.rng.randint(1, 900)
    a.defn(f'<filter id="{fid}" x="-10%" y="-20%" width="120%" height="140%">'
           f'<feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="{s}" result="n"/>'
           f'<feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {f(-3.2 * patch)} {f(1.0 + 1.25 * patch)}" '
           f'result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="s"/>'
           f'<feTurbulence type="turbulence" baseFrequency="0.06" numOctaves="1" seed="{s + 3}" result="d"/>'
           f'<feDisplacementMap in="s" in2="d" scale="{f(wob)}"/></filter>')
    return f"url(#{fid})"


def stamp(a, cx, cy, text, w=300, h=86, rot=-8, color=RED, size=None, sub=None, opacity=0.86, patch=1.0):
    """A rubber stamp: a ruled box, bold type, uneven ink."""
    size = size or min(h * 0.62, w / (len(text) * 0.72))
    a.open("g", transform=f"translate({f(cx)},{f(cy)}) rotate({f(rot)})", opacity=opacity, filter=ink_filter(a, patch))
    a.rect(-w / 2, -h / 2, w, h, fill="none", stroke=color, stroke_width=max(3, h * 0.07))
    a.rect(-w / 2 + h * 0.1, -h / 2 + h * 0.1, w - h * 0.2, h - h * 0.2, fill="none", stroke=color,
           stroke_width=max(1, h * 0.02))
    ty = size * 0.34 - (size * 0.16 if sub else 0)
    a.text(0, ty, text, size=size, family="monospace", fill=color, font_weight="bold", text_anchor="middle",
           letter_spacing=f(size * 0.08))
    if sub:
        a.text(0, h / 2 - h * 0.17, sub, size=h * 0.15, family="monospace", fill=color, text_anchor="middle",
               letter_spacing=2)
    a.close()


def punch(a, x, y, r=11, back="#3a3d3f"):
    a.circle(x, y, r, fill=back)
    a.path(f"M{f(x - r)},{f(y)}A{f(r)},{f(r)} 0 0 1 {f(x + r)},{f(y)}", fill="none", stroke="#000", stroke_width=2,
           opacity=0.5)


def page(a, x, y, w, h, color=PAPER, shadow=True, rot=0, holes=0, lines=0):
    """A sheet of form paper lying on whatever is under it."""
    if rot:
        a.open("g", transform=f"rotate({f(rot)} {f(x + w / 2)} {f(y + h / 2)})")
    if shadow:
        a.rect(x + 5, y + 7, w, h, fill="#000", opacity=0.28)
    a.rect(x, y, w, h, fill=color)
    for i in range(holes):
        punch(a, x + 26, y + h * (i + 1) / (holes + 1))
    if rot:
        a.close()


def torn_d(a, x, y, w, h, top=True, bottom=True, amp=5.0, step=9.0):
    """Path of a strip with torn long edges."""
    r = a.rng
    pts = []
    n = int(w / step)
    for i in range(n + 1):
        pts.append((x + w * i / n, y + (r.uniform(-amp, amp) if top else 0)))
    for i in range(n + 1):
        pts.append((x + w - w * i / n, y + h + (r.uniform(-amp, amp) if bottom else 0)))
    return "M" + " L".join(f"{f(px)},{f(py)}" for px, py in pts) + "Z"


def circ_pts(cx, cy, r, n=22, ry=None, a0=0.0):
    ry = r if ry is None else ry
    return [(cx + r * math.cos(a0 + 2 * math.pi * i / n), cy + ry * math.sin(a0 + 2 * math.pi * i / n)) for i in range(n)]


# ---- the suits, each drawn by its owner's hand --------------------------------------------------
def suit(a, kind, cx, cy, r, color=INK, sw=None, fill="none", amp=None):
    """One hand-drawn suit mark of radius r."""
    sw = sw or max(1.6, r * 0.11)
    amp = r * 0.035 if amp is None else amp
    st = max(4, r * 0.3)
    kw = dict(stroke=color, stroke_width=sw, stroke_linecap="round", stroke_linejoin="round", fill=fill)

    def W(pts, closed=False, **over):
        k = dict(kw)
        k.update(over)
        a.path(a.wobble_d(pts, amp, st, closed), **k)

    if kind == "hands":
        pts = [(-0.5, 0.95), (-0.55, 0.1)]
        for i, (fx, top) in enumerate([(-0.45, -0.55), (-0.15, -0.9), (0.15, -0.95), (0.45, -0.7)]):
            pts += [(fx - 0.11, 0.0), (fx - 0.11, top), (fx + 0.11, top), (fx + 0.11, 0.0)]
        pts += [(0.58, 0.15), (0.95, -0.2), (1.02, 0.02), (0.6, 0.55), (0.5, 0.95)]
        W([(cx + px * r, cy + py * r) for px, py in pts], closed=True)
    elif kind == "keys":
        W(circ_pts(cx - r * 0.5, cy, r * 0.42, 14), closed=True)
        W(circ_pts(cx - r * 0.5, cy, r * 0.14, 8), closed=True, stroke_width=sw * 0.7)
        W([(cx - r * 0.08, cy), (cx + r * 0.98, cy)])
        W([(cx + r * 0.55, cy), (cx + r * 0.55, cy + r * 0.4)])
        W([(cx + r * 0.8, cy), (cx + r * 0.8, cy + r * 0.28)])
    elif kind == "anchors":
        W(circ_pts(cx, cy - r * 0.82, r * 0.16, 9), closed=True)
        W([(cx, cy - r * 0.66), (cx, cy + r * 0.9)])
        W([(cx - r * 0.42, cy - r * 0.4), (cx + r * 0.42, cy - r * 0.4)])
        arc = [(cx + r * 0.85 * math.cos(t), cy + r * 0.2 + r * 0.72 * math.sin(t)) for t in
               [math.pi * i / 10 for i in range(11)]]
        W(arc)
        W([(cx - r * 0.98, cy + r * 0.42), (cx - r * 0.85, cy + r * 0.2), (cx - r * 0.62, cy + r * 0.36)])
        W([(cx + r * 0.98, cy + r * 0.42), (cx + r * 0.85, cy + r * 0.2), (cx + r * 0.62, cy + r * 0.36)])
    elif kind == "houses":
        W([(cx - r * 0.7, cy + r * 0.85), (cx - r * 0.7, cy - r * 0.05), (cx, cy - r * 0.85), (cx + r * 0.7, cy - r * 0.05),
           (cx + r * 0.7, cy + r * 0.85)], closed=True)
        W([(cx - r * 0.92, cy + r * 0.12), (cx, cy - r * 0.9), (cx + r * 0.92, cy + r * 0.12)])
        W([(cx - r * 0.15, cy + r * 0.85), (cx - r * 0.15, cy + r * 0.3), (cx + r * 0.2, cy + r * 0.3),
           (cx + r * 0.2, cy + r * 0.85)])
    elif kind == "sparks":
        W([(cx + r * 0.25, cy - r), (cx - r * 0.5, cy + r * 0.12), (cx + r * 0.02, cy + r * 0.05), (cx - r * 0.25, cy + r),
           (cx + r * 0.55, cy - r * 0.2), (cx + r * 0.02, cy - r * 0.12)], closed=True)
    elif kind == "stars":
        p5 = [(cx + r * math.cos(math.radians(-90 + 144 * i)), cy + r * math.sin(math.radians(-90 + 144 * i)))
              for i in range(5)]
        W(p5, closed=True)
    else:  # the project stamp: a double ring and the form number
        W(circ_pts(cx, cy, r * 0.95, 20), closed=True, stroke_width=sw * 1.3)
        W(circ_pts(cx, cy, r * 0.68, 16), closed=True, stroke_width=sw * 0.6)
        a.text(cx, cy + r * 0.2, "7-F", size=r * 0.55, family="monospace", fill=color, font_weight="bold",
               text_anchor="middle")


# ---- shadow puppets: the cut-out body, side-on ---------------------------------------------------
def _ik(hx, hy, fx, fy, l1, l2, fwd=1):
    dx, dy = fx - hx, fy - hy
    d = max(1e-6, min(math.hypot(dx, dy), (l1 + l2) * 0.999))
    aa = math.acos(max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))))
    base = math.atan2(dy, dx)
    ang = base + aa * fwd
    return hx + l1 * math.cos(ang), hy + l1 * math.sin(ang)


def puppet(a, x, base, hcm, k=2.0, face=1, stride=0.22, lean=None, crouch=0.0, arms=((0.25, 0.3), (-0.3, 0.25)),
           fill=INK, pins=True, rods=False, head_tilt=0.0, opacity=None):
    """A black cut-out of a man seen side-on, feet at (x, base), hcm tall when he stands straight.

    The taller he is, the less his proportions are a man's: the legs and arms take most of the growth,
    the waist narrows, the neck lengthens and he stoops. Returns his joints in pixels.
    """
    t = max(0.0, min(1.0, (hcm - 178) / 160))
    leg, torso, neck = 86 + 89 * t, 58 + 50 * t, 6 + 12 * t
    hrx, hry = 10.5 + 0.8 * t, 12.5 + 1.5 * t
    s = hcm / (leg + torso + neck + 2 * hry + 3)
    leg, torso, neck = leg * s, torso * s, neck * s
    L = math.radians(4 + 15 * t) if lean is None else lean
    L += crouch * 0.5
    hip = (0.0, leg * (1 - 0.42 * crouch))
    sh = (hip[0] + torso * math.sin(L), hip[1] + torso * math.cos(L))
    nt = (sh[0] + neck * math.sin(L * 1.4), sh[1] + neck * math.cos(L * 1.4))
    hd = (nt[0] + hry * 0.8 * math.sin(L * 1.6 + head_tilt), nt[1] + hry * 0.8 * math.cos(L * 1.6 + head_tilt))
    J = {"hip": hip, "sh": sh, "head": hd}
    polys, circs = [], []

    def limb(A, B, wa, wb):
        dx, dy = B[0] - A[0], B[1] - A[1]
        d = math.hypot(dx, dy) or 1
        nx, ny = -dy / d, dx / d
        polys.append([(A[0] + nx * wa / 2, A[1] + ny * wa / 2), (B[0] + nx * wb / 2, B[1] + ny * wb / 2),
                      (B[0] - nx * wb / 2, B[1] - ny * wb / 2), (A[0] - nx * wa / 2, A[1] - ny * wa / 2)])
        circs.append((A[0], A[1], wa / 2))
        circs.append((B[0], B[1], wb / 2))

    th, kn, an = 15 - 4 * t, 11 - 3 * t, 7.5 - 1.5 * t
    for i, sg in enumerate((1, -1)):
        foot = (hip[0] + sg * stride * leg * 0.9, 0.0 + (2 if sg < 0 and stride > 0.3 else 0))
        ankle = (foot[0], foot[1] + 6)
        knee = _ik(hip[0], hip[1], ankle[0], ankle[1], leg * 0.5, leg * 0.5 - 6, fwd=1)
        if knee[0] < min(hip[0], ankle[0]) - 1:
            knee = _ik(hip[0], hip[1], ankle[0], ankle[1], leg * 0.5, leg * 0.5 - 6, fwd=-1)
        limb(hip, knee, th, kn)
        limb(knee, ankle, kn, an)
        fl = 13 + 8 * t
        polys.append([(ankle[0] - 5, ankle[1] + 1), (ankle[0] + fl, 3.5), (ankle[0] + fl + 3, 0), (ankle[0] - 6, 0)])
        J[f"knee{i}"], J[f"foot{i}"] = knee, foot
    # torso: wide at the shoulder, narrow at the waist
    sw_, ww = 27 - 2 * t, 22 - 8 * t
    limb((hip[0], hip[1] - 4), (sh[0], sh[1] - 6), ww, sw_)
    circs.append((sh[0], sh[1] - 5, sw_ / 2))
    limb(sh, nt, 9 - 2 * t, 8 - 2 * t)
    ua, fa = (30 + 34 * t) * s, (28 + 40 * t) * s
    for i, (au, bend) in enumerate(arms):
        S = (sh[0] + (2 if i == 0 else -2), sh[1] - 5)
        el = (S[0] + ua * math.sin(au + L * 0.5), S[1] - ua * math.cos(au + L * 0.5))
        hn = (el[0] + fa * math.sin(au + bend + L * 0.5), el[1] - fa * math.cos(au + bend + L * 0.5))
        limb(S, el, 10 - 2.5 * t, 7.5 - 2 * t)
        limb(el, hn, 7.5 - 2 * t, 5.5 - 1.2 * t)
        fl = 9 + 9 * t
        hx, hy = hn[0] + fl * math.sin(au + bend + L * 0.5), hn[1] - fl * math.cos(au + bend + L * 0.5)
        limb(hn, (hx, hy), 6.5 - 1.2 * t, 4.2 - 0.8 * t)
        J[f"elbow{i}"], J[f"hand{i}"] = el, hn

    def P(pt):
        return x + face * pt[0] * k, base - pt[1] * k

    a.open("g", fill=fill, opacity=opacity)
    for pts in polys:
        if pts:
            a.poly([P(q) for q in pts])
    d = []
    for cx_, cy_, r in circs:
        px, py = P((cx_, cy_))
        rr = r * k
        d.append(f"M{f(px - rr)},{f(py)}a{f(rr)},{f(rr)} 0 1,0 {f(2 * rr)},0a{f(rr)},{f(rr)} 0 1,0 {f(-2 * rr)},0")
    a.path("".join(d))
    hx, hy = P(hd)
    a.ellipse(hx, hy, hrx * k, hry * k, transform=f"rotate({f(math.degrees(L * 1.2 + head_tilt) * face)} {f(hx)} {f(hy)})")
    a.close()
    out = {n: P(v) for n, v in J.items()}
    if rods:
        for n in ("hand0", "head"):
            px, py = out[n]
            a.line(px, py, px + face * 6, base + 60, stroke="#2b2620", stroke_width=2.2, opacity=0.9)
    if pins:
        for n in ("hip", "sh", "knee0", "knee1", "elbow0", "elbow1"):
            px, py = out[n]
            a.circle(px, py, max(1.6, 1.1 * k), fill="#8a7a55")
    out["k"], out["face"], out["hr"] = k, face, (hrx * k, hry * k)
    return out


# ---- hands on a table, seen from above -----------------------------------------------------------
FINGERS = [(-20, 50, 11, -15), (-6.5, 66, 12, -5), (7.5, 72, 12.5, 4), (21, 62, 12, 14)]  # x, length, width, splay


def hand_top(a, x, y, rot=0, side=1, scale=1.0, curl=(0, 0, 0, 0), thumb=52, thumb_curl=0.0, skin=SKIN,
             sleeve=GREEN, sleeve_len=260, cuff="#4c5e51", spread=1.0, nails=True, shadow=True):
    """A hand flat on a table from above, fingers toward -y, the forearm running back toward +y.

    side=1 puts the thumb on the +x side. curl 0..1 per finger (little finger first) folds it under.
    """
    bones = []
    bones.append((0, -14, 0, -38, 54))
    bones.append((0, 0, 0, -10, 46))
    tips = []
    for (fx, ln, wd, sp), c in zip(FINGERS, curl):
        ang = math.radians(sp * spread)
        ln2 = ln * (1 - 0.6 * c)
        bx, by = fx, -52
        mx, my = bx + math.sin(ang) * ln2 * 0.52, by - math.cos(ang) * ln2 * 0.52
        ang2 = ang * 1.25
        tx, ty = mx + math.sin(ang2) * ln2 * 0.48, my - math.cos(ang2) * ln2 * 0.48
        bones.append((bx, by + 10, mx, my, wd))
        bones.append((mx, my, tx, ty, wd - 1.2))
        tips.append((tx, ty, ang2, wd, c, mx, my))
    ta = math.radians(thumb)
    bx, by = 24, -20
    mx, my = bx + math.sin(ta) * 32, by - math.cos(ta) * 32
    ta2 = ta - 0.5 - thumb_curl
    tx, ty = mx + math.sin(ta2) * 28, my - math.cos(ta2) * 28
    bones.append((bx - 8, by + 8, mx, my, 16))
    bones.append((mx, my, tx, ty, 13))
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(rot)}) scale({f(side * scale)},{f(scale)})")
    if shadow:
        a.open("g", opacity=0.3, filter=a.blur(5), transform="translate(7,9)")
        for x1, y1, x2, y2, w in bones:
            a.line(x1, y1, x2, y2, stroke="#000", stroke_width=w, stroke_linecap="round")
        if sleeve:
            a.poly([(-27, 4), (27, 4), (40, sleeve_len), (-40, sleeve_len)], fill="#000")
        a.close()
    if sleeve:
        a.poly([(-27, 2), (27, 2), (40, sleeve_len), (-40, sleeve_len)], fill=sleeve, stroke=INK, stroke_width=2.5,
               stroke_linejoin="round")
        d = "".join(f"M{f(-24 - i * 0.5 + j * 9)},{f(30 + i * 13)}l5,9" for i in range(int((sleeve_len - 30) / 13))
                    for j in range(6 + i // 5))
        a.open("g", clip_path=a.clip(f'<polygon points="-27,2 27,2 40,{sleeve_len} -40,{sleeve_len}"/>'))
        a.path(d, stroke=INK, stroke_width=1, opacity=0.35, fill="none")
        a.close()
        a.rect(-29, -2, 58, 24, rx=4, fill=cuff, stroke=INK, stroke_width=2.5)
        a.circle(18, 10, 3, fill=INK, opacity=0.7)
    for col, extra in ((INK, 5), (skin, 0)):
        for x1, y1, x2, y2, w in bones:
            a.line(x1, y1, x2, y2, stroke=col, stroke_width=w + extra, stroke_linecap="round")
    # knuckles, nails, the web of the thumb
    d = ""
    for (tx, ty, ang, wd, c, mx, my), (fx, ln, _, sp) in zip(tips, FINGERS):
        d += f"M{f(mx - wd * 0.28)},{f(my + 1)}q{f(wd * 0.28)},{f(-3)} {f(wd * 0.56)},0"
        d += f"M{f(fx - wd * 0.3)},{f(-50)}q{f(wd * 0.3)},{f(-4)} {f(wd * 0.6)},0"
        if nails and c < 0.5:
            a.ellipse(tx, ty - 1, wd * 0.3, wd * 0.36, fill="#F1EADB", stroke=INK, stroke_width=0.8, opacity=0.9,
                      transform=f"rotate({f(math.degrees(ang))} {f(tx)} {f(ty)})")
    d += "M-12,-8q12,5 24,0 M-9,-3q9,4 18,0"
    a.path(d, fill="none", stroke=INK, stroke_width=1.3, stroke_linecap="round", opacity=0.75)
    if nails:
        a.ellipse(tx, ty, 4.2, 4.8, fill="#F1EADB", stroke=INK, stroke_width=0.8, opacity=0.9,
                  transform=f"rotate({f(math.degrees(ta2))} {f(tx)} {f(ty)})")
    a.close()


def footprint(a, x, y, ang, size, color="#3f4a52", left=True, opacity=1.0, bare=False):
    """One print in snow seen from above; ang is the heading in radians (toes point that way)."""
    off = size * 0.26 * (1 if left else -1)
    px, py = x + math.sin(ang) * off, y - math.cos(ang) * off
    a.open("g", transform=f"translate({f(px)},{f(py)}) rotate({f(math.degrees(ang) + 90)})", opacity=opacity, fill=color)
    if bare:
        a.ellipse(0, -size * 0.1, size * 0.17, size * 0.36)
        a.ellipse(0, size * 0.36, size * 0.12, size * 0.14)
        for i in range(5):
            a.circle(-size * 0.16 + i * size * 0.08, -size * 0.52 + abs(i - 1.5) * size * 0.03, size * 0.045)
    else:
        a.ellipse(0, -size * 0.18, size * 0.2, size * 0.32)
        a.rect(-size * 0.14, size * 0.22, size * 0.28, size * 0.24, rx=size * 0.07)
    a.close()


def hatch_in(a, x, y, w, h, **kw):
    """Hatching clipped to its own box."""
    a.hatch(x, y, w, h, clip=a.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"/>'), **kw)


def speckle(a, clip, x, y, w, h, color="#000", strength=0.5, freq=0.9):
    """A cheap texture: noise as alpha in one colour, clipped (clip is 'url(#..)')."""
    fid = a.uid("spk")
    r, g, b = (int(color[i:i + 2], 16) / 255 for i in (1, 3, 5))
    a.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="{freq}" numOctaves="2" seed="{a.seed % 983}"/><feColorMatrix values="0 0 0 0 {r:.2f}  '
           f'0 0 0 0 {g:.2f}  0 0 0 0 {b:.2f}  0 0 0 {f(strength * 3)} {f(-strength * 1.2)}"/></filter>')
    a.open("g", clip_path=clip)
    a.rect(x, y, w, h, filter=f"url(#{fid})")
    a.close()

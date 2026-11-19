"""The Lord of the Sea: palette and shared drawing helpers for the code-drawn art.

One burin line everywhere. Ruled hatching means Order, wave hatching means Wild. Cream laid paper
with a plate mark; salt bloom on anything that has been wet (DEEP_DIVE.md section 4).
"""
import math

from artkit import Art, f

G = "lord-of-the-sea"

INK = "#1F2E4A"      # Company ink-blue
RED = "#8C2B2B"      # ledger red
TEA = "#6B4A2B"      # tea brown
LAMP = "#F4F1E8"     # lamp white
GREEN = "#2F6B5E"    # sea-green
FOAM = "#E8F2EE"     # foam
VIOLET = "#4B3F63"   # storm violet
GOLD = "#E7A93B"     # dawn gold
SEAINK = "#3C7A6A"   # the Voice and every spiral
PAPER = "#EFE6D0"    # cream laid paper
PAPER2 = "#E3D7BA"
SAIL = "#FBF8EF"
BLUEBLACK = "#1B2238"  # blue-black writing ink
TICK = "#2E7A46"     # the Lord of Tea's green tick
PENCIL = "#55524c"
# the Deep
ABYSS = "#070D18"
DEEP1 = "#0E1B2C"
LINE = "#DCE8EC"     # white line on blue-black
# tattoo flash
BLACK = "#16130F"
FLASHPAPER = "#DCCBA2"
BONE = "#F6ECD2"
# porcelain
COB = "#1E3F8C"
COB2 = "#3D63B8"
WASH = "#A9BCE3"
GLAZE = "#F7F8FB"

ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
REGIONS = [("home", "Home Reach"), ("lanes", "Tidewater"), ("unwritten", "The Unwritten"),
           ("salt", "The Salt Steps"), ("strait", "The Lamplit Strait"), ("pearl", "The Pearl Banks"),
           ("spice", "The Spice Mouth"), ("halls", "The King's Halls")]


def lerp(a, b, t):
    return a + (b - a) * t


def pd(pts, closed=False):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if closed else "")


def arc_d(cx, cy, r, a0, a1):
    x0, y0 = cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0))
    x1, y1 = cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1))
    large = 1 if abs(a1 - a0) > 180 else 0
    sweep = 1 if a1 > a0 else 0
    return f"M{f(x0)},{f(y0)} A{f(r)},{f(r)} 0 {large},{sweep} {f(x1)},{f(y1)}"


def spiral_pts(cx, cy, r0, r1, turns=3.0, cw=True, start=-90, n=None):
    """An Archimedean spiral from radius r0 out to r1. Clockwise on screen when cw."""
    n = n or int(turns * 28)
    out = []
    for i in range(n + 1):
        t = i / n
        ang = math.radians(start) + (1 if cw else -1) * t * turns * 2 * math.pi
        r = r0 + (r1 - r0) * t
        out.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return out


def spiral(a: Art, cx, cy, r0, r1, turns=3.0, cw=True, start=-90, **kw):
    kw.setdefault("stroke", SEAINK)
    kw.setdefault("stroke_width", 2)
    kw.setdefault("fill", "none")
    kw.setdefault("stroke_linecap", "round")
    a.path(a.smooth_d(spiral_pts(cx, cy, r0, r1, turns, cw, start)), **kw)


# ---- surfaces -------------------------------------------------------------------------------------

def pattern(a: Art, col, gap=5.0, sw=0.9, ang=0.0, wave=False, opacity=1.0, bg=None):
    """A hatch pattern fill: ruled (Order) or wave (Wild). Returns 'url(#id)'."""
    pid = a.uid("pat")
    if wave:
        w, h = gap * 3.2, gap
        body = (f'<path d="M0,{f(h / 2)} Q{f(w / 4)},{f(h / 2 - gap * 0.55)} {f(w / 2)},{f(h / 2)} '
                f'T{f(w)},{f(h / 2)}" fill="none" stroke="{col}" stroke-width="{f(sw)}" opacity="{f(opacity)}"/>')
    else:
        w, h = gap, gap
        body = f'<path d="M0,{f(h / 2)} H{f(w)}" stroke="{col}" stroke-width="{f(sw)}" opacity="{f(opacity)}"/>'
    if bg:
        body = f'<rect width="{f(w)}" height="{f(h)}" fill="{bg}"/>' + body
    a.defn(f'<pattern id="{pid}" width="{f(w)}" height="{f(h)}" patternUnits="userSpaceOnUse" '
           f'patternTransform="rotate({f(ang)})">{body}</pattern>')
    return f"url(#{pid})"


def plate(a: Art, tone=PAPER, m=None, grain=0.22, mark=True, laid=True):
    """Cream laid paper with the plate mark a copper plate leaves."""
    a.paper(tone, grain=grain)
    if laid:
        a.rect(0, 0, a.w, a.h, fill=pattern(a, TEA, gap=4, sw=0.5, opacity=0.13))
        a.rect(0, 0, a.w, a.h, fill=pattern(a, TEA, gap=47, sw=0.7, ang=90, opacity=0.1))
    m = min(a.w, a.h) * 0.045 if m is None else m
    if mark:
        a.rect(m, m, a.w - 2 * m, a.h - 2 * m, fill="#fff", opacity=0.16)
        a.rect(m, m, a.w - 2 * m, a.h - 2 * m, fill="none", stroke=TEA, stroke_width=1.2, opacity=0.45)
        a.rect(m + 1.6, m + 1.6, a.w - 2 * m - 3.2, a.h - 2 * m - 3.2, fill="none", stroke="#fff", stroke_width=1.2,
               opacity=0.6)
    return m


def frame(a: Art, x, y, w, h, col=INK, sw=2.0, gap=6):
    """A double engraved rule."""
    a.rect(x, y, w, h, fill="none", stroke=col, stroke_width=sw)
    a.rect(x + gap, y + gap, w - 2 * gap, h - 2 * gap, fill="none", stroke=col, stroke_width=sw * 0.35)


def salt(a: Art, cx, cy, r, n=None, strength=1.0):
    """Salt bloom: the pale tide ring a wetting leaves, and its crystals."""
    flt = a.roughen(scale=r * 0.22, freq=0.035)
    a.open("g", filter=flt)
    a.circle(cx, cy, r, fill="#fff", opacity=0.10 * strength)
    a.circle(cx, cy, r, fill="none", stroke="#fff", stroke_width=max(1.5, r * 0.05), opacity=0.55 * strength)
    a.circle(cx, cy, r * 0.97, fill="none", stroke=TEA, stroke_width=0.8, opacity=0.35 * strength)
    a.close()
    n = n or int(r * 0.9)
    d = []
    for _ in range(n):
        ang, rr = a.rng.uniform(0, 6.283), r * (0.86 + a.rng.random() * 0.2)
        s = a.rng.uniform(0.6, 1.8)
        d.append(f"M{f(cx + rr * math.cos(ang))},{f(cy + rr * math.sin(ang))}h{f(s)}v{f(s)}h{f(-s)}z")
    a.path("".join(d), fill="#fff", opacity=0.75 * strength)


def smallcaps(a: Art, x, y, s, size=18, col=INK, anchor="middle", spacing=None, **kw):
    kw.setdefault("font_weight", "normal")
    a.text(x, y, s.upper(), size=size, family="serif", fill=col, text_anchor=anchor,
           letter_spacing=f(size * 0.22 if spacing is None else spacing), **kw)


def italic(a: Art, x, y, s, size=18, col=INK, anchor="middle", **kw):
    a.text(x, y, s, size=size, family="serif", fill=col, text_anchor=anchor, font_style="italic", **kw)


def script(a: Art, x, y, w, size=1.0, col=BLUEBLACK, slant=0.0, sw=None, opacity=None):
    """A line of engrossing hand: loops and ascenders, read as script at a glance."""
    r = a.rng
    d = [f"M{f(x)},{f(y)}"]
    cx = x
    while cx < x + w:
        for _ in range(r.randint(3, 8)):
            h = 9 * size * (2.1 if r.random() < 0.18 else 1)
            dn = 9 * size * (1.9 if r.random() < 0.08 else 0)
            step = r.uniform(6, 9) * size
            if cx + step > x + w:
                break
            d.append(f"C{f(cx + step * 0.2 + slant * h)},{f(y - h)} {f(cx + step * 0.8 + slant * h)},{f(y - h)} "
                     f"{f(cx + step * 0.5 - slant * dn)},{f(y + dn)}")
            cx += step
        cx += 9 * size + r.uniform(0, 6)
        d.append(f"M{f(cx)},{f(y)}")
    a.path(" ".join(d[:-1]), fill="none", stroke=col, stroke_width=f(sw or 1.5 * size), stroke_linecap="round",
           opacity=opacity)


def flourish(a: Art, x, y, s, flip=1, col=BLUEBLACK, sw=1.6):
    pts = []
    for i in range(60):
        t = i / 59
        ang = t * 4.2 * math.pi
        rr = 40 * s * (1 - t) + 4
        pts.append((x + flip * (t * 160 * s + rr * math.cos(ang)), y + rr * math.sin(ang) * 0.7))
    a.path(a.smooth_d(pts), fill="none", stroke=col, stroke_width=sw)


# ---- the sea ----------------------------------------------------------------------------------------

def swell(amp=10.0, wl=260.0, drift=90.0, ph=0.0, sharp=0.0):
    """A wave-height function fn(x, t): t is 0 at the horizon and 1 in the foreground."""
    def fn(x, t):
        A = amp * (0.2 + 0.8 * t)
        k = (x + drift * t * 6) / wl * 2 * math.pi + ph
        y = 0.6 * math.sin(k) + 0.4 * math.sin((x - drift * t * 3) / (wl * 0.37) * 2 * math.pi + ph * 1.7)
        if sharp:
            y = lerp(y, 1 - 2 * (1 - abs(math.sin(k / 2))) ** 1.7, sharp)
        return A * y
    return fn


def bump(cx, w, H, t0=0.6, tw=0.45, lean=0.0):
    """One great wave: a crest of height H centred on (cx, row t0)."""
    def fn(x, t):
        g = math.exp(-((t - t0) / tw) ** 2)
        u = (x - cx - lean * (t - t0) * w) / w
        return -H * g * math.exp(-u * u) * (1 + 0.25 * math.tanh(u * 2))
    return fn


def plus(*fns):
    return lambda x, t: sum(fn(x, t) for fn in fns)


def sea(a: Art, x0, x1, y0, y1, rows=30, fn=None, col=INK, sw=(0.5, 1.6), step=14, shade=0.22, persp=1.5,
        opacity=None, mask=None):
    """Wave-hatched water: one burin line per row, doubled on the faces that turn from the light."""
    fn = fn or swell()
    for i in range(rows):
        t = i / max(1, rows - 1)
        yb = y0 + (y1 - y0) * t ** persp
        pts, x = [], x0
        while x <= x1 + step:
            pts.append((x, yb + fn(x, t)))
            x += step
        d = ["M" + " L".join(f"{int(px)},{f(py)}" for px, py in pts)]
        if shade:
            gap = 1.6 + 2.6 * t
            run = False
            for (px, py), (qx, qy) in zip(pts, pts[1:]):
                if (qy - py) / step > shade:
                    if not run:
                        d.append(f"M{int(px)},{f(py + gap)}")
                    d.append(f"L{int(qx)},{f(qy + gap)}")
                    run = True
                else:
                    run = False
        a.path(" ".join(d), fill="none", stroke=col, stroke_width=f(lerp(sw[0], sw[1], t)), stroke_linejoin="round",
               opacity=opacity, clip_path=mask)


def calm(a: Art, x0, x1, y0, y1, rows=26, col=INK, sw=(0.5, 1.3), persp=1.5, opacity=None, mask=None):
    """Ruled water: the Company's flat calm."""
    for i in range(rows):
        t = i / max(1, rows - 1)
        y = y0 + (y1 - y0) * t ** persp
        L = 40 + a.rng.random() * 260
        a.path(f"M{f(x0)},{f(y)}H{f(x1)}", stroke=col, stroke_width=f(lerp(sw[0], sw[1], t)), fill="none",
               stroke_dasharray=f"{f(L)} {f(3 + 5 * t)} {f(L * 0.4)} {f(2 + 3 * t)}",
               stroke_dashoffset=f(a.rng.random() * 300), opacity=opacity, clip_path=mask)


def sky(a: Art, x0, x1, y0, y1, gap=7.0, col=INK, sun=None, opacity=0.75):
    """Ruled sky, with the low sun from the left when the scene is Alexi's."""
    if sun:
        sx, sy, sr = sun
        a.circle(sx, sy, sr * 3.2, fill=a.radial([(0, GOLD, 0.55), (0.5, GOLD, 0.16), (1, GOLD, 0)]))
    d, y, i = [], y0, 0
    while y < y1:
        d.append(f"M{f(x0)},{f(y)}H{f(x1)}")
        y += gap * (1 - 0.35 * (y - y0) / max(1, y1 - y0))
        i += 1
    a.path("".join(d), stroke=col, stroke_width=0.7, fill="none", opacity=opacity)
    if sun:
        a.circle(sx, sy, sr, fill=PAPER, stroke=col, stroke_width=1.2)
        a.circle(sx, sy, sr, fill=GOLD, opacity=0.75)
        for k in range(1, 5):
            a.circle(sx, sy, sr + k * sr * 0.42, fill="none", stroke=GOLD, stroke_width=1.3, opacity=0.7 - k * 0.13)


def cloud(a: Art, x, y, w, col=INK, fill=PAPER, n=5):
    """A scalloped engraver's cloud, flat-bottomed, hatched below."""
    r = a.rng
    d = f"M{f(x)},{f(y)}"
    cx = x
    for i in range(n):
        ww = w / n * r.uniform(0.8, 1.2)
        hh = w * 0.085 * (1 - abs(i - (n - 1) / 2) / n) * r.uniform(0.9, 1.5)
        d += f" a{f(ww / 2)},{f(hh)} 0 0,1 {f(ww)},0"
        cx += ww
    d += f" L{f(x)},{f(y)}Z"
    a.path(d, fill=fill, stroke=col, stroke_width=1.3)
    for k in range(1, 4):
        a.line(x + k * 9, y + k * 4, cx - k * 14, y + k * 4, stroke=col, stroke_width=0.7, opacity=0.8)


def gull(a: Art, x, y, s=1.0, col=INK, sw=1.4):
    a.path(f"M{f(x - 12 * s)},{f(y + 3 * s)} Q{f(x - 6 * s)},{f(y - 7 * s)} {f(x)},{f(y)} "
           f"Q{f(x + 6 * s)},{f(y - 7 * s)} {f(x + 12 * s)},{f(y + 3 * s)}", fill="none", stroke=col, stroke_width=sw,
           stroke_linecap="round")


def foam(a: Art, pts, col=FOAM, n=3, r=(1.2, 4.5), stroke=INK):
    """Foam along a crest: small open circles and spray."""
    d = []
    for (x, y) in pts:
        for _ in range(n):
            rr = a.rng.uniform(*r)
            px, py = x + a.rng.uniform(-9, 9), y + a.rng.uniform(-10, 4)
            d.append(f"M{f(px - rr)},{f(py)}a{f(rr)},{f(rr)} 0 1,0 {f(2 * rr)},0a{f(rr)},{f(rr)} 0 1,0 {f(-2 * rr)},0")
    a.path("".join(d), fill=col, stroke=stroke, stroke_width=0.8)


# ---- vessels ----------------------------------------------------------------------------------------

SHIPS = {
    "sloop": dict(L=130, D=22, sheer=0.5, masts=[(8, 132, "gaff")], jib=True, cabin=True),
    "cutter": dict(L=230, D=32, sheer=0.35, masts=[(-34, 170, "sq3"), (48, 190, "sq3")], ports=6, sprit=True,
                   dark=True, pennant=RED),
    "merchant": dict(L=270, D=44, sheer=0.7, masts=[(-78, 170, "sq3"), (-4, 205, "sq3"), (72, 182, "sq3")], sprit=True,
                     ports=0, dark=True, castle=True, pennant=RED),
    "packet": dict(L=210, D=28, sheer=0.4, masts=[(-44, 168, "gaff"), (36, 182, "gaff")], jib=True, sprit=True,
                   dark=True, pennant=RED),
    "brig": dict(L=220, D=36, sheer=0.55, masts=[(-40, 175, "sq3"), (44, 185, "sq3")], sprit=True, castle=True),
    "ketch": dict(L=170, D=26, sheer=0.5, masts=[(24, 150, "gaff"), (-52, 100, "gaff")], jib=True, sprit=True),
    "lugger": dict(L=140, D=20, sheer=0.5, masts=[(-30, 92, "lug"), (30, 112, "lug")]),
    "ferry": dict(L=210, D=18, sheer=0.05, masts=[], flat=True, canopy=True),
    "skiff": dict(L=74, D=10, sheer=0.6, masts=[], oars=True),
    "lugskiff": dict(L=84, D=11, sheer=0.6, masts=[(4, 72, "lug")]),
    "lighter": dict(L=180, D=22, sheer=0.05, masts=[(-56, 86, "lug")], flat=True, cargo=True),
    "diver": dict(L=120, D=15, sheer=0.45, masts=[], davit=True),
    "supply": dict(L=140, D=20, sheer=0.5, masts=[(6, 116, "lug")], barrels=True),
    "galley": dict(L=230, D=20, sheer=0.7, masts=[(0, 120, "sq1")], oars=9, castle=True),
    "pinnace": dict(L=150, D=22, sheer=0.6, masts=[(-30, 120, "sq2"), (36, 132, "sq2")], sprit=True),
}


def hull_d(L, D, sheer=0.5, flat=False):
    h = L / 2
    s = sheer * D
    if flat:
        return (f"M{f(-h)},{f(-4)} L{f(h)},{f(-4)} L{f(h - D * 0.9)},{f(D)} L{f(-h + D * 0.9)},{f(D)}Z")
    return (f"M{f(-h)},{f(-s)} Q{f(-h * 0.2)},{f(s * 0.55)} {f(h * 0.55)},{f(-s * 0.15)} "
            f"Q{f(h * 0.85)},{f(-s * 0.6)} {f(h + D * 0.5)},{f(-s * 1.5)} "
            f"Q{f(h * 0.9)},{f(D * 0.75)} {f(h * 0.62)},{f(D)} L{f(-h * 0.8)},{f(D)} "
            f"Q{f(-h - D * 0.12)},{f(D * 0.55)} {f(-h)},{f(-s)}Z")


def deck_y(x, L, D, sheer, flat=False):
    if flat:
        return -4
    u = x / (L / 2)
    return -sheer * D * (0.75 * u * u - 0.1) - (sheer * D * 0.4 if u > 0.8 else 0) * (u - 0.8) * 5


def ship(a: Art, kind, x, y, s=1.0, ang=0.0, flip=False, ink=INK, fill=None, sailfill=SAIL, sails=True, bell=False,
         helm=False, heel=0.0, lw=1.0, hatchsails=True):
    """A vessel in side view, bow to the right, drawn in one engraved line. The deck line is y."""
    k = SHIPS[kind]
    L, D, sheer, flat = k["L"], k["D"], k.get("sheer", 0.5), k.get("flat", False)
    dark = k.get("dark") and fill is None
    hullfill = (ink if dark else SAIL) if fill is None else fill
    portcol = LAMP if dark else ink
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)}) scale({f(-s if flip else s)},{f(s)})")
    dy = lambda px: deck_y(px, L, D, sheer, flat)
    st = dict(stroke=ink, stroke_linecap="round", stroke_linejoin="round")
    # masts and rig, behind the hull
    for mx, mh, rig in k["masts"]:
        base = dy(mx)
        a.line(mx, base, mx, base - mh, stroke_width=2.6 * lw, **st)
        a.path(f"M{f(mx)},{f(base - mh * 0.93)} L{f(mx - mh * 0.16)},{f(dy(mx - mh * 0.16))} "
               f"M{f(mx)},{f(base - mh * 0.93)} L{f(mx + mh * 0.16)},{f(dy(mx + mh * 0.16))}", fill="none",
               stroke_width=0.8 * lw, **st)
        if rig.startswith("sq"):
            n = int(rig[2])
            for j in range(n):
                yy = base - mh * (0.16 + 0.8 * j / n)
                hh = mh * 0.8 / n - 5
                sw_ = mh * (0.42 - 0.07 * j)
                a.line(mx - sw_ / 2 - 4, yy - hh, mx + sw_ / 2 + 4, yy - hh, stroke_width=2 * lw, **st)
                if sails:
                    q = [(mx - sw_ / 2, yy - hh), (mx + sw_ / 2, yy - hh), (mx + sw_ / 2 + 5, yy), (mx - sw_ / 2 - 5, yy)]
                    a.path(f"M{f(q[0][0])},{f(q[0][1])} L{f(q[1][0])},{f(q[1][1])} Q{f(q[2][0] + 7)},{f(yy - hh / 2)} "
                           f"{f(q[2][0])},{f(q[2][1])} Q{f(mx)},{f(yy - 7)} {f(q[3][0])},{f(q[3][1])} "
                           f"Q{f(q[3][0] + 6)},{f(yy - hh / 2)} {f(q[0][0])},{f(q[0][1])}Z", fill=sailfill,
                           stroke_width=1.4 * lw, **st)
                    if hatchsails:
                        d = "".join(f"M{f(mx + sw_ * u)},{f(yy - hh + 2)}V{f(yy - 5)}" for u in (-0.3, -0.1, 0.1, 0.3))
                        a.path(d, fill="none", stroke=ink, stroke_width=0.6 * lw, opacity=0.8)
                else:
                    a.path(f"M{f(mx - sw_ / 2)},{f(yy - hh)} q{f(sw_ * 0.2)},{f(hh * 0.5)} {f(sw_ * 0.1)},{f(hh * 0.8)} "
                           f"M{f(mx + sw_ * 0.3)},{f(yy - hh)} q{f(-sw_ * 0.1)},{f(hh * 0.3)} {f(sw_ * 0.05)},{f(hh * 0.6)}",
                           fill="none", stroke_width=0.9 * lw, **st)
        elif rig == "gaff":
            boom = mh * 0.5
            top = base - mh * 0.92
            if sails:
                a.path(f"M{f(mx - 2)},{f(top)} L{f(mx - boom * 0.72)},{f(top - mh * 0.06 + mh * 0.2)} "
                       f"L{f(mx - boom)},{f(base - 12)} L{f(mx - 2)},{f(base - 12)}Z", fill=sailfill, stroke_width=1.4 * lw,
                       **st)
                if hatchsails:
                    d = "".join(f"M{f(mx - 2)},{f(base - 12 - j * mh * 0.11)}L{f(mx - boom * (1 - j * 0.045))},"
                                f"{f(base - 12 - j * mh * 0.11)}" for j in range(1, 7))
                    a.path(d, fill="none", stroke=ink, stroke_width=0.6 * lw, opacity=0.8)
            a.line(mx, base - 12, mx - boom - 4, base - 12, stroke_width=2 * lw, **st)
            a.line(mx, top, mx - boom * 0.74, top + mh * 0.14, stroke_width=1.8 * lw, **st)
        elif rig == "lug":
            if sails:
                a.path(f"M{f(mx - mh * 0.34)},{f(base - mh * 0.78)} L{f(mx + mh * 0.3)},{f(base - mh * 0.98)} "
                       f"L{f(mx + mh * 0.36)},{f(base - 10)} L{f(mx - mh * 0.3)},{f(base - 12)}Z", fill=sailfill,
                       stroke_width=1.4 * lw, **st)
                if hatchsails:
                    d = "".join(f"M{f(mx - mh * 0.3)},{f(base - 12 - j * mh * 0.16)}L{f(mx + mh * 0.34)},"
                                f"{f(base - 14 - j * mh * 0.19)}" for j in range(1, 5))
                    a.path(d, fill="none", stroke=ink, stroke_width=0.6 * lw, opacity=0.8)
            a.line(mx - mh * 0.36, base - mh * 0.77, mx + mh * 0.32, base - mh * 0.99, stroke_width=1.8 * lw, **st)
    if k.get("pennant") and k["masts"]:
        mx, mh, _ = max(k["masts"], key=lambda m: m[1])
        a.path(f"M{f(mx)},{f(dy(mx) - mh)} l-30,5 l30,7z", fill=k["pennant"], stroke=ink, stroke_width=0.8 * lw)
    bowx = L / 2 + (0 if flat else D * 0.5)
    bowy = -4 if flat else -sheer * D * 1.5
    if k.get("sprit"):
        a.line(bowx - 6, bowy + 2, bowx + L * 0.2, bowy - L * 0.06, stroke_width=2.2 * lw, **st)
    if (k.get("jib") or k.get("sprit")) and k["masts"]:
        mx, mh, _ = max(k["masts"], key=lambda m: m[0])
        tipx, tipy = (bowx + L * 0.2, bowy - L * 0.06) if k.get("sprit") else (bowx - 2, bowy)
        top = dy(mx) - mh * 0.9
        if sails and k.get("jib"):
            a.path(f"M{f(mx + 4)},{f(top)} L{f(tipx)},{f(tipy - 2)} L{f(mx + 8)},{f(dy(mx) - 14)}Z", fill=sailfill,
                   stroke_width=1.4 * lw, **st)
        else:
            a.line(mx, top, tipx, tipy, stroke_width=0.8 * lw, **st)
    if k.get("canopy"):
        a.path(f"M{f(-L * 0.3)},-44 Q0,-56 {f(L * 0.3)},-44 L{f(L * 0.3)},-38 L{f(-L * 0.3)},-38Z", fill=sailfill,
               stroke_width=1.4 * lw, **st)
        d = "".join(f"M{f(px)},-38V-4" for px in (-L * 0.3 + 3, -L * 0.1, L * 0.1, L * 0.3 - 3))
        a.path(d, fill="none", stroke_width=1.6 * lw, **st)
        a.path(f"M{f(-L * 0.44)},-18 H{f(L * 0.44)} M{f(-L * 0.44)},-18 V-4 M{f(L * 0.44)},-18 V-4", fill="none",
               stroke_width=1.2 * lw, **st)
        a.path(f"M{f(L * 0.36)},-18 v-22 m-5,6 a5,6 0 0,1 10,0 z", fill=GOLD, stroke_width=1.2 * lw, **st)
    if k.get("davit"):
        a.path(f"M{f(-L * 0.1)},{f(dy(-L * 0.1))} v-44 q0,-14 16,-14 h14 M{f(-L * 0.1 + 30)},{f(dy(0) - 58)} v{f(58 + D * 2.4)}",
               fill="none", stroke_width=1.8 * lw, **st)
    if k.get("cargo"):
        for (cx, cy, cw, ch) in ((-10, -22, 30, 18), (24, -22, 30, 18), (58, -20, 24, 16), (6, -40, 30, 18)):
            a.rect(cx, cy, cw, ch, fill=hullfill if not dark else SAIL, stroke_width=1.2 * lw, **st)
            a.path(f"M{f(cx)},{f(cy + ch / 2)}h{f(cw)} M{f(cx + cw / 2 - 3)},{f(cy + ch / 2 - 3)}h6v6h-6z", fill="none",
                   stroke_width=0.8 * lw, **st)
    if k.get("barrels"):
        for bx in (-40, -22, 38):
            a.ellipse(bx, dy(bx) - 9, 8, 10, fill=SAIL if fill is None else fill, stroke_width=1.2 * lw, **st)
            a.path(f"M{f(bx - 8)},{f(dy(bx) - 12)}h16 M{f(bx - 8)},{f(dy(bx) - 6)}h16", fill="none", stroke_width=0.8 * lw,
                   **st)
    if k.get("oars"):
        n = k["oars"] if isinstance(k["oars"], int) and k["oars"] > 1 else 2
        for j in range(n):
            ox = lerp(-L * 0.3, L * 0.3, j / max(1, n - 1)) if n > 2 else (-6 + j * 14)
            a.line(ox, dy(ox) + 2, ox - D * 1.3, D * 1.9, stroke_width=1.5 * lw, **st)
    # hull
    a.path(hull_d(L, D, sheer, flat), fill=hullfill, stroke_width=2 * lw, **st)
    h = L / 2
    d = ""
    for j in (0.32, 0.6):
        if flat:
            d += f"M{f(-h + D * j * 0.9)},{f(-4 + (D + 4) * j)} H{f(h - D * j * 0.9)}"
        else:
            d += (f"M{f(-h + 2)},{f(-sheer * D + D * j)} Q{f(-h * 0.2)},{f(sheer * D * 0.55 + D * j * 0.8)} "
                  f"{f(h * (0.62 + 0.3 * (1 - j)))},{f(-sheer * D * 0.3 + D * j)}")
    a.path(d, fill="none", stroke=portcol, stroke_width=0.8 * lw, opacity=0.85)
    if k.get("castle"):
        a.path(f"M{f(-h)},{f(dy(-h))} v{f(-D * 0.45)} h{f(L * 0.2)} v{f(D * 0.4)}", fill=hullfill, stroke_width=1.6 * lw,
               **st)
        a.path("".join(f"M{f(-h + 6 + j * 10)},{f(dy(-h) - D * 0.3)}h4" for j in range(int(L * 0.2 / 10))), fill="none",
               stroke=portcol, stroke_width=2 * lw)
    if k.get("ports"):
        n = k["ports"]
        a.path("".join(f"M{f(lerp(-h * 0.7, h * 0.6, j / (n - 1)))},{f(D * 0.18)}h6v5h-6z" for j in range(n)),
               fill=portcol)
    if k.get("cabin"):
        cx0 = -L * 0.3
        a.path(f"M{f(cx0)},{f(dy(cx0))} v-15 q{f(L * 0.13)},-5 {f(L * 0.27)},0 v15", fill=SAIL if fill is None else fill,
               stroke_width=1.5 * lw, **st)
        for j in range(3):
            a.circle(cx0 + 8 + j * L * 0.085, dy(cx0) - 8, 2.6, fill="none", stroke=ink, stroke_width=1.1 * lw)
    if helm:
        hx = -L * 0.42
        hy = dy(hx)
        a.path(f"M{f(hx - 9)},{f(hy)} q-2,-17 9,-18 q12,1 10,18z", fill=ink)        # heavy back
        a.circle(hx + 1, hy - 23, 5.2, fill=ink)
        a.path(f"M{f(hx + 6)},{f(hy - 14)} q10,-10 13,-22", fill="none", stroke=ink, stroke_width=3.2, stroke_linecap="round")
        a.line(hx - 6, hy - 6, hx - 22, hy - 2, stroke=ink, stroke_width=2, stroke_linecap="round")   # tiller
    if bell:
        bx, by = bowx - 10, bowy - 4
        a.path(f"M{f(bx)},{f(by)} v-12 h10 v4 M{f(bx + 10)},{f(by - 8)} q-7,1 -7,10 h14 q0,-9 -7,-10z", fill=hullfill,
               stroke=GOLD, stroke_width=1.6 * lw, stroke_linejoin="round")
        a.circle(bx + 10, by + 4, 1.6, fill=GOLD)
    a.close()


def buoy(a: Art, x, y, s=1.0, col=INK, lit=False):
    a.path(f"M{f(x - 7 * s)},{f(y)} L{f(x - 4 * s)},{f(y - 14 * s)} L{f(x + 4 * s)},{f(y - 14 * s)} L{f(x + 7 * s)},{f(y)}Z",
           fill=RED if lit else SAIL, stroke=col, stroke_width=1.2)
    a.line(x, y - 14 * s, x, y - 24 * s, stroke=col, stroke_width=1.2)
    a.circle(x, y - 26 * s, 2.4 * s, fill=GOLD if lit else col)
    a.path(f"M{f(x - 12 * s)},{f(y + 1)}h{f(24 * s)}", stroke=col, stroke_width=1)


def lighthouse(a: Art, x, y, h=120, col=INK, lit=True, beam=0):
    w = h * 0.13
    if lit and beam:
        a.path(f"M{f(x)},{f(y - h)} L{f(x + beam)},{f(y - h - abs(beam) * 0.16)} L{f(x + beam)},{f(y - h + abs(beam) * 0.2)}Z",
               fill=a.gradient([(0, GOLD), (1, PAPER)], 0 if beam > 0 else 1, 0, 1 if beam > 0 else 0, 0), opacity=0.55)
    a.path(f"M{f(x - w)},{f(y)} L{f(x - w * 0.6)},{f(y - h * 0.88)} L{f(x + w * 0.6)},{f(y - h * 0.88)} L{f(x + w)},{f(y)}Z",
           fill=SAIL, stroke=col, stroke_width=1.5)
    for j in (0.25, 0.55):
        yy = y - h * j
        ww = w * (1 - 0.4 * j / 0.88)
        a.path(f"M{f(x - ww)},{f(yy)} L{f(x + ww)},{f(yy)} L{f(x + ww * 0.9)},{f(yy - h * 0.14)} L{f(x - ww * 0.9)},{f(yy - h * 0.14)}Z",
               fill=col)
    a.rect(x - w * 0.8, y - h * 0.9, w * 1.6, h * 0.03, fill=col)
    a.rect(x - w * 0.5, y - h * 1.02, w, h * 0.12, fill=GOLD if lit else col, stroke=col, stroke_width=1.2)
    a.path(f"M{f(x - w * 0.7)},{f(y - h * 1.02)} L{f(x)},{f(y - h * 1.12)} L{f(x + w * 0.7)},{f(y - h * 1.02)}Z", fill=col)


def bottle(a: Art, x, y, s=1.0, ang=0.0, col=INK, glass=GREEN, tag=False, cord=0, fill_opacity=0.5):
    """A hanging bottle; (x, y) is the top of its neck."""
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)}) scale({f(s)})")
    if cord:
        a.line(0, -cord, 0, 0, stroke=col, stroke_width=1.2)
    a.path("M-5,0 h10 v20 q13,8 13,24 v44 q0,6 -6,6 h-24 q-6,0 -6,-6 v-44 q0,-16 13,-24z", fill=glass,
           fill_opacity=fill_opacity, stroke=col, stroke_width=1.8, stroke_linejoin="round")
    a.path("M-7,3 h14 M-11,52 v32 M-7,50 v36", fill="none", stroke=col, stroke_width=1)
    a.path("M9,40 q4,6 4,14 v26", fill="none", stroke="#fff", stroke_width=2, opacity=0.7, stroke_linecap="round")
    if tag:
        a.path("M5,10 q10,4 12,14", fill="none", stroke=TEA, stroke_width=1.2)
        a.path("M12,22 l22,6 l-5,26 l-22,-6z", fill=LAMP, stroke=col, stroke_width=1.2)
        a.path(a.smooth_d(spiral_pts(22, 38, 1, 8, 2.2)), fill="none", stroke=SEAINK, stroke_width=1.3)
    a.close()


def rose(a: Art, cx, cy, R, col=INK, accent=RED, labels=True, fine=True):
    """A compass rose: degree ticks cut as dashed circles, an eight-point star."""
    c = 2 * math.pi
    for step, L, w in ((1, 5, 0.5), (5, 9, 0.8), (10, 14, 1.2)):
        if step == 1 and not fine:
            continue
        rr = R - L / 2
        per = c * rr / (360 / step)
        a.circle(cx, cy, rr, fill="none", stroke=col, stroke_width=L, stroke_dasharray=f"{f(w)} {per - w:.3f}",
                 transform=f"rotate(-90 {f(cx)} {f(cy)})")
    a.circle(cx, cy, R, fill="none", stroke=col, stroke_width=1.4)
    a.circle(cx, cy, R * 0.6, fill="none", stroke=accent, stroke_width=0.9)
    if labels:
        for deg in range(0, 360, 30):
            ang = math.radians(deg - 90)
            a.text(cx + (R + R * 0.11) * math.cos(ang), cy + (R + R * 0.11) * math.sin(ang) + R * 0.035, f"{deg:03d}",
                   size=max(8, R * 0.085), family="sans-serif", fill=col, text_anchor="middle")
    for i in range(16):
        ang = math.radians(i * 22.5 - 90)
        L = R * (0.56 if i % 4 == 0 else (0.36 if i % 2 == 0 else 0.2))
        tip = (cx + L * math.cos(ang), cy + L * math.sin(ang))
        b = R * 0.07
        l = (cx + b * math.cos(ang - 1.57), cy + b * math.sin(ang - 1.57))
        r_ = (cx + b * math.cos(ang + 1.57), cy + b * math.sin(ang + 1.57))
        a.poly([tip, l, (cx, cy)], fill=col)
        a.poly([tip, r_, (cx, cy)], fill=PAPER, stroke=col, stroke_width=0.7)
    a.poly(Art.star_pts(cx, cy - R * 0.6 - R * 0.09, R * 0.07, R * 0.03, 5), fill=accent)


def wax(a: Art, cx, cy, r, col=RED, emblem=None, ribbon=None, cracked=False):
    """A wax seal: pressed blob, raised rim, an emblem cut in it."""
    if ribbon:
        for dx, rot in ((-0.35, 14), (0.3, -10)):
            a.path(f"M{f(cx + dx * r)},{f(cy)} l{f(-r * 0.3)},{f(r * 1.9)} l{f(r * 0.3)},{f(-r * 0.25)} l{f(r * 0.3)},{f(r * 0.25)} "
                   f"l{f(-r * 0.05)},{f(-r * 1.9)}z", fill=ribbon, stroke=BLACK, stroke_width=0.8, opacity=0.95,
                   transform=f"rotate({rot} {f(cx)} {f(cy)})")
    pts = []
    n = 26
    for i in range(n):
        ang = 2 * math.pi * i / n
        rr = r * (1 + a.rng.uniform(-0.07, 0.09))
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    a.path(a.smooth_d(pts, closed=True), fill="#000", opacity=0.22, transform="translate(3,4)")
    a.path(a.smooth_d(pts, closed=True), fill=col)
    a.circle(cx, cy, r * 0.98, fill=a.radial([(0, "#fff", 0.28), (0.6, "#fff", 0.03), (1, "#000", 0.25)], 0.36, 0.3, 0.8))
    a.circle(cx, cy, r * 0.74, fill="none", stroke="#000", stroke_width=r * 0.05, opacity=0.3)
    a.circle(cx, cy, r * 0.72, fill="none", stroke="#fff", stroke_width=r * 0.025, opacity=0.35)
    if emblem:
        emblem(cx, cy, r * 0.62)
    if cracked:
        a.path(f"M{f(cx - r * 1.05)},{f(cy - r * 0.3)} l{f(r * 0.5)},{f(r * 0.22)} l{f(r * 0.22)},{f(-r * 0.2)} l{f(r * 0.5)},{f(r * 0.5)} "
               f"l{f(r * 0.3)},{f(-r * 0.08)} l{f(r * 0.4)},{f(r * 0.3)}", fill="none", stroke=PAPER, stroke_width=r * 0.09,
               stroke_linejoin="bevel")
        a.path(f"M{f(cx - r * 1.05)},{f(cy - r * 0.3)} l{f(r * 0.5)},{f(r * 0.22)} l{f(r * 0.22)},{f(-r * 0.2)} l{f(r * 0.5)},{f(r * 0.5)} "
               f"l{f(r * 0.3)},{f(-r * 0.08)} l{f(r * 0.4)},{f(r * 0.3)}", fill="none", stroke="#000", stroke_width=1,
               opacity=0.5, transform="translate(1.5,2)")


def company_mark(a: Art, cx, cy, r, col="#000", opacity=0.45, sw=None):
    """The Great British Tea Company's mark: a tea leaf within a ring, crossed by a ruled bar."""
    sw = sw or max(1.2, r * 0.07)
    a.open("g", opacity=opacity, fill="none", stroke=col, stroke_width=sw, stroke_linecap="round")
    a.circle(cx, cy, r)
    a.path(f"M{f(cx)},{f(cy + r * 0.7)} Q{f(cx - r * 0.75)},{f(cy)} {f(cx)},{f(cy - r * 0.75)} "
           f"Q{f(cx + r * 0.75)},{f(cy)} {f(cx)},{f(cy + r * 0.7)} M{f(cx)},{f(cy + r * 0.7)} V{f(cy - r * 0.5)}")
    a.path(f"M{f(cx - r * 0.3)},{f(cy - r * 0.05)} L{f(cx)},{f(cy + r * 0.2)} L{f(cx + r * 0.3)},{f(cy - r * 0.05)} "
           f"M{f(cx - r * 0.24)},{f(cy - r * 0.35)} L{f(cx)},{f(cy - r * 0.12)} L{f(cx + r * 0.24)},{f(cy - r * 0.35)}",
           stroke_width=sw * 0.6)
    a.close()


def tick(a: Art, x, y, s=1.0, col=TICK):
    """The Lord of Tea's green tick and initial."""
    a.path(f"M{f(x)},{f(y)} l{f(5 * s)},{f(7 * s)} l{f(11 * s)},{f(-17 * s)}", fill="none", stroke=col, stroke_width=2.2 * s,
           stroke_linecap="round", stroke_linejoin="round")
    a.path(f"M{f(x + 20 * s)},{f(y - 8 * s)} h{f(9 * s)} m{f(-4.5 * s)},0 v{f(13 * s)}", fill="none", stroke=col,
           stroke_width=1.6 * s, stroke_linecap="round")


def radiolarian(a: Art, cx, cy, R, col, n=8, kind=0, glow=True, sw=1.0):
    if glow:
        a.circle(cx, cy, R * 2.0, fill=a.radial([(0, col, 0.5), (0.5, col, 0.16), (1, col, 0)]))
    a.circle(cx, cy, R, fill="none", stroke=col, stroke_width=1.6 * sw)
    a.circle(cx, cy, R * 0.62, fill="none", stroke=col, stroke_width=1 * sw)
    for ring, m in ((0.82, n * 2), (0.45, n)):
        per = 2 * math.pi * R * ring / m
        a.circle(cx, cy, R * ring, fill="none", stroke=col, stroke_width=R * 0.11, stroke_dasharray=f"{f(per * 0.35)} {per * 0.65:.3f}",
                 opacity=0.8)
    d = ""
    for i in range(n):
        ang = 2 * math.pi * i / n
        ca, sa = math.cos(ang), math.sin(ang)
        L = R * (0.7 + 0.5 * (i % 2)) if kind == 0 else R * 1.3
        d += f"M{f(cx + R * 0.62 * ca)},{f(cy + R * 0.62 * sa)}L{f(cx + (R + L) * ca)},{f(cy + (R + L) * sa)}"
        if kind == 1:
            for t in (0.4, 0.7):
                qx, qy = cx + (R + L * t) * ca, cy + (R + L * t) * sa
                for sgn in (0.9, -0.9):
                    d += f"M{f(qx)},{f(qy)}l{f(R * 0.2 * math.cos(ang + sgn))},{f(R * 0.2 * math.sin(ang + sgn))}"
    a.path(d, fill="none", stroke=col, stroke_width=1.1 * sw, stroke_linecap="round")
    a.circle(cx, cy, R * 0.22, fill=col, opacity=0.9)


def snow(a: Art, x, y, w, h, n=200, col=LINE, opacity=0.5, r=(0.4, 1.3)):
    a.stipple(x, y, w, h, n=n, r=r, fill=col, opacity=opacity)


def chain_d(pts, link=16):
    """Path data for a chain along a polyline: alternate links seen face-on and edge-on."""
    d = []
    acc = 0.0
    i = 0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        L = math.hypot(x2 - x1, y2 - y1)
        ang = math.atan2(y2 - y1, x2 - x1)
        while acc < L:
            t = acc / L
            x, y = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            ca, sa = math.cos(ang), math.sin(ang)
            if i % 2 == 0:
                rx, ry = link * 0.62, link * 0.34
                d.append(f"M{f(x - rx * ca)},{f(y - rx * sa)}A{f(rx)},{f(ry)} {f(math.degrees(ang))} 1,0 {f(x + rx * ca)},{f(y + rx * sa)}"
                         f"A{f(rx)},{f(ry)} {f(math.degrees(ang))} 1,0 {f(x - rx * ca)},{f(y - rx * sa)}")
            else:
                d.append(f"M{f(x - link * 0.45 * ca)},{f(y - link * 0.45 * sa)}L{f(x + link * 0.45 * ca)},{f(y + link * 0.45 * sa)}")
            acc += link * 0.85
            i += 1
        acc -= L
    return "".join(d)


def swimmer(a: Art, x, y, s=1.0, ang=0.0, carry=False, col=LINE, bg=DEEP1, kick=0.0):
    """Alexi under water: a heavy barefoot man at full stretch, cut as one pale shape. No face."""
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)}) scale({f(s)})")
    limbs = [
        ("M-30,-4 L-66,-20 L-100,-12 L-114,-20" if kick else "M-30,-4 L-66,-12 L-100,-6 L-114,-12", 13),
        ("M-30,8 L-62,22 L-96,40 L-108,50" if kick else "M-30,8 L-64,18 L-98,22 L-112,30", 13),
        ("M-34,2 L28,-2", 38),
        ("M26,-10 L62,-22 L100,-20 L112,-24", 12),
        ("M24,8 L50,22 L60,44", 12),
    ]
    if carry:
        limbs[3] = ("M26,-10 L52,8 L86,18", 12)
        limbs[4] = ("M24,6 L46,28 L82,32", 12)
    st = dict(fill="none", stroke_linecap="round", stroke_linejoin="round")
    hx, hy = (56, -12) if not carry else (50, -26)
    if carry:
        body = [("M40,36 L98,26", 17), ("M98,26 L124,42 L140,66", 8), ("M40,36 L14,50 L-2,74", 8),
                ("M44,38 L24,60 L22,86", 8), ("M92,22 L110,0 L106,-22", 7)]
        for d, w in body:
            a.path(d, stroke=bg, stroke_width=w + 5, **st)
        for d, w in body:
            a.path(d, stroke=FOAM, stroke_width=w, opacity=0.75, **st)
        a.circle(110, 20, 9, fill=FOAM, opacity=0.75, stroke=bg, stroke_width=2)
    for d, w in limbs:
        a.path(d, stroke=bg, stroke_width=w + 5, **st)
    a.circle(hx, hy, 15, fill=bg)
    for d, w in limbs:
        a.path(d, stroke=col, stroke_width=w, **st)
    a.circle(hx, hy, 12.5, fill=col)
    a.path(f"M{hx - 11},{hy - 6} q10,-13 22,-3", fill="none", stroke=bg, stroke_width=1.4)      # hair, from behind
    a.path("M-40,-14 q30,-6 62,-3 M-36,-8 q30,-5 58,-3 M-40,16 q28,6 56,3", fill="none",
           stroke=bg, stroke_width=1, opacity=0.7)
    a.close()


def person(a: Art, x, y, h=20.0, col=INK, skirt=False, arm=None):
    """A small standing figure for a coast: a head and a coat, nothing more."""
    w = h * (0.34 if skirt else 0.24)
    a.circle(x, y - h * 0.88, h * 0.12, fill=col)
    a.path(f"M{f(x - h * 0.1)},{f(y - h * 0.76)} L{f(x + h * 0.1)},{f(y - h * 0.76)} L{f(x + w)},{f(y)} L{f(x - w)},{f(y)}Z", fill=col)
    if arm is not None:
        a.line(x, y - h * 0.66, x + arm * h * 0.42, y - h * 0.9, stroke=col, stroke_width=max(1.2, h * 0.07),
               stroke_linecap="round")

"""WrymWretch art kit: the style bible's palette (DEEP_DIVE.md section 4) and the shared hand.

Bone and tarnished silver relief over a starry void, fine black cracks, one realm accent. The 2D
and 1D families keep their own owned styles (docs/graphic_styles.json) and take accents from here.
"""
import json
import math
from pathlib import Path

from artkit import f

G = "wrymwretch"
DATA = Path(__file__).resolve().parents[2] / "data"

BONE, SILVER, VOID, INK = "#E9E2D0", "#8E97A3", "#0B0D1A", "#17151A"
MOSS, SKY, MOLTEN, SEA, VIOLET, GOLD = "#7FA650", "#A9C7E8", "#E0762E", "#2F7FA8", "#6B3FA0", "#E7C566"
PAPER, GRAPHITE = "#F1E8D6", "#45464a"
SILK = "#EDE4CF"
WASH = "#1b1a1c"

# realm order everywhere: West, North, South, East, Below, Above
REALMS = [
    dict(key="west", name="West", tribe="Wood", acc=MOSS, dragon="Sylvan", elf="Thalen", place="Cedarheart Forest"),
    dict(key="north", name="North", tribe="Sky", acc=SKY, dragon="Aetherius", elf="Aeris", place="Galewing Peaks"),
    dict(key="south", name="South", tribe="Earth", acc=MOLTEN, dragon="Gaia", elf="Rhyla", place="Mosswhisper Depths"),
    dict(key="east", name="East", tribe="Water", acc=SEA, dragon="Aquatica", elf="Lunessa", place="Tidecaller Shores"),
    dict(key="below", name="Below", tribe="Dark", acc=VIOLET, dragon="Umbra", elf="Kael", place="Duskbane Underworld"),
    dict(key="above", name="Above", tribe="Celestial", acc=GOLD, dragon="Astraia", elf="Seraphyne", place="High Realm"),
]
REALM_IX = {r["key"]: i for i, r in enumerate(REALMS)}
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]


def data(name):
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


# ---- geometry (from the pictographs) ------------------------------------------------------------
def catmull(pts, n=10):
    q = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(q) - 2):
        p0, p1, p2, p3 = q[i - 1], q[i], q[i + 1], q[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(pts[-1])
    return out


def brush_poly(p, pts, width, profile=lambda t: math.sin(math.pi * t) ** 0.6, jitter=0.6, n=10):
    """A tapered brush stroke along a curve, as a polygon."""
    c = catmull(pts, n)
    left, right = [], []
    for i, (x, y) in enumerate(c):
        a = c[max(0, i - 1)]
        b = c[min(len(c) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        w = width * max(0.04, profile(i / (len(c) - 1))) / 2
        w *= 1 + p.rng.uniform(-0.12, 0.12)
        left.append((x + nx * w + p.rng.uniform(-jitter, jitter), y + ny * w))
        right.append((x - nx * w, y - ny * w + p.rng.uniform(-jitter, jitter)))
    return left + right[::-1]


def pd(pts, close=True):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if close else "")


def brush(p, pts, width, profile=None, **kw):
    kw.setdefault("fill", WASH)
    p.path(pd(brush_poly(p, pts, width, profile) if profile else brush_poly(p, pts, width)), **kw)


def ridge(rng, x0, x1, base, amp, rough=0.55, levels=7):
    n = 2 ** levels
    ys = [0.0] * (n + 1)
    ys[0], ys[n] = rng.uniform(-amp, amp) * .3, rng.uniform(-amp, amp) * .3
    step, scale = n, amp
    while step > 1:
        half = step // 2
        for i in range(half, n, step):
            ys[i] = (ys[i - half] + ys[i + half]) / 2 + rng.uniform(-scale, scale)
        step, scale = half, scale * rough
    return [(x0 + (x1 - x0) * i / n, base + ys[i]) for i in range(n + 1)]


def split_poly(poly, px, py, dx, dy):
    a, b = [], []
    m = len(poly)
    for i in range(m):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % m]
        s1 = (x1 - px) * dy - (y1 - py) * dx
        s2 = (x2 - px) * dy - (y2 - py) * dx
        (a if s1 >= 0 else b).append((x1, y1))
        if (s1 >= 0) != (s2 >= 0):
            t = s1 / (s1 - s2)
            q = (x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)
            a.append(q)
            b.append(q)
    return a, b


def area(poly):
    return abs(sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1]
                   for i in range(len(poly)))) / 2


def shatter(rng, poly, cuts):
    pieces = [poly]
    for _ in range(cuts):
        pieces.sort(key=area)
        big = pieces.pop()
        cx = sum(x for x, _ in big) / len(big)
        cy = sum(y for _, y in big) / len(big)
        ang = rng.uniform(0, math.pi)
        a, b = split_poly(big, cx + rng.uniform(-8, 8), cy + rng.uniform(-8, 8), math.cos(ang), math.sin(ang))
        pieces += [x for x in (a, b) if len(x) >= 3]
    return pieces


def shade(hexc, k):
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5))
    if k >= 0:
        r, g, b = (int(c + (255 - c) * k) for c in (r, g, b))
    else:
        r, g, b = (int(c * (1 + k)) for c in (r, g, b))
    return f"#{r:02x}{g:02x}{b:02x}"


def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{int(x + (y - x) * t):02x}" for x, y in zip(a, b))


def rot(pts, ang, cx=0, cy=0):
    c, s = math.cos(ang), math.sin(ang)
    return [(cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c) for x, y in pts]


# ---- the reliquary hand -------------------------------------------------------------------------
def void(a, glow=None, stars=260, x=0, y=0, w=None, h=None, big=7):
    """Near-black starry void, with one accent glow (colour, cx, cy, r in 0..1 of the box)."""
    w = a.w if w is None else w
    h = a.h if h is None else h
    a.open("g", class_="plate")   # the ground: a mode strips it to use the piece alone
    a.rect(x, y, w, h, fill=VOID)
    a.rect(x, y, w, h, fill=a.radial([(0, "#1d2248", 0.75), (1, "#1d2248", 0)], 0.5, 0.35, 0.75))
    if glow:
        col, gx, gy, gr = glow
        a.rect(x, y, w, h, fill=a.radial([(0, col, 0.5), (0.5, col, 0.14), (1, col, 0)], gx, gy, gr))
    a.stipple(x, y, w, h, n=stars, r=(0.4, 1.3), fill=BONE, opacity=0.7)
    a.stipple(x, y, w, h, n=stars // 3, r=(0.5, 1.6), fill=SKY, opacity=0.6)
    for _ in range(big):
        sx, sy, s = x + a.rng.uniform(0.04, 0.96) * w, y + a.rng.uniform(0.04, 0.96) * h, a.rng.uniform(3, 7)
        a.poly(a.star_pts(sx, sy, s, s * 0.22, n=4), fill="#f6f3ea", opacity=0.85)
    a.close()


def bone_grad(a, dark=False):
    if dark:
        return a.gradient([(0, "#cfc7b2"), (0.5, "#a59c86"), (1, "#5d5748")], 0, 0, 1, 1)
    return a.gradient([(0, "#fbf7ec"), (0.45, BONE), (1, "#a8a08a")], 0, 0, 1, 1)


def silver_grad(a):
    return a.gradient([(0, "#e4e8ee"), (0.4, SILVER), (0.75, "#4c5361"), (1, "#a7afba")], 0, 0, 1, 1)


def gold_grad(a):
    return a.gradient([(0, "#fff2b0"), (0.35, GOLD), (0.62, "#a87618"), (1, "#f3d27a")], 0, 0, 1, 1)


def relief(a, d, fill, k=2.2, hi="#ffffff", lo="#05060d", **kw):
    """A carved ridge: shadow below-right, cold rim light above-left, then the face."""
    tr = kw.pop("transform", "")
    a.path(d, fill=lo, opacity=0.75, transform=f"{tr} translate({f(k)},{f(k * 1.3)})".strip())
    a.path(d, fill=hi, opacity=0.9, transform=f"{tr} translate({f(-k * 0.55)},{f(-k * 0.75)})".strip())
    a.path(d, fill=fill, transform=tr or None, **kw)


def crack_d(rng, x, y, ang, length, step=8.0, branch=0.22, depth=0):
    """Path data for one fine branching crack."""
    d = [f"M{f(x)},{f(y)}"]
    subs = []
    while length > 0:
        ang += rng.uniform(-0.7, 0.7)
        s = step * rng.uniform(0.6, 1.4)
        x, y = x + math.cos(ang) * s, y + math.sin(ang) * s
        d.append(f"L{f(x)},{f(y)}")
        length -= s
        if depth < 2 and rng.random() < branch:
            subs.append(crack_d(rng, x, y, ang + rng.choice((-1, 1)) * rng.uniform(0.6, 1.2), length * 0.5, step, branch, depth + 1))
    return "".join(d) + "".join(subs)


def cracks(a, x, y, w, h, n=6, length=None, clip=None, color=INK, width=0.9, opacity=0.8):
    r = a.rng
    length = length or min(w, h) * 0.6
    d = "".join(crack_d(r, x + r.random() * w, y + r.random() * h, r.uniform(0, 6.28), length * r.uniform(0.4, 1))
                for _ in range(n))
    a.path(d, fill="none", stroke=color, stroke_width=width, stroke_linejoin="round", opacity=opacity,
           clip_path=clip)


def slab(a, x, y, w, h, rx=8, fill=None, n_cracks=5, k=2.5):
    """A bone slab with rim light, ivory grain and cracks."""
    fill = fill or bone_grad(a)
    d = (f"M{f(x + rx)},{f(y)}H{f(x + w - rx)}Q{f(x + w)},{f(y)} {f(x + w)},{f(y + rx)}V{f(y + h - rx)}"
         f"Q{f(x + w)},{f(y + h)} {f(x + w - rx)},{f(y + h)}H{f(x + rx)}Q{f(x)},{f(y + h)} {f(x)},{f(y + h - rx)}"
         f"V{f(y + rx)}Q{f(x)},{f(y)} {f(x + rx)},{f(y)}Z")
    relief(a, d, fill, k=k)
    cl = a.clip(f'<path d="{d}"/>')
    grain(a, x, y, w, h, cl)
    if n_cracks:
        cracks(a, x, y, w, h, n_cracks, clip=cl)
    return cl


def grain(a, x, y, w, h, clip=None, alpha=0.22):
    """Ivory grain: long fine streaks."""
    fid = a.uid("iv")
    a.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="0.9 0.03" numOctaves="2" seed="{a.rng.randint(1, 900)}"/>'
           f'<feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.22  0 0 0 0 0.16  0 0 0 {f(alpha * 3)} {f(-alpha)}"/></filter>')
    a.rect(x, y, w, h, filter=f"url(#{fid})", clip_path=clip)


def carved_text(a, x, y, s, size, fill=None, anchor="middle", spacing=4, k=1.6, family="serif", weight="bold", **kw):
    """Lettering cut as a ridge: shadow, rim light, face."""
    fill = fill or BONE
    common = dict(size=size, family=family, text_anchor=anchor, letter_spacing=spacing, font_weight=weight, **kw)
    a.text(x + k, y + k * 1.3, s, fill="#04050a", opacity=0.85, **common)
    a.text(x - k * 0.5, y - k * 0.7, s, fill="#ffffff", opacity=0.9, **common)
    a.text(x, y, s, fill=fill, **common)


EMBLEM = [
    # west: leaf
    "M0,-1 Q.85,-.1 0,1 Q-.85,-.1 0,-1Z",
    # north: wing
    "M-1,.35 Q-.5,-1 1,-.6 Q.45,-.4 .7,-.1 Q.2,-.2 .35,.2 Q-.1,.05 -.15,.5 Q-.55,.2 -1,.35Z",
    # south: crystal
    "M0,-1 L.62,-.42 L.62,.42 L0,1 L-.62,.42 L-.62,-.42Z",
    # east: drop
    "M0,-1 Q.95,.15 .56,.62 A.79,.79 0 0 1 -.56,.62 Q-.95,.15 0,-1Z",
    # below: eclipse (crescent)
    "M.25,-1 A1,1 0 1 0 .25,1 A.72,.86 0 1 1 .25,-1Z",
    # above: four-point star
    "M0,-1 L.22,-.22 L1,0 L.22,.22 L0,1 L-.22,.22 L-1,0 L-.22,-.22Z",
]
EMBLEM_LINE = [
    "M0,-.8 V.9 M0,-.2 L.3,-.45 M0,.2 L-.3,-.05",
    "M-.6,.1 Q-.1,-.5 .6,-.4 M-.3,.25 Q.0,-.15 .35,-.1",
    "M-.62,-.42 L0,-.05 L.62,-.42 M0,-.05 V1",
    "M-.3,.45 Q0,.7 .3,.45",
    "",
    "M0,-.5 V.5 M-.5,0 H.5",
]


def emblem(a, i, cx, cy, s, fill, line=INK, raised=True):
    tr = f"translate({f(cx)},{f(cy)}) scale({f(s)})"
    if raised:
        a.path(EMBLEM[i], fill="#05060d", opacity=0.7, transform=f"translate({f(cx + s * .06)},{f(cy + s * .08)}) scale({f(s)})")
        a.path(EMBLEM[i], fill="#ffffff", opacity=0.85, transform=f"translate({f(cx - s * .035)},{f(cy - s * .05)}) scale({f(s)})")
    a.path(EMBLEM[i], fill=fill, transform=tr)
    if EMBLEM_LINE[i]:
        a.path(EMBLEM_LINE[i], fill="none", stroke=line, stroke_width=0.07, stroke_linecap="round", transform=tr, opacity=0.8)
    if i == 4:
        a.circle(cx + s * 0.38, cy, s * 0.3, fill=fill, opacity=0.55)


def silk(a, tint=None):
    """The handscroll's silk ground (twin flight)."""
    a.open("g", class_="plate")
    a.rect(0, 0, a.w, a.h, fill=SILK)
    gid = a.uid("silk")
    a.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="0.012 0.35" numOctaves="3" seed="{a.seed % 997}"/>'
           f'<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.25  0 0 0 0.22 0"/></filter>')
    a.rect(0, 0, a.w, a.h, filter=f"url(#{gid})")
    if tint:
        a.rect(0, 0, a.w, a.h, fill=tint, opacity=0.08)
    a.close()


def seal_stamp(a, i, x, y, s=44):
    """The scroll's seal: the realm's emblem cut out of a block of its accent."""
    col = shade(REALMS[i]["acc"], -0.25)
    a.rect(x, y, s, s, rx=3, fill=col, filter=a.roughen(2.5, 0.09), opacity=0.9)
    emblem(a, i, x + s / 2, y + s / 2, s * 0.32, SILK, line=col, raised=False)

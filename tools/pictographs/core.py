"""Procedural SVG pictographs: the shared drawing kit.

Stdlib only. Every pictograph is drawn by code from a seed, so the same key always draws the same
picture and a new seed draws a sibling. Games import this module from their own
`games/<slug>/pictographs/make.py` and register one function per 2D mode or 1D game:

    from core import Pic, register

    @register("stuffed-ones", "stitchwork")
    def stitchwork(p: Pic):
        p.paper("#efe6d2", grain=0.35)
        ...

`p` is a 1200 x 800 canvas with a seeded random generator (`p.rng`). Helpers below cover the
textures the styles need (hatching, stipple, halftone, stitches, wobbly hand lines, facets, pixel
grids). Everything is plain SVG 1.1: no scripts, no external links, no embedded rasters, generic
font families only.
"""
from __future__ import annotations

import hashlib
import math
import random
from xml.sax.saxutils import escape

W, H = 1200, 800
REGISTRY: dict[tuple[str, str], callable] = {}


def register(game: str, key: str):
    def deco(fn):
        REGISTRY[(game, key)] = fn
        return fn
    return deco


def f(x: float) -> str:
    """Compact number."""
    s = f"{x:.1f}"
    return s[:-2] if s.endswith(".0") else s


def attrs(**kw) -> str:
    out = []
    for k, v in kw.items():
        if v is None:
            continue
        k = k.rstrip("_").replace("_", "-")
        if isinstance(v, float):
            v = f(v)
        out.append(f'{k}="{escape(str(v), {chr(34): "&quot;"})}"')
    return " ".join(out)


class Pic:
    def __init__(self, game: str, key: str, title: str, desc: str, seed: int | None = None):
        self.game, self.key, self.title, self.desc = game, key, title, desc
        if seed is None:
            seed = int(hashlib.sha256(f"{game}/{key}".encode()).hexdigest()[:8], 16)
        self.seed = seed
        self.rng = random.Random(seed)
        self.defs: list[str] = []
        self.body: list[str] = []
        self._ids = 0

    # ---- plumbing -------------------------------------------------------------------------------
    def uid(self, stem: str = "d") -> str:
        self._ids += 1
        return f"{self.key}-{stem}{self._ids}"

    def raw(self, s: str):
        self.body.append(s)

    def defn(self, s: str):
        self.defs.append(s)

    def el(self, tag: str, **kw):
        self.body.append(f"<{tag} {attrs(**kw)}/>")

    def open(self, tag: str = "g", **kw):
        self.body.append(f"<{tag} {attrs(**kw)}>")

    def close(self, tag: str = "g"):
        self.body.append(f"</{tag}>")

    def svg(self) -> str:
        head = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
                f'role="img" aria-labelledby="{self.key}-t {self.key}-d">')
        parts = [head, f'<title id="{self.key}-t">{escape(self.title)}</title>',
                 f'<desc id="{self.key}-d">{escape(self.desc)}</desc>']
        if self.defs:
            parts.append("<defs>" + "".join(self.defs) + "</defs>")
        parts += self.body
        parts.append("</svg>")
        return "\n".join(parts) + "\n"

    # ---- primitives -----------------------------------------------------------------------------
    def rect(self, x, y, w, h, **kw):
        self.el("rect", x=float(x), y=float(y), width=float(w), height=float(h), **kw)

    def circle(self, cx, cy, r, **kw):
        self.el("circle", cx=float(cx), cy=float(cy), r=float(r), **kw)

    def ellipse(self, cx, cy, rx, ry, **kw):
        self.el("ellipse", cx=float(cx), cy=float(cy), rx=float(rx), ry=float(ry), **kw)

    def line(self, x1, y1, x2, y2, **kw):
        self.el("line", x1=float(x1), y1=float(y1), x2=float(x2), y2=float(y2), **kw)

    def poly(self, pts, closed=True, **kw):
        s = " ".join(f"{f(x)},{f(y)}" for x, y in pts)
        self.el("polygon" if closed else "polyline", points=s, **kw)

    def path(self, d, **kw):
        self.el("path", d=d, **kw)

    def text(self, x, y, s, size=24, family="serif", **kw):
        kw.setdefault("fill", "#222")
        self.body.append(f"<text {attrs(x=float(x), y=float(y), font_size=size, font_family=family, **kw)}>"
                         f"{escape(s)}</text>")

    # ---- surfaces -------------------------------------------------------------------------------
    def paper(self, color="#f2ead8", grain=0.3, fibre=None):
        """Fill the canvas with a colour and a procedural grain (feTurbulence, seeded)."""
        self.rect(0, 0, W, H, fill=color)
        if grain:
            fid = self.uid("grain")
            freq = 0.9 if fibre is None else fibre
            self.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%">'
                      f'<feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="2" seed="{self.seed % 997}"/>'
                      f'<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {f(grain)} 0"/></filter>')
            self.rect(0, 0, W, H, filter=f"url(#{fid})")

    def vignette(self, strength=0.6, color="#000"):
        gid = self.uid("vig")
        self.defn(f'<radialGradient id="{gid}" cx="50%" cy="50%" r="70%">'
                  f'<stop offset="55%" stop-color="{color}" stop-opacity="0"/>'
                  f'<stop offset="100%" stop-color="{color}" stop-opacity="{f(strength)}"/></radialGradient>')
        self.rect(0, 0, W, H, fill=f"url(#{gid})")

    def clip(self, inner: str) -> str:
        """Define a clipPath from raw SVG shape markup; returns 'url(#id)'."""
        cid = self.uid("clip")
        self.defn(f'<clipPath id="{cid}">{inner}</clipPath>')
        return f"url(#{cid})"

    def gradient(self, stops, x1=0, y1=0, x2=0, y2=1) -> str:
        gid = self.uid("lg")
        s = "".join(f'<stop offset="{f(o * 100)}%" stop-color="{c}"/>' for o, c in stops)
        self.defn(f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>')
        return f"url(#{gid})"

    def radial(self, stops, cx=0.5, cy=0.5, r=0.5) -> str:
        gid = self.uid("rg")
        s = "".join(f'<stop offset="{f(o * 100)}%" stop-color="{c}" stop-opacity="{f(a)}"/>' for o, c, a in stops)
        self.defn(f'<radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>')
        return f"url(#{gid})"

    def blur(self, sd=4) -> str:
        fid = self.uid("blur")
        self.defn(f'<filter id="{fid}" x="-20%" y="-20%" width="140%" height="140%">'
                  f'<feGaussianBlur stdDeviation="{f(sd)}"/></filter>')
        return f"url(#{fid})"

    def roughen(self, scale=3.0, freq=0.04) -> str:
        """A displacement filter that makes clean shapes look torn, inked or carved."""
        fid = self.uid("rough")
        self.defn(f'<filter id="{fid}"><feTurbulence type="turbulence" baseFrequency="{f(freq)}" numOctaves="2" '
                  f'seed="{self.rng.randint(1, 999)}" result="n"/>'
                  f'<feDisplacementMap in="SourceGraphic" in2="n" scale="{f(scale)}"/></filter>')
        return f"url(#{fid})"

    # ---- hand-made lines ------------------------------------------------------------------------
    def wobble_d(self, pts, amp=2.0, step=14.0, closed=False) -> str:
        """Path data through pts, subdivided and jittered so it reads as drawn by hand."""
        r = self.rng
        seq = list(pts) + ([pts[0]] if closed else [])
        out = []
        for (x1, y1), (x2, y2) in zip(seq, seq[1:]):
            n = max(1, int(math.hypot(x2 - x1, y2 - y1) / step))
            for i in range(n):
                t = i / n
                out.append((x1 + (x2 - x1) * t + r.uniform(-amp, amp), y1 + (y2 - y1) * t + r.uniform(-amp, amp)))
        out.append((seq[-1][0] + r.uniform(-amp, amp), seq[-1][1] + r.uniform(-amp, amp)))
        d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in out)
        return d + ("Z" if closed else "")

    def wobble(self, pts, amp=2.0, step=14.0, closed=False, **kw):
        kw.setdefault("fill", "none")
        self.path(self.wobble_d(pts, amp, step, closed), **kw)

    def smooth_d(self, pts, closed=False) -> str:
        """Catmull-Rom through pts as cubic Béziers."""
        p = list(pts)
        if closed:
            p = [p[-1]] + p + [p[0], p[1]]
        else:
            p = [p[0]] + p + [p[-1]]
        d = f"M{f(p[1][0])},{f(p[1][1])}"
        for i in range(1, len(p) - 2):
            x0, y0 = p[i - 1]; x1, y1 = p[i]; x2, y2 = p[i + 1]; x3, y3 = p[i + 2]
            d += (f" C{f(x1 + (x2 - x0) / 6)},{f(y1 + (y2 - y0) / 6)} "
                  f"{f(x2 - (x3 - x1) / 6)},{f(y2 - (y3 - y1) / 6)} {f(x2)},{f(y2)}")
        return d + ("Z" if closed else "")

    def stitch(self, pts, length=10, gap=6, **kw):
        """A running stitch along a polyline."""
        kw.setdefault("fill", "none")
        kw.setdefault("stroke_linecap", "round")
        self.path(self.wobble_d(pts, 0.6, 20), stroke_dasharray=f"{length} {gap}", **kw)

    def blanket_edge(self, pts, spacing=12, depth=10, **kw):
        """Blanket stitch around a closed shape (felt appliqué)."""
        kw.setdefault("stroke_linecap", "round")
        seq = list(pts) + [pts[0]]
        d = []
        for (x1, y1), (x2, y2) in zip(seq, seq[1:]):
            L = math.hypot(x2 - x1, y2 - y1)
            if L == 0:
                continue
            nx, ny = -(y2 - y1) / L, (x2 - x1) / L
            for i in range(int(L / spacing)):
                t = i * spacing / L
                x, y = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
                d.append(f"M{f(x)},{f(y)} l{f(nx * depth)},{f(ny * depth)}")
        self.path(" ".join(d), fill="none", **kw)

    # ---- fills ----------------------------------------------------------------------------------
    def hatch(self, x, y, w, h, angle=45, spacing=8, clip=None, jitter=0.0, **kw):
        """Parallel lines across a box, optionally clipped (clip='url(#..)')."""
        kw.setdefault("stroke", "#222")
        kw.setdefault("stroke_width", 1)
        a = math.radians(angle)
        ca, sa = math.cos(a), math.sin(a)
        cx, cy = x + w / 2, y + h / 2
        R = math.hypot(w, h) / 2 + spacing
        d = []
        k = -R
        while k <= R:
            j = self.rng.uniform(-jitter, jitter) if jitter else 0
            px, py = cx - sa * (k + j), cy + ca * (k + j)
            d.append(f"M{f(px - ca * R)},{f(py - sa * R)} L{f(px + ca * R)},{f(py + sa * R)}")
            k += spacing
        g = {"clip_path": clip} if clip else {}
        self.open("g", **g)
        self.path(" ".join(d), fill="none", **kw)
        self.close()

    def stipple(self, x, y, w, h, n=400, r=(0.6, 1.6), density=None, **kw):
        """Random dots; density(x, y) -> 0..1 thins them where low."""
        kw.setdefault("fill", "#222")
        d = []
        for _ in range(n):
            px, py = x + self.rng.random() * w, y + self.rng.random() * h
            if density and self.rng.random() > density(px, py):
                continue
            rr = self.rng.uniform(*r)
            d.append(f"M{f(px - rr)},{f(py)}a{f(rr)},{f(rr)} 0 1,0 {f(2 * rr)},0a{f(rr)},{f(rr)} 0 1,0 {f(-2 * rr)},0")
        if d:
            self.path("".join(d), **kw)

    def halftone(self, x, y, w, h, value, cell=12, angle=15, **kw):
        """Halftone dots; value(x, y) -> 0..1 sets the dot size."""
        kw.setdefault("fill", "#222")
        a = math.radians(angle)
        ca, sa = math.cos(a), math.sin(a)
        d = []
        cx, cy = x + w / 2, y + h / 2
        R = math.hypot(w, h) / 2
        i = -R
        while i <= R:
            j = -R
            while j <= R:
                px, py = cx + i * ca - j * sa, cy + i * sa + j * ca
                if x <= px <= x + w and y <= py <= y + h:
                    v = max(0.0, min(1.0, value(px, py)))
                    rr = v * cell * 0.62
                    if rr > 0.3:
                        d.append(f"M{f(px - rr)},{f(py)}a{f(rr)},{f(rr)} 0 1,0 {f(2 * rr)},0"
                                 f"a{f(rr)},{f(rr)} 0 1,0 {f(-2 * rr)},0")
                j += cell
            i += cell
        if d:
            self.path("".join(d), **kw)

    def grid(self, x, y, w, h, step, **kw):
        kw.setdefault("stroke", "#999")
        kw.setdefault("stroke_width", 1)
        d = []
        gx = x
        while gx <= x + w + 0.01:
            d.append(f"M{f(gx)},{f(y)}V{f(y + h)}")
            gx += step
        gy = y
        while gy <= y + h + 0.01:
            d.append(f"M{f(x)},{f(gy)}H{f(x + w)}")
            gy += step
        self.path("".join(d), fill="none", **kw)

    def pixels(self, x, y, rows: list[str], palette: dict[str, str], size=8):
        """Pixel art from strings; '.' or ' ' is transparent."""
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch in palette:
                    self.rect(x + i * size, y + j * size, size, size, fill=palette[ch])

    def facets(self, cx, cy, r, colors, n=7, irregular=0.25, **kw):
        """A low-poly crystal: a fan of flat-shaded triangles around a centre."""
        pts = []
        for i in range(n):
            a = 2 * math.pi * i / n + self.rng.uniform(-0.2, 0.2)
            rr = r * (1 + self.rng.uniform(-irregular, irregular))
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a) * 1.4))
        top = (cx + self.rng.uniform(-r * .15, r * .15), cy + self.rng.uniform(-r * .15, r * .15))
        for i in range(n):
            a, b = pts[i], pts[(i + 1) % n]
            self.poly([top, a, b], fill=colors[i % len(colors)], **kw)
        return pts

    # ---- geometry -------------------------------------------------------------------------------
    @staticmethod
    def star_pts(cx, cy, r1, r2, n=5, rot=-90):
        pts = []
        for i in range(2 * n):
            r = r1 if i % 2 == 0 else r2
            a = math.radians(rot + 180 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        return pts

    @staticmethod
    def ngon(cx, cy, r, n=6, rot=0):
        return [(cx + r * math.cos(math.radians(rot + 360 * i / n)),
                 cy + r * math.sin(math.radians(rot + 360 * i / n))) for i in range(n)]

    @staticmethod
    def hexgrid(cols, rows, r, ox=0, oy=0):
        """Centres of a pointy-top hex grid."""
        w, h = math.sqrt(3) * r, 1.5 * r
        for j in range(rows):
            for i in range(cols):
                yield i, j, ox + i * w + (w / 2 if j % 2 else 0), oy + j * h

    @staticmethod
    def iso(x, y, z, s=1.0, ox=600, oy=200):
        """Isometric projection of grid coordinates."""
        return ox + (x - y) * s * 0.866, oy + (x + y) * s * 0.5 - z * s

    def caption(self, s, x=40, y=H - 36, size=22, family="serif", **kw):
        kw.setdefault("fill", "#222")
        self.text(x, y, s, size=size, family=family, **kw)

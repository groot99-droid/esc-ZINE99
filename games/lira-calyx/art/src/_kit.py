"""The Redacted Testament of Lira Calyx: the game's palette, paper, bar and four hands.

Style bible (DEEP_DIVE.md section 4): laid paper under every layer, one iron-gall line weight for
what Lira could have drawn, pencil grey for the provisional, washes that pool at their edges, and
black bars with fibrous ends (a surgical bar is ruled, with blue under the black; a clumsy one is
brushed).
"""
import math

from artkit import Art, f

G = "lira-calyx"
PAPER, INK, SEAL, CYAN, VIOLET, OCHRE, ARCH, BAR = ("#f1e8d2", "#3b2618", "#b3212b", "#3fc4d0", "#5a3f7a",
                                                    "#c8913a", "#3c5a8c", "#141414")
PENCIL, RUST, BONE, MOSS, SLATE, ICE, TEAL, COLD = ("#7d7a74", "#9c4a25", "#e7dcc3", "#3f5a2c", "#56606a",
                                                    "#b9d8ea", "#25c2a8", "#f2f4f5")
PHOS, BENCH, LINEW = "#7dff9a", "#1d2221", 2.6


def pat(a: Art, bg, inner, size=16):
    pid = a.uid("pat")
    rect = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ""
    a.defn(f'<pattern id="{pid}" width="{size}" height="{size}" patternUnits="userSpaceOnUse">{rect}{inner}</pattern>')
    return f"url(#{pid})"


def page(a: Art, color=PAPER, grain=0.11, pool=0.16, x=0, y=0, w=None, h=None):
    """Warm laid paper: grain, laid lines and chain lines, a wash pooled toward the edges."""
    w, h = a.w if w is None else w, a.h if h is None else h
    if (x, y, w, h) == (0, 0, a.w, a.h):
        a.paper(color, grain=grain)
    else:
        a.rect(x, y, w, h, fill=color)
    laid = pat(a, None, f'<path d="M0,2.5H46M0,7.5H46M0,12.5H46M0,17.5H46" stroke="{INK}" stroke-width="0.5" '
                        f'opacity="0.07"/><path d="M23,0V20" stroke="{INK}" stroke-width="0.8" opacity="0.06"/>', 46)
    a.defs[-1] = a.defs[-1].replace('height="46"', 'height="20"')
    a.rect(x, y, w, h, fill=laid)
    if pool and (x, y, w, h) == (0, 0, a.w, a.h):
        a.vignette(pool, "#7a5a2e")


def ink(a: Art, pts, w=LINEW, amp=1.0, step=16, closed=False, **kw):
    kw.setdefault("stroke", INK)
    kw.setdefault("stroke_linecap", "round")
    kw.setdefault("stroke_linejoin", "round")
    a.wobble(pts, amp=amp, step=step, closed=closed, stroke_width=w, **kw)

def curve(a: Art, pts, w=LINEW, closed=False, **kw):
    kw.setdefault("stroke", INK)
    kw.setdefault("fill", "none")
    kw.setdefault("stroke_linecap", "round")
    kw.setdefault("stroke_linejoin", "round")
    a.path(a.smooth_d(pts, closed=closed), stroke_width=w, **kw)


def wash(a: Art, d, color, op=0.3, edge=3.0, **kw):
    """A thin watercolour wash: pale inside, darker where it pooled at the edge."""
    if not isinstance(d, str):
        d = a.smooth_d(d, closed=True)
    a.path(d, fill=color, fill_opacity=op, stroke=color, stroke_opacity=min(1, op * 1.7), stroke_width=edge,
           stroke_linejoin="round", **kw)


def _rough(a: Art, scale, freq):
    key = f"_r{scale}_{freq}"
    if not hasattr(a, key):
        setattr(a, key, a.roughen(scale, freq))
    return getattr(a, key)


def bar(a: Art, x, y, w, h, kind="surgical", rot=0.0, fibres=True, blue=True):
    """A redaction bar. surgical: ruled, blue under the black, fibrous ends. clumsy: brushed."""
    r = a.rng
    if rot:
        a.open("g", transform=f"rotate({f(rot)} {f(x)} {f(y + h / 2)})")
    if kind == "surgical":
        if blue:
            a.path(f"M{f(x - 9)},{f(y - 0.6)}H{f(x + w + 9)}M{f(x - 7)},{f(y + h + 0.6)}H{f(x + w + 8)}",
                   stroke=ARCH, stroke_width=1.1, fill="none", opacity=0.9)
            a.rect(x - 1, y - 1, w + 2, h + 2, fill=ARCH, opacity=0.55)
        a.rect(x, y, w, h, fill=BAR, filter=_rough(a, 1.6, 0.5) if h >= 16 else None)
        if fibres:
            d = []
            for ex, sg in ((x, -1), (x + w, 1)):
                for _ in range(max(6, int(h * 0.9))):
                    yy = y + r.uniform(0.5, h - 0.5)
                    L = r.uniform(1.5, 3 + h * 0.28) * (r.random() ** 1.5 + 0.2)
                    d.append(f"M{f(ex - sg)},{f(yy)}l{f(sg * L)},{f(r.uniform(-0.8, 0.8))}")
            a.path("".join(d), stroke=BAR, stroke_width=0.9, fill="none", stroke_linecap="round")
    else:
        n = max(3, int(w / 26))
        pts = [(x + w * i / n, y + h / 2 + r.uniform(-h * 0.16, h * 0.16)) for i in range(n + 1)]
        fid = a.uid("brush")
        a.defn(f'<filter id="{fid}" filterUnits="userSpaceOnUse" x="{f(x - h)}" y="{f(y - h)}" width="{f(w + 2 * h)}" '
               f'height="{f(3 * h)}"><feTurbulence type="turbulence" baseFrequency="0.02 0.3" numOctaves="2" '
               f'seed="{r.randint(1, 999)}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" '
               f'scale="{f(max(5.0, h * 0.4))}"/></filter>')
        a.path(a.smooth_d(pts), fill="none", stroke=BAR, stroke_width=h * r.uniform(0.9, 1.05), filter=f"url(#{fid})")
        d = []
        for _ in range(max(5, int(h * 0.5))):
            yy = y + r.uniform(0, h)
            x0 = x + w + r.uniform(-w * 0.2, 0)
            d.append(f"M{f(x0)},{f(yy)}l{f(r.uniform(w * 0.1, w * 0.3 + 10))},{f(r.uniform(-2, 2))}")
            x1 = x - r.uniform(2, 12)
            d.append(f"M{f(x1)},{f(yy)}l{f(r.uniform(4, 16))},{f(r.uniform(-1, 1))}")
        a.path("".join(d), stroke=BAR, stroke_width=1.2, fill="none", stroke_linecap="round", opacity=0.75)
    if rot:
        a.close()


def blot(a: Art, x, y, r0, color=INK, op=0.85):
    r = a.rng
    pts = [(x + r0 * (1 + r.uniform(-0.3, 0.35)) * math.cos(t), y + r0 * (1 + r.uniform(-0.3, 0.35)) * math.sin(t))
           for t in [i * math.pi / 5 for i in range(10)]]
    a.path(a.smooth_d(pts, closed=True), fill=color, opacity=op)
    for _ in range(3):
        t, d = r.uniform(0, 6.28), r0 * r.uniform(1.6, 2.6)
        a.circle(x + d * math.cos(t), y + d * math.sin(t), r0 * r.uniform(0.08, 0.2), fill=color, opacity=op)


# ---- the hands --------------------------------------------------------------------------------
# Type hands (generic families): Lira's ink, the Continuum's flat black, the small hand, his pencil.
def lira(a: Art, x, y, s, size=24, color=INK, **kw):
    kw.setdefault("transform", f"rotate({f(a.rng.uniform(-1.2, 0.4))} {f(x)} {f(y)})")
    a.text(x, y, s, size=size, family="serif", font_style="italic", fill=color, **kw)


def continuum(a: Art, x, y, s, size=18, color=BAR, **kw):
    a.text(x, y, s, size=size, family="monospace", fill=color, **kw)


def small_hand(a: Art, x, y, s, size=17, color=ARCH, **kw):
    """The archivist: small, slanted left, corrections only."""
    a.text(0, 0, s, size=size, family="serif", font_style="italic", fill=color,
           transform=f"translate({f(x)} {f(y)}) skewX(24) rotate(-1.5)", **kw)


def his_pencil(a: Art, x, y, s, size=20, **kw):
    a.text(x, y, s, size=size, family="serif", fill="#63605b", letter_spacing="0.4", **kw)


# The stroke hand: capitals and figures drawn stroke by stroke on a 4 x 6 grid (y down).
_O = [(1, 0), (3, 0), (4, 1), (4, 5), (3, 6), (1, 6), (0, 5), (0, 1), (1, 0)]
_P = [(0, 6), (0, 0), (3, 0), (4, 1), (4, 2.2), (3, 3.2), (0, 3.2)]
GLYPHS = {
    "A": [[(0, 6), (2, 0), (4, 6)], [(1, 4), (3, 4)]],
    "B": [[(0, 6), (0, 0), (3, 0), (4, 1), (4, 2), (3, 3), (0, 3)], [(3, 3), (4, 4), (4, 5), (3, 6), (0, 6)]],
    "C": [[(4, 1), (3, 0), (1, 0), (0, 1), (0, 5), (1, 6), (3, 6), (4, 5)]],
    "D": [[(0, 0), (0, 6), (2.5, 6), (4, 4.5), (4, 1.5), (2.5, 0), (0, 0)]],
    "E": [[(4, 0), (0, 0), (0, 6), (4, 6)], [(0, 3), (3, 3)]],
    "F": [[(4, 0), (0, 0), (0, 6)], [(0, 3), (3, 3)]],
    "G": [[(4, 1), (3, 0), (1, 0), (0, 1), (0, 5), (1, 6), (3, 6), (4, 5), (4, 3), (2.2, 3)]],
    "H": [[(0, 0), (0, 6)], [(4, 0), (4, 6)], [(0, 3), (4, 3)]],
    "I": [[(2, 0), (2, 6)], [(1, 0), (3, 0)], [(1, 6), (3, 6)]],
    "J": [[(3.5, 0), (3.5, 5), (2.5, 6), (1, 6), (0, 5)]],
    "K": [[(0, 0), (0, 6)], [(4, 0), (0, 3.4)], [(1.3, 2.6), (4, 6)]],
    "L": [[(0, 0), (0, 6), (4, 6)]],
    "M": [[(0, 6), (0, 0), (2, 3.5), (4, 0), (4, 6)]],
    "N": [[(0, 6), (0, 0), (4, 6), (4, 0)]],
    "O": [_O],
    "P": [_P],
    "Q": [_O, [(2.5, 4.5), (4.2, 6.3)]],
    "R": [_P, [(2, 3.2), (4, 6)]],
    "S": [[(4, 1), (3, 0), (1, 0), (0, 1), (0, 2.2), (1, 3), (3, 3), (4, 3.8), (4, 5), (3, 6), (1, 6), (0, 5)]],
    "T": [[(0, 0), (4, 0)], [(2, 0), (2, 6)]],
    "U": [[(0, 0), (0, 5), (1, 6), (3, 6), (4, 5), (4, 0)]],
    "V": [[(0, 0), (2, 6), (4, 0)]],
    "W": [[(0, 0), (1, 6), (2, 2.5), (3, 6), (4, 0)]],
    "X": [[(0, 0), (4, 6)], [(4, 0), (0, 6)]],
    "Y": [[(0, 0), (2, 3), (4, 0)], [(2, 3), (2, 6)]],
    "Z": [[(0, 0), (4, 0), (0, 6), (4, 6)]],
    "0": [[(1.2, 0), (2.8, 0), (3.8, 1.2), (3.8, 4.8), (2.8, 6), (1.2, 6), (0.2, 4.8), (0.2, 1.2), (1.2, 0)]],
    "1": [[(1, 1.3), (2.3, 0), (2.3, 6)]],
    "2": [[(0, 1.2), (1, 0), (3, 0), (4, 1), (4, 2.2), (0, 6), (4, 6)]],
    "3": [[(0, 0.8), (1, 0), (3, 0), (4, 1), (4, 2.2), (3, 3), (1.5, 3)], [(3, 3), (4, 3.8), (4, 5), (3, 6), (1, 6), (0, 5.2)]],
    "4": [[(3, 6), (3, 0), (0, 4), (4, 4)]],
    "5": [[(4, 0), (0.5, 0), (0.2, 2.6), (3, 2.6), (4, 3.6), (4, 5), (3, 6), (1, 6), (0, 5.2)]],
    "6": [[(3.6, 0.4), (2, 0), (0.8, 1.2), (0, 3), (0, 5), (1, 6), (3, 6), (4, 5), (4, 3.8), (3, 2.9), (1, 2.9), (0, 3.8)]],
    "7": [[(0, 0), (4, 0), (1.5, 6)]],
    "8": [[(1, 3), (0, 2), (0, 1), (1, 0), (3, 0), (4, 1), (4, 2), (3, 3), (1, 3), (0, 4), (0, 5), (1, 6), (3, 6), (4, 5), (4, 4), (3, 3)]],
    "9": [[(4, 2.2), (3, 3.1), (1, 3.1), (0, 2.2), (0, 1), (1, 0), (3, 0), (4, 1), (4, 3), (3.2, 4.8), (2, 6), (0.6, 5.8)]],
    ".": [[(1.6, 5.5), (2.1, 6), (1.7, 6.1)]],
    ",": [[(2, 5.5), (2, 6.2), (1.4, 7)]],
    ":": [[(1.8, 2.2), (2.1, 2.5)], [(1.8, 5.6), (2.1, 6)]],
    "-": [[(0.8, 3.3), (3.2, 3.3)]],
    "'": [[(2, 0), (1.8, 1.4)]],
    "/": [[(3.6, 0), (0.4, 6)]],
    "?": [[(0.4, 1.2), (1.2, 0), (2.8, 0), (3.6, 1), (3.6, 2), (2, 3.2), (2, 4.4)], [(1.9, 5.7), (2.1, 6)]],
    "=": [[(0.6, 2.4), (3.4, 2.4)], [(0.6, 4), (3.4, 4)]],
    "+": [[(0.6, 3.2), (3.4, 3.2)], [(2, 1.8), (2, 4.6)]],
    "Δ": [[(0, 6), (2, 0.4), (4, 6), (0, 6)]],
    "°": [[(1.4, 0), (2.4, 0), (2.9, 0.8), (2.4, 1.6), (1.4, 1.6), (0.9, 0.8), (1.4, 0)]],
}


def stroke_d(a: Art, s, x, y, h, slant=0.0, jit=0.0, smooth=False, cross7=False, aspect=0.8, gap=1.7):
    """Path data for s written in the stroke hand, baseline at y, cap height h. Returns (d, end x)."""
    r, u, d = a.rng, h / 6, []
    for ch in s:
        if ch == " ":
            x += 3.2 * u * aspect
            continue
        strokes = GLYPHS.get(ch)
        if strokes is None:
            continue
        if ch == "7" and cross7:
            strokes = strokes + [[(1.2, 3.1), (3.9, 2.9)]]
        ox, oy = (r.uniform(-jit, jit) * u, r.uniform(-jit, jit) * u * 1.4) if jit else (0, 0)
        tilt = r.uniform(-jit, jit) * 0.12 if jit else 0
        sc = 1 + (r.uniform(-jit, jit) * 0.16 if jit else 0)
        narrow = 0.45 if ch in ".,:'" else (0.7 if ch in "1I" else 1)
        for st in strokes:
            pts = []
            for gx, gy in st:
                if jit:
                    gx, gy = gx + r.uniform(-jit, jit) * 0.28, gy + r.uniform(-jit, jit) * 0.28
                up = (6 - gy) * sc
                pts.append((x + ox + (gx * aspect * narrow * sc + (slant + tilt) * up) * u, y + oy - up * u))
            d.append(a.smooth_d(pts) if smooth and len(pts) > 2 else "M" + " L".join(f"{f(px)},{f(py)}" for px, py in pts))
        x += (4 * aspect * narrow + gap) * u
    return " ".join(d), x


def stroke_text(a: Art, s, x, y, h, color=INK, w=None, **kw):
    hand = {k: kw.pop(k) for k in ("slant", "jit", "smooth", "cross7", "aspect", "gap") if k in kw}
    d, x1 = stroke_d(a, s, x, y, h, **hand)
    a.path(d, fill="none", stroke=color, stroke_width=h * 0.11 if w is None else w, stroke_linecap="round",
           stroke_linejoin="round", **kw)
    return x1


def pell(a: Art, s, x, y, h=26, color="#4c4a48", **kw):
    """Pell's capitals: a child's pencil, every letter its own size."""
    kw.setdefault("jit", 0.6)
    kw.setdefault("gap", 2.4)
    return stroke_text(a, s.upper(), x, y, h, color=color, w=max(1.8, h * 0.1), opacity=0.9, **kw)


def lira_fig(a: Art, s, x, y, h=26, color=INK, **kw):
    """Lira's figures: slanted right, rounded, the seven crossed."""
    return stroke_text(a, s, x, y, h, color=color, slant=0.22, smooth=True, cross7=True, jit=0.18, aspect=0.72, **kw)


def staff(a: Art, x, y, w, sp, color="#a8281e", sw=2.0):
    for k in range(4):
        a.line(x, y + k * sp, x + w, y + k * sp, stroke=color, stroke_width=sw)


def label(a: Art, x, y, s, size=13, color=INK, **kw):
    a.text(x, y, s, size=size, family="monospace", fill=color, letter_spacing="1", **kw)

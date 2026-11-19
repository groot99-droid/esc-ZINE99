"""Dr. Tox: Fall: palette and shared drawing helpers for the code-drawn art.

The palette is the bible's colour grammar (Part VI, Dr. Tox section 6; DESIGN.md section 15): amber is
contained, green is loose, gray-teal is the world, near-black red is his blood, clinical white is memory;
Fall adds spore rust and ochre (Rostova), the painted sky (Cally) and the shroud's desaturated green.
Amber and green never share a frame at equal weight. Each 2D mode and 1D game draws in its own graphic
style (docs/graphic_styles.json); the helpers here are shapes and lettering only, and each mode file
keeps its own look. Characters are silhouettes, hands, gear and signs: never faces, never gore.
"""
import math

from artkit import f

G = "dr-tox-fall"
TEAL, TEAL2, TEAL3 = "#5E7375", "#8A9A99", "#C4CDCB"
AMBER, GOLD = "#D99A2B", "#F2C14E"
GREEN = "#7FD957"
BLOOD, BLOOD2 = "#1A0B0C", "#4A0F14"
WHITE = "#E9ECEA"
RUST, OCHRE = "#9C4A2A", "#C98F3B"
SKY = "#7FA9D6"
SHROUD = "#5F6F5A"
INK = "#141414"
CONCRETE, NIGHT = "#2b3536", "#0d1112"

# (name, chapter id, lead, caption)
CHAPTERS = (("The Knock", "c1_knock", "tox", "2228. DR. TOX."),
            ("Relief", "c2_relief", "tox", "2229. DR. TOX."),
            ("Containment", "c3_containment", "reese", "2229. REESE."),
            ("The Gauntlet", "c4_gauntlet", "tox", "2230. DR. TOX."),
            ("Under the Freeway", "c5_freeway", "tox", "2231. DR. TOX."),
            ("Seventy-Two Hours", "c6_calibration", "cally", "2232. CALLY."),
            ("The Hero Comes Down", "c7_hero", "reese", "2233. REESE."),
            ("Bloom", "c8_bloom", "tox", "2234. DR. TOX."),
            ("Resin", "c9_resin", "tox", "2235. DR. TOX."),
            ("The Gala", "c10_gala", "cally", "2236. CALLY."),
            ("Clean Air", "c11_clean_air", "tox", "2236. DR. TOX. THEN REESE."))
ROMAN = ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI")


def row(mode, what):
    """The art.json `row`: the web module that owns the asset, then what it answers."""
    return f"{mode} | {what}"


def P(pts, closed=False):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + ("Z" if closed else "")


def label(a, x, y, s, size=24, family="sans-serif", fill=INK, anchor="start", fit=None, **kw):
    """Vector lettering with a generic family. fit=width squeezes the line to that width exactly."""
    if fit:
        kw["textLength"] = f(fit)
        kw["lengthAdjust"] = "spacingAndGlyphs"
    a.text(x, y, s, size=size, family=family, fill=fill, text_anchor=anchor, **kw)


def fitw(s, size, width, k=0.6):
    """The fit width to pass to label() when s would run past width at this size, else None."""
    return width if len(s) * size * k > width else None


def wrap(s, n):
    """Split s into lines of at most n characters, on spaces."""
    out, cur = [], ""
    for w in s.split():
        if cur and len(cur) + 1 + len(w) > n:
            out.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        out.append(cur)
    return out


def person_d(x, y, s=1.0, lean=0.0, hunch=0.0, broad=1.0):
    """A plain standing person, feet at (x, y), 120 units tall at s=1: head, shoulders, coat."""
    h = 120 * s
    b = broad
    pts = [(x - 9 * s + lean, y - h), (x + 9 * s + lean, y - h), (x + 11 * s + lean, y - h + 20 * s),
           (x + 6 * s + lean, y - h + 28 * s), (x + 24 * s * b + lean * 0.6 + hunch, y - h + 40 * s),
           (x + 22 * s * b, y - 40 * s), (x + 14 * s, y), (x + 3 * s, y), (x, y - 36 * s), (x - 3 * s, y),
           (x - 14 * s, y), (x - 22 * s * b, y - 40 * s), (x - 24 * s * b + lean * 0.6 + hunch, y - h + 40 * s),
           (x - 6 * s + lean, y - h + 28 * s), (x - 11 * s + lean, y - h + 20 * s)]
    return P(pts, True)


def person_pts(x, y, s=1.0, lean=0.0, hunch=0.0, broad=1.0):
    """The same outline as person_d, as points (for lumpy or wobbly redrawing)."""
    h = 120 * s
    b = broad
    return [(x - 9 * s + lean, y - h), (x, y - h - 4 * s), (x + 9 * s + lean, y - h), (x + 11 * s + lean, y - h + 20 * s),
            (x + 6 * s + lean, y - h + 28 * s), (x + 24 * s * b + lean * 0.6 + hunch, y - h + 40 * s),
            (x + 22 * s * b, y - 40 * s), (x + 14 * s, y), (x + 3 * s, y), (x, y - 36 * s), (x - 3 * s, y),
            (x - 14 * s, y), (x - 22 * s * b, y - 40 * s), (x - 24 * s * b + lean * 0.6 + hunch, y - h + 40 * s),
            (x - 6 * s + lean, y - h + 28 * s), (x - 11 * s + lean, y - h + 20 * s)]


def tox_d(x, y, s=1.0, closed=True, lean=0.0):
    """Dr. Tox in the shroud (Part VI section 8: narrow, vertical, contained), hood up, feet at (x, y),
    160 units tall at s=1. Closed: the shroud wrapped to the hem. Open: it hangs from the shoulders and
    the narrow figure shows down the front."""
    h = 160 * s
    if closed:
        pts = [(x - 10 * s + lean, y - h), (x + 10 * s + lean, y - h), (x + 16 * s + lean, y - h + 26 * s),
               (x + 20 * s + lean * .6, y - h + 44 * s), (x + 26 * s, y - 10 * s), (x + 30 * s, y), (x - 30 * s, y),
               (x - 26 * s, y - 10 * s), (x - 20 * s + lean * .6, y - h + 44 * s), (x - 16 * s + lean, y - h + 26 * s)]
    else:
        pts = [(x - 10 * s + lean, y - h), (x + 10 * s + lean, y - h), (x + 16 * s + lean, y - h + 26 * s),
               (x + 22 * s + lean * .6, y - h + 44 * s), (x + 34 * s, y - 4 * s), (x + 12 * s, y - 2 * s),
               (x + 8 * s, y - h + 60 * s), (x - 8 * s, y - h + 60 * s), (x - 12 * s, y - 2 * s), (x - 34 * s, y - 4 * s),
               (x - 22 * s + lean * .6, y - h + 44 * s), (x - 16 * s + lean, y - h + 26 * s)]
    return P(pts, True)


def tox_legs_d(x, y, s=1.0):
    """The narrow figure under an open shroud: two lean legs and a straight torso."""
    h = 160 * s
    return P([(x - 8 * s, y - h + 58 * s), (x + 8 * s, y - h + 58 * s), (x + 7 * s, y), (x + 1.5 * s, y),
              (x, y - 50 * s), (x - 1.5 * s, y), (x - 7 * s, y)], True)


def ecg_d(x, y, w, h, beats=6, spike=1.0):
    """The Pulse meter as a monitor line: flat, with sharp spikes."""
    pts = [(x, y)]
    step = w / beats
    for i in range(beats):
        bx = x + i * step
        pts += [(bx + step * .45, y), (bx + step * .5, y - h * spike), (bx + step * .56, y + h * .4 * spike),
                (bx + step * .62, y), (bx + step, y)]
    return P(pts)


def vial_d(cx, cy, w, h):
    """An upright vial: body and a neck, centred at (cx, cy)."""
    x0, y0 = cx - w / 2, cy - h / 2
    nk = w * .55
    return (f"M{f(x0)},{f(y0 + h * .18)} L{f(x0 + (w - nk) / 2)},{f(y0 + h * .1)} L{f(x0 + (w - nk) / 2)},{f(y0)} "
            f"L{f(x0 + (w + nk) / 2)},{f(y0)} L{f(x0 + (w + nk) / 2)},{f(y0 + h * .1)} L{f(x0 + w)},{f(y0 + h * .18)} "
            f"L{f(x0 + w)},{f(y0 + h - w * .3)} Q{f(x0 + w)},{f(y0 + h)} {f(cx)},{f(y0 + h)} "
            f"Q{f(x0)},{f(y0 + h)} {f(x0)},{f(y0 + h - w * .3)}Z")


def heart_d(cx, cy, s):
    return (f"M{f(cx)},{f(cy + s * 0.9)} C{f(cx - s * 1.4)},{f(cy - s * 0.1)} {f(cx - s * 0.7)},{f(cy - s * 1.1)} "
            f"{f(cx)},{f(cy - s * 0.4)} C{f(cx + s * 0.7)},{f(cy - s * 1.1)} {f(cx + s * 1.4)},{f(cy - s * 0.1)} "
            f"{f(cx)},{f(cy + s * 0.9)}Z")


def star_d(cx, cy, r1, r2, n=12, rot=-90):
    pts = []
    for i in range(2 * n):
        r = r1 if i % 2 == 0 else r2
        t = math.radians(rot + 180 * i / n)
        pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return P(pts, True)


def plate(a, x, y, w, h, text, fill="#9aa5a4", ink=INK, size=None, family="sans-serif", sw=3, rivets=True):
    """An RCC plate: the Terminology Rule's physical signage. Stamped letters on a riveted plate."""
    a.rect(x, y, w, h, rx=h * .08, fill=fill, stroke=ink, stroke_width=sw)
    a.rect(x + h * .12, y + h * .12, w - h * .24, h * .76, rx=h * .05, fill="none", stroke=ink, stroke_width=sw * .5)
    if rivets:
        for rx_, ry_ in ((x + h * .06, y + h * .06), (x + w - h * .06, y + h * .06), (x + h * .06, y + h * .94),
                         (x + w - h * .06, y + h * .94)):
            a.circle(rx_, ry_, h * .035, fill=ink)
    sz = size or h * .42
    label(a, x + w / 2, y + h * .5 + sz * .36, text, size=sz, family=family, fill=ink,
          anchor="middle", font_weight="bold", letter_spacing=f(sz * .12))


def blades(a, cx, cy, s=1.0, color="#2a2d2e", line=INK, sw=3):
    """Two leaf-bladed throwing knives (Part VI section 11), hollow centre channel, laid side by side."""
    for k, dx in enumerate((-22, 22)):
        x = cx + dx * s
        a.open("g", transform=f"translate({f(x)},{f(cy)}) rotate({-8 if k == 0 else 6}) scale({f(s)})")
        a.path("M0,-110 C16,-80 18,-30 8,10 L-8,10 C-18,-30 -16,-80 0,-110Z", fill=color, stroke=line, stroke_width=sw)
        a.line(0, -86, 0, 0, stroke=BLOOD2, stroke_width=3)
        a.rect(-10, 10, 20, 8, fill=color, stroke=line, stroke_width=sw)
        a.rect(-5, 18, 10, 42, rx=3, fill="#1b1d1e", stroke=line, stroke_width=sw)
        a.circle(0, 66, 6, fill="none", stroke=line, stroke_width=sw)
        a.close()

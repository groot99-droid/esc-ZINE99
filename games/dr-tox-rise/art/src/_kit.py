"""Dr. Tox: Rise: palette and shared drawing helpers for the code-drawn art.

The palette is the bible's colour grammar (Part VI, Dr. Tox section 6; DESIGN.md section 15): amber is
contained, green is loose, gray-teal is the world, near-black red is his blood, clinical white is memory.
Amber and green never share a frame at equal weight. Each 2D mode and 1D game draws in its own graphic
style (docs/graphic_styles.json); the helpers here are style-neutral (shapes, text), and each mode file
keeps its own look. Characters are silhouettes, hands, gear and signs: never faces.
"""
import math

from artkit import f

G = "dr-tox-rise"
TEAL, TEAL2, TEAL3 = "#5E7375", "#8A9A99", "#C4CDCB"
AMBER, GOLD = "#D99A2B", "#F2C14E"
GREEN = "#7FD957"
BLOOD, BLOOD2 = "#1A0B0C", "#4A0F14"
WHITE = "#E9ECEA"
SKY, FIELD = "#7FA9D6", "#7FA65C"
INK = "#111111"
CONCRETE, NIGHT = "#2b3536", "#0d1112"
RED = "#5a1416"                     # dim red emergency light (Aftermath, the Green ending)

CHAPTERS = (("The First Dose", "c1_first_dose", "alexander", "2217"),
            ("Sky Room", "c2_sky_room", "reese", "TRIAL 53. AGE FOUR."),
            ("Subject CMXCIX", "c3_river", "alexander", "2207. 2226."),
            ("Trial 53", "c4_trial53", "reese", "TRIAL 53. AGE TWELVE."),
            ("The Forging", "c5_forging", "alexander", "2226"),
            ("Aegis, Mantled", "c6_mantled", "reese", "2226"),
            ("The Hunt", "c7_hunt", "alexander", "2227"),
            ("Containment Action", "c8_containment", "reese", "2226. THE LOWER RING."),
            ("Two Years and One Week", "c9_snakehead", "alexander", "TWO YEARS AND ONE WEEK LATER."),
            ("The Observers", "c10_observers", "alexander", "2228. THE SAME NIGHT."),
            ("Snakehead", "c11_claim", "alexander", "2228. MONTHS LATER."))
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


def figure_d(x, y, s=1.0, lean=0.0, stride=0.0):
    """Alexander's silhouette rule (Part VI section 8): narrow, vertical, contained, long neck, lean
    shoulders. Feet at (x, y); 150 units tall at s=1."""
    h = 150 * s
    sh = 16 * s
    pts = [(x - 5 * s + lean, y - h), (x + 5 * s + lean, y - h), (x + 6 * s + lean, y - h + 18 * s),
           (x + 3 * s + lean, y - h + 26 * s), (x + sh + lean * .8, y - h + 34 * s),
           (x + sh - 2 * s + lean * .5, y - h + 92 * s), (x + 9 * s + lean * .4, y - h + 90 * s),
           (x + 9 * s + stride, y), (x + 2 * s + stride, y), (x, y - 62 * s), (x - 2 * s - stride, y),
           (x - 9 * s - stride, y), (x - 9 * s + lean * .4, y - h + 90 * s),
           (x - sh + 2 * s + lean * .5, y - h + 92 * s), (x - sh + lean * .8, y - h + 34 * s),
           (x - 3 * s + lean, y - h + 26 * s), (x - 6 * s + lean, y - h + 18 * s)]
    return P(pts, True)


def person_d(x, y, s=1.0, broad=1.0, lean=0.0):
    """A generic person (guards, staff, bystanders): rounder head, broader shoulders. Feet at (x, y)."""
    h = 150 * s
    b = broad
    head = f"M{f(x + lean)},{f(y - h)} a{f(11 * s)},{f(12 * s)} 0 1,0 0.1,0Z"
    body = P([(x - 22 * s * b + lean, y - h + 30 * s), (x + 22 * s * b + lean, y - h + 30 * s),
              (x + 20 * s * b + lean * .6, y - h + 92 * s), (x + 12 * s, y), (x + 3 * s, y), (x, y - 60 * s),
              (x - 3 * s, y), (x - 12 * s, y), (x - 20 * s * b + lean * .6, y - h + 92 * s)], True)
    neck = P([(x - 6 * s + lean, y - h + 20 * s), (x + 6 * s + lean, y - h + 20 * s),
              (x + 7 * s + lean, y - h + 32 * s), (x - 7 * s + lean, y - h + 32 * s)], True)
    return head + " " + neck + " " + body


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


def syringe(a, x, y, L, rot=0, body="#3a3f40", line=INK, sw=3, fill=AMBER):
    """The lead-shielded syringe, side-on: a heavy shield over the barrel, a window showing the dose."""
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(rot)})")
    t = L / 10
    a.rect(0, -t * .9, L * .62, t * 1.8, rx=t * .3, fill=body, stroke=line, stroke_width=sw)
    a.rect(L * .14, -t * .35, L * .3, t * .7, fill=fill, stroke=line, stroke_width=sw * .6)
    a.rect(-L * .2, -t * .25, L * .2, t * .5, fill=body, stroke=line, stroke_width=sw)
    a.rect(-L * .24, -t * .7, L * .05, t * 1.4, fill=body, stroke=line, stroke_width=sw)
    a.rect(L * .62, -t * .45, L * .08, t * .9, fill=body, stroke=line, stroke_width=sw)
    a.line(L * .7, 0, L, 0, stroke=line, stroke_width=sw * .8, stroke_linecap="round")
    a.close()


def chalk_filter(a, scale=2.2):
    """A displacement filter for chalk and brush edges (a roughened outline)."""
    return a.roughen(scale=scale, freq=0.09)


def tent_d(cx, by, s=1.0):
    """An evidence tent seen a little from the front: an A-frame card. Base centre at (cx, by)."""
    return P([(cx - 34 * s, by), (cx - 24 * s, by - 52 * s), (cx + 24 * s, by - 52 * s), (cx + 34 * s, by)], True)


def plate(a, x, y, w, h, text, fill="#9aa5a4", ink=INK, size=None, family="sans-serif", sw=3, rivets=True):
    """An RCC plate: the Terminology Rule's physical signage. Stamped letters on a riveted plate."""
    a.rect(x, y, w, h, rx=h * .08, fill=fill, stroke=ink, stroke_width=sw)
    a.rect(x + h * .12, y + h * .12, w - h * .24, h * .76, rx=h * .05, fill="none", stroke=ink, stroke_width=sw * .5)
    if rivets:
        for rx_, ry_ in ((x + h * .06, y + h * .06), (x + w - h * .06, y + h * .06), (x + h * .06, y + h * .94),
                         (x + w - h * .06, y + h * .94)):
            a.circle(rx_, ry_, h * .035, fill=ink)
    label(a, x + w / 2, y + h * .5 + (size or h * .42) * .36, text, size=size or h * .42, family=family, fill=ink,
          anchor="middle", font_weight="bold", letter_spacing=f((size or h * .42) * .12))


def arc_pts(cx, cy, r, a0, a1, n=24):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n)))
            for i in range(n + 1)]

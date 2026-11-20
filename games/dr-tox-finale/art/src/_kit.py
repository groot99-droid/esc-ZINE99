"""Dr. Tox: Finale: palette and shared drawing helpers for the code-drawn art.

The palette is the bible's colour grammar (Part VI, Dr. Tox section 6; DESIGN.md section 15): amber is
contained, green is loose, gray-teal is the world, near-black red is his blood, clinical white is memory;
Fall's spore rust and ochre (Rostova), painted sky (Cally) and shroud green carry over, and the Finale adds
photocopy black (the cult's paper) and hard-light pale gold (Aegis's panes). Amber and green never share a
frame at equal weight. Each 2D mode and 1D game draws in its own graphic style (docs/graphic_styles.json);
the helpers here are shapes and lettering only, and each mode file keeps its own look. Characters are
silhouettes, hands, gear and signs: never faces, never gore, never a child in peril.
"""
import math

from artkit import f

G = "dr-tox-finale"
TEAL, TEAL2, TEAL3 = "#5E7375", "#8A9A99", "#C4CDCB"
AMBER, GOLD = "#D99A2B", "#F2C14E"
GREEN = "#7FD957"
BLOOD, BLOOD2 = "#1A0B0C", "#4A0F14"
WHITE = "#E9ECEA"
RUST, OCHRE = "#9C4A2A", "#C98F3B"
SKY = "#7FA9D6"
SHROUD = "#5F6F5A"
COPY, COPYPAPER = "#1C1C1A", "#E8E4DA"
HARDLIGHT = "#F6E7B8"
INK = "#141414"
CONCRETE, NIGHT = "#2b3536", "#0d1112"
NPB = "#8EC5E8"          # non-photo blue (the airway's pencil)
PULP_RED = "#C8202A"     # the one red ink the pulp, the tract and the zine's tape share as a printed colour

# (name, chapter id, lead, caption)
CHAPTERS = (("Overrun", "c1_overrun", "tox", "2236. DR. TOX."),
            ("The Station", "c2_station", "tox", "2236. DR. TOX."),
            ("The Bench", "c3_bench", "tox", "2237. DR. TOX."),
            ("The Last City", "c4_last_city", "tox", "2238. DR. TOX."),
            ("Procession", "c5_procession", "tox", "2239. DR. TOX."),
            ("The Perimeter", "c6_perimeter", "tox", "2240. DR. TOX. THEN REESE."),
            ("The Airway", "c7_airway", "tox", "2240. DR. TOX."),
            ("The Clinical Suite", "c8_suite", "tox", "2240. DR. TOX."),
            ("The Light Bringer", "c9_light", "reese", "2240. REESE."),
            ("The Reset", "c10_reset", "core", "2240."))
ROMAN = ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X")


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


def person_pts(x, y, s=1.0, lean=0.0, hunch=0.0, broad=1.0):
    """A plain standing adult, feet at (x, y), 120 units tall at s=1: head, shoulders, coat, as points."""
    h = 120 * s
    b = broad
    return [(x - 9 * s + lean, y - h), (x, y - h - 4 * s), (x + 9 * s + lean, y - h), (x + 11 * s + lean, y - h + 20 * s),
            (x + 6 * s + lean, y - h + 28 * s), (x + 24 * s * b + lean * 0.6 + hunch, y - h + 40 * s),
            (x + 22 * s * b, y - 40 * s), (x + 14 * s, y), (x + 3 * s, y), (x, y - 36 * s), (x - 3 * s, y),
            (x - 14 * s, y), (x - 22 * s * b, y - 40 * s), (x - 24 * s * b + lean * 0.6 + hunch, y - h + 40 * s),
            (x - 6 * s + lean, y - h + 28 * s), (x - 11 * s + lean, y - h + 20 * s)]


def person_d(x, y, s=1.0, lean=0.0, hunch=0.0, broad=1.0):
    return P(person_pts(x, y, s, lean, hunch, broad), True)


def sitting_d(x, y, s=1.0):
    """An adult sitting on the ground, knees up, seen side-on; seat at (x, y), about 70 units tall."""
    return P([(x - 6 * s, y - 70 * s), (x + 6 * s, y - 70 * s), (x + 8 * s, y - 56 * s), (x + 16 * s, y - 46 * s),
              (x + 18 * s, y - 20 * s), (x + 40 * s, y - 30 * s), (x + 46 * s, y - 4 * s), (x + 44 * s, y),
              (x - 14 * s, y), (x - 18 * s, y - 14 * s), (x - 16 * s, y - 46 * s), (x - 8 * s, y - 56 * s)], True)


def tox_d(x, y, s=1.0, closed=True, lean=0.0):
    """Dr. Tox in the shroud (Part VI section 8: narrow, vertical, contained), hood up, feet at (x, y),
    160 units tall at s=1. Closed: wrapped to the hem. Open: hanging from the shoulders."""
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


def jar_d(cx, by, w, h):
    """A wide-mouthed jar with a screw lid, base centre at (cx, by)."""
    x0 = cx - w / 2
    return (f"M{f(x0 + w * .12)},{f(by - h)} L{f(x0 + w * .88)},{f(by - h)} L{f(x0 + w * .88)},{f(by - h * .86)} "
            f"Q{f(x0 + w)},{f(by - h * .8)} {f(x0 + w)},{f(by - h * .66)} L{f(x0 + w)},{f(by - w * .12)} "
            f"Q{f(x0 + w)},{f(by)} {f(x0 + w * .86)},{f(by)} L{f(x0 + w * .14)},{f(by)} Q{f(x0)},{f(by)} {f(x0)},{f(by - w * .12)} "
            f"L{f(x0)},{f(by - h * .66)} Q{f(x0)},{f(by - h * .8)} {f(x0 + w * .12)},{f(by - h * .86)}Z")


def lamp_d(cx, cy, s=1.0):
    """The bunker's work lamp: a conical steel shade, hanging; mouth centre at (cx, cy)."""
    return P([(cx - 60 * s, cy), (cx + 60 * s, cy), (cx + 36 * s, cy - 50 * s), (cx - 36 * s, cy - 50 * s)], True)


def tangram():
    """The seven tangram pieces in a 2 x 2 square (units), as (name, points)."""
    return [("large-a", [(0, 0), (2, 0), (1, 1)]),
            ("large-b", [(0, 0), (1, 1), (0, 2)]),
            ("medium", [(2, 1), (2, 2), (1, 2)]),
            ("small-a", [(2, 0), (2, 1), (1.5, 0.5)]),
            ("small-b", [(1, 1), (1.5, 1.5), (0.5, 1.5)]),
            ("square", [(1, 1), (1.5, 0.5), (2, 1), (1.5, 1.5)]),
            ("parallelogram", [(0, 2), (0.5, 1.5), (1.5, 1.5), (1, 2)])]


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
          anchor="middle", font_weight="bold", letter_spacing=f(sz * .12), fit=fitw(text, sz, w - h * .4, .78))


def blade(a, x, y, s=1.0, rot=0, color="#2a2d2e", line=INK, sw=3, channel=BLOOD2):
    """One leaf-bladed throwing knife (Part VI section 4 and 11): open centre channel, fill port at the
    ricasso. Tip up, grip ring at (x, y + 66 s) before rotation."""
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(rot)}) scale({f(s)})")
    a.path("M0,-110 C16,-80 18,-30 8,10 L-8,10 C-18,-30 -16,-80 0,-110Z", fill=color, stroke=line, stroke_width=sw)
    a.line(0, -86, 0, 0, stroke=channel, stroke_width=3)
    a.circle(0, 2, 3, fill=channel)
    a.rect(-10, 10, 20, 8, fill=color, stroke=line, stroke_width=sw)
    a.rect(-5, 18, 10, 42, rx=3, fill="#1b1d1e", stroke=line, stroke_width=sw)
    a.circle(0, 66, 6, fill="none", stroke=line, stroke_width=sw)
    a.close()


def arcology(a, x, base, w, h, fill, stroke=None, sw=2, windows=None, plinth=True):
    """The final arcology: glass-and-steel monoliths on a raw concrete plinth (Part III; the author's still
    0d6ffb66). x is the left edge, base the plain's line."""
    ph = h * .16 if plinth else 0
    if plinth:
        a.path(P([(x - w * .06, base), (x + w * 1.06, base), (x + w * .98, base - ph), (x + w * .02, base - ph)], True),
               fill=fill, stroke=stroke or "none", stroke_width=sw)
    towers = ((0.08, 0.2, 0.78), (0.3, 0.16, 1.0), (0.5, 0.2, 0.9), (0.74, 0.18, 0.66))
    for tx, tw, th in towers:
        a.rect(x + w * tx, base - ph - (h - ph) * th, w * tw, (h - ph) * th, fill=fill, stroke=stroke or "none",
               stroke_width=sw)
        if windows:
            for k in range(1, int(th * 9)):
                a.line(x + w * tx + 3, base - ph - (h - ph) * th + k * (h - ph) / 9, x + w * (tx + tw) - 3,
                       base - ph - (h - ph) * th + k * (h - ph) / 9, stroke=windows, stroke_width=1, opacity=0.6)
    for y0 in (0.45, 0.62):                       # sealed skybridges
        a.rect(x + w * .26, base - ph - (h - ph) * y0, w * .52, h * .02, fill=fill, stroke=stroke or "none",
               stroke_width=sw)


def grain(a, strength=0.3, freq=1.0):
    """Film grain laid over whatever is already drawn (Art.paper paints a flat colour first)."""
    fid = a.uid("grain")
    a.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%">'
           f'<feTurbulence type="fractalNoise" baseFrequency="{f(freq)}" numOctaves="2" seed="{a.seed % 997}"/>'
           f'<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {f(strength)} 0"/></filter>')
    a.rect(0, 0, a.w, a.h, filter=f"url(#{fid})")

"""Title lettering: MISSING CAMPSITES as a map title in green printed ink, whole and losing letters
from the entrance inward. Tam's pencil copy and ticks underneath never change."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G

# letterforms on a 5 x 7 grid: lists of strokes; ("s", pts) is a smooth curve, ("l", pts) a polyline
LET = {
    "M": [("l", [(0, 7), (0, 0), (2.5, 4.2), (5, 0), (5, 7)])],
    "I": [("l", [(2.5, 0), (2.5, 7)]), ("l", [(1.2, 0), (3.8, 0)]), ("l", [(1.2, 7), (3.8, 7)])],
    "S": [("s", [(4.8, 1.3), (3.8, .25), (1.6, .2), (.3, 1.6), (1.2, 3.1), (3.8, 3.9), (4.8, 5.3), (3.6, 6.8),
                 (1.4, 6.85), (.1, 5.7)])],
    "N": [("l", [(0, 7), (0, 0), (5, 7), (5, 0)])],
    "G": [("s", [(4.9, 1.5), (3.6, .2), (1.6, .2), (.1, 2), (.1, 5), (1.6, 6.8), (3.6, 6.8), (4.9, 5.6)]),
          ("l", [(4.9, 5.6), (4.9, 3.8), (2.9, 3.8)])],
    "C": [("s", [(4.9, 1.5), (3.6, .2), (1.6, .2), (.1, 2), (.1, 5), (1.6, 6.8), (3.6, 6.8), (4.9, 5.5)])],
    "A": [("l", [(0, 7), (2.5, 0), (5, 7)]), ("l", [(1.1, 4.7), (3.9, 4.7)])],
    "P": [("l", [(0, 7), (0, 0), (3, 0)]), ("s", [(3, 0), (4.6, .6), (4.9, 1.9), (4.6, 3.2), (3, 3.8)]),
          ("l", [(3, 3.8), (0, 3.8)])],
    "E": [("l", [(5, 0), (0, 0), (0, 7), (5, 7)]), ("l", [(0, 3.5), (3.6, 3.5)])],
    "T": [("l", [(0, 0), (5, 0)]), ("l", [(2.5, 0), (2.5, 7)])],
}
WORD = "MISSING CAMPSITES"
SUB = {0: "HOLLIN CREEK — SITES 1–24", 3: "HOLLIN CREEK — SITES 4–24", 6: "HOLLIN CREEK — SITES 7–24",
       9: "HOLLIN CREEK — SITES 12–24", 12: "SITES 20–24", 16: ""}


def letter_d(a, ch, x, y, u):
    d = []
    for kind, pts in LET[ch]:
        q = [(x + px * u, y + py * u * 1.45) for px, py in pts]
        d.append(a.smooth_d(q) if kind == "s" else "M" + " L".join(f"{f(px)},{f(py)}" for px, py in q))
    return " ".join(d)


def title(lost):
    name = "whole" if lost == 0 else "gone" if lost == 16 else f"lost-{lost}"

    @asset(G, f"title-{name}", group="title", title=f"Title lettering, {lost} letters gone", w=1600, h=500,
           row="Title lettering, whole and losing letters")
    def draw(a: Art):
        r = a.rng
        a.paper(kit.PAPER, grain=0.1, fibre=1.0)
        # a survey sheet's fold and hairline frame
        a.rect(34, 30, 1532, 440, fill="none", stroke=kit.INK, stroke_width=1.4)
        a.rect(42, 38, 1516, 424, fill="none", stroke=kit.INK, stroke_width=0.6)
        a.line(800, 0, 800, 500, stroke="#b8ac8e", stroke_width=1.5, opacity=0.5)
        a.rect(800, 0, 14, 500, fill=a.gradient([(0, "#8a7e62"), (1, kit.PAPER)], 0, 0, 1, 0), opacity=0.22)
        # contour lines drifting behind the title, as on the map it heads
        for k in range(7):
            pts = [(40 + i * 152, 250 + 90 * (k - 3) * 0.55 + 46 * math.sin(i * 0.8 + k * 0.7)
                    + r.uniform(-8, 8)) for i in range(11)]
            a.path(a.smooth_d(pts), fill="none", stroke="#9B6A3C", stroke_width=2 if k == 3 else 0.9, opacity=0.38)
        u, gap, space = 12.6, 24, 60
        x, y = 72, 142
        ink_f = a.roughen(1.8, 0.3)
        n = 0
        ticks = []
        for ch in WORD:
            if ch == " ":
                x += space
                continue
            d = letter_d(a, ch, x, y, u)
            if n < lost:
                # gone: only the pressure of the plate is left in the paper
                a.path(d, fill="none", stroke="#fffdf4", stroke_width=20, stroke_linejoin="round", opacity=0.55,
                       transform="translate(1.5 1.8)")
                a.path(d, fill="none", stroke="#cfc4a6", stroke_width=20, stroke_linejoin="round", opacity=0.45)
                a.path(d, fill="none", stroke=kit.PAPER, stroke_width=16, stroke_linejoin="round", opacity=0.9)
            else:
                a.path(d, fill="none", stroke="#1d4426", stroke_width=22, stroke_linejoin="round",
                       stroke_linecap="square", filter=ink_f, transform="translate(2.5 3)", opacity=0.35)
                a.path(d, fill="none", stroke=kit.INK, stroke_width=21, stroke_linejoin="round",
                       stroke_linecap="square", filter=ink_f)
                a.path(d, fill="none", stroke=kit.PAPER, stroke_width=2.2, stroke_linejoin="round", opacity=0.85)
            ticks.append(x + 2.5 * u)
            x += 5 * u + gap
            n += 1
        # printed sub-line, which renumbers itself without noticing
        if SUB[lost]:
            kit.printed(a, 66, 104, SUB[lost], size=22, letter_spacing="7")
        a.line(66, 118, 1534, 118, stroke=kit.INK, stroke_width=0.8)
        a.line(66, 286, 1534, 286, stroke=kit.INK, stroke_width=0.8)
        # Tam's pencil: one tick under every letter, and the name copied out. These hold.
        for tx in ticks:
            kit.pencil(a, [(tx - 7, 318), (tx - 1, 330), (tx + 12, 304)], w=2.6, amp=0.8, step=8)
        kit.hand(a, 70, 408, "Missing Campsites", size=58, rot=-1.2)
        kit.pencil(a, [(70, 424), (540, 418)], w=2, amp=1.4)
        kit.hand(a, 1100, 404, f"letters: 16     printed: {16 - lost}", size=30, rot=-0.6)
        if lost:
            kit.hand(a, 1100, 440, "Nothing changes in here. Check.", size=24, rot=-0.6, color="#6a6a66")
        kit.tooth(a, 0.07)
    draw.__doc__ = ("The game's title as a survey map's heading in forest-green printed ink with an inline, over faint "
                    f"contour lines; {lost} of its sixteen letters have gone from the left, the entrance end, leaving "
                    "only the plate's pressure in the paper. Underneath, Tam's pencil copy of the name and one tick "
                    "per letter are all still there.")
    return draw


for _n in (0, 3, 6, 9, 12, 16):
    title(_n)

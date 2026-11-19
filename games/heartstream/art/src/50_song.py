"""Marrow-Song: beads in four timbres, the rest bead, the hollow bead and the membrane. Bead-string notation:
beads on strands, height as pitch, the last bead home."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Song: beads in 4 timbres, rest bead, hollow bead, membrane"


def night(a, heights=True):
    a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, kit.NIGHT), (1, kit.MARROW)]))
    a.paper("none", grain=0.22)
    a.stipple(0, 0, a.w, a.h, n=int(a.w * a.h / 900), r=(0.4, 1.3), fill=kit.GLOW, opacity=0.35)
    if heights:
        for k in range(5):
            y = a.h * (0.16 + 0.17 * k)
            a.line(8, y, a.w - 8, y, stroke=kit.GLOW, stroke_width=0.8, opacity=0.22, stroke_dasharray="2 6")


def strand(a, y0, y1, bx, by, cut=0):
    """The strand through a bead at (bx, by); cut leaves a gap of that radius (the bead hides it)."""
    kw = dict(fill="none", stroke=kit.BONE, stroke_width=2.4, stroke_linecap="round", opacity=0.75)
    a.path(f"M0,{y0} Q{bx * .5},{(y0 + by) / 2 + 6} {bx - cut},{by}", **kw)
    a.path(f"M{bx + cut},{by} Q{bx + (160 - bx) * .5},{(y1 + by) / 2 - 6} 160,{y1}", **kw)


TIMBRE = {"laughs": "bright, ringing: ripples spread from it", "argues": "hard-edged, with the accent cut above it",
          "dreams": "soft and far, haloed", "fears": "small and close, a tight held note"}
for _ti, (_name, _col) in enumerate(kit.TEMPERS):
    def _bead(a: Art, name=_name, col=_col, ti=_ti):
        night(a)
        by = [58, 86, 44, 112][ti]
        bx, r = 80, [25, 23, 24, 17][ti]
        if name == "dreams":
            a.circle(bx, by, 62, fill=a.radial([(0, col, 0.55), (1, col, 0)]))
            for k in range(7):
                an = k * 0.9 + 0.4
                a.circle(bx + 48 * math.cos(an), by + 48 * math.sin(an), 1.6, fill=kit.BONE)
        if name == "laughs":
            for k, rr in enumerate((36, 48, 60)):
                a.circle(bx, by, rr, fill="none", stroke=col, stroke_width=2.4 - k * .5, opacity=0.6 - k * .15, stroke_dasharray=f"{14 + k * 6} {6 + k * 2}")
        if name == "fears":
            for rr in (22, 27):
                a.circle(bx, by, rr, fill="none", stroke=col, stroke_width=1.3, opacity=0.6)
        strand(a, 96, 70, bx, by, cut=r - 2)
        if name == "argues":
            d = kit.P(Art.ngon(bx, by, r + 2, 6, 30), True)
            a.path(d, fill=a.radial([(0, "#f6a17a", 1), (0.6, col, 1), (1, kit.DEEP, 1)], cx=0.38, cy=0.34, r=0.8), stroke=kit.INK, stroke_width=3, stroke_linejoin="round")
            a.path(f"M{bx - 13},{by - r - 22} L{bx},{by - r - 10} L{bx + 13},{by - r - 22}", fill="none", stroke=col, stroke_width=4.5, stroke_linecap="round", stroke_linejoin="round")
            a.path(kit.P([(bx, by), (bx + r + 2, by)]) + kit.P([(bx, by), (bx - (r + 2) / 2, by - (r + 2) * .866)]) + kit.P([(bx, by), (bx - (r + 2) / 2, by + (r + 2) * .866)]),
                   stroke=kit.INK, stroke_width=1.2, opacity=0.4, fill="none")
        else:
            dark = {"laughs": "#a8641a", "dreams": kit.MARROW2, "fears": "#a8946c"}[name]
            lite = {"laughs": "#fde3a0", "dreams": "#d4e8fa", "fears": "#fbf5e6"}[name]
            a.circle(bx, by, r, fill=a.radial([(0, lite, 1), (0.55, col, 1), (1, dark, 1)], cx=0.38, cy=0.34, r=0.8), stroke=kit.INK, stroke_width=3)
        a.ellipse(bx - r * .35, by - r * .4, r * .3, r * .18, fill="#fff", opacity=0.75, transform=f"rotate(-30 {bx - r * .35} {by - r * .4})")
        a.circle(bx - r + 3, by, 2.4, fill=kit.INK)
        a.circle(bx + r - 3, by, 2.4, fill=kit.INK)
        kit.temper_glyph(a, name, 136, 138, 9, col, sw=2.4)
    _bead.__doc__ = f"A song bead in the timbre of the one who {_name} ({TIMBRE[_name]}), threaded on its strand against the marrow dark; its height on the five faint lines is its pitch."
    asset(G, f"bead-{_name}", group="pieces", title=f"Song bead: the one who {_name}", w=160, h=160, row=ROW)(_bead)


@asset(G, "bead-rest", group="pieces", title="Rest bead", w=160, h=160, row=ROW)
def bead_rest(a: Art):
    """The rest bead: a silent beat any player may place. An open knot in the strand, nothing threaded on it, a
    single short cut above it for the held breath."""
    night(a)
    a.path("M0,88 Q40,92 60,84 C66,60 96,60 100,84 C104,104 62,106 64,84 M100,84 Q130,76 160,80", fill="none", stroke=kit.BONE, stroke_width=3, stroke_linecap="round",
           opacity=0.9)
    a.circle(81, 82, 30, fill=a.radial([(0, kit.GLOW, 0.25), (1, kit.GLOW, 0)]))
    a.line(70, 44, 92, 44, stroke=kit.BONE, stroke_width=4, stroke_linecap="round")
    for dx in (-22, 22):
        a.circle(81 + dx * 2.2, 120, 2, fill=kit.GLOW, opacity=0.7)


@asset(G, "bead-hollow", group="pieces", title="Hollow bead", w=160, h=160, row=ROW)
def bead_hollow(a: Art):
    """The hollow bead: the slot of a brother who stayed or was taken. It keeps its place on the strand and sounds
    as silence: an outline only, the dark showing through it."""
    night(a)
    strand(a, 92, 74, 80, 76, cut=24)
    a.path("M56,76 H104", stroke=kit.BONE, stroke_width=1.6, stroke_dasharray="2 5", opacity=0.6, fill="none")
    a.circle(80, 76, 26, fill=kit.NIGHT, opacity=0.55)
    a.circle(80, 76, 26, fill="none", stroke=kit.BONE, stroke_width=2.6, stroke_dasharray="5 6", opacity=0.9)
    a.path("M62,64 A22,22 0 0,1 84,54", fill="none", stroke="#fff", stroke_width=1.6, opacity=0.5, stroke_linecap="round")
    for k in range(3):
        a.path(f"M{120 + k * 9},{60 - k * 4} q5,10 0,20", fill="none", stroke=kit.GLOW, stroke_width=1.4, opacity=0.35 - k * .1)


@asset(G, "song-membrane", group="pieces", title="The song membrane", w=1600, h=500, row=ROW)
def membrane(a: Art):
    """The membrane the song is strung on: a long wet band across the marrow dark, divided into eight slots like
    vertebrae, five faint heights from low to high, and at the far right the ring of home on the lowest line."""
    night(a, heights=False)
    x0, x1, y0, y1 = 70, 1530, 70, 430
    d = f"M{x0},{y0 + 30} Q{x0},{y0} {x0 + 30},{y0} L{x1 - 30},{y0 + 6} Q{x1},{y0 + 6} {x1},{y0 + 36} L{x1},{y1 - 30} Q{x1},{y1} {x1 - 30},{y1} L{x0 + 30},{y1 - 6} Q{x0},{y1 - 6} {x0},{y1 - 36}Z"
    a.path(d, fill=a.gradient([(0, "#5d8fc2"), (0.5, "#3f6f9f"), (1, "#2a4f7c")]), opacity=0.5, stroke=kit.GLOW, stroke_width=2)
    cl = a.clip(f'<path d="{d}"/>')
    a.open("g", clip_path=cl)
    kit.grain_lines(a, x0, y0, x1 - x0, y1 - y0, 16, kit.GLOW, 0.25, amp=7, sw=1.2)
    a.rect(x0, y0, x1 - x0, 40, fill=a.gradient([(0, "#fff"), (1, kit.GLOW)]), opacity=0.14)
    sw = (x1 - x0) / 8
    for k in range(1, 8):       # the joins: a pinch like the gap between vertebrae
        x = x0 + k * sw
        a.path(f"M{f(x)},{y0} C{f(x - 12)},{y0 + 110} {f(x + 12)},{y1 - 110} {f(x)},{y1}", fill="none", stroke=kit.NIGHT, stroke_width=9, opacity=0.5)
        a.path(f"M{f(x + 5)},{y0} C{f(x - 7)},{y0 + 110} {f(x + 17)},{y1 - 110} {f(x + 5)},{y1}", fill="none", stroke=kit.GLOW, stroke_width=1.4, opacity=0.5)
        a.ellipse(x, y0 + 4, 16, 9, fill=kit.BONE, opacity=0.7)
        a.ellipse(x, y1 - 3, 16, 9, fill=kit.BONE, opacity=0.7)
    for k in range(5):
        y = y1 - 46 - k * 66
        a.line(x0 + 8, y, x1 - 8, y, stroke=kit.BONE, stroke_width=1.2, opacity=0.35, stroke_dasharray="3 9")
    a.close()
    for k in range(5):
        a.text(44, y1 - 40 - k * 66, str(k + 1), size=20, family="sans-serif", fill=kit.GLOW, opacity=0.8, text_anchor="middle")
    for k in range(8):
        a.text(x0 + (k + .5) * sw, 462, kit.ROMAN[k].lower(), size=17, family="serif", fill=kit.GLOW, opacity=0.6, text_anchor="middle", font_style="italic")
    hx, hy = x1 - 44, y1 - 46
    for r, o in ((16, .9), (26, .55), (37, .3)):
        a.circle(hx, hy, r, fill="none", stroke=kit.GOLD, stroke_width=2.6, opacity=o)
    kit.caps(a, hx - 10, 462, "HOME", size=17, fill=kit.GOLD, spacing=4, family="sans-serif")
    a.rect(4, 4, a.w - 8, a.h - 8, rx=26, fill="none", stroke=kit.RIVER, stroke_width=2.5, opacity=0.8)

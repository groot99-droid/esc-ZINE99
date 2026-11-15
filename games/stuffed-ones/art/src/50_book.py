"""The Hand-Sewn Book: thirty glyph strips in black silk, and fourteen backs in a child's red wool."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Book glyphs, fronts and backs"

gl = sibling(__file__, "_glyphs")
RAD, FRONTS, BACKS, segments = gl.RAD, gl.FRONTS, gl.BACKS, gl.segments
ROLE = {"who": (kit.BONE, "white: who"), "thing": ("#1b1512", "black: a thing"), "act": (kit.RED, "red: an act")}
SILK = "#17120f"



def holbein(a, segs, x, y, u, color, w=3.0, jit=0.0, mirror=False, **kw):
    d = []
    r = a.rng
    for (ax, ay), (bx, by) in segs:
        if mirror:
            ax, bx = 6 - ax, 6 - bx
        x1, y1, x2, y2 = x + ax * u, y + ay * u, x + bx * u, y + by * u
        if jit:
            x1 += r.uniform(-jit, jit); y1 += r.uniform(-jit, jit); x2 += r.uniform(-jit, jit); y2 += r.uniform(-jit, jit)
        L = math.hypot(x2 - x1, y2 - y1) or 1
        g = (w * 0.75) / L
        d.append(f"M{f(x1 + (x2 - x1) * g)},{f(y1 + (y2 - y1) * g)}L{f(x2 - (x2 - x1) * g)},{f(y2 - (y2 - y1) * g)}")
    a.path("".join(d), fill="none", stroke=color, stroke_width=w, stroke_linecap="round", **kw)


def diaper(a, x, y, n, u, color, vertical=False):
    """A blackwork border: small lozenges with a stitch between, counted along a line."""
    d = []
    for k in range(n):
        cx, cy = (x, y + k * 2 * u) if vertical else (x + k * 2 * u, y)
        d.append(f"M{f(cx - u * .7)},{f(cy)}l{f(u * .7)},{f(-u * .7)}l{f(u * .7)},{f(u * .7)}l{f(-u * .7)},{f(u * .7)}z")
        d.append(f"M{f(cx)},{f(cy - u * .2)}v{f(u * .4)}")
    a.path("".join(d), fill="none", stroke=color, stroke_width=1.3, stroke_linecap="round", stroke_dasharray="3 1.2")


def strip(a, back=False):
    a.paper(kit.mix(kit.CEDAR, kit.INK, 0.4), grain=0.3, fibre=0.4)
    kit.lamp(a, 60, 40, 300, kit.DUST, 0.25)
    col = kit.mix(kit.LINEN, kit.DUST, 0.5) if not back else kit.mix(kit.LINEN, kit.CEDAR, 0.22)
    edge = a.wobble_d([(16, 14), (204, 14), (204, 306), (16, 306)], amp=1.6, step=6, closed=True)
    a.path(edge, fill=col, filter=kit.felt_filter(a, freq=0.9))
    a.path(kit.R(18, 16, 184, 288), fill=kit.weave_pattern(a, 2.6))
    # frayed ends: loose warp threads at top and bottom
    d = "".join(f"M{f(20 + i * 5.2)},{y}l{f(a.rng.uniform(-2, 2))},{f(s * a.rng.uniform(3, 9))}" for i in range(36)
                for y, s in ((15, -1), (305, 1)))
    a.path(d, stroke=kit.mix(col, kit.BONE, 0.3), stroke_width=1.2, stroke_linecap="round", fill="none")


def _front(k, row):
    name, role, top, bottom = row
    rc, rname = ROLE[role]

    @asset(G, f"glyph-{k + 1:02d}-{name}", group="pieces", title=f"Book glyph: {name}", w=220, h=320, row=ROW)
    def draw(a: Art):
        strip(a)
        # the slot colour: a sewn border in the thread of its role
        kit.thread(a, kit.R(30, 28, 160, 264, 3), rc, w=3, dash="8 5")
        diaper(a, 54, 50, 8, 8, SILK)
        diaper(a, 54, 240, 8, 8, SILK)
        u = 19
        holbein(a, segments(top, bottom), 110 - 3 * u, 72, u, SILK, w=3.4)
        # highlight of the silk
        holbein(a, segments(top, bottom), 110 - 3 * u - 0.7, 71.2, u, "#6d6258", w=0.9, opacity=0.8)
        a.text(110, 272, name.upper(), size=15, family="serif", fill=SILK, text_anchor="middle", letter_spacing=4)
        kit.shade(a, 0.3)
    how = f"the radicals {top} and {bottom}" if bottom else f"the radical {top}"
    draw.__doc__ = (f"A loose linen strip from the hand-sewn book: the glyph for \"{name}\" in neat black counted "
                    f"stitches ({how}), inside a border sewn in the thread of its role ({rname}).")


def _back(k, row):
    name, top, bottom, of = row
    fr = next(r for r in FRONTS if r[0] == of)

    @asset(G, f"glyph-back-{k + 1:02d}-{name}", group="pieces", title=f"Back of a strip: {name}", w=220, h=320, row=ROW)
    def draw(a: Art):
        strip(a, back=True)
        u = 19
        # the wrong side of the front: its glyph mirrored and faint, with carried threads and a knot tail
        rc = ROLE[fr[1]][0]
        a.path(kit.R(30, 28, 160, 264, 3), fill="none", stroke=rc, stroke_width=2.4, stroke_dasharray="5 8", stroke_dashoffset=6,
               stroke_linecap="round", opacity=0.45)
        fs = segments(fr[2], fr[3])
        holbein(a, fs, 110 - 3 * u, 72, u, SILK, w=2.2, mirror=True, opacity=0.28)
        pts = [(110 - 3 * u + (6 - s[0][0]) * u, 72 + s[0][1] * u) for s in fs[::3]]
        a.path("M" + "L".join(f"{f(x)},{f(y)}" for x, y in pts), fill="none", stroke=SILK, stroke_width=0.8, opacity=0.3)
        x, y = pts[-1]
        a.path(f"M{f(x)},{f(y)}q8,10 -2,18t6,16", fill="none", stroke=SILK, stroke_width=1.2, opacity=0.5)
        # Ruth's hand: big, crooked, red wool
        ub = 23
        segs = segments(top, bottom)
        ox, oy = 110 - 3 * ub + a.rng.uniform(-4, 4), 66 + (0 if bottom else 30) + a.rng.uniform(-3, 3)
        a.open("g", transform=f"rotate({f(a.rng.uniform(-5, 5))} 110 150)")
        holbein(a, segs, ox + 1.2, oy + 2, ub, "#1a0f08", w=7, jit=2.6, opacity=0.25)
        a.rng.seed(a.seed)
        holbein(a, segs, ox, oy, ub, kit.RED, w=6.4, jit=2.6)
        a.rng.seed(a.seed)
        holbein(a, segs, ox - 1, oy - 1.2, ub, kit.mix(kit.RED, kit.AMBER, 0.5), w=1.3, jit=2.6, opacity=0.8,
                stroke_dasharray="3 3")
        a.close()
        a.text(110, 288, name if name != "i" else "I", size=23, family="cursive", fill=kit.RED, text_anchor="middle",
               transform=f"rotate({f(a.rng.uniform(-4, 4))} 110 284)")
        kit.shade(a, 0.3)
    how = f"{top} over {bottom}" if bottom else top
    draw.__doc__ = (f"The back of the strip for \"{of}\": the wrong side of its black stitches shows faintly, and over "
                    f"them a second, larger glyph ({how}: \"{name}\") is worked in big crooked stitches of red wool.")


for _k, _r in enumerate(FRONTS):
    _front(_k, _r)
for _k, _r in enumerate(BACKS):
    _back(_k, _r)

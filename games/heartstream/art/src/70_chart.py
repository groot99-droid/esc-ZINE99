"""The Branch Chart: two plates, the back of the chart, and eight branch glyphs. Red-ink anatomical plate: fine
red vessels branching on vellum from a glowing point."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Chart: 2 plates, the back of the chart, 8 branch glyphs"
RED, DEEP = kit.RIVER, kit.DEEP


def vellum(a, m=26, stains=6):
    a.paper(kit.VELLUM, grain=0.3, fibre=0.7)
    for _ in range(stains):
        a.circle(a.rng.uniform(0, a.w), a.rng.uniform(0, a.h), a.rng.uniform(.08, .2) * a.w, fill=a.radial([(0, "#c9a36a", 0.28), (1, "#c9a36a", 0)]))
    a.rect(m, m, a.w - 2 * m, a.h - 2 * m, fill="none", stroke=RED, stroke_width=max(1.4, a.w / 700))
    a.rect(m + 7, m + 7, a.w - 2 * m - 14, a.h - 2 * m - 14, fill="none", stroke=RED, stroke_width=0.7)


def tube(a, pts, w, ink=RED, op=1.0, ticks=True):
    d = a.smooth_d(pts)
    a.path(d, fill="none", stroke=ink, stroke_width=w, stroke_linecap="round", opacity=op)
    if w > 4:
        a.path(d, fill="none", stroke="#f5e4c6", stroke_width=w - 2.6, stroke_linecap="round", opacity=op)
        if ticks:
            a.path(d, fill="none", stroke=ink, stroke_width=w - 3, stroke_dasharray="1 9", opacity=0.5 * op)


def twigs(a, x, y, ang, ln, depth, out):
    """Capillaries: thin forking lines, gathered into one path."""
    x2, y2 = x + ln * math.cos(ang), y + ln * math.sin(ang)
    mx, my = (x + x2) / 2 + a.rng.uniform(-ln, ln) * .15, (y + y2) / 2 + a.rng.uniform(-ln, ln) * .15
    out.append(f"M{f(x)},{f(y)}Q{f(mx)},{f(my)} {f(x2)},{f(y2)}")
    if depth:
        for s in (-1, 1):
            if a.rng.random() < 0.85:
                twigs(a, x2, y2, ang + s * a.rng.uniform(.25, .6), ln * a.rng.uniform(.62, .8), depth - 1, out)


def arrows(a, x, y, ang, n, ink=RED, s=9, sw=2.2):
    d = []
    for k in range(n):
        px, py = x + (k - (n - 1) / 2) * s * 1.5 * math.cos(ang), y + (k - (n - 1) / 2) * s * 1.5 * math.sin(ang)
        for sg in (-1, 1):
            d.append(f"M{f(px)},{f(py)} l{f(-s * math.cos(ang + sg * .6))},{f(-s * math.sin(ang + sg * .6))}")
    a.path("".join(d), fill="none", stroke=ink, stroke_width=sw, stroke_linecap="round")


def tendril_marks(a, x, y, n, ink=RED, s=1.0):
    for k in range(n):
        px = x + (k - (n - 1) / 2) * 11 * s
        a.path(f"M{f(px)},{f(y)} q{f(-6 * s)},{f(-9 * s)} 0,{f(-18 * s)} q{f(5 * s)},{f(-7 * s)} {f(-1 * s)},{f(-13 * s)}", fill="none", stroke=ink, stroke_width=1.5 * s,
               stroke_linecap="round")


def calm(a, x, y, ink=RED, s=1.0):
    a.circle(x, y, 15 * s, fill=kit.VELLUM, stroke=ink, stroke_width=2 * s)
    a.circle(x, y, 9 * s, fill="none", stroke=ink, stroke_width=1 * s)
    a.circle(x, y, 22 * s, fill="none", stroke=ink, stroke_width=0.8 * s, stroke_dasharray="2 4")


def plate(a, num, sub, juncs, heart=False):
    vellum(a)
    raft = (210, 560)
    caps_ = []
    twigs(a, raft[0], raft[1], math.pi, 70, 3, caps_)
    twigs(a, raft[0], raft[1], math.pi * .8, 60, 2, caps_)
    twigs(a, raft[0], raft[1], -math.pi * .8, 60, 2, caps_)
    bg = []
    for an in (-0.9, -0.35, 0.3, 0.85):    # the rest of the body, faint
        twigs(a, raft[0] + 40, raft[1], an, 420, 5, bg)
    a.path("".join(bg), fill="none", stroke=RED, stroke_width=1.2, opacity=0.16)
    prev = raft
    labels = []
    for ji, (jx, jy, branches, chosen) in enumerate(juncs):
        tube(a, [prev, ((prev[0] + jx) / 2, (prev[1] + jy) / 2 + 14 * (-1) ** ji), (jx, jy)], 24)
        nxt = None
        for bi, (ex, ey, cur, ten, wd, pool, other) in enumerate(branches):
            ink = kit.GREY if other else RED
            mx, my = (jx + ex) / 2, (jy + ey) / 2
            ang = math.atan2(ey - jy, ex - jx)
            bend = (mx - 18 * math.sin(ang), my + 18 * math.cos(ang))
            if other:       # another hand's ink: one unsteady line, no tube
                a.wobble([(jx, jy), bend, (ex, ey)], amp=2.2, step=12, stroke="#5d4e50", stroke_width=3, stroke_linecap="round")
                a.ellipse(ex + 46, ey + 16, 62, 26, fill=kit.GREY, opacity=0.45, stroke="#5d4e50", stroke_width=1.6)
                for k in range(4):
                    a.line(ex + 6 + k * 6, ey + 6 + k * 7, ex + 86 - k * 6, ey + 6 + k * 7, stroke="#5d4e50", stroke_width=1, opacity=0.7)
            else:
                tube(a, [(jx, jy), bend, (ex, ey)], wd * 1.5, op=1 if bi == chosen else 0.85)
                if bi != chosen:
                    for s in (-.5, 0, .5):
                        twigs(a, ex, ey, ang + s, 80, 3, caps_)
                # what the branch shows
                px, py = jx + (ex - jx) * .42, jy + (ey - jy) * .42
                ox, oy = 34 * math.sin(ang), -34 * math.cos(ang)
                arrows(a, px + ox, py + oy, ang, cur, s=13, sw=3)
                if ten:
                    tendril_marks(a, jx + (ex - jx) * .7 - ox * .5, jy + (ey - jy) * .7 - oy * .5 - 4, ten, s=1.5)
                if pool:
                    calm(a, jx + (ex - jx) * .78, jy + (ey - jy) * .78, s=1.5)
            labels.append((jx + (ex - jx) * .58 - 40 * math.sin(ang), jy + (ey - jy) * .58 + 40 * math.cos(ang) + 10, "abcd"[bi], ink))
            if bi == chosen:
                nxt = (ex, ey)
        a.circle(jx, jy, 30, fill="none", stroke=RED, stroke_width=1.2, stroke_dasharray="3 5")
        a.text(jx - 8, jy - 40, kit.ROMAN[ji].lower() + ".", size=22, family="serif", fill=DEEP, font_style="italic")
        prev = nxt
    a.path("".join(caps_), fill="none", stroke=RED, stroke_width=1, opacity=0.5)
    if heart and prev:
        a.circle(prev[0] + 50, prev[1], 80, fill=a.radial([(0, kit.GOLD, 0.6), (1, kit.GOLD, 0)]))
        a.path(kit.heart_d(prev[0] + 50, prev[1], 22), fill=kit.GOLD, stroke=DEEP, stroke_width=2)
    for x, y, ch, ink in labels:
        a.text(x, y, ch, size=32, family="serif", fill=DEEP if ink == RED else "#5d4e50", font_style="italic", text_anchor="middle")
    # the raft: a glowing point
    a.circle(raft[0], raft[1], 70, fill=a.radial([(0, kit.HILITE, 0.85), (0.5, kit.HILITE, 0.35), (1, kit.HILITE, 0)]))
    a.circle(raft[0], raft[1], 9, fill="#fff6e0", stroke=DEEP, stroke_width=2.5)
    a.text(raft[0] - 20, raft[1] + 92, "the raft", size=22, family="serif", fill=DEEP, font_style="italic")
    kit.caps(a, 70, 100, f"PLATE {num}", size=38, fill=DEEP, anchor="start", spacing=8)
    a.text(a.w - 70, 100, sub, size=32, family="serif", fill=DEEP, font_style="italic", text_anchor="end")
    # key
    kx, ky = 80, a.h - 150
    for i, (lab, fn) in enumerate((("current", lambda x, y: arrows(a, x, y, 0, 2)), ("tendrils", lambda x, y: tendril_marks(a, x, y + 14, 2)),
                                   ("calm pool", lambda x, y: calm(a, x, y, s=.7)))):
        fn(kx + 20, ky + i * 42)
        a.text(kx + 58, ky + i * 42 + 8, lab, size=24, family="serif", fill=DEEP, font_style="italic")
    # the pulse line that shortens
    a.path(f"M{a.w - 620},{a.h - 86} h120 l12,-34 l16,62 l12,-28 h150 l12,-34 l16,62 l12,-28 h120", fill="none", stroke=RED, stroke_width=2.2, stroke_linejoin="round")
    a.circle(a.w - 100, a.h - 86, 6, fill=DEEP)


@asset(G, "chart-plate-vi", group="maps", title="Branch Chart, plate VI: the river", w=1600, h=1100, row=ROW)
def plate6(a: Art):
    """The first chart, a red-ink plate on vellum: the vessels ahead branch from the glowing point of the raft
    through two junctions of three branches each, every branch marked with its current, its tendrils, its width
    and any calm pool; capillaries fade off the page."""
    plate(a, "VI", "the river, from the raft", [
        (560, 548, [(900, 290, 3, 2, 12, False, False), (960, 560, 2, 0, 16, False, False), (880, 830, 1, 1, 8, True, False)], 1),
        (1000, 560, [(1380, 300, 2, 3, 10, False, False), (1430, 590, 3, 0, 14, False, False), (1340, 850, 1, 0, 9, True, False)], None)])


@asset(G, "chart-plate-vii", group="maps", title="Branch Chart, plate VII: the delta", w=1600, h=1100, row=ROW)
def plate7(a: Art):
    """The delta chart: three junctions on vellum, the last with four branches. Three run on toward the small gold
    heart; the fourth is drawn in another hand's grey ink, without arrows, down to a still pool off the edge of
    the figure."""
    plate(a, "VII", "the delta, from the raft", [
        (470, 552, [(720, 330, 2, 1, 11, False, False), (780, 560, 3, 2, 16, False, False), (700, 800, 1, 0, 8, True, False)], 1),
        (810, 556, [(1040, 320, 3, 3, 10, False, False), (1110, 540, 2, 0, 15, False, False), (1020, 810, 1, 1, 8, False, False)], 1),
        (1140, 538, [(1400, 270, 3, 2, 9, False, False), (1440, 520, 2, 1, 14, False, False), (1380, 740, 1, 0, 8, True, False),
                     (1190, 900, 0, 0, 3, False, True)], 1)], heart=True)


@asset(G, "chart-back", group="maps", title="The Back of the Chart", w=1600, h=1100, row=ROW)
def back(a: Art):
    """The back of the chart, held to the light: the plate shows through reversed and faint, and the awl's pricks
    shine. They draw the heart, and every vessel leaving it apart from every other, each ending alone in a small
    cold ring."""
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#fff3cf", 1), (0.5, "#e9c98c", 1), (1, "#9a6e3a", 1)], r=0.75))
    a.paper("none", grain=0.3, fibre=0.7)
    # the front, seen through: mirrored
    a.open("g", transform=f"translate({a.w},0) scale(-1,1)", opacity=0.3)
    out = []
    twigs(a, 210, 560, 0, 330, 4, out)
    twigs(a, 560, 548, -.5, 300, 4, out)
    twigs(a, 560, 548, .6, 300, 4, out)
    a.path("".join(out), fill="none", stroke=DEEP, stroke_width=3)
    a.rect(26, 26, a.w - 52, a.h - 52, fill="none", stroke=DEEP, stroke_width=2.4)
    kit.caps(a, 70, 92, "PLATE VII", size=28, fill=DEEP, anchor="start", spacing=8)
    a.text(a.w - 70, 92, "the delta, from the raft", size=26, family="serif", fill=DEEP, font_style="italic", text_anchor="end")
    a.close()
    cx, cy = 800, 560
    a.circle(cx, cy, 300, fill=a.radial([(0, "#fff", 0.7), (1, "#fff", 0)]))
    blur = a.blur(5)
    ds, ends = [kit.heart_d(cx, cy - 6, 58)], []
    n = 13
    for k in range(n):
        an = 2 * math.pi * k / n + 0.24
        r1 = a.rng.uniform(360, 520)
        pts = [(cx + 70 * math.cos(an), cy + 62 * math.sin(an))]
        for t in (0.4, 0.7, 1.0):
            w = an + 0.16 * math.sin(k * 2.1 + t * 3)
            pts.append((cx + r1 * t * math.cos(w) * 1.35, cy + r1 * t * math.sin(w) * 0.9))
        ds.append(a.smooth_d(pts))
        ends.append(pts[-1])
    d = " ".join(ds)
    a.path(d, fill="none", stroke=kit.GOLD, stroke_width=12, stroke_dasharray="0.1 13", stroke_linecap="round", filter=blur, opacity=0.9)
    a.path(d, fill="none", stroke="#fffdf0", stroke_width=5, stroke_dasharray="0.1 13", stroke_linecap="round")
    for (x, y) in ends:
        a.circle(x, y, 26, fill=a.radial([(0, kit.GLOW, 0.75), (1, kit.GLOW, 0)]))
        a.circle(x, y, 11, fill="none", stroke=kit.MARROW2, stroke_width=4, stroke_dasharray="0.1 6.5", stroke_linecap="round")
    # where the awl is still through the skin
    a.circle(cx, cy - 6, 9, fill="#fff", filter=a.blur(3))
    a.circle(cx, cy - 6, 4, fill="#fff")
    a.vignette(0.55, "#3a2410")


def token(a, label):
    vellum(a, m=8, stains=2)
    kit.caps(a, 80, 142, label, size=13, fill=DEEP, spacing=2.5, font_weight="bold")


def seg(a, w=14, y=84, x0=14, x1=146, wave=6):
    tube(a, [(x0, y + wave), (60, y - wave), (104, y + wave * .6), (x1, y - wave * .4)], w)


GLYPHS = {
    "current-1": ("CURRENT I", "one arrow: a slow branch", lambda a: (seg(a), arrows(a, 80, 54, 0, 1, s=13, sw=3))),
    "current-2": ("CURRENT II", "two arrows: a steady branch", lambda a: (seg(a), arrows(a, 80, 54, 0, 2, s=13, sw=3))),
    "current-3": ("CURRENT III", "three arrows: the strongest current, which breaks a tie", lambda a: (seg(a), arrows(a, 80, 54, 0, 3, s=13, sw=3))),
    "tendrils": ("TENDRILS", "hair-fine tendrils rising from the vessel floor", lambda a: (seg(a, y=98), tendril_marks(a, 80, 90, 3, s=1.7))),
    "calm-pool": ("CALM POOL", "a ring where the water rests", lambda a: (seg(a), calm(a, 84, 82, s=1.5))),
    "narrow": ("NARROW", "the vessel pinched thin between two folds",
               lambda a: (tube(a, [(14, 84), (50, 84)], 16), tube(a, [(50, 84), (110, 84)], 5), tube(a, [(110, 84), (146, 84)], 16),
                          a.path("M64,56 q16,20 32,0 M64,112 q16,-20 32,0", fill="none", stroke=RED, stroke_width=2.2, stroke_linecap="round"))),
    "patrol": ("PATROL", "a heavy-lidded eye under the vessel, and a pulse that falls off the beat",
               lambda a: (seg(a, y=60, wave=3), a.path("M48,100 Q80,78 112,100 Q80,116 48,100Z", fill="#f5e4c6", stroke=DEEP, stroke_width=2.4),
                          a.ellipse(80, 100, 5, 7, fill=DEEP), a.path("M48,100 Q80,84 112,100", fill="none", stroke=DEEP, stroke_width=4.5),
                          a.path("M20,36 h22 l5,-12 l7,22 l5,-10 h30 l5,-12 l7,22 l5,-10 h14", fill="none", stroke=RED, stroke_width=1.6, stroke_linejoin="round"))),
    "listen": ("LISTEN", "arcs of hearing held over a branch",
               lambda a: (seg(a, y=100, wave=3), [a.path(f"M{80 - r},{84} A{r},{r} 0 0,1 {80 + r},{84}", fill="none", stroke=RED, stroke_width=2.4 - k * .5,
                                                         stroke_dasharray=None if k == 0 else "5 4", stroke_linecap="round") for k, r in enumerate((14, 26, 38))],
                          a.circle(80, 84, 4, fill=DEEP))),
}
for _key, (_label, _what, _fn) in GLYPHS.items():
    def _tok(a: Art, label=_label, fn=_fn):
        token(a, label)
        fn(a)
    _tok.__doc__ = f"A branch glyph from the chart, in red ink on vellum: {_what}, drawn on a short length of vessel."
    asset(G, f"glyph-{_key}", group="pieces", title=f"Branch glyph: {_label.lower()}", w=160, h=160, row=ROW)(_tok)

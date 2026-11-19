"""Title lettering and the nine chapter numerals, scrimshaw-cut."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Title lettering and nine chapter numerals, scrimshaw-cut"


def slab(a, x, y, w, h, bulge=0.12):
    d = (f"M{f(x + h * .5)},{f(y)} C{f(x + w * .3)},{f(y - h * bulge)} {f(x + w * .7)},{f(y + h * bulge * .6)} {f(x + w - h * .5)},{f(y + h * .04)} "
         f"C{f(x + w + h * .1)},{f(y + h * .2)} {f(x + w + h * .1)},{f(y + h * .8)} {f(x + w - h * .5)},{f(y + h)} "
         f"C{f(x + w * .7)},{f(y + h * (1 + bulge * .6))} {f(x + w * .3)},{f(y + h * (1 - bulge * .5))} {f(x + h * .5)},{f(y + h * .97)} "
         f"C{f(x - h * .1)},{f(y + h * .8)} {f(x - h * .1)},{f(y + h * .2)} {f(x + h * .5)},{f(y)}Z")
    return d


@asset(G, "title-lettering", group="title", title="Title lettering: A Journey Into the Heartstream", w=1600, h=500,
       row=ROW)
def title(a: Art):
    """The game's title cut into a long blade of bone like scrimshaw: HEARTSTREAM in letters scratched and
    rubbed with pigment that runs from marrow blue to river red, the six marks at the ends, and a thin
    vessel line carrying the raft toward a small heart."""
    a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, kit.NIGHT), (0.5, "#241833"), (1, "#4a0a16")], x2=1, y2=0))
    a.paper("none", grain=0.25)
    a.circle(300, 250, 420, fill=a.radial([(0, kit.GLOW, 0.28), (1, kit.GLOW, 0)]))
    a.circle(1330, 250, 420, fill=a.radial([(0, kit.HILITE, 0.3), (1, kit.HILITE, 0)]))
    d = slab(a, 60, 70, 1480, 360, 0.1)
    a.path(d, fill="#000", opacity=0.45, transform="translate(8,14)", filter=a.blur(8))
    a.path(d, fill=kit.bone_grad(a), stroke=kit.INK, stroke_width=3)
    cl = a.clip(f'<path d="{d}"/>')
    a.open("g", clip_path=cl)
    kit.grain_lines(a, 40, 60, 1520, 380, 26, "#8a7350", 0.35, amp=5, sw=0.9)
    a.stipple(60, 70, 1480, 360, n=500, r=(0.4, 1.2), fill="#7a6344", opacity=0.3)
    a.close()
    # border: a scratched line with tick hatching, as on a sailor's tooth
    inner = slab(a, 92, 96, 1416, 308, 0.1)
    kit.scratch(a, inner, sw=1.8)
    # small line
    kit.caps(a, 800, 168, "A JOURNEY INTO THE", size=34, spacing=16, fill=kit.INK)
    for sx in (-1, 1):
        kit.scratch(a, f"M{800 + sx * 350},157 h{sx * 150}", sw=1.6)
        kit.scratch(a, f"M{800 + sx * 350},163 h{sx * 90}", sw=0.9, light=None)
    # the word
    grad = a.gradient([(0, kit.MARROW), (0.38, kit.MARROW2), (0.56, "#6a2845"), (0.75, kit.RIVER), (1, kit.DEEP)], x2=1, y2=0)
    hp = kit.hatch_pat(a, "#f6ecd6", spacing=7, sw=1.5, ang=32, opacity=0.55)
    hp2 = kit.hatch_pat(a, kit.INK, spacing=11, sw=1.1, ang=-40, opacity=0.35)
    kw = dict(size=176, family="serif", text_anchor="middle", font_weight="bold", textLength=1230,
              lengthAdjust="spacingAndGlyphs")
    a.text(804, 325, "HEARTSTREAM", fill="#fffaf0", opacity=0.75, **kw)
    a.text(800, 320, "HEARTSTREAM", fill=grad, **kw)
    a.text(800, 320, "HEARTSTREAM", fill=hp, **kw)
    a.text(800, 320, "HEARTSTREAM", fill=hp2, **kw)
    a.text(800, 320, "HEARTSTREAM", fill="none", stroke=kit.INK, stroke_width=2.6, stroke_linejoin="round", **kw)
    # vessel line under the word: raft glyph toward a small heart
    pts = [(210 + i * 40, 360 + 5 * math.sin(i * 0.9)) for i in range(29)]
    kit.scratch(a, a.smooth_d(pts), sw=2.2, ink=kit.RIVER)
    for i in (5, 11, 17, 22):
        x, y = pts[i]
        kit.scratch(a, f"M{f(x)},{f(y)} q14,{-18 if i % 2 else 18} 34,{-24 if i % 2 else 24}", sw=1.2, ink=kit.RIVER, light=None)
    a.path("M700,358 l-20,-10 h40 z", fill=kit.BONE, stroke=kit.INK, stroke_width=1.6)
    a.path(kit.heart_d(1352, 358, 13), fill=kit.GOLD, stroke=kit.INK, stroke_width=1.8)
    kit.caps(a, 800, 396, "THE RITE OF THE BLUE-BORN", size=17, spacing=9, fill="#4a3a2a")
    # the six marks, three at each end, rubbed red
    for i, m in enumerate(kit.MARKS):
        left = i < 3
        cx = (150 if left else 1450) + (0 if i % 3 == 1 else (26 if left else -26))
        cy = 160 + (i % 3) * 90
        a.circle(cx, cy, 30, fill="#f7efdc", stroke=kit.INK, stroke_width=1.4)
        kit.draw_mark(a, m, cx, cy, 19, color=kit.DEEP, sw=3.6, light="#fffaf0")
    a.vignette(0.5)


def motif(a, n, cx, cy, s):
    """A small engraved sign for each chapter."""
    sc = lambda d, **kw: kit.scratch(a, d, sw=2.0, **kw)
    if n == 0:      # lamp
        kit.lamp(a, cx, cy + 12, s / 30, lit=1.0, glow=kit.GOLD)
    elif n == 1:    # the hook
        sc(f"M{cx - s * .5},{cy - s * .6} L{cx + s * .1},{cy + s * .3} C{cx + s * .4},{cy + s * .8} {cx + s},{cy + s * .3} {cx + s * .6},{cy - s * .1}")
        sc(f"M{cx - s * .7},{cy - s * .45} l{s * .35},{-s * .25}")
    elif n == 2:    # beads on a strand
        hs = [0.4, -0.2, 0.1, -0.5, 0.5]
        pts = [(cx - s + i * s * .5, cy + h * s) for i, h in enumerate(hs)]
        sc(kit.P(pts), light=None)
        for i, (x, y) in enumerate(pts):
            a.circle(x, y, s * .16, fill=[kit.GLOW, kit.BONE, kit.HILITE, kit.GOLD, kit.GOLD][i], stroke=kit.INK, stroke_width=1.6)
    elif n == 3:    # the bench with an empty seat
        sc(f"M{cx - s},{cy + s * .4} H{cx + s}")
        for i in (-3, -1, 3):
            sc(f"M{cx + i * s * .28 - s * .12},{cy + s * .4} q{s * .12},{-s * .9} {s * .24},0")
        sc(f"M{cx + s * .16},{cy + s * .4} q{s * .12},{-s * .9} {s * .24},0", stroke_dasharray="2 5", light=None)
    elif n == 4:    # a hand on the wall
        a.path(kit.hand_d(cx, cy + s * .25, s / 62), fill="none", stroke=kit.INK, stroke_width=1.8, stroke_linejoin="round")
    elif n == 5:    # wave
        for k in range(3):
            sc(f"M{cx - s},{cy - s * .3 + k * s * .4} q{s * .5},{-s * .5} {s},0 t{s},0", light=None if k else "#fffaf0", ink=kit.RIVER if k == 0 else kit.INK)
    elif n == 6:    # the delta
        sc(f"M{cx - s},{cy} H{cx - s * .2} L{cx + s},{cy - s * .7} M{cx - s * .2},{cy} L{cx + s},{cy} M{cx - s * .2},{cy} L{cx + s},{cy + s * .7}", ink=kit.RIVER)
    elif n == 7:    # the heart
        a.path(kit.heart_d(cx, cy, s * .62), fill=kit.GOLD, stroke=kit.INK, stroke_width=2)
        for k in range(7):
            an = math.radians(-160 + k * 23.3)
            sc(f"M{f(cx + math.cos(an) * s * .95)},{f(cy - s * .05 + math.sin(an) * s * .95)} l{f(math.cos(an) * s * .3)},{f(math.sin(an) * s * .3)}", light=None)
    else:           # one, alone
        a.circle(cx, cy, s * .2, fill=kit.RIVER, stroke=kit.INK, stroke_width=2)
        sc(kit.circ_d(cx, cy, s * .7), stroke_dasharray="3 9", light=None)


for _i in range(9):
    def _numeral(a: Art, i=_i):
        a.rect(0, 0, a.w, a.h, fill=kit.RAMP[i])
        a.paper("none", grain=0.3)
        a.circle(150, 150, 190, fill=a.radial([(0, "#fff", 0.16), (1, "#fff", 0)]))
        d = kit.blob_d(a, 150, 150, 122, 128, n=10, jitter=0.05)
        a.path(d, fill="#000", opacity=0.4, transform="translate(4,8)")
        a.path(d, fill=kit.bone_grad(a), stroke=kit.INK, stroke_width=2.6)
        cl = a.clip(f'<path d="{d}"/>')
        a.open("g", clip_path=cl)
        kit.grain_lines(a, 20, 20, 260, 260, 12, "#8a7350", 0.35, amp=4, vertical=True)
        a.close()
        kit.scratch(a, kit.circ_d(150, 150, 104), sw=1.5)
        n = 36
        ticks = "".join(f"M{f(150 + 96 * math.cos(t))},{f(150 + 96 * math.sin(t))} L{f(150 + 103 * math.cos(t))},{f(150 + 103 * math.sin(t))}"
                        for t in [2 * math.pi * k / n for k in range(n)])
        a.path(ticks, stroke=kit.INK, stroke_width=1.2, fill="none")
        num = kit.ROMAN[i]
        size = 104 if len(num) < 3 else (88 if len(num) == 3 else 72)
        hp = kit.hatch_pat(a, "#f6ecd6", spacing=6, sw=1.3, ang=32, opacity=0.6)
        fillc = kit.RAMP[i] if i != 3 else "#4a3560"
        kw = dict(size=size, family="serif", text_anchor="middle", font_weight="bold")
        a.text(152, 152 + 3, num, fill="#fffaf0", opacity=0.8, **kw)
        a.text(150, 152, num, fill=fillc, **kw)
        a.text(150, 152, num, fill=hp, **kw)
        a.text(150, 152, num, fill="none", stroke=kit.INK, stroke_width=2, stroke_linejoin="round", **kw)
        motif(a, i, 150, 202, 30)
    _numeral.__doc__ = (f"Chapter numeral {kit.ROMAN[_i]} for {kit.CHAPTERS[_i]}: a Roman numeral scratched into a "
                        f"disc of bone and rubbed with the chapter's colour, a small engraved sign beneath it.")
    asset(G, f"numeral-{_i + 1}", group="title", title=f"Chapter numeral {kit.ROMAN[_i]}: {kit.CHAPTERS[_i]}", w=300,
          h=300, row=ROW)(_numeral)

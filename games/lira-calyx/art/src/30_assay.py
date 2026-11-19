"""The Assay's bench: the scope, the cuvette, six reagent vials and the standard."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, INK, PENCIL, SEAL, PAPER, PHOS, COLD = kit.G, kit.INK, kit.PENCIL, kit.SEAL, kit.PAPER, kit.PHOS, kit.COLD
ROW = "Assay bench"


def bench(a: Art, horizon=0.78):
    """A dark bench under one lamp, the scope's graticule ghosted on the wall behind."""
    a.paper(kit.BENCH, grain=0.2)
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#3a4a44", 0.9), (1, "#1d2221", 0)], 0.5, 0.35, 0.75))
    a.grid(0, 0, a.w, a.h * horizon, 20, stroke=PHOS, stroke_width=0.5, opacity=0.13)
    y = a.h * horizon
    a.rect(0, y, a.w, a.h - y, fill="#120f0c")
    a.rect(0, y, a.w, a.h - y, fill=a.gradient([(0, "#4a3a2a"), (1, "#17120e")]), opacity=0.9)
    a.line(0, y, a.w, y, stroke="#7a6248", stroke_width=1.5)
    return y


def tag(a: Art, x, y, w, h, rot=0):
    a.open("g", transform=f"rotate({rot} {x} {y})")
    a.rect(x, y, w, h, fill=PAPER, stroke=INK, stroke_width=1.6)
    a.rect(x, y, w, h, fill="#7a5a2e", opacity=0.12)


def glass(a: Art, d, liquid, level, box, sediment=None):
    """A glass vessel from outline path d: liquid to `level` (y), meniscus, a lit edge."""
    x0, y0, x1, y1 = box
    cp = a.clip(f'<path d="{d}"/>')
    a.path(d, fill="#dff2ee", fill_opacity=0.1)
    a.open("g", clip_path=cp)
    a.rect(x0, level, x1 - x0, y1 - level, fill=liquid, opacity=0.82)
    a.rect(x0, level, (x1 - x0) * 0.3, y1 - level, fill="#fff", opacity=0.16)
    a.rect(x0 + (x1 - x0) * 0.72, level, (x1 - x0) * 0.28, y1 - level, fill="#000", opacity=0.22)
    a.ellipse((x0 + x1) / 2, level, (x1 - x0) / 2, 5, fill="#fff", opacity=0.35)
    if sediment:
        a.stipple(x0, y1 - 26, x1 - x0, 24, n=70, r=(1, 2.6), fill=sediment, opacity=0.9)
    a.close()
    a.path(d, fill="none", stroke=COLD, stroke_width=2.6, stroke_linejoin="round", opacity=0.92)
    a.path(d, fill="none", stroke=PHOS, stroke_width=1, opacity=0.5, transform="translate(-2,0)")


def spectrum_glyph(a: Art, x, y, kind):
    """What the reagent does to a peak, as Lira would sketch it on the label."""
    def peak(px, hgt, **kw):
        kit.curve(a, [(px - 12, y), (px - 4, y - 2), (px, y - hgt), (px + 4, y - 2), (px + 12, y)], w=1.8, **kw)
    a.line(x, y, x + 74, y, stroke=INK, stroke_width=1.2)
    if kind == "suppress":
        peak(x + 20, 24, stroke=PENCIL)
        peak(x + 20, 7)
        a.path(f"M{x + 46},{y - 26} v16 m-5,-6 l5,6 l5,-6", stroke=SEAL, stroke_width=1.8, fill="none")
    elif kind == "shift-right":
        peak(x + 18, 22, stroke=PENCIL)
        peak(x + 46, 22)
        a.path(f"M{x + 24},{y - 28} h16 m-6,-5 l6,5 l-6,5", stroke=SEAL, stroke_width=1.8, fill="none")
    elif kind == "shift-left":
        peak(x + 52, 22, stroke=PENCIL)
        peak(x + 24, 22)
        a.path(f"M{x + 46},{y - 28} h-16 m6,-5 l-6,5 l6,5", stroke=SEAL, stroke_width=1.8, fill="none")
    elif kind == "split":
        peak(x + 36, 24, stroke=PENCIL)
        peak(x + 22, 15)
        peak(x + 50, 15)
    elif kind == "raise":
        peak(x + 24, 10, stroke=PENCIL)
        peak(x + 24, 26)
        a.path(f"M{x + 52},{y - 8} v-16 m-5,6 l5,-6 l5,6", stroke=SEAL, stroke_width=1.8, fill="none")
    else:  # quench all but one
        for px in (x + 12, x + 30, x + 62):
            peak(px, 5, stroke=PENCIL)
        peak(x + 46, 26)


@asset(G, "assay-scope", group="pieces", title="The scope", w=640, h=480, row=ROW)
def scope(a: Art):
    """The oscilloscope on the bench: a slate case with a round-cornered screen, a phosphor-green
    spectrum on the graticule with the cursor set on its tallest peak, three knobs, and a paper tag
    tied to the handle in Lira's figures: 452 nm."""
    r = a.rng
    by = bench(a, 0.84)
    a.ellipse(320, by + 14, 270, 18, fill="#000", opacity=0.5, filter=a.blur(8))
    a.rect(60, 70, 520, 336, rx=22, fill="#39424a", stroke=INK, stroke_width=3)
    a.rect(60, 70, 520, 30, rx=14, fill="#55616b", opacity=0.6)
    a.hatch(60, 330, 520, 76, angle=20, spacing=5, stroke="#000", stroke_width=0.8, opacity=0.35,
            clip=a.clip('<rect x="60" y="330" width="520" height="76" rx="20"/>'))
    for x in (94, 546):
        a.rect(x - 14, 406, 28, 16, fill="#14181b")
    sx, sy, sw, sh = 92, 104, 330, 250
    a.rect(sx - 10, sy - 10, sw + 20, sh + 20, rx=20, fill="#14181b", stroke=INK, stroke_width=2)
    a.rect(sx, sy, sw, sh, rx=14, fill="#06120b")
    cp = a.clip(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" rx="14"/>')
    a.open("g", clip_path=cp)
    a.rect(sx, sy, sw, sh, fill=a.radial([(0, "#124a26", 0.8), (1, "#06120b", 0)], 0.5, 0.5, 0.7))
    a.grid(sx, sy, sw, sh, sw / 10, stroke=PHOS, stroke_width=0.6, opacity=0.35)
    peaks = [(0.22, 0.45, 0.02), (0.44, 0.9, 0.016), (0.63, 0.3, 0.03), (0.82, 0.55, 0.018)]

    def val(t):
        return sum(hh * math.exp(-((t - c) / s) ** 2) for c, hh, s in peaks)
    pts = [(sx + sw * k / 160, sy + sh - 34 - (val(k / 160) + r.uniform(-0.012, 0.012)) * (sh - 70)) for k in range(161)]
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)
    a.path(d, fill="none", stroke=PHOS, stroke_width=7, opacity=0.35, filter=a.blur(4))
    a.path(d, fill="none", stroke="#d8ffe0", stroke_width=2)
    cx = sx + sw * 0.44
    a.line(cx, sy, cx, sy + sh, stroke="#ffe27a", stroke_width=1.4, stroke_dasharray="5 4")
    a.text(cx + 8, sy + 26, "452.0 nm", size=17, family="monospace", fill="#ffe27a")
    a.close()
    a.path(f"M{sx + 16},{sy + 10} q60,-6 130,0", stroke="#fff", stroke_width=5, opacity=0.12, fill="none", stroke_linecap="round")
    for k, (kx, ky, ang) in enumerate([(486, 150, -40), (486, 238, 30), (486, 326, 110)]):
        a.circle(kx, ky, 30, fill="#14181b", stroke=INK, stroke_width=2)
        a.circle(kx, ky, 22, fill=a.radial([(0, "#8a949c", 1), (1, "#3c444a", 1)], 0.35, 0.35, 0.8))
        t = math.radians(ang)
        a.line(kx, ky, kx + 20 * math.cos(t), ky + 20 * math.sin(t), stroke=COLD, stroke_width=3.5, stroke_linecap="round")
        for q in range(-150, 151, 30):
            tt = math.radians(q - 90)
            a.line(kx + 34 * math.cos(tt), ky + 34 * math.sin(tt), kx + 38 * math.cos(tt), ky + 38 * math.sin(tt), stroke=COLD, stroke_width=1.2)
        kit.label(a, kx + 40, ky + 5, ["nm", "gain", "pulse"][k], 13, COLD)
    a.circle(548, 96, 6, fill=SEAL)
    a.path("M300,70 q-30,-34 30,-40 q70,2 34,40", fill="none", stroke=INK, stroke_width=7, stroke_linecap="round")
    a.path("M352,44 q60,10 96,-4", stroke="#b9a078", stroke_width=1.6, fill="none")
    tag(a, 440, 22, 118, 46, 6)
    a.circle(450, 45, 3.5, fill=kit.BENCH)
    kit.lira_fig(a, "452", 462, 56, 20)
    kit.lira(a, 518, 56, "nm", 20)
    a.close()


@asset(G, "assay-cuvette", group="pieces", title="The cuvette", w=240, h=320, row=ROW)
def cuvette(a: Art):
    """A square glass cuvette in its brass clamp with a sliver of crystalline bark hanging in the
    liquid; a cyan beam enters from the left and leaves the far side fanned into bands."""
    by = bench(a)
    a.poly([(0, 150), (86, 156), (86, 176), (0, 182)], fill=kit.CYAN, opacity=0.5)
    for k, c in enumerate(("#c2338f", "#ffe27a", PHOS, kit.CYAN, kit.VIOLET)):
        a.poly([(154, 160 + k * 3), (240, 110 + k * 24), (240, 132 + k * 24), (154, 164 + k * 3)], fill=c, opacity=0.5)
    a.ellipse(120, by + 6, 62, 9, fill="#000", opacity=0.5, filter=a.blur(4))
    a.rect(70, by - 22, 100, 22, fill="#8a6a3a", stroke=INK, stroke_width=2.4)
    a.rect(60, by - 8, 120, 12, fill="#6b5028", stroke=INK, stroke_width=2.4)
    d = f"M86,70 V{by - 22} H154 V70"
    glass(a, d + "Z", "#6fb7b0", 104, (86, 70, 154, by - 22))
    a.line(80, 70, 160, 70, stroke=COLD, stroke_width=3.4, stroke_linecap="round")
    a.line(120, 40, 120, 132, stroke="#b9a078", stroke_width=1.4)
    a.facets(120, 158, 17, [kit.BONE, "#f6f8f4", kit.OCHRE, "#d9c9a2"], n=6, stroke=INK, stroke_width=1.4, stroke_linejoin="round")
    a.circle(120, 160, 30, fill="#fff", opacity=0.25, filter=a.blur(8))
    a.rect(100, 30, 40, 12, fill="#8a6a3a", stroke=INK, stroke_width=2)
    kit.label(a, 12, 304, "SAMPLE  MASS 6", 12, COLD)


VIALS = [
    ("r1", "suppress", kit.CYAN, "tube", "A tall corked tube of river-cyan reagent"),
    ("r2", "shift-right", kit.OCHRE, "flask", "A round-bottomed flask of ochre reagent with a little sediment"),
    ("r3", "shift-left", kit.VIOLET, "square", "A square bottle of violet reagent under a ground-glass stopper"),
    ("r4", "split", "#7fae4a", "cone", "A conical flask of moss-green reagent"),
    ("r5", "raise", "#c2338f", "ampoule", "A sealed ampoule of magenta phase dye, score mark on its neck"),
    ("r6", "quench", "#d9d2c0", "dropper", "A squat dropper bottle of clear quench, the rubber teat perished"),
]


def _vessel(a: Art, shape, by):
    if shape == "tube":
        return f"M62,56 V{by - 34} Q62,{by - 6} 80,{by - 6} Q98,{by - 6} 98,{by - 34} V56 Z", (62, 56, 98, by - 6), 96
    if shape == "flask":
        return (f"M68,54 V112 Q28,134 30,{by - 52} Q34,{by - 6} 80,{by - 6} Q126,{by - 6} 130,{by - 52} Q132,134 92,112 V54 Z",
                (30, 54, 130, by - 6), 150)
    if shape == "square":
        return f"M66,60 V96 H42 V{by - 6} H118 V96 H94 V60 Z", (42, 60, 118, by - 6), 128
    if shape == "cone":
        return f"M68,56 V110 L30,{by - 12} Q28,{by - 6} 36,{by - 6} H124 Q132,{by - 6} 130,{by - 12} L92,110 V56 Z", (28, 56, 132, by - 6), 162
    if shape == "ampoule":
        return (f"M76,26 Q80,18 84,26 L88,70 Q84,80 92,92 Q106,104 106,130 V{by - 26} Q106,{by - 6} 80,{by - 6} Q54,{by - 6} 54,{by - 26} "
                f"V130 Q54,104 68,92 Q76,80 72,70 Z", (54, 20, 106, by - 6), 140)
    return f"M64,96 V116 Q40,124 40,150 V{by - 6} H120 V150 Q120,124 96,116 V96 Z", (40, 96, 120, by - 6), 164


for _i, (_id, _kind, _col, _shape, _doc) in enumerate(VIALS):
    def _vial(a: Art, i=_i, kind=_kind, col=_col, shape=_shape):
        by = bench(a)
        a.ellipse(80, by + 4, 54, 8, fill="#000", opacity=0.5, filter=a.blur(4))
        d, box, level = _vessel(a, shape, by)
        glass(a, d, col, level, box, sediment="#6b4a12" if shape == "flask" else None)
        if shape in ("tube", "flask", "cone"):
            a.poly([(box[0] + (30 if shape != "tube" else -4), 58), (box[0] + (34 if shape != "tube" else 0), 30),
                    (box[2] - (34 if shape != "tube" else 0), 30), (box[2] - (30 if shape != "tube" else -4), 58)],
                   fill="#a07a4a", stroke=INK, stroke_width=2)
            a.stipple(60, 32, 40, 24, n=26, r=(0.6, 1.4), fill=INK, opacity=0.6)
        elif shape == "square":
            a.rect(62, 44, 36, 18, fill="#dff2ee", fill_opacity=0.3, stroke=COLD, stroke_width=2.4, rx=4)
            a.circle(80, 34, 12, fill="#dff2ee", fill_opacity=0.3, stroke=COLD, stroke_width=2.4)
        elif shape == "ampoule":
            a.line(70, 74, 90, 74, stroke=SEAL, stroke_width=2)
        else:
            a.rect(60, 80, 40, 18, fill="#2a2622", stroke=INK, stroke_width=2)
            a.path("M68,80 Q62,44 80,40 Q98,44 92,80 Z", fill="#7a3a2e", stroke=INK, stroke_width=2)
            a.path("M72,58 l6,6 M84,52 l5,7 M76,70 l4,4", stroke=INK, stroke_width=1)
            a.line(80, 98, 80, by - 40, stroke=COLD, stroke_width=3, opacity=0.6)
        ly = by - 86
        tag(a, 36, ly, 88, 56, -3 + i)
        kit.stroke_text(a, f"R{i + 1}", 42, ly + 20, 13, w=1.7, slant=0.2, cross7=True)
        spectrum_glyph(a, 43, ly + 50, kind)
        a.close()
        for k in range(6):
            a.circle(22 + k * 10, 266, 3.2, fill=PHOS if k == i else "none", stroke=PHOS, stroke_width=1, opacity=0.8)
    _vial.__doc__ = (f"{_doc} on the dark bench, its paper label numbered R{_i + 1} in Lira's hand with a small "
                     f"sketch of what it does to a peak.")
    asset(G, f"assay-vial-{_id}", group="pieces", title=f"Reagent vial R{_i + 1}", w=160, h=280, row=ROW)(_vial)


@asset(G, "assay-standard", group="pieces", title="The standard", w=240, h=320, row=ROW)
def standard(a: Art):
    """The standard: Lira's own Book I bark sample, a faceted sliver mounted on a card slide and
    propped against a brass block, its 452 nm line pencilled on the card and one green peak ghosted
    on the wall behind."""
    by = bench(a)
    pts = [(30 + k * 3, 120 - 70 * math.exp(-((k - 30) / 4.2) ** 2)) for k in range(61)]
    a.path(a.smooth_d(pts), fill="none", stroke=PHOS, stroke_width=6, opacity=0.3, filter=a.blur(3))
    a.path(a.smooth_d(pts), fill="none", stroke=PHOS, stroke_width=1.6, opacity=0.8)
    a.ellipse(126, by + 6, 80, 9, fill="#000", opacity=0.5, filter=a.blur(4))
    a.rect(150, by - 60, 60, 60, fill="#8a6a3a", stroke=INK, stroke_width=2.4)
    a.rect(150, by - 60, 60, 12, fill="#b99a5a", opacity=0.7)
    a.open("g", transform=f"rotate(-14 110 {by})")
    a.rect(52, by - 182, 116, 182, fill=PAPER, stroke=INK, stroke_width=2.2)
    a.rect(52, by - 182, 116, 182, fill="#7a5a2e", opacity=0.14)
    a.rect(66, by - 150, 88, 78, fill="#14181b", stroke=INK, stroke_width=1.6)
    a.facets(110, by - 112, 20, [kit.BONE, "#f6f8f4", kit.OCHRE, "#d9c9a2", "#fff"], n=7, stroke=INK, stroke_width=1.3, stroke_linejoin="round")
    a.circle(110, by - 112, 34, fill=kit.OCHRE, opacity=0.25, filter=a.blur(8))
    kit.lira(a, 64, by - 160, "standard", 17)
    kit.lira_fig(a, "452", 66, by - 44, 18, color=PENCIL)
    kit.lira(a, 116, by - 44, "nm", 18, PENCIL)
    kit.lira(a, 66, by - 18, "Book I, bark", 15)
    a.close()
    kit.label(a, 12, 304, "RUN FIRST  COST 1", 12, COLD)

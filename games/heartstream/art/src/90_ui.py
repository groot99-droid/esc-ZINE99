"""UI ornaments: the beat rim, four temperament glyphs, the emote wheel, the vessel line and three frames."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "UI ornaments: beat rim, 4 glyphs, emote wheel, vessel line, frames"
INK = kit.INK


@asset(G, "ui-beat-rim", group="ui", title="The beat rim", w=1600, h=900, row=ROW)
def beat_rim(a: Art):
    """The beat rim that glows round every page on the heartbeat: a thin red-gold line with a soft halo, a pulse
    cut into it at the middle of each side, and the page itself left clear."""
    d = "M40,14 H1560 Q1586,14 1586,40 V860 Q1586,886 1560,886 H40 Q14,886 14,860 V40 Q14,14 40,14Z"
    a.path(d, fill="none", stroke=kit.RIVER, stroke_width=26, filter=a.blur(12), opacity=0.8)
    a.path(d, fill="none", stroke=kit.HILITE, stroke_width=9, filter=a.blur(3), opacity=0.9)
    a.path(d, fill="none", stroke=kit.GOLD, stroke_width=2.6)
    pulse = "l10,-22 l14,44 l10,-22"
    a.path(f"M740,14 h43 {pulse} h43 M740,886 h43 {pulse} h43", fill="none", stroke="#fff3d0", stroke_width=3, stroke_linejoin="round")
    a.path("M14,400 v33 l-18,10 l36,14 l-18,10 v33 M1586,400 v33 l18,10 l-36,14 l18,10 v33", fill="none", stroke="#fff3d0", stroke_width=3, stroke_linejoin="round")
    for (x, y) in ((40, 40), (1560, 40), (40, 860), (1560, 860)):
        a.circle(x, y, 30, fill=a.radial([(0, kit.GOLD, 0.8), (1, kit.GOLD, 0)]))
        a.circle(x, y, 4, fill="#fff3d0")
    kit.gouges(a, 30, 30, 1540, 840, 180, kit.HILITE, ang=None, ln=(6, 16), sw=2.2, opacity=0.5,
               density=lambda x, y: 1.0 if min(x - 14, 1586 - x, y - 14, 886 - y) < 34 else 0.0)


for _name, _col in kit.TEMPERS:
    def _glyph(a: Art, name=_name, col=_col):
        a.rect(0, 0, 160, 160, fill=kit.NIGHT)
        a.paper("none", grain=0.25)
        d = kit.blob_d(a, 80, 80, 64, 66, n=10, jitter=0.04)
        a.path(d, fill="#000", opacity=0.5, transform="translate(3,5)")
        a.path(d, fill=kit.bone_grad(a), stroke=INK, stroke_width=2.2)
        cl = a.clip(f'<path d="{d}"/>')
        a.open("g", clip_path=cl)
        kit.grain_lines(a, 10, 10, 140, 140, 7, "#8a7350", 0.4, amp=4)
        a.close()
        kit.scratch(a, kit.circ_d(80, 80, 52), sw=1.3)
        a.circle(80, 80, 44, fill=a.radial([(0, col, 0.45), (1, col, 0)]))
        kit.temper_glyph(a, name, 82, 84 if name != "fears" else 82, 30, "#fffaf0", sw=9)
        kit.temper_glyph(a, name, 80, 82 if name != "fears" else 80, 30, INK, sw=8.5)
        dark = {"laughs": "#b0731a", "argues": "#b33a1e", "dreams": kit.MARROW2, "fears": "#8a7350"}[name]
        kit.temper_glyph(a, name, 80, 82 if name != "fears" else 80, 30, dark, sw=5)
        # the stripe shape that goes with the colour
        sx, sy = 80, 136
        if name == "laughs":
            a.circle(sx, sy, 5, fill=INK)
        elif name == "argues":
            a.poly([(sx - 6, sy + 5), (sx, sy - 6), (sx + 6, sy + 5)], fill=INK)
        elif name == "dreams":
            a.poly([(sx - 6, sy), (sx, sy - 6), (sx + 6, sy), (sx, sy + 6)], fill=INK)
        else:
            a.rect(sx - 5, sy - 5, 10, 10, fill=INK)
    _glyph.__doc__ = f"The glyph of the one who {_name}, cut into a disc of bone and rubbed with his seat colour, with the small shape that marks his stripe."
    asset(G, f"ui-glyph-{_name}", group="ui", title=f"Temperament glyph: {_name}", w=160, h=160, row=ROW)(_glyph)


@asset(G, "ui-emote-wheel", group="ui", title="The emote wheel", w=480, h=480, row=ROW)
def emote_wheel(a: Art):
    """The emote wheel: a ring of bone cut into four quarters, laugh, argue, dream and fear, each glyph rubbed with
    its seat colour, around a small heart at the hub."""
    cx = cy = 240
    a.circle(cx, cy, 236, fill=a.radial([(0.7, "#000", 0.55), (1, "#000", 0)]))
    a.circle(cx, cy, 206, fill=kit.bone_grad(a), stroke=INK, stroke_width=4)
    cl = a.clip(f'<circle cx="{cx}" cy="{cy}" r="206"/>')
    a.open("g", clip_path=cl)
    kit.grain_lines(a, 30, 30, 420, 420, 18, "#8a7350", 0.35, amp=5)
    a.close()
    a.circle(cx, cy, 78, fill=kit.NIGHT, stroke=INK, stroke_width=4)
    for k, (name, col) in enumerate(kit.TEMPERS):
        an = math.radians(-90 + k * 90)
        gx, gy = cx + 142 * math.cos(an), cy + 142 * math.sin(an)
        a.circle(gx, gy, 62, fill=a.radial([(0, col, 0.55), (1, col, 0)]))
        kit.temper_glyph(a, name, gx + 2, gy + 3, 30, "#fffaf0", sw=9)
        kit.temper_glyph(a, name, gx, gy, 30, INK, sw=8)
        dark = {"laughs": "#b0731a", "argues": "#b33a1e", "dreams": kit.MARROW2, "fears": "#8a7350"}[name]
        kit.temper_glyph(a, name, gx, gy, 30, dark, sw=4.5)
        a2 = an + math.pi / 4
        kit.scratch(a, f"M{f(cx + 80 * math.cos(a2))},{f(cy + 80 * math.sin(a2))} L{f(cx + 204 * math.cos(a2))},{f(cy + 204 * math.sin(a2))}", sw=2.6)
    kit.scratch(a, kit.circ_d(cx, cy, 194), sw=1.4)
    n = 60
    a.path("".join(f"M{f(cx + 196 * math.cos(t))},{f(cy + 196 * math.sin(t))} L{f(cx + 203 * math.cos(t))},{f(cy + 203 * math.sin(t))}"
                   for t in [2 * math.pi * k / n for k in range(n)]), stroke=INK, stroke_width=1.4, fill="none")
    a.circle(cx, cy, 60, fill=a.radial([(0, kit.HILITE, 0.7), (1, kit.HILITE, 0)]))
    a.path(kit.heart_d(cx, cy, 22), fill=kit.GOLD, stroke=INK, stroke_width=3)


@asset(G, "ui-vessel-line", group="ui", title="The vessel line", w=1600, h=120, row=ROW)
def vessel_line(a: Art):
    """The vessel line that runs along the top of the 2D views: a thin red vessel with its side branches, the raft's
    glyph partway along it, and a small gold heart at the end. No number anywhere."""
    a.rect(0, 0, 1600, 120, fill=kit.KEY)
    a.paper("none", grain=0.2)
    pts = [(70 + i * 50, 60 + 5 * math.sin(i * .8)) for i in range(29)]
    d = a.smooth_d(pts)
    a.path(d, fill="none", stroke=kit.RIVER, stroke_width=9, stroke_linecap="round")
    a.path(d, fill="none", stroke=kit.HILITE, stroke_width=3, stroke_linecap="round")
    a.path(d, fill="none", stroke=kit.KEY, stroke_width=3, stroke_dasharray="1 24", opacity=0.6)
    for i in (4, 9, 13, 18, 23):
        x, y = pts[i]
        s = 1 if i % 2 else -1
        a.path(f"M{f(x)},{f(y)} q16,{s * 14} 44,{s * 26} m-20,{-s * 12} q14,{-s * 2} 24,{-s * 10}", fill="none", stroke=kit.RIVER, stroke_width=3, stroke_linecap="round", opacity=0.8)
    rx, ry = pts[11]
    a.circle(rx, ry, 30, fill=a.radial([(0, kit.BONE, 0.5), (1, kit.BONE, 0)]))
    a.path(f"M{f(rx)},{f(ry + 12)} l-24,-14 l6,-10 h36 l6,10 z", fill=kit.BONE, stroke=INK, stroke_width=2.5, stroke_linejoin="round")
    for k in range(4):
        a.circle(rx - 15 + k * 10, ry - 16, 3.6, fill=kit.GLOW, stroke=INK, stroke_width=1.2)
    a.circle(1510, 60, 44, fill=a.radial([(0, kit.GOLD, 0.7), (1, kit.GOLD, 0)]))
    a.path(kit.heart_d(1510, 60, 18), fill=kit.GOLD, stroke=INK, stroke_width=2.5)


def rope(a, x, y, w, h, ink=INK, sw=3):
    a.rect(x, y, w, h, fill="none", stroke=ink, stroke_width=sw * .55)
    a.rect(x + sw * 2, y + sw * 2, w - sw * 4, h - sw * 4, fill="none", stroke=ink, stroke_width=sw, stroke_dasharray=f"{sw * .5} {sw * 1.7}")


@asset(G, "ui-frame-page", group="ui", title="Page frame (bone)", w=1600, h=900, row=ROW)
def frame_page(a: Art):
    """The frame of the 1D pages: a border of grained bone with a scratched rope line, the six marks set along the
    top and bottom rails, small hatched corners, and the page inside left clear."""
    outer = "M0,0 H1600 V900 H0Z M56,56 V844 H1544 V56Z"
    a.path(outer, fill=kit.IVORY, fill_rule="evenodd")
    cl = a.clip(f'<path d="{outer}" clip-rule="evenodd"/>')
    a.open("g", clip_path=cl)
    kit.grain_lines(a, 0, 0, 1600, 900, 40, "#8a7350", 0.35, amp=4)
    for (x, y) in ((0, 0), (1544, 0), (0, 844), (1544, 844)):
        a.hatch(x, y, 56, 56, angle=45, spacing=5, clip=a.clip(f'<rect x="{x + 6}" y="{y + 6}" width="44" height="44"/>'), stroke=INK, stroke_width=0.9, opacity=0.7)
    a.close()
    a.rect(1, 1, 1598, 898, fill="none", stroke=INK, stroke_width=2)
    a.rect(56, 56, 1488, 788, fill="none", stroke=INK, stroke_width=3)
    a.rect(50, 50, 1500, 800, fill="none", stroke=INK, stroke_width=3, stroke_dasharray="1.5 6")
    a.path("M70,28 H1530 M70,872 H1530 M28,70 V830 M1572,70 V830", stroke=INK, stroke_width=1.2, fill="none", stroke_dasharray="14 5")
    for i, m in enumerate(kit.MARKS):
        x = 320 + (i % 3) * 480
        y = 28 if i < 3 else 872
        a.circle(x, y, 19, fill="#f7efdc", stroke=INK, stroke_width=1.4)
        kit.draw_mark(a, m, x, y, 11, color=kit.DEEP, sw=2.6, light="#fffaf0")
    a.rect(56, 56, 1488, 788, fill="none", stroke="#000", stroke_width=10, opacity=0.12, transform="translate(4,5)")


@asset(G, "ui-frame-card", group="ui", title="Card frame (linocut)", w=300, h=420, row=ROW)
def frame_card(a: Art):
    """A small linocut frame for cards and tiles: a black border with the knife's chatter along its inner edge, a
    red beat mark at the top and a bare label strip at the foot."""
    outer = "M8,8 H292 V412 H8Z M30,30 V352 H270 V30Z"
    a.open("g", filter=a.roughen(2.4, 0.04))
    a.path(outer, fill=INK, fill_rule="evenodd")
    a.rect(30, 364, 240, 36, fill=kit.CREAM)
    a.close()
    kit.gouges(a, 12, 12, 276, 396, 150, kit.CREAM, ang=None, ln=(5, 12), sw=2.4,
               density=lambda x, y: 1.0 if (x < 26 or x > 274 or y < 26 or (352 < y < 362) or y > 402) else 0.0)
    a.path("M112,19 h22 l6,-9 l10,18 l6,-9 h22", fill="none", stroke=kit.RIVER, stroke_width=3.5, stroke_linejoin="round", stroke_linecap="round")
    kit.gouges(a, 34, 34, 232, 314, 40, INK, centre=(150, 190), ln=(6, 16), sw=2.6, density=lambda x, y: 1.0 if min(x - 30, 270 - x, y - 30, 352 - y) < 16 else 0.0)


@asset(G, "ui-frame-end-card", group="ui", title="End card frame", w=1600, h=900, row=ROW)
def frame_end(a: Art):
    """The frame of the end card: a dark border with a red and gold rule, a bone name plate at the foot, a round
    setting at the right for the gift that rode to the last frame, and the middle left clear for the picture."""
    outer = "M0,0 H1600 V900 H0Z M70,70 V700 H1530 V70Z"
    a.path(outer, fill=kit.KEY, fill_rule="evenodd")
    cl = a.clip(f'<path d="{outer}" clip-rule="evenodd"/>')
    a.open("g", clip_path=cl)
    kit.gouges(a, 0, 0, 1600, 900, 520, kit.DEEP, ang=0, spread=90, ln=(10, 30), sw=3)
    kit.gouges(a, 0, 700, 1600, 200, 120, kit.RIVER, ang=0, spread=8, ln=(30, 90), sw=2.6, opacity=0.6)
    a.close()
    a.rect(70, 70, 1460, 630, fill="none", stroke=kit.GOLD, stroke_width=3)
    a.rect(58, 58, 1484, 654, fill="none", stroke=kit.RIVER, stroke_width=5)
    a.rect(18, 18, 1564, 864, fill="none", stroke=kit.RIVER, stroke_width=2)
    for (x, y) in ((58, 58), (1542, 58), (58, 712), (1542, 712)):
        a.circle(x, y, 13, fill=kit.KEY, stroke=kit.GOLD, stroke_width=3)
        a.circle(x, y, 4, fill=kit.GOLD)
    # name plate
    plate = "M130,752 C400,738 900,742 1180,750 C1204,770 1204,822 1180,842 C900,852 400,850 130,842 C106,822 106,772 130,752Z"
    a.path(plate, fill="#000", opacity=0.5, transform="translate(5,8)")
    a.path(plate, fill=kit.bone_grad(a), stroke=INK, stroke_width=3)
    a.open("g", clip_path=a.clip(f'<path d="{plate}"/>'))
    kit.grain_lines(a, 100, 740, 1110, 110, 9, "#8a7350", 0.4, amp=4)
    a.close()
    kit.scratch(a, "M170,826 H1140", sw=1.4, stroke_dasharray="2 7", light=None)
    # the gift's setting
    a.circle(1380, 796, 84, fill=a.radial([(0, kit.GOLD, 0.55), (1, kit.GOLD, 0)]))
    a.circle(1380, 796, 62, fill=kit.NIGHT, stroke=kit.GOLD, stroke_width=3)
    a.circle(1380, 796, 70, fill="none", stroke=kit.BONE, stroke_width=2, stroke_dasharray="2 8")
    a.path(kit.heart_d(800, 44, 12), fill=kit.GOLD)

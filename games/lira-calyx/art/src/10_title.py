"""Title lettering and the two thread objects."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, INK, ARCH, PENCIL, BAR, SEAL = kit.G, kit.INK, kit.ARCH, kit.PENCIL, kit.BAR, kit.SEAL


def _gall(a: Art, x, y, s, size, length, **kw):
    """Iron-gall lettering: a brown halo where the ink bit the paper, then the dark stroke."""
    common = dict(size=size, family="serif", font_style="italic", textLength=length, lengthAdjust="spacingAndGlyphs", **kw)
    a.text(x, y, s, fill="#8a5a2c", stroke="#8a5a2c", stroke_width=size * 0.07, opacity=0.35, filter=a._halo, **common)
    a.text(x, y, s, fill=INK, stroke=INK, stroke_width=size * 0.012, filter=a._bite, **common)


@asset(G, "title-lettering", group="title", title="Title lettering", w=1600, h=500, row="Title lettering")
def title(a: Art):
    """The title in iron-gall ink on laid paper, between pencil guide lines; the black bar that covered
    the word Redacted is caught half lifted, hinged at its left end, its shadow still on the word."""
    r = a.rng
    kit.page(a, pool=0.3)
    a._halo, a._bite = a.blur(5), a.roughen(2.2, 0.35)
    for y in (96, 208, 268, 420):
        a.line(70, y, 1530, y + r.uniform(-1, 1), stroke=PENCIL, stroke_width=0.8, opacity=0.5)
    a.line(118, 40, 118, 470, stroke=SEAL, stroke_width=0.8, opacity=0.45)
    _gall(a, 150, 204, "The", 132, 200)
    _gall(a, 392, 204, "Redacted", 132, 500)
    _gall(a, 940, 204, "Testament", 132, 540)
    _gall(a, 300, 412, "of Lira Calyx", 196, 1010)
    # pen flourish under the name, running out of ink
    pts = [(300, 448), (520, 462), (800, 446), (1080, 460), (1330, 444), (1420, 430)]
    a.path(a.smooth_d(pts), fill="none", stroke=INK, stroke_width=5, stroke_linecap="round", filter=a._bite)
    a.path(a.smooth_d([(1420, 430), (1460, 418), (1492, 424)]), fill="none", stroke=INK, stroke_width=2,
           stroke_linecap="round", opacity=0.6)
    kit.blot(a, 1296, 300, 7)
    kit.blot(a, 236, 318, 4)
    # where the bar lay: a ghost of blue ruling and a grey shadow on the word
    a.path("M378,112H906M378,214H906", stroke=ARCH, stroke_width=1.2, opacity=0.7, fill="none")
    sh = a.blur(7)
    a.poly([(384, 118), (900, 92), (900, 150), (384, 208)], fill="#000", opacity=0.22, filter=sh)
    kit.bar(a, 384, 50, 524, 96, rot=-10.5)
    a.circle(384, 110, 4, fill=ARCH)
    kit.small_hand(a, 1240, 86, "the Peaks are—", 22)
    kit.label(a, 1404, 478, "page 1", 14, PENCIL)


@asset(G, "thread-own", group="thread", title="The correction in the margin", w=480, h=480, row="Thread")
def thread_own(a: Art):
    """A corner of a journal page: Lira's brown entry lines, and in the margin beside them a small
    left-slanted correction in blue-black ink, where nobody else should have been writing."""
    r = a.rng
    kit.page(a, pool=0.35)
    a.line(150, 0, 150, 480, stroke=SEAL, stroke_width=1, opacity=0.5)
    for i in range(9):
        y = 70 + i * 44
        a.line(20, y + 8, 460, y + 8, stroke=PENCIL, stroke_width=0.6, opacity=0.4)
        x = 166
        d = []
        while x < 440 - (60 if i == 8 else 0):
            wl = r.uniform(18, 64)
            pts = [(x + k * 6, y + r.uniform(-7, 3) * (k % 2)) for k in range(int(wl / 6) + 1)]
            d.append(a.smooth_d(pts))
            x += wl + 12
        a.path(" ".join(d), fill="none", stroke=INK, stroke_width=2.2, stroke_linecap="round", opacity=0.9)
    kit.lira_fig(a, "0.47", 300, 204, 22)
    a.path("M294,196 L372,188", stroke=ARCH, stroke_width=1.6, fill="none")
    # the correction
    a.path("M286,210 q-6,10 -18,12 L140,236", stroke=ARCH, stroke_width=1.3, fill="none")
    kit.stroke_text(a, "0.44", 62, 244, 20, color="#2c3f66", slant=-0.34, smooth=True, aspect=0.66, w=1.9)
    kit.small_hand(a, 30, 276, "re-sample.", 19, "#2c3f66")
    a.path("M28,286 q40,6 92,-2", stroke="#2c3f66", stroke_width=1.1, fill="none")
    a.circle(96, 300, 1.6, fill="#2c3f66")
    a.vignette(0.35, "#5a3c1a")


@asset(G, "thread-guest", group="thread", title="The unfinished game", w=480, h=480, row="Thread")
def thread_guest(a: Art):
    """A sketch from the journal: a small peg-and-counter board left mid-game on a bench, and a
    hand beside it closed around the one counter that was never played."""
    r = a.rng
    kit.page(a, pool=0.3)
    # the board in perspective, iron-gall
    A, B, C, D = (70, 250), (300, 190), (410, 290), (160, 372)
    kit.wash(a, "M" + " L".join(f"{x},{y}" for x, y in (A, B, C, D)) + "Z", kit.OCHRE, 0.28)
    kit.ink(a, [A, B, C, D], closed=True)
    kit.ink(a, [D, (160, 392), (410, 310), C], w=2.2)
    kit.ink(a, [A, (70, 268), (160, 392)], w=2.2)

    def at(u, v):
        x0, y0 = A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u
        x1, y1 = D[0] + (C[0] - D[0]) * u, D[1] + (C[1] - D[1]) * u
        return x0 + (x1 - x0) * v, y0 + (y1 - y0) * v
    for k in range(1, 5):
        a.line(*at(k / 5, 0.04), *at(k / 5, 0.96), stroke=INK, stroke_width=1, opacity=0.7)
        a.line(*at(0.04, k / 5), *at(0.96, k / 5), stroke=INK, stroke_width=1, opacity=0.7)
    played = [(0, 0, 1), (1, 1, 0), (2, 1, 1), (2, 2, 0), (3, 2, 1), (1, 3, 0), (4, 3, 1), (3, 4, 0), (0, 2, 0)]
    for i, j, dark in played:
        x, y = at((i + 0.5) / 5, (j + 0.5) / 5)
        a.ellipse(x, y + 2, 13, 7, fill=INK, opacity=0.35)
        a.ellipse(x, y - 2, 13, 7, fill=INK if dark else kit.BONE, stroke=INK, stroke_width=1.8)
    x, y = at(0.9, 0.9)
    a.ellipse(x, y, 13, 7, fill="none", stroke=PENCIL, stroke_width=1.4, stroke_dasharray="3 3")
    # the closed hand, seen from the side, resting on its little finger
    hx, hy = 290, 120
    kit.curve(a, [(hx - 250, hy - 52), (hx - 150, hy - 40), (hx - 96, hy - 30)], w=2.6)
    kit.curve(a, [(hx - 250, hy + 30), (hx - 150, hy + 34), (hx - 92, hy + 32)], w=2.6)
    cuff = [(hx - 104, hy - 38), (hx - 84, hy - 34), (hx - 80, hy + 36), (hx - 100, hy + 40)]
    a.poly(cuff, fill=kit.BONE, stroke=INK, stroke_width=2.4, stroke_linejoin="round")
    a.circle(hx - 92, hy + 22, 3, fill=INK)
    a.hatch(hx - 260, hy - 60, 170, 110, angle=70, spacing=8, stroke=INK, stroke_width=0.9, opacity=0.45,
            clip=a.clip(f'<polygon points="{hx - 250},{hy - 52} {hx - 104},{hy - 36} {hx - 100},{hy + 38} {hx - 250},{hy + 30}"/>'))
    fist = [(hx - 82, hy - 30), (hx - 30, hy - 40), (hx + 26, hy - 44), (hx + 52, hy - 36), (hx + 64, hy - 14),
            (hx + 62, hy + 12), (hx + 48, hy + 32), (hx + 10, hy + 40), (hx - 40, hy + 38), (hx - 80, hy + 34)]
    kit.wash(a, fist, "#c9a27a", 0.32)
    kit.curve(a, fist, closed=True)
    # knuckles, and the fingers folded under
    kit.curve(a, [(hx + 20, hy - 43), (hx + 30, hy - 34), (hx + 44, hy - 38)], w=1.6)
    kit.curve(a, [(hx + 60, hy - 18), (hx + 30, hy - 14), (hx + 8, hy - 4), (hx + 4, hy + 12)], w=2)
    kit.curve(a, [(hx + 62, hy + 6), (hx + 40, hy + 6), (hx + 26, hy + 12)], w=1.6)
    kit.curve(a, [(hx + 52, hy + 26), (hx + 36, hy + 24), (hx + 24, hy + 28)], w=1.4)
    # the thumb laid across them
    thumb = [(hx - 46, hy + 2), (hx - 20, hy - 12), (hx + 12, hy - 8), (hx + 34, hy + 6), (hx + 36, hy + 18),
             (hx + 22, hy + 22), (hx - 4, hy + 14), (hx - 30, hy + 22)]
    a.path(a.smooth_d(thumb, closed=True), fill="#d8b690", stroke=INK, stroke_width=2.4, stroke_linejoin="round")
    kit.curve(a, [(hx + 18, hy + 2), (hx + 30, hy + 8), (hx + 31, hy + 17)], w=1.3)
    # the edge of the counter just showing between finger and thumb
    a.ellipse(hx + 14, hy + 30, 16, 5, fill=INK, transform=f"rotate(8 {hx + 14} {hy + 30})")
    a.ellipse(hx + 14, hy + 28.5, 16, 5, fill=kit.BONE, stroke=INK, stroke_width=1.6, transform=f"rotate(8 {hx + 14} {hy + 30})")
    a.path(a.smooth_d([(hx - 30, hy + 22), (hx - 4, hy + 16), (hx + 22, hy + 23), (hx + 36, hy + 20), (hx + 48, hy + 32),
                       (hx + 10, hy + 40), (hx - 40, hy + 38)], closed=True), fill="#c9a27a", fill_opacity=0.0, stroke="none")
    a.hatch(60, 380, 380, 60, angle=12, spacing=6, stroke=INK, stroke_width=0.8, opacity=0.35,
            clip=a.clip('<polygon points="70,270 160,394 410,312 440,330 200,440 60,300"/>'))
    kit.label(a, 40, 452, "fig. 14  left as found", 13, PENCIL)

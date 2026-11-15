"""Nine chapter cards and three interstitials, as block prints: the palette runs from marrow blue to river red
to the heart's gold, and ends on one small red figure."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM = kit.INK, kit.CREAM
W, H = 1600, 900


def cartouche(a, i):
    a.rect(64, 716, 600, 124, fill=kit.BONE, stroke=INK, stroke_width=5)
    a.rect(74, 726, 580, 104, fill="none", stroke=INK, stroke_width=1.5)
    kit.cut_text(a, 134, 806, kit.ROMAN[i], 70 if len(kit.ROMAN[i]) < 4 else 52, kit.RAMP[i] if i != 3 else "#4a3560", light="#fffaf0", spacing=0, family="serif", sw=2)
    a.line(206, 738, 206, 818, stroke=INK, stroke_width=2)
    name = kit.CHAPTERS[i].upper()
    kit.caps(a, 226, 792, name, size=34 if len(name) < 16 else 29, anchor="start", spacing=5, font_weight="bold")
    kit.caps(a, 228, 752, f"CHAPTER {i + 1}", size=15, anchor="start", spacing=6, fill="#5a4a3a")


def c1(a):
    a.rect(22, 22, 1556, 856, fill=kit.NIGHT)
    cx, cy = 1040, 420
    for k, (s, col) in enumerate([(1.0, "#16294a"), (.78, kit.MARROW), (.58, "#25456f"), (.4, kit.MARROW2), (.24, "#4d86bd"), (.12, kit.GLOW)]):
        w, h = 560 * s, 640 * s
        a.path(f"M{f(cx - w)},{f(cy + h * .62)} C{f(cx - w)},{f(cy - h * .5)} {f(cx - w * .5)},{f(cy - h * .78)} {f(cx)},{f(cy - h * .78)} C{f(cx + w * .5)},{f(cy - h * .78)} {f(cx + w)},{f(cy - h * .5)} {f(cx + w)},{f(cy + h * .62)}Z",
               fill=col, stroke=INK, stroke_width=5 - k * .5)
    kit.gouges(a, 22, 22, 1556, 856, 520, kit.GLOW, centre=(cx, cy), ln=(10, 34), sw=3, opacity=0.8,
               density=lambda x, y: 0.9 if 150 < math.hypot(x - cx, y - cy) < 620 and y < 700 else 0.0)
    a.path(f"M22,700 Q800,640 1578,700 L1578,878 L22,878Z", fill="#0a1424", stroke=INK, stroke_width=5)
    for k in range(4):      # the four alcoves, a sleeper in each
        ax, ay = 150 + k * 150, 470 - k * 22
        a.ellipse(ax, ay, 58 - k * 3, 86 - k * 4, fill="#0a1424", stroke=kit.GLOW, stroke_width=3)
        a.circle(ax - 6, ay + 30, 20 - k, fill=kit.MARROW2, stroke=INK, stroke_width=3)
        a.path(f"M{ax - 40},{ay + 70} q40,-34 80,0", fill=kit.MARROW2, stroke=INK, stroke_width=3)
    for k in range(5):      # steady lamps down the hall
        s = 1.5 - k * .24
        kit.lamp(a, cx - 430 + k * 92, 760 - k * 38, s, lit=1)
        kit.lamp(a, cx + 430 - k * 92, 760 - k * 38, s, lit=1)


def c2(a):
    a.rect(22, 22, 1556, 856, fill="#1d3a60")
    a.circle(800, 400, 380, fill=a.radial([(0, kit.GOLD, 0.75), (0.6, kit.GOLD, 0.2), (1, kit.GOLD, 0)]))
    kit.gouges(a, 22, 22, 1556, 856, 420, kit.GLOW, centre=(800, 400), ln=(14, 40), sw=3.2, opacity=0.8,
               density=lambda x, y: 0.9 if math.hypot(x - 800, y - 400) > 300 else 0.0)
    SK = dict(fill=kit.MARROW2, stroke=INK, stroke_width=8, stroke_linejoin="round")
    for s, x in ((1, 22), (-1, 1578)):       # two arms, a red thread at each wrist
        hx = 800 - s * 330
        a.path(kit.P([(x, 330 + s * 30), (hx - s * 60, 350), (hx - s * 60, 490), (x, 560 + s * 30)], True), **SK)
        a.line(hx - s * 150, 340, hx - s * 150, 506, stroke=kit.HILITE, stroke_width=9)
    kit.solid(a, kit.hand_d(520, 430, 3.0, 90, 0.75), kit.MARROW2, INK, 5)
    kit.solid(a, kit.hand_d(1080, 440, 3.0, -90, 0.9, curl=0.75), kit.MARROW2, INK, 5)
    # the gift: a hook, laid across from one hand to the other
    hook = "M610,452 L930,418 C1010,410 1030,330 968,318 C930,312 912,340 918,362 L940,358 C938,346 948,338 962,340 C996,348 986,392 930,396 L608,430Z"
    a.path(hook, fill="#000", opacity=0.35, transform="translate(6,12)")
    a.path(hook, fill=kit.BONE, stroke=INK, stroke_width=6, stroke_linejoin="round")
    for k in range(8):
        a.line(630 + k * 14, 430, 634 + k * 14, 450, stroke=INK, stroke_width=3)
    kit.draw_mark(a, "notch", 790, 425, 13, color=kit.DEEP, sw=4)


def c3(a):
    a.rect(22, 22, 1556, 856, fill="#14294a")
    r = a.rng
    for k in range(13):     # the growths of the hollow
        x = 80 + k * 122 + r.uniform(-30, 30)
        h = r.uniform(300, 700)
        w = r.uniform(26, 60)
        a.path(f"M{f(x - w)},878 C{f(x - w * .6)},{f(878 - h * .6)} {f(x - w * 1.2)},{f(878 - h * .9)} {f(x)},{f(878 - h)} C{f(x + w * 1.2)},{f(878 - h * .9)} {f(x + w * .6)},{f(878 - h * .6)} {f(x + w)},878Z",
               fill=kit.MARROW if k % 2 else kit.MARROW2, stroke=INK, stroke_width=5)
        a.path(f"M{f(x - w * .3)},850 C{f(x - w * .2)},{f(878 - h * .6)} {f(x - w * .5)},{f(878 - h * .85)} {f(x)},{f(878 - h + 20)}", fill="none", stroke=kit.GLOW, stroke_width=3,
               stroke_linecap="round", opacity=0.8)
        a.circle(x, 878 - h, 46, fill=a.radial([(0, kit.GLOW, 0.6), (1, kit.GLOW, 0)]))
    cols = [kit.GLOW, kit.BONE, kit.HILITE, kit.GOLD]
    for s in range(3):      # the song, strung
        hs = [r.randint(1, 5) for _ in range(16)]
        hs[-1] = 1
        pts = [(170 + i * 84, 300 + s * 120 - hs[i] * 34 + 60) for i in range(16)]
        a.path(kit.P(pts), fill="none", stroke=kit.BONE, stroke_width=3, opacity=0.8)
        for i, (x, y) in enumerate(pts):
            c = cols[(i // 4 + s) % 4]
            a.circle(x, y, 15 if i % 4 == 0 else 11, fill=c, stroke=INK, stroke_width=3.5)
            a.circle(x - 4, y - 4, 3, fill="#fff", opacity=0.7)
        for rr, o in ((22, .9), (34, .5), (48, .25)):
            a.circle(pts[-1][0], pts[-1][1], rr, fill="none", stroke=kit.GOLD, stroke_width=3, opacity=o)
    kit.gouges(a, 22, 22, 1556, 200, 90, kit.GLOW, ang=90, spread=10, ln=(10, 30), sw=3, opacity=0.5)


def c4(a):
    a.rect(22, 22, 1556, 856, fill="#241a38")
    # the shaft, open, red light down it
    a.path("M1120,22 L1420,22 L1578,560 L1578,878 L1010,878Z", fill=a.gradient([(0, kit.HILITE), (0.5, kit.RIVER), (1, "#4a1a34")]), opacity=0.9)
    kit.gouges(a, 1000, 22, 578, 856, 200, kit.GOLD, ang=74, spread=6, ln=(30, 90), sw=3, opacity=0.6,
               density=lambda x, y: 1.0 if x > 1120 - (y - 22) * 0.13 else 0.0)
    kit.gouges(a, 22, 22, 1000, 600, 240, "#6a5a8a", ang=90, spread=6, ln=(20, 60), sw=3, opacity=0.7)
    for k in range(7):      # the lamps, dimmed one after another
        kit.lamp(a, 130 + k * 140, 250, 1.3, lit=max(0.0, 0.25 - k * .05) if k else 1.0)
    # the elders' bench: five seated, one place empty and warm
    a.rect(90, 640, 960, 40, fill=kit.BONE, stroke=INK, stroke_width=6)
    for x in (130, 1000):
        a.rect(x, 680, 26, 60, fill=kit.BONE, stroke=INK, stroke_width=5)
    for k in range(6):
        x = 190 + k * 152
        if k == 3:
            a.ellipse(x, 600, 80, 110, fill=a.radial([(0, kit.GOLD, 0.6), (1, kit.GOLD, 0)]))
            a.ellipse(x, 640, 50, 9, fill=kit.GOLD, opacity=0.8)
            continue
        a.path(f"M{x - 52},640 C{x - 56},520 {x - 30},470 {x},466 C{x + 30},470 {x + 56},520 {x + 52},640Z", fill="#3a4a7a", stroke=INK, stroke_width=6)
        a.circle(x, 430, 34, fill="#3a4a7a", stroke=INK, stroke_width=6)
        kit.gouges(a, x - 40, 490, 80, 130, 10, kit.GLOW, ang=80, spread=8, ln=(16, 40), sw=3, opacity=0.7)


def c5(a):
    a.rect(22, 22, 1556, 856, fill=a.gradient([(0, kit.HILITE), (0.45, "#6a2845"), (1, kit.MARROW)]))
    a.ellipse(800, 22, 300, 200, fill=a.radial([(0, "#fff3d0", 1), (0.5, kit.GOLD, 0.8), (1, kit.GOLD, 0)]))
    for s, x0 in ((1, 22), (-1, 1578)):
        pts = [(x0, 22)] + [(800 - s * (230 + 70 * math.sin(y * .011 + s) + (y - 22) * .12), y) for y in range(22, 900, 60)] + [(x0, 878)]
        a.path(a.smooth_d(pts[1:-1]) + f" L{x0},878 L{x0},22Z", fill=INK, stroke=INK, stroke_width=4)
        kit.gouges(a, min(x0, x0 + s * 520), 22, 520, 856, 220, kit.CREAM, ang=84, spread=10, ln=(14, 44), sw=3, opacity=0.55,
                   density=lambda x, y, s=s: 1.0 if (800 - x) * s > 250 + 70 * math.sin(y * .011 + s) + (y - 22) * .12 + 24 else 0.0)
    for k, (x, y, pose) in enumerate([(700, 760, "up"), (880, 590, "reach"), (730, 420, "up"), (850, 250, "reach")]):
        col = ["#3f6aa0", "#5a4a8a", "#8a3a5a", "#b3323a"][k]
        kit.brother(a, x, y, 150, col, key=INK, pose=pose, sw=6)
        for j in range(3):
            a.circle(x - 30 + j * 12 + (70 if k % 2 else -40), y - 170, 6, fill=kit.CREAM)
    for (x, y, rot) in ((300, 300, -20), (1290, 520, 16), (330, 660, 10)):
        a.path(kit.hand_d(x, y, 0.9, rot), fill="none", stroke=kit.HILITE, stroke_width=4, stroke_linejoin="round", opacity=0.8)


def c6(a):
    surf = 520
    a.rect(22, 22, 1556, surf - 22, fill=a.gradient([(0, kit.DEEP), (0.6, kit.RIVER), (1, "#f0b08a")]))
    for s, x0 in ((1, 22), (-1, 1578)):      # canyon walls
        a.path(f"M{x0},22 L{x0 + s * 520},22 C{x0 + s * 470},180 {x0 + s * 560},300 {x0 + s * 420},{surf} L{x0},{surf}Z", fill="#5a0b17", stroke=kit.KEY, stroke_width=6)
        a.path(f"M{x0 + s * 700},22 C{x0 + s * 640},200 {x0 + s * 690},360 {x0 + s * 600},{surf} L{x0 + s * 420},{surf} C{x0 + s * 560},300 {x0 + s * 470},180 {x0 + s * 520},22Z",
               fill=kit.DEEP, stroke=kit.KEY, stroke_width=5)
        kit.gouges(a, min(x0, x0 + s * 420), 60, 420, surf - 80, 70, kit.HILITE, ang=70 * s, spread=10, ln=(20, 60), sw=3, opacity=0.5)
    a.rect(22, surf, 1556, 878 - surf, fill=kit.RIVER)
    for i, (y0, c) in enumerate(((640, "#981a28"), (760, kit.DEEP))):
        a.path(a.smooth_d([(x, y0 + 12 * math.sin(x * .01 + i)) for x in range(0, 1660, 60)]) + " L1600,900 L0,900Z", fill=c)
    for j in range(12):
        y0, x0, ln = surf + 50 + j * 28, a.rng.uniform(0, 1200), a.rng.uniform(260, 520)
        a.path(a.smooth_d([(x0 + t * ln / 6, y0 + 8 * math.sin(t * 1.1 + j)) for t in range(7)]), fill="none", stroke=kit.HILITE, stroke_width=4, stroke_linecap="round", opacity=0.6)
    kit.raft(a, 560, surf, 480, sw=6)
    for k in range(4):
        bx = 640 + k * 108
        kit.brother(a, bx, surf - 22, 124, ["#6a5a9a", "#8a4a7a", "#7a4a8a", "#9a3a5a"][k], pose="sit", sw=5)
        a.line(bx + 6, surf - 80, bx - 86, surf + 62, stroke=kit.KEY, stroke_width=8, stroke_linecap="round")
        a.path(f"M{bx - 86},{surf + 62} l-16,26 l26,8 z", fill=kit.BONE, stroke=kit.KEY, stroke_width=4)
    kit.crests(a, 0, 1620, surf, big=lambda x: 1120 < x < 1380, skip=lambda x: 520 < x < 1040, sw=5)
    a.line(22, surf, 1578, surf, stroke=kit.KEY, stroke_width=4)


def c7(a):
    a.rect(22, 22, 1556, 856, fill="#4a0a14")
    kit.gouges(a, 22, 22, 1556, 856, 300, kit.DEEP, ang=0, spread=30, ln=(20, 60), sw=4)
    a.circle(1578, 430, 420, fill=a.radial([(0, kit.GOLD, 0.8), (0.5, kit.HILITE, 0.35), (1, kit.HILITE, 0)]))

    def arm(pts, w):
        d = a.smooth_d(pts)
        a.path(d, fill="none", stroke=kit.KEY, stroke_width=w + 12, stroke_linecap="round")
        a.path(d, fill="none", stroke=kit.RIVER, stroke_width=w, stroke_linecap="round")
        a.path(d, fill="none", stroke=kit.HILITE, stroke_width=3, stroke_dasharray="40 26", stroke_linecap="round", opacity=0.8)
    arm([(22, 470), (300, 450), (560, 440)], 120)
    arm([(560, 440), (800, 300), (1100, 180), (1578, 120)], 64)
    arm([(560, 440), (860, 470), (1200, 430), (1578, 430)], 80)
    arm([(560, 440), (760, 640), (1080, 730), (1578, 780)], 50)
    arm([(1100, 180), (1300, 60), (1500, 22)], 30)
    arm([(1080, 730), (1260, 850), (1400, 878)], 26)
    a.circle(560, 440, 70, fill=kit.RIVER)
    # the raft at the fork, seen from above, and each brother's counter on a branch
    a.path(kit.lozenge_d(520, 440, 44, 22), fill=kit.BONE, stroke=kit.KEY, stroke_width=5)
    for k in range(4):
        a.circle(496 + k * 16, 440, 5.5, fill=kit.MARROW2, stroke=kit.KEY, stroke_width=2)
    for (x, y, m) in ((900, 250, "ring"), (980, 462, "star"), (1010, 440, "fork"), (880, 690, "wave")):
        a.path(kit.lozenge_d(x, y, 26, 18), fill=kit.BONE, stroke=kit.KEY, stroke_width=4)
        kit.draw_mark(a, m, x, y, 9, color=kit.DEEP, sw=2.6)


def c8(a):
    a.rect(22, 22, 1556, 856, fill="#7a2a14")
    cx, cy = 800, 330
    d = []
    for k in range(40):
        an = 2 * math.pi * k / 40
        wd = a.rng.uniform(.02, .05)
        r1 = a.rng.uniform(700, 1100)
        d.append(f"M{cx},{cy} L{f(cx + r1 * math.cos(an - wd))},{f(cy + r1 * math.sin(an - wd))} L{f(cx + r1 * math.cos(an + wd))},{f(cy + r1 * math.sin(an + wd))}Z")
    a.path("".join(d), fill=kit.GOLD, opacity=0.85)
    for k, (s, col) in enumerate([(1.0, "#5a0b17"), (.8, kit.DEEP), (.62, kit.RIVER), (.46, "#c8452e"), (.3, kit.HILITE)]):     # ribs of muscle, an arch inside an arch
        w, h = 760 * s, 800 * s
        outer = f"M{f(cx - w)},878 C{f(cx - w)},{f(cy - h * .3)} {f(cx - w * .5)},{f(cy - h * .62)} {f(cx)},{f(cy - h * .62)} C{f(cx + w * .5)},{f(cy - h * .62)} {f(cx + w)},{f(cy - h * .3)} {f(cx + w)},878"
        w2, h2 = w - 70, h - 80
        inner = f"L{f(cx + w2)},878 C{f(cx + w2)},{f(cy - h2 * .3)} {f(cx + w2 * .5)},{f(cy - h2 * .62)} {f(cx)},{f(cy - h2 * .62)} C{f(cx - w2 * .5)},{f(cy - h2 * .62)} {f(cx - w2)},{f(cy - h2 * .3)} {f(cx - w2)},878Z"
        a.path(outer + inner, fill=col, stroke=INK, stroke_width=6, stroke_linejoin="round")
    a.circle(cx, cy + 40, 150, fill=a.radial([(0, "#fff6da", 1), (0.5, kit.GOLD, 0.8), (1, kit.GOLD, 0)]))
    SK = dict(fill=kit.RIVER, stroke=INK, stroke_width=8, stroke_linejoin="round")
    for k, x in enumerate((770, 950, 1130, 1310)):        # four hands, holding on
        a.path(kit.P([(x - 46, 900), (x - 40, 760), (x + 40, 760), (x + 46, 900)], True), **SK)
        kit.solid(a, kit.fist_d(x, 720, 2.0, 0), kit.RIVER, INK, 5)
        if k < 3:
            a.path(f"M{x + 60},730 h80", stroke=INK, stroke_width=26, stroke_linecap="round", fill="none")
            a.path(f"M{x + 60},730 h80", stroke=kit.RIVER, stroke_width=12, stroke_linecap="round", fill="none")
        for j in range(4):
            a.path(f"M{x - 44 + j * 24},{664 + (j % 2) * 4} q10,-12 22,0", fill="none", stroke=kit.CREAM, stroke_width=4, stroke_linecap="round")


def c9(a):
    a.rect(22, 22, 1556, 856, fill=kit.DEEP)
    for s, x0 in ((1, 22), (-1, 1578)):
        pts = [(800 - s * (150 + 50 * math.sin(y * .008 + 1 + s) + abs(y - 450) * .25), y) for y in range(22, 900, 60)]
        a.path(a.smooth_d(pts) + f" L{x0},878 L{x0},22Z", fill="#3d0610", stroke=INK, stroke_width=5)
        kit.gouges(a, min(x0, x0 + s * 620), 22, 620, 856, 200, "#7A1020", ang=88, spread=8, ln=(20, 70), sw=3.5,
                   density=lambda x, y, s=s: 1.0 if (800 - x) * s > 170 + 50 * math.sin(y * .008 + 1 + s) + abs(y - 450) * .25 else 0.0)
    a.circle(800, 470, 180, fill=a.radial([(0, kit.HILITE, 0.5), (1, kit.HILITE, 0)]))
    kit.brother(a, 800, 530, 150, kit.RIVER, key=INK, pose="hush", sw=6)
    a.path("M780,474 l44,-8 q14,4 6,18", fill="none", stroke=kit.BONE, stroke_width=8, stroke_linecap="round")
    a.path("M740,540 q60,22 120,0", fill="none", stroke=kit.HILITE, stroke_width=4, opacity=0.8)
    # the heart, slowing
    x = 720
    d = f"M{x},800"
    for k, gap in enumerate((60, 90, 140, 220)):
        d += f" h{gap} l8,{-30 + k * 6} l12,{52 - k * 10} l8,{-22 + k * 4}"
    a.path(d + " h80", fill="none", stroke=kit.CREAM, stroke_width=4, stroke_linejoin="round", opacity=0.8)


SCENES = [(c1, "the marrow tunnel, its walls pulsing, four sleepers in their alcoves and the steady lamps down the hall"),
          (c2, "two blue hands, a red thread at each wrist, and between them a carved hook with the receiver's mark"),
          (c3, "the hollow's pale growths, and three strands of song beads strung between them, the last bead home"),
          (c4, "the elders' bench with one place empty and warm, the lamps dimmed, and red light down the open shaft"),
          (c5, "four brothers climbing the shaft from blue below to red above, finger-dot holds and old hand stencils on the rock"),
          (c6, "the raft on the red river between canyon walls, four oars down on one beat, keyed crests along the line"),
          (c7, "the river seen from above, splitting toward a gold light, the raft at the fork and four counter pieces set on its branches"),
          (c8, "the cathedral of the heart, rib inside rib around gold light, and four red hands holding on in a row"),
          (c9, "one small red figure in a narrow vessel, a gift in his hand, and under him the heartbeat slowing")]
for _i, (_fn, _what) in enumerate(SCENES):
    def _card(a: Art, i=_i, fn=_fn):
        cl = kit.block_open(a, 22, rough=3)
        a.open("g", clip_path=cl)
        fn(a)
        cartouche(a, i)
        a.close()
        a.close()
    _card.__doc__ = f"Chapter card {kit.ROMAN[_i]}, {kit.CHAPTERS[_i]}, as a block print: {_what}."
    asset(G, f"chapter-{_i + 1}", group="chapters", title=f"Chapter {_i + 1}: {kit.CHAPTERS[_i]}", w=W, h=H, row="Chapter cards")(_card)

IROW = "Interstitials: the dimming, days later, the cut to red"


@asset(G, "interstitial-dimming", group="chapters", title="Interstitial: the dimming", w=W, h=H, row=IROW)
def dimming(a: Art):
    """The dimming: a row of marrow lamps across the dark, each lower than the one before it, the last a cold cup;
    the cuts of light around them thin out with the flames."""
    cl = kit.block_open(a, 22, rough=3)
    a.open("g", clip_path=cl)
    a.rect(22, 22, 1556, 856, fill=kit.NIGHT)
    for k in range(7):
        lit = max(0.0, 1 - k / 5.2)
        x = 200 + k * 200
        if lit > 0:
            kit.gouges(a, x - 150, 200, 300, 420, int(90 * lit), kit.GOLD if k < 3 else kit.GLOW, centre=(x, 420), ln=(12, 40), sw=3.2, opacity=0.4 + 0.5 * lit,
                       density=lambda px, py, x=x, lit=lit: 1.0 if 60 < math.hypot(px - x, py - 420) < 60 + 150 * lit else 0.0)
        kit.lamp(a, x, 480, 2.6, lit=lit)
    a.path("M22,560 Q800,530 1578,560 L1578,878 L22,878Z", fill="#0a1424", stroke=INK, stroke_width=5)
    kit.gouges(a, 22, 600, 1556, 260, 160, kit.MARROW2, ang=2, spread=4, ln=(40, 140), sw=3, opacity=0.7)
    a.close()
    a.close()


@asset(G, "interstitial-days-later", group="chapters", title="Interstitial: days later", w=W, h=H, row=IROW)
def days_later(a: Art):
    """Days later: sleeps tallied in fives on the marrow wall, the last group unfinished, above a board left as it
    stood and one lamp."""
    cl = kit.block_open(a, 22, rough=3)
    a.open("g", clip_path=cl)
    a.rect(22, 22, 1556, 856, fill=kit.MARROW)
    kit.gouges(a, 22, 22, 1556, 856, 260, kit.MARROW2, ang=90, spread=8, ln=(20, 70), sw=3.5)
    n = 0
    for row in range(3):
        for g in range(8):
            x, y = 210 + g * 152, 150 + row * 150
            for k in range(5):
                n += 1
                if n > 108:
                    break
                if k < 4:
                    a.wobble([(x + k * 20, y), (x + k * 20 + 5, y + 92)], amp=1.5, step=12, stroke=kit.CREAM, stroke_width=8, stroke_linecap="round")
                else:
                    a.wobble([(x - 14, y + 70), (x + 80, y + 22)], amp=1.5, step=12, stroke=kit.CREAM, stroke_width=7, stroke_linecap="round")
    a.rect(22, 640, 1556, 238, fill=INK)
    a.rect(520, 680, 560, 150, rx=60, fill=kit.CREAM)
    for i in range(5):
        for rr in range(2):
            cx, cy = 650 + i * 76, 722 + rr * 66
            a.ellipse(cx, cy, 26, 22, fill=INK)
            for _ in range(a.rng.choice((0, 1, 2, 3, 4))):
                a.circle(cx + a.rng.uniform(-12, 12), cy + a.rng.uniform(-9, 9), 5, fill=kit.CREAM)
    for kx in (565, 1035):
        a.ellipse(kx, 755, 20, 54, fill=INK)
        for _ in range(5):
            a.circle(kx + a.rng.uniform(-6, 6), 755 + a.rng.uniform(-36, 36), 5, fill=kit.CREAM)
    kit.lamp(a, 1250, 800, 2.2, lit=1)
    a.close()
    a.close()


@asset(G, "interstitial-cut-to-red", group="chapters", title="Interstitial: the cut to red", w=W, h=H, row=IROW)
def cut_to_red(a: Art):
    """The cut to red: one long gouge splits the block from corner to corner, blue on one side and red on the other,
    and two hands that were holding are left either side of it, fingers just apart."""
    cl = kit.block_open(a, 22, rough=3)
    a.open("g", clip_path=cl)
    a.rect(22, 22, 1556, 856, fill=kit.MARROW)
    a.path("M700,22 L1578,22 L1578,878 L900,878Z", fill=kit.RIVER)
    kit.gouges(a, 22, 22, 800, 856, 200, kit.GLOW, ang=77, spread=8, ln=(20, 60), sw=3, opacity=0.6, density=lambda x, y: 1.0 if x < 660 + (y - 22) * .234 else 0.0)
    kit.gouges(a, 760, 22, 818, 856, 220, kit.HILITE, ang=77, spread=8, ln=(20, 70), sw=3.5, opacity=0.8, density=lambda x, y: 1.0 if x > 760 + (y - 22) * .234 else 0.0)
    for k in range(9):      # the cut itself: long tapering strokes of bare paper
        o = a.rng.uniform(-34, 34)
        y0, y1 = a.rng.uniform(22, 200), a.rng.uniform(700, 878)
        x0, x1 = 700 + (y0 - 22) * .234 + o, 700 + (y1 - 22) * .234 + o
        wd = a.rng.uniform(5, 16)
        a.path(f"M{f(x0)},{f(y0)} L{f(x1 - wd)},{f(y1)} L{f(x1 + wd)},{f(y1)}Z", fill=kit.CREAM)
    a.path(kit.P([(22, 380), (420, 400), (420, 510), (22, 560)], True), fill=kit.MARROW2, stroke=INK, stroke_width=8)
    kit.solid(a, kit.hand_d(520, 450, 2.6, 78, 0.8), kit.MARROW2, INK, 5)
    a.path(kit.P([(1578, 400), (1190, 420), (1190, 530), (1578, 580)], True), fill="#c8352e", stroke=INK, stroke_width=8)
    kit.solid(a, kit.hand_d(1090, 470, 2.6, -102, 0.8), "#c8352e", INK, 5)
    a.close()
    a.close()

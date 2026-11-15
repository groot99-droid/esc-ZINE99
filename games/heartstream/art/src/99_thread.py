"""The collection thread: this game's own object, and the guest object it hides."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM = kit.INK, kit.CREAM


@asset(G, "thread-own", group="thread", title="Thread: the unfinished board and the closed hand", w=480, h=480, row="Thread")
def own(a: Art):
    """A game board left unfinished, with one counter still closed in somebody's hand: a linocut of the board's near
    end, counters lying in three of its hollows, and above it a fist that has not yet let its last counter fall."""
    cl = kit.block_open(a, 16, rough=3)
    a.open("g", clip_path=cl)
    kit.gouges(a, 16, 16, 448, 448, 150, kit.MARROW2, centre=(250, 170), ln=(10, 30), sw=3.2, density=lambda x, y: 1.0 if math.hypot(x - 250, y - 170) > 150 else 0.0)
    a.rect(-40, 300, 470, 240, rx=70, fill=CREAM)
    a.rect(-40, 300, 470, 240, rx=70, fill="none", stroke=INK, stroke_width=6)
    r = a.rng
    for i in range(3):
        for row in range(2):
            cx, cy = 70 + i * 120, 356 + row * 84
            a.ellipse(cx, cy, 46, 32, fill=INK)
            n = [[3, 0, 2], [1, 4, 0]][row][i]
            for _ in range(n):
                x, y = cx + r.uniform(-20, 20), cy + r.uniform(-10, 10)
                a.path(kit.lozenge_d(x, y, 13, 9), fill=CREAM, transform=f"rotate({f(r.uniform(-40, 40))} {f(x)} {f(y)})")
    kit.gouges(a, 0, 304, 420, 20, 14, INK, ang=4, spread=6, ln=(10, 26), sw=3)
    # the hand, closed, the counter's edge showing
    a.path(kit.P([(480, 60), (330, 110), (366, 200), (480, 190)], True), fill=kit.MARROW2, stroke=INK, stroke_width=8)
    a.line(396, 98, 424, 190, stroke=kit.HILITE, stroke_width=7)
    a.path(kit.lozenge_d(232, 214, 22, 12), fill=CREAM, stroke=INK, stroke_width=4, transform="rotate(-20 232 214)")
    kit.solid(a, kit.fist_d(280, 170, 2.0, -70), kit.MARROW2, INK, 4.5)
    for k in range(4):
        a.path(f"M{236 + k * 12},{122 + k * 22} q14,-4 20,8", fill="none", stroke=kit.GLOW, stroke_width=3.5, stroke_linecap="round")
    a.path("M250,262 v22 M236,270 l-8,16 M264,270 l8,16", stroke=kit.RIVER, stroke_width=4, stroke_linecap="round", fill="none", stroke_dasharray="5 6")
    a.close()
    a.close()


@asset(G, "thread-guest", group="thread", title="Thread (guest): the ring a cup leaves", w=480, h=480, row="Thread")
def guest(a: Art):
    """The ring a cup leaves on a table, as it would sit unremarked on the carving slab: scrimshaw on ivory, a damp
    ring beside a lamp cup that has been moved, a hook and some shavings, the slab hatched fine around them."""
    a.paper(kit.IVORY, grain=0.25, fibre=1.1)
    kit.grain_lines(a, 0, 0, 480, 480, 18, "#8a7350", 0.3, amp=3)
    cl = a.clip('<rect x="26" y="26" width="428" height="428"/>')
    slab = kit.blob_d(a, 240, 250, 196, 170, n=14, jitter=0.03)
    a.hatch(20, 20, 440, 440, angle=20, spacing=5, clip=cl, stroke=INK, stroke_width=0.7, opacity=0.5)
    a.hatch(20, 20, 440, 440, angle=-50, spacing=8, clip=cl, stroke=INK, stroke_width=0.5, opacity=0.3)
    a.path(slab, fill="#000", opacity=0.25, transform="translate(4,6)")
    a.path(slab, fill="#f7efdc")
    a.open("g", clip_path=a.clip(f'<path d="{slab}"/>'))
    kit.grain_lines(a, 40, 70, 400, 360, 14, "#8a7350", 0.45, amp=5)
    # the ring: where a cup stood, damp, not quite closed
    cx, cy = 196, 262
    a.circle(cx, cy, 62, fill=a.radial([(0.72, "#a8845a", 0), (0.9, "#a8845a", 0.3), (1, "#a8845a", 0)]))
    for k, (rr, sw, op, dash) in enumerate(((52, 3.2, 0.55, "150 14 90 8"), (56, 1.2, 0.5, "60 10 120 16"), (48, 0.9, 0.4, "30 8"))):
        pts = [(cx + rr * (1 + 0.025 * math.sin(t * 3 + k)) * math.cos(t), cy + rr * (1 + 0.025 * math.cos(t * 2 + k)) * math.sin(t) * .96) for t in [i * math.pi / 14 for i in range(28)]]
        a.path(a.smooth_d(pts, closed=True), fill="none", stroke="#7a5a3a", stroke_width=sw, opacity=op, stroke_dasharray=dash, stroke_linecap="round")
    for _ in range(9):
        t = a.rng.uniform(0, 6.28)
        a.circle(cx + 60 * math.cos(t), cy + 58 * math.sin(t), a.rng.uniform(1, 2.4), fill="#7a5a3a", opacity=0.5)
    a.close()
    kit.scratch(a, slab, sw=2.2)
    # the cup, moved aside
    kit.scratch(a, "M300,150 h74 l-12,44 h-50Z", sw=2)
    a.path("M300,150 h74 l-12,44 h-50Z", fill="#f7efdc", opacity=0.9)
    kit.scratch(a, "M300,150 h74 l-12,44 h-50Z", sw=2)
    a.ellipse(337, 150, 37, 9, fill="#e6d7b4", stroke=INK, stroke_width=1.8)
    a.hatch(300, 150, 80, 50, angle=70, spacing=4, clip=a.clip('<path d="M344,152 h30 l-12,42 h-22Z"/>'), stroke=INK, stroke_width=0.8, opacity=0.6)
    kit.scratch(a, "M337,146 C346,132 343,122 337,112 C331,122 328,132 337,146Z", sw=1.6, ink=kit.DEEP)
    # a hook and shavings
    kit.scratch(a, "M276,372 L392,330 C410,322 414,300 398,298 C388,298 384,306 386,312", sw=4.5)
    kit.scratch(a, "M276,372 L392,330 C410,322 414,300 398,298 C388,298 384,306 386,312", sw=2.2, ink="#f7efdc", light=None)
    for (x, y, rot) in ((120, 360, 20), (150, 384, -30), (330, 250, 60), (92, 250, -10)):
        kit.scratch(a, f"M{x},{y} q10,-12 20,-2 q6,8 -4,12", sw=1.3, transform=f"rotate({rot} {x} {y})", light=None)
    a.rect(14, 14, 452, 452, fill="none", stroke=INK, stroke_width=1.6)
    a.rect(20, 20, 440, 440, fill="none", stroke=INK, stroke_width=3, stroke_dasharray="1.5 5")

"""Phase 1 (accepted 2026-11-15): the two pictures the first pass of the accepted story needs in play and
had no asset for. The small one who moves a counter (linocut, Bone Counters), and the raft's flank with the
mark healed into it (woodblock, the river section's boarding)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, KEY = kit.INK, kit.CREAM, kit.KEY


@asset(G, "small-one", group="figures", title="The small one moves a counter", w=480, h=480,
       row="Counters: board, counter, 6 mark pieces, the finished board, the hall wall")
def small_one(a: Art):
    """A small Blue-Born child at the edge of the board, as a linocut: only his head over the rim, two round
    eyes looking up to see whether it was allowed, and one small blue hand setting a single counter into a
    hollow that is not his."""
    kit.block_open(a, 16, rough=2.6)
    kit.gouges(a, 16, 16, 448, 250, 90, CREAM, centre=(170, 190), ln=(8, 20), sw=3,
               density=lambda x, y: 1.0 if math.hypot(x - 170, y - 190) > 150 else 0.0)
    # the head over the rim: hair as cut tufts, two round eyes
    a.path("M70,300 C60,190 110,110 180,108 C250,110 292,186 282,300Z", fill=kit.MARROW2, stroke=INK, stroke_width=6)
    a.path("".join(f"M{f(96 + i * 17)},{f(150 - 22 * math.sin(i * .36 + .3))} l{f(-6 + i)},-30" for i in range(10)),
           fill="none", stroke=kit.GLOW, stroke_width=5, stroke_linecap="round")
    for ex in (140, 216):
        a.circle(ex, 216, 24, fill=CREAM, stroke=INK, stroke_width=5)
        a.circle(ex + 7, 208, 10, fill=INK)
    a.path("M158,266 q20,10 40,0", fill="none", stroke=INK, stroke_width=5, stroke_linecap="round")
    a.path("".join(f"M{f(84 + i * 9)},{f(240 + i * 5)} l16,-8" for i in range(5)), fill="none", stroke=kit.GLOW, stroke_width=3,
           stroke_linecap="round", opacity=0.8)
    # the rim of the board and two hollows
    a.rect(16, 300, 448, 164, fill=INK)
    a.line(16, 300, 464, 300, stroke=CREAM, stroke_width=5)
    kit.gouges(a, 20, 306, 440, 20, 40, CREAM, ang=4, spread=10, ln=(8, 18), sw=3)
    for cx in (150, 352):
        a.ellipse(cx, 396, 84, 52, fill=CREAM)
        a.path(f"M{cx - 62},{404} q60,34 124,2", fill="none", stroke=INK, stroke_width=4, stroke_linecap="round", opacity=0.75)
    for (x, y, r) in ((118, 392, -18), (166, 404, 24), (150, 372, 4)):
        a.path(kit.lozenge_d(x, y, 22, 14), fill=INK, transform=f"rotate({r} {x} {y})")
    # the small hand, reaching across, one counter under two fingers
    a.path("M300,300 C330,318 344,338 348,360", fill="none", stroke=INK, stroke_width=44, stroke_linecap="round")
    a.path("M300,300 C330,318 344,338 348,360", fill="none", stroke=kit.MARROW2, stroke_width=32, stroke_linecap="round")
    a.path(kit.hand_d(352, 372, 0.62, rot=168, spread=0.7), fill=kit.MARROW2, stroke=INK, stroke_width=5, stroke_linejoin="round")
    a.path(kit.lozenge_d(356, 420, 24, 15), fill=INK, stroke=kit.RIVER, stroke_width=4)
    a.path("M344,414 q12,-8 24,0", fill="none", stroke=CREAM, stroke_width=3, stroke_linecap="round")
    a.close()


@asset(G, "raft-flank-mark", group="backdrops", title="The raft's flank, and the mark healed into it", w=1600, h=900,
       row="River backdrops, 3 sequences × 3 planes, and the Inspection plate")
def raft_flank(a: Art):
    """The Ceremonial Raft at the bank, close, as a woodblock print: the long pale hull with its ribs riding
    the red water, and on its flank one fresh paler patch, newly grown in, with an old carver's mark healed
    into it."""
    r = a.rng
    a.rect(0, 0, 1600, 900, fill=a.gradient([(0, "#3d0610"), (0.5, kit.DEEP), (1, "#981a28")]))
    # the roof and the far wall
    a.path("M0,0 L1600,0 L1600,120 C1400,190 1240,90 1040,150 C820,214 640,96 420,150 C260,190 120,120 0,170Z",
           fill="#2a0509", stroke=KEY, stroke_width=6)
    kit.gouges(a, 0, 0, 1600, 130, 120, kit.DEEP, ang=80, spread=18, ln=(12, 30), sw=3.5)
    kit.grain_lines(a, 0, 180, 1600, 300, 16, KEY, 0.22, amp=5, sw=2)
    # the hull: a long pale living body, bow to the right
    hull = ("M90,560 C140,700 420,760 800,762 C1180,760 1440,690 1530,520 "
            "L1490,440 C1300,470 1060,484 800,486 C540,484 300,470 130,446Z")
    a.path(hull, fill=kit.BONE, stroke=KEY, stroke_width=9, stroke_linejoin="round")
    cl = a.clip(f'<path d="{hull}"/>')
    a.open("g", clip_path=cl)
    kit.grain_lines(a, 80, 440, 1460, 330, 22, "#c9b48e", 0.9, amp=7, sw=2.6)
    for i in range(13):
        x = 190 + i * 104
        a.path(f"M{x},440 q26,150 -8,330", fill="none", stroke="#b89f78", stroke_width=6, stroke_linecap="round")
    kit.gouges(a, 90, 640, 1440, 120, 110, "#a88c64", ang=6, spread=10, ln=(14, 34), sw=3.5)
    # the patch: paler, newly grown in, a seam of small healed stitches round it
    patch = a.smooth_d([(650, 560), (700, 506), (800, 492), (906, 508), (952, 566), (930, 640), (826, 676), (712, 660)], closed=True)
    a.path(patch, fill="#fbf4e2", stroke="#b89f78", stroke_width=5)
    for k in range(26):
        t = k / 26 * 2 * math.pi
        x, y = 800 + 158 * math.cos(t), 584 + 96 * math.sin(t)
        a.line(x, y, x + 14 * math.cos(t), y + 14 * math.sin(t), stroke="#b89f78", stroke_width=4, stroke_linecap="round")
    kit.draw_mark(a, "fork", 800, 582, 50, color="#c9a37a", sw=13)
    kit.draw_mark(a, "fork", 800, 582, 50, color=kit.DEEP, sw=5, opacity=0.55)
    a.close()
    # the water and its keyed crests against the hull
    a.rect(0, 742, 1600, 158, fill=kit.RIVER)
    a.path("".join(f"M{f(x)},{f(800 + 26 * (k % 2))} q35,-14 70,0 q35,14 70,0" for k in range(3) for x in range(-40 + k * 30, 1640, 140)),
           fill="none", stroke="#f0b08a", stroke_width=3, opacity=0.55)
    kit.crests(a, -30, 1630, 748, key=KEY, fill=kit.RIVER, hs=(18, 40))
    a.line(0, 748, 1600, 748, stroke=KEY, stroke_width=4)
    for _ in range(40):
        a.circle(r.uniform(0, 1600), 748 - r.uniform(10, 70) * r.random(), r.uniform(2, 4.5), fill=kit.BONE, opacity=0.85)
    # the bank in the near corner, where they stand to board
    a.path("M0,640 C120,650 200,720 250,900 L0,900Z", fill="#2a0509", stroke=KEY, stroke_width=6)
    kit.gouges(a, 0, 680, 220, 220, 40, kit.DEEP, ang=40, spread=14, ln=(10, 26), sw=3,
               density=lambda x, y: 1.0 if y - 660 > x * 0.9 else 0.0)

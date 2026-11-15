"""The collection thread: this game's own object, and the object it hides for another game."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
C, P, R, E = kit.C, kit.P, kit.R, kit.E


@asset(G, "thread-own", group="thread", title="A small felt cat with button eyes", w=480, h=480, row="Thread")
def thread_own(a: Art):
    """A small cream felt cat with button eyes sitting on the third stair, where nobody left it: cut felt
    on night-blue felt, whip-stitched, with its own faint warmth on the tread beneath it."""
    a.rect(0, 0, 480, 480, fill=kit.NIGHT, filter=kit.felt_filter(a, shadow=0))
    kit.lamp(a, 90, 60, 420, kit.SKY, 0.25)
    # the stair, in cedar felt
    for k in range(4):
        x, y = 40 + k * 96, 400 - k * 74
        kit.felt(a, R(x, y, 480 - x + 20, 500 - y), kit.mix(kit.CEDAR, kit.NIGHT, 0.15 + 0.1 * k), edge=None)
        kit.thread(a, f"M{x + 10},{y + 12}H480", kit.mix(kit.DUST, kit.CEDAR, 0.4), w=2.2, dash="9 6")
    kit.thread(a, "M30,300L330,70", kit.mix(kit.DUST, kit.NIGHT, 0.4), w=3.4, dash="14 8")
    for k in range(4):
        x = 60 + k * 84
        kit.thread(a, f"M{x},{f(300 - (x - 30) * 0.767)}v{120 - k * 4}", kit.mix(kit.DUST, kit.NIGHT, 0.5), w=2, dash="6 5", shadow=False)
    # the cat, on the third tread
    cx, by = 300, 252
    kit.lamp(a, cx, by - 10, 150, kit.AMBER, 0.6)
    cloth = kit.light(kit.DUST, 0.5)
    F = lambda d, c: kit.felt(a, d, c, edge=kit.BONE, depth=6, gap=6, w=1.5)
    F(f"M{cx + 30},{by - 6}q64,-6 58,-58q-4,-22 -22,-12q14,26 -40,40z", cloth)                       # tail
    F(f"M{cx - 46},{by}q-8,-96 46,-100q54,4 46,100z", cloth)                                         # body
    F(E(cx - 22, by - 6, 15, 9), kit.light(cloth, 0.5)), F(E(cx + 22, by - 6, 15, 9), kit.light(cloth, 0.5))    # paws
    F(P((cx - 48, by - 118), (cx - 44, by - 170), (cx - 10, by - 142)), cloth), F(P((cx + 48, by - 118), (cx + 44, by - 170), (cx + 10, by - 142)), cloth)
    F(E(cx, by - 104, 54, 46), cloth)
    a.path(R(cx + 10, by - 60, 26, 24, 3), fill=kit.RUST, filter=kit.felt_filter(a), transform=f"rotate(10 {cx + 23} {by - 48})")
    kit.thread(a, f"M{cx},{by - 148}v34", kit.mix(cloth, kit.CEDAR, 0.5), w=1.6, dash="4 3", shadow=False)
    a.path(P((cx - 6, by - 96), (cx + 6, by - 96), (cx, by - 88)), fill=kit.INK)
    kit.thread(a, f"M{cx},{by - 88}v7M{cx - 9},{by - 81}q4.5,6 9,0q4.5,6 9,0", kit.INK, w=1.8, dash="3 2", shadow=False)
    kit.thread(a, f"M{cx - 50},{by - 96}h22M{cx + 50},{by - 96}h-22M{cx - 48},{by - 86}l20,-4M{cx + 48},{by - 86}l-20,-4", kit.BONE, w=1.2,
               dash="5 3", shadow=False)
    kit.button(a, cx - 21, by - 110, 9, kit.INK), kit.button(a, cx + 21, by - 110, 9, kit.INK)
    kit.shade(a, 0.45)


@asset(G, "thread-guest", group="thread", title="A knock answered through a wall", w=480, h=480, row="Thread")
def thread_guest(a: Art):
    """A wall seen at the cut, as the dollhouse shows its walls: wallpaper either side, and on each face three
    small knuckle marks with rings of running stitch spreading from them, the three on the right answering the
    three on the left a little later and a little lower."""
    # two rooms in felt, the wall between them cut through
    a.rect(0, 0, 216, 480, fill=kit.mix(kit.SKY, kit.NIGHT, 0.45), filter=kit.felt_filter(a, shadow=0))
    a.rect(264, 0, 216, 480, fill=kit.mix(kit.RUST, kit.CEDAR, 0.55), filter=kit.felt_filter(a, shadow=0))
    for x0, col in ((0, kit.SKY), (264, kit.light(kit.RUST, 0.3))):
        d = "".join(f"M{x0 + 22 + i * 38 + (19 if j % 2 else 0)},{28 + j * 40}l5,5l-5,5l-5,-5z" for i in range(5) for j in range(12))
        a.path(d, fill=col, opacity=0.4)
    kit.felt(a, R(216, -10, 48, 500), kit.light(kit.DUST, 0.3))
    a.hatch(216, 0, 48, 480, angle=45, spacing=9, stroke=kit.CEDAR, stroke_width=1.6, stroke_dasharray="5 3",
            clip=a.clip('<rect x="216" y="0" width="48" height="480"/>'))
    kit.whip(a, "M216,0V480M264,0V480", kit.BONE, w=1.8, depth=9, gap=8)
    # the knocks: left first, in bone; the answer on the right, in amber
    for side, x, ys, col in ((-1, 212, (150, 196, 242), kit.BONE), (1, 268, (214, 260, 306), kit.AMBER)):
        for n, y in enumerate(ys):
            a.ellipse(x + side * 5, y, 5.5, 8, fill=kit.INK, opacity=0.45)
            a.ellipse(x + side * 4, y - 1, 4.4, 6.6, fill=kit.mix(col, kit.INK, 0.25))
            for k, r in enumerate((24, 46, 70)):
                d = f"M{x},{y - r}a{r},{r} 0 0,{0 if side < 0 else 1} 0,{2 * r}"
                kit.thread(a, d, col, w=2.6 - k * 0.6, dash=f"{8 - k * 2} {5 + k * 3}", shadow=k == 0, opacity=1 - k * 0.28)
    kit.lamp(a, 368, 260, 180, kit.AMBER, 0.3)
    kit.shade(a, 0.45)

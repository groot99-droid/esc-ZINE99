"""Title lettering: the wordmark and the cross-stitch alphabet every card is set in."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Title lettering and cross-stitch alphabet"


@asset(G, "wordmark", group="title", title="The Stuffed Ones: wordmark", w=1600, h=500, row=ROW)
def wordmark(a: Art):
    """The title worked in cross-stitch on attic-dust linen: THE above, STUFFED ONES below in cedar
    thread with a rust shadow, and under it a stitched shelf where small toys sit with one empty,
    faintly warm place among them."""
    kit.linen(a, kit.LINEN, cell=3.5)
    kit.lamp(a, 420, 120, 700, kit.BONE, 0.45)
    kit.band(a, 60, 34, 1480, 6, kit.MOSS, kit.RUST, seed=3)
    kit.band(a, 60, 436, 1480, 6, kit.MOSS, kit.RUST, seed=3)
    kit.xtext(a, "THE", 800, 92, 7, kit.RUST, align="center")
    kit.xtext(a, "STUFFED ONES", 800, 176, 14, kit.CEDAR_D, shadow=kit.RUST, align="center")
    # the shelf: a row of stitches, the toys on it, one empty place
    y = 408
    kit.thread(a, f"M150,{y}H1450", kit.CEDAR, w=5, dash="14 7")
    kit.thread(a, f"M150,{y + 9}H1450", kit.CEDAR_D, w=2, dash="3 6", shadow=False)
    toys = [("bear", kit.RUST), ("rabbit", kit.SKY), ("cat", kit.BONE), ("dog", kit.MOSS), None, ("bear", kit.CEDAR),
            ("rabbit", kit.light(kit.RUST, 0.5)), ("cat", kit.mix(kit.SKY, kit.NIGHT, 0.4)), ("bear", kit.MOSS),
            ("dog", kit.DUST), ("rabbit", kit.RUST), ("cat", kit.CEDAR)]
    cs = 6
    for k, t in enumerate(toys):
        x = 190 + k * 104
        if t is None:
            kit.lamp(a, x + 28, y - 8, 70, kit.AMBER, 0.75)
            kit.crosses(a, [(i, 0) for i in range(2, 9)], x, y - 10, cs, kit.AMBER)
            continue
        kit.sprite(a, t[0], x, y - 12 * cs - 3, cs, t[1], eye=kit.INK)
    kit.shade(a, 0.35)


def _letter(ch, k):
    cols = [kit.CEDAR_D, kit.RUST, kit.MOSS, kit.NIGHT, kit.mix(kit.RUST, kit.CEDAR, 0.5), kit.mix(kit.SKY, kit.NIGHT, 0.55)]
    col = cols[k % len(cols)]
    col2 = cols[(k + 1) % len(cols)]

    @asset(G, f"letter-{ch.lower()}", group="title", title=f"Cross-stitch letter {ch}", w=240, h=300, row=ROW)
    def draw(a: Art):
        kit.linen(a, kit.mix(kit.LINEN, kit.DUST, (k % 3) / 3), cell=3)
        g = kit.FONT[ch]
        cs = 15
        w = len(g[0]) * cs
        cells = [(i, j) for j, r in enumerate(g) for i, c in enumerate(r) if c == "X"]
        kit.crosses(a, cells, (240 - w) / 2, 62, cs, col, shadow=kit.mix(col2, kit.LINEN, 0.35))
        kit.band(a, 22, 22, 196, 5, col2, kit.AMBER if k % 5 == 0 else col, seed=k + 40, rows=3 + k % 2 * 2)
        kit.band(a, 22, 226, 196, 6, col2, kit.RUST, seed=k + 90, rows=5, unit=6 + 2 * (k % 2))
        kit.thread(a, kit.R(10, 10, 220, 280, 4), kit.mix(col, kit.LINEN, 0.3), w=1.8, dash="6 4", shadow=False)
        a.text(120, 286, f"{len(cells)} stitches", size=13, family="monospace", fill=kit.mix(kit.INK, kit.LINEN, 0.35),
               text_anchor="middle")
        kit.shade(a, 0.25)
    draw.__doc__ = (f"The letter {ch} of the sampler alphabet in counted cross-stitch on linen, between two "
                    f"sampler bands, with its stitch count beneath.")


for _k, _ch in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
    _letter(_ch, _k)

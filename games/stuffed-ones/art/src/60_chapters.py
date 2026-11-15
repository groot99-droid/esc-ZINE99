"""Movement and chapter cards: embroidered samplers."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Movement and chapter cards"
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"]

CHAPTERS = [  # title, picture, side picture, verbatim line (quoted in DESIGN.md or DEEP_DIVE.md), thread
    ("The Cabin That Felt Too Quiet", "cabin", "tree", "We laughed. / We shouldn't have.", kit.MOSS),
    ("The First Night", "moon", "footprints", "Did anyone else hear… like… footsteps last night?", kit.NIGHT),
    ("The Smell, the Warmth, the Dog", "collar", "leaf", "They get hungry.", kit.RUST),
    ("Fuller", "bearhead", "tree", "where we hadn't left them", kit.CEDAR),
    ("The Cabin Turns", "stair", "bearhead", "The bear turned its head toward us.", kit.RED),
    ("Waking Warm", "cathead", "needle", "Oh, they turned out lovely.", kit.AMBER),
    ("The New Guests Arrive", "car", "door", "They like company.", kit.MOSS),
    ("Giving In", "doorajar", "rabbithead", "She didn't want to.", kit.NIGHT),
    ("We Don't Move at First", "two", "eye", "creepy stuffed animals everywhere", kit.CEDAR),
    ("The First Game: Sound", "bell", "notes", "Did you hear that?", kit.RUST),
    ("The Second Game: Movement", "footprints", "chair", "Who moved these?", kit.MOSS),
    ("Scent, then Proximity", "candle", "bed", "Do you smell that?", kit.RUST),
    ("The Third Morning", "window", "key", "I swear I locked that door.", kit.NIGHT),
    ("The Final Game: The Chase", "spiral", "doghead", "We were still playing.", kit.RED),
    ("The Cycle Continues", "door", "car", "I don't fight it anymore.", kit.CEDAR),
]


def counted(a, ground, cell=8.0):
    """Lines of the ground showing between stitches, so a filled shape reads as counted work."""
    pid = a.uid("cnt")
    a.defn(f'<pattern id="{pid}" width="{f(cell)}" height="{f(cell)}" patternUnits="userSpaceOnUse">'
           f'<path d="M0,0H{f(cell)}M0,0V{f(cell)}" stroke="{ground}" stroke-width="1.8"/>'
           f'<path d="M1,1L{f(cell - 1)},{f(cell - 1)}M{f(cell - 1)},1L1,{f(cell - 1)}" stroke="{ground}" stroke-width="0.7" '
           f'opacity="0.55"/></pattern>')
    return f"url(#{pid})"


def frame(a, thr, seed, ground):
    kit.band(a, 70, 44, 1460, 7, thr, kit.RUST if thr != kit.RUST else kit.MOSS, seed=seed, rows=5, unit=6 + 2 * (seed % 2))
    kit.band(a, 70, 822, 1460, 7, thr, kit.RUST if thr != kit.RUST else kit.MOSS, seed=seed, rows=5, unit=6 + 2 * (seed % 2))
    kit.thread(a, "M52,40V862M1548,40V862", kit.mix(thr, ground, 0.3), w=3, dash="10 7")
    kit.thread(a, "M40,40V862M1560,40V862", kit.mix(thr, ground, 0.5), w=1.6, dash="2 6", shadow=False)


def _chapter(k, row):
    title, pic, side, line, thr = row

    @asset(G, f"chapter-{k + 1:02d}", group="chapters", title=f"Chapter {k + 1}: {title}", w=1600, h=900, row=ROW)
    def draw(a: Art):
        ground = kit.mix(kit.LINEN, kit.DUST, 0.3 + 0.3 * (k % 3))
        kit.linen(a, ground, cell=3.5)
        kit.lamp(a, 800, 420, 620, kit.AMBER if thr in (kit.AMBER, kit.RED) else kit.BONE, 0.4)
        frame(a, thr if thr not in (kit.AMBER, kit.RED) else kit.CEDAR, k + 11, ground)
        kit.xtext(a, "CHAPTER " + ROMAN[k], 800, 118, 6, kit.RUST if thr != kit.RUST else kit.CEDAR, align="center")
        # the picture, worked as a counted fill, between two smaller ones
        cnt = counted(a, ground)
        dk = kit.CEDAR_D
        kit.icon(a, pic, 800 - 170, 180, 3.4, thr if thr != kit.AMBER else kit.light(kit.DUST, 0.6), accent=kit.mix(thr, ground, 0.5)
                 if thr not in (kit.AMBER,) else kit.RUST, linec=dk, hole=dk, warm=kit.AMBER, over=cnt, lw=2.2, dash="4 3")
        for sx in (270, 1330 - 190):
            kit.icon(a, side, sx, 262, 1.9, kit.mix(thr, ground, 0.35) if thr != kit.AMBER else kit.mix(kit.RUST, ground, 0.4),
                     accent=kit.mix(kit.CEDAR, ground, 0.5), linec=dk, hole=kit.mix(dk, ground, 0.3), warm=kit.mix(kit.AMBER, ground, 0.3),
                     over=cnt, lw=2.6, dash="4 3")
        kit.thread(a, "M250,470H500M1100,470H1350", kit.mix(dk, ground, 0.3), w=2.4, dash="9 6")
        cells, wc = kit.text_cells(title)
        cs = min(12, 1380 / wc)
        kit.xtext(a, title, 800, 566, cs, kit.CEDAR_D, shadow=kit.mix(thr, ground, 0.3), align="center")
        kit.thread(a, "M420,712H1180", kit.mix(thr, ground, 0.2) if thr != kit.AMBER else kit.RUST, w=2.2, dash="3 7", shadow=False)
        a.text(800, 772, line, size=34, family="serif", fill=kit.mix(kit.INK, kit.CEDAR, 0.4), text_anchor="middle",
               font_style="italic")
        kit.shade(a, 0.4)
    draw.__doc__ = (f"A sampler card for chapter {k + 1}, \"{title}\": the title in cross-stitch under a counted-thread "
                    f"picture ({pic}), between two sampler bands, with one line of the novel beneath.")


for _k, _r in enumerate(CHAPTERS):
    _chapter(_k, _r)

MOVEMENTS = [("First Movement", "The Cabin", "cabin", kit.NIGHT, kit.BONE, "chapters 1 to 14"),
             ("Second Movement", "The Hunger", "fire", kit.mix(kit.CEDAR, kit.INK, 0.35), kit.DUST, "chapters 15 to 23"),
             ("Third Movement", "The Hunt", "spiral", kit.mix(kit.RUST, kit.INK, 0.55), kit.BONE, "chapters 24 to 33")]


def _movement(k, row):
    head, name, pic, ground, thr, span = row

    @asset(G, f"movement-{k + 1}", group="chapters", title=f"{head}: {name}", w=1600, h=900, row=ROW)
    def draw(a: Art):
        kit.linen(a, ground, cell=3.5, grain=0.3)
        kit.lamp(a, 800, 470, 420, kit.AMBER, 0.25 + 0.2 * k)
        # a sampler's alphabet rows, top and bottom
        kit.xtext(a, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 800, 46, 5.4, kit.mix(thr, ground, 0.55), align="center")
        kit.xtext(a, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 800, 808, 5.4, kit.mix(thr, ground, 0.55), align="center")
        kit.band(a, 120, 112, 1360, 6, kit.mix(kit.RUST, ground, 0.15), kit.AMBER, seed=k + 70)
        kit.band(a, 120, 760, 1360, 6, kit.mix(kit.RUST, ground, 0.15), kit.AMBER, seed=k + 70)
        kit.xtext(a, head, 800, 176, 8, kit.mix(thr, ground, 0.25), align="center")
        cnt = counted(a, ground)
        kit.icon(a, pic, 800 - 125, 268, 2.5, thr, accent=kit.mix(thr, ground, 0.5), linec=kit.mix(ground, thr, 0.2), hole=ground,
                 warm=kit.AMBER if k < 2 else kit.RED, over=cnt, lw=2.4, dash="4 3")
        for i, kind in enumerate(["bear", "rabbit", "cat", "dog", "bear"]):
            for side in (0, 1):
                x = 150 + i * 88 if side == 0 else 1600 - 150 - i * 88 - 66
                kit.sprite(a, kind, x, 420, 6, kit.mix([kit.RUST, kit.SKY, kit.BONE, kit.MOSS, kit.DUST][i], ground, 0.25 + 0.1 * k),
                           eye=kit.AMBER if k else ground, nose=ground)
        kit.xtext(a, name, 800, 574, 15, thr, shadow=kit.AMBER if k < 2 else kit.RED, align="center")
        a.text(800, 746, span, size=28, family="serif", fill=kit.mix(thr, ground, 0.3), text_anchor="middle", letter_spacing=6)
        kit.shade(a, 0.5)
    draw.__doc__ = (f"The card for the {head.lower()}, \"{name}\": a dark sampler with its alphabet rows, the name in "
                    f"cross-stitch and a row of toys either side of the picture.")


for _k, _r in enumerate(MOVEMENTS):
    _movement(_k, _r)

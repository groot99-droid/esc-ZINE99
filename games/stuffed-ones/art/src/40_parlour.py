"""Parlour: the cloth board, its thirty symbols, the button pegs and the scoresheet, in felt appliqué."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Parlour board, symbols, button pegs, scoresheet"
C, P, R, E = kit.C, kit.P, kit.R, kit.E

SPACES = ["door", "leaf", "cup", "key", "bird", "boot", "knot", "star", "chair", "two", "fish", "bell", "window", "acorn",
          "thimble", "lamp", "feather", "spool", "stair", "tree", "hat", "button", "moon", "scissors", "bed", "mushroom",
          "candle", "book", "needle", "hearth"]
NAMES = {"two": "Two", "knot": "the Knot", "door": "the Door", "hearth": "the Hearth", "lamp": "the Lamp", "bird": "the Bird",
         "tree": "the Tree"}


def space_colours(k):
    cloth = kit.FELTS[(k * 3 + k // 4) % len(kit.FELTS)]
    if SPACES[k] == "hearth":
        cloth = kit.CEDAR
    pale = kit.light(kit.DUST, 0.45)
    darkish = sum(int(cloth[i:i + 2], 16) for i in (1, 3, 5)) < 400
    main = pale if darkish else kit.CEDAR_D
    if SPACES[k] in ("leaf", "tree", "acorn"):
        main = kit.MOSS if not darkish or cloth == kit.CEDAR else pale
    return cloth, main


def _symbol(k, name):
    cloth, main = space_colours(k)
    label = NAMES.get(name, "the " + name.capitalize())

    @asset(G, f"symbol-{k + 1:02d}-{name}", group="pieces", title=f"Parlour space {k + 1}: {label}", w=180, h=180, row=ROW)
    def draw(a: Art):
        kit.linen(a, kit.mix(kit.DUST, kit.LINEN, 0.5), cell=3)
        rot = a.rng.uniform(-5, 5)
        a.open("g", transform=f"rotate({f(rot)} 90 90)")
        sq = R(18, 18, 144, 144, 16)
        kit.felt(a, sq, cloth, edge=kit.BONE, depth=10, gap=8, w=2)
        kit.icon(a, name, 90 - 50, 90 - 52, 1.0, main, accent=kit.mix(main, kit.RUST, 0.55) if main != kit.MOSS else kit.CEDAR,
                 linec=kit.mix(main, cloth, 0.75), hole=kit.dark(cloth, 0.35), as_felt=True, edge=None, lw=3)
        a.close()
        # the space number, in a tiny stitched roundel
        a.circle(152, 152, 17, fill=kit.BONE, stroke=kit.CEDAR, stroke_width=1.4, stroke_dasharray="3 2.4")
        a.text(152, 157.5, str(k + 1), size=16, family="serif", fill=kit.INK, text_anchor="middle", font_weight="bold")
        kit.shade(a, 0.22)
    draw.__doc__ = (f"Space {k + 1} of the counting-game cloth: {label}, a cut-felt picture on a whip-stitched felt "
                    f"square, with its number in a stitched roundel.")


for _k, _n in enumerate(SPACES):
    _symbol(_k, _n)


# ---- the pegs ---------------------------------------------------------------------------------------
PEGS = [("noor", "Noor", kit.RUST, "round"), ("wes", "Wes", kit.SKY, "flat"), ("ana", "Ana", kit.MOSS, "square"),
        ("sol", "Sol", kit.mix(kit.CEDAR, kit.DUST, 0.45), "horn"), ("rosa", "Rosa", kit.light(kit.RUST, 0.45), "flower"),
        ("kit", "Kit", kit.NIGHT, "dome"), ("ruth", "", kit.BONE, "bone")]


def _peg(k, row):
    pid, name, col, kind = row
    who = f"{name}'s" if name else "The peg that is nobody's"

    @asset(G, f"peg-{pid}", group="pieces", title=f"{who} button peg" if name else who, w=200, h=200, row=ROW)
    def draw(a: Art):
        ground = kit.FELTS[(k * 5 + 2) % len(kit.FELTS)] if name else kit.mix(kit.DUST, kit.LINEN, 0.5)
        if name:
            a.paper(ground, grain=0.0)
            a.rect(0, 0, 200, 200, fill=ground, filter=kit.felt_filter(a, shadow=0))
        else:
            kit.linen(a, ground, cell=3)
        kit.thread(a, C(100, 96, 76), kit.BONE if name else kit.CEDAR, w=2, dash="6 5")
        x, y, r = 100, 96, 54
        a.ellipse(x + 8, y + 12, r, r * 0.96, fill="#1a0f08", opacity=0.35, filter=a.blur(5))
        if kind in ("round", "flat", "horn"):
            kit.button(a, x, y, r, col, thr=kit.BONE if kind != "flat" else kit.CEDAR, holes=2 if kind == "flat" else 4, shadow=False)
            if kind == "horn":
                for i in range(5):
                    a.path(f"M{x - 44},{y - 20 + i * 11}q44,{-14 + i * 6} 88,0", fill="none", stroke=kit.dark(col, 0.35),
                           stroke_width=3, opacity=0.35, clip_path=a.clip(f'<circle cx="{x}" cy="{y}" r="{r - 3}"/>'))
        elif kind == "square":
            a.path(R(x - 48, y - 48, 96, 96, 20), fill=col, stroke=kit.dark(col, 0.4), stroke_width=4)
            a.path(R(x - 36, y - 36, 72, 72, 12), fill="none", stroke=kit.dark(col, 0.2), stroke_width=3)
            a.path(f"M{x - 40},{y - 24}a26,26 0 0,1 22,-18", fill="none", stroke=kit.light(col, 0.6), stroke_width=4,
                   stroke_linecap="round")
            for dx in (-12, 12):
                for dy in (-12, 12):
                    a.circle(x + dx, y + dy, 5, fill=kit.dark(col, 0.65))
            a.path(f"M{x - 12},{y - 12}V{y + 12}M{x + 12},{y - 12}V{y + 12}", stroke=kit.BONE, stroke_width=5, stroke_linecap="round")
        elif kind == "flower":
            pts = []
            for i in range(64):
                t = i * math.pi / 32
                rr = r * (0.9 + 0.1 * math.cos(8 * t))
                pts.append((x + rr * math.cos(t), y + rr * math.sin(t)))
            a.path(P(*pts), fill=col, stroke=kit.dark(col, 0.4), stroke_width=3)
            a.circle(x, y, 26, fill=kit.dark(col, 0.15), stroke=kit.dark(col, 0.35), stroke_width=2)
            for i in range(8):
                t = i * math.pi / 4
                a.line(x + 28 * math.cos(t), y + 28 * math.sin(t), x + 46 * math.cos(t), y + 46 * math.sin(t),
                       stroke=kit.dark(col, 0.3), stroke_width=2)
            a.circle(x - 8, y, 4.5, fill=kit.dark(col, 0.7)), a.circle(x + 8, y, 4.5, fill=kit.dark(col, 0.7))
            a.line(x - 8, y, x + 8, y, stroke=kit.MOSS, stroke_width=5, stroke_linecap="round")
        elif kind == "dome":
            a.circle(x, y, r, fill=a.radial([(0, kit.light(col, 0.5), 1), (0.5, col, 1), (1, kit.dark(col, 0.5), 1)], cx=0.36, cy=0.32,
                                             r=0.75), stroke=kit.dark(col, 0.6), stroke_width=3)
            a.ellipse(x - 18, y - 22, 13, 7, fill=kit.BONE, opacity=0.55, transform=f"rotate(-35 {x - 18} {y - 22})")
            a.path(C(x, y, r - 10), fill="none", stroke=kit.light(col, 0.3), stroke_width=1.5, stroke_dasharray="2 6")
        else:  # Ruth's: old bone, chipped, tied with red wool
            a.path(a.wobble_d([(x + r * math.cos(i * math.pi / 14), y + r * math.sin(i * math.pi / 14) * (0.8 if 3 < i < 6 else 1))
                               for i in range(28)], amp=0.8, step=30, closed=True), fill=kit.mix(kit.BONE, kit.DUST, 0.5),
                   stroke=kit.mix(kit.DUST, kit.CEDAR, 0.5), stroke_width=3)
            a.circle(x, y, r * 0.66, fill="none", stroke=kit.mix(kit.DUST, kit.CEDAR, 0.3), stroke_width=2.5)
            a.path(f"M{x - 30},{y - 34}q20,30 4,62M{x + 18},{y - 44}q-6,24 12,40", fill="none", stroke=kit.mix(kit.DUST, kit.CEDAR, 0.4),
                   stroke_width=1.2)
            for dx, dy in ((-13, -13), (13, -13), (-13, 13), (13, 13)):
                a.circle(x + dx, y + dy, 5.5, fill=kit.CEDAR_D)
            a.path(f"M{x - 13},{y - 13}L{x + 13},{y + 13}M{x + 13},{y - 13}L{x - 13},{y + 13}", stroke=kit.RED, stroke_width=6.5,
                   stroke_linecap="round")
            a.path(a.smooth_d([(x + 13, y + 13), (x + 40, y + 34), (x + 58, y + 22), (x + 74, y + 50), (x + 96, y + 46)]), fill="none",
                   stroke=kit.RED, stroke_width=4, stroke_linecap="round")
            # the mark it left: it has moved one space on
            kit.thread(a, C(42, 150, 26), kit.mix(kit.CEDAR, ground, 0.4), w=1.6, dash="3 4", shadow=False)
        if name:
            kit.tag(a, 108, 158, 80, 30, name, size=18, rot=-6)
        kit.shade(a, 0.3)
    draw.__doc__ = (f"{name}'s peg for the counting game: a {kind} button on a felt mark, with a cloth name tag."
                    if name else "The peg that belongs to no guest: an old chipped bone button tied with red wool, "
                    "sitting one space on from the mark where it was left.")


for _k, _row in enumerate(PEGS):
    _peg(_k, _row)


# ---- the board --------------------------------------------------------------------------------------
@asset(G, "parlour-board", group="maps", title="The counting-game cloth", w=1400, h=1400, row=ROW)
def board(a: Art):
    """The cabin's counting game seen from above: an embroidered cloth with thirty felt spaces in a
    spiral from the Door at the rim to the Hearth at the centre, each with its small cut-felt picture,
    joined by a line of running stitch; the Hearth is the one warm place on it."""
    kit.linen(a, kit.mix(kit.DUST, kit.LINEN, 0.5), cell=4)
    kit.whip(a, R(30, 30, 1340, 1340, 26), kit.RUST, w=3, depth=22, gap=14)
    kit.thread(a, R(62, 62, 1276, 1276, 18), kit.MOSS, w=3, dash="12 8")
    for cx, cy in ((96, 96), (1304, 96), (96, 1304), (1304, 1304)):
        kit.button(a, cx, cy, 20, kit.CEDAR)
    pos = []
    n = len(SPACES)
    # equal steps of arc along an Archimedean spiral, outside in; the Hearth sits at the centre
    def walk(b):
        th, out = 0.0, []
        for _ in range(n - 1):
            r = 575 - b * th
            out.append((r, th))
            th += 152 / max(r, 60)
        return out
    lo, hi = 0.0, 200.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if walk(mid)[-1][0] > 200:
            lo = mid
        else:
            hi = mid
    for r, th in walk(lo):
        ang = math.radians(200) + th
        pos.append((700 + r * math.cos(ang), 700 + r * math.sin(ang), math.degrees(ang) + 90))
    pos.append((700, 700, 0))
    kit.thread(a, a.smooth_d([(x, y) for x, y, _ in pos]), kit.CEDAR, w=5, dash="16 10")
    kit.lamp(a, 700, 700, 330, kit.AMBER, 0.6)
    for k, (x, y, rot) in enumerate(pos):
        cloth, main = space_colours(k)
        s = 124 if k < n - 1 else 170
        a.open("g", transform=f"translate({f(x)} {f(y)}) rotate({f(rot + a.rng.uniform(-4, 4)) if k < n - 1 else 0})")
        kit.felt(a, R(-s / 2, -s / 2, s, s, 14), cloth, edge=kit.BONE, depth=9, gap=8, w=2)
        sc = s / 124 * 0.8
        kit.icon(a, SPACES[k], -50 * sc, -52 * sc, sc, main, accent=kit.mix(main, kit.RUST, 0.55) if main != kit.MOSS else kit.CEDAR,
                 linec=kit.mix(main, cloth, 0.75), hole=kit.dark(cloth, 0.35), lw=3.4)
        a.close()
    a.text(700, 1326, "FROM THE DOOR TO THE HEARTH", size=24, family="serif", fill=kit.CEDAR, text_anchor="middle",
           letter_spacing=10)
    kit.shade(a, 0.3)


# ---- the scoresheet ---------------------------------------------------------------------------------
@asset(G, "parlour-scoresheet", group="documents", title="The scoresheet", w=800, h=1100, row=ROW)
def scoresheet(a: Art):
    """The guests' scoresheet for the counting game, kept in one neat hand: three columns of words said
    and spaces reached, a Knot that sent a peg back three, and a pencilled question mark where a peg
    is not where the sheet says it should be."""
    a.paper(kit.mix(kit.CEDAR, kit.INK, 0.25), grain=0.3, fibre=0.4)
    a.open("g", transform="rotate(-1.6 400 550)")
    a.rect(60, 50, 680, 1000, fill="#1a0f08", opacity=0.35, filter=a.blur(8), transform="translate(8 12)")
    a.rect(60, 50, 680, 1000, fill=kit.light(kit.DUST, 0.6))
    a.rect(60, 50, 680, 1000, fill=kit.weave_pattern(a, 2.2, kit.BONE, kit.CEDAR, 0.3, 0.06))
    pen, pencil = kit.NIGHT, kit.mix(kit.INK, kit.DUST, 0.45)
    a.text(400, 128, "The Counting Game", size=46, family="cursive", fill=pen, text_anchor="middle")
    a.path("M120,150H680", stroke=pen, stroke_width=1.6)
    a.path("M120,156H680", stroke=pen, stroke_width=0.6)
    cols = [("Noor", 130), ("Wes", 330), ("Ana", 530)]
    rows = [[("kettle", 2), ("candle", 2), ("mountain", 2), ("lantern", 2), ("butterfly", 3), ("porch", 1), ("yesterday", 3)],
            [("banana", 3), ("door", 1), ("ridiculous", 4), ("moon", 1), ("cinnamon", 3), ("blanket", 2), ("owl", 1)],
            [("quiet", 2), ("river", 2), ("wonderful", 3), ("home", 1), ("button", 2), ("lullaby", 3), ("stone", 1)]]
    for name, x in cols:
        a.text(x + 80, 214, name, size=34, family="cursive", fill=pen, text_anchor="middle")
        a.path(f"M{x},{228}h170", stroke=pen, stroke_width=1.2)
    for x in (320, 520):
        a.path(f"M{x},180V920", stroke=pen, stroke_width=0.8, opacity=0.7)
    for j in range(8):
        a.path(f"M120,{300 + j * 88}H680", stroke=kit.SKY, stroke_width=0.9, opacity=0.8)
    for c, (name, x) in enumerate(cols):
        posn = 1
        for j, (wd, syl) in enumerate(rows[c]):
            y = 286 + j * 88
            posn += syl
            knot = SPACES[posn - 1] == "knot"
            a.text(x + 4, y, wd, size=27, family="cursive", fill=pen)
            if knot:
                a.text(x + 128, y, str(posn), size=24, family="cursive", fill=pen, text_decoration="line-through")
                a.path(f"M{x + 122},{y - 8}l34,-4", stroke=pen, stroke_width=1.4)
                posn -= 3
                a.text(x + 100, y + 30, f"Knot!  {posn}", size=20, family="cursive", fill=kit.RUST)
            else:
                a.text(x + 132, y, str(posn), size=26, family="cursive", fill=pen)
            if c == 1 and j == 4:
                a.circle(x + 144, y - 9, 22, fill="none", stroke=pencil, stroke_width=1.6)
                a.text(x + 150, y + 36, "?", size=30, family="cursive", fill=pencil)
    a.text(130, 980, "one space for every syllable.  no word twice.", size=22, family="cursive", fill=pen)
    a.text(130, 1014, "first to the Hearth.", size=22, family="cursive", fill=pen)
    # a pencil stub lying on the sheet
    a.open("g", transform="rotate(24 600 990)")
    a.rect(520, 982, 150, 14, fill=kit.MOSS, stroke=kit.dark(kit.MOSS, 0.4), stroke_width=1)
    a.path(P((670, 982), (694, 989), (670, 996)), fill=kit.DUST)
    a.path(P((686, 986.6), (694, 989), (686, 991.4)), fill=kit.INK)
    a.rect(506, 982, 14, 14, fill=kit.RUST)
    a.close()
    a.close()
    kit.lamp(a, 180, 120, 620, kit.AMBER, 0.16)
    kit.shade(a, 0.4)

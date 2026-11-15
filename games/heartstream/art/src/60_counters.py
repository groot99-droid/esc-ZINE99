"""Bone Counters: the board, the counter, six mark pieces, the finished board and the hall wall. Linocut: bold
carved black on cream, gouge marks in the pits."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Counters: board, counter, 6 mark pieces, the finished board, the hall wall"
INK, CREAM = kit.INK, kit.CREAM


def pit(a, cx, cy, rx, ry, ink=INK, cream=CREAM):
    a.ellipse(cx, cy, rx, ry, fill=cream)
    d = []
    for _ in range(int(rx / 6)):        # gouge crescents left in the pit
        an = a.rng.uniform(0, 2 * math.pi)
        rr = a.rng.uniform(.35, .82)
        x, y = cx + rx * rr * math.cos(an), cy + ry * rr * math.sin(an)
        L = a.rng.uniform(8, 20)
        d.append(f"M{f(x)},{f(y)} q{f(L * .5)},{f(-L * .3)} {f(L)},0")
    a.path("".join(d), fill="none", stroke=ink, stroke_width=3, stroke_linecap="round")
    a.path(f"M{f(cx - rx * .82)},{f(cy + ry * .2)} A{f(rx * .86)},{f(ry * .86)} 0 0,0 {f(cx + rx * .5)},{f(cy + ry * .72)}", fill="none", stroke=ink, stroke_width=4,
           stroke_linecap="round", opacity=0.8)


def piece(a, x, y, s=1.0, fill=INK, hi=CREAM, rot=0):
    a.open("g", transform=f"rotate({f(rot)} {f(x)} {f(y)})")
    a.path(kit.lozenge_d(x, y, 20 * s, 13 * s), fill=fill)
    a.path(f"M{f(x - 10 * s)},{f(y - 5 * s)} q{f(9 * s)},{f(-7 * s)} {f(19 * s)},{f(-1 * s)}", fill="none", stroke=hi, stroke_width=2.2 * s, stroke_linecap="round")
    a.close()


def big_board(a, ink=INK, cream=CREAM, x=110, y=170, w=1380, h=560):
    """The block of the board; returns hollow centres [row][i] and keep centres."""
    a.rect(x, y, w, h, rx=150, fill=ink)
    kit.gouges(a, x, y - 26, w, 26, 60, ink, ang=90, spread=20, ln=(8, 22), sw=4)
    kit.gouges(a, x, y + h, w, 26, 60, ink, ang=90, spread=20, ln=(8, 22), sw=4)
    kit.gouges(a, x + 40, y + 12, w - 80, h - 24, 150, cream, ang=8, spread=14, ln=(8, 20), sw=3,
               density=lambda px, py: 1.0 if (abs(py - (y + h / 2)) < 26 or abs(py - y) < 40 or abs(py - y - h) < 40) else 0.0)
    keeps = [(x + 130, y + h / 2), (x + w - 130, y + h / 2)]
    for kx, ky in keeps:
        pit(a, kx, ky, 82, 200, ink, cream)
    holes = [[(x + 300 + i * (w - 600) / 4, y + 150 + r * (h - 300)) for i in range(5)] for r in range(2)]
    for row in holes:
        for cx, cy in row:
            pit(a, cx, cy, 78, 70, ink, cream)
    return holes, keeps


@asset(G, "counters-board", group="maps", title="The Bone Counters board", w=1600, h=900, row=ROW)
def board(a: Art):
    """The sowing board cut as a linocut: a black block with two rows of five cream hollows and a long keep at each
    end, gouge marks left in every pit, a tally of rounds won cut in the rim, and the anticlockwise way of sowing
    shown as a row of small cuts."""
    kit.block_open(a, 22, color=CREAM, rough=2.5)
    holes, keeps = big_board(a)
    # the way round: small chevrons, anticlockwise
    d = []
    for i in range(4):
        x = (holes[1][i][0] + holes[1][i + 1][0]) / 2
        d.append(f"M{f(x - 10)},{f(holes[1][0][1] - 12)} l14,12 l-14,12")
        x = (holes[0][i][0] + holes[0][i + 1][0]) / 2
        d.append(f"M{f(x + 10)},{f(holes[0][0][1] - 12)} l-14,12 l14,12")
    a.path("".join(d), fill="none", stroke=kit.RIVER, stroke_width=6, stroke_linecap="round", stroke_linejoin="round")
    # rim tally: rounds won, each side
    for k in range(2):
        a.line(300 + k * 22, 190, 304 + k * 22, 226, stroke=CREAM, stroke_width=7, stroke_linecap="round")
    a.line(1290, 676, 1294, 712, stroke=CREAM, stroke_width=7, stroke_linecap="round")
    # the beat, cut beneath
    for k in range(12):
        x = 330 + k * 86
        a.path(f"M{x},800 h18 l8,-26 l12,48 l8,-22 h18", fill="none", stroke=kit.RIVER if k == 0 else INK, stroke_width=5, stroke_linecap="round",
               stroke_linejoin="round", opacity=1 if k % 4 == 0 else 0.55)
    kit.caps(a, 800, 112, "BONE COUNTERS", size=44, spacing=14, font_weight="bold")
    a.close()


@asset(G, "counter-plain", group="pieces", title="A plain counter", w=160, h=160, row=ROW)
def counter_plain(a: Art):
    """One plain bone counter, a rounded lozenge, printed large from a small block: cream bone on black, a gouged
    highlight along its shoulder and the cuts of the knife around it."""
    cl = kit.block_open(a, 10, rough=2.2)
    kit.gouges(a, 10, 10, 140, 140, 70, CREAM, centre=(80, 80), ln=(6, 14), sw=2.6, density=lambda x, y: 1.0 if math.hypot(x - 80, (y - 80) * 1.4) > 68 else 0.0)
    a.path(kit.lozenge_d(80, 80, 54, 36), fill=CREAM)
    a.path("M40,92 q40,26 80,2", fill="none", stroke=INK, stroke_width=5, stroke_linecap="round")
    kit.gouges(a, 44, 58, 70, 20, 7, INK, ang=-8, spread=8, ln=(8, 18), sw=3)
    a.close()


for _m in kit.MARKS:
    def _mp(a: Art, m=_m):
        cl = kit.block_open(a, 10, rough=2.2)
        kit.gouges(a, 10, 10, 140, 140, 70, CREAM, centre=(80, 80), ln=(6, 14), sw=2.6, density=lambda x, y: 1.0 if math.hypot(x - 80, (y - 80) * 1.4) > 68 else 0.0)
        a.path(kit.lozenge_d(80, 80, 56, 40), fill=CREAM)
        a.path("M36,94 q44,28 88,2", fill="none", stroke=INK, stroke_width=4, stroke_linecap="round")
        kit.draw_mark(a, m, 80, 78, 23, color=kit.RIVER, sw=4.6 if m == "spiral" else 7)
        a.close()
    _mp.__doc__ = f"A brother's own counter piece, carved with the {_m} mark and printed as a linocut: the piece cream on black, the mark in the one red of the print."
    asset(G, f"counter-{_m}", group="pieces", title=f"Counter piece: {_m}", w=160, h=160, row=ROW)(_mp)


@asset(G, "counters-finished-board", group="maps", title="The Finished Board", w=1600, h=900, row=ROW)
def finished(a: Art):
    """The Finished Board, on the grey raft in the backwater: every hollow empty, both keeps heaped and counted, and
    four gifts laid in a row beside it. The only finished game in the world, printed in dead grey-rose; nobody is
    shown."""
    grey, dark, pale = kit.GREY, "#3a3032", "#e3d9d2"
    kit.block_open(a, 22, color=pale, rough=2.5, paper="#e9e0d8")
    # the raft's dry tissue: long flat cuts
    kit.gouges(a, 30, 30, 1540, 840, 260, grey, ang=2, spread=3, ln=(60, 220), sw=3, opacity=0.5)
    holes, keeps = big_board(a, ink=dark, cream=pale, y=130, h=500)
    r = a.rng
    for kx, ky in keeps:        # both keeps full: fifteen each
        for k in range(15):
            piece(a, kx + r.uniform(-34, 34), ky - 150 + k * 21 + r.uniform(-4, 4), 1.25, fill=dark, hi=pale, rot=r.uniform(-50, 50))
    for row in range(2):        # counted: fifteen cuts beside each keep, in fives
        for k in range(15):
            x = (150 if row == 0 else 1090) + k * 22 + (k // 5) * 16
            a.line(x, 664, x + 5, 700, stroke=dark, stroke_width=6, stroke_linecap="round")
    # four gifts in a row
    gx = [520, 700, 880, 1060]
    kw = dict(fill=grey, stroke=dark, stroke_width=6, stroke_linejoin="round")
    a.path(f"M{gx[0] - 60},770 h86 q34,-4 34,-30 q-2,-22 -24,-20 v14 q10,0 10,8 q0,12 -20,12 h-86Z", **kw)
    a.path(f"M{gx[1] - 66},764 q-14,-12 0,-24 l40,4 l92,8 l-92,8Z", **kw)
    a.path(f"M{gx[2] - 60},730 h120 v22 h-10 l-3,40 l-7,-40 h-10 l-3,44 l-7,-44 h-10 l-3,44 l-7,-44 h-10 l-3,44 l-7,-44 h-10 l-3,40 l-7,-40 h-10Z", **kw)
    a.path(f"M{gx[3] - 70},742 h140 v20 h-140Z", **kw)
    for k in range(4):
        a.circle(gx[3] - 36 + k * 26, 752, 4.5, fill=dark)
    for x in gx:
        a.line(x - 60, 812, x + 60, 812, stroke=dark, stroke_width=3, opacity=0.5)
    a.text(800, 858, "Both keeps are full. Nobody is here to say who won.", size=30, family="serif", fill=dark, text_anchor="middle", font_style="italic")
    kit.caps(a, 800, 92, "THE FINISHED BOARD", size=38, fill=dark, spacing=14, font_weight="bold")
    a.close()


@asset(G, "counters-hall-wall", group="backdrops", title="The hall wall of unfinished boards", w=1600, h=900, row=ROW)
def hall(a: Art):
    """The wall of the hall of unfinished boards: forty boards hung in rows, each stopped mid-game with its counters
    where the players left them, steady lamps between the rows. One board, the oldest, hangs lower and is a single
    sowing from finished."""
    cl = kit.block_open(a, 22, rough=2.6)
    a.open("g", clip_path=cl)
    kit.gouges(a, 22, 22, 1556, 856, 420, kit.MARROW2, ang=90, spread=6, ln=(20, 70), sw=3, opacity=0.9)
    kit.gouges(a, 22, 22, 1556, 856, 160, kit.GLOW, ang=90, spread=6, ln=(10, 30), sw=2.4, opacity=0.7)
    bid = a.uid("bd")
    pits = "".join(f'<ellipse cx="{28 + i * 22}" cy="{16 + r * 26}" rx="8.5" ry="8"/>' for i in range(5) for r in range(2))
    a.defn(f'<g id="{bid}"><rect x="-6" y="-8" width="156" height="74" rx="22" fill="{INK}"/><rect x="0" y="0" width="144" height="58" rx="16" fill="{CREAM}"/>'
           f'<g fill="{INK}">{pits}<ellipse cx="9" cy="29" rx="6" ry="19"/><ellipse cx="135" cy="29" rx="6" ry="19"/></g></g>')
    r = a.rng
    for row in range(5):
        for col in range(8):
            if row == 4 and col in (3, 4):
                continue
            x, y = 70 + col * 186 + r.uniform(-8, 8), 86 + row * 150 + r.uniform(-8, 8)
            rot = r.uniform(-3, 3)
            a.line(x + 72, y - 30, x + 72, y, stroke=CREAM, stroke_width=2.5)
            a.raw(f'<use href="#{bid}" transform="translate({f(x)},{f(y)}) rotate({f(rot)})"/>')
            d = []
            for i in range(5):
                for rr in range(2):
                    for _ in range(r.choice((0, 0, 1, 2, 3, 3, 4, 6))):
                        d.append(f"M{f(28 + i * 22 + r.uniform(-4, 4))},{f(16 + rr * 26 + r.uniform(-4, 4))}h0")
            for kx in (9, 135):
                for _ in range(r.randint(1, 9)):
                    d.append(f"M{f(kx + r.uniform(-2, 2))},{f(29 + r.uniform(-13, 13))}h0")
            a.path("".join(d), stroke=CREAM, stroke_width=4.6, stroke_linecap="round", fill="none", transform=f"translate({f(x)},{f(y)}) rotate({f(rot)})")
    for row in range(4):        # the lamps, steady
        for col in range(9):
            if (row + col) % 2 == 0:
                kit.lamp(a, 48 + col * 186, 206 + row * 150, 0.62, lit=1.0, ink=INK)
    # the oldest board, lower, larger, one sowing from finished
    x, y = 610, 690
    a.ellipse(800, 760, 330, 150, fill=a.radial([(0, kit.GOLD, 0.5), (1, kit.GOLD, 0)]))
    a.raw(f'<use href="#{bid}" transform="translate({x},{y}) scale(2.6)"/>')
    d = [f"M{f(x + 2.6 * (28 + 3 * 22) + dx)},{f(y + 2.6 * 42 + dy)}h0" for dx, dy in ((-6, -4), (7, 3))]
    for kx, n in ((9, 13), (135, 14)):
        for _ in range(n):
            d.append(f"M{f(x + 2.6 * (kx + r.uniform(-2, 2)))},{f(y + 2.6 * (29 + r.uniform(-14, 14)))}h0")
    a.path("".join(d), stroke=CREAM, stroke_width=11, stroke_linecap="round", fill="none")
    a.path("".join(d[:2]), stroke=kit.RIVER, stroke_width=11, stroke_linecap="round", fill="none")
    a.close()
    a.close()

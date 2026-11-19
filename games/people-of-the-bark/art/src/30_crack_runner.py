"""Crack runner, in sixteen-colour pixel art: four backdrops and three sprite sheets."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW_B = "Runner backdrops: spring, sap flow, frost with crowd, shadow"
ROW_S = "Runner sprite sheets: Mossa, crowd, hazards"
S = 10
CW, CH = 160, 90
P = kit.PIX16   # 0 crack, 1, 2, 3 umber, 4, 5 grey-brown, 6, 7 sage, 8 lime, 9 amber, 10 gold, 11 lantern, 12 red,
#                 13 paper, 14 tan, 15 white


def line(buf, x0, y0, x1, y1, c):
    x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(n + 1):
        x, y = round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n)
        if 0 <= y < len(buf) and 0 <= x < len(buf[0]):
            buf[y][x] = c


def box(buf, x, y, w, h, c):
    for j in range(max(0, y), min(len(buf), y + h)):
        for i in range(max(0, x), min(len(buf[0]), x + w)):
            buf[j][i] = c


def pix_person(buf, x, y, lean=0, hands=((-3, -8), (3, -8)), feet=((-2, 0), (2, 0)), cloth=6, skin=13, hair=2, limb=14,
               scarf=None, scarf_c=12, face=1, hood=None):
    """A bark person from a skeleton: big head, long thin limbs. (x, y) is the ground under the hips."""
    hip = (x, y - 7)
    sh = (x + lean, y - 12)
    for fx, fy in feet:
        kx, ky = (hip[0] + x + fx) / 2 + (1 if fx > 0 else -1) * (0 if abs(fx) < 3 else 1), (hip[1] + y + fy) / 2
        line(buf, hip[0], hip[1], kx, ky, limb)
        line(buf, kx, ky, x + fx, y + fy, limb)
    hx0 = sh[0]
    line(buf, sh[0] - 1, sh[1] + 1, x + hands[0][0], y + hands[0][1], limb)
    for j in range(5):
        t = j / 4
        cx = round(sh[0] + (hip[0] - sh[0]) * t)
        box(buf, cx - 2, sh[1] + j, 4, 1, cloth)
    line(buf, sh[0] + 1, sh[1] + 1, x + hands[1][0], y + hands[1][1], limb)
    box(buf, hx0 - 3, sh[1] - 7, 6, 6, skin)
    box(buf, hx0 - 3, sh[1] - 7, 6, 2, hair)
    buf[sh[1] - 6][hx0 - 3] = hair
    if hood is not None:
        box(buf, hx0 - 4, sh[1] - 8, 7, 3, hood)
        box(buf, hx0 - 4, sh[1] - 8, 2, 8, hood)
    if 0 <= sh[1] - 4 < len(buf):
        buf[sh[1] - 4][hx0 + face] = 0
    if scarf:
        box(buf, hx0 - 2, sh[1] - 1, 4, 1, scarf_c)
        px, py = hx0 - 2, sh[1] - 1
        for dx, dy in scarf:
            line(buf, px, py, px + dx, py + dy, scarf_c)
            px, py = px + dx, py + dy


# ---------------------------------------------------------------------------------------------
# backdrops
# ---------------------------------------------------------------------------------------------
def wall(a, tones=(2, 3, 3, 4), groove=1, groove_every=(6, 11), specks=260, speck_c=(2, 4)):
    r = a.rng
    buf = kit.pixbuf(CW, CH, 3)
    x = 0
    while x < CW:
        w = r.randint(*groove_every)
        t = r.choice(tones)
        for i in range(x, min(CW, x + w)):
            c = t if i - x < w - 2 else max(1, t - 1)
            if i == x + w - 1:
                c = groove
            for j in range(CH):
                buf[j][i] = c
        # a lit left lip on each ridge
        if x + 1 < CW:
            j = 0
            while j < CH:
                ln = r.randint(4, 14)
                if r.random() < 0.7:
                    for k in range(j, min(CH, j + ln)):
                        buf[k][x] = min(6, t + 1)
                j += ln + r.randint(1, 5)
        x += w
    for _ in range(3):
        kx, ky = r.randrange(8, CW - 16), r.choice([r.randrange(2, 14), r.randrange(CH - 12, CH - 8)])
        kit.stamp(buf, kx, ky, ["...kkk...", "..k...k..", ".k..k..k.", ".k.k.k.k.", ".k.k.k.k.", ".k..k..k.", "..k...k..", "...kkk..."],
                  {"k": 1})
    for _ in range(specks):
        i, j = r.randrange(CW), r.randrange(CH - 3)
        c = r.choice(speck_c)
        for k in range(r.randint(1, 3)):
            buf[j + k][i] = c
    return buf


def crack(a, buf, y_at, half_at, lip=5):
    """Cut the crack: a dark channel. Returns (top, bottom) per column."""
    edges = []
    for i in range(CW):
        c, h = y_at(i), half_at(i)
        top, bot = int(c - h), int(c + h)
        edges.append((top, bot))
        for j in range(max(0, top), min(CH, bot + 1)):
            d = min(j - top, bot - j)
            buf[j][i] = 0 if d > 1 else 1
        if 0 <= bot + 1 < CH:
            buf[bot + 1][i] = lip
        if 0 <= top - 1 < CH:
            buf[top - 1][i] = 2
    return edges


def ledges(a, buf, edges, spots, top_c=6, mid=4, low=3):
    out = []
    for (x, w, frac) in spots:
        top, bot = edges[min(CW - 1, x + w // 2)]
        y = int(top + (bot - top) * frac)
        out.append((x, y, w))
        for i in range(x, min(CW, x + w)):
            buf[y][i] = top_c
            buf[y + 1][i] = mid
            if (i - x) % 2 == 0 or i in (x, x + w - 1):
                buf[y + 2][i] = low
            if (i - x) % 5 == 2:
                buf[y + 3][i] = 2
    return out


def dwelling(buf, x, y, lit=True, c=4):
    kit.stamp(buf, x, y, [".ddd.", "ddddd", "ddLdd", "ddLdd"], {"d": c, "L": 11 if lit else 0})
    for i in range(-1, 6):
        if 0 <= y + 4 < CH and 0 <= x + i < CW:
            buf[y + 4][x + i] = 2


SPOTS = [(4, 14, 0.62), (24, 11, 0.42), (41, 13, 0.7), (60, 12, 0.5), (78, 10, 0.3), (93, 14, 0.66), (113, 11, 0.44),
         (129, 12, 0.72), (146, 12, 0.5)]


def base_scene(a, tones=(2, 3, 3, 4), slope=-0.2, y0=62, half=17):
    buf = wall(a, tones)
    edges = crack(a, buf, lambda i: y0 + slope * i + 5 * math.sin(i / 9.0), lambda i: half + 3 * math.sin(i / 5.3 + 1))
    return buf, edges


@asset(G, "runner-backdrop-spring", group="backdrops", title="Crack runner backdrop: spring", w=1600, h=900, row=ROW_B)
def bd_spring(a: Art):
    """The spring run from Highridge down to Lowridge: a wide crack in green-flushed bark, lichen tufts on its
    ledges, rain beads sitting in the grooves above, dwellings with lit doors on the ridges, and near the middle
    a paper floor with its tick mark: a ledge with a gallery under it."""
    buf, edges = base_scene(a, tones=(3, 3, 4, 4), slope=0.16, y0=44)
    led = ledges(a, buf, edges, SPOTS)
    r = a.rng
    # lichen on ridges and ledges
    for _ in range(46):
        x, y = r.randrange(2, CW - 5), r.randrange(2, CH - 4)
        if buf[y][x] in (3, 4) and buf[y + 2][x] in (3, 4):
            kit.stamp(buf, x, y, r.choice([[".g.", "gGg"], ["g.g.", "gGGg", ".gg."], ["gG", "Gg"]]), {"g": 7, "G": 8})
    for (x, y, w) in led[::2]:
        kit.stamp(buf, x + 2, y - 3, [".g.g.", "ggGgg", "gGGGg"], {"g": 7, "G": 8})
    # rain beads in grooves
    for x, y in ((18, 8), (52, 14), (88, 6), (120, 16), (150, 9), (70, 80), (136, 84)):
        kit.stamp(buf, x, y, [".bbb.", "bWbbb", "bbbbB", ".bBB."], {"b": 6, "W": 15, "B": 5})
        for k in range(1, 6):
            if y - k >= 0:
                buf[y - k][x + 2] = 14 if k % 2 else 6
    for x, y in ((8, 20), (34, 12), (100, 18), (142, 24), (24, 82), (104, 82)):
        dwelling(buf, x, y)
    # the paper floor: thin, with a gallery below and a tick mark above
    x, y, w = led[4]
    for i in range(x, x + w):
        buf[y][i] = 14
        buf[y + 1][i] = 0
        buf[y + 2][i] = 0 if (i - x) % 4 else 14
        buf[y + 3][i] = 0
    kit.stamp(buf, x + w // 2 - 2, y - 7, ["...t", "t.t.", ".t.."], {"t": 15})
    kit.emit_pixels(a, buf, S)


@asset(G, "runner-backdrop-sap-flow", group="backdrops", title="Crack runner backdrop: summer sap flow", w=1600, h=900,
       row=ROW_B)
def bd_sap(a: Art):
    """The summer run across to Splinterwatch through sap flow: bleached bark, three ropes of amber sap falling
    the height of the crack into gold pools, drips hanging from its upper lip, and the watchtower on its splinter
    at the far end. One of the three ledges under the middle fall is paper."""
    buf, edges = base_scene(a, tones=(3, 4, 4, 5), slope=-0.06, y0=50, half=20)
    led = ledges(a, buf, edges, SPOTS, top_c=14)
    r = a.rng
    for fx in (30, 74, 118):
        top, bot = edges[fx]
        for j in range(max(0, top - 14), bot):
            wdt = 3 if (j // 5) % 2 else 2
            for i in range(fx, fx + wdt):
                buf[j][i] = 9
            buf[j][fx] = 10
            if j % 7 == 3:
                buf[j][fx + wdt] = 10
        for i in range(fx - 5, fx + 8):
            buf[bot][i] = 10
            buf[bot + 1][i] = 9 if (i + fx) % 3 else 10
        for k in range(-14, -8):
            buf[max(0, top + k)][fx - 1] = 9
    for dx in range(8, CW - 4, 9):
        top = edges[dx][0]
        n = r.randint(2, 7)
        for j in range(top + 1, top + 1 + n):
            buf[j][dx] = 9
        buf[top + 2 + n][dx] = 10
    for _ in range(30):
        x, y = r.randrange(2, CW - 4), r.randrange(2, 26)
        if buf[y][x] in (4, 5):
            kit.stamp(buf, x, y, ["s", "S"], {"s": 9, "S": 10})
    # Splinterwatch
    kit.stamp(buf, 146, 2, ["t.t.t.t", "ttttttt", ".ttLtt.", ".ttttt.", ".ttttt.", ".ttLtt.", ".ttttt.", ".ttttt.", "..ttt..",
                            "..ttt..", "..ttt.."], {"t": 6, "L": 11})
    for x, y in ((12, 10), (96, 8), (50, 84)):
        dwelling(buf, x, y, c=5)
    # three ledges under the middle fall, one of them paper
    x, y, w = led[4]
    for i in range(x, x + w):
        buf[y][i] = 15
        buf[y + 1][i] = 0
        buf[y + 2][i] = 0
    kit.stamp(buf, x + 3, y - 6, ["...t", "t.t.", ".t.."], {"t": 15})
    kit.emit_pixels(a, buf, S)


@asset(G, "runner-backdrop-frost-crowd", group="backdrops", title="Crack runner backdrop: frost, with the crowd", w=1600,
       h=900, row=ROW_B)
def bd_frost(a: Art):
    """Against the Tide: the Long Crack in deep winter, frost on every ledge and a frozen sap bridge across the
    gap, with all Lowridge coming up it. A line of small figures carrying their doors on their backs fills the
    ledges, and one lantern is being passed hand to hand along them."""
    buf, edges = base_scene(a, tones=(2, 3, 5, 5), slope=-0.3, y0=70, half=18)
    led = ledges(a, buf, edges, SPOTS, top_c=15, mid=13)
    r = a.rng
    for _ in range(170):
        x, y = r.randrange(CW), r.randrange(CH - 1)
        if buf[y][x] in (3, 5, 2):
            buf[y][x] = r.choice([13, 14, 14, 15])
            if r.random() < 0.4 and x + 1 < CW:
                buf[y][x + 1] = 14
    # icicles from the upper lip
    for dx in range(3, CW - 2, 6):
        top = edges[dx][0]
        for j in range(top + 1, top + 2 + r.randint(1, 5)):
            buf[j][dx] = 15 if j % 2 else 13
    # the frozen sap bridge between two ledges
    (x1, y1, w1), (x2, y2, w2) = led[3], led[4]
    for i in range(x1 + w1, x2):
        t = (i - x1 - w1) / max(1, x2 - x1 - w1)
        y = round(y1 + (y2 - y1) * t + 2 * math.sin(math.pi * t))
        buf[y][i] = 10
        buf[y + 1][i] = 9
        if i % 3 == 0:
            buf[y][i] = 15
    # the crowd, coming up
    cloths = [6, 5, 7, 14, 12, 9]
    carried = None
    for n, (x, y, w) in enumerate(led):
        for k in range(w // 6 + (1 if w > 11 else 0)):
            px = x + 3 + k * 6
            if px >= CW - 3:
                continue
            c = cloths[(n * 3 + k) % len(cloths)]
            door = (n + k) % 2 == 0
            if door:
                box(buf, px - 5, y - 17, 3, 9, 4)
                buf[y - 13][px - 4] = 1
            lantern_here = (n, k) in ((4, 0), (5, 0), (3, 1))
            hands = ((-3, -8), (4, -15)) if lantern_here else ((-3, -8), (3, -9))
            pix_person(buf, px, y, hands=hands, cloth=c, feet=((-1, 0), (2, 0)), hood=5 if (n + k) % 3 == 0 else None)
            if (n, k) == (4, 0):
                carried = (px + 4, y - 18)
    if carried:
        cx, cy = carried
        kit.stamp(buf, cx - 2, cy - 2, [".gGg.", "gGWGg", "gWWWg", "gGWGg", ".gGg."], {"g": 9, "G": 11, "W": 15})
    for x, y in ((14, 8), (60, 12), (118, 6)):
        dwelling(buf, x, y, lit=False, c=5)
    kit.emit_pixels(a, buf, S)


@asset(G, "runner-backdrop-shadow", group="backdrops", title="Crack runner backdrop: the Shadow", w=1600, h=900, row=ROW_B)
def bd_shadow(a: Art):
    """The Shadow run: the same crack with a wall of dark moving up it from the left. Behind the edge everything
    is two tones darker and only lantern doors show; ahead, the last gold light. In the dark the tick marks are
    out, except on the floors the player's Pulse map has marked, which glow in cold chalk grey."""
    pal = list(P)
    pal[6] = kit.CHALK          # the sheet's one cold colour: the Pulse map's marks
    buf, edges = base_scene(a, tones=(3, 3, 4, 4), slope=-0.12, y0=56, half=18)
    led = ledges(a, buf, edges, SPOTS, top_c=14)
    for x, y in ((8, 10), (40, 6), (70, 14), (104, 8), (138, 12), (24, 82), (120, 84), (150, 80)):
        dwelling(buf, x, y)
    # paper floors
    marked = []
    for n in (1, 4, 6):
        x, y, w = led[n]
        for i in range(x, x + w):
            buf[y + 1][i] = 0
            buf[y + 2][i] = 0
        marked.append((x + w // 2 - 2, y - 7))
    # gold light ahead on the far right
    for j in range(CH):
        for i in range(134, CW):
            c = buf[j][i]
            if i >= 138 or (i + j) % 2 == 0:
                buf[j][i] = {4: 14, 3: 4, 2: 3, 5: 4, 1: 2}.get(c, c)
            if i >= 152 and c in (3, 4) and (j // 3 + i) % 4 == 0:
                buf[j][i] = 10
    # the shadow's edge
    dark = {4: 3, 3: 2, 2: 1, 5: 3, 14: 5, 13: 2, 15: 2, 9: 2, 10: 4, 1: 0, 0: 0, 7: 2, 8: 2}
    for j in range(CH):
        edge = 104 + int(7 * math.sin(j / 7.0) + 3 * math.sin(j / 2.3))
        for i in range(CW):
            c = buf[j][i]
            if i < edge - 3:
                buf[j][i] = dark.get(c, c)
            elif i < edge and (i + j) % 2 == 0:
                buf[j][i] = dark.get(c, c)
            elif i == edge:
                buf[j][i] = 0
    # lantern doors keep their light in the dark, with a small halo
    for x, y in ((8, 10), (40, 6), (70, 14), (24, 82)):
        kit.stamp(buf, x - 1, y + 1, ["..g..", ".gLg.", ".gLg."], {"g": 9, "L": 10})
    for i, (x, y) in enumerate(marked):
        kit.stamp(buf, x, y, ["...t", "t.t.", ".t.."], {"t": 6})
    kit.emit_pixels(a, buf, S, palette=pal)


# ---------------------------------------------------------------------------------------------
# sprite sheets
# ---------------------------------------------------------------------------------------------
SHEET_KEY = "#2a1c14"   # the sheets' ground: one step off palette colour 1, so the web modes can key it out


def sheet(a, cols, rows, cell_w, cell_h, labels, s=6):
    a.rect(0, 0, a.w, a.h, fill=SHEET_KEY)
    buf = kit.pixbuf(cols * cell_w, rows * cell_h, None)
    for j in range(rows * cell_h):
        for i in range(cols * cell_w):
            if i % cell_w == 0 or j % cell_h == 0:
                buf[j][i] = 0
            elif j % cell_h >= cell_h - 6:
                buf[j][i] = 2
    return buf


def labels_out(a, labels, cols, cell_w, cell_h, s):
    for n, lab in enumerate(labels):
        cx = (n % cols) * cell_w * s + cell_w * s / 2
        cy = (n // cols) * cell_h * s + cell_h * s - 9
        a.text(cx, cy, lab, size=13, family="monospace", fill=P[13], text_anchor="middle", font_weight="bold")


SC = [(-2, 0), (-3, -1), (-2, 1)]

MOSSA = [
    ("RUN 1", dict(lean=1, hands=((-4, -9), (4, -11)), feet=((-4, -1), (3, 0)), scarf=SC)),
    ("RUN 2", dict(lean=1, hands=((-2, -8), (2, -9)), feet=((-1, 0), (1, -2)), scarf=[(-2, 1), (-3, 0), (-2, -1)])),
    ("RUN 3", dict(lean=1, hands=((4, -11), (-4, -9)), feet=((3, 0), (-4, -1)), scarf=SC)),
    ("RUN 4", dict(lean=1, hands=((2, -9), (-2, -8)), feet=((1, -2), (-1, 0)), scarf=[(-2, -1), (-3, 0), (-2, 1)])),
    ("JUMP", dict(lean=1, hands=((-4, -15), (5, -14)), feet=((-3, -3), (4, -4)), scarf=[(-2, 2), (-2, 2), (-1, 2)])),
    ("CLING", dict(lean=2, hands=((5, -15), (5, -11)), feet=((4, -3), (4, 0)), scarf=[(-1, 2), (0, 3), (0, 2)])),
    ("ROLL", None),
    ("BRACE", dict(lean=0, hands=((-5, -6), (5, -6)), feet=((-4, 0), (4, 0)), scarf=[(-2, 1), (-1, 2)])),
    ("SLIDE", dict(lean=-1, hands=((1, -16), (2, -16)), feet=((-1, 0), (1, 0)), scarf=[(0, -3), (-1, -3), (0, -2)])),
    ("STUN", dict(lean=-2, hands=((-5, -5), (3, -5)), feet=((-4, 0), (3, 0)), scarf=[(-1, 2), (-2, 1)])),
    ("LISTEN", dict(lean=2, hands=((-3, -8), (5, -13)), feet=((-2, 0), (2, 0)), scarf=[(-1, 2), (0, 2)])),
    ("LANTERN", dict(lean=0, hands=((-3, -8), (5, -13)), feet=((-2, 0), (2, 0)), scarf=[(-2, 1), (-2, 1)])),
    ("DROP", dict(lean=1, hands=((-3, -9), (6, -9)), feet=((-3, 0), (2, 0)), scarf=[(-2, 0), (-2, -1)])),
    ("CATCH", dict(lean=0, hands=((-4, -17), (4, -17)), feet=((-2, 0), (2, 0)), scarf=[(-2, 1), (-1, 2)])),
    ("IDLE", dict(lean=0, hands=((-3, -7), (3, -7)), feet=((-2, 0), (2, 0)), scarf=[(-1, 2), (-1, 2), (0, 2)])),
    ("COUNT", dict(lean=0, hands=((-3, -7), (4, -12)), feet=((-2, 0), (2, 0)), scarf=[(-1, 2), (-1, 2)])),
]


@asset(G, "runner-sheet-mossa", group="figures", title="Crack runner sprites: Mossa", w=960, h=384, row=ROW_S)
def sheet_mossa(a: Art):
    """Mossa's sprite sheet, sixteen frames in two rows: four run frames, jump, cling, roll and brace; then the
    sap slide, the stun, listening at a wall, carrying Pell's lantern, dropping it to the crowd, catching it
    again, idle, and counting her steps. Her red scarf trails in every one."""
    cw, ch, s = 20, 32, 6
    buf = sheet(a, 8, 2, cw, ch, None)
    for n, (lab, pose) in enumerate(MOSSA):
        ox, oy = (n % 8) * cw + 10, (n // 8) * ch + ch - 7
        if pose is None:    # the roll: a tucked ball with the scarf wrapped round it
            kit.stamp(buf, ox - 5, oy - 9, ["...hhhh...", "..hFFFFS..", ".hFFFSSSS.", "rrrSSSSSSl", "rSSSSSSSll", ".SSSSSllll",
                                            "..llllll..", "...r......", "..rr......"], {"h": 1, "F": 13, "S": 6, "r": 12, "l": 1})
            continue
        pix_person(buf, ox, oy, **pose)
        if lab == "CLING":
            box(buf, ox + 6, oy - 24, 3, 25, 4)
            box(buf, ox + 6, oy - 24, 1, 25, 5)
        elif lab == "LISTEN":
            box(buf, ox + 6, oy - 24, 3, 25, 4)
            kit.stamp(buf, ox + 7, oy - 20, ["t", ".", "t", ".", "t"], {"t": 15})
        elif lab == "SLIDE":
            box(buf, ox + 1, oy - 30, 2, 15, 9)
            box(buf, ox + 1, oy - 30, 1, 15, 10)
        elif lab in ("LANTERN", "DROP", "CATCH"):
            lx, ly = {"LANTERN": (5, -15), "DROP": (7, -5), "CATCH": (0, -21)}[lab]
            kit.stamp(buf, ox + lx - 1, oy + ly - 1, [".G.", "GWG", ".G."], {"G": 11, "W": 15})
        elif lab == "STUN":
            kit.stamp(buf, ox - 5, oy - 24, ["s...s.", "..s...s"], {"s": 10})
        elif lab == "BRACE":
            kit.stamp(buf, ox - 8, oy - 2, ["z.z", ".z."], {"z": 11})
            kit.stamp(buf, ox + 6, oy - 2, ["z.z", ".z."], {"z": 11})
        elif lab == "COUNT":
            kit.stamp(buf, ox + 5, oy - 22, ["c.c.c"], {"c": 15})
    kit.emit_pixels(a, buf, s)
    labels_out(a, [m[0] for m in MOSSA], 8, cw, ch, s)


@asset(G, "runner-sheet-crowd", group="figures", title="Crack runner sprites: the crowd", w=960, h=384, row=ROW_S)
def sheet_crowd(a: Art):
    """The crowd of Lowridge, sixteen figures in two rows: walkers with their doors on their backs, an elder on
    a cane, a child, a hooded priest, a tapper with her mallet, two who lift and pass a lantern overhead, one
    who has sat down, and Sorrel pointing the way up."""
    cw, ch, s = 20, 32, 6
    buf = sheet(a, 8, 2, cw, ch, None)
    labs = ["DOOR 1", "DOOR 2", "ELDER", "CHILD", "PRIEST", "TAPPER", "PASS 1", "PASS 2", "CARRY", "PAIR", "REST", "SORREL",
            "WARRIOR", "SCHOLAR", "COOK", "WAIT"]
    for n, lab in enumerate(labs):
        ox, oy = (n % 8) * cw + 10, (n // 8) * ch + ch - 7
        if lab in ("DOOR 1", "DOOR 2"):
            box(buf, ox - 6, oy - 20, 4, 12, 4)
            box(buf, ox - 6, oy - 20, 1, 12, 5)
            buf[oy - 14][ox - 4] = 1
            pix_person(buf, ox, oy, lean=1, hands=((-3, -11), (3, -9)), feet=((-3, 0), (2, 0)) if lab == "DOOR 1" else ((-1, 0), (3, -1)),
                       cloth=5 if lab == "DOOR 1" else 7)
        elif lab == "ELDER":
            pix_person(buf, ox, oy, lean=2, hands=((-2, -8), (5, -8)), cloth=5, hood=5)
            line(buf, ox + 5, oy - 9, ox + 5, oy, 14)
        elif lab == "CHILD":
            pix_person(buf, ox, oy + 0, lean=0, hands=((-3, -7), (3, -14)), feet=((-1, 0), (1, 0)), cloth=8)
            kit.stamp(buf, ox + 4, oy - 22, [".k.", "kkk", ".k."], {"k": 14})
            line(buf, ox + 3, oy - 14, ox + 5, oy - 19, 6)
        elif lab == "PRIEST":
            pix_person(buf, ox, oy, hands=((-4, -15), (4, -15)), cloth=12, hood=12)
            box(buf, ox - 3, oy - 7, 6, 7, 12)
        elif lab == "TAPPER":
            pix_person(buf, ox, oy, hands=((-3, -8), (5, -14)), cloth=7)
            box(buf, ox + 4, oy - 18, 4, 3, 4)
        elif lab in ("PASS 1", "PASS 2"):
            up = ((-4, -17), (3, -17)) if lab == "PASS 1" else ((-3, -9), (6, -15))
            pix_person(buf, ox, oy, hands=up, cloth=6 if lab == "PASS 1" else 9)
            lx, ly = (0, -21) if lab == "PASS 1" else (7, -18)
            kit.stamp(buf, ox + lx - 2, oy + ly - 2, [".g.g.", "gGWGg", ".GWG.", "gGGGg"], {"g": 9, "G": 11, "W": 15})
        elif lab == "CARRY":
            pix_person(buf, ox, oy, hands=((-4, -13), (4, -13)), cloth=14)
            box(buf, ox - 5, oy - 17, 10, 4, 4)
            box(buf, ox - 5, oy - 17, 10, 1, 6)
        elif lab == "PAIR":
            pix_person(buf, ox - 4, oy, hands=((-2, -8), (2, -9)), cloth=5)
            pix_person(buf, ox + 5, oy, hands=((-2, -9), (2, -7)), cloth=12, feet=((-1, 0), (1, 0)))
        elif lab == "REST":
            pix_person(buf, ox, oy + 5, hands=((-3, -5), (4, -5)), feet=((3, -4), (5, -5)), cloth=6, hood=6)
            box(buf, ox - 6, oy - 1, 12, 1, 4)
        elif lab == "SORREL":
            pix_person(buf, ox, oy, lean=0, hands=((-4, -6), (6, -17)), cloth=7, hair=12)
            box(buf, ox - 6, oy - 8, 3, 2, 4)
        elif lab == "WARRIOR":
            pix_person(buf, ox, oy, hands=((-3, -8), (4, -10)), cloth=4, hair=11)
            line(buf, ox + 4, oy, ox + 4, oy - 24, 14)
            buf[oy - 25][ox + 4] = 15
        elif lab == "SCHOLAR":
            pix_person(buf, ox, oy, hands=((-3, -8), (3, -11)), cloth=13)
            box(buf, ox + 2, oy - 14, 4, 2, 15)
            box(buf, ox - 5, oy - 9, 3, 4, 9)
        elif lab == "COOK":
            pix_person(buf, ox, oy, hands=((-3, -8), (5, -15)), cloth=9)
            kit.stamp(buf, ox + 4, oy - 18, ["lll", ".l."], {"l": 10})
        else:
            pix_person(buf, ox, oy, hands=((-2, -6), (2, -6)), cloth=5, feet=((-1, 0), (1, 0)))
    kit.emit_pixels(a, buf, s)
    labels_out(a, labs, 8, cw, ch, s)


HAZ = [
    ("SAP DRIP", ["....aa....", "....aa....", "....ga....", "....aa....", "....ga....", "....a.....", "..........", "....g.....",
                  "...gag....", "...aaa....", "....a.....", "..........", "..gaaaag..", ".gaaaaaag."]),
    ("SAP FALL", ["...gaa....", "...gaa....", "...gaaa...", "...gaa....", "...gaa....", "..ggaa....", "...gaa....", "...gaaa...",
                  "...gaa....", "...gaa....", "...gaa....", "..ggaaa...", ".gaaaaaag.", "gaagaagaag"]),
    ("DUST SHEET", ["d.d.d.d.d.", ".d.d.d.d.d", "d.d.ddd.d.", ".ddd.d.d.d", "d.d.d.ddd.", ".d.d.d.d.d", "ddd.d.d.d.", ".d.d.ddd.d",
                    "d.d.d.d.d.", ".d.ddd.d.d", "d.d.d.d.d.", ".d.d.d.d.d", "d...d...d.", "..d...d..."]),
    ("SPIKES", ["..........", "..........", "..........", "..........", "....w.....", "....w...w.", ".w..t...t.", ".t..t..wt.",
                ".t.wt..tt.", "wt.tt..tt.", "tt.tt.wtt.", "tt.tttttt.", "bbbbbbbbbb", "BBBBBBBBBB"]),
    ("LICHEN TUFT", ["..........", "..........", "....u.....", "...u......", "..........", "..l...l...", ".l.l.l.l..", "..lLl.lLl.",
                     ".lLLLlLLl.", "lLLLLLLLLl", "lLLlLLLlLl", ".lLLLLLLl.", "bbbbbbbbbb", "BBBBBBBBBB"]),
    ("MITE", ["..........", "..........", "..........", "..........", "..........", "..m....m..", "...m..m...", "..mrrrrm..",
              ".mrRRRRrm.", "mrRwRRwRrm", ".mrRRRRrm.", "m.m.mm.m.m", "bbbbbbbbbb", "BBBBBBBBBB"]),
    ("RAIN BEAD", ["..........", "....e.....", "....e.....", "...eee....", "..eeeee...", ".eeWWeee..", ".eWWeeee..", "eeWeeeeEe.",
                   "eeeeeeeEe.", "eeeeeeEEe.", ".eeeeEEe..", "..eEEEe...", "bbbbbbbbbb", "BBBBBBBBBB"]),
    ("ICE SLIDE", ["..........", "..........", "..........", "..........", "..........", "..........", ".........w", ".......wWi",
                   ".....wWiii", "...wWiiiii", ".wWiiiWiii", "WiiiiWiiii", "bbbbbbbbbb", "BBBBBBBBBB"]),
    ("SAP BRIDGE", ["..........", "..........", "..........", "..........", "..........", "..........", "b........b", "bg......gb",
                    "baagwgaaab", "b.aaaaaa.b", "b...ka...b", "b....k...b", "b........b", "b........b"]),
    ("PAPER FLOOR", ["..........", "......w...", "..w..w....", "...ww.....", "..........", "..........", "..........", "pppppppppp",
                     "..........", "..p....p..", ".p......p.", "..........", "...p..p...", ".........."]),
    ("SHADOW EDGE", ["kkkkkkk.k.", "kkkkkk.k..", "kkkkkkk.k.", "kkkkkkkk..", "kkkkkkk.k.", "kkkkkk.k..", "kkkkkkk...", "kkkkkkkk.k",
                     "kkkkkkk.k.", "kkkkkk....", "kkkkkkk.k.", "kkkkkkkk..", "kkkkkkk.k.", "kkkkkk.k.."]),
    ("BRACE", ["..........", "...oooo...", "..oooooo..", ".oooWWooo.", ".oooWWooo.", ".oooWWooo.", ".oooWWooo.", ".oooooooo.", ".oooWWooo.",
               "..oooooo..", "...oooo...", "..........", "..........", ".........."]),
]
HPAL = {"a": 9, "g": 10, "d": 14, "t": 6, "w": 15, "b": 4, "B": 3, "l": 7, "L": 8, "u": 10, "m": 1, "r": 12, "R": 11, "e": 6,
        "W": 15, "E": 5, "i": 13, "k": 0, "p": 14, "o": 11}


@asset(G, "runner-sheet-hazards", group="pieces", title="Crack runner sprites: hazards", w=924, h=504, row=ROW_S)
def sheet_hazards(a: Art):
    """The runner's hazards as twelve tiles: sap drip, sap fall, dust sheet, splinter spikes, lichen tuft, mite,
    rain bead, ice slide, frozen sap bridge, the paper floor under its tick mark, the shadow's edge, and the
    brace marker that lights three seconds before a forecast tremor."""
    cw, ch, s = 22, 36, 7
    buf = sheet(a, 6, 2, cw, ch, None)
    for n, (lab, rows) in enumerate(HAZ):
        ox, oy = (n % 6) * cw, (n // 6) * ch
        big = ["".join(c for c in row for _ in (0, 1)) for row in rows for _ in (0, 1)]
        kit.stamp(buf, ox + 1, oy + 2, big, HPAL)
    kit.emit_pixels(a, buf, s)
    labels_out(a, [h[0] for h in HAZ], 6, cw, ch, s)

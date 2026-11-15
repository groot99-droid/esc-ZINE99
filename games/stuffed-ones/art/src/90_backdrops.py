"""Backdrops: the dollhouse lithograph plates, the labyrinth tapestry, wallpaper repeats and fabric grounds."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
gl = sibling(__file__, "_glyphs")
G = kit.G
C, P, R, E = kit.C, kit.P, kit.R, kit.E
INK = kit.INK

# =====================================================================================================
# Dollhouse plates: a Victorian catalogue lithograph (the one place a ruled pen line is allowed)
# =====================================================================================================
ROW_D = "Dollhouse plates: night, day, cupboard"
BLUE = "#7c8aa0"


def wallpaper(a, ground, sprig, size=20, kind=0):
    pid = a.uid("wp")
    s = size
    if kind == 0:
        body = (f'<circle cx="{s/4}" cy="{s/4}" r="1.7" fill="{sprig}"/><circle cx="{s/4-2.6}" cy="{s/4}" r="1" fill="{sprig}" opacity=".7"/>'
                f'<circle cx="{s/4+2.6}" cy="{s/4}" r="1" fill="{sprig}" opacity=".7"/><circle cx="{3*s/4}" cy="{3*s/4}" r="1.3" '
                f'fill="{sprig}" opacity=".8"/><path d="M{3*s/4},{3*s/4+1.5}v4" stroke="{sprig}" stroke-width=".8" opacity=".6"/>')
    elif kind == 1:
        body = (f'<path d="M0,0L{s},{s}M{s},0L0,{s}" stroke="{sprig}" stroke-width=".7" opacity=".55"/>'
                f'<circle cx="{s/2}" cy="{s/2}" r="1.8" fill="{sprig}"/>')
    else:
        body = (f'<path d="M{s/4},0V{s}M{3*s/4},0V{s}" stroke="{sprig}" stroke-width="1.6" opacity=".4"/>'
                f'<circle cx="{s/2}" cy="{s/2}" r="1.3" fill="{sprig}"/>')
    a.defn(f'<pattern id="{pid}" width="{s}" height="{s}" patternUnits="userSpaceOnUse"><rect width="{s}" height="{s}" '
           f'fill="{ground}"/>{body}</pattern>')
    return f"url(#{pid})"


def plate(a, caption, number, night):
    a.paper("#e9dec3" if not night else "#d9d2bf", grain=0.26, fibre=1.1)
    a.rect(20, 20, 1560, 860, fill="none", stroke=INK, stroke_width=2.4)
    a.rect(29, 29, 1542, 842, fill="none", stroke=INK, stroke_width=0.8)
    for cx, cy in ((24.5, 24.5), (1575.5, 24.5), (24.5, 875.5), (1575.5, 875.5)):
        a.path(kit.star(cx, cy, 10, 3.6, 4, 45), fill=INK)
    a.text(800, 858, f"PLATE {number}.  {caption}", size=18, family="serif", fill=INK, text_anchor="middle", letter_spacing=4)


class Litho:
    """Colour and line for one plate: at night every flat colour leans to blue-grey, never to black."""
    def __init__(self, a, night):
        self.a, self.night = a, night

    def c(self, col, t=0.55):
        return kit.mix(col, BLUE, t) if self.night else col

    def box(self, x, y, w, h, col, sw=1.4, **kw):
        self.a.rect(x, y, w, h, fill=self.c(col), stroke=INK, stroke_width=sw, **kw)

    def lines(self, d, sw=0.8, **kw):
        self.a.path(d, fill="none", stroke=INK, stroke_width=sw, **kw)

    def cut(self, x, y, w, h):
        """A wall or floor seen at the cut: hatched."""
        a = self.a
        a.rect(x, y, w, h, fill=self.c("#cdb894", 0.4), stroke=INK, stroke_width=1.6)
        a.hatch(x, y, w, h, angle=45, spacing=5, stroke=INK, stroke_width=0.6,
                clip=a.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"/>'))

    def window(self, x, y, w, h, moon=False):
        a = self.a
        self.box(x - 5, y - 5, w + 10, h + 10, "#b99a78")
        a.rect(x, y, w, h, fill="#5f7089" if self.night else "#cfe0e2", stroke=INK, stroke_width=1)
        if self.night:
            a.hatch(x, y, w, h, angle=-30, spacing=4, stroke="#39465c", stroke_width=0.7,
                    clip=a.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"/>'))
            if moon:
                a.circle(x + w * 0.68, y + h * 0.3, 8, fill="#f1ead3", stroke=INK, stroke_width=0.6)
        else:
            a.path(f"M{x},{y + h * .7}q{w * .3},{-h * .3} {w * .55},{-h * .1}t{w * .45},{-h * .12}V{y + h}H{x}z", fill=kit.mix(kit.MOSS, "#cfe0e2", 0.4))
        self.lines(f"M{x + w / 2},{y}v{h}M{x},{y + h / 2}h{w}", 1.2)

    def door(self, x, y, w, h, col="#a98862", knob="r"):
        self.box(x - 5, y - 5, w + 10, h + 5, "#8a6a4a")
        self.box(x, y, w, h, col)
        self.lines(R(x + 6, y + 8, w - 12, h * 0.4) + R(x + 6, y + h * 0.5, w - 12, h * 0.42), 0.7)
        self.a.circle(x + (w - 8 if knob == "r" else 8), y + h * 0.52, 2.6, fill=INK)

    def bed(self, x, y, w, col):
        self.box(x, y - 46, 8, 46 + 34, "#8a6a4a"), self.box(x + w - 8, y - 22, 8, 22 + 34, "#8a6a4a")
        self.box(x + 8, y - 6, w - 16, 26, "#efe5cf")
        self.box(x + 12, y - 20, 44, 16, "#f6f1e4", rx=6)
        self.a.path(f"M{x + 62},{y - 8}h{w - 70}v26h-{w - 70}z", fill=self.c(col), stroke=INK, stroke_width=1.4)
        self.lines("".join(f"M{x + 62 + k * 22},{y - 8}v26" for k in range(1, int((w - 70) / 22) + 1))
                   + f"M{x + 62},{y + 5}h{w - 70}", 0.6)

    def lampstd(self, x, y, lit=False):
        a = self.a
        if lit:
            kit.lamp(a, x, y - 52, 150, kit.AMBER, 0.75)
        self.lines(f"M{x},{y}v-44", 2)
        self.box(x - 9, y - 4, 18, 4, "#8a6a4a")
        a.path(P((x - 15, y - 44), (x + 15, y - 44), (x + 9, y - 66), (x - 9, y - 66)), fill="#f4d58a" if lit else self.c("#e6d2a8"),
               stroke=INK, stroke_width=1.4)

    def shelves(self, x, y, w, h, n=4, col="#b99a78"):
        self.box(x, y, w, h, col)
        a = self.a
        a.rect(x + 5, y + 5, w - 10, h - 10, fill=self.c("#6f553d", 0.45), stroke=INK, stroke_width=0.8)
        self.lines("".join(f"M{x + 5},{f(y + 5 + (h - 10) * k / n)}h{w - 10}" for k in range(1, n)), 1.6)

    def stairs(self, x, y, w, h, n=10, rise=1):
        """Steps from bottom-left up to top-right (rise=1) or mirrored."""
        pts = []
        for k in range(n):
            xx = x + w * k / n if rise == 1 else x + w - w * k / n
            xn = x + w * (k + 1) / n if rise == 1 else x + w - w * (k + 1) / n
            pts += [(xx, y + h - h * k / n), (xx, y + h - h * (k + 1) / n), (xn, y + h - h * (k + 1) / n)]
        end = (x + w, y + h) if rise == 1 else (x, y + h)
        self.a.path(P(*pts, end), fill=self.c("#b99a78"), stroke=INK, stroke_width=1.4)
        x0, x1 = (x, x + w) if rise == 1 else (x + w, x)
        self.lines(f"M{x0},{y + h - 34}L{x1},{y - 34}", 2.4)
        self.lines("".join(f"M{f(x0 + (x1 - x0) * k / 5)},{f(y + h - 34 - h * k / 5)}v30" for k in range(6)), 1)


def house(a, night):
    L = Litho(a, night)
    X0, X1 = 250, 1350
    ROOF, TOP, MID, GND, CEL = 74, 214, 444, 674, 812
    WT = 14
    # sky and garden
    if night:
        a.hatch(36, 36, 1528, GND - 36, angle=0, spacing=8, stroke="#5a6680", stroke_width=1.3, jitter=1.2,
                clip=a.clip(f'<rect x="36" y="36" width="1528" height="{GND - 36}"/>'))
        for _ in range(26):
            x, y = a.rng.uniform(50, 1550), a.rng.uniform(46, 380)
            a.path(kit.star(x, y, 4.2, 1.4, 4, 0), fill="#f1ead3", stroke=INK, stroke_width=0.3)
    for tx, th in ((110, 300), (190, 220), (1440, 320), (1508, 210)):
        for k in range(4):
            wv = 34 + k * 18
            yy = GND - th + k * th * 0.2
            a.path(P((tx, yy - 40), (tx + wv, yy + th * 0.24), (tx - wv, yy + th * 0.24)), fill=L.c(kit.MOSS, 0.6), stroke=INK,
                   stroke_width=1.2)
        a.rect(tx - 5, GND - th * 0.22, 10, th * 0.22, fill=L.c(kit.CEDAR, 0.5), stroke=INK, stroke_width=1)
    # earth
    a.rect(36, GND, 1528, CEL + 24 - GND, fill=L.c("#c8b08a", 0.35))
    a.stipple(36, GND, 1528, CEL + 24 - GND, n=600, r=(0.7, 1.7), fill=kit.CEDAR_D, opacity=0.5)
    L.lines(f"M36,{GND}H{X0 - 36}M{X1 + 36},{GND}H1564", 2)
    # roof
    roof = [(X0 - 44, TOP), (X0 + 250, ROOF), (X1 - 250, ROOF), (X1 + 44, TOP)]
    a.path(P(*roof), fill=L.c("#b98f6c"), stroke=INK, stroke_width=2)
    cl = a.clip(f'<path d="{P(*roof)}"/>')
    d = []
    for j, y in enumerate(range(ROOF + 8, TOP, 13)):
        d.append(f"M{X0 - 50},{y}H{X1 + 50}")
        for x in range(X0 - 50 + (0 if j % 2 else 12), X1 + 50, 24):
            d.append(f"M{x},{y}v13")
    a.path("".join(d), fill="none", stroke=INK, stroke_width=0.6, clip_path=cl)
    L.box(X1 - 330, ROOF - 34, 44, 60, "#a5553a")
    L.lines(f"M{X1 - 330},{ROOF - 20}h44M{X1 - 330},{ROOF - 6}h44", 0.6)
    gx, gy = 800, 150
    if night:
        kit.lamp(a, gx, gy, 90, kit.AMBER, 0.7)
    a.circle(gx, gy, 26, fill="#f1cf7e" if night else "#cfe0e2", stroke=INK, stroke_width=2)
    L.lines(f"M{gx - 26},{gy}h52M{gx},{gy - 26}v52", 1.3)
    # rooms: x, y, w, h, wallpaper ground, sprig, kind, label
    up, dn = TOP + WT, MID + WT
    rooms = [
        (X0 + WT, up, 330, MID - up, "#d9c9c0", "#a5553a", 0, "LILA'S ROOM"),
        (X0 + WT + 344, up, 360, MID - up, "#d8d2b6", "#6f7a4b", 1, "LANDING"),
        (X0 + WT + 718, up, X1 - X0 - 2 * WT - 718, MID - up, "#c9d3d2", "#5b6f8a", 2, "BEDROOM"),
        (X0 + WT, dn, 400, GND - dn, "#d6cfae", "#8a5a3a", 1, "PARLOUR"),
        (X0 + WT + 414, dn, 270, GND - dn, "#d9c9c0", "#6f7a4b", 2, "HALL"),
        (X0 + WT + 698, dn, X1 - X0 - 2 * WT - 698, GND - dn, "#c9d3d2", "#a5553a", 0, "KITCHEN"),
        (X0 + 90, GND + WT, X1 - X0 - 180, CEL - GND - WT, "#b9b3a6", "#6d6a66", 1, "CELLAR"),
    ]
    for (x, y, w, h, gr, sp, kd, name) in rooms:
        a.rect(x, y, w, h, fill=wallpaper(a, L.c(gr, 0.62), L.c(sp, 0.45), kind=kd), stroke=INK, stroke_width=1)
        fl = y + h - 12
        a.rect(x, fl, w, 12, fill=L.c("#b08e68"), stroke=INK, stroke_width=1)
        L.lines("".join(f"M{x + k},{fl}v12" for k in range(30, int(w), 46)), 0.6)
        a.rect(x, y + h - 26, w, 14, fill=L.c("#e9dfc8"), stroke=INK, stroke_width=0.6)
    # cut walls and floors
    for (x, y, w, h) in [(X0, TOP, WT, GND - TOP), (X1 - WT, TOP, WT, GND - TOP), (X0, TOP, X1 - X0, WT), (X0, MID, X1 - X0, WT),
                         (X0 - 30, GND, X1 - X0 + 60, WT), (X0 + WT + 330, up, WT, MID - up), (X0 + WT + 704, up, WT, MID - up),
                         (X0 + WT + 400, dn, WT, GND - dn), (X0 + WT + 684, dn, WT, GND - dn), (X0 + 76, GND + WT, WT, CEL - GND - WT),
                         (X1 - 90, GND + WT, WT, CEL - GND - WT), (X0 + 76, CEL, X1 - X0 - 152, WT)]:
        L.cut(x, y, w, h)
    fu, fd, fc = MID - 12, GND - 12, CEL - 12     # floor lines
    # --- Lila's room: bed, window, the locked door on the landing side, rag rug
    L.window(X0 + 60, up + 46, 70, 86, moon=True)
    L.bed(X0 + 40, fu - 34, 190, kit.SKY)
    L.box(X0 + 250, fu - 96, 60, 96, "#8a6a4a")
    L.lines(f"M{X0 + 280},{fu - 96}v96", 1)
    a.ellipse(X0 + 150, fu + 2, 90, 7, fill=L.c(kit.RUST), stroke=INK, stroke_width=0.8)
    # --- landing: the locked door into Lila's room, the linen cupboard, the stair head, a wall shelf
    lx = X0 + WT + 344
    L.door(lx + 14, fu - 150, 70, 150, knob="l")
    L.box(lx + 120, fu - 170, 96, 170, "#c9b08a")
    L.lines(f"M{lx + 168},{fu - 170}v170" + R(lx + 127, fu - 162, 34, 70) + R(lx + 175, fu - 162, 34, 70)
            + R(lx + 127, fu - 84, 34, 76) + R(lx + 175, fu - 84, 34, 76), 0.7)
    a.circle(lx + 162, fu - 86, 2.4, fill=INK), a.circle(lx + 174, fu - 86, 2.4, fill=INK)
    L.box(lx + 240, up + 60, 104, 8, "#8a6a4a")
    L.stairs(lx + 250, fu - 78, 110, 78, n=6)
    # --- bedroom: bed, the lamp that stays on, wardrobe, window
    bx = X0 + WT + 718
    L.window(bx + 240, up + 46, 70, 86)
    L.bed(bx + 150, fu - 34, 200, kit.RUST)
    L.box(bx + 22, fu - 150, 84, 150, "#8a6a4a")
    L.lines(f"M{bx + 64},{fu - 150}v150", 1)
    L.lampstd(bx + 128, fu, lit=night)
    # --- parlour: the shelf unit, couch, the game table, window
    px = X0 + WT
    L.shelves(px + 18, fd - 176, 150, 176, n=4)
    L.window(px + 196, dn + 40, 76, 90)
    a.path(f"M{px + 190},{fd}v-44q0,-22 22,-22h118q22,0 22,22v44z", fill=L.c(kit.MOSS), stroke=INK, stroke_width=1.4)
    L.lines(f"M{px + 204},{fd - 30}h146M{px + 271},{fd - 66}v36", 0.8)
    L.box(px + 356, fd - 40, 6, 40, "#8a6a4a"), L.box(px + 386, fd - 40, 6, 40, "#8a6a4a")
    a.ellipse(px + 374, fd - 42, 26, 6, fill=L.c("#c9b08a"), stroke=INK, stroke_width=1.2)
    # --- hall: front door, the stair, coat hooks, the hall light
    hx = X0 + WT + 414
    L.door(hx + 16, fd - 156, 74, 156, col="#8f6f4c")
    L.stairs(hx + 110, dn, 160, fd - dn, n=11)
    L.lines(f"M{hx + 60},{dn}v30", 1.4)
    a.path(P((hx + 46, dn + 50), (hx + 74, dn + 50), (hx + 68, dn + 30), (hx + 52, dn + 30)), fill=L.c("#e6d2a8"), stroke=INK,
           stroke_width=1.2)
    # --- kitchen: range, sink with the mirror above it, table and chair, window
    kx = X0 + WT + 698
    L.window(kx + 250, dn + 40, 76, 90)
    L.box(kx + 20, fd - 84, 90, 84, "#6f6a66")
    L.lines(R(kx + 30, fd - 56, 70, 44) + f"M{kx + 30},{fd - 70}h70", 0.8)
    L.box(kx + 46, dn, 16, fd - 84 - dn, "#6f6a66")
    L.box(kx + 126, fd - 70, 96, 70, "#e9dfc8")
    L.lines(f"M{kx + 174},{fd - 70}v70M{kx + 150},{fd - 78}q0,-16 14,-14", 1.2)
    a.rect(kx + 146, fd - 150, 56, 60, rx=6, fill="#a9b9c2" if not night else "#8795a8", stroke=INK, stroke_width=2.4)
    L.lines(f"M{kx + 154},{fd - 104}l22,-34M{kx + 168},{fd - 100}l20,-30", 0.6)
    L.box(kx + 250, fd - 50, 110, 8, "#8a6a4a"), L.box(kx + 258, fd - 42, 6, 42, "#8a6a4a"), L.box(kx + 346, fd - 42, 6, 42, "#8a6a4a")
    a.open("g", transform=f"translate({kx + 380} {fd - 92}) scale(0.92)")
    a.path(kit.ICONS["chair"][0][1], fill=L.c("#8a6a4a"), stroke=INK, stroke_width=1.2)
    a.close()
    # --- cellar: jar shelves, the stair down, the trapdoor
    cx = X0 + 90 + WT
    L.shelves(cx + 20, fc - 100, 200, 100, n=3, col="#8a6a4a")
    for k in range(7):
        for r_ in range(3):
            a.rect(cx + 32 + k * 26, fc - 92 + r_ * 30 + 6, 14, 18, rx=3, fill=L.c([kit.RUST, kit.MOSS, "#e6d2a8"][(k + r_) % 3], 0.45),
                   stroke=INK, stroke_width=0.6)
    L.stairs(cx + 560, GND + WT, 150, fc - GND - WT, n=7, rise=-1)
    tx = cx + 330
    a.rect(tx, fc - 2, 120, 14, fill=kit.warmth(0.8) if night else L.c("#5b3a24", 0.2), stroke=INK, stroke_width=1.6)
    if night:
        kit.lamp(a, tx + 60, fc + 4, 110, kit.RED, 0.6)
    a.path(P((tx, fc - 2), (tx - 14, fc - 76), (tx - 2, fc - 78), (tx + 12, fc - 2)), fill=L.c("#8a6a4a"), stroke=INK, stroke_width=1.4)
    L.box(cx + 760, fc - 60, 90, 60, "#8a6a4a")
    L.lines(f"M{cx + 760},{fc - 30}h90", 0.8)
    for (x, y, w, h, gr, sp, kd, name) in rooms:
        a.text(x + 8, y + 18, name, size=12, family="serif", fill=INK, letter_spacing=2.5)
    if not night:  # daylight through the three windows
        for (wx, wy) in ((X0 + 60, up + 46), (bx + 240, up + 46), (px + 196, dn + 40), (kx + 250, dn + 40)):
            a.path(P((wx, wy), (wx + 72, wy), (wx + 150, wy + 180), (wx + 10, wy + 180)), fill="#fff6d8", opacity=0.3)
    else:
        a.rect(36, 36, 1528, 800, fill="#3d4a66", opacity=0.14)


@asset(G, "dollhouse-night", group="backdrops", title="Dollhouse plate: the cabin by night", w=1600, h=900, row=ROW_D)
def dollhouse_night(a: Art):
    """The cabin cut open from the front as a catalogue lithograph, by night: seven rooms in blue-grey under a
    hatched sky, one bedroom lamp left on, the attic window lit, and a red warmth at the cellar trapdoor."""
    plate(a, "THE CABIN, CUT OPEN: BY NIGHT", "I", True)
    house(a, True)


@asset(G, "dollhouse-day", group="backdrops", title="Dollhouse plate: the cabin by day", w=1600, h=900, row=ROW_D)
def dollhouse_day(a: Art):
    """The same ruled cutaway by day: flat pastel rooms with their wallpapers shown to the cut edge, daylight
    falling from four windows, the parlour shelves and the game table waiting."""
    plate(a, "THE CABIN, CUT OPEN: BY DAY", "II", False)
    house(a, False)


@asset(G, "dollhouse-cupboard", group="backdrops", title="Dollhouse plate: the linen cupboard", w=1600, h=900, row=ROW_D)
def dollhouse_cupboard(a: Art):
    """The upstairs landing at night, drawn large: the linen cupboard cut open, its shelves of folded sheets and
    rolled tissue above a dark floor where a heap is only ten points of light, a chair wedged under the knob
    outside, and the hall light on."""
    plate(a, "THE LINEN CUPBOARD, WITH THE CHAIR", "III", True)
    L = Litho(a, True)
    FL, CE = 760, 110
    a.rect(60, CE, 1480, FL - CE, fill=wallpaper(a, L.c("#d8d2b6", 0.6), L.c("#6f7a4b", 0.4), size=34, kind=1), stroke=INK, stroke_width=1)
    a.rect(60, FL - 44, 1480, 24, fill=L.c("#e9dfc8"), stroke=INK, stroke_width=0.8)
    a.rect(60, FL - 20, 1480, 20, fill=L.c("#b08e68"), stroke=INK, stroke_width=1)
    L.lines("".join(f"M{x},{FL - 20}v20" for x in range(120, 1540, 86)), 0.7)
    L.cut(40, FL, 1520, 26), L.cut(40, CE - 26, 1520, 26)
    # Lila's door and its frame, with the knots
    L.box(110, 250, 30, FL - 20 - 250, "#a98862"), L.box(330, 250, 30, FL - 20 - 250, "#a98862"), L.box(110, 222, 250, 30, "#a98862")
    L.box(140, 252, 190, FL - 20 - 252, "#8f6f4c")
    L.lines(R(158, 276, 154, 190) + R(158, 492, 154, 220), 0.8)
    a.circle(310, 500, 6, fill="#c9b08a", stroke=INK, stroke_width=1)
    for k in range(9):
        a.circle(345, FL - 60 - k * 22, 3, fill=[kit.RUST, kit.SKY, kit.MOSS][k % 3], stroke=INK, stroke_width=0.5)
    for k in range(22):
        a.circle(338 + (k % 4) * 4.6, FL - 60 - 9 * 22 - (k // 4) * 4.2, 2.6, fill=[kit.RUST, kit.SKY, kit.MOSS, "#e6d2a8"][k % 4],
                 stroke=INK, stroke_width=0.4)
    # the cupboard, cut open
    x0, x1, y0 = 520, 940, 190
    L.cut(x0 - 16, y0 - 16, x1 - x0 + 32, 16), L.cut(x0 - 16, y0, 16, FL - 20 - y0)
    a.rect(x0, y0, x1 - x0, FL - 20 - y0, fill="#55607a", stroke=INK, stroke_width=1)
    a.rect(x0, 560, x1 - x0, FL - 20 - 560, fill="#3c465c")
    for y in (300, 430, 560):
        L.box(x0, y, x1 - x0, 10, "#b99a78")
    for (sx, sy, n, col) in ((x0 + 24, 300, 5, "#efe5cf"), (x0 + 150, 300, 3, kit.SKY), (x0 + 280, 300, 6, "#e6d2a8"),
                             (x0 + 30, 430, 4, kit.light(kit.RUST, 0.5)), (x0 + 290, 430, 5, "#efe5cf")):
        for k in range(n):
            a.rect(sx + (k % 2) * 3, sy - 15 - k * 15, 104, 15, rx=5, fill=L.c(col, 0.35), stroke=INK, stroke_width=0.9)
    for k in range(4):   # rolled tissue patterns
        a.rect(x0 + 160 + k * 26, 430 - 96 + k * 6, 18, 96 - k * 6, rx=8, fill=L.c(kit.TISSUE, 0.25), stroke=INK, stroke_width=0.9)
        a.ellipse(x0 + 169 + k * 26, 430 - 96 + k * 6, 9, 3.4, fill=L.c("#fff8e4", 0.2), stroke=INK, stroke_width=0.7)
    L.box(x0 + 60, 560 - 34, 90, 34, kit.RUST)
    L.lines(f"M{x0 + 60},{560 - 24}h90", 0.8)
    a.rect(x0 + 200, 560 - 24, 150, 24, rx=4, fill=L.c("#efe5cf", 0.3), stroke=INK, stroke_width=0.9)
    # the heap: a mound in the dark, five pairs of eyes, the pack's warmth
    kit.lamp(a, x0 + 210, FL - 70, 230, kit.AMBER, 0.55)
    a.path(f"M{x0 + 40},{FL - 20}q20,-70 90,-84q30,-50 80,-30q50,-40 90,6q70,4 80,108z", fill="#2c3446", stroke=INK, stroke_width=1.2)
    a.hatch(x0 + 40, FL - 150, 340, 130, angle=60, spacing=5, stroke=INK, stroke_width=0.5,
            clip=a.clip(f'<path d="M{x0 + 40},{FL - 20}q20,-70 90,-84q30,-50 80,-30q50,-40 90,6q70,4 80,108z"/>'))
    for (ex, ey) in ((92, 74), (160, 104), (214, 96), (262, 66), (318, 48)):
        for dx in (0, 15):
            a.circle(x0 + ex + dx, FL - 20 - ey, 3.2, fill=kit.AMBER, stroke=INK, stroke_width=0.5)
            a.circle(x0 + ex + dx - 1, FL - 21 - ey, 1, fill="#fff3d0")
    # the cupboard door, edge on, shut; the chair wedged under its knob
    L.box(x1, y0, 16, FL - 20 - y0, "#a98862")
    a.circle(x1 + 24, 548, 9, fill="#c9b08a", stroke=INK, stroke_width=1.4)
    px_ = x1 + 237
    a.open("g", transform=f"rotate(-20 {px_} {FL - 20}) translate({px_ - 216} {FL - 20 - 276}) scale(3)")
    a.path(kit.ICONS["chair"][0][1], fill=L.c("#8a6a4a", 0.3), stroke=INK, stroke_width=0.6)
    a.close()
    # the hall light
    L.lines(f"M1240,{CE}v84", 1.6)
    kit.lamp(a, 1240, 250, 520, kit.AMBER, 0.6)
    a.path(P((1206, 230), (1274, 230), (1258, 194), (1222, 194)), fill="#f4d58a", stroke=INK, stroke_width=1.6)
    a.circle(1240, 238, 9, fill="#fff3d0", stroke=INK, stroke_width=0.8)
    # the stair head and its rail, a small window, a rag rug
    L.stairs(1330, FL - 20 - 150, 210, 150, n=7, rise=-1)
    L.window(1100, 330, 90, 120, moon=True)
    a.ellipse(1160, FL - 6, 150, 9, fill=L.c(kit.RUST, 0.4), stroke=INK, stroke_width=0.8)
    a.rect(36, 36, 1528, 800, fill="#3d4a66", opacity=0.12)
    a.text(x0 + 6, y0 - 26, "CUPBOARD", size=14, family="serif", fill=INK, letter_spacing=3)
    a.text(118, 212, "LILA'S ROOM", size=14, family="serif", fill=INK, letter_spacing=3)


# =====================================================================================================
# The labyrinth tapestry: woven cells, run-length joined, under a warp-and-weft texture
# =====================================================================================================
ROW_T = "Labyrinth tapestry rings and wallpaper repeats"


def woven(a, cols, rows, cell, colour_at, x0=0, y0=0):
    """Fill a grid of cells from colour_at(i, j), joining runs along each row, then lay the weave over it."""
    fills = {}
    for j in range(rows):
        i = 0
        while i < cols:
            c = colour_at(i, j)
            n = 1
            while i + n < cols and colour_at(i + n, j) == c:
                n += 1
            fills.setdefault(c, []).append(f"M{f(x0 + i * cell)},{f(y0 + j * cell)}h{f(n * cell)}v{f(cell)}h{f(-n * cell)}z")
            i += n
    for c, ds in fills.items():
        a.path("".join(ds), fill=c)
    pid = a.uid("tap")
    c = cell
    a.defn(f'<pattern id="{pid}" x="{f(x0)}" y="{f(y0)}" width="{f(2 * c)}" height="{f(2 * c)}" patternUnits="userSpaceOnUse">'
           f'<path d="M{f(c * .3)},{f(c * .12)}v{f(c * .76)}M{f(c * .7)},{f(c * .12)}v{f(c * .76)}M{f(c * 1.12)},{f(c * .3)}h{f(c * .76)}'
           f'M{f(c * 1.12)},{f(c * .7)}h{f(c * .76)}M{f(c * 1.3)},{f(c * 1.12)}v{f(c * .76)}M{f(c * 1.7)},{f(c * 1.12)}v{f(c * .76)}'
           f'M{f(c * .12)},{f(c * 1.3)}h{f(c * .76)}M{f(c * .12)},{f(c * 1.7)}h{f(c * .76)}" stroke="{kit.BONE}" stroke-width="{f(c * .13)}" '
           f'stroke-linecap="round" opacity=".3"/><path d="M0,0H{f(2 * c)}M0,{f(c)}H{f(2 * c)}" stroke="{kit.CEDAR_D}" '
           f'stroke-width="{f(c * .08)}" opacity=".6"/></pattern>')
    a.rect(x0, y0, cols * cell, rows * cell, fill=f"url(#{pid})")


WALLS = (1.0, 0.72, 0.44)
DOORS = {0: [90], 1: [300], 2: [90]}
RADIALS = {0: [10, 60, 150, 205, 262, 330], 1: [40, 100, 180, 250]}
ROOMS = [20, 140, 215]
LOOPS = [(0, 232), (1, 62), (1, 318)]
FLOOR = [kit.mix(kit.mix(kit.CEDAR, kit.RUST, 0.3), kit.warmth(0.62 + 0.38 * k / 5), 0.12 + 0.88 * (k / 5) ** 1.3) for k in range(6)]


def adiff(a1, a2):
    return abs((a1 - a2 + 180) % 360 - 180)


def tapestry(a, zoom, focus, doc_marks=True):
    """One plate of the woven map. zoom: world radius shown at the plate's half-width."""
    cell, n = 15, 80
    half = n / 2
    rng = a.rng
    noise = [[rng.random() for _ in range(n)] for _ in range(n)]
    wt = max(0.016, 0.62 * zoom / half)
    route = kit.mix(kit.DUST, kit.CEDAR, 0.25)
    cache = {}

    def colour(i, j):
        if (i, j) in cache:
            return cache[(i, j)]
        dx, dy = (i + 0.5 - half) / half * zoom, (j + 0.5 - half) / half * zoom
        r = math.hypot(dx, dy)
        ang = math.degrees(math.atan2(dy, dx)) % 360
        edge = min(i, j, n - 1 - i, n - 1 - j)
        c = None
        if edge < 2:
            c = kit.RUST if (i + j) % 4 < 2 else kit.CEDAR_D
        elif edge < 3:
            c = kit.AMBER if (i + j) % 2 else kit.CEDAR
        elif r > 1.0 + wt:
            c = kit.mix(kit.MOSS, kit.CEDAR, 0.35 if (i // 3 + j // 3) % 2 else 0.55)
            if (i * 7 + j * 3) % 11 == 0:
                c = kit.mix(kit.DUST, kit.MOSS, 0.4)
        if c is None:
            wall = False
            for k, rr in enumerate(WALLS):
                if abs(r - rr) < wt and not any(adiff(ang, d) * math.pi / 180 * rr < 2.4 * wt for d in DOORS[k]):
                    wall = True
            for k, angs in RADIALS.items():
                if WALLS[k + 1] + wt < r < WALLS[k] - wt:
                    mid = (WALLS[k] + WALLS[k + 1]) / 2
                    for ad in angs:
                        if adiff(ang, ad) * math.pi / 180 * r < wt * 0.9 and ((r < mid) == (ad % 20 == 0)):
                            wall = True
            if wall:
                c = kit.light(kit.DUST, 0.3) if (i + j) % 5 else kit.mix(kit.RUST, kit.DUST, 0.45)
        if c is None:
            t = max(0.0, min(1.0, 1 - r / 1.0))
            room = WALLS[2] + wt < r < WALLS[1] - wt and any(adiff(ang, ra) < 7 for ra in ROOMS)
            for (k, la) in LOOPS:       # loop doors: a woven knot
                mid = (WALLS[k] + WALLS[k + 1]) / 2
                if abs(r - mid) < 2.2 * wt and adiff(ang, la) * math.pi / 180 * r < 2.2 * wt:
                    c = kit.NIGHT if (i + j) % 2 else kit.AMBER
            if c is None and doc_marks:   # the route your own group ran, in faded thread; Marcus's chalk at the doors
                for k in (0, 1):
                    mid = (WALLS[k] + WALLS[k + 1]) / 2
                    lo, hi = (90, 300) if k == 0 else (0, 360)
                    if abs(r - mid) < wt * 0.55 and (lo <= ang <= hi if k == 0 else not 90 < ang < 300) and (i + j) % 3:
                        c = route
                for k, ds in DOORS.items():
                    for d_ in ds:
                        if abs(r - WALLS[k] - 3.4 * wt) < wt * 0.7 and adiff(ang, d_ + 6 / max(r, 0.2)) * math.pi / 180 * r < wt * 0.7:
                            c = kit.BONE
            if c is None and r < WALLS[2] - wt:   # the ritual room
                if 0.25 < r < 0.33:               # the circle of torn fabric skins: scraps, a gap between each
                    seg = int(ang / 20)
                    if adiff(ang, seg * 20 + 10) < 7.5:
                        c = [kit.mix(kit.DUST, kit.RUST, 0.2), kit.mix(kit.SKY, kit.DUST, 0.4), kit.mix(kit.MOSS, kit.DUST, 0.45),
                             kit.light(kit.RUST, 0.4)][seg % 4]
                elif r < 0.07:
                    c = kit.BONE if (i + j) % 2 else kit.AMBER      # the altar
                elif abs(dx) < 0.035 and -0.19 < dy < -0.13:
                    c = kit.NIGHT                                  # the lectern and its book
                elif 0.385 < r < 0.405 and int(ang / 9) % 3 == 0:
                    c = kit.NIGHT                                  # symbols stitched into the walls
            if c is None:
                lvl = min(5, int(t * 5.999 + (noise[j][i] - 0.5) * 1.1 + 0.5)) if t > 0 else 0
                lvl = max(0, lvl)
                c = FLOOR[lvl]
                if noise[j][i] < t ** 2 * 0.5:
                    c = kit.RED if noise[j][i] < t ** 2 * 0.22 else kit.warmth(0.8)
                elif room:
                    c = kit.mix(c, kit.NIGHT, 0.5) if (i * 3 + j) % 4 else kit.mix(kit.DUST, kit.NIGHT, 0.3)
                elif WALLS[1] < r < WALLS[0] and (i + j) % 3 == 0:
                    c = kit.mix(c, kit.CEDAR_D, 0.3)
        cache[(i, j)] = c
        return c
    woven(a, n, n, cell, colour)
    # fringe: the warp ends
    d = "".join(f"M{f(i + 3)},{n * cell - 4}l{f(rng.uniform(-2, 2))},{f(rng.uniform(8, 16))}" for i in range(0, n * cell, 7))
    a.path(d, stroke=kit.mix(kit.DUST, kit.CEDAR, 0.3), stroke_width=2.2, stroke_linecap="round", fill="none")
    kit.lamp(a, 600, 600, 600 * min(1.0, 0.46 / zoom + 0.25), kit.RED, 0.28)
    # the ring this plate is for, named in the border
    for k, lab in enumerate(["OUTER", "INNER", "CENTRE"]):
        a.text(60 + k * 104, 66, lab, size=17, family="serif", fill=kit.BONE if k == focus else kit.mix(kit.BONE, kit.CEDAR, 0.6),
               font_weight="bold", letter_spacing=2)
    kit.shade(a, 0.35)


@asset(G, "tapestry-outer", group="backdrops", title="Labyrinth tapestry: the outer ring", w=1200, h=1220, row=ROW_T)
def tap_outer(a: Art):
    """The whole labyrinth as a woven map: three rings of cream wallpaper-wall on a floor that reddens thread
    by thread toward the centre, the outer ring's loop door woven as a knot, the route your own group once ran
    in faded thread, and a fringe of warp ends."""
    a.paper(kit.CEDAR_D, grain=0)
    tapestry(a, 1.16, 0)


@asset(G, "tapestry-inner", group="backdrops", title="Labyrinth tapestry: the inner ring", w=1200, h=1220, row=ROW_T)
def tap_inner(a: Art):
    """The tapestry woven closer: the inner ring with its two loop doors and the dark rooms of broken toys that
    block sight, the floor already half red, the centre glowing through its one doorway."""
    a.paper(kit.CEDAR_D, grain=0)
    tapestry(a, 0.82, 1)


@asset(G, "tapestry-centre", group="backdrops", title="Labyrinth tapestry: the centre", w=1200, h=1220, row=ROW_T)
def tap_centre(a: Art):
    """The centre of the tapestry: the round ritual room woven almost wholly red, the circle of torn fabric skins
    as a ring of faded scraps, the altar at the middle, the lectern above it, symbols on the wall, and the
    doorway at the bottom where a toy can stand as a wall."""
    a.paper(kit.CEDAR_D, grain=0)
    tapestry(a, 0.52, 2, doc_marks=False)


SPRIG = ["..........", "....r.....", "...ryr....", "....r.....", "....g.....", "..g.g.....", "...gg..g..", "....g.g...",
         "....gg....", "....g....."]
BIRD = ["..........", "......bb..", ".....bbyb.", "bb..bbbb..", ".bbbbbb...", "..bbbbb...", "...bbb....", "...r.r....",
        "..........", ".........."]
ACORN = ["....g.....", "...ccc....", "..ccccc...", "..ccccc...", "..rrrrr...", "..rrrrr...", "...rrr....", "....r.....",
         "..........", ".......g.."]


def _wall(k, wid, title, ground, pal, kind, doc):
    @asset(G, f"wallpaper-{k + 1}-{wid}", group="backdrops", title=f"Wallpaper repeat: {title}", w=480, h=480, row=ROW_T)
    def draw(a: Art):
        n, cell = 40, 12

        def colour(i, j):
            if kind in (SPRIG, BIRD, ACORN):
                jj = (j + (5 if (i // 10) % 2 else 0)) % 10
                ch = kind[jj][i % 10]
                return pal.get(ch, ground)
            if kind == "trellis":
                if (i + j) % 10 == 0 or (i - j) % 10 == 0:
                    return pal["l"]
                u, v = (i + j) % 10, (i - j) % 10
                if u in (4, 5, 6) and v in (4, 5, 6):
                    return pal["y"] if (u, v) == (5, 5) else pal["r"]
                return ground
            if kind == "stripe":
                if i % 10 in (0, 1):
                    return pal["l"]
                if i % 10 in (5, 6) and j % 6 in (2, 3):
                    return pal["r"] if (j // 6) % 2 else pal["g"]
                return ground if i % 10 != 3 else kit.mix(ground, pal["l"], 0.3)
            # damask diamonds for the glyph paper
            return ground if (abs(i % 10 - 5) + abs(j % 10 - 5)) % 10 > 1 else kit.mix(ground, pal["l"], 0.3)
        woven(a, n, n, cell, colour)
        if kind == "glyph":    # the selvage glyphs, couched over the weave where a flower should be
            names = ["still", "unpick", "stair", "person", "ring", "door", "warm", "hand", "knot"]
            for gx_ in range(3):
                for gy_ in range(3):
                    top, bottom = names[gx_ * 3 + gy_], None
                    ox, oy = 44 + gx_ * 160, 20 + gy_ * 160 + (40 if gx_ == 1 else 0)
                    d = "".join(f"M{f(ox + ax * 12)},{f(oy + ay * 12)}L{f(ox + bx * 12)},{f(oy + by * 12)}"
                                for (ax, ay), (bx, by) in gl.segments(top, bottom))
                    a.path(d, fill="none", stroke=kit.CEDAR_D, stroke_width=6, stroke_linecap="round", opacity=0.45, transform="translate(1 2)")
                    a.path(d, fill="none", stroke=pal["r"], stroke_width=4.4, stroke_linecap="round")
                    a.path(d, fill="none", stroke=kit.BONE, stroke_width=1, stroke_dasharray="1.5 6", opacity=0.8)
        kit.shade(a, 0.3)
    draw.__doc__ = doc


for _k, _w in enumerate([
    ("sprig", "sprigs", kit.light(kit.DUST, 0.35), {"r": kit.RUST, "y": kit.AMBER, "g": kit.MOSS}, SPRIG,
     "A woven wallpaper repeat for the labyrinth walls: small rust sprigs with moss leaves on attic-dust cream, in half-drop."),
    ("trellis", "rosebud trellis", kit.mix(kit.SKY, kit.DUST, 0.55), {"l": kit.mix(kit.SKY, kit.NIGHT, 0.4), "r": kit.RUST, "y": kit.BONE},
     "trellis", "A woven wallpaper repeat: a diagonal trellis on faded sky blue with a rust rosebud at every crossing."),
    ("birds", "small birds", kit.mix(kit.MOSS, kit.DUST, 0.62), {"b": kit.NIGHT, "y": kit.BONE, "r": kit.RUST}, BIRD,
     "A woven wallpaper repeat: rows of small night-blue birds on pale moss, each row facing the same way."),
    ("stripe", "stripe and bud", kit.light(kit.RUST, 0.62), {"l": kit.CEDAR, "r": kit.RUST, "g": kit.MOSS}, "stripe",
     "A woven wallpaper repeat: cedar stripes on faded pink with buds of rust and moss between them."),
    ("acorns", "acorns", kit.mix(kit.DUST, kit.CEDAR, 0.18), {"c": kit.CEDAR, "r": kit.RUST, "g": kit.MOSS}, ACORN,
     "A woven wallpaper repeat: acorns with cedar caps on warm dust, a moss leaf-point between."),
    ("selvage", "the paper with the glyphs", kit.mix(kit.NIGHT, kit.SKY, 0.35), {"l": kit.SKY, "r": kit.BONE}, "glyph",
     "A woven wallpaper repeat from deep in the labyrinth: a blue damask where each flower has been replaced by one of "
     "the book's glyphs, couched in bone thread."),
]):
    _wall(_k, *_w)


# =====================================================================================================
# Stitchwork's fabric grounds: cloth under a lamp, square on
# =====================================================================================================
ROW_F = "Stitch charts and fabric grounds"


def cloth(a, color, freq=0.9):
    a.rect(0, 0, a.w, a.h, fill=color, filter=kit.felt_filter(a, shadow=0, freq=freq))


@asset(G, "ground-webbing", group="backdrops", title="Fabric ground: Marcus's strap", w=1600, h=900, row=ROW_F)
def ground_webbing(a: Art):
    """A pine table under a lamp with a band of moss herringbone webbing laid across it, torn through at the
    middle, its frayed ends a finger apart and a steel buckle at the right."""
    a.paper(kit.mix(kit.CEDAR, kit.DUST, 0.25), grain=0.25, fibre=0.02)
    for y in range(0, 900, 150):
        a.line(0, y, 1600, y + 6, stroke=kit.CEDAR_D, stroke_width=2, opacity=0.5)
    pid = a.uid("hb")
    a.defn(f'<pattern id="{pid}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="{kit.MOSS}"/>'
           f'<path d="M0,12L12,0M12,24L24,12M-12,24L0,12" stroke="{kit.light(kit.MOSS, 0.35)}" stroke-width="4"/>'
           f'<path d="M0,12L12,24M12,0L24,12" stroke="{kit.dark(kit.MOSS, 0.3)}" stroke-width="4"/></pattern>')
    rng = a.rng
    left = [(-10, 330)] + [(760 + rng.uniform(-16, 16), 330 + k * 24) for k in range(11)] + [(-10, 570)]
    right = [(1610, 330)] + [(828 + rng.uniform(-16, 16), 330 + k * 24) for k in range(11)] + [(1610, 570)]
    for pts in (left, right):
        a.path(P(*pts), fill="#1a0f08", opacity=0.35, transform="translate(6 12)", filter=a.blur(8))
        a.path(P(*pts), fill=f"url(#{pid})")
        a.path(P(*pts), fill=kit.MOSS, opacity=0.25, filter=kit.felt_filter(a, shadow=0))
    kit.thread(a, "M0,346H740M0,554H740M850,346H1600M850,554H1600", kit.dark(kit.MOSS, 0.35), w=3, dash="12 7")
    d = "".join(f"M{760 + rng.uniform(-10, 10)},{330 + k * 6}l{f(rng.uniform(8, 34))},{f(rng.uniform(-6, 6))}"
                f"M{830 + rng.uniform(-10, 10)},{332 + k * 6}l{f(-rng.uniform(8, 34))},{f(rng.uniform(-6, 6))}" for k in range(40))
    a.path(d, stroke=kit.light(kit.MOSS, 0.4), stroke_width=1.6, stroke_linecap="round", fill="none")
    a.rect(1330, 300, 120, 300, rx=18, fill="none", stroke="#1a0f08", stroke_width=26, opacity=0.3, transform="translate(6 10)")
    a.rect(1330, 300, 120, 300, rx=18, fill="none", stroke=a.gradient([(0, "#e9e6de"), (0.5, "#8d9296"), (1, "#5b6166")]), stroke_width=24)
    a.rect(1378, 290, 24, 320, rx=8, fill="#9aa0a4", stroke="#4a4f54", stroke_width=1.5)
    kit.lamp(a, 420, 200, 900, kit.AMBER, 0.38)
    kit.shade(a, 0.6)


@asset(G, "ground-own-felt", group="backdrops", title="Fabric ground: your own seam", w=1600, h=900, row=ROW_F)
def ground_own(a: Art):
    """Your own cream felt seen at arm's length under a low lamp: one seam running across it, held shut with
    six pins and still unsewn, a warmth showing along it from underneath."""
    cloth(a, kit.light(kit.DUST, 0.5))
    rng = a.rng
    pts = [(x, 450 + 46 * math.sin(x / 260) + rng.uniform(-3, 3)) for x in range(-20, 1640, 40)]
    d = a.smooth_d(pts)
    a.path(d, fill="none", stroke=kit.AMBER, stroke_width=90, opacity=0.25, filter=a.blur(26))
    a.path(d, fill="none", stroke=kit.RED, stroke_width=26, opacity=0.3, filter=a.blur(10))
    a.path(d, fill="none", stroke=kit.mix(kit.DUST, kit.CEDAR, 0.5), stroke_width=7, opacity=0.9)
    a.path(d, fill="none", stroke=kit.CEDAR_D, stroke_width=2.2)
    kit.thread(a, a.smooth_d([(x, y - 30) for x, y in pts]), kit.mix(kit.DUST, kit.CEDAR, 0.35), w=2, dash="3 9", shadow=False)
    kit.thread(a, a.smooth_d([(x, y + 30) for x, y in pts]), kit.mix(kit.DUST, kit.CEDAR, 0.35), w=2, dash="3 9", shadow=False)
    for k in range(6):
        x = 170 + k * 250
        y = 450 + 46 * math.sin(x / 260)
        ang = rng.uniform(60, 120)
        a.open("g", transform=f"rotate({f(ang)} {x} {f(y)})")
        a.line(x - 60, y, x + 60, y, stroke="#1a0f08", stroke_width=3, opacity=0.3, transform="translate(3 5)")
        a.line(x - 60, y, x - 14, y, stroke="#cfd2d4", stroke_width=3), a.line(x + 14, y, x + 60, y, stroke="#cfd2d4", stroke_width=3)
        a.circle(x - 64, y, 9, fill=[kit.RUST, kit.SKY, kit.MOSS][k % 3], stroke=kit.CEDAR_D, stroke_width=1.2)
        a.close()
    a.path(R(1180, 120, 150, 130, 6), fill=kit.RUST, filter=kit.felt_filter(a), transform="rotate(8 1255 185)")
    kit.thread(a, R(1192, 132, 126, 106, 4), kit.BONE, w=3, dash="9 6", transform="rotate(8 1255 185)")
    kit.lamp(a, 380, 160, 900, kit.AMBER, 0.3)
    kit.shade(a, 0.6)


@asset(G, "ground-torn-seam", group="backdrops", title="Fabric ground: a friend's torn seam", w=1600, h=900, row=ROW_F)
def ground_torn(a: Art):
    """Rust felt filling the view at dawn: a ragged tear across it drawn as nothing but its two frayed lips and
    the shadow between, loose thread ends, and cold window light coming up from the right."""
    cloth(a, kit.RUST)
    rng = a.rng
    top = [(x, 430 + 60 * math.sin(x / 300 + 1) + rng.uniform(-10, 10)) for x in range(200, 1420, 36)]
    bot = [(x, y + 8 + 34 * math.sin((x - 200) / 1220 * math.pi) + rng.uniform(-6, 6)) for x, y in top]
    lens = P(*top, *reversed(bot))
    a.path(lens, fill="#1a0f08", opacity=0.45, filter=a.blur(12))
    a.path(lens, fill=kit.mix(kit.CEDAR_D, "#0f0906", 0.55))
    for pts, s in ((top, -1), (bot, 1)):
        d = "".join(f"M{f(x)},{f(y)}l{f(rng.uniform(-8, 8))},{f(-s * rng.uniform(6, 20))}" for x, y in pts for _ in range(3))
        a.path(d, stroke=kit.light(kit.RUST, 0.35), stroke_width=1.6, stroke_linecap="round", fill="none")
    for x0_ in (330, 700, 1180):
        a.path(a.smooth_d([(x0_, 450), (x0_ + 30, 520), (x0_ - 10, 590), (x0_ + 40, 660)]), fill="none", stroke=kit.BONE, stroke_width=2.6,
               stroke_linecap="round", opacity=0.9)
    kit.thread(a, "M-10,250C400,180 900,300 1610,220", kit.dark(kit.RUST, 0.4), w=3, dash="10 8")
    a.rect(0, 0, 1600, 900, fill=a.gradient([(0, kit.NIGHT), (0.6, kit.SKY), (1, "#f3e3c4")], x1=0, y1=0, x2=1, y2=0), opacity=0.34)
    kit.shade(a, 0.55, kit.NIGHT)


@asset(G, "ground-altar", group="backdrops", title="Fabric ground: the edge of the circle", w=1600, h=900, row=ROW_F)
def ground_altar(a: Art):
    """The ritual-room floor in near dark: the edge of the circle of torn fabric skins as an arc of faded cloth
    scraps lying edge to edge, the place for twelve stitches pricked along it, and the room's red warmth beyond."""
    a.paper(kit.mix(kit.CEDAR_D, kit.NIGHT, 0.3), grain=0.3, fibre=0.3)
    for y in range(0, 900, 110):
        a.line(0, y, 1600, y, stroke="#120b07", stroke_width=3, opacity=0.6)
    kit.lamp(a, 800, -260, 1000, kit.RED, 0.75)
    kit.lamp(a, 800, -200, 520, kit.AMBER, 0.5)
    rng = a.rng
    cx, cy, r = 800, -500, 1050
    cols = [kit.mix(kit.DUST, kit.RUST, 0.2), kit.mix(kit.SKY, kit.DUST, 0.4), kit.mix(kit.MOSS, kit.DUST, 0.4), kit.light(kit.RUST, 0.4),
            kit.mix(kit.DUST, kit.CEDAR, 0.3)]
    for k in range(13):
        t0 = math.radians(50 + k * 6.2)
        t1 = t0 + math.radians(5.6)
        pts = []
        for (t, rr) in ((t0, r - 70), (t0, r + 60), ((t0 + t1) / 2, r + 74 + rng.uniform(-12, 12)), (t1, r + 60), (t1, r - 70),
                        ((t0 + t1) / 2, r - 84)):
            pts.append((cx + rr * math.cos(t) + rng.uniform(-6, 6), cy + rr * math.sin(t) + rng.uniform(-6, 6)))
        a.path(a.wobble_d(pts, 3, 12, closed=True), fill=kit.mix(cols[k % 5], kit.CEDAR_D, 0.3), filter=kit.felt_filter(a))
    arc = [(cx + (r + 96) * math.cos(math.radians(tt)), cy + (r + 96) * math.sin(math.radians(tt))) for tt in range(48, 134, 4)]
    kit.thread(a, a.smooth_d(arc), kit.BONE, w=3.4, dash="2 68", shadow=False)
    kit.thread(a, a.smooth_d(arc[:9]), kit.BONE, w=5, dash="44 26")
    kit.shade(a, 0.7, "#0f0906")

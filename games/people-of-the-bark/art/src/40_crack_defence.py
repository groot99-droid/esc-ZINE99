"""Crack defence, as an isometric diorama: four backdrops and six pieces."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW_B = "Defence backdrops: mite crack, Beetle crack, paper wall, knuckle"
ROW_P = "Defence pieces: warrior, barricade, Beetle, ant, mud wall, plugged door"
NX, NY = 14, 5
LINES = [1.6, 4.1, 6.6, 9.1, 11.6]
PAPERW = ["#aeb7b9", "#9aa4a7", "#b9c2c4", "#8d979a"]


FLOOR = ("#94694a", "#855c3e")
WALLC = ("#94694a", "#a67c56", "#a8977f", "#855c3e")


def backdrop(a, wall_h, floor=FLOOR, wall_cols=WALLC, sky=("#2b1d14", "#6a4a33"),
             wall_fn=None, s=60, ox=566, oy=262, glow=None):
    a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, sky[0]), (1, sky[1])]))
    if glow:
        kit.glow(a, glow[0], glow[1], glow[2], glow[3], 0.6)
    iso = kit.Iso(a, s, ox, oy)
    P = iso.P
    r = a.rng
    a.poly([P(0, NY, -0.3), P(NX, NY, -0.3), P(NX, NY, -1.2), P(0, NY, -1.2)], fill="#24180f")
    a.poly([P(NX, 0, -0.3), P(NX, NY, -0.3), P(NX, NY, -1.2), P(NX, 0, -1.2)], fill="#170f0a")
    for x in range(NX):
        for y in range(NY):
            if y == 0:
                hgt = wall_h(x, r)
                for z in range(hgt):
                    col = wall_fn(x, z, hgt) if wall_fn else None
                    col = col or r.choice(wall_cols)
                    iso.add(x + y, lambda x=x, z=z, col=col: iso.cube(x, 0, z, col))
            else:
                col = floor[(x + y) % 2]
                iso.add(x + y - 0.5, lambda x=x, y=y, col=col: iso.cube(x, y, -0.3, col, h=0.3))
    return iso


def line_marks(a, iso, fallen=()):
    """The five barricade lines, as cut grooves and pegs in the floor (the pieces stand on them)."""
    for k, bx in enumerate(LINES):
        def draw(bx=bx, k=k):
            p1, p2 = iso.P(bx, 1, 0.01), iso.P(bx, NY, 0.01)
            a.line(*p1, *p2, stroke=kit.CRACK, stroke_width=7, stroke_linecap="round")
            a.line(*p1, *p2, stroke=kit.GOLD if k not in fallen else "#6a4a33", stroke_width=2.2, stroke_dasharray="10 8")
            for y in (1.0, NY):
                q = iso.P(bx, y, 0.01)
                a.ellipse(q[0], q[1], 9, 5, fill=kit.CRACK)
                a.ellipse(q[0], q[1] - 3, 7, 4, fill="#e6cfa0", stroke=kit.CRACK, stroke_width=1)
            q = iso.P(bx + 0.5, NY + 0.45, 0.01)
            a.text(q[0], q[1] + 8, "I" * (k + 1) if k < 3 else ("IV", "V")[k - 3], size=20, family="serif", fill=kit.GOLD,
                   text_anchor="middle", font_weight="bold", opacity=0.9)
        iso.add(bx + 1 - 0.3, draw)


def lichen(a, iso, spots):
    for (x, z) in spots:
        def draw(x=x, z=z):
            q = iso.P(x + 0.5, 0.5, z)
            for dx, dy, rr in ((-12, 0, 9), (0, -4, 12), (12, 2, 8)):
                a.ellipse(q[0] + dx, q[1] + dy, rr, rr * 0.6, fill=kit.SAGE, stroke=kit.CRACK, stroke_width=1)
                a.ellipse(q[0] + dx - 2, q[1] + dy - 2, rr * 0.5, rr * 0.3, fill=kit.LIME)
        iso.add(x + 0.9, draw)


def wall_lantern(a, iso, x, z):
    def draw():
        q = iso.P(x + 0.5, 1, z)
        kit.lantern(a, q[0], q[1], 1.4, halo=110)
    iso.add(x + 1.2, draw)


def finish(a, iso, dust=True):
    iso.flush()
    kit.glow(a, 620, 520, 620, kit.GOLD, 0.16)
    if dust:
        kit.dust(a, 0, 0, a.w, a.h, n=220, opacity=0.3)
    a.vignette(0.45)


@asset(G, "defence-backdrop-mite-crack", group="backdrops", title="Crack defence backdrop: the mite crack", w=1600, h=900,
       row=ROW_B)
def bd_mites(a: Art):
    """The lower crack where the mites come: a low diorama of bark blocks, lichen on the wall tops, small dark
    holes in the back wall where they nest, two lanterns, and the five barricade lines cut into the floor."""
    iso = backdrop(a, lambda x, r: r.choice([2, 2, 3, 3]), glow=(560, 420, 700, kit.LANTERN))
    line_marks(a, iso)
    lichen(a, iso, [(1, 2), (4, 3), (6, 2), (9, 3), (12, 2)])
    for x in (2, 5, 7, 10, 11, 13):
        def hole(x=x):
            q = iso.P(x + 0.5, 1, 0.55)
            a.ellipse(q[0], q[1], 12, 15, fill="#0d0805", stroke=kit.CRACK, stroke_width=2)
            a.path(f"M{f(q[0] - 12)},{f(q[1] + 4)} q12,14 24,0", fill="none", stroke="#c99a6a", stroke_width=1.5, opacity=0.6)
        iso.add(x + 1.1, hole)
    wall_lantern(a, iso, 3, 1.5)
    wall_lantern(a, iso, 9, 1.6)
    finish(a, iso)


@asset(G, "defence-backdrop-beetle-crack", group="backdrops", title="Crack defence backdrop: the Beetle crack", w=1600,
       h=900, row=ROW_B)
def bd_beetle(a: Art):
    """The wide crack the Beetle climbs: a tall back wall, a black opening at the far end as high as the wall
    itself, old gouges in the floor, a pool of sap-glue before the fourth line and the five lines waiting."""
    iso = backdrop(a, lambda x, r: r.choice([3, 4, 4]) if x < 11 else 4, oy=262,
                   glow=(480, 480, 700, kit.LANTERN))
    P = iso.P

    def mouth():
        pts = [P(NX, 1 + 4 * (i / 10), 3.9 * math.sin(math.pi * i / 10)) for i in range(11)]
        a.poly(pts, fill="#050302", stroke=kit.CRACK, stroke_width=3)
        for k in range(3):
            q1, q2 = P(NX, 2 + k * 0.9, 0.1), P(NX - 1.6, 2 + k * 0.9 + 0.3, 0.02)
            a.line(*q1, *q2, stroke="#050302", stroke_width=5, stroke_linecap="round")
    iso.add(NX + 0.6, mouth)
    line_marks(a, iso)

    def pool():
        pts = [P(10.2 + 0.75 * math.cos(t) * (1 + 0.15 * math.sin(3 * t)), 2.9 + 1.2 * math.sin(t), 0.01)
               for t in [2 * math.pi * i / 24 for i in range(24)]]
        a.poly(pts, fill=kit.AMBER, opacity=0.9, stroke=kit.GOLD, stroke_width=2)
        for dx, dy in ((0.1, -0.5), (-0.2, 0.3), (0.3, 0.5)):
            q = P(10.2 + dx, 2.9 + dy, 0.01)
            a.ellipse(q[0], q[1], 9, 4, fill=kit.GOLD, opacity=0.8)
    iso.add(11.9, pool)

    def gouges():
        for k in range(4):
            q1, q2 = P(6.2 + k * 0.5, 1.6 + k * 0.7, 0.01), P(7.6 + k * 0.5, 1.8 + k * 0.7, 0.01)
            a.line(*q1, *q2, stroke=kit.CRACK, stroke_width=3, stroke_linecap="round", opacity=0.8)
    iso.add(9.4, gouges)
    lichen(a, iso, [(2, 4), (7, 4)])
    wall_lantern(a, iso, 4, 2.2)
    finish(a, iso)


@asset(G, "defence-backdrop-paper-wall", group="backdrops", title="Crack defence backdrop: the paper wall", w=1600, h=900,
       row=ROW_B)
def bd_paper(a: Art):
    """The Procession and the Wall: the autumn crack, where a stretch of the back wall is not bark but thin
    chalk-grey layers ribbed with dried mud. One hole in it is stopped from inside by a single round plug, and a
    dotted trail on the floor shows where the ants will go in."""
    def wf(x, z, hgt):
        return PAPERW[(x + z) % 4] if 5 <= x <= 10 else None
    iso = backdrop(a, lambda x, r: 4 if 5 <= x <= 10 else r.choice([3, 4]), wall_fn=wf, oy=262,
                   glow=(1000, 360, 520, kit.CHALK))
    P = iso.P
    line_marks(a, iso)

    def layers():
        for x in range(5, 11):
            for k in range(1, 16):
                z = k * 0.25
                q1, q2 = P(x, 1, z), P(x + 1, 1, z)
                a.line(*q1, *q2, stroke="#5d676a", stroke_width=1, opacity=0.8)
        for x, z0 in ((5.4, 0.2), (6.7, 1.1), (8.2, 0.4), (9.6, 1.6), (7.4, 2.4)):
            pts = [P(x + 0.12 * math.sin(k * 1.3), 1, z0 + k * 0.22) for k in range(7)]
            a.path(a.smooth_d(pts), fill="none", stroke="#5a4a3a", stroke_width=9, stroke_linecap="round", opacity=0.85)
            a.path(a.smooth_d(pts), fill="none", stroke="#8a7a66", stroke_width=3, stroke_linecap="round", opacity=0.8)
        q = P(8.5, 1, 1.5)
        a.ellipse(q[0], q[1], 26, 30, fill="#2a3033", stroke="#5d676a", stroke_width=3)
        a.ellipse(q[0] - 2, q[1], 19, 23, fill="#7a5a40", stroke=kit.CRACK, stroke_width=2)
        a.stipple(q[0] - 16, q[1] - 18, 30, 36, n=26, r=(0.8, 1.8), fill=kit.CRACK, opacity=0.6)
        a.ellipse(q[0] - 8, q[1] - 8, 6, 9, fill="#c99a6a", opacity=0.4)
        q = P(6.5, 1, 0.3)
        a.ellipse(q[0], q[1], 13, 15, fill="#0d0f10", stroke="#5d676a", stroke_width=2)
    iso.add(11.6, layers)

    def trail():
        pts = [P(13.6 - t * 7.0, 3.6 - 0.9 * math.sin(t * 2.2) - t * 2.0, 0.02) for t in [i / 30 for i in range(31)]]
        for i, (x, y) in enumerate(pts):
            a.ellipse(x, y, 4.5, 2.5, fill=kit.CRACK, opacity=0.4 + 0.6 * i / 30)
    iso.add(14.4, trail)
    lichen(a, iso, [(2, 4), (12, 4)])
    wall_lantern(a, iso, 3, 2.0)
    finish(a, iso)


@asset(G, "defence-backdrop-knuckle", group="backdrops", title="Crack defence backdrop: the knuckle", w=1600, h=900,
       row=ROW_B)
def bd_knuckle(a: Art):
    """The war branch, where the mode runs backwards: the lines are five footholds up a knuckle. The bark floor
    ends and a huge dark-edged slope begins, stepped block by block, ridged like a fingerprint, rising out of the
    frame into a black sky, the last warm light on the bark floor below."""
    a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, "#050302"), (1, "#4a3324")]))
    kit.glow(a, 1050, 760, 760, kit.LANTERN, 0.6)
    iso = kit.Iso(a, 56, 640, 420)
    P = iso.P
    r = a.rng
    D = 4
    skin = ["#b08672", "#a37a68", "#b88e78"]
    a.poly([P(7, D, -0.3), P(12, D, -0.3), P(12, D, -1.1), P(7, D, -1.1)], fill="#24180f")
    a.poly([P(12, 0, -0.3), P(12, D, -0.3), P(12, D, -1.1), P(12, 0, -1.1)], fill="#170f0a")
    RISE = 1.2

    def step(k):
        x, z = 6 - k, (k + 1) * RISE
        iso.cube(x, 0, -0.3, skin[k % 3], h=z + 0.3, w=1, d=D, grain=False, edge="#5a3a30", sw=1)
        for j in range(4):
            pts = [P(x + 0.14 + j * 0.24 + 0.07 * math.sin(y * 1.5 + k), y, z) for y in (0.1, 1.0, 2.0, 3.0, D - 0.1)]
            a.path(a.smooth_d(pts), fill="none", stroke="#6a4a3e", stroke_width=1.8, opacity=0.75)
        for j in range(1, 5):
            q1, q2 = P(x + 1, 0.1, z - j * RISE / 5), P(x + 1, D - 0.1, z - j * RISE / 5 - 0.05)
            a.line(*q1, *q2, stroke="#5a3a30", stroke_width=1.2, opacity=0.55)
        if k < 5:
            p1, p2 = P(x + 0.5, 0.5, z + 0.01), P(x + 0.5, D - 0.4, z + 0.01)
            a.line(*p1, *p2, stroke="#2a1410", stroke_width=7, stroke_linecap="round")
            a.line(*p1, *p2, stroke=kit.GOLD, stroke_width=2.4, stroke_dasharray="10 8")
            for q in (p1, p2):
                a.line(q[0], q[1], q[0] + 4, q[1] - 30, stroke=kit.CRACK, stroke_width=7, stroke_linecap="round")
                a.line(q[0], q[1], q[0] + 4, q[1] - 30, stroke="#e6cfa0", stroke_width=4, stroke_linecap="round")
            a.text(p2[0] - 34, p2[1] + 18, "I" * (k + 1) if k < 3 else ("IV", "V")[k - 3], size=24, family="serif",
                   fill=kit.GOLD, text_anchor="middle", font_weight="bold")
    for k in range(6, -1, -1):
        step(k)
    for x in range(7, 12):
        for y in range(D):
            if y == 0:
                for z in range(r.choice([2, 3])):
                    iso.add(x + y, lambda x=x, z=z: iso.cube(x, 0, z, r.choice(WALLC)))
            else:
                iso.add(x + y - 0.5, lambda x=x, y=y: iso.cube(x, y, -0.3, FLOOR[(x + y) % 2], h=0.3))
    iso.flush()
    # the dark of the hand over the top of the climb
    a.rect(0, 0, a.w, 420, fill=a.gradient([(0, "#050302"), (1, "#050302")]), opacity=0.55,
           clip_path=a.clip('<path d="M0,0 H1600 V120 Q900,300 0,420Z"/>'))
    kit.dust(a, 500, 300, 1100, 600, n=200, opacity=0.35)
    a.vignette(0.7)


# ---------------------------------------------------------------------------------------------
# pieces
# ---------------------------------------------------------------------------------------------
def tile(a, w=2, d=2, s=72, ox=180, oy=205, col=("#6a4a33", kit.UMBER), glow=None):
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#4a3324", 1), (1, "#1b120c", 1)], r=0.75))
    if glow:
        kit.glow(a, 180, 200, 170, glow, 0.5)
    iso = kit.Iso(a, s, ox, oy)
    for x in range(w):
        for y in range(d):
            iso.cube(x, y, -0.3, col[(x + y) % 2], h=0.3)
    return iso


@asset(G, "defence-piece-warrior", group="pieces", title="Crack defence piece: warrior", w=360, h=360, row=ROW_P)
def pc_warrior(a: Art):
    """A warrior of the Battlements on a floor tile: bark-plate, a splinter spear held upright, and beside him
    Captain Burr with the orange crest, spear polished and never blooded."""
    iso = tile(a, glow=kit.LANTERN)
    q = iso.P(0.6, 1.3, 0)
    kit.iso_folk(a, q[0], q[1], 2.0)
    q = iso.P(1.45, 0.75, 0)
    kit.iso_folk(a, q[0], q[1], 2.3, crest=kit.LANTERN, cloth="#9a7a52")
    a.vignette(0.5)


@asset(G, "defence-piece-barricade", group="pieces", title="Crack defence piece: barricade", w=360, h=360, row=ROW_P)
def pc_barricade(a: Art):
    """A barricade: a bank of pale bark blocks across the crack, sharpened splinter stakes leaning out of it
    toward whatever is coming, and ten notches on its face for its ten points."""
    iso = tile(a, glow=kit.AMBER)
    for y in (0, 1):
        iso.cube(0.8, y, 0, "#9a7a52", h=0.9, w=0.42)
        iso.cube(0.8, y, 0.9, "#b08a5c", h=0.28, w=0.42)
    for y, t in ((0, 0.25), (0, 0.75), (1, 0.25), (1, 0.75)):
        p1, p2 = iso.P(1.02, y + t, 1.0), iso.P(1.75, y + t, 1.75)
        a.line(*p1, *p2, stroke=kit.CRACK, stroke_width=9, stroke_linecap="round")
        a.line(*p1, *p2, stroke="#e6cfa0", stroke_width=5.5, stroke_linecap="round")
    for k in range(10):
        p1, p2 = iso.P(0.86 + 0.0, 2, 0.22 + 0.0), iso.P(0.86, 2, 0.5)
        a.line(p1[0] + 3 + k * 2.6, p1[1] + k * 1.5, p2[0] + 3 + k * 2.6, p2[1] + k * 1.5, stroke=kit.CRACK, stroke_width=1.6)
    a.vignette(0.5)


def beetle(a, bx, by, s=1.0):
    a.open("g", transform=f"translate({f(bx)} {f(by)}) scale({f(s)})")
    a.ellipse(0, 40, 120, 40, fill="#000", opacity=0.4)
    for leg in range(3):
        for sgn in (-1, 1):
            x0, y0 = -40 + leg * 38, 10 + sgn * 14
            a.path(f"M{x0},{y0} q{-14 + leg * 6},{-30} {-34 + leg * 10},{sgn * 26 + 22}", fill="none", stroke="#120c08",
                   stroke_width=7, stroke_linecap="round")
    grad = a.radial([(0, "#4d5a4a", 1), (0.55, "#1e2420", 1), (1, "#0c0f0d", 1)], cx=0.38, cy=0.3)
    a.ellipse(0, -20, 115, 72, fill=grad, stroke="#000", stroke_width=2)
    a.line(-8, -90, 20, 48, stroke="#000", stroke_width=3)
    a.path("M-90,-30 Q-60,-70 -20,-78 M30,-84 Q70,-74 96,-40", fill="none", stroke="#2e3a34", stroke_width=3)
    a.ellipse(-98, 10, 40, 30, fill="#151a17", stroke="#000", stroke_width=2)
    for sgn in (-1, 1):
        a.path(f"M-118,{10 + sgn * 8} q-40,{sgn * 6} -52,{sgn * 30}", fill="none", stroke="#0c0f0d", stroke_width=7,
               stroke_linecap="round")
    a.ellipse(-40, -55, 26, 12, fill="#cfe0c8", opacity=0.35)
    a.close()


@asset(G, "defence-piece-beetle", group="pieces", title="Crack defence piece: the Beetle", w=360, h=360, row=ROW_P)
def pc_beetle(a: Art):
    """The Beetle: a domed dark-green shell on six legs filling its three floor tiles, feelers forward, one
    highlight on its back. It has no face. Two tiny warriors beside it give its size."""
    iso = tile(a, w=3, d=2, s=58, ox=170, oy=190)
    beetle(a, 196, 196, 1.02)
    q = iso.P(0.2, 1.9, 0)
    kit.iso_folk(a, q[0], q[1], 0.62)
    q = iso.P(0.7, 2.3, 0)
    kit.iso_folk(a, q[0] - 10, q[1], 0.62, crest=kit.LANTERN)
    a.vignette(0.5)


def ant(a, x, y, s=1.0):
    a.open("g", transform=f"translate({f(x)} {f(y)}) scale({f(s)})")
    a.ellipse(0, 18, 62, 12, fill="#000", opacity=0.35)
    for lx, d in ((-8, -1), (2, 0), (12, 1)):
        for sgn in (-1, 1):
            a.path(f"M{lx},{2} l{d * 10 - 4},{-18 + sgn * 4} l{d * 12 - 6},{34}", fill="none", stroke="#1b0d08", stroke_width=3.2,
                   stroke_linecap="round", stroke_linejoin="round", opacity=1 if sgn > 0 else 0.7)
    a.ellipse(34, 0, 26, 17, fill="#4a2418", stroke="#1b0d08", stroke_width=1.8)
    a.ellipse(4, 2, 13, 10, fill="#5a2e1c", stroke="#1b0d08", stroke_width=1.8)
    a.ellipse(-22, -4, 16, 14, fill="#4a2418", stroke="#1b0d08", stroke_width=1.8)
    a.path("M-34,-12 l-14,-18 l-14,4 M-30,-14 l-6,-22 l-14,-4", fill="none", stroke="#1b0d08", stroke_width=2.4, stroke_linecap="round",
           stroke_linejoin="round")
    a.path("M-36,2 q-10,2 -12,10 M-34,6 q-4,6 -2,12", fill="none", stroke="#1b0d08", stroke_width=3, stroke_linecap="round")
    a.ellipse(28, -7, 12, 4, fill="#c99a6a", opacity=0.4)
    a.close()


@asset(G, "defence-piece-ant", group="pieces", title="Crack defence piece: ant", w=360, h=360, row=ROW_P)
def pc_ant(a: Art):
    """An ant, middle-sized, which is why the Knot is asked: three of a column of twelve crossing the tiles in
    file, red-brown, elbowed feelers out, as tall as the warrior who stands aside for them."""
    iso = tile(a, w=3, d=2, s=58, ox=170, oy=200, glow=kit.AMBER)
    q = iso.P(2.5, 0.5, 0)
    ant(a, q[0], q[1] - 16, 0.7)
    q = iso.P(1.6, 1.0, 0)
    ant(a, q[0], q[1] - 20, 1.0)
    q = iso.P(0.5, 1.5, 0)
    ant(a, q[0], q[1] - 26, 1.35)
    q = iso.P(2.6, 2.0, 0)
    kit.iso_folk(a, q[0], q[1], 1.0, spear_up=True)
    a.vignette(0.5)


@asset(G, "defence-piece-mud-wall", group="pieces", title="Crack defence piece: mud wall", w=360, h=360, row=ROW_P)
def pc_mud(a: Art):
    """A mud wall: a breach in a bark block closed from the other side with pale ribbed mud, still damp at the
    edges. Whatever built it is not shown; only its work."""
    iso = tile(a, glow=kit.CHALK)
    for x in (0, 1):
        for z in (0, 1, 2):
            iso.cube(x, 0, z, (kit.UMBER, "#6a4a33", kit.GREYBROWN)[(x + z) % 3])
    P = iso.P
    pts = [P(1 + 0.7 * math.cos(t) * (1 + 0.1 * math.sin(5 * t)), 1, 1.35 + 1.05 * math.sin(t) * (1 + 0.08 * math.cos(3 * t)))
           for t in [2 * math.pi * i / 28 for i in range(28)]]
    a.poly(pts, fill="#1b2023", stroke=kit.CRACK, stroke_width=3)
    cp = a.clip('<polygon points="' + " ".join(f"{f(x)},{f(y)}" for x, y in pts) + '"/>')
    a.open("g", clip_path=cp)
    for k in range(9):
        z = 0.35 + k * 0.24
        row = [P(0.2 + i * 0.2, 1, z + 0.05 * math.sin(i * 1.7 + k)) for i in range(9)]
        a.path(a.smooth_d(row), fill="none", stroke="#9aa4a7" if k % 2 else kit.CHALK, stroke_width=13, stroke_linecap="round")
        a.path(a.smooth_d([(x, y + 6) for x, y in row]), fill="none", stroke="#6f777a", stroke_width=1.6)
    a.close()
    a.stipple(100, 80, 150, 150, n=40, r=(0.8, 2), fill="#8a7a66", opacity=0.6)
    a.vignette(0.5)


@asset(G, "defence-piece-plugged-door", group="pieces", title="Crack defence piece: the plugged door", w=360, h=360, row=ROW_P)
def pc_plug(a: Art):
    """The plugged door: a round hole in the paper wall stopped by one flat, pitted, amber-brown disc that never
    comes out. A ring of gold marks the reach inside which a warrior may not be left for ten seconds."""
    iso = tile(a, glow=kit.CHALK)
    for x in (0, 1):
        for z in (0, 1, 2):
            iso.cube(x, 0, z, PAPERW[(x + z) % 4])
    P = iso.P
    for k in range(1, 12):
        q1, q2 = P(0, 1, k * 0.25), P(2, 1, k * 0.25)
        a.line(*q1, *q2, stroke="#5d676a", stroke_width=1)
    q = P(1, 1, 1.4)
    a.ellipse(q[0], q[1], 50, 58, fill="#22282b", stroke="#5d676a", stroke_width=4, transform=f"skewY(30) translate(0 {f(-q[0] * 0.577)})")
    a.open("g", transform=f"skewY(30) translate(0 {f(-q[0] * 0.577)})")
    a.ellipse(q[0] - 2, q[1], 38, 45, fill=a.radial([(0, "#b07a48", 1), (0.7, "#7a4a2a", 1), (1, "#3a2014", 1)], cx=0.4, cy=0.35),
              stroke=kit.CRACK, stroke_width=2.5)
    a.stipple(q[0] - 34, q[1] - 40, 64, 80, n=70, r=(1, 2.6), fill="#3a2014", opacity=0.7)
    a.ellipse(q[0] - 14, q[1] - 18, 10, 14, fill="#f0c890", opacity=0.3)
    a.close()
    pts = [P(1 + 0.95 * math.cos(t), 1.2 + 0.75 * abs(math.sin(t)), 0.02) for t in [math.pi * i / 16 for i in range(17)]]
    a.path(a.smooth_d(pts), fill="none", stroke=kit.GOLD, stroke_width=3, stroke_dasharray="6 8", stroke_linecap="round")
    a.vignette(0.5)


# ---------------------------------------------------------------------------------------------
# sprites: the same figures with no tile and no ground, for the web mode to stand on its own floor
# ---------------------------------------------------------------------------------------------
ROW_S = "Defence sprites: warrior, Burr, people, the Beetle, mite"


@asset(G, "defence-sprite-warrior", group="pieces", title="Crack defence sprite: warrior", w=120, h=200, row=ROW_S)
def sp_warrior(a: Art):
    """One warrior of the Battlements with nothing behind him: bark-plate, a splinter spear held upright, a
    small shadow at his feet. Drawn to be set on the web mode's own floor."""
    kit.iso_folk(a, 52, 184, 2.1)


@asset(G, "defence-sprite-burr", group="pieces", title="Crack defence sprite: Captain Burr", w=120, h=200, row=ROW_S)
def sp_burr(a: Art):
    """Captain Burr with nothing behind him: the orange crest, the paler plate, the polished spear upright."""
    kit.iso_folk(a, 52, 184, 2.1, crest=kit.LANTERN, cloth="#9a7a52")


@asset(G, "defence-sprite-people", group="pieces", title="Crack defence sprite: people in the crack", w=200, h=160, row=ROW_S)
def sp_people(a: Art):
    """Three of the people of Highridge who have wandered into the crack, with nothing behind them: sage robes,
    no spears, one of them carrying a lit lantern."""
    kit.iso_folk(a, 150, 132, 1.5, cloth=kit.SAGE, robe=True, spear_up=False)
    kit.iso_folk(a, 54, 140, 1.6, cloth="#7d8f6a", robe=True, spear_up=False)
    kit.iso_folk(a, 104, 152, 1.7, cloth=kit.SAGE, robe=True, spear_up=False)
    kit.glow(a, 132, 104, 26, kit.LANTERN, 0.7)
    a.circle(132, 104, 6.5, fill=kit.LANTERN, stroke=kit.CRACK, stroke_width=1.2)
    a.circle(131, 103, 2.6, fill=kit.GOLD)


@asset(G, "defence-sprite-beetle", group="pieces", title="Crack defence sprite: the Beetle", w=360, h=240, row=ROW_S)
def sp_beetle(a: Art):
    """The Beetle with nothing behind it: the domed dark-green shell on six legs, feelers forward, one highlight
    on its back, its shadow under it. It has no face."""
    beetle(a, 196, 128, 1.0)


@asset(G, "defence-sprite-mite", group="pieces", title="Crack defence sprite: mite", w=120, h=90, row=ROW_S)
def sp_mite(a: Art):
    """A mite with nothing behind it: a small red body low to the floor on six bent legs, two pale eye spots.
    The small ones always come first."""
    a.ellipse(60, 66, 44, 12, fill="#000", opacity=0.35)
    for lx in (-22, 0, 22):
        for sgn in (-1, 1):
            a.path(f"M{60 + lx},{48} q{sgn * 6 - 8},{-16 if sgn < 0 else 4} {lx * 0.5 - 14 + sgn * 4},{20 + sgn * 6}", fill="none",
                   stroke=kit.CRACK, stroke_width=4, stroke_linecap="round")
    a.ellipse(60, 44, 36, 24, fill=a.radial([(0, "#e06a3c", 1), (0.7, "#b8402a", 1), (1, "#6a1e12", 1)], cx=0.4, cy=0.3),
              stroke=kit.CRACK, stroke_width=2.5)
    a.ellipse(34, 48, 14, 11, fill="#8a2a1a", stroke=kit.CRACK, stroke_width=2)
    a.circle(28, 45, 2.6, fill=kit.PAPER)
    a.circle(36, 42, 2.2, fill=kit.PAPER)
    a.ellipse(66, 34, 14, 6, fill="#ffd0a8", opacity=0.35)

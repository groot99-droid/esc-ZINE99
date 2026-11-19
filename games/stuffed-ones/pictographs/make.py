"""The Stuffed Ones gameplay pictographs. Built by tools/pictographs/build.py.

One palette (DESIGN.md section 15: cedar, attic-dust beige, faded felt moss, rust, sky and cream,
bone-white thread, warmth as an amber that grows into red, night blue-grey without black), drawn
in six different styles: lithograph, tapestry, cross-stitch chart, blackwork, felt, tissue pattern.
"""
import math

from core import H, W, Pic, f, register

G = "stuffed-ones"

CEDAR = "#6b4a32"
CEDAR_D = "#4a3222"
DUST = "#e6dcc6"
MOSS = "#7d8a5a"
RUST = "#a5553a"
SKY = "#8fa9bf"
CREAM = "#efe5cf"
BONE = "#f6f1e4"
AMBER = "#e39a2d"
RED = "#b8322a"
NIGHT = "#56627a"
NIGHT_L = "#7f8ca3"


def mix(c1, c2, t):
    """Blend two hex colours."""
    t = max(0.0, min(1.0, t))
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(a, b))


def warmth(t):
    """0 = cool cream, 0.5 = amber, 1 = red: the game's one saturated colour."""
    return mix(DUST, AMBER, t * 2) if t < 0.5 else mix(AMBER, RED, (t - 0.5) * 2)


# ------------------------------------------------------------------------------------------------
# 2D: Dollhouse cutaway, as a Victorian dollhouse catalogue lithograph
# ------------------------------------------------------------------------------------------------
def _wallpaper(p, ground, sprig, size=22):
    """A small repeating-flower wallpaper as an SVG pattern; returns its fill url."""
    pid = p.uid("wp")
    s = size
    p.defn(f'<pattern id="{pid}" width="{s}" height="{s}" patternUnits="userSpaceOnUse">'
           f'<rect width="{s}" height="{s}" fill="{ground}"/>'
           f'<circle cx="{s/4}" cy="{s/4}" r="1.8" fill="{sprig}"/>'
           f'<circle cx="{s/4 - 2.6}" cy="{s/4}" r="1.1" fill="{sprig}" opacity="0.7"/>'
           f'<circle cx="{s/4 + 2.6}" cy="{s/4}" r="1.1" fill="{sprig}" opacity="0.7"/>'
           f'<circle cx="{3*s/4}" cy="{3*s/4}" r="1.4" fill="{sprig}" opacity="0.8"/>'
           f'<path d="M{3*s/4},{3*s/4 + 1.5} v4" stroke="{sprig}" stroke-width="0.8" opacity="0.6"/>'
           f'</pattern>')
    return f"url(#{pid})"


def _toy(p, x, y, s=1.0, body=CREAM, glow=None, ink="#2a211b"):
    """A small stuffed animal seen from the front: round head, two ears, button eyes."""
    if glow:
        p.circle(x, y - 10 * s, 34 * s, fill=p.radial([(0, glow, 0.75), (1, glow, 0)]))
    p.ellipse(x, y, 13 * s, 15 * s, fill=body, stroke=ink, stroke_width=1.4)
    p.circle(x, y - 20 * s, 11 * s, fill=body, stroke=ink, stroke_width=1.4)
    for dx in (-7, 7):
        p.poly([(x + dx * s - 4 * s, y - 27 * s), (x + dx * s, y - 36 * s), (x + dx * s + 4 * s, y - 27 * s)],
               fill=body, stroke=ink, stroke_width=1.2)
        p.circle(x + dx * 0.55 * s, y - 21 * s, 1.8 * s, fill=ink)
    p.path(f"M{f(x)},{f(y - 15 * s)} v6", stroke=ink, stroke_width=0.9, stroke_dasharray="1.5 1.5")


@register(G, "dollhouse-cutaway")
def dollhouse_cutaway(p: Pic):
    """Dollhouse cutaway (2D): the cabin at night, cut open from the front like a plate in a toy
    catalogue, three floors and every room at once. Your stuffed cat, ringed as the selected toy,
    stands frozen on the stairs while a sleeping guest's sight cone flickers open across the
    landing; a dotted path shows where it will walk once the cone closes. The night clock along the
    top reads two in the morning, and the guest cards on the right are shaded by dread."""
    ink = "#2a211b"
    p.paper("#efe4c9", grain=0.28, fibre=1.1)
    # catalogue plate border: double rule with corner rosettes
    p.rect(22, 22, W - 44, H - 44, fill="none", stroke=ink, stroke_width=2.4)
    p.rect(32, 32, W - 64, H - 64, fill="none", stroke=ink, stroke_width=0.8)
    for cx, cy in [(27, 27), (W - 27, 27), (27, H - 27), (W - 27, H - 27)]:
        p.poly(p.star_pts(cx, cy, 11, 4, n=4, rot=45), fill=ink)

    # --- the night clock along the top
    x0, x1, yc = 120, 860, 70
    p.line(x0, yc, x1, yc, stroke=ink, stroke_width=1.6)
    hours = ["23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00"]
    for i, h in enumerate(hours):
        x = x0 + (x1 - x0) * i / 6
        p.line(x, yc - 8, x, yc + 8, stroke=ink, stroke_width=1.6)
        p.text(x - 22, yc - 14, h, size=15, family="serif", fill=ink)
        for k in range(1, 4):
            if i < 6:
                xx = x + (x1 - x0) / 6 * k / 4
                p.line(xx, yc - 3, xx, yc + 3, stroke=ink, stroke_width=0.8)
    now = x0 + (x1 - x0) * 3.15 / 6
    p.rect(x0, yc - 3, now - x0, 6, fill=NIGHT)
    p.poly([(now, yc + 6), (now - 8, yc + 20), (now + 8, yc + 20)], fill=AMBER, stroke=ink, stroke_width=1)

    # --- the house in section
    L, R = 110, 880
    roof_y, top, mid, gnd, cel_b = 108, 250, 430, 600, 700
    wall = 16
    # roof with shingles, hatched in lithograph lines
    roof = [(L - 30, top), ((L + R) / 2, roof_y), (R + 30, top)]
    p.poly(roof, fill="#c9a98a", stroke=ink, stroke_width=2)
    cl = p.clip(f'<polygon points="{" ".join(f"{f(a)},{f(b)}" for a, b in roof)}"/>')
    p.open("g", clip_path=cl)
    for j, y in enumerate(range(roof_y + 6, top, 14)):
        p.line(L - 40, y, R + 40, y, stroke=ink, stroke_width=0.8)
        off = 0 if j % 2 else 13
        for x in range(L - 40 + off, R + 40, 26):
            p.line(x, y, x, y + 14, stroke=ink, stroke_width=0.6)
    p.close()
    # attic gable window with warm glow
    gx, gy = (L + R) / 2, 200
    p.circle(gx, gy, 22, fill=p.radial([(0, AMBER, 0.9), (1, "#f5d79a", 0.6)]), stroke=ink, stroke_width=2)
    p.line(gx - 22, gy, gx + 22, gy, stroke=ink, stroke_width=1.4)
    p.line(gx, gy - 22, gx, gy + 22, stroke=ink, stroke_width=1.4)

    # earth around the cellar, stippled
    p.rect(L - 70, gnd + 12, R - L + 140, cel_b + 26 - gnd - 12, fill="#cdb894")
    p.stipple(L - 70, gnd + 12, R - L + 140, cel_b + 26 - gnd - 12, n=1400, r=(0.6, 1.5), fill=CEDAR_D, opacity=0.55)
    p.line(40, gnd + 12, L - 30, gnd + 12, stroke=ink, stroke_width=2)
    p.line(R + 30, gnd + 12, 900, gnd + 12, stroke=ink, stroke_width=2)

    # rooms: (x, y, w, h, wallpaper ground, sprig, name)
    nightA, nightB, nightC = "#b4c2d4", "#c3cbd8", "#a9b6c4"
    rooms = [
        (L + wall, top + wall, 330, mid - top - wall, nightA, "#8a7fa8", "BEDROOM"),
        (L + wall + 346, top + wall, R - L - 2 * wall - 346, mid - top - wall, nightB, "#9a7a6a", "LANDING & SHELF"),
        (L + wall, mid + wall, 250, gnd - mid - wall, nightC, "#7d8a5a", "PARLOUR"),
        (L + wall + 266, mid + wall, 200, gnd - mid - wall, nightB, "#8a7fa8", "HALL"),
        (L + wall + 482, mid + wall, R - L - 2 * wall - 482, gnd - mid - wall, nightA, "#9a7a6a", "KITCHEN"),
        (L + wall + 60, gnd + wall + 12, R - L - 2 * wall - 120, cel_b - gnd - wall - 12, "#9aa3ae", "#6d6a66", "CELLAR"),
    ]
    for (x, y, w, h, gr, sp, name) in rooms:
        p.rect(x, y, w, h, fill=_wallpaper(p, gr, sp))
        # moonlight wash from upper left: fine diagonal litho hatch in the far corner
        p.hatch(x, y, w, h, angle=60, spacing=7, stroke=NIGHT, stroke_width=0.5, opacity=0.35,
                clip=p.clip(f'<polygon points="{f(x + w * .55)},{f(y)} {f(x + w)},{f(y)} {f(x + w)},{f(y + h)} '
                            f'{f(x + w * .2)},{f(y + h)}"/>'))
        p.rect(x, y, w, h, fill="none", stroke=ink, stroke_width=1.6)
        p.text(x + 10, y + 22, name, size=13, family="serif", fill=ink, letter_spacing=2)
        # floorboards
        for bx in range(int(x), int(x + w), 24):
            p.line(bx, y + h - 8, bx, y + h, stroke=ink, stroke_width=0.5)
        p.line(x, y + h - 8, x + w, y + h - 8, stroke=ink, stroke_width=0.8)

    # the cut edge: wall and floor thickness drawn as hatched section with wallpaper band showing
    def cut(x, y, w, h):
        p.rect(x, y, w, h, fill="#d9c3a2", stroke=ink, stroke_width=1.6)
        p.hatch(x, y, w, h, angle=45, spacing=4, stroke=ink, stroke_width=0.7,
                clip=p.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"/>'))
    cut(L, top, wall, gnd - top + 12)
    cut(R - wall, top, wall, gnd - top + 12)
    cut(L, top, R - L, wall)
    cut(L, mid, R - L, wall)
    cut(L, gnd, R - L, 12)
    cut(L + wall + 330, top + wall, 16, mid - top - wall)
    cut(L + wall + 250, mid + wall, 16, gnd - mid - wall)
    cut(L + wall + 466, mid + wall, 16, gnd - mid - wall)
    cut(L + wall + 44, gnd + 12, 16, cel_b - gnd - 12)
    cut(R - wall - 60, gnd + 12, 16, cel_b - gnd - 12)
    cut(L + wall + 44, cel_b, R - L - 2 * wall - 88, 12)
    # wallpaper band visible inside the cut edge (a strip of pattern at each wall face)
    for x in (L + wall, R - wall - 5):
        p.rect(x, top + wall, 5, mid - top - wall, fill=_wallpaper(p, "#e8c9c0", RUST, 8))
        p.rect(x, mid + wall, 5, gnd - mid - wall, fill=_wallpaper(p, "#d6ddc4", MOSS, 8))

    # stairs from the hall up to the landing
    sx, sy = L + wall + 270, gnd - 8
    steps = 9
    stair_pts = []
    for i in range(steps):
        x = sx + i * 20
        y = sy - (i + 1) * ((gnd - 8 - (mid)) / steps)
        stair_pts.append((x, y))
        p.rect(x, y, 20, sy - y, fill="#b08a66", stroke=ink, stroke_width=1)
        p.line(x, y + 3, x + 20, y + 3, stroke=ink, stroke_width=0.5)
    # opening in the landing floor
    p.rect(sx + 120, mid - 2, 70, wall + 4, fill=nightB)

    # furniture in flat litho tints
    # bed with sleeping guest
    bx, by = L + wall + 30, mid - 70
    p.rect(bx, by, 210, 50, fill="#d8c7e0", stroke=ink, stroke_width=1.4)
    p.rect(bx, by - 40, 14, 92, fill=CEDAR, stroke=ink, stroke_width=1.2)
    p.rect(bx + 196, by - 18, 14, 70, fill=CEDAR, stroke=ink, stroke_width=1.2)
    p.path(p.smooth_d([(bx + 40, by + 4), (bx + 90, by - 22), (bx + 150, by - 14), (bx + 196, by + 2)]) +
           f" L{f(bx + 196)},{f(by + 10)} L{f(bx + 14)},{f(by + 10)}Z", fill=SKY, stroke=ink, stroke_width=1.4)
    p.hatch(bx + 20, by - 30, 176, 40, angle=-20, spacing=5, stroke=ink, stroke_width=0.5, opacity=0.5,
            clip=p.clip(p.body[-1].replace("<path ", "<path ").split(" fill=")[0] + "/>"))
    p.ellipse(bx + 32, by - 6, 18, 10, fill=BONE, stroke=ink, stroke_width=1.2)  # pillow
    p.circle(bx + 40, by - 18, 14, fill="#e8d2b8", stroke=ink, stroke_width=1.4)  # sleeping head
    p.path(f"M{f(bx + 42)},{f(by - 20)} q4,3 8,0", fill="none", stroke=ink, stroke_width=1.2)
    for k in range(3):
        p.text(bx + 58 + k * 12, by - 38 - k * 10, "z", size=12 + k * 3, family="serif", fill=NIGHT, font_style="italic")
    # the guest's sight cone: 70 degrees, opening (a flicker of a light sleeper)
    ex, ey = bx + 50, by - 20
    a0, a1 = math.radians(-35 - 8), math.radians(35 - 8)
    reach = 330
    cone = [(ex, ey)] + [(ex + reach * math.cos(a0 + (a1 - a0) * t / 20), ey + reach * math.sin(a0 + (a1 - a0) * t / 20))
                         for t in range(21)]
    ccl = p.clip(f'<rect x="{L + wall}" y="{top + wall}" width="{R - L - 2 * wall}" height="{mid - top - wall}"/>')
    p.open("g", clip_path=ccl)
    p.poly(cone, fill=p.radial([(0, "#fff3c4", 0.75), (1, "#fff3c4", 0.15)], cx=0.0, cy=0.5, r=1.0))
    p.poly(cone, fill="none", stroke=ink, stroke_width=1.2, stroke_dasharray="6 4")
    p.close()
    p.text(ex + 210, ey + 92, "70°", size=14, family="serif", fill=ink, font_style="italic")

    # landing shelf with stuffed ones
    shx, shy = L + wall + 400, top + 120
    p.rect(shx, shy, 280, 10, fill=CEDAR, stroke=ink, stroke_width=1.2)
    for i, (c, gw) in enumerate([(RUST, None), (MOSS, None), (SKY, AMBER), (CREAM, None)]):
        _toy(p, shx + 34 + i * 66, shy - 16, s=1.0, body=c, glow=gw)

    # parlour: table with the cloth board, lamp
    tx, ty = L + wall + 40, gnd - 70
    p.rect(tx, ty, 160, 12, fill=CEDAR, stroke=ink, stroke_width=1.2)
    p.rect(tx + 10, ty + 12, 8, 50, fill=CEDAR_D)
    p.rect(tx + 142, ty + 12, 8, 50, fill=CEDAR_D)
    p.ellipse(tx + 80, ty - 2, 50, 6, fill="#d9b9a0", stroke=ink, stroke_width=1)
    for k in range(4):
        p.circle(tx + 58 + k * 14, ty - 5, 3, fill=[RUST, MOSS, SKY, BONE][k], stroke=ink, stroke_width=0.6)
    _toy(p, tx + 120, ty - 6, s=0.8, body=MOSS, glow=AMBER)

    # kitchen: stove and a rabbit on the counter
    kx = L + wall + 500
    p.rect(kx, gnd - 90, 120, 82, fill="#c0b7a8", stroke=ink, stroke_width=1.4)
    p.hatch(kx, gnd - 90, 120, 82, angle=90, spacing=6, stroke=ink, stroke_width=0.4, opacity=0.5,
            clip=p.clip(f'<rect x="{kx}" y="{gnd - 90}" width="120" height="82"/>'))
    p.rect(kx + 140, gnd - 60, 60, 52, fill=CEDAR, stroke=ink, stroke_width=1.2)
    _toy(p, kx + 170, gnd - 64, s=0.8, body=BONE)

    # cellar: jars and crates, one warm glow behind them
    for i in range(7):
        x = L + wall + 110 + i * 70
        yb = cel_b
        if i % 3 == 0:
            p.rect(x, yb - 50, 50, 50, fill="#b9976f", stroke=ink, stroke_width=1.2)
            p.line(x, yb - 50, x + 50, yb, stroke=ink, stroke_width=0.8)
            p.line(x + 50, yb - 50, x, yb, stroke=ink, stroke_width=0.8)
        else:
            h = 26 + (i * 7) % 18
            p.rect(x + 12, yb - h, 24, h, rx=5, fill="#c7cfb8", stroke=ink, stroke_width=1.1)
            p.rect(x + 12, yb - h - 5, 24, 6, fill=CEDAR, stroke=ink, stroke_width=0.8)
    p.circle(L + wall + 610, cel_b - 30, 40, fill=p.radial([(0, AMBER, 0.65), (1, AMBER, 0)]))

    # the selected toy: your cat on the third step, frozen, ringed
    cx, cy = stair_pts[3][0] + 10, stair_pts[3][1]
    p.circle(cx, cy - 18, 34, fill="none", stroke=AMBER, stroke_width=3)
    p.circle(cx, cy - 18, 40, fill="none", stroke=ink, stroke_width=0.8, stroke_dasharray="3 3")
    _toy(p, cx, cy - 12, s=1.05, body="#d58b4b", glow=AMBER)
    # planned path: up the stairs to the shelf
    path_pts = [(cx, cy - 4)] + [(x + 10, y - 4) for x, y in stair_pts[4:]] + [(sx + 200, mid - 8), (shx + 250, shy - 6)]
    p.path(p.smooth_d(path_pts), fill="none", stroke=ink, stroke_width=2, stroke_dasharray="2 6", stroke_linecap="round")
    tx2, ty2 = path_pts[-1]
    p.poly([(tx2 + 12, ty2), (tx2 - 4, ty2 - 8), (tx2 - 4, ty2 + 8)], fill=ink)
    p.rect(cx + 38, cy - 8, 118, 24, fill="#efe4c9", stroke=ink, stroke_width=1)
    p.text(cx + 44, cy + 10, "HOLD STILL", size=14, family="serif", fill=ink, letter_spacing=2, font_weight="bold")

    # --- guest cards, right
    gx0 = 920
    p.text(gx0, 120, "GUESTS", size=18, family="serif", fill=ink, letter_spacing=4)
    p.line(gx0, 130, W - 60, 130, stroke=ink, stroke_width=1)
    for i, (name, dread) in enumerate([("Guest I", 0.72), ("Guest II", 0.38), ("Guest III", 0.16)]):
        y = 150 + i * 170
        p.rect(gx0, y, 220, 150, fill="#f6eedb", stroke=ink, stroke_width=1.6)
        p.rect(gx0 + 6, y + 6, 208, 138, fill="none", stroke=ink, stroke_width=0.6)
        # oval portrait silhouette
        p.ellipse(gx0 + 52, y + 70, 32, 42, fill="#e9dcc2", stroke=ink, stroke_width=1.2)
        p.circle(gx0 + 52, y + 58, 13, fill=NIGHT)
        p.path(f"M{gx0 + 30},{y + 104} q22,-34 44,0Z", fill=NIGHT)
        p.text(gx0 + 98, y + 40, name, size=17, family="serif", fill=ink, font_style="italic")
        p.text(gx0 + 98, y + 64, "dread", size=12, family="serif", fill=ink, letter_spacing=2)
        p.rect(gx0 + 98, y + 72, 100, 54, fill="none", stroke=ink, stroke_width=1)
        p.hatch(gx0 + 98, y + 72, 100 * dread, 54, angle=45, spacing=max(2.5, 9 - dread * 9),
                stroke=RED, stroke_width=1.1, clip=p.clip(f'<rect x="{gx0 + 98}" y="{y + 72}" width="{f(100 * dread)}" height="54"/>'))
        if i == 0:
            p.text(gx0 + 98, y + 142, "eyes opening", size=12, family="serif", fill=RED, font_style="italic")
    # plate caption
    p.line(120, H - 66, 860, H - 66, stroke=ink, stroke_width=0.8)
    p.text(130, H - 42, "Plate III.  THE CABIN IN SECTION, BY NIGHT.  Move while no eye is open.", size=17,
           family="serif", fill=ink, font_style="italic")


# ------------------------------------------------------------------------------------------------
# 2D: Labyrinth from above, as a woven tapestry
# ------------------------------------------------------------------------------------------------
@register(G, "labyrinth")
def labyrinth(p: Pic):
    """Labyrinth from above (2D): the maze seen from directly overhead and woven like a tapestry,
    every corridor and wall a run of warp and weft. The pack of stuffed toys, small amber cats with
    button eyes, herds two blue-clad guests inward; the guests flee from any toy they see moving, toward the
    open corridor. The floor reddens thread by thread toward the centre, where the warmth is."""
    p.paper(CEDAR_D, grain=0)
    cell = 16
    cols, rows = W // cell, (H - 40) // cell
    oy = 20
    cxm, cym = cols / 2, rows / 2
    rings = [22.0, 16.5, 11.0, 5.6]          # wall radii in cells (outer, inner, centre)
    doors = {0: [math.radians(100)], 1: [math.radians(300), math.radians(130)], 2: [math.radians(20)],
             3: [math.radians(210)]}
    radials = {0: [10, 60, 150, 205, 260, 330], 1: [40, 95, 180, 250], 2: [70, 160, 290]}
    loopdoor = (0, math.radians(232))        # a loop door between outer walls 0 and 1
    wall_w = 1.1
    rng = p.rng
    fills: dict[str, list[str]] = {}
    lights: dict[str, list[str]] = {}

    def put(c, i, j):
        x, y = i * cell, oy + j * cell
        fills.setdefault(c, []).append(f"M{x},{y}h{cell}v{cell}h-{cell}z")
        lc = mix(c, BONE, 0.22)
        if (i + j) % 2:     # warp face: vertical threads showing
            lights.setdefault(lc, []).append(f"M{x + 4},{y + 2}v{cell - 4}M{x + 11},{y + 2}v{cell - 4}")
        else:               # weft face: horizontal threads showing
            lights.setdefault(lc, []).append(f"M{x + 2},{y + 4}h{cell - 4}M{x + 2},{y + 11}h{cell - 4}")

    toys = [(cxm + 13.5 * math.cos(a), cym + 13.5 * math.sin(a) * 0.98) for a in
            (math.radians(205), math.radians(240), math.radians(270))]
    toys.append((cxm + 19 * math.cos(math.radians(255)), cym + 19 * math.sin(math.radians(255))))
    guests = [(cxm + 13.5 * math.cos(math.radians(318)), cym + 13.5 * math.sin(math.radians(318))),
              (cxm + 8.2 * math.cos(math.radians(250)), cym + 8.2 * math.sin(math.radians(250)))]

    TOY = ["a...a", "aaaaa", "aeaea", "aacaa", ".aaa.", "a.a.a"]
    GUEST = [".kk.", "kffk", "kssk", "ssss", "kssk", ".ss.", ".kk."]
    pal = {"a": AMBER, "e": CEDAR_D, "c": RED, "k": "#2c3446", "f": "#e9cfb4", "s": SKY}

    def motif(i, j):
        for pat, centres in ((TOY, toys), (GUEST, guests)):
            for (tx, ty) in centres:
                ox_, oy_ = int(tx) - len(pat[0]) // 2, int(ty) - len(pat) // 2
                if 0 <= j - oy_ < len(pat) and 0 <= i - ox_ < len(pat[0]):
                    ch = pat[j - oy_][i - ox_]
                    if ch in pal:
                        return pal[ch]
        return None

    for j in range(rows):
        for i in range(cols):
            dx, dy = i + 0.5 - cxm, (j + 0.5 - cym)
            r = math.hypot(dx, dy)
            a = math.atan2(dy, dx) % (2 * math.pi)
            # outside the labyrinth: the tapestry's border field
            if r > rings[0] + wall_w:
                band = (i // 3 + j // 3) % 2
                edge = min(i, j, cols - 1 - i, rows - 1 - j)
                if edge < 2:
                    c = RUST if (i + j) % 4 < 2 else CEDAR_D
                elif edge < 3:
                    c = AMBER if (i + j) % 2 else CEDAR
                else:
                    c = mix(MOSS, CEDAR, 0.35) if band else mix(MOSS, CEDAR, 0.55)
                    if (i * 7 + j * 3) % 11 == 0:
                        c = mix(CREAM, MOSS, 0.4)
                put(c, i, j)
                continue
            m = motif(i, j)
            if m:
                put(m, i, j)
                continue
            is_wall = False
            for k, rr in enumerate(rings):
                if abs(r - rr) < wall_w * 0.62:
                    gap = any(abs(((a - d + math.pi) % (2 * math.pi)) - math.pi) * rr < 1.6 for d in doors[k])
                    if not gap:
                        is_wall = True
            for k, angs in radials.items():
                if rings[k + 1] < r < rings[k]:
                    for ad in angs:
                        if abs(((a - math.radians(ad) + math.pi) % (2 * math.pi)) - math.pi) * r < 0.62:
                            is_wall = True
            if is_wall:
                # wallpaper seen edge-on: cream with a small woven flower every few cells
                c = CREAM if (i + j) % 5 else mix(RUST, CREAM, 0.35)
                put(c, i, j)
                continue
            if r < rings[3]:
                t = 1.0
            else:
                t = 1 - (r - rings[3]) / (rings[0] - rings[3])
            t = max(0, min(1, t + rng.uniform(-0.12, 0.12)))
            # thread by thread: some picks already turned red, more toward the centre
            if rng.random() < t ** 2.2:
                c = warmth(0.55 + 0.45 * t)
            else:
                c = mix(mix(CEDAR, RUST, 0.25), warmth(0.5), t * 0.6)
            # carpet runner in the outer ring: darker weave
            if rings[1] < r < rings[0] and (i + j) % 3 == 0:
                c = mix(c, CEDAR_D, 0.3)
            put(c, i, j)
    for c, ds in fills.items():
        p.path("".join(ds), fill=c)
    for c, ds in lights.items():
        p.path("".join(ds), fill="none", stroke=c, stroke_width=1.6, stroke_linecap="round", opacity=0.55)
    # the shed between threads: fine dark lines on every row (weft beat)
    d = "".join(f"M0,{oy + j * cell}H{W}" for j in range(rows + 1))
    p.path(d, stroke=CEDAR_D, stroke_width=0.8, opacity=0.6)

    # movement shown as couched threads laid over the weave (as embroidered on after)
    def couched(pts, color, w=4):
        pp = [(x * cell, oy + y * cell) for x, y in pts]
        p.path(p.smooth_d(pp), fill="none", stroke=CEDAR_D, stroke_width=w + 3, stroke_linecap="round", opacity=0.6)
        p.path(p.smooth_d(pp), fill="none", stroke=color, stroke_width=w, stroke_linecap="round")
        dd = p.smooth_d(pp)
        p.path(dd, fill="none", stroke=CEDAR_D, stroke_width=w + 1, stroke_dasharray="1.5 9", stroke_linecap="butt")
        (x1, y1), (x2, y2) = pp[-2], pp[-1]
        L = math.hypot(x2 - x1, y2 - y1)
        ux, uy = (x2 - x1) / L, (y2 - y1) / L
        p.poly([(x2 + ux * 16, y2 + uy * 16), (x2 - uy * 10, y2 + ux * 10), (x2 + uy * 10, y2 - ux * 10)],
               fill=color, stroke=CEDAR_D, stroke_width=1.5)

    # guest 1 flees clockwise along the ring toward the open corridor
    arc = [(cxm + 13.5 * math.cos(math.radians(a)), cym + 13.5 * math.sin(math.radians(a))) for a in (325, 345, 5, 25)]
    couched(arc, BONE)
    # guest 2 flees inward through the door
    g2 = guests[1]
    couched([(g2[0] + 0.6, g2[1] + 2.4), (cxm + 7.8 * math.cos(math.radians(212)), cym + 7.8 * math.sin(math.radians(212))),
             (cxm + 5.6 * math.cos(math.radians(210)) * 0.8, cym + 5.6 * math.sin(math.radians(210)) * 0.8)], BONE)
    # the pack's push
    t0 = toys[2]
    couched([(t0[0] + 1.5, t0[1] + 0.3), (t0[0] + 5.5, t0[1] + 1.1)], AMBER, 3)
    # sight ring of 5 m around guest 1, sewn as a running stitch
    g1 = guests[0]
    p.circle(g1[0] * cell, oy + g1[1] * cell, 5.2 * cell, fill="none", stroke=BONE, stroke_width=2.5,
             stroke_dasharray="8 7", opacity=0.9)
    # loop door marked with a woven knot
    k, la = loopdoor
    lx, ly = cxm + 19.2 * math.cos(la), cym + 19.2 * math.sin(la)
    p.circle(lx * cell, oy + ly * cell, 15, fill=CEDAR_D, stroke=AMBER, stroke_width=3)
    p.path(f"M{f(lx * cell - 7)},{f(oy + ly * cell)} a7,7 0 1,1 7,7", fill="none", stroke=AMBER, stroke_width=2.5)
    # fringe along the bottom (the tapestry's warp ends)
    for i in range(0, W, 7):
        ln = 12 + rng.random() * 8
        p.line(i + 3, H - 20 + 2, i + 3 + rng.uniform(-2, 2), H - 20 + 2 + ln, stroke=mix(DUST, CEDAR, 0.3), stroke_width=2.2,
               stroke_linecap="round")
    # ring counter woven into the border
    for n, lab in enumerate(["OUTER", "INNER", "CENTRE"]):
        p.text(36 + n * 92, 52, lab, size=15, family="serif", fill=BONE if n == 1 else mix(BONE, CEDAR, 0.5),
               font_weight="bold", letter_spacing=1)
    # warmth bar
    for k2 in range(30):
        p.rect(W - 360 + k2 * 10, 38, 9, 16, fill=warmth(k2 / 29), opacity=1 if k2 < 17 else 0.3)
    p.text(W - 450, 52, "WARMTH", size=15, family="serif", fill=BONE, font_weight="bold", letter_spacing=1)


# ------------------------------------------------------------------------------------------------
# 1D: Stitchwork, as a cross-stitch pattern chart
# ------------------------------------------------------------------------------------------------
SYMS = {"m": ("×", MOSS, "moss felt"), "r": ("●", RUST, "rust felt"), "c": ("/", CREAM, "cream lining"),
        "s": ("▲", SKY, "sky check"), "o": ("◆", CEDAR, "torn edge")}


@register(G, "stitchwork")
def stitchwork(p: Pic):
    """Stitchwork (1D): the mend drawn as a cross-stitch pattern chart. A torn seam runs across two
    felt panels on the counted grid; the stitches already made are bold crosses of bone thread over
    the gap, and the numbered entry points still to come wait to the right. The needle cursor hovers
    at point 6, and the margin counts five stitches done of eight with the tension in the band."""
    ink = "#3a3530"
    p.paper("#fbf8f0", grain=0.12, fibre=1.6)
    cs = 15
    gx, gy = 70, 70
    cols, rows = 48, 44
    gw, gh = cols * cs, rows * cs
    rng = p.rng
    # motif: two felt panels with a ragged gap (the seam) between them, small flowers on the panels
    gap_mid = [rows / 2 + 2.2 * math.sin(i / 6.0) + rng.uniform(-0.4, 0.4) for i in range(cols)]
    grid = {}
    for j in range(rows):
        for i in range(cols):
            g = gap_mid[i]
            if abs(j + 0.5 - g) < 1.3 + (0.9 if 14 < i < 34 else 0):
                k = "o" if abs(j + 0.5 - g) > 0.9 + (0.9 if 14 < i < 34 else 0) else None
            elif j < g:
                k = "m"
                if (i % 9 in (3, 4, 5) and j % 8 in (3, 4, 5)) and not (i % 9 == 4 and j % 8 == 4):
                    k = "c" if (i % 9 + j % 8) % 2 == 0 else "m"
                if i % 9 == 4 and j % 8 == 4:
                    k = "r"
            else:
                k = "r"
                if (i + 2 * j) % 11 == 0 or (2 * i + j) % 13 == 0:
                    k = "s"
            if k:
                grid[(i, j)] = k
    # coloured cells with symbols, grouped per symbol for size
    for key, (sym, col, _) in SYMS.items():
        cells = [(i, j) for (i, j), k in grid.items() if k == key]
        p.path("".join(f"M{gx + i * cs},{gy + j * cs}h{cs}v{cs}h-{cs}z" for i, j in cells), fill=col, opacity=0.55)
        d = []
        for i, j in cells:
            x, y = gx + i * cs + cs / 2, gy + j * cs + cs / 2
            if sym == "×":
                d.append(f"M{f(x - 4)},{f(y - 4)}l8,8M{f(x + 4)},{f(y - 4)}l-8,8")
            elif sym == "/":
                d.append(f"M{f(x - 4)},{f(y + 4)}l8,-8")
            elif sym == "●":
                d.append(f"M{f(x - 2.6)},{f(y)}a2.6,2.6 0 1,0 5.2,0a2.6,2.6 0 1,0 -5.2,0")
            elif sym == "▲":
                d.append(f"M{f(x)},{f(y - 4)}l4,7h-8z")
            elif sym == "◆":
                d.append(f"M{f(x)},{f(y - 4)}l4,4l-4,4l-4,-4z")
        filled = sym in "●▲◆"
        p.path("".join(d), fill=ink if filled else "none", stroke=ink if not filled else "none", stroke_width=1.2)
    # the Aida grid: fine every cell, bold every ten, centre arrows
    p.grid(gx, gy, gw, gh, cs, stroke=ink, stroke_width=0.35, opacity=0.6)
    p.grid(gx, gy, 10 * cs * 4, gh, 10 * cs, stroke=ink, stroke_width=1.3)
    p.path(f"M{gx},{gy}h{gw}M{gx},{gy + gh}h{gw}M{gx + gw},{gy}v{gh}M{gx},{gy + 40 * cs}h{gw}", stroke=ink, stroke_width=1.3)
    p.rect(gx, gy, gw, gh, fill="none", stroke=ink, stroke_width=1.8)
    for k in range(0, cols + 1, 10):
        p.text(gx + k * cs - 7, gy - 10, str(k), size=12, family="monospace", fill=ink)
    for k in range(0, rows + 1, 10):
        p.text(gx - 30, gy + k * cs + 4, str(k), size=12, family="monospace", fill=ink)
    p.poly([(gx + gw / 2, gy - 22 + 18), (gx + gw / 2 - 7, gy - 34 + 18 - 6), (gx + gw / 2 + 7, gy - 34 + 18 - 6)], fill=ink)
    p.poly([(gx - 4, gy + gh / 2), (gx - 16, gy + gh / 2 - 7), (gx - 16, gy + gh / 2 + 7)], fill=ink)

    # the seam: entry points across the gap, 8 stitches, crossing in a ladder
    pts = []
    for n in range(8):
        i = 8 + n * 4.4
        g = gap_mid[int(i)]
        top = (gx + i * cs, gy + (g - 2.2) * cs)
        bot = (gx + (i + 1.8) * cs, gy + (g + 2.2) * cs)
        pts.append((top, bot))
    done = 5
    for n, (a, b) in enumerate(pts):
        if n < done:
            # finished stitch: bold backstitch line in bone thread with dark outline
            p.line(a[0], a[1], b[0], b[1], stroke=ink, stroke_width=7, stroke_linecap="round")
            p.line(a[0], a[1], b[0], b[1], stroke=BONE, stroke_width=4, stroke_linecap="round")
            if n + 1 < len(pts):
                c = pts[n + 1][0]
                p.line(b[0], b[1], c[0], c[1], stroke=ink, stroke_width=1.4, stroke_dasharray="3 4", opacity=0.6)
        for (x, y), lab, io in ((a, f"{n + 1}", "in"), (b, f"{n + 1}'", "out")):
            fill = BONE if n >= done else ink
            p.circle(x, y, 9, fill=fill, stroke=ink, stroke_width=1.6)
            p.text(x - (4 if len(lab) == 1 else 7), y + 4, lab, size=11, family="monospace",
                   fill=ink if n >= done else BONE, font_weight="bold")
    # next stitch: 6, pulsing rings, needle cursor and thread
    (ax, ay), (bx2, by2) = pts[done]
    for rr, op in ((16, 0.9), (24, 0.5), (32, 0.25)):
        p.circle(ax, ay, rr, fill="none", stroke=RED, stroke_width=2.2, opacity=op)
    p.line(ax, ay, bx2, by2, stroke=RED, stroke_width=2, stroke_dasharray="6 5")
    # needle
    nx, ny = ax + 6, ay - 6
    ang = math.radians(-50)
    L = 150
    ex2, ey2 = nx + L * math.cos(ang), ny + L * math.sin(ang)
    p.line(nx, ny, ex2, ey2, stroke="#8e9198", stroke_width=6, stroke_linecap="round")
    p.line(nx, ny, ex2, ey2, stroke="#e5e7ea", stroke_width=2.2, stroke_linecap="round")
    p.ellipse(ex2 - 9 * math.cos(ang), ey2 - 9 * math.sin(ang), 4.5, 1.6, fill="#fbf8f0",
              transform=f"rotate({f(math.degrees(ang))} {f(ex2 - 9 * math.cos(ang))} {f(ey2 - 9 * math.sin(ang))})")
    p.path(p.smooth_d([(ex2 - 9 * math.cos(ang), ey2 - 9 * math.sin(ang)), (ex2 + 40, ey2 - 30), (ex2 + 90, ey2 + 10),
                       (pts[done - 1][1][0] + 30, pts[done - 1][1][1] + 60)]),
           fill="none", stroke=BONE, stroke_width=3.5)
    p.path(p.smooth_d([(ex2 - 9 * math.cos(ang), ey2 - 9 * math.sin(ang)), (ex2 + 40, ey2 - 30), (ex2 + 90, ey2 + 10),
                       (pts[done - 1][1][0] + 30, pts[done - 1][1][1] + 60)]),
           fill="none", stroke=ink, stroke_width=0.8, stroke_dasharray="2 3")

    # --- key and margin counts
    kx = gx + gw + 40
    p.text(kx, 86, "KEY", size=20, family="monospace", fill=ink, font_weight="bold", letter_spacing=4)
    p.line(kx, 96, W - 40, 96, stroke=ink, stroke_width=1.4)
    counts = {k: sum(1 for v in grid.values() if v == k) for k in SYMS}
    for n, (key, (sym, col, name)) in enumerate(SYMS.items()):
        y = 116 + n * 40
        p.rect(kx, y, 28, 28, fill=col, opacity=0.55, stroke=ink, stroke_width=1)
        p.text(kx + 7, y + 21, sym, size=17, family="monospace", fill=ink)
        p.text(kx + 40, y + 19, name, size=15, family="monospace", fill=ink)
        p.text(W - 90, y + 19, f"{counts[key]:>4}", size=14, family="monospace", fill=ink)
    y = 116 + 5 * 40
    p.line(kx, y + 14, kx + 28, y + 14, stroke=ink, stroke_width=7, stroke_linecap="round")
    p.line(kx, y + 14, kx + 28, y + 14, stroke=BONE, stroke_width=4, stroke_linecap="round")
    p.text(kx + 40, y + 19, "seam (bone thread)", size=15, family="monospace", fill=ink)
    p.line(kx, y + 40, W - 40, y + 40, stroke=ink, stroke_width=0.8)
    # stitch count and tension gauge in the margin
    p.text(kx, y + 80, "STITCH", size=14, family="monospace", fill=ink, letter_spacing=3)
    p.text(kx, y + 130, f"{done} / {len(pts)}", size=46, family="monospace", fill=ink, font_weight="bold")
    for n in range(len(pts)):
        p.rect(kx + n * 28, y + 148, 22, 22, fill=BONE if n >= done else ink, stroke=ink, stroke_width=1.2)
        if n < done:
            p.path(f"M{kx + n * 28 + 5},{y + 153}l12,12M{kx + n * 28 + 17},{y + 153}l-12,12", stroke=BONE, stroke_width=2)
    p.text(kx, y + 214, "TENSION", size=14, family="monospace", fill=ink, letter_spacing=3)
    tw = W - 40 - kx
    p.rect(kx, y + 226, tw, 30, fill="none", stroke=ink, stroke_width=1.4)
    p.rect(kx + tw * 0.42, y + 226, tw * 0.24, 30, fill=MOSS, opacity=0.7)
    p.hatch(kx + tw * 0.66, y + 226, tw * 0.34, 30, angle=45, spacing=5, stroke=RED, stroke_width=1,
            clip=p.clip(f'<rect x="{f(kx + tw * .66)}" y="{y + 226}" width="{f(tw * .34)}" height="30"/>'))
    nxx = kx + tw * 0.55
    p.poly([(nxx, y + 222), (nxx - 8, y + 210), (nxx + 8, y + 210)], fill=ink)
    p.line(nxx, y + 222, nxx, y + 260, stroke=ink, stroke_width=2.5)
    p.text(kx, y + 280, "loose", size=12, family="monospace", fill=ink)
    p.text(kx + tw * 0.46, y + 280, "pull", size=12, family="monospace", fill=ink)
    p.text(kx + tw - 34, y + 280, "tear", size=12, family="monospace", fill=RED)
    p.text(kx, y + 320, "Ladder stitch", size=15, family="monospace", fill=ink)
    p.text(kx, y + 342, "seam 2 of 6: left arm", size=15, family="monospace", fill=ink)
    p.text(kx, y + 364, "in, out, pull.", size=15, family="monospace", fill=ink)


# ------------------------------------------------------------------------------------------------
# 1D: The Hand-Sewn Book, as blackwork embroidery on linen
# ------------------------------------------------------------------------------------------------
def _glyph_segments(rng, n=4, kind=None):
    """A counted-thread glyph on an n x n lattice, mirror-symmetric, as unit segments."""
    if kind == "needle":
        return [((2, 0), (2, 1)), ((2, 1), (2, 2)), ((2, 2), (2, 3)), ((2, 3), (2, 4)), ((1, 0), (2, 0)), ((2, 0), (3, 0)),
                ((1, 0), (2, 1)), ((3, 0), (2, 1))]
    if kind == "knot":
        return [((1, 1), (2, 0)), ((2, 0), (3, 1)), ((3, 1), (2, 2)), ((2, 2), (1, 1)), ((2, 2), (2, 4)), ((0, 4), (4, 4)),
                ((1, 3), (3, 3))]
    if kind == "thread":
        return [((0, 2), (1, 1)), ((1, 1), (2, 2)), ((2, 2), (3, 1)), ((3, 1), (4, 2)), ((0, 3), (1, 2)), ((1, 2), (2, 3)),
                ((2, 3), (3, 2)), ((3, 2), (4, 3))]
    segs = set()
    half = n // 2
    for _ in range(rng.randint(5, 8)):
        x, y = rng.randint(0, half), rng.randint(0, n)
        dx, dy = rng.choice([(1, 0), (0, 1), (1, 1), (1, -1), (-1, 1)])
        x2, y2 = x + dx, y + dy
        if 0 <= x2 <= half and 0 <= y2 <= n:
            segs.add(((x, y), (x2, y2)))
    out = []
    for (a, b) in segs:
        out.append((a, b))
        out.append(((n - a[0], a[1]), (n - b[0], b[1])))
    return out


def _draw_glyph(p, x, y, u, segs, color="#151210", w=2.2):
    """Holbein (double running) stitches: each lattice segment one stitch, with tiny gaps at holes."""
    d = []
    for (ax, ay), (bx, by) in segs:
        x1, y1, x2, y2 = x + ax * u, y + ay * u, x + bx * u, y + by * u
        L = math.hypot(x2 - x1, y2 - y1)
        g = 1.2 / L
        d.append(f"M{f(x1 + (x2 - x1) * g)},{f(y1 + (y2 - y1) * g)}L{f(x2 - (x2 - x1) * g)},{f(y2 - (y2 - y1) * g)}")
    p.path("".join(d), fill="none", stroke=color, stroke_width=w, stroke_linecap="round")


def _blackwork_band(p, x, y, length, u, vertical=False, color="#151210"):
    """A repeating counted-thread border: zigzag with crosses, stitched along a line."""
    d = []
    n = int(length / u)
    for k in range(n):
        a = k * u
        if vertical:
            pts = [(x, y + a), (x + u, y + a + u / 2) if k % 2 == 0 else (x, y + a)]
            d.append(f"M{f(x + (u if k % 2 else 0))},{f(y + a)}L{f(x + (0 if k % 2 else u))},{f(y + a + u)}")
            if k % 4 == 0:
                d.append(f"M{f(x - u)},{f(y + a + u / 2)}h{f(u / 2)}M{f(x + u * 1.5)},{f(y + a + u / 2)}h{f(u / 2)}")
        else:
            d.append(f"M{f(x + a)},{f(y + (u if k % 2 else 0))}L{f(x + a + u)},{f(y + (0 if k % 2 else u))}")
            if k % 4 == 0:
                d.append(f"M{f(x + a + u / 2)},{f(y - u)}v{f(u / 2)}M{f(x + a + u / 2)},{f(y + u * 1.5)}v{f(u / 2)}")
    p.path("".join(d), fill="none", stroke=color, stroke_width=1.8, stroke_linecap="round", stroke_dasharray=f"{f(u * 1.2)} 1.4")


@register(G, "hand-sewn-book")
def hand_sewn_book(p: Pic):
    """The Hand-Sewn Book (1D): an open book of linen pages, its glyphs worked in black silk as
    counted-thread blackwork. Scrambled glyph strips lie on the left page; on the right, a row of
    slots edged in red, black or white thread waits to be filled in the one legal order, and a
    strip is being carried to its slot. When the line pulls taut its translation appears below:
    "They weren't made. / They were summoned.\""""
    silk = "#151210"
    p.paper("#4a3a2c", grain=0.25, fibre=1.2)
    # the book: two linen pages
    bx0, by0, bx1, by1 = 70, 60, W - 70, H - 60
    p.rect(bx0 - 12, by0 + 10, bx1 - bx0 + 24, by1 - by0 + 6, rx=10, fill="#2b2119")
    for (x0, x1) in ((bx0, W / 2 - 4), (W / 2 + 4, bx1)):
        p.rect(x0, by0, x1 - x0, by1 - by0, fill="#d9ccb0")
        # linen weave: fine warp and weft
        cl = p.clip(f'<rect x="{f(x0)}" y="{by0}" width="{f(x1 - x0)}" height="{by1 - by0}"/>')
        p.hatch(x0, by0, x1 - x0, by1 - by0, angle=0, spacing=3.2, jitter=0.6, stroke="#b8a888", stroke_width=0.6,
                opacity=0.55, clip=cl)
        p.hatch(x0, by0, x1 - x0, by1 - by0, angle=90, spacing=3.2, jitter=0.6, stroke="#efe5cf", stroke_width=0.6,
                opacity=0.45, clip=cl)
        p.stipple(x0, by0, x1 - x0, by1 - by0, n=500, r=(0.6, 1.6), fill="#9c8a6a", opacity=0.5)  # slubs
    # gutter shadow and binding stitches
    p.rect(W / 2 - 30, by0, 60, by1 - by0, fill=p.gradient([(0, "#d9ccb0"), (0.5, "#8a7a5e"), (1, "#d9ccb0")], 0, 0, 1, 0),
           opacity=0.6)
    for y in range(by0 + 40, by1 - 20, 60):
        p.line(W / 2, y, W / 2, y + 26, stroke=RED, stroke_width=3, stroke_linecap="round")
    # blackwork borders on each page
    for (x0, x1) in ((bx0, W / 2 - 4), (W / 2 + 4, bx1)):
        _blackwork_band(p, x0 + 22, by0 + 24, x1 - x0 - 44, 8)
        _blackwork_band(p, x0 + 22, by1 - 34, x1 - x0 - 44, 8)
    rng = p.rng
    u = 11
    role = {"act": RED, "thing": silk, "who": BONE}
    # --- left page: scrambled strips, each a few glyphs, edged in its role colour
    strips = [("who", 2, None), ("act", 1, "needle"), ("thing", 2, "thread"), ("act", 2, None),
              ("thing", 1, "knot"), ("who", 1, None)]
    placed = [(120, 120, -4), (330, 140, 5), (140, 270, 3), (330, 300, -6), (150, 430, -2), (350, 450, 4)]
    for (rl, n, kind), (x, y, rot) in zip(strips, placed):
        w = n * (4 * u + 16) + 16
        h = 4 * u + 32
        p.open("g", transform=f"rotate({rot} {x + w / 2} {y + h / 2})")
        p.rect(x + 3, y + 4, w, h, fill="#000", opacity=0.18)
        p.rect(x, y, w, h, fill="#e6dbc1", stroke="#b8a888", stroke_width=1)
        p.rect(x + 5, y + 5, w - 10, h - 10, fill="none", stroke=role[rl], stroke_width=3.2,
               stroke_dasharray="7 3", **({"opacity": 1} if rl != "who" else {}))
        if rl == "who":
            p.rect(x + 5, y + 5, w - 10, h - 10, fill="none", stroke="#8a7a5e", stroke_width=0.6)
        for g in range(n):
            _draw_glyph(p, x + 16 + g * (4 * u + 16), y + 16, u, _glyph_segments(rng, kind=kind if g == 0 else None))
        p.close()
    p.text(130, 600, "loose strips", size=16, family="serif", fill="#5b4a36", font_style="italic")

    # --- right page: the row of slots with three thread colours
    sx0, sy0 = W / 2 + 50, 200
    slot_w, slot_h = 70, 80
    roles = ["who", "act", "thing", "act", "thing", "who"]
    filled = {0: None, 1: "needle", 2: "thread"}
    p.text(sx0, 170, "Spread I", size=22, family="serif", fill=silk, font_style="italic")
    for k, rl in enumerate(roles):
        x = sx0 + k * (slot_w + 12)
        p.rect(x, sy0, slot_w, slot_h, fill="#e3d7bb")
        p.rect(x, sy0, slot_w, slot_h, fill="none", stroke=role[rl], stroke_width=4, stroke_dasharray="9 3")
        if rl == "who":
            p.rect(x - 2, sy0 - 2, slot_w + 4, slot_h + 4, fill="none", stroke="#8a7a5e", stroke_width=0.6)
        if k in filled:
            _draw_glyph(p, x + 13, sy0 + 18, u, _glyph_segments(rng, kind=filled[k]))
    # the taut line through filled slots
    p.line(sx0 - 10, sy0 + slot_h + 18, sx0 + 3 * (slot_w + 12) - 12, sy0 + slot_h + 18, stroke=silk, stroke_width=2)
    p.line(sx0 + 3 * (slot_w + 12) - 12, sy0 + slot_h + 18, sx0 + 6 * (slot_w + 12), sy0 + slot_h + 18, stroke=silk,
           stroke_width=1.2, stroke_dasharray="4 6")
    # the strip being carried: lifted, with a shadow, toward slot 4
    cx, cy = sx0 + 3 * (slot_w + 12) + 10, sy0 + 190
    p.rect(cx + 10, cy + 14, 4 * u + 32, 4 * u + 32, fill="#000", opacity=0.25)
    p.rect(cx, cy, 4 * u + 32, 4 * u + 32, fill="#e6dbc1", stroke=RED, stroke_width=3.2, stroke_dasharray="7 3")
    _draw_glyph(p, cx + 16, cy + 16, u, _glyph_segments(rng))
    p.path(p.smooth_d([(cx + 38, cy - 6), (cx + 30, cy - 50), (sx0 + 3 * (slot_w + 12) + 35, sy0 + slot_h + 10)]),
           fill="none", stroke=silk, stroke_width=1.6, stroke_dasharray="3 5")
    tx, ty = sx0 + 3 * (slot_w + 12) + 35, sy0 + slot_h + 6
    p.poly([(tx, ty), (tx - 7, ty + 12), (tx + 7, ty + 12)], fill=silk)
    # needle as the cursor, drawn in silk outline
    p.line(cx + 70, cy + 60, cx + 160, cy + 140, stroke=silk, stroke_width=4, stroke_linecap="round")
    p.ellipse(cx + 150, cy + 131, 4, 1.4, fill="#e6dbc1", transform=f"rotate(42 {cx + 150} {cy + 131})")
    # glossary, top right: seen glyphs in a small counted grid
    gx0, gy0 = W - 290, 110
    p.text(gx0, gy0 - 8, "glossary", size=15, family="serif", fill="#5b4a36", font_style="italic")
    for k in range(8):
        x = gx0 + (k % 4) * 52
        y = gy0 + (k // 4) * 0 - 1000 if False else gy0 + 6
        x = gx0 + k * 26
        if k < 7:
            _draw_glyph(p, x, y, 5, _glyph_segments(rng, kind=["needle", "thread", "knot", None, None, None, None][k]), w=1.4)
    # rules, stitched as small marks
    rules = [("needle before thread", 330), ("knot ends a line", 362), ("doubled means many", 394)]
    for text, y in rules:
        p.text(sx0, y + 40, "×", size=18, family="serif", fill=RED)
        p.text(sx0 + 22, y + 40, text, size=16, family="serif", fill=silk, font_style="italic")
    # translation, in the journal hand, appearing as the spread pulls taut
    p.line(sx0, 520, bx1 - 50, 520, stroke="#8a7a5e", stroke_width=0.8)
    p.text(sx0, 562, "They weren't made.", size=30, family="serif", fill=silk, font_style="italic")
    p.text(sx0 + 40, 604, "They were summoned.", size=30, family="serif", fill=silk, font_style="italic", opacity=0.45)
    # a ring of warm glows at the page edge (the toys closing in, third reading)
    for k in range(14):
        a = 2 * math.pi * k / 14 + rng.uniform(-0.1, 0.1)
        x = W / 2 + 610 * math.cos(a)
        y = H / 2 + 410 * math.sin(a)
        p.circle(x, y, 26, fill=p.radial([(0, AMBER, 0.75), (1, AMBER, 0)]))


# ------------------------------------------------------------------------------------------------
# 1D: Parlour, as felt appliqué
# ------------------------------------------------------------------------------------------------
def _felt(p, shape_svg, color, edge=None, thread=BONE, spacing=10, depth=7, pts=None):
    """A cut-felt shape: soft shadow, flat fill with fibre noise, optional blanket stitch."""
    p.raw(shape_svg.replace("/>", f' fill="#000" opacity="0.22" transform="translate(4 5)"/>'))
    p.raw(shape_svg.replace("/>", f' fill="{color}"/>'))
    p.raw(shape_svg.replace("/>", f' fill="{color}" filter="url(#{p._feltf})" opacity="0.6"/>'))
    if pts:
        p.blanket_edge(pts, spacing=spacing, depth=depth, stroke=thread, stroke_width=1.6)
        p.path(p.wobble_d(pts, 0.4, 20, closed=True), fill="none", stroke=thread, stroke_width=1.4)


def _button(p, x, y, r, color, thread=BONE):
    p.circle(x + 3, y + 4, r, fill="#000", opacity=0.25)
    p.circle(x, y, r, fill=color, stroke=mix(color, "#000000", 0.35), stroke_width=2)
    p.circle(x, y, r * 0.72, fill="none", stroke=mix(color, "#000000", 0.2), stroke_width=1.2)
    h = r * 0.28
    for dx, dy in ((-h, -h), (h, -h), (-h, h), (h, h)):
        p.circle(x + dx, y + dy, r * 0.11, fill=mix(color, "#000000", 0.5))
    p.path(f"M{f(x - h)},{f(y - h)}L{f(x + h)},{f(y + h)}M{f(x + h)},{f(y - h)}L{f(x - h)},{f(y + h)}",
           stroke=thread, stroke_width=r * 0.12)


def _symbol(p, kind, x, y, s, col):
    """Small felt symbols stitched on a board space."""
    if kind == "door":
        p.path(f"M{f(x - 6*s)},{f(y + 9*s)}V{f(y - 4*s)}a{f(6*s)},{f(6*s)} 0 0,1 {f(12*s)},0V{f(y + 9*s)}Z", fill=col)
    elif kind == "lamp":
        p.poly([(x - 7 * s, y), (x + 7 * s, y), (x + 4 * s, y - 8 * s), (x - 4 * s, y - 8 * s)], fill=col)
        p.rect(x - 1.5 * s, y, 3 * s, 8 * s, fill=col)
    elif kind == "two":
        p.circle(x - 4.5 * s, y, 4 * s, fill=col)
        p.circle(x + 4.5 * s, y, 4 * s, fill=col)
    elif kind == "bird":
        p.path(f"M{f(x - 9*s)},{f(y)}q{f(4.5*s)},{f(-7*s)} {f(9*s)},0q{f(4.5*s)},{f(-7*s)} {f(9*s)},0", fill="none",
               stroke=col, stroke_width=2.6 * s, stroke_linecap="round")
    elif kind == "tree":
        p.poly([(x, y - 10 * s), (x + 8 * s, y + 5 * s), (x - 8 * s, y + 5 * s)], fill=col)
        p.rect(x - 1.5 * s, y + 5 * s, 3 * s, 4 * s, fill=col)
    elif kind == "hearth":
        p.path(f"M{f(x)},{f(y - 10*s)}q{f(9*s)},{f(9*s)} 0,{f(19*s)}q{f(-9*s)},{f(-10*s)} 0,{f(-19*s)}", fill=col)
    elif kind == "knot":
        p.path(f"M{f(x - 7*s)},{f(y + 5*s)}c{f(4*s)},{f(-16*s)} {f(14*s)},{f(-4*s)} {f(7*s)},{f(-2*s)}"
               f"c{f(-6*s)},{f(2*s)} {f(-6*s)},{f(-10*s)} {f(7*s)},{f(-6*s)}", fill="none", stroke=col,
               stroke_width=2.4 * s, stroke_linecap="round")
    else:
        p.circle(x, y, 2.6 * s, fill=col)


@register(G, "parlour")
def parlour(p: Pic):
    """Parlour (1D): the guests' counting game seen from above, all cut felt and buttons. Thirty
    felt spaces spiral from the Door to the Hearth; the pegs are buttons. A small stuffed paw drags
    one guest's button onto the Lamp, the symbol that is that guest's own, while footprints at the
    doorway grow larger as someone comes back. Two of three tamper buttons are still unspent."""
    fid = p.uid("felt")
    p._feltf = fid
    p.defn(f'<filter id="{fid}"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="3" seed="{p.seed % 97}"/>'
           f'<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 0.55"/>'
           f'<feComposite in2="SourceGraphic" operator="in"/></filter>')
    rng = p.rng
    # table cloth: moss felt with fibre noise and a big blanket-stitched rug edge
    p.paper(mix(MOSS, CEDAR, 0.25), grain=0.4, fibre=1.8)
    # the board: a cream felt disc, blanket-stitched
    bcx, bcy, br = 610, 410, 330
    disc = [(bcx + br * math.cos(2 * math.pi * k / 90) * 1.0, bcy + br * math.sin(2 * math.pi * k / 90) * 0.98)
            for k in range(90)]
    poly = " ".join(f"{f(x)},{f(y)}" for x, y in disc)
    _felt(p, f'<polygon points="{poly}"/>', CREAM, pts=disc, thread=RUST, spacing=13, depth=10)
    inner = [(bcx + (br - 26) * math.cos(2 * math.pi * k / 90), bcy + (br - 26) * math.sin(2 * math.pi * k / 90))
             for k in range(90)]
    p.stitch(inner + [inner[0]], length=9, gap=7, stroke=MOSS, stroke_width=2)
    # the spiral of 30 spaces, Door (outside) to Hearth (centre)
    kinds = ["door", "dot", "lamp", "two", "dot", "bird", "knot", "tree", "dot", "two", "lamp", "dot", "bird", "knot",
             "dot", "tree", "two", "dot", "lamp", "knot", "bird", "dot", "tree", "two", "knot", "dot", "lamp", "bird",
             "dot", "hearth"]
    colors = [RUST, SKY, MOSS, "#c99a6a", "#b5869c"]
    spaces = []
    for n in range(30):
        t = n / 29
        a = math.radians(200) + t * 2.6 * 2 * math.pi
        rr = 270 - t * 230
        x, y = bcx + rr * math.cos(a), bcy + rr * math.sin(a)
        spaces.append((x, y))
    # stitched track joining them
    p.path(p.smooth_d(spaces), fill="none", stroke=CEDAR, stroke_width=2.4, stroke_dasharray="8 6", stroke_linecap="round")
    for n, (x, y) in enumerate(spaces):
        r = 30 - n * 0.35 if n < 29 else 44
        col = colors[n % len(colors)] if kinds[n] not in ("hearth", "door") else (RED if kinds[n] == "hearth" else CEDAR)
        pts = [(x + r * math.cos(2 * math.pi * k / 18) * rng.uniform(0.96, 1.04),
                y + r * math.sin(2 * math.pi * k / 18) * rng.uniform(0.96, 1.04)) for k in range(18)]
        _felt(p, f'<path d="{p.smooth_d(pts, closed=True)}"/>', col)
        p.circle(x, y, r - 6, fill="none", stroke=BONE, stroke_width=1.3, stroke_dasharray="4 4")
        _symbol(p, kinds[n], x, y, r / 24, BONE if kinds[n] != "knot" else CEDAR_D)
    p.text(spaces[0][0] - 30, spaces[0][1] + 56, "Door", size=17, family="serif", fill=CEDAR_D, font_style="italic")
    # pegs as buttons on their spaces
    pegs = [(spaces[7], SKY), (spaces[12], "#c9b27a"), (spaces[16], RUST)]
    for (x, y), c in pegs:
        _button(p, x + 6, y - 6, 15, c)
    # the tamper: a guest's button lifted from space 9, moved to the lamp at 10 ... actually to 18
    src, dst = spaces[9], spaces[18]
    p.path(p.smooth_d([src, ((src[0] + dst[0]) / 2 + 40, (src[1] + dst[1]) / 2 - 60), dst]), fill="none", stroke=BONE,
           stroke_width=3, stroke_dasharray="2 7", stroke_linecap="round")
    p.circle(src[0], src[1], 17, fill="none", stroke=BONE, stroke_width=2, stroke_dasharray="3 4")
    mx, my = dst[0] - 14, dst[1] - 30
    _button(p, mx, my, 18, "#e2c56c")
    # the paw: a felt stuffed-animal paw with stitched toes, reaching from the upper right
    paw = [(mx - 10, my - 10), (mx + 30, my - 44), (mx + 120, my - 120), (mx + 190, my - 190), (mx + 270, my - 120),
           (mx + 170, my - 40), (mx + 70, my + 36), (mx + 10, my + 34)]
    pd = p.smooth_d(paw, closed=True)
    _felt(p, f'<path d="{pd}"/>', "#d58b4b", pts=None)
    p.path(pd, fill="none", stroke=BONE, stroke_width=1.6, stroke_dasharray="5 4")
    for k in range(4):
        a = math.radians(150 + k * 32)
        p.ellipse(mx + 34 + 30 * math.cos(a), my + 4 + 30 * math.sin(a), 8, 10, fill="#9c5a2e")
    p.ellipse(mx + 42, my + 10, 17, 13, fill="#9c5a2e")
    p.path(p.smooth_d([(mx + 150, my - 175), (mx + 205, my - 120), (mx + 245, my - 140)]), fill="none", stroke=BONE,
           stroke_width=2.4, stroke_dasharray="6 4")
    # scoresheet, left: a felt card with stitched word lines
    sx, sy, sw, sh = 34, 70, 190, 470
    card = [(sx, sy), (sx + sw, sy), (sx + sw, sy + sh), (sx, sy + sh)]
    _felt(p, f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}"/>', BONE, pts=card, thread=CEDAR, spacing=12, depth=7)
    p.text(sx + 22, sy + 42, "Scores", size=21, family="serif", fill=CEDAR_D, font_style="italic")
    for k in range(13):
        y = sy + 72 + k * 29
        p.stitch([(sx + 22, y), (sx + 22 + rng.uniform(70, 140), y)], length=6, gap=4, stroke=[RUST, SKY, MOSS][k % 3],
                 stroke_width=2.4)
        p.text(sx + sw - 34, y + 5, str(rng.randint(2, 18)), size=14, family="serif", fill=CEDAR_D)
    # doorway strip, right: footsteps growing louder in three steps
    dx0 = W - 170
    door = [(dx0, 60), (W - 34, 60), (W - 34, 740), (dx0, 740)]
    _felt(p, f'<rect x="{dx0}" y="60" width="{W - 34 - dx0}" height="680"/>', NIGHT, pts=door, thread=BONE, spacing=12, depth=7)
    p.text(dx0 + 22, 100, "doorway", size=18, family="serif", fill=BONE, font_style="italic")
    for k in range(3):
        s = 0.7 + k * 0.45
        y = 220 + k * 170
        for side in (-1, 1):
            fx, fy = dx0 + 68 + side * 16 * s, y + side * 20 * s
            p.ellipse(fx, fy, 9 * s, 16 * s, fill=BONE, opacity=0.45 + k * 0.25)
            for t in range(3):
                p.circle(fx - 6 * s + t * 6 * s, fy - 21 * s, 3 * s, fill=BONE, opacity=0.45 + k * 0.25)
    # tamper buttons, bottom left
    p.text(40, 600, "tampers", size=18, family="serif", fill=BONE, font_style="italic")
    for k in range(3):
        _button(p, 60 + k * 50, 640, 18, RED if k == 0 else "#d9c39a")
    p.path("M48,628L72,652M72,628L48,652", stroke=CEDAR_D, stroke_width=3)
    # notes strip, bottom: felt tape with three small stitched pictures
    nx0 = 250
    strip = [(nx0, H - 70), (dx0 - 30, H - 70), (dx0 - 30, H - 22), (nx0, H - 22)]
    p.path(f"M{nx0},{H - 70}H{dx0 - 30}V{H - 22}H{nx0}Z", fill=BONE, opacity=0.0)
    _felt(p, f'<rect x="{nx0}" y="{H - 70}" width="{dx0 - 30 - nx0}" height="48"/>', DUST, pts=strip, thread=RUST,
          spacing=11, depth=6)
    p.text(nx0 + 18, H - 39, "notes:", size=16, family="serif", fill=CEDAR_D, font_style="italic")
    for k, kind in enumerate(["lamp", "door", "bird", "tree"]):
        _symbol(p, kind, nx0 + 120 + k * 110, H - 46, 1.0, CEDAR)
        p.stitch([(nx0 + 138 + k * 110, H - 46), (nx0 + 200 + k * 110, H - 46)], length=4, gap=4, stroke=CEDAR, stroke_width=1.6)


# ------------------------------------------------------------------------------------------------
# 1D: Stuffing, as a dressmaker's tissue pattern
# ------------------------------------------------------------------------------------------------
def _offset(pts, d):
    """Shrink a roughly convex polygon toward its centroid by d pixels."""
    cx = sum(x for x, _ in pts) / len(pts)
    cy = sum(y for _, y in pts) / len(pts)
    out = []
    for x, y in pts:
        L = math.hypot(x - cx, y - cy) or 1
        out.append((x - (x - cx) / L * d, y - (y - cy) / L * d))
    return out


@register(G, "stuffing")
def stuffing(p: Pic):
    """Stuffing (1D): your toy body laid open flat as a dressmaker's tissue pattern, six pieces
    for head, chest, two arms and two legs, each with its hollows for memories. Embroidered memory
    patches fill some hollows; the empty ones glow warm, because the hunger lives there. A patch
    named "Lila's hum" is being dragged from the tray at the bottom into the chest, and the margin
    shows the hunger rate this packing will give."""
    ink = "#3b2e2a"
    p.paper("#8d6e55", grain=0.3, fibre=1.0)       # the cutting table
    # a measuring grid on the cutting mat
    p.grid(0, 0, W, H, 40, stroke="#f2e7d3", stroke_width=0.5, opacity=0.25)
    rng = p.rng
    tissue = "#efe2c4"

    pieces = {
        "HEAD": (380, 150, [(-110, -10), (-80, -90), (-40, -100), (0, -78), (40, -100), (80, -90), (110, -10), (80, 70), (0, 92),
                            (-80, 70)], 3),
        "CHEST": (390, 420, [(-120, -120), (120, -120), (140, 0), (115, 140), (0, 160), (-115, 140), (-140, 0)], 3),
        "LEFT ARM": (130, 380, [(-40, -150), (40, -150), (55, 0), (50, 130), (0, 160), (-50, 130), (-55, 0)], 2),
        "RIGHT ARM": (650, 380, [(-40, -150), (40, -150), (55, 0), (50, 130), (0, 160), (-50, 130), (-55, 0)], 2),
        "LEFT LEG": (830, 230, [(-55, -130), (55, -130), (65, 40), (90, 110), (40, 140), (-60, 140), (-60, 40)], 2),
        "RIGHT LEG": (1030, 230, [(-55, -130), (55, -130), (60, 40), (60, 140), (-40, 140), (-90, 110), (-65, 40)], 2),
    }
    # tissue sheets: slightly rotated, translucent, overlapping, with crinkle
    crin = p.uid("crinkle")
    p.defn(f'<filter id="{crin}"><feTurbulence type="turbulence" baseFrequency="0.012 0.04" numOctaves="3" '
           f'seed="{p.seed % 89}"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.35 -0.05"/>'
           f'<feComposite in2="SourceGraphic" operator="in"/></filter>')
    slot_pos = []
    warm_slots = []
    tokens = [("Marcus's strap", MOSS), ("Jamie's postcard", SKY), ("My hands", RUST)]
    filled_plan = {("HEAD", 0), ("HEAD", 2), ("CHEST", 0), ("LEFT ARM", 0), ("RIGHT ARM", 1), ("LEFT LEG", 0),
                   ("RIGHT LEG", 1), ("CHEST", 2)}
    for name, (cx, cy, shape, nslots) in pieces.items():
        rot = rng.uniform(-4, 4)
        pts = [(cx + x, cy + y) for x, y in shape]
        smooth = p.smooth_d(pts, closed=True)
        p.open("g", transform=f"rotate({f(rot)} {cx} {cy})")
        # loose tissue sheet behind, wider than the piece
        sheet = [(x * 1.18 + cx + rng.uniform(-8, 8), y * 1.15 + cy + rng.uniform(-8, 8)) for x, y in shape]
        p.path(p.wobble_d(sheet, 2, 30, closed=True), fill=tissue, opacity=0.62)
        p.path(p.wobble_d(sheet, 2, 30, closed=True), fill=tissue, filter=f"url(#{crin})", opacity=0.6)
        # cut line: bold dashed; stitching line inside: fine dashes
        p.path(smooth, fill="none", stroke=ink, stroke_width=2.6, stroke_dasharray="14 6")
        p.path(p.smooth_d(_offset(pts, 16), closed=True), fill="none", stroke=ink, stroke_width=1, stroke_dasharray="3 4")
        # notches: little triangles on the cut line
        for k in range(0, len(pts), 2):
            (x1, y1), (x2, y2) = pts[k], pts[(k + 1) % len(pts)]
            mxp, myp = (x1 + x2) / 2, (y1 + y2) / 2
            L = math.hypot(x2 - x1, y2 - y1) or 1
            nxv, nyv = (y2 - y1) / L, -(x2 - x1) / L
            ux, uy = (x2 - x1) / L, (y2 - y1) / L
            p.poly([(mxp - ux * 7, myp - uy * 7), (mxp + ux * 7, myp + uy * 7), (mxp + nxv * 12, myp + nyv * 12)], fill=ink)
        # grain arrow
        h = max(y for _, y in shape) - min(y for _, y in shape)
        gx = cx + (0 if nslots == 3 else -28 if "ARM" in name or "LEG" in name else 0)
        if nslots == 3:
            gx = cx - 80 if name == "CHEST" else cx - 70
        gy0, gy1 = cy - h * 0.32, cy + h * 0.32
        p.line(gx, gy0, gx, gy1, stroke=ink, stroke_width=1.6)
        p.poly([(gx, gy0 - 10), (gx - 6, gy0 + 4), (gx + 6, gy0 + 4)], fill=ink)
        p.poly([(gx, gy1 + 10), (gx - 6, gy1 - 4), (gx + 6, gy1 - 4)], fill=ink)
        # label
        lx = cx - 30 if nslots == 3 else cx - 22
        p.text(lx - 20, cy - h * 0.28 + 4, name, size=14, family="sans-serif", fill=ink, font_weight="bold", letter_spacing=1)
        p.text(lx - 20, cy - h * 0.28 + 22, "CUT 2  ·  SEAM " + str(list(pieces).index(name) + 1), size=11,
               family="sans-serif", fill=ink, letter_spacing=1)
        # slots: hollows in a column (or row for head/chest)
        for s in range(nslots):
            if nslots == 3:
                sxp, syp = cx - 40 + s * 52 + 10, cy + (20 if name == "HEAD" else 40)
            else:
                sxp, syp = cx + 8, cy + 0 + s * 66
            slot_pos.append((name, s, sxp, syp))
            filled = (name, s) in filled_plan
            if not filled:
                p.circle(sxp, syp, 34, fill=p.radial([(0, RED, 0.85), (0.5, AMBER, 0.55), (1, AMBER, 0)]))
                warm_slots.append((sxp, syp))
            p.circle(sxp, syp, 22, fill="none", stroke=ink, stroke_width=1.4, stroke_dasharray="2 3")
            p.path(f"M{sxp - 5},{syp}h10M{sxp},{syp - 5}v10", stroke=ink, stroke_width=1)
            if filled:
                _patch(p, sxp, syp, 20, rng.choice([MOSS, SKY, RUST, "#b5869c"]), rng)
        p.close()

    # side margin: the pattern envelope with tonight's game and the hunger rate
    mx0 = 1150 - 260
    py0 = 430
    p.rect(mx0, py0, 260, 220, fill=tissue, opacity=0.85)
    p.rect(mx0, py0, 260, 220, fill="none", stroke=ink, stroke_width=1.6)
    p.text(mx0 + 16, py0 + 32, "TONIGHT: SOUND", size=16, family="sans-serif", fill=ink, font_weight="bold", letter_spacing=1)
    p.text(mx0 + 16, py0 + 54, "needs a warm slot in HEAD", size=13, family="sans-serif", fill=ink)
    p.line(mx0 + 16, py0 + 70, mx0 + 244, py0 + 70, stroke=ink, stroke_width=0.8, stroke_dasharray="4 3")
    nw = len(warm_slots)
    p.text(mx0 + 16, py0 + 100, "HUNGER RATE", size=13, family="sans-serif", fill=ink, letter_spacing=2)
    p.text(mx0 + 16, py0 + 150, f"+{15 * nw}%", size=46, family="sans-serif", fill=RED, font_weight="bold")
    p.text(mx0 + 150, py0 + 150, f"{nw} warm", size=15, family="sans-serif", fill=ink)
    for k in range(nw):
        p.circle(mx0 + 26 + k * 26, py0 + 186, 9, fill=p.radial([(0, RED, 1), (1, AMBER, 0.8)]))

    # tray at the bottom: memory patches lying loose
    ty0 = 640
    p.rect(30, ty0, 840, 140, rx=12, fill=CEDAR_D, opacity=0.55)
    p.rect(30, ty0, 840, 140, rx=12, fill="none", stroke=tissue, stroke_width=1.4, stroke_dasharray="8 5")
    p.text(48, ty0 + 26, "TRAY: unpacked memories unravel when you close", size=13, family="sans-serif", fill=tissue,
           letter_spacing=1)
    for k, (lab, col) in enumerate(tokens):
        x = 120 + k * 200
        _patch(p, x, ty0 + 82, 30, col, rng)
        p.text(x + 40, ty0 + 88, lab, size=15, family="serif", fill=BONE, font_style="italic")
    # the dragged patch, mid-air above the chest
    chest = next((sx, sy) for nm, s, sx, sy in slot_pos if nm == "CHEST" and s == 1)
    dx, dy = 690, 600
    p.path(p.smooth_d([(dx + 10, dy + 60), (600, 640), (chest[0] + 60, chest[1] + 120), (chest[0] + 6, chest[1] + 30)]),
           fill="none", stroke=ink, stroke_width=2.2, stroke_dasharray="3 6", stroke_linecap="round")
    hx, hy = chest[0] + 6, chest[1] + 28
    p.poly([(hx, hy), (hx - 9, hy + 14), (hx + 9, hy + 14)], fill=ink)
    p.circle(dx + 6, dy + 10, 36, fill="#000", opacity=0.2)
    _patch(p, dx, dy, 34, "#b5869c", rng)
    p.text(dx + 44, dy + 4, "Lila's hum", size=19, family="serif", fill=BONE, font_style="italic", font_weight="bold")
    # pattern title in the corner
    p.text(W - 400, 768, "PATTERN No. 6  ·  ONE BODY, SIX SEAMS", size=14, family="sans-serif", fill=tissue,
           letter_spacing=2)


def _patch(p, x, y, r, col, rng):
    """An embroidered memory patch: a round of fabric, satin-stitch rim, a tiny stitched picture."""
    p.circle(x, y, r, fill=col, stroke=BONE, stroke_width=r * 0.14)
    d = []
    for k in range(28):
        a = 2 * math.pi * k / 28
        d.append(f"M{f(x + (r - 1) * math.cos(a))},{f(y + (r - 1) * math.sin(a))}"
                 f"L{f(x + (r - r * 0.28) * math.cos(a + 0.08))},{f(y + (r - r * 0.28) * math.sin(a + 0.08))}")
    p.path("".join(d), stroke=mix(col, "#000000", 0.25), stroke_width=1)
    kind = rng.choice(["note", "star", "leaf"])
    s = r / 20
    if kind == "note":
        p.circle(x - 3 * s, y + 5 * s, 3.4 * s, fill=BONE)
        p.path(f"M{f(x + 0.4*s)},{f(y + 5*s)}V{f(y - 8*s)}l{f(6*s)},{f(3*s)}", fill="none", stroke=BONE, stroke_width=1.8 * s)
    elif kind == "star":
        p.poly(Pic.star_pts(x, y, 9 * s, 4 * s), fill=BONE)
    else:
        p.path(f"M{f(x - 8*s)},{f(y + 6*s)}Q{f(x - 6*s)},{f(y - 8*s)} {f(x + 8*s)},{f(y - 6*s)}Q{f(x + 6*s)},{f(y + 8*s)} "
               f"{f(x - 8*s)},{f(y + 6*s)}Z", fill=BONE)

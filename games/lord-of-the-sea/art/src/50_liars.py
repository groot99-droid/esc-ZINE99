"""Liar's Tide in sailor's tattoo flash: six die faces, the tide die, the loaded die, the cup, three table skins."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK)
BLACK, PAPER, BONE = kit.BLACK, kit.FLASHPAPER, kit.BONE
BLUE = "#2F4E8A"
ROW = "Liar's Tide: 6 faces, tide die, loaded die, cup, 3 table skins"
FL = dict(stroke=BLACK, stroke_width=6, stroke_linejoin="round", stroke_linecap="round")


def flashpaper(a, rope=True, tone=PAPER):
    a.paper(tone, grain=0.3)
    a.stipple(0, 0, a.w, a.h, n=int(a.w * a.h / 2600), r=(0.5, 1.5), fill=TEA, opacity=0.35)
    if rope:
        m = 16
        a.rect(m, m, a.w - 2 * m, a.h - 2 * m, rx=10, fill="none", stroke=BLACK, stroke_width=13)
        a.rect(m, m, a.w - 2 * m, a.h - 2 * m, rx=10, fill="none", stroke=GOLD, stroke_width=8)
        a.rect(m, m, a.w - 2 * m, a.h - 2 * m, rx=10, fill="none", stroke=BLACK, stroke_width=8, stroke_dasharray="2.5 9")


def sparkle(a, x, y, s=10, col=BLACK):
    a.path(f"M{f(x)},{f(y - s)} Q{f(x)},{f(y)} {f(x + s)},{f(y)} Q{f(x)},{f(y)} {f(x)},{f(y + s)} Q{f(x)},{f(y)} {f(x - s)},{f(y)} "
           f"Q{f(x)},{f(y)} {f(x)},{f(y - s)}Z", fill=col)


def banner(a, cx, cy, w, text, fill=RED, size=30, h=50):
    curve = 14
    a.path(f"M{f(cx - w / 2 - 40)},{f(cy - h / 2 + 14)} l34,0 l0,{h} l-34,0 l15,{-h / 2}z", fill="#6e1f1f", **FL)
    a.path(f"M{f(cx + w / 2 + 40)},{f(cy - h / 2 + 14)} l-34,0 l0,{h} l34,0 l-15,{-h / 2}z", fill="#6e1f1f", **FL)
    a.path(f"M{f(cx - w / 2)},{f(cy - h / 2)} Q{f(cx)},{f(cy - h / 2 - curve)} {f(cx + w / 2)},{f(cy - h / 2)} "
           f"L{f(cx + w / 2)},{f(cy + h / 2)} Q{f(cx)},{f(cy + h / 2 - curve)} {f(cx - w / 2)},{f(cy + h / 2)}Z", fill=fill, **FL)
    a.text(cx, cy + size * 0.24, text, size=size, family="serif", fill=BONE, text_anchor="middle", font_weight="bold",
           letter_spacing=3)


def swallow(a, x, y, s, flip=1, ang=0):
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)}) scale({f(s * flip)},{f(s)})")
    a.path("M-70,-10 C-40,-50 10,-40 30,-6 C60,-30 90,-30 112,-60 C104,-20 80,0 44,10 C30,30 0,40 -30,34 "
           "L-80,60 L-60,26 L-96,30 L-64,8Z", fill=BLUE, **FL)
    a.path("M-30,34 C0,40 30,30 44,10 C20,18 -10,22 -40,18Z", fill=RED, stroke=BLACK, stroke_width=4)
    a.path("M40,-2 C60,-12 80,-20 96,-40", fill="none", stroke=FOAM, stroke_width=3)
    a.circle(-46, -12, 5, fill=BLACK)
    a.poly([(-70, -10), (-92, -2), (-66, 0)], fill=GOLD, stroke=BLACK, stroke_width=3)
    a.close()


def eye(a, x, y, s, look, lit):
    a.open("g", transform=f"translate({f(x)},{f(y)}) scale({f(s)})")
    a.path("M-50,0 Q0,-40 50,0 Q0,40 -50,0Z", fill=BONE, **FL)
    a.circle(look * 16, 0, 17, fill=GREEN if not lit else RED, stroke=BLACK, stroke_width=5)
    a.circle(look * 16, 0, 7, fill=BLACK)
    a.circle(look * 16 + 5, -5, 3, fill="#fff")
    if lit:
        for an in range(-150, -20, 26):
            x1, y1 = 58 * math.cos(math.radians(an)), 44 * math.sin(math.radians(an))
            a.line(x1, y1, x1 * 1.3, y1 * 1.35, stroke=BLACK, stroke_width=5, stroke_linecap="round")
    a.close()


# ---- the six faces, drawn in a 120-unit box about the origin ---------------------------------------

def ic_gull(a):
    a.path("M-56,10 Q-34,-44 -6,-10 Q0,-18 6,-10 Q34,-44 56,10 Q30,-12 8,10 L0,26 L-8,10 Q-30,-12 -56,10Z", fill="#fff", **FL)
    a.path("M-56,10 Q-46,-12 -36,-22 L-30,-6Z M56,10 Q46,-12 36,-22 L30,-6Z", fill=BLACK)
    a.path("M-5,-8 L0,-22 L5,-8Z", fill=GOLD, stroke=BLACK, stroke_width=3, stroke_linejoin="round")
    a.path("M-40,40 q10,-9 20,0 t20,0 t20,0 t20,0", fill="none", stroke=BLUE, stroke_width=5, stroke_linecap="round")


def ic_shell(a):
    a.path("M-50,2 A50,50 0 0,1 50,2 L16,40 L-16,40Z", fill=GOLD, **FL)
    for an in (-60, -36, -12, 12, 36, 60):
        r = math.radians(an)
        a.line(0, 40, 48 * math.sin(r), 4 - 46 * math.cos(r), stroke=BLACK, stroke_width=3.5, stroke_linecap="round")
    a.path("M-16,40 h32 v10 h-32z", fill=RED, stroke=BLACK, stroke_width=4, stroke_linejoin="round")
    a.path("M-36,-14 A40,40 0 0,1 -8,-40", fill="none", stroke="#fff", stroke_width=4, stroke_linecap="round")


def ic_rope(a):
    for d in ("M-46,34 C-60,-30 -6,-52 4,-10 C12,22 44,24 46,-4 C48,-40 0,-44 -4,-10 C-8,24 30,50 52,36",):
        a.path(d, fill="none", stroke=BLACK, stroke_width=20, stroke_linecap="round")
        a.path(d, fill="none", stroke=GOLD, stroke_width=11, stroke_linecap="round")
        a.path(d, fill="none", stroke=BLACK, stroke_width=11, stroke_dasharray="2.5 8")
    a.circle(-46, 34, 8, fill=RED, stroke=BLACK, stroke_width=4)
    a.circle(52, 36, 8, fill=RED, stroke=BLACK, stroke_width=4)


def ic_bottle(a):
    a.path("M-9,-52 h18 v20 q22,12 22,34 v34 q0,10 -10,10 h-42 q-10,0 -10,-10 v-34 q0,-22 22,-34z", fill="#5f9e86", **FL)
    a.path("M-13,-48 h26", stroke=BLACK, stroke_width=7, stroke_linecap="round")
    a.rect(-22, 6, 44, 24, fill=BONE, stroke=BLACK, stroke_width=4)
    a.path(a.smooth_d(kit.spiral_pts(0, 18, 1, 8, 2)), fill="none", stroke=BLACK, stroke_width=2.5)
    a.path("M16,-14 q8,8 8,20", fill="none", stroke="#fff", stroke_width=4, stroke_linecap="round")
    a.path("M9,-40 q22,2 30,22 l12,-6 l-2,22 l-20,-8 l10,-6", fill=BONE, stroke=BLACK, stroke_width=3.5, stroke_linejoin="round")


def ic_lantern(a):
    for an in range(0, 360, 45):
        r = math.radians(an + 22)
        a.line(46 * math.cos(r), 2 + 46 * math.sin(r), 60 * math.cos(r), 2 + 60 * math.sin(r), stroke=BLACK, stroke_width=5,
               stroke_linecap="round")
    a.path("M-10,-34 a10,10 0 1,1 20,0", fill="none", stroke=BLACK, stroke_width=5)
    a.path("M-22,-30 h44 l-6,10 h-32z M-22,34 h44 l-6,-10 h-32z", fill=BLUE, stroke=BLACK, stroke_width=5, stroke_linejoin="round")
    a.rect(-20, -20, 40, 44, rx=5, fill=GOLD, **FL)
    a.path("M0,16 q-14,-12 0,-30 q14,18 0,30z", fill=RED, stroke=BLACK, stroke_width=3.5, stroke_linejoin="round")
    a.path("M-12,-14 v30", stroke="#fff", stroke_width=3.5, stroke_linecap="round")


def ic_wave(a):
    a.path("M-56,38 Q-52,-40 6,-36 Q46,-34 44,0 Q42,22 20,18 Q4,14 8,0 Q0,22 22,34 Q40,42 56,38Z", fill=GREEN, **FL)
    a.path("M-40,30 Q-36,-18 2,-22 M-24,32 Q-20,-2 6,-8", fill="none", stroke=FOAM, stroke_width=4, stroke_linecap="round")
    for (x, y, r) in ((28, -40, 7), (44, -28, 5), (52, -10, 4), (14, -46, 5), (56, 8, 3)):
        a.circle(x, y, r, fill="#fff", stroke=BLACK, stroke_width=3)


FACES = [("gull", "Gull", ic_gull, "a white gull on the wing over a line of water; Gulls are wild"),
         ("shell", "Shell", ic_shell, "a gold scallop shell with a red hinge"),
         ("rope", "Rope", ic_rope, "a figure-of-eight knot in gold rope with whipped red ends"),
         ("bottle", "Bottle", ic_bottle, "a green bottle with a paper tied at its neck and a spiral on its label"),
         ("lantern", "Lantern", ic_lantern, "a gold storm lantern with a red flame and rays"),
         ("wave", "Wave", ic_wave, "a green curling wave throwing white foam")]


def die2d(a, cx, cy, size, icon, fill=BONE, ang=0.0, pips=0):
    a.open("g", transform=f"translate({f(cx)},{f(cy)}) rotate({f(ang)})")
    d = size * 0.09
    a.rect(-size / 2 + d, -size / 2 + d, size, size, rx=size * 0.17, fill=BLACK)
    a.rect(-size / 2, -size / 2, size, size, rx=size * 0.17, fill=fill, **FL)
    a.path(f"M{f(-size / 2 + 14)},{f(-size / 2 + 30)} q0,-16 16,-16", fill="none", stroke="#fff", stroke_width=5, stroke_linecap="round")
    a.open("g", transform=f"scale({f(size / 150)})")
    icon(a)
    a.close()
    for k in range(pips):
        a.circle(-size / 2 + 16 + k * 9, size / 2 - 14, 2.8, fill=BLACK)
    a.close()


def make_face(i, key, name, icon, what):
    @asset(G, f"die-face-{i + 1}-{key}", group="pieces", title=f"Tide die face {i + 1}: {name}", w=260, h=300, row=ROW)
    def face(a: Art):
        flashpaper(a)
        for (x, y, s) in ((40, 44, 7), (222, 52, 9), (36, 200, 8), (226, 196, 6)):
            sparkle(a, x, y, s)
        die2d(a, 130, 124, 150, icon, ang=(i % 3 - 1) * 3, pips=i + 1)
        banner(a, 130, 248, 96 + len(name) * 9, name.upper(), size=22, h=40, fill=RED if i else BLUE)
    face.__doc__ = f"Face {i + 1} of a tide die in tattoo flash, bold outline and flat colour: {what}."
    return face


for _i, _f in enumerate(FACES):
    make_face(_i, *_f)


def cube(a, cx, cy, s, top, left, right, fill=BONE, shade=("#000", 0.12, 0.26)):
    """A die seen from above its corner: three faces, each with its own icon."""
    faces = [(f"matrix(0.866,0.5,-0.866,0.5,{f(cx)},{f(cy - s)})", top, 0),
             (f"matrix(0.866,0.5,0,1,{f(cx - 0.866 * s)},{f(cy - s / 2)})", left, shade[1]),
             (f"matrix(0.866,-0.5,0,1,{f(cx)},{f(cy)})", right, shade[2])]
    for tr, icon, sh in faces:
        a.open("g", transform=tr)
        a.rect(0, 0, s, s, rx=s * 0.12, fill=fill, **FL)
        if sh:
            a.rect(0, 0, s, s, rx=s * 0.12, fill=shade[0], opacity=sh)
        a.open("g", transform=f"translate({f(s / 2)},{f(s / 2)}) scale({f(s / 150)})")
        icon(a)
        a.close()
        a.close()


@asset(G, "tide-die", group="pieces", title="The tide die", w=260, h=300, row=ROW)
def tide_die(a: Art):
    """The shared tide die, rolled face up in the middle of the table: a sea-green die with the Wave uppermost, a
    spiral ring around it where it landed."""
    flashpaper(a)
    a.ellipse(130, 156, 100, 52, fill=GREEN, **FL)
    a.path(a.smooth_d([(130 + (20 + k * 2.6) * math.cos(k * 0.5) * 1.0, 156 + (10 + k * 1.3) * math.sin(k * 0.5)) for k in range(28)]),
           fill="none", stroke=FOAM, stroke_width=3, stroke_linecap="round")
    cube(a, 130, 124, 76, ic_wave, ic_gull, ic_lantern, fill="#bfe3d2")
    for (x, y, s) in ((40, 44, 7), (222, 52, 9)):
        sparkle(a, x, y, s)
    banner(a, 130, 248, 130, "TIDE DIE", size=22, h=40, fill=GREEN)


@asset(G, "loaded-die", group="pieces", title="The loaded die", w=260, h=300, row=ROW)
def loaded_die(a: Art):
    """A Company-issue die weighted to Lantern: ink-blue, the Company's leaf mark on one face, the Lantern always
    on top, and a plug of lead showing at the low corner."""
    flashpaper(a)
    a.ellipse(134, 196, 86, 20, fill=BLACK, opacity=0.35)

    def mark(b):
        kit.company_mark(b, 0, 0, 44, col=BONE, opacity=1, sw=6)

    def plug(b):
        b.circle(26, 30, 24, fill="#8f9299", stroke=BLACK, stroke_width=5)
        b.circle(26, 30, 24, fill=kit.pattern(b, BLACK, gap=6, sw=2, ang=45), opacity=0.6)
        b.path("M-46,-44 l22,22 M-46,-22 l22,-22", stroke=BONE, stroke_width=5, stroke_linecap="round")
    cube(a, 130, 122, 78, ic_lantern, mark, plug, fill="#3f5a94", shade=("#000", 0.18, 0.36))
    for (x, y, s) in ((40, 44, 7), (222, 52, 9)):
        sparkle(a, x, y, s)
    banner(a, 130, 248, 150, "COMPANY", size=20, h=38, fill=BLUE)


@asset(G, "horn-cup", group="pieces", title="The horn cup", w=260, h=300, row=ROW)
def horn_cup(a: Art):
    """A sailor's horn dice cup, mouth down, tilted to show one die under its rim, with a red stir arrow circling
    clockwise above it."""
    flashpaper(a)
    die2d(a, 196, 196, 46, ic_shell, ang=14)
    a.open("g", transform="rotate(-10 120 150)")
    a.ellipse(126, 214, 72, 12, fill=BLACK, opacity=0.35)
    a.path("M78,74 Q120,60 162,74 L190,206 Q124,226 58,206Z", fill="#c99a4b", **FL)
    a.path("M78,74 Q120,60 162,74 L190,206 Q124,226 58,206Z", fill=kit.pattern(a, BLACK, gap=9, sw=1.6, ang=84), opacity=0.35)
    a.path("M72,104 Q120,92 168,104 M62,180 Q124,198 186,180", fill="none", stroke=BLACK, stroke_width=9)
    a.path("M72,104 Q120,92 168,104 M62,180 Q124,198 186,180", fill="none", stroke=BONE, stroke_width=4)
    a.ellipse(120, 72, 42, 9, fill="#e3bb74", **FL)
    a.path("M92,116 L84,170", stroke="#fff", stroke_width=6, stroke_linecap="round", opacity=0.8)
    a.close()
    a.path(kit.arc_d(120, 60, 46, 150, 400), fill="none", stroke=BLACK, stroke_width=13, stroke_linecap="round")
    a.path(kit.arc_d(120, 60, 46, 150, 400), fill="none", stroke=RED, stroke_width=7, stroke_linecap="round")
    a.path("M146,96 l22,-2 l-10,-20z", fill=RED, stroke=BLACK, stroke_width=4, stroke_linejoin="round")
    banner(a, 130, 256, 100, "CUP", size=22, h=36)


# ---- table skins -------------------------------------------------------------------------------------

def table_marks(a, cups=4, cupfill=BONE):
    """What every skin carries: four cup rings, the tide-die ring, the chalk ledger, the stakes, the watching eyes."""
    W, H = a.w, a.h
    for k, (x, y) in enumerate(((W / 2, H - 120), (300, H / 2 + 20), (W / 2, 220), (W - 420, H / 2 + 20))[:cups]):
        a.circle(x, y, 78, fill=cupfill, fill_opacity=0.5, stroke=BLACK, stroke_width=6, stroke_dasharray="16 10")
        a.circle(x, y, 58, fill="none", stroke=BLACK, stroke_width=2.5)
        sparkle(a, x, y, 14, col=RED if k == 0 else BLACK)
    a.circle(W / 2, H / 2 + 20, 92, fill=GREEN, **FL)
    a.path(a.smooth_d(kit.spiral_pts(W / 2, H / 2 + 20, 6, 78, 3.2)), fill="none", stroke=FOAM, stroke_width=4, stroke_linecap="round")
    # the chalk ledger
    a.rect(W - 280, 190, 210, 520, rx=8, fill="#2a2d33", **FL)
    for j in range(7):
        y = 240 + j * 64
        n = (j * 3 + 2) % 6 + 1
        d = "".join(f"M{W - 250 + k * 13},{y}v30" for k in range(min(n, 4)))
        if n > 4:
            d += f"M{W - 256},{y + 26}l56,-22"
        a.path(d, stroke=BONE, stroke_width=4, stroke_linecap="round", opacity=0.9)
        a.open("g", transform=f"translate({W - 130},{y + 14}) scale(0.34)", opacity=0.95)
        a.rect(-50, -50, 100, 100, rx=14, fill="none", stroke=BONE, stroke_width=8)
        a.close()
    # stakes
    for k in range(6):
        a.ellipse(140 + (k % 2) * 34, 760 - k * 9, 34, 11, fill=GOLD, stroke=BLACK, stroke_width=4)
    # eyes
    for k in range(4):
        eye(a, W / 2 - 240 + k * 160, 84, 0.62, look=(-1 + k * 0.6), lit=k < 1)


@asset(G, "table-tidewater", group="maps", title="Liar's Tide table: the Tidewater tavern", w=1600, h=900, row=ROW)
def table_tidewater(a: Art):
    """The dice table at Tidewater seen from above in tattoo flash: tea-brown planks inside a rope border, four cup
    rings, the green tide-die ring, the chalk bid ledger, the stakes and the sailors' watching eyes, with swallows."""
    flashpaper(a, tone="#b9864f")
    for k in range(8):
        y = 30 + k * 108
        a.line(30, y, a.w - 30, y + 6, stroke=BLACK, stroke_width=4)
        for j in range(5):
            x = 80 + ((k * 277 + j * 331) % 1400)
            a.path(f"M{x},{y + 30} q40,-12 90,0 M{x + 20},{y + 60} q60,10 130,-4", fill="none", stroke=BLACK, stroke_width=1.6, opacity=0.4)
        a.circle(60 + (k % 2) * 1470, y + 54, 6, fill=BLACK)
    table_marks(a)
    swallow(a, 250, 250, 0.8, ang=-12)
    swallow(a, 1090, 760, 0.7, flip=-1, ang=10)
    banner(a, 300, 110, 240, "TIDEWATER", size=26, h=44)


@asset(G, "table-gullwife", group="maps", title="Liar's Tide table: the Gullwife's deck", w=1600, h=900, row=ROW)
def table_gullwife(a: Art):
    """The Gullwife crew's table: a hatch cover on a working deck in the Unwritten, storm-violet water at the rail,
    a net and a fish for stakes, gulls for swallows, in bold flash outline."""
    flashpaper(a, tone="#6d6a8c", rope=False)
    for k in range(9):
        y = 20 + k * 100
        a.path(f"M0,{y} q100,-40 200,0 t200,0 t200,0 t200,0 t200,0 t200,0 t200,0 t200,0", fill="none", stroke=BLACK, stroke_width=5)
        a.path(f"M0,{y + 22} q100,-40 200,0 t200,0 t200,0 t200,0 t200,0 t200,0 t200,0 t200,0", fill="none", stroke=FOAM, stroke_width=3,
               opacity=0.7)
    a.rect(90, 60, a.w - 180, a.h - 120, rx=18, fill="#c9a36a", **FL)
    for k in range(1, 12):
        a.line(90 + k * 118, 60, 90 + k * 118, a.h - 60, stroke=BLACK, stroke_width=3)
    a.rect(90, 60, a.w - 180, a.h - 120, rx=18, fill="none", stroke=BLACK, stroke_width=13)
    a.rect(90, 60, a.w - 180, a.h - 120, rx=18, fill="none", stroke=GOLD, stroke_width=8)
    a.rect(90, 60, a.w - 180, a.h - 120, rx=18, fill="none", stroke=BLACK, stroke_width=8, stroke_dasharray="2.5 9")
    # a net thrown over the corner
    clip = a.clip('<path d="M100,560 Q260,520 420,830 L100,830Z"/>')
    a.hatch(100, 500, 340, 340, angle=40, spacing=22, clip=clip, stroke=BLACK, stroke_width=3)
    a.hatch(100, 500, 340, 340, angle=-40, spacing=22, clip=clip, stroke=BLACK, stroke_width=3)
    table_marks(a)
    a.path("M1040,770 q50,-40 120,-10 l40,-22 l-8,40 l8,36 l-40,-20 q-70,26 -120,-24z", fill=BLUE, **FL)
    a.circle(1070, 768, 6, fill=BONE, stroke=BLACK, stroke_width=3)
    for (x, y, s, r) in ((260, 240, 1.1, -10), (1060, 250, 0.9, 12)):
        a.open("g", transform=f"translate({x},{y}) rotate({r}) scale({s})")
        ic_gull(a)
        a.close()
    banner(a, 320, 120, 220, "GULLWIFE", size=26, h=44, fill=BLUE)


@asset(G, "table-flooding", group="maps", title="Liar's Tide table: the Flooding Table", w=1600, h=900, row=ROW)
def table_flooding(a: Art):
    """The Flooding Table: a flat of reef rock at the turn of the tide. Green water climbs from the bottom edge in
    foam-edged steps, one tide mark for each round, toward the cups."""
    flashpaper(a, tone="#b8b09a", rope=False)
    r = a.rng
    for k in range(60):
        x, y = r.uniform(40, a.w - 40), r.uniform(40, 560)
        a.path(f"M{f(x)},{f(y)} l{f(r.uniform(10, 40))},{f(r.uniform(-8, 8))} l{f(r.uniform(-6, 6))},{f(r.uniform(8, 22))}", fill="none",
               stroke=BLACK, stroke_width=2.4, opacity=0.5, stroke_linejoin="round")
    for k in range(26):
        x, y = r.uniform(60, a.w - 60), r.uniform(60, 600)
        a.circle(x, y, r.uniform(5, 10), fill=BONE, stroke=BLACK, stroke_width=3)
        a.circle(x, y, 2, fill=BLACK)
    # five tide marks, then the water
    for k in range(5):
        y = 560 + k * 62
        pts = [(x, y + 16 * math.sin(x / 90 + k * 1.3)) for x in range(0, a.w + 40, 40)]
        if k < 3:
            a.path(a.smooth_d(pts), fill="none", stroke=BLACK, stroke_width=3, stroke_dasharray="18 12", opacity=0.7)
        else:
            a.path(a.smooth_d(pts) + f" L{a.w},{a.h} L0,{a.h}Z", fill=GREEN if k == 3 else "#24574c", fill_opacity=0.82 if k == 3 else 1, **FL)
            kit.foam(a, pts[::2], col="#fff", n=2, r=(4, 10), stroke=BLACK)
    table_marks(a, cupfill="#fff")
    for (x, y) in ((420, 860), (1080, 870), (1350, 850)):
        a.path(f"M{x},{y} q30,-22 60,0 t60,0", fill="none", stroke=FOAM, stroke_width=5, stroke_linecap="round")
    a.open("g", transform="translate(1180,300) scale(0.9)")
    a.poly(Art.star_pts(0, 0, 60, 24, 5), fill=RED, **FL)
    a.close()
    banner(a, 330, 120, 260, "TURN OF TIDE", size=24, h=44, fill=GREEN)

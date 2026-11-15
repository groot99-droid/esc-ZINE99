"""The nine herbs as small botanical drawings (box of about -60..60), for jar labels and the ledger."""
import math

from artkit import f, sibling

K = sibling(__file__, "_kit")
INK = K.INK

# id, name, depth, length, binding, tint
HERBS = [
    ("mint", "MINT", 1, 1, 0, K.SAGE),
    ("seers-sprig", "SEER'S SPRIG", 3, 0, 1, "#7F9A5C"),
    ("honeymoss", "HONEYMOSS", 0, 1, -2, K.GOLD),
    ("clove-bark", "CLOVE-BARK", 0, 3, 1, "#8A5A34"),
    ("dune-vine-pith", "DUNE-VINE PITH", 1, 2, 0, K.BRUISE),
    ("stormcress", "STORMCRESS", 2, 0, -1, "#6E8296"),
    ("ember-root", "EMBER ROOT", 2, 1, 2, K.LANTERN),
    ("lamp-ash", "LAMP-ASH", 0, 2, -1, "#8E8A82"),
    ("gutter-sand", "GUTTER SAND", 2, 0, -3, K.SILVER),
]


def mint(a):
    K.pen(a, [(0, 58), (-4, 20), (2, -20), (0, -54)], w=4, color=K.SAGE_D, taper=(.05, .5))
    for k, y in enumerate((36, 12, -12, -34)):
        L = 36 - k * 6
        for sg in (-1, 1):
            ang = -math.pi / 2 + sg * (1.05 - k * .08)
            K.leaf(a, 0, y, L, ang, fill=K.SAGE if (k + sg) % 2 else "#A6BA9E", wd=.42, lw=1.3)
    K.leaf(a, 0, -50, 14, -1.9, fill="#A6BA9E", lw=1.1)
    K.leaf(a, 0, -50, 14, -1.2, fill=K.SAGE, lw=1.1)


def seers_sprig(a):
    K.pen(a, [(-6, 58), (0, 20), (-4, -16), (6, -50)], w=3.6, color="#5A6E3C", taper=(.05, .5))
    for k in range(7):
        y = 44 - k * 13
        x = -4 + 3 * math.sin(k)
        for sg in (-1, 1):
            a.path(f"M{f(x)},{y} q{sg * 14},{-10} {sg * (30 - k * 2)},{-6 - k}", stroke="#5A6E3C", stroke_width=2.2, fill="none",
                   stroke_linecap="round")
    # the bud that looks back
    a.ellipse(8, -52, 15, 10, fill=K.VELLUM, stroke=INK, stroke_width=1.6, transform="rotate(-20 8 -52)")
    a.circle(9, -52, 5.5, fill=K.GOLD, stroke=INK, stroke_width=1.2)
    a.circle(9, -52, 2.2, fill=INK)
    for x, y in ((-30, 10), (28, -6), (-26, -22)):
        a.circle(x, y, 3.4, fill=K.GOLD, stroke=INK, stroke_width=1)


def honeymoss(a):
    rough = None
    for cx, cy, r in ((-22, 20, 24), (14, 16, 30), (-2, -6, 22), (30, -4, 16)):
        a.path(K.blob_d(a, cx, cy, r, r * .78, n=12, jit=.18), fill="#9FAE6A", stroke=INK, stroke_width=1.5)
        K.stip(a, cx - r, cy - r * .7, 2 * r, r * 1.4, n=26, r=(.8, 1.8), fill="#5F7A3E", opacity=.9,
               density=lambda x, y, cx=cx, cy=cy, r=r: 1 - math.hypot(x - cx, y - cy) / r)
    for x, y, s in ((-8, 36, 1), (24, 38, .8), (-34, 40, .7)):
        a.path(f"M{x},{y} c{-6 * s},{10 * s} {-6 * s},{18 * s} 0,{20 * s} c{6 * s},{-2 * s} {6 * s},{-10 * s} 0,{-20 * s}Z",
               fill=K.GOLD, stroke=INK, stroke_width=1.2)
    a.path("M-50,44 q50,10 100,0", stroke=INK, stroke_width=1.4, fill="none", opacity=.6)


def clove_bark(a):
    for x, y, r, L in ((-24, 10, 12, 80), (6, 16, 10, 70)):
        a.path(f"M{x - 12},{y - L / 2} h24 v{L} h-24Z", fill="#8A5A34", stroke=INK, stroke_width=1.6,
               transform=f"rotate({-18 if x < 0 else 12} {x} {y})")
        a.path(f"M{x - 12},{y - L / 2} q12,8 24,0 M{x - 6},{y - L / 2 + 4} v{L - 8} M{x + 5},{y - L / 2 + 4} v{L - 8}",
               stroke=INK, stroke_width=1.1, fill="none", transform=f"rotate({-18 if x < 0 else 12} {x} {y})", opacity=.8)
    for x, y, r in ((36, -30, 20), (44, 20, -30), (30, 48, 60)):
        a.open("g", transform=f"translate({x} {y}) rotate({r})")
        a.path("M0,0 v-22", stroke="#5A3A1E", stroke_width=5, stroke_linecap="round")
        a.circle(0, -27, 6, fill="#7A4A24", stroke=INK, stroke_width=1.2)
        a.path("M-6,-24 l-5,-7 M6,-24 l5,-7 M0,-33 v-7", stroke=INK, stroke_width=1.6, stroke_linecap="round")
        a.close()


def dune_vine(a):
    K.pen(a, [(-54, 30), (-20, 10), (10, 22), (50, -10)], w=13, color=K.BRUISE, taper=(.05, .15), wob=.15)
    K.curve(a, [(-48, 26), (-20, 6), (10, 18), (44, -8)], w=1.2, color="#C9B6D2", opacity=.8)
    K.pen(a, [(-20, 10), (-30, -20), (-10, -44)], w=6, color=K.BRUISE, taper=(.05, .6))
    K.pen(a, [(10, 22), (26, 44), (48, 48)], w=5, color=K.BRUISE, taper=(.05, .6))
    a.path("M-10,-44 q10,-8 14,2 q2,8 -6,8", stroke=K.BRUISE, stroke_width=2.4, fill="none", stroke_linecap="round")
    # the cut end, showing the pale pith
    a.ellipse(52, -12, 9, 12, fill="#EFE6D0", stroke=INK, stroke_width=1.6, transform="rotate(30 52 -12)")
    a.ellipse(52, -12, 4, 6, fill="#D9C8E0", transform="rotate(30 52 -12)")
    for x, y in ((-36, 46), (-10, 52), (-24, 36)):
        a.rect(x, y, 16, 5, rx=2, fill="#EFE6D0", stroke=INK, stroke_width=1, transform=f"rotate({x} {x} {y})")


def stormcress(a):
    for k, (x, y) in enumerate(((-28, 24), (0, 30), (26, 20), (-14, 0), (14, -4), (0, -28))):
        K.pen(a, [(0, 56), (x * .5, y + 20), (x, y)], w=2.6, color="#4E6276", taper=(.05, .4))
        for dx, dy in ((0, 0), (-9, 6), (9, 5)):
            a.circle(x + dx, y + dy, 8, fill="#8FA5B6" if (k + dx) % 2 else "#6E8296", stroke=INK, stroke_width=1.2)
    a.path("M34,-52 l-10,18 h9 l-10,18", stroke=K.GOLD, stroke_width=3, fill="none", stroke_linejoin="round",
           stroke_linecap="round")
    a.path("M-40,-50 l-4,12 M-28,-56 l-4,12 M-46,-30 l-4,12", stroke="#4E6276", stroke_width=1.8, stroke_linecap="round")


def ember_root(a):
    K.glow(a, 0, 6, 62, K.LANTERN, .45)
    K.pen(a, [(-4, -56), (2, -30), (-6, -4), (4, 20), (-2, 54)], w=17, color="#7A3B1E", taper=(.1, .5), wob=.25)
    for pts in ([(-4, -8), (-26, 6), (-44, 30)], [(2, 10), (26, 22), (40, 46)], [(0, -26), (24, -24), (44, -8)],
                [(-2, 30), (-20, 44), (-26, 58)]):
        K.pen(a, pts, w=7, color="#7A3B1E", taper=(.05, .7))
    K.curve(a, [(-3, -44), (0, -20), (-5, 0), (3, 22), (-1, 44)], w=3.4, color=K.LANTERN)
    K.curve(a, [(-3, -40), (0, -20), (-5, 0), (3, 22)], w=1.3, color=K.GOLD_L)
    a.path("M-8,-58 q-10,-8 -14,2 M0,-58 q4,-10 12,-4", stroke=K.SAGE_D, stroke_width=2.4, fill="none", stroke_linecap="round")


def lamp_ash(a):
    # a pilgrim's lantern, and the scrapings beside it
    a.path("M-34,-30 h36 l-5,52 h-26Z", fill="#D9D2C2", stroke=INK, stroke_width=1.8)
    a.path("M-28,-30 q12,-22 24,0 M-16,-44 v-10 M-38,22 h44", stroke=INK, stroke_width=2, fill="none", stroke_linecap="round")
    K.glow(a, -16, -6, 26, K.LANTERN, .8)
    a.path("M-16,8 C-22,0 -16,-4 -16,-12 C-10,-4 -8,2 -16,8Z", fill=K.LANTERN, stroke=INK, stroke_width=1)
    a.path("M-50,50 Q-20,22 20,36 Q44,26 56,50Z", fill="#8E8A82", stroke=INK, stroke_width=1.5)
    K.stip(a, -46, 30, 100, 20, n=50, r=(.7, 1.7), fill="#3E3A36", opacity=.85)
    a.path("M22,-20 L44,22", stroke="#8D6A26", stroke_width=4, stroke_linecap="round")     # the scraping knife
    a.path("M40,16 l10,18 l-12,-6Z", fill=K.STEEL, stroke=INK, stroke_width=1)


def gutter_sand(a):
    # the gutter of an open book, and what has been swept out of it
    a.path("M0,-40 C-14,-50 -40,-50 -56,-42 V10 C-40,2 -14,2 0,12 C14,2 40,2 56,10 V-42 C40,-50 14,-50 0,-40Z",
           fill=K.VELLUM, stroke=INK, stroke_width=1.8, stroke_linejoin="round")
    a.path("M0,-40 V12 M-46,-32 q20,-6 38,0 M-46,-20 q20,-6 38,0 M46,-32 q-20,-6 -38,0 M46,-20 q-20,-6 -38,0", stroke=INK,
           stroke_width=1, fill="none", opacity=.6)
    K.sand(a, -6, -40, 12, 60, n=60, r=(.6, 1.4))
    K.sand_pile(a, 0, 54, 46, 26, n=200)
    K.sand(a, -8, 10, 16, 30, n=40, r=(.6, 1.4))


DRAW = {"mint": mint, "seers-sprig": seers_sprig, "honeymoss": honeymoss, "clove-bark": clove_bark,
        "dune-vine-pith": dune_vine, "stormcress": stormcress, "ember-root": ember_root, "lamp-ash": lamp_ash,
        "gutter-sand": gutter_sand}


def herb(a, key, cx, cy, s=1.0):
    a.open("g", transform=f"translate({f(cx)} {f(cy)}) scale({f(s)})")
    DRAW[key](a)
    a.close()

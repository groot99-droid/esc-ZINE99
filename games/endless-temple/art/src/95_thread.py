"""The collection thread: this game's own object, and the guest object it hides."""
import math

from artkit import Art, asset, f, sibling

K = sibling(__file__, "_kit")
INK = K.INK


def wood(a, base="#3B2617", dark="#22150B", n=38):
    a.rect(0, 0, a.w, a.h, fill=base)
    d = []
    for k in range(n):
        y = k * a.h / n + a.rng.uniform(-3, 3)
        d.append(a.smooth_d([(x, y + 6 * math.sin(x / 80 + k * 1.3) + a.rng.uniform(-1.5, 1.5)) for x in range(-10, a.w + 40, 44)]))
    a.path(" ".join(d), fill="none", stroke=dark, stroke_width=1.3, opacity=.7)
    a.path(" ".join(d[::3]), fill="none", stroke="#6A4A2C", stroke_width=.9, opacity=.6, transform="translate(0 4)")


@asset(K.G, "thread-own", group="thread", title="The ring a cup leaves on a table", w=480, h=480, row="Thread")
def thread_own(a: Art):
    """One faint tea ring on the walnut reading table, where someone sat reading: the cup has been lifted away,
    a sunbeam crosses the wood, and the corner of a closed, sand-dusted book lies at the edge."""
    wood(a)
    K.sunbeam(a, -40, -80, 520, 560, 70, 190, K.GOLD_L, .5)
    # the ring: broken where the foot of the cup was dry
    K.tea_ring(a, 228, 250, 104, color="#D9A948", op=.62, wd=9, gap=.16)
    K.tea_ring(a, 262, 232, 100, color="#C59A4A", op=.2, gap=.4)
    a.path("M300,330 q14,10 30,6", stroke="#D9A948", stroke_width=5, opacity=.4, fill="none", stroke_linecap="round",
           filter=a.roughen(3, .08))
    for x, y, r in ((352, 318, 6), (368, 300, 3.5), (150, 172, 4)):
        a.circle(x, y, r, fill="#D9A948", opacity=.45)
    # the book's corner, and what it sheds
    a.path("M300,-20 L520,-20 L520,150 L372,196Z", fill="#000", opacity=.4, transform="translate(8 12)", filter=a.blur(6))
    a.path("M300,-20 L520,-20 L520,150 L372,196Z", fill=K.OCHRE, stroke=INK, stroke_width=2.4, stroke_linejoin="round")
    a.path("M372,196 L520,150 L520,166 L376,212Z", fill=K.VELLUM_D, stroke=INK, stroke_width=1.6)
    a.path("M374,201 L520,155 M375,206 L520,160", stroke=K.VELLUM_S, stroke_width=1)
    K.grain(a, 300, 0, 180, 200, .25, .7, clip=a.clip('<path d="M300,-20 L520,-20 L520,150 L372,196Z"/>'))
    K.sand(a, 300, 150, 180, 130, n=340, r=(.7, 2), density=lambda x, y: max(0, 1 - math.hypot(x - 420, y - 200) / 120))
    K.sand(a, 320, 0, 160, 150, n=90, r=(.6, 1.6))
    # a spoon left beside the ring
    a.open("g", transform="rotate(28 110 380)")
    a.ellipse(110, 380, 20, 13, fill=K.STEEL, stroke=INK, stroke_width=1.8)
    a.ellipse(106, 377, 9, 5, fill="#fff", opacity=.35)
    a.path("M130,378 L236,376 q8,4 0,8 L130,384Z", fill=K.STEEL, stroke=INK, stroke_width=1.6)
    a.close()
    a.vignette(.55, "#0A0502")


@asset(K.G, "thread-guest", group="thread", title="A stopped clock at 2:14", w=480, h=480, row="Thread")
def thread_guest(a: Art):
    """The temple's cuckoo clock on a walnut wall, stopped at fourteen minutes past two: the pendulum hangs
    plumb, the little door stands open on an unsprung bird, and silver sand has drifted onto the roof and
    into the works."""
    wood(a, "#33200F", "#1C1108", n=30)
    K.sunbeam(a, 520, -40, 60, 520, 40, 170, K.GOLD_L, .4)
    cx = 240
    # chains and weights; the pendulum, still
    for x, L in ((cx - 46, 150), (cx + 46, 96)):
        a.path(f"M{x},330 v{L}", stroke=K.BRASS_D, stroke_width=3, stroke_dasharray="6 4")
        a.path(f"M{x - 10},{330 + L} q10,-14 20,0 l-4,44 q-6,10 -12,0Z", fill="#5A3A1E", stroke=INK, stroke_width=1.8)
    a.line(cx, 330, cx, 432, stroke=K.BRASS_D, stroke_width=4)
    K.leaf(a, cx, 424, 44, math.pi / 2, fill=K.BRASS, wd=.5, lw=1.8)
    a.ellipse(cx + 4, 474, 34, 5, fill="#000", opacity=.3)
    # the house
    a.path(f"M{cx - 110},150 L{cx},60 L{cx + 110},150 V330 H{cx - 110}Z", fill="#000", opacity=.4, transform="translate(10 12)",
           filter=a.blur(7))
    a.path(f"M{cx - 100},160 H{cx + 100} V330 H{cx - 100}Z", fill="#6B4A2C", stroke=INK, stroke_width=2.6)
    a.path("".join(f"M{cx - 100},{y}H{cx + 100}" for y in (200, 244, 288)), stroke=K.WALNUT, stroke_width=1.2, opacity=.6)
    a.path(f"M{cx - 126},166 L{cx},56 L{cx + 126},166 L{cx + 110},176 L{cx},86 L{cx - 110},176Z", fill=K.SAGE_D, stroke=INK,
           stroke_width=2.6, stroke_linejoin="round")
    a.path("".join(f"M{f(cx - 100 + k * 18)},{f(160 - k * 15.6)}l14,10" for k in range(1, 6))
           + "".join(f"M{f(cx + 100 - k * 18)},{f(160 - k * 15.6)}l-14,10" for k in range(1, 6)), stroke=INK, stroke_width=1.2,
           opacity=.6)
    # carved leaves either side
    for sx in (-1, 1):
        for k, (y, ang) in enumerate(((208, -0.5), (252, -0.2), (296, 0.2))):
            K.leaf(a, cx + sx * 98, y, 38, (math.pi if sx < 0 else 0) + sx * ang, fill=K.SAGE if k % 2 else K.SAGE_D, lw=1.5)
    # the door, open; the bird out and unsprung
    a.rect(cx - 20, 100, 40, 44, rx=18, fill=K.WALNUT, stroke=INK, stroke_width=2)
    a.path(f"M{cx + 20},104 l26,-8 v44 l-26,4Z", fill="#7A5A38", stroke=INK, stroke_width=1.8)
    a.path(f"M{cx},128 l16,6", stroke=K.BRASS_D, stroke_width=3)
    K.shape(a, [(cx + 10, 124), (cx + 24, 118), (cx + 36, 126), (cx + 32, 140), (cx + 16, 142)], K.VELLUM, lw=1.6)
    a.path(f"M{cx + 36},128 l12,4 l-12,4Z", fill=K.LANTERN, stroke=INK, stroke_width=1.2)
    a.circle(cx + 28, 126, 1.8, fill=INK)
    # the dial: 2:14
    dx, dy, r = cx, 244, 62
    a.circle(dx, dy, r + 8, fill=K.BRASS_D, stroke=INK, stroke_width=2.4)
    a.circle(dx, dy, r, fill=K.VELLUM, stroke=INK, stroke_width=1.8)
    K.grain(a, dx - r, dy - r, 2 * r, 2 * r, .2, .8, clip=a.clip(f'<circle cx="{dx}" cy="{dy}" r="{r}"/>'))
    num = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"]
    for k in range(12):
        t = math.radians(k * 30 - 90)
        a.text(dx + (r - 15) * math.cos(t), dy + (r - 15) * math.sin(t) + 5, num[k], size=13, family="serif", fill=INK,
               text_anchor="middle", font_weight="bold")
    d = "".join(f"M{f(dx + (r - 3) * math.cos(t))},{f(dy + (r - 3) * math.sin(t))}L{f(dx + (r - 7) * math.cos(t))},{f(dy + (r - 7) * math.sin(t))}"
                for t in (math.radians(k * 6) for k in range(60)))
    a.path(d, stroke=INK, stroke_width=1)
    hm = math.radians(14 * 6 - 90)                       # minute hand at 14
    hh = math.radians((2 + 14 / 60) * 30 - 90)           # hour hand a little past two
    K.pen(a, [(dx - 8 * math.cos(hm), dy - 8 * math.sin(hm)), (dx + 30 * math.cos(hm), dy + 30 * math.sin(hm)),
              (dx + 46 * math.cos(hm), dy + 46 * math.sin(hm))], w=4.5, color=K.WALNUT, taper=(.05, .5))
    K.pen(a, [(dx - 6 * math.cos(hh), dy - 6 * math.sin(hh)), (dx + 20 * math.cos(hh), dy + 20 * math.sin(hh)),
              (dx + 30 * math.cos(hh), dy + 30 * math.sin(hh))], w=7, color=K.WALNUT, taper=(.05, .4))
    a.circle(dx, dy, 5, fill=K.BRASS, stroke=INK, stroke_width=1.4)
    # sand on the roof, on the dial's lip and below
    K.sand(a, cx - 100, 92, 90, 70, n=60, r=(.6, 1.6), density=lambda x, y: max(0, 1 - abs((y - 160) + (x - (cx - 100)) * .87) / 12))
    K.sand(a, dx - 50, dy + 40, 100, 24, n=90, r=(.6, 1.6), density=lambda x, y: 1 - abs(x - dx) / 50)
    K.sand_pile(a, cx - 30, 330, 44, 9, n=80)
    K.sand(a, cx - 70, 330, 90, 150, n=50, r=(.6, 1.5), density=lambda x, y: max(0, 1 - abs(x - (cx - 30)) / 30))
    a.vignette(.5, "#0A0502")

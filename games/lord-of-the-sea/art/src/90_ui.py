"""UI ornaments (rose ring, stir spiral, corners, rules, seal states) and the two thread objects."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK, PAPER, BB = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK, kit.PAPER, kit.BLUEBLACK)
ROW = "UI ornaments: rose ring, stir spiral, corners, rules, seal states"
TIERS = ["Ripple", "Swell", "Current", "Fog", "Squall", "Storm", "Tide-turn"]


def ring(a, c, wild, tier, bright=False):
    """The HUD's compass-rose ring: outer ring the region's Wild, inner ring the devotion tier, a notch between."""
    steps = [INK, "#27425a", "#2c5560", "#2f6b5e", "#5fa08d"]
    if bright:
        a.circle(c, c, 196, fill=a.radial([(0.55, FOAM, 0), (0.8, "#bfe8da", 0.9), (1, FOAM, 0)], 0.5, 0.5, 0.5))
    a.circle(c, c, 170, fill=PAPER, stroke=INK, stroke_width=2)
    ruled = kit.pattern(a, PAPER, gap=4, sw=1.1, ang=0, opacity=0.5)
    waved = kit.pattern(a, PAPER, gap=5, sw=1.2, wave=True, opacity=0.6)
    for k in range(5):
        a0, a1 = -225 + k * 54, -225 + (k + 1) * 54 - 3
        lit = wild >= k * 20
        d = kit.arc_d(c, c, 150, a0, a1)
        a.path(d, fill="none", stroke=steps[k] if lit else "#cfc6ac", stroke_width=30)
        if lit:
            a.path(d, fill="none", stroke=waved if k >= 3 else ruled, stroke_width=30)
    a.circle(c, c, 131, fill="none", stroke=INK, stroke_width=1.4)
    for k in range(7):
        a0, a1 = -225 + k * 38.57, -225 + (k + 1) * 38.57 - 3
        a.path(kit.arc_d(c, c, 116, a0, a1), fill="none", stroke=SEAINK if k <= tier else "#cfc6ac", stroke_width=16,
               opacity=1 if k <= tier else 0.8)
    a.circle(c, c, 104, fill="none", stroke=INK, stroke_width=1.2)
    kit.rose(a, c, c, 96, labels=False, fine=False)
    # the notch: where the two rings meet is the effective tier
    eff = min(tier, int(wild / 15))
    an = math.radians(-225 + (eff + 0.5) * 38.57)
    x1, y1 = c + 100 * math.cos(an), c + 100 * math.sin(an)
    x2, y2 = c + 176 * math.cos(an), c + 176 * math.sin(an)
    a.line(x1, y1, x2, y2, stroke=PAPER, stroke_width=9)
    a.line(x1, y1, x2, y2, stroke=GOLD, stroke_width=5, stroke_linecap="round")
    a.circle(x2, y2, 8, fill=GOLD, stroke=INK, stroke_width=1.5)
    a.rect(c - 62, c + 132, 124, 34, rx=4, fill=PAPER, stroke=INK, stroke_width=1.2)
    kit.smallcaps(a, c, c + 155, TIERS[eff + (1 if bright else 0)], size=16, col=SEAINK if bright else INK)


@asset(G, "rose-ring", group="ui", title="HUD: the rose ring", w=400, h=400, row=ROW)
def rose_ring(a: Art):
    """The only HUD aboard: a small engraved compass rose in two rings. The outer ring is the region's Wild, from
    ruled Company blue to wave-hatched sea-green; the inner ring is the devotion tier; a gold notch marks where they
    meet, the effective tier."""
    kit.plate(a, m=0, mark=False)
    ring(a, 200, wild=45, tier=4)


@asset(G, "rose-ring-tideline", group="ui", title="HUD: the rose ring at the tideline", w=400, h=400, row=ROW)
def rose_ring_tide(a: Art):
    """The rose ring as it shows in the tideline: brightened with a ring of foam, a plus-one beside it, the notch a
    tier higher."""
    kit.plate(a, m=0, mark=False)
    ring(a, 200, wild=45, tier=4, bright=True)
    a.circle(338, 66, 34, fill=SEAINK, stroke=INK, stroke_width=1.6)
    a.text(338, 78, "+1", size=32, family="serif", fill=FOAM, text_anchor="middle", font_weight="bold")


def stir(a, cw, circles, label):
    kit.plate(a, m=0, mark=False)
    c = 200
    for k in range(1, circles + 1):
        a.circle(c, c, 40 + k * 34, fill="none", stroke=SEAINK, stroke_width=2.2, opacity=0.35 + 0.15 * k)
        a.circle(c, c, 40 + k * 34, fill="none", stroke=SEAINK, stroke_width=7, opacity=0.08)
    pts = kit.spiral_pts(c, c, 6, 40 + (circles + 0.8) * 34, circles + 0.8, cw=cw, start=-90, n=120)
    d = a.smooth_d(pts)
    a.path(d, fill="none", stroke=SEAINK, stroke_width=11, opacity=0.14, stroke_linecap="round")
    a.path(d, fill="none", stroke=SEAINK, stroke_width=3.2, stroke_linecap="round")
    (x1, y1), (x2, y2) = pts[-3], pts[-1]
    ang = math.atan2(y2 - y1, x2 - x1)
    a.path(f"M{f(x2 + 16 * math.cos(ang))},{f(y2 + 16 * math.sin(ang))} L{f(x2 + 9 * math.cos(ang + 2.2))},{f(y2 + 9 * math.sin(ang + 2.2))} "
           f"L{f(x2 + 9 * math.cos(ang - 2.2))},{f(y2 + 9 * math.sin(ang - 2.2))}Z", fill=SEAINK)
    a.circle(c, c, 5, fill=SEAINK)
    if cw:
        kit.sea(a, 60, 340, 338, 372, rows=4, fn=kit.swell(amp=7, wl=90, sharp=0.6), col=GREEN, step=8, persp=1)
    else:
        kit.calm(a, 60, 340, 340, 372, rows=4, persp=1)
    a.rect(c - 70, 14, 140, 34, rx=4, fill=PAPER, stroke=SEAINK, stroke_width=1.2)
    kit.smallcaps(a, c, 37, label, size=16, col=SEAINK)


@asset(G, "stir-spiral-clockwise", group="ui", title="Stir gesture: clockwise", w=400, h=400, row=ROW)
def stir_cw(a: Art):
    """The stir gesture clockwise: a faint sea-ink spiral following the hand, a ring left by each completed circle,
    the tier reached labelled above, and the water raised below it."""
    stir(a, True, 3, "Current")


@asset(G, "stir-spiral-counter", group="ui", title="Stir gesture: counter-clockwise", w=400, h=400, row=ROW)
def stir_ccw(a: Art):
    """The stir gesture counter-clockwise: the same spiral run the other way, two rings, the word Still, and the
    water ruled flat below it."""
    stir(a, False, 2, "Still")


@asset(G, "corner-order", group="ui", title="Corner ornament: Order", w=320, h=320, row=ROW)
def corner_order(a: Art):
    """A page corner for the Company's side: a ruled-hatch bracket with squared key-work, a buoy and the leaf mark."""
    kit.plate(a, m=0, mark=False)
    ruled = kit.pattern(a, INK, gap=4.5, sw=1.2)
    a.path("M20,20 H300 V60 H60 V300 H20Z", fill=ruled, stroke=INK, stroke_width=2)
    a.path("M74,74 H280 M74,74 V280 M88,88 H240 M88,88 V240", stroke=INK, stroke_width=1.2, fill="none")
    a.path("M300,74 v30 h-30 v-16 h14 M74,300 h30 v-30 h-16 v14", fill="none", stroke=INK, stroke_width=2.4)
    a.circle(40, 40, 30, fill=PAPER, stroke=INK, stroke_width=2)
    kit.company_mark(a, 40, 40, 18, col=INK, opacity=1, sw=1.6)
    kit.buoy(a, 150, 190, 2.2, lit=True)
    kit.calm(a, 100, 220, 196, 232, rows=5, persp=1)


@asset(G, "corner-wild", group="ui", title="Corner ornament: Wild", w=320, h=320, row=ROW)
def corner_wild(a: Art):
    """A page corner for the old sea: a wave-hatched bracket breaking into foam along its inner edge, a clockwise
    spiral in the angle and a gull."""
    kit.plate(a, m=0, mark=False)
    waved = kit.pattern(a, GREEN, gap=5.5, sw=1.4, wave=True)
    edge = [(300, 62)] + [(300 - k * 24, 62 + 8 * math.sin(k * 1.4)) for k in range(1, 10)] + [(66, 66)] + \
           [(62 + 8 * math.sin(k * 1.4), 66 + k * 24) for k in range(1, 10)] + [(62, 300)]
    d = "M20,20 H300 " + " ".join(f"L{f(x)},{f(y)}" for x, y in edge) + " H20Z"
    a.path(d, fill=FOAM)
    a.path(d, fill=waved, stroke=GREEN, stroke_width=2, stroke_linejoin="round")
    kit.foam(a, edge[::1], n=2, r=(1.6, 5), stroke=GREEN)
    a.circle(44, 44, 32, fill=PAPER, stroke=GREEN, stroke_width=2)
    kit.spiral(a, 44, 44, 2, 24, 3, stroke_width=2.6)
    kit.sea(a, 96, 250, 150, 230, rows=7, fn=kit.swell(amp=9, wl=110, sharp=0.6), col=GREEN, step=8, persp=1)
    kit.gull(a, 200, 118, 1.3, col=INK, sw=1.8)
    kit.gull(a, 238, 134, 0.9, col=INK, sw=1.6)


@asset(G, "rule-order", group="ui", title="Divider rule: Order", w=800, h=90, row=ROW)
def rule_order(a: Art):
    """A divider for Company pages: a ruled double line with squared ends and the leaf mark at its centre."""
    kit.plate(a, m=0, mark=False)
    a.path("M40,40 H350 M40,50 H350 M450,40 H760 M450,50 H760", stroke=INK, stroke_width=2)
    a.rect(60, 37, 270, 16, fill=kit.pattern(a, INK, gap=4, sw=1), opacity=0.6)
    a.rect(470, 37, 270, 16, fill=kit.pattern(a, INK, gap=4, sw=1), opacity=0.6)
    for x in (30, 760):
        a.rect(x, 35, 10, 20, fill=INK)
    a.poly([(400, 12), (438, 45), (400, 78), (362, 45)], fill=PAPER, stroke=INK, stroke_width=2)
    kit.company_mark(a, 400, 45, 17, col=INK, opacity=1, sw=1.6)


@asset(G, "rule-wild", group="ui", title="Divider rule: Wild", w=800, h=90, row=ROW)
def rule_wild(a: Art):
    """A divider for the old sea's pages: two wave lines that swell toward a clockwise sea-ink spiral at the centre."""
    kit.plate(a, m=0, mark=False)
    for sgn in (-1, 1):
        for row in range(3):
            pts = [(400 + sgn * (48 + k * 13), 45 + (row - 1) * 9 + (7 - row * 2) * math.sin(k * 0.8 + row) * (1 - k / 28)) for k in range(28)]
            a.path(a.smooth_d(pts), fill="none", stroke=GREEN, stroke_width=2.4 - row * 0.5 if row else 2.4, stroke_linecap="round")
    kit.foam(a, [(120, 40), (680, 40), (250, 44), (550, 44)], n=2, stroke=GREEN)
    a.circle(400, 45, 36, fill=PAPER, stroke=GREEN, stroke_width=2)
    kit.spiral(a, 400, 45, 2, 28, 3.2, stroke_width=2.8)


def port(a, name):
    kit.plate(a, m=0, mark=False)
    a.grid(0, 0, a.w, a.h, 60, stroke=INK, stroke_width=0.4, opacity=0.4)
    a.circle(130, 120, 92, fill="none", stroke=INK, stroke_width=1.2, stroke_dasharray="3 5")
    kit.smallcaps(a, 130, 244, name, size=15)


@asset(G, "port-seal-bound", group="ui", title="Port seal: bound", w=260, h=260, row=ROW)
def seal_bound(a: Art):
    """A port on the chart table that is still bound: whole red wax with the Company's mark, a ribbon under it."""
    port(a, "Bound")
    kit.wax(a, 130, 100, 54, emblem=lambda cx, cy, r: kit.company_mark(a, cx, cy, r, opacity=0.5), ribbon=INK)


@asset(G, "port-seal-broken", group="ui", title="Port seal: broken", w=260, h=260, row=ROW)
def seal_broken(a: Art):
    """A port whose charter was struck: the same seal cracked across, a crumb of wax beside it, the ribbon cut."""
    port(a, "Broken")
    kit.wax(a, 130, 118, 66, emblem=lambda cx, cy, r: kit.company_mark(a, cx, cy, r, opacity=0.5), ribbon=None, cracked=True)
    for (x, y, r) in ((206, 170, 9), (60, 62, 6), (214, 186, 4)):
        a.poly(Art.ngon(x, y, r, 5, rot=x), fill=RED, stroke="#5e1818", stroke_width=1)
    a.path("M96,186 l-8,40 l14,-8 l8,12 l4,-40z", fill=INK, opacity=0.9)


@asset(G, "port-seal-rewritten", group="ui", title="Port seal: rewritten", w=260, h=260, row=ROW)
def seal_rewritten(a: Art):
    """A port whose charter was rewritten: no wax, a pen mark in blue-black ink where the seal sat, the nib that
    made it, and a kept lane ruled out from the port."""
    port(a, "Rewritten")
    a.circle(130, 120, 60, fill=RED, opacity=0.1)
    a.path("M130,120 L250,40", stroke=INK, stroke_width=2.4, stroke_dasharray="12 6")
    kit.flourish(a, 86, 132, 0.62, 1, col=BB, sw=3)
    a.path("M76,112 q30,-36 60,-6 q22,24 52,-10", fill="none", stroke=BB, stroke_width=3.4, stroke_linecap="round")
    a.open("g", transform="translate(190,96) rotate(38)")
    a.path("M0,0 l-9,-34 h18z", fill=GOLD, stroke=INK, stroke_width=1.4)
    a.path("M0,0 v-22", stroke=INK, stroke_width=1.2)
    a.rect(-9, -92, 18, 58, rx=3, fill=TEA, stroke=INK, stroke_width=1.4)
    a.close()
    a.circle(188, 100, 4, fill=BB)


@asset(G, "notice-seal", group="ui", title="Notice: the Company seal that darkens", w=800, h=240, row=ROW)
def notice(a: Art):
    """Notice, shown on the chart table as a Company seal in four states: pale and barely pressed, then redder,
    then dark, then nearly black with the watching eye of a lit lighthouse beam across it."""
    kit.plate(a, m=10)
    cols = ["#d9b7a4", "#b55a4a", "#7a2020", "#2a0e12"]
    for k in range(4):
        cx = 110 + k * 194
        kit.wax(a, cx, 112, 62, col=cols[k], emblem=lambda x, y, r: kit.company_mark(a, x, y, r, opacity=0.35 + k * 0.1,
                                                                                    col="#000" if k < 3 else GOLD))
        a.text(cx, 214, ["0", "30", "50", "70"][k], size=18, family="serif", fill=INK, text_anchor="middle", font_style="italic")
        if k:
            a.path(f"M{cx - 122},112 h34 m-10,-7 l10,7 l-10,7", fill="none", stroke=INK, stroke_width=1.6)
    a.path("M800,60 L700,104 L700,122 L800,150Z", fill=GOLD, opacity=0.35)


# ---- the thread --------------------------------------------------------------------------------------

@asset(G, "thread-own", group="thread", title="Thread: the tea caddy", w=480, h=480, row="Thread")
def thread_own(a: Art):
    """A blue-and-white tea caddy with the Great British Tea Company's mark, sitting on a cabin shelf between a
    bottle and a jar: engraved and hand-tinted, lit by dawn from the low left."""
    m = kit.plate(a)
    a.rect(40, 40, 400, 400, fill=kit.pattern(a, INK, gap=5, sw=0.7), opacity=0.4)
    a.circle(60, 380, 260, fill=a.radial([(0, GOLD, 0.4), (1, GOLD, 0)]))
    # the shelf
    a.rect(40, 352, 400, 20, fill=PAPER, stroke=INK, stroke_width=1.8)
    a.rect(40, 372, 400, 68, fill=kit.pattern(a, INK, gap=3.2, sw=1), opacity=0.8)
    a.path("M40,358 h400", stroke=INK, stroke_width=0.8)
    kit.bottle(a, 96, 232, 1.3, glass=GREEN)
    a.path("M352,268 h56 v84 h-56z M346,256 h68 v12 h-68z", fill=PAPER, stroke=INK, stroke_width=1.8)
    a.rect(352, 268, 56, 84, fill=kit.pattern(a, TEA, gap=4, sw=1, ang=90), opacity=0.6)
    # the caddy
    cob, glz = kit.COB, kit.GLAZE
    a.ellipse(250, 352, 92, 10, fill=INK, opacity=0.35)
    a.path("M172,196 q78,-22 156,0 l6,150 q-84,16 -168,0z", fill=glz, stroke=INK, stroke_width=2.2, stroke_linejoin="round")
    a.path("M300,190 q14,2 28,6 l6,150 q-20,4 -40,6z", fill=kit.pattern(a, INK, gap=3.4, sw=0.9, ang=90), opacity=0.45)
    a.path("M176,214 q74,-18 148,0 M170,330 q80,16 160,0", fill="none", stroke=cob, stroke_width=5)
    a.path("M176,224 q74,-18 148,0 M170,320 q80,16 160,0", fill="none", stroke=cob, stroke_width=4, stroke_dasharray="0.1 9", stroke_linecap="round")
    a.ellipse(250, 270, 44, 38, fill=glz, stroke=cob, stroke_width=3)
    kit.company_mark(a, 250, 270, 26, col=cob, opacity=1, sw=2.6)
    for sgn in (-1, 1):
        a.path(f"M{250 + sgn * 54},{246} q{sgn * 14},20 {sgn * 2},46 M{250 + sgn * 60},{256} l{sgn * 10},-6 M{250 + sgn * 62},{272} l{sgn * 10},-2",
               fill="none", stroke=cob, stroke_width=2.2, stroke_linecap="round")
    a.path("M196,184 q54,-16 108,0 v14 q-54,-14 -108,0z", fill=glz, stroke=INK, stroke_width=2.2, stroke_linejoin="round")
    a.path("M200,190 q50,-13 100,0", fill="none", stroke=cob, stroke_width=3)
    a.path("M236,172 q14,-22 28,0z", fill=cob, stroke=INK, stroke_width=1.8)
    a.path("M190,214 q-6,60 -4,120", fill="none", stroke="#fff", stroke_width=5, opacity=0.8, stroke_linecap="round")
    kit.frame(a, 40, 40, 400, 400, sw=1.8, gap=-5)


@asset(G, "thread-guest", group="thread", title="Thread: the left-slanted correction", w=480, h=480, row="Thread")
def thread_guest(a: Art):
    """The margin of a harbour-book page in engrossing hand. One word in the text is struck through, a caret points
    out past the red margin rule, and there the correction is written in a different, left-slanted hand in
    blue-black ink."""
    a.paper("#EBDDB8", grain=0.25)
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#fff", 0.25), (0.7, "#fff", 0), (1, TEA, 0.3)], 0.5, 0.45, 0.8))
    a.line(150, 0, 150, a.h, stroke=RED, stroke_width=1.6)
    a.line(156, 0, 156, a.h, stroke=RED, stroke_width=0.6)
    brown = "#3a2a1c"
    for j in range(9):
        y = 56 + j * 48
        a.text(136, y, f"{j + 4}.", size=17, family="serif", fill=RED, text_anchor="end", font_weight="bold")
        if j == 4:
            kit.script(a, 172, y, 120, size=1.25, col=brown, slant=0.25)
            kit.script(a, 306, y, 70, size=1.25, col=brown, slant=0.25)
            a.path(a.wobble_d([(300, y - 5), (384, y - 7)], 0.8, 14), fill="none", stroke=BB, stroke_width=2.6)
            a.path(f"M340,{y + 14} l8,-12 l8,12", fill="none", stroke=BB, stroke_width=2.2, stroke_linecap="round")
            a.path(f"M348,{y + 6} Q250,{y + 40} 132,{y + 8}", fill="none", stroke=BB, stroke_width=1.2, stroke_dasharray="5 4")
            kit.script(a, 398, y, 70, size=1.25, col=brown, slant=0.25)
        else:
            kit.script(a, 172, y, 290 if j % 3 else 230, size=1.25, col=brown, slant=0.25)
    # the correction: a different hand, leaning left
    y = 56 + 4 * 48
    kit.script(a, 38, y - 2, 86, size=1.45, col=BB, slant=-0.85, sw=2.6)
    kit.script(a, 46, y + 26, 60, size=1.45, col=BB, slant=-0.85, sw=2.6)
    a.circle(30, y + 34, 3.4, fill=BB)
    kit.tick(a, 96, 446, s=1.2)
    kit.salt(a, 420, 430, 70)

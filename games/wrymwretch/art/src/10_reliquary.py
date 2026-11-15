"""The reliquary hand: title lettering, fifteen chapter cards, fourteen UI ornaments and the two thread objects.

Carved bone and tarnished silver, every edge a ridge with a cold rim light, fine black cracks, a starry void behind and one
accent light (DEEP_DIVE.md section 4).
"""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
GAME = kit.data("game")
STAR = kit.data("star_chart")
BONE, SILVER, VOID, INK, VIOLET, GOLD = kit.BONE, kit.SILVER, kit.VOID, kit.INK, kit.VIOLET, kit.GOLD


def R(a, d, fill=None, k=2.4, **kw):
    kit.relief(a, d, fill or kit.bone_grad(a), k=k, **kw)


def crack_glow(a, x, y, ang, length, col, width=3.0, branch=0.25):
    """A crack with the accent's light coming through it."""
    d = kit.crack_d(a.rng, x, y, ang, length, 14, branch)
    a.path(d, fill="none", stroke=col, stroke_width=width * 5, opacity=0.35, filter=a.blur(6), stroke_linejoin="round")
    a.path(d, fill="none", stroke=INK, stroke_width=width, stroke_linejoin="round")
    a.path(d, fill="none", stroke=kit.shade(col, 0.55), stroke_width=width * 0.35, stroke_linejoin="round")
    return d


# ---- title ---------------------------------------------------------------------------------------
@asset(G, "title-wrymwretch", group="title", title="WrymWretch: title lettering", w=1600, h=500, row='Title lettering "WrymWretch", cracked bone capitals')
def title(a: Art):
    """The title WRYMWRETCH in cracked bone capitals edged with tarnished silver, on a starry void. Fine black cracks run
    through the letters; one, between WRYM and WRETCH, lets violet light through. A wyrm's spine lies under the word, with
    six studs in the realms' colours."""
    r = a.rng
    kit.void(a, glow=(VIOLET, 0.5, 0.55, 0.6), stars=420, big=10)
    word = dict(size=236, family="serif", text_anchor="middle", font_weight="bold", textLength=1380, lengthAdjust="spacingAndGlyphs")
    x, y = 800, 318
    a.text(x + 10, y + 14, "WRYMWRETCH", fill="#000", opacity=0.7, filter=a.blur(5), **word)
    a.text(x + 5, y + 7, "WRYMWRETCH", fill="#2b303b", **word)
    a.text(x + 2.5, y + 3.5, "WRYMWRETCH", fill=kit.silver_grad(a), stroke=kit.silver_grad(a), stroke_width=7, stroke_linejoin="round", **word)
    a.text(x - 2.2, y - 3, "WRYMWRETCH", fill="#ffffff", **word)
    a.text(x, y, "WRYMWRETCH", fill=a.gradient([(0, "#fdfaf0"), (0.5, BONE), (1, "#9a917b")]), **word)
    cl = a.clip('<text x="800" y="318" font-size="236" font-family="serif" text-anchor="middle" font-weight="bold" textLength="1380" '
                'lengthAdjust="spacingAndGlyphs">WRYMWRETCH</text>')
    kit.grain(a, 100, 130, 1400, 220, cl, alpha=0.3)
    # shading low on the letters, as if lit from above left
    a.rect(100, 250, 1400, 80, fill=a.gradient([(0, "#6d6552"), (1, "#3a3528")]), opacity=0.28, clip_path=cl)
    d = "".join(kit.crack_d(r, 120 + r.random() * 1360, 150 + r.random() * 170, r.uniform(0, 6.28), r.uniform(50, 150), 9, 0.3) for _ in range(34))
    a.path(d, fill="none", stroke=INK, stroke_width=1.5, stroke_linejoin="round", clip_path=cl, opacity=0.9)
    a.path(d, fill="none", stroke="#fff", stroke_width=0.7, stroke_linejoin="round", clip_path=cl, opacity=0.5, transform="translate(-1.2,-1)")
    # the wound between the two halves of the word
    crack_glow(a, 742, 96, 1.45, 300, VIOLET, 3.4, 0.3)
    # the spine beneath
    for k in range(37):
        vx = 224 + k * 32
        vy = 410 + 7 * math.sin(k / 36 * math.pi * 2)
        s = 0.7 + 0.5 * math.sin(k / 36 * math.pi)
        R(a, f"M{f(vx - 11 * s)},{f(vy - 8 * s)} q{f(11 * s)},{f(-8 * s)} {f(22 * s)},0 l{f(3 * s)},{f(15 * s)} q{f(-14 * s)},{f(9 * s)} {f(-28 * s)},0z", k=1.5)
        R(a, f"M{f(vx - 2)},{f(vy - 10 * s)} l2,{f(-14 * s)} l2,{f(14 * s)}z", kit.silver_grad(a), k=1)
    for i, realm in enumerate(kit.REALMS):
        sx = 800 + (i - 2.5) * 96
        a.circle(sx, 462, 16, fill=realm["acc"], opacity=0.5, filter=a.blur(6))
        R(a, f"M{sx - 10},462 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0z", kit.silver_grad(a), k=1.4)
        a.circle(sx, 462, 5.5, fill=realm["acc"])
    a.line(190, 462, 520, 462, stroke=SILVER, stroke_width=1.2, opacity=0.7)
    a.line(1080, 462, 1410, 462, stroke=SILVER, stroke_width=1.2, opacity=0.7)


# ---- chapter cards -------------------------------------------------------------------------------
NX, NY = 1210, 452   # niche centre


def niche(a, acc):
    """The carved niche on the right of a chapter card. Leaves the recess open for a relief."""
    x0, x1, y0, y1 = 950, 1470, 70, 830
    rr = (x1 - x0) / 2
    a.circle(NX, NY, 430, fill=a.radial([(0, acc, 0.5), (0.5, acc, 0.14), (1, acc, 0)]))
    outer = f"M{x0},{y1} V{y0 + rr} A{rr},{rr} 0 0 1 {x1},{y0 + rr} V{y1}Z"
    R(a, outer, k=4)
    cl = a.clip(f'<path d="{outer}"/>')
    kit.grain(a, x0, y0, x1 - x0, y1 - y0, cl)
    kit.cracks(a, x0, y0, x1 - x0, y1 - y0, n=9, length=200, clip=cl)
    m = 44
    inner = f"M{x0 + m},{y1 - m} V{y0 + rr} A{rr - m},{rr - m} 0 0 1 {x1 - m},{y0 + rr} V{y1 - m}Z"
    a.path(inner, fill="none", stroke=kit.silver_grad(a), stroke_width=16)
    a.path(inner, fill="none", stroke="#05060d", stroke_width=3, transform="translate(6,7)", opacity=0.7)
    a.path(inner, fill=a.gradient([(0, "#0b0d1a"), (1, "#1a1d3a")]))
    a.path(inner, fill=a.radial([(0, acc, 0.42), (0.6, acc, 0.1), (1, acc, 0)], 0.5, 0.6, 0.7))
    icl = a.clip(f'<path d="{inner}"/>')
    a.open("g", clip_path=icl)
    a.stipple(x0 + m, y0 + m, x1 - x0 - 2 * m, y1 - y0 - 2 * m, n=110, r=(0.5, 1.5), fill=BONE, opacity=0.7)
    a.close()
    # studs round the silver band, and a keystone
    for k in range(9):
        an = math.pi + k * math.pi / 8
        sx, sy = NX + (rr - m) * math.cos(an), y0 + rr + (rr - m) * math.sin(an)
        R(a, f"M{f(sx - 6)},{f(sy)} a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0z", k=1.2)
    R(a, f"M{NX - 30},{y0 - 14} L{NX + 30},{y0 - 14} L{NX + 20},{y0 + 40} L{NX - 20},{y0 + 40}Z", kit.silver_grad(a), k=2.5)
    a.circle(NX, y0 + 12, 9, fill=acc)
    R(a, f"M{x0 - 24},{y1} H{x1 + 24} L{x1 + 10},{y1 + 34} H{x0 - 10}Z", k=3)
    return icl


def e_tree(a, acc):
    twigs = [(-117, 355, -1), (124, 340, 1), (-6, 306, 1)]
    for dx, by, sd in twigs:   # twigs first, so the boughs overlap their feet
        bx = NX + dx
        R(a, f"M{bx - 9},{by + 8} L{bx + sd * 34},{by - 86} L{bx + 9},{by + 8}Z", k=1.6)
        R(a, f"M{bx - 8},{by + 8} L{bx - sd * 22},{by - 70} L{bx + 8},{by + 8}Z", kit.bone_grad(a, True), k=1.6)
    R(a, f"M{NX - 60},760 Q{NX - 26},640 {NX - 34},520 Q{NX - 70},430 {NX - 130},360 L{NX - 104},350 Q{NX - 50},400 {NX - 22},470 L{NX - 16},300 L{NX + 4},300 "
         f"L{NX + 14},470 Q{NX + 40},380 {NX + 116},330 L{NX + 132},350 Q{NX + 66},420 {NX + 40},520 Q{NX + 30},650 {NX + 70},760Z", k=3)
    R(a, f"M{NX - 60},760 q-40,-10 -90,6 l0,10 h150z M{NX + 70},760 q40,-12 84,8 l0,8 h-140z", kit.bone_grad(a, True), k=2)   # roots
    bark = "".join(f"M{NX - 40 + k * 14},{750 - (k % 3) * 20} q{6 - k % 4 * 4},-70 {-4 + k % 3 * 5},{-150 - k * 9}" for k in range(7))
    a.path(bark, fill="none", stroke="#6d6552", stroke_width=1.3, opacity=0.7)
    crack_glow(a, NX - 4, 310, 1.57, 420, acc, 3.2, 0.2)


def e_wing(a, acc):
    sx, sy = NX + 130, 270   # the shoulder; the wing hangs from it, primaries nearly brushing the floor
    for k in range(10):
        ang = 96 + k * 8.5
        ln = 430 - k * 26 - (40 if k == 0 else 0)
        wd = 24 - k * 0.8
        R(a, f"M0,0 Q{f(ln * 0.5)},{f(-wd)} {f(ln)},0 Q{f(ln * 0.5)},{f(wd)} 0,0Z", kit.silver_grad(a) if k % 2 else kit.bone_grad(a), k=2.2,
          transform=f"translate({f(sx - k * 26)},{f(sy + k * 3)}) rotate({f(ang)})")
        a.path(f"M0,0 H{f(ln * 0.92)}", stroke=INK, stroke_width=1, opacity=0.5, transform=f"translate({f(sx - k * 26)},{f(sy + k * 3)}) rotate({f(ang)})")
    R(a, f"M{sx + 24},{sy - 14} Q{NX - 20},{sy - 80} {NX - 150},{sy + 26} Q{NX - 156},{sy + 50} {NX - 136},{sy + 54} Q{NX - 20},{sy - 26} {sx + 20},{sy + 22}Z", k=3)
    R(a, f"M{sx + 4},{sy + 2} a16,16 0 1,0 32,0 a16,16 0 1,0 -32,0z", kit.silver_grad(a), k=2)
    # one feather fallen
    R(a, "M0,0 Q60,-18 124,0 Q60,18 0,0Z", k=2, transform=f"translate({NX + 20},{742}) rotate(-8)")
    a.path("M0,0 H116", stroke=INK, stroke_width=1, opacity=0.5, transform=f"translate({NX + 20},{742}) rotate(-8)")


def e_heart(a, acc):
    a.circle(NX, 450, 170, fill=a.radial([(0, acc, 0.6), (1, acc, 0)]))
    top, pts = (NX, 250), [(NX - 100, 380), (NX - 40, 340), (NX + 50, 340), (NX + 104, 390)]
    low = [(NX - 80, 560), (NX - 10, 640), (NX + 76, 570)]
    tones = [kit.bone_grad(a), kit.silver_grad(a), kit.bone_grad(a, True)]
    for k in range(3):
        R(a, kit.pd([top, pts[k], pts[k + 1]]), tones[k], k=2)
    R(a, kit.pd([pts[0], pts[1], low[1], low[0]]), tones[0], k=2)
    R(a, kit.pd([pts[1], pts[2], low[1]]), tones[1], k=2)
    R(a, kit.pd([pts[2], pts[3], low[2], low[1]]), tones[2], k=2)
    a.path(kit.pd([pts[1], pts[2], low[1]]), fill=acc, opacity=0.45)
    crack_glow(a, NX - 20, 350, 1.3, 240, acc, 2.4)
    R(a, f"M{NX - 130},700 L{NX - 90},640 H{NX + 90} L{NX + 130},700 V760 H{NX - 130}Z", k=3)


def e_monolith(a, acc):
    R(a, f"M{NX - 90},760 L{NX - 76},240 L{NX},180 L{NX + 76},240 L{NX + 90},760Z", kit.bone_grad(a, True), k=3.5)
    r = a.rng
    for row in range(4):
        for col in range(4):
            gx, gy = NX - 54 + col * 36, 290 + row * 104
            if row == 3:   # the fourth row: nothing in it holds
                a.ellipse(gx, gy + 24, 12, 26, fill=acc, opacity=0.35, filter=a.blur(5))
                continue
            d = f"M{gx - 10},{gy} q10,-12 20,0 M{gx},{gy + 4} v{f(r.uniform(26, 40))} M{gx - 9},{gy + 52} h18 M{gx + 13},{gy + 26} l5,5"
            a.path(d, fill="none", stroke="#05060d", stroke_width=5, stroke_linecap="round", opacity=0.9)
            a.path(d, fill="none", stroke="#fff", stroke_width=1.2, stroke_linecap="round", opacity=0.7, transform="translate(1.6,2)")
    for k in range(3):
        R(a, f"M{NX - 190},{770 - k * 16} q48,-26 96,0 t96,0 t96,0 t92,0 v16 H{NX - 190}Z", kit.silver_grad(a), k=1.5)


def e_mask(a, acc):
    R(a, f"M{NX + 100},240 L{NX + 116},256 L{NX - 86},700 L{NX - 108},708 L{NX - 104},684Z", kit.silver_grad(a), k=2.4)   # the hunter's blade
    R(a, f"M{NX},250 Q{NX + 130},260 {NX + 126},440 Q{NX + 116},620 {NX},700 Q{NX - 116},620 {NX - 126},440 Q{NX - 130},260 {NX},250Z", k=4)
    cl = a.clip(f'<path d="M{NX},250 Q{NX + 130},260 {NX + 126},440 Q{NX + 116},620 {NX},700 Q{NX - 116},620 {NX - 126},440 Q{NX - 130},260 {NX},250Z"/>')
    kit.cracks(a, NX - 120, 260, 240, 420, n=6, length=160, clip=cl, width=1.2)
    for sd in (-1, 1):   # blank: two slits and nothing else
        a.path(f"M{NX + sd * 30},420 q{sd * 26},-10 {sd * 50},0 q{sd * -26},8 {sd * -50},0z", fill="#05060d")
        a.path(f"M{NX + sd * 30},420 q{sd * 26},8 {sd * 50},0", fill="none", stroke=acc, stroke_width=2, opacity=0.9)


def sigil_lines(cx, cy, s):
    stars = {st["id"]: st for c in STAR["pages"][0]["constellations"] for st in c["stars"]}
    M = lambda q: (cx + (stars[q]["x"] - 45) * s, cy - (stars[q]["y"] - 55) * s)
    return [(M(p), M(q)) for p, q in STAR["pages"][0]["sigil"]["lines"]]


def e_sigil(a, acc):
    R(a, f"M{NX - 170},{NY} a170,170 0 1,0 340,0 a170,170 0 1,0 -340,0z M{NX - 150},{NY} a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0z", kit.silver_grad(a), k=3, fill_rule="evenodd")
    ln = sigil_lines(NX, NY, 3.6)
    for (x1, y1), (x2, y2) in ln:
        a.line(x1 + 3, y1 + 4, x2 + 3, y2 + 4, stroke="#05060d", stroke_width=10, stroke_linecap="round", opacity=0.8)
        a.line(x1 - 1.4, y1 - 2, x2 - 1.4, y2 - 2, stroke="#fff", stroke_width=9, stroke_linecap="round")
        a.line(x1, y1, x2, y2, stroke=BONE, stroke_width=9, stroke_linecap="round")
    for (x1, y1), _ in ln:
        a.poly(a.star_pts(x1, y1, 20, 5, n=4), fill=acc, stroke=INK, stroke_width=1)
    a.poly(a.star_pts(ln[-1][1][0], ln[-1][1][1], 20, 5, n=4), fill=acc, stroke=INK, stroke_width=1)


def e_roads(a, acc):
    for i, realm in enumerate(kit.REALMS):
        an = math.radians(-90 + i * 60)
        x, y = NX + 200 * math.cos(an), NY + 30 + 250 * math.sin(an)
        nx, ny = -math.sin(an) * 11, math.cos(an) * 11
        R(a, kit.pd([(x - nx, y - ny), (x + nx, y + ny), (NX + nx * 0.2, NY + 30 + ny * 0.2), (NX - nx * 0.2, NY + 30 - ny * 0.2)]), k=2)
        a.circle(x, y, 34, fill=realm["acc"], opacity=0.5, filter=a.blur(8))
        R(a, f"M{f(x - 26)},{f(y)} a26,26 0 1,0 52,0 a26,26 0 1,0 -52,0z", kit.silver_grad(a), k=2)
        kit.emblem(a, i, x, y, 15, realm["acc"], line=INK, raised=False)
    R(a, f"M{NX - 34},{NY + 30} a34,34 0 1,0 68,0 a34,34 0 1,0 -68,0z", k=3)
    crack_glow(a, NX - 20, NY + 14, 0.6, 50, VIOLET, 2)


def e_moot(a, acc):
    for k, (dx, hgt) in enumerate(((-150, 150), (-96, 190), (96, 190), (150, 150))):   # tents
        x = NX + dx
        R(a, f"M{x - 50},700 L{x},{700 - hgt} L{x + 50},700Z", kit.silver_grad(a) if k % 2 else kit.bone_grad(a, True), k=2.4)
        a.path(f"M{x},{700 - hgt} L{x},700", stroke=INK, stroke_width=1.2)
        R(a, f"M{x},{700 - hgt} v-50 l30,10 l-30,12z", k=1.2)
    a.circle(NX, 560, 190, fill=a.radial([(0, acc, 0.7), (1, acc, 0)]))
    R(a, f"M{NX},330 Q{NX + 96},470 {NX + 64},600 Q{NX + 50},680 {NX},700 Q{NX - 50},680 {NX - 64},600 Q{NX - 80},500 {NX - 30},440 Q{NX - 26},500 {NX - 4},500 Q{NX + 20},420 {NX},330Z", k=3)
    a.path(f"M{NX},470 Q{NX + 44},560 {NX + 30},630 Q{NX + 20},680 {NX},690 Q{NX - 24},676 {NX - 30},630 Q{NX - 30},580 {NX},470Z", fill=acc, opacity=0.8)
    for sd in (-1, 1):
        R(a, f"M{NX - sd * 110},740 L{NX + sd * 100},700 L{NX + sd * 106},716 L{NX - sd * 104},756Z", kit.bone_grad(a, True), k=2)


def e_list(a, acc):
    R(a, f"M{NX - 130},240 L{NX + 120},226 L{NX + 136},700 L{NX - 120},716Z", kit.bone_grad(a, True), k=3.5)
    r = a.rng
    for row in range(5):
        y = 300 + row * 82
        d = "".join(f"M{NX - 94 + c * 48},{y} v{f(r.uniform(22, 36))} m-8,-18 h{f(r.uniform(12, 20))}" for c in range(4))
        a.path(d, fill="none", stroke="#05060d", stroke_width=5, stroke_linecap="round")
        a.path(d, fill="none", stroke="#fff", stroke_width=1.1, stroke_linecap="round", opacity=0.6, transform="translate(1.5,2)")
        R(a, f"M{NX + 104},{y + 4} a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0z", kit.silver_grad(a), k=1.2)
    a.rect(NX - 116, 618, 240, 60, fill=acc, opacity=0.3, filter=a.blur(8))   # the fifth row
    crack_glow(a, NX - 120, 500, 0.1, 230, acc, 2.2)


def e_choir(a, acc):
    for k in range(5):
        s = 1 - k * 0.14
        y = 760 - k * 26
        for sd in (-1, 1):
            R(a, f"M{NX + sd * 190 * s},{y} Q{NX + sd * 210 * s},{y - 330 * s} {NX + sd * 14},{y - 470 * s} L{NX + sd * 6},{y - 448 * s} Q{NX + sd * 172 * s},{y - 320 * s} {NX + sd * 162 * s},{y}Z",
              kit.bone_grad(a, k % 2 == 1), k=2.4)
    a.circle(NX, 640, 90, fill=a.radial([(0, acc, 0.8), (1, acc, 0)]))
    wl = [(NX - 150 + k * 10, 800 - 0 + 0 * k) for k in range(2)]
    d = "M" + " L".join(f"{f(NX - 150 + k * 6)},{f(660 + 22 * math.sin(k * 0.5) * math.sin(k / 50 * math.pi))}" for k in range(51))
    a.path(d, fill="none", stroke=kit.shade(acc, 0.4), stroke_width=2.5)


def e_expanse(a, acc):
    r = a.rng
    for k in range(6):
        rr = 40 + k * 34
        a.circle(NX + 60, 330, rr, fill="none", stroke=kit.shade(acc, 0.45), stroke_width=2.2 - k * 0.25, stroke_dasharray=f"{24 + k * 10} {12 + k * 6}", opacity=0.9 - k * 0.1,
                 transform=f"rotate({f(r.uniform(0, 360))} {NX + 60} 330)")
    for x, y, wd in ((NX - 110, 640, 150), (NX + 30, 540, 130), (NX + 120, 700, 110), (NX - 60, 440, 90)):
        R(a, f"M{x - wd / 2},{y} L{x - wd * .3},{y - 12} L{x + wd * .3},{y - 12} L{x + wd / 2},{y} L{x + wd * .2},{y + 50} L{x},{y + 100} L{x - wd * .28},{y + 44}Z",
          kit.bone_grad(a, x > NX), k=2.4)
    R(a, f"M{NX - 118},628 v-70 l10,-20 l10,20 v70z M{NX - 150},628 v-40 l8,-14 l8,14 v40z", kit.silver_grad(a), k=1.5)
    R(a, f"M{NX + 14},528 q-4,-40 16,-60 q20,20 16,60z", kit.silver_grad(a), k=1.5)


def e_choice(a, acc):
    a.rect(NX - 26, 150, 52, 620, fill=a.gradient([(0, "#ffffff"), (0.5, acc), (1, "#ffffff")], 0, 0, 1, 0), opacity=0.75, filter=a.blur(10))
    a.rect(NX - 7, 150, 14, 620, fill="#fff", opacity=0.9, filter=a.blur(3))
    # the King of Dragons: a skeletal wyrm seated, wings folded down before it like two leaves
    kx = NX - 122
    R(a, f"M{kx - 62},770 V664 H{kx + 62} V770Z", kit.bone_grad(a, True), k=2.4)
    R(a, f"M{kx - 12},664 L{kx - 16},400 Q{kx - 20},340 {kx - 2},316 L{kx + 14},316 Q{kx + 10},350 {kx + 14},400 L{kx + 12},664Z", k=2.4)   # the spine
    for k in range(6):   # ribs
        y = 430 + k * 26
        wd = 44 - abs(k - 2) * 5
        for sd in (-1, 1):
            R(a, f"M{kx},{y} Q{kx + sd * wd},{y - 8} {kx + sd * wd},{y + 20} L{kx + sd * (wd - 7)},{y + 20} Q{kx + sd * (wd - 8)},{y + 2} {kx},{y + 8}Z", kit.bone_grad(a, k % 2 == 0), k=1.3)
    R(a, f"M{kx - 22},318 L{kx - 34},276 L{kx - 8},262 L{kx + 34},276 L{kx + 46},298 L{kx + 14},318Z", k=2.4)   # the skull
    R(a, f"M{kx - 30},278 L{kx - 52},236 L{kx - 16},264Z M{kx - 8},262 L{kx - 14},222 L{kx + 6},262Z", k=1.6)
    a.circle(kx + 8, 286, 5, fill="#05060d")
    for sd in (-1, 1):
        R(a, f"M{kx + sd * 54},470 Q{kx + sd * 84},600 {kx - sd * 14},770 L{kx - sd * 34},770 Q{kx + sd * 36},620 {kx + sd * 34},474Z", kit.bone_grad(a, sd > 0), k=2.4)
    # the Queen of Elves: robed, hands open
    qx = NX + 126
    R(a, f"M{qx - 70},770 L{qx - 28},330 H{qx + 28} L{qx + 70},770Z", kit.silver_grad(a), k=3)
    for sd in (-1, 1):
        R(a, f"M{qx + sd * 24},346 L{qx + sd * 84},410 L{qx + sd * 78},560 L{qx + sd * 52},450 L{qx + sd * 26},420Z", kit.silver_grad(a), k=2)
        R(a, f"M{qx + sd * 80},412 l{sd * 12},-30 l{sd * 6},2 l{sd * -6},32z", k=1.4)
        R(a, f"M{qx + sd * 20},262 L{qx + sd * 54},240 L{qx + sd * 22},284Z", k=1.4)
    R(a, f"M{qx - 24},330 Q{qx - 30},240 {qx},232 Q{qx + 30},240 {qx + 24},330Z", kit.silver_grad(a), k=2)
    R(a, f"M{qx - 17},282 Q{qx - 18},250 {qx},248 Q{qx + 18},250 {qx + 17},282 Q{qx + 12},306 {qx},310 Q{qx - 12},306 {qx - 17},282Z", k=1.6)
    folds = "".join(f"M{qx - 40 + k * 16},{420 + abs(k - 2.5) * 10} L{qx - 56 + k * 22},764" for k in range(6))
    a.path(folds, fill="none", stroke=INK, stroke_width=1.1, opacity=0.6)
    R(a, f"M{NX - 30},774 l30,-12 l30,12 l-30,10z", k=1.6)   # the Record, open


CH = [("West · Cedarheart Forest", 0, e_tree, "a split tree, its crack lit moss green"),
      ("North · Galewing Peaks", 1, e_wing, "a wing hanging from its shoulder and one fallen feather"),
      ("South · Mosswhisper Depths", 2, e_heart, "the Heartstone on its plinth, cracking, molten light inside"),
      ("East · Tidecaller Shores", 3, e_monolith, "the monolith over the waves, its fourth row of glyphs gone"),
      ("Below · Duskbane Underworld", 4, e_mask, "a blank Remnant mask crossed by a hunter's blade"),
      ("Above · the High Realm", 5, e_sigil, "the Sigil of Izladar inlaid in a silver ring, a gold star at each joint"),
      ("Convergence", GOLD, e_roads, "six roads, each from its realm's seal, meeting at one cracked boss"),
      ("The Rim of Wrymreach", kit.MOLTEN, e_moot, "Ilvarra's fire among the delegations' tents"),
      ("The Moot at dawn", SILVER, e_list, "the kill-list slate, five rows, the fifth lit"),
      ("Wrymreach · the Bone Choir", GOLD, e_choir, "a nave of wyrm ribs with one line of sound through it"),
      ("The Astral Expanse", VIOLET, e_expanse, "floating ground that holds only what was recorded, under the broken rings of the voice"),
      ("The heart of the wound", "#b9a2ee", e_choice, "the statues of the King of Dragons and the Queen of Elves either side of a column of light, the Record open between them")]


def chapter_frame(a, acc, numeral, kicker, lines, sub, pip=0):
    kit.void(a, glow=(acc, 0.76, 0.5, 0.55), stars=380, big=8)
    # left: numeral, title, place
    kit.carved_text(a, 120, 300, numeral, 170, anchor="start", spacing=6, k=2.6)
    a.text(124, 132, kicker, size=22, family="serif", fill=SILVER, letter_spacing=10)
    a.line(124, 152, 560, 152, stroke=SILVER, stroke_width=1.2, opacity=0.8)
    y = 420
    size = 76 if max(len(s) for s in lines) <= 13 else 64
    for s in lines:
        kit.carved_text(a, 120, y, s.upper(), size, anchor="start", spacing=5, k=2)
        y += size * 1.18
    a.text(124, y + 6, sub.upper(), size=22, family="serif", fill=kit.shade(acc, 0.25), letter_spacing=6)
    # twelve pips: where this chapter falls
    for k in range(12):
        px = 132 + k * 34
        if numeral and k == pip:
            a.circle(px, 748, 15, fill=acc, opacity=0.6, filter=a.blur(5))
        R(a, f"M{px - 7},748 L{px},741 L{px + 7},748 L{px},755Z", acc if k == pip else (kit.bone_grad(a) if k < pip else kit.silver_grad(a)), k=1.1)
    # a crack divider along the foot
    R(a, "M120,792 H820 L812,806 H128Z", k=1.6)
    d = kit.crack_d(a.rng, 130, 799, 0.0, 660, 16, 0.12)
    a.path(d, fill="none", stroke=INK, stroke_width=1.4)


def split_title(t):
    w = t.split()
    if len(t) <= 13:
        return [t]
    best = min(range(1, len(w)), key=lambda i: abs(len(" ".join(w[:i])) - len(" ".join(w[i:]))))
    return [" ".join(w[:best]), " ".join(w[best:])]


def reg_chapter(n, ch):
    sub, acc_i, fn, what = CH[n - 1]
    acc = kit.REALMS[acc_i]["acc"] if isinstance(acc_i, int) else acc_i
    name = ch["title"].replace(" (added)", "")

    @asset(G, f"chapter-{n:02d}", group="chapters", title=f"Chapter {n}: {name}", w=1600, h=900, row="Chapter cards")
    def draw(a: Art):
        chapter_frame(a, acc, kit.ROMAN[n], f"CHAPTER {n}", split_title(name), sub, pip=n - 1)
        niche(a, acc)
        fn(a, acc)
    draw.__doc__ = f"Chapter card {n}, {name}: bone capitals on a starry void, and in a carved niche of bone and tarnished silver, {what}."
    return draw


for _n, _ch in enumerate(GAME["chapters"], 1):
    reg_chapter(_n, _ch)


SEALS = [("first", "The first seal cracks", 2, "Mosswhisper Depths"), ("second", "The second seal cracks", 5, "the High Realm"),
         ("third", "The third seal cracks", None, "the Astral Expanse")]


def reg_seal(n, key, name, realm, where):
    @asset(G, f"chapter-seal-{key}", group="chapters", title=name, w=1600, h=900, row="Chapter cards")
    def draw(a: Art):
        acc = VIOLET
        kit.void(a, glow=(acc, 0.5, 0.48, 0.6), stars=380, big=8)
        cx, cy, R0 = 800, 400, 300
        a.circle(cx, cy, 380, fill=a.radial([(0.6, "#cdb8ff", 0.5), (1, "#cdb8ff", 0)]))
        disc = f"M{cx - R0},{cy} a{R0},{R0} 0 1,0 {2 * R0},0 a{R0},{R0} 0 1,0 {-2 * R0},0z"
        R(a, disc, k=5)
        cl = a.clip(f'<path d="{disc}"/>')
        kit.grain(a, cx - R0, cy - R0, 2 * R0, 2 * R0, cl)
        a.circle(cx, cy, R0 - 30, fill="none", stroke=kit.silver_grad(a), stroke_width=14)
        a.circle(cx, cy, 178, fill="none", stroke=kit.silver_grad(a), stroke_width=8)
        a.circle(cx, cy, 170, fill="#12142a")
        for (x1, y1), (x2, y2) in sigil_lines(cx, cy, 3.3):
            a.line(x1, y1, x2, y2, stroke=BONE, stroke_width=7, stroke_linecap="round")
            a.line(x1 - 1, y1 - 1.5, x2 - 1, y2 - 1.5, stroke="#fff", stroke_width=1.5, stroke_linecap="round", opacity=0.8)
        for i, rl in enumerate(kit.REALMS):
            an = math.radians(-90 + i * 60)
            ex, ey = cx + 226 * math.cos(an), cy + 226 * math.sin(an)
            R(a, f"M{f(ex - 34)},{f(ey)} a34,34 0 1,0 68,0 a34,34 0 1,0 -68,0z", kit.bone_grad(a, True), k=2)
            kit.emblem(a, i, ex, ey, 20, rl["acc"], line=INK)
        kit.cracks(a, cx - R0, cy - R0, 2 * R0, 2 * R0, n=8, length=150, clip=cl)
        # the cracks that count
        a.open("g", clip_path=cl)
        for k in range(n):
            an = [2.2, 5.3, 0.4][k]
            crack_glow(a, cx + 20 * math.cos(an), cy + 20 * math.sin(an), an, 330, "#cdb8ff", 4.2, 0.3)
        a.close()
        if n == 3:   # a shard gone from the rim
            an = 0.4
            px, py = cx + R0 * math.cos(an), cy + R0 * math.sin(an)
            a.poly([(px + 10, py - 70), (px - 60, py - 10), (px - 20, py + 60), (px + 30, py + 50)], fill=VOID)
            a.poly([(px + 10, py - 70), (px - 60, py - 10), (px - 20, py + 60), (px + 30, py + 50)], fill="#cdb8ff", opacity=0.35, filter=a.blur(6))
            R(a, kit.pd([(px + 70, py + 40), (px + 20, py + 90), (px + 60, py + 150), (px + 110, py + 110)]), k=2.4)
        kit.carved_text(a, 800, 800, name.upper(), 58, spacing=10, k=2)
        a.text(800, 846, where.upper(), size=22, family="serif", fill=kit.shade(kit.REALMS[realm]["acc"] if realm is not None else VIOLET, 0.3),
               text_anchor="middle", letter_spacing=8)
    draw.__doc__ = (f"Interstitial card, {name.lower()}: the seal as a bone disc ringed in tarnished silver, the six realms' emblems round the "
                    f"Sigil, with {['one crack', 'two cracks', 'three cracks and a shard gone from the rim'][n - 1]} letting violet-white light through.")
    return draw


for _n, (_key, _name, _realm, _where) in enumerate(SEALS, 1):
    reg_seal(_n, _key, _name, _realm, _where)


# ---- UI ornaments --------------------------------------------------------------------------------
UIROW = "UI ornaments (Record corners, realm seals, crack dividers, mask icon)"


def reg_ui_seal(i):
    realm = kit.REALMS[i]

    @asset(G, f"ui-seal-{realm['key']}", group="ui", title=f"Realm seal: {realm['name']}", w=200, h=200, row=UIROW)
    def draw(a: Art):
        kit.void(a, glow=(realm["acc"], 0.5, 0.5, 0.6), stars=40, big=1)
        R(a, "M12,100 a88,88 0 1,0 176,0 a88,88 0 1,0 -176,0z", k=3)
        cl = a.clip('<circle cx="100" cy="100" r="88"/>')
        kit.grain(a, 12, 12, 176, 176, cl)
        a.circle(100, 100, 70, fill="none", stroke=kit.silver_grad(a), stroke_width=9)
        a.circle(100, 100, 64, fill=a.radial([(0, kit.shade(realm["acc"], -0.35), 1), (1, "#0b0d1a", 1)], 0.5, 0.5, 0.6))
        kit.emblem(a, i, 100, 100, 40, BONE, line=INK)
        a.path(kit.EMBLEM[i], fill=realm["acc"], opacity=0.35, transform="translate(100,100) scale(40)")
        for k in range(12):
            an = math.radians(k * 30 + 15)
            a.circle(100 + 79.5 * math.cos(an), 100 + 79.5 * math.sin(an), 2.6, fill="#fff", opacity=0.9)
            a.circle(100 + 79.5 * math.cos(an) + 0.8, 100 + 79.5 * math.sin(an) + 1, 2.6, fill="#59606c")
        kit.cracks(a, 12, 12, 176, 176, n=3, length=60, clip=cl)
    draw.__doc__ = f"Realm seal for the HUD and the Record: the {realm['tribe']} tribe's emblem in carved bone on a silver-ringed boss, lit in the {realm['name']}'s colour."
    return draw


for _i in range(6):
    reg_ui_seal(_i)


@asset(G, "ui-seal-wrymreach", group="ui", title="Realm seal: Wrymreach", w=200, h=200, row=UIROW)
def ui_seal_wrymreach(a: Art):
    """The seventh seal, Wrymreach: a boss halved in sun gold and moon silver over bone, a wyrm's spine down the join and a
    crack through it."""
    kit.void(a, glow=(VIOLET, 0.5, 0.5, 0.6), stars=40, big=1)
    R(a, "M12,100 a88,88 0 1,0 176,0 a88,88 0 1,0 -176,0z", k=3)
    a.circle(100, 100, 70, fill="none", stroke=kit.silver_grad(a), stroke_width=9)
    a.path("M100,36 a64,64 0 0,0 0,128z", fill=kit.gold_grad(a))
    a.path("M100,36 a64,64 0 0,1 0,128z", fill=kit.silver_grad(a))
    for k in range(7):
        y = 52 + k * 16
        s = 0.6 + 0.4 * math.sin(k / 6 * math.pi)
        R(a, f"M{100 - 9 * s},{y - 5} q{9 * s},-6 {18 * s},0 l2,10 q{-11 * s},6 {-22 * s},0z", k=1.1)
    crack_glow(a, 92, 30, 1.5, 150, VIOLET, 1.6, 0.2)


def corner(a, crystal):
    kit.void(a, stars=50, big=1)
    R(a, "M14,14 H226 L206,54 H54 V206 L14,226Z", k=3)
    cl = a.clip('<path d="M14,14 H226 L206,54 H54 V206 L14,226Z"/>')
    kit.grain(a, 14, 14, 212, 212, cl)
    kit.cracks(a, 14, 14, 212, 212, n=5, length=70, clip=cl)
    a.path("M28,28 H196 M28,28 V196", fill="none", stroke=kit.silver_grad(a), stroke_width=5)
    a.path("M30,31 H196 M31,30 V196", fill="none", stroke="#05060d", stroke_width=1, opacity=0.7)
    R(a, "M64,64 Q128,70 150,128 Q120,104 96,104 Q104,124 128,150 Q70,128 64,64Z", kit.silver_grad(a), k=2)   # a claw of the wyrm, holding the page
    for x, y in ((206, 34), (34, 206)):
        R(a, f"M{x - 7},{y} a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0z", kit.silver_grad(a), k=1.2)
    if crystal:
        a.circle(44, 44, 40, fill=a.radial([(0, GOLD, 0.7), (1, GOLD, 0)]))
        R(a, "M44,18 L62,36 L56,62 L32,62 L26,36Z", kit.gold_grad(a), k=1.6)
        a.path("M44,18 L44,62 M26,36 L62,36", fill="none", stroke=INK, stroke_width=0.9, opacity=0.6)
    else:
        R(a, "M30,44 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0z", k=1.6)
        a.circle(44, 44, 5, fill=VOID)


@asset(G, "ui-record-corner", group="ui", title="Record corner", w=240, h=240, row=UIROW)
def ui_corner(a: Art):
    """Corner ornament for the Record's pages: an L of cracked bone inlaid with a silver line, a silver wyrm's claw curling out
    of the angle to hold the page. Mirror it for the other three corners."""
    corner(a, False)


@asset(G, "ui-record-corner-crystal", group="ui", title="Record corner with a memory crystal", w=240, h=240, row=UIROW)
def ui_corner_crystal(a: Art):
    """The Record's corner when an entry has been kept: the same cracked bone and silver claw, with a lit memory crystal set in
    the angle in star gold."""
    corner(a, True)


def reg_divider(n, what):
    @asset(G, f"ui-divider-crack-{n}", group="ui", title=f"Crack divider {n}", w=600, h=120, row=UIROW)
    def draw(a: Art):
        r = a.rng
        kit.void(a, stars=60, big=1)
        if n == 1:
            R(a, "M30,52 H570 L556,68 H44Z", k=2)
            R(a, "M300,34 L330,60 L300,86 L270,60Z", kit.silver_grad(a), k=2)
            d = kit.crack_d(r, 40, 60, 0, 220, 12, 0.2) + kit.crack_d(r, 560, 60, math.pi, 220, 12, 0.2)
            a.path(d, fill="none", stroke=INK, stroke_width=1.3)
        elif n == 2:
            for k in range(15):
                x = 48 + k * 36
                s = 0.7 + 0.5 * math.sin(k / 14 * math.pi)
                R(a, f"M{f(x - 12 * s)},{f(60 - 9 * s)} q{f(12 * s)},{f(-9 * s)} {f(24 * s)},0 l{f(3 * s)},{f(17 * s)} q{f(-15 * s)},{f(10 * s)} {f(-30 * s)},0z", k=1.6)
                R(a, f"M{x - 2},{f(60 - 11 * s)} l2,{f(-16 * s)} l2,{f(16 * s)}z", kit.silver_grad(a), k=1)
        else:
            R(a, "M30,50 H286 L300,60 L286,70 H30Z", k=2)
            R(a, "M570,50 H326 L312,60 L326,70 H570Z", k=2)
            crack_glow(a, 20, 60, 0.0, 560, VIOLET, 2.2, 0.16)
            a.circle(306, 60, 26, fill=a.radial([(0, "#cdb8ff", 0.9), (1, "#cdb8ff", 0)]))
    draw.__doc__ = f"Divider for pages and menus: {what}."
    return draw


for _n, _what in ((1, "a bar of bone with a silver lozenge at its centre, cracked from both ends"),
                  (2, "a wyrm's spine, vertebra by vertebra, each with a silver process"),
                  (3, "a bone bar broken in the middle, violet light through the break")):
    reg_divider(_n, _what)


MASK = "M100,22 Q164,26 162,96 Q158,160 100,184 Q42,160 38,96 Q36,26 100,22Z"


@asset(G, "ui-mask", group="ui", title="Mask icon", w=200, h=200, row=UIROW)
def ui_mask(a: Art):
    """The Remnants' mask as an icon: a blank oval of bone with two slits, no mouth, a strap of tarnished silver. No face is
    shown behind it."""
    kit.void(a, glow=(VIOLET, 0.5, 0.5, 0.6), stars=40, big=1)
    R(a, "M30,84 L170,84 L172,100 L28,100Z", kit.silver_grad(a), k=1.6)
    R(a, MASK, k=3.4)
    cl = a.clip(f'<path d="{MASK}"/>')
    kit.grain(a, 36, 20, 128, 166, cl)
    a.path("M100,26 Q150,60 140,150", fill="none", stroke="#8c8573", stroke_width=14, opacity=0.25, clip_path=cl, filter=a.blur(6))
    for sd in (-1, 1):
        a.path(f"M{100 + sd * 14},92 q{sd * 16},-6 {sd * 34},0 q{sd * -16},6 {sd * -34},0z", fill="#05060d")
    kit.cracks(a, 40, 24, 120, 150, n=4, length=70, clip=cl)


@asset(G, "ui-record-header", group="ui", title="Record header plaque", w=600, h=120, row=UIROW)
def ui_header(a: Art):
    """Header plaque for the Record: a bone slab with silver end-caps and the six realm studs, lettered THE RECORD in carved
    capitals."""
    kit.void(a, stars=60, big=1)
    kit.slab(a, 40, 24, 520, 72, rx=10, n_cracks=5)
    for x in (40, 536):
        R(a, f"M{x},24 h24 v72 h-24z", kit.silver_grad(a), k=1.6)
    a.text(300, 72, "THE RECORD", size=38, family="serif", fill="#ffffff", text_anchor="middle", letter_spacing=10, font_weight="bold", opacity=0.9, transform="translate(1.4,1.8)")
    a.text(300, 72, "THE RECORD", size=38, family="serif", fill="#2a2a34", text_anchor="middle", letter_spacing=10, font_weight="bold")
    for i, realm in enumerate(kit.REALMS):
        a.circle(210 + i * 36, 88, 3.4, fill=realm["acc"], stroke=INK, stroke_width=0.8)


# ---- the thread ----------------------------------------------------------------------------------
@asset(G, "thread-own", group="thread", title="Thread: a name on the inside of a mask", w=480, h=480, row="Thread")
def thread_own(a: Art):
    """This game's thread object: a Remnant's blank mask lying face down, seen from the inside, where only its wearer could
    read the name scratched into the bone: Dorrin Vael."""
    kit.void(a, glow=(kit.MOLTEN, 0.5, 0.62, 0.55), stars=150, big=4)
    out = "M240,60 Q372,70 366,226 Q356,372 240,424 Q124,372 114,226 Q108,70 240,60Z"
    a.path(out, fill="#000", opacity=0.6, filter=a.blur(12), transform="translate(12,18)")
    # straps
    for sd in (-1, 1):
        R(a, f"M{240 + sd * 122},200 Q{240 + sd * 200},190 {240 + sd * 222},260 L{240 + sd * 208},268 Q{240 + sd * 190},214 {240 + sd * 124},222Z", kit.silver_grad(a), k=2)
    R(a, out, k=4)
    # the hollow: darker toward the middle, rim light on the lower lip
    inner = "M240,84 Q350,94 344,226 Q334,352 240,398 Q146,352 136,226 Q130,94 240,84Z"
    a.path(inner, fill=a.radial([(0, "#6f6753", 1), (0.7, "#b0a78f", 1), (1, "#d9d1bc", 1)], 0.5, 0.42, 0.62))
    cl = a.clip(f'<path d="{inner}"/>')
    kit.grain(a, 130, 80, 220, 320, cl, alpha=0.3)
    a.path("M150,290 Q240,410 330,290", fill="none", stroke="#fff", stroke_width=5, opacity=0.5, clip_path=cl, filter=a.blur(3))
    for sd in (-1, 1):   # the slits, from behind: the void through them
        a.path(f"M{240 + sd * 26},206 q{sd * 28},-12 {sd * 62},0 q{sd * -28},12 {sd * -62},0z", fill=VOID, stroke="#3d382c", stroke_width=2)
        a.circle(240 + sd * 58, 205, 1.5, fill=BONE)
    a.path("M240,214 q-12,40 0,62 q12,-22 0,-62", fill="#8c8470", opacity=0.6)   # the hollow of the nose
    kit.cracks(a, 140, 90, 200, 300, n=5, length=110, clip=cl)
    # the name, scratched small where the brow rests
    for dx, dy, col, op in ((1.2, 1.4, "#f4eede", 0.7), (0, 0, "#2a251b", 0.95)):
        a.text(240 + dx, 150 + dy, "Dorrin Vael", size=27, family="cursive", fill=col, text_anchor="middle", opacity=op, transform="rotate(-4 240 150)")
    a.path("M176,162 q60,10 126,-6", fill="none", stroke="#2a251b", stroke_width=1.1, opacity=0.8)


@asset(G, "thread-guest", group="thread", title="Thread guest: a small felt cat with button eyes", w=480, h=480, row="Thread")
def thread_guest(a: Art):
    """The collection ring's guest in this game: a small felt cat with button eyes, set in a carved bone niche like any other
    keepsake at the Moot, in cold rim light with one ember-coloured glow."""
    kit.void(a, glow=(kit.MOLTEN, 0.5, 0.7, 0.5), stars=150, big=4)
    outer = "M90,440 V220 A150,150 0 0 1 390,220 V440Z"
    R(a, outer, k=4)
    cl = a.clip(f'<path d="{outer}"/>')
    kit.grain(a, 90, 70, 300, 370, cl)
    kit.cracks(a, 90, 70, 300, 370, n=7, length=120, clip=cl)
    inner = "M126,410 V222 A114,114 0 0 1 354,222 V410Z"
    a.path(inner, fill="none", stroke=kit.silver_grad(a), stroke_width=10)
    a.path(inner, fill=a.gradient([(0, "#0b0d1a"), (1, "#23203a")]))
    a.path(inner, fill=a.radial([(0, kit.MOLTEN, 0.4), (1, kit.MOLTEN, 0)], 0.5, 0.9, 0.6))
    R(a, "M70,440 H410 L396,468 H84Z", k=3)
    # the cat: grey felt, seams stitched, two silver buttons
    felt = a.gradient([(0, "#b3b8c2"), (0.6, "#7d8490"), (1, "#4a4f5a")], 0, 0, 1, 1)
    a.ellipse(244, 410, 96, 10, fill="#000", opacity=0.6, filter=a.blur(5))
    tail = "M300,390 Q356,384 346,318 Q340,292 326,304 Q336,356 296,366Z"
    body = "M180,408 Q166,300 240,290 Q314,300 300,408Z"
    head = "M184,250 L176,176 L214,208 Q240,198 266,208 L304,176 L296,250 Q296,304 240,306 Q184,304 184,250Z"
    for d in (tail, body, head):
        a.path(d, fill="#05060d", opacity=0.7, transform="translate(3,4)")
        a.path(d, fill="#eef2f8", transform="translate(-2,-2.4)")
        a.path(d, fill=felt)
    fid = a.uid("felt")
    a.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7"/>'
           f'<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -0.55"/></filter>')
    fc = a.clip(f'<path d="{tail} {body} {head}"/>')
    a.rect(160, 160, 200, 260, filter=f"url(#{fid})", clip_path=fc, opacity=0.5)
    st = dict(stroke="#2a2c34", stroke_width=2, fill="none", stroke_linecap="round", stroke_dasharray="7 5")
    a.path("M190,250 L182,186 L212,212 M290,250 L298,186 L268,212 M240,304 V400 M190,400 Q180,310 240,298 Q300,310 290,400", **st)
    for sd in (-1, 1):   # button eyes: four holes and a cross of thread
        bx = 240 + sd * 26
        a.circle(bx + 1.5, 250 + 2, 13, fill="#05060d", opacity=0.7)
        a.circle(bx, 250, 13, fill=kit.silver_grad(a), stroke="#eef2f8", stroke_width=1.2)
        a.circle(bx, 250, 8.5, fill="none", stroke="#3a404c", stroke_width=1)
        for hx, hy in ((-3.4, -3.4), (3.4, -3.4), (-3.4, 3.4), (3.4, 3.4)):
            a.circle(bx + hx, 250 + hy, 1.5, fill="#0b0d1a")
        a.path(f"M{bx - 3.4},{250 - 3.4} L{bx + 3.4},{250 + 3.4} M{bx + 3.4},{250 - 3.4} L{bx - 3.4},{250 + 3.4}", stroke=BONE, stroke_width=1.3)
    a.path("M234,272 h12 l-6,7z", fill="#2a2c34")
    a.path("M240,279 v7 M240,286 q-8,8 -16,2 M240,286 q8,8 16,2", stroke="#2a2c34", stroke_width=1.8, fill="none", stroke_linecap="round")
    for sd in (-1, 1):
        a.path(f"M{240 + sd * 20},276 l{sd * 34},-6 M{240 + sd * 20},282 l{sd * 34},4", stroke=BONE, stroke_width=1, opacity=0.8)

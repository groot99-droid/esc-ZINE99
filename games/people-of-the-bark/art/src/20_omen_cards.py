"""The Omen Spread's cards, in marginalia drolleries: 18 Omen faces, 9 event cards, 8 Backyard faces
(one blank) and the back. Pell reads them by the notches cut in their left edge, so every face has them."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Omen cards: 18 faces, 9 event cards, 8 Backyard faces (one blank), 1 back"
CW, CH = 300, 420
BW, BH = 244, 236          # the picture box of an Omen face
INK, RUB, AZ, LEAF, GOLD = kit.INK, kit.RUBRIC, kit.AZURE, kit.LEAF, kit.GOLD
WASH = {"wind": "#dfe3c4", "rain": "#cfdbe0", "song": "#f3dfa2", "tremor": "#ecc9ae", "leaf": "#e3cf9c",
        "mandible": "#d8cdb8"}
BELIEF = {"wind": "trial", "rain": "blessing", "song": "prophecy", "tremor": "message", "leaf": "death",
          "mandible": "monster or god"}


# ---------------------------------------------------------------------------------------------
# small things the pictures share
# ---------------------------------------------------------------------------------------------
def ground(a, y=204, w=BW, hatch=True):
    r = a.rng
    pts = [(i * w / 8, y + r.uniform(-3, 3)) for i in range(9)]
    a.path(a.smooth_d(pts) + f" L{w},{y + 60} L0,{y + 60}Z", fill="#c9a877", stroke=INK, stroke_width=1.6)
    if hatch:
        d = "".join(f"M{f(r.uniform(4, w - 16))},{f(y + r.uniform(8, 30))} l{f(r.uniform(8, 16))},{f(r.uniform(1, 4))}"
                    for _ in range(16))
        a.path(d, stroke=INK, stroke_width=1, fill="none", opacity=0.6)


def gust(a, x, y, length=120, s=1.0, col=kit.SAGE, w=2.4):
    a.path(f"M{f(x)},{f(y)} h{f(length)} a{f(9 * s)},{f(9 * s)} 0 1,0 {f(-9 * s)},{f(-9 * s)}", fill="none", stroke=INK,
           stroke_width=w + 1.6, stroke_linecap="round")
    a.path(f"M{f(x)},{f(y)} h{f(length)} a{f(9 * s)},{f(9 * s)} 0 1,0 {f(-9 * s)},{f(-9 * s)}", fill="none", stroke=col,
           stroke_width=w, stroke_linecap="round")


def bead(a, x, y, r, col=AZ, squash=0.86):
    a.ellipse(x, y, r, r * squash, fill=col, stroke=INK, stroke_width=1.5, opacity=0.92)
    a.ellipse(x - r * 0.35, y - r * 0.38, r * 0.28, r * 0.16, fill="#f4f8fa", opacity=0.85)
    a.path(f"M{f(x - r * 0.6)},{f(y + r * 0.45)} Q{f(x)},{f(y + r * 0.8)} {f(x + r * 0.6)},{f(y + r * 0.45)}", fill="none",
           stroke="#f4f8fa", stroke_width=1.2, opacity=0.6)


def drop(a, x, y, s=1.0, col=AZ):
    a.path(f"M{f(x)},{f(y - 9 * s)} Q{f(x + 7 * s)},{f(y + 3 * s)} {f(x)},{f(y + 7 * s)} Q{f(x - 7 * s)},{f(y + 3 * s)} "
           f"{f(x)},{f(y - 9 * s)}Z", fill=col, stroke=INK, stroke_width=0.9)


def leaf(a, x, y, s=1.0, rot=0, col="#c8702a", vein=True):
    a.open("g", transform=f"translate({f(x)} {f(y)}) rotate({f(rot)}) scale({f(s)})")
    a.path("M0,-30 Q22,-12 14,14 Q6,28 0,32 Q-6,28 -14,14 Q-22,-12 0,-30Z", fill=col, stroke=INK, stroke_width=1.4 / max(0.4, s))
    if vein:
        a.path("M0,-28 L0,40 M0,-10 L10,-18 M0,-10 L-10,-18 M0,4 L11,-4 M0,4 L-11,-4 M0,18 L8,11 M0,18 L-8,11", fill="none",
               stroke=INK, stroke_width=0.9 / max(0.4, s))
    a.close()


def note(a, x, y, s=1.0, col=GOLD, flag=True):
    a.ellipse(x, y, 6 * s, 4.6 * s, fill=col, stroke=INK, stroke_width=1, transform=f"rotate(-20 {f(x)} {f(y)})")
    a.path(f"M{f(x + 5.4 * s)},{f(y - 1)} v{f(-20 * s)}" + (f" q{f(9 * s)},{f(2 * s)} {f(8 * s)},{f(11 * s)}" if flag else ""),
           fill="none", stroke=INK, stroke_width=1.5, stroke_linecap="round")


def beetle_side(a, x, y, s=1.0, flip=1, shell="#2e3a34", halo=False):
    """A ground beetle from the side: dome, head, jaws, three legs. It has no face."""
    a.open("g", transform=f"translate({f(x)} {f(y)}) scale({f(s * flip)} {f(s)})")
    if halo:
        a.circle(0, -34, 62, fill=GOLD, stroke=INK, stroke_width=1.2)
        for i in range(16):
            t = math.pi + i * math.pi / 15
            a.line(66 * math.cos(t), -34 + 66 * math.sin(t), 76 * math.cos(t), -34 + 76 * math.sin(t), stroke=INK,
                   stroke_width=1.2)
    for lx in (-26, -4, 20):
        a.path(f"M{lx},-14 q8,-10 14,2 l4,12", fill="none", stroke=INK, stroke_width=3.2, stroke_linecap="round",
               stroke_linejoin="round")
    a.path("M-50,-10 Q-48,-66 4,-66 Q46,-62 46,-10Z", fill=shell, stroke=INK, stroke_width=1.6)
    a.path("M-2,-66 Q8,-36 2,-10", fill="none", stroke=INK, stroke_width=1.2)
    a.path("M-40,-34 Q-20,-58 -4,-58", fill="none", stroke="#cfe0c8", stroke_width=3, opacity=0.5, stroke_linecap="round")
    a.path("M44,-12 Q70,-16 68,-38 Q54,-48 44,-40Z", fill=kit.shade(shell, 0.7), stroke=INK, stroke_width=1.5)
    a.path("M66,-30 q20,-2 22,12 M66,-22 q16,6 14,18", fill="none", stroke=INK, stroke_width=3, stroke_linecap="round")
    a.path("M60,-42 q10,-22 26,-22", fill="none", stroke=INK, stroke_width=1.2)
    a.close()


def tally(a, x, y, n, s=1.0, col=INK):
    d = ""
    for i in range(n):
        if i % 5 == 4:
            d += f"M{f(x + (i - 4.6) * 7 * s)},{f(y + 14 * s)} L{f(x + (i - 0.4) * 7 * s)},{f(y + 2 * s)}"
        else:
            d += f"M{f(x + i * 7 * s)},{f(y)} l{f(1.2 * s)},{f(16 * s)}"
    a.path(d, fill="none", stroke=col, stroke_width=1.8 * s, stroke_linecap="round")


def dome(a, x, y, s=1.0, lit=True, col="#b58d62"):
    """A round carved dwelling with a door and, if lit, a lantern in it."""
    a.path(f"M{f(x - 16 * s)},{f(y)} Q{f(x - 16 * s)},{f(y - 26 * s)} {f(x)},{f(y - 26 * s)} Q{f(x + 16 * s)},{f(y - 26 * s)} "
           f"{f(x + 16 * s)},{f(y)}Z", fill=col, stroke=INK, stroke_width=1.3)
    a.path(f"M{f(x - 5 * s)},{f(y)} v{f(-9 * s)} a{f(5 * s)},{f(5 * s)} 0 0,1 {f(10 * s)},0 v{f(9 * s)}Z",
           fill=kit.LANTERN if lit else INK, stroke=INK, stroke_width=1)


# ---------------------------------------------------------------------------------------------
# the eighteen pictures (drawn in a BW x BH box)
# ---------------------------------------------------------------------------------------------
def pic_bowed_elder(a):
    for i, (y, ln) in enumerate(((40, 150), (78, 110), (120, 170))):
        gust(a, 6 + i * 14, y, ln, 1.2)
    ground(a)
    kit.person(a, 150, 206, 1.45, kind="robe", lean=24, cloth="#8f8a70", arms=((-10, -44), (20, -52)),
               extra=lambda b: kit.cane(b, 24, -58))
    for x, y, rot in ((40, 150, 40), (86, 176, 110), (206, 60, 70)):
        leaf(a, x, y, 0.28, rot, col=LEAF, vein=False)


def pic_bending_ridge(a):
    gust(a, 4, 46, 170, 1.3)
    gust(a, 30, 96, 90, 1.0)
    ground(a, 196)
    # the tower on its splinter, bending but standing
    a.path("M150,198 Q150,120 176,44 L200,50 Q180,124 184,198Z", fill="#b58d62", stroke=INK, stroke_width=1.6)
    a.path("M158,150 Q170,146 180,152 M163,110 Q174,106 186,112 M172,76 Q182,72 193,78", fill="none", stroke=INK, stroke_width=1)
    a.path("M170,44 l-6,-12 l10,3 l5,-11 l6,10 l10,-4 l-3,13Z", fill=RUB, stroke=INK, stroke_width=1.2)
    a.path("M188,30 L196,2 M196,2 q14,4 26,-2 q-8,10 -24,12", fill=GOLD, stroke=INK, stroke_width=1.3)
    for x, ln in ((70, -16), (112, -10)):
        kit.person(a, x, 200, 0.95, kind="plate", lean=ln, cloth="#9a7a52", arms=((-12, -44), (18, -58)), stride=8,
                   crest=kit.LANTERN if x == 112 else None, extra=lambda b: kit.spear(b, 20, -104))


def pic_counted_gust(a):
    gust(a, 8, 52, 110, 1.1)
    gust(a, 60, 92, 150, 1.2)
    gust(a, 20, 132, 70, 0.9)
    ground(a)
    kit.person(a, 70, 206, 1.25, kind="apron", cloth="#7d6c5a", arms=((-14, -44), (18, -70)),
               extra=lambda b: (b.line(18, -44, 18, -112, stroke=INK, stroke_width=2),
                                b.path("M18,-110 q22,-8 40,2 q-18,4 -40,10Z", fill=RUB, stroke=INK, stroke_width=1)))
    a.rect(140, 150, 86, 44, fill=kit.PAPER, stroke=INK, stroke_width=1.4, transform="rotate(-4 180 170)")
    tally(a, 150, 160, 9, 1.0, col=RUB)


def pic_full_cup(a):
    for i in range(9):
        a.line(20 + i * 26, 6 + (i % 3) * 10, 14 + i * 26, 30 + (i % 3) * 10, stroke=AZ, stroke_width=1.6, stroke_linecap="round")
    ground(a)
    bead(a, 122, 60, 34)
    a.path("M76,112 Q78,160 108,170 L104,190 H86 V200 H158 V190 H140 L136,170 Q166,160 168,112Z", fill=GOLD, stroke=INK,
           stroke_width=1.8)
    a.ellipse(122, 112, 46, 10, fill=AZ, stroke=INK, stroke_width=1.6)
    a.path("M92,126 Q96,150 112,160", fill="none", stroke="#fff6dc", stroke_width=3, opacity=0.7, stroke_linecap="round")
    for x, y in ((70, 104), (176, 100), (60, 128), (184, 124)):
        drop(a, x, y, 0.8)
    kit.person(a, 206, 206, 0.9, kind="robe", cloth="#8f8a70", lean=-10, flip=-1, arms=((-10, -50), (22, -70)))
    kit.person(a, 34, 206, 0.8, kind="robe", cloth=RUB, lean=10, arms=((-10, -50), (22, -70)))


def pic_washed_spear(a):
    for i in range(10):
        a.line(14 + i * 24, 8 + (i % 4) * 12, 8 + i * 24, 34 + (i % 4) * 12, stroke=AZ, stroke_width=1.6, stroke_linecap="round")
    ground(a)
    a.line(122, 206, 122, 44, stroke=INK, stroke_width=7, stroke_linecap="round")
    a.line(122, 204, 122, 46, stroke="#c9a877", stroke_width=4)
    a.poly([(122, 6), (106, 50), (138, 50)], fill="#f6e8c8", stroke=INK, stroke_width=1.8)
    a.line(122, 12, 122, 48, stroke=INK, stroke_width=0.9)
    a.path("M100,58 h44 M106,66 h32", stroke=RUB, stroke_width=3, stroke_linecap="round")
    bead(a, 134, 96, 13)
    for x, y, s in ((112, 130, 1.0), (131, 156, 0.8), (114, 180, 0.7)):
        drop(a, x, y, s)
    a.ellipse(122, 206, 40, 6, fill=AZ, stroke=INK, stroke_width=1, opacity=0.8)
    kit.person(a, 50, 206, 1.05, kind="plate", cloth="#9a7a52", crest=kit.LANTERN, arms=((-13, -42), (16, -78)))
    kit.person(a, 200, 206, 0.9, kind="plate", cloth="#9a7a52", flip=-1, arms=((-13, -42), (14, -42)))


def pic_marked_bead(a):
    ground(a, 190)
    bead(a, 104, 118, 74, squash=0.92)
    a.rect(196, 30, 14, 164, fill=kit.PAPER, stroke=INK, stroke_width=1.4)
    a.path("".join(f"M196,{38 + i * 12} h{9 if i % 2 else 14}" for i in range(13)), stroke=INK, stroke_width=1.2)
    a.line(30, 44, 196, 44, stroke=RUB, stroke_width=1.3, stroke_dasharray="5 4")
    a.line(30, 190, 196, 190, stroke=RUB, stroke_width=1.3, stroke_dasharray="5 4")
    a.path("M30,44 l6,8 M30,44 l-6,8 M30,190 l6,-8 M30,190 l-6,-8 M30,44 V190", stroke=RUB, stroke_width=1.3, fill="none")
    kit.person(a, 224, 218, 0.95, kind="apron", cloth="#7d6c5a", flip=-1, arms=((-14, -42), (20, -62)),
               extra=lambda b: b.path("M20,-62 q8,-18 2,-30 q-6,14 -2,30Z", fill=kit.PAPER, stroke=INK, stroke_width=0.9))


def bird_above(a, x, y, s=1.0, flip=1):
    """Only the head and breast of the singer, leaning in from the edge."""
    a.open("g", transform=f"translate({f(x)} {f(y)}) scale({f(s * flip)} {f(s)})")
    a.path("M40,-70 Q-34,-40 -30,20 Q-4,46 60,20 L90,-70Z", fill="#c8702a", stroke=INK, stroke_width=1.6)
    a.path("M40,-70 Q0,-44 4,-8 Q30,-2 90,-30 L90,-70Z", fill=AZ, stroke=INK, stroke_width=1.4)
    a.poly([(-28, -4), (-62, 10), (-26, 18)], fill=GOLD, stroke=INK, stroke_width=1.4)
    a.line(-60, 10, -28, 8, stroke=INK, stroke_width=0.9)
    a.circle(-10, -14, 5, fill=INK)
    a.circle(-11.5, -15.5, 1.5, fill=kit.PAPER)
    a.close()


def pic_singer_above(a):
    bird_above(a, 186, 54, 0.9)
    for i in range(5):
        note(a, 104 - i * 17, 78 + i * 20 + (i % 2) * 6, 1.0 - i * 0.06)
    a.path("M120,60 Q70,90 28,170", fill="none", stroke=RUB, stroke_width=1, stroke_dasharray="3 5")
    ground(a)
    kit.person(a, 150, 206, 0.95, kind="robe", cloth="#8f8a70", flip=-1, arms=((-22, -92), (22, -92)))
    kit.person(a, 190, 208, 0.8, kind="robe", cloth=RUB, flip=-1, arms=((-22, -90), (16, -52)))
    kit.person(a, 218, 206, 0.7, kind="robe", cloth=LEAF, flip=-1, arms=((-18, -88), (20, -88)))


def pic_war_note(a):
    ground(a)
    def horn(b):
        b.path("M14,-80 Q40,-84 56,-104 Q70,-120 64,-136 L84,-128 Q84,-100 62,-84 Q40,-68 16,-72Z", fill=GOLD, stroke=INK,
               stroke_width=1.3)
        b.path("M40,-88 q6,6 4,12 M54,-102 q8,4 8,12", fill="none", stroke=INK, stroke_width=0.9)
    kit.person(a, 80, 206, 1.4, kind="plate", cloth="#9a7a52", crest=kit.LANTERN, lean=-6, arms=((-14, -40), (18, -76)),
               extra=horn)
    note(a, 204, 40, 1.9, col=RUB)
    for i, (x, y) in enumerate(((176, 78), (214, 96), (190, 120))):
        a.path(f"M{x},{y} q10,-8 20,0", fill="none", stroke=RUB, stroke_width=2, stroke_linecap="round")
    a.path("M30,206 L30,90 M30,92 q26,6 46,-4 q-12,16 -46,24Z", fill=RUB, stroke=INK, stroke_width=1.4)


def pic_written_tune(a):
    ground(a, 210, hatch=False)
    a.path("M96,26 H226 Q232,100 220,196 H108 Q92,110 96,26Z", fill=kit.PAPER, stroke=INK, stroke_width=1.5)
    r = a.rng
    for i in range(5):
        y = 50 + i * 30
        pts = [(110 + k * 14, y + 5 * math.sin(k * 1.1 + i * 1.7)) for k in range(8)]
        a.path(a.smooth_d(pts), fill="none", stroke=INK, stroke_width=1.2)
        for k in (1, 3, 4, 6)[: 2 + i % 3]:
            px, py = pts[k]
            a.rect(px - 3, py - 8 - r.uniform(0, 6), 6, 6, fill=RUB if k % 2 else INK, transform=f"rotate(45 {f(px)} {f(py - 6)})")
        a.text(102, y + 4, "IVXLC"[i] if i != 3 else "IV", size=9, family="serif", fill=RUB, text_anchor="end")
    kit.person(a, 54, 212, 1.2, kind="apron", cloth="#7d6c5a", lean=6, arms=((-14, -44), (26, -62)),
               extra=lambda b: b.path("M26,-62 q12,-16 10,-32 q-10,12 -10,32Z", fill=kit.PAPER, stroke=INK, stroke_width=0.9))
    note(a, 60, 36, 1.2)


def pic_shaken_lamp(a):
    a.path("M0,0 H244 V16 Q122,30 0,16Z", fill="#c9a877", stroke=INK, stroke_width=1.5)
    a.path("M116,20 q6,10 12,0", fill="none", stroke=INK, stroke_width=2.4)
    for ang, op in ((-32, 0.18), (-14, 0.36), (24, 1.0)):
        a.open("g", transform=f"rotate({ang} 122 24)", opacity=op)
        a.line(122, 24, 122, 96, stroke=INK, stroke_width=1.8)
        if op == 1.0:
            a.circle(122, 130, 62, fill=a.radial([(0, kit.LANTERN, 0.75), (1, kit.LANTERN, 0)]))
        a.path("M108,98 h28 l4,10 h-36Z", fill=kit.UMBER, stroke=INK, stroke_width=1.4)
        a.ellipse(122, 134, 26, 28, fill=GOLD, stroke=INK, stroke_width=1.8)
        a.path("M106,112 Q122,134 106,156 M138,112 Q122,134 138,156 M122,106 V162", fill="none", stroke=INK, stroke_width=1)
        a.path("M122,118 q11,16 0,30 q-11,-14 0,-30Z", fill=kit.LANTERN, stroke=INK, stroke_width=1)
        a.path("M110,160 h24 l-4,9 h-16Z", fill=kit.UMBER, stroke=INK, stroke_width=1.4)
        a.close()
    a.path("M40,70 q-14,20 0,40 M26,60 q-20,30 0,60 M204,64 q14,22 0,44", fill="none", stroke=RUB, stroke_width=2,
           stroke_linecap="round")
    a.stipple(10, 20, 224, 170, n=46, r=(0.8, 2), fill=kit.UMBER, opacity=0.7)
    ground(a, 212, hatch=False)
    kit.person(a, 204, 214, 1.0, kind="robe", cloth="#8f8a70", flip=-1, lean=-6, arms=((-12, -46), (24, -84)))


def pic_braced_wall(a):
    ground(a)
    for j in range(6):
        for i in range(3):
            x = 150 + i * 30 + (15 if j % 2 else 0)
            a.rect(x, 24 + j * 30, 30, 30, fill="#b58d62" if (i + j) % 2 else "#a67c56", stroke=INK, stroke_width=1.2)
    a.path("M176,24 l8,30 l-12,26 l14,30 l-10,30 l12,28 l-6,36", fill="none", stroke=INK, stroke_width=3.2, stroke_linejoin="round")
    a.path("M176,24 l8,30 l-12,26 l14,30 l-10,30 l12,28 l-6,36", fill="none", stroke=RUB, stroke_width=1.2, stroke_linejoin="round")
    for (x0, y0, x1, y1) in ((70, 204, 152, 86), (104, 204, 152, 140)):
        a.line(x0, y0, x1, y1, stroke=INK, stroke_width=9, stroke_linecap="round")
        a.line(x0, y0, x1, y1, stroke="#e6cfa0", stroke_width=5.5, stroke_linecap="round")
    kit.person(a, 50, 206, 1.15, kind="plate", cloth="#9a7a52", crest=kit.LANTERN, lean=16, arms=((6, -50), (24, -66)), stride=10)
    kit.person(a, 112, 206, 0.9, kind="plate", cloth="#9a7a52", lean=18, arms=((8, -50), (24, -58)), stride=9)
    for y in (50, 110, 170):
        kit.suit_mark(a, "tremor", 30, y - 20, 0.8)


def pic_long_scroll(a):
    a.path("M40,10 H190 Q214,60 150,96 Q96,126 120,170 Q136,196 210,200 L210,230 Q110,226 84,180 Q58,130 120,92 Q160,66 150,40 H40Z",
           fill=kit.PAPER, stroke=INK, stroke_width=1.6)
    a.ellipse(40, 25, 9, 17, fill="#c9a877", stroke=INK, stroke_width=1.5)
    a.ellipse(190, 25, 9, 17, fill="#c9a877", stroke=INK, stroke_width=1.5, opacity=0.9)
    for x in (62, 96, 130, 160):
        kit.suit_mark(a, "tremor", x, 26, 0.6)
    for x, y, rot in ((150, 70, -40), (112, 112, -60), (96, 150, 60), (128, 196, 20), (176, 212, 4)):
        a.open("g", transform=f"rotate({rot} {x} {y})")
        kit.suit_mark(a, "tremor", x, y, 0.55)
        a.close()
    kit.person(a, 34, 232, 1.2, kind="apron", cloth="#7d6c5a", arms=((-12, -42), (22, -74)),
               extra=lambda b: b.path("M22,-74 q10,-14 6,-28 q-8,12 -6,28Z", fill=kit.PAPER, stroke=INK, stroke_width=0.9))
    a.circle(214, 150, 14, fill=GOLD, stroke=INK, stroke_width=1.3)
    a.text(214, 155, "III", size=13, family="serif", fill=INK, text_anchor="middle", font_weight="bold")


def pic_last_leaf(a):
    a.path("M0,20 Q80,34 150,22 Q190,18 244,30", fill="none", stroke=INK, stroke_width=7, stroke_linecap="round")
    a.path("M0,20 Q80,34 150,22 Q190,18 244,30", fill="none", stroke="#8a6344", stroke_width=4, stroke_linecap="round")
    for x in (40, 92, 196):
        a.path(f"M{x},27 l4,12", stroke=INK, stroke_width=2, stroke_linecap="round")
    leaf(a, 150, 78, 1.25, 8, col="#c8702a")
    a.line(150, 24, 152, 42, stroke=INK, stroke_width=1.5)
    for x, y, rot in ((40, 170, 60), (214, 150, 130)):
        leaf(a, x, y, 0.3, rot, col="#b8862a", vein=False)
    ground(a)
    kit.person(a, 104, 206, 1.25, kind="robe", cloth="#8f8a70", lean=-5, arms=((-16, -46), (20, -84)),
               extra=lambda b: kit.cane(b, -19, -52))
    a.path("M132,128 q8,-14 14,-22", fill="none", stroke=RUB, stroke_width=1, stroke_dasharray="3 4")


def pic_falling_shield(a):
    ground(a)
    a.open("g", transform="rotate(24 136 84)")
    leaf(a, 136, 84, 2.0, 0, col="#c8702a")
    a.circle(136, 86, 13, fill=GOLD, stroke=INK, stroke_width=1.5)
    a.circle(136, 86, 4, fill=INK)
    a.path("M112,70 q24,-12 48,0 M108,102 q28,14 56,0", fill="none", stroke=INK, stroke_width=1.6)
    a.close()
    a.path("M60,20 q-10,24 4,46 M84,10 q-8,18 2,34 M200,30 q10,20 2,40", fill="none", stroke=RUB, stroke_width=1.8,
           stroke_linecap="round")
    kit.person(a, 70, 206, 1.1, kind="plate", cloth="#9a7a52", lean=-8, arms=((-20, -86), (22, -88)), stride=9)
    kit.person(a, 204, 206, 0.85, kind="plate", cloth="#9a7a52", flip=-1, lean=-14, crest=kit.LANTERN, arms=((-14, -44), (20, -80)), stride=10)


def pic_leaf_count(a):
    a.line(10, 30, 234, 30, stroke=INK, stroke_width=2)
    cols = ["#c8702a", "#b8862a", LEAF, "#a8321e", "#c8702a"]
    for i in range(5):
        x = 34 + i * 44
        a.line(x, 30, x, 48, stroke=INK, stroke_width=1.2)
        leaf(a, x, 74, 0.62, (i - 2) * 8, col=cols[i])
    ground(a, 210, hatch=False)
    a.rect(110, 124, 112, 70, fill=kit.PAPER, stroke=INK, stroke_width=1.5, transform="rotate(3 166 160)")
    tally(a, 124, 136, 10, 1.1, col=INK)
    tally(a, 124, 164, 4, 1.1, col=RUB)
    kit.person(a, 58, 212, 1.3, kind="apron", cloth="#7d6c5a", arms=((-14, -42), (30, -64)),
               extra=lambda b: b.path("M30,-64 q12,-12 10,-26 q-10,10 -10,26Z", fill=kit.PAPER, stroke=INK, stroke_width=0.9))


def pic_great_visitor(a):
    ground(a, 200)
    beetle_side(a, 110, 172, 1.55, halo=True)
    kit.person(a, 206, 204, 0.66, kind="robe", cloth="#8f8a70", flip=-1, lean=-34, arms=((-4, -40), (26, -52)))
    kit.person(a, 228, 208, 0.56, kind="robe", cloth=RUB, flip=-1, lean=-30, arms=((-4, -40), (26, -52)))
    a.path("M176,198 h18 l-3,8 h-12Z", fill=GOLD, stroke=INK, stroke_width=1.1)
    drop(a, 185, 190, 0.6, col=kit.AMBER)


def pic_biting_thing(a):
    ground(a)
    a.path("M244,30 Q170,40 150,96 Q176,104 196,84 Q186,112 244,120Z", fill="#2e3a34", stroke=INK, stroke_width=1.8)
    a.path("M244,220 Q168,196 150,140 Q176,134 198,152 Q190,128 244,124Z", fill="#2e3a34", stroke=INK, stroke_width=1.8)
    a.path("M160,98 l8,10 l6,-12 l8,12 l8,-14 M160,138 l8,-10 l6,12 l8,-12 l8,14", fill=kit.PAPER, stroke=INK, stroke_width=1.2)
    a.path("M214,56 Q190,66 178,86", fill="none", stroke="#cfe0c8", stroke_width=3, opacity=0.45, stroke_linecap="round")
    a.path("M132,104 l-14,-6 M130,120 l-18,0 M132,136 l-14,6", stroke=RUB, stroke_width=2.2, stroke_linecap="round")
    for x, s, ln, cr in ((46, 1.2, 14, kit.LANTERN), (92, 1.0, 10, None)):
        kit.person(a, x, 206, s, kind="plate", cloth="#9a7a52", crest=cr, lean=ln, arms=((8, -56), (22, -62)), stride=11,
                   extra=lambda b: (b.line(-14, -50, 44, -70, stroke=INK, stroke_width=2.2, stroke_linecap="round"),
                                    b.poly([(54, -73), (41, -75), (43, -65)], fill="#f6e8c8", stroke=INK, stroke_width=0.9)))


def pic_measured_shell(a):
    a.ellipse(112, 120, 64, 88, fill="#2e3a34", stroke=INK, stroke_width=1.8)
    a.line(112, 34, 112, 206, stroke=INK, stroke_width=1.4)
    a.path("M70,60 Q60,120 76,180 M92,42 Q82,120 94,198 M154,60 Q164,120 148,180 M132,42 Q142,120 130,198", fill="none",
           stroke="#56665c", stroke_width=1.3)
    a.path("M80,62 Q64,110 74,150", fill="none", stroke="#cfe0c8", stroke_width=4, opacity=0.4, stroke_linecap="round")
    a.path("M84,40 Q112,10 140,40 Q112,52 84,40Z", fill="#1e2420", stroke=INK, stroke_width=1.5)
    for y0, y1 in ((32, 208),):
        a.path(f"M196,{y0} V{y1} M188,{y0} h16 M188,{y1} h16", stroke=RUB, stroke_width=1.5, fill="none")
    a.path("M48,222 H176 M48,214 v16 M176,214 v16", stroke=RUB, stroke_width=1.5, fill="none")
    a.path("".join(f"M196,{32 + i * 16} h{-6 if i % 2 else -10}" for i in range(12)), stroke=RUB, stroke_width=1)
    kit.person(a, 222, 232, 0.8, kind="apron", cloth="#7d6c5a", flip=-1, arms=((-12, -40), (22, -66)))
    a.circle(30, 40, 15, fill=GOLD, stroke=INK, stroke_width=1.3)
    a.text(30, 45, "II", size=14, family="serif", fill=INK, text_anchor="middle", font_weight="bold")


OMEN = [
    ("bowed-elder", "The Bowed Elder", "wind", "eye", 2, pic_bowed_elder, "an old robed reader bent double into the wind, cane planted, leaves streaming past"),
    ("bending-ridge", "The Bending Ridge", "wind", "spear", 3, pic_bending_ridge, "a watchtower on its splinter bowing under the gust while two warriors lean in to hold their ground"),
    ("counted-gust", "The Counted Gust", "wind", "quill", 1, pic_counted_gust, "a scholar holding a streamer up to the wind beside a slate of tallied gusts"),
    ("full-cup", "The Full Cup", "rain", "eye", 3, pic_full_cup, "a great rain bead falling into a gold cup that brims over, two robed figures lifting their hands to it"),
    ("washed-spear", "The Washed Spear", "rain", "spear", 1, pic_washed_spear, "a spear planted upright in the rain, a bead sliding down the shaft, a warrior reaching to touch it"),
    ("marked-bead", "The Marked Bead", "rain", "quill", 2, pic_marked_bead, "a bead of water as big as a house, measured against a ruled rod by a scholar with a quill"),
    ("singer-above", "The Singer Above", "song", "eye", 3, pic_singer_above, "the breast and beak of a singer leaning in from the sky, five notes falling toward three raised hoods"),
    ("war-note", "The War Note", "song", "spear", 1, pic_war_note, "Captain Burr's herald sounding a curled horn beside a red pennant, one loud note leaping out"),
    ("written-tune", "The Written Tune", "song", "quill", 2, pic_written_tune, "a scholar setting five sung phrases down on a tall sheet, line under line"),
    ("shaken-lamp", "The Shaken Lamp", "tremor", "eye", 1, pic_shaken_lamp, "a lantern swinging on its hook as dust comes down, a robed hand lifted to steady it"),
    ("braced-wall", "The Braced Wall", "tremor", "spear", 2, pic_braced_wall, "a cracked wall shored with two timbers, warriors throwing their weight against the props"),
    ("long-scroll", "The Long Scroll", "tremor", "quill", 3, pic_long_scroll, "the Tremor Scroll unrolling the whole height of the card, every shake inked on it, a scholar still writing at its end"),
    ("last-leaf", "The Last Leaf", "leaf", "eye", 3, pic_last_leaf, "one copper leaf left on a bare twig and an old reader beneath it, one hand lifted as if he knows which is his"),
    ("falling-shield", "The Falling Shield", "leaf", "spear", 2, pic_falling_shield, "a leaf with a shield's boss tumbling out of the sky onto two warriors with their arms flung up"),
    ("leaf-count", "The Leaf Count", "leaf", "quill", 1, pic_leaf_count, "five fallen leaves pinned in a row over a scholar's tally slate"),
    ("great-visitor", "The Great Visitor", "mandible", "eye", 1, pic_great_visitor, "a beetle under a gold halo, two small robed figures bowed before it with an offering bowl"),
    ("biting-thing", "The Biting Thing", "mandible", "spear", 3, pic_biting_thing, "a pair of toothed jaws as tall as the frame closing from the right on two braced spears"),
    ("measured-shell", "The Measured Shell", "mandible", "quill", 2, pic_measured_shell, "a beetle's shell seen from above with its length and breadth ruled off in red, a scholar at the rule"),
]


# ---------------------------------------------------------------------------------------------
# the card stock
# ---------------------------------------------------------------------------------------------
def stock(a, tone=kit.PAPER, vig=0.28, vcol="#6b4a20"):
    cp = a.clip(f'<rect x="1" y="1" width="{CW - 2}" height="{CH - 2}" rx="16"/>')
    a.open("g", clip_path=cp)
    a.paper(tone, grain=0.26, fibre=0.75)
    a.vignette(vig, vcol)
    return cp


def notches(a, suit_i, weight, sig_i):
    """Pell's notches down the left edge: suit (1 to 6), then weight (1 to 3), then sigil (1 to 3)."""
    y = 70
    for n, gap in ((suit_i + 1, 0), (weight, 26), (sig_i + 1, 26)):
        y += gap
        for _ in range(n):
            a.poly([(0, y - 6), (9, y), (0, y + 6)], fill="#1b120c")
            a.path(f"M9,{y} L0,{y + 6}", stroke="#fff6dc", stroke_width=1, opacity=0.6)
            y += 16


def finish(a):
    a.close()
    a.rect(1, 1, CW - 2, CH - 2, rx=16, fill="none", stroke=INK, stroke_width=2)


def omen_face(a, name, suit, sig, weight, pic):
    stock(a)
    kit.double_rule(a, 14, 14, CW - 28, CH - 28, gap=5, rx=10)
    # head: suit roundel and weight bezants
    a.circle(40, 40, 17, fill=WASH[suit], stroke=INK, stroke_width=1.4)
    kit.suit_mark(a, suit, 40, 41, 0.72)
    for k in range(weight):
        a.circle(264 - k * 19, 40, 7, fill=GOLD, stroke=INK, stroke_width=1.2)
        a.circle(262 - k * 19, 38, 2, fill="#fff6dc", opacity=0.8)
    long = len(BELIEF[suit]) > 9
    a.text(150 - (18 if long and weight == 3 else 0), 45, BELIEF[suit].upper(), size=11 if not long else 10, family="serif", fill=RUB,
           text_anchor="middle", letter_spacing=3 if not long else 1.5)
    # picture
    px, py = 28, 60
    cp = a.clip(f'<rect x="0" y="0" width="{BW}" height="{BH}"/>')
    a.open("g", transform=f"translate({px} {py})")
    a.open("g", clip_path=cp)
    a.rect(0, 0, BW, BH, fill=WASH[suit])
    a.rect(0, 0, BW, BH, fill=a.gradient([(0, "#fff6dc"), (1, WASH[suit])]), opacity=0.6)
    pic(a)
    a.close()
    a.rect(0, 0, BW, BH, fill="none", stroke=INK, stroke_width=1.8)
    a.rect(-3, -3, BW + 6, BH + 6, fill="none", stroke=RUB, stroke_width=0.9)
    a.close()
    # foot: name, sigil between sprigs
    a.text(150, 327, name, size=23, family="serif", fill=INK, text_anchor="middle", font_style="italic")
    a.path("M70,338 Q150,346 230,338", fill="none", stroke=RUB, stroke_width=1)
    a.circle(150, 374, 22, fill=kit.PAPER, stroke=INK, stroke_width=1.4)
    kit.sigil(a, sig, 150, 375 if sig != "eye" else 374, 0.62, col={"eye": "#8a6a10", "spear": RUB, "quill": AZ}[sig], w=2.4)
    for sgn in (-1, 1):
        kit.vine(a, [(150 + sgn * 24, 374), (150 + sgn * 52, 368), (150 + sgn * 80, 380), (150 + sgn * 106, 372)], curl=0.7,
                 width=1.5)
    notches(a, kit.SUITS.index(suit), weight, kit.SIGILS.index(sig))
    finish(a)


for cid, name, suit, sig, weight, pic, what in OMEN:
    def _mk(name=name, suit=suit, sig=sig, weight=weight, pic=pic, what=what):
        def draw(a: Art):
            omen_face(a, name, suit, sig, weight, pic)
        draw.__doc__ = (f"Omen card {name}: {what}. Suit {suit.capitalize()} ({BELIEF[suit]}), the {sig} sigil, weight "
                        f"{weight}, with Pell's notches down the left edge.")
        return draw
    asset(G, f"omen-{cid}", group="cards", title=f"Omen card: {name}", w=CW, h=CH, row=ROW)(_mk())


# ---------------------------------------------------------------------------------------------
# event cards: what the people saw (a 256 x 262 box on a darker stock)
# ---------------------------------------------------------------------------------------------
EW, EH = 256, 262


def wall(a, tone="#8a6344", dark=0.25):
    a.rect(0, 0, EW, EH, fill=tone)
    r = a.rng
    d = ""
    for i in range(22):
        x = r.uniform(0, EW)
        y = r.uniform(-20, EH * 0.6)
        d += f"M{f(x)},{f(y)} q{f(r.uniform(-8, 8))},{f(r.uniform(30, 60))} {f(r.uniform(-6, 6))},{f(r.uniform(70, 130))}"
    a.path(d, fill="none", stroke=INK, stroke_width=1.3, opacity=0.5)
    a.rect(0, 0, EW, EH, fill=a.gradient([(0, "#1b120c"), (1, "#1b120c")]), opacity=dark)


def city(a, y=214, lit=True, n=7):
    r = a.rng
    a.path(f"M0,{y} Q{EW / 2},{y - 12} {EW},{y} V{EH} H0Z", fill="#5a3d2b", stroke=INK, stroke_width=1.5)
    for i in range(n):
        x = 18 + i * (EW - 36) / (n - 1) + r.uniform(-5, 5)
        dome(a, x, y - 3 - 5 * math.sin(math.pi * i / (n - 1)), r.uniform(0.7, 1.0), lit=lit and (i % 3 != 1))


def ev_tremor(a):
    wall(a)
    for x in (40, 128, 210):
        a.path(f"M{x},10 l10,26 l-16,22 l18,26 l-14,24 l12,22", fill="none", stroke=GOLD, stroke_width=3, stroke_linejoin="round")
        a.path(f"M{x},10 l10,26 l-16,22 l18,26 l-14,24 l12,22", fill="none", stroke=INK, stroke_width=0.9, stroke_linejoin="round")
    a.stipple(0, 0, EW, 200, n=160, r=(0.8, 2.4), fill=kit.PAPER, opacity=0.7)
    city(a)
    for x, fl in ((70, 1), (150, -1), (200, 1)):
        kit.person(a, x, 232, 0.36, kind="plain", lean=14 * fl, flip=fl, stride=10, arms=((-18, -80), (18, -84)), cloth=kit.PAPER_D)


def ev_rain(a):
    wall(a, "#7f7058", 0.1)
    for x in (50, 128, 206):
        a.path(f"M{x - 16},0 Q{x - 26},130 {x - 14},{EH} H{x + 14} Q{x + 26},130 {x + 16},0Z", fill="#3a281c", opacity=0.7)
    for x, y, rr in ((50, 60, 30), (128, 150, 36), (206, 44, 22), (206, 190, 26), (50, 210, 20)):
        bead(a, x, y, rr)
        a.path(f"M{x - rr * 0.5},{y - rr - 6} v-22 M{x + rr * 0.4},{y - rr - 4} v-14", stroke="#f4f8fa", stroke_width=1.5, opacity=0.6)
    for x, y in ((90, 120), (168, 86), (90, 236), (168, 232)):
        dome(a, x, y, 0.9)


def ev_wind(a):
    wall(a, "#8f8466", 0.1)
    for i in range(5):
        y = 28 + i * 40
        a.path(f"M-10,{y} Q60,{y - 22} 128,{y} T266,{y}", fill="none", stroke=kit.PAPER, stroke_width=11 - i, opacity=0.5,
               stroke_linecap="round")
        gust(a, 10 + (i % 2) * 60, y + 4, 120 + (i % 3) * 30, 1.2, col=kit.SAGE)
    a.path(f"M0,222 Q128,206 {EW},222 V{EH} H0Z", fill="#5a3d2b", stroke=INK, stroke_width=1.5)
    for x, ln in ((60, 12), (140, 18), (214, 10)):
        a.open("g", transform=f"rotate({ln} {x} 220)")
        a.rect(x - 8, 150, 16, 70, fill="#b58d62", stroke=INK, stroke_width=1.3)
        a.path(f"M{x - 12},150 h24 l-3,-10 h-18Z", fill=RUB, stroke=INK, stroke_width=1.2)
        a.close()
    kit.kite(a, 216, 66, 1.4, col=kit.LIME, string_to=(150, 214))


def ev_beetle(a):
    wall(a, "#6f5a44", 0.3)
    a.ellipse(128, 250, 150, 170, fill="#141a17", stroke=INK, stroke_width=2)
    a.path("M128,82 V262 M70,110 Q54,180 60,262 M186,110 Q202,180 196,262", fill="none", stroke="#2e3a34", stroke_width=3)
    a.path("M40,150 Q70,100 118,90", fill="none", stroke="#cfe0c8", stroke_width=6, opacity=0.25, stroke_linecap="round")
    a.path("M96,86 Q60,40 30,36 M160,86 Q196,40 226,36", fill="none", stroke="#141a17", stroke_width=5, stroke_linecap="round")
    a.path(f"M0,236 Q128,222 {EW},236 V{EH} H0Z", fill="#5a3d2b", stroke=INK, stroke_width=1.5)
    for i in range(6):
        dome(a, 22 + i * 42, 236 - (i % 2) * 3, 0.62)
    for x in (60, 190):
        kit.person(a, x, 246, 0.26, sil=kit.PAPER, arms=((-18, -84), (18, -84)))


def ev_leaf(a):
    a.rect(0, 0, EW, EH, fill="#d9c28c")
    a.rect(0, 0, 70, EH, fill="#6f5238")
    a.path("M70,0 q-10,60 4,120 q-12,70 -2,142", fill="none", stroke=INK, stroke_width=2)
    for y in (70, 150, 220):
        dome(a, 44, y, 0.8)
        a.path(f"M22,{y} H70", stroke=INK, stroke_width=1.5)
    a.open("g", transform="rotate(-24 170 124)")
    leaf(a, 170, 124, 3.5, 0, col="#c8702a")
    a.path("M130,60 Q150,110 126,170", fill="none", stroke="#f0c050", stroke_width=6, opacity=0.35, stroke_linecap="round")
    a.close()
    a.path("M214,6 q10,26 0,48 M236,30 q8,20 0,38", fill="none", stroke=RUB, stroke_width=2, stroke_linecap="round")
    kit.person(a, 50, 150, 0.3, sil=INK, arms=((-10, -40), (24, -70)))


def ev_song(a):
    a.rect(0, 0, EW, EH, fill=a.gradient([(0, "#f3dfa2"), (1, "#e8b872")]))
    for i in range(5):
        y0 = 26 + i * 30
        pts = [(250 - k * 34, y0 + k * 9 + 9 * math.sin(k * 1.3 + i)) for k in range(7)]
        a.path(a.smooth_d(pts), fill="none", stroke=RUB, stroke_width=1.2, opacity=0.8)
        for k in range(1, 6 - (i % 2)):
            note(a, pts[k][0], pts[k][1], 0.75, col=GOLD if (k + i) % 2 else kit.PAPER, flag=(k % 2 == 0))
    a.path("M0,214 Q120,196 256,226", fill="none", stroke=INK, stroke_width=20, stroke_linecap="round")
    a.path("M0,214 Q120,196 256,226", fill="none", stroke="#8a6344", stroke_width=16, stroke_linecap="round")
    a.path("M20,210 Q110,196 200,212", fill="none", stroke="#c99a6a", stroke_width=2, opacity=0.8)
    for x, y, s in ((60, 204, 0.42), (96, 200, 0.5), (130, 200, 0.44), (164, 204, 0.4)):
        kit.person(a, x, y, s, kind="robe" if x != 96 else "apron", cloth=kit.GREYBROWN, arms=((-16, -70), (22, -84)))


def ev_year(a):
    a.rect(0, 0, EW, EH, fill="#caa173")
    kit.rings(a, 128, 131, 8, r0=12, gap=13, width=2.6, stroke=INK, light="#f3dfa2", lit_last=RUB)
    a.line(128, 131, 128, 6, stroke=INK, stroke_width=3)
    for k, (dx, dy) in enumerate(((0, -1), (1, 0), (0, 1), (-1, 0))):
        x, y = 128 + dx * 100, 131 + dy * 108
        a.circle(x, y, 18, fill=kit.PAPER, stroke=INK, stroke_width=1.4)
        if k == 0:
            kit.suit_mark(a, "rain", x, y, 0.8)
        elif k == 1:
            a.circle(x, y, 7, fill=GOLD, stroke=INK, stroke_width=1)
            for i in range(8):
                t = i * math.pi / 4
                a.line(x + 10 * math.cos(t), y + 10 * math.sin(t), x + 14 * math.cos(t), y + 14 * math.sin(t), stroke=INK, stroke_width=1.3)
        elif k == 2:
            kit.suit_mark(a, "leaf", x, y, 0.8, col="#c8702a")
        else:
            kit.alch_symbol(a, "frost", x, y, 0.6, w=1.6)


def ev_shadow(a):
    wall(a, "#8a6344", 0.15)
    city(a, 226, n=8)
    for i in range(5):
        x = 22 + i * 46
        ln = (150, 196, 214, 190, 120)[i]
        a.path(f"M{x - 16},-10 Q{x - 20},{ln * 0.6} {x - 12},{ln} Q{x},{ln + 22} {x + 12},{ln} Q{x + 20},{ln * 0.6} {x + 16},-10Z",
               fill="#0d0805", opacity=0.82)
    a.rect(0, 0, EW, 60, fill="#0d0805", opacity=0.82)
    for x, y in ((40, 236), (128, 232), (220, 238)):
        a.circle(x, y, 16, fill=a.radial([(0, kit.LANTERN, 0.9), (1, kit.LANTERN, 0)]))
    kit.kite(a, 232, 150, 1.0, col=GOLD, string_to=(216, 222))


def ev_pulse(a):
    a.rect(0, 0, EW, EH, fill="#16110d")
    a.rect(0, 0, EW, EH, fill="#2a2018", opacity=0.9)
    r = a.rng
    for i in range(34):
        x, y = r.uniform(10, EW - 20), r.uniform(10, EH - 70)
        a.path(f"M{f(x)},{f(y)} l5,-3 l-1,5 l6,-2", fill="none", stroke=kit.CHALK, stroke_width=1.3, stroke_linecap="round",
               opacity=r.uniform(0.25, 0.95))
    a.path(f"M0,222 Q128,208 {EW},222 V{EH} H0Z", fill="#0d0805", stroke=INK, stroke_width=1.5)
    for i in range(6):
        dome(a, 24 + i * 42, 224, 0.7, lit=(i == 2), col="#3a281c")
    a.circle(108, 218, 30, fill=a.radial([(0, kit.LANTERN, 0.75), (1, kit.LANTERN, 0)]))
    kit.person(a, 150, 240, 0.5, sil="#0d0805", lean=12, arms=((-10, -42), (18, -70)))
    for k in range(3):
        rr = 9 + k * 9
        a.path(f"M{166 - rr * 0.2},{196 - rr} A{rr},{rr} 0 0,1 {166 - rr * 0.2},{196 + rr}", fill="none", stroke=kit.CHALK,
               stroke_width=1.6, opacity=0.9 - k * 0.25)


EVENTS = [
    ("tremor", "The Tremor", "tremor", ev_tremor, "The world shakes at dawn: three cracks of light down the wall, dust coming off every ridge, small figures running."),
    ("rain", "The Rain", "rain", ev_rain, "Houses of water roll down the grooves, each bead bigger than the dwellings beside it."),
    ("wind", "The Windstorm", "wind", ev_wind, "Bands of wind sweep the bark; three towers lean and a kite strains on its thread."),
    ("beetle", "The Beetle", "mandible", ev_beetle, "A shape as big as a city climbs from the Under behind the roofs, two feelers above it, nothing of it clear."),
    ("leaf", "The Leaf", "leaf", ev_leaf, "A country-sized leaf falls past the city, filling the sky beside the wall."),
    ("song", "The Birdsong", "song", ev_song, "A singer above, five phrases: five falling lines of notes over listeners gathered on the Branch."),
    ("year", "The Year", None, ev_year, "Pell's last reading: the year as a slice of rings, its newest ring in red, the four seasons at its quarters."),
    ("shadow", "The Shadow", None, ev_shadow, "The world goes dark: five long bars of shadow lie down the wall onto a city of lit doorways."),
    ("pulse", "The Pulse", None, ev_pulse, "A night with nothing in the sky: one lit door, a listener at the wall, and faint cold ticks all through the wood."),
]


def event_card(a, name, suit, pic):
    stock(a, "#d8c49a", vig=0.4)
    a.rect(10, 10, CW - 20, CH - 20, rx=10, fill="none", stroke=RUB, stroke_width=6)
    a.rect(17, 17, CW - 34, CH - 34, rx=7, fill="none", stroke=INK, stroke_width=1)
    a.rect(90, 6, 120, 30, rx=4, fill=RUB, stroke=INK, stroke_width=1.2)
    a.text(150, 27, "EVENT", size=17, family="serif", fill=kit.PAPER, text_anchor="middle", letter_spacing=5)
    cp = a.clip(f'<path d="M0,40 A128,60 0 0,1 {EW},40 V{EH} H0Z"/>')
    a.open("g", transform="translate(22 48)")
    a.open("g", clip_path=cp)
    pic(a)
    a.close()
    a.path(f"M0,40 A128,60 0 0,1 {EW},40 V{EH} H0Z", fill="none", stroke=INK, stroke_width=2.2)
    a.close()
    a.text(150, 348, name.upper(), size=23, family="serif", fill=INK, text_anchor="middle", letter_spacing=3, font_weight="bold")
    a.path("M56,360 H244", stroke=RUB, stroke_width=1.2)
    if suit:
        a.circle(128, 384, 15, fill=WASH[suit], stroke=INK, stroke_width=1.3)
        kit.suit_mark(a, suit, 128, 385, 0.62)
    else:
        a.circle(128, 384, 15, fill="none", stroke=INK, stroke_width=1.3, stroke_dasharray="3 3")
    for k in range(2):
        a.circle(160 + k * 19, 384, 7, fill=GOLD, stroke=INK, stroke_width=1.2)
    for sgn in (-1, 1):
        kit.vine(a, [(150 + sgn * 62, 384), (150 + sgn * 84, 378), (150 + sgn * 108, 388)], curl=0.6, width=1.4)
    finish(a)


for eid, name, suit, pic, what in EVENTS:
    def _mk(name=name, suit=suit, pic=pic, what=what):
        def draw(a: Art):
            event_card(a, name, suit, pic)
        draw.__doc__ = f"Event card {name}, as the people saw it. {what} Weight 2" + (f", suit {suit.capitalize()}." if suit else ", no suit.")
        return draw
    asset(G, f"event-{eid}", group="cards", title=f"Event card: {name}", w=CW, h=CH, row=ROW)(_mk())


# ---------------------------------------------------------------------------------------------
# Backyard faces: the real cause, small and plain. No ornament, no words, no face.
# ---------------------------------------------------------------------------------------------
YW, YH = 252, 300


def yard(a, sky=kit.SKY, grass=kit.GRASS, horizon=214, fence=True):
    a.rect(0, 0, YW, YH, fill=sky)
    if fence:
        for i in range(12):
            x = 4 + i * 22
            a.path(f"M{x},{horizon - 44} l8,-8 l8,8 V{horizon + 4} h-16Z", fill=kit.FENCE, stroke="#9aa3a0", stroke_width=1)
        a.rect(0, horizon - 30, YW, 5, fill=kit.FENCE, stroke="#9aa3a0", stroke_width=0.8)
    a.rect(0, horizon, YW, YH - horizon, fill=grass)
    a.path("".join(f"M{8 + i * 13},{horizon + 14 + (i * 37) % 60} l2,-7 l2,7" for i in range(19)), fill="none", stroke="#5c8a3e",
           stroke_width=1.2)


def trunk(a, x=0, w=74, base=YH):
    a.path(f"M{x},0 H{x + w} Q{x + w - 8},{base * 0.7} {x + w + 16},{base} H{x - 10} Q{x + 6},{base * 0.6} {x},0Z", fill="#7a5a40",
           stroke="#4a3324", stroke_width=1.6)
    r = a.rng
    a.path("".join(f"M{f(x + r.uniform(6, w - 6))},{f(r.uniform(0, base - 60))} q{f(r.uniform(-4, 4))},20 0,{f(r.uniform(30, 56))}"
                   for _ in range(12)), fill="none", stroke="#4a3324", stroke_width=1.3)


def by_tremor(a):
    yard(a)
    trunk(a, 0, 96)
    # the squirrel, clinging head-down, one hind foot scratching
    a.path("M96,60 Q168,20 176,86 Q180,124 142,128 Q170,110 160,82 Q150,56 108,84Z", fill="#b5733a", stroke="#5a3d2b", stroke_width=1.5)
    a.ellipse(100, 120, 24, 36, fill="#c98a4a", stroke="#5a3d2b", stroke_width=1.5, transform="rotate(14 100 120)")
    a.ellipse(88, 164, 14, 12, fill="#c98a4a", stroke="#5a3d2b", stroke_width=1.5)
    a.path("M84,150 l-4,-10 l8,6Z M96,152 l4,-10 l4,10Z", fill="#b5733a", stroke="#5a3d2b", stroke_width=1)
    a.path("M112,98 q18,-2 14,14 M110,140 q10,8 2,16", fill="none", stroke="#5a3d2b", stroke_width=4, stroke_linecap="round")
    a.path("M132,104 l8,-4 M134,112 l9,0 M132,120 l8,4", stroke="#5a3d2b", stroke_width=1.3, stroke_linecap="round")


def by_rain(a):
    yard(a, sky="#c9d3d8", grass="#73a257")
    trunk(a, 180, 60)
    for cx, cy, rr in ((70, 50, 30), (110, 40, 36), (150, 54, 28), (100, 64, 34)):
        a.circle(cx, cy, rr, fill="#eef1f2", stroke="#9aa3a0", stroke_width=1)
    a.rect(60, 60, 100, 24, fill="#eef1f2")
    a.path("".join(f"M{52 + i * 13},{96 + (i % 3) * 10} l-5,18" for i in range(10)) +
           "".join(f"M{58 + i * 13},{140 + (i % 2) * 12} l-5,18" for i in range(10)), stroke="#5b86a8", stroke_width=2,
           stroke_linecap="round")
    a.ellipse(96, 262, 44, 9, fill="#9cc0d6", stroke="#5b86a8", stroke_width=1)


def by_wind(a):
    yard(a)
    a.line(20, 60, 20, 232, stroke="#8a8f8c", stroke_width=5)
    a.line(232, 70, 232, 232, stroke="#8a8f8c", stroke_width=5)
    a.path("M20,66 Q126,96 232,76", fill="none", stroke="#6f7471", stroke_width=1.5)
    for x, y, col, w in ((60, 80, "#e8e4d8", 34), (112, 88, "#d98a6a", 28), (166, 86, "#8fb4cf", 38)):
        a.path(f"M{x},{y} l{w},2 q10,30 30,44 q-26,10 -52,-4 q8,-22 -8,-42Z", fill=col, stroke="#7d7f7c", stroke_width=1.2)
    for y in (140, 176):
        a.path(f"M30,{y} q40,-12 80,0 t80,0", fill="none", stroke="#ffffff", stroke_width=2.5, opacity=0.8, stroke_linecap="round")
    for x, y in ((80, 244), (150, 226), (200, 262)):
        leaf(a, x, y, 0.22, x, col="#5c8a3e", vein=False)


def by_beetle(a):
    yard(a, horizon=120, fence=False)
    a.rect(0, 0, YW, 120, fill="#cfe2ee")
    trunk(a, 150, 110, base=YH)
    a.path("".join(f"M{10 + i * 12},{250 + (i % 3) * 8} q-4,-40 6,-70" for i in range(13)), fill="none", stroke="#5c8a3e", stroke_width=3,
           stroke_linecap="round")
    a.open("g", transform="translate(86 214) rotate(-18)")
    for lx in (-22, 0, 22):
        a.path(f"M{lx},-10 l-8,-26 l-12,-8 M{lx},10 l-8,26 l-12,8", fill="none", stroke="#1e2420", stroke_width=3, stroke_linecap="round",
               stroke_linejoin="round")
    a.ellipse(0, 0, 40, 24, fill="#2e3a34", stroke="#141a17", stroke_width=1.5)
    a.line(-36, 0, 38, 0, stroke="#141a17", stroke_width=1.2)
    a.ellipse(48, 0, 14, 13, fill="#1e2420", stroke="#141a17", stroke_width=1.5)
    a.path("M58,-6 q14,-4 16,6 M58,6 q14,4 12,-4 M52,-10 q8,-22 26,-24 M52,10 q8,22 26,24", fill="none", stroke="#141a17", stroke_width=2)
    a.ellipse(-12, -8, 18, 6, fill="#cfe0c8", opacity=0.3)
    a.close()


def by_leaf(a):
    yard(a, sky="#d9dfd6", grass="#9a9a52")
    trunk(a, 0, 70)
    a.path("M70,60 Q130,40 200,56 M70,110 Q120,96 160,104", fill="none", stroke="#5a3d2b", stroke_width=6, stroke_linecap="round")
    for x, y, rot, col in ((120, 44, 20, "#c8702a"), (176, 50, -30, "#b8862a"), (140, 100, 40, "#a8321e"), (110, 150, 80, "#c8702a"),
                           (190, 130, 150, "#b8862a"), (150, 196, 200, "#c8702a"), (214, 190, 60, "#a8321e")):
        leaf(a, x, y, 0.36, rot, col=col, vein=False)
    a.path("M96,270 q30,-22 60,-6 q24,-10 44,6Z", fill="#b8862a", stroke="#7a5a2a", stroke_width=1.2)
    a.line(228, 120, 206, 268, stroke="#8a6a48", stroke_width=4, stroke_linecap="round")
    a.path("M192,264 h30 M194,264 v12 M201,264 v12 M208,264 v12 M215,264 v12 M221,264 v12", stroke="#6f7471", stroke_width=2)


def by_song(a):
    yard(a, horizon=250, fence=False)
    a.path("M0,150 Q110,132 252,170", fill="none", stroke="#5a3d2b", stroke_width=14, stroke_linecap="round")
    a.path("M150,152 q30,-30 70,-30", fill="none", stroke="#5a3d2b", stroke_width=5, stroke_linecap="round")
    leaf(a, 222, 112, 0.34, 70, col="#c8702a", vein=False)
    a.ellipse(104, 116, 36, 26, fill="#c8a06a", stroke="#5a3d2b", stroke_width=1.5, transform="rotate(-12 104 116)")
    a.path("M128,106 Q170,110 186,134 Q150,138 124,126Z", fill="#8a6a48", stroke="#5a3d2b", stroke_width=1.3)
    a.circle(74, 94, 17, fill="#b5733a", stroke="#5a3d2b", stroke_width=1.5)
    a.path("M58,90 l-18,-6 l16,12Z M58,96 l-16,8 l18,-2Z", fill="#e0b040", stroke="#5a3d2b", stroke_width=1)
    a.circle(70, 90, 2.6, fill="#1b120c")
    a.path("M96,140 v12 M110,140 v12", stroke="#5a3d2b", stroke_width=2)
    for x, y in ((28, 62), (16, 86), (34, 112)):
        a.path(f"M{x},{y} q6,-6 12,0", fill="none", stroke="#8a8f8c", stroke_width=1.6, stroke_linecap="round")


def by_shadow(a):
    yard(a)
    trunk(a, 0, 104)
    # a sleeve and a hand, three knuckles to the bark. No face.
    a.path("M252,96 L170,112 L168,170 L252,196Z", fill="#6f86a0", stroke="#4a5a6e", stroke_width=1.5)
    a.path("M170,112 q-10,28 -2,58", fill="none", stroke="#4a5a6e", stroke_width=5)
    a.path("M172,118 Q140,110 118,122 Q102,130 104,142 Q106,150 118,146 L112,152 Q106,160 116,164 Q112,172 122,174 "
           "Q124,182 136,178 Q160,176 170,164Z", fill="#e3b896", stroke="#9a6a4a", stroke_width=1.5, stroke_linejoin="round")
    a.path("M118,146 q10,-4 18,-2 M116,164 q10,-6 20,-4 M122,174 q10,-4 16,-4", fill="none", stroke="#9a6a4a", stroke_width=1.2)
    for k in range(3):
        a.path(f"M{92 - k * 8},{130 + k * 2} q-6,12 0,24", fill="none", stroke="#4a3324", stroke_width=1.6, stroke_linecap="round",
               opacity=1 - k * 0.25)


BACKYARD = [
    ("tremor", "a squirrel", "tremor", by_tremor, "a squirrel clinging head-down to the trunk, scratching an itch with a hind foot"),
    ("rain", "a spring shower", "rain", by_rain, "a small cloud raining on the lawn beside the tree, a puddle forming"),
    ("wind", "a summer gust", "wind", by_wind, "washing blown sideways on the line between two posts"),
    ("beetle", "a ground beetle", "mandible", by_beetle, "a ground beetle walking through the grass toward the foot of the tree"),
    ("leaf", "autumn", "leaf", by_leaf, "leaves coming down off two bare branches onto a raked pile, the rake against the fence"),
    ("song", "a small bird", "song", by_song, "a small brown bird singing on a branch"),
    ("shadow", "a hand, checking for termites", None, by_shadow, "a sleeve and a hand reaching in from the edge, knuckles to the bark; no face is shown"),
]


def backyard_card(a, suit, pic):
    stock(a, "#f6f1e4", vig=0.12, vcol="#8a8f8c")
    a.rect(14, 14, CW - 28, CH - 28, rx=10, fill="none", stroke="#8a8f8c", stroke_width=1.2)
    cp = a.clip(f'<rect x="0" y="0" width="{YW}" height="{YH}" rx="6"/>')
    a.open("g", transform="translate(24 24)")
    a.open("g", clip_path=cp)
    if pic:
        pic(a)
    a.close()
    a.rect(0, 0, YW, YH, rx=6, fill="none", stroke="#6f7471", stroke_width=1.4, stroke_dasharray=None if pic else "5 6")
    a.close()
    if suit:
        a.circle(256, 368, 22, fill=WASH[suit], stroke=INK, stroke_width=1.4)
        kit.suit_mark(a, suit, 256, 369, 0.95)
        a.path("M40,368 H222", stroke="#8a8f8c", stroke_width=1, stroke_dasharray="2 5")
    finish(a)


for bid, cause, suit, pic, what in BACKYARD:
    def _mk(cause=cause, suit=suit, pic=pic, what=what):
        def draw(a: Art):
            backyard_card(a, suit, pic)
        draw.__doc__ = (f"Backyard card, turned: the real cause, {cause}, drawn small and plain in ordinary daylight: {what}. "
                        + (f"In its corner, the suit that fits: {suit.capitalize()}." if suit else "It has no fitting suit."))
        return draw
    asset(G, f"backyard-{bid}", group="cards", title=f"Backyard card: {cause}", w=CW, h=CH, row=ROW)(_mk())


@asset(G, "backyard-blank", group="cards", title="Backyard card: blank", w=CW, h=CH, row=ROW)
def backyard_blank(a: Art):
    """The Backyard card of the midpoint, turned over and blank: the same plain stock and the same empty window,
    with no cause in it and no suit in its corner. Only the fibre of the paper and one old thumb-mark."""
    backyard_card_blank(a)


def backyard_card_blank(a):
    stock(a, "#f6f1e4", vig=0.12, vcol="#8a8f8c")
    a.rect(14, 14, CW - 28, CH - 28, rx=10, fill="none", stroke="#8a8f8c", stroke_width=1.2)
    a.rect(24, 24, YW, YH, rx=6, fill="#fbf8ef", opacity=0.6)
    a.rect(24, 24, YW, YH, rx=6, fill="none", stroke="#6f7471", stroke_width=1.2, stroke_dasharray="5 6")
    a.circle(256, 368, 22, fill="none", stroke="#8a8f8c", stroke_width=1.2, stroke_dasharray="3 5")
    a.path("M40,368 H222", stroke="#8a8f8c", stroke_width=1, stroke_dasharray="2 5")
    # a thumb-mark at the notch edge
    for k in range(6):
        a.ellipse(34, 214, 6 + k * 3.2, 9 + k * 4.4, fill="none", stroke="#b9a98a", stroke_width=0.9, opacity=0.5,
                  transform="rotate(-14 34 214)")
    finish(a)


# ---------------------------------------------------------------------------------------------
# Phase 3, the second playthrough: the first pull-back, with a stump over the fence.
# ---------------------------------------------------------------------------------------------
def by_wind_stump(a):
    """by_wind, with a sawn stump in the next yard showing over the fence."""
    horizon = 214
    a.rect(0, 0, YW, YH, fill=kit.SKY)
    a.path("M168,176 Q169,160 174,152 L204,152 Q209,160 210,176Z", fill="#8f8a80", stroke="#4a4a44", stroke_width=1.2)
    a.ellipse(189, 152, 16, 4.5, fill="#d7cbb4", stroke="#4a4a44", stroke_width=1.2)
    for rr in (11, 6):
        a.ellipse(189, 152, rr, rr * 0.28, fill="none", stroke="#a8977a", stroke_width=0.9)
    a.path("M170,160 q-6,-5 -10,1 M208,160 q6,-5 9,2", fill="none", stroke="#5c8a3e", stroke_width=1.4, stroke_linecap="round")
    for i in range(12):
        x = 4 + i * 22
        a.path(f"M{x},{horizon - 44} l8,-8 l8,8 V{horizon + 4} h-16Z", fill=kit.FENCE, stroke="#9aa3a0", stroke_width=1)
    a.rect(0, horizon - 30, YW, 5, fill=kit.FENCE, stroke="#9aa3a0", stroke_width=0.8)
    a.rect(0, horizon, YW, YH - horizon, fill=kit.GRASS)
    a.path("".join(f"M{8 + i * 13},{horizon + 14 + (i * 37) % 60} l2,-7 l2,7" for i in range(19)), fill="none", stroke="#5c8a3e",
           stroke_width=1.2)
    a.line(20, 60, 20, 232, stroke="#8a8f8c", stroke_width=5)
    a.line(232, 70, 232, 232, stroke="#8a8f8c", stroke_width=5)
    a.path("M20,66 Q126,96 232,76", fill="none", stroke="#6f7471", stroke_width=1.5)
    for x, y, col, w in ((60, 80, "#e8e4d8", 34), (112, 88, "#d98a6a", 28), (166, 86, "#8fb4cf", 38)):
        a.path(f"M{x},{y} l{w},2 q10,30 30,44 q-26,10 -52,-4 q8,-22 -8,-42Z", fill=col, stroke="#7d7f7c", stroke_width=1.2)
    for y in (140, 176):
        a.path(f"M30,{y} q40,-12 80,0 t80,0", fill="none", stroke="#ffffff", stroke_width=2.5, opacity=0.8, stroke_linecap="round")
    for x, y in ((80, 244), (150, 226), (200, 262)):
        leaf(a, x, y, 0.22, x, col="#5c8a3e", vein=False)


@asset(G, "backyard-wind-stump", group="cards", title="Backyard card: a summer gust, and a stump over the fence", w=CW, h=CH, row=ROW)
def backyard_wind_stump(a: Art):
    """The first Backyard card as a second playthrough shows it: washing blown sideways on the line, as before, and over
    the fence in the next yard a low sawn stump, weathered grey, with grass grown up round it. In its corner, Wind."""
    backyard_card(a, "wind", by_wind_stump)


@asset(G, "omen-back", group="cards", title="Omen card: the back", w=CW, h=CH, row=ROW)
def omen_back(a: Art):
    """The back of Pell's deck: bark-brown stock printed with a knot's growth rings in gold and an eye at the
    pith, a vine border, and the worn left edge where forty years of a thumb have found the notches."""
    stock(a, "#6a3a22", vig=0.5, vcol="#1b120c")
    a.rect(14, 14, CW - 28, CH - 28, rx=10, fill="none", stroke=GOLD, stroke_width=1.6)
    a.rect(22, 22, CW - 44, CH - 44, rx=7, fill="#5a2e1a", stroke=GOLD, stroke_width=0.8)
    cp = a.clip(f'<rect x="22" y="22" width="{CW - 44}" height="{CH - 44}" rx="7"/>')
    a.open("g", clip_path=cp)
    kit.rings(a, 150, 210, 15, r0=26, gap=13, width=1.5, stroke=GOLD, light="#3a1c10", wob=0.09)
    a.close()
    a.circle(150, 210, 30, fill="#5a2e1a", stroke=GOLD, stroke_width=1.6)
    kit.sigil(a, "eye", 150, 210, 1.05, col=GOLD, w=2.4)
    for x, y in ((40, 40), (260, 40), (40, 380), (260, 380)):
        a.circle(x, y, 9, fill="#5a2e1a", stroke=GOLD, stroke_width=1.4)
        kit.suit_mark(a, "leaf", x, y, 0.42, col=GOLD)
    a.rect(0, 60, 16, 260, fill=a.gradient([(0, "#d8a070"), (1, "#d8a070")]), opacity=0.25)
    for y in (86, 102, 128, 160, 176):
        a.poly([(0, y - 6), (9, y), (0, y + 6)], fill="#1b120c")
    finish(a)

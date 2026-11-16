"""Phase 3: the fourth row's six world-held parts, the notebook page, the ending-card lettering and the Record's last page.

The reliquary hand (bone, tarnished silver, fine black cracks, a starry void, one realm accent). Each part is the
place where it was noticed, with the glyph part it keeps lit in gold: the same strokes as the glyph art (60_glyphs.py),
so the notebook and the seal show one letterform.
"""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
BONE, SILVER, VOID, INK, GOLD = kit.BONE, kit.SILVER, kit.VOID, kit.INK, kit.GOLD
ROW = "Fourth-row parts, the notebook page, ending lettering (phase 3)"

# the glyph parts each place keeps (60_glyphs.py PARTS, in a 100 x 100 box)
PART = {
    "crown-02": "M25,26 L50,8 L75,26",
    "stem-01": "M50,28 V72",
    "foot-01": "M28,82 H72",
    "mark-03": "M82,40 L90,50 L82,60 L74,50Z",
}
# a part's own box inside the 100 box, so it can be centred
BOX = {"crown-02": (25, 8, 50, 18), "stem-01": (44, 28, 12, 44), "foot-01": (28, 76, 44, 12), "mark-03": (74, 40, 16, 20)}


def lit_part(a, part, cx, cy, size):
    """The kept part, centred at (cx, cy), drawn as a gold stroke with its light around it."""
    bx, by, bw, bh = BOX[part]
    k = size / max(bw, bh, 30)
    t = f"translate({f(cx - (bx + bw / 2) * k)},{f(cy - (by + bh / 2) * k)}) scale({f(k)})"
    w = 4.6 / k * (size / 60) if size > 80 else 6.5 / k
    closed = part.endswith("03")
    for wk, op in ((5.5, 0.08), (4, 0.12), (2.8, 0.18)):   # the light round it, in soft rings (no filter box)
        a.path(PART[part], fill="none", stroke=GOLD, stroke_width=w * wk, opacity=op, stroke_linecap="round", stroke_linejoin="round", transform=t)
    a.path(PART[part], fill="none", stroke=INK, stroke_width=w * 1.7, stroke_linecap="round", stroke_linejoin="round", transform=t)
    a.path(PART[part], fill="#fff3c0" if closed else "none", stroke="#f3d27a", stroke_width=w, stroke_linecap="round", stroke_linejoin="round", transform=t)
    a.path(PART[part], fill="none", stroke="#fffbe8", stroke_width=w * 0.35, stroke_linecap="round", stroke_linejoin="round", transform=t, opacity=0.9)


def frame(a, acc):
    """A carved silver frame round a square part image."""
    W = a.w
    a.rect(2, 2, W - 4, W - 4, fill="none", stroke=kit.silver_grad(a), stroke_width=6)
    a.rect(6, 6, W - 12, W - 12, fill="none", stroke=INK, stroke_width=1.2)
    a.rect(9, 9, W - 18, W - 18, fill="none", stroke=acc, stroke_width=1, opacity=0.55)
    for x, y in ((8, 8), (W - 8, 8), (8, W - 8), (W - 8, W - 8)):
        a.circle(x, y, 5, fill=kit.bone_grad(a), stroke=INK, stroke_width=1)


def part_west(a):
    """The split cedar: two halves of bark, and the straight crack down between them that does not move."""
    r = a.rng
    kit.void(a, glow=(kit.MOSS, 0.5, 0.45, 0.6), stars=60)
    for side in (-1, 1):
        x0 = 100 + side * 8
        pts = [(x0, 14), (x0 + side * 70, 24), (x0 + side * 78, 186), (x0, 190)]
        a.path(kit.pd(pts), fill=a.gradient([(0, "#4b3a26"), (0.6, "#2e2418"), (1, "#18120c")], 0, 0, 1, 0) if side < 0 else a.gradient([(0, "#18120c"), (0.4, "#2e2418"), (1, "#4b3a26")], 0, 0, 1, 0))
        for k in range(9):
            bx = x0 + side * (10 + k * 7.5)
            a.path(f"M{f(bx)},20 C{f(bx + r.uniform(-5, 5))},70 {f(bx + r.uniform(-5, 5))},130 {f(bx + r.uniform(-3, 3))},186", fill="none", stroke="#6d5a3c" if k % 2 else "#120d08", stroke_width=r.uniform(1, 2.4), opacity=0.8)
        for k in range(5):
            a.ellipse(x0 + side * r.uniform(20, 60), r.uniform(30, 170), r.uniform(3, 7), r.uniform(8, 14), fill=kit.MOSS, opacity=0.5)
    a.rect(92, 14, 16, 176, fill="#0a0806")
    lit_part(a, "stem-01", 100, 102, 150)


def part_north(a):
    """Aetherius's neck: pale, parchment scales, and on them a mark like a roof-peak."""
    kit.void(a, glow=(kit.SKY, 0.5, 0.4, 0.7), stars=40)
    for row in range(9):
        for col in range(7):
            x = 18 + col * 28 + (14 if row % 2 else 0)
            y = 28 + row * 19
            d = f"M{f(x - 15)},{f(y)} Q{f(x)},{f(y + 24)} {f(x + 15)},{f(y)} Q{f(x)},{f(y + 8)} {f(x - 15)},{f(y)}Z"
            kit.relief(a, d, a.gradient([(0, "#f6efdc"), (1, "#b9b09a")], 0, 0, 0, 1), k=1)
            a.path(f"M{f(x - 12)},{f(y + 2)} Q{f(x)},{f(y + 19)} {f(x + 12)},{f(y + 2)}", fill="none", stroke=kit.SKY, stroke_width=0.8, opacity=0.6)
    kit.cracks(a, 20, 20, 160, 160, n=4, length=60, width=0.7)
    lit_part(a, "crown-02", 100, 96, 120)


def part_south(a):
    """The Heartstone: dark crystal with molten seams, and one vein lying level under the ring."""
    r = a.rng
    kit.void(a, glow=(kit.MOLTEN, 0.5, 0.6, 0.6), stars=30)
    polys = [[(14, 20), (86, 12), (70, 92), (20, 100)], [(86, 12), (186, 20), (172, 96), (70, 92)], [(20, 100), (70, 92), (96, 186), (14, 186)],
             [(70, 92), (172, 96), (186, 186), (96, 186)]]
    for i, p in enumerate(polys):
        a.path(kit.pd(p), fill=a.gradient([(0, "#3a3140"), (1, "#141018")], 0, 0, 1, 1), stroke="#000", stroke_width=1.5)
        a.path(kit.pd(p), fill="none", stroke="#8e97a3", stroke_width=0.8, opacity=0.5, transform="translate(-1,-1)")
    for _ in range(7):
        x, y = r.uniform(20, 180), r.uniform(20, 180)
        a.path(kit.crack_d(r, x, y, r.uniform(0, 6.28), r.uniform(30, 70), 9, 0.2), fill="none", stroke=kit.MOLTEN, stroke_width=1.6, opacity=0.75)
    a.circle(100, 100, 66, fill="none", stroke=kit.silver_grad(a), stroke_width=5, opacity=0.75)
    lit_part(a, "foot-01", 100, 118, 130)


def part_east(a):
    """The seabed: kelp moving over the sand, and one line of it lying flat, the same level line."""
    r = a.rng
    a.open("g", class_="plate")
    a.rect(0, 0, 200, 200, fill=a.gradient([(0, "#0b2a3d"), (0.7, "#123e55"), (1, "#3a4a46")], 0, 0, 0, 1))
    a.close()
    for k in range(14):
        a.circle(r.uniform(0, 200), r.uniform(0, 120), r.uniform(0.6, 1.6), fill="#cfe6f0", opacity=r.uniform(0.2, 0.6))
    a.path("M0,150 Q60,138 110,148 T200,144 V200 H0Z", fill=a.gradient([(0, "#6b6a58"), (1, "#3a3a30")], 0, 0, 0, 1))
    for k in range(9):
        x = 14 + k * 22
        pts = [(x, 158), (x + r.uniform(-10, 10), 120), (x + r.uniform(-14, 14), 80), (x + r.uniform(-12, 12), 40)]
        kit.brush(a, pts, r.uniform(4, 7), fill=kit.shade(kit.SEA, r.uniform(-0.3, 0.1)), opacity=0.85)
    lit_part(a, "foot-01", 100, 166, 150)


def part_below(a):
    """The Syndicate's table: a candle, and a shadow on the board that is not the candle's, a small diamond."""
    kit.void(a, glow=(kit.VIOLET, 0.3, 0.3, 0.7), stars=20)
    a.path("M0,128 H200 V200 H0Z", fill=a.gradient([(0, "#3a2a10"), (1, "#1a1206")], 0, 0, 0, 1))
    for k in range(10):
        a.rect(k * 20 + 1, 132, 18, 14, fill=["#c9a227", "#8a6a1c", "#b8901d"][k % 3], opacity=0.55)
    kit.relief(a, "M38,76 H54 V132 H38Z", kit.bone_grad(a), k=1.4)
    a.ellipse(46, 66, 9, 16, fill="#ffd27a", opacity=0.45, filter=a.blur(4))
    a.path("M46,52 Q53,64 46,74 Q39,64 46,52Z", fill="#ffe7a8")
    a.ellipse(140, 160, 44, 10, fill="#000", opacity=0.45, filter=a.blur(3))
    lit_part(a, "mark-03", 142, 150, 60)


def part_above(a):
    """The Priory's painted dome: deep blue, gold stars, and one star set with two lines meeting in a peak."""
    r = a.rng
    a.open("g", class_="plate")
    a.rect(0, 0, 200, 200, fill=a.radial([(0, "#2a3270", 1), (1, "#0b0d1a", 1)], 0.5, 0.9, 0.95))
    a.close()
    for k in range(5):
        a.path(f"M100,205 L{f(-20 + k * 60)},-5", stroke=kit.silver_grad(a), stroke_width=2.5, opacity=0.55)
    for _ in range(30):
        x, y, s = r.uniform(8, 192), r.uniform(8, 170), r.uniform(1.5, 3.4)
        a.path(f"M{f(x)},{f(y - s)} L{f(x + s * 0.35)},{f(y)} L{f(x)},{f(y + s)} L{f(x - s * 0.35)},{f(y)}Z M{f(x - s)},{f(y)} L{f(x)},{f(y - s * 0.35)} L{f(x + s)},{f(y)} L{f(x)},{f(y + s * 0.35)}Z", fill=GOLD, opacity=0.8)
    lit_part(a, "crown-02", 100, 90, 110)
    a.circle(100, 84, 4, fill="#fffbe8")


DRAW = dict(west=part_west, north=part_north, south=part_south, east=part_east, below=part_below, above=part_above)
SEEN = dict(west="the crack in the split tree", north="a rune on Aetherius's scales", south="a vein in the Heartstone",
            east="a kelp line on the seabed", below="a candle shadow in the forbidden chamber", above="a star in the Priory dome")


def reg(realm):
    acc = kit.REALMS[kit.REALM_IX[realm]]["acc"]

    @asset(G, f"fourth-part-{realm}", group="thread", title=f"The fourth row: {SEEN[realm]}", w=200, h=200, row=ROW)
    def draw(a: Art):
        DRAW[realm](a)
        frame(a, acc)
    draw.__doc__ = (f"One of the fourth row's six still parts, where it was noticed: {SEEN[realm]}. The place in the reliquary hand, "
                    f"the glyph part it keeps lit in gold, a carved silver frame with a {kit.REALMS[kit.REALM_IX[realm]]['name']} accent.")
    return draw


for _r in DRAW:
    reg(_r)


@asset(G, "fourth-row-page", group="ui", title="The notebook: the fourth row (page head)", w=1000, h=240, row=ROW)
def notebook_head(a: Art):
    """The notebook's page head for the fourth row: THE FOURTH ROW cut in bone capitals over a carved band of six empty
    sockets, one in each realm's colour, joined by a crack. The four glyph parts it will hold are cut faintly in the band."""
    r = a.rng
    kit.void(a, glow=(GOLD, 0.5, 0.6, 0.6), stars=140)
    kit.slab(a, 60, 120, 880, 96, rx=10, n_cracks=7)
    for i, realm in enumerate(kit.REALMS):
        cx = 140 + i * 144
        a.circle(cx, 168, 34, fill="#0b0d1a", stroke=kit.silver_grad(a), stroke_width=5)
        a.circle(cx, 168, 27, fill="none", stroke=realm["acc"], stroke_width=2, opacity=0.8)
        kit.emblem(a, i, cx, 168, 11, realm["acc"], raised=False)
    d = "".join(kit.crack_d(r, 140 + i * 144 + 34, 168, r.uniform(-0.3, 0.3), 76, 8, 0.0) for i in range(5))
    a.path(d, fill="none", stroke=INK, stroke_width=1.6)
    kit.carved_text(a, 500, 92, "THE FOURTH ROW", 64, fill=kit.bone_grad(a), spacing=10, k=2)


# ---- ending-card lettering: each ending's name in cracked bone capitals ------------------------------
ENDINGS = [
    ("the-rememberer", "THE REMEMBERER", kit.GOLD), ("remembered-whole", "REMEMBERED WHOLE", kit.SKY),
    ("dormant-again", "DORMANT AGAIN", kit.MOSS), ("architect-rises", "THE ARCHITECT RISES", kit.VIOLET),
    ("the-empty-saddle", "THE EMPTY SADDLE", kit.MOLTEN),
]


def reg_end(eid, words, acc):
    @asset(G, f"ending-title-{eid}", group="title", title=f"Ending lettering: {words.title()}", w=1200, h=220, row=ROW)
    def draw(a: Art):
        r = a.rng
        a.open("g", class_="plate")
        a.rect(0, 0, 1200, 220, fill=VOID)
        a.rect(0, 0, 1200, 220, fill=a.radial([(0, acc, 0.35), (1, acc, 0)], 0.5, 0.55, 0.6))
        a.close()
        word = dict(size=108, family="serif", text_anchor="middle", font_weight="bold", textLength=min(1120, 62 * len(words)), lengthAdjust="spacingAndGlyphs")
        x, y = 600, 140
        a.text(x + 6, y + 9, words, fill="#000", opacity=0.7, filter=a.blur(4), **word)
        a.text(x + 2, y + 3, words, fill=kit.silver_grad(a), stroke=kit.silver_grad(a), stroke_width=5, stroke_linejoin="round", **word)
        a.text(x - 1.6, y - 2.2, words, fill="#ffffff", **word)
        a.text(x, y, words, fill=a.gradient([(0, "#fdfaf0"), (0.5, BONE), (1, "#9a917b")]), **word)
        cl = a.clip(f'<text x="{x}" y="{y}" font-size="108" font-family="serif" text-anchor="middle" font-weight="bold" '
                    f'textLength="{word["textLength"]}" lengthAdjust="spacingAndGlyphs">{words}</text>')
        d = "".join(kit.crack_d(r, 600 - word["textLength"] / 2 + r.random() * word["textLength"], 60 + r.random() * 80, r.uniform(0, 6.28), r.uniform(30, 90), 8, 0.3) for _ in range(16))
        a.path(d, fill="none", stroke=INK, stroke_width=1.3, clip_path=cl, opacity=0.9)
        a.line(600 - word["textLength"] / 2, 176, 600 + word["textLength"] / 2, 176, stroke=SILVER, stroke_width=1.4, opacity=0.7)
        a.circle(600, 176, 6, fill=acc, stroke=INK, stroke_width=1.2)
    draw.__doc__ = (f"The ending's name, {words}, in cracked bone capitals edged with tarnished silver, over the void with one glow of its "
                    "accent; a silver rule under it with one accent stud. Lettering for the ending card.")
    return draw


for _e in ENDINGS:
    reg_end(*_e)


@asset(G, "doc-who-next", group="cards", title="The Record's last page: Who next?", w=600, h=800, row=ROW)
def who_next(a: Art):
    """The Record's final page, as The Empty Saddle ends: an ivory leaf in a silver binding, headed WHO NEXT? in carved
    capitals, its ruled lines empty; one crack runs down from the heading, and a single sun-gold and moon-silver stud
    marks the place. It is shown on a later run, when the notebook is opened."""
    r = a.rng
    kit.void(a, glow=(GOLD, 0.5, 0.3, 0.6), stars=120)
    kit.slab(a, 60, 50, 480, 700, rx=6, n_cracks=1)
    a.rect(78, 68, 444, 664, fill="none", stroke=kit.silver_grad(a), stroke_width=5)
    a.rect(88, 78, 424, 644, fill="none", stroke=INK, stroke_width=1)
    kit.carved_text(a, 300, 170, "WHO NEXT?", 50, fill=kit.bone_grad(a), spacing=3, k=1.6)
    for k in range(12):
        y = 240 + k * 38
        a.line(120, y, 480, y, stroke="#7a7262", stroke_width=1, opacity=0.6)
    a.path(kit.crack_d(r, 300, 196, math.pi / 2, 260, 9, 0.25), fill="none", stroke=INK, stroke_width=1.3)
    a.circle(300, 690, 10, fill=a.gradient([(0, "#e2b33c"), (1, "#d9dde2")], 0, 0, 1, 0), stroke=INK, stroke_width=1.2)

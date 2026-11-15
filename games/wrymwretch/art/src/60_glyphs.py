"""The Slipping Glyph: sixteen glyph parts as illuminated tiles and the twelve runes of the key, ink on vellum."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Slipping Glyph parts and rune key"
GLY = kit.data("glyph_pages")

# four families of parts, each stroke paths in a 100 x 100 box (the pictograph's own letterforms)
PARTS = {
    "crown": ["M25,22 Q50,2 75,22", "M25,26 L50,8 L75,26", "M30,14 H70 M50,14 V26", "M28,10 L50,26 L72,10"],
    "stem": ["M50,28 V72", "M50,28 Q36,50 50,72", "M42,28 V72 M58,28 V72", "M50,28 L40,50 L60,50 L50,72"],
    "foot": ["M28,82 H72", "M30,76 Q50,96 70,76", "M50,74 L32,92 M50,74 L68,92", "M30,92 L50,76 L70,92"],
    "mark": ["M82,50 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0", "M76,44 L88,56 M88,44 L76,56", "M82,40 L90,50 L82,60 L74,50Z", "M76,56 L82,42 L88,56"],
}
FIELD = {"crown": "#2b4c8c", "stem": "#a3322a", "foot": "#3f6a2c", "mark": "#5b3a7a"}
ZONE = {"crown": (20, 0, 60, 30), "stem": (32, 26, 36, 48), "foot": (24, 72, 52, 24), "mark": (70, 36, 24, 28)}
VELLUM = "#f3ead2"


def sprig(a, x, y, ang, s=1.0, n=4):
    """A vine sprig for a corner: stem, leaves, a gold bezant."""
    r = a.rng
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)}) scale({f(s)})")
    a.path("M0,0 q14,-16 34,-12 q14,4 20,-8", fill="none", stroke="#2f5a2a", stroke_width=2.2, stroke_linecap="round")
    for k in range(n):
        lx, ly = 8 + k * 12, -8 - 4 * math.sin(k * 1.3)
        a.ellipse(lx, ly - 5 * (1 if k % 2 else -1), 7, 3, fill="#4f7a34", transform=f"rotate({f(r.uniform(-50, 50))} {f(lx)} {f(ly)})")
    a.circle(56, -22, 3.6, fill="#e3b74a", stroke="#7a5310", stroke_width=0.8)
    a.close()


def reg_part(kind, i):
    name = f"{kind}_{i + 1:02d}"

    @asset(G, f"glyph-{kind}-{i + 1:02d}", group="pieces", title=f"Glyph part: {kind} {i + 1}", w=160, h=160, row=ROW)
    def draw(a: Art):
        gold = kit.gold_grad(a)
        r = a.rng
        a.open("g", class_="plate")   # the tile; the part alone is what a glyph in play is built from
        a.rect(0, 0, 160, 160, fill=gold)
        a.rect(7, 7, 146, 146, fill="#7a5310", opacity=0.55)
        a.rect(11, 11, 138, 138, fill=FIELD[kind])
        a.rect(11, 11, 138, 138, fill=a.radial([(0, "#ffffff", 0.16), (1, "#000000", 0.3)], 0.4, 0.35, 0.8))
        fil = []
        for k in range(5):
            for j in range(5):
                fx, fy = 26 + k * 27, 26 + j * 27
                fil.append(f"M{fx - 2},{fy}a2,2 0 1,0 4,0a2,2 0 1,0 -4,0M{fx + 11},{fy + 13.5}l3,-3l3,3l-3,3z")
        a.path("".join(fil), fill="#f3eee2", opacity=0.35)
        t = "translate(14,14) scale(1.32)"
        # where the other three parts stand: left dark, so only what stays is shown
        for other, (zx, zy, zw, zh) in ZONE.items():
            if other != kind:
                a.rect(zx, zy, zw, zh, rx=5, fill="none", stroke="#f3eee2", stroke_width=0.9, stroke_dasharray="2 4", opacity=0.45, transform=t)
        sprig(a, 18, 146, -8, 0.7)
        a.circle(144, 16, 5, fill="#a3322a", stroke=gold, stroke_width=1.5)
        a.close()
        d = PARTS[kind][i]
        a.path(d, fill="none", stroke="#1a1208", stroke_width=11, stroke_linecap="round", stroke_linejoin="round", opacity=0.5, transform="translate(16.5,17.5) scale(1.32)")
        a.path(d, fill="none", stroke=gold, stroke_width=9, stroke_linecap="round", stroke_linejoin="round", transform=t)
        a.path(d, fill="none", stroke="#fff6cf", stroke_width=2.2, stroke_linecap="round", stroke_linejoin="round", opacity=0.9, transform="translate(13,12.6) scale(1.32)")
    draw.__doc__ = (f"Slipping Glyph part {name} as an illuminated tile: the {kind} alone in raised gold on a painted field, the places of the "
                    "glyph's other three parts left as dotted ghosts.")
    return draw


for _kind in ("crown", "stem", "foot", "mark"):
    for _i in range(4):
        reg_part(_kind, _i)


def reg_rune(n, rune):
    parts = [PARTS[k][int(rune["parts"][k].split("_")[1]) - 1] for k in ("crown", "stem", "foot", "mark")]

    @asset(G, f"rune-{n:02d}", group="pieces", title=f"Rune {kit.ROMAN[n]} of the key", w=160, h=160, row=ROW)
    def draw(a: Art):
        r = a.rng
        a.paper(VELLUM, grain=0.28, fibre=0.7)
        a.rect(0, 0, 160, 160, fill=a.radial([(0.3, "#ffffff", 0), (1, "#8a6a3a", 0.35)], 0.5, 0.5, 0.75))
        a.rect(5, 5, 150, 150, fill="none", stroke="#7a5310", stroke_width=2)
        a.rect(10, 10, 140, 140, fill="none", stroke="#a3322a", stroke_width=0.9)
        t = "translate(20,16) scale(1.2)"
        d = " ".join(parts)
        a.path(d, fill="none", stroke="#8a6a3a", stroke_width=10, stroke_linecap="round", stroke_linejoin="round", opacity=0.25, transform="translate(22,18.5) scale(1.2)")
        a.path(d, fill="none", stroke="#201810", stroke_width=7.5, stroke_linecap="round", stroke_linejoin="round", transform=t, filter=a.roughen(1.6, 0.12))
        # the scribe's serifs: a dot of ink at each stroke's start
        a.text(144, 146, kit.ROMAN[n], size=17, family="serif", fill="#a3322a", text_anchor="end", font_weight="bold")
        corner = [(16, 30, 0), (144, 16, 90), (16, 146, -90)][n % 3]
        sprig(a, corner[0], corner[1], corner[2] + r.uniform(-10, 10), 0.6, n=3 + n % 3)
    draw.__doc__ = (f"Rune {n} of the Slipping Glyph's key, ink on vellum with a rubric numeral: "
                    f"{rune['parts']['crown']}, {rune['parts']['stem']}, {rune['parts']['foot']} and {rune['parts']['mark']} together. The key is recorded, so it does not slip.")
    return draw


for _n, _rune in enumerate(GLY["runes"], 1):
    reg_rune(_n, _rune)

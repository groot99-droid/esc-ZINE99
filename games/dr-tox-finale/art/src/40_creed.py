"""The Creed (1D, dominoes): pocket tract booklet.

A small stapled booklet on thin paper printed in two inks, black and one red: plain cartoon panels in an
even line, a heavy title band, his lines split across the two ends of a tile, a verse printed at the foot.
Each tile end is a panel with one of seven words (blank, RING, MARK, NEED, AMBER, RCC, BLOOD) and a small
cartoon; the line of his that a tile carries is lettered over the frame at run time. The one thing on the
page that is not printed in the tract's two inks is the painted sky Cally deals: it does not belong."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "creed"
INK, RED = "#1a1a1a", kit.PULP_RED
THIN, THIN2 = "#f5f1e6", "#e9e2d0"
LN = dict(stroke=INK, stroke_width=3, stroke_linejoin="round", stroke_linecap="round")


def cartoon(a, word, cx, cy, s=1.0):
    """The small plain-line cartoon for each word, in the tract's two inks."""
    L = dict(LN, stroke_width=3 * s)
    if word == "ring":
        a.circle(cx, cy - 8 * s, 22 * s, fill="none", **L)
        for k in range(3):
            a.path(kit.person_d(cx - 34 * s + k * 34 * s, cy + 34 * s, 0.17 * s), fill="none", **dict(L, stroke_width=2 * s))
    elif word == "mark":
        for k in range(2):
            a.line(cx - 20 * s + k * 18 * s, cy - 22 * s, cx - 8 * s + k * 18 * s, cy + 22 * s, **dict(L, stroke_width=6 * s))
        a.line(cx + 22 * s, cy - 22 * s, cx + 34 * s, cy + 22 * s, stroke=INK, stroke_width=2 * s, stroke_dasharray=f"{f(4 * s)} {f(4 * s)}")
    elif word == "need":
        a.path(f"M{f(cx - 34 * s)},{f(cy + 10 * s)} q{f(18 * s)},{f(-26 * s)} {f(34 * s)},{f(-4 * s)} "
               f"q{f(16 * s)},{f(-22 * s)} {f(34 * s)},{f(4 * s)}", fill="none", **L)
        a.path(f"M{f(cx - 30 * s)},{f(cy + 26 * s)} l{f(60 * s)},0", fill="none", **L)
        a.circle(cx, cy - 22 * s, 6 * s, fill=INK)
    elif word == "amber":
        a.path(kit.vial_d(cx, cy, 22 * s, 56 * s), fill="none", **L)
        a.path(kit.vial_d(cx, cy + 8 * s, 14 * s, 34 * s), fill=INK, opacity=0.25)
    elif word == "rcc":
        a.rect(cx - 34 * s, cy - 16 * s, 68 * s, 32 * s, fill="none", **L)
        kit.label(a, cx, cy + 8 * s, "RCC", size=20 * s, fill=INK, anchor="middle", font_weight="bold")
        for x in (cx - 30 * s, cx + 30 * s):
            a.circle(x, cy - 12 * s, 1.6 * s, fill=INK)
    elif word == "blood":
        a.path(f"M{f(cx)},{f(cy - 28 * s)} q{f(20 * s)},{f(28 * s)} 0,{f(46 * s)} q{f(-20 * s)},{f(-18 * s)} 0,{f(-46 * s)}Z",
               fill=RED, **dict(L, stroke=RED))
    else:   # blank
        a.line(cx - 24 * s, cy, cx + 24 * s, cy, stroke=INK, stroke_width=1.5 * s, opacity=0.4)


WORDS = ("blank", "ring", "mark", "need", "amber", "rcc", "blood")


def end_panel(word):
    def draw(a: Art):
        a.rect(3, 3, 114, 134, rx=6, fill="#ffffff", **LN)
        a.rect(10, 10, 100, 86, fill="none", stroke=INK, stroke_width=1, opacity=0.35)
        a.circle(16, 16, 1.5, fill=INK)
        cartoon(a, word, 60, 58)
        if word != "blank":
            col = RED if word == "blood" else INK
            a.rect(10, 100, 100, 28, fill=RED if word == "blood" else "#ffffff", stroke=col, stroke_width=2)
            kit.label(a, 60, 121, word.upper(), size=20, fill="#ffffff" if word == "blood" else INK, anchor="middle",
                      font_weight="bold", letter_spacing="1", fit=kit.fitw(word.upper(), 20, 90, .7))
        else:
            a.rect(10, 100, 100, 28, fill="none", stroke=INK, stroke_width=1, stroke_dasharray="3 3")
    draw.__doc__ = (f"Creed tile end: one half-panel of a domino tile printed in the tract's plain line, a small cartoon "
                    f"for the word {word.upper()} and the word in a box at the foot"
                    f"{' in the second ink, red' if word == 'blood' else ''}. Two ends make a tile.")
    asset(G, f"creed-end-{word}", group="pieces", title=f"Creed: tile end, {word.upper()}", w=120, h=140,
          row=kit.row(M, "Tile ends (seven words)"))(draw)


for _w in WORDS:
    end_panel(_w)


@asset(G, "creed-tile-frame", group="pieces", title="Creed: tile frame (two ends and a line of his)", w=260, h=180,
       row=kit.row(M, "Tiles"))
def tile_frame(a: Art):
    """A domino tile as a two-panel strip from the tract: a heavy outline, a centre rule, two empty end
    slots for the end panels, and a ruled caption bar across the top where his line is lettered at run
    time, split at the rule."""
    a.rect(3, 3, 254, 174, rx=8, fill=THIN, stroke=INK, stroke_width=4)
    a.rect(8, 8, 244, 30, fill="#ffffff", stroke=INK, stroke_width=1.5)
    a.line(130, 8, 130, 172, stroke=INK, stroke_width=3)
    for x in (10, 136):
        a.rect(x, 40, 114, 132, fill="none", stroke=INK, stroke_width=1, stroke_dasharray="4 3", opacity=0.6)
    a.circle(130, 106, 5, fill=INK)
    a.line(14, 30, 124, 30, stroke=INK, stroke_width=0.6, opacity=0.4)
    a.line(136, 30, 246, 30, stroke=INK, stroke_width=0.6, opacity=0.4)


@asset(G, "creed-tile-back", group="pieces", title="Creed: tile face down", w=260, h=180, row=kit.row(M, "Tiles"))
def tile_back(a: Art):
    """A tile turned face down: the back of a tract page, a red rule round it and a small printed ring in
    the middle, the same for every tile."""
    a.rect(3, 3, 254, 174, rx=8, fill=THIN2, stroke=INK, stroke_width=4)
    a.rect(14, 14, 232, 152, rx=4, fill="none", stroke=RED, stroke_width=3)
    a.circle(130, 90, 30, fill="none", stroke=INK, stroke_width=3)
    a.circle(130, 90, 18, fill="none", stroke=RED, stroke_width=2)
    for x, y in ((24, 24), (236, 24), (24, 156), (236, 156)):
        a.circle(x, y, 3, fill=RED)


@asset(G, "creed-tile-sky", group="pieces", title="Creed: the sky tile (dealt to him)", w=260, h=180,
       row=kit.row(M, "Tiles: the dealer's"))
def tile_sky(a: Art):
    """A double that is not his: both ends painted sky blue with soft white clouds, laid inside the tract's
    printed frame. It matches nothing; it is the only colour on the page not printed in the tract's inks."""
    a.rect(3, 3, 254, 174, rx=8, fill=THIN, stroke=INK, stroke_width=4)
    for x in (10, 136):
        a.rect(x, 12, 114, 156, rx=4, fill=kit.SKY)
        for cx, cy, rx in ((x + 36, 50, 26), (x + 76, 110, 32), (x + 58, 148, 18)):
            a.ellipse(cx, cy, rx, rx * .38, fill="#ffffff", opacity=0.9)
    a.line(130, 8, 130, 172, stroke=INK, stroke_width=3)


@asset(G, "creed-tile-string", group="pieces", title="Creed: the string tile (dealt to him)", w=260, h=180,
       row=kit.row(M, "Tiles: the dealer's"))
def tile_string(a: Art):
    """The other tile that is not his: a cat's-cradle loop of string drawn across both ends over a wash
    of the painted sky, a child's game remembered by an adult hand; no word on either end."""
    a.rect(3, 3, 254, 174, rx=8, fill=THIN, stroke=INK, stroke_width=4)
    a.rect(10, 12, 240, 156, rx=4, fill=kit.SKY, opacity=0.35)
    a.path("M40,60 L130,40 L220,60 L190,130 L130,150 L70,130Z M40,60 L190,130 M220,60 L70,130 M130,40 L130,150",
           fill="none", stroke="#ffffff", stroke_width=5, stroke_linejoin="round")
    a.path("M40,60 L130,40 L220,60 L190,130 L130,150 L70,130Z", fill="none", stroke=INK, stroke_width=1.2, opacity=0.5)
    a.line(130, 8, 130, 172, stroke=INK, stroke_width=3)


@asset(G, "creed-tile-naming", group="pieces", title="Creed: the naming tile (Creed 2)", w=260, h=180,
       row=kit.row(M, "Tiles: the naming tile"))
def tile_naming(a: Art):
    """The extra tile he holds in Creed 2 if the station's marks were shown to be the cult's: blank on both
    ends, and across its face a typed strip where the station keeper's name is lettered at run time. Laid on
    a BLOOD end it closes it."""
    a.rect(3, 3, 254, 174, rx=8, fill="#ffffff", stroke=INK, stroke_width=4)
    a.line(130, 8, 130, 172, stroke=INK, stroke_width=3)
    for x in (66, 194):
        a.line(x - 24, 120, x + 24, 120, stroke=INK, stroke_width=1.5, opacity=0.4)
    a.rect(20, 60, 220, 40, fill=THIN, stroke=INK, stroke_width=2)
    a.line(30, 90, 230, 90, stroke=INK, stroke_width=0.6, opacity=0.4)
    a.rect(92, 36, 76, 22, fill="#ffffff")
    kit.label(a, 130, 52, "NAMED", size=14, fill=RED, anchor="middle", font_weight="bold", letter_spacing="4")


# ---- the spread and its furniture --------------------------------------------------------------
@asset(G, "creed-spread", group="backdrops", title="Creed: the tract open across the page", w=1280, h=720,
       row=kit.row(M, "The page: the open tract"))
def spread(a: Art):
    """The pocket tract opened flat across the page on a plain table: thin paper, a stapled gutter, a heavy
    red title band WHAT HE SAID on the left page and and what it means in black italic on the right, the
    middle left open for the chain, and an empty verse band at the foot of the spread."""
    a.rect(0, 0, 1280, 720, fill="#d9d4c8")
    a.rect(70, 30, 1140, 580, fill="#000", opacity=0.12)
    a.rect(60, 20, 1140, 580, fill=THIN, stroke="#9a9384", stroke_width=2)
    a.line(630, 20, 630, 600, stroke="#b9b2a2", stroke_width=3)
    for y in (180, 440):
        a.rect(626, y, 8, 22, fill="#8a8a88")
    a.rect(80, 40, 520, 72, fill=RED)
    kit.label(a, 100, 92, "WHAT HE SAID", size=44, family="serif", fill="#ffffff", font_weight="bold", letter_spacing="2")
    kit.label(a, 650, 90, "and what it means", size=32, family="serif", fill=INK, font_style="italic")
    a.rect(80, 480, 1100, 100, fill=THIN2)
    a.line(80, 480, 1180, 480, stroke=INK, stroke_width=1.5)
    kit.label(a, 96, 572, "VERSE", size=14, fill=INK, letter_spacing="4", opacity=0.6)
    for x in (110, 1150):
        kit.label(a, x, 456, "·", size=26, fill=INK, anchor="middle")
    kit.label(a, 345, 594, "2", size=14, family="serif", fill=INK, anchor="middle", opacity=0.6)
    kit.label(a, 915, 594, "3", size=14, family="serif", fill=INK, anchor="middle", opacity=0.6)
    a.rect(0, 620, 1280, 100, fill="#2b2a27")


@asset(G, "creed-boneyard", group="ui", title="Creed: the boneyard (a stack of folded tracts)", w=200, h=240,
       row=kit.row(M, "Boneyard and hand"))
def boneyard(a: Art):
    """The boneyard as a short stack of folded tracts, slightly askew, the top one showing its red cover
    band; tap it to draw."""
    for k in range(6):
        y = 200 - k * 22
        r = (-3, 2, -1, 3, -2, 1)[k]
        a.rect(20, y - 30, 160, 34, fill=THIN if k < 5 else "#ffffff", stroke=INK, stroke_width=2,
               transform=f"rotate({r} 100 {y - 13})")
    a.rect(30, 66, 140, 18, fill=RED, transform="rotate(1 100 75)")
    kit.label(a, 100, 80, "DRAW", size=14, fill="#ffffff", anchor="middle", font_weight="bold", letter_spacing="3",
              transform="rotate(1 100 75)")
    a.rect(96, 92, 8, 4, fill="#8a8a88")


@asset(G, "creed-hint", group="ui", title="Creed: hint, an open end the lector can match with BLOOD", w=140, h=160,
       row=kit.row(M, "Hint"))
def hint(a: Art):
    """A red second-ink halo printed round an open end of the chain: the lector can lay BLOOD here. A
    rough red ring of short strokes, nothing filled."""
    for k in range(28):
        t = k / 28 * 6.283
        x, y = 70 + 62 * math.cos(t), 80 + 74 * math.sin(t)
        a.line(x, y, x + 8 * math.cos(t), y + 8 * math.sin(t), stroke=RED, stroke_width=4, stroke_linecap="round")
    a.rect(14, 14, 112, 132, rx=8, fill="none", stroke=RED, stroke_width=2, stroke_dasharray="6 4")


@asset(G, "creed-cover-line", group="ui", title="Creed: the doctrine line on the cover (blank)", w=640, h=60,
       row=kit.row(M, "Doctrine: the cover line"))
def cover_line(a: Art):
    """A ruled line of type on the tract's cover, DOCTRINE: and then empty ruled space; words are typed
    onto it at run time as the doctrine grows. Never a number."""
    a.rect(2, 2, 636, 56, fill=THIN, stroke=INK, stroke_width=2)
    kit.label(a, 16, 38, "DOCTRINE:", size=20, family="serif", fill=RED, font_weight="bold", letter_spacing="2")
    a.line(150, 44, 624, 44, stroke=INK, stroke_width=1, opacity=0.5)
    a.line(150, 20, 624, 20, stroke=INK, stroke_width=0.6, opacity=0.25)
    a.circle(140, 32, 2, fill=RED)


@asset(G, "creed-hand-tray", group="ui", title="Creed: his hand (strip along the bottom)", w=1280, h=180,
       row=kit.row(M, "Boneyard and hand"))
def hand_tray(a: Art):
    """The strip at the bottom of the page where his hand lies: a dark table edge with seven faint
    printed slots for tiles, and HIS HAND in small capitals at the left."""
    a.rect(0, 0, 1280, 180, fill="#2b2a27")
    a.line(0, 2, 1280, 2, stroke="#55524a", stroke_width=3)
    for k in range(7):
        a.rect(120 + k * 160, 26, 140, 130, rx=8, fill="none", stroke="#55524a", stroke_width=2, stroke_dasharray="6 5")
    kit.label(a, 20, 96, "HIS", size=16, fill="#cfcac0", font_weight="bold", letter_spacing="3")
    kit.label(a, 20, 116, "HAND", size=16, fill="#cfcac0", font_weight="bold", letter_spacing="3")


# ---- documents: the tract itself -----------------------------------------------------------------
def verse(text, key, note):
    def draw(a: Art):
        a.rect(0, 0, 1100, 100, fill=THIN2)
        a.line(0, 1, 1100, 1, stroke=INK, stroke_width=1.5)
        kit.label(a, 30, 62, text, size=46, family="serif", fill=RED, font_weight="bold",
                  fit=kit.fitw(text, 46, 900, .6))
        kit.label(a, 32, 90, note, size=16, family="serif", fill=INK, font_style="italic")
        a.circle(1060, 50, 14, fill="none", stroke=INK, stroke_width=2)
        a.circle(1060, 50, 4, fill=RED)
    draw.__doc__ = (f"A verse printed at the foot of the tract in the second ink, heavy red serif capitals: {text} "
                    f"with a small italic note under it. Fits the spread's verse band.")
    asset(G, f"creed-verse-{key}", group="documents", title=f"Creed: verse, {text}", w=1100, h=100,
          row=kit.row(M, "Verses printed from the joints"))(draw)


verse("ALL OF IT IS HIS BLOOD.", "blood", "printed from the joints: NOT MY BLOOD. NOT ALL OF IT.")
verse("THE RING IS HOLY.", "ring", "printed from the joints: STAY OUTSIDE THE RING.")


@asset(G, "creed-tract-cover", group="documents", title="Creed: the tract's cover", w=480, h=660,
       row=kit.row(M, "The tract's cover"))
def tract_cover(a: Art):
    """The pocket tract's cover: a heavy red title band reading HIS WORDS, a plain-line cartoon panel of a
    ring of small people round an empty space, two staples at the spine, and a ruled line at the foot for
    the doctrine. Printed on thin paper, two inks."""
    a.rect(0, 0, 480, 660, fill=THIN, stroke="#9a9384", stroke_width=2)
    a.rect(0, 0, 480, 660, fill="#000", opacity=0.04)
    for y in (160, 500):
        a.rect(6, y, 4, 26, fill="#8a8a88")
    a.rect(30, 40, 420, 120, fill=RED)
    kit.label(a, 240, 124, "HIS WORDS", size=64, family="serif", fill="#ffffff", anchor="middle", font_weight="bold",
              letter_spacing="2")
    a.rect(60, 200, 360, 320, fill="#ffffff", **LN)
    a.circle(240, 360, 60, fill="none", stroke=INK, stroke_width=3, stroke_dasharray="8 6")
    for k in range(10):
        t = k / 10 * 6.283
        a.path(kit.person_d(240 + 120 * math.cos(t), 380 + 90 * math.sin(t), 0.36), fill="none", stroke=INK, stroke_width=2.5)
    a.line(60, 590, 420, 590, stroke=INK, stroke_width=1)
    kit.label(a, 240, 620, "printed at the camp · pass it on", size=18, family="serif", fill=INK, anchor="middle",
              font_style="italic")


# ---- figures --------------------------------------------------------------------------------------
@asset(G, "creed-lector", group="figures", title="Creed: the lector at the drum (Mercy, reading)", w=320, h=420,
       row=kit.row(M, "Figures: the lector, the dealer, his hand"))
def lector(a: Art):
    """The lector in the tract's own plain cartoon line: a woman's figure from behind a lectern made from
    a steel drum, the stapled booklet open on it, one hand raised as she reads. No face: the head is a plain
    outline. Mercy's name is lettered under it at run time."""
    a.path(kit.person_d(160, 300, 2.0, lean=4), fill="#ffffff", **LN)
    a.path(f"M196,150 L236,96 L246,104 L208,158", fill="#ffffff", **LN)
    a.rect(90, 240, 140, 170, rx=6, fill="#ffffff", **LN)
    for y in (280, 330, 380):
        a.line(90, y, 230, y, **LN)
    a.path("M80,236 L160,222 L240,236 L160,250Z", fill=THIN, **LN)
    a.line(160, 222, 160, 250, stroke=INK, stroke_width=2)
    a.rect(150, 230, 6, 3, fill="#8a8a88")
    kit.label(a, 160, 314, "· · ·", size=24, fill=RED, anchor="middle")


@asset(G, "creed-dealer-hands", group="figures", title="Creed: the dealer's hands (Cally, dealing)", w=360, h=220,
       row=kit.row(M, "Figures: the lector, the dealer, his hand"))
def dealer(a: Art):
    """Only the dealer's hands, in plain line: two bare hands sliding a face-down tile across the table
    from the far side, a dark cuff at each wrist. Never her face."""
    a.rect(110, 120, 140, 90, rx=6, fill=THIN2, **LN)
    a.circle(180, 165, 16, fill="none", stroke=RED, stroke_width=2)
    for sx, x0 in ((1, 60), (-1, 300)):
        a.path(f"M{x0},{0} L{x0 + sx * 30},{0} L{x0 + sx * 50},{100} L{x0 + sx * 10},{110}Z", fill=INK)
        a.path(f"M{x0 + sx * 6},{104} C{x0 + sx * 30},{96} {x0 + sx * 70},{120} {x0 + sx * 80},{140} "
               f"L{x0 + sx * 70},{150} C{x0 + sx * 40},{150} {x0 + sx * 10},{140} {x0},{124}Z", fill="#ffffff", **LN)
        for k in range(3):
            a.line(x0 + sx * (56 + k * 7), 136 + k * 4, x0 + sx * (70 + k * 6), 150 + k * 3, stroke=INK, stroke_width=1.5)


@asset(G, "creed-tox-hand", group="figures", title="Creed: his gloved hand laying a tile", w=300, h=220,
       row=kit.row(M, "Figures: the lector, the dealer, his hand"))
def tox_hand(a: Art):
    """His hand from the near side in the tract's plain line, a black glove filled solid with the
    shroud's hem hatched at the wrist, two fingers pressing a tile down onto the table."""
    a.rect(120, 30, 150, 100, rx=6, fill=THIN, **LN)
    a.line(195, 30, 195, 130, stroke=INK, stroke_width=2)
    a.path("M0,220 L30,150 C50,120 90,110 130,110 L190,104 C204,104 206,120 194,124 L150,132 L170,140 "
           "C180,146 176,160 164,158 L110,150 L70,220Z", fill=INK)
    a.path("M0,220 L20,170 L80,200 L60,220Z", fill="#ffffff", **LN)
    a.hatch(0, 170, 80, 50, angle=60, spacing=6, stroke=INK, stroke_width=1.2,
            clip=a.clip('<path d="M0,220 L20,170 L80,200 L60,220Z"/>'))
    a.line(130, 116, 186, 112, stroke="#555", stroke_width=1.5)

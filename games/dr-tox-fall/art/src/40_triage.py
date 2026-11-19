"""Triage (1D, sorting patients under scarcity): alcohol-marker sketch cards.

Streaky, layered marker tones on white card stock, darker where the strokes cross; quick ink contour
lines over the marker; a name and a want in the corner. Each patient is a person with a name and one want
that is not medical (DESIGN.md section 6). The style's "quick ink faces" are kept to a quick ink head
and shoulders with no features drawn in, and the thing they want in their hands. The unit is an invented
mark of an unnamed tincture: an amber marker dot, never a vial, a dose or a route."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "triage"
INK = kit.INK
STOCK = "#fdfdfb"
TONES = (kit.SKY, "#E8B6C8", "#9ED8C6", kit.OCHRE, kit.TEAL2, "#C9B6E8")
MARKER_RED = "#9b3a2a"


def streaks(a, x, y, w, h, color, layers=3, opacity=0.3, step=16, clip=None):
    """Streaky marker fill: overlapping translucent rounded strokes, darker where they cross."""
    g = {"clip_path": clip} if clip else {}
    a.open("g", **g)
    for k in range(layers):
        yy = y - k * 5
        while yy < y + h:
            jx = a.rng.uniform(-8, 8)
            a.rect(x + jx - 6, yy + k * 4, w + 12, step - 3, fill=color, opacity=opacity, rx=6)
            yy += step
    a.close()


def card_stock(a, w, h):
    a.rect(6, 8, w - 10, h - 10, rx=10, fill="#000", opacity=0.12)
    a.rect(2, 2, w - 10, h - 10, rx=10, fill=STOCK, stroke="#9a9a94", stroke_width=1.5)
    return a.clip(f'<rect x="4" y="4" width="{w - 14}" height="{h - 14}" rx="9"/>')


# name, chapter, want, the thing in their hands (a drawing key), shoulders lean
PATIENTS = (
    ("Wren Halloran", 1, "for her brother to walk by spring", "sprig"),
    ("Teo Halloran", 1, "to stop being carried", "stick"),
    ("Lupe Andrade", 2, "her hands steady enough to sew", "needle"),
    ("Bashir Kade", 2, "one night's sleep", "pillow"),
    ("Ines Varga", 2, "a letter to her daughter in the Spire", "letter"),
    ("Kofi Mensah", 2, "to see the river again", "river"),
    ("Arturo Sol", 2, "to keep his place in the queue", "ticket"),
    ("Odile Marchetti", 2, "her ration card back", "card"),
    ("Nell Okafor", 2, "her brother's water drum, still", "drum"),
    ("Mercy Abiodun", 5, "for the settlement not to be afraid", "ladle"),
    ("Dov Ashkenazi", 5, "to fix the generator for good", "wrench"),
    ("Marisol Quiroga", 5, "her son's boots back from the truck", "boots"),
    ("Yusuf Demir", 5, "to be useful", "hands"),
    ("Petra Lind", 5, "to be left alone", "door"),
    ("Ren Sato", 5, "to get home to his shift rota", "rota"),
)


def thing(a, key, x, y):
    """The thing each patient wants, in quick ink over marker, held at about (x, y)."""
    S = dict(fill="none", stroke=INK, stroke_width=3, stroke_linecap="round", stroke_linejoin="round")
    if key == "sprig":
        a.path(f"M{x - 10},{y + 40} C{x},{y + 10} {x + 6},{y - 10} {x + 20},{y - 30}", **S)
        for k in range(4):
            cx, cy = x - 4 + k * 7, y + 22 - k * 16
            a.ellipse(cx + 8, cy, 8, 4, fill="#9ED8C6", stroke=INK, stroke_width=2, transform=f"rotate(-30 {cx + 8} {cy})")
    elif key == "stick":
        a.line(x + 4, y - 50, x - 6, y + 60, **S)
        a.path(f"M{x + 4},{y - 50} C{x + 14},{y - 60} {x + 26},{y - 54} {x + 22},{y - 42}", **S)
    elif key == "needle":
        a.rect(x - 14, y, 28, 30, rx=4, fill=kit.OCHRE, stroke=INK, stroke_width=2.5)
        a.path(f"M{x},{y} C{x + 20},{y - 20} {x + 30},{y - 4} {x + 40},{y - 30}", **S)
        a.line(x + 40, y - 30, x + 52, y - 54, stroke=INK, stroke_width=2)
    elif key == "pillow":
        a.path(f"M{x - 34},{y - 16} C{x - 10},{y - 26} {x + 10},{y - 26} {x + 34},{y - 16} C{x + 40},{y} {x + 40},{y + 14} "
               f"{x + 34},{y + 22} C{x + 10},{y + 30} {x - 10},{y + 30} {x - 34},{y + 22} C{x - 40},{y + 14} {x - 40},{y} {x - 34},{y - 16}Z",
               fill="#ffffff", stroke=INK, stroke_width=3)
    elif key == "letter":
        a.rect(x - 30, y - 20, 60, 40, fill="#ffffff", stroke=INK, stroke_width=3)
        a.path(f"M{x - 30},{y - 20} L{x},{y + 4} L{x + 30},{y - 20}", **S)
    elif key == "river":
        for k in range(3):
            a.path(f"M{x - 36},{y + k * 12} q12,-8 24,0 t24,0 t24,0", fill="none", stroke=kit.SKY, stroke_width=4)
    elif key == "ticket":
        a.rect(x - 26, y - 16, 52, 32, fill="#ffffff", stroke=INK, stroke_width=3, transform=f"rotate(-8 {x} {y})")
        kit.label(a, x, y + 6, "No. 9", size=13, anchor="middle", font_weight="bold", transform=f"rotate(-8 {x} {y})")
    elif key == "card":
        a.rect(x - 30, y - 20, 60, 40, rx=4, fill="#ffffff", stroke=INK, stroke_width=3)
        a.rect(x - 22, y - 12, 18, 18, fill=kit.TEAL2)
        for k in range(3):
            a.line(x + 2, y - 8 + k * 9, x + 22, y - 8 + k * 9, stroke=INK, stroke_width=2)
    elif key == "drum":
        a.rect(x - 22, y - 30, 44, 60, rx=6, fill=kit.TEAL2, stroke=INK, stroke_width=3)
        a.line(x - 22, y - 10, x + 22, y - 10, stroke=INK, stroke_width=2)
        a.line(x - 22, y + 10, x + 22, y + 10, stroke=INK, stroke_width=2)
    elif key == "ladle":
        a.line(x + 20, y - 40, x - 6, y + 14, **S)
        a.ellipse(x - 12, y + 22, 16, 10, fill=kit.SKY, stroke=INK, stroke_width=3)
    elif key == "wrench":
        a.line(x - 30, y + 30, x + 18, y - 18, stroke=INK, stroke_width=7, stroke_linecap="round")
        a.path(f"M{x + 14},{y - 14} l6,-20 l14,6 l-8,8 l8,8 l-14,6Z", fill=kit.TEAL2, stroke=INK, stroke_width=2.5)
    elif key == "boots":
        for dx in (-22, 14):
            a.path(f"M{x + dx},{y - 30} L{x + dx + 16},{y - 30} L{x + dx + 16},{y + 10} L{x + dx + 30},{y + 18} "
                   f"L{x + dx + 30},{y + 30} L{x + dx},{y + 30}Z", fill="#6b4b3a", stroke=INK, stroke_width=2.5)
    elif key == "hands":
        for sgn in (-1, 1):
            a.path(f"M{x + sgn * 6},{y + 20} C{x + sgn * 30},{y + 14} {x + sgn * 40},{y - 4} {x + sgn * 36},{y - 16} "
                   f"L{x + sgn * 24},{y - 10} L{x + sgn * 26},{y - 26} L{x + sgn * 14},{y - 12}", **S)
    elif key == "door":
        a.rect(x - 24, y - 44, 48, 88, fill="#ffffff", stroke=INK, stroke_width=3)
        a.circle(x + 14, y, 3.5, fill=INK)
        a.line(x - 24, y - 44, x - 36, y - 50, stroke=INK, stroke_width=2)
    elif key == "rota":
        a.rect(x - 26, y - 34, 52, 68, fill="#ffffff", stroke=INK, stroke_width=3)
        for k in range(5):
            a.line(x - 18, y - 22 + k * 12, x + 18, y - 22 + k * 12, stroke=INK, stroke_width=2)
            a.line(x - 6, y - 26 + k * 12, x - 6, y - 18 + k * 12, stroke=INK, stroke_width=1.5)
        a.path(f"M{x - 30},{y + 40} C{x - 10},{y + 36} {x + 10},{y + 36} {x + 30},{y + 40}", fill="none", stroke="#ffffff",
               stroke_width=8)
        a.path(f"M{x - 30},{y + 40} C{x - 10},{y + 36} {x + 10},{y + 36} {x + 30},{y + 40}", fill="none", stroke=INK,
               stroke_width=1.5)


def patient(i, name, ch, want, key):
    slug = name.split()[0].lower()

    def draw(a: Art):
        cc = card_stock(a, 300, 420)
        tone = TONES[i % len(TONES)]
        streaks(a, 22, 22, 256, 230, tone, layers=2, opacity=0.18, step=20, clip=cc)
        # quick ink head and shoulders, marker inside, no features
        lean = (i % 3 - 1) * 8
        d = (f"M{150 + lean},{58} C{180 + lean},{58} {190 + lean},{86} {186 + lean},{112} C{184 + lean},{128} {176 + lean},{138} "
             f"{170 + lean},{144} L{226},{170} C{250},{182} {258},{210} {258},{248} L{42},{248} C{42},{210} {50},{182} "
             f"{74},{170} L{130 + lean},{144} C{124 + lean},{138} {116 + lean},{128} {114 + lean},{112} C{110 + lean},{86} "
             f"{120 + lean},{58} {150 + lean},{58}Z")
        cid = a.clip(f'<path d="{d}"/>')
        streaks(a, 40, 50, 220, 200, tone, layers=3, opacity=0.38, step=14, clip=cid)
        a.path(d, fill="none", stroke=INK, stroke_width=2.6, stroke_linejoin="round", filter=a.roughen(1.2, 0.06))
        thing(a, key, 150, 210)
        # name and want in the corner
        a.line(22, 262, 278, 262, stroke=INK, stroke_width=1.5)
        kit.label(a, 24, 292, name, size=24, font_weight="bold", fit=kit.fitw(name, 24, 254, .58))
        kit.label(a, 24, 316, "wants", size=14, fill="#666", font_style="italic")
        for k, ln in enumerate(kit.wrap(want, 27)[:2]):
            kit.label(a, 24, 340 + k * 21, ln, size=18, family="serif", fill=INK, fit=kit.fitw(ln, 18, 254, .5))
        # asks: two empty mark slots
        kit.label(a, 24, 398, "asks", size=13, fill="#666", font_style="italic")
        for k in range(2):
            a.circle(84 + k * 34, 393, 12, fill="none", stroke=kit.AMBER, stroke_width=2.5, stroke_dasharray="4 3")
        kit.label(a, 270, 398, f"ch. {ch}", size=12, anchor="end", fill="#888")
    draw.__doc__ = (f"Patient card: {name}, who wants {want}. A quick ink head and shoulders over streaky "
                    f"marker on white card stock, no features drawn in, holding what they want; the name and "
                    f"want in the corner and two empty amber mark slots.")
    asset(G, f"{M}-card-{slug}", group="cards", title=f"Patient card: {name}", w=300, h=420,
          row=kit.row(M, "Patient cards (a name and a want each)"))(draw)


for _i, _p in enumerate(PATIENTS):
    patient(_i, *_p)


@asset(G, f"{M}-card-back", group="cards", title="Patient card, back", w=300, h=420,
       row=kit.row(M, "Patient cards (a name and a want each)"))
def card_back(a: Art):
    """The back of a patient card: white stock flooded with streaky gray-teal marker, crossed with a
    second pass, and one small amber dot in the middle."""
    cc = card_stock(a, 300, 420)
    streaks(a, 20, 20, 260, 380, kit.TEAL2, layers=3, opacity=0.25, step=18, clip=cc)
    a.rect(20, 20, 260, 380, rx=8, fill="none", stroke=INK, stroke_width=2)
    a.circle(150, 210, 18, fill=kit.AMBER, opacity=0.85)


@asset(G, f"{M}-stamp-early", group="pieces", title="Corner stamp: CAME BACK EARLY", w=300, h=120,
       row=kit.row(M, "A mark past the need (the stamp in later pages)"))
def stamp_early(a: Art):
    """A rubber-stamp mark in rusty red marker ink, CAME BACK EARLY in a double frame, set at an angle
    over a card's corner; the trace a mark past the need leaves on the card."""
    a.open("g", transform="rotate(-8 150 60)", filter=a.roughen(1.8, 0.09))
    a.rect(16, 24, 268, 72, rx=8, fill="none", stroke=MARKER_RED, stroke_width=5)
    a.rect(26, 32, 248, 56, rx=5, fill="none", stroke=MARKER_RED, stroke_width=2)
    kit.label(a, 150, 72, "CAME BACK EARLY", size=28, anchor="middle", fill=MARKER_RED, font_weight="bold",
              letter_spacing="2", fit=230)
    a.close()


@asset(G, f"{M}-mark", group="pieces", title="A mark of tincture (within need)", w=64, h=64,
       row=kit.row(M, "Resources: marks, water, cots, his time"))
def mark(a: Art):
    """One mark of tincture as the page shows it: a round amber marker dot, laid down twice so the
    centre is darker, nothing else; an invented unit, not a dose."""
    a.circle(32, 32, 22, fill=kit.AMBER, opacity=0.7)
    a.circle(30, 30, 16, fill=kit.AMBER, opacity=0.6)
    a.path("M20,22 C26,16 36,16 42,20", fill="none", stroke="#ffffff", stroke_width=3, opacity=0.6)
    a.path("M12,36 C14,46 22,54 32,56", fill="none", stroke="#a8620e", stroke_width=2, opacity=0.5)
    a.circle(50, 46, 1.6, fill=kit.AMBER, opacity=0.6)


@asset(G, f"{M}-mark-past", group="pieces", title="A mark past the need", w=64, h=64,
       row=kit.row(M, "A mark past the need (the stamp in later pages)"))
def mark_past(a: Art):
    """A mark past the need: the same amber dot gone over again and again until it is dark brown-amber,
    bleeding at the edge like marker on cheap stock."""
    for k in range(5):
        a.circle(32 + a.rng.uniform(-2, 2), 32 + a.rng.uniform(-2, 2), 24 - k * 2, fill="#8a4a0c", opacity=0.35)
    a.circle(32, 32, 14, fill="#6a3608", opacity=0.8)


@asset(G, f"{M}-water", group="pieces", title="Water (a tin cup)", w=96, h=96,
       row=kit.row(M, "Resources: marks, water, cots, his time"))
def water(a: Art):
    """Water as the page has it: a dented tin cup in quick ink with sky-blue marker inside it."""
    streaks(a, 22, 30, 52, 50, kit.SKY, layers=2, opacity=0.4, step=10,
            clip=a.clip('<path d="M24,30 L72,30 L66,84 L30,84Z"/>'))
    a.path("M24,30 L72,30 L66,84 L30,84Z", fill="none", stroke=INK, stroke_width=3, stroke_linejoin="round")
    a.path("M72,40 C88,42 88,66 70,68", fill="none", stroke=INK, stroke_width=3)
    a.path("M30,48 L36,52", stroke=INK, stroke_width=2)


@asset(G, f"{M}-cot", group="pieces", title="A cot", w=160, h=96,
       row=kit.row(M, "Resources: marks, water, cots, his time"))
def cot(a: Art):
    """A folding canvas cot in quick ink, gray-teal marker on the canvas and crossed legs."""
    streaks(a, 14, 30, 132, 24, kit.TEAL2, layers=2, opacity=0.4, step=10,
            clip=a.clip('<rect x="14" y="30" width="132" height="24" rx="6"/>'))
    a.rect(14, 30, 132, 24, rx=6, fill="none", stroke=INK, stroke_width=3)
    for x in (28, 118):
        a.line(x, 54, x + 18, 86, stroke=INK, stroke_width=3)
        a.line(x + 18, 54, x, 86, stroke=INK, stroke_width=3)


@asset(G, f"{M}-time", group="pieces", title="His time (a wristwatch)", w=96, h=96,
       row=kit.row(M, "Resources: marks, water, cots, his time"))
def time_(a: Art):
    """His time, one card at a time inside the ring: his wristwatch in quick ink, the strap streaked in
    gray marker, the hands at ten to two."""
    streaks(a, 36, 4, 24, 88, "#777770", layers=2, opacity=0.35, step=10,
            clip=a.clip('<rect x="36" y="4" width="24" height="88" rx="6"/>'))
    a.circle(48, 48, 26, fill=STOCK, stroke=INK, stroke_width=3)
    for k in range(12):
        t = math.radians(k * 30)
        a.line(48 + 21 * math.cos(t), 48 + 21 * math.sin(t), 48 + 24 * math.cos(t), 48 + 24 * math.sin(t),
               stroke=INK, stroke_width=1.5)
    a.line(48, 48, 36, 40, stroke=INK, stroke_width=3, stroke_linecap="round")
    a.line(48, 48, 60, 36, stroke=INK, stroke_width=2, stroke_linecap="round")


@asset(G, f"{M}-tray", group="pieces", title="The tincture tray", w=240, h=520,
       row=kit.row(M, "The table: the tray and three columns"))
def tray(a: Art):
    """The tincture tray at the left of the table: a white card tray with TINCTURE marker-lettered on it,
    twelve shallow round wells for marks, and boxes below for water and cots."""
    cc = card_stock(a, 240, 520)
    streaks(a, 18, 18, 210, 60, kit.OCHRE, layers=2, opacity=0.22, step=14, clip=cc)
    kit.label(a, 115, 60, "TINCTURE", size=26, anchor="middle", font_weight="bold", letter_spacing="2", fit=180)
    for k in range(12):
        cx, cy = 52 + (k % 3) * 64, 120 + (k // 3) * 64
        a.circle(cx, cy, 22, fill="none", stroke="#9a9a94", stroke_width=2)
    for k, t in enumerate(("WATER", "COTS")):
        y = 380 + k * 64
        a.rect(18, y, 210, 50, rx=6, fill="none", stroke=INK, stroke_width=2)
        kit.label(a, 30, y + 32, t, size=18, font_weight="bold", letter_spacing="2")


@asset(G, f"{M}-table", group="backdrops", title="The triage table: NOW, WAIT, CANNOT", w=1280, h=720,
       row=kit.row(M, "The table: the tray and three columns"))
def table(a: Art):
    """The page itself: a gray-teal table streaked with marker, the tray's place at the left and three
    columns lettered across the top in black marker, NOW, WAIT and CANNOT, with a round counter at the
    top right."""
    a.rect(0, 0, 1280, 720, fill="#d3d8d6")
    streaks(a, 0, 0, 1280, 720, kit.TEAL2, layers=2, opacity=0.14, step=26)
    a.rect(24, 120, 250, 560, rx=10, fill="none", stroke="#9a9a94", stroke_width=2, stroke_dasharray="10 8")
    for k, h in enumerate(("NOW", "WAIT", "CANNOT")):
        x = 300 + k * 325
        a.rect(x, 112, 305, 580, rx=10, fill=STOCK, opacity=0.35)
        kit.label(a, x + 152, 90, h, size=40, anchor="middle", font_weight="bold", letter_spacing="4")
        a.path(a.wobble_d([(x + 20, 102), (x + 285, 102)], 1.5, 20), fill="none", stroke=INK, stroke_width=4)
    a.rect(1130, 8, 130, 40, rx=8, fill=STOCK, stroke=INK, stroke_width=2)
    kit.label(a, 1146, 34, "ROUND", size=16, font_weight="bold", letter_spacing="2")

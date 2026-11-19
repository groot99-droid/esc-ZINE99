"""Persona (1D, deck-building to an attachment profile): 1950s romance comic.

Pastel flat colour with no dot screen, a soft plum keyline, swooning italic serif lettering, thought
balloons, a heart-shaped panel and a tear on a lash: the program's idea of love, a genre and a formula.
Aegis is a profile silhouette with no features drawn in (he has no design system yet). Cards Cally
builds are pastel; cards the deck deals itself are gray and do not fit."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "persona"
PLUM = "#3B2A4A"
PAGE = "#fbf1e6"
ROSE, MINT, BLUE, LEMON, LILAC = "#F6C9D3", "#BFE3E0", "#C9DDF2", "#F6E1A8", "#E9D3F0"
DEEP_ROSE = "#E07A9A"


def profile_d(cx, cy, s=1.0):
    """A young man's head and shoulders in left-facing profile, no features: brow, nose, chin, the neck
    and the line of a collar."""
    pts = [(0, -120), (40, -112), (66, -80), (70, -40), (64, -10), (70, 20), (60, 60), (52, 100), (110, 130),
           (140, 170), (-140, 170), (-120, 130), (-60, 100), (-62, 60), (-78, 40), (-74, 26), (-90, 14), (-80, 6),
           (-84, -6), (-76, -16), (-78, -40), (-66, -80), (-40, -112)]
    return kit.P([(cx + x * s, cy + y * s) for x, y in pts], True)


@asset(G, f"{M}-page", group="backdrops", title="Persona: the romance page (backdrop)", w=1280, h=720,
       row=kit.row(M, "The page and the heart panel"))
def page(a: Art):
    """The page: cream newsprint-free paper in a 1950s romance-comic layout, plum gutters, a tall space
    at the top for the heart panel, a strip at the foot for the hand and the match meter, and a lettered
    title box: SEVENTY-TWO HOURS TO LOVE HIM!"""
    a.rect(0, 0, 1280, 720, fill=PAGE)
    a.rect(16, 16, 1248, 400, rx=6, fill=BLUE, opacity=0.35, stroke=PLUM, stroke_width=4)
    a.rect(16, 432, 1248, 272, rx=6, fill=ROSE, opacity=0.3, stroke=PLUM, stroke_width=4)
    a.rect(40, 34, 420, 70, fill=LEMON, stroke=PLUM, stroke_width=3)
    kit.label(a, 56, 80, "SEVENTY-TWO HOURS TO LOVE HIM!", size=26, family="serif", fill=PLUM,
              font_style="italic", font_weight="bold", fit=390)
    for x in (1140, 1190, 1240):
        a.path(kit.heart_d(x - 20, 60, 12), fill=DEEP_ROSE, stroke=PLUM, stroke_width=2)


@asset(G, f"{M}-heart-panel", group="documents", title="The heart panel: his profile", w=720, h=480,
       row=kit.row(M, "The page and the heart panel"))
def heart_panel(a: Art):
    """A big heart-shaped panel with a plum keyline, flat pink inside, and in it a young man's profile in
    flat warm tone with dark hair and no features drawn: the attachment profile Cally is built to fit."""
    a.path(kit.heart_d(360, 250, 230), fill=ROSE, stroke=PLUM, stroke_width=8)
    cid = a.clip(f'<path d="{kit.heart_d(360, 250, 230)}"/>')
    a.open("g", clip_path=cid)
    a.rect(0, 300, 720, 200, fill=BLUE)
    a.path(profile_d(380, 250, 1.25), fill="#F2D3B8", stroke=PLUM, stroke_width=4)
    a.path(f"M{380 - 90},{250 - 60} C{380 - 100},{250 - 160} {380 + 60},{250 - 190} {380 + 90},{250 - 100} "
           f"C{380 + 40},{250 - 130} {380 - 30},{250 - 120} {380 - 60},{250 - 40}Z", fill="#6b4b3a")
    a.close()
    a.path(kit.heart_d(360, 250, 230), fill="none", stroke=PLUM, stroke_width=8)


BALLOONS = (("sky", "a painted sky", BLUE), ("string", "a loop of string", LEMON), ("cally", "Cally", ROSE),
            ("carmy", "Carmy", MINT), ("rolan", "Rolan", LILAC), ("amber", "warm amber light", "#F8DDB0"))


def balloon(key, text, tint):
    def draw(a: Art):
        a.ellipse(180, 84, 164, 66, fill="#ffffff", stroke=PLUM, stroke_width=4)
        a.ellipse(180, 84, 150, 56, fill=tint, opacity=0.55)
        for ox, oy, r in ((-100, 152, 14), (-130, 180, 8), (-148, 196, 5)):
            a.circle(180 + ox, oy, r, fill="#ffffff", stroke=PLUM, stroke_width=3)
        kit.label(a, 180, 96, text, size=34, family="serif", fill=PLUM, anchor="middle", font_style="italic",
                  fit=kit.fitw(text, 34, 270, .5))
    draw.__doc__ = (f"A thought balloon from his profile, “{text}”, white with a {key} tint inside, "
                    f"plum italic lettering and three trailing bubbles; its size on the page is the facet's "
                    f"hidden weight.")
    asset(G, f"{M}-balloon-{key}", group="pieces", title=f"Thought balloon: {text}", w=360, h=210,
          row=kit.row(M, "Thought balloons (the six facets)"))(draw)


for _b in BALLOONS:
    balloon(*_b)


@asset(G, f"{M}-meter", group="pieces", title="The match meter, marked at 94.6", w=1000, h=90,
       row=kit.row(M, "The match meter"))
def meter(a: Art):
    """The match meter along the bottom of the page: a long rounded plum-edged track with hearts at each
    end, empty for the fill, and a firm plum mark at 94.6 with the number lettered above it."""
    a.rect(60, 40, 880, 34, rx=17, fill="#ffffff", stroke=PLUM, stroke_width=4)
    x = 60 + 880 * 0.946
    a.line(x, 30, x, 84, stroke=PLUM, stroke_width=5)
    kit.label(a, x, 24, "94.6", size=22, family="serif", fill=PLUM, anchor="middle", font_weight="bold")
    a.path(kit.heart_d(30, 56, 20), fill=ROSE, stroke=PLUM, stroke_width=3)
    a.path(kit.heart_d(970, 56, 20), fill=DEEP_ROSE, stroke=PLUM, stroke_width=3)
    kit.label(a, 64, 24, "MATCH", size=16, family="serif", fill=PLUM, font_weight="bold", letter_spacing="3")


@asset(G, f"{M}-tear", group="pieces", title="A tear on a lash", w=140, h=140,
       row=kit.row(M, "Ornament"))
def tear(a: Art):
    """The romance comic's sign: a closed eye drawn as one long curved lash line, and a single
    sky-blue tear with a white highlight hanging from it."""
    a.path("M14,52 C40,82 100,82 126,52", fill="none", stroke=PLUM, stroke_width=5, stroke_linecap="round")
    for k in range(6):
        x = 30 + k * 16
        a.line(x, 68 - abs(k - 2.5) * 2, x - 4, 82 - abs(k - 2.5) * 2, stroke=PLUM, stroke_width=3, stroke_linecap="round")
    a.path("M86,88 C92,104 100,114 92,126 C84,134 72,126 76,112 C78,104 82,98 86,88Z", fill=kit.SKY, stroke=PLUM,
           stroke_width=2.5)
    a.path("M82,112 C82,106 84,102 86,100", fill="none", stroke="#ffffff", stroke_width=3)


def card_frame(a, tint, dealt=False):
    a.rect(10, 12, 222, 320, rx=14, fill=PLUM, opacity=0.25)
    a.rect(4, 4, 222, 320, rx=14, fill="#d9d4d6" if dealt else tint, stroke=PLUM, stroke_width=4)
    a.rect(16, 16, 198, 296, rx=10, fill="none", stroke=PLUM, stroke_width=1.5, opacity=0.6)


CARDS = (("laugh", "Laugh at his joke", MINT), ("scarf", "Sky-blue scarf", BLUE), ("hum", "Hum four notes", LEMON),
         ("string", "Loop of string", LILAC), ("hand", "Take his hand", ROSE), ("light", "Stand in the warm light", "#F8DDB0"))
DEALT = (("blade", "Drop the blade"), ("paint", "Paint over the sky"), ("fell", "Leave the string where it fell"))


def emblem(a, key, cx, cy):
    S = dict(fill="none", stroke=PLUM, stroke_width=4, stroke_linecap="round", stroke_linejoin="round")
    if key == "laugh":
        for k in range(3):
            a.path(f"M{cx - 40 + k * 30},{cy - 10} q10,-16 20,0", **S)
        kit.label(a, cx, cy + 30, "ha!", size=30, family="serif", anchor="middle", fill=PLUM, font_style="italic")
    elif key == "scarf":
        a.path(f"M{cx - 50},{cy - 20} C{cx - 10},{cy - 6} {cx + 10},{cy - 6} {cx + 50},{cy - 20} L{cx + 46},{cy} "
               f"C{cx + 10},{cy + 12} {cx - 10},{cy + 12} {cx - 46},{cy}Z", fill=kit.SKY, stroke=PLUM, stroke_width=3)
        a.path(f"M{cx + 20},{cy + 4} L{cx + 30},{cy + 50} L{cx + 14},{cy + 52} L{cx + 8},{cy + 6}Z", fill=kit.SKY,
               stroke=PLUM, stroke_width=3)
    elif key == "hum":
        for k, (x, y) in enumerate(((-36, 10), (-12, -6), (12, 4), (36, -14))):
            a.ellipse(cx + x, cy + y + 20, 9, 7, fill=PLUM, transform=f"rotate(-20 {cx + x} {cy + y + 20})")
            a.line(cx + x + 8, cy + y + 18, cx + x + 8, cy + y - 16, stroke=PLUM, stroke_width=3)
    elif key == "string":
        a.path(f"M{cx - 40},{cy - 30} L{cx + 40},{cy - 30} L{cx},{cy + 40}Z M{cx - 40},{cy + 10} L{cx + 40},{cy + 10}",
               **S)
    elif key == "hand":
        a.path(f"M{cx - 50},{cy + 20} C{cx - 20},{cy - 20} {cx + 20},{cy - 20} {cx + 50},{cy + 20}", **S)
        a.path(kit.heart_d(cx, cy - 10, 16), fill=DEEP_ROSE, stroke=PLUM, stroke_width=2)
    elif key == "light":
        a.circle(cx, cy, 24, fill=kit.GOLD, stroke=PLUM, stroke_width=3)
        for k in range(8):
            t = math.radians(k * 45)
            a.line(cx + 32 * math.cos(t), cy + 32 * math.sin(t), cx + 46 * math.cos(t), cy + 46 * math.sin(t), **S)
    elif key == "blade":
        a.path(f"M{cx - 50},{cy + 30} L{cx + 30},{cy - 30} L{cx + 40},{cy - 20} L{cx - 40},{cy + 40}Z", fill="#b9b4b6",
               stroke=PLUM, stroke_width=3)
        a.line(cx - 50, cy + 50, cx + 50, cy + 50, **S)
    elif key == "paint":
        a.rect(cx - 50, cy - 30, 100, 60, fill=kit.SKY, opacity=0.5, stroke=PLUM, stroke_width=3)
        a.path(f"M{cx - 50},{cy - 30} L{cx + 10},{cy - 30} L{cx - 50},{cy + 20}Z", fill="#b9b4b6")
        a.line(cx - 10, cy - 50, cx + 40, cy + 40, stroke=PLUM, stroke_width=6, stroke_linecap="round")
    else:
        a.path(f"M{cx - 50},{cy + 30} C{cx - 20},{cy + 10} {cx - 30},{cy + 40} {cx},{cy + 30} C{cx + 30},{cy + 20} "
               f"{cx + 10},{cy + 50} {cx + 50},{cy + 34}", **S)


def card(key, text, tint, dealt=False):
    def draw(a: Art):
        card_frame(a, tint, dealt)
        a.path(kit.heart_d(115, 50, 16), fill="#ffffff" if not dealt else "#ecebec", stroke=PLUM, stroke_width=2)
        emblem(a, key, 115, 132)
        lines = kit.wrap(text, 14)
        for k, ln in enumerate(lines):
            kit.label(a, 115, 228 + k * 30 - (len(lines) - 1) * 10, ln, size=26, family="serif", fill=PLUM, anchor="middle",
                      font_style="italic", fit=kit.fitw(ln, 26, 190, .5))
        if dealt:
            a.line(28, 30, 202, 300, stroke=PLUM, stroke_width=2, opacity=0.5)
            kit.label(a, 115, 300, "dealt itself", size=16, family="serif", fill=PLUM, anchor="middle", font_style="italic")
        else:
            a.rect(30, 284, 170, 22, rx=11, fill="#ffffff", opacity=0.7, stroke=PLUM, stroke_width=1.5)
    if dealt:
        draw.__doc__ = (f"A card the deck dealt itself, “{text}”: gray where the others are pastel, a "
                        f"thin line across it, lettered in the same plum italic; it fits no facet. Burn it or keep it.")
        row = kit.row(M, "Cards the deck deals itself (the crack)")
        title = f"Dealt card: {text}"
    else:
        draw.__doc__ = (f"A romance-comic card Cally builds, “{text}”: a {key} drawing in plum line on a "
                        f"flat pastel card, the words in swooning italic serif, and a blank tag strip at the foot "
                        f"for the facets it carries.")
        row = kit.row(M, "Cards Cally builds (gestures and lines)")
        title = f"Card: {text}"
    asset(G, f"{M}-card-{key}", group="cards", title=title, w=240, h=340, row=row)(draw)


for _c in CARDS:
    card(*_c)
for _k, _t in DEALT:
    card(_k, _t, "#d9d4d6", dealt=True)


@asset(G, f"{M}-card-back", group="cards", title="Card back", w=240, h=340,
       row=kit.row(M, "Cards Cally builds (gestures and lines)"))
def card_back(a: Art):
    """The back of every Persona card: flat rose with a plum keyline, a row of small hearts, and one large
    white heart in the middle."""
    card_frame(a, ROSE)
    a.path(kit.heart_d(115, 168, 56), fill="#ffffff", stroke=PLUM, stroke_width=4)
    for k in range(5):
        a.path(kit.heart_d(43 + k * 36, 40, 8), fill=DEEP_ROSE)
        a.path(kit.heart_d(43 + k * 36, 296, 8), fill=DEEP_ROSE)

"""Bloom (1D, spread containment on a grid): four-colour Ben-Day newsprint.

The State's morning paper prints her: cyan, magenta, yellow and black dot screens at their own angles
on yellowed newsprint, under a heavy black keyline; the spread is printed in rust and ochre dots
(Rostova's colours, DESIGN.md section 15). Cells are 120 by 120 and tile edge to edge; nobody dies on the
page: the marked are shown changed, in a dot screen, and named."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "bloom"
INK = kit.INK
NEWS = "#efe2b8"
CYAN, MAGENTA, YELLOW = "#2fa8d8", "#d8336a", "#e9c62e"
RED = "#c1272d"


def dots(a, color, r, step, angle):
    pid = a.uid("ben")
    a.defn(f'<pattern id="{pid}" width="{step}" height="{step}" patternUnits="userSpaceOnUse" '
           f'patternTransform="rotate({angle})"><circle cx="{f(step / 2)}" cy="{f(step / 2)}" r="{f(r)}" '
           f'fill="{color}"/></pattern>')
    return f"url(#{pid})"


def cell_base(a, cyan_r=1.6):
    a.rect(0, 0, 120, 120, fill=NEWS)
    a.rect(4, 4, 112, 112, fill=dots(a, CYAN, cyan_r, 9, 15), opacity=0.7)
    a.rect(4, 4, 112, 112, fill=dots(a, YELLOW, 1.2, 8, 0), opacity=0.5)
    for x, y, w, h in ((14, 16, 40, 34), (64, 20, 42, 28), (18, 64, 30, 40), (60, 60, 46, 44)):
        a.rect(x, y, w, h, fill=dots(a, INK, 1.3, 7, 45), opacity=0.55)


def keyline(a):
    a.rect(2, 2, 116, 116, fill="none", stroke=INK, stroke_width=4)


def resident(a, x, y, s=1.0, fill=MAGENTA):
    a.path(kit.person_d(x, y, s * 0.3), fill=fill, stroke=INK, stroke_width=1.5)


@asset(G, f"{M}-cell", group="pieces", title="District cell: clean", w=120, h=120,
       row=kit.row(M, "Grid cells (clean, spread, marked, absorbed, cordoned, burned)"))
def cell(a: Art):
    """A city block printed in Ben-Day dots: a cyan screen over yellowed newsprint, rooftops picked out in
    black dots, two small printed residents in magenta, all under a heavy black keyline."""
    cell_base(a)
    resident(a, 44, 104)
    resident(a, 86, 52)
    keyline(a)


def spread(level):
    def draw(a: Art):
        cell_base(a)
        r = (2.0, 3.0, 4.2)[level]
        a.rect(4, 4, 112, 112, fill=dots(a, kit.RUST, r, 10, 45), opacity=0.95)
        a.rect(4, 4, 112, 112, fill=dots(a, kit.OCHRE, r * .75, 9, 75), opacity=0.8)
        resident(a, 44, 104, fill=MAGENTA if level < 2 else kit.OCHRE)
        keyline(a)
    draw.__doc__ = (f"A block with the spread on it, level {level + 1} of 3: rust and ochre dots printed over "
                    f"the cyan screen, {('sparse', 'heavier', 'thick, almost solid')[level]}, as the wind carries "
                    f"the spores block to block.")
    asset(G, f"{M}-cell-spore-{level + 1}", group="pieces", title=f"District cell: spores, level {level + 1}",
          w=120, h=120, row=kit.row(M, "Grid cells (clean, spread, marked, absorbed, cordoned, burned)"))(draw)


for _l in range(3):
    spread(_l)


@asset(G, f"{M}-cell-marked", group="pieces", title="District cell: marked (the residents changed)", w=120, h=120,
       row=kit.row(M, "Grid cells (clean, spread, marked, absorbed, cordoned, burned)"))
def cell_marked(a: Art):
    """A block the spores took: heavy rust dots, and its residents printed changed, their shapes doubled
    and lengthened in an ochre screen, still standing and still named; nobody is dead on the page."""
    cell_base(a)
    a.rect(4, 4, 112, 112, fill=dots(a, kit.RUST, 3.4, 10, 45), opacity=0.9)
    for x, y in ((40, 104), (82, 98)):
        a.path(kit.person_d(x, y, 0.42, hunch=8), fill=dots(a, kit.OCHRE, 2.2, 6, 30), stroke=INK, stroke_width=1.5)
        a.path(kit.person_d(x + 4, y, 0.36, lean=6), fill="none", stroke=MAGENTA, stroke_width=1.5)
    keyline(a)


@asset(G, f"{M}-cell-absorbed", group="pieces", title="District cell: absorbed (Aegis)", w=120, h=120,
       row=kit.row(M, "Grid cells (clean, spread, marked, absorbed, cordoned, burned)"))
def cell_absorbed(a: Art):
    """A block Aegis has absorbed clean: the cyan screen paled almost to bare newsprint, a ring of yellow
    dots where the cloud was drawn in, the residents still there."""
    a.rect(0, 0, 120, 120, fill=NEWS)
    a.rect(4, 4, 112, 112, fill=dots(a, CYAN, 0.9, 9, 15), opacity=0.6)
    a.circle(60, 60, 40, fill="none", stroke=dots(a, YELLOW, 2.4, 7, 0), stroke_width=14)
    a.circle(60, 60, 40, fill="none", stroke=INK, stroke_width=1.5, stroke_dasharray="4 4")
    resident(a, 44, 104)
    keyline(a)


@asset(G, f"{M}-cordon", group="pieces", title="Cordon: a crew's sheeting on a cell", w=120, h=120,
       row=kit.row(M, "Grid cells (clean, spread, marked, absorbed, cordoned, burned)"))
def cordon(a: Art):
    """A cordon laid over a cell (transparent): a heavy black bar of wet sheeting across the block, a
    salvaged filter as a dotted square, and a crew member in magenta at its end."""
    a.rect(10, 50, 100, 20, fill=INK)
    a.rect(14, 54, 92, 12, fill=dots(a, CYAN, 1.6, 6, 15), opacity=0.8)
    a.rect(20, 18, 26, 26, fill=dots(a, INK, 1.8, 6, 45), stroke=INK, stroke_width=2)
    a.path(kit.person_d(94, 108, 0.32), fill=MAGENTA, stroke=INK, stroke_width=1.5)
    a.rect(2, 2, 116, 116, fill="none", stroke=INK, stroke_width=4, stroke_dasharray="14 8")


@asset(G, f"{M}-cell-burned", group="pieces", title="District cell: burned clear (the Cauldron)", w=120, h=120,
       row=kit.row(M, "Grid cells (clean, spread, marked, absorbed, cordoned, burned)"))
def cell_burned(a: Art):
    """A block the Cauldron has burned clear once and emptied himself doing it: black dots scorched across
    the cyan, a hard yellow centre, no spores left."""
    cell_base(a)
    a.rect(4, 4, 112, 112, fill=dots(a, INK, 3.2, 9, 45), opacity=0.8)
    a.circle(60, 60, 26, fill=dots(a, YELLOW, 3.4, 7, 0))
    a.circle(60, 60, 26, fill="none", stroke=INK, stroke_width=2)
    keyline(a)


@asset(G, f"{M}-pane", group="pieces", title="Pane: hard light on a cell edge", w=120, h=24,
       row=kit.row(M, "Edges: panes and the Twins' line"))
def pane(a: Art):
    """A pane of hard light raised on a cell edge, printed as a yellow-dot bar with a black keyline and a
    bright bare stripe down its middle; it blocks spread across that edge."""
    a.rect(2, 2, 116, 20, fill=dots(a, YELLOW, 2.6, 6, 0))
    a.rect(2, 9, 116, 6, fill="#fff6dc")
    a.rect(2, 2, 116, 20, fill="none", stroke=INK, stroke_width=3)
    for x in (20, 60, 100):
        a.line(x, 2, x, 22, stroke=INK, stroke_width=1)


@asset(G, f"{M}-twins-line", group="pieces", title="The Twins' line (a row of blocked edges)", w=600, h=40,
       row=kit.row(M, "Edges: panes and the Twins' line"))
def twins_line(a: Art):
    """The line the Twins collapse once: a long jagged black-keyed fault printed across five cell edges in
    magenta and black dots, cracked down its length; its cost is shown beside it, not here."""
    pts = [(0, 20)] + [(x, 20 + (8 if (x // 30) % 2 else -8)) for x in range(30, 600, 30)] + [(600, 20)]
    d = kit.P([(x, y - 10) for x, y in pts] + [(x, y + 10) for x, y in reversed(pts)], True)
    a.path(d, fill=dots(a, MAGENTA, 2.2, 6, 75))
    a.path(d, fill="none", stroke=INK, stroke_width=3)
    a.path(kit.P(pts), fill="none", stroke=INK, stroke_width=2)


@asset(G, f"{M}-source", group="pieces", title="The source rooftop (the rig)", w=120, h=120,
       row=kit.row(M, "The source, the wind and the tick"))
def source(a: Art):
    """The source cell: a rooftop seen from above with the dispersal rig on it, an ochre-dotted disc and a
    stack, rust dots spilling out of it in all directions."""
    cell_base(a)
    a.rect(4, 4, 112, 112, fill=dots(a, kit.RUST, 3.0, 10, 45), opacity=0.9)
    a.circle(60, 60, 30, fill=dots(a, kit.OCHRE, 3, 6, 75))
    a.circle(60, 60, 30, fill="none", stroke=INK, stroke_width=4)
    a.rect(52, 30, 16, 30, fill=INK)
    keyline(a)


@asset(G, f"{M}-crew", group="figures", title="A crew member", w=48, h=96,
       row=kit.row(M, "Residents and crews (small printed figures)"))
def crew(a: Art):
    """A settlement crew member printed small in magenta dots under a black keyline, carrying a rolled
    sheet over one shoulder."""
    d = kit.person_d(24, 92, 0.7)
    a.path(d, fill=dots(a, MAGENTA, 1.8, 5, 75))
    a.path(d, fill="none", stroke=INK, stroke_width=2)
    a.rect(26, 20, 22, 8, rx=4, fill=dots(a, CYAN, 1.6, 5, 15), stroke=INK, stroke_width=1.5)


@asset(G, f"{M}-resident", group="figures", title="A resident", w=48, h=96,
       row=kit.row(M, "Residents and crews (small printed figures)"))
def resident_fig(a: Art):
    """A resident of the district printed small in a cyan and yellow screen with a black keyline, standing,
    to be named on the page."""
    d = kit.person_d(24, 92, 0.7)
    a.path(d, fill=dots(a, CYAN, 1.8, 5, 15))
    a.path(d, fill=dots(a, YELLOW, 1.2, 5, 0), opacity=0.7)
    a.path(d, fill="none", stroke=INK, stroke_width=2)


@asset(G, f"{M}-wind", group="pieces", title="The wind arrow", w=200, h=120,
       row=kit.row(M, "The source, the wind and the tick"))
def wind(a: Art):
    """The wind arrow for the margin: a fat black-keyed arrow filled with cyan dots and WIND lettered in
    newspaper capitals beneath; rotate it to the wind."""
    d = "M10,40 L130,40 L130,16 L190,56 L130,96 L130,72 L10,72Z"
    a.path(d, fill=dots(a, CYAN, 2.4, 7, 15))
    a.path(d, fill="none", stroke=INK, stroke_width=4)
    kit.label(a, 70, 114, "WIND", size=20, family="serif", anchor="middle", font_weight="bold", letter_spacing="4")


@asset(G, f"{M}-tick", group="pieces", title="The tick counter box", w=200, h=120,
       row=kit.row(M, "The source, the wind and the tick"))
def tick(a: Art):
    """A boxed counter in the margin like a newspaper's weather box: TICK in serif capitals, a magenta-dot
    panel for the number, and a row of twelve small squares."""
    a.rect(4, 4, 192, 112, fill=NEWS, stroke=INK, stroke_width=4)
    kit.label(a, 18, 36, "TICK", size=24, family="serif", font_weight="bold", letter_spacing="3")
    a.rect(110, 14, 76, 56, fill=dots(a, MAGENTA, 1.4, 6, 75), stroke=INK, stroke_width=2)
    for k in range(12):
        a.rect(16 + k * 14.5, 86, 11, 16, fill="none", stroke=INK, stroke_width=1.5)


@asset(G, f"{M}-masthead", group="documents", title="Masthead: THE MORNING BULLETIN", w=1280, h=160,
       row=kit.row(M, "The page: masthead, frame and portrait"))
def masthead(a: Art):
    """A newspaper masthead across the top of the page: THE MORNING BULLETIN in heavy serif capitals over a
    rule, AN RCC PUBLICATION in small type, a blank dateline, and the price in a box."""
    a.rect(0, 0, 1280, 160, fill=NEWS)
    kit.label(a, 640, 92, "THE MORNING BULLETIN", size=76, family="serif", anchor="middle", font_weight="bold",
              letter_spacing="4", fit=1080)
    a.rect(40, 110, 1200, 6, fill=INK)
    a.rect(40, 120, 1200, 2, fill=INK)
    kit.label(a, 44, 146, "AN RCC PUBLICATION", size=16, family="serif", letter_spacing="3")
    a.line(520, 146, 760, 146, stroke=INK, stroke_width=1)
    a.rect(1160, 128, 80, 26, fill="none", stroke=INK, stroke_width=2)
    kit.label(a, 1200, 147, "2 CR", size=14, family="serif", anchor="middle")
    a.rect(40, 20, 120, 76, fill=dots(a, MAGENTA, 1.6, 6, 75), stroke=INK, stroke_width=2)
    a.rect(1120, 20, 120, 76, fill=dots(a, CYAN, 1.6, 6, 15), stroke=INK, stroke_width=2)


@asset(G, f"{M}-page", group="backdrops", title="Bloom: the newsprint page (backdrop)", w=1280, h=720,
       row=kit.row(M, "The page: masthead, frame and portrait"))
def page(a: Art):
    """The page under the masthead: yellowed newsprint with grey columns of type down both margins, a heavy
    keyline frame for the grid in the middle and a margin column on the right for the wind and the
    tick."""
    a.paper(NEWS, grain=0.25)
    a.rect(220, 30, 840, 660, fill="none", stroke=INK, stroke_width=6)
    for col, x0 in enumerate((24, 1080)):
        for k in range(36):
            w = 170 - (k * 37 + col * 11) % 60
            if k % 9 == 0:
                a.rect(x0, 40 + k * 18, 176, 10, fill=INK)
            else:
                a.rect(x0, 42 + k * 18, w, 6, fill="#8a8170")
    a.line(1080, 400, 1256, 400, stroke=INK, stroke_width=3)


@asset(G, f"{M}-portrait-catalyst", group="documents", title="Newsprint portrait: Rostova, captioned CATALYST", w=300, h=400,
       row=kit.row(M, "The page: masthead, frame and portrait"))
def portrait(a: Art):
    """A portrait as the paper runs it: a woman's head and shoulders in silhouette only, printed in rust and
    ochre dots in a keylined box, and under it the State's caption in capitals, CATALYST. Her name is
    Rostova; the bare word is only ever State text beside a portrait."""
    a.rect(0, 0, 300, 400, fill=NEWS)
    a.rect(20, 20, 260, 290, fill=dots(a, CYAN, 1.2, 8, 15), opacity=0.5)
    d = ("M150,70 C188,70 204,100 202,136 C200,160 188,176 178,184 L240,214 C266,228 276,262 278,310 L22,310 "
         "C24,262 34,228 60,214 L122,184 C112,176 100,160 98,136 C96,100 112,70 150,70Z")
    a.path(d, fill=dots(a, kit.RUST, 3.2, 7, 45))
    a.path(d, fill=dots(a, kit.OCHRE, 2.0, 7, 75), opacity=0.8)
    a.path("M96,130 C80,170 84,220 104,250 L120,190Z M204,130 C220,170 216,220 196,250 L180,190Z",
           fill=dots(a, kit.RUST, 3.6, 7, 45))
    a.rect(20, 20, 260, 290, fill="none", stroke=INK, stroke_width=5)
    kit.label(a, 150, 356, "CATALYST", size=44, family="serif", anchor="middle", font_weight="bold", letter_spacing="6",
              fit=240)
    a.rect(20, 372, 260, 3, fill=INK)

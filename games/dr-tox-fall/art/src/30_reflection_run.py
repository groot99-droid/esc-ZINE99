"""Reflection run (2D, scroll): silkscreen pop-art repeats.

Flat screen-printed colour blocks with no shading and no line weight but the ink's; every shape printed
twice, a colour block and an ink pass slightly out of register; the same figure repeated frame after
frame, one repeat that does not match. The Spire is glass: Cally walks the floor line, her reflection
walks below it, upside down. Figures stand with feet on the bottom edge; reflection sprites are drawn
already inverted, feet on the top edge. Backdrop layers share a floor line at y = 270 of 540."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "reflection-run"
PINK, MINT, CORAL, LILAC = "#E8B6C8", "#9ED8C6", "#F0907A", "#C9B6E8"
INKS = ("#2B2B6B", "#1E1E1E", "#3B1E5A")
GROUND = "#f1ede4"
FLOOR = 270
BLOCKS = (PINK, kit.SKY, kit.GOLD, MINT, CORAL, LILAC)


def printed(a, d, block, ink, dx=5, dy=-4, opacity=1.0):
    """One shape screen-printed twice: the colour block, then the ink pass a few units off register."""
    a.path(d, fill=block, transform=f"translate({dx},{dy})", opacity=opacity)
    a.path(d, fill=ink, opacity=0.9 * opacity)


def cally_d(x, y, s=1.0, step=0.0):
    """Cally in flat silhouette: a straight back, a fitted coat flaring at the knee, hair fanned to the
    shoulders. Feet at (x, y), 240 units tall at s=1."""
    h = 240 * s
    pts = [(x - 14 * s, y - h + 4 * s), (x, y - h - 4 * s), (x + 16 * s, y - h + 6 * s), (x + 22 * s, y - h + 40 * s),
           (x + 26 * s, y - h + 62 * s), (x + 12 * s, y - h + 56 * s), (x + 26 * s, y - h + 78 * s),
           (x + 22 * s, y - h + 150 * s), (x + 34 * s, y - 50 * s), (x + 10 * s + step, y - 46 * s),
           (x + 12 * s + step, y), (x + 4 * s + step, y), (x, y - 70 * s), (x - 4 * s - step, y), (x - 12 * s - step, y),
           (x - 10 * s - step, y - 46 * s), (x - 34 * s, y - 50 * s), (x - 22 * s, y - h + 150 * s),
           (x - 26 * s, y - h + 78 * s), (x - 12 * s, y - h + 56 * s), (x - 26 * s, y - h + 62 * s),
           (x - 22 * s, y - h + 40 * s)]
    return kit.P(pts, True)


def cally_details(a, x, y, s=1.0, ink=INKS[0], opacity=1.0, scarf=kit.SKY):
    """The print's second colours: the sky-blue scarf (her colour), a belt line and a shine in the hair."""
    h = 240 * s
    a.path(f"M{f(x - 14 * s)},{f(y - h + 50 * s)} L{f(x + 16 * s)},{f(y - h + 50 * s)} L{f(x + 14 * s)},{f(y - h + 62 * s)} "
           f"L{f(x - 12 * s)},{f(y - h + 62 * s)}Z M{f(x + 6 * s)},{f(y - h + 60 * s)} L{f(x + 14 * s)},{f(y - h + 60 * s)} "
           f"L{f(x + 20 * s)},{f(y - h + 104 * s)} L{f(x + 10 * s)},{f(y - h + 104 * s)}Z", fill=scarf, opacity=opacity)
    a.rect(x - 22 * s, y - h + 128 * s, 44 * s, 6 * s, fill=scarf, opacity=0.8 * opacity)
    a.path(f"M{f(x - 6 * s)},{f(y - h + 4 * s)} C{f(x + 4 * s)},{f(y - h)} {f(x + 12 * s)},{f(y - h + 8 * s)} "
           f"{f(x + 14 * s)},{f(y - h + 22 * s)}", fill="none", stroke="#ffffff", stroke_width=3 * s, opacity=0.5 * opacity)


def flip(a, h):
    a.open("g", transform=f"translate(0,{h}) scale(1,-1)")


# ---- figures -----------------------------------------------------------------------------------
@asset(G, f"{M}-cally-walk", group="figures", title="Cally walking (two prints off register)", w=200, h=320,
       row=kit.row(M, "Cally and her reflection"))
def cally_walk(a: Art):
    """Cally mid-stride in flat silkscreen: a sky-blue colour block printed a little off register under a
    deep indigo ink silhouette, hair fanned, back straight; no face, only the print."""
    printed(a, cally_d(100, 312, 1.2, step=10), kit.SKY, INKS[0])
    cally_details(a, 100, 312, 1.2, scarf=kit.GOLD)


@asset(G, f"{M}-cally-wait", group="figures", title="Cally waiting in a camera's view", w=200, h=320,
       row=kit.row(M, "Cally and her reflection"))
def cally_wait(a: Art):
    """Cally standing still for the camera, weight on one foot, the silhouette printed in pink under a
    black ink pass: very good at being watched."""
    printed(a, cally_d(100, 312, 1.2), PINK, INKS[1], dx=-5, dy=4)
    cally_details(a, 100, 312, 1.2)


@asset(G, f"{M}-reflect-walk", group="figures", title="The reflection walking (inverted)", w=200, h=320,
       row=kit.row(M, "Cally and her reflection"))
def reflect_walk(a: Art):
    """Her reflection, printed upside down for the glass below the floor line: the same silhouette in a
    paler mint block and a faded ink pass, feet on the top edge, a stride behind."""
    flip(a, 320)
    printed(a, cally_d(100, 312, 1.2, step=6), MINT, INKS[0], opacity=0.6)
    cally_details(a, 100, 312, 1.2, opacity=0.6)
    a.close()


@asset(G, f"{M}-reflect-refuse", group="figures", title="The reflection refusing (back turned, inverted)", w=200, h=320,
       row=kit.row(M, "Cally and her reflection"))
def reflect_refuse(a: Art):
    """The repeat that does not match: the reflection upside down, stopped and turned away, its colour
    block printed in coral and badly out of register, one hand flat against the glass."""
    flip(a, 320)
    d = cally_d(100, 312, 1.2)
    a.path(d, fill=CORAL, transform="translate(-14,10)")
    a.path(d, fill=INKS[2], opacity=0.75)
    a.path("M128,150 L150,140 L156,166 L132,170Z", fill=INKS[2], opacity=0.75)
    cally_details(a, 100, 312, 1.2, opacity=0.6, scarf=kit.SKY)
    a.close()


@asset(G, f"{M}-aegis", group="figures", title="Aegis across the glass", w=240, h=320,
       row=kit.row(M, "Aegis across the glass"))
def aegis(a: Art):
    """Aegis across two panes of glass, seen only as a broad flat silhouette in warm gold under an ink
    pass, head turning; he has no design system yet, so he is a shape and a colour."""
    d = kit.person_d(120, 312, 2.4, broad=1.3)
    printed(a, d, kit.GOLD, INKS[1], dx=6, dy=5)
    a.path("M78,96 L162,96 L170,120 L70,120Z", fill=kit.GOLD, opacity=0.9)
    a.path("M104,100 L136,100 L130,112 L110,112Z", fill=INKS[1])
    a.rect(16, 20, 12, 290, fill="#ffffff", opacity=0.55)
    a.rect(210, 20, 12, 290, fill="#ffffff", opacity=0.55)


# ---- backdrops ---------------------------------------------------------------------------------
@asset(G, f"{M}-glass-far", group="backdrops", title="Reflection run: the glass hall (far layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the Spire's glass halls (parallax)"))
def glass_far(a: Art):
    """The far layer: a row of silkscreen repeat frames, each the same glass-hall bay printed in a
    different flat colour, the upper half the hall and the lower half its reflection, paler, under a
    hard floor line; registration marks at the frame corners."""
    a.rect(0, 0, 1920, 540, fill=GROUND)
    for i in range(8):
        x = i * 240
        blk = BLOCKS[i % len(BLOCKS)]
        ink = INKS[i % 3]
        a.rect(x + 8, 10, 224, FLOOR - 10, fill=blk)
        a.rect(x + 8, FLOOR, 224, 520 - FLOOR, fill=blk, opacity=0.45)
        dx = 4 if i % 2 else -4
        for k in range(3):
            a.rect(x + 30 + k * 64 + dx, 40, 44, FLOOR - 70, fill=ink, opacity=0.18)
        a.path(f"M{x + 40},{FLOOR - 20} L{x + 120},{FLOOR - 90} L{x + 200},{FLOOR - 20}", fill="none", stroke=ink,
               stroke_width=6, opacity=0.35)
        a.line(x + 8, FLOOR, x + 232, FLOOR, stroke=ink, stroke_width=5)
        for cx, cy in ((x + 4, 6), (x + 236, 6), (x + 4, 524), (x + 236, 524)):
            a.circle(cx, cy, 4, fill="none", stroke=INKS[1], stroke_width=1)
            a.line(cx - 7, cy, cx + 7, cy, stroke=INKS[1], stroke_width=1)
            a.line(cx, cy - 7, cx, cy + 7, stroke=INKS[1], stroke_width=1)


@asset(G, f"{M}-glass-mid", group="backdrops", title="Reflection run: the glass hall (mid layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the Spire's glass halls (parallax)"))
def glass_mid(a: Art):
    """Transparent mid layer: tall glass mullions and pale stone pillars printed as flat ink bars, each
    mirrored below the floor line at half strength, and a band of floor printed flat."""
    for x in range(120, 1920, 300):
        a.rect(x + 6, 0, 40, FLOOR, fill=LILAC, opacity=0.7)
        a.rect(x, 0, 40, FLOOR, fill=INKS[2], opacity=0.85)
        a.rect(x, FLOOR, 40, FLOOR, fill=INKS[2], opacity=0.3)
        a.rect(x + 160, 30, 10, FLOOR - 30, fill=INKS[0], opacity=0.6)
        a.rect(x + 160, FLOOR, 10, FLOOR - 30, fill=INKS[0], opacity=0.2)
    a.rect(0, FLOOR - 6, 1920, 12, fill=INKS[1])


@asset(G, f"{M}-glass-near", group="backdrops", title="Reflection run: the glass hall (near layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the Spire's glass halls (parallax)"))
def glass_near(a: Art):
    """Transparent near layer: the edges of glass panes close to the camera, printed as long pale
    diagonal highlights and thin ink frames, with a potted plant above the floor and its print below."""
    for x in range(60, 1920, 480):
        a.path(f"M{x},0 L{x + 40},0 L{x - 80},540 L{x - 120},540Z", fill="#ffffff", opacity=0.35)
        a.rect(x + 200, 0, 8, 540, fill=INKS[1], opacity=0.8)
    for x in range(330, 1920, 960):
        for sgn in (1, -1):
            base = FLOOR
            a.path(f"M{x - 30},{base} L{x - 22},{base - sgn * 60} L{x + 22},{base - sgn * 60} L{x + 30},{base}Z",
                   fill=CORAL, opacity=1 if sgn == 1 else 0.4)
            for k in range(5):
                a.ellipse(x - 40 + k * 20, base - sgn * (90 + (k % 2) * 20), 16, 30, fill=MINT,
                          opacity=1 if sgn == 1 else 0.4)
            a.path(f"M{x - 30},{base} L{x - 22},{base - sgn * 60} L{x + 22},{base - sgn * 60} L{x + 30},{base}Z",
                   fill=INKS[1], opacity=0.5 if sgn == 1 else 0.2, transform="translate(4,-3)")


# ---- pieces ------------------------------------------------------------------------------------
def regmarks(a, w, h):
    for cx, cy in ((8, 8), (w - 8, 8), (8, h - 8), (w - 8, h - 8)):
        a.circle(cx, cy, 5, fill="none", stroke=INKS[1], stroke_width=1.2)
        a.line(cx - 8, cy, cx + 8, cy, stroke=INKS[1], stroke_width=1.2)
        a.line(cx, cy - 8, cx, cy + 8, stroke=INKS[1], stroke_width=1.2)


@asset(G, f"{M}-frame", group="pieces", title="Repeat frame, unprinted", w=240, h=540,
       row=kit.row(M, "Repeat frames (filling with colour as she passes)"))
def frame(a: Art):
    """One repeat frame before it is printed: a thin ink outline, a floor line across the middle and
    registration marks at the corners, the paper showing through; a refused frame stays like this."""
    a.rect(14, 14, 212, 512, fill=GROUND, opacity=0.5, stroke=INKS[1], stroke_width=2, stroke_dasharray="8 6")
    a.line(14, FLOOR, 226, FLOOR, stroke=INKS[1], stroke_width=2, stroke_dasharray="8 6")
    regmarks(a, 240, 540)


@asset(G, f"{M}-frame-printed", group="pieces", title="Repeat frame, printed", w=240, h=540,
       row=kit.row(M, "Repeat frames (filling with colour as she passes)"))
def frame_printed(a: Art):
    """The same frame once she has passed: flat pink above the floor line and paler below, an indigo ink
    pass laid a few units off register, registration marks at the corners; tint it per frame."""
    a.rect(20, 18, 212, 512, fill=PINK, opacity=0.9)
    a.rect(14, 14, 212, FLOOR - 14, fill="none", stroke=INKS[0], stroke_width=4)
    a.rect(14, FLOOR, 212, 512 - FLOOR + 14, fill="#ffffff", opacity=0.35)
    a.line(14, FLOOR, 226, FLOOR, stroke=INKS[0], stroke_width=6)
    regmarks(a, 240, 540)


@asset(G, f"{M}-camera-cue", group="pieces", title="The handler's cue: a printed camera", w=160, h=160,
       row=kit.row(M, "The handler's cue (cameras are objectives)"))
def camera_cue(a: Art):
    """The handler's cue: a small printed camera on a bracket inside a marked square frame, gold block
    under black ink, a lens circle left as bare paper; be in its view when the frame lights."""
    a.rect(10, 10, 140, 140, fill=kit.GOLD)
    a.rect(4, 4, 140, 140, fill="none", stroke=INKS[1], stroke_width=5)
    d = "M30,60 L104,60 L104,108 L30,108Z M104,72 L132,60 L132,108 L104,96Z"
    printed(a, d, CORAL, INKS[1], dx=4, dy=4)
    a.circle(58, 84, 14, fill=GROUND)
    a.line(66, 40, 66, 60, stroke=INKS[1], stroke_width=6)


@asset(G, f"{M}-door", group="pieces", title="A glass door", w=160, h=300,
       row=kit.row(M, "Doors, switches and the three refusals"))
def door(a: Art):
    """A Spire glass door printed flat: a sky-blue pane with a white diagonal highlight, a dark ink frame
    printed off register and a long bar handle."""
    a.rect(16, 14, 132, 280, fill=kit.SKY)
    a.path("M40,20 L80,20 L40,120 L24,120Z", fill="#ffffff", opacity=0.6)
    a.rect(10, 8, 132, 280, fill="none", stroke=INKS[0], stroke_width=8)
    a.rect(110, 120, 10, 70, fill=INKS[0])
    for y in (40, 250):
        a.rect(6, y, 12, 26, fill=kit.GOLD)


@asset(G, f"{M}-door-rcc", group="pieces", title="Refusal 1: a door plate stamped RCC", w=200, h=100,
       row=kit.row(M, "Doors, switches and the three refusals"))
def door_rcc(a: Art):
    """The plate where the reflection first stops: RCC in heavy capitals on a flat gray-teal plate,
    printed twice out of register, the letters doubled like a bad pull."""
    a.rect(12, 14, 180, 76, rx=6, fill=kit.TEAL2)
    a.rect(6, 8, 180, 76, rx=6, fill="none", stroke=INKS[1], stroke_width=5)
    kit.label(a, 102, 66, "RCC", size=46, anchor="middle", font_weight="bold", fill=kit.WHITE, letter_spacing="6")
    kit.label(a, 96, 62, "RCC", size=46, anchor="middle", font_weight="bold", fill=INKS[1], letter_spacing="6")
    for x, y in ((16, 18), (176, 18), (16, 74), (176, 74)):
        a.circle(x, y, 3.5, fill=INKS[1])


@asset(G, f"{M}-switch", group="pieces", title="A switch in the glass world", w=100, h=140,
       row=kit.row(M, "Doors, switches and the three refusals"))
def switch(a: Art):
    """A wall switch only the reflection can reach, printed upside down below the floor line: a mint
    plate, an ink toggle, a small arrow pointing to the door it opens."""
    flip(a, 140)
    a.rect(22, 30, 60, 90, rx=6, fill=MINT, transform="translate(4,4)")
    a.rect(22, 30, 60, 90, rx=6, fill="none", stroke=INKS[0], stroke_width=5)
    a.rect(42, 50, 20, 40, rx=4, fill=INKS[0])
    a.path("M52,8 L64,22 L40,22Z", fill=INKS[0])
    a.close()


@asset(G, f"{M}-column-rcc", group="pieces", title="Refusal: the clean-air column's plate", w=160, h=440,
       row=kit.row(M, "Doors, switches and the three refusals"))
def column_rcc(a: Art):
    """A clean-air column of glass printed in flat bands of pale blue and white, air that costs money to
    breathe clean, with a plate at its foot stamped RCC: the second run's first refusal."""
    a.rect(30, 10, 100, 360, fill=kit.SKY, opacity=0.5)
    for k in range(6):
        a.rect(30, 30 + k * 56, 100, 18, fill="#ffffff", opacity=0.7)
    a.rect(24, 4, 100, 360, fill="none", stroke=INKS[0], stroke_width=6)
    a.rect(18, 370, 124, 60, rx=6, fill=kit.TEAL2)
    kit.label(a, 82, 414, "RCC", size=34, anchor="middle", font_weight="bold", fill=INKS[1], letter_spacing="4")


@asset(G, f"{M}-mural-sky", group="pieces", title="Refusal: a lobby mural of a painted sky", w=480, h=300,
       row=kit.row(M, "Doors, switches and the three refusals"))
def mural_sky(a: Art):
    """A lobby mural of a painted sky printed as pop art: a flat blue field, three white cloud blocks
    with ink outlines off register, a green strip of field: the sky from Sky Room, sold back."""
    a.rect(14, 14, 452, 272, fill=kit.SKY)
    a.rect(14, 210, 452, 76, fill="#7FA65C")
    for cx, cy, w in ((110, 80, 120), (290, 120, 150), (400, 60, 90)):
        d = (f"M{cx - w / 2},{cy} C{cx - w / 2},{cy - 30} {cx - w / 6},{cy - 40} {cx},{cy - 26} "
             f"C{cx + w / 6},{cy - 44} {cx + w / 2},{cy - 30} {cx + w / 2},{cy}Z")
        a.path(d, fill="#ffffff")
        a.path(d, fill="none", stroke=INKS[0], stroke_width=4, transform="translate(6,-4)")
    a.rect(8, 8, 452, 272, fill="none", stroke=INKS[1], stroke_width=6)


@asset(G, f"{M}-trolley-string", group="pieces", title="Refusal: a loop of string on a cleaner's trolley", w=240, h=200,
       row=kit.row(M, "Doors, switches and the three refusals"))
def trolley_string(a: Art):
    """A cleaner's trolley printed in flat coral and ink, a mop handle, a bucket and, hanging from the
    rail, a loop of white string: the third refusal."""
    a.rect(30, 70, 170, 80, fill=CORAL, transform="translate(5,4)")
    a.rect(30, 70, 170, 80, fill="none", stroke=INKS[1], stroke_width=5)
    a.line(30, 70, 14, 30, stroke=INKS[1], stroke_width=6)
    a.line(150, 70, 190, 4, stroke=INKS[1], stroke_width=5)
    a.rect(60, 90, 50, 50, fill=MINT)
    for x in (50, 180):
        a.circle(x, 166, 14, fill=INKS[1])
    a.path("M120,70 C110,100 112,120 130,124 C150,128 158,100 140,70", fill="none", stroke="#ffffff", stroke_width=5)
    a.path("M120,70 C110,100 112,120 130,124 C150,128 158,100 140,70", fill="none", stroke=INKS[0], stroke_width=1.5,
           transform="translate(3,2)")


@asset(G, f"{M}-force", group="pieces", title="Force (hold): the reflection dragged on", w=160, h=160,
       row=kit.row(M, "Force or stop with it"))
def force(a: Art):
    """The Force prompt: a printed arrow pulling right out of a coral block, FORCE in heavy capitals,
    the ink pass off register."""
    a.rect(14, 18, 132, 124, fill=CORAL)
    printed(a, "M30,70 L100,70 L100,50 L136,84 L100,118 L100,98 L30,98Z", "#ffffff", INKS[1], dx=-5, dy=4)
    for x in (22, 36):
        a.path(f"M{x},30 l8,8 l-8,8", fill="none", stroke=INKS[1], stroke_width=3)
    kit.label(a, 80, 150, "FORCE", size=22, anchor="middle", font_weight="bold", fill=INKS[1], letter_spacing="3")


@asset(G, f"{M}-stop", group="pieces", title="Stop with it: the reflection walks on alone", w=160, h=160,
       row=kit.row(M, "Force or stop with it"))
def stop(a: Art):
    """The stop prompt: two short printed bars in a mint block, a pause, STAY in heavy capitals, the ink
    pass off register."""
    a.rect(14, 18, 132, 124, fill=MINT)
    printed(a, "M50,40 L72,40 L72,118 L50,118Z M88,40 L110,40 L110,118 L88,118Z", "#ffffff", INKS[0], dx=-5, dy=4)
    for x in (22, 36):
        a.path(f"M{x + 8},30 l-8,8 l8,8", fill="none", stroke=INKS[0], stroke_width=3)
    kit.label(a, 80, 150, "STAY", size=22, anchor="middle", font_weight="bold", fill=INKS[0], letter_spacing="3")

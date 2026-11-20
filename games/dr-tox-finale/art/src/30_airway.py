"""The airway (2D, scroll): non-photo-blue pencil roughs.

Light blue construction pencil on white bristol board, the ducts sketched loose; behind him the path is
inked in black brush, and the branch not taken stays blue. Every duct piece comes twice, `-blue` (ahead,
still a rough) and `-inked` (behind him, inked): the module swaps one for the other as he passes. His breath
is a soft grey wash; the rooms under the grilles are pencilled boxes with names lettered in. Nobody is hurt
on the page: an exposed room is people leaving it, coughing."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "airway"
NPB, INK = kit.NPB, kit.INK
BOARD = "#f7f5ef"
WASH = "#9aa3a3"


def blue(a, d, w=2.2, op=0.9):
    a.path(d, fill="none", stroke=NPB, stroke_width=w, stroke_linecap="round", opacity=op)


def rough(a, pts, passes=3, w=1.8, amp=2.5):
    """A pencil rough: the same line drawn loosely two or three times."""
    for _ in range(passes):
        blue(a, a.wobble_d(pts, amp=amp, step=30), w)


def brush(a, pts, w=7, amp=1.2):
    a.path(a.wobble_d(pts, amp=amp, step=22), fill="none", stroke=INK, stroke_width=w, stroke_linecap="round",
           stroke_linejoin="round")


def line(a, pts, inked, w=None):
    if inked:
        brush(a, pts, w or 7)
    else:
        rough(a, pts, w=w and w / 3 or 1.8)


# ---- backdrops ----------------------------------------------------------------------------------
def far(a, supply):
    a.paper(BOARD, grain=0.16)
    for k in range(0, 1920, 48):                         # faint construction grid
        blue(a, f"M{k},0 L{k},540", 0.6, 0.25)
    for k in range(0, 540, 48):
        blue(a, f"M0,{k} L1920,{k}", 0.6, 0.25)
    if supply:                                           # the suite's ceiling void: a glass wall far below, amber-free
        for x in range(60, 1920, 240):
            rough(a, [(x, 380), (x + 180, 380), (x + 180, 520), (x, 520)], 2, 1.4)
            rough(a, [(x + 20, 400), (x + 160, 500)], 1, 1.0)
        rough(a, [(0, 360), (1920, 360)], 2, 1.4)
        a.text(80, 520, "suite below", size=22, family="sans-serif", fill=NPB, opacity=0.6)
    else:                                                # the exhaust stack: tall shaft walls going up
        for x in (120, 700, 1300):
            rough(a, [(x, 540), (x + 30, 0)], 2, 1.4)
            rough(a, [(x + 220, 540), (x + 250, 0)], 2, 1.4)
            for y in range(40, 540, 90):
                rough(a, [(x + 10, y), (x + 230, y - 6)], 1, 1.0)
        a.text(80, 520, "exhaust stack", size=22, family="sans-serif", fill=NPB, opacity=0.6)
    for k in range(5):
        a.text(200 + k * 360, 40 + (k % 2) * 20, ("4″", "fan", "→ flow", "damper?", "28″")[k], size=18,
               family="sans-serif", fill=NPB, opacity=0.55, font_style="italic")


def mid(a, supply):
    """Transparent above and below: the duct run's walls sketched across the strip."""
    top, bot = (190, 350) if not supply else (210, 330)
    rough(a, [(0, top), (1920, top)], 3, 2.0)
    rough(a, [(0, bot), (1920, bot)], 3, 2.0)
    for x in range(160, 1920, 320):                      # flange joints
        rough(a, [(x, top - 12), (x, bot + 12)], 2, 1.6)
    for x in range(300, 1920, 640):                      # a branch rising, never taken here
        rough(a, [(x, top), (x + 120, 40)], 2, 1.4)
        rough(a, [(x + 80, top), (x + 200, 40)], 2, 1.4)
    for x in range(80, 1920, 220):
        blue(a, f"M{x},{(top + bot) / 2} l50,0 M{x + 50},{(top + bot) / 2} l-10,-6 M{x + 50},{(top + bot) / 2} l-10,6",
             1.6, 0.6)


for _run, _sup, _title in (("stack", False, "the exhaust stack from the plinth (Airway 1)"),
                           ("supply", True, "the supply duct over the clinical suite (Airway 2)")):
    for _lay, _fn, _what in (("far", far, "far layer, opaque: bristol board with a faint blue grid and the space around the ducts"),
                             ("mid", mid, "mid layer, transparent: the duct run's walls and flanges sketched loose")):
        def _draw(a, fn=_fn, sup=_sup):
            fn(a, sup)
        _draw.__doc__ = (f"Airway backdrop, {_title}, {_what}, all in non-photo-blue construction pencil. Tiles "
                         f"horizontally.")
        asset(G, f"airway-{_run}-{_lay}", group="backdrops", title=f"Airway: {_title} ({_lay} layer)", w=1920, h=540,
              row=kit.row(M, "Parallax backdrops, two layers per run"))(_draw)


# ---- duct pieces, each blue and inked ------------------------------------------------------------
def duct(a, inked):
    line(a, [(0, 40), (480, 40)], inked)
    line(a, [(0, 200), (480, 200)], inked)
    line(a, [(160, 30), (160, 50)], inked, 4)
    line(a, [(160, 190), (160, 210)], inked, 4)
    if inked:
        a.hatch(0, 40, 480, 160, angle=60, spacing=22, stroke=INK, stroke_width=1.2, opacity=0.25,
                clip=a.clip('<rect x="0" y="40" width="480" height="160"/>'))
    else:
        rough(a, [(320, 40), (330, 200)], 1, 1.0)


def branch(a, inked):
    line(a, [(0, 200), (480, 200)], inked)
    line(a, [(0, 120), (200, 120), (300, 0)], inked)
    line(a, [(380, 0), (300, 120), (480, 120)], inked)
    if inked:
        a.hatch(0, 120, 480, 80, angle=60, spacing=22, stroke=INK, stroke_width=1.2, opacity=0.25,
                clip=a.clip('<rect x="0" y="120" width="480" height="80"/>'))


def fan(a, inked):
    duct(a, inked)
    cx, cy = 240, 120
    if inked:
        a.circle(cx, cy, 66, fill="none", stroke=INK, stroke_width=6)
        for k in range(5):
            t = math.radians(k * 72)
            a.path(f"M{cx},{cy} Q{f(cx + 50 * math.cos(t + .5))},{f(cy + 50 * math.sin(t + .5))} "
                   f"{f(cx + 58 * math.cos(t))},{f(cy + 58 * math.sin(t))}", fill="none", stroke=INK, stroke_width=8,
                   stroke_linecap="round")
        a.circle(cx, cy, 10, fill=INK)
    else:
        a.circle(cx, cy, 66, fill="none", stroke=NPB, stroke_width=2)
        for k in range(5):
            t = math.radians(k * 72)
            blue(a, f"M{cx},{cy} l{f(58 * math.cos(t))},{f(58 * math.sin(t))}", 2.5)


def grille(a, inked):
    duct(a, inked)
    for k in range(8):
        x = 170 + k * 20
        if inked:
            a.line(x, 194, x, 214, stroke=INK, stroke_width=5)
        else:
            blue(a, f"M{x},194 L{x},214", 2.5)
    if inked:
        a.rect(162, 192, 164, 24, fill="none", stroke=INK, stroke_width=3)
    else:
        rough(a, [(162, 192), (326, 192), (326, 216), (162, 216)], 1, 1.4)


def arrow(a, inked):
    col = INK if inked else NPB
    for k, y in enumerate((40, 80)):
        a.path(f"M10,{y} L130,{y}", fill="none", stroke=col, stroke_width=4 if inked else 2.5, stroke_linecap="round")
        a.poly([(130, y - 9), (150, y), (130, y + 9)], fill=col)
    a.path("M40,60 L100,60", fill="none", stroke=col, stroke_width=2, opacity=0.5)


PIECES = (("duct", duct, 480, 240, "a straight duct section, two walls and a flange joint", "Duct pieces (blue ahead, inked behind)"),
          ("branch", branch, 480, 240, "a branch point: the run goes on and a duct rises off it to the upper right",
           "Duct pieces (blue ahead, inked behind)"),
          ("fan", fan, 480, 240, "a duct section with an axial fan in it, five blades", "Fans"),
          ("grille", grille, 480, 240, "a duct section with a slatted grille in the floor that opens onto a room below",
           "Grilles over rooms"),
          ("arrow", arrow, 160, 120, "two airflow arrows pointing downstream", "Airflow arrows"))
for _key, _fn, _w, _h, _what, _row in PIECES:
    for _ink in (False, True):
        def _draw(a, fn=_fn, ink=_ink):
            fn(a, ink)
        _draw.__doc__ = (f"Airway piece: {_what}, "
                         + ("inked in black brush with a light hatch: the path behind him." if _ink else
                            "sketched in non-photo-blue pencil: still a rough, ahead of him or not taken."))
        asset(G, f"airway-{_key}-{'inked' if _ink else 'blue'}", group="pieces",
              title=f"Airway: {_key} ({'inked' if _ink else 'blue rough'})", w=_w, h=_h, row=kit.row(M, _row))(_draw)


def damper(a, shut):
    for k in range(5):
        y = 40 + k * 34
        if shut:
            a.line(60, y, 120, y + 4, stroke=INK, stroke_width=7, stroke_linecap="round")
        else:
            a.line(80, y - 14, 100, y + 18, stroke=INK, stroke_width=7, stroke_linecap="round")
        a.circle(90, y + 2, 4, fill=INK)
    a.rect(52, 20, 76, 180, fill="none", stroke=INK, stroke_width=4)
    blue(a, "M40,10 L140,10 M40,210 L140,210", 1.6)


@asset(G, "airway-damper-open", group="pieces", title="Airway: a louvred damper, open", w=180, h=220,
       row=kit.row(M, "Dampers (cycle open and shut)"))
def damper_open(a: Art):
    """A louvred damper in a duct, inked: five blades turned edge-on, the flow through. Blue pencil marks
    where the duct walls meet it."""
    damper(a, False)


@asset(G, "airway-damper-shut", group="pieces", title="Airway: a louvred damper, shut", w=180, h=220,
       row=kit.row(M, "Dampers (cycle open and shut)"))
def damper_shut(a: Art):
    """The same damper with its five blades closed flat across the duct: the flow turned."""
    damper(a, True)


@asset(G, "airway-plume", group="pieces", title="Airway: his breath plume (grey wash)", w=420, h=120,
       row=kit.row(M, "The breath plume"))
def plume(a: Art):
    """His breath going downstream as a soft grey watercolour wash, wide at his end on the left and
    thinning to the right; the only tone on the page that is neither pencil nor ink."""
    for k, (w, op) in enumerate(((70, 0.2), (48, 0.28), (28, 0.36))):
        a.path("M20,60 C100,44 180,74 260,58 C320,48 370,64 410,58", fill="none", stroke=WASH, stroke_width=w,
               opacity=op, stroke_linecap="round")
    a.ellipse(40, 60, 30, 34, fill=WASH, opacity=0.2)
    a.path("M30,60 C120,52 200,68 300,60", fill="none", stroke=WASH, stroke_width=4, opacity=0.25)


@asset(G, "airway-ink-edge", group="pieces", title="Airway: the inked edge, in progress", w=120, h=240,
       row=kit.row(M, "Duct pieces (blue ahead, inked behind)"))
def ink_edge(a: Art):
    """The front of the inking: the brush stroke on each wall tapering out, a little dry-brush break and
    one drip, where the blue rough begins. Laid at his position over the duct."""
    for y in (40, 200):
        a.path(f"M0,{y - 4} L60,{y - 3} C80,{y - 2} 96,{y} 116,{y} C96,{y + 1} 80,{y + 3} 60,{y + 4} L0,{y + 4}Z", fill=INK)
        for k in range(3):
            a.line(70 + k * 12, y - 2 + k, 90 + k * 10, y - 1 + k, stroke=BOARD, stroke_width=1)
    a.ellipse(40, 214, 3, 6, fill=INK)
    blue(a, "M60,40 L120,40 M60,200 L120,200", 1.6)


# ---- figures --------------------------------------------------------------------------------------
def tox(a, closed=True, pose="move"):
    x, y = a.w / 2, a.h - 6
    s = 1.05
    lean = {"move": 6, "grip": -8, "shroud": 0, "breath": 0}[pose]
    d = kit.tox_d(x, y, s, closed=closed, lean=lean)
    a.path(d, fill=kit.SHROUD, stroke=INK, stroke_width=4, stroke_linejoin="round")
    a.hatch(x - 40, y - 170, 80, 170, angle=65, spacing=8, stroke=INK, stroke_width=1, opacity=0.4,
            clip=a.clip(f'<path d="{d}"/>'))
    if not closed:
        a.path(kit.tox_legs_d(x, y, s), fill=INK)
    if pose == "grip":
        a.path(f"M{x - 14},{y - 120} L{x - 50},{y - 150}", fill="none", stroke=INK, stroke_width=7, stroke_linecap="round")
        a.line(x - 70, y - 160, x - 30, y - 160, stroke=INK, stroke_width=5)
        blue(a, f"M{x + 30},{y - 90} l40,0 M{x + 30},{y - 70} l40,0", 2)
    elif pose == "move":
        blue(a, f"M{x - 70},{y - 100} l30,0 M{x - 76},{y - 70} l30,0 M{x - 70},{y - 40} l30,0", 2.2)
    elif pose == "breath":
        for k in range(3):
            a.path(f"M{x + 22 + k * 8},{y - 160} q6,8 0,16", fill="none", stroke=INK, stroke_width=2.5)
        kit.label(a, x + 40, y - 168, "hold", size=16, family="sans-serif", fill=NPB, font_style="italic")


for _k, _closed, _pose, _what in (("airway-tox", True, "move", "carried along by the flow, blue speed marks behind him"),
                                  ("airway-tox-grip", True, "grip", "gripping a duct rib against the flow, one arm out"),
                                  ("airway-tox-shroud", False, "shroud", "with the shroud open: the narrow black figure showing"),
                                  ("airway-tox-breath", True, "breath", "holding his breath over a grille, three short ink "
                                   "brackets at the hood and a pencil note")):
    def _draw(a, closed=_closed, pose=_pose):
        tox(a, closed, pose)
    _draw.__doc__ = (f"Airway figure: Dr. Tox inked in black brush, the shroud's desaturated green laid flat inside "
                     f"the line, {_what}. Feet on the bottom edge; no face.")
    asset(G, _k, group="figures", title=f"Airway: Dr. Tox ({_pose})", w=160, h=200,
          row=kit.row(M, "Figures: Dr. Tox"))(_draw)


# ---- documents: the rooms under the grilles -------------------------------------------------------
@asset(G, "airway-room", group="documents", title="Airway: a room under a grille (pencilled, names blank)", w=320, h=200,
       row=kit.row(M, "Rooms below the grilles"))
def room(a: Art):
    """A room under a grille as a pencilled dashed box: a ceiling line with the grille's slots, three
    ruled lines where the names and wants of who is under it are lettered at run time, in blue."""
    rough(a, [(10, 20), (310, 20), (310, 190), (10, 190)], 2, 1.6)
    for k in range(8):
        blue(a, f"M{90 + k * 18},14 L{90 + k * 18},26", 2.5)
    for k in range(3):
        blue(a, f"M30,{78 + k * 40} L290,{78 + k * 40}", 0.8, 0.5)
    a.text(30, 180, "below:", size=16, family="sans-serif", fill=NPB, font_style="italic")


@asset(G, "airway-room-exposed", group="documents", title="Airway: an exposed room (people leaving, coughing)", w=320, h=200,
       row=kit.row(M, "Rooms below the grilles"))
def room_exposed(a: Art):
    """The same room after the plume passed over its grille: the box is inked now, a grey wash has come
    down through the slots, the door at the right is open and three small figures are going out of it with
    cough marks over them. Nobody is shown harmed; the names are kept on the record."""
    a.path(a.wobble_d([(10, 20), (310, 20), (310, 190), (10, 190)], amp=1, step=30, closed=True), fill="none", stroke=INK,
           stroke_width=4)
    for k in range(8):
        a.line(90 + k * 18, 14, 90 + k * 18, 26, stroke=INK, stroke_width=4)
    a.path("M100,26 C120,70 180,80 220,60", fill="none", stroke=WASH, stroke_width=46, opacity=0.25, stroke_linecap="round")
    a.rect(272, 90, 34, 100, fill=BOARD, stroke=INK, stroke_width=3)
    for k, x in enumerate((200, 236, 268)):
        a.path(kit.person_d(x, 186, 0.62, lean=6), fill=INK)
        a.path(f"M{x - 6},{108 - k * 2} q-6,-6 0,-12 M{x + 2},{104 - k * 2} q-6,-6 0,-12", fill="none", stroke=INK,
               stroke_width=1.6)


# ---- ui -------------------------------------------------------------------------------------------
@asset(G, "airway-note-not-taken", group="ui", title="Airway: margin note, not taken", w=240, h=60,
       row=kit.row(M, "Pencil notes"))
def note_not_taken(a: Art):
    """The words not taken in blue pencil italic with a loose arrow, the note left on a branch he passed.
    In the last panel it fades with the branch."""
    a.text(14, 40, "not taken", size=26, family="sans-serif", fill=NPB, font_style="italic")
    blue(a, "M140,32 C170,20 200,22 226,30 M226,30 l-12,-8 M226,30 l-12,6", 2)
    blue(a, a.wobble_d([(10, 48), (130, 50)], amp=1, step=20), 1.2)
    blue(a, a.wobble_d([(14, 52), (120, 54)], amp=1, step=20), 0.8, 0.5)
    a.circle(8, 34, 1.5, fill=NPB)


@asset(G, "airway-note-hold", group="ui", title="Airway: margin note, HOLD BREATH", w=300, h=60,
       row=kit.row(M, "Pencil notes"))
def note_hold(a: Art):
    """HOLD BREATH lettered in black ink capitals over a blue pencil guideline, the prompt over a grille."""
    blue(a, "M10,44 L290,44", 1.2)
    blue(a, "M10,14 L290,14", 1.2)
    kit.label(a, 150, 40, "HOLD BREATH", size=28, fill=INK, anchor="middle", font_weight="bold", letter_spacing="2")
    a.circle(14, 30, 2, fill=NPB)
    a.circle(286, 30, 2, fill=NPB)

"""Phase 3: the ending-card lettering, the NO CROSSING stamp, and the sock page the strips are gathered on."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, SODIUM, STEEL, FROST, SNOW, BRUISE, RED = (kit.INK, kit.CREAM, kit.SODIUM, kit.STEEL, kit.FROST,
                                                       kit.SNOW, kit.BRUISE, kit.RED)
ROW = "Phase 3: ending lettering, the NO CROSSING stamp, the sock page"
PENCIL = "#3b3a38"

# ---- the ending cards' lettering: a typed label pasted over the generated card ----------------------
LW, LH = 1200, 300
ENDINGS = [
    ("one-set-of-prints", "ONE SET OF PRINTS", "FRAME 112 · CAPTION: NO CROSSING", "carried him"),
    ("the-zoo", "THE ZOO", "DAY 7 · FOLLOW: SEE PREVIOUS", "as written"),
    ("rule-three", "RULE THREE", "DAY 7 · FENCE: PHOTOGRAPHED, NOT FOLLOWED", ""),
    ("call-me-sam", "CALL ME SAM", "DAY 7 · STAY: RETAINED", ""),
    ("transferred", "TRANSFERRED", "DAY 7 · STAY · THE TRUCK SLOWS AT NO TOWN", ""),
]
for _id, _name, _line, _note in ENDINGS:
    def _mk(eid=_id, name=_name, line=_line, note=_note):
        def fn(a: Art):
            a.open("g", transform=f"rotate({f(a.rng.uniform(-1.4, 1.4))} 600 150)")
            d = kit.torn_d(a, 40, 46, 1120, 208, amp=5, step=10)
            a.path(d, fill="#000", opacity=0.35, transform="translate(6,9)", filter=a.blur(5))
            a.path(d, fill="#EEE9DA", stroke="#b9b29c", stroke_width=1)
            cl = a.clip(f'<path d="{d}"/>')
            kit.speckle(a, cl, 0, 0, LW, LH, color="#6f6750", strength=0.18)
            kit.typed(a, 84, 96, "CASE 7-F · SUBJECT: FISK · DISPOSITION", size=22)
            a.line(84, 108, 1116, 108, stroke=INK, stroke_width=2.5)
            size = 92 if len(name) <= 12 else 78
            kit.stencil(a, 84, 196, name, size)
            kit.typed(a, 84, 236, line, size=21)
            if note:
                a.text(1110, 236, note, size=26, family="cursive", fill=PENCIL, text_anchor="end",
                       transform="rotate(-3 1110 236)")
            a.open("g", clip_path=cl)
            kit.frost(a, 1150, 250, 180, 270, 120, n=4, haze=True, op=0.85, budget=110, color="#8f9aa3")
            kit.frost(a, 1151, 251, 180, 270, 120, n=4, haze=True, op=0.85, budget=110)
            a.close()
            a.close()
        fn.__doc__ = (f"Lettering for the ending card {name.title()}: a torn typed label, the case line, the ending's "
                      f"name in army stencil and the Schedule's line for it ({line.lower()}), laid over the generated "
                      "ending card on a transparent ground.")
        return fn
    asset(G, f"ending-title-{_id}", group="endings", title=f"Ending lettering: {_name.title()}", w=LW, h=LH,
          row=ROW)(_mk())


# ---- the NO CROSSING stamp ------------------------------------------------------------------------
SW, SH = 460, 220


@asset(G, "stamp-no-crossing", group="ui", title="Stamp: NO CROSSING", w=SW, h=SH, row=ROW)
def st_no_crossing(a: Art):
    """The NO CROSSING rubber stamp in red, the caption typed under Frame 112: the words in a double box over
    one straight line of prints, every toe pointing the same way, home."""
    a.open("g", transform="rotate(-6 230 110)", filter=kit.ink_filter(a, 0.9, 2.5), opacity=0.92)
    a.rect(30, 34, 400, 152, fill="none", stroke=RED, stroke_width=7)
    a.rect(42, 46, 376, 128, fill="none", stroke=RED, stroke_width=2)
    a.text(230, 110, "NO CROSSING", size=50, family="monospace", fill=RED, font_weight="bold", text_anchor="middle",
           letter_spacing=3)
    for i in range(9):
        kit.footprint(a, 70 + i * 40, 148, math.pi, 24, color=RED, left=i % 2 == 0, opacity=0.95)
    a.close()
    a.open("g", fill=RED, opacity=0.6)
    for _ in range(8):
        a.circle(a.rng.uniform(30, SW - 30), a.rng.uniform(24, SH - 24), a.rng.uniform(0.7, 2.4))
    a.close()


# ---- the sock page: where the strips are gathered ---------------------------------------------------
PW, PH = 760, 1000


@asset(G, "ledger-page", group="documents", title="The sock page: strips gathered", w=PW, h=PH, row=ROW)
def ledger_page(a: Art):
    """The page the torn strips are kept against, in Fisk's pencil: a ruled notebook leaf folded twice to go in
    a sock, a stencilled heading, six numbered rows for days 2 to 7 with where each strip is found, and the
    seventh row, the carry, ruled off with no number because no strip says it."""
    a.paper("#EEE9DA", grain=0.25)
    for y in range(120, PH - 40, 34):
        a.line(40, y, PW - 40, y, stroke=FROST, stroke_width=1, opacity=0.55)
    a.line(96, 40, 96, PH - 30, stroke=RED, stroke_width=1.4, opacity=0.5)
    # the two folds that put it in a sock
    for x in (PW / 3, 2 * PW / 3):
        a.line(x, 0, x, PH, stroke="#000", stroke_width=2, opacity=0.08)
        a.line(x + 2, 0, x + 2, PH, stroke="#fff", stroke_width=2, opacity=0.25)
    kit.stencil(a, 110, 92, "IN MY SOCK", 42)
    rows = [(2, "night 2 · latrine drain"), (3, "night 3 · kennel shed"), (4, "night 4 · Sam's office, carbon"),
            (5, "night 5 · the adit"), (6, "night 6 · the stair"), (7, "day 7 · under the slab")]
    y = 188
    for day, where in rows:
        a.text(70, y, str(day), size=34, family="cursive", fill=PENCIL, text_anchor="middle")
        a.text(116, y, where, size=28, family="cursive", fill=PENCIL)
        a.rect(116, y + 14, 560, 68, fill="none", stroke=PENCIL, stroke_width=1.2, stroke_dasharray="6 6",
               opacity=0.55)
        y += 118
    a.line(116, y - 26, 676, y - 26, stroke=PENCIL, stroke_width=2)
    a.text(116, y + 10, "the carry: on no strip", size=28, family="cursive", fill=PENCIL)
    kit.carbon(a, 60, 60, PW - 120, PH - 120, n=4, op=0.06)
    kit.frost_corners(a, 0.25)
    a.vignette(0.16)

"""Fiche (1D, indexed retrieval on microfiche): scratchboard.

White lines cut from a black ground, and nothing else: forms are modelled by parallel cut strokes, text
is cut in thin capitals, frames sit in an index-card grid. No grey fills, no colour, except the one amber
cell that marks the frame being read (the reader's lamp). The State's documents read RCC."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "fiche"
BK, CUT = "#0a0a0a", "#efeee8"
ROWS = "ABCDEFGHIJKLMN"


def board(a, w, h):
    a.rect(0, 0, w, h, fill=BK)


def cut(a, d, angle=45, spacing=5, sw=1.2, outline=True):
    """Model a shape by cutting parallel white lines inside it, and cut its edge."""
    cid = a.clip(f'<path d="{d}"/>')
    a.hatch(0, 0, a.w, a.h, angle=angle, spacing=spacing, clip=cid, stroke=CUT, stroke_width=sw)
    if outline:
        a.path(d, fill="none", stroke=CUT, stroke_width=sw * 1.6)


def caps(a, x, y, s, size=16, anchor="start", **kw):
    kit.label(a, x, y, s, size=size, family="monospace", fill=CUT, anchor=anchor, letter_spacing=f(size * .12), **kw)


@asset(G, "fiche-sheet", group="documents", title="A sheet of fiche (rows A to N, columns 1 to 12)", w=960, h=680,
       row=kit.row(M, "The sheet and the reader"))
def sheet(a: Art):
    """A sheet of microfiche as scratchboard: a black card with a header strip cut in white capitals (RCC,
    SUBJECT INDEX, SHEET), row letters A to N down the side, column numbers 1 to 12 along the top, and a
    grid of 168 tiny frames, each with a few cut lines of unreadable text."""
    board(a, 960, 680)
    a.rect(10, 10, 940, 660, fill="none", stroke=CUT, stroke_width=2)
    a.rect(10, 10, 940, 56, fill="none", stroke=CUT, stroke_width=2)
    caps(a, 30, 48, "RCC  ·  SUBJECT INDEX", size=22, font_weight="bold")
    caps(a, 930, 48, "SHEET __", size=20, anchor="end")
    x0, y0, cw, ch = 70, 104, 72, 40
    for c in range(12):
        caps(a, x0 + c * cw + cw / 2, 92, str(c + 1), size=14, anchor="middle")
    for r in range(14):
        caps(a, 40, y0 + r * ch + 26, ROWS[r], size=14, anchor="middle")
        for c in range(12):
            x, y = x0 + c * cw, y0 + r * ch
            a.rect(x + 4, y + 4, cw - 8, ch - 8, fill="none", stroke=CUT, stroke_width=1)
            for k in range(3):
                ln = (cw - 20) * (0.5 + 0.5 * ((r * 7 + c * 3 + k * 5) % 9) / 9)
                a.line(x + 10, y + 13 + k * 7, x + 10 + ln, y + 13 + k * 7, stroke=CUT, stroke_width=0.8, opacity=0.8)


@asset(G, "fiche-hood", group="pieces", title="Reader hood (the screen)", w=640, h=500, row=kit.row(M, "The sheet and the reader"))
def hood(a: Art):
    """The fiche reader's hood: a heavy bezel cut in parallel lines, a large black screen with a thin white
    rim and faint scan lines, and a cut nameplate below. The frame is shown in the screen at run time."""
    board(a, 640, 500)
    bezel = "M20,30 Q20,10 40,10 L600,10 Q620,10 620,30 L620,420 Q620,440 600,440 L40,440 Q20,440 20,420Z"
    screen = "M60,46 L580,46 L580,390 L60,390Z"
    cut(a, bezel, angle=80, spacing=6)
    a.path(screen, fill=BK, stroke=CUT, stroke_width=3)
    for y in range(60, 390, 14):
        a.line(70, y, 570, y, stroke=CUT, stroke_width=0.5, opacity=0.25)
    a.rect(220, 452, 200, 36, fill=BK, stroke=CUT, stroke_width=1.5)
    caps(a, 320, 476, "READER 4", size=16, anchor="middle")


@asset(G, "fiche-knob", group="pieces", title="Focus knob", w=160, h=160, row=kit.row(M, "Controls"))
def knob(a: Art):
    """The focus knob seen face-on: a disc whose knurled rim is cut as radial white ticks, a pointer line
    across its face and FOCUS cut small beneath."""
    board(a, 160, 160)
    a.circle(80, 72, 56, fill=BK, stroke=CUT, stroke_width=2)
    for k in range(48):
        t = 2 * math.pi * k / 48
        a.line(80 + 48 * math.cos(t), 72 + 48 * math.sin(t), 80 + 56 * math.cos(t), 72 + 56 * math.sin(t),
               stroke=CUT, stroke_width=1.2)
    cut(a, "M44,72 a36,36 0 1,0 72,0 a36,36 0 1,0 -72,0Z", angle=30, spacing=5, sw=1)
    a.line(80, 72, 80, 32, stroke=CUT, stroke_width=4)
    caps(a, 80, 150, "FOCUS", size=14, anchor="middle")


@asset(G, "fiche-tray", group="pieces", title="Carrier tray (sheet, row, column)", w=640, h=180, row=kit.row(M, "Controls"))
def tray(a: Art):
    """The carrier tray the sheet slides in: a long plate cut in fine lines, with three engraved scales
    labelled SHEET, ROW (A to N) and COL (1 to 12) and a pointer on each."""
    board(a, 640, 180)
    cut(a, "M10,20 L630,20 L630,160 L10,160Z", angle=0, spacing=7, sw=0.8)
    for i, (lbl, n, marks) in enumerate((("SHEET", 6, None), ("ROW", 14, ROWS), ("COL", 12, None))):
        x0 = 30 + i * 205
        a.rect(x0, 50, 185, 80, fill=BK, stroke=CUT, stroke_width=1.5)
        caps(a, x0 + 8, 72, lbl, size=14, font_weight="bold")
        for k in range(n):
            x = x0 + 12 + k * (160 / max(1, n - 1))
            a.line(x, 104, x, 116 if k % 2 == 0 else 110, stroke=CUT, stroke_width=1)
            if marks and k % 3 == 0:
                caps(a, x, 98, marks[k], size=10, anchor="middle")
        a.poly([(x0 + 92, 118), (x0 + 86, 128), (x0 + 98, 128)], fill=CUT)


@asset(G, "fiche-lamp", group="pieces", title="Reader lamp (failing)", w=120, h=160, row=kit.row(M, "Controls"))
def lamp(a: Art):
    """The reader's lamp bulb cut in white lines on black, its filament drawn broken: six minutes and it
    fails, and the hum calls him on."""
    board(a, 120, 160)
    cut(a, "M60,14 C92,14 104,44 96,70 C90,88 78,96 78,112 L42,112 C42,96 30,88 24,70 C16,44 28,14 60,14Z",
        angle=70, spacing=6)
    a.path("M46,104 L50,64 L58,80 M66,72 L70,64 L74,104", fill="none", stroke=CUT, stroke_width=2)
    for y in (116, 126, 136):
        a.rect(42, y, 36, 6, fill=BK, stroke=CUT, stroke_width=1.2)


def card(a, w, h, title):
    board(a, w, h)
    a.rect(8, 8, w - 16, h - 16, fill="none", stroke=CUT, stroke_width=2)
    a.line(8, 52, w - 8, 52, stroke=CUT, stroke_width=1.5)
    caps(a, 22, 38, title, size=18, font_weight="bold")
    for k in range(6):
        a.circle(w - 30 - k * 12, 30, 2, fill=CUT)


@asset(G, "fiche-index-card", group="documents", title="Index card (a frame of its own)", w=480, h=320,
       row=kit.row(M, "Frames and cards"))
def index_card(a: Art):
    """The index card, itself a frame, as scratchboard: columns for SUBJECT, SHEET, ROW, COL and MARKS cut
    as headings over ruled lines; entries are written in at run time."""
    card(a, 480, 320, "INDEX")
    for x, t in ((22, "SUBJECT"), (176, "SHEET"), (250, "ROW"), (306, "COL"), (360, "MARKS")):
        caps(a, x, 76, t, size=13)
        if x > 22:
            a.line(x - 10, 60, x - 10, 300, stroke=CUT, stroke_width=0.8)
    for k in range(8):
        a.line(16, 92 + k * 26, 464, 92 + k * 26, stroke=CUT, stroke_width=0.6, opacity=0.6)


FIELDS = ("NAME", "NO.", "INTAKE", "DISTINGUISHING MARKS")


def frame(a, values=None):
    card(a, 480, 320, "RCC  ·  SUBJECT RECORD")
    for k, fl in enumerate(FIELDS):
        y = 92 + k * 52
        caps(a, 22, y, fl, size=13)
        a.line(22, y + 26, 458, y + 26, stroke=CUT, stroke_width=0.8)
        if values and values[k]:
            caps(a, 470 - 12, y + 20, values[k], size=20 if len(values[k]) < 24 else 16, anchor="end", font_weight="bold")


@asset(G, "fiche-frame-blank", group="documents", title="Subject frame (blank)", w=480, h=320, row=kit.row(M, "Frames and cards"))
def frame_blank(a: Art):
    """A subject frame as it fills the reader's hood, blank: an RCC subject record with four cut fields,
    NAME, NO., INTAKE and DISTINGUISHING MARKS. The page writes each child's line in at run time."""
    frame(a)


@asset(G, "fiche-frame-cmxcix", group="documents", title="Subject frame: CMXCIX (his own file)", w=480, h=320,
       row=kit.row(M, "Frames and cards"))
def frame_cmxcix(a: Art):
    """His own file: the subject record with BALKLIN, ALEXANDER cut into the name field, CMXCIX in the
    number field and 999 OF 1,000 beside it, the intake year, and the marks field left empty."""
    frame(a, ("BALKLIN, ALEXANDER", "CMXCIX  (999 OF 1,000)", "2207", ""))
    a.rect(330, 250, 128, 36, fill="none", stroke=CUT, stroke_width=2, transform="rotate(-6 394 268)")
    caps(a, 394, 274, "SURVIVOR", size=16, anchor="middle", font_weight="bold", transform="rotate(-6 394 268)")


@asset(G, "fiche-frame-biosynth", group="documents", title="Cross-reference frame: BIOSYNTH, SEE CORRIDOR C",
       w=480, h=320, row=kit.row(M, "Frames and cards"))
def frame_biosynth(a: Art):
    """The frame at the end of the cross-reference chain: a record headed BIOSYNTH with most of its lines
    cut through, and one line left standing, SEE CORRIDOR C, with an arrow cut beside it."""
    card(a, 480, 320, "RCC  ·  BIOSYNTH")
    for k in range(5):
        y = 88 + k * 30
        a.line(22, y, 22 + 300 + (k * 41) % 120, y, stroke=CUT, stroke_width=6)
        a.line(22, y, 22 + 300 + (k * 41) % 120, y, stroke=BK, stroke_width=3)
    caps(a, 22, 270, "SEE CORRIDOR C", size=28, font_weight="bold")
    a.path("M370,262 L440,262 M426,250 L442,262 L426,274", fill="none", stroke=CUT, stroke_width=3)


@asset(G, "fiche-see", group="pieces", title="Cross-reference mark: SEE", w=200, h=80, row=kit.row(M, "Frames and cards"))
def see(a: Art):
    """The SEE mark that points one frame to another: the word cut in a box with an arrow, for the margin
    of a frame that cross-references."""
    board(a, 200, 80)
    a.rect(8, 12, 110, 56, fill="none", stroke=CUT, stroke_width=2)
    caps(a, 63, 50, "SEE", size=26, anchor="middle", font_weight="bold")
    a.path("M128,40 L186,40 M170,28 L188,40 L170,52", fill="none", stroke=CUT, stroke_width=3)
    for k in range(4):
        a.line(14, 18 + k * 12, 22, 18 + k * 12, stroke=CUT, stroke_width=1)


def mark(key, title, doc, fn):
    def draw(a: Art):
        board(a, 240, 240)
        a.rect(8, 8, 224, 224, fill="none", stroke=CUT, stroke_width=1.5)
        fn(a)
    draw.__doc__ = doc
    asset(G, f"fiche-mark-{key}", group="cards", title=title, w=240, h=240,
          row=kit.row(M, "Distinguishing marks (the river children)"))(draw)


def _wheel(a):
    for cx in (70, 170):
        a.circle(cx, 150, 40, fill="none", stroke=CUT, stroke_width=3)
        for k in range(8):
            t = k * math.pi / 4
            a.line(cx, 150, cx + 38 * math.cos(t), 150 + 38 * math.sin(t), stroke=CUT, stroke_width=1)
    a.circle(196, 184, 12, fill="none", stroke=CUT, stroke_width=2.5)       # the one training wheel left on
    a.path("M70,150 L110,100 L170,150 M110,100 L150,100 L170,150 M110,100 L104,84 L120,84 M150,100 L158,76 L176,76",
           fill="none", stroke=CUT, stroke_width=3)
    a.line(170, 150, 196, 184, stroke=CUT, stroke_width=2)


def _chalk(a):
    a.rect(8, 150, 224, 30, fill="none", stroke=CUT, stroke_width=1.5)
    cut(a, "M8,180 L232,180 L232,232 L8,232Z", angle=0, spacing=6, sw=0.8, outline=False)
    for k, n in enumerate(("9", "8", "7", "6")):
        caps(a, 40 + k * 52, 132, n, size=56 if k < 3 else 44, anchor="middle", opacity=1 - k * 0.12)
        if k < 3:
            a.line(22 + k * 52, 100, 58 + k * 52, 140, stroke=CUT, stroke_width=2)


def _scabs(a):
    for cx in (78, 162):
        cut(a, f"M{cx - 34},40 L{cx + 34},40 L{cx + 36},84 L{cx - 36},84Z", angle=0, spacing=4, sw=1)   # shorts hem
        a.path(f"M{cx - 28},84 L{cx - 30},140 C{cx - 30},160 {cx - 26},172 {cx - 24},196 L{cx - 22},216 "
               f"M{cx + 28},84 L{cx + 30},140 C{cx + 30},160 {cx + 26},172 {cx + 24},196 L{cx + 22},216",
               fill="none", stroke=CUT, stroke_width=2.5)
        a.path(f"M{cx - 18},140 Q{cx},128 {cx + 18},140", fill="none", stroke=CUT, stroke_width=1.5)   # the kneecap
        cut(a, f"M{cx - 9},150 C{cx - 6},142 {cx + 8},143 {cx + 10},151 C{cx + 6},159 {cx - 7},159 {cx - 9},150Z",
            angle=20, spacing=3, sw=1)
        cut(a, f"M{cx - 24},206 L{cx + 24},206 L{cx + 22},228 L{cx - 22},228Z", angle=90, spacing=4, sw=1)   # socks


def _minnows(a):
    a.rect(8, 190, 224, 16, fill="none", stroke=CUT, stroke_width=2)        # the sill
    jar = "M80,70 L160,70 L164,90 C176,100 176,180 166,188 L74,188 C64,180 64,100 76,90Z"
    a.path(jar, fill="none", stroke=CUT, stroke_width=2.5)
    a.rect(76, 56, 88, 16, fill="none", stroke=CUT, stroke_width=2)
    for y in range(110, 186, 8):
        a.line(78, y, 162, y, stroke=CUT, stroke_width=0.6, opacity=0.6)
    for x, y, s in ((100, 130, 1), (136, 150, -1), (110, 166, 1)):
        a.path(f"M{x},{y} q{10 * s},-6 {20 * s},0 q{-10 * s},6 {-20 * s},0 M{x},{y} l{-6 * s},-5 l0,10Z", fill=BK,
               stroke=CUT, stroke_width=1.6)


mark("wheel", "Mark: a training wheel left on (Dale)", "A two-wheeler cut in white lines with one small training wheel "
     "still bolted on the back, the line under Dale's distinguishing marks.", _wheel)
mark("chalk", "Mark: chalk numbers on the kerb (June)", "Chalk numbers on a kerb counting down, 9, 8, 7, 6, the "
     "earlier ones crossed through: June's countdown to her birthday, cut white on black.", _chalk)
mark("scabs", "Mark: matching scabs (Mira and Pell Ostrowski)", "Two knees side by side, each with the same small "
     "scab in the same place, from the same fall: the twins' shared mark, drawn without injury beyond that.", _scabs)
mark("minnows", "Mark: a jar of minnows on a windowsill (Hollis)", "A jar of river water on a windowsill with three "
     "small minnows in it, cut in white lines: Hollis's jar.", _minnows)

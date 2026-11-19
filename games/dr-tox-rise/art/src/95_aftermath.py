"""Aftermath (1D, reconstruction): manga screentone, evidence tents.

Clean black line, flat white, and grey made only of dot screens at set densities (light, mid, dark),
the way a manga page lays tone. No gradients, no colour. Numbered evidence tents stand beside each trace.
The room is shown after: traces, never a body, never an act; the silhouettes are shapes only."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "aftermath"
LN, WH = "#111111", "#ffffff"
L = dict(stroke=LN, stroke_width=3, stroke_linejoin="round")


def tone(a, d, level, cell=7):
    """Lay a flat dot screen inside path d. level: 0.25 light, 0.5 mid, 0.8 dark. A screen is an SVG
    pattern of one dot per cell at 45 degrees, as a sheet of screentone is."""
    key = (round(level, 2), cell)
    cache = a.__dict__.setdefault("_tones", {})
    if key not in cache:
        pid = a.uid("tone")
        r = level * cell * 0.62
        a.defn(f'<pattern id="{pid}" width="{cell}" height="{cell}" patternUnits="userSpaceOnUse" '
               f'patternTransform="rotate(45)"><circle cx="{f(cell / 2)}" cy="{f(cell / 2)}" r="{f(r)}" fill="{LN}"/></pattern>')
        cache[key] = pid
    a.path(d, fill=f"url(#{cache[key]})")


def rect_d(x, y, w, h):
    return f"M{f(x)},{f(y)} L{f(x + w)},{f(y)} L{f(x + w)},{f(y + h)} L{f(x)},{f(y + h)}Z"


@asset(G, "aftermath-depot-post", group="backdrops", title="Aftermath room: the depot guard post", w=1280, h=640,
       row=kit.row(M, "The room after (one per Aftermath)"))
def depot_post(a: Art):
    """The depot guard post after, wide and still, in screentone: a desk shoved askew, a chair on its
    side, a wall clock, a strip light hanging dead from one chain, a dented locker, a torn strap on the
    floor, and a long scrape running to the door he dragged himself through. No one is in the room."""
    a.rect(0, 0, 1280, 640, fill=WH)
    tone(a, rect_d(0, 0, 1280, 440), 0.32, cell=8)
    tone(a, rect_d(0, 440, 1280, 200), 0.55, cell=8)
    a.line(0, 440, 1280, 440, **L)
    a.rect(1060, 150, 140, 290, fill=WH, **L)                          # the door, ajar
    tone(a, "M1080,170 L1180,170 L1180,440 L1080,440Z", 0.85, cell=6)
    a.path("M1060,440 C900,470 700,500 420,520", fill="none", stroke=WH, stroke_width=10)   # the long scrape
    a.path("M1060,440 C900,470 700,500 420,520", fill="none", stroke=LN, stroke_width=2, stroke_dasharray="18 10")
    a.rect(180, 120, 110, 300, fill=WH, **L)                            # the locker, dented
    a.path("M210,220 Q236,250 214,280", fill="none", **L)
    tone(a, "M200,210 Q246,250 206,290 L196,250Z", 0.7, cell=5)
    a.circle(620, 110, 40, fill=WH, **L)                                # the clock, stopped
    a.line(620, 110, 620, 82, **L)
    a.line(620, 110, 646, 120, **L)
    a.path("M520,30 L520,80 M760,30 L760,60", fill="none", **L)          # the light, one chain gone
    a.path("M520,80 L760,60 L762,76 L522,96Z", fill=WH, **L)
    a.path("M380,420 L640,400 L660,470 L400,500Z", fill=WH, **L)        # desk askew
    a.path("M800,520 l60,-50 l40,10 l-20,30 l40,40", fill="none", stroke=LN, stroke_width=4)   # chair on its side
    a.circle(812, 560, 10, fill=WH, **L)
    a.path("M300,560 C330,548 360,570 400,556", fill="none", stroke=LN, stroke_width=5)    # torn strap
    a.path("M400,556 l8,-6 m-8,6 l9,4", fill="none", stroke=LN, stroke_width=2)
    for x, y in ((700, 560), (720, 572), (690, 584)):
        a.path(f"M{x},{y} l10,-4 l6,8 l-12,4Z", fill=LN)                # lacquered flakes


@asset(G, "aftermath-archive", group="backdrops", title="Aftermath room: the archive (Green ending)", w=1280, h=640,
       row=kit.row(M, "The room after (one per Aftermath)"))
def archive(a: Art):
    """The Snakehead archive after, wider and emptier, in screentone: rows of fiche cabinets receding, a
    stair rail bent outward, a doorway etched pale at its edges, a dropped torch on the floor, and a great
    deal of empty dark-toned floor where the tents will stand. No one is in the room."""
    a.rect(0, 0, 1280, 640, fill=WH)
    tone(a, rect_d(0, 0, 1280, 400), 0.45, cell=8)
    tone(a, rect_d(0, 400, 1280, 240), 0.7, cell=8)
    a.line(0, 400, 1280, 400, **L)
    for k in range(6):                                                  # cabinets receding
        x, h = 80 + k * 110, 260 - k * 26
        a.rect(x, 400 - h, 90, h, fill=WH, **L)
        for y in range(int(400 - h + 20), 400, 34):
            a.line(x + 10, y, x + 80, y, stroke=LN, stroke_width=1.5)
    a.path("M900,400 L900,180 L1040,180 L1040,400", fill=WH, **L)       # doorway, edges etched pale
    tone(a, "M916,196 L1024,196 L1024,400 L916,400Z", 0.9, cell=6)
    for y in range(190, 400, 18):
        a.line(896, y, 906 + (y * 7) % 12, y + 4, stroke=WH, stroke_width=3)
    a.path("M1120,400 L1140,260 C1160,240 1200,250 1210,280 L1230,400", fill="none", stroke=LN, stroke_width=5)  # rail bent
    a.path("M600,560 l60,-10 l4,14 l-60,10Z", fill=WH, **L)             # the dropped torch
    a.path("M664,552 l40,-24 l0,48Z", fill=WH, stroke=LN, stroke_width=1.5, opacity=0.8)


# ---- tents, numbered ---------------------------------------------------------------------------
def tent_asset(n):
    def draw(a: Art):
        a.path("M10,110 L22,104 L118,104 L130,110Z", fill=LN, opacity=0.25)
        a.path(kit.tent_d(70, 106, 1.7), fill=WH, **L)
        a.path("M29,106 L46,18 L94,18 L111,106", fill="none", stroke=LN, stroke_width=1.5)
        tone(a, "M94,18 L111,106 L119,106 L102,18Z", 0.6, cell=4)
        a.rect(44, 40, 52, 46, fill=LN)
        kit.label(a, 70, 78, str(n), size=40, anchor="middle", fill=WH, font_weight="bold")
    draw.__doc__ = f"Evidence tent number {n}: a white folded A-frame card in clean line, its number in white on a black panel."
    asset(G, f"aftermath-tent-{n}", group="pieces", title=f"Evidence tent {n}", w=140, h=120,
          row=kit.row(M, "Evidence tents 1 to 9"))(draw)


for _n in range(1, 10):
    tent_asset(_n)


# ---- trace cards -------------------------------------------------------------------------------
def trace(key, title, clue, doc, fn, false=False):
    def draw(a: Art):
        a.rect(0, 0, 320, 420, fill=WH)
        a.rect(8, 8, 304, 404, fill=WH, **L)
        a.rect(20, 20, 280, 240, fill=WH, **L)
        a.open("g", clip_path=a.clip('<rect x="20" y="20" width="280" height="240"/>'))
        fn(a)
        a.close()
        kit.label(a, 22, 294, title.upper(), size=20, fill=LN, font_weight="bold", letter_spacing="1",
                  fit=276 if len(title) * 20 * .64 > 276 else None)
        a.line(22, 306, 298, 306, stroke=LN, stroke_width=1.5)
        words, lines, cur = clue.split(), [], ""
        for w_ in words:
            if len(cur) + len(w_) + 1 > 30:
                lines.append(cur)
                cur = w_
            else:
                cur = (cur + " " + w_).strip()
        lines.append(cur)
        for k, ln in enumerate(lines[:3]):
            kit.label(a, 22, 334 + k * 24, ln, size=17, family="serif", fill=LN)
    draw.__doc__ = doc
    asset(G, f"aftermath-trace-{key}", group="cards", title=f"Trace: {title}", w=320, h=420,
          row=kit.row(M, "Trace cards (what it is, a clue to when)"))(draw)


def _clock(a):
    tone(a, rect_d(20, 20, 280, 240), 0.3)
    a.circle(160, 140, 80, fill=WH, **L)
    for k in range(12):
        t = k * math.pi / 6
        a.line(160 + 68 * math.cos(t), 140 + 68 * math.sin(t), 160 + 76 * math.cos(t), 140 + 76 * math.sin(t), **L)
    a.line(160, 140, 160, 84, stroke=LN, stroke_width=4)
    a.line(160, 140, 206, 156, stroke=LN, stroke_width=4)
    a.path("M120,80 L200,200", fill="none", stroke=LN, stroke_width=2)


def _plate(a):
    tone(a, rect_d(20, 20, 280, 240), 0.5)
    for x, y, s in ((110, 120, 1.4), (190, 150, 1.0), (150, 200, 0.8), (220, 100, 0.7)):
        a.path(f"M{x},{y} l{30 * s},{-14 * s} l{24 * s},{20 * s} l{-10 * s},{26 * s} l{-36 * s},{4 * s}Z", fill=LN,
               stroke=WH, stroke_width=1.5)
        a.line(x + 10 * s, y + 4 * s, x + 30 * s, y - 4 * s, stroke=WH, stroke_width=1.2)


def _light(a):
    tone(a, rect_d(20, 20, 280, 240), 0.65)
    a.path("M60,20 L60,90 M260,20 L260,40", fill="none", **L)
    a.path("M60,90 L260,40 L262,58 L62,108Z", fill=WH, **L)
    for x in (120, 180, 230):
        a.path(f"M{x},{180 + (x % 3) * 14} l10,-6 l8,10 l-14,6Z", fill=WH, **L)


def _strap(a):
    tone(a, rect_d(20, 20, 280, 240), 0.35)
    a.path("M40,170 C100,140 160,190 220,150", fill="none", stroke=LN, stroke_width=16)
    a.path("M40,170 C100,140 160,190 220,150", fill="none", stroke=WH, stroke_width=10)
    a.rect(70, 150, 26, 20, fill=WH, **L)
    a.path("M220,150 l16,-14 m-16,14 l20,-2 m-20,2 l14,10", fill="none", stroke=LN, stroke_width=2.5)


def _dent(a):
    a.rect(20, 20, 280, 240, fill=WH)
    a.rect(60, 20, 200, 240, fill=WH, **L)
    a.path("M120,80 Q190,140 130,200", fill="none", stroke=LN, stroke_width=4)
    tone(a, "M110,70 Q206,140 120,210 L100,140Z", 0.7, cell=5)
    a.line(160, 20, 160, 70, stroke=LN, stroke_width=1.5)


def _scrape(a):
    tone(a, rect_d(20, 20, 280, 240), 0.55)
    a.path("M20,200 C120,180 200,150 300,90", fill="none", stroke=WH, stroke_width=14)
    a.path("M20,200 C120,180 200,150 300,90", fill="none", stroke=LN, stroke_width=2, stroke_dasharray="14 8")
    a.rect(250, 20, 50, 120, fill=WH, **L)


def _torch(a):
    tone(a, rect_d(20, 20, 280, 240), 0.45)
    a.path("M80,170 l120,-30 l8,28 l-120,30Z", fill=WH, **L)
    a.path("M208,140 l60,-30 l12,70Z", fill=WH, stroke=LN, stroke_width=1.5)
    a.rect(100, 170, 30, 10, fill=LN, transform="rotate(-14 115 175)")


def _etch(a):
    a.rect(20, 20, 280, 240, fill=WH)
    a.path("M100,20 L100,260 M220,20 L220,260", fill="none", **L)
    tone(a, "M60,20 L100,20 L100,260 L60,260Z", 0.5)
    for y in range(40, 260, 22):
        a.path(f"M100,{y} q14,6 6,16", fill="none", stroke=LN, stroke_width=1.5)
        a.circle(112 + (y % 3) * 4, y + 10, 3, fill=WH, **L)


trace("clock", "Wall clock, stopped", "Stopped at the moment of a blow to the wall. The first thing.",
      "Trace card: a wall clock stopped, glass cracked, its hands fixed; the clue says it marks the first thing that "
      "happened.", _clock)
trace("plate", "Lacquered flakes", "Black plate, set hard. Shed early, long dry.",
      "Trace card: flakes of lacquered black plate on the floor in screentone, set hard: shed early.", _plate)
trace("light", "Strip light, failed", "Pulled down on one chain. Glass fell on the strap.",
      "Trace card: a strip light hanging from one chain over broken glass; the clue ties it to the strap below.", _light)
trace("strap", "Torn strap", "Torn before the dent: no glass under it.",
      "Trace card: a suit strap torn through, its buckle still closed: torn before the locker was struck.", _strap)
trace("dent", "Locker, dented", "Struck from inside the room, after the light.",
      "Trace card: a locker door dented inward in screentone, struck after the light failed.", _dent)
trace("scrape", "Long scrape to the door", "Last. It ends at the door the guard went out by.",
      "Trace card: a long scrape across the floor ending at the door: the last trace, made by the guard who lived.",
      _scrape)
trace("torch", "Dropped torch", "Guard issue. The switch is still on.",
      "Trace card for a false trace: a guard's torch dropped on the floor, its beam lying along the ground. It "
      "must be set aside; the card does not say so.", _torch, false=True)
trace("etch", "Etched doorway", "Pitted at the edges, as if eaten.",
      "Trace card for a false trace: a doorway whose edges are etched and pitted by acid, the Cauldron's work, not "
      "his. It must be set aside; the card does not say so.", _etch, false=True)


# ---- silhouette panels -------------------------------------------------------------------------
SHAPES = (
    ("one", "Shape I: shoulders too high", [(80, 280), (90, 200), (60, 150), (70, 70), (110, 40), (130, 70), (150, 30),
                                            (190, 40), (210, 80), (200, 160), (170, 200), (180, 280)]),
    ("two", "Shape II: a joint too many", [(70, 280), (90, 230), (60, 190), (100, 150), (80, 100), (120, 60), (160, 64),
                                           (190, 110), (170, 150), (210, 190), (180, 230), (200, 280)]),
    ("three", "Shape III: low and long", [(30, 280), (40, 230), (80, 200), (130, 190), (190, 170), (240, 150),
                                          (250, 180), (220, 210), (230, 280)]),
)


def shape_asset(key, title, pts):
    def draw(a: Art):
        a.rect(0, 0, 280, 320, fill=WH)
        tone(a, rect_d(10, 10, 260, 300), 0.25, cell=7)
        a.path(kit.P(pts, True), fill=LN, stroke=LN, stroke_width=4, stroke_linejoin="round")
        a.rect(10, 10, 260, 300, fill="none", stroke=LN, stroke_width=4)
        for k in range(5):
            a.line(240 - k * 10, 296, 260, 276 - k * 10, stroke=LN, stroke_width=1)
    draw.__doc__ = (f"A silhouette panel revealed by a correct pair of tents, {title.split(': ')[1]}: the form the "
                    f"State took, as a flat black shape on a light screen. A shape only, never the act; never "
                    f"the same shape twice.")
    asset(G, f"aftermath-shape-{key}", group="figures", title=title, w=280, h=320,
          row=kit.row(M, "Silhouette panels (shapes only)"))(draw)


for _s in SHAPES:
    shape_asset(*_s)


@asset(G, "aftermath-shape-blank", group="figures", title="Silhouette panel, unrevealed", w=280, h=320,
       row=kit.row(M, "Silhouette panels (shapes only)"))
def shape_blank(a: Art):
    """An unrevealed silhouette panel: a light dot screen in a frame with nothing on it, and a small
    question in the corner. In an unreconstructed record it stays like this."""
    a.rect(0, 0, 280, 320, fill=WH)
    tone(a, rect_d(10, 10, 260, 300), 0.25, cell=7)
    a.rect(10, 10, 260, 300, fill="none", stroke=LN, stroke_width=4)
    a.rect(30, 30, 30, 30, fill=WH, **L)
    kit.label(a, 45, 54, "?", size=24, anchor="middle", fill=LN, font_weight="bold")


@asset(G, "aftermath-slot", group="pieces", title="Ordering strip slot", w=160, h=150, row=kit.row(M, "The ordering strip"))
def slot(a: Art):
    """One slot in the ordering strip at the bottom of the page: a dashed outline the size of a tent with a
    small order number above it, and a pale screen floor."""
    tone(a, rect_d(10, 30, 140, 110), 0.15, cell=6)
    a.rect(10, 30, 140, 110, fill="none", stroke=LN, stroke_width=2.5, stroke_dasharray="10 6")
    a.circle(80, 16, 12, fill=LN)
    a.line(30, 128, 130, 128, stroke=LN, stroke_width=1)


@asset(G, "aftermath-set-aside", group="pieces", title="Set-aside tray (not his)", w=320, h=160,
       row=kit.row(M, "The ordering strip"))
def set_aside(a: Art):
    """The tray where a trace that is not his is set aside: a shallow box in clean line, a mid screen
    inside, and NOT HIS lettered on its front."""
    a.path("M20,40 L300,40 L280,150 L40,150Z", fill=WH, **L)
    tone(a, "M36,52 L284,52 L268,138 L52,138Z", 0.4, cell=6)
    a.rect(100, 112, 120, 30, fill=WH, **L)
    kit.label(a, 160, 134, "NOT HIS", size=18, anchor="middle", fill=LN, font_weight="bold", letter_spacing="2")

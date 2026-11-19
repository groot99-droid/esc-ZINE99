"""The Window (1D, timetable): fumetti photo-comic.

Posed photographs in grey tone (soft gradients, blur for distance, a coarse print grain), white photo
borders, typed captions pasted on in monospace, and the guard rota typed on paper in the margin. No
colour but one grease-pencil red for the player's marks. Night surveillance: no faces."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "window"
PAPER, TYPE = "#f2f0ea", "#1d1d1b"
PEN = "#b3261e"
W, H = 480, 360


def photo(a, scene, time):
    """A photo panel: white border, a grey-tone scene, print grain, and a pasted typed time caption."""
    a.rect(0, 0, W, H, fill="#ffffff")
    a.open("g", clip_path=a.clip(f'<rect x="14" y="14" width="{W - 28}" height="{H - 28}"/>'))
    a.rect(14, 14, W - 28, H - 28, fill=a.gradient([(0, "#1b1d1d"), (0.6, "#3a3e3e"), (1, "#575c5b")]))
    scene(a)
    gid = a.uid("grain")
    a.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="1.4" numOctaves="1" seed="{a.seed % 997}"/><feColorMatrix type="saturate" values="0"/>'
           f'<feComponentTransfer><feFuncA type="linear" slope="0.22"/></feComponentTransfer></filter>')
    a.rect(14, 14, W - 28, H - 28, filter=f"url(#{gid})")
    a.rect(14, 14, W - 28, H - 28, fill=a.radial([(0.55, "#000", 0), (1, "#000", 0.45)], r=0.75))
    a.close()
    a.rect(14, 14, W - 28, H - 28, fill="none", stroke="#d8d6d0", stroke_width=1)
    a.rect(24, 24, 104, 34, fill=PAPER, stroke=TYPE, stroke_width=1.5)
    kit.label(a, 76, 48, time, size=20, family="monospace", fill=TYPE, anchor="middle", font_weight="bold")


def lamp(a, x, y, r=120):
    a.circle(x, y, r, fill=a.radial([(0, "#e8e8e2", 0.85), (0.3, "#c9cac5", 0.35), (1, "#c9cac5", 0)]))
    a.circle(x, y, 6, fill="#ffffff")


def walker(a, x, y, s, blur=0.0):
    a.path(kit.person_d(x, y, s, broad=1.2), fill="#0b0c0c", filter=a.blur(blur) if blur else None)


def fence(a, y0=150, y1=290):
    a.rect(14, y0, W - 28, y1 - y0, fill="#2a2d2d", opacity=0.35)
    a.hatch(14, y0, W - 28, y1 - y0, angle=45, spacing=14, stroke="#8a8f8d", stroke_width=1.2,
            clip=a.clip(f'<rect x="14" y="{y0}" width="{W - 28}" height="{y1 - y0}"/>'), opacity=0.7)
    a.hatch(14, y0, W - 28, y1 - y0, angle=-45, spacing=14, stroke="#8a8f8d", stroke_width=1.2,
            clip=a.clip(f'<rect x="14" y="{y0}" width="{W - 28}" height="{y1 - y0}"/>'), opacity=0.7)
    for x in range(30, W, 110):
        a.rect(x, y0 - 10, 6, y1 - y0 + 10, fill="#6a6f6d")


def s_fence(a):
    a.rect(14, 240, W - 28, 106, fill="#2e3131")
    lamp(a, 380, 70)
    walker(a, 330, 236, 0.5, blur=1.2)
    fence(a)
    a.rect(220, 150, 70, 140, fill="#1b1d1d", opacity=0.6)


def s_yard(a):
    a.rect(14, 220, W - 28, 126, fill="#3a3d3d")
    lamp(a, 90, 60, 150)
    a.rect(220, 160, 200, 90, rx=8, fill="#151717", filter=a.blur(0.8))
    a.rect(236, 172, 60, 30, fill="#4a4e4d")
    for x in (250, 390):
        a.circle(x, 252, 16, fill="#0b0c0c")
    walker(a, 140, 300, 0.95, blur=0.4)
    a.ellipse(140, 302, 50, 8, fill="#000", opacity=0.4)


def s_door(a):
    a.rect(14, 14, W - 28, H - 28, fill="#4a4e4d")
    a.rect(150, 70, 140, 240, fill="#1b1d1d")
    a.rect(162, 82, 116, 216, fill="#2a2d2d")
    a.circle(262, 196, 5, fill="#8a8f8d")
    lamp(a, 220, 50, 90)
    for k in range(6):
        a.rect(320 + k * 22, 300 - k * 34, 140, 10, fill="#2a2d2d")
    a.rect(14, 310, W - 28, 36, fill="#2e3131")


def s_bay(a):
    a.rect(14, 14, W - 28, H - 28, fill="#3a3d3d")
    a.rect(60, 70, 300, 220, fill="#262828")
    for y in range(80, 290, 16):
        a.line(60, y, 360, y, stroke="#4a4e4d", stroke_width=2)
    lamp(a, 420, 60)
    a.rect(14, 290, W - 28, 56, fill="#2a2d2d")
    walker(a, 400, 300, 0.7, blur=0.8)


def s_hut(a):
    a.rect(14, 14, W - 28, H - 28, fill="#353838")
    a.rect(220, 90, 220, 200, fill="#262828")
    a.rect(250, 120, 90, 60, fill="#8a8f8d")
    lamp(a, 300, 150, 80)
    a.rect(14, 290, W - 28, 56, fill="#2a2d2d")
    a.ellipse(170, 306, 34, 10, fill="#9a9e9c")          # the water bowl
    a.ellipse(170, 302, 30, 7, fill="#5a5e5d")
    a.path("M200,190 q0,20 14,20 q14,0 14,-20", fill="none", stroke="#b8bcba", stroke_width=4)   # leash hook
    a.rect(206, 180, 16, 10, fill="#b8bcba")


def s_freezer(a):
    a.rect(14, 14, W - 28, H - 28, fill="#454948")
    a.rect(100, 50, 240, 270, fill="#5a5e5d")
    a.rect(110, 60, 220, 250, fill="#6a6f6d")
    a.rect(296, 150, 18, 70, fill="#2a2d2d")
    a.rect(14, 310, W - 28, 36, fill="#2e3131")
    lamp(a, 60, 40, 100)
    a.rect(380, 120, 70, 190, fill="#1b1d1d")


PHOTOS = (("research-1", s_fence, "02:10", "the perimeter fence and gate under a floodlight, a guard small and soft "
           "with distance on the far side of the wire"),
          ("research-2", s_yard, "02:31", "the yard: a parked van in the floodlight and a guard walking past it, "
           "his shadow on the concrete"),
          ("research-3", s_door, "02:44", "the side door and the outside stair, empty under one lamp"),
          ("depot-1", s_bay, "01:48", "the depot's roller-shutter loading bay, a guard soft at the edge of the light"),
          ("depot-2", s_hut, "02:05", "the guard hut with its window lit, and on the ground outside it a water bowl "
           "and on the wall a leash hook: the dog round that is not on the rota"),
          ("depot-3", s_freezer, "02:22", "the cold-store door and the dark gap of the back stair"))


def photo_asset(key, scene, time, what):
    def draw(a: Art):
        photo(a, scene, time)
    draw.__doc__ = (f"A posed surveillance photo in grey tone with a white border and a typed time caption, "
                    f"{time}: {what}.")
    asset(G, f"window-photo-{key}", group="documents", title=f"Photo panel: {key.replace('-', ' ')} ({time})", w=W, h=H,
          row=kit.row(M, "Photo panels (Window 1: research floor; Window 2: depot)"))(draw)


for _p in PHOTOS:
    photo_asset(*_p)


@asset(G, "window-rota", group="documents", title="Guard rota sheet (blank strip)", w=640, h=440,
       row=kit.row(M, "The rota"))
def rota(a: Art):
    """The guard rota typed on paper for the margin: a heading, four zone rows (FENCE, YARD, DOOR, STAIR)
    and a time strip from 02:00 to 03:00 ruled every five minutes. The guards' bars and the route are laid
    on it at run time."""
    a.rect(0, 0, 640, 440, fill=PAPER)
    a.rect(0, 0, 640, 440, fill="none", stroke="#c9c6bc", stroke_width=2)
    kit.label(a, 24, 40, "ROTA — NIGHT", size=22, family="monospace", fill=TYPE, font_weight="bold")
    kit.label(a, 616, 40, "SHEET 1", size=16, family="monospace", fill=TYPE, anchor="end")
    a.line(24, 54, 616, 54, stroke=TYPE, stroke_width=1.5)
    x0, x1 = 120, 616
    for k in range(13):
        x = x0 + (x1 - x0) * k / 12
        a.line(x, 80, x, 400, stroke="#c9c6bc", stroke_width=1 if k % 3 else 1.6)
        if k % 3 == 0:
            kit.label(a, x, 76, f"02:{k * 5:02d}" if k < 12 else "03:00", size=13, family="monospace", fill=TYPE,
                      anchor="middle" if k < 12 else "end")
    for i, z in enumerate(("FENCE", "YARD", "DOOR", "STAIR")):
        y = 90 + i * 76
        a.line(24, y + 70, 616, y + 70, stroke=TYPE, stroke_width=1)
        kit.label(a, 24, y + 44, z, size=18, family="monospace", fill=TYPE, font_weight="bold")
    kit.label(a, 24, 428, "ROUNDS AS POSTED. NO DEVIATION.", size=13, family="monospace", fill="#5a5850")


@asset(G, "window-guard-bar", group="pieces", title="Rota bar (a guard's round)", w=200, h=48, row=kit.row(M, "The rota"))
def guard_bar(a: Art):
    """One guard's round as a typed-sheet bar: a grey band with diagonal ruling and square ends, stretched to
    the round's length on the strip."""
    a.rect(2, 8, 196, 32, fill="#8a8a85", stroke=TYPE, stroke_width=1.5)
    a.hatch(2, 8, 196, 32, angle=60, spacing=8, stroke=TYPE, stroke_width=1,
            clip=a.clip('<rect x="2" y="8" width="196" height="32"/>'), opacity=0.5)
    a.line(2, 8, 2, 40, stroke=TYPE, stroke_width=3)
    a.line(198, 8, 198, 40, stroke=TYPE, stroke_width=3)


@asset(G, "window-segment", group="pieces", title="Route segment (his)", w=200, h=48, row=kit.row(M, "The rota"))
def segment(a: Art):
    """One segment of his route on the strip: an open outlined bar in black with an arrowhead, drawn the way
    a man marks his own plan in pen over a typed sheet."""
    a.rect(4, 12, 176, 24, fill="#ffffff", stroke=TYPE, stroke_width=2.5)
    a.poly([(180, 6), (198, 24), (180, 42)], fill=TYPE)
    for x in (40, 80, 120, 160):
        a.line(x, 30, x, 36, stroke=TYPE, stroke_width=1.5)


@asset(G, "window-segment-overlap", group="pieces", title="Route segment (overlapping a round)", w=200, h=48,
       row=kit.row(M, "The rota"))
def segment_overlap(a: Art):
    """The same route segment when it overlaps a guard's bar in its zone: the bar ringed and hatched in
    grease-pencil red."""
    a.rect(4, 12, 176, 24, fill="#f2d6d3", stroke=PEN, stroke_width=3)
    a.poly([(180, 6), (198, 24), (180, 42)], fill=PEN)
    a.hatch(4, 12, 176, 24, angle=-50, spacing=10, stroke=PEN, stroke_width=2,
            clip=a.clip('<rect x="4" y="12" width="176" height="24"/>'))


@asset(G, "window-clue-ring", group="pieces", title="Clue ring (tapped in a photo)", w=160, h=120, row=kit.row(M, "Marks"))
def clue_ring(a: Art):
    """A loose grease-pencil ellipse in red, drawn twice round, for a detail the player tapped in a photo
    (the water bowl, the leash hook) to add a hidden round."""
    for k, (rx, ry, rot) in enumerate(((66, 44, -6), (62, 48, 4))):
        a.ellipse(80, 60, rx, ry, fill="none", stroke=PEN, stroke_width=4 - k, opacity=0.9 - k * .25,
                  transform=f"rotate({rot} 80 60)")
    a.line(130, 20, 150, 6, stroke=PEN, stroke_width=3, stroke_linecap="round")
    a.line(134, 26, 156, 18, stroke=PEN, stroke_width=2, stroke_linecap="round")
    a.circle(146, 10, 2, fill=PEN)
    a.circle(152, 16, 1.5, fill=PEN)
    a.circle(14, 100, 1.5, fill=PEN)


@asset(G, "window-caption", group="documents", title="Typed caption strip (blank)", w=960, h=72,
       row=kit.row(M, "Captions"))
def caption(a: Art):
    """The typed caption strip that runs below the photos, pasted on: off-white paper with a hairline
    border and a slightly crooked set, for the typed line the page writes at run time."""
    a.rect(6, 10, 948, 54, fill="#000", opacity=0.18, transform="rotate(-0.4 480 36)")
    a.rect(4, 6, 948, 54, fill=PAPER, stroke=TYPE, stroke_width=1.5, transform="rotate(-0.4 480 36)")
    for x in (12, 940):
        a.rect(x, 2, 18, 8, fill="#d8d2bf", opacity=0.9)
    a.line(20, 48, 60, 48, stroke=TYPE, stroke_width=1, opacity=0.3)
    a.line(900, 48, 940, 48, stroke=TYPE, stroke_width=1, opacity=0.3)


def stamp(key, word, color, doc):
    def draw(a: Art):
        a.open("g", transform="rotate(-6 160 60)")
        a.rect(14, 18, 292, 84, rx=6, fill="none", stroke=color, stroke_width=6)
        a.rect(24, 28, 272, 64, rx=4, fill="none", stroke=color, stroke_width=2)
        kit.label(a, 160, 78, word, size=40, family="monospace", fill=color, anchor="middle", font_weight="bold",
                  letter_spacing="4", fit=240 if len(word) > 8 else None)
        a.close()
        for k in range(14):
            a.circle(a.rng.uniform(20, 300), a.rng.uniform(20, 100), a.rng.uniform(1.5, 4), fill=PAPER)
    draw.__doc__ = doc
    asset(G, f"window-stamp-{key}", group="pieces", title=f"Stamp: {word}", w=320, h=120, row=kit.row(M, "Marks"))(draw)


stamp("clear", "CLEAR", TYPE, "A rubber stamp in black ink, CLEAR, inked unevenly and set at a slant: the start time "
      "confirmed with slack to spare.")
stamp("tight", "TIGHT", PEN, "The same stamp in red, TIGHT: the start time confirmed with no slack, a guard in the "
      "first panel.")

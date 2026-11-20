"""Split Field (1D, reconstruction by attribution): Craftint Doubletone shading board.

Black ink line on white board, with the board's two developed tones, a grey single-line tone and a grey
crosshatch tone, laid in brush-edged patches. No colour and no other tone: no dots, no pen hatching. The
place after the event is drawn wide and still, marks only on objects (a shield's face, a kiosk shutter, a
ladder rail, a barricade, a mast), never a body. The comparison circle shows striations matched across a
hairline; the record names who was hurt and by what, and never shows a wound."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "split-field"
INK, BOARD, TONE = "#141414", "#fbfbf8", "#5a5a5a"
L = dict(stroke=INK, stroke_width=4, stroke_linejoin="round", stroke_linecap="round")


def tone(a, x, y, w, h, angle=45, cross=False, amp=7, spacing=7):
    """A developed Craftint patch: line tone (or crosshatch tone) inside a brush-edged outline."""
    d = a.wobble_d([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], amp=amp, step=26, closed=True)
    cid = a.clip(f'<path d="{d}"/>')
    a.hatch(x - 10, y - 10, w + 20, h + 20, angle=angle, spacing=spacing, clip=cid, stroke=TONE, stroke_width=1.1)
    if cross:
        a.hatch(x - 10, y - 10, w + 20, h + 20, angle=-angle, spacing=spacing, clip=cid, stroke=TONE, stroke_width=1.1)


def mark_badge(a, x, y, n=None, r=18):
    a.circle(x, y, r, fill="#ffffff", stroke=INK, stroke_width=3)
    if n is not None:
        kit.label(a, x, y + r * .42, str(n), size=r * 1.2, fill=INK, anchor="middle", font_weight="bold")


# ---- backdrops -----------------------------------------------------------------------------------
@asset(G, "split-field-station", group="backdrops", title="Split Field: the water station after (Split Field 1)",
       w=1280, h=720, row=kit.row(M, "Boards: the place after"))
def station(a: Art):
    """The RCC water station after the attack, wide and still, in ink line and Craftint tone: the tower on
    four legs with RCC on the tank, its ladder, the dispensing kiosk with its shutter half down and a price
    board, a barricade of crates, two riot shields lying flat, jerricans on their sides. Eight numbered
    marks sit on objects; nobody is in the picture."""
    a.rect(0, 0, 1280, 720, fill=BOARD)
    tone(a, 0, 0, 1280, 300, 30, amp=4, spacing=9)                   # sky: light line tone
    a.rect(0, 470, 1280, 250, fill=BOARD)
    tone(a, 0, 480, 1280, 240, -20, amp=5, spacing=8)                  # ground
    a.line(0, 470, 1280, 470, **L)
    # tower
    a.rect(120, 60, 260, 120, rx=14, fill=BOARD, **L)
    tone(a, 130, 70, 120, 100, 60, cross=True)
    kit.label(a, 250, 140, "RCC", size=52, fill=INK, anchor="middle", font_weight="bold", letter_spacing="6")
    for x0, x1 in ((150, 110), (220, 210), (280, 290), (350, 390)):
        a.line(x0, 180, x1, 470, **L)
    a.line(130, 320, 370, 320, **L)
    for k in range(12):                                                # ladder
        a.line(392, 190 + k * 23, 418, 190 + k * 23, stroke=INK, stroke_width=2.5)
    a.line(392, 180, 392, 470, **L)
    a.line(418, 180, 418, 470, **L)
    # kiosk
    a.rect(520, 250, 260, 220, fill=BOARD, **L)
    a.rect(540, 270, 120, 90, fill=BOARD, **L)                         # CRT
    tone(a, 546, 276, 108, 78, 0, spacing=5, amp=2)
    a.rect(680, 270, 84, 120, fill=BOARD, **L)                         # price board
    for k in range(5):
        a.line(690, 290 + k * 20, 754, 290 + k * 20, stroke=INK, stroke_width=2)
    a.rect(540, 380, 220, 70, fill=BOARD, **L)                         # shutter, half down
    for k in range(6):
        a.line(540, 390 + k * 10, 760, 390 + k * 10, stroke=INK, stroke_width=1.5)
    tone(a, 780, 260, 60, 210, 45, cross=True, amp=4)                  # its shadow side
    # barricade
    for k, (x, y) in enumerate(((880, 400), (960, 400), (920, 340), (1040, 410))):
        a.rect(x, y, 80, 60, fill=BOARD, **L)
        a.line(x, y, x + 80, y + 60, stroke=INK, stroke_width=2)
        if k % 2:
            tone(a, x + 4, y + 4, 72, 52, 45, amp=3)
    # shields lying flat, jerricans on their sides
    for x in (430, 1120):
        a.path(f"M{x},{560} L{x + 130},{548} L{x + 140},{600} L{x + 10},{612}Z", fill=BOARD, **L)
        kit.label(a, x + 70, 590, "RCC", size=20, fill=INK, anchor="middle", font_weight="bold",
                  transform=f"rotate(-5 {x + 70} 580)")
    for x in (640, 720, 1000):
        a.rect(x, 590, 60, 40, rx=6, fill=BOARD, **L)
        a.rect(x + 48, 600, 14, 12, fill=INK)
    for n, (x, y) in enumerate(((350, 92), (405, 300), (600, 412), (720, 330), (1000, 360), (500, 580), (1180, 575),
                                (300, 400)), start=1):
        mark_badge(a, x, y, n)


@asset(G, "split-field-perimeter", group="backdrops", title="Split Field: the perimeter after (Split Field 2)",
       w=1280, h=720, row=kit.row(M, "Boards: the place after"))
def perimeter(a: Art):
    """The floodlit perimeter after, in ink line and Craftint tone: the chain fence on concrete posts, a
    floodlight mast with its lamps, a barricade of barriers, the plinth's gate with cracked glass above it,
    a banner pole down in the road and shields left on the ground. Ten numbered marks on objects; nobody is
    in the picture."""
    a.rect(0, 0, 1280, 720, fill=BOARD)
    tone(a, 0, 0, 1280, 260, 45, cross=True, amp=4, spacing=9)       # night: crosshatch tone
    a.rect(260, 40, 760, 220, fill=BOARD, **L)                         # the plinth's glass and gate
    for x in range(260, 1020, 95):
        a.line(x, 40, x, 260, stroke=INK, stroke_width=2.5)
    a.path("M640,120 L580,60 M640,120 L720,70 M640,120 L700,200 M640,120 L560,180", fill="none", stroke=INK, stroke_width=2)
    a.rect(560, 180, 160, 80, fill=BOARD, **L)
    tone(a, 566, 186, 148, 70, 90, amp=3, spacing=6)
    a.line(0, 260, 1280, 260, **L)
    tone(a, 0, 470, 1280, 250, -20, amp=5, spacing=8)
    a.line(0, 470, 1280, 470, **L)
    for x in range(40, 1280, 160):                                     # fence
        a.rect(x, 300, 14, 170, fill=BOARD, **L)
    for x in range(40, 1240, 20):
        a.line(x, 310, x + 20, 460, stroke=INK, stroke_width=1)
        a.line(x + 20, 310, x, 460, stroke=INK, stroke_width=1)
    a.line(0, 306, 1280, 306, **L)
    a.rect(1100, 140, 16, 330, fill=BOARD, **L)                        # mast
    a.rect(1050, 110, 116, 36, fill=BOARD, **L)
    for k in range(4):
        a.circle(1066 + k * 28, 128, 9, fill=BOARD, stroke=INK, stroke_width=2.5)
    for x in (300, 470, 640, 810):                                     # barriers
        a.path(f"M{x},{470} L{x + 140},{470} L{x + 124},{400} L{x + 16},{400}Z", fill=BOARD, **L)
        tone(a, x + 20, 410, 100, 50, 60, amp=3)
    a.line(120, 640, 420, 560, **L)                                    # banner pole down
    a.path("M300,600 L410,568 L426,620 L316,652Z", fill=BOARD, **L)
    for x in (720, 980):
        a.path(f"M{x},{600} L{x + 130},{588} L{x + 140},{640} L{x + 10},{652}Z", fill=BOARD, **L)
    for n, (x, y) in enumerate(((640, 120), (1108, 250), (370, 430), (540, 430), (880, 430), (360, 600), (780, 620),
                                (1040, 620), (47, 380), (210, 380)), start=1):
        mark_badge(a, x, y, n)


# ---- the comparison circle and striae --------------------------------------------------------------
@asset(G, "split-field-circle", group="pieces", title="Split Field: the comparison circle (frame and hairline)", w=440,
       h=480, row=kit.row(M, "The split-field circle"))
def circle(a: Art):
    """The comparison microscope's split field as a heavy inked ring with a hairline down the middle and
    small tick marks round it, MARK under the left half and REFERENCE under the right. The two striae are
    laid in under it at run time, each clipped to its half."""
    cx, cy, r = 220, 220, 200
    a.circle(cx, cy, r + 10, fill="none", stroke=INK, stroke_width=14)
    for k in range(48):
        t = k / 48 * 2 * math.pi
        rr = r + 22 if k % 4 == 0 else r + 18
        a.line(cx + (r + 12) * math.cos(t), cy + (r + 12) * math.sin(t), cx + rr * math.cos(t), cy + rr * math.sin(t),
               stroke=INK, stroke_width=2)
    a.line(cx, cy - r, cx, cy + r, stroke=INK, stroke_width=1.5)
    kit.label(a, 120, 466, "MARK", size=20, fill=INK, anchor="middle", font_weight="bold", letter_spacing="3")
    kit.label(a, 320, 466, "REFERENCE", size=20, fill=INK, anchor="middle", font_weight="bold", letter_spacing="3")


STRIAE = (
    ("his", "his plate's edge: a few broad, glassy-smooth bands with fine cracks across them, the lacquered scab",
     dict(n=7, widths=(10, 4, 12, 3), cracks=True)),
    ("theirs", "their blade's twin channel: two deep parallel grooves with fine striae beside them, the hollow knife's",
     dict(n=18, widths=(2, 2, 3), twin=True)),
    ("state-rim", "a shield rim: evenly spaced fine machine lines, regular as a comb", dict(n=34, widths=(1.6,), even=True)),
    ("state-baton", "a baton: soft, wide scuffs at a slant, few and blurred", dict(n=6, widths=(14, 8), slant=14, toned=True)),
    ("state-round", "a round: a spiral of fine land-and-groove lines turning across the field", dict(n=22, widths=(2,), curve=True)),
    ("rust", "older rust, not of this day: a crosshatch tone patch with pitting and no lines to match", dict(rust=True)),
    ("bloom", "an old bloom stain from Fall, not of this day: a soft tone blot with a ragged edge and no striae",
     dict(bloom=True)),
    ("old-resin", "old resin from the rite jars, not of this day: a glossy drip shape in line tone, its edge crazed",
     dict(resin=True)),
)


def striae(key, what, kw):
    def draw(a: Art):
        cx, cy, r = 210, 210, 206
        a.circle(cx, cy, r, fill=BOARD)
        clip = a.clip(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
        a.open("g", clip_path=clip)
        rng = a.rng
        if kw.get("rust"):
            tone(a, 40, 60, 340, 300, 45, cross=True, amp=18, spacing=6)
            for _ in range(40):
                a.circle(rng.uniform(40, 380), rng.uniform(40, 380), rng.uniform(2, 7), fill=INK)
        elif kw.get("bloom"):
            tone(a, 80, 80, 260, 260, 30, amp=30, spacing=5)
            a.path(a.wobble_d([(100, 120), (300, 90), (340, 280), (150, 330)], amp=22, step=20, closed=True), fill="none",
                   stroke=INK, stroke_width=2.5)
        elif kw.get("resin"):
            d = "M150,0 C150,120 120,180 140,260 C160,330 260,330 270,260 C280,190 250,120 250,0Z"
            tone(a, 110, 0, 180, 340, 80, amp=2, spacing=4)
            a.path(d, fill="none", stroke=INK, stroke_width=4)
            for k in range(14):
                a.line(rng.uniform(130, 270), rng.uniform(20, 320), rng.uniform(130, 270), rng.uniform(20, 320),
                       stroke=BOARD, stroke_width=1.5)
        elif kw.get("curve"):
            for k in range(kw["n"]):
                rr = 20 + k * 18
                a.path(f"M{cx - rr},{cy + 40} A{rr},{rr * 1.4} 0 0,1 {cx + rr},{cy - 40}", fill="none", stroke=INK,
                       stroke_width=kw["widths"][0] + (k % 3 == 0) * 2)
        else:
            n = kw["n"]
            y = 0
            k = 0
            while y < 420:
                w = kw["widths"][k % len(kw["widths"])]
                gap = 420 / n
                sl = kw.get("slant", 4)
                if kw.get("toned") and k % 2 == 0:
                    tone(a, -20, y, 460, w * 2, 0, amp=4, spacing=3)
                else:
                    a.line(-20, y, 440, y + sl, stroke=INK, stroke_width=w)
                if kw.get("twin") and k in (7, 9):
                    a.rect(-20, y - 8, 460, 16, fill=INK)
                    a.line(-20, y, 440, y + sl, stroke=BOARD, stroke_width=2)
                if kw.get("cracks") and k % 2 == 0:
                    for _ in range(3):
                        x0 = rng.uniform(20, 400)
                        a.line(x0, y - 8, x0 + rng.uniform(-10, 10), y + 14, stroke=BOARD, stroke_width=1.5)
                y += gap * (1 + (rng.uniform(-.25, .25) if not kw.get("even") else 0))
                k += 1
        a.close()
        a.circle(cx, cy, r, fill="none", stroke=INK, stroke_width=3)
    draw.__doc__ = (f"Split Field striae, {key}: {what}. A full disc in ink and Craftint tone, clipped to one half of "
                    f"the comparison circle at run time and slid and turned against the mark.")
    asset(G, f"split-field-striae-{key}", group="pieces", title=f"Split Field: striae, {key}", w=420, h=420,
          row=kit.row(M, "Striae: references and false traces"))(draw)


for _s in STRIAE:
    striae(*_s)


# ---- the three reference trays -------------------------------------------------------------------
def tray(key, label_text, what, obj):
    def draw(a: Art):
        a.rect(3, 3, 314, 134, fill=BOARD, **L)
        a.rect(3, 3, 314, 30, fill=BOARD, **L)
        tone(a, 6, 6, 308, 24, 45, amp=2, spacing=5)
        a.rect(110, 8, 100, 20, fill=BOARD)
        kit.label(a, 160, 25, label_text, size=18, fill=INK, anchor="middle", font_weight="bold", letter_spacing="3")
        obj(a)
    draw.__doc__ = f"Split Field reference tray {label_text}: {what}, drawn in ink and tone on the board."
    asset(G, f"split-field-tray-{key}", group="pieces", title=f"Split Field: reference tray, {label_text}", w=320, h=140,
          row=kit.row(M, "Reference trays"))(draw)


def obj_his(a):
    a.path("M30,110 L80,60 L180,52 L260,70 L290,110Z", fill=INK)
    for x in (100, 160, 220):
        a.line(x, 56, x + 6, 108, stroke=BOARD, stroke_width=1.5)
    tone(a, 40, 64, 240, 40, 60, amp=3, spacing=4)


def obj_theirs(a):
    a.open("g", transform="translate(115,86) rotate(90)")
    a.path("M0,-130 C14,-100 16,-40 8,0 L-8,0 C-16,-40 -14,-100 0,-130Z", fill=BOARD, **L)
    a.line(-3, -110, -3, -6, stroke=INK, stroke_width=2.5)
    a.line(3, -110, 3, -6, stroke=INK, stroke_width=2.5)
    a.rect(-6, 0, 12, 40, rx=3, fill=INK)
    a.close()


def obj_state(a):
    a.path("M30,120 C60,60 260,60 290,120", fill="none", stroke=INK, stroke_width=14)
    a.path("M30,120 C60,60 260,60 290,120", fill="none", stroke=BOARD, stroke_width=4, stroke_dasharray="2 4")
    a.rect(130, 96, 60, 30, fill=BOARD, **L)
    kit.label(a, 160, 118, "RCC", size=16, fill=INK, anchor="middle", font_weight="bold")


tray("his", "HIS", "the plate's edge of this event's form, a lacquered black slab with fine cracks", obj_his)
tray("theirs", "THEIRS", "the cult's hollow throwing knife laid flat, its open centre channel drawn as a twin groove", obj_theirs)
tray("state", "STATE", "a riot shield's curved rim stamped RCC, standing for the State's shields, batons and rounds", obj_state)


# ---- markers, stamps and the record ----------------------------------------------------------------
@asset(G, "split-field-marker", group="pieces", title="Split Field: a mark's number badge (open)", w=64, h=64,
       row=kit.row(M, "Marks: number badges"))
def marker(a: Art):
    """An open number badge: a white disc in a heavy ink ring with a short leader tick, the number laid in
    at run time."""
    a.circle(32, 32, 26, fill="#ffffff", stroke=INK, stroke_width=4)
    a.circle(32, 32, 20, fill="none", stroke=INK, stroke_width=1, opacity=0.4)
    a.line(32, 2, 32, 8, stroke=INK, stroke_width=2)
    a.line(32, 56, 32, 62, stroke=INK, stroke_width=2)
    a.line(2, 32, 8, 32, stroke=INK, stroke_width=2)
    a.line(56, 32, 62, 32, stroke=INK, stroke_width=2)


@asset(G, "split-field-marker-locked", group="pieces", title="Split Field: a mark's number badge (attributed)", w=64, h=64,
       row=kit.row(M, "Marks: number badges"))
def marker_locked(a: Art):
    """The badge once its mark is attributed: the disc filled with crosshatch tone and a heavy check of
    ink beside it; the number stays legible on a white centre."""
    a.circle(32, 32, 26, fill="#ffffff", stroke=INK, stroke_width=4)
    a.hatch(6, 6, 52, 52, angle=45, spacing=5, stroke=TONE, stroke_width=1.2, clip=a.clip('<circle cx="32" cy="32" r="24"/>'))
    a.hatch(6, 6, 52, 52, angle=-45, spacing=5, stroke=TONE, stroke_width=1.2, clip=a.clip('<circle cx="32" cy="32" r="24"/>'))
    a.circle(32, 32, 13, fill="#ffffff", stroke=INK, stroke_width=2)
    a.path("M42,48 L48,56 L60,38", fill="none", stroke=INK, stroke_width=4, stroke_linecap="round")


def stamp(key, text, what, w):
    def draw(a: Art):
        a.open("g", transform=f"rotate(-4 {w / 2} 40)")
        a.rect(6, 8, w - 12, 64, fill="none", stroke=INK, stroke_width=4)
        a.rect(12, 14, w - 24, 52, fill="none", stroke=INK, stroke_width=1.5)
        kit.label(a, w / 2, 50, text, size=26, fill=INK, anchor="middle", font_weight="bold", letter_spacing="3",
                  fit=kit.fitw(text, 26, w - 50, .78))
        a.close()
        tone(a, 10, 12, w - 20, 60, 60, amp=4, spacing=8)
    draw.__doc__ = f"Split Field stamp: {text} {what}, in heavy ink capitals in a double-ruled box over a patch of line tone."
    asset(G, f"split-field-stamp-{key}", group="ui", title=f"Split Field: stamp, {text}", w=w, h=80,
          row=kit.row(M, "Stamps and the pin"))(draw)


stamp("aside", "NOT OF THIS DAY", "set on a false trace put aside", 360)
stamp("reconstructed", "RECONSTRUCTED", "set on the board when every mark is attributed and every false trace set aside", 360)
stamp("pin", "PIN THE BOARD", "the button that ends the page at any time", 300)


@asset(G, "split-field-record", group="documents", title="Split Field: the record strip (blank)", w=320, h=600,
       row=kit.row(M, "The record of the hurt"))
def record(a: Art):
    """The record strip at the right of the board: RECORD in heavy capitals over a band of line tone, then
    five ruled entries, each with a line for a name, a smaller line for the want, and BY: for what made the
    mark. Filled in as marks lock; it names the hurt and never shows a wound."""
    a.rect(3, 3, 314, 594, fill="#ffffff", **L)
    tone(a, 6, 6, 308, 50, 45, amp=3, spacing=6)
    a.rect(70, 14, 180, 34, fill="#ffffff")
    kit.label(a, 160, 42, "RECORD", size=26, fill=INK, anchor="middle", font_weight="bold", letter_spacing="4")
    for k in range(5):
        y = 80 + k * 102
        a.line(16, y + 30, 300, y + 30, stroke=INK, stroke_width=1.5)
        a.line(16, y + 56, 240, y + 56, stroke=INK, stroke_width=0.8, opacity=0.6)
        kit.label(a, 16, y + 84, "BY:", size=16, fill=INK, font_weight="bold")
        a.line(54, y + 84, 300, y + 84, stroke=INK, stroke_width=0.8, opacity=0.6)
        a.line(10, y + 96, 310, y + 96, stroke=INK, stroke_width=2)


@asset(G, "split-field-record-line", group="documents", title="Split Field: one record entry (filled tone band)", w=300, h=100,
       row=kit.row(M, "The record of the hurt"))
def record_line(a: Art):
    """One entry of the record as it locks: a light line-tone band behind a ruled name line, want line and
    BY: line, with a small ink check at the right; the words are laid in at run time."""
    tone(a, 4, 4, 292, 92, 30, amp=4, spacing=9)
    a.line(10, 32, 290, 32, stroke=INK, stroke_width=1.5)
    a.line(10, 56, 230, 56, stroke=INK, stroke_width=0.8)
    kit.label(a, 10, 86, "BY:", size=16, fill=INK, font_weight="bold")
    a.line(46, 86, 250, 86, stroke=INK, stroke_width=0.8)
    a.path("M262,72 L270,84 L288,60", fill="none", stroke=INK, stroke_width=4, stroke_linecap="round")

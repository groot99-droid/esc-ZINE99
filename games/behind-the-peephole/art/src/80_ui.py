"""Ornaments (the UI's brass and paper) and the two thread objects."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Ornaments (catch ring, watch face, bell strip, wren blind stamp, strip dots)"


def _ring(key, frac, title, doc):
    @asset(G, f"ui-catch-ring-{key}", group="ui", title=title, w=480, h=480, row=ROW)
    def draw(a: Art):
        cx = cy = 240
        R = 170
        kit.door_wood(a, 0, 0, 480, 480, lines=26)
        a.circle(cx, cy, 240, fill=a.radial([(0, "#6a4220", 0.7), (0.6, "#3a2414", 0.3), (1, "#000", 0)]))
        a.circle(cx, cy, R + 34, fill=kit.brass_fill(a), stroke="#3b2a0e", stroke_width=3)
        d = "".join(f"M{f(cx + (R + 8) * math.cos(t))},{f(cy + (R + 8) * math.sin(t))}L{f(cx + (R + 30) * math.cos(t))},{f(cy + (R + 30) * math.sin(t))}"
                    for t in [2 * math.pi * i / 48 for i in range(48)])
        a.path(d, stroke="#6b5220", stroke_width=1.2, opacity=0.6, fill="none")
        # the lens: black glass with the faintest room in it
        a.circle(cx, cy, R, fill="#060606")
        a.circle(cx, cy, R, fill=a.radial([(0, kit.AMBER, 0.34 + 0.3 * frac), (0.5, kit.BOTTLE, 0.3), (1, "#000", 0.9)], cx=0.55, cy=0.45, r=0.6))
        a.ellipse(cx - 70, cy - 86, 46, 16, fill="#fff", opacity=0.1, transform=f"rotate(-35 {cx - 70} {cy - 86})")
        a.circle(cx, cy, R / 2, fill="none", stroke=kit.AMBER_L, stroke_width=1.2, stroke_dasharray="3 9", opacity=0.6)
        circ = 2 * math.pi * (R + 14)
        a.circle(cx, cy, R + 14, fill="none", stroke="#2a1a0c", stroke_width=11)
        if frac >= 1:
            a.circle(cx, cy, R + 14, fill="none", stroke=kit.AMBER_L, stroke_width=16, opacity=0.35, filter=a.blur(6))
        a.circle(cx, cy, R + 14, fill="none", stroke=kit.AMBER_L if frac >= 1 else kit.AMBER, stroke_width=7, stroke_linecap="round",
                 stroke_dasharray=f"{f(circ * frac)} {f(circ)}", transform=f"rotate(-90 {cx} {cy})")
        a.vignette(0.6)
    draw.__doc__ = doc


_ring("closing", 0.34, "Catch ring: a third closed", "The catch ring a third of the way round the lens: a brass escutcheon on dark varnish, black glass, the dotted inner half where a beat must sit, and an amber arc beginning to close.")
_ring("closed", 1.0, "Catch ring: closed", "The catch ring closed all the way round the lens and glowing: the beat is caught.")


@asset(G, "ui-watch-face", group="ui", title="The pocket watch: the time, and minutes since the last bell", w=480, h=480, row=ROW)
def watch(a: Art):
    """The pocket watch raised with Tab: a brass case and cream dial with deco numerals at the quarters, hands at
    fourteen minutes past two, and a second small dial that counts the minutes since the last bell."""
    kit.baize(a, "#173a28")
    a.rect(0, 0, 480, 480, fill=a.radial([(0, kit.AMBER_L, 0.22), (1, "#000", 0.6)], r=0.75))
    cx, cy = 240, 262
    a.ellipse(cx + 8, cy + 12, 186, 186, fill="#000", opacity=0.4, filter=a.blur(10))
    a.circle(cx, 62, 24, fill="none", stroke=kit.BRASS, stroke_width=9)
    a.rect(cx - 16, 66, 32, 26, rx=4, fill=kit.BRASS)
    a.circle(cx, cy, 182, fill=kit.brass_fill(a), stroke=kit.BRASS_D, stroke_width=2)
    a.circle(cx, cy, 160, fill="#f3ead2", stroke=kit.BRASS_D, stroke_width=2)
    a.circle(cx, cy, 160, fill=a.radial([(0, "#fff", 0.4), (1, "#b8913f", 0.25)], r=0.6))
    d = []
    for k in range(60):
        t = math.radians(k * 6)
        L = 16 if k % 5 == 0 else 7
        d.append(f"M{f(cx + 154 * math.sin(t))},{f(cy - 154 * math.cos(t))}L{f(cx + (154 - L) * math.sin(t))},{f(cy - (154 - L) * math.cos(t))}")
    a.path("".join(d), stroke=kit.INK, stroke_width=1.6, fill="none")
    for lab, ang in (("12", 0), ("3", 90), ("9", 270)):
        t = math.radians(ang)
        kit.deco(a, lab, cx + 116 * math.sin(t), cy - 116 * math.cos(t) - 15, 30, color=kit.INK, weight=0.14, tracking=0.12, anchor="middle")
    # the bell dial, where the six would be
    bx, by = cx, cy + 84
    a.circle(bx, by, 50, fill="#e9dfc4", stroke=kit.BRASS_D, stroke_width=1.6)
    for k in range(12):
        t = math.radians(k * 30)
        a.line(bx + 44 * math.sin(t), by - 44 * math.cos(t), bx + 38 * math.sin(t), by - 38 * math.cos(t), stroke=kit.INK, stroke_width=1.2)
    kit.bell(a, bx, by + 18, 16)
    a.line(bx, by, bx + 30 * math.sin(math.radians(84)), by - 30 * math.cos(math.radians(84)), stroke=kit.EVIDENCE, stroke_width=2.4, stroke_linecap="round")
    a.circle(bx, by, 3.5, fill=kit.INK)
    # hands: 2:14
    for ang, L, w in ((67, 82, 9), (84, 130, 5)):
        t = math.radians(ang)
        a.line(cx - 16 * math.sin(t), cy + 16 * math.cos(t), cx + L * math.sin(t), cy - L * math.cos(t), stroke=kit.INK, stroke_width=w, stroke_linecap="round")
    a.circle(cx, cy, 8, fill=kit.BRASS, stroke=kit.INK, stroke_width=2)
    a.path(f"M{cx - 120},{cy - 96} A150,150 0 0,1 {cx - 20},{cy - 150}", fill="none", stroke="#fff", stroke_width=10, opacity=0.25, stroke_linecap="round")


@asset(G, "ui-bell-strip", group="ui", title="The bell board strip: six pulls, and a seventh with no label", w=960, h=300, row=ROW)
def bell_strip(a: Art):
    """The 1926 valet bell board as a strip: seven bells on coiled springs over seven pulls, six with brass room numbers
    and a small bulb each, the seventh bare."""
    kit.door_wood(a, 0, 0, 960, 300, base="#2a1a10", lines=30, op=0.25)
    a.rect(14, 14, 932, 272, fill="none", stroke=kit.BRASS, stroke_width=2)
    a.rect(22, 22, 916, 256, fill="none", stroke=kit.BRASS, stroke_width=0.7)
    kit.deco(a, "VALET SERVICE 1926", 480, 34, 15, color=kit.BRASS, weight=0.13, tracking=0.5, anchor="middle")
    for i in range(7):
        x = 110 + i * 123
        ringing = i == 3
        a.path(f"M{x},{70} q16,-8 0,-0" , fill="none", stroke=kit.BRASS_D, stroke_width=0)
        d = f"M{x},{66}" + "".join(f" q{10 if k % 2 == 0 else -10},6 0,12" for k in range(5))
        a.path(d, fill="none", stroke="#c9c2b0", stroke_width=2.4, transform=f"rotate({8 if ringing else 0} {x} 66)")
        a.open("g", transform=f"rotate({12 if ringing else 0} {x} 66)")
        kit.bell(a, x, 152, 52)
        a.close()
        if ringing:
            for k in (1, 2):
                a.path(f"M{x - 34 - k * 10},136 q-8,16 0,32 M{x + 44 + k * 10},130 q8,16 0,32", fill="none", stroke=kit.AMBER_L, stroke_width=1.6)
        if i < 6:
            a.rect(x - 28, 204, 56, 26, rx=3, fill=kit.brass_fill(a), stroke=kit.BRASS_D, stroke_width=1)
            a.text(x, 223, str(401 + i), size=18, family="serif", fill="#2a1a0c", text_anchor="middle", font_weight="bold")
            lamp = kit.LAMPS[i]
            if ringing:
                a.circle(x, 252, 22, fill=a.radial([(0, lamp, 0.9), (1, lamp, 0)]))
            a.circle(x, 252, 7, fill=lamp if ringing else "#3a2a18", stroke=kit.BRASS_D, stroke_width=1.2)
        else:
            a.rect(x - 28, 204, 56, 26, rx=3, fill="none", stroke=kit.BRASS_D, stroke_width=1, stroke_dasharray="3 3")
            for sx in (-22, 22):
                a.circle(x + sx, 217, 2, fill="#0a0806")   # two empty screw holes
    a.vignette(0.5)


@asset(G, "ui-wren-blind-stamp", group="ui", title="Wren's envelope: the blind stamp", w=480, h=360, row=ROW)
def wren_stamp(a: Art):
    """A cream envelope, unsealed, seen at the flap: a wren pressed blind into the paper, with no ink, catching the light
    on one side."""
    a.rect(0, 0, 480, 360, fill="#101010")
    a.rect(0, 250, 480, 110, fill="#2a1c10")
    a.poly([(30, 60), (450, 44), (456, 310), (36, 324)], fill="#000", opacity=0.5, filter=a.blur(8))
    a.poly([(24, 50), (444, 34), (450, 300), (30, 314)], fill="#efe6cf")
    a.poly([(24, 50), (444, 34), (238, 214)], fill="#f6efdc", stroke="#b8ab8a", stroke_width=1.2)
    a.poly([(24, 50), (444, 34), (238, 214)], fill=a.gradient([(0, "#fff"), (1, "#b8ab8a")]), opacity=0.3)
    a.path("M30,314 L236,170 L450,300", fill="none", stroke="#c9bfa4", stroke_width=1.2)
    kit.wren(a, 236, 118, 40, blind=True)
    a.rect(0, 0, 480, 360, fill=a.radial([(0, kit.AMBER_L, 0.16), (1, "#000", 0.5)], cx=0.4, cy=0.3, r=0.8))


@asset(G, "ui-strip-dots", group="ui", title="The night strip: caught, missed, and the knock", w=960, h=220, row=ROW)
def strip_dots(a: Art):
    """The night strip pinned to the office wall: a paper tape ruled from 23:00 to 05:00, six rows for the six rooms, a
    filled dot for each beat caught and a hollow one for each missed, and a mark at 2:14."""
    kit.wallpaper(a, 0, 0, 960, 220)
    a.rect(0, 0, 960, 220, fill="#000", opacity=0.25)
    a.rect(30, 32, 908, 164, fill="#000", opacity=0.3)
    a.rect(24, 24, 908, 164, fill="#f1ecdf")
    kit.carbon_smudge(a, 40, 40, 860, 130, n=4, op=0.14)
    x0, x1 = 110, 900
    r = a.rng
    for k in range(7):
        x = x0 + (x1 - x0) * k / 6
        a.line(x, 44, x, 170, stroke=kit.CARBON, stroke_width=0.6, opacity=0.6)
        kit.typed(a, x, 40, f"{(23 + k) % 24:02d}:00", size=11, anchor="middle")
    for j in range(6):
        y = 62 + j * 20
        kit.typed(a, 44, y + 4, str(401 + j), size=13, weight="bold")
        a.line(x0, y, x1, y, stroke=kit.CARBON, stroke_width=0.4, opacity=0.5, stroke_dasharray="2 5")
        for _ in range(r.randint(3, 6)):
            x = r.uniform(x0 + 20, x1 - 10)
            if r.random() < 0.68:
                a.circle(x, y, 5, fill=kit.LAMPS[j], stroke=kit.INK, stroke_width=1.2)
            else:
                a.circle(x, y, 5, fill="none", stroke=kit.INK, stroke_width=1.2)
    xk = x0 + (x1 - x0) * (3 + 14 / 60) / 6
    a.line(xk, 44, xk, 178, stroke=kit.EVIDENCE, stroke_width=1.4)
    kit.typed(a, xk + 6, 182, "2:14", size=11, color=kit.EVIDENCE)
    for x in (32, 926):
        kit.pin(a, x, 32, "#d9b02a", r=6)


def _rose_ui(key, lit, title, doc):
    @asset(G, f"ui-rose-{key}", group="ui", title=title, w=300, h=300, row=ROW)
    def draw(a: Art):
        kit.wallpaper(a, 0, 0, 300, 300)
        a.rect(0, 0, 300, 300, fill="#000", opacity=0.3 if lit else 0.5)
        kit.set_nick_bg(a, kit.BOTTLE)
        a.ellipse(156, 160, 74, 74, fill="#000", opacity=0.4, filter=a.blur(8))
        kit.rose(a, 150, 150, 72, lit=kit.AMBER_L if lit else None)
        a.vignette(0.6)
    draw.__doc__ = doc


_rose_ui("lit", True, "A brass rose, lit", "A brass rose on the bottle-green cloth wallpaper with the passage light leaking through its lens: nobody is at the hole.")
_rose_ui("dark", False, "A brass rose, dark", "The same brass rose gone dark at its centre: an eye is at the hole.")


@asset(G, "ui-deco-divider", group="ui", title="Deco divider: stepped fans and a rose", w=720, h=120, row=ROW)
def divider(a: Art):
    """A gold deco divider on deep green: a small brass rose between two stepped fans, with double rules running out to
    diamond ends."""
    a.rect(0, 0, 720, 120, fill="#0f2a1e")
    a.rect(0, 0, 720, 120, fill=a.radial([(0, kit.AMBER_L, 0.14), (1, "#000", 0.4)], r=0.7))
    for sgn in (-1, 1):
        x = 360 + sgn * 46
        kit.fan(a, x, 60, 70, n=9, a0=-50 if sgn > 0 else 130, a1=50 if sgn > 0 else 230, color=kit.GOLD, sw=1.1, rings=(0.4, 0.7, 1.0))
        a.line(x + sgn * 80, 56, 360 + sgn * 330, 56, stroke=kit.GOLD, stroke_width=1.8)
        a.line(x + sgn * 80, 64, 360 + sgn * 290, 64, stroke=kit.GOLD, stroke_width=0.8)
        xe = 360 + sgn * 336
        a.poly([(xe - 8, 56), (xe, 48), (xe + 8, 56), (xe, 64)], fill=kit.GOLD)
    kit.set_nick_bg(a, "#0f2a1e")
    kit.rose(a, 360, 60, 30)


@asset(G, "ui-number-plates", group="ui", title="Brass number plates, 401 to 406", w=720, h=240, row=ROW)
def plates(a: Art):
    """Six small brass door plates, 401 to 406, screwed to dark varnish, each thumb-polished at its centre and lit from
    below by its own room's colour of lamp."""
    kit.door_wood(a, 0, 0, 720, 240, lines=22)
    for i in range(6):
        cx, cy = 130 + (i % 3) * 230, 70 + (i // 3) * 104
        lamp = kit.LAMPS[i]
        a.ellipse(cx, cy + 40, 90, 20, fill=a.radial([(0, lamp, 0.5), (1, lamp, 0)]))
        a.rect(cx - 74, cy - 30, 152, 64, rx=6, fill="#000", opacity=0.5, filter=a.blur(4))
        a.rect(cx - 78, cy - 34, 156, 64, rx=6, fill=a.gradient([(0, kit.BRASS_L), (0.5, kit.BRASS), (1, "#8a6a28")]), stroke=kit.BRASS_D, stroke_width=1.6)
        a.ellipse(cx, cy - 2, 50, 22, fill="#fff3c8", opacity=0.3, filter=a.blur(6))
        a.rect(cx - 70, cy - 26, 140, 48, rx=3, fill="none", stroke=kit.BRASS_D, stroke_width=0.8)
        kit.deco(a, str(401 + i), cx + 2, cy - 17, 32, color="#2a1a0c", weight=0.15, tracking=0.2, anchor="middle")
        for sx in (-64, 64):
            a.circle(cx + sx, cy - 2, 4, fill=kit.BRASS_D)
            a.line(cx + sx - 3, cy - 4, cx + sx + 3, cy, stroke="#2a1a0c", stroke_width=1)
    a.vignette(0.6)


# ---- thread ------------------------------------------------------------------------------------------
@asset(G, "thread-own", group="thread", title="Thread: a clock stopped at 2:14", w=480, h=480)
def thread_own(a: Art):
    """This game's thread object in gouache: a small travelling alarm clock on the office desk under the green-shaded
    lamp, stopped at fourteen minutes past two, with three chalk knock marks on the wood beside it, two close and one apart."""
    ro = a.roughen(4, 0.05)
    so = a.roughen(2, 0.08)
    kit.wallpaper(a, 0, 0, 480, 300)
    a.rect(0, 0, 480, 300, fill="#000", opacity=0.35)
    a.rect(0, 300, 480, 180, fill="#4a2f18")
    kit.dabs(a, 0, 300, 480, 180, ["#6b4626", "#3a2412"], n=120, angle=0, L=(10, 30), width=5)
    a.rect(0, 292, 480, 12, fill="#2a1a0e")
    a.circle(200, 250, 300, fill=a.radial([(0, kit.AMBER_L, 0.55), (0.5, kit.AMBER, 0.2), (1, kit.AMBER, 0)]))
    # the clock: square brass case, folding stand
    a.ellipse(250, 392, 130, 18, fill="#000", opacity=0.45, filter=a.blur(8))
    a.poly([(146, 170), (346, 162), (352, 380), (150, 386)], fill=kit.BRASS_D, filter=ro)
    a.poly([(156, 180), (336, 174), (340, 370), (160, 376)], fill=kit.BRASS, filter=ro)
    a.circle(248, 274, 82, fill="#efe6cf", filter=so)
    a.circle(248, 274, 82, fill="none", stroke=kit.BRASS_D, stroke_width=4, filter=so)
    for k in range(12):
        t = math.radians(k * 30)
        a.circle(248 + 68 * math.sin(t), 274 - 68 * math.cos(t), 4 if k % 3 == 0 else 2.4, fill=kit.INK)
    for ang, L, w in ((67, 38, 6), (84, 62, 3.5)):
        t = math.radians(ang)
        a.line(248, 274, 248 + L * math.sin(t), 274 - L * math.cos(t), stroke=kit.INK, stroke_width=w, stroke_linecap="round")
    a.circle(248, 274, 6, fill=kit.INK)
    a.rect(232, 150, 32, 16, rx=4, fill=kit.BRASS_L, filter=so)
    kit.dabs(a, 160, 180, 180, 190, [kit.BRASS_L, "#8a6a28"], n=30, angle=1.5, L=(6, 14), width=4, op=0.3,
             inside=lambda x, y: math.hypot(x - 248, y - 274) > 90)
    # the knock: two quick, one slow
    for x, y in ((60, 420), (84, 430), (140, 414)):
        a.ellipse(x, y, 11, 7, fill="#f1ede2", opacity=0.75, filter=so)
    a.rect(0, 0, 480, 480, fill=a.radial([(0, "#000", 0), (0.6, "#000", 0.15), (1, "#000", 0.75)], r=0.72))


@asset(G, "thread-guest", group="thread", title="Thread: a name written on the inside of a thing", w=480, h=480)
def thread_guest(a: Art):
    """The collection's hidden object for this game, in gouache: one of Mara's white cotton gloves on the desk under the
    north-light bulb, its cuff turned back, and inside the cuff a name in small ink capitals where only its wearer would read it."""
    ro = a.roughen(4, 0.05)
    so = a.roughen(2, 0.08)
    a.rect(0, 0, 480, 480, fill="#5a3a1e")
    kit.dabs(a, 0, 0, 480, 480, ["#6b4626", "#4a2f18", "#7a5230"], n=200, angle=0.12, L=(12, 34), width=6)
    a.circle(260, 200, 330, fill=a.radial([(0, kit.ROOMS[403][1], 0.5), (0.6, kit.ROOMS[403][1], 0.12), (1, "#000", 0)]))
    a.open("g", transform="rotate(-24 240 250)")
    a.ellipse(250, 290, 180, 80, fill="#000", opacity=0.35, filter=a.blur(12))
    # fingers
    for i, (L, dy) in enumerate([(92, 6), (110, 0), (104, 4), (84, 14)]):
        y = 196 + i * 30
        a.rect(60 + dy, y, L + 30, 26, rx=13, fill="#f1ede2", filter=so)
        a.rect(60 + dy, y + 17, L + 30, 9, rx=4, fill="#cfc7b2", opacity=0.6, filter=so)
    a.poly([(190, 314), (150, 372), (172, 388), (230, 330)], fill="#f1ede2", filter=so)   # thumb
    # palm and wrist
    a.poly([(160, 188), (330, 180), (338, 330), (166, 322)], fill="#f1ede2", filter=ro)
    a.poly([(166, 300), (338, 306), (338, 330), (166, 322)], fill="#cfc7b2", opacity=0.7, filter=so)
    for k in range(3):
        a.line(200 + k * 40, 196, 206 + k * 40, 262, stroke="#cfc7b2", stroke_width=2.4, filter=so)
    # the cuff, turned back: its inside faces us
    a.poly([(322, 172), (424, 160), (432, 346), (330, 338)], fill="#e2dccb", filter=ro)
    a.poly([(322, 172), (346, 170), (352, 340), (330, 338)], fill="#b9b09a", opacity=0.8, filter=so)
    a.path("M352,186 L420,178 M356,326 L428,330", fill="none", stroke="#a9a08a", stroke_width=2, stroke_dasharray="6 5")
    a.text(388, 262, "M. LINDE", size=17, family="serif", fill="#1c2440", text_anchor="middle", letter_spacing=2,
           transform="rotate(88 388 256)", font_weight="bold")
    a.close()
    a.rect(0, 0, 480, 480, fill=a.radial([(0, "#000", 0), (0.6, "#000", 0.12), (1, "#000", 0.7)], r=0.72))

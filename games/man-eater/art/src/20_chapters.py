"""Chapter cards (the card table, one more chair pushed in each day), the 10:00 clock cards, the rules card."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, GREEN, SODIUM, STEEL, FROST, SNOW, BRUISE = (kit.INK, kit.CREAM, kit.GREEN, kit.SODIUM, kit.STEEL,
                                                         kit.FROST, kit.SNOW, kit.BRUISE)

SEATS = ["hands", "keys", "anchors", "houses", "sparks", "stars"]
CHAPTERS = [
    # n, day line, title, seated suits, object
    (1, "Arrival.", "", [], "rules"),
    (2, "Day One.", "The Ration", SEATS, "basket"),
    (3, "Day Two.", "Transferred", SEATS, "slip"),
    (4, "Day Three.", "The Yard", ["hands", "keys", "houses", "sparks", "stars"], "hold"),
    (5, "Day Four.", "The Measure of the Halls", ["hands", "keys", "sparks", "stars"], "plan"),
    (6, "Day Five.", "Jax's Plan", ["hands", "keys", "stars"], "lace"),
    (7, "Day Six.", "Below", ["hands", "keys"], "open"),
    (8, "Day Seven.", "The Last Call", ["hands"], "tray"),
    (9, "The Endings.", "", [], "none"),
]
CX, CY, R = 1080, 452, 262


def _loaf(a, x, y, rot=0, s=1.0):
    a.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(rot)}) scale({f(s)})")
    a.ellipse(3, 5, 40, 21, fill="#000", opacity=0.3)
    a.ellipse(0, 0, 40, 21, fill="#b98f55", stroke="#5d4424", stroke_width=2)
    a.ellipse(-4, -5, 30, 11, fill="#d3ad73", opacity=0.7)
    for c in range(3):
        a.line(-18 + c * 15, -11, -9 + c * 15, 7, stroke="#f0d9aa", stroke_width=3.5, stroke_linecap="round")
    a.close()


def _basket(a, x, y, n):
    a.ellipse(x + 8, y + 12, 112, 66, fill="#000", opacity=0.3, filter=a.blur(6))
    a.ellipse(x, y, 108, 62, fill="#5d4527")
    cl = a.clip(f'<ellipse cx="{x}" cy="{y}" rx="102" ry="56"/>')
    a.hatch(x - 110, y - 64, 220, 128, angle=58, spacing=8, stroke="#3d2c16", stroke_width=2.5, clip=cl)
    a.hatch(x - 110, y - 64, 220, 128, angle=-58, spacing=8, stroke="#84643b", stroke_width=1.6, clip=cl)
    a.ellipse(x, y, 108, 62, fill="none", stroke="#3d2c16", stroke_width=5)
    spots = [(-44, -10, -12), (34, -16, 14), (-4, 16, 4), (50, 14, -20), (-50, 20, 24)]
    for i in range(n):
        dx, dy, rot = spots[i]
        _loaf(a, x + dx, y + dy, rot, 0.9)


def _chair(a, ang, out, lit=1.0):
    r = R + (66 if out else 2)
    cx, cy = CX + math.cos(ang) * r, CY + math.sin(ang) * r
    a.open("g", transform=f"translate({f(cx)},{f(cy)}) rotate({f(math.degrees(ang) - 90 + (a.rng.uniform(-9, 9) if out else 0))})")
    for lx, ly in ((-36, -36), (36, -36), (-36, 36), (36, 36)):
        a.circle(lx, ly, 6, fill="#141414")
    a.rect(-42, -42, 84, 84, rx=12, fill="#59544a" if out else "#35322c", stroke="#17150f", stroke_width=3)
    a.rect(-34, -34, 68, 68, rx=8, fill="none", stroke="#000", stroke_width=1, opacity=0.3)
    a.rect(-47, 30, 94, 18, rx=7, fill="#2a2721", stroke="#17150f", stroke_width=3)
    if out:
        a.ellipse(-8, -8, 26, 20, fill="#fff", opacity=0.07 * lit)
    a.close()
    return cx, cy


def _shadow_line(a, x, y, w, dx, dy):
    a.line(x, y, x + dx, y + dy, stroke="#000", stroke_width=w, stroke_linecap="round")


def _table_object(a, kind, seats):
    x, y = CX, CY
    if kind == "rules":
        a.open("g", transform=f"rotate(-11 {x} {y})")
        a.rect(x - 58, y - 78, 124, 164, fill="#000", opacity=0.3)
        a.rect(x - 62, y - 82, 124, 164, fill=kit.PAPER)
        for i in range(3):
            yy = y - 50 + i * 44
            kit.typed(a, x - 50, yy, f"{i + 1}.", size=15, ghost=False)
            a.line(x - 26, yy - 5, x + 48, yy - 5, stroke=INK, stroke_width=2.2, stroke_dasharray="9 3 14 3 6 3")
            a.line(x - 26, yy + 9, x + 30 - i * 14, yy + 9, stroke=INK, stroke_width=2.2, stroke_dasharray="12 3 5 3")
        a.close()
        return
    if kind == "none":
        return
    if kind == "open":
        _loaf(a, x, y, 8, 1.1)
        for row, yy in ((0, y - 88), (1, y + 88)):
            for i in range(8):
                cx_ = x - 133 + i * 38
                a.rect(cx_ - 15 + 2, yy - 22 + 3, 30, 44, rx=3, fill="#000", opacity=0.3)
                a.rect(cx_ - 15, yy - 22, 30, 44, rx=3, fill=kit.CARD, stroke="#6f6750", stroke_width=1,
                       transform=f"rotate({f(a.rng.uniform(-5, 5))} {f(cx_)} {f(yy)})")
                a.text(cx_, yy + 7, str(i + 1), size=20, family="monospace", fill=INK, font_weight="bold",
                       text_anchor="middle")
        return
    if kind == "tray":
        a.rect(x - 124, y - 74, 260, 160, rx=14, fill="#000", opacity=0.3, filter=a.blur(5))
        a.rect(x - 130, y - 80, 260, 160, rx=14, fill="#b9bdc0", stroke="#5c6165", stroke_width=3)
        a.rect(x - 118, y - 68, 236, 136, rx=9, fill="none", stroke=STEEL, stroke_width=2)
        for i in range(10):
            px, py = x - 88 + (i % 5) * 44, y - 24 + (i // 5) * 48
            a.path(f"M{px - 15},{py + 9} L{px - 12},{py - 10} Q{px},{py - 16} {px + 14},{py - 9} L{px + 16},{py + 10}Z",
                   fill=BRUISE, stroke="#2e2832", stroke_width=1.5)
        return
    _basket(a, x, y - 14 if kind != "basket" else y, max(0, len(seats) - 1))
    if kind == "slip":
        a.open("g", transform=f"rotate(7 {x} {y + 96})")
        a.rect(x - 84, y + 78, 176, 40, fill="#000", opacity=0.3)
        a.rect(x - 88, y + 74, 176, 40, fill=kit.PAPER)
        kit.typed(a, x, y + 101, "transferred", size=21, anchor="middle")
        a.close()
    elif kind == "hold":
        a.open("g", transform=f"rotate(-9 {x} {y + 104})")
        a.rect(x - 76, y + 74, 160, 100, fill="#000", opacity=0.3)
        a.rect(x - 80, y + 70, 160, 100, fill=kit.PAPER, stroke="#8d866f", stroke_width=1)
        a.path(f"M{x - 80},{y + 70} L{x},{y + 126} L{x + 80},{y + 70}", fill="none", stroke="#a59d86", stroke_width=1.5)
        a.close()
        kit.stamp(a, x, y + 122, "HOLD", w=120, h=44, rot=-18, opacity=0.95, patch=0.5)
    elif kind == "plan":
        a.open("g", transform=f"rotate(5 {x} {y + 110})")
        a.rect(x - 96, y + 70, 200, 100, fill="#000", opacity=0.3)
        a.rect(x - 100, y + 66, 200, 100, fill=kit.PRUSSIAN)
        a.path(f"M{x - 84},{y + 82}h70v40h-70z M{x - 14},{y + 82}h60v68h-60 M{x - 84},{y + 122}v28h70 M{x + 46},{y + 100}h30",
               fill="none", stroke=kit.BLUELINE, stroke_width=2.5)
        a.line(x + 46, y + 132, x + 86, y + 132, stroke=SODIUM, stroke_width=2, stroke_dasharray="5 4")
        a.line(x, y + 66, x, y + 166, stroke="#000", stroke_width=1, opacity=0.35)
        a.close()
    elif kind == "lace":
        pts = [(x - 120, y + 96), (x - 80, y + 118), (x - 30, y + 100), (x + 20, y + 124), (x + 70, y + 104),
               (x + 118, y + 122)]
        a.path(a.smooth_d([(px + 3, py + 4) for px, py in pts]), fill="none", stroke="#000", stroke_width=5, opacity=0.3)
        a.path(a.smooth_d(pts), fill="none", stroke="#2a221a", stroke_width=5, stroke_linecap="round")
        a.path(a.smooth_d(pts), fill="none", stroke="#6b5a45", stroke_width=1.5, stroke_dasharray="3 5")
        for i, (px, py) in enumerate(pts[1:-1]):
            a.circle(px, py, 8, fill="#2a221a", stroke="#6b5a45", stroke_width=1.5)
            a.circle(px - 2, py - 2, 2.5, fill="#6b5a45")


def _chapter(a, n, day, title_, seated, kind):
    cold = n == 9
    a.paper("#2f3833" if not cold else "#2b2f38", grain=0.32, fibre=0.6)
    # concrete floor slabs
    a.grid(0, 0, 1600, 900, 300, stroke="#000", stroke_width=2, opacity=0.25)
    # the bulb's pool, or moonlight once nobody sits
    if cold:
        a.poly([(700, 0), (1100, 0), (1600, 700), (1600, 900), (1250, 900)], fill=FROST, opacity=0.2)
    else:
        pool = a.radial([(0, SODIUM, 0.5), (0.45, SODIUM, 0.2), (1, SODIUM, 0)])
        a.circle(CX - 30, CY - 40, 620, fill=pool)
    angs = [math.radians(90 + i * 60) for i in range(6)]
    out = [(s in seated) or n == 1 for s in SEATS]
    # long shadows, down and to the right
    a.open("g", opacity=0.42, filter=a.blur(9))
    _shadow_line(a, CX, CY, 2 * R, 110, 150)
    for ang, o in zip(angs, out):
        r = R + (66 if o else 2)
        _shadow_line(a, CX + math.cos(ang) * r, CY + math.sin(ang) * r, 84, 110, 150)
    a.close()
    for ang, o in zip(angs, out):
        if not o:
            _chair(a, ang, False)
    # the table: steel rim, baize
    a.circle(CX, CY, R, fill="#4b4942", stroke="#191814", stroke_width=3)
    a.circle(CX, CY, R - 14, fill=GREEN if not cold else "#56646a")
    kit.speckle(a, a.clip(f'<circle cx="{CX}" cy="{CY}" r="{R - 15}"/>'), CX - R, CY - R, 2 * R, 2 * R,
                color="#26302a" if not cold else "#2a3338", strength=0.45)
    hl = a.radial([(0, "#fff", 0.22 if not cold else 0.1), (1, "#fff", 0)], cx=0.38, cy=0.32, r=0.6)
    a.circle(CX, CY, R - 14, fill=hl)
    for ang, o in zip(angs, out):
        if o:
            _chair(a, ang, True)
    # each place: the suit its owner chalked, a dealt hand face down
    for ang, s in zip(angs, SEATS):
        if s not in seated:
            continue
        px, py = CX + math.cos(ang) * (R - 52), CY + math.sin(ang) * (R - 52)
        kit.suit(a, s, px, py, 20, color=CREAM, sw=2.6)
        for j in range(0 if kind == "open" else 4):
            rr = R - 112
            tx, ty = CX + math.cos(ang + (j - 1.5) * 0.085) * rr, CY + math.sin(ang + (j - 1.5) * 0.085) * rr
            a.rect(tx - 13, ty - 19, 26, 38, rx=3, fill="#cbc2aa", stroke="#3b372c", stroke_width=1.2,
                   transform=f"rotate({f(math.degrees(ang) - 90 + (j - 1.5) * 9)} {f(tx)} {f(ty)})")
    _table_object(a, kind, seated)
    if cold:
        for i in range(6):
            ang = math.radians(20 + i * 60)
            kit.frost(a, CX + math.cos(ang) * R, CY + math.sin(ang) * R, math.degrees(ang) + 150, math.degrees(ang) + 210,
                      200, n=4, op=0.75)
    # the day card: a typed form slipped under the clip at the left
    a.open("g", transform="rotate(-2.5 300 450)")
    a.rect(88, 108, 440, 700, fill="#000", opacity=0.4, filter=a.blur(8))
    a.rect(80, 100, 440, 700, fill=kit.PAPER)
    d = "".join(f"M110,{y}H490" for y in range(330, 780, 40))
    a.path(d, stroke=FROST, stroke_width=1, opacity=0.5, fill="none")
    for y in (190, 450, 710):
        kit.punch(a, 104, y, 9, back="#262b28")
    kit.stencil(a, 140, 170, f"CHAPTER {n}", 34)
    a.line(140, 190, 490, 190, stroke=INK, stroke_width=3)
    a.line(140, 197, 490, 197, stroke=INK, stroke_width=1)
    kit.typed(a, 140, 262, day, size=46)
    if n not in (1, 9):
        kit.typed(a, 140, 316, "06:00.", size=30)
    words, line, yy = title_.split(), "", 396
    lines = []
    for w in words:
        if len(line) + len(w) + 1 > 15:
            lines.append(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        lines.append(line)
    for ln in lines:
        kit.typed(a, 140, yy, ln, size=32)
        yy += 40
    # the six chairs as a row of boxes: struck through when pushed in
    kit.typed(a, 140, 596, "CHAIRS", size=18)
    for i, s in enumerate(SEATS):
        bx = 140 + i * 56
        a.rect(bx, 612, 44, 44, fill="none", stroke=INK, stroke_width=2)
        if s in seated:
            kit.suit(a, s, bx + 22, 634, 13, color=INK, sw=1.8)
        elif n > 1:
            a.wobble([(bx - 4, 660), (bx + 48, 608)], amp=1.2, step=8, stroke=INK, stroke_width=2.4)
    kit.typed(a, 140, 728, "22:00", size=22)
    a.rect(226, 704, 264, 34, fill="none", stroke=INK, stroke_width=2)
    kit.carbon(a, 100, 120, 400, 660, n=3, op=0.08)
    kit.frost_corners(a, 0.08 + 0.085 * n, x=80, y=100, w=440, h=700)
    # the clip
    a.rect(250, 78, 110, 46, rx=8, fill="#9aa0a4", stroke="#3c4144", stroke_width=3)
    a.rect(280, 90, 50, 12, rx=6, fill="#3c4144")
    a.close()
    kit.film(a, 0, 0, 1600, 900, 0.22)
    a.vignette(0.6)


for _n, _day, _title, _seated, _kind in CHAPTERS:
    def _make(n=_n, day=_day, title_=_title, seated=_seated, kind=_kind):
        def fn(a: Art):
            _chapter(a, n, day, title_, seated, kind)
        left = len(seated)
        fn.__doc__ = (f"Chapter card {n}, {day} {title_}: the rec room card table from above under one bulb, "
                      f"{left} of six chairs still pulled out and the rest pushed in, with the day typed on a form "
                      f"clipped at the left and frost a little further across it than the day before.")
        return fn
    asset(G, f"chapter-{_n}", group="chapters", title=f"Chapter {_n}: {_day} {_title}".strip(), w=1600, h=900,
          row="Chapter cards: six chairs, one more pushed in each day")(_make())


# ---- the door at 10:00 --------------------------------------------------------------------------
def _clock(a, cx, cy, r, frost_level):
    a.ellipse(cx + r * 0.5, cy + r * 0.75, r * 1.0, r * 1.05, fill="#000", opacity=0.4, filter=a.blur(18))
    a.circle(cx, cy, r, fill="#2a2d2f", stroke="#0d0e0f", stroke_width=4)
    a.circle(cx, cy, r * 0.9, fill=a.radial([(0, "#EFE9D8", 1), (0.8, "#D9D2BF", 1), (1, "#a9a28f", 1)], cx=0.4, cy=0.35,
                                             r=0.75))
    d = ""
    for i in range(60):
        t = math.radians(i * 6)
        r0 = r * (0.78 if i % 5 == 0 else 0.83)
        d += f"M{f(cx + math.sin(t) * r0)},{f(cy - math.cos(t) * r0)}L{f(cx + math.sin(t) * r * 0.87)},{f(cy - math.cos(t) * r * 0.87)}"
    a.path(d, stroke=INK, stroke_width=max(1.5, r * 0.012), fill="none")
    for i in range(1, 13):
        t = math.radians(i * 30)
        a.text(cx + math.sin(t) * r * 0.64, cy - math.cos(t) * r * 0.64 + r * 0.065, str(i), size=r * 0.19,
               family="monospace", fill=INK, font_weight="bold", text_anchor="middle")
    # hands: 10:00 precisely
    t = math.radians(-60)
    a.line(cx, cy, cx + math.sin(t) * r * 0.46, cy - math.cos(t) * r * 0.46, stroke=INK, stroke_width=r * 0.06,
           stroke_linecap="round")
    a.line(cx, cy + r * 0.1, cx, cy - r * 0.74, stroke=INK, stroke_width=r * 0.038, stroke_linecap="round")
    a.line(cx, cy + r * 0.16, cx, cy - r * 0.8, stroke="#6e2c22", stroke_width=max(1.2, r * 0.01))
    a.circle(cx, cy, r * 0.045, fill=INK)
    # frost on the glass, from the rim inward
    if frost_level > 0:
        a.open("g", clip_path=a.clip(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r * 0.9)}"/>'))
        for i in range(5):
            ang = 200 + i * 72 + a.rng.uniform(-20, 20)
            px, py = cx + math.cos(math.radians(ang)) * r * 0.9, cy + math.sin(math.radians(ang)) * r * 0.9
            kit.frost(a, px, py, ang + 140, ang + 220, r * (0.25 + 0.85 * frost_level) * a.rng.uniform(0.6, 1), n=3, op=0.8)
        a.close()
    a.path(f"M{f(cx - r * 0.62)},{f(cy - r * 0.42)}A{f(r * 0.76)},{f(r * 0.76)} 0 0 1 {f(cx - r * 0.1)},{f(cy - r * 0.75)}",
           fill="none", stroke="#fff", stroke_width=r * 0.03, opacity=0.35, stroke_linecap="round")


def _night(a, n):
    u = (n - 1) / 6
    a.paper("#4a4753", grain=0.3)
    dado = 560 + 190 * u
    wall = a.gradient([(0, "#6f6a70"), (1, "#3f3b47")])
    a.rect(0, 0, 1600, dado, fill=wall)
    a.rect(0, dado, 1600, 900 - dado, fill="#36433b")
    a.rect(0, dado - 5, 1600, 8, fill="#232a26")
    # moonlight through the one high window: a slanted pane on the wall, mullions and all
    sx = 60 + 40 * u
    a.open("g", opacity=0.34 - 0.1 * u)
    for i in range(2):
        for j in range(2):
            x0, y0 = sx + i * 250 + j * 70, 150 + j * 190 + i * 20
            a.poly([(x0, y0), (x0 + 230, y0 + 18), (x0 + 296, y0 + 190), (x0 + 66, y0 + 172)], fill=CREAM)
    a.close()
    # the door: tall and narrow, a steel lever high up and a brass knob added at a man's height
    dx, dw = 1150, 250
    dtop = 40 - 30 * u
    a.rect(dx - 16, dtop - 14, dw + 32, 900, fill="#23292a")
    a.rect(dx, dtop, dw, 900, fill="#3d4a42")
    a.path("".join(f"M{dx + 50 + i * 50},{dtop}V900" for i in range(4)), stroke="#2c3731", stroke_width=2, fill="none")
    lev_y, knob_y = 250 + 150 * u, 640 + 250 * u
    a.rect(dx + dw - 70, lev_y, 56, 10, rx=5, fill="#aeb3b6", stroke=INK, stroke_width=2)
    a.circle(dx + dw - 22, lev_y + 5, 11, fill=STEEL, stroke=INK, stroke_width=2)
    if knob_y < 880:
        a.circle(dx + dw - 30, knob_y, 13, fill="#b8944a", stroke=INK, stroke_width=2)
        a.circle(dx + dw - 34, knob_y - 4, 4, fill="#e6cd8e")
    # the rules card pinned to it
    ry = 380 + 170 * u
    a.rect(dx + 40, ry, 110, 150, fill=kit.PAPER, transform=f"rotate(-2 {dx + 95} {ry + 75})")
    for i in range(3):
        a.line(dx + 54, ry + 34 + i * 38, dx + 136, ry + 34 + i * 38, stroke=INK, stroke_width=2, stroke_dasharray="10 3 6 3")
        a.line(dx + 54, ry + 46 + i * 38, dx + 116, ry + 46 + i * 38, stroke=INK, stroke_width=2, stroke_dasharray="6 3 12 3")
    a.circle(dx + 95, ry + 8, 4, fill=STEEL)
    # the light under the door, and the call coming through as frost along the floor
    a.rect(dx, 884, dw, 16, fill=a.gradient([(0, "#000"), (1, SODIUM)]), opacity=0.9)
    kit.frost(a, dx + dw / 2, 900, 185, 355, 120 + 260 * u, n=4 + n, op=0.7)
    # the bed frame in the foreground, with Jax's knots
    a.rect(0, 800, 760, 100, fill="#141516")
    a.rect(40, 520 + 120 * u, 26, 400, fill="#141516")
    a.circle(53, 516 + 120 * u, 20, fill="#141516")
    knots = max(0, n - 2)
    if knots:
        a.path(a.smooth_d([(66, 700 + 60 * u), (120, 760), (200, 790), (300, 802)]), fill="none", stroke="#6b5a45",
               stroke_width=4)
        for i in range(knots):
            a.circle(110 + i * 38, 752 + i * 10, 8, fill="#6b5a45", stroke="#141516", stroke_width=2)
    # the clock
    r = 150 + 95 * u
    _clock(a, 610 + 30 * u, 290 + 70 * u, r, u)
    kit.stencil(a, 60, 84, f"NIGHT {n}", 46, fill=CREAM)
    kit.typed(a, 60, 124, "10:00 precisely.", size=24, fill=CREAM)
    # the choice, typed
    a.rect(0, 800, 1600, 100, fill="#101112", opacity=0.82)
    if n == 1:
        opts = [("Stop him", True)]
    elif n == 7:
        opts = [("Stay", False), ("Follow", False), ("Fence", False)]
    else:
        opts = [("Stay", n >= 5), ("Go out", False), ("Follow", False)]
    x = 420
    for label, grey in opts:
        kit.typed(a, x, 862, label, size=40, fill=CREAM if not grey else "#6c6a66", ghost=not grey)
        if grey:
            a.line(x - 6, 850, x + len(label) * 24 + 6, 850, stroke="#6c6a66", stroke_width=2)
            kit.typed(a, x, 824, "could", size=18, fill="#6c6a66", ghost=False)
        x += len(label) * 24 + 120
    kit.frost_corners(a, 0.06 + 0.5 * u, op=0.75)
    kit.film(a, 0, 0, 1600, 900, 0.3)
    a.vignette(0.6)


for _n in range(1, 8):
    def _mk(n=_n):
        def fn(a: Art):
            _night(a, n)
        fn.__doc__ = (f"The door at 10:00 on night {n}: the bunk room clock at ten precisely on the moonlit wall, the tall "
                      f"door with its high steel lever and low brass knob, the choice typed along the bottom; the clock "
                      f"hangs nearer and the frost reaches further than the night before.")
        return fn
    asset(G, f"clock-night-{_n}", group="chapters", title=f"The 10:00 clock card, night {_n}", w=1600, h=900,
          row="The 10:00 clock card; the rules card")(_mk())


RULES = ["no food outside what you get in the cafeteria",
         "Do not, under any circumstances, leave this room after 10:00 precisely.",
         "you are not to leave the base under any circumstance, no matter the reason."]


def _wrap(s, n):
    out, line = [], ""
    for w in s.split():
        if len(line) + len(w) + 1 > n:
            out.append(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        out.append(line)
    return out


@asset(G, "rules-card", group="chapters", title="The rules card on the bunk door", w=1600, h=900,
       row="The 10:00 clock card; the rules card")
def rules_card(a: Art):
    """The three rules, verbatim, typed on a card pinned to the green planks of the bunk door, a steel lever
    out of reach above it and a brass knob below; old claw-height scratches cross the paint and frost
    edges the card."""
    a.paper("#43524a", grain=0.3)
    a.path("".join(f"M{x},0V900" for x in range(100, 1600, 200)), stroke="#2c3731", stroke_width=4, fill="none")
    a.path("".join(f"M{x + 6},0V900" for x in range(100, 1600, 200)), stroke="#5d7163", stroke_width=1.5, fill="none")
    kit.hatch_in(a, 0, 0, 1600, 900, angle=90, spacing=13, stroke="#394840", stroke_width=1, opacity=0.6, jitter=5)
    a.poly([(0, 0), (700, 0), (1500, 900), (500, 900)], fill="#fff", opacity=0.06)
    # the lever, far up; the knob
    a.rect(1260, 40, 200, 26, rx=13, fill="#aeb3b6", stroke=INK, stroke_width=4)
    a.circle(1440, 53, 30, fill=STEEL, stroke=INK, stroke_width=4)
    a.poly([(1270, 70), (1470, 70), (1560, 200), (1360, 200)], fill="#000", opacity=0.25, filter=a.blur(8))
    a.circle(1420, 800, 46, fill="#b8944a", stroke=INK, stroke_width=4)
    a.circle(1406, 786, 14, fill="#e6cd8e")
    a.ellipse(1470, 870, 60, 26, fill="#000", opacity=0.3, filter=a.blur(8))
    # the card
    a.open("g", transform="rotate(-1.6 760 450)")
    a.rect(232, 112, 1000, 700, fill="#000", opacity=0.4, filter=a.blur(10))
    a.rect(220, 100, 1000, 700, fill=kit.PAPER)
    a.rect(244, 124, 952, 652, fill="none", stroke=INK, stroke_width=3)
    kit.stencil(a, 280, 204, "RULES", 62)
    kit.typed(a, 1160, 200, "FORM 7-F", size=24, anchor="end")
    a.line(280, 230, 1160, 230, stroke=INK, stroke_width=4)
    y = 300
    for i, rule in enumerate(RULES):
        kit.stencil(a, 280, y + 6, str(i + 1), 44)
        for ln in _wrap(rule, 44):
            kit.typed(a, 360, y, ln, size=30)
            y += 42
        y += 46
    kit.typed(a, 1160, 740, '"You can just call me Sam,"', size=24, anchor="end")
    kit.carbon(a, 260, 140, 900, 600, n=5, op=0.08)
    for tx, ty in ((250, 130), (1190, 130), (250, 770), (1190, 770)):
        a.circle(tx + 3, ty + 4, 11, fill="#000", opacity=0.4)
        a.circle(tx, ty, 11, fill=STEEL, stroke=INK, stroke_width=2)
        a.circle(tx - 3, ty - 3, 3, fill="#fff", opacity=0.7)
    kit.frost_corners(a, 0.3, x=220, y=100, w=1000, h=700)
    a.close()
    # scratches at a height no man reaches
    for sx in (60, 96, 130, 170):
        a.wobble([(sx, 20), (sx + 46, 250)], amp=3, step=20, stroke="#222b26", stroke_width=6, stroke_linecap="round")
        a.wobble([(sx + 4, 24), (sx + 48, 246)], amp=3, step=20, stroke="#8a9a8e", stroke_width=1.2, opacity=0.6)
    kit.film(a, 0, 0, 1600, 900, 0.25)
    a.vignette(0.55)

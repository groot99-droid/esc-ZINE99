"""Dr. Tox: Rise gameplay pictographs. Built by tools/pictographs/build.py."""
import math

from core import H, W, Pic, f, register

G = "dr-tox-rise"

# palette (DESIGN.md section 15): the bible's colour grammar, Part VI, Dr. Tox section 6
TEAL, TEAL2, TEAL3 = "#5E7375", "#8A9A99", "#C4CDCB"     # the world: institutional indifference
AMBER, GOLD = "#D99A2B", "#F2C14E"                        # contained: the cage holding
GREEN = "#7FD957"                                         # loose: the toxin unbound
BLOOD, BLOOD2 = "#1A0B0C", "#4A0F14"                      # his blood
WHITE = "#E9ECEA"                                         # the seventeen years, memory
INK = "#111111"
SKY, FIELD = "#7FA9D6", "#7FA65C"                         # Sky Room's painted walls


# ---- shared helpers ---------------------------------------------------------------------------
def figure_d(x, y, s=1.0, lean=0.0, stride=0.0):
    """A narrow, vertical, contained human silhouette (bible Part VI section 8): long neck, lean
    shoulders, too thin to be dangerous. Returns path data; feet at (x, y)."""
    h = 150 * s
    pts = []
    sh = 16 * s
    pts.append((x - 5 * s + lean, y - h))                    # head left
    pts.append((x + 5 * s + lean, y - h))
    pts.append((x + 6 * s + lean, y - h + 18 * s))
    pts.append((x + 3 * s + lean, y - h + 26 * s))          # long neck
    pts.append((x + sh + lean * 0.8, y - h + 34 * s))       # shoulder
    pts.append((x + sh - 2 * s + lean * 0.5, y - h + 92 * s))
    pts.append((x + 9 * s + lean * 0.4, y - h + 90 * s))
    pts.append((x + 9 * s + stride, y))                     # front leg
    pts.append((x + 2 * s + stride, y))
    pts.append((x, y - 62 * s))
    pts.append((x - 2 * s - stride, y))
    pts.append((x - 9 * s - stride, y))                     # back leg
    pts.append((x - 9 * s + lean * 0.4, y - h + 90 * s))
    pts.append((x - sh + 2 * s + lean * 0.5, y - h + 92 * s))
    pts.append((x - sh + lean * 0.8, y - h + 34 * s))
    pts.append((x - 3 * s + lean, y - h + 26 * s))
    pts.append((x - 6 * s + lean, y - h + 18 * s))
    return "M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts) + "Z"


def ecg(p, x, y, w, h, color, beats=6, sw=3, spike=1.0):
    """A heart trace: flat with sharp spikes, the Pulse meter drawn as a monitor line."""
    pts = [(x, y)]
    step = w / beats
    for i in range(beats):
        bx = x + i * step
        pts += [(bx + step * 0.45, y), (bx + step * 0.5, y - h * spike), (bx + step * 0.56, y + h * 0.4 * spike),
                (bx + step * 0.62, y), (bx + step, y)]
    p.path("M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts), fill="none", stroke=color, stroke_width=sw,
           stroke_linejoin="round")


def small_hand(p, cx, cy, s, rot, stroke, fill="none", sw=4):
    """A child's hand as a few chalk strokes: palm and two raised fingers holding string."""
    a = math.radians(rot)
    ca, sa = math.cos(a), math.sin(a)

    def t(x, y):
        return (cx + (x * ca - y * sa) * s, cy + (x * sa + y * ca) * s)

    palm = [t(-18, 10), t(-20, -10), t(-8, -20), t(10, -18), t(20, -4), t(16, 14), t(0, 20)]
    p.wobble(palm, amp=1.4, step=8, closed=True, stroke=stroke, stroke_width=sw, fill=fill, stroke_linejoin="round")
    for fx in (-10, 8):
        p.wobble([t(fx, -18), t(fx * 1.2, -52)], amp=1.2, step=8, stroke=stroke, stroke_width=sw * 1.6,
                 stroke_linecap="round")
    return t(-12, -52), t(10, -52)


# ---- 2D: Panel run (noir spotted-black brush ink) ----------------------------------------------
@register(G, "panel-run")
def panel_run(p: Pic):
    """Panel run (2D): a break-in drawn as a comic page in spotted black brush ink. Alexander's thin
    upright silhouette crosses a row of panels left to right; the white gutters between them skip
    time, so a guard's torch cone is in a different place in each panel. Two possible next panels
    branch below the current one and an arrow marks the one the player picked. A monitor line along
    the bottom margin is amber where he waited and green-tinged where he drew a dart from the shunt."""
    p.rect(0, 0, W, H, fill="#f4f1ea")
    # page panels: a top row of three, a branching pair below
    panels = [(40, 40, 360, 330), (420, 40, 360, 330), (800, 40, 360, 330), (40, 390, 540, 300), (620, 390, 540, 300)]
    for i, (x, y, w, h) in enumerate(panels):
        cid = p.clip(f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/>')
        p.open("g", clip_path=cid)
        p.rect(x, y, w, h, fill="#e9e6de")
        # spotted blacks: big brushed masses of shadow
        for _ in range(4):
            bx, by = x + p.rng.uniform(-40, w), y + p.rng.uniform(-40, h)
            pts = [(bx + p.rng.uniform(-30, 220), by + p.rng.uniform(-30, 220)) for _ in range(6)]
            p.path(p.smooth_d(pts, closed=True), fill=INK, opacity=0.92)
        # floor line and a doorframe
        p.rect(x, y + h - 60, w, 60, fill=INK)
        p.rect(x + w - 90, y + 40, 60, h - 100, fill="none", stroke=INK, stroke_width=10)
        # the guard's torch cone, moved by the gutter
        gx = x + 40 + (i * 97) % (w - 120)
        cone = [(gx, y + h - 150), (gx + 260, y + h - 230), (gx + 260, y + h - 60)]
        p.poly(cone, fill="#ffffff", opacity=0.85)
        p.path(figure_d(gx - 10, y + h - 60, 0.75), fill=INK)
        p.close()
        p.rect(x, y, w, h, fill="none", stroke=INK, stroke_width=5)
    # Alexander in panels 1 to 3, crossing; in panel 2 caught mid-dart, the shunt line drawn
    for k, (x, y, w, h) in enumerate(panels[:3]):
        ax = x + 60 + k * 70
        p.path(figure_d(ax, y + h - 60, 1.0, lean=4 * k, stride=6), fill=WHITE, stroke=INK, stroke_width=3)
        if k == 1:
            p.path(f"M{ax + 12},{y + h - 150} C{ax + 50},{y + h - 170} {ax + 90},{y + h - 190} {ax + 140},{y + h - 196}",
                   fill="none", stroke=BLOOD2, stroke_width=4)
            p.circle(ax + 140, y + h - 196, 5, fill=BLOOD)
    # branch arrow: from panel 3 to one of the two lower panels
    p.path("M980,370 C980,420 900,420 880,450", fill="none", stroke=AMBER, stroke_width=8, stroke_linecap="round")
    p.poly([(872, 440), (895, 456), (866, 470)], fill=AMBER)
    p.path("M1000,370 C1000,400 1040,410 1060,430", fill="none", stroke=INK, stroke_width=3, stroke_dasharray="8 8")
    # a hand-lettered caption box
    p.rect(60, 400, 230, 44, fill="#fff8e6", stroke=INK, stroke_width=3)
    p.text(74, 430, "THREE MINUTES LATER.", size=20, family="sans-serif", fill=INK, font_weight="bold")
    # the pulse line
    p.rect(40, 710, 1120, 60, fill=INK)
    ecg(p, 60, 742, 700, 20, AMBER, beats=6)
    ecg(p, 760, 742, 380, 26, GREEN, beats=6, spike=1.3)


# ---- 2D: Barrier escort (Franco-Belgian ligne claire) ------------------------------------------
@register(G, "barrier-escort")
def barrier_escort(p: Pic):
    """Barrier escort (2D): the lower-ring supply corridor side-on in clear line, even outlines and
    flat colour with no hatching. A transport rolls left to right under a concrete deck; Aegis, in
    amber-lit light, draws hard-light walls as clean pale bars that turn thrown debris aside. Behind
    two of the walls small people are penned in, each with a name tag on the bar; a Load gauge in the
    corner empties as the walls go up."""
    line = "#1b1b1b"
    sw = 3
    p.rect(0, 0, W, H, fill="#dfe6e4")
    # concrete deck above and floor
    p.rect(0, 0, W, 150, fill="#9fb0ae", stroke=line, stroke_width=sw)
    for x in range(0, W, 200):
        p.rect(x + 80, 150, 40, 470, fill="#b9c6c4", stroke=line, stroke_width=sw)
    p.rect(0, 620, W, 180, fill="#8c9897", stroke=line, stroke_width=sw)
    # shopfronts with sheeting
    for x in (40, 440, 840):
        p.rect(x, 380, 300, 240, fill="#c9b9a0", stroke=line, stroke_width=sw)
        p.rect(x + 30, 420, 240, 200, fill="#e8eeee", stroke=line, stroke_width=sw, opacity=0.9)
    # the transport
    p.rect(560, 470, 360, 150, rx=12, fill="#76807f", stroke=line, stroke_width=sw)
    p.rect(600, 430, 180, 50, fill="#76807f", stroke=line, stroke_width=sw)
    for wx in (620, 860):
        p.circle(wx, 625, 34, fill="#2e3333", stroke=line, stroke_width=sw)
        p.circle(wx, 625, 12, fill="#9aa3a2", stroke=line, stroke_width=sw)
    p.text(820, 560, "RCC", size=26, family="sans-serif", fill="#3a3f3f", font_weight="bold")
    # hard-light walls: clean bars with a thin keyline
    walls = [(330, 300, 22, 320), (980, 330, 22, 290), (180, 420, 22, 200)]
    for x, y, w, h in walls:
        p.rect(x - 8, y - 8, w + 16, h + 16, fill=GOLD, opacity=0.25)
        p.rect(x, y, w, h, fill="#fff6d8", stroke=line, stroke_width=sw)
    # penned people behind two walls, with names on tags
    for (x0, names) in ((210, ["NELL", "TOMAS"]), (1010, ["RUTH"])):
        for i, n in enumerate(names):
            px = x0 + 40 + i * 50
            p.circle(px, 520, 15, fill="#e8c8a8", stroke=line, stroke_width=sw)
            p.rect(px - 16, 536, 32, 80, rx=8, fill="#6f8a9c", stroke=line, stroke_width=sw)
            p.rect(px - 28, 470 - i * 28, 56, 22, fill="#ffffff", stroke=line, stroke_width=2)
            p.text(px - 24, 487 - i * 28, n, size=15, family="sans-serif", fill=line)
    # Aegis drawing a wall: arm raised, glow at the wrist
    ax = 470
    p.circle(ax, 430, 18, fill="#f1d9bf", stroke=line, stroke_width=sw)
    p.rect(ax - 22, 448, 44, 110, rx=10, fill="#e8e1cf", stroke=line, stroke_width=sw)
    p.path(f"M{ax + 18},{460} L{ax + 70},{400}", stroke=line, stroke_width=14, stroke_linecap="round")
    p.path(f"M{ax + 18},{460} L{ax + 70},{400}", stroke="#e8e1cf", stroke_width=8, stroke_linecap="round")
    p.circle(ax + 72, 398, 12, fill=GOLD, stroke=line, stroke_width=2)
    p.rect(ax - 20, 556, 16, 64, fill="#5a5f5f", stroke=line, stroke_width=sw)
    p.rect(ax + 4, 556, 16, 64, fill="#5a5f5f", stroke=line, stroke_width=sw)
    # thrown debris glancing off a wall
    for dx, dy in ((280, 250), (300, 330), (950, 270)):
        p.poly([(dx, dy), (dx + 24, dy + 6), (dx + 14, dy + 26)], fill="#7a6a58", stroke=line, stroke_width=2)
    # Load gauge
    p.rect(40, 180, 200, 34, fill="#ffffff", stroke=line, stroke_width=sw)
    p.rect(43, 183, 70, 28, fill=GOLD)
    p.text(40, 240, "LOAD", size=20, family="sans-serif", fill=line, font_weight="bold")


# ---- 1D: The Cage (comic colourist's flats) ----------------------------------------------------
@register(G, "cage")
def cage(p: Pic):
    """The Cage (1D): titration drawn as a colourist's flats page, every area filled flat to its line
    with no shading. A dropper over a stoppered flask lets fall counted drops of an invented amber
    reagent; inside the flask an amber band holds against a sickly green front pushing up from below.
    A lead shield wraps half the flask. To the right a bar marks the endpoint window: stop the drip
    there. Amber and green are never at equal weight on the page."""
    line = INK
    p.rect(0, 0, W, H, fill="#cfd6d4")
    p.rect(0, 560, W, 240, fill="#9aa7a5", stroke=line, stroke_width=4)
    # burette stand
    p.rect(300, 60, 18, 520, fill="#7c8786", stroke=line, stroke_width=4)
    p.rect(220, 560, 260, 24, fill="#7c8786", stroke=line, stroke_width=4)
    p.rect(318, 120, 180, 16, fill="#7c8786", stroke=line, stroke_width=4)
    # dropper column
    p.rect(470, 60, 40, 240, fill=WHITE, stroke=line, stroke_width=4)
    p.rect(474, 140, 32, 156, fill=AMBER)
    p.poly([(470, 300), (510, 300), (494, 340), (486, 340)], fill=WHITE, stroke=line, stroke_width=4)
    for i, y in enumerate((365, 395)):
        p.path(f"M490,{y} q-9,14 0,20 q9,-6 0,-20Z", fill=AMBER, stroke=line, stroke_width=3)
    # tick marks on the dropper (invented marks, no units)
    for i in range(9):
        p.line(470, 80 + i * 24, 486, 80 + i * 24, stroke=line, stroke_width=3)
    # the flask, flats only
    flask = [(420, 430), (420, 470), (330, 600), (650, 600), (560, 470), (560, 430)]
    p.poly(flask, fill=WHITE, stroke=line, stroke_width=5)
    fid = p.clip('<polygon points="420,430 420,470 330,600 650,600 560,470 560,430"/>')
    p.open("g", clip_path=fid)
    p.rect(300, 560, 380, 50, fill=GREEN)
    p.path("M300,562 Q380,546 450,564 T680,558 L680,470 L300,470Z", fill=AMBER)
    p.rect(300, 430, 380, 42, fill=WHITE)
    p.close()
    p.poly(flask, fill="none", stroke=line, stroke_width=5)
    p.rect(410, 410, 160, 26, fill="#555", stroke=line, stroke_width=4)
    # lead shield half wrap
    p.path("M560,470 L650,600 L700,600 L700,440 L560,440Z", fill="#6b6f70", stroke=line, stroke_width=5)
    for y in (470, 500, 530, 560):
        p.line(600, y, 690, y, stroke=line, stroke_width=3)
    # endpoint window bar
    p.rect(800, 120, 80, 440, fill=WHITE, stroke=line, stroke_width=5)
    p.rect(804, 124, 72, 110, fill=GREEN)
    p.rect(804, 234, 72, 70, fill=GOLD)
    p.rect(804, 304, 72, 252, fill=AMBER)
    p.rect(790, 228, 100, 82, fill="none", stroke=line, stroke_width=6)
    p.text(910, 280, "ENDPOINT", size=30, family="sans-serif", fill=line, font_weight="bold")
    p.text(910, 470, "HOT", size=26, family="sans-serif", fill=line)
    p.text(910, 180, "LEAKY", size=26, family="sans-serif", fill=line)
    # drop counter
    p.rect(60, 80, 180, 110, fill="#fff8e6", stroke=line, stroke_width=4)
    p.text(80, 125, "DROPS", size=24, family="sans-serif", fill=line, font_weight="bold")
    p.text(80, 172, "14 / A9", size=34, family="monospace", fill=line)


# ---- 1D: Cat's Cradle (chalk and poster paint on the painted sky) -------------------------------
@register(G, "cats-cradle")
def cats_cradle(p: Pic):
    """Cat's Cradle (1D): a string figure held between four pairs of small hands, drawn in chalk over
    the flat poster-paint sky and green fields of Sky Room's walls, in a flat clinical white light.
    One crossing of the string is lifted by a fifth finger: the move the player is making. A row of
    four chalk names along the bottom shows whose hands are whose."""
    p.rect(0, 0, W, H, fill=SKY)
    p.rect(0, 560, W, 240, fill=FIELD)
    # poster-paint clouds, flat, brushy edges
    for cx, cy in ((200, 140), (620, 90), (980, 170)):
        p.path(p.smooth_d([(cx - 120, cy + 20), (cx - 70, cy - 30), (cx, cy - 40), (cx + 80, cy - 20), (cx + 120, cy + 20)], closed=True),
               fill="#f3f5f2", opacity=0.95)
    chalk = "#f7f7f2"
    # four pairs of hands round the figure
    centres = [(300, 380, 90), (900, 380, -90), (600, 160, 180), (600, 640, 0)]
    anchors = []
    for cx, cy, rot in centres:
        for off in (-70, 70):
            a = math.radians(rot)
            hx = cx + off * math.cos(a)
            hy = cy + off * math.sin(a)
            fa, fb = small_hand(p, hx, hy, 1.15, rot, chalk, sw=4)
            anchors.append(fa)
            anchors.append(fb)
    # the string: a cradle of crossings between finger tips
    cx, cy = 600, 400
    pts = anchors
    order = [0, 5, 2, 7, 4, 9, 6, 11, 8, 13, 10, 15, 12, 1, 14, 3, 0]
    for a, b in zip(order, order[1:]):
        (x1, y1), (x2, y2) = pts[a], pts[b]
        mx, my = (x1 + x2) / 2 + (cx - (x1 + x2) / 2) * 0.35, (y1 + y2) / 2 + (cy - (y1 + y2) / 2) * 0.35
        p.path(p.wobble_d([(x1, y1), (mx, my), (x2, y2)], amp=1.5, step=12), fill="none", stroke=chalk,
               stroke_width=3.5, stroke_linecap="round", opacity=0.95)
    # the lifted crossing
    p.circle(cx + 30, cy - 20, 26, fill="none", stroke=GOLD, stroke_width=4, stroke_dasharray="6 6")
    p.wobble([(cx + 30, cy - 20), (cx + 70, cy - 80)], amp=1.2, step=8, stroke=chalk, stroke_width=7, stroke_linecap="round")
    for i, n in enumerate(("REESE", "CALLY", "CARMY", "ROLAN")):
        p.text(90 + i * 270, 760, n, size=34, family="sans-serif", fill=chalk, letter_spacing=4)


# ---- 1D: The Window (fumetti photo-comic) ------------------------------------------------------
@register(G, "window")
def window(p: Pic):
    """The Window (1D): a fumetti page of posed photo panels in grey photographic tone with typed
    captions, showing a guardhouse at three times of night. Down the right margin a typed guard rota
    gives each guard's rounds as bars on a clock; the player has laid his route's segments into the
    gap between two rounds, and the slack he found is boxed in amber."""
    p.rect(0, 0, W, H, fill="#f2efe6")
    photos = [(40, 40, 330, 250), (390, 40, 330, 250), (40, 310, 680, 280)]
    for i, (x, y, w, h) in enumerate(photos):
        g = p.gradient([(0, "#4d5354"), (0.6, "#8e9796"), (1, "#c7cdcb")], 0, 0, 1, 1)
        p.rect(x, y, w, h, fill=g, stroke="#222", stroke_width=3)
        p.halftone(x, y, w, h, lambda px, py, y0=y, h0=h: 0.25 + 0.5 * (py - y0) / h0, cell=13, angle=20, fill="#222", opacity=0.35)
        # the guardhouse: a box with a lit window, a fence line
        p.rect(x + w * 0.55, y + h * 0.35, w * 0.3, h * 0.45, fill="#3a3f40")
        p.rect(x + w * 0.6, y + h * 0.45, w * 0.1, h * 0.1, fill="#f4e7c5" if i != 1 else "#6c7272")
        p.line(x, y + h * 0.82, x + w, y + h * 0.78, stroke="#222", stroke_width=3)
        for k in range(int(w / 26)):
            p.line(x + k * 26, y + h * 0.82 - k * 0.1, x + k * 26, y + h * 0.65, stroke="#222", stroke_width=2)
        # a posed figure (the guard) in silhouette
        gx = x + w * (0.2 + 0.25 * i)
        p.path(figure_d(gx, y + h * 0.82, 0.6), fill="#1d1f20")
        # typed caption
        cap = ["02:10. ROUND ONE.", "02:31. THE HOUSE IS DARK.", "02:44. ROUND TWO. THE DOG."][i]
        p.rect(x + 10, y + 10, len(cap) * 12 + 20, 32, fill="#fffdf4", stroke="#222", stroke_width=2)
        p.text(x + 20, y + 33, cap, size=18, family="monospace", fill="#222")
    # rota in the margin: two guards' rounds as bars on a time strip
    rx, ry = 760, 40
    p.rect(rx, ry, 400, 550, fill="#fffdf4", stroke="#222", stroke_width=3)
    p.text(rx + 20, ry + 40, "ROTA  NIGHT 3", size=22, family="monospace", fill="#222")
    for t in range(7):
        y = ry + 80 + t * 66
        p.line(rx + 20, y, rx + 380, y, stroke="#999", stroke_width=1)
        p.text(rx + 22, y - 6, f"02:{10 + t * 7:02d}", size=14, family="monospace", fill="#555")
    for col, spans in ((rx + 130, [(0, 1.4), (3.1, 4.6)]), (rx + 230, [(1.2, 2.2), (4.4, 5.9)])):
        for a, b in spans:
            p.rect(col, ry + 80 + a * 66, 60, (b - a) * 66, fill="#555", stroke="#222", stroke_width=2)
    # his route segments laid in the gap
    gy0, gy1 = ry + 80 + 2.2 * 66, ry + 80 + 3.1 * 66
    p.rect(rx + 110, gy0, 220, gy1 - gy0, fill="none", stroke=AMBER, stroke_width=6)
    for k, seg in enumerate((0.25, 0.3, 0.2)):
        y = gy0 + 6 + sum((0.25, 0.3, 0.2)[:k]) * 66
        p.rect(rx + 320, y, 26, seg * 66 - 4, fill=AMBER, stroke="#222", stroke_width=2)
    p.text(rx + 20, ry + 530, "SLACK 9 S", size=24, family="monospace", fill="#222", font_weight="bold")
    p.rect(40, 610, 1120, 150, fill="#fffdf4", stroke="#222", stroke_width=3)
    p.text(64, 660, "HE HAS NINE SECONDS BETWEEN THE HOUSE GOING DARK", size=24, family="monospace", fill="#222")
    p.text(64, 700, "AND THE SECOND ROUND. THE DOG IS NOT ON THE ROTA.", size=24, family="monospace", fill="#222")


# ---- 1D: Fiche (scratchboard) ------------------------------------------------------------------
@register(G, "fiche")
def fiche(p: Pic):
    """Fiche (1D): a microfiche sheet drawn as scratchboard, white lines cut from a black ground: a
    grid of tiny index frames, each a hatched card, with one frame lifted into the reader's hood and
    magnified to show a file card numbered CMXCIX. A cursor of cut lines circles a second frame where
    a child's detail (a bicycle with one training wheel) was matched."""
    p.rect(0, 0, W, H, fill="#050505")
    cut = "#f4f1e8"
    # fiche grid
    gx, gy, cw, ch = 40, 60, 46, 34
    for j in range(14):
        for i in range(12):
            x, y = gx + i * (cw + 6), gy + j * (ch + 8)
            p.rect(x, y, cw, ch, fill="none", stroke=cut, stroke_width=1.2, opacity=0.75)
            n = 2 + (i * 7 + j * 3) % 4
            for k in range(n):
                p.line(x + 5, y + 7 + k * 6, x + cw - 6 - p.rng.uniform(0, 18), y + 7 + k * 6, stroke=cut,
                       stroke_width=1, opacity=0.8)
    # a matched frame
    mx, my = gx + 4 * (cw + 6), gy + 9 * (ch + 8)
    p.circle(mx + cw / 2, my + ch / 2, 40, fill="none", stroke=cut, stroke_width=3)
    p.circle(mx + cw / 2, my + ch / 2, 48, fill="none", stroke=cut, stroke_width=1.5, stroke_dasharray="4 5")
    # the reader's hood and the magnified card
    hx, hy, hw, hh = 690, 70, 470, 600
    p.rect(hx, hy, hw, hh, rx=26, fill="#0b0b0b", stroke=cut, stroke_width=3)
    p.rect(hx + 30, hy + 40, hw - 60, 380, fill="#000", stroke=cut, stroke_width=2)
    # scratchboard hatching: radial cut lines brightening the screen centre
    cid = p.clip(f'<rect x="{hx + 30}" y="{hy + 40}" width="{hw - 60}" height="380"/>')
    p.hatch(hx + 30, hy + 40, hw - 60, 380, angle=12, spacing=7, clip=cid, stroke=cut, stroke_width=0.8, opacity=0.35)
    p.rect(hx + 70, hy + 90, hw - 140, 280, fill="#000", stroke=cut, stroke_width=3)
    p.text(hx + 92, hy + 140, "SUBJECT  CMXCIX", size=32, family="monospace", fill=cut, letter_spacing=2)
    p.text(hx + 92, hy + 180, "999 OF 1,000", size=24, family="monospace", fill=cut)
    for k in range(6):
        p.line(hx + 92, hy + 220 + k * 22, hx + hw - 100 - p.rng.uniform(0, 120), hy + 220 + k * 22, stroke=cut, stroke_width=2)
    # focus knob and carrier
    p.circle(hx + 90, hy + 500, 34, fill="#000", stroke=cut, stroke_width=3)
    for a in range(0, 360, 30):
        r = math.radians(a)
        p.line(hx + 90 + 20 * math.cos(r), hy + 500 + 20 * math.sin(r), hx + 90 + 32 * math.cos(r), hy + 500 + 32 * math.sin(r), stroke=cut, stroke_width=2)
    p.rect(hx + 160, hy + 480, 270, 50, fill="#000", stroke=cut, stroke_width=2)
    p.hatch(hx + 160, hy + 480, 270, 50, angle=90, spacing=6, clip=p.clip(f'<rect x="{hx + 160}" y="{hy + 480}" width="270" height="50"/>'), stroke=cut, stroke_width=0.8, opacity=0.6)
    p.text(40, 740, "NAMES READ  41", size=26, family="monospace", fill=cut)


# ---- 1D: Aftermath (manga screentone, evidence tents) ------------------------------------------
@register(G, "aftermath")
def aftermath(p: Pic):
    """Aftermath (1D): a room after the Toxin State, drawn in manga screentone: grey dot fields for
    the floor and walls, a wide empty frame. Numbered evidence tents stand beside each trace (a torn
    strap, a dented locker, a long scrape, a dropped torch, a hardened black scab flake). Along the
    bottom a strip of empty numbered slots waits for the player to put the traces in the order the
    body made them; three are placed."""
    p.rect(0, 0, W, H, fill="#ffffff")
    # screentone wall and floor
    p.halftone(0, 0, W, 300, lambda x, y: 0.55, cell=15, angle=45, fill="#1a1a1a")
    p.rect(0, 300, W, 6, fill="#1a1a1a")
    p.halftone(0, 306, W, 314, lambda x, y: 0.15 + 0.35 * (y - 306) / 314, cell=15, angle=45, fill="#1a1a1a")
    # a door frame and a dented locker drawn in clean line over tone
    p.rect(60, 80, 160, 226, fill="#ffffff", stroke="#000", stroke_width=4)
    p.rect(900, 120, 120, 186, fill="#ffffff", stroke="#000", stroke_width=4)
    p.path("M930,170 Q960,200 940,240", fill="none", stroke="#000", stroke_width=4)
    p.line(960, 120, 960, 306, stroke="#000", stroke_width=2)
    # traces on the floor
    p.path("M260,520 C420,500 560,560 760,530", fill="none", stroke="#000", stroke_width=5)
    p.path("M262,526 C420,506 560,566 758,536", fill="none", stroke="#000", stroke_width=1.5)
    p.rect(520, 420, 60, 14, rx=6, fill="#000", transform="rotate(-20 550 427)")
    p.path("M820,560 l26,-8 l10,16 l-22,14Z", fill="#000")
    p.circle(380, 430, 12, fill="#000")
    p.line(390, 432, 440, 420, stroke="#000", stroke_width=6)
    # numbered tents
    tents = [(250, 470, 1), (420, 400, 2), (540, 480, 3), (760, 500, 4), (900, 330, 5), (870, 590, 6)]
    for x, y, n in tents:
        p.poly([(x, y), (x + 44, y), (x + 22, y - 46)], fill=GOLD, stroke="#000", stroke_width=3)
        p.text(x + 14, y - 10, str(n), size=22, family="sans-serif", fill="#000", font_weight="bold")
    # ordering strip
    p.rect(40, 640, 1120, 130, fill="#ffffff", stroke="#000", stroke_width=4)
    for i in range(6):
        x = 70 + i * 180
        p.rect(x, 665, 150, 80, fill="#ffffff", stroke="#000", stroke_width=3, stroke_dasharray=None if i < 3 else "8 6")
        if i < 3:
            n = (4, 1, 2)[i]
            p.poly([(x + 52, 730), (x + 98, 730), (x + 75, 684)], fill=GOLD, stroke="#000", stroke_width=3)
            p.text(x + 69, 722, str(n), size=20, family="sans-serif", fill="#000", font_weight="bold")
    # the one green note: a scab flake's sheen, small, never at equal weight
    p.circle(834, 562, 3, fill=GREEN)

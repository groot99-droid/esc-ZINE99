"""The stacks: twelve shelf bays in one fine line with no single true perspective, and four mote sprites."""
import math

from artkit import Art, f, sibling

K = sibling(__file__, "_kit")
ROW = "Stacks tile set (12) and mote sprites (4)"
PAPER, LINE = "#F2ECDC", "#2F2A22"
S = 400
SHELVES = [60, 128, 196, 264, 332]
MOTE = "#B8861C"


def L(w=1.3, **kw):
    d = dict(stroke=LINE, stroke_width=w, fill="none", stroke_linecap="round", stroke_linejoin="round")
    d.update(kw)
    return d


def spines(a, x0, x1, y_base, h, lean=0.06, flip=False):
    """Book spines standing on a shelf between x0 and x1 (hanging from it when flip)."""
    d = []
    x = x0 + a.rng.uniform(1, 6)
    sgn = 1 if flip else -1
    while x < x1 - 3:
        hh = h * a.rng.uniform(0.55, 0.93)
        w = a.rng.uniform(5, 13)
        if a.rng.random() < lean and x + w + h * .3 < x1:
            d.append(f"M{f(x)},{f(y_base)}l{f(h * .28)},{f(sgn * hh)}l{f(w)},{f(-sgn * 2)}L{f(x + w)},{f(y_base)}")
            x += h * .3
        else:
            d.append(f"M{f(x)},{f(y_base)}v{f(sgn * hh)}h{f(w)}V{f(y_base)}")
            if a.rng.random() < .3:
                d.append(f"M{f(x)},{f(y_base + sgn * hh * .25)}h{f(w)}")
        x += w + (a.rng.uniform(4, 12) if a.rng.random() < .06 else 0)
    return "".join(d)


def bay(a, holes=()):
    """The common bay: shelves that meet their neighbours at both edges, a plank floor, books everywhere but the holes."""
    a.paper(PAPER, grain=0.16)
    d = []
    for k, y in enumerate(SHELVES):
        prev = SHELVES[k - 1] if k else 4
        segs = [(0, S)]
        for (hx0, hy0, hx1, hy1) in holes:
            if hy0 < y and hy1 > prev:
                new = []
                for (s0, s1) in segs:
                    if hx0 > s0:
                        new.append((s0, min(s1, hx0)))
                    if hx1 < s1:
                        new.append((max(s0, hx1), s1))
                segs = [sg for sg in new if sg[1] - sg[0] > 6]
        for (s0, s1) in segs:
            d.append(spines(a, s0, s1, y, y - prev - 6))
    a.path("".join(d), **L(1.0, opacity=.9))
    sh = "".join(f"M0,{y}H{S}M0,{y + 5}H{S}" for y in SHELVES)
    a.path(sh + f"M0,4H{S}", **L(1.3))
    # floor planks, running to a vanishing point far to the right
    fl = "".join(f"M0,{f(340 + k * k * 2.4)}L{S},{f(338 + k * k * 1.9)}" for k in range(1, 6))
    a.path(fl + "".join(f"M{x},337L{x - 26},{S}" for x in range(40, 440, 72)), **L(.9, opacity=.7))
    for (hx0, hy0, hx1, hy1) in holes:
        a.rect(hx0, hy0, hx1 - hx0, hy1 - hy0, fill=PAPER)


def ladder_d(xa, ya, xb, yb, w, rungs=10):
    dx, dy = xb - xa, yb - ya
    Lg = math.hypot(dx, dy)
    nx, ny = -dy / Lg * w / 2, dx / Lg * w / 2
    q = [f"M{f(xa + nx)},{f(ya + ny)}L{f(xb + nx)},{f(yb + ny)}M{f(xa - nx)},{f(ya - ny)}L{f(xb - nx)},{f(yb - ny)}"]
    for k in range(1, rungs):
        t = k / rungs
        cx, cy = xa + dx * t, ya + dy * t
        q.append(f"M{f(cx + nx)},{f(cy + ny)}L{f(cx - nx)},{f(cy - ny)}")
    return "".join(q)


def stream(a, pts, n=120, spread=10, rmax=2.6, op=.85, col=MOTE):
    d = [[], []]
    for _ in range(n):
        t = a.rng.random()
        seg = t * (len(pts) - 1)
        i = min(int(seg), len(pts) - 2)
        u = seg - i
        x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u + a.rng.gauss(0, spread)
        y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u + a.rng.gauss(0, spread * .6)
        d[a.rng.random() < .3].append(f"M{x:.0f},{y:.0f}h0")
    a.path("".join(d[0]), stroke=col, stroke_width=rmax, stroke_linecap="round", fill="none", opacity=op)
    if d[1]:
        a.path("".join(d[1]), stroke=col, stroke_width=rmax * 1.8, stroke_linecap="round", fill="none", opacity=op)


def depth(a, x0, y0, x1, y1, vx, vy, rings=7, r=.72, books=True):
    """An opening that shows shelves running away to its own vanishing point."""
    d = []
    fr = []
    for i in range(rings):
        s = r ** i
        fr.append((vx + (x0 - vx) * s, vy + (y0 - vy) * s, vx + (x1 - vx) * s, vy + (y1 - vy) * s))
        if i:
            d.append(f"M{f(fr[i][0])},{f(fr[i][1])}H{f(fr[i][2])}V{f(fr[i][3])}H{f(fr[i][0])}Z")
    s = r ** (rings - 1)
    for t in (0, .25, .5, .75, 1):
        for xs in (x0, x1):
            ya = y0 + (y1 - y0) * t
            d.append(f"M{f(xs)},{f(ya)}L{f(vx + (xs - vx) * s)},{f(vy + (ya - vy) * s)}")
    a.path("".join(d), **L(1.1))
    if books:
        b = []
        for i in range(rings - 1):
            fa, fb = fr[i], fr[i + 1]
            for side in (0, 2):
                for k in range(4):
                    for j in range(1, max(2, int(7 * r ** i))):
                        t = j / max(2, int(7 * r ** i))
                        xs = fa[side] + (fb[side] - fa[side]) * t
                        ya = fa[1] + (fa[3] - fa[1]) * k / 4
                        yb = fa[1] + (fa[3] - fa[1]) * (k + 1) / 4
                        ya2 = fb[1] + (fb[3] - fb[1]) * k / 4
                        yb2 = fb[1] + (fb[3] - fb[1]) * (k + 1) / 4
                        ya, yb = ya + (ya2 - ya) * t, yb + (yb2 - yb) * t
                        b.append(f"M{f(xs)},{f(yb)}V{f(yb - (yb - ya) * a.rng.uniform(.5, .9))}")
        a.path("".join(b), **L(.8, opacity=.8))
    a.rect(x0, y0, x1 - x0, y1 - y0, **L(1.6))
    return fr


# ---- the twelve bays -----------------------------------------------------------------------------
def t_plain(a):
    bay(a, holes=[(250, 136, 330, 258)])
    depth(a, 250, 136, 330, 258, 316, 170, rings=6)
    stream(a, [(0, 300), (140, 292), (280, 300), (400, 290)], n=70, spread=9)


def t_calling(a):
    bay(a, holes=[(150, 68, 250, 190)])
    a.path("M150,128H250M150,133H250", **L())
    K.glow(a, 200, 100, 80, K.GOLD, .7)
    for k in range(20):
        t = 2 * math.pi * k / 20
        a.line(200 + 22 * math.cos(t), 100 + 22 * math.sin(t), 200 + (40 + 8 * (k % 2)) * math.cos(t),
               100 + (40 + 8 * (k % 2)) * math.sin(t), stroke="#9A6D12", stroke_width=1)
    a.rect(188, 82, 24, 46, fill=K.GOLD, stroke=LINE, stroke_width=1.4)
    a.path("M188,94h24M188,116h24", **L(1))
    a.path(spines(a, 152, 184, 128, 50) + spines(a, 216, 248, 128, 50) + spines(a, 152, 248, 190, 48), **L(1))
    stream(a, [(0, 300), (90, 280), (160, 200), (196, 120)], n=170, spread=9)


def t_ladder_up(a):
    bay(a, holes=[(160, 0, 250, 340)])
    # the ceiling opens on shelves seen from below, upside down
    fr = depth(a, 160, 0, 250, 124, 205, -200, rings=5, r=.8, books=False)
    a.path(spines(a, 162, 248, 66, 50, flip=True) + "M160,66H250", **L(1))
    a.path(ladder_d(205, 338, 205, -10, 44, 17), **L(1.5))
    a.path("M160,124V340M250,124V340", **L(1.6))
    a.path("M196,60 l9,-14 l9,14", **L(1.6))
    # (the junction tiles carry only the passing stream: in play the live motes say which way is right)
    stream(a, [(0, 300), (160, 300), (400, 292)], n=60, spread=8)


def t_ladder_down(a):
    bay(a, holes=[(130, 338, 290, 400)])
    a.path("M150,340 L270,340 L290,372 L130,372Z", fill=PAPER, **{k: v for k, v in L(1.5).items() if k != "fill"})
    for k in range(1, 6):
        s = 0.82 ** k
        a.path(f"M{f(210 - 60 * s)},{f(372 + 7 * k)}L{f(210 + 60 * s)},{f(372 + 7 * k)}", **L(1))
    a.path(ladder_d(207, 318, 214, 400, 34, 6), **L(1.5))
    a.path("M130,372 L170,400 M290,372 L250,400", **L(1))
    a.path("M200,392 l10,8 l10,-8", **L(1.6))
    stream(a, [(0, 296), (200, 286), (400, 292)], n=60, spread=8)


def t_arch(a):
    bay(a, holes=[(120, 100, 290, 340)])
    a.path("M120,340 V180 A85,80 0 0,1 290,180 V340", fill=PAPER, **{k: v for k, v in L(1.8).items() if k != "fill"})
    cl = a.clip('<path d="M120,340 V180 A85,80 0 0,1 290,180 V340Z"/>')
    a.open("g", clip_path=cl)
    depth(a, 110, 96, 300, 344, 236, 230, rings=8, r=.74)
    a.close()
    a.path("M120,340 V180 A85,80 0 0,1 290,180 V340 M108,340 V178 A97,92 0 0,1 302,178 V340", **L(1.6))
    a.path("M205,88 l-8,-10 h16Z", **L(1.2))
    stream(a, [(0, 300), (130, 296), (270, 300), (400, 292)], n=60, spread=8)


def t_rolling(a):
    bay(a)
    a.path("M0,30H400", **L(2.2))
    a.path("M0,34H400", **L(.8))
    a.path(ladder_d(214, 34, 150, 340, 46, 13), fill="none", stroke=PAPER, stroke_width=7)
    a.path(ladder_d(214, 34, 150, 340, 46, 13), **L(1.6))
    for x in (126, 172):
        a.circle(x, 346, 8, fill=PAPER, **{k: v for k, v in L(1.5).items() if k != "fill"})
        a.circle(x, 346, 2, fill=LINE)
    for x in (196, 232):
        a.circle(x, 28, 6, fill=PAPER, **{k: v for k, v in L(1.5).items() if k != "fill"})
    a.path("M250,60h40M256,74h52M250,88h34 M190,300h30M196,314h42", **L(1.1))
    a.path("M318,74 l-8,-5 v10Z", fill=LINE)
    stream(a, [(0, 300), (200, 292), (400, 296)], n=70, spread=8)


def t_ceiling(a):
    a.paper(PAPER, grain=0.16)
    # the same shelves, but the upper half hangs from the ceiling and a stair climbs along the wall, sideways
    d = spines(a, 0, S, 4, 54, flip=True) + spines(a, 0, S, 66, 56, flip=True) + spines(a, 0, S, 264, 62) + spines(a, 0, S, 332, 62)
    a.path(d, **L(1.0, opacity=.9))
    a.path(f"M0,4H{S}M0,60H{S}M0,65H{S}M0,128H{S}M0,264H{S}M0,269H{S}M0,332H{S}M0,337H{S}M0,196H{S}", **L(1.3))
    st = []
    x, y = 20, 258
    for k in range(9):
        st.append(f"M{x},{y}h28v-14")
        x += 28
        y -= 14
    a.path("".join(st) + "M20,258 L272,132", **L(1.4))
    st = []
    x, y = 380, 134
    for k in range(8):
        st.append(f"M{x},{y}h-26v14")
        x -= 26
        y += 14
    a.path("".join(st), **L(1.4, opacity=.85))
    a.path("M288,108 q8,-12 16,0 q2,10 -8,12 q-10,-2 -8,-12Z M286,122 q-6,30 -10,66 h40 q-4,-36 -10,-66 "
           "M288,134 q14,10 30,2 l2,-10", **L(1.3))
    fl = "".join(f"M0,{f(340 + k * k * 2.4)}L{S},{f(338 + k * k * 1.9)}" for k in range(1, 6))
    a.path(fl, **L(.9, opacity=.7))
    stream(a, [(0, 300), (200, 296), (400, 300)], n=60, spread=8)


def t_lamp(a):
    bay(a, holes=[(150, 204, 250, 264)])
    a.path("M150,264H250M150,269H250", **L())
    K.glow(a, 200, 226, 120, K.GOLD_L, .75)
    a.path("M184,262 h32 l-4,-8 h-24Z M196,254 v-10 M186,244 h28 l-6,-24 h-16Z", fill=PAPER,
           **{k: v for k, v in L(1.5).items() if k != "fill"})
    a.path("M200,238 C194,230 200,226 200,218 C206,226 208,232 200,238Z", fill=K.GOLD, stroke=LINE, stroke_width=1)
    for k in range(3):                      # three wicks a visit: one burning, two waiting
        a.path(f"M{162 + k * 10},262 v-12", **L(2 if k else 1.2))
    # the pin: this aisle is never rebuilt
    a.path("M300,150 l14,-14 M307,143 l10,10 l-16,16 l-10,-10Z", fill=PAPER, **{k: v for k, v in L(1.5).items() if k != "fill"})
    a.line(296, 164, 286, 174, **L(1.5))
    stream(a, [(0, 300), (200, 292), (400, 296)], n=70, spread=8)


def t_ribbon(a):
    bay(a, holes=[(40, 136, 110, 340), (290, 0, 360, 196)])
    depth(a, 40, 136, 110, 340, 64, 250, rings=5, r=.76)
    a.path(ladder_d(325, 196, 325, -6, 40, 10), **L(1.5))
    a.path("M290,0V196H360V0", **L(1.6))
    # Maudric's ribbon, hung where the quicker way turns
    a.path("M196,70 C206,120 186,170 200,224 L188,246 L186,222 C172,170 190,120 180,70Z", fill=K.SAGE, stroke=LINE,
           stroke_width=1.4, stroke_linejoin="round")
    a.path("M184,90 q8,4 12,0 M186,130 q6,4 10,0", **L(.9))
    a.circle(188, 66, 5, fill=PAPER, **{k: v for k, v in L(1.4).items() if k != "fill"})
    a.path("M230,300 h50 M270,292 l12,8 l-12,8", **L(1.6))
    stream(a, [(0, 300), (200, 296), (400, 290)], n=80, spread=8)


def t_sand(a):
    bay(a)
    drift = "M0,372 C60,300 130,310 190,340 C240,290 310,286 400,330 V400 H0Z"
    a.path(drift, fill=PAPER, **{k: v for k, v in L(1.5).items() if k != "fill"})
    cl = a.clip(f'<path d="{drift}"/>')
    a.open("g", clip_path=cl)
    K.stip(a, 0, 290, 400, 110, n=520, r=(.5, 1.5), fill=LINE, opacity=.75,
           density=lambda x, y: .25 + .75 * ((y - 290) / 110))
    a.path("M30,360 q60,-30 130,-6 M210,346 q70,-40 170,0", **L(.9, opacity=.6))
    a.close()
    # books going under
    a.path("M96,330 l36,-12 l10,28 M300,318 l30,10 l-8,26", **L(1.2))
    K.stip(a, 150, 200, 110, 130, n=60, r=(.5, 1.3), fill=LINE, opacity=.7, density=lambda x, y: 1 - abs(x - 205) / 55)
    stream(a, [(0, 280), (200, 276), (400, 280)], n=70, spread=8)


def t_frost(a):
    bay(a)
    a.rect(0, 0, S, S, fill=K.FROST, opacity=.5)
    cl = a.clip(f'<rect x="0" y="0" width="{S}" height="{S}"/>')
    a.open("g", clip_path=cl)
    K.glow(a, 150, 250, 190, "#F6E6B8", .9)
    a.close()
    a.circle(150, 250, 150, **L(1, stroke_dasharray="3 8", opacity=.7))
    # frost on the shelf edges, thickest where nothing calls
    for y in SHELVES:
        K.stip(a, 0, y - 6, S, 14, n=170, r=(.6, 1.9), fill="#F4F8FC", opacity=.95,
               density=lambda x, yy: min(1, .15 + x / 380))
        d = "".join(f"M{x},{y + 5}v{f(a.rng.uniform(4, 16) * (x / 400))}" for x in range(150, 400, 9))
        a.path(d, stroke="#F4F8FC", stroke_width=1.6, stroke_linecap="round", fill="none", opacity=.9)
    # the candle
    a.path("M144,338 v-34 h12 v34Z", fill=PAPER, **{k: v for k, v in L(1.4).items() if k != "fill"})
    a.path("M150,302 C144,294 150,290 150,280 C156,290 158,296 150,302Z", fill=K.GOLD, stroke=LINE, stroke_width=1)


def t_chair(a):
    bay(a, holes=[(110, 150, 320, 340)])
    P = dict(fill=PAPER, stroke=LINE, stroke_linejoin="round", stroke_linecap="round")
    # the reading chair, side-on, and the one sitting in it with the cup
    a.path("M142,338 V200 C142,170 182,166 190,188 L196,290 H250 V338 H240 V300 H152 V338Z", stroke_width=1.7, **P)
    a.path("M152,262 H236 C250,262 250,280 236,280 H152", **L(1.5))
    a.path("M150,206 C160,214 176,214 186,206 M150,236 h36", **L(.9, opacity=.7))
    K.shape(a, [(190, 216), (216, 210), (230, 238), (236, 276), (280, 278), (290, 338), (252, 338), (246, 300), (198, 298),
                (186, 252)], PAPER, line=LINE, lw=1.6)
    a.path("M216,240 q8,28 2,56 M244,282 q10,26 8,54 M262,282 q10,26 12,54", **L(1, opacity=.75))
    a.path("M250,338 h48 q0,-9 -14,-9", stroke_width=1.5, **P)
    K.shape(a, [(196, 190), (206, 172), (226, 172), (236, 188), (242, 200), (234, 204), (234, 212), (220, 218), (204, 212)],
            PAPER, line=LINE, lw=1.6)
    a.path("M206,196 L174,170 L212,186Z", stroke_width=1.4, **P)                     # the long ear
    a.path("M204,176 C190,186 188,208 196,226", **L(1.3))                          # hair tied back
    a.path("M226,190 h5 M230,208 q-5,2 -8,0", **L(1.3))
    K.limb(a, [(208, 228), (220, 258), (262, 246)], 9, PAPER, line=LINE, lw=1.5)
    a.path("M262,236 h22 l-3,16 h-16Z", stroke_width=1.4, **P)
    a.path("M284,240 q9,0 6,9 q-2,3 -7,2", **L(1.3))
    a.path("M268,230 q-4,-8 2,-14 M276,228 q-4,-8 2,-16", **L(.9, opacity=.7))
    a.path("M296,300 h22 M306,300 V338 M298,338 h16", **L(1.5))                    # the side table and the book on it
    a.path("M294,296 h24 v-7 h-24Z", stroke_width=1.2, **P)
    K.stip(a, 286, 300, 44, 40, n=36, r=(.6, 1.5), fill=MOTE, opacity=.9, density=lambda x, y: 1 - abs(x - 306) / 24)
    stream(a, [(0, 300), (100, 300), (400, 296)], n=40, spread=7, op=.5)


TILES = [
    ("plain", "A plain bay", t_plain, "A bay of shelves with one opening where the books run away to a vanishing point of their own."),
    ("calling", "The calling book", t_calling, "The calling book glowing gold in an alcove, the mote stream thick and rising to it."),
    ("ladder-up", "Junction: ladder up", t_ladder_up, "A ladder climbing through the ceiling into shelves seen from below, the mote stream passing its foot."),
    ("ladder-down", "Junction: ladder down", t_ladder_down, "A hatch in the plank floor and a ladder down a shaft with its own vanishing point."),
    ("arch", "Junction: aisle on", t_arch, "An arch through the shelves onto a second aisle that recedes the wrong way, the mote stream passing its sill."),
    ("rolling-ladder", "The rolling ladder", t_rolling, "A rolling ladder on its rail, wheels on the planks, pushed along with momentum."),
    ("ceiling", "Shelves on the ceiling", t_ceiling, "Shelves hanging from the ceiling with their books upside down, and two stairs that climb each other sideways."),
    ("lamp", "A reading lamp, lit", t_lamp, "A lit reading lamp with two wicks left beside it and a pin in the shelf: this aisle will not be rebuilt."),
    ("ribbon", "Maudric's ribbon", t_ribbon, "An old sage bookmark ribbon hung at a junction of three ways, marking the quicker way past the books he read."),
    ("sand-drift", "A sand drift", t_sand, "Sand drifted across the planks from the leaking book, two volumes going under."),
    ("frost", "Frost on the shelf edges", t_frost, "The unlit shelf: no motes, a candle's two-metre radius, and frost thickening on the shelf edges where nothing calls."),
    ("chair", "Passing the reading chair", t_chair, "The reading chair side-on with Elaris sitting in it holding the cup, seen from the aisle behind him."),
]
for _id, _t, _fn, _doc in TILES:
    K.reg(f"stacks-{_id}", "backdrops", f"Stacks tile: {_t}", S, S, ROW,
          f"The stacks, drawn in one fine line. {_doc}", _fn)


# ---- motes ---------------------------------------------------------------------------------------
def mote_ground(a):
    a.paper(PAPER, grain=0.16)
    a.circle(80, 80, 66, **L(.9, stroke_dasharray="2 6", opacity=.5))


def m_sand(a):
    mote_ground(a)
    K.glow(a, 80, 80, 60, K.GOLD, .35)
    for _ in range(26):
        t, q = a.rng.uniform(0, 6.28), a.rng.gauss(0, 24)
        x, y, r = 80 + q * math.cos(t) + 6, 80 + q * math.sin(t) * .7, a.rng.uniform(2.5, 7)
        a.path(K.blob_d(a, x, y, r, r * .85, n=6, jit=.25), fill=MOTE, stroke=LINE, stroke_width=.9)
    a.path("M20,104 q20,-10 34,-2 M24,116 q14,-6 24,-2", **L(1))


def m_rain(a):
    mote_ground(a)
    for x, y, s in ((58, 62, 1.2), (96, 50, .8), (106, 96, 1.0), (62, 112, .7), (84, 84, .55)):
        a.path(f"M{x},{y - 22 * s} C{x + 4 * s},{y - 8 * s} {x + 12 * s},{y} {x + 12 * s},{y + 8 * s} "
               f"A{12 * s},{12 * s} 0 1,1 {x - 12 * s},{y + 8 * s} C{x - 12 * s},{y} {x - 4 * s},{y - 8 * s} {x},{y - 22 * s}Z",
               fill="#C9D3DE", stroke=LINE, stroke_width=1.3)
        a.path(f"M{f(x - 6 * s)},{f(y + 8 * s)} a{f(6 * s)},{f(6 * s)} 0 0,0 {f(5 * s)},{f(6 * s)}", **L(1, stroke=PAPER))
    a.path("M40,30 l-6,16 M124,40 l-6,16 M130,112 l-5,14", **L(1))


def m_ink(a):
    mote_ground(a)
    rough = a.roughen(5, .09)
    for x, y, r in ((70, 78, 20), (104, 60, 9), (100, 104, 12), (52, 110, 6), (120, 88, 4)):
        a.path(K.blob_d(a, x, y, r, r * .8, n=9, jit=.4), fill="#231A14", filter=rough)
    K.pens(a, [[(70, 78), (40, 50), (30, 40)], [(100, 104), (122, 126), (132, 130)], [(104, 60), (120, 40)]], w=4,
           color="#231A14", taper=(.05, .7))
    K.stip(a, 30, 30, 100, 100, n=24, r=(1, 2.4), fill="#231A14", opacity=.9)
    a.path("M62,70 q6,-6 12,0", **L(1.2, stroke=PAPER))


def m_frost(a):
    mote_ground(a)
    a.circle(80, 80, 52, fill=K.FROST, opacity=.82)
    for cx, cy, r in ((80, 80, 34), (112, 54, 12), (50, 108, 10)):
        d = []
        for k in range(6):
            t = math.pi * k / 3
            c, s = math.cos(t), math.sin(t)
            d.append(f"M{f(cx)},{f(cy)}L{f(cx + r * c)},{f(cy + r * s)}")
            for u in (.5, .75):
                for sg in (1, -1):
                    t2 = t + sg * 1.0
                    d.append(f"M{f(cx + r * u * c)},{f(cy + r * u * s)}l{f(r * .26 * math.cos(t2))},{f(r * .26 * math.sin(t2))}")
        a.path("".join(d), stroke="#E6EEF8", stroke_width=1.6 if r > 20 else 1.1, fill="none", stroke_linecap="round")
    K.stip(a, 34, 34, 92, 92, n=30, r=(.6, 1.6), fill="#E6EEF8", opacity=.9)


MOTES = [
    ("sand", "Sand motes", m_sand, "Sand motes: a drifting cluster of gold grains, the call of the sand book."),
    ("rain", "Raindrop motes", m_rain, "Raindrop motes: five pale drops falling aslant, the call of the dripping book from Hollin."),
    ("ink", "Ink flecks", m_ink, "Ink flecks: splats and thrown tails of wet sepia ink, the call of the Procession, which cling to the wrong shelves."),
    ("frost", "Frost, where nothing calls", m_frost, "Frost crystals on blue-black: the mote of the unlit shelf, which marks the absence to follow."),
]
for _id, _t, _fn, _doc in MOTES:
    K.reg(f"mote-{_id}", "pieces", _t, 160, 160, ROW, _doc, _fn)

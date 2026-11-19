"""UI ornaments (tabs, margin brackets, seals, dial faces, bar ends) and the audit's eight stamps."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, INK, ARCH, PENCIL, BAR, SEAL, PAPER = kit.G, kit.INK, kit.ARCH, kit.PENCIL, kit.BAR, kit.SEAL, kit.PAPER
ROW = "UI ornaments"


def arc_text(a: Art, cx, cy, r, s, size, color, start=-90.0, step=None, family="serif", flip=False, **kw):
    """Letters set one by one around a circle, centred on the angle `start` (degrees, 0 = east)."""
    step = (size * 0.66 / r) * 180 / math.pi if step is None else step
    a0 = start - step * (len(s) - 1) / 2
    for i, ch in enumerate(s if not flip else s[::-1]):
        if ch == " ":
            continue
        ang = a0 + i * step
        rot = ang + (90 if not flip else -90)
        x, y = cx + r * math.cos(math.radians(ang)), cy + r * math.sin(math.radians(ang))
        a.text(x, y, ch, size=size, family=family, fill=color, text_anchor="middle",
               transform=f"rotate({f(rot)} {f(x)} {f(y)})", **kw)


def worn(a: Art, x, y, w, h, n=260, color=PAPER):
    """Where the pad was dry: paper showing through the stamp."""
    a.stipple(x, y, w, h, n=n, r=(0.7, 2.4), fill=color, opacity=0.8)


# ---- tabs -------------------------------------------------------------------------------------
def _icon(a: Art, kind, x, y):
    if kind == "Entries":      # a nib
        kit.curve(a, [(x - 16, y + 16), (x + 2, y - 4), (x + 16, y - 16), (x + 10, y + 2), (x - 16, y + 16)], w=2.2)
        a.line(x - 16, y + 16, x + 4, y - 4, stroke=INK, stroke_width=1.4)
        a.circle(x + 5, y - 5, 2.4, fill=INK)
    elif kind == "Dossier":    # a node ring
        a.circle(x, y, 13, fill="none", stroke=INK, stroke_width=2.4)
        a.circle(x, y, 4, fill=SEAL)
        for t in range(0, 360, 60):
            c, s = math.cos(math.radians(t)), math.sin(math.radians(t))
            a.line(x + c * 16, y + s * 16, x + c * 21, y + s * 21, stroke=INK, stroke_width=1.6)
    elif kind == "Specimens":  # a leaf
        kit.wash(a, [(x - 16, y + 14), (x - 6, y - 10), (x + 16, y - 16), (x + 10, y + 6)], kit.MOSS, 0.4, 1.5)
        kit.curve(a, [(x - 16, y + 14), (x - 6, y - 10), (x + 16, y - 16), (x + 10, y + 6)], w=2, closed=True)
        a.line(x - 16, y + 14, x + 14, y - 14, stroke=INK, stroke_width=1.3)
    elif kind == "Songs":      # two neumes on a staff
        kit.staff(a, x - 20, y - 12, 40, 8, sw=1.2)
        a.rect(x - 12, y - 2, 9, 9, fill=INK)
        a.rect(x + 2, y - 10, 9, 9, fill=INK)
        a.line(x + 11, y - 10, x + 11, y + 8, stroke=INK, stroke_width=1.6)
    elif kind == "Hypotheses":  # a damped wave
        pts = [(x - 20 + k * 2, y - 14 * math.exp(-k / 12) * math.sin(k / 2.2)) for k in range(21)]
        kit.curve(a, pts, w=2.2)
        a.line(x - 22, y, x + 22, y, stroke=PENCIL, stroke_width=1)
    else:                       # Margin: the small hand's bracket
        a.path(f"M{x + 6},{y - 16} l-10,2 l6,28 l10,-2", stroke=ARCH, stroke_width=2, fill="none")
        a.path(f"M{x + 2},{y - 2} l14,-3 M{x + 4},{y + 6} l10,-2", stroke=ARCH, stroke_width=1.3, fill="none")


TABS = [("Entries", kit.OCHRE), ("Dossier", SEAL), ("Specimens", kit.MOSS), ("Songs", kit.VIOLET),
        ("Hypotheses", kit.CYAN), ("Margin", ARCH)]
for _i, (_name, _col) in enumerate(TABS):
    def _tab(a: Art, name=_name, col=_col, i=_i):
        r = a.rng
        top = [(8, 104), (10 + r.uniform(0, 4), 26), (22, 12), (236, 10 + r.uniform(-2, 2)), (250, 24), (252, 104)]
        d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in top) + "Z"
        cp = a.clip(f'<path d="{d}"/>')
        a.path(d, fill="#000", opacity=0.25, transform="translate(3,3)", filter=a.blur(3))
        a.open("g", clip_path=cp)
        kit.page(a, x=0, y=0, w=260, h=110)
        a.rect(0, 0, 260, 26, fill=col, opacity=0.5)
        a.rect(0, 24, 260, 4, fill=col, opacity=0.5)
        a.rect(0, 92, 260, 20, fill="#7a5a2e", opacity=0.18)
        a.close()
        kit.ink(a, top, amp=0.7, w=2.4)
        _icon(a, name, 46, 62)
        kit.lira(a, 82, 72, name, 28 if len(name) < 10 else 25)
        kit.label(a, 216, 22, f"{i + 1}", 12)
    _tab.__doc__ = (f"A journal tab cut from laid paper with a band of wash along its top edge, lettered "
                    f"{_name} in Lira's hand beside a small ink sign for that section.")
    asset(G, f"tab-{_name.lower()}", group="ui", title=f"Journal tab: {_name}", w=260, h=110, row=ROW)(_tab)


# ---- margin brackets --------------------------------------------------------------------------
@asset(G, "bracket-ink", group="ui", title="Margin bracket: Lira's brace", w=200, h=480, row=ROW)
def bracket_ink(a: Art):
    """Lira's own margin brace in iron-gall ink, pressed hard at the point, with her delta beside it."""
    kit.page(a)
    pts = [(128, 30), (96, 44), (92, 120), (90, 200), (60, 240), (90, 280), (92, 360), (96, 436), (128, 450)]
    a.path(a.smooth_d(pts), fill="none", stroke=INK, stroke_width=4.2, stroke_linecap="round", filter=a.roughen(1.5, 0.3))
    a.path(a.smooth_d(pts[2:7]), fill="none", stroke=INK, stroke_width=6.5, stroke_linecap="round", opacity=0.8)
    kit.blot(a, 58, 240, 4)
    kit.lira_fig(a, "Δ", 20, 250, 26)
    for y in range(60, 440, 38):
        a.line(140, y, 196, y, stroke=PENCIL, stroke_width=0.7, opacity=0.5)


@asset(G, "bracket-small-hand", group="ui", title="Margin bracket: the small hand", w=200, h=480, row=ROW)
def bracket_small(a: Art):
    """The other hand's margin bracket: a thin blue-black rule leaning left, a caret, and a tick."""
    kit.page(a)
    for y in range(60, 440, 38):
        a.line(4, y, 80, y, stroke=PENCIL, stroke_width=0.7, opacity=0.5)
    _lines(a, range(52, 440, 38), x0=-40, x1=30)
    a.path("M150,60 L112,66 L96,410 L134,416", stroke=ARCH, stroke_width=1.8, fill="none", stroke_linejoin="round")
    a.path("M96,236 l-16,8 l16,10", stroke=ARCH, stroke_width=1.5, fill="none")
    a.path("M120,150 l6,10 l14,-24", stroke=ARCH, stroke_width=1.5, fill="none")
    kit.small_hand(a, 112, 300, "re-sample", 18)
    a.circle(142, 420, 2, fill=ARCH)


@asset(G, "bracket-pencil", group="ui", title="Margin bracket: the circling pencil", w=200, h=480, row=ROW)
def bracket_pencil(a: Art):
    """Lira's pencil going twice round a margin note she did not write, and her question under it."""
    r = a.rng
    kit.page(a)
    for k in range(2):
        pts = [(100 + (72 + k * 5) * math.cos(t) + r.uniform(-4, 4), 200 + (150 + k * 8) * math.sin(t) + r.uniform(-4, 4))
               for t in [i * math.pi / 8 + 0.3 * k for i in range(17)]]
        a.path(a.smooth_d(pts), fill="none", stroke=PENCIL, stroke_width=2.2, opacity=0.85, stroke_linecap="round")
    for i in range(5):
        a.path(f"M66,{130 + i * 34} q30,{r.uniform(-6, 6):.0f} {r.uniform(50, 70):.0f},0", stroke=ARCH,
               stroke_width=1.4, fill="none", transform=f"skewX(14) translate(-30 0)")
    kit.lira(a, 22, 420, "Who wrote this?", 23, PENCIL)


# ---- seals ------------------------------------------------------------------------------------
def emblem(a: Art, cx, cy, s, color, sw=3.0):
    """The Continuum's mark: a peak over a ringed core, twelve nodes around."""
    a.poly([(cx - 0.52 * s, cy + 0.34 * s), (cx, cy - 0.56 * s), (cx + 0.52 * s, cy + 0.34 * s)], fill="none",
           stroke=color, stroke_width=sw, stroke_linejoin="round")
    a.circle(cx, cy + 0.08 * s, 0.2 * s, fill="none", stroke=color, stroke_width=sw)
    a.circle(cx, cy + 0.08 * s, 0.07 * s, fill=color)
    for k in range(12):
        t = math.radians(k * 30 - 90)
        a.circle(cx + 0.8 * s * math.cos(t), cy + 0.8 * s * math.sin(t), 0.05 * s, fill=color)


@asset(G, "seal-continuum-wax", group="ui", title="Seal: the Continuum in wax", w=300, h=300, row=ROW)
def seal_wax(a: Art):
    """A seal-red wax seal pressed on laid paper, its edge run and thumbed, the Continuum's peak and
    ringed core standing in relief."""
    r = a.rng
    kit.page(a)
    pts = [(150 + 112 * (1 + r.uniform(-0.1, 0.12)) * math.cos(t), 150 + 112 * (1 + r.uniform(-0.1, 0.12)) * math.sin(t))
           for t in [i * math.pi / 9 for i in range(18)]]
    d = a.smooth_d(pts, closed=True)
    a.path(d, fill="#000", opacity=0.3, transform="translate(5,7)", filter=a.blur(5))
    a.path(d, fill=a.radial([(0, "#d2434b", 1), (0.6, SEAL, 1), (1, "#6e1017", 1)], 0.4, 0.35, 0.75))
    a.circle(150, 150, 84, fill="#8f1820", opacity=0.55)
    a.circle(150, 150, 84, fill="none", stroke="#e8707a", stroke_width=2, opacity=0.6)
    a.circle(150, 150, 78, fill="none", stroke="#5c0c12", stroke_width=2)
    emblem(a, 151, 152, 62, "#5c0c12", 5)
    emblem(a, 149, 150, 62, "#e0606a", 2.4)
    a.path(a.smooth_d([(70, 96), (96, 66), (136, 50)]), stroke="#fff", stroke_width=7, opacity=0.25, fill="none",
           stroke_linecap="round")


@asset(G, "seal-press-imprint", group="ui", title="Seal: the press imprint", w=300, h=300, row=ROW)
def seal_imprint(a: Art):
    """The record vault's seal press printed in red on a page, a little off square and short of ink
    on one side, the Continuum's name set around the ring."""
    kit.page(a)
    for y in range(40, 290, 34):
        a.line(0, y, 300, y, stroke=PENCIL, stroke_width=0.6, opacity=0.4)
    a.open("g", transform="rotate(-11 150 150)", filter=a.roughen(2.5, 0.5))
    a.circle(150, 150, 118, fill="none", stroke=SEAL, stroke_width=6)
    a.circle(150, 150, 84, fill="none", stroke=SEAL, stroke_width=2.5)
    arc_text(a, 150, 150, 93, "THE CONTINUUM", 26, SEAL, start=-90, font_weight="bold")
    arc_text(a, 150, 150, 110, "RECORD VAULT", 22, SEAL, start=90, flip=True, font_weight="bold")
    emblem(a, 150, 150, 56, SEAL, 3.5)
    a.close()
    worn(a, 150, 30, 130, 240, 420)


@asset(G, "seal-broken", group="ui", title="Seal: broken", w=300, h=300, row=ROW)
def seal_broken(a: Art):
    """A wax seal snapped across a letter's fold, the two halves a finger's width apart, crumbs of
    red on the paper between them."""
    r = a.rng
    kit.page(a)
    a.poly([(0, 120), (300, 168), (300, 300), (0, 300)], fill="#e6dabd")
    a.line(0, 120, 300, 168, stroke=INK, stroke_width=1.2, opacity=0.6)
    for sg, off, rot in ((-1, -14, -6), (1, 16, 5)):
        cp = a.clip(f'<rect x="{0 if sg < 0 else 150}" y="0" width="150" height="300"/>')
        a.open("g", transform=f"translate({off} {sg * 6}) rotate({rot} 150 150)")
        a.open("g", clip_path=cp)
        a.circle(155, 157, 96, fill="#000", opacity=0.25, filter=a.blur(5))
        a.circle(150, 150, 96, fill=a.radial([(0, "#d2434b", 1), (0.65, SEAL, 1), (1, "#6e1017", 1)], 0.4, 0.35, 0.75))
        a.circle(150, 150, 70, fill="none", stroke="#5c0c12", stroke_width=2.5)
        emblem(a, 150, 150, 52, "#5c0c12", 4)
        a.close()
        edge = [(150, 52)] + [(150 + r.uniform(-7, 7), y) for y in range(70, 240, 18)] + [(150, 248)]
        a.path("M" + " L".join(f"{f(x)},{f(y)}" for x, y in edge), stroke="#f0a0a6" if sg < 0 else "#4a080d",
               stroke_width=3, fill="none")
        a.close()
    for _ in range(14):
        a.circle(150 + r.uniform(-16, 18), r.uniform(70, 240), r.uniform(1, 3.5), fill=SEAL)


# ---- dial faces -------------------------------------------------------------------------------
def _dial(a: Art, face="#f6efdc"):
    kit.page(a)
    a.circle(164, 166, 140, fill="#000", opacity=0.25, filter=a.blur(6))
    a.circle(160, 160, 142, fill="#8a6a3a", stroke=INK, stroke_width=2.6)
    a.circle(160, 160, 128, fill=face, stroke=INK, stroke_width=2)
    a.hatch(20, 20, 280, 280, angle=40, spacing=5, stroke=INK, stroke_width=0.7, opacity=0.35,
            clip=a.clip('<path fill-rule="evenodd" d="M160,18a142,142 0 1,0 0.1,0Z M160,32a128,128 0 1,1 -0.1,0Z"/>'))


def _ticks(a: Art, a0, a1, n, minor, r1=122, L=16):
    d = []
    for i in range(n * minor + 1):
        t = math.radians(a0 + (a1 - a0) * i / (n * minor))
        ll = L if i % minor == 0 else L * 0.45
        d.append(f"M{f(160 + r1 * math.cos(t))},{f(160 + r1 * math.sin(t))}L{f(160 + (r1 - ll) * math.cos(t))},{f(160 + (r1 - ll) * math.sin(t))}")
    a.path("".join(d), stroke=INK, stroke_width=1.8, fill="none")


def _needle(a: Art, ang, L=104, color=INK):
    t = math.radians(ang)
    c, s = math.cos(t), math.sin(t)
    a.poly([(160 + L * c, 160 + L * s), (160 - 7 * s - 20 * c, 160 + 7 * c - 20 * s), (160 + 7 * s - 20 * c, 160 - 7 * c - 20 * s)],
           fill=color)
    a.circle(160, 160, 9, fill="#8a6a3a", stroke=INK, stroke_width=2)


def _arc(a: Art, r, a0, a1, **kw):
    t0, t1 = math.radians(a0), math.radians(a1)
    a.path(f"M{f(160 + r * math.cos(t0))},{f(160 + r * math.sin(t0))}A{r},{r} 0 {1 if a1 - a0 > 180 else 0},1 "
           f"{f(160 + r * math.cos(t1))},{f(160 + r * math.sin(t1))}", fill="none", **kw)


@asset(G, "dial-afu", group="ui", title="Dial face: AFU needle", w=320, h=320, row=ROW)
def dial_afu(a: Art):
    """The belt meter's flux dial: a quarter-circle scale from 0 to 1.0 with the band above 0.7
    washed violet, the needle resting at 0.52."""
    _dial(a)
    _arc(a, 100, 150 + 240 * 0.7, 390, stroke=kit.VIOLET, stroke_width=20, opacity=0.55)
    _ticks(a, 150, 390, 10, 5)
    for i in range(0, 11, 2):
        t = math.radians(150 + 24 * i)
        kit.lira_fig(a, f"{i / 10:.1f}", 160 + 84 * math.cos(t) - 15, 160 + 84 * math.sin(t) + 8, 13, w=1.6)
    kit.label(a, 132, 232, "AFU", 22)
    _needle(a, 150 + 240 * 0.52, color=SEAL)


@asset(G, "dial-altimeter", group="ui", title="Dial face: altimeter", w=320, h=320, row=ROW)
def dial_alt(a: Art):
    """The altimeter: a full-circle scale in kilometres to five, thin-air bands marked at 2 and
    3.2 km in ink of two strengths, the needle a little past 2.8."""
    _dial(a)
    _arc(a, 104, -90 + 72 * 2, -90 + 72 * 3.2, stroke=kit.ICE, stroke_width=14, opacity=0.8)
    _arc(a, 104, -90 + 72 * 3.2, -90 + 72 * 4.99, stroke=kit.VIOLET, stroke_width=14, opacity=0.45)
    _ticks(a, -90, 270, 5, 10)
    for i in range(5):
        t = math.radians(-90 + 72 * i)
        kit.lira_fig(a, str(i), 160 + 82 * math.cos(t) - 6, 160 + 82 * math.sin(t) + 9, 18, w=2)
    kit.label(a, 144, 214, "km", 18)
    a.path("M132,128 l28,-34 l28,34 M146,112 l14,10 l12,-8", stroke=INK, stroke_width=1.6, fill="none")
    _needle(a, -90 + 72 * 2.83)


@asset(G, "dial-clock", group="ui", title="Dial face: clock", w=320, h=320, row=ROW)
def dial_clock(a: Art):
    """The belt clock at twelve minutes past three in the night, its face dark, a seven-second ring
    for the mountain's period let into the lower half."""
    _dial(a, "#2a2622")
    d = []
    for i in range(60):
        t = math.radians(i * 6)
        L = 16 if i % 5 == 0 else 6
        d.append(f"M{f(160 + 122 * math.cos(t))},{f(160 + 122 * math.sin(t))}L{f(160 + (122 - L) * math.cos(t))},{f(160 + (122 - L) * math.sin(t))}")
    a.path("".join(d), stroke=kit.BONE, stroke_width=1.8, fill="none")
    for h in (12, 3, 6, 9):
        t = math.radians(h * 30 - 90)
        x1 = kit.stroke_d(a, str(h), 0, 0, 18, aspect=0.7)[1]
        kit.stroke_text(a, str(h), 160 + 90 * math.cos(t) - x1 / 2 + 3, 160 + 90 * math.sin(t) + 9, 18, color=kit.BONE, aspect=0.7)
    a.circle(160, 212, 30, fill="none", stroke=kit.CYAN, stroke_width=1.6)
    for k in range(7):
        t = math.radians(k * 360 / 7 - 90)
        a.circle(160 + 30 * math.cos(t), 212 + 30 * math.sin(t), 3.2, fill=kit.CYAN if k < 3 else "#2a2622", stroke=kit.CYAN,
                 stroke_width=1.2)
    kit.label(a, 149, 218, "7 s", 13, kit.CYAN)
    for ang, L, w in ((3.2 * 30 - 90, 60, 7), (12 * 6 - 90, 98, 4)):
        t = math.radians(ang)
        a.line(160 - 14 * math.cos(t), 160 - 14 * math.sin(t), 160 + L * math.cos(t), 160 + L * math.sin(t),
               stroke=kit.BONE, stroke_width=w, stroke_linecap="round")
    a.circle(160, 160, 7, fill=SEAL)


@asset(G, "dial-sampling", group="ui", title="Dial face: sampling dial", w=320, h=320, row=ROW)
def dial_sampling(a: Art):
    """The photodiode array's sampling dial: a knurled knob with three stops, turned to the finest,
    0.5 s, where a blue tick has been added beside the engraved mark."""
    _dial(a)
    stops = [(-150, "2 s"), (-90, "1 s"), (-30, "0.5 s")]
    _arc(a, 104, -150, -30, stroke=INK, stroke_width=2)
    for ang, lab in stops:
        t = math.radians(ang)
        a.circle(160 + 104 * math.cos(t), 160 + 104 * math.sin(t), 7, fill=PAPER, stroke=INK, stroke_width=2.2)
    kit.lira_fig(a, "2", 50, 150, 17, w=1.9)
    kit.lira_fig(a, "1", 154, 92, 17, w=1.9)
    kit.lira_fig(a, "0.5", 232, 150, 17, w=1.9)
    t = math.radians(-30)
    a.circle(160 + 104 * math.cos(t), 160 + 104 * math.sin(t), 7, fill=INK)
    a.path("M262,84 l5,9 l11,-19", stroke=ARCH, stroke_width=1.6, fill="none")
    pts = [(160 + (58 + (4 if k % 2 else 0)) * math.cos(math.radians(k * 7.5)), 160 + (58 + (4 if k % 2 else 0)) * math.sin(math.radians(k * 7.5)))
           for k in range(48)]
    a.poly(pts, fill="#5a4630", stroke=INK, stroke_width=1.6)
    a.circle(160, 160, 46, fill=a.radial([(0, "#a88656", 1), (1, "#5a4630", 1)], 0.38, 0.35, 0.8), stroke=INK, stroke_width=1.6)
    a.line(160, 160, 160 + 56 * math.cos(t), 160 + 56 * math.sin(t), stroke=kit.BONE, stroke_width=5, stroke_linecap="round")
    kit.label(a, 96, 250, "SAMPLE EVERY", 15)


# ---- bar ends ---------------------------------------------------------------------------------
def _lines(a: Art, ys, x0=20, x1=580, skip=None):
    r = a.rng
    d = []
    for y in ys:
        x = x0
        while x < x1:
            wl = r.uniform(20, 70)
            if not (skip and skip[0] < x + wl and x < skip[1] and abs(y - skip[2]) < 6):
                pts = [(x + k * 6, y + r.uniform(-7, 3) * (k % 2)) for k in range(int(wl / 6) + 1)]
                d.append(a.smooth_d(pts))
            x += wl + 12
    a.path(" ".join(d), fill="none", stroke=INK, stroke_width=2, stroke_linecap="round", opacity=0.85)


@asset(G, "bar-surgical", group="ui", title="Bar: surgical", w=600, h=120, row=ROW)
def bar_surgical(a: Art):
    """A surgical redaction across a line of the journal: ruled to length, blue showing under the
    black along both edges, the ends feathering into the paper's fibres."""
    kit.page(a)
    _lines(a, (28, 100))
    _lines(a, (64,), skip=(120, 470, 64))
    kit.bar(a, 124, 48, 340, 26)


@asset(G, "bar-clumsy", group="ui", title="Bar: clumsy", w=600, h=120, row=ROW)
def bar_clumsy(a: Art):
    """A clumsy redaction: one loaded brush dragged across a line and running dry at the far end,
    the tops of the covered letters still showing."""
    kit.page(a)
    _lines(a, (26, 62, 100))
    kit.bar(a, 96, 42, 380, 38, kind="clumsy")


@asset(G, "bar-gauged", group="ui", title="Bar: under the gauge", w=600, h=120, row=ROW)
def bar_gauged(a: Art):
    """A surgical bar with the steel bar gauge laid along it and Lira's note of its length, 41 mm."""
    kit.page(a)
    _lines(a, (22,))
    kit.bar(a, 110, 34, 246, 24)
    a.rect(84, 64, 420, 30, fill="#c9ced0", stroke=INK, stroke_width=1.6)
    a.rect(84, 64, 420, 8, fill="#fff", opacity=0.4)
    d = []
    for k in range(66):
        x = 110 + k * 6
        d.append(f"M{x},64v{14 if k % 10 == 0 else (10 if k % 5 == 0 else 6)}")
    a.path("".join(d), stroke=BAR, stroke_width=1, fill="none")
    for k in range(0, 7):
        kit.label(a, 106 + k * 60, 90, str(k * 10), 10, BAR)
    a.path("M356,28V70", stroke=SEAL, stroke_width=1.2, fill="none")
    kit.lira_fig(a, "41", 520, 60, 22)
    kit.lira(a, 558, 60, "mm", 22)
    kit.lira(a, 514, 96, "I measured it.", 15)


@asset(G, "bar-lifted", group="ui", title="Bar: lifted", w=600, h=120, row=ROW)
def bar_lifted(a: Art):
    """A bar lifted from the page like a strip of tape, hinged at its left end, with the line it
    hid readable beneath: the Peaks are, and a dash."""
    kit.page(a)
    _lines(a, (24,))
    _lines(a, (70,), x0=20, x1=110)
    a.path("M120,52H470M120,80H470", stroke=ARCH, stroke_width=1.1, opacity=0.8, fill="none")
    a.rect(122, 53, 346, 26, fill=BAR, opacity=0.08)
    kit.lira(a, 150, 76, "the Peaks are—", 30)
    a.poly([(126, 60), (470, 28), (470, 54), (126, 86)], fill="#000", opacity=0.2, filter=a.blur(5))
    kit.bar(a, 124, 20, 340, 26, rot=-7)


# ---- the eight stamps -------------------------------------------------------------------------
def _stamp_ground(a: Art):
    kit.page(a)
    r = a.rng
    for y in range(34, 290, 36):
        a.line(0, y + 10, 280, y + 10, stroke=PENCIL, stroke_width=0.6, opacity=0.4)
    _lines(a, range(34, 290, 36), x0=-10, x1=290)


def _word(a: Art, s, y, size, color, length=None, **kw):
    kw.setdefault("font_weight", "bold")
    if length:
        kw.update(textLength=length, lengthAdjust="spacingAndGlyphs")
    a.text(140, y, s, size=size, family=kw.pop("family", "sans-serif"), fill=color, text_anchor="middle", **kw)


def stamp_hers(a):
    a.open("g", transform="rotate(-6 140 140)", filter=a.roughen(2, 0.6))
    a.ellipse(140, 140, 112, 70, fill="none", stroke=INK, stroke_width=5)
    a.ellipse(140, 140, 100, 58, fill="none", stroke=INK, stroke_width=1.5)
    _word(a, "HERS", 158, 56, INK, 116, family="serif", font_style="italic")
    kit.stroke_text(a, "7", 46, 152, 24, color=INK, cross7=True, slant=0.2, w=3)
    kit.stroke_text(a, "Δ", 214, 152, 24, color=INK, w=3)
    a.close()
    worn(a, 30, 70, 220, 140, 200)


def stamp_forged(a):
    a.open("g", transform="rotate(-13 140 140)", filter=a.roughen(2.5, 0.5))
    a.rect(22, 90, 236, 100, fill="none", stroke=SEAL, stroke_width=7)
    a.rect(34, 102, 212, 76, fill="none", stroke=SEAL, stroke_width=2)
    _word(a, "FORGED", 162, 60, SEAL, 190)
    a.close()
    worn(a, 20, 60, 240, 160, 380)


def stamp_other(a):
    a.open("g", transform="rotate(5 140 140)", filter=a.roughen(1.6, 0.6))
    a.path("M40,84 H240 L226,196 H26 Z", fill="none", stroke=ARCH, stroke_width=4, stroke_linejoin="round")
    a.text(0, 0, "OTHER", size=44, family="serif", font_style="italic", fill=ARCH, font_weight="bold",
           transform="translate(62 134) skewX(18)", textLength=150, lengthAdjust="spacingAndGlyphs")
    a.text(0, 0, "HAND", size=44, family="serif", font_style="italic", fill=ARCH, font_weight="bold",
           transform="translate(66 180) skewX(18)", textLength=130, lengthAdjust="spacingAndGlyphs")
    a.close()
    worn(a, 20, 80, 240, 120, 160)


def stamp_restored(a):
    a.open("g", transform="rotate(3 140 140)", filter=a.roughen(2, 0.5))
    pts = a.ngon(140, 140, 122, 8, 22.5)
    a.poly(pts, fill="none", stroke=kit.MOSS, stroke_width=6, stroke_linejoin="round")
    _word(a, "RESTORED", 132, 38, kit.MOSS, 176)
    a.rect(64, 150, 150, 18, fill="none", stroke=kit.MOSS, stroke_width=2, stroke_dasharray="6 4")
    a.poly([(64, 150), (212, 128), (214, 146), (66, 168)], fill=kit.MOSS)
    kit.label(a, 96, 200, "LINE STANDS", 13, kit.MOSS, font_weight="bold")
    a.close()
    worn(a, 20, 20, 240, 240, 320)


def stamp_doubted(a):
    a.open("g", transform="rotate(-4 140 140)")
    a.circle(140, 140, 112, fill="none", stroke=PENCIL, stroke_width=5, stroke_dasharray="14 9")
    a.circle(140, 140, 96, fill="none", stroke=PENCIL, stroke_width=1.5)
    _word(a, "DOUBTED", 150, 40, PENCIL, 160, family="serif")
    kit.stroke_text(a, "?", 126, 104, 40, color=PENCIL, smooth=True, w=4)
    a.path("M70,176 q70,16 140,0", stroke=PENCIL, stroke_width=2.5, fill="none")
    kit.label(a, 96, 208, "UNVERIFIED", 14, PENCIL)
    a.close()
    worn(a, 20, 20, 240, 240, 200)


def stamp_excised(a):
    a.open("g", transform="rotate(9 140 140)", filter=a.roughen(2.2, 0.5))
    a.rect(20, 78, 240, 124, fill="none", stroke=BAR, stroke_width=6)
    a.rect(34, 92, 212, 40, fill=BAR)
    _word(a, "EXCISED", 124, 34, PAPER, 180, family="monospace")
    _word(a, "CLERK OF EXCISIONS", 160, 15, BAR, 200, family="monospace")
    a.rect(60, 172, 160, 14, fill=SEAL)
    a.close()
    worn(a, 20, 60, 240, 160, 260)


def stamp_sealed(a):
    a.open("g", transform="rotate(-8 140 140)", filter=a.roughen(2.2, 0.5))
    pts = a.star_pts(140, 140, 124, 108, 24)
    a.poly(pts, fill="none", stroke=SEAL, stroke_width=4, stroke_linejoin="round")
    a.circle(140, 140, 96, fill="none", stroke=SEAL, stroke_width=2)
    a.rect(30, 112, 220, 56, fill=SEAL)
    _word(a, "SEALED", 156, 46, PAPER, 180, family="serif")
    arc_text(a, 140, 140, 74, "BLANK SHEET", 17, SEAL, start=-90, font_weight="bold")
    arc_text(a, 140, 140, 86, "NO ENTRY", 17, SEAL, start=90, flip=True, font_weight="bold")
    a.close()
    worn(a, 20, 20, 240, 240, 360)


def stamp_continuum(a):
    a.open("g", transform="rotate(12 140 140)", filter=a.roughen(2.4, 0.5))
    a.circle(140, 140, 124, fill="none", stroke=SEAL, stroke_width=7)
    a.circle(140, 140, 116, fill="none", stroke=SEAL, stroke_width=1.5)
    a.circle(140, 140, 82, fill=SEAL)
    emblem(a, 140, 138, 58, PAPER, 4)
    arc_text(a, 140, 140, 92, "THE CONTINUUM", 22, SEAL, start=-90, font_weight="bold")
    arc_text(a, 140, 140, 108, "DIRECTED RESILIENCE", 17, SEAL, start=90, flip=True, font_weight="bold")
    a.close()
    worn(a, 110, 10, 170, 260, 520)


STAMPS = [
    ("hers", "Hers", stamp_hers, "An oval mark in iron-gall, HERS, with her two tells either side: the crossed seven and the delta."),
    ("forged", "Forged", stamp_forged, "A double-ruled seal-red rectangle, FORGED, struck askew across the lines of an entry."),
    ("other-hand", "Other hand", stamp_other, "A leaning blue-black lozenge, OTHER HAND, slanted left like the hand it names."),
    ("restored", "Restored", stamp_restored, "A moss-green octagon, RESTORED, with a small bar swung up off its dashed outline."),
    ("doubted", "Doubted", stamp_doubted, "A broken pencil-grey ring, DOUBTED, a question mark over the word: the cost of paranoia."),
    ("excised", "Excised", stamp_excised, "The clerk of excisions' flat black block, EXCISED, with one red rule beneath."),
    ("sealed", "Sealed", stamp_sealed, "A serrated seal-red roundel with a solid band, SEALED, for a blank sheet with no entry."),
    ("continuum", "The Continuum's seal", stamp_continuum, "The Continuum's seal in red on a journal page: peak, ringed core and twelve nodes, ink failing down one side."),
]
for _id, _t, _fn, _doc in STAMPS:
    def _stamp(a: Art, fn=_fn):
        _stamp_ground(a)
        fn(a)
    _stamp.__doc__ = _doc
    asset(G, f"stamp-{_id}", group="ui", title=f"Stamp: {_t}", w=280, h=280, row="Audit set")(_stamp)

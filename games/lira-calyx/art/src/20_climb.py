"""The cross-section climb: eleven figures and six survey-section backdrops."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, INK, ARCH, PENCIL, BAR, SEAL, PAPER = kit.G, kit.INK, kit.ARCH, kit.PENCIL, kit.BAR, kit.SEAL, kit.PAPER
FROW, BROW = "Climb figures", "Cross-section backdrops"
SKIN = "#d2a47c"


def _pt(o, ang, L):
    t = math.radians(ang)
    return o[0] + L * math.sin(t), o[1] + L * math.cos(t)


def limb(a: Art, pts, w, color, ow=3.2):
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)
    a.path(d, fill="none", stroke=INK, stroke_width=w + ow, stroke_linecap="round", stroke_linejoin="round")
    a.path(d, fill="none", stroke=color, stroke_width=w - 1, stroke_linecap="round", stroke_linejoin="round")


def person(a: Art, hip, pose, coat=kit.MOSS, legs="#5b4a3a", s=1.0, hair="tail", pack=kit.OCHRE, cloak=None, wide=1.0):
    """An ink figure with washed clothes, built from joint angles (degrees from straight down;
    positive swings toward the right, the way the figure faces). Returns the joints."""
    T, L, U = 62 * s, 46 * s, 34 * s
    lean = pose.get("lean", 6)
    sh = _pt(hip, 180 - lean, T)
    head = _pt(sh, 180 - lean - pose.get("nod", 0), 22 * s)
    J = {"hip": hip, "sh": sh, "head": head}
    for side in ("f", "n"):       # far, near
        th, shn = pose[side + "leg"]
        J[side + "knee"] = _pt(hip, th, L)
        J[side + "foot"] = _pt(J[side + "knee"], shn, L)
        ua, fa = pose[side + "arm"]
        J[side + "elbow"] = _pt(sh, ua, U)
        J[side + "hand"] = _pt(J[side + "elbow"], fa, U)
    far = "#6f5c4a"
    limb(a, [sh, J["felbow"], J["fhand"]], 10 * s, far)
    limb(a, [hip, J["fknee"], J["ffoot"]], 12 * s, far)
    limb(a, [J["ffoot"], (J["ffoot"][0] + 12 * s, J["ffoot"][1] + 1)], 9 * s, "#3a2c22")
    if pack:
        bx, by = _pt(sh, 180 - lean - 90, 20 * s * wide)
        a.rect(bx - 15 * s, by - 2 * s, 28 * s, 44 * s, fill=pack, stroke=INK, stroke_width=2.4, rx=7 * s,
               transform=f"rotate({f(lean)} {f(bx)} {f(by)})")
        a.line(bx - 13 * s, by + 14 * s, bx + 11 * s, by + 14 * s, stroke=INK, stroke_width=1.4,
               transform=f"rotate({f(lean)} {f(bx)} {f(by)})")
    limb(a, [hip, J["nknee"], J["nfoot"]], 13 * s, legs)
    limb(a, [J["nfoot"], (J["nfoot"][0] + 13 * s, J["nfoot"][1] + 1)], 10 * s, "#3a2c22")
    if cloak:
        hem = [(sh[0] - 16 * s, sh[1]), (sh[0] + 14 * s, sh[1] + 4), (hip[0] + 24 * s, hip[1] + 62 * s),
               (hip[0] - 8 * s, hip[1] + 72 * s), (hip[0] - 34 * s, hip[1] + 60 * s)]
        a.path(a.smooth_d(hem, closed=True), fill=cloak, stroke=INK, stroke_width=2.6, stroke_linejoin="round")
        a.path(a.smooth_d([(sh[0] - 4 * s, sh[1] + 10), (hip[0] - 6 * s, hip[1] + 20 * s), (hip[0] - 14 * s, hip[1] + 64 * s)]),
               stroke=INK, stroke_width=1.2, fill="none", opacity=0.7)
    else:
        limb(a, [hip, sh], 27 * s * wide, coat)
        a.path(f"M{f(hip[0] - 15 * s * wide)},{f(hip[1] + 2)} l{f(-4 * s)},{f(14 * s)} l{f(34 * s * wide)},{f(2 * s)} l{f(-2 * s)},{f(-16 * s)}Z",
               fill=coat, stroke=INK, stroke_width=2.2, stroke_linejoin="round")
        a.line(hip[0] - 13 * s * wide, hip[1] - 2, hip[0] + 13 * s * wide, hip[1] - 4, stroke=INK, stroke_width=2.4)
    limb(a, [sh, J["nelbow"], J["nhand"]], 10 * s, cloak or coat)
    a.circle(*J["nhand"], 5 * s, fill=SKIN, stroke=INK, stroke_width=1.8)
    hx, hy = head
    a.circle(hx, hy, 14.5 * s, fill=SKIN, stroke=INK, stroke_width=2.4)
    if hair == "tail":
        a.path(f"M{f(hx - 14 * s)},{f(hy + 3)} A{f(14.5 * s)},{f(14.5 * s)} 0 0,1 {f(hx + 10 * s)},{f(hy - 11 * s)} "
               f"Q{f(hx)},{f(hy - 5 * s)} {f(hx - 4 * s)},{f(hy + 4 * s)}Z", fill=INK)
        kit.curve(a, [(hx - 13 * s, hy - 2), (hx - 24 * s, hy + 6 * s), (hx - 22 * s, hy + 22 * s)], w=5 * s)
    elif hair == "hood":
        a.path(f"M{f(hx - 6 * s)},{f(hy + 15 * s)} Q{f(hx - 24 * s)},{f(hy)} {f(hx - 8 * s)},{f(hy - 17 * s)} "
               f"Q{f(hx + 12 * s)},{f(hy - 22 * s)} {f(hx + 13 * s)},{f(hy - 6 * s)} Q{f(hx - 2 * s)},{f(hy - 8 * s)} {f(hx - 6 * s)},{f(hy + 15 * s)}Z",
               fill=cloak or coat, stroke=INK, stroke_width=2.4, stroke_linejoin="round")
    elif hair == "crop":
        a.path(f"M{f(hx - 14.5 * s)},{f(hy)} A{f(14.5 * s)},{f(14.5 * s)} 0 0,1 {f(hx + 13 * s)},{f(hy - 7 * s)} "
               f"L{f(hx - 2 * s)},{f(hy - 4 * s)} Z", fill=INK)
    a.circle(hx + 7 * s, hy - 1, 1.6 * s, fill=INK)
    return J


def ledge(a: Art, x0, x1, y, depth=40, tone=kit.SLATE):
    r = a.rng
    top = [(x0, y)] + [(x, y + r.uniform(-2, 2)) for x in range(int(x0) + 14, int(x1), 18)] + [(x1, y)]
    body = top + [(x1 - 6, y + depth), (x0 + 8, y + depth)]
    cp = a.clip('<polygon points="' + " ".join(f"{f(x)},{f(yy)}" for x, yy in body) + '"/>')
    a.poly(body, fill=tone, opacity=0.35)
    a.hatch(x0, y, x1 - x0, depth, angle=28, spacing=7, clip=cp, stroke=INK, stroke_width=1, opacity=0.7)
    kit.ink(a, top, w=3)


def _plate(a: Art, name):
    kit.page(a)
    kit.label(a, 16, 26, name, 12, PENCIL)
    a.rect(6, 6, a.w - 12, a.h - 12, fill="none", stroke=INK, stroke_width=1, opacity=0.5)


STAND = dict(lean=4, nod=18, fleg=(-6, -2), nleg=(8, 2), farm=(20, 110), narm=(14, 100))
WALK = dict(lean=10, fleg=(-26, -42), nleg=(30, 6), farm=(34, 70), narm=(-28, 20))
JUMP = dict(lean=14, fleg=(48, -40), nleg=(66, -18), farm=(120, 150), narm=(100, 160))
CLIMB = dict(lean=2, nod=-20, fleg=(30, -20), nleg=(62, -24), farm=(150, 178), narm=(168, 172))
ANCHOR = dict(lean=34, nod=10, fleg=(70, -62), nleg=(84, -36), farm=(60, 90), narm=(-30, -70))
DRILL = dict(lean=30, nod=24, fleg=(86, -84), nleg=(20, -88), farm=(40, 40), narm=(52, 30))


@asset(G, "fig-lira-stand", group="figures", title="Lira: standing, reading", w=240, h=320, row=FROW)
def lira_stand(a: Art):
    """Lira at rest on a ledge in her moss coat and ochre pack, head bent to the open journal in her
    hands, pencil moving."""
    _plate(a, "LIRA  REST")
    ledge(a, 30, 210, 262)
    J = person(a, (118, 168), STAND)
    x, y = J["nhand"]
    a.poly([(x - 6, y - 8), (x + 22, y - 14), (x + 26, y + 4), (x - 2, y + 10)], fill=PAPER, stroke=INK, stroke_width=2)
    a.line(x + 10, y - 11, x + 12, y + 7, stroke=INK, stroke_width=1.2)
    a.line(x + 14, y - 22, x + 8, y - 6, stroke=PENCIL, stroke_width=2.4, stroke_linecap="round")


@asset(G, "fig-lira-walk", group="figures", title="Lira: walking", w=240, h=320, row=FROW)
def lira_walk(a: Art):
    """Lira mid-stride along a ledge, leaning into the slope, the dotted route already inked behind
    her boots."""
    _plate(a, "LIRA  WALK")
    ledge(a, 10, 232, 262)
    a.path("M16,250 H92", stroke=INK, stroke_width=4.5, stroke_dasharray="0.1 11", stroke_linecap="round", fill="none")
    person(a, (122, 174), WALK)


@asset(G, "fig-lira-jump", group="figures", title="Lira: jumping", w=240, h=320, row=FROW)
def lira_jump(a: Art):
    """Lira in the air between two ledges, knees drawn up and both arms thrown forward, pack
    lifting off her back."""
    _plate(a, "LIRA  JUMP  0.9 m")
    ledge(a, 6, 70, 270, 30)
    ledge(a, 176, 236, 236, 34)
    person(a, (112, 150), JUMP)
    a.path("M52,262 Q110,150 182,228", stroke=PENCIL, stroke_width=1.6, stroke_dasharray="5 6", fill="none")


@asset(G, "fig-lira-climb", group="figures", title="Lira: climbing", w=240, h=320, row=FROW)
def lira_climb(a: Art):
    """Lira hauling herself up a rock face, both hands over the lip of the ledge above, one boot
    finding a hold."""
    _plate(a, "LIRA  GRAB")
    a.poly([(150, 60), (234, 60), (234, 300), (168, 300), (160, 200), (150, 110)], fill=kit.SLATE, opacity=0.3)
    a.hatch(150, 60, 90, 240, angle=62, spacing=8, stroke=INK, stroke_width=1, opacity=0.6,
            clip=a.clip('<polygon points="150,60 234,60 234,300 168,300 160,200 150,110"/>'))
    kit.ink(a, [(120, 62), (150, 60), (152, 112), (160, 200), (168, 300)], w=3)
    person(a, (112, 190), CLIMB)


@asset(G, "fig-lira-anchor", group="figures", title="Lira: anchored", w=240, h=320, row=FROW)
def lira_anchor(a: Art):
    """Lira crouched low and clipped to a ring in the rock by a red line while a storm front's
    streaks cross the page above her."""
    r = a.rng
    _plate(a, "LIRA  ANCHOR")
    for k in range(9):
        y = 40 + k * 17
        pts = [(x, y + 4 * math.sin(x / 26 + k)) for x in range(int(r.uniform(0, 60)), 240, 18)]
        a.path(a.smooth_d(pts), fill="none", stroke=kit.SLATE, stroke_width=1.6, opacity=0.75)
    ledge(a, 10, 232, 262)
    J = person(a, (128, 214), ANCHOR)
    x, y = J["nhand"]
    a.path(f"M{f(x)},{f(y)} Q{f(x - 18)},{f(y + 26)} 44,254", stroke=SEAL, stroke_width=3, fill="none")
    a.circle(40, 256, 7, fill="none", stroke=SEAL, stroke_width=3)
    a.line(40, 262, 40, 274, stroke=INK, stroke_width=3)


@asset(G, "fig-lira-drill", group="figures", title="Lira: core drill", w=240, h=320, row=FROW)
def lira_drill(a: Art):
    """Lira kneeling over the core drill, both hands on its crossbar, two cut cores laid out on
    the ledge beside her, banded like the strata."""
    _plate(a, "LIRA  CORE  4 s")
    ledge(a, 10, 232, 262, 46)
    J = person(a, (104, 218), DRILL)
    x, y = J["nhand"]
    a.rect(x - 4, y, 9, 282 - y, fill="#c9ced0", stroke=INK, stroke_width=2)
    a.line(x - 20, y, x + 22, y, stroke=INK, stroke_width=5, stroke_linecap="round")
    a.path(f"M{f(x - 4)},{f(y + 14)}l9,6 M{f(x - 4)},{f(y + 26)}l9,6 M{f(x - 4)},{f(y + 38)}l9,6", stroke=INK, stroke_width=1.4)
    for k, cx in enumerate((186, 204)):
        a.rect(cx, 216 + k * 6, 12, 44 - k * 6, fill=kit.OCHRE, stroke=INK, stroke_width=1.8)
        for j, c in enumerate((kit.RUST, kit.SLATE, kit.BONE)):
            a.rect(cx, 224 + k * 6 + j * 10, 12, 5, fill=c)


@asset(G, "fig-mara", group="figures", title="Mara, storm-singer", w=240, h=320, row=FROW)
def fig_mara(a: Art):
    """Mara of the Peakborn in a long violet cloak, hood up, one arm raised to the rock and her
    head back, the square notes of the song rising from her on a short red staff."""
    _plate(a, "MARA  SING")
    ledge(a, 10, 232, 262, 40, kit.VIOLET)
    kit.staff(a, 138, 52, 86, 11, sw=1.3)
    for k, (dx, dy) in enumerate([(8, 22), (26, 11), (44, 16), (62, 0)]):
        a.rect(138 + dx, 52 + dy, 11, 11, fill=INK, transform=f"rotate({(k - 1.5) * 4} {138 + dx} {52 + dy})")
    a.path("M210,44 q8,-3 5,9", stroke=INK, stroke_width=2.6, fill="none")
    J = person(a, (112, 170), dict(lean=-6, nod=-26, fleg=(-4, 0), nleg=(6, 0), farm=(20, 60), narm=(120, 168)),
               cloak="#6d5490", hair="hood", pack=None)
    hx, hy = J["head"]
    a.ellipse(hx + 10, hy + 6, 2.6, 4, fill=INK)


@asset(G, "fig-joren", group="figures", title="Joren, engineer", w=240, h=320, row=FROW)
def fig_joren(a: Art):
    """Joren the Midlander engineer, broad in an ochre work jacket, carrying an instrument post
    over his shoulder with a spirit level hooked to his belt."""
    _plate(a, "JOREN  POST")
    ledge(a, 10, 232, 262, 40, kit.MOSS)
    J = person(a, (118, 172), dict(lean=8, fleg=(-22, -30), nleg=(24, 4), farm=(30, 130), narm=(60, 150)),
               coat=kit.OCHRE, legs="#4b5560", hair="crop", pack=None, wide=1.22, s=1.04)
    x, y = J["nhand"]
    a.line(x - 96, y + 36, x + 62, y - 30, stroke=INK, stroke_width=9, stroke_linecap="round")
    a.line(x - 96, y + 36, x + 62, y - 30, stroke="#b9a078", stroke_width=5, stroke_linecap="round")
    a.rect(x + 50, y - 46, 24, 16, fill="#c9ced0", stroke=INK, stroke_width=2, transform=f"rotate(-22 {x + 62} {y - 30})")
    a.circle(*J["nhand"], 5.4, fill=SKIN, stroke=INK, stroke_width=1.8)
    hx, hy = J["hip"]
    a.rect(hx - 4, hy + 2, 26, 8, fill=kit.CYAN, stroke=INK, stroke_width=1.6, rx=2)
    a.circle(hx + 9, hy + 6, 2, fill=PAPER)


@asset(G, "fig-kade", group="figures", title="Kade, scout", w=240, h=320, row=FROW)
def fig_kade(a: Art):
    """Kade the Lowland scout moving low in a rust poncho, respirator and goggles on, a satchel of
    charges with one red band slung at the hip."""
    _plate(a, "KADE  SCOUT")
    ledge(a, 10, 232, 262, 40, kit.RUST)
    J = person(a, (116, 190), dict(lean=26, nod=-12, fleg=(-34, -50), nleg=(44, -10), farm=(50, 96), narm=(10, 62)),
               coat=kit.RUST, legs="#55483a", hair="hood", pack=None)
    hx, hy = J["head"]
    a.rect(hx + 1, hy - 7, 13, 8, fill=kit.ICE, stroke=INK, stroke_width=2, rx=3)
    a.circle(hx + 9, hy + 7, 6.5, fill="#55483a", stroke=INK, stroke_width=2)
    a.circle(hx + 9, hy + 7, 2, fill=INK)
    bx, by = J["hip"]
    a.line(J["sh"][0] + 4, J["sh"][1], bx - 12, by + 4, stroke=INK, stroke_width=2.4)
    a.rect(bx - 26, by - 2, 28, 22, fill="#8a7a5c", stroke=INK, stroke_width=2.2, rx=3)
    a.rect(bx - 26, by + 6, 28, 5, fill=SEAL)
    a.stipple(20, 230, 200, 30, n=40, r=(0.8, 2), fill=kit.OCHRE, opacity=0.7)


@asset(G, "fig-crawler", group="figures", title="Glassback crawler", w=320, h=240, row=FROW)
def fig_crawler(a: Art):
    """A glassback crawler on its fixed path: six overlapping plates of faceted crystal over a low
    ink body, jointed legs in step, feelers out ahead."""
    r = a.rng
    _plate(a, "GLASSBACK CRAWLER  FIXED PATH")
    ledge(a, 10, 312, 178, 36, kit.RUST)
    a.path("M20,170 H300", stroke=PENCIL, stroke_width=1.4, stroke_dasharray="4 6", fill="none")
    body = [(52, 160), (70, 138), (140, 124), (220, 128), (262, 144), (270, 160), (240, 168), (90, 168)]
    a.path(a.smooth_d(body, closed=True), fill="#3a2c22", stroke=INK, stroke_width=2.6)
    for k in range(6):
        x = 78 + k * 30
        ph = (k % 2) * 8
        kit.curve(a, [(x, 160), (x - 10 + ph, 148), (x - 16 + ph, 176)], w=2.6)
        kit.curve(a, [(x + 8, 162), (x + 20 - ph, 152), (x + 24 - ph, 177)], w=2)
    cols = [kit.ICE, "#f6f8f4", kit.CYAN, "#8fb7c9", "#dcecf2", "#6fa3b8"]
    for k in range(6):
        cx, cy = 232 - k * 30, 122 + abs(k - 2.2) * 3.2
        a.facets(cx, cy - 6, 21 - k * 0.8, cols[k % 3:] + cols[:k % 3], n=6, irregular=0.2, stroke=INK, stroke_width=1.4,
                 stroke_linejoin="round")
    a.circle(264, 150, 3.4, fill=kit.CYAN)
    kit.curve(a, [(268, 146), (288, 128), (300, 132)], w=1.8)
    kit.curve(a, [(270, 152), (292, 146), (304, 152)], w=1.8)
    a.path("M270,160 l10,6 M268,164 l8,8", stroke=INK, stroke_width=2.2, fill="none")
    for k in range(5):
        x, y = r.uniform(120, 240), r.uniform(84, 116)
        a.path(f"M{f(x)},{f(y - 6)}v12M{f(x - 6)},{f(y)}h12", stroke="#fff", stroke_width=1.4, opacity=0.9)


@asset(G, "fig-wolf", group="figures", title="Ember Wolf, juvenile", w=320, h=240, row=FROW)
def fig_wolf(a: Art):
    """A juvenile Ember Wolf at a trot, big-pawed and big-eared, washed in sooty brown, with ember
    marks glowing down its spine and a warm paw print left on the ledge behind."""
    _plate(a, "EMBER WOLF  JUV.  2 600 m")
    ledge(a, 10, 312, 196, 30, kit.MOSS)
    far = [(118, 150), (104, 172), (112, 194), (126, 194), (122, 174), (136, 152)]
    a.path(a.smooth_d(far, closed=True), fill="#5a4636", stroke=INK, stroke_width=2)
    far2 = [(214, 146), (226, 170), (224, 194), (238, 194), (240, 168), (232, 144)]
    a.path(a.smooth_d(far2, closed=True), fill="#5a4636", stroke=INK, stroke_width=2)
    body = [(266, 106), (246, 88), (240, 60), (226, 86), (206, 96), (160, 98), (98, 104), (82, 110), (40, 146),
            (50, 152), (86, 132), (92, 152), (80, 174), (84, 194), (102, 194), (100, 172), (120, 150), (160, 146),
            (194, 144), (194, 172), (190, 194), (208, 194), (212, 164), (228, 132), (242, 122), (262, 120)]
    d = a.smooth_d(body, closed=True)
    a.path(d, fill="#7a6250", stroke=INK, stroke_width=2.8, stroke_linejoin="round")
    cp = a.clip(f'<path d="{d}"/>')
    a.hatch(40, 120, 240, 80, angle=-20, spacing=6, clip=cp, stroke=INK, stroke_width=0.9, opacity=0.5)
    glow = a.blur(4)
    for k, x in enumerate(range(92, 232, 22)):
        y = 108 - 6 * math.sin((x - 92) / 140 * math.pi)
        a.circle(x, y, 9, fill="#f08a2c", opacity=0.6, filter=glow)
        a.circle(x, y, 3.6, fill="#ffd27a")
    a.path("M240,62 L232,86 L246,84Z", fill="#3a2c22")
    a.circle(250, 100, 3, fill="#ffd27a", stroke=INK, stroke_width=1.2)
    a.circle(266, 108, 3, fill=INK)
    a.path("M262,118 l-16,2", stroke=INK, stroke_width=1.6)
    for dx, dy in ((0, 0), (-7, -9), (0, -12), (7, -9)):
        a.circle(42 + dx, 190 + dy * 0.5, 3.4 if dx or dy else 5, fill="#f08a2c", opacity=0.75)


# ---- backdrops --------------------------------------------------------------------------------
W, H, X0 = 1600, 900, 110
ROCK = {
    "dots": lambda bg: (bg, f'<circle cx="4" cy="4" r="1.3" fill="{INK}"/><circle cx="12" cy="11" r="1" fill="{INK}"/>', 16),
    "diag": lambda bg: (bg, f'<path d="M0,10 L10,0" stroke="{INK}" stroke-width="1.1"/>', 10),
    "brick": lambda bg: (bg, f'<path d="M0,4 H16 M0,12 H16 M8,4 V12 M0,12 V16 M16,12 V16 M4,0 V4 M12,0 V4" stroke="{INK}" stroke-width="0.9" fill="none"/>', 16),
    "dash": lambda bg: (bg, f'<path d="M1,5 H8 M10,13 H15" stroke="{INK}" stroke-width="1.3"/>', 16),
    "cross": lambda bg: (bg, f'<path d="M3,3 l4,4 M7,3 l-4,4 M11,11 l4,4 M15,11 l-4,4" stroke="{INK}" stroke-width="0.9"/>', 16),
    "wave": lambda bg: (bg, f'<path d="M0,8 Q4,3 8,8 T16,8" stroke="{INK}" stroke-width="1.1" fill="none"/>', 16),
    "diamond": lambda bg: (bg, f'<path d="M8,2 L13,8 L8,14 L3,8Z" fill="none" stroke="{INK}" stroke-width="0.9"/>', 16),
    "vert": lambda bg: (bg, f'<path d="M3,0V9M10,6V16" stroke="{INK}" stroke-width="1"/>', 14),
}


def section(a: Art, lo, hi, bands, surface=None, dip=0.12, sky=None, grain=0.11):
    """Strata across the sheet, clipped under the surface line; the altitude scale down the left."""
    r = a.rng
    kit.page(a, grain=grain)
    if sky:
        a.rect(0, 0, W, H, fill=a.gradient(sky), opacity=0.5)
    n = len(bands)
    bounds = []
    for k in range(n + 1):
        base, ph = H + 60 - k * (H + 240) / n, r.uniform(0, 6)
        bounds.append([(x, base + (x - X0) * dip + 16 * math.sin(x / 90 + ph) + 6 * math.sin(x / 31 + ph * 2))
                       for x in range(X0 - 20, W + 40, 30)])
    if surface:
        mclip = a.clip('<polygon points="' + " ".join(f"{f(x)},{f(y)}" for x, y in [(X0, H)] + surface + [(W, H)]) + '"/>')
        a.open("g", clip_path=mclip)
    for k, (kind, bg) in enumerate(bands):
        lo_b, hi_b = bounds[k], bounds[k + 1]
        a.poly(lo_b + hi_b[::-1], fill=kit.pat(a, *ROCK[kind](bg)), stroke=INK, stroke_width=1.5)
    for fx in (r.uniform(380, 620), r.uniform(980, 1300)):
        kit.ink(a, [(fx, H), (fx + r.uniform(60, 160), 0)], amp=2.5, step=30, w=2)
    if surface:
        a.close()
        kit.ink(a, surface, amp=1.4, step=14, w=3.4)


def scale(a: Art, lo, hi, name):
    a.rect(0, 0, 96, H, fill=PAPER, opacity=0.86)
    a.rect(44, 40, 30, H - 110, fill="#f7f1e2", stroke=INK, stroke_width=2)
    step = 100 if hi - lo <= 2000 else 200
    d = []
    for alt in range(int(lo), int(hi) + 1, step // 4):
        y = 40 + (H - 110) * (hi - alt) / (hi - lo)
        major = alt % step == 0
        d.append(f"M74,{f(y)}h{-14 if major else -6}")
        if major and (alt // step) % 2 == 0:
            a.text(38, y + 4, f"{alt:,}".replace(",", " "), size=12, family="monospace", fill=INK, text_anchor="end")
    a.path("".join(d), stroke=INK, stroke_width=1.2, fill="none")
    a.text(22, H - 40, "m", size=14, family="monospace", fill=INK)
    a.rect(W - 470, H - 62, 450, 44, fill="#f7f1e2", stroke=INK, stroke_width=2)
    a.text(W - 456, H - 34, name, size=16, family="monospace", fill=INK)
    a.rect(14, 12, W - 28, H - 24, fill="none", stroke=INK, stroke_width=2)


def shelf(a: Art, x, y, w=70, side=1):
    a.rect(x, y, w, 9, fill=INK)
    a.path(f"M{f(x + 4)},{f(y + 9)} l{f(8 * side)},14 M{f(x + w / 2)},{f(y + 9)} l{f(6 * side)},10 M{f(x + w - 6)},{f(y + 9)} l{f(4 * side)},8",
           stroke=INK, stroke_width=1.4, fill="none")


def camp(a: Art, x, y):
    a.poly([(x - 20, y), (x, y - 30), (x + 20, y)], fill=kit.RUST, stroke=INK, stroke_width=2.2)
    a.line(x, y - 30, x, y - 50, stroke=INK, stroke_width=2)
    a.poly([(x, y - 50), (x + 16, y - 44), (x, y - 38)], fill=SEAL)


def route(a: Art, pts):
    a.path(a.smooth_d(pts), fill="none", stroke=PENCIL, stroke_width=3, stroke_dasharray="0.1 10", stroke_linecap="round")


def slope(a: Art, y0, y1, bumps=60, x0=X0, x1=W):
    r = a.rng
    return [(x, y0 + (y1 - y0) * (x - x0) / (x1 - x0) + bumps * math.sin((x - x0) / 170) * 0.5 + r.uniform(-8, 8))
            for x in range(x0, x1 + 1, 24)]


def ground(surface, xq):
    for (xa, ya), (xb, yb) in zip(surface, surface[1:]):
        if xa <= xq <= xb:
            return ya + (yb - ya) * (xq - xa) / (xb - xa)
    return surface[-1][1]


@asset(G, "section-b1-climb", group="backdrops", title="Section: the Aether-Vine ridge", w=W, h=H, row=BROW)
def sec_b1(a: Art):
    """Book I climb, 1 900 to 2 800 m: a Mid-Slope ridge cut open, moss terrace over slate and
    ochre sandstone, Aether-Vines along its skin all leaning one way toward the Peaks, two camps on
    the route and the N2 sighting station at the top."""
    r = a.rng
    surf = slope(a, 760, 170)
    section(a, 1900, 2800, [("dots", "#d9b77c"), ("diag", kit.OCHRE), ("dash", "#8d969c"), ("brick", "#7c8a6a"),
                             ("wave", "#6f8a5a"), ("dash", "#9aa58c"), ("brick", "#86956f")], surf,
            sky=[(0, "#cfe0d6"), (1, PAPER)])
    for x in range(X0 + 30, W - 40, 26):
        y = ground(surf, x)
        hgt = r.uniform(26, 70)
        kit.curve(a, [(x, y), (x + hgt * 0.25, y - hgt * 0.55), (x + hgt * 0.8, y - hgt)], w=2, stroke=kit.MOSS)
        a.circle(x + hgt * 0.8, y - hgt, 3, fill=kit.CYAN, opacity=0.85)
    pts = []
    for k, x in enumerate(range(200, 1500, 118)):
        y = ground(surf, x) - 6
        shelf(a, x - 30, y, 64)
        pts.append((x, y - 8))
    route(a, pts)
    camp(a, 554, ground(surf, 554) - 6)
    camp(a, 1026, ground(surf, 1026) - 6)
    x, y = 1500, ground(surf, 1500)
    a.line(x, y, x, y - 70, stroke=INK, stroke_width=3)
    a.circle(x, y - 78, 10, fill="none", stroke=SEAL, stroke_width=3)
    a.text(x - 14, y - 96, "N2", size=20, family="serif", font_weight="bold", fill=SEAL)
    scale(a, 1900, 2800, "SECTION B1   RIDGE   1 900 to 2 800 m")


@asset(G, "section-b2-descent", group="backdrops", title="Section: down to the Scorched Biome", w=W, h=H, row=BROW)
def sec_b2(a: Art):
    """Book II descent, 2 000 to 300 m: rust breccia and ash tuff falling away to the Lowlands,
    crystal-bark scrub on the surface, ochre chemical cloud pooled in the hollows and a crawler's
    track drawn along one bench."""
    r = a.rng
    surf = slope(a, 150, 800, bumps=80)
    section(a, 300, 2000, [("cross", "#b56a3f"), ("dots", "#d9b77c"), ("diag", "#c9803f"), ("cross", "#a8552e"),
                            ("dash", "#cdb48a"), ("dots", kit.BONE), ("diag", kit.OCHRE)], surf, dip=-0.14,
            sky=[(0, "#e8d2a0"), (1, PAPER)])
    for x in range(X0 + 40, W - 30, 44):
        y = ground(surf, x)
        s = r.uniform(10, 22)
        a.facets(x, y - s * 1.2, s, [kit.BONE, "#f6f8f4", "#d9c9a2", kit.OCHRE], n=5, stroke=INK, stroke_width=1)
        a.line(x, y, x, y - s * 0.6, stroke=INK, stroke_width=2)
    fog = a.blur(14)
    for cx in (520, 980, 1380):
        y = ground(surf, cx)
        a.ellipse(cx, y - 44, 150, 46, fill="#c9a51e", opacity=0.42, filter=fog)
        a.stipple(cx - 140, y - 90, 280, 80, n=90, r=(1, 2.6), fill="#8a6a12", opacity=0.6)
    pts = []
    for x in range(190, 1500, 122):
        y = ground(surf, x) - 6
        shelf(a, x - 30, y, 64, -1)
        pts.append((x, y - 8))
    route(a, pts)
    camp(a, 556, ground(surf, 556) - 6)
    camp(a, 1166, ground(surf, 1166) - 6)
    y = ground(surf, 800)
    a.path(f"M700,{f(ground(surf, 700) - 14)} L900,{f(ground(surf, 900) - 14)}", stroke=INK, stroke_width=1.6, stroke_dasharray="2 5")
    a.path(f"M700,{f(ground(surf, 700) - 22)} l-8,8 l8,8 M900,{f(ground(surf, 900) - 22)} l8,8 l-8,8", stroke=INK, stroke_width=1.6, fill="none")
    scale(a, 300, 2000, "SECTION B2   DESCENT   2 000 to 300 m")


@asset(G, "section-b3-climb", group="backdrops", title="Section: the High Peaks", w=W, h=H, row=BROW)
def sec_b3(a: Art):
    """Book III climb, 2 800 to 4 600 m: ice schist and crystal vein under a violet dusk, the
    4 000 m line ruled across with the low-gravity shimmer above it, storm rock ringed in red on the
    route and three camps."""
    r = a.rng
    surf = slope(a, 820, 250, bumps=110)
    section(a, 2800, 4600, [("dash", "#8d969c"), ("diamond", "#9aa9ae"), ("wave", "#7f93a6"), ("diamond", "#b7c7d2"),
                             ("dash", "#8a86a8"), ("wave", "#a9b9d0"), ("diamond", "#c9d6e2")], surf, dip=0.2,
            sky=[(0, "#8c76ad"), (0.6, "#cdbfe0"), (1, PAPER)])
    yl = 40 + (H - 110) * (4600 - 4000) / 1800
    a.line(X0, yl, W, yl, stroke=kit.VIOLET, stroke_width=2.2, stroke_dasharray="12 7")
    a.text(X0 + 20, yl - 10, "4 000 m", size=17, family="monospace", fill=kit.VIOLET)
    for _ in range(70):
        x, y = r.uniform(X0 + 20, W - 20), r.uniform(50, yl - 10)
        a.circle(x, y, r.uniform(2, 6), fill="none", stroke=kit.TEAL if r.random() < 0.3 else kit.VIOLET, stroke_width=1.1, opacity=0.7)
    pts = []
    for k, x in enumerate(range(200, 1520, 110)):
        y = ground(surf, x) - 6
        shelf(a, x - 30, y, 60)
        pts.append((x, y - 8))
        if k in (5, 8, 10):
            a.poly(a.ngon(x + 50, y - 16, 15, 5, r.uniform(0, 70)), fill="#6a6f78", stroke=INK, stroke_width=2)
            a.circle(x + 50, y - 16, 24, fill="none", stroke=SEAL, stroke_width=2, stroke_dasharray="4 4")
    route(a, pts)
    for cx in (420, 860, 1300):
        camp(a, cx, ground(surf, cx) - 6)
    scale(a, 2800, 4600, "SECTION B3   HIGH PEAKS   2 800 to 4 600 m")


@asset(G, "section-b3-escape", group="backdrops", title="Section: the shafts of the city", w=W, h=H, row=BROW)
def sec_escape(a: Art):
    """Book III escape: the subterranean city in section, galleries cut pale into dark rock and lit
    by white-violet cores, two shafts with ledges climbing between them, and the lamp housings whose
    sweeps cross the shafts."""
    r = a.rng
    section(a, 3200, 3900, [("brick", "#4e5560"), ("dash", "#565c66"), ("brick", "#5b5a6e"), ("vert", "#4a5058"),
                             ("dash", "#5e6470"), ("brick", "#525868")], None, dip=0.05)
    a.rect(0, 0, W, H, fill="#1c1a24", opacity=0.35)
    cut = dict(fill="#efe6d0", stroke=INK, stroke_width=3)
    glow = a.blur(18)
    for gx, gy, gw in ((180, 700, 520), (640, 470, 600), (300, 230, 520), (1050, 180, 440), (1120, 690, 380)):
        a.rect(gx, gy, gw, 96, rx=10, **cut)
        for k in range(int(gw / 110)):
            x = gx + 60 + k * 110
            a.path(f"M{x - 26},{gy + 96} V{gy + 44} A26,26 0 0,1 {x + 26},{gy + 44} V{gy + 96}", fill="none", stroke=INK, stroke_width=1.6)
        cx = gx + gw * 0.5
        a.circle(cx, gy + 30, 46, fill="#cdb8ff", opacity=0.75, filter=glow)
        a.poly(a.ngon(cx, gy + 30, 13, 6, 30), fill="#f6f2ff", stroke=kit.VIOLET, stroke_width=2)
    pts = []
    for sx, y0, y1 in ((560, 230, 796), (1150, 180, 786)):
        a.rect(sx, y0, 90, y1 - y0, **cut)
        a.rect(sx + 3, y0 - 2, 84, y1 - y0 + 4, fill="#efe6d0")
        side, y = 0, y1 - 60
        while y > y0 + 30:
            shelf(a, sx if side == 0 else sx + 50, y, 40)
            pts.append((sx + (20 if side == 0 else 70), y - 8))
            side ^= 1
            y -= 62
        pts.append((sx + 45, y0 + 20))
    route(a, [(240, 780)] + pts[:9] + [(700, 300), (900, 548), (1100, 548)] + pts[9:])
    for lx, ly, d in ((540, 420, 1), (668, 620, -1), (1130, 380, 1), (1258, 560, -1)):
        a.rect(lx, ly, 20, 26, fill=BAR, stroke=INK, stroke_width=1.6)
        a.poly([(lx + 10, ly + 13), (lx + 10 + d * 120, ly + 50), (lx + 10 + d * 120, ly - 20)] if False else
               [(lx + 10 + d * 10, ly + 13), (lx + 10 + d * 96, ly - 14), (lx + 10 + d * 96, ly + 44)],
               fill="#fff6c8", opacity=0.55)
    camp(a, 900, 566)
    scale(a, 3200, 3900, "SECTION B3   ESCAPE   CITY SHAFTS")


@asset(G, "section-b4-descent", group="backdrops", title="Section: under Peak 12", w=W, h=H, row=BROW)
def sec_b4(a: Art):
    """Book IV descent under Peak 12: a long shaft through violet rock, platforms that rise and
    fall on the mountain's seven-second period, a chalked note on the wall by the north shaft, and
    at the bottom the cavern of the core, white-violet and humming."""
    r = a.rng
    section(a, 600, 2400, [("diamond", "#6e6a8c"), ("wave", "#5d6a80"), ("vert", "#6b5f86"), ("dash", "#54586e"),
                            ("diamond", "#77709a"), ("wave", "#5a5378"), ("vert", "#665c84")], None, dip=-0.1)
    a.rect(0, 0, W, H, fill="#1a1426", opacity=0.3)
    cut = dict(fill="#efe6d0", stroke=INK, stroke_width=3)
    cav = [(760, 640), (880, 560), (1100, 530), (1340, 560), (1500, 660), (1520, 800), (1300, 850), (900, 850), (740, 780)]
    a.path(a.smooth_d(cav, closed=True), **cut)
    a.rect(400, 40, 120, 640, **cut)
    a.poly([(404, 600), (516, 600), (800, 700), (780, 780), (404, 690)], fill="#efe6d0")
    kit.ink(a, [(400, 680), (760, 790)], w=3)
    kit.ink(a, [(520, 600), (790, 690)], w=3)
    a.rect(520, 150, 300, 70, **cut)
    a.rect(516, 153, 10, 64, fill="#efe6d0")
    kit.small_hand(a, 560, 180, "North shaft.", 22, "#6a7fa8")
    kit.small_hand(a, 566, 206, "Leave it open.", 22, "#6a7fa8")
    a.path("M800,185 h60 l-12,-9 M860,185 l-12,9", stroke=PENCIL, stroke_width=2, fill="none")
    cx, cy = 1140, 700
    a.circle(cx, cy, 190, fill=a.radial([(0, "#ffffff", 0.95), (0.35, "#d9c8ff", 0.7), (1, "#8a6fd0", 0)]))
    for k in range(9):
        t = math.radians(-160 + k * 40 + r.uniform(-8, 8))
        L = r.uniform(60, 120)
        bx, by = cx + 34 * math.cos(t), cy + 20 + 22 * math.sin(t)
        tip = (bx + L * math.cos(t) * 0.5, by - L)
        a.poly([(bx - 14, by + 30), tip, (bx + 14, by + 30)], fill="#f3eeff", stroke=kit.VIOLET, stroke_width=1.8)
        a.line(bx, by + 30, *tip, stroke=kit.VIOLET, stroke_width=1)
    for k in range(4):
        a.circle(cx, cy - 20, 150 + k * 34, fill="none", stroke="#fff", stroke_width=1.4, opacity=0.5 - k * 0.1, stroke_dasharray="3 9")
    pts = []
    for k in range(8):
        y = 90 + k * 68
        x = 404 if k % 2 == 0 else 466
        ph = math.sin(k * 2 * math.pi / 7)
        a.rect(x, y + ph * 10, 50, 8, fill=INK)
        a.path(f"M{x + 25},{y - 22} v14 m-5,-6 l5,6 l5,-6 M{x + 25},{y + 40} v-14 m-5,6 l5,-6 l5,6", stroke=kit.CYAN,
               stroke_width=1.8, fill="none")
        pts.append((x + 25, y - 6))
    route(a, pts + [(560, 660), (760, 740), (940, 800)])
    camp(a, 640, 716)
    a.text(180, 300, "7 s", size=30, family="monospace", fill=kit.CYAN)
    a.path("M180,320 q20,-30 40,0 t40,0 t40,0", stroke=kit.CYAN, stroke_width=2.4, fill="none")
    scale(a, 600, 2400, "SECTION B4   UNDER PEAK 12")


@asset(G, "section-redaction-overlay", group="backdrops", title="Section: the redaction overlay", w=W, h=H, row=BROW)
def sec_redact(a: Art):
    """The overlay for the redacted survey sheet, on clear ground: twelve black bars laid across
    the section at the censor's lengths, some ruled and some brushed, with the one beat of falling
    dust that outlines a hidden ledge and the pale cones of two lamps crossing the white paper
    between them."""
    r = a.rng
    for lx, ly, d in ((250, 300, 1), (1420, 560, -1)):
        a.poly([(lx, ly), (lx + d * 520, ly - 110), (lx + d * 520, ly + 150)], fill="#fff6c8", opacity=0.35)
        a.rect(lx - 12, ly - 16, 24, 32, fill=BAR)
    rows = [(150, 70, 620, 64, "surgical"), (900, 96, 560, 58, "clumsy"), (330, 196, 410, 60, "surgical"),
            (830, 232, 700, 66, "surgical"), (130, 330, 300, 56, "clumsy"), (560, 372, 520, 62, "surgical"),
            (1160, 388, 380, 60, "surgical"), (220, 498, 690, 66, "surgical"), (990, 536, 330, 58, "clumsy"),
            (140, 650, 470, 62, "surgical"), (700, 676, 640, 64, "surgical"), (420, 792, 820, 60, "surgical")]
    for x, y, w, h, kind in rows:
        kit.bar(a, x, y, w, h, kind=kind)
    # dust on the beat, outlining a ledge inside the fourth bar
    lx0, lx1, ly = 1010, 1190, 268
    a.stipple(lx0, 232, lx1 - lx0, 34, n=160, r=(0.7, 1.8), fill=PAPER, opacity=0.9,
              density=lambda x, y: 0.25 + 0.75 * (y - 232) / 34)
    a.path(f"M{lx0},{ly} H{lx1}", stroke=PAPER, stroke_width=2.4, stroke_dasharray="1 5", stroke_linecap="round", fill="none")
    for k in range(7):
        a.circle(1560, 60 + k * 22, 6, fill=PAPER if k == 3 else "none", stroke=PAPER, stroke_width=1.6)
    a.rect(1536, 40, 48, 174, fill=BAR, opacity=0.9)
    for k in range(7):
        a.circle(1560, 62 + k * 22, 6, fill=PAPER if k == 6 else "none", stroke=PAPER, stroke_width=1.6)


# ---- cut-out sprites for the climb in play: the same figures with no plate and no ledge, feet near y = 188
SROW = "Climb sprites"


def _sprite(a: Art, pose, hip=(78, 100), **kw):
    return person(a, hip, pose, **kw)


@asset(G, "spr-lira-stand", group="figures", title="Sprite: Lira standing", w=160, h=200, row=SROW)
def spr_stand(a: Art):
    """Lira standing with the journal open in her hands, cut out with no ground, for the climb in play."""
    J = _sprite(a, STAND)
    x, y = J["nhand"]
    a.poly([(x - 6, y - 8), (x + 22, y - 14), (x + 26, y + 4), (x - 2, y + 10)], fill=PAPER, stroke=INK, stroke_width=2)


@asset(G, "spr-lira-walk", group="figures", title="Sprite: Lira walking", w=160, h=200, row=SROW)
def spr_walk(a: Art):
    """Lira mid-stride, cut out with no ground, for the climb in play."""
    _sprite(a, WALK, hip=(78, 102))


@asset(G, "spr-lira-walk-2", group="figures", title="Sprite: Lira walking, passing step", w=160, h=200, row=SROW)
def spr_walk2(a: Art):
    """Lira's passing step, legs together under her, the second frame of her walk in play."""
    _sprite(a, dict(lean=9, fleg=(8, -10), nleg=(-4, -22), farm=(-12, 30), narm=(18, 60)), hip=(78, 100))


@asset(G, "spr-lira-jump", group="figures", title="Sprite: Lira jumping", w=160, h=200, row=SROW)
def spr_jump(a: Art):
    """Lira in the air, knees drawn up and arms thrown forward, cut out for the climb in play."""
    _sprite(a, JUMP, hip=(74, 112))


@asset(G, "spr-lira-anchor", group="figures", title="Sprite: Lira anchored", w=160, h=200, row=SROW)
def spr_anchor(a: Art):
    """Lira crouched low against a front, one hand back toward the ring, cut out for the climb in play."""
    _sprite(a, ANCHOR, hip=(66, 140))


@asset(G, "spr-lira-drill", group="figures", title="Sprite: Lira at the instrument", w=160, h=200, row=SROW)
def spr_drill(a: Art):
    """Lira kneeling still over an instrument on its rod, both hands on the crossbar, cut out for
    the hand readings of the climb in play."""
    J = _sprite(a, DRILL, hip=(64, 140))
    x, y = J["nhand"]
    a.rect(x - 4, y, 8, 186 - y, fill="#c9ced0", stroke=INK, stroke_width=2)
    a.line(x - 16, y, x + 18, y, stroke=INK, stroke_width=5, stroke_linecap="round")


@asset(G, "spr-mara", group="figures", title="Sprite: Mara at her camp", w=160, h=200, row=SROW)
def spr_mara(a: Art):
    """Mara in her violet cloak, hood up, one arm lifted, cut out to stand at her camp in play."""
    J = _sprite(a, dict(lean=-4, nod=-14, fleg=(-4, 0), nleg=(6, 0), farm=(20, 60), narm=(110, 150)),
                cloak="#6d5490", hair="hood", pack=None, hip=(78, 100))
    hx, hy = J["head"]
    a.ellipse(hx + 10, hy + 6, 2.6, 4, fill=INK)

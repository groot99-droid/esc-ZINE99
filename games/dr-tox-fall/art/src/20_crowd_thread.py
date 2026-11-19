"""Crowd thread (2D, scroll): underground comix crosshatch.

Dense pen crosshatching on cheap off-white paper, lumpy figures packed shoulder to shoulder, drawn by
someone who stood in the queue: crowded, ugly, sympathetic. His breath radius is a ring of bare white
paper. Colour is the paper, the ink, the shroud's desaturated green and, where it is his, a little
amber. Figures and pieces are transparent sprites, feet on the bottom edge; backdrops are three
parallax layers per place."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "crowd-thread"
INK = kit.INK
PAPER, FIG, BARE, WALL = "#ece4d0", "#bfb49c", "#f6f1e4", "#d9cfb8"


def hatched(a, d, box, angle=60, spacing=6, sw=1.1, shade=True, fill=FIG, sw_out=3):
    """A shape in pen: filled flat, hatched all over, cross-hatched on its right (shadow) side."""
    a.path(d, fill=fill, stroke=INK, stroke_width=sw_out, stroke_linejoin="round")
    cid = a.clip(f'<path d="{d}"/>')
    x, y, w, h = box
    a.hatch(x, y, w, h, angle=angle, spacing=spacing, clip=cid, jitter=0.8, stroke=INK, stroke_width=sw, opacity=0.8)
    if shade:
        half = a.clip(f'<rect x="{f(x + w * .55)}" y="{f(y)}" width="{f(w * .45)}" height="{f(h)}"/>')
        a.open("g", clip_path=half)
        a.hatch(x, y, w, h, angle=angle - 90, spacing=spacing * .9, clip=cid, jitter=0.8, stroke=INK, stroke_width=sw)
        a.close()
    a.path(d, fill="none", stroke=INK, stroke_width=sw_out, stroke_linejoin="round")


def lumpy(a, x, y, s, lean=0.0, hunch=0.0, broad=1.0, lesions=True, fill=FIG):
    pts = [(px + a.rng.uniform(-3, 3) * s, py + a.rng.uniform(-3, 3) * s)
           for px, py in kit.person_pts(x, y, s, lean, hunch, broad)]
    d = a.smooth_d(pts, closed=True)
    hatched(a, d, (x - 40 * s * broad, y - 130 * s, 80 * s * broad, 130 * s), fill=fill)
    if lesions:
        a.stipple(x - 16 * s, y - 100 * s, 26 * s, 40 * s, n=12, r=(1.2, 2.4), fill=INK)
    return d


def tox(a, x, y, s, closed=True, lean=0.0):
    d = kit.tox_d(x, y, s, closed, lean)
    hatched(a, d, (x - 36 * s, y - 165 * s, 72 * s, 165 * s), angle=-50, spacing=5, fill=kit.SHROUD)
    if not closed:
        a.path(kit.tox_legs_d(x, y, s), fill="#26292a", stroke=INK, stroke_width=2.5)
    return d


# ---- figures -----------------------------------------------------------------------------------
@asset(G, f"{M}-tox-walk", group="figures", title="Dr. Tox walking, shroud open", w=200, h=320,
       row=kit.row(M, "Dr. Tox (the shroud open and closed, turning, a dart)"))
def tox_walk(a: Art):
    """Dr. Tox side-on in heavy pen, hood up, the heavy desaturated green shroud hanging open from the
    shoulders and crosshatched, the narrow dark figure showing down the front: narrow, vertical,
    contained."""
    tox(a, 100, 312, 1.8, closed=False, lean=4)


@asset(G, f"{M}-tox-closed", group="figures", title="Dr. Tox with the shroud drawn closed", w=200, h=320,
       row=kit.row(M, "Dr. Tox (the shroud open and closed, turning, a dart)"))
def tox_closed(a: Art):
    """Dr. Tox with the shroud drawn closed to the hem, hood up, wrapped and densely crosshatched: the
    ring halves, and the heat builds."""
    tox(a, 100, 312, 1.8)
    for k in range(3):
        a.path(f"M{82 + k * 18},{110 + k * 6} C{80 + k * 18},180 {78 + k * 20},250 {76 + k * 22},306", fill="none",
               stroke=INK, stroke_width=2)


@asset(G, f"{M}-tox-turn", group="figures", title="Dr. Tox turned sideways (narrowing the ring)", w=200, h=320,
       row=kit.row(M, "Dr. Tox (the shroud open and closed, turning, a dart)"))
def tox_turn(a: Art):
    """Dr. Tox turned sideways to slip a gap, shoulders in, the shroud pulled tight: thinner than a
    person should be, a hand holding the cloth closed at the chest."""
    a.open("g", transform="translate(100,0) scale(0.62,1) translate(-100,0)")
    tox(a, 100, 312, 1.8)
    a.close()
    a.path("M108,140 C116,134 122,140 118,150 C112,156 104,152 108,140Z", fill="#26292a", stroke=INK, stroke_width=2.5)


@asset(G, f"{M}-tox-dart", group="figures", title="Dr. Tox throwing a dart (chapter 11)", w=240, h=320,
       row=kit.row(M, "Dr. Tox (the shroud open and closed, turning, a dart)"))
def tox_dart(a: Art):
    """Dr. Tox with one arm out of the shroud, the black gauntlet's four exposed barrels along the
    forearm and a clear line at the wrist, a dart just leaving the fingers in a short ink streak."""
    tox(a, 90, 312, 1.8)
    a.path("M108,118 L176,108 L178,124 L110,134Z", fill="#26292a", stroke=INK, stroke_width=3)
    for k in range(4):
        a.rect(124 + k * 11, 102, 7, 9, fill="#d8dddc", stroke=INK, stroke_width=1.5)
    a.path("M112,132 C130,140 150,134 170,122", fill="none", stroke="#d8dddc", stroke_width=3)
    a.path("M178,112 L190,110 L192,124 L180,124Z", fill="#26292a", stroke=INK, stroke_width=2.5)
    a.line(198, 114, 232, 108, stroke=INK, stroke_width=3)
    for k in range(4):
        a.line(196 - k * 6, 104 + k * 4, 206 - k * 6, 103 + k * 4, stroke=INK, stroke_width=1.5)


@asset(G, f"{M}-queue-1", group="figures", title="Queue: a woman with a bucket", w=200, h=320,
       row=kit.row(M, "The queue and the gala (lumpy figures, each a name to come)"))
def queue_1(a: Art):
    """A tired woman in the relief-hall queue in lumpy crosshatched pen, a bucket hanging from one hand,
    a few stippled plague marks at the neck; she is someone, and becomes a card if she enters the ring."""
    lumpy(a, 96, 312, 2.0, lean=-4, hunch=6)
    a.path("M132,206 L160,206 L156,250 L136,250Z", fill=BARE, stroke=INK, stroke_width=3)
    a.hatch(132, 206, 28, 44, angle=80, spacing=5, stroke=INK, stroke_width=1,
            clip=a.clip('<path d="M132,206 L160,206 L156,250 L136,250Z"/>'))
    a.path("M132,206 C136,188 156,188 160,206", fill="none", stroke=INK, stroke_width=2.5)


@asset(G, f"{M}-queue-2", group="figures", title="Queue: a man on a stick", w=200, h=320,
       row=kit.row(M, "The queue and the gala (lumpy figures, each a name to come)"))
def queue_2(a: Art):
    """A hunched man leaning on a stick, shoulders up round his ears, heavy pen hatching over a coat
    too big for him."""
    lumpy(a, 100, 312, 1.9, lean=10, hunch=12)
    a.line(150, 190, 162, 312, stroke=INK, stroke_width=6, stroke_linecap="round")
    a.path("M140,188 C150,180 160,186 156,196", fill="none", stroke=INK, stroke_width=4)


@asset(G, f"{M}-queue-3", group="figures", title="Queue: an elder wrapped in a blanket", w=200, h=320,
       row=kit.row(M, "The queue and the gala (lumpy figures, each a name to come)"))
def queue_3(a: Art):
    """An old person wrapped to the chin in a blanket with a stitched hem, lumpy and small, the blanket
    crosshatched in a different direction from the coat beneath."""
    d = lumpy(a, 100, 312, 1.75, hunch=4)
    blanket = "M58,150 C80,126 124,126 144,150 L150,270 C120,282 80,282 52,270Z"
    hatched(a, blanket, (50, 126, 102, 160), angle=20, spacing=5, fill="#d3c8ae", shade=False)
    a.path("M54,262 C84,272 120,272 148,262", fill="none", stroke=INK, stroke_width=2, stroke_dasharray="6 4")


@asset(G, f"{M}-queue-4", group="figures", title="Queue: two people leaning together", w=320, h=320,
       row=kit.row(M, "The queue and the gala (lumpy figures, each a name to come)"))
def queue_4(a: Art):
    """Two people in the queue leaning into each other, one holding the other up, packed shoulder to
    shoulder in dense crosshatching."""
    lumpy(a, 120, 312, 2.0, lean=12, hunch=4)
    lumpy(a, 196, 312, 1.9, lean=-10, hunch=8)
    a.path("M150,170 C164,176 174,176 184,168", fill="none", stroke=INK, stroke_width=5, stroke_linecap="round")


@asset(G, f"{M}-staff", group="figures", title="Relief staff with a baton", w=200, h=320,
       row=kit.row(M, "Relief staff and Spire security (sight cones)"))
def staff(a: Art):
    """One of the State's relief staff at the shutter: a peaked cap, a stiff coat, a baton held across
    the body and an armband lettered RCC; blocky where the queue is lumpy."""
    d = kit.person_d(100, 312, 2.05, broad=1.2)
    hatched(a, d, (40, 60, 120, 260), angle=45, spacing=7)
    a.path("M74,62 L126,62 L132,74 L68,74Z", fill="#26292a", stroke=INK, stroke_width=3)
    a.rect(52, 150, 30, 18, fill=BARE, stroke=INK, stroke_width=2)
    kit.label(a, 67, 164, "RCC", size=11, anchor="middle", font_weight="bold")
    a.line(60, 200, 150, 170, stroke=INK, stroke_width=9, stroke_linecap="round")


@asset(G, f"{M}-guest", group="figures", title="Gala guest with a glass", w=200, h=320,
       row=kit.row(M, "The queue and the gala (lumpy figures, each a name to come)"))
def guest(a: Art):
    """A gala guest in a long evening coat holding a glass at shoulder height, upright and unbothered,
    drawn in the same lumpy pen as the queue but with nothing stippled on the skin: the other class."""
    lumpy(a, 100, 312, 2.1, lean=-2, lesions=False, fill="#cfc6b2")
    a.path("M136,150 L150,118", fill="none", stroke=INK, stroke_width=4)
    a.path("M144,100 L160,100 L152,118Z", fill=BARE, stroke=INK, stroke_width=2.5)
    a.line(152, 118, 152, 128, stroke=INK, stroke_width=2)


@asset(G, f"{M}-security", group="figures", title="Spire security with an earpiece", w=200, h=320,
       row=kit.row(M, "Relief staff and Spire security (sight cones)"))
def security(a: Art):
    """Spire security: a broad figure in a fitted jacket, a coiled earpiece wire down the neck, hands
    clasped in front; densely hatched, a little cleaner-lined than everyone else."""
    d = kit.person_d(100, 312, 2.1, broad=1.3)
    hatched(a, d, (36, 56, 128, 260), angle=30, spacing=6)
    a.path("M108,70 C118,82 114,96 120,110 C126,122 120,134 124,146", fill="none", stroke=BARE, stroke_width=2.5)
    a.ellipse(100, 214, 20, 12, fill=FIG, stroke=INK, stroke_width=3)


@asset(G, f"{M}-kitchen-staff", group="figures", title="Ama Owusu and Lev Brandt at the service door", w=320, h=320,
       row=kit.row(M, "Ama and Lev, who open the service door"))
def kitchen_staff(a: Art):
    """Ama Owusu and Lev Brandt, plague-marked kitchen staff on day passes, in white aprons over their
    coats, one holding the service door's bar down: two people, not a crowd."""
    for x, s, lean in ((120, 2.0, 6), (210, 1.9, -6)):
        lumpy(a, x, 312, s, lean=lean)
        a.path(f"M{x - 22},{312 - 150} L{x + 22},{312 - 150} L{x + 26},{312 - 30} L{x - 26},{312 - 30}Z", fill=BARE,
               stroke=INK, stroke_width=2.5)
        a.line(x - 22, 312 - 150, x - 10, 312 - 186, stroke=INK, stroke_width=1.5)
        a.line(x + 22, 312 - 150, x + 10, 312 - 186, stroke=INK, stroke_width=1.5)
    a.line(150, 196, 182, 196, stroke=INK, stroke_width=6, stroke_linecap="round")


# ---- backdrops ---------------------------------------------------------------------------------
@asset(G, f"{M}-hall-far", group="backdrops", title="Crowd thread: relief hall (far layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the relief hall (parallax)"))
def hall_far(a: Art):
    """The relief hall's back wall in dense crosshatching on cheap off-white paper: high barred
    windows left as bare paper, dispensers along the wall each stamped RCC with an empty hopper, a
    number board stopped, notices pasted over notices, and the scuffed floor."""
    a.paper(PAPER, grain=0.5)
    wall = a.clip('<rect x="0" y="0" width="1920" height="430"/>')
    a.hatch(0, 0, 1920, 430, angle=35, spacing=8, clip=wall, jitter=1.2, stroke=INK, stroke_width=1, opacity=0.5)
    a.hatch(0, 0, 1920, 430, angle=-35, spacing=13, clip=wall, jitter=1.5, stroke=INK, stroke_width=1, opacity=0.3)
    a.rect(0, 430, 1920, 110, fill=WALL)
    a.hatch(0, 430, 1920, 110, angle=85, spacing=10, stroke=INK, stroke_width=1, opacity=0.35,
            clip=a.clip('<rect x="0" y="430" width="1920" height="110"/>'))
    a.line(0, 430, 1920, 430, stroke=INK, stroke_width=4)
    for x in range(60, 1920, 320):
        a.rect(x, 40, 180, 90, fill=BARE, stroke=INK, stroke_width=3)
        for k in range(1, 6):
            a.line(x + k * 30, 40, x + k * 30, 130, stroke=INK, stroke_width=3)
    for k, x in enumerate(range(100, 1920, 240)):
        a.rect(x, 200, 100, 170, fill="#cdc3aa", stroke=INK, stroke_width=3)
        a.rect(x + 14, 216, 72, 56, fill="#3a3a36", stroke=INK, stroke_width=2)
        a.rect(x + 14, 286, 72, 30, fill=BARE, stroke=INK, stroke_width=2)
        kit.label(a, x + 50, 308, "RCC", size=18, anchor="middle", font_weight="bold")
        a.rect(x + 30, 336, 40, 14, fill=INK)
        if k % 3 == 1:
            a.rect(x + 120, 220, 70, 90, fill=BARE, stroke=INK, stroke_width=2, transform=f"rotate(4 {x + 155} 265)")
            for j in range(5):
                a.line(x + 128, 236 + j * 14, x + 180 - (j % 2) * 16, 236 + j * 14, stroke=INK, stroke_width=2)
    a.rect(1500, 150, 200, 70, fill="#2a2a27", stroke=INK, stroke_width=3)
    kit.label(a, 1600, 200, "0417", size=40, family="monospace", anchor="middle", fill=BARE)


@asset(G, f"{M}-hall-mid", group="backdrops", title="Crowd thread: relief hall (mid layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the relief hall (parallax)"))
def hall_mid(a: Art):
    """Transparent mid layer of the relief hall: square pillars with pasted notices (QUEUE HERE, NO
    RATION WITHOUT CARD), and the queue's posts and sagging rope, all in heavy hatched pen."""
    for x in range(160, 1920, 480):
        d = f"M{x},0 L{x + 70},0 L{x + 70},470 L{x},470Z"
        hatched(a, d, (x, 0, 70, 470), angle=70, spacing=6, fill=WALL)
        a.rect(x - 14, 180, 98, 110, fill=BARE, stroke=INK, stroke_width=2.5, transform=f"rotate(-3 {x + 35} 235)")
        txt = ("QUEUE", "HERE") if (x // 480) % 2 == 0 else ("NO RATION", "W/O CARD")
        for j, t in enumerate(txt):
            kit.label(a, x + 35, 222 + j * 30, t, size=16, anchor="middle", font_weight="bold",
                      transform=f"rotate(-3 {x + 35} 235)", fit=kit.fitw(t, 16, 84, .66))
    for x in range(40, 1920, 160):
        a.line(x, 360, x, 470, stroke=INK, stroke_width=7)
        a.ellipse(x, 470, 18, 5, fill=INK)
        a.path(f"M{x},368 Q{x + 80},396 {x + 160},368", fill="none", stroke=INK, stroke_width=4)


@asset(G, f"{M}-hall-near", group="backdrops", title="Crowd thread: relief hall (near layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the relief hall (parallax)"))
def hall_near(a: Art):
    """Transparent near layer: the backs of heads and shoulders of people nearer the camera along the
    bottom edge in solid black ink, a bench end and a dropped bucket, sparse enough to see the queue."""
    for x in range(80, 1920, 300):
        s = 2.6 + (x % 7) * .05
        d = kit.person_d(x, 640, s, lean=(x % 5) - 2)
        a.path(d, fill=INK)
        a.hatch(x - 50, 400, 100, 140, angle=60, spacing=5, stroke=PAPER, stroke_width=1, opacity=0.35,
                clip=a.clip(f'<path d="{d}"/>'))
    a.rect(1040, 470, 160, 22, fill=WALL, stroke=INK, stroke_width=4)
    a.line(1060, 492, 1060, 540, stroke=INK, stroke_width=8)
    a.path("M1500,520 L1540,490 L1570,512 L1534,540Z", fill=BARE, stroke=INK, stroke_width=3)


@asset(G, f"{M}-gala-far", group="backdrops", title="Crowd thread: the gala floor (far layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the service corridor and the gala floor (parallax)"))
def gala_far(a: Art):
    """The Spire gala's far wall drawn in the same cheap crosshatch: tall windows onto a night city in
    dense black hatching with lit windows left bare, hanging lamps like inverted bells, and a polished
    floor drawn as long parallel strokes."""
    a.paper(PAPER, grain=0.5)
    for x in range(0, 1920, 240):
        a.rect(x + 20, 30, 200, 380, fill="#2a2a27", stroke=INK, stroke_width=4)
        cid = a.clip(f'<rect x="{x + 20}" y="30" width="200" height="380"/>')
        for k in range(6):
            bx = x + 26 + k * 32
            bh = 80 + (k * 53 + x) % 200
            a.rect(bx, 410 - bh, 26, bh, fill="#141412", clip_path=cid)
            for j in range(0, int(bh) - 20, 28):
                if (j + k + x) % 3 == 0:
                    a.rect(bx + 8, 420 - bh + j, 8, 8, fill=BARE, clip_path=cid)
    for x in range(120, 1920, 480):
        a.line(x, 0, x, 60, stroke=INK, stroke_width=2)
        a.path(f"M{x - 50},110 C{x - 40},60 {x + 40},60 {x + 50},110Z", fill=BARE, stroke=INK, stroke_width=3)
        a.hatch(x - 50, 60, 100, 50, angle=-40, spacing=5, stroke=INK, stroke_width=1,
                clip=a.clip(f'<path d="M{x - 50},110 C{x - 40},60 {x + 40},60 {x + 50},110Z"/>'))
    a.rect(0, 410, 1920, 130, fill=WALL)
    a.line(0, 410, 1920, 410, stroke=INK, stroke_width=4)
    for y in range(424, 540, 14):
        a.line(0, y, 1920, y, stroke=INK, stroke_width=1, opacity=0.4)


@asset(G, f"{M}-gala-mid", group="backdrops", title="Crowd thread: the gala floor (mid layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the service corridor and the gala floor (parallax)"))
def gala_mid(a: Art):
    """Transparent mid layer of the gala: stone columns and, between them, a clean-air column of glass
    with a plate stamped RCC at its foot, and round tables with long cloths, all hatched in pen."""
    for k, x in enumerate(range(100, 1920, 420)):
        if k % 2 == 0:
            d = f"M{x},0 L{x + 80},0 L{x + 80},440 L{x},440Z"
            hatched(a, d, (x, 0, 80, 440), angle=80, spacing=7, fill=WALL)
        else:
            a.rect(x, 0, 80, 440, fill=BARE, stroke=INK, stroke_width=4)
            for j in range(4):
                a.line(x + 18 + j * 15, 20, x + 18 + j * 15, 360, stroke=INK, stroke_width=1, opacity=0.5)
            a.rect(x + 4, 380, 72, 40, fill=FIG, stroke=INK, stroke_width=3)
            kit.label(a, x + 40, 408, "RCC", size=20, anchor="middle", font_weight="bold")
        tx = x + 240
        d = f"M{tx - 90},380 L{tx + 90},380 L{tx + 100},470 L{tx - 100},470Z"
        hatched(a, d, (tx - 100, 380, 200, 90), angle=10, spacing=6, fill=BARE)
        a.ellipse(tx, 380, 90, 10, fill=BARE, stroke=INK, stroke_width=3)


@asset(G, f"{M}-gala-near", group="backdrops", title="Crowd thread: the gala floor (near layer)", w=1920, h=540,
       row=kit.row(M, "Backdrops: the service corridor and the gala floor (parallax)"))
def gala_near(a: Art):
    """Transparent near layer of the gala: tall flower arrangements and the shoulders of guests close
    to the camera in solid black ink along the bottom, a tray of glasses held up into the frame."""
    for x in range(140, 1920, 360):
        d = kit.person_d(x, 650, 2.8, broad=1.1)
        a.path(d, fill=INK)
    for x in range(330, 1920, 720):
        a.path(f"M{x - 40},540 L{x - 30},430 L{x + 30},430 L{x + 40},540Z", fill=WALL, stroke=INK, stroke_width=4)
        for k in range(7):
            cx, cy = x - 60 + k * 20, 400 - (k % 3) * 30
            a.circle(cx, cy, 22, fill=BARE, stroke=INK, stroke_width=3)
            a.hatch(cx - 22, cy - 22, 44, 44, angle=30, spacing=5, stroke=INK, stroke_width=1,
                    clip=a.clip(f'<circle cx="{cx}" cy="{cy}" r="22"/>'))
    a.rect(1100, 470, 200, 12, fill=BARE, stroke=INK, stroke_width=3)
    for k in range(5):
        a.path(f"M{1116 + k * 38},470 L{1108 + k * 38},440 L{1132 + k * 38},440Z", fill=BARE, stroke=INK, stroke_width=2)


# ---- pieces ------------------------------------------------------------------------------------
@asset(G, f"{M}-ring", group="pieces", title="The breath radius: a ring of bare paper", w=480, h=220,
       row=kit.row(M, "The breath radius (a ring of bare white)"))
def ring(a: Art):
    """The breath radius seen on the floor: an ellipse of bare white paper wiped clean of all hatching,
    edged with a dashed pen line and short ticks pointing out, centred on him. Stretch it with Pulse;
    halve it with the shroud closed."""
    a.ellipse(240, 110, 232, 102, fill=BARE, opacity=0.96)
    a.ellipse(240, 110, 232, 102, fill="none", stroke=INK, stroke_width=3, stroke_dasharray="14 9")
    for k in range(16):
        t = 2 * math.pi * k / 16
        x1, y1 = 240 + 232 * math.cos(t), 110 + 102 * math.sin(t)
        x2, y2 = 240 + 216 * math.cos(t), 110 + 95 * math.sin(t)
        a.line(x1, y1, x2, y2, stroke=INK, stroke_width=2)


@asset(G, f"{M}-sight-cone", group="pieces", title="A staff member's sight cone", w=480, h=220,
       row=kit.row(M, "Relief staff and Spire security (sight cones)"))
def sight_cone(a: Art):
    """A sight cone drawn as a wedge of loose diagonal hatching opening to the right from a point on the
    left edge, its rim a broken pen line; the module stretches it to the watcher's facing."""
    d = "M4,110 L476,8 L476,212Z"
    a.path(d, fill=INK, opacity=0.08)
    a.hatch(0, 0, 480, 220, angle=-20, spacing=11, clip=a.clip(f'<path d="{d}"/>'), stroke=INK, stroke_width=1.2,
            opacity=0.55)
    a.path("M4,110 L476,8 M4,110 L476,212", fill="none", stroke=INK, stroke_width=2.5, stroke_dasharray="10 6")


@asset(G, f"{M}-poster", group="pieces", title="State poster: REPORT THIS MAN", w=200, h=280,
       row=kit.row(M, "Posters of his face (security_knows_face)"))
def poster(a: Art):
    """A State poster pasted crooked on a pillar: REPORT THIS MAN over a crosshatched head-and-shoulders
    shape with its hood up and no face drawn in, a stamped RCC in the corner and a torn edge."""
    a.path("M8,10 L192,4 L196,268 L170,274 L150,262 L120,276 L10,272Z", fill=BARE, stroke=INK, stroke_width=3)
    kit.label(a, 100, 44, "REPORT", size=30, anchor="middle", font_weight="bold")
    kit.label(a, 100, 74, "THIS MAN", size=26, anchor="middle", font_weight="bold")
    d = "M100,96 C126,96 136,120 134,146 L160,166 L168,230 L32,230 L40,166 L66,146 C64,120 74,96 100,96Z"
    hatched(a, d, (30, 96, 140, 136), angle=45, spacing=4, fill="#cfc6b2", sw_out=2.5)
    a.rect(132, 236, 52, 26, fill="none", stroke=INK, stroke_width=2, transform="rotate(-6 158 249)")
    kit.label(a, 158, 256, "RCC", size=16, anchor="middle", font_weight="bold", transform="rotate(-6 158 249)")


@asset(G, f"{M}-sign-suspended", group="pieces", title="Hand-lettered sign: RELIEF SUSPENDED", w=520, h=120,
       row=kit.row(M, "The shutter and its sign"))
def sign_suspended(a: Art):
    """A hand-lettered card sign, RELIEF SUSPENDED, in thick uneven marker capitals on cheap card, taped
    at the corners, hung slightly crooked."""
    a.rect(14, 14, 492, 92, fill=BARE, stroke=INK, stroke_width=3, transform="rotate(-1.5 260 60)")
    a.open("g", transform="rotate(-1.5 260 60)", filter=a.roughen(1.6, 0.08))
    kit.label(a, 260, 78, "RELIEF SUSPENDED", size=48, anchor="middle", font_weight="bold", fit=450)
    a.close()
    for x, y in ((10, 10), (484, 6), (12, 96), (486, 92)):
        a.rect(x, y, 26, 14, fill="#d8cfb6", opacity=0.9, transform=f"rotate(20 {x + 13} {y + 7})")


@asset(G, f"{M}-shutter", group="pieces", title="The relief hall's shutter, down", w=480, h=420,
       row=kit.row(M, "The shutter and its sign"))
def shutter(a: Art):
    """The steel roller shutter at the end of the queue, pulled down at noon: horizontal slats in pen,
    a chain at one side, hatched shadow under the lip; where the run ends."""
    a.rect(20, 20, 440, 380, fill=WALL, stroke=INK, stroke_width=5)
    for y in range(34, 400, 18):
        a.line(20, y, 460, y, stroke=INK, stroke_width=2.5)
    a.hatch(20, 20, 440, 380, angle=80, spacing=9, stroke=INK, stroke_width=1, opacity=0.4,
            clip=a.clip('<rect x="20" y="20" width="440" height="380"/>'))
    a.rect(0, 0, 480, 26, fill="#3a3a36", stroke=INK, stroke_width=3)
    for y in range(40, 330, 16):
        a.ellipse(470, y, 5, 8, fill="none", stroke=INK, stroke_width=2)


@asset(G, f"{M}-service-door", group="pieces", title="The Spire's service door", w=220, h=340,
       row=kit.row(M, "Ama and Lev, who open the service door"))
def service_door(a: Art):
    """A plain steel service door in the Spire's back corridor, a push bar, SERVICE stencilled on it and
    a slot of light under it, all in hatched pen."""
    d = "M20,10 L200,10 L200,330 L20,330Z"
    hatched(a, d, (20, 10, 180, 320), angle=75, spacing=7, fill=WALL)
    a.rect(40, 170, 140, 16, rx=6, fill=BARE, stroke=INK, stroke_width=3)
    a.rect(50, 60, 120, 36, fill=BARE, stroke=INK, stroke_width=2)
    kit.label(a, 110, 86, "SERVICE", size=22, anchor="middle", font_weight="bold", fit=104)
    a.rect(20, 322, 180, 8, fill=BARE)

"""Title lettering and the two thread objects."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G


@asset(G, "title", group="title", title="Project: Man Eater, title lettering", w=1600, h=500,
       row="Title lettering, stencil with a HOLD overprint")
def title(a: Art):
    """The title sprayed through a cut stencil onto a ruled intake form: PROJECT: small, MAN EATER large,
    with a red HOLD rubber stamp struck across it, the form's 22:00 box left empty, and frost starting
    in the corners."""
    a.paper(kit.PAPER, grain=0.28)
    # the form under the paint
    d = "".join(f"M70,{y}H1560" for y in range(60, 480, 34))
    a.path(d, stroke=kit.FROST, stroke_width=1, opacity=0.45, fill="none")
    a.line(128, 0, 128, 500, stroke=kit.RED, stroke_width=1, opacity=0.25)
    for y in (90, 250, 410):
        kit.punch(a, 62, y, 13)
    kit.typed(a, 150, 44, "FORM 7-F", size=20)
    kit.typed(a, 1540, 44, "RESULTS REQUIRED: 1", size=20, anchor="end")
    kit.carbon(a, 140, 60, 1400, 380, n=5, op=0.09)
    # overspray, then the letters
    a.open("g", filter=a.blur(7), opacity=0.22)
    kit.block_text(a, 152, 74, "PROJECT:", 84, bridges=False)
    kit.block_text(a, 152, 190, "MAN EATER", 200, bridges=False)
    a.close()
    a.open("g", filter=a.roughen(2.2, 0.09))
    kit.block_text(a, 150, 72, "PROJECT:", 84)
    kit.block_text(a, 150, 188, "MAN EATER", 200)
    a.close()
    # paint that missed: flecks along the lower edge of the stencil
    a.stipple(150, 380, 1380, 26, n=260, r=(0.5, 1.8), fill=kit.INK, opacity=0.5,
              density=lambda x, y: 0.7 if (x // 40) % 3 else 0.2)
    # the schedule's empty slot
    kit.typed(a, 150, 458, "22:00", size=24)
    a.rect(250, 432, 430, 36, fill="none", stroke=kit.INK, stroke_width=2)
    kit.typed(a, 1540, 458, "DAY 1 / 06:00 / WARD B", size=20, anchor="end")
    # HOLD, struck late and crooked
    a.open("g", transform="translate(1268,150) rotate(-7) scale(0.72)", opacity=0.9, filter=kit.ink_filter(a, 0.55, 3))
    a.rect(-300, -112, 600, 224, fill="none", stroke=kit.RED, stroke_width=14)
    a.rect(-280, -92, 560, 184, fill="none", stroke=kit.RED, stroke_width=3)
    kit.block_text(a, -kit.block_width("HOLD", 140, 14) / 2, -70, "HOLD", 140, fill=kit.RED, sw=30, gap=14)
    a.close()
    kit.frost_corners(a, 0.28, op=0.9)
    a.vignette(0.22)


@asset(G, "thread-own", group="thread", title="The envelope stamped HOLD", w=480, h=480, row="Thread")
def thread_own(a: Art):
    """A sealed letter that never left the base: a worn envelope lying on the mail room's steel counter,
    its address a child's house drawn small in pencil, a red HOLD stamp across the front and frost
    creeping in from one corner."""
    a.paper("#767c80", grain=0.3, fibre=0.5)
    a.hatch(0, 0, 480, 480, angle=4, spacing=7, stroke="#5f6569", stroke_width=1, opacity=0.5, jitter=2)
    light = a.gradient([(0, "#ffffff"), (1, "#000000")], 0, 0, 0.6, 1)
    a.rect(0, 0, 480, 480, fill=light, opacity=0.16)
    a.open("g", transform="rotate(-7 240 250)")
    a.poly([(72, 150), (424, 150), (470, 420), (118, 420)], fill="#000", opacity=0.3, filter=a.blur(8))
    a.rect(60, 130, 360, 230, fill=kit.PAPER, stroke="#8d866f", stroke_width=1.5)
    a.path("M60,130 L240,262 L420,130", fill="none", stroke="#a59d86", stroke_width=2)
    a.path("M60,360 L196,238 M420,360 L284,238", fill="none", stroke="#b9b29c", stroke_width=1.5)
    a.path("M60,130 L240,262 L420,130Z", fill="#000", opacity=0.05)
    # the address, in pencil: lines that are a hand, and a house
    for i, (x0, ln) in enumerate([(150, 150), (150, 190), (150, 120)]):
        y = 290 + i * 22
        pts = [(x0 + t * 6, y + 3 * math.sin(t * 1.7 + i) * (1 if t % 5 else 0.2)) for t in range(int(ln / 6))]
        a.wobble(pts, amp=1.4, step=5, stroke="#4b4a47", stroke_width=1.6, opacity=0.8)
    kit.suit(a, "houses", 104, 306, 22, color="#4b4a47", sw=1.8)
    # postage that was never cancelled
    a.rect(356, 146, 48, 58, fill=kit.CREAM, stroke=kit.GREEN, stroke_width=2, stroke_dasharray="3 2")
    kit.suit(a, "stars", 380, 175, 13, color=kit.GREEN, sw=1.5)
    kit.stamp(a, 232, 238, "HOLD", w=250, h=92, rot=-14, opacity=0.9)
    a.close()
    kit.frost(a, 480, 480, 182, 268, 210, n=9)
    kit.frost(a, 0, 0, 4, 86, 90, n=5)
    kit.film(a, 0, 0, 480, 480, 0.3)
    a.vignette(0.45)


@asset(G, "thread-guest", group="thread", title="The tea caddy on the staff shelf", w=480, h=480, row="Thread")
def thread_guest(a: Art):
    """A blue-and-white tea caddy with a company mark on its side, standing on a steel shelf in the staff
    mess between a stencilled ration tin and a stack of enamel mugs, under the green and cream wall;
    light from the high window throws its shadow long and down."""
    a.paper(kit.CREAM, grain=0.25)
    a.rect(0, 250, 480, 230, fill=kit.GREEN)
    a.rect(0, 246, 480, 6, fill="#3f4f44")
    kit.hatch_in(a, 0, 252, 480, 228, angle=90, spacing=40, stroke="#4c5e51", stroke_width=1.5, opacity=0.5)
    # light from the window, top left
    a.poly([(0, 0), (260, 0), (480, 300), (480, 480), (200, 480)], fill="#fff", opacity=0.08)
    # the shelf
    a.rect(0, 350, 480, 20, fill=kit.STEEL)
    a.rect(0, 370, 480, 8, fill="#5d6164")
    a.rect(0, 346, 480, 5, fill="#c3c7c9")
    for bx in (60, 420):
        a.poly([(bx - 5, 378), (bx + 5, 378), (bx + 5, 440), (bx - 30, 378)], fill="#5d6164")
    # shadows falling long and down the wall
    a.open("g", fill="#000", opacity=0.22, filter=a.blur(6))
    a.poly([(170, 378), (300, 378), (360, 480), (230, 480)])
    a.poly([(44, 378), (130, 378), (190, 480), (104, 480)])
    a.poly([(336, 378), (410, 378), (470, 480), (396, 480)])
    a.close()
    # ration tin, stencilled
    a.rect(42, 262, 88, 88, fill="#6f776f", stroke=kit.INK, stroke_width=2)
    a.rect(42, 262, 88, 10, fill="#555c56")
    kit.stencil(a, 86, 318, "7-F", 26, fill=kit.CREAM, anchor="middle")
    # mugs
    for i in range(3):
        y = 322 - i * 24
        a.rect(346, y, 52, 28, rx=4, fill=kit.SNOW, stroke=kit.INK, stroke_width=2)
        a.rect(346, y, 52, 5, fill=kit.FROST)
        a.path(f"M398,{y + 6} q16,8 0,16", fill="none", stroke=kit.INK, stroke_width=3)
    # the caddy: a square-shouldered tin, white with blue painting
    cx = 236
    a.rect(cx - 62, 198, 124, 152, rx=6, fill=kit.SNOW, stroke=kit.INK, stroke_width=2.5)
    a.rect(cx - 38, 172, 76, 30, rx=5, fill=kit.SNOW, stroke=kit.INK, stroke_width=2.5)
    a.rect(cx - 38, 172, 76, 9, rx=4, fill=kit.PRUSSIAN)
    blue = dict(stroke=kit.PRUSSIAN, fill="none", stroke_linecap="round")
    a.rect(cx - 62, 206, 124, 12, fill=kit.PRUSSIAN)
    a.rect(cx - 62, 328, 124, 12, fill=kit.PRUSSIAN)
    d = "".join(f"M{cx - 56 + i * 16},224 q8,10 16,0" for i in range(7))
    d += "".join(f"M{cx - 56 + i * 16},322 q8,-10 16,0" for i in range(7))
    a.path(d, stroke_width=2, **blue)
    # painted branches either side of the mark
    for sg in (-1, 1):
        pts = [(cx + sg * 54, 312), (cx + sg * 46, 286), (cx + sg * 50, 258), (cx + sg * 42, 236)]
        a.path(a.smooth_d(pts), stroke_width=2.2, **blue)
        for (px, py) in pts[1:]:
            a.ellipse(px - sg * 7, py + 4, 6, 3, fill=kit.PRUSSIAN, transform=f"rotate({-sg * 35} {px - sg * 7} {py + 4})")
            a.ellipse(px + sg * 5, py - 6, 5, 2.5, fill=kit.FROST, transform=f"rotate({sg * 40} {px + sg * 5} {py - 6})")
    # the company mark: a roundel with a ship's wheel of leaves
    a.circle(cx, 274, 30, fill=kit.SNOW, stroke=kit.PRUSSIAN, stroke_width=3)
    a.circle(cx, 274, 23, fill="none", stroke=kit.PRUSSIAN, stroke_width=1.2)
    for i in range(8):
        ang = math.radians(i * 45)
        a.line(cx + 7 * math.cos(ang), 274 + 7 * math.sin(ang), cx + 19 * math.cos(ang), 274 + 19 * math.sin(ang),
               stroke=kit.PRUSSIAN, stroke_width=2.4, stroke_linecap="round")
    a.circle(cx, 274, 5, fill=kit.PRUSSIAN)
    kit.typed(a, cx, 314, "& Co.", size=12, fill=kit.PRUSSIAN, anchor="middle", ghost=False)
    a.line(cx - 50, 204, cx - 50, 344, stroke="#fff", stroke_width=5, opacity=0.5)
    # the inventory tag wired to the shelf
    a.poly([(150, 384), (214, 384), (222, 396), (214, 408), (150, 408)], fill=kit.PAPER, stroke=kit.INK, stroke_width=1.5)
    kit.typed(a, 156, 401, "STAFF", size=13, ghost=False)
    kit.frost(a, 0, 480, 274, 356, 120, n=6)
    kit.film(a, 0, 0, 480, 480, 0.28)
    a.vignette(0.4)

"""Phase 3 (accepted 2026-11-15, built 2026-11-16): the Four Marks and the Lamp-Keeper's tool.

The Lamp-Keeper's group left four marks through the world. Each sits at a height, one to five, on its
object; read from the hall to the heart, the four heights are the old phrase (3 4 2 1), which ends home.
Each card is scrimshaw on ivory, the ledger's own page: the object, a five-notch scale cut down its left
edge (one at the foot, five at the top), and the group's sign cut beside the notch of its height, the
notch cut deep and rubbed red. The Lamp-Keeper's tool shows the key: four signs over four beads, the last
one home."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Phase 3: the Four Marks, the Lamp-Keeper's tool"
INK = kit.INK
# the old group's signs, in the order they went: the brother sent up with nothing, the Lamp-Keeper who
# stayed, the one the Warden took, and the one who held the first by the hand at the heart
SIGN = {"board": "wave", "wall": "spiral", "hook": "fork", "chamber": "star"}
HEIGHT = {"board": 3, "wall": 4, "hook": 2, "chamber": 1}


def page(a):
    """A loose ivory page, grained and lightly hatched, with no frame: it lies on the ledger."""
    a.paper(kit.IVORY, grain=0.25, fibre=1.1)
    kit.grain_lines(a, 0, 0, a.w, a.h, int(a.h / 24), "#8a7350", 0.3, amp=3)


def scale(a, h, x=34, y0=276, step=50):
    """Five notches down the left edge; the one at height h cut deep and rubbed red. Returns its y."""
    yy = None
    for k in range(1, 6):
        y = y0 - (k - 1) * step
        deep = k == h
        kit.scratch(a, f"M{x},{f(y)} h{26 if deep else 14}", sw=4.2 if deep else 1.8, ink=kit.DEEP if deep else INK)
        a.text(x - 14, y + 6, str(k), size=15, family="serif", fill=INK, text_anchor="middle", opacity=0.75)
        if deep:
            yy = y
    kit.scratch(a, f"M{x + 6},{f(y0 + 16)} V{f(y0 - 4 * step - 16)}", sw=1.0, light=None, opacity=0.5)
    return yy


def sign(a, kind, cx, cy, s=17, col=None):
    kit.draw_mark(a, kind, cx, cy, s, color=col or INK, sw=3.2, light="#fffaf0")


@asset(G, "marks-board", group="documents", title="The first mark: the rim of the oldest board", w=320, h=320, row=ROW)
def m_board(a: Art):
    """The rim of the oldest board in the hall, seen end-on: the near keep and two hollows, and along the rim the
    tally the group kept, stopped at three. The wave is cut beside the third notch: the brother sent up the shaft
    with nothing, whose game is still one move from finished."""
    page(a)
    y = scale(a, HEIGHT["board"])
    board = "M84,70 C84,44 296,44 296,70 L296,290 C296,312 84,312 84,290Z"
    a.path(board, fill="#000", opacity=0.2, transform="translate(4,5)")
    a.path(board, fill="#e2d2b0")
    kit.scratch(a, board, sw=2.4)
    for cy in (118, 186, 254):
        kit.scratch(a, kit.circ_d(206, cy, 30), sw=2)
        a.hatch(176, cy - 30, 60, 60, angle=30, spacing=4, clip=a.clip(f'<circle cx="206" cy="{cy}" r="28"/>'), stroke=INK, stroke_width=0.6, opacity=0.5)
    a.path(kit.lozenge_d(206, 254, 12, 8), fill=INK)
    # the rim's tally: notches up the board's edge, stopped at the third
    for k in range(5):
        yy = 276 - k * 50
        kit.scratch(a, f"M92,{f(yy)} h{16 if k < 3 else 8}", sw=2.4 if k < 3 else 1.0, light=None, opacity=1 if k < 3 else 0.4)
    sign(a, SIGN["board"], 132, y)


@asset(G, "marks-wall", group="documents", title="The second mark: the gap on the Stencil Wall", w=320, h=320, row=ROW)
def m_wall(a: Art):
    """A row of three hand stencils on the Stencil Wall, ochre and charcoal, and a gap where a fourth should be.
    In the gap, scratched with a tool rather than blown, the spiral, at the fourth height: the Lamp-Keeper's own
    place, kept empty."""
    page(a)
    y = scale(a, HEIGHT["wall"])
    for i, col in enumerate((kit.OCHRE, kit.CHAR, kit.OCHRE)):
        cx = 100 + i * 58
        a.circle(cx, 210, 40, fill=a.radial([(0.2, col, 0.45), (1, col, 0)]))
        a.path(kit.hand_d(cx, 210, 0.36, -6 + i * 6, 0.95), fill="#efe3c8", stroke=col, stroke_width=1.2)
    kit.scratch(a, "M270,150 v120 M262,150 h16 M262,270 h16", sw=1.0, light=None, opacity=0.45, stroke_dasharray="4 5")
    sign(a, SIGN["wall"], 270, y, s=19, col=kit.DEEP)
    kit.scratch(a, f"M60,{f(y)} H{f(250)}", sw=0.9, light=None, opacity=0.35, stroke_dasharray="2 6")


@asset(G, "marks-hook", group="documents", title="The third mark: the hook in the Warden's hold", w=320, h=320, row=ROW)
def m_hook(a: Art):
    """The old carved hook, grey and smooth, healed half into the milky skin of the Warden's hold among other
    kept gifts. Its grip is ringed with five cut bands; the fork is cut beside the second: the one the Warden took."""
    page(a)
    y = scale(a, HEIGHT["hook"])
    skin = "M60,300 C110,250 250,250 316,290 L316,320 L60,320Z"
    a.path(skin, fill="#d9d2c8", opacity=0.9)
    kit.scratch(a, "M60,300 C110,250 250,250 316,290", sw=1.6)
    for (x, r) in ((112, -20), (268, 24)):
        a.path(f"M{x},300 l{f(18 * math.cos(math.radians(r - 90)))},{f(18 * math.sin(math.radians(r - 90)))}", stroke=INK, stroke_width=5, fill="none", stroke_linecap="round", opacity=0.4)
    hook = "M186,300 L186,96 C186,46 240,44 242,94 C243,112 236,124 226,130 L218,118 C225,112 228,104 227,94 C225,66 200,66 200,96 L200,300Z"
    a.path(hook, fill="#000", opacity=0.2, transform="translate(4,5)")
    a.path(hook, fill="#d6ccbc")
    kit.scratch(a, hook, sw=2.2)
    for k in range(5):
        yy = 276 - k * 50
        kit.scratch(a, f"M186,{f(yy)} h14", sw=1.4, light=None)
    kit.scratch(a, "M190,130 l6,40 l-4,30", sw=0.8, light=None, opacity=0.6)
    sign(a, SIGN["hook"], 150, y)


@asset(G, "marks-chamber", group="documents", title="The fourth mark: the mouth of the shared chamber", w=320, h=320, row=ROW)
def m_chamber(a: Art):
    """The shared chamber as the back of the chart draws it, in red ink on vellum: one vessel in, two out. At the
    mouth two signs are cut side by side, low, at the first height, home; at the outlets the same two signs again,
    apart. Two who held together, and the valve."""
    a.paper(kit.VELLUM, grain=0.3, fibre=1.0)
    kit.grain_lines(a, 0, 0, 320, 320, 12, "#8a7350", 0.25, amp=3)
    y = scale(a, HEIGHT["chamber"])
    red = kit.DEEP
    kit.scratch(a, "M190,300 C190,250 186,226 188,206", sw=3, ink=red, light=None)
    kit.scratch(a, kit.circ_d(190, 160, 48), sw=3, ink=red, light=None)
    kit.scratch(a, "M160,124 C140,92 116,70 92,46 M220,124 C240,92 264,70 290,46", sw=3, ink=red, light=None)
    for kind, x in (("wave", 152), ("star", 186)):
        sign(a, kind, x, y, s=14)
    sign(a, "wave", 92, 74, s=12)
    sign(a, "star", 286, 74, s=12)
    kit.scratch(a, f"M60,{f(y)} H{f(136)}", sw=0.9, light=None, opacity=0.35, stroke_dasharray="2 6")


@asset(G, "marks-unknown", group="documents", title="A mark not yet found", w=320, h=320, row=ROW)
def m_unknown(a: Art):
    """A blank page of the ledger: the five-notch scale and nothing beside it yet."""
    page(a)
    scale(a, 0)
    kit.scratch(a, "M110,110 h150 v150 h-150Z", sw=1.2, light=None, opacity=0.4, stroke_dasharray="5 7")
    a.text(185, 194, "?", size=54, family="serif", fill=INK, text_anchor="middle", opacity=0.35)


@asset(G, "keeper-underside", group="documents", title="The Lamp-Keeper's tool, turned over", w=480, h=260, row=ROW)
def keeper(a: Art):
    """The inside face of the Lamp-Keeper's worn tool, the one his brother made for him: four signs cut small in a row
    (the wave, the spiral, the fork, the star) and over each a bead on a strand, the beads left uncut except the
    last, which sits on the lowest line: home. The key to the Four Marks: they are a phrase."""
    a.paper("#dccba6", grain=0.3, fibre=1.2)
    d = "M30,60 C30,30 450,30 450,60 L450,200 C450,230 30,230 30,200Z"
    a.path(d, fill=a.radial([(0, "#f1e5c8", 1), (0.7, "#d9c7a0", 1), (1, "#a8946c", 1)], cx=0.45, cy=0.4, r=0.8), stroke=INK, stroke_width=1.8)
    a.open("g", clip_path=a.clip(f'<path d="{d}"/>'))
    kit.grain_lines(a, 0, 0, 480, 260, 10, "#8a7350", 0.45, amp=5)
    a.close()
    blue = kit.MARROW2
    for k in range(5):
        kit.scratch(a, f"M70,{f(60 + k * 20)} H410", sw=0.8, ink=blue, light=None, opacity=0.55)
    for i, kind in enumerate(("wave", "spiral", "fork", "star")):
        x = 110 + i * 86
        if i == 3:
            a.circle(x, 140, 10, fill=blue, stroke=blue, stroke_width=2)
        else:
            a.circle(x, 100, 9, fill="none", stroke=blue, stroke_width=2, stroke_dasharray="3 3")
        kit.draw_mark(a, kind, x, 186, 15, color=blue, sw=2.8, light="#fffaf0")
    kit.scratch(a, "M390,158 h40", sw=1.4, ink=blue, light=None)
    a.circle(240, 130, 260, fill=a.radial([(0.6, "#000", 0), (1, "#000", 0.25)]))

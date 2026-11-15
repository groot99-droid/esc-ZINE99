"""Floor Plan: cyanotype room stamps, the void, the plan sheet, the elevation strip and the ghost layer."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, SODIUM, FROST, SNOW = kit.INK, kit.SODIUM, kit.FROST, kit.SNOW
BLUE, LINE = kit.PRUSSIAN, kit.BLUELINE
PALE = "#CFE0FF"
ROW = "Room stamps, void, elevation strip, ghost layer"
S = 240


def _W(a, pts, closed=False, sw=3.2, **kw):
    kw.setdefault("stroke", LINE)
    a.path(a.wobble_d(pts, 0.7, 18, closed), fill="none", stroke_width=sw, stroke_linecap="square", stroke_linejoin="miter",
           **kw)


def _rect(a, x, y, w, h, sw=2, **kw):
    _W(a, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], closed=True, sw=sw, **kw)


def _stamp_base(a, label, door=(120, 190), thick=False):
    """A square of blueprint printed from a rubber block: rough edge, thin ink in places."""
    a.open("g", filter=a.roughen(3.5, 0.05))
    a.rect(8, 8, S - 16, S - 16, rx=4, fill=BLUE)
    a.close()
    cl = a.clip(f'<rect x="8" y="8" width="{S - 16}" height="{S - 16}"/>')
    kit.speckle(a, cl, 0, 0, S, S, color="#0b1c3a", strength=0.35, freq=0.8)
    a.grid(24, 24, S - 48, S - 48, 16, stroke=LINE, stroke_width=0.4, opacity=0.22)
    # walls, with the door gap and its swing on the lower wall
    x0, y0, x1, y1 = 34, 34, S - 34, 190
    dx = door[0]
    sw = 6 if thick else 4
    _W(a, [(dx - 16, y1), (x0, y1), (x0, y0), (x1, y0), (x1, y1), (dx + 16, y1)], sw=sw)
    if thick:
        _W(a, [(dx - 16, y1 - 9), (x0 + 9, y1 - 9), (x0 + 9, y0 + 9), (x1 - 9, y0 + 9), (x1 - 9, y1 - 9), (dx + 16, y1 - 9)],
           sw=1.6)
    a.path(f"M{dx - 16},{y1} v-32 a32,32 0 0 1 32,32", fill="none", stroke=PALE, stroke_width=1.5)
    kit.stencil(a, S / 2, 220, label, 17 if len(label) > 10 else 20, fill=LINE, anchor="middle")
    return x0, y0, x1, y1


ROOMS = {}


def _room(key, label, doc, **base):
    def deco(fn):
        def run(a: Art):
            box = _stamp_base(a, label, **base)
            fn(a, *box)
        run.__doc__ = doc
        asset(G, f"room-{key}", group="pieces", title=f"Floor Plan room stamp: {label.title()}", w=S, h=S, row=ROW)(run)
        return fn
    return deco


@_room("bunk", "BUNK", "Blueprint room stamp for a bunk room: white walls on Prussian blue, two beds with their pillows, "
       "the one window, the clock on the wall and the door swing.")
def _bunk(a, x0, y0, x1, y1):
    for bx in (x0 + 12, x1 - 62):
        _rect(a, bx, y0 + 26, 50, 96)
        _rect(a, bx + 8, y0 + 32, 34, 18, sw=1.4, stroke=PALE)
        a.path(f"M{bx},{y0 + 60}h50", stroke=PALE, stroke_width=1.2)
    a.rect(S / 2 - 22, y0 - 4, 44, 8, fill=BLUE, stroke=LINE, stroke_width=1.5)
    a.circle(S / 2, y0 + 22, 9, fill="none", stroke=LINE, stroke_width=1.8)
    a.path(f"M{S / 2},{y0 + 22}l-4,-5M{S / 2},{y0 + 22}v-7", stroke=LINE, stroke_width=1.4)


@_room("latrine", "LATRINE", "Blueprint room stamp for the latrine: three stalls against one wall, a row of basins "
       "against the other, and the window Fisk climbs out of.")
def _latrine(a, x0, y0, x1, y1):
    for i in range(3):
        _rect(a, x0 + 8 + i * 42, y0 + 8, 42, 60)
        a.ellipse(x0 + 29 + i * 42, y0 + 30, 9, 12, fill="none", stroke=PALE, stroke_width=1.5)
    for i in range(4):
        a.circle(x1 - 22, y0 + 26 + i * 32, 9, fill="none", stroke=LINE, stroke_width=1.8)
        a.circle(x1 - 22, y0 + 26 + i * 32, 2, fill=LINE)
    a.rect(x0 - 4, 110, 8, 40, fill=BLUE, stroke=LINE, stroke_width=1.5)


@_room("cafeteria", "CAFETERIA", "Blueprint room stamp for the cafeteria: two long tables with their benches and the "
       "serving hatch in the far wall.")
def _cafeteria(a, x0, y0, x1, y1):
    for ty in (y0 + 44, y0 + 100):
        _rect(a, x0 + 22, ty, 128, 22)
        a.path(f"M{x0 + 22},{ty - 9}h128M{x0 + 22},{ty + 31}h128", stroke=PALE, stroke_width=3, stroke_dasharray="14 5")
    a.rect(S / 2 - 34, y0 - 5, 68, 10, fill=BLUE, stroke=LINE, stroke_width=1.5)
    a.path(f"M{S / 2 - 34},{y0 + 12}h68", stroke=PALE, stroke_width=1.5, stroke_dasharray="3 3")


@_room("rec-room", "REC ROOM", "Blueprint room stamp for the rec room: the round card table and six chairs, one bulb "
       "marked over it.")
def _rec(a, x0, y0, x1, y1):
    cx, cy = S / 2, 108
    _W(a, kit.circ_pts(cx, cy, 38, 20), closed=True)
    for i in range(6):
        ang = math.radians(30 + i * 60)
        px, py = cx + math.cos(ang) * 56, cy + math.sin(ang) * 56
        a.rect(px - 9, py - 9, 18, 18, fill="none", stroke=PALE, stroke_width=1.8,
               transform=f"rotate({f(math.degrees(ang))} {f(px)} {f(py)})")
    a.path(f"M{cx - 7},{cy}h14M{cx},{cy - 7}v14", stroke=LINE, stroke_width=1.6)
    a.circle(cx, cy, 11, fill="none", stroke=LINE, stroke_width=1, stroke_dasharray="2 3")


@_room("infirmary", "INFIRMARY", "Blueprint room stamp for the infirmary: the scale with its height rod, one cot, the "
       "orderly's table, and the door through to the cold store.")
def _infirmary(a, x0, y0, x1, y1):
    _rect(a, x0 + 14, y0 + 16, 44, 44)
    a.circle(x0 + 36, y0 + 38, 5, fill=LINE)
    a.path(f"M{x0 + 36},{y0 + 38}h34", stroke=LINE, stroke_width=1.6, stroke_dasharray="4 3")
    _rect(a, x0 + 14, y0 + 84, 52, 60)
    _rect(a, x0 + 20, y0 + 88, 40, 14, sw=1.3, stroke=PALE)
    _rect(a, x1 - 64, y0 + 20, 48, 30)
    a.path(f"M{x1 - 56},{y0 + 30}h30M{x1 - 56},{y0 + 38}h22", stroke=PALE, stroke_width=1.4)
    a.rect(x1 - 4, 110, 8, 36, fill=BLUE, stroke=LINE, stroke_width=1.5)
    a.path(f"M{x1},{110} h-30 a30,30 0 0 0 30,30", fill="none", stroke=PALE, stroke_width=1.3)


@_room("cold-store", "COLD STORE", "Blueprint room stamp for the cold store: doubled insulated walls, a hook rail down "
       "the middle, shelving, and frost drawn into one corner.", thick=True)
def _cold(a, x0, y0, x1, y1):
    a.path(f"M{x0 + 30},{y0 + 50}H{x1 - 30}", stroke=LINE, stroke_width=3)
    for i in range(6):
        hx = x0 + 40 + i * 21
        a.path(f"M{hx},{y0 + 50}v14a5,5 0 0 0 10,0", fill="none", stroke=PALE, stroke_width=1.8)
    for sy in (y0 + 100, y0 + 122):
        _rect(a, x0 + 24, sy, 124, 14, sw=1.6)
    kit.frost(a, x1 - 9, y0 + 9, 95, 175, 60, n=4, haze=False, color=LINE, op=0.9, budget=70)


@_room("mail-room", "MAIL ROOM", "Blueprint room stamp for the mail room: a wall of pigeonholes, the sorting counter, "
       "and the sack that goes nowhere drawn as a tied circle.")
def _mail(a, x0, y0, x1, y1):
    a.grid(x0 + 14, y0 + 14, 144, 36, 18, stroke=LINE, stroke_width=1.6)
    _rect(a, x0 + 14, y0 + 82, 90, 26)
    a.rect(x0 + 30, y0 + 88, 22, 14, fill="none", stroke=PALE, stroke_width=1.3)
    a.path(f"M{x0 + 30},{y0 + 88}l11,8l11,-8", fill="none", stroke=PALE, stroke_width=1.3)
    _W(a, kit.circ_pts(x1 - 36, y0 + 108, 22, 14), closed=True)
    a.path(f"M{x1 - 44},{y0 + 84}l8,8l8,-8", fill="none", stroke=LINE, stroke_width=2.2)


@_room("boiler-room", "BOILER ROOM", "Blueprint room stamp for the boiler room: two boilers as ringed circles, the pipe "
       "run leaving through the wall, and a drain in the floor.")
def _boiler(a, x0, y0, x1, y1):
    for bx in (x0 + 48, x1 - 48):
        _W(a, kit.circ_pts(bx, y0 + 56, 30, 18), closed=True)
        a.circle(bx, y0 + 56, 18, fill="none", stroke=PALE, stroke_width=1.3, stroke_dasharray="4 3")
        a.circle(bx, y0 + 56, 4, fill=LINE)
    a.path(f"M{x0 + 48},{y0 + 86}V{y0 + 120}H{x1 + 4}M{x1 - 48},{y0 + 86}V{y0 + 120}", fill="none", stroke=LINE,
           stroke_width=2.6)
    a.rect(S / 2 - 12, y0 + 132, 24, 12, fill="none", stroke=PALE, stroke_width=1.5)
    a.path("".join(f"M{S / 2 - 8 + i * 5},{y0 + 132}v12" for i in range(4)), stroke=PALE, stroke_width=1.1)


@_room("sams-office", "SAM'S OFFICE", "Blueprint room stamp for Sam's office: a desk and its chair, and the filing cabinet "
       "with one drawer drawn open.")
def _office(a, x0, y0, x1, y1):
    _rect(a, x0 + 40, y0 + 34, 92, 40)
    a.circle(x0 + 86, y0 + 20, 10, fill="none", stroke=PALE, stroke_width=1.8)
    a.rect(x0 + 52, y0 + 44, 28, 20, fill="none", stroke=PALE, stroke_width=1.2)
    _rect(a, x1 - 44, y0 + 92, 32, 52)
    a.path(f"M{x1 - 44},{y0 + 110}h32M{x1 - 44},{y0 + 127}h32", stroke=LINE, stroke_width=1.4)
    _rect(a, x1 - 72, y0 + 111, 28, 15, sw=1.6, stroke=PALE)
    a.path(f"M{x1 - 66},{y0 + 116}h16M{x1 - 66},{y0 + 121}h16", stroke=PALE, stroke_width=1)


@_room("staff-mess", "STAFF MESS", "Blueprint room stamp for the staff mess: one long table laid with six places, and "
       "the stove against the wall.")
def _mess(a, x0, y0, x1, y1):
    _rect(a, x0 + 26, y0 + 60, 120, 34)
    for i in range(3):
        for sy in (y0 + 48, y0 + 106):
            a.circle(x0 + 48 + i * 38, sy, 7, fill="none", stroke=PALE, stroke_width=1.6)
        a.circle(x0 + 48 + i * 38, y0 + 69, 4, fill="none", stroke=PALE, stroke_width=1.1)
        a.circle(x0 + 48 + i * 38, y0 + 85, 4, fill="none", stroke=PALE, stroke_width=1.1)
    _rect(a, x0 + 10, y0 + 8, 44, 26)
    a.circle(x0 + 23, y0 + 21, 6, fill="none", stroke=LINE, stroke_width=1.4)
    a.circle(x0 + 41, y0 + 21, 6, fill="none", stroke=LINE, stroke_width=1.4)


@_room("laundry", "LAUNDRY", "Blueprint room stamp for the laundry: two tubs, a mangle, and three drying lines drawn "
       "dashed across the room.")
def _laundry(a, x0, y0, x1, y1):
    for bx in (x0 + 34, x0 + 82):
        _W(a, kit.circ_pts(bx, y0 + 34, 19, 14), closed=True)
        a.circle(bx, y0 + 34, 11, fill="none", stroke=PALE, stroke_width=1.1)
    _rect(a, x1 - 50, y0 + 16, 36, 30)
    a.path(f"M{x1 - 44},{y0 + 26}h24M{x1 - 44},{y0 + 36}h24", stroke=LINE, stroke_width=2.4)
    for i in range(3):
        yy = y0 + 78 + i * 24
        a.path(f"M{x0 + 4},{yy}H{x1 - 4}", stroke=PALE, stroke_width=1.2)
        a.path(f"M{x0 + 18 + i * 10},{yy}h{36}M{x0 + 80 + i * 6},{yy}h{44}", stroke=LINE, stroke_width=5, stroke_dasharray="12 3")


@asset(G, "room-void", group="pieces", title="Floor Plan stamp: the void", w=S, h=S, row=ROW)
def void(a: Art):
    """The void stamp: a square of blueprint with no room in it, only a dashed outline, hatching, the missing
    paces written on a dimension line, and the faint treads of a stair going down."""
    a.open("g", filter=a.roughen(3.5, 0.05))
    a.rect(8, 8, S - 16, S - 16, rx=4, fill=BLUE)
    a.close()
    cl = a.clip(f'<rect x="8" y="8" width="{S - 16}" height="{S - 16}"/>')
    kit.speckle(a, cl, 0, 0, S, S, color="#0b1c3a", strength=0.35, freq=0.8)
    a.rect(34, 34, S - 68, 156, fill="none", stroke=LINE, stroke_width=3, stroke_dasharray="12 8")
    kit.hatch_in(a, 38, 38, S - 76, 148, angle=45, spacing=13, stroke=LINE, stroke_width=1.1, opacity=0.55)
    a.rect(64, 70, 112, 84, fill=BLUE, opacity=0.92)
    for i in range(6):
        a.path(f"M{72 + i * 16},{78 + i * 4}V{146 - i * 4}", stroke=PALE, stroke_width=1.5, opacity=0.9 - i * 0.12)
    a.path("M70,112 h94 l-10,-7 m10,7 l-10,7", fill="none", stroke=SODIUM, stroke_width=2)
    a.path(f"M34,22 H{S - 34} M34,14 v16 M{S - 34},14 v16", stroke=SODIUM, stroke_width=2, fill="none")
    a.rect(84, 12, 72, 20, fill=BLUE)
    a.text(S / 2, 28, "18-24", size=17, family="monospace", fill=SODIUM, text_anchor="middle", font_weight="bold")
    kit.stencil(a, S / 2, 220, "VOID", 20, fill=LINE, anchor="middle")


# ---- sheets -------------------------------------------------------------------------------------
def _blue_sheet(a, w, h):
    a.paper(BLUE, grain=0.24, fibre=1.3)
    a.grid(40, 40, w - 80, h - 80, 20, stroke=LINE, stroke_width=0.4, opacity=0.22)
    a.grid(40, 40, w - 80, h - 80, 100, stroke=LINE, stroke_width=0.8, opacity=0.32)
    a.rect(0, 0, w, h, fill=a.radial([(0.5, "#000", 0), (1, "#000", 0.35)], r=0.75))


@asset(G, "plan-sheet", group="maps", title="Floor Plan: the sheet", w=1200, h=800, row=ROW)
def plan_sheet(a: Art):
    """The Floor Plan page: a cyanotype sheet with a tray of empty stamp slots at the left, the outside wall
    measured along the top at 120 paces, the ground floor ruled in white from memory with its east end
    refusing to close, a compass rose and scale bar, and remembered paces pencilled down the margin."""
    _blue_sheet(a, 1200, 800)
    # the stamp tray
    a.rect(40, 100, 150, 600, fill="#16335f", stroke=LINE, stroke_width=1.5)
    for i in range(4):
        a.rect(60, 120 + i * 142, 110, 110, fill="none", stroke=LINE, stroke_width=1.3, stroke_dasharray="6 5", opacity=0.7)
    kit.stencil(a, 115, 90, "STAMPS", 18, fill=LINE, anchor="middle")
    # the outside wall, in ink
    a.path("M230,70 H980 M230,56 v28 M980,56 v28", stroke=LINE, stroke_width=2.5, fill="none")
    a.rect(520, 54, 170, 30, fill=BLUE)
    a.text(605, 77, "120 PACES", size=22, family="monospace", fill=LINE, text_anchor="middle", font_weight="bold")
    ink = dict(sw=5)
    rooms = [[(240, 140), (420, 140), (420, 300), (240, 300)], [(240, 320), (420, 320), (420, 500), (240, 500)],
             [(440, 140), (640, 140), (640, 300), (440, 300)], [(440, 380), (640, 380), (640, 640), (440, 640)],
             [(240, 520), (420, 520), (420, 640), (240, 640)], [(660, 140), (800, 140), (800, 300), (660, 300)]]
    for r in rooms:
        _W(a, r, closed=True, **ink)
    _W(a, [(440, 320), (860, 320)], **ink)
    _W(a, [(440, 360), (640, 360)], **ink)
    _W(a, [(660, 360), (830, 360)], **ink)
    _W(a, [(800, 140), (860, 140)], **ink)
    a.path("M860,140 h120 M830,360 h150 M980,140 v220", stroke=LINE, stroke_width=3, stroke_dasharray="9 9", opacity=0.6,
           fill="none")
    kit.hatch_in(a, 864, 146, 112, 168, angle=45, spacing=14, stroke=LINE, stroke_width=1, opacity=0.35)
    a.path("M860,400 H980 M860,386 v28 M980,386 v28", stroke=SODIUM, stroke_width=2.2, fill="none")
    a.text(920, 436, "18-24 ?", size=20, family="monospace", fill=SODIUM, text_anchor="middle", font_weight="bold")
    for x, y, lab in ((330, 226, "BUNK"), (330, 416, "BUNK"), (540, 226, "LATRINE"), (540, 516, "CAFETERIA"),
                      (330, 586, "REC ROOM"), (730, 226, "INFIRMARY")):
        a.text(x, y, lab, size=16, family="monospace", fill=PALE, text_anchor="middle")
    for dx, dy in ((420, 230), (420, 420), (640, 240), (640, 470)):
        a.path(f"M{dx},{dy} v-34 a34,34 0 0 1 -34,34", fill="none", stroke=PALE, stroke_width=1.6)
        a.line(dx, dy - 34, dx, dy, stroke=BLUE, stroke_width=7)
    # compass and scale
    a.circle(900, 600, 46, fill="none", stroke=LINE, stroke_width=1.5)
    a.poly([(900, 540), (912, 600), (900, 660), (888, 600)], fill="none", stroke=LINE, stroke_width=1.8)
    a.poly([(900, 540), (912, 600), (888, 600)], fill=LINE)
    a.text(900, 530, "N", size=18, family="monospace", fill=LINE, text_anchor="middle", font_weight="bold")
    a.path("M700,700 h200 v-10 h-200 z M700,700 v-10 M750,700 v-10 M800,700 v-10 M850,700 v-10", fill="none", stroke=LINE,
           stroke_width=1.6)
    a.rect(700, 690, 50, 10, fill=LINE)
    a.rect(800, 690, 50, 10, fill=LINE)
    a.text(700, 724, "1 SQ = 75 CM", size=16, family="monospace", fill=LINE)
    # the margin, in pencil
    a.line(1010, 40, 1010, 760, stroke=LINE, stroke_width=1, opacity=0.6)
    pc = "#E8D9A8"
    for i, ln in enumerate(["Bunk hall:", "38 to 40", "", "Mess hall:", "52 to 55", "", "East hall:", "30 to 34", "",
                            "cold here"]):
        a.text(1026, 150 + i * 34, ln, size=24, family="cursive", fill=pc, opacity=0.92,
               transform=f"rotate({f(a.rng.uniform(-3, 2))} 1026 {150 + i * 34})")
    a.path("M1022,470 q60,14 130,-4", fill="none", stroke=pc, stroke_width=2)
    # the pencil at the open end
    a.poly([(866, 328), (918, 276), (932, 290), (880, 342)], fill=SODIUM, stroke=INK, stroke_width=1.5)
    a.poly([(856, 352), (866, 328), (880, 342)], fill="#E8D7B4", stroke=INK, stroke_width=1.5)
    a.rect(230, 730, 760, 40, fill="none", stroke=LINE, stroke_width=1.8)
    a.text(246, 757, "FLOOR PLAN / GROUND / DRAWN FROM MEMORY", size=19, family="monospace", fill=LINE)
    kit.frost_corners(a, 0.16, op=0.7)


@asset(G, "elevation-strip", group="maps", title="Floor Plan: the elevation strip", w=1600, h=520, row=ROW)
def elevation(a: Art):
    """The sheet turned on its side: the hall in elevation on cyanotype, floor to a ceiling at 4.57 m, with the
    steel lever at 2.4 m, the pipes at 2.7 m, the windows at 3.5 m and the claw marks at 3.6 m each on
    a dimension line; a man of 178 cm stands in outline, and beside him the plain dashed outline of the
    occupant those heights fit, 338 cm."""
    _blue_sheet(a, 1600, 520)
    fl, m = 440, 84.0

    def Y(v):
        return fl - v * m
    a.path(f"M60,{fl} H1540 M60,{Y(4.57)} H1540", stroke=LINE, stroke_width=5, fill="none")
    kit.hatch_in(a, 60, fl + 3, 1480, 22, angle=45, spacing=10, stroke=LINE, stroke_width=1, opacity=0.6)
    kit.hatch_in(a, 60, Y(4.57) - 24, 1480, 22, angle=45, spacing=10, stroke=LINE, stroke_width=1, opacity=0.6)
    # door with its two handles
    _rect(a, 250, Y(2.75), 110, 2.75 * m, sw=3)
    a.rect(318, Y(2.4) - 4, 34, 8, fill=LINE)
    a.circle(342, Y(1.0), 6, fill="none", stroke=LINE, stroke_width=2)
    # pipes, windows, claws
    a.path(f"M60,{Y(2.7)} H1540", stroke=LINE, stroke_width=3)
    a.path(f"M60,{Y(2.7) - 8} H1540", stroke=LINE, stroke_width=1.2)
    for wx in (470, 1040):
        _rect(a, wx, Y(4.25), 130, 0.75 * m, sw=2.4)
        a.path(f"M{wx + 65},{Y(4.25)}V{Y(3.5)}M{wx},{Y(3.875)}h130", stroke=PALE, stroke_width=1.3)
    for i in range(4):
        _W(a, [(700 + i * 15, Y(3.6)), (722 + i * 15, Y(2.95))], sw=2.2, stroke=PALE)
    # dimension lines at the right
    marks = [(2.4, "LEVER 2.4 M", 384, 1.2), (2.7, "PIPES 2.7 M", 620, 0.7), (3.6, "CLAW MARKS 3.6 M", 790, 1.9),
             (3.5, "WINDOWS 3.5 M", 1190, 2.3)]
    for v, lab, x, at in marks:
        a.path(f"M{x},{fl} V{Y(v)} M{x - 9},{Y(v)} h18 M{x - 9},{fl} h18", stroke=SODIUM, stroke_width=1.8, fill="none")
        a.rect(x + 8, Y(at) - 19, len(lab) * 10.4 + 8, 26, fill=BLUE, opacity=0.9)
        a.text(x + 12, Y(at), lab, size=17, family="monospace", fill=SODIUM, font_weight="bold")

    def man(x, h, **kw):
        t = (h - 1.78) / 1.6
        H = h * m
        hr = 13 - 2 * t
        top = fl - H
        sh = 30 - 7 * t
        legs = H * (0.46 + 0.06 * t)
        bt = top + 2 * hr + 6 + 14 * t
        d = (f"M{x - sh},{bt} H{x + sh} L{x + sh * 0.6},{fl - legs} V{fl} H{x + 3} V{fl - legs + 8} H{x - 3} V{fl} "
             f"H{x - sh * 0.6} V{fl - legs} Z")
        a.path(d, fill="none", stroke_linejoin="round", **kw)
        a.circle(x, top + hr, hr, fill="none", **kw)
        a.path(f"M{x},{top + 2 * hr}V{bt}", fill="none", **kw)
    man(960, 1.78, stroke=LINE, stroke_width=3.2)
    a.text(960, fl + 50, "178 CM", size=19, family="monospace", fill=LINE, text_anchor="middle", font_weight="bold")
    man(1390, 3.38, stroke=LINE, stroke_width=3.2, stroke_dasharray="11 6")
    a.path(f"M1460,{fl} V{Y(3.38)} M1451,{Y(3.38)} h18 M1451,{fl} h18", stroke=LINE, stroke_width=1.8, fill="none")
    a.text(1530, fl + 50, "OCCUPANT 338 CM", size=19, family="monospace", fill=LINE, font_weight="bold", text_anchor="end")
    a.text(76, fl + 60, "ELEVATION / BUNK HALL / CEILING 4.57 M", size=19, family="monospace", fill=LINE)
    a.path(f"M120,{fl} V{Y(4.57)} M111,{Y(4.57)} h18 M111,{fl} h18", stroke=LINE, stroke_width=1.8, fill="none")
    a.text(134, Y(2.2), "4.57 M", size=17, family="monospace", fill=LINE)
    kit.frost_corners(a, 0.14, op=0.7)


@asset(G, "ghost-layer", group="maps", title="Floor Plan: the ghost layer", w=1200, h=800, row=ROW)
def ghost(a: Art):
    """The older plan under the blueprint, raised by three pencil rubs: where the graphite has gone over the
    sheet, pale lines come up showing the same row of bunk rooms with a bolt drawn on the hall side of
    every door; outside the rubbed patches the old lines are barely there."""
    _blue_sheet(a, 1200, 800)

    def old(op, sw):
        a.open("g", opacity=op, fill="none", stroke="#EAF1FF", stroke_width=sw)
        a.path("M100,470 H1100 M100,560 H1100")
        for i in range(5):
            x = 110 + i * 200
            a.rect(x, 180, 180, 290)
            a.path(f"M{x + 20},200 h50 v110 h-50z M{x + 110},200 h50 v110 h-50z")
            a.path(f"M{x + 70},470 v-0 M{x + 70},470 h40", stroke=BLUE, stroke_width=sw * 3)
            a.path(f"M{x + 70},470 v-40 a40,40 0 0 1 40,40", stroke_width=sw * 0.6)
            # the bolt: on the outside
            a.rect(x + 104, 478, 30, 10, fill="#EAF1FF", stroke="none")
            a.rect(x + 126, 474, 16, 18, stroke_width=sw * 0.7)
        a.close()
    old(0.1, 2.5)
    rubs = [(250, 470, 190, 120, -12), (640, 460, 200, 130, 8), (1010, 480, 170, 120, -5)]
    for cx, cy, rx, ry, rot in rubs:
        cl = a.clip(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({rot} {cx} {cy})"/>')
        a.open("g", clip_path=cl, filter=a.roughen(14, 0.05))
        a.ellipse(cx, cy, rx, ry, fill="#9aa3ad", opacity=0.3, transform=f"rotate({rot} {cx} {cy})")
        a.hatch(cx - rx, cy - ry, 2 * rx, 2 * ry, angle=62 + rot, spacing=5, stroke="#c8ced6", stroke_width=2.2, opacity=0.42,
                jitter=2.5)
        a.close()
        a.open("g", clip_path=cl)
        old(0.95, 3)
        a.close()
    a.text(388, 536, "BOLT", size=20, family="monospace", fill=SODIUM, font_weight="bold")
    a.path("M380,528 l-130,-40 l14,-2 m-14,2 l8,12", fill="none", stroke=SODIUM, stroke_width=2)
    a.text(600, 610, "HALL", size=18, family="monospace", fill=PALE, text_anchor="middle", opacity=0.8)
    a.text(100, 110, "RUBBED: 3 OF 3", size=22, family="monospace", fill=LINE)
    # the pencil stub that did it
    a.open("g", transform="rotate(24 1040 660)")
    a.rect(960, 650, 130, 18, fill=SODIUM, stroke=INK, stroke_width=1.5)
    a.poly([(960, 650), (930, 659), (960, 668)], fill="#E8D7B4", stroke=INK, stroke_width=1.5)
    a.poly([(940, 656), (930, 659), (940, 662)], fill="#555")
    a.close()
    kit.frost_corners(a, 0.16, op=0.7)

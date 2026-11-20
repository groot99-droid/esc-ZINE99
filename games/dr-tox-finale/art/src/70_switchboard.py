"""Switchboard (1D, patching life-support circuits): letterer's balloon page.

A comic page at the lettering stage: panel borders and their contents only pencilled (grey), speech
balloons inked with hand-lettered capitals over light non-photo-blue guidelines, and each balloon's tail a
patch cord run down to a panel. The State's interlocks are lettered in red, the letterer's correction
colour. Every panel must keep one live tail; nobody's air is cut on the page."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "switchboard"
INK, PENCIL, NPB, RED = "#141414", "#9a9a9a", kit.NPB, kit.PULP_RED
BOARD = "#fbfaf6"

PANELS1 = ("THE TOWERS", "THE SUITES", "THE ATRIUM", "THE PLINTH")
PANELS2 = PANELS1 + ("THE ROAD",)


def pencil(a, pts, w=2, closed=False, amp=1.5):
    a.path(a.wobble_d(pts, amp=amp, step=30, closed=closed), fill="none", stroke=PENCIL, stroke_width=w,
           stroke_linecap="round")


def district(a, name, x, y, w, h):
    """The pencilled contents of one district panel."""
    if name == "THE TOWERS":
        for k in range(4):
            tw = w / 6
            tx = x + 14 + k * (tw + 10)
            th = h * (0.55 + 0.1 * (k % 3))
            pencil(a, [(tx, y + h - 40), (tx, y + h - 40 - th), (tx + tw, y + h - 40 - th), (tx + tw, y + h - 40)])
            for j in range(1, 6):
                pencil(a, [(tx + 4, y + h - 40 - th * j / 6), (tx + tw - 4, y + h - 40 - th * j / 6)], 1)
    elif name == "THE SUITES":
        for k in range(2):
            cx = x + w * (0.3 + 0.4 * k)
            pencil(a, [(cx - 30, y + h - 50), (cx - 20, y + h - 140), (cx - 6, y + h - 140), (cx - 10, y + h - 90),
                       (cx + 34, y + h - 90), (cx + 36, y + h - 50)])
        pencil(a, [(x + 10, y + 40), (x + w - 10, y + 40)], 1)
    elif name == "THE ATRIUM":
        for k in range(5):
            pencil(a, [(x + 14 + k * (w - 28) / 4, y + 30), (x + 14 + k * (w - 28) / 4, y + h - 40)], 1.4)
        for k in range(4):
            pencil(a, [(x + 14, y + 30 + k * (h - 70) / 3), (x + w - 14, y + 30 + k * (h - 70) / 3)], 1.4)
    elif name == "THE PLINTH":
        pencil(a, [(x + 10, y + 70), (x + w - 10, y + 70)], 2)
        for vx in (x + w * .3, x + w * .7):
            pencil(a, [(vx - 16, y + 70), (vx - 16, y + 90), (vx + 16, y + 90), (vx + 16, y + 70)], 1.5)
        for k in range(5):
            sx = x + 14 + k * (w - 28) / 5
            pencil(a, [(sx, y + h - 40), (sx, y + h - 80), (sx + (w - 28) / 5 - 6, y + h - 90), (sx + (w - 28) / 5 - 6, y + h - 40)],
                   1.5)
    else:   # THE ROAD
        pencil(a, [(x + 10, y + h - 90), (x + w - 10, y + h - 90)], 1.5)
        pencil(a, [(x + w / 2 - 8, y + h - 90), (x + 20, y + h - 40)], 1.2)
        pencil(a, [(x + w / 2 + 8, y + h - 90), (x + w - 20, y + h - 40)], 1.2)
        for k in range(6):
            px = x + 24 + k * (w - 48) / 5
            a.path(kit.person_d(px, y + h - 96, 0.24), fill="none", stroke=PENCIL, stroke_width=1.5)


def page(names):
    def draw(a: Art):
        a.rect(0, 0, 1280, 720, fill="#d9d6cc")
        a.rect(30, 16, 1220, 688, fill=BOARD, stroke="#b9b5a8", stroke_width=2)
        for k in range(0, 1220, 40):                     # non-repro blue border marks
            a.line(30 + k, 16, 30 + k, 24, stroke=NPB, stroke_width=1)
        n = len(names)
        gap = 18
        w = (1160 - gap * (n - 1)) / n
        for i, name in enumerate(names):
            x = 60 + i * (w + gap)
            pencil(a, [(x, 380), (x + w, 380), (x + w, 680), (x, 680)], 2.2, closed=True)
            district(a, name, x, 380, w, 300)
            a.line(x + 10, 664, x + w - 10, 664, stroke=NPB, stroke_width=1)
            kit.label(a, x + 12, 660, name, size=18, family="sans-serif", fill=PENCIL, font_weight="bold",
                      fit=kit.fitw(name, 18, w - 24, .66))
            a.circle(x + w / 2, 392, 9, fill=BOARD, stroke=PENCIL, stroke_width=2, stroke_dasharray="3 2")
        a.line(60, 360, 1220, 360, stroke=NPB, stroke_width=1, stroke_dasharray="8 6")
        kit.label(a, 1220, 352, "balloons above this line", size=14, family="sans-serif", fill=NPB, anchor="end",
                  font_style="italic")
        kit.label(a, 60, 48, f"PG. {'1' if n == 4 else '2'}", size=16, family="sans-serif", fill=PENCIL, font_weight="bold")
    draw.__doc__ = (f"Switchboard page {'1, the maintenance level' if len(names) == 4 else '2, the core'}: a comic page at "
                    f"the lettering stage with {len(names)} pencilled district panels along the bottom ("
                    f"{', '.join(n.title() for n in names)}), each with a dashed socket at its top edge for tails, and "
                    f"the space above left clear for the inked balloons, a blue guideline marking it.")
    asset(G, f"switchboard-page-{'1' if len(names) == 4 else '2'}", group="backdrops",
          title=f"Switchboard: page {'1' if len(names) == 4 else '2'} ({len(names)} districts)", w=1280, h=720,
          row=kit.row(M, "Pages: districts as pencilled panels"))(draw)


page(PANELS1)
page(PANELS2)


# ---- balloons -------------------------------------------------------------------------------------
def balloon(key, text, what, ink=INK, w=220, h=120, dead=False, wide=False):
    def draw(a: Art):
        cx, cy = w / 2, (h - 20) / 2
        rx, ry = w / 2 - 8, (h - 20) / 2 - 6
        col = PENCIL if dead else ink
        a.path(f"M{cx - 14},{cy + ry - 4} L{cx},{h - 4} L{cx + 14},{cy + ry - 4}", fill=BOARD, stroke=col, stroke_width=4,
               stroke_linejoin="round")
        a.ellipse(cx, cy, rx, ry, fill=BOARD, stroke=col, stroke_width=4, stroke_dasharray="10 6" if dead else None)
        a.rect(cx - 12, cy + ry - 6, 24, 8, fill=BOARD)
        sz = (40 if len(text) <= 5 else 30) * h / 120
        a.line(cx - rx + 26, cy - sz * .42, cx + rx - 26, cy - sz * .42, stroke=NPB, stroke_width=1.2)
        a.line(cx - rx + 26, cy + sz * .36, cx + rx - 26, cy + sz * .36, stroke=NPB, stroke_width=1.2)
        kit.label(a, cx, cy + sz * .34, text, size=sz, family="sans-serif", fill=col, anchor="middle", font_weight="bold",
                  letter_spacing="2", fit=kit.fitw(text, sz, rx * 1.5, .72))
        a.circle(cx, h - 6, 5, fill=col)
    draw.__doc__ = (f"Switchboard balloon {text}: {what}. An inked speech balloon with hand-lettered capitals on blue "
                    f"guidelines; its tail point at the bottom centre is where the patch cord leaves for a panel.")
    asset(G, f"switchboard-balloon-{key}", group="pieces", title=f"Switchboard: balloon, {text}", w=w, h=h,
          row=kit.row(M, "Balloons: the circuits"))(draw)


for _k in range(1, 7):
    balloon(f"air-{_k}", f"AIR {_k}", f"air circuit {_k}")
balloon("hub", "HUB", "the circuit the last dose will ride, drawn larger, three tails in Switchboard 1 and five in 2",
        w=300, h=150)
balloon("assist", "ASSIST", "the suite's patients on assisted breathing (Switchboard 2); a name is lettered under it at run time")
balloon("lock", "LOCK", "one of the State's interlocks, lettered in red: it cuts THE PLINTH's only tail whenever THE TOWERS drop "
        "below two tails", ink=RED)
balloon("dead", "AIR", "a balloon whose last tail was pulled: greyed back to pencil, dashed, the cord sprung back", dead=True)


# ---- cords and sockets ----------------------------------------------------------------------------
@asset(G, "switchboard-jack", group="pieces", title="Switchboard: a cord's jack (the tail's end)", w=40, h=80,
       row=kit.row(M, "Cords: jacks and sockets"))
def jack(a: Art):
    """The end of a balloon tail drawn as a patch cord's jack: an inked plug body, a ringed sleeve and a
    tip pointing down, with a short length of inked cord above; drag it to a panel's socket."""
    a.line(20, 0, 20, 20, stroke=INK, stroke_width=5)
    a.rect(10, 20, 20, 30, rx=4, fill=INK)
    a.rect(13, 50, 14, 12, fill=BOARD, stroke=INK, stroke_width=2)
    a.line(13, 56, 27, 56, stroke=INK, stroke_width=1.5)
    a.path("M15,62 L25,62 L22,76 L18,76Z", fill=INK)
    a.line(14, 26, 14, 44, stroke=BOARD, stroke_width=1.5)


def socket(live):
    def draw(a: Art):
        a.circle(24, 24, 20, fill=BOARD, stroke=INK if live else PENCIL, stroke_width=4)
        a.circle(24, 24, 9, fill=INK if live else BOARD, stroke=INK if live else PENCIL, stroke_width=2)
        for x, y in ((6, 6), (42, 6), (6, 42), (42, 42)):
            a.circle(x, y, 2, fill=PENCIL)
        if live:
            a.line(4, 24, 44, 24, stroke=NPB, stroke_width=1)
    draw.__doc__ = ("A panel's socket at the top edge of a district: "
                    + ("inked and filled, a live tail seated in it." if live else "pencilled and empty, waiting for a tail."))
    asset(G, f"switchboard-socket{'-live' if live else ''}", group="pieces",
          title=f"Switchboard: a panel socket ({'live' if live else 'empty'})", w=48, h=48,
          row=kit.row(M, "Cords: jacks and sockets"))(draw)


socket(False)
socket(True)


# ---- ui -------------------------------------------------------------------------------------------
@asset(G, "switchboard-note", group="ui", title="Switchboard: the letterer's margin note (blank)", w=520, h=70,
       row=kit.row(M, "Margin notes"))
def note(a: Art):
    """The letterer's note in the margin: a blue pencil italic HUB: and a long blue guideline for the tail
    count, written at run time, with a small tick box."""
    a.line(10, 50, 510, 50, stroke=NPB, stroke_width=1.2)
    kit.label(a, 14, 44, "HUB:", size=26, family="serif", fill=NPB, font_style="italic", font_weight="bold")
    a.rect(480, 20, 24, 24, fill="none", stroke=NPB, stroke_width=2)
    a.line(10, 60, 300, 60, stroke=NPB, stroke_width=0.6, opacity=0.6)
    a.circle(470, 32, 2, fill=NPB)


@asset(G, "switchboard-lock-note", group="ui", title="Switchboard: the interlock's note (red)", w=520, h=110,
       row=kit.row(M, "Margin notes"))
def lock_note(a: Art):
    """What a red LOCK balloon says when it is tapped, as a red correction note boxed in the margin: THE
    PLINTH BREATHES ONLY WHAT THE TOWERS EXHALE, with a red arrow to the plinth's tail."""
    a.rect(6, 6, 508, 98, fill=BOARD, stroke=RED, stroke_width=3)
    for k, ln in enumerate(("THE PLINTH BREATHES ONLY", "WHAT THE TOWERS EXHALE.")):
        a.line(20, 46 + k * 36, 440, 46 + k * 36, stroke=NPB, stroke_width=1)
        kit.label(a, 22, 42 + k * 36, ln, size=26, fill=RED, font_weight="bold", letter_spacing="1",
                  fit=kit.fitw(ln, 26, 410, .66))
    a.path("M460,40 C490,50 494,70 480,90 M480,90 l2,-14 M480,90 l-12,-6", fill="none", stroke=RED, stroke_width=3)


@asset(G, "switchboard-confirm", group="ui", title="Switchboard: confirm (OK TO PRINT)", w=280, h=90,
       row=kit.row(M, "Margin notes"))
def confirm(a: Art):
    """The confirm as the letterer's sign-off: OK TO PRINT in inked capitals in a ruled box with a blue
    guideline and a pencilled tick; usable when every panel breathes."""
    a.rect(6, 6, 268, 78, fill=BOARD, stroke=INK, stroke_width=4)
    a.line(24, 56, 256, 56, stroke=NPB, stroke_width=1.2)
    kit.label(a, 140, 54, "OK TO PRINT", size=30, fill=INK, anchor="middle", font_weight="bold", letter_spacing="2")
    a.path("M226,22 L234,32 L250,14", fill="none", stroke=PENCIL, stroke_width=3)
    a.line(24, 24, 120, 24, stroke=NPB, stroke_width=1)

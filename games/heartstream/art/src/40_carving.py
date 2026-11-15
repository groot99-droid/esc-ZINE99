"""The Carving: five forms, six marks, four blanks, six underside signs. Scrimshaw: scratched black lines on
ivory bone, rubbed with a little pigment."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Carving: 5 forms, 6 marks, 4 blanks, 6 underside signs"
INK = kit.INK


def ground(a, hatch=True, m=14):
    """Ivory, grained; a rope border; the field hatched fine so that whatever lies on it stays bare."""
    a.paper(kit.IVORY, grain=0.25, fibre=1.1)
    kit.grain_lines(a, 0, 0, a.w, a.h, int(a.h / 26), "#8a7350", 0.3, amp=3)
    if hatch:
        cl = a.clip(f'<rect x="{m + 8}" y="{m + 8}" width="{a.w - 2 * m - 16}" height="{a.h - 2 * m - 16}"/>')
        a.hatch(m, m, a.w - 2 * m, a.h - 2 * m, angle=20, spacing=5, clip=cl, stroke=INK, stroke_width=0.7, opacity=0.5)
        a.hatch(m, m, a.w - 2 * m, a.h - 2 * m, angle=-50, spacing=8, clip=cl, stroke=INK, stroke_width=0.5, opacity=0.3)
    a.rect(m, m, a.w - 2 * m, a.h - 2 * m, fill="none", stroke=INK, stroke_width=1.6)
    a.rect(m + 6, m + 6, a.w - 2 * m - 12, a.h - 2 * m - 12, fill="none", stroke=INK, stroke_width=3, stroke_dasharray="1.5 5")


def bare(a, d, shade=True):
    """A bare ivory shape on the hatched field, with its own grain and an inked edge; returns its clip."""
    a.path(d, fill="#000", opacity=0.25, transform="translate(3,4)")
    a.path(d, fill="#f7efdc")
    cl = a.clip(f'<path d="{d}"/>')
    return cl


FORMS = {
    "hook": ("M136,304 L137,116 C137,58 204,54 207,114 C208,132 200,146 190,152 L182,140 C189,134 193,124 192,114 C189,76 153,78 153,116 L152,304 C148,310 140,310 136,304Z",
             "one more hold of reach on the climb"),
    "awl": ("M150,52 L163,204 C178,218 180,266 169,294 C160,308 140,308 131,294 C120,266 122,218 137,204Z", "pricks the chart where a patrol waits"),
    "comb": ("M92,78 C92,60 208,60 208,78 L208,124 L198,124 L193,290 L186,124 L178,124 L173,296 L166,124 L158,124 L153,300 L146,124 L138,124 L133,296 L126,124 L118,124 L113,290 L106,124 L92,124Z",
             "tendrils pass through its teeth"),
    "scraper": ("M138,306 L142,186 L118,180 L82,86 Q150,54 218,86 L182,180 L158,186 L162,306 C158,312 142,312 138,306Z", "its strokes count double against an eddy"),
    "flute": ("M134,58 C134,50 166,50 166,58 L170,300 C170,310 130,310 130,300Z", "after each calm, the beat is easier to find"),
}


def vignette(a, name, cx, cy):
    """What the tool is for, engraved small."""
    sc = lambda d, **kw: kit.scratch(a, d, sw=1.5, **kw)
    if name == "hook":
        sc(f"M{cx - 56},{cy + 14} h44 M{cx + 6},{cy - 16} h50")
        sc(f"M{cx - 30},{cy + 12} C{cx - 30},{cy - 30} {cx + 10},{cy - 34} {cx + 22},{cy - 18}", stroke_dasharray="3 4", light=None, ink=kit.DEEP)
        a.circle(cx + 22, cy - 17, 3.5, fill=kit.DEEP)
    elif name == "awl":
        sc(f"M{cx - 60},{cy} H{cx - 14} L{cx + 50},{cy - 18} M{cx - 14},{cy} L{cx + 54},{cy + 2} M{cx - 14},{cy} L{cx + 46},{cy + 18}", ink=kit.RIVER)
        a.circle(cx + 30, cy + 12, 4, fill=INK)
        sc(kit.circ_d(cx + 30, cy + 12, 9), light=None, stroke_dasharray="2 3")
    elif name == "comb":
        for k in range(5):
            sc(f"M{cx - 44 + k * 22},{cy + 18} q{-8 + k * 3},-16 0,-34", light=None)
        sc(f"M{cx - 56},{cy - 4} H{cx + 56}", ink=kit.RIVER)
    elif name == "scraper":
        pts = [(cx + 26 + (3 + t * 0.9) * math.cos(t * .7), cy + (3 + t * 0.9) * math.sin(t * .7) * .8) for t in range(22)]
        sc(a.smooth_d(pts), ink=kit.RIVER)
    else:
        for k, hgt in enumerate((0, -8, -4, -14)):
            a.circle(cx - 36 + k * 24, cy + 8 + hgt, 5.5, fill="none", stroke=INK, stroke_width=1.5)
        sc(kit.P([(cx - 36 + k * 24, cy + 8 + h) for k, h in enumerate((0, -8, -4, -14))]), light=None, stroke_dasharray="2 3")


for _name, (_d, _use) in FORMS.items():
    def _form(a: Art, name=_name, d=_d):
        ground(a)
        cart = kit.blob_d(a, 150, 180, 104, 150, n=12, jitter=0.04)
        a.path(cart, fill=kit.IVORY, stroke=INK, stroke_width=1.2)
        cl = bare(a, d)
        a.open("g", clip_path=cl)
        kit.grain_lines(a, 70, 40, 160, 280, 9, "#8a7350", 0.5, amp=3, vertical=True)
        a.hatch(150, 40, 80, 280, angle=62, spacing=4.5, clip=a.clip('<rect x="158" y="40" width="70" height="280"/>'), stroke=INK, stroke_width=0.8, opacity=0.6)
        if name in ("hook", "awl", "scraper"):     # the grip, bound
            for k in range(7):
                a.line(120, 252 + k * 7, 180, 248 + k * 7, stroke=INK, stroke_width=1.3)
        a.close()
        kit.scratch(a, d, sw=2.2)
        if name == "flute":
            for k in range(4):
                a.ellipse(150, 110 + k * 44, 6, 7.5, fill=INK)
                a.ellipse(151.5, 111.5 + k * 44, 6, 7.5, fill="none", stroke="#fffaf0", stroke_width=1)
            kit.scratch(a, "M138,72 q12,10 24,0", sw=1.6)
        if name == "comb":
            kit.scratch(a, "M100,92 q50,-14 100,0", sw=1.2, light=None)
            kit.draw_mark(a, "wave", 150, 104, 9, color=kit.DEEP, sw=1.8)
        if name == "scraper":
            for k in range(6):
                kit.scratch(a, f"M{104 + k * 18},{92 - 8 * math.sin(k * .63)} l{(k - 2.5) * -3},22", sw=1, light=None)
        # banner
        a.rect(40, 340, 220, 52, fill=kit.IVORY, stroke=INK, stroke_width=1.4)
        vignette(a, name, 196, 366)
        kit.caps(a, 56, 374, name.upper(), size=21, anchor="start", spacing=4, font_weight="bold")
    _form.__doc__ = f"The {_name} as a finished gift, engraved on ivory: the tool lies bare on a hatched slab, its grain showing, and a small vignette shows its use ({_use})."
    asset(G, f"form-{_name}", group="pieces", title=f"Carving form: the {_name}", w=300, h=420, row=ROW)(_form)


for _i, _m in enumerate(kit.MARKS):
    def _mark(a: Art, m=_m, i=_i):
        ground(a, m=8)
        a.circle(80, 76, 54, fill="#000", opacity=0.25, transform="translate(2,3)")
        a.circle(80, 76, 54, fill="#f7efdc", stroke=INK, stroke_width=1.6)
        n = 30
        a.path("".join(f"M{f(80 + 47 * math.cos(t))},{f(76 + 47 * math.sin(t))} L{f(80 + 52 * math.cos(t))},{f(76 + 52 * math.sin(t))}"
                       for t in [2 * math.pi * k / n for k in range(n)]), stroke=INK, stroke_width=1, fill="none")
        a.circle(80, 76, 40, fill=a.radial([(0, kit.RIVER, 0.16), (1, kit.RIVER, 0)]))
        kit.draw_mark(a, m, 80, 76, 30, color=kit.DEEP, sw=5.5, light="#fffaf0")
        kit.draw_mark(a, m, 80, 76, 30, color=INK, sw=1, opacity=0.5)
        a.rect(40, 132, 80, 18, fill=kit.IVORY, stroke=INK, stroke_width=1)
        kit.caps(a, 80, 146, m.upper(), size=12, spacing=3, font_weight="bold")
    _mark.__doc__ = f"The {_m} mark, one of the six signs a brother may choose: cut into a bare disc of bone and rubbed red, on a hatched ground."
    asset(G, f"mark-{_m}", group="pieces", title=f"Mark: {_m}", w=160, h=160, row=ROW)(_mark)


BLANKS = [
    ("long", "a long rib blank, two knots", 2, False,
     "M110,60 C140,40 190,46 200,70 C226,160 220,280 196,356 C176,384 128,382 108,352 C82,270 84,150 110,60Z"),
    ("wedge", "a wedge blank, three knots", 3, False,
     "M96,70 C130,50 196,52 214,78 C210,170 196,280 170,362 C160,378 140,378 132,362 C104,270 92,170 96,70Z"),
    ("knuckle", "a knuckle-ended blank, four knots", 4, False,
     "M100,84 C92,50 136,40 150,66 C164,40 210,50 200,84 C214,170 208,280 194,350 C180,380 122,380 108,350 C92,280 88,170 100,84Z"),
    ("cracked", "a blank with two knots and the crack that shows at stroke twelve", 2, True,
     "M104,66 C140,44 180,48 206,74 C220,160 222,270 200,350 C178,382 126,380 106,350 C84,270 86,150 104,66Z"),
]
for _key, _desc, _knots, _crack, _d in BLANKS:
    def _blank(a: Art, d=_d, knots=_knots, crack=_crack, key=_key):
        ground(a)
        cl = bare(a, d)
        r = a.rng
        ks = [(150 + r.uniform(-34, 34), 110 + (k + r.uniform(.2, .8)) * 230 / knots) for k in range(knots)]
        a.open("g", clip_path=cl)
        for i in range(17):     # grain, bending round the knots
            x0 = 84 + i * 8.6
            pts = []
            for y in range(36, 400, 14):
                x = x0 + 3 * math.sin(y * .02 + i)
                for kx, ky in ks:
                    dx, dy = x - kx, y - ky
                    dd = dx * dx + dy * dy
                    x += (1 if dx >= 0 else -1) * 22 * math.exp(-dd / 900)
                pts.append((x, y))
            a.path(a.smooth_d(pts), fill="none", stroke=INK, stroke_width=0.9, opacity=0.75)
        for kx, ky in ks:
            for j in range(5):
                a.ellipse(kx, ky, 3 + j * 3.6, 4 + j * 4.6, fill="none" if j else INK, stroke=INK, stroke_width=1.1)
        a.hatch(160, 40, 80, 360, angle=62, spacing=5, clip=a.clip('<rect x="186" y="40" width="50" height="360"/>'), stroke=INK, stroke_width=0.7, opacity=0.55)
        if crack:
            pts = [(84, 232)]
            while pts[-1][0] < 224:
                pts.append((pts[-1][0] + r.uniform(8, 18), pts[-1][1] + r.uniform(-12, 8)))
            a.path(kit.P(pts), fill="none", stroke="#fffaf0", stroke_width=3.2, transform="translate(1,2)")
            a.path(kit.P(pts), fill="none", stroke=INK, stroke_width=2.4, stroke_linejoin="round")
            for (x, y) in pts[2:-2:2]:
                a.path(f"M{f(x)},{f(y)} l{f(r.uniform(-6, 6))},{f(r.choice((-1, 1)) * r.uniform(8, 16))}", stroke=INK, stroke_width=1, fill="none")
        a.close()
        kit.scratch(a, d, sw=2.2)
        # stroke notches down the left edge: the count this blank allows
        n = {"long": 8, "wedge": 24, "knuckle": 16, "cracked": 24}[key]
        for k in range(n):
            y = 60 + k * (300 / n)
            cut = crack and k < 12
            a.path(f"M36,{f(y)} l12,{f(300 / n * .7)}", stroke=kit.DEEP if cut else INK, stroke_width=2.2 if cut else 1.4, fill="none", stroke_linecap="round",
                   opacity=1 if (cut or not crack) else 0.55)
        a.rect(56, 380, 188, 20, fill=kit.IVORY, stroke=INK, stroke_width=1)
        a.text(150, 395, {"long": "eight strokes", "wedge": "twenty-four strokes", "knuckle": "sixteen strokes", "cracked": "stroke twelve"}[key], size=16,
               family="serif", fill=INK, text_anchor="middle", font_style="italic")
    _blank.__doc__ = f"A bone blank on the slab, seen from above: {_desc}, the grain bending round each knot, and notches down the edge for the strokes it allows."
    asset(G, f"blank-{_key}", group="pieces", title=f"Carving blank: {_key}", w=300, h=420, row=ROW)(_blank)


SIGNS = [("open-hand", "an open hand"), ("two-hands", "two hands meeting"), ("lamp", "a lamp left burning"), ("counter", "a counter in its hollow"),
         ("raft", "the raft on the line"), ("home", "three beads, the last one home")]
for _key, _what in SIGNS:
    def _sign(a: Art, key=_key):
        # the inside face: hollowed, darker, the cut fine and rubbed blue
        a.paper("#dccba6", grain=0.3, fibre=1.2)
        d = kit.blob_d(a, 80, 80, 68, 62, n=10, jitter=0.05)
        a.path(d, fill=a.radial([(0, "#f1e5c8", 1), (0.7, "#d9c7a0", 1), (1, "#a8946c", 1)], cx=0.42, cy=0.38, r=0.75), stroke=INK, stroke_width=1.6)
        cl = a.clip(f'<path d="{d}"/>')
        a.open("g", clip_path=cl)
        kit.grain_lines(a, 0, 0, 160, 160, 9, "#8a7350", 0.45, amp=5)
        a.hatch(0, 0, 160, 160, angle=38, spacing=4, clip=a.clip('<path d="M0,110 Q80,150 160,96 L160,160 L0,160Z"/>'), stroke=INK, stroke_width=0.6, opacity=0.5)
        a.close()
        blue = kit.MARROW2
        sc = lambda dd, sw=2.2, **kw: kit.scratch(a, dd, sw=sw, ink=blue, **kw)
        if key == "open-hand":
            sc(kit.hand_d(80, 92, 0.52, 0, 1.1))
        elif key == "two-hands":
            sc(kit.hand_d(52, 96, 0.36, -8, 0.8), sw=1.9)
            sc(kit.hand_d(108, 96, 0.36, 8, 0.8), sw=1.9)
            sc("M70,112 q10,8 20,0", sw=1.3, light=None)
        elif key == "lamp":
            sc("M60,96 h40 l-7,18 h-26Z")
            sc("M80,58 C92,76 88,92 80,92 C72,92 68,76 80,58Z")
            for k in range(5):
                an = math.radians(-150 + k * 30)
                sc(f"M{f(80 + 30 * math.cos(an))},{f(74 + 30 * math.sin(an))} l{f(9 * math.cos(an))},{f(9 * math.sin(an))}", sw=1.4, light=None)
        elif key == "counter":
            sc(kit.circ_d(80, 84, 34))
            sc("M52,74 q28,-18 56,0", sw=1.2, light=None)
            sc(kit.lozenge_d(80, 88, 17, 11))
        elif key == "raft":
            sc("M34,84 H126", sw=1.4)
            sc("M52,84 q28,22 56,0 l-4,-9 h-48Z")
            for k in range(4):
                sc(f"M{60 + k * 13},75 v-14", sw=1.8, light=None)
            sc("M40,100 q10,-8 20,0 t20,0 t20,0 t20,0", sw=1.2, light=None)
        else:
            pts = [(50, 62), (80, 84), (110, 110)]
            sc(kit.P(pts), sw=1.2, light=None)
            for i, (x, y) in enumerate(pts):
                a.circle(x, y, 9 if i == 2 else 7, fill="#f1e5c8" if i < 2 else blue, stroke=blue, stroke_width=2)
            sc("M92,124 h36", sw=1.4, light=None)
        a.circle(80, 80, 90, fill=a.radial([(0.6, "#000", 0), (1, "#000", 0.3)]))
    _sign.__doc__ = f"An underside sign, {_what}: cut small and fine on the hollowed inside face of a gift and rubbed marrow blue, where the one who receives it will not look until his last scene."
    asset(G, f"underside-{_key}", group="pieces", title=f"Underside sign: {_what}", w=160, h=160, row=ROW)(_sign)

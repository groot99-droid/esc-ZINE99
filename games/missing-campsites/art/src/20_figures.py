"""Figures: the ten portrait outlines (each sitter as an empty contour on Tam's People page) and the
seven top-down figures for the two 2D modes."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
PW, PH = 480, 600


class Sitter:
    """Builds a bust from closed shapes, back to front; every shape is erased paper with a pencil edge."""
    def __init__(self, a, cx=240, cy=250, rx=62, ry=80, face=1, tilt=0):
        self.a, self.cx, self.cy, self.rx, self.ry, self.face, self.tilt = a, cx, cy, rx, ry, face, tilt

    def shape(self, pts, smooth=True, closed=True, fill=kit.ERASED):
        a = self.a
        d = a.smooth_d(pts, closed) if smooth else a.wobble_d(pts, 0.8, 12, closed)
        a.path(d, fill=fill if closed else "none", stroke=kit.GRAPHITE, stroke_width=2.6, stroke_linejoin="round",
               stroke_linecap="round", filter=kit.pfilter(a))
        a.path(d, fill="none", stroke=kit.GRAPHITE, stroke_width=1, opacity=0.4, transform="translate(1.5 -1.2)",
               filter=kit.pfilter(a))

    def line(self, pts, smooth=True):
        self.shape(pts, smooth, closed=False)

    def H(self, pts):
        """Head-local coordinates (units of the head's radii), mirrored by the facing side, to canvas."""
        t = math.radians(self.tilt)
        out = []
        for x, y in pts:
            x, y = x * self.rx * self.face, y * self.ry
            out.append((self.cx + x * math.cos(t) - y * math.sin(t), self.cy + x * math.sin(t) + y * math.cos(t)))
        return out

    def shoulders(self, hw=170, top=None, drop=44):
        cx = self.cx - 8 * self.face
        top = self.cy + self.ry * 1.42 if top is None else top
        self.shape([(cx - hw, PH + 30), (cx - hw * 0.98, top + drop + 46), (cx - hw * 0.72, top + drop * 0.5),
                    (cx - hw * 0.28, top), (cx + hw * 0.28, top), (cx + hw * 0.72, top + drop * 0.5),
                    (cx + hw * 0.98, top + drop + 46), (cx + hw, PH + 30)])
        return top

    def neck(self, w=0.5):
        self.shape(self.H([(-w, 0.6), (w * 0.9, 0.6), (w * 1.0, 1.62), (-w * 1.1, 1.62)]), smooth=False)

    def head(self):
        pts = []
        for i in range(20):
            t = 2 * math.pi * i / 20
            x, y = math.cos(t), math.sin(t)
            if y > 0:                      # jaw narrows, chin leans to the facing side
                x = x * (1 - 0.3 * y * y) + 0.16 * y
            pts.append((x, y))
        self.shape(self.H(pts))
        self.shape(self.H([(-1.0, -0.05), (-1.16, -0.12), (-1.2, 0.14), (-1.02, 0.3)]), closed=False)   # the far ear

    def hair(self, pts):
        self.shape(self.H(pts))


def page(a, name, note):
    kit.notebook(a, step=34, top=58, margin=56)
    kit.printed(a, 70, 36, "PEOPLE", size=14, color=kit.GRAPHITE)
    # graphite rubbed in behind the sitter, so the empty figure is the lightest thing on the page
    clip = a.clip(f'<ellipse cx="240" cy="330" rx="208" ry="262"/>')
    a.hatch(20, 60, 440, 540, angle=58, spacing=6, clip=clip, jitter=1.6, stroke=kit.GRAPHITE, stroke_width=1, opacity=0.34)
    a.hatch(20, 60, 440, 540, angle=-40, spacing=9, clip=clip, jitter=1.6, stroke=kit.GRAPHITE, stroke_width=0.9, opacity=0.2)
    a.ellipse(240, 330, 190, 240, fill=kit.GRAPHITE, opacity=0.08, filter=a.blur(22))
    return name, note


def sign(a, name, note):
    a.rect(60, 534, 400, 56, fill="#F6F1E2", opacity=0.86)
    kit.hand(a, 70, 562, name, size=30, rot=-1.5)
    kit.hand(a, 70, 586, note, size=18, rot=-1, color="#6a6a66")
    kit.tooth(a, 0.07)


SHORT = [(-1.08, -0.05), (-1.1, -0.6), (-0.7, -1.08), (0.0, -1.2), (0.7, -1.02), (1.02, -0.5), (0.9, -0.2), (0.55, -0.62),
         (-0.2, -0.7), (-0.75, -0.45), (-0.9, 0.0)]
CURLS = [(-1.1, 0.0), (-1.25, -0.4), (-1.05, -0.85), (-0.8, -1.2), (-0.35, -1.3), (0.1, -1.36), (0.55, -1.22), (0.95, -0.95),
         (1.12, -0.5), (0.95, -0.3), (0.7, -0.6), (0.3, -0.72), (-0.2, -0.66), (-0.6, -0.55), (-0.88, -0.2)]
LONG = [(-1.15, 0.2), (-1.3, 1.2), (-1.0, 1.9), (-0.6, 1.5), (-0.95, 0.3), (-0.8, -0.5), (-0.2, -0.75), (0.5, -0.6), (0.95, -0.2),
        (1.05, -0.6), (0.7, -1.08), (0.0, -1.22), (-0.7, -1.1), (-1.1, -0.6)]
BUN = [(-1.05, 0.05), (-1.1, -0.55), (-0.75, -1.0), (-0.5, -1.12), (-0.62, -1.45), (-0.3, -1.66), (0.05, -1.5), (0.0, -1.18),
       (0.6, -1.05), (1.0, -0.55), (0.9, -0.25), (0.5, -0.66), (-0.3, -0.72), (-0.8, -0.4)]


def portrait(key, title, doc):
    def deco(fn):
        @asset(G, f"outline-{key}", group="figures", title=f"Portrait outline: {title}", w=PW, h=PH,
               row="Portrait outlines: each sitter as an empty contour")
        def draw(a: Art):
            name, note = fn(a)
            sign(a, name, note)
        draw.__doc__ = doc + (" On Tam's ruled People page the graphite is rubbed in all round, and the sitter is the one "
                              "place left blank: a contour with nothing inside it.")
        return draw
    return deco


@portrait("dell", "Dell", "Dell as an empty contour: broad shoulders, close curls, his grandmother's recipe card held up in one hand.")
def dell(a):
    nm = page(a, "Dell", "Bea's card")
    s = Sitter(a, 236, 232, 66, 80, face=1, tilt=3)
    s.shoulders(196, drop=36); s.neck(0.56); s.head(); s.hair(CURLS)
    s.shape([(300, 420), (414, 396), (428, 512), (314, 536)], smooth=False)          # the card
    for k in range(4):
        kit.pencil(a, [(322, 446 + k * 20 - k * 0, ), (404, 428 + k * 20)], w=1.3, op=0.55)
    s.shape([(290, 520), (300, 470), (330, 462), (338, 500), (318, 548)])              # the hand that holds it
    return nm


@portrait("rafe", "Rafe", "Rafe as an empty contour: tall and narrow in a collared jacket, the van keys hanging from his fingers.")
def rafe(a):
    nm = page(a, "Rafe", "the keys. Four o'clock Monday")
    s = Sitter(a, 246, 214, 56, 78, face=-1, tilt=-2)
    top = s.shoulders(160, drop=58); s.neck(0.5); s.head(); s.hair(SHORT)
    s.line([(196, top + 6), (232, top + 70), (250, top + 10)], smooth=False)          # collar
    s.line([(250, top + 10), (270, top + 66), (300, top + 2)], smooth=False)
    s.shape([(110, 500), (120, 440), (150, 430), (160, 470), (150, 520)])              # hand
    s.shape(kit.C(136, 540, 20, 14)); s.line([(140, 560), (150, 596)], smooth=False)
    s.line([(128, 558), (116, 592), (124, 596)], smooth=False)
    return nm


@portrait("ines", "Inés", "Inés as an empty contour: long hair past her shoulders and a camera on its strap at her chest.")
def ines(a):
    nm = page(a, "Inés", "If I shoot it, it happened.")
    s = Sitter(a, 238, 226, 58, 76, face=1, tilt=-4)
    s.hair([(p[0] * 1.0, p[1]) for p in LONG])
    top = s.shoulders(158, drop=50); s.neck(0.46); s.head()
    s.hair([(-1.08, 0.1), (-1.12, -0.6), (-0.7, -1.1), (0.0, -1.22), (0.72, -1.06), (1.06, -0.5), (0.98, 0.0), (0.6, -0.55),
            (0.0, -0.74), (-0.6, -0.5), (-0.92, 0.2)])
    s.line([(196, top + 8), (212, 470)], smooth=False); s.line([(278, top + 8), (300, 470)], smooth=False)   # strap
    s.shape([(196, 468), (316, 468), (318, 548), (194, 548)], smooth=False)            # camera
    s.shape(kit.C(256, 510, 30, 16)); s.shape(kit.C(256, 510, 16, 12)); s.shape([(214, 452), (250, 452), (250, 468), (214, 468)], smooth=False)
    return nm


@portrait("june", "June", "June as an empty contour: seventeen, two puffs of hair, a walkie-talkie held up beside her ear with its aerial out.")
def june(a):
    nm = page(a, "June", "Channel two. I'm here.")
    s = Sitter(a, 226, 262, 56, 70, face=1, tilt=5)
    s.shape(kit.E(166, 176, 44, 40, 0, 16)); s.shape(kit.E(280, 166, 44, 40, 0, 16))   # the puffs
    s.shoulders(146, drop=44); s.neck(0.44); s.head()
    s.hair([(-1.05, -0.1), (-1.0, -0.7), (-0.5, -1.08), (0.2, -1.12), (0.85, -0.8), (1.02, -0.3), (0.7, -0.5), (0.1, -0.7),
            (-0.6, -0.55)])
    s.shape([(330, 470), (322, 380), (350, 330), (384, 336), (392, 400), (376, 480)])  # forearm raised
    s.shape([(318, 236), (372, 230), (378, 342), (324, 348)], smooth=False)            # the walkie
    s.line([(330, 236), (326, 128)], smooth=False)
    for k in range(3):
        kit.pencil(a, [(330, 300 + k * 12), (366, 298 + k * 12)], w=1.2, op=0.6)
    for k in range(5):                                                                # the chain, in biro on her arm
        a.line(338 + k * 8, 410 + k * 3, 342 + k * 8, 396 + k * 3, stroke="#27386b", stroke_width=1.6, opacity=0.8)
    return nm


@portrait("marisol", "Marisol Teague", "Marisol as an empty contour: the ranger's flat-brimmed hat with its heron badge, a pressed collar, the logbook under one arm.")
def marisol(a):
    nm = page(a, "Marisol Teague", "ranger. eleven summers at the booth")
    s = Sitter(a, 240, 248, 60, 76, face=-1, tilt=0)
    top = s.shoulders(176, drop=40); s.neck(0.5); s.head()
    s.hair([(-1.05, 0.3), (-1.1, -0.4), (1.05, -0.4), (1.0, 0.1), (0.8, -0.2), (-0.8, -0.2)])
    s.shape([(98, 196), (240, 168), (382, 196), (372, 214), (240, 200), (108, 214)])   # brim
    s.shape([(176, 186), (184, 116), (216, 96), (240, 108), (264, 96), (296, 116), (304, 186), (240, 176)])   # crown
    s.shape(kit.C(240, 150, 13, 12))
    kit.pencil(a, [(234, 156), (238, 146), (244, 142), (240, 150)], w=1.3)
    s.line([(200, top + 4), (228, top + 52), (240, top + 14), (254, top + 52), (282, top + 4)], smooth=False)
    s.shape([(318, 420), (446, 404), (458, 580), (330, 596)], smooth=False)            # the logbook
    kit.pencil(a, [(338, 440), (350, 590)], w=1.6)
    return nm


@portrait("ruth", "Ruth Teague", "Ruth as an empty contour: short hair, a quilted vest, a covered dish held against her chest with both arms.")
def ruth(a):
    nm = page(a, "Ruth Teague", "a covered dish. supper for two")
    s = Sitter(a, 244, 220, 60, 76, face=1, tilt=-3)
    top = s.shoulders(172, drop=44); s.neck(0.5); s.head(); s.hair(SHORT)
    for k in range(-3, 4):                                                              # quilting
        kit.pencil(a, [(240 + k * 50 - 60, top + 40), (240 + k * 50 + 60, PH)], w=1.1, op=0.4)
        kit.pencil(a, [(240 + k * 50 + 60, top + 40), (240 + k * 50 - 60, PH)], w=1.1, op=0.4)
    s.shape([(150, 470), (330, 470), (318, 540), (162, 540)], smooth=False)            # the dish
    s.shape([(140, 470), (160, 440), (240, 428), (320, 440), (340, 470)])               # its cover
    s.shape(kit.C(240, 424, 10, 10))
    s.shape([(96, 520), (150, 478), (176, 500), (160, 548), (110, 580)])                # the arms that hold it
    s.shape([(384, 520), (330, 478), (304, 500), (320, 548), (370, 580)])
    return nm


@portrait("abel", "Abel Strand", "Abel as an empty contour: a sun hat, a beard, the straps and top of a long-trail pack, a walking pole.")
def abel(a):
    nm = page(a, "Abel Strand", "Signed in. Always sign in.")
    s = Sitter(a, 232, 246, 60, 76, face=1, tilt=2)
    s.shape([(126, 350), (132, 196), (176, 160), (292, 160), (336, 196), (342, 350)], smooth=False)               # the pack behind
    top = s.shoulders(168, drop=48); s.neck(0.5); s.head()
    s.shape(s.H([(-0.82, 0.35), (-0.66, 0.95), (-0.2, 1.3), (0.36, 1.34), (0.78, 0.95), (0.92, 0.35), (0.5, 0.52), (0.08, 0.58), (-0.45, 0.5)]))   # beard
    s.shape([(96, 204), (232, 178), (372, 200), (350, 222), (232, 206), (116, 226)])   # brim
    s.shape([(168, 196), (180, 140), (232, 120), (286, 140), (298, 194), (232, 184)])
    s.line([(150, top + 20), (170, PH)], smooth=False); s.line([(176, top + 8), (196, PH)], smooth=False)   # straps
    s.line([(300, top + 8), (296, PH)], smooth=False); s.line([(326, top + 20), (322, PH)], smooth=False)
    s.line([(420, 120), (410, PH)], smooth=False); s.shape(kit.E(420, 130, 12, 26, 0, 10))   # the pole
    return nm


@portrait("lottie", "Lottie", "Lottie as an empty contour: eight years old, low on the page, two bunches of hair, both hands on a bicycle's handlebars and its bell.")
def lottie(a):
    nm = page(a, "Lottie Ashby", "That's Puddle. The bike's called Puddle.")
    s = Sitter(a, 240, 318, 58, 62, face=-1, tilt=-4)
    s.shape(kit.E(160, 300, 30, 44, 20, 14)); s.shape(kit.E(322, 296, 30, 44, -20, 14))   # bunches
    s.shoulders(120, drop=36); s.neck(0.4); s.head()
    s.hair([(-1.06, -0.05), (-1.0, -0.7), (-0.4, -1.1), (0.4, -1.1), (1.0, -0.7), (1.06, -0.05), (0.5, -0.5), (0.0, -0.3), (-0.5, -0.5)])
    s.line([(70, 520), (150, 488), (330, 488), (410, 520)])                             # handlebars
    s.shape([(60, 500), (112, 492), (116, 532), (64, 540)]); s.shape([(420, 500), (368, 492), (364, 532), (416, 540)])
    s.shape(kit.C(316, 474, 16, 12)); s.line([(240, 488), (240, 540)], smooth=False)
    return nm


@portrait("ashbys", "Corinne and Dev Ashby", "Lottie's parents as two empty contours side by side, a string of garden onions held between them.")
def ashbys(a):
    nm = page(a, "Corinne and Dev Ashby", "site 17. onions from their garden")
    s = Sitter(a, 330, 226, 50, 66, face=-1, tilt=3)
    s.shoulders(130, drop=40); s.neck(0.46); s.head(); s.hair(SHORT)
    s2 = Sitter(a, 156, 262, 46, 60, face=1, tilt=-4)
    s2.hair([(p[0], p[1] * 0.8) for p in LONG])
    s2.shoulders(116, drop=38); s2.neck(0.42); s2.head(); s2.hair(BUN)
    for k, (x, y) in enumerate(((216, 470), (250, 500), (224, 536))):                  # onions
        s.shape([(x, y - 26), (x + 24, y - 6), (x + 16, y + 22), (x, y + 28), (x - 16, y + 22), (x - 24, y - 6)])
        s.line([(x, y - 26), (236, 430)], smooth=False)
    s.shape(kit.C(236, 424, 9, 8))
    return nm


@portrait("agnes", "Agnes Halloran", "Agnes as an empty contour: hair pinned up, a buttoned cardigan, a telephone receiver at her ear and its cord coiling down.")
def agnes(a):
    nm = page(a, "Agnes Halloran", "Mum. Find the split boulder.")
    s = Sitter(a, 232, 240, 58, 74, face=1, tilt=4)
    top = s.shoulders(160, drop=52); s.neck(0.46); s.head(); s.hair(BUN)
    s.line([(232, top + 6), (236, PH)], smooth=False)
    for k in range(3):
        s.shape(kit.C(248, top + 50 + k * 50, 7, 8))
    s.line([(190, top + 6), (232, top + 40), (270, top + 6)], smooth=False)
    s.shape([(292, 180), (318, 176), (330, 250), (326, 318), (300, 322), (306, 250)])  # the receiver
    pts = [(314, 322)]
    for k in range(16):
        pts.append((330 + 16 * math.sin(k * 1.9) + k * 3, 336 + k * 15))
    s.line(pts)
    return nm


# ---- top-down figures ------------------------------------------------------------------------------
TW = 400


def ground(a, light=None, pearl=False):
    """Charcoal dark with one soft circle of amber, seen from above (or the far side's even pearl)."""
    r = a.rng
    if pearl:
        a.rect(0, 0, TW, TW, fill=kit.PEARL)
        return
    a.rect(0, 0, TW, TW, fill="#141518")
    soft = a.blur(22)
    for _ in range(9):
        g = r.randint(16, 44)
        a.ellipse(r.uniform(0, TW), r.uniform(0, TW), r.uniform(50, 130), r.uniform(30, 90), fill=f"rgb({g},{g},{g + 4})",
                  opacity=0.8, filter=soft)
    if light:
        cx, cy, R = light
        clip = a.clip(f'<circle cx="{cx}" cy="{cy}" r="{R}"/>')
        a.open("g", clip_path=clip)
        a.rect(cx - R, cy - R, 2 * R, 2 * R, fill="#8f8068")
        a.stipple(cx - R, cy - R, 2 * R, 2 * R, n=420, r=(1, 2.6), fill="#cbbd9e", opacity=0.85)
        a.stipple(cx - R, cy - R, 2 * R, 2 * R, n=200, r=(1, 2.2), fill="#5b4a33", opacity=0.8)
        a.close()
        a.circle(cx, cy, R + 2, fill=a.radial([(0, "#fff0c8", 0.3), (0.5, kit.AMBER, 0.16), (0.8, "#5a2c0c", 0.3),
                                               (0.96, "#1a0f08", 0.8), (1, "#141518", 1)]))
    rough = a.roughen(7, 0.05)
    for _ in range(26):
        x, y = r.uniform(0, TW), r.uniform(0, TW); t = r.gauss(-0.3, 0.2); L = r.uniform(40, 150)
        a.line(x, y, x + L * math.cos(t), y + L * math.sin(t), stroke="#000", stroke_width=f(r.uniform(2, 8)),
               opacity=f(r.uniform(0.08, 0.26)), stroke_linecap="round", filter=rough)


def person(a, cx, cy, rot, jacket="#2a3346", hair="#3b2b22", broad=1.0, step=1, puffs=False):
    """A walker from straight above: shoes, shoulders, head. No face is seen from here."""
    a.open("g", transform=f"translate({cx} {cy}) rotate({rot})")
    a.ellipse(4, 6, 46 * broad, 30, fill="#000", opacity=0.3, filter=a.blur(5))
    a.ellipse(26 * step, -15, 14, 8, fill="#1c1a18"); a.ellipse(-22 * step, 15, 14, 8, fill="#1c1a18")   # shoes
    a.path(a.smooth_d([(-8, -42 * broad), (16, -36 * broad), (20, 0), (16, 36 * broad), (-8, 42 * broad), (-20, 22), (-22, 0),
                       (-20, -22)], closed=True), fill=jacket, stroke="#0b0d12", stroke_width=2)
    a.path(a.smooth_d([(-14, -30), (-6, -10), (-6, 10), (-14, 30)]), fill="none", stroke="#fff", stroke_width=1.4, opacity=0.14)
    if puffs:
        a.circle(-6, -17, 11, fill=hair); a.circle(-6, 17, 11, fill=hair)
    a.circle(2, 0, 16, fill=hair, stroke="#0b0d12", stroke_width=1.5)
    a.path(a.smooth_d([(-6, -8), (4, -11), (12, -4)]), fill="none", stroke="#fff", stroke_width=1.6, opacity=0.2)
    a.close()


def post(a, x, y, rot, n):
    a.open("g", transform=f"translate({x} {y}) rotate({rot})")
    a.rect(-78, -10, 156, 20, fill=kit.CEDAR, stroke="#3a2212", stroke_width=2)
    for k in range(5):
        a.line(-70 + k * 30, -8 + (k % 3) * 2, -50 + k * 30, 8 - (k % 2) * 3, stroke="#5c3a24", stroke_width=1.2)
    a.rect(48, -9, 26, 18, fill="#e8d9a8", stroke="#3a2212", stroke_width=1.2)
    a.text(61, 5, str(n), size=13, family="sans-serif", fill="#3a2212", text_anchor="middle", font_weight="bold")
    a.poly([(-78, -10), (-100, 0), (-78, 10)], fill="#3a2a1a")                             # the earthy end
    a.close()


def topdown(key, title, doc):
    def deco(fn):
        @asset(G, f"topdown-{key}", group="figures", title=title, w=TW, h=TW,
               row="Top-down figures: Tam (3), two lantern carriers, van, Ruth's car")
        def draw(a: Art):
            fn(a)
            kit.tooth(a, 0.12, white=True, freq=1.3)
        draw.__doc__ = doc
        return draw
    return deco


@topdown("tam-walk", "Tam from above, walking with the torch",
         "Tam seen from straight above on the night road, mid-stride, the torch held forward and the gravel showing only inside its amber circle; charcoal dark everywhere else.")
def tam_walk(a):
    ground(a, (200, 200, 150))
    person(a, 196, 204, -18)
    a.rect(226, 176, 30, 11, fill="#222", stroke="#555", stroke_width=1, transform="rotate(-18 226 180)")
    a.circle(260, 172, 7, fill="#fff3c4")


@topdown("tam-carry-one", "Tam from above, carrying one post",
         "Tam from above with one pulled cedar post, number 17, across the right shoulder, walking slower inside the torch's circle.")
def tam_one(a):
    ground(a, (200, 200, 150))
    person(a, 196, 208, -18, step=0.6)
    post(a, 206, 240, -14, 17)
    a.rect(224, 170, 30, 11, fill="#222", stroke="#555", stroke_width=1, transform="rotate(-18 226 180)")
    a.circle(258, 166, 7, fill="#fff3c4")


@topdown("tam-carry-two", "Tam from above, carrying two posts",
         "Tam from above with a cedar post on each shoulder, 18 and 19, the torch clamped under one of them; the most Tam can carry, and the slowest.")
def tam_two(a):
    ground(a, (200, 200, 138))
    person(a, 196, 204, -18, step=0.35)
    post(a, 190, 166, -20, 18); post(a, 212, 244, -15, 19)
    a.circle(292, 190, 7, fill="#fff3c4")


@topdown("june-lantern", "June from above, with a lantern",
         "June from above coming down the road with a lantern, two puffs of hair and the walkie-talkie's aerial; the lantern makes its own smaller, warmer circle.")
def june_l(a):
    ground(a, (214, 190, 120))
    person(a, 190, 210, -30, jacket="#6a3f6e", hair="#241a16", broad=0.85, puffs=True)
    a.line(178, 232, 150, 262, stroke="#111", stroke_width=3)
    a.circle(232, 176, 13, fill="#3b3a36", stroke="#111", stroke_width=2); a.circle(232, 176, 7, fill="#ffe7a3")
    a.circle(232, 176, 34, fill=a.radial([(0, "#fff0c8", 0.7), (1, kit.AMBER, 0)]))


@topdown("friend-lantern", "A friend from above, holding a lantern at a post",
         "One of the friends from above, broad-shouldered, standing with a lantern beside a cedar post so that its borrowed light holds the post in place.")
def friend_l(a):
    ground(a, (200, 200, 124))
    a.rect(236, 132, 30, 30, fill=kit.CEDAR, stroke="#3a2212", stroke_width=2)
    for k in range(1, 4):
        a.circle(251, 147, k * 4, fill="none", stroke="#5c3a24", stroke_width=1)
    a.text(272, 138, "17", size=20, family="sans-serif", fill="#f6e7c8", font_weight="bold")
    person(a, 186, 216, -40, jacket=kit.RED, hair="#1c1512", broad=1.18, step=0.2)
    a.circle(226, 190, 13, fill="#3b3a36", stroke="#111", stroke_width=2); a.circle(226, 190, 7, fill="#ffe7a3")
    a.circle(226, 190, 36, fill=a.radial([(0, "#fff0c8", 0.7), (1, kit.AMBER, 0)]))


def car(a, cx, cy, rot, body, L=250, Wd=112, van=False):
    a.open("g", transform=f"translate({cx} {cy}) rotate({rot})")
    cone = a.gradient([(0, "#ffe7a3"), (1, "#141518")], 0, 0, 1, 0)
    for s in (-1, 1):
        a.poly([(L / 2 - 4, s * Wd * 0.3), (L / 2 + 210, s * Wd * 0.3 - 70), (L / 2 + 210, s * Wd * 0.3 + 70)], fill=cone, opacity=0.5)
    a.rect(-L / 2 + 6, -Wd / 2 + 8, L, Wd, rx=22, fill="#000", opacity=0.4, filter=a.blur(6))
    a.rect(-L / 2, -Wd / 2, L, Wd, rx=26 if not van else 16, fill=body, stroke="#0b0d12", stroke_width=2.5)
    a.rect(-L / 2 + 6, -Wd / 2 + 5, L - 12, 8, rx=4, fill="#fff", opacity=0.14)
    wx = L / 2 - (58 if not van else 40)
    a.poly([(wx, -Wd / 2 + 12), (wx + 26, -Wd / 2 + 20), (wx + 26, Wd / 2 - 20), (wx, Wd / 2 - 12)], fill="#1a2532", stroke="#0b0d12", stroke_width=1.5)
    if van:
        a.rect(-L / 2 + 20, -Wd / 2 + 14, L - 80, Wd - 28, rx=8, fill="none", stroke="#0b0d12", stroke_width=1.5, opacity=0.7)
        for k in range(4):
            a.line(-L / 2 + 34 + k * 42, -Wd / 2 + 14, -L / 2 + 34 + k * 42, Wd / 2 - 14, stroke="#0b0d12", stroke_width=3)
        a.rect(-L / 2 + 40, -30, 70, 34, fill="#2f6fb5", stroke="#0b0d12", stroke_width=1.5)       # the tarp roll and the cooler on the rack
        a.rect(-L / 2 + 120, -6, 44, 36, fill="#d9d2c0", stroke="#0b0d12", stroke_width=1.5)
    else:
        a.rect(-L / 2 + 30, -Wd / 2 + 14, L - 104, Wd - 28, rx=10, fill="#000", opacity=0.14)
        a.poly([(-L / 2 + 34, -Wd / 2 + 16), (-L / 2 + 18, -Wd / 2 + 22), (-L / 2 + 18, Wd / 2 - 22), (-L / 2 + 34, Wd / 2 - 16)], fill="#1a2532")
        a.ellipse(wx + 10, 24, 9, 15, fill="#d8d2c0", opacity=0.9)                                # the covered dish on the seat
        a.ellipse(wx + 10, 24, 5, 9, fill="none", stroke="#6a6458", stroke_width=1.2)
    for s in (-1, 1):
        a.rect(L / 2 - 8, s * Wd * 0.3 - 9, 8, 18, fill="#fff3c4")
        a.rect(-L / 2, s * Wd * 0.3 - 8, 6, 16, fill="#a02a22")
        a.ellipse(wx - 6, s * (Wd / 2 + 5), 9, 5, fill=body, stroke="#0b0d12", stroke_width=1.5)
    a.close()


@topdown("van", "The van from above",
         "The friends' dull red van from above, roof rack loaded with a tarp roll and the cooler, headlights throwing two cones down the gravel into charcoal dark.")
def van(a):
    ground(a)
    car(a, 150, 220, -22, kit.RED, L=250, Wd=116, van=True)


@topdown("ruths-car", "Ruth's car from above",
         "Ruth's faded green estate car from above, parked at the end of the gravel with its lights on and its engine running, a covered dish on the passenger seat and exhaust curling behind.")
def ruths_car(a):
    ground(a)
    car(a, 170, 210, -160, kit.GREEN, L=230, Wd=104)
    sm = a.blur(6)
    for k in range(5):
        a.circle(296 + k * 18, 150 - k * 10 + (k % 2) * 12, 12 + k * 5, fill="#b9b7ae", opacity=0.22 - k * 0.03, filter=sm)


# ---- sprites: the same figures cut loose from their ground, for the torchlight loop to draw -----------
SW = 240


def sprite(key, title, doc):
    def deco(fn):
        @asset(G, f"sprite-{key}", group="figures", title=title, w=SW, h=SW,
               row="Top-down sprites, no ground (accepted 2026-11-15)")
        def draw(a: Art):
            fn(a)
        draw.__doc__ = doc
        return draw
    return deco


def blank_post(a, x, y, rot):
    a.open("g", transform=f"translate({x} {y}) rotate({rot})")
    a.rect(-78, -10, 156, 20, fill=kit.CEDAR, stroke="#3a2212", stroke_width=2)
    for k in range(5):
        a.line(-70 + k * 30, -8 + (k % 3) * 2, -50 + k * 30, 8 - (k % 2) * 3, stroke="#5c3a24", stroke_width=1.2)
    a.rect(48, -9, 26, 18, fill="#e8d9a8", stroke="#3a2212", stroke_width=1.2)
    a.poly([(-78, -10), (-100, 0), (-78, 10)], fill="#3a2a1a")
    a.close()


@sprite("tam-walk", "Sprite: Tam from above, walking",
        "Tam from straight above on a clear ground, facing right, the torch held forward; no road and no light, so the game can lay it on its own charcoal.")
def s_tam_walk(a):
    person(a, 116, 120, 0)
    a.rect(140, 96, 30, 11, fill="#222", stroke="#555", stroke_width=1)
    a.circle(174, 101, 6, fill="#fff3c4")


@sprite("tam-carry-one", "Sprite: Tam from above, one post",
        "Tam from above on a clear ground, facing right, one pulled cedar post across the right shoulder with its number plate left blank for the game to write on.")
def s_tam_one(a):
    person(a, 116, 116, 0, step=0.6)
    blank_post(a, 122, 156, 4)
    a.rect(140, 92, 30, 11, fill="#222", stroke="#555", stroke_width=1)
    a.circle(174, 97, 6, fill="#fff3c4")


@sprite("tam-carry-two", "Sprite: Tam from above, two posts",
        "Tam from above on a clear ground, facing right, a cedar post on each shoulder and the torch clamped under one; the plates are blank.")
def s_tam_two(a):
    person(a, 116, 120, 0, step=0.35)
    blank_post(a, 118, 82, -3); blank_post(a, 122, 158, 4)
    a.circle(206, 120, 6, fill="#fff3c4")


@sprite("june-lantern", "Sprite: June from above, with a lantern",
        "June from above on a clear ground, facing right, two puffs of hair, the walkie-talkie's aerial behind her and a lit lantern held out ahead.")
def s_june(a):
    person(a, 110, 124, 0, jacket="#6a3f6e", hair="#241a16", broad=0.85, puffs=True)
    a.line(96, 150, 70, 176, stroke="#111", stroke_width=3)
    a.circle(160, 100, 34, fill=a.radial([(0, "#fff0c8", 0.7), (1, kit.AMBER, 0)]))
    a.circle(160, 100, 13, fill="#3b3a36", stroke="#111", stroke_width=2); a.circle(160, 100, 7, fill="#ffe7a3")


@sprite("post", "Sprite: a site post from above",
        "A cedar site post seen from straight above: the square cut end with its growth rings, a tin cap nail, and a short soft shadow; the number is written by the game.")
def s_post(a):
    a.rect(74, 78, 100, 100, fill="#000", opacity=0.35, filter=a.blur(8))
    a.rect(66, 66, 108, 108, fill=kit.CEDAR, stroke="#3a2212", stroke_width=6)
    for k in range(1, 5):
        a.circle(120, 120, k * 11, fill="none", stroke="#5c3a24", stroke_width=3)
    a.line(72, 72, 100, 100, stroke="#5c3a24", stroke_width=2); a.line(168, 168, 146, 146, stroke="#5c3a24", stroke_width=2)
    a.circle(120, 120, 6, fill="#c9c2b0", stroke="#3a2212", stroke_width=2)


@sprite("van", "Sprite: the van from above",
        "The friends' dull red van from above on a clear ground, facing right, roof rack loaded with the tarp roll and the cooler; no headlight cones.")
def s_van(a):
    L, Wd = 200, 96
    a.open("g", transform="translate(120 120)")
    a.rect(-L / 2 + 6, -Wd / 2 + 8, L, Wd, rx=18, fill="#000", opacity=0.4, filter=a.blur(6))
    a.rect(-L / 2, -Wd / 2, L, Wd, rx=14, fill=kit.RED, stroke="#0b0d12", stroke_width=2.5)
    a.rect(-L / 2 + 6, -Wd / 2 + 5, L - 12, 7, rx=3, fill="#fff", opacity=0.14)
    wx = L / 2 - 34
    a.poly([(wx, -Wd / 2 + 10), (wx + 22, -Wd / 2 + 17), (wx + 22, Wd / 2 - 17), (wx, Wd / 2 - 10)], fill="#1a2532", stroke="#0b0d12", stroke_width=1.5)
    a.rect(-L / 2 + 16, -Wd / 2 + 12, L - 66, Wd - 24, rx=7, fill="none", stroke="#0b0d12", stroke_width=1.5, opacity=0.7)
    for k in range(4):
        a.line(-L / 2 + 28 + k * 34, -Wd / 2 + 12, -L / 2 + 28 + k * 34, Wd / 2 - 12, stroke="#0b0d12", stroke_width=3)
    a.rect(-L / 2 + 32, -26, 56, 28, fill="#2f6fb5", stroke="#0b0d12", stroke_width=1.5)
    a.rect(-L / 2 + 96, -6, 36, 30, fill="#d9d2c0", stroke="#0b0d12", stroke_width=1.5)
    for s in (-1, 1):
        a.rect(L / 2 - 7, s * Wd * 0.3 - 8, 7, 16, fill="#fff3c4")
        a.rect(-L / 2, s * Wd * 0.3 - 7, 5, 14, fill="#a02a22")
    a.close()

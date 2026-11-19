"""The Tray: fourteen Isotype pictograms, counted flat icons printed a little out of register."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, GREEN, SODIUM, STEEL, FROST, SNOW, BRUISE = (kit.INK, kit.CREAM, kit.GREEN, kit.SODIUM, kit.STEEL,
                                                         kit.FROST, kit.SNOW, kit.BRUISE)
ROW = "Isotype icons, incl. the tally man at five heights"
S = 200
TILE = "#EFE9DC"


def _tile(a, label):
    cl = a.clip(f'<rect x="3" y="3" width="{S - 6}" height="{S - 6}" rx="6"/>')
    a.rect(3, 3, S - 6, S - 6, rx=6, fill=TILE, stroke=INK, stroke_width=2)
    a.line(14, S - 40, S - 14, S - 40, stroke=INK, stroke_width=2)
    a.text(16, S - 18, label, size=15, family="sans-serif", fill=INK, font_weight="bold", letter_spacing=2)
    return cl


def _done(a, cl):
    kit.speckle(a, cl, 0, 0, S, S, color="#6f6750", strength=0.2, freq=0.9)


def _two(a, draw, col, dx=4, dy=3, under=FROST):
    """Print it twice: a tint plate slipped off register, then the colour."""
    a.open("g", transform=f"translate({dx},{dy})", opacity=0.55)
    draw(under)
    a.close()
    draw(col)


def _man(a, x, base, h, col):
    """The tally man: as he grows it is the legs and the neck that grow, and he narrows."""
    t = (h - 46) / 82
    hr = 9.5 - 1.5 * t
    sh = 15 - 3 * t
    legs = h * (0.44 + 0.06 * t)
    top = base - h
    body_top = top + hr * 2 + 3 + 5 * t
    a.circle(x, top + hr, hr, fill=col)
    a.rect(x - 2.2, top + hr * 2 - 2, 4.4, 6 + 5 * t, fill=col)
    a.poly([(x - sh, body_top), (x + sh, body_top), (x + sh * 0.62, base - legs), (x - sh * 0.62, base - legs)], fill=col)
    a.rect(x - sh * 0.62, base - legs, sh * 0.5, legs, fill=col)
    a.rect(x + sh * 0.12, base - legs, sh * 0.5, legs, fill=col)
    for sg in (-1, 1):
        a.poly([(x + sg * sh, body_top), (x + sg * (sh + 5), body_top + 3), (x + sg * (sh + 4 - 2 * t), body_top + h * (0.34 + 0.1 * t)),
                (x + sg * (sh - 1 - 2 * t), body_top + h * (0.34 + 0.1 * t))], fill=col)


for _i, _h in enumerate((178, 218, 258, 298, 338)):
    def _mk(i=_i, hcm=_h):
        def fn(a: Art):
            cl = _tile(a, f"{hcm} CM")
            px = 46 + i * 20.5
            a.path("".join(f"M22,{150 - j * 25.6:.0f}h{8 if j % 2 else 14}" for j in range(6)), stroke=INK, stroke_width=1.5)
            a.line(22, 150, 22, 22, stroke=INK, stroke_width=1.5)
            a.line(20, 150, S - 20, 150, stroke=INK, stroke_width=3)
            # the men he was, in outline, then the man he is
            for j in range(i):
                a.open("g", opacity=0.32)
                _man(a, 62 + j * 26, 150, 46 + j * 20.5, STEEL)
                a.close()
            _two(a, lambda c: _man(a, 62 + i * 26, 150, px, c), INK)
            _done(a, cl)
        fn.__doc__ = (f"Isotype tally man at {hcm} cm, step {i + 1} of five: a flat black figure on a height rule, taller "
                      f"and narrower than the grey men he was, who stand behind him.")
        return fn
    asset(G, f"icon-man-{_h}", group="pieces", title=f"Tray icon: tally man, {_h} cm", w=S, h=S, row=ROW)(_mk())


def _icon(id, label, title, doc):
    def deco(fn):
        def run(a: Art):
            cl = _tile(a, label)
            fn(a)
            _done(a, cl)
        run.__doc__ = doc
        asset(G, f"icon-{id}", group="pieces", title=f"Tray icon: {title}", w=S, h=S, row=ROW)(run)
        return fn
    return deco


def _piece_d(x, y, s):
    return (f"M{f(x - 16 * s)},{f(y + 9 * s)} L{f(x - 12 * s)},{f(y - 10 * s)} Q{f(x)},{f(y - 17 * s)} {f(x + 14 * s)},{f(y - 9 * s)} "
            f"L{f(x + 17 * s)},{f(y + 10 * s)}Z")


@_icon("piece", "PIECE", "one ration piece",
       "Isotype icon of one cut piece of the ration: a blunt slab shape in bruise purple with the knife's dashed "
       "line through it (the cut is yours), the unit every row of the tray is counted in.")
def _piece(a):
    _two(a, lambda c: a.path(_piece_d(100, 84, 3.3), fill=c), BRUISE)
    a.path("M70,62 q30,-12 62,2", fill="none", stroke=TILE, stroke_width=3, opacity=0.6)
    a.line(100, 30, 100, 138, stroke=INK, stroke_width=2.5, stroke_dasharray="7 5")


@_icon("pill", "PILL", "the pill",
       "Isotype icon of the pill in its paper cup: a two-tone capsule standing over a pleated cup.")
def _pill(a):
    _two(a, lambda c: a.poly([(60, 96), (140, 96), (128, 146), (72, 146)], fill=c), STEEL)
    a.path("".join(f"M{68 + i * 9},98l{-2 + i * 0.5:.1f},46" for i in range(8)), stroke=TILE, stroke_width=2)
    a.open("g", transform="rotate(-28 100 62)")
    _two(a, lambda c: a.rect(62, 46, 76, 32, rx=16, fill=c), INK)
    a.path("M100,46 h22 a16,16 0 0 1 0,32 h-22z", fill=SODIUM)
    a.close()


@_icon("heel", "BREAD", "the bread heel",
       "Isotype icon of a bread heel: the end of a loaf, crust dark and crumb pale, the one food that changes nothing.")
def _heel(a):
    _two(a, lambda c: a.path("M40,128 V78 Q40,36 100,36 Q160,36 160,78 V128Z", fill=c), "#7d5a2c")
    a.path("M54,128 V82 Q54,50 100,50 Q146,50 146,82 V128Z", fill="#E2C48E")
    for x, y in ((80, 80), (112, 70), (124, 100), (88, 108), (104, 92)):
        a.circle(x, y, 4, fill="#7d5a2c", opacity=0.5)


@_icon("broth", "BROTH", "the cup of broth",
       "Isotype icon of the cup of broth: a steel mug in profile, three flat curls of steam above it.")
def _broth(a):
    _two(a, lambda c: (a.rect(52, 74, 80, 68, rx=8, fill=c), a.path("M132,88 q30,2 30,22 q0,20 -30,22", fill="none",
                                                                     stroke=c, stroke_width=10)), STEEL)
    a.rect(52, 74, 80, 16, rx=6, fill=SODIUM)
    for i in range(3):
        x = 70 + i * 22
        a.path(f"M{x},64 q-10,-10 0,-20 q10,-10 0,-20", fill="none", stroke=INK, stroke_width=4, stroke_linecap="round")


@_icon("napkin", "NAPKIN", "the napkin",
       "Isotype icon of the folded napkin with one piece hidden in it: it holds three, and it has an end.")
def _napkin(a):
    _two(a, lambda c: a.poly([(40, 40), (160, 40), (160, 62), (62, 146), (40, 146)], fill=c), INK, dx=5, dy=4)
    a.poly([(46, 46), (154, 46), (154, 58), (58, 140), (46, 140)], fill="#FFFFFF")
    a.path(_piece_d(86, 82, 1.5), fill=BRUISE)
    a.poly([(46, 140), (46, 96), (104, 96)], fill=TILE, stroke=INK, stroke_width=3, stroke_linejoin="round")


@_icon("mouth", "EATEN", "the mouth",
       "Isotype icon of the mouth at the bottom edge of the page: an open flat shape, a piece going in.")
def _mouth(a):
    _two(a, lambda c: a.path("M30,84 Q100,40 170,84 Q100,160 30,84Z", fill=c), INK)
    a.path("M52,86 Q100,64 148,86 Q100,128 52,86Z", fill=BRUISE)
    a.path("M60,82 h80", stroke=TILE, stroke_width=7, stroke_dasharray="12 4")
    a.path(_piece_d(100, 40, 1.3), fill=BRUISE, stroke=TILE, stroke_width=2)


@_icon("gaze", "GAZE", "the orderly's gaze",
       "Isotype icon of the orderly's gaze: one flat eye, and the long shadow it throws down the page while it rests "
       "on you.")
def _gaze(a):
    a.poly([(70, 78), (130, 78), (176, 150), (24, 150)], fill=INK, opacity=0.18)
    _two(a, lambda c: a.path("M26,66 Q100,14 174,66 Q100,118 26,66Z", fill=c), INK)
    a.circle(100, 66, 23, fill=TILE)
    a.circle(100, 66, 11, fill=INK)


@_icon("passed", "TO JAX", "a piece passed to the next tray",
       "Isotype icon of a piece passed along the bench: two steel trays side by side and an arrow carrying one piece "
       "from the first to the second. Someone eats it.")
def _passed(a):
    for x in (22, 110):
        _two(a, lambda c, x=x: a.rect(x, 60, 68, 84, rx=8, fill=c), STEEL)
        a.rect(x + 7, 67, 54, 70, rx=5, fill="none", stroke=TILE, stroke_width=2.5)
    a.path(_piece_d(56, 118, 1.0), fill=BRUISE)
    a.path(_piece_d(144, 118, 1.0), fill=BRUISE)
    a.path(_piece_d(144, 90, 1.0), fill=BRUISE)
    a.path("M56,52 Q100,8 136,44", fill="none", stroke=INK, stroke_width=6)
    a.poly([(146, 54), (124, 50), (140, 32)], fill=INK)


@_icon("left", "LEFT", "pieces left on the tray",
       "Isotype icon of the collected tray: two pieces left on it and the orderly's pencil tick beside each, counted "
       "by pieces and not by weight.")
def _left(a):
    _two(a, lambda c: a.rect(26, 34, 148, 108, rx=12, fill=c), STEEL)
    a.rect(36, 44, 128, 88, rx=8, fill="none", stroke=TILE, stroke_width=3)
    for x in (72, 126):
        a.path(_piece_d(x, 80, 1.35), fill=BRUISE)
        a.path(f"M{x - 12},{112} l8,10 l16,-22", fill="none", stroke=INK, stroke_width=4.5, stroke_linecap="round")

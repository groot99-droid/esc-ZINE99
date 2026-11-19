"""Composite (1D, reconstruction from testimony): identikit acetate overlays.

The witnesses' document, not the comic's: a police identikit kit on a light box. Line-drawn feature
strips on clear acetate sheets with punched registration holes, typed labels, grease-pencil witness
numbers in red, and one strip that does not fit (the awed and the terrified are printed a little askew).
The base and every strip are 600 by 800 and register exactly when stacked; each strip's acetate band
covers its region only. The base carries the bible's constants (Part VI section 3) and is never chosen.
The form is shape only: no act, no wound, no gore."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "composite"
LINE = "#2a3340"
ACET = "#7d9aa6"
GREASE = "#b03030"
ROOM = "#d9dcd6"
REGIONS = {"head": (10, 200), "shoulders": (160, 340), "arms": (230, 580), "back": (220, 520), "gait": (500, 790)}


def acetate(a, region, askew=False):
    """The clear sheet for one region: a faint band, its edge, two punched holes, a typed region tab and
    a blank grease tab for witness numbers."""
    y0, y1 = REGIONS[region]
    if askew:
        a.open("g", transform=f"rotate(-3 300 {(y0 + y1) / 2})")
    a.rect(12, y0, 576, y1 - y0, rx=6, fill="#ffffff", opacity=0.22, stroke=ACET, stroke_width=2.5)
    for x in (30, 570):
        a.circle(x, y0 + 16, 7, fill=ROOM, opacity=0.8, stroke=ACET, stroke_width=1.5)
    a.rect(44, y0 + 6, 120, 22, fill="#ffffff", opacity=0.75, stroke=ACET, stroke_width=1)
    kit.label(a, 52, y0 + 22, region.upper(), size=13, family="monospace", fill=LINE, letter_spacing="2")
    a.rect(470, y0 + 6, 86, 22, fill="none", stroke=GREASE, stroke_width=1.2, stroke_dasharray="4 3", opacity=0.6)


def end_askew(a, askew):
    if askew:
        a.close()


S = dict(fill="none", stroke=LINE, stroke_width=5.5, stroke_linecap="round", stroke_linejoin="round")


@asset(G, f"{M}-base", group="pieces", title="The base form, with the constants printed", w=600, h=800,
       row=kit.row(M, "The base form and the light box"))
def base(a: Art):
    """The pale base form on its own acetate: a too-thin standing shape, skin drawn stretched taut over
    hollows where mass was pulled inward, thick black veins branching at the neck and arms, the jaw longer
    than the skull allows, and two small green eyes, the only colour; typed tabs name each constant."""
    form = ("M300,40 C330,40 346,64 344,96 C342,120 336,140 332,160 L318,196 L380,214 C410,224 420,250 422,290 "
            "L430,470 L408,474 L394,300 L378,300 L376,520 L360,780 L330,780 L310,540 L290,540 L270,780 L240,780 "
            "L224,520 L222,300 L206,300 L192,474 L170,470 L178,290 C180,250 190,224 220,214 L282,196 L268,160 "
            "C264,140 258,120 256,96 C254,64 270,40 300,40Z")
    a.path(form, fill=kit.WHITE, stroke="#9aa5a4", stroke_width=2.5)
    a.path("M268,150 C276,190 290,206 300,212 C310,206 324,190 332,150", **dict(S, stroke_width=2.5))
    for k in range(4):
        y = 300 + k * 34
        a.path(f"M244,{y} C270,{y + 10} 330,{y + 10} 356,{y}", fill="none", stroke="#9aa5a4", stroke_width=1.8)
    a.path("M262,450 C280,470 320,470 338,450", fill="none", stroke="#9aa5a4", stroke_width=1.8)
    for d in ("M296,170 C292,190 286,200 270,210 M300,176 C306,194 316,202 330,210",
              "M212,300 C204,340 198,380 196,430 M206,350 C196,360 190,372 188,384",
              "M388,300 C396,340 402,380 404,430 M394,350 C404,360 410,372 412,384",
              "M282,214 C270,232 262,250 258,276 M318,214 C330,232 338,250 342,276"):
        a.path(d, fill="none", stroke=kit.BLOOD, stroke_width=3.5, stroke_linecap="round")
    a.circle(287, 92, 5, fill=kit.GREEN)
    a.circle(313, 92, 5, fill=kit.GREEN)
    for x, y, tx, t in ((420, 140, 440, "JAW PAST THE SKULL"), (318, 92, 440, "EYES GREEN"),
                        (330, 230, 440, "VEINS BLACKENED"), (356, 330, 440, "SKIN TAUT"),
                        (338, 456, 440, "MASS PULLED IN")):
        a.line(x if x < tx else tx, y, tx - 4, y if x >= tx else y, stroke=ACET, stroke_width=1)
        a.rect(tx, y - 14, 152, 22, fill="#ffffff", opacity=0.85, stroke=ACET, stroke_width=1)
        kit.label(a, tx + 6, y + 2, t, size=11, family="monospace", fill=LINE, fit=kit.fitw(t, 11, 140, .62))


def strip(key, region, title, doc, kind="supported"):
    askew = kind != "supported"

    def draw(a: Art):
        acetate(a, region, askew)
        STRIPS[key](a)
        if kind != "supported":
            y0 = REGIONS[region][0]
            kit.label(a, 556, y0 + 22, "?", size=18, family="sans-serif", fill=GREASE, anchor="end", font_weight="bold")
        end_askew(a, askew)
    draw.__doc__ = doc
    asset(G, f"{M}-strip-{key}", group="pieces", title=title, w=600, h=800,
          row=kit.row(M, f"Feature strips: {region}"))(draw)


def s_head_sunk(a):
    a.path("M300,120 C326,120 342,138 340,164 C338,184 330,196 322,206 L278,206 C270,196 262,184 260,164 "
           "C258,138 274,120 300,120Z", **S)
    a.path("M240,190 C262,170 280,150 284,128 M360,190 C338,170 320,150 316,128", **S)
    a.path("M276,196 C282,232 292,246 300,250 C308,246 318,232 324,196", **S)


def s_head_halo(a):
    a.ellipse(300, 40, 74, 16, fill="none", stroke=kit.GOLD, stroke_width=7.5)
    a.ellipse(300, 40, 60, 11, fill="none", stroke=kit.GOLD, stroke_width=2.2)
    for k in range(9):
        x = 230 + k * 17.5
        a.line(x, 64, x + (x - 300) * .2, 104, stroke=kit.GOLD, stroke_width=3)


def s_head_horns(a):
    for sgn in (-1, 1):
        a.path(f"M{300 + sgn * 34},70 C{300 + sgn * 70},60 {300 + sgn * 92},30 {300 + sgn * 90},16 "
               f"C{300 + sgn * 82},34 {300 + sgn * 62},48 {300 + sgn * 40},52", **dict(S, stroke_width=6))
    a.path("M262,58 L248,40 M338,58 L352,40", **dict(S, stroke_width=3))


def s_shoulders_high(a):
    a.path("M282,196 C270,186 250,176 226,180 C206,184 196,200 194,226 L190,300", **S)
    a.path("M318,196 C330,186 350,176 374,180 C394,184 404,200 406,226 L410,300", **S)
    a.path("M226,180 C222,166 224,152 232,142 M374,180 C378,166 376,152 368,142", **S)


def s_shoulders_plate(a):
    for k in range(9):
        cx = 206 + k * 24
        cy = 222 + (math.sin(k * 1.3) * 6)
        a.path(f"M{cx - 16},{cy} L{cx - 4},{cy - 16} L{cx + 16},{cy - 10} L{cx + 12},{cy + 12} L{cx - 10},{cy + 14}Z",
               fill="#1b1d1e", opacity=0.85, stroke=LINE, stroke_width=3)
        a.line(cx - 6, cy - 6, cx + 4, cy + 6, stroke="#5a5f60", stroke_width=1.8)
    for k in range(6):
        cx, cy = 230 + k * 28, 278
        a.path(f"M{cx - 14},{cy} L{cx},{cy - 12} L{cx + 14},{cy - 4} L{cx + 8},{cy + 12} L{cx - 10},{cy + 10}Z",
               fill="#1b1d1e", opacity=0.75, stroke=LINE, stroke_width=3)


def s_arms_joint(a):
    for sgn in (-1, 1):
        x0 = 300 + sgn * 120
        a.path(f"M{x0},260 L{x0 + sgn * 14},340 L{x0 + sgn * 2},380 L{x0 + sgn * 20},450 L{x0 + sgn * 6},500 "
               f"L{x0 + sgn * 18},556", **S)
        for x, y in ((x0 + sgn * 14, 340), (x0 + sgn * 2, 380), (x0 + sgn * 20, 450), (x0 + sgn * 6, 500)):
            a.circle(x, y, 6, fill="none", stroke=LINE, stroke_width=3.8)


def s_arms_reach(a):
    for sgn in (-1, 1):
        x0 = 300 + sgn * 120
        a.path(f"M{x0},260 C{x0 + sgn * 30},340 {x0 + sgn * 60},440 {x0 + sgn * 80},572", **S)
        for k in range(4):
            a.line(x0 + sgn * (78 + k * 4), 572, x0 + sgn * (70 + k * 10), 578 + 0 * k, stroke=LINE, stroke_width=3.8)
        a.path(f"M{x0 + sgn * 70},572 l{sgn * 4},6 M{x0 + sgn * 78},572 l{sgn * 6},6 M{x0 + sgn * 86},570 l{sgn * 8},6",
               **dict(S, stroke_width=3.8))


def s_arms_wings(a):
    for sgn in (-1, 1):
        a.path(f"M{300 + sgn * 100},260 C{300 + sgn * 200},200 {300 + sgn * 270},250 {300 + sgn * 280},420 "
               f"C{300 + sgn * 240},380 {300 + sgn * 200},400 {300 + sgn * 170},460 C{300 + sgn * 160},400 "
               f"{300 + sgn * 130},360 {300 + sgn * 100},340", fill="none", stroke=kit.GOLD, stroke_width=6)
        for k in range(4):
            a.path(f"M{300 + sgn * (150 + k * 30)},{280 + k * 10} L{300 + sgn * (160 + k * 30)},{360 + k * 16}",
                   fill="none", stroke=kit.GOLD, stroke_width=3)


def s_back_ridge(a):
    for k in range(10):
        y = 240 + k * 26
        a.path(f"M292,{y} L300,{y - 18} L308,{y}", **S)
    a.path("M300,240 L300,500", **dict(S, stroke_width=3, stroke_dasharray="6 6"))


def s_back_light(a):
    a.circle(300, 330, 34, fill="none", stroke=kit.GOLD, stroke_width=6)
    for k in range(12):
        t = math.radians(k * 30)
        a.line(300 + 46 * math.cos(t), 330 + 46 * math.sin(t), 300 + 120 * math.cos(t), 330 + 120 * math.sin(t),
               stroke=kit.GOLD, stroke_width=3.8)


def s_gait_long(a):
    for sgn in (-1, 1):
        a.path(f"M{300 + sgn * 20},520 L{300 + sgn * 70},640 L{300 + sgn * 40},700 L{300 + sgn * 90},780", **S)
        a.path(f"M{300 + sgn * 90},780 L{300 + sgn * 120},784", **S)
        a.circle(300 + sgn * 70, 640, 6, fill="none", stroke=LINE, stroke_width=3.8)


def s_gait_tail(a):
    a.path("M300,520 C340,600 420,640 470,700 C500,740 520,760 560,770", fill="none", stroke=LINE, stroke_width=9,
           stroke_linecap="round")
    a.path("M552,760 L572,774 L548,784Z", fill=LINE)


STRIPS = {"head-sunk": s_head_sunk, "head-halo": s_head_halo, "head-horns": s_head_horns,
          "shoulders-high": s_shoulders_high, "shoulders-plate": s_shoulders_plate,
          "arms-joint": s_arms_joint, "arms-reach": s_arms_reach, "arms-wings": s_arms_wings,
          "back-ridge": s_back_ridge, "back-light": s_back_light,
          "gait-long": s_gait_long, "gait-tail": s_gait_tail}

strip("head-sunk", "head", "Strip, head: sunk between the shoulders",
      "An acetate strip for the head: line drawing of the head set too low, the neck gone, the shoulders "
      "rising past the ears; typed HEAD tab and a blank grease tab for witness numbers.")
strip("head-halo", "head", "Strip, head: a halo (awed)",
      "The awed head strip, a little askew on its sheet: a gold ring drawn over the head with lines falling "
      "from it, described only by witnesses who could not see but believed. A grease question mark.", "awed")
strip("head-horns", "head", "Strip, head: horns (terrified)",
      "The terrified head strip, askew: two curved horns drawn heavy over the head, seen by someone who ran; "
      "it must be left out the same way as the awed. A grease question mark.", "terrified")
strip("shoulders-high", "shoulders", "Strip, shoulders: too high",
      "An acetate strip for the shoulders: line drawing of shoulders hitched far too high, peaking above "
      "the jaw line (Part VI section 8: shoulders too high).")
strip("shoulders-plate", "shoulders", "Strip, shoulders: scab plating (the raid)",
      "The raid's shoulders strip: overlapping hardened black plates across the chest and shoulders, cracked "
      "at the edges, drawn flat; the form the sustained fire made.")
strip("arms-joint", "arms", "Strip, arms: a joint too many",
      "An acetate strip for the arms: each arm in line with one joint more than an arm has, the extra joints "
      "circled (joints in the wrong count).")
strip("arms-reach", "arms", "Strip, arms: reach (the gala)",
      "The gala's arms strip: both arms drawn far too long, reaching past the knees to long fingers: reach, "
      "everything longer than it should be.")
strip("arms-wings", "arms", "Strip, arms: wings (awed)",
      "The awed arms strip, askew: a pair of gold wings drawn out from the shoulders, offered by a witness "
      "who saw a god. It does not fit.", "awed")
strip("back-ridge", "back", "Strip, back: the spine pulled into a ridge",
      "An acetate strip for the back: the spine drawn as a row of raised chevrons down the middle, the body "
      "pulled up along it.")
strip("back-light", "back", "Strip, back: a light coming out of him (awed)",
      "The awed back strip, askew: a gold circle at the chest with rays going out, Yusuf's “I saw a light "
      "come out of him.”", "awed")
strip("gait-long", "gait", "Strip, gait: low and long",
      "An acetate strip for the gait: the legs drawn bent the wrong way at the knee, the stance low and long, "
      "the feet too far apart.")
strip("gait-tail", "gait", "Strip, gait: a tail (terrified)",
      "The terrified gait strip, askew: a long tail drawn heavy from the base of the spine to the floor, "
      "seen by someone too frightened to look twice.", "terrified")


@asset(G, f"{M}-lightbox", group="backdrops", title="Composite: the light box (backdrop)", w=1280, h=720,
       row=kit.row(M, "The base form and the light box"))
def lightbox(a: Art):
    """The witness room: a gray table, the light box glowing pale in the middle where the stack lies,
    slotted racks for strips at the left and right, a rail along the bottom for witness cards and a framed
    space at the top right for the inset map."""
    a.rect(0, 0, 1280, 720, fill=ROOM)
    a.rect(0, 0, 1280, 720, fill=a.radial([(0, "#ffffff", 0.35), (1, "#ffffff", 0)], r=0.6))
    a.rect(420, 24, 440, 520, rx=12, fill="#7f8786", stroke="#5f6766", stroke_width=4)
    a.rect(436, 40, 408, 488, rx=6, fill="#f5f7f2")
    a.rect(436, 40, 408, 488, rx=6, fill=a.radial([(0, "#ffffff", 0.9), (1, "#e8ece6", 0.6)], r=0.7))
    for x0, y0, n in ((30, 24, 6), (880, 212, 4)):
        a.rect(x0, y0, 370, 544 - y0, rx=8, fill="#c9cdc7", stroke="#9aa09a", stroke_width=2)
        for k in range(n):
            a.rect(x0 + 14, y0 + 16 + k * 84, 342, 70, rx=4, fill="#e3e6e1", stroke="#9aa09a", stroke_width=1.5)
    a.rect(20, 566, 1240, 140, rx=8, fill="#c3c7c1", stroke="#9aa09a", stroke_width=2)
    a.line(30, 690, 1250, 690, stroke="#8f958f", stroke_width=3)
    a.rect(880, 24, 370, 170, fill="none", stroke=ACET, stroke_width=2, stroke_dasharray="8 6")


WITNESSES = (
    ("mercy", 1, "Mercy Abiodun", "at the drums", 1),
    ("wren", 2, "Wren Halloran", "at the shelter door", 1),
    ("bashir", 3, "Bashir Kade", "under the span", 1),
    ("dov", 4, "Dov Ashkenazi", "at the generator", 1),
    ("sato", 5, "Ren Sato", "from the truck, at the front", 1),
    ("yusuf", 6, "Yusuf Demir", "behind the laundry; saw a light", 1),
    ("ama", 1, "Ama Owusu", "at the service door", 2),
    ("lev", 2, "Lev Brandt", "in the corridor", 2),
    ("corinne", 3, "Corinne Vale", "at her table", 2),
    ("desmond", 4, "Desmond Achebe", "at the balcony post", 2),
)


def witness(key, n, name, where, which):
    def draw(a: Art):
        a.rect(6, 8, 250, 150, rx=4, fill="#000", opacity=0.12)
        a.rect(2, 2, 250, 150, rx=4, fill="#fbfbf6", stroke="#8f958f", stroke_width=2)
        a.line(2, 40, 252, 40, stroke="#c7a0a0", stroke_width=1.2)
        for y in (70, 96, 122):
            a.line(14, y, 240, y, stroke="#b9c7cf", stroke_width=1)
        a.circle(32, 30, 20, fill="none", stroke=GREASE, stroke_width=3.5, filter=a.roughen(1.2, 0.1))
        kit.label(a, 32, 40, str(n), size=28, fill=GREASE, anchor="middle", font_weight="bold")
        kit.label(a, 62, 32, name, size=19, family="monospace", fill=LINE, font_weight="bold", fit=kit.fitw(name, 19, 180, .62))
        kit.label(a, 14, 64, "SAW FROM:", size=11, family="monospace", fill="#666")
        for k, ln in enumerate(kit.wrap(where, 24)[:2]):
            kit.label(a, 14, 90 + k * 26, ln, size=15, family="monospace", fill=LINE, fit=kit.fitw(ln, 15, 228, .62))
        kit.label(a, 240, 146, f"COMPOSITE {which}", size=10, family="monospace", fill="#888", anchor="end")
    draw.__doc__ = (f"Witness card {n} for Composite {which}: {name}, who saw from {where}; a typed index card "
                    f"with the witness number circled in red grease pencil. The account is read aloud at run time.")
    asset(G, f"{M}-witness-{key}", group="cards", title=f"Witness {n}: {name}", w=256, h=160,
          row=kit.row(M, f"Witness cards (Composite {which})"))(draw)


for _w in WITNESSES:
    witness(*_w)


def numbered(a, pts):
    for n, (x, y) in enumerate(pts, 1):
        a.circle(x, y, 11, fill="#fbfbf6", stroke=GREASE, stroke_width=2.5)
        kit.label(a, x, y + 5, str(n), size=14, fill=GREASE, anchor="middle", font_weight="bold")


def where_he_stood(a, x, y):
    a.path(f"M{x - 9},{y - 9} L{x + 9},{y + 9} M{x + 9},{y - 9} L{x - 9},{y + 9}", stroke=LINE, stroke_width=3.5)


@asset(G, f"{M}-map-freeway", group="maps", title="Inset map: under the freeway", w=360, h=240,
       row=kit.row(M, "Inset maps (who had line of sight)"))
def map_freeway(a: Art):
    """A typed plan of the settlement under the freeway: the span as a band, shelters as boxes, the drums,
    the generator, the laundry lines, the State truck at the front, an X where he stood, and the six
    witnesses' places circled in red grease pencil."""
    a.rect(2, 2, 356, 236, fill="#f5f7f2", stroke=ACET, stroke_width=2)
    a.rect(2, 20, 356, 40, fill="#d5dad6")
    kit.label(a, 10, 44, "FREEWAY SPAN", size=11, family="monospace", fill=LINE)
    for x, y in ((40, 90), (100, 150), (240, 90), (280, 160)):
        a.rect(x, y, 50, 36, fill="none", stroke=LINE, stroke_width=2)
    for k in range(4):
        a.circle(170 + k * 14, 200, 6, fill="none", stroke=LINE, stroke_width=1.5)
    a.rect(320, 100, 26, 40, fill="none", stroke=LINE, stroke_width=2)
    a.path("M30,200 L120,214 M30,212 L120,226", stroke=LINE, stroke_width=1, stroke_dasharray="3 3")
    a.rect(150, 70, 60, 26, fill=LINE, opacity=0.25, stroke=LINE, stroke_width=2)
    kit.label(a, 180, 88, "TRUCK", size=10, family="monospace", fill=LINE, anchor="middle")
    where_he_stood(a, 190, 140)
    numbered(a, [(176, 182), (125, 145), (150, 46), (333, 92), (210, 108), (70, 196)])


@asset(G, f"{M}-map-gala", group="maps", title="Inset map: the gala floor and the balcony", w=360, h=240,
       row=kit.row(M, "Inset maps (who had line of sight)"))
def map_gala(a: Art):
    """A typed plan of the gala: round tables, the columns, the balcony along the top, the service door at
    the left and a security post, an X where it happened and the four witnesses' places circled in red."""
    a.rect(2, 2, 356, 236, fill="#f5f7f2", stroke=ACET, stroke_width=2)
    a.rect(2, 2, 356, 30, fill="#d5dad6")
    kit.label(a, 10, 22, "BALCONY", size=11, family="monospace", fill=LINE)
    for x, y in ((90, 110), (170, 150), (250, 110), (130, 200), (230, 200)):
        a.circle(x, y, 18, fill="none", stroke=LINE, stroke_width=2)
    for x in (60, 300):
        a.rect(x - 8, 40, 16, 16, fill=LINE, opacity=0.4)
    a.rect(2, 90, 14, 50, fill=LINE, opacity=0.4)
    kit.label(a, 20, 84, "SERVICE", size=10, family="monospace", fill=LINE)
    where_he_stood(a, 200, 50)
    numbered(a, [(28, 116), (46, 160), (250, 110), (318, 46)])


@asset(G, f"{M}-pin", group="pieces", title="Pin the composite", w=120, h=120,
       row=kit.row(M, "Pin"))
def pin(a: Art):
    """The pin: a red push pin through the corner of a clear sheet, a grease-pencil tick beside it."""
    a.rect(20, 30, 80, 80, fill="#ffffff", opacity=0.35, stroke=ACET, stroke_width=2)
    a.circle(36, 46, 14, fill=GREASE, stroke=LINE, stroke_width=2)
    a.circle(32, 42, 4, fill="#ffffff", opacity=0.6)
    a.line(36, 60, 44, 74, stroke=LINE, stroke_width=3)
    a.path("M60,80 L74,96 L104,56", fill="none", stroke=GREASE, stroke_width=5, stroke_linecap="round",
           stroke_linejoin="round", filter=a.roughen(1.2, 0.1))

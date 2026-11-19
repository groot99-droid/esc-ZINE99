"""The Charter as engrossed deeds: five documents, Schedule C, the writ, eight chits and six seals."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK, BB = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK, kit.BLUEBLACK)
ROW = "The Charter: 5 documents, Schedule C, the writ, 8 chits, 6 seals"
VELLUM = "#EBDDB8"
WOOD = "#4a3320"


def slope(a):
    """The writing slope the page lies on."""
    a.paper(WOOD, grain=0.35, fibre=0.02)
    a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, "#000", gap=9, sw=1, opacity=0.25))


def page(a, x, y, w, h, tone=VELLUM, rough=4.0, shadow=True):
    flt = a.roughen(scale=rough, freq=0.03)
    if shadow:
        a.rect(x + 8, y + 10, w, h, fill="#000", opacity=0.35, filter=a.blur(6))
    a.rect(x, y, w, h, fill=tone, filter=flt)
    a.rect(x, y, w, h, fill=a.radial([(0, "#fff", 0.25), (0.7, "#fff", 0), (1, TEA, 0.28)], 0.45, 0.4, 0.75))
    a.rect(x + 26, y + 26, w - 52, h - 52, fill="none", stroke=TEA, stroke_width=0.8, opacity=0.5)


def initial(a, x, y, ch, s=62):
    a.rect(x, y, s, s, fill=RED)
    a.rect(x + 4, y + 4, s - 8, s - 8, fill="none", stroke=GOLD, stroke_width=1.5)
    a.path(a.smooth_d(kit.spiral_pts(x + s * 0.5, y + s * 0.5, 2, s * 0.42, 2.5)), fill="none", stroke=GOLD, stroke_width=1, opacity=0.6)
    a.text(x + s / 2, y + s * 0.78, ch, size=s * 0.84, family="serif", fill=LAMP, text_anchor="middle", font_style="italic")


def pin(a, x, y, col=RED):
    a.line(x, y, x + 9, y + 13, stroke="#555", stroke_width=1.6)
    a.circle(x, y, 6.5, fill=col, stroke="#000", stroke_width=0.8)
    a.circle(x - 2, y - 2, 2, fill="#fff", opacity=0.6)


def clauses(a, x, y, w, n, h, binding=None, ticks=(), refs=None, lines=2, swim=0.0):
    """n numbered clauses in engrossing hand within height h. binding = (index, text). Returns the binding clause's
    underline as (x0, x1, y)."""
    gap = h / n
    lh = min(26, gap / (lines + 0.7))
    size = lh / 24
    out = None
    refs = refs or {}
    for i in range(n):
        cy = y + i * gap + lh
        a.text(x - 12, cy, f"{i + 1}.", size=max(11, 17 * size + 3), family="serif", fill=RED, text_anchor="end", font_weight="bold")
        for j in range(lines):
            ly = cy + j * lh
            if binding and binding[0] == i and j == lines - 1:
                tw = len(binding[1]) * lh * 0.42 + 14
                lead = w * 0.2
                kit.script(a, x, ly, lead, size=size)
                a.text(x + lead + 10, ly, binding[1], size=lh * 0.88, family="serif", fill=BB, font_style="italic")
                a.path(a.wobble_d([(x + lead + 6, ly + 7), (x + lead + tw, ly + 7)], 0.8, 12), fill="none", stroke=RED, stroke_width=2.4)
                if x + lead + tw + 30 < x + w:
                    kit.script(a, x + lead + tw + 14, ly, w - lead - tw - 30, size=size)
                out = (x + lead + 6, x + lead + tw, ly + 7)
            else:
                kit.script(a, x, ly, w * (0.72 if j == lines - 1 and i % 3 == 1 else 1) - (30 if i in ticks else 0), size=size)
        if i in ticks:
            kit.tick(a, x + w - 4, cy + lh * 0.4, s=max(0.7, size))
        if i in refs:
            a.text(x + w + 6, cy - lh * 0.3, refs[i], size=max(11, lh * 0.5), family="serif", fill=RED, font_style="italic")
    return out


def slip(a, x, y, w, h, rot, label=None, n=3, signed=True):
    a.open("g", transform=f"translate({x},{y}) rotate({rot})")
    a.rect(3, 4, w, h, fill="#000", opacity=0.25)
    a.rect(0, 0, w, h, fill=LAMP, stroke=TEA, stroke_width=0.8)
    if label:
        kit.smallcaps(a, 12, 20, label, size=11, col=RED, anchor="start")
    for j in range(n):
        kit.script(a, 12, 38 + j * 16, w - 26, size=0.6)
    if signed:
        kit.script(a, w * 0.55, h - 10, w * 0.35, size=0.8)
    pin(a, w / 2, 8)
    a.close()


def tabs(a, x, y, n, active=0):
    for i in range(n):
        tx = x + i * 62
        a.path(f"M{tx},{y} l6,-22 h40 l6,22z", fill=VELLUM if i == active else "#d6c69c", stroke=TEA, stroke_width=0.9)
        a.text(tx + 26, y - 6, kit.ROMAN[i], size=13, family="serif", fill=RED if i == active else TEA, text_anchor="middle")


def em_company(a, variant=False):
    def fn(cx, cy, r):
        if variant:
            a.open("g", transform=f"translate({f(2 * cx)},0) scale(-1,1)")
            kit.company_mark(a, cx, cy, r * 0.92, opacity=0.5)
            a.close()
            a.circle(cx, cy, r * 0.3, fill="none", stroke="#000", stroke_width=r * 0.06, opacity=0.4)
        else:
            kit.company_mark(a, cx, cy, r, opacity=0.5)
            a.path(f"M{f(cx - r * 1.05)},{f(cy)}h{f(r * 2.1)}", stroke="#000", stroke_width=r * 0.07, opacity=0.4)
    return fn


def em_king(a):
    def fn(cx, cy, r):
        st = dict(fill="none", stroke="#000", stroke_width=r * 0.09, opacity=0.45, stroke_linecap="round")
        for sgn in (-1, 1):
            a.path(f"M{f(cx - sgn * r * 0.7)},{f(cy + r * 0.75)} L{f(cx + sgn * r * 0.5)},{f(cy - r * 0.5)}", **st)
            a.ellipse(cx + sgn * r * 0.62, cy - r * 0.66, r * 0.14, r * 0.3, fill="#000", opacity=0.4,
                      transform=f"rotate({sgn * 40} {f(cx + sgn * r * 0.62)} {f(cy - r * 0.66)})")
        a.path(f"M{f(cx - r * 0.7)},{f(cy + r * 0.1)} q{f(r * 0.35)},{f(-r * 0.3)} {f(r * 0.7)},0 t{f(r * 0.7)},0", **st)
    return fn


def em_lamp(a):
    def fn(cx, cy, r):
        st = dict(fill="none", stroke="#000", stroke_width=r * 0.09, opacity=0.45, stroke_linecap="round", stroke_linejoin="round")
        a.path(f"M{f(cx)},{f(cy + r * 0.85)} V{f(cy - r * 0.1)} M{f(cx - r * 0.3)},{f(cy + r * 0.85)} h{f(r * 0.6)} "
               f"M{f(cx - r * 0.28)},{f(cy - r * 0.1)} h{f(r * 0.56)} l{f(-r * 0.1)},{f(-r * 0.5)} h{f(-r * 0.36)}z "
               f"M{f(cx - r * 0.2)},{f(cy - r * 0.6)} L{f(cx)},{f(cy - r * 0.85)} L{f(cx + r * 0.2)},{f(cy - r * 0.6)}", **st)
        a.circle(cx, cy - r * 0.34, r * 0.1, fill="#000", opacity=0.45)
    return fn


def em_light(a):
    def fn(cx, cy, r):
        st = dict(fill="none", stroke="#000", stroke_width=r * 0.08, opacity=0.45, stroke_linecap="round", stroke_linejoin="round")
        a.path(f"M{f(cx - r * 0.3)},{f(cy + r * 0.85)} L{f(cx - r * 0.16)},{f(cy - r * 0.2)} h{f(r * 0.32)} L{f(cx + r * 0.3)},{f(cy + r * 0.85)}z "
               f"M{f(cx - r * 0.22)},{f(cy + r * 0.3)} h{f(r * 0.44)} M{f(cx - r * 0.2)},{f(cy - r * 0.2)} v{f(-r * 0.26)} h{f(r * 0.4)} v{f(r * 0.26)}", **st)
        for an in (-150, -120, -60, -30):
            q = math.radians(an)
            a.line(cx + r * 0.4 * math.cos(q), cy - r * 0.34 + r * 0.4 * math.sin(q), cx + r * 0.8 * math.cos(q),
                   cy - r * 0.34 + r * 0.8 * math.sin(q), **st)
    return fn


def em_pearl(a):
    def fn(cx, cy, r):
        st = dict(fill="none", stroke="#000", stroke_width=r * 0.08, opacity=0.45, stroke_linecap="round", stroke_linejoin="round")
        a.path(f"M{f(cx - r * 0.8)},{f(cy)} A{f(r * 0.8)},{f(r * 0.8)} 0 0,1 {f(cx + r * 0.8)},{f(cy)} L{f(cx)},{f(cy + r * 0.7)}Z", **st)
        for an in (-60, -30, 0, 30, 60):
            q = math.radians(an)
            a.line(cx, cy + r * 0.7, cx + r * 0.76 * math.sin(q), cy - r * 0.76 * math.cos(q) * 0.95, **st)
        a.circle(cx, cy + r * 0.12, r * 0.2, fill="#fff", opacity=0.5)
    return fn


def em_spiral(a):
    def fn(cx, cy, r):
        a.path(a.smooth_d(kit.spiral_pts(cx, cy, 1, r * 0.9, 3)), fill="none", stroke="#000", stroke_width=r * 0.09, opacity=0.45,
               stroke_linecap="round")
    return fn


# ---- the five documents ------------------------------------------------------------------------------
DOCS = [
    ("deed", "The sale deed of the halls", "T", "his Indenture of Sale", 2, 6, (3, "and all waters adjoining"), (0, 1, 4), {},
     "king", False, "the tutorial document: two pages, six clauses, and the four words that bind the sea underlined in red"),
    ("harbour-book", "The Tidewater harbour book", "T", "he Harbour Book of Tidewater", 3, 9,
     (5, "for forty years from the lighting of the quay lamp"), (0, 1, 2, 3, 6, 8), {2: "cl. 6", 7: "Sched. C"}, "lamp", True,
     "a Company ledger raised from a wreck, sea-swollen and bloomed with salt, its dues clause underlined"),
    ("lighthouse-lease", "The lighthouse lease", "L", "ease of the Lights", 4, 12, (6, "subject to clause 7(b)"),
     (0, 1, 2, 3, 4, 5, 8, 9, 11), {1: "cl. 7", 4: "cl. 7(b)", 9: "Sched. II"}, "light", False,
     "four pages and twelve clauses, the keepers' clause unticked and underlined, an amendment slip pinned beside it"),
    ("diving-deed", "The diving-rights deed", "D", "eed of Diving Rights", 4, 12, (8, "as set out in Schedule II"),
     (0, 1, 2, 4, 5, 6, 7, 10), {0: "cl. 9", 3: "cl. 9", 10: "cl. 4"}, "pearl", False,
     "the elders' sale of the banks, with two decoy clauses cross-referenced in red and the pearl-shell seal"),
    ("halls-deed", "The halls' deed and its debt schedule", "T", "he Deed of the Halls", 6, 20, (13, "all waters adjoining"),
     (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19), {2: "cl. 14", 6: "cl. 11", 9: "Sched. I", 17: "cl. 14"}, "king", False,
     "the hardest document: six pages, twenty clauses in a small hand, a schedule of debts ruled in red, and one clause "
     "the Lord of Tea could not tick"),
]


def make_doc(i, key, name, ini, title, pages, n, binding, ticks, refs, sealkind, swollen, what):
    @asset(G, f"charter-{key}", group="documents", title=name, w=800, h=1100, row=ROW)
    def doc(a: Art):
        slope(a)
        tabs(a, 110, 62, pages)
        page(a, 60, 60, 680, 990, tone="#E4D6B4" if swollen else VELLUM, rough=9 if swollen else 4)
        initial(a, 110, 110, ini)
        a.text(184, 160, title, size=38 if len(title) < 24 else 32, family="serif", fill=BB, font_style="italic")
        kit.flourish(a, 400, 196, 0.7, 1)
        kit.flourish(a, 400, 196, 0.7, -1)
        top, hh = 240, 600 if n < 20 else 500
        ul = clauses(a, 150, top, 500, n, hh, binding=binding, ticks=ticks, refs=refs, lines=(1 if n == 20 else 2) if n > 9 else 3)
        if ul:
            pin(a, ul[0] - 14, ul[2] - 16)
        if n == 20:   # the schedule of debts
            a.rect(110, 760, 420, 150, fill="none", stroke=RED, stroke_width=1)
            a.path("M110,786 h420 M360,760 v150 M440,760 v150", stroke=RED, stroke_width=0.8, fill="none")
            kit.smallcaps(a, 122, 779, "Schedule I. Debts", size=12, col=RED, anchor="start")
            for j in range(6):
                kit.script(a, 120, 806 + j * 19, 220, size=0.62)
                kit.script(a, 370, 806 + j * 19, 56, size=0.62)
                kit.script(a, 450, 806 + j * 19, 64, size=0.62)
        if key == "lighthouse-lease":
            slip(a, 560, 500, 170, 110, 6, label="Amendment")
        if key == "diving-deed":
            slip(a, 70, 560, 150, 96, -7, label="Schedule II")
        if key == "harbour-book":
            a.path("M110,232 h580", stroke=RED, stroke_width=1)
            a.text(690, 226, "lamp lit", size=14, family="serif", fill=BB, font_style="italic", text_anchor="end")
            for (sx, sy, sr) in ((600, 330, 90), (200, 820, 120), (520, 960, 60)):
                kit.salt(a, sx, sy, sr)
            a.rect(60, 60, 680, 990, fill=SEAINK, opacity=0.07)
        # signatures and seal
        kit.script(a, 130, 950, 170, size=1.3)
        a.line(120, 962, 320, 962, stroke=BB, stroke_width=0.8)
        emb = {"king": em_king(a), "lamp": em_lamp(a), "light": em_light(a), "pearl": em_pearl(a)}[sealkind]
        kit.wax(a, 610, 930, 58, emblem=emb, ribbon=INK if sealkind != "pearl" else GREEN, col=RED if sealkind != "pearl" else "#2d5e52")
        if key in ("deed", "halls-deed"):
            kit.wax(a, 480, 950, 40, emblem=em_company(a), ribbon=None)
        kit.italic(a, 400, 1030, f"page I of {kit.ROMAN[pages - 1]}", size=14, col=TEA)
    doc.__doc__ = f"{name}, engrossed on vellum and lying on the writing slope: {what}."
    return doc


for _i, _d in enumerate(DOCS):
    make_doc(_i, *_d)


@asset(G, "charter-schedule-c", group="documents", title="Schedule C", w=1100, h=1100, row=ROW)
def schedule_c(a: Art):
    """Schedule C of the Tidewater harbour book: the red thread leaves the underlined clause, runs off the page
    edge, crosses the cabin wall and stops at a bottle hanging there with a paper at its neck, signed with a spiral."""
    slope(a)
    # the cabin wall beyond the slope
    a.rect(760, 0, 340, a.h, fill="#2c1e12")
    a.rect(760, 0, 340, a.h, fill=kit.pattern(a, "#000", gap=58, sw=3, ang=90, opacity=0.5))
    a.rect(752, 0, 10, a.h, fill="#1a120a")
    tabs(a, 110, 62, 3, active=2)
    page(a, 60, 60, 640, 990, tone="#E4D6B4", rough=9)
    kit.smallcaps(a, 380, 150, "Schedule C", size=34, col=BB)
    kit.italic(a, 380, 184, "Tidewater", size=20, col=TEA)
    a.path("M130,206 h500", stroke=RED, stroke_width=1)
    ul = clauses(a, 150, 240, 470, 7, 560, binding=(3, "Tidewater"), ticks=(0, 1, 2, 4, 5, 6), lines=3)
    for (sx, sy, sr) in ((560, 860, 110), (180, 300, 70)):
        kit.salt(a, sx, sy, sr)
    # the signature under the clause is a clockwise spiral
    kit.spiral(a, 420, ul[2] + 46, 2, 26, 3, stroke_width=2.4)
    kit.wax(a, 560, 950, 46, emblem=em_company(a), ribbon=INK)
    # the thread
    bx, by = 930, 300
    th = [(ul[1], ul[2]), (640, ul[2] - 30), (720, ul[2] + 40), (800, 520), (870, 470), (bx + 26, by + 96)]
    a.path(a.smooth_d(th), fill="none", stroke="#000", stroke_width=4, opacity=0.35, transform="translate(3,5)")
    a.path(a.smooth_d(th), fill="none", stroke=RED, stroke_width=3.2, stroke_linecap="round")
    a.path(a.smooth_d(th), fill="none", stroke="#d98a7a", stroke_width=1, stroke_dasharray="5 6")
    pin(a, ul[1] + 4, ul[2] - 14)
    a.rect(900, 150, 60, 14, fill="#1a120a")
    a.circle(bx, 164, 5, fill=GOLD)
    kit.bottle(a, bx, by, s=3.2, ang=4, col=LAMP, glass=SEAINK, tag=True, cord=42, fill_opacity=0.6)
    pin(a, bx + 26 + 4, by + 96 - 14)


@asset(G, "charter-writ", group="documents", title="The writ", w=800, h=1100, row=ROW)
def writ(a: Art):
    """The writ the princess kept in her sleeve: a Company form on crisp stock, creased in three from the folding,
    naming a principal debtor and a surety, with a clockwise spiral where the debtor signed."""
    slope(a)
    page(a, 80, 70, 640, 960, tone=LAMP, rough=2)
    a.rect(110, 100, 580, 900, fill="none", stroke=INK, stroke_width=2.2)
    a.rect(118, 108, 564, 884, fill="none", stroke=INK, stroke_width=0.8)
    kit.company_mark(a, 400, 176, 34, col=INK, opacity=1, sw=2.2)
    a.text(400, 286, "WRIT", size=74, family="serif", fill=INK, text_anchor="middle", font_weight="bold", letter_spacing=18)
    a.path("M170,310 h460 M170,316 h460", stroke=INK, stroke_width=1)
    for j in range(5):
        kit.script(a, 160, 360 + j * 28, 480, size=1.0)
    for k, (lab, y) in enumerate((("Principal debtor", 540), ("Surety", 660))):
        kit.smallcaps(a, 160, y, lab, size=17, col=RED, anchor="start")
        a.line(160, y + 56, 640, y + 56, stroke=INK, stroke_width=1)
        if k == 0:
            kit.spiral(a, 400, y + 32, 2, 28, 3.2, stroke_width=2.6)
            kit.italic(a, 446, y + 48, "his mark", size=15, col=TEA, anchor="start")
        else:
            kit.script(a, 250, y + 46, 300, size=1.5)
    for j in range(4):
        kit.script(a, 160, 770 + j * 26, 480 if j < 3 else 250, size=0.95)
    kit.wax(a, 560, 900, 54, emblem=em_company(a), ribbon=INK)
    kit.tick(a, 180, 920, s=1.6)
    # the folds of a sleeve
    for y in (386, 706):
        a.rect(80, y - 7, 640, 14, fill=a.gradient([(0, "#000"), (0.5, "#fff"), (1, "#000")]), opacity=0.09)
        a.line(80, y, 720, y, stroke=TEA, stroke_width=0.8, opacity=0.6)
    a.path("M80,70 l60,0 l-60,60z", fill=WOOD, opacity=0.25)


# ---- the eight chits ---------------------------------------------------------------------------------
CHITS = [("bottle-neck", "tied at a bottle's neck", "one pair land legs, hardly used"),
         ("dice-stake", "laid as a dice stake", "the luck of the dice"),
         ("strongbox", "in the strongbox of the sunken tender", None),
         ("lease-schedule", "pinned to the lease schedule", "a fog"),
         ("trench", "on the trench floor", "a slack water"),
         ("under-the-board", "under the Comptroller's board", None),
         ("mirror-gallery", "in the mirror gallery", None),
         ("lords-hand", "in the Lord of Tea's own hand", None)]


def chit_body(a, i, pledge, w=380, h=210, tone="#EADFC2", blur=False, mirror=False):
    a.rect(0, 0, w, h, fill=tone, filter=a.roughen(scale=3, freq=0.05))
    a.rect(10, 10, w - 20, h - 20, fill="none", stroke=TEA, stroke_width=0.9, opacity=0.7)
    kit.smallcaps(a, 22, 34, f"No. {i + 1}", size=13, col=RED, anchor="start")
    kit.smallcaps(a, w - 22, 34, "Chit", size=13, col=TEA, anchor="end")
    a.line(22, 44, w - 22, 44, stroke=TEA, stroke_width=0.7)
    flt = a.blur(1.6) if blur else None
    a.open("g", filter=flt, opacity=0.75 if blur else 1)
    kit.script(a, 24, 72, w * 0.62, size=0.95)
    if pledge:
        a.text(24, 108, pledge, size=24 if len(pledge) < 22 else 19, family="serif", fill=BB, font_style="italic")
    else:
        kit.script(a, 24, 104, w * 0.5, size=1.2)
        a.path(a.wobble_d([(20, 98), (24 + w * 0.5, 96)], 1.5, 12), fill="none", stroke=BB, stroke_width=2)
    a.text(24, 150, "pays next tide", size=17, family="cursive", fill=BB, opacity=0.9)
    a.close()
    a.line(24, 176, w * 0.5, 176, stroke=TEA, stroke_width=0.7)
    kit.spiral(a, w - 74, 138, 2, 34, 3.1, stroke_width=2.8)
    if not mirror:
        # the Company bought it
        a.open("g", transform=f"rotate(-14 {w - 150} 150)")
        a.circle(w - 150, 160, 26, fill="none", stroke=INK, stroke_width=2.2, opacity=0.5)
        kit.company_mark(a, w - 150, 160, 17, col=INK, opacity=0.5, sw=1.6)
        a.close()


def make_chit(i, key, where, pledge):
    @asset(G, f"chit-{i + 1}-{key}", group="documents", title=f"Chit {i + 1}, found {where}", w=460, h=300, row=ROW)
    def chit(a: Art):
        r = a.rng
        a.paper("#3b2a1b" if i != 5 else kit.GLAZE, grain=0.3, fibre=0.03)
        if i == 5:
            a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, kit.COB, gap=22, sw=1.2, ang=45, opacity=0.4))
        if i == 6:
            a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, "#7d8794"), (0.5, "#c9d2d8"), (1, "#69727f")], 0, 0, 1, 1))
        rot = [-4, 3, -2, 0, 5, -1, 0, 0][i]
        tone = ["#EADFC2", "#E6D9B6", "#D9D2B4", "#EDE2C6", "#CFC6A6", "#EEE9DA", "#EADFC2", kit.LAMP][i]
        if i == 6:   # the same chit, reversed in the glass
            a.open("g", transform="translate(40,292) scale(1,-0.34)", opacity=0.4)
            chit_body(a, i, None, tone=tone, mirror=True)
            a.close()
        a.open("g", transform=f"translate(40,{40 if i != 6 else 14}) rotate({rot} 190 105)")
        a.rect(6, 8, 380, 210, fill="#000", opacity=0.35, filter=a.blur(4))
        chit_body(a, i, pledge, tone=tone, blur=(i in (2, 5)))
        if i == 0:      # tied at the neck: a punched hole, the string, the curl the bottle left
            a.circle(190, 22, 6, fill="#3b2a1b")
            a.path("M190,22 q-30,-40 -80,-36 q-50,6 -60,-20", fill="none", stroke=TEA, stroke_width=2.2)
            a.path("M190,22 q20,-30 60,-34", fill="none", stroke=TEA, stroke_width=2.2)
            a.rect(0, 0, 380, 210, fill=a.gradient([(0, "#000"), (0.3, "#fff"), (0.6, "#000"), (1, "#fff")], 0, 0, 1, 0), opacity=0.09)
        if i == 1:      # a stake: a cup ring, chalk
            a.circle(250, 60, 60, fill="none", stroke=TEA, stroke_width=3, opacity=0.4)
            a.path("M40,190 v-22 M50,190 v-22 M60,190 v-22 M70,190 v-22 M34,186 l44,-16", stroke="#fff", stroke_width=3, opacity=0.8,
                   stroke_linecap="round")
        if i == 2:      # sea-swollen
            kit.salt(a, 120, 110, 80)
            kit.salt(a, 300, 60, 46)
            a.circle(60, 180, 22, fill="none", stroke="#8a4a22", stroke_width=5, opacity=0.4)
        if i == 3:      # pinned to a schedule
            a.path("M0,0 l46,0 l-46,40z", fill="#d8cba6", stroke=TEA, stroke_width=0.8)
            pin(a, 190, 14)
            a.text(356, 196, "Sched. II", size=13, family="serif", fill=RED, font_style="italic", text_anchor="end")
        if i == 4:      # the trench
            kit.salt(a, 250, 150, 110, strength=0.8)
            kit.salt(a, 330, 50, 40)
            a.path("M380,210 l-70,0 l20,-16 l10,8 l14,-24 l26,-10z", fill="#3b2a1b")
            for k in range(7):
                bx, by = r.uniform(20, 360), r.uniform(150, 200)
                a.circle(bx, by, 5, fill="#b9b39a", stroke=TEA, stroke_width=1)
                a.circle(bx, by, 1.6, fill=TEA)
            a.rect(0, 0, 380, 210, fill=SEAINK, opacity=0.12)
        if i == 5:      # under the board: the foot-ring of the porcelain
            a.circle(150, 104, 86, fill="none", stroke=kit.COB, stroke_width=5, opacity=0.35)
            a.circle(150, 104, 76, fill="none", stroke=kit.COB, stroke_width=1.5, opacity=0.35)
        if i == 7:      # the Lord's own: balanced
            a.path("".join(f"M10,{60 + k * 22}h360" for k in range(7)), stroke=kit.WASH, stroke_width=0.8, fill="none")
            a.line(300, 50, 300, 200, stroke=RED, stroke_width=0.9)
            kit.tick(a, 318, 196, s=1.5)
        a.close()
    extra = {0: "a hole punched for the string and the curl of the glass still in it",
             1: "ringed by a cup and marked with chalk",
             2: "sea-swollen, the pledge run to a blur that seawater might raise again",
             3: "pinned through, a clerk's schedule number at its foot",
             4: "salt-bloomed and barnacled, a corner gone",
             5: "lying on blue-and-white, the board's foot-ring pressed into it, the pledge struck out and smudged",
             6: "lying on the glass with its own reflection, the pledge struck out",
             7: "on Company stock, ruled, ticked in green, the pledge struck out"}[i]
    chit.__doc__ = (f"One of Alexi's chits, found {where}: a chandler's slip that pays next tide, signed with a clockwise "
                    f"sea-ink spiral and stamped with the Company's mark; {extra}.")
    return chit


for _i, _c in enumerate(CHITS):
    make_chit(_i, *_c)


# ---- the four pledges that had to be raised ------------------------------------------------------------
RAISED = {2: "an anchor's hold", 5: "a fair wind, to order", 6: "a shipmate's word", 7: "whatever is left"}


def make_raised(i, key, where, pledge):
    @asset(G, f"chit-{i + 1}-{key}-raised", group="documents", title=f"Chit {i + 1}, its pledge raised", w=460, h=300, row=ROW)
    def chit(a: Art):
        a.paper("#3b2a1b", grain=0.3, fibre=0.03)
        tone = ["#EADFC2", "#E6D9B6", "#D9D2B4", "#EDE2C6", "#CFC6A6", "#EEE9DA", "#EADFC2", kit.LAMP][i]
        a.open("g", transform=f"translate(40,40) rotate({[-4, 3, -2, 0, 5, -1, 0, 0][i]} 190 105)")
        a.rect(6, 8, 380, 210, fill="#000", opacity=0.35, filter=a.blur(4))
        chit_body(a, i, pledge, tone=tone)
        if i != 2:      # struck out by the Company's clerk, and legible again under the stroke
            a.path(a.wobble_d([(20, 100), (40 + len(pledge) * 11, 98)], 1.2, 12), fill="none", stroke=BB, stroke_width=1.6, opacity=0.45)
        kit.salt(a, 300, 176, 30, strength=0.8)
        kit.salt(a, 40, 190, 22, strength=0.8)
        a.circle(150, 104, 100, fill=SEAINK, opacity=0.1)
        a.circle(150, 104, 100, fill="none", stroke=SEAINK, stroke_width=1.2, opacity=0.45, stroke_dasharray="3 5")
        a.close()
    chit.__doc__ = (f"Chit {i + 1}, found {where}, after a drop of seawater was stirred onto it: the pledge stands "
                    f"legible again inside a ring of salt bloom, '{pledge}', over the same clockwise spiral.")
    return chit


for _i, _p in RAISED.items():
    make_raised(_i, CHITS[_i][0], CHITS[_i][1], _p)


# ---- six seals ---------------------------------------------------------------------------------------
SEALS = [("company", "The Company's seal", RED, INK, "em_company", "the Great British Tea Company's leaf mark crossed by a ruled bar"),
         ("company-false", "The seal that differs", "#96362f", INK, "variant", "the Company's mark reversed and unbarred: the defect a loupe finds"),
         ("kings-house", "The seal of the king's house", "#7a2433", GOLD, "em_king", "two crossed oars over a wave"),
         ("tidewater", "The Tidewater harbour seal", "#8f3a22", TEA, "em_lamp", "the quay lamp whose lighting dates the dues"),
         ("lights", "The seal of the lights", "#8C2B2B", VIOLET, "em_light", "a lighthouse with its rays"),
         ("pearl-compact", "The divers' compact seal", "#2d5e52", GREEN, "em_pearl", "a pearl in an open shell, pressed in sea-green wax")]


def make_seal(i, key, name, col, rib, emb, what):
    @asset(G, f"seal-{key}", group="documents", title=name, w=300, h=300, row=ROW)
    def seal(a: Art):
        kit.plate(a, tone=VELLUM, m=0, mark=False)
        for j in range(5):
            kit.script(a, 14, 40 + j * 54, 272, size=1.0, opacity=0.5)
        e = {"em_company": em_company(a), "variant": em_company(a, True), "em_king": em_king(a), "em_lamp": em_lamp(a),
             "em_light": em_light(a), "em_pearl": em_pearl(a)}[emb]
        kit.wax(a, 150, 138, 84, col=col, emblem=e, ribbon=rib)
        # the loupe
        a.circle(150, 150, 138, fill="none", stroke="#000", stroke_width=20, opacity=0.25, transform="translate(3,5)")
        a.circle(150, 150, 138, fill="none", stroke="#8a6a2f", stroke_width=14)
        a.circle(150, 150, 138, fill="none", stroke=GOLD, stroke_width=5)
        a.circle(150, 150, 131, fill="none", stroke="#fff", stroke_width=1.5, opacity=0.6)
        a.path(kit.arc_d(150, 150, 118, 200, 250), fill="none", stroke="#fff", stroke_width=5, opacity=0.35, stroke_linecap="round")
    seal.__doc__ = f"{name}, lifted to the loupe: {what}."
    return seal


for _i, _s in enumerate(SEALS):
    make_seal(_i, *_s)

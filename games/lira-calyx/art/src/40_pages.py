"""Paper: the Key's three pages, the four hands as stroke sets, and six pages of Pell's book."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, INK, PENCIL, SEAL, PAPER, ARCH, BAR = kit.G, kit.INK, kit.PENCIL, kit.SEAL, kit.PAPER, kit.ARCH, kit.BAR
PELLC = "#4c4a48"


def greek(a: Art, x, y, w, size=18, color=INK, op=0.75):
    """A line of print too small to matter: word-length strokes."""
    r, d = a.rng, []
    x1 = x + w
    while x < x1 - 10:
        wl = min(r.uniform(size * 0.8, size * 3.4), x1 - x)
        d.append(f"M{f(x)},{f(y - size * 0.28)}h{f(wl)}")
        x += wl + size * 0.45
    a.path("".join(d), stroke=color, stroke_width=size * 0.42, fill="none", opacity=op, stroke_dasharray=f"{f(size * 0.5)} {f(size * 0.09)}")


def leaders(a: Art, x0, x1, y):
    a.line(x0, y - 4, x1, y - 4, stroke=INK, stroke_width=1.6, stroke_dasharray="1 7", stroke_linecap="round")


def mark(a: Art, x, y, who):
    """Whose couplet: print (a block), her pencil (a triangle), his pencil (a ring)."""
    if who == "print":
        a.rect(x - 5, y - 11, 10, 10, fill=INK)
    elif who == "hers":
        a.poly([(x - 6, y - 1), (x, y - 13), (x + 6, y - 1)], fill="none", stroke=PENCIL, stroke_width=2)
    else:
        a.circle(x, y - 6, 6, fill="none", stroke=PENCIL, stroke_width=2)


def sprig(a: Art, x, y, s=1.0, color=INK):
    """An Aether-Vine sprig in iron-gall line, every leaf leaning the same way."""
    stem = [(x, y), (x + 20 * s, y - 60 * s), (x + 60 * s, y - 120 * s), (x + 120 * s, y - 160 * s)]
    kit.curve(a, stem, w=2.6, stroke=color)
    for k, (bx, by) in enumerate([(x + 8 * s, y - 28 * s), (x + 26 * s, y - 70 * s), (x + 46 * s, y - 104 * s), (x + 78 * s, y - 136 * s)]):
        L = (44 - k * 5) * s
        for sg in (1, -0.55):
            tip = (bx + L, by - L * 0.35 * sg - (0 if sg > 0 else -L * 0.5))
            mid1 = (bx + L * 0.4, by - L * 0.5 * sg)
            mid2 = (bx + L * 0.55, by + L * 0.12 * sg)
            d = a.smooth_d([(bx, by), mid1, tip, mid2], closed=True)
            kit.wash(a, d, kit.MOSS, 0.25, 1)
            a.path(d, fill="none", stroke=color, stroke_width=1.8, stroke_linejoin="round")
            a.line(bx, by, *tip, stroke=color, stroke_width=1)
    a.circle(x + 120 * s, y - 160 * s, 5 * s, fill=kit.CYAN, stroke=color, stroke_width=1.4)


def pup(a: Art, x, y, s=1.0, color=PENCIL, w=2.2):
    """A wolf pup's head and shoulders, quick pencil."""
    head = [(x, y), (x + 8 * s, y - 30 * s), (x + 20 * s, y - 16 * s), (x + 44 * s, y - 18 * s), (x + 54 * s, y - 34 * s),
            (x + 62 * s, y - 4 * s), (x + 84 * s, y + 16 * s), (x + 80 * s, y + 26 * s), (x + 56 * s, y + 30 * s), (x + 30 * s, y + 40 * s),
            (x + 6 * s, y + 28 * s)]
    kit.curve(a, head, w=w, stroke=color, closed=True)
    a.circle(x + 44 * s, y + 4 * s, 3.4 * s, fill=color)
    a.circle(x + 82 * s, y + 18 * s, 4 * s, fill=color)
    kit.curve(a, [(x + 6 * s, y + 28 * s), (x - 20 * s, y + 60 * s), (x - 24 * s, y + 96 * s)], w=w, stroke=color)
    kit.curve(a, [(x + 30 * s, y + 40 * s), (x + 34 * s, y + 70 * s), (x + 28 * s, y + 96 * s)], w=w, stroke=color)
    for k in range(4):
        a.circle(x - 8 * s + k * 9 * s, y + 46 * s + k * 5 * s, 3 * s, fill="#f08a2c", opacity=0.75)


def _key_head(a: Art, sub):
    a.rect(60, 56, 680, 988, fill="none", stroke=INK, stroke_width=1.2)
    a.rect(66, 62, 668, 976, fill="none", stroke=INK, stroke_width=0.6)
    a.text(400, 122, "DICHOTOMOUS KEY", size=34, family="serif", fill=INK, text_anchor="middle", letter_spacing="6")
    a.text(400, 152, sub, size=18, family="serif", font_style="italic", fill=INK, text_anchor="middle")
    a.path("M250,170 H550 M390,176 l10,8 l10,-8", stroke=INK, stroke_width=1.2, fill="none")


def _couplet(a: Art, y, num, legible=None, name=None, goto=None, who="print", x=110, w=560):
    mark(a, x - 22, y, who)
    a.text(x, y, num, size=20, family="serif", font_weight="bold", fill=INK)
    if legible:
        a.text(x + 44, y, legible, size=20, family="serif", fill=INK)
    else:
        gw = w - 44 - (150 if name else 70)
        greek(a, x + 44, y, gw * a.rng.uniform(0.6, 0.95), 17)
        leaders(a, x + 44 + gw + 6, x + w - (150 if name else 34), y)
        if name:
            a.text(x + w, y, name, size=20, family="serif", font_style="italic", fill=INK, text_anchor="end")
        elif goto:
            a.text(x + w, y, str(goto), size=20, family="serif", fill=INK, text_anchor="end")


@asset(G, "key-page-print", group="documents", title="The Key: the printed page", w=800, h=1100, row="Key pages")
def key_print(a: Art):
    """A page of the printed dichotomous key: numbered couplets in serif type, each with the small
    block that marks a printed hand, the first couplet on glow period legible, species names at the
    ends of dotted leaders, a branching diagram of the key and an engraved Aether-Vine sprig."""
    kit.page(a, pool=0.24)
    _key_head(a, "Mid-Slopes")
    _couplet(a, 230, "1a.", "Glow period under 4 s, go to 2.")
    _couplet(a, 262, "1b.", "Glow period 4 s or more, go to 5.")
    rows = [("2a.", "Ember Wolf", None), ("2b.", None, 3), ("3a.", "Ridgeback Strider", None), ("3b.", None, 4),
            ("4a.", "Spore-Weaver", None), ("4b.", None, 6), ("5a.", "Aether-Vine", None), ("5b.", None, 6),
            ("6a.", None, 7), ("6b.", None, 8)]
    y = 318
    for k, (num, name, goto) in enumerate(rows):
        _couplet(a, y, num, name=name, goto=goto)
        y += 32 if k % 2 == 0 else 54
    # the key as a tree
    tx, ty = 130, 800
    a.text(tx, ty - 26, "Fig. 1", size=16, family="serif", font_style="italic", fill=INK)
    d = [f"M{tx},{ty + 90} h60", f"M{tx + 60},{ty + 30} v120", f"M{tx + 60},{ty + 30} h70 M{tx + 60},{ty + 150} h70",
         f"M{tx + 130},{ty} v60 M{tx + 130},{ty + 120} v60", f"M{tx + 130},{ty} h70 M{tx + 130},{ty + 60} h70 M{tx + 130},{ty + 120} h70 M{tx + 130},{ty + 180} h70",
         f"M{tx + 200},{ty + 45} v30 M{tx + 200},{ty + 45} h60 M{tx + 200},{ty + 75} h60"]
    a.path(" ".join(d), stroke=INK, stroke_width=2, fill="none", stroke_linejoin="round")
    for (px, py, lab) in ((tx + 44, ty + 84, "1"), (tx + 112, ty + 24, "2"), (tx + 112, ty + 144, "5"), (tx + 182, ty + 54, "3")):
        a.circle(px, py + 6, 11, fill=PAPER, stroke=INK, stroke_width=1.4)
        a.text(px, py + 12, lab, size=15, family="serif", fill=INK, text_anchor="middle")
    for (px, py) in ((tx + 204, ty + 6), (tx + 264, ty + 51), (tx + 264, ty + 81), (tx + 204, ty + 126), (tx + 204, ty + 186)):
        greek(a, px + 6, py, 70, 14)
    sprig(a, 500, 1000, 1.25)
    a.text(690, 1010, "Pl. IV", size=16, family="serif", font_style="italic", fill=INK, text_anchor="end")
    a.text(400, 1070, "12", size=16, family="serif", fill=INK, text_anchor="middle")


@asset(G, "key-page-her-pencil", group="documents", title="The Key: her pencil", w=800, h=1100, row="Key pages")
def key_hers(a: Art):
    """The same printed page after Book I: Lira's pencil has bracketed the Ember Wolf couplet and
    written a new branch beside it, found above 2 000 m, with a pup sketched in the margin, its
    altitude tag, and the open triangle that marks her hand."""
    kit.page(a, pool=0.24)
    _key_head(a, "Mid-Slopes")
    _couplet(a, 230, "1a.", "Glow period under 4 s, go to 2.")
    _couplet(a, 262, "1b.", "Glow period 4 s or more, go to 5.")
    mark(a, 88, 330, "print")
    a.text(110, 330, "2a.", size=20, family="serif", font_weight="bold", fill=INK)
    a.text(154, 330, "Found below 2 000 m", size=20, family="serif", fill=INK)
    leaders(a, 360, 540, 330)
    a.text(670, 330, "Ember Wolf", size=20, family="serif", font_style="italic", fill=INK, text_anchor="end")
    # her inserted couplet
    a.path("M96,350 q-14,40 0,82", stroke=PENCIL, stroke_width=2.2, fill="none")
    mark(a, 110, 398, "hers")
    kit.lira(a, 132, 398, "2b.  Found above 2 000 m", 30, PENCIL)
    kit.curve(a, [(470, 388), (540, 380), (590, 420), (600, 470)], w=1.8, stroke=PENCIL)
    a.path("M592,458 l8,14 l10,-12", stroke=PENCIL, stroke_width=1.8, fill="none")
    kit.lira(a, 132, 438, "Ember Wolf, juvenile", 24, PENCIL)
    _couplet(a, 520, "3a.", name="Ridgeback Strider")
    _couplet(a, 552, "3b.", goto=4)
    _couplet(a, 606, "4a.", name="Spore-Weaver")
    _couplet(a, 638, "4b.", goto=6)
    _couplet(a, 692, "5a.", name="Aether-Vine")
    _couplet(a, 724, "5b.", goto=6)
    pup(a, 520, 820, 1.5)
    a.poly([(300, 852), (420, 836), (426, 880), (306, 896)], fill="#efe2c0", stroke=INK, stroke_width=1.6)
    a.circle(312, 874, 4, fill=PAPER, stroke=INK, stroke_width=1.4)
    a.path("M312,874 q-40,10 -70,-14", stroke="#b9a078", stroke_width=1.4, fill="none")
    kit.lira_fig(a, "2 600", 326, 878, 20)
    kit.lira(a, 396, 874, "m", 22, transform="rotate(-8 396 874)")
    a.text(400, 1070, "12", size=16, family="serif", fill=INK, text_anchor="middle")


@asset(G, "key-flyleaf", group="documents", title="The Key: the flyleaf", w=800, h=1100, row="Key pages")
def key_flyleaf(a: Art):
    """The flyleaf of the key's first printing from the Cinder Reach archive, foxed and nearly
    empty: the initials S.V., and in a precise upright pencil the same couplet with not yet, leave
    room, above ruled places for species that do not exist, each beside a dotted outline."""
    r = a.rng
    kit.page(a, color="#e9dcbc", pool=0.4)
    for _ in range(40):
        a.circle(r.uniform(20, 780), r.uniform(20, 1080), r.uniform(2, 9), fill="#a8763a", opacity=r.uniform(0.08, 0.22))
    a.rect(0, 0, 34, 1100, fill=a.gradient([(0, "#5a3c1a"), (1, "#e9dcbc")], 0, 0, 1, 0), opacity=0.6)
    a.open("g", transform="rotate(-4 600 120)", filter=a.roughen(2, 0.5))
    a.rect(486, 84, 236, 70, fill="none", stroke=ARCH, stroke_width=3)
    a.text(604, 114, "CINDER REACH", size=22, family="serif", fill=ARCH, text_anchor="middle", letter_spacing="3")
    a.text(604, 140, "FIRST PRINTING", size=16, family="serif", fill=ARCH, text_anchor="middle", letter_spacing="3")
    a.close()
    kit.his_pencil(a, 120, 250, "S.V.", 44)
    a.path("M118,264 h96", stroke=PENCIL, stroke_width=1.4, fill="none")
    mark(a, 120, 400, "his")
    kit.his_pencil(a, 142, 400, "2b.  Found above 2 000 m:", 28)
    kit.his_pencil(a, 196, 440, "not yet.  Leave room.", 28)
    y = 540
    shapes = ["wolf", "vine", "web"]
    for k in range(3):
        mark(a, 120, y, "his")
        kit.his_pencil(a, 142, y, f"{k + 3}a.", 24)
        a.line(200, y + 2, 520, y + 2, stroke=PENCIL, stroke_width=1, stroke_dasharray="2 5")
        kit.his_pencil(a, 142, y + 44, f"{k + 3}b.", 24)
        a.line(200, y + 46, 520, y + 46, stroke=PENCIL, stroke_width=1, stroke_dasharray="2 5")
        cx, cy = 630, y + 16
        dash = dict(stroke=PENCIL, stroke_width=1.6, stroke_dasharray="3 6", fill="none", stroke_linecap="round")
        if shapes[k] == "wolf":
            a.path(a.smooth_d([(cx - 60, cy + 30), (cx - 40, cy - 10), (cx + 10, cy - 14), (cx + 30, cy - 40), (cx + 44, cy - 16),
                               (cx + 70, cy), (cx + 44, cy + 10), (cx + 30, cy + 40), (cx + 16, cy + 12), (cx - 30, cy + 14), (cx - 44, cy + 44)]), **dash)
        elif shapes[k] == "vine":
            a.path(a.smooth_d([(cx - 50, cy + 44), (cx - 30, cy), (cx + 10, cy - 24), (cx + 60, cy - 30)]), **dash)
            for q in range(3):
                a.ellipse(cx - 20 + q * 28, cy - 22 + q * -4, 18, 8, transform=f"rotate(-30 {cx - 20 + q * 28} {cy - 22})", **dash)
        else:
            for q in range(3):
                a.poly(a.ngon(cx, cy + 6, 18 + q * 16, 7, q * 9), **dash)
        y += 150
    kit.label(a, 120, 1040, "drawer 14", 14, PENCIL)


# ---- the four hands ---------------------------------------------------------------------------
def taper(a: Art, pts, w0, w1, color, op=1.0):
    """A stroke whose width follows the pressure: thin where the pen lifted."""
    n = len(pts) - 1
    left, right = [], []
    for i, (x, y) in enumerate(pts):
        x0, y0 = pts[max(0, i - 1)]
        x1, y1 = pts[min(n, i + 1)]
        L = math.hypot(x1 - x0, y1 - y0) or 1
        nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        w = (w0 + (w1 - w0) * i / n) / 2
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    a.path(a.smooth_d(left + right[::-1], closed=True), fill=color, opacity=op)


def _hand_sheet(a: Art, n, name, color):
    kit.page(a, pool=0.2)
    a.rect(24, 24, 752, 512, fill="none", stroke=INK, stroke_width=1.2)
    kit.label(a, 44, 58, f"HAND {n}  {name}", 16)
    a.line(44, 70, 756, 70, stroke=INK, stroke_width=1)
    kit.label(a, 44, 98, "STROKES", 12, PENCIL)
    kit.label(a, 44, 258, "FIGURES", 12, PENCIL)
    kit.label(a, 44, 372, "A LINE", 12, PENCIL)
    # the loupe
    a.circle(634, 190, 96, fill="#fff", opacity=0.35)
    a.circle(634, 190, 96, fill="none", stroke=INK, stroke_width=5)
    a.circle(634, 190, 88, fill="none", stroke=PENCIL, stroke_width=1)
    a.line(700, 262, 748, 318, stroke=INK, stroke_width=11, stroke_linecap="round")
    kit.label(a, 566, 318, "×12  pressure, slant", 11, PENCIL)
    for k in range(5):
        a.line(84 + k * 92, 228, 84 + k * 92, 234, stroke=PENCIL, stroke_width=1)


def _slant_gauge(a: Art, deg, color):
    t = math.radians(90 - deg)
    a.line(634, 268, 634 + 150 * math.cos(t), 268 - 150 * math.sin(t), stroke=SEAL, stroke_width=1, stroke_dasharray="5 4")
    a.line(634, 268, 634, 118, stroke=PENCIL, stroke_width=1, stroke_dasharray="2 4")
    a.text(634 + (34 if deg <= 0 else -70), 236, f"{deg:+d}°", size=17, family="monospace", fill=SEAL)


@asset(G, "hand-lira", group="documents", title="Hand 1: hers", w=800, h=560, row="Audit set")
def hand_lira(a: Art):
    """Lira's hand as a stroke set: heavy downstrokes and hairline upstrokes in iron-gall, leaning
    right; her figures with the seven crossed; a line from the journal; and under the loupe a seven
    whose crossbar is the tell."""
    _hand_sheet(a, 1, "HERS", INK)
    taper(a, [(100, 120), (92, 160), (80, 214)], 2, 9, INK)
    taper(a, [(152, 214), (176, 160), (196, 122)], 4, 1.2, INK)
    taper(a, [(240, 200), (262, 130), (290, 124), (286, 160), (258, 206), (300, 190)], 2, 6, INK)
    taper(a, [(338, 168), (372, 160), (400, 164)], 5, 2, INK)
    kit.blot(a, 452, 186, 6)
    taper(a, [(444, 130), (452, 150), (450, 166)], 2, 5, INK)
    kit.lira_fig(a, "0 1 2 3 4 5 6 7 8 9", 60, 330, 40, w=3.6)
    kit.lira(a, 60, 420, "Strider count, bridge, 06:10:", 32, textLength=372, lengthAdjust="spacingAndGlyphs", transform="rotate(0)")
    kit.lira_fig(a, "17.", 446, 420, 23, w=2.6)
    kit.lira(a, 60, 470, "Δ 0.03 ", 30)
    kit.lira(a, 170, 470, "0.44 s", 30, letter_spacing="1")
    kit.label(a, 60, 512, "crossed sevens   Δ for change   a thin space before units", 13, PENCIL)
    taper(a, [(584, 136), (640, 128), (690, 132)], 5, 9, INK)
    taper(a, [(690, 132), (650, 190), (626, 256)], 9, 16, INK)
    taper(a, [(610, 196), (650, 188), (692, 190)], 7, 4, INK)
    _slant_gauge(a, 14, INK)


@asset(G, "hand-continuum", group="documents", title="Hand 2: the Continuum", w=800, h=560, row="Audit set")
def hand_continuum(a: Art):
    """The Continuum's hand as a stroke set: every stroke the same flat black weight and dead
    upright; figures with no crossbar on the seven; a typed line that writes deg for the degree sign
    and spells her name wrong."""
    _hand_sheet(a, 2, "THE CONTINUUM", BAR)
    for x0, y0, x1, y1 in ((90, 120, 90, 214), (150, 214, 196, 122), (338, 168, 400, 168)):
        a.line(x0, y0, x1, y1, stroke=BAR, stroke_width=7)
    a.circle(270, 166, 34, fill="none", stroke=BAR, stroke_width=7)
    a.rect(446, 180, 12, 12, fill=BAR)
    kit.stroke_text(a, "0 1 2 3 4 5 6 7 8 9", 60, 330, 40, color=BAR, w=4.6, aspect=0.74)
    kit.continuum(a, 60, 418, "06:10  STRIDER COUNT 17", 26)
    kit.continuum(a, 60, 458, "PHASE OFFSET 47 deg   DR. LIRA CALIX", 26)
    a.path("M370,466 h60 M582,466 h72", stroke=SEAL, stroke_width=2, fill="none")
    kit.label(a, 60, 512, "deg for °   flat register   misspelled names   clocks out of order", 13, PENCIL)
    a.line(590, 132, 690, 132, stroke=BAR, stroke_width=13)
    a.line(684, 132, 640, 256, stroke=BAR, stroke_width=13)
    _slant_gauge(a, 0, BAR)


@asset(G, "hand-archivist", group="documents", title="Hand 3: the small hand", w=800, h=560, row="Audit set")
def hand_archivist(a: Art):
    """The other hand as a stroke set: fine blue-black strokes all leaning left, a caret, a tick and
    an underline; small figures; and the first margin note, written as a correction."""
    _hand_sheet(a, 3, "OTHER HAND", ARCH)
    taper(a, [(84, 124), (96, 170), (110, 212)], 1.2, 3.4, ARCH)
    taper(a, [(190, 212), (176, 170), (160, 128)], 2.4, 1, ARCH)
    a.path("M240,200 l22,-44 l20,44", stroke=ARCH, stroke_width=2, fill="none", stroke_linejoin="round")
    a.path("M340,176 l12,18 l34,-56", stroke=ARCH, stroke_width=2, fill="none", stroke_linejoin="round")
    taper(a, [(430, 196), (470, 200), (510, 194)], 2.6, 1, ARCH)
    kit.stroke_text(a, "0 1 2 3 4 5 6 7 8 9", 80, 322, 26, color=ARCH, w=2, slant=-0.34, smooth=True, aspect=0.66)
    kit.small_hand(a, 44, 418, "Phase offset miscalculated.", 25)
    kit.small_hand(a, 44, 456, "Re‑sample at 0.5 s resolution.", 25)
    kit.label(a, 60, 512, "small   slanted left   corrections only", 13, PENCIL)
    taper(a, [(596, 140), (646, 144), (682, 138)], 2, 4, ARCH)
    taper(a, [(682, 138), (668, 200), (672, 258)], 4, 7, ARCH)
    _slant_gauge(a, -19, ARCH)


@asset(G, "hand-pell", group="documents", title="Hand 4: Pell", w=800, h=560, row="Audit set")
def hand_pell(a: Art):
    """Pell's hand as a stroke set: soft pencil capitals, every stroke gone over twice and no two
    letters the same height; her figures; and the line she wrote under the doctor's number."""
    r = a.rng
    _hand_sheet(a, 4, "PELL", PELLC)
    for (x0, y0, x1, y1) in ((92, 122, 86, 214), (150, 208, 198, 126), (338, 170, 404, 164)):
        for k in range(2):
            kit.ink(a, [(x0 + r.uniform(-3, 3), y0), (x1 + r.uniform(-3, 3), y1)], w=4.5, amp=2.2, step=22, stroke=PELLC, opacity=0.8)
    pts = [(270 + 34 * math.cos(t) + r.uniform(-3, 3), 168 + 38 * math.sin(t) + r.uniform(-3, 3)) for t in [i * 0.5 for i in range(15)]]
    kit.curve(a, pts, w=4.5, stroke=PELLC, opacity=0.8)
    a.circle(452, 186, 6, fill=PELLC, opacity=0.8)
    kit.pell(a, "0 1 2 3 4 5 6 7 8 9", 60, 330, 40)
    kit.pell(a, "DOCTOR SAYS 0.44.", 60, 420, 30)
    kit.pell(a, "I WROTE IT SAME.", 60, 472, 30)
    kit.label(a, 60, 512, "capitals   copied each evening", 13, PENCIL)
    for k in range(2):
        kit.ink(a, [(588 + k * 3, 136), (688, 130 + k * 4)], w=9, amp=3, step=30, stroke=PELLC, opacity=0.75)
        kit.ink(a, [(688, 132), (640 + k * 6, 258)], w=9, amp=3, step=30, stroke=PELLC, opacity=0.75)
    _slant_gauge(a, 3, PELLC)


# ---- Pell's book ------------------------------------------------------------------------------
def _pell_page(a: Art, n):
    kit.page(a, color="#f3ebd6", pool=0.2)
    for y in range(120, 780, 52):
        a.line(0, y, 600, y, stroke="#8fb0c4", stroke_width=1, opacity=0.6)
    a.line(70, 0, 70, 800, stroke=SEAL, stroke_width=1.2, opacity=0.5)
    for y in (160, 400, 640):
        a.circle(30, y, 9, fill="#3a2c22", opacity=0.75)
    kit.pell(a, str(n), 540, 60, 22)
    a.stipple(80, 80, 500, 700, n=60, r=(4, 14), fill=PELLC, opacity=0.035)


def crayon(a: Art, pts, color=PELLC, w=3.2, closed=False, **kw):
    kit.ink(a, pts, w=w, amp=1.8, step=12, closed=closed, stroke=color, opacity=0.85, **kw)


def strider(a: Art, x, y, s=1.0, color=PELLC):
    """A Ridgeback Strider the way a child draws one: a long ridged back on four stilts."""
    crayon(a, [(x, y), (x + 20 * s, y - 16 * s), (x + 70 * s, y - 18 * s), (x + 96 * s, y - 34 * s), (x + 112 * s, y - 30 * s),
               (x + 100 * s, y - 8 * s), (x + 72 * s, y + 4 * s), (x + 16 * s, y + 6 * s)], color, closed=True)
    for k in range(5):
        crayon(a, [(x + (22 + k * 11) * s, y - 17 * s), (x + (27 + k * 11) * s, y - 28 * s), (x + (33 + k * 11) * s, y - 17 * s)], color, w=2.4)
    for lx in (20, 34, 64, 78):
        crayon(a, [(x + lx * s, y + 5 * s), (x + (lx - 3) * s, y + 44 * s)], color, w=2.6)
    a.circle(x + 104 * s, y - 27 * s, 2.2 * s, fill=color)


def pell_1(a):
    kit.pell(a, "PELLS BOOK", 110, 196, 46)
    kit.pell(a, "BOOK I", 110, 290, 34)
    strider(a, 150, 500, 2.4)
    crayon(a, [(96, 612), (540, 606)], w=2.4)
    kit.pell(a, "HOLLIN TERRACE", 110, 700, 26)


def pell_2(a):
    kit.pell(a, "STRIDERS  BRIDGE", 96, 168, 30)
    kit.pell(a, "06:10", 96, 222, 28)
    kit.pell(a, "DOCTOR 17", 96, 322, 34)
    kit.pell(a, "ME 18", 96, 376, 34)
    for k in range(18):
        x = 100 + (k // 5) * 78 + (k % 5) * 12
        if k % 5 == 4:
            crayon(a, [(x - 54, 470), (x + 2, 420)], w=2.6)
        else:
            crayon(a, [(x, 418), (x + a.rng.uniform(-2, 2), 472)], w=2.6)
    strider(a, 110, 610, 1.3)
    strider(a, 300, 606, 1.3)
    strider(a, 474, 632, 0.55)
    kit.pell(a, "ONE WAS A BABY", 150, 730, 24)
    crayon(a, [(480, 700), (500, 664)], w=2.2)


def pell_3(a):
    kit.pell(a, "N1  VALLEY", 96, 168, 30)
    for k in range(4):
        pts = [(100 + i * 22, 300 + k * 30 + 18 * math.sin(i * 0.9 + k * 0.8)) for i in range(21)]
        kit.curve(a, pts, w=2.6, stroke=kit.CYAN if k == 1 else PELLC, opacity=0.85)
    for px in (140, 300, 460):
        crayon(a, [(px, 440), (px, 300)], w=3)
        a.circle(px, 294, 9, fill="none", stroke=PELLC, stroke_width=3)
    kit.pell(a, "DOCTOR SAYS 0.44.", 96, 560, 34)
    kit.pell(a, "I WROTE IT SAME.", 96, 630, 34)
    crayon(a, [(96, 650), (500, 644)], w=2.2)


def pell_4(a):
    kit.pell(a, "SIREN", 96, 168, 40)
    crayon(a, [(150, 640), (150, 300)], w=4)
    crayon(a, [(150, 300), (230, 268), (236, 340), (150, 332)], w=3.4, closed=True)
    for k in range(3):
        kit.curve(a, [(256 + k * 22, 270 - k * 10), (270 + k * 24, 304), (256 + k * 22, 340 + k * 10)], w=2.6, stroke=SEAL, opacity=0.8)
    a.rect(360, 300, 60, 340, fill="none", stroke=PELLC, stroke_width=3)
    a.rect(363, 470, 54, 168, fill=kit.CYAN, opacity=0.55)
    for k in range(9):
        a.line(420, 310 + k * 40, 436, 310 + k * 40, stroke=PELLC, stroke_width=2)
    crayon(a, [(330, 470), (470, 468)], SEAL, w=3)
    kit.pell(a, "DOCTORS LINE", 320, 446, 18, color=SEAL)
    kit.pell(a, "RIVER GLOW", 300, 700, 24)


def pell_5(a):
    kit.pell(a, "WOLF  BABY ONE", 96, 168, 30)
    pup(a, 220, 330, 2.2, PELLC, 3)
    kit.pell(a, "GLOW UNDER 4 S", 96, 620, 30)
    kit.pell(a, "2 600 M", 96, 690, 34)
    kit.pell(a, "TOO HIGH", 330, 690, 26, color=SEAL)


def pell_6(a):
    kit.pell(a, "HAND", 250, 168, 28)
    kit.pell(a, "RELAY", 420, 168, 28)
    crayon(a, [(90, 190), (560, 186)], w=2.6)
    crayon(a, [(228, 130), (232, 600)], w=2.6)
    crayon(a, [(400, 130), (398, 600)], w=2.6)
    rows = [("N1", "0.44", "0.47"), ("N2", None, None), ("N3", None, None)]
    for k, (n, h, rl) in enumerate(rows):
        y = 270 + k * 120
        kit.pell(a, n, 110, y, 34)
        if h:
            kit.pell(a, h, 250, y, 30)
            kit.pell(a, rl, 420, y, 30)
        elif n == "N2":
            for cx in (300, 480):
                a.circle(cx, y - 18, 30, fill="none", stroke=PELLC, stroke_width=3)
                t = math.radians(-60 if cx == 300 else -38)
                crayon(a, [(cx, y - 18), (cx + 26 * math.cos(t), y - 18 + 26 * math.sin(t))], w=3)
        else:
            for cx, off in ((300, 0), (480, 14)):
                a.rect(cx - 44, y - 30, 88, 22, rx=11, fill="none", stroke=PELLC, stroke_width=3)
                a.circle(cx + off, y - 19, 7, fill=kit.CYAN, opacity=0.7, stroke=PELLC, stroke_width=2)
        crayon(a, [(90, y + 34), (560, y + 30)], w=1.8)
    kit.pell(a, "SAME DAY", 110, 690, 26)


PELL = [
    (pell_1, "The first page of Pell's book: her name and BOOK I in tall pencil capitals over a Ridgeback Strider drawn on four stilts."),
    (pell_2, "Pell's strider count from the bridge at 06:10: the doctor's seventeen beside her own eighteen, tally marks in fives, and three striders, one very small."),
    (pell_3, "Pell's copy of the valley reading: three posts and the pulse crossing them as wavy lines, one in cyan, and under it the doctor's 0.44, written the same."),
    (pell_4, "Pell's page for the siren: the horn on its mast, the river glow meter as a tall box part filled, and the doctor's baseline ruled across it in red."),
    (pell_5, "Pell's page for the wolf pup: a big-eared head with ember dots down its neck, its glow period, and 2 600 m marked too high."),
    (pell_6, "The last page of Pell's Book I: a ruled table with HAND and RELAY columns for N1 to N3, a number, a compass and a bubble level in each, marked same day."),
]
for _i, (_fn, _doc) in enumerate(PELL):
    def _pp(a: Art, fn=_fn, i=_i):
        _pell_page(a, i + 1)
        fn(a)
    _pp.__doc__ = _doc
    asset(G, f"pell-page-{_i + 1}", group="documents", title=f"Pell's book, page {_i + 1}", w=600, h=800, row="Audit set")(_pp)

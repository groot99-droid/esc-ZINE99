"""The long puzzle's paper: four logbook spreads (ledger in graphite), seven states of Agnes's postcard,
three states of Bea's recipe card (two-colour risograph)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
BW, BH = 1600, 1000
MINK = "#1F2A44"       # Marisol's blue-black
LX, RX0, PW, TOP, ROW = 60, 820, 720, 60, 42


def book(a, left="#EFE8D4", right="#EFE8D4", rules=(True, True), tone="#3A3530"):
    """The open logbook on the booth counter; returns nothing, pages are at LX and RX0."""
    r = a.rng
    a.rect(0, 0, BW, BH, fill=tone)
    a.stipple(0, 0, BW, BH, n=420, r=(0.8, 2.2), fill="#2A2622")
    for k in range(5):                                  # the page block's edge
        a.rect(LX - 14 + k * 3, TOP + 6 - k, PW * 2 + 68 - k * 6, BH - 2 * TOP + 8, fill="#d9cfb6", stroke="#b5a988",
               stroke_width=0.6)
    a.rect(LX, TOP, PW, BH - 2 * TOP, fill=left)
    a.rect(RX0, TOP, PW, BH - 2 * TOP, fill=right)
    a.rect(LX + PW - 110, TOP, 110, BH - 2 * TOP, fill=a.gradient([(0, left), (0.8, "#d6ccb2"), (1, "#9d9279")], 0, 0, 1, 0))
    a.rect(RX0, TOP, 110, BH - 2 * TOP, fill=a.gradient([(0, "#9d9279"), (0.2, "#d6ccb2"), (1, right)], 0, 0, 1, 0))
    a.rect(LX + PW, TOP, RX0 - LX - PW, BH - 2 * TOP, fill="#8c8068")
    for side, on in zip((LX, RX0), rules):
        if on:
            d = "".join(f"M{side + 12},{TOP + 70 + k * ROW}h{PW - 24}" for k in range(20))
            a.path(d, stroke="#9FB9C4", stroke_width=1, fill="none")


def finish(a):
    gid = a.uid("lg")
    a.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="0.85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  '
           f'0 0 0 0 0.2  0 0 0 0.13 0"/></filter>')
    a.rect(LX, TOP, RX0 + PW - LX, BH - 2 * TOP, filter=f"url(#{gid})")


COLS = [("SITE", 0), ("PARTY", 86), ("PERS.", 300), ("NTS", 400), ("FEE", 470), ("PERMIT", 570)]


def columns(a, x0, heads=COLS, y=TOP + 58):
    for nm, dx in heads:
        kit.printed(a, x0 + 22 + dx, y, nm, size=15, letter_spacing="1.5")
    for nm, dx in heads[1:]:
        a.line(x0 + 12 + dx, TOP + 24, x0 + 12 + dx, BH - TOP - 20, stroke="#C58F86", stroke_width=1)


def mhand(a, x, y, s, size=24, color=MINK, **kw):
    """Marisol's careful hand."""
    a.text(x, y, s, size=size, family="serif", fill=color, **kw)


def row(a, x0, k, site, party, pers, nts, fee, permit, skip=False, color=MINK):
    y = TOP + 70 + k * ROW - 10
    mhand(a, x0 + 26, y, site, color=color)
    if party:
        mhand(a, x0 + 110, y, party, color=color, font_style="italic")
    if pers:
        kit.tally(a, x0 + 322, y - 22, pers, h=24, gap=8, stroke=color, stroke_width=1.8)
    mhand(a, x0 + 430, y, nts, color=color)
    mhand(a, x0 + 492, y, fee, color=color)
    a.text(x0 + 592, y, permit, size=22, family="monospace", fill=kit.RED if skip else color)
    if skip:
        kit.pencil(a, [(x0 + 588, y + 8), (x0 + 668, y + 7)], w=1.8)


DAY1 = [("1", "Marsh", 2, "0401"), ("3", "Lund", 4, "0403"), ("4", "Diaz", 3, "0404"), ("6", "Moss", 2, "0406"),
        ("7", "Pryce", 5, "0407"), ("8", "Hale", 1, "0408"), ("10", "Kerr", 2, "0410"), ("11", "Abe", 4, "0411"),
        ("12", "Wren", 3, "0412"), ("17", "Ashby", 3, "0413"), ("20–24", "Halloran", 5, "0414")]


def totals(a, x0, y0, rows, heading="DAY TOTALS"):
    kit.printed(a, x0 + 30, TOP + 58, heading, size=15)
    kit.printed(a, x0 + 430, TOP + 58, "TAM'S SUM", size=15)
    a.line(x0 + 410, TOP + 24, x0 + 410, y0 + len(rows) * 126 - 20, stroke="#C58F86", stroke_width=1)
    for i, (nm, tot, mine, diff) in enumerate(rows):
        y = y0 + i * 126
        mhand(a, x0 + 30, y, nm, size=27)
        mhand(a, x0 + 250, y + 44, tot, size=44, font_weight="bold")
        kit.hand(a, x0 + 440, y + 44, mine, size=42, rot=-2)
        a.text(x0 + 548, y + 42, "≠", size=40, family="serif", fill=kit.RED)
        kit.hand(a, x0 + 606, y + 44, diff, size=36, rot=-2)
        kit.pencil(a, kit.E(x0 + 630, y + 32, 46, 30, 0, 18), w=1.8, closed=True, smooth=True)


@asset(G, "logbook-1", group="documents", title="The Ranger's Book 1: one day, three rows closed up", w=BW, h=BH,
       row="Logbook spreads, with the first page")
def logbook_1(a: Art):
    """The ranger's logbook open on the booth counter, ruled in columns in Marisol's careful blue-black hand.
    The check-in rows have closed up where three lost sites were and the permit numbers skip; on the right
    her day's totals stand beside Tam's pencil sums, which come up short, and three blank ghost rows wait
    to be filled."""
    book(a)
    columns(a, LX)
    prev = 400
    for k, (s, p, n, permit) in enumerate(DAY1):
        row(a, LX, k + 1, s, p, n, "1", "$90" if s == "20–24" else "$18", permit, skip=int(permit) - prev > 1)
        prev = int(permit)
    y = TOP + 70 + 13 * ROW
    kit.pencil(a, [(LX + 300, y - 30), (LX + 700, y - 32)], w=2.2)
    kit.hand(a, LX + 110, y + 4, "11 rows", size=28)
    kit.hand(a, LX + 322, y + 4, "34", size=32); kit.hand(a, LX + 480, y + 4, "$270", size=30)
    a.hatch(LX + 30, y + 40, 640, 200, angle=62, spacing=5, jitter=1.4, stroke=kit.GRAPHITE, stroke_width=0.8,
            opacity=0.32, clip=a.clip(f'<rect x="{LX + 30}" y="{y + 40}" width="640" height="200" rx="60"/>'))
    kit.hand(a, LX + 70, y + 120, "permits skip:  0402   0405   0409", size=30, color="#2b2b2d")
    kit.hand(a, LX + 70, y + 170, "Marisol: “These don’t add up. They always add up.”", size=24)
    totals(a, RX0, TOP + 118, [("Occupied sites", "18", "15", "3"), ("Persons", "43", "34", "9"),
                               ("Fees", "$324", "$270", "$54"), ("Envelopes in the drop box", "14", "11", "3")])
    kit.printed(a, RX0 + 30, 690, "GHOST ROWS", size=15)
    for k, s in enumerate(("2", "5", "9")):
        x, y = RX0 + 30 + k * 16, 708 + k * 58
        a.rect(x, y, 620, 44, fill="#F7F2E2", stroke=kit.GRAPHITE, stroke_width=1.8, stroke_dasharray="8 5",
               transform=f"rotate({(-1.2, 0.8, -0.5)[k]} {x + 300} {y + 20})")
        kit.hand(a, x + 16, y + 31, f"{s}?        ?        _        1        $18        040{s}", size=24,
                 color="#77756f", rot=(-1.2, 0.8, -0.5)[k])
    pencil_prop(a, 1330, 600, -28)
    finish(a)


def pencil_prop(a, cx, cy, rot):
    a.open("g", transform=f"rotate({rot} {cx} {cy})")
    a.rect(cx - 170, cy - 9, 300, 18, fill=kit.GOLD); a.rect(cx - 170, cy - 9, 300, 6, fill="#E2C46A")
    a.poly([(cx + 130, cy - 9), (cx + 162, cy), (cx + 130, cy + 9)], fill="#E6C9A0")
    a.poly([(cx + 152, cy - 3), (cx + 162, cy), (cx + 152, cy + 3)], fill="#333")
    a.rect(cx - 192, cy - 9, 22, 18, fill="#C0C0C0"); a.rect(cx - 208, cy - 9, 16, 18, fill="#D27A7A")
    a.close()


def stub(a, x, y, plate, rot, ghost=False):
    a.open("g", transform=f"rotate({rot} {x + 90} {y + 40})")
    a.rect(x + 3, y + 4, 184, 78, fill="#000", opacity=0.18)
    a.rect(x, y, 184, 78, fill="#E9DDBE", stroke="#b5a988", stroke_width=1)
    a.path(f"M{x},{y + 14}h184", stroke="#b5a988", stroke_width=1, stroke_dasharray="3 3")
    kit.printed(a, x + 10, y + 32, "DROP BOX · $18", size=10.5, letter_spacing="1")
    a.rect(x + 12, y + 40, 124, 30, fill="#fbf8ee", stroke=MINK, stroke_width=1.6, rx=3)
    a.text(x + 74, y + 62, plate, size=19, family="monospace", fill=MINK, text_anchor="middle", font_weight="bold")
    if ghost:
        kit.pencil(a, kit.E(x + 74, y + 55, 76, 26, 0, 18), w=2.2, closed=True, smooth=True)
    a.close()


@asset(G, "logbook-2", group="documents", title="The Ranger's Book 2: two days, a refund and the envelope stubs",
       w=BW, h=BH, row="Logbook spreads, with the first page")
def logbook_2(a: Art):
    """The logbook's second spread: two days of check-ins with five rows closed up and a refund line in red
    that confuses the fee sum. On the right, the cash count beside Tam's pencil working, and the drop-box
    envelope stubs pinned along the page, each with a licence plate; one plate, ringed in pencil, has no
    row."""
    book(a)
    columns(a, LX)
    kit.printed(a, LX + 500, TOP + 34, "FRI", size=13)
    rows = [r for r in DAY1 if r[0] not in ("12",)]
    prev = 400
    for k, (s, p, n, permit) in enumerate(rows):
        row(a, LX, k + 1, s, p, n, "2" if s in ("7", "20–24") else "1",
            "$180" if s == "20–24" else "$36" if s == "7" else "$18", permit, skip=int(permit) - prev > 1)
        prev = int(permit)
    y = TOP + 70 + 11 * ROW - 10
    a.text(LX + 26, y, "8", size=24, family="serif", fill=kit.RED)
    a.text(LX + 110, y, "Hale: left early, refund", size=24, family="serif", fill=kit.RED, font_style="italic")
    a.text(LX + 480, y, "−$18", size=24, family="serif", fill=kit.RED)
    a.line(LX + 16, y + 20, LX + PW - 120, y + 20, stroke=MINK, stroke_width=1.6)
    kit.printed(a, LX + 500, y + 52, "SAT", size=13)
    sat = [("12", "Wren", 3, "0412"), ("15", "Ito", 2, "0417"), ("16", "Banks", 4, "0418"), ("18", "Okoro", 2, "0419"),
           ("19", "Vance", 1, "0420")]
    prev = 414
    for k, (s, p, n, permit) in enumerate(sat):
        row(a, LX, 13 + k, s, p, n, "1", "$18", permit, skip=int(permit) - prev > 1)
        prev = int(permit)
    kit.hand(a, LX + 110, TOP + 70 + 18.6 * ROW, "0415, 0416: sites 13 and 14?", size=26)
    totals(a, RX0, TOP + 118, [("Persons, two nights", "62", "46", "16"), ("Fees, less refund", "$540", "$450", "$90"),
                               ("Envelopes", "21", "16", "5")], heading="TWO DAYS")
    kit.printed(a, RX0 + 30, 540, "ENVELOPE STUBS", size=15)
    plates = [("4KD 217", -3, False), ("HRN 0613", 2, False), ("7TB 440", -1.5, False), ("2LW 958", 3, True),
              ("9AX 106", -2, False), ("5MC 731", 1.5, False)]
    for k, (pl, rot, gh) in enumerate(plates):
        stub(a, RX0 + 40 + (k % 3) * 214, 566 + (k // 3) * 104, pl, rot, gh)
    kit.hand(a, RX0 + 44, 812, "numbers hold.  2LW 958: no row. A car in the lot, no site.", size=24)
    # the duplicate sheet: a carbon keeps the pressure of a name, mirrored, never the word
    a.rect(RX0 + 40, 836, 640, 76, fill="#3d4a6b", opacity=0.16)
    kit.printed(a, RX0 + 52, 858, "CARBON", size=11, color="#3d4a6b")
    d = []
    x = RX0 + 640
    for L in (70, 38, 96, 54):
        d.append(a.wobble_d([(x - L, 886), (x, 886)], amp=5, step=6))
        x -= L + 26
    a.path(" ".join(d), fill="none", stroke="#3d4a6b", stroke_width=2.2, opacity=0.45, filter=a.blur(0.8))
    finish(a)


@asset(G, "logbook-first-page", group="documents", title="The Ranger's Book: the first page", w=BW, h=BH,
       row="Logbook spreads, with the first page")
def logbook_first(a: Art):
    """The front of the logbook, which is not a ledger at all: a notebook's Sites page in pencil, in a younger
    Marisol's hand, with ink columns ruled over it later. A party of five is written in at 20 to 24 with the
    check-out column empty, and its row 21 is the same sentence as Tam's. On the facing page, Tam's two
    notebook lines about it."""
    book(a, left="#EDE3C6", rules=(False, True))
    # the old notebook page: narrower rules, a red margin, foxing
    d = "".join(f"M{LX + 12},{TOP + 64 + k * 34}h{PW - 24}" for k in range(25))
    a.path(d, stroke=kit.RULE, stroke_width=1, fill="none")
    a.line(LX + 92, TOP, LX + 92, BH - TOP, stroke=kit.MARGIN, stroke_width=1.3)
    for _ in range(26):
        a.circle(LX + a.rng.uniform(20, PW - 120), TOP + a.rng.uniform(20, BH - 2 * TOP - 20), a.rng.uniform(2, 9),
                 fill="#a8793f", opacity=a.rng.uniform(0.05, 0.16), filter=a.blur(2))
    P = "#55534f"

    def old(x, y, s, size=25, **kw):
        a.text(x, y, s, size=size, family="serif", fill=P, font_style="italic",
               transform=f"translate({x} {y}) skewX(-9) translate({-x} {-y})", filter=kit.pfilter(a), **kw)
    old(LX + 110, TOP + 56, "Sites", size=34)
    kit.pencil(a, [(LX + 108, TOP + 66), (LX + 196, TOP + 64)], w=2, color=P)
    lines = [("20", "the gate end. two tents"), ("21", "the split boulder, slept in the crack"),
             ("22", "the shared ring"), ("23", "table by the road"), ("24", "the far end")]
    for k, (n, s) in enumerate(lines):
        y = TOP + 64 + (3 + k * 2) * 34 - 8
        old(LX + 40, y, n, size=27)
        old(LX + 112, y, s)
    y = TOP + 64 + 14 * 34 - 8
    old(LX + 112, y, "party of five, 20 to 24")
    kit.tally(a, LX + 420, y - 24, 5, h=28, gap=9, stroke=P)
    old(LX + 112, y + 68, "in:  August")
    old(LX + 112, y + 136, "out:")
    kit.pencil(a, [(LX + 180, y + 140), (LX + 420, y + 138)], w=1.4, color=P, op=0.6)
    # ink columns ruled over the pencil, later: it became the logbook
    for dx in (300, 400, 470, 570):
        a.line(LX + 12 + dx + 130, TOP + 20, LX + 12 + dx + 130, BH - TOP - 20, stroke="#C58F86", stroke_width=1.2, opacity=0.9)
    for nm, dx in (("PERS.", 430), ("NTS", 530), ("FEE", 600)):
        kit.printed(a, LX + 22 + dx, TOP + 46, nm, size=13, letter_spacing="1.5")
    # Tam's pencil ring round row 21
    y21 = TOP + 64 + 5 * 34 - 16
    kit.pencil(a, kit.E(LX + 300, y21, 270, 26, -1, 26), w=2.4, closed=True, smooth=True)
    # facing page: the first true ledger rows in ink, and Tam's notebook lines
    columns(a, RX0)
    row(a, RX0, 1, "20–24", "Teague", 5, "—", "—", "0001")
    row(a, RX0, 2, "3", "", 2, "1", "$12", "0002")
    row(a, RX0, 3, "9", "", 4, "2", "$24", "0003")
    kit.pencil(a, [(RX0 + 100, TOP + 70 + ROW - 2), (RX0 + 230, TOP + 70 + ROW - 4)], w=2.2)
    kit.hand(a, RX0 + 250, TOP + 70 + ROW + 34 + ROW * 3, "the hand that kept the book", size=24, rot=-2)
    # Tam's notebook, laid on the page
    nx, ny, nw, nh = RX0 + 70, 420, 580, 430
    a.open("g", transform=f"rotate(-3 {nx + nw / 2} {ny + nh / 2})")
    a.rect(nx + 6, ny + 8, nw, nh, fill="#000", opacity=0.25)
    kit.notebook(a, nx, ny, nw, nh, step=38, top=64, margin=62)
    kit.printed(a, nx + 76, ny + 36, "SITES", size=15, color=kit.GRAPHITE)
    for k, s in enumerate(["Marisol turned to the front to show", "me how a book is kept.",
                           "The front is in pencil.", "", "21  the split boulder, slept in the crack",
                           "Her row 21 and my row 21 are the", "same sentence. Hers is older. Check."]):
        if s:
            kit.hand(a, nx + 76, ny + 56 + (k + 1) * 38, s, size=27, rot=0)
    a.close()
    pencil_prop(a, 1380, 900, -12)
    finish(a)


@asset(G, "logbook-3", group="documents", title="The Ranger's Book 3: only the counts are left", w=BW, h=BH,
       row="Logbook spreads, with the first page")
def logbook_3(a: Art):
    """The logbook on the other side: every name and site number has gone and the rows have not closed up,
    so only the persons counts remain, in arrival order. On the facing page Tam has drawn each count as a tent
    pad with that many trees in it, and pencil lines tie rows to glyphs: the counts are trees."""
    book(a, left="#F1EEE4", right="#F1EEE4", tone="#C9C8C1")
    columns(a, LX)
    counts = [2, 3, 4, 3, 2, 2, 5, 1, 4, 2, 4, 3, 2, 3, 2, 4, 3, 2, 1]
    for k, n in enumerate(counts[:19]):
        y = TOP + 70 + (k + 1) * ROW - 10
        kit.tally(a, LX + 322, y - 22, n, h=24, gap=8, stroke=MINK, stroke_width=1.8)
        a.line(LX + 30, y - 6, LX + 70, y - 6, stroke="#b5a988", stroke_width=0.8, opacity=0.5)
        a.line(LX + 112, y - 6, LX + 280, y - 6, stroke="#b5a988", stroke_width=0.8, opacity=0.5)
        kit.hand(a, LX + 600, y, str(n), size=24, rot=0)
    kit.printed(a, RX0 + 30, TOP + 58, "PATTERN KEY", size=15, color=kit.OS_GREEN)
    kit.hand(a, RX0 + 200, TOP + 58, "persons = trees in the pad", size=24)
    for k in range(12):
        n = counts[18 - k]
        gx, gy = RX0 + 110 + (k % 4) * 168, 230 + (k // 4) * 230
        pad = [(gx - 46, gy - 46), (gx + 46, gy - 46), (gx + 46, gy + 46), (gx - 46, gy + 46)]
        for i in range(4):
            x1, y1 = pad[i]; x2, y2 = pad[(i + 1) % 4]
            for t in range(5):
                kit.tree(a, x1 + (x2 - x1) * t / 5, y1 + (y2 - y1) * t / 5, 6.5, kit.OS_GREEN, 3, "#F1EEE4")
        for j in range(n):
            kit.tree(a, gx + (j - (n - 1) / 2) * 17, gy, 8, "#0f3a33", 3, "#F1EEE4")
        kit.hand(a, gx - 50, gy + 84, f"{19 - k}:  {n}", size=24, rot=0)
        if k < 4:
            ry = TOP + 70 + (19 - k) * ROW - 18
            kit.pencil(a, [(LX + 640, ry), (LX + PW + 20, ry - 40 + k * 30), (gx - 60, gy + 40)], w=1.5, op=0.55,
                       smooth=True)
    kit.hand(a, RX0 + 40, 900, "19 down to 1, the way the loop went.", size=26)
    finish(a)


# ---- Agnes's postcard --------------------------------------------------------------------------------
PW2, PH2 = 900, 600
CARD = [("7", ["Site 7. The owl box.", "Count to a hundred and it calls."]),
        ("9", ["Site 9. The shallow pool.", "You learned to float there."]),
        ("12", ["Site 12. The creek bend.", "Cold enough to keep the milk."]),
        ("16", ["Site 16. The tall cedar.", "You fell out of it once, and laughed."]),
        ("heron", ["The heron sign. Wave at it", "on the way in. We always did."]),
        ("21", ["Site 21. The split boulder.", "You slept in the crack of it."])]
PSTATES = [("whole", set(), "as Agnes wrote it, all six lines"),
           ("after-night-1", {"7", "9"}, "after the first night: the lines for sites 7 and 9 are blank"),
           ("after-noon", {"7", "9", "12"}, "after noon on day 2: the line for site 12 has gone too"),
           ("after-dusk", {"7", "9", "12", "16", "heron"}, "after dusk on day 2: only the line for site 21 is left"),
           ("sign-carried", {"7", "9", "12", "16"}, "after dusk with the heron sign carried in: its line held, with site 21's")]
BIRO = "#27386b"


def card_back(a, lost, night=False):
    paper = "#EFE4C8"
    a.rect(0, 0, PW2, PH2, fill="#2b2622" if not night else "#0b0f18")
    a.open("g", transform="rotate(-1.2 450 300)")
    a.rect(34, 30, PW2 - 60, PH2 - 56, fill="#000", opacity=0.35)
    a.rect(26, 22, PW2 - 60, PH2 - 56, fill=paper)
    a.line(540, 60, 540, PH2 - 70, stroke=kit.INK, stroke_width=1.2)
    kit.printed(a, 300, 50, "POST CARD", size=13, letter_spacing="6", font_weight="normal")
    # the stamp: a heron, and a postmark
    a.rect(740, 50, 96, 116, fill="#F6EFDC", stroke=kit.INK, stroke_width=1.5, stroke_dasharray="3 3")
    a.rect(748, 58, 80, 100, fill=kit.GREEN, opacity=0.85)
    a.path(a.smooth_d([(778, 140), (784, 112), (800, 98), (792, 82), (800, 70)]), fill="none", stroke="#F6EFDC", stroke_width=4)
    a.ellipse(780, 122, 16, 9, fill="#F6EFDC"); a.line(800, 70, 818, 74, stroke="#F6EFDC", stroke_width=3)
    for rr in (44, 36):
        a.circle(706, 118, rr, fill="none", stroke="#444", stroke_width=1.6, opacity=0.6)
    for k in range(4):
        a.path(a.smooth_d([(730, 96 + k * 12), (760, 92 + k * 12), (790, 100 + k * 12), (830, 94 + k * 12)]), fill="none",
               stroke="#444", stroke_width=1.6, opacity=0.5)
    for k in range(3):
        a.line(580, 300 + k * 56, 830, 300 + k * 56, stroke=kit.INK, stroke_width=1)
    a.text(590, 290, "Tam", size=34, family="serif", fill=BIRO, font_style="italic",
           transform="translate(590 290) skewX(-14) translate(-590 -290)")
    y = 96
    for key, lines in CARD:
        for ln in lines:
            if key in lost:
                if night:        # raking torchlight: the grooves show, and cannot be read
                    x = 60
                    for word in ln.split():
                        L = len(word) * 9.5
                        a.path(a.wobble_d([(x, y - 5), (x + L, y - 5)], amp=4.5, step=5), fill="none", stroke="#3a2a10",
                               stroke_width=1.6, opacity=0.5)
                        a.path(a.wobble_d([(x, y - 3.6), (x + L, y - 3.6)], amp=4.5, step=5), fill="none", stroke="#fff3d0",
                               stroke_width=1.1, opacity=0.5)
                        x += L + 10
            else:
                a.text(60, y, ln, size=21, family="serif", fill=BIRO, font_style="italic",
                       transform=f"translate(60 {y}) skewX(-14) translate(-60 {-y})")
            y += 33
        y += 12
    a.close()


def postcard(key, lost, what):
    @asset(G, f"postcard-{key}", group="documents", title=f"Agnes's postcard, {key.replace('-', ' ')}", w=PW2, h=PH2,
           row="Postcard states")
    def draw(a: Art):
        card_back(a, lost)
        kit.tooth(a, 0.07)
    draw.__doc__ = (f"The writing side of Agnes's postcard to Tam, in her slanted blue biro, with a heron stamp and a "
                    f"postmark, {what}. Nothing shows where a line was.")
    return draw


for _k, _lost, _what in PSTATES:
    postcard(_k, _lost, _what)


@asset(G, "postcard-under-torch", group="documents", title="Agnes's postcard, held low under the torch", w=PW2,
       h=PH2, row="Postcard states")
def postcard_torch(a: Art):
    """The postcard at night, held at a low angle under the torch: one amber light rakes across the card, and
    where five lines have gone the paper still shows the grooves of the pen. The words cannot be read. Only
    the line for site 21 is still ink."""
    card_back(a, {"7", "9", "12", "16", "heron"}, night=True)
    a.rect(0, 0, PW2, PH2, fill=a.radial([(0, "#ffd58a", 0.0), (0.45, kit.AMBER, 0.16), (0.8, "#3a1d06", 0.6),
                                          (1, kit.NIGHT, 0.95)], cx=0.18, cy=0.55, r=0.95), style="mix-blend-mode:multiply")
    a.rect(0, 0, PW2, PH2, fill=a.radial([(0, "#ffd58a", 0.35), (0.5, kit.AMBER, 0.08), (1, kit.AMBER, 0)], cx=0.12,
                                         cy=0.6, r=0.6))
    kit.tooth(a, 0.14, white=True)


@asset(G, "postcard-picture-side", group="documents", title="Agnes's postcard, the picture side", w=PW2, h=PH2,
       row="Postcard states")
def postcard_front(a: Art):
    """The picture side of the postcard: a faded printed view of the campground entrance, tall cedar trunks in
    late sun, the gravel road and the painted heron sign reading HOLLIN CREEK, SITES 1 to 24, with a white
    border and a soft crease across one corner."""
    r = a.rng
    a.rect(0, 0, PW2, PH2, fill="#2b2622")
    a.open("g", transform="rotate(1.1 450 300)")
    a.rect(34, 30, PW2 - 60, PH2 - 56, fill="#000", opacity=0.35)
    a.rect(26, 22, PW2 - 60, PH2 - 56, fill="#F3ECD8")
    x0, y0, w, h = 50, 46, PW2 - 108, PH2 - 104
    clip = a.clip(f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}"/>')
    a.open("g", clip_path=clip)
    a.rect(x0, y0, w, h, fill=a.gradient([(0, "#cfd8c4"), (0.5, "#b9c59c"), (1, "#8c9a66")]))
    for k in range(60):                                    # far foliage
        a.circle(x0 + r.uniform(0, w), y0 + r.uniform(0, h * 0.55), r.uniform(20, 60), fill=r.choice([kit.GREEN, "#8aa06c", "#58724a"]),
                 opacity=0.35)
    a.poly([(x0, y0 + h * 0.62), (x0 + w, y0 + h * 0.56), (x0 + w, y0 + h), (x0, y0 + h)], fill="#b79b6c")
    a.poly([(x0 + 240, y0 + h), (x0 + 430, y0 + h * 0.6), (x0 + 500, y0 + h * 0.6), (x0 + 640, y0 + h)], fill=kit.GOLD, opacity=0.8)
    a.stipple(x0, y0 + h * 0.6, w, h * 0.4, n=500, r=(0.8, 2), fill="#7a6243", opacity=0.5)
    for k in range(13):                                    # trunks
        x = x0 + 20 + k * 62 + r.uniform(-14, 14)
        tw = r.uniform(12, 34)
        if 300 < x - x0 < 560:
            tw *= 0.5
        base = y0 + h * (0.6 + r.uniform(0, 0.14))
        a.poly([(x - tw / 2, y0), (x + tw / 2, y0), (x + tw * 0.7, base), (x - tw * 0.7, base)], fill=kit.CEDAR if k % 3 else "#4d2f1b")
        a.poly([(x + tw * 0.7, base), (x - tw * 0.7, base), (x - tw * 0.7 - 190, base + 46), (x - 150, base + 52)], fill="#3a2a1a", opacity=0.28)
        a.line(x - tw * 0.2, y0, x - tw * 0.1, base, stroke="#e6c38a", stroke_width=tw * 0.14, opacity=0.5)
    # the heron sign
    sx, sy = x0 + 520, y0 + 250
    a.rect(sx + 14, sy + 80, 12, 130, fill="#4d2f1b"); a.rect(sx + 216, sy + 80, 12, 130, fill="#4d2f1b")
    a.rect(sx, sy, 244, 104, fill="#2f5a3a", stroke="#1d3a25", stroke_width=3)
    a.rect(sx + 6, sy + 6, 232, 92, fill="none", stroke="#F3ECD8", stroke_width=1.5)
    a.path(a.smooth_d([(sx + 40, sy + 84), (sx + 46, sy + 52), (sx + 62, sy + 40), (sx + 52, sy + 26), (sx + 62, sy + 16)]),
           fill="none", stroke="#F3ECD8", stroke_width=5)
    a.ellipse(sx + 40, sy + 62, 18, 10, fill="#F3ECD8"); a.line(sx + 62, sy + 16, sx + 84, sy + 20, stroke=kit.GOLD, stroke_width=4)
    a.text(sx + 96, sy + 48, "HOLLIN CREEK", size=17, family="sans-serif", fill="#F3ECD8", font_weight="bold")
    a.text(sx + 96, sy + 76, "SITES 1–24", size=17, family="sans-serif", fill="#F3ECD8", letter_spacing="2")
    a.rect(x0, y0, w, h, fill="#e8b96a", opacity=0.16)          # the print has yellowed
    pid = a.uid("ht")
    a.defn(f'<pattern id="{pid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">'
           f'<circle cx="3" cy="3" r="1.1" fill="#3a2a1a"/></pattern>')
    a.rect(x0, y0, w, h, fill=f"url(#{pid})", opacity=0.2)
    a.close()
    a.line(700, 22, 866, 150, stroke="#fff", stroke_width=2, opacity=0.5); a.line(702, 22, 868, 150, stroke="#000", stroke_width=1, opacity=0.2)
    a.close()
    kit.tooth(a, 0.07)


# ---- Bea's recipe card (risograph) -------------------------------------------------------------------
RW, RH = 600, 800
RLINES = [("2 potatoes, or any root", False), ("1 sausage each", False), ("a pat of butter from the booth", True),
          ("store corn goes on last", True), ("salt & pepper", False), ("fold tight, 3 folds", False),
          ("coals 25 min", False)]


def recipe(key, blank, copied, what):
    @asset(G, f"recipe-{key}", group="documents", title=f"Bea's recipe card, {key.replace('-', ' ')}", w=RW, h=RH,
           row="Ingredient tiles (14), recipe card states (3)")
    def draw(a: Art):
        a.paper("#F6EFE3", grain=0.22, fibre=1.2)
        a.stipple(0, 0, RW, RH, n=500, r=(0.5, 1.3), fill=kit.TEAL, opacity=0.28)
        a.stipple(0, 0, RW, RH, n=500, r=(0.5, 1.3), fill=kit.PINK, opacity=0.28)
        mul = "mix-blend-mode:multiply"
        a.rect(24, 24, RW - 48, RH - 48, fill="none", stroke=kit.TEAL, stroke_width=4, style=mul)
        a.rect(29, 20, RW - 48, RH - 48, fill="none", stroke=kit.PINK, stroke_width=4, style=mul, opacity=0.85)
        if blank:
            a.rect(48, 50, RW - 96, 74, fill="none", stroke=kit.PINK, stroke_width=2.5, stroke_dasharray="7 6")
        else:
            a.rect(48, 50, RW - 96, 74, fill=kit.TEAL, style=mul, opacity=0.9)
            a.rect(53, 46, RW - 96, 74, fill=kit.PINK, style=mul, opacity=0.55)
            a.text(68, 98, "HOLLIN CREEK FOIL SUPPER", size=27, family="sans-serif", fill="#F6EFE3", font_weight="bold",
                   letter_spacing="2")
        # the packet on its coals, halftone
        cx, cy = 300, 250
        a.halftone(70, 150, 460, 200, lambda x, y: 0.75 - math.hypot((x - cx) / 1.5, y - cy - 40) / 150, cell=10, angle=45,
                   fill=kit.PINK, opacity=0.8)
        pen = kit.RisoPen(a, cx, cy + 10, 120)
        kit.ICONS["packet"](pen)
        for k in range(9):
            a.ellipse(100 + k * 50, 348 + (k % 2) * 6, 24, 12, fill=kit.TEAL, style=mul, opacity=0.8)
            a.ellipse(104 + k * 50, 345 + (k % 2) * 6, 16, 7, fill=kit.PINK, style=mul, opacity=0.9)
        # Bea's lines
        for k, (ln, names) in enumerate(RLINES):
            y = 430 + k * 46
            a.line(60, y + 10, RW - 60, y + 10, stroke=kit.TEAL, stroke_width=1.3, opacity=0.7)
            if blank and names:
                if copied:
                    kit.hand(a, 66, y, ln, size=25, rot=-1.5)
                continue
            a.text(66, y, ln, size=25, family="serif", fill="#3a0f24", font_style="italic")
        a.text(60, RH - 44, "card: Bea", size=15, family="monospace", fill=kit.TEAL)
        if copied:
            kit.hand(a, 70, 104, "Hollin Creek foil supper", size=34, rot=-2)
            kit.hand(a, 350, RH - 44, "copied. Tam", size=22)
        elif not blank:
            a.text(RW - 60, RH - 44, "serves 5", size=15, family="monospace", fill=kit.PINK, text_anchor="end")
    draw.__doc__ = (f"Bea's foil-supper recipe card printed in two risograph inks, pink and teal, out of register, with "
                    f"a halftone packet steaming on its coals and seven lines in her hand, {what}.")
    return draw


recipe("legible", False, False, "all legible, as it is on day 1")
recipe("blank", True, False, "on day 2: the heading and the two lines that name the store are empty print")
recipe("copied", True, True, "on day 2 with the blanks filled by Tam's pencil copy, which holds")

"""The Tide Reckoning sheet, the twelve toll vignettes and three spreads of the Wreck Book."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK, PAPER, SAIL, BB = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK, kit.PAPER, kit.SAIL,
    kit.BLUEBLACK)
ROW = "Tide Reckoning sheet and toll vignettes"
ROW_W = "Wreck Book spreads"
WOOD = "#4a3320"


@asset(G, "tide-reckoning-sheet", group="documents", title="The Tide Reckoning sheet", w=800, h=1100, row=ROW)
def sheet(a: Art):
    """The Tide Reckoning: a Company ledger sheet over the chart table, one line for each region with its Wild
    shown as ruled or wave hatching, columns for wreck and drowning, one entry marked saved in sea-ink, and the
    Lord of Tea's green countersign at the foot."""
    a.paper(WOOD, grain=0.35, fibre=0.02)
    a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, "#000", gap=9, sw=1, opacity=0.25))
    a.rect(68, 60, 680, 1000, fill="#000", opacity=0.35, filter=a.blur(6))
    a.rect(60, 50, 680, 1000, fill=LAMP)
    a.rect(60, 50, 680, 1000, fill=kit.pattern(a, kit.WASH, gap=27, sw=0.8))
    kit.company_mark(a, 400, 112, 26, col=INK, opacity=1, sw=1.8)
    kit.smallcaps(a, 400, 178, "Tide Reckoning", size=36, col=INK)
    a.path("M100,196 h600 M100,201 h600", stroke=INK, stroke_width=1)
    cols = [100, 300, 420, 540, 660, 700]
    for x in cols[1:-1]:
        a.line(x, 214, x, 890, stroke=RED, stroke_width=0.9)
    for x, lab in zip((110, 310, 430, 550), ("Region", "Wild", "Wreck", "Drowning")):
        kit.smallcaps(a, x, 236, lab, size=13, col=RED, anchor="start")
    a.line(100, 246, 700, 246, stroke=RED, stroke_width=1.2)
    wild = [50, 10, 85, 60, 20, 82, 25, 30]
    wreck = {3: "two reef skiffs", 5: "a diving boat"}
    drown = {5: "Ide"}
    ruled = kit.pattern(a, INK, gap=3.4, sw=1.1)
    waved = kit.pattern(a, GREEN, gap=4, sw=1.2, wave=True)
    for i, (key, name) in enumerate(kit.REGIONS):
        y = 290 + i * 76
        a.text(110, y, name, size=21, family="serif", fill=BB, font_style="italic")
        kit.script(a, 110, y + 24, 150, size=0.6, opacity=0.7)
        a.rect(310, y - 16, 100, 18, fill="none", stroke=INK, stroke_width=1)
        a.rect(310, y - 16, 100 - wild[i], 18, fill=ruled)
        a.rect(410 - wild[i], y - 16, wild[i], 18, fill=waved)
        a.text(360, y + 22, str(wild[i]), size=14, family="serif", fill=BB, text_anchor="middle", font_style="italic")
        if i in wreck:
            a.text(430, y, wreck[i], size=15, family="serif", fill=BB, font_style="italic")
            kit.script(a, 430, y + 22, 100, size=0.55)
        else:
            a.line(450, y - 6, 510, y - 6, stroke=BB, stroke_width=0.9)
        if i in drown:
            a.text(550, y, drown[i], size=19, family="serif", fill=BB, font_style="italic")
            a.text(550, y + 24, "saved", size=19, family="cursive", fill=SEAINK)
            kit.spiral(a, 628, y + 16, 1, 11, 2.2, stroke_width=1.6)
        else:
            a.line(570, y - 6, 630, y - 6, stroke=BB, stroke_width=0.9)
        a.line(100, y + 40, 700, y + 40, stroke=kit.WASH, stroke_width=0.9)
        if key not in ("home", "unwritten") and i != 5 and i != 3:
            kit.tick(a, 668, y, s=0.8)
    a.line(100, 890, 700, 890, stroke=RED, stroke_width=1.2)
    kit.smallcaps(a, 110, 930, "The toll", size=15, col=RED, anchor="start")
    kit.script(a, 230, 930, 300, size=1.0)
    kit.script(a, 110, 962, 420, size=1.0)
    kit.tick(a, 560, 1000, s=2.6)
    a.line(520, 1012, 690, 1012, stroke=INK, stroke_width=1)
    kit.wax(a, 150, 990, 34, emblem=lambda cx, cy, r: kit.company_mark(a, cx, cy, r, opacity=0.5))


# ---- toll vignettes ----------------------------------------------------------------------------------
VW, VH = 600, 440
HZ = 190


def rings(a, x, y, n=4, col=INK):
    for k in range(1, n + 1):
        a.ellipse(x, y, 16 * k, 3.6 * k, fill="none", stroke=col, stroke_width=1.5 - k * 0.22)


def water(a, amp=10.0, y0=HZ, col=INK):
    kit.sea(a, 30, VW - 30, y0, 360, rows=12, fn=kit.swell(amp=amp, wl=190, sharp=0.6), step=9, col=col)


def stormsky(a):
    a.rect(30, 30, VW - 60, HZ - 30, fill=kit.pattern(a, VIOLET, gap=3.6, sw=1.2), opacity=0.85)
    for (x, y, w) in ((90, 96, 200), (330, 70, 220)):
        kit.cloud(a, x, y, w, n=5)


def v_ferry(a):
    stormsky(a)
    a.rect(60, HZ - 12, 110, 12, fill=INK)
    kit.ship(a, "ferry", 320, 232, 1.35, ang=17)
    a.rect(30, 250, VW - 60, 120, fill=PAPER)
    water(a, 12, 226)
    a.path("M452,246 q10,-12 20,0 q-10,12 -20,0z", fill=SAIL, stroke=INK, stroke_width=1.3)     # a lifebuoy
    a.path("M214,292 l34,-6 l2,12 l-34,6z", fill=SAIL, stroke=INK, stroke_width=1.2)            # a bench


def v_skiffs(a):
    stormsky(a)
    kit.ship(a, "lugskiff", 210, 242, 1.5, ang=-34)
    kit.ship(a, "skiff", 400, 268, 1.6, ang=172)
    a.rect(30, 268, VW - 60, 110, fill=PAPER)
    water(a, 9, 240)
    for (x, w) in ((120, 120), (300, 170), (470, 90)):
        a.path(f"M{x},278 l{w * 0.2},-22 l{w * 0.3},8 l{w * 0.2},-16 l{w * 0.3},30z", fill=INK)
        kit.foam(a, [(x + k * w / 5, 276) for k in range(6)], n=2)


def v_packet(a):
    a.rect(30, 30, VW - 60, HZ - 30, fill=INK)
    a.stipple(30, 30, VW - 60, 120, n=60, r=(0.5, 1.3), fill=LAMP)
    kit.lighthouse(a, 500, HZ + 2, 110, col="#0d1526", lit=False)
    a.rect(30, HZ, VW - 60, 190, fill=PAPER)
    kit.ship(a, "packet", 280, 232, 1.1, ang=-21)
    a.rect(30, 256, VW - 60, 120, fill=PAPER)
    water(a, 10, HZ)
    for wx in (110, 420):
        for j in range(6):
            a.path(f"M{wx + j * 14},{270 - 8 * math.sin(j * 0.6)} q4,-26 -8,-46", fill="none", stroke=INK, stroke_width=2)


def v_diver(a):
    stormsky(a)
    kit.ship(a, "diver", 300, 236, 1.8, ang=28)
    a.rect(30, 262, VW - 60, 120, fill=PAPER)
    water(a, 9, 236)
    a.rect(30, 300, VW - 60, 70, fill=INK, opacity=0.25)
    for k in range(5):
        a.circle(120 + k * 86, 262 + (k % 2) * 16, 6, fill=SAIL, stroke=INK, stroke_width=1.3)
    a.path("M420,256 q-8,50 6,104", fill="none", stroke=INK, stroke_width=1.3)


def v_lighter(a):
    stormsky(a)
    for k in range(5):
        a.path(f"M{60 + k * 100},{HZ} v-{40 + (k % 3) * 12} l34,-16 l34,16 v{40 + (k % 3) * 12}z", fill=INK)
    kit.ship(a, "lighter", 290, 246, 1.5, ang=-12)
    a.rect(30, 270, VW - 60, 110, fill=PAPER)
    water(a, 9, 240)
    for (x, y, r) in ((130, 286, -12), (430, 280, 16), (500, 316, -6), (240, 322, 8)):
        a.open("g", transform=f"translate({x},{y}) rotate({r})")
        a.rect(-17, -12, 34, 20, fill=SAIL, stroke=INK, stroke_width=1.4)
        a.path("M-17,-2h34M-4,-6h8v8h-8z", fill="none", stroke=INK, stroke_width=1)
        a.close()
        a.path(f"M{x - 24},{y + 10}h48", stroke=INK, stroke_width=1)


def v_supply(a):
    stormsky(a)
    a.path(f"M360,{HZ} q40,-26 110,-28 q70,2 100,28z", fill=INK)
    a.rect(430, HZ - 62, 80, 36, fill=SAIL, stroke=INK, stroke_width=1.3)
    a.path(f"M450,{HZ - 62} a20,18 0 0,1 40,0z", fill=SAIL, stroke=INK, stroke_width=1.3)
    kit.ship(a, "supply", 230, 250, 1.6, ang=-150)
    a.rect(30, 262, VW - 60, 120, fill=PAPER)
    water(a, 11, 236)
    for (x, y) in ((380, 286), (450, 312), (130, 300)):
        a.ellipse(x, y, 17, 12, fill=SAIL, stroke=INK, stroke_width=1.4)
        a.path(f"M{x - 16},{y - 3}h32M{x - 16},{y + 4}h32", stroke=INK, stroke_width=0.9)


def stillsky(a, sun=True):
    kit.sky(a, 30, VW - 30, 30, HZ, gap=6, sun=(110, HZ - 6, 22) if sun else None)


def v_wenna(a):
    stillsky(a)
    water(a, 5)
    # the ferry stage, her cap on the post, her count chalked on the rail
    a.rect(30, 250, 330, 16, fill=SAIL, stroke=INK, stroke_width=1.6)
    for x in (60, 190, 330):
        a.rect(x, 262, 12, 110, fill=INK)
    a.rect(320, 176, 12, 80, fill=INK)
    a.path("M308,176 q18,-20 38,0 l8,6 h-50z", fill=INK)
    a.rect(60, 212, 250, 8, fill=SAIL, stroke=INK, stroke_width=1.4)
    a.path("M70,222 v28 M190,222 v28 M300,222 v28", stroke=INK, stroke_width=1.6)
    d = ""
    for k in range(11):
        x = 84 + k * 9 + (k // 5) * 12
        d += f"M{x},226v18"
    a.path(d + "M80,242l40,-14M138,242l40,-14", stroke=INK, stroke_width=1.6, stroke_linecap="round")
    a.path("M400,226 a8,10 0 0,1 16,0 v8 h-16z M408,214 v-8", fill=GOLD, stroke=INK, stroke_width=1.5)
    a.line(408, 206, 408, 150, stroke=INK, stroke_width=1.2)
    rings(a, 470, 300, 5)


def v_marrow(a):
    stillsky(a)
    water(a, 9)
    kit.ship(a, "skiff", 210, 262, 1.9, ang=-5)
    a.rect(30, 276, VW - 60, 30, fill=PAPER, opacity=0.7)
    kit.sea(a, 30, VW - 30, 272, 300, rows=3, fn=kit.swell(amp=5, wl=150), step=9, persp=1)
    clip = a.clip('<path d="M300,250 q120,-30 240,30 q-40,70 -150,80 q-80,-30 -90,-110z"/>')
    a.hatch(290, 220, 260, 150, angle=35, spacing=13, clip=clip, stroke=INK, stroke_width=1)
    a.hatch(290, 220, 260, 150, angle=-35, spacing=13, clip=clip, stroke=INK, stroke_width=1)
    for k in range(7):
        a.circle(310 + k * 36, 256 + 20 * math.sin(k * 0.8), 6, fill=SAIL, stroke=INK, stroke_width=1.4)
    rings(a, 430, 330, 4)


def v_corran(a):
    a.rect(30, 30, VW - 60, HZ - 30, fill=INK)
    a.stipple(30, 30, VW - 60, 130, n=70, r=(0.5, 1.3), fill=LAMP)
    a.rect(30, HZ, VW - 60, 190, fill=PAPER)
    a.path(f"M380,{HZ} q50,-30 110,-26 q60,4 80,26z", fill="#0d1526")
    kit.lighthouse(a, 470, HZ - 22, 130, col="#0d1526", lit=False)
    water(a, 8)
    kit.ship(a, "skiff", 220, 290, 1.9, ang=4)
    a.path("M184,280 v-34 m-8,0 h16 l-3,-16 h-10z", fill=PAPER, stroke=INK, stroke_width=1.6)      # his lantern, dark
    kit.sea(a, 100, 360, 300, 322, rows=3, fn=kit.swell(amp=4, wl=130), step=9, persp=1)
    rings(a, 400, 330, 4)


def v_ide(a):
    stillsky(a)
    water(a, 6)
    kit.ship(a, "diver", 250, 250, 2.0, ang=-2)
    kit.sea(a, 60, 460, 264, 290, rows=3, fn=kit.swell(amp=4, wl=140), step=9, persp=1)
    a.rect(30, 318, VW - 60, 52, fill=INK, opacity=0.3)
    a.path("M300,290 v70", stroke=INK, stroke_width=1.4)
    a.path("M286,170 h28 l-5,22 h-18z M286,170 a14,10 0 0,1 28,0", fill=SAIL, stroke=INK, stroke_width=1.5)   # her basket
    a.circle(300, 186, 4, fill="#fff", stroke=INK, stroke_width=1)
    rings(a, 300, 300, 5)


def v_warden(a):
    stillsky(a, sun=False)
    for k in range(5):
        a.path(f"M{40 + k * 76},{HZ + 30} v-{70 + (k % 3) * 16} l30,-16 l30,16 v{70 + (k % 3) * 16}z", fill=INK)
    a.rect(30, HZ + 30, 400, 22, fill=SAIL, stroke=INK, stroke_width=1.6)
    for x in (50, 170, 290, 410):
        a.rect(x, HZ + 50, 12, 130, fill=INK)
    kit.sea(a, 30, VW - 30, HZ + 60, 360, rows=9, fn=kit.swell(amp=6, wl=190, sharp=0.5), step=9)
    lx, ly = 392, HZ + 30
    a.circle(lx, ly - 18, 46, fill=a.radial([(0, GOLD, 0.7), (1, GOLD, 0)]))
    a.path(f"M{lx - 10},{ly} v-26 h20 v26z M{lx - 12},{ly - 26} l12,-10 l12,10z", fill=GOLD, stroke=INK, stroke_width=1.6)
    a.path(f"M{lx},{ly - 36} a7,7 0 1,1 0.1,0", fill="none", stroke=INK, stroke_width=1.4)
    a.circle(lx - 44, ly - 6, 9, fill="none", stroke=INK, stroke_width=1.6)                       # his keys
    a.path(f"M{lx - 44},{ly + 3} l-6,12 M{lx - 44},{ly + 3} l4,13 M{lx - 44},{ly + 3} l12,9", stroke=INK, stroke_width=1.6)
    rings(a, 500, HZ + 110, 5)


def v_oarsman(a):
    stillsky(a)
    a.path(f"M330,{HZ} q50,-30 130,-32 q80,2 110,32z", fill=INK)
    a.rect(410, HZ - 70, 100, 40, fill=SAIL, stroke=INK, stroke_width=1.3)
    a.path(f"M436,{HZ - 70} a24,20 0 0,1 48,0z", fill=SAIL, stroke=INK, stroke_width=1.3)
    water(a, 9)
    a.open("g", transform="translate(280,292) rotate(-7)")
    a.rect(-150, -4, 230, 8, rx=4, fill=SAIL, stroke=INK, stroke_width=1.6)
    a.path("M80,-4 q60,-16 96,-6 q8,10 0,20 q-36,10 -96,-6z", fill=SAIL, stroke=INK, stroke_width=1.6)
    a.path("M96,0 h70", stroke=INK, stroke_width=0.9)
    a.close()
    kit.sea(a, 110, 480, 298, 316, rows=3, fn=kit.swell(amp=4, wl=140), step=9, persp=1)
    rings(a, 330, 330, 4)


TOLL = [("wreck-ferry", "The ferry", "Tidewater. Wreck", v_ferry, "the Tidewater ferry down by the head on its six-minute crossing"),
        ("wreck-skiffs", "Two reef skiffs", "The Salt Steps. Wreck", v_skiffs, "two of the reef skiffs on the Salt Steps reef, one keel up"),
        ("wreck-packet", "A Company packet", "The Lamplit Strait. Wreck", v_packet, "a Company packet aground among old ribs under a light that is out"),
        ("wreck-diving-boat", "A diving boat", "The Pearl Banks. Wreck", v_diver, "a diving boat going over the trench edge, her floats left on the water"),
        ("wreck-lighter", "The pay lighter", "The Spice Mouth. Wreck", v_lighter, "a lighter loaded with the week's pay settling off the warehouses, chests adrift"),
        ("wreck-supply-boat", "The supply boat", "The King's Halls. Wreck", v_supply, "the halls' supply boat capsized, barrels floating toward the island"),
        ("lost-wenna", "Wenna", "Tidewater", v_wenna, "the empty ferry stage: her count chalked on the rail, the bell, rings on the water"),
        ("lost-old-marrow", "Old Marrow", "The Salt Steps", v_marrow, "his skiff adrift beside his grandchildren's nets, nobody in it"),
        ("lost-corran", "Corran", "The Lamplit Strait", v_corran, "a rowing boat under a light that went out, his lantern dark in the bow"),
        ("lost-ide", "Ide", "The Pearl Banks", v_ide, "her boat over the trench, the line still down, her basket hung on the davit"),
        ("lost-dock-warden", "The dock-warden", "The Spice Mouth", v_warden, "his lantern left burning on the quay edge beside his keys"),
        ("lost-old-oarsman", "An old oarsman", "The King's Halls", v_oarsman, "one oar floating off the king's island")]


def make_toll(i, key, name, sub, fn, what):
    @asset(G, f"toll-{key}", group="chapters", title=f"Toll vignette: {name}", w=VW, h=VH, row=ROW)
    def toll(a: Art):
        m = kit.plate(a, m=14)
        clip = a.clip(f'<rect x="30" y="30" width="{VW - 60}" height="{340}"/>')
        a.open("g", clip_path=clip)
        a.rect(30, 30, VW - 60, 340, fill=PAPER)
        fn(a)
        a.close()
        kit.frame(a, 30, 30, VW - 60, 340, sw=1.8, gap=-5)
        kit.smallcaps(a, VW / 2, 398, name, size=19, col=INK if i < 6 else RED)
        kit.italic(a, VW / 2, 420, sub, size=14, col=TEA)
    toll.__doc__ = f"A toll vignette for the Tide Reckoning, engraved, showing no person: {what}."
    return toll


for _i, _t in enumerate(TOLL):
    make_toll(_i, *_t)


# ---- the Wreck Book ----------------------------------------------------------------------------------
BW, BH = 1600, 1000


def book(a, ribbon=True):
    a.paper("#2a1c10", grain=0.35, fibre=0.02)
    a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, "#000", gap=11, sw=1.2, opacity=0.3))
    a.rect(70, 60, BW - 140, BH - 110, rx=10, fill=RED)
    a.rect(70, 60, BW - 140, BH - 110, rx=10, fill="none", stroke="#000", stroke_width=3, opacity=0.5)
    for k in range(4):
        a.rect(92 + k * 3, 78 + k * 3, BW - 184 - k * 6, BH - 150 - k * 3, fill="#d9cfb6", stroke=TEA, stroke_width=0.5)
    L = (104, 90, 690, BH - 170)
    R = (806, 90, 690, BH - 170)
    for (x, y, w, h) in (L, R):
        a.rect(x, y, w, h, fill=LAMP)
        a.rect(x, y + 130, w, h - 150, fill=kit.pattern(a, kit.WASH, gap=38, sw=0.9))
    a.rect(760, 90, 80, BH - 170, fill=a.gradient([(0, "#000"), (0.5, "#000"), (1, "#000")], 0, 0, 1, 0), opacity=0.0)
    gid = a.uid("gut")
    a.defn(f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/>'
           f'<stop offset="0.5" stop-color="#000" stop-opacity="0.4"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>')
    a.rect(720, 90, 160, BH - 170, fill=f"url(#{gid})")
    a.line(800, 90, 800, BH - 80, stroke="#000", stroke_width=1, opacity=0.5)
    if ribbon:
        a.path(f"M786,90 v{BH - 120} l10,-14 l10,14 v{-(BH - 120)}z", fill=GREEN, opacity=0.9)
    return L, R


def head(a, pg, text, sub=None):
    x, y, w, h = pg
    kit.smallcaps(a, x + w / 2, y + 62, text, size=30, col=INK)
    if sub:
        kit.italic(a, x + w / 2, y + 96, sub, size=19, col=TEA)
    a.path(f"M{x + 40},{y + 118} h{w - 80} M{x + 40},{y + 123} h{w - 80}", stroke=RED, stroke_width=1)


def cols(a, pg, xs):
    x, y, w, h = pg
    for u in xs:
        a.line(x + w * u, y + 123, x + w * u, y + h - 30, stroke=RED, stroke_width=0.9)


@asset(G, "wreck-book-account", group="documents", title="Wreck Book: The Sea, Dr.", w=BW, h=BH, row=ROW_W)
def wb_account(a: Art):
    """A spread of the Lord of Tea's book: the account headed The Sea, Dr., entries down both pages in a small
    exact hand, every balanced line ticked in green and the total at the foot carried in red, overdrawn."""
    L, R = book(a)
    head(a, L, "The Sea, Dr.")
    head(a, R, "Cr.")
    for pg, n in ((L, 17), (R, 6)):
        x, y, w, h = pg
        cols(a, pg, (0.12, 0.72, 0.86))
        for j in range(n):
            ly = y + 162 + j * 38
            kit.script(a, x + 16, ly, w * 0.08, size=0.8)
            kit.script(a, x + w * 0.12 + 14, ly, w * (0.3 + 0.25 * ((j * 7) % 5) / 5), size=0.95)
            kit.script(a, x + w * 0.72 + 12, ly, w * 0.1, size=0.9)
            if pg is R or j % 4 != 3:
                kit.tick(a, x + w * 0.88, ly - 2, s=0.9)
    x, y, w, h = L
    a.rect(x + w * 0.72, y + h - 78, w * 0.26, 44, fill="none", stroke=RED, stroke_width=1.6)
    kit.script(a, x + w * 0.72 + 14, y + h - 48, w * 0.2, size=1.3, col=RED)
    kit.smallcaps(a, x + w * 0.7, y + h - 48, "Balance", size=15, col=RED, anchor="end")
    x, y, w, h = R
    kit.company_mark(a, x + w / 2, y + 560, 90, col=INK, opacity=0.14, sw=4)
    a.text(x + w / 2, y + 760, "“You call it wild. In my books it is called unpaid.”", size=23, family="serif", fill=BB,
           text_anchor="middle", font_style="italic")


@asset(G, "wreck-book-lost-list", group="documents", title="Wreck Book: the lost list", w=BW, h=BH, row=ROW_W)
def wb_lost(a: Art):
    """A spread of the Wreck Book's lost lists: names, callings and causes in columns, the quay boy's chalk tallies
    kept in the margin, one entry read out in full, and a porcelain Debt marker set down on it."""
    L, R = book(a)
    head(a, L, "Wreck Book", "the lost lists")
    head(a, R, "Wreck Book")
    for pg in (L, R):
        x, y, w, h = pg
        cols(a, pg, (0.1, 0.42, 0.68))
        for j in range(17):
            ly = y + 162 + j * 38
            if pg is R and j == 6:
                a.rect(x + 4, ly - 28, w - 8, 38, fill=GOLD, opacity=0.22)
                for u, t in ((0.1, "Corran."), (0.42, "Lamp-keeper."), (0.68, "A light went out.")):
                    a.text(x + w * u + 12, ly - 3, t, size=23, family="serif", fill=BB, font_style="italic")
                continue
            if pg is R and j > 6:
                continue
            kit.script(a, x + w * 0.1 + 12, ly, w * (0.16 + 0.1 * ((j * 3) % 4) / 4), size=0.95)
            kit.script(a, x + w * 0.42 + 12, ly, w * (0.14 + 0.08 * ((j * 5) % 3) / 3), size=0.95)
            kit.script(a, x + w * 0.68 + 12, ly, w * (0.18 + 0.1 * (j % 3) / 3), size=0.95)
            if j % 5 == 4:
                a.path(f"M{x + 14},{ly - 22}v22 m9,-22v22 m9,-22v22 m9,-22v22 M{x + 8},{ly - 4}l44,-14", stroke="#8a8578", stroke_width=3,
                       stroke_linecap="round", fill="none", opacity=0.8)
    x, y, w, h = R
    dx, dy = x + w * 0.95, y + 162 + 6 * 38 - 10
    a.ellipse(dx + 4, dy + 8, 34, 14, fill="#000", opacity=0.3)
    a.ellipse(dx, dy, 32, 15, fill=kit.GLAZE, stroke=kit.COB, stroke_width=2.4)
    a.ellipse(dx, dy - 5, 32, 15, fill=kit.GLAZE, stroke=kit.COB, stroke_width=2.4)
    a.ellipse(dx, dy - 5, 20, 8.5, fill=RED)


@asset(G, "wreck-book-open-year", group="documents", title="Wreck Book: the year with no name in it", w=BW, h=BH, row=ROW_W)
def wb_year(a: Art):
    """The last spread of the Wreck Book: on the left the toll carried forward and entered as outstanding, for
    ever; on the right a ruled page with nothing written on it, salt dried in one corner."""
    L, R = book(a)
    head(a, L, "Wreck Book", "carried forward")
    head(a, R, "Wreck Book")
    x, y, w, h = L
    cols(a, L, (0.1, 0.68))
    for j in range(8):
        ly = y + 162 + j * 38
        kit.script(a, x + w * 0.1 + 12, ly, w * (0.3 + 0.12 * (j % 3)), size=0.95)
        kit.script(a, x + w * 0.68 + 12, ly, w * 0.2, size=0.95)
    ly = y + 162 + 9 * 38
    kit.smallcaps(a, x + w * 0.1 + 12, ly, "The toll", size=20, col=RED, anchor="start")
    a.text(x + w * 0.1 + 12, ly + 76, "outstanding, for ever", size=44, family="cursive", fill=SEAINK)
    kit.spiral(a, x + w * 0.82, ly + 66, 2, 34, 3, cw=False, stroke_width=2.6)
    x, y, w, h = R
    cols(a, R, (0.1, 0.42, 0.68))
    kit.salt(a, x + w - 90, y + h - 100, 120)
    kit.salt(a, x + w - 220, y + h - 60, 50)

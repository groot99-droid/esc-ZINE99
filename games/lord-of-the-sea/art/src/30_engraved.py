"""The Engraved Sea: the ten 2D figures, the sea plate, its lamp-black and oiled states and six coast strips."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK, PAPER, SAIL = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK, kit.PAPER, kit.SAIL)
ROW_F = "2D figures: boat ×4, swimmer, cutter, convoy, ferry, skiff, carried person"
ROW_S = "Engraved Sea: procedural sea, 6 coast strips, lamp-black and oiled states"
FW, FH = 600, 420


def fig_base(a, label, wild=True, y=300, amp=8.0):
    m = kit.plate(a, m=16)
    kit.sky(a, m + 10, a.w - m - 10, m + 10, y, gap=7, opacity=0.5)
    if wild:
        kit.sea(a, m + 10, a.w - m - 10, y, a.h - m - 46, rows=7, fn=kit.swell(amp=amp, wl=190, sharp=0.5), step=10)
    else:
        kit.calm(a, m + 10, a.w - m - 10, y, a.h - m - 46, rows=7)
    a.rect(m + 10, a.h - m - 44, a.w - 2 * m - 20, 34, fill=PAPER)
    kit.frame(a, m + 10, m + 10, a.w - 2 * m - 20, a.h - 2 * m - 20, sw=1.5, gap=4)
    a.line(m + 10, a.h - m - 44, a.w - m - 10, a.h - m - 44, stroke=INK, stroke_width=1)
    kit.smallcaps(a, a.w / 2, a.h - m - 21, label, size=16)


def waterline(a, y, x0=30, x1=FW - 30, rows=4, fn=None, col=INK):
    """Water drawn over a hull, so the vessel sits in it."""
    a.rect(x0, y, x1 - x0, 60, fill=PAPER, opacity=0.0)
    kit.sea(a, x0, x1, y, y + 34, rows=rows, fn=fn or kit.swell(amp=5, wl=150, sharp=0.4), step=10, col=col, persp=1)


@asset(G, "boat-full", group="figures", title="Alexi's boat, full sail", w=FW, h=FH, row=ROW_F)
def boat_full(a: Art):
    """Alexi's small old sailing boat under full sail, heeled a little, with the heavy figure at the tiller turning
    one hand in the air."""
    fig_base(a, "The boat, full")
    kit.ship(a, "sloop", 300, 286, 1.75, ang=-5, helm=True)
    kit.spiral(a, 172, 196, 2, 20, 2.5)
    waterline(a, 312)


@asset(G, "boat-spill", group="figures", title="Alexi's boat, spilling wind", w=FW, h=FH, row=ROW_F)
def boat_spill(a: Art):
    """The same boat upright and slow, sails let fly: the mainsail hangs in loose folds off the gaff."""
    fig_base(a, "The boat, spilling wind", amp=4)
    kit.ship(a, "sloop", 300, 290, 1.75, ang=1, helm=True, sails=False)
    for i in range(7):
        x = 208 + i * 16
        a.path(f"M{x},{92 + (6 - i) * 6} q{8 + i},{50} {-4 + i * 2},{100} q-6,34 4,{60 + i * 3}", fill="none", stroke=INK,
               stroke_width=1.3)
    a.path("M314,64 q30,90 96,206", fill="none", stroke=INK, stroke_width=1.2)
    a.path("M318,70 q52,80 56,150 q-20,30 -50,44z", fill=SAIL, stroke=INK, stroke_width=1.4, opacity=0.9)
    waterline(a, 314, fn=kit.swell(amp=2.5, wl=150))


@asset(G, "boat-surf", group="figures", title="Alexi's boat, surfing a face", w=FW, h=FH, row=ROW_F)
def boat_surf(a: Art):
    """The boat running down a wave face bow first, foam at the stem, the crest behind and above it."""
    m = kit.plate(a, m=16)
    fn = kit.plus(kit.swell(amp=6, wl=170, sharp=0.5), kit.bump(150, 190, 150, t0=0.5, tw=0.9))
    kit.sky(a, m + 10, a.w - m - 10, m + 10, 250, gap=7, opacity=0.5)
    kit.sea(a, m + 10, a.w - m - 10, 250, a.h - m - 46, rows=13, fn=fn, step=9, persp=1.1)
    kit.ship(a, "sloop", 348, 246, 1.6, ang=24, helm=True)
    kit.foam(a, [(440 + i * 9, 300 + i * 3) for i in range(7)], n=3)
    kit.foam(a, [(110 + i * 14, 118 + abs(i - 3) * 5) for i in range(8)], n=3)
    a.rect(m + 10, a.h - m - 44, a.w - 2 * m - 20, 34, fill=PAPER)
    kit.frame(a, m + 10, m + 10, a.w - 2 * m - 20, a.h - 2 * m - 20, sw=1.5, gap=4)
    a.line(m + 10, a.h - m - 44, a.w - m - 10, a.h - m - 44, stroke=INK, stroke_width=1)
    kit.smallcaps(a, a.w / 2, a.h - m - 21, "The boat, surfing", size=16)


@asset(G, "boat-capsized", group="figures", title="Alexi's boat, capsized", w=FW, h=FH, row=ROW_F)
def boat_capsized(a: Art):
    """The boat on her side broadside to a steep face, mast in the water, bottles and a hat adrift."""
    m = kit.plate(a, m=16)
    kit.sky(a, m + 10, a.w - m - 10, m + 10, 240, gap=7, opacity=0.5)
    kit.ship(a, "sloop", 300, 262, 1.7, ang=-98)
    a.rect(m + 10, 268, a.w - 2 * m - 20, 110, fill=PAPER)
    kit.sea(a, m + 10, a.w - m - 10, 250, a.h - m - 46, rows=10, fn=kit.swell(amp=13, wl=200, sharp=0.7), step=9, persp=1.1)
    for bx, by, r in ((150, 300, 70), (430, 318, -50), (500, 290, 110)):
        kit.bottle(a, bx, by, 0.42, ang=r, glass=GREEN)
    for k in range(1, 4):
        a.ellipse(300, 276, 70 + k * 40, 5 + k * 3, fill="none", stroke=INK, stroke_width=1)
    a.rect(m + 10, a.h - m - 44, a.w - 2 * m - 20, 34, fill=PAPER)
    kit.frame(a, m + 10, m + 10, a.w - 2 * m - 20, a.h - 2 * m - 20, sw=1.5, gap=4)
    a.line(m + 10, a.h - m - 44, a.w - m - 10, a.h - m - 44, stroke=INK, stroke_width=1)
    kit.smallcaps(a, a.w / 2, a.h - m - 21, "The boat, capsized", size=16)


@asset(G, "cutter", group="figures", title="Revenue cutter", w=FW, h=FH, row=ROW_F)
def cutter(a: Art):
    """A Company revenue cutter in ruled water: black hull, a row of ports, square sails, a red pennant, a grapnel
    line trailing from the bow."""
    fig_base(a, "Revenue cutter", wild=False)
    kit.ship(a, "cutter", 290, 290, 1.25)
    a.path("M470,268 q50,10 70,44", fill="none", stroke=INK, stroke_width=1.3)
    a.path("M540,312 l-8,8 m8,-8 l8,8 m-8,-8 v12", fill="none", stroke=INK, stroke_width=2, stroke_linecap="round")
    kit.calm(a, 30, FW - 30, 318, 350, rows=4, persp=1)


@asset(G, "convoy", group="figures", title="Company convoy", w=FW, h=FH, row=ROW_F)
def convoy(a: Art):
    """Three Company merchantmen in line ahead on a ruled calm, evenly spaced, each the same as the last."""
    fig_base(a, "Convoy", wild=False, y=290)
    for i in range(3):
        kit.ship(a, "merchant", 130 + i * 175, 268 + i * 12, 0.5 + i * 0.09)
    kit.calm(a, 30, FW - 30, 300, 350, rows=5, persp=1)
    for i in range(4):
        kit.buoy(a, 80 + i * 150, 340, 0.7, lit=i == 1)


@asset(G, "ferry", group="figures", title="The Tidewater ferry", w=FW, h=FH, row=ROW_F)
def ferry(a: Art):
    """The Tidewater ferry on its six-minute crossing: a flat double-ended boat with an awning, a rail of
    passengers and a lamp at the bow."""
    fig_base(a, "The ferry", wild=False, y=296)
    kit.ship(a, "ferry", 300, 290, 1.9)
    for i, px in enumerate((190, 214, 246, 262, 300, 330, 350, 392)):
        kit.person(a, px, 284, 24 + (i * 7) % 9 - (9 if i in (3, 6) else 0), skirt=i % 3 == 0)
    a.rect(100, 290, 400, 8, fill=SAIL, stroke=INK, stroke_width=1.2)
    kit.calm(a, 30, FW - 30, 322, 350, rows=3, persp=1)


@asset(G, "skiff", group="figures", title="Reef skiff", w=FW, h=FH, row=ROW_F)
def skiff(a: Art):
    """A Salt Steps reef skiff: a small open boat under a single lugsail, a net over the side with its floats."""
    fig_base(a, "Skiff")
    kit.ship(a, "lugskiff", 290, 292, 2.6, ang=-3)
    kit.person(a, 230, 284, 34)
    a.path("M350,296 q60,10 110,44", fill="none", stroke=INK, stroke_width=1)
    for i in range(5):
        a.circle(372 + i * 22, 304 + i * 8, 4, fill=SAIL, stroke=INK, stroke_width=1.1)
    waterline(a, 312)


@asset(G, "swimmer", group="figures", title="Alexi swimming", w=FW, h=FH, row=ROW_F)
def swimmer(a: Art):
    """Alexi in the Deep, drawn in white line on blue-black: a heavy barefoot man at full stretch, quick as water,
    a stirred current ribboning behind his hand."""
    a.paper(kit.DEEP1, grain=0.25)
    a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, "#1d3b5a"), (1, kit.ABYSS)]), opacity=0.8)
    kit.snow(a, 0, 0, a.w, a.h, n=260)
    pts = [(60 + i * 30, 250 + 40 * math.sin(i * 0.55)) for i in range(12)]
    a.path(a.smooth_d(pts), fill="none", stroke=SEAINK, stroke_width=16, opacity=0.35, stroke_linecap="round")
    a.path(a.smooth_d(pts), fill="none", stroke="#7fd6bd", stroke_width=2.2, stroke_linecap="round")
    kit.swimmer(a, 310, 190, 1.9, ang=-14, kick=1)
    for i in range(7):
        a.circle(470 + i * 9, 90 - i * 9 + (i % 2) * 8, 2 + i % 3, fill="none", stroke=kit.LINE, stroke_width=0.9)
    kit.frame(a, 22, 22, a.w - 44, a.h - 44, col=kit.LINE, sw=1.2, gap=4)
    kit.smallcaps(a, a.w / 2, a.h - 38, "The swimmer", size=16, col=kit.LINE)


@asset(G, "carried-person", group="figures", title="Alexi carrying a person up", w=FW, h=FH, row=ROW_F)
def carried(a: Art):
    """Alexi rising through the Deep with a living person held in both arms; the air is theirs, a thin string of
    bubbles climbing from them toward the light."""
    a.paper(kit.DEEP1, grain=0.25)
    a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, "#2a5a7c"), (1, kit.ABYSS)]), opacity=0.85)
    for i in range(5):
        a.path(f"M{160 + i * 90},0 l{-70 - i * 8},{a.h} h{46} l{60 + i * 8},{-a.h}z", fill=FOAM, opacity=0.05)
    kit.snow(a, 0, 0, a.w, a.h, n=220)
    kit.swimmer(a, 250, 226, 1.4, ang=-50, carry=True)
    for i in range(9):
        a.circle(372 + 12 * math.sin(i * 1.3), 130 - i * 12, 2.2 + (i % 3) * 1.3, fill="none", stroke=FOAM, stroke_width=1)
    kit.frame(a, 22, 22, a.w - 44, a.h - 44, col=kit.LINE, sw=1.2, gap=4)
    kit.smallcaps(a, a.w / 2, a.h - 38, "The carried person", size=16, col=kit.LINE)


# ---- the sea plate and its states --------------------------------------------------------------------

def chart_strip(a, m, ink=INK, paper=PAPER):
    a.rect(m, m, a.w - 2 * m, 62, fill=paper, stroke=ink, stroke_width=1.4)
    a.path(a.smooth_d([(m + 30 + i * 96, m + 36 + 9 * math.sin(i * 0.9)) for i in range(16)]), fill="none", stroke=ink,
           stroke_width=1.2, stroke_dasharray="8 5")
    coast = [(m + 400 + i * 60, m + 20 + 9 * math.sin(i * 1.7) + 5 * math.sin(i * 0.6)) for i in range(20)]
    a.path(a.smooth_d(coast) + f" L{a.w - m},{m} L{m + 400},{m}Z", fill=ink, opacity=0.14)
    a.path(a.smooth_d(coast), fill="none", stroke=ink, stroke_width=1)
    a.circle(m + 510, m + 44, 6, fill=RED, stroke=ink, stroke_width=1)
    a.line(m + 510, m + 44, m + 510, m + 20, stroke=ink, stroke_width=1.2)
    a.circle(a.w - m - 40, m + 40, 9, fill="none", stroke=ink, stroke_width=1.4)
    a.circle(a.w - m - 40, m + 40, 3, fill=ink)


def margins(a, m, ink=INK, paper=PAPER):
    a.rect(m, a.h - m - 30, 420, 12, fill=paper, stroke=ink, stroke_width=1)
    for i in range(0, 8, 2):
        a.rect(m + i * 52.5, a.h - m - 30, 52.5, 12, fill=ink)
    kit.italic(a, m + 440, a.h - m - 19, "nautical miles", size=15, col=ink, anchor="start")


@asset(G, "sea-plate", group="backdrops", title="The Engraved Sea: the sea plate", w=1600, h=900, row=ROW_S)
def sea_plate(a: Art):
    """The Engraved Sea's backdrop: a copperplate sea of wave lines that swell on their faces, a ruled sky with
    scalloped clouds, the chart strip across the top margin, a compass rose and a scale bar below."""
    m = kit.plate(a, m=30)
    chart_strip(a, m + 12)
    top, hz = m + 90, 330
    kit.sky(a, m + 12, a.w - m - 12, top, hz, sun=(250, hz - 8, 34))
    for (cx, cy, cw) in ((420, 210, 360), (900, 170, 300), (1240, 250, 280)):
        kit.cloud(a, cx, cy, cw, n=6)
    a.rect(m + 12, hz, a.w - 2 * m - 24, a.h - hz - m - 12, fill=GREEN, opacity=0.1)
    fn = kit.plus(kit.swell(amp=24, wl=420, sharp=0.55), kit.swell(amp=7, wl=130, drift=-60, ph=2))
    kit.sea(a, m + 12, a.w - m - 12, hz, a.h - m - 50, rows=40, fn=fn, sw=(0.45, 2.2), step=13, shade=0.2)
    a.line(m + 12, hz, a.w - m - 12, hz, stroke=INK, stroke_width=1.3)
    a.circle(a.w - m - 120, a.h - m - 120, 86, fill=PAPER, opacity=0.9)
    kit.rose(a, a.w - m - 120, a.h - m - 120, 66, labels=False)
    a.rect(m + 12, a.h - m - 52, 620, 40, fill=PAPER, opacity=0.9)
    margins(a, m + 24)
    kit.frame(a, m + 12, top, a.w - 2 * m - 24, a.h - top - m - 12, sw=2, gap=-6)


@asset(G, "sea-lamp-black", group="backdrops", title="The Engraved Sea: lamp-black state", w=1600, h=900, row=ROW_S)
def sea_black(a: Art):
    """The plate of a region whose charter was struck: cut in lamp-black, the lights out, and lit only by the foam
    of one raised crest."""
    a.paper("#0b0c10", grain=0.35)
    m = 42
    ink = "#2a3350"
    chart_strip(a, m, ink="#3a4566", paper="#101219")
    top, hz = m + 78, 330
    fn = kit.plus(kit.swell(amp=22, wl=420, sharp=0.55), kit.swell(amp=7, wl=130, drift=-60, ph=2),
                  kit.bump(820, 210, 190, t0=0.62, tw=0.4))
    kit.sea(a, m, a.w - m, hz, a.h - m - 30, rows=32, fn=fn, col=ink, sw=(0.5, 2.2), step=15, shade=0.2)
    a.line(m, hz, a.w - m, hz, stroke=ink, stroke_width=1.2)
    kit.lighthouse(a, 1320, hz, 130, col=ink, lit=False)
    a.path(f"M1240,{hz} q40,-24 80,-22 q60,2 110,22z", fill=ink)
    # the crest: the only light
    cy = hz + (a.h - m - 30 - hz) * 0.62 ** 1.5
    a.ellipse(820, cy - 150, 300, 150, fill=a.radial([(0, FOAM, 0.34), (0.6, FOAM, 0.07), (1, FOAM, 0)]))
    clip = a.clip(f'<ellipse cx="820" cy="{f(cy - 110)}" rx="330" ry="210"/>')
    kit.sea(a, 440, 1200, hz, a.h - m - 30, rows=32, fn=fn, col=FOAM, sw=(0.5, 2.0), step=15, shade=0.2, mask=clip,
            opacity=0.55)
    crest = [(650 + i * 22, cy + fn(650 + i * 22, 0.62) - 4) for i in range(17)]
    kit.foam(a, crest, n=5, stroke="none", r=(1.2, 5))
    a.stipple(600, cy - 330, 440, 200, n=160, r=(0.6, 2), fill=FOAM, opacity=0.8)
    kit.frame(a, m, top, a.w - 2 * m, a.h - top - m, col="#3a4566", sw=2, gap=-6)
    kit.smallcaps(a, a.w - m - 20, a.h - m - 16, "Struck", size=15, col="#56618a", anchor="end")


@asset(G, "sea-oiled", group="backdrops", title="The Engraved Sea: oiled state", w=1600, h=900, row=ROW_S)
def sea_oiled(a: Art):
    """The sea plate with lamp oil poured on it: inside the slick the wave lines lie down into ruled rings with a
    violet and gold sheen, and nothing there can be stirred."""
    m = kit.plate(a, m=30)
    chart_strip(a, m + 12)
    top, hz = m + 90, 330
    kit.sky(a, m + 12, a.w - m - 12, top, hz, gap=7)
    fn = kit.plus(kit.swell(amp=24, wl=420, sharp=0.55), kit.swell(amp=7, wl=130, drift=-60, ph=2))
    a.rect(m + 12, hz, a.w - 2 * m - 24, a.h - hz - m - 12, fill=GREEN, opacity=0.1)
    kit.sea(a, m + 12, a.w - m - 12, hz, a.h - m - 50, rows=40, fn=fn, sw=(0.45, 2.2), step=13, shade=0.2)
    a.line(m + 12, hz, a.w - m - 12, hz, stroke=INK, stroke_width=1.3)
    cx, cy = 820, 610
    blob = [(cx + (430 + 60 * math.sin(i * 2.1)) * math.cos(i * 0.524), cy + (150 + 26 * math.sin(i * 1.3)) * math.sin(i * 0.524))
            for i in range(12)]
    d = a.smooth_d(blob, closed=True)
    a.path(d, fill=PAPER)
    a.path(d, fill=a.gradient([(0, VIOLET), (0.35, GOLD), (0.6, SEAINK), (1, VIOLET)], 0, 0, 1, 1), opacity=0.42)
    clip = a.clip(f'<path d="{d}"/>')
    a.open("g", clip_path=clip)
    for k in range(1, 15):
        a.ellipse(cx - 60 + k * 9, cy - 8, k * 36, k * 12.5, fill="none", stroke=INK if k % 3 else VIOLET, stroke_width=0.8 + (k % 3) * 0.3,
                  stroke_dasharray=f"{60 + k * 20} {6 + k}", opacity=0.85)
    for k in range(5):
        a.ellipse(cx - 200 + k * 110, cy - 50 + k * 22, 60, 9, fill="#fff", opacity=0.3)
    a.close()
    a.path(d, fill="none", stroke=INK, stroke_width=1.6)
    a.path(d, fill="none", stroke=GOLD, stroke_width=4, opacity=0.5, transform="translate(0,3)")
    kit.frame(a, m + 12, top, a.w - 2 * m - 24, a.h - top - m - 12, sw=2, gap=-6)
    kit.smallcaps(a, a.w - m - 40, a.h - m - 30, "Oiled", size=15, col=TEA, anchor="end")


# ---- coast strips ------------------------------------------------------------------------------------
SW_, SH_ = 1600, 200
GY = 150  # the quay line


def houses(a, x, n, w=30, h=34, gap=4, col=INK, same=True):
    for i in range(n):
        hh = h if same else h * a.rng.uniform(0.7, 1.5)
        hx = x + i * (w + gap)
        a.path(f"M{f(hx)},{GY} v{f(-hh)} l{f(w / 2)},{f(-w * 0.45)} l{f(w / 2)},{f(w * 0.45)} v{f(hh)}z", fill=col)
        a.rect(hx + w * 0.38, GY - hh * 0.62, w * 0.24, hh * 0.24, fill=PAPER)
    return x + n * (w + gap)


def strip_lanes(a):
    a.rect(60, GY - 8, 1500, 8, fill=INK)
    x = houses(a, 90, 9)
    for i in range(14):
        lx = 80 + i * 100
        a.path(f"M{lx},{GY - 8} v-40 m-5,0 h10 v-8 h-10z", fill=GOLD, stroke=INK, stroke_width=1.6)
    # the harbour school and its line of children
    a.path(f"M{x + 40},{GY} v-60 h120 v60z M{x + 30},{GY - 60} l70,-30 l70,30z", fill=INK)
    a.path(f"M{x + 94},{GY - 90} v-30 h12 v30 M{x + 90},{GY - 120} l10,-12 l10,12z", fill=INK)
    a.circle(x + 100, GY - 104, 4, fill=GOLD)
    for i in range(4):
        a.rect(x + 54 + i * 26, GY - 46, 12, 18, fill=PAPER)
    for i in range(11):
        kit.person(a, x + 190 + i * 15, GY - 8, 13 + (i * 5) % 4, skirt=i % 2 == 0)
    kit.person(a, x + 372, GY - 8, 26, arm=-1)
    houses(a, x + 420, 7)
    kit.ship(a, "ferry", 1180, GY + 2, 0.9)
    for i in range(5):
        kit.person(a, 1130 + i * 24, GY - 4, 12)
    for bx in (1340, 1420, 1500):
        kit.ship(a, "skiff", bx, GY + 6, 0.7)
        a.line(bx - 30, GY + 4, bx - 44, GY - 8, stroke=INK, stroke_width=0.8)


def strip_salt(a):
    for (cx, w, steps) in ((240, 360, 4), (720, 460, 5), (1220, 380, 4)):
        for k in range(steps):
            ww = w * (1 - k / steps * 0.8)
            a.rect(cx - ww / 2, GY - (k + 1) * 17, ww, 17, fill=INK if k % 2 == 0 else PAPER, stroke=INK, stroke_width=1.3)
            if k % 2:
                a.rect(cx - ww / 2, GY - (k + 1) * 17, ww, 17, fill=kit.pattern(a, INK, gap=4, sw=0.8, ang=90), opacity=0.7)
        houses(a, cx - 26, 2, w=22, h=16, col=INK)
        a.path(f"M{cx + 60},{GY - 17} v-30 m-22,4 h44 m-44,10 h44", fill="none", stroke=INK, stroke_width=1.6)
        for j in range(4):
            a.path(f"M{cx + 42 + j * 12},{GY - 43} v9 l3,3", fill="none", stroke=INK, stroke_width=1.2)
    for i, bx in enumerate((470, 520, 950, 1010, 1440)):
        kit.ship(a, "lugskiff" if i % 2 else "skiff", bx, GY + 6, 0.7, flip=i % 2 == 0)
    for i, px in enumerate((150, 176, 640, 668, 694, 1150)):
        kit.person(a, px, GY - 17, 13, arm=1)
        a.path(f"M{px + 6},{GY - 30} q16,-12 26,20", fill="none", stroke=INK, stroke_width=0.8)
    kit.person(a, 760, GY - 34, 22)


def strip_strait(a):
    rocks = [(60, 0)]
    x = 60
    while x < 1540:
        x += a.rng.uniform(18, 46)
        rocks.append((x, -a.rng.uniform(4, 26)))
    a.path("M" + " L".join(f"{f(px)},{f(GY + py)}" for px, py in rocks) + f" L1540,{GY} Z", fill=INK)
    for i, lx in enumerate((170, 430, 700, 980, 1250, 1480)):
        kit.lighthouse(a, lx, GY - 14, 78 - (i % 2) * 14, lit=True, beam=(150 if i % 2 else -150))
    for wx in (300, 840, 1120):
        a.path(f"M{wx},{GY - 6} q40,-30 96,-8", fill="none", stroke=INK, stroke_width=2.4)
        for j in range(7):
            a.path(f"M{wx + 8 + j * 12},{GY - 12 - 9 * math.sin(j * 0.5)} q4,-22 -6,-34", fill="none", stroke=INK, stroke_width=1.6)
        a.line(wx + 70, GY - 10, wx + 96, GY - 70, stroke=INK, stroke_width=2)
    houses(a, 560, 1, w=36, h=18)
    kit.person(a, 610, GY - 12, 20, arm=1)
    kit.ship(a, "skiff", 640, GY + 6, 0.8)


def strip_pearl(a):
    a.path(f"M60,{GY} q200,-22 420,-8 q260,14 520,-6 q260,-16 540,14z", fill=PAPER, stroke=INK, stroke_width=1.5)
    a.path(f"M60,{GY} q200,-22 420,-8 q260,14 520,-6 q260,-16 540,14z", fill=kit.pattern(a, INK, gap=4, sw=0.7, ang=-20),
           opacity=0.5)
    for hx in (180, 250, 330, 1180, 1260):
        a.path(f"M{hx - 16},{GY - 12} v-22 M{hx + 16},{GY - 12} v-22 M{hx - 22},{GY - 34} h44 l-22,-20z M{hx - 20},{GY - 34} v-0", fill=INK,
               stroke=INK, stroke_width=2)
    for i, bx in enumerate((520, 720, 930, 1420)):
        kit.ship(a, "diver", bx, GY + 4, 0.9, flip=i % 2 == 1)
        kit.person(a, bx - 26 * (1 if i % 2 == 0 else -1), GY - 2, 15)
    for i in range(9):
        a.circle(600 + i * 100 + (i % 2) * 20, GY + 22 + (i % 3) * 6, 3, fill=PAPER, stroke=INK, stroke_width=1)
    for px in (400, 424, 1100):
        kit.person(a, px, GY - 10, 18, arm=-1)
    a.path(f"M1040,{GY - 6} h40 l-6,-14 h-28z", fill=INK)


def strip_spice(a):
    a.rect(60, GY - 8, 640, 8, fill=INK)
    a.rect(900, GY - 8, 640, 8, fill=INK)
    for x0 in (90, 930):
        x = x0
        for i in range(6):
            w, h = 76, 56 + (i % 3) * 14
            a.path(f"M{x},{GY - 8} v{-h} l{w / 2},{-26} l{w / 2},26 v{h}z", fill=INK)
            for r in range(2):
                for c in range(3):
                    a.rect(x + 12 + c * 20, GY - 8 - h + 10 + r * 20, 9, 12, fill=GOLD if (i + r + c) % 3 else PAPER)
            a.path(f"M{x + w / 2},{GY - 8 - h - 22} h22 v8", fill="none", stroke=INK, stroke_width=1.6)
            x += w + 8
    for cxn in (720, 880):
        a.path(f"M{cxn},{GY - 8} v-90 M{cxn},{GY - 98} l{60 if cxn < 800 else -60},-20 M{cxn + (60 if cxn < 800 else -60)},{GY - 118} v60",
               fill="none", stroke=INK, stroke_width=2.4)
        a.rect(cxn + (52 if cxn < 800 else -68), GY - 58, 16, 12, fill=INK)
    kit.ship(a, "lighter", 800, GY + 6, 0.75)
    kit.calm(a, 700, 900, GY - 30, GY - 4, rows=4, persp=1)
    for i in range(7):
        a.rect(600 + (i % 4) * 18, GY - 22 - (i // 4) * 14, 16, 13, fill=PAPER, stroke=INK, stroke_width=1.2)
    for i, px in enumerate((560, 580, 930, 960, 1000, 1300, 1330)):
        kit.person(a, px, GY - 8, 16 + (i % 2) * 3, arm=(1 if i % 3 == 0 else None))
    a.circle(1010, GY - 30, 4, fill=GOLD, stroke=INK, stroke_width=1)


def strip_halls(a):
    a.path(f"M260,{GY} q160,-40 520,-44 q400,-4 560,44z", fill=INK)
    t = sibling(__file__, "_kit")
    # the halls, small
    x, y, w = 800, GY - 44, 420
    a.open("g", transform=f"translate({x},{y}) scale(0.62) translate({-x},{-y})")
    a.rect(x - w / 2, y - w * 0.16, w, w * 0.16, fill=SAIL, stroke=INK, stroke_width=1.5)
    for i in range(13):
        ax = x - w / 2 + (i + 0.5) * w / 13
        a.path(f"M{f(ax - 10)},{f(y)} v-34 a10,12 0 0,1 20,0 v34z", fill=INK if i != 6 else GOLD)
    a.path(f"M{x - 60},{y - w * 0.16} a60,54 0 0,1 120,0z", fill=SAIL, stroke=INK, stroke_width=1.5)
    a.line(x, y - w * 0.16 - 54, x, y - w * 0.16 - 82, stroke=INK, stroke_width=1.6)
    a.path(f"M{x},{y - w * 0.16 - 82} l26,5 l-26,6z", fill=RED)
    for sx in (-1, 1):
        a.rect(x + sx * w * 0.47 - 14, y - 100, 28, 100, fill=SAIL, stroke=INK, stroke_width=1.5)
        a.path(f"M{x + sx * w * 0.47 - 18},{y - 100} l18,-28 l18,28z", fill=INK)
    a.close()
    kit.ship(a, "galley", 1240, GY + 4, 0.85)
    kit.ship(a, "supply", 330, GY + 6, 0.75, flip=True)
    for i, px in enumerate((1010, 1030, 1050, 1070, 1090, 560, 600)):
        kit.person(a, px, GY - 30 + (i > 4) * 6, 15, arm=(1 if i < 5 else None))
        if i < 5:
            a.line(px + 6, GY - 50, px + 6, GY - 24, stroke=INK, stroke_width=1.4)


STRIPS = [("lanes", "Tidewater", strip_lanes, "the model port: a quay of lamps, identical houses, the harbour school with its line of children, the ferry at its stage"),
          ("salt", "The Salt Steps", strip_salt, "terraced fishing islands on a reef, drying racks, skiffs and children fishing from the steps"),
          ("strait", "The Lamplit Strait", strip_strait, "a chain of Company lights on wreckers' rocks, the ribs of old wrecks between them, the keeper at his door"),
          ("pearl", "The Pearl Banks", strip_pearl, "low banks and stilt huts, diving boats with their davits and lines, floats over the trench"),
          ("spice", "The Spice Mouth", strip_spice, "Company warehouses either side of a river mouth, cranes, a lighter loaded with chests, dockers on the quay"),
          ("halls", "The King's Halls", strip_halls, "the island palace with its sea-gate lit, the king's oarsmen standing with their oars, the galley alongside")]


def make_strip(key, name, fn, what):
    @asset(G, f"coast-{key}", group="backdrops", title=f"Coast strip: {name}", w=SW_, h=SH_, row=ROW_S)
    def strip(a: Art):
        kit.plate(a, m=10, mark=False)
        a.rect(20, 14, a.w - 40, a.h - 28, fill="#fff", opacity=0.2)
        kit.sky(a, 20, a.w - 20, 14, GY, gap=6, opacity=0.4)
        a.open("g", clip_path=a.clip(f'<rect x="20" y="14" width="{a.w - 40}" height="{a.h - 28}"/>'))
        if key == "pearl":
            a.open("g", transform=f"translate(800,{GY}) scale(1.35) translate(-800,{-GY})")
        fn(a)
        if key == "pearl":
            a.close()
        a.close()
        a.rect(20, GY, a.w - 40, a.h - GY - 14, fill=PAPER, opacity=0.55)
        kit.calm(a, 20, a.w - 20, GY + 2, a.h - 18, rows=6, persp=1)
        a.line(20, GY, a.w - 20, GY, stroke=INK, stroke_width=1.2)
        kit.frame(a, 20, 14, a.w - 40, a.h - 28, sw=1.6, gap=-5)
        a.rect(34, 24, 30 + len(name) * 13.5, 28, fill=PAPER, stroke=INK, stroke_width=1)
        kit.smallcaps(a, 48, 44, name, size=15, anchor="start")
    strip.__doc__ = f"The coast strip for {name}, in silhouette: {what}."
    return strip


for _k, _n, _f, _w in STRIPS:
    make_strip(_k, _n, _f, _w)

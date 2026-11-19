"""Corridor race: the passage as an architect's long section (lit, dark, blackout) and its sprites."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
SW, SH = 3200, 520
SX = 47.0
X0 = 96
FL = 300
DOORS = [(8, "401"), (16, "402"), (28, "403"), (36, "404"), (46, "405"), (56, "406")]

THEMES = {
    "lit": dict(bg=kit.DRAFT, ink=kit.INK, fill="#e6dcc4", glow=0.0, grain=0.12, faint=1.0, red="#c0392b"),
    "dark": dict(bg="#14261d", ink="#d9cdaf", fill="#1d3529", glow=0.8, grain=0.2, faint=0.8, red=kit.AMBER),
    "blackout": dict(bg="#060606", ink="#6f7c80", fill="#0c0c0c", glow=1.0, grain=0.25, faint=0.22, red=kit.AMBER),
}


def X(m):
    return X0 + m * SX


def Y(h):
    return FL - h * SX


def _section(key, title, doc):
    @asset(G, f"passage-{key}", group="backdrops", title=f"Passage long section: {title}", w=SW, h=SH,
           row="Passage long section: lit, dark, blackout")
    def draw(a: Art):
        t = THEMES[key]
        ink, fa = t["ink"], t["faint"]
        a.paper(t["bg"], grain=t["grain"], fibre=1.6)
        pen = dict(stroke=ink, fill="none", opacity=fa)
        a.rect(20, 20, SW - 40, SH - 40, stroke_width=2.2, **pen)
        a.rect(28, 28, SW - 56, SH - 56, stroke_width=0.6, **pen)
        x1 = X(64)
        ce = Y(3.0)
        # cut slabs: floor and soffit, hatched and stippled
        for y0, h0 in [(FL, 30), (ce - 26, 26)]:
            cl = a.clip(f'<rect x="{X0}" y="{f(y0)}" width="{f(x1 - X0)}" height="{h0}"/>')
            a.hatch(X0, y0, x1 - X0, h0, angle=45, spacing=9, stroke=ink, stroke_width=0.5, clip=cl, opacity=fa)
            a.open("g", clip_path=cl, opacity=fa)
            a.stipple(X0, y0, x1 - X0, h0, n=900, r=(0.4, 1.1), fill=ink)
            a.close()
            a.rect(X0, y0, x1 - X0, h0, stroke_width=2.6, **pen)
        # end walls, cut
        for xx in (X0 - 14, x1):
            a.rect(xx, ce - 26, 14, FL + 30 - ce + 26, fill=ink, opacity=fa * 0.85)
        # wainscot, dado rail
        a.line(X0, Y(1.0), x1, Y(1.0), stroke=ink, stroke_width=1.4, opacity=fa)
        a.line(X0, Y(1.05), x1, Y(1.05), stroke=ink, stroke_width=0.6, opacity=fa)
        wd, m = [], 0.0
        while m < 64:
            wd.append(f"M{f(X(m))},{f(Y(0.12))}V{f(Y(0.92))}")
            m += 0.6
        a.path("".join(wd), stroke=ink, stroke_width=0.35, fill="none", opacity=fa * 0.8)
        # pipes at the soffit, and the 1926 bell wires above them
        for h in (2.7, 2.6):
            a.line(X0, Y(h), x1, Y(h), stroke=ink, stroke_width=1.0, opacity=fa)
        a.line(X0, Y(2.84), x1, Y(2.84), stroke=t["red"], stroke_width=0.9, stroke_dasharray="14 3 2 3", opacity=max(fa, 0.5))
        m = 0.6
        while m < 64:
            a.rect(X(m) - 4, Y(2.76), 8, 0.22 * SX, stroke=ink, stroke_width=0.8, fill=t["bg"], opacity=fa)
            m += 2.5
        # the light well: windows 18 to 26 m, and the pipe run ledge below them, 16 to 38 m
        for k in range(4):
            wx = X(18.3 + k * 2)
            a.rect(wx, Y(2.4), 1.4 * SX, 1.1 * SX, stroke=ink, stroke_width=1.2, opacity=fa,
                   fill="#cfd8da" if key == "lit" else ("#2b3a44" if key == "dark" else "#080808"))
            a.line(wx + 0.7 * SX, Y(2.4), wx + 0.7 * SX, Y(1.3), stroke=ink, stroke_width=0.6, opacity=fa)
            a.line(wx, Y(1.85), wx + 1.4 * SX, Y(1.85), stroke=ink, stroke_width=0.6, opacity=fa)
        if key == "dark":   # one lit square across the well: a guest at a bathroom window
            a.rect(X(22.5), Y(2.25), 0.5 * SX, 0.36 * SX, fill=kit.LAMPS[1], opacity=0.9)
            a.rect(X(22.3) - 20, Y(2.4) - 20, 1.4 * SX + 20, 1.1 * SX + 30, fill=a.radial([(0, kit.LAMPS[1], 0.4), (1, kit.LAMPS[1], 0)]))
        lx0, lx1 = X(16.6), X(38)
        a.rect(lx0, Y(0.6), lx1 - lx0, 9, fill=t["fill"], stroke=ink, stroke_width=1.4, opacity=fa)
        cl = a.clip(f'<rect x="{f(lx0)}" y="{f(Y(0.6) + 9)}" width="{f(lx1 - lx0)}" height="{f(0.6 * SX - 9)}"/>')
        a.hatch(lx0, Y(0.6) + 9, lx1 - lx0, 0.6 * SX - 9, angle=-45, spacing=7, stroke=ink, stroke_width=0.35, clip=cl, opacity=fa * 0.8)
        for mm in (16.6, 38):   # the steps up
            sgn = -1 if mm < 20 else 1
            for k in range(2):
                a.rect(X(mm) + sgn * (k + (0 if sgn > 0 else 1)) * 12 - (0 if sgn > 0 else 0), Y(0.2 * (2 - k)), 12, 0.2 * (2 - k) * SX,
                       fill=t["fill"], stroke=ink, stroke_width=1, opacity=fa)
        # the office at the west end, the stair door at the east
        ox = X(0.4)
        a.rect(ox, Y(2.1), 0.9 * SX, 2.1 * SX, stroke=ink, stroke_width=1.6, fill=t["fill"], opacity=max(fa, 0.5))
        a.rect(ox + 7, Y(2.0), 0.9 * SX - 14, 0.9 * SX, stroke=ink, stroke_width=0.6, fill="none", opacity=fa)
        sx_ = X(63.1)
        a.rect(sx_, Y(2.1), 0.9 * SX, 2.1 * SX, stroke=ink, stroke_width=1.6, fill=t["fill"], opacity=fa)
        a.path(f"M{f(sx_ + 6)},{f(Y(0.1))} l{f(0.9 * SX - 12)},{f(-1.9 * SX)} M{f(sx_ + 6)},{f(Y(2.0))} l{f(0.9 * SX - 12)},{f(1.9 * SX)}",
               stroke=ink, stroke_width=0.5, fill="none", opacity=fa)
        # linen alcoves at 12 and 50 m; lost-property cabinet at 33 m
        for mm in (12, 50):
            ax = X(mm) - 0.8 * SX
            a.rect(ax, Y(2.2), 1.6 * SX, 2.2 * SX, stroke=ink, stroke_width=1.2, fill="#000" if key != "lit" else "#d9cdaf",
                   opacity=fa * (0.9 if key == "lit" else 0.7))
            for k in range(4):
                a.line(ax, Y(0.5 + k * 0.45), ax + 1.6 * SX, Y(0.5 + k * 0.45), stroke=ink, stroke_width=0.8, opacity=fa)
                for j in range(5):
                    a.rect(ax + 5 + j * 14, Y(0.5 + k * 0.45) - 12, 11, 11, fill="none", stroke=ink, stroke_width=0.5, opacity=fa)
        cx_ = X(33) - 0.5 * SX
        a.rect(cx_, Y(1.8), SX, 1.8 * SX, stroke=ink, stroke_width=1.4, fill=t["fill"], opacity=fa)
        a.line(cx_ + SX / 2, Y(1.8), cx_ + SX / 2, FL, stroke=ink, stroke_width=0.7, opacity=fa)
        a.rect(cx_ + 4, Y(0.42), SX - 8, 0.36 * SX, stroke=ink, stroke_width=0.9, fill="none", opacity=fa)
        a.circle(cx_ + SX / 2, Y(0.24), 2.5, fill=ink, opacity=fa)
        # loose boards 38 to 41 m
        for i, mm in enumerate(range(38, 42)):
            x = X(mm)
            lift = 3 + (i % 2) * 2
            a.poly([(x + 2, FL - lift), (x + SX - 2, FL - lift + (2 if i % 2 else -1)), (x + SX - 2, FL), (x + 2, FL)],
                   fill=t["fill"], stroke=ink, stroke_width=1.2, opacity=fa)
        # sconces between doors (out in the blackout)
        for mm in (4, 12, 22, 32, 41, 51, 60):
            sx2, sy2 = X(mm), Y(2.0)
            if key == "lit":
                a.circle(sx2, sy2 + 6, 44, fill=a.radial([(0, kit.AMBER_L, 0.5), (1, kit.AMBER_L, 0)]))
            elif key == "dark":
                a.circle(sx2, sy2 + 6, 70, fill=a.radial([(0, kit.AMBER, 0.42), (1, kit.AMBER, 0)]))
            a.path(f"M{f(sx2 - 9)},{f(sy2)} h18 l-4,14 h-10 Z", fill=t["fill"] if key != "dark" else kit.AMBER_L, stroke=ink,
                   stroke_width=1, opacity=fa)
            a.line(sx2, sy2 + 14, sx2, sy2 + 22, stroke=ink, stroke_width=1, opacity=fa)
        # the six valet doors and their roses
        for i, (mm, lab) in enumerate(DOORS):
            x, w_, h_ = X(mm) - 0.45 * SX, 0.9 * SX, 2.1 * SX
            a.rect(x, FL - h_, w_, h_, stroke=ink, stroke_width=1.4, fill=t["fill"], opacity=fa)
            a.rect(x + 6, FL - h_ + 6, w_ - 12, h_ * 0.4, stroke=ink, stroke_width=0.6, fill="none", opacity=fa)
            a.rect(x + 6, FL - h_ * 0.5, w_ - 12, h_ * 0.44, stroke=ink, stroke_width=0.6, fill="none", opacity=fa)
            rx, ry = X(mm), Y(1.55)
            lamp = kit.LAMPS[i]
            if t["glow"]:
                a.circle(rx, ry, 46, fill=a.radial([(0, lamp, 0.9 * t["glow"]), (0.4, lamp, 0.35 * t["glow"]), (1, lamp, 0)]))
                a.poly([(rx - 3, ry), (rx + 3, ry), (rx + 30, FL), (rx - 30, FL)], fill=lamp, opacity=0.12 * t["glow"])
                a.ellipse(rx, FL - 2, 30, 5, fill=lamp, opacity=0.55 * t["glow"])
            a.circle(rx, ry, 6, stroke=ink if key == "lit" else kit.BRASS, stroke_width=1.6, fill=lamp if key != "lit" else "none")
            a.circle(rx, ry, 2, fill=kit.INK if key == "lit" else "#fff")
            a.rect(rx - 17, FL - h_ - 22, 34, 16, fill=kit.BRASS if key != "lit" else "none", stroke=ink, stroke_width=0.9,
                   opacity=1 if key != "blackout" else 0.45)
            a.text(rx, FL - h_ - 9, lab, size=13, family="monospace", fill=kit.INK, text_anchor="middle", font_weight="bold",
                   opacity=1 if key != "blackout" else 0.7)
        if key == "blackout":
            # the seventh coin: the office door's own rose, lit, behind you
            rx, ry = ox + 0.45 * SX, Y(1.55)
            a.circle(rx, ry, 46, fill=a.radial([(0, kit.AMBER_L, 0.9), (0.4, kit.AMBER, 0.35), (1, kit.AMBER, 0)]))
            a.ellipse(rx, FL - 2, 30, 5, fill=kit.AMBER_L, opacity=0.55)
            a.circle(rx, ry, 6, stroke=kit.BRASS, stroke_width=1.6, fill=kit.AMBER_L)
            a.circle(rx, ry, 2, fill="#fff")
        # annotation: dimension chain, levels, labels
        ann = ink if key != "blackout" else "#4a5458"
        chain = [0, 8, 16, 28, 36, 46, 56, 64]
        for m1, m2 in zip(chain, chain[1:]):
            kit.dim(a, X(m1), X(m2), FL + 70, f"{(m2 - m1) * 1000:,}".replace(",", " "), ext_from=FL + 30, size=13, color=ann)
        kit.dim(a, X(0), X(64), FL + 110, "PASSAGE  64 000", ext_from=FL + 76, size=14, color=ann)
        kit.dim(a, X(38), X(42), FL + 150, "LOOSE BOARDS 38-41 m", size=12, color=ann)
        kit.dim(a, X(18), X(26), ce - 50, "LIGHT WELL  8 000", ext_from=ce - 26, size=12, color=ann)
        kit.dim(a, X(16.6), X(38), FL + 150, "PIPE RUN  +0.60", size=12, color=ann)
        for h, lab in [(0, "+0.00 FFL"), (1.0, "+1.00 DADO"), (3.0, "+3.00 SOFFIT")]:
            y = Y(h)
            a.poly([(x1 + 22, y), (x1 + 31, y - 8), (x1 + 40, y)], fill="none", stroke=ann, stroke_width=1)
            a.text(x1 + 22, y - 12, lab, size=9, family="monospace", fill=ann)
        for mm, lab in [(0.85, "OFFICE"), (12, "LINEN"), (33, "LOST PROPERTY"), (50, "LINEN"), (63.55, "STAIR")]:
            a.text(X(mm), ce - 36, lab, size=12, family="monospace", fill=ann, text_anchor="middle", letter_spacing=2)
        # title block
        a.rect(SW - 720, SH - 92, 680, 56, stroke_width=1.2, stroke=ann, fill="none")
        a.line(SW - 250, SH - 92, SW - 250, SH - 36, stroke=ann, stroke_width=0.8)
        a.text(SW - 706, SH - 58, "THE CROSSING  -  VALET PASSAGE, 4TH FLOOR", size=15, family="monospace", fill=ann, letter_spacing=1)
        a.text(SW - 706, SH - 42, "VALET SERVICE 1926   LONG SECTION A-A   1:200", size=11, family="monospace", fill=ann, letter_spacing=1)
        a.text(SW - 236, SH - 52, {"lit": "SCONCES LIT", "dark": "SHIFT  23:00-05:00", "blackout": "LIGHTS OUT  01:50"}[key], size=15,
               family="monospace", fill=t["red"], font_weight="bold", letter_spacing=1)
        if key == "blackout":
            a.text(X(30), FL + 196, "WHEN THE LIGHTS GO, FOLLOW THE COINS.", size=13, family="monospace", fill="#4a5458",
                   text_anchor="middle", letter_spacing=3)
    draw.__doc__ = doc
    return draw


_section("lit", "sconces lit", "The whole 64 m valet passage as a technical-pen long section on drafting paper: office, six valet "
         "doors and their roses, linen alcoves, the light-well windows over the pipe run, the lost-property cabinet, the four "
         "loose boards and the stair door, with a dimension chain.")
_section("dark", "the shift", "The same long section printed light on bottle green for the night shift: each rose glows in its "
         "room's own colour of lamp and drops a coin of light, the sconces are amber, and one lit square shows across the light well.")
_section("blackout", "lights out", "The long section in the night-five blackout: the drawing almost gone, six coins of light from "
         "the roses, and a seventh at the west end in the office door.")


# ---- sprites ---------------------------------------------------------------------------------------
def _ground(a, y, x0=20, x1=None, label=None):
    x1 = x1 or a.w - 20
    a.line(x0, y, x1, y, stroke=kit.INK, stroke_width=1.6)
    d = "".join(f"M{f(x)},{f(y)}l-8,8" for x in range(int(x0) + 8, int(x1), 10))
    a.path(d, stroke=kit.INK, stroke_width=0.5, fill="none")
    if label:
        a.text(x1, y + 24, label, size=11, family="monospace", fill=kit.INK, text_anchor="end", letter_spacing=2)


def _limb(a, pts, w, col=kit.INK):
    a.path(a.smooth_d(pts), stroke=col, stroke_width=w, stroke_linecap="round", stroke_linejoin="round", fill="none")


def _tick(a, x, y, h, lab):
    a.line(x, y, x, y - h, stroke=kit.INK, stroke_width=0.6)
    for yy in (y, y - h):
        a.line(x - 5, yy, x + 5, yy, stroke=kit.INK, stroke_width=0.9)
    a.text(x - 8, y - h / 2, lab, size=10, family="monospace", fill=kit.INK, text_anchor="middle",
           transform=f"rotate(-90 {f(x - 8)} {f(y - h / 2)})")


@asset(G, "sprite-watcher", group="figures", title="Race sprite: the watcher, walk, run and crawl", w=840, h=360,
       row="Race sprites (watcher, Dora and trolley, Fenn, wire, seventh coin)")
def watcher(a: Art):
    """The watcher as an architect's scale figure in solid ink, in three poses on one ground line: walking,
    running and crawling below the sill. The head is a plain disc; there is no face."""
    a.paper(kit.DRAFT, grain=0.12, fibre=1.6)
    gy = 300
    _ground(a, gy, label="SCALE FIGURES  1:20")
    # A: walk
    x = 140
    a.path(f"M{x - 22},{gy - 150} Q{x},{gy - 172} {x + 22},{gy - 150} L{x + 30},{gy - 60} L{x - 28},{gy - 60}Z", fill=kit.INK)
    _limb(a, [(x - 6, gy - 66), (x - 18, gy - 30), (x - 26, gy - 2)], 15)
    _limb(a, [(x + 8, gy - 66), (x + 20, gy - 32), (x + 24, gy - 2)], 15)
    a.path(f"M{x - 34},{gy} h22 M{x + 16},{gy} h24", stroke=kit.INK, stroke_width=7, stroke_linecap="round")
    _limb(a, [(x + 18, gy - 144), (x + 30, gy - 108), (x + 26, gy - 78)], 11)
    a.circle(x + 2, gy - 186, 17, fill=kit.INK)
    _tick(a, x - 70, gy, 204, "1 700")
    a.text(x, gy + 44, "A  WALK 1.6 m/s", size=12, family="monospace", fill=kit.INK, text_anchor="middle")
    # B: run
    x = 420
    a.path(f"M{x - 34},{gy - 150} Q{x - 6},{gy - 176} {x + 22},{gy - 162} L{x + 12},{gy - 70} L{x - 44},{gy - 78}Z", fill=kit.INK)
    _limb(a, [(x - 12, gy - 80), (x + 30, gy - 56), (x + 34, gy - 6)], 15)
    _limb(a, [(x - 26, gy - 80), (x - 50, gy - 44), (x - 92, gy - 30)], 15)
    a.path(f"M{x + 28},{gy - 2} h26 M{x - 96},{gy - 40} l-4,18", stroke=kit.INK, stroke_width=7, stroke_linecap="round")
    _limb(a, [(x + 10, gy - 150), (x + 44, gy - 132), (x + 58, gy - 158)], 11)
    _limb(a, [(x - 26, gy - 146), (x - 58, gy - 124), (x - 70, gy - 96)], 11)
    a.circle(x + 26, gy - 190, 17, fill=kit.INK)
    for k in range(3):
        a.line(x - 130 - k * 16, gy - 150 + k * 40, x - 90 - k * 16, gy - 150 + k * 40, stroke=kit.INK, stroke_width=1, stroke_dasharray="8 4")
    a.text(x, gy + 44, "B  RUN 4.0 m/s", size=12, family="monospace", fill=kit.INK, text_anchor="middle")
    # C: crawl, under the dashed sill line
    x = 690
    a.line(x - 120, gy - 120, x + 120, gy - 120, stroke=kit.INK, stroke_width=0.8, stroke_dasharray="10 5")
    a.text(x + 120, gy - 126, "SILL +1.00", size=10, family="monospace", fill=kit.INK, text_anchor="end")
    a.path(f"M{x - 70},{gy - 64} Q{x - 10},{gy - 92} {x + 56},{gy - 76} L{x + 60},{gy - 44} L{x - 66},{gy - 34}Z", fill=kit.INK)
    _limb(a, [(x - 60, gy - 44), (x - 44, gy - 6), (x - 92, gy - 4)], 14)
    _limb(a, [(x + 50, gy - 60), (x + 56, gy - 30), (x + 60, gy - 4)], 11)
    _limb(a, [(x + 34, gy - 60), (x + 26, gy - 30), (x + 16, gy - 4)], 11)
    a.circle(x + 82, gy - 84, 17, fill=kit.INK)
    a.text(x, gy + 44, "C  CRAWL 0.8 m/s", size=12, family="monospace", fill=kit.INK, text_anchor="middle")


@asset(G, "sprite-dora-trolley", group="figures", title="Race sprite: Dora and the linen trolley", w=640, h=360,
       row="Race sprites (watcher, Dora and trolley, Fenn, wire, seventh coin)")
def dora(a: Art):
    """Dora the night maid as a scale figure in ink, apron tied behind, pushing the linen trolley west: folded
    sheets, a laundry sack, and a chalk in her apron pocket."""
    a.paper(kit.DRAFT, grain=0.12, fibre=1.6)
    gy = 296
    _ground(a, gy, label="DORA  -  TROLLEY 0.9 m/s  WEST")
    # trolley
    tx = 90
    a.rect(tx, gy - 150, 230, 122, fill="#e6dcc4", stroke=kit.INK, stroke_width=1.8)
    a.hatch(tx, gy - 84, 230, 56, angle=60, spacing=6, stroke=kit.INK, stroke_width=0.4,
            clip=a.clip(f'<rect x="{tx}" y="{gy - 84}" width="230" height="56"/>'))
    a.line(tx, gy - 84, tx + 230, gy - 84, stroke=kit.INK, stroke_width=1.4)
    for k in range(5):   # folded sheets
        a.rect(tx + 14, gy - 150 - (k + 1) * 11, 120 - k * 4, 11, rx=4, fill="#fbf8ef", stroke=kit.INK, stroke_width=1)
    a.path(f"M{tx + 150},{gy - 150} q-6,-70 30,-74 q38,2 34,74Z", fill="#d9cdaf", stroke=kit.INK, stroke_width=1.4)   # sack
    a.path(f"M{tx + 172},{gy - 222} q8,-14 18,0", fill="none", stroke=kit.INK, stroke_width=1.4)
    for wx in (tx + 34, tx + 196):
        a.circle(wx, gy - 14, 14, fill=kit.DRAFT, stroke=kit.INK, stroke_width=2.4)
        a.circle(wx, gy - 14, 3, fill=kit.INK)
        a.line(wx, gy - 28, wx, gy - 40, stroke=kit.INK, stroke_width=2)
    a.path(f"M{tx + 230},{gy - 150} l34,-24", stroke=kit.INK, stroke_width=4, stroke_linecap="round")
    # Dora
    x = 440
    a.path(f"M{x - 26},{gy - 156} Q{x},{gy - 178} {x + 24},{gy - 156} L{x + 40},{gy - 34} L{x - 44},{gy - 34}Z", fill=kit.INK)
    a.path(f"M{x - 30},{gy - 120} L{x - 44},{gy - 40} L{x - 8},{gy - 40} L{x - 12},{gy - 124}Z", fill="#fbf8ef", stroke=kit.INK, stroke_width=1)
    a.path(f"M{x + 22},{gy - 118} q22,6 14,30 M{x + 22},{gy - 118} q26,-8 20,-30", fill="none", stroke="#fbf8ef", stroke_width=4, stroke_linecap="round")
    a.rect(x - 36, gy - 96, 14, 5, fill=kit.DRAFT, stroke=kit.INK, stroke_width=0.6)   # the chalk
    _limb(a, [(x - 14, gy - 36), (x - 20, gy - 4)], 13)
    _limb(a, [(x + 12, gy - 36), (x + 22, gy - 4)], 13)
    a.path(f"M{x - 34},{gy - 1} h20 M{x + 10},{gy - 1} h22", stroke=kit.INK, stroke_width=7, stroke_linecap="round")
    _limb(a, [(x - 20, gy - 148), (x - 70, gy - 150), (x - 118, gy - 172)], 11)
    a.circle(x - 4, gy - 194, 17, fill=kit.INK)
    a.path(f"M{x - 4},{gy - 212} q26,-6 22,18 q-2,10 -10,12", fill=kit.INK)   # hair pinned up
    a.rect(x - 22, gy - 214, 30, 8, rx=3, fill="#fbf8ef", stroke=kit.INK, stroke_width=1)   # cap band
    a.poly([(60, gy - 80), (36, gy - 70), (60, gy - 60)], fill=kit.INK)
    _tick(a, 580, gy, 150, "TROLLEY 1 100")
    a.text(40, 40, "IN VIEW AT 6 m, SAME LEVEL", size=11, family="monospace", fill=kit.INK, letter_spacing=2)


@asset(G, "sprite-fenn", group="figures", title="Race sprite: Fenn, from behind, at a rose", w=480, h=360,
       row="Race sprites (watcher, Dora and trolley, Fenn, wire, seventh coin)")
def fenn(a: Art):
    """Abel Fenn as a scale figure seen from behind: hat, long overcoat, a cream envelope in one hand, stopped at a
    valet door whose rose is lit. No face is drawn."""
    a.paper(kit.DRAFT, grain=0.12, fibre=1.6)
    gy = 300
    _ground(a, gy, label="THE STRANGER  -  ONE DOOR EVERY 2 MIN")
    # the door he has stopped at
    a.rect(250, gy - 250, 110, 250, fill="#e6dcc4", stroke=kit.INK, stroke_width=1.6)
    a.rect(262, gy - 238, 86, 100, fill="none", stroke=kit.INK, stroke_width=0.6)
    a.rect(262, gy - 120, 86, 108, fill="none", stroke=kit.INK, stroke_width=0.6)
    a.circle(305, gy - 180, 34, fill=a.radial([(0, kit.AMBER_L, 0.95), (1, kit.AMBER, 0)]))
    a.circle(305, gy - 180, 7, fill=kit.AMBER, stroke=kit.INK, stroke_width=1.4)
    x = 170
    a.path(f"M{x - 36},{gy - 164} Q{x},{gy - 186} {x + 36},{gy - 164} L{x + 46},{gy - 26} L{x - 46},{gy - 26}Z", fill=kit.INK)
    a.line(x, gy - 150, x, gy - 30, stroke=kit.DRAFT, stroke_width=0.9)      # the coat's back seam
    a.line(x - 30, gy - 96, x + 30, gy - 96, stroke=kit.DRAFT, stroke_width=0.9)  # half belt
    _limb(a, [(x - 16, gy - 28), (x - 18, gy - 4)], 14)
    _limb(a, [(x + 16, gy - 28), (x + 18, gy - 4)], 14)
    a.path(f"M{x - 30},{gy - 1} h22 M{x + 8},{gy - 1} h22", stroke=kit.INK, stroke_width=7, stroke_linecap="round")
    _limb(a, [(x - 36, gy - 156), (x - 46, gy - 110), (x - 44, gy - 72)], 12)
    _limb(a, [(x + 36, gy - 156), (x + 48, gy - 118), (x + 60, gy - 96)], 12)
    a.poly(kit.rot(kit.box(x + 50, gy - 106, 44, 28), x + 60, gy - 96, -18), fill=kit.PAPER, stroke=kit.INK, stroke_width=1.2)
    a.circle(x, gy - 200, 17, fill=kit.INK)
    a.ellipse(x, gy - 210, 30, 6, fill=kit.INK)
    a.path(f"M{x - 17},{gy - 210} q0,-20 17,-20 q17,0 17,20Z", fill=kit.INK)
    _tick(a, 60, gy, 232, "1 800")
    a.text(40, 40, "STANDS ASIDE 3 s", size=11, family="monospace", fill=kit.INK, letter_spacing=2)


@asset(G, "sprite-bell-wire", group="pieces", title="Race sprite: the bell wire and its pull", w=640, h=300,
       row="Race sprites (watcher, Dora and trolley, Fenn, wire, seventh coin)")
def wire(a: Art):
    """The 1926 bell wire as a technical detail: the wire running through staples above the pipes, a bell crank at
    the corner, and the hand pull on the pipe run, drawn mid-tug with its travel dotted."""
    a.paper(kit.DRAFT, grain=0.12, fibre=1.6)
    pen = dict(stroke=kit.INK, fill="none")
    a.rect(14, 14, a.w - 28, a.h - 28, stroke_width=1.6, **pen)
    for y in (96, 112):
        a.line(30, y, 610, y, stroke=kit.INK, stroke_width=1.2)
    a.hatch(30, 96, 580, 16, angle=80, spacing=14, stroke=kit.INK, stroke_width=0.4, clip=a.clip('<rect x="30" y="96" width="580" height="16"/>'))
    a.line(30, 64, 420, 64, stroke=kit.AMBER, stroke_width=1.8)
    for x in range(70, 420, 70):
        a.path(f"M{x - 5},{72} v-12 h10 v12", stroke_width=1.2, **pen)
    # bell crank
    cx, cy = 440, 64
    a.poly([(cx - 20, cy), (cx, cy - 6), (cx + 6, cy + 24), (cx, cy + 30)], fill="#e6dcc4", stroke=kit.INK, stroke_width=1.4)
    a.circle(cx, cy, 5, fill=kit.INK)
    a.line(cx + 4, cy + 27, cx + 4, 196, stroke=kit.AMBER, stroke_width=1.8)
    a.line(cx + 24, cy + 27, cx + 24, 222, stroke=kit.INK, stroke_width=0.8, stroke_dasharray="2 5")
    # the pull: a turned wooden handle, at rest (dotted) and tugged
    a.path(f"M{cx + 12},222 h24 l4,34 h-32Z", stroke_width=0.8, stroke_dasharray="3 3", **pen)
    a.path(f"M{cx - 8},196 h24 l4,34 h-32Z", fill=kit.BRASS_L, stroke=kit.INK, stroke_width=1.4)
    a.hatch(cx - 14, 196, 36, 34, angle=0, spacing=5, stroke=kit.INK, stroke_width=0.4, clip=a.clip(f'<path d="M{cx - 8},196 h24 l4,34 h-32Z"/>'))
    # the bell inside the room, rung
    kit.bell(a, 560, 190, 54, fill="#e6dcc4", stroke=kit.INK)
    a.line(440, 58, 560, 58, stroke=kit.AMBER, stroke_width=1.8, stroke_dasharray="6 4")
    a.line(560, 58, 560, 152, stroke=kit.AMBER, stroke_width=1.8, stroke_dasharray="6 4")
    for k in (1, 2):
        a.path(f"M{560 - 34 - k * 10},{176} q-8,14 0,28 M{560 + 34 + k * 10},{176} q8,14 0,28", stroke_width=1, **pen)
    a.text(40, 150, "ONE TUG PER ROOM", size=13, family="monospace", fill=kit.INK, letter_spacing=2)
    a.text(40, 170, "PER NIGHT", size=13, family="monospace", fill=kit.INK, letter_spacing=2)
    a.text(40, 204, "GUEST TO MAIN DOOR", size=11, family="monospace", fill=kit.INK, letter_spacing=1)
    a.text(40, 220, "20 s      SUSPICION +10", size=11, family="monospace", fill=kit.EVIDENCE, letter_spacing=1)
    a.text(40, 266, "DETAIL 4   BELL WIRE, 1926", size=13, family="monospace", fill=kit.INK, font_weight="bold", letter_spacing=2)
    kit.dim(a, 70, 420, 44, "WIRE ABOVE PIPE RUN", size=10)


@asset(G, "sprite-seventh-coin", group="pieces", title="Race sprite: the seventh coin", w=480, h=360,
       row="Race sprites (watcher, Dora and trolley, Fenn, wire, seventh coin)")
def seventh_coin(a: Art):
    """The seventh coin of light in the blackout: the office door at the far west end, the lens in it lit from
    inside, a round patch of amber on the boards, and the edge of a figure crossing it."""
    a.rect(0, 0, a.w, a.h, fill="#050505")
    kit.door_wood(a, 150, 30, 180, 270, base="#0d0a08", lines=16, op=0.12)
    a.rect(150, 30, 180, 270, fill="none", stroke="#3a2a18", stroke_width=2)
    a.rect(170, 50, 140, 110, fill="none", stroke="#2a1c10", stroke_width=1.5)
    a.rect(170, 180, 140, 100, fill="none", stroke="#2a1c10", stroke_width=1.5)
    a.rect(0, 300, a.w, 60, fill="#080706")
    for x in range(0, a.w, 60):
        a.line(x, 300, x - 30, 360, stroke="#1a140e", stroke_width=1)
    cx, cy = 240, 128
    a.poly([(cx - 4, cy), (cx + 4, cy), (cx + 90, 330), (cx - 90, 330)], fill=kit.AMBER_L, opacity=0.1)
    a.ellipse(cx, 330, 96, 18, fill=a.radial([(0, kit.AMBER_L, 0.9), (0.7, kit.AMBER, 0.45), (1, kit.AMBER, 0)]))
    kit.set_nick_bg(a, "#0d0a08")
    kit.rose(a, cx, cy, 22, lit=kit.AMBER_L)
    # the figure: a dark edge taking a bite out of the coin
    a.path("M300,360 L292,250 Q290,206 318,196 Q352,190 360,236 L372,360Z", fill="#020202")
    a.ellipse(326, 176, 21, 24, fill="#020202")
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#000", 0), (0.6, "#000", 0.3), (1, "#000", 0.9)], cx=0.5, cy=0.55, r=0.7))
    a.rect(214, 8, 52, 18, rx=2, fill=kit.BRASS, opacity=0.5)
    a.text(240, 22, "400", size=13, family="serif", fill="#1a1008", text_anchor="middle", font_weight="bold")

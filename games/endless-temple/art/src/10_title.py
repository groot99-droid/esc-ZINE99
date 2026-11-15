"""Title lockup and the nine chapter headings, gold-tooled."""
import math

from artkit import Art, asset, f, sibling

K = sibling(__file__, "_kit")
M = sibling(__file__, "_motifs")
ROW = "Title lockup and nine chapter headings, gold-tooled"


def blind_shelves(a, x, y, w, h, rows=5, op=0.5):
    """Shelves of spines pressed blind (no gold) into the leather."""
    d = []
    rh = h / rows
    for j in range(rows):
        yy = y + (j + 1) * rh
        d.append(f"M{f(x)},{f(yy)}H{f(x + w)}")
        xx = x + a.rng.uniform(2, 10)
        while xx < x + w - 4:
            hh = rh * a.rng.uniform(0.5, 0.88)
            if a.rng.random() < 0.07:
                d.append(f"M{f(xx)},{f(yy)}l{f(rh * .25)},{f(-hh)}")
                xx += rh * .3
            else:
                d.append(f"M{f(xx)},{f(yy)}v{f(-hh)}")
            xx += a.rng.uniform(5, 15)
    a.path("".join(d), fill="none", stroke="#150A05", stroke_width=1.6, opacity=op)
    a.path("".join(d), fill="none", stroke="#8A5A3A", stroke_width=0.6, opacity=op * .6, transform="translate(1 1.2)")


@asset(K.G, "title-lockup", group="title", title="The Endless Temple: title lockup", w=1600, h=500, row=ROW)
def title_lockup(a: Art):
    """The title tooled in gold on walnut leather: THE ENDLESS TEMPLE between blind-pressed shelves that
    run off both edges, an open book at the centre spilling silver sand along the baseline, and one
    sunbeam crossing the cover from the upper left."""
    K.leather(a, "#3A2114", vig=0.75)
    g = K.gold(a)
    blind_shelves(a, 0, 20, 1600, 460, rows=6, op=0.55)
    # a cleared panel for the lettering
    a.path("M130,96 H1470 Q1500,96 1500,126 V374 Q1500,404 1470,404 H130 Q100,404 100,374 V126 Q100,96 130,96Z",
           fill="#2C170D", opacity=.93)
    K.fillet(a, 100, 96, 1400, 308, g, wd=5, inner=12, rx=30)
    K.roll(a, 124, 120, 1352, 260, g, step=22, size=3.6)
    K.sunbeam(a, 0, -60, 1250, 520, 60, 260, op=0.22)
    # THE
    K.gold_text(a, 800, 168, "T H E", 34, g, spacing=10)
    a.path("M560,158 H730 M870,158 H1040", stroke=g, stroke_width=1.6, fill="none")
    for x in (548, 1052):
        a.path(f"M{x},152 l6,6 l-6,6 l-6,-6Z", fill=g)
    # ENDLESS: wide, with a hairline that leaves the panel on both sides
    K.gold_text(a, 800, 268, "ENDLESS", 112, g, spacing=26)
    K.gold_text(a, 800, 356, "TEMPLE", 74, g, spacing=44)
    a.path("M0,372 H470 M1130,372 H1600", stroke=g, stroke_width=2.2, fill="none")
    a.path("M0,380 H452 M1148,380 H1600", stroke=g, stroke_width=.9, fill="none")
    for x, s in ((300, .5), (1300, .5)):
        K.fleuron(a, x, 340, s, 45, fill=g, eye="#2C170D")
    # the open book and its sand, below the panel
    bx, by = 800, 446
    a.path(f"M{bx},{by - 22} C{bx - 30},{by - 36} {bx - 80},{by - 34} {bx - 110},{by - 22} V{by + 14} "
           f"C{bx - 80},{by + 2} {bx - 30},{by} {bx},{by + 14} C{bx + 30},{by} {bx + 80},{by + 2} {bx + 110},{by + 14} "
           f"V{by - 22} C{bx + 80},{by - 34} {bx + 30},{by - 36} {bx},{by - 22}Z", fill="#2C170D", stroke=g, stroke_width=2.6,
           stroke_linejoin="round")
    a.path(f"M{bx},{by - 22} V{by + 14} M{bx - 92},{by - 16} q40,-10 78,2 M{bx - 92},{by - 6} q40,-10 78,2 "
           f"M{bx + 92},{by - 16} q-40,-10 -78,2 M{bx + 92},{by - 6} q-40,-10 -78,2", stroke=g, stroke_width=1.2, fill="none")
    K.sand(a, 380, 462, 840, 34, n=900, r=(0.6, 1.9),
           density=lambda x, y: max(0, 1 - abs(x - 800) / 420) * (0.3 + 0.7 * (y - 462) / 34))
    K.sand(a, 690, 440, 220, 30, n=260, r=(0.6, 1.6), density=lambda x, y: 1 - abs(x - 800) / 110)
    # sunbeam catch-light on the E
    K.glow(a, 420, 230, 150, K.GOLD_L, 0.16)


LEATHERS = ["#4A2B18", "#5B3A1E", "#3F2A1A", "#6B4A26", "#34404C", "#70502A", "#4E4438", "#141C28", "#5E4A30"]


DESCS = [
    "a window and its beam", "a fire and a rising voice", "a broom and swept sand", "a breaking wave of sand",
    "an umbrella in rain", "a pole in a ring of stones", "three lanterns on a line", "one candle", "three backs on a horizon",
]


def heading(a, i):
        name = K.CHAPTERS[i][1]
        K.leather(a, LEATHERS[i], vig=0.6)
        g = K.gold(a)
        ground = LEATHERS[i]
        K.fillet(a, 26, 26, 1548, 248, g, wd=4, inner=10, rx=6)
        # numeral roundel with the chapter's emblem
        cx, cy = 170, 150
        a.circle(cx, cy, 96, fill="#1A0E08", opacity=.55)
        a.circle(cx, cy, 96, fill="none", stroke=g, stroke_width=4)
        a.circle(cx, cy, 86, fill="none", stroke=g, stroke_width=1.2)
        d = "".join(f"M{f(cx + 91 * math.cos(t))},{f(cy + 91 * math.sin(t))}m-1.6,0a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0"
                    for t in (2 * math.pi * k / 40 for k in range(40)))
        a.path(d, fill=g)
        a.open("g", transform=f"translate({cx} {cy - 6}) scale(1.18)")
        M.EMBLEMS[i](a, g)
        a.close()
        K.gold_text(a, cx, cy + 78, K.ROMAN[i], 22, g, spacing=3)
        # the name
        up = name.upper()
        size = 74 if len(up) < 18 else 62 if len(up) < 24 else 50
        sp = 8 if len(up) < 18 else 5 if len(up) < 24 else 3
        K.gold_text(a, 900, 150 + size * .34, up, size, g, spacing=sp)
        # rules either side of a small diamond, above and below the name
        for y in (66, 234):
            a.path(f"M320,{y} H860 M940,{y} H1480", stroke=g, stroke_width=1.6, fill="none")
            a.path(f"M900,{y - 8} l10,8 l-10,8 l-10,-8Z", fill=g)
            a.path(f"M872,{y} l8,0 M920,{y} l8,0", stroke=g, stroke_width=3, fill="none", stroke_linecap="round")
        K.fleuron(a, 1500, 150, 0.62, 45, fill=g, eye=ground)
        # sand gathers along the lower fillet as the chapters go on (the leak)
        if i >= 2:
            n = 60 * i
            K.sand(a, 300, 252, 1200, 18, n=n * 3, r=(0.6, 1.7),
                   density=lambda x, y: (0.25 + 0.75 * (y - 252) / 18) * (0.5 + 0.5 * math.sin(x / 90 + i)))
        if i == 7:  # the unlit shelf: frost on the upper fillet
            K.stip(a, 30, 28, 1540, 30, n=700, r=(0.5, 1.4), fill="#DCE6F2", opacity=.7,
                      density=lambda x, y: 1 - (y - 28) / 30)


for _i, (_cid, _name) in enumerate(K.CHAPTERS):
    K.reg(f"heading-{_cid}", "title", f"Chapter heading {K.ROMAN[_i]}: {_name}", 1600, 300, ROW,
          f"Chapter {K.ROMAN[_i]}, {_name}, tooled in gold on a strip of leather: the numeral in a dotted roundel under "
          f"{DESCS[_i]}, the name between ruled lines, and silver sand gathering along the lower fillet as the book leaks.",
          heading, _i)

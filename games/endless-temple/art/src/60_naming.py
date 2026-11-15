"""The Naming: twenty-four tooling stamps and four cartouches, in bookbinder's gold on leather."""
import math

from artkit import Art, f, sibling

K = sibling(__file__, "_kit")
M = sibling(__file__, "_motifs")
ROW = "Tooling stamps (24) and cartouches (4)"

THREAD = {
    # leather, darker ground for the sunk panel, frame
    "place": ("#6B4423", "#4E3018", "square"),
    "person": ("#5E2A1E", "#431B12", "cut"),
    "want": ("#3F4A36", "#2B3425", "arch"),
}


def frame_d(kind, x0, y0, x1, y1, c=18):
    if kind == "cut":
        return (f"M{x0 + c},{y0} H{x1 - c} L{x1},{y0 + c} V{y1 - c} L{x1 - c},{y1} H{x0 + c} L{x0},{y1 - c} V{y0 + c}Z")
    if kind == "arch":
        return f"M{x0},{y1} V{y0 + 40} Q{x0},{y0} {(x0 + x1) / 2},{y0} Q{x1},{y0} {x1},{y0 + 40} V{y1}Z"
    return f"M{x0},{y0} H{x1} V{y1} H{x0}Z"


def stamp(a: Art, idx):
    sid, word, thread, fn = M.STAMPS[idx]
    col, sunk, kind = THREAD[thread]
    K.leather(a, col, vig=.5, rx=10)
    g = K.gold(a, 120)
    # the sunk panel and its fillets
    a.path(frame_d(kind, 16, 16, 184, 150), fill=sunk, opacity=.85)
    a.path(frame_d(kind, 16, 16, 184, 150), fill="none", stroke="#140904", stroke_width=5, opacity=.5,
           transform="translate(1.5 2)")
    a.path(frame_d(kind, 16, 16, 184, 150), fill="none", stroke=g, stroke_width=3)
    a.path(frame_d(kind, 23, 23, 177, 143, 14), fill="none", stroke=g, stroke_width=.9)
    # the motif: a pressed shadow under the gold
    for dx, dy, paint, op in ((1.6, 2.2, "#140904", .7), (0, 0, g, 1)):
        a.open("g", transform=f"translate({100 + dx} {84 + dy}) scale(1.06)", opacity=op)
        fn(a, paint)
        a.close()
    # the word, on its own small plate
    size = 19 if len(word) < 7 else 16 if len(word) < 10 else 13.5
    K.gold_text(a, 100, 180, word, size, g, spacing=2.4 if len(word) < 10 else 1.2)
    a.path("M30,160 H170", stroke=g, stroke_width=.8, fill="none")
    for x in (22, 178):
        a.path(f"M{x},160 l4,-4 l4,4 l-4,4Z" if x < 100 else f"M{x},160 l-4,-4 l-4,4 l4,4Z", fill=g)
    K.grain(a, 0, 0, 200, 200, .12, .9)


for _i, (_sid, _word, _thread, _fn) in enumerate(M.STAMPS):
    K.reg(f"stamp-{_sid}", "pieces", f"Tooling stamp: {_word.title()} ({_thread})", 200, 200, ROW,
          f"A leather tile from the {_thread.title()} tray, stamped in gold: " + " ".join((_fn.__doc__ or
          {"desert": "a half sun on a flat horizon.", "eternity": "dune lines closing on a far point.",
           "sand-sea": "a breaking wave of sand.", "dunes": "three dunes in shrinking weights of gold.",
           "silver": "five four-pointed glints.", "moon": "a crescent and three stars.",
           "vines": "a web of vine with six leaves.", "waves": "three rows of scalloped waves.",
           "explorer": "a staff and a patched pack.", "lizard": "a lizard seen from above.",
           "leaf": "one broad woody leaf."}[_sid]).split()) + f" Below it, the word {_word}.", stamp, _i)


# ---- cartouches ----------------------------------------------------------------------------------
def slot(a, x, y, w, h=58):
    """A blind impression waiting for a tile."""
    a.rect(x, y, w, h, rx=6, fill="#000", opacity=.32)
    a.rect(x, y, w, h, rx=6, fill="none", stroke="#140904", stroke_width=3, opacity=.7)
    a.rect(x + 1.5, y + 2, w, h, rx=6, fill="none", stroke="#C9A06A", stroke_width=.9, opacity=.35)
    a.rect(x + 5, y + 5, w - 10, h - 10, rx=4, fill="none", stroke="#C9A06A", stroke_width=.8, opacity=.3, stroke_dasharray="6 5")


def gutter(a, kind):
    """The gutter at the page's right edge, running with whatever the book is made of."""
    a.rect(1120, 30, 46, 360, fill="#000", opacity=.4)
    if kind == "sand":
        K.sand(a, 1122, 30, 42, 360, n=520, r=(.6, 1.7), density=lambda x, y: .4 + .6 * abs(math.sin(y / 40)))
    elif kind == "rain":
        d = "".join(f"M{f(a.rng.uniform(1124, 1162))},{f(a.rng.uniform(30, 360))}v{f(a.rng.uniform(10, 34))}" for _ in range(60))
        a.path(d, stroke="#C9D3DE", stroke_width=1.6, stroke_linecap="round", fill="none", opacity=.85)
    elif kind == "ink":
        for x in (1130, 1143, 1156):
            K.pen(a, [(x, 30), (x + a.rng.uniform(-4, 4), 180), (x + a.rng.uniform(-4, 4), a.rng.uniform(280, 380))], w=7,
                  color="#0E0A08", taper=(0, .4))
        K.stip(a, 1122, 300, 42, 90, n=30, r=(1, 2.4), fill="#0E0A08", opacity=.9)
    else:
        a.path("M1143,40 V380", stroke="#C9A06A", stroke_width=.8, opacity=.4)


def c_hedgehog(a, g):
    P = ("M110,210 C110,120 190,80 300,80 L820,80 C930,80 1010,120 1010,210 C1010,300 930,340 820,340 L300,340 "
         "C190,340 110,300 110,210Z")
    return P, "#3E4A2E", "none", [("t", "THE", 200), ("s", 190), ("s", 190), ("t", "OF", 0), ("s", 190)]


def c_hollin(a, g):
    P = ("M110,210 L150,170 L150,90 L240,90 Q560,60 880,90 L970,90 L970,170 L1010,210 L970,250 L970,330 L880,330 "
         "Q560,360 240,330 L150,330 L150,250Z")
    return P, "#34404C", "rain", [("s", 230), ("s", 230), ("s", 230)]


def c_procession(a, g):
    P = "M110,210 L230,80 L890,80 L1010,210 L890,340 L230,340Z"
    return P, "#4E4438", "ink", [("s", 200), ("t", "OF", 0), ("s", 200), ("s", 200)]


def c_sand(a, g):
    P = ("M110,210 C110,150 140,150 150,120 C160,90 200,80 240,80 L880,80 C920,80 960,90 970,120 C980,150 1010,150 1010,210 "
         "C1010,270 980,270 970,300 C960,330 920,340 880,340 L240,340 C200,340 160,330 150,300 C140,270 110,270 110,210Z")
    return P, "#6B4A26", "sand", [("t", "THE", 0), ("s", 150), ("s", 150), ("t", "AND THE", 0), ("s", 150), ("s", 150)]


CARTS = [
    ("c1", "yesterday's book", c_hedgehog,
     "The cartouche for yesterday's book on green leather: an oval with THE and OF set in gold and three blind slots, "
     "apple-leaf stamps at its ends, the gutter still."),
    ("c5", "the Hollin book", c_hollin,
     "The cartouche for the Hollin book on slate leather: a notched panel with three blind slots, cloud stamps, and "
     "rain running down the gutter."),
    ("c7", "the Procession's book", c_procession,
     "The cartouche for the Procession's book on grey-brown leather: a long hexagon with OF in gold and three blind "
     "slots, lantern stamps, and ink running in the gutter."),
    ("c9", "the sand book, with the scraped title", c_sand,
     "The sand book's cartouche under raking light: four blind slots between THE and AND THE, and under them the "
     "ghost of a scraped title in another hand, The Desert That Ends; sand runs in the gutter."),
]


def cartouche(a: Art, idx):
    cid, _, fn, _doc = CARTS[idx]
    g = K.gold(a)
    P, col, gut, parts = fn(a, g)
    K.leather(a, col, vig=.6)
    K.fillet(a, 22, 22, 1080, 376, g, wd=4, inner=10)
    K.roll(a, 44, 44, 1036, 332, g, step=24, size=3.6)
    a.path(P, fill="#000", opacity=.3)
    a.path(P, fill="none", stroke="#140904", stroke_width=6, opacity=.5, transform="translate(2 3)")
    a.path(P, fill="none", stroke=g, stroke_width=4.5)
    a.path(P, fill="none", stroke=g, stroke_width=1.1, transform="translate(560 210) scale(.955 .9) translate(-560 -210)")
    # end ornaments, one kind for each book
    for sx in (-1, 1):
        cx = 560 + sx * 486
        if cid == "c1":
            for r in (-40, 0, 40):
                a.path(K.leaf_d(cx, 210, 34, math.radians(r + (180 if sx < 0 else 0)), .4), fill=g)
            a.circle(cx, 210, 7, fill=g)
        elif cid == "c5":
            a.path(f"M{cx - 22},218 a12,12 0 0,1 8,-22 a16,16 0 0,1 30,0 a12,12 0 0,1 6,22Z", fill=g)
            a.path(f"M{cx - 12},228 l-4,12 M{cx},228 l-4,12 M{cx + 12},228 l-4,12", stroke=g, stroke_width=2.4, stroke_linecap="round")
        elif cid == "c7":
            a.open("g", transform=f"translate({cx} 214) scale(.55)")
            M.lanterns(a, g)
            a.close()
        else:
            a.open("g", transform=f"translate({cx} 210) scale(.5)")
            M.sand_sea(a, g)
            a.close()
    # the scraped title: Maudric could not make it take
    if cid == "c9":
        rough = a.roughen(3, .08)
        a.path("M250,140 l620,20 M240,190 l640,-14 M260,250 l600,10 M250,290 l620,-20", stroke="#2A1608", stroke_width=14,
               opacity=.22, filter=rough)
        base = dict(size=52, family="cursive", font_style="italic", text_anchor="middle", letter_spacing=3,
                    transform="rotate(-2.5 560 210)")
        a.text(562, 232, "The Desert That Ends", fill="#1A0D05", opacity=.5, **base)
        a.text(560, 229, "The Desert That Ends", fill="#D9B878", opacity=.3, **base)
    # the template: connectors in gold, slots blind
    rows = [parts] if len(parts) <= 4 else [parts[:3], parts[3:]]
    for ri, row in enumerate(rows):
        widths = [p[1] if p[0] == "s" else len(p[1]) * 30 + 24 for p in row]
        tot = sum(widths) + 22 * (len(row) - 1)
        x = 560 - tot / 2
        y = 210 - 29 if len(rows) == 1 else 138 + ri * 86
        for p, wd in zip(row, widths):
            if p[0] == "s":
                slot(a, x, y, wd)
            else:
                K.gold_text(a, x + wd / 2, y + 44, p[1], 42, g, spacing=4)
            x += wd + 22
    # the raking light of the set-piece, for the sand book
    if cid == "c9":
        K.sunbeam(a, -40, 420, 1100, 60, 40, 220, K.GOLD_L, .2)
    gutter(a, gut)
    K.fillet(a, 1112, 22, 62, 376, g, wd=2, inner=5)


for _i, (_cid, _t, _fn, _doc) in enumerate(CARTS):
    K.reg(f"cartouche-{_cid}", "pieces", f"Cartouche: {_t}", 1200, 420, ROW, _doc, cartouche, _i)

"""Phase 3: the ending-card lettering, Elaris's own page at the back of the ledger (the second run's
document), and the notebook page where the long puzzle's pieces are pasted."""
import math

from artkit import Art, f, sibling

K = sibling(__file__, "_kit")
HB = sibling(__file__, "_herbs")
ROW_E = "Ending-card lettering, gold-tooled (5)"
ROW_D = "Ledger pages, front and back, with Maudric's hand"
ROW_N = "UI ornaments: ink-glyph prompts, fleurons, corner folds, ribbon, cup vignette"
PAPER = "#E9DEC0"
ELARIS = "#3E5A3E"      # Elaris writes in sage-dark ink, upright, where Maudric's purple hand slants


# ---- the ending-card lettering (1600 x 300): each ending's name tooled on a strip of its leather ------
ENDINGS = [
    ("unread-page", "The Unread Page", "#3A2A1A", "leaf"),
    ("reader-who-stayed", "The Reader Who Stayed", "#2E1E14", "cup"),
    ("the-rider", "The Rider", "#2A2630", "wave"),
    ("named-book", "The Named Book", "#3A2114", "book"),
    ("son-returns", "The Son Returns", "#33241A", "broom"),
]


def emblem(a, kind, cx, cy, g):
    """A small tooled device at either end of the strip."""
    if kind == "leaf":
        K.woody_leaf(a, cx - 40, cy + 18, 80, -.6, fill=K.GOLD_D)
    elif kind == "cup":
        a.path(f"M{f(cx - 28)},{f(cy - 14)} L{f(cx - 20)},{f(cy + 22)} Q{f(cx)},{f(cy + 30)} {f(cx + 20)},{f(cy + 22)} L{f(cx + 28)},{f(cy - 14)}Z",
               fill="none", stroke=g, stroke_width=4)
        a.path(f"M{f(cx + 28)},{f(cy - 6)} q18,4 8,20 q-4,4 -10,3", fill="none", stroke=g, stroke_width=3.5)
        a.path(f"M{f(cx - 40)},{f(cy + 34)} H{f(cx + 40)}", stroke=g, stroke_width=3)
    elif kind == "wave":
        a.path(f"M{f(cx - 44)},{f(cy + 16)} C{f(cx - 24)},{f(cy - 30)} {f(cx + 4)},{f(cy - 30)} {f(cx + 14)},{f(cy - 4)} "
               f"C{f(cx + 2)},{f(cy - 10)} {f(cx - 6)},{f(cy + 2)} {f(cx + 4)},{f(cy + 10)} C{f(cx + 18)},{f(cy + 20)} {f(cx + 34)},{f(cy + 12)} {f(cx + 44)},{f(cy + 16)}",
               fill="none", stroke=g, stroke_width=4, stroke_linecap="round")
    elif kind == "book":
        a.rect(cx - 16, cy - 30, 32, 60, fill="none", stroke=g, stroke_width=4, rx=3)
        a.path(f"M{f(cx - 10)},{f(cy - 14)} H{f(cx + 10)} M{f(cx - 10)},{f(cy + 14)} H{f(cx + 10)}", stroke=g, stroke_width=3)
    else:
        a.path(f"M{f(cx + 30)},{f(cy - 34)} L{f(cx - 6)},{f(cy + 8)}", stroke=g, stroke_width=4, stroke_linecap="round")
        a.path(f"M{f(cx - 6)},{f(cy + 8)} l-26,22 M{f(cx - 2)},{f(cy + 12)} l-18,26 M{f(cx + 2)},{f(cy + 16)} l-8,26",
               stroke=g, stroke_width=3, stroke_linecap="round")


def ending_strip(a: Art, idx):
    _id, name, col, kind = ENDINGS[idx]
    K.leather(a, col, vig=.7)
    g = K.gold(a)
    K.fillet(a, 22, 22, a.w - 44, a.h - 44, g, wd=4, inner=11, rx=6)
    K.roll(a, 50, 50, a.w - 100, a.h - 100, g, step=24, size=4)
    size = min(96, int(1080 / (len(name) * .74)))
    K.gold_text(a, a.w / 2, a.h / 2 + size * .34, name.upper(), size, g=g, spacing=6)
    for cx in (124, a.w - 124):
        emblem(a, kind, cx, a.h / 2, g)
    if kind == "leaf":
        # the strip for the unread ending carries no fleuron at its centre: a blank panel where a title would go
        a.rect(a.w / 2 - 90, a.h - 62, 180, 14, fill="#000", opacity=.25, rx=4)
    else:
        K.fleuron(a, a.w / 2, a.h - 52, .5, fill=g)


_DOCS = [
    "The Unread Page, tooled in gold on worn ochre-brown leather between woody leaves; under it a small blank panel "
    "where a title would go, left empty.",
    "The Reader Who Stayed, tooled in gold on dark walnut leather between two cups.",
    "The Rider, tooled in gold on dusk-grey leather between two breaking waves.",
    "The Named Book, tooled in gold on walnut leather between two small book spines.",
    "The Son Returns, tooled in gold on brown leather between two brooms.",
]
for _i, (_id, _name, _c, _k) in enumerate(ENDINGS):
    K.reg(f"ending-title-{_id}", "title", f"Ending lettering: {_name}", 1600, 300, ROW_E, _DOCS[_i], ending_strip, _i)


# ---- the second run's document: Elaris's own page at the back of the ledger -----------------------
def upright(a, x, y, s, size=34, color=ELARIS, rot=0.0, anchor="start"):
    """Elaris's hand: upright and careful, in sage-dark ink."""
    a.text(x, y, s, size=size, family="serif", fill=color, font_style="normal", text_anchor=anchor,
           transform=f"rotate({f(rot + a.rng.uniform(-.3, .3))} {f(x)} {f(y)})")


def p_back4(a: Art):
    """The last leaf at the back of the ledger, written on a later morning in another hand."""
    W, H = a.w, a.h
    K.page(a, PAPER, g=.26, edge=.45)
    a.path("".join(f"M0,{y}H{W}" for y in range(190, H - 60, 46)), stroke="#8FA0B4", stroke_width=1, opacity=.6, fill="none")
    a.path(f"M{W - 120},0V{H}M{W - 124},0V{H}", stroke="#A0412B", stroke_width=1, opacity=.6, fill="none")
    a.rect(0, 0, 70, H, fill=a.gradient([(0, "#5A3A1A"), (1, PAPER)], 0, 0, 1, 0), opacity=.4)
    for k in range(5):
        a.circle(46, 140 + k * 205, 4, fill="#4A3220", opacity=.8)
    # his own heading, then the recipe the old keeper left unfinished, finished
    upright(a, 100, 126, "Kept at the back, for the next one", 36)
    a.path("M100,146 H640", stroke=ELARIS, stroke_width=1.4, opacity=.7)
    y = 236
    K.hand(a, 100, y, "For leaving a book that is still going:", 30, "#3B2A4A", rot=-2)
    K.hand(a, 120, y + 44, "sprig, and what the book gives back", 30, "#3B2A4A", rot=-3)
    a.path(f"M100,{y + 64} q260,8 520,-6", stroke=ELARIS, stroke_width=1.6, fill="none")
    upright(a, 100, y + 124, "what it gives back is the sand I swept.", 32)
    upright(a, 100, y + 172, "Sprig, gutter sand, gutter sand. Mark 3.", 32)
    for k, hid in enumerate(("seers-sprig", "gutter-sand", "gutter-sand")):
        HB.herb(a, hid, 200 + k * 130, y + 270, .62)
    upright(a, 100, y + 400, "The front pages bind. Every recipe in", 30)
    upright(a, 100, y + 446, "them keeps a reader in. Read them as his.", 30)
    # the old count, struck through once, carefully, and left legible
    for k in range(4):
        yy = y + 540 + k * 34
        a.path(f"M100,{yy} l{40 + k * 3},-14", stroke="#3B2A4A", stroke_width=2.2, opacity=.55)
    a.path(f"M90,{y + 580} H520", stroke=ELARIS, stroke_width=2, opacity=.8)
    upright(a, 100, y + 700, "I looked away, and did not look back.", 30, rot=-1)
    K.woody_leaf(a, 560, 1010, 120, -.7)
    K.tea_ring(a, 610, 860, 62, op=.18, gap=.45)
    a.text(W - 110, H - 34, "4", size=20, family="serif", fill=K.INK2, opacity=.8, text_anchor="middle")


K.reg("ledger-back-4-elaris", "documents", "Ledger, back: the page in Elaris's hand", 800, 1100, ROW_D,
      "A last leaf at the back of the ledger in a second, upright hand in sage-dark ink: the unfinished recipe finished "
      "(sprig, gutter sand, gutter sand, mark 3) with the herbs sketched, a warning that the front pages bind, and one "
      "woody leaf pressed at the foot.", p_back4)


# ---- the notebook page: four mounts for the long puzzle's pieces ---------------------------------
def notebook(a: Art):
    """Elaris's notebook open on the table: two pages with four empty photo-corner mounts, waiting for slips."""
    W, H = a.w, a.h
    a.rect(0, 0, W, H, fill="#2A1C12")
    K.grain(a, 0, 0, W, H, .3, .5)
    for side in (0, 1):
        x = 30 + side * (W / 2 - 20)
        K.page(a, K.VELLUM, x=x, y=26, w=W / 2 - 40, h=H - 52, g=.2, edge=.3)
    a.rect(W / 2 - 22, 26, 44, H - 52, fill=a.gradient([(0, "#000"), (.5, "#6A4A2A"), (1, "#000")], 0, 0, 1, 0), opacity=.28)
    upright(a, 70, 80, "What the book gives back", 30, color=K.INK)
    a.path("M70,94 H380", stroke=K.GOLD_D, stroke_width=1.6)
    mounts = [(74, 118), (W / 2 + 34, 118), (74, 330), (W / 2 + 34, 330)]
    for (mx, my) in mounts:
        w, h = W / 2 - 128, 178
        a.rect(mx, my, w, h, fill="none", stroke=K.VELLUM_S, stroke_width=1.6, stroke_dasharray="6 6")
        for (cx, cy, rx, ry) in ((mx, my, 1, 1), (mx + w, my, -1, 1), (mx, my + h, 1, -1), (mx + w, my + h, -1, -1)):
            a.path(f"M{f(cx)},{f(cy)} l{f(26 * rx)},0 l{f(-26 * rx)},{f(26 * ry)}Z", fill=K.INK2, opacity=.75)
    K.tea_ring(a, W - 150, H - 90, 46, op=.22, gap=.3)
    K.sand(a, W / 2 - 30, 26, 60, H - 52, n=160, r=(.6, 1.4))


K.reg("notebook-pieces", "ui", "Elaris's notebook: the mounts for the pieces", 900, 560, ROW_N,
      "Elaris's notebook open on the table, headed 'What the book gives back': four empty photo-corner mounts for "
      "pasted slips, sand in the gutter, a faint tea ring.", notebook)

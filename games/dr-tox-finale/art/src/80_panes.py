"""Panes (1D, tangram tiling of a breach; Aegis): holographic foil trading card.

A collectible card washed with rainbow foil in diagonal bands, a bevelled frame, a title bar and a stat
box; the seven tangram pieces of hard light are foil facets. The foil's pale-gold centre is Aegis's
hard light (#F6E7B8), the sheen Altrulan will remember as halos. Aegis has no design system, so he is only
named on the card, never drawn; behind the hub's breach Dr. Tox is a shrouded silhouette."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, M = kit.G, "panes"
FRAME, FRAME2, CARD = "#8c8672", "#d9d4c4", "#2a2a2a"
HL = kit.HARDLIGHT
U = 120          # one tangram unit in pixels on the piece sprites; the breach outlines use the same unit


def foil(a, x1=0, y1=0, x2=1, y2=1):
    return a.gradient([(0, "#f6b3c8"), (0.2, HL), (0.4, "#a8e6cf"), (0.6, "#9fc6f2"), (0.8, "#d4b0f2"), (1, "#f6b3c8")],
                      x1=x1, y1=y1, x2=x2, y2=y2)


def bands(a, x, y, w, h, clip, n=10, op=0.14):
    a.open("g", clip_path=clip)
    for k in range(n):
        bx = x - h + k * (w + h) / n
        a.poly([(bx, y), (bx + 30, y), (bx + 30 + h * .6, y + h), (bx + h * .6, y + h)], fill="#ffffff", opacity=op)
    a.close()


def card_frame(a, title="AEGIS"):
    w, h = a.w, a.h
    a.rect(6, 6, w - 12, h - 12, rx=26, fill=FRAME2, stroke=FRAME, stroke_width=6)
    a.rect(20, 20, w - 40, h - 40, rx=18, fill=foil(a))
    bands(a, 20, 20, w - 40, h - 40, a.clip(f'<rect x="20" y="20" width="{w - 40}" height="{h - 40}" rx="18"/>'))
    a.rect(20, 20, w - 40, h - 40, rx=18, fill="none", stroke="#ffffff", stroke_width=2, opacity=0.7)   # bevel light
    a.rect(26, 26, w - 52, h - 52, rx=14, fill="none", stroke=FRAME, stroke_width=1.5, opacity=0.6)    # bevel dark
    a.rect(44, 36, w - 88, 52, rx=8, fill="#f4f0e2", stroke=CARD, stroke_width=3)
    kit.label(a, 60, 74, title, size=36, fill=CARD, font_weight="bold", letter_spacing="6")
    kit.label(a, w - 60, 72, "HARD LIGHT", size=14, fill="#6a6450", anchor="end", font_weight="bold", letter_spacing="2")


def stat_box(a, x, y, w, h):
    a.rect(x, y, w, h, rx=8, fill="#f4f0e2", stroke=CARD, stroke_width=4)
    kit.label(a, x + 20, y + 46, "LOAD", size=26, fill=CARD, font_weight="bold")
    a.rect(x + 116, y + 24, w - 140, 28, fill="#ffffff", stroke=CARD, stroke_width=2)
    for k in range(1, 10):
        a.line(x + 116 + k * (w - 140) / 10, y + 24, x + 116 + k * (w - 140) / 10, y + 52, stroke=CARD, stroke_width=1,
               opacity=0.3)
    kit.label(a, x + 20, y + 100, "PANES", size=26, fill=CARD, font_weight="bold")
    for k in range(7):
        a.rect(x + 130 + k * 36, y + 78, 26, 26, fill="none", stroke=CARD, stroke_width=2,
               transform=f"rotate(45 {x + 143 + k * 36} {y + 91})")
    kit.label(a, x + 20, y + h - 14, "SERIES 2240 · PROJECT HOPE", size=14, fill="#6a6450", letter_spacing="3")


def breach(a, x, y, s, gap=None):
    """The breach outline: the 2 x 2 tangram square in the glass, unit s, cracks running out of it."""
    a.rect(x, y, 2 * s, 2 * s, fill="#1d2526", stroke=HL, stroke_width=3, stroke_dasharray="10 6")
    for (dx, dy, ex, ey) in ((0, 0, -40, -30), (2, 0, 50, -40), (2, 2, 60, 30), (0, 2, -50, 40), (1, 0, 10, -60),
                             (0, 1, -70, 0), (2, 1, 70, 10)):
        a.line(x + dx * s, y + dy * s, x + dx * s + ex, y + dy * s + ey, stroke="#ffffff", stroke_width=2, opacity=0.8)


@asset(G, "panes-card-atrium", group="backdrops", title="Panes: the card for the atrium (Panes 1)", w=560, h=780,
       row=kit.row(M, "Cards: front and back"))
def card_atrium(a: Art):
    """The trading card for Panes 1: rainbow foil in diagonal bands inside a bevelled frame, AEGIS on the
    title bar, and in the art window the atrium's glass wall in gray-teal with a wide square breach in it,
    its outline dashed in pale gold and cracks running out; dust-brown air beyond. The stat box below has
    LOAD and seven empty PANES."""
    card_frame(a)
    a.rect(44, 104, 472, 440, fill="#5E7375", stroke=CARD, stroke_width=4)
    for x in range(44, 516, 59):
        a.line(x, 104, x, 544, stroke="#8a9a99", stroke_width=2)
    a.line(44, 324, 516, 324, stroke="#8a9a99", stroke_width=2)
    breach(a, 160, 204, U)
    a.rect(166, 210, 228, 228, fill="#7a6a52", opacity=0.45)
    stat_box(a, 44, 566, 472, 170)


@asset(G, "panes-card-hub", group="backdrops", title="Panes: the card for the hub (Panes 2)", w=560, h=780,
       row=kit.row(M, "Cards: front and back"))
def card_hub(a: Art):
    """The trading card for Panes 2: the same foil and frame, and in the art window the hub's curved glass
    drum lit white from inside with the square breach in it; through the breach, on the gallery side, a
    narrow hooded silhouette stands still and waits. The stat box below."""
    card_frame(a)
    a.rect(44, 104, 472, 440, fill="#e9ecea", stroke=CARD, stroke_width=4)
    a.rect(44, 104, 472, 440, fill=a.radial([(0, "#ffffff", 0.9), (1, HL, 0.3)]))
    for x in range(60, 516, 46):
        a.path(f"M{x},104 Q{x + 10},324 {x},544", fill="none", stroke="#c4cdcb", stroke_width=2)
    breach(a, 160, 204, U)
    a.path(kit.tox_d(280, 440, 1.25), fill=kit.SHROUD, stroke="#0d1112", stroke_width=2,
           clip_path=a.clip('<rect x="160" y="204" width="240" height="240"/>'))
    stat_box(a, 44, 566, 472, 170)


@asset(G, "panes-card-back", group="backdrops", title="Panes: the card's back (names at the crack)", w=560, h=780,
       row=kit.row(M, "Cards: front and back"))
def card_back(a: Art):
    """The card's back for Panes 1: a pale-gold foil field with a ring of hard light in the middle and a
    printed grid of eight blank name stickers, one for each face at the crack; names are laid onto them at
    run time, and a gap left open shows its sticker lit."""
    a.rect(6, 6, 548, 768, rx=26, fill=FRAME2, stroke=FRAME, stroke_width=6)
    a.rect(20, 20, 520, 740, rx=18, fill=foil(a, 1, 0, 0, 1))
    a.rect(20, 20, 520, 740, rx=18, fill=HL, opacity=0.55)
    bands(a, 20, 20, 520, 740, a.clip('<rect x="20" y="20" width="520" height="740" rx="18"/>'), op=0.2)
    a.ellipse(280, 150, 120, 40, fill="none", stroke="#ffffff", stroke_width=8, opacity=0.9)
    a.ellipse(280, 150, 150, 54, fill="none", stroke=HL, stroke_width=3)
    kit.label(a, 280, 250, "AT THE CRACK", size=24, fill=CARD, anchor="middle", font_weight="bold", letter_spacing="5")
    for k in range(8):
        x, y = 60 + (k % 2) * 230, 290 + (k // 2) * 104
        a.rect(x, y, 210, 70, rx=10, fill="#fbf8ee", stroke=CARD, stroke_width=2.5)
        a.line(x + 16, y + 46, x + 194, y + 46, stroke=CARD, stroke_width=1, opacity=0.4)
    kit.label(a, 280, 730, "SERIES 2240 · PROJECT HOPE", size=14, fill="#6a6450", anchor="middle", letter_spacing="3")


# ---- the seven pieces -------------------------------------------------------------------------------
def piece(name, pts):
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, y0 = min(xs), min(ys)
    w, h = (max(xs) - x0) * U, (max(ys) - y0) * U
    pad = 8
    P = [((x - x0) * U + pad, (y - y0) * U + pad) for x, y in pts]

    def draw(a: Art):
        d = kit.P(P, True)
        a.path(d, fill=foil(a))
        a.path(d, fill=HL, opacity=0.35)
        cx, cy = sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P)
        clip = a.clip(f'<path d="{d}"/>')
        a.open("g", clip_path=clip)
        for p in P:                                      # facets: lines from the centre to each corner
            a.line(cx, cy, p[0], p[1], stroke="#ffffff", stroke_width=2, opacity=0.6)
        for k in range(6):
            bx = -40 + k * (w + 80) / 6
            a.poly([(bx, 0), (bx + 16, 0), (bx + 16 + h, h + 2 * pad), (bx + h, h + 2 * pad)], fill="#ffffff", opacity=0.18)
        a.close()
        a.path(d, fill="none", stroke="#ffffff", stroke_width=3, stroke_linejoin="round")
    draw.__doc__ = (f"Panes piece, the {name.replace('-', ' ')} of the tangram set: a hard-light pane as a foil facet, "
                    f"pale gold over rainbow foil with diagonal sheen bands and facet lines to its corners, a white edge. "
                    f"Drawn at {U} px to the tangram unit; drag, rotate and flip it into the breach.")
    asset(G, f"panes-piece-{name}", group="pieces", title=f"Panes: piece, {name.replace('-', ' ')}", w=int(w + 2 * pad),
          h=int(h + 2 * pad), row=kit.row(M, "The seven pieces (tangram)"))(draw)


for _n, _p in kit.tangram():
    piece(_n, _p)


@asset(G, "panes-keystone", group="pieces", title="Panes: the keystone (sets only on HOPE)", w=186, h=101,
       row=kit.row(M, "The keystone"))
def keystone(a: Art):
    """The keystone: the medium triangle of the set (same size, 1 unit legs) drawn brighter than the rest, solid hard-light gold with a
    stronger foil and a small HOPE seal at its heart. It sets only on the word HOPE; held in Reese's hand it
    is room."""
    pts = [(8, 93), (178, 93), (93, 8)]
    d = kit.P(pts, True)
    a.path(d, fill=foil(a, 0, 1, 1, 0))
    a.path(d, fill=HL, opacity=0.6)
    a.path(d, fill="none", stroke="#ffffff", stroke_width=4)
    for p in pts:
        a.line(93, 66, p[0], p[1], stroke="#ffffff", stroke_width=2, opacity=0.7)
    a.circle(93, 68, 18, fill="#2a1e0c", stroke=kit.GOLD, stroke_width=2)
    kit.label(a, 93, 72, "HOPE", size=11, fill=kit.GOLD, anchor="middle", font_weight="bold", letter_spacing="1")


@asset(G, "panes-piece-out", group="pieces", title="Panes: a pane gone out (the flinch)", w=186, h=101,
       row=kit.row(M, "The keystone"))
def piece_out(a: Art):
    """A pane gone out for a second when the leash fires: the same triangle as a cold gray-teal outline,
    dashed, the foil gone; laid over every set pane while it lasts."""
    pts = [(8, 93), (178, 93), (93, 8)]
    a.path(kit.P(pts, True), fill="#5E7375", opacity=0.35)
    a.path(kit.P(pts, True), fill="none", stroke="#8A9A99", stroke_width=3, stroke_dasharray="10 6")
    a.line(40, 80, 146, 80, stroke="#C4CDCB", stroke_width=1, opacity=0.6)
    a.line(66, 54, 120, 54, stroke="#C4CDCB", stroke_width=1, opacity=0.4)
    a.circle(93, 68, 4, fill="#8A9A99")


# ---- ui -------------------------------------------------------------------------------------------
@asset(G, "panes-sticker", group="ui", title="Panes: a name sticker (blank)", w=200, h=64,
       row=kit.row(M, "Names at the crack"))
def sticker(a: Art):
    """A blank name sticker with a peeled corner and a foil edge, for the names at the crack; the name is
    laid on at run time."""
    a.path("M6,8 L186,8 L194,20 L194,58 L6,58Z", fill="#fbf8ee", stroke=CARD, stroke_width=2.5)
    a.path("M186,8 L186,20 L194,20Z", fill=HL, stroke=CARD, stroke_width=1.5)
    a.rect(6, 52, 188, 6, fill=foil(a, 0, 0, 1, 0))
    a.line(18, 42, 176, 42, stroke=CARD, stroke_width=1, opacity=0.4)


@asset(G, "panes-fumes", group="ui", title="Panes: fumes through a gap", w=140, h=140,
       row=kit.row(M, "Fumes and the seal"))
def fumes(a: Art):
    """Fumes coming through an unfilled gap each turn: three dust-brown wisps curling in from outside, soft
    and printed flat in the card's art style; Reese absorbs them as Load."""
    for k, (x, op) in enumerate(((40, 0.6), (70, 0.45), (100, 0.35))):
        a.path(f"M{x},130 C{x - 30},100 {x + 30},70 {x},40 C{x - 16},24 {x + 6},10 {x + 14},6", fill="none",
               stroke="#7a6a52", stroke_width=12 - k * 3, opacity=op, stroke_linecap="round")
    a.circle(70, 70, 60, fill="#7a6a52", opacity=0.08)
    a.circle(40, 120, 4, fill="#7a6a52", opacity=0.5)


@asset(G, "panes-hope-seal", group="ui", title="Panes: the HOPE seal (the Word said)", w=140, h=140,
       row=kit.row(M, "Fumes and the seal"))
def hope_seal(a: Art):
    """A round holographic seal stamped HOPE, as on licensed merchandise: foil rings, a half sun over a
    bar, the word in warm capitals. Shown on the card when Reese said HOPE at the hub's glass."""
    a.circle(70, 70, 64, fill=foil(a))
    a.circle(70, 70, 64, fill=HL, opacity=0.4)
    for r in (56, 48):
        a.circle(70, 70, r, fill="none", stroke="#ffffff", stroke_width=2, opacity=0.8)
    a.path("M46,74 A24,24 0 0,1 94,74Z", fill=kit.AMBER)
    a.line(40, 74, 100, 74, stroke=CARD, stroke_width=3)
    kit.label(a, 70, 104, "HOPE", size=20, fill=CARD, anchor="middle", font_weight="bold", letter_spacing="3")

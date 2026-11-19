"""Phase 3: the ending-card lettering, the tab ledger, the scholars' footnote, the unsigned chit, the cup and the
king's photograph (accepted 2026-11-15, built 2026-11-16)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, VIOLET, GOLD, SEAINK, PAPER, BB = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.VIOLET, kit.GOLD, kit.SEAINK, kit.PAPER, kit.BLUEBLACK)
ROW_END = "Ending cards, one per ending (the lettering laid over each)"
ROW_DOC = "The Charter: 5 documents, Schedule C, the writ, 8 chits, 6 seals"
ROW_WB = "Wreck Book spreads"


# ---- the lettering for the five ending cards ---------------------------------------------------------
# (id, name, the line under it, Order or Wild, whether the Voice speaks)
ENDINGS = [
    ("the-charter", "The Charter", "terms between a god and the people who sail", "both", True),
    ("paid-in-kind", "Paid in Kind", "outstanding, for ever", "wild", True),
    ("no-lord", "No Lord", "an ordinary man on an ordinary sea", "both", True),
    ("the-wild-sea", "The Wild Sea", "sung by name", "wild", True),
    ("the-lords-peace", "The Lord's Peace", "examined and entered", "order", False),
]


def make_lettering(key, name, line, kind, voice):
    @asset(G, f"lettering-{key}", group="title", title=f"Ending card lettering: {name}", w=1200, h=300, row=ROW_END)
    def lettering(a: Art):
        a.paper(LAMP if kind == "order" else kit.PAPER, grain=0.18)
        kit.frame(a, 18, 18, a.w - 36, a.h - 36, col=INK if kind == "order" else GREEN, sw=2.2, gap=7)
        # the rule under the name: ruled for Order, a wave for Wild, half and half for the two that hold both
        y = 196
        if kind in ("order", "both"):
            x1 = a.w / 2 if kind == "both" else a.w - 120
            for k in range(4):
                a.line(120, y + k * 6, x1, y + k * 6, stroke=INK, stroke_width=1.1)
        if kind in ("wild", "both"):
            x0 = a.w / 2 if kind == "both" else 120
            for k in range(4):
                pts = [(x, y + k * 6 + 4 * math.sin((x - x0) / 26)) for x in range(int(x0), a.w - 119, 6)]
                a.path(kit.pd(pts), fill="none", stroke=GREEN, stroke_width=1.2)
        size = 104 if len(name) < 13 else 92
        a.text(a.w / 2 + 3, 156 + 3, name, size=size, family="serif", fill=INK, opacity=0.22, text_anchor="middle")
        a.text(a.w / 2, 156, name, size=size, family="serif", fill=INK if kind == "order" else "#1d4a41",
               text_anchor="middle", font_style="italic")
        kit.smallcaps(a, a.w / 2, 260, line, size=19, col=RED if kind == "order" else TEA)
        if voice:   # the Voice's spiral, small, at the right: it still has its last line here
            kit.spiral(a, a.w - 92, 92, 2, 30, 3.0, stroke_width=2.2)
        else:       # The Lord's Peace: the Company's green tick where the spiral would be, and the slot left empty
            kit.tick(a, a.w - 110, 110, s=2.2)
    lettering.__doc__ = (f"The lettering laid over the {name} ending card: the name cut in an upright engraved italic on "
                         f"{'lamp-white Company stock' if kind == 'order' else 'cream laid paper'}, over "
                         f"{'ruled hatching' if kind == 'order' else 'wave hatching' if kind == 'wild' else 'a rule that is ruled on the left and waved on the right'}, "
                         f"with '{line}' set in small capitals"
                         f"{' and the Voice’s clockwise spiral at the corner' if voice else ' and a green tick where the Voice’s spiral would be'}.")
    return lettering


for _e in ENDINGS:
    make_lettering(*_e)


# ---- the tab ledger: the page that shows the chits gathered so far -----------------------------------
@asset(G, "tab-ledger", group="documents", title="The tab: a page of the chandler's ledger", w=900, h=1200, row=ROW_DOC)
def tab_ledger(a: Art):
    """A page of a chandler's ledger, the page the tab is kept on: cream stock ruled in faint blue, a red margin
    rule and a double red money column, a clockwise sea-ink spiral in the head margin where the account is signed,
    and a tea ring and thumb-grime at the corner. Left clear for the chits to be laid on it."""
    kit.plate(a, tone="#EFE4C8", m=0, mark=False)
    for k in range(40):
        a.line(24, 120 + k * 27, a.w - 24, 120 + k * 27, stroke=kit.WASH, stroke_width=0.9)
    a.line(70, 24, 70, a.h - 24, stroke=RED, stroke_width=1.1, opacity=0.8)
    a.line(a.w - 96, 24, a.w - 96, a.h - 24, stroke=RED, stroke_width=0.9, opacity=0.8)
    a.line(a.w - 92, 24, a.w - 92, a.h - 24, stroke=RED, stroke_width=0.9, opacity=0.8)
    a.line(24, 96, a.w - 24, 96, stroke=RED, stroke_width=1.2, opacity=0.8)
    a.line(24, 100, a.w - 24, 100, stroke=RED, stroke_width=0.6, opacity=0.8)
    kit.spiral(a, 46, 58, 2, 18, 3.0, stroke_width=1.8, opacity=0.8)
    a.circle(a.w - 150, a.h - 170, 70, fill="none", stroke=TEA, stroke_width=5, opacity=0.18)
    a.path(f"M{a.w},{a.h} l-120,0 l120,-110z", fill=TEA, opacity=0.12)


# ---- the future scholars' footnote (the second run) -------------------------------------------------
@asset(G, "scholars-footnote", group="documents", title="A footnote by the future scholars", w=900, h=160, row=ROW_DOC)
def scholars_footnote(a: Art):
    """The foot of a printed page from a later edition: a short rule, a dagger, and two lines of small type in a
    different, modern hand-set face, on whiter paper than the deed it annotates; a pencilled query beside it."""
    a.paper("#F6F3EA", grain=0.12)
    a.line(40, 34, 300, 34, stroke=INK, stroke_width=1.2)
    a.text(42, 74, "†", size=30, family="serif", fill=RED)
    for j, w in enumerate((760, 690, 520)):
        y = 70 + j * 26
        a.rect(72, y - 9, w, 2.2, fill=INK, opacity=0.55)
        for k in range(0, w, 34):
            a.rect(72 + k + 26, y - 11, 5, 6, fill="#F6F3EA")
    a.path(a.wobble_d([(620, 140), (700, 132), (790, 138)], 1.4, 8), fill="none", stroke=kit.PENCIL, stroke_width=1.6)
    a.text(800, 142, "?", size=26, family="cursive", fill=kit.PENCIL)


# ---- a chit unsigned: Paid in Kind ------------------------------------------------------------------
@asset(G, "chit-unsigned", group="documents", title="A chit, unsigned", w=460, h=300, row=ROW_DOC)
def chit_unsigned(a: Art):
    """One of Alexi's chits after Pay: the same chandler's slip, wet through, its pledge and 'pays next tide' run
    out into sea-ink threads, and the spiral where he signed unwound counter-clockwise to a blank."""
    a.paper("#2a3b3a", grain=0.3, fibre=0.03)
    a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, GREEN, gap=9, sw=1.1, wave=True, opacity=0.45))
    a.open("g", transform="translate(40,40) rotate(-3 190 105)")
    a.rect(6, 8, 380, 210, fill="#000", opacity=0.35, filter=a.blur(4))
    a.rect(0, 0, 380, 210, fill="#E9E4D2", filter=a.roughen(scale=3, freq=0.05))
    a.rect(10, 10, 360, 190, fill="none", stroke=TEA, stroke_width=0.9, opacity=0.5)
    kit.smallcaps(a, 22, 34, "Chit", size=13, col=TEA, anchor="start", opacity=0.6)
    for x, y in ((40, 104), (90, 108), (150, 102), (210, 150), (60, 150)):
        a.path(f"M{x},{y} q6,40 -4,80 q-8,30 2,60", fill="none", stroke=SEAINK, stroke_width=1.4, opacity=0.55)
    a.open("g", filter=a.blur(2.4), opacity=0.35)
    kit.script(a, 24, 104, 190, size=1.1)
    a.close()
    kit.spiral(a, 306, 138, 2, 34, 3.1, cw=False, stroke_width=2.2, opacity=0.4, stroke_dasharray="4 7")
    kit.salt(a, 120, 110, 90)
    a.close()


# ---- the Cup ----------------------------------------------------------------------------------------
@asset(G, "the-cup", group="pieces", title="The Cup: tea and hot water on the board", w=600, h=400, row=ROW_WB)
def the_cup(a: Art):
    """Two blue-and-white export cups on the porcelain board: one of brown tea, steaming, the blend from the jar in
    Alexi's cabinet, the other of plain hot water; between them a chit on Company stock under a clerk's ruler."""
    a.paper(kit.GLAZE, grain=0.1)
    a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, kit.COB, gap=26, sw=1.2, ang=45, opacity=0.18))
    a.rect(30, 30, a.w - 60, a.h - 60, fill="none", stroke=kit.COB, stroke_width=3)
    a.rect(42, 42, a.w - 84, a.h - 84, fill="none", stroke=kit.COB, stroke_width=1)
    for cx, liquor in ((190, "#6B4A2B"), (420, "#e9efee")):
        a.path(f"M{cx - 80},{200} Q{cx - 74},{290} {cx},{292} Q{cx + 74},{290} {cx + 80},{200}Z", fill=kit.GLAZE,
               stroke=kit.COB, stroke_width=3)
        a.path(f"M{cx - 60},{232} q30,18 60,0 t60,0", fill="none", stroke=kit.COB2, stroke_width=2)
        a.path(f"M{cx - 80},200 A80,20 0 0 1 {cx + 80},200 A80,20 0 0 1 {cx - 80},200Z", fill=liquor, stroke=kit.COB,
               stroke_width=2.4)
        if liquor != "#e9efee":
            for k in range(3):
                x = cx - 30 + k * 30
                a.path(f"M{x},180 q-14,-26 0,-50 q14,-24 0,-54", fill="none", stroke=TEA, stroke_width=2, opacity=0.35)
    a.open("g", transform="rotate(-6 305 330)")
    a.rect(250, 306, 120, 54, fill=LAMP, stroke=TEA, stroke_width=1)
    for k in range(3):
        a.line(258, 320 + k * 12, 360, 320 + k * 12, stroke=kit.WASH, stroke_width=0.8)
    kit.spiral(a, 340, 336, 1.5, 12, 2.6, stroke_width=1.4)
    kit.tick(a, 268, 352, s=0.8)
    a.close()
    a.rect(232, 296, 160, 10, fill="#2b2b2b", transform="rotate(-6 305 330)")


# ---- the king's photograph (The Oars) ----------------------------------------------------------------
@asset(G, "king-photograph", group="documents", title="The photograph: two young men at the oars", w=500, h=380, row=ROW_DOC)
def king_photograph(a: Art):
    """A small albumen photograph curling at the edges, browned and foxed: two young men from behind at the oars of
    a gig on flat water, one broad-backed, one slight; no faces. Pencilled on the mount, an occasion and no names."""
    a.paper("#2b2016", grain=0.3)
    a.open("g", transform="rotate(3 250 190)")
    a.rect(40, 30, 420, 320, fill="#E8DFC6", stroke=TEA, stroke_width=1)
    a.rect(66, 52, 368, 236, fill="#a88a5c")
    a.rect(66, 52, 368, 236, fill=a.gradient([(0, "#c9b083"), (0.6, "#8b6c42"), (1, "#5a432a")], 0, 0, 0, 1), opacity=0.9)
    a.line(66, 188, 434, 188, stroke="#5a432a", stroke_width=1)
    for k in range(10):
        a.line(66, 196 + k * 9, 434, 196 + k * 9, stroke="#6d5233", stroke_width=0.8, opacity=0.5)
    a.path("M110,232 L390,232 L372,252 L130,252Z", fill="#3a2a1a")
    for x, h, wd in ((190, 70, 30), (300, 62, 22)):
        a.circle(x, 232 - h, 11, fill="#2d2014")
        a.path(f"M{x - wd},{232} L{x - wd * 0.6},{232 - h + 12} L{x + wd * 0.6},{232 - h + 12} L{x + wd},{232}Z", fill="#2d2014")
        a.line(x - 10, 232 - h * 0.6, x - 70, 262, stroke="#2d2014", stroke_width=4, stroke_linecap="round")
        a.line(x + 10, 232 - h * 0.6, x + 70, 262, stroke="#2d2014", stroke_width=4, stroke_linecap="round")
    for _ in range(26):
        a.circle(a.rng.uniform(70, 430), a.rng.uniform(56, 284), a.rng.uniform(1, 4), fill="#5a3d20", opacity=0.35)
    a.text(250, 326, "the spring regatta", size=20, family="cursive", fill=kit.PENCIL, text_anchor="middle")
    a.path("M40,30 q30,6 60,0 L40,80Z", fill="#c9bb98")
    a.close()

"""Phase 3: the ending-card lettering, the archivist's desk log (second playthrough), the errata sheet
(the correction, unsigned), and the ledger of the twelve bars (the long puzzle's notebook page)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, INK, ARCH, PENCIL, BAR, SEAL, PAPER = kit.G, kit.INK, kit.ARCH, kit.PENCIL, kit.BAR, kit.SEAL, kit.PAPER

# The twelve surgical bars, as the web build's _bars.js has them: (length mm, staff position 0..6).
TWELVE = [(28, 1), (14, 2), (41, 0), (28, 4), (41, 1), (14, 6), (41, 3), (28, 0), (14, 5), (41, 2), (28, 0), (28, 1)]


def _gall(a: Art, x, y, s, size, length=None, color=INK, **kw):
    """Iron-gall lettering: a brown halo where the ink bit the paper, then the dark stroke."""
    common = dict(size=size, family="serif", font_style="italic", **kw)
    if length:
        common.update(textLength=length, lengthAdjust="spacingAndGlyphs")
    a.text(x, y, s, fill="#8a5a2c", stroke="#8a5a2c", stroke_width=size * 0.07, opacity=0.35, filter=a._halo, **common)
    a.text(x, y, s, fill=color, stroke=color, stroke_width=size * 0.012, filter=a._bite, **common)


# ---- ending-card lettering: the name of each ending, as it is set on its card ----------------------
ENDINGS = [
    ("redacted-testament", "The Redacted Testament", "as written", "the archivist's desk"),
    ("archivist-in-time", "The Archivist in Time", "", "her name on the cover"),
    ("directed-resilience", "Directed Resilience", "", "a baseline for a species that did not exist yesterday"),
    ("fire", "Fire", "", "silent water lifts, the river still glowing"),
    ("errata", "Errata", "", "the correction, unsigned"),
]
for _id, _name, _tag, _sub in ENDINGS:
    def _letter(a: Art, eid=_id, name=_name, tag=_tag, sub=_sub):
        r = a.rng
        kit.page(a, pool=0.22)
        a._halo, a._bite = a.blur(4), a.roughen(2.0, 0.35)
        for y in (58, 138, 176):
            a.line(40, y + r.uniform(-1, 1), a.w - 40, y + r.uniform(-1, 1), stroke=PENCIL, stroke_width=0.7, opacity=0.5)
        a.line(72, 20, 72, a.h - 16, stroke=SEAL, stroke_width=0.8, opacity=0.4)
        size = 92 if len(name) < 8 else 74
        _gall(a, 100, 136, name, size, min(a.w - 220, len(name) * size * 0.43))
        kit.lira(a, 104, 180, sub, 22, PENCIL)
        if eid == "errata":
            # the place a signature would go, ruled and left empty
            a.line(a.w - 330, 166, a.w - 70, 166, stroke=INK, stroke_width=1.2, opacity=0.7)
            kit.label(a, a.w - 330, 186, "SIGNED", 12, PENCIL)
        elif eid == "redacted-testament":
            kit.bar(a, a.w - 300, 70, 210, 26)
            kit.small_hand(a, a.w - 300, 128, tag, 20)
        elif eid == "archivist-in-time":
            kit.bar(a, a.w - 300, 74, 96, 18)
            a.rect(a.w - 190, 72, 104, 22, fill=ARCH, opacity=0.18)
            a.path(f"M{a.w - 190},{71}H{a.w - 86}M{a.w - 190},{95}H{a.w - 86}", stroke=ARCH, stroke_width=1, opacity=0.6, fill="none")
            kit.small_hand(a, a.w - 300, 128, "six of twelve", 18)
        elif eid == "directed-resilience":
            kit.bar(a, a.w - 300, 74, 210, 20)
            continuum_mark(a, a.w - 120, 140, 30)
        else:
            kit.staff(a, a.w - 300, 70, 210, 10, color="#a8281e", sw=1.4)
            for x in range(a.w - 290, a.w - 100, 44):
                a.rect(x, 92, 10, 8, fill="none", stroke=INK, stroke_width=1.2, opacity=0.5)
            kit.small_hand(a, a.w - 300, 140, "decodes to nothing", 18)
    _letter.__doc__ = (f"The ending's name, {_name}, in iron-gall ink on laid paper between pencil guide lines, with "
                       f"its subtitle in pencil and one small sign of what it cost.")
    asset(G, f"lettering-{_id}", group="endings", title=f"Ending lettering: {_name}", w=1200, h=210,
          row="Ending cards")(_letter)


def continuum_mark(a: Art, cx, cy, s):
    a.circle(cx, cy, s, fill="none", stroke=SEAL, stroke_width=2.4)
    a.poly([(cx - 0.52 * s, cy + 0.34 * s), (cx, cy - 0.56 * s), (cx + 0.52 * s, cy + 0.34 * s)], fill="none",
           stroke=SEAL, stroke_width=2)


# ---- the archivist's desk log (second playthrough) --------------------------------------------
LOG = [
    ("D 41", "Book I. First of hers to bar. 28 mm, line 1.", 0),
    ("D 44", "Bench at Hollin. 14 mm, line 2. She ran her standard.", 1),
    ("D 52", "Ridge sheet. 41 mm on the drone line.", 2),
    ("D 58", "Plate 1. 28 mm. She wrote made.", 3),
    ("D 120", "The well. 41 mm, line 1.", 4),
    ("D 131", "Their lab. 14 mm, top line.", 5),
    ("D 146", "Appendix C, desk 4. Four lines. Crib.", 6),
    ("D 186", "The Peaks sheet. 28 mm, the drone again.", 10),
    ("D 202", "Her log, left page. 28 mm. She will gauge it.", 11),
]


@asset(G, "desk-log", group="documents", title="The archivist's desk log", w=600, h=860, row="Audit set")
def desk_log(a: Art):
    """A clerk's desk log on grey ruled stock: dated entries in the small blue-black hand, one per ruled
    bar, each with the bar drawn to its length beside it; the last line left blank and dated."""
    r = a.rng
    kit.page(a, color="#e9e4d6", pool=0.2)
    a.rect(0, 0, a.w, 70, fill="#2b2e33", opacity=0.9)
    kit.continuum(a, 28, 44, "EXCISION DESK 4 · LOG", 20, "#e8e2d0")
    kit.label(a, a.w - 150, 44, "NOT FOR FILE", 12, "#f3b4b4")
    for i in range(16):
        a.line(28, 120 + i * 46, a.w - 28, 120 + i * 46, stroke=ARCH, stroke_width=0.6, opacity=0.35)
    a.line(110, 84, 110, a.h - 30, stroke=SEAL, stroke_width=0.8, opacity=0.45)
    for i, (day, txt, k) in enumerate(LOG):
        y = 114 + i * 74
        kit.small_hand(a, 30, y, day, 16)
        kit.small_hand(a, 124, y, txt, 16)
        mm, pos = TWELVE[k]
        kit.bar(a, 136, y + 14, mm * 3.6, 10, fibres=True)
        kit.label(a, 150 + mm * 3.6, y + 24, f"{mm}", 11, ARCH)
    yb = 114 + len(LOG) * 74
    kit.small_hand(a, 30, yb, "D 231", 16)
    kit.small_hand(a, 124, yb, "The order, on a scrap: “She’s close. Move the logs.”", 16)
    kit.blot(a, a.w - 70, a.h - 60, 5, ARCH, 0.7)


# ---- the errata sheet: the correction, unsigned ------------------------------------------------
@asset(G, "errata-sheet", group="documents", title="Errata: the correction, unsigned", w=600, h=820, row="Ending cards")
def errata_sheet(a: Art):
    """One printed sheet: ERRATA over a line diagram of a slope and its damped wave, the corrected damping
    beside the struck figure, and a ruled place for a signature that has been left empty."""
    r = a.rng
    kit.page(a, pool=0.18)
    kit.continuum(a, 40, 70, "ERRATA", 46, INK)
    kit.label(a, 42, 100, "TO: A MODEL OF THE PEAKS, BOOKS I TO IV", 12, INK)
    a.line(40, 116, a.w - 40, 116, stroke=INK, stroke_width=1.4)
    # the slope, in section
    pts = [(60, 360), (150, 330), (240, 270), (330, 220), (420, 160), (500, 140), (540, 150)]
    kit.ink(a, pts, w=2.2, amp=0.8)
    for x in range(70, 540, 22):
        a.line(x, 372, x + 14, 358, stroke=INK, stroke_width=0.6, opacity=0.4)
    # the damped wave, before and after
    w0 = [(60 + k * 4.8, 470 - 46 * math.exp(-k / 40) * math.sin(k / 6)) for k in range(100)]
    w1 = [(60 + k * 4.8, 470 - 46 * math.exp(-k / 26) * math.sin(k / 6)) for k in range(100)]
    a.path(a.smooth_d(w0), fill="none", stroke=PENCIL, stroke_width=1.4, stroke_dasharray="4 4")
    a.path(a.smooth_d(w1), fill="none", stroke=INK, stroke_width=2)
    a.line(60, 470, 540, 470, stroke=PENCIL, stroke_width=0.8)
    kit.continuum(a, 60, 560, "for  γ = 8   read  γ = 6", 22, INK)
    a.line(176, 553, 194, 553, stroke=SEAL, stroke_width=1.8)
    kit.continuum(a, 60, 596, "calm line γ/2 = 3, not 4", 16, INK)
    kit.continuum(a, 60, 626, "the key is not the author's: S.V.", 16, INK)
    a.line(320, 740, a.w - 50, 740, stroke=INK, stroke_width=1)
    kit.label(a, 320, 760, "SIGNED", 11, PENCIL)


# ---- the ledger of the twelve bars ------------------------------------------------------------
@asset(G, "bar-ledger", group="documents", title="The ledger of twelve bars", w=640, h=900, row="Audit set")
def bar_ledger(a: Art):
    """A journal page ruled into twelve numbered slots down a red margin, each slot a pencil guide where a
    measured bar is copied to length; the heading in Lira's hand asks what they are for."""
    r = a.rng
    kit.page(a, pool=0.2)
    kit.lira(a, 40, 64, "Twelve bars, ruled. What for?", 30)
    a.line(36, 84, a.w - 36, 84, stroke=INK, stroke_width=1.2)
    a.line(92, 96, 92, a.h - 24, stroke=SEAL, stroke_width=0.9, opacity=0.5)
    for i in range(12):
        y = 130 + i * 62
        kit.lira_fig(a, f"{i + 1}", 46, y + 8, 20)
        a.line(110, y + 14, a.w - 40, y + 14, stroke=PENCIL, stroke_width=0.7, opacity=0.55)
        a.path(f"M110,{y - 6}h{r.uniform(130, 200):.0f}", stroke=PENCIL, stroke_width=0.6, stroke_dasharray="2 5", fill="none", opacity=0.5)

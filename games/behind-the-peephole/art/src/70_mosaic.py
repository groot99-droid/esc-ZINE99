"""The Mosaic: pin cards, question cards, clippings and typed slips. Cork-board collage."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Pin cards, clippings, typed slips"
INK = kit.INK
THREAD = {"met": (kit.EVIDENCE, None), "works": ("#2a5ab0", "9 6"), "family": ("#e2c23a", None), "after": ("#f5f2ea", "1 7")}


def board(a, d=0.4):
    kit.cork(a, 0, 0, a.w, a.h, n=2.2)
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#fff", 0.1), (1, "#000", d)], r=0.8))


# ---- guest cards ------------------------------------------------------------------------------------
def _g401(a, lamp):   # shoulders, cropped hair; the iron
    a.path("M40,250 Q46,170 96,160 L164,160 Q214,170 220,250Z", fill="#141615")
    a.ellipse(130, 122, 30, 36, fill="#141615")
    a.path("M176,206 h44 q10,0 10,12 v10 h-64 q0,-18 10,-22Z", fill=lamp, opacity=0.9)
    a.path("M186,206 q10,-14 26,0", fill="none", stroke=lamp, stroke_width=4)


def _g402(a, lamp):   # round glasses catching the television; needles
    a.path("M56,250 Q60,180 104,168 L156,168 Q200,180 204,250Z", fill="#141615")
    a.ellipse(130, 126, 28, 34, fill="#141615")
    a.path("M100,112 Q130,70 160,112 Q164,90 130,84 Q96,90 100,112Z", fill="#141615")
    for x in (118, 142):
        a.circle(x, 128, 9, fill=lamp, opacity=0.85)
    a.line(92, 240, 150, 196, stroke=lamp, stroke_width=3)
    a.line(168, 240, 112, 196, stroke=lamp, stroke_width=3)


def _g403(a, lamp):   # hair pinned up, one white glove raised with a brush
    a.path("M60,250 Q66,184 108,170 L152,170 Q194,184 200,250Z", fill="#141615")
    a.ellipse(130, 128, 26, 33, fill="#141615")
    a.circle(138, 92, 15, fill="#141615")
    a.path("M196,196 q-14,-8 -8,-26 l10,-18 q6,-2 8,4 l-2,14 q10,6 6,22Z", fill="#f1ede2")
    a.line(206, 160, 222, 112, stroke="#c9a23a", stroke_width=3)
    a.line(222, 112, 225, 102, stroke=lamp, stroke_width=4)


def _g404(a, lamp):   # white jacket, bow tie, a miniature held low
    a.path("M52,250 Q58,178 102,166 L158,166 Q202,178 208,250Z", fill="#e6e0d0")
    a.path("M130,250 L112,170 L130,186 L148,170Z", fill="#141615")
    a.path("M116,176 l14,8 l14,-8 v14 l-14,-6 l-14,6Z", fill="#141615")
    a.ellipse(130, 124, 27, 34, fill="#141615")
    a.rect(60, 214, 14, 30, rx=3, fill=lamp)
    a.rect(64, 204, 6, 10, fill=lamp)
    kit.dabs(a, 70, 180, 120, 60, [kit.GOLD], n=10, L=(1, 2.5), width=2.5, op=0.9)


def _g405(a, lamp):   # a hood, a screen's glow from below
    a.path("M56,250 Q60,176 100,160 Q130,120 160,160 Q200,176 204,250Z", fill="#141615")
    a.path("M96,160 Q92,86 130,82 Q168,86 164,160 Q150,176 130,176 Q110,176 96,160Z", fill="#141615")
    a.ellipse(130, 136, 20, 26, fill="#222a2a")
    a.rect(84, 222, 92, 30, fill=lamp, opacity=0.9)
    a.ellipse(130, 220, 70, 30, fill=lamp, opacity=0.25)


def _g406(a, lamp):   # short hair, a watch pinned to her coat, a paper boat on her palm
    a.path("M58,250 Q62,182 106,168 L154,168 Q198,182 202,250Z", fill="#141615")
    a.ellipse(130, 126, 27, 34, fill="#141615")
    a.path("M102,120 Q104,84 130,82 Q158,84 160,124 Q150,98 130,96 Q110,98 102,120Z", fill="#141615")
    a.circle(160, 204, 7, fill=lamp, opacity=0.9)
    a.rect(157, 190, 6, 10, fill=lamp, opacity=0.9)
    a.path("M62,214 h44 l-10,14 h-24Z M84,214 v-22 l14,22", fill="#f3efe2")


GUESTS = [(401, "A SOLDIER FOR HIRE", "the mercenary", _g401, "broad shoulders, and an iron", "#c33"),
          (402, "A WHISTLEBLOWER", "the whistleblower", _g402, "round glasses lit by the television, two knitting needles", "#2a5ab0"),
          (403, "AN ART THIEF", "the art thief", _g403, "hair pinned up, a white glove raised with a brush", "#d9b02a"),
          (404, "A JOURNALIST", "the undercover journalist", _g404, "a white catering jacket flecked with gold, a miniature in one hand", "#eee"),
          (405, "A HACKER", "the hacker", _g405, "a hood, a screen glowing from below", "#c33"),
          (406, "AN ACTIVIST", "the activist", _g406, "a nurse's watch pinned to her coat, a paper boat on her palm", "#2a5ab0")]


def _guest(room, kind, who, fn, tell, pincol):
    @asset(G, f"pin-guest-{room}", group="pieces", title=f"Mosaic guest card: {room}, {who}", w=260, h=360, row=ROW)
    def draw(a: Art):
        lamp = kit.ROOMS[room][1]
        board(a)
        kit.paper_card(a, 22, 26, 216, 312, a.rng.uniform(-3, 3))
        a.rect(34, 38, 192, 216, fill="#26302b")
        kit.wallpaper(a, 34, 38, 192, 216, base="#1a2a22", stripe=30)
        a.circle(130, 140, 100, fill=a.radial([(0, lamp, 0.75), (0.6, lamp, 0.2), (1, lamp, 0)]))
        a.open("g", clip_path=a.clip('<rect x="34" y="38" width="192" height="216"/>'))
        fn(a, lamp)
        a.rect(34, 38, 192, 216, fill=a.radial([(0, "#000", 0), (0.7, "#000", 0.1), (1, "#000", 0.65)], r=0.7))
        a.close()
        a.rect(34, 38, 192, 216, fill="none", stroke="#8a826e", stroke_width=1)
        a.text(130, 296, str(room), size=38, family="monospace", fill=INK, text_anchor="middle", font_weight="bold")
        a.text(130, 321, kind, size=15.5, family="monospace", fill=kit.CARBON, text_anchor="middle", letter_spacing=0.4, font_weight="bold")
        a.close()
        kit.pin(a, 130, 34, pincol)
    draw.__doc__ = (f"Mosaic guest card for room {room}, {who}, pinned to cork: a silhouette against the room's own colour of lamp, "
                    f"known by {tell}; the room number typed beneath.")


for _g in GUESTS:
    _guest(*_g)


# ---- thing cards: index cards with a pen sketch ------------------------------------------------------
PEN = dict(fill="none", stroke=INK, stroke_width=2, stroke_linecap="round", stroke_linejoin="round")


def _t_bonded(a):   # never the place: its traces. A crate tag and red clay.
    a.path("M70,96 L96,76 H186 V136 H96 L70,116Z", fill="#d9b46a", stroke=INK, stroke_width=1.6)
    a.circle(86, 106, 5, fill="#f4efe2", stroke=INK, stroke_width=1.2)
    a.text(140, 114, "BH-0611", size=18, family="monospace", fill=INK, text_anchor="middle", font_weight="bold")
    kit.dabs(a, 150, 120, 70, 30, [kit.EVIDENCE, "#8a2a22"], n=22, angle=0.3, L=(3, 9), width=5, op=0.8)


def _t_case(a):
    a.rect(64, 70, 132, 92, rx=4, fill="#3b2a1c", stroke=INK, stroke_width=1.6)
    a.path("M110,70 V56 H150 V70", **PEN)
    for x, y in ((64, 70), (196, 70), (64, 162), (196, 162)):
        a.circle(x, y, 7, fill=kit.BRASS, stroke=INK, stroke_width=1)
    kit.dim(a, 64, 196, 182, "900", size=10)


def _t_ledger(a):
    for k in range(3):
        a.poly(kit.rot(kit.box(76 + k * 10, 62 + k * 8, 110, 86), 130, 110, -6 + k * 5), fill="#f1ecdf", stroke=INK, stroke_width=1.2)
    for k in range(6):
        a.line(104, 92 + k * 11, 198, 96 + k * 11, stroke=kit.CARBON, stroke_width=1.3, stroke_dasharray="16 4 8 5 20 4")
    a.line(170, 86, 174, 164, stroke=kit.EVIDENCE, stroke_width=1)


def _t_needle(a):
    a.line(52, 150, 196, 78, stroke="#8a8f92", stroke_width=6, stroke_linecap="round")
    a.line(52, 150, 196, 78, stroke="#dfe3e4", stroke_width=2, stroke_linecap="round")
    a.rect(198, 62, 20, 12, rx=3, fill="#8a8f92", stroke=INK, stroke_width=1, transform="rotate(-27 208 68)")
    a.poly([(186, 84), (204, 90), (212, 108), (196, 104)], fill="#f1ecdf", stroke=INK, stroke_width=1)
    a.path("M60,170 q20,-16 40,0 t40,0", fill="none", stroke=kit.RIVER, stroke_width=3)


def _t_photo(a):
    a.poly(kit.rot(kit.box(72, 58, 120, 110), 132, 113, 5), fill="#f4efe2", stroke=INK, stroke_width=1.2)
    a.poly(kit.rot(kit.box(82, 68, 100, 78), 132, 113, 5), fill="#3a3f42")
    a.poly(kit.rot(kit.box(130, 72, 40, 74), 132, 113, 5), fill="#70777a")
    a.path("M112,146 V116 Q112,102 124,102 Q136,102 136,116 V148Z", fill="#17191a")
    a.circle(124, 92, 9, fill="#c9c2b0")


def _t_gala(a):   # a notice, and gold leaf
    a.rect(64, 60, 132, 100, fill="#f1ecdf", stroke=INK, stroke_width=1.4)
    a.rect(72, 68, 116, 84, fill="none", stroke=kit.GOLD, stroke_width=2)
    kit.deco(a, "GALA", 130, 84, 28, color=INK, weight=0.14, anchor="middle")
    a.text(130, 138, "SUNDAY NIGHT", size=11, family="monospace", fill=INK, text_anchor="middle", letter_spacing=2)
    kit.dabs(a, 60, 150, 150, 30, [kit.GOLD, kit.BRASS_L], n=26, L=(1, 4), width=3.5, op=0.95)


def _t_stranger(a):   # from behind: hat, coat, an envelope
    a.path("M92,170 L100,104 Q130,88 160,104 L168,170Z", fill=INK)
    a.circle(130, 82, 15, fill=INK)
    a.ellipse(130, 74, 28, 5, fill=INK)
    a.path("M115,74 q0,-18 15,-18 q15,0 15,18Z", fill=INK)
    a.poly(kit.rot(kit.box(166, 128, 40, 26), 186, 141, -14), fill=kit.PAPER, stroke=INK, stroke_width=1.2)
    a.text(60, 86, "2:14", size=18, family="monospace", fill=kit.CARBON, font_weight="bold")


def _t_wren(a):   # the bird, never the man
    kit.wren(a, 132, 114, 42, color=INK)
    a.path("M70,160 q60,10 124,-4", **PEN)
    a.text(196, 82, "0214", size=13, family="monospace", fill=kit.CARBON, text_anchor="middle")


def _t_drost(a):   # never seen, never heard: an empty frame
    a.rect(82, 56, 96, 112, fill="#f1ecdf", stroke=INK, stroke_width=1.6)
    a.rect(90, 64, 80, 96, fill="none", stroke=INK, stroke_width=0.8, stroke_dasharray="4 4")
    a.hatch(90, 64, 80, 96, angle=45, spacing=9, stroke=INK, stroke_width=0.4, clip=a.clip('<rect x="90" y="64" width="80" height="96"/>'))
    a.text(130, 124, "?", size=44, family="serif", fill=INK, text_anchor="middle", font_style="italic")


def _t_fenn(a):   # last season's log
    a.poly(kit.rot(kit.box(70, 62, 120, 100), 130, 112, -5), fill=kit.BOTTLE, stroke=INK, stroke_width=1.6)
    a.poly(kit.rot(kit.box(70, 62, 16, 100), 130, 112, -5), fill=kit.BOTTLE_D)
    a.poly(kit.rot(kit.box(104, 80, 68, 30), 130, 112, -5), fill="#f1ecdf", stroke=INK, stroke_width=1)
    a.text(138, 100, "A. FENN", size=13, family="monospace", fill=INK, text_anchor="middle", transform="rotate(-5 130 112)")
    a.text(138, 142, "aud.", size=14, family="cursive", fill=kit.GOLD, text_anchor="middle", font_style="italic", transform="rotate(-5 130 112)")


def _t_you(a):   # the rose, dark
    kit.set_nick_bg(a, "#f1ecdf")
    kit.rose(a, 130, 108, 44, lit=None)
    a.text(130, 176, "400", size=14, family="monospace", fill=kit.CARBON, text_anchor="middle", font_weight="bold")


THINGS = [("bonded-house", "BONDED HOUSE", _t_bonded, "a crate tag marked BH-0611 and a smear of red clay, since the place itself is never shown"),
          ("case", "THE CASE", _t_case, "a flat hard case with brass corners, dimensioned"),
          ("ledger", "THE LEDGER", _t_ledger, "three folded pages of blue columns with one red margin rule"),
          ("needle", "THE NEEDLE", _t_needle, "a steel knitting needle with its cap off and a curl of paper showing"),
          ("photograph", "THE PHOTOGRAPH", _t_photo, "a snapshot of a figure at a door"),
          ("gala", "THE GALA", _t_gala, "a gold-bordered notice and a scatter of gold leaf"),
          ("stranger", "THE STRANGER", _t_stranger, "a man in a hat seen from behind with an envelope, and the time 2:14"),
          ("wren", "WREN", _t_wren, "a wren, the bird, on a line, and the digits 0214; the man is never drawn"),
          ("drost", "DROST", _t_drost, "an empty hatched frame with a question mark, for someone never seen and never heard"),
          ("fenn", "FENN", _t_fenn, "last season's green logbook with a label and a column headed aud."),
          ("you", "YOU", _t_you, "a brass rose gone dark, and the number 400")]


def _thing(key, label, fn, tell):
    @asset(G, f"pin-{key}", group="pieces", title=f"Mosaic pin card: {label.title()}", w=260, h=240, row=ROW)
    def draw(a: Art):
        board(a)
        kit.paper_card(a, 24, 30, 212, 182, a.rng.uniform(-4, 4), fill="#efe4c8")
        a.line(32, 184, 228, 184, stroke="#c26a5a", stroke_width=1, opacity=0.7)
        for k in range(5):
            a.line(32, 64 + k * 26, 228, 64 + k * 26, stroke="#9fb0c0", stroke_width=0.6, opacity=0.6)
        fn(a)
        # the label is set large: on the board the card is shown about a hundred pixels wide
        a.text(130, 208, label, size=24 if len(label) <= 12 else 21, family="monospace", fill=INK, text_anchor="middle", font_weight="bold", letter_spacing=0.5)
        a.close()
        kit.pin(a, 130, 40, a.rng.choice(["#c33", "#2a5ab0", "#d9b02a", "#eee"]))
    draw.__doc__ = f"Mosaic pin card for {label.title()}: a ruled index card pinned to cork, with a pen sketch of {tell}."


for _t in THINGS:
    _thing(*_t)


# ---- question cards -----------------------------------------------------------------------------------
QUESTIONS = [("give", "met", ["What did she", "give him?"], "402 - 404"), ("take", "after", ["What did", "she take?"], "403 - BONDED HOUSE"),
             ("guarding", "works", ["Who is he", "guarding it for?"], "401 - BONDED HOUSE"), ("sisters", "family", ["Why did", "she call?"], "405 - 406"),
             ("gather", "works", ["Why gather", "them here?"], "WREN - ALL SIX"), ("watcher", "works", ["Who watches", "the watcher?"], "WREN - YOU")]


def _question(key, link, lines, ends):
    @asset(G, f"question-{key}", group="pieces", title=f"Mosaic question card: {' '.join(lines)}", w=320, h=220, row=ROW)
    def draw(a: Art):
        colr, dash = THREAD[link]
        board(a)
        # the taut thread that opened it, leaving the pin to both sides
        for dy in ((-3, 3) if link == "family" else (0,)):
            a.line(-10, 150 + dy, 160, 44 + dy, stroke=colr, stroke_width=2.6, stroke_dasharray=dash, stroke_linecap="round")
            a.line(160, 44 + dy, 330, 120 + dy, stroke=colr, stroke_width=2.6, stroke_dasharray=dash, stroke_linecap="round")
        kit.paper_card(a, 36, 36, 248, 150, a.rng.uniform(-3, 3), fill="#f6f1e0")
        a.rect(36, 36, 248, 10, fill=colr, opacity=0.85)
        kit.hand(a, 160, 96, lines, size=27, color="#2a2a2a", lead=1.2, tilt=1.6, family="serif")
        a.text(160, 172, ends, size=11, family="monospace", fill=kit.CARBON, text_anchor="middle", letter_spacing=2)
        a.close()
        kit.pin(a, 160, 44, colr if link != "after" else "#eee")
    draw.__doc__ = (f"Mosaic question card pinned at the top of the board: \"{' '.join(lines)}\", opened by the true link {ends}, with that link's "
                    "thread pulled taut through its pin.")


for _q in QUESTIONS:
    _question(*_q)


# ---- clippings: the evening paper ----------------------------------------------------------------------
def _greek(a, x, y, w, rows, lh=9):
    d = []
    for k in range(rows):
        xx = x
        while xx < x + w - 8:
            ww = min(a.rng.uniform(8, 34), x + w - xx)
            d.append(f"M{f(xx)},{f(y + k * lh)}h{f(ww)}")
            xx += ww + 4
    a.path("".join(d), stroke="#3a3a3a", stroke_width=2.2, fill="none", opacity=0.55)


def _clip(key, head, sub, doc, extra=None):
    @asset(G, f"clipping-{key}", group="documents", title=f"Evening paper clipping: {head}", w=440, h=320, row=ROW)
    def draw(a: Art):
        board(a)
        r = a.rng
        deg = r.uniform(-3, 3)
        a.open("g", transform=f"rotate({deg:.1f} 220 160)")
        edge = [(40, 44)] + [(40 + i * 24, 40 + r.uniform(-3, 3)) for i in range(1, 15)] + [(400, 42), (402, 280)] + \
               [(400 - i * 24, 282 + r.uniform(-4, 4)) for i in range(1, 15)] + [(38, 280)]
        a.poly([(x + 5, y + 6) for x, y in edge], fill="#000", opacity=0.28)
        a.poly(edge, fill="#e4dcc6")
        a.text(56, 72, "THE EVENING COURANT", size=11, family="serif", fill="#3a3a3a", letter_spacing=3)
        a.line(56, 78, 386, 78, stroke="#3a3a3a", stroke_width=1.6)
        a.line(56, 81, 386, 81, stroke="#3a3a3a", stroke_width=0.5)
        size = 27 if len(head) < 26 else 22
        words, lines, cur = head.split(), [], ""
        for wd in words:
            if len(cur) + len(wd) > (22 if size == 27 else 27):
                lines.append(cur.strip()); cur = ""
            cur += wd + " "
        lines.append(cur.strip())
        for k, ln in enumerate(lines):
            a.text(56, 112 + k * (size + 3), ln, size=size, family="serif", fill="#1a1a1a", font_weight="bold")
        y = 112 + len(lines) * (size + 3)
        if sub:
            a.text(56, y, sub, size=13, family="serif", fill="#3a3a3a", font_style="italic")
            y += 18
        if extra:
            for k, ln in enumerate(extra):
                a.text(56, y + 4 + k * 19, ln, size=13.5, family="serif", fill="#1a1a1a")
                a.line(56, y + 9 + k * 19, 386, y + 9 + k * 19, stroke="#3a3a3a", stroke_width=0.3)
        else:
            _greek(a, 56, y + 2, 158, int((268 - y) / 9))
            _greek(a, 228, y + 2, 158, int((268 - y) / 9))
        a.path("M150,150 q60,-10 120,6", fill="none", stroke=kit.EVIDENCE, stroke_width=0)   # nothing circled: no red off evidence
        a.close()
        kit.pin(a, 220, 52, "#d9b02a")
    draw.__doc__ = doc


_clip("caterers", "Gala caterers briefed tonight", "Assembly Rooms", "A torn clipping from the evening paper pinned to cork, headed Gala caterers briefed tonight, over two columns of small print.")
_clip("orchid", "Orchid week at the Glasshouse", "Late opening", "A torn clipping from the evening paper pinned to cork, headed Orchid week at the Glasshouse, over two columns of small print.")
_clip("listings", "Tonight in town", None, "A torn clipping of the evening paper's listings pinned to cork: the four closing times the first night's statement turns on.",
      extra=["Glasshouse late opening ends 23:00", "Printworks night run ends 23:30", "Assembly Rooms gala rehearsal ends 00:30", "Fish market trade ends 02:15"])


# ---- typed slips: stamped statement rows ----------------------------------------------------------------
SLIPS = [("403", "ROOM 403 WENT TO THE FISH MARKET", "AND CAME BACK AT 02:45.", "entered", "NIGHT 1"),
         ("402", "ROOM 402 WENT TO THE GLASSHOUSE", "AND CAME BACK AT 23:25.", "entered", "NIGHT 1"),
         ("401", "ROOM 401 WENT TO THE BONDED HOUSE", "AND CAME BACK AT 01:30.", "amended", "NIGHT 1"),
         ("406", "ROOM 406 WENT TO THE PRINTWORKS", "AND CAME BACK AT 00:05.", "typed", "NIGHT 1")]


def _slip(room, l1, l2, mark, night):
    @asset(G, f"slip-row-{room}", group="documents", title=f"Typed slip: {l1.title()} {l2.lower()}", w=560, h=200, row=ROW)
    def draw(a: Art):
        board(a)
        r = a.rng
        a.open("g", transform=f"rotate({r.uniform(-2.5, 2.5):.1f} 280 100)")
        a.rect(35, 49, 490, 108, fill="#000", opacity=0.28)
        a.rect(30, 42, 490, 108, fill="#f1ecdf")
        kit.carbon_smudge(a, 40, 50, 460, 90, n=3, op=0.2)
        a.path("M30,42 l8,6 l8,-6 l8,6 l8,-6 l8,6 l8,-6", fill="none", stroke="#b8ab8a", stroke_width=0.0)
        col = INK if mark == "typed" else kit.CARBON
        kit.typed(a, 52, 86, l1, size=19, color=col)
        kit.typed(a, 52, 116, l2, size=19, color=col)
        kit.typed(a, 52, 140, night, size=11, color=kit.CARBON, op=0.7)
        if mark == "entered":
            kit.stamp(a, 440, 112, 120, 46, ["ENTERED"], color="#5a4a9a", deg=-8, size=20)
        elif mark == "amended":
            kit.stamp(a, 440, 112, 126, 46, ["AMENDED"], color="#2f5a40", deg=5, size=20)
        else:   # a row Wren typed: its thread frays overnight
            a.text(498, 140, "typed: H.W.", size=12, family="serif", fill=INK, text_anchor="end", font_style="italic")
            for k in range(7):
                a.path(f"M56,50 q{r.uniform(-16, 16):.0f},{-10 - k * 2} {r.uniform(-22, 22):.0f},{-34 - r.uniform(0, 12):.0f}", fill="none", stroke=kit.EVIDENCE,
                       stroke_width=1.1, opacity=0.9)
        a.close()
        kit.pin(a, 56, 50, "#eee" if mark != "typed" else "#c33")
    draw.__doc__ = (f"A typed statement row cut into a slip and pinned to cork: \"{l1.title()} {l2.lower()}\" "
                    + {"entered": "It carries the violet ENTERED stamp.", "amended": "It carries the green AMENDED stamp of the carbon.",
                       "typed": "It is in another machine's black type, and the red thread at its pin has frayed."}[mark])


for _s in SLIPS:
    _slip(*_s)

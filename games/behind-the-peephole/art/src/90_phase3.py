"""Phase 3 (accepted 2026-11-15, built 2026-11-16): the seventh row, the 1971 page, the lens in your
own door, the ending-card lettering and the second shift's documents."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
C = kit.CARBON
INK = kit.INK


# ---- the watcher clue kind, and the five marks of the seventh row ----------------------------------
@asset(G, "clue-watcher", group="pieces", title="Clue kind: Watcher", w=160, h=160, row="Clue-kind icons, the seven details")
def clue_watcher(a: Art):
    """Clue-kind icon in technical pen inside a brass ring: a brass rose with an eye drawn in its centre and a
    seventh tick beside six, for the watcher, the kind of clue that is about the one at the glass."""
    a.rect(0, 0, 160, 160, rx=10, fill="#f1ecdf")
    a.rect(0, 0, 160, 160, rx=10, fill=a.radial([(0, "#fff", 0.5), (1, "#b8ab8a", 0.5)], r=0.75))
    a.circle(80, 70, 56, fill="#f7f3e8", stroke=kit.BRASS, stroke_width=4)
    a.circle(80, 70, 51, fill="none", stroke=kit.BRASS_D, stroke_width=0.8)
    pen = dict(fill="none", stroke=INK, stroke_width=2.2, stroke_linecap="round", stroke_linejoin="round")
    for i in range(8):
        t = 2 * math.pi * i / 8
        a.circle(80 + 22 * math.cos(t), 62 + 22 * math.sin(t), 11, **pen)
    a.circle(80, 62, 18, fill="#f7f3e8", stroke=INK, stroke_width=2.2)
    a.path("M66,62 Q80,50 94,62 Q80,74 66,62Z", **pen)
    a.circle(80, 62, 4.5, fill=INK)
    a.path("".join(f"M{48 + k * 9},{100}v12" for k in range(6)), fill="none", stroke=INK, stroke_width=1.8)
    a.path("M106,100v12", fill="none", stroke=kit.EVIDENCE, stroke_width=2.4, stroke_linecap="round")
    a.text(80, 148, "WATCHER", size=13, family="monospace", fill=C, text_anchor="middle", letter_spacing=2, font_weight="bold")


def _mark(key, n, head, line, doc, fn):
    @asset(G, f"watcher-{key}", group="pieces", title=f"The seventh row, mark {n} of 5: {head}", w=320, h=220,
           row="Clue-kind icons, the seven details")
    def draw(a: Art):
        a.rect(0, 0, 320, 220, fill="#e9e1cb")
        kit.paper_card(a, 10, 8, 300, 200, deg=-1.2, fill="#f6f1e4")
        a.rect(10, 8, 300, 26, fill=C, opacity=0.9)
        a.text(20, 26, f"WATCHER  {n}/5", size=13, family="monospace", fill="#f6f1e4", font_weight="bold", letter_spacing=2)
        a.text(300, 26, head.upper(), size=11, family="monospace", fill="#f6f1e4", text_anchor="end", letter_spacing=1)
        a.open("g", clip_path=a.clip('<rect x="14" y="38" width="292" height="128"/>'))
        fn(a)
        a.close()
        a.line(20, 170, 300, 170, stroke=C, stroke_width=0.6, stroke_dasharray="2 3")
        kit.typed(a, 20, 192, line, size=12, color=INK)
        a.close()
    draw.__doc__ = doc


def _m_dots(a):
    for k, (night, filled) in enumerate([(1, 1), (3, 1), (4, 2), (5, 1), (6, 1)]):
        x = 26 + k * 56
        a.rect(x, 46, 48, 66, fill="#f3f1ea", stroke="#b8ab8a", stroke_width=0.8)
        a.path(f"M{x + 4},{90} q12,-10 22,0 t22,0", fill="none", stroke=kit.RIVER, stroke_width=4, opacity=0.7)
        a.rect(x + 4, 52, 40, 22, fill=kit.RIVER_L, opacity=0.5)
        for d in range(filled):
            a.circle(x + 40 - d * 9, 104, 3.6, fill=kit.BRASS, stroke=kit.BRASS_D, stroke_width=0.6)
        a.text(x + 24, 128, f"N{night}", size=12, family="monospace", fill=C, text_anchor="middle")
    a.text(160, 158, "night four: two dots", size=15, family="cursive", fill="#1a2a5a", text_anchor="middle", font_style="italic")


def _m_chalk(a):
    a.rect(14, 38, 292, 128, fill="#3a2716")
    for c in range(7):
        x = 30 + c * 40
        if c < 6:
            a.text(x + 8, 58, str(401 + c), size=11, family="monospace", fill="#e9e2cf", text_anchor="middle", opacity=0.85)
        for k in range([5, 6, 4, 6, 5, 3, 5][c]):
            a.path(f"M{x + k * 4},{68} l1.5,{70}", stroke="#e9e2cf", stroke_width=2.2, opacity=0.85)
    a.circle(30 + 6 * 40 + 8, 52, 9, fill="none", stroke=kit.EVIDENCE, stroke_width=1.6)


def _m_bell(a):
    a.rect(14, 38, 292, 128, fill=kit.WOOD)
    for k in range(7):
        x = 36 + k * 40
        a.line(x, 44, x, 92 if k < 6 else 112, stroke=kit.BRASS_L, stroke_width=1.6)
        a.circle(x, 98 if k < 6 else 118, 7, fill=kit.brass_fill(a), stroke=kit.BRASS_D, stroke_width=1)
        if k < 6:
            a.rect(x - 15, 126, 30, 14, fill=kit.PAPER, stroke=kit.BRASS_D, stroke_width=0.6)
            a.text(x, 137, str(401 + k), size=10, family="monospace", fill=INK, text_anchor="middle")
        else:
            a.rect(x - 15, 126, 30, 14, fill="none", stroke=kit.BRASS_D, stroke_width=0.8, stroke_dasharray="2 2")
            a.path(f"M{x - 12},{110} q-6,8 0,16 M{x + 12},{110} q6,8 0,16", fill="none", stroke=kit.AMBER_L, stroke_width=1.4)


def _m_aud(a):
    a.rect(14, 38, 292, 128, fill="#f4efdf")
    heads = ["NT", "RM", "RETURN", "AUD."]
    xs = [24, 64, 112, 238]
    for x, h in zip(xs, heads):
        kit.typed(a, x, 56, h, size=11, color=INK if h != "AUD." else kit.EVIDENCE, weight="bold")
    rows = [("1", "402", "23:25"), ("1", "406", "00:05"), ("2", "405", "01:57"), ("3", "401", "02:16")]
    for k, (n, r, t) in enumerate(rows):
        y = 78 + k * 22
        a.line(20, y + 6, 300, y + 6, stroke="#b8ab8a", stroke_width=0.5)
        for x, s in zip(xs, (n, r, t)):
            a.text(x, y, s, size=13, family="cursive", fill="#1a2a5a", font_style="italic")
        a.text(xs[3], y, "A.F.", size=13, family="cursive", fill="#1a2a5a", font_style="italic")
    a.line(226, 44, 226, 160, stroke=kit.EVIDENCE, stroke_width=0.8)


def _m_ledger(a):
    a.rect(14, 38, 292, 128, fill="#efe4c8")
    a.line(60, 40, 60, 166, stroke=kit.EVIDENCE, stroke_width=0.8, opacity=0.6)
    for k, r in enumerate(["401", "402", "403", "404", "405", "406"]):
        y = 52 + k * 16
        kit.typed(a, 22, y, r, size=11, color=INK, op=0.75)
        a.text(68, y, "booked  W.   0214", size=11, family="monospace", fill=INK, opacity=0.6)
    y = 52 + 6 * 16 + 4
    kit.typed(a, 22, y, "400", size=12, color=kit.EVIDENCE, weight="bold")
    a.text(68, y, "linen room, night auditor", size=13, family="cursive", fill="#1a2a5a", font_style="italic")


_mark("dots", 1, "Mara's dots", "SHE LOGS THE ONE AT THE GLASS.",
      "The first mark: five of Mara's river watercolours in a row, nights one to six, each with brass dots in its "
      "corner, and night four with two where there should be one.", _m_dots)
_mark("chalk", 2, "Dora's ticks", "THE SEVENTH COLUMN HAS NO ROOM.",
      "The second mark: Dora's chalk ticks inside the lost-property door, seven columns, six headed with a room, the "
      "seventh bare and ringed in red.", _m_chalk)
_mark("bell", 3, "The bare pull", "THE BOARD RINGS FOR THE OFFICE.",
      "The third mark: the office bell board, six pulls with numbered cards and a seventh, longer, with an empty card, "
      "still swinging.", _m_bell)
_mark("aud", 4, "Fenn's aud. column", "EVERY ROW SIGNED BY THE AUDITOR.",
      "The fourth mark: a page of Fenn's log from last season, night, room and return, and a fourth column headed aud. "
      "in red where every row is initialled.", _m_aud)
_mark("ledger", 5, "The ledger", "BOOKED AND PAID WITH THE SIX.",
      "The fifth mark: the booking ledger, six rooms each booked by W. on account 0214, and a seventh line in a hand: "
      "400, linen room, night auditor.", _m_ledger)


@asset(G, "ui-seventh-row", group="ui", title="The seventh row: the notebook badge", w=160, h=160,
       row="Ornaments (catch ring, watch face, bell strip, wren blind stamp, strip dots)")
def badge(a: Art):
    """A round brass badge for the notebook of the seventh row: a small rose and the numeral VII in deco line."""
    a.circle(80, 80, 78, fill=kit.brass_fill(a), stroke=kit.BRASS_D, stroke_width=3)
    a.circle(80, 80, 64, fill=kit.BOTTLE_D, stroke=kit.BRASS_D, stroke_width=1.5)
    kit.rose(a, 80, 58, 20, lit=kit.AMBER_L, glow=False)
    kit.deco(a, "VII", 80, 90, 34, color=kit.BRASS_L, weight=0.14, tracking=0.25, anchor="middle")


# ---- the 1971 page --------------------------------------------------------------------------------
@asset(G, "doc-1971-page", group="documents", title="The 1971 page: a statement form signed by H. Wren, night auditor",
       w=800, h=1100, row="Forms S-1 to S-7 and four stamps")
def page_1971(a: Art):
    """A yellowed statement form from 1971 found behind the booking ledger: six rooms and their returns typed on an
    older machine, a seventh line under them reading 400 and witness, signed H. Wren, night auditor; one row struck
    through in another hand with a single word written over it."""
    a.paper("#e6d6ad", grain=0.35)
    a.rect(0, 0, 800, 1100, fill=a.radial([(0, "#fff", 0), (0.7, "#a07a3a", 0.12), (1, "#5d4518", 0.45)], r=0.75))
    kit.carbon_smudge(a, 0, 0, 800, 1100, n=5, op=0.1)
    kit.typed(a, 70, 90, "THE CROSSING  .  NIGHT LOG  .  STATEMENT", size=20, color=INK, weight="bold")
    kit.typed(a, 70, 124, "FORM S-1  .  NIGHT 7  .  14 NOV 1971", size=15, color=INK)
    a.line(70, 140, 730, 140, stroke=INK, stroke_width=1.4)
    rows = [("401", "RETURNED 01:10"), ("402", "RETURNED 23:40"), ("403", "RETURNED 02:50"),
            ("404", "RETURNED 00:30"), ("405", "LEFT BY THE LOBBY 05:10"), ("406", "RETURNED 01:55")]
    for k, (r, s) in enumerate(rows):
        y = 200 + k * 62
        kit.typed(a, 70, y, r, size=22, color=INK, weight="bold")
        a.rect(140, y - 26, 590, 38, fill="none", stroke=INK, stroke_width=0.8, opacity=0.6)
        kit.typed(a, 154, y, s, size=17, color=INK, op=0.85)
    # the struck row: 405, in another hand
    y = 200 + 4 * 62
    a.wobble([(150, y - 7), (720, y - 9)], amp=1.4, stroke=kit.EVIDENCE, stroke_width=3)
    a.text(520, y + 30, "not her", size=26, family="cursive", fill=kit.EVIDENCE, font_style="italic",
           transform=f"rotate(-4 520 {y + 30})")
    # the seventh line
    y = 200 + 6 * 62 + 20
    kit.typed(a, 70, y, "400", size=22, color=INK, weight="bold")
    a.rect(140, y - 26, 590, 38, fill="none", stroke=INK, stroke_width=0.8, stroke_dasharray="6 3")
    kit.typed(a, 154, y, "WITNESS", size=19, color=INK, weight="bold")
    kit.stamp(a, 600, y + 4, 180, 56, ["WITNESS"], color=kit.EVIDENCE, deg=-8, sub="ROW SEVEN")
    kit.typed(a, 70, 790, "SIGNED:", size=16, color=INK)
    a.text(180, 792, "H. Wren", size=40, family="cursive", fill="#1a2a5a", font_style="italic", transform="rotate(-3 180 792)")
    kit.typed(a, 180, 830, "NIGHT AUDITOR, FOURTH FLOOR", size=14, color=INK)
    kit.wren(a, 690, 940, 30, blind=True)
    kit.typed(a, 70, 1040, "COPY - NOT VALID WITHOUT THE SEAL OF THE MANAGEMENT", size=10, color=INK, op=0.6)
    a.vignette(0.35, color="#3a2a10")


# ---- the lens in your own door --------------------------------------------------------------------
@asset(G, "lens-own-door", group="backdrops", title="Your own rose, from inside: the passage at 2:14",
       w=960, h=960, row="Room plates, gouache paint-over")
def own_door(a: Art):
    """The view out through the lens in your own office door, fitted backwards: the valet passage bowed into a fisheye
    circle, six brass roses glowing down its length, the far stair end dark, and nearer than all of them a shape in a
    raincoat standing at the door. Paint edges only, no line."""
    a.rect(0, 0, 960, 960, fill="#050403")
    cx = cy = 480
    R = 440
    a.open("g", clip_path=a.clip(f'<circle cx="{cx}" cy="{cy}" r="{R}"/>'))
    a.rect(0, 0, 960, 960, fill=a.radial([(0, "#3d2a14", 1), (0.6, "#1f2a1f", 1), (1, "#070605", 1)], cx=0.5, cy=0.46, r=0.6))
    # walls bowed toward the vanishing point
    for side in (-1, 1):
        d = f"M{cx + side * 70},{cy - 90} Q{cx + side * 300},{cy - 260} {cx + side * 520},{cy - 520} L{cx + side * 520},{cy + 520} Q{cx + side * 300},{cy + 300} {cx + side * 70},{cy + 110}Z"
        a.path(d, fill=kit.BOTTLE if side < 0 else "#1a3326", opacity=0.92)
    kit.dabs(a, 0, 0, 960, 960, [kit.BOTTLE_L, "#2a4a38", kit.AMBER, "#3d2a14"], n=420, L=(8, 26), width=7, op=0.22)
    a.path(f"M{cx - 70},{cy + 110} Q{cx},{cy + 130} {cx + 70},{cy + 110} L{cx + 520},{cy + 520} L{cx - 520},{cy + 520}Z", fill="#2a1a10")
    a.path(f"M{cx - 30},{cy + 120} L{cx - 160},{cy + 520} L{cx + 160},{cy + 520} L{cx + 30},{cy + 120}Z", fill="#5a1e1a", opacity=0.6)
    for k in range(6):
        t = (k + 1) / 7
        x = cx - 70 - t * t * 420
        y = cy - 10 - t * 40
        r = 6 + t * t * 34
        a.circle(x, y, r * 3.2, fill=a.radial([(0, kit.LAMPS[5 - k], 0.45), (1, kit.LAMPS[5 - k], 0)]))
        a.circle(x, y, r, fill=kit.BRASS, opacity=0.85)
        a.circle(x, y, r * 0.35, fill="#fff3d0", opacity=0.9)
    a.rect(cx - 26, cy - 70, 52, 120, fill="#080706", opacity=0.9)
    # the figure at the door, near and bowed: no face
    a.path(f"M{cx + 60},{cy + 560} Q{cx + 120},{cy + 120} {cx + 210},{cy - 40} Q{cx + 280},{cy - 150} {cx + 360},{cy - 120} "
           f"Q{cx + 470},{cy - 40} {cx + 520},{cy + 200} L{cx + 520},{cy + 560}Z", fill="#0d0d0f")
    a.ellipse(cx + 300, cy - 210, 86, 96, fill="#0d0d0f")
    a.path(f"M{cx + 210},{cy - 260} Q{cx + 300},{cy - 330} {cx + 400},{cy - 262} L{cx + 410},{cy - 240} L{cx + 200},{cy - 236}Z", fill="#17171a")
    kit.dabs(a, cx + 120, cy - 300, 400, 800, ["#26262c", "#3a3a40", "#121214"], n=140, L=(10, 30), width=9, op=0.3)
    a.close()
    a.circle(cx, cy, R, fill=a.radial([(0, "#000", 0), (0.78, "#000", 0.15), (1, "#000", 0.85)]))
    a.circle(cx, cy, R + 8, fill="none", stroke=kit.BRASS_D, stroke_width=16)
    a.circle(cx, cy, R + 2, fill="none", stroke=kit.BRASS, stroke_width=3, opacity=0.8)


@asset(G, "eye-at-own-rose", group="figures", title="An eye at your own rose, from the passage side", w=480, h=320,
       row="Lew, Dora, Fenn, 3 poses each (Fenn from behind)")
def other_eye(a: Art):
    """An eye pressed close to the other side of the lens, in gouache: lamplit skin, the iris dark, a lash line, no
    face beyond it. Painted on transparent ground for the eye at the hole to draw over the passage."""
    cx, cy = 240, 160
    a.ellipse(cx, cy, 230, 150, fill=a.radial([(0, "#c08a5a", 0.95), (0.65, "#7a4e30", 0.75), (1, "#2a1a10", 0)]))
    kit.dabs(a, 30, 30, 420, 260, ["#b07a4c", "#d4a272", "#6a4228"], n=220, L=(8, 22), width=8, op=0.25,
             inside=lambda x, y: ((x - cx) / 200) ** 2 + ((y - cy) / 120) ** 2 < 1)
    a.path(f"M{cx - 150},{cy} Q{cx},{cy - 92} {cx + 150},{cy} Q{cx},{cy + 80} {cx - 150},{cy}Z", fill="#efe6d6")
    a.circle(cx + 8, cy - 2, 54, fill=a.radial([(0, "#2a2a22", 1), (0.6, "#4a4636", 1), (1, "#1a1814", 1)]))
    a.circle(cx + 8, cy - 2, 22, fill="#050505")
    a.circle(cx - 8, cy - 18, 9, fill="#fff", opacity=0.8)
    a.path(f"M{cx - 150},{cy} Q{cx},{cy - 92} {cx + 150},{cy}", fill="none", stroke="#1a100a", stroke_width=10, opacity=0.8)
    a.path(f"M{cx - 160},{cy - 40} Q{cx},{cy - 130} {cx + 170},{cy - 44}", fill="none", stroke="#3a2416", stroke_width=14, opacity=0.5)


# ---- ending-card lettering ------------------------------------------------------------------------
ENDS = [("the-sitter", "THE SITTER", "A WITNESS"), ("under-the-door", "UNDER THE DOOR", "THE CARBONS"),
        ("wrong-picture", "THE WRONG PICTURE", "I DID THAT ONCE"), ("open-door", "THE OPEN DOOR", "STOP LOOKING UP"),
        ("next-watcher", "THE NEXT WATCHER", "THE LADDER")]


def _ending(key, name, sub):
    @asset(G, f"ending-title-{key}", group="title", title=f"Ending-card lettering: {name.title()}", w=1600, h=260,
           row="Title lettering; the \"o\" a lit rose")
    def draw(a: Art):
        a.rect(0, 40, 1600, 200, fill=a.radial([(0, "#000", 0.7), (1, "#000", 0)], r=0.6))
        size = 74 if len(name) < 14 else 60
        kit.deco(a, name, 806, 70, size, color="#000", weight=0.16, anchor="middle", opacity=0.55)
        kit.deco(a, name, 800, 64, size, color=a.gradient([(0, kit.BRASS_L), (0.5, kit.BRASS), (1, "#8a6a28")]),
                 inline="#2a1a0c", weight=0.14, anchor="middle")
        w = kit.deco_width(name, size) / 2
        for side in (-1, 1):
            a.line(800 + side * (w + 30), 64 + size / 2, 800 + side * (w + 150), 64 + size / 2, stroke=kit.BRASS, stroke_width=2)
        kit.rose(a, 800, 186, 16, lit=kit.AMBER_L, glow=False)
        kit.deco(a, sub, 800, 214, 22, color=kit.BRASS_L, weight=0.12, tracking=0.5, anchor="middle")
    draw.__doc__ = (f"The lettering laid over the generated card of the ending {name.title()}: its name in the deco "
                    f"monoline brass of the title, rules either side, a small lit rose and the line {sub.title()}.")


for _e in ENDS:
    _ending(*_e)


# ---- the second shift ----------------------------------------------------------------------------
@asset(G, "doc-second-tags", group="documents", title="Second shift: lost property, six new tags",
       w=800, h=480, row="The six left things")
def second_tags(a: Art):
    """Lost property on a second shift: six manila tags on strings in the bottom drawer, one for each of this season's
    guests, in Dora's hand, where last season's six used to be."""
    a.rect(0, 0, 800, 480, fill="#3a2716")
    kit.dabs(a, 0, 0, 800, 480, ["#4a3420", "#2a1a10"], n=160, L=(20, 60), width=6, op=0.3, angle=0)
    things = [("401", "a kit bag strap"), ("402", "a pressed orchid"), ("403", "one white glove"),
              ("404", "a press lanyard"), ("405", "a chess knight"), ("406", "a paper boat")]
    for k, (r, t) in enumerate(things):
        x = 30 + (k % 3) * 256
        y = 40 + (k // 3) * 214
        a.path(f"M{x + 20},{y} q40,-30 80,0", fill="none", stroke=kit.PAPER_D, stroke_width=1.4)
        kit.paper_card(a, x, y + 10, 220, 150, deg=(k - 2.5) * 1.6, fill="#d9b878", edge="#8a6a38")
        a.circle(x + 22, y + 30, 8, fill="#3a2716", stroke="#8a6a38", stroke_width=2)
        kit.typed(a, x + 44, y + 40, r, size=22, color=INK, weight="bold")
        a.text(x + 20, y + 92, t, size=22, family="cursive", fill="#1a2a5a", font_style="italic")
        a.text(x + 20, y + 132, "kept, D.", size=16, family="cursive", fill="#1a2a5a", font_style="italic", opacity=0.8)
        a.close()

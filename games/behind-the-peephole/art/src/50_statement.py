"""The Statement: forms S-1 to S-7 as carbon-copy typewriter forms, four rubber stamps, and the seven
clue-kind icons."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
C = kit.CARBON
ROW = "Forms S-1 to S-7 and four stamps"
FW, FH = 800, 1100
ROOMS = [401, 402, 403, 404, 405, 406]

FORMS = [
    (1, "ROOM x PLACE", [("PLACE", ["THE GLASSHOUSE", "THE PRINTWORKS", "ASSEMBLY ROOMS", "THE BONDED HOUSE", "THE TRAM DEPOT", "THE FISH MARKET"])]),
    (2, "ROOM x OBJECT x ACT", [("OBJECT", ["PHOTOCOPIED PAGE", "AN ORCHID", "SECURITY PASS", "CABLE SPOOL", "COIL OF ROPE", "CRATE TAG"]),
                                ("ACT", ["RECEIVED", "HANDED OVER", "WAS BRIEFED", "ERASED", "BOUGHT", "STOLE"])]),
    (3, "ROOM x WHO THEY CALLED x HOW IT ENDED", [("WHO THEY CALLED", ["FRIENDS OF RIVER", "HIS DAUGHTER", "ROOM 406", "HIS EDITOR", "HER NEIGHBOUR", "ABBOT FINE ART"]),
                                                  ("HOW IT ENDED", ["NEVER CONNECTED", "READ TO THE END", "CUT SHORT", "HUNG UP ANGRY", "WHISPERED", "LEFT A MESSAGE"])]),
    (4, "HOST ROOM x VISITOR x WHAT PASSED", [("VISITOR", ["LEW THE PORTER", "ROOM 401", "ROOM 404", "THE STRANGER", "ROOM 405", "ROOM SERVICE"]),
                                              ("WHAT PASSED", ["AN IRON", "BUSINESS CARD", "KNITTING NEEDLE", "ENVELOPE, MONEY", "A PHOTOGRAPH", "A POT OF TEA"])]),
    (5, "ROOM x NAME x COVER STORY", [("NAME", ["JONAH FERRER", "INES MARO", "TOMAS VELL", "RUTH SAELENS", "KIT SAELENS", "MARA LINDE"]),
                                      ("COVER STORY", ["WINE SALESMAN", "INTERPRETER", "INSURANCE ASSR.", "NURSE", "STUDENT", "RESTORER"])]),
    (6, "ROOM x BOOKED BY x NIGHT OF THE 2:14 KNOCK", [("BOOKED BY", ["CORVANE RISK", "ASHDOWN RELOC.", "ABBOT FINE ART", "EVENING COURANT", "LANTERN", "FRIENDS OF RIVER"]),
                                                       ("NIGHT OF 2:14 KNOCK", ["NIGHT ONE", "NIGHT TWO", "NIGHT THREE", "NIGHT FOUR", "NIGHT FIVE", "NIGHT SIX"])]),
]
BACK = {401: "01:30", 402: "23:25", 403: "02:45", 404: "00:45", 405: "02:05", 406: "00:05"}


def _sheet(a, n, cats):
    """The paper, the carbon ghost and the header every form shares."""
    r = a.rng
    a.rect(0, 0, FW, FH, fill="#c9c2b0")
    a.open("g", transform=f"rotate({r.uniform(-0.8, 0.8):.2f} 400 550)")
    a.rect(26, 22, FW - 44, FH - 40, fill="#000", opacity=0.25)
    a.rect(20, 16, FW - 44, FH - 40, fill="#f1ecdf")
    gid = a.uid("pg")
    a.defn(f'<filter id="{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="{a.seed % 97}"/>'
           '<feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.22  0 0 0 0 0.55  0 0 0 0.16 0"/></filter>')
    a.rect(20, 16, FW - 44, FH - 40, filter=f"url(#{gid})")
    kit.carbon_smudge(a, 60, 120, FW - 160, FH - 260, n=7, op=0.2)
    for y in (150, 950):   # filing holes
        a.circle(46, y, 9, fill="#c9c2b0")
        a.circle(46, y, 9, fill="none", stroke="#8a826e", stroke_width=0.8)
    kit.typed(a, 80, 74, "THE CROSSING  -  NIGHT LOG  -  STATEMENT", size=20, weight="bold")
    kit.typed(a, 80, 104, f"FORM S-{n}", size=17)
    kit.typed(a, FW - 70, 130, "COPY 2 OF 2", size=13, anchor="end")
    kit.typed(a, 80, 130, f"CATEGORIES: {cats}", size=13)
    a.line(80, 144, FW - 70, 144, stroke=C, stroke_width=1, stroke_dasharray="14 4", opacity=0.7)
    # the night: seven boxes, one struck
    for i in range(7):
        x = FW - 70 - (7 - i) * 26
        a.rect(x, 90, 18, 18, fill="none", stroke=C, stroke_width=1)
        if i + 1 == n:
            a.path(f"M{x + 2},{92} l14,14 M{x + 16},{92} l-14,14", stroke=C, stroke_width=2.2, fill="none")
    kit.typed(a, FW - 70 - 7 * 26 - 8, 104, "NIGHT", size=12, anchor="end")


def _grid(a, x, y, cw, ch, heads, title, rows=6):
    n = len(heads)
    kit.typed(a, x, y - 152, title, size=13, weight="bold")
    a.line(x, y - 146, x + n * cw, y - 146, stroke=C, stroke_width=0.8)
    for i, h in enumerate(heads):
        cx = x + i * cw + cw / 2 + 4
        a.text(cx, y - 8, h, size=11.5, family="monospace", fill=C, transform=f"rotate(-58 {f(cx)} {f(y - 8)})", letter_spacing=0.4)
    d = []
    for i in range(n + 1):
        d.append(f"M{f(x + i * cw + a.rng.uniform(-.5, .5))},{y}V{y + rows * ch}")
    for j in range(rows + 1):
        d.append(f"M{x},{f(y + j * ch + a.rng.uniform(-.5, .5))}H{x + n * cw}")
    a.path("".join(d), fill="none", stroke=C, stroke_width=1.1, opacity=0.9)
    # the seventh row: ruled, empty, unlabelled
    a.path(f"M{x},{y + rows * ch} v{ch} h{n * cw} v{-ch}", fill="none", stroke=C, stroke_width=0.8, stroke_dasharray="5 3", opacity=0.8)
    for i in range(1, n):
        a.line(x + i * cw, y + rows * ch, x + i * cw, y + (rows + 1) * ch, stroke=C, stroke_width=0.5, stroke_dasharray="2 4", opacity=0.7)


def _foot(a, n, y=760):
    kit.typed(a, 80, y, "STATEMENT", size=14, weight="bold")
    for k in range(6):
        yy = y + 30 + k * 26
        kit.typed(a, 80, yy, f"{401 + k}", size=14)
        a.line(128, yy + 2, FW - 80, yy + 2, stroke=C, stroke_width=0.7, stroke_dasharray="2 4", opacity=0.8)
    a.line(128, y + 30 + 6 * 26 + 2, FW - 80, y + 30 + 6 * 26 + 2, stroke=C, stroke_width=0.7, stroke_dasharray="2 4", opacity=0.5)
    kit.typed(a, 80, y + 226, "SECOND LOOK:  [ ]  [ ]", size=14)
    kit.typed(a, 80, y + 262, "SIGNED:", size=14)
    a.wobble([(160, y + 264), (430, y + 262)], amp=0.6, stroke=C, stroke_width=1)
    kit.typed(a, 80, y + 300, "COPY - NOT VALID WITHOUT THE SEAL OF THE MANAGEMENT", size=10, op=0.7)
    # the wren, pressed blind into the corner
    kit.wren(a, FW - 130, y + 262, 34, blind=True)


def _form(n, cats, groups):
    @asset(G, f"form-s{n}", group="documents", title=f"Statement form S-{n}: {cats.title()}", w=FW, h=FH, row=ROW)
    def draw(a: Art):
        _sheet(a, n, cats)
        if len(groups) == 1:
            title, heads = groups[0]
            x, y, cw, ch = 220, 330, 78, 46
            _grid(a, x, y, cw, ch, heads, title)
            kit.typed(a, 150, y - 14, "BACK", size=12, weight="bold")
            for j, rm in enumerate(ROOMS):
                kit.typed(a, 80, y + j * ch + 30, str(rm), size=20, weight="bold")
                kit.typed(a, 150, y + j * ch + 29, BACK[rm], size=13)
            ybot = y + 7 * ch
        else:
            x, y, cw, ch = 150, 330, 44, 46
            for g, (title, heads) in enumerate(groups):
                _grid(a, x + g * (6 * cw + 44), y, cw, ch, heads, title)
            for j, rm in enumerate(ROOMS):
                kit.typed(a, 80, y + j * ch + 30, str(rm), size=20, weight="bold")
            ybot = y + 7 * ch
        if n == 4:
            kit.typed(a, 80, ybot + 28, "A GUEST MAY BE BOTH A ROW AND A COLUMN.", size=12)
        if n >= 5:   # one row arrives typed, in another machine's face
            j = 2 if n == 5 else 4
            yy = y + j * ch + 30
            for g in range(len(groups)):
                gx = x + g * (6 * cw + 44) + (1 + g * 2) * cw + cw / 2
                a.text(gx, yy, "V", size=22, family="serif", fill=kit.INK, text_anchor="middle", font_weight="bold")
            a.text(80, ybot + 28, f"ROW {401 + j} ARRIVED TYPED.", size=13, family="serif", fill=kit.INK, letter_spacing=1)
        _foot(a, n)
        a.close()
    draw.__doc__ = (f"Statement form S-{n}, a blue carbon copy typed on cream: six room rows against {cats.lower()}, with rotated "
                    "column heads, a ruled and empty seventh row under 406, statement lines, a place to sign, and a wren pressed blind into the corner.")


for _f in FORMS:
    _form(*_f)


@asset(G, "form-s7", group="documents", title="Statement form S-7: the Account", w=FW, h=FH, row=ROW)
def account(a: Art):
    """Form S-7, the Account, already typed when it arrives: six rooms against six missions, three single questions
    with their choices, and a tenth line that reads 400 and a blank."""
    _sheet(a, 7, "ROOM x MISSION, AND THREE QUESTIONS")
    kit.typed(a, 80, 182, "THE ACCOUNT.  TONIGHT YOU ONLY CONFIRM.", size=16, weight="bold")
    missions = ["RECOVER THE PAINTING FOR DROST AND FIND THE LEAK", "GIVE DROST'S ACCOUNTS TO THE PRESS",
                "STEAL THE NIGHT VISITOR FROM THE BONDED HOUSE", "REPORT ON DROST FROM INSIDE THE GALA",
                "WIPE THE CAMERAS AND PLANT THE GALA LOGGER", "DROP A BANNER AT THE GALA"]
    order = [3, 0, 5, 1, 4, 2]
    y = 232
    for j, rm in enumerate(ROOMS):
        yy = y + j * 44
        kit.typed(a, 80, yy, str(rm), size=20, weight="bold")
        a.rect(140, yy - 20, FW - 220, 30, fill="none", stroke=C, stroke_width=0.9)
        kit.typed(a, 150, yy, missions[order[j]], size=14, color=kit.INK, op=0.9)
    # the tenth line, under 406
    yy = y + 6 * 44
    kit.typed(a, 80, yy, "400", size=20, weight="bold", op=0.75)
    a.rect(140, yy - 20, FW - 220, 30, fill="none", stroke=C, stroke_width=0.9, stroke_dasharray="5 3")
    kit.typed(a, 150, yy, "______   WITNESS / PRODUCT / GUEST / NOBODY", size=14)
    qs = [("WHO BOOKED THEM ALL?", ["WREN", "DROST", "THE PORTER", "THE STRANGER", "YOU"]),
          ("WHO IS THE STRANGER?", ["ABEL FENN", "DROST", "WREN", "LEW", "A GUEST"]),
          ("WHAT IS THE PRODUCT?", ["THE LOG", "THE PAINTING", "THE LEDGER", "THE LOGGER", "THE BANNER"])]
    y = 572
    for q, (question, opts) in enumerate(qs):
        yy = y + q * 96
        kit.typed(a, 80, yy, f"{7 + q}.  {question}", size=16, weight="bold")
        xx = 110
        for o in opts:
            a.rect(xx, yy + 18, 16, 16, fill="none", stroke=C, stroke_width=1)
            kit.typed(a, xx + 24, yy + 32, o, size=13)
            xx += 44 + len(o) * 8.6
        a.line(80, yy + 54, FW - 80, yy + 54, stroke=C, stroke_width=0.6, stroke_dasharray="2 4", opacity=0.7)
    # strike marks and the desk phone: each strike rings once
    a.wobble([(146, 232 + 2 * 44 - 6), (FW - 86, 232 + 2 * 44 - 8)], amp=1.2, stroke=kit.INK, stroke_width=2.4)
    kit.typed(a, 80, 880, "NO SECOND LOOK.", size=14)
    kit.typed(a, 80, 916, "SIGNED:", size=14)
    a.wobble([(160, 918), (430, 916)], amp=0.6, stroke=C, stroke_width=1)
    kit.typed(a, 80, 1010, "COPY - NOT VALID WITHOUT THE SEAL OF THE MANAGEMENT", size=10, op=0.7)
    kit.wren(a, FW - 130, 930, 34, blind=True)
    a.close()


# ---- stamps ----------------------------------------------------------------------------------------
def _stamp(key, lines, color, sub, doc, deg):
    @asset(G, f"stamp-{key}", group="ui", title=f"Rubber stamp: {' '.join(lines)}", w=400, h=240, row=ROW)
    def draw(a: Art):
        a.paper("#f1ecdf", grain=0.2)
        kit.carbon_smudge(a, 20, 20, 360, 200, n=3, op=0.14)
        for k in range(3):
            kit.typed(a, 24, 60 + k * 70, "4" + "0%d  . . . . . . . . . . . . . . . ." % (k + 3), size=15, op=0.5)
        kit.stamp(a, 200, 122, 300, 130, lines, color=color, deg=deg, size=44 if len(lines) == 1 else 36, sub=sub)
        # ink starvation
        a.stipple(50, 50, 300, 150, n=260, r=(0.5, 1.6), fill="#f1ecdf")
    draw.__doc__ = doc


_stamp("entered", ["ENTERED"], "#5a4a9a", "NIGHT LOG", "The ENTERED stamp, violet ink struck slightly askew on the typed form: a row checked and found right.", -7)
_stamp("carbon", ["CARBON", "COPY"], C, None, "The CARBON COPY stamp in carbon blue: the watcher's own copy of a signed form.", 4)
_stamp("amended", ["AMENDED"], "#2f5a40", "ON THE CARBON ONLY", "The AMENDED stamp in bottle green: one earlier row changed, on the carbon only.", -3)
_stamp("witness", ["WITNESS"], kit.EVIDENCE, "ROW SEVEN", "The WITNESS stamp in evidence red, for the seventh row.", 6)


# ---- clue-kind icons: the seven details -------------------------------------------------------------
def _icon(key, label, doc, fn):
    @asset(G, f"clue-{key}", group="pieces", title=f"Clue kind: {label}", w=160, h=160, row="Clue-kind icons, the seven details")
    def draw(a: Art):
        a.rect(0, 0, 160, 160, rx=10, fill="#f1ecdf")
        a.rect(0, 0, 160, 160, rx=10, fill=a.radial([(0, "#fff", 0.5), (1, "#b8ab8a", 0.5)], r=0.75))
        a.circle(80, 70, 56, fill="#f7f3e8", stroke=kit.BRASS, stroke_width=4)
        a.circle(80, 70, 51, fill="none", stroke=kit.BRASS_D, stroke_width=0.8)
        a.open("g", clip_path=a.clip('<circle cx="80" cy="70" r="50"/>'))
        fn(a, dict(fill="none", stroke=kit.INK, stroke_width=2.2, stroke_linecap="round", stroke_linejoin="round"))
        a.close()
        a.text(80, 148, label.upper(), size=13, family="monospace", fill=C, text_anchor="middle", letter_spacing=2, font_weight="bold")
    draw.__doc__ = doc


def _i_clothing(a, pen):
    a.path("M40,120 L52,60 L80,78 L108,60 L120,120 M52,60 L66,40 L80,56 L94,40 L108,60 M80,78 V120", **pen)
    a.hatch(30, 30, 100, 100, angle=50, spacing=5, stroke=kit.INK, stroke_width=0.5, clip=a.clip('<path d="M52,60 L66,40 L80,56 L80,78Z"/>'))
    a.ellipse(99, 52, 9, 4.5, fill=kit.EVIDENCE, opacity=0.9, transform="rotate(-38 99 52)")


def _i_calls(a, pen):
    a.path("M42,56 Q80,26 118,56 L108,70 Q80,52 52,70 Z", fill="#f7f3e8", stroke=kit.INK, stroke_width=2.2, stroke_linejoin="round")
    a.path("M56,86 H104 L110,108 H50 Z", **pen)
    a.circle(80, 97, 6, **pen)
    a.path("M112,62 q14,10 4,22 q-10,10 2,18", **pen)
    a.path("M116,106 l10,8 M124,102 l-6,14", fill="none", stroke=kit.INK, stroke_width=1.6)   # the cord, cut


def _i_hands(a, pen):
    a.path("M48,116 Q44,84 60,72 L64,44 Q70,40 72,48 L72,70 L76,40 Q82,36 84,44 V70 L90,46 Q96,44 96,52 L94,76 Q110,84 106,116", **pen)
    a.rect(84, 52, 40, 26, rx=3, fill="#f7f3e8", stroke=kit.INK, stroke_width=2, transform="rotate(-18 104 65)")
    a.rect(92, 58, 12, 5, fill=kit.INK, transform="rotate(-18 104 65)")
    for k in (0, 1):
        a.path(f"M{124 + k * 7},{40 + k * 2} q6,8 0,16 M{36 - k * 7},{66} q-6,8 0,16", fill="none", stroke=kit.INK, stroke_width=1.2)


def _i_luggage(a, pen):
    a.rect(42, 54, 76, 52, rx=4, **pen)
    a.path("M66,54 V42 H94 V54 M56,54 V106 M104,54 V106", **pen)
    a.hatch(42, 54, 14, 52, angle=45, spacing=4, stroke=kit.INK, stroke_width=0.5, clip=a.clip('<rect x="42" y="54" width="14" height="52"/>'))
    a.ellipse(80, 112, 44, 4, fill=kit.INK, opacity=0.25)
    a.path("M128,44 l-10,10 M122,38 v8 M132,50 h-8", fill="none", stroke=kit.INK, stroke_width=1.4)   # new


def _i_visitors(a, pen):
    a.path("M52,124 V34 H104 V124", **pen)
    a.circle(96, 80, 3, fill=kit.INK)
    a.path("M52,124 H104", **pen)
    for k, (dx, dy) in enumerate([(0, 0), (8, 6), (22, 18)]):   # two quick, one slow
        a.circle(66 + dx, 54 + dy, 5 - k * 0.3, **pen)
    a.text(80, 114, "2:14", size=13, family="monospace", fill=kit.INK, text_anchor="middle", font_weight="bold")
    a.poly([(58, 124), (98, 124), (110, 134), (46, 134)], fill=kit.AMBER_L, opacity=0.8)


def _i_television(a, pen):
    a.rect(42, 46, 76, 54, rx=8, **pen)
    a.rect(50, 54, 46, 38, rx=6, fill=kit.ROOMS[402][1], opacity=0.75, stroke=kit.INK, stroke_width=1.4)
    a.circle(106, 62, 4, **pen)
    a.circle(106, 78, 4, **pen)
    a.path("M68,46 L56,26 M90,46 L104,26 M54,100 l-6,12 M106,100 l6,12", **pen)
    for k in range(4):
        a.line(52, 60 + k * 8, 94, 60 + k * 8, stroke="#fff", stroke_width=1.2, opacity=0.6)


def _i_rituals(a, pen):
    a.path("M40,48 H66 M94,92 H120", **pen)   # the door chain, slid seven times
    for k in range(5):
        a.ellipse(66 + k * 7 + 3, 52 + k * 9, 6, 4, transform=f"rotate(52 {66 + k * 7 + 3} {52 + k * 9})", **pen)
    d = "".join(f"M{52 + k * 8},{104}v16" for k in range(4)) + "M48,118 L82,104 M90,104v16 M98,104v16"
    a.path(d, fill="none", stroke=C, stroke_width=1.8, stroke_linecap="round")


_icon("clothing", "Clothing", "Clue-kind icon in technical pen inside a brass ring: a shirt collar with one red smear, for clothing.", _i_clothing)
_icon("calls", "Calls", "Clue-kind icon in technical pen inside a brass ring: a telephone handset whose cord is cut short, for calls.", _i_calls)
_icon("hands", "Hands", "Clue-kind icon in technical pen inside a brass ring: a trembling hand holding a keycard, for hands.", _i_hands)
_icon("luggage", "Luggage", "Clue-kind icon in technical pen inside a brass ring: a suitcase that was not there yesterday, for luggage.", _i_luggage)
_icon("visitors", "Visitors", "Clue-kind icon in technical pen inside a brass ring: a door, three knock marks and 2:14, for visitors.", _i_visitors)
_icon("television", "Television", "Clue-kind icon in technical pen inside a brass ring: a small television glowing blue, for the television.", _i_television)
_icon("rituals", "Rituals", "Clue-kind icon in technical pen inside a brass ring: a door chain and a tally of seven, for rituals.", _i_rituals)

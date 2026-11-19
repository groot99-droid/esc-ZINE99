"""Night Patience: the deco deck (52 faces, 3 backs) and the slipped and reply cards."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
CW, CH = 300, 420
GOLD = kit.GOLD
CREAM = "#f3ead2"
BLACK = "#13140f"
ROW_D = "Deco deck, 52 faces and 3 backs"
ROW_S = "Slipped and reply cards, single-stroke script"
SUITS = {"S": ("spades", "key"), "H": ("hearts", "lamp"), "D": ("diamonds", "bell"), "C": ("clubs", "rose")}
RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
NAMES = {"A": "ace", "J": "jack", "Q": "queen", "K": "king"}


def col(s):
    return kit.SUIT_RED if s in "HD" else BLACK


# ---- the four emblems of the house ------------------------------------------------------------------
def emblem(a, kind, cx, cy, s, color=GOLD, sw=None, fill="none"):
    sw = sw or max(1.2, s * 0.07)
    pen = dict(fill=fill, stroke=color, stroke_width=sw, stroke_linecap="round", stroke_linejoin="round")
    if kind == "key":
        a.circle(cx, cy - s * .55, s * .3, **pen)
        a.circle(cx, cy - s * .55, s * .12, **pen)
        a.path(f"M{f(cx)},{f(cy - s * .25)} V{f(cy + s * .85)} M{f(cx)},{f(cy + s * .45)} h{f(s * .28)} M{f(cx)},{f(cy + s * .68)} h{f(s * .2)} "
               f"M{f(cx)},{f(cy + s * .85)} h{f(s * .3)}", **pen)
    elif kind == "lamp":
        a.path(f"M{f(cx - s * .55)},{f(cy - s * .05)} L{f(cx - s * .3)},{f(cy - s * .8)} H{f(cx + s * .3)} L{f(cx + s * .55)},{f(cy - s * .05)}Z "
               f"M{f(cx)},{f(cy - s * .05)} V{f(cy + s * .7)} M{f(cx - s * .4)},{f(cy + s * .78)} H{f(cx + s * .4)} "
               f"M{f(cx - s * .16)},{f(cy - s * .8)} L{f(cx - s * .3)},{f(cy - s * .05)} M{f(cx + s * .16)},{f(cy - s * .8)} L{f(cx + s * .3)},{f(cy - s * .05)}", **pen)
    elif kind == "bell":
        a.path(f"M{f(cx - s * .6)},{f(cy + s * .45)} Q{f(cx - s * .55)},{f(cy - s * .6)} {f(cx)},{f(cy - s * .62)} "
               f"Q{f(cx + s * .55)},{f(cy - s * .6)} {f(cx + s * .6)},{f(cy + s * .45)} Z M{f(cx)},{f(cy - s * .62)} V{f(cy - s * .85)} "
               f"M{f(cx - s * .38)},{f(cy + s * .2)} H{f(cx + s * .38)}", **pen)
        a.circle(cx, cy + s * .62, s * .12, fill=color)
    else:
        kit.rose(a, cx, cy, s * 0.8, flat="none" if fill == "none" else fill)
        d = "".join(kit.circ_d(cx + s * .5 * math.cos(2 * math.pi * i / 8), cy + s * .5 * math.sin(2 * math.pi * i / 8), s * .29) for i in range(8))
        a.path(d + kit.circ_d(cx, cy, s * .5), **pen)
        a.circle(cx, cy, s * .2, fill=color)


def frame(a, face=CREAM, edge="#7a6630"):
    a.rect(0, 0, CW, CH, rx=18, fill=face, stroke=edge, stroke_width=2)
    a.rect(0, 0, CW, CH, rx=18, fill=a.radial([(0, "#fff", 0.35), (0.7, "#fff", 0), (1, "#8a6a28", 0.22)], r=0.8))
    x0, y0, x1, y1, st = 22, 22, CW - 22, CH - 22, 14
    pts = [(x0 + 2 * st, y0), (x1 - 2 * st, y0), (x1 - 2 * st, y0 + st), (x1 - st, y0 + st), (x1 - st, y0 + 2 * st), (x1, y0 + 2 * st),
           (x1, y1 - 2 * st), (x1 - st, y1 - 2 * st), (x1 - st, y1 - st), (x1 - 2 * st, y1 - st), (x1 - 2 * st, y1), (x0 + 2 * st, y1),
           (x0 + 2 * st, y1 - st), (x0 + st, y1 - st), (x0 + st, y1 - 2 * st), (x0, y1 - 2 * st), (x0, y0 + 2 * st), (x0 + st, y0 + 2 * st),
           (x0 + st, y0 + st), (x0 + 2 * st, y0 + st)]
    a.poly(pts, fill="none", stroke=GOLD, stroke_width=2.2)
    a.rect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16, fill="none", stroke=GOLD, stroke_width=0.8, opacity=0.7)


def index(a, rank, s):
    c = col(s)
    for flip in (False, True):
        a.open("g", transform="rotate(180 150 210)" if flip else None)
        a.rect(30, 30, 46, 92, fill=CREAM)
        kit.deco(a, rank, 53, 40, 34, color=c, weight=0.15, tracking=0.12, anchor="middle")
        kit.suit(a, s, 53, 100, 22, c)
        a.close()


def ornament(a, s):
    """The gold ground behind the pips: one motif per suit."""
    if s == "S":
        kit.fan(a, 150, 250, 120, n=11, a0=-150, a1=-30, color=GOLD, sw=1, op=0.45)
        kit.fan(a, 150, 170, 120, n=11, a0=30, a1=150, color=GOLD, sw=1, op=0.45, rings=())
    elif s == "H":
        for k in range(6):
            a.path(f"M{150 - 90 + k * 12},{210} A{90 - k * 12},{90 - k * 12} 0 0,1 {150 + 90 - k * 12},{210}", fill="none", stroke=GOLD, stroke_width=1.1, opacity=0.45)
            a.path(f"M{150 - 90 + k * 12},{210} A{90 - k * 12},{90 - k * 12} 0 0,0 {150 + 90 - k * 12},{210}", fill="none", stroke=GOLD, stroke_width=1.1, opacity=0.45)
    elif s == "D":
        d = "".join(f"M{150 - 100 + k * 14},{210} L150,{210 - 150 + k * 21} L{150 + 100 - k * 14},{210} L150,{210 + 150 - k * 21}Z" for k in range(6))
        a.path(d, fill="none", stroke=GOLD, stroke_width=1.1, opacity=0.45)
    else:
        d = "".join(f"M{80},{96 + k * 26} l70,-22 l70,22" for k in range(10))
        a.path(d, fill="none", stroke=GOLD, stroke_width=1.1, opacity=0.4)


L, C_, R = 100, 150, 200
PIPS = {
    2: [(C_, 0), (C_, 6)], 3: [(C_, 0), (C_, 3), (C_, 6)], 4: [(L, 0), (R, 0), (L, 6), (R, 6)],
    5: [(L, 0), (R, 0), (C_, 3), (L, 6), (R, 6)], 6: [(L, 0), (R, 0), (L, 3), (R, 3), (L, 6), (R, 6)],
    7: [(L, 0), (R, 0), (C_, 1.5), (L, 3), (R, 3), (L, 6), (R, 6)],
    8: [(L, 0), (R, 0), (C_, 1.5), (L, 3), (R, 3), (C_, 4.5), (L, 6), (R, 6)],
    9: [(L, 0), (R, 0), (L, 2), (R, 2), (C_, 3), (L, 4), (R, 4), (L, 6), (R, 6)],
    10: [(L, 0), (R, 0), (C_, 1), (L, 2), (R, 2), (L, 4), (R, 4), (C_, 5), (L, 6), (R, 6)],
}


def pip_card(a, rank, s):
    frame(a)
    ornament(a, s)
    n = int(rank)
    c = col(s)
    for x, row in PIPS[n]:
        y = 92 + row * (236 / 6)
        kit.suit(a, s, x, y, 34 if n < 9 else 30, c, flip=row > 3)
    index(a, rank, s)
    emblem(a, SUITS[s][1], 247, 60, 15, color=GOLD)
    emblem(a, SUITS[s][1], 53, 360, 15, color=GOLD)


def ace(a, s):
    frame(a)
    c = col(s)
    a.circle(150, 210, 104, fill=kit.BOTTLE)
    a.circle(150, 210, 104, fill="none", stroke=GOLD, stroke_width=3)
    d = []
    for k in range(36):
        t = math.radians(k * 10)
        r0, r1 = 62, (100 if k % 2 == 0 else 86)
        d.append(f"M{f(150 + r0 * math.cos(t))},{f(210 + r0 * math.sin(t))}L{f(150 + r1 * math.cos(t))},{f(210 + r1 * math.sin(t))}")
    a.path("".join(d), stroke=GOLD, stroke_width=1.6, fill="none")
    a.circle(150, 210, 60, fill=CREAM, stroke=GOLD, stroke_width=2.5)
    kit.suit(a, s, 150, 208, 78, c)
    kit.steps(a, 150, 70, 96, n=4, dw=22, h=6, gap=3, color=GOLD)
    if s != "S":
        kit.steps(a, 150, 350, 96, n=4, dw=22, h=6, gap=3, color=GOLD, up=True)
    emblem(a, SUITS[s][1], 150, 208, 13, color=CREAM if s in "SC" else CREAM, sw=1.6)
    if s == "S":
        kit.deco(a, "THE CROSSING", 132, 336, 12, color=kit.BRASS_D, weight=0.14, tracking=0.45, anchor="middle")
    index(a, "A", s)


def court_half(a, rank, s):
    c = col(s)
    coat = c if s in "HD" else kit.BOTTLE
    skin = "#e2c9a2"
    a.open("g", clip_path=a.clip('<polygon points="36,36 264,36 264,180 36,240"/>'))
    # ground: gold rays behind the head
    a.rect(36, 36, 228, 210, fill="#efe2c0")
    kit.fan(a, 150, 150, 170, n=15, a0=-175, a1=-5, color=GOLD, sw=1.2, op=0.7, rings=(0.52, 0.78))
    # shoulders and lapels
    a.path("M56,246 L70,170 Q150,138 230,170 L244,246Z", fill=coat)
    a.path("M150,246 L118,160 L150,176 L182,160Z", fill=CREAM)
    a.path("M118,160 L98,196 L134,246 M182,160 L202,196 L166,246", fill="none", stroke=GOLD, stroke_width=2.4)
    for k in range(3):
        a.circle(150, 196 + k * 16, 2.6, fill=GOLD)
    a.rect(136, 130, 28, 36, fill=skin)
    # head: flat deco oval; lowered lids only
    a.path("M118,96 Q118,64 150,62 Q182,64 182,96 Q182,128 150,144 Q118,128 118,96Z", fill=skin)
    a.path("M150,96 V118 h-7", fill="none", stroke="#8a6a48", stroke_width=1.8)
    a.path("M140,128 h18", fill="none", stroke="#8a4a3a", stroke_width=2.2, stroke_linecap="round")
    if rank == "K":   # the auditor's green eyeshade: no eyes
        a.path("M108,98 Q150,74 192,98 L200,106 Q150,90 100,106Z", fill=kit.BOTTLE_L, stroke=GOLD, stroke_width=1.6)
        a.path("M118,90 Q118,56 150,54 Q182,56 182,90", fill="none", stroke=BLACK, stroke_width=7)
        a.path("M116,150 q34,26 68,0", fill="none", stroke=GOLD, stroke_width=2)   # collar chain
    else:
        a.path("M126,98 q8,5 16,0 M158,98 q8,5 16,0", fill="none", stroke=BLACK, stroke_width=2)
    if rank == "J":   # the porter's pillbox cap and strap
        a.path("M116,82 Q150,58 184,82 L184,60 Q150,40 116,60Z", fill=coat, stroke=GOLD, stroke_width=1.6)
        a.path("M116,72 Q150,50 184,72", fill="none", stroke=GOLD, stroke_width=2.2)
        a.path("M120,84 Q122,130 150,146", fill="none", stroke=BLACK, stroke_width=1.4)
        a.circle(150, 56, 4, fill=GOLD)
    if rank == "Q":   # bobbed hair, a band, one drop earring
        a.path("M110,120 Q102,56 150,52 Q198,56 190,120 L178,120 Q184,76 150,74 Q116,76 122,120Z", fill=BLACK)
        a.path("M114,80 Q150,58 186,80", fill="none", stroke=GOLD, stroke_width=4)
        a.path("M184,122 v12", stroke=GOLD, stroke_width=1.4)
        a.poly([(184, 134), (188, 142), (184, 150), (180, 142)], fill=GOLD)
    # the hand and what it holds
    hx, hy = (100, 176) if rank != "Q" else (200, 176)
    a.rect(hx - 12, hy + 22, 24, 26, rx=8, fill=skin, stroke="#8a6a48", stroke_width=1)
    a.circle(hx, hy, 30, fill=coat if s in "SC" else CREAM, stroke=GOLD, stroke_width=2)
    emblem(a, SUITS[s][1], hx, hy, 21, color=GOLD if s in "SC" else c, sw=2)
    a.close()


def court(a, rank, s):
    frame(a)
    court_half(a, rank, s)
    a.open("g", transform="rotate(180 150 210)")
    court_half(a, rank, s)
    a.close()
    a.line(36, 240, 264, 180, stroke=GOLD, stroke_width=5)
    a.line(36, 240, 264, 180, stroke=kit.BRASS_D, stroke_width=1)
    a.rect(36, 36, 228, 348, fill="none", stroke=GOLD, stroke_width=2)
    index(a, rank, s)


def _face(rank, s):
    sname, emb = SUITS[s]
    rname = NAMES.get(rank, rank)
    @asset(G, f"deck-{sname}-{rname.lower()}", group="cards", title=f"Deco deck: {rname} of {sname}", w=CW, h=CH, row=ROW_D)
    def draw(a: Art):
        if rank == "A":
            ace(a, s)
        elif rank in "JQK":
            court(a, rank, s)
        else:
            pip_card(a, rank, s)
    who = {"J": "the porter in his pillbox cap", "Q": "a woman with bobbed hair and a gold band", "K": "the auditor under a green eyeshade, his eyes not shown"}
    if rank == "A":
        draw.__doc__ = f"The ace of {sname} from the office's deco deck: one large pip in a gold sunburst on bottle green, the house {emb} at its heart, stepped gold above and below."
    elif rank in "JQK":
        draw.__doc__ = f"The {rname} of {sname}, double-ended in gold, cream and {'red' if s in 'HD' else 'green'}: {who[rank]}, holding the house {emb} in a roundel."
    else:
        draw.__doc__ = f"The {rank} of {sname} from the office's deco deck: {rank} pips over a faint gold {['fan', 'ring', 'lozenge', 'chevron']['SHDC'.index(s)]} ground in a stepped frame, the house {emb} in two corners."


for _s in "SHDC":
    for _r in RANKS:
        _face(_r, _s)


# ---- backs -----------------------------------------------------------------------------------------
@asset(G, "back-hotel", group="cards", title="Deco deck: the hotel's own back", w=CW, h=CH, row=ROW_D)
def back_hotel(a: Art):
    """The back of the office's own deck: gold on deep green, a stepped fan rising from the foot of the card, a
    second one hanging from the head, and a small brass rose where they meet."""
    a.rect(0, 0, CW, CH, rx=18, fill="#0f2a1e", stroke=GOLD, stroke_width=3)
    a.rect(14, 14, CW - 28, CH - 28, rx=10, fill="none", stroke=GOLD, stroke_width=1.4)
    a.rect(22, 22, CW - 44, CH - 44, rx=6, fill="none", stroke=GOLD, stroke_width=0.7)
    a.open("g", clip_path=a.clip(f'<rect x="22" y="22" width="{CW - 44}" height="{CH - 44}" rx="6"/>'))
    kit.fan(a, 150, 398, 230, n=17, a0=-170, a1=-10, color=GOLD, sw=1.1, rings=(0.2, 0.34, 0.48, 0.62))
    kit.fan(a, 150, 22, 230, n=17, a0=10, a1=170, color=GOLD, sw=1.1, rings=())
    for q in (0.2, 0.34, 0.48, 0.62):
        rr = 230 * q
        a.path(f"M{f(150 - rr)},22 A{f(rr)},{f(rr)} 0 0,0 {f(150 + rr)},22", fill="none", stroke=GOLD, stroke_width=1.3)
    a.close()
    a.circle(150, 210, 44, fill="#0f2a1e", stroke=GOLD, stroke_width=2)
    kit.set_nick_bg(a, "#0f2a1e")
    kit.rose(a, 150, 210, 30)
    kit.steps(a, 150, 150, 70, n=3, dw=18, h=5, gap=3, color=GOLD, up=True)
    kit.steps(a, 150, 270, 70, n=3, dw=18, h=5, gap=3, color=GOLD)


def _rose_back(key, nick, title, doc):
    @asset(G, key, group="cards", title=title, w=CW, h=CH, row=ROW_D)
    def draw(a: Art):
        bg = "#28343a"
        a.rect(0, 0, CW, CH, rx=18, fill=bg, stroke="#a9b4b6", stroke_width=3)
        a.rect(14, 14, CW - 28, CH - 28, rx=10, fill="none", stroke=kit.RIVER_L, stroke_width=1.2)
        pid = a.uid("lz")
        a.defn(f'<pattern id="{pid}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12,0 L24,12 L12,24 L0,12Z" fill="none" stroke="{kit.RIVER}" stroke-width="1"/>'
               f'<circle cx="12" cy="12" r="1.6" fill="{kit.RIVER_L}"/></pattern>')
        a.rect(24, 24, CW - 48, CH - 48, rx=6, fill=f"url(#{pid})")
        a.circle(150, 210, 92, fill=bg, stroke=kit.RIVER_L, stroke_width=1.6)
        kit.set_nick_bg(a, bg)
        kit.rose(a, 150, 210, 70, flat="#cfd8da", nick=nick)
        d = "".join(kit.circ_d(150 + 43.4 * math.cos(2 * math.pi * i / 8 - math.pi / 2), 210 + 43.4 * math.sin(2 * math.pi * i / 8 - math.pi / 2), 25.2) for i in range(8))
        a.path(d, fill="none", stroke=bg, stroke_width=1.6)
        if nick is not None:
            kit.rose(a, 0, 0, 0)  # no-op keeps ids stable
            ang = 2 * math.pi * nick / 8 - math.pi / 2
            px, py = 150 + 66 * math.cos(ang), 210 + 66 * math.sin(ang)
            a.poly([(px + 16 * math.cos(ang), py + 16 * math.sin(ang)), (px - 14 * math.cos(ang) + 8 * math.sin(ang), py - 14 * math.sin(ang) - 8 * math.cos(ang)),
                    (px + 14 * math.sin(ang) + 6 * math.cos(ang), py - 14 * math.cos(ang) + 6 * math.sin(ang))], fill=bg)
        a.circle(150, 210, 43, fill="none", stroke=bg, stroke_width=1.6)
        a.circle(150, 210, 18, fill=bg)
        # wear: this deck has been handled
        a.rect(0, 0, CW, CH, rx=18, fill=a.radial([(0, "#fff", 0.1), (1, "#000", 0.3)], r=0.75))
        a.stipple(10, 10, CW - 20, CH - 20, n=120, r=(0.4, 1.3), fill="#dfe6e8", opacity=0.5)
    draw.__doc__ = doc


_rose_back("back-fenn", 1, "Another deck: the rose back with a nicked petal",
           "The back of the other deck, river grey with a lozenge ground and a pale eight-petalled rose; one petal, upper right, has a small nick cut out of it. Fenn's cards.")
_rose_back("back-second-hand", None, "Another deck: the rose back, whole",
           "The same river-grey rose back with every petal whole: the mark of the second hand that slips cards from night five.")


# ---- slipped cards: handwriting on the face of a card from another deck ----------------------------
SLIPS = [
    (1, 2, "3", "C", ["Don't watch", "one door", "too long.", "They see", "the dark."], "rose"),
    (2, 2, "8", "D", ["The bell gives", "you less time", "than you think.", "Run."], "bell"),
    (3, 3, "5", "S", ["Past 404", "the boards talk.", "Walk them."], "boards"),
    (4, 3, "J", "H", ["The chute", "doesn't go", "to a manager."], "chute"),
    (5, 4, "2", "C", ["The man who", "books is called", "Wren.", "Like the bird."], "wren"),
    (6, 4, "9", "S", ["Lost property.", "Bottom drawer.", "My old book."], "drawer"),
    (7, 5, "6", "D", ["Every season, six.", "Every season,", "one door", "at 2:14."], "six"),
    (8, 5, "Q", "C", ["When the", "lights go,", "follow", "the coins."], "coins"),
    (9, 6, "7", "H", ["Back office safe:", "the year they", "built the passage,", "then the minute", "I knock."], "dial"),
    (10, 6, "4", "S", ["Wren's account", "ends in the", "time I knock."], "clock"),
    (11, 7, "A", "D", ["Look at", "your own", "door."], "door"),
    (12, 7, "K", "H", ["I stopped", "writing it down.", "They didn't", "stop me."], "pen"),
]
HANDINK = "#1a2a5a"


def other_face(a, rank, s):
    a.rect(0, 0, CW, CH, rx=18, fill="#f7f2e6", stroke=kit.RIVER, stroke_width=2.4)
    a.rect(16, 16, CW - 32, CH - 32, rx=8, fill="none", stroke=kit.RIVER, stroke_width=1)
    a.rect(0, 0, CW, CH, rx=18, fill=a.radial([(0, "#fff", 0.3), (1, "#6f7c80", 0.22)], r=0.8))
    for flip in (False, True):
        a.open("g", transform="rotate(180 150 210)" if flip else None, opacity=0.75)
        a.text(40, 58, rank, size=34, family="serif", fill=kit.RIVER, text_anchor="middle")
        kit.suit(a, s, 40, 78, 18, kit.RIVER)
        a.close()
    kit.suit(a, s, 150, 214, 150, kit.RIVER_L, opacity=0.22)


def doodle(a, kind, cx, cy):
    pen = dict(fill="none", stroke=HANDINK, stroke_width=1.8, stroke_linecap="round", stroke_linejoin="round", opacity=0.85)
    w = a.wobble
    if kind == "rose":
        a.circle(cx, cy, 16, **pen)
        a.circle(cx, cy, 6, fill=HANDINK)
    elif kind == "bell":
        kit.bell(a, cx, cy, 30, fill="none", stroke=HANDINK)
        a.path(f"M{cx - 26},{cy - 6} q-6,8 0,16 M{cx + 26},{cy - 6} q6,8 0,16", **pen)
    elif kind == "boards":
        for k in range(4):
            w([(cx - 44 + k * 22, cy + (-4 if k in (1, 2) else 0)), (cx - 24 + k * 22, cy + (3 if k == 1 else 0))], amp=0.8, **pen)
        a.path(f"M{cx - 16},{cy - 12} l-4,-8 M{cx},{cy - 14} v-9 M{cx + 16},{cy - 12} l4,-8", **pen)
    elif kind == "chute":
        w([(cx - 14, cy - 22), (cx - 14, cy + 4), (cx + 6, cy + 22)], amp=0.8, **pen)
        w([(cx + 12, cy - 22), (cx + 12, cy - 2), (cx + 28, cy + 14)], amp=0.8, **pen)
        a.path(f"M{cx - 4},{cy - 14} v14 l-4,-5 m4,5 l4,-5", **pen)
    elif kind == "wren":
        a.path(kit.circ_d(cx + 3, cy + 3, 13) + kit.circ_d(cx - 10, cy - 7, 8), **pen)
        a.path(f"M{cx - 17},{cy - 9} l-11,3 l10,3 M{cx + 10},{cy - 6} l6,-20 l6,3 l-4,22 M{cx},{cy + 16} v9 M{cx + 7},{cy + 15} v9", **pen)
    elif kind == "drawer":
        w([(cx - 34, cy - 20), (cx + 34, cy - 20), (cx + 34, cy + 22), (cx - 34, cy + 22)], amp=0.8, closed=True, **pen)
        w([(cx - 34, cy - 6), (cx + 34, cy - 6)], amp=0.6, **pen)
        w([(cx - 34, cy + 8), (cx + 34, cy + 8)], amp=0.6, **pen)
        a.path(f"M{cx - 6},{cy + 15} h12", **pen)
        a.path(f"M{cx + 44},{cy + 15} h14 m-5,-5 l5,5 l-5,5", transform=f"rotate(180 {cx + 51} {cy + 15})", **pen)
    elif kind == "six":
        for k in range(6):
            a.circle(cx - 40 + k * 16, cy, 5, **pen)
        a.circle(cx - 40 + 2 * 16, cy, 5, fill=HANDINK)
    elif kind == "coins":
        for k in range(6):
            a.ellipse(cx - 45 + k * 18, cy + k * 1.5, 7, 3, fill=HANDINK, opacity=0.25 + k * 0.12)
    elif kind == "dial":
        a.circle(cx, cy, 22, **pen)
        a.circle(cx, cy, 6, **pen)
        a.path("".join(f"M{f(cx + 17 * math.cos(t))},{f(cy + 17 * math.sin(t))}L{f(cx + 22 * math.cos(t))},{f(cy + 22 * math.sin(t))}" for t in [k * math.pi / 6 for k in range(12)]), **pen)
    elif kind == "clock":
        a.circle(cx, cy, 22, **pen)
        a.path(f"M{cx},{cy} L{f(cx + 12 * math.sin(math.radians(67)))},{f(cy - 12 * math.cos(math.radians(67)))} M{cx},{cy} L{f(cx + 18 * math.sin(math.radians(84)))},{f(cy - 18 * math.cos(math.radians(84)))}", **pen)
    elif kind == "door":
        w([(cx - 18, cy + 28), (cx - 18, cy - 28), (cx + 18, cy - 28), (cx + 18, cy + 28)], amp=0.8, **pen)
        a.circle(cx, cy - 8, 4, fill=HANDINK)
        a.path(f"M{cx + 34},{cy - 8} h-10 m4,-4 l-4,4 l4,4", **pen)
    elif kind == "pen":
        a.path(f"M{cx - 40},{cy + 8} L{cx + 30},{cy - 4} l12,-2 l-10,8 Z", **pen)
        w([(cx - 44, cy + 20), (cx + 44, cy + 20)], amp=0.5, **pen)


def _slip(no, night, rank, s, lines, kind):
    @asset(G, f"slip-{no:02d}", group="cards", title=f"Slipped card {no} (night {night})", w=CW, h=CH, row=ROW_S)
    def draw(a: Art):
        other_face(a, rank, s)
        size = 27 if max(len(x) for x in lines) <= 15 else 24
        y0 = 150 - (len(lines) - 3) * size * 0.5
        kit.hand(a, 152, y0, lines, size=size, color=HANDINK, lead=1.28, tilt=2.6)
        doodle(a, kind, 150, 338 if len(lines) < 5 else 352)
        a.circle(54, 370, 13, fill="none", stroke="#8a826e", stroke_width=1)
        a.text(54, 375, str(no), size=14, family="cursive", fill="#6b6456", text_anchor="middle")
        a.circle(150, 30, 4.5, fill="#3a3a3a")   # the spike's hole
        a.circle(150, 30, 7, fill="none", stroke="#8a826e", stroke_width=0.8)
    draw.__doc__ = (f"Slipped card {no}, found on night {night}: the {NAMES.get(rank, rank)} of {SUITS[s][0]} from another, river-grey deck, "
                    f"its face written across in blue-black ink: \"{' '.join(lines)}\" A small ink drawing sits under the words.")


for _sl in SLIPS:
    _slip(*_sl)


# ---- reply cards: a hotel card, in pencil -------------------------------------------------------------
def hotel_card(a):
    a.rect(0, 0, CW, CH, rx=10, fill="#f4efe2", stroke="#b8ab8a", stroke_width=1.6)
    a.rect(0, 0, CW, CH, rx=10, fill=a.radial([(0, "#fff", 0.4), (1, "#b8ab8a", 0.3)], r=0.8))
    a.rect(0, 0, CW, 74, rx=10, fill=kit.BOTTLE)
    a.rect(0, 40, CW, 34, fill=kit.BOTTLE)
    a.line(0, 74, CW, 74, stroke=GOLD, stroke_width=2.4)
    a.line(0, 80, CW, 80, stroke=GOLD, stroke_width=0.8)
    kit.deco(a, "THE CROSSING", 150, 26, 22, color=GOLD, weight=0.13, tracking=0.34, anchor="middle")
    a.text(150, 66, "FOURTH FLOOR", size=10, family="sans-serif", fill=GOLD, text_anchor="middle", letter_spacing=5)
    for k in range(7):
        a.line(34, 138 + k * 36, CW - 34, 138 + k * 36, stroke=kit.RIVER_L, stroke_width=0.8)
    kit.steps(a, 150, 396, 80, n=3, dw=22, h=4, gap=3, color=GOLD, up=True)


def _pencil(a, x1, y1, x2, y2):
    ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
    L = math.hypot(x2 - x1, y2 - y1)
    a.open("g", transform=f"translate({x1} {y1}) rotate({ang:.1f})")
    a.rect(4, 5, L, 12, fill="#000", opacity=0.2)
    a.rect(0, -6, L - 34, 12, fill="#c9a23a")
    a.rect(0, -6, L - 34, 4, fill="#e3c47a")
    a.rect(0, -6, 16, 12, fill="#b5483c")
    a.rect(16, -6, 8, 12, fill=kit.RIVER_L)
    a.poly([(L - 34, -6), (L, 0), (L - 34, 6)], fill="#e9d9b8")
    a.poly([(L - 10, -1.8), (L, 0), (L - 10, 1.8)], fill="#3a3a3a")
    a.close()


REPLIES = [("who-watches", ["Who watches", "the watcher?"]), ("who-was-here", ["Who was here", "before you?"]), ("who-paid", ["Who paid", "him?"])]


def _reply(key, lines):
    @asset(G, f"reply-{key}", group="cards", title=f"Reply card: {' '.join(lines)}", w=CW, h=CH, row=ROW_S)
    def draw(a: Art):
        hotel_card(a)
        kit.hand(a, 150, 164, lines, size=30, color="#4a4a4a", lead=1.2, tilt=2.4)
        a.wobble([(96, 250), (204, 252)], amp=0.8, stroke="#4a4a4a", stroke_width=1.4, opacity=0.7)
        a.stipple(60, 130, 180, 120, n=60, r=(0.4, 1.0), fill="#4a4a4a", opacity=0.3)   # graphite dust
        a.circle(150, 104, 4.5, fill="#3a3a3a")
    draw.__doc__ = f"A reply card: a hotel card with the green and gold head of The Crossing, and one question in soft pencil, \"{' '.join(lines)}\", left on the spike for Fenn."


for _k, _l in REPLIES:
    _reply(_k, _l)


@asset(G, "reply-blank", group="cards", title="Reply card: blank, with the pencil", w=CW, h=CH, row=ROW_S)
def reply_blank(a: Art):
    """A blank hotel card ready to be written on: ruled lines under the green and gold head, and the office pencil
    lying across it."""
    hotel_card(a)
    _pencil(a, 60, 330, 250, 180)


@asset(G, "card-dotted", group="cards", title="The dotted card: a watercolour brass dot", w=CW, h=CH, row=ROW_S)
def card_dotted(a: Art):
    """The hotel card found under column six on night seven: nothing written, one brass-coloured watercolour dot in the
    corner where Mara puts hers, its edge bled into the paper."""
    hotel_card(a)
    bl = a.blur(5)
    a.circle(236, 344, 26, fill=kit.AMBER, opacity=0.3, filter=bl)
    ro = a.roughen(3, 0.07)
    a.circle(236, 344, 18, fill=kit.BRASS, filter=ro)
    a.circle(232, 340, 11, fill=kit.BRASS_L, opacity=0.6, filter=ro)
    a.path("M222,352 q10,12 26,2", fill="none", stroke=kit.BRASS_D, stroke_width=2, opacity=0.5, filter=ro)


@asset(G, "slip-second-hand", group="cards", title="A slipped card from the second hand, face down", w=CW, h=CH, row=ROW_S)
def second_hand(a: Art):
    """A slipped card lying face down on the baize, its rose back whole, one corner lifted to show a line of ink on the
    face: a card from the second hand, told from Fenn's only by the petal that is not nicked."""
    kit.baize(a)
    a.rect(0, 0, CW, CH, fill=a.radial([(0, kit.AMBER_L, 0.2), (1, "#000", 0.5)], r=0.8))
    a.open("g", transform="rotate(-9 150 210)")
    a.rect(64, 74, 190, 270, rx=12, fill="#000", opacity=0.4, filter=a.blur(6))
    bg = "#28343a"
    a.rect(56, 64, 190, 270, rx=12, fill=bg, stroke=kit.RIVER_L, stroke_width=2)
    a.rect(66, 74, 170, 250, rx=7, fill="none", stroke=kit.RIVER_L, stroke_width=0.9)
    a.circle(151, 199, 58, fill=bg, stroke=kit.RIVER_L, stroke_width=1.2)
    kit.set_nick_bg(a, bg)
    kit.rose(a, 151, 199, 44, flat="#cfd8da")
    a.circle(151, 199, 27, fill="none", stroke=bg, stroke_width=1.4)
    a.circle(151, 199, 11, fill=bg)
    # the lifted corner
    a.poly([(246, 264), (246, 334), (176, 334)], fill=kit.BOTTLE_D, opacity=0.5)
    a.poly([(246, 268), (182, 334), (214, 286)], fill="#f7f2e6", stroke=kit.RIVER, stroke_width=1)
    a.path("M204,318 q6,-8 10,-2 q4,-10 9,-5 q4,-9 9,-8", fill="none", stroke=HANDINK, stroke_width=1.6)
    a.close()

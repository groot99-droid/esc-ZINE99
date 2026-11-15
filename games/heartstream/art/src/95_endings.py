"""Ending cards: the lettering and a cut emblem for each of the five endings (the pictures themselves are
generated images; these plates carry the names and the lines)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Ending cards, one per ending"
INK, CREAM = kit.INK, kit.CREAM


def rays(a, cx, cy, col, n=40, r0=0, op=0.85):
    d = []
    for k in range(n):
        an = 2 * math.pi * k / n + a.rng.uniform(-.03, .03)
        wd, r1 = a.rng.uniform(.015, .045), a.rng.uniform(500, 900)
        d.append(f"M{f(cx + r0 * math.cos(an))},{f(cy + r0 * math.sin(an))} L{f(cx + r1 * math.cos(an - wd))},{f(cy + r1 * math.sin(an - wd))} "
                 f"L{f(cx + r1 * math.cos(an + wd))},{f(cy + r1 * math.sin(an + wd))}Z")
    a.path("".join(d), fill=col, opacity=op)


def e_carried(a):
    a.rect(22, 22, 800, 856, fill=kit.DEEP)
    for s, x0 in ((1, 22), (-1, 822)):
        pts = [(422 - s * (250 + 40 * math.sin(y * .01 + s)), y) for y in range(22, 900, 60)]
        a.path(a.smooth_d(pts) + f" L{x0},878 L{x0},22Z", fill="#3d0610", stroke=INK, stroke_width=5)
    kit.gouges(a, 22, 22, 800, 856, 200, kit.RIVER, ang=88, spread=6, ln=(20, 80), sw=3.5, density=lambda x, y: 1.0 if abs(x - 422) > 270 else 0.25)
    a.circle(422, 470, 260, fill=a.radial([(0, kit.HILITE, 0.5), (1, kit.HILITE, 0)]))
    a.path(kit.P([(360, 878), (372, 640), (480, 640), (500, 878)], True), fill=kit.RIVER, stroke=INK, stroke_width=9)
    kit.solid(a, kit.hand_d(422, 520, 3.3, 0, 1.0, curl=0.8), kit.RIVER, INK, 5)
    # the gift across the palm, underside up
    tool = "M250,566 L540,528 C596,522 610,470 570,460 C548,456 536,474 540,488 L556,486 C556,478 562,474 570,476 C586,482 578,506 540,510 L250,546Z"
    a.path(tool, fill="#000", opacity=0.4, transform="translate(5,10)")
    a.path(tool, fill=kit.BONE, stroke=INK, stroke_width=6, stroke_linejoin="round")
    a.path(kit.hand_d(404, 536, 0.26, -8, 1.1), fill="none", stroke=kit.MARROW2, stroke_width=2.4, stroke_linejoin="round")


def e_two(a):
    a.rect(22, 22, 800, 856, fill="#5a0b17")
    rays(a, 422, 430, kit.RIVER, n=30, op=0.8)
    for x, c in ((300, kit.GOLD), (544, kit.GLOW)):
        a.circle(x, 720, 110, fill=a.radial([(0, c, 0.7), (1, c, 0)]))
    a.path(kit.P([(22, 360), (250, 380), (250, 500), (22, 540)], True), fill=kit.RIVER, stroke=INK, stroke_width=9)
    a.path(kit.P([(822, 360), (594, 380), (594, 500), (822, 540)], True), fill="#c8352e", stroke=INK, stroke_width=9)
    kit.solid(a, kit.fist_d(350, 440, 2.6, 90), kit.RIVER, INK, 5)
    kit.solid(a, kit.fist_d(494, 440, 2.6, -90), "#c8352e", INK, 5)
    for k in range(4):      # fingers laced
        a.path(f"M{392},{372 + k * 40} h60", stroke=INK, stroke_width=30, stroke_linecap="round", fill="none")
        a.path(f"M{392},{372 + k * 40} h60", stroke=kit.RIVER if k % 2 else "#c8352e", stroke_width=18, stroke_linecap="round", fill="none")
    # two gifts
    a.path("M240,740 l110,-26 q26,-2 26,-22", fill="none", stroke=INK, stroke_width=20, stroke_linecap="round")
    a.path("M240,740 l110,-26 q26,-2 26,-22", fill="none", stroke=kit.BONE, stroke_width=10, stroke_linecap="round")
    a.path("M480,716 l130,16", fill="none", stroke=INK, stroke_width=22, stroke_linecap="round")
    a.path("M480,716 l130,16", fill="none", stroke=kit.BONE, stroke_width=12, stroke_linecap="round")
    for k in range(4):
        a.circle(506 + k * 26, 719 + k * 3.2, 3.5, fill=INK)


def e_stayed(a):
    a.rect(22, 22, 800, 856, fill=kit.NIGHT)
    kit.gouges(a, 22, 22, 800, 856, 240, kit.MARROW2, ang=90, spread=6, ln=(20, 70), sw=3.5)
    # the shaft above, and a raft waiting at its top
    a.path("M300,22 L560,22 L500,330 L350,330Z", fill=a.gradient([(0, kit.RIVER), (1, "#4a2a4a")]), stroke=INK, stroke_width=5)
    kit.raft(a, 346, 130, 170, key=INK, sw=4, mark="fork")
    for k in range(4):      # four small figures come out of the bone
        kit.brother(a, 140 + k * 54, 520 - k * 8, 60, kit.MARROW2, key=INK, pose="sit", sw=3)
    kit.lamp(a, 560, 700, 3.4, lit=0.35)
    kit.gouges(a, 420, 480, 280, 280, 40, kit.GOLD, centre=(560, 620), ln=(10, 26), sw=3, opacity=0.7,
               density=lambda x, y: 1.0 if 70 < math.hypot(x - 560, y - 620) < 130 else 0.0)
    a.path(kit.P([(22, 760), (300, 700), (320, 790), (22, 878)], True), fill="#4a5a94", stroke=INK, stroke_width=9)
    kit.solid(a, kit.hand_d(390, 720, 2.2, 78, 0.8, curl=0.8), "#4a5a94", INK, 5)
    for k in range(4):      # an old hand: the knuckles cut
        a.path(f"M{330 + k * 22},{700 + k * 8} q8,10 2,22", fill="none", stroke=CREAM, stroke_width=3, stroke_linecap="round", opacity=0.8)


def e_taken(a):
    a.rect(22, 22, 800, 856, fill="#3d0610")
    r = a.rng
    for row in range(9):    # the Warden's skin
        for i in range(8):
            x, y = 22 + i * 110 + (row % 2) * 55, 90 + row * 96
            a.path(f"M{x - 60},{y} q60,-44 120,0", fill="none", stroke="#6a1020", stroke_width=5)
    for (x, y, rot, kind) in ((150, 190, -20, 0), (640, 150, 30, 1), (120, 640, 14, 1), (680, 560, -34, 0), (560, 800, 8, 2), (330, 120, 70, 2)):      # old gifts healed in
        a.open("g", transform=f"rotate({rot} {x} {y})", opacity=0.75)
        if kind == 0:
            a.path(f"M{x - 50},{y} h80 q26,-2 24,-24", fill="none", stroke="#b89c80", stroke_width=9, stroke_linecap="round")
        elif kind == 1:
            a.path(f"M{x - 54},{y - 6} l108,6 l-108,8Z", fill="#b89c80")
        else:
            a.rect(x - 46, y - 8, 92, 16, fill="#b89c80")
        a.path(f"M{x - 60},{y + 14} q60,-34 120,-6", fill="none", stroke="#6a1020", stroke_width=5)
        a.close()
    # his own gift, sinking; his hand still on it
    a.ellipse(422, 470, 210, 120, fill=a.radial([(0, kit.HILITE, 0.55), (1, kit.HILITE, 0)]))
    a.path("M300,486 l180,-22 q40,-6 44,-44", fill="none", stroke=INK, stroke_width=26, stroke_linecap="round")
    a.path("M300,486 l180,-22 q40,-6 44,-44", fill="none", stroke=kit.BONE, stroke_width=14, stroke_linecap="round")
    a.path("M250,500 q60,-40 150,-30", fill="none", stroke="#3d0610", stroke_width=22, stroke_linecap="round")
    a.path("M250,486 q60,-40 150,-30", fill="none", stroke="#6a1020", stroke_width=5)
    a.path(kit.P([(540, 878), (520, 660), (640, 640), (700, 878)], True), fill=kit.RIVER, stroke=INK, stroke_width=9)
    kit.solid(a, kit.hand_d(566, 560, 2.3, -24, 0.9, curl=0.7), kit.RIVER, INK, 5)
    # the lid, closed
    a.path("M250,300 Q422,230 594,300", fill="none", stroke=INK, stroke_width=12, stroke_linecap="round")
    a.path("M270,306 Q422,330 574,306", fill="none", stroke="#6a1020", stroke_width=5, stroke_linecap="round")


def e_open(a):
    a.rect(22, 22, 800, 856, fill="#7a2a14")
    rays(a, 422, 400, kit.GOLD, n=44)
    a.circle(422, 400, 230, fill=a.radial([(0, "#fff6da", 0.9), (0.5, kit.GOLD, 0.6), (1, kit.GOLD, 0)]))
    # three on the raft, far behind, reaching
    kit.raft(a, 560, 250, 190, key=INK, sw=4)
    for k in range(3):
        kit.brother(a, 610 + k * 50, 230, 64, "#8a3a4a", key=INK, pose="reach", sw=3)
    a.path(kit.P([(330, 878), (350, 700), (500, 700), (520, 878)], True), fill="#c8352e", stroke=INK, stroke_width=9)
    kit.solid(a, kit.hand_d(422, 560, 3.6, 0, 1.12), "#c8352e", INK, 5.5)
    for k in range(3):      # the lines of the palm
        a.path(f"M{360 + k * 10},{560 + k * 34} q60,{-30 + k * 8} 120,{-6 + k * 4}", fill="none", stroke=kit.DEEP, stroke_width=5, stroke_linecap="round")


ENDS = [
    ("carried-away", "Carried Away", e_carried, ["No one stays together.", "Everyone is carried away.", "Life is a river that never lets you", "hold what you love for long."], True,
     "a red hand in a narrow vessel, the gift across its palm turned underside up"),
    ("two-together", "Two Together", e_two, ["…never lets you hold", "what you love for long."], False, "two red hands locked, two gifts and two glows beneath them"),
    ("the-one-who-stayed", "The One Who Stayed", e_stayed, [], False, "an old blue hand at a dimmed lamp, four small figures coming out of the bone, and a raft with a mark waiting at the top of the shaft"),
    ("taken-by-the-river", "Taken by the River", e_taken, [], False, "the Warden's skin set with old gifts, its lid closed, and a hand still on a gift that has begun to sink"),
    ("the-open-hand", "The Open Hand", e_open, ["His hand opens.", "The river has not asked him yet."], False, "one open red hand, palm up, in gold light, three small figures on a raft far behind it reaching"),
]
for _key, _name, _fn, _lines, _aw, _what in ENDS:
    def _card(a: Art, name=_name, fn=_fn, lines=_lines, aw=_aw):
        cl = kit.block_open(a, 22, rough=3)
        a.open("g", clip_path=cl)
        fn(a)
        a.rect(822, 22, 756, 856, fill=INK)
        a.line(822, 22, 822, 878, stroke=CREAM, stroke_width=5)
        kit.gouges(a, 836, 30, 730, 840, 110, kit.DEEP, ang=None, ln=(8, 22), sw=3,
                   density=lambda x, y: 1.0 if (y < 120 or y > 780 or x > 1500 or x < 880) else 0.0)
        words = name.upper().split()
        rows = [" ".join(words)] if len(name) < 14 else [" ".join(words[:-2]), " ".join(words[-2:])]
        total = 60 + len(rows) * 96 + 70 + len(lines) * 56
        y = 450 - total / 2 + 20
        kit.caps(a, 1200, y, "AN ENDING", size=24, fill=kit.GOLD, spacing=14, family="sans-serif")
        y += 100
        for rw in rows:
            kit.cut_text(a, 1200, y, rw, 82 if len(rw) < 12 else 70, CREAM, ink=kit.DEEP, light=None, spacing=4, family="serif", sw=7)
            y += 96
        a.path(f"M1010,{f(y - 40)} h150 l8,-16 l12,32 l12,-32 l8,16 h150", fill="none", stroke=kit.RIVER, stroke_width=4, stroke_linejoin="round", stroke_linecap="round")
        y += 40
        for ln in lines:
            a.text(1200, y, ln, size=38, family="serif", fill=CREAM, text_anchor="middle", font_style="italic")
            y += 56
        if aw:
            a.rect(1090, 760, 220, 44, fill="none", stroke=kit.GOLD, stroke_width=2.5)
            kit.caps(a, 1200, 790, "AS WRITTEN", size=19, fill=kit.GOLD, spacing=7, family="sans-serif")
        a.close()
        a.close()
    _card.__doc__ = f"The ending card for {_name}: {_what}, cut as a block print, beside the ending's name" + (" and its lines." if _lines else ".")
    asset(G, f"ending-{_key}", group="endings", title=f"Ending: {_name}", w=1600, h=900, row=ROW)(_card)

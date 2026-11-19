"""Title lettering and the eight chapter cards."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
OWN = kit.AMBER_L  # the seventh rose: the office door's lamp


def _rule(a, x1, x2, y, col=kit.BRASS, op=0.8):
    a.line(x1, y, x2, y, stroke=col, stroke_width=1.6, opacity=op)
    a.line(x1 + 40, y + 7, x2 - 40, y + 7, stroke=col, stroke_width=0.7, opacity=op)
    for x in (x1, x2):
        a.poly([(x - 7, y), (x, y - 7), (x + 7, y), (x, y + 7)], fill=col, opacity=op)


@asset(G, "title-lettering", group="title", title="Title lettering: the o is a lit rose", w=1600, h=500,
       row="Title lettering; the \"o\" a lit rose")
def title(a: Art):
    """The words Behind the Peephole in brass deco capitals on the dark varnish of a valet door; the O of
    Peephole is a brass rose with the lamp showing through it, and under the rule six small roses sit in
    a row, one lit."""
    kit.door_wood(a, 0, 0, a.w, a.h, lines=60)
    a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#6a4220", 0.55), (0.5, "#3a2414", 0.25), (1, "#000", 0)], cx=0.665, cy=0.56, r=0.5))
    a.vignette(0.85)
    kit.deco(a, "BEHIND THE", 800, 62, 54, color=kit.BRASS, inline=None, weight=0.1, tracking=0.6, anchor="middle")
    _rule(a, 420, 1180, 140)
    word, size = "PEEPHOLE", 210
    # shadow, then brass with a dark inline
    kit.deco(a, word, 806, 178, size, color="#000", weight=0.17, anchor="middle", opacity=0.6, skip=(5,))
    pos = kit.deco(a, word, 800, 170, size, color=a.gradient([(0, kit.BRASS_L), (0.5, kit.BRASS), (1, "#8a6a28")]),
                   inline="#2a1a0c", weight=0.15, anchor="middle", skip=(5,))
    ox, oy, _ = pos[5]
    kit.set_nick_bg(a, "#120d09")
    kit.rose(a, ox, oy, 96, lit=kit.AMBER_L)
    # the coin of light the rose throws
    a.ellipse(ox, 440, 120, 16, fill=a.radial([(0, kit.AMBER_L, 0.55), (1, kit.AMBER, 0)]))
    for i in range(6):
        x = 800 + (i - 2.5) * 86
        kit.rose(a, x, 440, 15, lit=kit.LAMPS[3] if i == 3 else None, glow=(i == 3))
    _rule(a, 180, 500, 440, op=0.5)
    _rule(a, 1100, 1420, 440, op=0.5)


NIGHTS = [
    ("n1", "NIGHT ONE", "Returns", "A threshold.", "I", 1),
    ("n2", "NIGHT TWO", "The Bell Board", "A threshold.", "I", 2),
    ("n3", "NIGHT THREE", "The Suitcase", "A surveillance device.", "II", 3),
    ("n4", "NIGHT FOUR", "Lost Property", "A surveillance device.", "II", 4),
    ("n5", "NIGHT FIVE", "The Confession Booth", "A confession booth.", "III", 5),
    ("n6", "NIGHT SIX", "One Hand", "A trap.", "IV", 6),
    ("n7", "NIGHT SEVEN", "The Lens in Your Door", "A trap.", "IV", 7),
    ("dawn", "DAWN", "The last lens", "A trap.", "IV", 0),
]


def _emblem(a, key, cx, cy, s):
    """One brass-line emblem per night, drawn inside a stepped deco lozenge."""
    pen = dict(fill="none", stroke=kit.BRASS_L, stroke_width=2.2, stroke_linecap="round", stroke_linejoin="round")
    a.poly([(cx - s, cy), (cx - s * .55, cy - s * .8), (cx + s * .55, cy - s * .8), (cx + s, cy), (cx + s * .55, cy + s * .8),
            (cx - s * .55, cy + s * .8)], fill="#0d0a07", stroke=kit.BRASS, stroke_width=1.6)
    a.poly([(cx - s * .88, cy), (cx - s * .48, cy - s * .7), (cx + s * .48, cy - s * .7), (cx + s * .88, cy),
            (cx + s * .48, cy + s * .7), (cx - s * .48, cy + s * .7)], fill="none", stroke=kit.BRASS, stroke_width=0.7)
    u = s * 0.5
    if key == "n1":   # the paper boat
        a.path(f"M{f(cx - u)},{f(cy + u * .2)} H{f(cx + u)} L{f(cx + u * .55)},{f(cy + u * .7)} H{f(cx - u * .55)}Z "
               f"M{f(cx)},{f(cy + u * .2)} V{f(cy - u * .9)} L{f(cx + u * .6)},{f(cy + u * .2)} M{f(cx)},{f(cy - u * .9)} L{f(cx - u * .45)},{f(cy + u * .2)}", **pen)
    elif key == "n2":  # a bell on its spring
        kit.bell(a, cx, cy + u * .2, u * 1.3)
        a.path(f"M{f(cx)},{f(cy - u * .75)} q{f(u * .3)},{f(-u * .12)} 0,{f(-u * .22)} q{f(-u * .3)},{f(-u * .12)} 0,{f(-u * .22)}", **pen)
    elif key == "n3":  # the flat case
        a.path(f"M{f(cx - u)},{f(cy - u * .5)} H{f(cx + u)} V{f(cy + u * .7)} H{f(cx - u)}Z M{f(cx - u * .3)},{f(cy - u * .5)} "
               f"V{f(cy - u * .85)} H{f(cx + u * .3)} V{f(cy - u * .5)} M{f(cx - u * .6)},{f(cy - u * .5)} V{f(cy + u * .7)} "
               f"M{f(cx + u * .6)},{f(cy - u * .5)} V{f(cy + u * .7)}", **pen)
    elif key == "n4":  # a jiggler key
        a.circle(cx - u * .6, cy, u * .38, **pen)
        a.path(f"M{f(cx - u * .22)},{f(cy)} H{f(cx + u)} M{f(cx + u * .2)},{f(cy)} v{f(u * .3)} M{f(cx + u * .45)},{f(cy)} v{f(u * .45)} "
               f"M{f(cx + u * .7)},{f(cy)} v{f(u * .22)} M{f(cx + u * .95)},{f(cy)} v{f(u * .38)}", **pen)
    elif key == "n5":  # the mirror she rehearses to
        a.ellipse(cx, cy - u * .1, u * .6, u * .82, **pen)
        a.path(f"M{f(cx - u * .25)},{f(cy - u * .5)} L{f(cx + u * .05)},{f(cy - u * .15)} M{f(cx - u * .05)},{f(cy + u * .1)} L{f(cx + u * .25)},{f(cy + u * .45)} "
               f"M{f(cx - u * .5)},{f(cy + u * .95)} H{f(cx + u * .5)}", **pen)
    elif key == "n6":  # the safe dial
        a.circle(cx, cy, u * .85, **pen)
        a.circle(cx, cy, u * .25, **pen)
        d = "".join(f"M{f(cx + u * .68 * math.cos(t))},{f(cy + u * .68 * math.sin(t))}L{f(cx + u * .85 * math.cos(t))},{f(cy + u * .85 * math.sin(t))}"
                    for t in [math.radians(k * 30) for k in range(12)])
        a.path(d, **pen)
    elif key == "n7":  # a door, its rose, and the keyhole under it
        a.path(f"M{f(cx - u * .6)},{f(cy + u)} V{f(cy - u)} H{f(cx + u * .6)} V{f(cy + u)}", **pen)
        a.circle(cx, cy - u * .3, u * .2, fill=kit.AMBER_L, stroke=kit.BRASS_L, stroke_width=2)
        a.path(f"M{f(cx)},{f(cy + u * .25)} v{f(u * .3)}", **pen)
        a.circle(cx, cy + u * .22, u * .08, fill=kit.BRASS_L)
    else:              # the revolving door at dawn
        a.circle(cx, cy, u * .9, **pen)
        a.path(f"M{f(cx - u * .64)},{f(cy - u * .64)} L{f(cx + u * .64)},{f(cy + u * .64)} M{f(cx + u * .64)},{f(cy - u * .64)} L{f(cx - u * .64)},{f(cy + u * .64)}", **pen)


def _chapter(key, night, name, word, act, lit):
    @asset(G, f"chapter-{key}", group="chapters", title=f"Chapter card: {night.title()}: {name}", w=1600, h=900,
           row="Chapter cards: seven roses, n lit, the act's word")
    def card(a: Art):
        dawn = key == "dawn"
        r = a.rng
        # the passage wall: seven valet doors in dark varnish, a rose in each
        kit.door_wood(a, 0, 0, a.w, a.h, base="#17110c" if dawn else "#100b08", lines=70, op=0.2 if dawn else 0.13)
        floor_y = 690
        a.rect(0, floor_y, a.w, a.h - floor_y, fill="#0a0806")
        a.rect(0, floor_y, a.w, 8, fill="#2a1c10")
        pw = a.w / 7
        ry = 430
        for i in range(7):
            x0 = i * pw
            a.rect(x0 + 26, 300, pw - 52, floor_y - 300, fill="none", stroke="#000", stroke_width=5, opacity=0.5)
            a.rect(x0 + 30, 304, pw - 60, floor_y - 308, fill="none", stroke="#6b4a2a", stroke_width=1, opacity=0.5)
            a.rect(x0 + 52, 326, pw - 104, 250, fill="none", stroke="#6b4a2a", stroke_width=0.8, opacity=0.35)
            # brass number plate
            lab = str(401 + i) if i < 6 else "400"
            a.rect(x0 + pw / 2 - 26, 262, 52, 24, rx=3, fill=kit.BRASS, opacity=0.85 if i < 6 else 0.4)
            a.text(x0 + pw / 2, 280, lab, size=17, family="serif", fill="#1a1008", text_anchor="middle", font_weight="bold",
                   opacity=1 if i < 6 else 0.6)
        if dawn:
            # grey light from the stair end; no rose lit
            a.rect(0, 0, a.w, a.h, fill=a.gradient([(0, "#000"), (1, kit.RIVER_L)], x1=0, y1=0, x2=1, y2=0), opacity=0.34)
            a.poly([(a.w + 40, 240), (a.w - 560, floor_y + 10), (a.w - 420, a.h + 40), (a.w + 40, a.h + 40)], fill=kit.RIVER_L,
                   opacity=0.2, filter=a.blur(26))
        for i in range(7):
            cx = (i + 0.5) * pw
            on = i < lit
            col = (kit.LAMPS[i] if i < 6 else OWN) if on else None
            if on:
                # the coin of light on the floor
                a.poly([(cx - 6, ry), (cx + 6, ry), (cx + 62, floor_y + 60), (cx - 62, floor_y + 60)], fill=col, opacity=0.07)
                a.ellipse(cx, floor_y + 64, 64, 15, fill=a.radial([(0, col, 0.75), (0.7, col, 0.3), (1, col, 0)]))
            kit.set_nick_bg(a, "#100b08")
            kit.rose(a, cx, ry, 30, lit=col)
        a.rect(0, 0, a.w, a.h, fill=a.radial([(0, "#000", 0), (0.6, "#000", 0.15), (1, "#000", 0.8)], cx=0.5, cy=0.55, r=0.75))
        # lettering
        kit.deco(a, night, 96, 64, 96, color=a.gradient([(0, kit.BRASS_L), (1, kit.BRASS)]), inline="#2a1a0c", weight=0.14)
        a.text(100, 228, name, size=44, family="serif", fill=kit.PAPER, font_style="italic", letter_spacing=1)
        _rule(a, 96, 96 + max(420, kit.deco_width(night, 96)), 184, op=0.7)
        _emblem(a, key, a.w - 190, 130, 92)
        # act and its word from the pitch
        a.text(a.w - 96, 820, word, size=40, family="serif", fill=kit.AMBER_L, text_anchor="end", font_style="italic")
        kit.deco(a, f"ACT {act}", a.w - 96, 850, 20, color=kit.BRASS, weight=0.12, tracking=0.5, anchor="end")
        # the count: seven strip dots
        for i in range(7):
            on = i < lit
            a.circle(104 + i * 30, 832, 8, fill=kit.AMBER_L if on else "none", stroke=kit.BRASS, stroke_width=1.6)
        a.text(96 + 7 * 30 + 12, 839, "the roses" if not dawn else "none lit", size=18, family="monospace", fill=kit.RIVER_L, letter_spacing=2)
    card.__doc__ = (f"Chapter card for {night.title()}, {name}: the seven valet doors of the passage in dark varnish, "
                    f"{lit if lit else 'none'} of their brass roses lit and throwing a coin of light on the floor, with the act's word from the pitch, {word}")
    return card


for _n in NIGHTS:
    _chapter(*_n)

"""Seat portraits: four temperaments in three colour states, as linocut heads."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "Seat portraits, 4 temperaments × 3 colour states, linocut heads"
STATES = (("blue", "still blue, in the marrow lights"), ("turning", "half turned, red climbing from the wrist"),
          ("red", "fully red, in the gold light of the heart"))
TELL = {"laughs": "head thrown back, mouth open, one big hand flung up",
        "argues": "brows down, a finger pointing the other way",
        "dreams": "chin lifted, eyes on something above, a hand reaching up after it",
        "fears": "shoulders high, eyes wide, a finger at his lips"}


def portrait(a: Art, ti, si):
    name, seatcol = kit.TEMPERS[ti]
    ink = kit.INK
    cl = kit.block_open(a, 22, rough=3.2)
    a.open("g", clip_path=cl)
    cx, cy = 240, 250 + (16 if name == "fears" else 0)
    acc = (kit.GLOW, kit.BONE, kit.GOLD)[si]
    light = (kit.GLOW, "#e7b7a8", kit.GOLD)[si]
    dist = lambda x, y: min(1.0, max(0.0, (math.hypot(x - cx, (y - cy) * 0.8) - 120) / 200))
    # ground: what is cut away around him
    if si == 0:       # marrow: a halo of short cuts, lamp pinpoints
        kit.gouges(a, 22, 22, 436, 500, 420, acc, centre=(cx, cy), ln=(8, 22), sw=3, density=dist, opacity=0.85)
        for k in range(5):
            lx, ly = 60 + k * 90 + a.rng.uniform(-14, 14), 62 + a.rng.uniform(-14, 22)
            a.circle(lx, ly, 15, fill=a.radial([(0, kit.GOLD, 0.9), (1, kit.GOLD, 0)]))
            a.circle(lx, ly, 4, fill=kit.GOLD)
    elif si == 1:     # the shaft: long vertical cuts, the lamps going out
        kit.gouges(a, 22, 22, 436, 500, 300, acc, ang=90, spread=4, ln=(24, 70), sw=2.6, density=dist, opacity=0.6)
        kit.gouges(a, 22, 22, 436, 180, 120, kit.HILITE, ang=90, spread=4, ln=(20, 60), sw=3, density=dist, opacity=0.8)
    else:             # the heart: rays
        d = []
        for k in range(46):
            an = 2 * math.pi * k / 46 + a.rng.uniform(-.03, .03)
            r0, r1 = a.rng.uniform(140, 175), a.rng.uniform(260, 420)
            wd = a.rng.uniform(.012, .035)
            d.append(f"M{f(cx + r0 * math.cos(an))},{f(cy + r0 * math.sin(an))} L{f(cx + r1 * math.cos(an - wd))},{f(cy + r1 * math.sin(an - wd))} "
                     f"L{f(cx + r1 * math.cos(an + wd))},{f(cy + r1 * math.sin(an + wd))}Z")
        a.path("".join(d), fill=acc, opacity=0.9)
        kit.gouges(a, 22, 22, 436, 500, 160, kit.HILITE, centre=(cx, cy), ln=(6, 16), sw=2.5, density=dist, opacity=0.8)
    # skin: red climbs from the bottom of the block
    gid = a.uid("skin")
    stops = ([(0, kit.MARROW2), (1, "#3f73a8")], [(0, kit.RIVER), (0.3, "#8a2a4a"), (0.6, "#5a4a8a"), (1, kit.MARROW2)],
             [(0, kit.DEEP), (0.4, kit.RIVER), (1, "#c8352e")])[si]
    a.defn(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="110">'
           + "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops) + "</linearGradient>")
    skin = f"url(#{gid})"
    SK = dict(fill=skin, stroke=ink, stroke_width=6, stroke_linejoin="round")
    up = 26 if name == "fears" else 0
    a.path(f"M30,{570} C56,{452 - up} 140,{424 - up} 206,{416 - up} L274,{416 - up} C340,{424 - up} 424,{452 - up} 450,570Z", **SK)
    a.path(f"M210,{cy + 96} L204,{424 - up} L276,{424 - up} L270,{cy + 96}Z", fill=skin, stroke=ink, stroke_width=6)
    # collarbone cuts and the seat stripe with its shape
    kit.gouges(a, 130, 440 - up, 220, 70, 26, light, ang=8, spread=12, ln=(14, 34), sw=3, opacity=0.8)
    a.path(f"M70,{498 - up * .6} L150,{452 - up * .8} L166,{480 - up * .8} L78,{530 - up * .6}Z", fill=seatcol, stroke=ink, stroke_width=4)
    sx, sy = 116, 490 - up * .7
    if ti == 0:
        a.circle(sx, sy, 9, fill=ink)
    elif ti == 1:
        a.poly([(sx - 10, sy + 8), (sx, sy - 10), (sx + 10, sy + 8)], fill=ink)
    elif ti == 2:
        a.poly([(sx - 10, sy), (sx, sy - 10), (sx + 10, sy), (sx, sy + 10)], fill=ink)
    else:
        a.rect(sx - 8, sy - 8, 16, 16, fill=ink)
    tilt = {"laughs": -9, "argues": 6, "dreams": -4, "fears": 3}[name]
    a.open("g", transform=f"rotate({tilt} {cx} {cy + 60})")
    head = (f"M{cx - 92},{cy - 10} C{cx - 96},{cy - 110} {cx - 50},{cy - 130} {cx},{cy - 130} C{cx + 50},{cy - 130} {cx + 96},{cy - 110} {cx + 92},{cy - 10} "
            f"C{cx + 88},{cy + 70} {cx + 40},{cy + 122} {cx},{cy + 124} C{cx - 40},{cy + 122} {cx - 88},{cy + 70} {cx - 92},{cy - 10}Z")
    for s in (-1, 1):
        a.ellipse(cx + s * 94, cy + 8, 13, 26, **SK)
    a.path(head, **SK)
    hc = a.clip(f'<path d="{head}"/>')
    a.open("g", clip_path=hc)
    a.hatch(cx - 96, cy - 130, 52, 260, angle=-24, spacing=12, clip=a.clip(f'<rect x="{cx - 100}" y="{cy - 135}" width="62" height="270"/>'),
            stroke=ink, stroke_width=5)
    a.hatch(cx + 44, cy - 130, 52, 260, angle=-24, spacing=10, clip=a.clip(f'<rect x="{cx + 52}" y="{cy - 135}" width="50" height="270"/>'),
            stroke=light, stroke_width=3, opacity=0.9)
    a.close()
    # features
    L = dict(fill="none", stroke=ink, stroke_width=7, stroke_linecap="round", stroke_linejoin="round")
    dy = {"laughs": 0, "argues": 0, "dreams": -14, "fears": 8}[name]
    ey, my = cy - 12 + dy, cy + 68 + dy
    a.path(f"M{cx - 2},{ey + 6} L{cx - 11},{ey + 52} q10,11 24,2", **{**L, "stroke_width": 5})
    for s in (-1, 1):
        ex = cx + s * 40
        if name == "laughs":
            a.path(f"M{ex - 22},{ey + 4} q22,-24 44,0", **L)
            a.path(f"M{ex - 26},{ey - 34} q26,-16 50,-4", **{**L, "stroke_width": 5})
            a.path(f"M{ex + s * 30},{ey + 14} q{s * 8},10 {s * 2},22", **{**L, "stroke_width": 4})
        elif name == "argues":
            a.path(f"M{ex - 22},{ey} Q{ex},{ey - 14} {ex + 22},{ey} Q{ex},{ey + 12} {ex - 22},{ey}Z", fill=ink, stroke=ink, stroke_width=3)
            a.ellipse(ex + s * -4, ey, 5, 4, fill=light)
            a.path(f"M{ex - s * 30},{ey - 18} L{ex + s * 26},{ey - 40}", **{**L, "stroke_width": 9})
        elif name == "dreams":
            a.path(f"M{ex - 22},{ey} Q{ex},{ey - 22} {ex + 22},{ey} Q{ex},{ey + 10} {ex - 22},{ey}Z", fill=light, stroke=ink, stroke_width=5)
            a.circle(ex + 3, ey - 7, 6.5, fill=ink)
            a.path(f"M{ex - 26},{ey - 34} q26,-14 52,0", **{**L, "stroke_width": 4})
        else:
            a.circle(ex, ey, 17, fill=light, stroke=ink, stroke_width=5)
            a.circle(ex - s * 2, ey + 2, 5, fill=ink)
            a.path(f"M{ex + s * 28},{ey - 26} L{ex - s * 20},{ey - 44}", **{**L, "stroke_width": 6})
    if name == "laughs":
        a.path(f"M{cx - 42},{my - 6} Q{cx},{my + 8} {cx + 42},{my - 6} Q{cx + 30},{my + 46} {cx},{my + 48} Q{cx - 30},{my + 46} {cx - 42},{my - 6}Z",
               fill=ink, stroke=ink, stroke_width=4, stroke_linejoin="round")
        a.path(f"M{cx - 30},{my + 2} Q{cx},{my + 12} {cx + 30},{my + 2} L{cx + 25},{my + 13} Q{cx},{my + 22} {cx - 25},{my + 13}Z", fill=kit.CREAM)
    elif name == "argues":
        a.path(f"M{cx - 28},{my + 6} L{cx + 30},{my - 6} L{cx + 24},{my + 14} L{cx - 18},{my + 18}Z", fill=ink, stroke=ink, stroke_width=4,
               stroke_linejoin="round")
        a.path(f"M{cx - 44},{my + 34} q10,-10 20,-4", **{**L, "stroke_width": 4})
    elif name == "dreams":
        a.path(f"M{cx - 22},{my} q22,12 44,0", **L)
        a.path(f"M{cx - 8},{my + 22} h16", **{**L, "stroke_width": 4})
    else:
        a.path(f"M{cx - 16},{my + 6} q16,-9 32,0", **L)
    # hair
    cap = (f"M{cx - 95},{cy - 16} C{cx - 102},{cy - 122} {cx - 50},{cy - 140} {cx},{cy - 140} C{cx + 50},{cy - 140} {cx + 102},{cy - 122} {cx + 95},{cy - 16} "
           f"C{cx + 72},{cy - 78} {cx + 30},{cy - 92} {cx},{cy - 92} C{cx - 30},{cy - 92} {cx - 72},{cy - 78} {cx - 95},{cy - 16}Z")
    if name == "laughs":
        pts = [(cx - 98, cy - 20)]
        for k in range(9):
            t = k / 8
            bx = cx - 96 + 192 * t
            by = cy - 100 - 40 * math.sin(math.pi * t)
            pts += [(bx - 6, by - a.rng.uniform(46, 78)), (bx + 12, by + 4)]
        pts += [(cx + 98, cy - 20), (cx + 60, cy - 84), (cx, cy - 94), (cx - 60, cy - 84)]
        a.path(kit.P(pts, True), fill=ink, stroke=light, stroke_width=3, stroke_linejoin="round")
        kit.gouges(a, cx - 80, cy - 150, 160, 50, 22, light, ang=-80, spread=22, ln=(14, 30), sw=2.6)
    elif name == "argues":
        a.path(cap, fill=ink, stroke=light, stroke_width=3)
        a.circle(cx + 4, cy - 166, 30, fill=ink, stroke=light, stroke_width=3)
        a.path(f"M{cx - 22},{cy - 140} q26,-12 52,0", fill="none", stroke=seatcol, stroke_width=7, stroke_linecap="round")
        kit.gouges(a, cx - 70, cy - 132, 140, 30, 16, light, ang=-90, spread=30, ln=(10, 22), sw=2.4)
        a.path(f"M{cx - 10},{cy - 176} q14,-10 28,2 M{cx - 12},{cy - 160} q16,-8 32,2", fill="none", stroke=light, stroke_width=2.4, stroke_linecap="round")
    elif name == "dreams":
        a.path(cap, fill=ink, stroke=light, stroke_width=3)
        a.path(f"M{cx + 78},{cy - 100} C{cx + 150},{cy - 60} {cx + 110},{cy + 40} {cx + 150},{cy + 110} C{cx + 172},{cy + 160} {cx + 140},{cy + 200} {cx + 168},{cy + 232} "
               f"C{cx + 120},{cy + 210} {cx + 112},{cy + 150} {cx + 108},{cy + 100} C{cx + 104},{cy + 40} {cx + 96},{cy - 20} {cx + 78},{cy - 100}Z", fill=ink, stroke=light,
               stroke_width=3, stroke_linejoin="round")
        for k in range(4):
            a.path(f"M{cx + 100 + k * 6},{cy - 60 + k * 14} C{cx + 128 + k * 4},{cy - 10} {cx + 112 + k * 5},{cy + 60} {cx + 134 + k * 4},{cy + 130 + k * 14}",
                   fill="none", stroke=light, stroke_width=2.4, stroke_linecap="round")
        kit.gouges(a, cx - 70, cy - 134, 140, 30, 14, light, ang=10, spread=20, ln=(12, 26), sw=2.4)
    else:
        low = (f"M{cx - 95},{cy - 6} C{cx - 102},{cy - 122} {cx - 50},{cy - 140} {cx},{cy - 140} C{cx + 50},{cy - 140} {cx + 102},{cy - 122} {cx + 95},{cy - 6} "
               f"C{cx + 80},{cy - 62} {cx + 30},{cy - 70} {cx},{cy - 72} C{cx - 30},{cy - 70} {cx - 80},{cy - 62} {cx - 95},{cy - 6}Z")
        a.path(low, fill=ink, stroke=light, stroke_width=3)
        kit.gouges(a, cx - 84, cy - 132, 168, 56, 60, light, ang=-90, spread=35, ln=(4, 9), sw=2.2)
    a.close()   # tilt
    # the telling hand
    def arm(hx, hy, bx, by, wd=24):
        an = math.atan2(by - hy, bx - hx)
        nx, ny = -math.sin(an) * wd, math.cos(an) * wd
        a.path(kit.P([(hx + nx * .8, hy + ny * .8), (bx + nx * 1.3, by + ny * 1.3), (bx - nx * 1.3, by - ny * 1.3), (hx - nx * .8, hy - ny * .8)], True), **SK)
        wx, wy = hx + (bx - hx) * 0.2, hy + (by - hy) * 0.2
        a.line(wx + nx * .85, wy + ny * .85, wx - nx * .85, wy - ny * .85, stroke=kit.HILITE if si < 2 else kit.GOLD, stroke_width=5)
    if name == "laughs":
        arm(398, 372, 470, 590)
        kit.solid(a, kit.hand_d(398, 330, 0.95, 14, 1.25), skin, ink, 3.5)
        kit.gouges(a, 366, 250, 70, 36, 5, light, ang=-80, spread=20, ln=(10, 20), sw=2.4)
    elif name == "argues":
        arm(128, 400, 96, 600)
        kit.solid(a, kit.fist_d(122, 366, 1.0, -42, point=True), skin, ink, 3.5)
    elif name == "dreams":
        arm(92, 150, 34, 430, wd=15)
        kit.solid(a, kit.hand_d(96, 112, 0.9, -12, 0.9), skin, ink, 3.5)
    else:
        arm(cx + 8, my + 130, cx + 60, 600)
        kit.solid(a, kit.fist_d(cx + 12, my + 96, 0.92, 4, point=True), skin, ink, 3.5)
    # label, cut into the block
    a.rect(22, 520, 436, 58, fill=ink)
    a.line(40, 524, 440, 524, stroke=acc, stroke_width=3, stroke_dasharray="14 6", opacity=0.9)
    kit.temper_glyph(a, name, 66, 552, 13, seatcol, sw=3.5)
    kit.caps(a, 262, 559, f"THE ONE WHO {name.upper()}", size=23, fill=kit.CREAM, spacing=3.5, font_weight="bold")
    a.close()   # clip
    a.close()   # block


for _t, (_n, _c) in enumerate(kit.TEMPERS):
    for _s, (_sn, _sd) in enumerate(STATES):
        def _fn(a, t=_t, s=_s):
            portrait(a, t, s)
        _fn.__doc__ = (f"Seat portrait of the one who {_n}, {_sd}: a linocut head and shoulders, {TELL[_n]}, his seat "
                       f"stripe on the shoulder.")
        asset(G, f"seat-{_n}-{_sn}", group="figures", title=f"The one who {_n} ({_sn})", w=480, h=600, row=ROW)(_fn)

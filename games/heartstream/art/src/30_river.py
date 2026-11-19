"""River backdrops: three sequences in three parallax planes, and the Inspection plate. Woodblock wave print:
keyed crests on the surface line, flat carved bands below it."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, ROW = kit.G, "River backdrops, 3 sequences × 3 planes, and the Inspection plate"
W, H, SURF = 1600, 900, 315
KEY = kit.KEY
SEQ = {
    1: dict(name="the open artery", sky=[(0, kit.DEEP), (0.55, kit.RIVER), (1, "#f0b08a")], bands=[kit.RIVER, "#981a28", kit.DEEP, "#5a0b17"],
            folds=6, swells=4, tendrils=8, cells=3, beasts=0),
    2: dict(name="the patrolled narrows", sky=[(0, "#2a0509"), (0.5, kit.DEEP), (1, "#c2452f")], bands=["#981a28", kit.DEEP, "#5a0b17", "#3d0610"],
            folds=4, swells=0, tendrils=6, cells=4, beasts=1),
    3: dict(name="the delta, toward the heart", sky=[(0, kit.DEEP), (0.45, kit.HILITE), (1, "#f7d48a")], bands=[kit.RIVER, "#a51d2a", kit.DEEP, "#5a0b17"],
            folds=6, swells=6, tendrils=10, cells=5, beasts=2),
}


def beast(a, x, y, w, h, eye=0.0, gifts=False):
    """An immune beast: one dark carved shape with a single eye (eye 0 closed .. 1 open)."""
    a.path(f"M{f(x)},{f(y + h)} C{f(x + w * .06)},{f(y + h * .2)} {f(x + w * .3)},{f(y)} {f(x + w * .5)},{f(y)} "
           f"C{f(x + w * .74)},{f(y)} {f(x + w * .94)},{f(y + h * .3)} {f(x + w)},{f(y + h)}Z", fill="#3d0610", stroke=KEY, stroke_width=5)
    n = int(w / 70)
    for r in range(3):
        for i in range(n - r):
            sx = x + w * .14 + (i + r * .5) * (w * .72 / n)
            sy = y + h * (.36 + r * .2) - (i % 3) * 5
            a.path(f"M{f(sx)},{f(sy)} q{f(w * .3 / n)},-16 {f(w * .6 / n)},0", fill="none", stroke="#6a1020", stroke_width=3)
    ex, ey, ew = x + w * .5, y + h * .22, w * .13
    if gifts:
        for k, (gx, gy) in enumerate([(.2, .62), (.33, .78), (.72, .66), (.82, .84), (.62, .9)]):
            px, py = x + w * gx, y + h * gy
            a.path(f"M{f(px)},{f(py)} l{f(26)},{f(-8)} q10,4 4,14", fill="none", stroke="#b89c80", stroke_width=4, stroke_linecap="round", opacity=0.75)
            a.path(f"M{f(px - 8)},{f(py + 6)} q14,-12 44,-8", fill="none", stroke="#6a1020", stroke_width=2.5)
    lid = ew * .12 + ew * .5 * eye
    a.path(f"M{f(ex - ew)},{f(ey)} Q{f(ex)},{f(ey - lid * 1.6)} {f(ex + ew)},{f(ey)} Q{f(ex)},{f(ey + lid)} {f(ex - ew)},{f(ey)}Z", fill=kit.GOLD if eye else "#6a1020",
           stroke=KEY, stroke_width=4)
    if eye:
        a.ellipse(ex, ey - lid * .15, ew * .16, lid * .55, fill=KEY)
    a.path(f"M{f(ex - ew)},{f(ey)} Q{f(ex)},{f(ey - lid * 1.7)} {f(ex + ew)},{f(ey)}", fill="none", stroke=KEY, stroke_width=7)
    if eye:
        for i, r in enumerate((1.5, 2.2, 2.9)):
            a.path(f"M{f(ex - ew * r)},{f(ey - ew * r * .2)} Q{f(ex)},{f(ey - ew * r * .9)} {f(ex + ew * r)},{f(ey - ew * r * .2)}", fill="none",
                   stroke=kit.GOLD, stroke_width=2.5, opacity=0.55 - i * 0.14, stroke_dasharray="10 8")


def far(a, n):
    q = SEQ[n]
    a.rect(0, 0, W, SURF, fill=a.gradient(q["sky"]))
    if n == 3:      # the heart's light ahead, downstream
        a.circle(1380, SURF, 300, fill=a.radial([(0, "#fff3d0", 0.95), (0.4, kit.GOLD, 0.7), (1, kit.GOLD, 0)]))
        d = "".join(f"M1380,{SURF} L{f(1380 + 900 * math.cos(t))},{f(SURF + 900 * math.sin(t))}" for t in [math.pi + k * math.pi / 22 for k in range(1, 22)])
        a.path(d, stroke=kit.GOLD, stroke_width=2, opacity=0.35, fill="none", clip_path=a.clip(f'<rect x="0" y="0" width="{W}" height="{SURF}"/>'))
    # the far wall of the vessel: a ridge above the waterline, cut with contour lines
    for layer, (base, col, op) in enumerate([(SURF - 120, "#8f1826" if n != 2 else "#4a0a14", 0.9), (SURF - 60, kit.DEEP if n != 2 else "#3d0610", 1)]):
        pts, x = [], -40
        while x < W + 80:
            gap = n == 3 and layer == 1 and (500 < x < 640 or 980 < x < 1120 or 1320 < x < 1470)
            pts.append((x, SURF + 6 if gap else base - a.rng.uniform(0, 70) - 30 * math.sin(x * 0.004 + layer + n)))
            x += a.rng.uniform(50, 110)
        a.path(a.smooth_d(pts) + f" L{W + 40},{SURF} L-40,{SURF}Z", fill=col, stroke=KEY, stroke_width=3.5, opacity=op)
        for (px, py) in pts[1:-1:2]:
            if py < SURF - 20:
                a.path(f"M{f(px)},{f(py + 12)} q{f(a.rng.uniform(10, 30))},{f((SURF - py) * .5)} {f(a.rng.uniform(-20, 20))},{f(SURF - py - 14)}", fill="none",
                       stroke=kit.HILITE, stroke_width=2, opacity=0.45)
    # the roof: folds hanging from the top
    pts, x = [], -20
    while x < W + 60:
        x2 = x + a.rng.uniform(100, 190)
        pts += [((x + x2) / 2, 60 + a.rng.uniform(0, 46)), (x2, 34)]
        x = x2
    a.path(f"M0,0 L0,40 " + a.smooth_d([(0, 40)] + pts)[1:].replace("M", "L", 1) + f" L{W},0Z", fill=kit.DEEP if n != 2 else "#2a0509", stroke=KEY, stroke_width=4)
    kit.grain_lines(a, 0, 0, W, SURF, 26, KEY, 0.13, amp=5)
    # below the line: flat bands, darker with depth
    ys = [SURF, 470, 640, 780]
    for i, c in enumerate(q["bands"]):
        top = [(xx, ys[i] + 12 * math.sin(xx * 0.01 + i + n)) for xx in range(-40, W + 80, 60)]
        a.path(a.smooth_d(top) + f" L{W + 40},{H} L-40,{H}Z", fill=c)
    kit.grain_lines(a, 0, SURF, W, H - SURF, 20, "#000", 0.1, amp=6)
    d = []
    for row in range(5):    # carved scallops just under the line, as on a wave print
        for k in range(-1, 22):
            x0 = k * 80 + (40 if row % 2 else 0)
            d.append(f"M{x0},{SURF + 34 + row * 26} q40,-30 80,0")
    a.path("".join(d), fill="none", stroke="#d8483c" if n != 2 else "#b3202e", stroke_width=2.5, opacity=0.55,
           clip_path=a.clip(f'<rect x="0" y="{SURF + 4}" width="{W}" height="150"/>'))
    kit.speckle(a, 0, 640, W, 260, kit.HILITE, opacity=0.5, freq=0.12, cut=5.6)
    for k in range(9):      # pulse lines cut in the sky
        yy = 70 + k * 22
        a.path(a.smooth_d([(xx, yy + 7 * math.sin(xx * .013 + k)) for xx in range(60 + k * 30, W - 40 - k * 50, 90)]), fill="none", stroke="#f0b08a",
               stroke_width=2, opacity=0.25)
    for j in range(10):     # far current lines
        y0, x0, ln = SURF + 60 + j * 55 + a.rng.uniform(-8, 8), a.rng.uniform(-100, 1300), a.rng.uniform(260, 560)
        a.path(a.smooth_d([(x0 + t * ln / 6, y0 + 8 * math.sin(t * 1.1 + j)) for t in range(7)]), fill="none", stroke=kit.HILITE, stroke_width=2.5,
               stroke_linecap="round", opacity=0.3)
    a.line(0, SURF, W, SURF, stroke=KEY, stroke_width=3)
    a.rect(6, 6, W - 12, H - 12, fill="none", stroke=KEY, stroke_width=10)


def mid(a, n):
    q = SEQ[n]
    r = a.rng
    for j in range(18):     # carved current lines
        y0, x0, ln = SURF + 40 + j * 31 + r.uniform(-6, 6), r.uniform(-100, 1300), r.uniform(240, 520)
        pts = [(x0 + t * ln / 6, y0 + 8 * math.sin(t * 1.1 + j)) for t in range(7)]
        a.path(a.smooth_d(pts), fill="none", stroke=kit.HILITE if j < 9 else kit.RIVER, stroke_width=3.5, stroke_linecap="round", opacity=0.6)
    for b in range(q["beasts"]):
        bx = (980, 240)[b] if n == 3 else 620
        beast(a, bx, 720 - b * 30, 620, 220, eye=0.0)
    for k in range(q["folds"]):     # valve folds hanging to the water
        fx = 140 + k * (W - 200) / q["folds"] + r.uniform(-40, 40)
        fw, fh = r.uniform(110, 150), r.uniform(190, 250) if n != 2 else r.uniform(230, 280)
        a.path(f"M{f(fx - fw / 2)},0 C{f(fx - fw * .46)},{f(fh * .6)} {f(fx - fw * .25)},{f(fh * .95)} {f(fx)},{f(fh)} C{f(fx + fw * .25)},{f(fh * .95)} {f(fx + fw * .46)},{f(fh * .6)} {f(fx + fw / 2)},0Z",
               fill=kit.DEEP if n != 2 else "#3d0610", stroke=KEY, stroke_width=5)
        for i in range(5):
            a.path(f"M{f(fx - fw * .36 + i * fw * .18)},16 C{f(fx - fw * .3 + i * fw * .16)},{f(fh * .5)} {f(fx - fw * .16 + i * fw * .1)},{f(fh * .8)} {f(fx - fw * .04 + i * fw * .03)},{f(fh * .92)}",
                   fill="none", stroke=kit.HILITE, stroke_width=2, opacity=0.6)
    for k in range(q["swells"]):    # surge swells, low humps under the line
        sx = 260 + k * (W - 300) / max(1, q["swells"]) + r.uniform(-50, 50)
        a.path(f"M{f(sx - 150)},{SURF + 6} Q{f(sx)},{SURF - 46} {f(sx + 150)},{SURF + 6} Q{f(sx)},{SURF + 40} {f(sx - 150)},{SURF + 6}Z", fill="#c63a36", stroke=KEY, stroke_width=3.5)
        a.path(f"M{f(sx - 100)},{SURF - 4} Q{f(sx)},{SURF - 34} {f(sx + 100)},{SURF - 4}", fill="none", stroke=kit.BONE, stroke_width=2.5, opacity=0.8)
    for k in range(q["tendrils"]):  # silk tendrils
        bx = 80 + k * (W - 160) / q["tendrils"] + r.uniform(-50, 50)
        top = r.uniform(SURF + 60, 640)
        pts = [(bx + 30 * math.sin(t / 8 * 5 + bx) * (1 - t / 16), H - (H - top) * t / 8) for t in range(9)]
        a.path(a.smooth_d(pts), fill="none", stroke=kit.BONE, stroke_width=3.5, opacity=0.6)
        a.circle(pts[-1][0], pts[-1][1], 7, fill=kit.BONE, stroke=KEY, stroke_width=2.5)
    for k in range(q["cells"] * 3):  # glass-lantern cells
        cx, cy, rr = r.uniform(40, W - 40), r.uniform(SURF + 50, 660), r.uniform(16, 30)
        a.ellipse(cx, cy, rr * 1.3, rr, fill=kit.BONE, opacity=0.25, stroke=kit.BONE, stroke_width=3)
        a.ellipse(cx - rr * .3, cy - rr * .3, rr * .4, rr * .25, fill=kit.BONE, opacity=0.8)
        a.circle(cx + rr * .2, cy + rr * .1, rr * .25, fill=KEY, opacity=0.5)


def near(a, n):
    q = SEQ[n]
    r = a.rng
    # the bank in the foreground: dark carved shoulders at the bottom corners
    for side in (0, 1):
        x0 = 0 if side == 0 else W
        s = 1 if side == 0 else -1
        pts = [(x0 - s * 20, 560 - 60 * (n == 2)), (x0 + s * 160, 640), (x0 + s * 300, 760), (x0 + s * 430, 842), (x0 + s * 620, H + 20), (x0 - s * 20, H + 20)]
        a.path(a.smooth_d(pts[:5]) + f" L{pts[5][0]},{pts[5][1]}Z", fill="#2a0509", stroke=KEY, stroke_width=6)
        for k in range(6):
            a.path(f"M{f(x0 + s * (30 + k * 40))},{f(640 + k * 34)} q{f(s * 60)},30 {f(s * 90)},{f(90 - k * 6)}", fill="none", stroke="#7A1020", stroke_width=3.5,
                   stroke_linecap="round")
        kit.gouges(a, min(x0, x0 + s * 380), 660, 380, 240, 60, "#7A1020", ang=35 * s, spread=14, ln=(10, 26), sw=3,
                   density=lambda x, y, x0=x0, s=s: 1.0 if (y - 600) > abs(x - x0) * 0.62 + 30 else 0.0)
    # a drape of roof tissue across a top corner
    a.path(f"M{W},0 L{W - 420},0 C{W - 380},70 {W - 250},60 {W - 200},130 C{W - 150},200 {W - 60},170 {W},250Z" if n != 2 else
           f"M0,0 L460,0 C420,90 280,70 220,150 C160,230 60,190 0,280Z", fill="#2a0509", stroke=KEY, stroke_width=6)
    big = (lambda x: 620 < x < 900) if n == 1 else ((lambda x: False) if n == 2 else (lambda x: 300 < x < 520 or 1040 < x < 1260))
    kit.crests(a, -30, W + 30, SURF, key=KEY, fill=kit.RIVER if n != 2 else "#981a28", big=big, hs=(16, 34) if n != 3 else (26, 48))
    for _ in range(70 if n != 2 else 20):
        a.circle(r.uniform(0, W), SURF - r.uniform(20, 120) * r.random(), r.uniform(1.5, 4), fill=kit.BONE, opacity=0.85)
    a.line(0, SURF, W, SURF, stroke=KEY, stroke_width=3)


for _n in (1, 2, 3):
    for _pl, _fn in (("far", far), ("mid", mid), ("near", near)):
        def _draw(a, n=_n, fn=_fn):
            fn(a, n)
        _what = {"far": "the far plane: the vessel's sky, its far wall and roof folds, and the flat carved bands of water below the surface line",
                 "mid": "the middle plane, on a clear ground: carved current lines, valve folds, swells, silk tendrils, glass cells and any patrolling beast",
                 "near": "the near plane, on a clear ground: the keyed wave crests along the surface line, spray, and the dark banks that frame the view"}[_pl]
        _draw.__doc__ = f"River sequence {_n} ({SEQ[_n]['name']}), {_what}; a woodblock print."
        asset(G, f"river-{_n}-{_pl}", group="backdrops", title=f"River {_n}, {_pl} plane", w=W, h=H, row=ROW)(_draw)


@asset(G, "river-inspection", group="backdrops", title="The Inspection plate", w=W, h=H, row=ROW)
def inspection(a: Art):
    """The Inspection, as a woodblock plate: the Warden's single gold eye has risen through the surface line,
    the only thing in the print that crosses it, and looks along the raft, where four brothers hold one arm
    out, still, to be counted. Three wrists are red; one is still blue."""
    far(a, 2)
    r = a.rng
    for j in range(14):
        y0, x0, ln = SURF + 60 + j * 38, r.uniform(-100, 1300), r.uniform(240, 520)
        a.path(a.smooth_d([(x0 + t * ln / 6, y0 + 8 * math.sin(t * 1.1 + j)) for t in range(7)]), fill="none", stroke=kit.HILITE, stroke_width=3.5,
               stroke_linecap="round", opacity=0.45)
    # the Warden rises: its back breaks the line beside the raft
    a.circle(1010, 300, 420, fill=a.radial([(0, kit.GOLD, 0.35), (1, kit.GOLD, 0)]))
    beast(a, 560, 150, 980, 800, eye=1.0, gifts=True)
    # rings where it broke the surface
    for k in range(4):
        a.path(f"M{560 - k * 60},{SURF + 4 + k * 3} q{-40 - k * 10},-14 {-90 - k * 20},0 M{1540 + k * 30},{SURF + 4 + k * 3} q{30},-12 {60},0", fill="none", stroke=kit.BONE,
               stroke_width=3, opacity=0.8 - k * .15, stroke_linecap="round")
    # the raft and the four, arms out
    kit.raft(a, 120, SURF, 420, sw=5)
    cols = ["#b3323a", "#a8303c", kit.MARROW2, "#b83a36"]
    for i, c in enumerate(cols):
        bx = 180 + i * 96
        kit.brother(a, bx, SURF - 22, 104, "#8a3a5a" if i != 2 else "#4a5a94", pose="sit", sw=4.5)
        a.line(bx + 6, SURF - 78, bx + 78, SURF - 96, stroke=KEY, stroke_width=13, stroke_linecap="round")
        a.line(bx + 6, SURF - 78, bx + 78, SURF - 96, stroke="#8a3a5a" if i != 2 else "#4a5a94", stroke_width=7, stroke_linecap="round")
        a.circle(bx + 80, SURF - 97, 11, fill=c, stroke=KEY, stroke_width=3.5)
    kit.crests(a, -30, 110, SURF, hs=(14, 26))
    kit.crests(a, 1560, W + 30, SURF, hs=(14, 26))
    a.line(0, SURF, 556, SURF, stroke=KEY, stroke_width=3)
    # sight lines: four dashed looks, one to each arm
    for i in range(4):
        a.path(f"M{1010 - 120},{300} Q{700},{180 - i * 8} {180 + i * 96 + 92},{SURF - 100}", fill="none", stroke=kit.GOLD, stroke_width=2.5, stroke_dasharray="4 12",
               opacity=0.8, stroke_linecap="round")
    # cartouche
    a.rect(70, 690, 560, 130, fill=kit.BONE, stroke=KEY, stroke_width=5)
    a.rect(80, 700, 540, 110, fill="none", stroke=KEY, stroke_width=1.5)
    kit.caps(a, 350, 742, "THE INSPECTION", size=30, fill=KEY, spacing=8, font_weight="bold")
    a.text(350, 786, "It is not hungry. It is counting.", size=27, family="serif", fill=kit.DEEP, text_anchor="middle", font_style="italic")
    a.rect(6, 6, W - 12, H - 12, fill="none", stroke=KEY, stroke_width=10)

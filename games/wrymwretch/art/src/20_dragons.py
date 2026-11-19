"""Twin flight: the six dragons as ink-wash silhouettes, four poses each (24)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Dragon flight silhouettes, ink wash, 4 poses each"

SPEC = {
    "sylvan": dict(realm=0, thick=34, wing=150, ww=22, sx=1.0, fingers=4),
    "aetherius": dict(realm=1, thick=22, wing=196, ww=18, sx=1.1, fingers=5),
    "gaia": dict(realm=2, thick=52, wing=112, ww=30, sx=0.9, fingers=3),
    "aquatica": dict(realm=3, thick=30, wing=128, ww=14, sx=1.0, fingers=7),
    "umbra": dict(realm=4, thick=30, wing=165, ww=20, sx=1.0, fingers=5),
    "astraia": dict(realm=5, thick=24, wing=180, ww=14, sx=1.05, fingers=4),
}
SPINE = {
    "glide": [(-150, 24), (-100, 8), (-45, 16), (10, 4), (65, -12), (112, -26), (146, -30)],
    "rise": [(-140, 62), (-96, 46), (-45, 34), (8, 10), (58, -24), (98, -56), (124, -80)],
    "beat": [(-150, -8), (-100, 4), (-45, 20), (10, 16), (66, 2), (114, -4), (150, 2)],
}
WINGS = {"glide": (-128, -100, 1.0), "rise": (-104, -78, 1.08), "beat": (128, 104, 0.95)}
POSES = [("glide", "glide"), ("rise", "wing up"), ("beat", "wing down"), ("gift", "gift")]
GIFT = {"sylvan": "Grow", "aetherius": "Turn the wind", "gaia": "Shape stone", "aquatica": "Current",
        "umbra": "Eclipse", "astraia": "Starlight trail"}
GIFT_BASE = {"sylvan": "rise", "aetherius": "glide", "gaia": "beat", "aquatica": "rise", "umbra": "glide", "astraia": "beat"}


def wing(a, kind, S, theta, L, ww, n, ink, op):
    r = a.rng
    th = math.radians(theta)
    up = theta < 0
    el = (S[0] + L * 0.46 * math.cos(th - (0.4 if up else -0.4)), S[1] + L * 0.46 * math.sin(th - (0.4 if up else -0.4)))
    tip = (S[0] + L * math.cos(th), S[1] + L * math.sin(th))
    arm = [S, el, tip]
    ph = math.radians(150 if up else -150)
    c = kit.catmull(arm, 8)
    tips = []
    for k in range(1, n + 1):
        t = k / n
        bx, by = c[int(t * (len(c) - 1))]
        fl = L * (0.34 + 0.3 * math.sin(math.pi * t * 0.9)) * (1.25 if kind == "aquatica" else 1)
        pa = ph + (t - 0.5) * (0.9 if up else -0.9)
        tips.append(((bx, by), (bx + fl * math.cos(pa), by + fl * math.sin(pa))))
    # membrane wash
    mem = [S] + c + [tp for _, tp in tips[::-1]] + [(S[0] - 46, S[1] + (8 if up else -8))]
    if kind != "umbra":
        a.path(kit.pd(mem), fill=ink, opacity=op * 0.3, filter=a.blur(2.5))
    else:
        a.path(kit.pd(mem), fill=ink, opacity=op * 0.22, filter=a.blur(9))
    for (b, tp) in tips:
        mid = ((b[0] + tp[0]) / 2 + r.uniform(-6, 6), (b[1] + tp[1]) / 2 + (10 if up else -10))
        kit.brush(a, [b, mid, tp], ww * 0.42, lambda t: 1 - 0.85 * t, fill=ink, opacity=op)
        for _ in range(4 if kind != "astraia" else 2):   # half-dry feathering
            q = r.uniform(0.2, 1)
            x, y = b[0] + (tp[0] - b[0]) * q, b[1] + (tp[1] - b[1]) * q
            a.line(x, y, x - r.uniform(14, 40), y + r.uniform(4, 18) * (1 if up else -1), stroke=ink,
                   stroke_width=r.uniform(0.5, 1.6), opacity=op * 0.4)
    kit.brush(a, arm, ww, lambda t: (1 - t) ** 0.7 + 0.06, fill=ink, opacity=op)
    return tip, tips


def dragon(a, kind, pose, cx, cy, s=1.0, rider=True, ink=None, angle=0.0, alpha=1.0):
    """One dragon, facing right, in a few strokes. Returns key points in canvas space."""
    sp = SPEC[kind]
    r = a.rng
    ink = ink or kit.WASH
    acc = kit.REALMS[sp["realm"]]["acc"]
    base = GIFT_BASE[kind] if pose == "gift" else pose
    spine = [(x * sp["sx"], y) for x, y in SPINE[base]]
    if kind == "astraia":
        spine = [(x, y * 0.45) for x, y in spine]
    if kind == "gaia":
        spine = [(x, y * 0.7) for x, y in spine]
    a.open("g", transform=f"translate({f(cx)},{f(cy)}) rotate({f(angle)}) scale({f(s)})", opacity=alpha if alpha < 1 else None)
    c = kit.catmull(spine, 8)
    S = c[int(len(c) * 0.6)]
    saddle = c[int(len(c) * 0.5)]
    t1, t2, k = WINGS[base]
    wl = sp["wing"] * k * (0.55 if (pose == "gift" and kind == "gaia") else 1)
    # far wing, lighter
    wing(a, kind, (S[0] + 12, S[1] - 2), t2, wl * 0.92, sp["ww"] * 0.9, sp["fingers"], ink, 0.5)
    # tail
    tx, ty = spine[0]
    tail = [(tx, ty), (tx - 46 * sp["sx"], ty + 12), (tx - 84 * sp["sx"], ty - 2), (tx - 108 * sp["sx"], ty - 30)]
    if kind == "aquatica":
        tail = [(tx, ty), (tx - 44, ty + 16), (tx - 86, ty + 6), (tx - 112, ty - 6)]
    if kind == "astraia":
        tail = [(tx, ty), (tx - 50, ty + 2), (tx - 100, ty + 6), (tx - 150, ty + 4)]
    if kind == "umbra":
        for _ in range(26):   # the tail comes apart into the dark
            q = r.random()
            px, py = tx - 30 - 130 * q + r.uniform(-8, 8), ty + 8 - 30 * q * q + r.uniform(-16, 16)
            rr = (1 - q) * 9 + 1.5
            a.ellipse(px, py, rr * 1.6, rr, fill=ink, opacity=0.9 - 0.6 * q, transform=f"rotate({f(r.uniform(-30, 30))} {f(px)} {f(py)})")
        kit.brush(a, tail[:3], sp["thick"] * 0.5, lambda t: 1 - 0.8 * t, fill=ink)
    else:
        kit.brush(a, tail, sp["thick"] * 0.52, lambda t: 1 - 0.92 * t, fill=ink)
    ex, ey = tail[-1]
    if kind == "sylvan":
        for k2 in range(7):
            an = math.radians(-150 + k2 * 22 + r.uniform(-8, 8))
            lx, ly = ex + 20 * math.cos(an), ey + 20 * math.sin(an)
            a.ellipse(lx, ly, 12, 4.5, fill=kit.shade(acc, -0.35), opacity=0.85, transform=f"rotate({f(math.degrees(an))} {f(lx)} {f(ly)})")
    elif kind == "gaia":
        a.poly(kit.rot([(-16, -12), (12, -16), (18, 6), (-4, 16), (-20, 4)], r.uniform(0, 1), 0, 0), fill=ink, transform=f"translate({f(ex)},{f(ey)})")
    elif kind == "aquatica":
        for sgn in (-1, 1):
            kit.brush(a, [(ex + 6, ey), (ex - 26, ey + sgn * 20), (ex - 52, ey + sgn * 44)], 20, lambda t: 0.3 + math.sin(math.pi * t) * 0.8, fill=ink, opacity=0.9)
    elif kind == "aetherius":
        for k2 in range(5):
            a.path(f"M{f(ex + k2 * 2)},{f(ey + k2)} q-18,-14 -10,-{34 + k2 * 4}", fill="none", stroke=ink, stroke_width=1.3, opacity=0.6)
    elif kind == "astraia":
        a.poly(a.star_pts(ex - 6, ey, 13, 3.4, n=4), fill=kit.shade(acc, -0.2))
    # body
    th = sp["thick"]
    kit.brush(a, spine, th, lambda t: (0.22 + 0.78 * math.sin(math.pi * min(1, t * 1.12)) ** 0.8) * (1 if t < 0.8 else 1 - (t - 0.8) * 2.2), fill=ink)
    # back features
    if kind == "gaia":
        for q in (0.2, 0.32, 0.44, 0.56, 0.68):
            bx, by = c[int(len(c) * q)]
            hgt = 14 + 12 * math.sin(math.pi * q)
            a.poly([(bx - 13, by - th * 0.36), (bx - 3, by - th * 0.36 - hgt), (bx + 9, by - th * 0.36 - hgt * 0.7), (bx + 14, by - th * 0.34)], fill=ink)
            a.circle(bx + r.uniform(-6, 6), by + th * 0.42, r.uniform(2, 3.6), fill=acc, opacity=0.9)
    if kind == "aquatica":
        fin = [c[int(len(c) * q)] for q in (0.18, 0.3, 0.42, 0.54)]
        a.path(kit.pd([(fin[0][0], fin[0][1] - 8)] + [(x + 4, y - 26 - 10 * math.sin(i * 1.2)) for i, (x, y) in enumerate(fin)] + [(fin[-1][0] + 16, fin[-1][1] - 8)]),
               fill=ink, opacity=0.75)
    if kind == "sylvan":
        for q in (0.2, 0.3, 0.4, 0.5, 0.72):   # bark splits left as bare silk
            bx, by = c[int(len(c) * q)]
            a.path(f"M{f(bx - 8)},{f(by - 4)} q8,-5 16,2", fill="none", stroke=kit.SILK, stroke_width=1.6, opacity=0.7)
    if kind == "aetherius":
        for q in (0.22, 0.34, 0.46, 0.7, 0.8):   # the runes on its scales, as flecks
            bx, by = c[int(len(c) * q)]
            a.path(f"M{f(bx - 3)},{f(by - 3)} l6,0 M{f(bx)},{f(by - 3)} v6", fill="none", stroke=kit.SILK, stroke_width=1.2, opacity=0.8)
    if kind == "astraia":
        for q in (0.15, 0.3, 0.45, 0.72):
            bx, by = c[int(len(c) * q)]
            a.circle(bx, by, 2, fill=acc)
    # head
    hx, hy = spine[-1]
    px, py = spine[-2]
    ha = math.degrees(math.atan2(hy - py, hx - px))
    a.open("g", transform=f"translate({f(hx)},{f(hy)}) rotate({f(ha)})")
    hs = th / 30 * 0.9 + 0.25
    if kind == "gaia":
        a.path("M-8,-16 L26,-14 L44,-2 L40,10 L8,16 L-10,10Z", fill=ink)
        a.path("M20,-14 L10,-34 L4,-14Z M40,6 L52,16 L36,12Z", fill=ink)
    else:
        a.path(f"M-10,{f(-11 * hs)} Q18,{f(-17 * hs)} {f(46 * hs + 8)},-3 Q{f(30 * hs)},{f(7 * hs)} 6,{f(13 * hs)} Q-10,{f(12 * hs)} -10,{f(-11 * hs)}Z", fill=ink)
    if kind == "sylvan":
        a.path("M4,-10 L-22,-44 M-10,-28 L-30,-30 M-16,-36 L-10,-54 M10,-10 L-4,-40 M2,-28 L14,-44", fill="none", stroke=ink, stroke_width=3.4, stroke_linecap="round")
    elif kind == "aetherius":
        a.path("M0,-8 Q-30,-22 -58,-14 M0,-4 Q-26,-6 -50,4", fill="none", stroke=ink, stroke_width=2.6, stroke_linecap="round")
        for sg in (1, -1):
            a.path(f"M40,{2 * sg} q34,{18 * sg} 74,{4 * sg}", fill="none", stroke=ink, stroke_width=1.5, stroke_linecap="round")
    elif kind == "aquatica":
        a.path("M0,-9 Q-22,-34 -40,-30 Q-28,-18 -30,-4Z M2,8 Q-14,26 -30,24 Q-20,14 -20,6Z", fill=ink, opacity=0.9)
    elif kind == "umbra":
        a.path("M0,-9 Q-34,-30 -70,-22 Q-40,-14 -14,2Z M-2,6 Q-30,8 -56,22 Q-30,20 -4,12Z", fill=ink)
    elif kind == "astraia":
        a.poly(a.star_pts(2, -22, 14, 3.5, n=4), fill=kit.shade(acc, -0.15))
        a.path("M0,-8 L-40,-16 L-6,0Z", fill=ink)
    if kind == "umbra":
        a.circle(22, -3, 3.4, fill=kit.shade(acc, 0.35))
    else:
        a.circle(20 * hs + 4, -3.5 * hs, 2.6, fill=kit.SILK)
    a.close()
    # rider: three strokes and a scarf in the realm's colour
    if rider:
        rx, ry = saddle[0], saddle[1] - th * 0.34
        a.open("g", class_="rider")   # stripped while the elf is not yet on its back
        kit.brush(a, [(rx - 4, ry + 2), (rx, ry - 14), (rx + 5, ry - 30)], 11, fill=ink)
        a.circle(rx + 7, ry - 37, 6.4, fill=ink)
        kit.brush(a, [(rx + 4, ry - 26), (rx - 22, ry - 30), (rx - 48, ry - 20), (rx - 70, ry - 30)], 7.5, lambda t: 1 - 0.8 * t,
                  fill=kit.shade(acc, -0.3), opacity=0.92)
        kit.brush(a, [(rx + 3, ry - 22), (rx + 22, ry - 12), (rx + 34, ry - 4)], 5, lambda t: 1 - 0.6 * t, fill=ink)
        a.close()
    # near wing
    tip, tips = wing(a, kind, S, t1, wl, sp["ww"], sp["fingers"], ink, 0.96)
    if kind == "astraia":
        a.poly(a.star_pts(tip[0], tip[1], 12, 3, n=4), fill=kit.shade(acc, -0.15))
    if kind == "sylvan":
        for _, tp in tips:
            a.ellipse(tp[0], tp[1], 9, 4, fill=kit.shade(acc, -0.3), opacity=0.8, transform=f"rotate({f(r.uniform(0, 180))} {f(tp[0])} {f(tp[1])})")
    a.close()
    return dict(head=(cx + hx * s, cy + hy * s), tail=(cx + ex * s, cy + ey * s))


def gift_fx(a, kind, cx, cy, back):
    r = a.rng
    acc = kit.REALMS[SPEC[kind]["realm"]]["acc"]
    dk = kit.shade(acc, -0.3)
    if kind == "sylvan" and back:
        br = [(a.w + 10, cy + 150), (cx + 170, cy + 120), (cx + 110, cy + 60), (cx + 50, cy + 74)]
        kit.brush(a, br, 20, lambda t: 1 - 0.75 * t, fill=kit.WASH, opacity=0.85)
        kit.brush(a, [(cx + 150, cy + 108), (cx + 176, cy + 66), (cx + 210, cy + 50)], 9, lambda t: 1 - 0.8 * t, fill=kit.WASH, opacity=0.85)
        for _ in range(26):
            px, py = r.choice([(cx + 60, cy + 70), (cx + 112, cy + 58), (cx + 205, cy + 48), (cx + 168, cy + 80)])
            px, py = px + r.gauss(0, 16), py + r.gauss(-8, 12)
            a.ellipse(px, py, r.uniform(7, 13), r.uniform(3, 5), fill=r.choice([acc, dk, kit.shade(acc, 0.25)]), opacity=0.8,
                      transform=f"rotate({f(r.uniform(0, 180))} {f(px)} {f(py)})")
    if kind == "aetherius" and back:
        cur = [(20, cy + 96), (140, cy + 70), (260, cy + 30), (360, cy + 34), (a.w - 20, cy - 10)]
        a.path(kit.pd(kit.brush_poly(a, cur, 54, lambda t: 0.4 + 0.6 * math.sin(math.pi * t))), fill=acc, opacity=0.6, filter=a.blur(3))
        for off in (-12, 2, 15):
            a.path(a.smooth_d([(x, y + off) for x, y in cur]), fill="none", stroke=dk, stroke_width=1.5, stroke_dasharray="24 11", opacity=0.75)
        for sx0, sy0 in ((50, cy + 92), (a.w - 54, cy - 2)):
            spi = [(sx0 + 5 * t * math.cos(t * 1.1), sy0 + 5 * t * math.sin(t * 1.1)) for t in [i / 3 for i in range(28)]]
            a.path(a.smooth_d(spi), fill="none", stroke=dk, stroke_width=2)
    if kind == "gaia" and not back:
        bx, by = cx + 150, cy + 30
        blk = [(bx - 34, by + 140), (bx - 40, by + 10), (bx - 8, by - 26), (bx + 38, by - 8), (bx + 44, by + 140)]
        a.path(kit.pd(blk), fill=kit.WASH, opacity=0.9, filter=a.roughen(4, 0.05))
        a.path(kit.crack_d(r, bx, by + 130, -1.4, 110, 10, 0.35), fill="none", stroke=acc, stroke_width=2.4)
        for _ in range(12):
            px, py = bx + r.uniform(-70, 70), by - 30 - r.uniform(0, 60)
            a.poly(kit.rot([(-5, -4), (5, -5), (6, 4), (-4, 5)], r.uniform(0, 3), 0, 0), fill=kit.WASH, opacity=0.7, transform=f"translate({f(px)},{f(py)}) scale({f(r.uniform(0.5, 1.5))})")
        for k in range(3):
            a.path(f"M{f(bx - 60 + k * 8)},{f(by + 138)} q-6,-40 -2,-{60 + k * 14}", fill="none", stroke=kit.WASH, stroke_width=1.2, opacity=0.5)
    if kind == "aquatica" and back:
        surf = [(0, cy + 96), (110, cy + 76), (230, cy + 104), (360, cy + 82), (a.w, cy + 100)]
        a.path(a.smooth_d(surf) + f" L{a.w},{a.h} L0,{a.h}Z", fill=acc, opacity=0.4, filter=a.blur(4))
        a.path(a.smooth_d(surf), fill="none", stroke=dk, stroke_width=2.2, opacity=0.8)
        for k in range(3):
            a.path(a.smooth_d([(x + 20, y + 22 + k * 20) for x, y in surf]), fill="none", stroke=dk, stroke_width=1.1, stroke_dasharray="30 18", opacity=0.5)
        for _ in range(26):
            px, py = cx - 60 + r.gauss(0, 60), cy + 60 - abs(r.gauss(0, 46))
            a.path(f"M{f(px)},{f(py)} q4,7 0,10 q-4,-3 0,-10z", fill=dk, opacity=0.7)
    if kind == "umbra" and back:
        a.ellipse(cx + 10, cy + 126, 150, 22, fill=kit.WASH, opacity=0.8, filter=a.blur(5))
        a.circle(cx + 40, cy - 92, 46, fill=kit.WASH, opacity=0.92)
        a.circle(cx + 40, cy - 92, 56, fill="none", stroke=acc, stroke_width=5, opacity=0.75, filter=a.blur(3))
        a.circle(cx + 40, cy - 92, 49, fill="none", stroke=kit.shade(acc, 0.4), stroke_width=1.5)
    if kind == "astraia" and back:
        tr = [(14, cy + 74), (120, cy + 40), (230, cy + 22), (300, cy + 10)]
        a.path(a.smooth_d(tr), fill="none", stroke=acc, stroke_width=20, stroke_linecap="round", opacity=0.45, filter=a.blur(4))
        a.path(a.smooth_d(tr), fill="none", stroke=dk, stroke_width=5, stroke_linecap="round")
        a.path(a.smooth_d(tr), fill="none", stroke="#fff6cf", stroke_width=1.5)
        for x, y in tr[:3]:
            a.poly(a.star_pts(x, y, 11, 3, n=4), fill=dk)
        a.stipple(0, cy + 20, 300, 90, n=70, r=(0.6, 1.8), fill=dk, opacity=0.8)


def base_of(kind, pose):
    return GIFT_BASE[kind] if pose == "gift" else pose


def register(kind, pose, label):
    sp = SPEC[kind]
    realm = kit.REALMS[sp["realm"]]
    name = realm["dragon"]
    title = f"{name}: {GIFT[kind] if pose == 'gift' else label}"

    @asset(G, f"flight-{kind}-{pose}", group="figures", title=title, w=480, h=360, row=ROW)
    def fig(a: Art):
        a.rng.seed(a.seed)
        kit.silk(a)
        r = a.rng
        acc = realm["acc"]
        cx, cy = 250, 196 - (22 if pose == "beat" else 0) - (10 if pose == "gift" and kind == "aquatica" else 0)
        # a pale sun of the realm's colour and a mist band (class "plate": stripped when the figure flies in play)
        a.open("g", class_="plate")
        a.circle(350, 96, 54, fill=acc, opacity=0.28, filter=a.blur(6))
        a.ellipse(240, 318, 300, 22, fill=kit.WASH, opacity=0.1, filter=a.blur(10))
        far = kit.ridge(r, -10, 490, 300, 26, 0.55, 5)
        a.path(kit.pd(far, False) + " L490,370 L-10,370Z", fill=kit.WASH, opacity=0.13, filter=a.blur(3))
        a.close()
        if pose == "gift":
            a.open("g", class_="fx")
            gift_fx(a, kind, cx, cy, True)
            a.close()
            if kind == "umbra":   # where it was, a moment ago
                dragon(a, kind, pose, cx - 120, cy + 34, 0.74, rider=False, alpha=0.2)
        ang = {"aquatica": -22, "astraia": -8}.get(kind, 0) if pose == "gift" else 0
        dragon(a, kind, pose, cx + (30 if pose == "gift" and kind == "umbra" else 0), cy + (26 if base_of(kind, pose) == "rise" else 0), 0.8 if kind == "aetherius" else 0.9, angle=ang)
        if pose == "gift":
            a.open("g", class_="fx")
            gift_fx(a, kind, cx, cy, False)
            a.close()
        a.open("g", class_="plate")
        if pose == "beat":   # the puff of a wing beat
            for k in range(3):
                a.path(f"M{180 + k * 34},{318 + k * 5} q12,10 26,0", fill="none", stroke=kit.shade(acc, -0.35), stroke_width=2, opacity=0.7)
        kit.seal_stamp(a, sp["realm"], 418, 296)
        a.text(22, 40, name.upper(), size=17, family="serif", fill="#2a2826", letter_spacing=3)
        a.text(22 + len(name) * 17.6 + 14, 40, GIFT[kind] if pose == "gift" else label, size=15, family="serif", font_style="italic", fill="#55514a")
        a.close()
    fig.__doc__ = (f"{name}, the {realm['tribe']} tribe's dragon, in a few sumi strokes on silk with {realm['elf']} riding: "
                   + {"glide": "wings spread in a glide.", "rise": "the wings at the top of a beat, climbing.",
                      "beat": "the wings swept down under the body.",
                      "gift": f"using its gift, {GIFT[kind]}, shown in the realm's one colour."}[pose])
    return fig


for _kind in SPEC:
    for _pose, _label in POSES:
        register(_kind, _pose, _label)

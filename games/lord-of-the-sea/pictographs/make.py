"""Lord of the Sea gameplay pictographs. Built by tools/pictographs/build.py."""
import math

from core import H, W, Pic, f, register

G = "lord-of-the-sea"

# The game's palette (DESIGN.md section 15).
INK = "#1F2E4A"      # Company ink-blue
RED = "#8C2B2B"      # ledger red
TEA = "#6B4A2B"      # tea brown
LAMP = "#F4F1E8"     # lamp white
GREEN = "#2F6B5E"    # sea-green
FOAM = "#E8F2EE"     # foam
VIOLET = "#4B3F63"   # storm violet
GOLD = "#E7A93B"     # dawn gold


def ribbon(p: Pic, fn, x0, x1, width, step=6, **kw):
    """A burin line: a filled ribbon along y = fn(x) whose width(x, slope) swells and thins."""
    top, bot = [], []
    x = x0
    while x <= x1:
        y = fn(x)
        s = (fn(x + 1) - fn(x - 1)) / 2
        w = max(0.25, width(x, s))
        top.append((x, y - w / 2))
        bot.append((x, y + w / 2))
        x += step
    d = "M" + " L".join(f"{f(a)},{f(b)}" for a, b in top) + " L" + " L".join(
        f"{f(a)},{f(b)}" for a, b in reversed(bot)) + "Z"
    p.path(d, **kw)


def arrow_head(p: Pic, x, y, ang, size=14, **kw):
    a = math.radians(ang)
    pts = [(x, y),
           (x - size * math.cos(a - 0.45), y - size * math.sin(a - 0.45)),
           (x - size * math.cos(a + 0.45), y - size * math.sin(a + 0.45))]
    p.poly(pts, **kw)


def arc_d(cx, cy, r, a0, a1):
    """Path data for an arc between two angles in degrees (clockwise when a1 > a0)."""
    x0, y0 = cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0))
    x1, y1 = cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1))
    large = 1 if abs(a1 - a0) > 180 else 0
    sweep = 1 if a1 > a0 else 0
    return f"M{f(x0)},{f(y0)} A{f(r)},{f(r)} 0 {large},{sweep} {f(x1)},{f(y1)}"


# ------------------------------------------------------------------------------------------------
# 2D: The Engraved Sea, copperplate engraving
# ------------------------------------------------------------------------------------------------

def _sloop(p: Pic, x, y, ang, scale=1.0, ink=INK, sail="#fbf8ef"):
    p.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)}) scale({f(scale)})")
    hull = [(-62, -6), (66, -6), (48, 16), (-50, 16)]
    p.poly(hull, fill=sail, stroke=ink, stroke_width=2.4)
    for i in range(-56, 60, 5):
        p.line(i, -2, i + 4, 14, stroke=ink, stroke_width=1)
    p.line(-4, -6, -4, -128, stroke=ink, stroke_width=3)
    main = [(-2, -122), (-2, -12), (-58, -12)]
    jib = [(-6, -118), (58, -10), (-6, -10)]
    for sp in (main, jib):
        p.poly(sp, fill=sail, stroke=ink, stroke_width=2)
    for k in range(1, 9):
        yy = -12 - k * 12
        p.line(-4, yy, -2 - (122 + yy) * 56 / 110, yy, stroke=ink, stroke_width=0.8, opacity=0.8)
    p.close()


def _cutter(p: Pic, x, y, ang, ink=INK):
    p.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)})")
    p.path("M-110,-8 L120,-14 Q100,22 70,24 L-92,24 Q-112,10 -110,-8Z", fill=ink)
    for i in range(-96, 110, 16):
        p.rect(i, -2, 7, 6, fill=LAMP)
    for mx, hgt in ((-30, 170), (50, 190)):
        p.line(mx, -10, mx, -10 - hgt, stroke=ink, stroke_width=4)
        for k, sw in enumerate((70, 58, 44)):
            yy = -24 - k * (hgt / 3.3)
            p.poly([(mx - sw / 2, yy - 44), (mx + sw / 2, yy - 44), (mx + sw / 2 + 6, yy), (mx - sw / 2 - 6, yy)],
                   fill=LAMP, stroke=ink, stroke_width=2)
            p.hatch(mx - sw / 2 - 6, yy - 44, sw + 12, 44, angle=90, spacing=4,
                    clip=p.clip(f'<polygon points="{f(mx - sw / 2)},{f(yy - 44)} {f(mx + sw / 2)},{f(yy - 44)} '
                                f'{f(mx + sw / 2 + 6)},{f(yy)} {f(mx - sw / 2 - 6)},{f(yy)}" '
                                f'transform="translate({f(x)},{f(y)}) rotate({f(ang)})"/>'),
                    stroke=ink, stroke_width=0.7)
    p.poly([(50, -200), (50, -186), (80, -193)], fill=RED)
    p.line(-110, -8, -150, -40, stroke=ink, stroke_width=2.5)
    p.close()


@register(G, "engraved-sea")
def engraved_sea(p: Pic):
    """The Engraved Sea (2D): a side-scrolling run across a copperplate sea. Alexi's small sloop surfs
    down the face of a crest he has just raised by stirring at the reticle behind him; a revenue cutter
    gives chase from the trough, its grapnel line falling short. Above, the chart strip shows his
    course inked to the pin, and the coast strip shows boats lifting at their moorings."""
    r = p.rng
    p.paper(LAMP, grain=0.28, fibre=1.1)
    ink = dict(fill=INK)
    # frame
    p.rect(14, 14, W - 28, H - 28, fill="none", stroke=INK, stroke_width=3)
    p.rect(24, 24, W - 48, H - 48, fill="none", stroke=INK, stroke_width=1)
    # chart strip
    p.rect(40, 36, W - 80, 86, fill="#efe8d4", stroke=INK, stroke_width=1.5)
    for i in range(0, W - 80, 20):
        p.rect(40 + i, 36, 10, 5, fill=INK)
    coast = [(40, 108)]
    for x in range(60, W - 40, 24):
        coast.append((x, 104 - 18 * math.sin(x / 90) - r.uniform(0, 8)))
    coast.append((W - 40, 122))
    coast.append((40, 122))
    p.poly(coast, fill="#e1d6b8", stroke=INK, stroke_width=1)
    track = [(x, 70 + 10 * math.sin(x / 70)) for x in range(70, 1130, 10)]
    p.path(p.smooth_d(track[:44]), fill="none", stroke=INK, stroke_width=2.2)
    p.path(p.smooth_d(track[43:]), fill="none", stroke=INK, stroke_width=1.4, stroke_dasharray="6 6")
    px, py = track[43]
    p.circle(px, py - 14, 8, fill=RED, stroke=INK, stroke_width=1.5)
    p.line(px, py - 6, px, py + 4, stroke=INK, stroke_width=2)
    p.circle(1120, 76, 10, fill="none", stroke=INK, stroke_width=2)
    p.circle(1120, 76, 3, fill=INK)
    p.text(980, 62, "SPICE PORT", size=13, family="serif", fill=INK, letter_spacing=2)
    p.text(60, 58, "1.2 nm of 3.0", size=13, family="serif", fill=INK, font_style="italic")
    # coast strip: silhouettes and moored boats lifting
    p.rect(40, 128, W - 80, 52, fill="#ece4cc", stroke=INK, stroke_width=1)
    for i, x in enumerate(range(60, 1150, 34)):
        lift = 8 * math.sin(i * 0.7) + 4
        if i % 5 == 2:
            p.poly([(x, 172), (x, 150), (x + 12, 140), (x + 24, 150), (x + 24, 172)], fill=INK)
        elif i % 5 == 4:
            p.circle(x + 8, 150, 4, fill=INK)
            p.rect(x + 5, 154, 6, 18, fill=INK)
        else:
            p.path(f"M{x},{f(166 - lift)} q14,8 28,0 l-4,6 h-20z", fill=INK)
            p.line(x + 14, 166 - lift, x + 14, 146 - lift, stroke=INK, stroke_width=1.2)
            p.line(x + 14, 166 - lift, x + 14, 178, stroke=INK, stroke_width=0.6, stroke_dasharray="2 2")
    for x in range(44, W - 44, 7):
        p.line(x, 176, x + 4, 176 + r.uniform(-1, 1), stroke=INK, stroke_width=0.6)
    # sky: horizontal engraved lines, denser upward, interrupted by clouds
    top, horizon = 186, 300
    clouds = [(300, 220, 140, 26), (760, 240, 190, 30), (1050, 210, 110, 20)]
    y = top
    while y < horizon:
        t = (y - top) / (horizon - top)
        p.line(40, y, W - 40, y, stroke=INK, stroke_width=f(1.4 - 1.1 * t), opacity=0.85)
        y += 3.2 + 4 * t
    for cx, cy, rx, ry in clouds:
        n = int(rx / 26)
        puffs = []
        for i in range(n):
            t = i / (n - 1)
            pr = ry * (0.7 + 0.8 * math.sin(math.pi * t)) + r.uniform(-4, 4)
            puffs.append((cx - rx + 2 * rx * t, cy + ry - pr * 0.9, pr))
        p.rect(cx - rx - ry * 0.5, cy + ry - 6, 2 * rx + ry, 10, fill=LAMP)
        for px_, py_, pr in puffs:
            p.circle(px_, py_, pr, fill=LAMP)
        for px_, py_, pr in puffs:
            p.path(arc_d(px_, py_, pr, 190, 340), fill="none", stroke=INK, stroke_width=1.3)
            p.path(arc_d(px_, py_ + 5, pr - 6, 200, 330), fill="none", stroke=INK, stroke_width=0.6)
    # lighthouse on its rock with a beam
    p.poly([(1060, 300), (1076, 230), (1088, 230), (1104, 300)], fill=LAMP, stroke=INK, stroke_width=2)
    for yy in range(240, 300, 12):
        p.line(1074, yy, 1092 + (yy - 240) * 0.2, yy, stroke=INK, stroke_width=3)
    p.rect(1072, 218, 20, 12, fill=GOLD, stroke=INK, stroke_width=2)
    beam = p.clip('<polygon points="1082,224 720,180 720,264"/>')
    p.hatch(700, 170, 380, 110, angle=4, spacing=5, clip=beam, stroke=GOLD, stroke_width=1.2)
    # the far sea: burin lines following travelling waves
    p.open("g", clip_path=p.clip(f'<rect x="40" y="186" width="{W - 80}" height="{H - 226}"/>'))
    phases = [r.uniform(0, 6.28) for _ in range(4)]
    rows = 54
    for j in range(rows):
        s = j / (rows - 1)
        y0 = horizon + 4 + 470 * s ** 1.5
        A = 1.5 + 18 * s
        k = 0.012 / (0.35 + s)
        sh = j * 0.33

        def fy(x, y0=y0, A=A, k=k, sh=sh):
            return y0 + A * (0.6 * math.sin(k * x + phases[0] + sh) + 0.3 * math.sin(2.3 * k * x + phases[1])
                             + 0.15 * math.sin(4.1 * k * x + phases[2] + sh))

        ribbon(p, fy, 40, W - 40, lambda x, sl, s=s: (0.5 + 2.4 * s) * (1 + 1.6 * max(-0.6, sl)), step=8, **ink)
    # the raised crest (stirred) and the boat running down its face
    c, base, Hh = 470, 690, 250

    def Y(x, base=base, Hh=Hh):
        w = 240 if x < c else 150
        return base - Hh * math.exp(-((x - c) / w) ** 2)

    body = [(x, Y(x)) for x in range(40, W - 39, 6)] + [(W - 40, H - 40), (40, H - 40)]
    p.poly(body, fill=LAMP)
    for kk in range(1, 26):
        b2, h2 = base - 6 + kk * 13, Hh * (1 - kk / 26) ** 1.2
        ribbon(p, lambda x, b2=b2, h2=h2: Y(x, b2, h2), 40, W - 40,
               lambda x, sl: 0.6 + 1.9 * min(1, abs(sl)) + (1.6 if x > c else 0), step=6, **ink)
    face = " ".join(f"{f(x)},{f(Y(x))}" for x in range(c, c + 330, 6))
    shade = p.clip(f'<polygon points="{face} {c + 330},{H - 40} {c},{H - 40}"/>')
    p.hatch(c, 300, 340, 460, angle=-62, spacing=6, clip=shade, stroke=INK, stroke_width=0.9, opacity=0.8)
    # outline of the crest
    p.path("M" + " L".join(f"{f(x)},{f(Y(x))}" for x in range(40, W - 39, 6)), fill="none", stroke=INK, stroke_width=3)
    # foam curls at the lip
    for i in range(14):
        fx = c - 60 + i * 12 + r.uniform(-3, 3)
        fy0 = Y(fx) - 4
        p.path(f"M{f(fx)},{f(fy0)} q6,-14 14,-4 q-6,-2 -6,4", fill="none", stroke=INK, stroke_width=1.4)
    p.stipple(c - 90, Y(c) - 40, 200, 40, n=160, r=(0.6, 1.5), density=lambda x, y: 1 if y < Y(x) else 0, fill=INK)
    # stir reticle on the crest, with a clockwise arrow
    rx, ry = c - 10, Y(c) + 70
    for rad, dash in ((54, "6 6"), (36, None)):
        p.circle(rx, ry, rad, fill="none", stroke=RED, stroke_width=2.4, stroke_dasharray=dash)
    for a in range(0, 360, 90):
        x1, y1 = rx + 24 * math.cos(math.radians(a)), ry + 24 * math.sin(math.radians(a))
        x2, y2 = rx + 64 * math.cos(math.radians(a)), ry + 64 * math.sin(math.radians(a))
        p.line(x1, y1, x2, y2, stroke=RED, stroke_width=2)
    p.path(arc_d(rx, ry, 80, -150, 60), fill="none", stroke=RED, stroke_width=3)
    arrow_head(p, rx + 80 * math.cos(math.radians(60)), ry + 80 * math.sin(math.radians(60)), 150, 18, fill=RED)
    p.text(rx - 30, ry + 120, "STIR", size=18, family="serif", fill=RED, letter_spacing=4)
    # Alexi's sloop down the face
    bx = 760
    by = Y(bx)
    ang = math.degrees(math.atan2(Y(bx + 2) - Y(bx - 2), 4))
    _sloop(p, bx, by - 6, ang * 0.55, 1.05)
    for i in range(6):
        p.path(f"M{bx - 70 - i * 18},{f(Y(bx - 70 - i * 18) - 2)} q-10,-8 -20,0", fill="none", stroke=INK, stroke_width=1.2)
    # revenue cutter in the trough behind, its grapnel falling short
    cx0 = 150
    _cutter(p, cx0, Y(cx0) + 30, -6)
    p.path(f"M{cx0 + 120},{f(Y(cx0) + 6)} Q260,360 340,{f(Y(340) + 20)}", fill="none", stroke=INK, stroke_width=1.6,
           stroke_dasharray="4 4")
    p.path("M332,%s l10,10 m-10,-10 l14,-4 m-14,4 l2,14" % f(Y(340) + 16), fill="none", stroke=INK, stroke_width=2.4)
    p.path(arc_d(cx0 + 110, Y(cx0) + 10, 210, -40, 10), fill="none", stroke=INK, stroke_width=1, stroke_dasharray="2 5")
    p.text(300, Y(300) + 70, "25 m", size=14, family="serif", fill=INK, font_style="italic")
    p.close()
    # compass rose and scale bar in the margins
    rcx, rcy = 1090, 690
    for i in range(16):
        a = math.radians(i * 22.5 - 90)
        L = 56 if i % 4 == 0 else (36 if i % 2 == 0 else 24)
        tip = (rcx + L * math.cos(a), rcy + L * math.sin(a))
        l = (rcx + 8 * math.cos(a - 1.2), rcy + 8 * math.sin(a - 1.2))
        rr = (rcx + 8 * math.cos(a + 1.2), rcy + 8 * math.sin(a + 1.2))
        p.poly([tip, l, (rcx, rcy)], fill=INK)
        p.poly([tip, rr, (rcx, rcy)], fill=LAMP, stroke=INK, stroke_width=1)
    p.circle(rcx, rcy, 62, fill="none", stroke=INK, stroke_width=1.2)
    p.text(rcx - 6, rcy - 66, "N", size=16, family="serif", fill=INK)
    p.rect(34, H - 66, 420, 34, fill=LAMP)
    p.rect(40, H - 58, 300, 18, fill=LAMP, stroke=INK, stroke_width=1.2)
    for i in range(6):
        if i % 2 == 0:
            p.rect(40 + i * 50, H - 58, 50, 9, fill=INK)
        else:
            p.rect(40 + i * 50, H - 49, 50, 9, fill=INK)
    p.text(350, H - 42, "nautical miles", size=13, family="serif", fill=INK, font_style="italic")


# ------------------------------------------------------------------------------------------------
# 2D: The Deep, deep-sea naturalist lithograph
# ------------------------------------------------------------------------------------------------

def _radiolarian(p: Pic, cx, cy, R, col, glow=True, kind=0):
    r = p.rng
    if glow:
        p.circle(cx, cy, R * 1.9, fill=p.radial([(0, col, 0.55), (0.5, col, 0.18), (1, col, 0)]))
    n = r.choice([6, 8, 10, 12])
    p.circle(cx, cy, R, fill="none", stroke=col, stroke_width=1.6)
    p.circle(cx, cy, R * 0.62, fill="none", stroke=col, stroke_width=1)
    # lattice: pores on two rings
    for ring, m in ((0.82, n * 2), (0.45, n)):
        for i in range(m):
            a = 2 * math.pi * (i + 0.5 * (ring < 0.5)) / m
            p.circle(cx + R * ring * math.cos(a), cy + R * ring * math.sin(a), R * 0.07 + 0.6,
                     fill="none", stroke=col, stroke_width=0.8)
    for i in range(n):
        a = 2 * math.pi * i / n
        x1, y1 = cx + R * math.cos(a), cy + R * math.sin(a)
        L = R * (0.7 + 0.5 * (i % 2)) if kind == 0 else R * 1.4
        x2, y2 = cx + (R + L) * math.cos(a), cy + (R + L) * math.sin(a)
        p.line(x1, y1, x2, y2, stroke=col, stroke_width=1.2)
        if kind == 1:
            for t in (0.4, 0.7):
                qx, qy = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
                p.line(qx, qy, qx + 6 * math.cos(a + 0.9), qy + 6 * math.sin(a + 0.9), stroke=col, stroke_width=0.8)
                p.line(qx, qy, qx + 6 * math.cos(a - 0.9), qy + 6 * math.sin(a - 0.9), stroke=col, stroke_width=0.8)
        p.line(cx + R * 0.62 * math.cos(a), cy + R * 0.62 * math.sin(a), x1, y1, stroke=col, stroke_width=0.7)
    p.circle(cx, cy, R * 0.22, fill=col, opacity=0.9)


@register(G, "deep")
def deep(p: Pic):
    """The Deep (2D): Alexi swims down through four light bands toward a sunken tender, carried by a
    current he stirs as a glowing ribbon. Company chains hang from the pilings as a sweeping hazard,
    glowing specimens drift past, and the screen edge darkens with the pull of the deep. The depth
    gauge in the margin reads his depth; the pale ring marks the strongbox in the wreck."""
    r = p.rng
    p.rect(0, 0, W, H, fill=p.gradient([(0, "#3d6f86"), (0.18, "#24496a"), (0.45, INK), (0.75, "#0d1424"),
                                        (1, "#060a12")]))
    # litho crayon grain
    fid = p.uid("litho")
    p.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="1.6" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  '
           f'0 0 0 0.35 -0.12"/></filter>')
    p.rect(0, 0, W, H, filter=f"url(#{fid})", opacity=0.7)
    # surface and light rays
    surf = [(x, 34 + 6 * math.sin(x / 40)) for x in range(0, W + 1, 10)]
    p.path(p.smooth_d(surf), fill="none", stroke=FOAM, stroke_width=2, opacity=0.8)
    for i in range(9):
        x = 160 + i * 120 + r.uniform(-30, 30)
        p.poly([(x, 36), (x + 40, 36), (x + 260, 520), (x + 150, 520)], fill=FOAM, opacity=0.05 + 0.03 * (i % 2))
    # inverted engraving: white lines that thin out with depth
    y = 48
    while y < H:
        t = y / H
        if r.random() > t * 0.9:
            ph = r.uniform(0, 6)
            pts = [(x, y + 3 * math.sin(x / 60 + ph)) for x in range(70, W + 1, 30)]
            p.path(p.smooth_d(pts), fill="none", stroke=FOAM, stroke_width=f(1.2 - t), opacity=f(0.5 - 0.4 * t))
        y += 6 + 22 * t
    # pilings and chains
    for i, px in enumerate((930, 1030, 1130)):
        p.rect(px, 0, 34, 440 + i * 60, fill="#0a1220", stroke=FOAM, stroke_width=1.2, opacity=0.95)
        for yy in range(10, 440 + i * 60, 9):
            p.line(px + 4, yy, px + 30, yy + r.uniform(-3, 3), stroke=FOAM, stroke_width=0.5, opacity=0.35)
        p.stipple(px - 4, 120, 42, 300, n=140, r=(0.8, 2.4), fill=FOAM, opacity=0.5)
    # the dredge chain: links along a catenary
    def chain(x0, y0, x1, y1, sag, n=28, col=FOAM):
        for k in range(n):
            t = k / (n - 1)
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)
            dx = (x1 - x0) / n
            dy = (y1 - y0) / n + sag * 4 * (1 - 2 * t) / n
            a = math.degrees(math.atan2(dy, dx))
            w = 9 if k % 2 == 0 else 5
            p.ellipse(x, y, 11, w, transform=f"rotate({f(a)} {f(x)} {f(y)})", fill="none", stroke=col, stroke_width=2.6)
    chain(947, 300, 560, 640, 120, n=34)
    chain(1047, 380, 820, 760, 60, n=24)
    p.path("M560,640 l-30,40 m30,-40 l30,36 m-30,-36 l0,46", fill="none", stroke=FOAM, stroke_width=3)
    p.path("M600,700 C560,690 520,712 498,690", fill="none", stroke=FOAM, stroke_width=1, stroke_dasharray="3 6",
           opacity=0.6)
    # the sunken tender, the strongbox, the pale target ring
    p.path("M640,800 L700,710 Q800,660 930,700 L990,800Z", fill="#05080f", stroke=FOAM, stroke_width=1.6)
    for k in range(9):
        x = 700 + k * 32
        p.line(x, 712 - k * 2, x - 10, 800, stroke=FOAM, stroke_width=0.8, opacity=0.6)
    p.rect(796, 708, 48, 30, fill=TEA, stroke=GOLD, stroke_width=2)
    p.line(796, 720, 844, 720, stroke=GOLD, stroke_width=2)
    for rr, op in ((48, 0.9), (60, 0.4), (74, 0.2)):
        p.circle(820, 724, rr, fill="none", stroke=FOAM, stroke_width=3 if rr == 48 else 1.5, opacity=op)
    # glowing specimens: radiolarians and drifting motes, labelled like a plate
    specs = [(250, 600, 46, GOLD, 0), (1080, 610, 34, "#9fe0c8", 1), (160, 330, 22, "#9fe0c8", 1),
             (540, 420, 18, GOLD, 0), (860, 520, 26, "#b9a8e0", 1), (360, 740, 20, "#b9a8e0", 0)]
    for i, (sx, sy, sr, col, kind) in enumerate(specs):
        _radiolarian(p, sx, sy, sr, col, kind=kind)
        p.text(sx + sr + 10, sy - sr - 4, f"Fig. {i + 1}", size=13, family="serif", fill=FOAM, font_style="italic",
               opacity=0.8)
    for _ in range(90):
        x, yy = r.uniform(80, W - 20), r.uniform(200, H - 20)
        rr = r.uniform(0.8, 2.6)
        p.circle(x, yy, rr * 3, fill=p.radial([(0, "#c8f5e4", 0.5), (1, "#c8f5e4", 0)]))
        p.circle(x, yy, rr * 0.6, fill="#e8fff6")
    # the stirred current: a glowing ribbon spiralling down toward the wreck
    pts = []
    for i in range(60):
        t = i / 59
        pts.append((330 + 470 * t + 60 * math.sin(t * 9), 230 + 450 * t ** 1.2 + 26 * math.cos(t * 9)))
    for wdt, op in ((26, 0.12), (12, 0.25), (4, 0.9)):
        p.path(p.smooth_d(pts), fill="none", stroke="#8fe6c9", stroke_width=wdt, opacity=op, stroke_linecap="round")
    for k in range(1, 6):
        x, yy = pts[k * 10]
        x2, y2 = pts[k * 10 + 2]
        arrow_head(p, x2, y2, math.degrees(math.atan2(y2 - yy, x2 - x)), 16, fill="#8fe6c9")
    p.circle(300, 200, 26, fill="none", stroke="#8fe6c9", stroke_width=2, stroke_dasharray="4 5")
    p.path(arc_d(300, 200, 38, -200, 20), fill="none", stroke="#8fe6c9", stroke_width=2)
    # Alexi: a pale figure diving head-down along the current
    p.open("g", transform="translate(400,260) rotate(56) scale(1.35)", fill="none", stroke=LAMP, stroke_width=4,
           stroke_linecap="round", stroke_linejoin="round")
    p.circle(70, 0, 13, fill=LAMP)
    p.path("M56,0 L0,4")
    p.path("M48,-2 L80,-28 L104,-36")
    p.path("M48,4 L82,24 L102,40")
    p.path("M0,4 L-36,-10 L-58,-4")
    p.path("M0,4 L-34,20 L-60,14")
    p.close()
    for i in range(7):
        bx, byy = 470 + r.uniform(-20, 20), 300 - i * 34
        p.circle(bx, byy, 2 + i * 0.6, fill="none", stroke=FOAM, stroke_width=1.2)
    # depth gauge in the margin, light bands
    p.rect(0, 0, 70, H, fill="#05080f", opacity=0.6)
    p.line(48, 40, 48, H - 30, stroke=FOAM, stroke_width=2)
    bands = [(0, "0 m"), (20, "20"), (60, "60"), (150, "150")]
    scale = lambda m: 40 + (H - 70) * (m / 200) ** 0.7
    for m in range(0, 201, 10):
        yy = scale(m)
        p.line(48, yy, 38 if m % 50 else 30, yy, stroke=FOAM, stroke_width=1)
    for m, lab in bands:
        yy = scale(m)
        p.line(30, yy, 66, yy, stroke=GOLD, stroke_width=2)
        p.text(6, yy - 4, lab, size=12, family="serif", fill=GOLD)
    yy = scale(74)
    p.poly([(50, yy), (66, yy - 9), (66, yy + 9)], fill=LAMP)
    p.text(8, yy + 22, "74", size=15, family="serif", fill=LAMP)
    # the pull: the screen edge darkening
    p.vignette(0.9, "#000")
    p.text(860, H - 22, "PLATE IV.  THE DEEP", size=15, family="serif", fill=FOAM, letter_spacing=3, opacity=0.75)


# ------------------------------------------------------------------------------------------------
# 1D: Liar's Tide, sailor's tattoo flash
# ------------------------------------------------------------------------------------------------
BLACK = "#16130f"
FLASH = dict(stroke=BLACK, stroke_width=6, stroke_linejoin="round", stroke_linecap="round")


def _face_icon(p: Pic, face, s=1.0):
    """Draw a tide-die face icon at the origin (inside a transform)."""
    k = dict(stroke=BLACK, stroke_width=4 * s, fill="none", stroke_linecap="round", stroke_linejoin="round")
    if face == "gull":
        p.path(f"M{-22 * s},{6 * s} Q{-11 * s},{-14 * s} 0,{4 * s} Q{11 * s},{-14 * s} {22 * s},{6 * s}", **k)
    elif face == "shell":
        p.path(f"M{-20 * s},{6 * s} A{20 * s},{20 * s} 0 0,1 {20 * s},{6 * s} L0,{18 * s}Z", **dict(k, fill=GOLD))
        for a in (-50, -25, 0, 25, 50):
            p.line(0, 18 * s, 18 * s * math.sin(math.radians(a)), (6 - 18 * math.cos(math.radians(a))) * s,
                   stroke=BLACK, stroke_width=2.5 * s)
    elif face == "rope":
        p.circle(0, 0, 14 * s, **k)
        p.path(f"M{-14 * s},0 C{-14 * s},{24 * s} {14 * s},{24 * s} {14 * s},0", **k)
    elif face == "bottle":
        p.path(f"M{-5 * s},{-22 * s} h{10 * s} v{10 * s} q{10 * s},{6 * s} {10 * s},{14 * s} v{16 * s} h{-30 * s} "
               f"v{-16 * s} q0,{-8 * s} {10 * s},{-14 * s}z", **dict(k, fill="#5f9e86"))
    elif face == "lantern":
        p.circle(0, -20 * s, 5 * s, **k)
        p.rect(-12 * s, -14 * s, 24 * s, 30 * s, rx=4 * s, **dict(k, fill=GOLD))
        p.path(f"M0,{8 * s} q{-6 * s},{-8 * s} 0,{-16 * s} q{6 * s},{8 * s} 0,{16 * s}z", fill=RED)
    elif face == "wave":
        p.path(f"M{-24 * s},{14 * s} Q{-18 * s},{-18 * s} {10 * s},{-10 * s} Q{-6 * s},{-4 * s} {4 * s},{6 * s} "
               f"Q{14 * s},{12 * s} {24 * s},{14 * s}Z", **dict(k, fill=GREEN))


def _die(p: Pic, x, y, size, ang, face, fill="#f6ecd2"):
    p.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)})")
    d = size * 0.18
    p.rect(-size / 2 + d, -size / 2 + d, size, size, rx=size * 0.16, fill=BLACK)
    p.rect(-size / 2, -size / 2, size, size, rx=size * 0.16, fill=fill, **FLASH)
    p.path(f"M{f(-size / 2 + 10)},{f(-size / 2 + 18)} q0,-8 8,-8", fill="none", stroke="#fff", stroke_width=4,
           stroke_linecap="round")
    _face_icon(p, face, size / 90)
    p.close()


def _swallow(p: Pic, x, y, s, flip=1, ang=0):
    p.open("g", transform=f"translate({f(x)},{f(y)}) rotate({f(ang)}) scale({f(s * flip)},{f(s)})")
    p.path("M-70,-10 C-40,-50 10,-40 30,-6 C60,-30 90,-30 112,-60 C104,-20 80,0 44,10 C30,30 0,40 -30,34 "
           "L-80,60 L-60,26 L-96,30 L-64,8Z", fill="#2f4e8a", **FLASH)
    p.path("M-30,34 C0,40 30,30 44,10 C20,18 -10,22 -40,18Z", fill=RED, stroke=BLACK, stroke_width=4)
    p.path("M40,-2 C60,-12 80,-20 96,-40", fill="none", stroke=FOAM, stroke_width=3)
    p.circle(-46, -12, 5, fill=BLACK)
    p.poly([(-70, -10), (-92, -2), (-66, 0)], fill=GOLD, stroke=BLACK, stroke_width=3)
    p.close()


def _banner(p: Pic, cx, cy, w, text, fill=RED, size=34):
    h = 58
    curve = 18
    p.path(f"M{f(cx - w / 2 - 50)},{f(cy - h / 2 + 18)} l40,0 l0,{h} l-40,0 l18,{-h / 2}z", fill="#6e1f1f", **FLASH)
    p.path(f"M{f(cx + w / 2 + 50)},{f(cy - h / 2 + 18)} l-40,0 l0,{h} l40,0 l-18,{-h / 2}z", fill="#6e1f1f", **FLASH)
    p.path(f"M{f(cx - w / 2)},{f(cy - h / 2)} Q{f(cx)},{f(cy - h / 2 - curve)} {f(cx + w / 2)},{f(cy - h / 2)} "
           f"L{f(cx + w / 2)},{f(cy + h / 2)} Q{f(cx)},{f(cy + h / 2 - curve)} {f(cx - w / 2)},{f(cy + h / 2)}Z",
           fill=fill, **FLASH)
    p.text(cx, cy + size * 0.28, text, size=size, family="serif", fill="#f6ecd2", text_anchor="middle",
           font_weight="bold", letter_spacing=3)


def _eye(p: Pic, x, y, s, look, lit):
    p.open("g", transform=f"translate({f(x)},{f(y)}) scale({f(s)})")
    p.path("M-50,0 Q0,-40 50,0 Q0,40 -50,0Z", fill="#f6ecd2", **FLASH)
    p.circle(look * 16, 0, 17, fill=GREEN if not lit else RED, stroke=BLACK, stroke_width=5)
    p.circle(look * 16, 0, 7, fill=BLACK)
    p.circle(look * 16 + 5, -5, 3, fill="#fff")
    if lit:
        for a in range(-150, -20, 26):
            x1, y1 = 58 * math.cos(math.radians(a)), 44 * math.sin(math.radians(a))
            p.line(x1, y1, x1 * 1.3, y1 * 1.35, stroke=BLACK, stroke_width=5, stroke_linecap="round")
    p.close()


@register(G, "liars-tide")
def liars_tide(p: Pic):
    """Liar's Tide (1D): a bluffing dice game at a tavern table, drawn as a sailor's tattoo flash.
    Alexi's horn cup is lifted to show his five tide dice; the shared tide die sits face up in the
    middle; the bid on the banner claims four Lanterns. A circling arrow marks his secret stir of the
    cup, and the row of sailors' eyes turning red shows suspicion rising toward being caught."""
    r = p.rng
    p.paper("#efe0bd", grain=0.3, fibre=0.8)
    p.vignette(0.35, TEA)
    # filler: stars and dots, scattered but kept off the main pieces
    keep = [(600, 470, 300), (600, 110, 300)]
    for _ in range(70):
        x, y = r.uniform(30, W - 30), r.uniform(30, H - 30)
        if any(math.hypot(x - kx, y - ky) < kr for kx, ky, kr in keep):
            continue
        if r.random() < 0.4:
            p.poly(Pic.star_pts(x, y, r.uniform(9, 16), 4, 4, rot=r.uniform(0, 90)), fill=BLACK)
        else:
            p.circle(x, y, r.uniform(2, 4), fill=BLACK)
    # rope border
    for side in range(4):
        n = 40 if side % 2 == 0 else 26
        for i in range(n):
            t = (i + 0.5) / n
            if side == 0:
                x, y, a = 20 + t * (W - 40), 20, 30
            elif side == 2:
                x, y, a = 20 + t * (W - 40), H - 20, 30
            elif side == 1:
                x, y, a = W - 20, 20 + t * (H - 40), -60
            else:
                x, y, a = 20, 20 + t * (H - 40), -60
            p.ellipse(x, y, 16, 7, transform=f"rotate({a} {f(x)} {f(y)})", fill=GOLD, stroke=BLACK, stroke_width=3)
    # sailors' eyes: suspicion
    for i, (lit, look) in enumerate(((True, 1), (True, 0.6), (False, -0.2), (False, -0.8))):
        _eye(p, 300 + i * 200, 108, 0.95, look, lit)
    p.text(600, 182, "SUSPICION", size=20, family="sans-serif", font_weight="bold", fill=BLACK, text_anchor="middle",
           letter_spacing=6)
    # the lifted horn cup with a stir arrow
    cx, cy = 600, 470
    p.ellipse(cx, cy + 80, 290, 62, fill=GREEN, **FLASH)
    p.ellipse(cx, cy + 80, 250, 44, fill="#3f8a75", stroke=BLACK, stroke_width=3)
    # the shared tide die, face up behind; Alexi's five dice in front of his lifted cup
    _die(p, cx, cy + 10, 100, 8, "lantern", fill=GOLD)
    p.text(cx + 70, cy - 40, "TIDE DIE", size=16, family="sans-serif", font_weight="bold", fill=BLACK,
           letter_spacing=4)
    faces = ["lantern", "wave", "lantern", "gull", "shell"]
    for i, fc in enumerate(faces):
        _die(p, cx - 220 + i * 110, cy + 112 + 8 * math.sin(i * 1.3), 76, r.uniform(-16, 16), fc)
    # cup tipped back, hovering, with the stir circling it
    ux, uy, ur = 960, 460, 120
    p.open("g", transform=f"translate({ux},{uy}) rotate(-28) scale(0.8)")
    p.path("M-80,-90 L80,-90 L60,70 Q0,92 -60,70Z", fill="#d9a35a", **FLASH)
    for k in range(4):
        y = -60 + k * 34
        p.path(f"M{-76 + k * 5},{y} Q0,{y + 14} {76 - k * 5},{y}", fill="none", stroke=BLACK, stroke_width=4)
    p.ellipse(0, -90, 80, 22, fill="#8a5a2a", **FLASH)
    p.path("M-50,-40 L-40,40", stroke="#f6ecd2", stroke_width=6, stroke_linecap="round")
    p.close()
    p.path(arc_d(ux, uy, ur, -200, 40), fill="none", stroke=BLACK, stroke_width=20, stroke_linecap="round")
    p.path(arc_d(ux, uy, ur, -200, 40), fill="none", stroke=RED, stroke_width=11, stroke_linecap="round")
    ex, ey = ux + ur * math.cos(math.radians(40)), uy + ur * math.sin(math.radians(40))
    arrow_head(p, ex - 22, ey + 22, 130, 46, fill=RED, stroke=BLACK, stroke_width=5)
    p.text(ux - 60, uy + 190, "STIR", size=40, family="serif", font_weight="bold", fill=RED, stroke=BLACK,
           stroke_width=1.5, letter_spacing=5)
    # swallows carrying the bid
    _swallow(p, 160, 290, 0.9, 1, -12)
    _swallow(p, 1040, 290, 0.9, -1, 12)
    _banner(p, 600, 270, 420, "FOUR LANTERNS", size=34)
    # the bid ledger in chalk tallies, bottom right
    for i in range(5):
        x = 930 + i * 34
        for j in range(4):
            p.line(x + j * 7, 690, x + j * 7 + 2, 740, stroke=BLACK, stroke_width=4, stroke_linecap="round")
        if i < 4:
            p.line(x - 4, 728, x + 28, 700, stroke=BLACK, stroke_width=4, stroke_linecap="round")
    # stakes: a pile of coins, bottom left
    for i in range(6):
        p.ellipse(140 + (i % 3) * 30, 720 - (i // 3) * 22 - i * 3, 34, 12, fill=GOLD, **FLASH)


# ------------------------------------------------------------------------------------------------
# 1D: The Charter, engrossed deed with wax seal
# ------------------------------------------------------------------------------------------------

def _script(p: Pic, x, y, w, size=1.0, col="#2a2018"):
    """A line of engrossing hand: loops and ascenders, read as script at a glance."""
    r = p.rng
    d = [f"M{f(x)},{f(y)}"]
    cx = x
    while cx < x + w:
        word = r.randint(3, 8)
        for _ in range(word):
            h = 9 * size * (2.1 if r.random() < 0.18 else 1)
            dn = 9 * size * (1.9 if r.random() < 0.08 else 0)
            step = r.uniform(6, 9) * size
            d.append(f"C{f(cx + step * 0.2)},{f(y - h)} {f(cx + step * 0.8)},{f(y - h)} {f(cx + step * 0.5)},{f(y + dn)}")
            cx += step
        d.append(f"M{f(cx + 9 * size)},{f(y)}")
        cx += 9 * size + r.uniform(0, 6)
    p.path(" ".join(d), fill="none", stroke=col, stroke_width=f(1.5 * size), stroke_linecap="round")


def _flourish(p: Pic, x, y, s, flip=1, col="#2a2018"):
    pts = []
    for i in range(80):
        t = i / 79
        a = t * 4.2 * math.pi
        rr = 40 * s * (1 - t) + 4
        pts.append((x + flip * (t * 160 * s + rr * math.cos(a)), y + rr * math.sin(a) * 0.7))
    p.path(p.smooth_d(pts), fill="none", stroke=col, stroke_width=1.6)


@register(G, "charter")
def charter(p: Pic):
    """The Charter (1D): a deed of sale laid on a writing slope. The player has followed the clause
    references (the red thread) to the binding clause, "and all waters adjoining", pinned and
    underlined it, and is dragging the evidence slip from the drawer onto it. Three ink drops show
    the guesses left; the ribboned wax seal waits at the foot of the deed."""
    r = p.rng
    # the writing slope: tea-brown wood grain
    p.rect(0, 0, W, H, fill=TEA)
    for i in range(70):
        y = i * 12 + r.uniform(-4, 4)
        pts = [(x, y + 6 * math.sin(x / r.uniform(80, 160) + i)) for x in range(-20, W + 40, 40)]
        p.path(p.smooth_d(pts), fill="none", stroke="#4f351d" if i % 3 else "#80603d", stroke_width=r.uniform(1, 3),
               opacity=0.7)
    p.vignette(0.55, "#1d1208")
    # page tabs, then the vellum
    for i, lab in enumerate(("I", "II", "III", "IV", "V", "VI")):
        x = 300 + i * 92
        p.path(f"M{x},64 l8,-30 h60 l8,30z", fill="#efe2c2" if i != 4 else "#f7ecd0", stroke="#8a6d45", stroke_width=1.5)
        p.text(x + 38, 56, lab, size=16, family="serif", fill=INK, text_anchor="middle")
    doc = [(230, 60), (960, 56), (968, 770), (226, 778)]
    p.poly([(x + 10, y + 12) for x, y in doc], fill="#120a04", opacity=0.45)
    p.open("g", filter=p.roughen(4, 0.05))
    p.poly(doc, fill="#f7ecd0")
    p.close()
    p.rect(232, 62, 732, 712, fill=p.radial([(0, "#f7ecd0", 0), (0.8, "#e6d2a2", 0.3), (1, "#c9ad74", 0.8)]))
    p.rect(258, 90, 680, 660, fill="none", stroke="#8a6d45", stroke_width=1)
    # heading and illuminated initial
    p.rect(278, 108, 76, 76, fill=RED)
    p.rect(284, 114, 64, 64, fill="none", stroke=GOLD, stroke_width=2)
    p.text(316, 168, "T", size=62, family="serif", fill=GOLD, text_anchor="middle", font_style="italic")
    p.text(370, 160, "his Indenture of Sale", size=44, family="serif", fill="#2a2018", font_style="italic")
    _flourish(p, 600, 196, 0.6, 1)
    _flourish(p, 600, 196, 0.6, -1)
    # clauses: an index margin, engrossed lines, one clause pinned and underlined
    y = 250
    clause_y = {}
    for n in range(1, 8):
        clause_y[n] = y
        p.text(270, y, f"{n}.", size=20, family="serif", fill=RED, font_weight="bold")
        lines = 2 if n != 4 else 1
        for li in range(lines if n != 4 else 0):
            _script(p, 310, y + li * 26, 600 - (r.uniform(0, 160) if li == lines - 1 else 0), 1.0)
        if n == 4:
            _script(p, 310, y, 150, 1.0)
            p.text(474, y + 2, "and all waters adjoining", size=27, family="serif", fill="#2a2018",
                   font_style="italic")
            p.line(470, y + 12, 790, y + 12, stroke=RED, stroke_width=3)
            p.line(470, y + 18, 790, y + 18, stroke=RED, stroke_width=1.5)
            _script(p, 800, y, 110, 1.0)
            y += 26
        y += lines * 26 + 22
    # cross-references and the red thread
    refs = [(1, 760), (3, 640), (6, 700), (7, 520)]
    tx, ty = 772, clause_y[4] + 15
    for n, x in refs:
        yy = clause_y[n] + 2
        p.text(x, yy - 14, "cl. 4", size=13, family="serif", fill=RED, font_style="italic")
        p.path(f"M{x + 14},{yy - 10} Q{(x + tx) / 2 + r.uniform(-60, 60)},{(yy + ty) / 2 - 30} {tx},{ty}",
               fill="none", stroke=RED, stroke_width=1.8, opacity=0.85)
    p.circle(tx, ty, 9, fill=RED, stroke="#4a1010", stroke_width=2)
    p.circle(tx - 3, ty - 3, 3, fill="#e9a0a0")
    # an amendment slip pinned to the margin
    p.open("g", transform="rotate(-7 300 610)")
    p.rect(240, 560, 150, 100, fill="#fbf4e0", stroke="#a08860", stroke_width=1)
    for k in range(3):
        _script(p, 252, 590 + k * 20, 120, 0.6)
    p.circle(314, 568, 5, fill=INK)
    p.close()
    # the ribboned wax seal
    sx, sy = 780, 640
    for side in (-1, 1):
        p.path(f"M{sx},{sy} L{sx + side * 70},{sy + 120} l{-side * 14},-10 l{-side * 16},16 L{sx + side * 10},{sy}Z",
               fill="#2f5a7a", stroke="#173049", stroke_width=1.5)
    blob = []
    for i in range(22):
        a = 2 * math.pi * i / 22
        rr = 58 + r.uniform(-6, 6)
        blob.append((sx + rr * math.cos(a), sy + rr * math.sin(a)))
    p.path(p.smooth_d(blob, closed=True), fill=RED, stroke="#4a1010", stroke_width=2)
    p.circle(sx, sy, 40, fill="none", stroke="#5e1717", stroke_width=3)
    p.circle(sx, sy, 34, fill="none", stroke="#b5504a", stroke_width=1.5)
    p.path(f"M{sx - 22},{sy + 6} q22,16 44,0 l-6,-4 h-32z M{sx},{sy + 6} v-30 m0,0 l16,22 h-16", fill="#5e1717",
           stroke="#5e1717", stroke_width=2)
    p.ellipse(sx - 18, sy - 22, 12, 6, fill="#d06a63", opacity=0.6)
    _script(p, 300, 700, 280, 0.9)
    p.line(300, 720, 560, 720, stroke="#2a2018", stroke_width=1)
    # ink pot with three drops (two left)
    p.ellipse(1080, 150, 62, 20, fill="#1a120a")
    p.path("M1030,150 L1030,90 Q1080,70 1130,90 L1130,150Z", fill="#20304a", stroke="#0d1424", stroke_width=2)
    p.ellipse(1080, 90, 50, 14, fill="#0d1424")
    p.path("M1090,88 C1120,20 1160,-10 1190,-20 C1150,10 1130,40 1096,90Z", fill=LAMP, stroke="#b9ab8d", stroke_width=1)
    for i in range(3):
        dx = 1030 + i * 50
        col = INK if i < 2 else "none"
        p.path(f"M{dx},200 q-16,24 0,32 q16,-8 0,-32z", fill=col, stroke="#e6d6b0", stroke_width=2.5)
    p.text(1020, 262, "INK", size=16, family="serif", fill="#e6d6b0", letter_spacing=6)
    # the evidence slip, dragged from the drawer
    p.rect(990, 380, 210, 300, fill="#3d2814", stroke="#1d1208", stroke_width=3)
    p.text(1010, 410, "EVIDENCE", size=14, family="serif", fill="#e6d6b0", letter_spacing=5)
    p.open("g", transform="rotate(-10 900 420)")
    p.rect(830, 400, 170, 110, fill="#fbf4e0", stroke="#8a6d45", stroke_width=1.5)
    p.text(842, 426, "RECEIPT", size=15, family="serif", fill=INK, letter_spacing=4)
    for k in range(3):
        _script(p, 842, 450 + k * 18, 140, 0.55)
    p.close()
    p.path("M880,400 C850,360 790,330 720,316", fill="none", stroke=GOLD, stroke_width=3, stroke_dasharray="8 6")
    arrow_head(p, 716, 315, 195, 18, fill=GOLD)
    # a hand-cursor glove over the slip
    p.path("M968,470 l-14,-40 q-4,-10 6,-12 q8,-2 12,8 l6,18 l2,-26 q2,-10 10,-10 q8,0 8,10 l0,10 q2,-8 10,-6 "
           "q8,2 6,12 l0,6 q4,-6 10,-2 q6,4 2,14 l-10,30 q-6,14 -24,14 l-12,0 q-14,0 -26,-26z",
           fill=LAMP, stroke=INK, stroke_width=2.4)


# ------------------------------------------------------------------------------------------------
# 1D: The Tea Board, blue-and-white export porcelain
# ------------------------------------------------------------------------------------------------
COB = "#1E3F8C"
COB2 = "#3D63B8"
WASH = "#A9BCE3"
GLAZE = "#F7F8FB"

PORTS = {
    "Home": (240, 420), "Tidewater": (420, 250), "Unwritten": (380, 600), "Salt": (560, 470),
    "Strait": (680, 230), "Pearl": (760, 610), "Spice": (860, 400), "Halls": (1000, 260),
}
LANES = [("Home", "Tidewater"), ("Home", "Unwritten"), ("Home", "Salt"), ("Tidewater", "Strait"),
         ("Unwritten", "Salt"), ("Salt", "Pearl"), ("Strait", "Spice"), ("Pearl", "Spice"), ("Pearl", "Halls"),
         ("Spice", "Halls"), ("Tidewater", "Spice"), ("Strait", "Halls")]


def _fret(p: Pic, x, y, w, h, cell=28):
    """A key-fret band, repeated along a box edge."""
    d = []
    nx = int(w / cell)
    for i in range(nx):
        x0 = x + i * cell
        d.append(f"M{f(x0)},{f(y + h)} V{f(y + 4)} H{f(x0 + cell - 6)} V{f(y + h - 6)} H{f(x0 + 8)} V{f(y + 12)} "
                 f"H{f(x0 + cell - 14)} V{f(y + h - 14)}")
    p.path(" ".join(d), fill="none", stroke=COB, stroke_width=3)


def _pagoda(p: Pic, x, y, s=1.0):
    p.open("g", transform=f"translate({f(x)},{f(y)}) scale({f(s)})")
    p.path("M-40,-10 Q0,-30 40,-10 L30,-18 Q0,-36 -30,-18Z", fill=COB)
    p.rect(-26, -10, 52, 30, fill=GLAZE, stroke=COB, stroke_width=2.5)
    for k in range(-20, 24, 8):
        p.line(k, -10, k, 20, stroke=COB2, stroke_width=1.2)
    p.path("M-30,-40 Q0,-56 30,-40 L22,-46 Q0,-62 -22,-46Z", fill=COB)
    p.rect(-16, -40, 32, 22, fill=GLAZE, stroke=COB, stroke_width=2)
    p.line(0, -60, 0, -50, stroke=COB, stroke_width=3)
    p.close()


@register(G, "tea-board")
def tea_board(p: Pic):
    """The Tea Board (1D): the Company's parlour game, a trade-route board painted like blue-and-white
    porcelain. Eight ports joined by twelve lanes of three slots; solid cobalt Chests (Company) and
    white wave-marked Hymns (Alexi) contest each lane, and debt coins sit on a port. The tide dial
    stands at High, when Alexi may stir and push a Chest off its lane, as the arrow shows."""
    r = p.rng
    p.rect(0, 0, W, H, fill=GLAZE)
    p.rect(0, 0, W, H, fill=p.radial([(0, "#ffffff", 0.9), (0.7, "#eef1f8", 0.4), (1, "#d7deee", 0.8)], 0.4, 0.35, 0.8))
    # border: cobalt band, fret, scallops
    p.rect(14, 14, W - 28, H - 28, fill="none", stroke=COB, stroke_width=4)
    p.rect(24, 24, W - 48, 34, fill=COB)
    p.rect(24, H - 58, W - 48, 34, fill=COB)
    p.rect(24, 24, 34, H - 48, fill=COB)
    p.rect(W - 58, 24, 34, H - 48, fill=COB)
    for x in range(30, W - 30, 22):
        p.circle(x + 11, 41, 7, fill="none", stroke=GLAZE, stroke_width=2)
        p.circle(x + 11, H - 41, 7, fill="none", stroke=GLAZE, stroke_width=2)
    for y in range(64, H - 64, 22):
        p.circle(41, y + 11, 7, fill="none", stroke=GLAZE, stroke_width=2)
        p.circle(W - 41, y + 11, 7, fill="none", stroke=GLAZE, stroke_width=2)
    _fret(p, 70, 66, W - 140, 28)
    _fret(p, 70, H - 94, W - 140, 28)
    for x in range(70, W - 70, 30):
        p.path(f"M{x},100 q15,16 30,0", fill="none", stroke=COB2, stroke_width=2)
        p.path(f"M{x},{H - 100} q15,-16 30,0", fill="none", stroke=COB2, stroke_width=2)
    # water: fine brush lines in wash blue
    for i in range(40):
        y = 120 + i * 14
        ph = r.uniform(0, 6)
        pts = [(x, y + 3 * math.sin(x / 26 + ph)) for x in range(80, W - 79, 20)]
        p.path(p.smooth_d(pts), fill="none", stroke=WASH, stroke_width=1, opacity=0.6)
    # willow-pattern scenery in the corners: a willow, a bridge, two birds
    for k in range(18):
        a = math.radians(200 + k * 8)
        sx, sy = 140 + 20 * math.cos(a), 220 + 10 * math.sin(a)
        p.path(f"M{f(sx)},{f(sy)} q{r.uniform(-10, 10)},40 {r.uniform(-14, 14)},{r.uniform(70, 110)}", fill="none",
               stroke=COB2, stroke_width=2)
    p.path("M150,330 C140,280 160,240 140,200", fill="none", stroke=COB, stroke_width=8)
    p.path("M470,690 Q560,630 650,690", fill="none", stroke=COB, stroke_width=6)
    for x in range(486, 640, 18):
        yy = 690 - 60 * (1 - ((x - 560) / 90) ** 2) + 6
        p.line(x, yy, x, yy + 18, stroke=COB, stroke_width=2)
    for bx, by, s in ((560, 140, 1), (620, 120, -1)):
        p.path(f"M{bx - 24 * s},{by} q{12 * s},-16 {24 * s},0 q{12 * s},-16 {24 * s},0", fill="none", stroke=COB,
               stroke_width=4)
    # lanes and slots
    rng_state = {}
    pieces = ["chest", "hymn", None]
    for li, (a, b) in enumerate(LANES):
        (x1, y1), (x2, y2) = PORTS[a], PORTS[b]
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        nx, ny = -(y2 - y1), (x2 - x1)
        L = math.hypot(nx, ny)
        bend = 26 if li % 2 else -26
        if li == 10:
            bend = 80
        qx, qy = mx + nx / L * bend, my + ny / L * bend
        p.path(f"M{x1},{y1} Q{f(qx)},{f(qy)} {x2},{y2}", fill="none", stroke=COB, stroke_width=7, opacity=0.9)
        p.path(f"M{x1},{y1} Q{f(qx)},{f(qy)} {x2},{y2}", fill="none", stroke=GLAZE, stroke_width=2,
               stroke_dasharray="2 8")
        for s in range(3):
            t = 0.3 + 0.2 * s
            px = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * qx + t ** 2 * x2
            py = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * qy + t ** 2 * y2
            p.circle(px, py, 15, fill=GLAZE, stroke=COB, stroke_width=2.5)
            kind = r.choice(pieces)
            if li == 6 and s == 1:
                kind = "chest"
                rng_state["push"] = (px, py)
            if kind == "chest":
                p.rect(px - 11, py - 9, 22, 18, rx=2, fill=COB)
                p.line(px - 11, py - 3, px + 11, py - 3, stroke=GLAZE, stroke_width=1.5)
            elif kind == "hymn":
                p.circle(px, py, 11, fill=GLAZE, stroke=COB, stroke_width=3)
                p.path(f"M{f(px - 7)},{f(py + 2)} q4,-8 8,0 q4,8 6,-2", fill="none", stroke=COB, stroke_width=2)
        p.text(qx + 4, qy - 18, f"L{li + 1}", size=13, family="serif", fill=COB2, font_style="italic")
    # ports
    for name, (x, y) in PORTS.items():
        p.circle(x, y, 40, fill=GLAZE, stroke=COB, stroke_width=4)
        p.circle(x, y, 33, fill="none", stroke=COB2, stroke_width=1.2, stroke_dasharray="3 3")
        _pagoda(p, x, y + 16, 0.6)
        p.text(x, y + 62, name.upper(), size=14, family="serif", fill=COB, text_anchor="middle", letter_spacing=2,
               font_weight="bold")
    # debt coins on Spice
    for k in range(2):
        x, y = PORTS["Spice"][0] - 52 - k * 22, PORTS["Spice"][1] - 30
        p.circle(x, y, 14, fill=COB, stroke=GLAZE, stroke_width=2)
        p.rect(x - 4, y - 4, 8, 8, fill=GLAZE)
    # the stir: a chest pushed off its lane
    sx, sy = rng_state["push"]
    p.path(f"M{f(sx + 20)},{f(sy - 10)} q60,-50 100,-20", fill="none", stroke=COB, stroke_width=3, stroke_dasharray="6 5")
    arrow_head(p, sx + 122, sy - 30, 20, 16, fill=COB)
    p.path(arc_d(sx, sy, 28, -60, 220), fill="none", stroke=COB, stroke_width=2.5)
    # tide dial
    dx, dy = 1060, 560
    p.circle(dx, dy, 72, fill=GLAZE, stroke=COB, stroke_width=5)
    for i, lab in enumerate(("LOW", "RISING", "HIGH", "FALLING")):
        a0 = -90 + i * 90
        if lab == "HIGH":
            p.path(f"M{dx},{dy} " + arc_d(dx, dy, 64, a0, a0 + 90)[0:].replace("M", "L", 1) + "Z", fill=WASH)
        p.line(dx, dy, dx + 64 * math.cos(math.radians(a0)), dy + 64 * math.sin(math.radians(a0)), stroke=COB,
               stroke_width=1.5)
        am = math.radians(a0 + 45)
        p.text(dx + 44 * math.cos(am), dy + 44 * math.sin(am) + 4, lab, size=10, family="serif", fill=COB,
               text_anchor="middle", font_weight="bold")
    p.line(dx, dy, dx + 60 * math.cos(math.radians(140)), dy + 60 * math.sin(math.radians(140)), stroke=COB,
           stroke_width=4, stroke_linecap="round")
    p.circle(dx, dy, 6, fill=COB)
    # reserves along the bottom
    for i in range(7):
        x = 110 + i * 34
        p.circle(x, 680, 13, fill=GLAZE, stroke=COB, stroke_width=3)
        p.path(f"M{x - 7},682 q4,-8 8,0 q4,8 6,-2", fill="none", stroke=COB, stroke_width=2)
    for i in range(6):
        x = 880 + i * 30
        p.rect(x - 11, 670, 22, 18, rx=2, fill=COB)


# ------------------------------------------------------------------------------------------------
# 1D: Dead Reckoning, nautical plotting sheet
# ------------------------------------------------------------------------------------------------
PENCIL = "#4a4a4a"


def _rose(p: Pic, cx, cy, R):
    p.circle(cx, cy, R, fill="none", stroke=INK, stroke_width=1.6)
    p.circle(cx, cy, R - 22, fill="none", stroke=INK, stroke_width=1)
    for deg in range(360):
        a = math.radians(deg - 90)
        L = 18 if deg % 10 == 0 else (11 if deg % 5 == 0 else 6)
        p.line(cx + R * math.cos(a), cy + R * math.sin(a), cx + (R - L) * math.cos(a), cy + (R - L) * math.sin(a),
               stroke=INK, stroke_width=1 if deg % 10 else 1.6)
        if deg % 30 == 0:
            tx, ty = cx + (R + 16) * math.cos(a), cy + (R + 16) * math.sin(a) + 5
            p.text(tx, ty, f"{deg:03d}", size=13, family="sans-serif", fill=INK, text_anchor="middle")
    # inner magnetic rose, offset by variation
    var = -8
    p.circle(cx, cy, R * 0.58, fill="none", stroke=RED, stroke_width=1)
    for deg in range(0, 360, 5):
        a = math.radians(deg - 90 + var)
        L = 12 if deg % 30 == 0 else 6
        p.line(cx + R * 0.58 * math.cos(a), cy + R * 0.58 * math.sin(a),
               cx + (R * 0.58 - L) * math.cos(a), cy + (R * 0.58 - L) * math.sin(a), stroke=RED, stroke_width=0.9)
    for i in range(8):
        a = math.radians(i * 45 - 90)
        L = R * (0.5 if i % 2 == 0 else 0.3)
        tip = (cx + L * math.cos(a), cy + L * math.sin(a))
        l = (cx + 12 * math.cos(a - 1.3), cy + 12 * math.sin(a - 1.3))
        rr = (cx + 12 * math.cos(a + 1.3), cy + 12 * math.sin(a + 1.3))
        p.poly([tip, l, (cx, cy)], fill=INK, opacity=0.85)
        p.poly([tip, rr, (cx, cy)], fill=LAMP, stroke=INK, stroke_width=0.8)
    p.poly(Pic.star_pts(cx, cy - R * 0.5 - 12, 9, 4, 5), fill=RED)


@register(G, "dead-reckoning")
def dead_reckoning(p: Pic):
    """Dead Reckoning (1D): a navigation puzzle on a plotting sheet. From the last fix, Alexi has
    pencilled two legs by heading, speed and time, and drawn each hour's tide vector from the tide
    table; one vector, stirred, is turned aside in green to clear the rocks. The dividers mark the
    dead-reckoned position just inside the target circle, ready to commit."""
    r = p.rng
    p.paper("#f3f0e3", grain=0.18, fibre=1.3)
    # graticule with a chart border of alternating minute bars
    p.grid(40, 40, W - 80, H - 80, 20, stroke="#9fb3a8", stroke_width=0.4, opacity=0.6)
    p.grid(40, 40, W - 80, H - 80, 100, stroke="#7d968a", stroke_width=1, opacity=0.8)
    p.rect(30, 30, W - 60, H - 60, fill="none", stroke=INK, stroke_width=2)
    for i in range(0, W - 60, 20):
        if (i // 20) % 2 == 0:
            p.rect(30 + i, 30, 20, 6, fill=INK)
            p.rect(30 + i, H - 36, 20, 6, fill=INK)
    for j in range(0, H - 60, 20):
        if (j // 20) % 2 == 0:
            p.rect(30, 30 + j, 6, 20, fill=INK)
            p.rect(W - 36, 30 + j, 6, 20, fill=INK)
    for j, lab in enumerate(("41°20'", "41°10'", "41°00'", "40°50'")):
        p.text(44, 146 + j * 200, lab, size=12, family="sans-serif", fill="#5b7468")
    # compass rose, lower right
    _rose(p, 930, 540, 150)
    # fix, legs (pencil), tide vectors: hour by hour
    fx, fy = 170, 680
    p.circle(fx, fy, 13, fill="none", stroke=INK, stroke_width=2.6)
    p.circle(fx, fy, 2.5, fill=INK)
    p.text(fx + 22, fy + 26, "FIX 0600", size=16, family="sans-serif", fill=INK, font_weight="bold")
    legs = [(62, 3, 3), (28, 3, 2)]  # heading deg, knots (x45 px per hour), hours
    tide = [(110, 60), (130, 70), (300, 100), (320, 64), (330, 54)]
    x, y = fx, fy
    hour = 0
    for hd, spd, hrs in legs:
        a = math.radians(hd - 90)
        x0, y0 = x, y
        for h in range(hrs):
            nx, ny = x + spd * 45 * math.cos(a), y + spd * 45 * math.sin(a)
            p.wobble([(x, y), (nx, ny)], amp=0.9, step=26, stroke=PENCIL, stroke_width=3, stroke_linecap="round")
            mx, my = (x + nx) / 2, (y + ny) / 2
            arrow_head(p, mx + 7 * math.cos(a), my + 7 * math.sin(a), hd - 90, 14, fill=PENCIL)
            p.line(nx - 7 * math.cos(a + 1.57), ny - 7 * math.sin(a + 1.57), nx + 7 * math.cos(a + 1.57),
                   ny + 7 * math.sin(a + 1.57), stroke=PENCIL, stroke_width=1.6)
            p.text(nx + 12, ny + 20, f"{7 + hour:02d}00", size=13, family="sans-serif", fill=PENCIL)
            tset, rate = tide[hour]
            stirred = hour == 2
            if stirred:
                # the tide as tabled would set onto the rocks: shown as a ghost, then turned aside
                ga = math.radians(tset - 90)
                gx, gy = nx + rate * math.cos(ga), ny + rate * math.sin(ga)
                p.line(nx, ny, gx, gy, stroke=PENCIL, stroke_width=1.4, stroke_dasharray="4 5", opacity=0.7)
                for hx, hy in ((gx - 6, gy + 2), (gx + 16, gy - 12), (gx - 22, gy - 16), (gx + 4, gy - 30)):
                    p.text(hx, hy, "+", size=26, family="sans-serif", fill=INK, text_anchor="middle")
                    for k in range(4):
                        aa = r.uniform(0, 6.28)
                        p.circle(hx + 11 * math.cos(aa), hy - 8 + 11 * math.sin(aa), 1.4, fill=INK)
                p.circle(gx - 2, gy - 18, 52, fill="none", stroke=RED, stroke_width=1.6, stroke_dasharray="3 5")
                p.path(arc_d(nx, ny, 46, tset - 90, tset - 90 + 36), fill="none", stroke=GREEN, stroke_width=2.4)
                arrow_head(p, nx + 46 * math.cos(math.radians(tset - 54)), ny + 46 * math.sin(math.radians(tset - 54)),
                           tset - 54 + 90, 12, fill=GREEN)
                p.text(nx + 20, ny + 44, "STIRRED", size=14, family="sans-serif", fill=GREEN, font_weight="bold",
                       letter_spacing=3)
                tset += 40
            ta = math.radians(tset - 90)
            tx, ty = nx + rate * math.cos(ta), ny + rate * math.sin(ta)
            col = GREEN if stirred else "#3a5f8a"
            p.line(nx, ny, tx, ty, stroke=col, stroke_width=2.6)
            for k in range(3):
                bx, by = nx + (tx - nx) * (0.5 + k * 0.14), ny + (ty - ny) * (0.5 + k * 0.14)
                arrow_head(p, bx, by, math.degrees(ta), 11, fill=col)
            x, y = tx, ty
            hour += 1
        lx, ly = (x0 + x) / 2 - 40, (y0 + y) / 2 + 30
        p.text(lx, ly, f"C {hd:03d}°T   S {spd} kn", size=15, family="sans-serif", fill=PENCIL, font_style="italic",
               transform=f"rotate({f(hd - 90)} {f(lx)} {f(ly)})")
        if hd == 62:
            leg1 = (x0, y0, a)
    # a wreck off the second leg
    p.path(f"M{f(x + 80)},{f(y + 150)} h44 m-32,-11 v22 m22,-22 v22", stroke=INK, stroke_width=2, fill="none")
    p.circle(x + 102, y + 150, 38, fill="none", stroke=RED, stroke_width=1.5, stroke_dasharray="3 5")
    # DR mark and target circle
    p.path(f"M{f(x - 14)},{f(y)} A14,14 0 0,1 {f(x + 14)},{f(y)}Z", fill="none", stroke=INK, stroke_width=2.4)
    p.circle(x, y, 2.5, fill=INK)
    p.text(x - 110, y - 12, "DR 1100", size=16, family="sans-serif", fill=INK, font_weight="bold")
    tcx, tcy = x + 22, y + 14
    p.circle(tcx, tcy, 60, fill=GOLD, opacity=0.15)
    p.circle(tcx, tcy, 60, fill="none", stroke=RED, stroke_width=2.4, stroke_dasharray="10 6")
    p.text(tcx + 66, tcy + 6, "TARGET", size=14, family="sans-serif", fill=RED, letter_spacing=3)
    # dividers: two legs from a hinge, one point pricking the DR
    hx, hy = x + 70, y + 250
    for ex, ey in ((x, y), (x + 140, y + 6)):
        p.line(hx, hy, ex, ey, stroke="#7a7466", stroke_width=8, stroke_linecap="round")
        p.line(hx, hy, ex, ey, stroke="#d8d2c0", stroke_width=2)
    p.circle(hx, hy, 13, fill="#b08d3a", stroke=INK, stroke_width=2)
    # parallel rule laid beside the first leg
    x0, y0, a = leg1
    ux, uy = math.cos(a), math.sin(a)
    for off in (56, 104):
        ox, oy = x0 + 40 + uy * off, y0 - ux * off
        corners = [(ox, oy), (ox + ux * 380, oy + uy * 380), (ox + ux * 380 - uy * 32, oy + uy * 380 + ux * 32),
                   (ox - uy * 32, oy + ux * 32)]
        p.poly(corners, fill="#cfe1dc", stroke=INK, stroke_width=1.5, opacity=0.8)
        for k in range(0, 372, 12):
            q = 6 if k % 60 else 12
            p.line(ox + ux * k, oy + uy * k, ox + ux * k - uy * q, oy + uy * k + ux * q, stroke=INK, stroke_width=0.8)
    # tide table pinned top-left
    p.open("g", transform="rotate(-3 180 140)")
    p.rect(60, 60, 250, 170, fill="#fffdf4", stroke="#a99f86", stroke_width=1.5)
    p.text(76, 88, "TIDAL STREAM", size=15, family="sans-serif", fill=INK, font_weight="bold", letter_spacing=2)
    p.text(76, 112, "HR    SET    RATE", size=13, family="monospace", fill=INK)
    for i, (st, rt) in enumerate(tide[:4]):
        yy = 134 + i * 22
        p.text(76, yy, f"{7 + i:02d}    {st:03d}°  {rt / 20:.1f}", size=13, family="monospace",
               fill=GREEN if i == 2 else INK)
    p.circle(186, 66, 7, fill=RED, stroke=INK, stroke_width=1.5)
    p.close()
    # elapsed-hours clock top-right
    ccx, ccy = 1080, 120
    p.circle(ccx, ccy, 62, fill="#fffdf4", stroke=INK, stroke_width=3)
    for i in range(12):
        a = math.radians(i * 30 - 90)
        p.line(ccx + 52 * math.cos(a), ccy + 52 * math.sin(a), ccx + 60 * math.cos(a), ccy + 60 * math.sin(a),
               stroke=INK, stroke_width=2.5)
    p.path(f"M{ccx},{ccy} L{ccx},{ccy - 58} " + arc_d(ccx, ccy, 58, -90, 60)[0:].replace("M", "L", 1) + "Z",
           fill=GOLD, opacity=0.4)
    p.line(ccx, ccy, ccx + 34 * math.cos(math.radians(60)), ccy + 34 * math.sin(math.radians(60)), stroke=INK,
           stroke_width=4, stroke_linecap="round")
    p.text(ccx - 26, ccy + 92, "5 h 00", size=15, family="sans-serif", fill=INK, font_weight="bold")
    # pencil and eraser smudge
    p.open("g", transform="rotate(-24 980 700)")
    p.rect(860, 690, 220, 18, fill=GOLD, stroke=INK, stroke_width=1.5)
    p.poly([(1080, 690), (1110, 699), (1080, 708)], fill="#e8d2a8", stroke=INK, stroke_width=1.5)
    p.poly([(1100, 696), (1110, 699), (1100, 702)], fill=PENCIL)
    p.rect(842, 690, 18, 18, fill="#c98a8a", stroke=INK, stroke_width=1.5)
    p.close()
    for _ in range(4):
        p.ellipse(r.uniform(300, 900), r.uniform(150, 700), r.uniform(20, 50), r.uniform(8, 16), fill=PENCIL,
                  opacity=0.05, transform=f"rotate({r.uniform(-30, 30):.0f} 600 400)")
    # scale of nautical miles
    p.rect(300, H - 90, 300, 12, fill="#fffdf4", stroke=INK, stroke_width=1.2)
    for i in range(10):
        if i % 2 == 0:
            p.rect(300 + i * 30, H - 90, 30, 12, fill=INK)
    for i in range(6):
        p.text(300 + i * 60, H - 62, str(i), size=13, family="sans-serif", fill=INK, text_anchor="middle")
    p.text(620, H - 78, "nautical miles", size=13, family="sans-serif", fill=INK, font_style="italic")

"""Heartstone: twelve shards (one per step of the pitch wheel), the ring setting, and Tarn's rib, in low-poly facets."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Heartstone shards, ring, Tarn's rib"
OBS, STARW = "#1a1520", "#fbf6e4"
WRITTEN = {2, 7, 10}
CRACKS = [0, 1, 0, 0, 2, 0, 1, 0, 1, 0, 0, 2]


def mesh(a, w, h, cols, rows, glow=(0.5, 1.05), reach=0.75):
    """A jittered triangle mesh: obsidian above, molten light from below."""
    r = a.rng
    gx, gy = w / cols, h / rows
    pts = [[(i * gx + (r.uniform(-gx * .35, gx * .35) if 0 < i < cols else 0),
             j * gy + (r.uniform(-gy * .35, gy * .35) if 0 < j < rows else 0)) for i in range(cols + 1)] for j in range(rows + 1)]
    for j in range(rows):
        for i in range(cols):
            p0, p1, p2, p3 = pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]
            for tri in ((p0, p1, p2), (p0, p2, p3)) if (i + j) % 2 else ((p0, p1, p3), (p1, p2, p3)):
                mx, my = sum(x for x, _ in tri) / 3, sum(y for _, y in tri) / 3
                base = kit.mix(OBS, "#4a2418", (my / h) ** 1.6)
                g = max(0, 1 - math.hypot(mx - w * glow[0], my - h * glow[1]) / (h * reach))
                col = kit.shade(kit.mix(base, kit.MOLTEN, g * 0.45), r.uniform(-0.18, 0.12))
                a.poly(tri, fill=col, stroke=col, stroke_width=0.6)


def crystal(a, cx, cy, hgt, wd, col, lean=0.0, n_cracks=0, written=False):
    """A long shard: a faceted prism with a pointed crown and a broken foot."""
    r = a.rng
    top = (cx + lean * hgt, cy - hgt / 2)
    sh = [(-wd / 2, -hgt * 0.24), (-wd * 0.18, -hgt * 0.3), (wd * 0.2, -hgt * 0.3), (wd / 2, -hgt * 0.2)]
    ft = [(wd * 0.44, hgt * 0.36), (wd * 0.1, hgt * 0.5), (-wd * 0.26, hgt * 0.42), (-wd * 0.46, hgt * 0.3)]
    S = [(cx + x + lean * hgt * 0.6 + r.uniform(-3, 3), cy + y + r.uniform(-4, 4)) for x, y in sh]
    F = [(cx + x + r.uniform(-3, 3), cy + y + r.uniform(-4, 4)) for x, y in ft]
    tones = [0.5, 0.22, -0.05, -0.32]
    a.ellipse(cx + 8, cy + hgt / 2 + 4, wd * 0.7, 9, fill="#000", opacity=0.45, filter=a.blur(4))
    st = dict(stroke="#ffffff", stroke_width=0.7, stroke_opacity=0.55, stroke_linejoin="round")
    for k in range(3):   # crown facets
        a.poly([top, S[k], S[k + 1]], fill=kit.shade(col, tones[k] + 0.12), **st)
    FR = F[::-1]   # left to right
    for k in range(3):   # body facets, each split once
        quad = [S[k], S[k + 1], FR[k + 1], FR[k]]
        mid = ((quad[0][0] + quad[2][0]) / 2 + r.uniform(-6, 6), (quad[0][1] + quad[2][1]) / 2 + r.uniform(-14, 14))
        a.poly([quad[0], quad[1], mid], fill=kit.shade(col, tones[k]), **st)
        a.poly([quad[1], quad[2], mid], fill=kit.shade(col, tones[k] - 0.12), **st)
        a.poly([quad[2], quad[3], mid], fill=kit.shade(col, tones[k] - 0.25), **st)
        a.poly([quad[3], quad[0], mid], fill=kit.shade(col, tones[k] + 0.08), **st)
    if written:   # a Record line cut into one face
        x0, y0 = S[1][0] + 4, S[1][1] + 26
        d = []
        for row in range(5):
            x = x0 + row * 1.5
            while x < S[2][0] - 4:
                ln = r.uniform(4, 10)
                d.append(f"M{f(x)},{f(y0 + row * 11)}h{f(ln)}")
                x += ln + r.uniform(3, 5)
        a.path("".join(d), fill="none", stroke=STARW, stroke_width=1.6, stroke_linecap="round", opacity=0.9)
    for c in range(n_cracks):
        x, y = cx + r.uniform(-wd * .3, wd * .3), cy - hgt * 0.24 + c * 20
        a.path(kit.crack_d(r, x, y, 1.5 + r.uniform(-0.4, 0.4), hgt * 0.42, 9, 0.3), fill="none", stroke="#fff", stroke_width=1.8, stroke_linejoin="round")
    return top


def wheel(a, cx, cy, R, lit, col, labels=False):
    for k in range(12):
        a1, a2 = 2 * math.pi * k / 12 - math.pi / 2 - math.pi / 12, 2 * math.pi * (k + 1) / 12 - math.pi / 2 - math.pi / 12
        tri = [(cx, cy), (cx + R * math.cos(a1), cy + R * math.sin(a1)), (cx + R * math.cos(a2), cy + R * math.sin(a2))]
        on = k in lit
        a.poly(tri, fill=kit.shade(col if on else "#3a2a2a", a.rng.uniform(-0.12, 0.12) + (0.12 if on else 0)), stroke="#1a1010", stroke_width=1)
    a.circle(cx, cy, R * 0.22, fill=OBS, stroke=col, stroke_width=1.5)


def reg_shard(p):
    realm = kit.REALMS[p % 6]

    @asset(G, f"heart-shard-{p:02d}", group="pieces", title=f"Heartstone shard, step {p}", w=200, h=240, row=ROW)
    def draw(a: Art):
        mesh(a, 200, 240, 5, 6)
        col = realm["acc"]
        hgt = 172 - p * 6.5
        wd = 54 + (p % 4) * 7
        a.circle(100, 118, 78, fill=a.radial([(0, col, 0.4), (1, col, 0)]))
        crystal(a, 100, 112 + p * 1.2, hgt, wd, col, lean=((p * 7) % 5 - 2) * 0.03, n_cracks=CRACKS[p], written=p in WRITTEN)
        wheel(a, 34, 206, 22, {p}, col)
        a.text(64, 214, str(p), size=22, family="sans-serif", fill=STARW, font_weight="bold")
        # its pitch as a still line: a low step is a long wave, a high one short
        wl = [(104 + k * 3, 208 + 9 * math.sin(k * (0.25 + p * 0.07))) for k in range(29)]
        a.path(kit.pd(wl, False), fill="none", stroke=col, stroke_width=2, stroke_linejoin="bevel")
    draw.__doc__ = (f"Heartstone shard at step {p} of the twelve-step pitch wheel, flat-shaded facets in the {realm['name']}'s colour"
                    + (f", {CRACKS[p]} crack{'s' if CRACKS[p] > 1 else ''} from earlier strikes" if CRACKS[p] else "")
                    + (", a Record line cut into one face" if p in WRITTEN else "") + ".")
    return draw


for _p in range(12):
    reg_shard(_p)


@asset(G, "heart-ring", group="pieces", title="The Heartstone ring setting", w=600, h=600, row=ROW)
def ring(a: Art):
    """The ring setting on the Stonekeeper's bench, in facets: a gold band of twenty-four planes, the twelve-step pitch wheel
    inside it, five sockets round it. Four hold shards and one, outlined only, is the rest that must stay empty."""
    r = a.rng
    mesh(a, 600, 600, 9, 9, glow=(0.5, 1.1))
    cx, cy, R0, R1 = 300, 300, 150, 200
    a.circle(cx + 8, cy + 14, R1 + 6, fill="#000", opacity=0.45, filter=a.blur(8))
    for k in range(24):
        a1, a2 = 2 * math.pi * k / 24, 2 * math.pi * (k + 1) / 24
        light = 0.5 + 0.5 * math.cos(a1 + 2.2)
        for (ra, rb, dl) in ((R0, (R0 + R1) / 2, 0.0), ((R0 + R1) / 2, R1, -0.18)):
            quad = [(cx + ra * math.cos(a1), cy + ra * math.sin(a1)), (cx + rb * math.cos(a1), cy + rb * math.sin(a1)),
                    (cx + rb * math.cos(a2), cy + rb * math.sin(a2)), (cx + ra * math.cos(a2), cy + ra * math.sin(a2))]
            a.poly(quad, fill=kit.mix("#5a3a1a", "#f0c060", max(0, min(1, light + dl + r.uniform(-0.08, 0.08)))), stroke="#2a1608", stroke_width=1)
    wheel(a, cx, cy, 122, {0, 3, 5, 8, 10}, "#c88a2e")
    for k in range(12):
        an = 2 * math.pi * k / 12 - math.pi / 2
        a.text(cx + 100 * math.cos(an), cy + 100 * math.sin(an) + 6, str(k), size=15, family="sans-serif", fill=STARW, text_anchor="middle", opacity=0.85)
    slots = [(36, 2), (108, 5), (180, None), (252, 3), (324, 0)]
    for ang, realm in slots:
        an = math.radians(ang - 90)
        sx, sy = cx + 228 * math.cos(an), cy + 228 * math.sin(an)
        if realm is None:   # the rest
            a.poly(a.ngon(sx, sy, 46, 6, 30), fill="#120c10", stroke=STARW, stroke_width=2, stroke_dasharray="6 6", opacity=0.9)
            a.line(sx - 20, sy, sx + 20, sy, stroke=STARW, stroke_width=3, opacity=0.8)
            continue
        col = kit.REALMS[realm]["acc"]
        a.poly(a.ngon(sx, sy, 48, 6, 30), fill="#2a1608", stroke="#f0c060", stroke_width=3)
        a.facets(sx, sy, 30, [kit.shade(col, k) for k in (0.45, 0.2, -0.05, -0.3, 0.1, -0.45, 0.3)], n=7, irregular=0.2, stroke="#ffffff", stroke_width=0.6, stroke_opacity=0.5)
    # the beat line across the top: still
    a.poly([(180, 18), (420, 18), (436, 40), (420, 62), (180, 62), (164, 40)], fill="#1a1016", stroke="#c88a2e", stroke_width=2)
    a.line(184, 40, 416, 40, stroke=STARW, stroke_width=2.5)


@asset(G, "heart-tarns-rib", group="pieces", title="Tarn's rib", w=600, h=600, row=ROW)
def rib(a: Art):
    """Tarn's rib in the Bone Choir, in facets: one rib paler and less ancient than the hall's, on two obsidian rests, its beat
    line still wobbling though the door is already open. Six gold notes above it and a seventh in ember orange."""
    r = a.rng
    mesh(a, 600, 600, 9, 9, glow=(0.5, 1.1), reach=0.6)
    # the choir's old ribs behind, dark
    for k in range(6):
        x = 60 + k * 96
        pts = [(x, 600), (x - 30, 420), (x + 10, 260), (x + 70, 180)]
        a.path(kit.pd(kit.brush_poly(a, pts, 26, lambda t: 1 - 0.7 * t)), fill="#2c2228", stroke="#3c3038", stroke_width=1)
    # the rib: a faceted arc
    spine = [(96, 430), (150, 300), (250, 210), (370, 190), (470, 240), (520, 330)]
    c = kit.catmull(spine, 4)
    a.path(kit.pd([(x + 10, y + 26) for x, y in c], False), fill="none", stroke="#000", stroke_width=30, opacity=0.4, filter=a.blur(8), stroke_linecap="round")
    for i in range(len(c) - 1):
        (x1, y1), (x2, y2) = c[i], c[i + 1]
        t = i / (len(c) - 1)
        wd = 14 + 20 * math.sin(math.pi * (0.15 + 0.8 * t))
        ln = math.hypot(x2 - x1, y2 - y1) or 1
        nx, ny = -(y2 - y1) / ln, (x2 - x1) / ln
        t2 = (i + 1) / (len(c) - 1)
        wd2 = 14 + 20 * math.sin(math.pi * (0.15 + 0.8 * t2))
        up1, up2 = (x1 - nx * wd, y1 - ny * wd), (x2 - nx * wd2, y2 - ny * wd2)
        dn1, dn2 = (x1 + nx * wd, y1 + ny * wd), (x2 + nx * wd2, y2 + ny * wd2)
        st = dict(stroke="#ffffff", stroke_width=0.6, stroke_opacity=0.5)
        a.poly([up1, up2, (x2, y2), (x1, y1)], fill=kit.shade("#efe9d8", r.uniform(-0.04, 0.1)), **st)
        a.poly([(x1, y1), (x2, y2), dn2, dn1], fill=kit.shade("#b9b09a", r.uniform(-0.18, 0.02)), **st)
    for x, y in ((120, 452), (508, 356)):   # the rests
        a.poly([(x - 34, y + 70), (x - 14, y - 10), (x + 16, y - 10), (x + 36, y + 70)], fill="#15101a", stroke="#3c3038", stroke_width=1.5)
        a.poly([(x - 14, y - 10), (x + 16, y - 10), (x + 6, y + 30)], fill="#2a2030")
    # the notes: six tuned, and the seventh
    for k in range(7):
        x, y = 150 + k * 50, 110 - 14 * math.sin(k / 6 * math.pi)
        col = kit.MOLTEN if k == 6 else "#f0c060"
        a.poly([(x, y - 16), (x + 11, y), (x, y + 16), (x - 11, y)], fill=kit.shade(col, 0.25), stroke=STARW, stroke_width=0.8)
        a.poly([(x, y - 16), (x + 11, y), (x, y)], fill=kit.shade(col, -0.2))
        if k == 6:
            a.circle(x, y, 34, fill=a.radial([(0, col, 0.55), (1, col, 0)]))
    # its beat line: slow wobble, not yet still
    a.poly([(150, 520), (450, 520), (466, 546), (450, 572), (150, 572), (134, 546)], fill="#1a1016", stroke=kit.MOLTEN, stroke_width=2)
    wl = [(156 + k * 6, 546 + 15 * math.sin(k * 0.3) * (0.5 + 0.5 * math.cos(k * 0.11))) for k in range(49)]
    a.path(kit.pd(wl, False), fill="none", stroke=kit.MOLTEN, stroke_width=2.5, stroke_linejoin="bevel")

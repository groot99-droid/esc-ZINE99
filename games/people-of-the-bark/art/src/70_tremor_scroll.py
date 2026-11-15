"""Tremor Scroll, on a smoked seismograph drum: the glyph set, the weather marks, the faceless row and
the Pulse map strip kept in the back of Old Resin's recipe book."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Glyph set, weather marks, faceless row, Pulse map strip"
TRACE = "#f0e8dc"
LABEL = "#d8c8a8"


def smoke(a, x=0, y=0, w=None, h=None, n=None):
    w = a.w if w is None else w
    h = a.h if h is None else h
    a.rect(x, y, w, h, fill=a.gradient([(0, "#0c0a08"), (0.2, "#221e1a"), (0.5, "#302b27"), (0.8, "#221e1a"), (1, "#0a0807")]))
    a.stipple(x, y, w, h, n=n or int(w * h / 900), r=(0.4, 1.3), fill="#6a6058", opacity=0.5)


def brass(a, x, y, w, h):
    a.rect(x, y, w, h, fill=a.gradient([(0, "#8a6a30"), (0.5, "#c9a24a"), (1, "#3a2a14")], x1=0, y1=0, x2=1, y2=0), stroke="#140d08",
           stroke_width=2)


def burst(a, x, y, w, amp, freq=0.9, col=TRACE, sw=1.6, r=None):
    pts = []
    n = int(w / 2)
    for i in range(n + 1):
        t = i / n
        env = math.sin(math.pi * t) ** 1.5
        pts.append((x - w / 2 + w * t, y + amp * env * math.sin(i * freq) + (r.uniform(-0.5, 0.5) if r else 0)))
    a.path("M" + " L".join(f"{f(px)},{f(py)}" for px, py in pts), fill="none", stroke=col, stroke_width=sw, stroke_linejoin="round")


def face_arrow(a, x, y, face, s=1.0, col=TRACE):
    ang = {"E": 0, "S": 90, "W": 180, "N": -90}[face]
    a.open("g", transform=f"translate({f(x)} {f(y)}) rotate({ang})")
    a.line(-12 * s, 0, 8 * s, 0, stroke=col, stroke_width=2.2 * s, stroke_linecap="round")
    a.poly([(14 * s, 0), (4 * s, -6 * s), (4 * s, 6 * s)], fill=col)
    a.close()


def weather(a, kind, x, y, s=1.0, col=TRACE):
    k = dict(stroke=col, stroke_width=1.6 * s, fill="none", stroke_linecap="round", stroke_linejoin="round")
    if kind == "sun":
        a.circle(x, y, 6 * s, **k)
        for i in range(8):
            t = i * math.pi / 4
            a.line(x + 9 * s * math.cos(t), y + 9 * s * math.sin(t), x + 13 * s * math.cos(t), y + 13 * s * math.sin(t), **k)
    elif kind == "frost":
        for i in range(3):
            t = i * math.pi / 3
            a.line(x - 12 * s * math.cos(t), y - 12 * s * math.sin(t), x + 12 * s * math.cos(t), y + 12 * s * math.sin(t), **k)
            for sg in (-1, 1):
                bx, by = x + sg * 8 * s * math.cos(t), y + sg * 8 * s * math.sin(t)
                a.line(bx, by, bx + sg * 4 * s * math.cos(t + 0.9), by + sg * 4 * s * math.sin(t + 0.9), **k)
                a.line(bx, by, bx + sg * 4 * s * math.cos(t - 0.9), by + sg * 4 * s * math.sin(t - 0.9), **k)
    elif kind == "rain":
        a.path(f"M{f(x - 12 * s)},{f(y - 4 * s)} q{f(12 * s)},{f(-12 * s)} {f(24 * s)},0", **k)
        for i in range(3):
            a.line(x - 7 * s + i * 7 * s, y, x - 10 * s + i * 7 * s, y + 11 * s, **k)
    else:
        a.path(f"M{f(x - 12 * s)},{f(y - 6 * s)} q{f(12 * s)},{f(-12 * s)} {f(24 * s)},0", **k)
        a.poly([(x + 1 * s, y - 4 * s), (x - 5 * s, y + 5 * s), (x + 1 * s, y + 5 * s), (x - 3 * s, y + 14 * s), (x + 7 * s, y + 1 * s), (x + 1 * s, y + 1 * s)],
               **dict(k, fill=col, stroke_width=0.8 * s))


@asset(G, "scroll-glyph-set", group="pieces", title="Tremor Scroll: the glyph set", w=1200, h=600, row=ROW)
def glyph_set(a: Art):
    """The Tremor Scroll's glyphs scratched white in smoked paper: four faces (east, south, west, north, each
    an arrow and a letter) by three strengths (one, two or three strokes of the needle), and beside them the two
    odd marks: none, and the faint ripple that comes on every face at once."""
    a.rect(0, 0, a.w, a.h, fill="#1a120c")
    brass(a, 0, 0, a.w, 26)
    brass(a, 0, a.h - 26, a.w, 26)
    smoke(a, 0, 26, a.w, a.h - 52)
    r = a.rng
    cw, ch = 210, 118
    x0, y0 = 150, 120
    faces = ["E", "S", "W", "N"]
    names = {"E": "EAST", "S": "SOUTH", "W": "WEST", "N": "NORTH"}
    for i, fc in enumerate(faces):
        x = x0 + i * cw + cw / 2
        a.text(x, y0 - 34, names[fc], size=18, family="monospace", fill=LABEL, text_anchor="middle", letter_spacing=4)
        for j in range(3):
            y = y0 + j * ch + ch / 2
            a.line(x - cw / 2 + 12, y, x + cw / 2 - 12, y + 3, stroke=TRACE, stroke_width=0.6, opacity=0.35)
            burst(a, x - 20, y, 110, 9 + j * 11, freq=0.9 + j * 0.25, r=r, sw=1.5 + j * 0.2)
            face_arrow(a, x + 64, y - 22, fc, 1.1)
            a.text(x + 64, y + 20, fc, size=17, family="monospace", fill=TRACE, text_anchor="middle", font_weight="bold")
            for k in range(j + 1):
                a.line(x - 86 + k * 8, y + 22, x - 84 + k * 8, y + 38, stroke=kit.GOLD, stroke_width=2.4, stroke_linecap="round")
    for j in range(3):
        a.text(x0 - 26, y0 + j * ch + ch / 2 + 7, str(j + 1), size=26, family="monospace", fill=LABEL, text_anchor="end", font_weight="bold")
    a.text(x0 - 26, y0 - 34, "STRENGTH", size=13, family="monospace", fill=LABEL, text_anchor="end", letter_spacing=2,
           transform=f"rotate(-90 {x0 - 60} {y0 + 150}) translate(-60 110)")
    a.grid(x0, y0, 4 * cw, 3 * ch, cw, stroke=TRACE, stroke_width=0.5, opacity=0.25)
    # the two odd marks
    ox = x0 + 4 * cw + 24
    a.rect(ox, y0, 170, 3 * ch, fill="none", stroke=TRACE, stroke_width=0.6, opacity=0.5)
    a.text(ox + 85, y0 - 34, "ALSO", size=18, family="monospace", fill=LABEL, text_anchor="middle", letter_spacing=4)
    cx, cy = ox + 85, y0 + ch * 0.6
    a.circle(cx, cy, 20, fill="none", stroke=kit.GOLD, stroke_width=3)
    a.line(cx - 20, cy + 20, cx + 20, cy - 20, stroke=kit.GOLD, stroke_width=3)
    a.text(cx, cy + 50, "NONE", size=15, family="monospace", fill=LABEL, text_anchor="middle", letter_spacing=3)
    cy = y0 + ch * 2.0
    pts = [(cx - 66 + i * 2.2, cy + 5 * math.sin(i * 0.5) * math.sin(math.pi * i / 60)) for i in range(61)]
    a.path("M" + " L".join(f"{f(px)},{f(py)}" for px, py in pts), fill="none", stroke=TRACE, stroke_width=1.5)
    for fc, (dx, dy) in zip(faces, ((34, -34), (0, 36), (-34, -34), (0, -42))):
        face_arrow(a, cx + dx, cy + dy, fc, 0.75)
    a.text(cx, cy + 78, "THE RIPPLE", size=15, family="monospace", fill=LABEL, text_anchor="middle", letter_spacing=2)
    a.text(cx, cy + 98, "every face", size=13, family="monospace", fill=LABEL, text_anchor="middle", opacity=0.8)
    a.text(a.w / 2, a.h - 44, "FACE BY THE ARROW AND THE LETTER · STRENGTH BY THE STROKES", size=14, family="monospace", fill=LABEL,
           text_anchor="middle", letter_spacing=2, opacity=0.8)


@asset(G, "scroll-weather-marks", group="pieces", title="Tremor Scroll: weather marks", w=800, h=260, row=ROW)
def weather_marks(a: Art):
    """The four weather marks that sit above each day on the scroll, scratched in smoked paper: sun, rain, storm
    and frost."""
    a.rect(0, 0, a.w, a.h, fill="#1a120c")
    brass(a, 0, 0, 22, a.h)
    brass(a, a.w - 22, 0, 22, a.h)
    smoke(a, 22, 0, a.w - 44, a.h)
    for i, kind in enumerate(("sun", "rain", "storm", "frost")):
        x = 118 + i * 188
        a.circle(x, 112, 62, fill="none", stroke=TRACE, stroke_width=0.8, opacity=0.4, stroke_dasharray="2 6")
        weather(a, kind, x, 112, 3.6)
        a.text(x, 222, kind.upper(), size=17, family="monospace", fill=LABEL, text_anchor="middle", letter_spacing=5)


@asset(G, "scroll-faceless-row", group="documents", title="Tremor Scroll: the faceless row", w=1600, h=420, row=ROW)
def faceless_row(a: Art):
    """The faceless row: a stretch of the scroll over seven days. Above, the squirrel's hours as the Scroll House
    records them, each burst with its face arrow. Below, the row Fenn kept at home in cold chalk grey: small ticks
    with no arrow at all, thicker on the warm days, and two places where a face was drawn and scraped off again."""
    a.rect(0, 0, a.w, a.h, fill="#1a120c")
    brass(a, 0, 0, a.w, 24)
    brass(a, 0, a.h - 24, a.w, 24)
    smoke(a, 0, 24, a.w, a.h - 48)
    r = a.rng
    x0, dw = 150, 200
    wx = ["sun", "sun", "rain", "sun", "frost", "sun", "sun"]
    for d in range(7):
        x = x0 + d * dw
        a.line(x, 60, x, 372, stroke=TRACE, stroke_width=0.5, opacity=0.25)
        weather(a, wx[d], x + dw / 2, 58, 1.1)
        a.text(x + 10, 88, f"{d + 8:02d}", size=13, family="monospace", fill=LABEL)
        for k, part in enumerate(("dawn", "noon", "dusk")):
            px = x + dw * (0.2 + 0.3 * k)
            if d == 0:
                a.text(px, 108, part.upper(), size=10, family="monospace", fill=LABEL, text_anchor="middle", opacity=0.8)
    a.line(x0 + 7 * dw, 60, x0 + 7 * dw, 372, stroke=TRACE, stroke_width=0.5, opacity=0.25)
    # the recorded row: caching pattern (dawn east 2, noon north 3, dusk west 1; rain days only noon)
    y = 160
    base = [(x0 + i * 4, y + r.uniform(-0.6, 0.6)) for i in range(351)]
    a.path("M" + " L".join(f"{f(px)},{f(py)}" for px, py in base), fill="none", stroke=TRACE, stroke_width=0.9, opacity=0.55)
    for d in range(7):
        x = x0 + d * dw
        marks = [("noon", "N", 3)] if wx[d] == "rain" else [("dawn", "E", 2), ("noon", "N", 3), ("dusk", "W", 1)]
        if wx[d] == "frost":
            marks = [("noon", "N", 3)]
        if d == 3:
            marks = marks[:2]
        for part, fc, st in marks:
            px = x + dw * (0.2 + 0.3 * ("dawn", "noon", "dusk").index(part))
            burst(a, px, y, 40, 5 + st * 6, freq=1.1, r=r)
            face_arrow(a, px, y - 34, fc, 0.7)
    a.text(x0 - 16, y + 5, "RECORDED", size=12, family="monospace", fill=LABEL, text_anchor="end", letter_spacing=2)
    # the faceless row
    y = 300
    a.rect(x0, y - 44, 7 * dw, 88, fill=kit.CHALK, opacity=0.06)
    warm = [0.9, 1.0, 0.35, 0.8, 0.15, 0.7, 1.0]
    d_path = ""
    for d in range(7):
        n = int(4 + 22 * warm[d])
        for _ in range(n):
            px = x0 + d * dw + r.uniform(8, dw - 8)
            py = y + r.uniform(-26, 26)
            d_path += f"M{f(px)},{f(py)} l5,-3 l-1,5 l6,-2"
    a.path(d_path, fill="none", stroke=kit.CHALK, stroke_width=1.5, stroke_linecap="round", stroke_linejoin="round")
    for px in (x0 + 1.5 * dw, x0 + 5.3 * dw):
        a.ellipse(px, y - 34, 26, 11, fill="#3a3531", opacity=0.9)
        a.hatch(px - 26, y - 45, 52, 22, angle=20, spacing=4, stroke="#6a6058", stroke_width=1, jitter=1.2,
                clip=a.clip(f'<ellipse cx="{f(px)}" cy="{f(y - 34)}" rx="26" ry="11"/>'))
    a.text(x0 - 16, y + 5, "NO FACE", size=12, family="monospace", fill=kit.CHALK, text_anchor="end", letter_spacing=2)
    a.rect(x0, 356, 7 * dw, 34, fill="#e9dcc0", stroke="#140d08", stroke_width=1.5)
    a.text(x0 + 14, 379, "It has no face. I gave it one twice, to make it fit. I scraped them off.", size=17, family="monospace",
           fill="#3a281c")


@asset(G, "scroll-pulse-map", group="maps", title="Tremor Scroll: the Pulse map strip", w=420, h=1100, row=ROW)
def pulse_map(a: Art):
    """The Pulse map: a margin strip on the back pages of Old Resin's recipe book, the bark's plates drawn as a
    grid from the Crown down to the roots with the three listening posts beside it. Each faceless mark placed has
    shaded one plate in chalk grey; the shading gathers under Highridge, and one plate is ringed in gold: where
    the second tap will land."""
    a.paper("#ead9b4", grain=0.3, fibre=0.6)
    a.vignette(0.4, "#4a2a10")
    kit.stain(a, 330, 960, 70)
    kit.stain(a, 90, 150, 46, opacity=0.12)
    r = a.rng
    INK = kit.INK
    # bleed-through of a recipe from the other side of the leaf
    a.open("g", opacity=0.12, transform="translate(420 0) scale(-1 1)")
    a.circle(210, 330, 120, fill="none", stroke=INK, stroke_width=3)
    a.poly(a.ngon(210, 330, 120, 3, -90), fill="none", stroke=INK, stroke_width=2)
    kit.alch_symbol(a, "resin", 210, 210, 1.2, w=3)
    kit.alch_symbol(a, "ash", 106, 390, 1.2, w=3)
    a.close()
    x0, y0, cols, rows, cw, ch = 110, 96, 4, 13, 62, 70
    # plate corners, jittered so the grid reads as bark plates
    pts = [[(x0 + i * cw + (r.uniform(-9, 9) if 0 < i < cols else 0), y0 + j * ch + r.uniform(-10, 10)) for i in range(cols + 1)]
           for j in range(rows + 1)]
    level = {}
    for j in range(rows):
        for i in range(cols):
            dist = abs(j - 6.2) + abs(i - 1.6) * 0.8
            v = max(0, 3 - int(dist * 0.9 + r.uniform(-0.6, 0.9)))
            if j >= 10 and r.random() < 0.6:
                v = max(v, r.choice([1, 2]))
            level[(i, j)] = v
    for j in range(rows):
        for i in range(cols):
            quad = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]]
            v = level[(i, j)]
            a.poly(quad, fill=kit.CHALK if v else "none", fill_opacity=(0, 0.3, 0.6, 0.95)[v], stroke=INK, stroke_width=1.5,
                   stroke_linejoin="round")
            if v:
                cp = a.clip('<polygon points="' + " ".join(f"{f(px)},{f(py)}" for px, py in quad) + '"/>')
                bx, by = min(p[0] for p in quad), min(p[1] for p in quad)
                a.hatch(bx, by, cw + 20, ch + 20, angle=35, spacing=(0, 11, 7, 4.5)[v], stroke="#5d676a", stroke_width=1, clip=cp)
    gi, gj = 2, 6
    gx = sum(p[0] for p in (pts[gj][gi], pts[gj][gi + 1], pts[gj + 1][gi + 1], pts[gj + 1][gi])) / 4
    gy = sum(p[1] for p in (pts[gj][gi], pts[gj][gi + 1], pts[gj + 1][gi + 1], pts[gj + 1][gi])) / 4
    a.circle(gx, gy, 40, fill="none", stroke=kit.GOLD, stroke_width=4)
    a.circle(gx, gy, 40, fill="none", stroke=INK, stroke_width=1, stroke_dasharray="3 4")
    a.text(gx, gy + 7, "II", size=22, family="serif", fill=INK, text_anchor="middle", font_weight="bold")
    # listening posts
    for name, jj, word in (("KNOTHOLM", 2.5, "nothing"), ("HIGHRIDGE", 6.5, "loud"), ("LOWRIDGE", 10.5, "faint")):
        y = y0 + jj * ch
        a.line(x0 + cols * cw + 6, y, x0 + cols * cw + 26, y, stroke=kit.RUBRIC, stroke_width=1.5)
        a.text(x0 + cols * cw + 44, y, name, size=13, family="serif", fill=INK, letter_spacing=2,
               transform=f"rotate(90 {x0 + cols * cw + 44} {f(y)})", text_anchor="middle")
        a.text(x0 + cols * cw + 26, y, word, size=14, family="serif", fill=kit.RUBRIC, font_style="italic",
               transform=f"rotate(90 {x0 + cols * cw + 26} {f(y)})", text_anchor="middle")
    a.text(60, y0 + 30, "CROWN", size=12, family="serif", fill=INK, letter_spacing=4, text_anchor="middle", transform=f"rotate(-90 60 {y0 + 30})")
    a.text(60, y0 + rows * ch - 30, "UNDER", size=12, family="serif", fill=INK, letter_spacing=4, text_anchor="middle",
           transform=f"rotate(-90 60 {y0 + rows * ch - 30})")
    kit.arrow(a, 60, y0 + 90, 60, y0 + rows * ch - 90, col=INK, w=1.2, head=9)
    a.text(210, 56, "THE PULSE MAP", size=22, family="serif", fill=INK, text_anchor="middle", letter_spacing=4, font_weight="bold")
    a.line(96, 68, 324, 68, stroke=INK, stroke_width=1)
    for v in (1, 2, 3):
        a.rect(110 + (v - 1) * 74, 1036, 24, 24, fill=kit.CHALK, fill_opacity=(0, 0.3, 0.6, 0.95)[v], stroke=INK, stroke_width=1.2)
        a.path("".join(f"M{118 + (v - 1) * 74 + k * 18 - 6},{1072} l5,-3 l-1,5 l6,-2" for k in range(v)), fill="none", stroke="#5d676a",
               stroke_width=1.6, stroke_linecap="round")
    a.rect(14, 14, 392, 1072, fill="none", stroke=INK, stroke_width=1.4)

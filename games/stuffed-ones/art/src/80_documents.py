"""Paper and tissue: the five stitch charts, the five body patterns and Ruth's four pattern sheets."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
gl = sibling(__file__, "_glyphs")
G = kit.G
C, P, R = kit.C, kit.P, kit.R
INK = "#3a3028"

# ---- stitch charts ----------------------------------------------------------------------------------
ROW_C = "Stitch charts and fabric grounds"
N, CS, GX, GY = 40, 17, 110, 190


def sym_d(sym, x, y):
    if sym == "x":
        return f"M{f(x - 4)},{f(y - 4)}l8,8M{f(x + 4)},{f(y - 4)}l-8,8"
    if sym == "/":
        return f"M{f(x - 4)},{f(y + 4)}l8,-8"
    if sym == "+":
        return f"M{f(x - 4.5)},{f(y)}h9M{f(x)},{f(y - 4.5)}v9"
    if sym == "o":
        return f"M{f(x - 3.4)},{f(y)}a3.4,3.4 0 1,0 6.8,0a3.4,3.4 0 1,0 -6.8,0"
    if sym == "v":
        return f"M{f(x - 4)},{f(y - 3)}l4,7l4,-7"
    if sym == "-":
        return f"M{f(x - 4.5)},{f(y)}h9"
    return f"M{f(x)},{f(y - 4.5)}l4.5,4.5l-4.5,4.5l-4.5,-4.5z"  # lozenge


def chart(a, number, title, sub, keys, cellfn, stitches, notes, done=0, thr=kit.RED):
    """A cross-stitch pattern chart: counted grid, symbol key, numbered entry points, counts in the margin."""
    a.paper("#f4eedf", grain=0.14, fibre=1.5)
    a.rect(24, 24, 852, 1052, fill="none", stroke=INK, stroke_width=1.4)
    a.text(GX, 78, f"STITCHWORK No. {number}", size=18, family="monospace", fill=INK, letter_spacing=3)
    a.text(GX, 122, title, size=40, family="serif", fill=INK, font_weight="bold")
    a.text(GX, 156, sub, size=19, family="serif", fill=INK, font_style="italic")
    grid = {}
    for j in range(N):
        for i in range(N):
            k = cellfn(i, j)
            if k:
                grid.setdefault(k, []).append((i, j))
    for k, cells in grid.items():
        sym, col, _ = keys[k]
        a.path("".join(f"M{GX + i * CS},{GY + j * CS}h{CS}v{CS}h-{CS}z" for i, j in cells), fill=col, opacity=0.6)
        a.path("".join(sym_d(sym, GX + i * CS + CS / 2, GY + j * CS + CS / 2) for i, j in cells), fill="none", stroke=INK,
               stroke_width=1.1, opacity=0.85)
    a.grid(GX, GY, N * CS, N * CS, CS, stroke=INK, stroke_width=0.35, opacity=0.55)
    a.grid(GX, GY, N * CS, N * CS, CS * 10, stroke=INK, stroke_width=1.3)
    for k in range(0, N + 1, 10):
        a.text(GX + k * CS, GY - 8, str(k), size=13, family="monospace", fill=INK, text_anchor="middle")
        a.text(GX - 10, GY + k * CS + 4, str(k), size=13, family="monospace", fill=INK, text_anchor="end")
    a.path(P((GX + N * CS / 2, GY - 4), (GX + N * CS / 2 - 6, GY - 16), (GX + N * CS / 2 + 6, GY - 16)), fill=INK)
    a.path(P((GX - 3, GY + N * CS / 2), (GX - 15, GY + N * CS / 2 - 6), (GX - 15, GY + N * CS / 2 + 6)), fill=INK)
    # the stitches: made ones in thread, the rest as a dotted guide, each with its numbered entry point
    for n, ((i1, j1), (i2, j2)) in enumerate(stitches):
        x1, y1, x2, y2 = GX + i1 * CS, GY + j1 * CS, GX + i2 * CS, GY + j2 * CS
        if n < done:
            a.line(x1 + 1, y1 + 2, x2 + 1, y2 + 2, stroke=INK, stroke_width=6.5, stroke_linecap="round", opacity=0.35)
            a.line(x1, y1, x2, y2, stroke=kit.BONE, stroke_width=6.5, stroke_linecap="round")
            a.line(x1, y1, x2, y2, stroke=kit.mix(kit.DUST, kit.CEDAR, 0.3), stroke_width=1, stroke_dasharray="2 3")
        else:
            a.line(x1, y1, x2, y2, stroke=thr, stroke_width=2, stroke_dasharray="4 4")
        a.circle(x1, y1, 9.5, fill="#f4eedf" if n >= done else thr, stroke=thr, stroke_width=1.8)
        a.text(x1, y1 + 4.5, str(n + 1), size=12, family="monospace", fill=thr if n >= done else "#f4eedf", text_anchor="middle",
               font_weight="bold")
        a.circle(x2, y2, 3.4, fill=thr)
    # key
    ky = GY + N * CS + 48
    a.text(GX, ky - 12, "KEY", size=15, family="monospace", fill=INK, letter_spacing=4)
    for n, (k, (sym, col, name)) in enumerate(keys.items()):
        x, y = GX + (n % 2) * 250, ky + (n // 2) * 30
        a.rect(x, y, 20, 20, fill=col, opacity=0.6)
        a.rect(x, y, 20, 20, fill="none", stroke=INK, stroke_width=0.8)
        a.path(sym_d(sym, x + 10, y + 10), fill="none", stroke=INK, stroke_width=1.2)
        a.text(x + 30, y + 16, f"{name}  ({len(grid.get(k, []))})", size=16, family="serif", fill=INK)
    # margin: counts and how
    mx = GX + 520
    a.path(f"M{mx - 16},{ky - 24}v124", stroke=INK, stroke_width=0.8, stroke_dasharray="4 3")
    for n, line in enumerate(notes):
        a.text(mx, ky - 6 + n * 24, line, size=16, family="monospace", fill=INK if n else thr, font_weight="bold" if n == 0 else None)


FELT_KEYS = {"a": ("x", kit.RUST, "rust felt"), "b": ("/", kit.light(kit.DUST, 0.3), "lining"), "t": ("l", kit.CEDAR, "torn edge")}


@asset(G, "chart-1-running", group="documents", title="Stitch chart 1: running stitch", w=900, h=1100, row=ROW_C)
def chart_running(a: Art):
    """A cross-stitch pattern chart for the first mend: Marcus's pack strap as a band of moss webbing on
    the counted grid, torn across, with eight running stitches numbered over the tear, three already made."""
    tear = [20 + (1 if (j // 2) % 2 else -1) for j in range(N)]

    def cell(i, j):
        if not 12 <= j <= 27:
            return None
        if abs(i - tear[j]) <= 1:
            return "t" if abs(i - tear[j]) == 1 else None
        if j in (12, 27):
            return "e"
        return "w" if (i + j) % 4 < 2 else "h"
    keys = {"w": ("x", kit.MOSS, "moss webbing"), "h": ("/", kit.mix(kit.MOSS, kit.DUST, 0.5), "herringbone"),
            "e": ("-", kit.CEDAR, "bound edge"), "t": ("l", kit.RUST, "torn edge")}
    st = [((17 if n % 2 == 0 else 24, 13.5 + n * 1.75), (24 if n % 2 == 0 else 17, 13.5 + n * 1.75 + 0.6)) for n in range(8)]
    chart(a, 1, "Running stitch", "on webbing: Marcus's strap", keys, cell, st,
          ["3 of 8 stitches", "in, out, pull.", "no pressure:", "the friends' game plays"], done=3)


@asset(G, "chart-2-ladder", group="documents", title="Stitch chart 2: ladder stitch", w=900, h=1100, row=ROW_C)
def chart_ladder(a: Art):
    """A pattern chart for your own seams: two edges of cream felt with the seam open between them and six
    ladder-stitch rungs numbered across it, the needle's drift on each pulse noted in the margin."""
    mid = [20 + 1.6 * math.sin(j / 5.0) for j in range(N)]

    def cell(i, j):
        d = i + 0.5 - mid[j]
        if abs(d) < 1.6:
            return None
        if abs(d) < 2.6:
            return "f"
        if (i * 3 + j * 5) % 17 == 0:
            return "p"
        return "c" if d < 0 else "d"
    keys = {"c": ("/", kit.light(kit.DUST, 0.4), "cream felt, left"), "d": ("x", kit.light(kit.DUST, 0.1), "cream felt, right"),
            "f": ("o", kit.SKY, "fold line"), "p": ("l", kit.RUST, "patch")}
    st = []
    for n in range(6):
        j = 6 + n * 5.4
        m = 20 + 1.6 * math.sin(j / 5.0)
        st.append(((m - 2.4, j) if n % 2 == 0 else (m + 2.4, j), (m + 2.4, j + 1.4) if n % 2 == 0 else (m - 2.4, j + 1.4)))
    chart(a, 2, "Ladder stitch", "on your own six seams: seam 2 of 6, left arm", keys, cell, st,
          ["2 of 6 stitches", "36 in all.", "the needle drifts 4 px", "with each pulse"], done=2, thr=kit.RUST)


@asset(G, "chart-3-whip", group="documents", title="Stitch chart 3: whip stitch", w=900, h=1100, row=ROW_C)
def chart_whip(a: Art):
    """A pattern chart for mending a torn seam at dawn: a ragged diagonal tear through sky-blue felt, ten whip
    stitches numbered over it, and sixty seconds in the margin."""
    def cell(i, j):
        d = (i - j) + 2.4 * math.sin(i / 3.1)
        if abs(d) < 1.5:
            return None
        if abs(d) < 2.6:
            return "t"
        if i + j > 58:
            return "l"
        return "s" if (i // 2 + j // 2) % 3 else "k"
    keys = {"s": ("x", kit.SKY, "sky felt"), "k": ("+", kit.mix(kit.SKY, kit.NIGHT, 0.3), "sky felt, shade"),
            "t": ("l", kit.RUST, "torn edge"), "l": ("-", kit.warmth(0.35), "dawn light")}
    st = []
    for n in range(10):
        c = 5 + n * 3.3
        off = -2.4 * math.sin(c / 3.1) / 2
        st.append(((c + 2.6 + off, c - 2.2 - off), (c - 1.4 + off, c + 2.8 - off)))
    chart(a, 3, "Whip stitch", "on a torn seam: a friend's, or yours", keys, cell, st,
          ["4 of 10 stitches", "60 s", "before Mabel arrives.", "dawn light grows"], done=4, thr=kit.NIGHT)


@asset(G, "chart-4-backstitch", group="documents", title="Stitch chart 4: backstitch", w=900, h=1100, row=ROW_C)
def chart_back(a: Art):
    """A pattern chart for the Keeper's stitch: twelve backstitches in a ring around the edge of the circle of
    torn fabric skins. Only the edge is charted; the middle of the grid is left blank."""
    def cell(i, j):
        r = math.hypot(i + 0.5 - 20, j + 0.5 - 20)
        ang = math.atan2(j - 19.5, i - 19.5)
        if r < 11.2:
            return None
        if r < 13 + 1.2 * math.sin(ang * 7):
            return "s"
        if r < 14.6 + 1.2 * math.sin(ang * 7):
            return "t"
        return "f" if (i + 2 * j) % 5 else "g"
    keys = {"f": ("/", kit.mix(kit.CEDAR, kit.DUST, 0.4), "floor"), "g": ("x", kit.CEDAR, "floor, shade"),
            "t": ("l", kit.RUST, "torn edge"), "s": ("o", kit.warmth(0.7), "skins, edge only")}
    st = []
    for n in range(12):
        t0 = -math.pi / 2 + n * 2 * math.pi / 12
        t1 = t0 - 2 * math.pi / 12 * 0.85
        st.append(((20 + 14.6 * math.cos(t0), 20 + 14.6 * math.sin(t0)), (20 + 14.6 * math.cos(t1), 20 + 14.6 * math.sin(t1))))
    chart(a, 4, "Backstitch", "around the circle of skins", keys, cell, st,
          ["5 of 12, in a ring", "90 s", "the room's pulse", "speeds up"], done=5, thr=kit.RED)
    a.text(GX + 20 * CS, GY + 20 * CS + 6, "not charted", size=17, family="serif", fill=kit.mix(INK, "#f4eedf", 0.5),
           text_anchor="middle", font_style="italic")


@asset(G, "chart-5-jamies-seam", group="documents", title="Stitch chart 5: Jamie's Seam", w=900, h=1100, row=ROW_C)
def chart_jamie(a: Art):
    """A pattern chart for Jamie's Seam: the split in a rust felt side drawn only as a closed line of torn edge,
    ten whip stitches numbered along it, and a guest's eye strip across the top, one eye per stitch, open or shut."""
    seam = [20 + 5 * math.sin((j - 4) / 10.0) for j in range(N)]

    def cell(i, j):
        if j < 4:
            return None
        d = i + 0.5 - seam[j]
        if abs(d) < 1.0 and 6 < j < 38:
            return "t"
        if (i - 6) ** 2 + (j - 30) ** 2 < 20:
            return "p"
        return "a" if (i + j) % 3 else "b"
    keys = {"a": ("x", kit.RUST, "rust felt"), "b": ("/", kit.mix(kit.RUST, kit.DUST, 0.4), "rust felt, worn"),
            "t": ("l", kit.CEDAR_D, "the seam (closed line)"), "p": ("+", kit.SKY, "patch")}
    st = []
    for n in range(10):
        j = 8 + n * 3.1
        m = 20 + 5 * math.sin((j - 4) / 10.0)
        st.append(((m - 2.6, j), (m + 2.6, j + 1.5)))
    chart(a, 5, "Jamie's Seam", "whip stitch: one stitch per glance away", keys, cell, st,
          ["3 of 10 stitches", "the needle travels", "only while the eye", "is shut"], done=3, thr=kit.RED)
    # the eye strip, across the top rows of the grid
    a.rect(GX, GY, N * CS, 4 * CS, fill="#f4eedf", stroke=INK, stroke_width=1.3)
    shut = [1, 1, 1, 0, 1, 0, 0, 1, 0, 1]
    for n in range(10):
        x, y = GX + 34 + n * 68, GY + 2 * CS
        if shut[n]:
            a.path(f"M{x - 22},{y}q22,14 44,0", fill="none", stroke=INK, stroke_width=2.2, stroke_dasharray="5 3")
            a.path(f"M{x - 12},{y + 7}v6M{x},{y + 9}v6M{x + 12},{y + 7}v6", stroke=INK, stroke_width=1.4)
        else:
            a.path(f"M{x - 22},{y}q22,-18 44,0q-22,18 -44,0z", fill=kit.BONE, stroke=INK, stroke_width=2)
            a.circle(x, y, 7, fill=kit.NIGHT)
            a.circle(x - 2, y - 2, 2, fill=kit.BONE)
        a.text(x, y - 16, str(n + 1), size=12, family="monospace", fill=INK, text_anchor="middle")


# ---- tissue patterns --------------------------------------------------------------------------------
ROW_P = "Body patterns and Ruth's patterns"


def table(a):
    a.paper(kit.mix(kit.CEDAR, kit.DUST, 0.12), grain=0.3, fibre=0.5)
    a.grid(0, 0, a.w, a.h, 50, stroke=kit.BONE, stroke_width=0.6, opacity=0.2)
    kit.lamp(a, 180, 120, 700, kit.AMBER, 0.22)


def crinkle(a):
    fid = a.uid("crk")
    a.defn(f'<filter id="{fid}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="turbulence" '
           f'baseFrequency="0.011 0.03" numOctaves="3" seed="{a.seed % 89}"/>'
           f'<feColorMatrix values="0 0 0 0 0.36  0 0 0 0 0.26  0 0 0 0 0.14  0 0 0 0.5 -0.08"/>'
           f'<feComposite in2="SourceGraphic" operator="in" result="c"/><feMerge><feMergeNode in="SourceGraphic"/>'
           f'<feMergeNode in="c"/></feMerge></filter>')
    return f"url(#{fid})"


def sheet(a, pts, color=kit.TISSUE, op=0.9, flt=None):
    d = a.wobble_d(pts, 2.2, 34, closed=True)
    a.path(d, fill="#1a0f08", opacity=0.25, transform="translate(6 9)", filter=a.blur(6))
    a.path(d, fill=color, opacity=op, filter=flt)


def offset(pts, d):
    cx = sum(x for x, _ in pts) / len(pts)
    cy = sum(y for _, y in pts) / len(pts)
    out = []
    for x, y in pts:
        L = math.hypot(x - cx, y - cy) or 1
        out.append((x - (x - cx) / L * d, y - (y - cy) / L * d))
    return out


def piece(a, cx, cy, shape, label, sub="", slots=0, rot=0, s=1.0, ink=INK, warm=(), arrow=True, lw=2.4, dash="13 6", inner=True):
    """A pattern piece: dashed cut line, stitching line, notches, grain arrow, label and slot hollows."""
    pts = [(cx + x * s, cy + y * s) for x, y in shape]
    a.open("g", transform=f"rotate({f(rot)} {f(cx)} {f(cy)})")
    a.path(a.smooth_d(pts, closed=True), fill="none", stroke=ink, stroke_width=lw, stroke_dasharray=dash)
    if inner:
        a.path(a.smooth_d(offset(pts, 13 * s), closed=True), fill="none", stroke=ink, stroke_width=0.9, stroke_dasharray="3 4")
    for k in range(0, len(pts), 2):
        (x1, y1), (x2, y2) = pts[k], pts[(k + 1) % len(pts)]
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        L = math.hypot(x2 - x1, y2 - y1) or 1
        ux, uy = (x2 - x1) / L, (y2 - y1) / L
        a.path(P((mx - ux * 6, my - uy * 6), (mx + ux * 6, my + uy * 6), (mx + uy * 10, my - ux * 10)), fill=ink)
    h = (max(y for _, y in shape) - min(y for _, y in shape)) * s
    w = (max(x for x, _ in shape) - min(x for x, _ in shape)) * s
    if arrow:
        gx = cx - w * 0.3
        a.line(gx, cy - h * 0.26, gx, cy + h * 0.26, stroke=ink, stroke_width=1.4)
        a.path(P((gx, cy - h * 0.26 - 9), (gx - 5, cy - h * 0.26 + 3), (gx + 5, cy - h * 0.26 + 3))
               + P((gx, cy + h * 0.26 + 9), (gx - 5, cy + h * 0.26 - 3), (gx + 5, cy + h * 0.26 - 3)), fill=ink)
    if label:
        a.text(cx - w * 0.16, cy - h * 0.24, label, size=14, family="sans-serif", fill=ink, font_weight="bold", letter_spacing=1.5)
        if sub:
            a.text(cx - w * 0.16, cy - h * 0.24 + 17, sub, size=11, family="sans-serif", fill=ink, letter_spacing=1)
    for k in range(slots):
        sx = cx + (k - (slots - 1) / 2) * 46 * min(1, w / 170) if w > h else cx + w * 0.12
        sy = cy + h * 0.14 if w > h else cy - h * 0.12 + k * 50
        if k in warm:
            a.circle(sx, sy, 30, fill=a.radial([(0, kit.RED, 0.8), (0.5, kit.AMBER, 0.5), (1, kit.AMBER, 0)]))
        a.circle(sx, sy, 18, fill="none", stroke=ink, stroke_width=1.3, stroke_dasharray="2 3")
        a.path(f"M{f(sx - 4)},{f(sy)}h8M{f(sx)},{f(sy - 4)}v8", stroke=ink, stroke_width=0.9)
    a.close()


def pin(a, x, y, ang=30, col=kit.RUST):
    a.open("g", transform=f"rotate({ang} {x} {y})")
    a.line(x, y, x + 46, y, stroke="#1a0f08", stroke_width=1.6, opacity=0.3, transform="translate(2 3)")
    a.line(x, y, x + 46, y, stroke="#cfd2d4", stroke_width=1.6)
    a.circle(x, y, 5, fill=col, stroke=kit.dark(col, 0.4), stroke_width=1)
    a.circle(x - 1.5, y - 1.5, 1.4, fill=kit.BONE, opacity=0.8)
    a.close()


def pencil_glyph(a, x, y, u, top, bottom, col):
    d = []
    for (ax, ay), (bx, by) in gl.segments(top, bottom):
        d.append(f"M{f(x + ax * u)},{f(y + ay * u)}L{f(x + bx * u)},{f(y + by * u)}")
    a.path("".join(d), fill="none", stroke=col, stroke_width=1.5, stroke_linecap="round", opacity=0.85, filter=a.roughen(1.2, 0.3))


ARM = [(-34, -128), (34, -128), (48, 0), (44, 112), (0, 138), (-44, 112), (-48, 0)]
LEG_L = [(-46, -116), (46, -116), (54, 34), (78, 96), (36, 124), (-52, 124), (-52, 34)]
LEG_R = [(-x, y) for x, y in reversed(LEG_L)]
CHEST = [(-104, -108), (104, -108), (122, 0), (100, 124), (0, 142), (-100, 124), (-122, 0)]
HEADS = {
    "cat": [(-98, 0), (-92, -96), (-44, -62), (0, -70), (44, -62), (92, -96), (98, 0), (70, 66), (0, 86), (-70, 66)],
    "bear": [(-96, 6), (-104, -60), (-70, -92), (-40, -64), (0, -74), (40, -64), (70, -92), (104, -60), (96, 6), (66, 68),
             (0, 86), (-66, 68)],
    "rabbit": [(-80, 20), (-74, -40), (-60, -150), (-28, -150), (-18, -52), (18, -52), (28, -150), (60, -150), (74, -40),
               (80, 20), (56, 72), (0, 88), (-56, 72)],
    "dog": [(-84, 0), (-78, -64), (-30, -84), (30, -84), (78, -64), (84, 0), (60, 70), (0, 92), (-60, 70)],
}
EAR = [(-26, -62), (26, -62), (36, 10), (20, 64), (-20, 64), (-36, 10)]
TAILS = {"cat": [(-14, -84), (14, -84), (20, 0), (16, 76), (-16, 76), (-20, 0)], "dog": [(-12, -50), (12, -50), (18, 20), (0, 52), (-18, 20)],
         "bear": [(-24, -22), (24, -22), (30, 10), (0, 30), (-30, 10)], "rabbit": [(-24, -22), (24, -22), (30, 10), (0, 30), (-30, 10)]}

BODIES = [  # id, title, kind, pencilled name, scale, warm slots (piece index, slot), doc
    ("narrator", "the narrator, a cat", "cat", "", 1.0, {(0, 1), (2, 0), (5, 1)},
     "The pattern of you: six tissue pieces for a cat, pinned, the name line left blank, three hollows glowing warm "
     "where no memory is packed, and two of Mabel's glyphs pencilled in the margin."),
    ("jamie", "Jamie, a bear", "bear", "Jamie", 0.96, {(1, 0)},
     "The tissue pattern for Jamie's bear body: six pieces and a small round tail, his name in pencil."),
    ("lila", "Lila, a rabbit", "rabbit", "Lila", 0.92, {(0, 0), (4, 1)},
     "The tissue pattern for Lila's rabbit body: the head piece carries its two long ears."),
    ("marcus", "Marcus, a dog", "dog", "Marcus", 0.96, {(3, 1)},
     "The tissue pattern for Marcus's dog body: six pieces, with two separate ear pieces and a tail."),
    ("dani", "Dani, a large bear", "bear", "Dani", 1.12, {(1, 2), (2, 1)},
     "The tissue pattern for Dani's bear body, cut larger than Jamie's so that the pieces crowd the sheet."),
]


def _body(k, row):
    bid, title, kind, name, s, warm, doc = row

    @asset(G, f"pattern-{bid}", group="documents", title=f"Body pattern: {title}", w=800, h=1100, row=ROW_P)
    def draw(a: Art):
        table(a)
        fl = crinkle(a)
        a.open("g", transform=f"rotate({f(a.rng.uniform(-2.5, 2.5))} 400 550)")
        sheet(a, [(34, 44), (770, 30), (760, 1068), (44, 1058)], flt=fl)
        a.path("M40,372L764,360M40,716L762,708M400,36V1062", stroke=kit.mix(kit.TISSUE, kit.CEDAR, 0.25), stroke_width=1.2, opacity=0.7)
        a.text(70, 96, f"PATTERN No. {k + 2}", size=18, family="sans-serif", fill=INK, font_weight="bold", letter_spacing=3)
        a.text(70, 120, "ONE BODY · SIX SEAMS", size=13, family="sans-serif", fill=INK, letter_spacing=3)
        a.path("M560,112h180", stroke=INK, stroke_width=1)
        pc = kit.mix(INK, kit.TISSUE, 0.35)
        if name:
            a.text(650, 104, name, size=34, family="cursive", fill=pc, text_anchor="middle", transform="rotate(-4 650 104)")
        W = lambda i: {sl for (pi, sl) in warm if pi == i}
        hy = 296 if kind != "rabbit" else 330
        piece(a, 400, hy, HEADS[kind], "HEAD", "CUT 2 · SEAM 1", 3, rot=0, s=s, warm=W(0))
        piece(a, 400, 640, CHEST, "CHEST", "CUT 2 · SEAM 2", 3, s=s, warm=W(1))
        piece(a, 128, 560, ARM, "L. ARM", "SEAM 3", 2, rot=6, s=s, warm=W(2))
        piece(a, 672, 560, ARM, "R. ARM", "SEAM 4", 2, rot=-6, s=s, warm=W(3))
        piece(a, 250, 916, LEG_L, "L. LEG", "SEAM 5", 2, rot=-4, s=s * 0.94, warm=W(4))
        piece(a, 552, 916, LEG_R, "R. LEG", "SEAM 6", 2, rot=4, s=s * 0.94, warm=W(5))
        if kind == "dog":
            piece(a, 120, 240, EAR, "EAR", "CUT 4", 0, rot=-14, s=0.9, arrow=False)
            piece(a, 684, 240, EAR, "EAR", "", 0, rot=14, s=0.9, arrow=False)
        piece(a, 706 if kind != "dog" else 400, 880 if kind != "dog" else 866, TAILS[kind], "TAIL" if kind in ("cat",) else "", "", 0,
              rot=8, s=0.9, arrow=False)
        for (x, y, ang) in ((330, 214, 20), (470, 560, -40), (120, 470, 80), (668, 660, 110), (240, 840, 10), (560, 1000, -20)):
            pin(a, x + a.rng.uniform(-8, 8), y + a.rng.uniform(-8, 8), ang + a.rng.uniform(-20, 20), [kit.RUST, kit.SKY, kit.MOSS][k % 3])
        if not name:  # Mabel's notes on your own pattern, in the book's glyphs
            pencil_glyph(a, 640, 150, 9, "person", "fabric", pc)
            pencil_glyph(a, 704, 150, 9, "hand", "ring", pc)
        a.close()
        kit.shade(a, 0.4)
    draw.__doc__ = doc


for _k, _r in enumerate(BODIES):
    _body(_k, _r)

DRESS = {  # Ruth's pieces: drawn as plain outlines, the same six seams
    "A": CHEST, "B": ARM, "C": LEG_L,
}
RUTH = [
    ("1-seven", "the first, at seven", [0.5], "Seven.",
     "The oldest tissue from the linen cupboard: small pattern pieces pencilled RUTH and the number 7, yellowed and "
     "soft at the folds."),
    ("2-larger", "cut larger", [0.5, 0.72], "cut larger",
     "A later sheet: the same pieces cut larger, in fresher tissue, with the small first pattern showing through from beneath."),
    ("3-and-larger", "and larger", [0.5, 0.72, 0.95], "and larger",
     "The same pieces a third time, grown again, the two earlier sizes ghosted beneath; someone had let her grow up on paper."),
    ("4-recut", "the newest, pinned to be cut", [0.5, 0.72, 0.95, 1.12], "",
     "The newest sheet, pinned and ready, with embroidery scissors lying on it: every earlier size nested inside the "
     "new cut line like growth rings."),
]


def _ruth(k, row):
    rid, title, sizes, note, doc = row

    @asset(G, f"ruth-pattern-{rid}", group="documents", title=f"Ruth's pattern: {title}", w=800, h=1100, row=ROW_P)
    def draw(a: Art):
        table(a)
        fl = crinkle(a)
        age = kit.mix(kit.TISSUE, kit.AMBER, 0.22 - 0.05 * k)
        a.open("g", transform=f"rotate({f(a.rng.uniform(-3, 3))} 400 550)")
        sheet(a, [(40, 50), (764, 38), (756, 1060), (48, 1052)], color=kit.mix(age, kit.DUST, 0.2), flt=fl)
        a.path("M44,390L760,380M44,724L758,716M398,42V1056", stroke=kit.mix(age, kit.CEDAR, 0.3), stroke_width=1.2, opacity=0.7)
        pc = kit.mix(INK, kit.TISSUE, 0.3)
        a.text(96, 138, "RUTH", size=58, family="cursive", fill=pc, transform="rotate(-5 96 138)", letter_spacing=4)
        a.path("M92,152q90,-14 190,-12", fill="none", stroke=pc, stroke_width=1.6)
        if k == 0:
            a.text(330, 136, "7", size=64, family="cursive", fill=pc, transform="rotate(4 330 136)")
            a.circle(346, 114, 40, fill="none", stroke=pc, stroke_width=1.4)
        lay = [(400, 400, "A", 0), (150, 770, "B", 6), (650, 770, "B", -6), (400, 836, "C", 0)]
        for n, sz in enumerate(sizes):
            last = n == len(sizes) - 1
            ink = INK if last else kit.mix(INK, age, 0.45 + 0.12 * (len(sizes) - 2 - n))
            for (cx, cy, key, rot) in lay:
                piece(a, cx, cy, DRESS[key], "", "", 0, rot=rot, s=sz * 1.3, ink=ink, arrow=last and key == "A", lw=2.6 if last else 1.3,
                      dash="13 6" if last else "5 5", inner=last)
        if note:
            a.text(520, 150, note, size=30, family="cursive", fill=pc, transform="rotate(-3 520 150)")
        a.text(400, 1042, "SIX SEAMS", size=13, family="sans-serif", fill=INK, letter_spacing=4, text_anchor="middle")
        if k == 3:
            for (x, y, ang) in ((250, 330, 30), (560, 300, 140), (120, 700, 80), (690, 720, 100), (400, 620, 0), (330, 960, 20)):
                pin(a, x, y, ang, kit.RED)
            # embroidery scissors lying on the sheet
            a.open("g", transform="translate(590 520) rotate(28) scale(1.9)")
            a.path(kit.ICONS["scissors"][0][1], fill="#1a0f08", opacity=0.3, transform="translate(3 4)")
            a.path(kit.ICONS["scissors"][0][1], fill=a.gradient([(0, "#e9e6de"), (1, "#8d9296")]), stroke="#4a4f54", stroke_width=0.6)
            a.path(kit.ICONS["scissors"][1][1], fill="none", stroke=kit.mix(kit.AMBER, kit.CEDAR, 0.5), stroke_width=4.4)
            a.path(kit.ICONS["scissors"][2][1], fill="#4a4f54")
            a.close()
        a.close()
        kit.shade(a, 0.4)
    draw.__doc__ = doc


for _k, _r in enumerate(RUTH):
    _ruth(_k, _r)

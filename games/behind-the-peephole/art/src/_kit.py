"""Behind the Peephole: palette and shared drawing helpers for the code-drawn art.

Style bible (DEEP_DIVE.md section 4): bottle green, tobacco amber, brass, river grey, paper, ink;
evidence red only on evidence. No line inside the lens (paint edges only); technical pen and typed
line everywhere on paper. Texture: gouache drag, cloth wallpaper, carbon smudge.
"""
import math

from artkit import f

G = "behind-the-peephole"

BOTTLE = "#1f3a2e"
BOTTLE_D = "#12241b"
BOTTLE_L = "#2f5a40"
AMBER = "#c98a3a"
AMBER_L = "#f1c77c"
BRASS = "#b8913f"
BRASS_L = "#e3c47a"
BRASS_D = "#5d4518"
RIVER = "#6f7c80"
RIVER_L = "#a9b4b6"
PAPER = "#efe6cf"
PAPER_D = "#d9cdaf"
INK = "#1c1a17"
CARBON = "#2a3a8c"
EVIDENCE = "#a3302a"
GOLD = "#d4ad57"
SUIT_RED = "#9b3a26"
WOOD = "#2a1a10"
DRAFT = "#f3efe4"

# room -> (guest, lamp colour, lamp name)
ROOMS = {
    401: ("Tomas Vell", "#e8ecf2", "white"),
    402: ("Ines Maro", "#7b9ad0", "TV blue"),
    403: ("Mara Linde", "#dfe6d6", "north light"),
    404: ("Jonah Ferrer", "#e8c060", "yellow"),
    405: ("Kit Saelens", "#8fd0c8", "screen glow"),
    406: ("Ruth Saelens", "#d06a5a", "red shade"),
}
LAMPS = [ROOMS[r][1] for r in sorted(ROOMS)]


def rot(pts, cx, cy, deg):
    a = math.radians(deg)
    ca, sa = math.cos(a), math.sin(a)
    return [(cx + (x - cx) * ca - (y - cy) * sa, cy + (x - cx) * sa + (y - cy) * ca) for x, y in pts]


def box(x, y, w, h):
    return [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]


def circ_d(x, y, r):
    return f"M{f(x - r)},{f(y)}a{f(r)},{f(r)} 0 1,0 {f(2 * r)},0a{f(r)},{f(r)} 0 1,0 {f(-2 * r)},0"


# ---- deco monoline alphabet -----------------------------------------------------------------------
GLYPHS = {
    "A": (.7, "M0,1 L.35,0 L.7,1 M.13,.64 H.57"),
    "B": (.58, "M0,0 V1 M0,0 H.3 A.24,.24 0 0 1 .3,.48 H0 M.3,.48 H.32 A.26,.26 0 0 1 .32,1 H0"),
    "C": (.68, "M.64,.2 A.36,.5 0 1 0 .64,.8"),
    "D": (.66, "M0,0 V1 M0,0 H.2 A.46,.5 0 0 1 .2,1 H0"),
    "E": (.5, "M.5,0 H0 V1 H.5 M0,.48 H.38"),
    "F": (.48, "M.48,0 H0 V1 M0,.48 H.36"),
    "G": (.72, "M.64,.2 A.36,.5 0 1 0 .71,.6 H.42"),
    "H": (.62, "M0,0 V1 M.62,0 V1 M0,.48 H.62"),
    "I": (.04, "M.02,0 V1 h.004"),
    "J": (.44, "M.44,0 V.72 A.22,.28 0 0 1 0,.72"),
    "K": (.6, "M0,0 V1 M.58,0 L0,.58 M.2,.4 L.6,1"),
    "L": (.48, "M0,0 V1 H.48"),
    "M": (.8, "M0,1 V0 L.4,.72 L.8,0 V1"),
    "N": (.64, "M0,1 V0 L.64,1 V0"),
    "O": (.76, "M.38,0 A.38,.5 0 1 0 .38,1 A.38,.5 0 1 0 .38,0"),
    "P": (.56, "M0,1 V0 H.28 A.26,.26 0 0 1 .28,.52 H0"),
    "Q": (.76, "M.38,0 A.38,.5 0 1 0 .38,1 A.38,.5 0 1 0 .38,0 M.48,.74 L.76,1.05"),
    "R": (.6, "M0,1 V0 H.28 A.26,.26 0 0 1 .28,.52 H0 M.26,.52 L.6,1"),
    "S": (.56, "M.52,.2 C.5,-.06 .02,-.06 .04,.26 C.06,.5 .52,.46 .54,.74 C.56,1.06 .04,1.06 .02,.8"),
    "T": (.6, "M0,0 H.6 M.3,0 V1"),
    "U": (.62, "M0,0 V.69 A.31,.31 0 0 0 .62,.69 V0"),
    "V": (.68, "M0,0 L.34,1 L.68,0"),
    "W": (.94, "M0,0 L.23,1 L.47,.25 L.71,1 L.94,0"),
    "X": (.62, "M0,0 L.62,1 M.62,0 L0,1"),
    "Y": (.64, "M0,0 L.32,.52 L.64,0 M.32,.52 V1"),
    "Z": (.58, "M0,0 H.58 L0,1 H.58"),
    "0": (.56, "M.28,0 A.28,.5 0 1 0 .28,1 A.28,.5 0 1 0 .28,0"),
    "1": (.3, "M0,.2 L.24,0 V1"),
    "2": (.54, "M.02,.24 A.26,.25 0 1 1 .46,.44 L0,1 H.54"),
    "3": (.54, "M.04,.14 C.2,-.06 .54,0 .5,.26 C.48,.44 .3,.48 .2,.48 C.36,.48 .56,.56 .54,.76 C.52,1.04 .12,1.06 0,.84"),
    "4": (.58, "M.42,1 V0 L0,.68 H.58"),
    "5": (.54, "M.5,0 H.08 L.04,.44 C.2,.34 .54,.4 .54,.68 C.54,1.02 .12,1.08 0,.84"),
    "6": (.54, "M.46,.04 C.2,.1 .02,.4 .02,.7 A.26,.3 0 1 0 .54,.7 A.26,.28 0 0 0 .04,.6"),
    "7": (.54, "M0,0 H.54 L.18,1"),
    "8": (.56, "M.28,0 A.22,.235 0 1 0 .28,.47 A.22,.235 0 1 0 .28,0 M.28,.47 A.27,.265 0 1 0 .28,1 A.27,.265 0 1 0 .28,.47"),
    "9": (.54, "M.08,.96 C.34,.9 .52,.6 .52,.3 A.26,.3 0 1 0 0,.3 A.26,.28 0 0 0 .5,.4"),
    ":": (.08, "M.04,.3 V.31 M.04,.78 V.79"),
    ".": (.08, "M.04,.98 V.99"),
    "-": (.34, "M0,.5 H.34 v.004"),
    "'": (.06, "M.05,0 L.01,.2"),
    " ": (.36, ""),
}


def deco_width(s, size, tracking=0.22):
    return sum(GLYPHS.get(c, GLYPHS[" "])[0] + tracking for c in s) * size - tracking * size


def deco(a, s, x, y, size, color=BRASS, inline=None, weight=0.13, tracking=0.22, anchor="start", opacity=None,
         skip=()):
    """Draw s in the deco monoline alphabet; (x, y) is the top-left (or centre/right by anchor).
    Returns {index: (cx, cy, w)} for each glyph, so a letter can be replaced by an ornament."""
    wtot = deco_width(s, size, tracking)
    if anchor == "middle":
        x -= wtot / 2
    elif anchor == "end":
        x -= wtot
    pos = {}
    parts = []
    for i, c in enumerate(s):
        w, d = GLYPHS.get(c, GLYPHS[" "])
        pos[i] = (x + w * size / 2, y + size / 2, w * size)
        if d and i not in skip:
            parts.append((x, d))
        x += (w + tracking) * size
    for wgt, col in ((weight, color), (weight * 0.22, inline)):
        if col is None:
            continue
        a.open("g", fill="none", stroke=col, stroke_width=f"{wgt:.3f}", stroke_linecap="round",
               stroke_linejoin="round", opacity=opacity)
        for gx, d in parts:
            a.raw(f'<path d="{d}" transform="translate({f(gx)} {f(y)}) scale({f(size)})"/>')
        a.close()
    return pos


# ---- brass ---------------------------------------------------------------------------------------
def brass_fill(a, cx=0.4, cy=0.35):
    return a.radial([(0, BRASS_L, 1), (0.7, BRASS, 1), (1, BRASS_D, 1)], cx=cx, cy=cy, r=0.65)


def rose(a, cx, cy, r, lit=None, nick=None, petals=8, glow=True, flat=None):
    """A brass rose: the room-side cover of a lens. lit = colour of light leaking through (None = dark,
    an eye is at it). nick = index of a petal with a notch (Fenn's deck). flat = one colour, no brass."""
    if lit and glow:
        a.circle(cx, cy, r * 2.6, fill=a.radial([(0, lit, 0.55), (0.4, lit, 0.18), (1, lit, 0)]))
    fill = flat or brass_fill(a)
    edge = BRASS_D if not flat else "none"
    d = []
    for i in range(petals):
        ang = 2 * math.pi * i / petals - math.pi / 2
        px, py = cx + r * 0.62 * math.cos(ang), cy + r * 0.62 * math.sin(ang)
        d.append(circ_d(px, py, r * 0.36))
    a.path("".join(d), fill=fill, stroke=edge, stroke_width=max(0.6, r * 0.03))
    a.circle(cx, cy, r * 0.62, fill=fill, stroke=edge, stroke_width=max(0.6, r * 0.03))
    if nick is not None:
        ang = 2 * math.pi * nick / petals - math.pi / 2
        px, py = cx + r * 0.95 * math.cos(ang), cy + r * 0.95 * math.sin(ang)
        a.poly([(px + r * .2 * math.cos(ang), py + r * .2 * math.sin(ang)),
                (px - r * .22 * math.cos(ang) + r * .1 * math.sin(ang), py - r * .22 * math.sin(ang) - r * .1 * math.cos(ang)),
                (px + r * .2 * math.sin(ang) + r * .1 * math.cos(ang), py - r * .2 * math.cos(ang) + r * .1 * math.sin(ang))],
               fill=nick_bg(a))
    if not flat:
        a.circle(cx, cy, r * 0.44, fill="none", stroke=BRASS_D, stroke_width=max(0.5, r * 0.025), opacity=0.7)
        a.path(f"M{f(cx - r * .5)},{f(cy - r * .1)} A{f(r * .52)},{f(r * .52)} 0 0,1 {f(cx + r * .1)},{f(cy - r * .52)}",
               fill="none", stroke="#fff3c8", stroke_width=max(0.8, r * 0.05), opacity=0.55, stroke_linecap="round")
    a.circle(cx, cy, r * 0.26, fill="#0a0806")
    if lit:
        a.circle(cx, cy, r * 0.2, fill=a.radial([(0, "#fff8e0", 1), (0.6, lit, 1), (1, lit, 0.7)]))
    else:
        a.circle(cx - r * .07, cy - r * .08, r * 0.06, fill="#59636a", opacity=0.7)


_NICK_BG = {}


def nick_bg(a):
    return _NICK_BG.get(a.key, "#0f2a1e")


def set_nick_bg(a, col):
    _NICK_BG[a.key] = col


# ---- surfaces ------------------------------------------------------------------------------------
def door_wood(a, x, y, w, h, base="#120d09", lines=40, col="#c88a4a", op=0.14):
    """Dark varnished wood with long wandering grain."""
    r = a.rng
    a.rect(x, y, w, h, fill=base)
    ds = []
    for i in range(lines):
        y0 = y + r.uniform(0, h)
        amp, ph, fr = r.uniform(2, 9), r.uniform(0, 6.3), r.uniform(0.004, 0.012)
        pts = [(xx, y0 + amp * math.sin(ph + xx * fr)) for xx in range(int(x), int(x + w) + 60, 60)]
        ds.append(a.smooth_d(pts))
    a.open("g", clip_path=a.clip(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"/>'))
    a.path(" ".join(ds), fill="none", stroke=col, stroke_width=1.1, opacity=op)
    a.close()


def wallpaper(a, x, y, w, h, base=BOTTLE, stripe=46):
    """Bottle-green cloth wallpaper: stripes and a weave."""
    a.rect(x, y, w, h, fill=base)
    pid = a.uid("wp")
    a.defn(f'<pattern id="{pid}" width="{stripe}" height="8" patternUnits="userSpaceOnUse">'
           f'<rect width="{stripe * 0.3:.0f}" height="8" fill="{BOTTLE_L}" opacity="0.5"/>'
           f'<rect x="{stripe * 0.52:.0f}" width="3" height="8" fill="#3d6b4c" opacity="0.5"/>'
           f'<path d="M0,2H{stripe}M0,6H{stripe}" stroke="#0c1a12" stroke-width="0.6" opacity="0.35"/></pattern>')
    a.rect(x, y, w, h, fill=f"url(#{pid})")


def baize(a, col="#1d4a32"):
    a.paper(col, grain=0.4, fibre=1.8)


def cork(a, x, y, w, h, n=1.0):
    a.rect(x, y, w, h, fill="#b5824e")
    k = w * h / 960000 * n
    a.stipple(x, y, w, h, n=int(1500 * k), r=(0.8, 2.6), fill="#8a5a30")
    a.stipple(x, y, w, h, n=int(900 * k), r=(0.6, 1.8), fill="#d7a874")
    a.stipple(x, y, w, h, n=int(500 * k), r=(1.0, 3.0), fill="#6e4422")


def carbon_smudge(a, x, y, w, h, n=6, op=0.16):
    bl = a.blur(14)
    for _ in range(n):
        a.ellipse(x + a.rng.uniform(0, w), y + a.rng.uniform(0, h), a.rng.uniform(20, w * 0.14),
                  a.rng.uniform(8, 26), fill=CARBON, opacity=a.rng.uniform(op * 0.4, op), filter=bl,
                  transform=None)


def dabs(a, x, y, w, h, colors, n=120, L=(5, 13), width=4, op=0.35, angle=None, inside=None):
    """Gouache drag: short opaque strokes in a few colours."""
    r = a.rng
    out = {c: [] for c in colors}
    for _ in range(n):
        px, py = x + r.random() * w, y + r.random() * h
        if inside and not inside(px, py):
            continue
        an = (r.uniform(-0.5, 0.5) if angle is None else angle + r.uniform(-0.35, 0.35))
        ll = r.uniform(*L)
        out[r.choice(colors)].append(f"M{f(px - ll * math.cos(an))},{f(py - ll * math.sin(an))}"
                                     f"L{f(px + ll * math.cos(an))},{f(py + ll * math.sin(an))}")
    for c, ds in out.items():
        if ds:
            a.path("".join(ds), fill="none", stroke=c, stroke_width=width, stroke_linecap="round", opacity=op)


def shadow(a, x, y, w, h, sd=8, op=0.4, rx=6):
    a.rect(x, y, w, h, rx=rx, fill="#000", opacity=op, filter=a.blur(sd))


def pin(a, x, y, color=EVIDENCE, r=9):
    a.ellipse(x + r * .45, y + r * .66, r * .9, r * .45, fill="#000", opacity=0.35)
    a.circle(x, y, r, fill=color, stroke="#000", stroke_width=0.6, stroke_opacity=0.4)
    a.circle(x - r / 3, y - r / 3, r / 3, fill="#fff", opacity=0.6)


def typed(a, x, y, s, size=18, color=CARBON, anchor=None, jitter=0.7, weight=None, op=0.95, spacing=0.5):
    """A typed line: monospace, each line nudged like a struck platen."""
    a.text(x + a.rng.uniform(-jitter, jitter), y + a.rng.uniform(-jitter, jitter), s, size=size,
           family="monospace", fill=color, text_anchor=anchor, font_weight=weight, opacity=op,
           letter_spacing=spacing)


def hand(a, x, y, lines, size=22, color="#1a2a5a", lead=1.25, anchor="middle", tilt=3.0, family="cursive",
         weight=None):
    """Handwriting: generic cursive, each line with its own small slope."""
    for k, ln in enumerate(lines):
        yy = y + k * size * lead
        a.text(x, yy, ln, size=size, family=family, fill=color, font_style="italic", text_anchor=anchor,
               font_weight=weight, transform=f"rotate({a.rng.uniform(-tilt, tilt):.1f} {f(x)} {f(yy)})")


def stamp(a, cx, cy, w, h, lines, color=CARBON, deg=-6, size=None, sub=None):
    """A rubber stamp: double roughened border, heavy sans letters, uneven ink."""
    ro = a.roughen(3.2, 0.09)
    a.open("g", transform=f"rotate({deg} {f(cx)} {f(cy)})", filter=ro, opacity=0.86)
    a.rect(cx - w / 2, cy - h / 2, w, h, rx=h * 0.08, fill="none", stroke=color, stroke_width=h * 0.055)
    a.rect(cx - w / 2 + h * .09, cy - h / 2 + h * .09, w - h * .18, h - h * .18, rx=h * 0.04, fill="none",
           stroke=color, stroke_width=h * 0.018)
    size = size or h * 0.36
    n = len(lines)
    y0 = cy - (n - 1) * size * 0.55 + size * 0.34 - (size * 0.18 if sub else 0)
    for i, ln in enumerate(lines):
        a.text(cx, y0 + i * size * 1.1, ln, size=size, family="sans-serif", fill=color, text_anchor="middle",
               font_weight="bold", letter_spacing=size * 0.12)
    if sub:
        a.text(cx, cy + h / 2 - h * 0.16, sub, size=h * 0.12, family="monospace", fill=color,
               text_anchor="middle", letter_spacing=2)
    a.close()
    # ink starvation: paper-coloured flecks
    return ro


def dim(a, x1, x2, y, label, ext_from=None, size=15, color=INK):
    a.line(x1, y, x2, y, stroke=color, stroke_width=0.9)
    for x in (x1, x2):
        a.line(x - 5, y + 5, x + 5, y - 5, stroke=color, stroke_width=1.6)
        if ext_from is not None:
            a.line(x, ext_from, x, y + (6 if y < ext_from else -6), stroke=color, stroke_width=0.5)
    a.text((x1 + x2) / 2, y - 6, label, size=size, family="monospace", fill=color, text_anchor="middle",
           letter_spacing=1)


def fan(a, cx, cy, r, n=9, a0=-160, a1=-20, color=GOLD, sw=0.9, rings=(0.35, 0.6, 0.85), op=0.9):
    """The deck's stepped fan: rays and arcs from a base point."""
    d = []
    for k in range(n):
        an = math.radians(a0 + (a1 - a0) * k / (n - 1))
        d.append(f"M{f(cx)},{f(cy)}L{f(cx + r * math.cos(an))},{f(cy + r * math.sin(an))}")
    a.path("".join(d), fill="none", stroke=color, stroke_width=sw, opacity=op)
    for q in rings:
        rr = r * q
        x0, y0 = cx + rr * math.cos(math.radians(a0)), cy + rr * math.sin(math.radians(a0))
        x1, y1 = cx + rr * math.cos(math.radians(a1)), cy + rr * math.sin(math.radians(a1))
        a.path(f"M{f(x0)},{f(y0)} A{f(rr)},{f(rr)} 0 0,1 {f(x1)},{f(y1)}", fill="none", stroke=color,
               stroke_width=sw * 1.2, opacity=op)


def steps(a, cx, y, w0, n=4, dw=10, h=5, gap=2, color=GOLD, op=0.85, up=False):
    for k in range(n):
        w = w0 - k * dw
        yy = y - k * (h + gap) - h if up else y + k * (h + gap)
        a.rect(cx - w / 2, yy, w, h, fill=color, opacity=op)


def suit_d(s, x, y, size):
    k = size / 20
    if s == "S":
        return (f"M{f(x)},{f(y - 10 * k)} C{f(x + 14 * k)},{f(y)} {f(x + 12 * k)},{f(y + 10 * k)} {f(x)},{f(y + 4 * k)} "
                f"C{f(x - 12 * k)},{f(y + 10 * k)} {f(x - 14 * k)},{f(y)} {f(x)},{f(y - 10 * k)}Z "
                f"M{f(x)},{f(y + 2 * k)} L{f(x + 4 * k)},{f(y + 12 * k)} L{f(x - 4 * k)},{f(y + 12 * k)}Z")
    if s == "H":
        return (f"M{f(x)},{f(y + 10 * k)} C{f(x - 16 * k)},{f(y - 2 * k)} {f(x - 8 * k)},{f(y - 14 * k)} {f(x)},{f(y - 5 * k)} "
                f"C{f(x + 8 * k)},{f(y - 14 * k)} {f(x + 16 * k)},{f(y - 2 * k)} {f(x)},{f(y + 10 * k)}Z")
    if s == "D":
        return f"M{f(x)},{f(y - 11 * k)} L{f(x + 8 * k)},{f(y)} L{f(x)},{f(y + 11 * k)} L{f(x - 8 * k)},{f(y)}Z"
    d = "".join(circ_d(x + dx * k, y + dy * k, 5 * k) for dx, dy in [(0, -5), (-5, 2), (5, 2)])
    return d + f"M{f(x)},{f(y)} L{f(x + 4 * k)},{f(y + 12 * k)} L{f(x - 4 * k)},{f(y + 12 * k)}Z"


def suit(a, s, x, y, size, color, flip=False, **kw):
    t = f"rotate(180 {f(x)} {f(y)})" if flip else None
    a.path(suit_d(s, x, y, size), fill=color, transform=t, **kw)


def paper_card(a, x, y, w, h, deg=0, fill="#f4efe2", edge="#b8ab8a", sh=True):
    """Open a rotated group holding a paper card with a drop shadow. Caller must a.close()."""
    cx, cy = x + w / 2, y + h / 2
    a.open("g", transform=f"rotate({deg:.1f} {f(cx)} {f(cy)})")
    if sh:
        a.rect(x + 5, y + 7, w, h, fill="#000", opacity=0.28)
    a.rect(x, y, w, h, fill=fill, stroke=edge, stroke_width=0.8)


def bell(a, cx, cy, s, fill=None, stroke=BRASS_D):
    """A small valet bell hung on a coiled spring."""
    fill = fill or brass_fill(a)
    a.path(f"M{f(cx - s * .5)},{f(cy + s * .45)} Q{f(cx - s * .5)},{f(cy - s * .5)} {f(cx)},{f(cy - s * .55)} "
           f"Q{f(cx + s * .5)},{f(cy - s * .5)} {f(cx + s * .5)},{f(cy + s * .45)} "
           f"Q{f(cx)},{f(cy + s * .62)} {f(cx - s * .5)},{f(cy + s * .45)}Z", fill=fill, stroke=stroke, stroke_width=1)
    a.circle(cx, cy + s * .62, s * .1, fill=stroke)
    a.rect(cx - s * .08, cy - s * .7, s * .16, s * .18, fill=stroke)


def wren(a, cx, cy, s, blind=False, color=CARBON):
    """A small wren: round body, cocked tail. Blind = embossed, no ink."""
    body = (circ_d(cx + s * .12, cy + s * .12, s * .56) + circ_d(cx - s * .45, cy - s * .3, s * .34)
            + f"M{f(cx - s * .72)},{f(cy - s * .4)} L{f(cx - s * 1.2)},{f(cy - s * .3)} L{f(cx - s * .74)},{f(cy - s * .18)}Z "
            + f"M{f(cx + s * .4)},{f(cy - s * .3)} L{f(cx + s * .62)},{f(cy - s * 1.12)} L{f(cx + s * .86)},{f(cy - s * 1.02)} L{f(cx + s * .7)},{f(cy + s * .1)}Z")
    legs = f"M{f(cx)},{f(cy + s * .6)} v{f(s * .42)} h{f(-s * .2)} m{f(s * .46)},{f(-s * .44)} v{f(s * .42)} h{f(-s * .2)}"
    if blind:
        a.circle(cx, cy, s * 1.5, fill="none", stroke="#fff", stroke_width=1.6, opacity=0.8, transform="translate(-1 -1)")
        a.circle(cx, cy, s * 1.5, fill="none", stroke="#8a826e", stroke_width=1.2, opacity=0.6)
        a.path(body, fill="#fff", opacity=0.75, transform="translate(-1.2 -1.2)")
        a.path(body, fill="#b9b09a", opacity=0.7, transform="translate(1 1)")
        a.path(body, fill="#ebe5d6")
    else:
        a.path(body, fill=color)
        a.path(legs, fill="none", stroke=color, stroke_width=max(1, s * .06))
        a.circle(cx - s * .62, cy - s * .12, s * .06, fill="#f1ecdf")

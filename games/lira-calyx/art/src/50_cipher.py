"""The Storm-Song Cipher set: fourteen neumes, the peak map and the bar staff."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, INK, PENCIL, SEAL, PAPER, ARCH, BAR = kit.G, kit.INK, kit.PENCIL, kit.SEAL, kit.PAPER, kit.ARCH, kit.BAR
VELLUM, RED, ROW = "#f0e2bf", "#a8281e", "Cipher set"
SP, Y0 = 24, 52          # staff spacing and top line on a 200 x 200 tile


def py(p):
    """Staff position p (0 = bottom line, 2 per line) to y."""
    return Y0 + 3 * SP - p * SP / 2


def sq(a: Art, x, p, s=20, rot=None):
    rot = a.rng.uniform(-4, 4) if rot is None else rot
    a.rect(x - s / 2, py(p) - s / 2, s, s, fill=INK, transform=f"rotate({f(rot)} {f(x)} {f(py(p))})")


def dia(a: Art, x, p, s=13):
    y = py(p)
    a.poly([(x, y - s), (x + s * 0.8, y), (x, y + s), (x - s * 0.8, y)], fill=INK)


def stem(a: Art, x, p0, p1, w=3):
    a.line(x, py(p0), x, py(p1), stroke=INK, stroke_width=w)


def n_punctum(a):
    sq(a, 100, 3)


def n_virga(a):
    sq(a, 96, 4)
    stem(a, 105, 4, -1.4)


def n_pes(a):
    sq(a, 96, 2)
    sq(a, 96, 5, rot=2)
    stem(a, 105, 2, 5)


def n_clivis(a):
    stem(a, 79, 5, 0.5)
    sq(a, 88, 5)
    stem(a, 97, 5, 2)
    sq(a, 108, 2)


def n_torculus(a):
    sq(a, 72, 2)
    stem(a, 81, 2, 5)
    sq(a, 92, 5)
    stem(a, 101, 5, 3)
    sq(a, 112, 3)


def n_porrectus(a):
    stem(a, 64, 5, 0.5)
    a.poly([(64, py(5) - 10), (116, py(2) - 10), (116, py(2) + 10), (64, py(5) + 10)], fill=INK)
    stem(a, 116, 2, 4)
    sq(a, 126, 4, 18)


def n_climacus(a):
    sq(a, 70, 6)
    stem(a, 79, 6, 2)
    dia(a, 98, 4.6)
    dia(a, 118, 3.2)
    dia(a, 138, 1.8)


def n_scandicus(a):
    sq(a, 74, 1)
    sq(a, 98, 3)
    sq(a, 122, 5)
    stem(a, 131, 3, 5)


def n_quilisma(a):
    sq(a, 66, 2)
    pts = [(84, py(3) + 9), (90, py(3) - 9), (96, py(3) + 9), (102, py(3) - 9), (108, py(3) + 9), (114, py(3) - 9), (120, py(3) + 9)]
    a.path("M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts), stroke=INK, stroke_width=7, fill="none", stroke_linejoin="bevel")
    sq(a, 134, 5)
    stem(a, 143, 3, 5)


def n_drone(a):
    a.rect(44, py(0) - 10, 112, 20, fill=INK, transform=f"rotate(-1 100 {py(0)})")
    stem(a, 44, 0, 2.4)
    stem(a, 156, 0, -2.4)


def n_rest(a):
    a.line(100, py(5), 100, py(1), stroke=INK, stroke_width=5)


def n_breath(a):
    a.line(92, Y0 - 8, 92, Y0 + 3 * SP + 8, stroke=INK, stroke_width=5)
    a.line(106, Y0 - 8, 106, Y0 + 3 * SP + 8, stroke=INK, stroke_width=5)
    a.path(f"M84,{Y0 - 34} q14,-6 8,16", fill="none", stroke=INK, stroke_width=5, stroke_linecap="round")


def n_clef(a):
    y = py(4)
    a.path(f"M70,{y - 20} h22 v14 h-12 v12 h12 v14 h-22 Z", fill=INK)
    a.path(f"M96,{y - 20} h10 v14 h-10 M96,{y + 6} h10 v14 h-10", fill=INK, stroke=INK, stroke_width=1)
    a.line(66, py(6.6), 66, py(1.4), stroke=INK, stroke_width=3)


def n_custos(a):
    sq(a, 120, 3, 11)
    a.line(126, py(3), 142, py(7), stroke=INK, stroke_width=2.4)
    for x, p in ((50, 1), (74, 2)):
        sq(a, x, p, 18)


NEUMES = [
    ("punctum", n_punctum, "one note", "a single square note on the staff"),
    ("virga", n_virga, "one note, held", "a square note with a tail falling from its right side"),
    ("pes", n_pes, "+1   +30°", "two notes stacked and joined, the lower sung first"),
    ("clivis", n_clivis, "−1   −30°", "two notes joined, the higher first, stepping down"),
    ("torculus", n_torculus, "+1  −1", "three notes joined: low, high, low"),
    ("porrectus", n_porrectus, "−1  +1", "a broad slanting stroke from high to low that ends in a note above"),
    ("climacus", n_climacus, "−1  −1", "a tailed note followed by two or three falling lozenges"),
    ("scandicus", n_scandicus, "+1  +1", "three notes climbing"),
    ("quilisma", n_quilisma, "+1  +1  slow", "a toothed, trembling note between two plain ones"),
    ("drone", n_drone, "0°", "the long held note on the lowest line that every interval is counted from"),
    ("rest", n_rest, "100 m", "an upright stroke through the staff: one beat of silence"),
    ("breath", n_breath, "new node", "a double bar with a hooked mark above it: where she breathes"),
    ("clef", n_clef, "the line of do", "the C clef that names its line"),
    ("custos", n_custos, "next line", "the small guide note with a hairline tail at a line's end"),
]
for _i, (_id, _fn, _hint, _doc) in enumerate(NEUMES):
    def _neume(a: Art, fn=_fn, name=_id, hint=_hint, i=_i):
        kit.page(a, color=VELLUM, pool=0.3)
        a.rect(8, 8, 184, 184, fill="none", stroke=INK, stroke_width=1)
        kit.staff(a, 18, Y0, 164, SP, RED, 2)
        fn(a)
        a.text(20, 172, name, size=21, family="serif", font_style="italic", fill=INK)
        a.text(182, 172, hint, size=13, family="monospace", fill=RED, text_anchor="end")
        a.text(182, 28, f"{i + 1:02d}", size=12, family="monospace", fill=PENCIL, text_anchor="end")
    _neume.__doc__ = (f"Neume tile on vellum with a red four-line staff: the {_id}, {_doc}; its name beneath in italic "
                      f"and its reading in red.")
    asset(G, f"neume-{_id}", group="pieces", title=f"Neume: {_id}", w=200, h=200, row=ROW)(_neume)


@asset(G, "peak-map", group="maps", title="The peak map", w=1200, h=1200, row=ROW)
def peak_map(a: Art):
    """The peak map the songs are plotted on: a vellum sheet squared at 100 m, twelve peaks drawn as
    hachured summits in violet wash and numbered, a cyan river through the Mid-Slopes, a compass
    ring divided in twelve steps of 30 degrees, and the drone's starting point marked at the foot."""
    r = a.rng
    kit.page(a, color=VELLUM, pool=0.35)
    MX, MY, MS = 90, 110, 1020
    a.rect(MX, MY, MS, MS, fill="#f6ead0", stroke=INK, stroke_width=2.4)
    a.grid(MX, MY, MS, MS, MS / 20, stroke=INK, stroke_width=0.5, opacity=0.35)
    for k in range(20):
        a.text(MX + (k + 0.5) * MS / 20, MY - 8, chr(65 + k), size=13, family="monospace", fill=INK, text_anchor="middle")
        a.text(MX - 10, MY + (k + 0.62) * MS / 20, str(k + 1), size=13, family="monospace", fill=INK, text_anchor="end")
    peaks = []
    for k in range(12):
        t = k / 11
        x = MX + 150 + t * 740 + r.uniform(-30, 30)
        y = MY + 330 - 210 * math.sin(t * math.pi) + r.uniform(-50, 50) + (130 if k % 2 else 0)
        peaks.append((x, y, 46 + 30 * math.sin(t * math.pi) + r.uniform(-6, 10)))
    cl = a.clip(f'<rect x="{MX}" y="{MY}" width="{MS}" height="{MS}"/>')
    a.open("g", clip_path=cl)
    for k in range(6):
        pts = [(MX - 20 + i * 60, MY + 560 + k * 46 + 50 * math.sin(i * 0.5 + k * 0.4) + 20 * math.sin(i * 1.3)) for i in range(19)]
        a.path(a.smooth_d(pts), fill="none", stroke="#8a6a3a", stroke_width=1.6 if k % 3 == 0 else 0.9, opacity=0.6)
    river = [(MX - 10, MY + 900), (MX + 180, MY + 840), (MX + 360, MY + 900), (MX + 560, MY + 820), (MX + 780, MY + 880), (MX + MS + 10, MY + 800)]
    a.path(a.smooth_d(river), fill="none", stroke=kit.CYAN, stroke_width=12, opacity=0.5, stroke_linecap="round")
    a.path(a.smooth_d(river), fill="none", stroke=INK, stroke_width=1, opacity=0.6, transform="translate(0,-7)")
    a.path(a.smooth_d(river), fill="none", stroke=INK, stroke_width=1, opacity=0.6, transform="translate(0,7)")
    for k, (x, y, s) in enumerate(peaks):
        ring = [(x + s * (1 + 0.16 * math.sin(3 * t + k)) * math.cos(t), y + s * 0.8 * (1 + 0.16 * math.cos(2 * t + k)) * math.sin(t))
                for t in [i * math.pi / 8 for i in range(16)]]
        kit.wash(a, ring, kit.VIOLET, 0.2 + 0.02 * k, 2)
        d = []
        for q in range(36):
            t = q * math.pi / 18 + r.uniform(-0.05, 0.05)
            r0, r1 = s * r.uniform(0.34, 0.46), s * r.uniform(0.9, 1.25)
            d.append(f"M{f(x + r0 * math.cos(t))},{f(y + r0 * 0.8 * math.sin(t))}L{f(x + r1 * math.cos(t))},{f(y + r1 * 0.8 * math.sin(t))}")
        a.path("".join(d), stroke=INK, stroke_width=1.3, fill="none", stroke_linecap="round")
        a.poly([(x - 7, y + 5), (x, y - 9), (x + 7, y + 5)], fill=PAPER, stroke=INK, stroke_width=1.8)
        a.text(x + s * 0.7, y - s * 0.75, str(k + 1), size=26, family="serif", font_style="italic", fill=INK)
    for _ in range(26):
        x, y = MX + r.uniform(40, MS - 40), MY + r.uniform(600, 800)
        a.path(f"M{f(x)},{f(y)} l-6,14 h12 Z M{f(x)},{f(y + 14)} v6", stroke=kit.MOSS, stroke_width=1.4, fill="none")
    a.close()
    # compass ring: twelve steps of 30 degrees
    cx, cy, R = MX + 870, MY + 860, 110
    a.circle(cx, cy, R + 14, fill="#f6ead0", stroke=INK, stroke_width=2)
    a.circle(cx, cy, R, fill="none", stroke=INK, stroke_width=1.2)
    for k in range(12):
        t = math.radians(k * 30 - 90)
        a.line(cx + (R - 16) * math.cos(t), cy + (R - 16) * math.sin(t), cx + R * math.cos(t), cy + R * math.sin(t), stroke=INK, stroke_width=2.4)
        a.text(cx + (R - 32) * math.cos(t), cy + (R - 32) * math.sin(t) + 5, str(k * 30), size=13, family="monospace", fill=RED, text_anchor="middle")
    a.poly([(cx, cy - R + 44), (cx + 12, cy), (cx, cy + R - 44), (cx - 12, cy)], fill=PAPER, stroke=INK, stroke_width=1.8)
    a.poly([(cx, cy - R + 44), (cx + 12, cy), (cx - 12, cy)], fill=INK)
    # drone start, scale, title
    sx, sy = MX + 4.5 * MS / 20, MY + 18.5 * MS / 20
    a.circle(sx, sy, 9, fill=INK)
    a.circle(sx, sy, 18, fill="none", stroke=INK, stroke_width=1.4)
    a.text(sx + 26, sy + 6, "drone", size=20, family="serif", font_style="italic", fill=INK)
    a.rect(MX + 60, MY + MS - 60, MS / 20 * 4, 10, fill="none", stroke=INK, stroke_width=1.6)
    for k in (0, 2):
        a.rect(MX + 60 + k * MS / 20, MY + MS - 60, MS / 20, 10, fill=INK)
    a.text(MX + 60 + 4.3 * MS / 20, MY + MS - 49, "400 m", size=15, family="monospace", fill=INK)
    a.text(MX, 66, "Peak map, sheet 3", size=34, family="serif", font_style="italic", fill=INK)
    a.text(MX + MS, 66, "one rest: one square", size=18, family="serif", font_style="italic", fill=RED, text_anchor="end")


@asset(G, "bar-staff", group="documents", title="The bar staff", w=1200, h=640, row=ROW)
def bar_staff(a: Art):
    """The bar staff: a page of the redacted brief slid under a strip of horn ruled with four red
    lines, so that each surgical bar sits on a line like a neume; above the strip its pitch is
    pencilled as a square, and a ruler of rests runs along the foot. The brushed bar falls between
    lines and reads as nothing."""
    r = a.rng
    a.paper("#2a2622", grain=0.18)
    a.open("g")
    a.rect(96, 46, 1010, 560, fill="#000", opacity=0.4, filter=a.blur(8))
    kit.page(a, color="#f2ecdd", x=90, y=36, w=1010, h=560)
    kit.continuum(a, 130, 80, "PUBLISHED BRIEF", 20)
    SY, SPB = 200, 56
    ys = [SY + k * SPB for k in range(4)]
    rows = [y for yy in ys for y in (yy + 6, yy + 6 - SPB / 2)] + [430, 456, 482, 508, 534, 560]
    for y in sorted(set(rows)):
        x = 130
        d = []
        while x < 1050:
            wl = r.uniform(30, 110)
            d.append(f"M{f(x)},{f(y)}h{f(min(wl, 1050 - x))}")
            x += wl + 14
        a.path("".join(d), stroke=BAR, stroke_width=7, fill="none", opacity=0.5, stroke_dasharray="9 2")
    a.close()
    bars = [(170, 0, 120), (330, 2, 82), (452, 1, 164), (660, 3, 60), (760, 1, 120), (920, 2, 100)]
    for x, line, w in bars:
        y = ys[3 - line]
        a.rect(x - 8, y - 20, w + 16, 40, fill="#f2ecdd")
        kit.bar(a, x, y - 15, w, 30)
    a.rect(584, ys[1] + 8, 60, 36, fill="#f2ecdd")
    kit.bar(a, 560, ys[1] + 12, 96, 26, kind="clumsy")
    # the horn strip with its staff
    a.rect(60, SY - 30, 1080, 3 * SPB + 74, rx=10, fill="#e8c98a", fill_opacity=0.16, stroke="#8a6a3a", stroke_width=2)
    a.rect(60, SY - 30, 1080, 14, rx=6, fill="#fff", opacity=0.18)
    kit.staff(a, 60, SY, 1080, SPB, RED, 2.6)
    for x in (60, 1116):
        a.rect(x, SY - 50, 24, 3 * SPB + 100, fill="#8a6a3a", stroke=INK, stroke_width=2)
        a.circle(x + 12, SY - 30, 4, fill="#3a2c22")
        a.circle(x + 12, SY + 3 * SPB + 30, 4, fill="#3a2c22")
    for x, line, w in bars:
        a.rect(x + w / 2 - 13, SY - 66 - line * 14, 26, 26, fill=INK, opacity=0.85,
               transform=f"rotate({r.uniform(-5, 5):.1f} {x + w / 2} {SY - 60})")
        a.line(x + w / 2, SY - 40 - line * 14, x + w / 2, ys[3 - line] - 18, stroke=PENCIL, stroke_width=1.2, stroke_dasharray="3 5")
    # the ruler of rests
    ry = SY + 3 * SPB + 66
    a.rect(110, ry, 980, 34, fill="#c9ced0", stroke=INK, stroke_width=1.6)
    d = []
    for k in range(50):
        d.append(f"M{130 + k * 19},{ry}v{16 if k % 2 == 0 else 9}")
    a.path("".join(d), stroke=BAR, stroke_width=1.2, fill="none")
    for x, line, w in bars:
        n = round(w / 38)
        for q in range(n):
            a.line(x + 10 + q * 38, ry + 20, x + 10 + q * 38, ry + 30, stroke=RED, stroke_width=4)
    a.text(110, ry + 60, "its line is its pitch", size=20, family="serif", font_style="italic", fill=PAPER)
    a.text(1090, ry + 60, "its length is its rests", size=20, family="serif", font_style="italic", fill=PAPER, text_anchor="end")

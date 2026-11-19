"""The Node Board's tokens: the emitter, the seed and four witnesses, on Swiss-relief card."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G, INK, PENCIL, SEAL, PAPER, ARCH, BAR = kit.G, kit.INK, kit.PENCIL, kit.SEAL, kit.PAPER, kit.ARCH, kit.BAR
ROW = "Board tokens"


def disc(a: Art, tint="#dfe6d2", rim=INK, dark=False):
    """A round card token printed with shaded relief and contours."""
    r = a.rng
    a.circle(104, 106, 90, fill="#000", opacity=0.35, filter=a.blur(4))
    cp = a.clip('<circle cx="100" cy="100" r="90"/>')
    a.open("g", clip_path=cp)
    a.rect(0, 0, 200, 200, fill=tint)
    a.rect(0, 0, 200, 200, fill=a.gradient([(0, "#ffffff"), (0.5, tint), (1, "#5a6a70" if not dark else "#000")], 0, 0, 1, 1), opacity=0.6)
    cx, cy = 100 + r.uniform(-30, 30), 100 + r.uniform(-30, 30)
    for k in range(9):
        pts = [(cx + (14 + k * 15) * math.cos(t) * (1 + 0.2 * math.sin(3 * t + k * 0.7)),
                cy + (11 + k * 13) * math.sin(t) * (1 + 0.18 * math.cos(2 * t + k)))
               for t in [i * math.pi / 9 for i in range(18)]]
        a.path(a.smooth_d(pts, closed=True), fill="none", stroke="#8a6a3a" if not dark else "#6a5a7a",
               stroke_width=1.6 if k % 4 == 0 else 0.8, opacity=0.7)
    a.close()
    a.circle(100, 100, 90, fill="none", stroke=rim, stroke_width=4)
    a.circle(100, 100, 82, fill="none", stroke=rim, stroke_width=1.2)


def witness(a: Art, n):
    disc(a, "#e6e2c8")
    a.circle(100, 100, 58, fill=PAPER, stroke=INK, stroke_width=2.4)
    for k in range(4):
        t = math.radians(-135 + k * 90)
        a.circle(100 + 70 * math.cos(t), 100 + 70 * math.sin(t), 6, fill=ARCH if k == n else PAPER, stroke=INK, stroke_width=1.8)


@asset(G, "token-emitter", group="pieces", title="Token: emitter", w=200, h=200, row=ROW)
def tok_emitter(a: Art):
    """A fungal-integrated emitter on a relief-printed disc: a gilled cap seen from above with a
    brass core, cyan phase arcs leaving it, and eight firing slots ticked round the rim."""
    disc(a, "#d6e6dc")
    for k in range(8):
        t = math.radians(k * 45 - 90)
        a.line(100 + 70 * math.cos(t), 100 + 70 * math.sin(t), 100 + 80 * math.cos(t), 100 + 80 * math.sin(t), stroke=INK, stroke_width=3)
    for rr, op in ((62, 0.4), (52, 0.65), (42, 0.9)):
        a.path(f"M{f(100 - rr * 0.7)},{f(100 - rr * 0.7)} A{rr},{rr} 0 0,1 {f(100 + rr * 0.7)},{f(100 - rr * 0.7)}", fill="none",
               stroke=kit.CYAN, stroke_width=4, opacity=op, stroke_linecap="round")
    a.circle(100, 106, 34, fill="#b9a078", stroke=INK, stroke_width=2.6)
    d = "".join(f"M{f(100 + 10 * math.cos(math.radians(q)))},{f(106 + 10 * math.sin(math.radians(q)))}"
                f"L{f(100 + 33 * math.cos(math.radians(q + 6)))},{f(106 + 33 * math.sin(math.radians(q + 6)))}" for q in range(0, 360, 15))
    a.path(d, stroke=INK, stroke_width=1.2, fill="none")
    a.circle(100, 106, 10, fill="#8a6a3a", stroke=INK, stroke_width=2)
    a.circle(100, 106, 3.5, fill=kit.CYAN)


@asset(G, "token-seed", group="pieces", title="Token: seed", w=200, h=200, row=ROW)
def tok_seed(a: Art):
    """One of Veylor's seeds on a dark disc: a ruled crystal lattice in a hexagon, a red starburst
    behind it, and the maker's mark, a 9, in one cell."""
    disc(a, "#3a3444", rim=BAR, dark=True)
    a.poly(a.star_pts(100, 100, 74, 44, 12), fill=SEAL, stroke=BAR, stroke_width=2, stroke_linejoin="round")
    hexp = a.ngon(100, 100, 44, 6, 30)
    a.poly(hexp, fill="#f3eeff", stroke=BAR, stroke_width=2.6)
    cp = a.clip('<polygon points="' + " ".join(f"{f(x)},{f(y)}" for x, y in hexp) + '"/>')
    for ang in (0, 60, 120):
        a.hatch(56, 56, 88, 88, angle=ang, spacing=11, clip=cp, stroke=kit.VIOLET, stroke_width=1.1)
    a.circle(100, 100, 13, fill="#f3eeff", stroke=kit.VIOLET, stroke_width=1.2)
    kit.stroke_text(a, "9", 94, 109, 17, color=BAR, w=2.6, smooth=True, aspect=0.7)


@asset(G, "token-witness-pell", group="pieces", title="Token: witness, Pell's book", w=200, h=200, row=ROW)
def tok_pell(a: Art):
    """Witness token: a child's exercise book with a pencil laid across it, PELL in wobbling
    capitals on the cover."""
    witness(a, 0)
    a.open("g", transform="rotate(-8 100 100)")
    a.rect(66, 58, 68, 86, fill="#9fb8a8", stroke=INK, stroke_width=2.4, rx=3)
    a.rect(66, 58, 12, 86, fill="#5d7a6a", stroke=INK, stroke_width=1.6)
    a.rect(84, 72, 44, 26, fill=PAPER, stroke=INK, stroke_width=1.4)
    kit.pell(a, "PELL", 87, 92, 13)
    a.close()
    a.line(70, 140, 142, 104, stroke=INK, stroke_width=7, stroke_linecap="round")
    a.line(70, 140, 136, 107, stroke="#d9a441", stroke_width=4, stroke_linecap="round")
    a.poly([(142, 104), (136, 107), (139, 101)], fill=BAR)


@asset(G, "token-witness-sluice", group="pieces", title="Token: witness, the sluice log", w=200, h=200, row=ROW)
def tok_sluice(a: Art):
    """Witness token: the sluice house's gate wheel over three lines of cyan water, a river-level
    line ruled in red across them."""
    witness(a, 1)
    a.circle(100, 88, 26, fill="none", stroke=INK, stroke_width=4)
    for k in range(6):
        t = math.radians(k * 60 + 10)
        a.line(100, 88, 100 + 32 * math.cos(t), 88 + 32 * math.sin(t), stroke=INK, stroke_width=3, stroke_linecap="round")
    a.circle(100, 88, 6, fill="#8a6a3a", stroke=INK, stroke_width=2)
    a.rect(92, 112, 16, 18, fill=kit.SLATE, stroke=INK, stroke_width=2)
    for k in range(3):
        pts = [(58 + i * 12, 132 + k * 8 + 3 * math.sin(i * 1.6 + k)) for i in range(8)]
        a.path(a.smooth_d(pts), fill="none", stroke=kit.CYAN, stroke_width=3, stroke_linecap="round")
    a.path("M60,126 h80", stroke=SEAL, stroke_width=2, stroke_dasharray="6 4", fill="none")


@asset(G, "token-witness-song", group="pieces", title="Token: witness, Mara's song", w=200, h=200, row=ROW)
def tok_song(a: Art):
    """Witness token: a red four-line staff with a rising run of square notes and the hooked mark
    for a breath."""
    witness(a, 2)
    kit.staff(a, 54, 82, 92, 12, sw=1.8)
    for k, (dx, p) in enumerate([(12, 1), (30, 3), (30, 4), (50, 2), (68, 5)]):
        a.rect(54 + dx - 6, 82 + 36 - p * 6 - 6, 12, 12, fill=INK, transform=f"rotate({(k - 2) * 3} {54 + dx} {82 + 36 - p * 6})")
    a.line(90, 82 + 12, 90, 82 + 18, stroke=INK, stroke_width=2)
    a.path("M132,66 q9,-3 5,11", stroke=INK, stroke_width=3.4, fill="none", stroke_linecap="round")


@asset(G, "token-witness-bars", group="pieces", title="Token: witness, the bar cipher", w=200, h=200, row=ROW)
def tok_bars(a: Art):
    """Witness token: three surgical bars of different lengths lying on the lines of a staff, blue
    showing along their edges."""
    witness(a, 3)
    kit.staff(a, 54, 80, 92, 13, color=PENCIL, sw=1.4)
    kit.bar(a, 60, 75, 44, 10)
    kit.bar(a, 84, 101, 56, 10)
    kit.bar(a, 62, 114, 26, 10)

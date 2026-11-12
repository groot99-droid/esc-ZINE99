"""The Redacted Testament of Lira Calyx: gameplay pictographs. Built by tools/pictographs/build.py.

Seven pages, seven graphic styles (docs/graphic_styles.json), one palette (DESIGN.md section 15):
Lowlands rust and ochre, Mid-Slopes moss and slate and river cyan, High Peaks violet and ice and
teal, the Continuum's matte black and seal red, and the journal's warm paper and iron-gall ink.
"""
import math

from core import H, W, Pic, register

G = "lira-calyx"

# palette (DESIGN.md section 15)
RUST, OCHRE, BONE, CRYSTAL = "#9c4a25", "#c8913a", "#e7dcc3", "#f6f8f4"
MOSS, SLATE, CYAN = "#3f5a2c", "#56606a", "#3fc4d0"
VIOLET, ICE, TEAL = "#5a3f7a", "#b9d8ea", "#25c2a8"
BLACK, COLD, SEAL = "#141414", "#f2f4f5", "#b3212b"
PAPER, INK, PENCIL, ARCH = "#efe4cb", "#3b2618", "#7d7a74", "#3c5a8c"


def _pattern(p: Pic, bg: str, inner: str, size=16) -> str:
    pid = p.uid("pat")
    p.defn(f'<pattern id="{pid}" width="{size}" height="{size}" patternUnits="userSpaceOnUse">'
           f'<rect width="{size}" height="{size}" fill="{bg}"/>{inner}</pattern>')
    return f"url(#{pid})"


# ------------------------------------------------------------------------------------------------
@register(G, "cross-section-climb")
def cross_section_climb(p: Pic):
    """Cross-section climb (2D): the mountain is cut open like a survey section, its strata hatched
    in rock patterns, with the altitude scale on the left. Lira's dotted route climbs from the base
    camp through a shaft and up the ledges; she has clipped her anchor in as a storm front crosses
    the slope at 3,400 m. Her air bar is draining, and above the 4,000 m line the low-gravity
    pockets shimmer, with the next camp beyond them."""
    r = p.rng
    p.paper("#f1e8d2", grain=0.22)
    X0, X1, YB, YT = 130, 1170, 740, 60

    def ya(alt):
        return YB - (YB - YT) * alt / 5000

    # faint altitude grid
    for a in range(500, 5001, 500):
        p.line(X0, ya(a), X1, ya(a), stroke=SLATE, stroke_width=0.6, stroke_dasharray="2 6", opacity=0.5)
    # ground profile: a ridge with a summit near x=880
    prof = []
    for i in range(0, 175):
        x = X0 + i * (X1 - X0) / 174
        t = (x - X0) / (X1 - X0)
        alt = (300 + 4500 * math.exp(-((t - 0.72) / 0.28) ** 2) + 380 * math.sin(t * 17) * t
               + r.uniform(-50, 50))
        if t > 0.72:
            alt -= (t - 0.72) * 3800
        prof.append((x, ya(max(250, min(4850, alt)))))
    mountain = [(X0, YB)] + prof + [(X1, YB)]
    mpts = " ".join(f"{x:.1f},{y:.1f}" for x, y in mountain)
    mclip = p.clip(f'<polygon points="{mpts}"/>')
    # strata patterns
    pats = [
        _pattern(p, "#d9b77c", f'<circle cx="4" cy="4" r="1.3" fill="{INK}"/><circle cx="12" cy="11" r="1" fill="{INK}"/>'),
        _pattern(p, OCHRE, f'<path d="M0,16 L16,0" stroke="{INK}" stroke-width="1.2"/>', 10),
        _pattern(p, "#7c8a6a", f'<path d="M0,4 H16 M0,12 H16 M8,4 V12 M0,12 V16 M16,12 V16 M4,0 V4 M12,0 V4" '
                               f'stroke="{INK}" stroke-width="1" fill="none"/>'),
        _pattern(p, "#8d969c", f'<path d="M1,5 H8 M10,13 H15" stroke="{INK}" stroke-width="1.4"/>'),
        _pattern(p, "#b56a3f", f'<path d="M3,3 l4,4 M7,3 l-4,4 M11,11 l4,4 M15,11 l-4,4" stroke="{INK}" stroke-width="1"/>'),
        _pattern(p, "#6e7f8f", f'<path d="M0,8 Q4,3 8,8 T16,8" stroke="{ICE}" stroke-width="1.6" fill="none"/>'),
        _pattern(p, "#9aa9ae", f'<path d="M8,2 L13,8 L8,14 L3,8Z" fill="none" stroke="{INK}" stroke-width="0.9"/>', 16),
    ]
    names = ["Ash tuff", "Ochre sandstone", "Moss terrace", "Slate", "Rust breccia", "Crystal vein", "Ice schist"]
    # dipping boundaries
    bounds = []
    for k in range(8):
        base, ph = YB - k * 92 + 20, r.uniform(0, 6)
        bounds.append([(x, base - (x - X0) * 0.16 + 14 * math.sin(x / 70 + ph) + 6 * math.sin(x / 23 + ph * 2))
                       for x in range(X0 - 10, X1 + 30, 20)])
    p.open("g", clip_path=mclip)
    p.rect(X0, YT, X1 - X0, YB - YT, fill=pats[-1])
    for k in range(7):
        lo, hi = bounds[k], bounds[k + 1]
        if k == 0:
            lo = [(x, YB + 40) for x, _ in lo]
        poly = lo + hi[::-1]
        p.poly(poly, fill=pats[k], stroke=INK, stroke_width=1.6)
    # faults
    for fx in (420, 760):
        p.wobble([(fx, YB), (fx + 90, YT)], amp=2, step=25, stroke=INK, stroke_width=2.2)
    # the shaft with ledges
    def ground(xq):
        for (xa, ya_), (xb, yb) in zip(prof, prof[1:]):
            if xa <= xq <= xb:
                return ya_ + (yb - ya_) * (xq - xa) / (xb - xa)
        return prof[-1][1]
    # the shaft: a tunnel in from the slope, then straight up to the surface
    sx = 600
    entry_x = sx - 90
    ent_y = ground(entry_x) + 4
    shaft_top = ground(sx + 40) - 4
    shaft_bot = ent_y + 34
    cut = dict(fill="#f6efdc", stroke=INK, stroke_width=2.5)
    p.rect(entry_x - 10, ent_y - 6, sx - entry_x + 10, 40, **cut)
    p.rect(sx, shaft_top - 20, 80, shaft_bot - shaft_top + 20, **cut)
    p.rect(entry_x - 8, ent_y - 4, sx - entry_x + 12, 36, fill="#f6efdc")
    p.close()
    p.wobble(prof, amp=1.2, step=12, stroke=INK, stroke_width=3.2)
    ledges = []
    y = shaft_bot - 50
    side = 0
    while y > shaft_top + 40:
        x = sx if side == 0 else sx + 48
        p.rect(x, y, 32, 7, fill=INK)
        ledges.append((x + 16, y))
        side ^= 1
        y -= 58
    # route: base camp -> tunnel -> ledges -> out on the slope -> Lira in the storm band
    route = [(x, ground(x) - 6) for x in range(180, entry_x - 10, 30)]
    route += [(entry_x + 20, ent_y + 24), (sx + 16, ent_y + 24)] + [(lx, ly - 6) for lx, ly in ledges]
    route += [(sx + 40, shaft_top - 6)]
    x = sx + 90
    while ground(x) > ya(3420) and x < 1000:
        route.append((x, ground(x) - 6))
        x += 24
    lira = route[-1]
    p.path(p.smooth_d(route), fill="none", stroke=INK, stroke_width=4.5, stroke_dasharray="0.1 11",
           stroke_linecap="round")
    # camps
    for cx in (200, sx + 120):
        gy = ground(cx)
        p.poly([(cx - 16, gy), (cx, gy - 24), (cx + 16, gy)], fill=RUST, stroke=INK, stroke_width=2)
        p.line(cx, gy - 24, cx, gy - 40, stroke=INK, stroke_width=2)
        p.poly([(cx, gy - 40), (cx + 14, gy - 35), (cx, gy - 30)], fill=SEAL)
    top = min(prof, key=lambda q: q[1])
    nx = top[0] - 60
    ngy = ground(nx)
    p.poly([(nx - 16, ngy), (nx, ngy - 24), (nx + 16, ngy)], fill="none", stroke=INK, stroke_width=2,
           stroke_dasharray="4 3")
    p.text(nx - 120, ngy - 20, "next camp", size=16, family="serif", font_style="italic", fill=INK)
    # Lira, anchored
    lx, ly = lira
    p.line(lx, ly - 4, lx - 24, ly + 10, stroke=SEAL, stroke_width=2.5)
    p.circle(lx - 24, ly + 10, 4, fill="none", stroke=SEAL, stroke_width=2.5)
    p.circle(lx + 2, ly - 34, 6, fill=INK)
    p.path(f"M{lx + 2},{ly - 28} L{lx},{ly - 12} M{lx},{ly - 12} L{lx - 7},{ly} M{lx},{ly - 12} L{lx + 8},{ly} "
           f"M{lx + 1},{ly - 24} L{lx - 10},{ly - 16} M{lx + 1},{ly - 24} L{lx + 12},{ly - 30}",
           stroke=INK, stroke_width=3.5, stroke_linecap="round", fill="none")
    p.rect(lx - 6, ly - 28, 8, 12, fill=MOSS)
    # storm front crossing at 3,200-3,600 m
    sy0, sy1 = ya(3650), ya(3150)
    fade = p.gradient([(0, "#56606a00"), (0.55, "#56606a55"), (1, "#26303acc")], 0, 0, 1, 0)
    p.rect(X0, sy0, X1 - X0, sy1 - sy0, fill=fade)
    for k in range(9):
        yy = sy0 + 8 + k * (sy1 - sy0 - 16) / 8
        x0 = X0 + r.uniform(40, 300)
        pts = [(x, yy + 4 * math.sin(x / 26 + k)) for x in range(int(x0), X1 - 20, 16)]
        p.path(p.smooth_d(pts), fill="none", stroke=SLATE, stroke_width=1.6, opacity=0.8)
    for k in range(3):
        yy = sy0 + 20 + k * 22
        p.path(f"M{X1 - 120},{yy} h70 l-12,-8 M{X1 - 50},{yy} l-12,8", stroke=COLD, stroke_width=3, fill="none")
    p.text(X0 + 14, sy0 - 8, "STORM FRONT  3 s WARNING", size=17, family="monospace", fill=SLATE)
    # low-gravity line and shimmer
    p.line(X0, ya(4000), X1, ya(4000), stroke=VIOLET, stroke_width=2, stroke_dasharray="10 6")
    p.text(X0 + 14, ya(4000) - 10, "4 000 m  LOW GRAVITY", size=17, family="monospace", fill=VIOLET)
    for _ in range(40):
        x, y = r.uniform(X0 + 300, X1 - 40), r.uniform(ya(4900), ya(4050))
        p.circle(x, y, r.uniform(1.5, 4), fill="none", stroke=VIOLET, stroke_width=1, opacity=0.6)
    # altitude scale
    p.rect(60, YT, 34, YB - YT, fill="#f7f1e2", stroke=INK, stroke_width=2)
    for a in range(0, 5001, 100):
        major = a % 500 == 0
        p.line(94, ya(a), 94 - (16 if major else 7), ya(a), stroke=INK, stroke_width=2 if major else 1)
        if major and a % 1000 == 0:
            p.text(98, ya(a) + 5, f"{a // 1000} km", size=13, family="monospace", fill=INK)
    p.rect(62, ya(3340), 30, ya(1900) - ya(3340), fill=TEAL, opacity=0.55)
    p.poly([(56, ya(3340)), (44, ya(3340) - 8), (44, ya(3340) + 8)], fill=SEAL)
    # air bar
    p.rect(160, 22, 300, 22, fill="#f7f1e2", stroke=INK, stroke_width=2)
    p.rect(162, 24, 300 * 0.58 - 4, 18, fill=CYAN)
    for i in range(1, 10):
        p.line(160 + i * 30, 22, 160 + i * 30, 44, stroke=INK, stroke_width=1)
    p.text(470, 40, "AIR 58   -1/s", size=18, family="monospace", fill=INK)
    # legend and title block
    lx0, ly0 = 920, 560
    p.rect(lx0, ly0, 240, 170, fill="#f7f1e2", stroke=INK, stroke_width=2)
    for i, (pat, nm) in enumerate(zip(pats, names)):
        yy = ly0 + 12 + i * 22
        p.rect(lx0 + 10, yy, 30, 16, fill=pat, stroke=INK, stroke_width=1)
        p.text(lx0 + 50, yy + 13, nm, size=14, family="serif", fill=INK)
    p.text(X0 + 10, YB + 40, "SECTION A-A'   BOOK III CLIMB   2 800 to 4 600 m   ROUTE IN JOURNAL INK",
           size=17, family="monospace", fill=INK)
    p.rect(20, 10, W - 40, H - 20, fill="none", stroke=INK, stroke_width=2)


# ------------------------------------------------------------------------------------------------
@register(G, "under-the-lens")
def under_the_lens(p: Pic):
    """Under the lens (2D): a circular field of view at 400 times magnification, where crystal
    micro-filaments stream past like a river seen from above, in false teal and magenta. Only the
    sharp teal plane is solid; the blurred magenta planes above and below pass through. The focus
    reticle threads a gap as bright charge pulses run along the filaments, two of three steadiness
    points remain, and the ring around the lens is two-thirds full toward the next captured plate."""
    r = p.rng
    p.paper("#05080b", grain=0.18)
    CX, CY, R = 560, 400, 330
    lens = p.clip(f'<circle cx="{CX}" cy="{CY}" r="{R}"/>')
    p.open("g", clip_path=lens)
    p.rect(CX - R, CY - R, 2 * R, 2 * R, fill=p.radial([(0, "#123a40", 1), (0.7, "#0a1c22", 1), (1, "#040607", 1)]))
    # noise texture mapped to false colour
    fid = p.uid("sem")
    p.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" '
           f'baseFrequency="0.035 0.012" numOctaves="4" seed="{p.seed % 500}"/>'
           f'<feColorMatrix values="0.9 0 0 0 0  0 0.2 0 0 0.1  0.3 0 0.9 0 0  0 0 0 0 0.35"/></filter>')
    p.rect(CX - R, CY - R, 2 * R, 2 * R, filter=f"url(#{fid})")
    # the too-regular lattice underneath
    d = []
    for _, _, hx, hy in p.hexgrid(26, 26, 22, CX - R - 20, CY - R - 20):
        pts = p.ngon(hx, hy, 22, 6, 30)
        d.append("M" + " L".join(f"{x:.0f},{y:.0f}" for x, y in pts) + "Z")
    p.path("".join(d), fill="none", stroke=TEAL, stroke_width=0.8, opacity=0.22)

    def strand(x0, amp, ph, wav):
        return [(x0 + amp * math.sin(y / wav + ph) + 18 * math.sin(y / 37 + ph * 3), y)
                for y in range(CY - R - 40, CY + R + 60, 40)]
    # far plane: blurred magenta
    far = p.blur(9)
    for k in range(10):
        pts = strand(CX - R + 30 + k * 70 + r.uniform(-20, 20), 50, r.uniform(0, 6), 110)
        p.path(p.smooth_d(pts), fill="none", stroke="#c2338f", stroke_width=r.uniform(14, 26), opacity=0.45,
               filter=far)
    # focus plane: crisp teal filaments
    strands = []
    for k in range(9):
        x0 = CX - R + 50 + k * 78 + r.uniform(-15, 15)
        if abs(x0 - (CX + 20)) < 40:
            x0 += 50
        pts = strand(x0, 34, r.uniform(0, 6), 90)
        strands.append(pts)
        dd = p.smooth_d(pts)
        w = r.uniform(10, 16)
        p.path(dd, fill="none", stroke="#0b5f5c", stroke_width=w + 6)
        p.path(dd, fill="none", stroke=TEAL, stroke_width=w)
        p.path(dd, fill="none", stroke="#b8fff0", stroke_width=w * 0.25, opacity=0.8,
               transform="translate(-3,0)")
        # surface texture: tiny bumps along it
        for (x, y) in pts[1:-1]:
            for _ in range(3):
                p.circle(x + r.uniform(-w / 2, w / 2), y + r.uniform(-20, 20), r.uniform(1, 2.4),
                         fill="#062e2e", opacity=0.6)
    # branches joining neighbours (rewiring)
    for k in range(len(strands) - 1):
        a = strands[k][r.randint(3, 12)]
        b = strands[k + 1][r.randint(3, 12)]
        p.path(f"M{a[0]:.0f},{a[1]:.0f} Q{(a[0] + b[0]) / 2:.0f},{(a[1] + b[1]) / 2 - 40:.0f} {b[0]:.0f},{b[1]:.0f}",
               fill="none", stroke=TEAL, stroke_width=4, opacity=0.85)
    # charge pulses
    glow = p.blur(6)
    for k in (1, 3, 5, 6, 7):
        i = r.randint(4, 14)
        x, y = strands[k][i]
        px, py = strands[k][i - 1]
        p.path(f"M{px:.0f},{py:.0f} L{x:.0f},{y:.0f}", stroke="#ff7fd8", stroke_width=10, opacity=0.6, filter=glow)
        p.circle(x, y, 14, fill="#ff4fc4", opacity=0.7, filter=glow)
        p.circle(x, y, 6, fill="#fff2fb")
    # near plane: huge soft magenta blobs
    near = p.blur(18)
    for _ in range(5):
        p.circle(CX + r.uniform(-R, R), CY + r.uniform(-R, R), r.uniform(40, 80), fill="#e0459f",
                 opacity=0.28, filter=near)
    # focus reticle in a gap
    fx, fy = CX + 30, CY + 40
    p.circle(fx, fy, 30, fill="none", stroke=COLD, stroke_width=2.5)
    p.circle(fx, fy, 4, fill=COLD)
    for a in range(0, 360, 90):
        c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
        p.line(fx + c * 18, fy + s * 18, fx + c * 44, fy + s * 44, stroke=COLD, stroke_width=2.5)
    p.close()
    # lens rim and progress ring
    p.circle(CX, CY, R, fill="none", stroke="#1e2a30", stroke_width=26)
    p.circle(CX, CY, R + 24, fill="none", stroke="#18242a", stroke_width=10)
    frac = 0.66
    a0 = -math.pi / 2
    a1 = a0 + 2 * math.pi * frac
    Rr = R + 24
    p.path(f"M{CX + Rr * math.cos(a0):.1f},{CY + Rr * math.sin(a0):.1f} A{Rr},{Rr} 0 1,1 "
           f"{CX + Rr * math.cos(a1):.1f},{CY + Rr * math.sin(a1):.1f}", fill="none", stroke=TEAL,
           stroke_width=10, stroke_linecap="round")
    for k in (1, 2, 3):
        a = a0 + 2 * math.pi * k / 3
        p.circle(CX + Rr * math.cos(a), CY + Rr * math.sin(a), 11, fill="#05080b",
                 stroke=TEAL if k < 2 else "#ff6fcf", stroke_width=3)
    for a in range(0, 360, 6):
        c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
        L = 10 if a % 30 == 0 else 5
        p.line(CX + c * (R - 13), CY + s * (R - 13), CX + c * (R - 13 + L), CY + s * (R - 13 + L),
               stroke="#6f8a90", stroke_width=1)
    # HUD
    hx = 960
    p.text(hx, 110, "×400", size=58, family="monospace", fill=COLD)
    p.text(hx, 150, "MAG 2 / 3", size=20, family="monospace", fill="#7fa7ad")
    p.text(hx, 220, "FOCUS PLANE", size=18, family="monospace", fill="#7fa7ad")
    for i in range(3):
        yy = 240 + i * 34
        on = i == 1
        p.rect(hx, yy, 160, 24, fill=TEAL if on else "none", stroke=TEAL if on else "#c2338f", stroke_width=2,
               opacity=1 if on else 0.6)
        p.text(hx + 10, yy + 18, ["upper  blur", "middle SOLID", "lower  blur"][i], size=15, family="monospace",
               fill="#05080b" if on else "#e07ac0")
    p.text(hx, 380, "STEADINESS", size=18, family="monospace", fill="#7fa7ad")
    for i in range(3):
        x = hx + 20 + i * 48
        p.poly([(x, 400), (x + 16, 420), (x, 440), (x - 16, 420)],
               fill=COLD if i < 2 else "none", stroke=COLD, stroke_width=2.5)
    p.text(hx, 500, "PLATE 2 at", size=18, family="monospace", fill="#7fa7ad")
    p.text(hx, 524, "next checkpoint", size=18, family="monospace", fill="#7fa7ad")
    p.text(hx, 590, "AFU 0.52", size=24, family="monospace", fill="#e07ac0")
    p.line(hx, 680, hx + 120, 680, stroke=COLD, stroke_width=5)
    p.text(hx, 706, "10 µm", size=18, family="monospace", fill=COLD)
    p.text(40, 60, "B1-LENS  FRAGMENT", size=18, family="monospace", fill="#7fa7ad")
    p.text(40, 770, "FLOW ↓", size=20, family="monospace", fill="#7fa7ad")


# ------------------------------------------------------------------------------------------------
@register(G, "assay")
def assay(p: Pic):
    """The Assay (1D): an oscilloscope shows the sample's spectrum as a phosphor-green trace on a
    graticule, with a fading ghost of the run before a reagent suppressed one peak. A band filter
    isolates 500 to 600 nm, and the cursor sits on a peak reading 512.4 nm, inside the two-nanometre
    precision. Beside the screen, three of five candidate compositions are struck out and three of
    six units of sample mass are spent."""
    r = p.rng
    p.paper("#26292a", grain=0.25)
    p.rect(14, 14, W - 28, H - 28, rx=26, fill="#33383a", stroke="#111", stroke_width=4)
    SX, SY, SW, SH = 60, 60, 780, 520
    p.rect(SX - 14, SY - 14, SW + 28, SH + 28, rx=22, fill="#111", stroke="#555c5e", stroke_width=3)
    p.rect(SX, SY, SW, SH, rx=10, fill=p.radial([(0, "#0f2a1a", 1), (1, "#030a06", 1)]))
    g = "#7dff9a"
    # graticule 10 x 8
    for i in range(11):
        x = SX + i * SW / 10
        p.line(x, SY, x, SY + SH, stroke=g, stroke_width=1 if i not in (0, 5, 10) else 1.6, opacity=0.25,
               stroke_dasharray=None if i in (0, 5, 10) else "2 5")
    for j in range(9):
        y = SY + j * SH / 8
        p.line(SX, y, SX + SW, y, stroke=g, stroke_width=1 if j not in (0, 4, 8) else 1.6, opacity=0.25,
               stroke_dasharray=None if j in (0, 4, 8) else "2 5")
    for i in range(51):
        x = SX + i * SW / 50
        p.line(x, SY + SH / 2 - 5, x, SY + SH / 2 + 5, stroke=g, stroke_width=1, opacity=0.35)
    for j in range(41):
        y = SY + j * SH / 40
        p.line(SX + SW / 2 - 5, y, SX + SW / 2 + 5, y, stroke=g, stroke_width=1, opacity=0.35)

    def nm_x(nm):
        return SX + (nm - 380) / 400 * SW
    peaks = [(432, 0.55, 9), (512.4, 0.9, 7), (548, 0.42, 12), (618, 0.68, 8), (694, 0.35, 14)]
    suppressed = (618, 0.68, 8)

    def trace(pk, noise):
        pts = []
        for i in range(0, 401, 2):
            nm = 380 + i
            v = 0.06 + sum(a * math.exp(-((nm - c) / w) ** 2) for c, a, w in pk) + r.uniform(-noise, noise)
            pts.append((nm_x(nm), SY + SH - 30 - v * (SH - 80)))
        return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    ghost = trace(peaks, 0.012)
    live = trace([pk for pk in peaks if pk != suppressed] + [(618, 0.12, 8)], 0.015)
    # band filter window
    p.rect(nm_x(500), SY, nm_x(600) - nm_x(500), SH, fill=g, opacity=0.07)
    for x in (nm_x(500), nm_x(600)):
        p.line(x, SY, x, SY + SH, stroke=g, stroke_width=2, opacity=0.6, stroke_dasharray="10 6")
    p.text(nm_x(500) + 8, SY + 26, "FILTER 500-600", size=16, family="monospace", fill=g, opacity=0.8)
    glow = p.blur(5)
    p.path(ghost, fill="none", stroke=g, stroke_width=2, opacity=0.25)
    p.path(live, fill="none", stroke=g, stroke_width=9, opacity=0.45, filter=glow)
    p.path(live, fill="none", stroke="#d8ffe0", stroke_width=2.2)
    # reagent note on the suppressed peak
    p.text(nm_x(618) - 40, SY + 150, "REAGENT 3", size=15, family="monospace", fill=g, opacity=0.6)
    p.path(f"M{nm_x(618)},{SY + 160} v40 l-6,-10 M{nm_x(618)},{SY + 200} l6,-10", stroke=g, stroke_width=1.5,
           fill="none", opacity=0.6)
    # candidate peak ticks (candidate B) along the bottom
    for c in (432, 512, 548, 700):
        p.line(nm_x(c), SY + SH - 22, nm_x(c), SY + SH - 4, stroke="#ffd36b", stroke_width=3)
    p.text(SX + 10, SY + SH - 8, "B", size=16, family="monospace", fill="#ffd36b")
    # cursor
    cx = nm_x(512.4)
    p.line(cx, SY, cx, SY + SH, stroke=COLD, stroke_width=2)
    p.circle(cx, SY + SH - 30 - 0.96 * (SH - 80), 10, fill="none", stroke=COLD, stroke_width=2.5)
    p.rect(cx + 14, SY + 50, 200, 58, fill="#03140a", stroke=COLD, stroke_width=1.5)
    p.text(cx + 24, SY + 76, "λ 512.4 nm", size=20, family="monospace", fill=COLD)
    p.text(cx + 24, SY + 100, "± 2  PRECISE", size=17, family="monospace", fill=g)
    for nm in range(400, 781, 50):
        p.text(nm_x(nm) - 14, SY + SH + 40, str(nm), size=14, family="monospace", fill="#aab3b0")
    # vernier beneath
    VY = SY + SH + 64
    p.rect(SX, VY, SW, 48, fill="#1d2122", stroke="#555c5e", stroke_width=2)
    for i in range(0, 161):
        x = SX + 10 + i * (SW - 20) / 160
        L = 18 if i % 10 == 0 else (12 if i % 5 == 0 else 7)
        p.line(x, VY + 2, x, VY + 2 + L, stroke="#cfd6d2", stroke_width=1)
    v0 = cx - 60
    for i in range(11):
        x = v0 + i * (SW - 20) / 160 * 0.9 * 1.0 + i * 0.4
        p.line(x, VY + 46, x, VY + 30 - (6 if i in (0, 5, 10) else 0), stroke="#ffd36b", stroke_width=1.5)
    p.line(v0 + 4 * ((SW - 20) / 160 * 0.9 + 0.4), VY + 20, v0 + 4 * ((SW - 20) / 160 * 0.9 + 0.4), VY + 48,
           stroke=SEAL, stroke_width=2.5)
    # right panel
    PX = 890
    p.text(PX, 86, "CANDIDATES", size=18, family="sans-serif", fill="#cfd6d2", font_weight="bold")
    cands = ["A  bark silicate", "B  aetheric lattice", "C  fungal resin", "D  storm-rock salt", "E  slag glass"]
    for i, c in enumerate(cands):
        y = 120 + i * 36
        p.text(PX, y, c, size=17, family="monospace", fill="#ffd36b" if i == 1 else "#cfd6d2")
        if i in (0, 3, 4):
            p.line(PX - 4, y - 6, PX + 210, y - 6, stroke=SEAL, stroke_width=3)
    p.text(PX, 330, "SAMPLE MASS", size=18, family="sans-serif", fill="#cfd6d2", font_weight="bold")
    for i in range(6):
        x = PX + 18 + i * 44
        lit = i < 3
        if lit:
            p.circle(x, 362, 16, fill=g, opacity=0.35, filter=glow)
        p.circle(x, 362, 12, fill=g if lit else "#20282a", stroke="#0b0e0f", stroke_width=2)
    # knobs
    for k, (kx, ky, lab) in enumerate([(PX + 50, 470, "λ"), (PX + 180, 470, "GAIN")]):
        p.circle(kx, ky, 44, fill="#1b1f20", stroke="#62696b", stroke_width=3)
        for a in range(0, 300, 20):
            ang = math.radians(a + 120)
            p.line(kx + 50 * math.cos(ang), ky + 50 * math.sin(ang), kx + 58 * math.cos(ang),
                   ky + 58 * math.sin(ang), stroke="#aab3b0", stroke_width=2)
        ang = math.radians(120 + r.uniform(60, 240))
        p.circle(kx, ky, 30, fill="#2b3133")
        p.line(kx, ky, kx + 28 * math.cos(ang), ky + 28 * math.sin(ang), stroke=COLD, stroke_width=4)
        p.text(kx - 20, ky + 80, lab, size=16, family="sans-serif", fill="#cfd6d2")
    # reagent rack
    for i in range(6):
        x = PX + 6 + i * 44
        p.rect(x, 600, 24, 70, rx=10, fill=["#c8913a", "#3fc4d0", "#9c4a25", "#5a3f7a", "#25c2a8", "#e7dcc3"][i],
               stroke="#0b0e0f", stroke_width=2, opacity=0.4 if i == 2 else 1)
        p.rect(x - 2, 592, 28, 12, fill="#62696b")
    p.rect(PX, 700, 130, 46, rx=6, fill="#1b1f20", stroke=g, stroke_width=2)
    p.text(PX + 22, 730, "RECORD", size=18, family="monospace", fill=g)
    p.rect(PX + 144, 700, 140, 46, rx=6, fill="#1b1f20", stroke="#ffd36b", stroke_width=2)
    p.text(PX + 160, 730, "CONCLUDE", size=18, family="monospace", fill="#ffd36b")


# ------------------------------------------------------------------------------------------------
def _leaf(cx, cy, length, width, ang):
    c, s = math.cos(ang), math.sin(ang)

    def tr(u, v):
        return cx + u * c - v * s, cy + u * s + v * c
    tip, (lx, ly), (rx, ry) = tr(length, 0), tr(length * 0.45, width), tr(length * 0.45, -width)
    d = (f"M{cx:.1f},{cy:.1f} Q{lx:.1f},{ly:.1f} {tip[0]:.1f},{tip[1]:.1f} "
         f"Q{rx:.1f},{ry:.1f} {cx:.1f},{cy:.1f}Z")
    return d, tr


@register(G, "key")
def key(p: Pic):
    """The Key (1D): a botanical plate in brown iron-gall ink. On the left a crystal-bark specimen is
    drawn leaf by leaf, with calipers measuring a leaf and a ruler beneath. On the right the branching
    couplet key: the lit couplet asks for the glow period, and because the specimen reached a name
    whose altitude it contradicts, a new couplet is being written into the key in pencil."""
    r = p.rng
    p.paper("#efe2c4", grain=0.3)
    for _ in range(14):  # foxing
        p.circle(r.uniform(30, W - 30), r.uniform(30, H - 30), r.uniform(4, 16), fill="#b07a3c", opacity=0.12,
                 filter=p.blur(3) if _ == 0 else None)
    p.rect(26, 26, W - 52, H - 52, fill="none", stroke=INK, stroke_width=2.5)
    p.rect(36, 36, W - 72, H - 72, fill="none", stroke=INK, stroke_width=0.8)
    p.text(W / 2 - 60, 74, "PLATE  XIV", size=26, family="serif", fill=INK, letter_spacing="4")
    ink = dict(stroke=INK, stroke_linecap="round")
    # stem
    base = (300, 690)
    stem = [base]
    x, y, a = base[0], base[1], -math.pi / 2
    for i in range(14):
        a += r.uniform(-0.12, 0.12) + 0.015
        x, y = x + 40 * math.cos(a), y + 40 * math.sin(a)
        stem.append((x, y))
    sd = p.smooth_d(stem)
    p.path(sd, fill="none", stroke=INK, stroke_width=7, **{"stroke_linecap": "round"})
    p.path(sd, fill="none", stroke="#efe2c4", stroke_width=2.4, transform="translate(-1.5,0)")
    # bark facets along the stem
    for (x1, y1), (x2, y2) in zip(stem, stem[1:]):
        p.line(x1 - 4, (y1 + y2) / 2, x1 + 4, (y1 + y2) / 2 - 6, stroke=INK, stroke_width=1.2)
    # leaves, alternate, hatched on their shaded side
    measured = None
    for i, (sx, sy) in enumerate(stem[2:-1], start=2):
        side = 1 if i % 2 else -1
        L = 150 - abs(i - 7) * 11 + r.uniform(-8, 8)
        ang = (-0.55 if side > 0 else math.pi + 0.55) + r.uniform(-0.15, 0.15) - 0.03 * (i - 7) * side
        d, tr = _leaf(sx, sy, L, L * 0.2, ang)
        clip = p.clip(f'<path d="{d}"/>')
        p.path(d, fill="#efe2c4")
        hx, hy = tr(L * 0.5, -L * 0.1)
        p.hatch(hx - L * 0.6, hy - L * 0.6, L * 1.2, L * 1.2, angle=math.degrees(ang) + 70, spacing=4.5,
                clip=p.clip(f'<path d="{d}"/><rect x="0" y="0" width="0" height="0"/>'), stroke=INK,
                stroke_width=0.8, opacity=0.8)
        # mask the lit half by repainting with paper on the other side of the midrib
        u0, v0 = tr(0, 0)
        p1, p2 = tr(L, 0), tr(L * 0.5, L * 0.4)
        p.open("g", clip_path=clip)
        p.poly([tr(-5, 0), tr(L + 5, 0), tr(L + 5, L), tr(-5, L)], fill="#efe2c4")
        p.close()
        p.path(d, fill="none", stroke=INK, stroke_width=2)
        p.line(u0, v0, p1[0], p1[1], stroke=INK, stroke_width=1.3)
        for t in (0.25, 0.42, 0.58, 0.72, 0.85):
            a1, b1 = tr(L * t, 0)
            for sgn in (1, -1):
                a2, b2 = tr(L * (t + 0.1), sgn * L * 0.13 * (1 - t))
                p.line(a1, b1, a2, b2, stroke=INK, stroke_width=0.8)
        if i == 7:
            measured = (tr, L)
    # glowing seed-pod facets at the top (crystalline)
    tx, ty = stem[-1]
    for k in range(5):
        pts = p.ngon(tx + r.uniform(-14, 14), ty - 10 - k * 16, 12 - k, 6, r.uniform(0, 60))
        p.poly(pts, fill="none", stroke=INK, stroke_width=1.6)
    p.stipple(base[0] - 70, base[1] - 10, 140, 50, n=420, r=(0.6, 1.5), fill=INK,
              density=lambda x, y: max(0, 1 - abs(x - base[0]) / 70))
    p.line(base[0] - 90, base[1] + 12, base[0] + 90, base[1] + 12, stroke=INK, stroke_width=1.5)
    # calipers on the measured leaf
    if measured:
        tr, L = measured
        off = -L * 0.32
        (ax, ay), (bx, by) = tr(0, off), tr(L, off)
        p.line(ax, ay, bx, by, stroke=INK, stroke_width=6, stroke_linecap="square")
        for u in (0, L):
            (j1x, j1y), (j2x, j2y) = tr(u, off), tr(u, -4 if u == 0 else -1)
            p.line(j1x, j1y, j2x, j2y, stroke=INK, stroke_width=4)
        mx, my = tr(L * 0.5, off * 1.35)
        p.text(mx - 30, my, f"{L * 0.3:.0f} mm", size=20, family="serif", font_style="italic", fill=INK)
    # ruler
    p.rect(90, 726, 420, 22, fill="#e9d9b5", stroke=INK, stroke_width=1.5)
    for i in range(0, 85):
        x = 96 + i * 5
        p.line(x, 726, x, 726 + (12 if i % 10 == 0 else 7 if i % 5 == 0 else 4), stroke=INK, stroke_width=0.8)
    p.text(520, 744, "fig. 1", size=18, family="serif", font_style="italic", fill=INK)
    # inset: magnified facet
    ix, iy, ir = 520, 200, 70
    p.circle(ix, iy, ir, fill="#efe2c4", stroke=INK, stroke_width=2)
    cl = p.clip(f'<circle cx="{ix}" cy="{iy}" r="{ir}"/>')
    p.open("g", clip_path=cl)
    for _, _, hx, hy in p.hexgrid(8, 8, 18, ix - 90, iy - 90):
        pts = p.ngon(hx, hy, 17, 6, 30)
        p.poly(pts, fill="none", stroke=INK, stroke_width=1.2)
        p.line(hx, hy - 17, hx, hy + 17, stroke=INK, stroke_width=0.5)
    p.close()
    p.text(ix - 26, iy + ir + 26, "fig. 2", size=18, family="serif", font_style="italic", fill=INK)
    p.line(stem[6][0] + 20, stem[6][1] - 10, ix - ir * 0.7, iy + ir * 0.7, stroke=INK, stroke_width=0.8,
           stroke_dasharray="3 4")
    # the key
    KX = 650
    p.line(620, 110, 620, 720, stroke=INK, stroke_width=0.8)
    couplets = [("1a", "Glow period under 4 s", "2"), ("1b", "Glow period 4 s or more", "5"),
                ("2a", "Leaf facets six or fewer", "3"), ("2b", "Leaf facets more than six", "4"),
                ("3a", "Leaf over 40 mm", "Glassleaf"), ("3b", "Leaf 40 mm or less", "4"),
                ("4a", "Found below 2 000 m", "Ash-fern"), ("4b", "Found above 2 000 m", "Spire-moss")]
    y0 = 140
    lit = 1
    rows = []
    for i, (n, txt, go) in enumerate(couplets):
        y = y0 + i * 58 + (i // 2) * 12
        rows.append(y)
        if i == lit:
            p.rect(KX - 10, y - 26, 520, 38, fill="#e3c98f", opacity=0.6)
        p.text(KX, y, f"{n}.", size=21, family="serif", font_weight="bold", fill=INK)
        p.text(KX + 44, y, txt, size=21, family="serif", fill=INK)
        dots = "." * max(3, 30 - len(txt))
        p.text(KX + 44 + len(txt) * 10.2, y, dots, size=21, family="serif", fill=INK, opacity=0.6)
        p.text(KX + 420, y, go, size=21, family="serif", font_style="italic" if not go.isdigit() else None,
               fill=INK)
    # branching brackets
    for k in range(0, len(rows), 2):
        p.path(f"M{KX - 18},{rows[k] - 6} h-8 V{rows[k + 1] - 6} h8", fill="none", stroke=INK, stroke_width=1.5)
    # the anomaly: struck name and a pencil couplet
    p.line(KX + 418, rows[6] - 7, KX + 510, rows[6] - 7, stroke=INK, stroke_width=2)
    p.text(KX + 44, rows[6] + 24, "but measured at 2 640 m", size=17, family="serif", font_style="italic",
           fill=PENCIL)
    py = rows[7] + 64
    p.path(f"M{KX + 30},{rows[6] + 34} l10,14 l10,-14", fill="none", stroke=PENCIL, stroke_width=2)
    p.text(KX, py, "4c.", size=22, family="serif", fill=PENCIL, font_style="italic")
    p.text(KX + 44, py, "Glow period 6 s; above 2 400 m", size=22, family="serif", fill=PENCIL,
           font_style="italic", transform=f"rotate(-1.5 {KX} {py})")
    p.text(KX + 470, py, "new", size=22, family="serif", fill=PENCIL, font_style="italic")
    p.wobble([(KX - 6, py + 12), (KX + 400, py + 8)], amp=1.4, step=18, stroke=PENCIL, stroke_width=1.2)
    # pencil tip
    p.poly([(KX + 390, py - 2), (KX + 460, py + 58), (KX + 448, py + 70), (KX + 380, py + 8)], fill="#d9b25b",
           stroke=INK, stroke_width=1.2)
    p.poly([(KX + 374, py - 10), (KX + 390, py - 2), (KX + 380, py + 8)], fill=PENCIL)


# ------------------------------------------------------------------------------------------------
@register(G, "storm-song-cipher")
def storm_song_cipher(p: Pic):
    """Storm-Song Cipher (1D): Mara's song in square neumes on a red four-line staff, above the
    player's own transcription in pencil with the next note waiting at the cursor. Under each neume
    its interval is read as a bearing, 30 degrees a step, and each rest as 100 m; a breath mark ends
    the phrase. On the right the decoded bearings and distances are plotted as a pencil path across
    the peak map, ending on the ring of a located node."""
    r = p.rng
    p.paper("#f0e2bf", grain=0.32)
    p.vignette(0.35, "#6b4a1e")
    RED = "#a8281e"
    # melody: (pitch 0..7, kind) ; kind: note, pes (two rising), rest, breath
    seq = []
    pitch = 3
    for i in range(15):
        if i in (4, 9, 12):
            seq.append(("rest", pitch))
        elif i == 14:
            seq.append(("breath", pitch))
        else:
            pitch = max(0, min(7, pitch + r.choice([-2, -1, 1, 1, 2])))
            seq.append(("pes" if r.random() < 0.3 else "note", pitch))

    def staff(x0, y0, w, sp, color=RED):
        for k in range(4):
            p.line(x0, y0 + k * sp, x0 + w, y0 + k * sp, stroke=color, stroke_width=2)

    def draw_seq(x0, y0, sp, upto, fill, labels, cursor=False):
        x = x0 + 70
        # C clef
        cy = y0 + sp
        p.path(f"M{x0 + 20},{cy - sp * 0.5} h14 v{sp * 1.0} h-14 M{x0 + 20},{cy - sp * 0.5} v{sp}", fill="none",
               stroke=fill, stroke_width=5)
        out = []
        prev = 3
        for i, (kind, pt) in enumerate(seq):
            if i >= upto:
                if cursor and i == upto:
                    yy = y0 + 3 * sp - pt * sp / 2
                    p.rect(x - 9, yy - 9, 18, 18, fill="none", stroke=PENCIL, stroke_width=2,
                           stroke_dasharray="3 3")
                    p.poly([(x + 14, yy + 30), (x + 6, yy + 12), (x + 22, yy + 12)], fill=PENCIL)
                break
            yy = y0 + 3 * sp - pt * sp / 2
            if kind == "rest":
                p.line(x, y0 + sp * 0.5, x, y0 + sp * 2.5, stroke=fill, stroke_width=3)
                lab = "100m"
            elif kind == "breath":
                p.line(x, y0 - 8, x, y0 + 3 * sp + 8, stroke=fill, stroke_width=4)
                p.line(x + 10, y0 - 8, x + 10, y0 + 3 * sp + 8, stroke=fill, stroke_width=4)
                p.path(f"M{x - 6},{y0 - 34} q10,-4 6,12", fill="none", stroke=fill, stroke_width=4)
                lab = "node"
            else:
                step = pt - prev
                p.rect(x - 9, yy - 9, 18, 18, fill=fill, transform=f"rotate({r.uniform(-4, 4):.1f} {x} {yy})")
                if kind == "pes":
                    p.rect(x - 9, yy - 9 - sp / 2, 18, 18, fill=fill)
                    p.line(x + 8, yy - sp / 2, x + 8, yy + 4, stroke=fill, stroke_width=3)
                    step += 1
                lab = f"{step:+d}  {step * 30:+d}°"
                prev = pt
            out.append((kind, lab))
            if labels:
                col = RED if kind in ("note", "pes") else INK
                for li, part in enumerate(lab.split()[:2] if kind in ("note", "pes") else [lab]):
                    p.text(x - 15, y0 + 3 * sp + 30 + li * 18, part, size=14, family="monospace", fill=col)
            x += 38
        return out

    # initial
    p.rect(40, 50, 92, 104, fill="#2b4a7a", stroke=INK, stroke_width=2)
    p.text(54, 136, "S", size=96, family="serif", fill="#e8c35a", font_weight="bold")
    for k in range(10):
        a = r.uniform(0, 6.28)
        p.path(f"M{86 + 50 * math.cos(a):.0f},{102 + 56 * math.sin(a):.0f} q{r.uniform(-30, 30):.0f},"
               f"{r.uniform(-30, 30):.0f} {r.uniform(-40, 40):.0f},{r.uniform(-40, 40):.0f}",
               fill="none", stroke=RED, stroke_width=1.4)
    p.text(150, 80, "Storm-song of the Peakborn, as sung", size=24, family="serif", font_style="italic", fill=INK)
    staff(150, 120, 620, 28)
    decoded = draw_seq(150, 120, 28, len(seq), INK, True)
    p.text(150, 300, "Transcription", size=22, family="serif", font_style="italic", fill=PENCIL)
    staff(150, 340, 620, 28)
    draw_seq(150, 340, 28, 9, PENCIL, False, cursor=True)
    # playback bar
    p.rect(150, 500, 620, 16, fill="none", stroke=INK, stroke_width=1.5)
    p.rect(150, 500, 330, 16, fill=INK, opacity=0.7)
    p.poly([(120, 498), (138, 508), (120, 518)], fill=INK)
    # correlation table
    tx, ty = 150, 560
    p.text(tx, ty, "Correlation", size=22, family="serif", font_style="italic", fill=INK)
    for k, (a, b) in enumerate([("interval 1", "30°"), ("interval 2", "60°"), ("interval 3", "90°"),
                                ("rest", "100 m"), ("breath", "new node")]):
        y = ty + 34 + k * 32
        p.text(tx, y, a, size=19, family="serif", fill=INK)
        p.text(tx + 200, y, b, size=19, family="serif", fill=RED)
        p.line(tx, y + 8, tx + 330, y + 8, stroke=INK, stroke_width=0.5, opacity=0.5)
    # peak map with plotted path
    MX, MY, MS = 820, 120, 340
    p.rect(MX, MY, MS, MS * 1.6, fill="#f6ead0", stroke=INK, stroke_width=2)
    p.grid(MX, MY, MS, MS * 1.6, 36, stroke=INK, stroke_width=0.5, opacity=0.4)
    cl = p.clip(f'<rect x="{MX}" y="{MY}" width="{MS}" height="{MS * 1.6}"/>')
    p.open("g", clip_path=cl)
    for k in range(7):
        cx, cy = MX + MS * 0.65, MY + MS * 0.45
        pts = [(cx + (30 + k * 34) * math.cos(t / 20 * 6.283) * (1 + 0.15 * math.sin(t * 1.7 + k)),
                cy + (40 + k * 40) * math.sin(t / 20 * 6.283) * (1 + 0.12 * math.cos(t * 1.3)))
               for t in range(20)]
        p.path(p.smooth_d(pts, closed=True), fill="none", stroke="#8a6a3a", stroke_width=1, opacity=0.6)
    p.close()
    x, y, bearing = MX + 70, MY + MS * 1.45, -60.0
    path = [(x, y)]
    for kind, lab in decoded:
        if kind in ("note", "pes"):
            bearing += int(lab.split()[1].rstrip("°"))
        elif kind == "rest":
            pass
        if kind in ("note", "pes", "rest"):
            step = 70 if kind == "rest" else 26
            x += step * math.cos(math.radians(bearing))
            y += step * math.sin(math.radians(bearing))
            x, y = min(MX + MS - 20, max(MX + 20, x)), min(MY + MS * 1.6 - 20, max(MY + 20, y))
            path.append((x, y))
    p.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in path), fill="none", stroke=PENCIL, stroke_width=3,
           stroke_linejoin="round")
    for a, b in path[1:-1]:
        p.circle(a, b, 3, fill=PENCIL)
    p.circle(*path[0], 7, fill=INK)
    ex, ey = path[-1]
    p.circle(ex, ey, 18, fill="none", stroke=RED, stroke_width=3.5)
    p.circle(ex, ey, 30, fill="none", stroke=RED, stroke_width=1.5)
    p.text(ex + 34, ey + 6, "N7", size=24, family="serif", font_weight="bold", fill=RED)
    p.text(MX, MY - 14, "Peak map, sheet 3", size=20, family="serif", font_style="italic", fill=INK)


# ------------------------------------------------------------------------------------------------
@register(G, "journal-audit")
def journal_audit(p: Pic):
    """Journal Audit (1D): a page of Lira's field log lies in a dossier, with black bars where it was
    redacted. Each line is being marked as hers, forged, or another hand: seal-red FORGED stamps sit
    on two lines, a small slanted note in the archivist's blue ink corrects a third, and the loupe
    shows that a forged line writes "deg" where Lira writes the degree sign. A tally counts the lines
    checked."""
    r = p.rng
    p.paper("#1d1f22", grain=0.3)
    # manila folder under the page
    p.poly([(70, 60), (1150, 40), (1170, 770), (90, 790)], fill="#c9a86a", stroke="#6b5532", stroke_width=2)
    p.poly([(900, 40), (1060, 30), (1070, 60), (910, 70)], fill="#c9a86a", stroke="#6b5532", stroke_width=2)
    p.open("g", transform="rotate(-1.2 600 400)")
    p.rect(120, 70, 960, 690, fill="#f4efe2", stroke="#999", stroke_width=1)
    p.text(150, 118, "CONTINUUM  /  RECOVERED FIELD LOG  /  FILE 12-C", size=20, family="monospace", fill=BLACK,
           font_weight="bold")
    p.line(150, 132, 1050, 132, stroke=BLACK, stroke_width=2)
    # lines of the log
    LY0, LH = 176, 40
    kinds = ["hers", "forged", "hers", "redact", "hers", "other", "hers", "forged", "redact", "hers", "hers",
             "hers", "redact", "hers"]
    marks = {0: "H", 1: "F", 2: "H", 4: "H", 5: "O", 6: "H", 7: "F", 9: "H"}
    loupe_line = 7
    for i, k in enumerate(kinds):
        y = LY0 + i * LH
        day = 112 + i
        node = r.randint(1, 11)
        alt = r.randint(18, 46) * 100
        val = r.uniform(0.1, 0.9)
        if k == "forged":
            txt = f"D{day}  0{r.randint(1, 9)}:{r.randint(10, 59)}  N{node}  {alt} m  bearing 214 deg  gamma nominal"
        else:
            txt = f"D{day}  {r.randint(5, 21):02d}:{r.randint(10, 59)}  N{node}  {alt} m  Δφ {val:.2f}  bark glow {r.randint(2, 7)} s"
        if k == "redact":
            p.text(200, y, txt[:18], size=19, family="monospace", fill=BLACK)
            p.rect(200 + 18 * 11.4, y - 19, r.uniform(380, 640), 25, fill=BLACK)
        else:
            p.text(200, y, txt, size=19, family="monospace", fill=BLACK if k != "forged" else "#222")
        # margin box
        p.rect(150, y - 19, 26, 26, fill="none", stroke=BLACK, stroke_width=1.5)
        m = marks.get(i)
        if m:
            col = {"H": INK, "F": SEAL, "O": ARCH}[m]
            p.text(155, y + 1, m, size=20, family="serif", font_weight="bold", fill=col)
        if k == "forged":
            p.rect(196, y - 22, 760, 32, fill="none", stroke=SEAL, stroke_width=2, rx=6)
    # archivist's note above line 5
    ay = LY0 + 5 * LH - 24
    p.text(640, ay, "not her reading: see field card, D117", size=17, family="serif", font_style="italic",
           fill=ARCH, transform=f"rotate(-6 640 {ay})")
    p.path(f"M630,{ay - 4} q-30,6 -40,22", fill="none", stroke=ARCH, stroke_width=1.5)
    # stamps
    stamp_f = p.roughen(4, 0.08)
    for (sx, sy, rot) in ((860, LY0 + 1 * LH - 2, -8), (900, LY0 + 7 * LH + 2, 6)):
        p.open("g", transform=f"rotate({rot} {sx} {sy})", filter=stamp_f, opacity=0.85)
        p.rect(sx - 92, sy - 26, 184, 50, fill="none", stroke=SEAL, stroke_width=5, rx=4)
        p.text(sx - 74, sy + 12, "FORGED", size=34, family="sans-serif", font_weight="bold", fill=SEAL,
               letter_spacing="3")
        p.close()
    # round seal
    p.open("g", filter=stamp_f, opacity=0.8)
    p.circle(980, 620, 62, fill="none", stroke=SEAL, stroke_width=4)
    p.circle(980, 620, 48, fill="none", stroke=SEAL, stroke_width=1.5)
    for a in range(0, 360, 15):
        c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
        p.line(980 + 50 * c, 620 + 50 * s, 980 + 58 * c, 620 + 58 * s, stroke=SEAL, stroke_width=2)
    p.text(944, 628, "AUDIT", size=22, family="sans-serif", font_weight="bold", fill=SEAL)
    p.close()
    p.close()
    # loupe over the forged line
    lx, ly, lr = 640, LY0 + loupe_line * LH + 70, 92
    p.line(lx + lr * 0.7, ly + lr * 0.7, lx + lr * 1.5, ly + lr * 1.5, stroke="#2a2a2a", stroke_width=26,
           stroke_linecap="round")
    p.circle(lx, ly, lr + 8, fill="#3a3d40")
    cl = p.clip(f'<circle cx="{lx}" cy="{ly}" r="{lr}"/>')
    p.open("g", clip_path=cl)
    p.rect(lx - lr, ly - lr, 2 * lr, 2 * lr, fill="#fbf8ee")
    p.text(lx - 84, ly + 12, "214 deg", size=40, family="monospace", fill="#222")
    p.line(lx + 10, ly + 24, lx + 84, ly + 24, stroke=SEAL, stroke_width=4)
    p.rect(lx - lr, ly - lr, 2 * lr, 2 * lr, fill=p.radial([(0.6, "#ffffff", 0), (1, "#7a8a96", 0.6)]))
    p.close()
    p.circle(lx, ly, lr, fill="none", stroke="#c9ced2", stroke_width=3)
    # tally
    p.rect(980, 90, 170, 64, fill=BLACK)
    p.text(996, 118, "CHECKED", size=16, family="monospace", fill=COLD)
    p.text(996, 144, "9 / 14", size=24, family="monospace", fill=COLD, font_weight="bold")
    # tool tray
    TY = 720
    p.rect(110, TY, 980, 66, fill="#2b2e31", stroke="#55595d", stroke_width=2, rx=8)
    for i, (lab, col) in enumerate([("HERS", INK), ("FORGED", SEAL), ("OTHER HAND", ARCH)]):
        x = 130 + i * 170
        p.rect(x, TY + 12, 156, 42, fill=COLD if i else "#e9dcc0", stroke=col, stroke_width=3, rx=4)
        p.text(x + 14, TY + 40, lab, size=18, family="sans-serif", font_weight="bold", fill=col)
    for i, lab in enumerate(["loupe", "field card", "clock"]):
        x = 680 + i * 140
        p.circle(x, TY + 33, 16, fill="none", stroke=COLD, stroke_width=2.5)
        if lab == "clock":
            p.path(f"M{x},{TY + 33} v-10 M{x},{TY + 33} h8", stroke=COLD, stroke_width=2.5, fill="none")
        p.text(x + 24, TY + 40, lab, size=16, family="sans-serif", fill=COLD)


# ------------------------------------------------------------------------------------------------
def _contours(field, x0, y0, s, levels):
    """Marching squares: one path string per level."""
    rows, cols = len(field), len(field[0])
    out = {}
    for L in levels:
        segs = []
        for j in range(rows - 1):
            for i in range(cols - 1):
                a, b, c, d = field[j][i], field[j][i + 1], field[j + 1][i + 1], field[j + 1][i]
                idx = (a > L) * 8 + (b > L) * 4 + (c > L) * 2 + (d > L)
                if idx in (0, 15):
                    continue
                X, Y = x0 + i * s, y0 + j * s

                def lerp(p1, p2, q1, q2):
                    t = (L - q1) / (q2 - q1)
                    return p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t
                top = lerp((X, Y), (X + s, Y), a, b)
                right = lerp((X + s, Y), (X + s, Y + s), b, c)
                bot = lerp((X, Y + s), (X + s, Y + s), d, c)
                left = lerp((X, Y), (X, Y + s), a, d)
                table = {1: [(left, bot)], 2: [(bot, right)], 3: [(left, right)], 4: [(top, right)],
                         5: [(left, top), (bot, right)], 6: [(top, bot)], 7: [(left, top)], 8: [(left, top)],
                         9: [(top, bot)], 10: [(top, right), (left, bot)], 11: [(top, right)], 12: [(left, right)],
                         13: [(bot, right)], 14: [(left, bot)]}
                for (p1, p2) in table[idx]:
                    segs.append(f"M{p1[0]:.0f},{p1[1]:.0f}L{p2[0]:.0f},{p2[1]:.0f}")
        out[L] = "".join(segs)
    return out


def _mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return [a[k] + (b[k] - a[k]) * t for k in range(3)]


@register(G, "node-board")
def node_board(p: Pic):
    """The Node Board (1D): the core board laid on a Swiss-style shaded relief map of the Peaks, with
    contours and twelve nodes joined by coupling lines whose thickness is their strength. Emitters sit
    on numbered firing slots; two opposite-phase emitters have cancelled one edge to a dashed line.
    After the trigger, damped nodes show green rings and amplifying ones red starbursts, N12 among
    them, and the Strain bar at the top stays over the calm line."""
    r = p.rng
    p.paper("#ece6d6", grain=0.15)
    MX, MY, MW, MH = 210, 100, 750, 600
    # peaks
    peaks = []
    tries = 0
    while len(peaks) < 12 and tries < 20000:
        tries += 1
        cx, cy = r.uniform(MX + 70, MX + MW - 70), r.uniform(MY + 70, MY + MH - 70)
        if all(math.hypot(cx - a, cy - b) > 125 for a, b, *_ in peaks):
            peaks.append((cx, cy, r.uniform(0.45, 0.8), r.uniform(55, 95)))
    # N12: the highest, nearest the centre
    peaks.sort(key=lambda q: math.hypot(q[0] - (MX + MW / 2), q[1] - (MY + MH / 2)))
    peaks[0] = (peaks[0][0], peaks[0][1], 1.15, 120)

    def h(x, y):
        v = sum(a * math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s)) for cx, cy, a, s in peaks)
        v += 0.06 * math.sin(x / 41 + y / 67) + 0.04 * math.sin(x / 19 - y / 29)
        return v
    S = 8
    cols, rows = MW // S + 1, MH // S + 1
    field = [[h(MX + i * S, MY + j * S) for i in range(cols)] for j in range(rows)]
    # shaded relief cells, blurred
    C = 3  # field step per cell (24 px)
    tints = [(0.0, "#9fb88a"), (0.3, "#c9cf9c"), (0.55, "#e2d6ad"), (0.8, "#d9dfe6"), (1.1, "#ffffff")]

    def tint(v):
        for (a, ca), (b, cb) in zip(tints, tints[1:]):
            if v <= b:
                return _mix(ca, cb, max(0, (v - a) / (b - a)))
        return _mix(tints[-1][1], tints[-1][1], 0)
    clip = p.clip(f'<rect x="{MX}" y="{MY}" width="{MW}" height="{MH}"/>')
    p.open("g", clip_path=clip)
    p.open("g", filter=p.blur(7))
    lx, ly, lz = -0.6, -0.6, 0.53
    for j in range(0, rows - 1, C):
        for i in range(0, cols - 1, C):
            i2, j2 = min(i + C, cols - 1), min(j + C, rows - 1)
            dzdx = (field[j][i2] - field[j][i]) / (S * C) * 160
            dzdy = (field[j2][i] - field[j][i]) / (S * C) * 160
            n = math.sqrt(dzdx * dzdx + dzdy * dzdy + 1)
            shade = max(0.0, (-dzdx * lx - dzdy * ly + lz) / n)
            col = tint(field[j][i])
            k = 0.55 + 0.75 * shade
            # violet shadows, as in the dusk palette
            rgb = [min(255, int(col[0] * k + (1 - k) * 40)), min(255, int(col[1] * k + (1 - k) * 20)),
                   min(255, int(col[2] * k + (1 - k) * 90))]
            p.rect(MX + i * S - 6, MY + j * S - 6, S * C + 12, S * C + 12,
                   fill="#%02x%02x%02x" % tuple(max(0, v) for v in rgb))
    p.close()
    levels = [0.1 + 0.1 * k for k in range(11)]
    paths = _contours(field, MX, MY, S, levels)
    for k, L in enumerate(levels):
        idx = k % 5 == 4
        p.path(paths[L], fill="none", stroke="#8a6a3a" if L < 0.75 else "#5f7fa0",
               stroke_width=1.6 if idx else 0.7, opacity=0.85)
    p.close()
    p.rect(MX, MY, MW, MH, fill="none", stroke=INK, stroke_width=2.5)
    # nodes and edges
    nodes = [(cx, cy) for cx, cy, *_ in peaks]
    order = list(range(12))  # 0 is N12
    label = {0: "N12"}
    rest = sorted(range(1, 12), key=lambda q: (nodes[q][1], nodes[q][0]))
    for n, q in enumerate(rest, start=1):
        label[q] = f"N{n}"
    edges = set()
    for a in order:
        near = sorted((math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]), b) for b in order if b != a)
        for _, b in near[:3 if a else 4]:
            edges.add(tuple(sorted((a, b))))
    edges = sorted(edges)
    K = {e: r.choice([1, 1.5, 2, 3]) for e in edges}
    emit = {q: s for q, s in zip(rest[::2], [1, 4, 2, 5, 3, 6])}
    cancelled = None
    for (a, b) in edges:
        if a in emit and b in emit:
            cancelled = (a, b)
            emit[b] = (emit[a] + 2) % 6 + 1 if False else ((emit[a] + 2) % 6) + 1
            break
    load = {q: sum(K[e] for e in edges if q in e and e != cancelled) for q in order}
    amp = {0} | {q for q in rest if load[q] > sorted(load[x] for x in rest)[-4]}
    for e in edges:
        (x1, y1), (x2, y2) = nodes[e[0]], nodes[e[1]]
        if e == cancelled:
            p.line(x1, y1, x2, y2, stroke=INK, stroke_width=2, stroke_dasharray="6 6", opacity=0.6)
            p.text((x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8, "K 0", size=15, family="sans-serif", fill=INK,
                   font_weight="bold")
            continue
        w = 2.5 * K[e]
        p.line(x1, y1, x2, y2, stroke="#ffffff", stroke_width=w + 4, opacity=0.8)
        p.line(x1, y1, x2, y2, stroke="#2f2a3a" if 0 not in e else VIOLET, stroke_width=w)
    for q in order:
        x, y = nodes[q]
        if q in amp:
            pts = p.star_pts(x, y, 30 if q == 0 else 24, 12, n=8 if q == 0 else 6)
            p.poly(pts, fill=SEAL, stroke="#ffffff", stroke_width=2)
            p.circle(x, y, 7, fill="#ffffff")
        else:
            p.circle(x, y, 18, fill="#ffffff", stroke="#1f7a4a", stroke_width=7)
            p.circle(x, y, 6, fill="#1f7a4a")
        p.text(x + 26, y - 14, label[q], size=17 if q else 20, family="sans-serif", font_weight="bold",
               fill=INK, stroke="#ffffff", stroke_width=3, paint_order="stroke")
        if q in emit:
            p.poly([(x - 30, y + 20), (x - 18, y + 32), (x - 30, y + 44), (x - 42, y + 32)], fill=TEAL,
                   stroke=INK, stroke_width=1.5)
            p.text(x - 35, y + 38, str(emit[q]), size=14, family="sans-serif", font_weight="bold", fill=INK)
    # Strain bar
    BX, BY, BW = MX, 34, MW
    p.text(20, 58, "STRAIN", size=20, family="sans-serif", font_weight="bold", fill=INK)
    p.rect(BX, BY, BW, 34, fill="#ffffff", stroke=INK, stroke_width=2)
    p.rect(BX, BY, BW * 0.68, 34, fill=SEAL)
    p.hatch(BX, BY, BW * 0.68, 34, angle=45, spacing=8, stroke="#ffffff", stroke_width=1.2, opacity=0.4,
            clip=p.clip(f'<rect x="{BX}" y="{BY}" width="{BW * 0.68}" height="34"/>'))
    for v, lab, dash in ((0.5, "true γ/2", None), (0.62, "shown γ/2", "5 4")):
        x = BX + BW * v
        p.line(x, BY - 8, x, BY + 42, stroke=INK, stroke_width=3, stroke_dasharray=dash)
        p.text(x - 30, BY + 60, lab, size=14, family="sans-serif", fill=INK)
    # companion cards
    for i, (nm, act, n) in enumerate([("MARA", "Sing", "×2"), ("KADE", "Scout", "×1"), ("JOREN", "Retune", "×1")]):
        y = 130 + i * 160
        p.rect(30, y, 150, 140, rx=8, fill="#f7f3ea", stroke=INK, stroke_width=2)
        p.rect(30, y, 150, 34, rx=8, fill=VIOLET)
        p.text(44, y + 24, nm, size=18, family="sans-serif", font_weight="bold", fill="#ffffff")
        p.text(44, y + 80, act, size=26, family="serif", fill=INK)
        p.text(44, y + 116, n, size=20, family="sans-serif", fill=INK)
    # emitter tray and slot wheel
    WX, WY, WR = 1075, 230, 80
    p.text(985, 120, "EMITTERS", size=18, family="sans-serif", font_weight="bold", fill=INK)
    for k in range(7):
        x = 1000 + (k % 4) * 44
        y = 140 + (k // 4) * 0
        if k < 4:
            pass
    for k in range(6):
        a = math.radians(-90 + k * 60)
        p.line(WX, WY, WX + WR * math.cos(a), WY + WR * math.sin(a), stroke=INK, stroke_width=1)
        tx, ty = WX + (WR + 18) * math.cos(a), WY + (WR + 18) * math.sin(a)
        p.text(tx - 5, ty + 6, str(k + 1), size=16, family="sans-serif", font_weight="bold", fill=INK)
    p.circle(WX, WY, WR, fill="none", stroke=INK, stroke_width=2.5)
    p.circle(WX, WY, 10, fill=INK)
    p.path(f"M{WX},{WY} L{WX + WR * 0.9 * math.cos(math.radians(30)):.1f},"
           f"{WY + WR * 0.9 * math.sin(math.radians(30)):.1f}", stroke=TEAL, stroke_width=6, stroke_linecap="round")
    p.text(990, 350, "φ = slot × 2π/N", size=17, family="serif", font_style="italic", fill=INK)
    for k in range(7):
        x, y = 1000 + (k % 4) * 44, 400 + (k // 4) * 50
        p.poly([(x, y), (x + 14, y + 14), (x, y + 28), (x - 14, y + 14)], fill=TEAL if k >= 6 else "none",
               stroke=INK, stroke_width=1.5, opacity=1 if k >= 6 else 0.5)
    p.text(990, 500, "1 left", size=16, family="sans-serif", fill=INK)
    # legend
    p.circle(1000, 560, 12, fill="#ffffff", stroke="#1f7a4a", stroke_width=5)
    p.text(1022, 566, "damped", size=17, family="sans-serif", fill=INK)
    p.poly(p.star_pts(1000, 600, 16, 7, 6), fill=SEAL)
    p.text(1022, 606, "amplifies", size=17, family="sans-serif", fill=INK)
    for k, w in enumerate((1, 1.5, 2, 3)):
        p.line(990, 640 + k * 18, 1040, 640 + k * 18, stroke="#2f2a3a", stroke_width=2.5 * w)
        p.text(1050, 646 + k * 18, f"K {w}", size=14, family="sans-serif", fill=INK)
    # Lira's equation in the margin
    p.text(MX, 752, "λmax(L) < γ/2", size=30, family="serif", font_style="italic", fill=INK,
           transform=f"rotate(-1 {MX} 752)")
    p.text(MX + 260, 752, "terraces held: 7 of 11", size=22, family="serif", font_style="italic", fill=PENCIL)
    p.rect(1000, 700, 170, 52, rx=6, fill=BLACK)
    p.text(1022, 734, "TRIGGER", size=22, family="sans-serif", font_weight="bold", fill=COLD)

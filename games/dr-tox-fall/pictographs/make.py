"""Dr. Tox: Fall gameplay pictographs. Built by tools/pictographs/build.py."""
import math

from core import H, W, Pic, f, register

G = "dr-tox-fall"

# palette (DESIGN.md section 15): the bible's colour grammar, Part VI, Dr. Tox section 6
TEAL, TEAL2, TEAL3 = "#5E7375", "#8A9A99", "#C4CDCB"     # the world: institutional indifference
AMBER, GOLD = "#D99A2B", "#F2C14E"                        # contained: the cage holding; HOPE's light, turned
GREEN = "#7FD957"                                         # loose: the toxin unbound
BLOOD, BLOOD2 = "#1A0B0C", "#4A0F14"                      # his blood
WHITE = "#E9ECEA"                                         # clinical white, memory
RUST, OCHRE = "#9C4A2A", "#C98F3B"                        # Rostova's spores (dr-tox/SCOPE.md section 3)
SKY = "#7FA9D6"                                           # Sky Room's painted blue: Cally's colour
SHROUD = "#5F6F5A"                                        # the shroud: desaturated green technical cloth
INK = "#141414"


def person_d(x, y, s=1.0, lean=0.0, hunch=0.0):
    """A plain standing person, feet at (x, y): head, shoulders, coat. Returns path data."""
    h = 120 * s
    pts = [(x - 9 * s + lean, y - h), (x + 9 * s + lean, y - h), (x + 11 * s + lean, y - h + 20 * s),
           (x + 6 * s + lean, y - h + 28 * s), (x + 24 * s + lean * 0.6 + hunch, y - h + 40 * s),
           (x + 22 * s, y - 40 * s), (x + 14 * s, y), (x + 3 * s, y), (x, y - 36 * s), (x - 3 * s, y),
           (x - 14 * s, y), (x - 22 * s, y - 40 * s), (x - 24 * s + lean * 0.6 + hunch, y - h + 40 * s),
           (x - 6 * s + lean, y - h + 28 * s), (x - 11 * s + lean, y - h + 20 * s)]
    return "M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts) + "Z"


def tox_d(x, y, s=1.0):
    """Dr. Tox in the shroud: narrow, vertical, contained (bible Part VI section 8), the hood up."""
    h = 160 * s
    pts = [(x - 10 * s, y - h), (x + 10 * s, y - h), (x + 16 * s, y - h + 26 * s), (x + 20 * s, y - h + 44 * s),
           (x + 26 * s, y - 10 * s), (x + 30 * s, y), (x - 30 * s, y), (x - 26 * s, y - 10 * s),
           (x - 20 * s, y - h + 44 * s), (x - 16 * s, y - h + 26 * s)]
    return "M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts) + "Z"


# ---- 2D: Crowd thread (underground comix crosshatch) --------------------------------------------
@register(G, "crowd-thread")
def crowd_thread(p: Pic):
    """Crowd thread (2D): a relief-hall queue side-on in dense underground-comix crosshatching on
    cheap off-white paper. The plague-marked stand packed shoulder to shoulder, lumpy and tired, drawn
    in heavy pen. Dr. Tox moves left to right through the queue in his shroud; around him a ring of
    bare white paper is his breath radius, and nobody may stand in it. Where the queue presses close
    the ring is pinched; a gap ahead is marked with an arrow. A hand-lettered sign over the shutter and
    a Pulse line along the bottom margin, amber where he waits."""
    p.paper("#ece4d0", grain=0.5)
    # floor and back wall, crosshatched
    wall = p.clip('<rect x="0" y="40" width="1200" height="520"/>')
    p.hatch(0, 40, W, 520, angle=35, spacing=7, clip=wall, jitter=1.2, stroke=INK, stroke_width=1.1, opacity=0.55)
    p.hatch(0, 40, W, 520, angle=-35, spacing=11, clip=wall, jitter=1.5, stroke=INK, stroke_width=1, opacity=0.35)
    p.rect(0, 560, W, 150, fill="#d9cfb8")
    p.hatch(0, 560, W, 150, angle=80, spacing=9, stroke=INK, stroke_width=1, opacity=0.4)
    # the shutter at the right, half down, and its sign
    p.rect(980, 60, 200, 300, fill="#cfc5ad", stroke=INK, stroke_width=4)
    for yy in range(70, 360, 16):
        p.line(980, yy, 1180, yy, stroke=INK, stroke_width=2)
    p.rect(960, 380, 240, 50, fill="#f4eedd", stroke=INK, stroke_width=3)
    p.text(972, 413, "RELIEF SUSPENDED", size=20, family="sans-serif", fill=INK, font_weight="bold")
    # the breath radius: a ring of bare paper
    tx, ty = 470, 600
    p.ellipse(tx, ty - 70, 165, 175, fill="#f6f1e4", stroke=INK, stroke_width=2, stroke_dasharray="10 7")
    # the queue: lumpy people outside the ring
    xs = [40, 110, 175, 250, 690, 760, 830, 905, 975, 1050, 1120]
    for i, x in enumerate(xs):
        s = 1.25 + 0.15 * math.sin(i * 1.7)
        d = person_d(x, 600, s, lean=p.rng.uniform(-6, 6), hunch=p.rng.uniform(0, 8))
        p.path(d, fill="#bfb49c", stroke=INK, stroke_width=3, stroke_linejoin="round")
        cid = p.clip(f'<path d="{d}"/>')
        p.hatch(x - 40, 600 - 160 * s, 80, 160 * s, angle=60, spacing=6, clip=cid, stroke=INK, stroke_width=1.2)
        p.circle(x - 4, 600 - 112 * s, 3, fill=INK)
        # lesions: a few stippled marks
        p.stipple(x - 18, 600 - 100 * s, 30, 40, n=14, r=(1.2, 2.4), fill=INK)
    # one woman leaning into the ring: the pinch
    p.path(person_d(300, 600, 1.2, lean=18, hunch=10), fill="#bfb49c", stroke=INK, stroke_width=3)
    p.path("M312,470 C330,480 336,500 330,520", fill="none", stroke=INK, stroke_width=4)
    p.text(250, 440, "!", size=48, family="sans-serif", fill=BLOOD2, font_weight="bold")
    # Dr. Tox, shrouded
    p.path(tox_d(tx, ty, 1.0), fill=SHROUD, stroke=INK, stroke_width=4)
    cid = p.clip(f'<path d="{tox_d(tx, ty, 1.0)}"/>')
    p.hatch(tx - 40, ty - 170, 80, 170, angle=-50, spacing=5, clip=cid, stroke=INK, stroke_width=1)
    # the gap ahead and the arrow
    p.path("M600,300 C640,280 690,282 720,300", fill="none", stroke=INK, stroke_width=5, stroke_linecap="round")
    p.poly([(712, 288), (734, 306), (708, 314)], fill=INK)
    # the pulse line in the margin
    p.rect(0, 710, W, 90, fill=INK)
    pts, x = [(30, 756)], 30
    for k in range(9):
        x += 60
        pts += [(x, 756), (x + 8, 724 if k < 6 else 712), (x + 16, 772), (x + 24, 756)]
        x += 30
    p.path("M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts), fill="none", stroke=AMBER, stroke_width=4)
    p.text(900, 766, "PULSE", size=26, family="sans-serif", fill=AMBER, font_weight="bold")


# ---- 2D: Reflection run (silkscreen pop-art repeats) --------------------------------------------
@register(G, "reflection-run")
def reflection_run(p: Pic):
    """Reflection run (2D): a Spire glass hall drawn as a silkscreen print of repeated frames, flat
    blocks of colour slightly off register. Cally walks left to right along the floor line; below it,
    in the glass, her reflection walks upside down, mirrored. The same frame repeats along the row, the
    colours shifting from print to print; in one repeat the reflection has stopped at a door and turned
    its back while Cally walks on, the frame that does not match."""
    p.rect(0, 0, W, H, fill="#f1ede4")
    cols = [("#E8B6C8", "#2B2B6B"), (SKY, "#1E1E1E"), ("#F2C14E", "#3B1E5A"), ("#9ED8C6", "#2B2B6B"),
            ("#F0907A", "#1E1E1E")]
    fw, fh, gap = 220, 330, 15
    for i in range(5):
        x = 22 + i * (fw + gap)
        bg, ink = cols[i]
        y0 = 70
        p.rect(x, y0, fw, fh * 2, fill=bg)
        # the floor line: glass below
        p.rect(x, y0 + fh, fw, fh, fill="#ffffff", opacity=0.35)
        p.line(x, y0 + fh, x + fw, y0 + fh, stroke=ink, stroke_width=5)
        # off-register offset for the print
        dx, dy = (i % 2) * 5 - 2, ((i + 1) % 2) * 4 - 2
        cx = x + 60 + i * 22
        # Cally, flat silhouette: dark hair fanned, a straight back
        d = person_d(cx, y0 + fh, 1.7)
        p.path(d, fill=ink)
        p.ellipse(cx + dx, y0 + fh - 190 + dy, 24, 22, fill=ink, opacity=0.85)
        # the reflection, mirrored below the floor
        if i == 3:
            # the one that refuses: stopped at a door, its back turned
            p.rect(x + 140, y0 + fh + 20, 60, 200, fill="none", stroke=ink, stroke_width=5)
            p.text(x + 150, y0 + fh + 60, "RCC", size=22, family="sans-serif", fill=ink, font_weight="bold")
            p.open("g", transform=f"translate(0,{2 * (y0 + fh)}) scale(1,-1)")
            p.path(person_d(x + 120, y0 + fh, 1.7, lean=-6), fill=ink, opacity=0.55)
            p.close()
        else:
            p.open("g", transform=f"translate(0,{2 * (y0 + fh)}) scale(1,-1)")
            p.path(person_d(cx + dx, y0 + fh, 1.7), fill=ink, opacity=0.55)
            p.close()
        # misregistered colour block
        p.rect(x + 8 + dx, y0 + 12 + dy, fw * 0.4, 40, fill=bg, opacity=0.6, stroke=ink, stroke_width=2)
    p.text(30, 52, "CALLY  CALLY  CALLY  CALLY  CALLY", size=34, family="sans-serif", fill="#1E1E1E",
           font_weight="bold", letter_spacing="6")
    p.text(30, 780, "FORCE   or   STOP WITH IT", size=26, family="sans-serif", fill="#1E1E1E")


# ---- 1D: Triage (alcohol-marker sketch cards) ---------------------------------------------------
def marker_rect(p, x, y, w, h, color, layers=3, opacity=0.32):
    """Streaky marker fill: overlapping translucent strokes, darker where they cross."""
    for k in range(layers):
        step = 18
        for yy in range(int(y), int(y + h), step):
            jx = p.rng.uniform(-6, 6)
            p.rect(x + jx, yy + k * 4, w, step - 3, fill=color, opacity=opacity, rx=6)


@register(G, "triage")
def triage(p: Pic):
    """Triage (1D): a table of patient cards drawn in alcohol marker on white card stock, streaky
    layered tones and quick ink faces. Each card has a name and one want in the corner and a row of
    small amber marks for the tincture. Three columns across the table, NOW, WAIT and CANNOT; the
    tincture tray at the left holds more marks than there are cots, and one card already has a mark
    more than it needed, drawn in a darker amber."""
    p.rect(0, 0, W, H, fill="#cfd4d2")
    marker_rect(p, 0, 0, W, H, TEAL2, layers=2, opacity=0.18)
    heads = ["NOW", "WAIT", "CANNOT"]
    for i, hname in enumerate(heads):
        x = 250 + i * 315
        p.text(x + 90, 70, hname, size=34, family="sans-serif", fill=INK, font_weight="bold")
        p.line(x + 10, 84, x + 290, 84, stroke=INK, stroke_width=3)
    cards = [
        (0, 0, "Teo H.", "to walk by spring", 2, 2), (0, 1, "Lupe A.", "to sew again", 1, 1),
        (0, 2, "Bashir K.", "one night's sleep", 1, 3), (1, 0, "Ines V.", "a letter to the Spire", 0, 0),
        (1, 1, "Kofi M.", "to see the river", 1, 0), (2, 0, "Arturo S.", "his place in line", 0, 0),
    ]
    for col, row, name, want, need, given in cards:
        x, y = 270 + col * 315, 110 + row * 220
        p.rect(x, y, 260, 200, fill="#fdfdfb", stroke="#888", stroke_width=1.5, rx=6)
        tone = [SKY, "#E8B6C8", "#9ED8C6", OCHRE][(col + row) % 4]
        marker_rect(p, x + 14, y + 16, 110, 120, tone, layers=2, opacity=0.35)
        # a quick ink face
        p.ellipse(x + 68, y + 70, 34, 42, fill="none", stroke=INK, stroke_width=3)
        p.path(f"M{x + 52},{y + 64} l8,0 M{x + 76},{y + 64} l8,0 M{x + 58},{y + 92} q10,6 20,0", fill="none",
               stroke=INK, stroke_width=3, stroke_linecap="round")
        p.text(x + 136, y + 44, name, size=22, family="sans-serif", fill=INK, font_weight="bold")
        p.text(x + 136, y + 72, "wants", size=15, family="sans-serif", fill="#555")
        p.text(x + 136, y + 94, want, size=15, family="sans-serif", fill=INK)
        for m in range(max(need, given)):
            c = AMBER if m < need else "#8a4a0c"
            filled = m < given
            p.circle(x + 30 + m * 30, y + 170, 10, fill=c if filled else "none", stroke=c, stroke_width=3)
    # the tincture tray
    p.rect(30, 110, 190, 420, fill="#fdfdfb", stroke="#888", stroke_width=1.5, rx=6)
    p.text(52, 146, "TINCTURE", size=22, family="sans-serif", fill=INK, font_weight="bold")
    for k in range(14):
        p.circle(66 + (k % 3) * 50, 190 + (k // 3) * 60, 14, fill=AMBER, opacity=0.9)
    p.text(52, 500, "cots: 2", size=22, family="sans-serif", fill=INK)
    p.text(52, 470, "water: 3", size=22, family="sans-serif", fill=INK)
    p.text(30, 770, "A mark past the need settles a card at once.", size=24, family="sans-serif", fill=INK)


# ---- 1D: The Manifold (mail-order comic advert) -------------------------------------------------
@register(G, "manifold")
def manifold(p: Pic):
    """The Manifold (1D): the gauntlet drawn as a back-page mail-order comic advert, with a shouting
    headline, numbered callouts and a dashed clip-out coupon border. The shunt feeds a clear line into
    a manifold of valves along the gauntlet's spine; the player turns the valves to route the flow
    to four glass barrels, each wanting its share. A fifth outlet at the end is capped. A small coupon
    corner shows the Pulse each dart will cost with this routing."""
    p.rect(0, 0, W, H, fill="#f4ecd2")
    p.rect(20, 20, W - 40, H - 40, fill="none", stroke=INK, stroke_width=4, stroke_dasharray="16 10")
    p.text(60, 104, "AMAZING! FOUR BARRELS FROM ONE LINE!", size=50, family="sans-serif", fill="#B3261E",
           font_weight="bold")
    p.text(60, 146, "Route it yourself. Every valve a choice. Satisfaction not guaranteed.", size=24,
           family="serif", fill=INK, font_style="italic")
    # the gauntlet body
    p.rect(150, 300, 820, 150, fill="#2a2a2a", rx=30, stroke=INK, stroke_width=4)
    # the shunt line in from the wrist
    p.path("M70,380 C110,380 120,380 160,380", fill="none", stroke="#9fb6c0", stroke_width=14)
    p.path("M70,380 C110,380 120,380 160,380", fill="none", stroke=BLOOD2, stroke_width=6)
    # manifold pipe and valves
    p.line(170, 380, 940, 380, stroke="#c9ced0", stroke_width=16)
    valves = [250, 380, 510, 640, 770, 900]
    for i, vx in enumerate(valves):
        p.circle(vx, 380, 26, fill="#e9e3cf", stroke=INK, stroke_width=4)
        a = math.radians(30 + i * 40)
        p.line(vx - 18 * math.cos(a), 380 - 18 * math.sin(a), vx + 18 * math.cos(a), 380 + 18 * math.sin(a),
               stroke=INK, stroke_width=6, stroke_linecap="round")
        p.circle(vx, 300, 22, fill=GOLD, stroke=INK, stroke_width=3)
        p.text(vx - 8, 308, str(i + 1), size=24, family="sans-serif", fill=INK, font_weight="bold")
    # four barrels hanging below, with fill levels
    fills = [0.8, 0.55, 0.9, 0.35]
    for i, bx in enumerate([300, 470, 640, 810]):
        p.line(bx, 392, bx, 470, stroke="#c9ced0", stroke_width=8)
        p.rect(bx - 28, 470, 56, 170, fill="#eef3f3", stroke=INK, stroke_width=3, rx=8)
        p.rect(bx - 22, 470 + 164 * (1 - fills[i]), 44, 164 * fills[i], fill=BLOOD2)
        p.line(bx, 640, bx, 690, stroke=INK, stroke_width=3)
    # the fifth outlet, capped
    p.line(940, 380, 1040, 380, stroke="#c9ced0", stroke_width=16)
    p.rect(1040, 356, 40, 48, fill="#777", stroke=INK, stroke_width=4)
    p.text(990, 440, "CAPPED", size=22, family="sans-serif", fill=INK, font_weight="bold")
    # coupon corner
    p.rect(870, 600, 290, 150, fill="#fffaf0", stroke=INK, stroke_width=3, stroke_dasharray="8 6")
    p.text(890, 640, "PULSE PER DART", size=24, family="sans-serif", fill=INK, font_weight="bold")
    p.text(890, 712, "+9", size=64, family="sans-serif", fill=AMBER, font_weight="bold")
    p.text(60, 760, "Beads in: 24   Beads out: 4 barrels   Mail no money.", size=24, family="serif", fill=INK)


# ---- 1D: Persona (1950s romance comic) ----------------------------------------------------------
def heart_d(cx, cy, s):
    return (f"M{f(cx)},{f(cy + s * 0.9)} C{f(cx - s * 1.4)},{f(cy - s * 0.1)} {f(cx - s * 0.7)},{f(cy - s * 1.1)} "
            f"{f(cx)},{f(cy - s * 0.4)} C{f(cx + s * 0.7)},{f(cy - s * 1.1)} {f(cx + s * 1.4)},{f(cy - s * 0.1)} "
            f"{f(cx)},{f(cy + s * 0.9)}Z")


@register(G, "persona")
def persona(p: Pic):
    """Persona (1D): a page from a 1950s romance comic in pastel flats with no dot screen. In a
    heart-shaped panel at the top a profile of a young man's face, his attachment signature written
    beside it in thought balloons: a painted sky, a string, four children, warm amber light. Below, a
    hand of romance-comic cards Cally plays to fit it, each a gesture or a line; a match meter fills
    toward 94.6. One card at the end of the hand was dealt by the deck itself, a dropped blade, and it
    does not fit."""
    p.rect(0, 0, W, H, fill="#fbf1e6")
    p.path(heart_d(600, 220, 170), fill="#F6C9D3", stroke="#3B2A4A", stroke_width=6)
    # his profile in pastel flats
    p.path("M560,160 C600,120 660,130 680,170 C690,200 680,230 668,250 L676,268 L660,274 C650,300 620,310 590,300 "
           "C566,290 552,260 552,230 C540,214 546,186 560,160Z", fill="#F2D3B8", stroke="#3B2A4A", stroke_width=4)
    p.path("M556,170 C580,120 650,110 684,160 C660,150 610,150 576,190Z", fill="#6b4b3a")
    # a tear on the lash (hers, at the right)
    p.path("M820,300 C826,316 832,324 826,334 C818,340 810,332 814,318Z", fill=SKY, stroke="#3B2A4A",
           stroke_width=2)
    balloons = [(250, 120, "a painted sky"), (250, 250, "a string"), (900, 120, "four of them"),
                (930, 240, "amber light")]
    for bx, by, s in balloons:
        p.ellipse(bx, by, 130, 46, fill="#ffffff", stroke="#3B2A4A", stroke_width=3)
        side = 1 if bx < 600 else -1
        for ox, oy, r in ((70, 46, 10), (100, 64, 6)):
            p.circle(bx + side * ox, by + oy, r, fill="#ffffff", stroke="#3B2A4A", stroke_width=2)
        p.text(bx - 95, by + 9, s, size=26, family="serif", fill="#3B2A4A", font_style="italic")
    # the hand of cards
    names = ["Laugh at his joke", "Sky-blue scarf", "Hum four notes", "Loop of string", "Take his hand",
             "Drop the blade"]
    tints = ["#BFE3E0", "#C9DDF2", "#F6E1A8", "#E9D3F0", "#F6C9D3", "#d9d9d9"]
    for i, (n, t) in enumerate(zip(names, tints)):
        x = 70 + i * 180
        rot = (i - 2.5) * 3
        p.open("g", transform=f"rotate({f(rot)} {x + 80} 600)")
        p.rect(x, 470, 160, 230, fill=t, stroke="#3B2A4A", stroke_width=4, rx=10)
        p.path(heart_d(x + 80, 540, 26), fill="#ffffff", stroke="#3B2A4A", stroke_width=2)
        words = n.split()
        for k in range(0, len(words), 2):
            p.text(x + 14, 610 + k * 14, " ".join(words[k:k + 2]), size=22, family="serif", fill="#3B2A4A")
        if i == 5:
            p.line(x + 20, 490, x + 140, 680, stroke="#3B2A4A", stroke_width=3)
            p.text(x + 18, 690, "dealt itself", size=16, family="serif", fill="#3B2A4A", font_style="italic")
        p.close()
    # match meter
    p.rect(160, 740, 880, 30, fill="#ffffff", stroke="#3B2A4A", stroke_width=3, rx=15)
    p.rect(164, 744, 872 * 0.88, 22, fill="#E07A9A", rx=11)
    p.line(160 + 880 * 0.946, 730, 160 + 880 * 0.946, 780, stroke="#3B2A4A", stroke_width=4)
    p.text(160 + 880 * 0.946 - 30, 724, "94.6", size=22, family="serif", fill="#3B2A4A", font_weight="bold")


# ---- 1D: Bloom (four-colour Ben-Day newsprint) --------------------------------------------------
@register(G, "bloom")
def bloom(p: Pic):
    """Bloom (1D): a city district as a grid of blocks printed on yellowed newsprint in four-colour
    Ben-Day dots under a heavy black keyline. The spread is printed in rust and ochre dots, thick
    near the source rooftop and thinning downwind; cordoned cells are struck through with black
    bars, and crews stand at the cordons as small keyed figures. A wind arrow and a tick counter sit in
    the margin, and the east edge of the grid, where the settlement is, is outlined in red."""
    p.rect(0, 0, W, H, fill="#efe2b8")
    cols, rows, cell = 10, 7, 96
    ox, oy = 90, 70
    src = (1, 3)
    cordons = {(4, 2), (4, 3), (4, 4), (5, 1), (5, 5)}

    def dots(color, r, step, angle):
        pid = p.uid("ben")
        p.defn(f'<pattern id="{pid}" width="{step}" height="{step}" patternUnits="userSpaceOnUse" '
               f'patternTransform="rotate({angle})"><circle cx="{step / 2}" cy="{step / 2}" r="{r}" '
               f'fill="{color}"/></pattern>')
        return f"url(#{pid})"

    cyan = dots("#2fa8d8", 2.2, 10, 15)
    rust = [dots(RUST, r, 11, 45) for r in (1.6, 2.8, 4.2)]
    yellow = [dots("#e9c62e", r, 9, 75) for r in (1.2, 2.2, 3.2)]
    for r in range(rows):
        for c in range(cols):
            x, y = ox + c * cell, oy + r * cell
            dist = math.hypot(c - src[0], (r - src[1]) * 1.4)
            spread = max(0.0, 1 - dist / 5.2) if c <= 4 or (c, r) in cordons else 0.0
            p.rect(x + 4, y + 4, cell - 8, cell - 8, fill=cyan, opacity=0.6)
            if spread > 0.05:
                k = 0 if spread < 0.35 else (1 if spread < 0.7 else 2)
                p.rect(x + 4, y + 4, cell - 8, cell - 8, fill=rust[k], opacity=0.95)
                p.rect(x + 4, y + 4, cell - 8, cell - 8, fill=yellow[k], opacity=0.7)
            p.rect(x, y, cell, cell, fill="none", stroke=INK, stroke_width=4)
            if (c, r) in cordons:
                p.rect(x + 10, y + cell / 2 - 8, cell - 20, 16, fill=INK)
                p.path(person_d(x + cell - 22, y + cell - 8, 0.45), fill="#d8336a", stroke=INK, stroke_width=2)
    # the source rooftop
    sx, sy = ox + src[0] * cell + cell / 2, oy + src[1] * cell + cell / 2
    p.circle(sx, sy, 22, fill=OCHRE, stroke=INK, stroke_width=4)
    # the settlement's edge in red
    p.rect(ox + 8 * cell, oy, 2 * cell, rows * cell, fill="none", stroke="#c1272d", stroke_width=8)
    p.text(ox + 8 * cell + 14, oy + rows * cell + 40, "SETTLEMENT", size=24, family="sans-serif", fill="#c1272d",
           font_weight="bold")
    # margin: wind and tick
    p.path("M1080,140 L1170,140", stroke=INK, stroke_width=8)
    p.poly([(1160, 124), (1190, 140), (1160, 156)], fill=INK)
    p.text(1080, 196, "WIND", size=24, family="sans-serif", fill=INK, font_weight="bold")
    p.text(1080, 300, "TICK 7", size=28, family="sans-serif", fill=INK, font_weight="bold")


# ---- 1D: Composite (identikit acetate overlays) -------------------------------------------------
@register(G, "composite")
def composite(p: Pic):
    """Composite (1D): a witness-room identikit, line-drawn feature strips on clear acetate sheets
    stacked over a pale form. Each strip is a region of the body (head and jaw, shoulders, arms, back,
    gait) and carries the grease-pencil numbers of the witnesses who saw it. The stack shows the
    constants the bible fixes (black veins, green eyes, a jaw past the skull) and one strip, a pair of
    wings with a halo, offered by a witness who saw a god, sits askew and does not fit. Witness cards
    run along the bottom; nothing shows the act, only the shape."""
    p.rect(0, 0, W, H, fill="#d9dcd6")
    # light box
    p.rect(330, 40, 540, 600, fill="#f5f7f2", stroke="#777", stroke_width=3, rx=8)
    # the pale base form: wrong proportion, never just big (bible Part VI section 8)
    form = ("M600,120 C640,120 660,150 656,180 L700,200 C780,230 820,260 830,300 L850,420 L820,430 L790,330 "
            "L760,330 L760,600 L700,600 L680,440 L620,440 L600,600 L540,600 L540,330 L500,330 L470,430 L440,420 "
            "L460,300 C470,260 520,230 600,200 L544,180 C540,150 560,120 600,120Z")
    p.path(form, fill="#e9ecea", stroke="#9aa", stroke_width=2)
    # strips on acetate: each a translucent band with a line drawing on it
    strips = [(110, 140, "head / jaw", "1 2 4"), (250, 120, "shoulders / plate", "1 2 3 5"),
              (370, 130, "arms", "2 5"), (500, 110, "gait", "3 4 5")]
    for y, h, label, wit in strips:
        p.rect(350, y, 500, h, fill="#ffffff", opacity=0.35, stroke="#6a8", stroke_width=2)
        p.text(360, y + 24, label, size=18, family="sans-serif", fill="#335")
        p.text(780, y + 24, wit, size=22, family="sans-serif", fill="#b03030", font_weight="bold")
    # the constants: green eyes, black veins, the jaw
    p.circle(586, 160, 6, fill=GREEN)
    p.circle(616, 160, 6, fill=GREEN)
    p.path("M570,190 L600,214 L632,190", fill="none", stroke=INK, stroke_width=4)
    for k in range(6):
        x0 = 520 + k * 32
        p.path(f"M{x0},260 C{x0 + 10},300 {x0 - 10},340 {x0 + 4},380", fill="none", stroke=BLOOD, stroke_width=3)
    # scab plating drawn on the shoulder strip
    for k in range(7):
        p.poly([(480 + k * 50, 262), (520 + k * 50, 256), (530 + k * 50, 286), (488 + k * 50, 292)], fill="#2a2a2a",
               stroke=INK, stroke_width=2, opacity=0.8)
    # the awed strip, askew: wings and a halo
    p.open("g", transform="rotate(-9 960 260)")
    p.rect(880, 150, 280, 180, fill="#fffbe6", opacity=0.6, stroke=GOLD, stroke_width=3)
    p.ellipse(1020, 190, 60, 14, fill="none", stroke=GOLD, stroke_width=5)
    p.path("M1020,250 C960,200 910,220 900,300 C950,270 990,280 1020,260 C1050,280 1090,270 1140,300 "
           "C1130,220 1080,200 1020,250Z", fill="none", stroke=GOLD, stroke_width=4)
    p.text(900, 320, "6", size=30, family="sans-serif", fill="#b03030", font_weight="bold")
    p.close()
    # witness cards
    for i, (n, nm) in enumerate([(1, "Mercy"), (2, "Wren"), (3, "Bashir"), (4, "Dov"), (5, "Sato"), (6, "Yusuf")]):
        x = 40 + i * 190
        p.rect(x, 670, 170, 100, fill="#fbfbf6", stroke="#777", stroke_width=2, rx=4)
        p.text(x + 12, 704, f"{n}  {nm}", size=24, family="sans-serif", fill=INK, font_weight="bold")
        p.text(x + 12, 740, "saw from the drums" if n < 4 else ("from the truck" if n == 5 else "saw a light"),
               size=16, family="sans-serif", fill="#444")

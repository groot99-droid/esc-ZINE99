"""Dr. Tox: Finale gameplay pictographs. Built by tools/pictographs/build.py."""
import math

from core import H, W, Pic, f, register

G = "dr-tox-finale"

# palette (DESIGN.md section 15): the bible's colour grammar, Part VI, Dr. Tox section 6
TEAL, TEAL2, TEAL3 = "#5E7375", "#8A9A99", "#C4CDCB"     # the world: institutional indifference
AMBER, GOLD = "#D99A2B", "#F2C14E"                        # contained: the cage holding
GREEN = "#7FD957"                                         # loose: the toxin unbound
BLOOD, BLOOD2 = "#1A0B0C", "#4A0F14"                      # his blood
WHITE = "#E9ECEA"                                         # clinical white
RUST, OCHRE = "#9C4A2A", "#C98F3B"                        # Rostova
SKY = "#7FA9D6"                                           # Sky Room's painted blue: Cally's colour
SHROUD = "#5F6F5A"                                        # the shroud
COPY, COPYPAPER = "#1C1C1A", "#E8E4DA"                    # the cult's photocopy (added)
HARDLIGHT = "#F6E7B8"                                     # Aegis's panes (added)
INK = "#141414"
NPB = "#8EC5E8"                                           # non-photo blue
PULP_RED = "#C8202A"


def figure_d(x, y, s=1.0, lean=0.0):
    """A plain standing figure, feet at (x, y). Returns path data."""
    h = 120 * s
    pts = [(x - 9 * s + lean, y - h), (x + 9 * s + lean, y - h), (x + 11 * s + lean, y - h + 20 * s),
           (x + 6 * s + lean, y - h + 28 * s), (x + 24 * s + lean * 0.6, y - h + 40 * s), (x + 22 * s, y - 40 * s),
           (x + 14 * s, y), (x + 3 * s, y), (x, y - 36 * s), (x - 3 * s, y), (x - 14 * s, y), (x - 22 * s, y - 40 * s),
           (x - 24 * s + lean * 0.6, y - h + 40 * s), (x - 6 * s + lean, y - h + 28 * s), (x - 11 * s + lean, y - h + 20 * s)]
    return "M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts) + "Z"


def tox_d(x, y, s=1.0):
    """Dr. Tox in the shroud: narrow, vertical, contained (bible Part VI section 8), the hood up."""
    h = 160 * s
    pts = [(x - 10 * s, y - h), (x + 10 * s, y - h), (x + 16 * s, y - h + 26 * s), (x + 20 * s, y - h + 44 * s),
           (x + 26 * s, y - 10 * s), (x + 30 * s, y), (x - 30 * s, y), (x - 26 * s, y - 10 * s),
           (x - 20 * s, y - h + 44 * s), (x - 16 * s, y - h + 26 * s)]
    return "M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts) + "Z"


def pulse_line(p, y, x0=30, x1=W - 30, color=AMBER, spikes=()):
    pts, x, k = [(x0, y)], x0, 0
    while x < x1 - 60:
        x += 50
        hi = 26 if k not in spikes else 44
        pts += [(x, y), (x + 8, y - hi), (x + 16, y + 14), (x + 24, y)]
        x += 30
        k += 1
    p.path("M" + " L".join(f"{f(a)},{f(b)}" for a, b in pts), fill="none", stroke=color, stroke_width=4)


# ---- 2D: Procession (photocopied punk-zine collage) ---------------------------------------------
@register(G, "procession")
def procession(p: Pic):
    """Procession (2D): the cult's march as a photocopied punk-zine collage, black toner on grey
    paper, figures cut out and pasted in rows, banners in ransom-note letters, staples and strips of
    tape, toner streaks down the page. The march moves left to right; Dr. Tox in his shroud is pasted in
    near the rear as a red tape arrow points him to the front banner. Around him the ring of his breath is
    a torn white circle, and followers reach into it on purpose. A raised hand stops a few. A column strip
    along the top shows the whole march and his place in it; the Pulse line runs along the bottom."""
    p.paper(COPYPAPER, grain=0.55, fibre=1.2)
    # toner streaks
    for k in range(7):
        x = p.rng.uniform(0, W)
        p.rect(x, 0, p.rng.uniform(2, 9), H, fill=COPY, opacity=p.rng.uniform(0.05, 0.14))
    # the column strip at the top
    p.rect(30, 26, W - 60, 64, fill="#d6d1c4", stroke=COPY, stroke_width=3)
    for k in range(40):
        x = 50 + k * 27
        p.circle(x, 58, 9, fill=COPY, opacity=0.8)
    p.poly([(250, 92), (262, 70), (274, 92)], fill=PULP_RED)
    p.rect(1080, 32, 80, 52, fill=COPYPAPER, stroke=COPY, stroke_width=3)
    p.text(1088, 66, "FRONT", size=20, family="sans-serif", fill=COPY, font_weight="bold")
    # the ground line
    p.rect(0, 610, W, 100, fill="#cfc9bb")
    p.hatch(0, 610, W, 100, angle=12, spacing=5, stroke=COPY, stroke_width=1, opacity=0.25)
    # rows of cut-out marchers, pasted with slight rotations and white cut edges
    for row, (y, s, n) in enumerate(((560, 1.0, 13), (612, 1.25, 11))):
        for i in range(n):
            x = 30 + i * (W / n) + p.rng.uniform(-10, 10)
            if 330 < x < 560 and row == 1:
                continue
            rot = p.rng.uniform(-5, 5)
            p.open("g", transform=f"rotate({f(rot)} {f(x)} {f(y)})")
            p.path(figure_d(x, y, s * 1.05), fill="#ffffff")
            p.path(figure_d(x, y, s), fill=COPY)
            p.close()
    # Dr. Tox, pasted near the rear, and his torn ring
    tx, ty = 445, 640
    p.ellipse(tx, ty - 90, 150, 150, fill="#f7f4ec", stroke=COPY, stroke_width=3, stroke_dasharray="4 3 12 3")
    p.path(tox_d(tx, ty, 1.1), fill=SHROUD, stroke=COPY, stroke_width=4)
    # a follower reaching into the ring on purpose
    p.path(figure_d(330, 640, 1.2, lean=22), fill=COPY)
    p.path("M352,518 C380,520 400,530 412,548", fill="none", stroke=COPY, stroke_width=9, stroke_linecap="round")
    p.rect(250, 470, 120, 34, fill="#ffffff", stroke=COPY, stroke_width=2)
    p.text(258, 496, "THE RING", size=20, family="sans-serif", fill=COPY, font_weight="bold")
    # the raised hand
    p.path(f"M{tx + 24},{ty - 150} l18,-60 l10,0 l-6,58", fill=SHROUD, stroke=COPY, stroke_width=3)
    p.text(tx + 40, ty - 222, "STOP.", size=30, family="sans-serif", fill=PULP_RED, font_weight="bold")
    # the red tape arrow to the front
    p.rect(560, 300, 380, 30, fill=PULP_RED, opacity=0.9, transform="rotate(-4 750 315)")
    p.poly([(930, 280), (990, 310), (932, 346)], fill=PULP_RED)
    # the banner: ransom-note letters
    letters = "HE IS THE RING"
    x = 640
    for i, ch in enumerate(letters):
        if ch == " ":
            x += 18
            continue
        bg = ["#ffffff", COPY, "#d6d1c4"][i % 3]
        fg = COPY if bg != COPY else "#ffffff"
        p.rect(x, 160 + (i % 2) * 6, 38, 52, fill=bg, stroke=COPY, stroke_width=2,
               transform=f"rotate({f(p.rng.uniform(-8, 8))} {f(x + 19)} 186)")
        p.text(x + 8, 202 + (i % 2) * 6, ch, size=36, family=["serif", "sans-serif", "monospace"][i % 3],
               fill=fg, font_weight="bold")
        x += 42
    # staples and tape
    for sx, sy in ((630, 150), (1230 - 70, 150), (150, 120)):
        p.rect(sx, sy, 30, 4, fill="#8a8a88")
    p.rect(900, 420, 120, 34, fill="#efe7b8", opacity=0.6, transform="rotate(12 960 437)")
    # pulse line
    p.rect(0, 712, W, 88, fill=COPY)
    pulse_line(p, 758, color=AMBER, spikes=(3, 4))
    p.text(980, 768, "PULSE", size=26, family="sans-serif", fill=AMBER, font_weight="bold")


# ---- 2D: The airway (non-photo-blue pencil roughs) ----------------------------------------------
@register(G, "airway")
def airway(p: Pic):
    """The airway (2D): the arcology's ducts as a page of non-photo-blue pencil roughs on bristol
    board: loose blue construction lines, a fan, louvred dampers and branch points sketched ahead. The
    duct behind Dr. Tox has been inked in black brush as he passed; the branch he did not take stays blue
    and fading. Airflow arrows carry him; his breath trails downstream as a soft grey wash, and below the
    duct floor a grille opens onto a room with names lettered under it. The Pulse line in the margin."""
    p.paper("#f7f5ef", grain=0.18)
    # blue roughs: the whole duct network, loose
    def blue(d, w=2.2):
        p.path(d, fill="none", stroke=NPB, stroke_width=w, stroke_linecap="round", opacity=0.9)
    for k in range(3):
        o = k * 3
        blue(f"M40,{300 + o} L1160,{300 + o}", 1.6)
        blue(f"M40,{440 + o} L1160,{440 + o}", 1.6)
        blue(f"M760,{300 + o} L1040,{110 + o}", 1.4)
        blue(f"M820,{300 + o} L1100,{110 + o}", 1.4)
    blue("M940,110 L1160,110 M960,180 L1160,180", 1.4)
    # a fan sketched ahead
    for k in range(5):
        a = k * 72
        blue(f"M1050,370 l{f(55 * math.cos(math.radians(a)))},{f(55 * math.sin(math.radians(a)))}", 2.5)
    p.circle(1050, 370, 60, fill="none", stroke=NPB, stroke_width=2)
    # louvred damper sketched ahead
    for k in range(5):
        blue(f"M900,{312 + k * 24} l40,14", 2.4)
    # inked duct behind him (black brush)
    p.path(p.wobble_d([(40, 300), (560, 300)], amp=1.2, step=20), fill="none", stroke=INK, stroke_width=7)
    p.path(p.wobble_d([(40, 440), (560, 440)], amp=1.2, step=20), fill="none", stroke=INK, stroke_width=7)
    p.hatch(40, 300, 520, 140, angle=60, spacing=22, stroke=INK, stroke_width=1.2, opacity=0.25)
    # the inked edge, in progress
    p.path("M560,300 C580,300 590,296 610,300", fill="none", stroke=INK, stroke_width=5)
    # airflow arrows
    for ax in (140, 300, 680, 820):
        col = INK if ax < 560 else NPB
        p.path(f"M{ax},370 l60,0", fill="none", stroke=col, stroke_width=3)
        p.poly([(ax + 60, 362), (ax + 74, 370), (ax + 60, 378)], fill=col)
    # Dr. Tox gripping, in black ink
    p.path(tox_d(560, 430, 0.75), fill=SHROUD, stroke=INK, stroke_width=4)
    # his breath plume downstream, a grey wash
    p.path("M590,350 C660,340 720,360 800,352 C860,346 900,360 960,356", fill="none", stroke="#9aa3a3",
           stroke_width=26, opacity=0.35, stroke_linecap="round")
    # a grille in the duct floor and the room below
    for k in range(6):
        p.line(700 + k * 18, 440, 700 + k * 18, 452, stroke=NPB, stroke_width=3)
    p.rect(640, 470, 260, 150, fill="none", stroke=NPB, stroke_width=2, stroke_dasharray="6 5")
    for k, nm in enumerate(("IMOGEN HART", "ALDOUS VENN")):
        p.text(660, 520 + k * 34, nm, size=22, family="sans-serif", fill=NPB, font_weight="bold")
    p.text(660, 596, "below: the suite", size=18, family="sans-serif", fill=NPB)
    # the branch not taken, fading
    p.text(980, 96, "not taken", size=20, family="sans-serif", fill=NPB, opacity=0.5)
    # pulse margin
    p.rect(0, 712, W, 88, fill="#eceae3")
    pulse_line(p, 758, color=AMBER, spikes=(5,))
    p.text(960, 768, "HOLD BREATH", size=24, family="sans-serif", fill=INK, font_weight="bold")


# ---- 1D: The Creed (pocket tract booklet) -------------------------------------------------------
@register(G, "creed")
def creed(p: Pic):
    """The Creed (1D): a pocket tract booklet open across the page, thin paper, two inks, plain cartoon
    line. The domino chain runs across the spread as tract panels; each tile carries one of his own lines
    split across its two ends, and each end a word (RING, MARK, NEED, AMBER, RCC, BLOOD). The joints print
    a verse at the foot of the page: ALL OF IT IS HIS BLOOD. His hand of tiles is a strip of panels along
    the bottom; one tile in it was dealt by someone else, a painted sky."""
    p.rect(0, 0, W, H, fill="#d9d4c8")
    # the open booklet
    p.rect(60, 40, 1080, 560, fill="#f5f1e6", stroke="#9a9384", stroke_width=2)
    p.line(600, 40, 600, 600, stroke="#b9b2a2", stroke_width=3)
    p.rect(80, 60, 500, 70, fill=PULP_RED)
    p.text(100, 108, "WHAT HE SAID", size=40, family="serif", fill="#ffffff", font_weight="bold")
    p.text(620, 108, "and what it means", size=30, family="serif", fill=INK, font_style="italic")
    tiles = [("Stay outside", "the RING", "RING"), ("the RING", "is holy", "RING"), ("Two marks.", "Not three.", "MARK"),
             ("Not my BLOOD.", "Not all of it.", "BLOOD"), ("ALL of it", "is his BLOOD", "BLOOD")]
    x, y = 100, 170
    for i, (a, b, word) in enumerate(tiles):
        tx = x + i * 205
        ty = y + (i % 2) * 60
        p.rect(tx, ty, 190, 110, fill="#ffffff", stroke=INK, stroke_width=3, rx=6)
        p.line(tx + 95, ty + 6, tx + 95, ty + 104, stroke=INK, stroke_width=2)
        p.text(tx + 8, ty + 44, a, size=16, family="sans-serif", fill=INK)
        p.text(tx + 102, ty + 44, b, size=16, family="sans-serif", fill=INK)
        col = PULP_RED if word == "BLOOD" else INK
        p.text(tx + 12, ty + 92, word, size=20, family="sans-serif", fill=col, font_weight="bold")
        p.text(tx + 106, ty + 92, word, size=20, family="sans-serif", fill=col, font_weight="bold")
        # a little cartoon in each panel: a ring, a hand, a drop
        if word == "RING":
            p.circle(tx + 150, ty + 70, 16, fill="none", stroke=INK, stroke_width=2)
        elif word == "BLOOD":
            p.path(f"M{tx + 150},{ty + 52} q12,18 0,30 q-12,-12 0,-30Z", fill=PULP_RED)
    # the verse at the foot of the spread
    p.rect(80, 470, 1040, 110, fill="#efe9da")
    p.text(110, 530, "ALL OF IT IS HIS BLOOD.", size=46, family="serif", fill=PULP_RED, font_weight="bold")
    p.text(110, 568, "verse 3, printed from the joints", size=20, family="serif", fill=INK, font_style="italic")
    # his hand along the bottom
    p.rect(0, 620, W, 180, fill="#2b2a27")
    hand = [("That plate says", "who runs this hall", "RCC"), ("Stay outside", "the ring", "NEED"),
            ("", "", "SKY"), ("Two marks.", "Not three.", "MARK")]
    for i, (a, b, word) in enumerate(hand):
        tx = 60 + i * 280
        p.rect(tx, 650, 240, 120, fill="#ffffff", stroke=INK, stroke_width=3, rx=6)
        if word == "SKY":
            p.rect(tx + 6, 656, 228, 108, fill=SKY)
            p.ellipse(tx + 70, 700, 30, 12, fill="#ffffff", opacity=0.9)
            p.ellipse(tx + 160, 720, 40, 14, fill="#ffffff", opacity=0.9)
            p.text(tx + 70, 790, "dealt to him", size=18, family="sans-serif", fill="#cfcac0")
            continue
        p.line(tx + 120, 656, tx + 120, 764, stroke=INK, stroke_width=2)
        p.text(tx + 10, 700, a, size=16, family="sans-serif", fill=INK)
        p.text(tx + 126, 700, b, size=14, family="sans-serif", fill=INK)
        p.text(tx + 14, 750, word, size=20, family="sans-serif", fill=INK, font_weight="bold")


# ---- 1D: Split Field (Craftint Doubletone shading board) ----------------------------------------
@register(G, "split-field")
def split_field(p: Pic):
    """Split Field (1D): the station after, drawn on Craftint Doubletone board: black ink line, with grey
    single-line tone and crosshatch tone developed in brush-edged patches. Numbered marks on objects (a
    shield's face, a kiosk shutter, a ladder rail). At the centre a split-field comparison circle: the
    mark on the left half, a reference on the right, their striations lined up across a hairline. Three
    reference trays at the left (his plate, their hollow blade's twin channel, the State's shield rim);
    on the right a record strip naming who was hurt and by what, never a wound."""
    p.rect(0, 0, W, H, fill="#fbfbf8")
    # developed tone patches with brush-edged borders
    for (x, y, w, h, ang, cross) in ((40, 40, 520, 260, 45, False), (600, 60, 280, 200, 45, True),
                                     (60, 330, 300, 140, -45, True)):
        d = p.wobble_d([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], amp=7, step=26, closed=True)
        cid = p.clip(f'<path d="{d}"/>')
        p.hatch(x - 10, y - 10, w + 20, h + 20, angle=ang, spacing=7, clip=cid, stroke="#555", stroke_width=1.1)
        if cross:
            p.hatch(x - 10, y - 10, w + 20, h + 20, angle=-ang, spacing=7, clip=cid, stroke="#555", stroke_width=1.1)
    # the scene in ink: a water tower's legs, a kiosk, a shield
    p.path("M120,290 L160,60 M260,290 L220,60 M140,180 L240,180", fill="none", stroke=INK, stroke_width=5)
    p.rect(120, 40, 160, 40, fill="none", stroke=INK, stroke_width=5)
    p.text(170, 72, "RCC", size=26, family="sans-serif", fill=INK, font_weight="bold")
    p.rect(330, 150, 150, 140, fill="#ffffff", stroke=INK, stroke_width=5)
    p.rect(640, 90, 100, 170, fill="#ffffff", stroke=INK, stroke_width=5, rx=10)
    # numbered marks
    for n, (mx, my) in enumerate(((200, 130), (400, 220), (690, 160), (700, 230), (420, 180)), start=1):
        p.circle(mx, my, 18, fill="#ffffff", stroke=INK, stroke_width=3)
        p.text(mx - 7, my + 8, str(n), size=22, family="sans-serif", fill=INK, font_weight="bold")
    # the split-field circle
    cx, cy, r = 600, 500, 190
    left = p.clip(f'<rect x="{cx - r}" y="{cy - r}" width="{r}" height="{2 * r}"/>')
    right = p.clip(f'<rect x="{cx}" y="{cy - r}" width="{r}" height="{2 * r}"/>')
    circ = p.clip(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
    p.circle(cx, cy, r, fill="#e9e9e4")
    p.open("g", clip_path=circ)
    p.open("g", clip_path=left)
    for k in range(-8, 9):
        y = cy + k * 20 + (6 if k % 3 == 0 else 0)
        p.line(cx - r, y, cx, y + 6, stroke=INK, stroke_width=3 if k % 2 else 6)
    p.close()
    p.open("g", clip_path=right)
    p.rect(cx, cy - r, r, 2 * r, fill="#d8d8d2")
    for k in range(-8, 9):
        y = cy + k * 20 + (6 if k % 3 == 0 else 0)
        p.line(cx, y + 6, cx + r, y + 12, stroke=INK, stroke_width=3 if k % 2 else 6)
    p.close()
    p.close()
    p.line(cx, cy - r, cx, cy + r, stroke=PULP_RED, stroke_width=2)
    p.circle(cx, cy, r, fill="none", stroke=INK, stroke_width=8)
    p.text(cx - r + 10, cy + r + 40, "MARK 2", size=22, family="sans-serif", fill=INK, font_weight="bold")
    p.text(cx + 30, cy + r + 40, "THEIRS: twin channel", size=22, family="sans-serif", fill=INK, font_weight="bold")
    # reference trays
    for i, (lab, col) in enumerate((("HIS", "#2a2a2a"), ("THEIRS", BLOOD2), ("STATE", TEAL))):
        y = 520 + i * 80
        p.rect(40, y, 300, 64, fill="#ffffff", stroke=INK, stroke_width=3)
        p.rect(52, y + 12, 60, 40, fill=col)
        p.text(128, y + 42, lab, size=24, family="sans-serif", fill=INK, font_weight="bold")
    # the record strip
    p.rect(860, 300, 320, 470, fill="#ffffff", stroke=INK, stroke_width=3)
    p.text(880, 340, "RECORD", size=26, family="sans-serif", fill=INK, font_weight="bold")
    rows = [("Hal Brenner", "his last shift", "theirs"), ("Ivo Petrak", "a place inside", "his"),
            ("Dara Quill", "her sister at the rite", "State"), ("Tomasz Wey", "to throw first", "State")]
    for i, (nm, want, by) in enumerate(rows):
        y = 390 + i * 92
        p.text(880, y, nm, size=22, family="sans-serif", fill=INK, font_weight="bold")
        p.text(880, y + 26, "wants " + want, size=16, family="sans-serif", fill="#444")
        p.text(880, y + 50, "by: " + by, size=18, family="sans-serif", fill=PULP_RED if by == "theirs" else INK)


# ---- 1D: Two Pans (two-colour pulp, red and black) ----------------------------------------------
@register(G, "two-pans")
def two_pans(p: Pic):
    """Two Pans (1D): a beam balance drawn as the centrepiece of a two-colour pulp cover, red and black
    ink only on rough pulp stock with heavy black shadows and red flat fills. A BLACK pan and a RED pan
    hang from the beam; brass pip tokens stamped with dots wait in a tray. The dial at the top has a
    window marked on it, and a second band in a red caption box where his heart would hold. Nothing on
    the page names a substance; the unit is the pip."""
    p.paper("#e8dcc2", grain=0.45, fibre=0.7)
    # pulp title band
    p.rect(0, 0, W, 110, fill=PULP_RED)
    p.text(40, 82, "THE TWO PANS", size=72, family="serif", fill="#1a1a1a", font_weight="bold", letter_spacing="4")
    # heavy black shadow behind the stand
    p.poly([(520, 720), (680, 720), (760, 780), (440, 780)], fill="#1a1a1a", opacity=0.85)
    # stand and beam
    p.rect(585, 260, 30, 460, fill="#1a1a1a")
    p.rect(470, 700, 260, 30, fill="#1a1a1a")
    ang = -6
    p.open("g", transform=f"rotate({ang} 600 270)")
    p.rect(250, 258, 700, 24, fill="#1a1a1a")
    p.circle(600, 270, 22, fill=PULP_RED, stroke="#1a1a1a", stroke_width=6)
    # chains and pans
    for px, col, lab in ((290, "#1a1a1a", "BLACK"), (910, PULP_RED, "RED")):
        p.line(px, 282, px - 70, 470, stroke="#1a1a1a", stroke_width=4)
        p.line(px, 282, px + 70, 470, stroke="#1a1a1a", stroke_width=4)
        p.path(f"M{px - 110},470 Q{px},560 {px + 110},470 Z", fill=col, stroke="#1a1a1a", stroke_width=6)
        p.text(px - 44, 600, lab, size=40, family="sans-serif", fill=col, font_weight="bold")
        # tokens in the pan
        for k in range(4 if col == "#1a1a1a" else 2):
            tx = px - 60 + k * 36
            p.ellipse(tx, 470, 16, 8, fill=GOLD, stroke="#1a1a1a", stroke_width=2)
    p.close()
    # the dial with its window and the heart band
    p.path("M420,200 A180,180 0 0,1 780,200", fill="none", stroke="#1a1a1a", stroke_width=6)
    p.path("M640,140 A180,180 0 0,1 690,158", fill="none", stroke=PULP_RED, stroke_width=22)
    p.path("M730,172 A180,180 0 0,1 755,190", fill="none", stroke="#1a1a1a", stroke_width=22, opacity=0.5)
    p.line(600, 270, 664, 150, stroke=PULP_RED, stroke_width=5)
    p.text(612, 128, "WINDOW", size=22, family="sans-serif", fill=PULP_RED, font_weight="bold")
    # red caption box
    p.rect(820, 130, 340, 86, fill="#ffffff", stroke="#1a1a1a", stroke_width=4)
    p.text(836, 166, "HERE, HIS HEART", size=24, family="sans-serif", fill=PULP_RED, font_weight="bold")
    p.text(836, 198, "WOULD HOLD.", size=24, family="sans-serif", fill=PULP_RED, font_weight="bold")
    # token tray with pips
    p.rect(40, 640, 380, 130, fill="#1a1a1a")
    for k in range(6):
        cx = 80 + k * 60
        p.circle(cx, 705, 24, fill=GOLD, stroke="#1a1a1a", stroke_width=3)
        for d in range(k + 1):
            a = d * (2 * math.pi / (k + 1))
            p.circle(cx + (9 if k else 0) * math.cos(a), 705 + (9 if k else 0) * math.sin(a), 3, fill="#1a1a1a")
    p.text(800, 760, "load: 30 pips", size=30, family="serif", fill="#1a1a1a", font_weight="bold")


# ---- 1D: Switchboard (letterer's balloon page) --------------------------------------------------
@register(G, "switchboard")
def switchboard(p: Pic):
    """Switchboard (1D): a comic page at the lettering stage. Pencilled panel borders frame five
    districts (THE TOWERS, THE SUITES, THE ATRIUM, THE PLINTH, THE ROAD); above them inked speech balloons
    with hand-lettered capitals are the city's air circuits, AIR 1 to AIR 6 and the HUB, and each
    balloon's tail is a patch cord run to a panel. Two balloons lettered in red are the State's
    interlocks; THE PLINTH hangs on a tail from THE TOWERS. Blue guidelines run under every line of
    lettering, and a letterer's note in the margin counts the HUB's tails."""
    p.rect(0, 0, W, H, fill="#fbfaf6")
    # pencilled panels
    panels = [("THE TOWERS", 40, 430, 260), ("THE SUITES", 320, 430, 200), ("THE ATRIUM", 540, 430, 200),
              ("THE PLINTH", 760, 430, 200), ("THE ROAD", 980, 430, 180)]
    for name, x, y, w in panels:
        p.path(p.wobble_d([(x, y), (x + w, y), (x + w, y + 300), (x, y + 300)], amp=1.5, step=30, closed=True),
               fill="none", stroke="#9a9a9a", stroke_width=2)
        p.text(x + 14, y + 284, name, size=20, family="sans-serif", fill="#7a7a7a")
    # sketchy contents
    for k in range(4):
        p.rect(60 + k * 55, 470 + (k % 2) * 20, 40, 220 - (k % 2) * 20, fill="none", stroke="#b0b0b0", stroke_width=1.5)
    for k in range(5):
        p.rect(780 + k * 36, 640, 30, 30, fill="none", stroke="#b0b0b0", stroke_width=1.5)
    # balloons
    balloons = [("AIR 1", 120, 120, 60, False), ("AIR 2", 300, 90, 160, False), ("HUB", 560, 120, 700, False),
                ("AIR 4", 820, 90, 380, False), ("LOCK", 980, 210, 860, True), ("LOCK", 160, 300, 140, True)]
    for label, bx, by, tx, red in balloons:
        col = PULP_RED if red else INK
        rx, ry = (90, 46) if label != "HUB" else (120, 60)
        # guidelines in blue under the lettering
        p.line(bx - rx + 20, by - 6, bx + rx - 20, by - 6, stroke=NPB, stroke_width=1.2)
        p.line(bx - rx + 20, by + 14, bx + rx - 20, by + 14, stroke=NPB, stroke_width=1.2)
        # the tail as a patch cord down to its panel
        p.path(f"M{bx},{by + ry - 4} C{bx},{by + 160} {tx},{340} {tx},{470}", fill="none", stroke=col, stroke_width=5)
        p.circle(tx, 470, 9, fill=col)
        p.ellipse(bx, by, rx, ry, fill="#ffffff", stroke=col, stroke_width=4)
        p.text(bx - (34 if label != "HUB" else 46), by + 12, label, size=30 if label != "HUB" else 40,
               family="sans-serif", fill=col, font_weight="bold")
    # the HUB's extra tails, to the plinth and the suites
    for tx in (380, 860):
        p.path(f"M560,180 C560,300 {tx},360 {tx},470", fill="none", stroke=INK, stroke_width=5, stroke_dasharray="14 6")
        p.circle(tx, 470, 9, fill=INK)
    # letterer's margin note
    p.text(40, 790, "HUB: 3 tails of 5 — every panel must keep one", size=24, family="serif", fill=NPB,
           font_style="italic")


# ---- 1D: Panes (holographic foil trading card) --------------------------------------------------
@register(G, "panes")
def panes(p: Pic):
    """Panes (1D): a collectible trading card of Aegis, its face washed with rainbow holographic foil
    in diagonal bands, a bevelled frame and a stat box (LOAD, PANES). In the card's art window a breach
    in a wall of glass is being tiled with the seven tangram pieces of hard light, foil facets; six are
    set, and the seventh, the keystone, waits outside the outline in his hand. A gap the shape of it is
    left in the wall."""
    p.rect(0, 0, W, H, fill="#20232a")
    # the card
    cx0, cy0, cw, ch = 330, 30, 540, 740
    p.rect(cx0, cy0, cw, ch, fill="#d9d4c4", rx=26, stroke="#8c8672", stroke_width=6)
    foil = p.gradient([(0, "#f6b3c8"), (0.2, "#f6e7b8"), (0.4, "#a8e6cf"), (0.6, "#9fc6f2"), (0.8, "#d4b0f2"),
                       (1, "#f6b3c8")], x1=0, y1=0, x2=1, y2=1)
    p.rect(cx0 + 20, cy0 + 20, cw - 40, ch - 40, fill=foil, rx=18)
    for k in range(10):
        x = cx0 - 200 + k * 90
        p.poly([(x, cy0 + 20), (x + 40, cy0 + 20), (x + 340, cy0 + ch - 20), (x + 300, cy0 + ch - 20)],
               fill="#ffffff", opacity=0.12)
    # art window: the breach
    ax, ay, aw, ah = cx0 + 50, cy0 + 90, cw - 100, 400
    p.rect(ax, ay, aw, ah, fill="#5E7375", stroke="#2a2a2a", stroke_width=5)
    p.text(cx0 + 50, cy0 + 72, "AEGIS", size=44, family="sans-serif", fill="#2a2a2a", font_weight="bold",
           letter_spacing="6")
    # the breach outline and tangram pieces
    bx, by = ax + 70, ay + 60
    s = 150
    pieces = [
        [(0, 0), (2, 0), (1, 1)], [(0, 0), (1, 1), (0, 2)], [(2, 0), (2, 1), (1.5, 0.5)],
        [(1, 1), (1.5, 0.5), (2, 1), (1.5, 1.5)], [(2, 1), (2, 2), (1.5, 1.5)], [(0, 2), (1, 1), (1.5, 1.5), (0.5, 2)],
    ]
    fills = ["#f6e7b8", "#e9f2d8", "#d6ecf6", "#f2dff0", "#f6eccf", "#e2f0e6"]
    for pts, col in zip(pieces, fills):
        p.poly([(bx + x * s, by + y * s) for x, y in pts], fill=col, stroke="#ffffff", stroke_width=3, opacity=0.95)
    # the gap: where the keystone goes
    gap = [(0.5, 2), (1.5, 1.5), (2, 2)]
    p.poly([(bx + x * s, by + y * s) for x, y in gap], fill="#2b2b2b", stroke=HARDLIGHT, stroke_width=3,
           stroke_dasharray="8 6")
    # the keystone, held outside
    kx, ky = ax + aw - 60, ay + ah - 40
    p.poly([(kx - 70, ky), (kx + 30, ky - 50), (kx + 80, ky)], fill=HARDLIGHT, stroke="#ffffff", stroke_width=3)
    p.text(kx - 80, ky + 34, "HOPE?", size=22, family="sans-serif", fill="#ffffff", font_weight="bold")
    # stat box
    sx, sy = cx0 + 50, cy0 + 520
    p.rect(sx, sy, cw - 100, 170, fill="#f4f0e2", stroke="#2a2a2a", stroke_width=4, rx=8)
    p.text(sx + 20, sy + 50, "LOAD", size=28, family="sans-serif", fill="#2a2a2a", font_weight="bold")
    p.rect(sx + 120, sy + 26, 280, 30, fill="#ffffff", stroke="#2a2a2a", stroke_width=2)
    p.rect(sx + 120, sy + 26, 150, 30, fill=GOLD)
    p.text(sx + 20, sy + 110, "PANES", size=28, family="sans-serif", fill="#2a2a2a", font_weight="bold")
    p.text(sx + 140, sy + 110, "6 / 7", size=32, family="sans-serif", fill="#2a2a2a", font_weight="bold")
    p.text(sx + 20, sy + 152, "SERIES 2240", size=18, family="sans-serif", fill="#6a6450", letter_spacing="3")

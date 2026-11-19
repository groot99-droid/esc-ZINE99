"""Phase 3 (accepted 2026-11-15, built 2026-11-16): the price. Ending-card lettering for the six endings,
June's forearm with the List in biro (the only copy left once the notebook is on the fire), the notebook
on the fire in wax crayon, and the second run's document: the logbook's front page read upside down
through the map lens."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G

# ---- ending-card lettering ---------------------------------------------------------------------------
# Each ending's name set as the heading of a survey sheet in printed green, with Tam's pencil under it.
# The author's ending keeps every letter; the others lose letters as their endings lose things.
ENDINGS = [
    ("slipped-through", "SLIPPED THROUGH", 0, "as written", "Every row kept, and no one to show them to."),
    ("brought-along", "BROUGHT ALONG", 2, "", "Someone at home no longer knows to wait."),
    ("held", "HELD", 0, "", "Safe, and remembered by no one outside."),
    ("nothing-missing", "NOTHING MISSING", 5, "", "June's forearm is clean."),
    ("one-who-left", "THE ONE WHO LEFT", 3, "", "Channel two begins the list."),
    ("unlisted", "UNLISTED", 2, "", ""),
]


def lettering(key, word, lost, tag, line):
    @asset(G, f"ending-lettering-{key}", group="title", title=f"Ending lettering: {word.title()}", w=1600, h=320,
           row="Ending cards")
    def draw(a: Art):
        r = a.rng
        a.paper(kit.PAPER, grain=0.1, fibre=1.0)
        a.rect(30, 26, 1540, 268, fill="none", stroke=kit.INK, stroke_width=1.4)
        a.rect(38, 34, 1524, 252, fill="none", stroke=kit.INK, stroke_width=0.6)
        for k in range(4):
            pts = [(40 + i * 152, 170 + 40 * (k - 1.5) + 22 * math.sin(i * 0.9 + k)) for i in range(11)]
            a.path(a.smooth_d(pts), fill="none", stroke="#9B6A3C", stroke_width=0.9, opacity=0.3)
        kit.printed(a, 62, 76, "HOLLIN CREEK — HOW IT ENDED", size=19, letter_spacing="6")
        a.line(62, 90, 1538, 90, stroke=kit.INK, stroke_width=0.8)
        size = 108 if len(word) <= 12 else 92
        # one run of type; the letters that have gone keep only the plate's pressure
        cut = 0 if key == "slipped-through" else lost
        idx, seen = 0, 0
        while idx < len(word) and seen < cut:
            if word[idx] != " ":
                seen += 1
            idx += 1
        gone, kept = word[:idx], word[idx:]
        base = f'font-family="serif" font-weight="bold" font-size="{size}" letter-spacing="6"'
        a.raw(f'<text x="68.5" y="215" {base} fill="#1d4426" opacity="0.3"><tspan fill-opacity="0">{gone}</tspan>{kept}</text>')
        a.raw(f'<text x="66" y="212" {base} fill="{kit.INK}"><tspan fill="#d6ccb0" opacity="0.6">{gone}</tspan>{kept}</text>')
        if tag:
            kit.printed(a, 1538, 76, tag.upper(), size=19, letter_spacing="4", text_anchor="end", color=kit.RED)
        if key == "unlisted":
            # nothing in pencil underneath: the notebook went on the fire
            a.rect(1080, 236, 420, 34, fill="none", stroke="#b8ac8e", stroke_width=1.2, stroke_dasharray="6 6")
            kit.printed(a, 1290, 259, "NO PENCIL", size=14, letter_spacing="5", text_anchor="middle", color="#9a948a")
        else:
            kit.hand(a, 66, 270, word.title(), size=40, rot=-1)
            kit.hand(a, 820, 270, line, size=28, rot=-0.6, color="#5a5a58")
        kit.tooth(a, 0.07)
    draw.__doc__ = (f"The ending's name, {word.title()}, as the heading of a survey sheet in forest-green printed ink over faint "
                    f"contours; {'every letter is still printed' if not lost or key == 'slipped-through' else f'{lost} of its letters have gone, leaving only the plate pressure'}. "
                    + ("Under it, nothing in pencil: a dashed empty box where Tam's hand would be." if key == "unlisted"
                       else f"Under it, Tam's pencil copy of the name and one line: \"{line}\""))
    return draw


for _e in ENDINGS:
    lettering(*_e)


# ---- June's forearm, the List in biro ----------------------------------------------------------------
BIRO = "#1f3fa0"
ARM_LIST = ["a washing line", "a camp chair", "a hammock", "a dog's bowl", "a blue enamel kettle", "a fishing rod",
            "the owl box", "a kite", "the shallow pool", "a guitar", "a paddle", "milk in the creek", "a windbreak",
            "a red wagon", "a radio", "the tall cedar", "Puddle", "a tyre swing", "a lantern on a pole"]


@asset(G, "june-arm-list", group="documents", title="June's forearm: the List in biro", w=1200, h=520,
       row="Phase 3: June's arm")
def june_arm(a: Art):
    """June's forearm laid along the frame by firelight, the inside of the arm toward us, written over from wrist to elbow in blue biro: the nineteen things of the List in order, small and crowded, the later ones squeezed in round the curve of the arm, some smudged by a thumb. No face, no hand gesture; only the arm on a dark sleeve and the firelight."""
    r = a.rng
    a.rect(0, 0, 1200, 520, fill="#1a1410")
    a.ellipse(980, 520, 600, 320, fill=a.radial([(0, "#f2a541", 0.35), (1, "#f2a541", 0)]))
    # the sleeve
    a.poly([(1010, 90), (1200, 60), (1200, 470), (1020, 440)], fill="#3f5a3a")
    a.hatch(1010, 60, 190, 410, angle=70, spacing=7, stroke="#2c4229", stroke_width=1.2)
    # the arm: elbow at right, wrist at left
    top = [(60, 205), (300, 182), (600, 160), (860, 140), (1030, 120)]
    bot = [(1040, 420), (860, 400), (600, 366), (300, 338), (60, 320)]
    a.path(a.smooth_d(top + bot, closed=True), fill="#8a5a3e")
    a.path(a.smooth_d([(70, 230), (320, 212), (620, 196), (900, 180), (1030, 170)]), fill="none", stroke="#a3714f",
           stroke_width=40, opacity=0.45, stroke_linecap="round")
    a.path(a.smooth_d([(80, 300), (320, 318), (620, 340), (900, 370)]), fill="none", stroke="#5e3a26", stroke_width=26,
           opacity=0.35, stroke_linecap="round")
    a.stipple(60, 140, 980, 280, n=500, r=(0.4, 1.0), fill="#5e3a26", opacity=0.35)
    # the List in biro, wrist first, three lines that run along the arm
    rows = [ARM_LIST[0:5], ARM_LIST[5:10], ARM_LIST[10:15], ARM_LIST[15:19]]
    num = 0
    for li, items in enumerate(rows):
        y0 = 214 + li * 36
        x = 96 + li * 14
        for it in items:
            num += 1
            s = f"{num}. {it}"
            ang = -3.2 + li * 0.9
            a.text(x, y0 - x * 0.055, s, size=20 - li, family="cursive", fill=BIRO, opacity=0.88,
                   transform=f"rotate({f(ang)} {f(x)} {f(y0)})")
            x += len(s) * (9.4 - li * 0.4) + 14
    # a thumb's smudge over a few words
    a.ellipse(520, 262, 46, 20, fill="#8a5a3e", opacity=0.55, filter=a.blur(4))
    kit.tooth(a, 0.1, white=True)


# ---- the notebook on the fire ------------------------------------------------------------------------
@asset(G, "notebook-on-fire", group="pieces", title="The notebook on the fire", w=480, h=480,
       row="Phase 3: the notebook on the fire")
def notebook_fire(a: Art):
    """Wax crayon on kraft paper, as Pack List is drawn: the fire ring seen from above, a ring of grey stones, and in the coals Tam's pencil notebook lying open, its ruled pages curling and browning from the corners, flames in red, orange and yellow over it. No hand, no face."""
    r = a.rng
    a.rect(0, 0, 480, 480, fill=kit.KRAFT)
    a.stipple(0, 0, 480, 480, n=260, r=(0.6, 1.4), fill="#6e4f2e", opacity=0.35)
    for i in range(12):
        ang = i / 12 * math.tau
        pts = kit.loop_pts(240 + math.cos(ang) * 170, 250 + math.sin(ang) * 160, 30, 26, 7, wob=0.12, rng=r)
        a.poly(pts, fill=kit.C_GRY, opacity=0.85)
        kit.crayon(a, pts, kit.C_BLK, width=5, passes=1, closed=True)
    a.poly(kit.loop_pts(240, 250, 130, 120, 14, wob=0.06, rng=r), fill="#2b1d14")
    # the notebook, open
    nb = [(150, 210), (240, 196), (330, 214), (322, 318), (238, 300), (158, 322)]
    a.poly(nb, fill="#f4ead2")
    kit.crayon(a, nb, kit.C_BLK, width=4, closed=True)
    kit.crayon(a, [(240, 196), (238, 300)], kit.C_BLK, width=3)
    for k in range(5):
        kit.crayon(a, [(166, 232 + k * 16), (232, 222 + k * 16)], kit.C_BLUE, width=2, passes=1, opacity=0.5)
        kit.crayon(a, [(248, 222 + k * 16), (316, 236 + k * 16)], kit.C_BLUE, width=2, passes=1, opacity=0.5)
    for (x, y) in [(158, 316), (322, 312), (330, 218)]:
        a.poly(kit.loop_pts(x, y, 26, 22, 8, wob=0.15, rng=r), fill=kit.C_BRN, opacity=0.75)
    for c, s in [(kit.C_RED, 1.0), (kit.C_ORG, 0.72), (kit.C_YEL, 0.45)]:
        pts = []
        for i in range(18):
            ang = i / 18 * math.tau
            rr = (110 if i % 2 else 62) * s
            pts.append((240 + math.cos(ang) * rr, 250 + math.sin(ang) * rr * 0.9))
        kit.crayon(a, pts, c, width=7, passes=2, closed=True, opacity=0.7)


# ---- the second run: the front page, upside down, through the map lens -----------------------------------
@asset(G, "lens-front-page", group="documents", title="The logbook's front page through the map lens, upside down",
       w=600, h=600, row="Phase 3: second-run documents")
def lens_front(a: Art):
    """A second playthrough's document: the round brass-rimmed map lens held over the booth counter, and under it, upside down because the book lies facing the ranger, the pencil front page of the logbook: the heading Sites, a party of five at 20 to 24 and an empty check-out, in a younger hand than the ink that keeps the book."""
    r = a.rng
    a.rect(0, 0, 600, 600, fill="#3A3530")
    a.stipple(0, 0, 600, 600, n=300, r=(0.8, 2.2), fill="#2A2622")
    a.rect(40, 70, 520, 460, fill="#EFE8D4")
    for k in range(10):
        a.line(52, 110 + k * 42, 548, 110 + k * 42, stroke="#9FB9C4", stroke_width=1)
    a.open("g", transform="rotate(180 300 300)")
    kit.hand(a, 140, 160, "Sites", size=44)
    for k, s in enumerate(["20–24   a party of five", "21   the split boulder, slept in the crack", "in: August",
                           "out:"]):
        kit.hand(a, 130, 236 + k * 58, s, size=24)
    kit.pencil(a, [(186, 404), (380, 402)], w=1.6)
    a.close()
    # the lens
    cid = a.uid("lens")
    a.defn(f'<clipPath id="{cid}"><circle cx="300" cy="300" r="200"/></clipPath>')
    a.rect(0, 0, 600, 600, fill="#000", opacity=0.28)
    a.open("g", clip_path=f"url(#{cid})")
    a.rect(40, 70, 520, 460, fill="#fff8e8", opacity=0.15)
    a.close()
    a.circle(300, 300, 200, fill="none", stroke="#a8843c", stroke_width=22)
    a.circle(300, 300, 211, fill="none", stroke="#5a4520", stroke_width=3)
    a.circle(300, 300, 189, fill="none", stroke="#e2c27a", stroke_width=2, opacity=0.7)
    a.path("M170 190 A170 170 0 0 1 300 130", fill="none", stroke="#fff", stroke_width=6, opacity=0.35, stroke_linecap="round")
    a.rect(470, 470, 30, 120, fill="#5a4520", transform="rotate(-45 485 530)")
    kit.tooth(a, 0.08)

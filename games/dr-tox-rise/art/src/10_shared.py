"""Shared art: the title lettering and the loading screen's pieces, eleven chapter cards, the HUD icons
(Pulse, Amber, Self and the Terminology Rule's two words), and four ending lettering plates.

These belong to no mode, so they keep the game's own register rather than one of the seven mode styles:
graded concrete, film grain, typed caption boxes and the two signal colours."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, AMBER, GOLD, GREEN = kit.INK, kit.AMBER, kit.GOLD, kit.GREEN
CAP = "#f3eedf"          # caption-box paper


def ground(a, color=kit.CONCRETE, grain=0.35, vig=0.55):
    a.paper(color, grain=grain, fibre=1.1)
    a.vignette(vig)


def caption_box(a, x, y, w, h, text, size=None, fit=True):
    a.rect(x + 5, y + 5, w, h, fill="#000", opacity=0.45)
    a.rect(x, y, w, h, fill=CAP, stroke=INK, stroke_width=3)
    sz = size or h * .5
    kit.label(a, x + 16, y + h / 2 + sz * .36, text, size=sz, family="sans-serif", fill=INK, font_weight="bold",
              letter_spacing=f(sz * .06), fit=(w - 32) if fit and len(text) * sz * .62 > w - 32 else None)


# ---- title and loading -------------------------------------------------------------------------
@asset(G, "title-rise", group="title", title="Title lettering: Dr. Tox: Rise", w=1200, h=420,
       row=kit.row("loading", "Title lettering"))
def title_rise(a: Art):
    """The title, DR. TOX in tall pale capitals over RISE in amber, on graded concrete with film grain;
    a thin amber monitor line runs under it, and a small line names the series and the episode."""
    ground(a, kit.NIGHT, 0.4, 0.5)
    a.rect(0, 0, 1200, 420, fill=kit.TEAL, opacity=0.12)
    kit.label(a, 600, 200, "DR. TOX", size=168, family="sans-serif", fill="#000", anchor="middle",
              font_weight="bold", letter_spacing="10", opacity=0.6, transform="translate(6,8)")
    kit.label(a, 600, 200, "DR. TOX", size=168, family="sans-serif", fill=kit.WHITE, anchor="middle",
              font_weight="bold", letter_spacing="10")
    a.path(kit.ecg_d(140, 262, 920, 34, beats=7), fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round")
    kit.label(a, 600, 352, "R I S E", size=78, family="serif", fill=AMBER, anchor="middle", letter_spacing="18")
    kit.label(a, 600, 396, "EPISODE 1 OF 4  ·  AGE OF GLASS & GREED", size=20, family="sans-serif",
              fill=kit.TEAL3, anchor="middle", letter_spacing="5")


@asset(G, "title-episodes", group="title", title="Episode strip: Rise open, Fall, Finale and Altrulan shut", w=1200, h=180,
       row=kit.row("loading", "Episode menu strip"))
def title_episodes(a: Art):
    """Four episode tabs side by side: RISE lit amber and open, FALL, FINALE and ALTRULAN in cold
    gray-teal behind a closed bar, as the episode menu shows them while only Rise is open."""
    ground(a, kit.NIGHT, 0.3, 0.3)
    for i, name in enumerate(("RISE", "FALL", "FINALE", "ALTRULAN")):
        x = 30 + i * 290
        open_ = i == 0
        a.rect(x, 30, 270, 120, rx=6, fill="#1d2526" if not open_ else "#2a1e0c",
               stroke=AMBER if open_ else kit.TEAL, stroke_width=4 if open_ else 2)
        kit.label(a, x + 135, 84, f"EPISODE {i + 1}", size=16, anchor="middle", fill=kit.TEAL3 if not open_ else GOLD,
                  letter_spacing="4")
        kit.label(a, x + 135, 126, name, size=34 if len(name) < 7 else 30, anchor="middle",
                  fill=GOLD if open_ else kit.TEAL2, font_weight="bold", letter_spacing="3")
        if not open_:
            a.rect(x + 20, 136, 230, 6, fill=kit.TEAL)


@asset(G, "loading-room", group="backdrops", title="Loading backdrop: the hospital room, 2217", w=1600, h=900,
       row=kit.row("loading", "Loading screen backdrop"))
def loading_room(a: Art):
    """The hospital room locked off and symmetrical under flat fluorescent tubes: a clear plastic breath
    tent over a bed, a thin upright figure behind the plastic, and against the wall the bench a child built
    from IV poles, steel trays and clamps, one amber vial on it the only warm thing."""
    a.rect(0, 0, 1600, 900, fill="#cfd6d4")
    a.rect(0, 640, 1600, 260, fill="#a9b4b2")
    a.line(0, 640, 1600, 640, stroke="#7f8c8b", stroke_width=3)
    for x in (300, 800, 1300):                       # tubes
        a.rect(x - 160, 40, 320, 18, rx=9, fill="#f6f8f7", stroke="#9aa5a4", stroke_width=2)
        a.rect(x - 220, 58, 440, 300, fill="#ffffff", opacity=0.12)
    a.rect(0, 0, 1600, 30, fill="#9aa5a4")
    # the bench: two IV poles, trays, clamps
    for x in (1080, 1400):
        a.line(x, 220, x, 640, stroke="#6e7a79", stroke_width=8)
        a.line(x - 40, 220, x + 40, 220, stroke="#6e7a79", stroke_width=6)
        a.path(f"M{x - 40},220 q-6,20 -20,20 M{x + 40},220 q6,20 20,20", fill="none", stroke="#6e7a79", stroke_width=4)
    for y in (420, 520):
        a.rect(1060, y, 360, 16, fill="#b8c1c0", stroke="#6e7a79", stroke_width=3)
        for k in range(4):
            a.rect(1090 + k * 80, y - 14, 30, 14, fill="#8a9a99")
    a.path(kit.vial_d(1250, 482, 26, 64), fill=AMBER, stroke="#6e5a2a", stroke_width=3)
    a.circle(1250, 470, 70, fill=a.radial([(0, GOLD, 0.35), (1, GOLD, 0)]))
    # bed and tent
    a.rect(220, 520, 620, 60, fill="#e9ecea", stroke="#7f8c8b", stroke_width=3)
    for x in (240, 820):
        a.line(x, 580, x, 680, stroke="#6e7a79", stroke_width=8)
    a.path(kit.figure_d(530, 520, 1.55), fill="#6e7a79", opacity=0.55)
    a.path("M160,600 C180,260 300,170 530,170 C760,170 880,260 900,600Z", fill="#eef4f3", opacity=0.55,
           stroke="#ffffff", stroke_width=4)
    for k in range(6):
        x = 220 + k * 110
        a.path(f"M{x},590 C{x + 10},380 {x + 30},250 {x + 60},200", fill="none", stroke="#ffffff", stroke_width=2,
               opacity=0.7)
    a.ellipse(560, 300, 60, 36, fill="#ffffff", opacity=0.6)     # breath on the plastic
    # tubing, four metres of it, to the wall
    a.path("M640,560 C700,700 860,720 960,640 C1000,610 1040,600 1080,600", fill="none", stroke="#f6f8f7",
           stroke_width=5, opacity=0.9)
    a.rect(0, 0, 1600, 900, fill=a.radial([(0.6, "#000", 0), (1, "#000", 0.35)], r=0.75))


@asset(G, "loading-monitor-green", group="ui", title="Loading monitor line, green (before the dose)", w=1200, h=140,
       row=kit.row("loading", "Animated element: the monitor line, first state"))
def monitor_green(a: Art):
    """A black monitor strip with a sickly green heart trace and a grid: the line before the first dose.
    The loading screen crossfades it into the amber strip as the bar fills."""
    a.rect(0, 0, 1200, 140, fill="#060807")
    a.grid(0, 0, 1200, 140, 28, stroke="#13201a", stroke_width=1)
    a.path(kit.ecg_d(20, 84, 1160, 50, beats=9, spike=1.1), fill="none", stroke=GREEN, stroke_width=4, stroke_linejoin="round")
    kit.label(a, 20, 28, "PULSE", size=16, family="monospace", fill=GREEN, letter_spacing="3")
    for k, t in enumerate(("II", "HR", "mm/s 25")):
        kit.label(a, 1180 - k * 110, 28, t, size=13, family="monospace", fill=GREEN, anchor="end", opacity=0.6)


@asset(G, "loading-monitor-amber", group="ui", title="Loading monitor line, amber (the dose in)", w=1200, h=140,
       row=kit.row("loading", "Animated element: the monitor line, second state"))
def monitor_amber(a: Art):
    """The same monitor strip after the dose: the trace slower and lower, in amber. The colour grammar's
    first lesson, without a word."""
    a.rect(0, 0, 1200, 140, fill="#060807")
    a.grid(0, 0, 1200, 140, 28, stroke="#201a10", stroke_width=1)
    a.path(kit.ecg_d(20, 84, 1160, 32, beats=6, spike=0.9), fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round")
    kit.label(a, 20, 28, "PULSE", size=16, family="monospace", fill=AMBER, letter_spacing="3")
    for k, t in enumerate(("II", "HR", "mm/s 25")):
        kit.label(a, 1180 - k * 110, 28, t, size=13, family="monospace", fill=AMBER, anchor="end", opacity=0.6)


# ---- chapter cards -----------------------------------------------------------------------------
def emblem(a, i, cx, cy):
    """One object per chapter, drawn flat and large."""
    S = dict(stroke=INK, stroke_width=5, stroke_linejoin="round")
    if i == 0:      # the first dose
        kit.syringe(a, cx - 210, cy, 420, rot=-18, body="#3a4243", sw=5)
    elif i == 1:    # a painted sky and a loop of string
        a.rect(cx - 220, cy - 150, 440, 300, fill=kit.SKY, **S)
        a.rect(cx - 220, cy + 60, 440, 90, fill=kit.FIELD, stroke="none")
        a.rect(cx - 220, cy - 150, 440, 300, fill="none", **S)
        for c in ((cx - 120, cy - 70), (cx + 60, cy - 100)):
            a.ellipse(c[0], c[1], 50, 18, fill="#f4f7fb")
        a.path(f"M{cx - 120},{cy + 20} L{cx},{cy - 50} L{cx + 120},{cy + 20} L{cx},{cy + 90}Z M{cx - 120},{cy + 20} L{cx + 120},{cy + 20}",
               fill="none", stroke="#ffffff", stroke_width=6, stroke_linejoin="round")
    elif i == 2:    # the river and the pipe at night
        a.path(f"M{cx - 240},{cy + 40} C{cx - 120},{cy + 10} {cx + 80},{cy + 80} {cx + 240},{cy + 40} L{cx + 240},{cy + 150} L{cx - 240},{cy + 150}Z",
               fill="#3f5253", **S)
        a.rect(cx - 240, cy - 60, 200, 56, fill="#6e7a79", **S)
        a.ellipse(cx - 40, cy - 32, 16, 28, fill="#2b3536", **S)
        a.path(f"M{cx - 30},{cy - 8} C{cx},{cy + 30} {cx + 10},{cy + 60} {cx + 40},{cy + 80}", fill="none",
               stroke="#c9cfc0", stroke_width=16, stroke_linecap="round")
        a.circle(cx + 160, cy - 110, 26, fill="#c4cdcb", stroke="none")
    elif i == 3:    # training blades thrown down on a floor split by a seam
        a.rect(cx - 250, cy + 40, 500, 110, fill="#9aa5a4", **S)
        a.path(f"M{cx - 10},{cy + 40} L{cx + 8},{cy + 80} L{cx - 6},{cy + 110} L{cx + 10},{cy + 150}", fill="none",
               stroke=INK, stroke_width=7)
        for k, (x, r) in enumerate(((-170, -12), (-80, 18), (60, -24), (150, 8))):
            a.open("g", transform=f"translate({cx + x},{cy + 80}) rotate({r})")
            a.rect(-50, -7, 70, 14, rx=3, fill="#d8dddc", stroke=INK, stroke_width=4)
            a.rect(20, -11, 34, 22, rx=4, fill="#4a5556", stroke=INK, stroke_width=4)
            a.close()
    elif i == 4:    # a chain-link fence and a typed rota
        a.rect(cx - 230, cy - 140, 300, 280, fill="#2b3536", **S)
        a.hatch(cx - 230, cy - 140, 300, 280, angle=45, spacing=26, stroke="#8a9a99", stroke_width=3,
                clip=a.clip(f'<rect x="{cx - 230}" y="{cy - 140}" width="300" height="280"/>'))
        a.hatch(cx - 230, cy - 140, 300, 280, angle=-45, spacing=26, stroke="#8a9a99", stroke_width=3,
                clip=a.clip(f'<rect x="{cx - 230}" y="{cy - 140}" width="300" height="280"/>'))
        a.rect(cx + 90, cy - 120, 150, 210, fill=CAP, **S)
        for k in range(6):
            a.line(cx + 104, cy - 92 + k * 30, cx + 104 + (110 if k % 2 else 80), cy - 92 + k * 30, stroke=INK, stroke_width=4)
    elif i == 5:    # an insignia under the program's amber light
        a.circle(cx, cy, 170, fill=a.radial([(0, GOLD, 0.55), (1, GOLD, 0)]))
        a.path(f"M{cx - 90},{cy - 100} L{cx + 90},{cy - 100} L{cx + 90},{cy + 10} C{cx + 90},{cy + 80} {cx},{cy + 120} {cx},{cy + 120} C{cx},{cy + 120} {cx - 90},{cy + 80} {cx - 90},{cy + 10}Z",
               fill="#f4ead2", **S)
        a.path(f"M{cx - 56},{cy + 20} A56,56 0 0,1 {cx + 56},{cy + 20}Z", fill=AMBER, stroke=INK, stroke_width=4)
        a.line(cx - 70, cy + 20, cx + 70, cy + 20, stroke=INK, stroke_width=5)
    elif i == 6:    # a pin board, red string between cards
        a.rect(cx - 240, cy - 150, 480, 300, fill="#7a6a52", **S)
        pins = [(cx - 170, cy - 90), (cx + 20, cy - 110), (cx + 170, cy - 40), (cx - 90, cy + 70), (cx + 110, cy + 90)]
        for (x, y) in pins:
            a.rect(x - 34, y - 24, 68, 48, fill="#e8e2d0", stroke=INK, stroke_width=3)
        a.path(kit.P([pins[0], pins[1], pins[2], pins[4], pins[3], pins[0]]), fill="none", stroke="#9b1c1c", stroke_width=4)
        for (x, y) in pins:
            a.circle(x, y - 18, 6, fill="#9b1c1c", stroke=INK, stroke_width=2)
    elif i == 7:    # a hard-light bar across a corridor
        a.rect(cx - 250, cy - 120, 500, 260, fill="#9fb0ae", **S)
        a.rect(cx - 250, cy + 90, 500, 50, fill="#8c9897", **S)
        a.rect(cx - 30, cy - 120, 60, 260, fill="#f6e2a8", opacity=0.9, stroke=INK, stroke_width=4)
        a.rect(cx - 12, cy - 120, 24, 260, fill="#fff6dc")
    elif i == 8:    # a sheet of fiche
        a.rect(cx - 230, cy - 150, 460, 300, fill="#0b0b0b", stroke=kit.WHITE, stroke_width=4)
        for r in range(7):
            for c in range(10):
                a.rect(cx - 210 + c * 42, cy - 130 + r * 40, 34, 30, fill="none", stroke=kit.WHITE, stroke_width=1.6)
        a.rect(cx - 210 + 5 * 42, cy - 130 + 3 * 40, 34, 30, fill=AMBER)
    elif i == 9:    # four shapes at a door
        a.rect(cx - 250, cy - 150, 500, 300, fill="#1b2122", **S)
        a.rect(cx - 70, cy - 120, 140, 270, fill=AMBER, opacity=0.85)
        shapes = [kit.person_d(cx - 170, cy + 150, 1.1, 1.5), kit.person_d(cx - 60, cy + 150, 1.2),
                  kit.person_d(cx + 60, cy + 150, 1.2), kit.person_d(cx + 170, cy + 150, 1.0, 1.3)]
        for k, d in enumerate(shapes):
            a.path(d, fill="#0a0d0d", opacity=0.3 if k == 2 else 1)
    else:           # the amber work lamp
        a.rect(cx - 250, cy - 150, 500, 300, fill="#070606", **S)
        a.circle(cx, cy - 40, 220, fill=a.radial([(0, GOLD, 0.8), (0.5, AMBER, 0.35), (1, AMBER, 0)]))
        a.path(f"M{cx - 60},{cy - 70} L{cx + 60},{cy - 70} L{cx + 36},{cy - 120} L{cx - 36},{cy - 120}Z", fill="#2a2a2a", stroke=INK, stroke_width=4)
        a.line(cx, cy - 120, cx, cy - 150, stroke="#2a2a2a", stroke_width=6)
        a.rect(cx - 120, cy + 80, 240, 16, fill="#3a3020")
        a.path(kit.vial_d(cx + 60, cy + 54, 20, 50), fill=AMBER, stroke=INK, stroke_width=3)


def chapter(i):
    name, cid, lead, date = kit.CHAPTERS[i]

    def draw(a: Art):
        if lead == "alexander":
            ground(a, kit.CONCRETE, 0.4, 0.6)
        elif i == 1:
            a.rect(0, 0, 1280, 720, fill=kit.WHITE)
            a.rect(0, 0, 1280, 720, fill=kit.SKY, opacity=0.25)
        elif i == 3:
            ground(a, "#c9cfcd", 0.25, 0.25)
        else:
            ground(a, "#3a2a16", 0.35, 0.45)
            a.circle(640, 120, 640, fill=a.radial([(0, GOLD, 0.35), (1, GOLD, 0)]))
        emblem(a, i, 900, 330)
        dark = lead == "alexander" or i in (5, 7)
        fg = kit.WHITE if dark else INK
        caption_box(a, 70, 70, 420, 56, date, size=24)
        kit.label(a, 72, 560, f"CHAPTER {kit.ROMAN[i]}", size=26, fill=GOLD if dark else "#4a3a20", letter_spacing="6")
        kit.label(a, 70, 630, name.upper(), size=58 if len(name) < 16 else 44, fill=fg, font_weight="bold",
                  letter_spacing="2", fit=1120 if len(name) > 22 else None)
        if lead == "alexander":      # the Pulse margin: amber, every Alexander page
            a.rect(0, 676, 1280, 44, fill="#050606")
            a.path(kit.ecg_d(20, 704, 1240, 16, beats=10), fill="none", stroke=AMBER, stroke_width=3)
    draw.__doc__ = (f"Chapter card {i + 1}, {name}: a dated caption box ({date.title() if date[0].isalpha() else date}) "
                    f"over {'concrete with an amber Pulse margin line, the mark of an Alexander chapter' if lead == 'alexander' else 'the program world of a Reese chapter, which has no margin line'}, "
                    f"the chapter's name in capitals and one object drawn large.")
    asset(G, f"chapter-{i + 1}", group="chapters", title=f"Chapter {kit.ROMAN[i]}: {name}", w=1280, h=720,
          row=kit.row("shared", f"Chapter card ({cid})"))(draw)


for _i in range(11):
    chapter(_i)


# ---- HUD: Pulse, Amber, Self, and the Terminology Rule's two words ----------------------------
def icon_ground(a):
    a.rect(4, 4, 88, 88, rx=14, fill="#0b0e0e", stroke="#2f3a3b", stroke_width=3)
    for x, y in ((14, 14), (82, 14), (14, 82), (82, 82)):
        a.circle(x, y, 2, fill="#2f3a3b")


@asset(G, "hud-pulse", group="ui", title="HUD icon: Pulse (calm)", w=96, h=96, row=kit.row("shared", "HUD: Pulse"))
def hud_pulse(a: Art):
    """The Pulse icon: one sharp amber spike on a black monitor tile, the heart held."""
    icon_ground(a)
    a.path(kit.ecg_d(12, 56, 72, 30, beats=1), fill="none", stroke=AMBER, stroke_width=5, stroke_linejoin="round", stroke_linecap="round")
    a.line(12, 72, 84, 72, stroke="#2f3a3b", stroke_width=2)


@asset(G, "hud-pulse-edge", group="ui", title="HUD icon: Pulse at the edge (green spikes)", w=96, h=96,
       row=kit.row("shared", "HUD: Pulse"))
def hud_pulse_edge(a: Art):
    """The Pulse icon at 70 to 94: an amber line broken by two taller green spikes, the toxin pushing."""
    icon_ground(a)
    a.path(kit.ecg_d(10, 60, 76, 26, beats=2), fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round")
    a.path("M72,60 L76,20 L80,70 L84,60", fill="none", stroke=GREEN, stroke_width=3.5,
           stroke_linejoin="round")


@asset(G, "hud-amber", group="ui", title="HUD icon: Amber (a dose on hand)", w=96, h=96, row=kit.row("shared", "HUD: Amber"))
def hud_amber(a: Art):
    """The Amber icon: one vial, full, the warm gold of the cage holding; repeat it for each dose."""
    icon_ground(a)
    a.path(kit.vial_d(48, 50, 30, 64), fill="#1b2021", stroke=kit.TEAL3, stroke_width=3)
    a.path(kit.vial_d(48, 54, 22, 46), fill=AMBER)
    a.rect(41, 36, 6, 30, rx=3, fill=GOLD, opacity=0.8)


@asset(G, "hud-amber-empty", group="ui", title="HUD icon: Amber (an empty slot)", w=96, h=96, row=kit.row("shared", "HUD: Amber"))
def hud_amber_empty(a: Art):
    """An empty vial outline in gray-teal: a dose not on hand."""
    icon_ground(a)
    a.path(kit.vial_d(48, 50, 30, 64), fill="none", stroke=kit.TEAL, stroke_width=3, stroke_dasharray="5 4")


@asset(G, "hud-self", group="ui", title="HUD icon: Self (a struck word)", w=96, h=96, row=kit.row("shared", "HUD: Self"))
def hud_self(a: Art):
    """The Self icon: a small typed caption box with three lines of words, one word struck through in
    black, as Self strikes words from his captions."""
    icon_ground(a)
    a.rect(14, 22, 68, 52, fill=CAP, stroke=INK, stroke_width=2)
    for k, (x0, y, w) in enumerate(((20, 34, 22), (46, 34, 30), (20, 48, 26), (50, 48, 26), (20, 62, 36))):
        a.rect(x0, y - 3, w, 6, fill="#7a7a72")
    a.line(44, 50, 80, 46, stroke="#9b1c1c", stroke_width=4, stroke_linecap="round")


@asset(G, "hud-margin-calm", group="ui", title="Pulse margin line: calm (amber)", w=1200, h=32,
       row=kit.row("shared", "HUD: Pulse margin strip"))
def margin_calm(a: Art):
    """The thin margin line every Alexander page keeps: amber, below Pulse 70."""
    a.rect(0, 0, 1200, 32, fill="#050606")
    a.path(kit.ecg_d(8, 20, 1184, 11, beats=12), fill="none", stroke=AMBER, stroke_width=2.5, stroke_linejoin="round")
    for x in (300, 600, 900):
        a.line(x, 28, x, 31, stroke=AMBER, stroke_width=1, opacity=0.5)


@asset(G, "hud-margin-edge", group="ui", title="Pulse margin line: at the edge (amber, green spikes)", w=1200, h=32,
       row=kit.row("shared", "HUD: Pulse margin strip"))
def margin_edge(a: Art):
    """The margin line from Pulse 70 to 94: amber with three green spikes breaking through, never more
    green than amber."""
    a.rect(0, 0, 1200, 32, fill="#050606")
    a.path(kit.ecg_d(8, 20, 1184, 11, beats=14), fill="none", stroke=AMBER, stroke_width=2.5, stroke_linejoin="round")
    for x in (230, 640, 1010):
        a.path(f"M{x - 6},20 L{x},2 L{x + 5},30 L{x + 10},20", fill="none", stroke=GREEN, stroke_width=2.5)


@asset(G, "hud-margin-green", group="ui", title="Pulse margin line: 100 (green from the corners)", w=1200, h=32,
       row=kit.row("shared", "HUD: Pulse margin strip"))
def margin_green(a: Art):
    """The margin at Pulse 100: green creeping in from both corners over the amber line, which is still
    there in the middle. The page cuts to black after this."""
    a.rect(0, 0, 1200, 32, fill="#050606")
    a.path(kit.ecg_d(8, 20, 1184, 14, beats=16, spike=1.3), fill="none", stroke=AMBER, stroke_width=2.5)
    g = a.gradient([(0, GREEN), (0.3, GREEN), (0.42, "#050606"), (0.58, "#050606"), (0.7, GREEN), (1, GREEN)], 0, 0, 1, 0)
    a.rect(0, 0, 1200, 32, fill=g, opacity=0.75)
    a.path(kit.ecg_d(8, 20, 1184, 14, beats=16, spike=1.3), fill="none", stroke=GREEN, stroke_width=2,
           clip_path=a.clip('<rect x="0" y="0" width="380" height="32"/><rect x="820" y="0" width="380" height="32"/>'))


@asset(G, "hud-word-rcc", group="ui", title="Terminology Rule: RCC (the plate)", w=240, h=96,
       row=kit.row("shared", "HUD: the Word (Terminology Rule)"))
def word_rcc(a: Art):
    """The word RCC as the State's own signage has it: stamped capitals on a riveted gray-teal plate.
    Legible to the player; to no HOPE character."""
    kit.plate(a, 6, 10, 228, 76, "RCC", fill=kit.TEAL2, size=42)


@asset(G, "hud-word-hope", group="ui", title="Terminology Rule: HOPE (the insignia)", w=240, h=96,
       row=kit.row("shared", "HUD: the Word (Terminology Rule)"))
def word_hope(a: Art):
    """The word HOPE as the program wears it: a small shield insignia with a half sun rising over a bar,
    beside the word in warm capitals."""
    a.rect(6, 10, 228, 76, rx=38, fill="#2a1e0c", stroke=AMBER, stroke_width=3)
    a.path("M30,26 L70,26 L70,52 C70,70 50,80 50,80 C50,80 30,70 30,52Z", fill="#f4ead2", stroke=INK, stroke_width=3)
    a.path("M36,56 A14,14 0 0,1 64,56Z", fill=AMBER)
    a.line(34, 56, 66, 56, stroke=INK, stroke_width=3)
    kit.label(a, 146, 62, "HOPE", size=38, anchor="middle", fill=GOLD, font_weight="bold", letter_spacing="5")


@asset(G, "hud-caption", group="ui", title="Caption box (blank, for dated captions)", w=600, h=96,
       row=kit.row("shared", "Typed caption box"))
def hud_caption(a: Art):
    """A blank typed caption box with a drop shadow, the box every chapter opens on and every Alexander
    line is set in. Text is laid over it at run time."""
    a.rect(10, 12, 576, 74, fill="#000", opacity=0.45)
    a.rect(4, 6, 576, 74, fill=CAP, stroke=INK, stroke_width=3)
    a.rect(10, 12, 564, 62, fill="none", stroke=INK, stroke_width=0.8, opacity=0.5)
    for x in (16, 568):
        a.line(x, 18, x, 68, stroke=INK, stroke_width=0.6, opacity=0.25)


# ---- ending lettering plates -------------------------------------------------------------------
ENDINGS = (
    ("fully-dr-tox", "Fully Dr. Tox", True, "The 999 are only names.", "armored, armed, based in Snakehead."),
    ("the-cage-alone", "The Cage Alone", False, "The Observers are taken.", ""),
    ("green-in-the-archive", "Green in the Archive", False, "Self 25 lower before the Fall begins, and the Observers have seen what he is.", ""),
    ("the-spec-sheet", "The Spec Sheet", False, "He knows “Aegis”; security knows his face.", ""),
)


def ending_image(a, slug):
    """The ending's last image, small and still, in the left half."""
    if slug == "fully-dr-tox":          # the bay, the lamp, the syringe laid down
        a.rect(40, 40, 520, 595, fill="#060505")
        a.circle(300, 250, 300, fill=a.radial([(0, GOLD, 0.75), (0.45, AMBER, 0.3), (1, AMBER, 0)]))
        a.path("M240,170 L360,170 L336,120 L264,120Z", fill="#262626", stroke=INK, stroke_width=4)
        a.line(300, 120, 300, 40, stroke="#262626", stroke_width=6)
        a.rect(90, 470, 420, 22, fill="#2b2418")
        kit.syringe(a, 150, 452, 300, rot=-4, body="#2e3233", sw=3)
        a.path("M120,470 C140,420 200,400 260,410", fill="none", stroke="#d9dedd", stroke_width=2.5, opacity=0.7)
    elif slug == "the-cage-alone":      # the dry tank, lid open, the lamp on it
        a.rect(40, 40, 520, 595, fill="#060505")
        a.circle(300, 300, 260, fill=a.radial([(0, GOLD, 0.55), (1, AMBER, 0)]))
        a.rect(150, 300, 300, 260, fill="#1e2324", stroke=kit.TEAL, stroke_width=4)
        a.rect(158, 520, 284, 30, fill="#2b3536")
        a.path("M150,300 L120,190 L420,170 L450,300", fill="#151a1a", stroke=kit.TEAL, stroke_width=4)
        a.path("M270,170 L330,170 L318,140 L282,140Z", fill="#262626", stroke=INK, stroke_width=3)
        for x in (90, 480):
            a.rect(x - 30, 120, 60, 420, fill="none", stroke="#2b3536", stroke_width=3)
            a.path(f"M{x + 30},120 L{x + 60},150 L{x + 60},510 L{x + 30},540", fill="#0e1212", stroke="#2b3536", stroke_width=3)
    elif slug == "green-in-the-archive":   # red light, wide and empty, the locker the only warm thing
        a.rect(40, 40, 520, 595, fill="#120607")
        a.rect(40, 40, 520, 595, fill=a.radial([(0, kit.RED, 0.9), (1, "#120607", 0)], cx=0.5, cy=0.1, r=0.9))
        a.rect(40, 470, 520, 165, fill="#1d0a0b")
        a.rect(380, 330, 90, 160, fill="#241012", stroke="#3a1517", stroke_width=3)
        a.rect(398, 360, 54, 40, fill=AMBER)
        a.circle(425, 380, 48, fill=a.radial([(0, GOLD, 0.5), (1, GOLD, 0)]))
        a.path(kit.figure_d(200, 486, 0.42), fill="#050202")
        for k in range(5):
            x = 110 + k * 70
            a.path(kit.tent_d(x, 560 + (k % 2) * 30, 0.5), fill="#d8c9c9", stroke="#050202", stroke_width=2)
    else:                               # the printout pinned, AEGIS circled
        a.rect(40, 40, 520, 595, fill="#7a6a52")
        a.rect(100, 120, 400, 300, fill="#efeee8", stroke=INK, stroke_width=3, transform="rotate(-3 300 270)")
        a.open("g", transform="rotate(-3 300 270)")
        for k in range(7):
            a.rect(126, 160 + k * 30, 220 + (k * 37) % 120, 8, fill="#8a8a85")
        kit.label(a, 126, 380, "(“AEGIS”)", size=30, family="monospace", fill=INK, font_weight="bold")
        a.ellipse(206, 370, 100, 32, fill="none", stroke="#9b1c1c", stroke_width=5)
        a.close()
        a.circle(300, 118, 9, fill="#9b1c1c", stroke=INK, stroke_width=2)
        a.rect(140, 460, 140, 120, fill="#0b0e0e", stroke="#3a4243", stroke_width=6)
        a.path(kit.person_d(210, 576, 0.7), fill="#2b3536")


def ending(slug, name, as_written, cost, line):
    def draw(a: Art):
        a.rect(0, 0, 1200, 675, fill="#0b0d0d")
        a.paper("#0b0d0d", grain=0.3, fibre=1.1)
        ending_image(a, slug)
        a.rect(40, 40, 520, 595, fill="none", stroke="#2f3a3b", stroke_width=3)
        kit.label(a, 610, 120, "ENDING", size=22, fill=kit.TEAL3, letter_spacing="8")
        words = name.upper().split()
        lines = [" ".join(words[:2]), " ".join(words[2:])] if len(words) > 3 else [" ".join(words)]
        if len(lines[0]) > 14 and len(lines) == 1:
            lines = [" ".join(words[:-1]), words[-1]]
        for k, ln in enumerate(lines):
            kit.label(a, 606, 210 + k * 76, ln, size=66, fill=kit.WHITE, font_weight="bold", letter_spacing="2",
                      fit=550 if len(ln) * 66 * .62 > 550 else None)
        y = 210 + len(lines) * 76 + 10
        if as_written:
            a.rect(608, y - 20, 210, 46, fill="none", stroke=AMBER, stroke_width=3, transform=f"rotate(-3 713 {y})")
            kit.label(a, 713, y + 12, "AS WRITTEN", size=24, fill=AMBER, anchor="middle", font_weight="bold",
                      letter_spacing="4", transform=f"rotate(-3 713 {y})")
            y += 60
        if line:
            kit.label(a, 608, y + 30, f"“{line}”", size=26, family="serif", fill=GOLD, font_style="italic",
                      fit=540 if len(line) > 36 else None)
            y += 60
        a.line(608, 560, 1150, 560, stroke="#2f3a3b", stroke_width=2)
        kit.label(a, 608, 592, "THE COST", size=16, fill=kit.TEAL2, letter_spacing="5")
        kit.label(a, 608, 626, cost, size=24 if len(cost) < 40 else 18, family="serif", fill=kit.TEAL3,
                  fit=540 if len(cost) * (24 if len(cost) < 40 else 18) * .5 > 540 else None)
    draw.__doc__ = (f"Ending lettering plate for {name}{' (as written)' if as_written else ''}: the ending's last image "
                    f"small and still on the left, its name in pale capitals on the right"
                    f"{', an amber AS WRITTEN stamp and the bible line' if as_written else ''}, and the cost in a line below.")
    asset(G, f"ending-{slug}", group="endings", title=f"Ending: {name}", w=1200, h=675,
          row=kit.row("loading", "Ending lettering plates (menu spoilers)"))(draw)


for _e in ENDINGS:
    ending(*_e)

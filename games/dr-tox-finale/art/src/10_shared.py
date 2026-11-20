"""Shared art: the title lettering and the loading screen's pieces, ten chapter cards, the HUD (Pulse, Amber,
Self with its floor at 40, the breath ring, the shroud, Load, HOLD and the Terminology Rule's words), and
five ending lettering plates.

These belong to no mode, so they keep the game's own register rather than one of the seven mode styles:
graded concrete, film grain, typed caption boxes and the signal colours. Dr. Tox's pages keep the Pulse
margin; Reese's are warm with HOPE's amber and have none; the core has no margin at all, only the lamp
(DESIGN.md section 12, Colour as HUD). Endings lead with their cost (section 13)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, AMBER, GOLD, GREEN = kit.INK, kit.AMBER, kit.GOLD, kit.GREEN
CAP = "#f3eedf"          # caption-box paper


def ground(a, color=kit.CONCRETE, grain=0.35, vig=0.55):
    a.paper(color, grain=grain, fibre=1.1)
    a.vignette(vig)


def caption_box(a, x, y, w, h, text, size=None):
    a.rect(x + 5, y + 5, w, h, fill="#000", opacity=0.45)
    a.rect(x, y, w, h, fill=CAP, stroke=INK, stroke_width=3)
    sz = size or h * .5
    kit.label(a, x + 16, y + h / 2 + sz * .36, text, size=sz, family="sans-serif", fill=INK, font_weight="bold",
              letter_spacing=f(sz * .06), fit=kit.fitw(text, sz, w - 32, .68))


# ---- title and loading -------------------------------------------------------------------------
@asset(G, "title-finale", group="title", title="Title lettering: Dr. Tox: Finale", w=1200, h=420,
       row=kit.row("loading", "Title lettering"))
def title_finale(a: Art):
    """The title, DR. TOX in tall pale capitals over FINALE in amber, on graded concrete with film grain;
    under it the amber monitor line runs on and its beats grow slower and further apart until the line is
    long and level at the right, quiet rather than stopped, and a small line names the series and the
    episode."""
    ground(a, kit.NIGHT, 0.4, 0.5)
    a.rect(0, 0, 1200, 420, fill=kit.TEAL, opacity=0.12)
    kit.label(a, 600, 196, "DR. TOX", size=168, fill="#000", anchor="middle", font_weight="bold",
              letter_spacing="10", opacity=0.6, transform="translate(6,8)")
    kit.label(a, 600, 196, "DR. TOX", size=168, fill=kit.WHITE, anchor="middle", font_weight="bold", letter_spacing="10")
    pts, x = [(120, 252)], 120
    for k, (gap, hi) in enumerate(((50, 30), (70, 26), (96, 20), (130, 14), (170, 8))):
        x += gap
        pts += [(x, 252), (x + 6, 252 - hi), (x + 12, 252 + hi * .35), (x + 18, 252)]
        x += 18
    pts.append((1080, 252))
    a.path(kit.P(pts), fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round")
    kit.label(a, 600, 352, "F I N A L E", size=76, family="serif", fill=AMBER, anchor="middle", letter_spacing="14")
    kit.label(a, 600, 400, "EPISODE 3 OF 4  ·  AGE OF GLASS & GREED", size=20, fill=kit.TEAL3, anchor="middle",
              letter_spacing="5")


@asset(G, "title-episodes", group="title", title="Episode strip: Rise and Fall done, Finale open, Altrulan shut",
       w=1200, h=180, row=kit.row("loading", "Episode menu strip"))
def title_episodes(a: Art):
    """Four episode tabs side by side: RISE and FALL played, their tabs dimmed with a small stamped PLAYED
    mark; FINALE lit amber and open; ALTRULAN in cold gray-teal behind a closed bar."""
    ground(a, kit.NIGHT, 0.3, 0.3)
    for i, name in enumerate(("RISE", "FALL", "FINALE", "ALTRULAN")):
        x = 30 + i * 290
        done, open_ = i < 2, i == 2
        a.rect(x, 30, 270, 120, rx=6, fill="#2a1e0c" if open_ else ("#211c14" if done else "#1d2526"),
               stroke=AMBER if open_ else ("#7a5a24" if done else kit.TEAL), stroke_width=4 if open_ else 2)
        kit.label(a, x + 135, 84, f"EPISODE {i + 1}", size=16, anchor="middle",
                  fill=GOLD if open_ else ("#a8844a" if done else kit.TEAL3), letter_spacing="4")
        kit.label(a, x + 135, 126, name, size=34 if len(name) < 7 else 30, anchor="middle",
                  fill=GOLD if open_ else ("#a8844a" if done else kit.TEAL2), font_weight="bold", letter_spacing="3")
        if done:
            a.open("g", transform=f"rotate(-8 {x + 233} 48)")
            a.rect(x + 204, 38, 60, 20, fill="none", stroke="#a8844a", stroke_width=2)
            kit.label(a, x + 234, 53, "PLAYED", size=11, anchor="middle", fill="#a8844a", font_weight="bold",
                      letter_spacing="1")
            a.close()
        elif not open_:
            a.rect(x + 20, 136, 230, 6, fill=kit.TEAL)


@asset(G, "loading-plain", group="backdrops", title="Loading backdrop: the last city over the plain, 2240", w=1600, h=900,
       row=kit.row("loading", "Loading screen backdrop"))
def loading_plain(a: Art):
    """The last arcology at dusk from the plain road: glass-and-steel monoliths on a raw concrete plinth,
    sealed skybridges, a floodlit perimeter fence at its foot and the shanties under the plinth's vents;
    on the road in front, far off and small, the cult's camp under lanterns. The only warm points are the
    lanterns and one amber light high in the tower; everything else is the world's gray-teal and dust."""
    a.rect(0, 0, 1600, 900, fill=a.gradient([(0, "#1a2223"), (0.55, "#4a5859"), (0.7, "#7d8a86"), (1, "#5c605a")]))
    kit.arcology(a, 520, 640, 640, 560, fill="#263031", stroke="#3c4a4b", sw=2, windows="#4d5d5e")
    a.circle(812, 190, 5, fill=AMBER)
    a.circle(812, 190, 40, fill=a.radial([(0, GOLD, 0.35), (1, GOLD, 0)]))
    for k in range(9):                                   # floodlights
        x = 480 + k * 90
        a.line(x, 640, x, 560, stroke="#1a2122", stroke_width=4)
        a.path(f"M{x},{560} L{x - 60},{640} L{x + 60},{640}Z", fill="#e9ecea", opacity=0.08)
        a.circle(x, 558, 5, fill=kit.WHITE, opacity=0.9)
    a.line(440, 640, 1240, 640, stroke="#1a2122", stroke_width=3)
    a.hatch(440, 610, 800, 30, angle=90, spacing=8, stroke="#1a2122", stroke_width=1,
            clip=a.clip('<rect x="440" y="610" width="800" height="30"/>'))
    for k in range(14):                                  # shanties under the vents
        x = 560 + k * 42
        a.rect(x, 618 - (k % 3) * 6, 36, 22 + (k % 3) * 6, fill="#2a2a26", stroke="#3a3a34", stroke_width=1)
    for vx in (620, 820, 1020):                          # exhaust plumes from the vents
        a.path(f"M{vx},{560} C{vx - 20},{520} {vx + 30},{500} {vx},{460}", fill="none", stroke="#8a9a99",
               stroke_width=18, opacity=0.15, stroke_linecap="round")
    a.rect(0, 640, 1600, 260, fill="#4d4d45")
    a.rect(0, 640, 1600, 260, fill=a.gradient([(0, "#6b6a5e"), (1, "#26261f")]), opacity=0.8)
    a.path("M800,900 L760,640 L840,640Z", fill="#6f6c60", opacity=0.6)   # the plain road
    for k, x in enumerate((240, 300, 350, 410, 1240, 1300)):              # the camp, lanterns
        a.path(f"M{x - 26},{780} L{x},{748} L{x + 26},{780}Z", fill="#1f1f1a")
        if k % 2 == 0:
            a.circle(x, 770, 3, fill=GOLD)
            a.circle(x, 770, 24, fill=a.radial([(0, GOLD, 0.35), (1, GOLD, 0)]))
    kit.grain(a, 0.35)
    a.vignette(0.55)


def monitor(a, color, grid, label_text, beats, h, line=None, floor=None, base=96):
    a.rect(0, 0, 1200, 140, fill="#060807")
    a.grid(0, 0, 1200, 140, 28, stroke=grid, stroke_width=1)
    if line is not None:
        a.line(0, line, 1200, line, stroke=kit.WHITE, stroke_width=2, stroke_dasharray="10 8", opacity=0.75)
        kit.label(a, 1180, line - 6, "SELF", size=13, family="monospace", fill=kit.WHITE, anchor="end", opacity=0.85)
    if floor is not None:
        a.line(0, floor, 1200, floor, stroke=kit.TEAL3, stroke_width=3, opacity=0.9)
        kit.label(a, 1180, floor + 16, "FLOOR 40", size=13, family="monospace", fill=kit.TEAL3, anchor="end")
    a.path(kit.ecg_d(20, base, 1160, h, beats=beats), fill="none", stroke=color, stroke_width=4, stroke_linejoin="round")
    kit.label(a, 20, 28, label_text, size=16, family="monospace", fill=color, letter_spacing="3")
    kit.label(a, 260, 28, "II   HR   mm/s 25", size=13, family="monospace", fill=color, opacity=0.6)


@asset(G, "loading-monitor-amber", group="ui", title="Loading monitor line, amber (held)", w=1200, h=140,
       row=kit.row("loading", "Animated element: the monitor line, first state"))
def monitor_amber(a: Art):
    """A black monitor strip with a slow amber heart trace on a grid: the cage holding, the line the
    loading screen starts on."""
    monitor(a, AMBER, "#201a10", "PULSE", 6, 34)


@asset(G, "loading-monitor-trigger", group="ui", title="Loading monitor line, amber under the Self line", w=1200, h=140,
       row=kit.row("loading", "Animated element: the monitor line, second state"))
def monitor_trigger(a: Art):
    """The same strip with a pale dashed line across it marked SELF, the trigger line, and the amber
    trace climbing toward it, as in Fall: the State fires when Pulse reaches Self."""
    monitor(a, AMBER, "#201a10", "PULSE", 8, 54, line=36)


@asset(G, "loading-monitor-floor", group="ui", title="Loading monitor line, the Self line lowered to the floor", w=1200,
       h=140, row=kit.row("loading", "Animated element: the monitor line, last state"))
def monitor_floor(a: Art):
    """The strip as the bar fills: the dashed SELF line has come down close to a solid gray-teal line
    marked FLOOR 40, the Finale's rule that under it the man is no longer enough to choose; the amber trace
    slow and low beneath both. No green: the loading screen never shows the State winning."""
    monitor(a, AMBER, "#1a1a10", "PULSE", 5, 24, line=44, floor=58, base=118)


# ---- chapter cards -----------------------------------------------------------------------------
def emblem(a, i, cx, cy):
    """One object per chapter, drawn flat and large."""
    S = dict(stroke=INK, stroke_width=5, stroke_linejoin="round")
    if i == 0:      # the steel-drum lectern with the stapled tract, his lines painted on the wall behind
        a.rect(cx - 250, cy - 180, 500, 200, fill="#6e7a79", **S)
        for k, t in enumerate(("STAY OUTSIDE THE RING", "TWO MARKS. NOT THREE.", "NOT MY BLOOD.")):
            kit.label(a, cx - 230, cy - 130 + k * 50, t, size=30, family="sans-serif", fill="#e8e4da", font_weight="bold",
                      opacity=0.85, transform=f"rotate({-2 + k * 1.5} {cx} {cy})", fit=kit.fitw(t, 30, 440, .66))
        a.path(f"M{cx - 70},{cy + 190} L{cx - 60},{cy + 60} L{cx + 60},{cy + 60} L{cx + 70},{cy + 190}Z", fill="#4a5556", **S)
        for y in (cy + 100, cy + 145):
            a.line(cx - 66, y, cx + 66, y, stroke=INK, stroke_width=4)
        a.rect(cx - 56, cy + 36, 112, 26, fill=kit.COPYPAPER, stroke=INK, stroke_width=4, transform=f"rotate(-4 {cx} {cy + 50})")
        a.rect(cx - 4, cy + 38, 8, 4, fill="#777")
    elif i == 1:    # the RCC water tower and the shield line in front of it
        a.rect(cx - 140, cy - 170, 280, 110, rx=12, fill="#8a9a99", **S)
        kit.label(a, cx, cy - 98, "RCC", size=54, fill=INK, anchor="middle", font_weight="bold", letter_spacing="8")
        for x0, x1 in ((cx - 110, cx - 150), (cx + 110, cx + 150)):
            a.line(x0, cy - 60, x1, cy + 150, stroke=INK, stroke_width=10)
        a.line(cx - 130, cy + 40, cx + 130, cy + 40, stroke=INK, stroke_width=6)
        for k in range(5):
            x = cx - 220 + k * 110
            a.rect(x - 40, cy + 40, 80, 120, rx=10, fill="#2b3536", **S)
            a.rect(x - 24, cy + 56, 48, 14, fill="#5e7375")
    elif i == 2:    # the jars of their rite on his bench under the amber lamp
        a.circle(cx, cy - 60, 260, fill=a.radial([(0, GOLD, 0.6), (0.5, AMBER, 0.2), (1, AMBER, 0)]))
        a.path(kit.lamp_d(cx, cy - 110, 1.0), fill="#2a2a2a", **S)
        a.line(cx, cy - 160, cx, cy - 210, stroke="#2a2a2a", stroke_width=6)
        a.rect(cx - 240, cy + 90, 480, 26, fill="#3a3020", **S)
        for k, (x, h) in enumerate(((-150, 110), (-60, 90), (40, 120), (140, 80))):
            a.path(kit.jar_d(cx + x, cy + 90, 70, h), fill="#4a3a26" if k % 2 else "#5a4a30", **S)
        a.path(kit.vial_d(cx + 210, cy + 56, 22, 60), fill=AMBER, stroke=INK, stroke_width=3)
    elif i == 3:    # a CRT on a crate: the State's broadcast THE LAST CITY SEALS
        a.rect(cx - 220, cy - 150, 440, 300, rx=24, fill="#2a2d2e", **S)
        a.rect(cx - 180, cy - 116, 360, 230, rx=18, fill="#9aa5a4", **S)
        kit.arcology(a, cx - 150, cy + 60, 300, 150, fill="#3a4445")
        a.rect(cx - 180, cy + 64, 360, 50, fill="#1a1a1a")
        kit.label(a, cx, cy + 98, "THE LAST CITY SEALS", size=26, fill=kit.WHITE, anchor="middle", font_weight="bold",
                  fit=330)
        a.rect(cx - 240, cy + 150, 480, 40, fill="#5a4a30", **S)
    elif i == 4:    # a banner pole with photocopied cut-outs, the road under it
        a.rect(cx - 260, cy + 90, 520, 70, fill="#7d7a6c", **S)
        a.line(cx - 160, cy + 120, cx - 160, cy - 170, stroke=INK, stroke_width=9)
        a.rect(cx - 160, cy - 170, 330, 120, fill=kit.COPYPAPER, **S)
        for k, ch in enumerate("HE IS HERE"):
            if ch != " ":
                a.rect(cx - 146 + k * 31, cy - 150 + (k % 2) * 8, 28, 40, fill=kit.COPY if k % 3 == 1 else "#ffffff",
                       stroke=INK, stroke_width=2)
                kit.label(a, cx - 132 + k * 31, cy - 120 + (k % 2) * 8, ch, size=26, family=("serif", "sans-serif", "monospace")[k % 3],
                          fill="#ffffff" if k % 3 == 1 else INK, anchor="middle", font_weight="bold")
        for k in range(4):
            a.path(kit.person_d(cx + 10 + k * 56, cy + 110, 0.9), fill=kit.COPY)
    elif i == 5:    # the atrium glass cracked, hard light behind it
        a.rect(cx - 250, cy - 160, 500, 320, fill="#d9dfdc", **S)
        a.circle(cx + 20, cy - 10, 200, fill=a.radial([(0, kit.HARDLIGHT, 0.95), (0.6, kit.HARDLIGHT, 0.35), (1, kit.HARDLIGHT, 0)]))
        for x in (cx - 125, cx, cx + 125):
            a.line(x, cy - 160, x, cy + 160, stroke=INK, stroke_width=5)
        a.line(cx - 250, cy, cx + 250, cy, stroke=INK, stroke_width=5)
        a.path(f"M{cx - 40},{cy - 20} L{cx - 120},{cy - 110} M{cx - 40},{cy - 20} L{cx + 60},{cy - 130} "
               f"M{cx - 40},{cy - 20} L{cx + 140},{cy + 40} M{cx - 40},{cy - 20} L{cx - 90},{cy + 120} "
               f"M{cx - 40},{cy - 20} L{cx - 220},{cy + 30}", fill="none", stroke=INK, stroke_width=3)
    elif i == 6:    # a vent grille swung open, the duct dark beyond
        a.rect(cx - 200, cy - 150, 400, 300, fill="#0d1112", **S)
        a.path(f"M{cx - 200},{cy - 150} L{cx - 320},{cy - 110} L{cx - 320},{cy + 190} L{cx - 200},{cy + 150}Z", fill="#8a9a99", **S)
        for k in range(8):
            y = cy - 120 + k * 36
            a.line(cx - 310, y + 6, cx - 210, y - 2, stroke=INK, stroke_width=5)
        for k in range(3):
            a.path(f"M{cx - 120 + k * 90},{cy + 20} l60,0 l-12,-10 M{cx - 60 + k * 90},{cy + 20} l-12,10", fill="none",
                   stroke="#5e7375", stroke_width=4)
    elif i == 7:    # the second printer column with its plaque, soft blue at the glass, amber behind
        a.circle(cx - 180, cy - 40, 180, fill=a.radial([(0, AMBER, 0.45), (1, AMBER, 0)]))
        a.rect(cx - 90, cy - 170, 180, 340, rx=14, fill="#151718", **S)
        a.rect(cx - 50, cy - 140, 100, 200, rx=40, fill=kit.SKY, opacity=0.45)
        a.rect(cx - 50, cy - 140, 100, 200, rx=40, fill="none", stroke="#3a4a5a", stroke_width=3)
        a.rect(cx - 80, cy + 80, 160, 70, fill="#9aa5a4", **S)
        kit.label(a, cx, cy + 108, "STATUS:", size=16, fill=INK, anchor="middle", font_weight="bold")
        kit.label(a, cx, cy + 134, "CYCLE 42", size=22, fill=INK, anchor="middle", font_weight="bold", letter_spacing="2")
    elif i == 8:    # the hub's glass drum, a ring of pale-gold panes in it
        a.rect(cx - 250, cy - 160, 500, 320, fill="#1a1612", **S)
        a.ellipse(cx, cy + 110, 200, 40, fill="#2a2620", stroke=INK, stroke_width=4)
        a.rect(cx - 200, cy - 110, 400, 220, fill=kit.WHITE, opacity=0.14)
        a.ellipse(cx, cy - 110, 200, 40, fill="none", stroke="#c4cdcb", stroke_width=4)
        for k in range(7):
            x = cx - 180 + k * 60
            a.poly([(x, cy + 90), (x + 40, cy - 80), (x + 54, cy + 90)], fill=kit.HARDLIGHT, opacity=0.85, stroke="#ffffff",
                   stroke_width=2)
        a.rect(cx - 6, cy - 60, 12, 150, fill="#1a1612")
    else:           # the core: one amber work lamp over a balance on a steel stand
        a.rect(cx - 250, cy - 160, 500, 320, fill="#070606", **S)
        a.circle(cx, cy - 50, 230, fill=a.radial([(0, GOLD, 0.75), (0.5, AMBER, 0.3), (1, AMBER, 0)]))
        a.path(kit.lamp_d(cx, cy - 100, 0.9), fill="#262626", **S)
        a.line(cx, cy - 145, cx, cy - 160, stroke="#262626", stroke_width=6)
        a.rect(cx - 6, cy - 20, 12, 160, fill="#2a2a2a")
        a.rect(cx - 70, cy + 130, 140, 14, fill="#2a2a2a")
        a.rect(cx - 150, cy - 26, 300, 10, fill="#2a2a2a")
        for x in (cx - 140, cx + 140):
            a.line(x, cy - 20, x - 34, cy + 50, stroke="#2a2a2a", stroke_width=3)
            a.line(x, cy - 20, x + 34, cy + 50, stroke="#2a2a2a", stroke_width=3)
            a.path(f"M{x - 50},{cy + 50} Q{x},{cy + 80} {x + 50},{cy + 50}Z", fill="#2a2a2a")


def chapter(i):
    name, cid, lead, date = kit.CHAPTERS[i]

    def draw(a: Art):
        if lead == "reese":
            ground(a, "#3a2a16", 0.35, 0.45)
            a.circle(640, 120, 640, fill=a.radial([(0, GOLD, 0.35), (1, GOLD, 0)]))
        elif lead == "core":
            ground(a, "#050505", 0.4, 0.7)
        else:
            ground(a, kit.CONCRETE, 0.4, 0.6)
        emblem(a, i, 900, 330)
        caption_box(a, 70, 70, 440, 56, date, size=24)
        kit.label(a, 72, 560, f"CHAPTER {kit.ROMAN[i]}", size=26, fill=GOLD, letter_spacing="6")
        kit.label(a, 70, 630, name.upper(), size=58 if len(name) < 16 else 48, fill=kit.WHITE, font_weight="bold",
                  letter_spacing="2", fit=kit.fitw(name.upper(), 58 if len(name) < 16 else 48, 560, .7))
        if lead == "tox":            # the Pulse margin: amber, every Dr. Tox page
            a.rect(0, 676, 1280, 44, fill="#050606")
            a.path(kit.ecg_d(20, 704, 1240, 16, beats=10), fill="none", stroke=AMBER, stroke_width=3)
    kind = {"tox": "concrete with an amber Pulse margin line, the mark of a Dr. Tox chapter",
            "reese": "HOPE's warm amber light with no margin line, the mark of a Reese chapter",
            "core": "near black with no margin line at all, as the core has only the lamp"}[lead]
    draw.__doc__ = (f"Chapter card {i + 1}, {name}: a dated caption box ({date}) over {kind}, the chapter's name in "
                    f"capitals and one object drawn large.")
    asset(G, f"chapter-{i + 1}", group="chapters", title=f"Chapter {kit.ROMAN[i]}: {name}", w=1280, h=720,
          row=kit.row("shared", f"Chapter card ({cid})"))(draw)


for _i in range(10):
    chapter(_i)


# ---- HUD ---------------------------------------------------------------------------------------
def icon_ground(a):
    a.rect(4, 4, 88, 88, rx=14, fill="#0b0e0e", stroke="#2f3a3b", stroke_width=3)
    for x, y in ((14, 14), (82, 14), (14, 82), (82, 82)):
        a.circle(x, y, 2, fill="#2f3a3b")


@asset(G, "hud-pulse", group="ui", title="HUD icon: Pulse (calm)", w=96, h=96, row=kit.row("shared", "HUD: Pulse"))
def hud_pulse(a: Art):
    """The Pulse icon: one sharp amber spike on a black monitor tile, the heart held."""
    icon_ground(a)
    a.path(kit.ecg_d(12, 56, 72, 30, beats=1), fill="none", stroke=AMBER, stroke_width=5, stroke_linejoin="round",
           stroke_linecap="round")
    a.line(12, 72, 84, 72, stroke="#2f3a3b", stroke_width=2)


@asset(G, "hud-pulse-edge", group="ui", title="HUD icon: Pulse near the line (green spike)", w=96, h=96,
       row=kit.row("shared", "HUD: Pulse"))
def hud_pulse_edge(a: Art):
    """The Pulse icon near the trigger line: an amber line with a pale dashed Self line above it and one
    taller green spike reaching it, more amber than green."""
    icon_ground(a)
    a.line(12, 26, 84, 26, stroke=kit.WHITE, stroke_width=1.5, stroke_dasharray="4 3", opacity=0.7)
    a.path(kit.ecg_d(10, 60, 76, 22, beats=2), fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round")
    a.path("M70,60 L74,26 L78,68 L82,60", fill="none", stroke=GREEN, stroke_width=3, stroke_linejoin="round")


@asset(G, "hud-amber", group="ui", title="HUD icon: Amber (a dose on hand)", w=96, h=96, row=kit.row("shared", "HUD: Amber"))
def hud_amber(a: Art):
    """The Amber icon: one vial, full, the warm gold of the cage holding; repeat it for each dose."""
    icon_ground(a)
    a.path(kit.vial_d(48, 50, 30, 64), fill="#1b2021", stroke=kit.TEAL3, stroke_width=3)
    a.path(kit.vial_d(48, 54, 22, 46), fill=AMBER)
    a.rect(41, 36, 6, 30, rx=3, fill=GOLD, opacity=0.8)


@asset(G, "hud-amber-empty", group="ui", title="HUD icon: Amber (an empty slot)", w=96, h=96,
       row=kit.row("shared", "HUD: Amber"))
def hud_amber_empty(a: Art):
    """An empty vial outline in gray-teal: a dose not on hand. In chapter 10 every slot shows this."""
    icon_ground(a)
    a.path(kit.vial_d(48, 50, 30, 64), fill="none", stroke=kit.TEAL, stroke_width=3, stroke_dasharray="5 4")


@asset(G, "hud-self", group="ui", title="HUD icon: Self (a struck word)", w=96, h=96, row=kit.row("shared", "HUD: Self"))
def hud_self(a: Art):
    """The Self icon: a small typed caption box with lines of words, one struck through, as Self strikes
    words from his captions."""
    icon_ground(a)
    a.rect(14, 22, 68, 52, fill=CAP, stroke=INK, stroke_width=2)
    for x0, y, w in ((20, 34, 22), (46, 34, 30), (20, 48, 26), (50, 48, 26), (20, 62, 36)):
        a.rect(x0, y - 3, w, 6, fill="#7a7a72")
    a.line(44, 50, 80, 46, stroke="#9b1c1c", stroke_width=4, stroke_linecap="round")


@asset(G, "hud-self-floor", group="ui", title="Self gauge with the floor at 40 marked", w=480, h=64,
       row=kit.row("shared", "HUD: Self and its floor"))
def hud_self_floor(a: Art):
    """A Self gauge for the pause screen and the episode menu, never with a number: a long typed caption
    strip from 0 to 100 with a heavy gray-teal bar at 40 marked FLOOR, and the space under it shaded; the
    fill is laid over it at run time and never comes back up."""
    a.rect(2, 2, 476, 60, rx=6, fill="#0b0e0e", stroke="#2f3a3b", stroke_width=2)
    kit.label(a, 16, 38, "SELF", size=16, fill=kit.TEAL3, font_weight="bold", letter_spacing="3")
    x0, x1 = 80, 464
    a.rect(x0, 18, x1 - x0, 28, fill=CAP, stroke=INK, stroke_width=2)
    fx = x0 + (x1 - x0) * 0.4
    a.hatch(x0, 18, fx - x0, 28, angle=45, spacing=6, stroke=kit.TEAL, stroke_width=1.5,
            clip=a.clip(f'<rect x="{x0}" y="18" width="{f(fx - x0)}" height="28"/>'))
    a.rect(fx - 3, 10, 6, 44, fill=kit.TEAL)
    kit.label(a, fx + 8, 14, "FLOOR 40", size=11, fill=kit.TEAL3, font_weight="bold", letter_spacing="1")
    for k in range(1, 10):
        x = x0 + (x1 - x0) * k / 10
        a.line(x, 40, x, 46, stroke=INK, stroke_width=1)


@asset(G, "hud-self-low", group="ui", title="Menu stamp: Self is low", w=240, h=72, row=kit.row("shared", "HUD: Self and its floor"))
def hud_self_low(a: Art):
    """The stamp the episode menu puts on a save whose Self is at or under 40: SELF IS LOW in typed
    gray-teal capitals in a ruled box, cold and plain, no warning colour."""
    a.rect(6, 8, 228, 56, fill="#1d2526", stroke=kit.TEAL3, stroke_width=2)
    a.rect(12, 14, 216, 44, fill="none", stroke=kit.TEAL, stroke_width=1)
    kit.label(a, 120, 44, "SELF IS LOW", size=22, fill=kit.TEAL3, anchor="middle", font_weight="bold", letter_spacing="3")
    for x, y in ((12, 14), (228, 14), (12, 58), (228, 58)):
        a.circle(x, y, 2, fill=kit.TEAL3)


@asset(G, "hud-breath", group="ui", title="HUD icon: the breath radius (a ring on the floor)", w=96, h=96,
       row=kit.row("shared", "HUD: the breath radius"))
def hud_breath(a: Art):
    """The breath-radius icon: a narrow shrouded figure seen small inside a pale dashed ring on the
    floor."""
    icon_ground(a)
    a.ellipse(48, 70, 34, 12, fill="none", stroke=kit.TEAL3, stroke_width=2.5, stroke_dasharray="5 3")
    a.path(kit.tox_d(48, 70, 0.32), fill=kit.SHROUD, stroke="#9aa59a", stroke_width=1.5)


@asset(G, "hud-shroud-open", group="ui", title="HUD icon: shroud open", w=96, h=96, row=kit.row("shared", "HUD: the shroud"))
def hud_shroud_open(a: Art):
    """The shroud open: the heavy desaturated green cloth hanging from the shoulders, the narrow dark
    figure showing down the front, and a wide dashed ring."""
    icon_ground(a)
    a.ellipse(48, 78, 38, 10, fill="none", stroke=kit.TEAL3, stroke_width=2, stroke_dasharray="5 3")
    a.path(kit.tox_d(48, 80, 0.42, closed=False), fill=kit.SHROUD, stroke="#9aa59a", stroke_width=1.5)
    a.path(kit.tox_legs_d(48, 80, 0.42), fill="#1b1d1e")


@asset(G, "hud-shroud-closed", group="ui", title="HUD icon: shroud closed", w=96, h=96,
       row=kit.row("shared", "HUD: the shroud"))
def hud_shroud_closed(a: Art):
    """The shroud drawn closed to the hem, hood up, and a ring half the width: the breath held in, and
    the heat it costs shown as a small amber tick."""
    icon_ground(a)
    a.ellipse(48, 78, 19, 7, fill="none", stroke=kit.TEAL3, stroke_width=2, stroke_dasharray="4 3")
    a.path(kit.tox_d(48, 80, 0.42), fill=kit.SHROUD, stroke="#9aa59a", stroke_width=1.5)
    a.path("M72,22 L76,14 L80,22", fill="none", stroke=AMBER, stroke_width=3, stroke_linejoin="round")


@asset(G, "hud-load", group="ui", title="Load gauge (Aegis, pale gold)", w=480, h=48, row=kit.row("shared", "HUD: Load"))
def hud_load(a: Art):
    """Aegis's Load gauge in the atrium and at the hub: a thin pale-gold bar in HOPE's warm styling, ten
    segments and the word LOAD; the fill is laid over it at run time. No margin line."""
    a.rect(2, 8, 476, 32, rx=16, fill="#2a1e0c", stroke=GOLD, stroke_width=2)
    for k in range(1, 10):
        a.line(70 + k * 39.6, 14, 70 + k * 39.6, 34, stroke=GOLD, stroke_width=1, opacity=0.5)
    kit.label(a, 18, 30, "LOAD", size=14, fill=GOLD, font_weight="bold", letter_spacing="3")
    a.rect(70, 16, 396, 16, rx=8, fill="none", stroke=kit.HARDLIGHT, stroke_width=1, opacity=0.7)


@asset(G, "hud-hold", group="ui", title="The core's only prompt: HOLD", w=360, h=120, row=kit.row("shared", "HUD: Hold (the core)"))
def hud_hold(a: Art):
    """The word HOLD in the bible's amber and nothing else: no box, no meter, no key glyph. It is the only
    thing on the screen in the core besides the lamp."""
    kit.label(a, 180, 82, "HOLD", size=72, family="sans-serif", fill=AMBER, anchor="middle", font_weight="bold",
              letter_spacing="16")
    a.line(70, 100, 290, 100, stroke=AMBER, stroke_width=1, opacity=0.35)
    for x in (60, 300):
        a.circle(x, 60, 1.5, fill=AMBER, opacity=0.5)
    a.circle(180, 108, 1.5, fill=AMBER, opacity=0.5)


def margin(a, beats, h, trigger=False):
    a.rect(0, 0, 1200, 32, fill="#050606")
    if trigger:
        a.line(0, 5, 1200, 5, stroke=kit.WHITE, stroke_width=1.5, stroke_dasharray="8 6", opacity=0.7)
    a.path(kit.ecg_d(8, 20, 1184, h, beats=beats), fill="none", stroke=AMBER, stroke_width=2.5, stroke_linejoin="round")


@asset(G, "hud-margin-calm", group="ui", title="Pulse margin line: calm (amber)", w=1200, h=32,
       row=kit.row("shared", "HUD: Pulse margin strip"))
def margin_calm(a: Art):
    """The thin margin line every Dr. Tox page keeps: amber, well under the Self line."""
    margin(a, 12, 11)
    for x in (300, 600, 900):
        a.line(x, 28, x, 31, stroke=AMBER, stroke_width=1, opacity=0.5)


@asset(G, "hud-margin-edge", group="ui", title="Pulse margin line: near the Self line (green spikes)", w=1200, h=32,
       row=kit.row("shared", "HUD: Pulse margin strip"))
def margin_edge(a: Art):
    """The margin line close to the trigger line: a pale dashed Self line along the top edge, amber below
    it, three green spikes reaching for it, never more green than amber."""
    margin(a, 14, 11, trigger=True)
    for x in (230, 640, 1010):
        a.path(f"M{x - 6},20 L{x},5 L{x + 5},30 L{x + 10},20", fill="none", stroke=GREEN, stroke_width=2.5)


@asset(G, "hud-margin-green", group="ui", title="Pulse margin line: at the line (green from the corners)", w=1200, h=32,
       row=kit.row("shared", "HUD: Pulse margin strip"))
def margin_green(a: Art):
    """The margin at the trigger line: green creeping in from both corners over the amber line, which is
    still there in the middle. The page cuts to black after this."""
    margin(a, 16, 14, trigger=True)
    g = a.gradient([(0, GREEN), (0.3, GREEN), (0.42, "#050606"), (0.58, "#050606"), (0.7, GREEN), (1, GREEN)], 0, 0, 1, 0)
    a.rect(0, 0, 1200, 32, fill=g, opacity=0.75)
    a.path(kit.ecg_d(8, 20, 1184, 14, beats=16, spike=1.3), fill="none", stroke=GREEN, stroke_width=2,
           clip_path=a.clip('<rect x="0" y="0" width="380" height="32"/><rect x="820" y="0" width="380" height="32"/>'))


@asset(G, "hud-word-rcc", group="ui", title="Terminology Rule: RCC (the plate)", w=240, h=96,
       row=kit.row("shared", "HUD: the Word (Terminology Rule)"))
def word_rcc(a: Art):
    """The word RCC as the State's own signage has it: stamped capitals on a riveted gray-teal plate, as
    on the water tower, the shields and the hub's door."""
    kit.plate(a, 6, 10, 228, 76, "RCC", fill=kit.TEAL2, size=42)


@asset(G, "hud-word-hope", group="ui", title="Terminology Rule: HOPE (the insignia)", w=240, h=96,
       row=kit.row("shared", "HUD: the Word (Terminology Rule)"))
def word_hope(a: Art):
    """The word HOPE as the program wears it: a small shield insignia with a half sun rising over a bar,
    beside the word in warm capitals; the half sun is pale hard-light gold, the Finale's turn of it."""
    a.rect(6, 10, 228, 76, rx=38, fill="#2a1e0c", stroke=AMBER, stroke_width=3)
    a.path("M30,26 L70,26 L70,52 C70,70 50,80 50,80 C50,80 30,70 30,52Z", fill="#f4ead2", stroke=INK, stroke_width=3)
    a.path("M36,56 A14,14 0 0,1 64,56Z", fill=AMBER)
    a.line(34, 56, 66, 56, stroke=INK, stroke_width=3)
    kit.label(a, 146, 62, "HOPE", size=38, anchor="middle", fill=GOLD, font_weight="bold", letter_spacing="5")


@asset(G, "hud-word-silence", group="ui", title="Terminology Rule: nothing (the held breath)", w=240, h=96,
       row=kit.row("shared", "HUD: the Word (Terminology Rule)"))
def word_silence(a: Art):
    """The third answer at the hub, saying nothing: an empty plate with a long dash where the word would
    be, in cold gray-teal between the warm insignia and the stamped plate."""
    a.rect(6, 10, 228, 76, rx=8, fill="#1d2526", stroke=kit.TEAL, stroke_width=3)
    a.line(70, 50, 170, 50, stroke=kit.TEAL3, stroke_width=5, stroke_linecap="round")
    for x, y in ((14, 18), (226, 18), (14, 78), (226, 78)):
        a.circle(x, y, 2.5, fill=kit.TEAL)


@asset(G, "hud-word-him", group="ui", title="The cult's word: HIM (the tract's)", w=240, h=96,
       row=kit.row("shared", "HUD: the Word (Terminology Rule)"))
def word_him(a: Art):
    """The cult's word, which is neither HOPE nor RCC: HIM in photocopied black capitals on a torn strip of
    tract paper, stapled at one end. Shown when the march speaks."""
    a.path("M8,22 L230,16 L234,30 L228,44 L236,60 L230,80 L10,84 L14,66 L6,50 L12,36Z", fill=kit.COPYPAPER,
           stroke=kit.COPY, stroke_width=2)
    kit.label(a, 124, 68, "HIM", size=50, family="serif", fill=kit.COPY, anchor="middle", font_weight="bold",
              letter_spacing="10")
    a.rect(20, 28, 22, 4, fill="#8a8a88")
    a.rect(20, 66, 22, 4, fill="#8a8a88")
    for x in (60, 150, 200):
        a.rect(x, 20, 3, 62, fill=kit.COPY, opacity=0.12)


@asset(G, "hud-caption", group="ui", title="Caption box (blank, for dated captions)", w=600, h=96,
       row=kit.row("shared", "Typed caption box"))
def hud_caption(a: Art):
    """A blank typed caption box with a drop shadow, the box every chapter opens on, dated 2236 to 2240 and
    naming the lead. Text is laid over it at run time."""
    a.rect(10, 12, 576, 74, fill="#000", opacity=0.45)
    a.rect(4, 6, 576, 74, fill=CAP, stroke=INK, stroke_width=3)
    a.rect(10, 12, 564, 62, fill="none", stroke=INK, stroke_width=0.8, opacity=0.5)
    for x in (16, 568):
        a.line(x, 18, x, 68, stroke=INK, stroke_width=0.6, opacity=0.25)


# ---- ending lettering plates -------------------------------------------------------------------
ENDINGS = (
    ("the-reset", "The Reset", True, "His heart; the peace after.",
     ("held to the end.", "left room; his panes stand round the hub.", "kept the key."),
     "What makes it land isn't spectacle; it's the peace that follows it"),
    ("the-first-word", "The First Word", False, "The Reset, with her inside it: her printed body did not come through it.",
     ("held to the end, not alone.", "left room.", "said RCC; opened the door; stayed."), ""),
    ("the-cage-holds", "The Cage Holds", False, "He lives; the cult's own resin attack.",
     ("lives; doses under the lamp.", "held a wall nobody came through.", "kept the key."), ""),
    ("green-wins", "Green Wins", False, "The dose without the sacrament; no peace; the save closes.",
     ("the State made the last dose, not the man.", "watched green fill the glass.", "kept the key."), ""),
    ("the-light-bringers-wall", "The Light Bringer's Wall", False,
     "Tox dies outside; the glass stands, and only the plinth and the road get the dose.",
     ("outside the glass.", "said HOPE; set the keystone.", "kept the key."),
     "The rot must be excised so the tree can live."),
)


def ending_image(a, slug):
    """The ending's last image, small and still, in the left half. Nobody's death is shown as an act."""
    if slug == "the-reset":                 # the plain at dawn: people sitting in the dust, a ring of light round the hub
        a.rect(40, 40, 520, 595, fill=a.gradient([(0, "#5d6a6c"), (0.55, "#b8b2a0"), (0.62, "#c9bfa4"), (1, "#6b675a")]))
        kit.arcology(a, 160, 380, 280, 260, fill="#3f4a4b")
        a.ellipse(300, 230, 70, 18, fill="none", stroke=kit.HARDLIGHT, stroke_width=5, opacity=0.9)
        a.ellipse(300, 230, 90, 26, fill="none", stroke=kit.HARDLIGHT, stroke_width=2, opacity=0.5)
        for x in range(180, 440, 40):                       # floodlights off
            a.line(x, 380, x, 350, stroke="#3a4041", stroke_width=2)
        a.rect(40, 380, 520, 255, fill="#8a8574", opacity=0.9)
        for k, (x, y, s) in enumerate(((110, 470, .8), (170, 480, .9), (250, 500, 1.0), (330, 470, .8), (400, 520, 1.1),
                                       (480, 490, .9), (210, 560, 1.2), (360, 590, 1.3), (500, 580, 1.2), (90, 600, 1.3))):
            a.path(kit.sitting_d(x, y, s * 0.7), fill="#3a3a33", transform=f"scale(-1,1) translate({-2 * x},0)" if k % 2 else None)
    elif slug == "the-first-word":          # two hands on the balance under the lamp
        a.rect(40, 40, 520, 595, fill="#060505")
        a.circle(300, 240, 300, fill=a.radial([(0, GOLD, 0.7), (0.45, AMBER, 0.28), (1, AMBER, 0)]))
        a.path(kit.lamp_d(300, 150, 0.9), fill="#262626", stroke=INK, stroke_width=4)
        a.line(300, 104, 300, 40, stroke="#262626", stroke_width=6)
        a.rect(294, 330, 12, 220, fill="#2a2a2a")
        a.rect(230, 540, 140, 14, fill="#2a2a2a")
        a.rect(150, 324, 300, 10, fill="#2a2a2a")
        for x in (160, 440):
            a.path(f"M{x - 46},400 Q{x},428 {x + 46},400Z", fill="#2a2a2a")
            a.line(x, 334, x - 40, 400, stroke="#2a2a2a", stroke_width=3)
            a.line(x, 334, x + 40, 400, stroke="#2a2a2a", stroke_width=3)
        a.path("M200,318 C210,300 236,296 252,304 L262,322 L206,330Z", fill="#121212")                    # his glove
        a.path("M348,318 C356,302 380,298 394,306 L402,324 L352,330Z", fill="#c9b9a2", opacity=0.9)    # her hand, bare
    elif slug == "the-cage-holds":          # the vial in his hand; the broadcast's glow on the locker
        a.rect(40, 40, 520, 595, fill="#060505")
        a.rect(330, 120, 190, 340, fill="#151a1a", stroke="#2b3536", stroke_width=3)
        a.rect(80, 150, 200, 150, rx=14, fill="#1b1f20", stroke="#2b3536", stroke_width=4)
        a.rect(96, 166, 168, 118, rx=8, fill=kit.TEAL3, opacity=0.5)
        a.rect(330, 120, 190, 340, fill=a.radial([(0, kit.TEAL3, 0.25), (1, kit.TEAL3, 0)], cx=0.1, cy=0.4, r=0.8))
        a.circle(300, 470, 160, fill=a.radial([(0, GOLD, 0.45), (1, AMBER, 0)]))
        a.path(kit.vial_d(318, 440, 24, 70), fill=AMBER, stroke=INK, stroke_width=3)
        a.path("M120,635 L150,520 C160,500 190,492 220,494 L250,496 L250,560 L200,635Z", fill="#0e0e0e")     # sleeve
        a.rect(252, 452, 92, 74, rx=24, fill="#141414", stroke="#262626", stroke_width=2)                  # the fist
        for k in range(3):
            a.line(262, 470 + k * 18, 334, 470 + k * 18, stroke="#262626", stroke_width=2)
        a.path("M252,470 C236,470 230,488 240,500 L262,504Z", fill="#141414", stroke="#262626", stroke_width=2)
    elif slug == "green-wins":              # light on glass only, nothing amber
        a.rect(40, 40, 520, 595, fill="#050806")
        a.rect(40, 40, 520, 595, fill=a.radial([(0, GREEN, 0.55), (0.6, GREEN, 0.12), (1, GREEN, 0)], cx=0.5, cy=0.8, r=0.8))
        for x in range(80, 560, 80):
            a.line(x, 60, x + 30, 620, stroke=GREEN, stroke_width=2, opacity=0.35)
        a.path("M40,520 C200,470 400,470 560,520", fill="none", stroke=GREEN, stroke_width=3, opacity=0.5)
    else:                                   # the wall whole, lit from inside; a still shape at its foot outside
        a.rect(40, 40, 520, 595, fill="#0a0908")
        a.path(kit.person_d(300, 528, 2.4), fill="#3a3324")          # Reese, behind the glass, not looking away
        a.rect(140, 60, 320, 470, fill=kit.HARDLIGHT, opacity=0.62)
        for pts in ([(140, 60), (300, 60), (220, 220)], [(300, 60), (460, 60), (380, 220)], [(140, 60), (220, 220), (140, 380)],
                    [(460, 60), (380, 220), (460, 380)], [(220, 220), (380, 220), (300, 380)], [(140, 380), (300, 380), (220, 530)],
                    [(300, 380), (460, 380), (380, 530)]):
            a.poly(pts, fill="none", stroke="#ffffff", stroke_width=3, opacity=0.9)
        a.rect(140, 60, 320, 470, fill="none", stroke="#ffffff", stroke_width=4)
        a.circle(300, 300, 300, fill=a.radial([(0, kit.HARDLIGHT, 0.3), (1, kit.HARDLIGHT, 0)]))
        a.rect(40, 530, 520, 105, fill="#141210")
        a.path("M180,592 C210,578 300,576 390,584 L392,596 L180,600Z", fill=kit.SHROUD, stroke="#2a2f28", stroke_width=2)


def ending(slug, name, as_written, cost, leads, line):
    def draw(a: Art):
        a.paper("#0b0d0d", grain=0.3, fibre=1.1)
        ending_image(a, slug)
        a.rect(40, 40, 520, 595, fill="none", stroke="#2f3a3b", stroke_width=3)
        kit.label(a, 610, 92, "ENDING", size=22, fill=kit.TEAL3, letter_spacing="8")
        nm = name.upper()
        lines = [nm] if len(nm) <= 15 else [" ".join(nm.split()[:2]), " ".join(nm.split()[2:])]
        y = 164
        for ln in lines:
            kit.label(a, 606, y, ln, size=60, fill=kit.WHITE, font_weight="bold", letter_spacing="2",
                      fit=kit.fitw(ln, 60, 550, .68))
            y += 64
        if as_written:
            a.open("g", transform=f"rotate(-3 712 {y - 18})")
            a.rect(608, y - 40, 208, 42, fill="none", stroke=AMBER, stroke_width=3)
            kit.label(a, 712, y - 10, "AS WRITTEN", size=22, fill=AMBER, anchor="middle", font_weight="bold", letter_spacing="4")
            a.close()
            y += 34
        kit.label(a, 608, y + 4, "THE COST", size=16, fill=kit.TEAL2, letter_spacing="5")
        y += 38
        for ln in kit.wrap(cost, 44)[:3]:
            kit.label(a, 608, y, ln, size=24, family="serif", fill=kit.WHITE, fit=kit.fitw(ln, 24, 540, .5))
            y += 32
        y += 18
        a.line(608, y - 14, 1150, y - 14, stroke="#2f3a3b", stroke_width=2)
        for who, state in zip(("DR. TOX", "REESE", "CALLY"), leads):
            kit.label(a, 608, y + 14, who, size=15, fill=GOLD, font_weight="bold", letter_spacing="3")
            kit.label(a, 712, y + 14, state, size=20, family="serif", fill=kit.TEAL3, fit=kit.fitw(state, 20, 436, .48))
            y += 38
        if line:
            for k, ln in enumerate(kit.wrap(f"“{line}”", 46)[:2]):
                kit.label(a, 608, 600 + k * 30 - (30 if len(kit.wrap(line, 46)) > 1 else 0), ln, size=22, family="serif",
                          fill=GOLD, font_style="italic", fit=kit.fitw(ln, 22, 540, .46))
    draw.__doc__ = (f"Ending lettering plate for {name}{' (as written)' if as_written else ''}: the ending's last image "
                    f"small and still on the left; on the right its name in pale capitals"
                    f"{', an amber AS WRITTEN stamp' if as_written else ''}, the cost first, then one line for each lead's "
                    f"state (Dr. Tox, Reese, Cally){', and the bible line the card quotes' if line else ''}.")
    asset(G, f"ending-{slug}", group="endings", title=f"Ending: {name}", w=1200, h=675,
          row=kit.row("loading", "Ending lettering plates (menu spoilers)"))(draw)


for _e in ENDINGS:
    ending(*_e)

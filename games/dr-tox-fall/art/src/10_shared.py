"""Shared art: the title lettering and the loading screen's pieces, eleven chapter cards, the HUD (Pulse,
Amber, Self, the breath ring, the shroud, Load and the Terminology Rule's two words), and four ending
lettering plates.

These belong to no mode, so they keep the game's own register rather than one of the seven mode styles:
graded concrete, film grain, typed caption boxes and the signal colours. Dr. Tox's pages keep the Pulse
margin; Reese's are warm with HOPE's amber and have none; Cally's are clinical white with no HUD at all
(DESIGN.md section 12, Colour as HUD)."""
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
@asset(G, "title-fall", group="title", title="Title lettering: Dr. Tox: Fall", w=1200, h=420,
       row=kit.row("loading", "Title lettering"))
def title_fall(a: Art):
    """The title, DR. TOX in tall pale capitals over FALL in amber, on graded concrete with film grain;
    an amber monitor line under it steps down a level halfway across, as if the floor had dropped, and a
    small line names the series and the episode."""
    ground(a, kit.NIGHT, 0.4, 0.5)
    a.rect(0, 0, 1200, 420, fill=kit.TEAL, opacity=0.12)
    a.rect(0, 0, 1200, 420, fill=kit.SHROUD, opacity=0.08)
    kit.label(a, 600, 200, "DR. TOX", size=168, fill="#000", anchor="middle", font_weight="bold",
              letter_spacing="10", opacity=0.6, transform="translate(6,8)")
    kit.label(a, 600, 200, "DR. TOX", size=168, fill=kit.WHITE, anchor="middle", font_weight="bold", letter_spacing="10")
    a.path(kit.ecg_d(140, 250, 440, 30, beats=3), fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round")
    a.path("M580,250 L620,250 L630,280 L660,280", fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round")
    a.path(kit.ecg_d(660, 280, 400, 22, beats=3), fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round",
           opacity=0.8)
    kit.label(a, 600, 362, "F A L L", size=80, family="serif", fill=AMBER, anchor="middle", letter_spacing="18")
    kit.label(a, 600, 404, "EPISODE 2 OF 4  ·  AGE OF GLASS & GREED", size=20, fill=kit.TEAL3, anchor="middle",
              letter_spacing="5")


@asset(G, "title-episodes", group="title", title="Episode strip: Rise done, Fall open, Finale and Altrulan shut",
       w=1200, h=180, row=kit.row("loading", "Episode menu strip"))
def title_episodes(a: Art):
    """Four episode tabs side by side: RISE played, its tab dimmed with a small stamped PLAYED mark; FALL
    lit amber and open; FINALE and ALTRULAN in cold gray-teal behind a closed bar."""
    ground(a, kit.NIGHT, 0.3, 0.3)
    for i, name in enumerate(("RISE", "FALL", "FINALE", "ALTRULAN")):
        x = 30 + i * 290
        done, open_ = i == 0, i == 1
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


@asset(G, "loading-hall", group="backdrops", title="Loading backdrop: the relief hall at noon, 2229", w=1600, h=900,
       row=kit.row("loading", "Loading screen backdrop"))
def loading_hall(a: Art):
    """The relief hall locked off under flat fluorescent tubes: a long queue of gray-teal shapes still
    facing a shutter pulled down on a hand-lettered RELIEF SUSPENDED, empty dispensers stamped RCC on the
    wall, a number board stopped, and at the far right, through a back door, one amber lamp: the night
    clinic, the only warm thing. A narrow figure in a desaturated green shroud stands apart."""
    a.rect(0, 0, 1600, 900, fill="#bcc6c4")
    a.rect(0, 620, 1600, 280, fill="#9aa6a4")
    a.line(0, 620, 1600, 620, stroke="#76838a", stroke_width=3)
    for x in (220, 620, 1020, 1420):
        a.rect(x - 150, 34, 300, 16, rx=8, fill="#f6f8f7", stroke="#9aa5a4", stroke_width=2)
        a.rect(x - 200, 50, 400, 280, fill="#ffffff", opacity=0.1)
    a.rect(0, 0, 1600, 26, fill="#8f9b9a")
    # the shutter and its sign
    a.rect(480, 170, 560, 450, fill="#8a9695", stroke="#55605f", stroke_width=4)
    for y in range(184, 620, 18):
        a.line(480, y, 1040, y, stroke="#6d7978", stroke_width=3)
    a.rect(560, 330, 400, 90, fill="#eee7d4", stroke="#3a3f40", stroke_width=3, transform="rotate(-1.5 760 375)")
    kit.label(a, 760, 390, "RELIEF SUSPENDED", size=44, anchor="middle", fill="#2b2b2b", font_weight="bold",
              letter_spacing="2", transform="rotate(-1.5 760 375)", fit=360)
    # dispensers stamped RCC, empty
    for x in (120, 290, 1150, 1290):
        a.rect(x, 250, 110, 200, fill="#a7b1b0", stroke="#55605f", stroke_width=3)
        a.rect(x + 15, 270, 80, 70, fill="#5c6766", stroke="#55605f", stroke_width=2)
        kit.plate(a, x + 12, 360, 86, 40, "RCC", fill="#c3cbca", size=20, sw=2)
        a.rect(x + 30, 420, 50, 16, fill="#3f4847")
    # number board stopped
    a.rect(1120, 110, 240, 90, fill="#1b2021", stroke="#55605f", stroke_width=3)
    kit.label(a, 1240, 172, "0 4 1 7", size=52, family="monospace", anchor="middle", fill=kit.TEAL3)
    # the queue facing the shutter
    for k in range(14):
        x = 70 + k * 72 + (k % 3) * 6
        if 470 < x < 1050:
            s = 1.55 + 0.1 * math.sin(k * 1.3)
        else:
            s = 1.75 + 0.1 * math.sin(k * 1.3)
        a.path(kit.person_d(x, 760 + (k % 2) * 18, s, lean=a.rng.uniform(-4, 4), hunch=a.rng.uniform(0, 6)),
               fill="#55605f" if k % 2 else "#4a5554", opacity=0.92)
    # back door and the night clinic's lamp
    a.rect(1440, 330, 130, 290, fill="#0f0d0a", stroke="#55605f", stroke_width=4)
    a.circle(1505, 420, 120, fill=a.radial([(0, GOLD, 0.65), (0.5, AMBER, 0.25), (1, AMBER, 0)]))
    a.path("M1490,400 L1520,400 L1512,384 L1498,384Z", fill="#2a2a2a")
    # the man in the shroud, apart
    a.path(kit.tox_d(1390, 780, 1.6), fill=kit.SHROUD, opacity=0.95)
    a.rect(0, 0, 1600, 900, fill=a.radial([(0.6, "#000", 0), (1, "#000", 0.35)], r=0.75))


def monitor(a, color, grid, label_text, trace_h, beats, line=None, green_corners=False):
    a.rect(0, 0, 1200, 140, fill="#060807")
    a.grid(0, 0, 1200, 140, 28, stroke=grid, stroke_width=1)
    if line is not None:
        a.line(0, line, 1200, line, stroke=kit.WHITE, stroke_width=2, stroke_dasharray="10 8", opacity=0.75)
        kit.label(a, 1180, line - 8, "SELF", size=14, family="monospace", fill=kit.WHITE, anchor="end",
                  letter_spacing="3", opacity=0.85)
    a.path(kit.ecg_d(20, 96, 1160, trace_h, beats=beats, spike=1.0), fill="none", stroke=color, stroke_width=4,
           stroke_linejoin="round")
    if green_corners:
        a.path(kit.ecg_d(20, 96, 1160, trace_h, beats=beats, spike=1.0), fill="none", stroke=GREEN, stroke_width=4,
               stroke_linejoin="round", clip_path=a.clip('<rect x="0" y="0" width="220" height="140"/>'
                                                          '<rect x="980" y="0" width="220" height="140"/>'))
    kit.label(a, 20, 28, label_text, size=16, family="monospace", fill=color, letter_spacing="3")
    for k, t in enumerate(("II", "HR", "mm/s 25")):
        kit.label(a, 1180 - k * 110, 28 if line is None or line > 50 else 130, t, size=13, family="monospace",
                  fill=color, anchor="end", opacity=0.6)


@asset(G, "loading-monitor-amber", group="ui", title="Loading monitor line, amber (held)", w=1200, h=140,
       row=kit.row("loading", "Animated element: the monitor line, first state"))
def monitor_amber(a: Art):
    """A black monitor strip with a slow amber heart trace on a grid: the cage holding, the line the
    loading screen starts on."""
    monitor(a, AMBER, "#201a10", "PULSE", 30, 6)


@asset(G, "loading-monitor-trigger", group="ui", title="Loading monitor line, amber under the Self line", w=1200, h=140,
       row=kit.row("loading", "Animated element: the monitor line, second state"))
def monitor_trigger(a: Art):
    """The same strip with a pale dashed line across it marked SELF, the trigger line, and the amber
    trace climbing toward it: in Fall the State fires when Pulse reaches Self."""
    monitor(a, AMBER, "#201a10", "PULSE", 54, 8, line=34)


@asset(G, "loading-monitor-green", group="ui", title="Loading monitor line, at the line (green in the corners)",
       w=1200, h=140, row=kit.row("loading", "Animated element: the monitor line, last state"))
def monitor_green(a: Art):
    """The strip as the bar fills: the trace touching the dashed SELF line, amber in the middle and
    green coming in from both corners. Never more green than amber."""
    monitor(a, AMBER, "#1a1a10", "PULSE", 62, 9, line=34, green_corners=True)


# ---- chapter cards -----------------------------------------------------------------------------
def emblem(a, i, cx, cy):
    """One object per chapter, drawn flat and large."""
    S = dict(stroke=INK, stroke_width=5, stroke_linejoin="round")
    if i == 0:      # the shroud on its stand, the ring on the floor
        a.circle(cx, cy - 120, 200, fill=a.radial([(0, GOLD, 0.45), (1, GOLD, 0)]))
        a.ellipse(cx, cy + 140, 230, 44, fill="none", stroke=kit.WHITE, stroke_width=4, stroke_dasharray="18 12",
                  opacity=0.7)
        a.line(cx, cy - 150, cx, cy + 140, stroke="#3a3f40", stroke_width=10)
        a.line(cx - 70, cy + 140, cx + 70, cy + 140, stroke="#3a3f40", stroke_width=10)
        a.line(cx - 60, cy - 140, cx + 60, cy - 140, stroke="#3a3f40", stroke_width=10)
        a.path(f"M{cx - 60},{cy - 140} C{cx - 90},{cy - 40} {cx - 100},{cy + 40} {cx - 86},{cy + 110} L{cx + 86},{cy + 110} "
               f"C{cx + 100},{cy + 40} {cx + 90},{cy - 40} {cx + 60},{cy - 140}Z", fill=kit.SHROUD, **S)
        for k in (-40, 0, 40):
            a.path(f"M{cx + k},{cy - 130} C{cx + k * 1.4},{cy - 20} {cx + k * 1.6},{cy + 50} {cx + k * 1.7},{cy + 108}",
                   fill="none", stroke="#46523f", stroke_width=4)
    elif i == 1:    # the shutter down on RELIEF SUSPENDED
        a.rect(cx - 240, cy - 160, 480, 320, fill="#8a9695", **S)
        for y in range(int(cy - 146), int(cy + 160), 20):
            a.line(cx - 240, y, cx + 240, y, stroke="#5d6968", stroke_width=4)
        a.rect(cx - 200, cy - 40, 400, 76, fill="#eee7d4", stroke=INK, stroke_width=4, transform=f"rotate(-2 {cx} {cy})")
        kit.label(a, cx, cy + 12, "RELIEF SUSPENDED", size=38, anchor="middle", fill="#222", font_weight="bold",
                  transform=f"rotate(-2 {cx} {cy})", fit=360)
    elif i == 2:    # a camera drone over a pale haze
        a.rect(cx - 250, cy + 40, 500, 120, fill=kit.OCHRE, opacity=0.35)
        a.ellipse(cx - 80, cy + 60, 220, 70, fill="#d8c9a8", opacity=0.55)
        a.ellipse(cx + 120, cy + 90, 180, 50, fill=kit.RUST, opacity=0.25)
        a.rect(cx - 60, cy - 110, 120, 50, rx=10, fill="#3a3f40", **S)
        a.circle(cx, cy - 50, 22, fill="#1b1d1e", **S)
        a.circle(cx, cy - 50, 9, fill=kit.TEAL3)
        for dx in (-130, 130):
            a.line(cx, cy - 92, cx + dx, cy - 120, stroke=INK, stroke_width=8)
            a.ellipse(cx + dx, cy - 128, 70, 10, fill="#cfd6d4", **S)
    elif i == 3:    # the gauntlet in a vise
        a.rect(cx - 240, cy + 70, 480, 50, fill="#4a5556", **S)
        a.rect(cx - 160, cy - 10, 70, 90, fill="#5d6968", **S)
        a.rect(cx + 90, cy - 10, 70, 90, fill="#5d6968", **S)
        a.line(cx + 160, cy + 20, cx + 240, cy + 20, stroke=INK, stroke_width=10)
        a.rect(cx - 90, cy - 40, 180, 70, rx=18, fill="#202324", **S)
        for k in range(4):
            a.rect(cx - 70 + k * 38, cy - 96, 20, 56, rx=4, fill="#d8dddc", stroke=INK, stroke_width=3)
        a.path(f"M{cx - 240},{cy - 120} C{cx - 160},{cy - 120} {cx - 120},{cy - 60} {cx - 90},{cy - 10}", fill="none",
               stroke="#e6ecec", stroke_width=12)
        a.path(f"M{cx - 240},{cy - 120} C{cx - 160},{cy - 120} {cx - 120},{cy - 60} {cx - 90},{cy - 10}", fill="none",
               stroke=kit.BLOOD2, stroke_width=4)
    elif i == 4:    # the freeway span, drums and a tube light
        a.rect(cx - 260, cy - 150, 520, 50, fill="#4a5556", **S)
        for x in (cx - 200, cx + 160):
            a.rect(x, cy - 100, 40, 260, fill="#3f4a4b", **S)
        a.line(cx - 120, cy - 70, cx + 100, cy - 70, stroke="#f6f8f7", stroke_width=10)
        a.line(cx - 120, cy - 70, cx + 100, cy - 70, stroke="#ffffff", stroke_width=30, opacity=0.15)
        for k in range(4):
            x = cx - 120 + k * 64
            a.rect(x, cy + 50, 50, 90, rx=6, fill=["#5e7375", "#6e5a3a", "#5e7375", "#4b5a5c"][k], **S)
            a.line(x, cy + 80, x + 50, cy + 80, stroke=INK, stroke_width=3)
    elif i == 5:    # the calibration chair and the mirror
        a.rect(cx - 240, cy - 160, 220, 300, rx=8, fill="#f6f7f5", **S)
        a.rect(cx - 226, cy - 146, 192, 272, fill=kit.SKY, opacity=0.18)
        a.line(cx - 200, cy - 120, cx - 120, cy - 40, stroke="#ffffff", stroke_width=10)
        a.path(f"M{cx + 60},{cy - 120} L{cx + 160},{cy - 120} L{cx + 170},{cy + 20} L{cx + 200},{cy + 30} "
               f"L{cx + 200},{cy + 60} L{cx + 40},{cy + 60} L{cx + 40},{cy + 30} L{cx + 70},{cy + 20}Z", fill="#d9dcd8", **S)
        a.line(cx + 120, cy + 60, cx + 120, cy + 150, stroke=INK, stroke_width=8)
        a.line(cx + 70, cy + 150, cx + 170, cy + 150, stroke=INK, stroke_width=8)
    elif i == 6:    # a wall of hard light across a back door, the lamp behind
        a.rect(cx - 220, cy - 160, 440, 320, fill="#2a2620", **S)
        a.rect(cx - 70, cy - 120, 140, 280, fill="#0e0c09", **S)
        a.circle(cx, cy - 30, 120, fill=a.radial([(0, GOLD, 0.7), (1, AMBER, 0)]))
        a.rect(cx - 150, cy - 140, 300, 300, fill="#f6e2a8", opacity=0.55, stroke=INK, stroke_width=4)
        a.rect(cx - 150, cy - 140, 300, 300, fill="none", stroke="#fff6dc", stroke_width=10, opacity=0.8)
    elif i == 7:    # the dispersal rig on a rooftop, its plate
        a.rect(cx - 250, cy + 60, 500, 90, fill="#4a5556", **S)
        a.rect(cx - 60, cy - 120, 120, 180, fill="#5d6968", **S)
        a.rect(cx - 40, cy - 100, 80, 60, fill="#1b2021", stroke=INK, stroke_width=3)
        a.path(f"M{cx - 30},{cy - 50} C{cx - 30},{cy - 80} {cx + 30},{cy - 80} {cx + 30},{cy - 50}Z", fill=kit.OCHRE)
        kit.plate(a, cx - 56, cy - 26, 112, 40, "RCC", fill="#a7b1b0", size=20, sw=2)
        for k in range(6):
            a.circle(cx + 80 + k * 30, cy - 140 - k * 18, 16 + k * 6, fill=kit.RUST, opacity=0.35 - k * .04)
    elif i == 8:    # the blades on a cloth
        a.path(f"M{cx - 240},{cy + 60} L{cx + 220},{cy + 20} L{cx + 250},{cy + 140} L{cx - 220},{cy + 160}Z",
               fill="#6b6457", **S)
        for k in range(3):
            kit.blades(a, cx - 140 + k * 140, cy + 90, 0.7, sw=3)
        a.circle(cx, cy - 140, 140, fill=a.radial([(0, GOLD, 0.35), (1, GOLD, 0)]))
    elif i == 9:    # a clean-air column stamped RCC in a glass hall
        a.rect(cx - 250, cy - 160, 500, 320, fill="#e8ece9", **S)
        for x in range(int(cx - 250), int(cx + 250), 100):
            a.line(x, cy - 160, x, cy + 160, stroke="#b9c3c1", stroke_width=3)
        a.rect(cx - 50, cy - 160, 100, 320, fill="#f7faf9", **S)
        a.rect(cx - 36, cy - 140, 72, 220, fill=kit.SKY, opacity=0.25)
        kit.plate(a, cx - 46, cy + 96, 92, 40, "RCC", fill="#c3cbca", size=20, sw=2)
        a.circle(cx, cy - 100, 160, fill=a.radial([(0, GOLD, 0.25), (1, GOLD, 0)]))
    else:           # the balcony rail over the city, the wall closing
        a.rect(cx - 250, cy - 160, 500, 320, fill="#1b2324", **S)
        for k in range(14):
            x = cx - 240 + k * 36
            hh = 40 + (k * 37) % 110
            a.rect(x, cy + 40 - hh, 26, hh, fill="#2f3c3e")
            if k % 3 == 0:
                a.rect(x + 8, cy + 20 - hh * .5, 6, 6, fill=kit.TEAL3, opacity=0.6)
        a.rect(cx - 250, cy + 40, 500, 16, fill="#9aa5a4", **S)
        for x in range(int(cx - 240), int(cx + 250), 40):
            a.line(x, cy + 56, x, cy + 160, stroke="#9aa5a4", stroke_width=6)
        a.rect(cx + 40, cy - 160, 26, 320, fill="#f6e2a8", opacity=0.85, stroke=INK, stroke_width=3)


def chapter(i):
    name, cid, lead, cap = kit.CHAPTERS[i]

    def draw(a: Art):
        if lead == "tox":
            ground(a, kit.CONCRETE, 0.4, 0.6)
        elif lead == "reese":
            ground(a, "#3a2a16", 0.35, 0.45)
            a.circle(640, 120, 640, fill=a.radial([(0, GOLD, 0.35), (1, GOLD, 0)]))
        else:
            a.rect(0, 0, 1280, 720, fill="#f3f4f2")
            a.rect(0, 0, 1280, 720, fill=kit.SKY, opacity=0.12)
        emblem(a, i, 900, 330)
        dark = lead != "cally"
        fg = kit.WHITE if dark else INK
        caption_box(a, 70, 70, 460, 56, cap, size=24)
        kit.label(a, 72, 560, f"CHAPTER {kit.ROMAN[i]}", size=26, fill=GOLD if dark else "#6a5530", letter_spacing="6")
        kit.label(a, 70, 630, name.upper(), size=58 if len(name) < 16 else 46, fill=fg, font_weight="bold",
                  letter_spacing="2", fit=kit.fitw(name.upper(), 58 if len(name) < 16 else 46, 1140, .66))
        if lead == "tox":      # the Pulse margin: amber, every Dr. Tox page
            a.rect(0, 676, 1280, 44, fill="#050606")
            a.path(kit.ecg_d(20, 704, 1240, 16, beats=10), fill="none", stroke=AMBER, stroke_width=3)
    who = {"tox": "concrete with the amber Pulse margin line of a Dr. Tox chapter",
           "reese": "the warm amber of HOPE's light, a Reese chapter, with no margin line",
           "cally": "clinical white with a trace of painted-sky blue, a Cally chapter, with no HUD"}[lead]
    draw.__doc__ = (f"Chapter card {i + 1}, {name}: a typed caption box ({cap.title()}) over {who}, the chapter's "
                    f"name in capitals and one object drawn large.")
    asset(G, f"chapter-{i + 1}", group="chapters", title=f"Chapter {kit.ROMAN[i]}: {name}", w=1280, h=720,
          row=kit.row("shared", f"Chapter card ({cid})"))(draw)


for _i in range(11):
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
    a.path(kit.ecg_d(12, 58, 72, 30, beats=1), fill="none", stroke=AMBER, stroke_width=5, stroke_linejoin="round",
           stroke_linecap="round")
    a.line(12, 74, 84, 74, stroke="#2f3a3b", stroke_width=2)


@asset(G, "hud-pulse-edge", group="ui", title="HUD icon: Pulse near the line (green spike)", w=96, h=96,
       row=kit.row("shared", "HUD: Pulse"))
def hud_pulse_edge(a: Art):
    """The Pulse icon near the trigger line: an amber line under a pale dashed Self line, broken by one
    taller green spike that touches it."""
    icon_ground(a)
    a.line(12, 24, 84, 24, stroke=kit.WHITE, stroke_width=2, stroke_dasharray="4 3", opacity=0.8)
    a.path(kit.ecg_d(10, 62, 76, 26, beats=2), fill="none", stroke=AMBER, stroke_width=4, stroke_linejoin="round")
    a.path("M70,62 L75,24 L80,72 L85,62", fill="none", stroke=GREEN, stroke_width=3.5, stroke_linejoin="round")


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
    """An empty vial outline in gray-teal: a dose not on hand."""
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


@asset(G, "hud-breath", group="ui", title="HUD icon: the breath radius (a ring on the floor)", w=96, h=96,
       row=kit.row("shared", "HUD: the breath radius"))
def hud_breath(a: Art):
    """The breath-radius icon: a narrow shrouded figure seen small inside a pale dashed ring on the
    floor, nobody inside it."""
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
    """Aegis's Load gauge: a thin pale-gold bar in HOPE's warm styling, ten segments and the word LOAD;
    the fill is laid over it at run time. No margin line: Reese's screens have none."""
    a.rect(2, 8, 476, 32, rx=16, fill="#2a1e0c", stroke=GOLD, stroke_width=2)
    for k in range(1, 10):
        a.line(70 + k * 39.6, 14, 70 + k * 39.6, 34, stroke=GOLD, stroke_width=1, opacity=0.5)
    kit.label(a, 18, 30, "LOAD", size=14, fill=GOLD, font_weight="bold", letter_spacing="3")
    a.rect(70, 16, 396, 16, rx=8, fill="none", stroke=GOLD, stroke_width=1, opacity=0.6)


def margin(a, beats, h, green=0, trigger=False):
    a.rect(0, 0, 1200, 32, fill="#050606")
    if trigger:
        a.line(0, 5, 1200, 5, stroke=kit.WHITE, stroke_width=1.5, stroke_dasharray="8 6", opacity=0.7)
    a.path(kit.ecg_d(8, 20, 1184, h, beats=beats), fill="none", stroke=AMBER, stroke_width=2.5, stroke_linejoin="round")
    return a


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
    on every dispenser, rig and clean-air column in Fall."""
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


@asset(G, "hud-word-silence", group="ui", title="Terminology Rule: nothing (the held breath)", w=240, h=96,
       row=kit.row("shared", "HUD: the Word (Terminology Rule)"))
def word_silence(a: Art):
    """The third answer, saying nothing: an empty caption plate with a long dash where the word would be,
    in cold gray-teal between the warm insignia and the stamped plate."""
    a.rect(6, 10, 228, 76, rx=8, fill="#1d2526", stroke=kit.TEAL, stroke_width=3)
    a.line(70, 50, 170, 50, stroke=kit.TEAL3, stroke_width=5, stroke_linecap="round")
    for x, y in ((14, 18), (226, 18), (14, 78), (226, 78)):
        a.circle(x, y, 2.5, fill=kit.TEAL)


@asset(G, "hud-caption", group="ui", title="Caption box (blank, for dated captions)", w=600, h=96,
       row=kit.row("shared", "Typed caption box"))
def hud_caption(a: Art):
    """A blank typed caption box with a drop shadow, the box every chapter opens on, dated and naming the
    lead. Text is laid over it at run time."""
    a.rect(10, 12, 576, 74, fill="#000", opacity=0.45)
    a.rect(4, 6, 576, 74, fill=CAP, stroke=INK, stroke_width=3)
    a.rect(10, 12, 564, 62, fill="none", stroke=INK, stroke_width=0.8, opacity=0.5)
    for x in (16, 568):
        a.line(x, 18, x, 68, stroke=INK, stroke_width=0.6, opacity=0.25)


# ---- ending lettering plates -------------------------------------------------------------------
FAR = "reassigned; the variance logged."
ENDINGS = (
    ("first-word", "First Word", "HOPE pulls the leash mid-fight: Ama Owusu and Lev Brandt are taken, and Reese is recalled.",
     ("over the rail.", "said RCC; recalled.", FAR)),
    ("bond-held", "Bond Held", "Reese breaks back into the program; Cally never says “RCC”: the crack is filed as noise again.",
     ("over the rail.", "back in the program.", "calibration complete.")),
    ("the-clinic", "The Clinic", "The bloom takes the settlement under the freeway.",
     ("a clinic nobody stays in.", "held the wall; walked the other way.", FAR)),
    ("the-following", "The Following", "Dependence: they need him, they have begun to arm themselves, and what he built will soon move without him.",
     ("they need him.", "held the wall; walked the other way.", FAR)),
)


def ending_image(a, slug):
    """The ending's last image, small and still, in the left half."""
    if slug == "first-word":           # the recall transport, amber light, one seated shape
        a.rect(40, 40, 520, 595, fill="#120d07")
        a.rect(40, 40, 520, 595, fill=a.radial([(0, GOLD, 0.45), (1, AMBER, 0)], cx=0.5, cy=0.15, r=0.9))
        a.rect(60, 140, 480, 40, fill="#2a1e0c")
        for x in (100, 260, 420):
            a.rect(x, 80, 80, 50, rx=6, fill="#3a2a12", stroke="#6a4c1c", stroke_width=2)
        a.rect(60, 430, 480, 50, fill="#2a1e0c", stroke="#6a4c1c", stroke_width=2)
        a.path(kit.person_d(300, 470, 1.9, broad=1.25), fill="#0b0805")
        a.rect(60, 480, 480, 155, fill="#0b0805")
    elif slug == "bond-held":          # a handler's screen, one line appended
        a.rect(40, 40, 520, 595, fill="#e6e9e7")
        a.rect(90, 120, 420, 300, rx=10, fill="#0d1112", stroke="#55605f", stroke_width=6)
        for k in range(7):
            a.rect(116, 156 + k * 28, 180 + (k * 53) % 160, 8, fill=kit.TEAL, opacity=0.8)
        kit.label(a, 116, 376, "CALIBRATION COMPLETE", size=24, family="monospace", fill=kit.WHITE, fit=340)
        a.rect(270, 420, 60, 70, fill="#9aa5a4")
        a.rect(200, 490, 200, 16, fill="#9aa5a4")
        a.circle(300, 280, 260, fill=a.radial([(0, GOLD, 0.12), (1, GOLD, 0)]))
    elif slug == "the-clinic":         # one cot made up under a lamp; someone going up the breach
        a.rect(40, 40, 520, 595, fill="#060505")
        a.path("M330,40 L440,40 L470,330 L300,330Z", fill="#5e7375", opacity=0.45)
        a.path(kit.person_d(390, 300, 0.7), fill="#0d1112")
        a.circle(200, 330, 230, fill=a.radial([(0, GOLD, 0.6), (0.5, AMBER, 0.2), (1, AMBER, 0)]))
        a.path("M180,260 L220,260 L212,240 L188,240Z", fill="#262626")
        a.rect(80, 470, 300, 36, fill="#d8d2c2", stroke="#3a3020", stroke_width=3)
        a.rect(80, 456, 70, 18, rx=8, fill="#efe9da")
        for x in (96, 364):
            a.line(x, 506, x, 560, stroke="#3a3f40", stroke_width=6)
    else:                              # the blades on the cloth; rows of seated shapes under lanterns
        a.rect(40, 40, 520, 595, fill="#080605")
        for x in (140, 300, 460):
            a.circle(x, 120, 90, fill=a.radial([(0, GOLD, 0.45), (1, AMBER, 0)]))
            a.rect(x - 8, 110, 16, 22, fill=AMBER)
        for r in range(3):
            for c in range(6):
                x = 90 + c * 84 + (r % 2) * 30
                a.path(kit.person_d(x, 300 + r * 70, 0.55 + r * .08, hunch=4), fill="#2e241a", opacity=0.95,
                       stroke="#4a3a24", stroke_width=1.5)
        a.path("M120,520 L470,500 L500,600 L100,610Z", fill="#4a4438")
        for k in range(3):
            kit.blades(a, 190 + k * 110, 570, 0.42, sw=2)


def ending(slug, name, cost, leads):
    def draw(a: Art):
        a.paper("#0b0d0d", grain=0.3, fibre=1.1)
        ending_image(a, slug)
        a.rect(40, 40, 520, 595, fill="none", stroke="#2f3a3b", stroke_width=3)
        kit.label(a, 610, 110, "ENDING", size=22, fill=kit.TEAL3, letter_spacing="8")
        kit.label(a, 606, 200, name.upper(), size=66, fill=kit.WHITE, font_weight="bold", letter_spacing="2",
                  fit=kit.fitw(name.upper(), 66, 550, .66))
        y = 268
        for who, state in zip(("DR. TOX", "REESE", "CALLY"), leads):
            kit.label(a, 608, y, who, size=16, fill=GOLD, font_weight="bold", letter_spacing="3")
            kit.label(a, 712, y, state, size=21, family="serif", fill=kit.TEAL3, fit=kit.fitw(state, 21, 440, .5))
            y += 44
        a.line(608, 470, 1150, 470, stroke="#2f3a3b", stroke_width=2)
        kit.label(a, 608, 506, "THE COST", size=16, fill=kit.TEAL2, letter_spacing="5")
        for k, ln in enumerate(kit.wrap(cost, 50)[:3]):
            kit.label(a, 608, 544 + k * 32, ln, size=22, family="serif", fill=kit.WHITE, fit=kit.fitw(ln, 22, 540, .5))
    draw.__doc__ = (f"Ending lettering plate for {name}, a proposal (none of Fall's endings is as written): the "
                    f"ending's last image small and still on the left, its name in pale capitals on the right, one "
                    f"line for each lead's state (Dr. Tox, Reese, Cally), and the cost below.")
    asset(G, f"ending-{slug}", group="endings", title=f"Ending: {name}", w=1200, h=675,
          row=kit.row("loading", "Ending lettering plates (menu spoilers)"))(draw)


for _e in ENDINGS:
    ending(*_e)

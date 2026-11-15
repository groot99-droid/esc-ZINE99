"""The Chart and the long puzzle's paper: Form 7-F, the target sheet, the Schedule, its seven strips, six stamps."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, CREAM, GREEN, SODIUM, STEEL, FROST, SNOW, BRUISE, RED = (kit.INK, kit.CREAM, kit.GREEN, kit.SODIUM, kit.STEEL,
                                                              kit.FROST, kit.SNOW, kit.BRUISE, kit.RED)
ROW = "Form 7-F, target sheet, Schedule, 7 strips, 6 stamps"
PW, PH = 800, 1100
PENCIL = "#3b3a38"
GRID1, GRID2 = "#9cc3a8", "#6fa384"


def _sheet(a, color="#F1EDE0", holes=True):
    a.paper(color, grain=0.22)
    if holes:
        for y in (150, 550, 950):
            kit.punch(a, 34, y, 11, back="#4a4d4f")
    a.line(64, 0, 64, PH, stroke=FROST, stroke_width=1, opacity=0.6)


def _sheet_done(a, frost=0.2, smudge=4):
    kit.carbon(a, 80, 80, PW - 160, PH - 160, n=smudge, op=0.07)
    kit.frost_corners(a, frost)
    a.vignette(0.18)


def _vals(change):
    return [f"{82 - 0.35 * change:.1f}", f"{178 + 1.6 * change:.1f}", f"{36.8 - 0.04 * change:.1f}",
            f"{64 - 0.3 * change:.0f}", f"{45 + 0.9 * change:.0f}", f"{75 + 0.7 * change:.0f}"]


@asset(G, "form-7f", group="documents", title="Form 7-F: the daily measurements", w=PW, h=PH, row=ROW)
def form_7f(a: Art):
    """Form 7-F, the clipboard sheet of The Chart: nine typed rows from weight to self-reported hunger against
    seven day columns, day 1 typed at intake and the next four days entered in the orderly's pencil,
    with the height row plotted on medical graph paper at the foot and day 5's column boxed."""
    _sheet(a)
    kit.stencil(a, 90, 96, "FORM 7-F", 44)
    kit.typed(a, 740, 70, "WARD B", size=20, anchor="end")
    kit.typed(a, 740, 98, "CASE 7-F  FISK", size=20, anchor="end")
    a.line(90, 116, 740, 116, stroke=INK, stroke_width=4)
    rows = ["WEIGHT kg", "HEIGHT cm", "CORE TEMP C", "RESTING PULSE", "GRIP kg", "STRIDE cm", "RATION PIECES", "PILLS",
            "HUNGER 1-10"]
    x0, y0, lw, cw, rh = 90, 150, 200, 64.2, 44
    a.rect(x0, y0, lw + cw * 7, rh * (len(rows) + 1), fill="none", stroke=INK, stroke_width=2.5)
    d = "".join(f"M{x0},{y0 + rh * (i + 1)}H{x0 + lw + cw * 7}" for i in range(len(rows)))
    d += "".join(f"M{f(x0 + lw + cw * i)},{y0}V{y0 + rh * (len(rows) + 1)}" for i in range(7))
    a.path(d, stroke=INK, stroke_width=1.3, fill="none")
    for i in range(7):
        kit.typed(a, x0 + lw + cw * (i + 0.5), y0 + 29, f"DAY {i + 1}", size=14, anchor="middle")
    changes = [0, 9, 20, 31, 43]
    pieces = ["-", "5", "5", "5", "6"]
    pills = ["-", "1", "1", "1", "1"]
    hunger = ["2", "4", "5", "7", "8"]
    for r, lab in enumerate(rows):
        y = y0 + rh * (r + 1) + 29
        kit.typed(a, x0 + 12, y, lab, size=16)
        for dcol in range(5):
            v = (_vals(changes[dcol]) + [pieces[dcol], pills[dcol], hunger[dcol]])[r]
            cx = x0 + lw + cw * (dcol + 0.5)
            if dcol == 0:
                kit.typed(a, cx, y, v, size=17, anchor="middle")
            else:
                a.text(cx + a.rng.uniform(-3, 3), y + a.rng.uniform(-2, 2), v, size=22, family="cursive", fill=PENCIL,
                       text_anchor="middle", transform=f"rotate({f(a.rng.uniform(-5, 3))} {f(cx)} {f(y)})")
    a.rect(x0 + lw + cw * 4, y0 - 5, cw, rh * (len(rows) + 1) + 10, fill="none", stroke=SODIUM, stroke_width=4)
    # the plot: height against the day
    gx, gy, gw, gh = 150, 660, 590, 300
    a.grid(gx, gy, gw, gh, 10, stroke=GRID1, stroke_width=0.5)
    a.grid(gx, gy, gw, gh, 50, stroke=GRID2, stroke_width=1.1)
    a.path(f"M{gx},{gy}V{gy + gh}H{gx + gw}", fill="none", stroke=INK, stroke_width=2)
    kit.typed(a, 90, 648, "HT (cm)", size=15)
    for v in range(180, 281, 20):
        kit.typed(a, gx - 8, gy + gh - (v - 170) / 120 * gh + 5, str(v), size=13, anchor="end", ghost=False)
    pts = []
    for i in range(7):
        cx = gx + gw * (i + 0.5) / 7
        kit.typed(a, cx, gy + gh + 22, f"D{i + 1}", size=14, anchor="middle", ghost=False)
        if i < 5:
            pts.append((cx, gy + gh - (178 + 1.6 * changes[i] - 170) / 120 * gh))
    a.wobble(pts, amp=0.8, step=8, stroke=PENCIL, stroke_width=2.6)
    for x, y in pts:
        a.path(f"M{f(x - 6)},{f(y - 6)}l12,12M{f(x - 6)},{f(y + 6)}l12,-12", stroke=INK, stroke_width=2.2)
    a.wobble(kit.circ_pts(pts[-1][0], pts[-1][1], 20, 16), amp=1.2, step=7, closed=True, stroke="#2b4c7e", stroke_width=2)
    kit.typed(a, 90, 1040, "ORDERLY:", size=16)
    a.line(190, 1042, 420, 1042, stroke=INK, stroke_width=1.3)
    a.text(210, 1036, "Up again.", size=26, family="cursive", fill=PENCIL)
    kit.typed(a, 740, 1040, "1 of 2", size=16, anchor="end")
    _sheet_done(a, 0.2)


@asset(G, "target-sheet", group="documents", title="The target sheet", w=PW, h=PH, row=ROW)
def target_sheet(a: Art):
    """The second sheet under the Chart: medical graph paper with a printed target curve for height, day by day,
    in a shaded band that climbs from 178 cm to its last number, 338; five small plain figures stand on
    the day line getting taller, and a pencilled line of crosses lies exactly along the curve."""
    _sheet(a)
    kit.stencil(a, 90, 96, "TARGET", 44)
    kit.typed(a, 740, 70, "FORM 7-F / 2", size=20, anchor="end")
    kit.typed(a, 740, 98, "HT (cm) BY DAY", size=20, anchor="end")
    a.line(90, 116, 740, 116, stroke=INK, stroke_width=4)
    gx, gy, gw, gh = 150, 160, 590, 760
    a.grid(gx, gy, gw, gh, 10, stroke=GRID1, stroke_width=0.5)
    a.grid(gx, gy, gw, gh, 50, stroke=GRID2, stroke_width=1.1)
    a.path(f"M{gx},{gy}V{gy + gh}H{gx + gw}", fill="none", stroke=INK, stroke_width=2.5)

    def yv(v):
        return gy + gh - (v - 160) / 190 * gh
    for v in range(180, 341, 20):
        kit.typed(a, gx - 10, yv(v) + 5, str(v), size=14, anchor="end", ghost=False)
    days = 11
    tp = []
    for i in range(days):
        cx = gx + gw * (i + 0.5) / days
        kit.typed(a, cx, gy + gh + 24, f"D{i + 1}", size=13, anchor="middle", ghost=False)
        tp.append((cx, yv(178 + 160 * (i / (days - 1)) ** 1.25)))
    hi = [(x, y - 16) for x, y in tp]
    lo = [(x, y + 16) for x, y in tp]
    a.path(a.smooth_d(hi) + " L" + " L".join(f"{f(x)},{f(y)}" for x, y in reversed(lo)) + "Z", fill=BRUISE, opacity=0.16)
    a.path(a.smooth_d(tp), fill="none", stroke=INK, stroke_width=3, stroke_dasharray="12 7")
    a.circle(tp[-1][0], tp[-1][1], 7, fill=INK)
    kit.stencil(a, tp[-1][0] - 14, tp[-1][1] - 26, "338", 30, anchor="end")
    kit.typed(a, tp[0][0] + 14, tp[0][1] + 34, "178", size=18)
    # the plain figures on the day line
    for j, i in enumerate((0, 2, 5, 8, 10)):
        cx = tp[i][0]
        h = (178 + 160 * (i / (days - 1)) ** 1.25) / 190 * 130
        t = j / 4
        a.open("g", opacity=0.5)
        hr = 7 - t
        a.circle(cx, gy + gh - h + hr, hr, fill=INK)
        a.poly([(cx - 10 + 2 * t, gy + gh - h + 2 * hr + 3 + 5 * t), (cx + 10 - 2 * t, gy + gh - h + 2 * hr + 3 + 5 * t),
                (cx + 6 - t, gy + gh - h * 0.5), (cx - 6 + t, gy + gh - h * 0.5)], fill=INK)
        a.rect(cx - 6 + t, gy + gh - h * 0.5, 4.4, h * 0.5, fill=INK)
        a.rect(cx + 1.6 - t, gy + gh - h * 0.5, 4.4, h * 0.5, fill=INK)
        a.rect(cx - 1.5, gy + gh - h + 2 * hr - 2, 3, 5 + 5 * t, fill=INK)
        a.close()
    # his own line, in pencil, on it
    meas = [(x, y + a.rng.uniform(-5, 5)) for x, y in tp[:5]]
    a.wobble(meas, amp=0.8, step=8, stroke=PENCIL, stroke_width=2.6)
    for x, y in meas:
        a.path(f"M{f(x - 6)},{f(y - 6)}l12,12M{f(x - 6)},{f(y + 6)}l12,-12", stroke=INK, stroke_width=2.2)
    a.text(meas[4][0] + 20, meas[4][1] + 44, "on schedule", size=30, family="cursive", fill=PENCIL,
           transform=f"rotate(-8 {f(meas[4][0])} {f(meas[4][1])})")
    kit.typed(a, 90, 1040, "PRINTED. DO NOT ENTER BELOW THE BAND.", size=14)
    kit.typed(a, 740, 1040, "2 of 2", size=16, anchor="end")
    _sheet_done(a, 0.25)


SCHED = [
    (1, "06:00", ["Intake. Rules read."], '"Sir yes Sir."'),
    (2, "14:00", ["False statement issued (transfer).", "Companion (uninformed)."], "curiosity. Retained."),
    (3, "19:00", ["Card table.", "Loss to witness."], ""),
    (4, "23:00", ["Cabinet left unlocked.", "Officers' wing left unwatched."], ""),
    (5, "08:00", ["On schedule."], ""),
    (6, "09:00", ["Subject will report companion.", "Subject will follow."], ""),
    (7, "22:00", ["STAY: retained.", "FOLLOW: see previous.", "FENCE: photographed, not followed."], ""),
]


@asset(G, "schedule", group="documents", title="The Schedule: Fisk's sheet", w=PW, h=PH, row=ROW)
def schedule(a: Art):
    """The Schedule, one subject's typed sheet: a line for each of seven days saying what is to be issued to
    him and a blank for his response, tomorrow already typed, and on every day one box left empty at
    22:00. Day 7 lists outcomes for stay, follow and fence; a fourth is written beside them by hand."""
    _sheet(a, color="#EEE9DA")
    kit.stencil(a, 90, 96, "SCHEDULE", 44)
    kit.typed(a, 740, 70, "SUBJECT: FISK", size=20, anchor="end")
    kit.typed(a, 740, 98, "Results required: 1", size=20, anchor="end")
    a.line(90, 116, 740, 116, stroke=INK, stroke_width=4)
    kit.typed(a, 90, 146, "DAY   TIME    ISSUED", size=15)
    kit.typed(a, 740, 146, "RESPONSE", size=15, anchor="end")
    y = 160
    for day, tm, lines, resp in SCHED:
        h = 122 if day < 7 else 150
        a.rect(90, y, 650, h, fill="none", stroke=INK, stroke_width=1.6)
        a.line(150, y, 150, y + h, stroke=INK, stroke_width=1.2)
        kit.stencil(a, 120, y + 46, str(day), 36, anchor="middle")
        for i, ln in enumerate(lines):
            kit.typed(a, 164, y + 28 + i * 24, (tm + "  " if i == 0 else "       ") + ln, size=15.5)
        ry = y + h - 44
        if day < 7:
            kit.typed(a, 164, ry, "Response:", size=15)
            a.line(262, ry + 3, 560, ry + 3, stroke=INK, stroke_width=1)
            if resp:
                kit.typed(a, 270, ry, resp, size=15)
        # the empty slot
        kit.typed(a, 164, y + h - 14, "22:00", size=15)
        a.rect(226, y + h - 32, 334, 24, fill="#F8F5EC", stroke=INK, stroke_width=1.6)
        if day <= 5:
            a.path(f"M{600},{y + h / 2} l10,12 l22,-28", fill="none", stroke=PENCIL, stroke_width=2.5, opacity=0.8)
        y += h
    # the carry, in the orderly's hand
    a.text(590, 1000, "carried him", size=30, family="cursive", fill=PENCIL, transform="rotate(-5 590 1000)")
    a.path("M584,1004 q-20,6 -34,-12", fill="none", stroke=PENCIL, stroke_width=2)
    kit.stamp(a, 650, 366, "RETAINED", w=160, h=42, rot=-7, patch=0.7, opacity=0.85)
    kit.typed(a, 90, 1070, "Typed one day ahead.", size=13)
    _sheet_done(a, 0.3, smudge=6)


STRIP_W, STRIP_H = 800, 260
for _day, _tm, _lines, _resp in SCHED:
    def _mk(day=_day, tm=_tm, lines=_lines, resp=_resp):
        def fn(a: Art):
            tilt = a.rng.uniform(-2.2, 2.2)
            a.open("g", transform=f"rotate({f(tilt)} 400 130)")
            d = kit.torn_d(a, 30, 34, 740, 190, amp=4 + day, step=8 + a.rng.random() * 5)
            a.path(d, fill="#000", opacity=0.3, transform="translate(5,7)", filter=a.blur(4))
            a.path(d, fill="#EEE9DA" if day != 4 else "#E3E3E6", stroke="#b9b29c", stroke_width=1)
            cl = a.clip(f'<path d="{d}"/>')
            kit.speckle(a, cl, 0, 0, STRIP_W, STRIP_H, color="#6f6750", strength=0.2)
            ink = INK if day != 4 else "#3a3f63"     # night 4's strip is the carbon copy
            a.line(110, 40, 110, 218, stroke=ink, stroke_width=1.2)
            kit.stencil(a, 72, 104, str(day), 52, fill=ink, anchor="middle")
            kit.typed(a, 72, 134, "DAY", size=14, fill=ink, anchor="middle")
            for i, ln in enumerate(lines):
                kit.typed(a, 128, 78 + i * 28, (tm + "  " if i == 0 else "       ") + ln, size=19, fill=ink)
            yb = 78 + len(lines) * 28 + 6
            if day < 7:
                kit.typed(a, 128, yb, "Response:", size=17, fill=ink)
                a.line(238, yb + 3, 560, yb + 3, stroke=ink, stroke_width=1)
                if resp:
                    kit.typed(a, 246, yb, resp, size=17, fill=ink)
            kit.typed(a, 128, 204, "22:00", size=19, fill=ink)
            a.rect(204, 182, 380, 30, fill="#F8F5EC", stroke=ink, stroke_width=1.8)
            # what each strip picked up on the night it was found
            a.open("g", clip_path=cl)
            if day == 1:
                a.circle(690, 120, 44, fill="none", stroke="#8a6b3c", stroke_width=5, opacity=0.35)
            elif day == 2:
                kit.stamp(a, 664, 110, "RETAINED", w=150, h=40, rot=-9, patch=0.7)
            elif day == 3:
                for i in range(3):
                    a.rect(640 + i * 6, 70 + i * 8, 46, 64, rx=4, fill=kit.CARD, stroke="#6f6750", stroke_width=1,
                           transform=f"rotate({-12 + i * 12} {663 + i * 6} {102 + i * 8})", opacity=0.9)
            elif day == 4:
                kit.carbon(a, 120, 50, 600, 170, n=6, op=0.16)
                a.text(600, 160, "typed", size=30, family="cursive", fill=PENCIL, transform="rotate(-8 600 160)")
            elif day == 5:
                a.text(600, 130, "on schedule", size=26, family="cursive", fill=PENCIL, transform="rotate(-6 600 130)")
                a.path("M596,138 q60,10 130,-8", fill="none", stroke=PENCIL, stroke_width=2)
            elif day == 6:
                kit.stamp(a, 660, 130, "BROKEN", w=140, h=44, rot=-12, patch=0.6)
            else:
                a.text(560, 166, "carried him", size=28, family="cursive", fill=PENCIL, transform="rotate(-5 560 166)")
                a.path("M556,172 q-14,2 -24,-14", fill="none", stroke=PENCIL, stroke_width=2)
            kit.frost(a, 770, 224, 180, 270, 40 + day * 22, n=4, haze=True, op=0.9, budget=120, color="#8f9aa3")
            kit.frost(a, 771, 225, 180, 270, 40 + day * 22, n=4, haze=True, op=0.9, budget=120)
            a.close()
            if day % 2:
                a.path("M52,44 h26 M52,50 h26", stroke=STEEL, stroke_width=2.5)
            a.close()
        fn.__doc__ = (f"Torn strip {day} of the Schedule, found on a night out: day {day}'s typed line ("
                      + " ".join(lines) + ") with its response blank, the 22:00 box empty, torn top and bottom, and "
                      "whatever the night left on it.")
        return fn
    asset(G, f"schedule-strip-{_day}", group="documents", title=f"Schedule strip, day {_day}", w=STRIP_W, h=STRIP_H,
          row=ROW)(_mk())


# ---- the six rubber stamps ------------------------------------------------------------------------
SW, SH = 460, 220


def _flecks(a, n=10):
    a.open("g", fill=RED, opacity=0.6)
    for _ in range(n):
        a.circle(a.rng.uniform(30, SW - 30), a.rng.uniform(24, SH - 24), a.rng.uniform(0.7, 2.4))
    a.close()


@asset(G, "stamp-broken", group="ui", title="Stamp: BROKEN", w=SW, h=SH, row=ROW)
def st_broken(a: Art):
    """The BROKEN rubber stamp in red: a heavy double box struck hard and a little crooked, the ink cracked
    through the middle of the word as if the die itself had split."""
    kit.stamp(a, 230, 110, "BROKEN", w=380, h=120, rot=-7, patch=0.8, opacity=0.92)
    a.path("M210,30 l14,44 l-18,30 l22,36 l-10,52", fill="none", stroke="#999", stroke_width=5, opacity=0.0)
    a.wobble([(214, 34), (228, 78), (210, 110), (232, 146), (222, 194)], amp=2, step=10, stroke=RED, stroke_width=1.6,
             opacity=0.5)
    _flecks(a, 14)


@asset(G, "stamp-supported", group="ui", title="Stamp: SUPPORTED", w=SW, h=SH, row=ROW)
def st_supported(a: Art):
    """The SUPPORTED rubber stamp in red: a long single-ruled box with a row of small ticks under the word,
    struck level and lightly, the ink thin at one end."""
    a.open("g", transform="rotate(-2 230 110)", filter=kit.ink_filter(a, 1.1, 2), opacity=0.9)
    a.rect(34, 52, 392, 116, rx=10, fill="none", stroke=RED, stroke_width=6)
    a.text(230, 120, "SUPPORTED", size=56, family="monospace", fill=RED, font_weight="bold", text_anchor="middle",
           letter_spacing=3)
    a.path("".join(f"M{70 + i * 34},150 l7,8 l13,-17" for i in range(10)), fill="none", stroke=RED, stroke_width=3.5)
    a.close()
    _flecks(a, 6)


@asset(G, "stamp-hold", group="ui", title="Stamp: HOLD", w=SW, h=SH, row=ROW)
def st_hold(a: Art):
    """The HOLD rubber stamp in red, the mail room's: drawn stencil capitals in a thick box, struck twice so a
    ghost of the first try shows above the second."""
    for dy, op, patch in ((-14, 0.25, 1.4), (0, 0.92, 0.7)):
        a.open("g", transform=f"translate(230,{112 + dy}) rotate({-10 + dy * 0.2})", opacity=op,
               filter=kit.ink_filter(a, patch, 3))
        a.rect(-176, -70, 352, 140, fill="none", stroke=RED, stroke_width=11)
        a.rect(-162, -56, 324, 112, fill="none", stroke=RED, stroke_width=2.5)
        kit.block_text(a, -kit.block_width("HOLD", 80, 14) / 2, -40, "HOLD", 80, fill=RED, sw=30, gap=14)
        a.close()
    _flecks(a, 12)


@asset(G, "stamp-withdrawn", group="ui", title="Stamp: WITHDRAWN", w=SW, h=SH, row=ROW)
def st_withdrawn(a: Art):
    """The WITHDRAWN rubber stamp in red: a long narrow box set at a steep angle, the word spaced wide, with the
    seat number line beneath it left blank."""
    a.open("g", transform="translate(230,110) rotate(-16)", filter=kit.ink_filter(a, 0.8, 2.5), opacity=0.92)
    a.rect(-206, -44, 412, 88, fill="none", stroke=RED, stroke_width=7)
    a.text(0, 6, "WITHDRAWN", size=54, family="monospace", fill=RED, font_weight="bold", text_anchor="middle",
           letter_spacing=6)
    a.text(-190, 34, "SEAT", size=15, family="monospace", fill=RED, letter_spacing=2)
    a.line(-136, 34, 190, 34, stroke=RED, stroke_width=2, stroke_dasharray="6 4")
    a.close()
    _flecks(a, 10)


@asset(G, "stamp-retained", group="ui", title="Stamp: RETAINED", w=SW, h=SH, row=ROW)
def st_retained(a: Art):
    """The RETAINED rubber stamp in red: the project's round double-ring seal with the form number at its
    centre, and the word on a bar struck across it."""
    a.open("g", transform="rotate(-5 230 110)", filter=kit.ink_filter(a, 0.8, 2.5), opacity=0.92)
    mid = a.uid("rm")
    a.defn(f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="460" height="220"><rect width="460" '
           f'height="220" fill="#fff"/><rect x="54" y="80" width="352" height="72" fill="#000"/></mask>')
    a.open("g", mask=f"url(#{mid})")
    a.circle(230, 110, 96, fill="none", stroke=RED, stroke_width=7)
    a.circle(230, 110, 78, fill="none", stroke=RED, stroke_width=2.5)
    a.text(230, 66, "7-F", size=32, family="monospace", fill=RED, font_weight="bold", text_anchor="middle")
    for i in range(12):
        ang = math.radians(i * 30 + 15)
        a.circle(230 + 87 * math.cos(ang), 110 + 87 * math.sin(ang), 3, fill=RED)
    a.close()
    a.rect(60, 86, 340, 60, fill="none", stroke=RED, stroke_width=6)
    a.text(230, 132, "RETAINED", size=48, family="monospace", fill=RED, font_weight="bold", text_anchor="middle",
           letter_spacing=4)
    a.close()
    _flecks(a, 8)


@asset(G, "stamp-see-previous", group="ui", title="Stamp: SEE PREVIOUS", w=SW, h=SH, row=ROW)
def st_see_previous(a: Art):
    """The SEE PREVIOUS rubber stamp in red: two short lines in a box with an arrow pointing back up the page,
    the stamp that fills the Schedule's last cell."""
    a.open("g", transform="rotate(4 230 110)", filter=kit.ink_filter(a, 0.9, 2.5), opacity=0.92)
    a.rect(44, 28, 372, 164, fill="none", stroke=RED, stroke_width=7)
    a.rect(56, 40, 348, 140, fill="none", stroke=RED, stroke_width=2)
    a.text(84, 100, "SEE", size=58, family="monospace", fill=RED, font_weight="bold", letter_spacing=4)
    a.text(84, 162, "PREVIOUS", size=50, family="monospace", fill=RED, font_weight="bold", letter_spacing=3)
    a.path("M330,112 V60 M306,84 L330,56 L354,84", fill="none", stroke=RED, stroke_width=10, stroke_linejoin="miter")
    a.close()
    _flecks(a, 9)

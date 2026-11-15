"""UI ornaments for every screen: Reconcile's stamps, the pencil tick, the map lens's compass rose, Dell's
slot chalk, the seam notch, the notebook tabs, the walkie dial, the time-unit circles and the loop strip."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "UI ornaments: stamps, tick, compass rose, slot chalk, seam notch, tabs, walkie dial"


def stamp(key, word, shape, ink, rot, doc):
    @asset(G, f"stamp-{key}", group="ui", title=f"Stamp: {word}", w=300, h=300, row=ROW)
    def draw(a: Art):
        r = a.rng
        kit.notebook(a, step=34, top=40, margin=None)
        fx = a.roughen(2.4, 0.35)
        # worn rubber: the stamp is masked by a speckle of missed ink
        mid = a.uid("m")
        a.defn(f'<filter id="{mid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.7" '
               f'numOctaves="2" seed="{a.seed % 97}"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.6 1.75"/>'
               f'<feComposite in="SourceGraphic" operator="in"/></filter>')
        a.open("g", filter=f"url(#{mid})")
        a.open("g", transform=f"rotate({rot} 150 150)", filter=fx, opacity=0.9)
        if key == "sure":
            a.rect(40, 92, 220, 116, rx=8, fill="none", stroke=ink, stroke_width=9)
            a.rect(54, 106, 192, 88, rx=4, fill="none", stroke=ink, stroke_width=2.5)
            a.text(150, 172, word, size=62, family="sans-serif", fill=ink, text_anchor="middle", font_weight="bold", letter_spacing="6")
        else:
            a.circle(150, 150, 112, fill="none", stroke=ink, stroke_width=9)
            a.circle(150, 150, 96, fill="none", stroke=ink, stroke_width=2.5)
            if shape == "circle":
                a.circle(150, 112, 30, fill="none", stroke=ink, stroke_width=11)
            elif shape == "cross":
                a.path("M124,86 L176,138 M176,86 L124,138", stroke=ink, stroke_width=12, fill="none")
            else:
                a.path("M116,112 H184", stroke=ink, stroke_width=12, fill="none")
            a.text(150, 196 if len(word) < 8 else 190, word, size=40 if len(word) < 8 else 27 if len(word) < 10 else 21, family="sans-serif", fill=ink,
                   text_anchor="middle", font_weight="bold", letter_spacing="3")
            a.text(150, 226, "GROUND", size=14, family="sans-serif", fill=ink, text_anchor="middle", letter_spacing="5")
        a.close()
        a.close()
        kit.tooth(a, 0.07)
    draw.__doc__ = doc
    return draw


stamp("here", "HERE", "circle", kit.INK, -8, "Reconcile's ground stamp for a site that is here: a worn round rubber stamp in forest-green ink with a ring for its shape, pressed a little crooked onto ruled notebook paper.")
stamp("gone", "NOT HERE", "cross", kit.INK, 6, "Reconcile's ground stamp for a site that is not here: the same worn green rubber stamp with a cross for its shape, so the status reads without colour.")
stamp("not-walked", "NOT WALKED", "dash", "#6f7a70", -4, "Reconcile's ground stamp for a site Tam has not walked: a paler, greyer impression with a dash for its shape.")
stamp("sure", "SURE", "box", kit.RED, -11, "The Sure stamp, three to a sheet: a rectangular rubber stamp in the van's dull red, pressed hard and crooked. A row stamped Sure cannot be corrected, and is built as written.")


@asset(G, "tick", group="ui", title="The pencil tick", w=240, h=240, row=ROW)
def tick(a: Art):
    """Tam's pencil tick for a post, drawn in one stroke on the Tally strip of the notebook beside a row of earlier tally gates; the mark the printed counter is checked against."""
    kit.notebook(a, step=30, top=36, margin=30)
    kit.tally(a, 44, 30, 9, h=34, gap=11)
    for k in range(3):
        kit.pencil(a, [(60, 136 + k), (98, 190 + k), (190, 78 + k)], w=5 - k, amp=1.6, step=9, op=0.85)
    kit.hand(a, 44, 226, "post 14", size=22)
    kit.tooth(a, 0.07)


@asset(G, "compass-rose", group="ui", title="The map lens's compass rose", w=400, h=400, row=ROW)
def compass(a: Art):
    """The compass rose that aligns the paper map to the ground in the map lens: a sixteen-point rose in green printed hairline with a solid north point and a small heron at its centre, on survey paper."""
    a.paper("#F4EDD9", grain=0.1, fibre=1.1)
    cx = cy = 200
    for rr, sw in ((168, 2.2), (160, 0.7), (112, 0.7)):
        a.circle(cx, cy, rr, fill="none", stroke=kit.INK, stroke_width=sw)
    d = []
    for k in range(72):
        t = math.radians(k * 5)
        L = 14 if k % 6 == 0 else 7
        d.append(f"M{f(cx + 160 * math.cos(t))},{f(cy + 160 * math.sin(t))}L{f(cx + (160 - L) * math.cos(t))},{f(cy + (160 - L) * math.sin(t))}")
    a.path("".join(d), stroke=kit.INK, stroke_width=1.2, fill="none")
    for k in range(16):
        t = math.radians(k * 22.5 - 90)
        L = 150 if k % 4 == 0 else 104 if k % 2 == 0 else 62
        w = 20 if k % 4 == 0 else 13 if k % 2 == 0 else 8
        tip = (cx + L * math.cos(t), cy + L * math.sin(t))
        l = (cx + w * math.cos(t + math.pi / 2), cy + w * math.sin(t + math.pi / 2))
        rgt = (cx + w * math.cos(t - math.pi / 2), cy + w * math.sin(t - math.pi / 2))
        a.poly([tip, l, (cx, cy)], fill=kit.INK if k % 4 == 0 else "#F4EDD9", stroke=kit.INK, stroke_width=1.2)
        a.poly([tip, rgt, (cx, cy)], fill="#F4EDD9" if k != 0 else kit.INK, stroke=kit.INK, stroke_width=1.2)
    a.circle(cx, cy, 26, fill="#F4EDD9", stroke=kit.INK, stroke_width=1.6)
    a.path(a.smooth_d([(194, 216), (197, 200), (206, 194), (200, 186), (206, 180)]), fill="none", stroke=kit.INK, stroke_width=3)
    a.ellipse(194, 206, 9, 5, fill=kit.INK); a.line(206, 180, 216, 182, stroke=kit.INK, stroke_width=2)
    for s, (x, y) in zip("NESW", ((200, 30), (382, 208), (200, 392), (18, 208))):
        a.text(x, y, s, size=24 if s == "N" else 18, family="serif", fill=kit.INK, text_anchor="middle", font_weight="bold")
    kit.tooth(a, 0.07)


@asset(G, "slot-chalk", group="ui", title="Dell's slot chalk", w=300, h=300, row=ROW)
def slot(a: Art):
    """The chalk mark Dell drew on a camp table to show a slot where an anchor can stand: a rough white chalk square with a cross in it on weathered cedar planks."""
    r = a.rng
    a.rect(0, 0, 300, 300, fill="#8a6a4a")
    for k in range(4):
        a.rect(0, k * 75, 300, 72, fill=["#8f6e4c", "#836344", "#8a6a4a", "#7c5d40"][k])
        a.line(0, k * 75 + 73, 300, k * 75 + 73, stroke="#3a2a1a", stroke_width=3)
        for _ in range(7):
            y = k * 75 + r.uniform(6, 66); x = r.uniform(0, 200)
            a.path(a.smooth_d([(x, y), (x + 50, y + r.uniform(-4, 4)), (x + 110, y + r.uniform(-4, 4))]), fill="none", stroke="#5c452e", stroke_width=1.2, opacity=0.6)
    a.ellipse(214, 108, 9, 6, fill="#3a2a1a"); a.ellipse(214, 108, 15, 10, fill="none", stroke="#5c452e", stroke_width=1.5)
    ch = a.roughen(3.5, 0.5)
    sq = [(70, 76), (228, 68), (236, 224), (78, 232)]
    for _ in range(3):
        a.path(a.wobble_d(sq, 2.4, 12, True), fill="none", stroke="#f4f1e6", stroke_width=r.uniform(4, 7), opacity=0.6, filter=ch,
               stroke_dasharray=f"{f(r.uniform(30, 60))} {f(r.uniform(2, 6))}", stroke_linecap="round")
        a.path(a.wobble_d([(96, 100), (212, 206)], 2.4, 12) + a.wobble_d([(208, 96), (100, 208)], 2.4, 12), fill="none", stroke="#f4f1e6",
               stroke_width=r.uniform(4, 7), opacity=0.55, filter=ch, stroke_linecap="round")
    a.stipple(60, 60, 190, 180, n=120, r=(0.6, 1.6), fill="#f4f1e6", opacity=0.5)
    kit.tooth(a, 0.12)


@asset(G, "seam-notch", group="ui", title="The seam notch", w=240, h=240, row=ROW)
def seam(a: Art):
    """The Show seams accessibility mark: a printed objectives list numbered 1, 2, 4, with a small hollow notch in green hairline at the place where the third line was."""
    a.paper("#F1EEE4", grain=0.06)
    a.rect(20, 20, 200, 200, fill="none", stroke=kit.INK, stroke_width=1.4)
    for k, n in enumerate((1, 2, None, 4)):
        y = 70 + k * 44
        if n is None:
            a.path(f"M20,{y - 22} h22 l10,10 l-10,10 h-22", fill="#F1EEE4", stroke=kit.INK, stroke_width=1.6)
            a.circle(34, y - 12, 4, fill="none", stroke=kit.INK, stroke_width=1.4)
            continue
        a.text(40, y, f"{n}", size=20, family="sans-serif", fill=kit.INK, font_weight="bold")
        a.rect(70, y - 14, [118, 90, 0, 104][k], 12, fill=kit.INK, opacity=0.3)
    kit.tooth(a, 0.05)


@asset(G, "notebook-tabs", group="ui", title="The notebook's tabs", w=900, h=220, row=ROW)
def tabs(a: Art):
    """The tabs along the top of Tam's notebook, cut from coloured card and lettered in pencil: Sites, People, Copied, Tally, and a newer one, the List, taped on after the others."""
    a.rect(0, 0, 900, 220, fill="#3A3530")
    a.stipple(0, 0, 900, 220, n=150, r=(0.8, 2), fill="#2A2622")
    cols = [kit.GREEN, kit.GOLD, "#c98f7a", "#8fa7b5", "#e9e2d2"]
    for k, nm in enumerate(("Sites", "People", "Copied", "Tally", "the List")):
        x = 40 + k * 168
        up = 0 if k != 0 else -14
        a.path(f"M{x},130 V{56 + up} q0,-14 14,-14 h124 q14,0 14,14 V130 z", fill=cols[k], stroke="#2a2622", stroke_width=2)
        a.path(f"M{x + 6},{58 + up} h140", stroke="#fff", stroke_width=2, opacity=0.25)
        kit.hand(a, x + 76, 98 + up, nm, size=30, rot=a.rng.uniform(-3, 3), text_anchor="middle", color="#2e2e2c")
        if k == 4:
            a.rect(x - 14, 96, 44, 22, fill="#efe7c8", opacity=0.75, transform=f"rotate(-12 {x} 104)")
            a.rect(x + 124, 100, 44, 22, fill="#efe7c8", opacity=0.75, transform=f"rotate(9 {x + 150} 108)")
    kit.notebook(a, 20, 124, 860, 96, step=34, top=44, margin=64)
    kit.hand(a, 100, 164, "Post 5. Blue kettle on the table. 4:10 pm.", size=28, rot=-0.5)
    kit.hand(a, 100, 198, "Nothing changes in here. Check.", size=28, rot=0.4)
    kit.tooth(a, 0.07)


@asset(G, "walkie-dial", group="ui", title="The walkie dial", w=400, h=400, row=ROW)
def walkie(a: Art):
    """The channel dial of June's walkie-talkie: a knurled black knob on scuffed plastic with eight numbered channels, its white pointer at two and a small amber light lit beside it."""
    r = a.rng
    a.rect(0, 0, 400, 400, fill="#1b1c1f")
    for _ in range(40):
        x, y = r.uniform(0, 400), r.uniform(0, 400)
        a.line(x, y, x + r.uniform(-40, 40), y + r.uniform(-12, 12), stroke="#fff", stroke_width=1, opacity=0.05)
    for k in range(6):
        a.rect(30 + k * 16, 310, 8, 60, rx=4, fill="#0c0d0f")
    cx = cy = 200
    a.circle(cx, cy, 150, fill="none", stroke="#33363b", stroke_width=2)
    for k in range(8):
        t = math.radians(-90 + (k - 1) * 45)
        on = k == 1
        a.text(cx + 128 * math.cos(t), cy + 128 * math.sin(t) + 10, str(k + 1), size=30 if on else 24, family="sans-serif",
               fill=kit.AMBER if on else "#b9b6ad", text_anchor="middle", font_weight="bold")
        a.line(cx + 98 * math.cos(t), cy + 98 * math.sin(t), cx + 108 * math.cos(t), cy + 108 * math.sin(t), stroke="#b9b6ad", stroke_width=3)
    a.circle(cx + 5, cy + 8, 88, fill="#000", opacity=0.5, filter=a.blur(8))
    a.path("M" + " L".join(f"{f(cx + (86 if k % 2 else 80) * math.cos(math.radians(k * 6)))},{f(cy + (86 if k % 2 else 80) * math.sin(math.radians(k * 6)))}"
                           for k in range(60)) + "Z", fill="#2a2c31", stroke="#0c0d0f", stroke_width=2)
    a.circle(cx, cy, 62, fill=a.radial([(0, "#4a4d54", 1), (1, "#25272b", 1)], cx=0.35, cy=0.3, r=0.8))
    a.line(cx, cy, cx, cy - 74, stroke="#f1e9d6", stroke_width=7, stroke_linecap="round")
    a.circle(330, 330, 26, fill=a.radial([(0, "#fff0c8", 0.9), (1, kit.AMBER, 0)])); a.circle(330, 330, 9, fill=kit.AMBER)
    kit.printed(a, 30, 50, "CH", size=22, color="#b9b6ad")
    kit.tooth(a, 0.1, white=True)


@asset(G, "time-units", group="ui", title="The time-unit circles", w=700, h=180, row=ROW)
def units(a: Art):
    """The corner of the notebook's green cover with a row of eight small pencil circles for the day's hours, three for the morning and five for the afternoon; four are struck through as spent."""
    a.rect(0, 0, 700, 180, fill="#2f5a3a")
    a.stipple(0, 0, 700, 180, n=500, r=(0.6, 1.6), fill="#24472d", opacity=0.8)
    a.path("M0,0 H700 V180 H0 Z M14,14 V166 H686 V14 Z", fill="#1d3a25", opacity=0.3, fill_rule="evenodd")
    a.rect(40, 36, 620, 108, rx=6, fill="#efe7c8", stroke="#1d3a25", stroke_width=2)
    for k in range(8):
        x = 96 + k * 68 + (26 if k >= 3 else 0)
        kit.pencil(a, kit.C(x, 90, 22, 14), w=2.4, closed=True, smooth=True)
        if k < 4:
            kit.pencil(a, [(x - 24, 108), (x + 24, 70)], w=3, amp=1.2)
    kit.pencil(a, [(282, 56), (282, 124)], w=1.4, op=0.5)
    kit.tooth(a, 0.08)


@asset(G, "loop-strip", group="ui", title="The pencil loop strip", w=1200, h=180, row=ROW)
def loop_strip(a: Art):
    """The progress strip along the bottom of both 2D modes: Tam's own pencil sketch of the loop with all twenty-four posts as dots, numbered at every fourth, and an amber mark for where Tam is. It is Tam's sketch, so it never loses anything."""
    kit.notebook(a, step=30, top=30, margin=None, color="#EFE8D4")
    lp = kit.loop_pts(600, 92, 520, 54, 24, start=96)
    kit.pencil(a, lp, w=2, closed=True, smooth=True)
    kit.pencil(a, [(p[0] * 0.985 + 9, p[1] * 0.8 + 18) for p in lp], w=1.4, closed=True, smooth=True, op=0.6)
    for i, (x, y) in enumerate(lp):
        a.circle(x, y, 5, fill=kit.GRAPHITE)
        if (i + 1) % 4 == 0 or i == 0:
            kit.hand(a, x - 8, y + (30 if y > 92 else -14), str(i + 1), size=19, rot=0)
    kit.pencil(a, [lp[0], (lp[0][0] - 30, 176)], w=2)
    x, y = lp[13]
    a.circle(x, y, 13, fill=kit.AMBER, stroke="#3a2a10", stroke_width=2.5)
    kit.hand(a, 500, 100, "900 m round", size=22, color="#77756f")
    kit.tooth(a, 0.07)

"""The Rule Tablet: five tablets, their rules pressed in wedges with a reading cut beneath each."""
import math
import re
from xml.sax.saxutils import escape

from artkit import Art, f, sibling

K = sibling(__file__, "_kit")
ROW = "Clay tablets (5) and watcher shadows (4)"


def wrap(s, n):
    out, line = [], ""
    for w in s.split():
        if len(line) + len(w) + 1 > n and line:
            out.append(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        out.append(line)
    return out


# rule text and key words are DESIGN.md section 11's; the c8 tablet's one legible rule is the source's
TABLETS = [
    dict(id="c2-shrine-store", title="The shrine-store", clay=("#B9764A", "#D49A6C", "#74432A"), ground="#2C1E16", shape=(80, 100, 640, 800, 60),
         rules=[("No one enters the shrine-store but a shaman.", "enters"), ("Nothing is taken from the shrine-store by night.", "night"),
                ("The belongings of the dead are kept for the gods.", "dead"), ("A son speaks for his father's house.", None)],
         doc="The shrine-store tablet, small and red: four rules in four registers, each numbered by its upright wedges, "
             "the words enters, night and dead underlined."),
    dict(id="c5-clerks-charter", title="The Clerk's Charter", clay=("#7C8794", "#A3ADB8", "#434C58"), ground="#1E2630", shape=(70, 60, 660, 880, 8),
         rules=[("The weather of Hollin is written by the Clerk alone.", "Hollin"), ("The Clerk is chosen at the death of the Clerk before.", None),
                ("What is written in the Day-Book is the day.", None), ("No page of the Day-Book may be torn or crossed.", None),
                ("The Clerk's chair is not to be sat in by any other.", None), ("Every house in Hollin keeps a window to the sky.", "window")],
         doc="The Clerk's Charter, cut in a square slab of slate and streaked by rain: six rules, with Hollin and window "
             "underlined."),
    dict(id="c6-gods-rules", title="The gods' rules", clay=("#C08E5E", "#DBAE7E", "#7E5232"), ground="#2C241C", shape=(50, 40, 700, 920, 46),
         rules=[("We do not ride on the backs of the gods.", None), ("No one walks before a god.", "before"), ("No hand touches a god.", None),
                ("The sand of the deep belongs to the gods; no one takes from it.", None),
                ("What the gods leave behind is holy and may not be trodden.", "trodden"), ("The holy is not carried away.", None),
                ("A son of the clan returns by the third moon, or is named lost.", "or"),
                ("No one sleeps where the gods have not slept.", None)],
         fresh=0,
         doc="The gods' tablet: eight worn registers of ochre clay, and a first rule whose wedges are sharp and whose clay "
             "is paler than the rest, pressed long after the others."),
    dict(id="c7-procession-vows", title="The Procession's vows", clay=("#8E8674", "#B4AC98", "#4E4638"), ground="#26221C", shape=(90, 40, 620, 920, 30),
         rules=[("Only the Scribe's hand writes the road.", "hand"), ("The road is never written backward.", None),
                ("No pilgrim unmasks until the City.", None), ("The pen is passed only from a dying hand.", None),
                ("Whatever the road reaches, the pilgrims must enter.", None), ("The City of Answer is where the road ends.", "City"),
                ("Ink is not wasted on what is not road.", None)],
         doc="The Procession's vows on a tall grey tablet carried on the wagon, soot from the lanterns up one edge: seven "
             "rules, with hand and City underlined."),
    dict(id="c8-keepers-binding", title="The Keeper's Binding", clay=("#A8A294", "#CFC9BA", "#5E5A50"), ground="#0E1622", shape=(60, 50, 680, 900, 20),
         rules=[("He was never to leave, and he could only be replaced when he had died.", "leave")] + [(None, None)] * 5,
         doc="The Keeper's Binding, a pale tablet cracked across one corner: its first rule can be read, with leave "
             "underlined, and the five registers under it are wedges only, worn nearly flat."),
]


def incised(a, x, y, s, size, dark, light, key=None):
    """Text cut into the surface; the key word, if it is on this line, is underlined."""
    body = escape(s)
    if key:
        m = re.search(r"\b" + re.escape(key) + r"\b", s)
        if m:
            body = (escape(s[:m.start()]) + '<tspan text-decoration="underline">' + escape(key) + "</tspan>"
                    + escape(s[m.end():]))
    for dx, dy, col, op in ((1, 1.3, light, .75), (0, 0, dark, 1)):
        a.raw(f'<text x="{f(x + dx)}" y="{f(y + dy)}" font-size="{size}" font-family="serif" fill="{col}" opacity="{op}" '
              f'letter-spacing="0.6">{body}</text>')


def tablet(a: Art, idx):
    T = TABLETS[idx]
    clay, clay_l, clay_d = T["clay"]
    deep = "#3A2414" if idx != 1 else "#262C36"
    a.rect(0, 0, a.w, a.h, fill=T["ground"])
    K.stip(a, 0, 0, a.w, a.h, n=500, r=(.6, 1.8), fill=clay_l, opacity=.22)
    x0, y0, w, h, rx = T["shape"]
    a.rect(x0 + 14, y0 + 18, w, h, rx=rx, fill="#000", opacity=.55, filter=a.blur(10))
    rough = a.roughen(6 if idx != 1 else 2, .03)
    a.rect(x0, y0, w, h, rx=rx, fill=a.radial([(0, clay_l, 1), (.7, clay, 1), (1, clay_d, 1)], .42, .38, .85), filter=rough)
    K.grain(a, x0 + 8, y0 + 8, w - 16, h - 16, .32, .5)
    rules = T["rules"]
    n = len(rules)
    rh = (h - 70) / n
    tx = x0 + 118
    tw = w - 150
    for k, (rule, key) in enumerate(rules):
        y = y0 + 35 + k * rh
        fresh = T.get("fresh") == k
        if fresh:
            # newer clay: paler, and smoothed over the old surface
            a.rect(x0 + 22, y + 3, w - 44, rh - 6, rx=10, fill=clay_l, opacity=.75, filter=rough)
        if k:
            a.line(x0 + 24, y, x0 + w - 24, y, stroke=clay_d, stroke_width=2.2)
            a.line(x0 + 24, y + 2.5, x0 + w - 24, y + 2.5, stroke=clay_l, stroke_width=1)
        cy = y + rh / 2
        # the numeral: k+1 upright wedges
        for j in range(k + 1):
            col, row = j % 4, j // 4
            K.wedge(a, x0 + 40 + col * 13, cy - 14 + row * 20 - (10 if k + 1 > 4 else 0), math.pi / 2, .7, dark=clay_d, deep=deep,
                    light=clay_l, sharp=fresh)
        a.line(x0 + 100, y + 8, x0 + 100, y + rh - 8, stroke=clay_d, stroke_width=1.6)
        worn = rule is None
        # the wedge signs
        wy = cy - (rh * .2 if not worn else 0)
        a.open("g", opacity=.45 if worn else 1)
        for (wx, wyy, ang, s) in K.wedges_d(a, tx, x0 + w - 30, wy, spread=min(12, rh * .14), s=.82 if not fresh else .95):
            K.wedge(a, wx, wyy, ang, s, dark=clay_d, deep=deep, light=clay_l, sharp=fresh)
        a.close()
        if worn:
            continue
        # the reading, cut small beneath
        size = 23 if rh > 100 else 21
        lines = wrap(rule, int(tw / (size * .5)))
        ly = cy + rh * .16 + (0 if len(lines) > 1 else size * .5)
        done = False
        for li, ln in enumerate(lines):
            use = key if key and not done and re.search(r"\b" + re.escape(key) + r"\b", ln) else None
            done = done or bool(use)
            incised(a, tx, ly + li * (size + 3), ln, size, deep, clay_l, use)
    # each tablet's own weather
    if idx == 0:
        K.sand(a, x0, y0 + h - 30, w, 60, n=260, r=(.6, 1.8))
    elif idx == 1:
        d = "".join(f"M{f(a.rng.uniform(x0 + 10, x0 + w - 10))},{f(a.rng.uniform(y0, y0 + h - 80))}v{f(a.rng.uniform(30, 120))}"
                    for _ in range(46))
        a.path(d, stroke="#DCE4EC", stroke_width=1.6, opacity=.3, stroke_linecap="round", fill="none")
        for sx, sy in ((x0 + 22, y0 + 22), (x0 + w - 22, y0 + 22), (x0 + 22, y0 + h - 22), (x0 + w - 22, y0 + h - 22)):
            a.circle(sx, sy, 8, fill="#59616E", stroke="#262C36", stroke_width=2)
    elif idx == 2:
        K.sand(a, x0 - 20, y0 + h - 24, w + 40, 60, n=300, r=(.6, 1.8))
        a.path(f"M{x0 + w - 30},{y0 + 30} l-40,60 l14,30 l-30,50", stroke=clay_d, stroke_width=2, fill="none", opacity=.7)
    elif idx == 3:
        a.rect(x0, y0, 90, h, rx=rx, fill=a.gradient([(0, "#1A1612"), (1, clay)], 0, 0, 1, 0), opacity=.5)
        K.glow(a, x0 + w, y0 + 120, 240, K.LANTERN, .28)
    else:
        a.path(f"M{x0 + w - 200},{y0 + h} l30,-90 l-20,-40 l60,-70 l-10,-50 l140,-60", stroke="#1A1E26", stroke_width=5,
               fill="none", stroke_linejoin="round")
        a.path(f"M{x0 + w - 198},{y0 + h} l30,-90 l-20,-40 l60,-70 l-10,-50 l140,-60", stroke=clay_l, stroke_width=1.2,
               fill="none", stroke_linejoin="round", transform="translate(3 2)")
        K.stip(a, x0, y0, w, h, n=260, r=(.6, 1.8), fill="#F4F8FC", opacity=.8,
               density=lambda px, py: max(0, 1 - min(px - x0, x0 + w - px, py - y0, y0 + h - py) / 90))
    a.vignette(.4, "#000")


for _i, _T in enumerate(TABLETS):
    K.reg(f"tablet-{_T['id']}", "maps", f"Rule tablet: {_T['title']}", 800, 1000, ROW, _T["doc"], tablet, _i)

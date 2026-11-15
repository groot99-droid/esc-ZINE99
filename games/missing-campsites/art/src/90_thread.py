"""The collection thread: this game's own object, and the object it hides for another game."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G


@asset(G, "thread-own", group="thread", title="The line through the window", w=480, h=480, row="thread")
def own(a: Art):
    """The game's own thread object: the ranger booth's window at night, lit amber from inside with nobody in it, a folded map set out on the sill for whoever has just arrived, and the line that is said through it."""
    r = a.rng
    a.rect(0, 0, 480, 480, fill=kit.NIGHT)
    a.rect(30, 20, 420, 370, fill=kit.CEDAR)
    for k in range(9):
        y = 20 + k * 41
        a.rect(30, y, 420, 39, fill=["#7A4A2E", "#6f4229", "#814f31"][k % 3])
        a.line(30, y + 40, 450, y + 40, stroke="#2a1608", stroke_width=3)
        for _ in range(4):
            x = r.uniform(40, 380)
            a.path(a.smooth_d([(x, y + r.uniform(6, 34)), (x + 30, y + r.uniform(6, 34)), (x + 60, y + r.uniform(6, 34))]), fill="none", stroke="#4d2f1b", stroke_width=1.2, opacity=0.7)
    a.rect(30, 20, 420, 370, fill=kit.NIGHT, opacity=0.5)
    a.ellipse(240, 220, 250, 190, fill=a.radial([(0, kit.AMBER, 0.45), (1, kit.AMBER, 0)]))
    a.rect(110, 90, 260, 220, fill="#2a1608")
    a.rect(124, 104, 232, 192, fill=a.gradient([(0, "#ffe2a0"), (1, "#f2a541")]))
    a.rect(124, 104, 232, 192, fill=a.radial([(0, "#fff6d8", 0.9), (1, "#f2a541", 0)], cx=0.5, cy=0.2, r=0.7))
    a.rect(236, 104, 8, 192, fill="#2a1608"); a.rect(124, 196, 232, 6, fill="#2a1608")
    a.rect(140, 120, 80, 60, fill="#f4edd9", opacity=0.7, stroke="#9B6A3C", stroke_width=1)       # the master map on the wall inside
    a.ellipse(180, 150, 26, 16, fill="none", stroke="#222", stroke_width=2, opacity=0.6)
    a.rect(262, 236, 78, 12, fill="#3a3530", opacity=0.8); a.rect(266, 226, 70, 12, fill="#efe8d4", opacity=0.9)   # the logbook, closed
    a.rect(94, 306, 292, 22, fill="#4d2f1b", stroke="#2a1608", stroke_width=2)                  # the sill
    a.poly([(200, 300), (252, 296), (300, 302), (296, 318), (248, 312), (204, 318)], fill="#F4EDD9", stroke="#3b3426", stroke_width=1.5)
    a.line(252, 296, 248, 312, stroke="#8a7e62", stroke_width=1.2)
    a.rect(330, 44, 96, 34, fill="#2f5a3a", stroke="#1d3a25", stroke_width=2)
    a.text(378, 67, "OPEN", size=18, family="sans-serif", fill="#f3ecd8", text_anchor="middle", font_weight="bold", letter_spacing="3")
    a.rect(0, 390, 480, 90, fill="#0a0f18")
    a.stipple(0, 392, 480, 30, n=120, r=(1, 2.4), fill="#8f8068", opacity=0.6)
    a.text(240, 440, "“You’re at the far end.”", size=30, family="serif", fill="#f1e9d6", text_anchor="middle", font_style="italic")
    kit.tooth(a, 0.12, white=True)


@asset(G, "thread-guest", group="thread", title="An envelope stamped HOLD", w=480, h=480, row="thread")
def guest(a: Art):
    """The object this game hides for the collection ring, in its own hand: one of the booth's drop-box fee envelopes lying on the ruled logbook page among the stubs, its licence-plate box left empty and a rubber stamp across it in the van's dull red: HOLD."""
    kit.notebook(a, step=38, top=44, margin=None, color="#EFE8D4")
    for x in (96, 330):
        a.line(x, 0, x, 480, stroke="#C58F86", stroke_width=1)
    kit.printed(a, 20, 30, "ENVELOPES IN THE DROP BOX", size=13)
    a.text(350, 110, "14", size=40, family="serif", fill="#1F2A44", font_weight="bold")
    kit.hand(a, 350, 440, "11", size=38)
    a.open("g", transform="rotate(-7 240 250)")
    a.rect(58, 142, 372, 220, fill="#000", opacity=0.22, filter=a.blur(5))
    a.rect(50, 132, 372, 220, fill="#D9BE8A", stroke="#a88f5e", stroke_width=1.5)
    a.poly([(50, 132), (236, 250), (422, 132)], fill="#cfb27c", stroke="#a88f5e", stroke_width=1.5)
    a.stipple(50, 132, 372, 220, n=160, r=(0.6, 1.6), fill="#a88f5e", opacity=0.5)
    kit.printed(a, 70, 286, "HOLLIN CREEK · DROP BOX · $18 A NIGHT", size=11.5, letter_spacing="1")
    a.rect(70, 298, 150, 38, rx=3, fill="#f3ead2", stroke=kit.INK, stroke_width=1.5)
    kit.printed(a, 232, 312, "SITE", size=10, letter_spacing="1"); a.line(264, 314, 320, 314, stroke=kit.INK, stroke_width=1)
    kit.printed(a, 232, 334, "NIGHTS", size=10, letter_spacing="1"); a.line(284, 336, 320, 336, stroke=kit.INK, stroke_width=1)
    mid = a.uid("m")
    a.defn(f'<filter id="{mid}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.7" '
           f'numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.6 1.8"/>'
           f'<feComposite in="SourceGraphic" operator="in"/></filter>')
    a.open("g", filter=f"url(#{mid})", transform="rotate(-9 236 226)", opacity=0.9)
    a.rect(128, 176, 216, 96, rx=6, fill="none", stroke=kit.RED, stroke_width=8)
    a.text(236, 250, "HOLD", size=68, family="sans-serif", fill=kit.RED, text_anchor="middle", font_weight="bold", letter_spacing="8")
    a.close()
    a.close()
    kit.tooth(a, 0.07)

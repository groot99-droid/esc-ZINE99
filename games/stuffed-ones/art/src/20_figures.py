"""The eleven felt medallions: the pack of five and the six guests as the toys they become."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Pack and guest toys, felt medallions"
C, E, P = kit.C, kit.E, kit.P


def head(a, kind, cx, cy, s, col, inner, eyes=(kit.INK, kit.INK), tilt=0, flop=0, thr=kit.BONE, patch=None):
    """A stuffed animal's head in cut felt: whip-stitched pieces, button eyes, a centre seam."""
    a.open("g", transform=f"translate({f(cx)} {f(cy)}) rotate({f(tilt)}) scale({f(s)})")
    F = lambda d, c, **kw: kit.felt(a, d, c, edge=thr, depth=7, gap=7, w=1.6, **kw)
    if kind == "bear":
        F(C(-56, -58, 30), col), F(C(56, -58, 30), col)
        a.path(C(-56, -58, 15) + C(56, -58, 15), fill=inner, filter=kit.felt_filter(a))
        F(C(0, 0, 82), col)
        F(E(0, 30, 36, 28), inner)
        nose, ny, eyx, eyy = P((-11, 14), (11, 14), (0, 27)), 27, 32, -12
    elif kind == "cat":
        F(P((-74, -30), (-70, -104), (-16, -66)), col), F(P((74, -30), (70, -104), (16, -66)), col)
        a.path(P((-62, -48), (-60, -86), (-32, -64)) + P((62, -48), (60, -86), (32, -64)), fill=inner,
               filter=kit.felt_filter(a))
        F(E(0, 4, 84, 76), col)
        nose, ny, eyx, eyy = P((-8, 16), (8, 16), (0, 26)), 26, 34, -8
    elif kind == "rabbit":
        a.open("g", transform=f"rotate({-8 - flop * 0.2} -30 -50)")
        F(E(-30, -100, 21, 60), col)
        a.path(E(-30, -100, 9, 42), fill=inner, filter=kit.felt_filter(a))
        a.close()
        a.open("g", transform=f"rotate({10 + flop} 30 -50)")
        F(E(30, -100, 21, 60), col)
        a.path(E(30, -100, 9, 42), fill=inner, filter=kit.felt_filter(a))
        a.close()
        F(E(0, 14, 72, 68), col)
        F(E(0, 40, 30, 22), inner)
        nose, ny, eyx, eyy = P((-7, 26), (7, 26), (0, 35)), 35, 30, 0
    else:  # dog
        F(E(0, 0, 70, 80), col)
        F("M-58,-52q-44,10 -34,84q28,14 42,-22z", inner), F("M58,-52q44,10 34,84q-28,14 -42,-22z", inner)
        F(E(0, 34, 36, 30), kit.light(col, 0.45))
        nose, ny, eyx, eyy = E(0, 20, 13, 9), 28, 28, -18
    if patch:
        px, py, pc = patch
        a.path(kit.R(px, py, 30, 28, 3), fill=pc, filter=kit.felt_filter(a), transform=f"rotate(-12 {px + 15} {py + 14})")
        kit.thread(a, kit.R(px + 3, py + 3, 24, 22, 2), thr, w=1.6, dash="4 3", shadow=False,
                   transform=f"rotate(-12 {px + 15} {py + 14})")
    # centre seam, nose, mouth: all thread
    kit.thread(a, f"M0,{-70 if kind != 'rabbit' else -48}V{ny - 22}", kit.dark(col, 0.45), w=2, dash="5 4", shadow=False)
    a.path(nose, fill=kit.INK)
    a.path(nose, fill="none", stroke=kit.mix(kit.INK, kit.CEDAR, 0.6), stroke_width=1.5, stroke_dasharray="1.5 1.5")
    kit.thread(a, f"M0,{ny}v12M-14,{ny + 12}q7,9 14,0q7,9 14,0", kit.INK, w=2.4, dash="4 2.5", shadow=False)
    if kind == "cat":
        kit.thread(a, "M-78,14h34M-76,30l32,-6M78,14h-34M76,30l-32,-6", thr, w=1.6, dash="6 3", shadow=False)
    kit.button(a, -eyx, eyy, 12, eyes[0], thr)
    kit.button(a, eyx, eyy, 12 if eyes[1] == eyes[0] else 10, eyes[1], thr, holes=4 if eyes[1] == eyes[0] else 2)
    a.close()


TOYS = [
    # id, title, kind, cloth, ground, object, tag, scale, tilt, eyes, patch, doc
    ("narrator", "The narrator: a cat", "cat", kit.light(kit.DUST, 0.55), kit.NIGHT, "needle", "", 1.0, -4,
     (kit.INK, kit.INK), (26, 18, kit.RUST),
     "The narrator as a cream felt cat with a rust patch, on night-blue felt; the name tag below is blank."),
    ("jamie", "Jamie: a bear", "bear", kit.RUST, kit.mix(kit.SKY, kit.NIGHT, 0.55), "postcard", "Jamie", 0.96, 5,
     (kit.INK, kit.INK), None,
     "Jamie as a rust felt bear with his deliberately bad postcard pinned at the rim."),
    ("lila", "Lila: a rabbit", "rabbit", kit.mix(kit.SKY, kit.BONE, 0.25), kit.mix(kit.RUST, kit.CEDAR, 0.6), "key", "Lila",
     0.9, 0, (kit.CEDAR_D, kit.CEDAR_D), None,
     "Lila as a sky-blue felt rabbit, one ear folded, with the key to the door she locks."),
    ("marcus", "Marcus: a dog", "dog", kit.MOSS, kit.CEDAR, "compass", "Marcus", 0.98, 3, (kit.INK, kit.INK), None,
     "Marcus as a moss felt dog with his compass."),
    ("dani", "Dani: a large bear", "bear", kit.mix(kit.CEDAR, kit.DUST, 0.3), kit.mix(kit.MOSS, kit.NIGHT, 0.35), "pot", "Dani",
     1.14, -3, (kit.INK, kit.INK), (-56, 20, kit.SKY),
     "Dani as a large brown felt bear, bigger than the frame wants, with her chili pot."),
    ("noor", "Noor: a rabbit", "rabbit", kit.light(kit.RUST, 0.55), kit.DUST, "door", "Noor", 0.9, -5,
     (kit.NIGHT, kit.NIGHT), None, "Noor as a faded pink felt rabbit beside the Door, her Parlour symbol."),
    ("wes", "Wes: a bear", "bear", kit.mix(kit.SKY, kit.NIGHT, 0.4), kit.DUST, "lamp", "Wes", 0.94, 6,
     (kit.INK, kit.RUST), None, "Wes as a slate-blue felt bear with odd eyes beside the Lamp, his Parlour symbol."),
    ("ana", "Ana: a cat", "cat", kit.mix(kit.MOSS, kit.DUST, 0.45), kit.DUST, "two", "Ana", 0.96, 4, (kit.CEDAR_D, kit.CEDAR_D),
     None, "Ana as a pale moss felt cat beside Two, her Parlour symbol."),
    ("sol", "Sol: a rabbit", "rabbit", kit.mix(kit.DUST, kit.NIGHT, 0.35), kit.light(kit.DUST, 0.3), "bird", "Sol", 0.9, 3,
     (kit.INK, kit.INK), (16, 30, kit.MOSS), "Sol as a grey felt rabbit, patched, beside the Bird, his Parlour symbol."),
    ("rosa", "Rosa: a bear", "bear", kit.mix(kit.RUST, kit.DUST, 0.4), kit.light(kit.DUST, 0.3), "tree", "Rosa", 0.94, -6,
     (kit.MOSS, kit.MOSS), None, "Rosa as a faded rust felt bear with green button eyes beside the Tree, her Parlour symbol."),
    ("kit", "Kit: a cat", "cat", kit.mix(kit.NIGHT, kit.SKY, 0.3), kit.light(kit.DUST, 0.3), "hearth", "Kit", 0.96, -2,
     (kit.DUST, kit.DUST), None, "Kit as a dark slate felt cat with pale button eyes beside the Hearth, her Parlour symbol."),
]


def _medal(k, row):
    tid, title, kind, cloth, ground, obj, name, sc, tilt, eyes, patch, doc = row
    guest = k >= 5

    @asset(G, f"medallion-{tid}", group="figures", title=title, w=360, h=360, row=ROW)
    def draw(a: Art):
        a.paper(kit.mix(kit.CEDAR, kit.INK, 0.35), grain=0.3, fibre=0.5)
        kit.lamp(a, 110, 80, 300, kit.DUST, 0.3)
        r = 164
        if guest:  # pinked edge for the guests
            import math
            pts = [(180 + (r + (5 if i % 2 else -3)) * math.cos(i * math.pi / 30), 180 + (r + (5 if i % 2 else -3))
                    * math.sin(i * math.pi / 30)) for i in range(60)]
            a.path(P(*pts), fill=ground, filter=kit.felt_filter(a))
        else:
            a.path(C(180, 180, r), fill=ground, filter=kit.felt_filter(a))
        rim = [kit.RUST, kit.MOSS, kit.SKY, kit.CEDAR][k % 4] if guest else kit.BONE
        kit.whip(a, C(180, 180, r - 12), rim, w=2.2, depth=13, gap=9)
        kit.thread(a, C(180, 180, r - 30), kit.mix(rim, ground, 0.35), w=1.8, dash="7 5", shadow=False)
        # the toy's own warmth
        kit.lamp(a, 180, 196, 150, kit.AMBER, 0.55 if not guest else 0.3)
        thr = kit.BONE if not guest else kit.light(kit.DUST, 0.6)
        head(a, kind, 180, 176 + (14 if kind == "rabbit" else 0) + (10 if kind == "cat" else 0), sc * 0.98, cloth,
             kit.light(cloth, 0.45) if kind != "dog" else kit.dark(cloth, 0.3), eyes=eyes, tilt=tilt,
             flop=38 if tid == "lila" else 0, thr=thr, patch=patch)
        # the telling object, appliquéd at the rim
        oc = kit.BONE if not guest else kit.CEDAR
        a.path(C(290, 282, 40), fill=kit.dark(ground, 0.25) if not guest else kit.light(ground, 0.5), filter=kit.felt_filter(a))
        kit.whip(a, C(290, 282, 37), rim, w=1.5, depth=7, gap=6)
        kit.icon(a, obj, 290 - 26, 282 - 26, 0.52, oc, accent=kit.mix(oc, kit.RUST, 0.5), linec=kit.mix(oc, kit.INK, 0.6),
                 hole=kit.dark(ground, 0.5) if not guest else kit.BONE, lw=4)
        kit.tag(a, 40, 296, 132, 38, name, color=kit.BONE, size=22, rot=-5)
        kit.shade(a, 0.35)
    draw.__doc__ = doc


for _k, _row in enumerate(TOYS):
    _medal(_k, _row)

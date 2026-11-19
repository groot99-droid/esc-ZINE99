"""Stuffing's tray: memory patches, borrowed patches and guest patches, in embroidery."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Memory, borrowed and guest patches"
C, P, R = kit.C, kit.P, kit.R

WHO = {"narrator": (kit.light(kit.DUST, 0.35), kit.CEDAR), "jamie": (kit.RUST, kit.BONE), "lila": (kit.SKY, kit.NIGHT),
       "marcus": (kit.MOSS, kit.BONE), "dani": (kit.mix(kit.CEDAR, kit.DUST, 0.25), kit.BONE)}

MEMORIES = [
    ("my-name", "My name", "narrator", "nametag"), ("drive-up", "The drive up", "narrator", "car"),
    ("my-hands", "My hands", "narrator", "hand"), ("trips-before", "The trips before", "narrator", "peaks"),
    ("jamie-question", "Jamie's question", "jamie", "footprints"), ("jamie-postcard", "Jamie's bad postcard", "jamie", "postcard"),
    ("jamie-narration", "Jamie's narration", "jamie", "speech"), ("lila-door", "Why Lila locks her door", "lila", "keyhole"),
    ("lila-hum", "Lila's hum", "lila", "notes"), ("lila-mushroom", "Lila's mushroom photo", "lila", "photo"),
    ("marcus-strap", "Marcus's strap", "marcus", "strap"), ("marcus-map", "Marcus's paper map", "marcus", "map"),
    ("way-out", "There's always a way out", "marcus", "doorajar"), ("chili", "The chili", "dani", "pot"),
    ("dani-names", "Dani names the toys", "dani", "bearhead"), ("dani-glad", "Dani is glad she came", "dani", "fire"),
    ("the-door", "The door", "narrator", "door"),
]
BORROWED = [
    ("dani-gerald", "Dani moved Gerald.", "dani", "pillow"), ("dani-weird", "Don't make it weird.", "dani", "cup"),
    ("jamie-hiker", "The rare hiker", "jamie", "boot"), ("jamie-nine", "Since we were nine", "jamie", "two"),
    ("lila-flat", "Two years, one flat", "lila", "key"), ("lila-laugh", "Don't laugh.", "lila", "bed"),
    ("marcus-held", "Your stitches held", "marcus", "needle"), ("marcus-compass", "The compass", "marcus", "compass"),
]
GUESTS = [
    ("noor", "Noor at the mirror", "mirror"), ("wes", "Wes sleeps with a lamp on", "lamp"),
    ("ana", "so she isn't alone", "two"), ("sol", "No birds.", "binoculars"),
    ("rosa", "Rosa's sketchbook", "sketchbook"), ("kit", "Kit, awake until three", "moon"),
]


def tray(a, k):
    a.paper(kit.mix(kit.CEDAR, kit.INK, 0.3 + 0.08 * (k % 3)), grain=0.3, fibre=0.4)
    kit.lamp(a, 70 + 20 * (k % 4), 50, 230, kit.DUST, 0.28)


def ribbon(a, s, y=204, color=kit.BONE, ink=kit.INK, rot=0):
    w = min(206, 30 + len(s) * 7.4)
    x = 120 - w / 2
    a.open("g", transform=f"rotate({rot} 120 {y})")
    a.path(P((x - 8, y - 15), (x + w + 8, y - 15), (x + w, y), (x + w + 8, y + 15), (x - 8, y + 15), (x, y)), fill=color,
           filter=kit.felt_filter(a))
    kit.thread(a, f"M{f(x + 6)},{y - 10}H{f(x + w - 6)}M{f(x + 6)},{y + 10}H{f(x + w - 6)}", kit.mix(color, ink, 0.4), w=1.1,
               dash="4 3", shadow=False)
    a.text(120, y + 5.5, s, size=16 if len(s) < 21 else 14, family="serif", fill=ink, text_anchor="middle", font_style="italic")
    a.close()


def _memory(k, row):
    pid, name, who, ic = row
    cloth, thr = WHO[who]

    @asset(G, f"patch-{pid}", group="pieces", title=f"Memory patch: {name}", w=240, h=240, row=ROW)
    def draw(a: Art):
        tray(a, k)
        rot = a.rng.uniform(-7, 7)
        a.open("g", transform=f"rotate({f(rot)} 120 104)")
        a.path(C(120, 104, 90), fill=cloth, filter=kit.felt_filter(a))
        kit.whip(a, C(120, 104, 84), kit.dark(cloth, 0.3) if who != "narrator" else kit.RUST, w=2.6, depth=13, gap=2.4)
        kit.thread(a, C(120, 104, 72), thr, w=1.6, dash="5 4", shadow=False, opacity=0.8)
        dk = who in ("narrator", "lila")
        main = kit.CEDAR_D if who == "narrator" else kit.NIGHT if who == "lila" else kit.BONE
        kit.icon(a, ic, 120 - 52, 104 - 54, 1.04, main, accent=kit.mix(main, cloth, 0.45) if not dk else kit.BONE,
                 linec=kit.mix(cloth, kit.INK, 0.55) if not dk else kit.light(cloth, 0.6),
                 hole=kit.dark(cloth, 0.45) if not dk else kit.light(cloth, 0.5),
                 over=kit.satin(a, kit.INK if not dk else kit.BONE, angle=30 + 15 * (k % 4), op=0.32), lw=3.4)
        a.close()
        ribbon(a, name, rot=a.rng.uniform(-3, 3))
        kit.shade(a, 0.3)
    draw.__doc__ = (f"A round embroidered patch from the Stuffing tray, in the felt colour of its person: the memory "
                    f"\"{name}\", its picture worked in satin stitch, its name on a ribbon.")


def _borrowed(k, row):
    pid, name, who, ic = row
    cloth, thr = WHO[who]

    @asset(G, f"patch-borrowed-{pid}", group="pieces", title=f"Borrowed patch: {name}", w=240, h=240, row=ROW)
    def draw(a: Art):
        tray(a, k + 1)
        rot = a.rng.uniform(-10, 10)
        # the thread it came down: the pulse, amber, running off the top edge
        x0 = 60 + 120 * a.rng.random()
        kit.thread(a, a.smooth_d([(x0, -6), (x0 + 30, 26), (120 - 40, 30), (120, 58)]), kit.AMBER, w=2.4, dash="9 4")
        a.open("g", transform=f"rotate({f(rot)} 120 104)")
        sq = a.wobble_d([(42, 26), (198, 26), (198, 182), (42, 182)], amp=2.2, step=9, closed=True)
        a.path(sq, fill=kit.light(kit.DUST, 0.25), filter=kit.felt_filter(a))
        kit.whip(a, R(50, 34, 140, 140, 4), cloth, w=2.6, depth=11, gap=5)
        kit.thread(a, R(62, 46, 116, 116, 3), cloth, w=1.6, dash="2 5", shadow=False)
        kit.icon(a, ic, 120 - 48, 104 - 50, 0.96, cloth, accent=kit.mix(cloth, kit.BONE, 0.5), linec=kit.mix(cloth, kit.INK, 0.6),
                 hole=kit.light(kit.DUST, 0.3), over=kit.satin(a, kit.INK, angle=120 + 15 * k, op=0.3), lw=3.4)
        a.close()
        ribbon(a, name, color=cloth, ink=kit.BONE if who != "lila" else kit.INK, rot=a.rng.uniform(-3, 3))
        kit.shade(a, 0.3)
    draw.__doc__ = (f"A square patch that is not yours: \"{name}\", a friend's memory come down the pulse on an amber "
                    f"thread, stitched in that friend's own thread colour.")


def _guest(k, row):
    pid, name, ic = row
    rim = [kit.RUST, kit.SKY, kit.MOSS, kit.mix(kit.DUST, kit.NIGHT, 0.4), kit.mix(kit.RUST, kit.DUST, 0.35),
           kit.mix(kit.NIGHT, kit.SKY, 0.3)][k]

    @asset(G, f"patch-guest-{pid}", group="pieces", title=f"Guest patch: {name}", w=240, h=240, row=ROW)
    def draw(a: Art):
        tray(a, k + 2)
        rot = a.rng.uniform(-6, 6)
        a.open("g", transform=f"rotate({f(rot)} 120 104)")
        pts = []
        for i in range(48):  # a pinked oval
            t = i * math.pi / 24
            rr = 1.0 if i % 2 else 0.93
            pts.append((120 + 96 * rr * math.cos(t), 104 + 84 * rr * math.sin(t)))
        a.path(P(*pts), fill=kit.NIGHT, filter=kit.felt_filter(a))
        kit.thread(a, kit.E(120, 104, 80, 68), rim, w=2.4, dash="7 4")
        kit.thread(a, kit.E(120, 104, 72, 60), kit.BONE, w=1.2, dash="1.5 5", shadow=False)
        kit.icon(a, ic, 120 - 46, 104 - 48, 0.92, kit.BONE, accent=rim, linec=kit.mix(kit.NIGHT, kit.BONE, 0.2),
                 hole=kit.NIGHT, over=kit.satin(a, kit.NIGHT, angle=60 + 20 * k, op=0.3), lw=3.4)
        a.close()
        ribbon(a, name, color=kit.DUST, rot=a.rng.uniform(-3, 3))
        kit.shade(a, 0.3)
    draw.__doc__ = (f"A pinked oval patch on night-blue felt: \"{name}\", something you watched a guest do, arrived in "
                    f"the tray as a thing that can be kept.")


for _k, _r in enumerate(MEMORIES):
    _memory(_k, _r)
for _k, _r in enumerate(BORROWED):
    _borrowed(_k, _r)
for _k, _r in enumerate(GUESTS):
    _guest(_k, _r)

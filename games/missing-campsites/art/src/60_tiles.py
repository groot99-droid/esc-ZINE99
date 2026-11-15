"""Pieces: Pack List item tiles (wax crayon on kraft), the nineteen List tiles (pencil in Tam's notebook)
and the Foil Supper ingredient tiles (two-colour risograph)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
S = 220

# id, spoken name, icon, kind (None, "phantom", "seat", "guest")
ITEMS = [
    ("tarp", "a tarp", "tarp", None), ("torch", "the torch", "torch", None),
    ("marshmallows", "marshmallows", "marshmallows", None),
    ("kettle", "a blue enamel kettle", "kettle", "phantom"), ("rope", "rope", "rope", None),
    ("puddle", "Puddle the bicycle", "bicycle", "phantom"), ("heron-sign", "a heron sign", "heron", "phantom"),
    ("sleeping-bag", "a sixth sleeping bag", "sleeping_bag", "phantom"),
    ("notebook", "a notebook", "notebook", "seat"), ("number", "Nell's telephone number", "number", "guest"),
    ("boots", "boots", "boots", None), ("map", "the map", "map", None), ("tent", "a tent", "tent", None),
    ("cup", "a tin cup", "cup", None), ("socks", "dry socks", "socks", None), ("pan", "a frying pan", "pan", None),
    ("hat", "a sun hat", "hat", None), ("book", "a book", "book", None), ("pegs", "tent pegs", "pegs", None),
    ("rucksack", "a rucksack", "rucksack", None), ("matches", "matches", "matches", None),
    ("compass", "a compass", "compass", None), ("walkie", "a walkie-talkie", "walkie", None),
    ("camera", "a camera", "camera", None), ("foil", "foil", "foil", None), ("cooler", "the cooler", "cooler", None),
    ("lantern", "a lantern", "lantern", None), ("cards", "playing cards", "cards", None),
    ("firewood", "firewood", "firewood", None), ("toothbrush", "a toothbrush", "toothbrush", None),
    ("bottle", "a water bottle", "bottle", None), ("knife", "a pocket knife", "knife", None),
    ("blanket", "a blanket", "blanket", None), ("mallet", "a mallet", "mallet", None),
    ("thermos", "a thermos", "thermos", None), ("keys", "the van keys", "keys", None),
]
BORDERS = [kit.C_BLUE, kit.C_GRN, kit.C_RED, kit.C_PUR, "#c48a1a", kit.C_BRN]


def item_tile(i, key, name, icon, kind, said=False):
    """`said` draws a phantom the way it sits in the tray when it has only been said: no ring yet."""
    @asset(G, f"item-{key}" + ("-said" if said else ""), group="pieces",
           title=f"Pack List tile{', as said' if said else ''}: {name}", w=S, h=S,
           row="Item tiles (36) and List tiles (19)" + (" (accepted 2026-11-15)" if said else ""))
    def draw(a: Art):
        r = a.rng
        a.paper(kit.KRAFT, grain=0.4, fibre=0.7)
        d = []
        for _ in range(40):
            x, y = r.uniform(0, S), r.uniform(0, S); L = r.uniform(8, 26); t = r.uniform(-.3, .3)
            d.append(f"M{f(x)},{f(y)}l{f(L * math.cos(t))},{f(L * math.sin(t))}")
        a.path("".join(d), stroke="#8f6538", stroke_width=1, opacity=0.5)
        a.open("g", filter=kit.wax(a))
        sq = [(16, 14), (204, 16), (203, 176), (15, 174)]
        kit.crayon_fill(a, sq, kit.C_WHT, width=11, spacing=6, angle=r.uniform(-8, 8), opacity=0.92)
        col = BORDERS[i % len(BORDERS)] if kind is None or said else {"phantom": kit.C_RED, "seat": kit.C_BLK, "guest": "#c48a1a"}[kind]
        kit.crayon(a, sq, col, width=7, passes=3, closed=True)
        pen = kit.CrayonPen(a, 110, 96, 62)
        kit.ICONS[icon](pen)
        if kind == "phantom" and not said:       # circled where nobody put it
            ring = [(110 + 92 * math.cos(t) + r.uniform(-3, 3), 96 + 76 * math.sin(t) + r.uniform(-3, 3))
                    for t in [k * math.pi / 10 - 2 for k in range(22)]]
            kit.crayon(a, ring, kit.C_RED, width=7, passes=3)
        if kind == "seat":          # the empty seat's own item: a chalk-white question beside it
            kit.crayon(a, [(176, 30), (188, 24), (196, 34), (186, 46), (186, 54)], kit.C_BLK, width=5, passes=2)
            kit.crayon(a, [(186, 64), (187, 66)], kit.C_BLK, width=6, passes=2)
        a.close()
        size = 17 if len(name) < 16 else 15 if len(name) < 21 else 13.5
        a.text(110, 202, name, size=size, family="sans-serif", fill="#2b1d14", font_weight="bold",
               text_anchor="middle")
    draw.__doc__ = (f"A Pack List tray tile in wax crayon on brown kraft paper: {name}, drawn the way a child draws "
                    f"what goes in the bag" + (", as it lies in the tray when a friend has just said it: an ordinary tile, not yet circled."
                                                if said else ", and circled in red because nobody at the fire added it."
                                                if kind == "phantom" else
                                                ", the item the seat nobody filled adds: one Tam wrote and never said."
                                                if kind == "seat" else
                                                ", the thing a guest brings from home." if kind == "guest" else "."))
    return draw


for _i, _row in enumerate(ITEMS):
    item_tile(_i, *_row)
item_tile(4, "kettle", "a blue enamel kettle", "kettle", "phantom", said=True)   # the tray shows no ring until Tam catches it


# ---- the List: one thing for each lost site, in the order the place packed them --------------------
LIST = [
    (1, "a washing line", "washing_line"), (2, "a camp chair", "camp_chair"), (3, "a hammock", "hammock"),
    (4, "a dog's bowl", "dog_bowl"), (5, "a blue enamel kettle", "kettle"), (6, "a fishing rod", "fishing_rod"),
    (7, "the owl box", "owl_box"), (8, "a kite", "kite"), (9, "the shallow pool", "pool"),
    (10, "a guitar", "guitar"), (11, "a paddle", "paddle"), (12, "milk in the creek", "milk"),
    (13, "a windbreak", "windbreak"), (14, "a red wagon", "wagon"), (15, "a radio", "radio"),
    (16, "the tall cedar", "cedar"), (17, "Puddle", "bicycle"), (18, "a tyre swing", "tyre_swing"),
    (19, "a lantern on a pole", "pole_lantern"),
]


def list_tile(n, name, icon):
    @asset(G, f"list-{n:02d}", group="pieces", title=f"The List, {n}: {name}", w=S, h=S,
           row="Item tiles (36) and List tiles (19)")
    def draw(a: Art):
        r = a.rng
        kit.notebook(a, step=26, top=40, margin=34)
        # a soft rubbed patch of graphite behind the drawing
        a.ellipse(122, 104, 74, 62, fill=kit.GRAPHITE, opacity=0.07, filter=a.blur(8))
        pen = kit.PencilPen(a, 122, 102, 58)
        kit.ICONS[icon](pen)
        kit.hand(a, 8, 34, str(n), size=30, rot=r.uniform(-4, 4), font_weight="bold")
        size = 19 if len(name) < 15 else 16.5
        kit.hand(a, 42, 198, name, size=size, rot=r.uniform(-1.5, 1))
        if n > 1:                   # said backwards, the List is the route
            kit.hand(a, 168, 26, f"then {n - 1}", size=13, color="#77756f", rot=-3)
        else:
            kit.hand(a, 176, 26, "out", size=13, color="#77756f", rot=-3)
        kit.pencil(a, [(42, 206), (42 + len(name) * size * 0.43, 207)], w=1.2, op=0.6)
        kit.tooth(a, 0.1)
    draw.__doc__ = (f"One tile of the List on Tam's notebook paper, in a single pencil weight with hatching: site {n} "
                    f"held {name}. The number is its place in the order the campground packed it; said backwards, "
                    f"the nineteen are the way out.")
    return draw


for _row in LIST:
    list_tile(*_row)


# ---- Foil Supper ingredients: two-colour risograph ---------------------------------------------------
INGR = [
    ("potatoes", ["POTATOES"], "BASE", "home", "potatoes"),
    ("store-corn", ["STORE CORN"], "BASE", "booth shelf", "corn"),
    ("sausages", ["SAUSAGES"], "BODY", "home", "sausages"),
    ("lentil-cakes", ["LENTIL CAKES"], "BODY", "June", "lentil_cakes"),
    ("butter-pats", ["BUTTER PATS"], "FAT", "booth shelf", "butter"),
    ("olive-oil", ["OLIVE OIL"], "FAT", "home", "olive_oil"),
    ("garden-onions", ["GARDEN ONIONS"], "FLAVOUR", "the Ashbys", "onions"),
    ("wild-ramps", ["WILD RAMPS"], "FLAVOUR", "Abel", "ramps"),
    ("salt", ["SALT"], "FLAVOUR", "home", "salt"),
    ("pepper", ["PEPPER"], "FLAVOUR", "home", "pepper"),
    ("grey-apples", ["GREY APPLES"], "UNKNOWN", "nobody packed them", "grey_apples"),
    ("nothing-salt", ["SALT THAT TASTES", "OF NOTHING"], "UNKNOWN", "nobody packed it", "nothing_salt"),
    ("spare-sheet", ["THE SPARE SHEET"], "ONE TOO MANY", "fill it or leave it", "foil_sheet"),
    ("packet", ["A PACKET"], "SCORE 3", "the card's own", "packet"),
]


def ingr_tile(key, lines, role, source, icon):
    @asset(G, f"ingredient-{key}", group="pieces", title=f"Foil Supper tile: {' '.join(lines).lower()}", w=S, h=S,
           row="Ingredient tiles (14), recipe card states (3)")
    def draw(a: Art):
        r = a.rng
        a.paper("#F6EFE3", grain=0.2, fibre=1.2)
        a.stipple(0, 0, S, S, n=110, r=(0.5, 1.2), fill=kit.TEAL, opacity=0.3)
        a.stipple(0, 0, S, S, n=110, r=(0.5, 1.2), fill=kit.PINK, opacity=0.3)
        unknown = role == "UNKNOWN"
        ink = kit.TEAL if role in ("BASE", "FAT", "ONE TOO MANY") else kit.PINK
        # frame, out of register
        a.rect(9, 9, S - 18, S - 18, fill="none", stroke=kit.TEAL, stroke_width=3, style="mix-blend-mode:multiply")
        a.rect(12.5, 6.5, S - 18, S - 18, fill="none", stroke=kit.PINK, stroke_width=3, opacity=0.8,
               style="mix-blend-mode:multiply")
        # role band
        if unknown:
            a.rect(9, 9, S - 18, 30, fill="none", stroke=kit.PINK, stroke_width=2, stroke_dasharray="6 5")
            a.text(20, 30, role, size=14, family="sans-serif", fill=kit.PINK, font_weight="bold", letter_spacing="3")
        else:
            a.rect(9, 9, S - 18, 30, fill=ink, opacity=0.88, style="mix-blend-mode:multiply")
            a.text(20, 30, role, size=14, family="sans-serif", fill="#F6EFE3", font_weight="bold", letter_spacing="3")
        # a halftone sun behind the food
        hx, hy = 110 + r.uniform(-8, 8), 100
        a.halftone(30, 46, 160, 110, lambda x, y: 0.55 - math.hypot(x - hx, y - hy) / 130, cell=9,
                   angle=r.choice([15, 45, 75]), fill=kit.PINK if ink == kit.TEAL else kit.TEAL, opacity=0.45)
        pen = kit.RisoPen(a, 110, 102, 56)
        kit.ICONS[icon](pen)
        y = 186 if len(lines) == 1 else 166
        for k, ln in enumerate(lines):
            a.text(20, y + k * 17, ln, size=16 if len(lines) == 1 else 13.5, family="sans-serif", fill="#3a0f24",
                   font_weight="bold", letter_spacing="1")
        a.text(S - 18, 204 if len(lines) == 1 else 203, source, size=10.5, family="monospace", fill=kit.TEAL,
               text_anchor="end")
    draw.__doc__ = (f"A Foil Supper ingredient tile printed in two risograph inks, pink and teal, a little out of "
                    f"register: {' '.join(lines).lower()}, role {role.lower()}, from {source}.")
    return draw


for _row in INGR:
    ingr_tile(*_row)

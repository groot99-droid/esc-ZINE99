"""Cut-outs for play: the same vessels, swimmer and bottle as the plates, on no ground at all, so a mode can set
them on its own sea; and the three phase-1 papers the modes show (the slate, the countersign, the strongbox)."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
INK, RED, TEA, LAMP, GREEN, FOAM, GOLD, SEAINK, SAIL = (
    kit.INK, kit.RED, kit.TEA, kit.LAMP, kit.GREEN, kit.FOAM, kit.GOLD, kit.SEAINK, kit.SAIL)
ROW_F = "2D figures: boat ×4, swimmer, cutter, convoy, ferry, skiff, carried person"
ROW_C = "The Charter: 5 documents, Schedule C, the writ, 8 chits, 6 seals"
ROW_U = "UI ornaments: rose ring, stir spiral, corners, rules, seal states"


# ---- vessels: the deck line is at y = h - 48 and the hull is centred on x = w / 2 ---------------------
@asset(G, "sprite-boat-full", group="figures", title="Cut-out: Alexi's boat, full sail", w=300, h=310, row=ROW_F)
def sp_boat_full(a: Art):
    """Alexi's boat under full sail on no ground, the heavy figure at the tiller: the cut-out the Engraved Sea
    sets on its own waves."""
    kit.ship(a, "sloop", 150, 262, 1.75, helm=True)


@asset(G, "sprite-boat-spill", group="figures", title="Cut-out: Alexi's boat, spilling wind", w=300, h=310, row=ROW_F)
def sp_boat_spill(a: Art):
    """The same boat on no ground with her sails let fly, the mainsail hanging in loose folds off the gaff."""
    kit.ship(a, "sloop", 150, 262, 1.75, helm=True, sails=False)
    for i in range(7):
        x = 58 + i * 16
        a.path(f"M{x},{64 + (6 - i) * 6} q{8 + i},{50} {-4 + i * 2},{100} q-6,34 4,{60 + i * 3}", fill="none", stroke=INK,
               stroke_width=1.3)
    a.path("M164,36 q30,90 96,206", fill="none", stroke=INK, stroke_width=1.2)
    a.path("M168,42 q52,80 56,150 q-20,30 -50,44z", fill=SAIL, stroke=INK, stroke_width=1.4, opacity=0.9)


@asset(G, "sprite-cutter", group="figures", title="Cut-out: revenue cutter", w=380, h=300, row=ROW_F)
def sp_cutter(a: Art):
    """A Company revenue cutter on no ground: dark hull, two square-rigged masts, the red pennant, a grapnel
    line coiled at the bowsprit."""
    kit.ship(a, "cutter", 176, 252, 1.2)
    a.path("M330,224 q14,-10 26,-4 q-8,10 -20,10", fill="none", stroke=INK, stroke_width=1.6, stroke_linecap="round")
    a.path("M356,220 l10,-8 M356,220 l12,2 M356,220 l6,10", fill="none", stroke=INK, stroke_width=1.8, stroke_linecap="round")


@asset(G, "sprite-ferry", group="figures", title="Cut-out: the Tidewater ferry", w=260, h=110, row=ROW_F)
def sp_ferry(a: Art):
    """The Tidewater ferry on no ground: the flat double-ended boat, its awning, and a rail of small passengers."""
    kit.ship(a, "ferry", 130, 78, 1.1)
    for i, px in enumerate((74, 92, 112, 126, 150, 170, 186)):
        kit.person(a, px, 74, 15 + (i * 5) % 6 - (5 if i in (3, 5) else 0), skirt=i % 3 == 0)
    a.rect(16, 76, 228, 5, fill=SAIL, stroke=INK, stroke_width=1)


@asset(G, "sprite-skiff", group="figures", title="Cut-out: reef skiff", w=150, h=140, row=ROW_F)
def sp_skiff(a: Art):
    """A reef skiff under one lugsail on no ground, a single figure aft: the boat that lifts at its mooring when a
    crest rolls on to the coast."""
    kit.ship(a, "lugskiff", 76, 112, 1.4)
    kit.person(a, 46, 108, 18)


# ---- the swimmer: his chest is at (140, 70) ------------------------------------------------------------
def _swim(a, kick=0.0, carry=False):
    kit.swimmer(a, 140, 70 if not carry else 56, 1.0, carry=carry, kick=kick, bg="#0b1626")


@asset(G, "sprite-swimmer", group="figures", title="Cut-out: Alexi swimming, the glide", w=300, h=150, row=ROW_F)
def sp_swimmer(a: Art):
    """Alexi in the Deep on no ground, one pale shape at full stretch with his legs together: the glide between
    strokes."""
    _swim(a)


@asset(G, "sprite-swimmer-kick", group="figures", title="Cut-out: Alexi swimming, the kick", w=300, h=150, row=ROW_F)
def sp_swimmer_kick(a: Art):
    """The same pale swimmer on no ground with his legs scissored wide: the kick."""
    _swim(a, kick=1)


@asset(G, "sprite-swimmer-carry", group="figures", title="Cut-out: Alexi carrying", w=300, h=150, row=ROW_F)
def sp_swimmer_carry(a: Art):
    """The swimmer on no ground with a second, paler figure held in both arms under him: how he carries what the
    deep gives up."""
    _swim(a, carry=True)


# ---- things the phase-1 scenes put in the hand ---------------------------------------------------------
@asset(G, "sprite-bottle-chit", group="documents", title="The bottle on the cabin wall, a paper at its neck", w=190, h=380,
       row=ROW_C)
def sp_bottle(a: Art):
    """The bottle that has hung on the cabin wall since the first morning, on no ground: sea-green glass on a
    cord, and tied at its neck a folded paper signed with a clockwise spiral."""
    a.rect(50, 0, 40, 10, fill="#1a120a")
    a.circle(70, 8, 4, fill=GOLD)
    kit.bottle(a, 70, 74, s=3.0, ang=3, col=LAMP, glass=SEAINK, tag=True, cord=22, fill_opacity=0.62)


@asset(G, "sprite-strongbox", group="documents", title="The tender's strongbox", w=200, h=150, row=ROW_C)
def sp_strongbox(a: Art):
    """The Company tender's strongbox on no ground: an iron-bound chest, sea-swollen, the Company's leaf mark on
    its lid and weed on one corner."""
    a.path("M20,58 q80,-34 160,0 v70 q-80,14 -160,0z", fill="#6b5a2e", stroke="#16130F", stroke_width=3, stroke_linejoin="round")
    a.path("M20,58 q80,-34 160,0 v18 q-80,-30 -160,0z", fill=GOLD, stroke="#16130F", stroke_width=3, stroke_linejoin="round")
    for x in (52, 100, 148):
        a.path(f"M{x},{46 if x != 100 else 41} v{86 if x != 100 else 94}", stroke="#16130F", stroke_width=6, fill="none", opacity=0.85)
    a.rect(88, 78, 24, 22, fill="#16130F", rx=3)
    a.circle(100, 87, 4, fill=GOLD)
    kit.company_mark(a, 100, 52, 11, col="#16130F", opacity=0.9)
    a.path("M24,126 q-8,-20 2,-34 M30,128 q-2,-16 8,-26 M172,128 q10,-14 4,-30", fill="none", stroke=SEAINK, stroke_width=3,
           stroke_linecap="round")
    kit.salt(a, 150, 104, 26, strength=0.8)


@asset(G, "the-slate", group="documents", title="Mother Halse's slate", w=1000, h=560, row=ROW_C)
def the_slate(a: Art):
    """The chandler's slate at Tidewater turned round on the counter: forty years of one account in chalk, row
    under row of tallies, every line ending 'pays next tide' and signed with the same small clockwise spiral."""
    r = a.rng
    a.rect(0, 0, a.w, a.h, fill="#5a3d22")
    a.rect(0, 0, a.w, a.h, fill=kit.pattern(a, "#000", gap=9, sw=1.4, ang=2, opacity=0.25))
    a.rect(34, 34, a.w - 68, a.h - 68, fill="#23272b", stroke="#16130F", stroke_width=4)
    a.rect(34, 34, a.w - 68, a.h - 68, fill=kit.pattern(a, "#fff", gap=13, sw=5, ang=18, opacity=0.035))
    chalk = dict(fill="none", stroke="#ece7da", stroke_linecap="round")
    a.text(70, 96, "A. — the boat in the Reach", size=34, family="cursive", fill="#ece7da", opacity=0.92)
    a.path(a.wobble_d([(66, 112), (640, 110)], 1.6, 16), stroke_width=2.4, opacity=0.8, **chalk)
    for row in range(8):
        y = 150 + row * 44
        x = 70
        n = 3 + (row * 5) % 4
        for g in range(n):
            for k in range(4):
                a.path(f"M{f(x + k * 9 + r.uniform(-1, 1))},{y} l{f(r.uniform(-2, 2))},26", stroke_width=3, opacity=0.86, **chalk)
            a.path(f"M{x - 5},{y + 20} l44,-14", stroke_width=3, opacity=0.86, **chalk)
            x += 58
        a.text(x + 16, y + 22, "pays next tide", size=24, family="cursive", fill="#ece7da", opacity=0.6 + 0.04 * row)
        kit.spiral(a, 900, y + 12, 1, 13, 2.4, stroke="#ece7da", stroke_width=2, opacity=0.85)
    a.path(a.wobble_d([(66, 508), (934, 506)], 1.6, 16), stroke_width=2.4, opacity=0.8, **chalk)
    a.rect(34, 34, a.w - 68, a.h - 68, fill="#ece7da", opacity=0.05, filter=a.blur(22))


@asset(G, "countersign", group="ui", title="The countersign: the Lord of Tea's tick", w=260, h=160, row=ROW_U)
def countersign(a: Art):
    """The countersign that comes back on every Tide Reckoning: a green tick and the initial T in a ruled box,
    'examined and entered' in a clerk's small capitals, on no ground."""
    a.rect(8, 8, 244, 144, fill="none", stroke=kit.TICK, stroke_width=2, transform="rotate(-3 130 80)")
    a.rect(15, 15, 230, 130, fill="none", stroke=kit.TICK, stroke_width=0.8, transform="rotate(-3 130 80)")
    a.open("g", transform="rotate(-3 130 80)")
    kit.tick(a, 70, 86, s=3.4)
    kit.smallcaps(a, 130, 132, "Examined and entered", size=13, col=kit.TICK)
    a.close()

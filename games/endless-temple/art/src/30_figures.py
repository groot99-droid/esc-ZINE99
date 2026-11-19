"""The four 2D figures, and the four watcher shadows that fall across the Rule Tablet."""
import math

from artkit import Art, asset, f, sibling

K = sibling(__file__, "_kit")
ROW = "2D figures: Xandri on leaf shoes, Pell, Oda, Elaris side-on"
ROW_W = "Clay tablets (5) and watcher shadows (4)"
INK = K.INK
XSKIN, XSKIN_D = "#7A5234", "#5A3A24"


def ground(a, tint, rough):
    """A sprite sheet's vellum ground with one loose wash behind the figure."""
    K.page(a, K.VELLUM, g=.22, edge=.3)
    K.wash(a, K.blob_d(a, a.w / 2, a.h * .5, a.w * .4, a.h * .36, jit=.16), tint, .3, rough)


def xandri(a: Art, bare=False):
    rough = a.roughen(7, .03)
    if not bare:
        ground(a, K.SILVER, rough)
        # the wave face under him
        face = [(0, 430), (90, 440), (200, 478), (320, 520), (480, 548)]
        K.wash(a, a.smooth_d(face) + " L480,600 L0,600Z", K.SILVER, .85, rough, edge="#8D94A8")
        K.wash(a, K.blob_d(a, 300, 570, 150, 26), K.OCHRE, .3, rough)
        K.pen(a, face, w=4, taper=(.05, .2))
        for k in range(9):
            x = 20 + k * 52
            y = 452 + k * 13
            K.curve(a, [(x, y + 22), (x + 36, y + 34)], w=1.1, color=K.INK2, opacity=.6)
        K.sand(a, 0, 380, 190, 90, n=150, r=(.7, 2), density=lambda x, y: max(0, 1 - math.hypot(x - 60, y - 430) / 110))
    # leaf shoes
    K.woody_leaf(a, 150, 462, 120, 0.33)
    K.woody_leaf(a, 262, 500, 124, 0.3)
    # legs (back leg first), wrapped shins
    hip = (214, 330)
    K.limb(a, [hip, (176, 392), (196, 452)], 24, XSKIN_D)
    K.limb(a, [(196, 452), (204, 466), (228, 472)], 14, XSKIN_D)
    K.limb(a, [(224, 334), (296, 388), (300, 470)], 26, XSKIN)
    K.limb(a, [(300, 470), (306, 494), (336, 502)], 15, XSKIN)
    for (x0, y0, x1, y1) in ((178, 420, 208, 414), (182, 436, 210, 432), (286, 440, 316, 440), (286, 456, 316, 458)):
        a.line(x0, y0, x1, y1, stroke=K.OCHRE, stroke_width=3.5, stroke_linecap="round")
    # the cords that tie the leaves on
    K.curve(a, [(196, 458), (184, 474), (214, 480), (228, 470)], w=2.4, color=K.OCHRE)
    K.curve(a, [(300, 480), (290, 506), (324, 512), (334, 500)], w=2.4, color=K.OCHRE)
    # the pack on his back: holes and scant patchwork
    K.shape(a, [(128, 236), (176, 214), (206, 250), (200, 320), (150, 334), (116, 296)], "#6E5236")
    a.rect(132, 250, 26, 24, fill=K.BRUISE, stroke=INK, stroke_width=1.2, transform="rotate(-12 145 262)")
    a.rect(160, 286, 24, 22, fill=K.SAGE_D, stroke=INK, stroke_width=1.2, transform="rotate(8 172 297)")
    a.path("M130,252 l5,-3 m4,-2 l5,-2 m5,-2 l5,-2 M162,288 l5,1 m4,1 l5,1 m4,1 l4,1", stroke=K.VELLUM, stroke_width=1.4)
    a.ellipse(176, 248, 7, 5, fill=K.WALNUT)
    a.ellipse(134, 302, 6, 8, fill=K.WALNUT)
    a.path("M196,318 l10,14 M150,334 l-4,14 l6,-4", stroke=INK, stroke_width=1.6, fill="none")
    # torso, leaning into the slope
    K.shape(a, [(196, 226), (244, 216), (262, 262), (246, 336), (200, 344), (188, 290)], "#B89868")
    K.curve(a, [(206, 240), (236, 300), (232, 338)], w=4, color="#5A4230")           # the pack strap
    a.path("M196,330 Q224,340 250,326 L250,340 Q224,354 198,344Z", fill=K.OCHRE, stroke=INK, stroke_width=1.6)
    # his father's leaf-cord, flying back from the waist
    cord = [(200, 338), (160, 352), (120, 338), (84, 356), (50, 344)]
    K.pen(a, cord, w=5, color=K.OCHRE, taper=(.05, .4))
    K.leaf(a, 84, 356, 24, 2.6, fill=K.SAGE, lw=1.1)
    K.leaf(a, 50, 344, 28, 3.3, fill=K.SAGE, lw=1.1)
    # arms out for balance
    K.limb(a, [(210, 240), (160, 232), (118, 196)], 15, XSKIN_D)
    K.limb(a, [(240, 236), (300, 262), (352, 244)], 16, XSKIN)
    a.path("M352,244 l14,-8 M352,244 l16,0 M352,244 l12,8", stroke=INK, stroke_width=3, stroke_linecap="round")
    a.path("M118,196 l-10,-12 M118,196 l-14,-4", stroke=INK, stroke_width=3, stroke_linecap="round")
    # head: profile to the right, fine scales on cheek and brow, a welt on the ear
    K.limb(a, [(232, 222), (240, 200)], 16, XSKIN)
    K.shape(a, [(214, 168), (236, 142), (270, 146), (286, 170), (294, 186), (284, 192), (286, 204), (266, 214), (236, 208),
                (218, 192)], XSKIN)
    a.path("M250,186 q4,-5 8,0 M258,194 q4,-5 8,0 M244,196 q4,-5 8,0 M262,160 q4,-4 8,0 M254,156 q4,-4 8,0", stroke=XSKIN_D,
           stroke_width=1.5, fill="none")
    a.ellipse(272, 174, 4.5, 3.2, fill=K.GOLD)
    a.circle(273, 174, 1.6, fill=INK)
    a.path("M264,166 l14,-3 M280,198 l-9,2", stroke=INK, stroke_width=1.8, stroke_linecap="round")
    a.ellipse(236, 180, 6, 9, fill=XSKIN_D, stroke=INK, stroke_width=1.3)
    a.path("M233,174 l5,4", stroke="#B24A3A", stroke_width=2.2, stroke_linecap="round")
    # the head-cloth, faded ochre, its tail in the wind
    K.shape(a, [(208, 168), (224, 136), (262, 128), (286, 150), (270, 152), (240, 156), (220, 176)], "#D2A860")
    K.pen(a, [(214, 160), (170, 150), (136, 164), (100, 150)], w=13, color="#D2A860", taper=(.02, .6))
    K.curve(a, [(214, 154), (172, 144), (138, 158), (104, 146)], w=1.4)
    K.curve(a, [(226, 142), (252, 138), (276, 148)], w=1.2, opacity=.7)
    # speed
    for k in range(6):
        y = 250 + k * 34
        K.pen(a, [(30 + a.rng.uniform(0, 30), y + 8), (96 + a.rng.uniform(0, 30), y)], w=2.2, color=K.INK2, taper=(.6, .2))


@asset(K.G, "figure-pell", group="figures", title="Pell under the Clerk's umbrella", w=480, h=600, row=ROW)
def pell(a: Art):
    """Pell side-on, lifted off a Hollin roof ridge by the dead Clerk's umbrella: both hands on the crook,
    boots trailing, scarf out behind, the gusts drawn as hatching in graphite and slate blue."""
    rough = a.roughen(7, .03)
    ground(a, "#8A93A0", rough)
    slate, slate_d, graph = "#5E6B7C", "#3E4654", "#4A4A4C"
    # gusts as hatching, lifting from the lower left
    for k in range(13):
        x0 = -20 + k * 34 + a.rng.uniform(-8, 8)
        y0 = 560 - k * 12 + a.rng.uniform(-10, 10)
        L = a.rng.uniform(120, 220)
        K.pen(a, [(x0, y0), (x0 + L * .5, y0 - L * .45), (x0 + L, y0 - L * .6)], w=2, color=graph, taper=(.5, .4), opacity=.55)
    # roof ridge below
    a.path("M0,600 L150,520 L330,600Z", fill=slate_d, stroke=INK, stroke_width=2)
    a.path("M150,520 L330,600 M40,580 l40,20 M90,552 l70,40 M120,538 l100,56", stroke=INK, stroke_width=1.2, fill="none",
           opacity=.7)
    a.rect(196, 520, 26, 44, fill="#6B5A4A", stroke=INK, stroke_width=1.6)
    # umbrella
    top = (270, 70)
    K.shape(a, [(110, 190), (160, 104), (270, 66), (382, 104), (432, 190), (392, 174), (352, 192), (310, 172), (270, 192),
                (228, 172), (188, 192), (150, 174)], "#2E3440")
    a.path("M270,66 L188,192 M270,66 L228,172 M270,66 L310,172 M270,66 L352,192 M270,66 L270,192", stroke="#6E7888",
           stroke_width=1.3, fill="none")
    a.path("M270,66 v-18", stroke=INK, stroke_width=4, stroke_linecap="round")
    K.curve(a, [(270, 192), (269, 250)], w=4.5, color=K.WALNUT_L)
    # coat
    K.shape(a, [(238, 318), (292, 314), (306, 380), (322, 446), (270, 462), (214, 452), (228, 386)], slate)
    a.path("M266,320 L262,458 M240,400 q26,10 56,-2", stroke=INK, stroke_width=1.3, fill="none", opacity=.7)
    for y in (350, 380, 410):
        a.circle(271, y, 3, fill=K.GOLD, stroke=INK, stroke_width=.8)
    # legs trailing, boots
    K.limb(a, [(244, 452), (226, 500), (190, 536)], 14, graph)
    K.limb(a, [(286, 456), (282, 510), (254, 556)], 14, graph)
    K.shape(a, [(196, 528), (178, 540), (160, 566), (178, 572), (204, 548)], K.WALNUT)
    K.shape(a, [(260, 548), (244, 562), (228, 590), (248, 594), (270, 566)], K.WALNUT)
    # head, looking up; short dark hair; scarf out behind
    K.shape(a, [(244, 276), (262, 262), (288, 268), (296, 290), (286, 312), (262, 318), (246, 304)], "#E2C9A8")
    K.shape(a, [(240, 284), (250, 260), (280, 256), (298, 274), (280, 272), (262, 276), (250, 300)], "#3A2A22")
    a.circle(284, 288, 2.2, fill=INK)
    a.path("M290,300 q-6,4 -10,2 M280,281 l8,-3", stroke=INK, stroke_width=1.6, fill="none", stroke_linecap="round")
    K.limb(a, [(240, 330), (228, 286), (262, 240)], 13, slate)
    K.limb(a, [(294, 328), (308, 286), (276, 240)], 13, slate)
    a.circle(269, 238, 9, fill="#E2C9A8", stroke=INK, stroke_width=1.5)
    K.pen(a, [(250, 318), (200, 312), (150, 330), (104, 310)], w=15, color="#B24A3A", taper=(.02, .5))
    K.curve(a, [(250, 312), (200, 306), (152, 324), (108, 306)], w=1.3)
    a.path("M240,312 Q268,330 296,310", stroke="#B24A3A", stroke_width=11, fill="none", stroke_linecap="round")
    # rain
    a.hatch(0, 0, 480, 600, angle=72, spacing=26, stroke="#6E7888", stroke_width=1.1, opacity=.45, jitter=8,
            stroke_dasharray="18 30")


@asset(K.G, "figure-oda", group="figures", title="Oda on the wet ink stroke", w=480, h=600, row=ROW)
def oda(a: Art):
    """Oda side-on, masked like every pilgrim, sliding along the Scribe's wet ink stroke with the inkpot held
    level in both hands and a lantern on a staff across her back; sepia on grey paper, one orange light."""
    rough = a.roughen(7, .03)
    K.page(a, "#D6D2C8", g=.22, edge=.3)
    K.wash(a, K.blob_d(a, 240, 300, 200, 220, jit=.16), "#8E8A82", .3, rough)
    sep, sep_d = "#6E5A44", "#4A3A2C"
    # the stroke: wet, wide, still shining, thinning to nothing ahead
    stroke = [(-10, 500), (110, 512), (240, 490), (360, 500), (470, 470)]
    K.pen(a, stroke, w=44, color="#231A14", taper=(0, .45), wob=.2)
    K.curve(a, [(20, 496), (120, 506), (236, 484), (330, 492)], w=2.5, color="#8E8A82", opacity=.7)
    K.stip(a, 330, 440, 150, 80, n=40, r=(1, 3), fill="#231A14", opacity=.8)
    # lantern staff across her back
    a.line(140, 330, 330, 150, stroke=K.WALNUT_L, stroke_width=6, stroke_linecap="round")
    K.glow(a, 338, 150, 90, K.LANTERN, .7)
    a.path("M324,128 h28 l-4,40 h-20Z", fill=K.LANTERN, stroke=INK, stroke_width=2)
    a.path("M330,128 q8,-14 16,0 M338,138 v20", stroke=INK, stroke_width=1.8, fill="none")
    # robe: one long shape, hem dragging in the ink
    K.shape(a, [(214, 236), (262, 232), (286, 300), (318, 420), (330, 486), (250, 498), (176, 490), (196, 400), (204, 300)], sep)
    a.path("M226,300 q10,90 -20,186 M262,300 q20,90 30,190 M246,250 q6,120 2,246", stroke=sep_d, stroke_width=1.6, fill="none")
    a.path("M176,490 q76,14 154,-4 l2,14 q-78,16 -158,2Z", fill="#231A14")
    a.path("M200,330 Q246,346 290,326 L292,340 Q246,360 202,344Z", fill=K.OCHRE, stroke=INK, stroke_width=1.4)
    # arms forward, the inkpot held level
    K.limb(a, [(254, 262), (300, 300), (346, 300)], 15, sep)
    K.limb(a, [(240, 270), (290, 322), (342, 316)], 15, sep_d)
    a.path("M338,280 h44 l6,10 v30 q0,8 -8,8 h-40 q-8,0 -8,-8 v-30Z", fill="#3A3A40", stroke=INK, stroke_width=2)
    a.ellipse(360, 284, 18, 5, fill="#0E0C0C", stroke=INK, stroke_width=1.2)
    a.path("M346,300 v16", stroke="#6E7888", stroke_width=2, stroke_linecap="round")
    # hood and mask (no pilgrim unmasks until the City)
    K.shape(a, [(200, 216), (212, 164), (252, 148), (282, 172), (284, 214), (262, 240), (220, 244)], sep_d)
    K.shape(a, [(250, 168), (274, 172), (286, 196), (278, 224), (256, 232), (246, 204)], "#EAE2CE")
    a.path("M262,192 h14 M268,212 q6,3 10,0", stroke=INK, stroke_width=2.4, stroke_linecap="round", fill="none")
    a.path("M250,170 q-6,30 6,60", stroke=INK, stroke_width=1.2, fill="none", opacity=.6)
    a.path("M254,178 l-12,-4 M256,224 l-12,6", stroke=K.OCHRE, stroke_width=2)
    # ink flecks thrown back
    K.stip(a, 60, 430, 130, 70, n=30, r=(1, 2.8), fill="#231A14", opacity=.85)
    for k in range(5):
        K.pen(a, [(40 + k * 14, 300 + k * 30), (110 + k * 12, 296 + k * 30)], w=2, color=K.INK2, taper=(.6, .2))


def elaris(a: Art, bare=False):
    rough = a.roughen(7, .03)
    robe, robe_d = "#7A5C3A", "#5A4028"
    if not bare:
        ground(a, K.GOLD, rough)
        # a floor line and his long shadow
        a.path("M30,566 H450", stroke=INK, stroke_width=1.6)
        a.ellipse(250, 568, 120, 8, fill=K.WALNUT, opacity=.25)
    # feet
    K.shape(a, [(196, 546), (236, 548), (252, 562), (198, 564)], K.WALNUT_L)
    K.shape(a, [(262, 544), (300, 546), (318, 560), (264, 562)], K.WALNUT_L)
    # robe: a long narrow column, cowl at the shoulders, rope belt
    K.shape(a, [(214, 150), (268, 146), (288, 210), (296, 330), (316, 552), (188, 554), (204, 330), (206, 210)], robe)
    a.path("M232,230 q-8,160 -20,320 M262,230 q14,160 30,320 M246,330 q2,110 6,220", stroke=robe_d, stroke_width=1.8,
           fill="none")
    a.path("M204,300 Q250,314 296,298 L297,310 Q250,326 204,312Z", fill=K.VELLUM_S, stroke=INK, stroke_width=1.4)
    K.curve(a, [(224, 314), (218, 370), (226, 420)], w=3.5, color=K.VELLUM_S)
    K.curve(a, [(224, 314), (218, 370), (226, 420)], w=1, color=INK)
    K.shape(a, [(200, 152), (240, 132), (282, 148), (292, 186), (246, 200), (198, 190)], robe_d)
    # arm with the book, held against the hip; sand sifting from it
    K.limb(a, [(222, 186), (210, 260), (236, 318)], 17, robe)
    a.rect(206, 300, 62, 44, rx=3, fill=K.OCHRE, stroke=INK, stroke_width=2, transform="rotate(14 237 322)")
    a.path("M214,338 l54,14", stroke=K.VELLUM, stroke_width=4, transform="rotate(0)")
    K.sand(a, 196, 350, 60, 200, n=110, r=(.6, 1.6), density=lambda x, y: max(0, 1 - abs(x - 222 - (y - 350) * .06) / 22))
    K.sand_pile(a, 232, 565, 34, 9, n=50)
    # forward arm with the cup
    K.limb(a, [(262, 184), (302, 232), (344, 232)], 16, robe)
    a.path("M336,222 q12,-8 22,2 l-2,14 q-10,6 -20,-2Z", fill=K.SKIN, stroke=INK, stroke_width=1.6)
    K.cup_side(a, 366, 232, .62, tea=.8, saucer=False, steam=True)
    # neck, head in profile, the long ear, hair tied back
    K.limb(a, [(244, 146), (248, 116)], 13, K.SKIN)
    K.shape(a, [(224, 80), (240, 52), (270, 50), (286, 70), (296, 92), (288, 98), (290, 110), (274, 124), (246, 122),
                (228, 106)], K.SKIN)
    K.shape(a, [(240, 88), (226, 70), (190, 50), (216, 86), (234, 100)], K.SKIN)       # ear
    a.path("M234,90 Q214,72 198,56", stroke=K.SKIN_D, stroke_width=1.6, fill="none")
    K.shape(a, [(222, 84), (232, 48), (266, 40), (288, 62), (262, 58), (244, 64), (238, 80)], "#E8E4D4")
    K.pen(a, [(226, 70), (200, 96), (196, 150), (206, 196)], w=11, color="#E8E4D4", taper=(.02, .7))
    K.curve(a, [(224, 74), (198, 98), (194, 150)], w=1.2)
    a.ellipse(275, 84, 4, 2.6, fill=K.WALNUT)
    a.path("M268,76 l12,-2 M284,108 q-6,3 -10,1", stroke=INK, stroke_width=1.7, fill="none", stroke_linecap="round")
    a.path("M250,100 q6,6 2,14", stroke=K.SKIN_D, stroke_width=1.4, fill="none")
    # the sunbeam he walks through
    if not bare:
        K.sunbeam(a, 480, 0, 120, 600, 30, 110, K.GOLD_L, .28)


K.reg("figure-xandri", "figures", "Xandri on leaf shoes", 480, 600, ROW,
      "Xandri side-on, riding a sand wave on two woody leaves tied to his feet: knees bent, arms out, his ochre "
      "head-cloth and his father's leaf-cord flying back, the patched pack with its holes on his back.", xandri)
K.reg("figure-elaris", "figures", "Elaris side-on", 480, 600, ROW,
      "Elaris Sel Marden side-on, walking the stacks: almost eight feet tall and thin, in monk's attire, sea-froth "
      "skin and a long ear, the cup in one hand and a closed book under the other arm, sand trailing from its pages.", elaris)
ROW_S = "Play sprites and the two hands (added for the modes, 2026-11-15)"
K.reg("sprite-xandri", "figures", "Sprite: Xandri on leaf shoes, no ground", 480, 600, ROW_S,
      "The Xandri figure cut out for play: the same drawing with no paper and no wave under it, so the living "
      "illustration can set him on its own sand.", xandri, bare=True)
K.reg("sprite-elaris", "figures", "Sprite: Elaris side-on, no ground", 480, 600, ROW_S,
      "The Elaris figure cut out for play: the same drawing with no paper, floor line or sunbeam, so the stacks can "
      "walk him along their own shelves.", elaris, bare=True)


def cup_hand(a: Art, ringed=False):
    """A long hand reaching in from the left edge with the cup; the older one wears a brass ring."""
    skin, skin_d = (("#A9BBA4", "#7F957F") if ringed else (K.SKIN, K.SKIN_D))
    sleeve, sleeve_d = (("#4A3A44", "#33262E") if ringed else ("#7A5C3A", "#5A4028"))
    # the sleeve, entering from the left edge
    K.shape(a, [(-20, 96), (150, 112), (232, 138), (236, 196), (150, 214), (-20, 232)], sleeve)
    a.path("M40,112 q30,50 10,108 M110,118 q24,44 8,92", stroke=sleeve_d, stroke_width=2, fill="none")
    # the wrist and the long back of the hand
    K.limb(a, [(226, 166), (300, 160), (368, 150)], 44, skin)
    # four long fingers wrapped under the bowl, and the thumb over its rim
    for k, (dy, ln) in enumerate(((0, 96), (14, 104), (28, 100), (42, 88))):
        K.limb(a, [(356, 140 + dy), (400 + ln * .4, 150 + dy), (386 + ln, 168 + dy * .7)], 15 - k, skin)
    if ringed:
        # age: knuckles and tendons, and the ring on the second finger
        a.path("M250,150 q40,-6 96,-8 M256,176 q44,2 92,-4 M300,146 q4,8 0,14 M330,144 q4,8 0,14", stroke=skin_d,
               stroke_width=1.8, fill="none", stroke_linecap="round")
        a.path("M404,150 q8,10 2,24", stroke=K.BRASS_D, stroke_width=11, fill="none", stroke_linecap="round")
        a.path("M404,150 q8,10 2,24", stroke=K.BRASS_L, stroke_width=6, fill="none", stroke_linecap="round")
        a.circle(409, 161, 5.5, fill=K.BRUISE, stroke=K.BRASS_D, stroke_width=1.6)
    else:
        a.path("M250,152 q40,-6 96,-8", stroke=skin_d, stroke_width=1.6, fill="none", stroke_linecap="round")
    K.cup_side(a, 470, 196, 1.5, tea=.8, saucer=False, steam=True)
    # the fingers that show in front of the bowl, and the thumb
    K.limb(a, [(388, 190), (424, 204), (452, 198)], 13, skin)
    K.limb(a, [(350, 134), (400, 112), (436, 118)], 16, skin)
    a.path("M430,112 q8,2 8,10", stroke=INK, stroke_width=1.6, fill="none", stroke_linecap="round")


K.reg("hand-elaris", "figures", "The hand that brings the cup: Elaris", 600, 300, ROW_S,
      "Elaris's long sea-froth hand in its brown sleeve, reaching in from the left edge of a page with the cup: what "
      "the reader sees when the player sips.", cup_hand)
K.reg("hand-ringed", "figures", "The other hand: older, with a brass ring", 600, 300, ROW_S,
      "The same reach and the same cup in an older, greyer hand with a brass ring on the second finger and a dark "
      "sleeve: the hand in The Other Hand, which brings a cup the player did not ask for. No face is shown.",
      cup_hand, ringed=True)


# ---- watcher shadows ----------------------------------------------------------------------------
def clay_edge(a):
    """The right-hand edge of a tablet, for a shadow to fall on."""
    a.rect(0, 0, a.w, a.h, fill="#2C241C")
    rough = a.roughen(6, .03)
    a.rect(-60, 30, a.w - 10, a.h - 60, rx=40, fill=a.radial([(0, K.CLAY_L, 1), (.7, K.CLAY, 1), (1, "#9A6A40", 1)], .3, .4, .9),
           filter=rough)
    K.grain(a, 0, 30, a.w - 70, a.h - 60, .3, .5)
    n = 7
    rh = (a.h - 120) / n
    for k in range(n):
        y = 60 + k * rh
        if k:
            a.line(0, y, a.w - 96, y, stroke=K.CLAY_D, stroke_width=2)
            a.line(0, y + 2.5, a.w - 96, y + 2.5, stroke=K.CLAY_L, stroke_width=1)
        for (x, yy, ang, s) in K.wedges_d(a, 10, a.w - 110, y + rh / 2, spread=14, s=.8):
            K.wedge(a, x, yy, ang, s)


def sh_xadra(a, S):
    # the head shaman: stooped, a cane with a feather, the well-post beside him
    a.path("M520,700 L520,250 C380,240 340,238 322,216 C296,214 276,190 280,160 C284,128 316,112 344,122 "
           "C366,96 400,104 520,110Z", **S)
    a.path("M300,700 L262,240 L276,236 L318,700Z", **S)                       # the cane
    a.path("M268,244 C240,236 214,246 196,268 C222,266 248,262 270,254Z", **S)  # its feather
    a.path("M150,700 L156,330 L184,330 L190,700Z", **S)                       # the well-post
    a.path("M140,330 h60 v-16 h-60Z", **S)


def sh_townsman(a, S):
    # a townsman of Hollin: a brimmed hat, a high collar, a folded umbrella held like a pointer
    a.path("M520,700 L520,270 C372,268 344,262 326,240 C304,236 292,214 296,190 L262,186 L262,172 L300,170 "
           "C300,136 316,116 520,112Z", **S)
    a.path("M330,250 L300,290 L340,300Z", **S)
    a.path("M360,420 L196,560 L188,548 L352,404Z", **S)
    a.path("M196,560 q-22,10 -18,-12", fill="none", stroke=S["fill"], stroke_width=8, stroke_linecap="round",
           filter=S.get("filter"), opacity=S.get("opacity"))


def sh_shaman(a, S):
    # a shaman: a feather headdress, one arm raised with a stylus, about to carve
    a.path("M520,700 L520,280 C370,276 336,266 322,240 C296,236 280,210 286,182 C290,160 306,146 326,144 "
           "L520,130Z", **S)
    for k in range(6):
        r = -70 + k * 22
        a.path("M0,0 C12,-30 10,-70 0,-96 C-10,-70 -12,-30 0,0Z", transform=f"translate(346 150) rotate({r})", **S)
    a.path("M340,330 L230,250 L160,262 L156,248 L232,224 L356,300Z", **S)
    a.path("M160,262 L112,300 L104,292 L150,250Z", **S)


def sh_pilgrim(a, S):
    # a pilgrim: the mask in profile, a staff with a lantern, a bell hanging from it
    a.path("M520,700 L520,260 C376,256 350,250 334,232 C312,228 296,208 298,180 C300,150 326,128 356,132 "
           "C380,120 400,124 520,124Z", **S)
    a.path("M300,186 L280,196 L296,206 L290,222 L308,226Z", **S)              # the mask's nose and chin
    a.path("M250,700 L236,150 L250,148 L270,700Z", **S)
    a.path("M214,150 h58 l-8,-56 h-42Z", **S)
    a.path("M243,94 q0,-24 -20,-26", fill="none", stroke=S["fill"], stroke_width=8, filter=S.get("filter"),
           opacity=S.get("opacity"))
    a.path("M252,290 l-26,34 h52Z", **S)


WATCHERS = [
    ("c2", "the head shaman at the well-post", sh_xadra,
     "A stooped shaman's shadow, cane and feather before him and the well-post beside, falling across the edge of the "
     "shrine-store tablet; it withdraws once for a player who saw the Well-Post."),
    ("c5", "a townsman of Hollin", sh_townsman,
     "A townsman's shadow in a brimmed hat and high collar, a folded umbrella held out like a pointer, falling across "
     "the edge of the Clerk's Charter."),
    ("c6", "a shaman with a stylus", sh_shaman,
     "A shaman's shadow in a feather headdress, one arm raised with a stylus to carve one more rule at the foot of the "
     "gods' tablet."),
    ("c7", "a masked pilgrim", sh_pilgrim,
     "A pilgrim's shadow, the mask in profile, a staff with its lantern and bell, falling across the edge of the "
     "Procession's vows."),
]


def watcher(a: Art, fn):
    clay_edge(a)
    bl = a.blur(4)
    soft = a.blur(26)
    a.open("g", opacity=.28, filter=soft, transform="translate(-126 14)")
    fn(a, dict(fill="#120C08"))
    a.close()
    a.open("g", opacity=.62, filter=bl, transform="translate(-96 0)")
    fn(a, dict(fill="#120C08"))
    a.close()
    # scrutiny tallies pressed at the foot
    for k in range(3):
        a.line(30 + k * 14, a.h - 52, 24 + k * 14, a.h - 34, stroke="#B22D1C", stroke_width=3.5, stroke_linecap="round")


for _cid, _who, _fn, _doc in WATCHERS:
    K.reg(f"watcher-{_cid}", "figures", f"Watcher shadow: {_who}", 400, 700, ROW_W, _doc, watcher, _fn)

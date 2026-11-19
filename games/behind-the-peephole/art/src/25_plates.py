"""The eye at the hole: room plates. The whole room as one still painted plane, 3.2 view-widths by 2.4, seen
only a lens-width at a time. Fisheye gouache: opaque paint, no line, practical lamps only. No figure: the
guest is a cut-out laid over the plate. Drawn by code until the Blender room set and its paint-over exist."""
from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "Room plates, gouache paint-over"
W, H = 1280, 960
FLOOR = 790


def _shell(a, room, carpet, carpet_l, carpet_d):
    """Wallpaper, picture rail, skirting, carpet, and the main door on the left wall."""
    r1 = a.roughen(4, 0.045)
    kit.wallpaper(a, 0, 0, W, FLOOR)
    kit.dabs(a, 0, 0, W, FLOOR, [kit.BOTTLE_L, "#3d6b4c", kit.BOTTLE_D], n=420, L=(8, 20), width=6, op=0.3, angle=1.57)
    a.rect(0, 148, W, 18, fill="#4a3420", filter=r1)
    a.rect(0, 770, W, 26, fill="#3a2716", filter=r1)
    a.rect(0, FLOOR, W, H - FLOOR, fill=carpet)
    for y in range(802, H, 22):
        a.rect(0, y, W, 6, fill=carpet_l, opacity=0.5)
    kit.dabs(a, 0, FLOOR, W, H - FLOOR, [carpet_l, carpet_d], n=260, L=(9, 22), width=6, op=0.4)
    # the main door, its panels, the brass knob and the light of the guest corridor under it
    a.rect(84, 244, 232, 548, fill="#2a180c", filter=r1)
    a.rect(92, 252, 216, 540, fill="#3b2414", filter=r1)
    for (x, y, w, h) in ((112, 282, 176, 216), (112, 532, 176, 228)):
        a.rect(x, y, w, h, fill="#2f1c0f", filter=r1)
        a.rect(x + 10, y + 10, w - 20, h - 20, fill="#402816", filter=r1)
    kit.dabs(a, 92, 252, 216, 540, ["#5a3820", "#2a180c"], n=90, L=(10, 24), width=5, op=0.35, angle=1.57)
    a.circle(270, 560, 11, fill=kit.brass_fill(a))
    a.rect(262, 546, 18, 6, fill=kit.BRASS_L)
    a.rect(94, 786, 212, 6, fill="#ffd98a", opacity=0.4, filter=a.blur(2))
    return r1


def _finish(a, lamp, pool, strength=0.5):
    a.rect(0, 0, W, H, fill=a.radial([(0, lamp, strength), (0.45, lamp, strength * 0.3), (1, lamp, 0)],
                                     cx=pool[0], cy=pool[1], r=0.42))
    kit.dabs(a, 0, 0, W, H, ["#e0a24a", "#140e08"], n=60, L=(8, 18), width=6, op=0.12)
    a.rect(0, 0, W, H, fill=a.radial([(0, "#000", 0), (0.7, "#000", 0.12), (1, "#000", 0.5)], r=0.75))


@asset(G, "plate-402", group="backdrops", title="Room plate, 402: the chain, the bed, the television", w=W, h=H, row=ROW)
def plate_402(a: Art):
    """Room 402 as a gouache plate: the main door and its chain plate on the left, a tall mirror, the bed under a
    green blanket, the desk with the television dark and the lamp lit, the night window with its blind, an armchair."""
    r1 = _shell(a, 402, "#7a4a24", "#8f5a2c", "#6a3d1e")
    lamp = kit.ROOMS[402][1]
    # the chain plate beside the door, and the tall mirror
    a.rect(338, 298, 30, 10, rx=3, fill=kit.BRASS)
    a.rect(366, 326, 158, 458, fill="#1e1810", filter=r1)
    a.rect(378, 338, 134, 434, fill=a.gradient([(0, "#39463f"), (0.6, "#26302b"), (1, "#1b211e")]), filter=r1)
    a.poly([(498, 344), (510, 344), (510, 766), (488, 766)], fill="#f2e2b0", opacity=0.55, filter=a.blur(3))
    # the desk, the television, the lamp
    a.rect(838, 558, 236, 22, fill="#5a3a1e", filter=r1)
    a.rect(852, 580, 18, 204, fill="#4a2f18", filter=r1)
    a.rect(1040, 580, 18, 204, fill="#4a2f18", filter=r1)
    a.rect(876, 396, 148, 118, rx=8, fill="#1f1c1a", filter=r1)
    a.rect(888, 408, 124, 94, rx=10, fill="#0d1014")
    a.poly([(896, 414), (940, 414), (910, 470), (896, 470)], fill="#fff", opacity=0.06)
    a.rect(930, 512, 40, 48, fill="#2a2826", filter=r1)
    a.rect(1046, 440, 8, 120, fill=kit.BRASS)
    a.poly([(1016, 442), (1084, 442), (1070, 388), (1030, 388)], fill=kit.BOTTLE_L, filter=r1)
    a.ellipse(1050, 446, 40, 8, fill="#fff3c8", opacity=0.75, filter=a.blur(3))
    # the bed: headboard, pillow, sheet, blanket
    a.rect(556, 466, 348, 198, fill="#4a2f1a", filter=r1)
    a.rect(572, 482, 316, 80, fill="#5a3a20", filter=r1)
    a.rect(536, 618, 388, 164, fill="#d9c7a3", filter=r1)
    a.rect(558, 598, 156, 50, rx=14, fill="#efe2c4", filter=r1)
    a.rect(536, 690, 388, 92, fill="#6c7d5c", filter=r1)
    a.rect(536, 684, 388, 14, fill="#e9dcbc", filter=r1)
    kit.dabs(a, 536, 600, 388, 180, ["#e9dcbc", "#bfae88", "#7d8f6b"], n=130, L=(7, 16), width=5, op=0.4)
    a.rect(536, 776, 388, 16, fill="#3a2716", filter=r1)
    # the night window and its blind
    a.rect(1092, 212, 166, 346, fill="#3a2716", filter=r1)
    a.rect(1100, 220, 150, 330, fill="#2b3540")
    a.rect(1100, 220, 150, 120, fill=kit.RIVER, opacity=0.6)
    for y in range(226, 548, 18):
        a.rect(1100, y, 150, 5, fill="#4c5a60", opacity=0.85)
    a.rect(1088, 548, 174, 14, fill="#5a3e22", filter=r1)
    # the armchair, near
    a.poly([(1280, 818), (1120, 858), (1100, 960), (1280, 960)], fill="#4b2a1a", filter=r1)
    kit.dabs(a, 1100, 820, 180, 140, ["#6a3d24", "#3a1e12"], n=40, L=(8, 18), width=6, op=0.4)
    a.rect(0, 0, W, H, fill=a.radial([(0, "#f6cf86", 0.5), (0.5, "#e0a24a", 0.14), (1, "#e0a24a", 0)], cx=0.82, cy=0.49, r=0.3))
    _finish(a, lamp, (0.74, 0.47), 0.12)


@asset(G, "plate-403", group="backdrops", title="Room plate, 403: the desk under the north window", w=W, h=H, row=ROW)
def plate_403(a: Art):
    """Room 403 as a gouache plate: the main door on the left, a bare stretch of green wall where pictures get
    pinned, the bed with a flat hard case under it, and on the right the desk under the north window, with a jar
    of brushes, a paint box, a lamp, and a small photograph propped against the wall."""
    r1 = _shell(a, 403, "#5a3a1e", "#6e4a28", "#4a2e16")
    lamp = kit.ROOMS[403][1]
    # the bed, plain, and the case under it
    a.rect(380, 520, 330, 150, fill="#4a2f1a", filter=r1)
    a.rect(360, 640, 370, 110, fill="#d9d2be", filter=r1)
    a.rect(378, 622, 140, 44, rx=12, fill="#efe9d8", filter=r1)
    a.rect(360, 700, 370, 52, fill="#57656b", filter=r1)
    kit.dabs(a, 360, 640, 370, 110, ["#e9e2cc", "#b9b29c", "#6f7c80"], n=90, L=(7, 16), width=5, op=0.4)
    a.rect(372, 752, 14, 40, fill="#2a180c")
    a.rect(704, 752, 14, 40, fill="#2a180c")
    a.rect(430, 760, 230, 30, rx=4, fill="#2a1d14", filter=r1)
    a.circle(442, 766, 5, fill=kit.BRASS)
    a.circle(648, 766, 5, fill=kit.BRASS)
    a.rect(520, 756, 50, 6, rx=3, fill="#15100c")
    # the desk under the window
    a.rect(820, 596, 380, 24, fill="#5a3a1e", filter=r1)
    a.rect(836, 620, 20, 170, fill="#4a2f18", filter=r1)
    a.rect(1164, 620, 20, 170, fill="#4a2f18", filter=r1)
    a.rect(880, 196, 300, 330, fill="#3a2716", filter=r1)
    a.rect(892, 208, 276, 306, fill="#2a3338")
    a.rect(892, 208, 276, 150, fill="#59666b", opacity=0.75)
    a.rect(892, 352, 276, 26, fill="#39464b")
    for k in range(7):
        a.rect(906 + k * 38, 384, 9, 96, fill=kit.AMBER_L, opacity=0.28, filter=a.blur(2.5))
    a.rect(1026, 208, 8, 306, fill="#3a2716")
    a.rect(872, 514, 316, 14, fill="#5a3e22", filter=r1)
    # the paint box, the jar of brushes, the water glass
    a.rect(900, 574, 120, 22, rx=3, fill="#2a2420", filter=r1)
    for k, c in enumerate(("#6f7c80", "#c98a3a", "#35503f", "#a3302a", "#efe6cf", "#2b3540")):
        a.rect(908 + k * 18, 579, 13, 10, fill=c)
    a.rect(1040, 546, 30, 50, rx=4, fill="#8fa3a8", opacity=0.75, filter=r1)
    for k, dx in enumerate((-10, -3, 5, 12)):
        a.line(1055 + dx * 0.4, 560, 1055 + dx * 1.6, 500 - k * 5, stroke="#c9a23a", stroke_width=3, stroke_linecap="round")
        a.circle(1055 + dx * 1.6, 498 - k * 5, 3.4, fill="#2a1e16")
    a.rect(1088, 566, 26, 30, rx=3, fill="#c7d2d2", opacity=0.6)
    # the lamp, and the photograph of her old teacher propped on the sill
    a.rect(1150, 470, 7, 126, fill=kit.BRASS)
    a.poly([(1120, 472), (1188, 472), (1176, 424), (1132, 424)], fill="#d9d2be", filter=r1)
    a.rect(940, 474, 46, 40, fill="#efe6cf", filter=r1)
    a.rect(945, 479, 36, 28, fill="#3b3a36")
    a.ellipse(963, 490, 6, 7, fill="#b9a88a")
    # the chair, pushed back
    a.rect(1010, 660, 96, 14, fill="#3a2414", filter=r1)
    a.rect(1016, 674, 10, 116, fill="#2f1c0f")
    a.rect(1090, 674, 10, 116, fill="#2f1c0f")
    a.rect(1092, 560, 12, 104, fill="#3a2414", filter=r1)
    a.rect(0, 0, W, H, fill=a.radial([(0, lamp, 0.42), (0.5, lamp, 0.12), (1, lamp, 0)], cx=0.8, cy=0.42, r=0.34))
    _finish(a, lamp, (0.8, 0.45), 0.14)

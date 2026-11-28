# Dressing notes: behind-the-peephole

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

7 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): timber_varnish 5, cloth_wall 4, brick 4, brass 3, ceiling 3, wood_floor 3, paint_gloss 2, stove_iron 2, marble 2, flagstone 2, stone_block 2, cobble 2, conc_wall 1, plaster 1, conc_wall_damp 1, plaster_old 1, fabric_fine 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): fog-grey, iron, river-grey.

Left as built (marks, voids, dark gaps or no fitting family): dark-window.

## P1 gates

59 stills in 7 places, every gate per still against its own before.

Gate checks: 1079 passed, 56 failed, 99 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 39 |
| G6b | light/dark spread | 6 |
| G8 | repeat pattern | 5 |
| G4b | darkest pixels | 4 |
| G3b | region colour | 1 |
| G11 | hero-prop light | 1 |

Every failing check (place, scene/still, gate, value, limit):

- back-office n6_back_office/camera: G7 1.65 (limit 2.0)
- back-office n6_back_office/overview: G6b 0.8981 (limit 0.8088)
- back-office n6_back_office/overview: G7 1.34 (limit 2.0)
- back-stair n3_stairwell/overview: G6b 0.3525 (limit 0.3111)
- back-stair n3_stairwell/overview: G8 0.859 (limit 0.2)
- back-stair n3_stairwell/player: G4b 11.67 (limit 19.66)
- back-stair n6_stairwell/player: G4b 12.39 (limit 20.59)
- lobby dawn_lobby/camera: G7 1.09 (limit 2.0)
- lobby dawn_lobby/overview: G6b 0.4353 (limit 0.4052)
- lobby dawn_lobby/overview: G7 1.21 (limit 2.0)
- lobby dawn_lobby/overview: G8 0.584 (limit 0.2)
- lobby end_sitter/camera: G7 1.48 (limit 2.0)
- lobby end_wrong_picture/camera: G7 1.29 (limit 2.0)
- lobby end_wrong_picture/camera: G8 0.864 (limit 0.2)
- lobby end_wrong_picture/player: G7 1.09 (limit 2.0)
- office n1_morning/player: G7 1.14 (limit 2.0)
- office n1_office/camera: G7 1.49 (limit 2.0)
- office n1_office/overview: G6b 0.5258 (limit 0.4684)
- office n1_office/overview: G7 1.28 (limit 2.0)
- office n1_office/player: G7 1.04 (limit 2.0)
- office n2_morning/player: G7 1.14 (limit 2.0)
- office n2_office/camera: G7 1.48 (limit 2.0)
- office n2_office/player: G7 1.02 (limit 2.0)
- office n2_seventh_bell/camera: G7 1.13 (limit 2.0)
- office n2_seventh_bell/player: G7 1.17 (limit 2.0)
- office n3_morning/player: G7 1.14 (limit 2.0)
- office n3_office/camera: G7 1.51 (limit 2.0)
- office n3_office/player: G7 1.03 (limit 2.0)
- office n3_tea/camera: G7 1.69 (limit 2.0)
- office n3_tea/player: G7 1.6 (limit 2.0)
- office n4_morning/player: G7 1.13 (limit 2.0)
- office n4_office/camera: G7 1.49 (limit 2.0)
- office n4_office/player: G7 1.04 (limit 2.0)
- office n5_morning/player: G7 1.13 (limit 2.0)
- office n5_office/camera: G7 1.5 (limit 2.0)
- office n5_office/player: G7 1.03 (limit 2.0)
- office n6_morning/player: G7 1.13 (limit 2.0)
- office n6_office/camera: G7 1.48 (limit 2.0)
- office n6_office/player: G7 1.03 (limit 2.0)
- office n7_office/camera: G7 1.52 (limit 2.0)
- office n7_office/player: G7 1.03 (limit 2.0)
- office n7_your_door/camera: G7 1.38 (limit 2.0)
- office n7_your_door/player: G7 1.3 (limit 2.0)
- river-wall end_open_door/camera: G4b 24.2 (limit 30.84)
- river-wall end_open_door/player: G7 1.61 (limit 2.0)
- river-wall end_open_door/player: G8 0.832 (limit 0.2)
- staff-alley n1_arrival/camera: G8 0.503 (limit 0.2)
- staff-alley n1_arrival/overview: G6b 0.2291 (limit 0.1941)
- staff-alley n1_arrival/player: G4b 54.72 (limit 63.78)
- valet-passage end_under_door/camera: G3b 12.73 (limit 6.0)
- valet-passage end_under_door/camera: G11 0.3094 (limit 0.08262)
- valet-passage end_under_door/player: G7 1.3 (limit 2.0)
- valet-passage n1_passage/camera: G7 1.33 (limit 2.0)
- valet-passage n1_passage/overview: G6b 0.3729 (limit 0.3341)
- valet-passage n1_passage/overview: G7 1.37 (limit 2.0)
- valet-passage n1_passage/player: G7 1.34 (limit 2.0)

## P2 gates (atmosphere and skies; before = the P1 render)

3 stills in 1 places, every gate per still against its own before.

Gate checks: 55 passed, 0 failed, 6 not applicable.

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2 is a first cut: sky plates and faint outdoor haze only; no dust, shafts, rain, snow, flames or water yet.
- Half-size look renders; the full-size pass is P7.

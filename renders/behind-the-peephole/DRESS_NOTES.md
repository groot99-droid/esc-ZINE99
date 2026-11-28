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

Gate checks: 1089 passed, 46 failed, 99 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 30 |
| G6b | light/dark spread | 6 |
| G8 | repeat pattern | 4 |
| G4b | darkest pixels | 4 |
| G3b | region colour | 1 |
| G11 | hero-prop light | 1 |

Every failing check (place, scene/still, gate, value, limit):

- back-office n6_back_office/camera: G7 1.59 (limit 1.643)
- back-office n6_back_office/overview: G6b 0.8978 (limit 0.8088)
- back-office n6_back_office/overview: G7 1.17 (limit 1.612)
- back-stair n3_stairwell/overview: G6b 0.3525 (limit 0.3111)
- back-stair n3_stairwell/overview: G8 0.859 (limit 0.2)
- back-stair n3_stairwell/player: G4b 11.67 (limit 19.66)
- back-stair n6_stairwell/player: G4b 12.39 (limit 20.59)
- lobby dawn_lobby/camera: G7 1.09 (limit 1.734)
- lobby dawn_lobby/overview: G6b 0.4353 (limit 0.4052)
- lobby dawn_lobby/overview: G7 1.21 (limit 1.692)
- lobby dawn_lobby/overview: G8 0.584 (limit 0.2)
- lobby end_sitter/camera: G7 1.48 (limit 1.578)
- lobby end_wrong_picture/camera: G7 1.29 (limit 1.697)
- lobby end_wrong_picture/camera: G8 0.864 (limit 0.2)
- lobby end_wrong_picture/player: G7 1.09 (limit 1.676)
- office n1_morning/player: G7 1.14 (limit 1.5)
- office n1_office/overview: G6b 0.5251 (limit 0.4684)
- office n1_office/overview: G7 1.09 (limit 1.577)
- office n1_office/player: G7 1.04 (limit 1.5)
- office n2_morning/player: G7 1.14 (limit 1.5)
- office n2_office/player: G7 1.02 (limit 1.5)
- office n2_seventh_bell/camera: G7 1.13 (limit 1.5)
- office n2_seventh_bell/player: G7 1.17 (limit 1.5)
- office n3_morning/player: G7 1.14 (limit 1.5)
- office n3_office/player: G7 1.03 (limit 1.5)
- office n4_morning/player: G7 1.13 (limit 1.5)
- office n4_office/player: G7 1.04 (limit 1.5)
- office n5_morning/player: G7 1.13 (limit 1.5)
- office n5_office/player: G7 1.03 (limit 1.5)
- office n6_morning/player: G7 1.13 (limit 1.5)
- office n6_office/player: G7 1.03 (limit 1.5)
- office n7_office/player: G7 1.03 (limit 1.5)
- office n7_your_door/camera: G7 1.38 (limit 1.5)
- office n7_your_door/player: G7 1.3 (limit 1.5)
- river-wall end_open_door/camera: G4b 24.2 (limit 30.84)
- river-wall end_open_door/player: G7 1.62 (limit 2.0)
- river-wall end_open_door/player: G8 0.834 (limit 0.2)
- staff-alley n1_arrival/overview: G6b 0.228 (limit 0.1941)
- staff-alley n1_arrival/player: G4b 54.72 (limit 63.78)
- valet-passage end_under_door/camera: G3b 12.78 (limit 6.0)
- valet-passage end_under_door/camera: G11 0.3286 (limit 0.08262)
- valet-passage end_under_door/player: G7 1.3 (limit 1.5)
- valet-passage n1_passage/camera: G7 1.27 (limit 1.514)
- valet-passage n1_passage/overview: G6b 0.3729 (limit 0.3341)
- valet-passage n1_passage/overview: G7 1.32 (limit 1.514)
- valet-passage n1_passage/player: G7 1.34 (limit 1.502)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

6 stills in 2 places, every gate per still against its own before.

Gate checks: 110 passed, 2 failed, 12 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G6b | light/dark spread | 1 |
| G4b | darkest pixels | 1 |

Every failing check (place, scene/still, gate, value, limit):

- staff-alley n1_arrival/overview: G6b 0.2277 (limit 0.2052)
- staff-alley n1_arrival/player: G4b 51.48 (limit 52.72)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P6 gates (skirting and conduit kits; before = the P1 to P5 render)

56 stills in 6 places. Gate checks: 1015 passed, 7 failed, 151 not applicable (detail gain counted as n/a).

- back-office n6_back_office/overview: G6b 0.8978 (limit 0.808)
- back-stair n3_stairwell/overview: G6b 0.3523 (limit 0.3173)
- lobby dawn_lobby/overview: G6b 0.4353 (limit 0.3918)
- lobby end_sitter/player: G4b 36.69 (limit 42.8)
- office n1_office/overview: G6b 0.5251 (limit 0.4726)
- staff-alley n1_arrival/overview: G6b 0.2277 (limit 0.2049)
- valet-passage n1_passage/overview: G6b 0.3729 (limit 0.3356)

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

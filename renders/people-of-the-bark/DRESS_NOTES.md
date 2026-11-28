# Dressing notes: people-of-the-bark

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

10 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): boards_v 3, timber 3, path 2, plaster 1, ceiling 1, flagstone 1, wallpaper 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): copper-leaves, far-green, sky; P3 (vegetation): grass, leaf-green, lichen-lime, lichen-sage, tree-bark; P4 (rock, snow, ice): frost; P5 (per-game specials): bark-damp, bark-grey, bark-paper, bark-umber, home-bark, knot-tan.

Left as built (marks, voids, dark gaps or no fitting family): crack-dark.

## P1 gates

46 stills in 7 places, every gate per still against its own before.

Gate checks: 746 passed, 52 failed, 158 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 26 |
| G9 | texel density | 17 |
| G6b | light/dark spread | 5 |
| G3b | region colour | 4 |

Every failing check (place, scene/still, gate, value, limit):

- backyard c7_backyard/camera: G7 1.33 (limit 1.718)
- backyard c7_backyard/overview: G7 1.22 (limit 1.723)
- bark-face c6_ring/camera: G7 1.26 (limit 2.0)
- bark-face c6_ring/camera: G9 {'piece:splinter': 0.158} (limit [0.7, 2.0])
- bark-face c6_shadow/camera: G7 1.52 (limit 2.0)
- bark-face c6_shadow/camera: G9 {'piece:splinter': 0.118} (limit [0.7, 2.0])
- bark-face c6_stand/camera: G7 0.87 (limit 2.0)
- bark-face c6_stand/camera: G9 {'piece:splinter': 0.118} (limit [0.7, 2.0])
- bark-face c6_stand/overview: G6b 0.6609 (limit 0.5948)
- bark-face c6_stand/overview: G7 0.86 (limit 2.0)
- bark-face c6_stand/overview: G9 {'piece:splinter': 0.135} (limit [0.7, 2.0])
- bark-face c6_touch/camera: G7 1.61 (limit 2.0)
- bark-face c6_touch/camera: G9 {'piece:splinter': 0.158} (limit [0.7, 2.0])
- first-ring-temple c2_temple/camera: G7 1.56 (limit 2.0)
- first-ring-temple c2_temple/player: G3b 8.51 (limit 6.0)
- first-ring-temple c2_temple/player: G7 1.56 (limit 2.0)
- highridge c1_city_dawn/overview: G7 1.52 (limit 2.0)
- highridge c1_city_dawn/overview: G9 {'piece:hall-splinter': 0.141} (limit [0.7, 2.0])
- highridge c1_city_year/camera: G6b 0.3078 (limit 0.316)
- highridge c1_city_year/camera: G7 0.6 (limit 2.0)
- highridge c1_city_year/camera: G9 {'piece:hall-splinter': 0.17} (limit [0.7, 2.0])
- highridge c2_city/camera: G6b 0.3243 (limit 0.3312)
- highridge c2_city/camera: G7 0.45 (limit 2.0)
- highridge c2_city/camera: G9 {'piece:hall-splinter': 0.127} (limit [0.7, 2.0])
- highridge c3_city/camera: G6b 0.2896 (limit 0.2972)
- highridge c3_city/camera: G7 0.42 (limit 2.0)
- highridge c3_city/camera: G9 {'piece:hall-splinter': 0.127} (limit [0.7, 2.0])
- highridge c4_city/camera: G7 1.16 (limit 2.0)
- highridge c5_city/camera: G7 1.02 (limit 2.0)
- highridge c5_city/camera: G9 {'piece:hall-splinter': 0.127} (limit [0.7, 2.0])
- highridge-square c3_thumb/camera: G7 1.13 (limit 2.0)
- highridge-square c3_thumb/camera: G9 {'piece:square-paving': 0.014} (limit [0.7, 2.0])
- highridge-square c5_count/camera: G7 1.04 (limit 2.0)
- highridge-square c5_count/overview: G7 1.0 (limit 2.0)
- highridge-square c5_count/overview: G9 {'piece:square-paving': 0.042} (limit [0.7, 2.0])
- lowridge c2_sorrel_wall/camera: G7 0.92 (limit 1.5)
- lowridge c5_lowridge/camera: G7 1.01 (limit 1.5)
- lowridge c5_lowridge/overview: G7 0.89 (limit 1.5)
- splinterwatch c1_battlements/camera: G3b 8.74 (limit 6.0)
- splinterwatch c1_battlements/camera: G6b 0.3321 (limit 0.3367)
- splinterwatch c1_battlements/camera: G7 0.98 (limit 2.0)
- splinterwatch c1_battlements/camera: G9 {'piece:splinter-body': 0.057, 'piece:splinter-tip': 0.056} (limit [0.7, 2.0])
- splinterwatch c1_battlements/overview: G3b 7.59 (limit 6.0)
- splinterwatch c1_battlements/overview: G7 1.42 (limit 2.0)
- splinterwatch c1_battlements/overview: G9 {'piece:splinter-body': 0.116, 'piece:splinter-tip': 0.115} (limit [0.7, 2.0])
- splinterwatch c1_battlements/player: G7 1.0 (limit 2.0)
- splinterwatch c1_battlements/player: G9 {'piece:splinter-tip': 0.003} (limit [0.7, 2.0])
- splinterwatch c3_wind/camera: G3b 7.24 (limit 6.0)
- splinterwatch c3_wind/camera: G7 1.23 (limit 2.0)
- splinterwatch c3_wind/camera: G9 {'piece:splinter-body': 0.106, 'piece:splinter-tip': 0.101} (limit [0.7, 2.0])
- splinterwatch c3_wind/player: G7 1.0 (limit 2.0)
- splinterwatch c3_wind/player: G9 {'piece:splinter-tip': 0.003} (limit [0.7, 2.0])

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

52 stills in 9 places, every gate per still against its own before.

Gate checks: 840 passed, 22 failed, 218 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G9 | texel density | 17 |
| G6b | light/dark spread | 2 |
| G4b | darkest pixels | 2 |
| G2 | tone | 1 |

Every failing check (place, scene/still, gate, value, limit):

- bark-face c6_ring/camera: G9 {'piece:splinter': 0.158} (limit [0.7, 2.0])
- bark-face c6_shadow/camera: G9 {'piece:splinter': 0.118} (limit [0.7, 2.0])
- bark-face c6_stand/camera: G9 {'piece:splinter': 0.118} (limit [0.7, 2.0])
- bark-face c6_stand/overview: G6b 0.6609 (limit 0.5948)
- bark-face c6_stand/overview: G9 {'piece:splinter': 0.135} (limit [0.7, 2.0])
- bark-face c6_touch/camera: G9 {'piece:splinter': 0.158} (limit [0.7, 2.0])
- highridge c1_city_dawn/overview: G9 {'piece:hall-splinter': 0.141} (limit [0.7, 2.0])
- highridge c1_city_year/camera: G9 {'piece:hall-splinter': 0.17} (limit [0.7, 2.0])
- highridge c2_city/camera: G9 {'piece:hall-splinter': 0.127} (limit [0.7, 2.0])
- highridge c3_city/camera: G9 {'piece:hall-splinter': 0.127} (limit [0.7, 2.0])
- highridge c5_city/camera: G9 {'piece:hall-splinter': 0.127} (limit [0.7, 2.0])
- highridge-square c3_thumb/camera: G9 {'piece:square-paving': 0.014} (limit [0.7, 2.0])
- highridge-square c5_count/overview: G9 {'piece:square-paving': 0.042} (limit [0.7, 2.0])
- knotholm-walk c5_temple/overview: G2 0.3023 (limit 0.12)
- knotholm-walk c5_temple/overview: G4b 0.14 (limit 1.57)
- knotholm-walk c5_temple/overview: G6b 0.448 (limit 0.3858)
- lowridge c5_lowridge/player: G4b 58.88 (limit 61.95)
- splinterwatch c1_battlements/camera: G9 {'piece:splinter-body': 0.057, 'piece:splinter-tip': 0.056} (limit [0.7, 2.0])
- splinterwatch c1_battlements/overview: G9 {'piece:splinter-body': 0.116, 'piece:splinter-tip': 0.115} (limit [0.7, 2.0])
- splinterwatch c1_battlements/player: G9 {'piece:splinter-tip': 0.003} (limit [0.7, 2.0])
- splinterwatch c3_wind/camera: G9 {'piece:splinter-body': 0.106, 'piece:splinter-tip': 0.101} (limit [0.7, 2.0])
- splinterwatch c3_wind/player: G9 {'piece:splinter-tip': 0.003} (limit [0.7, 2.0])

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

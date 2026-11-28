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

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

53 stills in 9 places. Gate checks: 831 passed, 134 failed, 138 not applicable (detail gain counted as n/a).

- bark-face c6_ring/camera: G3b 11.8 (limit 6.0)
- bark-face c6_ring/camera: G9 {'piece:ridge-1': 0.501, 'piece:ridge-2': 0.451, 'piece:ridg (limit [0.7, 2.0])
- bark-face c6_ring/player: G4b 14.18 (limit 20.31)
- bark-face c6_ring/player: G8 0.318 (limit 0.2)
- bark-face c6_ring/player: G9 {'piece:bark-slab': 0.023, 'piece:knot-6': 0.015} (limit [0.7, 2.0])
- bark-face c6_shadow/camera: G3b 10.09 (limit 6.0)
- bark-face c6_shadow/camera: G4a 1.404 (limit 1.169)
- bark-face c6_shadow/camera: G9 {'piece:ridge-1': 0.376, 'piece:ridge-2': 0.338, 'piece:ridg (limit [0.7, 2.0])
- bark-face c6_shadow/player: G4a 0.955 (limit 0.5)
- bark-face c6_shadow/player: G4b 5.43 (limit 10.71)
- bark-face c6_shadow/player: G8 0.338 (limit 0.2)
- bark-face c6_shadow/player: G9 {'piece:bark-slab': 0.017, 'piece:knot-6': 0.011} (limit [0.7, 2.0])
- bark-face c6_stand/camera: G2 0.166 (limit 0.12)
- bark-face c6_stand/camera: G3b 9.99 (limit 6.0)
- bark-face c6_stand/camera: G4a 32.044 (limit 26.661)
- bark-face c6_stand/camera: G9 {'piece:ridge-1': 0.376, 'piece:ridge-2': 0.338, 'piece:ridg (limit [0.7, 2.0])
- bark-face c6_stand/overview: G2 0.1798 (limit 0.12)
- bark-face c6_stand/overview: G3b 7.85 (limit 6.0)
- bark-face c6_stand/overview: G4a 37.452 (limit 30.628)
- bark-face c6_stand/overview: G6b 0.6623 (limit 0.5948)
- bark-face c6_stand/overview: G9 {'piece:knot-4': 0.414, 'piece:bark-slab': 0.406, 'piece:rid (limit [0.7, 2.0])
- bark-face c6_stand/overview: G11 0.0885 (limit 0.08262)
- bark-face c6_stand/player: G3b 6.41 (limit 6.0)
- bark-face c6_stand/player: G4a 3.426 (limit 0.5)
- bark-face c6_stand/player: G4b 4.7 (limit 11.96)
- bark-face c6_stand/player: G9 {'piece:bark-slab': 0.017, 'piece:knot-6': 0.011} (limit [0.7, 2.0])
- bark-face c6_touch/camera: G3b 9.49 (limit 6.0)
- bark-face c6_touch/camera: G4a 5.54 (limit 4.579)
- bark-face c6_touch/camera: G9 {'piece:ridge-1': 0.501, 'piece:ridge-2': 0.451, 'piece:ridg (limit [0.7, 2.0])
- bark-face c6_touch/player: G4a 10.627 (limit 1.536)
- bark-face c6_touch/player: G4b 1.78 (limit 5.05)
- bark-face c6_touch/player: G9 {'piece:bark-slab': 0.023, 'piece:knot-6': 0.015} (limit [0.7, 2.0])
- first-ring-temple c2_temple/camera: G3b 12.49 (limit 6.0)
- first-ring-temple c2_temple/camera: G8 0.368 (limit 0.2)
- first-ring-temple c2_temple/camera: G9 {'piece:floor': 0.042, 'piece:step-3': 0.046, 'piece:side-do (limit [0.7, 2.0])
- first-ring-temple c2_temple/overview: G3b 13.5 (limit 6.0)
- first-ring-temple c2_temple/overview: G8 0.348 (limit 0.2)
- first-ring-temple c2_temple/overview: G9 {'piece:floor': 0.045, 'piece:side-door': 0.082} (limit [0.7, 2.0])
- first-ring-temple c2_temple/player: G3b 8.08 (limit 6.0)
- first-ring-temple c2_temple/player: G9 {'piece:floor': 0.016} (limit [0.7, 2.0])
- highridge c1_city_dawn/camera: G4a 3.083 (limit 2.687)
- highridge c1_city_dawn/camera: G9 {'piece:terrace-row-1': 0.092, 'piece:bark-slab': 0.111, 'pi (limit [0.7, 2.0])
- highridge c1_city_dawn/overview: G4a 6.354 (limit 5.958)
- highridge c1_city_dawn/overview: G9 {'piece:terrace-row-1': 0.349, 'piece:bark-slab': 0.385, 'pi (limit [0.7, 2.0])
- highridge c1_city_dawn/player: G2 0.6584 (limit 0.12)
- highridge c1_city_dawn/player: G9 {'piece:terrace-row-1': 0.01} (limit [0.7, 2.0])
- highridge c1_city_year/camera: G8 0.361 (limit 0.2)
- highridge c1_city_year/camera: G9 {'piece:terrace-row-1': 0.413, 'piece:bark-slab': 0.463, 'pi (limit [0.7, 2.0])
- highridge c1_city_year/player: G2 0.4386 (limit 0.12)
- highridge c1_city_year/player: G3a 5.683 (limit 4.0)
- highridge c1_city_year/player: G9 {'piece:terrace-row-1': 0.023} (limit [0.7, 2.0])
- highridge c2_city/camera: G9 {'piece:terrace-row-1': 0.31, 'piece:bark-slab': 0.347, 'pie (limit [0.7, 2.0])
- highridge c2_city/player: G2 0.4418 (limit 0.12)
- highridge c2_city/player: G3a 5.883 (limit 4.0)
- highridge c2_city/player: G3b 6.17 (limit 6.0)
- highridge c2_city/player: G9 {'piece:terrace-row-1': 0.018} (limit [0.7, 2.0])
- highridge c2_rain/camera: G2 0.1988 (limit 0.12)
- highridge c2_rain/camera: G4a 8.18 (limit 2.664)
- highridge c2_rain/camera: G9 {'piece:ridge-1': 0.367, 'piece:bark-slab': 0.347, 'piece:ri (limit [0.7, 2.0])
- highridge c2_rain/player: G2 0.2525 (limit 0.12)
- highridge c2_rain/player: G3a 8.453 (limit 4.0)
- highridge c2_rain/player: G3b 8.95 (limit 6.0)
- highridge c2_rain/player: G8 0.435 (limit 0.2)
- highridge c2_rain/player: G9 {'piece:terrace-row-1': 0.018} (limit [0.7, 2.0])
- highridge c3_city/camera: G9 {'piece:terrace-row-1': 0.31, 'piece:bark-slab': 0.347, 'pie (limit [0.7, 2.0])
- highridge c3_city/player: G2 0.5148 (limit 0.12)
- highridge c3_city/player: G3a 4.44 (limit 4.0)
- highridge c3_city/player: G9 {'piece:terrace-row-1': 0.018} (limit [0.7, 2.0])
- highridge c4_city/camera: G9 {'piece:terrace-row-1': 0.351, 'piece:bark-slab': 0.388} (limit [0.7, 2.0])
- highridge c4_city/player: G2 0.5889 (limit 0.12)
- highridge c4_city/player: G3a 4.178 (limit 4.0)
- highridge c4_city/player: G9 {'piece:terrace-row-1': 0.018} (limit [0.7, 2.0])
- highridge c4_faceless/camera: G2 0.2617 (limit 0.12)
- highridge c4_faceless/camera: G4a 4.545 (limit 4.423)
- highridge c4_faceless/camera: G9 {'piece:terrace-row-2': 0.091, 'piece:bark-slab': 0.098} (limit [0.7, 2.0])
- highridge c4_faceless/player: G2 0.9497 (limit 0.12)
- highridge c4_faceless/player: G9 {'piece:terrace-row-1': 0.008} (limit [0.7, 2.0])
- highridge c5_city/camera: G9 {'piece:terrace-row-1': 0.31, 'piece:bark-slab': 0.347, 'pie (limit [0.7, 2.0])
- highridge c5_city/player: G2 0.4118 (limit 0.12)
- highridge c5_city/player: G3a 4.089 (limit 4.0)
- highridge c5_city/player: G9 {'piece:terrace-row-1': 0.018} (limit [0.7, 2.0])
- highridge-square c3_thumb/camera: G3b 8.19 (limit 6.0)
- highridge-square c3_thumb/camera: G4b 5.63 (limit 18.91)
- highridge-square c3_thumb/camera: G8 0.896 (limit 0.2)
- highridge-square c3_thumb/camera: G9 {'piece:square-ridge': 0.05, 'piece:square-paving': 0.014, ' (limit [0.7, 2.0])
- highridge-square c3_thumb/player: G4b 30.19 (limit 47.81)
- highridge-square c3_thumb/player: G8 0.766 (limit 0.2)
- highridge-square c3_thumb/player: G9 {'piece:platform-scroll': 0.006, 'piece:bark-slab': 0.016} (limit [0.7, 2.0])
- highridge-square c5_count/camera: G9 {'piece:square-ridge': 0.164, 'piece:ridge-west': 0.178, 'pi (limit [0.7, 2.0])
- highridge-square c5_count/overview: G3b 6.25 (limit 6.0)
- highridge-square c5_count/overview: G9 {'piece:square-ridge': 0.201, 'piece:square-paving': 0.042,  (limit [0.7, 2.0])
- knotholm-walk c5_temple/camera: G3b 6.38 (limit 6.0)
- knotholm-walk c5_temple/camera: G9 {'piece:path-1': 0.088, 'piece:path-2': 0.094, 'piece:bark-s (limit [0.7, 2.0])
- knotholm-walk c5_temple/overview: G6b 0.4422 (limit 0.4032)
- knotholm-walk c5_temple/overview: G9 {'piece:path-1': 0.204, 'piece:path-2': 0.226, 'piece:path-3 (limit [0.7, 2.0])
- knotholm-walk c5_temple/player: G4a 45.41 (limit 45.386)
- knotholm-walk c5_temple/player: G9 {'piece:path-2': 0.039} (limit [0.7, 2.0])
- lowridge c2_sorrel_wall/camera: G3b 8.59 (limit 6.0)
- lowridge c2_sorrel_wall/camera: G9 {'piece:bark-slab': 0.077} (limit [0.7, 2.0])
- lowridge c5_lowridge/camera: G2 0.1231 (limit 0.12)
- lowridge c5_lowridge/camera: G4a 1.712 (limit 1.557)
- lowridge c5_lowridge/camera: G9 {'piece:street-ledge': 0.235, 'piece:bark-slab': 0.242, 'pie (limit [0.7, 2.0])
- lowridge c5_lowridge/overview: G2 0.1735 (limit 0.12)
- lowridge c5_lowridge/overview: G3b 6.75 (limit 6.0)
- lowridge c5_lowridge/overview: G4a 4.417 (limit 1.672)
- lowridge c5_lowridge/overview: G6b 0.478 (limit 0.4032)
- lowridge c5_lowridge/overview: G9 {'piece:bark-slab': 0.249, 'piece:crack-road': 0.208, 'piece (limit [0.7, 2.0])
- shadow-edge c6_edge/camera: G3b 6.53 (limit 6.0)
- shadow-edge c6_edge/camera: G4a 1.163 (limit 0.507)
- shadow-edge c6_edge/camera: G4b 4.22 (limit 9.92)
- shadow-edge c6_edge/camera: G9 {'piece:ridge-5': 0.129, 'piece:foot-ledge': 0.131, 'piece:r (limit [0.7, 2.0])
- shadow-edge c6_edge/overview: G4a 0.845 (limit 0.5)
- shadow-edge c6_edge/overview: G4b 3.93 (limit 10.64)
- shadow-edge c6_edge/overview: G9 {'piece:bark-slab': 0.428, 'piece:ridge-4': 0.394, 'piece:ri (limit [0.7, 2.0])
- shadow-edge c6_edge/player: G2 0.3207 (limit 0.12)
- shadow-edge c6_edge/player: G3a 6.526 (limit 4.0)
- shadow-edge c6_edge/player: G3b 13.84 (limit 6.0)
- shadow-edge c6_edge/player: G4b 15.35 (limit 57.19)
- shadow-edge c6_edge/player: G8 0.89 (limit 0.2)
- shadow-edge c6_edge/player: G9 {'piece:foot-ledge': 0.019, 'piece:ridge-6': 0.016, 'piece:b (limit [0.7, 2.0])
- splinterwatch c1_battlements/camera: G3b 8.24 (limit 6.0)
- splinterwatch c1_battlements/camera: G9 {'piece:palisade': 0.152, 'piece:splinter-body': 0.057, 'pie (limit [0.7, 2.0])
- splinterwatch c1_battlements/overview: G3b 6.93 (limit 6.0)
- splinterwatch c1_battlements/overview: G9 {'piece:palisade': 0.307, 'piece:splinter-body': 0.116, 'pie (limit [0.7, 2.0])
- splinterwatch c1_battlements/player: G9 {'piece:splinter-tip': 0.003} (limit [0.7, 2.0])
- splinterwatch c3_wind/camera: G2 0.1589 (limit 0.12)
- splinterwatch c3_wind/camera: G4a 2.715 (limit 1.689)
- splinterwatch c3_wind/camera: G9 {'piece:splinter-body': 0.106, 'piece:palisade': 0.272, 'pie (limit [0.7, 2.0])
- splinterwatch c3_wind/player: G9 {'piece:splinter-tip': 0.003} (limit [0.7, 2.0])
- the-branch c4_branch/camera: G2 0.1786 (limit 0.12)
- the-branch c4_branch/camera: G4b 15.07 (limit 19.27)
- the-branch c4_branch/camera: G9 {'piece:branch': 0.129} (limit [0.7, 2.0])
- the-branch c4_branch/overview: G9 {'piece:branch': 0.198, 'piece:listening-knot': 0.912} (limit [0.7, 2.0])
- the-branch c4_branch/player: G9 {'piece:branch': 0.025, 'piece:listening-knot': 0.758} (limit [0.7, 2.0])

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

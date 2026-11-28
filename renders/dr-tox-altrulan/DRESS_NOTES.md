# Dressing notes: dr-tox-altrulan

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

4 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): glass 3, stone_block 3, plaster 2, path 1, asphalt 1, painted_steel 1, conc_wall 1, conc_floor 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): water; P3 (vegetation): fungus, vine; P4 (rock, snow, ice): rock.

## P1 gates

38 stills in 4 places, every gate per still against its own before.

Gate checks: 713 passed, 30 failed, 50 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 17 |
| G2 | tone | 4 |
| G8 | repeat pattern | 3 |
| G4a | dark area | 2 |
| G11 | hero-prop light | 2 |
| G3a | frame colour | 2 |

Every failing check (place, scene/still, gate, value, limit):

- glass-mountains s3_mountains_climb/camera: G7 1.1 (limit 2.0)
- glass-mountains s3_mountains_foot/camera: G7 1.87 (limit 2.0)
- glass-mountains s3_mountains_foot/overview: G7 1.04 (limit 2.0)
- glass-mountains s3_summit_night/camera: G4a 10.673 (limit 9.581)
- glass-mountains s3_summit_night/player: G4a 17.401 (limit 16.39)
- light-bringers-shrine s3_end_stamp/camera: G7 1.12 (limit 2.0)
- light-bringers-shrine s3_shrine_altar/camera: G2 0.1396 (limit 0.12)
- light-bringers-shrine s3_shrine_altar/camera: G7 1.09 (limit 1.5)
- light-bringers-shrine s3_shrine_altar/camera: G11 0.1334 (limit 0.08262)
- light-bringers-shrine s3_shrine_altar/player: G2 0.1477 (limit 0.12)
- light-bringers-shrine s3_shrine_altar/player: G7 1.12 (limit 1.5)
- light-bringers-shrine s3_shrine_altar/player: G11 0.1458 (limit 0.08262)
- light-bringers-shrine s3_shrine_book/camera: G2 0.122 (limit 0.12)
- light-bringers-shrine s3_shrine_book/player: G2 0.1349 (limit 0.12)
- light-bringers-shrine s3_shrine_book/player: G8 0.329 (limit 0.2)
- light-bringers-shrine s3_shrine_door/camera: G7 1.17 (limit 2.0)
- light-bringers-shrine s3_shrine_door/player: G7 1.59 (limit 2.0)
- light-bringers-shrine s3_shrine_drum/camera: G3a 4.182 (limit 4.0)
- light-bringers-shrine s3_shrine_drum/camera: G7 1.48 (limit 1.5)
- light-bringers-shrine s3_shrine_drum/overview: G7 1.36 (limit 2.0)
- light-bringers-shrine s3_shrine_drum/player: G3a 4.087 (limit 4.0)
- light-bringers-shrine s3_shrine_drum/player: G7 1.32 (limit 1.5)
- metabolic-city s3_city_gate/camera: G7 1.71 (limit 2.0)
- snakehead-holy-site s3_cave_corridor/camera: G8 0.41 (limit 0.2)
- snakehead-holy-site s3_cave_corridor/player: G8 0.401 (limit 0.2)
- snakehead-holy-site s3_cave_store/camera: G7 1.0 (limit 2.0)
- snakehead-holy-site s3_cave_store/player: G7 0.87 (limit 2.0)
- snakehead-holy-site s3_cave_tank/overview: G7 1.11 (limit 2.0)
- snakehead-holy-site s3_end_last_toad/camera: G7 1.0 (limit 2.0)
- snakehead-holy-site s3_end_two_readings/camera: G7 1.79 (limit 2.0)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

22 stills in 2 places, every gate per still against its own before.

Gate checks: 405 passed, 3 failed, 54 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4a | dark area | 3 |

Every failing check (place, scene/still, gate, value, limit):

- glass-mountains s3_summit_night/camera: G4a 15.227 (limit 11.173)
- glass-mountains s3_summit_night/player: G4a 23.469 (limit 17.901)
- light-bringers-shrine s3_end_stamp/camera: G4a 16.855 (limit 16.497)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P3 gates (outdoor and forest kit; before = the P1 and P2b render)

22 stills in 2 places. Gate checks: 408 passed, 4 failed, 50 not applicable.
G7 (detail gain) is counted as not applicable: it averages every dressed region, most of which P1 already dressed.

- glass-mountains s3_mountains_climb/player: G4b 40.56 (limit 41.49)
- glass-mountains s3_mountains_foot/camera: G5 1 (limit 0)
- light-bringers-shrine s3_end_stamp/camera: G11 0.0828 (limit 0.08262)
- light-bringers-shrine s3_shrine_door/camera: G8 0.383 (limit 0.2)

## P4 gates (rock, snow, frost and ice; before = the P1 to P3 render)

9 stills in 1 places. Gate checks: 173 passed, 7 failed, 9 not applicable.
G7 is listed but not meaningful for an incremental phase: it averages every dressed region, most unchanged since P1.

- snakehead-holy-site s3_cave_corridor/camera: G7 1.08 (limit 1.653)
- snakehead-holy-site s3_cave_corridor/player: G7 1.09 (limit 1.654)
- snakehead-holy-site s3_cave_tank/camera: G7 1.52 (limit 2.0)
- snakehead-holy-site s3_cave_tank/camera: G8 0.753 (limit 0.2)
- snakehead-holy-site s3_cave_tank/overview: G7 1.34 (limit 2.0)
- snakehead-holy-site s3_cave_tank/player: G7 1.51 (limit 2.0)
- snakehead-holy-site s3_end_two_readings/camera: G7 1.89 (limit 2.0)

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

31 stills in 3 places. Gate checks: 571 passed, 12 failed, 68 not applicable (detail gain counted as n/a).

- snakehead-holy-site s3_cave_corridor/camera: G8 0.41 (limit 0.2)
- snakehead-holy-site s3_cave_corridor/player: G8 0.401 (limit 0.2)
- snakehead-holy-site s3_cave_store/camera: G4a 6.962 (limit 6.277)
- snakehead-holy-site s3_cave_store/camera: G6b 0.3561 (limit 0.3782)
- snakehead-holy-site s3_cave_store/player: G2 0.1268 (limit 0.12)
- snakehead-holy-site s3_cave_store/player: G6b 0.4023 (limit 0.4308)
- snakehead-holy-site s3_cave_tank/camera: G8 0.868 (limit 0.2)
- snakehead-holy-site s3_cave_tank/overview: G8 0.466 (limit 0.2)
- snakehead-holy-site s3_cave_tank/player: G8 0.7 (limit 0.2)
- snakehead-holy-site s3_end_last_toad/camera: G6b 0.288 (limit 0.3038)
- snakehead-holy-site s3_end_two_readings/camera: G3b 7.2 (limit 6.0)
- snakehead-holy-site s3_end_two_readings/camera: G8 0.538 (limit 0.2)

## P6 gates (skirting and conduit kits; before = the P1 to P5 render)

9 stills in 1 places. Gate checks: 169 passed, 2 failed, 18 not applicable (detail gain counted as n/a).

- snakehead-holy-site s3_cave_corridor/camera: G8 0.412 (limit 0.2)
- snakehead-holy-site s3_cave_corridor/player: G8 0.404 (limit 0.2)

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

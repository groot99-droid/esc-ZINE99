# Dressing notes: dr-tox-fall

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

5 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): conc_wall_damp 2, conc_wall 2, glass 2, brick 1, gravel 1, asphalt 1, conc_floor 1, path 1, painted_steel 1, tile 1, glass_frosted 1, plaster_clean 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): city, sky; P4 (rock, snow, ice): rock.

## P1 gates

47 stills in 5 places, every gate per still against its own before.

Gate checks: 898 passed, 25 failed, 52 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 20 |
| G8 | repeat pattern | 4 |
| G2 | tone | 1 |

Every failing check (place, scene/still, gate, value, limit):

- bloom-district s3_bloom_morning/overview: G7 1.38 (limit 2.0)
- bloom-district s3_bloom_rooftop/camera: G2 0.1531 (limit 0.12)
- relief-hall s3_relief_dawn/camera: G7 1.27 (limit 2.0)
- relief-hall s3_relief_dawn/player: G7 1.39 (limit 2.0)
- relief-hall s3_relief_queue/camera: G7 1.15 (limit 2.0)
- relief-hall s3_relief_queue/overview: G7 1.15 (limit 2.0)
- relief-hall s3_relief_queue/overview: G8 0.588 (limit 0.2)
- relief-hall s3_relief_queue/player: G7 1.14 (limit 2.0)
- relief-hall s3_relief_standoff/camera: G7 1.28 (limit 2.0)
- relief-hall s3_relief_standoff/camera: G8 0.516 (limit 0.2)
- relief-hall s3_relief_standoff/player: G7 1.22 (limit 2.0)
- relief-hall s3_relief_standoff/player: G8 0.506 (limit 0.2)
- salvage-settlement s3_settlement_day/overview: G7 1.84 (limit 2.0)
- salvage-settlement s3_settlement_raid/camera: G7 1.25 (limit 2.0)
- snakehead-fortress s3_fortress_bench/camera: G7 1.11 (limit 2.0)
- snakehead-fortress s3_fortress_bench/player: G7 1.63 (limit 2.0)
- snakehead-fortress s3_fortress_following/camera: G7 1.14 (limit 2.0)
- snakehead-fortress s3_fortress_following/player: G7 1.22 (limit 2.0)
- snakehead-fortress s3_fortress_lamp/camera: G7 1.19 (limit 2.0)
- snakehead-fortress s3_fortress_lamp/overview: G7 1.03 (limit 2.0)
- snakehead-fortress s3_fortress_lamp/player: G7 1.23 (limit 2.0)
- snakehead-fortress s3_fortress_rite/camera: G7 1.29 (limit 2.0)
- snakehead-fortress s3_fortress_rite/player: G7 1.27 (limit 2.0)
- spire-gala s3_gala_bond/player: G7 2.0 (limit 2.0)
- spire-gala s3_gala_floor/overview: G8 0.208 (limit 0.2)

## P2 gates (atmosphere and skies; before = the P1 render)

16 stills in 2 places, every gate per still against its own before.

Gate checks: 298 passed, 0 failed, 32 not applicable.

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2 is a first cut: sky plates and faint outdoor haze only; no dust, shafts, rain, snow, flames or water yet.
- Half-size look renders; the full-size pass is P7.

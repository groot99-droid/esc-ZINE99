# Dressing notes: dr-tox-fall

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

5 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): conc_wall_damp 2, conc_wall 2, glass 2, brick 1, gravel 1, asphalt 1, conc_floor 1, path 1, painted_steel 1, tile 1, glass_frosted 1, plaster_clean 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): city, sky; P4 (rock, snow, ice): rock.

## P1 gates

47 stills in 5 places, every gate per still against its own before.

Gate checks: 899 passed, 24 failed, 52 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 19 |
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
- spire-gala s3_gala_floor/overview: G8 0.208 (limit 0.2)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

29 stills in 3 places, every gate per still against its own before.

Gate checks: 539 passed, 1 failed, 62 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G11 | hero-prop light | 1 |

Every failing check (place, scene/still, gate, value, limit):

- bloom-district s3_bloom_after/player: G11 0.0829 (limit 0.08262)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P4 gates (rock, snow, frost and ice; before = the P1 to P3 render)

22 stills in 2 places. Gate checks: 415 passed, 18 failed, 24 not applicable.
G7 is listed but not meaningful for an incremental phase: it averages every dressed region, most unchanged since P1.

- salvage-settlement s3_settlement_day/camera: G7 1.0 (limit 2.0)
- salvage-settlement s3_settlement_day/overview: G7 1.0 (limit 2.0)
- salvage-settlement s3_settlement_day/player: G7 1.0 (limit 2.0)
- salvage-settlement s3_settlement_haze/camera: G7 1.0 (limit 2.0)
- salvage-settlement s3_settlement_haze/player: G7 1.0 (limit 2.0)
- salvage-settlement s3_settlement_lost/camera: G7 1.0 (limit 2.0)
- salvage-settlement s3_settlement_lost/player: G7 1.0 (limit 2.0)
- salvage-settlement s3_settlement_raid/camera: G7 1.0 (limit 2.0)
- salvage-settlement s3_settlement_raid/player: G7 1.0 (limit 2.0)
- snakehead-fortress s3_fortress_bench/camera: G7 1.0 (limit 2.0)
- snakehead-fortress s3_fortress_bench/player: G7 1.0 (limit 2.0)
- snakehead-fortress s3_fortress_following/camera: G7 1.24 (limit 2.0)
- snakehead-fortress s3_fortress_following/player: G7 1.44 (limit 2.0)
- snakehead-fortress s3_fortress_lamp/camera: G7 1.0 (limit 2.0)
- snakehead-fortress s3_fortress_lamp/overview: G7 1.0 (limit 2.0)
- snakehead-fortress s3_fortress_lamp/player: G7 1.0 (limit 2.0)
- snakehead-fortress s3_fortress_workshop/camera: G7 1.0 (limit 2.0)
- snakehead-fortress s3_fortress_workshop/player: G7 1.0 (limit 2.0)

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

22 stills in 2 places. Gate checks: 402 passed, 9 failed, 46 not applicable (detail gain counted as n/a).

- salvage-settlement s3_settlement_day/overview: G3b 10.13 (limit 6.0)
- snakehead-fortress s3_fortress_clinic/camera: G6b 0.4513 (limit 0.4675)
- snakehead-fortress s3_fortress_clinic/camera: G10b piece:cavern-floor (limit piece:floor)
- snakehead-fortress s3_fortress_clinic/camera: G11 0.0883 (limit 0.08262)
- snakehead-fortress s3_fortress_following/camera: G8 0.897 (limit 0.2)
- snakehead-fortress s3_fortress_following/player: G8 0.816 (limit 0.2)
- snakehead-fortress s3_fortress_rite/camera: G3b 7.73 (limit 6.0)
- snakehead-fortress s3_fortress_rite/player: G3b 7.87 (limit 6.0)
- snakehead-fortress s3_fortress_rite/player: G8 0.826 (limit 0.2)

## P6 gates (skirting and conduit kits; before = the P1 to P5 render)

31 stills in 3 places. Gate checks: 576 passed, 5 failed, 64 not applicable (detail gain counted as n/a).

- relief-hall s3_relief_dawn/player: G8 0.44 (limit 0.2)
- relief-hall s3_relief_queue/overview: G8 0.451 (limit 0.2)
- relief-hall s3_relief_queue/player: G8 1.003 (limit 0.2)
- spire-gala s3_gala_annex/camera: G8 0.458 (limit 0.2)
- spire-gala s3_gala_annex/player: G8 0.684 (limit 0.2)

## P6b gates (fixture bodies, bookshelf bays; before = the P1 to P6 render)

31 stills in 3 places. Gate checks: 581 passed, 0 failed, 64 not applicable (detail gain counted as n/a).


## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

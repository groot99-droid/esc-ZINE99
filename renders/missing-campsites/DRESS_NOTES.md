# Dressing notes: missing-campsites

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

12 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): gravel 8, timber 6, earth 5, wood_floor 3, leather 3, ceiling 2, plaster 2, car_paint 2, glass 2, asphalt 2, boards_v 2, paper 1, timber_varnish 1, conc_floor 1, corrugated 1, paint_gloss 1, fabric_fine 1, plaster_old 1, stone_block 1, fabric 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): asphalt, conifer, creek, pearl, still-water; P3 (vegetation): clean-trunk, conifer, cool-grass, dry-grass, grass-faded, trunk; P4 (rock, snow, ice): rock.

Left as built (marks, voids, dark gaps or no fitting family): car-body, cool-green, screen.

## P1 gates

49 stills in 11 places, every gate per still against its own before.

Gate checks: 927 passed, 32 failed, 63 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 14 |
| G8 | repeat pattern | 9 |
| G4b | darkest pixels | 4 |
| G6b | light/dark spread | 2 |
| G5 | colour specks | 1 |
| G3b | region colour | 1 |
| G9 | texel density | 1 |

Every failing check (place, scene/still, gate, value, limit):

- creek-trail creek_trail/overview: G7 1.49 (limit 2.0)
- entrance-booth booth_day1/camera: G8 0.641 (limit 0.2)
- entrance-booth booth_day1/overview: G7 1.74 (limit 2.0)
- entrance-booth booth_day1/player: G8 0.641 (limit 0.2)
- entrance-booth booth_day2/camera: G8 0.833 (limit 0.2)
- entrance-booth supper_for_two/camera: G4b 16.27 (limit 25.13)
- entrance-booth supper_for_two/player: G4b 16.34 (limit 21.84)
- fire-ring campfire_night1/overview: G6b 0.7605 (limit 0.6945)
- fire-ring campfire_night1/overview: G7 1.17 (limit 2.0)
- fire-ring campfire_night2/camera: G5 2 (limit 1)
- five-sites channel_two/camera: G7 0.94 (limit 2.0)
- five-sites channel_two/player: G7 1.76 (limit 2.0)
- gravel-clearing gravel_morning/camera: G7 1.0 (limit 2.0)
- gravel-clearing gravel_morning/overview: G7 0.97 (limit 2.0)
- gravel-clearing gravel_morning/player: G7 1.0 (limit 2.0)
- school-hall recital/camera: G7 1.32 (limit 1.787)
- school-hall recital/overview: G6b 0.6083 (limit 0.5475)
- school-hall recital/overview: G7 1.16 (limit 1.809)
- school-hall recital/player: G7 1.44 (limit 1.874)
- stairwell mothers_door/camera: G4b 32.12 (limit 41.9)
- stairwell mothers_door/overview: G8 0.216 (limit 0.2)
- stairwell mothers_door/player: G4b 39.83 (limit 47.32)
- tam-flat home_apartment/camera: G8 0.822 (limit 0.2)
- tam-flat home_apartment/overview: G8 0.969 (limit 0.2)
- tam-flat home_apartment/player: G7 1.31 (limit 1.585)
- tam-flat home_apartment/player: G8 0.86 (limit 0.2)
- van-interior drive_home/camera: G3b 20.88 (limit 6.0)
- van-interior drive_home/camera: G7 1.5 (limit 1.826)
- van-interior drive_home/camera: G8 0.941 (limit 0.2)
- van-interior drive_home/overview: G7 1.15 (limit 1.825)
- van-interior drive_home/overview: G8 1.011 (limit 0.2)
- van-interior drive_home/player: G9 {'piece:roof': 0.502} (limit [0.7, 2.0])

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

35 stills in 7 places, every gate per still against its own before.

Gate checks: 645 passed, 2 failed, 86 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G6b | light/dark spread | 1 |
| G2 | tone | 1 |

Every failing check (place, scene/still, gate, value, limit):

- fire-ring campfire_night1/overview: G6b 0.7633 (limit 0.6844)
- the-clearing the_clearing/overview: G2 0.1259 (limit 0.12)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P3 gates (outdoor and forest kit; before = the P1 and P2b render)

26 stills in 6 places. Gate checks: 465 passed, 22 failed, 59 not applicable.
G7 (detail gain) is counted as not applicable: it averages every dressed region, most of which P1 already dressed.

- creek-trail creek_trail/camera: G4b 11.43 (limit 14.28)
- creek-trail creek_trail/player: G4b 12.03 (limit 15.07)
- fire-ring campfire_night1/overview: G6b 0.7633 (limit 0.687)
- five-sites channel_two/player: G4a 39.59 (limit 39.59)
- five-sites dusk_choice/camera: G4a 4.216 (limit 4.008)
- five-sites dusk_choice/camera: G8 0.228 (limit 0.2)
- five-sites dusk_choice/player: G4a 4.26 (limit 4.038)
- five-sites fixed_sites_day1/camera: G8 0.563 (limit 0.2)
- five-sites fixed_sites_day1/overview: G11 0.3287 (limit 0.08262)
- five-sites fixed_sites_day1/player: G8 0.57 (limit 0.2)
- gravel-clearing gravel_morning/camera: G4b 13.07 (limit 13.71)
- gravel-clearing gravel_morning/camera: G11 0.1384 (limit 0.08262)
- gravel-clearing gravel_morning/overview: G4a 2.82 (limit 1.696)
- gravel-clearing gravel_morning/overview: G8 0.566 (limit 0.2)
- gravel-clearing gravel_morning/player: G4b 13.0 (limit 13.72)
- other-side-sites wrong_forest/camera: G4b 19.65 (limit 24.21)
- other-side-sites wrong_forest/overview: G4b 6.92 (limit 8.93)
- other-side-sites wrong_forest/player: G4b 19.57 (limit 25.2)
- the-clearing the_clearing/camera: G4b 21.63 (limit 42.06)
- the-clearing the_clearing/overview: G4a 0.934 (limit 0.603)
- the-clearing the_clearing/overview: G4b 3.07 (limit 5.86)
- the-clearing the_clearing/player: G4b 21.57 (limit 41.8)

## P4 gates (rock, snow, frost and ice; before = the P1 to P3 render)

6 stills in 2 places. Gate checks: 111 passed, 6 failed, 9 not applicable.
G7 is listed but not meaningful for an incremental phase: it averages every dressed region, most unchanged since P1.

- creek-trail creek_trail/camera: G7 1.0 (limit 2.0)
- creek-trail creek_trail/overview: G7 1.0 (limit 2.0)
- creek-trail creek_trail/player: G7 1.0 (limit 2.0)
- gravel-clearing gravel_morning/camera: G7 1.0 (limit 2.0)
- gravel-clearing gravel_morning/overview: G7 1.0 (limit 2.0)
- gravel-clearing gravel_morning/player: G7 1.0 (limit 2.0)

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

26 stills in 6 places. Gate checks: 486 passed, 1 failed, 59 not applicable (detail gain counted as n/a).

- fire-ring campfire_night1/overview: G6b 0.7633 (limit 0.687)

## P6 gates (skirting and conduit kits; before = the P1 to P5 render)

9 stills in 3 places. Gate checks: 164 passed, 5 failed, 20 not applicable (detail gain counted as n/a).

- school-hall recital/overview: G6b 0.6083 (limit 0.5475)
- school-hall recital/overview: G14 0.1649535161152107 (limit 0.06)
- stairwell mothers_door/camera: G4b 18.97 (limit 30.12)
- tam-flat home_apartment/overview: G8 0.943 (limit 0.2)
- tam-flat home_apartment/player: G8 0.801 (limit 0.2)

## P6b gates (fixture bodies, bookshelf bays; before = the P1 to P6 render)

9 stills in 3 places. Gate checks: 168 passed, 1 failed, 20 not applicable (detail gain counted as n/a).

- school-hall recital/overview: G6b 0.6086 (limit 0.5475)

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

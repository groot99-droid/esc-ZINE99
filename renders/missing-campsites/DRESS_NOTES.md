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
- school-hall recital/camera: G7 1.27 (limit 2.0)
- school-hall recital/overview: G6b 0.6086 (limit 0.5475)
- school-hall recital/overview: G7 1.17 (limit 2.0)
- school-hall recital/player: G7 1.34 (limit 2.0)
- stairwell mothers_door/camera: G4b 32.12 (limit 41.9)
- stairwell mothers_door/overview: G8 0.216 (limit 0.2)
- stairwell mothers_door/player: G4b 39.83 (limit 47.32)
- tam-flat home_apartment/camera: G8 0.82 (limit 0.2)
- tam-flat home_apartment/overview: G8 0.969 (limit 0.2)
- tam-flat home_apartment/player: G7 1.39 (limit 2.0)
- tam-flat home_apartment/player: G8 0.861 (limit 0.2)
- van-interior drive_home/camera: G3b 20.88 (limit 6.0)
- van-interior drive_home/camera: G7 1.5 (limit 2.0)
- van-interior drive_home/camera: G8 0.941 (limit 0.2)
- van-interior drive_home/overview: G7 1.15 (limit 2.0)
- van-interior drive_home/overview: G8 1.011 (limit 0.2)
- van-interior drive_home/player: G9 {'piece:roof': 0.502} (limit [0.7, 2.0])

## P2 gates (atmosphere and skies; before = the P1 render)

23 stills in 5 places, every gate per still against its own before.

Gate checks: 425 passed, 1 failed, 55 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- fire-ring campfire_night1/overview: G6b 0.7633 (limit 0.6844)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2 is a first cut: sky plates and faint outdoor haze only; no dust, shafts, rain, snow, flames or water yet.
- Half-size look renders; the full-size pass is P7.

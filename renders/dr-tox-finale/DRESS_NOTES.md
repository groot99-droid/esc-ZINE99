# Dressing notes: dr-tox-finale

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

5 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): conc_wall 4, glass 4, path 2, plaster 1, ceiling 1, conc_polished 1, plaster_clean 1, stone_block 1, metal_plate 1, steel_clean 1, painted_steel 1, asphalt 1, fabric 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): sky; P3 (vegetation): plant-light; P4 (rock, snow, ice): rock.

## P1 gates

48 stills in 5 places, every gate per still against its own before.

Gate checks: 873 passed, 30 failed, 83 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 20 |
| G8 | repeat pattern | 7 |
| G4a | dark area | 2 |
| G11 | hero-prop light | 1 |

Every failing check (place, scene/still, gate, value, limit):

- central-hub s3_first_word_core/camera: G7 0.92 (limit 2.0)
- central-hub s3_green_core/camera: G7 0.39 (limit 2.0)
- central-hub s3_hub_core/camera: G7 1.91 (limit 2.0)
- central-hub s3_hub_core/player: G7 1.75 (limit 2.0)
- central-hub s3_hub_gallery/camera: G7 0.95 (limit 2.0)
- central-hub s3_hub_gallery/camera: G8 0.223 (limit 0.2)
- central-hub s3_hub_gallery/overview: G7 0.95 (limit 2.0)
- central-hub s3_hub_gallery/player: G7 0.85 (limit 2.0)
- central-hub s3_reset_heart/camera: G7 1.12 (limit 2.0)
- central-hub s3_wall_outside/camera: G7 1.02 (limit 2.0)
- clinical-suite s3_clinical_suite/camera: G7 1.17 (limit 1.956)
- clinical-suite s3_clinical_suite/overview: G11 0.0875 (limit 0.08262)
- clinical-suite s3_clinical_suite/player: G7 1.27 (limit 1.849)
- final-arcology s3_arcology_plinth/camera: G7 1.45 (limit 2.0)
- final-arcology s3_arcology_plinth/overview: G7 1.25 (limit 2.0)
- final-arcology s3_atrium_inside/camera: G7 1.45 (limit 2.0)
- snakehead-overrun s3_overrun_after/camera: G8 0.312 (limit 0.2)
- snakehead-overrun s3_overrun_after/player: G8 0.295 (limit 0.2)
- snakehead-overrun s3_overrun_hall/camera: G8 0.261 (limit 0.2)
- snakehead-overrun s3_overrun_hall/player: G7 1.12 (limit 1.685)
- snakehead-overrun s3_overrun_hall/player: G8 0.269 (limit 0.2)
- the-march s3_march_camp/camera: G8 0.351 (limit 0.2)
- the-march s3_march_camp/player: G8 0.445 (limit 0.2)
- the-march s3_march_eve/camera: G4a 8.219 (limit 8.105)
- the-march s3_march_eve/player: G4a 8.137 (limit 8.068)
- the-march s3_march_front/camera: G7 0.97 (limit 1.969)
- the-march s3_peace_plain/camera: G7 1.05 (limit 1.989)
- the-march s3_perimeter_breach/camera: G7 0.91 (limit 1.993)
- the-march s3_perimeter_breach/player: G7 1.39 (limit 1.997)
- the-march s3_station_after/camera: G7 1.76 (limit 2.0)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

16 stills in 1 places, every gate per still against its own before.

Gate checks: 293 passed, 2 failed, 33 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4a | dark area | 2 |

Every failing check (place, scene/still, gate, value, limit):

- the-march s3_march_eve/camera: G4a 21.751 (limit 8.719)
- the-march s3_march_eve/player: G4a 21.621 (limit 8.637)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P4 gates (rock, snow, frost and ice; before = the P1 to P3 render)

9 stills in 1 places. Gate checks: 170 passed, 6 failed, 10 not applicable.
G7 is listed but not meaningful for an incremental phase: it averages every dressed region, most unchanged since P1.

- snakehead-overrun s3_overrun_after/camera: G7 1.27 (limit 1.762)
- snakehead-overrun s3_overrun_after/player: G7 1.41 (limit 1.875)
- snakehead-overrun s3_overrun_hall/camera: G8 0.804 (limit 0.2)
- snakehead-overrun s3_overrun_hall/overview: G7 1.22 (limit 1.983)
- snakehead-overrun s3_overrun_hall/overview: G8 0.517 (limit 0.2)
- snakehead-overrun s3_overrun_hall/player: G7 1.32 (limit 1.929)

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

9 stills in 1 places. Gate checks: 138 passed, 29 failed, 19 not applicable (detail gain counted as n/a).

- snakehead-overrun s3_overrun_after/camera: G2 0.1243 (limit 0.12)
- snakehead-overrun s3_overrun_after/camera: G3b 8.92 (limit 6.0)
- snakehead-overrun s3_overrun_after/camera: G4a 19.092 (limit 1.868)
- snakehead-overrun s3_overrun_after/player: G2 0.1272 (limit 0.12)
- snakehead-overrun s3_overrun_after/player: G3b 7.69 (limit 6.0)
- snakehead-overrun s3_overrun_after/player: G4a 22.258 (limit 6.141)
- snakehead-overrun s3_overrun_after/player: G6b 0.4056 (limit 0.422)
- snakehead-overrun s3_overrun_after/player: G8 0.728 (limit 0.2)
- snakehead-overrun s3_overrun_hall/camera: G2 0.2955 (limit 0.12)
- snakehead-overrun s3_overrun_hall/camera: G3a 5.292 (limit 4.0)
- snakehead-overrun s3_overrun_hall/camera: G3b 18.77 (limit 6.0)
- snakehead-overrun s3_overrun_hall/camera: G8 0.986 (limit 0.2)
- snakehead-overrun s3_overrun_hall/overview: G2 0.3088 (limit 0.12)
- snakehead-overrun s3_overrun_hall/overview: G3b 28.53 (limit 6.0)
- snakehead-overrun s3_overrun_hall/player: G2 0.5949 (limit 0.12)
- snakehead-overrun s3_overrun_hall/player: G3a 5.049 (limit 4.0)
- snakehead-overrun s3_overrun_hall/player: G3b 18.85 (limit 6.0)
- snakehead-overrun s3_overrun_hall/player: G8 1.008 (limit 0.2)
- snakehead-overrun s3_overrun_hall/player: G11 0.1456 (limit 0.08262)
- snakehead-overrun s3_snakehead_bench/camera: G4a 10.922 (limit 9.305)
- snakehead-overrun s3_snakehead_bench/player: G2 0.2095 (limit 0.12)
- snakehead-overrun s3_snakehead_bench/player: G4a 5.244 (limit 2.489)
- snakehead-overrun s3_snakehead_resin/camera: G2 0.1381 (limit 0.12)
- snakehead-overrun s3_snakehead_resin/camera: G4a 2.763 (limit 1.744)
- snakehead-overrun s3_snakehead_resin/camera: G4b 1.0 (limit 1.72)
- snakehead-overrun s3_snakehead_resin/camera: G6b 0.4244 (limit 0.4349)
- snakehead-overrun s3_snakehead_resin/player: G2 0.202 (limit 0.12)
- snakehead-overrun s3_snakehead_resin/player: G4a 53.509 (limit 43.419)
- snakehead-overrun s3_snakehead_resin/player: G6b 0.081 (limit 0.0867)

## P6 gates (skirting and conduit kits; before = the P1 to P5 render)

32 stills in 4 places. Gate checks: 577 passed, 2 failed, 79 not applicable (detail gain counted as n/a).

- clinical-suite s3_suite_printer/camera: G8 0.697 (limit 0.2)
- clinical-suite s3_suite_printer/player: G8 0.669 (limit 0.2)

## P6b gates (fixture bodies, bookshelf bays; before = the P1 to P6 render)

32 stills in 4 places. Gate checks: 579 passed, 0 failed, 79 not applicable (detail gain counted as n/a).


## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

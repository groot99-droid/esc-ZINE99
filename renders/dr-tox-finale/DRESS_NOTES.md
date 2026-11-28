# Dressing notes: dr-tox-finale

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

5 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): conc_wall 4, glass 4, path 2, plaster 1, ceiling 1, conc_polished 1, plaster_clean 1, stone_block 1, metal_plate 1, steel_clean 1, painted_steel 1, asphalt 1, fabric 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): sky; P3 (vegetation): plant-light; P4 (rock, snow, ice): rock.

## P1 gates

48 stills in 5 places, every gate per still against its own before.

Gate checks: 869 passed, 34 failed, 83 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 24 |
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
- clinical-suite s3_clinical_suite/camera: G7 1.17 (limit 2.0)
- clinical-suite s3_clinical_suite/overview: G7 1.81 (limit 2.0)
- clinical-suite s3_clinical_suite/overview: G11 0.0875 (limit 0.08262)
- clinical-suite s3_clinical_suite/player: G7 1.27 (limit 2.0)
- clinical-suite s3_suite_printer/camera: G7 1.55 (limit 2.0)
- clinical-suite s3_suite_printer/player: G7 1.62 (limit 2.0)
- final-arcology s3_arcology_plinth/camera: G7 1.45 (limit 2.0)
- final-arcology s3_arcology_plinth/overview: G7 1.25 (limit 2.0)
- final-arcology s3_atrium_inside/camera: G7 1.45 (limit 2.0)
- snakehead-overrun s3_overrun_after/camera: G8 0.312 (limit 0.2)
- snakehead-overrun s3_overrun_after/player: G7 1.76 (limit 2.0)
- snakehead-overrun s3_overrun_after/player: G8 0.295 (limit 0.2)
- snakehead-overrun s3_overrun_hall/camera: G8 0.261 (limit 0.2)
- snakehead-overrun s3_overrun_hall/player: G7 1.12 (limit 2.0)
- snakehead-overrun s3_overrun_hall/player: G8 0.269 (limit 0.2)
- the-march s3_march_camp/camera: G8 0.351 (limit 0.2)
- the-march s3_march_camp/player: G8 0.445 (limit 0.2)
- the-march s3_march_eve/camera: G4a 8.219 (limit 8.105)
- the-march s3_march_eve/player: G4a 8.137 (limit 8.068)
- the-march s3_march_front/camera: G7 0.97 (limit 2.0)
- the-march s3_peace_plain/camera: G7 1.05 (limit 2.0)
- the-march s3_perimeter_breach/camera: G7 0.91 (limit 2.0)
- the-march s3_perimeter_breach/player: G7 1.39 (limit 2.0)
- the-march s3_station_after/camera: G7 1.76 (limit 2.0)

## P2 gates (atmosphere and skies; before = the P1 render)

16 stills in 1 places, every gate per still against its own before.

Gate checks: 294 passed, 1 failed, 33 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4a | dark area | 1 |

Every failing check (place, scene/still, gate, value, limit):

- the-march s3_march_eve/player: G4a 9.643 (limit 8.637)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2 is a first cut: sky plates and faint outdoor haze only; no dust, shafts, rain, snow, flames or water yet.
- Half-size look renders; the full-size pass is P7.

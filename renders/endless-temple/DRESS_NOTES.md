# Dressing notes: endless-temple

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

15 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): timber_varnish 8, stone_block 6, plaster 6, mud_wall 4, thatch 4, path 3, wood_floor 2, sand 2, flagstone 2, timber 2, wood_deck 1, paint_gloss 1, cobble 1, stove_iron 1, ceiling 1, tile 1, paper 1, fabric 1, earth 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): blue-black, dusk-void, far-dunes, far-ridge, gutter-water, haze, mist, moon, void; P3 (vegetation): canopy, dead-wood, grey-grass, prickle; P4 (rock, snow, ice): frost, pale-cliff, rock; P5 (per-game specials): bleached-sand, book-spines, bruise-vine, dune-light, silver-sand, vellum, written-road.

Left as built (marks, voids, dark gaps or no fitting family): crack, hollow-shade, soot, wave-shadow.

## P1 gates

82 stills in 13 places, every gate per still against its own before.

Gate checks: 1529 passed, 45 failed, 141 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 21 |
| G3b | region colour | 9 |
| G8 | repeat pattern | 6 |
| G4b | darkest pixels | 6 |
| G6b | light/dark spread | 2 |
| G9 | texel density | 1 |

Every failing check (place, scene/still, gate, value, limit):

- clerk-office s3_clerk_office/camera: G8 0.518 (limit 0.2)
- clerk-office s3_clerk_office/player: G8 0.52 (limit 0.2)
- clerk-office s3_hollin_choice/camera: G7 1.59 (limit 2.0)
- clerk-office s3_hollin_choice/player: G7 1.07 (limit 2.0)
- deep-desert s3_herd_sighting/player: G7 0.91 (limit 2.0)
- elaris-room s3_room_morning/player: G7 1.97 (limit 2.0)
- father-camp s3_camp_mark_c6/camera: G7 1.87 (limit 2.0)
- father-camp s3_father_walk/player: G4b 28.11 (limit 36.09)
- pantry s3_ledger_turned/player: G7 1.26 (limit 2.0)
- pantry s3_pantry_c1/camera: G7 1.14 (limit 2.0)
- pantry s3_pantry_c1/overview: G7 1.06 (limit 2.0)
- pantry s3_pantry_c1/player: G7 0.97 (limit 2.0)
- pantry s3_pantry_c3/camera: G7 1.15 (limit 2.0)
- pantry s3_pantry_c3/player: G7 0.96 (limit 2.0)
- pantry s3_pantry_c8/camera: G7 1.07 (limit 2.0)
- pantry s3_pantry_c8/player: G7 1.07 (limit 2.0)
- procession-road s3_scribe_wagon/camera: G7 1.26 (limit 2.0)
- procession-road s3_scribe_wagon/player: G7 1.27 (limit 2.0)
- storyteller-hut e_returned/camera: G3b 6.68 (limit 6.0)
- storyteller-hut s3_circle/overview: G3b 6.56 (limit 6.0)
- storyteller-hut s3_village_return/player: G4b 33.24 (limit 38.59)
- storyteller-hut s3_village_return/player: G8 0.471 (limit 0.2)
- storyteller-hut s3_village_return/player: G9 {'piece:dome': 0.717, 'piece:door-lintel': 0.362} (limit [0.7, 2.0])
- temple-halls e_stayed/camera: G8 0.535 (limit 0.2)
- temple-halls s3_halls_c1/camera: G3b 9.06 (limit 6.0)
- temple-halls s3_halls_c1/overview: G3b 12.57 (limit 6.0)
- temple-halls s3_halls_c1/overview: G7 1.95 (limit 2.0)
- temple-halls s3_halls_c1/overview: G8 0.333 (limit 0.2)
- temple-halls s3_halls_c1/player: G3b 8.77 (limit 6.0)
- temple-halls s3_halls_c6/camera: G3b 9.27 (limit 6.0)
- temple-halls s3_halls_c6/player: G3b 8.93 (limit 6.0)
- temple-halls s3_last_cup/camera: G7 1.99 (limit 2.0)
- unlit-gallery s3_unlit_gallery/camera: G7 1.11 (limit 2.0)
- unlit-gallery s3_unlit_gallery/overview: G3b 10.25 (limit 6.0)
- unlit-gallery s3_unlit_gallery/overview: G6b 0.591 (limit 0.552)
- unlit-gallery s3_unlit_gallery/overview: G7 1.17 (limit 2.0)
- unlit-gallery s3_unlit_gallery/player: G7 1.75 (limit 2.0)
- village-well s3_well_post/camera: G3b 8.71 (limit 6.0)
- village-well s3_well_post/camera: G4b 16.55 (limit 16.7)
- village-well s3_well_post/overview: G7 1.27 (limit 2.0)
- village-well s3_well_post/player: G4b 15.57 (limit 19.85)
- walled-yard s3_seclusion/camera: G4b 30.91 (limit 39.52)
- walled-yard s3_seclusion/overview: G6b 0.1753 (limit 0.1416)
- walled-yard s3_seclusion/overview: G8 0.553 (limit 0.2)
- walled-yard s3_seclusion/player: G4b 31.06 (limit 39.52)

## P2 gates (atmosphere and skies; before = the P1 render)

31 stills in 5 places, every gate per still against its own before.

Gate checks: 520 passed, 5 failed, 121 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4b | darkest pixels | 4 |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- deep-desert s3_herd_sighting/camera: G4b 56.05 (limit 56.77)
- deep-desert s3_xandrix_back/camera: G4b 52.86 (limit 53.93)
- deep-desert s3_xandrix_back/player: G4b 52.86 (limit 53.93)
- father-camp s3_father_walk/camera: G4b 54.77 (limit 56.91)
- walled-yard s3_seclusion/overview: G6b 0.1743 (limit 0.1578)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2 is a first cut: sky plates and faint outdoor haze only; no dust, shafts, rain, snow, flames or water yet.
- Half-size look renders; the full-size pass is P7.

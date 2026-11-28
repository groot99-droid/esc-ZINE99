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

Gate checks: 1533 passed, 41 failed, 141 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 17 |
| G3b | region colour | 9 |
| G8 | repeat pattern | 6 |
| G4b | darkest pixels | 6 |
| G6b | light/dark spread | 2 |
| G9 | texel density | 1 |

Every failing check (place, scene/still, gate, value, limit):

- clerk-office s3_clerk_office/camera: G8 0.517 (limit 0.2)
- clerk-office s3_clerk_office/player: G8 0.521 (limit 0.2)
- clerk-office s3_hollin_choice/camera: G7 1.37 (limit 1.719)
- clerk-office s3_hollin_choice/player: G7 1.02 (limit 1.536)
- deep-desert s3_herd_sighting/player: G7 0.91 (limit 2.0)
- father-camp s3_camp_mark_c6/camera: G7 1.87 (limit 2.0)
- father-camp s3_father_walk/player: G4b 28.11 (limit 36.09)
- pantry s3_ledger_turned/player: G7 1.26 (limit 1.526)
- pantry s3_pantry_c1/camera: G7 1.14 (limit 1.557)
- pantry s3_pantry_c1/overview: G7 1.06 (limit 1.552)
- pantry s3_pantry_c1/player: G7 0.97 (limit 1.5)
- pantry s3_pantry_c3/camera: G7 1.15 (limit 1.557)
- pantry s3_pantry_c3/player: G7 0.96 (limit 1.5)
- pantry s3_pantry_c8/camera: G7 1.07 (limit 1.557)
- pantry s3_pantry_c8/player: G7 1.07 (limit 1.5)
- procession-road s3_scribe_wagon/camera: G7 1.26 (limit 1.5)
- procession-road s3_scribe_wagon/player: G7 1.27 (limit 1.5)
- storyteller-hut e_returned/camera: G3b 6.68 (limit 6.0)
- storyteller-hut s3_circle/overview: G3b 6.56 (limit 6.0)
- storyteller-hut s3_village_return/player: G4b 33.24 (limit 38.59)
- storyteller-hut s3_village_return/player: G8 0.471 (limit 0.2)
- storyteller-hut s3_village_return/player: G9 {'piece:dome': 0.717, 'piece:door-lintel': 0.362} (limit [0.7, 2.0])
- temple-halls e_stayed/camera: G8 0.535 (limit 0.2)
- temple-halls s3_halls_c1/camera: G3b 9.06 (limit 6.0)
- temple-halls s3_halls_c1/overview: G3b 12.57 (limit 6.0)
- temple-halls s3_halls_c1/overview: G8 0.333 (limit 0.2)
- temple-halls s3_halls_c1/player: G3b 8.77 (limit 6.0)
- temple-halls s3_halls_c6/camera: G3b 9.27 (limit 6.0)
- temple-halls s3_halls_c6/player: G3b 8.93 (limit 6.0)
- unlit-gallery s3_unlit_gallery/camera: G7 1.11 (limit 1.668)
- unlit-gallery s3_unlit_gallery/overview: G3b 10.25 (limit 6.0)
- unlit-gallery s3_unlit_gallery/overview: G6b 0.591 (limit 0.552)
- unlit-gallery s3_unlit_gallery/overview: G7 1.17 (limit 1.663)
- village-well s3_well_post/camera: G3b 8.71 (limit 6.0)
- village-well s3_well_post/camera: G4b 16.55 (limit 16.7)
- village-well s3_well_post/overview: G7 1.27 (limit 1.955)
- village-well s3_well_post/player: G4b 15.57 (limit 19.85)
- walled-yard s3_seclusion/camera: G4b 30.91 (limit 39.52)
- walled-yard s3_seclusion/overview: G6b 0.1753 (limit 0.1416)
- walled-yard s3_seclusion/overview: G8 0.553 (limit 0.2)
- walled-yard s3_seclusion/player: G4b 31.06 (limit 39.52)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

78 stills in 11 places, every gate per still against its own before.

Gate checks: 1341 passed, 18 failed, 267 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4b | darkest pixels | 8 |
| G8 | repeat pattern | 3 |
| G3b | region colour | 2 |
| G11 | hero-prop light | 2 |
| G2 | tone | 1 |
| G9 | texel density | 1 |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- deep-desert s3_herd_sighting/camera: G4b 56.05 (limit 56.77)
- deep-desert s3_xandrix_back/camera: G4b 52.86 (limit 53.93)
- deep-desert s3_xandrix_back/player: G4b 52.86 (limit 53.93)
- father-camp s3_father_walk/camera: G4b 43.42 (limit 56.91)
- silver-dunes s3_cairns/camera: G4b 22.86 (limit 23.49)
- silver-dunes s3_dunes_night/player: G2 0.1611 (limit 0.12)
- silver-dunes s3_moonlit_dunes/camera: G4b 25.75 (limit 26.88)
- silver-dunes s3_moonlit_dunes/overview: G4b 25.75 (limit 27.32)
- silver-dunes s3_moonlit_dunes/player: G4b 25.75 (limit 27.03)
- storyteller-hut e_returned/camera: G3b 18.87 (limit 6.0)
- storyteller-hut e_returned/camera: G8 0.371 (limit 0.2)
- storyteller-hut e_returned/camera: G11 0.1105 (limit 0.08262)
- storyteller-hut s3_circle/camera: G8 0.384 (limit 0.2)
- storyteller-hut s3_circle/camera: G11 0.4245 (limit 0.08262)
- storyteller-hut s3_circle/overview: G3b 15.41 (limit 6.0)
- storyteller-hut s3_circle/player: G8 0.375 (limit 0.2)
- storyteller-hut s3_village_return/player: G9 {'piece:dome': 0.717, 'piece:door-lintel': 0.362} (limit [0.7, 2.0])
- walled-yard s3_seclusion/overview: G6b 0.1743 (limit 0.1578)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P4 gates (rock, snow, frost and ice; before = the P1 to P3 render)

12 stills in 2 places. Gate checks: 201 passed, 9 failed, 40 not applicable.
G7 is listed but not meaningful for an incremental phase: it averages every dressed region, most unchanged since P1.

- abyss-edge s3_abyss_dream/overview: G4b 51.32 (limit 51.4)
- abyss-edge s3_abyss_dream/overview: G7 1.15 (limit 2.0)
- abyss-edge s3_abyss_dream/player: G4b 17.09 (limit 22.88)
- abyss-edge s3_abyss_dream/player: G7 1.51 (limit 2.0)
- abyss-edge s3_abyss_return/player: G4b 19.16 (limit 23.64)
- abyss-edge s3_abyss_return/player: G7 1.53 (limit 2.0)
- procession-road s3_procession_choice/camera: G4b 19.34 (limit 22.41)
- procession-road s3_scribe_wagon/camera: G7 1.0 (limit 1.5)
- procession-road s3_scribe_wagon/player: G7 1.0 (limit 1.5)

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

60 stills in 6 places. Gate checks: 1085 passed, 10 failed, 155 not applicable (detail gain counted as n/a).

- abyss-edge s3_abyss_dream/camera: G8 0.459 (limit 0.2)
- abyss-edge s3_abyss_dream/overview: G3b 9.52 (limit 6.0)
- abyss-edge s3_abyss_dream/player: G8 0.551 (limit 0.2)
- abyss-edge s3_abyss_return/camera: G8 0.377 (limit 0.2)
- abyss-edge s3_abyss_return/player: G8 0.543 (limit 0.2)
- deep-desert s3_herd_sighting/camera: G4b 39.76 (limit 54.05)
- deep-desert s3_herd_sighting/player: G4b 42.83 (limit 54.77)
- father-camp s3_father_walk/player: G4b 25.75 (limit 26.17)
- silver-dunes s3_dunes_day/player: G2 0.1536 (limit 0.12)
- silver-dunes s3_evening_camp/player: G9 {'piece:dune-west': 0.181} (limit [0.7, 2.0])

## P6 gates (skirting and conduit kits; before = the P1 to P5 render)

36 stills in 4 places. Gate checks: 692 passed, 10 failed, 54 not applicable (detail gain counted as n/a).

- clerk-office s3_hollin_choice/camera: G8 1.039 (limit 0.2)
- clerk-office s3_hollin_choice/player: G8 1.146 (limit 0.2)
- elaris-room s3_room_morning/camera: G4b 23.53 (limit 23.6)
- elaris-room s3_room_morning/camera: G8 0.523 (limit 0.2)
- elaris-room s3_room_morning/overview: G8 0.393 (limit 0.2)
- elaris-room s3_room_morning/overview: G11 0.1063 (limit 0.08262)
- pantry s3_ledger_turned/camera: G4b 4.27 (limit 4.98)
- pantry s3_pantry_c1/camera: G4b 15.04 (limit 15.54)
- pantry s3_pantry_c3/camera: G4b 15.04 (limit 15.39)
- temple-halls e_stayed/camera: G8 0.468 (limit 0.2)

## P6b gates (fixture bodies, bookshelf bays; before = the P1 to P6 render)

36 stills in 4 places. Gate checks: 692 passed, 10 failed, 54 not applicable (detail gain counted as n/a).

- clerk-office s3_hollin_choice/camera: G2 0.2138 (limit 0.12)
- clerk-office s3_hollin_choice/camera: G3a 8.132 (limit 4.0)
- clerk-office s3_hollin_choice/camera: G3b 20.04 (limit 6.0)
- clerk-office s3_hollin_choice/camera: G4a 23.599 (limit 22.036)
- clerk-office s3_hollin_choice/camera: G11 0.1074 (limit 0.08262)
- clerk-office s3_hollin_choice/player: G2 0.4198 (limit 0.12)
- clerk-office s3_hollin_choice/player: G3a 8.484 (limit 4.0)
- clerk-office s3_hollin_choice/player: G3b 12.69 (limit 6.0)
- clerk-office s3_hollin_choice/player: G4a 35.313 (limit 33.401)
- clerk-office s3_hollin_choice/player: G6b 0.4953 (limit 0.5232)

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

# Dressing notes: stuffed-ones

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

10 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): fabric_fine 6, timber 5, boards_v 4, plaster 3, path 3, timber_varnish 2, gravel 2, log_wall 2, stone_block 2, wallpaper 2, cloth_wall 2, leather 1, painted_steel 1, plaster_clean 1, ceiling 1, wood_deck 1, dry_ground 1, flagstone 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): canopy, creek, far-ridge, fog, fog-forest, pines, pool, road, valley; P3 (vegetation): birch-leaf, deadwood, meadow, moss-bank, pine, pine-needles, trunk; P5 (per-game specials): bark, knotted-thread.

## P1 gates

52 stills in 10 places, every gate per still against its own before.

Gate checks: 970 passed, 36 failed, 82 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 12 |
| G4b | darkest pixels | 9 |
| G8 | repeat pattern | 7 |
| G14 | seams | 2 |
| G4a | dark area | 2 |
| G5 | colour specks | 2 |
| G9 | texel density | 1 |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- cabin-kitchen a1_dinner/overview: G8 0.597 (limit 0.2)
- cabin-kitchen a1_dinner/player: G4b 32.83 (limit 35.12)
- cabin-kitchen a5_kitchen_bear/camera: G8 0.966 (limit 0.2)
- cabin-kitchen a5_kitchen_bear/camera: G14 0.24611238022386125 (limit 0.06)
- cabin-kitchen a5_kitchen_bear/player: G4b 21.03 (limit 33.01)
- cabin-kitchen e_warning_unpick/camera: G4b 36.57 (limit 37.29)
- cabin-kitchen e_warning_unpick/player: G4b 31.47 (limit 36.29)
- cabin-kitchen e_warning_unpick/player: G9 {'piece:ceiling': 0.527} (limit [0.7, 2.0])
- car-interior a1_car/camera: G7 1.17 (limit 1.624)
- car-interior a1_car/overview: G7 0.99 (limit 1.579)
- car-interior a1_car/player: G6b 0.0042 (limit 0.0045)
- car-interior a1_car/player: G7 1.33 (limit 1.5)
- labyrinth a5_labyrinth/camera: G8 0.404 (limit 0.2)
- labyrinth a5_labyrinth/overview: G7 1.07 (limit 1.5)
- labyrinth a5_labyrinth/player: G8 0.426 (limit 0.2)
- lilas-room a3_warmth/overview: G7 1.55 (limit 1.785)
- lilas-room a3_warmth/overview: G14 0.12728305011970956 (limit 0.06)
- porch-clearing a3_dog/overview: G8 0.314 (limit 0.2)
- porch-clearing e_keeper_porch/camera: G4a 3.758 (limit 3.537)
- porch-clearing e_keeper_porch/camera: G4b 2.49 (limit 4.55)
- porch-clearing e_keeper_porch/player: G8 0.453 (limit 0.2)
- ritual-room a5_ritual_room/camera: G5 5 (limit 1)
- ritual-room a5_ritual_room/overview: G5 3 (limit 0)
- ritual-room e_page_circle/player: G7 1.05 (limit 1.724)
- upstairs-hall a2_gerald/player: G4a 0.968 (limit 0.665)
- upstairs-hall a2_gerald/player: G4b 4.49 (limit 4.86)
- upstairs-hall a2_gerald/player: G7 1.15 (limit 1.601)
- upstairs-hall a2_night_hall/camera: G7 1.38 (limit 1.57)
- upstairs-hall a2_night_hall/overview: G4b 9.7 (limit 10.41)
- upstairs-hall a2_night_hall/overview: G7 1.17 (limit 1.539)
- upstairs-hall a2_night_hall/overview: G8 0.611 (limit 0.2)
- upstairs-hall a2_night_hall/player: G7 1.35 (limit 1.565)
- upstairs-hall a4_night_sounds/camera: G7 1.3 (limit 1.566)
- upstairs-hall a4_night_sounds/player: G7 1.3 (limit 1.565)
- upstairs-hall a4_sixty_knots/player: G4b 23.9 (limit 26.25)
- upstairs-hall b8_the_door/camera: G4b 18.2 (limit 19.69)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

39 stills in 7 places, every gate per still against its own before.

Gate checks: 715 passed, 1 failed, 100 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G9 | texel density | 1 |

Every failing check (place, scene/still, gate, value, limit):

- cabin-kitchen e_warning_unpick/player: G9 {'piece:ceiling': 0.527} (limit [0.7, 2.0])

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P3 gates (outdoor and forest kit; before = the P1 and P2b render)

14 stills in 4 places. Gate checks: 248 passed, 6 failed, 38 not applicable.
G7 (detail gain) is counted as not applicable: it averages every dressed region, most of which P1 already dressed.

- overlook-trail a1_trail_overlook/camera: G4b 6.06 (limit 21.56)
- overlook-trail a1_trail_overlook/overview: G4b 7.7 (limit 26.9)
- overlook-trail a1_trail_overlook/player: G4b 5.99 (limit 21.49)
- porch-clearing a3_dog/camera: G4b 14.19 (limit 16.62)
- porch-clearing a3_dog/player: G4b 11.55 (limit 12.76)
- porch-clearing e_keeper_porch/camera: G2 0.4049 (limit 0.12)

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

14 stills in 4 places. Gate checks: 254 passed, 0 failed, 38 not applicable (detail gain counted as n/a).


## P6 gates (skirting and conduit kits; before = the P1 to P5 render)

23 stills in 3 places. Gate checks: 413 passed, 9 failed, 60 not applicable (detail gain counted as n/a).

- upstairs-hall a2_gerald/camera: G11 0.149 (limit 0.08262)
- upstairs-hall a2_night_hall/camera: G11 0.1107 (limit 0.08262)
- upstairs-hall a2_night_hall/overview: G11 0.1142 (limit 0.08262)
- upstairs-hall a2_night_hall/player: G11 0.8329 (limit 0.08262)
- upstairs-hall a4_night_sounds/camera: G11 0.1573 (limit 0.08262)
- upstairs-hall a4_night_sounds/player: G11 0.8841 (limit 0.08262)
- upstairs-hall a4_sixty_knots/camera: G11 0.2102 (limit 0.08262)
- upstairs-hall b8_the_door/player: G11 0.3373 (limit 0.08262)
- upstairs-hall c11_cupboard_shut/player: G11 0.2572 (limit 0.08262)

## P6b gates (fixture bodies, bookshelf bays; before = the P1 to P6 render)

23 stills in 3 places. Gate checks: 422 passed, 0 failed, 60 not applicable (detail gain counted as n/a).


## P6c gates (window frames, sills, mullions, door casings and leaves; before = the P1 to P6b render)

13 stills in 1 places. Gate checks: 221 passed, 16 failed, 35 not applicable (detail gain counted as n/a).

- upstairs-hall a2_gerald/camera: G3b 9.42 (limit 6.0)
- upstairs-hall a2_gerald/camera: G4a 6.361 (limit 0.951)
- upstairs-hall a2_gerald/camera: G11 0.2276 (limit 0.08262)
- upstairs-hall a2_night_hall/camera: G3b 8.61 (limit 6.0)
- upstairs-hall a2_night_hall/overview: G3b 10.21 (limit 6.0)
- upstairs-hall a2_night_hall/player: G3b 8.7 (limit 6.0)
- upstairs-hall a2_night_hall/player: G11 0.1484 (limit 0.08262)
- upstairs-hall a4_night_sounds/camera: G3b 9.6 (limit 6.0)
- upstairs-hall a4_night_sounds/camera: G4a 1.561 (limit 1.5)
- upstairs-hall a4_night_sounds/camera: G11 0.0964 (limit 0.08262)
- upstairs-hall a4_night_sounds/player: G3b 9.63 (limit 6.0)
- upstairs-hall a4_night_sounds/player: G4a 1.569 (limit 1.496)
- upstairs-hall a4_night_sounds/player: G11 0.1466 (limit 0.08262)
- upstairs-hall a4_sixty_knots/player: G4b 17.83 (limit 21.9)
- upstairs-hall a4_sixty_knots/player: G6b 0.1645 (limit 0.1708)
- upstairs-hall b8_the_door/camera: G4b 11.27 (limit 15.62)

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

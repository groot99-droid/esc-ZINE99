# Dressing notes: man-eater

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

15 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): painted_steel_me 15, plaster 12, conc_floor 7, timber 7, plaster_old 4, timber_varnish 2, conc_wall 2, fabric 1, paper 1, stone_block 1, conc_wall_damp 1, tile_gloss 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): concrete, sky-grey, spruce, steel; P3 (vegetation): spruce; P4 (rock, snow, ice): frost, snow; P5 (per-game specials): bark, bruise.

Left as built (marks, voids, dark gaps or no fitting family): ink.

## P1 gates

91 stills in 15 places, every gate per still against its own before.

Gate checks: 1659 passed, 83 failed, 121 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 46 |
| G8 | repeat pattern | 16 |
| G4b | darkest pixels | 14 |
| G6b | light/dark spread | 3 |
| G5 | colour specks | 2 |
| G4a | dark area | 2 |

Every failing check (place, scene/still, gate, value, limit):

- boiler-room d4_duty_boiler/camera: G5 2 (limit 1)
- boiler-room d4_duty_boiler/camera: G7 1.08 (limit 2.0)
- boiler-room d4_duty_boiler/overview: G6b 0.7071 (limit 0.6457)
- boiler-room d4_duty_boiler/overview: G7 1.41 (limit 2.0)
- boiler-room d4_duty_boiler/player: G5 1 (limit 0)
- boiler-room d4_duty_boiler/player: G7 1.18 (limit 2.0)
- bunk-room c1_bunk/overview: G7 1.45 (limit 1.552)
- bunk-room c1_bunk/player: G8 0.88 (limit 0.2)
- bunk-room d2_sam_bunk/camera: G8 0.734 (limit 0.2)
- bunk-room d2_sam_bunk/player: G8 0.729 (limit 0.2)
- bunk-room n2_door/player: G7 1.35 (limit 1.5)
- bunk-room n3_door/player: G7 1.34 (limit 1.5)
- bunk-room n4_door/camera: G7 1.41 (limit 1.5)
- bunk-room n4_door/player: G7 1.41 (limit 1.5)
- bunk-room n5_door/camera: G7 1.4 (limit 1.5)
- bunk-room n5_door/player: G7 1.4 (limit 1.5)
- bunk-room n6_door/camera: G7 1.4 (limit 1.5)
- bunk-room n6_door/player: G7 1.38 (limit 1.5)
- bunk-room n7_door/player: G7 1.38 (limit 1.5)
- cafeteria d1_cafeteria/camera: G7 1.66 (limit 2.0)
- cafeteria d1_cafeteria/overview: G7 1.09 (limit 1.803)
- cafeteria d1_cafeteria/overview: G8 0.478 (limit 0.2)
- cafeteria d1_cafeteria/player: G7 1.23 (limit 1.734)
- cafeteria d1_cafeteria/player: G8 0.656 (limit 0.2)
- cafeteria d6_next_week/camera: G8 0.975 (limit 0.2)
- cafeteria d6_next_week/player: G4b 12.55 (limit 12.57)
- cafeteria d6_next_week/player: G7 1.36 (limit 1.705)
- cafeteria d6_next_week/player: G8 0.634 (limit 0.2)
- cold-store d1_duty_coldstore/camera: G7 1.6 (limit 2.0)
- cold-store d1_duty_coldstore/overview: G4b 41.18 (limit 44.79)
- cold-store d1_duty_coldstore/overview: G7 1.88 (limit 2.0)
- cold-store d1_duty_coldstore/player: G4b 43.01 (limit 48.07)
- gate-yard c1_truck_gate/camera: G4b 46.37 (limit 49.58)
- gate-yard c1_truck_gate/camera: G7 1.81 (limit 2.0)
- gate-yard c1_truck_gate/player: G4b 46.37 (limit 49.58)
- gate-yard c1_truck_gate/player: G7 1.83 (limit 2.0)
- gate-yard d3_duty_shovel/overview: G7 1.16 (limit 2.0)
- gate-yard d3_duty_shovel/player: G4b 69.72 (limit 74.72)
- gate-yard d3_duty_shovel/player: G8 0.481 (limit 0.2)
- gate-yard e_new_recruit/camera: G8 0.875 (limit 0.2)
- gate-yard e_new_recruit/player: G8 0.655 (limit 0.2)
- gate-yard e_transfer_truck/camera: G4b 38.29 (limit 41.58)
- gate-yard e_transfer_truck/camera: G7 1.62 (limit 2.0)
- gate-yard e_transfer_truck/player: G4b 38.37 (limit 41.58)
- gate-yard e_transfer_truck/player: G7 1.61 (limit 2.0)
- laundry d5_duty_laundry/camera: G4b 23.35 (limit 29.71)
- laundry d5_duty_laundry/overview: G4b 33.5 (limit 41.07)
- laundry d5_duty_laundry/player: G4b 44.22 (limit 52.5)
- mail-room d3_mail_room/camera: G7 1.32 (limit 1.681)
- mail-room d3_mail_room/overview: G6b 0.7017 (limit 0.6358)
- mail-room d3_mail_room/overview: G7 1.07 (limit 1.539)
- mail-room d3_mail_room/player: G7 1.03 (limit 1.5)
- mail-room d3_mail_room/player: G8 0.348 (limit 0.2)
- perimeter e_tree_line/camera: G7 1.19 (limit 2.0)
- perimeter e_tree_line/player: G7 1.1 (limit 2.0)
- perimeter n7_perimeter/camera: G4b 16.0 (limit 19.86)
- perimeter n7_perimeter/camera: G8 0.605 (limit 0.2)
- perimeter n7_perimeter/player: G4b 16.0 (limit 20.08)
- perimeter n7_perimeter/player: G8 0.6 (limit 0.2)
- perimeter n7_set_down/camera: G7 0.97 (limit 2.0)
- perimeter n7_set_down/player: G7 0.96 (limit 2.0)
- rec-room d1_rec_room/overview: G8 0.921 (limit 0.2)
- room-below e_zoo_wake/overview: G4b 42.64 (limit 42.72)
- sams-office d5_sam_office/camera: G8 0.454 (limit 0.2)
- sams-office d5_sam_office/overview: G7 1.23 (limit 1.504)
- sams-office n4_office/camera: G7 1.33 (limit 1.504)
- sams-office n4_office/player: G7 1.48 (limit 1.5)
- tall-halls c1_halls/overview: G7 1.22 (limit 1.524)
- tall-halls d2_duty_paint/camera: G7 1.15 (limit 1.502)
- tall-halls d2_duty_paint/camera: G8 1.422 (limit 0.2)
- tall-halls d2_duty_paint/player: G7 1.12 (limit 1.525)
- tall-halls d7_duty_walk/camera: G7 1.35 (limit 1.516)
- tall-halls d7_duty_walk/player: G7 1.43 (limit 1.523)
- tall-halls n7_windigo/camera: G7 1.14 (limit 1.518)
- the-cave e_cave/overview: G4a 21.97 (limit 20.72)
- the-cave e_cave/overview: G6b 0.379 (limit 0.3376)
- the-cave e_cave/overview: G7 1.72 (limit 2.0)
- the-pens n6_pens/camera: G7 0.96 (limit 2.0)
- the-pens n6_pens/overview: G7 0.97 (limit 2.0)
- the-pens n6_pens/player: G7 1.57 (limit 2.0)
- truck-cab n3_glovebox/camera: G4a 21.133 (limit 17.046)
- truck-cab n3_glovebox/camera: G7 1.43 (limit 1.881)
- truck-cab n3_glovebox/overview: G7 1.18 (limit 1.957)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

25 stills in 5 places, every gate per still against its own before.

Gate checks: 430 passed, 1 failed, 77 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- boiler-room d4_duty_boiler/overview: G6b 0.7071 (limit 0.6364)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

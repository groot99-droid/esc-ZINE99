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

Gate checks: 1639 passed, 103 failed, 121 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 66 |
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
- bunk-room c1_bunk/overview: G7 1.45 (limit 2.0)
- bunk-room c1_bunk/player: G7 1.74 (limit 2.0)
- bunk-room c1_bunk/player: G8 0.88 (limit 0.2)
- bunk-room d2_sam_bunk/camera: G7 1.89 (limit 2.0)
- bunk-room d2_sam_bunk/camera: G8 0.734 (limit 0.2)
- bunk-room d2_sam_bunk/player: G7 1.72 (limit 2.0)
- bunk-room d2_sam_bunk/player: G8 0.729 (limit 0.2)
- bunk-room d5_jax_plan/camera: G7 1.83 (limit 2.0)
- bunk-room d6_sam_offer/camera: G7 1.56 (limit 2.0)
- bunk-room d6_sam_offer/player: G7 1.92 (limit 2.0)
- bunk-room d7_bunk_evening/camera: G7 1.81 (limit 2.0)
- bunk-room e_prints_bunk/camera: G7 1.5 (limit 2.0)
- bunk-room e_prints_bunk/player: G7 1.64 (limit 2.0)
- bunk-room n1_bunk_call/camera: G7 1.52 (limit 2.0)
- bunk-room n1_bunk_call/player: G7 1.65 (limit 2.0)
- bunk-room n2_door/camera: G7 1.63 (limit 2.0)
- bunk-room n2_door/player: G7 1.35 (limit 2.0)
- bunk-room n3_door/camera: G7 1.53 (limit 2.0)
- bunk-room n3_door/player: G7 1.34 (limit 2.0)
- bunk-room n4_door/camera: G7 1.41 (limit 2.0)
- bunk-room n4_door/player: G7 1.41 (limit 2.0)
- bunk-room n5_door/camera: G7 1.4 (limit 2.0)
- bunk-room n5_door/player: G7 1.4 (limit 2.0)
- bunk-room n6_door/camera: G7 1.4 (limit 2.0)
- bunk-room n6_door/player: G7 1.38 (limit 2.0)
- bunk-room n7_bunk_stay/camera: G7 1.52 (limit 2.0)
- bunk-room n7_bunk_stay/player: G7 1.63 (limit 2.0)
- bunk-room n7_door/camera: G7 1.52 (limit 2.0)
- bunk-room n7_door/player: G7 1.38 (limit 2.0)
- cafeteria d1_cafeteria/camera: G7 1.66 (limit 2.0)
- cafeteria d1_cafeteria/overview: G7 1.09 (limit 2.0)
- cafeteria d1_cafeteria/overview: G8 0.478 (limit 0.2)
- cafeteria d1_cafeteria/player: G7 1.23 (limit 2.0)
- cafeteria d1_cafeteria/player: G8 0.656 (limit 0.2)
- cafeteria d6_next_week/camera: G8 0.975 (limit 0.2)
- cafeteria d6_next_week/player: G4b 12.55 (limit 12.57)
- cafeteria d6_next_week/player: G7 1.36 (limit 2.0)
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
- mail-room d3_mail_room/camera: G7 1.32 (limit 2.0)
- mail-room d3_mail_room/overview: G6b 0.7017 (limit 0.6358)
- mail-room d3_mail_room/overview: G7 1.07 (limit 2.0)
- mail-room d3_mail_room/player: G7 1.03 (limit 2.0)
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
- sams-office d5_sam_office/camera: G7 1.91 (limit 2.0)
- sams-office d5_sam_office/camera: G8 0.454 (limit 0.2)
- sams-office d5_sam_office/overview: G7 1.23 (limit 2.0)
- sams-office n4_office/camera: G7 1.33 (limit 2.0)
- sams-office n4_office/player: G7 1.48 (limit 2.0)
- tall-halls c1_halls/camera: G7 1.57 (limit 2.0)
- tall-halls c1_halls/overview: G7 1.22 (limit 2.0)
- tall-halls c1_halls/player: G7 1.6 (limit 2.0)
- tall-halls d2_duty_paint/camera: G7 1.15 (limit 2.0)
- tall-halls d2_duty_paint/camera: G8 1.422 (limit 0.2)
- tall-halls d2_duty_paint/player: G7 1.12 (limit 2.0)
- tall-halls d7_duty_walk/camera: G7 1.35 (limit 2.0)
- tall-halls d7_duty_walk/player: G7 1.43 (limit 2.0)
- tall-halls n7_windigo/camera: G7 1.14 (limit 2.0)
- tall-halls n7_windigo/player: G7 1.94 (limit 2.0)
- the-cave e_cave/overview: G4a 21.97 (limit 20.72)
- the-cave e_cave/overview: G6b 0.379 (limit 0.3376)
- the-cave e_cave/overview: G7 1.72 (limit 2.0)
- the-pens n6_pens/camera: G7 0.96 (limit 2.0)
- the-pens n6_pens/overview: G7 0.97 (limit 2.0)
- the-pens n6_pens/player: G7 1.57 (limit 2.0)
- truck-cab n3_glovebox/camera: G4a 21.133 (limit 17.046)
- truck-cab n3_glovebox/camera: G7 1.43 (limit 2.0)
- truck-cab n3_glovebox/overview: G7 1.18 (limit 2.0)

## P2 gates (atmosphere and skies; before = the P1 render)

22 stills in 4 places, every gate per still against its own before.

Gate checks: 374 passed, 0 failed, 71 not applicable.

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2 is a first cut: sky plates and faint outdoor haze only; no dust, shafts, rain, snow, flames or water yet.
- Half-size look renders; the full-size pass is P7.

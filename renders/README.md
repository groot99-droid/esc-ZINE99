# Blockout renders, first pass

Rendered 2026-11-19. One contact sheet per location: `renders/<game>/<location>.jpg`, the overview still first,
then the scene stills in the order of the build file's scene list. Each tile is the 1920x1080 still scaled to 480x270
with its scene id under it. The full-size PNGs and the `.blend` files are not in the repo (they stay on the author's
machine, 543 PNGs and 152 `.blend` files, about 1.1 GB).

## How they were made

- Machine: a rented Vast.ai instance with one NVIDIA GeForce RTX 3090, Cycles on OptiX, 128 samples, 1920x1080.
  Two rentals of about one hour each (the first built the three Dr. Tox games, the second the other ten).
- Blender: the report each run wrote says **5.2.1 LTS** for 8 games and **4.2.3 LTS** for 5 (behind-the-peephole,
  endless-temple, man-eater, stuffed-ones, wrymwretch), as the table shows. I did not find out why the second rental mixed
  versions; the scenes were all built by the same driver script and the same emitted blockout code.
- Pipeline: each game's build files went through `compile.py` and `blockout.py` (unchanged); the emitted bpy code ran as it was.
  No build file, `assets.json` or design file was edited.
- **Models: none of the 13 games used real Meshy models.** Every prop is a box proxy named by its prop id and sized from the
  build file's prop sizes, so these renders show layout, scale, camera framing and lighting only. For WrymWretch the Meshy
  models are not on this machine (`studio/assets/wrymwretch/` does not exist), so its proxies are the only option.
  No Meshy credits were spent.
- Lighting and world are the driver's own simple rig, not the games' final lighting.

## What was rendered

| Game | Locations | Scenes | Render errors | Blender | Render time |
|---|---|---|---|---|---|
| behind-the-peephole | 7 | 26 | 0 | 4.2.3 LTS | 1336 s |
| dr-tox-fall | 5 | 21 | 0 | 5.2.1 LTS | 287 s |
| dr-tox-finale | 5 | 24 | 0 | 5.2.1 LTS | 337 s |
| dr-tox-rise | 8 | 21 | 0 | 5.2.1 LTS | 226 s |
| endless-temple | 15 | 44 | 0 | 4.2.3 LTS | 1554 s |
| heartstream | 14 | 20 | 0 | 5.2.1 LTS | 1440 s |
| lira-calyx | 14 | 24 | 0 | 5.2.1 LTS | 1246 s |
| lord-of-the-sea | 13 | 28 | 0 | 5.2.1 LTS | 1046 s |
| man-eater | 15 | 38 | 0 | 4.2.3 LTS | 1763 s |
| missing-campsites | 13 | 24 | 0 | 5.2.1 LTS | 1184 s |
| people-of-the-bark | 10 | 23 | 0 | 5.2.1 LTS | 744 s |
| stuffed-ones | 11 | 41 | 0 | 4.2.3 LTS | 1841 s |
| wrymwretch | 14 | 36 | 0 | 4.2.3 LTS | 366 s |
| **Total** | **144** | **370** | 0 | | 13370 s (games ran in parallel on the second rental) |

A higher-quality pass of dr-tox-rise (2560x1440, 256 samples) also exists on the author's machine but is not in this folder.

## Problems found

Nothing was edited to work around any of these.

### Camera and set problems from a local box test

The same scenes were also built locally (Blender 4.4, CPU) as a check before the GPU runs; 69 scenes tripped one of two
checks. "Stands between the camera and its look_at" means a blockout piece blocks the line from the camera to its target,
so the still may show a wall or a piece in front of the subject; "camera is inside" means the camera sits within a piece.
These are checks on the geometry, not a judgment of the still, so open the sheet for each.

| Game | Location | Scene | Note |
|---|---|---|---|
| behind-the-peephole | back-stair | n3_stairwell | blockout piece 'flight-4b-high' (structure) stands between the camera and its look_at |
| behind-the-peephole | back-stair | n6_stairwell | blockout piece 'flight-4b-high' (structure) stands between the camera and its look_at |
| dr-tox-fall | salvage-settlement | s3_settlement_day | camera [-48, -26, 1.7] is inside blockout piece 'embankment' (terrain) |
| dr-tox-fall | snakehead-fortress | s3_fortress_following | blockout piece 'archive-row-3' (structure) stands between the camera and its look_at |
| dr-tox-fall | spire-gala | s3_gala_balcony | blockout piece 'glass-north' (wall) stands between the camera and its look_at |
| dr-tox-fall | spire-gala | s3_gala_leash | blockout piece 'glass-north' (wall) stands between the camera and its look_at |
| dr-tox-fall | spire-gala | s3_gala_bond | blockout piece 'glass-north' (wall) stands between the camera and its look_at |
| dr-tox-finale | snakehead-overrun | s3_overrun_hall | blockout piece 'cavern-wall-s' (wall) stands between the camera and its look_at |
| dr-tox-rise | idaho-river-town | s3_river_night | blockout piece 'fence' (structure) stands between the camera and its look_at |
| endless-temple | procession-road | s3_scribe_wagon | blockout piece 'wagon-body' (structure) stands between the camera and its look_at |
| heartstream | shedding-gallery | s3_gallery | prop 'blank-8' base [-6, 10.8, 3.5] is inside blockout piece 'ledge2-north-left' |
| lira-calyx | corporate-lab | b2-lab | camera [-20.0, -6.0, 2.65] is inside blockout piece 'wall-west-lintel' (wall) |
| lira-calyx | shear-tunnel | b4-collapse | camera [29.5, -0.0, 2.65] is inside blockout piece 'rubble-seal' (structure) |
| lira-calyx | shear-tunnel | ep-tunnel | blockout piece 'end-west' (wall) stands between the camera and its look_at |
| lord-of-the-sea | chandlery | s-chandlery | prop 'bottle-asked-for' base [-1.9, 2.2, 1.45] is inside blockout piece 'shelves' |
| lord-of-the-sea | chandlery | s-chandlery | prop 'bottle-shelf' base [-1.5, 2.2, 1.45] is inside blockout piece 'shelves' |
| lord-of-the-sea | chandlery | s-chandlery | prop 'tea-caddy' base [0.2, 2.2, 1.45] is inside blockout piece 'shelves' |
| lord-of-the-sea | lamplit-strait | s-lamplit-strait | camera [45, -158.5, 2.6] is inside blockout piece 'headland-east' (terrain) |
| lord-of-the-sea | spice-mouth | s-spice-mouth | blockout piece 'pay-pavilion-posts' (structure) stands between the camera and its look_at |
| lord-of-the-sea | spice-mouth | s-spice-mouth | prop 'pay-table' base [10, 5, 3.0] is inside blockout piece 'pay-pavilion-posts' |
| missing-campsites | entrance-booth | booth_day2 | blockout piece 'booth-window' (opening) stands between the camera and its look_at |
| missing-campsites | entrance-booth | supper_for_two | blockout piece 'booth-window' (opening) stands between the camera and its look_at |
| missing-campsites | fire-ring | campfire_night1 | prop 'cooler' base [4.2, -0.2, 0] is inside blockout piece 'table-legs' |
| missing-campsites | fire-ring | campfire_night2 | prop 'cooler' base [4.2, -0.2, 0] is inside blockout piece 'table-legs' |
| missing-campsites | loop-road | loop_day1 | prop 'tent-17' base [-26.0, 48, 0] is inside blockout piece 'inner-forest' |
| missing-campsites | loop-road | loop_day2am | prop 'tent-17' base [-26.0, 48, 0] is inside blockout piece 'inner-forest' |
| missing-campsites | loop-road | loop_day2pm | prop 'tent-17' base [-26.0, 48, 0] is inside blockout piece 'inner-forest' |
| missing-campsites | loop-road | ordinary_morning | prop 'tent-17' base [-26.0, 48, 0] is inside blockout piece 'inner-forest' |
| missing-campsites | other-entrance | other_entrance | blockout piece 'booth-back' (wall) stands between the camera and its look_at |
| missing-campsites | tam-flat | home_apartment | blockout piece 'part-b' (wall) stands between the camera and its look_at |
| people-of-the-bark | highridge | c1_city_dawn | prop 'lantern-row1-e' base [0.052, 0.024, 0.19] is inside blockout piece 'hall-splinter' |
| people-of-the-bark | highridge | c1_city_year | prop 'lantern-row1-e' base [0.052, 0.024, 0.19] is inside blockout piece 'hall-splinter' |
| people-of-the-bark | highridge | c2_city | prop 'lantern-row1-e' base [0.052, 0.024, 0.19] is inside blockout piece 'hall-splinter' |
| people-of-the-bark | highridge | c2_rain | prop 'lantern-row1-e' base [0.052, 0.024, 0.19] is inside blockout piece 'hall-splinter' |
| people-of-the-bark | highridge | c3_city | prop 'lantern-row1-e' base [0.052, 0.024, 0.19] is inside blockout piece 'hall-splinter' |
| people-of-the-bark | highridge | c4_city | prop 'lantern-row1-e' base [0.052, 0.024, 0.19] is inside blockout piece 'hall-splinter' |
| people-of-the-bark | highridge | c5_city | prop 'lantern-row1-e' base [0.052, 0.024, 0.19] is inside blockout piece 'hall-splinter' |
| people-of-the-bark | highridge | c4_faceless | prop 'lantern-row1-e' base [0.052, 0.024, 0.19] is inside blockout piece 'hall-splinter' |
| people-of-the-bark | lowridge | c2_sorrel_wall | prop 'low-tap-1' base [0.002, 0.0095, 0.03] is inside blockout piece 'upper-ledge' |
| people-of-the-bark | lowridge | c5_lowridge | prop 'low-tap-1' base [0.002, 0.0095, 0.03] is inside blockout piece 'upper-ledge' |
| stuffed-ones | cabin-living-room | a1_cabin_arrival | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | a3_smell | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | a4_wrong_places | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | a5_cabin_turns | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | b6_waking | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | b6_keepers_visit | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | b7_arrivals | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | b7_jamie_falls | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | b8_breaking_point | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c9_new_guests | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c10_hold_shelf | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c11_toy_floor | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c11_hold_shelf | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c12_hold_shelf | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c13_flight | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c13_seal | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c14_hold_shelf | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | c14_chase_cabin | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | e_cycle_shelf | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | cabin-living-room | e_empty_toy | prop 'rug' base [0.2, -1.2, 0] is inside blockout piece 'game-table' |
| stuffed-ones | labyrinth | a5_labyrinth | blockout piece 'ring1-corridor-s' (wall) stands between the camera and its look_at |
| stuffed-ones | labyrinth | a5_labyrinth | blockout piece 'ring2-s' (wall) stands between the camera and its look_at |
| stuffed-ones | labyrinth | a5_labyrinth | blockout piece 'ring2-corridor-s' (wall) stands between the camera and its look_at |
| wrymwretch | duskbane-underworld | s_duskbane_halls | blockout piece 'south-wall' (wall) stands between the camera and its look_at |
| wrymwretch | duskbane-underworld | s_underworld_tunnels | camera [-17.0, -20.5, 3.5] is inside blockout piece 'south-wall' (wall) |
| wrymwretch | starlit-priory | s_priory_halls | blockout piece 'hall-south' (wall) stands between the camera and its look_at |
| wrymwretch | starlit-priory | s_crystal_forest | blockout piece 'doors-frame' (trim) stands between the camera and its look_at |
| wrymwretch | starlit-priory | s_crystal_forest | blockout piece 'doors-light' (opening) stands between the camera and its look_at |
| wrymwretch | storm-chamber | s_storm_chamber | blockout piece 'door-opening' (opening) stands between the camera and its look_at |

### Seen on the sheets

- dr-tox-rise / hospital-room / s3_hospital_2217: the 85 mm first-person camera frames only the bench. The reference image
  shows the observation glass on the far wall by the bed; the build file puts it in the -y wall behind the camera.
  s3_injection_first is nearly all one box.

### Build-file and tool problems

- `docs/BLENDER.md` says 126 build files and 304 scenes; there are 144 locations and 370 scenes.
- `check_blender.py` skips its assemble_plan check because Pipelines-Plugin is not checked out beside esc-ZINE99.
- No scene failed to render (every report shows 0 errors), and all 370 scene stills exist.

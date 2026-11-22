# stuffed-ones: refinement notes (render and refinement plan, sixth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the author;
some are also applied inside the driver only (`tools/render/overrides.json`, `tools/render/rig.json`). 41 scenes in 11 locations
(31 hero at 2560x1440 / 256 samples, the rest 1920x1080 / 128). Each scene's own lights, world, camera and lens were used; the rig adds
exposure only (no fill light was added anywhere). Built with real models for 25 of 27 object types (phase C), box proxies for the rest.

## Owner decisions

1. **The facing convention.** `facing_deg` has no stated sense; the cameras of these games agree with a rotation about Z (90 faces -x), not a compass bearing. Say which in `docs/BLENDER.md` (proposed text below).
2. **The shelf cameras.** In 14 cabin-living-room scenes (the "Hold Still on the shelf" views) the fixed camera `[2.4, 3.6, 1.68]` stands inside the bounding box of the real `toy-shelf` model (`shelf-north-b`); with the model the rails and a slat show beside the lens. Decide whether the toy's eye is meant to be inside the shelf (then give the shelf an open bay) or in front of it (proposed: move the camera to y `3.0`, or `hide` `shelf-north-b` in those scenes). Left as built.
3. **Models are lite copies** (about 12k triangles, 512 px) because the upload to the render box ran at about 50 KB/s. A final pass with the full 80k-triangle glbs needs a faster link or a box that already holds the files; say if you want it.

## Phase A: flagged scenes (21 flagged in the first pass) and what the driver found

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| labyrinth / a5_labyrinth | the camera `[0, -21.4, 1.65]` stands in the 1.1 m outer corridor (between `ring1-sa`/`ring1-sb` and `ring1-corridor-s`) and looks +y through `ring1-corridor-s`, `ring2-s` and `ring2-corridor-s` (three solid walls): the first-pass flag | `look_at` `[-14, -21.45, 1.2]` (down the corridor, west) and the player start turned to face it | `/scenes/a5_labyrinth/camera/look_at` `[-14, -21.45, 1.2]`; `/scenes/a5_labyrinth/player_start/facing_deg` `90` (see the facing convention below) |
| cabin-living-room / 20 scenes | prop `rug` base `[0.2, -1.2, 0]` is inside the piece `game-table` (3 of 27 sample points of the rug): the rug lies on the floor under the low game table | none: intended, the rug shows around the table | none |

Before and after: `flagged-before-after.jpg` (before = `--no-overrides 1`, 0.4 scale at 25% of the samples, no models; after = the final still).

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| cabin-living-room, 14 shelf scenes | the camera is inside the box of the `toy-shelf` model `shelf-north-b` (see Owner decisions) | none applied |
| cabin-living-room | `stove` overlaps `stovepipe` (1 of 27); `shelf-north-a` overlaps `wall-north` | none (the shelves stand against the wall) |
| car-interior | `bag` overlaps the seats | none (the bag sits on the seat) |
| overlook-trail | `binoculars` overlap `rock-outcrop` (9 of 27) | none (they lie on the rock) |

## The facing convention (both games)

`player_start.facing_deg` is not defined beyond "0 faces +y" in `docs/BLENDER.md`. Read as a compass bearing (90 faces +x) the
camera and the facing agree in 23 of 41 stuffed-ones scenes and 10 of 24 missing-campsites scenes; read as a rotation about Z
(90 faces -x, `rig.json` `facing: "ccw"`) they agree in 33 of 41 and 23 of 24. The driver reads `ccw` for these two games.
PROPOSED: say so in `docs/BLENDER.md` ("`facing_deg` is a rotation about Z: 0 faces +y, 90 faces -x"). Scenes whose facing still
disagrees with the camera by more than 30 degrees under that reading (the player-start still looks elsewhere than the scene camera):

- a5_kitchen_bear (145, camera bearing -38)
- b6_waking, b8_breaking_point, e_empty_toy (180 against -125 / 125 degrees)
- b7_jamie_falls, c13_flight (180 against -131 / -145)
- e_page_circle (70 against 73)
- a2_gerald (90 against 93)

## Phase B: the rig per location (overview against its reference)

Reference images are 1600 x 900 images from each design's prompt (`games/stuffed-ones/assets/locations/<id>.jpg`). The overviews are corner or
along-the-path views from the driver's own camera at eye height with a wide lens, lit by the scene named below; they match layout and
rough light direction, not detail. Only the rig changed (`tools/render/rig.json`): scene exposure from a look pass on quick renders
(mean display value toward 0.22, capped at -3.5 and +1.0 EV), `overview_ev`, the overview camera. Values are by eye after that.

| Location | Overview lighting scene | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, lens) |
| --- | --- | --- | --- | --- |
| cabin-kitchen | a1_dinner | a1_dinner -0.9, a2_breakfast -2.3, a5_kitchen_bear +0.0, e_warning_unpick +1.0 | +1.2 | [2.2, -1.7, 1.5] to [-1.0, 1.8, 1.2], 20 mm |
| cabin-living-room | a1_cabin_arrival | a1_cabin_arrival -3.3, a3_smell -3.5, a4_wrong_places -2.5, a5_cabin_turns -0.8, b6_keepers_visit -3.5, b6_waking -2.1, b7_arrivals -3.5, b7_jamie_falls -0.6, b8_breaking_point -0.5, c10_hold_shelf -1.4, c11_hold_shelf -3.5, c11_toy_floor -3.5, c12_hold_shelf -1.1, c13_flight -2.9, c13_seal -3.5, c14_chase_cabin -1.7, c14_hold_shelf -2.0, c9_new_guests -3.5, e_cycle_shelf -3.3, e_empty_toy -1.8 | -1.2 | [-4.2, -3.5, 1.65] to [2.0, 2.0, 1.1], 18 mm |
| car-interior | a1_car | a1_car -3.5 | -0.7 | [0, -0.55, 1.0] to [0, 2.0, 0.85], 16 mm |
| creek-trail | a3_trail_creek | a3_trail_creek -3.0 | +0.0 | [-1.5, 100, 1.7] to [4.5, 122, 0.4], 24 mm |
| labyrinth | a5_labyrinth | a5_labyrinth +1.0 | +1.2 | [-3.4, -3.4, 1.65] to [3, 3, 1.2], 18 mm |
| lilas-room | a3_warmth | a3_warmth -3.2 | -0.5 | [-1.7, -1.5, 1.6] to [0.8, 1.0, 1.0], 18 mm |
| overlook-trail | a1_trail_overlook | a1_trail_overlook -2.8 | +0.0 | [0.5, 158, 13.7] to [5, 185, 12.8], 24 mm |
| porch-clearing | a3_dog | a3_dog -1.3, e_keeper_porch -2.4 | +0.0 | [-12, 2, 1.7] to [8, -9, 1.5], 24 mm |
| ridge-path | a4_silent_forest | a4_silent_forest -3.2 | -0.5 | [4.5, -100, 11.2] to [-4, -60, 8.5], 24 mm |
| ritual-room | a5_ritual_room | a5_last_thing +0.9, a5_ritual_room -0.5, e_page_circle +1.0 | +0.5 | [-1.6, -2.8, 1.65] to [0.5, 1.0, 1.2], 18 mm |
| upstairs-hall | a2_night_hall | a2_gerald +0.8, a2_night_hall +0.9, a4_night_sounds +1.0, a4_sixty_knots +0.0, b8_the_door +1.0, c11_cupboard_shut -3.1 | +2.0 | [-5.7, 0.1, 1.6] to [5, 0.0, 1.5], 22 mm |


Deltas the rig cannot close: the proxies and blockout pieces have no wallpaper, plank, bark, grime or foliage, so the cabin rooms read as clean pale boxes where the references are dark, warm and cluttered; the trails and the clearing have cones for trees, no sky gradient and no mountains (the overlook valley and ridge are `sky` pieces, hidden); the ritual room's quilted dome and embroidery are not built; the labyrinth wallpaper is plain colour.

## Phase C: models

Ledger read: `games/stuffed-ones/assets/models.json` on branch comfy-models-3d (commit 824ad55, read-only, taken 2026-11-22; the session was
still building). Only `built` entries were used; the models were copied to the render box as lite copies (decimated to about 12k triangles,
512 px JPEG textures, because the link to the box ran at about 50 KB/s); nothing was copied into the repo. Fit: see `tools/render/README.md`
(batch 6). I looked at every model from front and three-quarter views: the front is -y for all of them, none shows a person or creature.

| Object | Source | Props | Model size (m) | Box size_m x scale (m) | Fit | Problems |
| --- | --- | --- | --- | --- | --- | --- |
| altar | named box proxy | 3 | | | | ledger status failed (out of memory) |
| binoculars | model (lite copy) | 4 | [0.181, 0.139, 0.081] | [0.18, 0.07, 0.12] | scale 0.906, worst side x1.8 | front is -y as built; proportions within x2 of size_m |
| book-page | model (lite copy) | 5 | [0.248, 0.321, 0.035] | [0.25, 0.32, 0.005] | scale 1.001, worst side x2.64 | wrinkled cloth page with stitched marks; thicker than size_m (0.035 against 0.005) |
| broken-crib | model (lite copy) | 3 | [1.316, 0.794, 1.06] | [1.3, 0.7, 1.0] | scale 0.937, worst side x1.06 | front is -y as built; proportions within x2 of size_m |
| chili-bowl | model (lite copy) | 5 | [0.161, 0.161, 0.081] | [0.16, 0.16, 0.08] | scale 0.99, worst side x1.01 | front is -y as built; proportions within x2 of size_m |
| coffee-mug | model (lite copy) | 9 | [0.12, 0.097, 0.093] | [0.12, 0.09, 0.1] | scale 1.073, worst side x1.15 | front is -y as built; proportions within x2 of size_m |
| couch | model (lite copy) | 20 | [2.014, 1.086, 1.067] | [2.0, 0.9, 0.85] | scale 0.869, worst side x1.14 | front is -y as built; proportions within x2 of size_m |
| counting-game-board | model (lite copy) | 20 | [0.455, 0.453, 0.051] | [0.45, 0.45, 0.02] | scale 0.991, worst side x1.59 | front is -y as built; proportions within x2 of size_m |
| dining-table | model (lite copy) | 4 | [2.008, 0.737, 0.693] | [2.0, 0.9, 0.76] | scale 1.1, worst side x1.11 | front is -y as built; proportions within x2 of size_m |
| film-camera | model (lite copy) | 1 | [0.14, 0.076, 0.099] | [0.14, 0.08, 0.09] | scale 0.984, worst side x1.08 | front is -y as built; proportions within x2 of size_m |
| game-box | model (lite copy) | 20 | [0.491, 0.349, 0.398] | [0.48, 0.48, 0.08] | scale 0.647, worst side x2.82, axes turned [90, 0, 90] | model is the box with its lid open (0.49 x 0.35 x 0.40 against a flat 0.48 x 0.48 x 0.08); axes turned to fit |
| guest-lamp | model (lite copy) | 27 | [0.361, 0.313, 0.452] | [0.25, 0.25, 0.45] | scale 0.995, worst side x1.44 | model 0.36 x 0.31 x 0.45 against 0.25 x 0.25 x 0.45: wider shade |
| guestbook | model (lite copy) | 20 | [0.301, 0.226, 0.064] | [0.3, 0.22, 0.04] | scale 0.985, worst side x1.25 | front is -y as built; proportions within x2 of size_m |
| hand-sewn-book | model (lite copy) | 3 | [0.302, 0.261, 0.122] | [0.3, 0.25, 0.08] | scale 0.854, worst side x1.31 | front is -y as built; proportions within x2 of size_m |
| jamies-bag | model (lite copy) | 1 | [0.602, 0.361, 0.463] | [0.6, 0.3, 0.3] | scale 0.813, worst side x1.26 | front is -y as built; proportions within x2 of size_m |
| ladder-back-chair | model (lite copy) | 64 | [0.496, 0.426, 0.952] | [0.45, 0.45, 0.95] | scale 0.997, worst side x1.1 | front is -y as built; proportions within x2 of size_m |
| lectern | model (lite copy) | 3 | [0.514, 0.523, 1.204] | [0.6, 0.5, 1.2] | scale 0.997, worst side x1.17 | front is -y as built; proportions within x2 of size_m |
| paper-map | model (lite copy) | 2 | [0.251, 0.203, 0.059] | [0.25, 0.18, 0.01] | scale 0.939, worst side x2.35 | front is -y as built; a thin side (a page, a map, a pad) is 2.4 times thicker than size_m, the other sides fit |
| quilted-bed | model (lite copy) | 1 | [1.365, 2.014, 1.181] | [1.0, 2.0, 1.0] | scale 0.851, worst side x1.17 | model 1.37 x 2.0 x 1.2 against 1.0 x 2.0 x 1.0: wider and higher than size_m |
| rag-rug | model (lite copy) | 48 | [1.815, 1.739, 0.186] | [1.8, 1.2, 0.02] | scale 0.827, worst side x2.78, axes turned [0, 0, 90] | model is a thick braided mat (0.19 m high against 0.02); axes turned to fit |
| rucksack | model (lite copy) | 2 | [0.473, 0.413, 0.503] | [0.35, 0.22, 0.5] | scale 0.994, worst side x1.87 | front is -y as built; proportions within x2 of size_m |
| sampler | model (lite copy) | 20 | [0.557, 0.062, 0.505] | [0.4, 0.03, 0.5] | scale 0.99, worst side x1.43 | framed sampler, stitched motifs blur to abstract at render scale; no figure reads |
| sketchbook | model (lite copy) | 3 | [0.223, 0.3, 0.064] | [0.22, 0.3, 0.02] | scale 0.993, worst side x1.79 | front is -y as built; proportions within x2 of size_m |
| tarp | model (lite copy) | 4 | [1.998, 1.867, 0.748] | [2.0, 1.5, 0.4] | scale 0.755, worst side x1.41 | front is -y as built; proportions within x2 of size_m |
| toy-shelf | model (lite copy) | 80 | [2.409, 0.928, 3.235] | [2.4, 0.4, 2.2] | scale 0.68, worst side x1.58 | model 2.4 x 0.93 x 3.2 against 2.4 x 0.4 x 2.2: taller and deeper than size_m, scaled to the box height |
| trapdoor | named box proxy | 20 | | | | proportions: a side is off by x4.1 after the best fit |
| wood-stove | model (lite copy) | 20 | [0.579, 0.579, 0.807] | [0.6, 0.6, 0.8] | scale 0.992, worst side x1.05 | front is -y as built; proportions within x2 of size_m |

All 27 ledger entries were read: 26 built, `altar` failed. Of the 26, 25 were swapped (`trapdoor` was rejected by the fit); the altar and the trapdoor are named box proxies.

## Phase D and gaps

41 scenes, the eye-height player-start still of every scene and one overview per location: 93 stills in the ledger. Contact sheets:
`renders/stuffed-ones/<location>.jpg`; ledger: `ledger.json`. Not produced: the depth and object-index passes. The models are lite copies, so
close-ups of small props show decimation artefacts (flat things such as the programme and the logbook suffer most).

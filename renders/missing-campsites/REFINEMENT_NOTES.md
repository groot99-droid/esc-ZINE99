# missing-campsites: refinement notes (render and refinement plan, sixth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the author;
some are also applied inside the driver only (`tools/render/overrides.json`, `tools/render/rig.json`). 24 scenes in 13 locations
(24 hero at 2560x1440 / 256 samples, the rest 1920x1080 / 128). Each scene's own lights, world, camera and lens were used; the rig adds
exposure only (no fill light was added anywhere). Built with real models for 18 of 30 object types (phase C), box proxies for the rest.

## Owner decisions

1. **Heron imagery.** The references of entrance-booth, gravel-clearing and other-entrance show a heron painted on the entrance sign, and the `heron-sign` model shows the same heron. The rule is no creatures in any frame, so the sheets of those three locations carry a text card in place of the reference and `heron-sign` stays a named box proxy (`sign-board`). Say if a pictogram on a sign is acceptable: the reference and the model can then be restored (one `reference_card` line each in `tools/render/rig.json`, one `skip` in the models list).
2. **The facing convention** and **the flat props' `height_m`** (see phase A): both are build-file questions for you.
3. **Models are lite copies** (about 12k triangles, 512 px) because the upload to the render box ran at about 50 KB/s.
4. Seven objects have no usable model yet (`bicycle`, `cooler`, `firewood-bundle`, `hiking-pack`, `notebook`, `postcard`, `upright-piano` failed in the ledger; `fire-ring` has no entry; `camp-lantern` has a glb in the build folder but no ledger entry, so it was not used).

## Phase A: flagged scenes (10 flagged in the first pass) and what the driver found

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| entrance-booth / booth_day2, supper_for_two (booth_day1, payphone_night1 too) | the booth window is an `opening` piece with an opaque glass material, between the camera and the counter | the rig draws the `glass` material 12% opaque in entrance-booth and other-entrance (`piece_alpha`) | `/blockout/booth-window` remove (the wall already leaves the gap), or give the build format a glass alpha |
| entrance-booth / booth_day1 | the camera `[-2.0, -0.4, 1.45]` stands inside the box of prop `van` (2.2 x 4.8 x 2.2 at `[-1.6, -1, 0]`); the driver found it | the van is left out of this scene (override `hide_props`: the camera sits in the van, so the still shows the booth from its position) | `/scenes/booth_day1/hide` add `"van"`, or an open-cab van model |
| fire-ring / campfire_night1, campfire_night2 | prop `cooler` base `[4.2, -0.2, 0]` is inside the solid block `table-legs` (the first-pass flag) | moved to `[5.5, -0.2, 0]` beside the table | `/props/cooler/location` `[5.5, -0.2, 0]` |
| loop-road / loop_day1, loop_day2am, loop_day2pm, ordinary_morning | prop `tent-17` base `[-26, 48, 0]` is inside the 100 m block `inner-forest` (y -50 to 50) | moved onto the east pads, `[-26, 62, 0]` | `/props/tent-17/location` `[-26, 62, 0]` |
| other-entrance / other_entrance | the camera `[3.5, -3.6, 1.8]` is inside the booth and looks +y through its solid back wall `booth-back` (the window faces -y) | camera moved to `[1.4, -5.6, 1.7]` (outside the booth's front corner, on the road), same look_at; player start moved with it | `/scenes/other_entrance/camera/location` `[1.4, -5.6, 1.7]`; `/scenes/other_entrance/player_start/location` `[1.4, -5.6, 0.15]` |
| tam-flat / home_apartment | the sight line to the study doorway crosses the partition piece `part-b` | camera moved 2.2 m west to `[-1.4, -3.8, 1.65]`; the line now passes the doorway | `/scenes/home_apartment/camera/location` `[-1.4, -3.8, 1.65]`; `/scenes/home_apartment/player_start/location` `[-1.4, -3.8, 0]` |
| other-side-sites / wrong_forest | (driver) the look_at `[0, 12, 4]` lies inside the trunk `glyph-a6`, dead centre in the frame | rendered as built | `/scenes/wrong_forest/camera/look_at` `[8, 12, 4]` (the gap between `glyph-a6` and `glyph-a7`) |

Before and after: `flagged-before-after.jpg` (before = `--no-overrides 1`, 0.4 scale at 25% of the samples, no models; after = the final still).

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| five-sites / channel_two | with the real `split-boulder` model (4.0 x 3.1 x 1.4 m, a little larger than the box in plan) the camera `[-38.4, -7.2, 1.15]` stood inside the rock | camera moved 0.8 m away from the boulder, `[-37.67, -7.54, 1.15]` (override); proposed `/scenes/channel_two/camera/location` the same |
| five-sites | `ring-20` to `ring-24`, `post-*`, `table-*`, `tent-*` overlap their pad or verge pieces (base gap -0.06 to -0.08 m) | none (sunk 6 to 8 cm into the pad) |
| gravel-clearing | tables, tents and the ring overlap the `clearing` piece (-0.08 m) | none |
| loop-road | rings and posts sunk 3 to 5 cm into the pads; `owl-box` overlaps `pine-3-trunk` (9 of 27), `quiet-hours-board` the `quiet-post` | none (mounted on them) |
| other-entrance | `map-1` inside `map-rack` (6 of 27); `heron-panel` overlaps `booth-front-lower` | none (a map in its rack; a panel on the wall) |
| entrance-booth | `payphone` overlaps `phone-post` (3 of 27) | none (it hangs on the post) |
| fire-ring | `chair-1` and `chair-5` overlap the logs (3 of 27) | none |
| van-interior | `van-keys` overlap `dashboard` (9 of 27) | none (they lie on it) |

## The facing convention (both games)

`player_start.facing_deg` is not defined beyond "0 faces +y" in `docs/BLENDER.md`. Read as a compass bearing (90 faces +x) the
camera and the facing agree in 23 of 41 stuffed-ones scenes and 10 of 24 missing-campsites scenes; read as a rotation about Z
(90 faces -x, `rig.json` `facing: "ccw"`) they agree in 33 of 41 and 23 of 24. The driver reads `ccw` for these two games.
PROPOSED: say so in `docs/BLENDER.md` ("`facing_deg` is a rotation about Z: 0 faces +y, 90 faces -x"). Scenes whose facing still
disagrees with the camera by more than 30 degrees under that reading (the player-start still looks elsewhere than the scene camera):

- other-entrance / past_the_window (-20 against -15, 3.2 m between start and camera)
## Flat props are shrunk to a few percent (missing-campsites)

`height_m` on a prop scales the whole prop uniformly to that height. Thirteen props of missing-campsites carry the height they have
**lying flat** (a notebook `height_m 0.02`, a postcard `0.002`, a programme `0.002`, a smartphone `0.01`, the paper map `0.01`, the
logbook `0.05`) together with `rotation_deg [90, 0, ...]`, which lays them down: the build then scales a 0.15 x 0.21 m notebook to
1.4 x 2 cm. The driver renders them at their `size_m` (override `target_height_m` = the size_m height, per location). PROPOSED:
remove `height_m` from these props (the rotation already makes them lie flat):

| Location | Props |
| --- | --- |
| creek-trail | `notebook` |
| entrance-booth | `paper-map`, `logbook` |
| five-sites | `notebook`, `postcard` |
| other-side-sites | `phone-1`, `phone-2`, `logbook` |
| school-hall | `programme` |
| stairwell | `notebook` |
| tam-flat | `notebook`, `smartphone` |
| van-interior | `notebook` |

`heron-panel` (other-entrance, `height_m 0.9` against 2.2) and `tent-abel` (1.1 against 1.3) are deliberate reductions and were left.

## Phase B: the rig per location (overview against its reference)

Reference images are 1600 x 900 images from each design's prompt (`games/missing-campsites/assets/locations/<id>.jpg`). The overviews are corner or
along-the-path views from the driver's own camera at eye height with a wide lens, lit by the scene named below; they match layout and
rough light direction, not detail. Only the rig changed (`tools/render/rig.json`): scene exposure from a look pass on quick renders
(mean display value toward 0.22, capped at -3.5 and +1.0 EV), `overview_ev`, the overview camera. Values are by eye after that.

| Location | Overview lighting scene | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, lens) |
| --- | --- | --- | --- | --- |
| creek-trail | creek_trail | creek_trail -1.1 | -0.7 | [-100, 8, 1.7] to [-60, -4, 0.6], 20 mm |
| entrance-booth | booth_day1 | booth_day1 +1.0, booth_day2 -1.0, payphone_night1 +1.0, supper_for_two -1.3 | -2.0 | [0, -10, 1.7] to [0, 6, 1.8], 20 mm |
| fire-ring | campfire_night1 | campfire_night1 +0.0, campfire_night2 +0.0 | +2.4 | [0, -5, 1.5] to [0, 3, 1.0], 22 mm |
| five-sites | fixed_sites_day1 | channel_two +0.0, dusk_choice +0.0, fixed_sites_day1 -1.5, fixed_sites_day2 -2.1 | -1.4 | [-85, -22, 1.7] to [-40, 5, 1.5], 22 mm |
| gravel-clearing | gravel_morning | gravel_morning -2.0 | -1.7 | [6, -790, 1.7] to [0, -640, 3], 24 mm |
| loop-road | loop_day1 | loop_day1 -2.1, loop_day2am -1.8, loop_day2pm +0.0, ordinary_morning -1.8 | -1.1 | [20, 58, 1.7] to [62, 62, 1.0], 22 mm |
| other-entrance | other_entrance | other_entrance -2.6, past_the_window -2.6 | -2.2 | [-3, -11, 1.7] to [3.5, -4, 1.4], 28 mm |
| other-side-sites | wrong_forest | wrong_forest -1.7 | -1.5 | [0, -16, 1.7] to [0, 4, 2], 28 mm |
| school-hall | recital | recital -1.4 | +1.4 | [0, -8.5, 1.7] to [0, 8, 1.8], 24 mm |
| stairwell | mothers_door | mothers_door -1.9 | -1.2 | [1.5, -2.6, 1.7] to [-0.8, 2, 2.5], 20 mm |
| tam-flat | home_apartment | home_apartment -2.7 | -2.4 | [4, -3.5, 1.6] to [-2, 2, 1.3], 20 mm |
| the-clearing | the_clearing | the_clearing -2.7 | -2.5 | [1.5, -16.6, 1.1] to [0, 0, 1.2], 28 mm |
| van-interior | drive_home | drive_home -2.2 | -1.9 | [0.5, -1.9, 1.2] to [0, 2, 1.1], 20 mm |


Deltas the rig cannot close: no foliage (the forest is cones, cylinders and one green block), no texture on the gravel, no water shader on the creeks, no fog or haze; the references' golden light and long tree shadows are not reproduced (the build files' suns are used as given); the school hall's chairs and curtains, the stairwell's carpet and the flat's furniture are not built.

## Phase C: models

Ledger read: `games/missing-campsites/assets/models.json` on branch comfy-models-3d (commit 824ad55, read-only, taken 2026-11-22; the session was
still building). Only `built` entries were used; the models were copied to the render box as lite copies (decimated to about 12k triangles,
512 px JPEG textures, because the link to the box ran at about 50 KB/s); nothing was copied into the repo. Fit: see `tools/render/README.md`
(batch 6). I looked at every model from front and three-quarter views: the front is -y for all of them, none shows a person or creature, except `heron-sign` (a heron painted on the sign), which stays a box proxy named `sign-board`.

| Object | Source | Props | Model size (m) | Box size_m x scale (m) | Fit | Problems |
| --- | --- | --- | --- | --- | --- | --- |
| bicycle | named box proxy | 7 | | | | ledger status failed |
| blue-kettle | model (lite copy) | 2 | [0.252, 0.292, 0.331] | [0.25, 0.2, 0.22] | scale 0.664, worst side x1.49 | front is -y as built; proportions within x2 of size_m |
| booth-radio | model (lite copy) | 4 | [0.252, 0.109, 0.237] | [0.25, 0.12, 0.18] | scale 0.941, worst side x1.24 | front is -y as built; proportions within x2 of size_m |
| camera | model (lite copy) | 1 | [0.141, 0.117, 0.08] | [0.14, 0.08, 0.09] | scale 0.915, worst side x1.34 | front is -y as built; proportions within x2 of size_m |
| camp-chair | model (lite copy) | 23 | [0.714, 0.669, 0.853] | [0.6, 0.6, 0.85] | scale 0.997, worst side x1.19 | model 0.71 x 0.67 x 0.85 against 0.6 x 0.6 x 0.85 |
| camp-lantern | named box proxy | 5 | | | | no ledger entry (a glb exists in the build folder; not used) |
| camper-van | model (lite copy) | 5 | [2.184, 4.812, 2.896] | [2.0, 4.8, 2.2] | scale 0.885, worst side x1.17 | model 2.18 x 4.81 x 2.90 against 2.0 x 4.8 x 2.2: 0.7 m taller |
| chalkboard | model (lite copy) | 7 | [0.708, 0.693, 1.006] | [0.6, 0.4, 1.0] | scale 0.994, worst side x1.72 | front is -y as built; proportions within x2 of size_m |
| cooler | named box proxy | 6 | | | | ledger status failed |
| fire-ring | named box proxy | 36 | | | | no ledger entry |
| firewood-bundle | named box proxy | 11 | | | | ledger status failed |
| heron-sign | named box proxy | 8 | | | | model skipped: the model shows a heron painted on the sign (a creature): no creature imagery, so the proxy stays |
| hiking-pack | named box proxy | 1 | | | | ledger status failed |
| logbook | model (lite copy) | 4 | [1.823, 1.236, 0.432] | [0.32, 0.05, 0.42] | scale 0.23, worst side x1.41, axes turned [0, 90, 90] | model is 1.8 x 1.2 x 0.43 (the ledger's scale is 5-fold off); axes turned and scaled to 0.24 |
| master-map | model (lite copy) | 5 | [0.91, 0.089, 0.699] | [0.9, 0.04, 0.65] | scale 0.959, worst side x1.46 | front is -y as built; proportions within x2 of size_m |
| notebook | named box proxy | 8 | | | | ledger status failed |
| owl-box | model (lite copy) | 2 | [0.295, 0.355, 0.604] | [0.35, 0.35, 0.6] | scale 0.993, worst side x1.2 | front is -y as built; proportions within x2 of size_m |
| paper-map | named box proxy | 5 | | | | proportions: a side is off by x3.3 after the best fit |
| payphone | model (lite copy) | 4 | [0.673, 1.043, 2.005] | [0.35, 0.3, 2.0] | scale 0.53, worst side x1.88 | model 0.67 x 1.04 x 2.0 against 0.35 x 0.3 x 2.0: much deeper than size_m |
| picnic-table | model (lite copy) | 34 | [1.814, 1.373, 0.815] | [1.8, 1.6, 0.75] | scale 1.021, worst side x1.14 | front is -y as built; proportions within x2 of size_m |
| postcard | named box proxy | 5 | | | | ledger status failed |
| programme | named box proxy | 1 | | | | proportions: a side is off by x7.8 after the best fit |
| quiet-hours-board | model (lite copy) | 5 | [0.606, 0.104, 0.398] | [0.6, 0.03, 0.4] | scale 0.997, worst side x1.86 | front is -y as built; proportions within x2 of size_m |
| register-box | model (lite copy) | 4 | [0.549, 0.521, 1.402] | [0.4, 0.3, 1.4] | scale 0.998, worst side x1.73 | model 0.55 x 0.52 x 1.4 against 0.4 x 0.3 x 1.4: wider |
| site-post | model (lite copy) | 96 | [0.297, 0.285, 1.202] | [0.15, 0.15, 1.2] | scale 0.999, worst side x1.98 | model 0.3 x 0.29 x 1.2 against 0.15 x 0.15 x 1.2: twice the width |
| smartphone | model (lite copy) | 3 | [1.753, 0.866, 0.162] | [0.075, 0.01, 0.15] | scale 0.086, worst side x1.18, axes turned [0, 90, 90] | model is a 1.75 m slab (the ledger scaled it by the wrong side); axes turned and scaled to 0.09 |
| split-boulder | model (lite copy) | 5 | [4.026, 3.094, 1.44] | [4.0, 3.0, 2.2] | scale 1.137, worst side x1.34 | model 4.0 x 3.1 x 1.4 against 4.0 x 3.0 x 2.2: lower than size_m |
| tent | model (lite copy) | 33 | [2.2, 1.798, 1.243] | [1.862, 1.692, 1.1] | scale 0.89, worst side x1.06 | dome tent; the doorway faces -y |
| upright-piano | named box proxy | 1 | | | | ledger status failed |
| van-keys | model (lite copy) | 2 | [0.175, 0.162, 0.121] | [0.08, 0.02, 0.12] | scale 0.383, worst side x2.31, axes turned [90, 0, 0] | model 0.18 x 0.16 x 0.12 with the cork fob against 0.08 x 0.02 x 0.12; axes turned and scaled |

All 28 ledger entries were read (plus `camp-lantern`, which has a glb and no entry): 21 built entries were swapped in; `heron-sign` was skipped (creature), `paper-map` and `programme` were rejected by the fit.

## Phase D and gaps

24 scenes, the eye-height player-start still of every scene and one overview per location: 61 stills in the ledger. Contact sheets:
`renders/missing-campsites/<location>.jpg`; ledger: `ledger.json`. Not produced: the depth and object-index passes. The models are lite copies, so
close-ups of small props show decimation artefacts (flat things such as the programme and the logbook suffer most).

## Models re-render (2026-11-23)

Every built model of `games/missing-campsites/assets/models.json` (the ComfyUI session's ledger in the other working copy, re-read at the start of the run, status `built` only; read only, never copied into this repo) replaces its box proxy, and all 24 scenes and 13 overviews were rendered again with the earlier rig, overrides, flags and fixes unchanged (Phases A and B are not redone). The render copies are the full 80k-triangle models re-exported with 1024 px JPEG textures (made in Blender because the render box's upload link is slow; the originals stay out of the repo).

- **Ledger state**: 30 entries: 29 built, 1 failed.
- **Proxy to model**: 26 object types, 308 of 333 prop instances: `bicycle`, `blue-kettle`, `booth-radio`, `camera`, `camp-chair`, `camp-lantern`, `camper-van`, `chalkboard`, `cooler`, `fire-ring`, `hiking-pack`, `logbook`, `master-map`, `notebook`, `owl-box`, `payphone`, `picnic-table`, `postcard`, `quiet-hours-board`, `register-box`, `site-post`, `smartphone`, `split-boulder`, `tent`, `upright-piano`, `van-keys`.
- **Still a named box proxy**: `firewood-bundle` (no model used: ledger status failed), `heron-sign` (model skipped: a heron engraved on the sign board (a creature drawn on the model)), `paper-map` (proportions: a side is off by x3.3 after the best fit), `programme` (proportions: a side is off by x7.8 after the best fit) (25 prop instances).
- **Front direction (-y)**: every built model was viewed from -y and from 50 degrees beside it on a montage before the run (Blender workbench). The driver keeps a model's own orientation unless it fits worse than a factor of 3 and then tries the six axis permutations; turned: logbook [0, 90, 90], notebook [90, 0, 0], postcard [90, 0, 0], smartphone [0, 90, 90], van-keys [90, 0, 0].
- **Figures and creatures**: no built model shows a person or creature; `heron-sign` (a heron engraved on the sign board) is skipped and stays a named box proxy, as the heron reference images are already replaced by text cards.
- **Fit (ledger `objects`, `props[].fit`)**: scale uniform; worst side ratio between model and `size_m` box over 1.8: hiking-pack x1.89, payphone x1.87, quiet-hours-board x1.83, site-post x1.97, van-keys x2.30. These models are as proportioned by the generator (the box's `size_m` is the author's guess); none was stretched. No fit was rejected.
- **Proportion problems the ComfyUI ledger records** (largest requested side matched, uniform scale): bicycle: proportions differ from size_m (axis ratios 1.00, 0.59, 0.80); scaled uniformly so its largest requested side matches; blue-kettle: proportions differ from size_m (axis ratios 1.00, 0.69, 0.67); scaled uniformly so its largest requested side matches; booth-radio: proportions differ from size_m (axis ratios 1.00, 1.12, 0.76); scaled uniformly so its largest requested side matches; camera: proportions differ from size_m (axis ratios 1.00, 0.69, 1.13); scaled uniformly so its largest requested side matches; chalkboard: proportions differ from size_m (axis ratios 0.85, 0.58, 1.00); scaled uniformly so its largest requested side matches; fire-ring: proportions differ from size_m (axis ratios 1.00, 0.95, 0.50); scaled uniformly so its largest requested side matches; hiking-pack: proportions differ from size_m (axis ratios 0.63, 0.53, 1.00); scaled uniformly so its largest requested side matches; logbook: proportions differ from size_m (axis ratios 0.18, 0.04, 1.00); scaled uniformly so its largest requested side matches; master-map: proportions differ from size_m (axis ratios 1.00, 0.57, 0.95); scaled uniformly so its largest requested side matches; notebook: proportions differ from size_m (axis ratios 0.15, 0.03, 1.00); scaled uniformly so its largest requested side matches; payphone: proportions differ from size_m (axis ratios 0.53, 0.29, 1.00); scaled uniformly so its largest requested side matches; postcard: proportions differ from size_m (axis ratios 1.00, 0.02, 21.14); scaled uniformly so its largest requested side matches; quiet-hours-board: proportions differ from size_m (axis ratios 1.00, 0.30, 1.01); scaled uniformly so its largest requested side matches; register-box: proportions differ from size_m (axis ratios 0.73, 0.58, 1.00); scaled uniformly so its largest requested side matches; site-post: proportions differ from size_m (axis ratios 0.51, 0.53, 1.00); scaled uniformly so its largest requested side matches; smartphone: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 0.04, 0.01, 1.00); scaled uniformly so its largest requested side matches; split-boulder: proportions differ from size_m (axis ratios 1.00, 0.97, 1.54); scaled uniformly so its largest requested side matches; van-keys: proportions differ from size_m (axis ratios 0.46, 0.12, 1.00); scaled uniformly so its largest requested side matches.
- **Tone**: the models change the frame's average brightness, so per-scene `exposure_ev` and `overview_ev` in `tools/render/rig.json` were re-matched to the box-proxy pass's mean luminance (damped log2 ratio, from look passes at 0.4 scale and 25 % samples of the box run and the model run; changed only where the two differed by more than 10 %). No light, world, camera or lens was changed.
- **Camera inside a model**: none (`camera_inside_prop` empty in every scene). Informational `prop_overlap` entries stay in the ledger.
- **Proposed diffs** (not applied): none new from the models. The earlier proposals stand; where a model is much larger than its box the author may want `size_m` in `assets.json` corrected to the model's proportions.
- `flagged-before-after.jpg` was redone with the models ("before" = build file as it is, 0.4 scale, 25 % samples; "after" = final still).
- **Render-time fixes the models needed**: none; no camera stands inside a model. `paper-map` and `programme` are rejected by the fit (a flat map or card whose model is thick or open: x3.3 and x7.8) and stay named box proxies; `firewood-bundle` has no built model.
- GPU time on the rented RTX 4090 (measured from the box's run log): look passes 0.4 scale / 25 % samples: box 72 s, models 181 s; final 1639 s wall (run at the same time as the other two games' finals); before pass 41 s.

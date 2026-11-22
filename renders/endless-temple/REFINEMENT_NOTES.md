# endless-temple: refinement notes (render and refinement plan, eighth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the author;
each is also applied inside the driver only (`tools/render/overrides.json`, `tools/render/rig.json`). 44 scenes in 15 locations
(39 hero at 2560x1440 / 256 samples, 5 standard at 1920x1080 / 128). Each scene's own lights, world, camera and lens
were used; the rig adds exposure only (no fill light, world change or fog was added anywhere). Named box proxies for every prop (no model is built for this game yet) (phase C).
No person or creature is in any frame; the sheets show only the driver's stills and the location references (a reference that shows figures or heads is left out).

## Owner decisions

1. **No models exist.** `games/endless-temple/assets/models.json` lists 10 entries and every one has status failed (none is built), so every prop is a named box proxy. Say when the ComfyUI session should retry them; the driver swaps them in with `--models`.
2. **Walled-yard reference left out.** The reference shows a painted lizard-like figure on the back wall, so by the no-creatures rule its sheet carries a text card. Say if the image may be shown.
3. **Proposed build-file diffs** (phase A: one first-pass flag and the driver's own finds). Applied at render time only; no build file was changed. The ones that matter most: the `wagon-canopy` sphere is solid (the scribe's scroll and quill sit inside it), and the `loft-slats`, `rain-window` and `dome` pieces shut out the lights two scenes depend on (they rendered black).
4. **The facing convention.** `facing_deg` agrees with the scene camera in 36 of 39 scenes read as a rotation about Z and 19 read as a compass bearing. Same proposal as for the other games.
5. **The blockouts are flat-coloured boxes**, so the overviews match layout and light colour only; the references are painted (see Deltas below).

## Phase A: flagged scenes (1 flagged in the first pass) and what the driver found

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| procession-road / s3_scribe_wagon | the first-pass flag: `wagon-body` and `wagon-canopy` stand between the camera `[147.2, -1.8, 1.5]` and its look_at `[149.6, 0, 1.8]`; the look_at, `scroll` and `quill` are inside the solid canopy sphere (also in s3_procession_road, s3_procession_choice) | location-level blockout replacement: the canopy becomes a roof slab, two posts and a back panel (open at the front); scene camera override z 1.8 (clear of the wagon bed, top at z 1.7) | `/blockout` `wagon-canopy`: replace by a roof box `[2.4, 1.9, 0.12]` at `[149.6, 0, 3.0]` plus posts and back panel; `/scenes/s3_scribe_wagon/camera/location` `[147.2, -1.8, 1.8]` |
| deep-desert / s3_herd_sighting | found by the driver: the camera `[2, 163, 11.05]` is below the crest's top (y 170, z 11), so the line to the horizon meets `crest` | camera override: look_at `[0, 400, 10.5]` | `/scenes/s3_herd_sighting/camera/look_at` `[0.0, 400.0, 10.5]` (or the camera at y 171) |
| father-camp / s3_father_walk | found by the driver: the camera `[-4, 2.5, 1.65]` faces `dune-back` (a sphere 4 m high, 9 m ahead) | camera override: on the dune's crest `[-4, 15, 5.65]` looking at `[-4, 40, 5]` | `/scenes/s3_father_walk/camera` same |
| father-camp / s3_father_camp, s3_camp_mark_c6 | found by the driver: `journal` base z 0 is inside `flat-stone` (top z 0.18) | prop override: z 0.18 (on the stone) | `/props` `journal` `location` `[-3.4, 0.35, 0.18]` (the note says "under a stone": lower the stone instead if so) |
| xandri-hut / s3_hut_night | found by the driver: the scene rendered black, the solid `dome` shuts out both moon-shaft spots (the roof holes are not built); `pack` sits 0.136 m inside the hut wall | blockout replacement: the dome is left out; `pack` to x 1.0 | `/blockout` `dome`: add roof holes (or split into panels with gaps under the spots); `/props` `pack` `location` `[1.0, -0.4, 0.0]` |
| clerk-office / s3_hollin_choice, s3_clerk_office | found by the driver: the opaque `loft-slats` and `rain-window` pieces (role opening) shut out the lightning and the window light (s3_hollin_choice rendered black) | blockout replacement: both left out (open gaps) | `/blockout` `loft-slats`, `rain-window`: make them gaps in the wall pieces, or draw them translucent |

Before and after: `flagged-before-after.jpg` (before = `--no-overrides 1`, 0.4 scale at 25% of the samples, no models; after = the final still). s3_herd_sighting and s3_father_walk read as empty haze after the fix: what they look at (the herd, the walk beyond the dune) lies beyond the bounds of the set, so the blockout holds only sand and sky there.

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| storyteller-hut / s3_circle, e_returned | `storyteller-seat` stands between the camera and its look_at | none (the look_at is the seat) |
| village-well / s3_well_post | `store-roof` (cone, role ceiling) stands between the camera and its look_at | none (the look_at is the roof-gap on the roof) |

## The facing convention

`player_start.facing_deg` is not defined beyond "0 faces +y" in `docs/BLENDER.md`. Bark: 19 of 22 scenes with a start have facing 0, so both readings agree. Endless-temple: read as a compass bearing the facing and the scene camera agree in 19 of 39 scenes; read as a rotation about Z (90 faces -x, `rig.json` `facing: "ccw"`) in 36 of 39. The driver reads `ccw` for both games. PROPOSED: say so in `docs/BLENDER.md` ("`facing_deg` is a rotation about Z: 0 faces +y, 90 faces -x"), as already proposed for the earlier games.

## Phase B: the rig per location (overview against its reference)

Reference images are 1600 x 900 images from each design's prompt (`games/endless-temple/assets/locations/<id>.jpg`). The overviews are views from the driver's own camera
at about eye height with a wide lens, lit by the scene named below; they match layout and rough light direction, not detail. Only the rig changed (`tools/render/rig.json`):
per-scene exposure from a look pass on quick renders (mean display value toward 0.22, capped at -5.5 and +3.5 EV), `overview_ev`, the overview camera and the overview's lighting
scene. No light, world gain or fog was added. The overview cameras were set in two look rounds by eye (the scene cameras and lenses themselves are untouched).

| Location | Overview lighting scene | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, lens) | Reference |
| --- | --- | --- | --- | --- | --- |
| abyss-edge | s3_abyss_dream | s3_abyss_dream +1.9, s3_abyss_return +1.9 | +1.5 | [0, -2, 1.7] to [0, 6, 2.5], 24 mm | image |
| clerk-office | s3_clerk_office | s3_clerk_office +0.6, s3_hollin_choice -3.5 | +0.0 | [-3.2, -2.5, 1.8] to [1, 2.5, 2.5], 18 mm | image |
| deep-desert | s3_deep_desert | s3_deep_desert -4.7, s3_herd_sighting -3.1, s3_xandrix_back -4.3 | +0.0 | [0, -240, 1.5] to [0, 0, 3], 28 mm | image |
| elaris-room | s3_room_morning | s3_room_morning -1.5 | +0.0 | [0, -2.2, 1.5] to [0, 2.5, 1.2], 20 mm | image |
| father-camp | s3_father_camp | s3_camp_mark_c6 -0.5, s3_father_camp -1.8, s3_father_walk -2.5, s3_herd_final -1.8, s3_ring_of_stones +0.0 | +0.0 | [5, -8, 2.2] to [-1, 2, 1.5], 28 mm | image |
| hollin-streets | s3_hollin_streets | s3_hollin_streets +0.0 | +0.0 | [-55, 0, 1.6] to [40, 0, 5], 24 mm | image |
| pantry | s3_pantry_c1 | s3_ledger_turned +0.0, s3_pantry_c1 +0.0, s3_pantry_c3 +0.0, s3_pantry_c8 +1.0 | +0.0 | [0, -1.6, 1.7] to [0, 2, 1.6], 18 mm | image |
| procession-road | s3_procession_road | s3_procession_choice -1.1, s3_procession_road -1.8, s3_scribe_wagon +0.0 | +0.0 | [-200, -8, 2.5] to [-60, 0, 2], 28 mm | image |
| silver-dunes | s3_moonlit_dunes | s3_cairns -4.7, s3_dunes_day -4.7, s3_dunes_night +0.7, s3_evening_camp -1.1, s3_moonlit_dunes -0.9 | +0.0 | [0, -140, 3.5] to [0, -60, 12], 24 mm | image |
| storyteller-hut | s3_circle | e_returned -1.5, s3_circle -1.5, s3_village_return -1.6 | +0.0 | [0, 4.3, 1.8] to [0, -3, 1.3], 20 mm | image |
| temple-halls | s3_halls_c1 | e_named +0.0, e_rider -1.3, e_stayed -1.3, e_unread -1.4, s3_halls_c1 -1.4, s3_halls_c3 -1.2, s3_halls_c5 -0.9, s3_halls_c6 -1.5, s3_halls_c7 +0.0, s3_halls_c8 +0.0, s3_last_cup -1.5 | +0.0 | [-18, -6, 1.8] to [8, 2, 3], 20 mm | image |
| unlit-gallery | s3_unlit_gallery | s3_unlit_gallery +3.5 | +1.0 | [-9.5, 0.3, 2.2] to [9, 1.5, 2], 20 mm | image |
| village-well | s3_well_post | s3_well_post +0.6 | +0.0 | [-7, -5, 1.6] to [2, 2, 2.5], 24 mm | image |
| walled-yard | s3_seclusion | s3_seclusion -1.6 | +0.0 | [0, -3.2, 1.3] to [0, 3, 1.5], 20 mm | text card (no figure imagery) |
| xandri-hut | s3_hut_night | s3_hut_night -1.5 | +2.0 | [-0.3, -1.8, 1.5] to [0.2, 1.5, 1], 20 mm | image |

Deltas the rig cannot close: the blockouts are flat-coloured boxes: no painted line work, no jars on the pantry shelves (the specimen jars are box proxies, the shelves read empty), no stone or timber texture in the halls, no cracked-sand pattern or mountains in the dunes, no mist over the abyss, no thatch in the huts; the references are painted illustrations; light colours and directions follow the build files' own lights (the rig changed exposure only: no light, world or fog was added or changed).

## Phase C: models

Ledger read: `games/endless-temple/assets/models.json` in the ComfyUI session's checkout (read-only, 2026-11-22): 10 entries, all with status failed, and no `build/models/endless-temple/*.glb` exists. So nothing was swapped; every prop is a named box proxy (named by its prop id, sized from `assets.json`'s `size_m` scaled to the build file's height). Re-run with `--models` once the ledger has built entries.

| Object | Source | Props | Model size (m) | Box (m) | Fit | Note |
| --- | --- | --- | --- | --- | --- | --- |
| black-book | named box proxy | 2 | | | | ledger status failed (the glb download was cut short) |
| bookshelf | named box proxy | 43 | | | | ledger status failed (the glb download was cut short) |
| broom | named box proxy | 11 | | | | ledger status failed (the glb download was cut short) |
| campfire-ring | named box proxy | 9 | | | | no entry in the ComfyUI ledger |
| candlestick | named box proxy | 3 | | | | ledger status failed (the glb download was cut short) |
| clerk-umbrella | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| clerks-chair | named box proxy | 2 | | | | ledger status failed (the glb download was cut short) |
| cuckoo-clock | named box proxy | 11 | | | | no entry in the ComfyUI ledger |
| day-book | named box proxy | 6 | | | | no entry in the ComfyUI ledger |
| father-journal | named box proxy | 1 | | | | ledger status failed (the glb download was cut short) |
| giant-bone | named box proxy | 12 | | | | no entry in the ComfyUI ledger |
| hut-mirror | named box proxy | 1 | None | None | rejected (best axes None, worst side xNone) | the model is a broad sheet-like leaf (0.08 x 0.073 x 0.062 m) against a thin leaf box: the fit refuses it, the box proxy stays |
| kettle | named box proxy | 4 | | | | no entry in the ComfyUI ledger |
| library-ladder | named box proxy | 33 | | | | no entry in the ComfyUI ledger |
| lizard-plate | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| loft-bell | named box proxy | 2 | | | | no entry in the ComfyUI ledger |
| marker-pole | named box proxy | 5 | | | | ledger status failed (the glb download was cut short) |
| pilgrim-lantern | named box proxy | 24 | | | | no entry in the ComfyUI ledger |
| quill-pen | named box proxy | 4 | | | | ledger status failed (the glb download was cut short) |
| reading-chair | named box proxy | 11 | None | None | rejected (best axes None, worst side xNone) | the model is a broad sheet-like leaf (0.08 x 0.073 x 0.062 m) against a thin leaf box: the fit refuses it, the box proxy stays |
| sand-book | named box proxy | 11 | | | | no entry in the ComfyUI ledger |
| scribe-scroll | named box proxy | 4 | | | | no entry in the ComfyUI ledger |
| specimen-jar | named box proxy | 28 | | | | ledger status failed (the glb download was cut short) |
| stone-cairn | named box proxy | 37 | | | | no entry in the ComfyUI ledger |
| tea-tin | named box proxy | 12 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| teacup | named box proxy | 13 | | | | ledger status failed (the glb download was cut short) |
| travel-pack | named box proxy | 4 | | | | no entry in the ComfyUI ledger |
| waterskin | named box proxy | 2 | | | | ledger status failed (the glb download was cut short) |
| yesterdays-book | named box proxy | 11 | None | None | rejected (best axes None, worst side xNone) | the model is a broad sheet-like leaf (0.08 x 0.073 x 0.062 m) against a thin leaf box: the fit refuses it, the box proxy stays |
| zorlop-leaf-shoes | named box proxy | 1 | | | | no entry in the ComfyUI ledger |

## Phase D and gaps

44 scenes, the eye-height player-start still of every scene that has a start, and one overview per location: 98 stills in the ledger. Contact sheets:
`renders/endless-temple/<location>.jpg`; ledger: `ledger.json`. Not produced: the depth and object-index passes. The models are lite copies, so
close-ups of small props show decimation artefacts.

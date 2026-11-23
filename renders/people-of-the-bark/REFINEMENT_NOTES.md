# people-of-the-bark: refinement notes (render and refinement plan, eighth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the author;
each is also applied inside the driver only (`tools/render/overrides.json`, `tools/render/rig.json`). 23 scenes in 10 locations
(18 hero at 2560x1440 / 256 samples, 5 standard at 1920x1080 / 128). Each scene's own lights, world, camera and lens
were used; the rig adds exposure only (no fill light, world change or fog was added anywhere). Real models for 14 of 29 object types and named box proxies for the rest (phase C).
No person or creature is in any frame; the sheets show only the driver's stills and the location references (a reference that shows figures or heads is left out).

## Owner decisions

1. **Millimetre-scale sizes (unit question).** Every bark-world build file (nine of the ten locations) is built in millimetres: `bounds_m` 0.12 x 0.1 x 0.12 for bark-face, 0.12 x 0.1 x 0.3 for highridge, props such as the dwelling at 0.006 x 0.004 x 0.007 m and the ledger's glbs at the same sizes (`chant-drum` 0.004 x 0.004 x 0.005). Only the backyard (25 x 25 x 12 m, the garden swing 1.4 x 0.57 x 2.0 m) is at human scale. The sizes agree with each other (set, props, cameras at 15 to 50 mm), so this reads as a deliberate miniature (a world about a thousandth of the yard's size), not a slip. Rendered as the build files say. If the bark world is meant at human size, PROPOSED: multiply every `size_m`, `location`, camera and light position of the nine files and every bark `size_m` in `assets.json` by 1000 (light `energy` by 1000 squared). The driver already does this scaling at render time (`scene_scale` 1000 in `tools/render/render_scenes.py`), so the stills would not change. Say which.
2. **Highridge reference left out.** The reference shows the dwellings with carved face-like knots that read as small heads, so by the no-figures rule its sheet carries a text card. Say if the image may be shown.
3. **Proposed build-file diffs** (phase A below: the ten flagged scenes plus the driver's own finds). Applied at render time only; no build file was changed.
4. **The facing convention.** `player_start.facing_deg` is 0 in 19 of the 22 bark scenes that have one (the two readings agree). Same proposal as for the other games (below).
5. **Models are lite copies** (12k triangles, 512 px) because the render box's upload link is slow; a pass with the full 80k-triangle glbs needs a faster link. Say if you want it. 15 of the 19 ledger entries are built; falling-leaf is rejected by the fit (phase C), and balance-rope, cover-hollow, garden-shed and sap-cup failed in ComfyUI (the ledger was still changing when read).

## Phase A: flagged scenes (10 flagged in the first pass) and what the driver found

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| highridge (8 scenes) | the first-pass flag: prop `lantern-row1-e` `[0.052, 0.024, 0.19]` overlaps `hall-splinter` (x 0.038 to 0.052; 9 of 27 points) | location-level prop override: x 0.0545, beside the hall | `/props` `lantern-row1-e` `location` `[0.0545, 0.024, 0.19]` |
| highridge / c4_city, c4_faceless | found by the driver: the camera is inside the `leaf` prop (its fit is rejected, so the box proxy filled the lens as a flat wall, as the first pass shows in c4_city) | `prop_alpha` leaf 0.25 in those two scenes | none (the leaf falls past the lens by design) |
| lowridge / c2_sorrel_wall, c5_lowridge | the first-pass flag: `low-tap-1` `[0.002, 0.0095, 0.03]` inside `upper-ledge` | not reproduced at the driver's scale: the tap overlaps only `bark-slab` (9 of 27 points, embedded on purpose); every first-pass test on a millimetre set used absolute tolerances, which probably explains it | none |
| bark-face (4 scenes) | found by the driver: `lantern-1` to `lantern-4` at y 0.028 are inside the 3 mm `ridge-2` to `ridge-5` (27 of 27 points) | location-level prop override: y 0.0245, on the ridge face | `/props` `lantern-1`..`lantern-4` `location` y `0.0245` |
| highridge-square (2 scenes) | found by the driver: `lantern-west`, `lantern-east` at z 0.015 are inside `ridge-west`, `ridge-east` (18 of 27 points) | location-level prop override: z 0.036, the ridges' top | `/props` `lantern-west`, `lantern-east` `location` z `0.036` |
| shadow-edge / c6_edge | found by the driver: `stake-1`, `-4`, `-5`, `-6`, `-10`, `-11`, `-12` at y 0.027 are inside the ridge pieces (12 to 18 of 27 points) | location-level prop override: y 0.0245, in front of the ridge face | `/props` those seven `location` y `0.0245` (or make the ridges thinner) |

Before and after: `flagged-before-after.jpg` (before = `--no-overrides 1`, 0.4 scale at 25% of the samples, no models; after = the final still).

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| backyard / c7_backyard | `tree-trunk` stands between the camera and its look_at | none (the look_at is the trunk's centre: the tree is the subject) |
| highridge / c2_rain, c4_city | the ray to the look_at grazes `ridge-3`, `terrace-row-2` | none (the target lies on the bark face) |
| lowridge / c2_sorrel_wall | `sorrels-wall` stands between the camera and its look_at | none (it is the subject) |
| splinterwatch / c1_battlements, c3_wind | `splinter-tip` stands between the camera and its look_at | none (the shard is the subject) |
| most locations | props overlap their blockout pieces (3 to 9 of 27 points: towers on the bark slab, beads on ridges, the roll against the wall) | none (they stand against or in the bark) |

## The facing convention

`player_start.facing_deg` is not defined beyond "0 faces +y" in `docs/BLENDER.md`. Bark: 19 of 22 scenes with a start have facing 0, so both readings agree. Endless-temple: read as a compass bearing the facing and the scene camera agree in 19 of 39 scenes; read as a rotation about Z (90 faces -x, `rig.json` `facing: "ccw"`) in 36 of 39. The driver reads `ccw` for both games. PROPOSED: say so in `docs/BLENDER.md` ("`facing_deg` is a rotation about Z: 0 faces +y, 90 faces -x"), as already proposed for the earlier games.

## Phase B: the rig per location (overview against its reference)

Reference images are 1600 x 900 images from each design's prompt (`games/people-of-the-bark/assets/locations/<id>.jpg`). The overviews are views from the driver's own camera
at about eye height with a wide lens, lit by the scene named below; they match layout and rough light direction, not detail. Only the rig changed (`tools/render/rig.json`):
per-scene exposure from a look pass on quick renders (mean display value toward 0.22, capped at -5.5 and +3.5 EV), `overview_ev`, the overview camera and the overview's lighting
scene. No light, world gain or fog was added. The overview cameras were set in two look rounds by eye (the scene cameras and lenses themselves are untouched).

| Location | Overview lighting scene | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, lens) | Reference |
| --- | --- | --- | --- | --- | --- |
| backyard | c7_backyard | c7_backyard -3.4 | +0.0 | [3, -12, 1.5] to [0, 4, 3.5], 22 mm | image |
| bark-face | c6_stand | c6_ring -3.8, c6_shadow -2.6, c6_stand +0.0, c6_touch -0.8 | -1.0 | [0, -0.05, 0.06] to [0, 0.03, 0.06], 28 mm | image |
| first-ring-temple | c2_temple | c2_temple -5.1 | -0.5 | [0, -0.0138, 0.008] to [0, 0.002, 0.0045], 28 mm | image |
| highridge-square | c5_count | c3_thumb -2.5, c5_count -1.9 | +0.0 | [0, -0.032, 0.034] to [0, 0.0, 0.02], 28 mm | image |
| highridge | c1_city_dawn | c1_city_dawn -1.6, c1_city_year -2.0, c2_city -2.0, c2_rain -3.6, c3_city -2.9, c4_city -1.9, c4_faceless -1.7, c5_city -2.0 | -0.7 | [0, -0.05, 0.19] to [0, 0.03, 0.19], 28 mm | text card (no figure imagery) |
| knotholm-walk | c5_temple | c5_temple -2.6 | +0.0 | [-0.025, -0.03, 0.02] to [0.01, 0, 0.012], 24 mm | image |
| lowridge | c5_lowridge | c2_sorrel_wall -3.3, c5_lowridge -0.9 | -0.5 | [0, -0.04, 0.03] to [0, 0.01, 0.025], 28 mm | image |
| shadow-edge | c6_edge | c6_edge -1.0 | -0.7 | [0.04, -0.06, 0.1] to [0.04, 0.03, 0.1], 30 mm | image |
| splinterwatch | c1_battlements | c1_battlements -4.8, c3_wind -3.0 | +0.0 | [0, -0.05, 0.06] to [0, 0.03, 0.06], 28 mm | image |
| the-branch | c4_branch | c4_branch -4.0 | +0.0 | [-0.12, -0.035, 0.035] to [0, 0, 0.035], 35 mm | image |

Deltas the rig cannot close: the blockouts are flat-coloured boxes, so none of the bark texture (carved grain, moss, lichen, snow-dusted cobbles, the photographic yard and sky) exists; the overviews match layout, camera angle and the warm or blue light colour of each scene's own lights only; the backyard's tree is a sphere on a cylinder, the branch a plain cylinder; light colours and directions follow the build files' own lights (the rig changed exposure only: no light, world or fog was added or changed).

## Phase C: models

Ledger read: `games/people-of-the-bark/assets/models.json` in the ComfyUI session's checkout (read-only, 2026-11-22; 15 of 19 entries built: balance-rope, cover-hollow, garden-shed and sap-cup failed). Only `built` entries were used. The glbs were copied to the render box as lite copies (decimated to 12k triangles, 512 px JPEG textures); nothing was copied into the repo. The set is rendered 1000 times larger than the build file states (see Owner decisions), models and all, so the fit ratios are those of the build file. I looked at every model from the front (-y) and a three-quarter view: none shows a person or creature, so none was skipped; the ledger says "front direction (-y) not checked by eye" for all of them, the Note column is my check (doors, faces and dials point -y as built). Fit: see `tools/render/README.md` (batch 6).

| Object | Source | Props | Model size (m) | Box (m) | Fit | Note |
| --- | --- | --- | --- | --- | --- | --- |
| balance-rope | named box proxy | 1 | | | | ledger status failed (the glb download was cut short) |
| battlement-slot | named box proxy | 36 | | | | no entry in the ComfyUI ledger |
| chant-drum | model (lite copy) | 17 | [0.004, 0.004, 0.005] | [4.0, 4.0, 4.0] | scale 822.707, worst side x1.2 | front (-y) checked by eye: as built |
| cover-hollow | named box proxy | 4 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| dwelling | model (lite copy) | 124 | [0.008, 0.008, 0.007] | [6.0, 4.0, 7.0] | scale 990.516, worst side x1.88 | front (-y) checked by eye: as built |
| edge-stake | named box proxy | 12 | | | | no entry in the ComfyUI ledger |
| falling-leaf | named box proxy | 2 | [0.08, 0.073, 0.062] | [80.0, 10.0, 60.0] | rejected (best axes [90, 0, 0], worst side x3.16) | the model is a broad sheet-like leaf (0.08 x 0.073 x 0.062 m) against a thin leaf box: the fit refuses it, the box proxy stays |
| fence-panel | named box proxy | 7 | None | None | rejected (best axes None, worst side xNone) | the model is a broad sheet-like leaf (0.08 x 0.073 x 0.062 m) against a thin leaf box: the fit refuses it, the box proxy stays |
| garden-shed | named box proxy | 1 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| garden-swing | model (lite copy) | 1 | [1.433, 0.575, 2.011] | [0.6, 0.2, 2.0] | scale 0.525, worst side x2.66, axes turned [0, 90, 0] | front (-y) checked by eye: as built |
| knot-sanctum | model (lite copy) | 8 | [0.014, 0.008, 0.014] | [12.0, 8.0, 14.0] | scale 992.508, worst side x1.14 | front (-y) checked by eye: as built |
| knot-shelter-door | model (lite copy) | 24 | [0.006, 0.001, 0.006] | [4.0, 1.0, 6.0] | scale 986.143, worst side x1.49 | front (-y) checked by eye: as built |
| lichen-lantern | model (lite copy) | 87 | [0.004, 0.003, 0.008] | [2.0, 2.0, 8.0] | scale 994.045, worst side x1.79 | front (-y) checked by eye: as built |
| pells-lantern | model (lite copy) | 2 | [0.003, 0.003, 0.005] | [3.0, 3.0, 5.0] | scale 995.883, worst side x1.05 | front (-y) checked by eye: as built |
| rain-bead | named box proxy | 4 | | | | no entry in the ComfyUI ledger |
| record-hall | model (lite copy) | 8 | [0.014, 0.007, 0.007] | [14.0, 8.0, 12.0] | scale 1659.099, worst side x1.67 | front (-y) checked by eye: as built |
| roll-of-the-bark | model (lite copy) | 1 | [0.008, 0.008, 0.008] | [8.0, 3.0, 6.0] | scale 665.5, worst side x1.67 | front (-y) checked by eye: as built |
| sap-cup | named box proxy | 37 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| sap-jar | named box proxy | 10 | None | None | rejected (best axes None, worst side xNone) | the model is a broad sheet-like leaf (0.08 x 0.073 x 0.062 m) against a thin leaf box: the fit refuses it, the box proxy stays |
| sap-tap | named box proxy | 24 | | | | no entry in the ComfyUI ledger |
| scroll-frame | model (lite copy) | 4 | [0.008, 0.005, 0.007] | [8.0, 4.0, 8.0] | scale 1132.275, worst side x1.32 | front (-y) checked by eye: as built |
| silk-anchor | named box proxy | 5 | | | | no entry in the ComfyUI ledger |
| spear-rack | model (lite copy) | 4 | [0.008, 0.005, 0.012] | [8.0, 3.0, 12.0] | scale 998.708, worst side x1.76 | front (-y) checked by eye: as built |
| temple-altar | model (lite copy) | 1 | [0.008, 0.008, 0.004] | [8.0, 5.0, 4.0] | scale 863.691, worst side x1.39 | front (-y) checked by eye: as built |
| twigs-kite | model (lite copy) | 1 | [0.008, 0.002, 0.012] | [10.0, 2.0, 12.0] | scale 999.309, worst side x1.18 | front (-y) checked by eye: as built |
| war-hall | named box proxy | 10 | | | | no entry in the ComfyUI ledger |
| washing-line | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| watchtower | model (lite copy) | 24 | [0.013, 0.013, 0.03] | [6.0, 6.0, 30.0] | scale 991.932, worst side x2.11 | front (-y) checked by eye: as built |
| window-shutter | named box proxy | 68 | | | | no entry in the ComfyUI ledger |

## Phase D and gaps

23 scenes, the eye-height player-start still of every scene that has a start, and one overview per location: 55 stills in the ledger. Contact sheets:
`renders/people-of-the-bark/<location>.jpg`; ledger: `ledger.json`. Not produced: the depth and object-index passes. (The lite-copy remark of the first model pass is superseded by the full 80k-triangle models of the re-render below.)

## Models re-render (2026-11-23)

Every built model of `games/people-of-the-bark/assets/models.json` (the ComfyUI session's ledger in the other working copy, re-read at the start of the run, status `built` only; read only, never copied into this repo) replaces its box proxy, and all 23 scenes and 10 overviews were rendered again with the earlier rig, overrides, flags and fixes unchanged (Phases A and B are not redone). The render copies are the full 80k-triangle models re-exported with 1024 px JPEG textures (made in Blender because the render box's upload link is slow; the originals stay out of the repo).

- **Ledger state**: 26 entries: 26 built.
- **Proxy to model**: 22 object types, 470 of 528 prop instances: `battlement-slot`, `chant-drum`, `dwelling`, `fence-panel`, `garden-swing`, `knot-sanctum`, `knot-shelter-door`, `lichen-lantern`, `pells-lantern`, `rain-bead`, `record-hall`, `roll-of-the-bark`, `sap-jar`, `sap-tap`, `scroll-frame`, `silk-anchor`, `spear-rack`, `temple-altar`, `twigs-kite`, `war-hall`, `watchtower`, `window-shutter`.
- **Still a named box proxy**: `balance-rope` (proportions: a side is off by x3.1 after the best fit), `cover-hollow` (no model used: ledger status not in ledger), `edge-stake` (proportions: a side is off by x3.5 after the best fit), `falling-leaf` (proportions: a side is off by x3.2 after the best fit), `garden-shed` (no model used: ledger status not in ledger), `sap-cup` (no model used: ledger status not in ledger), `washing-line` (proportions: a side is off by x4.0 after the best fit) (58 prop instances).
- **Front direction (-y)**: every built model was viewed from -y and from 50 degrees beside it on a montage before the run (Blender workbench). The driver keeps a model's own orientation unless it fits worse than a factor of 3 and then tries the six axis permutations; turned: garden-swing [0, 90, 0].
- **Figures and creatures**: all 26 built models were viewed from -y and from 50 degrees; none shows a person, creature or figure-like shape, so none was skipped. The scene scale of 1000 (millimetre sets) is kept: models are scaled with the set.
- **Fit (ledger `objects`, `props[].fit`)**: scale uniform; worst side ratio between model and `size_m` box over 1.8: dwelling x1.91, garden-swing x2.65, sap-tap x1.83, silk-anchor x2.26, war-hall x1.82, watchtower x2.14, window-shutter x2.20. These models are as proportioned by the generator (the box's `size_m` is the author's guess); none was stretched. Fits rejected (proportions off by more than the driver's limit, the named box proxy stays): `balance-rope`, `edge-stake`, `falling-leaf`, `washing-line`.
- **Proportion problems the ComfyUI ledger records** (largest requested side matched, uniform scale): dwelling: proportions differ from size_m (axis ratios 0.80, 0.52, 1.00); scaled uniformly so its largest requested side matches; fence-panel: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 1.00, 0.58, 0.79); scaled uniformly so its largest requested side matches; garden-swing: proportions differ from size_m (axis ratios 0.42, 0.35, 1.00); scaled uniformly so its largest requested side matches; knot-shelter-door: proportions differ from size_m (axis ratios 0.66, 0.73, 1.00); scaled uniformly so its largest requested side matches; lichen-lantern: proportions differ from size_m (axis ratios 0.56, 0.62, 1.00); scaled uniformly so its largest requested side matches; rain-bead: proportions differ from size_m (axis ratios 1.00, 1.00, 0.62); scaled uniformly so its largest requested side matches; record-hall: proportions differ from size_m (axis ratios 1.00, 1.23, 1.69); scaled uniformly so its largest requested side matches; roll-of-the-bark: proportions differ from size_m (axis ratios 1.00, 0.40, 0.75); scaled uniformly so its largest requested side matches; sap-tap: proportions differ from size_m (axis ratios 1.24, 1.00, 0.68); scaled uniformly so its largest requested side matches; silk-anchor: proportions differ from size_m (axis ratios 0.75, 2.26, 1.00); scaled uniformly so its largest requested side matches; spear-rack: proportions differ from size_m (axis ratios 0.96, 0.57, 1.00); scaled uniformly so its largest requested side matches; temple-altar: proportions differ from size_m (axis ratios 1.00, 0.62, 1.07); scaled uniformly so its largest requested side matches; war-hall: proportions differ from size_m (axis ratios 0.57, 0.55, 1.00); scaled uniformly so its largest requested side matches; watchtower: proportions differ from size_m (axis ratios 0.47, 0.47, 1.00); scaled uniformly so its largest requested side matches; window-shutter: proportions differ from size_m (axis ratios 0.80, 0.27, 1.00); scaled uniformly so its largest requested side matches.
- **Tone**: the models change the frame's average brightness, so per-scene `exposure_ev` and `overview_ev` in `tools/render/rig.json` were re-matched to the box-proxy pass's mean luminance (damped log2 ratio, from look passes at 0.4 scale and 25 % samples of the box run and the model run; changed only where the two differed by more than 10 %). No light, world, camera or lens was changed.
- **Camera inside a model**: none (`camera_inside_prop` empty in every scene). Informational `prop_overlap` entries stay in the ledger.
- **Proposed diffs** (not applied): none new from the models. The earlier proposals stand; where a model is much larger than its box the author may want `size_m` in `assets.json` corrected to the model's proportions.
- `flagged-before-after.jpg` was redone with the models ("before" = build file as it is, 0.4 scale, 25 % samples; "after" = final still).
- **Render-time fixes the models needed**: none beyond the exposure re-match: no camera stands inside a model, so no hide or override was added.
- GPU time on the rented RTX 4090 (measured from the box's run log): final run 728 s; box-proxy look pass 59 s, model look pass 114 s, 'before' pass of the flagged scenes 90 s; 991 s (0.28 h) in all.

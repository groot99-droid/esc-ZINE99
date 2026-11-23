# behind-the-peephole: refinement notes (render and refinement plan, fourth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the
author, some also applied inside the driver only (`tools/render/overrides.json`). 26 scenes in 7 locations, all hero; 2 were flagged by the first
pass (the two stairwell scenes). Every prop is a named box proxy (no model exists). Each scene's own lights, world, camera and lens were used;
the rig adds exposure only.

## Phase A: flagged scenes

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| back-stair / n3_stairwell | `look_at [0.75, -10.0, 12.8]` lies inside `flight-4b-low` (a 1.4 x 3.7 x 0.875 m step block, top z 13.125), so the first-person view down the stair ended in the stair box | look_at `[0.75, -10.0, 13.3]` (0.18 m above the step top; the camera, the lens and the framing direction are unchanged) | `/scenes/n3_stairwell/camera/look_at` `[0.75, -10.0, 13.3]` |
| back-stair / n6_stairwell | same camera, same cause | same | `/scenes/n6_stairwell/camera/look_at` `[0.75, -10.0, 13.3]` |

Before and after: `flagged-before-after.jpg` (0.4 scale at 25% of the samples, against the final stills).

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| lobby / end_wrong_picture | the driver reports `revolving-door` between camera and target: `look_at [-9, -1, 1.6]` lies inside the door piece, so the sight line ends in it by design; the door reads as intended | none (or `look_at` on the door face) |
| valet-passage, all scenes | the door props of the six rooms stand 3 of 27 sample points inside `wainscot-north` | none (the doors stand in the wainscot) |
| office / n7_your_door | `office-rose` overlaps `office-door-leaf` (9 of 27): the rose is fixed to the door | none |
| back-office / n6_back_office | `door` overlaps `wainscot-west` and `wall-west-south` | none |

Checks after the overrides: nothing inside a piece or between camera and target except `end_wrong_picture` above (`ledger.json` keeps every check).

## Phase B: the rig per location (overview against its reference)

The references are 1600 x 900 paintings from the design's prompt (`games/behind-the-peephole/assets/locations/<id>.jpg`): dark, warm,
practical lights only. The overviews match layout, key colour and light direction, not detail. Only the rig changed (`tools/render/rig.json`):
the exposure per scene (an automatic pass on quick renders, then by eye), `overview_ev`, the overview camera. Values are by eye.

| Location | Overview lighting | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, mm) | Other |
| --- | --- | --- | --- | --- | --- |
| back-office | n6_back_office | n6_back_office +0.0 | -0.5 | [-2.3, -1.8, 1.6] to [0.5, 2, 1.3], 22 |  |
| back-stair | n3_stairwell | n3_stairwell +1.6, n6_stairwell +1.6 | -1.2 | [1.0, -1.5, 1.7] to [-0.6, -9, 2.4], 22 |  |
| lobby | dawn_lobby | dawn_lobby -1.1, end_sitter -1.5, end_wrong_picture -1.0 | +0.0 | [6, -5, 1.7] to [-6, 4, 2.2], 22 |  |
| office | n1_office | n1_morning -0.8, n1_office +1.4, n2_morning -0.8, n2_office +1.4, n2_seventh_bell +0.0, n3_morning -0.8, n3_office +1.4, n3_tea +0.9, n4_morning -0.8, n4_office +1.4, n5_morning -0.8, n5_office +1.4, n6_morning -0.8, n6_office +1.4, n7_office +1.4, n7_your_door +0.6 | +0.0 | [-1.6, -1.2, 1.5] to [1, 1.4, 1.1], 18 |  |
| river-wall | end_open_door | end_open_door -2.5 | +0.0 | [-5, -3.2, 1.7] to [15, 3, 4], 24 |  |
| staff-alley | n1_arrival | n1_arrival +3.5 | -0.5 | [13, -3, 1.7] to [-8, 0.5, 2], 22 |  |
| valet-passage | n1_passage | end_under_door +10.9, n1_passage +1.3 | +0.0 | [31, 0, 1.6] to [0, 0, 1.4], 22 |  |

Deltas the rig cannot close: the box proxies have no wood, brick, wallpaper or fog; the references are darker with deep shadows, and the proxy
renders lighter and flatter once exposed to mid-grey. Per location:

- back-office: green wall, window and the cabinet row match; the safe and the clock are boxes.
- back-stair: the corridor and the brick-brown tone match; the stair is block steps; the chute box stands at the left.
- lobby: green walls, the revolving door (a gold cylinder) and the desk match; the chandelier and the marble are not modelled; the floor reads glossy.
- office: shelves, desk and the green walls match; the overview is taken from the near corner with an 18 mm lens, the painting is wider.
- river-wall: facade and quay are slabs; the lamp post and the fog are not in the overview; the sky takes the world colour.
- staff-alley: the long brick alley and the lamp light match in tone; the fire escape and the rain are not modelled.
- valet-passage: the green corridor with the door row and the lamps matches; the painting is darker on the right.
- end_under_door (valet-passage) has a rig EV of about +11 because the build file's only light is a 6 to 120 W strip under the door; the still
  reads as a bright sliver in a dark corridor (the sliver is blown out).

## Phase C: models

`games/behind-the-peephole/assets/models.json` does not exist and no `.glb` of any object of this game was found, so every prop is a named
box proxy (30 object types). The swap path was not exercised.

## Phase D and gaps

26 scenes at 2560x1440 / 256 samples, the eye-height player-start still of every scene with a start, and one overview per location
(1920x1080 / 128): 59 stills. Contact sheets: `renders/behind-the-peephole/<location>.jpg` (office: 18 scenes, a tall sheet);
ledger: `ledger.json`. Not produced: the depth and object-index passes. No person or figure in any frame.

## Models re-render (2026-11-23)

Every built model of `games/behind-the-peephole/assets/models.json` (the ComfyUI session's ledger in the other working copy, re-read at the start of the run, status `built` only; read only, never copied into this repo) replaces its box proxy, and all 26 scenes and 7 overviews were rendered again with the earlier rig, overrides, flags and fixes unchanged (Phases A and B are not redone). The render copies are the full 80k-triangle models re-exported with 1024 px JPEG textures (made in Blender because the render box's upload link is slow; the originals stay out of the repo); a first final with 12k-triangle / 512 px copies was discarded because decimation shattered thin surfaces.

- **Ledger state**: 30 entries: 26 built, 4 failed.
- **Proxy to model**: 26 object types, 248 of 296 prop instances: `bell-board`, `brass-rose`, `card-table`, `chandelier`, `chute-box`, `chute-hatch`, `coat-stand`, `cork-board`, `desk`, `desk-lamp`, `dustbin`, `iron-lamp-post`, `kettle`, `laundry-cart`, `lobby-armchair`, `logbook`, `lost-property-cabinet`, `luggage-trolley`, `mooring-bollard`, `noticeboard`, `office-chair`, `reception-desk`, `safe`, `staff-door`, `telephone`, `valet-door`.
- **Still a named box proxy**: `card-deck` (no model used: ledger status failed), `evening-paper` (no model used: ledger status failed), `maids-trolley` (no model used: ledger status failed), `wall-sconce` (no model used: ledger status failed) (48 prop instances).
- **Front direction (-y)**: every built model was viewed from -y and from 50 degrees beside it on a montage before the run (Blender workbench). The driver keeps a model's own orientation unless it fits worse than a factor of 3 and then tries the six axis permutations; turned: brass-rose [90, 0, 0].
- **Figures and creatures**: none shows a person or creature or figure-like shape; nothing skipped.
- **Fit (ledger `objects`, `props[].fit`)**: scale uniform; worst side ratio between model and `size_m` box over 1.8: bell-board x1.84, staff-door x2.05. These models are as proportioned by the generator (the box's `size_m` is the author's guess); none was stretched. No fit was rejected.
- **Proportion problems the ComfyUI ledger records** (largest requested side matched, uniform scale): bell-board: proportions differ from size_m (axis ratios 1.00, 0.37, 0.83); scaled uniformly so its largest requested side matches; brass-rose: proportions differ from size_m (axis ratios 1.00, 0.44, 3.06); scaled uniformly so its largest requested side matches; chute-hatch: rotated 90 deg about Z so its long side matches size_m; coat-stand: proportions differ from size_m (axis ratios 0.72, 0.73, 1.00); scaled uniformly so its largest requested side matches; cork-board: proportions differ from size_m (axis ratios 1.00, 0.31, 0.89); scaled uniformly so its largest requested side matches; desk-lamp: proportions differ from size_m (axis ratios 0.90, 0.64, 1.00); scaled uniformly so its largest requested side matches; logbook: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 1.02, 1.00, 0.55); scaled uniformly so its largest requested side matches; lost-property-cabinet: rotated 90 deg about Z so its long side matches size_m; luggage-trolley: rotated 90 deg about Z so its long side matches size_m; mooring-bollard: proportions differ from size_m (axis ratios 0.62, 0.62, 1.00); scaled uniformly so its largest requested side matches; noticeboard: proportions differ from size_m (axis ratios 0.66, 0.42, 1.00); scaled uniformly so its largest requested side matches; office-chair: proportions differ from size_m (axis ratios 0.68, 0.67, 1.00); scaled uniformly so its largest requested side matches; reception-desk: proportions differ from size_m (axis ratios 1.00, 0.57, 0.65); scaled uniformly so its largest requested side matches; staff-door: proportions differ from size_m (axis ratios 0.79, 0.49, 1.00); scaled uniformly so its largest requested side matches; telephone: proportions differ from size_m (axis ratios 0.63, 1.00, 0.58); scaled uniformly so its largest requested side matches; valet-door: proportions differ from size_m (axis ratios 0.80, 0.45, 1.00); scaled uniformly so its largest requested side matches.
- **Tone**: the models change the frame's average brightness, so per-scene `exposure_ev` and `overview_ev` in `tools/render/rig.json` were re-matched to the box-proxy pass's mean luminance (damped log2 ratio, from look passes at 0.4 scale and 25 % samples of the box run and the model run; changed only where the two differed by more than 10 %). No light, world, camera or lens was changed.
- **Camera inside a model**: none (`camera_inside_prop` empty in every scene). Informational `prop_overlap` entries stay in the ledger.
- **Proposed diffs** (not applied): none new from the models. The earlier proposals stand; where a model is much larger than its box the author may want `size_m` in `assets.json` corrected to the model's proportions.
- `flagged-before-after.jpg` was redone with the models ("before" = build file as it is, 0.4 scale, 25 % samples; "after" = final still).
- **Fix round (after the first model pass)**: the ledger had been read stale: the first pass used 18 models and left 8 built ones as box proxies (brass-rose, card-table, chute-hatch, logbook, noticeboard, reception-desk, safe, staff-door), which were built when the run started or soon after; the ledger was re-read, all 26 built entries are now models (each viewed from -y and at 50 degrees, none figure-like, none rejected by the fit) and all 26 scenes and 7 overviews were rendered again. The new models darkened lobby/end_sitter (reception desk) and the office scenes, so their per-scene exposure_ev (and the office overview_ev) were raised in two short re-match runs of those 8 scenes to the earlier frames' mean luminance (end_sitter ends within 14 %, the office scenes within 4 %; the black safe still makes the back-office player still darker than before). The flagged before/after pair was redone with the staff-door model.
- GPU time on the rented RTX 4090 (measured from the box's run log): look passes 147 s, first final with 12k-triangle copies 755 s (discarded), final 1567 s wall (parallel with the other two games' finals), before passes 6 s + 8 s. The three finals ran at the same time on the one box between 04:24 and 05:02 UTC (about 2280 s); all Blender wall time of the whole task on the box about 5600 s (1.55 h), measured from the box's run log (times.txt); upload and download not counted; fix round (8 more models): all 26 scenes 872 s, two exposure re-match runs of 8 scenes 266 s + 269 s, before pass 9 s, 1416 s in all.

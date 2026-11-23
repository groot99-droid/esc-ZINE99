# heartstream: refinement notes (render and refinement plan, seventh batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the author;
each is also applied inside the driver only (`tools/render/overrides.json`, `tools/render/rig.json`). 20 scenes in 14 locations
(20 hero at 2560x1440 / 256 samples; every scene of this game is a hero scene). Each scene's own lights, world, camera and lens
were used; the rig adds exposure only (no fill light was added anywhere). Built with real models for 12 of 26 object types (phase C), named box proxies for the rest.
No person or creature is in any frame; the sheets show only the driver's stills and the location references (a reference that shows figures is left out).

## Owner decisions

1. **Proposed build-file diffs** (phase A, three: the first-pass prop flag, and the boulders and a lamp found by the driver). Applied at render time only.
2. **The facing convention.** `facing_deg` agrees with the scene camera in 18 of 20 scenes read as a rotation about Z and in 13 read as a compass bearing (every scene is within 30 degrees of one reading or the other). Same proposal as for lira-calyx.
3. **Heartstream's blockouts are flat-coloured boxes**, so the overviews match the references' layout and light colour only; the references are organic (a vein-lined cavern, a river of blood). Whether the blockouts should grow curved pieces is a design question for the build files.
4. **The oar** is the one model the fit rejected: the ledger's glb shows it slanted at 45 degrees. It stays a named box proxy until the model is rebuilt upright.
5. **Models are lite copies** (about 12k triangles, 512 px), same reason as lira-calyx.

## Phase A: flagged scenes (1 flagged in the first pass) and what the driver found

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| shedding-gallery / s3_gallery | prop `blank-8` base `[-6, 10.8, 3.5]` is inside `ledge2-north-left` (the second tier's face is at y 10.5): the first-pass flag | prop override `[-6, 10.1, 3.5]`, on the first ledge in front of the face | `/props` `blank-8` `location` `[-6, 10.1, 3.5]` |
| bloodstream / s3_river, s3_bank_years_on | found by the driver: `boulder-1`, `boulder-2` have their base at z 0 inside the 1 m thick `bank-landing` (18 of 27 points) | location-level prop override: both to z 1.0, the landing top | `/props` `boulder-1` and `boulder-2` `location` z `1.0` |
| elders-cavern / s3_recognition | found by the driver: `lamp-west` `[-14.4, -6, 0]` is inside the `rib-2-west` piece (27 of 27); `lamp-east` stands at y -4, so the west lamp's y is probably a slip | prop override `[-14.4, -4, 0]` | `/props` `lamp-west` `location` `[-14.4, -4.0, 0]` |

Before and after: `flagged-before-after.jpg` (before = `--no-overrides 1`, 0.4 scale at 25% of the samples, no models; after = the final still). A prop moved
by an override can be too small to show in that frame.

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| shedding-gallery | `blank-4` to `blank-7`, `flakes-5` and `shard-3` overlap the ledge pieces (9 of 27 points) | none (the flakes and blanks lie on the ledges) |
| shaft-foot | four props overlap wall pieces (informational) | none |
| marrow-caverns (3 scenes), singing-hollow, stencil-gallery | one or two props overlap a wall or rib piece | none (they stand against it) |

## The facing convention (both games)

`player_start.facing_deg` is not defined beyond "0 faces +y" in `docs/BLENDER.md`. Read as a compass bearing (90 faces +x) the camera
and the facing agree in 7 of 24 lira-calyx scenes and 13 of 20 heartstream scenes; read as a rotation about Z (90 faces -x, `rig.json`
`facing: "ccw"`) they agree in 24 of 24 and 18 of 20 (the other two heartstream scenes agree only under the compass reading, and every scene
is within 30 degrees under one reading or the other). The driver reads `ccw` for both games. PROPOSED: say so in `docs/BLENDER.md`
("`facing_deg` is a rotation about Z: 0 faces +y, 90 faces -x"), as already proposed for stuffed-ones and missing-campsites.

## Phase B: the rig per location (overview against its reference)

Reference images are 1600 x 900 images from each design's prompt (`games/heartstream/assets/locations/<id>.jpg`). The overviews are views from the driver's own camera
at about eye height with a wide lens (or from a raised point for the large outdoor sets), lit by the scene named below; they match layout and rough light
direction, not detail. Only the rig changed (`tools/render/rig.json`): scene exposure from a look pass on quick renders (mean display value toward 0.22,
capped at -3.5 and +3.5 EV), `overview_ev`, the overview camera; the overview cameras were set in three look rounds by eye. No light, world or fog was added.

| Location | Overview lighting scene | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, lens) |
| --- | --- | --- | --- | --- |
| backwater | s3_backwater | s3_backwater -1.8 | +0.0 | [4, -4, 4] to [-12, -24, 1], 20 mm |
| beast-hold | s3_hold | s3_hold -3.5, s3_hold_turn -3.5 | -1.5 | [0, -7, 1.5] to [0, 3, 7], 20 mm |
| bloodstream | s3_river | s3_bank_years_on +0.0, s3_river -1.1 | +0.0 | [-500, -55, 2] to [-470, -30, 5], 24 mm |
| delta | s3_delta | s3_delta -2.3 | +0.0 | [-215, 5, 18] to [-150, 0, 2], 24 mm |
| elders-cavern | s3_recognition | s3_recognition -3.5 | +0.0 | [8, -15, 1.8] to [-2, 5, 3], 20 mm |
| heart-atrium | s3_heart | s3_heart -3.5 | +0.0 | [-12, 0, 1.8] to [10, 0, 10], 20 mm |
| marrow-caverns | s3_marrow | s3_lamps -3.0, s3_marrow -3.5, s3_marrow_after -3.3 | +0.0 | [0, -19, 2.2] to [0, 8, 4], 20 mm |
| narrow-vessel | s3_vessel | s3_vessel -3.5, s3_vessel_open -3.5 | +0.0 | [0.3, -19.5, 1.8] to [0.3, 10, 2], 20 mm |
| pulse-wall-chamber | s3_marrow_pulse | s3_marrow_pulse -1.8, s3_wall_at_night -1.8 | +0.0 | [-1, -4.5, 2] to [0, 5, 3], 18 mm |
| shaft-foot | s3_shaft | s3_shaft -1.0 | +0.0 | [0, -3.5, 1.8] to [0, 3, 6], 18 mm |
| shared-chamber | s3_vessel_two | s3_vessel_two -3.5 | +0.0 | [-3.6, -1.5, 2.5] to [1, 0, 1.5], 18 mm |
| shedding-gallery | s3_gallery | s3_gallery -3.5 | -1.0 | [0, -12.5, 2.2] to [0, 6, 5], 20 mm |
| singing-hollow | s3_hollow | s3_hollow -3.2 | +1.5 | [0, -9.3, 3] to [0, 0, 2.5], 24 mm |
| stencil-gallery | s3_stencil_gallery | s3_stencil_gallery -3.5 | +0.0 | [-12, -1, 1.8] to [10, 2, 2.5], 20 mm |


Deltas the rig cannot close: the blockouts are boxes and flat discs, so the organic references (veined walls, a river of blood, ribbed arches, a handprinted tunnel) read as plain red or blue rooms; the beast-hold is a pale sphere with no folds; the delta's river is a flat strip and the heart atrium's fibres are straight columns; the raft, bench and pillars (models) show the right silhouettes but the walls carry no texture; light colours follow the build files' own lights, which are strongly red or blue, so the rig only changed exposure.

## Phase C: models

Ledger read: `games/heartstream/assets/models.json` in the ComfyUI session's checkout (branch comfy-models-3d; the committed snapshot 824ad55 listed fewer built entries
than the working copy, which was still changing: the working copy of 2026-11-22 afternoon was used, read-only; 13 entries built). Only `built` entries were used. The glbs were
copied to the render box as lite copies (decimated to about 12k triangles, 512 px JPEG textures); nothing was copied into the repo. Fit: see `tools/render/README.md`
(batch 6). I looked at every model from the front (-y) and a three-quarter view: none shows a person or creature, so none was skipped. The ledger says "front direction (-y)
not checked by eye" for all of them; the Problems column is my check.

| Object | Source | Props | Model size (m) | Box size_m x scale (m) | Fit | Problems |
| --- | --- | --- | --- | --- | --- | --- |
| board-rack | model (lite copy) | 21 | [2.006, 1.075, 1.916] | [2.0, 0.5, 1.2] | scale 0.662, worst side x1.51 | front shows three open shelves; deeper and taller than size_m (2.0 x 1.08 x 1.9 against 2.0 x 0.5 x 1.2), scaled to the box (scale 0.66) |
| board-slab | model (lite copy) | 1 | [1.408, 0.781, 0.182] | [1.4, 0.7, 0.5] | scale 1.348, worst side x2.04 | a shallow tray with a raised rim; 0.18 m high against 0.5 (scaled up x1.35 to the box) |
| bone-blank | named box proxy | 12 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| bone-bowl | named box proxy | 10 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| bone-shard | named box proxy | 3 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| carving-slab | model (lite copy) | 1 | [1.206, 1.005, 0.603] | [1.2, 0.7, 0.6] | scale 0.884, worst side x1.27 | a low carving bench on curved legs; front is the long side; 1.2 x 1.0 x 0.6 against 1.2 x 0.7 x 0.6 |
| chisel | model (lite copy) | 2 | [1.004, 0.206, 0.201] | [0.03, 0.03, 0.2] | scale 0.199, worst side x1.37, axes turned [0, 90, 0] | the model lies along x (1.0 m long, 0.2 across); axes turned [0, 90, 0] so it stands, scale 0.2 (the box is 0.03 x 0.03 x 0.2) |
| counter-board | named box proxy | 28 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| counter-piece | named box proxy | 10 | | | | ledger status failed (the glb download was cut short) |
| elders-bench | model (lite copy) | 1 | [5.016, 1.687, 1.916] | [5.0, 0.9, 1.0] | scale 0.652, worst side x1.53 | a long bench with eight arch cut-outs in its back, front shows the seat; deeper and higher than size_m (5.0 x 1.7 x 1.9 against 5.0 x 0.9 x 1.0), scale 0.65 |
| flake-pile | named box proxy | 5 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| gathering-basket | model (lite copy) | 2 | [0.452, 0.456, 0.43] | [0.45, 0.35, 0.35] | scale 0.854, worst side x1.17 | woven basket with a handle; round (0.45 x 0.46) against 0.45 x 0.35 |
| gift-awl | model (lite copy) | 6 | [0.187, 0.675, 0.18] | [0.03, 0.03, 0.18] | scale 0.267, worst side x1.66, axes turned [90, 0, 0] | a ball-handled awl lying along y; axes turned [90, 0, 0] so it stands, scale 0.27; the round handle has dark marks but no figure reads |
| gift-comb | named box proxy | 6 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| gift-flute | model (lite copy) | 6 | [1.246, 0.208, 0.251] | [0.03, 0.03, 0.25] | scale 0.201, worst side x1.3, axes turned [0, 90, 0] | a bone flute lying along x; axes turned [0, 90, 0], scale 0.2 |
| gift-hook | model (lite copy) | 6 | [0.222, 0.059, 0.22] | [0.06, 0.03, 0.22] | scale 0.52, worst side x1.92 | a bound hook, curve faces +x; 0.22 x 0.06 x 0.22 against 0.06 x 0.03 x 0.22 (wider) |
| gift-scraper | named box proxy | 5 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| mark-stone | named box proxy | 3 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| marrow-lamp | named box proxy | 36 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| membrane-pillar | model (lite copy) | 19 | [2.09, 2.002, 3.044] | [0.8, 0.8, 3.0] | scale 0.986, worst side x2.58 | a flared pillar, wide at both ends; 2.1 x 2.0 x 3.0 against 0.8 x 0.8 x 3.0 (2.6 times wider, scaled to the 3.0 m height) |
| oar | named box proxy | 8 | [2.577, 0.196, 2.398] | [0.2, 0.1, 2.4] | rejected (best axes [0, 90, 0], worst side x4.09) | the glb shows the oar slanted at 45 degrees in its x-z plane (2.58 x 0.20 x 2.40 m), so no axis turn fits it to the 0.2 x 0.1 x 2.4 box (a side off by x4.1) |
| old-carved-hook | named box proxy | 2 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| raft | model (lite copy) | 5 | [3.105, 7.034, 3.888] | [3.2, 7.0, 1.8] | scale 0.78, worst side x1.69 | an open reed raft with a canopy of ribs; 3.1 x 7.0 x 3.9 against 3.2 x 7.0 x 1.8 (twice as high with the ribs), scale 0.78 |
| resonant-growth | named box proxy | 12 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| river-boulder | named box proxy | 24 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| sleeping-pod | model (lite copy) | 24 | [2.004, 2.006, 1.714] | [1.0, 2.0, 0.8] | scale 0.615, worst side x1.62 | an open pod bed with a rumpled blanket, no figure; 2.0 x 2.0 x 1.7 against 1.0 x 2.0 x 0.8 (twice as wide), scale 0.62 |

## Phase D and gaps

20 scenes, the eye-height player-start still of every scene and one overview per location: 54 stills in the ledger. Contact sheets:
`renders/heartstream/<location>.jpg`; ledger: `ledger.json`. Not produced: the depth and object-index passes. (The lite-copy remark of the first model pass is superseded by the full 80k-triangle models of the re-render below.)

## Models re-render (2026-11-23)

Every built model of `games/heartstream/assets/models.json` (the ComfyUI session's ledger in the other working copy, re-read at the start of the run, status `built` only; read only, never copied into this repo) replaces its box proxy, and all 20 scenes and 14 overviews were rendered again with the earlier rig, overrides, flags and fixes unchanged (Phases A and B are not redone). The render copies are the full 80k-triangle models re-exported with 1024 px JPEG textures (made in Blender because the render box's upload link is slow; the originals stay out of the repo).

- **Ledger state**: 25 entries: 25 built.
- **Proxy to model**: 24 object types, 247 of 258 prop instances: `board-rack`, `board-slab`, `bone-blank`, `bone-bowl`, `carving-slab`, `chisel`, `counter-board`, `counter-piece`, `elders-bench`, `flake-pile`, `gathering-basket`, `gift-awl`, `gift-comb`, `gift-flute`, `gift-hook`, `gift-scraper`, `mark-stone`, `marrow-lamp`, `membrane-pillar`, `old-carved-hook`, `raft`, `resonant-growth`, `river-boulder`, `sleeping-pod`.
- **Still a named box proxy**: `bone-shard` (no model used: ledger status not in ledger), `oar` (proportions: a side is off by x4.1 after the best fit) (11 prop instances).
- **Front direction (-y)**: every built model was viewed from -y and from 50 degrees beside it on a montage before the run (Blender workbench). The driver keeps a model's own orientation unless it fits worse than a factor of 3 and then tries the six axis permutations; turned: bone-blank [0, 90, 90], chisel [0, 90, 0], gift-awl [90, 0, 0], gift-flute [0, 90, 0], gift-scraper [0, 90, 90].
- **Figures and creatures**: all 25 built models were viewed from -y and from 50 degrees; none shows a person, creature or figure-like shape (bowls, benches, tools, baskets, stones, a raft, growths), so none was skipped.
- **Fit (ledger `objects`, `props[].fit`)**: scale uniform; worst side ratio between model and `size_m` box over 1.8: board-slab x2.06, gift-hook x1.92, marrow-lamp x2.36, membrane-pillar x2.59, old-carved-hook x1.90. These models are as proportioned by the generator (the box's `size_m` is the author's guess); none was stretched. Fits rejected (proportions off by more than the driver's limit, the named box proxy stays): `oar`.
- **Proportion problems the ComfyUI ledger records** (largest requested side matched, uniform scale): board-rack: proportions differ from size_m (axis ratios 1.00, 0.47, 0.63); scaled uniformly so its largest requested side matches; board-slab: proportions differ from size_m (axis ratios 1.00, 0.91, 2.81); scaled uniformly so its largest requested side matches; bone-blank: proportions differ from size_m (axis ratios 0.07, 0.14, 1.00); scaled uniformly so its largest requested side matches; carving-slab: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 1.00, 0.70, 1.01); scaled uniformly so its largest requested side matches; chisel: proportions differ from size_m (axis ratios 0.03, 0.15, 1.00); scaled uniformly so its largest requested side matches; counter-board: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 1.00, 0.90, 1.42); scaled uniformly so its largest requested side matches; counter-piece: proportions differ from size_m (axis ratios 1.00, 1.05, 1.51); scaled uniformly so its largest requested side matches; elders-bench: proportions differ from size_m (axis ratios 1.00, 0.54, 0.53); scaled uniformly so its largest requested side matches; gift-awl: proportions differ from size_m (axis ratios 0.16, 0.04, 1.00); scaled uniformly so its largest requested side matches; gift-comb: proportions differ from size_m (axis ratios 1.00, 0.90, 1.28); scaled uniformly so its largest requested side matches; gift-flute: proportions differ from size_m (axis ratios 0.02, 0.14, 1.00); scaled uniformly so its largest requested side matches; gift-hook: proportions differ from size_m (axis ratios 0.27, 0.51, 1.00); scaled uniformly so its largest requested side matches; gift-scraper: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 0.11, 0.03, 1.00); scaled uniformly so its largest requested side matches; marrow-lamp: proportions differ from size_m (axis ratios 0.53, 0.42, 1.00); scaled uniformly so its largest requested side matches; membrane-pillar: proportions differ from size_m (axis ratios 0.39, 0.40, 1.00); scaled uniformly so its largest requested side matches; old-carved-hook: proportions differ from size_m (axis ratios 0.28, 0.70, 1.00); scaled uniformly so its largest requested side matches; raft: proportions differ from size_m (axis ratios 1.03, 1.00, 0.46); scaled uniformly so its largest requested side matches; resonant-growth: proportions differ from size_m (axis ratios 0.60, 0.60, 1.00); scaled uniformly so its largest requested side matches; river-boulder: proportions differ from size_m (axis ratios 1.00, 0.80, 0.70); scaled uniformly so its largest requested side matches; sleeping-pod: proportions differ from size_m (axis ratios 0.50, 1.00, 0.47); scaled uniformly so its largest requested side matches.
- **Tone**: the models change the frame's average brightness, so per-scene `exposure_ev` and `overview_ev` in `tools/render/rig.json` were re-matched to the box-proxy pass's mean luminance (damped log2 ratio, from look passes at 0.4 scale and 25 % samples of the box run and the model run; changed only where the two differed by more than 10 %). No light, world, camera or lens was changed.
- **Camera inside a model**: none (`camera_inside_prop` empty in every scene). Informational `prop_overlap` entries stay in the ledger.
- **Proposed diffs** (not applied): none new from the models. The earlier proposals stand; where a model is much larger than its box the author may want `size_m` in `assets.json` corrected to the model's proportions.
- `flagged-before-after.jpg` was redone with the models ("before" = build file as it is, 0.4 scale, 25 % samples; "after" = final still).
- **Render-time fixes the models needed**: none beyond the exposure re-match: no camera stands inside a model, so no hide or override was added.
- GPU time on the rented RTX 4090 (measured from the box's run log): final run 855 s; box-proxy look pass 67 s, model look pass 100 s, 'before' pass of the flagged scenes 17 s; 1039 s (0.29 h) in all.

# lord-of-the-sea: refinement notes (render and refinement plan, ninth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the author;
each is also applied inside the driver only (`tools/render/overrides.json`, `tools/render/rig.json`). 28 scenes in 13 locations
(26 hero at 2560x1440 / 256 samples, 2 standard at 1920x1080 / 128). Each scene's own lights, world, camera and lens were used; the rig adds
exposure only (no fill light, world change or fog was added anywhere), plus the sky-role backdrop pieces of three locations (see Phase B).
Real models for 1 of 28 object types, named box proxies for the rest (phase C). No person or creature is in any frame, and no figure-like proxy.

## Owner decisions

1. **Two references left out.** The spice-mouth reference shows two carved stone figures on the quay posts, and the salt-steps reference a tall stooped shape at the pan edge that reads as a hooded figure (their prompts call both a "carved standing stone"). By the no-figures rule their sheets carry a text card. Say if the images may be shown.
2. **Only 2 of 4 ledger entries are built** (chart-table, oar); sale-deed and strongbox failed, and the ledger covers 4 of the 28 object types. Everything else is a named box proxy. Say when the ComfyUI session should build the rest.
3. **Proposed build-file diffs** (phase A): the first pass's three flagged scenes plus one the driver found (the s-tideline-final camera inside the stone). Applied at render time only.
4. **Backdrop pieces of role `sky`.** The driver hid every `sky` piece; here that removed the fleet on company-lane's horizon, the anchored boat and islands of the beach and the far headland of the deck. They are real set dressing, so a new rig key `show_sky` keeps them in the three locations. Say if `sky` should stay for "lids" only.
5. **The facing convention.** `facing_deg` agrees with the scene camera in 21 of 26 scenes read as a rotation about Z and 18 read as a compass bearing; the driver reads it as a rotation (`facing: "ccw"`), as for the other games.
6. **Blockouts are flat-coloured boxes**, so overviews match layout, light colour and mood only; the references are painted.

## Phase A: flagged scenes (3 flagged in the first pass, 28 scenes in all) and what the driver found

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| chandlery / s-chandlery | first-pass flag: `bottle-asked-for` `[-1.9, 2.2, 1.45]`, `bottle-shelf`, `tea-caddy` stand inside the solid `shelves` box (5.0 x 0.4 x 2.4 m at y 2.3) | location-level blockout replacement: `shelves` becomes a back panel and four shelf boards, tops at z 0.475, 0.975, 1.45, 1.975 | `/blockout` `shelves`: replace by `shelves-back` `[5.0, 0.08, 2.4]` at `[-0.8, 2.46, 1.2]` and four boards `[5.0, 0.38, 0.05]` at y 2.27 |
| lamplit-strait / s-lamplit-strait | first-pass flag: the camera `[45, -158.5, 2.6]` (and the player start `[45, -155, 1]`) is inside the terrain `headland-east` (a solid box, x 40 to 250); the `landing`, the six `cliff-stair` pieces and the `landing-lantern` are buried in it too | camera and player start to x 34; `landing` to x 30, the stairs to x 37, the lantern to x 32 | `/scenes/s-lamplit-strait/camera/location` `[34, -158.5, 2.6]`, `player_start/location` `[34, -155, 1.0]`; `/blockout` `landing` `location` `[30, -150, 0.5]`; `cliff-stair-1`..`6` `location` x 37; `/props` `landing-lantern` `location` `[32, -145, 2.4]` |
| spice-mouth / s-spice-mouth | first-pass flag: the solid `pay-pavilion-posts` box (7.6 x 4.6 x 3.2 m) stands between the camera and the look_at and holds the `pay-table` | location-level replacement by four 0.3 m posts at the corners | `/blockout` `pay-pavilion-posts`: four posts `[0.3, 0.3, 3.2]` at `[6.35, 2.85]`, `[13.65, 2.85]`, `[6.35, 7.15]`, `[13.65, 7.15]`, z 4.6 |
| spice-mouth / s-spice-mouth | not a defect: `statue-west` and `statue-east` are plain cylinders, but named and materialled as statues | drawn as `quay-post-west/east` in stone material so no figure-like proxy is in frame | rename them (or keep: they are plain 1.2 m cylinders) |
| home-reach-beach / s-tideline-final | found by the driver: the camera `[8, 5.0, 0.9]` is inside the `tideline-stone` prop (at `[8, 5, 0]`, 0.4 m deep); the frame rendered black | camera y 4.0 (as s-home-tideline, 1 m in front of the stone) | `/scenes/s-tideline-final/camera/location` `[8, 4.0, 0.9]` |

Before and after: `flagged-before-after.jpg` (before = `--no-overrides 1`, 0.4 scale at 25% of the samples, no models; after = the final still).

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| boat-deck / s-deck-dinghy | the `mast` stands between the camera and the look_at | none (a thin pole in the view of the deck) |
| salt-steps / s-salt-steps | `tideline-stone` overlaps `pan-wall-4` (3 of 27 points) | none |
| lamplit-strait | `landing-lantern` overlapped `headland-east` (9 of 27 points) | moved with the landing (above) |

## The facing convention

`player_start.facing_deg` is not defined beyond "0 faces +y" in `docs/BLENDER.md`. Here, of 26 scenes with a start, 21 agree with the scene camera read as a rotation about Z (90 faces -x) and 18 as a compass bearing (many are 0 or 180, where both agree). The driver reads `ccw`. PROPOSED: say so in `docs/BLENDER.md`, as already proposed for the earlier games.

## Phase B: the rig per location (overview against its reference)

Reference images are the 1600 x 900 location images (`games/lord-of-the-sea/assets/locations/<id>.jpg`). The overviews use the driver's own camera with a wide lens, lit by the scene named below. Only the rig changed (`tools/render/rig.json`): per-scene exposure from look passes on quick renders (mean display value toward a per-scene mood target, 0.07 for the night cabin to 0.52 for the salt noon), `overview_ev` (mean tone matched to the reference's), the overview camera and its lighting scene, and `show_sky` where the set's distant backdrop is `sky`-role. No light, world gain or fog was added. The overview cameras were set in two look rounds by eye.

| Location | Overview lighting scene | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, lens) | Reference |
| --- | --- | --- | --- | --- | --- |
| boat-cabin | s-cabin-dawn | s-cabin-dawn +3.8, s-cabin-princess +1.9, s-cabin-tally +3.7, s-chart-table +4.3, s-the-inventory +3.1 | -1.4 | [2.7, -1.1, 1.5] to [-0.5, 1.3, 1.2], 16 mm | image |
| boat-deck | s-deck-dinghy | s-deck-dinghy -0.8 | -0.7 | [5.5, -1.2, 1.8] to [-1, 5, 1.6], 22 mm | image; sky backdrop pieces shown: headland-far, beach-far |
| chandlery | s-chandlery | s-chandlery -1.4 | -3.2 | [-3.1, -1.9, 1.5] to [3.5, 0.2, 1.2], 18 mm | image |
| company-lane | s-company-lane | s-company-lane -1.7 | -0.4 | [-52, -812, 1.3] to [-72, -500, 3.5], 24 mm | image; sky backdrop pieces shown: horizon-fleet |
| counting-house | s-counting-house | s-counting-house +0.9, s-the-cup -1.0 | -2.2 | [0, -8.5, 1.7] to [0, 5, 2.2], 20 mm | image |
| home-reach-beach | s-tideline-final | s-beach-princess -1.9, s-beach-tideline -1.2, s-end-charter -1.3, s-end-lords-peace -2.0, s-end-no-lord -1.0, s-end-paid-in-kind -1.0, s-end-wild-sea -1.3, s-home-tideline -0.9, s-tideline-final +2.0 | -2.3 | [3, 0.5, 1.0] to [25, 60, 5], 24 mm | image; sky backdrop pieces shown: anchored-boat, island-west, island-east, open-sea, glass-lane |
| kings-halls | s-kings-halls | s-kings-halls -3.7, s-second-collision -0.5, s-the-oars -1.5 | +2.5 | [-7, -37, 1.6] to [2, 20, 3], 22 mm | image |
| lamplit-strait | s-lamplit-strait | s-lamplit-strait -0.0 | -0.7 | [30, -150, 6] to [10, 80, 25], 24 mm | image |
| pearl-banks | s-pearl-banks | s-pearl-banks -2.4 | -0.7 | [-30, -110, 35] to [10, 90, 3], 24 mm | image |
| salt-steps | s-salt-steps | s-salt-steps -2.6 | +0.4 | [30, -125, 14] to [0, 60, 12], 24 mm | text card (figure-like carved stone) |
| spice-mouth | s-spice-mouth | s-spice-mouth -2.1 | -0.2 | [-30, -60, 4] to [10, 10, 6], 24 mm | text card (figure-like carved stone) |
| the-unwritten | s-unwritten | s-unwritten -2.0 | +1.6 | [0, -268, 2.5] to [50, -150, 5], 24 mm | image |
| tidewater | s-tidewater | s-tidewater -2.4 | +0.8 | [-8, -95, 3.5] to [-15, 60, 6], 24 mm | image |

Deltas the rig cannot close: the blockouts are flat-coloured boxes, so none of the painted texture exists (no timber grain, no bottles on the cabin and chandlery shelves, no foam or waves, no thatch, no cliff strata, no terrace detail, no clouds); proxies of small props are boxes; the sea is a flat plane; lamplit-strait's lighthouses are plain cylinders with a point light (the dark storm sky and silhouettes of the reference are only the world colour and the lights); the first-pass-style layout differences (which side the door, the ladder and the dinghy are on) follow the build files, not the paintings. Light colours and directions follow the build files.

## Phase C: models

Ledger read: `games/lord-of-the-sea/assets/models.json` in the ComfyUI session's checkout (read-only, 2026-11-22): 4 entries, chart-table and oar built, sale-deed and strongbox failed. Only `built` entries were used. They were copied to the render box as lite copies (decimated to 12k triangles, 512 px JPEG textures; the upload link is slow); nothing was copied into the repo. I looked at both from the front (-y) and a three-quarter view: the chart table's slanted writing top faces as built, the oar is a straight oar with a blade (tilted in its glb). Neither shows a person or creature. Fit: see `tools/render/README.md` (batch 6).

| Object | Source | Props | Model size (m) | Box (m) | Fit | Note |
| --- | --- | --- | --- | --- | --- | --- |
| brass-dividers | named box proxy | 5 | | | | no entry in the ComfyUI ledger |
| chart-table | model (lite copy) | 5 | [1.42, 0.962, 1.389] | [1.4, 0.9, 0.95] | scale 0.858, worst side x1.25 | front (-y) checked by eye |
| coin-chest | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| company-buoy | named box proxy | 18 | | | | no entry in the ComfyUI ledger |
| dinghy | named box proxy | 10 | | | | no entry in the ComfyUI ledger |
| diving-boat | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| gallery-mirror | named box proxy | 30 | | | | no entry in the ComfyUI ledger |
| gullwife-boat | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| harbour-book | named box proxy | 2 | | | | no entry in the ComfyUI ledger |
| harbour-ferry | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| ledger | named box proxy | 15 | | | | no entry in the ComfyUI ledger |
| lighthouse-lamp | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| lobster-pot | named box proxy | 22 | | | | no entry in the ComfyUI ledger |
| notice-board | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| oar | named box proxy | 11 | [2.223, 1.6, 2.4] | [0.15, 0.05, 2.4] | rejected (worst side x3.69, best axes [0, 0, 90]) | the glb is built but unlike the box (slanted); the fit refuses it and the proxy stays |
| pay-table | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| revenue-cutter | named box proxy | 1 | | | | no entry in the ComfyUI ledger |
| rope-coil | named box proxy | 13 | | | | no entry in the ComfyUI ledger |
| rum-bottle | named box proxy | 23 | | | | no entry in the ComfyUI ledger |
| sale-deed | named box proxy | 4 | | | | ledger status failed |
| ship-lantern | named box proxy | 17 | | | | no entry in the ComfyUI ledger |
| spice-jar | named box proxy | 10 | | | | no entry in the ComfyUI ledger |
| strongbox | named box proxy | 2 | | | | ledger status failed |
| tea-board | named box proxy | 2 | | | | no entry in the ComfyUI ledger |
| tea-caddy | named box proxy | 11 | | | | no entry in the ComfyUI ledger |
| tea-chest | named box proxy | 13 | | | | no entry in the ComfyUI ledger |
| throne | named box proxy | 3 | | | | no entry in the ComfyUI ledger |
| tideline-stone | named box proxy | 11 | | | | no entry in the ComfyUI ledger |

## Phase D and gaps

28 scenes, the eye-height player-start still of every scene that has a start, and one overview per location: 80 stills in the ledger. Contact sheets: `renders/lord-of-the-sea/<location>.jpg`; ledger: `ledger.json`. Not produced: the depth and object-index passes. The models are lite copies.

## Models re-render (2026-11-23)

Every built model of `games/lord-of-the-sea/assets/models.json` (the ComfyUI session's ledger in the other working copy, re-read at the start of the run, status `built` only; read only, never copied into this repo) replaces its box proxy, and all 28 scenes and 13 overviews were rendered again with the earlier rig, overrides, flags and fixes unchanged (Phases A and B are not redone). The render copies are the full 80k-triangle models re-exported with 1024 px JPEG textures (made in Blender because the render box's upload link is slow; the originals stay out of the repo).

- **Ledger state**: 24 entries: 24 built.
- **Proxy to model**: 21 object types, 162 of 235 prop instances: `brass-dividers`, `chart-table`, `company-buoy`, `dinghy`, `diving-boat`, `gullwife-boat`, `harbour-book`, `harbour-ferry`, `lighthouse-lamp`, `lobster-pot`, `notice-board`, `pay-table`, `revenue-cutter`, `rope-coil`, `rum-bottle`, `ship-lantern`, `strongbox`, `tea-caddy`, `tea-chest`, `throne`, `tideline-stone`.
- **Still a named box proxy**: `coin-chest` (no model used: ledger status not in ledger), `gallery-mirror` (proportions: a side is off by x3.2 after the best fit), `ledger` (no model used: ledger status not in ledger), `oar` (proportions: a side is off by x3.7 after the best fit), `sale-deed` (no model used: ledger status not in ledger), `spice-jar` (no model used: ledger status not in ledger), `tea-board` (model skipped: a tea board with game pieces in the shape of small standing figures and a horse (figure-like pieces)) (73 prop instances).
- **Front direction (-y)**: every built model was viewed from -y and from 50 degrees beside it on a montage before the run (Blender workbench). The driver keeps a model's own orientation unless it fits worse than a factor of 3 and then tries the six axis permutations; turned: brass-dividers [0, 90, 90], harbour-book [90, 0, 0].
- **Figures and creatures**: all built models were viewed; 'tea-board' has game pieces in the shape of small standing figures and a horse and was skipped (named box proxy); the Gullwife boat keeps its neutral-named proxy.
- **Fit (ledger `objects`, `props[].fit`)**: scale uniform; worst side ratio between model and `size_m` box over 1.8: diving-boat x2.66, harbour-book x2.27, notice-board x2.33, rope-coil x2.06, tideline-stone x2.07. These models are as proportioned by the generator (the box's `size_m` is the author's guess); none was stretched. Fits rejected (proportions off by more than the driver's limit, the named box proxy stays): `gallery-mirror`, `oar`.
- **Proportion problems the ComfyUI ledger records** (largest requested side matched, uniform scale): brass-dividers: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 0.04, 0.06, 1.00); scaled uniformly so its largest requested side matches; chart-table: proportions differ from size_m (axis ratios 1.00, 0.95, 0.69); scaled uniformly so its largest requested side matches; dinghy: proportions differ from size_m (axis ratios 0.83, 1.00, 0.43); scaled uniformly so its largest requested side matches; diving-boat: proportions differ from size_m (axis ratios 0.17, 1.00, 0.55); scaled uniformly so its largest requested side matches; gullwife-boat: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 0.72, 1.00, 1.00); scaled uniformly so its largest requested side matches; harbour-book: proportions differ from size_m (axis ratios 0.30, 0.05, 1.00); scaled uniformly so its largest requested side matches; harbour-ferry: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 0.74, 1.00, 0.65); scaled uniformly so its largest requested side matches; notice-board: proportions differ from size_m (axis ratios 0.74, 0.24, 1.00); scaled uniformly so its largest requested side matches; pay-table: proportions differ from size_m (axis ratios 1.00, 1.12, 0.72); scaled uniformly so its largest requested side matches; rope-coil: proportions differ from size_m (axis ratios 1.00, 1.05, 3.02); scaled uniformly so its largest requested side matches; rum-bottle: proportions differ from size_m (axis ratios 0.57, 0.73, 1.00); scaled uniformly so its largest requested side matches; strongbox: proportions differ from size_m (axis ratios 1.00, 0.70, 0.74); scaled uniformly so its largest requested side matches; tea-chest: proportions differ from size_m (axis ratios 0.62, 0.93, 1.00); scaled uniformly so its largest requested side matches; throne: proportions differ from size_m (axis ratios 0.96, 0.73, 1.00); scaled uniformly so its largest requested side matches; tideline-stone: proportions differ from size_m (axis ratios 0.69, 0.48, 1.00); scaled uniformly so its largest requested side matches.
- **Tone**: the models change the frame's average brightness, so per-scene `exposure_ev` and `overview_ev` in `tools/render/rig.json` were re-matched to the box-proxy pass's mean luminance (damped log2 ratio, from look passes at 0.4 scale and 25 % samples of the box run and the model run; changed only where the two differed by more than 10 %). No light, world, camera or lens was changed.
- **Camera inside a model**: none (`camera_inside_prop` empty in every scene). Informational `prop_overlap` entries stay in the ledger.
- **Proposed diffs** (not applied): none new from the models. The earlier proposals stand; where a model is much larger than its box the author may want `size_m` in `assets.json` corrected to the model's proportions.
- `flagged-before-after.jpg` was redone with the models ("before" = build file as it is, 0.4 scale, 25 % samples; "after" = final still).
- **Render-time fixes the models needed**: none beyond the exposure re-match: no camera stands inside a model, so no hide or override was added.
- GPU time on the rented RTX 4090 (measured from the box's run log): final run 682 s; box-proxy look pass 74 s, model look pass 122 s, 'before' pass of the flagged scenes 24 s; 902 s (0.25 h) in all.

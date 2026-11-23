# man-eater: refinement notes (render and refinement plan, fifth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the author;
some are also applied inside the driver only (`tools/render/overrides.json`). 38 scenes in 15 locations, all hero (2560x1440, 256 samples).
The first pass and `plans.json` flagged none of them; the driver's own geometry checks found three scenes with a real problem (a camera
inside the box proxy of its own truck, a look_at inside a piece) plus one prop standing inside a barracks. Each scene's own lights, world,
camera and lens were used; the rig adds exposure only (no fill light was added anywhere).

## Phase A: problems found and fixed at render time

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| gate-yard / c1_truck_gate | camera `[0, -18.2, 2.96]` stands inside the box proxy of prop `truck-gate` (2.5 x 7 x 3 m, y -23 to -16): the first still was black | the proxy of `truck-gate` is drawn 20% opaque in this scene (override `prop_alpha`) | `/scenes/c1_truck_gate/hide` add `"truck-gate"` (the player rides in it), or give the real truck model an open cab |
| gate-yard / e_transfer_truck | same camera position (`[0, -18.2, 2.7]`), same cause | same | `/scenes/e_transfer_truck/hide` add `"truck-gate"` |
| truck-cab / n3_glovebox | (1) prop `truck` (2.5 x 7 x 3 m at y -4 to 3) encloses the cab blockout pieces (cab-floor, bench, dashboard, glovebox); its flat side filled the frame; (2) `look_at [1.7, 2.62, 1.5]` lies inside the `glovebox` piece (driver: glovebox, letters-in-glovebox and steering-wheel between camera and target) | `truck` proxy trimmed to the load body (`size_m [2.5, 5.2, 3.0]`, `location [1.2, -1.4, 0]`, y -4 to 1.2) and `look_at [1.7, 2.40, 1.5]` (0.08 m in front of the glovebox door) | the cab is already built from blockout pieces, so the `truck` prop should be the load body only: `/props/truck/location` `[1.2, -1.4, 0]` with a body-only object or size; `/scenes/n3_glovebox/camera/look_at` `[1.7, 2.40, 1.5]` |
| gate-yard / all four scenes | prop `truck-buried` (location `[6, 2.5, -0.4]`, rotated 95 degrees, 7 m long) stands inside `barracks-a` (x 4 to 20, y 2 to 10): 8 of 27 sample points | moved to `[9, -3.0, -0.4]` (clear of the barracks) | `/props/truck-buried/location` `[9, -3.0, -0.4]` |

Before and after: `flagged-before-after.jpg` (the three scenes above plus d3_duty_shovel; before = `--no-overrides 1`, 0.4 scale at 25% of the samples, against the final stills).

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| cold-store / d1_duty_coldstore | `crate-1`, `crate-3`, `crate-stack-a` overlap `bay-snow` (9 of 27 points): the crates sit in the drift | none (stacked in snow, as the reference shows) |
| gate-yard, all scenes | `truck-buried` overlaps `yard-snow` and (after the move) 1 of 27 points `snowbank-east` | none (it is buried) |
| bunk-room, n2_door to n7_door | the camera is 1.2 m from the door at 28 mm, so the door fills the frame | none; the player-start still shows more of the room |
| cafeteria, d1 and d6 | the camera looks at the servery from 1 m: wall, counter and a tray | none (the build file's framing) |
| perimeter, n7_perimeter / n7_set_down | the look_at is 400 m away at the wire; the frame is snow, a dark band and the wire | none |
| the-cave / e_cave | the lamps light the pool behind the camera and the camera looks toward the adit, so the frame is dark by design; rig EV +6 | none |

## Phase B: the rig per location (overview against its reference)

The references are 1600 x 900 images from each design's prompt (`games/man-eater/assets/locations/<id>.jpg`): muted, desaturated 1950s base
interiors, green-and-cream walls, practical lights. The overviews match layout, key colour and light direction, not detail. Only the rig
changed (`tools/render/rig.json`): exposure per scene (an automatic pass on quick renders, then by eye), `overview_ev`, the overview camera.
Values are by eye.

| Location | Overview lighting | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, mm) |
| --- | --- | --- | --- | --- |
| boiler-room | d4_duty_boiler | d4_duty_boiler -1.9 | +0.0 | [-5.0, -3.6, 2.0] to [2.0, 3.0, 1.5], 18 |
| bunk-room | c1_bunk | c1_bunk -2.8, d2_sam_bunk -2.8, d5_jax_plan -0.8, d6_sam_offer -2.8, d7_bunk_evening -0.8, e_prints_bunk +0.0, n1_bunk_call -1.0, n2 to n6_door -1.3, n7_bunk_stay -1.0, n7_door -1.3 | +0.0 | [-1.7, -2.2, 1.6] to [0.6, 2.5, 1.4], 18 |
| cafeteria | d1_cafeteria | d1_cafeteria -0.6, d6_next_week +0.0 | +0.0 | [8.5, -5.0, 1.7] to [-5, 3, 1.8], 22 |
| cold-store | d1_duty_coldstore | d1_duty_coldstore +2.7 | +0.0 | [-18.5, -2.2, 1.7] to [10, 1.5, 2.2], 22 |
| gate-yard | d3_duty_shovel | c1_truck_gate -0.6, d3_duty_shovel -2.8, e_new_recruit -2.2, e_transfer_truck -0.6 | +0.0 | [3, -14.2, 1.7] to [4, 8, 2.4], 22 |
| laundry | d5_duty_laundry | d5_duty_laundry -2.8 | +0.0 | [-3.5, -2.6, 1.7] to [1.0, 2.0, 1.8], 20 |
| mail-room | d3_mail_room | d3_mail_room -0.9 | +0.0 | [1.5, -1.3, 1.7] to [-0.3, 1.5, 1.3], 18 |
| perimeter | e_tree_line | e_tree_line -1.7, n7_perimeter +0.0, n7_set_down +0.0 | +0.8 | [0, 20, 1.7] to [0, 200, 6], 35 |
| rec-room | d1_rec_room | d1_rec_room -1.6 | +0.0 | [-2.3, -2.6, 1.6] to [0.5, 2.5, 1.8], 20 |
| room-below | e_zoo_wake | e_zoo_wake -3.6 | +0.0 | [-2.2, -2.2, 1.5] to [0.6, 2.5, 1.4], 18 |
| sams-office | d5_sam_office | d5_sam_office -2.6, n4_office +0.0 | +0.0 | [-5.0, -2.0, 1.5] to [-1.0, 2.0, 1.3], 20 |
| tall-halls | c1_halls | c1_halls +0.0, d2_duty_paint -1.1, d7_duty_walk -0.9, n7_windigo -0.6 | +0.0 | [0.3, -52, 1.6] to [0, -20, 2.4], 22 |
| the-cave | e_cave | e_cave +6.0 | +0.5 | [0, -6.5, 1.7] to [0, 5, 2.0], 22 |
| the-pens | n6_pens | n6_pens -2.8 | +0.0 | [-19.0, -2.6, 1.7] to [5, 1, 2.2], 22 |
| truck-cab | n3_glovebox | n3_glovebox -1.1 | +0.0 | [-1.1, 1.0, 1.7] to [1.7, 2.8, 1.4], 22 |

Deltas the rig cannot close: the box proxies have no texture, grime, fog or falling snow; the references are darker, more contrasty and
cooler or greener than the proxies lit by the build files' lights; the perimeter trees are far away and read as a small clump (the
reference is a wide dark band); the cave rock is grey, the reference purple; the boiler's firebox lights are bright points on solid
boxes. The overview is a corner view with a wide lens, so it shows more than the reference's framing.

### Reference left out (no figure imagery)

`the-pens.jpg` shows a small seated shape at the right of the floor that reads as a figure at sheet size (it is probably a valve). The sheet
holds a text card there instead (`rig.json`: `reference_card`). I looked at the other 14 references and found no figure (the dark mark
at the far door of cold-store is a latch; the gate-yard vehicle is a truck).

## Figures and figure-like proxies

No person, creature, statue, mannequin, body or head appears in any frame. Props whose id or object reads as a figure are plain boxes
with plain names (the driver names the Blender object from `rig.json` `neutral_names`; the ledger records both): `sleeping-bag` is
`bedroll-slab` (a flat 0.8 x 2.0 x 0.15 slab), `laced-boots` is `footwear-box`, `uniform` is `hanging-panel` (a flat panel on a rail,
not a garment on a form), `sheet-covered-table` is `table-slab`, `kit-fisk` is `kit-bag-b`, `bed-fisk`/`bed-mate` are `bed-a`/`bed-b`,
`bags-fisk`/`bags-mate` are `bedroll-slab-a`/`-b`, `boots-mate` is `footwear-box-b`, `uniform-fisk` is `hanging-panel-e`.
Blockout pieces are built by the repo's own code and keep the build file's ids inside Blender; here they are named by shape:
`stalagmite-fisk` and `stalagmite-next` are limestone cones, `cot` (room-below) is a 0.9 x 2.0 x 0.6 slab, `claw-marks-*` (tall-halls) are
flat wall plates (nothing drawn on them). The proposal for the author is to rename these ids (`stalagmite-fisk` to `cone-pool-a`,
`stalagmite-next` to `cone-pool-b`, `cot` to `bed-slab`, `claw-marks-*` to `scratch-plate-*`), which changes ids only and needs
`check_blender.py` after.

## Phase C: models

`games/man-eater/assets/models.json` does not exist and no `.glb` of any object of this game was found, so every prop is a named box proxy
(30 object types). The swap path was not exercised.

## Phase D and gaps

38 scenes at 2560x1440 / 256 samples, the eye-height player-start still of every scene (all 38 have a start), and one overview per
location (1920x1080 / 128): 91 stills. Contact sheets: `renders/man-eater/<location>.jpg` (bunk-room: 14 scenes, a tall sheet); ledger:
`ledger.json`. Not produced: the depth and object-index passes. The `n7_windigo` scene is built from the hall alone (no creature, as the
rule requires).

## Models re-render (2026-11-23)

Every built model of `games/man-eater/assets/models.json` (the ComfyUI session's ledger in the other working copy, re-read at the start of the run, status `built` only; read only, never copied into this repo) replaces its box proxy, and all 38 scenes and 15 overviews were rendered again with the earlier rig, overrides, flags and fixes unchanged (Phases A and B are not redone). The render copies are the full 80k-triangle models re-exported with 1024 px JPEG textures (made in Blender because the render box's upload link is slow; the originals stay out of the repo); a first final with 12k-triangle / 512 px copies was discarded because decimation shattered thin surfaces.

- **Ledger state**: 30 entries: 27 built, 3 failed.
- **Proxy to model**: 24 object types, 280 of 320 prop instances: `army-truck`, `boiler`, `bread-loaf`, `bunk-bed`, `door-log-clipboard`, `fence-post`, `floor-drain`, `key-ring`, `kit-bag`, `ladder`, `mail-sack`, `meal-tray`, `paint-tin`, `round-table`, `rules-card`, `sheet-covered-table`, `snow-shovel`, `supply-crate`, `tube-stand`, `two-handle-door`, `wall-clock`, `wood-stove`, `work-lamp`, `yard-lamp`.
- **Still a named box proxy**: `card-deck` (no model used: ledger status failed), `file-folder` (no model used: ledger status failed), `filing-cabinet` (no model used: ledger status failed), `laced-boots` (model skipped: Man Eater: no figure-like models; a pair of upright boots reads as legs; named box proxy (footwear-box) stays), `sleeping-bag` (model skipped: Man Eater: no figure-like models; the mummy bag has a body-shaped outline; named box proxy (bedroll-slab) stays), `uniform` (model skipped: Man Eater: no figure-like models; the garment on its hanger reads as a body; named box proxy stays) (40 prop instances).
- **Front direction (-y)**: every built model was viewed from -y and from 50 degrees beside it on a montage before the run (Blender workbench). The driver keeps a model's own orientation unless it fits worse than a factor of 3 and then tries the six axis permutations; turned: door-log-clipboard [90, 0, 0], key-ring [0, 90, 90], snow-shovel [0, 90, 0].
- **Figures and creatures**: Man Eater takes no figure-like model: `uniform` (trousers on a hanger, reads as a body), `laced-boots` (an upright pair reads as legs) and `sleeping-bag` (a body-shaped mummy bag) are skipped and stay the neutral-named box proxies (hanging-panel, footwear-box, bedroll-slab); the new `wood-stove` was viewed from -y and at 50 degrees and is not figure-like.
- **Fit (ledger `objects`, `props[].fit`)**: scale uniform; worst side ratio between model and `size_m` box over 1.8: fence-post x2.23, rules-card x2.32, snow-shovel x2.09, two-handle-door x2.94, yard-lamp x2.46. These models are as proportioned by the generator (the box's `size_m` is the author's guess); none was stretched. No fit was rejected.
- **Proportion problems the ComfyUI ledger records** (largest requested side matched, uniform scale): boiler: rotated 90 deg about Z so its long side matches size_m; bread-loaf: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 1.00, 0.77, 0.65); scaled uniformly so its largest requested side matches; bunk-bed: proportions differ from size_m (axis ratios 1.17, 1.00, 0.71); scaled uniformly so its largest requested side matches; door-log-clipboard: proportions differ from size_m (axis ratios 0.14, 0.02, 1.00); scaled uniformly so its largest requested side matches; fence-post: proportions differ from size_m (axis ratios 0.30, 0.31, 1.00); scaled uniformly so its largest requested side matches; key-ring: proportions differ from size_m (axis ratios 0.10, 0.04, 1.00); scaled uniformly so its largest requested side matches; kit-bag: proportions differ from size_m (axis ratios 0.71, 0.65, 1.00); scaled uniformly so its largest requested side matches; ladder: proportions differ from size_m (axis ratios 0.66, 0.98, 1.00); scaled uniformly so its largest requested side matches; mail-sack: proportions differ from size_m (axis ratios 0.83, 0.68, 1.00); scaled uniformly so its largest requested side matches; meal-tray: proportions differ from size_m (axis ratios 1.00, 0.82, 0.66); scaled uniformly so its largest requested side matches; rules-card: proportions differ from size_m (axis ratios 0.43, 0.12, 1.00); scaled uniformly so its largest requested side matches; sheet-covered-table: rotated 90 deg about Z so its long side matches size_m; snow-shovel: rotated 90 deg about Z so its long side matches size_m; proportions differ from size_m (axis ratios 0.24, 0.18, 1.00); scaled uniformly so its largest requested side matches; supply-crate: proportions differ from size_m (axis ratios 1.00, 1.44, 1.56); scaled uniformly so its largest requested side matches; tube-stand: proportions differ from size_m (axis ratios 0.69, 0.83, 1.00); scaled uniformly so its largest requested side matches; two-handle-door: proportions differ from size_m (axis ratios 0.91, 0.11, 1.00); scaled uniformly so its largest requested side matches; wood-stove: proportions differ from size_m (axis ratios 0.59, 0.63, 1.00); scaled uniformly so its largest requested side matches; work-lamp: proportions differ from size_m (axis ratios 0.68, 0.66, 1.00); scaled uniformly so its largest requested side matches; yard-lamp: proportions differ from size_m (axis ratios 0.18, 0.37, 1.00); scaled uniformly so its largest requested side matches.
- **Tone**: the models change the frame's average brightness, so per-scene `exposure_ev` and `overview_ev` in `tools/render/rig.json` were re-matched to the box-proxy pass's mean luminance (damped log2 ratio, from look passes at 0.4 scale and 25 % samples of the box run and the model run; changed only where the two differed by more than 10 %). No light, world, camera or lens was changed.
- **Camera inside a model**: none (`camera_inside_prop` empty in every scene). Informational `prop_overlap` entries stay in the ledger.
- **Proposed diffs** (not applied): none new from the models. The earlier proposals stand; where a model is much larger than its box the author may want `size_m` in `assets.json` corrected to the model's proportions.
- `flagged-before-after.jpg` was redone with the models ("before" = build file as it is, 0.4 scale, 25 % samples; "after" = final still).
- **Fix round (after the first model pass)**: the ledger had been read stale: the first pass left the built `wood-stove` as a box proxy; it is now a model (fit worst side x1.68, none turned) in rec-room/d1_rec_room, the only scene that uses it, which was rendered again with its overview (the stove stands outside the camera views and shows only where the overview reaches it); frame luminance changed under 1 %, so no exposure change.
- GPU time on the rented RTX 4090 (measured from the box's run log): look passes 220 s, first final with 12k-triangle copies 1185 s (discarded), final 1951 s wall (parallel with the other two games' finals), before passes 11 s + 15 s, one 7 s test of the door and boiler at higher detail. The three finals ran at the same time on the one box between 04:24 and 05:02 UTC (about 2280 s); all Blender wall time of the whole task on the box about 5600 s (1.55 h), measured from the box's run log (times.txt); upload and download not counted; fix round (wood-stove): the rec-room scene and overview 60 s.

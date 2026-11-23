# dr-tox-altrulan: refinement notes (render and refinement plan, third batch, sibling game)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for
the author. Some are applied only inside the driver (`tools/render/overrides.json`), marked "applied at render time". The 19 scenes
of this game were not in the first pass: all were rendered, with all 4 overviews; every prop is a named box proxy (no model exists).
Each scene's own lights, world, camera and lens were used; the additions are the rig's exposure and translucency (Phase B).

## Phase A: flagged scenes (none from the first pass; two found by the driver)

### 1. light-bringers-shrine / s3_end_kept (camera above a closed outer-wall)
Cause: `outer-wall` is a closed cylinder (48 x 48 x 24 m, role wall) with a lid at z 24, and the camera `[0, -18, 26]` looks down at
the drum cap from above it, so the still showed the lid (a green slab) with the bell frame poking through it. Proposed diff, applied at
render time (this scene only: the outer wall is omitted):
```json
[{"op": "remove", "path": "/blockout/<id=outer-wall>"}]
```
for this scene only; the build file has one blockout for all scenes, so the lasting fix is to make the outer wall an open ring (a
ring of box wall segments, or an `open_top` flag in `tools/blender/blockout.py`), or to lower the camera to z 21 inside it.
`flagged-before-after.jpg` shows both.

### 2. glass-mountains / s3_mountains_foot (look_at inside tower-1): checked, false positive
The driver reports `vine-face` and `tower-1` between camera and target: `look_at [0, 30, 40]` is 5 m inside the tower, behind its
face. The view shows the three towers as intended. Proposed diff (not applied): `/scenes/s3_mountains_foot/camera/look_at` `[0, 24, 40]`.

## Other findings

| Where | Finding | Proposed diff | At render time? |
| --- | --- | --- | --- |
| glass-mountains, all scenes | `plaza` (top at z 0.12) stands 0.12 m proud of the plain, so props placed at z 0 on it (mast-1, mast-2, cart, stone) sit 0.12 m inside it | `/blockout/<id=plaza>/location` `[0, 0, -0.06]`, and `road` `[0, -32, -0.05]` | no (invisible) |
| light-bringers-shrine, all scenes | the `outer-wall` of role wall is a closed cylinder with a lid; the drum cap `drum-cap` is a role `floor` disc at z 22.3 | see finding 1 | no |
| snakehead-holy-site, s3_cave_tank and s3_end_two_readings | the `ghost-tank` proxy (2.4 x 1.2 x 1.8 m, rotated 90 degrees) is 3 m ahead and fills the frame at 50 mm, with the lectern in front of it | none until the models exist | no |
| snakehead-holy-site, s3_cave_store and s3_end_last_toad | the light is a 60 to 90 W votive point and a spot: at the location EV the frame is near black, so these two scenes take +2.5 EV from the rig | none | rig only |
| `assets.json` | the four location images and the object images are missing (see the owner decision in the README) | generate them | no |

Checks after the overrides: nothing inside a piece, nothing between camera and target except finding 2.

## Phase B: the rig per location (overview against the described lighting)

`games/dr-tox-altrulan/assets/locations/` holds no image: `assets.json` has the prompt and the lighting line only ("images and web
modes still to come"). The overview was therefore matched to the written lighting, not to a picture, and the contact sheets show a
"no reference image yet" card with the lighting line where the reference would be. Only the driver's rig changed (`tools/render/rig.json`);
the overview's EV is the location EV plus that scene's offset plus the overview EV. Values are by eye.

| Location | Overview lighting | EV | Per-scene EV offsets | Overview EV | Glass alpha | Overview camera (eye to look_at, mm) |
| --- | --- | --- | --- | --- | --- | --- |
| glass-mountains | s3_mountains_foot | -1.6 | summit_night +1.8 | -0.6 | 0.3 | [0, -56, 2.5] to [0, 40, 38], 22 |
| light-bringers-shrine | s3_shrine_drum | +1.5 | end_kept -2, end_stamp -0.7, shrine_altar +0.5, shrine_drum +1 | -1.5 | 0.12 | [6, -19, 1.8] to [-2, -8, 4.5], 24 |
| metabolic-city | s3_city_gate | +0.3 | city_market +0.3, city_night +0.8 | 0 | 0.25 | [0, -27, 3] to [0, 12, 9], 22 |
| snakehead-holy-site | s3_cave_tank | 0 | cave_store +2.5, end_last_toad +2.5, cave_corridor +0.3 | +3 | none | [-2, -10, 2] to [6, 14, 2], 24 |

Against the written lighting:

- glass-mountains: "overcast plain daylight on dust, the towers' glass catching it high up": the overview is flat overcast grey on the
  three towers with the vine face as a green slab; the glass is a grey translucent box, so nothing catches the light; the dawn gold and
  the night city are in other scenes (`s3_mountains_summit`, `s3_summit_night`).
- light-bringers-shrine: "daylight through the old glass drum, warm and even; halos in gold leaf over the door": the overview stands at
  the door and shows the steel door, the relief slab (no halos, no figure: a plain box) and the drum behind; the plaster ring and the
  altar are in the interior scenes.
- metabolic-city: "pale blue-white fungus light, green-gold daylight through vine-covered glass": the overview looks from the gate to the
  mezzanine with two vine ribs framing it; the fungus shelf is the one bright strip; the stalls are small boxes.
- snakehead-holy-site: "one amber lamp at the old bench, a cold pale light off the water in the Ghost's tank": the amber votive and the
  cold tank glow both read, with hard falloff to black, as written; the breach shaft is not in this scene's lighting.

## Phase C: models

`games/dr-tox-altrulan/assets/models.json` does not exist, so no real model was swapped; every prop is a named box proxy by prop id,
sized from `assets.json` (30 object types). `halo-relief` (4 x 0.6 x 5 m, a relief of a standing figure in the prompt) is a plain slab.

## Phase D and gaps

Stills: every scene at its tier (17 hero at 2560x1440 / 256 samples, 2 standard at 1920x1080 / 128 samples: s3_end_kept,
s3_end_stamp) plus the player-start eye-height still of the 15 scenes that have one, and one overview per location (1920x1080,
128 samples): 38 stills. Contact sheets: `renders/dr-tox-altrulan/<location>.jpg`. Ledger: `ledger.json`. Not produced: the depth and
object-index passes. No frame holds a person or creature, and no prop is figure-like.

---

# Batch 10: re-render with the reference images (Phase B again) and the real models (Phase C live)

Nothing in `games/` was edited. The four location reference images exist now (read from the image branch, never copied into this
branch) and 26 of the 30 object models are built (the model session's ledger, read only; the glbs are never copied into the repo).
All 19 scenes and the 4 overviews were rendered again at their tiers (17 hero 2560x1440 / 256 samples, 2 standard 1920x1080 / 128
samples, overviews 1920x1080 / 128), plus the player-start stills of the 15 scenes that have one. The sections above stay as they
were for the box-proxy batch.

## Phase A again: flagged scenes

| Scene | Status after the models | What was done |
| --- | --- | --- |
| s3_end_kept | unchanged: camera above the closed `outer-wall` | still fixed at render time (the wall is omitted in this scene); the proposed diff above stands; `flagged-before-after.jpg` was redrawn with the models |
| s3_mountains_foot | unchanged: false positive (look_at 5 m inside tower-1) | no change; the proposed diff above stands |
| s3_shrine_book | NEW, found only with the real model | see below, fixed at render time |

### 3. light-bringers-shrine / s3_shrine_book (lectern turned away from the camera)
`lectern` is rotated 200 degrees in the build file. A box proxy is symmetric, so the first batch could not show it; the real
`shrine-lectern` has its reading side toward -y, so at 200 degrees the book faces +y and the scene camera (at [-4.5, 0.2], south-west of
the lectern) sees its back. Applied at render time for this scene only (`tools/render/overrides.json`): rotation `[0, 0, -20]`, which
turns the open book toward the camera. Proposed diff for the build file:
```json
[{"op": "replace", "path": "/props/<id=lectern>/rotation_deg", "value": [0, 0, -20]}]
```
(only if the lectern should face the south-west; a plain flip of 180 degrees is `[0, 0, 20]`). The keeper lectern in
snakehead-holy-site is rotated 180 degrees too and turns its back to `s3_end_two_readings`, which reads as an over-the-shoulder view
toward the tank; left as written.

## Model findings (Phase C)

Every model was checked from -y (workbench, two angles) before the render: all face -y as the ledger's note asked, and none shows a
person or creature. Fit method as in batch 6 (`tools/render/README.md`): the model is fitted to the prop's box; no model was rejected.
Per object (scale and the worst side ratio of the fit; the per-prop records are in `ledger.json`):

| Object | Drawn as | Scale | Worst side ratio | Model dims (m) vs box (m) |
| --- | --- | --- | --- | --- |
| altar-basin | model | 0.783 | x1.28 | [1.004, 1.001, 1.022] vs [1.0, 1.0, 0.8] |
| altar-stone | model | 0.894 | x1.25 | [2.027, 1.184, 1.399] vs [2.0, 1.2, 1.0] |
| bell-frame | model | 1.281 | x1.85 | [4.061, 1.685, 3.34] vs [4.0, 4.0, 3.0] |
| bench-altar | model | 0.787 | x1.26 | [2.21, 1.204, 1.288] vs [2.2, 0.8, 0.95] |
| fungus-lamp | named box proxy | | | model skipped: model not built (ComfyUI out of memory); named box proxy stays |
| ghost-tank | model | 0.731 | x1.45 | [2.407, 2.38, 2.319] vs [2.4, 1.2, 1.8] |
| halo-relief | named box proxy | | | model skipped: the object image shows a figure (carved halo relief); no model, plain slab proxy |
| keeper-lectern | model | 0.993 | x1.28 | [0.74, 0.646, 1.209] vs [0.6, 0.5, 1.2] |
| keeper-pallet | model | 0.605 | x1.64 | [2.015, 1.658, 0.854] vs [2.0, 0.9, 0.35] |
| kneeling-cushion | model | 0.919 | x1.22 | [0.603, 0.582, 0.198] vs [0.6, 0.6, 0.15] |
| last-toad-jar | model | 0.987 | x1.01 | [0.407, 0.409, 0.608] vs [0.4, 0.4, 0.6] |
| lime-tub | model | 1.0 | x1.05 | [0.702, 0.735, 0.474] vs [0.7, 0.7, 0.5] |
| market-stall | model | 0.947 | x1.19 | [2.497, 1.878, 2.535] vs [2.5, 1.5, 2.4] |
| measure-vessels | model | 0.733 | x1.47 | [0.906, 0.904, 0.692] vs [0.9, 0.45, 0.55] |
| memorial-brass | model | 0.994 | x2.71 | [2.086, 0.817, 2.013] vs [1.2, 0.3, 2.0] |
| morris-bench | model | 0.757 | x1.37 | [1.814, 0.76, 0.904] vs [1.8, 0.6, 0.5] |
| pilgrim-handcart | model | 0.873 | x1.14 | [2.005, 1.431, 1.508] vs [2.0, 1.2, 1.2] |
| plate-door | model | 0.983 | x2.35 | [3.108, 0.958, 3.256] vs [2.4, 0.4, 3.2] |
| scaffold-plank | model | 0.683 | x1.45 | [3.021, 1.314, 2.495] vs [3.0, 0.7, 1.5] |
| scales-relic | model | 0.991 | x1.72 | [1.798, 0.87, 1.614] vs [1.2, 0.5, 1.6] |
| shrine-lectern | model | 0.993 | x1.53 | [1.077, 0.749, 1.309] vs [0.7, 0.6, 1.3] |
| sleeping-mat | model | 0.565 | x2.35 | [2.003, 1.198, 0.416] vs [2.0, 0.9, 0.1] |
| spring-basin | named box proxy | | | model skipped: model not built (ComfyUI out of memory); named box proxy stays |
| store-shelf | model | 0.986 | x1.78 | [2.414, 0.902, 1.034] vs [2.4, 0.5, 1.8] |
| toad-jar | named box proxy | | | model skipped: model not built (ComfyUI out of memory); named box proxy stays |
| trellis-mast | model | 0.986 | x4.86 (height only) | [7.891, 6.085, 18.248] vs [1.6, 1.6, 18.0] |
| vine-node | model | 0.99 | x1.16 | [1.405, 1.392, 1.516] vs [1.2, 1.2, 1.5] |
| votive-lamp | model | 0.996 | x1.78 | [0.321, 0.226, 0.602] vs [0.4, 0.4, 0.6] |
| water-bowl | model | 1.059 | x1.07 | [0.604, 0.567, 0.221] vs [0.6, 0.6, 0.25] |
| way-stone | model | 0.993 | x1.27 | [0.804, 0.768, 1.409] vs [1.0, 0.6, 1.4] |

- `trellis-mast` is 18 m tall and thin in the build file (1.6 x 1.6 x 18 m); the model's head (a floodlight cluster on a lattice
  mast) is 7.9 x 6.1 m. The generic fit would have shrunk the whole mast to about 6.8 m to keep the head in the box, so the driver's new
  rig key `model_fit` (`"trellis-mast": "height"`, glass-mountains) scales it by height only: 18 m tall, head x4.9 wider than the box.
  Decision for the owner: keep the wide head (the reference image shows wide lamp heads on thin posts) or ask the model session for a
  narrower one.
- `store-shelf` came out 1.03 m high for a requested 1.8 m (axis ratio 1.79 in the ledger), so the fit shrank it; the four `toad-jar`
  box proxies at z 1.15 float about 0.12 m above its top. Proposed: the model session rebuilds it taller, or the toad-jar `location` z
  becomes 1.03. Not applied (the proxies are named boxes either way).
- `memorial-brass` (x2.7), `plate-door` (x2.35), `sleeping-mat` (x2.35, scaled 0.57 so the mat is 1.1 m long), `keeper-pallet` (scaled
  0.6, 1.2 m long) and `scales-relic` (x1.7) are the loosest fits: the model proportions differ from `size_m` (the ledger lists the
  same ratios). Positions are right; sizes follow the build file's heights.
- `ghost-tank` is a dark opaque drum (the model's glass is part of its texture): the cold light off the water comes from the scene's
  area light, not from the model. Proposed for the model session: a more transparent glass, or a separate water plane.
- Left as named box proxies: `fungus-lamp`, `spring-basin`, `toad-jar` (the ledger says they failed: ComfyUI out of memory) and
  `halo-relief` (the object image shows a carved figure, so no model was built and the proxy stays a plain slab, no figure-like shape).
- The models used are lite copies (12k triangles, 512 px JPEG, about 0.6 MB each, made locally with Blender because the render box's
  upload link is slow); close up they show decimation shards (the lectern's rear in the first look).

## Phase B again: the overview against its reference image (rig only)

The overview of each location was matched to its reference image by the driver's rig only; each scene's own camera and lens, and its
own lights, world and blockout were used for every scene still. The overview's lighting scene stays the one named in the table. New
overview-only rig keys (`tools/render/README.md`): `overview_world` (a flat colour, or a horizon-to-zenith gradient, with an optional
thin fog), `overview_fills`, `overview_light_gain`, `overview_piece_alpha`, `overview_hide_pieces` and `overview_grade_gain`, next to
the existing `overview` camera and `overview_ev`. The overview camera is a rig item, framed to the reference's composition as in every
earlier batch. Tone: mean luminance of the final overview against its reference, measured on 480x270 copies (reference / render): glass-mountains 0.311 / 0.309, light-bringers-shrine 0.405 / 0.427, metabolic-city 0.367 / 0.370, snakehead-holy-site 0.311 / 0.323; mean colour within 0.03 per channel for all four. Per-channel grade by script (damped), then by eye.

| Location | Overview lighting scene | Camera (eye to look_at, mm) | Overview EV (on top of the location EV) | Grade gain (r, g, b) | Overview-only rig |
| --- | --- | --- | --- | --- | --- |
| glass-mountains | s3_mountains_foot | [-16, -60, 3] to [2, 40, 54], 14 | +0.26 | 1.01, 1.013, 0.838 | sky gradient horizon [1, 0.55, 0.25] to zenith [0.03, 0.06, 0.15]; low gold sun (energy 5, from the -x, -y side); the scene's lights x0.25; glass pieces 0.9 opaque so the towers read as solids |
| light-bringers-shrine | s3_shrine_drum | [5.5, -19, 2.4] to [-1, -5, 2.4], 22 | -1.63 | 1.041, 1.004, 0.83 | a cutaway: `outer-wall`, `drum` and `scripture-ring` left out; warm world (strength 0.12) and warm sun (0.8); the scene's lights x0.15 |
| metabolic-city | s3_city_gate | [-14, 4, 1.6] to [2, 27, 3.5], 24 | -1.26 | 1.167, 0.97, 0.884 | green-teal world (strength 0.5); a cold teal area light at the fungus shelf (energy 1500) |
| snakehead-holy-site | s3_cave_tank | [-9, -4, 1.9] to [8, 13, 1.8], 22 | +3.06 | 1.147, 0.973, 0.853 | near-black world with thin fog (density 0.004); a cold spot shaft from the breach (energy 3000) |

What matches and what does not:

- glass-mountains: the dusk gradient, the low gold light and the three towers behind two masts match in tone and layout; the towers are
  flat slabs, the vine face is a green slab and the bell frame at z 100 is out of frame; no way-stone in the overview.
- light-bringers-shrine: warm even daylight, the plate door at the left with the relief slab above it (a plain box), the altar, scales,
  basin and cushions on the plaster floor. The reference's statue and fresco are figure imagery: its sheet tile is a text card
  (REFERENCE LEFT OUT); tone and framing were matched from the picture by eye. The stair and the fresco ring are not in the build file.
- metabolic-city: green-teal glass vault light, market stalls under the mezzanine and the fungus strip at the left; the vines, roots and
  the brass plaque of the reference are not blockout pieces, so the render is far plainer than the picture. Its reference shows no
  figure, so it stays on the sheet.
- snakehead-holy-site: amber votive at the bench, cold light at the tank, a grey shaft from the breach, hard falloff; the corridor and
  its reliefs are not in this view. Its sheet tile is a text card (the reference shows figure reliefs).

## Phase D

`renders/dr-tox-altrulan/<location>.jpg` (the overview beside its reference image or a text card, then each scene's still; 1280 px
wide), `flagged-before-after.jpg` (s3_end_kept and s3_mountains_foot, before at 0.4 scale and 25% of the samples, after at full size),
`ledger.json` (now with `models` and `gpu` keys). The depth and object-index passes are still not produced. No frame holds a person
or creature. `python tools/check_assets.py dr-tox-altrulan` still fails with the same 34 problems (the location and object images are
on the image branch, not in this one); `check_blender` and `validate` pass.

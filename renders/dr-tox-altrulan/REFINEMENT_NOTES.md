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

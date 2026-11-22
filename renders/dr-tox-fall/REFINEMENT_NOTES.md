# dr-tox-fall: refinement notes (render and refinement plan, second batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for
the author. Some are applied only inside the driver (`tools/render/overrides.json`, read by `tools/render/render_scenes.py`), marked
"applied at render time". All 21 scenes and 5 overviews were rendered; every prop is a named box proxy (no model exists, Phase C).
Each scene's own lights, world, camera and lens were used; the additions are the rig's exposure, tint and translucency (Phase B).
No fill light was added. A "before" pass (build file as it is, no overrides) was run at 0.4 scale to confirm each cause; the driver
found the same five first-pass flags and nothing else except the annex floor (below). `flagged-before-after.jpg` shows both.

## Phase A: the five flagged scenes

### 1. salvage-settlement / s3_settlement_day (camera inside the embankment)
Cause: `camera [-48, -26, 1.7]` and `player_start [-48, -28, 0]` are inside `embankment` (x -57 to -47, y -39 to -9, z 0 to 3), so the
still was black. Proposed diff, applied at render time (camera and player start):
```json
[{"op": "replace", "path": "/scenes/s3_settlement_day/camera/location", "value": [-45.5, -26, 1.7]},
 {"op": "replace", "path": "/scenes/s3_settlement_day/player_start/location", "value": [-45.5, -28, 0]}]
```
Alternative: stand on the embankment, camera z 4.7.

### 2. snakehead-fortress / s3_fortress_following (archive-row-3 between camera and target)
Cause: the sight line from `[-17, -2, 1.7]` to `[0, 11, 0.8]` grazes the west end of `archive-row-3` (x -9 to 9, y 4, 2 m high) at about 1.3 m.
Proposed diff, applied at render time: camera `[-19, -2, 1.7]`, player start `[-19, -2, 0]`. Alternative: `archive-row-3/size_m [16, 0.8, 2.0]`.

### 3 to 5. spire-gala / s3_gala_balcony, s3_gala_leash, s3_gala_bond (glass-north between camera and target)
Cause: `glass-north` (80 x 0.2 x 24 m at y 19) is a solid, opaque box in the renders and has no doorway, so the camera in balcony
and leash faces the balcony through it, and in bond (camera on the balcony) faces back into the hall through it. Proposed diff,
applied at render time (`spire-gala/*`):
```json
[{"op": "remove", "path": "/blockout/<id=glass-north>"},
 {"op": "add", "path": "/blockout/-", "value": {"id": "glass-north-west", "shape": "box", "role": "wall", "size_m": [34, 0.2, 24], "location": [-23, 19.0, 12.0], "material": "glass"}},
 {"op": "add", "path": "/blockout/-", "value": {"id": "glass-north-east", "shape": "box", "role": "wall", "size_m": [34, 0.2, 24], "location": [23, 19.0, 12.0], "material": "glass"}}]
```
A 12 m doorway (x -6 to 6) onto the balcony; the three sight lines cross y 19 at x -3.3 (leash), 0 (balcony) and 4.8 (bond).

## Other findings (not flagged by the first pass)

| Where | Finding | Proposed diff | At render time? |
| --- | --- | --- | --- |
| spire-gala, all scenes | `annex-floor` (top at z 0.1) stands 0.1 m proud of the main floor, so `chair` and `mirror` (base z 0) are 0.1 m inside it (`prop_off_floor`) | `/blockout/<id=annex-floor>/location` `[-35, -8, -0.05]` | yes |
| spire-gala and bloom-district | `glass`, `frosted` and the `haze` layer (100 x 70 x 0.5 m at z 8 over the whole street) are opaque boxes; the haze is a lid over the street | give the materials an alpha (the blockout step has none), or make `haze-layer` a fog volume | rig only: `piece_alpha` (haze 0.06, glass 0.25 to 0.3, frosted 0.7) |
| snakehead-fortress, lamp, bench, workshop | the frame is mostly one proxy box: `batch-bench` (1.8 x 0.7 x 1.6, 1.5 m away, 50 mm) holds the `lamp` (centre z 0.95, inside it) and the work-lamp point light is at z 1.6, level with the box top, so the face is dark; `gauntlet-vise` is one box at 2.5 m | none until the models exist; bench drawn 35 % opaque (`proxy_alpha`), which does not make the frame readable | rig only |
| salvage-settlement / s3_settlement_raid | `laundry-line` (6 x 0.4 x 2.2 box, rotated 15 degrees) stands 4 m from the camera and fills the frame, so the floodlight truck is hidden | camera or laundry nudge once the model exists; none proposed | no |
| relief-hall / s3_relief_queue | `dispenser-4` (26, 8) is 2.2 m tall and 2.5 m from the camera (28, 10), a dark box at the frame's left | none (reads better with the model) | no |
| bloom-district / s3_bloom_rooftop | the roof and one box fill the frame; the street is not in view | none | no |
| snakehead-fortress | `bay-partition` hides the bench from the east half of the archive, so no wide still from there can show the bench | none | no |
| `docs/BLENDER.md` | still says 126 build files, 304 scenes and "No scene has been run in Blender yet" | update the numbers | no |

## Phase B: the rig per location (overview against the reference image)

Only the driver's rig changes (see `tools/render/rig.json`); scene stills use the scene's own camera and lens, the overview has
its own driver camera and uses the lighting of one named scene. EV is the colour-management exposure (AgX); tint is a per-channel
gain; piece alpha draws a blockout material translucent. Values are by eye against the references (not measured).

| Location | Overview lighting | EV | Per-scene EV offsets | Tint (r, g, b) | Other | Overview camera (eye, look_at, mm) |
| --- | --- | --- | --- | --- | --- | --- |
| bloom-district | s3_bloom_morning | -0.5 | none | 0.92, 1.0, 1.0 | haze alpha 0.06 | [-56, 0, 14.5] to [30, 0, 2], 24 |
| relief-hall | s3_relief_queue | +0.5 | s3_relief_standoff +0.7 | 0.9, 1.0, 1.02 | none | [29, -1, 1.7] to [-30, -3, 2], 22 |
| salvage-settlement | s3_settlement_day | -1.6 | raid +1.5, haze +0.4, lost +0.4 | 0.92, 1.0, 1.04 | none | [-5, -30, 1.7] to [-30, 4, 5], 24 |
| snakehead-fortress | s3_fortress_lamp | +2.4 | lamp -4.2, bench -4.2, workshop -3.6, following -0.8, rite -0.8; overview +4.2 | 0.9, 1.0, 1.05 | glass alpha 0.3, bench 35 % | [-9.5, 5, 1.8] to [-18, -10, 1.4], 22 |
| spire-gala | s3_gala_floor | -3.2 | s3_gala_annex +2.0 | 1.0, 1.0, 0.95 | world gain 4, glass alpha 0.25, frosted 0.7 | [10, -23.5, 1.7] to [-2, 25, 6], 20 |

Deltas between each overview and its reference (the references are detailed photographic renders; a box set cannot match their
texture, so these are layout, colour and light deltas):

- bloom-district: the reference is an aerial view from a rooftop down a dense market street of sheds, with the truck on the roof at
  right; the build is a clean 12 m canyon between two brick blocks with four stall boxes and a truck far off. Colour (grey, hazy)
  roughly matches; the reference's rust patches, pipes, awnings and smoke are not in the build. The overview camera is over the
  street's west end at 14.5 m (a camera at 1.7 m sees only a wall).
- relief-hall: the reference looks out through the open shutter at the lockers, rails and a numbered board; the build's hall is 60 m
  long (the reference's is a short bay), the shutter is a thin box and the dispensers stand across it. Cold grey-teal light and the
  tube strips match; the reference's sandbags, buckets and red stamping are not placed.
- salvage-settlement: matches in sense (freeway deck on two piers over a dust plain); the horizon, the amber dusk strip, the towers'
  lights and the rubble are not in the build (the horizon is a hidden sky piece, so the sky is the world colour). The sheds and
  drums are small boxes beyond the piers.
- snakehead-fortress: amber work pool against cold light matches in sense; the reference's bench, cabinets, glass cells and
  roots-and-sky breach are boxes or absent (the breach is a flat daylight slab in the ceiling, out of this camera's view).
- spire-gala: the reference is a tall glass hall with lit columns and many round tables; the build has six table boxes, two columns
  and an opaque-grey far wall (the sky piece `city-below` is hidden; the translucent glass reads as a grey wall). Warm floor matched
  only partly; the reference's teal city is missing.

## Phase C: models

`games/dr-tox-fall/assets/models.json` does not exist, so no real model was swapped; every prop is a named box proxy by prop id,
sized from `assets.json` (34 object types). The driver's `--models` path has not been run.

## Phase D and gaps

Stills: every scene at the hero tier (2560x1440, 256 samples, OpenImageDenoise) plus the player-start eye-height still (21), and one
overview per location (1920x1080, 128 samples). Contact sheets: `renders/dr-tox-fall/<location>.jpg`. Ledger: `ledger.json`.
Not produced: the depth and object-index passes. No frame holds a person or creature, and no prop is figure-like.

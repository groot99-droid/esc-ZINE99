# dr-tox-rise: refinement notes (render and refinement plan, first batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff
for the author. The renders apply some of them only inside the driver (`tools/render/overrides.json`, read by
`tools/render/render_scenes.py`), so a still shows the effect without the build file changing; each such override is marked
"applied at render time". All 21 scenes and all 8 location overviews were rendered; every prop is a named box proxy
(no model exists, see Phase C). Each scene's own lights, world, camera and lens were used; the only additions are the rig's
exposure, tint and fog (Phase B). No fill light was added.

## Phase A: the three flagged scenes

Method: the driver checks each scene (camera inside a piece; a collide piece between camera and look_at; a prop inside or
overlapping a piece; a ground prop off its floor). A "before" pass (build file as it is, solid proxies, no overrides) was run
for these scenes at 0.4 scale to confirm each cause. The driver reproduced the first pass's `fence` finding
(`between_camera_and_target: ["fence"]` for s3_river_night) and found nothing for the other two (those two are framing
problems, which no geometry check sees).

### 1. hospital-room / s3_hospital_2217 (85 mm frames only the bench; the glass is behind the camera)

Cause: `observation-glass` is in the -y wall at `[0, -3.0, 1.6]`, behind the first-person camera that looks toward +y. The
reference image shows the glass in the far wall beside the bed and the door. The 85 mm push-in on the bench is the design
("push in on the bench for the first batch"), so the camera is left alone.

Proposed diff (`games/dr-tox-rise/blender/hospital-room.build.json`), applied at render time (`hospital-room/*` override):

```json
[
  {"op": "replace", "path": "/blockout/<id=observation-glass>/location", "value": [0.2, 2.95, 1.6]},
  {"op": "replace", "path": "/blockout/<id=observation-glass>/size_m", "value": [3.2, 0.1, 1.4]},
  {"op": "replace", "path": "/origin", "value": "room centre; +y toward the bed's head wall, the bench and the observation glass"}
]
```

The door stays at `[3.0, 3.0, 1.05]`; the glass spans x -1.4 to 1.8, clear of it, and the bed's head is at x -2.2.
Optional, not rendered: a wider first-person lens (50 mm) at the same camera would add the bed's near end, but it would
no longer be the bench push-in.

### 2. hospital-room / s3_injection_first (nearly all one box)

Cause: the `bench-rig` proxy is a solid 1.4 x 0.6 x 1.5 m box; the `vial` and `syringe` props stand at z 0.95, inside it, and
the camera (1.5, 1.2, 1.2) is 1.5 m from it, so the frame is the box's face. With the real bench model the vial and syringe sit
on its working shelf. Fixed at render time without any build-file change: the rig draws the `bench-rig` proxy 35 % opaque
(`proxy_alpha`), so the vial and syringe show. The proxy is still one named box.
Proposed build-file diff: none until the bench model exists.
Optional framing, not rendered: camera `[1.5, 1.2, 1.2]` to `[1.3, 0.8, 1.25]` (about 2 m from the bench) so more of the bench
is in shot at 85 mm.

### 3. idaho-river-town / s3_river_night (fence between camera and pipe)

Cause: the `fence` piece is solid, 100 x 0.1 x 1.8 m at y 16; the camera (0, 8, 1.0) looks at the pipe (20, 36, 1) and the
ray crosses y 16 at x 5.7, height about 1.3.
Proposed diff (`idaho-river-town.build.json`), applied at render time (`idaho-river-town/s3_river_night` override):

```json
[
  {"op": "remove", "path": "/blockout/<id=fence>"},
  {"op": "add", "path": "/blockout/-", "value": {"id": "fence-west", "shape": "box", "role": "structure", "size_m": [52, 0.1, 1.8], "location": [-24, 16, 0.9], "material": "steel"}},
  {"op": "add", "path": "/blockout/-", "value": {"id": "fence-east", "shape": "box", "role": "structure", "size_m": [40, 0.1, 1.8], "location": [30, 16, 0.9], "material": "steel"}}
]
```

The 8 m gap (x 2 to 10) is a gate in the chain-link fence, which the player needs anyway to reach the bank; the geometry
check passes after it. Alternative: move the camera past the fence, `camera.location [0, 8, 1.0]` to `[0, 17.5, 1.0]`.

## Other findings (not flagged by the first pass)

| Where | Finding | Proposed diff | At render time? |
| --- | --- | --- | --- |
| printer-room, all scenes | `vapour` (trim, 6 x 6 x 0.3 m at z 0.15) is a solid slab that swallows the base of `column` and `terminal` (both stand on the floor at z 0, 0.3 m inside it) and reads as a pale blue plinth | `/blockout/<id=vapour>/size_m` `[6, 6, 0.04]` and `/location` `[0, 0, 0.02]` | yes (`printer-room/*`) |
| trial-53-arena, both scenes | `blade-reese` and `blade-cally` have `rotation_deg [90, 0, z]` and no `height_m`, so the model is scaled to the object's `size_m` height 0.04 m, and a box of `size_m [0.08, 0.7, 0.04]` turned 90 degrees about x stands 0.7 m tall on its end. The size reads as a blade lying flat | either `rotation_deg [0, 0, 30]` and `[0, 0, 140]` (flat), or keep the rotation for an upright model and add `height_m 0.7` | yes, rotation x set to 0 (`trial-53-arena/*`) |
| idaho-river-town | `pipe` (base z 1.0) overlaps `headwall` (9 of 27 sample points) and `far-bank` (3 of 27); looks intended (a pipe through a wall) | none | no |
| lower-ring-corridor | `scaffold` (rotated 15 degrees, 3 m deep) overlaps `shopfront-row` (6 of 27) | move `scaffold` to y -3.5 | no |
| sky-room | `mat` (0.04 thick) overlaps the 0.02 `drain` disc | none (trivial) | no |
| lower-ring-corridor / s3_lower_ring | `player_start.facing_deg 270` faces -x, away from the camera's look direction (+x); in every other scene the bearing matches the camera if 0 faces +y and 90 faces +x (compass), so 270 looks like 90 | `facing_deg 90` | no |
| `docs/BLENDER.md` | says 126 build files and 304 scenes (there are 144 locations and 370 scenes without Altrulan) and "No scene has been run in Blender yet" | update the numbers | no |

Frames dominated by one box (read these as proxy limits, not mistakes): s3_bunker_injection (the `bay-chair` box at 2.5 m, 50 mm),
s3_spire_mirror (the `dressing-mirror` box at 4.6 m, 50 mm), s3_archive_claimed (the `bay-chair` box), s3_printer_room_after.
They will read better with the models.

## Phase B: the rig per location (overview against the reference image)

Plan rule: only the driver's rig (world, lights, exposure) changes, with each scene's own camera and lens for the scene
stills. The overview still has its own driver camera by plan (a wide still from a corner of the set at about 1.7 m); each
location's overview camera in `rig.json` was set to look the way the reference does as far as the build file's layout allows,
and the overview uses the lighting of one named scene. The values are in `tools/render/rig.json` and below. EV is the
colour-management exposure (AgX view transform); tint is a per-channel gain through the colour-management curve; fog is a
world volume scatter (density per metre, colour, anisotropy).

| Location | Overview lighting | EV | Per-scene EV offsets | Tint (r, g, b) | Fog | Overview camera (eye, look_at, mm) |
| --- | --- | --- | --- | --- | --- | --- |
| hospital-room | s3_hospital_2217 | -2.6 | none | 0.86, 0.98, 1.10 | none | [3.6, -2.6, 1.7] to [-1, 3, 1.3], 24 |
| idaho-river-town | s3_river_town | -1.5 | s3_river_night +3.5 | 0.95, 1.00, 1.00 | none | [40, -22, 1.7] to [-30, 6, 3], 24 |
| lower-ring-corridor | s3_lower_ring | +0.8 | s3_lower_ring_after -1.5 | none | 0.012, (0.70, 0.80, 0.82), 0.5 | [-22, -2, 1.7] to [25, 1, 2], 24 |
| printer-room | s3_printer_room | -3.0 | s3_printer_room_after +1.0 | 0.85, 0.97, 1.12 | 0.02, (0.40, 0.55, 0.80), 0.3 | [-5.5, -5, 1.7] to [0.5, 2.5, 2], 24 |
| sky-room | s3_skyroom_small | -2.0 | s3_skyroom_evening +1.5 | none | none | [8, -6.2, 1.6] to [-2, 4, 1.3], 24 |
| snakehead-archive | s3_archive_fall | +2.3 | s3_archive_empty +2.0, s3_archive_fall +1.0 | 0.88, 1.00, 1.06 | none | [-17, -12, 1.7] to [8, 6, 1.6], 24 |
| spire-plaza | s3_spire_ceremony | -3.2 | none | none | none | [35, 38, 1.7] to [-10, 64, 5], 20 |
| trial-53-arena | s3_arena | +0.8 | s3_arena_after +3.0 | 0.90, 1.00, 1.05 | none | [0, -14, 1.7] to [0, 8, 3], 20 |

Defaults for every location: world gain 1.0, light gain 1.0 (each scene's own lights, unscaled), spot cone 70 degrees with
blend 0.5 (the build files do not say), proxy colours by role (interact warm tan, hero blue-grey, fill grey), sky pieces hidden.
The exposure values are by eye against the references (not measured), tuned on low-sample passes.

Deltas between each overview and its reference (the references are detailed photographic renders; a box set cannot match their
texture, so these are layout, colour and light deltas):

- hospital-room: the reference has the door on the left wall, the glass in the far wall and the bed in front of it; the build has
  the door in the +y wall at x 3, so the layout differs. Colour: cold blue-grey, matched by EV and tint. Light: overhead
  fluorescent only, in both. The reference also has red floor tape and a clock (not in the build file).
- idaho-river-town: matched in sense (storefronts on one side, river and bank on the other); the build has no props along the
  street, the water tower is a box at (-50, -30), the street is flat asphalt. Overcast flat light in both. Missing: the
  reference's dust haze (no fog was added) and the detail of the brick fronts.
- lower-ring-corridor: shaft of daylight from the ceiling slot and cold fluorescent matched with the area light and the fog.
  Missing: the reference's rubble, scaffold pile, drums and shutters (the build has fewer props).
- printer-room: the reference is nearly black with a blue rim light; the render is a dark blue room with a seam light. The
  reference's column is darker steel; the proxy colour is blue-grey. Missing: pipes, vat glass, the television.
- sky-room: the reference has bunks along both side walls and the door in the far wall; the build puts the bunks on the +y wall and
  the door on -y, so the overview looks the other way. Wall paint colour (sky and field) matches; the floor is lighter than the
  reference's stained concrete.
- snakehead-archive: blue emergency light and the breach match in sense; the cabinets stand left in both. The reference's
  rubble and root-filled breach are not in the build (the breach is a flat earth box in the ceiling).
- spire-plaza: the reference is a wet dark plaza with glass towers and red and yellow screens; the render is a plain floor and box
  towers (outside this camera's view). The amber ready room is not in view from the plaza camera. Light: both overcast; the
  render's floor is lighter (no wet look).
- trial-53-arena: the reference is a round, curved concrete wall; the build's room is square, so the curvature cannot match (a
  build-file change, not a rig one). Seam, floodlights, concrete tint and a door in the near wall match.

## Phase C: models

`games/dr-tox-rise/assets/models.json` does not exist, so no real model was swapped; every placed prop stays a named box proxy
by prop id, sized from `assets.json` (33 object types listed there). The driver's `--models` path would import a glb in place of
a proxy once the ledger exists; it has not been run.

## Phase D and gaps

Stills: every scene at the hero tier (the plan lists all 21 dr-tox-rise scenes as hero): 2560x1440, 256 samples, OpenImageDenoise;
plus the player-start eye-height still for the 18 scenes with a `player_start` (3 scenes have none); plus one overview per
location (1920x1080, 128 samples). Contact sheets: `renders/dr-tox-rise/<location>.jpg`. Ledger: `ledger.json`.
Not produced: the depth and object-index passes the plan lists for hero scenes. Dr. Tox's arena is empty in both arena scenes;
no frame holds a person or creature, and no prop is figure-like.

## Models re-render (2026-11-22)

Every built model of `games/dr-tox-rise/assets/models.json` (the ComfyUI session's ledger in the other working copy, re-read at the start and again at
the end of the run, status `built` only; read only, never copied into this repo) replaces its box proxy, and all 21 scenes and 8 overviews
were rendered again with the earlier rig, overrides, flags and fixes unchanged (Phases A and B are not redone: see above). The models were lite
copies (12k triangles, 512 px JPEG textures) made only because the render box's upload link is slow; the originals stay out of the repo.

- **Proxy to model**: 32 object types, 239 of 245 prop instances. Object types: amber-vial, amber-work-lamp, archive-cabinet, armoured-transport, barrier-emitter, bay-chair, bench-rig, ceremony-lectern, child-bicycle, child-bunk, clean-water-tank, collapsed-scaffold, dressing-mirror, fiche-reader, insignia-case, isolation-bed, iv-pole, lead-shielded-syringe, outflow-pipe, pin-board, play-mat, printer-column, quarantine-sawhorse, rcc-terminal, shielded-locker, supply-crate, town-notice-post, toy-crate, training-blade, training-blade-rack, vat-unit, wall-speaker.
- **Still a named box proxy**: `broadcast-screen` (props screen-east, screen-south, screen-west): proportions: a side is off by x4.0 after the best fit.
- **Front direction (-y)**: every model was viewed from -y and from 50 degrees beside it on a montage before the run: none shows a person, creature
  or figure-like shape (except the one named above, if any). The driver keeps each model's own orientation unless it fits worse than a factor of 3 and
  then tries the six axis permutations; the ledger's `objects[].fit.fit_rotation_deg` records the turn (the ComfyUI ledger itself says "front direction not checked by eye").
- **Fit (ledger `objects`, `props[].fit`)**: scale uniform; worst side ratio between model and `size_m` box over 1.8: broadcast-screen x4.01, clean-water-tank x1.86, dressing-mirror x2.16, iv-pole x2.02, outflow-pipe x2.05, pin-board x1.83, rcc-terminal x1.82, shielded-locker x2.41, town-notice-post x1.85, training-blade-rack x2.06. These models are as proportioned by the generator (`size_m` of the box is the author's guess), none was stretched. Rejected fits stay box proxies as listed above.
- **Proportion problems the ComfyUI ledger records** (largest requested side matched, uniform scale): amber-work-lamp: proportions differ from size_m (axis ratios 0.67, 1.09, 1.00); scaled uniformly so its largest requested side matches; barrier-emitter: proportions differ from size_m (axis ratios 0.74, 0.62, 1.00); scaled uniformly so its largest requested side matches; bay-chair: proportions differ from size_m (axis ratios 0.48, 1.00, 0.55); scaled uniformly so its largest requested side matches; broadcast-screen: proportions differ from size_m (axis ratios 1.07, 0.13, 1.00); scaled uniformly so its largest requested side matches; ceremony-lectern: proportions differ from size_m (axis ratios 1.47, 0.97, 1.00); scaled uniformly so its largest requested side matches; child-bicycle: proportions differ from size_m (axis ratios 0.54, 1.00, 0.83); scaled uniformly so its largest requested side matches; child-bunk: rotated 90 deg about Z so its long side matches size_m; clean-water-tank: proportions differ from size_m (axis ratios 1.89, 0.85, 1.00); scaled uniformly so its largest requested side matches; collapsed-scaffold: proportions differ from size_m (axis ratios 1.00, 0.46, 0.72); scaled uniformly so its largest requested side matches; dressing-mirror: proportions differ from size_m (axis ratios 1.26, 0.46, 1.00); scaled uniformly so its largest requested side matches; insignia-case: proportions differ from size_m (axis ratios 1.00, 0.70, 0.35); scaled uniformly so its largest requested side matches; isolation-bed: rotated 90 deg about Z so its long side matches size_m; iv-pole: proportions differ from size_m (axis ratios 0.49, 0.51, 1.00); scaled uniformly so its largest requested side matches; lead-shielded-syringe: proportions differ from size_m (axis ratios 0.52, 1.00, 1.19); scaled uniformly so its largest requested side matches; outflow-pipe: proportions differ from size_m (axis ratios 0.33, 1.00, 0.35); scaled uniformly so its largest requested side matches; pin-board: proportions differ from size_m (axis ratios 1.00, 0.35, 0.72); scaled uniformly so its largest requested side matches; play-mat: proportions differ from size_m (axis ratios 1.00, 1.00, 0.42); scaled uniformly so its largest requested side matches; quarantine-sawhorse: proportions differ from size_m (axis ratios 1.00, 0.69, 0.81); scaled uniformly so its largest requested side matches; rcc-terminal: proportions differ from size_m (axis ratios 0.55, 0.62, 1.00); scaled uniformly so its largest requested side matches; shielded-locker: proportions differ from size_m (axis ratios 0.42, 0.42, 1.00); scaled uniformly so its largest requested side matches; town-notice-post: proportions differ from size_m (axis ratios 1.04, 0.53, 1.00); scaled uniformly so its largest requested side matches; toy-crate: proportions differ from size_m (axis ratios 1.00, 0.82, 1.12); scaled uniformly so its largest requested side matches; training-blade: rotated 90 deg about Z so its long side matches size_m, proportions differ from size_m (axis ratios 0.44, 1.00, 0.40); scaled uniformly so its largest requested side matches; training-blade-rack: proportions differ from size_m (axis ratios 1.00, 2.12, 1.03); scaled uniformly so its largest requested side matches; wall-speaker: proportions differ from size_m (axis ratios 1.00, 0.81, 0.73); scaled uniformly so its largest requested side matches.
- **Tone**: the models change the average brightness of a frame, so the per-scene `exposure_ev` offsets and `overview_ev` in `tools/render/rig.json` were re-matched to the box-proxy pass's mean luminance (damped, from quick look passes at 0.4 scale and 25 % samples), a handful of scenes only; no light, world, camera or lens was changed.
- **Camera inside a model**: none (`camera_inside_prop` empty in every scene). Informational `prop_overlap` entries remain in the ledger (a model's box against a blockout piece; invisible in the stills).
- **Proposed diffs** (not applied): none new from the models. The earlier proposals stand. Where a model is much larger than its box (see the fit list) the author may want the `size_m` in `assets.json` corrected to the model's proportions.
- `flagged-before-after.jpg` was redone with the models ("before" = build file as it is, 0.4 scale, 25 % samples; "after" = final still).
- GPU time on the rented RTX 4090 (measured from the box's run log): 740 s (0.21 h): ri_1 67 s, ri_2 68 s, ri_final 596 s, ri_bf 9 s.

# dr-tox-finale: refinement notes (render and refinement plan, third batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for
the author. Some are applied only inside the driver (`tools/render/overrides.json`, read by `tools/render/render_scenes.py`), marked
"applied at render time". All 24 scenes and 5 overviews were rendered; every prop is a named box proxy (no model exists, Phase C).
Each scene's own lights, world, camera and lens were used; the additions are the rig's exposure, tint and translucency (Phase B).
No fill light was added. A "before" pass (build file as it is, no overrides, 0.4 scale, 32 samples) of the one flagged scene is in
`flagged-before-after.jpg`.

## Phase A: the flagged scene

### 1. snakehead-overrun / s3_overrun_hall (cavern-wall-s between camera and target)
First-pass flag, confirmed by the driver. Cause: `cavern-wall-s` (48 x 1 x 8 m at y -15.5, solid) shuts the mouth of the archive
corridor (`corridor-floor`, y -25 to -15, walls at x +-1.65), so the 50 mm camera at [0, -19, 1.7] saw only rock. Proposed diff, applied
at render time (`snakehead-overrun/*`, so every scene there sees the opening):
```json
[{"op": "remove", "path": "/blockout/<id=cavern-wall-s>"},
 {"op": "add", "path": "/blockout/-", "value": {"id": "cavern-wall-s-west", "shape": "box", "role": "wall", "size_m": [22.5, 1.0, 8], "location": [-12.75, -15.5, 4], "material": "rock"}},
 {"op": "add", "path": "/blockout/-", "value": {"id": "cavern-wall-s-east", "shape": "box", "role": "wall", "size_m": [22.5, 1.0, 8], "location": [12.75, -15.5, 4], "material": "rock"}}]
```
A 3 m opening (x -1.5 to 1.5) in line with the corridor. After it the still shows the hall, the lectern and icon on the breach stair
and the four cots (`flagged-before-after.jpg`).

## Other findings (not flagged by the first pass)

| Where | Finding | Proposed diff | At render time? |
| --- | --- | --- | --- |
| snakehead-overrun / s3_overrun_after | `look_at [0, 15, 3]` lies inside `breach-stair` (3 x 6 x 4 m, rotated 20 degrees), so the frame is the stair box; the lectern and the icon overlap it (3/27 and 9/27 sample points) | `/scenes/s3_overrun_after/camera/look_at` `[0, 15, 6]` (looks up at the breach); lectern and icon heights to be settled with the models | no (changes the composition) |
| central-hub / s3_hub_gallery | the driver reports `drum` between camera and target: `look_at [0, -14, 1.6]` is 0.2 m inside the drum's glass, just past the 0.15 m tolerance. A false positive: the breach and the glass read as intended | none | no |
| central-hub, all scenes | `balance` and `lamp` (centre z 0.9) float in the core: no table stands under them (the reference has a workbench) | add `{"id": "core-table", "shape": "box", "role": "structure", "size_m": [1.6, 0.8, 0.9], "location": [2.5, -2.3, 0.45], "material": "steel"}` to `/blockout` | no |
| central-hub / s3_hub_door | the frame is the `door` proxy alone (2 x 0.6 x 3 m, 2 m ahead at 50 mm): one flat colour | none until the model exists | no |
| clinical-suite / s3_suite_printer | `printer-column` (1.6 x 1.6 x 4 m, 4 m ahead at 50 mm) fills the frame | none until the model exists | no |
| final-arcology / s3_atrium_inside | the `panel` proxy (6 x 0.4 x 10 m, the cracked panel) fills the frame, 9 m ahead | none (the panel is the subject) | no |
| the-march, all scenes | `road` (top at z 0.1) stands 0.1 m proud of the plain, so props placed at z 0 on it (barricade, banner-1, banner-2, cart-2) sit 0.1 m inside it (`prop_off_floor`, `prop_overlap`) | `/blockout/<id=road>/location` `[0, 0, -0.05]` | no (invisible) |
| the-march / s3_station_attack, s3_station_after | `kiosk` (2.4 x 2 x 2.6 m) fills much of the frame, 5 to 6 m ahead | none | no |
| final-arcology | `vent` overlaps `vent-bank` (3/27 points): the vent stands in the bank by design | none | no |
| the-march | the plinth is a 30 m grey box; the four towers of the reference are not in the build (`sky` is hidden at render time, so the sky is the world colour) | none | no |
| `docs/BLENDER.md` | still says 126 build files, 304 scenes and "No scene has been run in Blender yet" | update the numbers | no |

Checks after the overrides: no camera inside a piece, nothing between camera and target except the false positive above and
`s3_overrun_after`, no prop inside a piece. The driver now treats a closed cylinder of role `wall` (the hub's drum and outer wall) as
a hollow shell, since the first look pass reported every prop "inside" them.

## Phase B: the rig per location (overview against the reference image)

Only the driver's rig changes (see `tools/render/rig.json`); scene stills use the scene's own camera and lens, the overview has
its own driver camera and uses the lighting of one named scene. EV is the colour-management exposure (AgX); the overview's EV is
the location EV plus that scene's offset plus the overview EV. Tint is a per-channel gain; glass alpha draws the blockout material
`glass` translucent. Values are by eye against the references (not measured).

| Location | Overview lighting | EV | Per-scene EV offsets | Overview EV | Tint (r, g, b) | Glass alpha | Overview camera (eye to look_at, mm) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| central-hub | s3_hub_gallery | 0 | hub_door -0.5, hub_core +0.5, reset_heart +0.8, first_word_core +0.8, green_core -0.3 | -1.3 | 0.9, 1.0, 1.05 | 0.12 | [-7, -20, 1.8] to [2, -8, 3], 20 |
| clinical-suite | s3_clinical_suite | -1.2 | suite_printer +0.4; amber light gain 0.45 in s3_clinical_suite | -0.9 | 0.88, 1.0, 1.1 | 0.25 | [-14, -4, 1.5] to [10, 6, 2], 22 |
| final-arcology | s3_arcology_plinth | -2.0 | arcology_plinth +0.8 | 0 | 0.9, 1.0, 1.02 | 0.25 | [16, -26, 1.7] to [-8, 0, 8], 18 |
| snakehead-overrun | s3_overrun_hall | +0.5 | overrun_after +1, snakehead_resin +0.5 | -0.2 | 0.9, 1.0, 1.02 | 0.3 | [0, -17, 1.7] to [0, 10, 2.5], 24 |
| the-march | s3_march_camp | -1.0 | march_eve +1, march_front +0.3, perimeter_breach -0.3 | 0 | 0.9, 1.0, 1.05 | 0.25 | [-10, -2, 1.8] to [112, 0, 10], 24 |

Deltas between each overview and its reference (the references are detailed photographic renders; a box set cannot match their
texture, so these are layout, colour and light deltas):

- central-hub: the reference shows the lit machine inside the glass drum, with a workbench, a lamp and a switchboard. The build has
  the glass drum (drawn 12 % opaque) but no machinery inside it: the two `air-handler` boxes stand 6 m in from the middle and the glass
  reads as a grey veil. The cool grey light matches; the amber lamp, the rails and the grating do not (the grate floor is a flat disc).
- clinical-suite: the reference is a dark concrete floor with amber-lit chairs, a lit booth and a skyline through the window. The build
  is a clean box room: the floor and ceiling take the amber light and read as peach, the window is a translucent wall onto the world
  colour (no city), and the chairs are small boxes. Layout (chairs along the window, booth at the far end) matches.
- final-arcology: the reference looks at the glass wall from outside, with the lit atrium behind it, the vent bank to the right and
  the shanties. The build has all of them, but the vent bank is a 40 m slab across the plinth, so the overview reads as grey slabs; the
  atrium behind the glass is mostly out of view.
- snakehead-overrun: the reference is a corridor with painted walls opening on a cavern with cots and lanterns. The overview stands at
  the corridor mouth (y -17), so the corridor walls are out of frame; the hall, the breach stair and the four cots show. The painted walls,
  the rock ceiling and the breach light are not in the build (the breach is a hidden `sky` piece).
- the-march: the reference shows the road to a walled arcology with four towers, a camp of tents and a water tower. The build has the
  road, the plinth (a grey box), the gate and the glass; the tents and handcarts are too small to read at 120 m. No towers, and the
  water tower (x -100) is behind the camera.

## Phase C: models

`games/dr-tox-finale/assets/models.json` does not exist, so no real model was swapped; every prop is a named box proxy by prop id,
sized from `assets.json` (30 object types). The driver's `--models` path has still not been run.

## Phase D and gaps

Stills: every scene at its tier (20 hero at 2560x1440 / 256 samples, 4 standard at 1920x1080 / 128 samples: s3_reset_heart,
s3_first_word_core, s3_green_core, s3_peace_plain) plus the player-start eye-height still of the 19 scenes that have one, and one
overview per location (1920x1080, 128 samples): 48 stills. Contact sheets: `renders/dr-tox-finale/<location>.jpg`. Ledger:
`ledger.json`. Not produced: the depth and object-index passes. No frame holds a person or creature; the tall thin proxies
(`shielded-locker`, `hardlight-emitter`, `iv-stand`) are plain named boxes, not figures.

## Models re-render (2026-11-22)

Every built model of `games/dr-tox-finale/assets/models.json` (the ComfyUI session's ledger in the other working copy, re-read at the start and at the end
of the run, status `built` only; read only, never copied into this repo) replaces its box proxy, and all 24 scenes and 5 overviews
were rendered again with the earlier rig, overrides, flags and fixes unchanged (Phases A and B are not redone). The ledger grew during the run:
`march-handcart` (built 2026-11-22) and `blade-crate` (built a few hours later) were added by re-rendering the-march only (all 8 scenes for the handcart, then the
5 scenes with the crate); the sheets and ledger here are the merged result. The models were lite copies (12k triangles, 512 px JPEG textures) made only
because the render box's upload link is slow; the originals stay out of the repo.

- **Proxy to model**: 30 object types, 174 of 180 prop instances. Object types: air-handler, balance-scale, banner-pole, batch-bench, blade-crate, calibration-booth, cistern-tank, copier-cart, core-lamp, drum-lectern, duct-hatch, floodlight-mast, folding-cot, gallery-rail, hardlight-emitter, hub-door, icon-lightbox, iv-stand, march-handcart, printer-column, rite-jar-rack, shanty-shelter, shield-barricade, shielded-locker, switchboard-console, treatment-chair, vial-rack, water-kiosk, water-tower, work-lamp. Changed this run versus the box pass: all of them (the earlier sheets had no models).
- **Still a named box proxy**: `atrium-glass-panel` (prop panel): proportions: a side is off by x3.6 after the best fit; `exhaust-vent` (prop vent): model skipped: model not built (ComfyUI out of memory); named box proxy stays. `exhaust-vent` has no ledger entry (ComfyUI ran out of memory); `atrium-glass-panel` is a 6 x 0.4 x 10 m slab whose model is a framed panel on a stand, so the fit rejects it (a proposed `size_m` change to the model's proportions would let it fit).
- **Front direction (-y)**: every model was viewed from -y and from 50 degrees beside it on a montage before the run: none shows a person, creature or figure-like shape. The driver keeps each model's own orientation unless it fits worse than a factor of 3 and then tries the six axis permutations; the ledger's `objects[].fit.fit_rotation_deg` records the turn (the ComfyUI ledger itself says "front direction not checked by eye").
- **Fit**: uniform scale; worst side ratio between model and `size_m` box over 1.8: duct-hatch x2.06, floodlight-mast x2.31, gallery-rail x2.75, icon-lightbox x2.38, iv-stand x2.0, switchboard-console x1.84. None was stretched; the author may want `size_m` corrected to the models' proportions.
- **Proportion problems the ComfyUI ledger records** (largest requested side matched, uniform scale): air-handler: proportions differ from size_m (axis ratios 0.62, 0.90, 1.00); scaled uniformly so its largest requested side matches; atrium-glass-panel: proportions differ from size_m (axis ratios 0.73, 0.13, 1.00); scaled uniformly so its largest requested side matches; balance-scale: proportions differ from size_m (axis ratios 1.00, 0.65, 1.16); scaled uniformly so its largest requested side matches; banner-pole: proportions differ from size_m (axis ratios 1.29, 0.68, 1.00); scaled uniformly so its largest requested side matches; blade-crate: proportions differ from size_m (axis ratios 1.00, 0.71, 0.73); scaled uniformly so its largest requested side matches; calibration-booth: proportions differ from size_m (axis ratios 1.18, 1.49, 1.00); scaled uniformly so its largest requested side matches; copier-cart: rotated 90 deg about Z so its long side matches size_m, proportions differ from size_m (axis ratios 1.00, 1.18, 1.52); scaled uniformly so its largest requested side matches; core-lamp: proportions differ from size_m (axis ratios 0.78, 1.09, 1.00); scaled uniformly so its largest requested side matches; duct-hatch: rotated 90 deg about Z so its long side matches size_m, proportions differ from size_m (axis ratios 1.00, 0.80, 1.64); scaled uniformly so its largest requested side matches; floodlight-mast: proportions differ from size_m (axis ratios 0.43, 0.60, 1.00); scaled uniformly so its largest requested side matches; folding-cot: rotated 90 deg about Z so its long side matches size_m, proportions differ from size_m (axis ratios 0.99, 1.00, 0.71); scaled uniformly so its largest requested side matches; gallery-rail: rotated 90 deg about Z so its long side matches size_m, proportions differ from size_m (axis ratios 1.00, 0.15, 0.33); scaled uniformly so its largest requested side matches; hardlight-emitter: proportions differ from size_m (axis ratios 1.38, 1.44, 1.00); scaled uniformly so its largest requested side matches; hub-door: rotated 90 deg about Z so its long side matches size_m, proportions differ from size_m (axis ratios 0.91, 0.66, 1.00); scaled uniformly so its largest requested side matches; icon-lightbox: proportions differ from size_m (axis ratios 0.73, 0.42, 1.00); scaled uniformly so its largest requested side matches; iv-stand: proportions differ from size_m (axis ratios 0.52, 0.50, 1.00); scaled uniformly so its largest requested side matches; march-handcart: rotated 90 deg about Z so its long side matches size_m; shield-barricade: proportions differ from size_m (axis ratios 1.00, 0.71, 0.80); scaled uniformly so its largest requested side matches; switchboard-console: proportions differ from size_m (axis ratios 1.00, 0.37, 0.42); scaled uniformly so its largest requested side matches; treatment-chair: rotated 90 deg about Z so its long side matches size_m, proportions differ from size_m (axis ratios 0.64, 1.00, 0.56); scaled uniformly so its largest requested side matches; vial-rack: proportions differ from size_m (axis ratios 1.01, 0.73, 1.00); scaled uniformly so its largest requested side matches; water-kiosk: proportions differ from size_m (axis ratios 1.38, 1.12, 1.00); scaled uniformly so its largest requested side matches; water-tower: proportions differ from size_m (axis ratios 0.61, 0.66, 1.00); scaled uniformly so its largest requested side matches; work-lamp: proportions differ from size_m (axis ratios 1.27, 0.66, 1.00); scaled uniformly so its largest requested side matches.
- **Tone**: the models change a frame's mean brightness, so `exposure_ev` offsets of 10 scenes (and `overview_ev` of central-hub) in `tools/render/rig.json` were re-matched to the box pass's mean luminance (damped, from quick look passes at 0.4 scale, 25 % samples). No light, world, camera or lens changed.
- **Camera inside a model**: none (`camera_inside_prop` empty everywhere). Informational `prop_overlap` entries remain in the ledger (a model's box against a blockout piece). The earlier findings (s3_overrun_after, central-hub's floating balance and lamp, the-march road) stand; with models the balance and lamp are drawn on nothing, as before.
- **Proposed diffs**: none new from the models.
- `flagged-before-after.jpg` was redone with the models ("before" = build file as it is, 0.4 scale, 25 % samples; "after" = final still).
- GPU time on the rented RTX 4090 (measured from the box's run log): 976 s (0.27 h): fi_2 68 s, fi_3 67 s, fi_final 594 s, fi_bf 4 s, fi_hc (the-march with the handcart model) 148 s, fi_cr (the-march with the crate model) 95 s.

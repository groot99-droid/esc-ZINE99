# Render driver (box-proxy stills of the Blender build files)

Small, documented tooling for the render and refinement plan (`docs/BLENDER_PLAN.md`). It never edits a build file,
`assets.json`, a design or data file: it builds each scene exactly as the build file says and only the rig and the
recorded render-time overrides differ.

| File | What it does |
| --- | --- |
| `pack.py` | `python tools/render/pack.py <slug> <out dir>`: runs `tools/blender/compile.py`, resolves every prop (object id, `size_m`, role) from `assets.json`, takes each scene's tier from `docs/blender_plans/plans.json` (hero 2560x1440 at 256 samples, otherwise 1920x1080 at 128), and writes `pack.tgz` |
| `render_scenes.py` | Runs inside Blender (`blender -b --factory-startup --python tools/render/render_scenes.py -- --pack <pack> --out <dir>`). Builds the blockout with the repo's own `tools/blender/blockout.py`, each prop as a named box proxy (or the real model, see below), the scene's own lights, world, camera and lens; renders with Cycles (OptiX) and OpenImageDenoise; checks the geometry; writes `<scene>.json` per scene |
| `rig.json` | The driver's rig per location: exposure (EV), world and light gain, optional fog, fill lights, proxy colours, the overview camera and which scene's lighting the overview uses |
| `overrides.json` | Render-time overrides (a blockout piece replaced, a prop's rotation, a camera nudge, a player-start nudge), each written up as a proposed diff in `renders/<game>/REFINEMENT_NOTES.md` |
| `flags.json` | What was done about each first-pass flagged scene (feeds the ledger) |
| `finish.py` | `python tools/render/finish.py <slug> <run dir>`: contact sheets (`renders/<slug>/<location>.jpg`) and `ledger.json` |

## Conventions the driver applies (and nothing else)

- Light `size` is the area-light side (AREA) or twice the radius (POINT, SPOT); spot cone 70 degrees, blend 0.5 (rig default, the
  build files do not say); `energy` is Blender watts (SUN: strength).
- `player_start.facing_deg` is read as a compass bearing (0 faces +y, 90 faces +x), which is what most build files' cameras
  agree with. The eye-height "player" still is taken from the scene camera's own height.
- A blockout piece with role `sky` is hidden at render time (a lid at sky height would block the sun and the world).
- Boxes are sized `size_m` scaled so the height equals the prop's target height; a ground prop's lowest point sits at its
  `location` z.
- `proxy_alpha` (rig) draws a proxy translucent where smaller props are placed inside its volume (the bench rig holds the vial
  and syringe).
- Models: pass `--models <models.json>`; an entry per object id (`{"models": [{"object": id, "glb": path}]}`, a list, or a
  map id -> path) swaps the proxy for the glb, scaled to the prop's height and placed at its location and rotation. No
  dr-tox-rise ledger exists yet, so nothing was swapped and the swap path has not been run.
- Added for dr-tox-fall: `piece_alpha` (rig, per location) draws a blockout material translucent by material name (haze, glass,
  frosted glass), because the build files' glass and haze pieces are opaque boxes; and an override `player_start` (merged over the
  build file's, used for the eye-height still). `--only` does not accept a `*` through `run.sh` (the shell expands it): list scenes.
  `rig.json` also takes `overview_ev` (extra exposure for the overview only, used where its lighting scene needs a different EV).
  No dr-tox-fall model ledger exists, so nothing was swapped.
- Geometry checks per scene: camera inside a piece, a piece between camera and look_at, a prop whose centre is inside a piece
  (`prop_inside`) or that overlaps one (`prop_overlap`, informational), a ground prop off its floor.
- Not produced: the depth and object-index passes of the plan.

- Added for batch 3 (dr-tox-finale, dr-tox-altrulan): a closed cylinder of role `wall` is a hollow shell for the geometry checks (the
  hub's drum and outer wall); the output folder per location is created even with `--stills overview`; `--no-overrides 1` renders
  the build file as it is (the "before" pass); an override may replace a piece by an empty list (the piece is omitted in that scene).
  `finish.py` draws a "no reference image yet" card with the location's lighting line when `assets/locations/<id>.jpg` does not exist
  (dr-tox-altrulan) and reads a downsized `.jpg` still when the `.png` was not fetched (the render box's link was slow: the stills
  kept locally under `build/` are 1600 px wide jpg copies; the full-size PNGs stay on the render box). The owner sheet is one per
  game (`--owner`); batch 3's single sheet joins the two.
  `rig.json` entries for the nine locations: `grade_gain` (per-channel gain), `piece_alpha` glass, per-scene `exposure_ev` and
  `light_gains`, `overview_ev`. No model ledger exists for either game, so nothing was swapped.

- Added for batch 4 (wrymwretch, behind-the-peephole): `finish.py --before <run dir>` writes `flagged-before-after.jpg` from a quick
  `--no-overrides 1` pass of the flagged scenes (`--only` list) next to the final stills. `rig.json` entries for the 21 locations: per-scene
  `exposure_ev` (set from quick renders by mean brightness, then by eye), `overview_ev`, the overview camera and, for starlit-priory,
  `piece_alpha` of the material `door-light`. `overrides.json` takes a scene-level `blockout_replace` that REPLACES the location-level
  one for that scene (the driver merges shallowly), so a scene entry repeats the location's pieces it still needs. Beyond the first pass's
  flags it needed no driver change: the star-dome, doors-frame, door-opening and platform-underside fixes are blockout replacements, the
  camera fixes are `camera` overrides (`location` or `look_at`). No model ledger exists for either game, so nothing was swapped.
  Run each remote job on its own: `run.sh` reads one shared `args.txt`/`run.txt`, so two jobs started together clobber each other.

- Added for batch 5 (man-eater): overrides take `hide_props` (prop ids left out of the scene) and `prop_alpha` ({prop id: opacity}, a proxy
  drawn translucent where the player's camera rides inside it); the `props` override already patched a prop (location, `size_m`). The
  checks gain `camera_inside_prop` (the camera inside a prop's bounding box). `rig.json` takes `neutral_names` (`by_id`, `by_object`: the
  Blender object and the ledger `name` of a proxy whose id or object reads as a figure; the id and object stay in the ledger) and
  `reference_card` (a location whose reference image is replaced by a text card on its sheet; `finish.py` draws it). Man Eater has no
  figure imagery, so both are used there. No model ledger exists for man-eater, so nothing was swapped.

- Added for batch 6 (stuffed-ones, missing-campsites): **the first batch with real models** (phase C ran for the first time).
  `--models <json>` takes `{"models": [{"object": id, "glb": path[, "skip": reason]}]}`; `skip` keeps the box proxy and records the
  reason (used for a model that shows a creature). A model is imported once per scene and copied for further props that use it,
  then **fitted to the prop's box** (`fit_model`): it keeps its own orientation unless that fits worse than a factor of 3
  (thin sides: 9), in which case the six axis permutations are tried; the scale is uniform (the height ratio for an upright prop, i.e. box height at least 0.8 of its largest side, when the footprint then stays within x3 of the box; otherwise the geometric mean over the box's
  non-thin sides) and the fit is rejected (the box proxy stays) when a side is still off by more than that. Each prop's
  `fit` record (model dims, box dims, rotation, scale, worst side ratio, or the rejection) goes in the per-scene json and in
  the ledger (`props[].fit`, and a per-object summary under `objects`). The checks look through a model's root empty to its meshes.
  Rig and override keys may be namespaced `<game>/<location>` (and `<game>/<location>/<scene>`): both games have a `creek-trail`.
  Rig keys `facing` (`compass`, the default, or `ccw`: facing_deg is a rotation about Z, so 90 faces -x; the cameras of both
  games agree with `ccw`: 33 of 41 and 23 of 24 scenes, against 23 and 10 for compass) and `min_eye_m` (lowest eye height of the
  player-start still; 0.2 for the toy-floor scenes). A location-level `props` or `prop_alpha` override for a prop the scene hides
  is skipped (it used to raise). `reference_card` now also covers a reference that shows a creature drawn as a pictogram.
  Models used here are lite copies (about 12k triangles, 512 px JPEG textures) of the ComfyUI session's glbs, made only because the
  render box's upload link ran at about 50 KB/s; the originals are never copied into the repo.

- Added for batch 7 (lira-calyx, heartstream): no driver change. `rig.json` and `overrides.json` hold the 28 locations (namespaced `<game>/<location>`):
  `facing: "ccw"` for both games, per-scene `exposure_ev` from a look pass (capped at -3.5 and +3.5), `overview_ev`, the overview camera, and for
  lira-calyx/spore-weaver-valley a `reference_card` (the reference shows small standing figures). Overrides: three `camera` nudges, `props` patches
  (a location-level patch for a prop a scene hides is skipped, as before) for props found inside a blockout piece. The models were lite copies again
  (12k triangles, 512 px); the oar of heartstream is the one model the fit rejects (its glb is slanted at 45 degrees). The remote render box went offline
  once mid-session; the packs and models stayed on its disk, so a run only had to be started again. Run the look passes with `--stills overview --only
  <loc>/<scene>,...` (about 20 s for 14 locations) to set the overview cameras.

- Added for batch 8 (people-of-the-bark, endless-temple): **scene scale.** A set whose pieces span under 2 m (the nine bark-world locations are built in
  millimetres: `bounds_m` 0.12 x 0.1 x 0.12, props 0.004 to 0.03 m) is scaled up as a whole by `K` (default 1000, rig key `scene_scale`) just before it is
  built: blockout pieces, props, lights, cameras and the overview; light power goes by `K` squared for AREA, POINT and SPOT (a SUN is unchanged), so area
  light radiance and a point light's irradiance at the scaled distance stay the same and the image is what the build file gives at that scale. Without it
  the 0.05 m clip plane, Cycles' ray offsets and the checks' absolute tolerances (0.15, 0.05) are wrong at 12 cm. Overrides stay in the build file's own
  units (they are applied before the scaling); a per-scene json records `scene_scale`. The first pass rendered these sets unscaled (black cut-outs from
  the clip plane in highridge), so its mm-scale flags are not trustworthy. Models are scaled with the set, so fit ratios are the build file's.
  The first-pass flags of lowridge's tap were not reproduced at scale. A blockout piece of role `opening` is an opaque box: where it fills a wall gap
  that lights shine through (clerk-office loft-slats and rain-window), the override replaces it by an empty list (an open gap). `rig.json` and
  `overrides.json` hold the 25 locations (namespaced `<game>/<location>`), `facing: "ccw"` for both games, per-scene `exposure_ev` from look passes
  (capped at -5.5 and +3.5), `overview_ev`, the overview camera, and `reference_card` for highridge (face-like knots) and walled-yard (a painted figure).
  No model ledger entry is built for endless-temple, so nothing was swapped there; bark used lite copies (12k triangles, 512 px) of 15 built models.

- Added for batch 9 (lord-of-the-sea): rig key `show_sky` (list of blockout piece ids of role `sky` that stay visible; the driver otherwise hides every `sky`
  piece): used in boat-deck (far headland and beach), company-lane (the fleet on the horizon) and home-reach-beach (anchored boat, islands, open sea, glass lane).
  `rig.json` and `overrides.json` hold the 13 locations (namespaced `lord-of-the-sea/<location>`), `facing: "ccw"`, per-scene `exposure_ev`, `overview_ev`
  (matched to the reference's mean tone), the overview camera, `reference_card` for spice-mouth and salt-steps (figure-like carved stones) and `neutral_names`
  for the Gullwife boat. Overrides: one camera nudge, lamplit-strait's landing, stairs and camera moved out of the solid headland, replacements for chandlery's solid
  shelves and spice-mouth's solid pavilion posts. Models: 2 ledger entries built (lite copies, 12k triangles, 512 px): the chart table is fitted, the oar rejected by the fit.

- Added for batch 10 (dr-tox-altrulan re-render, first batch with the reference images beside the overviews and all of a game's models): rig key
  `model_fit` (`{object: "height"}`: the model is scaled by the prop's height only and never rejected, for the 18 m glass-mountains mast whose model
  has a head 4.9 times wider than its box; the fit record says `fit_mode: height only`). Overview-only rig keys, applied after the scene's own stills so
  only the overview changes: `overview_world` (`color`, or `horizon` + `zenith` with `z_range` for a sky gradient, `strength`, optional `fog`
  `{density, anisotropy}`), `overview_fills` (extra lights like `fills`, build-file units; not scaled by `scene_scale`), `overview_light_gain` and
  `overview_light_gains` (the scene's own lights, scaled), `overview_piece_alpha` (`{material: opacity}`), `overview_hide_pieces` (blockout piece ids
  left out, a cutaway), `overview_grade_gain` (replaces `grade_gain` for the overview). `finish.py --refs <repo root>` reads the location reference
  images from another checkout (read only; they are never copied into this branch). A prop override `rotation_deg` (scene level) turns a model whose
  front faces away from its scene camera (the shrine lectern). Models were lite copies again (12k triangles, 512 px JPEG, made with
  `lite.py`-style decimation in Blender, uploaded as one tar). The overview camera is still a rig item.

- Added for batch 11 (dr-tox-rise, dr-tox-fall, dr-tox-finale models re-render): no driver change. All 21 + 21 + 24 scenes were rendered again with the
  models of each game's ledger (lite copies, 12k triangles, 512 px, as before); `rig.json` per-scene `exposure_ev` and `overview_ev` were re-matched to the box
  pass's mean luminance (a script comparing the box run with the model run, damped log2 of the luminance ratio). A model that shows a figure-like shape
  (fall's `shroud-stand`) is skipped in the models json and stays a named box proxy. Where a model appears in the ledger during the run, only the locations that use
  it are rendered again (`--only`), merged into the run folder, and `finish.py` is run on the merged folder (the-march of dr-tox-finale, twice). `finish.py --before`
  now also runs for dr-tox-rise. The owner sheet for the batch is the three games' `--owner` sheets stacked (18 locations).

- Added for batch 12 (wrymwretch, behind-the-peephole, man-eater models re-render): no driver change. All 36 + 26 + 38 scenes were rendered again with every built model of
  each game's ledger; skipped as figure-like or creature-like: wrymwretch's `wyrm-rib`; man-eater's `uniform`, `laced-boots`, `sleeping-bag`, which keep the
  neutral-named box proxies. The model copies were first 12k triangles / 512 px, which shattered the thin door and the boiler (face-split decimation), so the final
  run uses the full 80k-triangle models with 1024 px JPEG textures (copies in Blender, uploaded in three tars; the link drops large uploads, retry). `rig.json`
  per-scene `exposure_ev` and `overview_ev` were re-matched to a box-proxy look pass of the same rig (damped log2 of the mean/median luminance ratio, changed only
  where the two differ by more than 10 %). The owner sheet joins the three games (36 locations). Fix round: the first pass of this batch had read the ledgers stale and left 8 built peephole models (brass-rose, card-table, chute-hatch, logbook, noticeboard, reception-desk, safe, staff-door) and man-eater's wood-stove as box proxies; the models json is now built from the ledger in the same read that decides each proxy, and the affected scenes were rendered again (all 26 peephole scenes, man-eater's rec-room) with `exposure_ev` re-matched for lobby/end_sitter and the office scenes. `ledger.json` `models.named_box_proxy` states each proxy's reason from the ledger status.

## Remote run

Used on a rented RTX 4090: upload `render_scenes.py` and `pack.tgz`, run Blender 5.2.1 as above with `--device OPTIX`, fetch the
tar of the output folder. `--res-scale` and `--samples-scale` give quick look-development passes.

- Added for batch 13 (stuffed-ones, missing-campsites, lira-calyx models re-render): no driver change. All 41 + 24 + 24 scenes were rendered again with every built model of each
  game's ledger (full 80k-triangle models re-exported with 1024 px JPEG textures; uploaded one file at a time because the box link drops large transfers). Skipped as
  figure or creature imagery (stay named box proxies): stuffed-ones `sampler` (stitched figures and animals), missing-campsites `heron-sign` (a heron on the board),
  lira-calyx `specimen-shelf` (skulls, spine, antlers). `overrides.json` gains 14 scene overrides `stuffed-ones/cabin-living-room/<scene>` with `hide_props: [shelf-north-b]`
  (the camera stands inside the real shelf model; its triangles shatter around the lens). `rig.json` per-scene `exposure_ev` and `overview_ev` re-matched to a box-proxy
  look pass (damped log2 of the luminance ratio, as in batch 12). Remote runs need a launch that checks the remote log exists (the box refused connections now and then, and
  a background job that never started looked like a hang) and a download that retries.

- Added for batch 14 (heartstream, people-of-the-bark, endless-temple, lord-of-the-sea models re-render): no driver change. All 20 + 23 + 44 + 28 scenes and their 14 + 10 + 15 + 13
  overviews were rendered again with every built model of each game's ledger (full 80k-triangle models, 1024 px JPEG textures, made in Blender and uploaded one file at a time).
  Skipped as creature or figure-like imagery (named box proxies): endless-temple `lizard-plate`, lord-of-the-sea `tea-board`; nothing was skipped in heartstream or
  people-of-the-bark. Fits the driver rejects (box proxy stays): heartstream `oar`; bark `balance-rope`, `edge-stake`, `falling-leaf`, `washing-line`; temple `quill-pen`;
  sea `gallery-mirror`, `oar`. `rig.json` changed only in a few per-scene `exposure_ev` and `overview_ev` values, re-matched to a box-proxy look pass as in batch 12. The
  four games' overviews were joined on one owner sheet (52 locations) with `owner.py`-style stacking of `finish.py`'s tiles.

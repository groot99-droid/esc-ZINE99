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

## Remote run

Used on a rented RTX 4090: upload `render_scenes.py` and `pack.tgz`, run Blender 5.2.1 as above with `--device OPTIX`, fetch the
tar of the output folder. `--res-scale` and `--samples-scale` give quick look-development passes.

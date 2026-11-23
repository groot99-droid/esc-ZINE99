# dr-tox-rise: renders with models (box-proxy first pass, then models re-render), refinement batch 1

21 scenes in 8 locations, rendered with the build files as they are (box proxies, each scene's own lights, world, camera and
lens) plus the driver's rig. Contact sheets, one per location: `<location>.jpg` (the overview beside its reference image, then
each scene's still, 1280 px wide). Full-size stills stay under `build/renders/dr-tox-rise/` (not committed).

- Tiers: all 21 scenes are hero in `docs/blender_plans/plans.json`: 2560x1440, 256 samples. Overviews 1920x1080, 128 samples.
  Also rendered: the player-start eye-height still of the 18 scenes that have one.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX view transform.
- Models: re-rendered 2026-11-22 with every model built in `games/dr-tox-rise/assets/models.json` (239 of 245 prop instances; the rest are named box proxies: broadcast-screen). See "Models re-render" in `REFINEMENT_NOTES.md`; the ledger's `objects` says model or proxy per object, with the fit.
- Flagged scenes: 3 (s3_hospital_2217, s3_injection_first, s3_river_night), each fixed at render time and written up as a
  proposed build-file diff. Nothing in `games/` was edited.
- `REFINEMENT_NOTES.md`: proposed diffs, other findings, the rig per location and the deltas to the reference images.
- `ledger.json`: per scene, the tier, resolution, samples, stills, prop sources, first-pass flags, geometry checks, overrides.
- Tooling: `tools/render/` (README there). To redo: `python tools/render/pack.py dr-tox-rise <dir>`, run
  `tools/render/render_scenes.py` in Blender 5.2, then `python tools/render/finish.py dr-tox-rise <output dir>`.
- `flagged-before-after.jpg`: the flagged scenes before (build file as it is) and after the render-time fix, with the models. Checks run: `python tools/check_blender.py dr-tox-rise`, `python tools/validate.py dr-tox-rise`, `python tools/check_assets.py dr-tox-rise`.

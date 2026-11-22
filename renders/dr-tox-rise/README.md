# dr-tox-rise: box-proxy renders, refinement batch 1

21 scenes in 8 locations, rendered with the build files as they are (box proxies, each scene's own lights, world, camera and
lens) plus the driver's rig. Contact sheets, one per location: `<location>.jpg` (the overview beside its reference image, then
each scene's still, 1280 px wide). Full-size stills stay under `build/renders/dr-tox-rise/` (not committed).

- Tiers: all 21 scenes are hero in `docs/blender_plans/plans.json`: 2560x1440, 256 samples. Overviews 1920x1080, 128 samples.
  Also rendered: the player-start eye-height still of the 18 scenes that have one.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX view transform.
- Models: none exist for this game yet; every prop is a named box proxy.
- Flagged scenes: 3 (s3_hospital_2217, s3_injection_first, s3_river_night), each fixed at render time and written up as a
  proposed build-file diff. Nothing in `games/` was edited.
- `REFINEMENT_NOTES.md`: proposed diffs, other findings, the rig per location and the deltas to the reference images.
- `ledger.json`: per scene, the tier, resolution, samples, stills, prop sources, first-pass flags, geometry checks, overrides.
- Tooling: `tools/render/` (README there). To redo: `python tools/render/pack.py dr-tox-rise <dir>`, run
  `tools/render/render_scenes.py` in Blender 5.2, then `python tools/render/finish.py dr-tox-rise <output dir>`.

# dr-tox-fall: renders with models (box-proxy first pass, then models re-render), refinement batch 2

21 scenes in 5 locations, rendered with the build files as they are (box proxies, each scene's own lights, world, camera and
lens) plus the driver's rig. Contact sheets, one per location: `<location>.jpg` (the overview beside its reference image, then
each scene's still, 1280 px wide). `flagged-before-after.jpg` shows the 5 flagged scenes before and after their render-time
fix (before at 0.4 scale, 32 samples; after at full size). Full-size stills stay under `build/renders/dr-tox-fall/` (not committed).

- Tiers: all 21 scenes are hero in `docs/blender_plans/plans.json`: 2560x1440, 256 samples. Overviews 1920x1080, 128 samples.
  Also rendered: the player-start eye-height still of every scene (21). 47 stills in all.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX view transform. Final run 546 s.
- Models: re-rendered 2026-11-22 with every model built in `games/dr-tox-fall/assets/models.json` (232 of 238 prop instances; the rest are named box proxies: shroud-stand). See "Models re-render" in `REFINEMENT_NOTES.md`; the ledger's `objects` says model or proxy per object, with the fit.
- Flagged scenes: 5 (s3_settlement_day, s3_fortress_following, s3_gala_balcony, s3_gala_leash, s3_gala_bond), each fixed at render
  time and written up as a proposed build-file diff. Nothing in `games/` was edited. After the overrides every geometry check is clean.
- `REFINEMENT_NOTES.md`: proposed diffs, other findings, the rig per location and the deltas to the reference images.
- `ledger.json`: per scene, the tier, resolution, samples, stills, prop sources, first-pass flags, geometry checks, overrides.
- Tooling: `tools/render/` (README there). To redo: `python tools/render/pack.py dr-tox-fall <dir>`, run
  `tools/render/render_scenes.py` in Blender 5.2, then `python tools/render/finish.py dr-tox-fall <output dir>`.
- No people or creatures in any frame; no prop is figure-like (`shroud-stand` is a 0.8 x 0.6 x 1.9 m box, drawn as a box).
- `flagged-before-after.jpg`: the flagged scenes before (build file as it is) and after the render-time fix, with the models. Checks run: `python tools/check_blender.py dr-tox-fall`, `python tools/validate.py dr-tox-fall`, `python tools/check_assets.py dr-tox-fall`.

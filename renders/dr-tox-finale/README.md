# dr-tox-finale: renders with models (box-proxy first pass, then models re-render), refinement batch 3

24 scenes in 5 locations, rendered with the build files as they are (box proxies, each scene's own lights, world, camera and
lens) plus the driver's rig. Contact sheets, one per location: `<location>.jpg` (the overview beside its reference image, then
each scene's still, 640 px tiles, 1280 px wide). `flagged-before-after.jpg` shows the flagged scene before (0.4 scale, 32 samples)
and after its render-time fix (full size). Full-size stills stay out of the repo (`build/renders/dr-tox-finale/`, not committed).

- Tiers: 20 scenes hero in `docs/blender_plans/plans.json` (2560x1440, 256 samples), 4 standard (1920x1080, 128 samples).
  Overviews 1920x1080, 128 samples. Also rendered: the player-start eye-height still of the 19 scenes that have one. 48 stills.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX view transform. Final box-proxy run 607 s (measured); the models run took 594 s plus two partial re-renders of the-march.
- Models: re-rendered 2026-11-22 with every model built in `games/dr-tox-finale/assets/models.json` (174 of 180 prop instances; the rest are named box proxies: atrium-glass-panel, exhaust-vent). See "Models re-render" in `REFINEMENT_NOTES.md`; the ledger's `objects` says model or proxy per object, with the fit.
- Flagged scenes: 1 from the first pass (s3_overrun_hall), fixed at render time and written up as a proposed build-file diff. The
  driver found two more things to propose (s3_overrun_after, central-hub's floating balance and lamp) and two false positives.
  Nothing in `games/` was edited.
- `REFINEMENT_NOTES.md`: proposed diffs, other findings, the rig per location and the deltas to the reference images.
- `ledger.json`: per scene, the tier, resolution, samples, stills, prop sources, first-pass flags, geometry checks, overrides.
- Tooling: `tools/render/` (README there). To redo: `python tools/render/pack.py dr-tox-finale <dir>`, run
  `tools/render/render_scenes.py` in Blender 5.2, then `python tools/render/finish.py dr-tox-finale <output dir>`.
- No people or creatures in any frame; no prop is figure-like.
- `flagged-before-after.jpg`: the flagged scenes before (build file as it is) and after the render-time fix, with the models. Checks run: `python tools/check_blender.py dr-tox-finale`, `python tools/validate.py dr-tox-finale`, `python tools/check_assets.py dr-tox-finale`.

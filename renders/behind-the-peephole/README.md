# behind-the-peephole: renders with models (box-proxy first pass, then models re-render), refinement batch 4

26 scenes in 7 locations (the first pass rendered all of them at 1920x1080 / 128 samples; 2 were flagged). Rendered with the build files as
they are (box proxies, each scene's own lights, world, camera and lens) plus the driver's rig (`tools/render/rig.json`) and 2 render-time
overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per location:
`<location>.jpg` (the overview beside its reference painting, then each scene's still; 640 px tiles, 1280 px wide; the office sheet has 18
scenes). `flagged-before-after.jpg` shows the 2 fixed scenes before and after. Full-size stills stay out of the repo.

- Tiers: all 26 scenes are hero (2560x1440, 256 samples). Overviews 1920x1080, 128. Also the eye-height player-start still of every scene:
  59 stills.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX. Final run 720 s (measured on the render box). The
  stills kept locally (outside the repo) are 1600 px wide jpg copies; the full-size PNGs were deleted from the render box afterwards to free space (re-render with tools/render/pack.py and render_scenes.py to regenerate).
- Reference images: 7 location paintings in `games/behind-the-peephole/assets/locations/`.
- Models: re-rendered 2026-11-23 with every model built in `games/behind-the-peephole/assets/models.json` (all 26 built object types, 248 of 296 prop instances; the rest are the 4 failed ones, named box proxies, listed in `ledger.json` `models`). See "Models re-render" in `REFINEMENT_NOTES.md`; the ledger's `objects` says model or proxy per object, with the fit. The earlier box-proxy stills are replaced by the model stills (rig, overrides and fixes unchanged; exposure re-matched).
- Flagged: the two stairwell scenes (`look_at` inside a step block), fixed at render time with a proposed diff; the driver also reports one
  false positive (`end_wrong_picture`). Nothing in `games/` was edited.
- No people or figures in any frame.
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources (all `box-proxy`), geometry checks, overrides and flag status.

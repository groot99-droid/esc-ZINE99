# wrymwretch: renders with models (box-proxy first pass, then models re-render), refinement batch 4

36 scenes in 14 locations (the first pass rendered all of them at 1920x1080 / 128 samples; 5 were flagged). Rendered with the build files as
they are (box proxies, each scene's own lights, world, camera and lens) plus the driver's rig (`tools/render/rig.json`) and 9 render-time
overrides (`tools/render/overrides.json`, each written up as a proposed diff in `REFINEMENT_NOTES.md`). Contact sheets, one per location:
`<location>.jpg` (the overview beside its reference painting, then each scene's still; 640 px tiles, 1280 px wide).
`flagged-before-after.jpg` shows 8 of the 9 fixed scenes (chasm_seal1 looks unchanged; the fix is disclosed in the notes) before and after. Full-size stills stay out of the repo.

- Tiers: 24 hero scenes (2560x1440, 256 samples), 12 standard (1920x1080, 128). Overviews 1920x1080, 128. Also the eye-height player-start still
  of the 29 scenes that have a start: 79 stills.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX. Final run 686 s plus 78 s for a re-render of the
  starlit-priory location (measured on the render box). The stills kept locally (outside the repo) are 1600 px wide jpg copies; the full-size PNGs
  were deleted from the render box afterwards to free space (re-render with tools/render/pack.py and render_scenes.py to regenerate).
- Reference images: 14 location paintings in `games/wrymwretch/assets/locations/`. The overviews match layout, key colour and light direction
  only (see Phase B in the notes).
- Models: re-rendered 2026-11-23 with every model built in `games/wrymwretch/assets/models.json` (11 object types, 121 of 275 prop instances; the rest are named box proxies: figure-like or unbuilt ones, listed in `ledger.json` `models`). See "Models re-render" in `REFINEMENT_NOTES.md`; the ledger's `objects` says model or proxy per object, with the fit. The earlier box-proxy stills are replaced by the model stills (rig, overrides and fixes unchanged; exposure re-matched).
- Flagged: 5 from the first pass plus 4 found by the driver or by looking; 8 fixed at render time with a proposed diff each, the others
  proposed only. Nothing in `games/` was edited.
- No people or creatures in any frame; `king-statue`, `queen-statue`, `wyrm-skull` and `wyrm-rib` are plain boxes.
- `ledger.json`: per scene tier, resolution, samples, stills with render seconds, prop sources (all `box-proxy`), geometry checks, overrides and
  flag status; per location the overview camera and rig.

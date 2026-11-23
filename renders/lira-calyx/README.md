# lira-calyx: renders, refinement batch 7

24 scenes in 14 locations (24 hero). Rendered with the build files as they are (each scene's own lights, world, camera and lens),
real models for 23 of 30 object types (127 of 165 prop instances; models re-render of 2026-11-23, every model built at that time) and named box proxies for the rest, plus the driver's rig (`tools/render/rig.json`) and
render-time overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per
location: `<location>.jpg` (the overview beside its reference image, then each scene's still; 640 px tiles, 1280 px wide).
`flagged-before-after.jpg` shows the scenes the driver fixed, before and after. Full-size stills stay out of the repo.

- Tiers: 24 hero (2560x1440, 256 samples; the scene camera and the player-start eye-height still), 0 standard (1920x1080, 128). Overviews 1920x1080, 128. 76 stills in the ledger.
- Renderer: Cycles on OptiX (a rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX. Final run 1690 s (28.2 min; same) measured on the render box (render time inside Blender). The stills kept locally are 1600 px wide jpg copies.
- Reference images: 14 location images in `games/lira-calyx/assets/locations/` (the spore-weaver-valley image shows small figures, so its sheet carries a text card).
- Models: re-rendered 2026-11-23 with every built model of `games/lira-calyx/assets/models.json` (ComfyUI session ledger, read only; full 80k-triangle models with 1024 px JPEG textures on the render box, nothing copied into the repo): 23 object types as models, the rest named box proxies, with the reason per object in `ledger.json` `models` and in "Models re-render" of `REFINEMENT_NOTES.md`. Skipped as figure or creature imagery: `specimen-shelf`. Exposure re-matched to the box pass; rig, overrides and flags otherwise unchanged.
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources and fit records, geometry checks, overrides and flag status; per object a summary.

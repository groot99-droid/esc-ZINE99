# endless-temple: renders, refinement batch 8

44 scenes in 15 locations (39 hero). Rendered with the build files as they are (each scene's own lights, world, camera and lens),
real models for 23 of 30 object types (270 of 309 prop instances; models re-render of 2026-11-23, every model built at that time), plus the driver's rig (`tools/render/rig.json`) and
render-time overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per
location: `<location>.jpg` (the overview beside its reference image, then each scene's still; 640 px tiles, 1280 px wide).
`flagged-before-after.jpg` shows the flagged scenes the driver fixed, before and after. Full-size stills stay out of the repo.

- Tiers: 39 hero (2560x1440, 256 samples; the scene camera and the player-start eye-height still), 5 standard (1920x1080, 128). Overviews 1920x1080, 128. 113 stills in the ledger.
- Renderer: Cycles on OptiX (a rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX. Final run 1116 s (18.6 min) measured on the render box (render time inside Blender). The stills kept locally are 1600 px wide jpg copies.
- Reference images: 15 location images in `games/endless-temple/assets/locations/` (the walled-yard image shows a painted figure, so its sheet carries a text card).
- Models: re-rendered 2026-11-23 with every built model of `games/endless-temple/assets/models.json` (ComfyUI session ledger, read only; full 80k-triangle models with 1024 px JPEG textures on the render box, nothing copied into the repo): 23 object types as models, the rest named box proxies, with the reason per object in `ledger.json` `models` and in "Models re-render" of `REFINEMENT_NOTES.md`. Skipped as creature imagery: lizard-plate. Exposure re-matched to the box pass; rig, overrides and flags otherwise unchanged.
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources and fit records, geometry checks, overrides and flag status; per object a summary.

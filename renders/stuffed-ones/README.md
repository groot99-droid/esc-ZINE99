# stuffed-ones: renders, refinement batch 6

41 scenes in 11 locations (31 hero). Rendered with the build files as they are (each scene's own lights, world, camera and lens),
real models for 25 of 27 object types (358 of 398 prop instances; models re-render of 2026-11-23, every model built at that time) and named box proxies for the rest, plus the driver's rig (`tools/render/rig.json`) and
render-time overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per
location: `<location>.jpg` (the overview beside its reference image, then each scene's still; 640 px tiles, 1280 px wide).
`flagged-before-after.jpg` shows the scenes the driver fixed, before and after. Full-size stills stay out of the repo.

- Tiers: 31 hero (2560x1440, 256 samples; the scene camera and the player-start eye-height still), 10 standard (1920x1080, 128). Overviews 1920x1080, 128. 104 stills in the ledger.
- Renderer: Cycles on OptiX (a rented RTX 4090 shared with other jobs), OpenImageDenoise, Blender 5.2.1, AgX. Final run 2209 s (36.8 min; the three games ran together on a box with load average 15 to 32) measured on the render box. The stills kept locally are 1600 px wide jpg copies.
- Reference images: 11 location images in `games/stuffed-ones/assets/locations/`; none shows a figure.
- Models: re-rendered 2026-11-23 with every built model of `games/stuffed-ones/assets/models.json` (ComfyUI session ledger, read only; full 80k-triangle models with 1024 px JPEG textures on the render box, nothing copied into the repo): 25 object types as models, the rest named box proxies, with the reason per object in `ledger.json` `models` and in "Models re-render" of `REFINEMENT_NOTES.md`. Skipped as figure or creature imagery: `sampler`. Exposure re-matched to the box pass; rig, overrides and flags otherwise unchanged except 14 cabin-living-room scenes where the shelf `shelf-north-b` around the camera is hidden at render time.
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources and fit records, geometry checks, overrides and flag status; per object a summary.

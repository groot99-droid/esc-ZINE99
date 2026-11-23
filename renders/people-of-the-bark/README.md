# people-of-the-bark: renders, refinement batch 8

23 scenes in 10 locations (18 hero). Rendered with the build files as they are (each scene's own lights, world, camera and lens),
real models for 22 of 29 object types (470 of 528 prop instances; models re-render of 2026-11-23, every model built at that time) and named box proxies for the rest, plus the driver's rig (`tools/render/rig.json`) and
render-time overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per
location: `<location>.jpg` (the overview beside its reference image, then each scene's still; 640 px tiles, 1280 px wide).
`flagged-before-after.jpg` shows the flagged scenes the driver fixed, before and after. Full-size stills stay out of the repo.

- Tiers: 18 hero (2560x1440, 256 samples; the scene camera and the player-start eye-height still), 5 standard (1920x1080, 128). Overviews 1920x1080, 128. 65 stills in the ledger.
- Renderer: Cycles on OptiX (a rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX. Final run 728 s (12.1 min) measured on the render box (render time inside Blender). The stills kept locally are 1600 px wide jpg copies.
- Reference images: 10 location images in `games/people-of-the-bark/assets/locations/` (the highridge image shows face-like knots, so its sheet carries a text card).
- Models: re-rendered 2026-11-23 with every built model of `games/people-of-the-bark/assets/models.json` (ComfyUI session ledger, read only; full 80k-triangle models with 1024 px JPEG textures on the render box, nothing copied into the repo): 22 object types as models, the rest named box proxies, with the reason per object in `ledger.json` `models` and in "Models re-render" of `REFINEMENT_NOTES.md`. No model was skipped as figure-like. Exposure re-matched to the box pass; rig, overrides and flags otherwise unchanged.
- The bark world is built in millimetres; the driver scales a set under 2 m across by 1000 at render time (light power by 1000 squared), so the image is the same as the build file would give at that scale. See `REFINEMENT_NOTES.md`, owner decision 1.
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources and fit records, geometry checks, overrides and flag status; per object a summary.

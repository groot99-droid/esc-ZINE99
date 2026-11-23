# missing-campsites: renders, refinement batch 6

24 scenes in 13 locations (24 hero). Rendered with the build files as they are (each scene's own lights, world, camera and lens),
real models for 26 of 30 object types (308 of 333 prop instances; models re-render of 2026-11-23, every model built at that time) and named box proxies for the rest, plus the driver's rig (`tools/render/rig.json`) and
render-time overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per
location: `<location>.jpg` (the overview beside its reference image, then each scene's still; 640 px tiles, 1280 px wide).
`flagged-before-after.jpg` shows the scenes the driver fixed, before and after. Full-size stills stay out of the repo.

- Tiers: 24 hero (2560x1440, 256 samples; the scene camera and the player-start eye-height still), 0 standard (1920x1080, 128). Overviews 1920x1080, 128. 74 stills in the ledger.
- Renderer: Cycles on OptiX (a rented RTX 4090 shared with other jobs), OpenImageDenoise, Blender 5.2.1, AgX. Final run 1639 s (27.3 min; same) measured on the render box. The stills kept locally are 1600 px wide jpg copies.
- Reference images: 13 location images in `games/missing-campsites/assets/locations/`; three (entrance-booth, gravel-clearing, other-entrance) show a heron on a sign and are replaced by a text card on their sheets.
- Models: re-rendered 2026-11-23 with every built model of `games/missing-campsites/assets/models.json` (ComfyUI session ledger, read only; full 80k-triangle models with 1024 px JPEG textures on the render box, nothing copied into the repo): 26 object types as models, the rest named box proxies, with the reason per object in `ledger.json` `models` and in "Models re-render" of `REFINEMENT_NOTES.md`. Skipped as figure or creature imagery: `heron-sign`. Exposure re-matched to the box pass; rig, overrides and flags otherwise unchanged.
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources and fit records, geometry checks, overrides and flag status; per object a summary.

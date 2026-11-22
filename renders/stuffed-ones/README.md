# stuffed-ones: renders, refinement batch 6

41 scenes in 11 locations (31 hero). Rendered with the build files as they are (each scene's own lights, world, camera and lens),
real models for 25 of 27 object types and named box proxies for the rest, plus the driver's rig (`tools/render/rig.json`) and
render-time overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per
location: `<location>.jpg` (the overview beside its reference image, then each scene's still; 640 px tiles, 1280 px wide).
`flagged-before-after.jpg` shows the scenes the driver fixed, before and after. Full-size stills stay out of the repo.

- Tiers: 31 hero (2560x1440, 256 samples; the scene camera and the player-start eye-height still), 10 standard (1920x1080, 128). Overviews 1920x1080, 128. 93 stills in the ledger.
- Renderer: Cycles on OptiX (a rented RTX 4090 shared with other jobs), OpenImageDenoise, Blender 5.2.1, AgX. Final run 1407 s (23.5 min; the box was shared with other jobs, load average 25 to 40) measured on the render box. The stills kept locally are 1600 px wide jpg copies.
- Reference images: 11 location images in `games/stuffed-ones/assets/locations/`; none shows a figure.
- Models: ComfyUI ledger on branch comfy-models-3d; see `REFINEMENT_NOTES.md` phase C for each object (model or box proxy and why).
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources and fit records, geometry checks, overrides and flag status; per object a summary.

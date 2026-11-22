# lord-of-the-sea: renders, refinement batch 9

28 scenes in 13 locations (26 hero). Rendered with the build files as they are (each scene's own lights, world, camera and lens), real models for 1 of 28 object types (the chart table; the oar glb is built but the fit rejects it) and named box proxies for the rest, plus the driver's rig (`tools/render/rig.json`) and
render-time overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per
location: `<location>.jpg` (the overview beside its reference image, then each scene's still; 640 px tiles, 1280 px wide).
`flagged-before-after.jpg` shows the flagged scenes the driver fixed, before and after. Full-size stills stay out of the repo.

- Tiers: 26 hero (2560x1440, 256 samples; the scene camera and the player-start eye-height still), 2 standard (1920x1080, 128). Overviews 1920x1080, 128. 80 stills in the ledger.
- Renderer: Cycles on OptiX (a rented RTX 4090, shared with another job), OpenImageDenoise, Blender 5.2.1, AgX. Final run 634 s (10.6 min) measured on the render box (render time inside Blender). The stills kept locally are 1600 px wide jpg copies.
- Reference images: 13 location images; the spice-mouth and salt-steps images show figure-like carved stones, so their sheets carry a text card.
- Driver change: rig key `show_sky` (see `tools/render/README.md`, batch 9).
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources and fit records, geometry checks, overrides and flag status; per object a summary.

# man-eater: renders with models (box-proxy first pass, then models re-render), refinement batch 5

38 scenes in 15 locations (the first pass rendered all of them at 1920x1080 / 128 samples; none was flagged). Rendered with the build files
as they are (box proxies, each scene's own lights, world, camera and lens) plus the driver's rig (`tools/render/rig.json`) and render-time
overrides (`tools/render/overrides.json`, written up as proposed diffs in `REFINEMENT_NOTES.md`). Contact sheets, one per location:
`<location>.jpg` (the overview beside its reference image, then each scene's still; 640 px tiles, 1280 px wide). `flagged-before-after.jpg`
shows the scenes the driver fixed, before and after. Full-size stills stay out of the repo.

- Tiers: all 38 scenes are hero (2560x1440, 256 samples). Overviews 1920x1080, 128. Also the eye-height player-start still of every scene:
  91 stills in all.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX. Final run 1225 s measured on the render box
  (1477 s with the look-development passes). The stills kept locally are 1600 px wide jpg copies.
- Reference images: 15 location images in `games/man-eater/assets/locations/`; the-pens' is replaced by a text card on its sheet (it reads
  as a figure).
- Models: re-rendered 2026-11-23 with every model built in `games/man-eater/assets/models.json` (24 object types, 280 of 320 prop instances; the rest are named box proxies: the 3 figure-like built ones (uniform, laced-boots, sleeping-bag) and the 3 failed ones, listed in `ledger.json` `models`). See "Models re-render" in `REFINEMENT_NOTES.md`; the ledger's `objects` says model or proxy per object, with the fit. The earlier box-proxy stills are replaced by the model stills (rig, overrides and fixes unchanged; exposure re-matched).
- Man Eater rule: no figure imagery and no figure-like proxy; props whose names read as figures are plain boxes with plain names (see the notes).
- Found by the driver: a camera inside its truck's proxy in c1_truck_gate, e_transfer_truck and n3_glovebox, a look_at inside the glovebox,
  and a buried truck inside a barracks; fixed at render time with proposed diffs. Nothing in `games/` was edited.
- `ledger.json`: per scene tier, resolution, samples, stills, prop sources (all `box-proxy`, with the plain name where one was used),
  geometry checks, overrides and flag status.

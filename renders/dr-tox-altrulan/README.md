# dr-tox-altrulan: renders, refinement batch 3 (box proxies) and its re-render with the reference images and models (batch 10)

19 scenes in 4 locations. Rendered with the build files as they are (each scene's own lights, world, camera and lens) plus the driver's
rig. Contact sheets, one per location: `<location>.jpg` (the overview beside its reference image, or a text card where the reference
shows a carved or painted figure, then each scene's still, 640 px tiles, 1280 px wide). `flagged-before-after.jpg` shows s3_end_kept and
s3_mountains_foot before (0.4 scale, 25% of the samples) and after. Full-size stills stay out of the repo (`build/renders/dr-tox-altrulan/`).

- References: the four location images (and thirty object images) are on the image branch, not in this one; the overviews were matched to
  them by the driver's rig only (tone within 0.03 per channel of the reference mean). light-bringers-shrine (a statue with a halo and a
  fresco of figures) and snakehead-holy-site (figure reliefs) show a text card instead of the picture. `python tools/check_assets.py
  dr-tox-altrulan` still fails (34 problems: the images are not in this branch), as before.
- Models: 26 of the 30 ledger entries are built and are used (lite copies: 12k triangles, 512 px); `fungus-lamp`, `spring-basin` and
  `toad-jar` failed to build and `halo-relief` shows a figure, so those four stay named box proxies. Per prop, which it is: `ledger.json`
  (`props[].source`, `objects`, `models`).
- Tiers: 17 scenes hero (2560x1440, 256 samples), 2 standard (1920x1080, 128 samples: s3_end_kept, s3_end_stamp). Overviews 1920x1080,
  128 samples. Also the player-start eye-height still of the 15 scenes that have one: 38 stills.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX. Final run 457 s, re-render of two scenes 43 s,
  before pass 6 s, six overview look passes 163 s (all measured on the box): 669 s of Blender in all.
- Flagged: none in the first pass. s3_end_kept (camera above a closed outer wall) and s3_shrine_book (the lectern rotated 200 degrees
  turns its back to the camera once the real model is used) were fixed at render time; s3_mountains_foot is a false positive.
  Nothing in `games/` was edited; every build-file change is a proposed diff in `REFINEMENT_NOTES.md`.
- `REFINEMENT_NOTES.md` (earlier notes kept, batch 10 appended), `ledger.json` and the tooling (`tools/render/`, see its README).
- No people or creatures in any frame; no prop is figure-like (`halo-relief` is a plain slab).

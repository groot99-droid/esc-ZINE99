# dr-tox-altrulan: box-proxy renders, refinement batch 3 (sibling game)

19 scenes in 4 locations (they were not in the first pass), rendered with the build files as they are (box proxies, each scene's own
lights, world, camera and lens) plus the driver's rig. Contact sheets, one per location: `<location>.jpg` (the overview beside a
"no reference image yet" card, then each scene's still, 640 px tiles, 1280 px wide). `flagged-before-after.jpg` shows the one fixed
scene before (0.4 scale, 32 samples) and after (full size). Full-size stills stay out of the repo (`build/renders/dr-tox-altrulan/`).

- No reference image exists: `games/dr-tox-altrulan/assets/locations/` is empty (assets.json holds prompts only), so the overviews were
  matched to the written lighting, not to a picture. `python tools/check_assets.py dr-tox-altrulan` fails on the missing images (34
  problems: location and object images), as it did before this batch.
- Tiers: 17 scenes hero (2560x1440, 256 samples), 2 standard (1920x1080, 128 samples). Overviews 1920x1080, 128 samples. Also rendered:
  the player-start eye-height still of the 15 scenes that have one. 38 stills.
- Renderer: Cycles on OptiX (one rented RTX 4090), OpenImageDenoise, Blender 5.2.1, AgX. Final run 439 s (measured).
- Models: `games/dr-tox-altrulan/assets/models.json` does not exist; every prop is a named box proxy.
- Flagged: none in the first pass; the driver found s3_end_kept (camera above a closed outer wall, fixed at render time) and one
  false positive. Nothing in `games/` was edited.
- `REFINEMENT_NOTES.md`, `ledger.json` and the tooling (`tools/render/`) as for dr-tox-finale.
- No people or creatures in any frame; no prop is figure-like (`halo-relief` is a plain slab).

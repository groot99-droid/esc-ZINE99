# Blender: render and refinement plan for every 3D scene

Written 2026-11-21 by the esc-ZINE99 session. Machine-readable plan: `docs/blender_plans/plans.json` (one entry per scene, 389 in all:
what to render, at what settings, and what to refine, in that scene's own terms). This file is the human version.

## Where things stand

- **First pass is done** (`renders/vast-first-pass`, `renders/README.md`): 370 scenes rendered on a rented RTX 3090, Cycles/OptiX,
  1920x1080, 128 samples, 543 stills, 0 render errors. Every prop was a **box proxy** (no Meshy or ComfyUI models), and the lighting
  and world were the driver's own simple rig. So the first pass shows layout, scale and camera framing only.
- **Dr. Tox: Altrulan** (19 scenes) has build files but was not in the first pass.
- 65 scenes were flagged by the first pass (a blockout piece between camera and target, a camera or prop inside a blockout piece,
  or a framing problem seen on a sheet). They are listed in each scene's `flagged_in_first_pass`.
- 3D models: a ComfyUI session is building image-to-3D models from `docs/model_requests.json` (389 images ready). Its ledger per game
  will be `games/<slug>/assets/models.json`. Not all will exist when you start; swap in what exists.

## Rules for every scene

1. **Never edit** a build file, `assets.json`, a design or data file. Problems go into a notes file (below) as a proposed diff for the author.
2. Use each scene's own lights, world, camera and lens exactly as the build file gives them. Add a fill light only if the still is crushed, and record it.
3. Content: no people or creatures in renders; no gore; the Dr. Tox arena empty. **Man Eater: no figure imagery at all, and no figure-like proxy.**
4. Models are placeholders until built. Prop proxies stay boxes sized from `size_m`, named by prop id.
5. Output stays under `build/` (never committed). Commit only contact sheets (`renders/<game>/<location>.jpg`), the notes file and the ledger.

## The render plan (per scene, tiers)

| Tier | Which scenes | Resolution | Samples | Stills per scene |
| --- | --- | --- | --- | --- |
| Hero | scenes the player is IN (first-person or third-person camera) or that carry interactions | 2560x1440 | 256 + OpenImageDenoise | scene camera; player-start eye-height still |
| Standard | fixed or side-on cameras and ending scenes | 1920x1080 | 128 + OpenImageDenoise | scene camera |
| Overview | one per location | 1920x1080 | 128 | wide still from a corner of the set at about 1.7 m, looking at the centre; compare with the reference image |

Passes for hero scenes: combined, depth (Z), object index (for later compositing and for checking what is in frame). File names
`build/renders/<game>/<location>/<scene>/<still>.png`. Estimate: about 9.2 GPU hours on one RTX 3090 for everything (hero 90 s, standard 40 s).

## The refinement plan (four phases, in this order)

**A. Fix the flagged scenes (65).** For each: find the cause named in `flagged_in_first_pass` (camera inside a wall, wall between camera and
target, prop inside a blockout piece, framing). Do not edit the build file: write the smallest proposed change as a JSON-patch-style
diff in `renders/<game>/REFINEMENT_NOTES.md` (scene id, what is wrong, proposed numbers), rerender with the change applied
to the driver's copy only, and show before/after. The author applies accepted diffs.

**B. Match the reference.** For each location, set the overview still beside `assets/locations/<id>.jpg`; note layout, key colours and
light direction deltas. Adjust only the driver's rig and report. Known case: dr-tox-rise / hospital-room / s3_hospital_2217: the 85 mm camera
frames only the bench while the reference shows the observation glass beside the bed; the build file puts the glass behind the camera.

**C. Swap in models** as the ComfyUI ledger fills. For every prop whose object id has a built `.glb` in `games/<slug>/assets/models.json`:
import it at the build-file location, rotation and `size_m`, keep the proxy otherwise. Rerender the scenes that changed. WrymWretch:
16 of its objects already have Meshy models on the author's machine (`studio/vault/wrymwretch/3d/props.md`); use those first.

**D. Final stills.** Render every scene at its tier with the final rig; contact sheet per location, commit sheets and notes.

## Order

Dr. Tox Rise, Fall, Finale, Altrulan first (they are the new work and have the freshest assets), then WrymWretch, Man Eater, Behind the Peephole,
Stuffed Ones, Missing Campsites, Lira Calyx, Heartstream, People of the Bark, Endless Temple, Lord of the Sea.

| Game | Locations | Scenes | Flagged | Hero | Estimate (1 GPU) |
| --- | --- | --- | --- | --- | --- |
| dr-tox-rise | 8 | 21 | 3 | 21 | 32 min |
| dr-tox-fall | 5 | 21 | 5 | 21 | 32 min |
| dr-tox-finale | 5 | 24 | 1 | 20 | 33 min |
| dr-tox-altrulan | 4 | 19 | 0 | 17 | 27 min |
| wrymwretch | 14 | 36 | 5 | 24 | 44 min |
| man-eater | 15 | 38 | 0 | 38 | 57 min |
| behind-the-peephole | 7 | 26 | 2 | 26 | 39 min |
| stuffed-ones | 11 | 41 | 21 | 31 | 53 min |
| missing-campsites | 13 | 24 | 10 | 24 | 36 min |
| lira-calyx | 14 | 24 | 3 | 24 | 36 min |
| heartstream | 14 | 20 | 1 | 20 | 30 min |
| people-of-the-bark | 10 | 23 | 10 | 18 | 30 min |
| endless-temple | 15 | 44 | 1 | 39 | 62 min |
| lord-of-the-sea | 13 | 28 | 3 | 26 | 40 min |

## Acceptance (per scene)

- Still exists at its tier and is framed on the scene's `note` (what happens there, from the design).
- No prop floating, no prop inside a blockout piece, no camera inside geometry.
- Flagged problems are fixed in the driver's copy or written up as a proposed diff.
- Every prop is a model or a named box proxy, and the notes say which.

## Report back (per game)

Scenes rendered, flagged fixed or proposed, models swapped, GPU hours, problems; branch and commit; contact sheets under
`renders/<game>/`. Anything needing the author goes first.

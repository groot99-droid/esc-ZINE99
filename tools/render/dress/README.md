# Dressing layer (P0 of the realism programme)

A render-side layer that adds surfaces, scatter, grime, kits and camera-only skies to the box-proxy scenes at render time. It never
edits a build file, `assets.json`, a design or a data file. Each scene keeps its own lights, world (non-camera branch), camera and
lens; gate G1 proves it by hash. This is phase P0: foundations, measuring, a four-place pilot. Phases P1 to P7 are not built.

## Pieces

| File | What it does |
| --- | --- |
| `dress.py` | `apply()` (one call per scene from `render_scenes.py`), `view_record()`, `after_overview()` |
| `materials.py` | Tone-locked PBR families: `scan`, `noise`, `grid`, `wallpaper`, `metal`, `tissue`, `foliage`, `dirt-only` |
| `scatter.py`, `placement.py` | Seeded scatter (pebbles, rubble, nodules, twigs, grass); `placement.py` is pure Python |
| `kits.py` | Baseboard, ceiling joists, ceiling grid, conduit (bodies only, no emitters) |
| `grime.py` | Discrete stain decals (large-area grime is in the materials) |
| `atmos.py` | Camera-ray-only sky plate, procedural or a locked hdri (`hdri`, `rotation_deg`, `mix`) divided by its own mean colour and multiplied by the flat world colour. Dust, shafts, fog, rain are P2 and not built |
| `idpass.py` | Object-ID pass: second flat-emission render, id mask png + legend in the scene json |
| `intent.py` | Intent hash (lights, world flat branch, camera, lens) read back from Blender |
| `measure.py` | Gates G1 to G17 (`describe`, `compare`, hygiene scan, G8 control) |
| `calibrate.py` | Noise-floor run and calibrated thresholds; G8 positive control |
| `batch_describe.py`, `finalize_run.py`, `run_remote.sh`, `run_post.sh` | Run a game on a render box, describe, shrink |
| `sheet.py` | Owner sheet (before above after, 720 px wide) |
| `make_lock.py`, `add_assets.py`, `dress.lock.json` | Licence lock: 69 Poly Haven CC0 textures (46 reused cave scans, 23 approved on 2026-11-23), 6 sky hdris, 5 models; md5s, mean albedo and roughness. `add_assets.py` merges folders already on disk, no network |
| `g17.py` | Gate G17: two runs of the same inputs compared |
| `rules.json`, `rules.py` | Arena = materials only; Man Eater: no decals, stain-band filter; banned words |
| `<game>.dress.json` | Per game, per location config (pilot: four places) |
| `overrides.json` | Per scene exclusions (layer off, seed salt); empty in P0 |
| `tests/` | `python -W ignore tools/render/dress/tests/test_dress.py` (no Blender needed) |

## Driver flags (render_scenes.py)

`--no-dress 1` the before pass (ids, intent hash, stats, fixed Cycles seed; nothing dressed). `--dress <dir>` the dressed pass
(`<dir>` holds `dress.lock.json`, `rules.json`, `<game>.dress.json`; textures come from `$DRESS_CACHE` or `<dir>/../cache/textures`).
`--dress-layers surfaces,scatter,decals,kits,atmos` a subset. `--seed-offset N` another Cycles seed (noise floor). `--denoise-passes
albedo_normal|albedo|none` the OIDN guide passes. `--ids 1` ids without dressing. Per scene the driver writes `<scene>.json` with
`ids`, `stats` (triangles, texture bytes), per still `intent_hash`, `vram_peak_mib`, `seconds`, and for a dressed scene `dress` (layers,
textures with md5, `manifest_hash`, `layout_id`, piece geometry).

## Config (`<game>.dress.json`)

`locations.<id>`: `grime` {strength, ao, dust, damp, damp_height_m}; `materials.<blockout material>` {family, scan, res, tile_m,
chroma, bump, macro, grime}; `pieces.<piece id>` (a copy of the material for that piece); `scatter` [{kind, on:{materials|roles|pieces},
density per 100 m2, max_dist_m, surface}]; `kits`; `decals`; `atmos.sky_plate`. Sizes are metres; scenes built in millimetres
(`scene_scale`) multiply them by K. Seeds are SHA-1 of `game/location/layer/item`; no clock, sorted iteration.

## Changes from the plan (and why)

* Object-ID pass is a second flat-emission render (about 0.6 s per still), not Cycles' object-index pass: no compositor, same on every build.
* The cave scan folder holds 46 scans (148 files, 171.7 MB, every md5 equal to the cave lock), not 48.
* OIDN already received albedo and normal guide passes by default in Blender 5.2.1; the driver now sets it explicitly (see the P0 note for the measured effect).
* Box projection has no tangents, so scan normal maps are not used; detail comes in as a bump from the diffuse map.
* Emissive surfaces (heartstream cave walls) keep their emission, modulated by the detail ratio, instead of being excluded: they are the whole wall.
* G14 seams are the luma step across joins between coplanar pieces of the same material, in excess of the before step.
* Cycles seed is now fixed per scene in every pass of the new flags (it was the default 0 before).

## Not built in P0

Dust motes, light shafts, fog, rain, snow, water shaders (P2); tree and vegetation kits (P3); rock and ice (P4); per-game specials (P5);
procedural prop kits beyond four basic ones (P6); sound. Door-pair material consistency (G14) needs more than one location.

## P0 results and what changed during the run

* Noise floor (two renders, different Cycles seeds, 5 scenes, 15 stills, `calibrate.py noise`): tone changes by at most 0.13 %, frame dE 0.006, region dE 0.02, detail energy 0.92 to 1.04, seconds up to 2.4 times (small stills). Only G11 is raised (0.03 to 0.083, noise max 0.055). `thresholds.calibrated.json` holds the result.
* G8: the first detector scored 0.59 on average on undressed flat boxes (shading edges, tiny regions), so it could not tell dressing from no dressing. It now skips lags inside three correlation lengths, skips tile grids, wallpaper, glass and kept materials, and passes a region whose peak is no higher than the same region before dressing plus 0.05. The positive control (an undressed 4 by 4 tiling of a scan) scores 0.999 to 1.002 on 7 scans, so the detector is accepted. Large floors score 0.02 to 0.22; the periodic hits left are tissue dividers, oblique walls and forest edges (see the owner note).
* Stain decals are out of the object-ID mask (soft blobs on quads read as opaque squares and hid a prop that touches the wall); decals also keep 3D clear of prop boxes now.
* Exposure re-match (`exposure_ev_delta` per scene in a location config, at most 0.5 EV, recorded in the scene json, never in `rig.json`) is built and was tried on the cabin. It fixed G2 on two scenes but made G11 (hero props against before) 14 to 25 % worse, so it is off (empty) in the pilot: the tone has to be fixed in the material, not in the exposure.
* Tissue family: domain-warped cells at two scales instead of one regular cell size (fewer visible spots).
* OIDN check (one dressed cabin scene, half resolution; reference = 6 times the samples, no denoise): albedo and normal guide passes keep 102 % of the reference's band energy on dressed regions and correlate 0.995 with it (guide albedo only 0.994, none 0.981 and twice the pixel error). The driver default (albedo and normal) stays.
* G17: the same pilot rendered twice gives equal manifest hashes and intent hashes on 64 of 64 stills, mean luma within 4e-7, and the same id masks pixel for pixel; beauty pixels differ by at most 2 codes on 0.03 % of pixels (GPU float order), so byte identity is not reached on the card.
* Approved downloads (34 Poly Haven assets) are in the lock and credited; the pilot uses `plastered_wall_04` or `concrete_wall_008`, `forrest_ground_01`, `gravel_floor`, `rocky_trail` and the `kloofendal_overcast` hdri. The 5 glTF models and the other hdris are locked but no layer uses them yet (P2/P3).
* Box note: the container's start script sets a 10 hour stop timer on every start, in addition to the owner's 31 hour one; it would end the window about 10 hours after the restart.

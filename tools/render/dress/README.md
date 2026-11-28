# Dressing layer (P0 and refinement pass R1 of the realism programme)

A render-side layer that adds surfaces, scatter, grime, kits and camera-only skies to the box-proxy scenes at render time. It never
edits a build file, `assets.json`, a design or a data file. Each scene keeps its own lights, world (non-camera branch), camera and
lens; gate G1 proves it by hash. This is phase P0: foundations, measuring, a four-place pilot. Phases P1 to P7 are not built.

## Pieces

| File | What it does |
| --- | --- |
| `dress.py` | `apply()` (one call per scene from `render_scenes.py`), `view_record()`, `after_overview()` |
| `materials.py` | Tone-locked PBR families: `scan`, `noise`, `grid`, `wallpaper`, `metal`, `tissue`, `foliage`, `dirt-only`; R1 adds `membrane` and `water` and the wear options (see R1 below) |
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
| `propmodels.py`, `modelplace.py`, `propgates.py` | New-models pass: the `props` layer (whole models replacing blockout boxes, placement maths in pure Python) and its gates |
| `gains.py` | R1: per-material albedo gain and tint from a before run and a dressed run (`--apply` writes them into the configs) |
| `make_lock.py`, `add_assets.py`, `dress.lock.json` | Licence lock: 69 Poly Haven CC0 textures (46 reused cave scans, 23 approved on 2026-11-23), 6 sky hdris, 5 models; md5s, mean albedo and roughness. `add_assets.py` merges folders already on disk, no network |
| `g17.py` | Gate G17: two runs of the same inputs compared |
| `rules.json`, `rules.py` | Arena = materials only; Man Eater: no decals, stain-band filter; banned words |
| `<game>.dress.json` | Per game, per location config (pilot: four places by hand; P1 entries for the other 144 written by `p1.py`) |
| `p1.py` | P1 generator: classifies every blockout material of every location into a surface preset and writes the location entries |
| `overrides.json` | Per scene exclusions (layer off, seed salt); empty in P0 |
| `tests/` | `python -W ignore tools/render/dress/tests/test_dress.py` and `tests/test_props.py` (no Blender needed) |

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

## R1 refinement pass (2026-11-23)

The owner was not satisfied with P0. R1 keeps the P0 layer and adds, all opt-in per config entry (old configs render as before):

| Option (config) | Where | What |
| --- | --- | --- |
| `third` | scan, grid `detail_scan` | a third stochastic sample (other scale and offset, its own mask) |
| `obj_jitter_m` | scan, foliage, membrane | per-object random texture offset (Object Info > Random): pieces of one material never share a tile phase |
| `macro2` | scan | a second, very large brightness field |
| `courses` {h_m, seam_m, jitter, hue, seam_tone, vary} | scan | board or log courses: per-course grain offset, value and hue jitter, dark seams; `vary` warps course heights (two incommensurate sines, still monotonic) so courses are not one fixed pitch |
| `patches` {size_m, share, amount, rough} | any | touch-up paint patches (Voronoi cells with a slight tone and roughness change) |
| `scuffs` {height_m, amount, tint} | any | horizontal scuff streaks that fade out above `height_m` |
| `edge_wear` {radius_m, amount, tint, rough, break_scale} | any | worn or chipped edges from a bevel-normal mask, broken up by noise |
| `round_m` | any | the bevel normal under the bump: box edges catch light like rounded ones |
| `coat`, `coat_roughness` | any | clear coat (floor wax, wet film) |
| `sss`, `sss_radius`, `sss_scale_m` | any | subsurface |
| `tint`, `gain` | any | per-material colour and albedo correction (written by `gains.py`) |
| `rough_scale` | any | roughness multiplier |
| `displace_m`, `displace_mid`, `subdiv` | membrane | true displacement; dress.py adds a SIMPLE subdivision (box corners kept) to those pieces; `displace_mid` 0 = outward only, so joints between pieces never open |
| `tile_jitter`, `joint_rough`, `detail_scan` | grid | per-tile value spread, rougher joints, a scan's wear detail over the tiles |
| `trunks` {spacing_m, dark, width} | foliage | a forest block seen from the road: warped dark vertical gaps between stems (mean tone kept) |
| `seam_m`, `yellow` | wallpaper | strip seams, yellowing toward the ceiling |
| family `membrane` | marrow | layered procedural: per-piece phase, vertical stretch, domain warp, two vein scales (zero-crossing lines of warped noise, not a cell network), fibres, ridges, absolute wet-to-matte roughness; `overlay` adds a locked generated image as a luminance detail layer |
| family `water` | puddles | dark absorbing base, IOR 1.33, low roughness, ripple bump; emission kept |
| scatter kind `model` | loop road | the locked CC0 glTF models: one variant per top-level node (a file of loose parts is one variant), decimated to `max_tris`, shared between sets, `albedo_gain` per model |
| scatter `avoid_materials`, `avoid_margin_m`, `sightlines_m`, `near_materials`, `near_m`, `sunlit_only`, `cluster`, `sink` | scatter | keep off roads and creeks; keep off every camera's line to its look-at point (and past it) and to every prop; only near a material (forest edge); only where the strongest sun reaches; groups of 3 to 7; half-buried |
| kit `baseboard` `z_m` | kits | the same strip raised: a crash rail |
| kit `frames` | kits | architraves around glass panels and doors |
| kit `attic_cap` | kits | built and tried, not used (see below) |
| kits `clear_centre` (default on) | kits | a kit object under a view's centre ray is removed (G10b) |
| atmos `haze` | atmos | a low-density scattering volume over the blockout extent; left out of the id pass and of the per-still ray grid |
| atmos `backdrop` | atmos | built and tried, not used (see below) |

`gains.py` turns a before run and a dressed run into per-material gain and tint (area-weighted over every still of a location;
Lab means turned back into linear RGB), damped and clamped; `--apply` writes them into the configs (a piece entry starts from its
material's gain and tint). This is how the cabin tone is fixed in the materials and not in the exposure.

Generated image: `membrane_hf_1` (Higgsfield, owner ruling 2026-11-23, marrow tissue only) is recorded in `dress.lock.json` under
`generated`, with its job id, prompt, cost and md5, and is never counted as CC0.

Changes of approach during R1 (and why):

* Displacement on the large marrow walls made streaks (the box projection switches axis on steep folds at 0.6 m cells): only the
  dividers and piers are displaced; walls next to the shaft opening and the lintel are not, so the dark opening is not covered.
* Outward-only displacement: centred displacement opened dark cracks at piece joints.
* Voronoi edges for veins read as crazed ice; veins are now zero-crossing lines of warped noise.
* Interior backdrop (camera rays looking up see a dark attic) and the camera-only attic cap: both fixed the blue strip above the cabin
  stairs, but some cabin player views look up through that opening as their whole upper frame, so the tone gate failed by 40 %; both
  are left out of the config and the strip stays (it is the build file).
* Ceiling joists (P0) darkened the cabin frames (G2), made the ceiling periodic (G8) and took light off floor props (G11): removed.
* The hospital wall scan with formwork tie holes repeated (G8): the walls use `concrete_floor_worn_001` (painted concrete without
  a tie-hole grid).
* Roadside models in a forest block's shadow render near-black (G4): models are placed only where the sun reaches.
* Cabin tone: the per-material gains from `gains.py` (all below 1) took bounce light out of the room, so every hero prop came out
  10 to 15 % darker (G11 0 of 27). A location albedo gain (`grime.tone_gain`) of 1.15 overshot (props 5 % bright), 1.10 put G11 at
  27 of 27 with tone and colour inside the limits. 1.12 did not lift the darkest pixels of four outdoor player views (G4b, dark
  patches in the floor scan) and pushed the overview's contrast out of its band, so 1.10 stays. Lifting the floor alone by 4 % did the same (overview contrast out, darkest pixels unchanged): not used.
  Interior tone is a room-wide bounce problem, not a per-material one: correct the whole room's albedo first, then per material.
* Camera-only sky plate in the cabin and the hospital: built and tried, not used. The hospital window glass hides it; in the cabin
  14 outdoor night player views, whose upper half is sky, lost 15 to 24 % of their tone (G2). The loop road now uses the overcast
  sky picture: the partly cloudy one, divided by its own mean, came out darker than the flat sky in the slot between the forest
  blocks (its sun pulls the mean up), and the frames lost contrast (G6b).
* Marrow veins: brighter vessels (`vein_dark` < 0) read less like cracks but made the repeat score worse (G8 0.79): long
  vertically stretched lines correlate with themselves. Kept: mild darkening (0.2), warm tint, stretch 1.5 (1.0 on the far wall).
  Leaving the generated overlay off the far wall made its repeat score worse (the procedural alone is more regular at that
  distance), so the overlay stays on every wall.
  Displacement 0.2 m made blocky steps on the dividers (box projection); 0.07 m keeps relief without them.
* G14 now needs a physical join: two coplanar pieces of the same material whose boxes are more than 5 cm apart only meet in the
  picture (on the loop road a far road end behind the near pads, 4.5 m apart), and the luma step between them is distance, not a
  seam. `measure.box_gap`, tested.
* The hospital prop models' ledger on the box pointed into a folder another job had cleared; the 33 GLBs were restored from the
  local copy into the job folder and `models.map` points there.

## R2 refinement pass (2026-11-24)

The owner was not satisfied with R1 ("create a new refinement pass"). R2 adds, again opt-in per config entry:

* `trees.py` (kits `treeline`, `conifer_wrap`): procedural spruces of 12 to 17 drooping, ragged branch skirts (about 500 triangles,
  shared variant meshes). `treeline` stands them along the faces of the big forest blocks that a view looks at (trunks straddling the
  face, heights 0.75 to 1.5 of the block, so its flat top becomes a ragged skyline); `conifer_wrap` puts a tiered crown over every
  blockout cone crown. `no_shadow_near_props_m` keeps a tree's shadow off a hero prop (G11).
* `plates.py` (kit `window_plate`): a camera-ray-only panel outside every window and door opening of an interior (an opening is a
  `-head` wall piece; a `-sill` under it makes it a window), with a procedural sky, ragged tree line and ground band tone-locked to
  the scene's own flat world colour. No light, shadow or reflection changes; the overview hides it.
* Ground fog (`atmos.fog`: `top_m`, `falloff`, `wisp_m`, `wisp`): a second volume from the floor up, thick at the ground and gone at
  `top_m`, broken by a slow noise.
* Scatter: `patch` (low-frequency value-noise clumps and gaps), `jitter` (> 0.8 lets points leave their grid cell) and `tilt_deg`
  for grass; grass now has 6 tuft variants of 6 to 16 blades.
* Displacement: each displaced piece is a welded, smooth-shaded copy with its box size in `dress_dims`; `edge_fade_m`,
  `edge_floor`, `edge_mid` pull the displacement toward its middle near the box edges (no slabs or grooves on a silhouette), and
  `disp_ridge` sets how much fine ridge noise goes into the true displacement.
* Glass (`dirt-only`) `frost`: wired, frosted safety glass (mottle, wipe marks, square wire mesh, rougher), mean tone kept.
* Kits: `cast_shadow: false` (ceiling beams that must not take light off the props).
* Board ceiling (`grid` with `board_m`, `board_axis`): boards of `tile_m` width and `board_m` length, used on the cabin's main
  ceiling between the beams.

Changes of approach during R2 (and why):

* Room haze in the cabin (0.014 to 0.035 per metre) and the hospital (0.012): every prop lost 10 to 30 % of its light (G11) and the
  frames their tone (G2); taken out. Ground fog on the loop road (0.014, 3 m): tone and colour gates failed on 7 of 9 stills; taken
  out. The loop road keeps a faint haze (0.0012 per metre).
* The attic cap is still out (same reason as R1: player views that look up through the stairwell opening lose 40 % of their tone).
* Ceiling beams: with shadows they took light off the props (R1). With `cast_shadow: false` and `camera_only_light` they no longer
  change the room's light, but they cut the plaster ceiling into strips that the repeat detector reads as a tiling (G8 on 8 views):
  the ceiling between them is now boards (`grid`, periodic by design, which G8 skips, as for tiles and wallpaper).
* A masked high-pass in the G8 detector (local mean from the region's own pixels) removed the beam artefact but raised other
  regions' scores against the calibrated limit; reverted, the calibrated detector stays.
* Trees that cast shadows darkened the road views (G2, G3b, G4b); trees that block bounce light took light off the camp props (G11).
  Trees now cast no shadow and are invisible to bounce light (`cast_shadow: false`, `camera_only_light`); an `underside` darkening
  on the foliage keeps their skirts from reading flat. Smooth-shaded skirts and hiding the blockout cone from the camera (inside its
  own shadow) both made trees render black (G4b): reverted.
* Window plates first went behind every `-head` piece, including the hall partition's doorway inside the room: exterior walls only.
* Marrow: a 5.5 m overlay tile raised the far-wall repeat score; back to 3.7 m.

## R3 refinement pass (2026-11-24)

The owner was not satisfied with R2. R3 works through the critic's points, again opt-in per config entry:

* Board ceiling (`grid` with `board_m`): no longer built on Blender's Brick texture, whose per-brick tint is a weak hash of row and
  column; with a fixed row offset it lined up into diagonal staircases of darker boards. Every row now gets a random butt-joint
  offset, every board its own white-noise value, and a faint lengthwise `grain`.
* Log courses: `courses.round_m` puts a round log profile into the bump (depth `round_m`) and `round_shade` darkens each log toward
  its seams, so the wall reads as stacked logs with chinking instead of a flat print.
* Ceiling beams: thinner (0.13 by 0.15 m), rounded (`round_m`) and worn on the edges (`edge_wear`), finer grain (0.7 m tile).
* Window plates: `tiers` (whorls of branches along each silhouette) and `blur` (soft, out-of-focus edges), more and smaller trees in
  two rows, instead of hard spikes.
* Marrow: `base_color` gives a material another albedo hue at the build colour's luminance (emission keeps the build colour); the
  marrow uses a dusky rose (linear 0.30, 0.12, 0.14), so under the blue light it reads violet-grey. The per-piece `tint` corrections
  toward the blue are removed. Owner ruling (2026-11-24): keep the rose; the marrow region-colour misses (G3a, G3b) it causes
  are intended.
* Marrow black slits: `edge_mask` picked a face's axis from the shading normal, which bends to 45 degrees in the smooth ring along
  every edge of a welded box; the mask jumped back to full displacement right at the edge and the surface folded into black slits.
  The edge distance is now the second smallest of the three per-axis distances to the box's faces (normal-free).
* Kit `swell` (`swell.py`): noise-swollen, round-capped tubes of the wall's own material along the bottom edges of the marrow walls
  and piers, so walls meet the floor in a quarter-round swelling instead of a box corner. Lengths near props and cameras are cut out.
* Marrow floor: the larger rocks of P0 are back (`rubble`, `rock_01` scan, clustered, half-buried); the floor is a little darker.
* Trees (`style: branches`): every tier is 16 to 24 feathered, drooping branch strips with zig-zag needle edges, each rolled a little,
  instead of one flat star-shaped skirt. `treeline.rows`: a front row along the block faces and a taller back row inside them, so
  tree tops break the box's top edge. More CC0 saplings and dead trunks at the forest edge.

## New-models pass (2026-11-24)

The owner asked for the 19 new ComfyUI models of the final ledgers to go into the renders. One of them (`firewood-bundle`) is a
prop of the build files and is swapped in through a models ledger passed with `--models` (ledger key `"fit": "mean"`: the model is
scaled by the mean of its side ratios instead of the height rule for upright props, which made the bundle 0.65 m long). The others
are realism-list items that were blockout boxes, openings or missing; they go in through a new dressing layer:

* layer `props` (`propmodels.py`): `locations.<loc>.props` entries name a model file (under `$DRESS_MODELS`, md5-checked), its copies
  (`items`, `ring` or `row`; `at` is the bottom centre of a copy's box), its scale (`scale`, `dims_m` per axis in the model's own frame,
  `height_m`), `rot_deg` / `yaw_deg`, optional `scenes`, `albedo_gain` (a too dark texture), `cast_shadow`, and the blockout pieces or
  props it replaces (`hide_pieces`, `hide_props`: hidden in the render only). Copies share meshes and materials; every mesh carries
  `dress_group = models/<model>`, so the id pass, the camera-distance record and the manifest hash count them. Each copy's world box
  is checked against every view (camera inside or within 0.3 m, the box on the line to the look-at point) and the player start.
* `rules.json`: `props` is a layer; the Dr. Tox arena allows it for `floodlight-housing` only, 6 m or more above the floor (G15
  checks both), so the arena stays empty of anything but light fixtures.
* driver: `--check-views <json>` renders extra look-only stills (`check-<name>`, 1280x720) where no scene view sees a model, for
  checking its scale and front by eye.
* `propgates.py`: a model that replaces a box changes the pixels it covers by design, so G2, G3a, G4a, G4b and G6b are applied to the
  rest of the frame (outside the new models, the boxes they replace and a swapped prop, grown by 3 px; not applied when that rest is
  under 10 % of the frame), G10a and G11 leave out a swapped prop, G11 is measured over the pixels that show a prop in both stills
  (the five 9-px patches moved with a few mask pixels and read up to 1.2 on a sack whose own mean changed 2 %), and G10b passes when
  the object that was under the look-at point is the one the model replaced. The usual `report.py` gates are reported too.


## Rebuild of three models (2026-11-24)

The three models the new-models pass left out (the washer came out an oil drum, the truck door a whole cab, the crate table had a
laptop on it) were rebuilt with Higgsfield (a new reference image, then image-to-3D, textured with PBR maps, about 60k triangles),
fitted to real size in Blender (bottom centre at the origin, front on -Y) and placed through the props layer:
`drum-washing-machine` x4 in the laundry (replacing drum-1..4, moved 0.4 m north so the first clears the side table),
`truck-door` in the truck cab (replacing door-open; hinged at the front pillar, 60 degrees open; the door-step box stays) and
`crate-coffee-table` in tam-flat (replacing crate-table; its top at 0.45 m carries the scene's notebook and phone). The models are
credited as generated (Higgsfield). Tests: `tests/test_props.py` class `Rebuild3`.

## P1: core surfaces and grime (2026-11-27)

`p1.py` writes a location entry for each of the 144 places that are not pilot places (`python tools/render/dress/p1.py --write`).
It reads the compiled blockout files (read only), sorts every blockout material by name, role and flags into a preset, and keeps
the hand-made pilot places and every `props` entry. Presets (R3 options throughout: three stochastic samples, per-object phase,
large-scale brightness fields, worn edges, patches) use only the 23 approved P1 textures:

| Preset | Texture or family | Used for |
| --- | --- | --- |
| `plaster`, `plaster_clean`, `plaster_old`, `ceiling`, `paint_gloss` | `plastered_wall_04`, `worn_mossy_plasterwall` (contrast 0.3: at 1.0 it reads as mould) | painted plaster in three wear grades by place (clean: labs, offices, lobbies; old: cellars, cold stores, laundries, tunnels) |
| `conc_wall`, `conc_wall_damp`, `conc_floor`, `conc_polished` | `concrete_wall_008`, `concrete_floor_worn_001` | concrete in three grades |
| `painted_steel`, `stove_iron`, `steel_clean`, `car_paint`, `brass` | `green_metal_rust` (luminance only), procedural metal | steel with rust blotches that lower metallic; Man Eater rust kept amber-brown |
| `metal_plate`, `corrugated` | `metal_plate`, `corrugated_iron` | grates, tin roofs |
| `flagstone`, `cobble`, `stone_block`, `drystone`, `marble` | `slate_floor_02`, `stone_floor`, procedural with light veins | stone |
| `brick`, `mud_wall`, `tile`, `tile_gloss` | `red_brick_03`, `mud_cracked_dry_03`, `large_floor_tiles_02` | masonry and tile |
| `wood_floor`, `wood_deck`, `log_wall`, `boards_v`, `timber`, `timber_varnish` | `weathered_plank_siding`, `wood_trunk_wall` | wood (logs with round courses and chinking, as the cabin) |
| `wallpaper`, `cloth_wall`, `fabric`, `fabric_fine`, `thatch` | procedural paper, `hessian_380` | wall coverings, textiles |
| `paper`, `leather` | procedural (fibres, laid lines, creases, faint foxing; pebbled grain, creases) | blank paper and vellum (no lettering), leather |
| `gravel`, `path`, `earth`, `dry_ground`, `sand`, `asphalt` | `gravel_floor`, `rocky_trail`, `forrest_ground_01`, `mud_cracked_dry_03`, `coast_sand_01`, `asphalt_02` | ground |
| `glass`, `glass_frosted` | dirt-only | glazing |

Grime set (shader masks, no z-fighting): `streaks` (water, soot or rust runs from the top of a vertical face), `cracks` (hairline
cracks in patches, or light veins for marble), `rust` (metal only; lowers metallic, raises roughness), with the R1 `scuffs`,
`edge_wear` and `patches`, and AO dirt, dust and damp from the location's `grime` grade. Stain decals in interiors (never Man
Eater, never the arena). Materials of later phases are not dressed and are listed per location under `p1.deferred`: sky and water
(P2), vegetation (P3), rock, snow and ice (P4), and the per-game specials (P5: heartstream tissue, bark, LIRA crystal and glow, WRY
bone-and-silver, SEA tarred wood, TEMP sand and books). Emitting materials (lit windows, lamps) are kept. `scan` `contrast` scales
a scan's detail around the build tone.

Driver run: before = `--no-dress 1`, after = `--dress code/dress --dress-layers surfaces,decals` (the props layer is a separate
pass and is left out of both, so the gates compare like with like), half resolution and half samples, every still. `run_post.sh`
describes with one Python process when `$PY` is set, so the job never has more than one Blender on a shared box, and keeps the
png files when a describe fails.

## P2: atmosphere and skies, first cut (2026-11-27)

`p2.py` adds to the P1 entries of 55 places (`python tools/render/dress/p2.py --write`): a camera-ray-only procedural sky plate
on every outdoor place (clouds around the scene's own flat world colour; cloud strength by sky type, picked from that colour:
night, dusk, clear, partly cloudy or overcast), a 0.0005 per metre haze on outdoor places under 150 m across (none at night, none
in the bark world while D14 is open), and the R3 spruce window plate in the Stuffed Ones and Man Eater interiors with windows.
Lighting is unchanged (G1): the plates are seen by camera rays only. A first haze of 0.001 per metre under 250 m took 8 to 25 % of
the light off props in the 100 to 240 m Dr. Tox places (G11); it is now half that, and only under 150 m.

Not added, and why: no earth sky inside the heart, under the sea, in the cosmic WRY places or on the WRY chasm rim (taken out
after the look round: the haze lit up the dark chasm, G2 up to 1.68); no haze at Fall's salvage settlement (it veiled the far span, G11); no spruce plates in the desert
town, the harbour or the sky city; no room haze (R1 and R2 measured it taking 10 to 30 % of the light off the props); dust motes,
light shafts, rain, snow, flame cards and water shaders are not built yet. The six locked sky hdris were tried first: divided by
their own mean (a mean the sun pulls up), they came out 15 to 30 % darker than the flat sky in these frames (G2), as R1 found on
the loop road; a test that normalised by the upper hemisphere without the sun (and mixed in more of the picture) came out darker still, so the plates are procedural and the
hdri a place would get is only recorded (`hdri_considered`).

Run: before = the P1 render of the same place, after = the same with `--dress-layers surfaces,decals,kits,atmos`. The overview of a
place whose rig gives the overview a horizon-to-zenith gradient world keeps that gradient (`atmos.wrap_world` leaves a gradient
world alone): wrapping it had replaced the designed dusk gradient of altrulan's glass-mountains with grey clouds.

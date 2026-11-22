# lira-calyx: refinement notes (render and refinement plan, seventh batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the author;
each is also applied inside the driver only (`tools/render/overrides.json`, `tools/render/rig.json`). 24 scenes in 14 locations
(24 hero at 2560x1440 / 256 samples; every scene of this game is a hero scene). Each scene's own lights, world, camera and lens
were used; the rig adds exposure only (no fill light was added anywhere). Built with real models for 14 of 30 object types (phase C), named box proxies for the rest.
No person or creature is in any frame; the sheets show only the driver's stills and the location references (a reference that shows figures is left out).

## Owner decisions

1. **Spore-weaver-valley reference.** The reference image shows several small standing human figures on the valley floor, so by the no-figures rule its sheet carries a text card instead (`reference_card` in `tools/render/rig.json`). Say if the image may be shown (the figures are a few pixels tall).
2. **Proposed build-file diffs** (phase A, five of them: the three first-pass camera flags and two props found by the driver). The driver applies each at render time only; nothing in a build file was changed.
3. **The facing convention.** `player_start.facing_deg` agrees with the scene camera in all 24 scenes read as a rotation about Z (90 faces -x) and in 7 read as a compass bearing. Say which in `docs/BLENDER.md` (proposed text below).
4. **Models are lite copies** (about 12k triangles, 512 px) because the render box's upload link is slow; a pass with the full 80k-triangle glbs needs a faster link or files already on the box. Say if you want it.
5. **The render box went offline for about half an hour** between the look passes and the final run (the instance listing said offline from about 15:30 to 16:00 local); its files survived and the final run was started afterwards. No result was lost.

## Phase A: flagged scenes (3 flagged in the first pass) and what the driver found

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| corporate-lab / b2-lab | the camera `[-20.0, -6.0, 2.65]` stands on the face of `wall-west-lintel` (a 0.3 m wall piece from z 2.4 to 8 over the lab's door): the first-pass flag | camera override `[-19.6, -6, 2.65]`, 0.4 m into the lab; same view | `/scenes/b2-lab/camera/location` `[-19.6, -6.0, 2.65]` (or lower the lintel's bottom edge: the camera's eye is above the 2.4 m door head) |
| shear-tunnel / b4-collapse | the camera `[29.5, 0, 2.65]` is inside `rubble-seal` (x 27 to 30): the still was a white wall | camera override `[26.6, 0, 2.65]`, in front of the seal; the view down the tunnel shows | `/scenes/b4-collapse/camera/location` `[26.6, 0.0, 2.65]` (or move `rubble-seal` to x 30.5) |
| shear-tunnel / ep-tunnel | the camera `[-30.0, 0, 2.35]` has no clearance from `end-west` (x -30.6 to -30.0); the ray test counts the wall as between camera and target: the first-pass flag | camera override `[-29.5, 0, 2.65]` | `/scenes/ep-tunnel/camera/location` `[-29.5, 0.0, 2.35]` |
| harvester-ridge / b2-hearing | found by the driver (not a first-pass flag): prop `gauge` `[12, 4.6, 2.6]` is inside the `outcrop` sphere (27 of 27 points) | prop override: `gauge` to `[12, 3.95, 2.6]`, on the outcrop's surface | `/props` `gauge` `location` `[12, 3.95, 2.6]` |
| shear-tunnel / co-tunnel, ep-tunnel | found by the driver: prop `journal` `[25.6, 0.4, 0]` is inside `rubble-heap-3` (27 of 27 points) | location-level prop override: `journal` to `[26.4, 0.4, 0]`, on the floor beside the heap | `/props` `journal` `location` `[26.4, 0.4, 0]` (or `[25.6, 0.4, 0.62]` to lie on the heap) |

Before and after: `flagged-before-after.jpg` (before = `--no-overrides 1`, 0.4 scale at 25% of the samples, no models; after = the final still). A prop moved
by an override can be too small to show in that frame.

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| hollin-terrace (5 scenes), shear-tunnel (3 scenes) | `crystals-mid` overlaps a pipe or terrace piece (3 of 27 points) | none (a crystal cluster growing out of its surface) |

## The facing convention (both games)

`player_start.facing_deg` is not defined beyond "0 faces +y" in `docs/BLENDER.md`. Read as a compass bearing (90 faces +x) the camera
and the facing agree in 7 of 24 lira-calyx scenes and 13 of 20 heartstream scenes; read as a rotation about Z (90 faces -x, `rig.json`
`facing: "ccw"`) they agree in 24 of 24 and 18 of 20 (the other two heartstream scenes agree only under the compass reading, and every scene
is within 30 degrees under one reading or the other). The driver reads `ccw` for both games. PROPOSED: say so in `docs/BLENDER.md`
("`facing_deg` is a rotation about Z: 0 faces +y, 90 faces -x"), as already proposed for stuffed-ones and missing-campsites.

## Phase B: the rig per location (overview against its reference)

Reference images are 1600 x 900 images from each design's prompt (`games/lira-calyx/assets/locations/<id>.jpg`). The overviews are views from the driver's own camera
at about eye height with a wide lens (or from a raised point for the large outdoor sets), lit by the scene named below; they match layout and rough light
direction, not detail. Only the rig changed (`tools/render/rig.json`): scene exposure from a look pass on quick renders (mean display value toward 0.22,
capped at -3.5 and +3.5 EV), `overview_ev`, the overview camera; the overview cameras were set in three look rounds by eye. No light, world or fog was added.

| Location | Overview lighting scene | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, lens) |
| --- | --- | --- | --- | --- |
| cinder-reach-archive | b2-archive | b2-archive -0.9 | +0.5 | [-3, -14.5, 1.7] to [0, 6, 1.8], 18 mm |
| continuum-outpost | b3-outpost | b3-outpost +2.1 | +0.0 | [-8, -27, 2.0] to [4, 0, 6], 20 mm |
| corporate-lab | b2-lab | b2-lab -3.5 | +0.0 | [-17, -11, 2.0] to [6, 6, 2.5], 18 mm |
| harvest-terrace | b3-midlander | b3-midlander -2.1 | +0.0 | [-30, -20, 30] to [5, 0, 14], 22 mm |
| harvester-ridge | b2-hearing | b2-hearing -2.9 | +1.0 | [-20, -30, 7] to [14, 18, 8], 22 mm |
| hollin-terrace | b1-terrace | b1-terrace-night +2.5, b1-terrace -2.7, b4-terraces -2.4, end-errata +0.0, end-fire -1.0 | +0.0 | [30, -24, 16] to [-25, -4, 8], 26 mm |
| peak-core | b4-core | b4-core -1.7 | +0.5 | [-44, -3, 2.5] to [0, 0, 10], 22 mm |
| scorched-biome | b2-lowlands | b2-lowlands -3.5 | +0.0 | [25, -50, 5] to [0, -5, 1.5], 22 mm |
| shear-tunnel | co-tunnel | b4-collapse -0.5, co-tunnel +1.4, ep-tunnel +1.2 | +1.5 | [-29, 0.5, 2.2] to [0, 0, 2.0], 20 mm |
| small-room | b3-hiding | b3-hiding +0.8, end-in-time +3.5, end-written +0.9 | +0.0 | [3.6, -2.6, 1.6] to [-1, 2, 1.2], 16 mm |
| spore-weaver-valley | b1-valley | b1-valley +0.9 | +1.0 | [-175, -20, 2.5] to [-110, 0, 10], 22 mm |
| storm-outpost | b1-outpost | b1-outpost -3.5 | +0.5 | [-10, -19, 6] to [2, 4, 2], 24 mm |
| storm-singing-ledge | b3-peakborn | b3-peakborn -1.2 | +0.5 | [0, -20, 3] to [0, 0, 1.2], 20 mm |
| subterranean-city | b3-city | b3-city +0.6, end-resilience -3.5, ep-vault +3.5 | +2.5 | [-62, -4, 4] to [10, 2, 6], 20 mm |


Deltas the rig cannot close: the blockouts are plain-colour boxes: no terrain relief, rock texture, snow, foliage, mountains or sky gradient (skylines are `sky` or distant pieces, hidden or flat), so the outdoor locations read as flat coloured ground with box buildings where the references are painted mountain scenes; the archive's ceiling light shafts and floor reflections, the lab's glass cases and stair, the tunnel's pit-props and fire and the city's hanging globes are not built or are reduced to boxes; the spore valley's glow trees are not built; light colours and directions follow the build files' own lights, so several scenes are dim by design (the rig only raised exposure).

## Phase C: models

Ledger read: `games/lira-calyx/assets/models.json` in the ComfyUI session's checkout (branch comfy-models-3d; the committed snapshot 824ad55 listed fewer built entries
than the working copy, which was still changing: the working copy of 2026-11-22 afternoon was used, read-only; 20 entries built). Only `built` entries were used. The glbs were
copied to the render box as lite copies (decimated to about 12k triangles, 512 px JPEG textures); nothing was copied into the repo. Fit: see `tools/render/README.md`
(batch 6). I looked at every model from the front (-y) and a three-quarter view: none shows a person or creature, so none was skipped. The ledger says "front direction (-y)
not checked by eye" for all of them; the Problems column is my check.

| Object | Source | Props | Model size (m) | Box size_m x scale (m) | Fit | Problems |
| --- | --- | --- | --- | --- | --- | --- |
| aetheric-emitter | model (lite copy) | 14 | [1.005, 1.108, 1.604] | [0.8, 0.8, 1.6] | scale 0.998, worst side x1.38 | front (-y) shows the mirror dish; wider than size_m (1.0 x 1.1 against 0.8 x 0.8), scaled to the 1.6 m height |
| afu-meter | model (lite copy) | 1 | [0.2, 0.135, 0.2] | [0.15, 0.08, 0.2] | scale 1.0, worst side x1.69 | hand meter lying slanted, dial faces -y; a little larger than size_m (0.2 x 0.135 x 0.2 against 0.15 x 0.08 x 0.2) |
| board-table | named box proxy | 1 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| coordinate-card | named box proxy | 1 | None | None | rejected (best axes None, worst side xNone) |  |
| crystal-cluster | named box proxy | 35 | | | | no entry in the ComfyUI ledger yet (not built when the ledger was read) |
| field-journal | named box proxy | 12 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| field-recorder | model (lite copy) | 2 | [0.25, 0.237, 0.104] | [0.25, 0.12, 0.18] | scale 0.958, worst side x1.89 | reel recorder, controls face -y; 0.10 m high against 0.18 and twice as deep as size_m |
| flood-siren | model (lite copy) | 5 | [1.635, 1.262, 2.215] | [0.6, 0.5, 2.2] | scale 0.993, worst side x2.71 | the horn points +x, so the siren's front (-y) is its side; 1.64 x 1.26 x 2.2 against 0.6 x 0.5 x 2.2: horn and housing far wider than size_m |
| flux-probe | model (lite copy) | 1 | [0.236, 0.21, 1.1] | [0.12, 0.12, 1.1] | scale 1.0, worst side x1.97 | gauge head faces -y; the head is 0.24 x 0.21 against 0.12 x 0.12 (twice size_m) |
| folding-field-table | model (lite copy) | 7 | [1.008, 0.704, 0.898] | [1.0, 0.6, 0.75] | scale 0.89, worst side x1.11 | front is the long side; slightly larger than size_m, scaled to 0.75 m (scale 0.89) |
| fused-glass-fragment | named box proxy | 2 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| gravimeter | named box proxy | 1 | None | None | rejected (best axes None, worst side xNone) |  |
| hand-lamp | model (lite copy) | 10 | [0.167, 0.141, 0.321] | [0.14, 0.14, 0.32] | scale 0.997, worst side x1.19 | front is symmetric; within x1.2 of size_m |
| journal-case | named box proxy | 7 | None | None | rejected (best axes None, worst side xNone) |  |
| lab-console | named box proxy | 1 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| light-table | named box proxy | 1 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| log-cabinet | named box proxy | 16 | None | None | rejected (best axes None, worst side xNone) |  |
| patent-drawer-cabinet | named box proxy | 12 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| photodiode-post | model (lite copy) | 3 | [0.269, 0.347, 1.3] | [0.15, 0.15, 1.3] | scale 1.0, worst side x2.31 | head and bracket 0.27 x 0.35 against 0.15 x 0.15 (2.3 times wider) |
| prototype-harvester | model (lite copy) | 1 | [8.918, 7.167, 9.093] | [6.0, 6.0, 9.0] | scale 0.99, worst side x1.47 | a legged machine, 8.9 x 7.2 x 9.1 m against 6 x 6 x 9; the legs read as a walker but it is a machine with no head or body; front is not distinct |
| pulse-rig | named box proxy | 4 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| relay-beacon | named box proxy | 8 | None | None | rejected (best axes None, worst side xNone) |  |
| river-glow-meter | model (lite copy) | 5 | [0.574, 0.449, 1.201] | [0.25, 0.2, 1.2] | scale 0.999, worst side x2.29 | dial faces -y; the head is 0.57 x 0.45 against 0.25 x 0.2 (2.3 times wider) |
| sampling-dial | model (lite copy) | 1 | [0.201, 0.166, 0.195] | [0.2, 0.12, 0.15] | scale 0.821, worst side x1.21 | dial box with a carry strap, faces -y; scale 0.82 to the 0.15 m height |
| seal-press | model (lite copy) | 4 | [0.439, 0.2, 0.402] | [0.3, 0.25, 0.4] | scale 0.994, worst side x1.46 | lever and handle run along x (the press is seen side-on from -y); 0.44 x 0.20 x 0.40 against 0.3 x 0.25 x 0.4 |
| specimen-shelf | model (lite copy) | 6 | [1.229, 0.571, 1.607] | [1.2, 0.35, 1.6] | scale 0.996, worst side x1.63 | front shows the open shelves; jars and trays blur at lite resolution; deeper than size_m (0.57 against 0.35) |
| strain-gauge | named box proxy | 1 | None | None | rejected (best axes None, worst side xNone) |  |
| strider-clicker | model (lite copy) | 1 | [0.074, 0.083, 0.08] | [0.06, 0.03, 0.08] | scale 0.963, worst side x2.37, axes turned [90, 0, 90] | a tally counter lying on its back; axes turned [90, 0, 90]; 0.07 x 0.08 x 0.08 against 0.06 x 0.03 x 0.08 (2.4 times thicker) |
| threat-packet | named box proxy | 1 | | | | ledger status failed (the ComfyUI run ran out of GPU memory) |
| transmitter | named box proxy | 1 | | | | ledger status failed (the glb download was cut short) |

## Phase D and gaps

24 scenes, the eye-height player-start still of every scene and one overview per location: 62 stills in the ledger. Contact sheets:
`renders/lira-calyx/<location>.jpg`; ledger: `ledger.json`. Not produced: the depth and object-index passes. The models are lite copies, so
close-ups of small props show decimation artefacts.

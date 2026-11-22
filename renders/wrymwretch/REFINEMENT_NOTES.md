# wrymwretch: refinement notes (render and refinement plan, fourth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the
author (JSON-patch style, paths in the build file's own terms). Some are also applied inside the driver only
(`tools/render/overrides.json`), marked "applied at render time". 36 scenes in 14 locations; 5 were flagged by the first pass, and the driver
or a look at the stills found 4 more. Every prop is a named box proxy (no model exists). Each scene's own lights, world, camera and lens were
used; the rig adds exposure (and translucency for one material) only.

## Phase A: flagged scenes

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| duskbane-underworld / s_duskbane_halls | camera y -21.5 is behind `south-wall` (y -20.8 to -20.0), outside the hall; the wall fills the frame | camera y -19.6 | `/scenes/s_duskbane_halls/camera/location` `[0, -19.6, 3.5]` |
| duskbane-underworld / s_underworld_tunnels | camera `[-17, -20.5, 3.5]` is inside `south-wall` | camera y -19.6 | `/scenes/s_underworld_tunnels/camera/location` `[-17, -19.6, 3.5]` |
| starlit-priory / s_priory_halls | camera y -50.5 is behind `hall-south`; also `star-dome` (a solid 20 x 40 x 12 m ellipsoid, z 12 to 24) contains the `dome-starlight` area light at z 18, so the hall got no light | camera y -49.2; `star-dome` replaced, for this location, by a 0.6 m lid at z 23.7 (same material) | `/scenes/s_priory_halls/camera/location` `[0, -49.2, 3.5]`; make `/blockout/<id=star-dome>` an open dome or a lid: `{"shape": "box", "size_m": [20, 40, 0.6], "location": [0, -30, 23.7]}` |
| starlit-priory / s_crystal_forest | `doors-frame` is a solid 4.4 x 1.0 x 7.4 m box that plugs the doorway the camera (y -10.5) looks through; `doors-light` is an opaque emissive plane 0.7 m ahead of the lens (the first still was a flat tan or white field) | `doors-frame` replaced by two jambs and a head; `doors-light` omitted in this scene; look_at z 4.19 (0.28 m inside `forest-hill`) raised to 4.6; the rig also draws material `door-light` 12% opaque in the location's other scenes | split `doors-frame` into jambs `[-2.0, -10, 3.5]` and `[2.0, -10, 3.5]` (0.4 x 1.0 x 7.4) plus a head `[0, -10, 7.0]` (4.4 x 1.0 x 0.4); `/scenes/s_crystal_forest/camera/look_at` `[0, 0, 4.6]`; give `doors-light` a translucent material or move the camera back to y -16 |
| storm-chamber / s_storm_chamber | `door-opening`, an opaque black `void` plane, fills the doorway the camera looks through from the stair | omitted (`storm-chamber/*`) | remove `/blockout/<id=door-opening>` or give it a translucent material |
| galewing-sky-city / s_cloud_platform | (driver: prop inside a piece) `platform-underside` is a 10 m cone rotated 180 degrees and centred at z -0.5, so its flat top is at z 4.5, 4.5 m above the platform: it swallows `crystal-platform` and fills the 32 mm view | centre z -5.0 | `/blockout/<id=platform-underside>/location` `[21, 0, -5.0]` |
| ranger-outpost / s_cedar_outpost | (not flagged; found by looking) camera `[0, 15.5, 3.5]` is outside the north palisade (face y 15.4) and the `gate` proxy at y 14.6 fills the frame | camera y 13.8 | `/scenes/s_cedar_outpost/camera/location` `[0, 13.8, 3.5]` |
| rim-of-wrymreach / s_chasm_seal1 | (driver) `look_at [-10, 40, 0]` is inside `far-cliff` (face y 38) | look_at `[-10, 37.9, 2]` (the frame hardly changes: the 24 mm view shows the cliff face either way) | `/scenes/s_chasm_seal1/camera/look_at` `[-10, 37.9, 2]` |

Before and after (0.4 scale at 25% of the samples, against the final stills): `flagged-before-after.jpg`. The after tiles are the final
stills, at the rig's final exposure (the before tiles use the same rig, so the difference is the geometry only).

### Found by the driver, proposed only (not applied: nothing in frame needs it)

| Where | Finding | Proposed diff |
| --- | --- | --- |
| sky-above-realms / s_end_dormant | `look_at [0, 40, 0]` is below the realm slabs (tops z 3), so the driver reports `cloud-border-2` and `realm-north` between camera and target; it reads as intended from 140 m up | `/scenes/s_end_dormant/camera/look_at` `[0, 40, 3]` |
| heartstone-caverns / s_deep_core | `living-shard` (z 3.5, `[10, -42.5]`) stands inside the cone `wall-crystals-3`; out of frame | prop location `[10, -40.4, 3.5]` (not rendered) |
| rim-of-wrymreach, all scenes | ribs 3 to 8 stand at z 0 inside `ledge-east` (top z 3) | `rib-3` to `rib-8` z 3.0 (not rendered) |
| rim-of-wrymreach, western-groves | tents, banners, tables and the `path`, `clearing` props sit 0.055 m inside the 0.05 m floor slabs (centre z 0.03); `kill-list-slate` (s_moot_dawn) is inside `camp-ground` | floor slabs (`camp-ground`, `moss-filigree`, `path`, `clearing`) centre z -0.025 so their top is z 0 (not rendered) |
| western-groves / s_elder_tree | `crystal-elder` (`[-6, 24]`) is inside `elder-root-3` (rotated 70 degrees) | move to `[-9, 22, 0]` (not rendered) |
| heart-of-wound | `crystal-wound` sits 0.1 m inside `gold-half` | raise 0.1 m (not rendered) |
| bone-choir | `bone-w1` to `bone-e5` overlap the `vertebra-*` pieces (3 of 27 sample points: the bone stands on the vertebra by design) | none |

Checks after the overrides: nothing inside a piece or between camera and target except the `s_end_dormant` look_at above, and the
`prop_inside` rows of `s_deep_core`, `s_moot_dawn` and `s_elder_tree` above (`ledger.json` keeps every check per scene).

## Phase B: the rig per location (overview against its reference)

The reference images are 1600 x 900 location paintings made from the design's prompt (`games/wrymwretch/assets/locations/<id>.jpg`). They
are lit, dressed and framed far beyond a box proxy, so the overviews match layout, key colour and light direction, not detail. Only the
driver's rig changed (`tools/render/rig.json`): the exposure per scene (an automatic pass on quick renders that targets mid-grey, then by eye),
`overview_ev`, and the overview camera (a different eye position; 20 to 26 mm). Values are by eye.

| Location | Overview lighting | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, mm) | Other |
| --- | --- | --- | --- | --- | --- |
| astral-expanse | s_expanse | s_battle_unwriter -4.7, s_expanse -3.5 | +0.7 | [-60, -70, 40] to [0, -30, 20], 26 |  |
| bone-choir | s_bone_choir | s_bone_choir -3.2, s_empty_saddle -0.7 | +1.6 | [0, -29, 2] to [0, 25, 9], 24 |  |
| duskbane-underworld | s_duskbane_halls | s_duskbane_halls +1.0, s_forbidden_chamber +3.6, s_underworld_tunnels +1.3 | +0.0 | [0, -19.5, 2.5] to [0, 12, 3.5], 24 |  |
| galewing-sky-city | s_galewing_ward | s_cloud_platform -1.5, s_galewing_ward -1.7 | +0.0 | [-33, 0, 1.9] to [0, 0, 4], 22 |  |
| heart-of-wound | s_heart_of_wound | s_battle_echo -1.5, s_choice +0.6, s_end_rememberer -2.7, s_end_saddle +0.0, s_end_whole -3.6, s_heart_of_wound -1.0, s_last_witness +3.5 | +2.6 | [0, -24, 2.5] to [0, 0, 7], 24 |  |
| heartstone-caverns | s_heartstone_hall | s_deep_core +2.6, s_heartstone_hall -0.8 | +3.7 | [0, -42, 14] to [0, 30, 10], 24 |  |
| ranger-outpost | s_cedar_outpost | s_cedar_outpost +2.8 | -1.6 | [0, -13, 2.2] to [0, 10, 3], 24 |  |
| rim-of-wrymreach | s_moot_camp | s_chasm_seal1 +0.0, s_chasm_seal2 +3.1, s_moot_camp +0.0, s_moot_dawn -1.0, s_rim -0.9, s_rim_ambush -3.9 | +2.0 | [0, -40, 2] to [0, 10, 10], 22 |  |
| seabed | s_seabed | s_seabed +3.3 | +0.0 | [0, -14, 74] to [-13, 0, 58], 24 |  |
| sky-above-realms | s_first_light | s_end_architect +3.3, s_end_dormant -3.6, s_first_light +4.1 | +0.0 | [0, -170, 60] to [0, 20, 100], 24 |  |
| starlit-priory | s_priory_halls | s_crystal_forest +3.0, s_priory_halls -3.8 | +0.0 | [0, -48.5, 2] to [0, -10, 6], 22 | piece alpha {"door-light": 0.12} |
| storm-chamber | s_storm_chamber | s_storm_chamber -4.7 | -0.6 | [0, -9.4, 9] to [0, 2, 1], 24 |  |
| tidecaller-shore | s_shore_night | s_shore_night +1.8, s_tide_shore -3.1 | +0.0 | [8, -12, 1.8] to [-14, -4, 3], 22 |  |
| western-groves | s_elder_tree | s_cedar_grove -1.5, s_elder_tree -1.5 | +1.6 | [-6, -22, 2.5] to [2, 34, 10], 26 |  |

Deltas the rig cannot close (a box proxy cannot): every reference is near-black with one or two bright accents (the fire, the Heartstone glow,
the door light), while the proxies are flat grey, so the exposure that puts the lit areas at mid-grey makes the proxy overviews lighter and
flatter than the paintings. Per location:

- astral-expanse: islands are flat discs; the sky is the world colour; the stars and the far islands are absent.
- bone-choir: ribs and skull are boxes; the floor and the axis down the hall match.
- duskbane-underworld: the violet light, the pillar rhythm and the aisle to the door match; the carved door and gable are boxes.
- galewing-sky-city: the ward interior and its cots match; the carved arch frame and the sky beyond are not modelled.
- heart-of-wound: the two plinths and the gold and silver halves match; the dragon and the queen are not built (the two tall shapes are plain boxes).
- heartstone-caverns: the plinth, steps and amber glow match; the village and the chasm are not.
- ranger-outpost: palisade, gate and tower match; the proxies are lighter than the painting because the torch lights are weak.
- rim-of-wrymreach: the camp ring and the ribs; no vortex.
- seabed: the cliff and ledges; the monolith is not in this view and the lights hang at the dive start.
- sky-above-realms: the six slabs and the pale light read; the white light is a small cube.
- starlit-priory: hall and columns match; the dome is a lid.
- storm-chamber: dais rings and pillars match; the ring of crystals is a few boxes.
- tidecaller-shore: cottages, sea and stones; no jetty glow.
- western-groves: cedar trunks and the elder canopy as boxes and cones; no ferns in light.

## Phase C: models

`games/wrymwretch/assets/models.json` does not exist, and no `.glb` of any wrymwretch object was found in the repository or in the
Pipelines-Plugin checkout (the plan's "16 Meshy models on the author's machine" are not on this machine). The model swap path of
`render_scenes.py` was therefore not exercised for this game. All 30 object types are named box proxies (`<prop id>`, sized from
`size_m`, scaled to the build file's `height_m`). `king-statue` (6 x 8 x 10 m), `queen-statue` (4 x 4 x 10 m), `wyrm-skull` and
`wyrm-rib` are plain boxes: no figure, no creature.

## Phase D and gaps

Every scene at its tier (24 hero at 2560x1440 / 256 samples, 12 standard at 1920x1080 / 128), the eye-height player-start still of the scenes
that have a start, and one overview per location (1920x1080 / 128): 79 stills. Contact sheets: `renders/wrymwretch/<location>.jpg`; ledger:
`ledger.json`. Not produced: the depth and object-index passes. No frame holds a person
or creature.

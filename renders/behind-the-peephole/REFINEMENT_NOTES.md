# behind-the-peephole: refinement notes (render and refinement plan, fourth batch)

No build file, `assets.json`, design or data file was edited. Everything below that changes a build file is a PROPOSED diff for the
author, some also applied inside the driver only (`tools/render/overrides.json`). 26 scenes in 7 locations, all hero; 2 were flagged by the first
pass (the two stairwell scenes). Every prop is a named box proxy (no model exists). Each scene's own lights, world, camera and lens were used;
the rig adds exposure only.

## Phase A: flagged scenes

| Scene | Cause | Fix at render time | Proposed build-file diff |
| --- | --- | --- | --- |
| back-stair / n3_stairwell | `look_at [0.75, -10.0, 12.8]` lies inside `flight-4b-low` (a 1.4 x 3.7 x 0.875 m step block, top z 13.125), so the first-person view down the stair ended in the stair box | look_at `[0.75, -10.0, 13.3]` (0.18 m above the step top; the camera, the lens and the framing direction are unchanged) | `/scenes/n3_stairwell/camera/look_at` `[0.75, -10.0, 13.3]` |
| back-stair / n6_stairwell | same camera, same cause | same | `/scenes/n6_stairwell/camera/look_at` `[0.75, -10.0, 13.3]` |

Before and after: `flagged-before-after.jpg` (0.4 scale at 25% of the samples, against the final stills).

### Found by the driver, no change needed

| Where | Finding | Proposed diff |
| --- | --- | --- |
| lobby / end_wrong_picture | the driver reports `revolving-door` between camera and target: `look_at [-9, -1, 1.6]` lies inside the door piece, so the sight line ends in it by design; the door reads as intended | none (or `look_at` on the door face) |
| valet-passage, all scenes | the door props of the six rooms stand 3 of 27 sample points inside `wainscot-north` | none (the doors stand in the wainscot) |
| office / n7_your_door | `office-rose` overlaps `office-door-leaf` (9 of 27): the rose is fixed to the door | none |
| back-office / n6_back_office | `door` overlaps `wainscot-west` and `wall-west-south` | none |

Checks after the overrides: nothing inside a piece or between camera and target except `end_wrong_picture` above (`ledger.json` keeps every check).

## Phase B: the rig per location (overview against its reference)

The references are 1600 x 900 paintings from the design's prompt (`games/behind-the-peephole/assets/locations/<id>.jpg`): dark, warm,
practical lights only. The overviews match layout, key colour and light direction, not detail. Only the rig changed (`tools/render/rig.json`):
the exposure per scene (an automatic pass on quick renders, then by eye), `overview_ev`, the overview camera. Values are by eye.

| Location | Overview lighting | Scene EVs (rig) | Overview EV | Overview camera (eye to look_at, mm) | Other |
| --- | --- | --- | --- | --- | --- |
| back-office | n6_back_office | n6_back_office +0.0 | -0.5 | [-2.3, -1.8, 1.6] to [0.5, 2, 1.3], 22 |  |
| back-stair | n3_stairwell | n3_stairwell +1.6, n6_stairwell +1.6 | -1.2 | [1.0, -1.5, 1.7] to [-0.6, -9, 2.4], 22 |  |
| lobby | dawn_lobby | dawn_lobby -1.1, end_sitter -1.5, end_wrong_picture -1.0 | +0.0 | [6, -5, 1.7] to [-6, 4, 2.2], 22 |  |
| office | n1_office | n1_morning -0.8, n1_office +1.4, n2_morning -0.8, n2_office +1.4, n2_seventh_bell +0.0, n3_morning -0.8, n3_office +1.4, n3_tea +0.9, n4_morning -0.8, n4_office +1.4, n5_morning -0.8, n5_office +1.4, n6_morning -0.8, n6_office +1.4, n7_office +1.4, n7_your_door +0.6 | +0.0 | [-1.6, -1.2, 1.5] to [1, 1.4, 1.1], 18 |  |
| river-wall | end_open_door | end_open_door -2.5 | +0.0 | [-5, -3.2, 1.7] to [15, 3, 4], 24 |  |
| staff-alley | n1_arrival | n1_arrival +3.5 | -0.5 | [13, -3, 1.7] to [-8, 0.5, 2], 22 |  |
| valet-passage | n1_passage | end_under_door +10.9, n1_passage +1.3 | +0.0 | [31, 0, 1.6] to [0, 0, 1.4], 22 |  |

Deltas the rig cannot close: the box proxies have no wood, brick, wallpaper or fog; the references are darker with deep shadows, and the proxy
renders lighter and flatter once exposed to mid-grey. Per location:

- back-office: green wall, window and the cabinet row match; the safe and the clock are boxes.
- back-stair: the corridor and the brick-brown tone match; the stair is block steps; the chute box stands at the left.
- lobby: green walls, the revolving door (a gold cylinder) and the desk match; the chandelier and the marble are not modelled; the floor reads glossy.
- office: shelves, desk and the green walls match; the overview is taken from the near corner with an 18 mm lens, the painting is wider.
- river-wall: facade and quay are slabs; the lamp post and the fog are not in the overview; the sky takes the world colour.
- staff-alley: the long brick alley and the lamp light match in tone; the fire escape and the rain are not modelled.
- valet-passage: the green corridor with the door row and the lamps matches; the painting is darker on the right.
- end_under_door (valet-passage) has a rig EV of about +11 because the build file's only light is a 6 to 120 W strip under the door; the still
  reads as a bright sliver in a dark corridor (the sliver is blown out).

## Phase C: models

`games/behind-the-peephole/assets/models.json` does not exist and no `.glb` of any object of this game was found, so every prop is a named
box proxy (30 object types). The swap path was not exercised.

## Phase D and gaps

26 scenes at 2560x1440 / 256 samples, the eye-height player-start still of every scene with a start, and one overview per location
(1920x1080 / 128): 59 stills. Contact sheets: `renders/behind-the-peephole/<location>.jpg` (office: 18 scenes, a tall sheet);
ledger: `ledger.json`. Not produced: the depth and object-index passes. No person or figure in any frame.

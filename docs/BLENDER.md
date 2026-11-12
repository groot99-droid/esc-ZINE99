# Blender build files

One build file per 3D location, `games/<slug>/blender/<location>.build.json`, describes the set
and every 3D scene played in it. The compiler turns each scene into a layout that the studio's
`assemble-3d` pipeline runs unchanged (Pipelines-Plugin, `studio/pipeline/bpy/assemble_plan.py`),
plus a blockout step for the set geometry.

```
assets/assets.json ──► blender/<location>.build.json ──► tools/blender/compile.py
 (location image,        (blockout, props, per-scene        │
  Meshy objects)          lighting, camera, interactions)   ▼
                                     build/blender/<slug>/<location>/<scene>/
                                       assembly.json  → assemble_plan.py (import, normalize, lods,
                                       blockout.json  → blockout.py emit   stage, save, export, render)
```

## Conventions

- Metres, Z up, as Blender has them after its glTF import.
- Origin at the centre of the set's floor. `bounds_m` is `[width (x), depth (y), height (z)]`; the
  set runs from `-width/2` to `+width/2`, `-depth/2` to `+depth/2`, and `0` to `height`. Say in
  `origin` which way +y faces (for example, "+y toward the window wall").
- Rotation is in degrees, `[x, y, z]`; a prop's front faces -y at `[0, 0, 0]`.
- A prop's `location` is where its base centre stands (`ground: true`, the default) or its centre
  (`ground: false`, for things on walls or hanging).
- Ids are lower-case words joined by hyphens. Prop ids and blockout ids share one namespace.

## The file

| Key | What it holds |
| --- | --- |
| `game`, `location`, `name` | The slug, the location id from `assets.json`, a display name |
| `reference` | The location's image, exactly as `assets.json` gives it |
| `bounds_m`, `origin` | The set's size and how it is oriented |
| `materials` | Named blockout materials: `color` [r, g, b] 0..1, optional `roughness`, `metallic`, `emission` |
| `blockout` | The set geometry: `id`, `shape` (box, cylinder, cone, sphere, plane), `role` (floor, wall, ceiling, terrain, structure, opening, water, sky, trim), `size_m`, `location` (the piece's centre), optional `rotation_deg`, `material`, optional `collide` |
| `props` | Each placed Meshy object: `id` (this instance), `object` (an object id from `assets.json`), `location`, optional `rotation_deg`, `ground`, `height_m` (defaults to the object's `size_m` height) |
| `scenes` | One entry per 3D scene played here (every scene id the location lists in `assets.json`) |

Each scene entry:

| Key | What it holds |
| --- | --- |
| `note` | One line: what happens here, from the design |
| `world` | Ambient `color` and `strength` |
| `lights` | `name`, `type` (SUN, AREA, POINT, SPOT), `location`, `look_at` or `rotation_deg`, `energy` (watts; SUN in W/m²), `size`, optional `color` (applied by the blockout step, since assemble-3d has no light colour) |
| `camera` | `location`, `look_at`, `lens_mm`, and `mode` (first-person, third-person, fixed, top-down, side-on). For first-person this is the eye at the player start |
| `player_start` | Optional `location` and `facing_deg` (0 faces +y) |
| `hide` | Prop ids not present in this scene (a stripped bed, a taken object) |
| `interactions` | `prop`, `verb` (the prompt the player sees), optional `leads_to` (the scene id it opens: a 1D page by push-in, a 2D mode by flatten, or the next 3D scene) |

## Commands

```bash
python tools/check_blender.py [slug]       # validate; also runs assemble_plan.py's own check when the
                                           # Pipelines-Plugin checkout sits beside this repo
python tools/blender/compile.py [slug]     # write build/blender/ (not versioned)
python tools/blender/blockout.py emit build/blender/<slug>/<location>/<scene>/blockout.json
```

## Running one scene in Blender

Inside a studio `assemble-3d` run: put the scene folder's `assembly.json` in the run folder, copy
each Meshy model to `models/<object>.glb` beside it, then run the steps in order (`import`,
`normalize`, `lods`), the blockout code, then `stage`, `save`, `export`, `render`. The blockout code
imports only bpy, math and json, so it runs headless or through the Blender MCP server like the
assembly's own steps. It also adds a `markers` collection with the player start and one empty per
interaction, carrying its verb and target scene as custom properties for the engine export.

The worked example is `games/man-eater/blender/bunk-room.build.json`: one room, thirteen scenes
(day, evening and night lighting, the door at 10:00 on six nights).

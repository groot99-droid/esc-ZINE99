"""Blender build files: load, check, compile. Stdlib only, no Blender needed.

A build file, `games/<slug>/blender/<location>.build.json`, describes one 3D location of a game:
the set's blockout geometry, where each Meshy prop stands, and, for every 3D scene played there,
its lighting, camera, player start, hidden props and interaction points. See docs/BLENDER.md.

`compile_scene` turns one scene of a build file into two files for the studio's assemble-3d
pipeline (Pipelines-Plugin, studio/pipeline/bpy/assemble_plan.py):

- `assembly.json`: the props as assets (`models/<object>.glb`, scaled to their real height), the
  scene's lights, camera, world, render and export. assemble_plan.py runs it unchanged.
- `blockout.json`: the set geometry and materials, which `blockout.py emit` turns into bpy code
  run before the assembly's `stage` step.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SHAPES = {"box", "cylinder", "cone", "sphere", "plane"}
ROLES = {"floor", "wall", "ceiling", "terrain", "structure", "opening", "water", "sky", "trim"}
LIGHT_TYPES = {"SUN", "AREA", "POINT", "SPOT"}
CAMERA_MODES = {"first-person", "third-person", "fixed", "top-down", "side-on"}
MARGIN = 1.15  # pieces may reach 15% past the declared bounds (overlaps at the walls' outer faces)


class BuildError(Exception):
    pass


def vec(v, n=3):
    return isinstance(v, list) and len(v) == n and all(isinstance(x, (int, float)) and not isinstance(x, bool)
                                                       for x in v)


def inside(p, bounds, margin=MARGIN):
    """Origin at the floor centre: x and y run +/- half the bounds, z from 0 to the height."""
    hx, hy, hz = bounds[0] / 2 * margin, bounds[1] / 2 * margin, bounds[2] * margin
    return abs(p[0]) <= hx and abs(p[1]) <= hy and -0.5 <= p[2] <= hz


def check_build(build: dict, slug: str, assets: dict, scene_layer: dict) -> list[str]:
    """Problems with one build file, as sentences. Empty when clean."""
    p: list[str] = []
    loc_id = build.get("location")
    where = f"{slug}/{loc_id}"
    locs = {l["id"]: l for l in assets.get("locations", [])}
    objs = {o["id"]: o for o in assets.get("objects", [])}
    if loc_id not in locs:
        return [f"{where}: location is not in assets.json"]
    loc = locs[loc_id]
    if build.get("game") != slug:
        p.append(f"{where}: game must be '{slug}'")
    if build.get("reference") != loc["image"]:
        p.append(f"{where}: reference must be '{loc['image']}'")
    bounds = build.get("bounds_m")
    if not (vec(bounds) and all(b > 0 for b in bounds)):
        return p + [f"{where}: bounds_m must be [width, depth, height] in metres"]
    mats = build.get("materials") or {}
    if not isinstance(mats, dict) or not mats:
        p.append(f"{where}: materials must name at least one material")
    for name, m in mats.items():
        if not (isinstance(m, dict) and vec(m.get("color")) and all(0 <= c <= 1 for c in m["color"])):
            p.append(f"{where}: material '{name}' needs color [r, g, b] in 0..1")
        for k in ("roughness", "metallic"):
            if k in m and not (isinstance(m[k], (int, float)) and 0 <= m[k] <= 1):
                p.append(f"{where}: material '{name}' {k} is 0..1")
    ids = set()
    blockout = build.get("blockout") or []
    if not blockout:
        p.append(f"{where}: blockout is empty")
    if not any(b.get("role") in ("floor", "terrain", "water") for b in blockout):
        p.append(f"{where}: blockout needs a floor, terrain or water piece to stand on")
    for b in blockout:
        bid = b.get("id")
        w = f"{where} blockout '{bid}'"
        if not bid or bid in ids:
            p.append(f"{w}: id missing or used twice")
        ids.add(bid)
        if b.get("shape") not in SHAPES:
            p.append(f"{w}: shape is one of {sorted(SHAPES)}")
        if b.get("role") not in ROLES:
            p.append(f"{w}: role is one of {sorted(ROLES)}")
        if not (vec(b.get("size_m")) and all(s >= 0 for s in b["size_m"]) and any(s > 0 for s in b["size_m"])):
            p.append(f"{w}: size_m is [x, y, z] metres")
        if not vec(b.get("location")):
            p.append(f"{w}: location is [x, y, z]")
        elif b.get("role") != "sky" and not inside(b["location"], bounds):
            p.append(f"{w}: centre {b['location']} is outside bounds {bounds}")
        if "rotation_deg" in b and not vec(b["rotation_deg"]):
            p.append(f"{w}: rotation_deg is [x, y, z] degrees")
        if b.get("material") not in mats:
            p.append(f"{w}: material '{b.get('material')}' is not defined")
    props = build.get("props") or []
    placed = set()
    for pr in props:
        pid = pr.get("id")
        w = f"{where} prop '{pid}'"
        if not pid or pid in ids:
            p.append(f"{w}: id missing or used twice (prop and blockout ids share one namespace)")
        ids.add(pid)
        if pr.get("object") not in objs:
            p.append(f"{w}: object '{pr.get('object')}' is not in assets.json")
            continue
        placed.add(pr["object"])
        if not vec(pr.get("location")):
            p.append(f"{w}: location is [x, y, z]")
        elif not inside(pr["location"], bounds):
            p.append(f"{w}: {pr['location']} is outside bounds {bounds}")
        if "rotation_deg" in pr and not vec(pr["rotation_deg"]):
            p.append(f"{w}: rotation_deg is [x, y, z] degrees")
        if "height_m" in pr and not (isinstance(pr["height_m"], (int, float)) and pr["height_m"] > 0):
            p.append(f"{w}: height_m is a height above 0")
        if "ground" in pr and not isinstance(pr["ground"], bool):
            p.append(f"{w}: ground is true or false")
    for oid in loc.get("objects", []):
        if oid not in placed:
            p.append(f"{where}: assets.json puts object '{oid}' here but no prop places it")
    prop_ids = {pr.get("id") for pr in props}
    scenes = build.get("scenes") or {}
    want = set(loc.get("scenes", []))
    for sid in sorted(want - set(scenes)):
        p.append(f"{where}: scene '{sid}' has no entry")
    for sid in sorted(set(scenes) - want):
        p.append(f"{where}: scene '{sid}' is not one of this location's scenes in assets.json")
    for sid, sc in scenes.items():
        w = f"{where} scene '{sid}'"
        if not isinstance(sc, dict):
            p.append(f"{w}: must be an object")
            continue
        world = sc.get("world") or {}
        if not (vec(world.get("color")) and isinstance(world.get("strength"), (int, float))):
            p.append(f"{w}: world needs color [r, g, b] and strength")
        lights = sc.get("lights") or []
        if not lights:
            p.append(f"{w}: lights lists at least one light")
        for i, li in enumerate(lights):
            if li.get("type") not in LIGHT_TYPES:
                p.append(f"{w}: lights[{i}].type is one of {sorted(LIGHT_TYPES)}")
            if not vec(li.get("location")):
                p.append(f"{w}: lights[{i}].location is [x, y, z]")
            if "look_at" in li and not vec(li["look_at"]):
                p.append(f"{w}: lights[{i}].look_at is [x, y, z]")
            if not (isinstance(li.get("energy"), (int, float)) and li["energy"] > 0):
                p.append(f"{w}: lights[{i}].energy is above 0")
            if "color" in li and not (vec(li["color"]) and all(0 <= c <= 1 for c in li["color"])):
                p.append(f"{w}: lights[{i}].color is [r, g, b] in 0..1")
        cam = sc.get("camera") or {}
        if not (vec(cam.get("location")) and vec(cam.get("look_at"))):
            p.append(f"{w}: camera needs location and look_at")
        else:
            if not inside(cam["location"], bounds, 1.6):
                p.append(f"{w}: camera {cam['location']} is far outside bounds {bounds}")
            if cam["location"] == cam["look_at"]:
                p.append(f"{w}: camera looks at its own position")
        if cam.get("mode") not in CAMERA_MODES:
            p.append(f"{w}: camera.mode is one of {sorted(CAMERA_MODES)}")
        ps = sc.get("player_start")
        if ps is not None:
            if not (vec(ps.get("location")) and isinstance(ps.get("facing_deg"), (int, float))):
                p.append(f"{w}: player_start needs location and facing_deg")
            elif not inside(ps["location"], bounds):
                p.append(f"{w}: player_start {ps['location']} is outside bounds")
        for h in sc.get("hide", []):
            if h not in prop_ids:
                p.append(f"{w}: hides '{h}', which is not a prop here")
        shown = [pr for pr in props if pr.get("id") not in set(sc.get("hide", []))]
        if not shown:
            p.append(f"{w}: hides every prop; assemble-3d needs at least one")
        for it in sc.get("interactions", []):
            if it.get("prop") not in prop_ids:
                p.append(f"{w}: interaction on '{it.get('prop')}', which is not a prop here")
            if not str(it.get("verb", "")).strip():
                p.append(f"{w}: interaction on '{it.get('prop')}' needs a verb")
            lt = it.get("leads_to")
            if lt is not None and lt not in scene_layer:
                p.append(f"{w}: interaction leads to '{lt}', which is not in scenes.json")
    return p


def compile_scene(build: dict, assets: dict, scene_id: str) -> tuple[dict, dict]:
    """(assembly, blockout) for one scene. Assumes check_build passed."""
    objs = {o["id"]: o for o in assets["objects"]}
    sc = build["scenes"][scene_id]
    hidden = set(sc.get("hide", []))
    assembly_assets = []
    for pr in build["props"]:
        if pr["id"] in hidden:
            continue
        a = {"name": pr["id"], "glb": f"models/{pr['object']}.glb",
             "target_height_m": float(pr.get("height_m") or objs[pr["object"]]["size_m"][2]),
             "location": pr["location"], "rotation_deg": pr.get("rotation_deg", [0, 0, 0]),
             "ground": pr.get("ground", True)}
        assembly_assets.append(a)
    lights = []
    for i, li in enumerate(sc["lights"]):
        e = {"name": li.get("name") or f"light-{i}", "type": li["type"], "location": li["location"],
             "energy": li["energy"], "size": li.get("size", 1)}
        if "look_at" in li:
            e["look_at"] = li["look_at"]
        elif "rotation_deg" in li:
            e["rotation_deg"] = li["rotation_deg"]
        lights.append(e)
    cam = sc["camera"]
    assembly = {
        "assets": assembly_assets,
        "floor": None,
        "lights": lights,
        "camera": {"location": cam["location"], "look_at": cam["look_at"], "lens_mm": cam.get("lens_mm", 35)},
        "world": sc["world"],
        "render": {"engine": "eevee", "samples": 64, "resolution": [1280, 720], "file": f"{scene_id}.png",
                   "transparent": False},
        "export": {"blend": f"{scene_id}.blend", "glb": f"{scene_id}.glb", "include_floor": False},
    }
    blockout = {
        "game": build["game"], "location": build["location"], "scene": scene_id,
        "materials": build["materials"], "pieces": build["blockout"],
        "light_colors": {(li.get("name") or f"light-{i}"): li["color"]
                         for i, li in enumerate(sc["lights"]) if "color" in li},
        "player_start": sc.get("player_start"),
        "interactions": sc.get("interactions", []),
    }
    return assembly, blockout


def load_game(slug: str):
    folder = ROOT / "games" / slug
    assets = json.loads((folder / "assets" / "assets.json").read_text(encoding="utf-8"))
    scenes = json.loads((folder / "data" / "scenes.json").read_text(encoding="utf-8"))["scenes"]
    layer = {s["id"]: s["layer"] for s in scenes}
    builds = {}
    for f in sorted((folder / "blender").glob("*.build.json")):
        try:
            builds[f.name[: -len(".build.json")]] = json.loads(f.read_text(encoding="utf-8"))
        except ValueError as e:
            raise BuildError(f"{f.relative_to(ROOT)}: not valid JSON ({e})")
    return assets, layer, builds


#!/usr/bin/env python3
"""Check each game's Blender build files against its assets and scenes.

    python tools/check_blender.py            # every game with games/<slug>/blender/
    python tools/check_blender.py man-eater  # one game

Every location in assets/assets.json has exactly one `blender/<location>.build.json`; every 3D scene
played there has a scene entry; every prop is an object from assets.json, and every object the
location lists is placed; positions sit inside the set's bounds; interactions point at real props
and scenes. Each scene is then compiled, the blockout's bpy code is syntax-checked, and when the
Pipelines-Plugin checkout sits beside this repo, its assemble_plan.py checks the compiled
assembly exactly as assemble-3d will. Stdlib only. Exit 0 when clean, 1 when not.
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "blender"))
from build_lib import ROOT, BuildError, check_build, compile_scene, load_game  # noqa: E402
from blockout import code_for  # noqa: E402

PLAN = ROOT.parent / "Pipelines-Plugin" / "studio" / "pipeline" / "bpy" / "assemble_plan.py"


def assemble_plan():
    if not PLAN.is_file():
        return None
    spec = importlib.util.spec_from_file_location("assemble_plan", PLAN)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main(argv):
    slugs = argv or sorted(p.name for p in (ROOT / "games").iterdir() if (p / "blender").is_dir())
    plan = assemble_plan()
    problems: list[str] = []
    scenes_checked = 0
    for slug in slugs:
        try:
            assets, layer, builds = load_game(slug)
        except (BuildError, FileNotFoundError) as e:
            problems.append(f"{slug}: {e}")
            continue
        loc_ids = {l["id"] for l in assets.get("locations", [])}
        for missing in sorted(loc_ids - set(builds)):
            problems.append(f"{slug}: location '{missing}' has no blender/{missing}.build.json")
        for name, build in builds.items():
            if build.get("location") != name:
                problems.append(f"{slug}: {name}.build.json says location '{build.get('location')}'")
            if name not in loc_ids:
                problems.append(f"{slug}: {name}.build.json names no location in assets.json")
                continue
            found = check_build(build, slug, assets, layer)
            problems += found
            if found:
                continue
            for sid in build["scenes"]:
                assembly, blockout = compile_scene(build, assets, sid)
                try:
                    compile(code_for(blockout), f"{slug}/{name}/{sid}/blockout", "exec")
                except SyntaxError as e:
                    problems.append(f"{slug}/{name} scene '{sid}': blockout code does not compile ({e})")
                if plan is not None:
                    base = ROOT / "build" / "blender" / slug / name / sid
                    try:
                        plan.resolve(assembly, base, base / "out")
                    except plan.Invalid as e:
                        problems.append(f"{slug}/{name} scene '{sid}': assemble_plan refuses it: {e}")
                scenes_checked += 1
    for x in problems:
        print(x)
    tail = "" if plan else " (assemble_plan.py not found beside this repo; that check skipped)"
    print(f"ok   blender ({len(slugs)} games, {scenes_checked} scenes){tail}" if not problems
          else f"FAIL blender ({len(problems)} problems)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

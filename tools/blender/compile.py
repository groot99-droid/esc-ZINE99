#!/usr/bin/env python3
"""Compile Blender build files into assemble-3d layouts, one folder per 3D scene.

    python tools/blender/compile.py                 # every game
    python tools/blender/compile.py man-eater       # one game

Writes `build/blender/<slug>/<location>/<scene>/assembly.json` (run unchanged by the studio's
assemble-3d: Pipelines-Plugin, studio/pipeline/bpy/assemble_plan.py) and `blockout.json` beside it
(turned into bpy code by tools/blender/blockout.py). The assembly expects each prop's Meshy model
at `models/<object>.glb` inside the scene folder; copy or link them there before running it.
build/ is generated and not versioned. Refuses to write anything for a game whose build files do
not pass tools/check_blender.py.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_lib import ROOT, check_build, compile_scene, load_game  # noqa: E402

OUT = ROOT / "build" / "blender"


def main(argv):
    slugs = argv or sorted(p.parent.parent.name for p in (ROOT / "games").glob("*/blender/*.build.json"))
    slugs = sorted(set(slugs))
    written = 0
    for slug in slugs:
        assets, layer, builds = load_game(slug)
        problems = [x for b in builds.values() for x in check_build(b, slug, assets, layer)]
        if problems:
            for x in problems:
                print(x)
            print(f"FAIL {slug}: not compiled; fix the build files first")
            return 1
        for loc, build in builds.items():
            for sid in build["scenes"]:
                assembly, blockout = compile_scene(build, assets, sid)
                folder = OUT / slug / loc / sid
                folder.mkdir(parents=True, exist_ok=True)
                (folder / "assembly.json").write_text(json.dumps(assembly, indent=2) + "\n", encoding="utf-8")
                (folder / "blockout.json").write_text(json.dumps(blockout, indent=2) + "\n", encoding="utf-8")
                written += 1
        print(f"ok   {slug}: {sum(len(b['scenes']) for b in builds.values())} scenes")
    print(f"wrote {written} scene folders under {OUT.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

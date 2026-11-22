#!/usr/bin/env python3
"""Package one game's compiled scenes for tools/render/render_scenes.py.

    python tools/render/pack.py dr-tox-rise <out dir>          # compiles first (tools/blender/compile.py)

Writes <out dir>/pack/ (manifest.json, rig.json, overrides.json, scenes/<location>/<scene>/{assembly,blockout,props}.json,
blender_tools/blockout.py) and <out dir>/pack.tgz. The manifest gives each scene its tier from
docs/blender_plans/plans.json (hero 2560x1440 at 256 samples, otherwise 1920x1080 at 128), its player start, and
which scene carries the location's overview still (rig.json: "overview_scene"). No build file is edited.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "blender"))
from build_lib import load_game  # noqa: E402

TIERS = {"hero": ([2560, 1440], 256), "standard": ([1920, 1080], 128)}


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    slug, out = argv[0], Path(argv[1]).resolve()
    subprocess.run([sys.executable, str(ROOT / "tools" / "blender" / "compile.py"), slug], check=True, cwd=ROOT)
    assets, _layer, builds = load_game(slug)
    objs = {o["id"]: o for o in assets["objects"]}
    plans = {(e["location"], e["scene"]): e for e in json.loads(
        (ROOT / "docs" / "blender_plans" / "plans.json").read_text(encoding="utf-8"))["scenes"] if e["game"] == slug}
    rig = json.loads((Path(__file__).parent / "rig.json").read_text(encoding="utf-8"))
    pack = out / "pack"
    if pack.exists():
        shutil.rmtree(pack)
    (pack / "blender_tools").mkdir(parents=True)
    shutil.copy(ROOT / "tools" / "blender" / "blockout.py", pack / "blender_tools" / "blockout.py")
    shutil.copy(Path(__file__).parent / "rig.json", pack / "rig.json")
    shutil.copy(Path(__file__).parent / "overrides.json", pack / "overrides.json")
    manifest = {"game": slug, "scenes": []}
    for loc, build in builds.items():
        for sid, sc in build["scenes"].items():
            src = ROOT / "build" / "blender" / slug / loc / sid
            dst = pack / "scenes" / loc / sid
            dst.mkdir(parents=True)
            asm = json.loads((src / "assembly.json").read_text(encoding="utf-8"))
            shutil.copy(src / "blockout.json", dst / "blockout.json")
            shutil.copy(src / "assembly.json", dst / "assembly.json")
            props = []
            for a in asm["assets"]:
                oid = Path(a["glb"]).stem
                props.append({"id": a["name"], "object": oid, "role": objs[oid]["role"], "size_m": objs[oid]["size_m"],
                              "target_height_m": a["target_height_m"], "location": a["location"],
                              "rotation_deg": a["rotation_deg"], "ground": a["ground"]})
            (dst / "props.json").write_text(json.dumps(props, indent=1), encoding="utf-8")
            plan = plans[(loc, sid)]
            tier = "hero" if plan["hero"] else "standard"
            res, samples = TIERS[tier]
            lrig = rig.get(loc, {})
            manifest["scenes"].append({
                "location": loc, "scene": sid, "tier": tier, "resolution": res, "samples": samples,
                "camera_mode": sc["camera"]["mode"], "player_start": sc.get("player_start"),
                "overview": {} if lrig.get("overview_scene") == sid else None,
            })
    (pack / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    tgz = out / "pack.tgz"
    with tarfile.open(tgz, "w:gz") as t:
        t.add(pack, arcname="pack")
    print(f"packed {len(manifest['scenes'])} scenes -> {tgz}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

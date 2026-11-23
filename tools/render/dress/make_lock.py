#!/usr/bin/env python3
"""Build dress.lock.json from scans that are already on disk (no network).

    python tools/render/dress/make_lock.py --cave-lock <polyhaven.lock.json> --src <scan folder> --dest <cache dir> [--lock dress.lock.json]

For every folder in --src that the cave lock describes: md5 of every file on disk (compared with the cave lock's md5), the
mean linear albedo of the largest diffuse map and the mean roughness (these feed the tone-lock in materials.py), then a copy of
the files into --dest (git-ignored `build/dress-cache/`). The lock holds names, sources, licences, URLs, sizes and md5s: no
absolute paths. Polyhaven textures are CC0-1.0. Re-running reproduces the same file.
"""
import argparse
import hashlib
import json
import os
import shutil
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))


def md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def srgb_to_lin(a):
    a = a / 255.0
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)


def best(files, kind):
    cand = [f for f in files if "_%s_" % kind in f]
    return sorted(cand, key=lambda f: (-int(f.rsplit("_", 1)[1][:-5].replace("k", "") or 0), f))[0] if cand else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cave-lock", required=True)
    ap.add_argument("--src", required=True)
    ap.add_argument("--dest", required=True)
    ap.add_argument("--lock", default=os.path.join(HERE, "dress.lock.json"))
    a = ap.parse_args()
    cave = json.load(open(a.cave_lock, encoding="utf-8"))
    out = {"version": 1, "description": "Textures the dressing layer may use, with licence, source and md5. No downloads are made from this repo.",
           "sources": {"polyhaven": {"site": "https://polyhaven.com", "licence": "CC0-1.0", "licenceUrl": "https://polyhaven.com/license"}},
           "assets": {}, "totals": {}}
    total_files = total_bytes = 0
    for name in sorted(os.listdir(a.src)):
        d = os.path.join(a.src, name)
        if not os.path.isdir(d) or name not in cave["assets"]:
            continue
        ca = cave["assets"][name]
        files = sorted(os.listdir(d))
        # md5 table of the cave lock, by file name
        lockmd5 = {}
        for res, kinds in ca.get("files", {}).items():
            for k, rec in kinds.items():
                lockmd5[rec["file"]] = (rec["md5"], rec.get("url"))
        recs = {}
        for f in files:
            p = os.path.join(d, f)
            m = md5(p)
            lm = lockmd5.get(f)
            recs[f] = {"md5": m, "size": os.path.getsize(p), "matches_cave_lock": bool(lm and lm[0] == m), "url": lm[1] if lm else None}
            total_files += 1
            total_bytes += recs[f]["size"]
        dn, rn = best(files, "diff"), best(files, "rough")
        alb = (srgb_to_lin(np.asarray(Image.open(os.path.join(d, dn)).convert("RGB"), dtype=np.float64)).reshape(-1, 3).mean(0)
               if dn else None)
        rough = float(np.asarray(Image.open(os.path.join(d, rn)).convert("L"), dtype=np.float64).mean() / 255.0) if rn else None
        out["assets"][name] = {"source": "polyhaven", "type": ca.get("type", "texture"), "name": ca.get("name"), "authors": ca.get("authors"),
                               "licence": "CC0-1.0", "dimensions_mm": ca.get("dimensionsMm"), "files": recs,
                               "mean_albedo_linear": [round(float(x), 5) for x in alb] if alb is not None else None,
                               "mean_roughness": round(rough, 5) if rough is not None else None,
                               "albedo_file": dn, "roughness_file": rn}
        os.makedirs(os.path.join(a.dest, name), exist_ok=True)
        for f in files:
            shutil.copy2(os.path.join(d, f), os.path.join(a.dest, name, f))
    out["totals"] = {"assets": len(out["assets"]), "files": total_files, "bytes": total_bytes, "mb_decimal": round(total_bytes / 1e6, 1)}
    with open(a.lock, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1, sort_keys=True)
        f.write("\n")
    bad = [(n, f) for n, v in out["assets"].items() for f, r in v["files"].items() if not r["matches_cave_lock"]]
    print("assets", out["totals"], "md5 mismatches vs cave lock:", bad)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Merge approved Poly Haven assets that are already on disk into dress.lock.json (no network).

    python tools/render/dress/add_assets.py --src <folder> --dest <cache dir> [--md5-map <json>] [--lock dress.lock.json]

`--src` holds texture folders (`<slug>/<slug>_diff_1k.jpg` ...), `hdri/<file>.hdr` and `models/<slug>/...`. For each: md5 of every file (checked
against `--md5-map`, a {"<slug>/<file>": "<md5>"} map or {"files": {...}}, where it has an entry), the mean linear albedo and roughness
of the largest maps (these feed the tone-lock in materials.py), and a copy into `<cache dir>` (git-ignored `build/dress-cache/`):
textures to `textures/<slug>`, hdris to `hdri/`, models to `models/<slug>`. Licence is CC0-1.0, source polyhaven.com. The lock holds
names, urls, sizes and md5s and no absolute paths. Re-running reproduces the same entries.
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
    cand = [f for f in files if "_%s_" % kind in f and f.endswith(".jpg")]

    def res(f):
        t = f.rsplit("_", 1)[1][:-4].replace("k", "")
        return int(t) if t.isdigit() else 0
    return sorted(cand, key=lambda f: (-res(f), f))[0] if cand else None


def files_of(d):
    out = []
    for root, _, fl in os.walk(d):
        for f in fl:
            out.append(os.path.relpath(os.path.join(root, f), d).replace(os.sep, "/"))
    return sorted(out)


def record(d, slug, kind, given):
    recs, check = {}, []
    for rel in files_of(d):
        p = os.path.join(d, rel)
        m = md5(p)
        g = given.get("%s/%s" % (slug, rel))
        recs[rel] = {"md5": m, "size": os.path.getsize(p), "matches_given_md5": (g == m) if g else None}
        if g and g != m:
            check.append((slug, rel))
    return recs, check


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--dest", required=True)
    ap.add_argument("--md5-map")
    ap.add_argument("--lock", default=os.path.join(HERE, "dress.lock.json"))
    a = ap.parse_args()
    given = {}
    if a.md5_map:
        j = json.load(open(a.md5_map, encoding="utf-8"))
        given = j.get("files", j)
    lock = json.load(open(a.lock, encoding="utf-8"))
    lock.setdefault("hdris", {})
    lock.setdefault("models", {})
    bad = []
    for name in sorted(os.listdir(a.src)):
        d = os.path.join(a.src, name)
        if not os.path.isdir(d):
            continue
        if name == "hdri":
            for f in sorted(os.listdir(d)):
                p = os.path.join(d, f)
                m = md5(p)
                g = given.get("hdri/" + f)
                slug = f.rsplit("_", 1)[0] if f.rsplit("_", 1)[-1].startswith("2k") or f.rsplit("_", 1)[-1].startswith("1k") else f
                lock["hdris"][f] = {"source": "polyhaven", "licence": "CC0-1.0", "url": "https://polyhaven.com/a/" + slug, "md5": m,
                                    "size": os.path.getsize(p), "matches_given_md5": (g == m) if g else None}
                if g and g != m:
                    bad.append(("hdri", f))
            os.makedirs(os.path.join(a.dest, "hdri"), exist_ok=True)
            for f in os.listdir(d):
                shutil.copy2(os.path.join(d, f), os.path.join(a.dest, "hdri", f))
        elif name == "models":
            for slug in sorted(os.listdir(d)):
                md = os.path.join(d, slug)
                recs, chk = record(md, "models/" + slug, "model", given)
                bad += chk
                lock["models"][slug] = {"source": "polyhaven", "licence": "CC0-1.0", "url": "https://polyhaven.com/a/" + slug, "files": recs}
                shutil.copytree(md, os.path.join(a.dest, "models", slug), dirs_exist_ok=True)
        else:
            recs, chk = record(d, name, "texture", given)
            bad += chk
            fl = list(recs)
            dn, rn = best(fl, "diff"), best(fl, "rough")
            alb = (srgb_to_lin(np.asarray(Image.open(os.path.join(d, dn)).convert("RGB"), dtype=np.float64)).reshape(-1, 3).mean(0)
                   if dn else None)
            rough = float(np.asarray(Image.open(os.path.join(d, rn)).convert("L"), dtype=np.float64).mean() / 255.0) if rn else None
            lock["assets"][name] = {"source": "polyhaven", "type": "texture", "name": name.replace("_", " ").title(), "licence": "CC0-1.0",
                                    "url": "https://polyhaven.com/a/" + name, "files": recs,
                                    "mean_albedo_linear": [round(float(x), 5) for x in alb] if alb is not None else None,
                                    "mean_roughness": round(rough, 5) if rough is not None else None, "albedo_file": dn, "roughness_file": rn}
            shutil.copytree(d, os.path.join(a.dest, "textures", name), dirs_exist_ok=True)
    nf = sum(len(v["files"]) for v in lock["assets"].values()) + len(lock["hdris"]) + sum(len(v["files"]) for v in lock["models"].values())
    nb = (sum(r["size"] for v in lock["assets"].values() for r in v["files"].values()) + sum(v["size"] for v in lock["hdris"].values())
          + sum(r["size"] for v in lock["models"].values() for r in v["files"].values()))
    lock["totals"] = {"assets": len(lock["assets"]), "hdris": len(lock["hdris"]), "models": len(lock["models"]), "files": nf, "bytes": nb,
                      "mb_decimal": round(nb / 1e6, 1)}
    lock["description"] = ("Textures, hdris and models the dressing layer may use, with licence, source and md5. No downloads are made from this repo.")
    with open(a.lock, "w", encoding="utf-8") as f:
        json.dump(lock, f, indent=1, sort_keys=True)
        f.write("\n")
    print("lock totals", lock["totals"], "md5 mismatches vs given:", bad)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())

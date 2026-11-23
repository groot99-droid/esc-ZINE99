"""Describe every still of a run folder with measure.describe and write one metrics json per still.

    python batch_describe.py <run dir> <metrics dir> [--ref-root <folder holding games/<slug>/assets/locations>] [--tiling 1] [--shard i/n]
    blender -b --python batch_describe.py -- <run dir> <metrics dir> ...      (on a render box without Pillow: Blender's own image code is used)

A run folder is what render_scenes.py wrote: <run>/<location>/<scene>.json with <scene>/<still>.png and <still>_id.png beside it
(the overview is <location>/_overview/overview.png in the scene json of the location's overview scene). Metrics are written to
<metrics dir>/<location>__<scene>__<still>.json. Stills that already have a metrics file are skipped.
"""
import json
import os
import sys
from concurrent.futures import ProcessPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dress import measure  # noqa: E402


def _args():
    a = sys.argv
    return a[a.index("--") + 1:] if "--" in a else a[1:]


def _one(job):
    png, idp, sj, still, out, ref, tiling = job
    if os.path.exists(out):
        return out, "skipped"
    m = measure.describe(png, idp, sj, still, ref, tiling)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(m, f)
    return out, "ok"


def jobs_for(run, mdir, ref_root, game, tiling):
    jobs = []
    for loc in sorted(os.listdir(run)):
        ld = os.path.join(run, loc)
        if not os.path.isdir(ld):
            continue
        for fn in sorted(os.listdir(ld)):
            if not fn.endswith(".json"):
                continue
            scene = fn[:-5]
            sj = os.path.join(ld, fn)
            rec = json.load(open(sj, encoding="utf-8"))
            for st in rec.get("stills", []):
                png = os.path.join(run, st["file"])
                idp = os.path.join(run, st["id_file"]) if st.get("id_file") else None
                ref = None
                if st["still"] == "overview" and ref_root:
                    rp = os.path.join(ref_root, "games", game, "assets", "locations", loc + ".jpg")
                    ref = rp if os.path.exists(rp) else None
                out = os.path.join(mdir, "%s__%s__%s.json" % (loc, scene, st["still"]))
                if os.path.exists(png):
                    jobs.append((png, idp, sj, st["still"], out, ref, tiling))
    return jobs


def main():
    a = _args()
    run, mdir = a[0], a[1]
    ref_root = a[a.index("--ref-root") + 1] if "--ref-root" in a else None
    tiling = "--tiling" in a and a[a.index("--tiling") + 1] == "1"
    nj = int(a[a.index("--jobs") + 1]) if "--jobs" in a else 1
    game = os.path.basename(os.path.normpath(run))
    os.makedirs(mdir, exist_ok=True)
    jobs = jobs_for(run, mdir, ref_root, game, tiling)
    if "--shard" in a:  # --shard i/n: this process takes every n-th still (several processes can run side by side)
        i, n = (int(x) for x in a[a.index("--shard") + 1].split("/"))
        jobs = jobs[i::n]
    done = 0
    if nj > 1:
        with ProcessPoolExecutor(nj) as ex:
            for _o, _s in ex.map(_one, jobs):
                done += 1
    else:
        for j in jobs:
            _one(j)
            done += 1
    print("described", done, "stills ->", mdir)


if __name__ == "__main__":
    main()

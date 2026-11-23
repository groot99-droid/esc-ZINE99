"""Apply the gates to a before run and an after run that were described with batch_describe.py.

    python report.py <before dir> <after dir> <out json> [--thresholds t.json] [--locs a,b]

<dir> holds `metrics/<game>/<loc>__<scene>__<still>.json` and `out/<game>/<loc>/<scene>.json` (the layout the box helpers collect).
Writes every gate result per still to <out json> and prints a table of pass counts per gate and the failing stills.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dress import measure, rules  # noqa: E402


def _jl(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def collect(d):
    out = {}
    for game in sorted(os.listdir(os.path.join(d, "metrics"))):
        for fn in sorted(os.listdir(os.path.join(d, "metrics", game))):
            loc, scene, still = fn[:-5].split("__")
            out[(game, loc, scene, still)] = os.path.join(d, "metrics", game, fn)
    return out


def main():
    a = sys.argv
    bdir, adir, outp = a[1:4]
    T = _jl(a[a.index("--thresholds") + 1]) if "--thresholds" in a else None
    T = T.get("thresholds", T) if T else T
    keep = set(a[a.index("--locs") + 1].split(",")) if "--locs" in a else None
    mb, ma = collect(bdir), collect(adir)
    rl = rules.load(os.path.dirname(os.path.abspath(__file__)))
    res, tally, fails, scenes = {}, {}, [], {}
    for key in sorted(ma):
        if key not in mb or (keep and key[1] not in keep):
            continue
        game, loc, scene, still = key
        sb = _jl(os.path.join(bdir, "out", game, loc, scene + ".json"))
        sa = _jl(os.path.join(adir, "out", game, loc, scene + ".json"))
        gates = measure.compare(_jl(mb[key]), _jl(ma[key]), sb, sa, T, still)
        gates.append(measure.g15_rules(sa, rl))
        res["/".join(key)] = gates
        scenes.setdefault((game, loc), []).append(os.path.join(adir, "out", game, loc, scene + ".json"))
        for g in gates:
            t = tally.setdefault(g["gate"], {"pass": 0, "fail": 0, "n/a": 0})
            t["n/a" if g["pass"] is None else ("pass" if g["pass"] else "fail")] += 1
            if g["pass"] is False:
                fails.append(("/".join(key), g["gate"], g["value"], g["limit"]))
    for (game, loc), paths in scenes.items():
        res["layout/%s/%s" % (game, loc)] = measure.g14_layout(paths)
    with open(outp, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=1)
    for g in sorted(tally):
        print("%-5s pass %-4d fail %-4d n/a %-4d" % (g, tally[g]["pass"], tally[g]["fail"], tally[g]["n/a"]))
    print("failing stills:", len(fails))
    for x in fails[:80]:
        print("  ", x[0], x[1], str(x[2])[:60], x[3])


if __name__ == "__main__":
    main()

"""Noise-floor calibration of the gates (P0).

    python calibrate.py noise <metricsA dir> <metricsB dir> <sceneA run dir> <sceneB run dir> <out dir>
        two independent renders of the same scenes (different Cycles seeds, no dressing): how much each gate's number moves by noise alone.
    python calibrate.py control <scan file> [<scan file> ...]
        the G8 positive control: an undressed 4 x 4 tiling of each scan must score over 0.5 on the tiling detector.

`noise` writes <out dir>/noise_floor.json (the observed spread per gate) and thresholds.calibrated.json (plan thresholds, raised
only where the noise floor times 1.5 is above them; every raised gate says so). measure.compare reads the latter with --thresholds.
"""
import json
import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dress import measure  # noqa: E402


def _jl(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _collect(d):
    """{(game, file): path} from a metrics dir that is flat (one game) or holds one folder per game."""
    out = {}
    for n in sorted(os.listdir(d)):
        p = os.path.join(d, n)
        if os.path.isdir(p):
            for f in sorted(os.listdir(p)):
                if f.endswith(".json"):
                    out[(n, f)] = os.path.join(p, f)
        elif n.endswith(".json"):
            out[("", n)] = p
    return out


def noise(dirA, dirB, runA, runB, out):
    """dirA/dirB: metrics folders (flat or per game); runA/runB: the matching `out/<run>` folders (`<game>/<loc>/<scene>.json`)."""
    os.makedirs(out, exist_ok=True)
    ca, cb = _collect(dirA), _collect(dirB)
    keys = sorted(k for k in ca if k in cb)
    obs = {k: [] for k in ("g2_rel", "g3_frame_de", "g3_region_de", "g4_dark_pts", "g4_p01_codes", "g5_specks", "g6_foreign", "g7_gain", "g8_peak", "g10_prop_ratio", "g11_rel", "g13_seconds_ratio")}
    per = []
    for kk in keys:
        game, k = kk
        a, b = _jl(ca[kk]), _jl(cb[kk])
        loc, scene, still = k[:-5].split("__")
        sa = sb = None
        for run, nm in ((runA, "a"), (runB, "b")):
            p = os.path.join(run, game, loc, scene + ".json")
            if os.path.exists(p):
                if nm == "a":
                    sa = _jl(p)
                else:
                    sb = _jl(p)
        obs["g2_rel"].append(max(abs(b["mean_luma"] / max(a["mean_luma"], 1e-6) - 1), abs(b["median_luma"] / max(a["median_luma"], 1e-6) - 1)))
        obs["g3_frame_de"].append(float(np.linalg.norm(np.array(a["lab_mean"]) - np.array(b["lab_mean"]))))
        for g, ga in a["groups"].items():
            gb = b["groups"].get(g)
            if not gb:
                continue
            if ga["area"] >= measure.PLAN["g8_min_area"]:
                obs["g3_region_de"].append(float(np.linalg.norm(np.array(ga["lab"]) - np.array(gb["lab"]))))
            if ga.get("energy") and gb.get("energy") and ga["area"] >= 0.04:
                obs["g7_gain"].append(gb["energy"] / ga["energy"])
            if g.startswith("prop:") and ga["area"] >= 0.001:
                obs["g10_prop_ratio"].append(gb["area"] / ga["area"])
            if "patch_luma" in ga and "patch_luma" in gb:
                obs["g11_rel"].append(float(np.mean([abs(x - y) / max(y, 0.02) for x, y in zip(gb["patch_luma"], ga["patch_luma"])])))
            if ga.get("tiling_peak") is not None:
                obs["g8_peak"].append(ga["tiling_peak"])
        obs["g4_dark_pts"].append(abs(b["dark_share"] - a["dark_share"]) * 100)
        obs["g4_p01_codes"].append(abs(b["p01_luma"] - a["p01_luma"]) * 255)
        obs["g5_specks"].append(abs(b["specks"] - a["specks"]))
        if a.get("foreign_share") is not None and b.get("foreign_share") is not None:
            obs["g6_foreign"].append(abs(b["foreign_share"] - a["foreign_share"]) * 100)
        if sa and sb:
            ta = next((s["seconds"] for s in sa["stills"] if s["still"] == still), None)
            tb = next((s["seconds"] for s in sb["stills"] if s["still"] == still), None)
            if ta and tb:
                obs["g13_seconds_ratio"].append(max(ta, tb) / min(ta, tb))
        per.append("%s/%s" % (game, k[:-5]))
    summ = {k: ({"n": len(v), "max": round(max(v), 5), "p95": round(float(np.percentile(v, 95)), 5), "min": round(min(v), 5), "mean": round(float(np.mean(v)), 5)} if v else None) for k, v in obs.items()}
    summ["stills"] = per
    P = measure.PLAN
    T, notes = {}, []

    def raise_if(key, noise_val, plan, factor=1.5, name=None):
        if noise_val is not None and noise_val * factor > plan:
            T[key] = round(noise_val * factor, 5)
            notes.append("%s raised from %s to %s (noise max %.4g)" % (key, plan, T[key], noise_val))
        else:
            T[key] = plan

    g = lambda k: summ[k]["max"] if summ[k] else None
    raise_if("g2_rel", g("g2_rel"), P["g2_rel"])
    raise_if("g3_frame_de", g("g3_frame_de"), P["g3_frame_de"])
    raise_if("g3_region_de", g("g3_region_de"), P["g3_region_de"])
    raise_if("g4_dark_pts", g("g4_dark_pts"), P["g4_dark_pts"])
    raise_if("g4_p01_codes", g("g4_p01_codes"), P["g4_p01_codes"])
    T["g5_specks_extra"] = int(math.ceil(g("g5_specks") or 0))
    raise_if("g11_rel", g("g11_rel"), P["g11_rel"])
    if summ["g10_prop_ratio"]:
        T["g10_prop_min"] = round(min(P["g10_prop_min"], summ["g10_prop_ratio"]["min"] - 0.01 if summ["g10_prop_ratio"]["min"] < P["g10_prop_min"] else P["g10_prop_min"]), 4)
    if summ["g7_gain"]:
        T["g7_min"] = round(max(P["g7_min"], 1 + 3 * (summ["g7_gain"]["max"] - 1)), 3)
    T["g13_seconds_x"] = P["g13_seconds_x"] if not summ["g13_seconds_ratio"] else max(P["g13_seconds_x"], round(summ["g13_seconds_ratio"]["max"] * 1.5, 2))
    full = dict(P, **T)
    with open(os.path.join(out, "noise_floor.json"), "w", encoding="utf-8") as f:
        json.dump(summ, f, indent=1)
    with open(os.path.join(out, "thresholds.calibrated.json"), "w", encoding="utf-8") as f:
        json.dump({"thresholds": full, "changed_from_plan": notes, "basis": "two independent renders (different Cycles seeds) of %d stills" % len(per)}, f, indent=1)
    print("noise floor over", len(per), "stills")
    for n in notes:
        print(" ", n)
    return full


def control(paths):
    ok = True
    for p in paths:
        v = measure.g8_positive_control(p)
        print("G8 control %-48s peak %.3f %s" % (os.path.basename(p), v, "ok" if v > measure.PLAN["g8_control_min"] else "DETECTOR REJECTED"))
        ok = ok and v > measure.PLAN["g8_control_min"]
    return 0 if ok else 1


if __name__ == "__main__":
    if sys.argv[1] == "noise":
        noise(*sys.argv[2:7])
    elif sys.argv[1] == "control":
        sys.exit(control(sys.argv[2:]))

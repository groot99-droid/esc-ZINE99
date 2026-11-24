"""Per-material albedo gains and tints from a before run and a dressed run (R1: the cabin's tone is fixed in the materials, not in the
exposure). Pure Python + numpy, no Blender.

    python gains.py <before dir> <after dir> <out json> [--locs a,b] [--apply <dress dir>] [--damp 0.8]

<dir> has the report.py layout (`metrics/<game>/<loc>__<scene>__<still>.json`, `out/<game>/<loc>/<scene>.json`). For every dressed
piece region seen in a still, the mean Lab colour before and after is turned back into linear RGB; the area-weighted ratio of the
before luminance to the after luminance over all stills of a location is the gain that would bring that material's rendered tone back
to the build file's, and the per-channel ratio (normalised to luminance 1) is a tint that removes a colour drift. Gains are damped
(`--damp`, default 0.8: 80 % of the way) and clamped to 0.6..1.6, tints to 0.85..1.15 per channel. `--apply` multiplies them into the
`gain` and `tint` of the matching `materials.<name>` or `pieces.<id>` entry of `<game>.dress.json` (pieces with their own entry
are keyed `<material>@<piece>` in the scene json).
"""
import json
import os
import sys

import numpy as np


def _jl(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def lab_to_linear(lab):
    """CIE Lab (D65) to linear sRGB (inverse of measure.srgb_to_lab before its sRGB decode)."""
    L, a, b = lab
    fy = (L + 16.0) / 116.0
    fx = fy + a / 500.0
    fz = fy - b / 200.0

    def finv(t):
        return t ** 3 if t ** 3 > 0.008856 else (t - 16.0 / 116.0) / 7.787

    xyz = np.array([finv(fx) * 0.95047, finv(fy) * 1.0, finv(fz) * 1.08883])
    m = np.array([[3.2404542, -1.5371385, -0.4985314], [-0.9692660, 1.8760108, 0.0415560], [0.0556434, -0.2040259, 1.0572252]])
    return np.maximum(m @ xyz, 1e-6)


def _lum(rgb):
    return float(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2])


def region_pairs(bdir, adir, locs=None):
    """Yield (game, loc, material key, area, before lab, after lab) for every dressed piece region present before and after."""
    mdir = os.path.join(adir, "metrics")
    for game in sorted(os.listdir(mdir)):
        for fn in sorted(os.listdir(os.path.join(mdir, game))):
            loc, scene, still = fn[:-5].split("__")
            if locs and loc not in locs:
                continue
            pb = os.path.join(bdir, "metrics", game, fn)
            if not os.path.exists(pb):
                continue
            ma, mb = _jl(os.path.join(mdir, game, fn)), _jl(pb)
            sa = _jl(os.path.join(adir, "out", game, loc, scene + ".json"))
            dr = sa.get("dress", {})
            pm = dr.get("piece_materials", {})
            dressed = set(dr.get("dressed_pieces", []))
            for k, g in ma.get("groups", {}).items():
                if not k.startswith("piece:"):
                    continue
                pid = k[6:]
                if pid not in dressed or k not in mb.get("groups", {}):
                    continue
                yield game, loc, pm.get(pid, pid), g["area"], mb["groups"][k]["lab"], g["lab"]


def suggest(pairs, damp=0.8, gmin=0.6, gmax=1.6, tmin=0.85, tmax=1.15):
    acc = {}
    for game, loc, key, area, lb, la in pairs:
        cb, ca = lab_to_linear(lb), lab_to_linear(la)
        e = acc.setdefault((game, loc, key), {"w": 0.0, "lb": 0.0, "la": 0.0, "cb": np.zeros(3), "ca": np.zeros(3), "de": 0.0, "n": 0})
        e["w"] += area
        e["lb"] += area * _lum(cb)
        e["la"] += area * _lum(ca)
        e["cb"] += area * cb
        e["ca"] += area * ca
        e["de"] = max(e["de"], float(np.linalg.norm(np.array(la) - np.array(lb))))
        e["n"] += 1
    out = {}
    for (game, loc, key), e in sorted(acc.items()):
        g = (e["lb"] / max(e["la"], 1e-9))
        g = float(np.clip(1.0 + damp * (g - 1.0), gmin, gmax))
        cb, ca = e["cb"] / e["w"], e["ca"] / e["w"]
        t = (cb / max(_lum(cb), 1e-9)) / (ca / max(_lum(ca), 1e-9))
        t = t / _lum(t)
        t = np.clip(1.0 + damp * (t - 1.0), tmin, tmax)
        out.setdefault(game, {}).setdefault(loc, {})[key] = {"gain": round(g, 4), "tint": [round(float(x), 4) for x in t],
                                                             "worst_de": round(e["de"], 2), "stills": e["n"]}
    return out


def apply(sug, dress_dir, min_change=0.02):
    """Multiply the suggestions into the configs. Returns the list of changed entries."""
    changed = []
    for game, locs in sug.items():
        p = os.path.join(dress_dir, game + ".dress.json")
        if not os.path.exists(p):
            continue
        cfg = _jl(p)
        for loc, keys in locs.items():
            L = cfg.get("locations", {}).get(loc)
            if L is None:
                continue
            for key, s in keys.items():
                base = None
                if "@" in key:
                    ent = L.setdefault("pieces", {}).get(key.split("@", 1)[1])
                    base = L.get("materials", {}).get(key.split("@", 1)[0])
                    if ent is not None and base is not None and ent.get("family") not in (None, base.get("family")):
                        base = None  # a piece of another family does not inherit the material's entry
                else:
                    ent = L.get("materials", {}).get(key)
                if ent is None or ent.get("family") in (None, "keep", "dirt-only", "water"):
                    continue
                if abs(s["gain"] - 1.0) < min_change and max(abs(x - 1.0) for x in s["tint"]) < min_change:
                    continue
                g0 = ent.get("gain", (base or {}).get("gain", 1.0))  # a piece entry inherits the material's gain and tint (dress.py merges them)
                ent["gain"] = round(g0 * s["gain"], 4)
                old = ent.get("tint", (base or {}).get("tint", [1.0, 1.0, 1.0]))
                ent["tint"] = [round(old[i] * s["tint"][i], 4) for i in range(3)]
                changed.append((game, loc, key, ent["gain"], ent["tint"]))
        with open(p, "w", encoding="utf-8") as f:
            f.write(json.dumps(cfg, indent=1) + "\n")
    return changed


def main(argv):
    bdir, adir, outp = argv[:3]
    locs = set(argv[argv.index("--locs") + 1].split(",")) if "--locs" in argv else None
    damp = float(argv[argv.index("--damp") + 1]) if "--damp" in argv else 0.8
    sug = suggest(region_pairs(bdir, adir, locs), damp=damp)
    with open(outp, "w", encoding="utf-8") as f:
        json.dump(sug, f, indent=1)
    for game, ls in sug.items():
        for loc, ks in ls.items():
            for k, s in ks.items():
                print("%-18s %-20s %-28s gain %.3f tint %s worst dE %.2f (%d)" % (game, loc, k, s["gain"], s["tint"], s["worst_de"], s["stills"]))
    if "--apply" in argv:
        for c in apply(sug, argv[argv.index("--apply") + 1]):
            print("applied", c)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

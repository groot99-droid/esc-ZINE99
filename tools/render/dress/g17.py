"""Gate G17: the same inputs twice. Compares two dressed runs of the same scenes.

    python g17.py <run A dir> <run B dir> <out json>

<run dir> holds `metrics/<game>/<loc>__<scene>__<still>.json` and `out/<game>/<loc>/<scene>.json` (the layout the box helpers collect),
and optionally the stills (`out/<game>/<loc>/<scene>/<still>.png`) for a byte comparison. Per still: same manifest hash, mean luma within
`g17_luma_rel`, and (where both pngs exist) md5 of the two files and the largest per-channel code difference.
"""
import hashlib
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dress import imageio_min as iio, measure  # noqa: E402


def _jl(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def main(a, b, outp):
    rows, ok_all = {}, True
    for game in sorted(os.listdir(os.path.join(a, "metrics"))):
        if not os.path.isdir(os.path.join(b, "metrics", game)):
            continue
        for fn in sorted(os.listdir(os.path.join(a, "metrics", game))):
            pb = os.path.join(b, "metrics", game, fn)
            if not os.path.exists(pb):
                continue
            loc, scene, still = fn[:-5].split("__")
            s1 = _jl(os.path.join(a, "out", game, loc, scene + ".json"))
            s2 = _jl(os.path.join(b, "out", game, loc, scene + ".json"))
            g = measure.g17_rerun(_jl(os.path.join(a, "metrics", game, fn)), _jl(pb), s1, s2)
            rec = {"gate": g, "intent_equal": next((s["intent_hash"] for s in s1["stills"] if s["still"] == still), None)
                   == next((s["intent_hash"] for s in s2["stills"] if s["still"] == still), None)}
            p1, p2 = (os.path.join(r, "out", game, loc, scene, still + ".png") for r in (a, b))
            if os.path.exists(p1) and os.path.exists(p2):
                rec["png_md5_equal"] = _md5(p1) == _md5(p2)
                x, y = iio.read_u8(p1).astype(np.int16), iio.read_u8(p2).astype(np.int16)
                rec["max_code_diff"] = int(np.abs(x - y).max()) if x.shape == y.shape else None
            rows["%s/%s/%s/%s" % (game, loc, scene, still)] = rec
            ok_all = ok_all and bool(g["pass"])
    with open(outp, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=1)
    n = len(rows)
    cmp_ = [r for r in rows.values() if "png_md5_equal" in r]
    worst = max(r["gate"]["value"]["mean_luma_rel_diff"] for r in rows.values()) if rows else 0
    print("G17: %d stills, manifest and mean luma equal: %d, worst mean-luma relative difference %.2e; pngs compared %d, byte-identical %d, max code diff %s" % (
        n, sum(1 for r in rows.values() if r["gate"]["pass"]), worst, len(cmp_), sum(1 for r in cmp_ if r["png_md5_equal"]),
        max([r.get("max_code_diff") or 0 for r in cmp_] or [0])))
    return 0 if ok_all else 1


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:4]))

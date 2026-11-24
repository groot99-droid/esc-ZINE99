"""Gates for the new-models pass: a whole model replacing a blockout box changes the pixels it covers by design, so the tone
gates are applied where they still mean something. Pure numpy (plus imageio_min to read the stills).

    python propgates.py <before run dir> <after run dir> <out json> [--thresholds t.json]
    blender -b --python propgates.py -- <before run dir> <after run dir> <out json> ...      (on a render box)

A run dir is what render_scenes.py wrote for one game (<loc>/<scene>.json, <loc>/<scene>/<still>.png and _id.png). Per still:

* the changed region U = after pixels of the new models (`dress:models/...`) + before pixels of the blockout pieces and props they
  replace (hidden) + before and after pixels of a prop whose source changed (a box proxy swapped for its model), grown by 3 px;
* G2r, G3r, G4ar, G4br, G6br: G2, G3a, G4a, G4b, G6b on the rest of the frame (did the model change the scene's light, shadow or
  colour outside itself?);
* G10a': props kept visible (G10a without the swapped props, which change shape by design);
* G10b': the look-at object; a change passes when the before object was replaced (hidden piece or swapped prop), and fails when a
  new model now covers the look-at point of a view that was not looking at the thing it replaces;
* G11m: light level on each hero prop: mean luma over the pixels that show the prop in both stills (eroded by 2 px), so a few mask
  pixels moving do not move the sample points (G11's five 9-px patches did, by up to 1.2 on a sack whose own mean changed 2 %);
* the model's own region: mean luma of the model against the replaced box (information, not a gate).
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from dress import imageio_min as iio, measure
except Exception:  # run from inside the folder
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import imageio_min as iio
    import measure


def grow(mask, r):
    """Binary dilation by a (2r+1) square (outside the frame counts as empty)."""
    if r <= 0:
        return mask
    c = np.cumsum(np.cumsum(np.pad(mask.astype(np.int32), ((r + 1, r), (r + 1, r))), 0), 1)
    n = 2 * r + 1
    return (c[n:, n:] - c[:-n, n:] - c[n:, :-n] + c[:-n, :-n]) > 0


def keys_mask(ids, leg, keys):
    m = np.zeros(ids.shape, bool)
    for k in keys:
        if k in leg:
            m |= ids == leg[k]
    return m


def changed_region(bids, bleg, aids, aleg, model_keys, hidden_keys, swapped_keys, r=3):
    u = keys_mask(aids, aleg, model_keys) | keys_mask(bids, bleg, hidden_keys) | keys_mask(bids, bleg, swapped_keys) | keys_mask(aids, aleg, swapped_keys)
    return grow(u, r)


def region_stats(a, mask):
    L = measure.luma(a)
    v = L[mask]
    if v.size == 0:
        return None
    lab = measure.srgb_to_lab(a)[mask]
    return {"n": int(v.size), "mean": float(v.mean()), "median": float(np.median(v)), "p01": float(np.percentile(v, 0.1)),
            "p5": float(np.percentile(v, 5)), "p95": float(np.percentile(v, 95)), "dark": float((v < 8 / 255.0).mean()),
            "lab": [float(x) for x in lab.mean(0)]}


def _g(name, ok, value, limit, note=""):
    return {"gate": name, "pass": None if ok is None else bool(ok), "value": value, "limit": limit, "note": note}


def rest_gates(sb, sa, T, share=1.0, min_share=0.10):
    """G2r, G3r, G4ar, G4br, G6br from region_stats of the rest of the frame before (sb) and after (sa). Not applied when the rest
    is under `min_share` of the frame (the model fills the view: a strip's percentiles say nothing about the scene's light)."""
    if not sb or not sa or sb["n"] < 1000 or share < min_share:
        return [_g(n, None, None, None, "rest of the frame too small (%.1f %%)" % (share * 100)) for n in ("G2r", "G3r", "G4ar", "G4br", "G6br")]
    dl = abs(sa["mean"] / max(sb["mean"], 1e-6) - 1)
    dm = abs(sa["median"] - sb["median"]) / max(sb["median"], 0.05)  # a near-black (night) median: one code is not a 12 % tone change
    de = float(np.linalg.norm(np.array(sa["lab"]) - np.array(sb["lab"])))
    spb, spa = sb["p95"] - sb["p5"], sa["p95"] - sa["p5"]
    return [_g("G2r", max(dl, dm) <= T["g2_rel"], round(max(dl, dm), 4), T["g2_rel"], "rest of frame: mean %.4f -> %.4f" % (sb["mean"], sa["mean"])),
            _g("G3r", de <= T["g3_frame_de"], round(de, 3), T["g3_frame_de"], "rest of frame: mean dE76"),
            _g("G4ar", sa["dark"] <= sb["dark"] + T["g4_dark_pts"] / 100.0, round(sa["dark"] * 100, 3), round(sb["dark"] * 100 + T["g4_dark_pts"], 3), "rest of frame: share under 8/255 (percent)"),
            _g("G4br", sa["p01"] * 255 >= sb["p01"] * 255 - T["g4_p01_codes"], round(sa["p01"] * 255, 2), round(sb["p01"] * 255 - T["g4_p01_codes"], 2), "rest of frame: p0.1 luma in codes"),
            _g("G6br", spa >= spb * 0.9, round(spa, 4), round(spb * 0.9, 4), "rest of frame: luma p5-p95 spread")]


def prop_gates(Lb, bids, bleg, La, aids, aleg, swapped_keys, centre_b, centre_a, replaced_keys, model_keys, T, min_px=400):
    """G10a' (visible area of the kept props), G11m (their light over common pixels), G10b' (look-at object)."""
    out = []
    props = sorted(k for k in bleg if k.startswith("prop:") and k not in swapped_keys)
    ratios, devs = {}, {}
    n = bids.size
    for k in props:
        mb = bids == bleg[k]
        ab = mb.sum() / n
        if ab < 0.001:
            continue
        ma = aids == aleg[k] if k in aleg else np.zeros(aids.shape, bool)
        ratios[k] = round(float(ma.sum() / n / ab), 3)
        both = measure.erode(mb & ma, 2)
        if both.sum() >= min_px:
            yb, ya = float(Lb[both].mean()), float(La[both].mean())
            devs[k] = round(abs(ya - yb) / max(yb, 0.02), 4)
    worst = min(ratios.values()) if ratios else None
    out.append(_g("G10a'", worst is None or worst >= T["g10_prop_min"], worst, T["g10_prop_min"], json.dumps(ratios)))
    out.append(_g("G11m", None if not devs else max(devs.values()) <= T["g11_rel"], None if not devs else max(devs.values()), T["g11_rel"], json.dumps(devs)))
    if centre_b == centre_a:
        ok, note = True, "same object"
    elif centre_b in replaced_keys:
        ok, note = True, "the look-at object was replaced (%s -> %s)" % (centre_b, centre_a)
    elif centre_a in model_keys:
        ok, note = False, "a new model covers the look-at point (%s, was %s)" % (centre_a, centre_b)
    else:
        ok, note = False, "look-at object changed (%s -> %s)" % (centre_b, centre_a)
    out.append(_g("G10b'", ok, centre_a, centre_b, note))
    return out


def compare_still(png_b, id_b, png_a, id_a, sjb, sja, T):
    a_b, a_a = iio.read(png_b), iio.read(png_a)
    bids, aids = measure.decode_ids(iio.read_u8(id_b)), measure.decode_ids(iio.read_u8(id_a))
    bleg, aleg = sjb.get("ids", {}), sja.get("ids", {})
    pr = (sja.get("dress", {}).get("layers", {}) or {}).get("props") or {}
    model_keys = sorted(k for k in aleg if k.startswith("dress:models/"))
    hidden = ["piece:" + p for p in pr.get("hidden_pieces", [])] + ["prop:" + p for p in pr.get("hidden_props", [])]
    swapped = sorted("prop:" + (v.get("name") or pid) for pid, v in sja.get("props", {}).items()
                     if sjb.get("props", {}).get(pid, {}).get("source") not in (None, v.get("source")))
    U = changed_region(bids, bleg, aids, aleg, model_keys, hidden, swapped)
    rest = ~U
    out = rest_gates(region_stats(a_b, rest), region_stats(a_a, rest), T, float(rest.mean()))
    inv_b, inv_a = {v: k for k, v in bleg.items()}, {v: k for k, v in aleg.items()}
    H, W = bids.shape
    cb, ca = inv_b.get(int(bids[H // 2, W // 2])), inv_a.get(int(aids[H // 2, W // 2]))
    out += prop_gates(measure.luma(a_b), bids, bleg, measure.luma(a_a), aids, aleg, swapped, cb, ca, set(hidden) | set(swapped), set(model_keys), T)
    mm, hb = keys_mask(aids, aleg, model_keys), keys_mask(bids, bleg, hidden) | keys_mask(bids, bleg, swapped)
    info = {"changed_share": round(float(U.mean()), 4), "model_share": round(float(mm.mean()), 4)}
    if mm.sum() and hb.sum():
        info["model_luma"], info["replaced_luma"] = round(float(measure.luma(a_a)[mm].mean()), 4), round(float(measure.luma(a_b)[hb].mean()), 4)
    return out, info


def main(argv):
    bdir, adir, outp = argv[:3]
    T = dict(measure.PLAN)
    if "--thresholds" in argv:
        t = json.load(open(argv[argv.index("--thresholds") + 1], encoding="utf-8"))
        T.update(t.get("thresholds", t))
    res = {}
    for loc in sorted(os.listdir(adir)):
        if not os.path.isdir(os.path.join(adir, loc)):
            continue
        for fn in sorted(os.listdir(os.path.join(adir, loc))):
            if not fn.endswith(".json") or not os.path.exists(os.path.join(bdir, loc, fn)):
                continue
            sja = json.load(open(os.path.join(adir, loc, fn), encoding="utf-8"))
            sjb = json.load(open(os.path.join(bdir, loc, fn), encoding="utf-8"))
            for st in sja.get("stills", []):
                stb = next((s for s in sjb.get("stills", []) if s["still"] == st["still"]), None)
                if stb is None or not st.get("id_file") or not stb.get("id_file"):
                    continue
                pa, pb = os.path.join(adir, st["file"]), os.path.join(bdir, stb["file"])
                if not (os.path.exists(pa) and os.path.exists(pb)):
                    continue
                gates, info = compare_still(pb, os.path.join(bdir, stb["id_file"]), pa, os.path.join(adir, st["id_file"]), sjb, sja, T)
                res["%s/%s/%s" % (loc, fn[:-5], st["still"])] = {"gates": gates, "info": info}
    with open(outp, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=1)
    print("propgates", len(res), "stills ->", outp)


if __name__ == "__main__":
    a = sys.argv
    main(a[a.index("--") + 1:] if "--" in a else a[1:])

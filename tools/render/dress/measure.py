"""Gates G1 to G17 of the realism plan, first calibrated form. CPU only: numpy, and Pillow or Blender's image code.

    python measure.py describe <still.png> <still_id.png> <scene.json> <still name> [--ref <reference.jpg>] [--tiling 1] > metrics.json
    python measure.py compare <before_metrics.json> <after_metrics.json> <before scene.json> <after scene.json> [--thresholds t.json]
    python measure.py hygiene <file> [<file> ...]

`describe` turns one still (its id mask and the scene json the driver wrote) into numbers; `compare` applies the gates to a before
and an after description. All image values are display-encoded (what the viewer sees), luma is Rec. 709 on those values.
Thresholds start from the plan and are replaced by calibrate.py's noise-floor result (`thresholds.calibrated.json`).
"""
import colorsys
import hashlib
import json
import math
import os
import re
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from dress import imageio_min as iio
except Exception:  # run as a script from inside the folder
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import imageio_min as iio

PLAN = {
    "g1_exact": True,
    "g2_rel": 0.12, "g2_ev_max": 0.5,
    "g3_frame_de": 4.0, "g3_region_de": 6.0,
    "g4_dark_pts": 0.5, "g4_p01_codes": 2.0,
    "g5_specks_extra": 0,
    "g6_foreign_max": 0.015, "g6_foreign_extra_pts": 0.5,
    "g7_min": 2.0, "g7_ref_max": 1.3,
    "g8_peak": 0.20, "g8_control_min": 0.5, "g8_min_area": 0.04,
    "g9_lo": 0.7, "g9_hi": 2.0,
    "g10_prop_min": 0.95, "g10_near_m": 0.3, "g10_dress_share_max": 0.35,
    "g11_rel": 0.03,
    "g13_unique_tris": 1_500_000, "g13_expanded_tris": 12_000_000, "g13_texture_bytes": 2_500_000_000, "g13_vram_mib": 18432,
    "g13_seconds_x": 3.0, "g13_seconds_abs": 150.0,
    "g14_step": 0.06,
    "g17_luma_rel": 1e-6,  # same inputs twice differ by GPU float noise of about 1e-7 relative
}


def _jl(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------- image maths
def luma(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def srgb_to_lab(a):
    lin = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
    xyz = lin @ m.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 216 / 24389, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def gauss_kernel(sigma):
    r = max(1, int(math.ceil(3 * sigma)))
    x = np.arange(-r, r + 1)
    k = np.exp(-0.5 * (x / sigma) ** 2)
    return k / k.sum()


def blur(a, sigma):
    k = gauss_kernel(sigma)
    r = len(k) // 2
    for ax in (0, 1):
        pad = [(0, 0)] * a.ndim
        pad[ax] = (r, r)
        p = np.pad(a, pad, mode="reflect")
        w = np.lib.stride_tricks.sliding_window_view(p, len(k), axis=ax)
        a = w @ k
    return a


def erode(mask, r):
    """Binary erosion by a (2r+1) square: a pixel stays when its whole neighbourhood is in the mask."""
    if r <= 0:
        return mask
    c = np.cumsum(np.cumsum(np.pad(mask.astype(np.int32), ((r + 1, r), (r + 1, r))), 0), 1)
    n = 2 * r + 1
    s = c[n:, n:] - c[:-n, n:] - c[n:, :-n] + c[:-n, :-n]
    return s == n * n


def band_energy(L, mask=None):
    """Mean squared difference-of-Gaussians (sigma 1 minus sigma 4) of a luma image, inside mask (eroded by 4 px)."""
    d = blur(L, 1.0) - blur(L, 4.0)
    e = d * d
    if mask is None:
        return float(e.mean())
    m = erode(mask, 4)
    return float(e[m].mean()) if m.any() else None


def tiling_peak(L, mask, lag_lo=0.06, lag_hi=0.60):
    """Gate G8: peak of the normalised autocorrelation of the high-passed luma inside a region, lags 6 to 60 % of the region's size.

    A texture with a long correlation length (big planks, one wide grain) correlates with itself at small lags without repeating, so
    lags inside three correlation lengths are skipped: the correlation length is the radius where the ring-averaged autocorrelation
    first falls under 0.15. Lags beyond that are where a tiled repeat shows up.
    """
    ys, xs = np.where(mask)
    if len(ys) < 400:
        return None
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    sub = L[y0:y1, x0:x1]
    m = erode(mask, 3)[y0:y1, x0:x1].astype(np.float64)
    if m.sum() < 400:
        return None
    hp = (sub - blur(sub, 8.0)) * m
    if hp[m > 0].std() < 0.004:  # a flat or smooth region has no texture to repeat: the normalised peak is meaningless
        return None
    h, w = hp.shape
    H, W = 2 * h, 2 * w
    F = np.fft.rfft2(hp, (H, W))
    M = np.fft.rfft2(m, (H, W))
    ac = np.fft.irfft2(F * np.conj(F), (H, W))
    am = np.fft.irfft2(M * np.conj(M), (H, W))
    # lags: index (dy, dx) with wrap-around
    dy = np.minimum(np.arange(H), H - np.arange(H))[:, None]
    dx = np.minimum(np.arange(W), W - np.arange(W))[None, :]
    rel = np.maximum(dy / max(h, 1), dx / max(w, 1))
    if ac[0, 0] <= 1e-12:
        return None
    norm = ac / np.maximum(am, 1e-9) / (ac[0, 0] / am[0, 0])
    rad = np.hypot(dy, dx)
    valid = am > 0.30 * am[0, 0]
    ri = np.minimum(rad.astype(np.int64), int(rad.max()))
    ring_sum = np.bincount(ri[valid], weights=norm[valid], minlength=ri.max() + 1)
    ring_n = np.bincount(ri[valid], minlength=ri.max() + 1)
    ring = ring_sum / np.maximum(ring_n, 1)
    below = np.where((ring < 0.15) & (ring_n > 0))[0]
    corr_len = int(below[0]) if len(below) else int(ri.max())
    ok = (rel >= lag_lo) & (rel <= lag_hi) & valid & (rad > 3 * max(corr_len, 1))
    if not ok.any():
        return None
    return float(norm[ok].max())


def hue_chroma(lab):
    return np.degrees(np.arctan2(lab[..., 2], lab[..., 1])) % 360.0, np.hypot(lab[..., 1], lab[..., 2])


def palette_hues(a, k=6):
    """The k strongest hue peaks (degrees) of the chromatic pixels (Lab chroma over 12) of an image, 30 degree bins, merged."""
    lab = srgb_to_lab(a)
    h, c = hue_chroma(lab)
    sel = c > 12
    if sel.sum() < 50:
        return []
    hist, edges = np.histogram(h[sel], bins=36, range=(0, 360), weights=c[sel])
    order = np.argsort(-hist)
    peaks = []
    for i in order:
        center = edges[i] + 5
        if hist[i] <= 0:
            break
        if all(min(abs(center - p), 360 - abs(center - p)) > 20 for p in peaks):
            peaks.append(float(center))
        if len(peaks) >= k:
            break
    return peaks


def foreign_share(a, hues):
    """Share of pixels with Lab chroma over 20 whose hue is more than 50 degrees from every palette hue."""
    if not hues:
        return None
    lab = srgb_to_lab(a)
    h, c = hue_chroma(lab)
    sel = c > 20
    if not sel.any():
        return 0.0
    d = np.min([np.minimum(np.abs(h - p), 360 - np.abs(h - p)) for p in hues], axis=0)
    return float(((d > 50) & sel).mean())


# ---------------------------------------------------------------- id masks
def decode_ids(idimg_u8):
    return idimg_u8[..., 0].astype(np.int32) + idimg_u8[..., 1].astype(np.int32) * 256


def describe(png, idpng, scene_json, still, ref=None, tiling=False, seed=0):
    a = iio.read(png)
    L = luma(a)
    H, W = L.shape
    scene = _jl(scene_json)
    leg = scene.get("ids", {})
    inv = {v: k for k, v in leg.items()}
    ids = decode_ids(iio.read_u8(idpng)) if idpng and os.path.exists(idpng) else np.zeros((H, W), np.int32)
    if ids.shape != L.shape:
        ids = ids[:H, :W]
    lab = srgb_to_lab(a)
    spread = a.max(-1) - a.min(-1)
    m = {"still": still, "size": [W, H],
         "mean_luma": float(L.mean()), "median_luma": float(np.median(L)), "p01_luma": float(np.percentile(L, 0.1)),
         "p99_luma": float(np.percentile(L, 99)), "p5": float(np.percentile(L, 5)), "p95": float(np.percentile(L, 95)),
         "dark_share": float((L < 8 / 255.0).mean()), "specks": int(((L < 0.05) & (spread > 0.15)).sum()),
         "lab_mean": [float(x) for x in lab.reshape(-1, 3).mean(0)],
         "band_energy": band_energy(L)}
    hues = palette_hues(a)
    m["hue_peaks"] = hues
    h, c = hue_chroma(lab)
    sel = c > 12
    m["hue_spread"] = float(np.std(np.exp(1j * np.radians(h[sel])).real) + np.std(np.exp(1j * np.radians(h[sel])).imag)) if sel.sum() > 50 else 0.0
    m["luma_spread"] = float(m["p95"] - m["p5"])
    if ref is not None:
        r = iio.read(ref)
        rl = luma(iio.resize_box(r, W, int(round(r.shape[0] * W / r.shape[1]))))
        rh = palette_hues(r)
        m["ref"] = {"band_energy": band_energy(rl), "hue_peaks": rh, "luma_spread": float(np.percentile(rl, 95) - np.percentile(rl, 5)),
                    "mean_luma": float(rl.mean())}
        m["foreign_share"] = foreign_share(a, rh)
    else:
        m["foreign_share"] = foreign_share(a, hues)
    groups = {}
    for gid in np.unique(ids):
        if gid == 0:
            continue
        key = inv.get(int(gid), "id%d" % gid)
        mk = ids == gid
        area = float(mk.mean())
        if area < 0.0004:
            continue
        g = {"area": area, "luma": float(L[mk].mean()), "lab": [float(x) for x in lab[mk].mean(0)], "energy": band_energy(L, mk)}
        if key.startswith("prop:") and area >= 0.002:
            ys, xs = np.where(mk)
            order = np.lexsort((xs, ys))
            pts = [order[int(q * (len(order) - 1))] for q in (0.1, 0.3, 0.5, 0.7, 0.9)]
            e = erode(mk, 4)
            vals = []
            for p in pts:
                y, x = ys[p], xs[p]
                patch = (slice(max(y - 4, 0), y + 5), slice(max(x - 4, 0), x + 5))
                vals.append(float(L[patch][mk[patch]].mean()))
            g["patch_luma"] = vals
        if tiling and (key.startswith("piece:") or key.startswith("dress:")) and area >= PLAN["g8_min_area"]:
            g["tiling_peak"] = tiling_peak(L, mk)
        groups[key] = g
    m["groups"] = groups
    m["centre_group"] = inv.get(int(ids[H // 2, W // 2]), None) if ids[H // 2, W // 2] else None
    m["dress_share"] = float(sum(g["area"] for k, g in groups.items() if k.startswith("dress:")))
    # joins between pieces: luma step across a boundary in 3 px bands (for G14), keyed "a|b"
    if len(groups) > 1:
        m["joins"] = _joins(L, ids, inv)
    return m


def _joins(L, ids, inv):
    out = {}
    for ax in (0, 1):
        a = ids[:-1, :] if ax == 0 else ids[:, :-1]
        b = ids[1:, :] if ax == 0 else ids[:, 1:]
        la = L[:-1, :] if ax == 0 else L[:, :-1]
        lb = L[1:, :] if ax == 0 else L[:, 1:]
        sel = (a != b) & (a > 0) & (b > 0)
        for (ga, gb) in {tuple(sorted(p)) for p in zip(a[sel][:20000].tolist(), b[sel][:20000].tolist())}:
            s = sel & (((a == ga) & (b == gb)) | ((a == gb) & (b == ga)))
            if s.sum() < 25:
                continue
            ya = np.where(a[s] == ga, la[s], lb[s])
            yb = np.where(a[s] == ga, lb[s], la[s])
            k = "%s|%s" % (inv.get(ga, ga), inv.get(gb, gb))
            prev = out.get(k)
            step = float(abs(ya.mean() - yb.mean()) / max((ya.mean() + yb.mean()) / 2, 1e-4))
            out[k] = {"step": step, "n": int(s.sum())} if prev is None or prev["n"] < s.sum() else prev
    return out


# ---------------------------------------------------------------- gates
def _g(name, ok, value, limit, note=""):
    return {"gate": name, "pass": None if ok is None else bool(ok), "value": value, "limit": limit, "note": note}


def compare(mb, ma, sb, sa, T=None, still="camera"):
    """The gates for one still. mb/ma: describe() of before/after; sb/sa: the two scene jsons (driver output)."""
    T = dict(PLAN, **(T or {}))
    out = []
    stb = next((s for s in sb["stills"] if s["still"] == still), {})
    sta = next((s for s in sa["stills"] if s["still"] == still), {})
    dr = sa.get("dress", {})
    # G1 intent
    out.append(_g("G1", stb.get("intent_hash") == sta.get("intent_hash"), sta.get("intent_hash"), stb.get("intent_hash"), "lights, world flat branch, camera, lens"))
    # G2 tone
    dl = abs(ma["mean_luma"] / max(mb["mean_luma"], 1e-6) - 1)
    dm = abs(ma["median_luma"] / max(mb["median_luma"], 1e-6) - 1)
    if mb["median_luma"] < 1e-4 and ma["median_luma"] < 1e-4:  # P1: a night frame whose median is black before and after is not a 100 % change
        dm = 0.0
    out.append(_g("G2", max(dl, dm) <= T["g2_rel"], round(max(dl, dm), 4), T["g2_rel"], "mean %.4f -> %.4f, median %.4f -> %.4f" % (mb["mean_luma"], ma["mean_luma"], mb["median_luma"], ma["median_luma"])))
    # G3 colour shift
    de = float(np.linalg.norm(np.array(ma["lab_mean"]) - np.array(mb["lab_mean"])))
    out.append(_g("G3a", de <= T["g3_frame_de"], round(de, 3), T["g3_frame_de"], "frame mean dE76"))
    dressed = _dressed_groups(dr)
    reg = {}
    for k in dressed:
        if k in mb["groups"] and k in ma["groups"]:
            reg[k] = round(float(np.linalg.norm(np.array(ma["groups"][k]["lab"]) - np.array(mb["groups"][k]["lab"]))), 2)
    worst = max(reg.values()) if reg else None
    out.append(_g("G3b", None if worst is None else worst <= T["g3_region_de"], worst, T["g3_region_de"], json.dumps(reg)))
    # G4 dark floor
    out.append(_g("G4a", ma["dark_share"] <= mb["dark_share"] + T["g4_dark_pts"] / 100.0, round(ma["dark_share"] * 100, 3), round(mb["dark_share"] * 100 + T["g4_dark_pts"], 3), "share of pixels under 8/255 (percent)"))
    out.append(_g("G4b", ma["p01_luma"] * 255 >= mb["p01_luma"] * 255 - T["g4_p01_codes"], round(ma["p01_luma"] * 255, 2), round(mb["p01_luma"] * 255 - T["g4_p01_codes"], 2), "p0.1 luma in codes"))
    # G5 specks (a small share of a megapixel of noise is tolerated through g5_specks_extra)
    out.append(_g("G5", ma["specks"] <= mb["specks"] + T["g5_specks_extra"], ma["specks"], mb["specks"] + T["g5_specks_extra"], "pixels with luma under 0.05 and channel spread over 0.15"))
    # G6 foreign hue and variety
    fa, fb = ma.get("foreign_share"), mb.get("foreign_share")
    if fa is not None:
        out.append(_g("G6a", fa <= T["g6_foreign_max"] and fa <= (fb or 0) + T["g6_foreign_extra_pts"] / 100.0, round(fa * 100, 3), round(T["g6_foreign_max"] * 100, 2), "foreign hue share (percent); before %s" % (None if fb is None else round(fb * 100, 3))))
    ref = ma.get("ref")
    ok = ma["luma_spread"] >= mb["luma_spread"] * 0.9 and (ref is None or ma["luma_spread"] <= ref["luma_spread"] * 1.25)
    out.append(_g("G6b", ok, round(ma["luma_spread"], 4), round(mb["luma_spread"] * 0.9, 4), "luma p5-p95 spread; reference %s" % (None if ref is None else round(ref["luma_spread"], 4))))
    # G7 detail gain on dressed regions
    gains = {}
    for k in dressed:
        eb, ea = mb["groups"].get(k, {}).get("energy"), ma["groups"].get(k, {}).get("energy")
        if eb and ea:
            gains[k] = round(ea / eb, 2)
    if gains:
        tot_b = sum(mb["groups"][k]["energy"] * mb["groups"][k]["area"] for k in gains)
        tot_a = sum(ma["groups"][k]["energy"] * ma["groups"][k]["area"] for k in gains)
        agg = tot_a / max(tot_b, 1e-12)
        cap = None if ref is None else T["g7_ref_max"] * ref["band_energy"]
        area_a = sum(ma["groups"][k]["area"] for k in gains)
        ea_mean = tot_a / max(area_a, 1e-9)
        ok = agg >= T["g7_min"] and (cap is None or ea_mean <= cap)
        out.append(_g("G7", ok, round(agg, 2), T["g7_min"], "area-weighted gain; per region %s; dressed energy %.2e vs cap %s" % (json.dumps(gains), ea_mean, None if cap is None else "%.2e" % cap)))
    else:
        out.append(_g("G7", None, None, T["g7_min"], "no dressed region large enough"))
    # G8 tiling
    fam = lambda k: dr.get("materials", {}).get(dr.get("piece_materials", {}).get(k[6:], ""), {}).get("family")
    # a tile grid (vinyl, ceiling tile) and a wallpaper stripe are periodic by design, and glass (dirt-only) shows its reflection, not a texture: G8 skips both.
    # A peak the region already had before dressing (a shading edge, a pattern the build file draws) is not the dressing's tiling.
    skip = ("grid", "wallpaper", "dirt-only", "keep")
    # P1: a scan of a regular built pattern (brick bond, floor tiles, diamond plate, corrugation) is marked `periodic` in its config
    per = lambda k: dr.get("materials", {}).get(dr.get("piece_materials", {}).get(k[6:], ""), {}).get("periodic")
    peaks = {k: ma["groups"][k].get("tiling_peak") for k in dressed if k in ma["groups"] and ma["groups"][k].get("tiling_peak") is not None
             and fam(k) not in skip and not per(k)}
    over = {k: v for k, v in peaks.items() if v > T["g8_peak"] and v > (mb["groups"].get(k, {}).get("tiling_peak") or 0.0) + 0.05}
    if peaks:
        out.append(_g("G8", not over, round(max(peaks.values()), 3), T["g8_peak"], "over the limit and above before: %s; all %s" % (json.dumps({k: round(v, 3) for k, v in over.items()}), json.dumps({k: round(v, 3) for k, v in peaks.items()}))))
    else:
        out.append(_g("G8", None, None, T["g8_peak"], "no dressed region of 4 percent of the frame"))
    # G9 texel density from the manifest and the ray grid
    out.append(_g_density(dr, sta, ma, T))
    # G10 composition
    pb = {k: v for k, v in mb["groups"].items() if k.startswith("prop:")}
    ratios = {k: round(ma["groups"].get(k, {"area": 0})["area"] / v["area"], 3) for k, v in pb.items() if v["area"] >= 0.001}
    tb, ta = sum(v["area"] for v in pb.values()), sum(v["area"] for k, v in ma["groups"].items() if k.startswith("prop:"))
    worst = min(ratios.values()) if ratios else None
    out.append(_g("G10a", (worst is None or worst >= T["g10_prop_min"]) and (tb == 0 or ta / tb >= T["g10_prop_min"]), worst, T["g10_prop_min"], "prop visible area after/before; total %.3f" % (ta / tb if tb else 1.0)))
    out.append(_g("G10b", mb.get("centre_group") == ma.get("centre_group"), ma.get("centre_group"), mb.get("centre_group"), "object under the look-at pixel"))
    near = dr.get("dress_within_0.3m_of_camera", 0)
    dv = sta.get("dress_view", {}).get("dress_min_dist_m")
    out.append(_g("G10c", near == 0 and (dv is None or dv >= T["g10_near_m"]), dv, T["g10_near_m"], "dress objects within 0.3 m of the camera: %s" % near))
    out.append(_g("G10d", ma["dress_share"] <= T["g10_dress_share_max"], round(ma["dress_share"], 4), T["g10_dress_share_max"], "frame share of dress objects"))
    # G11 light level on hero props
    devs = {}
    for k, v in pb.items():
        if "patch_luma" in v and k in ma["groups"] and "patch_luma" in ma["groups"][k]:
            d = [abs(x - y) / max(y, 0.02) for x, y in zip(ma["groups"][k]["patch_luma"], v["patch_luma"])]
            devs[k] = round(float(np.mean(d)), 4)
    out.append(_g("G11", None if not devs else max(devs.values()) <= T["g11_rel"], None if not devs else max(devs.values()), T["g11_rel"], json.dumps(devs)))
    # G12 geometry
    cb, ca = sb.get("checks", {}), sa.get("checks", {})
    new = {k: len(ca.get(k, [])) - len(cb.get(k, [])) for k in ca}
    bad = {k: v for k, v in new.items() if v > 0}
    inprop = dr.get("instances_in_prop_bbox", 0)
    out.append(_g("G12", not bad and inprop == 0, {"new_findings": bad, "instances_in_prop_bbox": inprop}, 0, "driver checks and dress instances against prop boxes"))
    # G13 budget
    stt, stb2 = sa.get("stats", {}), sb.get("stats", {})
    sec_lim = min(T["g13_seconds_abs"], T["g13_seconds_x"] * max(stb.get("seconds", 1.0), 1.0))
    ok = (stt.get("unique_tris", 0) <= T["g13_unique_tris"] and stt.get("expanded_tris", 0) <= T["g13_expanded_tris"]
          and stt.get("texture_bytes", 0) <= T["g13_texture_bytes"] and (sta.get("vram_peak_mib") or 0) <= T["g13_vram_mib"] and sta.get("seconds", 0) <= sec_lim)
    out.append(_g("G13", ok, {"unique_tris": stt.get("unique_tris"), "expanded_tris": stt.get("expanded_tris"), "texture_mb": round(stt.get("texture_bytes", 0) / 1e6, 1),
                              "vram_mib": sta.get("vram_peak_mib"), "seconds": sta.get("seconds")}, {"seconds": round(sec_lim, 1)}, "before seconds %s" % stb.get("seconds")))
    # G14 seams: excess luma step across joins of the same material between coplanar pieces
    out.append(_g_seams(dr, mb, ma, T))
    return out


def _dressed_groups(dr):
    names = ["piece:" + p for p in dr.get("dressed_pieces", [])]
    return names


def _g_density(dr, sta, ma, T):
    tex = dr.get("textures", {})
    mats = dr.get("materials", {})
    rays = sta.get("dress_view", {}).get("rays", [])
    res = ma["size"]
    lens = sta.get("dress_view", {}).get("lens_mm")
    if not tex or not rays or not lens:
        return _g("G9", None, None, [T["g9_lo"], T["g9_hi"]], "no scan texture in view or no ray grid")
    fpx = res[0] / 36.0 * lens
    by_piece = dr.get("piece_materials", {})
    per = {}
    for u, v, grp, dist in rays:
        if not grp or not dist or not grp.startswith("piece:"):
            continue
        mat = by_piece.get(grp[6:])
        if mat and mat in mats and mats[mat].get("scan") in tex:
            per.setdefault(grp, {"mat": mat, "scan": mats[mat]["scan"], "d": []})["d"].append(dist)
    vals = {}
    for grp, r in per.items():
        d = float(np.median(r["d"]))
        vals[grp] = round(tex[r["scan"]]["texels_per_m"] * d / fpx / tex[r["scan"]].get("K", 1.0), 3)
    if not vals:
        return _g("G9", None, None, [T["g9_lo"], T["g9_hi"]], "no scan-textured region hit by the ray grid")
    # below the low bound the texture is magnified (soft): fail. Above the high bound it is minified (finer than the screen, fine
    # for the picture, a little wasteful): reported, not failed. The plan text had the two remedies the other way round.
    ok = all(v >= T["g9_lo"] for v in vals.values())
    over = sorted(k for k, v in vals.items() if v > T["g9_hi"])
    return _g("G9", ok, vals, [T["g9_lo"], T["g9_hi"]], "texels per screen pixel at the region's median depth; minified (info only): %s" % over)


def box_gap(ga, gb):
    """Largest gap between two axis-aligned boxes ({"center", "size"}) along any axis; 0 when they touch or overlap."""
    return max(max(0.0, abs(ga["center"][i] - gb["center"][i]) - (ga["size"][i] + gb["size"][i]) / 2.0) for i in range(3))


def _g_seams(dr, mb, ma, T):
    geo, pm = dr.get("piece_geom", {}), dr.get("piece_materials", {})
    worst, rec = None, {}
    for k, v in ma.get("joins", {}).items():
        a, b = k.split("|")
        if not (a.startswith("piece:") and b.startswith("piece:")):
            continue
        pa, pb = a[6:], b[6:]
        if pm.get(pa) != pm.get(pb) or pa not in geo or pb not in geo:
            continue
        ga, gb = geo[pa], geo[pb]
        # coplanar: same thin axis and within 5 cm along it
        ta, tb = int(np.argmin(np.array(ga["size"]))), int(np.argmin(np.array(gb["size"])))
        if ta != tb or abs(ga["center"][ta] - gb["center"][tb]) > 0.05:
            continue
        if box_gap(ga, gb) > 0.05:  # R1: they only meet in the picture (a far piece behind a near one), not a physical join
            continue
        before = mb.get("joins", {}).get(k, {}).get("step", 0.0)
        excess = max(0.0, v["step"] - before)
        rec[k] = round(excess, 4)
        worst = excess if worst is None else max(worst, excess)
    return _g("G14", None if worst is None else worst <= T["g14_step"], worst, T["g14_step"], json.dumps(rec))


# ---------------------------------------------------------------- location- and run-level gates
def g14_layout(scene_jsons):
    ids = {_jl(p).get("dress", {}).get("layout_id") for p in scene_jsons}
    return _g("G14c", len(ids) == 1, sorted(str(i) for i in ids), 1, "one layout id across the scenes of a location")


def g15_rules(scene_json, rules, dress_dir_cfg=None):
    s = _jl(scene_json) if isinstance(scene_json, str) else scene_json
    dr = s.get("dress", {})
    hits = []
    layers = set(dr.get("layers", {}))
    if dr.get("game") == rules["arena"]["game"] and dr.get("location") == rules["arena"]["location"]:
        hits += ["arena layer %s" % x for x in layers - set(rules["arena"]["allowed_layers"])]
        # new-models pass: the arena may only get the listed fixtures, high on the walls (it stays empty of anything on the floor)
        for m in (dr.get("layers", {}).get("props") or {}).get("models", []):
            if m["model"] not in rules["arena"].get("props_allowed", []):
                hits.append("arena model %s" % m["model"])
            for c in m.get("copies", []):
                if c["box_lo"][2] < rules["arena"].get("props_min_z_m", 0.0):
                    hits.append("arena model %s below %.1f m" % (m["model"], rules["arena"].get("props_min_z_m", 0.0)))
    if dr.get("game") == rules["man_eater"]["game"]:
        hits += ["man-eater layer %s" % x for x in layers & set(rules["man_eater"]["denied_layers"])]
    toks = list(dr.get("dress_groups", {})) + list(dr.get("materials", {})) + list(dr.get("textures", {}))
    for t in toks:
        w = re.split(r"[^a-z]+", t.lower())
        hits += ["banned word %s in %s" % (x, t) for x in rules["banned_words"] if x in w]
    return _g("G15", not hits, hits, 0, "arena empty, man-eater rules, banned words in names")


def g16_hygiene(paths):
    """Public-repo hygiene: user name, absolute paths, session ids, e-mail addresses. The user name is read from the environment at run time."""
    import getpass
    user = getpass.getuser().lower()
    pats = [(re.compile(r"(?<![A-Za-z])[A-Za-z]:[\\/](?![\\/])[^\s\"']+"), "windows path"), (re.compile(r"/(?:Users|home)/[A-Za-z0-9_.-]+"), "home path"),
            (re.compile(r"/work" r"space/job"), "job path"), (re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b"), "uuid"),
            (re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}"), "e-mail"), (re.compile(r"session_[0-9A-Za-z]{10,}"), "session id")]
    hits = []
    for p in paths:
        try:
            with open(p, encoding="utf-8", errors="ignore") as f:
                txt = f.read()
        except Exception:
            continue
        low = txt.lower()
        if len(user) > 2 and user in low:
            hits.append((os.path.basename(p), "user name"))
        for rx, why in pats:
            for m in rx.finditer(txt):
                hits.append((os.path.basename(p), why + ": " + m.group(0)[:40]))
    return _g("G16", not hits, hits[:20], 0, "scanned %d files" % len(paths))


def g17_rerun(m1, m2, s1, s2):
    """Same inputs twice: same manifest hash; image statistics within the noise floor (target: identical on the same card)."""
    h1, h2 = s1.get("dress", {}).get("manifest_hash"), s2.get("dress", {}).get("manifest_hash")
    d = abs(m1["mean_luma"] - m2["mean_luma"]) / max(m1["mean_luma"], 1e-6)
    return _g("G17", h1 == h2 and d <= PLAN["g17_luma_rel"] + 1e-9, {"manifest_hash": [h1, h2], "mean_luma_rel_diff": d}, 0, "identical manifests and mean luma")


def g8_positive_control(scan_path, tiles=4, size=1024):
    """The detector must call an undressed tiling of the same scan periodic: peak over 0.5, or the detector is rejected."""
    a = iio.read(scan_path)
    a = iio.resize_box(a, size // tiles, size // tiles)
    big = np.tile(a, (tiles, tiles, 1))
    L = luma(big)
    return tiling_peak(L, np.ones(L.shape, bool))


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    cmd = argv[0]
    if cmd == "describe":
        png, idp, sj, still = argv[1:5]
        ref = argv[argv.index("--ref") + 1] if "--ref" in argv else None
        tl = "--tiling" in argv and argv[argv.index("--tiling") + 1] == "1"
        print(json.dumps(describe(png, idp, sj, still, ref, tl)))
        return 0
    if cmd == "compare":
        mb, ma = (_jl(p) for p in argv[1:3])
        sb, sa = (_jl(p) for p in argv[3:5])
        T = _jl(argv[argv.index("--thresholds") + 1]) if "--thresholds" in argv else None
        T = T.get("thresholds", T) if T else T
        print(json.dumps(compare(mb, ma, sb, sa, T, ma.get("still", "camera")), indent=1))
        return 0
    if cmd == "hygiene":
        print(json.dumps(g16_hygiene(argv[1:]), indent=1))
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

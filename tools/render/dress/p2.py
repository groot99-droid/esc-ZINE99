"""Phase P2 (atmosphere and skies), first cut: adds camera-ray-only sky plates, a faint outdoor haze and interior window plates
to the P1 location entries. Pure Python, no Blender.

    python tools/render/dress/p2.py [--games a,b] [--write]

Per P1 location (entries with `p1`; the hand-made pilot places are left alone):
* Exterior (no ceiling piece): `atmos.sky_plate` with one of the six locked sky hdris, picked from the scenes' own flat world colour
  (dark: night; warm: dusk; pale blue: clear; blue-grey: partly cloudy; grey: overcast). The plate is seen by camera rays only and is
  divided by its own mean and multiplied by the flat world colour (atmos.wrap_world), so lighting is unchanged (G1) and the sky keeps
  the build's tone. `haze` 0.001 per metre where the location is under 250 m across (the loop road's R2 value); none on the big
  terrains, where a per-metre density turns into fog.
* Interior with window or door openings (`-head` wall pieces): the R3 `window_plate` kit (camera-only spruce plates, tone-locked to the
  scene's world colour).
* Room haze, dust motes, light shafts, rain, snow and flame cards are not added: R1/R2 measured room haze taking 10 to 30 % of the light
  off the hero props (G11), and motes and shafts are not built yet.
Re-running replaces the P2 keys (marked `p2`).
"""
import colorsys
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
VERSION = 1

WINDOW_PLATE = {"kit": "window_plate", "name": "window_plate", "offset_m": 0.6, "pad_m": 0.35, "above_m": 0.6, "tree_gain": 0.6,
                "ground_gain": 0.55, "horizon_gain": 1.2, "zenith_gain": 0.95, "clear_centre": False, "tiers": 6.0, "blur": 0.07,
                "far_n": 14.0, "near_n": 7.0, "far_range": 0.3, "near_range": 0.45, "far_k": 1.5, "near_k": 1.25, "far_gain": 0.8}


# Places where an earth sky picture is wrong (inside a body, under the sea, cosmic or void settings), and where the spruce window plate
# is wrong (desert town, harbour, a city in the sky): left without P2 plates; listed in the notes.
NO_SKY = {"heartstream": "*", "wrymwretch": {"astral-expanse", "bone-choir", "heart-of-wound", "seabed", "sky-above-realms"},
          "endless-temple": {"abyss-edge"}, "people-of-the-bark": "haze"}
WINDOW_GAMES = {"stuffed-ones", "man-eater"}


def pick_sky(col):
    r, g, b = col
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    hd = h * 360
    if lum < 0.04:
        return "dikhololo_night_2k.hdr", "night"
    if s > 0.2 and (hd < 50 or hd > 320):
        return "qwantani_dusk_2_puresky_2k.hdr", "dusk"
    if s > 0.25 and 190 <= hd <= 240 and lum > 0.35:
        return "syferfontein_1d_clear_puresky_2k.hdr", "clear"
    if s > 0.12 and 180 <= hd <= 250:
        return "kloofendal_48d_partly_cloudy_puresky_2k.hdr", "partly cloudy"
    return "kloofendal_overcast_puresky_2k.hdr", "overcast"


def _scan_location(game, loc):
    worlds, heads, lo, hi, K = [], False, [1e18] * 3, [-1e18] * 3, 1.0
    for d in sorted(glob.glob(os.path.join(ROOT, "build", "blender", game, loc, "*"))):
        with open(os.path.join(d, "assembly.json"), encoding="utf-8") as f:
            a = json.load(f)
        with open(os.path.join(d, "blockout.json"), encoding="utf-8") as f:
            bo = json.load(f)
        worlds.append(a["world"]["color"])
        for p in bo["pieces"]:
            if p["id"].endswith("-head") and p.get("role") == "wall":
                heads = True
            if p.get("role") in ("sky",):
                continue
            c, s = p.get("location", [0, 0, 0]), p.get("size_m", [0, 0, 0])
            for i in range(3):
                lo[i] = min(lo[i], c[i] - s[i] / 2)
                hi[i] = max(hi[i], c[i] + s[i] / 2)
    mean = [sum(w[i] for w in worlds) / len(worlds) for i in range(3)]
    extent = max(hi[0] - lo[0], hi[1] - lo[1])
    return mean, heads, extent


def build(game, cfg):
    rep = {}
    for loc, L in sorted(cfg.get("locations", {}).items()):
        if not L.get("p1"):
            continue
        for k in ("p2",):
            L.pop(k, None)
        if L.get("atmos", {}).get("_p2"):
            L.pop("atmos")
        L["kits"] = [k for k in L.get("kits", []) if not k.get("_p2")]
        if not L["kits"]:
            L.pop("kits")
        world, heads, extent = _scan_location(game, loc)
        arena = game == "dr-tox-rise" and loc == "trial-53-arena"
        if arena:
            continue
        info = {"version": VERSION}
        ns = NO_SKY.get(game)
        if ns == "*" or (isinstance(ns, set) and loc in ns):
            continue
        if not L["p1"]["interior"]:
            hdri, kind = pick_sky(world)
            at = {"_p2": True, "sky_plate": {"name": kind + "-hdri", "hdri": hdri, "rotation_deg": 30, "mix": 0.7, "horizon_gain": 1.1,
                                            "zenith_gain": 0.95}}
            if extent < 250 and kind != "night" and ns != "haze":  # bark: D14 (scale) still open, no per-metre haze
                at["haze"] = {"density": 0.001, "color": [0.82, 0.84, 0.86], "anisotropy": 0.25}
            L["atmos"] = at
            info.update(sky=kind, haze=bool(at.get("haze")), extent_m=round(extent, 1))
        elif heads and game in WINDOW_GAMES:
            L.setdefault("kits", []).append(dict(WINDOW_PLATE, _p2=True))
            info["window_plate"] = True
        else:
            continue
        L["p2"] = info
        rep[loc] = info
    return cfg, rep


def main(argv):
    games = sorted(f[:-11] for f in os.listdir(HERE) if f.endswith(".dress.json"))
    if "--games" in argv:
        games = argv[argv.index("--games") + 1].split(",")
    n = 0
    for g in games:
        p = os.path.join(HERE, g + ".dress.json")
        with open(p, encoding="utf-8") as f:
            cfg = json.load(f)
        cfg, rep = build(g, cfg)
        n += len(rep)
        for loc, i in rep.items():
            print(g, loc, i)
        if "--write" in argv:
            with open(p, "w", encoding="utf-8", newline="\n") as f:
                json.dump(cfg, f, indent=1)
                f.write("\n")
    print("locations with P2 entries:", n)


if __name__ == "__main__":
    main(sys.argv[1:])

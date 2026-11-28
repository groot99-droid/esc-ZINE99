"""Phase P3 (outdoor and forest kit): adds vegetation to the outdoor P1 places of the forest games. Pure Python, no Blender.

    python tools/render/dress/p3.py [--write]

Per outdoor P1 place (no ceiling) of CAMP, STUF, LIRA, ALT, MAN, WRY, SEA and RISE (TEMP is desert and the bark world waits for D14):
* `p3_materials` (used only with the scatter layer on): conifer and canopy blocks get the R3 foliage family; grass, meadow and moss
  ground get the locked grass and forest-floor scans; trunks, dead wood and roots get the pine-bark scan; small plants (vine, weed,
  fern, prickle) the foliage family.
* kits: R3 `conifer_wrap` (needled branch tiers over every cone crown, `-crown` pieces) and `treeline` (spruce rows along the faces of
  conifer blocks 8 m or larger), camera-only light and no shadow as in R3.
* scatter: grass tufts on grass, meadow and forest ground; twigs and needle litter on forest ground; the CC0 models (fern_02,
  pine_sapling_small, rock_moss_set_01, tree_stump_01, dead_tree_trunk_02) at path edges and forest edges, kept off roads, paths,
  water and every camera's sight lines, only where the sun reaches.
Only the approved, locked assets on disk are used. Re-running replaces the P3 keys (marked `_p3` / `p3`).
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
GAMES = {"missing-campsites", "stuffed-ones", "lira-calyx", "dr-tox-altrulan", "man-eater", "wrymwretch", "lord-of-the-sea", "dr-tox-rise"}
SKIP = {("wrymwretch", "astral-expanse")}  # cosmic: no earth plants
FOL = {"family": "foliage", "tile_m": 1.2, "macro": 0.45, "fine": 0.35, "bump": 0.6, "bump_m": 0.03, "obj_jitter_m": 40.0, "gain": 1.12,
       "underside": 0.08}
MATS = [  # (regex, entry)
    (r"^(conifer|canopy|pines?|spruce|forest)$", dict(FOL, trunks={"spacing_m": 1.6, "dark": 0.4, "width": 0.35})),
    (r"^(birch-leaf|leaf-green|copper-leaves|vine|weed|prickle|plant-light)$", dict(FOL, tile_m=0.6, macro=0.3)),
    (r"^(grass|grass-faded|cool-grass|meadow)$", {"family": "scan", "scan": "leafy_grass", "res": "2k", "tile_m": 2.4, "chroma": 0.2,
                                                   "bump": 0.5, "macro": 0.14, "third": True, "macro2": 0.06, "grime": 0.3}),
    (r"^(grass-dry|dry-grass|grey-grass)$", {"family": "scan", "scan": "withered_grass", "res": "1k", "tile_m": 2.4, "chroma": 0.15,
                                              "bump": 0.5, "macro": 0.14, "third": True, "grime": 0.3}),
    (r"^(moss|moss-dark|moss-bank|pine-needles)$", {"family": "scan", "scan": "forest_floor", "res": "1k", "tile_m": 2.6, "chroma": 0.15,
                                                     "bump": 0.6, "macro": 0.14, "third": True, "grime": 0.3}),
    (r"^(trunk|clean-trunk|tree-bark|dead-wood|deadwood|roots)$", {"family": "scan", "scan": "pine_bark", "res": "1k", "tile_m": 1.0,
                                                                   "chroma": 0.15, "bump": 0.7, "macro": 0.1, "grime": 0.6}),
]
GROUND = r"^(grass|grass-faded|cool-grass|meadow|grass-dry|dry-grass|grey-grass|moss|moss-dark|moss-bank|pine-needles|forest-floor|forest|earth|ground|hillside|hill|slope|terrace)$"
AVOID = r"^(road|street|asphalt|path|path-earth|packed-track|sandy-path|gravel|gravel-wet|dead-gravel|creek|river|puddle|water|sea|dust|yard|yard-floor|paving)$"
FORESTY = r"^(grass|grass-faded|cool-grass|meadow|moss|moss-dark|moss-bank|pine-needles|forest-floor|forest|earth|ground)$"


def _scan(game, loc):
    mats, roles, crowns, conifer = set(), {}, False, False
    for f in sorted(glob.glob(os.path.join(ROOT, "build", "blender", game, loc, "*", "blockout.json"))):
        with open(f, encoding="utf-8") as fh:
            bo = json.load(fh)
        for p in bo["pieces"]:
            m = p.get("material")
            if not m:
                continue
            mats.add(m)
            roles.setdefault(m, set()).add(p.get("role"))
            crowns |= p["id"].endswith("-crown")
            conifer |= m in ("conifer", "spruce", "pines", "canopy")
    return mats, roles, crowns, conifer


def build(game, cfg):
    rep = {}
    for loc, L in sorted(cfg.get("locations", {}).items()):
        for k in ("p3", "p3_materials"):
            L.pop(k, None)
        for k in ("kits", "scatter"):
            if k in L:
                L[k] = [x for x in L[k] if not x.get("_p3")]
                if not L[k]:
                    L.pop(k)
        if game not in GAMES or not L.get("p1") or L["p1"]["interior"] or (game, loc) in SKIP:
            continue
        mats, roles, crowns, conifer = _scan(game, loc)
        pm = {}
        for m in sorted(mats):
            if "sky" in roles[m] and len(roles[m]) == 1 and m not in ("conifer", "pines", "forest"):
                continue
            for rx, e in MATS:
                if re.match(rx, m):
                    pm[m] = dict(e, p3_preset=rx.split("|")[0].strip("^("))
                    break
        ground = sorted(m for m in mats if re.match(GROUND, m) and not (roles[m] <= {"sky"}))
        forest_ground = sorted(m for m in ground if re.match(FORESTY, m))
        avoid = sorted(m for m in mats if re.match(AVOID, m)) or ["road"]  # a place without paths still keeps the sight-line rules
        kits, scat = [], []
        if crowns:
            kits.append({"kit": "conifer_wrap", "name": "crowns", "name_contains": "-crown", "height_gain": 1.06, "radius_gain": 1.35,
                         "lift": 0.02, "no_shadow_near_props_m": 6.0, "clear_centre": False, "cast_shadow": False, "surface": FOL,
                         "camera_only_light": True, "style": "branches", "_p3": True})
        if conifer:
            kits.append({"kit": "treeline", "name": "treeline", "materials": sorted(m for m in mats if m in ("conifer", "spruce", "pines", "canopy")),
                         "min_size_m": 8.0, "spacing_m": 3.6, "offset_m": [-1.4, 0.9], "height": [0.75, 1.5], "radius": 0.14, "variants": 7,
                         "max_dist_m": 150, "avoid_materials": avoid, "avoid_margin_m": 0.5, "no_shadow_near_props_m": 6.0, "clear_centre": True,
                         "cast_shadow": False, "surface": FOL, "camera_only_light": True, "style": "branches",
                         "rows": [{"offset_m": [-1.4, 0.9], "height": [0.95, 1.55], "spacing_m": 3.0}], "_p3": True})
        if ground:
            scat.append({"kind": "grass", "name": "grass", "on": {"materials": ground}, "density": 1800, "max_dist_m": 20, "limit": 12000,
                         "color": [0.33, 0.37, 0.17], "roughness": 0.8, "surface": {"family": "foliage", "tile_m": 0.3, "macro": 0.2, "fine": 0.12,
                                                                                    "bump": 0.0},
                         "scale": 1.1, "patch": {"scale_m": 1.6, "cut": 0.4, "soft": 0.14}, "jitter": 1.7, "tilt_deg": 14,
                         "avoid_materials": avoid, "avoid_margin_m": 0.3, "sightlines_m": 0.8, "_p3": True})
        if forest_ground:
            scat.append({"kind": "twigs", "name": "twigs", "on": {"materials": forest_ground}, "density": 12, "max_dist_m": 22, "limit": 1000,
                         "color": [0.26, 0.18, 0.11], "roughness": 0.9, "surface": {"family": "scan", "scan": "pine_bark", "res": "1k", "tile_m": 0.3,
                                                                                    "chroma": 0.3, "bump": 0.4}, "_p3": True})
            mods = [{"name": "fern_02", "weight": 5, "size": [0.8, 1.3], "sink": 0.02, "albedo_gain": 2.2},
                    {"name": "pine_sapling_small", "weight": 3, "size": [0.8, 1.4], "sink": 0.02, "albedo_gain": 3.2},
                    {"name": "rock_moss_set_01", "weight": 1.5, "size": [0.5, 1.1], "sink": 0.3, "albedo_gain": 2.0},
                    {"name": "tree_stump_01", "weight": 0.8, "size": [0.5, 0.8], "sink": 0.05, "albedo_gain": 1.8}]
            scat.append({"kind": "model", "name": "plants", "on": {"materials": forest_ground}, "density": 20, "max_dist_m": 60, "limit": 140,
                         "avoid_materials": avoid, "avoid_margin_m": 0.6, "sightlines_m": 1.4, "near_camera_m": 7.0, "thin_far": 0.4,
                         "models": mods, "max_tris": 14000, "sunlit_only": True, "sun_probe_m": 1.2, "_p3": True})
            if conifer:
                scat.append({"kind": "model", "name": "forest-edge", "on": {"materials": forest_ground}, "density": 90, "max_dist_m": 90,
                             "limit": 360, "near_materials": sorted(m for m in mats if m in ("conifer", "spruce", "pines", "canopy")), "near_m": 3.5,
                             "avoid_materials": avoid, "avoid_margin_m": 0.4, "sightlines_m": 1.4, "near_camera_m": 7.0, "thin_far": 0.7,
                             "models": [{"name": "pine_sapling_small", "weight": 5, "size": [2.4, 4.6], "sink": 0.02, "albedo_gain": 3.2},
                                        {"name": "fern_02", "weight": 3, "size": [1.0, 1.6], "sink": 0.02, "albedo_gain": 2.2},
                                        {"name": "dead_tree_trunk_02", "weight": 1.5, "size": [0.9, 1.2], "sink": 0.1, "albedo_gain": 1.8}],
                             "max_tris": 14000, "sunlit_only": True, "sun_probe_m": 1.2, "_p3": True})
        if not (pm or kits or scat):
            continue
        if pm:
            L["p3_materials"] = pm
        if kits:
            L["kits"] = L.get("kits", []) + kits
        if scat:
            L["scatter"] = L.get("scatter", []) + scat
        L["p3"] = {"version": 1, "materials": sorted(pm), "kits": [k["kit"] for k in kits], "scatter": [s["name"] for s in scat]}
        rep[loc] = L["p3"]
    return cfg, rep


def main(argv):
    n = 0
    for f in sorted(glob.glob(os.path.join(HERE, "*.dress.json"))):
        g = os.path.basename(f)[:-11]
        with open(f, encoding="utf-8") as fh:
            cfg = json.load(fh)
        cfg, rep = build(g, cfg)
        n += len(rep)
        for loc, i in rep.items():
            print(g, loc, i)
        if "--write" in argv:
            with open(f, "w", encoding="utf-8", newline="\n") as fh:
                json.dump(cfg, fh, indent=1)
                fh.write("\n")
    print("locations with P3 entries:", n)


if __name__ == "__main__":
    main(sys.argv[1:])

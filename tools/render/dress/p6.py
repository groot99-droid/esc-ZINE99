"""Phase P6 (procedural prop kits), first cut. Pure Python, no Blender.

    python tools/render/dress/p6.py [--write]

Adds to interior P1 places (rooms with a ceiling) whose walls are plaster, paint or concrete:
* a skirting board along every wall (the R1 `baseboard` kit; log, board, brick and stone walls are skipped), painted a little darker
  than the wall in institutional games and varnished wood elsewhere;
* in the institutional games (Man Eater, the four Dr. Tox games, LIRA labs) a cable conduit with brackets along the longest plaster or
  concrete wall, under the ceiling (the R1 `conduit` kit; bodies only, no light).
Kits cast shadows only where the R1 kit does; nothing is placed on a prop or under a view's centre ray (`clear_centre`). The arena
stays empty (rules.json denies kits there). Built ComfyUI models already go in through the props layer (new-models pass); no model
in the built ledgers is a cable, conduit or skirting kit, so P6 here is procedural.
"""
import glob
import re
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
INST = {"man-eater", "dr-tox-rise", "dr-tox-fall", "dr-tox-finale", "dr-tox-altrulan", "lira-calyx"}
WALLP = {"plaster", "plaster_clean", "plaster_old", "paint_gloss", "conc_wall", "conc_wall_damp", "cloth_wall", "wallpaper"}
SKIP = ["cedar-log", "log", "brick", "soot-brick", "stone", "drystone", "cedar-plank", "panel", "boards", "glass", "window-glass"]


def build(game, cfg):
    rep = {}
    for loc, L in sorted(cfg.get("locations", {}).items()):
        L.pop("p6", None)
        if "kits" in L:
            L["kits"] = [k for k in L["kits"] if not k.get("_p6")]
            if not L["kits"]:
                L.pop("kits")
        if not L.get("p1") or not L["p1"]["interior"] or game in ("heartstream", "wrymwretch") or (game == "dr-tox-rise" and loc == "trial-53-arena"):
            continue
        wallmats = {m for m, e in L.get("materials", {}).items() if e.get("p1_preset") in WALLP}
        if not wallmats:
            continue
        walls = []
        for f in sorted(glob.glob(os.path.join(ROOT, "build", "blender", game, loc, "*", "blockout.json")))[:1]:
            with open(f, encoding="utf-8") as fh:
                bo = json.load(fh)
            for p in bo["pieces"]:
                if p.get("role") == "wall" and p.get("material") in wallmats and not p["id"].endswith(("-head", "-sill")):
                    s = p.get("size_m", [0, 0, 0])
                    walls.append((max(s[0], s[1]), s[2], p["id"]))
        if not walls:
            continue
        inst = game in INST
        kits = [{"kit": "baseboard", "name": "skirting", "color": [0.3, 0.3, 0.29] if inst else [0.3, 0.21, 0.13], "roughness": 0.6,
                 "height_m": 0.11 if inst else 0.14, "thickness_m": 0.02, "skip_materials": SKIP, "clear_centre": True,
                 "surface": {"family": "metal", "tile_m": 0.5, "bump": 0.1} if inst else
                 {"family": "grid", "tile_m": 0.14, "board_m": 2.4, "board_axis": "x", "row_axis": "z", "grain": 0.05, "bump": 0.2},
                 "_p6": True}]
        if inst:
            walls.sort(reverse=True)
            if walls[0][0] >= 3.0 and walls[0][1] >= 2.2:
                kits.append({"kit": "conduit", "name": "conduit", "wall": walls[0][2], "radius_m": 0.022, "below_top_m": 0.28,
                             "color": [0.55, 0.56, 0.55], "roughness": 0.45, "metallic": 0.6, "clear_centre": True,
                             "surface": {"family": "metal", "tile_m": 0.5, "bump": 0.1}, "_p6": True})
        # P6b (ruling 2026-11-28): fixture bodies around every ceiling light, and bookshelf bays in libraries and archives
        kits.append({"kit": "fixtures", "name": "fixtures", "near_ceiling_m": 0.7, "color": [0.6, 0.6, 0.58] if inst else [0.3, 0.24, 0.18],
                     "roughness": 0.5, "metallic": 0.5 if inst else 0.0, "clear_centre": False,
                     "surface": {"family": "metal", "tile_m": 0.4, "bump": 0.1}, "_p6": True})
        if re.search(r"archive|library|temple-halls|clerk-office|record", loc):
            walls.sort(reverse=True)
            kits.append({"kit": "shelves", "name": "shelves", "wall": walls[0][2], "height_m": 2.1, "bay_m": 0.95, "max_bays": 8,
                         "clear_centre": True, "_p6": True})
        L["kits"] = L.get("kits", []) + kits
        L["p6"] = {"version": 2, "kits": [k["name"] for k in kits]}
        rep[loc] = L["p6"]
    return cfg, rep


def main(argv):
    n = 0
    for f in sorted(glob.glob(os.path.join(HERE, "*.dress.json"))):
        g = os.path.basename(f)[:-11]
        with open(f, encoding="utf-8") as fh:
            cfg = json.load(fh)
        cfg, rep = build(g, cfg)
        n += len(rep)
        if "--write" in argv:
            with open(f, "w", encoding="utf-8", newline="\n") as fh:
                json.dump(cfg, fh, indent=1)
                fh.write("\n")
    print("locations with P6 entries:", n)


if __name__ == "__main__":
    main(sys.argv[1:])

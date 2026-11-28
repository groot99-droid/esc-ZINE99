"""Phase P4 (rock, snow, frost and ice): surfaces for the materials P1 left for P4. Pure Python, no Blender.

    python tools/render/dress/p4.py [--write]

Writes `p4_materials` (used when the render sets DRESS_P4=1) for every P1 place with rock, cliff, cavern, scree, snow, frost, crust
or obsidian materials, from the locked cave scans on disk: pale rock -> marble_rock_03 or rock_face; mid rock -> rock_wall_08,
worn_rock_natural_01 or quarry_wall_02 by tone; dark rock -> dark_rock_02; rubble and scree -> rocks_ground_06; snow -> snow_02
(open ground) or snow_field_aerial (far slopes); frost trims -> snow_03 fine; crust and salt -> snow_03; obsidian -> dark_rock_02
with a clear coat. Tone-locked as in P1 (the build colour stays the authority; chroma kept low). The bark world waits for D14.
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
_S = {"family": "scan", "third": True, "macro2": 0.06, "obj_jitter_m": 0.0}


def S(scan, tile, res="1k", **kw):
    d = dict(_S, scan=scan, tile_m=tile, res=res)
    d.update(kw)
    return d


ROCK = r"^(rock|cliff|cavern|cavern-rock|outcrop|ledge-rock|ridge-rock|island-rock|gorge-rock|pale-cliff|headland|island|island-top|mesa|peaks)$"


def preset(name, color, roles):
    lum = 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]
    far = roles <= {"sky"}
    t = 3.0 if not far else 12.0
    if re.match(ROCK, name):
        if lum > 0.45:
            return "rock_pale", S("marble_rock_03", t, "2k", chroma=0.1, bump=0.6, macro=0.14, grime=0.6)
        if lum < 0.08:
            return "rock_dark", S("dark_rock_02", t, chroma=0.1, bump=0.7, macro=0.14, grime=0.6)
        if lum < 0.2:
            return "rock_mid", S("rock_wall_08", t, chroma=0.1, bump=0.7, macro=0.14, grime=0.7)
        return "rock_light", S("worn_rock_natural_01", t, "2k", chroma=0.1, bump=0.7, macro=0.14, grime=0.7)
    if name == "rubble":
        return "scree", S("rocks_ground_06", 2.4, chroma=0.1, bump=0.8, macro=0.12, grime=0.5)
    if name == "obsidian":
        return "obsidian", S("dark_rock_02", 2.4, chroma=0.0, bump=0.4, macro=0.1, grime=0.3, coat=0.6, coat_roughness=0.05)
    if name == "snow":
        if far:
            return "snow_far", S("snow_field_aerial", 40.0, chroma=0.0, bump=0.3, macro=0.1, grime=0.0)
        return "snow", S("snow_02", 3.0, chroma=0.0, bump=0.5, macro=0.08, grime=0.15)
    if name in ("frost", "crust", "salt-hill"):
        return "frost", S("snow_03", 1.2, chroma=0.0, bump=0.4, macro=0.08, grime=0.1)
    return None, None


def build(game, cfg):
    rep = {}
    for loc, L in sorted(cfg.get("locations", {}).items()):
        L.pop("p4", None)
        L.pop("p4_materials", None)
        if not L.get("p1") or game in ("people-of-the-bark", "heartstream"):
            continue
        names = set(L["p1"]["deferred"].get("P4", [])) | ({"snow"} if "snow" in L["p1"]["deferred"].get("P4", []) else set())
        if not names:
            continue
        info = {}
        for f in sorted(glob.glob(os.path.join(ROOT, "build", "blender", game, loc, "*", "blockout.json"))):
            with open(f, encoding="utf-8") as fh:
                bo = json.load(fh)
            for p in bo["pieces"]:
                m = p.get("material")
                if m in names:
                    md = bo["materials"][m]
                    e = info.setdefault(m, {"color": md["color"], "roles": set(), "emission": md.get("emission") or 0})
                    e["roles"].add(p.get("role"))
        pm = {}
        for m, e in sorted(info.items()):
            if e["emission"]:
                continue
            k, ent = preset(m, e["color"], e["roles"])
            if ent:
                pm[m] = dict(ent, p4_preset=k)
        if pm:
            L["p4_materials"] = pm
            L["p4"] = {"version": 1, "materials": {m: v["p4_preset"] for m, v in pm.items()}}
            rep[loc] = L["p4"]
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
    print("locations with P4 entries:", n)


if __name__ == "__main__":
    main(sys.argv[1:])

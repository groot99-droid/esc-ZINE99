"""Phase P5 (per-game specials) and the near-rock relief ruling. Pure Python, no Blender.

    python tools/render/dress/p5.py [--write]

Writes `p5_materials` (used when the render sets DRESS_P5=1; they win over P4) for:
* near cave and cliff walls (ruling 2026-11-28): the P4 rock entry plus true displacement (outward only, edge-faded, as on the R3
  marrow piers) on rock pieces in interiors and in places under 150 m across; far rock keeps the flat texture;
* HEART: tissue, membrane, muscle and crimson walls -> the R3 membrane family (abstract wet membrane, nothing wound-like, D9),
  emission kept; the glowing blood water -> the water family with its glow kept;
* BARK: ruling D14 (2026-11-28): a fine bark tile (0.18 m in scene units, ridges no bigger than a person; 0.06 m over-sharpened the near ridges and its strong bump moved the tone by up to 49 %); the story scale is
  carried by layout and colour, not by the texture size;
* SEA: tarred wood and hulls -> dark weathered planks with a tar sheen;
* LIRA: crystal and amber pieces without emission -> a glassy, faceted look (coat, low roughness); glowing ones keep their glow;
* WRY: bone -> pale noise with hairline cracks; silver and fused metals -> tarnished metal;
* TEMP: the sand set (bleached, silver and dune sand) -> the coast sand scan at dune scale; book spines -> narrow random boards
  (spines of different heights and tones, no lettering); vellum -> blank paper.
Emitting materials keep their emission (dress_material modulates it with the detail ratio only). No people, creatures or gore.
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.dirname(HERE))
from dress import p2  # noqa: E402

RELIEF = {"displace_m": 0.08, "displace_mid": 0.0, "subdiv": 5, "edge_fade_m": 0.5, "edge_floor": 0.2, "edge_mid": 0.0}
MEMB = {"family": "membrane", "stretch": 2.0, "warp": 0.6, "vein_m": 0.35, "vein_w": 0.035, "vein_dark": 0.2, "macro": 0.2, "fine": 0.05,
        "bump": 0.5, "coat": 0.4, "coat_roughness": 0.15, "rough_range": [0.25, 0.6]}
SPECIAL = {
    "heartstream": [(r"^(tissue-pink|membrane-red|membrane-white|muscle|crimson|crimson-deep|bruise|marrow-tissue|marrow-floor|cavity)$", MEMB),
                    (r"^(blood-water|blood-calm)$", {"family": "water", "dark": 0.9, "roughness": 0.05, "ripple": 0.1, "specular": 0.6}),
                    (r"^(bone|bone-dark)$", {"family": "noise", "tile_m": 1.2, "macro": 0.08, "fine": 0.05, "bump": 0.3,
                                             "cracks": {"amount": 0.3, "scale_m": 0.5, "width": 0.006, "share": 0.4}})],
    "people-of-the-bark": [(r"^(bark|bark-grey|bark-umber|bark-damp|home-bark)$", {"family": "scan", "scan": "bark_brown_02", "res": "2k",
                                                                                   "tile_m": 0.18, "chroma": 0.1, "bump": 0.35, "bump_m": 0.002, "macro": 0.14,
                                                                                   "third": True, "macro2": 0.08}),
                           (r"^(knot-tan)$", {"family": "scan", "scan": "pine_bark", "res": "1k", "tile_m": 0.15, "chroma": 0.1, "bump": 0.35, "bump_m": 0.002})],
    "lord-of-the-sea": [(r"^(tarred-wood|hull|ink-hull)$", {"family": "scan", "scan": "weathered_planks", "res": "1k", "tile_m": 2.2,
                                                           "chroma": 0.1, "contrast": 1.3, "bump": 0.6, "macro": 0.12, "coat": 0.3,
                                                           "coat_roughness": 0.25, "third": True})],
    "lira-calyx": [(r"^(crystal-wall|crystal-ash|crystal-out|amber-crystal|gem-ochre|core-crystal)$",
                    {"family": "noise", "tile_m": 0.4, "macro": 0.12, "fine": 0.04, "bump": 0.4, "coat": 0.8, "coat_roughness": 0.03,
                     "rough_scale": 0.3, "cracks": {"amount": 0.3, "scale_m": 0.25, "width": 0.01, "share": 0.6, "tint": [1.15, 1.15, 1.15],
                                                    "depth": 0.5}})],
    "wrymwretch": [(r"^(bone|bone-dark|cloud-bone)$", {"family": "noise", "tile_m": 1.2, "macro": 0.1, "fine": 0.05, "bump": 0.35,
                                                       "cracks": {"amount": 0.35, "scale_m": 0.5, "width": 0.006, "share": 0.4}}),
                   (r"^(silver|cottage-silver|fused-silver|fused-gold|moss-silver|fern-silver)$",
                    {"family": "metal", "tile_m": 0.4, "macro": 0.16, "bump": 0.15, "grime": 0.9,
                     "patches": {"size_m": 0.2, "share": 0.4, "amount": 0.1, "rough": 0.15},
                     "edge_wear": {"radius_m": 0.008, "amount": 0.5, "tint": [1.2, 1.2, 1.2], "rough": -0.1}})],
    "endless-temple": [(r"^(bleached-sand|silver-sand|dune-light)$", {"family": "scan", "scan": "coast_sand_01", "res": "2k", "tile_m": 3.0,
                                                                      "chroma": 0.05, "bump": 0.5, "macro": 0.14, "third": True,
                                                                      "macro2": 0.08, "grime": 0.2}),
                       (r"^(book-spines)$", {"family": "grid", "tile_m": 0.035, "board_m": 0.32, "board_axis": "z", "row_axis": "xy",
                                             "joint": 0.08, "joint_tone": 0.45, "tile_jitter": 0.22, "grain": 0.03, "fine": 0.03,
                                             "macro": 0.06, "bump": 0.4, "grime": 0.6, "g7_min": 1.5}),
                       (r"^(vellum|paper-plain)$", {"family": "paper", "tile_m": 0.3, "bump": 0.15, "grime": 0.4, "foxing": 0.25, "g7_min": 1.5})],
}


def build(game, cfg):
    rep = {}
    for loc, L in sorted(cfg.get("locations", {}).items()):
        L.pop("p5", None)
        L.pop("p5_materials", None)
        if not L.get("p1"):
            continue
        pm = {}
        # near-rock relief
        near = L["p1"]["interior"]
        if not near:
            _w, _h, extent = p2._scan_location(game, loc)
            near = extent < 150
        if near and game != "people-of-the-bark":
            for m, e in (L.get("p4_materials") or {}).items():
                if e.get("p4_preset", "").startswith("rock"):  # scree spheres came out hairy under displacement: texture only
                    pm[m] = dict(e, **RELIEF, p5_preset="relief")
        # per-game specials
        names = set()
        for f in sorted(glob.glob(os.path.join(ROOT, "build", "blender", game, loc, "*", "blockout.json"))):
            with open(f, encoding="utf-8") as fh:
                names |= {p.get("material") for p in json.load(fh)["pieces"]}
        for rx, e in SPECIAL.get(game, []):
            for m in sorted(n for n in names if n and re.match(rx, n)):
                if game == "heartstream" and loc == "marrow-caverns":
                    continue  # the pilot place keeps its hand-made R3 entries
                pm[m] = dict(e, p5_preset=rx.split("|")[0].strip("^(").rstrip(")$"))
        if pm:
            L["p5_materials"] = pm
            L["p5"] = {"version": 1, "materials": {m: v["p5_preset"] for m, v in pm.items()}}
            rep[loc] = L["p5"]
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
    print("locations with P5 entries:", n)


if __name__ == "__main__":
    main(sys.argv[1:])

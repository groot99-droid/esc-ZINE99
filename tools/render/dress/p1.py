"""Phase P1 (core surfaces and grime): writes a location entry for every location of a game from its compiled blockout files.
Pure Python, no Blender.

    python tools/render/dress/p1.py [--games a,b] [--write] [--report <json>]

For every location it reads `build/blender/<game>/<location>/<scene>/blockout.json` (read only), classifies each blockout material by
its name, role and flags into one of the P1 surface presets below, and writes `locations.<location>` into `<game>.dress.json` with
`"p1": {...}`, `grime`, `materials` and (interiors, never Man Eater or the arena) `decals`. Rules:

* A location that already has hand-made `materials` (the four pilot places, R1 to R3) is left alone.
* A location that only has a `props` entry (new-models pass) keeps it; the P1 keys are added next to it.
* A material that belongs to a later phase is not dressed here and is listed under `p1.deferred` with its phase: sky and water
  (P2), vegetation (P3), rock, snow and ice (P4), the per-game specials (P5: heartstream tissue and bone, bark, LIRA crystal and glow,
  WRY bone-and-silver and fused metals, SEA tarred wood, TEMP sand and books). Emitting materials (lit windows, lamps, glows) are kept.
* A material with no rule is listed under `p1.unmatched` and stays as built.
* Re-running replaces the earlier P1 entry of a location (marked by `p1`), except the `gain` and `tint` that gains.py wrote, which
  are carried over when the preset of that material did not change.

Only the 23 approved textures of the P1 cache are used (`P1_SCANS`); everything else is procedural.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
HERE = os.path.dirname(os.path.abspath(__file__))
VERSION = 1

P1_SCANS = {"asphalt_02", "bark_brown_02", "coast_sand_01", "concrete_floor_worn_001", "concrete_wall_008", "corrugated_iron",
            "forrest_ground_01", "gravel_floor", "green_metal_rust", "hessian_380", "large_floor_tiles_02", "leafy_grass", "metal_plate",
            "mud_cracked_dry_03", "plastered_wall_04", "red_brick_03", "rocky_trail", "rust_coarse_01", "slate_floor_02", "stone_floor",
            "weathered_plank_siding", "wood_trunk_wall", "worn_mossy_plasterwall"}

_S = {"res": "2k", "third": True, "macro2": 0.05, "obj_jitter_m": 20.0}


def _scan(scan, tile, **kw):
    d = dict(_S, family="scan", scan=scan, tile_m=tile)
    d.update(kw)
    return d


# ---------------------------------------------------------------- presets (R3 options; sizes in metres)
PRESETS = {
    "plaster": _scan("plastered_wall_04", 1.2, contrast=2.0, chroma=0.0, bump=0.55, macro=0.1, grime=1.1,
                     patches={"size_m": 0.8, "share": 0.25, "amount": 0.04, "rough": 0.05},
                     cracks={"amount": 0.35, "scale_m": 0.9, "width": 0.006, "share": 0.25}),
    "plaster_clean": _scan("plastered_wall_04", 1.5, contrast=1.6, chroma=0.0, bump=0.4, macro=0.06, grime=0.6, macro2=0.03,
                           patches={"size_m": 1.0, "share": 0.2, "amount": 0.025, "rough": 0.04}),
    "plaster_old": _scan("worn_mossy_plasterwall", 2.4, chroma=0.0, contrast=0.5, bump=0.35, macro=0.12, grime=1.3,
                         streaks={"amount": 0.3, "scale_m": 0.35, "top_frac": 0.8, "tint": [0.8, 0.76, 0.68]},
                         cracks={"amount": 0.45, "scale_m": 0.8, "width": 0.007, "share": 0.35}),
    "paint_gloss": _scan("plastered_wall_04", 2.0, chroma=0.0, bump=0.2, macro=0.05, grime=0.9, rough_scale=0.8,
                         patches={"size_m": 0.6, "share": 0.3, "amount": 0.04, "rough": 0.1},
                         edge_wear={"radius_m": 0.015, "amount": 0.5, "tint": [1.15, 1.13, 1.1], "rough": 0.1}),
    "ceiling": _scan("plastered_wall_04", 1.5, contrast=1.6, chroma=0.0, bump=0.25, macro=0.07, grime=0.8, macro2=0.03,
                     cracks={"amount": 0.25, "scale_m": 1.0, "width": 0.005, "share": 0.2}),
    "conc_wall": _scan("concrete_wall_008", 1.8, contrast=1.6, chroma=0.1, bump=0.5, macro=0.1, grime=1.2,
                       streaks={"amount": 0.25, "scale_m": 0.4, "top_frac": 0.7, "tint": [0.78, 0.76, 0.72]},
                       cracks={"amount": 0.35, "scale_m": 0.9, "width": 0.006, "share": 0.3}),
    "conc_wall_damp": _scan("concrete_wall_008", 1.8, contrast=1.6, chroma=0.1, bump=0.55, macro=0.12, grime=1.4,
                            streaks={"amount": 0.4, "scale_m": 0.35, "top_frac": 0.85, "tint": [0.7, 0.68, 0.64]},
                            cracks={"amount": 0.45, "scale_m": 0.8, "width": 0.007, "share": 0.35}),
    "conc_floor": _scan("concrete_floor_worn_001", 2.6, contrast=1.4, chroma=0.1, bump=0.4, macro=0.1, grime=1.0, rough_scale=0.9,
                        cracks={"amount": 0.35, "scale_m": 1.2, "width": 0.005, "share": 0.25}),
    "conc_polished": _scan("concrete_floor_worn_001", 3.0, chroma=0.05, bump=0.25, macro=0.08, grime=0.5, coat=0.25,
                           coat_roughness=0.2),
    "asphalt": _scan("asphalt_02", 3.5, chroma=0.1, bump=0.5, macro=0.12, grime=0.6,
                     cracks={"amount": 0.4, "scale_m": 1.6, "width": 0.006, "share": 0.3}),
    "brick": _scan("red_brick_03", 1.6, periodic=True, chroma=0.15, contrast=0.7, bump=0.6, macro=0.1, grime=1.1, obj_jitter_m=0.0, third=False,
                   streaks={"amount": 0.2, "scale_m": 0.4, "top_frac": 0.7, "tint": [0.75, 0.72, 0.68]}),
    "mud_wall": _scan("mud_cracked_dry_03", 2.5, chroma=0.0, bump=0.45, macro=0.12, grime=0.9),
    "tile": _scan("large_floor_tiles_02", 2.0, periodic=True, chroma=0.0, bump=0.4, macro=0.06, grime=0.8, obj_jitter_m=0.0, third=False,
                  rough_scale=0.85),
    "tile_gloss": _scan("large_floor_tiles_02", 2.0, periodic=True, chroma=0.0, bump=0.3, macro=0.05, grime=0.5, obj_jitter_m=0.0, third=False,
                        rough_scale=0.6, coat=0.2, coat_roughness=0.12),
    "metal_plate": _scan("metal_plate", 1.2, periodic=True, chroma=0.0, bump=0.6, macro=0.1, grime=0.9, obj_jitter_m=0.0, third=False,
                         rust={"amount": 0.35, "share": 0.25, "scale_m": 0.5, "tint": [0.3, 0.17, 0.08]}),
    "corrugated": _scan("corrugated_iron", 2.0, periodic=True, chroma=0.0, bump=0.7, macro=0.1, grime=1.0, obj_jitter_m=0.0, third=False,
                        streaks={"amount": 0.3, "scale_m": 0.3, "top_frac": 0.9, "tint": [0.7, 0.55, 0.4]}),
    "painted_steel": _scan("green_metal_rust", 1.4, contrast=2.0, chroma=0.0, bump=0.3, macro=0.08, grime=0.9,
                           edge_wear={"radius_m": 0.012, "amount": 0.5, "tint": [1.2, 1.18, 1.15], "rough": -0.05},
                           rust={"amount": 0.45, "share": 0.18, "scale_m": 0.45, "tint": [0.3, 0.17, 0.08]},
                           streaks={"amount": 0.2, "scale_m": 0.25, "top_frac": 0.6, "tint": [0.8, 0.66, 0.52]}),
    "stove_iron": _scan("green_metal_rust", 0.9, contrast=1.8, chroma=0.0, bump=0.35, macro=0.1, grime=0.8,
                        edge_wear={"radius_m": 0.008, "amount": 0.5, "tint": [1.35, 1.32, 1.3], "rough": -0.1},
                        rust={"amount": 0.3, "share": 0.12, "scale_m": 0.3, "tint": [0.3, 0.17, 0.08]}),
    "steel_clean": {"family": "metal", "tile_m": 0.5, "bump": 0.15, "grime": 0.6, "round_m": 0.006,
                    "edge_wear": {"radius_m": 0.01, "amount": 0.5, "tint": [1.25, 1.25, 1.25], "rough": -0.1}},
    "car_paint": {"family": "metal", "tile_m": 0.8, "bump": 0.08, "grime": 0.7, "coat": 0.6, "coat_roughness": 0.08, "macro": 0.05,
                  "streaks": {"amount": 0.15, "scale_m": 0.3, "top_frac": 0.5, "tint": [0.85, 0.82, 0.78]}},
    "brass": {"family": "metal", "tile_m": 0.3, "bump": 0.12, "grime": 0.8, "macro": 0.14, "round_m": 0.004,
              "edge_wear": {"radius_m": 0.006, "amount": 0.6, "tint": [1.25, 1.2, 1.1], "rough": -0.12},
              "patches": {"size_m": 0.15, "share": 0.35, "amount": 0.08, "rough": 0.12}},
    "flagstone": _scan("slate_floor_02", 2.6, chroma=0.1, bump=0.6, macro=0.1, grime=1.0),
    "cobble": _scan("stone_floor", 1.6, contrast=1.5, chroma=0.1, bump=0.7, macro=0.1, grime=1.0),
    "stone_block": _scan("stone_floor", 3.6, contrast=1.4, chroma=0.1, bump=0.6, macro=0.12, grime=1.1,
                         streaks={"amount": 0.25, "scale_m": 0.5, "top_frac": 0.8, "tint": [0.78, 0.76, 0.72]}),
    "drystone": _scan("stone_floor", 2.8, chroma=0.1, bump=0.85, macro=0.14, grime=1.2),
    "marble": {"family": "noise", "tile_m": 2.0, "macro": 0.1, "fine": 0.05, "bump": 0.1, "grime": 0.5, "coat": 0.35,
               "coat_roughness": 0.08, "cracks": {"amount": 0.3, "scale_m": 1.4, "width": 0.01, "share": 0.3, "tint": [0.86, 0.84, 0.82],
                                                  "depth": 0.0}},
    "wood_floor": _scan("weathered_plank_siding", 2.2, chroma=0.15, bump=0.5, macro=0.1, grime=1.0, obj_jitter_m=0.0, coat=0.12,
                        coat_roughness=0.3),
    "wood_deck": _scan("weathered_plank_siding", 2.4, chroma=0.15, bump=0.6, macro=0.12, grime=1.1, obj_jitter_m=0.0),
    "log_wall": _scan("weathered_plank_siding", 1.6, chroma=0.2, bump=0.6, macro=0.08, obj_jitter_m=0.0,
                      courses={"h_m": 0.22, "seam_m": 0.02, "jitter": 0.1, "hue": 0.04, "seam_tone": 0.62, "vary": 1.0, "round_m": 0.03,
                               "round_shade": 0.07},
                      round_m=0.01, edge_wear={"radius_m": 0.015, "amount": 0.5, "tint": [1.2, 1.15, 1.08], "rough": 0.1}),
    "boards_v": {"family": "grid", "tile_m": 0.14, "board_m": 2.6, "board_axis": "z", "row_axis": "xy", "joint": 0.035,
                 "joint_tone": 0.55, "tile_jitter": 0.09, "grain": 0.06, "fine": 0.05, "macro": 0.1, "bump": 0.45, "grime": 1.0,
                 "edge_wear": {"radius_m": 0.012, "amount": 0.45, "tint": [1.18, 1.14, 1.08], "rough": 0.1}},
    "timber": _scan("weathered_plank_siding", 1.6, chroma=0.12, bump=0.45, macro=0.1, grime=1.0, round_m=0.006,
                    edge_wear={"radius_m": 0.012, "amount": 0.45, "tint": [1.18, 1.14, 1.08], "rough": 0.1}),
    "timber_varnish": {"family": "grid", "tile_m": 0.18, "board_m": 2.2, "board_axis": "z", "row_axis": "xy", "joint": 0.012,
                       "joint_tone": 0.75, "tile_jitter": 0.06, "grain": 0.08, "fine": 0.04, "macro": 0.08, "bump": 0.25, "grime": 0.6,
                       "round_m": 0.005, "rough_scale": 0.85, "coat": 0.25, "coat_roughness": 0.2,
                       "edge_wear": {"radius_m": 0.008, "amount": 0.35, "tint": [1.15, 1.1, 1.05], "rough": 0.05}},
    "wallpaper": {"family": "wallpaper", "fine": 0.1, "macro": 0.14, "tile_m": 0.18, "stripe": 0.03, "bump": 0.1, "grime": 1.0, "seam_m": 0.53, "seam_tone": 0.88,
                  "yellow": {"from_m": 1.5, "to_m": 2.5, "tint": [1.0, 0.97, 0.9]}},
    "cloth_wall": {"family": "wallpaper", "tile_m": 0.5, "stripe": 0.0, "fine": 0.12, "macro": 0.16, "bump": 0.2, "grime": 1.0,
                   "seam_m": 0.53, "seam_tone": 0.9, "patches": {"size_m": 0.7, "share": 0.25, "amount": 0.05, "rough": 0.04},
                   "yellow": {"from_m": 1.6, "to_m": 2.6, "tint": [1.0, 0.98, 0.92]}},
    "fabric": _scan("hessian_380", 0.5, contrast=1.8, chroma=0.0, bump=0.35, macro=0.12, grime=0.9),
    "fabric_fine": _scan("hessian_380", 0.35, contrast=1.8, chroma=0.0, bump=0.25, macro=0.1, grime=0.7),
    "thatch": _scan("hessian_380", 1.2, chroma=0.0, bump=0.7, macro=0.16, grime=1.0),
    "paper": {"family": "paper", "tile_m": 0.3, "bump": 0.15, "grime": 0.4, "foxing": 0.25},
    "leather": {"family": "leather", "tile_m": 0.2, "bump": 0.3, "grime": 0.5, "coat": 0.1, "coat_roughness": 0.35,
                "edge_wear": {"radius_m": 0.01, "amount": 0.4, "tint": [1.18, 1.14, 1.1], "rough": -0.05}},
    "gravel": _scan("gravel_floor", 2.6, chroma=0.15, bump=0.7, macro=0.12, grime=0.5),
    "path": _scan("rocky_trail", 3.0, chroma=0.1, bump=0.6, macro=0.12, grime=0.5),
    "earth": _scan("forrest_ground_01", 3.0, contrast=1.5, chroma=0.1, bump=0.6, macro=0.12, grime=0.5),
    "dry_ground": _scan("mud_cracked_dry_03", 4.0, chroma=0.0, bump=0.45, macro=0.12, grime=0.4),
    "sand": _scan("coast_sand_01", 2.4, chroma=0.1, bump=0.45, macro=0.1, grime=0.3),
    "glass": {"family": "dirt-only", "dirt": 0.18},
    "glass_frosted": {"family": "dirt-only", "dirt": 0.15, "frost": {"mottle": 0.1, "mottle_m": 0.3, "wipe": 0.07, "rough": 0.32}},
}


# ---------------------------------------------------------------- classification
DEFER = [  # (phase, regex on the material name)
    ("P5", r"^(bark|bark-.*|home-bark|web-bark|knot-tan|knotted-thread|tissue-.*|marrow.*|membrane.*|muscle|crimson.*|bruise.*|blood.*|"
           r"cavity|rib|bone|bone-dark|fused-.*|crystal.*|core-.*|realm-.*|moss-forgotten|silver|silver-.*|moss-silver|fern-silver|"
           r"cottage-silver|cloud-bone|tarred-wood|hull|ink-hull|gem-.*|amber-crystal|book-spines|written-road|dead-coral|reef|"
           r"shell-string)$"),
    ("P4", r"^(rock|cliff|cavern|cavern-rock|outcrop|ledge-rock|ridge-rock|island-rock|gorge-rock|pale-cliff|snow|frost|ice-wall|crust|"
           r"salt-hill|rubble|obsidian|island|island-top|headland|mesa|peaks)$"),
    ("P3", r"^(conifer|canopy|pines?|spruce|vine|vine-glow|weed|moss|moss-.*|lichen-.*|grass|grass-.*|grey-grass|cool-grass|dry-grass|"
           r"meadow|birch-leaf|leaf-green|copper-leaves|prickle|roots|trunk|clean-trunk|tree-bark|dead-wood|deadwood|forest|"
           r"pine-needles|fungal-mat|fungus|plant-light)$"),
]
TEMP_P5 = r"^(bleached-sand|silver-sand|dune-light|far-dunes|vellum|paper-plain)$"  # TEMP sand set and book kit (P5)

RULES = [  # (preset, regex) first match wins; role and colour refinements in classify()
    ("glass_frosted", r"^(frosted|frosted-glass)$"),
    ("glass", r"glass"),
    ("conc_polished", r"^polished-concrete$"),
    ("conc", r"^(concrete|concrete-dark|floor-concrete|floor)$"),
    ("asphalt", r"^(asphalt|road|street)$"),
    ("brick", r"^(brick|soot-brick)$"),
    ("mud_wall", r"^(mud-brick|mud-wall|mud-orange|clay)$"),
    ("tile_gloss", r"^(floor-white|tile-white)$"),
    ("tile", r"^(floor-pale|floor-sage)$"),
    ("metal_plate", r"^(grate)$"),
    ("corrugated", r"^(tin)$"),
    ("car_paint", r"^(car-body|car-grey|van-red)$"),
    ("stove_iron", r"^(stove-iron|iron|cage)$"),
    ("painted_steel", r"^(steel|pipe|metal|fence|gate|mast|armour-plate|olive)$"),
    ("brass", r"^(brass|faded-gold|gold-leaf)$"),
    ("flagstone", r"^(flagstone|paving|plaza-stone|ring-stone|stone-floor|slate|roof-slate)$"),
    ("cobble", r"^(cobbles|wet-cobbles)$"),
    ("marble", r"^(marble|marble-cream|marble-green|stone-polished)$"),
    ("drystone", r"^(drystone|fire-pit)$"),
    ("stone_block", r"^(stone|customs-stone|quay-stone|sea-wall|well-stone|vault-stone|pale-stone|socket-stone|charter-stone|"
                    r"slate-stone|stone-step|limestone|granite|statue|tower)$"),
    ("wood_floor", r"^(floorboards|floorboard|oak-floor|parquet|boards|stage-oak)$"),
    ("wood_deck", r"^(deck-plank|jetty|planks|plank|ceiling-planks|weathered-board|stilt-wood|pit-timber)$"),
    ("log_wall", r"^(cedar-log|log)$"),
    ("boards_v", r"^(door|door-wood|door-olive|fence-wood|fence-grey|warehouse-wood|cedar-plank|panel|ring-wood|shingle|hut)$"),
    ("timber_varnish", r"^(walnut|mahogany|varnish|dark-walnut|sepia-wood|carved-wood|furniture|dais-wood|dark-wood|cabinet-cream)$"),
    ("timber", r"^(timber|beam|cedar|cedar-clean|worn-pine|pine-dark|pine-ply|pale-wood|pole-wood|pole|post|splinter-pale|shelving|"
               r"wood|skiff|spar|threshing|dais|rail|frame|proscenium)$"),
    ("wallpaper", r"^(wallpaper|wallpaper-green|paper-wall)$"),
    ("cloth_wall", r"^(bottle-green|quilted-felt|dome-felt)$"),
    ("fabric_fine", r"^(linen|curtain|upholstery|gingham|runner|carpet|banner|torn-fabric)$"),
    ("fabric", r"^(canvas|tarp|sail|sail-red|company-sail|bedroll|sacks|rope|seat-red)$"),
    ("thatch", r"^(thatch|straw|reed-mat|palm-thatch)$"),
    ("leather", r"^(sofa-brown|chair-black|dash|dash-black)$"),
    ("paper", r"^(paper|paper-plain|vellum|shelf-paper|bark-paper|ledger-red|cork|pigment)$"),
    ("gravel", r"^(gravel|dead-gravel|gravel-wet|gravel-bar|pearl-gravel|pebbles|pebble-beach)$"),
    ("path", r"^(dust|packed-earth|packed-track|path|path-earth|yard|yard-floor|sandy-path)$"),
    ("earth", r"^(earth|ground|silt|forest-floor|hillside|hill|slope|terrace|mound)$"),
    ("dry_ground", r"^(dry-slope|plateau|ochre|threshing-floor)$"),
    ("sand", r"^(sand|wet-sand|packed-sand|salt|ochre-sand|bleached-sand|silver-sand|dune-light)$"),
    ("paint_gloss", r"^(green-gloss|field-paint|sky-paint|sage|cream)$"),
    ("plaster", r"^(plaster|plaster-honey|plaster-grey|house-plaster|house-grey|wall-cream|wall-green|wall-ochre|wall-white|whitewash|"
                r"cream-paint|ivory-chalk|catalogue-white|clinical-white|white|wall|hall-wall|paint|stencil-wall|pan-wall|panel-slate|"
                r"ivory|headliner)$"),
    ("ceiling", r"^(ceiling|roof|moss-roof)$"),
]
CLEAN_LOC = r"(clinical|lab|gala|corporate|spire|atrium|hub|ballroom|catalogue|museum)"
OLD_LOC = (r"(cellar|cave|sewer|underworld|ruin|abandon|shed|barn|cold-store|boiler|basement|tunnel|crypt|dungeon|derelict|alley|"
          r"stairwell|garage|warehouse|laundry|vault|bunker|cell)")


def classify(game, loc, name, info):
    """-> (preset or None, reason). info: color, roughness, metallic, emission, alpha, roles (set)."""
    roles = info["roles"]
    if roles <= {"sky", "water"} or "water" in roles:
        return None, "P2 (sky or water)"
    for ph, rx in DEFER:
        if re.match(rx, name):
            return None, ph
    if game == "endless-temple" and re.match(TEMP_P5, name):
        return None, "P5"
    if info["emission"] > 0 and not re.search(r"glass|frosted", name):
        return None, "kept (emits)"
    if roles == {"opening"} and not re.match(r"^(door|door-olive|door-wood|gate)$", name):
        return None, "kept (opening)"
    for preset, rx in RULES:
        if re.search(rx, name):
            if preset == "conc":
                if roles & {"floor", "terrain"} and not roles & {"wall", "ceiling", "structure"}:
                    preset = "conc_floor"
                else:
                    preset = "conc_wall_damp" if (name == "concrete-dark" or re.search(OLD_LOC, loc)) else "conc_wall"
            if preset == "plaster":
                if re.search(CLEAN_LOC, loc) or name in ("clinical-white", "catalogue-white", "white"):
                    preset = "plaster_clean"
                elif re.search(OLD_LOC, loc) or game in ("wrymwretch",):
                    preset = "plaster_old"
                elif roles == {"ceiling"}:
                    preset = "ceiling"
            if preset == "painted_steel" and re.search(CLEAN_LOC, loc):
                preset = "steel_clean"
            if preset == "painted_steel" and game == "man-eater":
                preset = "painted_steel_me"
            return preset, "rule"
    return None, "unmatched"


def preset(name, game):
    if name == "painted_steel_me":  # Man Eater: rust kept amber-brown, well outside the red-brown stain band (G15, hue 340 to 20)
        p = json.loads(json.dumps(PRESETS["painted_steel"]))
        p["rust"]["tint"] = [0.3, 0.22, 0.1]
        p["streaks"]["tint"] = [0.82, 0.74, 0.6]
        return p
    return json.loads(json.dumps(PRESETS[name]))


def _blockouts(game):
    locs = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "build", "blender", game, "*", "*", "blockout.json"))):
        loc = os.path.basename(os.path.dirname(os.path.dirname(f)))
        with open(f, encoding="utf-8") as fh:
            j = json.load(fh)
        L = locs.setdefault(loc, {"mats": {}, "ceiling": False})
        for pc in j["pieces"]:
            m = pc.get("material")
            if not m:
                continue
            md = j["materials"].get(m, {})
            e = L["mats"].setdefault(m, {"color": md.get("color"), "roughness": md.get("roughness"), "metallic": md.get("metallic", 0.0),
                                         "emission": md.get("emission", 0.0) or 0.0, "alpha": md.get("alpha", 1.0), "roles": set()})
            e["roles"].add(pc.get("role"))
            if pc.get("role") == "ceiling":
                L["ceiling"] = True
    return locs


def location_entry(game, loc, L):
    mats, deferred, unmatched, kept = {}, {}, [], []
    for name in sorted(L["mats"]):
        pr, why = classify(game, loc, name, L["mats"][name])
        if pr:
            e = preset(pr, game)
            e["p1_preset"] = pr
            mats[name] = e
        elif why == "unmatched":
            unmatched.append(name)
        elif why.startswith("kept"):
            kept.append(name)
        else:
            deferred.setdefault(why.split()[0], []).append(name)
    interior = L["ceiling"]
    clean = bool(re.search(CLEAN_LOC, loc))
    old = bool(re.search(OLD_LOC, loc))
    g = ({"strength": 1.0, "ao": 0.24, "dust": 0.1, "damp": 0.1, "damp_height_m": 0.5, "ao_distance_m": 0.45, "tone_gain": 1.06}
         if interior else {"strength": 0.9, "ao": 0.2, "dust": 0.06, "damp": 0.12, "damp_height_m": 0.4, "ao_distance_m": 0.6, "tone_gain": 1.0})
    if clean:
        g["strength"] = 0.6
    if old:
        g.update(strength=1.25, damp=0.16, damp_height_m=0.7)
    ent = {"p1": {"version": VERSION, "interior": interior, "grade": "clean" if clean else ("old" if old else "worn"),
                  "deferred": deferred, "unmatched": unmatched, "kept": kept},
           "grime": g, "materials": mats}
    if interior and game != "man-eater" and not (game == "dr-tox-rise" and loc == "trial-53-arena"):
        ent["decals"] = [{"name": "stains", "count": 3 if clean else 5, "size_m": [0.4, 0.9], "tint": [0.32, 0.29, 0.24],
                          "opacity": 0.12 if clean else 0.18, "z_m": [1.0, 2.4]}]
    return ent


def build(game, cfg):
    cfg = cfg or {"game": game, "version": 1, "note": "", "locations": {}}
    locs = cfg.setdefault("locations", {})
    rep = {}
    for loc, L in sorted(_blockouts(game).items()):
        old = locs.get(loc, {})
        if old.get("materials") and not old.get("p1"):
            rep[loc] = "hand-made (pilot), left alone"
            continue
        ent = location_entry(game, loc, L)
        for k, v in (old.get("materials") or {}).items():  # carry gains.py corrections over when the preset is unchanged
            if k in ent["materials"] and v.get("p1_preset") == ent["materials"][k]["p1_preset"]:
                for kk in ("gain", "tint"):
                    if kk in v:
                        ent["materials"][k][kk] = v[kk]
        for k in ("grime_override", "props", "exposure_ev_delta", "atmos", "kits", "p2"):  # P2 keys survive a P1 re-run
            if k in old:
                ent[k] = old[k]
        if "grime_override" in old:
            ent["grime"].update(old["grime_override"])
        locs[loc] = ent
        rep[loc] = {"dressed": sorted(ent["materials"]), "deferred": ent["p1"]["deferred"], "unmatched": ent["p1"]["unmatched"]}
    return cfg, rep


def main(argv):
    games = sorted(os.listdir(os.path.join(ROOT, "build", "blender")))
    if "--games" in argv:
        games = argv[argv.index("--games") + 1].split(",")
    allrep = {}
    for g in games:
        p = os.path.join(HERE, g + ".dress.json")
        cfg = None
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                cfg = json.load(f)
        cfg, rep = build(g, cfg)
        if not cfg.get("note"):
            cfg["note"] = "P1 entries written by p1.py (core surfaces and grime)"
        allrep[g] = rep
        if "--write" in argv:
            with open(p, "w", encoding="utf-8", newline="\n") as f:
                json.dump(cfg, f, indent=1)
                f.write("\n")
    for k in PRESETS.values():
        assert k.get("scan") in (None,) or k["scan"] in P1_SCANS, k
    if "--report" in argv:
        with open(argv[argv.index("--report") + 1], "w", encoding="utf-8", newline="\n") as f:
            json.dump(allrep, f, indent=1)
    n = sum(1 for g in allrep.values() for v in g.values() if isinstance(v, dict))
    um = sorted({m for g in allrep.values() for v in g.values() if isinstance(v, dict) for m in v["unmatched"]})
    print("locations with P1 entries:", n, "unmatched materials:", len(um), um)


if __name__ == "__main__":
    main(sys.argv[1:])

"""Global rules for the dressing layer (rules.json): which layers a scene may have, banned words, the Man Eater stain filter."""
import colorsys
import json
import os
import re

_CACHE = {}


def load(dress_dir):
    p = os.path.join(dress_dir, "rules.json")
    if p not in _CACHE:
        with open(p, encoding="utf-8") as f:
            _CACHE[p] = json.load(f)
    return _CACHE[p]


def allowed_layers(rules, game, location, requested=None):
    """The layers a scene may run. The Dr. Tox arena: surfaces only. Man Eater: no decals."""
    layers = list(rules["layers"])
    a = rules["arena"]
    if game == a["game"] and location == a["location"]:
        layers = [x for x in layers if x in a["allowed_layers"]]
    me = rules["man_eater"]
    if game == me["game"]:
        layers = [x for x in layers if x not in me["denied_layers"]]
    if requested:
        layers = [x for x in layers if x in requested]
    return layers


def banned_hits(rules, text):
    """Banned words found in a name (whole words, case-insensitive; `-`, `_` and digits separate words)."""
    toks = set(re.split(r"[^a-z]+", text.lower()))
    return sorted(w for w in rules["banned_words"] if w in toks)


def in_red_brown_band(rules, rgb):
    """True when an sRGB colour (0..1) falls in Man Eater's forbidden stain band (hue 340 to 20 degrees, saturation over 0.4)."""
    h, s, v = colorsys.rgb_to_hsv(*rgb)
    lo, hi = rules["man_eater"]["stain_hue_band_deg"]
    deg = h * 360.0
    in_band = deg >= lo or deg <= hi
    return in_band and s > rules["man_eater"]["stain_min_saturation"] and v > 0.05

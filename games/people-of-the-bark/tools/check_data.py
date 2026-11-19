#!/usr/bin/env python3
"""Check People of the Bark's extra data files (docs/TECH.md, "Extra data files").

Checks data/omen_deck.json, data/recipes.json and data/tremor_patterns.json against their
schemas in data/schemas/ (required keys and types), against each other, and against the four
shared files (game.json, scenes.json, flags.json, endings.json).

Stdlib only. Usage, from the repo root: python games/people-of-the-bark/tools/check_data.py
Exits 0 when everything passes, 1 when anything fails.
"""
import json
import re
import sys
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent
DATA = GAME / "data"
SCHEMAS = DATA / "schemas"
EXTRA = ("omen_deck", "recipes", "tremor_patterns")

# The year's seasons as flags.json names them, by chapter (chapter 1 opens the spring).
SEASON_OF_CHAPTER = {
    "ch1_tremor": "spring", "ch2_spring": "spring", "ch3_summer": "summer",
    "ch4_autumn": "autumn", "ch5_winter": "winter", "ch6_shadow": "shadow",
    "ch7_pullback": "shadow",
}
SEASON_ORDER = ["spring", "summer", "autumn", "winter", "shadow"]

problems = []


def problem(msg):
    problems.append(msg)


def load(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        problem(f"missing {path.relative_to(GAME)}")
    except json.JSONDecodeError as exc:
        problem(f"{path.relative_to(GAME)}: not valid JSON ({exc})")
    return None


# --- a small JSON Schema subset: type, required, properties, items, enum, minimum, maximum,
# --- minItems, maxItems, pattern, $ref to #/$defs

TYPES = {
    "object": lambda v: isinstance(v, dict),
    "array": lambda v: isinstance(v, list),
    "string": lambda v: isinstance(v, str),
    "integer": lambda v: isinstance(v, int) and not isinstance(v, bool),
    "number": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
    "boolean": lambda v: isinstance(v, bool),
    "null": lambda v: v is None,
}


def validate(value, schema, root, where):
    if "$ref" in schema:
        ref = schema["$ref"]
        if not ref.startswith("#/$defs/"):
            problem(f"{where}: unsupported $ref {ref}")
            return
        target = root.get("$defs", {}).get(ref[len("#/$defs/"):])
        if target is None:
            problem(f"{where}: unknown $ref {ref}")
            return
        validate(value, target, root, where)
    if "type" in schema:
        allowed = schema["type"] if isinstance(schema["type"], list) else [schema["type"]]
        if not any(TYPES[t](value) for t in allowed):
            problem(f"{where}: expected {' or '.join(allowed)}, got {type(value).__name__}")
            return
    if "enum" in schema and value not in schema["enum"]:
        problem(f"{where}: {value!r} not one of {schema['enum']}")
    if TYPES["number"](value):
        if "minimum" in schema and value < schema["minimum"]:
            problem(f"{where}: {value} is below {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            problem(f"{where}: {value} is above {schema['maximum']}")
    if isinstance(value, str) and "pattern" in schema and not re.search(schema["pattern"], value):
        problem(f"{where}: {value!r} does not match {schema['pattern']}")
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                problem(f"{where}: missing '{key}'")
        for key, sub in schema.get("properties", {}).items():
            if key in value:
                validate(value[key], sub, root, f"{where}.{key}")
    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            problem(f"{where}: needs at least {schema['minItems']} items, has {len(value)}")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            problem(f"{where}: allows at most {schema['maxItems']} items, has {len(value)}")
        if "items" in schema:
            for i, item in enumerate(value):
                validate(item, schema["items"], root, f"{where}[{i}]")


# --- helpers over the shared files

def unique(items, key, where):
    seen = set()
    for item in items:
        k = item.get(key) if isinstance(item, dict) else item
        if k in seen:
            problem(f"{where}: duplicate {key} {k!r}")
        seen.add(k)
    return seen


def check_effects(effects, flags, where):
    for i, eff in enumerate(effects or []):
        name = eff.get("state")
        at = f"{where}[{i}]"
        if name not in flags:
            problem(f"{at}: state '{name}' is not declared in flags.json")
            continue
        ftype = flags[name]["type"]
        if "add" in eff and ftype not in ("meter", "counter"):
            problem(f"{at}: 'add' on '{name}', which is a {ftype}")
        if "set" in eff:
            val = eff["set"]
            if ftype == "bool" and not isinstance(val, bool):
                problem(f"{at}: '{name}' is a bool; set it to true or false")
            if ftype in ("meter", "counter") and (isinstance(val, bool) or not isinstance(val, (int, float))):
                problem(f"{at}: '{name}' is a {ftype}; set it to a number")
            if ftype == "enum" and val not in flags[name].get("values", []):
                problem(f"{at}: {val!r} is not a value of '{name}'")
        if "add" not in eff and "set" not in eff:
            problem(f"{at}: needs 'add' or 'set'")


def flag_of(flags, name, ftype, where):
    if name not in flags:
        problem(f"{where}: '{name}' is not declared in flags.json")
        return None
    if ftype and flags[name]["type"] != ftype:
        problem(f"{where}: '{name}' should be a {ftype}, is a {flags[name]['type']}")
    return flags[name]


def enum_values(flags, name):
    return [v for v in flags.get(name, {}).get("values", []) if v != "none"]


def leaves(cond):
    """Flatten a condition into its comparison leaves (only 'all' nesting is expected here)."""
    if cond is True:
        return []
    if isinstance(cond, dict) and "all" in cond:
        out = []
        for sub in cond["all"]:
            out.extend(leaves(sub))
        return out
    return [cond]


def scenes_of_game(scenes, game_id):
    return [s for s in scenes["scenes"] if s.get("game") == game_id]


# --- the three files

def check_omen(deck, flags, scenes, endings, by_id):
    w = "omen_deck.json"
    suit_ids = unique(deck["suits"], "id", f"{w} suits")
    sigil_ids = unique(deck["sigils"], "id", f"{w} sigils")
    prophecy = set(enum_values(flags, "prophecy.suit"))
    if suit_ids != prophecy:
        problem(f"{w}: suits {sorted(suit_ids)} differ from prophecy.suit values {sorted(prophecy)}")
    leading = set(enum_values(flags, "year.leading"))
    for s in deck["sigils"]:
        flag_of(flags, s["standing"], "meter", f"{w} sigil {s['id']}")
        if s["leads_as"] not in leading:
            problem(f"{w} sigil {s['id']}: leads_as '{s['leads_as']}' is not a value of year.leading")
    if {s["leads_as"] for s in deck["sigils"]} != leading:
        problem(f"{w}: sigils do not cover every value of year.leading")

    unique(deck["cards"], "id", f"{w} cards")
    unique(deck["cards"], "name", f"{w} cards")
    pairs = {}
    for c in deck["cards"]:
        if c["suit"] not in suit_ids:
            problem(f"{w} card {c['id']}: unknown suit '{c['suit']}'")
        if c["sigil"] not in sigil_ids:
            problem(f"{w} card {c['id']}: unknown sigil '{c['sigil']}'")
        pairs.setdefault((c["suit"], c["sigil"]), []).append(c["id"])
    for suit in suit_ids:
        for sigil in sigil_ids:
            n = len(pairs.get((suit, sigil), []))
            if n != 1:
                problem(f"{w}: suit '{suit}' has {n} cards of sigil '{sigil}'; needs exactly 1")

    events = {}
    for e in deck["event_cards"]:
        if e["id"] in events:
            problem(f"{w}: duplicate event card '{e['id']}'")
        events[e["id"]] = e
        for key in ("suit", "fit_suit"):
            if e[key] is not None and e[key] not in suit_ids:
                problem(f"{w} event {e['id']}: {key} '{e[key]}' is not a suit")
        if e["fit_suit"] is None and (e["fit_effects"] or e["fit_note"]):
            problem(f"{w} event {e['id']}: has fit effects but no fit suit")
        if e["fit_suit"] is not None and not (e["fit_effects"] or e["fit_note"]):
            problem(f"{w} event {e['id']}: has a fit suit but no payoff")
        if e["weight"] != 2:
            problem(f"{w} event {e['id']}: event cards have weight 2 (DESIGN 11.1), not {e['weight']}")
        check_effects(e["fit_effects"], flags, f"{w} event {e['id']}.fit_effects")

    rules = deck["rules"]
    if rules["tie_break_slot"] not in rules["slots"]:
        problem(f"{w} rules: tie_break_slot is not a slot")
    hand = rules["hand"]
    flag_of(flags, hand["standing"], "meter", f"{w} rules.hand")
    flag_of(flags, rules["fit_counter"], "counter", f"{w} rules")
    ledger = flag_of(flags, rules["ledger"], "ledger", f"{w} rules")
    if ledger:
        missing = {"season", "event", "meaning", "policy", "fit", "crown"} - set(ledger.get("fields", []))
        if missing:
            problem(f"{w} rules: ledger '{rules['ledger']}' lacks fields {sorted(missing)}")
    check_effects(rules["clear_effects"], flags, f"{w} rules.clear_effects")
    check_effects(rules["bold_effects"], flags, f"{w} rules.bold_effects")

    # appearances: one per Omen Spread scene, in play order, each event once
    spread_scenes = [s["id"] for s in scenes_of_game(scenes, "omen_spread")]
    listed = [a["scene"] for a in deck["appearances"]]
    if listed != spread_scenes:
        problem(f"{w} appearances: scenes {listed} should be the omen_spread scenes in order {spread_scenes}")
    unique(deck["appearances"], "event", f"{w} appearances")
    if {a["event"] for a in deck["appearances"]} != set(events):
        problem(f"{w} appearances: every event card should appear exactly once")
    shadow = deck["shadow"]
    lo_reg, hi_reg = hand["base"], hand["base"] + len(hand["plus_one_at"])
    mods = [m["add"] for m in shadow["hand_modifiers"]]
    lo_sh = shadow["hand_base"] + sum(m for m in mods if m < 0)
    hi_sh = shadow["hand_base"] + sum(m for m in mods if m > 0)
    for a in deck["appearances"]:
        at = f"{w} appearance {a['scene']}"
        lo, hi = a["hand"]
        if lo > hi:
            problem(f"{at}: hand range {a['hand']} is reversed")
        if a["event"] == "year":
            if a["hand"] != [deck["heirs"]["hand"]] * 2:
                problem(f"{at}: Pell's last spread has a hand of {deck['heirs']['hand']}")
        elif a["event"] == "shadow":
            if a["hand"] != [lo_sh, hi_sh]:
                problem(f"{at}: hand {a['hand']} should be {[lo_sh, hi_sh]} from shadow.hand_base and hand_modifiers")
        elif lo < lo_reg or hi > hi_reg:
            problem(f"{at}: hand {a['hand']} outside {lo_reg}-{hi_reg} the hand rule allows")
        if a["decides"] is not None:
            flag_of(flags, a["decides"], None, at)
            scene = by_id.get(a["scene"])
            if scene and a["decides"] not in scene.get("writes", []):
                problem(f"{at}: decides '{a['decides']}' but scenes.json does not list it in writes")
        scene = by_id.get(a["scene"])
        if scene and rules["ledger"] not in scene.get("writes", []) and a["event"] != "year":
            problem(f"{at}: scenes.json writes do not include '{rules['ledger']}'")

    gm = deck["god_or_monster"]
    if gm["monster_if_policy"] not in sigil_ids:
        problem(f"{w} god_or_monster: '{gm['monster_if_policy']}' is not a sigil")
    for name in ("beetle_reading", "ant_reading"):
        vals = enum_values(flags, name)
        for v in (gm["monster"], gm["otherwise"]):
            if v not in vals:
                problem(f"{w} god_or_monster: {v!r} is not a value of {name}")
        if not any(a["decides"] == name for a in deck["appearances"]):
            problem(f"{w} appearances: no spread decides '{name}'")

    heirs = set(enum_values(flags, "pell.heir"))
    got = set()
    for h in deck["heirs"]["by_policy"]:
        if h["heir"] not in heirs:
            problem(f"{w} heirs: '{h['heir']}' is not a value of pell.heir")
        got.add(h["heir"])
        check_effects(h["effects"], flags, f"{w} heirs {h['policy']}")
    if got != heirs:
        problem(f"{w} heirs: should name each of {sorted(heirs)} once")

    # the Reading of the Shadow
    if shadow["deck_size"] != 12:
        problem(f"{w} shadow: the Year deck has 12 cards (DESIGN 11.1)")
    for m in shadow["hand_modifiers"]:
        flag_of(flags, m["flag"], "bool", f"{w} shadow.hand_modifiers")
    readings = set(enum_values(flags, "shadow_reading"))
    if shadow["fallback"] not in readings:
        problem(f"{w} shadow: fallback '{shadow['fallback']}' is not a value of shadow_reading")
    if {r["reading"] for r in shadow["readings"]} != readings:
        problem(f"{w} shadow: readings should cover {sorted(readings)} once each")
    unique(shadow["readings"], "placed", f"{w} shadow.readings")
    c6 = by_id.get("c6_omen", {})
    for r in shadow["readings"]:
        at = f"{w} shadow reading {r['reading']}"
        if r["scene"] not in c6.get("next", []):
            problem(f"{at}: scene '{r['scene']}' is not a next scene of c6_omen")
        if r["placed"] not in sigil_ids | {"balanced"}:
            problem(f"{at}: placed '{r['placed']}' is not a sigil or balanced")
        for leaf in leaves(r["allowed_if"]):
            if not isinstance(leaf, dict) or "is" not in leaf:
                problem(f"{at}: allowed_if supports only 'all' of 'is' comparisons")
                continue
            flag_of(flags, leaf["is"], None, at)
        if r["reading"] == shadow["fallback"] and r["allowed_if"] is not True:
            problem(f"{at}: the fallback reading must always be allowed")
        # the gate here must be the ending's own gate (less the bark check, which the touch decides)
        for e in endings["endings"]:
            conds = leaves(e["when"])
            if {"is": "shadow_reading", "eq": r["reading"]} not in conds:
                continue
            want = [c for c in conds if c.get("is") not in ("shadow_reading", "bark.integrity")]
            have = leaves(r["allowed_if"])
            if sorted(map(json.dumps, want)) != sorted(map(json.dumps, have)):
                problem(f"{at}: allowed_if {have} does not match ending '{e['id']}' conditions {want}")
            if r["scene"] not in e.get("final_scenes", []):
                problem(f"{at}: scene '{r['scene']}' is not among ending '{e['id']}' final scenes")
    as_written = [e for e in endings["endings"] if e.get("as_written")]
    fb = next((r for r in shadow["readings"] if r["reading"] == shadow["fallback"]), None)
    if fb and as_written and fb["scene"] not in as_written[0].get("final_scenes", []):
        problem(f"{w} shadow: the fallback reading's scene should be the as-written ending's branch scene")
    return events


def check_recipes(rec, flags, scenes, by_id, deck):
    w = "recipes.json"
    pot = rec["pot"]
    cells = {(t["heat"], t["boil"]) for t in rec["thickness"]}
    want = {(h, b) for h in pot["heats"] for b in pot["boils"]}
    if cells != want or len(rec["thickness"]) != len(want):
        problem(f"{w} thickness: needs exactly one row per heat and boil")
    reachable = {t["thickness"] for t in rec["thickness"]}
    stirs = sorted(rec["stirs"], key=lambda s: s["min"])
    expect = 0
    for band in stirs:
        if band["min"] != expect or band["max"] < band["min"]:
            problem(f"{w} stirs: bands must run 0..{pot['stirs_max']} without gaps or overlaps")
        expect = band["max"] + 1
    if expect != pot["stirs_max"] + 1:
        problem(f"{w} stirs: bands end at {expect - 1}, not {pot['stirs_max']}")
    bands = {(b["min"], b["max"]): b["texture"] for b in stirs}
    textures = set(bands.values())
    if rec["ruined"]["thickness"] not in reachable or rec["ruined"]["texture"] not in textures:
        problem(f"{w} ruined: unknown thickness or texture")

    ingr = {i["id"]: i for i in rec["ingredients"]}
    unique(rec["ingredients"], "id", f"{w} ingredients")
    for i in rec["ingredients"]:
        bad = set(i["seasons"]) - set(SEASON_ORDER)
        if bad:
            problem(f"{w} ingredient {i['id']}: unknown seasons {sorted(bad)}")
    bases = [i for i in ingr.values() if i["base"]]
    if len(bases) != 1:
        problem(f"{w} ingredients: exactly one base ingredient (sap)")

    unique(rec["recipes"], "id", f"{w} recipes")
    numbers = [r["number"] for r in rec["recipes"]]
    if sorted(numbers) != list(range(1, 13)):
        problem(f"{w} recipes: numbers should be 1 to 12 once each")
    recipes = {r["number"]: r for r in rec["recipes"]}
    for r in rec["recipes"]:
        at = f"{w} recipe {r['number']} {r['name']}"
        if r["thickness"] not in reachable:
            problem(f"{at}: thickness '{r['thickness']}' cannot be cooked")
        if tuple(r["stirs"]) not in bands:
            problem(f"{at}: stirs {r['stirs']} is not one of the stir bands")
        elif r["thickness"] == rec["ruined"]["thickness"] and bands[tuple(r["stirs"])] == rec["ruined"]["texture"]:
            problem(f"{at}: needs a pot that is always ruined")
        if len(r["ingredients"]) > pot["max_ingredients"]:
            problem(f"{at}: more than {pot['max_ingredients']} ingredients")
        if len(set(r["ingredients"])) != len(r["ingredients"]):
            problem(f"{at}: an ingredient is listed twice")
        for name in r["ingredients"]:
            if name not in ingr:
                problem(f"{at}: unknown ingredient '{name}'")
            elif ingr[name]["base"]:
                problem(f"{at}: the base '{name}' is always in the pot; do not list it")
            elif r["opens"] not in ingr[name]["seasons"]:
                problem(f"{at}: opens in {r['opens']} but '{name}' is not available then")
        if r["ordered"] and len(r["ingredients"]) < 2:
            problem(f"{at}: ordered needs two or more ingredients")
        if not r["effects"]:
            problem(f"{at}: has no effect")
        check_effects(r["effects"], flags, f"{at}.effects")
        if r["category"] == "sealant" and not any(e["state"] == "bark.integrity" for e in r["effects"]):
            problem(f"{at}: a sealant raises bark.integrity")
        if r["category"] == "offering" and not any(e["state"] == "inst.elders" for e in r["effects"]):
            problem(f"{at}: an offering raises the Knot (inst.elders)")
        if r["category"] == "food" and not any(e["state"] == "food" for e in r["effects"]):
            problem(f"{at}: a food recipe raises food")
    # no two recipes can be cooked from the same pot
    rs = rec["recipes"]
    for i, a in enumerate(rs):
        for b in rs[i + 1:]:
            if a["thickness"] != b["thickness"] or sorted(a["ingredients"]) != sorted(b["ingredients"]):
                continue
            if a["ordered"] and b["ordered"] and a["ingredients"] != b["ingredients"]:
                continue
            if a["stirs"][0] <= b["stirs"][1] and b["stirs"][0] <= a["stirs"][1]:
                problem(f"{w}: recipes {a['number']} and {b['number']} can come from the same pot")
    check_effects(rec["unmatched"]["effects"], flags, f"{w} unmatched.effects")
    flag_of(flags, rec["every_pot"]["found_counter"], "counter", f"{w} every_pot")
    flag_of(flags, rec["every_pot"]["offering_counter"], "counter", f"{w} every_pot")
    flag_of(flags, "sap", "meter", w)

    kitchen = [s["id"] for s in scenes_of_game(scenes, "sap_kitchen")]
    listed = [v["scene"] for v in rec["visits"]]
    if listed != kitchen:
        problem(f"{w} visits: scenes {listed} should be the sap_kitchen scenes in order {kitchen}")
    offering_scene = None
    if deck:
        offering_scene = next((r["scene"] for r in deck["shadow"]["readings"] if r["reading"] == "offering"), None)
    first_seen = {}
    previous = set()
    for v in rec["visits"]:
        at = f"{w} visit {v['scene']}"
        scene = by_id.get(v["scene"], {})
        season = SEASON_OF_CHAPTER.get(scene.get("chapter"))
        opened = set(v["open_recipes"])
        for n in opened:
            if n not in recipes:
                problem(f"{at}: recipe {n} does not exist")
                continue
            for name in recipes[n]["ingredients"]:
                if name in ingr and season not in ingr[name]["seasons"]:
                    problem(f"{at}: recipe {n} needs '{name}', not available in {season}")
        writes = set(scene.get("writes", []))
        for eff in v["on_finish"]:
            if eff["state"] not in writes:
                problem(f"{at}: on_finish changes '{eff['state']}', which scenes.json does not list in writes")
        check_effects(v["on_finish"], flags, f"{at}.on_finish")
        if v["caps_lifted"]:
            if v["scene"] != offering_scene:
                problem(f"{at}: only the offering branch lifts the caps")
            if v["sap"] != "all":
                problem(f"{at}: the Great Offering cooks all the city's sap")
            continue
        if not isinstance(v["sap"], int) or v["sap"] % pot["sap_cost"]:
            problem(f"{at}: sap {v['sap']!r} should be a whole number of {pot['sap_cost']}-sap pots")
        if not previous <= opened:
            problem(f"{at}: recipes {sorted(previous - opened)} were open earlier and are missing")
        for n in sorted(opened - previous):
            first_seen[n] = season
        previous = opened
    for n, r in recipes.items():
        if n not in first_seen:
            problem(f"{w} recipe {n}: never opened at a regular visit")
        elif first_seen[n] != r["opens"]:
            problem(f"{w} recipe {n}: opens in {r['opens']} but first open at a {first_seen[n]} visit")


def derive(scroll, day, part):
    weather = scroll["weather"][day - 1]
    for rule in scroll["rules"]:
        if rule["part"] != part:
            continue
        if "weather" in rule and weather not in rule["weather"]:
            continue
        if "every" in rule and day % rule["every"]:
            continue
        if "skip_every" in rule and day % rule["skip_every"] == 0:
            continue
        return rule
    return None


def check_tremors(tp, flags, scenes, by_id, endings, deck):
    w = "tremor_patterns.json"
    sc = tp["scoring"]
    for key in ("correct_effects", "fine_effects", "every_forecast"):
        check_effects(sc[key], flags, f"{w} scoring.{key}")
    h = tp["hints"]
    flag_of(flags, h["standing"], "meter", f"{w} hints")
    flag_of(flags, h["extra_levels"], "counter", f"{w} hints")
    if not h["underline_at"] < h["overlay_at"]:
        problem(f"{w} hints: underline_at should be below overlay_at")
    smin, smax = tp["strengths"]

    scroll_scenes = [s["id"] for s in scenes_of_game(scenes, "tremor_scroll")]
    listed = [s["scene"] for s in tp["scrolls"]]
    if listed != scroll_scenes:
        problem(f"{w} scrolls: scenes {listed} should be the tremor_scroll scenes in order {scroll_scenes}")
    total = 0
    tread_cells = 0
    for s in tp["scrolls"]:
        at = f"{w} scroll {s['scene']}"
        scene = by_id.get(s["scene"], {})
        season = SEASON_OF_CHAPTER.get(scene.get("chapter"))
        if s["season"] != season:
            problem(f"{at}: season '{s['season']}' but its chapter is the {season}")
        for i, rule in enumerate(s["rules"]):
            rat = f"{at} rules[{i}]"
            if rule["part"] not in tp["parts"]:
                problem(f"{rat}: unknown part '{rule['part']}'")
            if rule["face"] == "all":
                if not rule.get("tread"):
                    problem(f"{rat}: only the tread ripples on every face")
            elif rule["face"] not in tp["faces"]:
                problem(f"{rat}: unknown face '{rule['face']}'")
            if not smin <= rule["strength"] <= smax:
                problem(f"{rat}: strength outside {smin}-{smax}")
            for wx in rule.get("weather", []):
                if wx not in tp["weathers"]:
                    problem(f"{rat}: unknown weather '{wx}'")
        bad = set(s["weather"]) - set(tp["weathers"])
        if bad:
            problem(f"{at}: unknown weather {sorted(bad)}")
        if not s["forecasts"]:
            problem(f"{at}: no forecasts")
            continue
        last = max(f["day"] for f in s["forecasts"])
        if len(s["weather"]) != last:
            problem(f"{at}: weather has {len(s['weather'])} days; needs one per day up to day {last}")
            continue
        # every rule must show at least once on the days the scroll shows, or it cannot be read
        for i, rule in enumerate(s["rules"]):
            if not any(derive(s, d, p) is rule for d in range(1, s["days_shown"] + 1) for p in tp["parts"]):
                problem(f"{at} rules[{i}]: never appears on the {s['days_shown']} days shown")
        seen = set()
        for f in s["forecasts"]:
            fat = f"{at} forecast day {f['day']} {f['part']}"
            if (f["day"], f["part"]) in seen:
                problem(f"{fat}: listed twice")
            seen.add((f["day"], f["part"]))
            if f["day"] <= s["days_shown"]:
                problem(f"{fat}: a forecast must be after the {s['days_shown']} days shown")
            if f["part"] not in tp["parts"]:
                problem(f"{fat}: unknown part")
                continue
            rule = derive(s, f["day"], f["part"])
            truth = None if rule is None else {"face": rule["face"], "strength": rule["strength"]}
            if f["answer"] != truth:
                problem(f"{fat}: answer {f['answer']} but the pattern gives {truth}")
            if "sets" in f:
                flag_of(flags, f["sets"], "bool", fat)
                if f["sets"] not in scene.get("writes", []):
                    problem(f"{fat}: sets '{f['sets']}', which scenes.json does not list in writes")
                if not (rule and rule.get("tread")):
                    problem(f"{fat}: only the tread forecast sets a flag")
                else:
                    tread_cells += 1
                    nxt = next(d for d in range(s["days_shown"] + 1, 10 ** 4) if d % rule["every"] == 0)
                    if f["day"] != nxt:
                        problem(f"{fat}: the next tread day after day {s['days_shown']} is {nxt}")
        total += len(s["forecasts"])
    if total != tp["total_forecasts"]:
        problem(f"{w}: the scrolls hold {total} forecasts; total_forecasts says {tp['total_forecasts']}")
    if tread_cells != 1:
        problem(f"{w}: exactly one forecast should be the tread day (found {tread_cells})")
    if deck:
        for m in deck["shadow"]["hand_modifiers"]:
            if m["flag"] == "tread_forecast" and tread_cells != 1:
                problem(f"{w}: omen_deck's shadow hand reads tread_forecast, which no forecast sets")

    need = tp["scholars_ending_needs"]
    if need > tp["total_forecasts"]:
        problem(f"{w}: scholars_ending_needs {need} is more than the {tp['total_forecasts']} forecasts")
    found = False
    for e in endings["endings"]:
        for c in leaves(e["when"]):
            if isinstance(c, dict) and c.get("is") == "forecasts_correct":
                found = True
                if c.get("gte") != need:
                    problem(f"{w}: ending '{e['id']}' needs forecasts_correct >= {c.get('gte')}, not {need}")
    if not found:
        problem(f"{w}: no ending reads forecasts_correct")


def main():
    shared = {n: load(DATA / f"{n}.json") for n in ("game", "scenes", "flags", "endings")}
    extra = {n: load(DATA / f"{n}.json") for n in EXTRA}
    for n in EXTRA:
        schema = load(SCHEMAS / f"{n}.schema.json")
        if schema is not None and extra[n] is not None:
            validate(extra[n], schema, schema, f"{n}.json")
    if any(v is None for v in shared.values()) or any(v is None for v in extra.values()) or problems:
        return report()

    flags = {f["name"]: f for f in shared["flags"]["state"]}
    scenes = shared["scenes"]
    by_id = {s["id"]: s for s in scenes["scenes"]}
    chapters = {c["id"] for c in shared["game"]["chapters"]}
    for s in scenes["scenes"]:
        if s["chapter"] not in SEASON_OF_CHAPTER or s["chapter"] not in chapters:
            problem(f"scenes.json: chapter '{s['chapter']}' has no season in check_data.py")
    if set(SEASON_ORDER) != set(enum_values(flags, "season")):
        problem("flags.json: season values differ from the seasons check_data.py knows")

    check_omen(extra["omen_deck"], flags, scenes, shared["endings"], by_id)
    check_recipes(extra["recipes"], flags, scenes, by_id, extra["omen_deck"])
    check_tremors(extra["tremor_patterns"], flags, scenes, by_id, shared["endings"], extra["omen_deck"])
    return report()


def report():
    if problems:
        for p in problems:
            print(p)
        return 1
    print("ok people-of-the-bark extra data")
    return 0


if __name__ == "__main__":
    sys.exit(main())

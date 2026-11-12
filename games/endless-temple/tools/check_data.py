#!/usr/bin/env python3
"""Check The Endless Temple's extra data files.

Checks data/herbs.json, data/tablets.json and data/past_pack.json against their schemas in
data/schemas/ (required keys, types, enums, bounds, patterns), against one another, and against
the four shared files (game.json, scenes.json, flags.json, endings.json), as DESIGN.md sections 5,
11, 12 and 18 describe them.

Stdlib only. Run from anywhere: python games/endless-temple/tools/check_data.py
Exits 0 when every check passes, 1 otherwise.
"""
import itertools
import json
import math
import sys
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent
DATA = GAME / "data"
SCHEMAS = DATA / "schemas"
REPO = GAME.parent.parent
# The source works live in the sibling Pipelines-Plugin repository; checked only when present.
VAULT_REPO = REPO.parent / "Pipelines-Plugin"

EXTRA = ("herbs", "tablets", "past_pack")
TYPES = {
    "object": dict, "array": list, "string": str, "boolean": bool, "null": type(None),
}
# DESIGN.md section 12: endings' last-line variant needs past_known >= 6, and a first
# playthrough finds at least F1 to F6.
PAST_VARIANT_THRESHOLD = 6
# DESIGN.md section 7: which book each reading chapter opens.
BOOK_OF_CHAPTER = {"c2_circle": "sand_book", "c4_dunes": "sand_book", "c6_father": "sand_book",
                   "c9_end": "sand_book", "c5_hollin": "weather_book", "c7_procession": "road_book"}

problems = []


def problem(msg):
    problems.append(msg)


def load(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        problem(f"missing {path.relative_to(REPO)}")
    except json.JSONDecodeError as exc:
        problem(f"{path.relative_to(REPO)}: not valid JSON ({exc})")
    return None


def is_type(value, name):
    if name == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if name == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    return isinstance(value, TYPES[name])


def validate(value, schema, where):
    """A small subset of JSON Schema 2020-12: type, enum, required, properties, items,
    minimum, maximum, minItems, maxItems, pattern (anchored, character classes only)."""
    if "enum" in schema and value not in schema["enum"]:
        problem(f"{where}: {value!r} is not one of {schema['enum']}")
        return
    types = schema.get("type")
    if types is not None:
        types = types if isinstance(types, list) else [types]
        if not any(is_type(value, t) for t in types):
            problem(f"{where}: expected {' or '.join(types)}, got {type(value).__name__}")
            return
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                problem(f"{where}: missing '{key}'")
        for key, sub in schema.get("properties", {}).items():
            if key in value:
                validate(value[key], sub, f"{where}.{key}")
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            problem(f"{where}: needs at least {schema['minItems']} items, has {len(value)}")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            problem(f"{where}: allows at most {schema['maxItems']} items, has {len(value)}")
        if "items" in schema:
            for i, item in enumerate(value):
                validate(item, schema["items"], f"{where}[{i}]")
    if is_type(value, "number"):
        if "minimum" in schema and value < schema["minimum"]:
            problem(f"{where}: {value} is below {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            problem(f"{where}: {value} is above {schema['maximum']}")
    if isinstance(value, str) and "pattern" in schema:
        import re
        if not re.search(schema["pattern"], value):
            problem(f"{where}: {value!r} does not match {schema['pattern']}")


def vault_line(rel_path, line):
    path = VAULT_REPO / rel_path
    if not path.is_file():
        return None
    lines = path.read_text(encoding="utf-8").splitlines()
    return lines[line - 1].strip() if 0 < line <= len(lines) else ""


def vault_text(rel_path):
    path = VAULT_REPO / rel_path
    return path.read_text(encoding="utf-8") if path.is_file() else None


# ---------------------------------------------------------------------------------------------

def brew_result(herbs, dial, base, spoons, mark):
    cup = [base] + list(spoons)
    depth = sum(herbs[h]["depth"] for h in cup)
    length = sum(herbs[h]["length"] for h in cup)
    binding = sum(herbs[h]["binding"] for h in cup)
    d = dial[mark]
    return {"depth": math.floor(depth * d["depth_factor"]),
            "length": length + d["length_add"],
            "binding": binding + d["binding_add"]}


def meets(req, r):
    return (r["depth"] >= req.get("depth_min", -999) and r["length"] >= req.get("length_min", -999)
            and r["binding"] <= req.get("binding_max", 999))


def check_herbs(doc, ctx):
    scenes, order, chapters, flags = ctx["scenes"], ctx["order"], ctx["chapters"], ctx["flags"]
    herbs = {}
    for i, h in enumerate(doc["herbs"]):
        where = f"herbs.json herbs[{i}] '{h.get('id')}'"
        if h["id"] in herbs:
            problem(f"{where}: duplicate id")
        herbs[h["id"]] = h
        if h["chapter"] not in chapters:
            problem(f"{where}: chapter '{h['chapter']}' not in game.json")
        s = scenes.get(h["scene"])
        if s is None:
            problem(f"{where}: scene '{h['scene']}' not in scenes.json")
            continue
        if s["chapter"] != h["chapter"]:
            problem(f"{where}: scene '{h['scene']}' is in {s['chapter']}, not {h['chapter']}")
        if "herbs" not in s.get("writes", []):
            problem(f"{where}: scene '{h['scene']}' does not write the 'herbs' ledger")
    base = doc["base"]
    if base not in herbs:
        problem(f"herbs.json: base '{base}' is not a herb")
        return
    dial = {d["mark"]: d for d in doc["steep_dial"]}
    if sorted(dial) != [1, 2, 3, 4, 5]:
        problem("herbs.json steep_dial: needs marks 1 to 5, once each")
        return
    neutral = dial[3]
    if (neutral["depth_factor"], neutral["length_add"], neutral["binding_add"]) != (1, 0, 0):
        problem("herbs.json steep_dial: mark 3 must be neutral")

    # Flags the tea writes.
    for name in ("brew.depth", "brew.length", "brew.binding", "tea_hold", "steep", "sand_leak", "herbs"):
        if name not in flags:
            problem(f"herbs.json: relies on '{name}', which flags.json does not declare")
    th = doc["tea_hold"]
    if "tea_hold" in flags and flags["tea_hold"].get("range", [0, 0])[1] != th["max"]:
        problem(f"herbs.json tea_hold.max {th['max']} differs from flags.json tea_hold range")

    # Every possible cup must fit the declared brew meters.
    spoons = doc["spoons"]
    worst = {"depth": [math.inf, -math.inf], "length": [math.inf, -math.inf], "binding": [math.inf, -math.inf]}
    for combo in itertools.combinations_with_replacement(sorted(herbs), spoons):
        for mark in dial:
            r = brew_result(herbs, dial, base, combo, mark)
            for k in worst:
                worst[k][0] = min(worst[k][0], r[k])
                worst[k][1] = max(worst[k][1], r[k])
    for k, (lo, hi) in worst.items():
        rng = flags.get(f"brew.{k}", {}).get("range")
        if rng and (lo < rng[0] or hi > rng[1]):
            problem(f"herbs.json: brew.{k} can reach {lo}..{hi}, outside flags.json range {rng}")

    # The brews: one per tea scene, jars = herbs found before it, solution works.
    tea_scenes = [sid for sid in order if scenes[sid].get("game") == "tea"]
    brew_scenes = [b["scene"] for b in doc["brews"]]
    if sorted(brew_scenes) != sorted(tea_scenes):
        problem(f"herbs.json brews: scenes {brew_scenes} do not match the tea scenes {tea_scenes}")
    for i, b in enumerate(doc["brews"]):
        where = f"herbs.json brews[{i}] '{b['scene']}'"
        if b["scene"] not in scenes:
            problem(f"{where}: scene not in scenes.json")
            continue
        at = order.index(b["scene"])
        unknown = [j for j in b["jars"] if j not in herbs]
        if unknown:
            problem(f"{where}: unknown jars {unknown}")
            continue
        found = sorted(h for h in herbs if herbs[h]["scene"] in scenes and order.index(herbs[h]["scene"]) < at)
        if sorted(b["jars"]) != found:
            problem(f"{where}: jars {sorted(b['jars'])} are not the herbs found before it {found}")
        for key in b["requirement"]:
            if key not in ("depth_min", "length_min", "binding_max"):
                problem(f"{where}: unknown requirement '{key}'")
        sol = b["solution"]
        if sol is None:
            if b["requirement"]:
                problem(f"{where}: a brew with a requirement needs a solution")
            continue
        if len(sol["spoons"]) != spoons:
            problem(f"{where}: solution uses {len(sol['spoons'])} spoons, not {spoons}")
        bad = [s for s in sol["spoons"] if s not in b["jars"]]
        if bad:
            problem(f"{where}: solution uses herbs not on the shelf {bad}")
            continue
        r = brew_result(herbs, dial, base, sol["spoons"], sol["mark"])
        if r != sol["result"]:
            problem(f"{where}: solution gives {r}, file says {sol['result']}")
        if not meets(b["requirement"], r):
            problem(f"{where}: solution {r} does not meet {b['requirement']}")
    if not any(b["solution"] is None and not b["requirement"] for b in doc["brews"]):
        problem("herbs.json brews: the last pot (no requirement, player's choice) is missing")
    return herbs


def check_tablets(doc, ctx):
    scenes, order, flags = ctx["scenes"], ctx["order"], ctx["flags"]
    sc = doc["scrutiny"]
    f = flags.get(sc["flag"])
    if not f or f["type"] != "meter":
        problem(f"tablets.json scrutiny.flag '{sc['flag']}' is not a meter in flags.json")
    elif f["range"][1] != sc["watcher_at"]:
        problem(f"tablets.json scrutiny.watcher_at {sc['watcher_at']} differs from {sc['flag']} range {f['range']}")
    if sc["per_failed_test"] <= 0 or sc["watcher_at"] % sc["per_failed_test"]:
        problem("tablets.json scrutiny: watcher_at must be a whole number of failed tests")
    if doc["hints"]["key_word_after_failed_tests"] >= doc["hints"]["way_after_failed_tests"]:
        problem("tablets.json hints: the key-word hint must come before the way hint")

    tablet_scenes = [sid for sid in order if scenes[sid].get("game") == "tablet"]
    listed = [t["scene"] for t in doc["tablets"]]
    if sorted(listed) != sorted(tablet_scenes):
        problem(f"tablets.json: scenes {listed} do not match the tablet scenes {tablet_scenes}")
    loophole_flags = set()
    for t in doc["tablets"]:
        where = f"tablets.json '{t['scene']}'"
        s = scenes.get(t["scene"])
        if s is None:
            problem(f"{where}: scene not in scenes.json")
            continue
        if BOOK_OF_CHAPTER.get(s["chapter"]) != t["book"]:
            problem(f"{where}: book '{t['book']}' is not the book read in {s['chapter']}")
        writes = s.get("writes", [])
        for name in [t["loophole_flag"], *t["also_sets"], sc["flag"], "rules_broken"]:
            if name not in flags:
                problem(f"{where}: '{name}' is not declared in flags.json")
            elif name not in writes:
                problem(f"{where}: scene does not write '{name}'")
        if t["loophole_flag"] in flags and flags[t["loophole_flag"]]["type"] != "bool":
            problem(f"{where}: loophole flag '{t['loophole_flag']}' is not a bool")
        if t["loophole_flag"] in loophole_flags:
            problem(f"{where}: loophole flag '{t['loophole_flag']}' used by two tablets")
        loophole_flags.add(t["loophole_flag"])

        ns = [r["n"] for r in t["rules"]]
        if ns != list(range(1, len(ns) + 1)):
            problem(f"{where}: rules must be numbered 1 to {len(ns)} in order, got {ns}")
        for r in t["rules"]:
            rw = f"{where} rule {r['n']}"
            if (r["key_word"] is None) != (r["meaning"] is None):
                problem(f"{rw}: a key word needs a meaning, and a meaning needs a key word")
            if r["key_word"] and r["key_word"].lower() not in r["text"].lower():
                problem(f"{rw}: key word '{r['key_word']}' is not in the rule's text")
            if r.get("price") and " or " not in r["text"]:
                problem(f"{rw}: a price rule must offer its 'or'")
            if r["origin"] == "source":
                full = vault_text(ctx["source_path"])
                if full is not None and r["text"] not in full:
                    problem(f"{rw}: marked source, but not found verbatim in {ctx['source_path']}")
        ways = [w["id"] for w in t["ways"]]
        if len(set(ways)) != len(ways):
            problem(f"{where}: duplicate way ids")
        sol = t["solution"]
        if len(sol) > doc["plan_slots"]:
            problem(f"{where}: solution uses {len(sol)} ways; the plan row holds {doc['plan_slots']}")
        if len(set(sol)) != len(sol):
            problem(f"{where}: solution repeats a way")
        missing = [w for w in sol if w not in ways]
        if missing:
            problem(f"{where}: solution names unknown ways {missing}")
        if len(ways) <= len(sol):
            problem(f"{where}: needs more ways than the solution uses")
        # DESIGN.md section 11, rule 3: at watcher_at the watcher adds one rule, and it closes the
        # way the loophole stands on (section 20, Answered 4).
        wr = t["watcher_rule"]
        if wr is None:
            problem(f"{where}: watcher_rule is not written")
        elif wr["closes_way"] not in ways:
            problem(f"{where}: watcher_rule closes unknown way '{wr['closes_way']}'")
        elif wr["closes_way"] not in sol:
            problem(f"{where}: watcher_rule closes '{wr['closes_way']}', which is not a way of the solution")
        if wr is not None and wr["text"] in [r["text"] for r in t["rules"]]:
            problem(f"{where}: watcher_rule repeats a rule already on the tablet")
    # DESIGN.md section 11: the gods' rules add "a rule with 'or' is a price".
    gods = [t for t in doc["tablets"] if t["scene"] == "g_tablet_c6"]
    if gods and not any(r.get("price") for r in gods[0]["rules"]):
        problem("tablets.json 'g_tablet_c6': the gods' rules need their price rule")
    # Endings and choices that need a loophole must find it set by a tablet.
    for name in ("loophole_shrine", "loophole_hollin", "loophole_wake", "loophole_procession"):
        if name in flags and name not in loophole_flags:
            problem(f"tablets.json: no tablet sets '{name}'")


def check_past(doc, ctx):
    scenes, order, chapters, flags = ctx["scenes"], ctx["order"], ctx["chapters"], ctx["flags"]
    slots = doc["slots"]
    ids = [s["slot"] for s in slots]
    if ids != [f"F{i}" for i in range(1, 8)]:
        problem(f"past_pack.json: slots must be F1 to F7 in order, got {ids}")
    if [s["reveals"] for s in slots] != doc["revelation_order"]:
        problem("past_pack.json: slots do not follow revelation_order")
    expected_order = ["a place", "the binding", "the act", "the judgment", "the mercy",
                      "the thing that remains", "a person"]
    if doc["revelation_order"] != expected_order:
        problem(f"past_pack.json: revelation_order must be {expected_order} (DESIGN.md section 5, rule 1)")
    keys = [s["key"] for s in slots]
    if len(set(keys)) != len(keys):
        problem("past_pack.json: duplicate slot keys")
    for name, kind in (("past_fragments", "ledger"), ("past_known", "counter")):
        if flags.get(name, {}).get("type") != kind:
            problem(f"past_pack.json: flags.json needs '{name}' as a {kind}")
    fields = flags.get("past_fragments", {}).get("fields", [])
    for field in ("slot", "carrier", "chapter"):
        if field not in fields:
            problem(f"past_pack.json: past_fragments ledger lacks field '{field}' the pack fills")

    last = -1
    for s in slots:
        where = f"past_pack.json {s['slot']}"
        if not s["text"].strip() or not s["title"].strip():
            problem(f"{where}: empty title or text")
        if s["chapter"] not in chapters:
            problem(f"{where}: chapter '{s['chapter']}' not in game.json")
        sc = scenes.get(s["scene"])
        if sc is None:
            problem(f"{where}: scene '{s['scene']}' not in scenes.json")
            continue
        if sc["chapter"] != s["chapter"]:
            problem(f"{where}: scene '{s['scene']}' is in {sc['chapter']}, not {s['chapter']}")
        for name in ("past_fragments", "past_known"):
            if name not in sc.get("writes", []):
                problem(f"{where}: scene '{s['scene']}' does not write '{name}'")
        at = order.index(s["scene"])
        if at <= last:
            problem(f"{where}: found before the slot that precedes it")
        last = at
        if doc["pack"] == "proposed" and s["text_status"] == "author":
            problem(f"{where}: an author's slot in a pack marked 'proposed'; set pack to 'author'")
        if s["text_status"] == "source":
            src = s.get("source")
            if not src:
                problem(f"{where}: a source slot needs its vault path and line")
            else:
                line = vault_line(src["path"], src["line"])
                if line is not None and line != s["text"]:
                    problem(f"{where}: text is not verbatim {src['path']} line {src['line']}")
    # Rule 3: F1 is always the source's opening paragraph.
    if slots and slots[0]["text_status"] != "source":
        problem("past_pack.json F1: must be the source's opening paragraph (text_status 'source')")
    # The clasped books carry F2 to F6, and every clasp opens one.
    clasp_scenes = sorted(sid for sid in order if scenes[sid].get("game") == "clasps")
    carried = sorted(s["scene"] for s in slots if scenes.get(s["scene"], {}).get("game") == "clasps")
    if carried != clasp_scenes:
        problem(f"past_pack.json: clasp scenes {clasp_scenes} and the slots they carry {carried} differ")
    sure = sum(1 for s in slots if not s["missable"])
    if sure < PAST_VARIANT_THRESHOLD:
        problem(f"past_pack.json: only {sure} slots are certain; endings' variant needs {PAST_VARIANT_THRESHOLD}")
    # Rule 4: endings read state, never the pack's text.
    for e in ctx["endings"]:
        if "past_fragments" in json.dumps(e.get("when")):
            problem(f"endings.json '{e['id']}': reads past_fragments; endings may read only past_known, "
                    "black_book_open and candle_left")


def main():
    shared = {name: load(DATA / f"{name}.json") for name in ("game", "scenes", "flags", "endings")}
    docs = {name: load(DATA / f"{name}.json") for name in EXTRA}
    schemas = {name: load(SCHEMAS / f"{name}.schema.json") for name in EXTRA}
    if problems:
        return report()
    for name in EXTRA:
        before = len(problems)
        validate(docs[name], schemas[name], f"{name}.json")
        if len(problems) > before:
            docs[name] = None  # skip cross-checks on a file that fails its schema
    scene_list = shared["scenes"]["scenes"]
    ctx = {
        "scenes": {s["id"]: s for s in scene_list},
        "order": [s["id"] for s in scene_list],
        "chapters": [c["id"] for c in shared["game"]["chapters"]],
        "flags": {f["name"]: f for f in shared["flags"]["state"]},
        "endings": shared["endings"]["endings"],
        "source_path": "creative-writing/vault/" + shared["game"]["sources"][0],
    }
    if docs["herbs"] is not None:
        check_herbs(docs["herbs"], ctx)
    if docs["tablets"] is not None:
        check_tablets(docs["tablets"], ctx)
    if docs["past_pack"] is not None:
        check_past(docs["past_pack"], ctx)
    return report()


def report():
    for p in problems:
        print(p)
    if problems:
        print(f"endless-temple extra data: {len(problems)} problem(s)")
        return 1
    print("endless-temple extra data: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())

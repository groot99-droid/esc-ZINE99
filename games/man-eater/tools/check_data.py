"""Check Project: Man Eater's extra data files.

Checks data/list_incidents.json and data/chart_questions.json against their schemas in
data/schemas/, against each other, and against the four shared files (game.json, scenes.json,
flags.json, endings.json). Prints each problem; exits 0 when there are none, 1 otherwise.

Run from the repo root:  python games/man-eater/tools/check_data.py
Stdlib only.
"""

import json
import re
import sys
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent
DATA = GAME / "data"
SCHEMAS = DATA / "schemas"
EXTRA = ["list_incidents", "chart_questions"]

# Chapter id -> the day it plays (DESIGN.md section 7: arrival is day 1, the endings follow night 7).
CHAPTER_DAY = {
    "ch1_arrival": 1, "ch2_day1": 1, "ch3_day2": 2, "ch4_day3": 3, "ch5_day4": 4,
    "ch6_day5": 5, "ch7_day6": 6, "ch8_day7": 7, "ch9_end": 7,
}

# Figures DESIGN.md relies on (sections 11.3 and 12).
ENTRY_COUNT = 14
KNOWS_THRESHOLDS = {"anomaly": 0, "pattern": 3, "scale": 6, "implicated": 10}
CHART_DAYS = [2, 3, 4, 5, 6]
FRAGMENT_BUDGET = [8, 5, 3, 1]
TIER_CLARITY = {1: [75, 100], 2: [50, 74], 3: [25, 49], 4: [0, 24]}
CAMERA_HEIGHT = (178.0, 1.6)   # section 9: height = 178 cm + 1.6 cm per point of change
FLOOR_PLAN_SQUARE = 75         # section 11.4: one square is Fisk's day-1 stride

# Restraint: no graphic detail in any row, and no row speaks for Windigo lore.
BANNED = ["windigo", "wendigo", "blood", "gore", "flesh", "bone", "corpse", "cannibal",
          "severed", "amputat", "entrail", "organ", "carcass", "scream"]

TYPES = {"object": dict, "array": list, "string": str, "boolean": bool, "null": type(None)}

problems = []


def problem(msg):
    problems.append(msg)


def load(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError) as exc:
        problem(f"{path.relative_to(GAME.parent.parent)}: cannot read: {exc}")
        return None


def is_type(value, name):
    if name == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if name == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    return isinstance(value, TYPES[name])


def validate(value, schema, where):
    """The subset of JSON Schema 2020-12 the two schemas use."""
    want = schema.get("type")
    if want is not None:
        names = want if isinstance(want, list) else [want]
        if not any(is_type(value, n) for n in names):
            problem(f"{where}: expected {' or '.join(names)}, got {type(value).__name__}")
            return
    if "enum" in schema and value not in schema["enum"]:
        problem(f"{where}: {value!r} is not one of {schema['enum']}")
    if isinstance(value, str) and "pattern" in schema and not re.search(schema["pattern"], value):
        problem(f"{where}: {value!r} does not match {schema['pattern']}")
    if is_type(value, "number"):
        if "minimum" in schema and value < schema["minimum"]:
            problem(f"{where}: {value} is below {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            problem(f"{where}: {value} is above {schema['maximum']}")
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                problem(f"{where}: missing required key '{key}'")
        for key, sub in schema.get("properties", {}).items():
            if key in value:
                validate(value[key], sub, f"{where}.{key}")
    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            problem(f"{where}: needs at least {schema['minItems']} items, has {len(value)}")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            problem(f"{where}: allows at most {schema['maxItems']} items, has {len(value)}")
        if "items" in schema:
            for i, item in enumerate(value):
                validate(item, schema["items"], f"{where}[{i}]")


PROSE = {"incident", "explanations", "how", "text", "question", "proof", "difficulty", "broken_by",
         "quote"}


def strings(value):
    """Prose only: ids such as the scene n7_windigo are names, not text a player reads."""
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for k, v in value.items():
            if k in PROSE:
                yield from strings(v)
    elif isinstance(value, list):
        for v in value:
            yield from strings(v)


def restraint(rows, where):
    for i, row in enumerate(rows):
        for text in strings(row):
            low = text.lower()
            for word in BANNED:
                if word in low:
                    problem(f"{where}[{i}]: '{word}' in {text!r}; keep rows free of graphic "
                            f"detail and of Windigo lore")


def main():
    shared = {name: load(DATA / f"{name}.json") for name in ("game", "scenes", "flags", "endings")}
    extra = {name: load(DATA / f"{name}.json") for name in EXTRA}
    schemas = {name: load(SCHEMAS / f"{name}.schema.json") for name in EXTRA}
    if problems:
        return finish()

    for name in EXTRA:
        validate(extra[name], schemas[name], f"{name}.json")
    if problems:
        return finish()

    game, scenes_doc, flags_doc = shared["game"], shared["scenes"], shared["flags"]
    chapters = {c["id"] for c in game["chapters"]}
    for cid in CHAPTER_DAY:
        if cid not in chapters:
            problem(f"check_data.py: chapter '{cid}' is not in game.json")
    scenes = {s["id"]: s for s in scenes_doc["scenes"]}
    order = {s["id"]: i for i, s in enumerate(scenes_doc["scenes"])}
    flags = {f["name"]: f for f in flags_doc["state"]}
    games_1d = {g["id"] for g in scenes_doc["games_1d"]}

    def scene_day(sid):
        return CHAPTER_DAY.get(scenes[sid]["chapter"])

    def need_scene(sid, where, writes=None):
        if sid not in scenes:
            problem(f"{where}: scene '{sid}' is not in scenes.json")
            return False
        if writes and writes not in scenes[sid].get("writes", []):
            problem(f"{where}: scene '{sid}' does not write '{writes}' in scenes.json")
        return True

    # ---- list_incidents.json -------------------------------------------------------------
    li = extra["list_incidents"]
    w = "list_incidents.json"
    if li["source"] not in game.get("sources", []):
        problem(f"{w}: source '{li['source']}' is not a source in game.json")
    if "the_list" not in flags or flags["the_list"]["type"] != "ledger":
        problem(f"{w}: flags.json has no ledger 'the_list'")
    for tier in li["tiers"]:
        if TIER_CLARITY.get(tier["tier"]) != tier["clarity"]:
            problem(f"{w}: tier {tier['tier']} clarity {tier['clarity']} does not match "
                    f"section 12 ({TIER_CLARITY.get(tier['tier'])})")
    if [t["tier"] for t in li["tiers"]] != [1, 2, 3, 4]:
        problem(f"{w}: tiers must be 1, 2, 3, 4 in order")

    knows = flags.get("knows", {})
    rungs = knows.get("values", [])
    ladder = [r["rung"] for r in li["knows_ladder"]]
    if ladder != rungs:
        problem(f"{w}: knows_ladder rungs {ladder} do not match the knows enum {rungs}")
    for r in li["knows_ladder"]:
        if KNOWS_THRESHOLDS.get(r["rung"]) != r["broken_gte"]:
            problem(f"{w}: knows rung '{r['rung']}' at {r['broken_gte']} broken entries; "
                    f"section 12 says {KNOWS_THRESHOLDS.get(r['rung'])}")
        for f in r["or_flags"]:
            if flags.get(f, {}).get("type") != "bool":
                problem(f"{w}: knows rung '{r['rung']}' names '{f}', not a bool in flags.json")
        if r["broken_gte"] > ENTRY_COUNT:
            problem(f"{w}: knows rung '{r['rung']}' needs more broken entries than exist")

    entries = li["entries"]
    ids = [e["id"] for e in entries]
    if ids != [f"L{i}" for i in range(1, ENTRY_COUNT + 1)]:
        problem(f"{w}: entries must be L1 to L{ENTRY_COUNT} in order, found {ids}")
    by_id = {e["id"]: e for e in entries}
    dm = li["doesnt_matter"]
    for e in entries:
        where = f"{w} {e['id']}"
        if len(set(e["explanations"])) != 3:
            problem(f"{where}: explanations repeat")
        if e["explanations"][0] == dm:
            problem(f"{where}: the first explanation is kept at tier 3, so it cannot be '{dm}'")
        if need_scene(e["added_in"], where, "the_list"):
            if scene_day(e["added_in"]) != e["day"]:
                problem(f"{where}: added on day {e['day']} but '{e['added_in']}' plays on day "
                        f"{scene_day(e['added_in'])}")
        for b in e["broken_by"]:
            if not need_scene(b["scene"], where, "the_list"):
                continue
            if scene_day(b["scene"]) != b["day"]:
                problem(f"{where}: broken on day {b['day']} but '{b['scene']}' plays on day "
                        f"{scene_day(b['scene'])}")
            if e["added_in"] in order and order[b["scene"]] <= order[e["added_in"]]:
                problem(f"{where}: '{b['scene']}' breaks it before '{e['added_in']}' adds it")
    restraint(entries, f"{w} entries")

    # Quotes stay verbatim: check them against the vault when it sits beside this repo.
    vault = GAME.parent.parent.parent / "Pipelines-Plugin" / "creative-writing" / "vault" / li["source"]
    if vault.is_file():
        lines = vault.read_text(encoding="utf-8").splitlines()
        for e in entries:
            q = e["quote"]
            if q and (q["line"] > len(lines) or q["text"] not in lines[q["line"] - 1]):
                problem(f"{w} {e['id']}: quote {q['text']!r} is not on line {q['line']} of the source")
            if q and f'"{q["text"]}"' not in e["incident"]:
                problem(f"{w} {e['id']}: the incident must carry its quote in quotation marks")

    # ---- chart_questions.json ------------------------------------------------------------
    cq = extra["chart_questions"]
    w = "chart_questions.json"
    if cq["game"] not in games_1d:
        problem(f"{w}: game '{cq['game']}' is not a games_1d id")
    chart_scenes = [s["id"] for s in scenes_doc["scenes"] if s.get("game") == cq["game"]]
    rows = {r["id"]: r for r in cq["rows"]}
    for r in cq["rows"]:
        where = f"{w} row '{r['id']}'"
        if r["kind"] == "formula":
            missing = [k for k in ("base", "per_change", "unit", "at_change_100") if k not in r]
            if missing:
                problem(f"{where}: formula row lacks {missing}")
                continue
            at100 = round(r["base"] + 100 * r["per_change"], 3)
            if abs(at100 - r["at_change_100"]) > 1e-6:
                problem(f"{where}: base + 100 x per_change = {at100}, not {r['at_change_100']}")
        else:
            for name in r.get("from", []):
                if name not in flags:
                    problem(f"{where}: reads '{name}', not in flags.json")
            if "added_on_day" not in r:
                problem(f"{where}: state row lacks added_on_day")
    h = rows.get("height")
    if h and (h.get("base"), h.get("per_change")) != CAMERA_HEIGHT:
        problem(f"{w}: the height row must match the camera height in section 9 {CAMERA_HEIGHT}")
    s = rows.get("stride")
    if s and s.get("base") != FLOOR_PLAN_SQUARE:
        problem(f"{w}: day-1 stride must equal Floor Plan's square ({FLOOR_PLAN_SQUARE} cm)")

    tier_rows = {}
    for t in cq["tiers"]:
        tier_rows[t["tier"]] = set(t["rows"])
        for rid in t["rows"] + [x for m in t["merged"] for x in m]:
            if rid not in rows:
                problem(f"{w}: tier {t['tier']} names row '{rid}', which is not in rows")
    if [t["tier"] for t in cq["tiers"]] != [1, 2, 3, 4]:
        problem(f"{w}: tiers must be 1, 2, 3, 4 in order")
    if tier_rows.get(1) != set(rows):
        problem(f"{w}: tier 1 must show every row")
    if len(tier_rows.get(3, ())) != 4:
        problem(f"{w}: tier 3 shows four rows (section 12)")
    if "pills" in tier_rows.get(3, set()) | tier_rows.get(4, set()):
        problem(f"{w}: the pill row shows only at tier 1 or 2 (section 11.3)")

    for name in cq["crew_columns"]["crew"]:
        if f"pull.{name}" not in flags:
            problem(f"{w}: crew '{name}' has no pull.{name} meter in flags.json")

    cards = {c["id"] for c in cq["cards"]}
    days = [q["day"] for q in cq["questions"]]
    if days != CHART_DAYS:
        problem(f"{w}: one question a day for days {CHART_DAYS}, found {days}")
    if len({q["card"] for q in cq["questions"]}) != len(cq["questions"]):
        problem(f"{w}: two questions break the same card")
    for q in cq["questions"]:
        where = f"{w} day {q['day']}"
        if need_scene(q["scene"], where, "the_list"):
            if q["scene"] not in chart_scenes:
                problem(f"{where}: '{q['scene']}' is not a {cq['game']} scene")
            elif scene_day(q["scene"]) != q["day"]:
                problem(f"{where}: '{q['scene']}' plays on day {scene_day(q['scene'])}")
            if "knows" not in scenes[q["scene"]].get("writes", []):
                problem(f"{where}: '{q['scene']}' does not write 'knows'")
        e = by_id.get(q["tests_entry"])
        if e is None:
            problem(f"{where}: tests '{q['tests_entry']}', not an entry in list_incidents.json")
        else:
            if q["tests_explanation"] not in e["explanations"]:
                problem(f"{where}: '{q['tests_explanation']}' is not one of {e['id']}'s explanations")
            if q["scene"] not in [b["scene"] for b in e["broken_by"]]:
                problem(f"{where}: {e['id']} does not list '{q['scene']}' among what breaks it")
            if e["day"] >= q["day"]:
                problem(f"{where}: {e['id']} is added on day {e['day']}, not before the question")
        if q["card"] not in cards:
            problem(f"{where}: card '{q['card']}' is not in cards")
        if q["card"] not in q["cards_offered"]:
            problem(f"{where}: the card to break is not offered")
        for c in q["cards_offered"]:
            if c not in cards:
                problem(f"{where}: offers card '{c}', which is not in cards")
        cells = q["cells"]
        for rid in cells["rows"]:
            r = rows.get(rid)
            if r is None:
                problem(f"{where}: cells name row '{rid}', which is not in rows")
            elif r.get("added_on_day", 1) > q["day"]:
                problem(f"{where}: row '{rid}' joins the page on day {r['added_on_day']}")
        for d in cells["days"]:
            if not 1 <= d <= q["day"]:
                problem(f"{where}: cell day {d} is not a column filled by day {q['day']}")
        fixed = len(cells["rows"]) * len(cells["days"])
        if cells["days"] and fixed < cq["min_cells"]:
            problem(f"{where}: the proving cells ({fixed}) are fewer than min_cells")
        if (q["second_sheet"] is None) == (cells["rule"] == "against_second_sheet"):
            problem(f"{where}: second_sheet and the 'against_second_sheet' rule go together")
        if q["crew_alternative"] and q["day"] < cq["crew_columns"]["from_day"]:
            problem(f"{where}: crew columns appear only from day {cq['crew_columns']['from_day']}")
    for d in li["knows_ladder"]:
        for day in d["or_chart_days"]:
            if day not in days:
                problem(f"list_incidents.json: knows rung '{d['rung']}' names chart day {day}, "
                        f"which has no question")
    restraint(cq["questions"], f"{w} questions")

    rd = cq["ready_day"]
    if need_scene(rd["scene"], f"{w} ready_day"):
        if rd["scene"] not in chart_scenes or scene_day(rd["scene"]) != rd["day"]:
            problem(f"{w} ready_day: '{rd['scene']}' is not the day-{rd['day']} chart")
    if rd["fragment_budget_by_tier"] != FRAGMENT_BUDGET:
        problem(f"{w} ready_day: word budget must be {FRAGMENT_BUDGET} (section 11.3)")
    covered = {q["scene"] for q in cq["questions"]} | {rd["scene"]}
    for sid in chart_scenes:
        if sid not in covered:
            problem(f"{w}: chart scene '{sid}' has no question and is not the ready day")

    # Every list entry that a chart scene breaks is tested by that day's question.
    for e in entries:
        for b in e["broken_by"]:
            if b["scene"] in chart_scenes and not any(
                    q["scene"] == b["scene"] and q["tests_entry"] == e["id"] for q in cq["questions"]):
                problem(f"list_incidents.json {e['id']}: '{b['scene']}' breaks it, but that "
                        f"day's question tests another entry")

    return finish()


def finish():
    for p in problems:
        print(p)
    if problems:
        print(f"man-eater extra data: {len(problems)} problem(s)")
        return 1
    print("man-eater extra data: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())

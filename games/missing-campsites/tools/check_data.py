#!/usr/bin/env python3
"""Check Missing Campsites' extra data files.

Checks data/erasure_schedule.json and data/anchors.json against their schemas in data/schemas/
(required keys and types), against each other, and against the four shared files (game.json,
scenes.json, flags.json, endings.json), with the counts and thresholds DESIGN.md section 12 and
endings.json rely on.

Stdlib only. Run from anywhere: python games/missing-campsites/tools/check_data.py
Exits 0 when everything agrees, 1 otherwise.
"""
import json
import re
import sys
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent
DATA = GAME / "data"
EXTRA = ("erasure_schedule", "anchors")
ALL_SITES = set(range(1, 25))
TORCH_LOOP_1_ROUTE = set(range(4, 20))  # torch_loop_1 ticks posts 19 to 4 (DESIGN section 10)

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


TYPES = {
    "object": dict, "array": list, "string": str, "boolean": bool, "null": type(None),
    "integer": int, "number": (int, float),
}


def type_ok(value, name):
    if name in ("integer", "number") and isinstance(value, bool):
        return False
    return isinstance(value, TYPES[name])


def check_schema(value, schema, where):
    """A small subset of JSON Schema: type, required, properties, items, enum, minimum, maximum, pattern."""
    types = schema.get("type")
    if types is not None:
        names = types if isinstance(types, list) else [types]
        if not any(type_ok(value, n) for n in names):
            problem(f"{where}: expected {' or '.join(names)}, got {type(value).__name__}")
            return
    if "enum" in schema and value not in schema["enum"]:
        problem(f"{where}: {value!r} not one of {schema['enum']}")
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            problem(f"{where}: {value} below minimum {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            problem(f"{where}: {value} above maximum {schema['maximum']}")
    if isinstance(value, str) and "pattern" in schema and not re.search(schema["pattern"], value):
        problem(f"{where}: {value!r} does not match {schema['pattern']}")
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                problem(f"{where}: missing '{key}'")
        for key, sub in schema.get("properties", {}).items():
            if key in value:
                check_schema(value[key], sub, f"{where}.{key}")
    if isinstance(value, list) and "items" in schema:
        for i, item in enumerate(value):
            check_schema(item, schema["items"], f"{where}[{i}]")


def spans(sets):
    out = set()
    for s in sets:
        out |= set(s)
    return out


def main():
    shared = {name: load(DATA / f"{name}.json") for name in ("game", "scenes", "flags", "endings")}
    extra = {name: load(DATA / f"{name}.json") for name in EXTRA}
    schemas = {name: load(DATA / "schemas" / f"{name}.schema.json") for name in EXTRA}
    if problems:
        return report()
    for name in EXTRA:
        check_schema(extra[name], schemas[name], f"{name}.json")
    if problems:
        return report()

    game, scenes, flags, endings = (shared[k] for k in ("game", "scenes", "flags", "endings"))
    chapter_order = [c["id"] for c in game["chapters"]]
    scene_by_id = {s["id"]: s for s in scenes["scenes"]}
    flag_by_name = {f["name"]: f for f in flags["state"]}
    ending_by_id = {e["id"]: e for e in endings["endings"]}
    sched, anch = extra["erasure_schedule"], extra["anchors"]
    anchor_by_id = {a["id"]: a for a in anch["anchors"]}
    if len(anchor_by_id) != len(anch["anchors"]):
        problem("anchors.json: duplicate anchor ids")

    def need_flag(name, where, kind=None):
        f = flag_by_name.get(name)
        if f is None:
            problem(f"{where}: flag '{name}' is not in flags.json")
        elif kind and f["type"] != kind:
            problem(f"{where}: flag '{name}' is a {f['type']}, expected {kind}")
        return f

    def need_scene(sid, where):
        if sid not in scene_by_id:
            problem(f"{where}: scene '{sid}' is not in scenes.json")
            return None
        return scene_by_id[sid]

    # ---------------- erasure_schedule.json ----------------
    need_flag(sched["flag"], "erasure_schedule.flag", "counter")
    steps = sched["steps"]
    numbers = [s["step"] for s in steps]
    if numbers != list(range(len(steps))):
        problem(f"erasure_schedule: steps must run 0..{len(steps) - 1} in order, got {numbers}")

    lines = {p["id"]: p for p in sched["postcard_lines"]}
    kept = flag_by_name.get("mother_lines_kept")
    if kept:
        m = re.search(r"0-(\d+)", kept["description"])
        if not m or int(m.group(1)) != len(lines):
            problem(f"erasure_schedule: {len(lines)} postcard lines, but mother_lines_kept says '{kept['description']}'")

    lost_so_far, legend_gone, map_gone = set(), set(), set()
    lines_gone = set()
    hud_seen = False
    writers = set()
    last_chapter = -1
    five = set(anch["slots"]["sites"])
    for st in steps:
        n = st["step"]
        where = f"erasure_schedule.steps[{n}]"
        block = set(st["sites_lost"])
        if st["sites_lost"] != sorted(st["sites_lost"]):
            problem(f"{where}: sites_lost not in order")
        if block & lost_so_far:
            problem(f"{where}: sites {sorted(block & lost_so_far)} already lost")
        if lost_so_far and block and min(block) <= max(lost_so_far):
            problem(f"{where}: sites must go from the entrance inward (rule 1)")
        # scenes
        chapters_here = []
        for sid in st["scenes"]:
            sc = need_scene(sid, where)
            if sc is None:
                continue
            writers.add(sid)
            if sched["flag"] not in sc.get("writes", []):
                problem(f"{where}: scene '{sid}' does not write {sched['flag']}")
            chapters_here.append(chapter_order.index(sc["chapter"]))
        if n > 0 and not st["scenes"]:
            problem(f"{where}: no scene advances this step")
        if chapters_here:
            if min(chapters_here) < last_chapter:
                problem(f"{where}: its scenes come before the previous step's")
            last_chapter = min(chapters_here)
        for eid in st["except_endings"]:
            e = ending_by_id.get(eid)
            if e is None:
                problem(f"{where}: ending '{eid}' is not in endings.json")
            elif e.get("as_written"):
                problem(f"{where}: the as-written ending '{eid}' cannot skip a step")
        # the crossing
        if st.get("crosses"):
            if block != five:
                problem(f"{where}: the crossing takes {sorted(block)}, but the slots are at {sorted(five)}")
            if n != len(steps) - 1:
                problem(f"{where}: the crossing must be the last step")
        # paper lags the land by one step (rule 3); never ahead of it
        if not set(st["legend_drops"]) <= lost_so_far | block:
            problem(f"{where}: legend drops {sorted(set(st['legend_drops']) - lost_so_far - block)} before the land loses them")
        if not set(st["map_stops_printing"]) <= lost_so_far | block:
            problem(f"{where}: map stops printing sites the land still has")
        if n > 0:
            prev = set(steps[n - 1]["sites_lost"])
            if not prev <= legend_gone | set(st["legend_drops"]):
                problem(f"{where}: legend still lists {sorted(prev - legend_gone - set(st['legend_drops']))}, more than one step late")
        if set(st["legend_drops"]) & legend_gone:
            problem(f"{where}: legend drops a site twice")
        legend_gone |= set(st["legend_drops"])
        map_gone |= set(st["map_stops_printing"])
        # HUD counter
        hud = st["hud_post_counter"]
        if hud is not None:
            hud_seen = True
            before = len(TORCH_LOOP_1_ROUTE - lost_so_far)
            after = len(TORCH_LOOP_1_ROUTE - lost_so_far - block)
            if (hud["from"], hud["to"]) != (before, after):
                problem(f"{where}: HUD post counter {hud['from']} -> {hud['to']}, but the route has {before} -> {after}")
        # carrying-run post times
        if "post_times_s" in st:
            ps = [p["site"] for p in st["post_times_s"]]
            if set(ps) != block:
                problem(f"{where}: post times name {ps}, but the step takes {sorted(block)}")
            secs = [p["seconds"] for p in st["post_times_s"]]
            if secs != sorted(secs):
                problem(f"{where}: post times are not in order")
            posts = {a["post"] for a in anch["anchors"] if a["post"] is not None}
            if set(ps) != posts:
                problem(f"{where}: timed posts {sorted(ps)} differ from the post anchors {sorted(posts)}")
        lost_so_far |= block
        # photos
        if not set(st["photo_sites"]) <= lost_so_far:
            problem(f"{where}: photo of a site not yet lost")
        # postcard lines
        for pl in st["postcard_lines_lost"]:
            lid = pl["line"]
            if lid not in lines:
                problem(f"{where}: postcard line '{lid}' is not in postcard_lines")
                continue
            if lid in lines_gone:
                problem(f"{where}: postcard line '{lid}' lost twice")
            lines_gone.add(lid)
            site = lines[lid]["site"]
            if site is not None and site not in block:
                problem(f"{where}: postcard line '{lid}' goes at a step that does not take site {site} (rule 4)")
            if "unless_anchor" in pl and pl["unless_anchor"] not in anchor_by_id:
                problem(f"{where}: unless_anchor '{pl['unless_anchor']}' is not in anchors.json")
        for lid in st.get("postcard_lines_hold", []):
            if lid not in lines:
                problem(f"{where}: postcard line '{lid}' is not in postcard_lines")
            elif lines[lid]["site"] not in five:
                problem(f"{where}: postcard line '{lid}' holds but its site did not cross")
        for ol in st["other_lines_lost"]:
            if ol["site"] is not None and ol["site"] not in lost_so_far:
                problem(f"{where}: line '{ol['id']}' names site {ol['site']}, which is not lost yet")
            if ol["flag_if_copied"] is not None:
                need_flag(ol["flag_if_copied"], f"{where}.{ol['id']}", "bool")
            if "unless_anchor" in ol and ol["unless_anchor"] not in anchor_by_id:
                problem(f"{where}: unless_anchor '{ol['unless_anchor']}' is not in anchors.json")

    if lost_so_far != ALL_SITES:
        problem(f"erasure_schedule: sites never lost: {sorted(ALL_SITES - lost_so_far)}")
    if legend_gone != ALL_SITES - five:
        problem(f"erasure_schedule: by the crossing the legend must list only {sorted(five)}")
    if map_gone != ALL_SITES - five:
        problem(f"erasure_schedule: by the end the map must print only {sorted(five)}")
    if not hud_seen:
        problem("erasure_schedule: no step moves the HUD post counter")
    held_lines = {lid for st in steps for lid in st.get("postcard_lines_hold", [])}
    if lines_gone | held_lines != set(lines) or lines_gone & held_lines:
        problem("erasure_schedule: every postcard line must be lost once or hold, not both")
    erasure_writers = {s["id"] for s in scenes["scenes"] if sched["flag"] in s.get("writes", [])}
    if erasure_writers - writers:
        problem(f"erasure_schedule: scenes write {sched['flag']} but no step names them: {sorted(erasure_writers - writers)}")
    flag = flag_by_name.get(sched["flag"])
    if flag:
        m = re.search(r"(\d+)-(\d+)", flag["description"])
        if m and (int(m.group(1)), int(m.group(2))) != (0, len(steps) - 1):
            problem(f"erasure_schedule: {len(steps)} steps, but {sched['flag']} says '{flag['description']}'")

    # ---------------- anchors.json ----------------
    led = need_flag(anch["ledger"], "anchors.ledger", "ledger")
    if led and set(led.get("fields", [])) != {"item", "weight", "site", "chapter"}:
        problem(f"anchors: ledger '{anch['ledger']}' fields are {led.get('fields')}, expected item, weight, site, chapter")
    meter = need_flag(anch["meter"], "anchors.meter", "meter")
    if anch["placed_in_chapter"] not in chapter_order:
        problem(f"anchors: chapter '{anch['placed_in_chapter']}' is not in game.json")
    slots = anch["slots"]
    if slots["total"] != len(slots["sites"]) * len(slots["per_site"]):
        problem("anchors: slots.total is not sites x per_site")
    if not set(slots["sites"]) <= ALL_SITES or len(slots["sites"]) != 5:
        problem("anchors: the slots must be at the five sites")

    # Held threshold must match endings.json
    held_values = [e["when"]["gte"] for e in endings["endings"]
                   if isinstance(e["when"], dict) and e["when"].get("is") == anch["meter"] and "gte" in e["when"]]
    if held_values != [anch["held_threshold"]]:
        problem(f"anchors: held_threshold {anch['held_threshold']}, but endings.json reads {anch['meter']} >= {held_values}")
    if meter and meter.get("range") and meter.get("description"):
        m = re.search(r">=\s*(\d+)", meter["description"])
        if m and int(m.group(1)) != anch["held_threshold"]:
            problem(f"anchors: flags.json says Held at >={m.group(1)}")

    things = [a for a in anch["anchors"] if a["kind"] == "thing"]
    people = [a for a in anch["anchors"] if a["kind"] == "person"]
    if sum(a["slots"] for a in things) != slots["total"]:
        problem(f"anchors: things fill {sum(a['slots'] for a in things)} slots, expected {slots['total']}")
    if sum(a["weight"] for a in things) != anch["max_without_person"]:
        problem(f"anchors: things weigh {sum(a['weight'] for a in things)}, but max_without_person is {anch['max_without_person']}")
    if anch["max_without_person"] < anch["held_threshold"]:
        problem("anchors: Held must be reachable with no person (DESIGN section 13)")

    person_enum = flag_by_name.get("person_brought", {}).get("values", [])
    seen_persons = set()
    for a in anch["anchors"]:
        where = f"anchors.{a['id']}"
        for sid in a["scenes"]:
            sc = need_scene(sid, where)
            if sc is None:
                continue
            writes = set(sc.get("writes", []))
            if anch["ledger"] not in writes and (a["flag"] is None or a["flag"] not in writes):
                problem(f"{where}: scene '{sid}' writes neither {anch['ledger']} nor {a['flag']}")
        if a["flag"] is not None:
            f = need_flag(a["flag"], where)
            if f:
                m = re.search(r"weight (\d+)", f["description"])
                if m and int(m.group(1)) != a["weight"]:
                    problem(f"{where}: weight {a['weight']}, but flags.json '{a['flag']}' says weight {m.group(1)}")
        if a["units_if_warm"] is not None and a["units_if_warm"] >= a["units"]:
            problem(f"{where}: units_if_warm must be cheaper than units")
        if a["kind"] == "thing":
            if a["person"] is not None or "needs" in a:
                problem(f"{where}: a thing has no person or needs")
            if a["slots"] != 1:
                problem(f"{where}: a thing fills one slot")
        else:
            if a["slots"] != len(slots["per_site"]):
                problem(f"{where}: a person fills both slots of one site")
            if a["person"] not in person_enum or a["person"] == "none":
                problem(f"{where}: person '{a['person']}' is not a person_brought value")
            seen_persons.add(a["person"])
            if a["flag"] != "person_brought":
                problem(f"{where}: a person is recorded in person_brought")
            if "needs" not in a:
                problem(f"{where}: a person needs a persuasion flag")
            else:
                need_flag(a["needs"], where, "bool")
            if "brings" in a and a["brings"] not in anchor_by_id:
                problem(f"{where}: brings '{a['brings']}', which is not an anchor")
        if a["post"] is not None and a["post"] not in ALL_SITES - set(slots["sites"]):
            problem(f"{where}: post {a['post']} is not outside the five sites")
    missing = set(person_enum) - {"none"} - seen_persons
    if missing:
        problem(f"anchors: person_brought values with no anchor: {sorted(missing)}")

    # the most the meter can ever read
    best = anch["max_without_person"]
    for p in people:
        free = slots["total"] - p["slots"]
        brought = p.get("brings")
        pool = sorted((a["weight"] for a in things if a["id"] != brought), reverse=True)
        total = p["weight"] + (anchor_by_id[brought]["weight"] if brought in anchor_by_id else 0) + sum(pool[:free])
        best = max(best, total)
    if meter and meter.get("range") and best > meter["range"][1]:
        problem(f"anchors: hold can reach {best}, above its range {meter['range']}")

    return report()


def report():
    for p in problems:
        print(p)
    if problems:
        print(f"missing-campsites extra data: {len(problems)} problem(s)")
        return 1
    print("missing-campsites extra data: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())

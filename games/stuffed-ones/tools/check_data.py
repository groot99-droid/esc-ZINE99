#!/usr/bin/env python3
"""Check The Stuffed Ones' extra data files (docs/TECH.md, "Extra data files").

Stdlib only. Run from anywhere: python games/stuffed-ones/tools/check_data.py
Checks profile.json, guests.json, memories.json, incidents.json, book.json and stitchwork.json
against their schemas in data/schemas/, against each other, and against game.json, scenes.json,
flags.json and endings.json. Verbatim quotes are checked against the vault when the
Pipelines-Plugin checkout sits beside this repo (or ESC_VAULT names the vault); otherwise that
one check is skipped with a note. Exits 0 when everything holds, 1 otherwise.
"""
import json
import os
import re
import sys
from itertools import combinations
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent
DATA = GAME / "data"
REPO = GAME.parent.parent
EXTRA = ["profile", "guests", "memories", "incidents", "book", "stitchwork"]
TYPES = {
    "string": lambda v: isinstance(v, str),
    "integer": lambda v: isinstance(v, int) and not isinstance(v, bool),
    "number": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
    "boolean": lambda v: isinstance(v, bool),
    "object": lambda v: isinstance(v, dict),
    "array": lambda v: isinstance(v, list),
    "null": lambda v: v is None,
}

errors = []


def err(msg):
    errors.append(msg)


def load(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        err(f"missing {path.relative_to(GAME)}")
    except json.JSONDecodeError as exc:
        err(f"{path.relative_to(GAME)}: not valid JSON ({exc})")
    return None


def validate(value, schema, where):
    """The subset of JSON Schema the schemas here use: type, required, properties, items,
    enum, const, minItems, maxItems."""
    t = schema.get("type")
    if t is not None:
        kinds = t if isinstance(t, list) else [t]
        if not any(TYPES[k](value) for k in kinds):
            err(f"{where}: expected {' or '.join(kinds)}, got {type(value).__name__}")
            return
    if "enum" in schema and value not in schema["enum"]:
        err(f"{where}: {value!r} not one of {schema['enum']}")
    if "const" in schema and value != schema["const"]:
        err(f"{where}: must be {schema['const']!r}")
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                err(f"{where}: missing '{key}'")
        for key, sub in schema.get("properties", {}).items():
            if key in value:
                validate(value[key], sub, f"{where}.{key}")
    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            err(f"{where}: needs at least {schema['minItems']} items")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            err(f"{where}: needs at most {schema['maxItems']} items")
        if "items" in schema:
            for i, item in enumerate(value):
                validate(item, schema["items"], f"{where}[{i}]")


def find_vault_text(source):
    candidates = []
    if os.environ.get("ESC_VAULT"):
        candidates.append(Path(os.environ["ESC_VAULT"]))
    candidates.append(REPO.parent / "Pipelines-Plugin" / "creative-writing" / "vault")
    for vault in candidates:
        path = vault / source
        if path.is_file():
            return path.read_text(encoding="utf-8")
    return None


def norm(text):
    return re.sub(r"\s+", " ", text).strip()


def quote_in(text, quote):
    """A quote holds if each line of it (lines split by ' / ') appears in the source,
    ignoring the closing punctuation the design adds when it lifts a line out of dialogue."""
    body = norm(text)
    for part in quote.split(" / "):
        part = norm(part).rstrip(".,;:!?")
        if part and part not in body:
            return False
    return True


def main():
    game = load(DATA / "game.json")
    scenes_doc = load(DATA / "scenes.json")
    flags_doc = load(DATA / "flags.json")
    endings_doc = load(DATA / "endings.json")
    docs = {name: load(DATA / f"{name}.json") for name in EXTRA}
    schemas = {name: load(DATA / "schemas" / f"{name}.schema.json") for name in EXTRA}
    if errors:
        return report()

    for name in EXTRA:
        validate(docs[name], schemas[name], f"{name}.json")
    if errors:
        return report()

    chapters = [c["id"] for c in game["chapters"]]
    scene_list = scenes_doc["scenes"]
    scenes = {s["id"]: s for s in scene_list}
    order = {s["id"]: i for i, s in enumerate(scene_list)}
    flags = {f["name"]: f for f in flags_doc["state"]}
    endings = {e["id"]: e for e in endings_doc["endings"]}

    def writes(sid):
        return set(scenes.get(sid, {}).get("writes", []))

    def need_scene(sid, where):
        if sid not in scenes:
            err(f"{where}: scene '{sid}' is not in scenes.json")
            return False
        return True

    def need_flag(name, where):
        if name not in flags:
            err(f"{where}: '{name}' is not declared in flags.json")
            return False
        return True

    profile, guests, memories = docs["profile"], docs["guests"], docs["memories"]
    incidents, book, stitch = docs["incidents"], docs["book"], docs["stitchwork"]

    # ---- profile.json ---------------------------------------------------------------
    profile_flags = {n for n, f in flags.items() if f["description"].startswith("PROFILE")}
    key_flags = {k["flag"] for k in profile["keys"]}
    for name in sorted(profile_flags - key_flags):
        err(f"profile.json: flags.json marks '{name}' PROFILE but the profile store has no key for it")
    for name in sorted(key_flags - profile_flags):
        err(f"profile.json: key '{name}' is not a flag whose description starts with PROFILE")
    for k in profile["keys"]:
        where = f"profile.json key {k['name']}"
        if k["name"] != k["flag"]:
            err(f"{where}: name must equal the flag it mirrors ('{k['flag']}')")
        f = flags.get(k["flag"])
        if f is None:
            continue
        for attr in ("type", "default", "values", "fields"):
            if f.get(attr) != k.get(attr):
                err(f"{where}: {attr} {k.get(attr)!r} differs from flags.json {f.get(attr)!r}")
    key_names = {k["name"] for k in profile["keys"]}
    for d in profile["derived"]:
        where = f"profile.json derived {d['name']}"
        if need_flag(d["name"], where) and d["name"] in profile_flags:
            err(f"{where}: a derived name is not stored, so its description must not start with PROFILE")
        if d["from"] not in key_names:
            err(f"{where}: derives from '{d['from']}', which is not a profile key")
        if d["name"] in flags and set(d["rule"].values()) != set(flags[d["name"]].get("values", [])):
            err(f"{where}: rule values {sorted(d['rule'].values())} differ from the flag's values")
    profile_scenes = {s["id"] for s in scene_list if writes(s["id"]) & profile_flags}
    listed = set(profile["written"]["scenes"])
    for sid in sorted(listed - profile_scenes):
        if need_scene(sid, "profile.json written.scenes"):
            err(f"profile.json written.scenes: '{sid}' writes no profile key")
    for sid in sorted(profile_scenes - listed):
        err(f"profile.json written.scenes: '{sid}' writes a profile key but is not listed")
    ending_last_scene = {e: (endings[e].get("final_scenes") or [None])[-1] for e in endings}
    if listed != {s for s in ending_last_scene.values() if s}:
        err("profile.json written.scenes: must be exactly the last final scene of each ending")
    always = {"run.number", "shelf.previous_ending", "book.carried"} & key_names
    for sid in listed & set(scenes):
        for name in sorted(always - writes(sid)):
            err(f"scenes.json {sid}: an ending scene must write profile key '{name}'")
    sw = {r["ending"]: r for r in profile["shelf_writes"]}
    if set(sw) != set(endings):
        err(f"profile.json shelf_writes: endings {sorted(sw)} differ from endings.json {sorted(endings)}")
    prev = flags.get("shelf.previous_ending", {})
    if set(prev.get("values", [])) != set(endings) | {"none"}:
        err("flags.json shelf.previous_ending: values must be 'none' plus every ending id")
    for e, row in sw.items():
        last = ending_last_scene.get(e)
        if last is None:
            continue
        wrote = "shelf.generations" in writes(last)
        if row["entries"] == "none" and wrote:
            err(f"profile.json shelf_writes {e}: writes nothing, but {last} writes shelf.generations")
        if row["entries"] != "none" and not wrote:
            err(f"profile.json shelf_writes {e}: {last} must write shelf.generations")
        if row["entries"] == "herded_guests" and row.get("group_from") != "run.hunt_group":
            err(f"profile.json shelf_writes {e}: herded guests come from run.hunt_group")
        if row["entries"] == "friends" and row.get("group_from") != "pack":
            err(f"profile.json shelf_writes {e}: friends come from the pack")
    gen = flags.get("shelf.generations", {})
    for field in ("run", "group", "guest", "form", "ending"):
        if field not in gen.get("fields", []):
            err(f"flags.json shelf.generations: needs field '{field}' for the profile shelf")
    if "spread" not in flags.get("book.carried", {}).get("fields", []):
        err("flags.json book.carried: needs field 'spread' so carried spreads can be put in order")
    if profile["generations_on_shelf"] != 1:
        err("profile.json generations_on_shelf: the shelf keeps one generation (section 12)")

    # ---- guests.json ----------------------------------------------------------------
    pack_ids = {p["id"] for p in guests["pack"]}
    if pack_ids != {"narrator", "jamie", "lila", "marcus", "dani"}:
        err(f"guests.json pack: expected the five friends, got {sorted(pack_ids)}")
    for p in guests["pack"]:
        if p["hunger"] is not None:
            need_flag(p["hunger"], f"guests.json pack {p['id']}")
    groups = {g["id"]: g for g in guests["groups"]}
    if set(groups) != {"b", "c"}:
        err("guests.json groups: needs groups b and c (one hunt group per run, arriving in Act 2)")
    for gid, g in groups.items():
        if g.get("arrives_in_act") != 2:
            err(f"guests.json group {gid}: the hunt group arrives in Act 2 (section 20, answer 1)")
        roles = g.get("act2_roles", {})
        member_ids = {m["id"] for m in g["members"]}
        for role in ("reads_guestbook", "puts_jamie_on_couch", "did_you_see_that", "light_sleeper"):
            if roles.get(role) not in member_ids:
                err(f"guests.json group {gid}: act2_roles.{role} must name one of its members")
    hunt_group = flags.get("run.hunt_group", {})
    if set(hunt_group.get("values", [])) != {g for g in groups if groups[g]["act"] == 3}:
        err("flags.json run.hunt_group: values must be the Act 3 group ids")
    for d in profile["derived"]:
        for parity, gid in d["rule"].items():
            if gid in groups and groups[gid]["runs"] != parity:
                err(f"guests.json group {gid}: runs '{groups[gid]['runs']}' but profile derives it on {parity} runs")
    symbols, all_ids = [], set()
    for gid, g in groups.items():
        for sid in g["scenes"]:
            need_scene(sid, f"guests.json group {gid}")
        for m in g["members"]:
            where = f"guests.json {gid}.{m['id']}"
            if m["id"] in all_ids or m["id"] in pack_ids:
                err(f"{where}: id used twice")
            all_ids.add(m["id"])
            if g["act"] == 3:
                for key in ("slot", "dread", "form", "parlour_symbol"):
                    if key not in m:
                        err(f"{where}: an Act 3 guest needs '{key}'")
                if "slot" in m and m.get("dread") != f"dread.guest_{m['slot']}":
                    err(f"{where}: dread must be dread.guest_{m.get('slot')}")
                if "dread" in m:
                    need_flag(m["dread"], where)
                symbols.append(m.get("parlour_symbol"))
        if g["act"] == 3 and sorted(m.get("slot") for m in g["members"]) != [1, 2, 3]:
            err(f"guests.json group {gid}: slots must be 1, 2 and 3")
    if len(symbols) != len(set(symbols)):
        err("guests.json: every Act 3 guest needs their own parlour symbol")
    if "b" in groups and "c" in groups:
        lines = {gid: sorted(l["text"] for m in groups[gid]["members"] for l in m["lines"] if l["verbatim"])
                 for gid in ("b", "c")}
        if lines["b"] != lines["c"]:
            err("guests.json: Group C must speak the same source lines as Group B (section 6)")
        for slot in (1, 2, 3):
            mb = [m for m in groups["b"]["members"] if m.get("slot") == slot]
            mc = [m for m in groups["c"]["members"] if m.get("slot") == slot]
            if mb and mc and sorted(l["text"] for l in mb[0]["lines"] if l["verbatim"]) == \
                    sorted(l["text"] for l in mc[0]["lines"] if l["verbatim"]):
                err(f"guests.json: slot {slot} of Group C speaks exactly Group B's lines; assign them to different mouths")
    incident_ids = {i["id"] for i in incidents["incidents"]}
    for row in guests["carried_incidents"]["rows"]:
        where = f"guests.json carried_incidents {row['incident']}"
        if row["incident"] not in incident_ids:
            err(f"{where}: not an incident in incidents.json")
        for gid in ("b", "c"):
            m = [m for m in groups.get(gid, {}).get("members", []) if m.get("slot") == row["slot"]]
            if m and m[0].get("form") != row["toy"]:
                err(f"{where}: needs a {row['toy']} in slot {row['slot']}; group {gid} has {m[0].get('form')}")

    # ---- incidents.json -------------------------------------------------------------
    exp_ids = [e["id"] for e in incidents["explanations"]]
    cur = flags.get("explanation.current", {})
    if set(cur.get("values", [])) != set(exp_ids) | {"none"}:
        err("incidents.json explanations: ids must match explanation.current's values (plus 'none')")
    for e in incidents["explanations"]:
        need_flag(e["flag"], f"incidents.json explanation {e['id']}")
    last_index = -1
    shelvable = []
    for inc in incidents["incidents"]:
        where = f"incidents.json {inc['id']}"
        if not need_scene(inc["scene"], where):
            continue
        if order[inc["scene"]] < last_index:
            err(f"{where}: incidents must be in play order")
        last_index = order[inc["scene"]]
        if set(inc["breaks"]) != set(exp_ids):
            err(f"{where}: breaks must name every explanation")
        if inc["shelvable"]:
            shelvable.append(inc)
            if "incident_log" not in writes(inc["scene"]):
                err(f"{where}: scene {inc['scene']} must write incident_log")
    if len(shelvable) != 8:
        err(f"incidents.json: {len(shelvable)} shelvable incidents; the design has eight (I1-I8)")
    if [i["id"] for i in incidents["incidents"]] != [f"I{n}" for n in range(1, len(incidents["incidents"]) + 1)]:
        err("incidents.json: ids must run I1, I2, ... in order")

    # ---- memories.json --------------------------------------------------------------
    tokens = memories["tokens"]
    totals = memories["totals"]
    by_inc = {i["id"]: i for i in incidents["incidents"]}
    act1 = set(chapters[:5])
    if len(tokens) != totals["all"]:
        err(f"memories.json: {len(tokens)} tokens, totals.all says {totals['all']}")
    if sum(t["guaranteed"] for t in tokens) != totals["guaranteed"]:
        err(f"memories.json: {sum(t['guaranteed'] for t in tokens)} guaranteed, totals says {totals['guaranteed']}")
    if sum(t["chapter"] in act1 for t in tokens) != totals["act1_possible"]:
        err(f"memories.json: Act 1 tokens do not add up to totals.act1_possible ({totals['act1_possible']})")
    kept = flags.get("memory.kept", {}).get("range", [0, 0])
    if kept[1] != len(tokens):
        err(f"flags.json memory.kept: range ends at {kept[1]}, but there are {len(tokens)} tokens")
    if len({t["id"] for t in tokens}) != len(tokens) or len({t["name"] for t in tokens}) != len(tokens):
        err("memories.json: token ids and names must be unique")
    gated = []
    for t in tokens:
        where = f"memories.json {t['id']}"
        if t["person"] not in pack_ids:
            err(f"{where}: person '{t['person']}' is not in guests.json pack")
        if t["chapter"] not in chapters:
            err(f"{where}: chapter '{t['chapter']}' is not in game.json")
        if not need_scene(t["scene"], where):
            continue
        if scenes[t["scene"]]["chapter"] != t["chapter"]:
            err(f"{where}: scene {t['scene']} is in {scenes[t['scene']]['chapter']}, not {t['chapter']}")
        if "memory.earned" not in writes(t["scene"]):
            err(f"{where}: scene {t['scene']} must write memory.earned")
        c = t["condition"]
        if t["guaranteed"] != (c["type"] == "always"):
            err(f"{where}: guaranteed tokens are exactly those with condition 'always'")
        if c["type"] == "shelve":
            if not c.get("incidents"):
                err(f"{where}: a shelve condition names its incidents")
            for iid in c.get("incidents", []):
                inc = by_inc.get(iid)
                if inc is None or not inc["shelvable"]:
                    err(f"{where}: '{iid}' is not a shelvable incident")
                elif inc["scene"] in order and order[inc["scene"]] > order[t["scene"]]:
                    err(f"{where}: {iid} plays in {inc['scene']}, after the token's scene {t['scene']}")
            gated.append(set(c.get("incidents", [])))
        if c["type"] == "flag" and need_flag(c.get("flag", ""), where) and c["flag"] not in writes(t["scene"]):
            err(f"{where}: scene {t['scene']} must write {c['flag']}")
    # Section 12: the Shelve-gated tokens need four Shelves; the Keeper needs six Keeps; no run gets both.
    ids = [i["id"] for i in shelvable]
    least = next((n for n in range(len(ids) + 1)
                  if any(all(g & set(combo) for g in gated) for combo in combinations(ids, n))), None)
    if least != 4:
        err(f"memories.json: the Shelve-gated tokens need {least} Shelves; section 12 says four")
    leads = [p for p in book["pages"] if p["found"] == "lead"]
    if least is not None and len(shelvable) - least >= len(leads):
        err("memories.json: a run could earn every Shelve-gated token and every lead; section 12 says no run gets both")

    # ---- book.json ------------------------------------------------------------------
    pages = {p["id"]: p for p in book["pages"]}
    if len(pages) != len(book["pages"]) or len(pages) != book["pages_total"]:
        err(f"book.json: {len(book['pages'])} pages with unique ids expected to equal pages_total {book['pages_total']}")
    explore = [p for p in book["pages"] if p["found"] == "explore"]
    if len(explore) != 6 or len(leads) != 6:
        err("book.json: six pages are found by exploring and six are leads (section 11)")
    if sorted(p.get("lead") for p in leads) != list(range(1, len(leads) + 1)):
        err("book.json: leads must be numbered 1 to 6")
    if len(leads) > len(shelvable):
        err("book.json: more leads than incidents that can be kept")
    earliest = {}
    for p in explore:
        if "scene" not in p:
            err(f"book.json page {p['id']}: an explored page names its scene")
        elif need_scene(p["scene"], f"book.json page {p['id']}"):
            earliest[p["id"]] = order[p["scene"]]
            if "book.pages_found" not in writes(p["scene"]):
                err(f"book.json page {p['id']}: scene {p['scene']} must write book.pages_found")
    for p in leads:
        n = p.get("lead", 0)
        if 1 <= n <= len(shelvable) and shelvable[n - 1]["scene"] in order:
            # Lead n can appear no earlier than the n-th incident, when every incident so far was kept.
            earliest[p["id"]] = order[shelvable[n - 1]["scene"]]
    used = []
    spread_ns = [s["n"] for s in book["spreads"]]
    if spread_ns != list(range(1, 7)):
        err("book.json spreads: must be spreads 1 to 6 in order")
    for s in book["spreads"]:
        where = f"book.json spread {s['n']}"
        need_flag(s["flag"], where)
        if s["flag"] != f"book.spread_{s['n']}":
            err(f"{where}: flag must be book.spread_{s['n']}")
        for pid in s["pages"]:
            if pid not in pages:
                err(f"{where}: page '{pid}' is not in pages")
        used += s["pages"]
        rules = sum(r["introduced_at"] <= s["n"] for r in book["order_rules"])
        if s["rules"] != rules:
            err(f"{where}: {s['rules']} rules, but {rules} are introduced by spread {s['n']}")
    if sorted(used) != sorted(pages):
        err("book.json: every page belongs to exactly one spread")
    colours = {c["role"] for c in book["thread_colours"]}
    if colours != {"act", "thing", "who"}:
        err("book.json thread_colours: one colour each for act, thing and who")
    first_sitting = {}
    for sit in book["sittings"]:
        where = f"book.json sitting {sit['n']}"
        if not need_scene(sit["scene"], where):
            continue
        sc = scenes[sit["scene"]]
        if sc.get("game") != "sewn_book":
            err(f"{where}: scene {sit['scene']} is not a sewn_book page")
        if bool(sc.get("world_runs")) != sit["world_runs"]:
            err(f"{where}: world_runs differs from scenes.json")
        for s in book["spreads"]:
            avail = all(pid in earliest and earliest[pid] < order[sit["scene"]] for pid in s["pages"])
            wrote = s["flag"] in writes(sit["scene"])
            if avail and s["n"] not in first_sitting:
                # The first sitting with every page of a spread must be able to read it.
                first_sitting[s["n"]] = sit["n"]
                if not wrote:
                    err(f"{where}: spread {s['n']} can first be complete at {sit['scene']}, which must write {s['flag']}")
            if wrote and not avail:
                err(f"{where}: {sit['scene']} writes {s['flag']}, but its pages cannot all be found by then")
    for s in book["spreads"]:
        if s["n"] not in first_sitting:
            err(f"book.json spread {s['n']}: no sitting comes after all its pages can be found")
    keeper = endings.get("keeper", {}).get("when", {})
    if isinstance(keeper, dict) and keeper.get("is") == "altar.choice":
        altar = [s for s in scene_list if "altar.choice" in s.get("writes", []) and s.get("game") == "stitchwork"]
        if not altar or "book.spread_6" not in altar[0].get("reads", []):
            err("scenes.json: the altar stitch must read book.spread_6 (the Keeper needs all six spreads)")

    # ---- stitchwork.json ------------------------------------------------------------
    q = {x["id"]: x for x in stitch["quality"]}
    if [x["min_percent"] for x in stitch["quality"]] != sorted((x["min_percent"] for x in stitch["quality"]), reverse=True):
        err("stitchwork.json quality: thresholds must run from Strong down")
    strap = flags.get("strap.quality", {}).get("values", [])
    for qid in q:
        if qid not in strap:
            err(f"stitchwork.json quality '{qid}' is not a strap.quality value")
    seams_n = len(stitch["seams"])
    lo = seams_n * min(x["slots_per_seam"] for x in stitch["quality"])
    hi = seams_n * max(x["slots_per_seam"] for x in stitch["quality"]) + stitch["mend_own_extra_slots"]
    if any(s["slots_max"] != max(x["slots_per_seam"] for x in stitch["quality"]) for s in stitch["seams"]):
        err("stitchwork.json seams: slots_max must equal Strong's slots per seam")
    rng = flags.get("seams.slots_total", {}).get("range")
    if rng != [lo, hi]:
        err(f"flags.json seams.slots_total: range {rng}, but seams give {lo} to {hi} (with one mend)")
    if not 1 <= stitch["ruth_line_min_strong_seams"] <= seams_n:
        err("stitchwork.json ruth_line_min_strong_seams: must be between 1 and the number of seams")
    token_ids = {t["id"]: t for t in tokens}
    altar_values = flags.get("altar.choice", {}).get("values", [])
    for p in stitch["patterns"]:
        where = f"stitchwork.json pattern {p['n']}"
        if not need_scene(p["scene"], where):
            continue
        sc = scenes[p["scene"]]
        if sc.get("game") != "stitchwork":
            err(f"{where}: scene {p['scene']} is not a stitchwork page")
        if bool(sc.get("world_runs")) != p["world_runs"]:
            err(f"{where}: world_runs differs from scenes.json")
        for name in p["writes"]:
            if need_flag(name, where) and name not in writes(p["scene"]):
                err(f"{where}: scene {p['scene']} must write {name}")
        for tid in p["tokens"]:
            if tid not in token_ids:
                err(f"{where}: token '{tid}' is not in memories.json")
            elif token_ids[tid]["scene"] != p["scene"]:
                err(f"{where}: token '{tid}' is earned in {token_ids[tid]['scene']}")
        for key in ("on_complete", "on_abandon"):
            if key in p and p[key] not in altar_values:
                err(f"{where}: {key} '{p[key]}' is not an altar.choice value")
        if p["seams"] > seams_n:
            err(f"{where}: more seams than the body has")
    if "keeper" in endings and isinstance(keeper, dict):
        done = [p.get("on_complete") for p in stitch["patterns"] if "on_complete" in p]
        if keeper.get("eq") not in done:
            err("stitchwork.json: no pattern completes into the Keeper ending's altar.choice value")

    # ---- verbatim quotes ------------------------------------------------------------
    source = guests["source"]
    text = find_vault_text(source)
    if text is None:
        print(f"note: vault not found; verbatim quotes from {source} not checked")
    else:
        quotes = []
        for g in guests["groups"]:
            for m in g["members"]:
                quotes += [(f"guests.json {m['id']}", l["text"]) for l in m["lines"] if l["verbatim"]]
        for s in book["spreads"]:
            quotes += [(f"book.json spread {s['n']}", t["text"]) for t in s["teaches"] if t["verbatim"]]
        for inc in incidents["incidents"]:
            for v in inc["breaks"].values():
                quotes += [(f"incidents.json {inc['id']}", q) for q in re.findall(r'"([^"]+)"', v or "")]
        for where, quote in quotes:
            if not quote_in(text, quote):
                err(f"{where}: \"{quote}\" is marked verbatim but is not in {source}")

    return report()


def report():
    for e in errors:
        print(e)
    if errors:
        print(f"stuffed-ones check_data: {len(errors)} problem(s)")
        return 1
    print("stuffed-ones check_data: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())

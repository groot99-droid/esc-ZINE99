#!/usr/bin/env python3
"""Check Behind the Peephole's own data files: data/beats.json, data/truth.json, data/deals.json.

Each file is checked against its schema in data/schemas/, then against the others and against the
shared data (game.json, scenes.json, flags.json, endings.json), as DESIGN.md sections 8, 11, 12, 13
and 18 describe them.

Stdlib only. Runs from any directory:  python games/behind-the-peephole/tools/check_data.py
Exits 0 when everything agrees, 1 when anything does not (each problem is printed).
"""
import json
import re
import sys
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent
DATA = GAME / "data"
SCHEMAS = DATA / "schemas"

ROOMS = ["r401", "r402", "r403", "r404", "r405", "r406"]
STATEMENT_NIGHTS = [1, 2, 3, 4, 5, 6]
ROWS_TOTAL = 36          # DESIGN.md section 13: "of 36 Statement rows"
ACCOUNT_TOTAL = 9        # DESIGN.md section 11: six missions and three single questions
MOSAIC_TRUE_LINKS = 16   # DESIGN.md section 17: "16 true links"
# DESIGN.md section 11, Night Patience: passes per appearance (None = unlimited), and the slipped
# cards of each night (cards 2n-3 and 2n-2: 1 and 2 on night two ... 11 and 12 on night seven).
PATIENCE_PASSES = {2: None, 3: 3, 4: 3, 5: 2, 6: 2, 7: 1}
RANKS = "A23456789TJQK"
SUITS = "SHDC"

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


# ---------------------------------------------------------------- a small JSON Schema subset

def schema_check(inst, schema, root, where):
    global problems
    if "$ref" in schema:
        ref = schema["$ref"]
        if not ref.startswith("#/"):
            problem(f"{where}: unsupported $ref {ref}")
            return
        node = root
        for part in ref[2:].split("/"):
            node = node[part]
        schema_check(inst, node, root, where)
    types = schema.get("type")
    if types is not None:
        types = types if isinstance(types, list) else [types]
        ok = False
        for t in types:
            if t == "object" and isinstance(inst, dict):
                ok = True
            elif t == "array" and isinstance(inst, list):
                ok = True
            elif t == "string" and isinstance(inst, str):
                ok = True
            elif t == "boolean" and isinstance(inst, bool):
                ok = True
            elif t == "integer" and isinstance(inst, int) and not isinstance(inst, bool):
                ok = True
            elif t == "number" and isinstance(inst, (int, float)) and not isinstance(inst, bool):
                ok = True
            elif t == "null" and inst is None:
                ok = True
        if not ok:
            problem(f"{where}: expected {'/'.join(types)}, got {type(inst).__name__}")
            return
    if "const" in schema and inst != schema["const"]:
        problem(f"{where}: must be {schema['const']!r}")
    if "enum" in schema and inst not in schema["enum"]:
        problem(f"{where}: {inst!r} is not one of {schema['enum']}")
    if isinstance(inst, str):
        if "pattern" in schema and not re.search(schema["pattern"], inst):
            problem(f"{where}: {inst!r} does not match {schema['pattern']}")
        if len(inst) < schema.get("minLength", 0):
            problem(f"{where}: too short")
    if isinstance(inst, (int, float)) and not isinstance(inst, bool):
        if "minimum" in schema and inst < schema["minimum"]:
            problem(f"{where}: {inst} is below {schema['minimum']}")
        if "maximum" in schema and inst > schema["maximum"]:
            problem(f"{where}: {inst} is above {schema['maximum']}")
    if isinstance(inst, dict):
        for key in schema.get("required", []):
            if key not in inst:
                problem(f"{where}: missing '{key}'")
        props = schema.get("properties", {})
        extra = schema.get("additionalProperties", True)
        for key, val in inst.items():
            if key in props:
                schema_check(val, props[key], root, f"{where}.{key}")
            elif extra is False:
                problem(f"{where}: unexpected key '{key}'")
            elif isinstance(extra, dict):
                schema_check(val, extra, root, f"{where}.{key}")
    if isinstance(inst, list):
        if len(inst) < schema.get("minItems", 0):
            problem(f"{where}: needs at least {schema['minItems']} items, has {len(inst)}")
        if "maxItems" in schema and len(inst) > schema["maxItems"]:
            problem(f"{where}: allows at most {schema['maxItems']} items, has {len(inst)}")
        if schema.get("uniqueItems"):
            seen = [json.dumps(x, sort_keys=True) for x in inst]
            if len(seen) != len(set(seen)):
                problem(f"{where}: items must be unique")
        if "items" in schema:
            for i, item in enumerate(inst):
                schema_check(item, schema["items"], root, f"{where}[{i}]")
    if "oneOf" in schema:
        saved = problems
        passing = 0
        for sub in schema["oneOf"]:
            problems = []
            schema_check(inst, sub, root, where)
            passing += not problems
        problems = saved
        if passing != 1:
            problem(f"{where}: must match exactly one of {len(schema['oneOf'])} forms, matches {passing}")


# ---------------------------------------------------------------- helpers

def tmin(hhmm):
    """Minutes since 23:00 on the shift clock."""
    h, m = map(int, hhmm.split(":"))
    return m if h == 23 else (h + 1) * 60 + m


def cond_names(cond, out):
    if cond is True or not isinstance(cond, dict):
        return
    for key in ("all", "any"):
        if key in cond:
            for sub in cond[key]:
                cond_names(sub, out)
    if "not" in cond:
        cond_names(cond["not"], out)
    if "is" in cond:
        out.add(cond["is"])
    if "ledger" in cond:
        out.add(cond["ledger"])


def thresholds(cond, name, out):
    if not isinstance(cond, dict):
        return
    for key in ("all", "any"):
        for sub in cond.get(key, []):
            thresholds(sub, name, out)
    if "not" in cond:
        thresholds(cond["not"], name, out)
    if cond.get("is") == name:
        for op in ("eq", "gte", "gt", "lte", "lt"):
            if op in cond:
                out.append((op, cond[op]))


def full_deck():
    return {r + s for s in SUITS for r in RANKS}


def replay(columns, stock, passes, moves):
    """Play a winning line; return None if it wins, else the reason it does not."""
    def rank(c):
        return RANKS.index(c[0]) + 1

    def red(c):
        return c[1] in "HD"

    down = [list(col[:-1]) for col in columns]
    up = [[col[-1]] for col in columns]
    talon = list(stock)
    idx = 0
    used = 1
    found = {s: 0 for s in SUITS}

    def flip(j):
        if not up[j] and down[j]:
            up[j].append(down[j].pop())

    def place(card, k):
        if up[k]:
            top = up[k][-1]
            return rank(top) == rank(card) + 1 and red(top) != red(card)
        return not down[k] and rank(card) == 13

    for i, mv in enumerate(moves):
        at = f"move {i + 1} '{mv}'"
        if mv == "D":
            if idx >= len(talon):
                return f"{at}: the stock is empty"
            idx += 1
            continue
        if mv == "R":
            if idx < len(talon):
                return f"{at}: the stock is not used up"
            if passes is not None and used >= passes:
                return f"{at}: no passes left ({passes})"
            idx = 0
            used += 1
            continue
        src, dst = mv.split(">")
        n = 1
        if "x" in dst:
            dst, n = dst.split("x")
            n = int(n)
        if src == "W":
            if idx == 0:
                return f"{at}: the waste is empty"
            cards = [talon[idx - 1]]
        else:
            j = int(src) - 1
            if n < 1 or n > len(up[j]):
                return f"{at}: column {j + 1} has {len(up[j])} face-up cards"
            cards = up[j][-n:]
            for a, b in zip(cards, cards[1:]):
                if not (rank(a) == rank(b) + 1 and red(a) != red(b)):
                    return f"{at}: the run is not in sequence"
        if dst == "F":
            if len(cards) != 1 or found[cards[0][1]] != rank(cards[0]) - 1:
                return f"{at}: {cards[0]} cannot go to its foundation"
            found[cards[0][1]] += 1
        else:
            k = int(dst) - 1
            if not place(cards[0], k):
                return f"{at}: {cards[0]} cannot go on column {k + 1}"
        if src == "W":
            talon.pop(idx - 1)
            idx -= 1
        else:
            del up[j][-n:]
            flip(j)
        if dst != "F":
            up[k].extend(cards)
    if sum(found.values()) != 52:
        return f"the line ends with {sum(found.values())} of 52 cards on the foundations"
    return None


# ---------------------------------------------------------------- main checks

def main():
    game = load(DATA / "game.json")
    scenes_doc = load(DATA / "scenes.json")
    flags_doc = load(DATA / "flags.json")
    endings_doc = load(DATA / "endings.json")
    beats_doc = load(DATA / "beats.json")
    truth = load(DATA / "truth.json")
    deals_doc = load(DATA / "deals.json")
    docs = {"beats": beats_doc, "truth": truth, "deals": deals_doc}
    for name, doc in docs.items():
        schema = load(SCHEMAS / f"{name}.schema.json")
        if doc is not None and schema is not None:
            schema_check(doc, schema, schema, f"{name}.json")
    if None in (game, scenes_doc, flags_doc, endings_doc, beats_doc, truth, deals_doc) or problems:
        return report()

    chapters = {c["id"] for c in game["chapters"]}
    scenes = {s["id"]: s for s in scenes_doc["scenes"]}
    flags = {f["name"]: f for f in flags_doc["state"]}

    def scene_ok(sid, night, layer, kind_key=None, kind_val=None, where=""):
        s = scenes.get(sid)
        if s is None:
            problem(f"{where}: scene '{sid}' is not in scenes.json")
            return
        if s.get("chapter") != f"n{night}":
            problem(f"{where}: scene '{sid}' is in chapter {s.get('chapter')}, not n{night}")
        if s.get("layer") != layer or (kind_key and s.get(kind_key) != kind_val):
            problem(f"{where}: scene '{sid}' is not a {layer} {kind_val or ''} scene".rstrip())

    def flag_ok(name, where, kind=None):
        if name not in flags:
            problem(f"{where}: '{name}' is not declared in flags.json")
        elif kind and flags[name]["type"] != kind:
            problem(f"{where}: '{name}' is a {flags[name]['type']}, expected {kind}")

    # ---------------- beats.json
    b = beats_doc
    if b["rooms"] != ROOMS:
        problem(f"beats.json rooms: expected {ROOMS}")
    kinds, regions = set(b["kinds"]), set(b["regions"])
    shift_start, shift_end = tmin(b["shift"]["start"]), tmin(b["shift"]["end"])
    if (shift_start, shift_end) != (0, 360):
        problem("beats.json shift: DESIGN.md runs the shift 23:00 to 05:00")
    wmin, wmax = b["window_minutes"]["min"], b["window_minutes"]["max"]
    gap = b["bell_to_door_minutes"]

    nights = {}
    for i, n in enumerate(b["nights"]):
        where = f"beats.json nights[{i}] (night {n['night']})"
        if n["night"] in nights:
            problem(f"{where}: night listed twice")
        nights[n["night"]] = n
        if n["chapter"] not in chapters or n["chapter"] != f"n{n['night']}":
            problem(f"{where}: chapter '{n['chapter']}' is not n{n['night']} in game.json")
        scene_ok(n["eye_scene"], n["night"], "2d", "mode", "eye", where)
        scene_ok(n["race_scene"], n["night"], "2d", "mode", "race", where)
        plain = [r["room"] for r in n["returns"] if "requires" not in r]
        if sorted(plain) != ROOMS:
            problem(f"{where}: returns must name each room once, got {sorted(plain)}")
        for r in n["returns"]:
            if "bell" in r and tmin(r["door"]) - tmin(r["bell"]) != gap:
                problem(f"{where}: {r['room']} door {r['door']} is not {gap} minutes after the bell {r['bell']}")
            if "requires" in r:
                names = set()
                cond_names(r["requires"], names)
                for nm in names:
                    flag_ok(nm, f"{where} {r['room']} requires")
    if sorted(nights) != list(range(1, 8)):
        problem(f"beats.json nights: expected 1 to 7, got {sorted(nights)}")
    knock_room = {k: v["knock"]["room"] for k, v in nights.items()}
    guest_knocks = [knock_room.get(k) for k in STATEMENT_NIGHTS]
    if sorted(r for r in guest_knocks if r) != ROOMS:
        problem(f"beats.json: the 2:14 knocks of nights one to six must reach each room once, got {guest_knocks}")
    if knock_room.get(7) != "office":
        problem("beats.json: the night-seven knock is at your own door ('office')")

    def door_time(night, room, conditional):
        for r in nights.get(night, {}).get("returns", []):
            if r["room"] == room and ("requires" in r) == conditional:
                return None if r.get("in") else tmin(r["door"])
        return None

    beats, clue_of = {}, {}
    per_room = {}
    for i, bt in enumerate(b["beats"]):
        where = f"beats.json beat {bt['id']}"
        if bt["id"] in beats:
            problem(f"{where}: id used twice")
        beats[bt["id"]] = bt
        if not bt["id"].startswith(f"n{bt['night']}.{bt['room']}."):
            problem(f"{where}: id does not start with its night and room")
        if bt["night"] not in nights:
            problem(f"{where}: night {bt['night']} has no entry in nights")
        if bt["room"] not in ROOMS:
            problem(f"{where}: room '{bt['room']}' is not a guest room")
        scene_ok(bt["scene"], bt["night"], "2d", "mode", "eye", where)
        if bt["kind"] not in kinds:
            problem(f"{where}: kind '{bt['kind']}' is not one of the seven")
        if bt["region"] not in regions:
            problem(f"{where}: region '{bt['region']}' is not a plate region")
        if bt["region"] == "floor" and not bt["floor_visible"]:
            problem(f"{where}: a floor-only beat must be floor-visible")
        s, e = tmin(bt["window"]["start"]), tmin(bt["window"]["end"])
        if not (shift_start <= s < e <= shift_end):
            problem(f"{where}: window {bt['window']['start']}-{bt['window']['end']} is not inside the shift")
        elif not (wmin <= e - s <= wmax):
            problem(f"{where}: window of {e - s} game minutes; DESIGN.md allows {wmin} to {wmax}")
        conditional = "requires" in bt
        if conditional:
            names = set()
            cond_names(bt["requires"], names)
            for nm in names:
                flag_ok(nm, f"{where} requires")
        door = door_time(bt["night"], bt["room"], conditional)
        if door is not None and s < door:
            problem(f"{where}: starts at {bt['window']['start']}, before the main door opens")
        if bt.get("threshold") and door != s:
            problem(f"{where}: marked threshold but does not start as the door opens")
        if not bt.get("threshold") and door == s and not conditional:
            problem(f"{where}: starts as the door opens but is not marked threshold")
        cid = bt["clue"]["id"]
        if cid != "c." + bt["id"]:
            problem(f"{where}: clue id should be 'c.{bt['id']}'")
        if cid in clue_of:
            problem(f"{where}: clue '{cid}' written twice")
        clue_of[cid] = bt
        if not conditional:
            per_room.setdefault((bt["night"], bt["room"]), []).append(bt)
    for (night, room), lst in per_room.items():
        if len(lst) > 6:
            problem(f"beats.json: {room} has {len(lst)} beats on night {night}; DESIGN.md allows up to 6")
    for night in STATEMENT_NIGHTS:
        for room in ROOMS:
            if (night, room) not in per_room:
                problem(f"beats.json: {room} has no beat on night {night}")

    office = {}
    for o in b["office_clues"]:
        where = f"beats.json office clue {o['id']}"
        if o["id"] in office:
            problem(f"{where}: id used twice")
        office[o["id"]] = o
        if not o["id"].startswith(f"o.n{o['night']}."):
            problem(f"{where}: id does not match its night")
        if "requires_flag" in o:
            flag_ok(o["requires_flag"], where, "bool")

    # ---------------- deals.json (read before truth, so slip refs resolve)
    slip_night = {}
    deals = {}
    for d in deals_doc["deals"]:
        n = d["night"]
        where = f"deals.json night {n}"
        if n in deals:
            problem(f"{where}: listed twice")
        deals[n] = d
        scene_ok(d["scene"], n, "1d", "game", "patience", where)
        if n in PATIENCE_PASSES and d["passes"] != PATIENCE_PASSES[n]:
            problem(f"{where}: {d['passes']} passes; DESIGN.md gives {PATIENCE_PASSES[n]}")
        lens = [len(c) for c in d["columns"]]
        if lens != [1, 2, 3, 4, 5, 6]:
            problem(f"{where}: columns hold {lens}; the deal is 1 to 6 (21 cards)")
        cards = [c for col in d["columns"] for c in col] + d["stock"]
        if len(cards) != 52 or set(cards) != full_deck():
            dup = sorted({c for c in cards if cards.count(c) > 1})
            missing = sorted(full_deck() - set(cards))
            problem(f"{where}: not one full deck (duplicates {dup}, missing {missing})")
        expect = {2 * n - 3, 2 * n - 2}
        got = {s["card"] for s in d["slipped"]}
        if got != expect:
            problem(f"{where}: slipped cards {sorted(got)}; DESIGN.md puts {sorted(expect)} on night {n}")
        depths = sorted(s["depth"] for s in d["slipped"])
        if depths != ["column6", "stock"]:
            problem(f"{where}: needs one slipped card in the stock and one under column six, got {depths}")
        for s in d["slipped"]:
            if s["card"] in slip_night:
                problem(f"deals.json: slipped card {s['card']} placed twice")
            slip_night[s["card"]] = n
            if s["depth"] == "stock" and "stock_position" not in s:
                problem(f"{where}: slipped card {s['card']} needs a stock_position (6 to 10)")
            if s["depth"] == "stock" and s["card"] % 2 == 0 or s["depth"] == "column6" and s["card"] % 2 == 1:
                problem(f"{where}: slipped card {s['card']} is at the wrong depth (odd cards in the stock, even under column six)")
            if "sets" in s:
                flag_ok(s["sets"], f"{where} slipped card {s['card']}", "bool")
        if lens == [1, 2, 3, 4, 5, 6] and len(cards) == 52:
            why = replay(d["columns"], d["stock"], d["passes"], d["solution"])
            if why:
                problem(f"{where}: the winning line does not win: {why}")
        card_moves = sum(1 for m in d["solution"] if m not in ("D", "R"))
        if "max_card_moves" in d and card_moves > d["max_card_moves"]:
            problem(f"{where}: won in {card_moves} card moves; must be at most {d['max_card_moves']}")
    if sorted(deals) != sorted(PATIENCE_PASSES):
        problem(f"deals.json: deals for nights {sorted(deals)}; DESIGN.md deals on nights 2 to 7")
    if sorted(slip_night) != list(range(1, 13)):
        problem(f"deals.json: slipped cards {sorted(slip_night)}; expected 1 to 12")
    if flags.get("patience_cards_read", {}).get("description", "").find(f"0 to {len(slip_night)}") < 0:
        problem(f"flags.json patience_cards_read: description should give the range 0 to {len(slip_night)}")

    # ---------------- references used by truth.json
    statements = {s["night"]: s for s in truth["statements"]}

    def ref_night(ref, where):
        """Night a reference becomes available, or None (reported) if it does not resolve."""
        if ref.startswith("c."):
            bt = clue_of.get(ref)
            if bt is None:
                problem(f"{where}: clue card '{ref}' is not written by any beat")
                return None
            if "requires" in bt:
                problem(f"{where}: clue card '{ref}' comes from a beat that may not happen")
            return bt["night"]
        if ref.startswith("o."):
            if ref not in office:
                problem(f"{where}: office clue '{ref}' is not in beats.json")
                return None
            return office[ref]["night"]
        if ref.startswith("slip."):
            num = int(ref.split(".")[1])
            if num not in slip_night:
                problem(f"{where}: slipped card {num} is not in deals.json")
                return None
            return slip_night[num]
        if ref.startswith("knock."):
            num = int(ref[len("knock.n"):])
            if num not in nights:
                problem(f"{where}: no knock on night {num}")
                return None
            return num
        if ref.startswith("row."):
            _, nn, room = ref.split(".")
            num = int(nn[1:])
            if num not in statements or room not in ROOMS:
                problem(f"{where}: '{ref}' is not a Statement row")
                return None
            return num
        problem(f"{where}: unknown reference '{ref}'")
        return None

    def refs_ok(refs, by_night, where):
        for ref in refs:
            n = ref_night(ref, where)
            if n is not None and n > by_night:
                problem(f"{where}: '{ref}' is only available from night {n}, after night {by_night}")

    # ---------------- truth.json: the Statements
    rows_total = 0
    if sorted(statements) != STATEMENT_NIGHTS:
        problem(f"truth.json statements: nights {sorted(statements)}; expected 1 to 6")
    for n, st in sorted(statements.items()):
        where = f"truth.json statement night {n}"
        scene_ok(st["scene"], n, "1d", "game", "statement", where)
        if f"stmt.n{n}" not in scenes.get(st["scene"], {}).get("writes", []):
            problem(f"{where}: scene '{st['scene']}' does not write stmt.n{n}")
        cats = {}
        for c in st["categories"]:
            ids = [o["id"] for o in c["options"]]
            if c["id"] in cats:
                problem(f"{where}: category '{c['id']}' twice")
            if len(ids) != 6 or len(set(ids)) != 6:
                problem(f"{where}: category '{c['id']}' needs six distinct options")
            cats[c["id"]] = set(ids)
        rooms = [r["room"] for r in st["truth"]]
        if sorted(rooms) != ROOMS:
            problem(f"{where}: rows must be the six rooms once each, got {rooms}")
        used = {c: [] for c in cats}
        for r in st["truth"]:
            rw = f"{where} {r['room']}"
            if set(r["answers"]) != set(cats):
                problem(f"{rw}: needs exactly one answer in each of {sorted(cats)}, has {sorted(r['answers'])}")
            for c, val in r["answers"].items():
                if c in cats and val not in cats[c]:
                    problem(f"{rw}: '{val}' is not an option of '{c}'")
                if c in used:
                    used[c].append(val)
            if set(r["evidence"]) != set(cats):
                problem(f"{rw}: evidence must cover each category")
            for c, refs in r["evidence"].items():
                refs_ok(refs, n, f"{rw} evidence.{c}")
            rows_total += 1
        for c, vals in used.items():
            if len(set(vals)) != len(vals):
                problem(f"{where}: category '{c}' gives the same answer to two rows; each row has one true answer and each answer one row")
        if n == 6 and "knock_night" in cats:
            for r in st["truth"]:
                val = r["answers"].get("knock_night")
                if val and knock_room.get(int(val[1:])) != r["room"]:
                    problem(f"{where} {r['room']}: knock_night {val} disagrees with beats.json, where that knock is at {knock_room.get(int(val[1:]))}")
    if rows_total != ROWS_TOTAL:
        problem(f"truth.json: {rows_total} Statement rows; DESIGN.md scores {ROWS_TOTAL}")

    # ---------------- truth.json: the Account
    acc = truth["account"]
    scene_ok(acc["scene"], 7, "1d", "game", "statement", "truth.json account")
    mission_ids = [o["id"] for o in acc["missions"]["options"]]
    if len(mission_ids) != 6 or len(set(mission_ids)) != 6:
        problem("truth.json account: needs six distinct missions")
    mrooms = [r["room"] for r in acc["missions"]["truth"]]
    if sorted(mrooms) != ROOMS:
        problem(f"truth.json account: mission rows must be the six rooms, got {mrooms}")
    answers = [r["answer"] for r in acc["missions"]["truth"]]
    if len(set(answers)) != len(answers) or not set(answers) <= set(mission_ids):
        problem("truth.json account: each mission must be the answer of exactly one room")
    for r in acc["missions"]["truth"]:
        refs_ok(r["evidence"], 7, f"truth.json account {r['room']}")
    for q in acc["questions"]:
        ids = [o["id"] for o in q["options"]]
        if q["answer"] not in ids or len(set(ids)) != len(ids):
            problem(f"truth.json account question '{q['id']}': its answer must be one of its distinct options")
        refs_ok(q["evidence"], 7, f"truth.json account question '{q['id']}'")
    account_total = len(acc["missions"]["truth"]) + len(acc["questions"])
    if account_total != ACCOUNT_TOTAL:
        problem(f"truth.json account: {account_total} answers; DESIGN.md asks {ACCOUNT_TOTAL}")
    sg = acc["scapegoat"]
    for m in sg["missions_in_order"]:
        if m not in mission_ids:
            problem(f"truth.json account scapegoat: '{m}' is not a mission")
    flag_ok(sg["flag"], "truth.json account scapegoat", "enum")
    if sg["flag"] in flags and flags[sg["flag"]].get("default") != sg["default"]:
        problem(f"truth.json account scapegoat: default {sg['default']} disagrees with flags.json")

    # ---------------- the endings' thresholds against the totals
    for flag_name, total in (("rows_correct", ROWS_TOTAL), ("account_correct", ACCOUNT_TOTAL), ("pages_delivered", len(ROOMS))):
        found = []
        for e in endings_doc["endings"]:
            thresholds(e.get("when"), flag_name, found)
        if not found:
            problem(f"endings.json: no ending reads {flag_name}")
        for op, val in found:
            if not (0 <= val <= total):
                problem(f"endings.json: {flag_name} {op} {val} is outside 0 to {total}")
        gtes = {v for op, v in found if op == "gte"}
        ltes = {v for op, v in found if op == "lte"}
        for v in gtes:
            if ltes and v - 1 not in ltes:
                problem(f"endings.json: {flag_name} gte {v} has no matching lte {v - 1}")
    for n in STATEMENT_NIGHTS:
        flag_ok(f"stmt.n{n}", "truth.json")
    if f"0 to {ROWS_TOTAL}" not in flags.get("rows_correct", {}).get("description", ""):
        problem(f"flags.json rows_correct: description should give the range 0 to {ROWS_TOTAL}")
    if f"0 to {ACCOUNT_TOTAL}" not in flags.get("account_correct", {}).get("description", ""):
        problem(f"flags.json account_correct: description should give the range 0 to {ACCOUNT_TOTAL}")

    # ---------------- beats.json: false signs against the truth
    fs = b["false_signs"]
    covered = set()
    for f in fs["substitutions"]:
        where = f"beats.json false sign {f['id']}"
        key = (f["night"], f["room"])
        if key in covered:
            problem(f"{where}: a second false sign for {f['room']} on night {f['night']}")
        covered.add(key)
        if f["id"] != f"f.n{f['night']}.{f['room']}":
            problem(f"{where}: id should be f.n{f['night']}.{f['room']}")
        rb = beats.get(f["replaces"])
        if rb is None:
            problem(f"{where}: replaces '{f['replaces']}', which is not a beat")
        elif (rb["night"], rb["room"]) != key:
            problem(f"{where}: replaces a beat of another night or room")
        if f["kind"] not in kinds or f["region"] not in regions:
            problem(f"{where}: unknown kind or region")
        if f["clue"]["id"] in clue_of or f["clue"]["id"] != "cf" + f["id"][1:]:
            problem(f"{where}: clue id should be '{'cf' + f['id'][1:]}' and not reuse a true clue")
        st = statements.get(f["night"])
        if st:
            cats = {c["id"]: {o["id"] for o in c["options"]} for c in st["categories"]}
            cat, opt = f["points_to"]["category"], f["points_to"]["option"]
            row = next((r for r in st["truth"] if r["room"] == f["room"]), None)
            if cat not in cats or opt not in cats[cat]:
                problem(f"{where}: points to '{cat}: {opt}', not an option of night {f['night']}'s Statement")
            elif row and row["answers"].get(cat) == opt:
                problem(f"{where}: points to the true answer; a false sign must contradict the truth table")
    excused = {(x["night"], x["room"]) for x in fs["none"]}
    for n in fs["nights"]:
        for room in ROOMS:
            if (n, room) not in covered and (n, room) not in excused:
                problem(f"beats.json false signs: none for {room} on night {n}")
            if (n, room) in covered and (n, room) in excused:
                problem(f"beats.json false signs: {room} on night {n} is both staged and excused")

    # ---------------- truth.json: the Mosaic
    mo = truth["mosaic"]
    mosaic_nights = sorted(int(k) for k in mo["lengths"])
    for k, sid in mo["scenes"].items():
        scene_ok(sid, int(k), "1d", "game", "mosaic", f"truth.json mosaic night {k}")
    if sorted(int(k) for k in mo["scenes"]) != mosaic_nights:
        problem("truth.json mosaic: scenes and lengths must cover the same nights")
    types = {t["id"] for t in mo["link_types"]}
    pins = {}
    for p in mo["pins"]:
        if p["id"] in pins:
            problem(f"truth.json mosaic pin '{p['id']}' twice")
        pins[p["id"]] = p
    guests = sorted(p["id"] for p in pins.values() if p["kind"] == "guest")
    if guests != ROOMS:
        problem(f"truth.json mosaic: guest pins must be the six rooms, got {guests}")
    link_ids = {lk["id"] for lk in mo["links"]}
    for p in pins.values():
        ap = p["appears"]
        for opt in ap.get("any", [ap]):
            if "link" in opt and opt["link"] not in link_ids:
                problem(f"truth.json mosaic pin '{p['id']}': appears with link '{opt['link']}', which is not a true link")
            if "clue" in opt:
                ref_night(opt["clue"], f"truth.json mosaic pin '{p['id']}'")
            if "card" in opt:
                ref_night(opt["card"], f"truth.json mosaic pin '{p['id']}'")
            if "flag" in opt:
                flag_ok(opt["flag"], f"truth.json mosaic pin '{p['id']}'", "bool")
    pairs = set()
    for lk in mo["links"]:
        where = f"truth.json mosaic link {lk['id']}"
        ends = [lk["from"]] + (lk["to"] if isinstance(lk["to"], list) else [lk["to"]])
        for end in ends:
            if end not in pins:
                problem(f"{where}: '{end}' is not a pin")
        pair = (lk["from"], json.dumps(lk["to"]))
        if pair in pairs:
            problem(f"{where}: the same pins are linked twice")
        pairs.add(pair)
        if lk["type"] not in types:
            problem(f"{where}: type '{lk['type']}' is not a thread")
        if lk["earliest_night"] not in mosaic_nights:
            problem(f"{where}: night {lk['earliest_night']} has no Mosaic")
        refs_ok(lk["evidence"], lk["earliest_night"], where)
        eff = lk["effect"]
        if "sets" in eff:
            flag_ok(eff["sets"], where, "bool")
        if "adds_pin" in eff and eff["adds_pin"] not in pins:
            problem(f"{where}: adds pin '{eff['adds_pin']}', which is not a pin")
        if "rings" in eff and "room" in eff["rings"]:
            if eff["rings"]["room"] not in ROOMS or eff["rings"]["night"] not in nights:
                problem(f"{where}: rings a room or night that does not exist")
            elif eff["rings"]["night"] <= lk["earliest_night"]:
                problem(f"{where}: rings night {eff['rings']['night']}, which is over by the morning the link can be made")
        if "account_clue" in eff and eff["account_clue"] not in ROOMS:
            problem(f"{where}: account_clue must name a room")
        tw = lk.get("true_when")
        if tw:
            for opt in tw.get("any_of", []):
                if "flag" in opt:
                    flag_ok(opt["flag"], where, "bool")
                if "card" in opt:
                    ref_night(opt["card"], where)
                for room, refs in opt.get("booker_names", {}).items():
                    if room not in ROOMS:
                        problem(f"{where}: booker name for '{room}', which is not a room")
                    refs_ok(refs, lk["earliest_night"], f"{where} booker {room}")
                if opt.get("booker_names_min", 0) > len(opt.get("booker_names", {})):
                    problem(f"{where}: asks for more booker names than there are")
    if len(mo["links"]) != MOSAIC_TRUE_LINKS:
        problem(f"truth.json mosaic: {len(mo['links'])} true links; DESIGN.md has {MOSAIC_TRUE_LINKS}")

    if not problems:
        per_night = {n: sum(1 for bt in b["beats"] if bt["night"] == n) for n in sorted(nights)}
        print("ok   behind-the-peephole: beats " + ", ".join(f"n{n} {c}" for n, c in per_night.items())
              + f" ({sum(per_night.values())}); false signs {len(fs['substitutions'])}; "
              f"Statement rows {rows_total}; Account answers {account_total}; "
              f"Mosaic links {len(mo['links'])}; deals {len(deals)}")
    return report()


def report():
    for p in problems:
        print(p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

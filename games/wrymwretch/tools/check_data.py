#!/usr/bin/env python3
"""Check WrymWretch's extra data files (DESIGN.md section 18).

Each extra file in data/ is checked against its schema in data/schemas/ (required keys, types,
enums, ranges), against the other extra files, and against the four shared files: every scene,
flag, chapter, pair, creature and ability it names must exist, every flag it writes must be in that
scene's writes, and its counts and thresholds must match DESIGN.md and endings.json.

Stdlib only. Run from the repo root: python games/wrymwretch/tools/check_data.py
Exits 0 when everything passes, 1 when anything fails.
"""
import itertools
import json
import re
import sys
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent
DATA = GAME / "data"
SCHEMAS = DATA / "schemas"
EXTRA = ["bestiary", "abilities", "six_realms", "star_chart", "glyph_pages", "heartstone"]
REALMS = ["west", "north", "south", "east", "below", "above"]
TRIBE = {"west": "wood", "north": "sky", "south": "earth", "east": "water", "below": "dark", "above": "celestial"}

# The Codex's bestiary line, verbatim (05_Worldbuilding/03_World_Codex_of_Wyrmreach.md, line 65).
CODEX_LINE_65 = ("Forest: Grove Stags, Whisperfoxes, Rootbound Golems Sky: Stormriders, Cloud Serpents, Star Moths "
                 "Earth: Crystal Crawlers, Fossil Wurms, Stoneback Behemoths Water: Tide Serpents, Moonfish, Kelprunners "
                 "Dark: Shadehounds, Nightmares, Obsidian Spiders Celestial: Starborn Owls, Luminae, Astral Wyrmlings")
CODEX_GROUPS = ["Forest", "Sky", "Earth", "Water", "Dark", "Celestial"]

errors = []


def err(msg):
    errors.append(msg)


# ------------------------------------------------------------------ a small JSON Schema subset
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
        node = root
        for part in ref.lstrip("#/").split("/"):
            node = node[part]
        validate(value, node, root, where)
    if "type" in schema:
        kinds = schema["type"] if isinstance(schema["type"], list) else [schema["type"]]
        if not any(TYPES[k](value) for k in kinds):
            err(f"{where}: expected {' or '.join(kinds)}, got {type(value).__name__}")
            return
    if "const" in schema and value != schema["const"]:
        err(f"{where}: must be {schema['const']!r}")
    if "enum" in schema and value not in schema["enum"]:
        err(f"{where}: {value!r} is not one of {schema['enum']}")
    if TYPES["number"](value):
        if "minimum" in schema and value < schema["minimum"]:
            err(f"{where}: {value} is below {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            err(f"{where}: {value} is above {schema['maximum']}")
        if "exclusiveMinimum" in schema and value <= schema["exclusiveMinimum"]:
            err(f"{where}: {value} must be above {schema['exclusiveMinimum']}")
    if isinstance(value, str) and "pattern" in schema and not re.search(schema["pattern"], value):
        err(f"{where}: {value!r} does not match {schema['pattern']}")
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                err(f"{where}: missing '{key}'")
        for key, sub in schema.get("properties", {}).items():
            if key in value:
                validate(value[key], sub, root, f"{where}.{key}")
    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            err(f"{where}: {len(value)} items; needs at least {schema['minItems']}")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            err(f"{where}: {len(value)} items; at most {schema['maxItems']}")
        if "items" in schema:
            for i, item in enumerate(value):
                validate(item, schema["items"], root, f"{where}[{i}]")


def load(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        err(f"missing {path.relative_to(GAME)}")
    except json.JSONDecodeError as exc:
        err(f"{path.relative_to(GAME)}: not valid JSON ({exc})")
    return None


# ------------------------------------------------------------------ geometry for Star Chart rules
def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def segments_cross(p1, p2, p3, p4):
    """Proper crossing; segments that share an endpoint do not count."""
    if {p1, p2} & {p3, p4}:
        return False
    d1, d2, d3, d4 = cross(p3, p4, p1), cross(p3, p4, p2), cross(p1, p2, p3), cross(p1, p2, p4)
    return d1 * d2 < 0 and d3 * d4 < 0


def step_ok(a, b, direction):
    dx, dy = b[0] - a[0], b[1] - a[1]
    want = {"up": (None, 1), "down": (None, -1), "left": (-1, None), "right": (1, None),
            "up_left": (-1, 1), "up_right": (1, 1), "down_left": (-1, -1), "down_right": (1, -1)}[direction]
    ok = True
    if want[0] is not None:
        ok &= dx * want[0] > 0
    if want[1] is not None:
        ok &= dy * want[1] > 0
    return ok


def edge_set(lines):
    return {frozenset(line) for line in lines}


def check_rule(rule, con, pos, edges, where):
    t = rule["type"]
    deg = {s["id"]: 0 for s in con["stars"]}
    for e in edges:
        for s in e:
            deg[s] = deg.get(s, 0) + 1
    ids = set(deg)
    star_ids = [r for r in (rule.get("stars", []) + [rule.get("a"), rule.get("b")]) if r]
    star_ids += [s for line in rule.get("lines", []) for s in line]
    if rule.get("star") and rule["star"] != "brightest":
        star_ids.append(rule["star"])
    for s in star_ids:
        if s not in ids:
            err(f"{where}: rule names star '{s}', not in {con['id']}")
            return
    if t == "chain":
        st = rule["stars"]
        for a, b in zip(st, st[1:]):
            if frozenset((a, b)) not in edges:
                err(f"{where}: chain {a}-{b} is not a line of the solution")
            if "direction" in rule and not step_ok(pos[a], pos[b], rule["direction"]):
                err(f"{where}: chain {a}->{b} does not run {rule['direction']}")
    elif t == "cycle":
        st = set(rule["stars"])
        inner = [e for e in edges if e <= st]
        if any(sum(1 for e in inner if s in e) != 2 for s in st) or len(inner) != len(st):
            err(f"{where}: stars {sorted(st)} do not form one ring in the solution")
        else:
            seen, stack = set(), [next(iter(st))]
            while stack:
                s = stack.pop()
                if s not in seen:
                    seen.add(s)
                    stack += [x for e in inner if s in e for x in e]
            if seen != st:
                err(f"{where}: stars {sorted(st)} form more than one ring")
    elif t == "degree":
        star = rule["star"]
        if star == "brightest":
            mags = sorted(con["stars"], key=lambda s: s["mag"])
            if len(mags) > 1 and mags[0]["mag"] == mags[1]["mag"]:
                err(f"{where}: 'brightest' is ambiguous in {con['id']}")
            star = mags[0]["id"]
        if deg[star] != rule["value"]:
            err(f"{where}: {star} has {deg[star]} lines, fragment says {rule['value']}")
    elif t == "edge":
        if frozenset((rule["a"], rule["b"])) not in edges:
            err(f"{where}: {rule['a']}-{rule['b']} is not a line of the solution")
    elif t == "edges":
        for line in rule["lines"]:
            if frozenset(line) not in edges:
                err(f"{where}: {line} is not a line of the solution")
    elif t == "line_count":
        if len(edges) != rule["value"]:
            err(f"{where}: solution has {len(edges)} lines, fragment says {rule['value']}")
    elif t == "no_crossing":
        el = [tuple(e) for e in edges]
        for e1, e2 in itertools.combinations(el, 2):
            if segments_cross(pos[e1[0]], pos[e1[1]], pos[e2[0]], pos[e2[1]]):
                err(f"{where}: lines {sorted(e1)} and {sorted(e2)} cross")


# ------------------------------------------------------------------ Heartstone solver
def solvable(pitches, chord, fuse):
    def go(i, used):
        if i == len(chord):
            return True
        for a in range(len(pitches)):
            if a in used:
                continue
            if pitches[a] == chord[i] and go(i + 1, used | {a}):
                return True
            if fuse:
                for b in range(a + 1, len(pitches)):
                    if b not in used and (pitches[a] + pitches[b]) % 12 == chord[i] and go(i + 1, used | {a, b}):
                        return True
        return False
    return go(0, frozenset())


def main():
    game = load(DATA / "game.json")
    scenes_doc = load(DATA / "scenes.json")
    flags_doc = load(DATA / "flags.json")
    endings_doc = load(DATA / "endings.json")
    files = {}
    for name in EXTRA:
        doc, schema = load(DATA / f"{name}.json"), load(SCHEMAS / f"{name}.schema.json")
        if doc is not None and schema is not None:
            before = len(errors)
            validate(doc, schema, schema, f"{name}.json")
            if len(errors) == before:
                files[name] = doc
    if errors or None in (game, scenes_doc, flags_doc, endings_doc):
        return
    chapters = {c["id"] for c in game["chapters"]}
    scenes = {s["id"]: s for s in scenes_doc["scenes"]}
    flags = {f["name"]: f for f in flags_doc["state"]}

    def scene(sid, where, layer=None, game_id=None):
        s = scenes.get(sid)
        if s is None:
            err(f"{where}: '{sid}' is not a scene id")
            return None
        if layer and s["layer"] != layer:
            err(f"{where}: '{sid}' is {s['layer']}, expected {layer}")
        if game_id and s.get("game") != game_id:
            err(f"{where}: '{sid}' is not a {game_id} page")
        return s

    def flag(name, where, ftype=None):
        f = flags.get(name)
        if f is None:
            err(f"{where}: '{name}' is not declared in flags.json")
        elif ftype and f["type"] != ftype:
            err(f"{where}: '{name}' is a {f['type']}, expected {ftype}")
        return f

    def writes(sid, names, where):
        s = scenes.get(sid)
        if s is None:
            return
        for n in names:
            flag(n, where)
            if n not in s.get("writes", []):
                err(f"{where}: changes '{n}' but scenes.json does not list it in {sid}'s writes")

    def pages_match(name, game_id, pages):
        want = {s for s, v in scenes.items() if v.get("game") == game_id}
        got = [p["scene"] for p in pages]
        if sorted(got) != sorted(want):
            err(f"{name}.json: pages {sorted(got)} do not match the {game_id} scenes {sorted(want)}")
        for p in pages:
            scene(p["scene"], f"{name}.json page {p['scene']}", "1d", game_id)

    for r in REALMS:
        flag(f"memory.{r}", "realms", "meter")
        flag(f"trust.{TRIBE[r]}", "tribes", "bool")

    # ---------------------------------------------------------- abilities.json
    ab = files.get("abilities")
    ability_ids, dragons = set(), {}
    if ab:
        keeper = [v for v in flags.get("keeper_pair", {}).get("values", []) if v != "none"]
        pair_ids = [p["id"] for p in ab["pairs"]]
        if sorted(pair_ids) != sorted(keeper):
            err(f"abilities.json: pairs {pair_ids} do not match keeper_pair values {keeper}")
        if sorted(p["realm"] for p in ab["pairs"]) != sorted(REALMS):
            err("abilities.json: the six pairs must cover the six realms once each")
        by_id = {}
        for a in ab["abilities"]:
            if a["id"] in by_id:
                err(f"abilities.json: ability '{a['id']}' twice")
            by_id[a["id"]] = a
            if a["actions"] != (2 if a["slot"] == "joined" else 1):
                err(f"abilities.json {a['id']}: a {a['slot']} action takes {2 if a['slot'] == 'joined' else 1} actions")
        for p in ab["pairs"]:
            where = f"abilities.json pair {p['id']}"
            dragons[p["dragon"]] = p
            if p["tribe"] != TRIBE[p["realm"]]:
                err(f"{where}: tribe {p['tribe']} does not belong to realm {p['realm']}")
            flag(p["trust_flag"], where, "bool")
            flag(p["memory_meter"], where, "meter")
            if p["trust_flag"] != f"trust.{p['tribe']}" or p["memory_meter"] != f"memory.{p['realm']}":
                err(f"{where}: trust_flag or memory_meter does not match its tribe and realm")
            for slot, ids in (("elf", p["elf_skills"]), ("dragon", p["dragon_gifts"]), ("joined", [p["joined"]])):
                for i in ids:
                    a = by_id.get(i)
                    if a is None:
                        err(f"{where}: ability '{i}' is not defined")
                    elif a["pair"] != p["id"] or a["slot"] != slot:
                        err(f"{where}: ability '{i}' is listed as {slot} but defined as {a['pair']} {a['slot']}")
        for a in ab["abilities"]:
            if a["pair"] not in pair_ids:
                err(f"abilities.json {a['id']}: pair '{a['pair']}' is not a pair")
        ability_ids = set(by_id)
        rule = ab["concord_rule"]
        if rule["bond_min"] > ab["bond"]["max"] or rule["bond_cost"] > rule["bond_min"]:
            err("abilities.json: Concord bond cost exceeds what a pair can hold")
        seen = set()
        for c in ab["concords"]:
            key = frozenset(c["dragons"])
            if len(key) != 2:
                err(f"abilities.json concord {c['id']}: needs two different dragons")
            for d in c["dragons"]:
                if d not in dragons:
                    err(f"abilities.json concord {c['id']}: '{d}' is not a pair's dragon")
            if key in seen:
                err(f"abilities.json concord {c['id']}: that pair of dragons already has a Concord")
            seen.add(key)
            if c["id"] in ability_ids:
                err(f"abilities.json concord {c['id']}: id clashes with an ability")
        if len(seen) != 15 or seen != {frozenset(x) for x in itertools.combinations(dragons, 2)}:
            err("abilities.json: there must be one Concord for each of the 15 pairs of dragons")
        ability_ids |= {c["id"] for c in ab["concords"]}
        for cmd in ("remind", "recall", "burn", "guard", "swap"):
            if cmd not in {c["id"] for c in ab["commands"]}:
                err(f"abilities.json: command '{cmd}' missing")
        for st in ("unnamed", "hidden", "shielded", "rooted", "slowed", "marked"):
            if st not in {s["id"] for s in ab["statuses"]}:
                err(f"abilities.json: status '{st}' missing")

    # ---------------------------------------------------------- bestiary.json
    be = files.get("bestiary")
    if be:
        groups = re.split(r"\s*(" + "|".join(CODEX_GROUPS) + r"):\s*", CODEX_LINE_65)[1:]
        codex = {groups[i]: [n.strip() for n in groups[i + 1].split(",")] for i in range(0, len(groups), 2)}
        vault = GAME.parents[2] / "Pipelines-Plugin" / "creative-writing" / "vault" / be["codex_source"]
        if vault.is_file():
            lines = vault.read_text(encoding="utf-8").splitlines()
            if len(lines) < be["codex_line"] or lines[be["codex_line"] - 1].strip() != CODEX_LINE_65:
                err(f"bestiary.json: Codex line {be['codex_line']} no longer matches the verbatim copy in check_data.py")
        if be["realm_of_group"] != {g: r for g, r in zip(CODEX_GROUPS, REALMS)}:
            err("bestiary.json: realm_of_group must map Forest..Celestial to west..above")
        named = []
        battle_scenes = {b["scene"] for b in be["battles"]}
        for c in be["creatures"]:
            where = f"bestiary.json {c['id']}"
            named.append((c["codex_group"], c["codex_name"]))
            if c["codex_name"] not in codex.get(c["codex_group"], []):
                err(f"{where}: '{c['codex_name']}' is not spelled as the Codex lists it under {c['codex_group']}")
            if be["realm_of_group"].get(c["codex_group"]) != c["realm"]:
                err(f"{where}: realm {c['realm']} does not match Codex group {c['codex_group']}")
            if c["codex_name"] not in (c["name"], c["name"] + "s", c["name"] + "es"):
                err(f"{where}: name '{c['name']}' is not the Codex's '{c['codex_name']}'")
            scene(c["first_met"], f"{where} first_met", "3d")
            for s in c["seen_in"]:
                scene(s, f"{where} seen_in", "3d")
            for s in c["battles"]:
                if s not in battle_scenes:
                    err(f"{where}: battle '{s}' is not one of the eleven battles")
            for w in c["weakness"]["weak_to"]:
                if ab and w not in ability_ids:
                    err(f"{where}: weak_to '{w}' is not an ability or Concord")
        want = [(g, n) for g in CODEX_GROUPS for n in codex[g]]
        if named != want:
            err(f"bestiary.json: creatures must be the Codex's eighteen in Codex order; got {[n for _, n in named]}")
        ids = [c["id"] for c in be["creatures"]] + [f["id"] for f in be["other_foes"]]
        if len(ids) != len(set(ids)):
            err("bestiary.json: duplicate creature or foe id")
        order = list(scenes)
        for b in be["battles"]:
            where = f"bestiary.json battle {b['scene']}"
            scene(b["scene"], where, "3d")
            for entry in b["roster"]:
                if entry["foe"] not in ids:
                    err(f"{where}: '{entry['foe']}' is not a creature or foe")
                c = next((x for x in be["creatures"] if x["id"] == entry["foe"]), None)
                if c and b["scene"] not in c["battles"]:
                    err(f"{where}: {c['id']} is on the roster but its page does not list this battle")
                if c and b["scene"] in order and c["first_met"] in order and order.index(b["scene"]) < order.index(c["first_met"]):
                    err(f"{where}: {c['id']} is fought before it is first met")
        for c in be["creatures"]:
            for s in c["battles"]:
                b = next((x for x in be["battles"] if x["scene"] == s), None)
                if b and c["id"] not in {e["foe"] for e in b["roster"]}:
                    err(f"bestiary.json {c['id']}: lists battle {s} but is not on its roster")
        if sum(1 for b in be["battles"] if b["kind"] == "prologue") != 6:
            err("bestiary.json: there must be six prologue battles")

    # ---------------------------------------------------------- six_realms.json
    sr = files.get("six_realms")
    if sr:
        pages_match("six_realms", "six_realms", sr["matches"])
        hexes = {h["id"]: h for h in sr["board"]["hexes"]}
        coords = {(h["q"], h["r"]) for h in sr["board"]["hexes"]}
        want = {(q, r) for q in range(-2, 3) for r in range(-2, 3) if abs(q + r) <= 2}
        if coords != want or len(hexes) != 19:
            err("six_realms.json: hexes must be the 19 hexes of a radius-2 board")
        for h in sr["board"]["hexes"]:
            ring = max(abs(h["q"]), abs(h["r"]), abs(h["q"] + h["r"]))
            if ring != h["ring"]:
                err(f"six_realms.json hex {h['id']}: ring {h['ring']} but sits on ring {ring}")
            if (h["kind"] == "centre") != (ring == 0) or (h["kind"] == "threshold") != (ring == 1):
                err(f"six_realms.json hex {h['id']}: kind {h['kind']} does not fit ring {ring}")
        for kind, per in (("threshold", 1), ("home", 2)):
            for r in REALMS:
                n = sum(1 for h in hexes.values() if h["kind"] == kind and h["realm"] == r)
                if n != per:
                    err(f"six_realms.json: realm {r} has {n} {kind} hexes; needs {per}")
        pieces = {p["tribe"]: p for p in sr["pieces"]}
        for p in sr["pieces"]:
            if TRIBE.get(p["realm"]) != p["tribe"]:
                err(f"six_realms.json piece {p['tribe']}: realm {p['realm']} is not its realm")
        n = sr["rules"]["pieces_per_side"]
        for side in ("player_start", "elder_start"):
            st = sr["board"][side]
            if len(st) != n or any(hexes.get(h, {}).get("kind") != "home" for h in st):
                err(f"six_realms.json: {side} must be {n} home hexes")
        if set(sr["board"]["player_start"]) & set(sr["board"]["elder_start"]):
            err("six_realms.json: the two sides start on the same hex")
        if sr["rules"]["round_limit"] != 16 or sr["rules"]["tide_every_rounds"] != 3:
            err("six_realms.json: DESIGN.md sets 16 rounds and a tide every third round")
        for c in sr["win_rewards"]["counters"]:
            flag(c, "six_realms.json win_rewards", "counter")
        watches = flags.get("moot_watches_left", {}).get("default")
        moot_activities = [s for s, v in scenes.items() if v["chapter"] == "cv_moot" and v["layer"] == "1d"]
        if watches is not None and not (watches < len(moot_activities)):
            err("six_realms.json: the Moot must offer more activities than watches")
        tribes_seen = set()
        for m in sr["matches"]:
            where = f"six_realms.json match {m['scene']}"
            if m["chapter"] != scenes.get(m["scene"], {}).get("chapter") or m["chapter"] not in chapters:
                err(f"{where}: chapter {m['chapter']} does not match scenes.json")
            if m["realm"] != [k for k, v in TRIBE.items() if v == m["tribe"]][0] or m["trust_flag"] != f"trust.{m['tribe']}":
                err(f"{where}: realm or trust flag does not match tribe {m['tribe']}")
            if m["tribe"] in tribes_seen:
                err(f"{where}: tribe {m['tribe']} has two matches")
            tribes_seen.add(m["tribe"])
            if m["tribe"] not in m["elder_pieces"]:
                err(f"{where}: the elder must field its own tribe's piece")
            for t in m["elder_pieces"] + (m["player_pieces"] if isinstance(m["player_pieces"], list) else []):
                if t not in pieces:
                    err(f"{where}: '{t}' is not a piece")
            if len(set(m["elder_pieces"])) != n:
                err(f"{where}: the elder needs {n} different pieces")
            if isinstance(m["player_pieces"], str) and m["player_pieces"] != "choose_3_from_party":
                err(f"{where}: player_pieces must be a list or choose_3_from_party")
            if isinstance(m["player_pieces"], list) and len(set(m["player_pieces"])) != n:
                err(f"{where}: the player needs {n} different pieces")
            hr = m["house_rule"]
            if hr and "stones" in hr:
                for h in hr["stones"]:
                    if h not in hexes or h in sr["board"]["player_start"] + sr["board"]["elder_start"]:
                        err(f"{where}: stone hex '{h}' is not a free hex")
            is_moot = m["chapter"] == "cv_moot"
            if m["watch_cost"] != (1 if is_moot else 0):
                err(f"{where}: a Moot match costs one watch, the Syndicate match none")
            if (m["ai"]["depth"], m["ai"]["deliberate_errors"]) != ((3, 0) if is_moot else (2, 1)):
                err(f"{where}: DESIGN.md sets depth 3 at the Moot, depth 2 with one deliberate error at the Syndicate")
            writes(m["scene"], [m["trust_flag"], f"memory.{m['realm']}", "echoes"] + sr["win_rewards"]["counters"], where)

    # ---------------------------------------------------------- star_chart.json
    sc = files.get("star_chart")
    fragments_needed = None
    for e in endings_doc["endings"]:
        for sub in (e["when"].get("all", []) if isinstance(e["when"], dict) else []):
            if sub.get("is") == "izladar_fragments" and "gte" in sub:
                fragments_needed = sub["gte"]
    if sc:
        pages_match("star_chart", "star_chart", sc["pages"])
        names = set()
        for p in sc["pages"]:
            where = f"star_chart.json {p['scene']}"
            allstars = [s for c in p["constellations"] for s in c["stars"]] + p["other_stars"]
            ids = [s["id"] for s in allstars]
            if len(ids) != len(set(ids)):
                err(f"{where}: duplicate star ids")
            if not 20 <= len(allstars) <= 40:
                err(f"{where}: {len(allstars)} stars; DESIGN.md says 20 to 40")
            pos = {s["id"]: (s["x"], s["y"]) for s in allstars}
            if len(set(pos.values())) != len(pos):
                err(f"{where}: two stars share a position")
            false = {s["id"] for s in allstars if s.get("false")}
            if len(false) != p["false_stars"]:
                err(f"{where}: {len(false)} false stars, page says {p['false_stars']}")
            lo, hi = p["stars_per_constellation"]
            flo, fhi = p["fragments_per_constellation"]
            realms_written = set()
            for c in p["constellations"]:
                cw = f"{where} {c['id']}"
                names.add(c["id"])
                realms_written.add(f"memory.{c['realm']}")
                cids = {s["id"] for s in c["stars"]}
                if not lo <= len(cids) <= hi:
                    err(f"{cw}: {len(cids)} stars, page allows {lo}-{hi}")
                if not flo <= len(c["fragments"]) <= fhi:
                    err(f"{cw}: {len(c['fragments'])} fragments, page allows {flo}-{fhi}")
                edges = edge_set(c["lines"])
                if len(edges) != len(c["lines"]):
                    err(f"{cw}: a line is drawn twice")
                for e in edges:
                    if len(e) != 2 or not e <= cids:
                        err(f"{cw}: line {sorted(e)} must join two of its own stars")
                    if e & false:
                        err(f"{cw}: line {sorted(e)} touches a false star")
                if {s for e in edges for s in e} != cids:
                    err(f"{cw}: every star must hold a line")
                if "missing_star" in c and c["missing_star"] not in cids:
                    err(f"{cw}: missing star '{c['missing_star']}' is not one of its stars")
                for i, f in enumerate(c["fragments"]):
                    for rule in f["rules"]:
                        check_rule(rule, c, pos, edges, f"{cw} fragment {i + 1}")
                if p.get("full_draw_min_fragments"):
                    k = p["full_draw_min_fragments"]
                    covers = [edge_set(l for r in f["rules"] if r["type"] == "edges" for l in r["lines"]) for f in c["fragments"]]
                    for combo in itertools.combinations(range(len(covers)), k):
                        if set().union(*(covers[j] for j in combo)) != edges:
                            err(f"{cw}: fragments {[j + 1 for j in combo]} leave a line undetermined; any {k} must fix every line")
                            break
                    if fragments_needed is not None and len(c["fragments"]) != fragments_needed:
                        err(f"{cw}: {len(c['fragments'])} fragments, but endings.json needs {fragments_needed}")
            sig = p.get("sigil")
            if sig:
                for line in sig["lines"]:
                    if not set(line) <= set(pos) or set(line) & false:
                        err(f"{where}: Sigil line {line} must join real stars on this page")
                if sig.get("remove_first"):
                    sol = set().union(*(edge_set(c["lines"]) for c in p["constellations"]))
                    if edge_set(sig["lines"]) & sol:
                        err(f"{where}: a Sigil line is also a line of the solution")
            on = dict(p.get("on_complete", {}))
            out = list(on.get("flags", []))
            if on.get("izladar_fragments") or p.get("on_constellation"):
                out.append("izladar_fragments")
            writes(p["scene"], out + sorted(realms_written) + ["memory.above", "stars_redrawn"], where)
        tribe_cons = {"stag", "gale_harp", "delvers_lamp", "moons_tear", "eclipse", "first_light"}
        if not tribe_cons | {"scholars_lamp"} <= names:
            err("star_chart.json: the six tribe constellations and the Scholar's Lamp must all be drawn somewhere")
        for src in sc["izladar_fragment_sources"]:
            scene(src["scene"], f"star_chart.json fragment source {src['id']}")
            if src["scene"] in scenes and "izladar_fragments" not in scenes[src["scene"]].get("writes", []):
                err(f"star_chart.json fragment source {src['id']}: {src['scene']} does not write izladar_fragments")
        srcs = {s["scene"] for s in sc["izladar_fragment_sources"]}
        writers = {s for s, v in scenes.items() if "izladar_fragments" in v.get("writes", [])} - {"s_moot_camp"}
        if not writers <= srcs:
            err(f"star_chart.json: scenes {sorted(writers - srcs)} write izladar_fragments but are not listed as sources")
        if len(sc["izladar_fragment_sources"]) != 9:
            err("star_chart.json: DESIGN.md counts 9 fragment sources")
        if fragments_needed is not None and len(sc["izladar_fragment_sources"]) < fragments_needed:
            err(f"star_chart.json: only {len(sc['izladar_fragment_sources'])} fragment sources; endings need {fragments_needed}")
        flag("izladar_fragments", "star_chart.json", "counter")

    # ---------------------------------------------------------- glyph_pages.json
    gp = files.get("glyph_pages")
    if gp:
        pages_match("glyph_pages", "slipping_glyph", gp["pages"])
        types = gp["part_types"]
        for t in types:
            v = gp["part_variants"].get(t, [])
            if len(v) != 12 or len(set(v)) != 12:
                err(f"glyph_pages.json: part '{t}' needs 12 variants (48 parts in all)")
        runes = {}
        for r in gp["runes"]:
            parts = tuple(r["parts"].get(t) for t in types)
            for t, v in zip(types, parts):
                if v not in gp["part_variants"].get(t, []):
                    err(f"glyph_pages.json {r['id']}: part '{v}' is not a {t} variant")
            runes[r["id"]] = parts
        for (a, pa), (b, pb) in itertools.combinations(runes.items(), 2):
            if sum(x != y for x, y in zip(pa, pb)) < 2:
                err(f"glyph_pages.json: runes {a} and {b} differ in fewer than two parts")
        if len(runes) != 12:
            err("glyph_pages.json: the key holds twelve runes")
        want_rows = {"s_glyph_monolith": 4, "s_glyph_killlist": 5, "s_glyph_seal": 6}
        want_delay = {"s_glyph_monolith": 1.5, "s_glyph_killlist": 1.2, "s_glyph_seal": 1.0}
        by_scene = {p["scene"]: p for p in gp["pages"]}
        for p in gp["pages"]:
            where = f"glyph_pages.json {p['scene']}"
            if len(p["rows"]) != want_rows.get(p["scene"], -1):
                err(f"{where}: {len(p['rows'])} rows; DESIGN.md says {want_rows.get(p['scene'])}")
            if p["slip_delay"] != want_delay.get(p["scene"]):
                err(f"{where}: slip delay {p['slip_delay']}; DESIGN.md says {want_delay.get(p['scene'])}")
            if p["devour_realm"] is not None:
                if p["devour_realm"] not in REALMS:
                    err(f"{where}: devour realm '{p['devour_realm']}' is not a realm")
                writes(p["scene"], [f"memory.{p['devour_realm']}"], where)
            for i, row in enumerate(p["rows"], 1):
                rw = f"{where} row {i}"
                if row["row"] != i:
                    err(f"{rw}: numbered {row['row']}")
                if row.get("unreadable"):
                    if row["answer"] is not None or any(row["stable"]):
                        err(f"{rw}: an unreadable row has no answer and no stable part")
                    continue
                if row["answer"] not in runes:
                    err(f"{rw}: answer '{row['answer']}' is not a rune")
                if sorted(row["stable"]) != sorted(types):
                    err(f"{rw}: the four stable parts must be one of each type")
                pf = row.get("prefilled_from")
                if pf:
                    src = by_scene.get(pf["scene"])
                    srow = src["rows"][pf["row"] - 1] if src and 0 < pf["row"] <= len(src["rows"]) else None
                    if not srow or srow.get("unreadable") or srow["answer"] != row["answer"]:
                        err(f"{rw}: prefilled from {pf['scene']} row {pf['row']}, which does not read the same rune")
            on = p["on_rows_read"]
            if p["scene"] == "s_glyph_monolith":
                if sum(1 for r in p["rows"] if not r.get("unreadable")) != 3 or not p["rows"][-1].get("unreadable"):
                    err(f"{where}: three readable rows and an unreadable fourth")
                writes(p["scene"], [on["counter"], "izladar_fragments"], where)
                flag(on["counter"], where, "counter")
            if p["scene"] == "s_glyph_killlist":
                last = p["rows"][-1]
                if last.get("names", {}).get("kind") != "ilvarra" or last["names"].get("place") != "bone_bridge":
                    err(f"{where}: the last row names Ilvarra and the bone bridge")
                if not all(r.get("names") for r in p["rows"]):
                    err(f"{where}: every row names a witness and a place")
                if "who" not in flags.get("witnesses", {}).get("fields", []):
                    err(f"{where}: the witnesses ledger needs a 'who' field")
                writes(p["scene"], ["witnesses", on["flag"], on["row_5_flag"]], where)
                if not scenes.get(p["scene"], {}).get("world_runs"):
                    err(f"{where}: the kill-list page runs with the world (world_runs)")
            if p["scene"] == "s_glyph_seal":
                if not p["rows"][-1].get("is_the_name"):
                    err(f"{where}: the sixth row is the name")
                mono = by_scene.get("s_glyph_monolith")
                readable = [r for r in (mono["rows"] if mono else []) if not r.get("unreadable")]
                pref = [r for r in p["rows"] if r.get("prefilled_from")]
                if len(pref) != len(readable):
                    err(f"{where}: every readable monolith row must be prefilled here")
                writes(p["scene"], [on["flag"], "izladar_fragments"], where)

    # ---------------------------------------------------------- heartstone.json
    hs = files.get("heartstone")
    if hs:
        pages_match("heartstone", "heartstone", hs["pages"])
        want = {"s_heart_rekindle": (3, 6, False), "s_heart_choir": (4, 6, True), "s_heart_anchor": (5, 7, True)}
        for p in hs["pages"]:
            where = f"heartstone.json {p['scene']}"
            w = want.get(p["scene"])
            if w and (p["slots"], p["strikes"], p["fuse"]) != w:
                err(f"{where}: slots, strikes and fuse must be {w} (DESIGN.md section 11)")
            if p["scene"] == "s_heart_rekindle":
                tray = [s["pitch"] for s in p.get("tray", [])]
                if len(tray) != 8:
                    err(f"{where}: 8 shards; got {len(tray)}")
                memories = [c["memory"] for c in p.get("choices", [])]
                enum = [v for v in flags.get("heartstone_kept", {}).get("values", []) if v != "none"]
                if sorted(memories) != sorted(enum):
                    err(f"{where}: choices {memories} do not match heartstone_kept {enum}")
                for c in p.get("choices", []):
                    if len(c["chord"]) != p["slots"] or not solvable(tray, c["chord"], False):
                        err(f"{where}: the {c['memory']} chord cannot be set from the tray")
                writes(p["scene"], ["heartstone_kept", "memory.south"], where)
            if p["scene"] == "s_heart_choir":
                tray = [s["pitch"] for s in p.get("tray", [])]
                chord = p.get("chord", [])
                if len(tray) != 10:
                    err(f"{where}: 10 shards; got {len(tray)}")
                if len(chord) != p["slots"] or not solvable(tray, chord, True):
                    err(f"{where}: the chord cannot be set from the tray")
                if solvable(tray, chord, False):
                    err(f"{where}: the chord must need a Fuse (Fuse is unlocked here)")
                writes(p["scene"], [p["on_win"]["flag"], f"memory.{p['on_fail']['realm']}"], where)
            if p["scene"] == "s_heart_anchor":
                sets = {s["realm"]: [x["pitch"] for x in s["shards"]] for s in p.get("realm_sets", [])}
                chord, k = p.get("chord", []), p.get("min_sets")
                if sorted(sets) != sorted(REALMS):
                    err(f"{where}: one shard set per realm")
                for s in p.get("realm_sets", []):
                    if s["qualifies_if"]["memory_gte"] != 40 or s["qualifies_if"]["or_trust"] != f"trust.{TRIBE.get(s['realm'])}":
                        err(f"{where}: {s['realm']} qualifies at memory 40 or its tribe's trust")
                if k != 4 or len(chord) != p["slots"]:
                    err(f"{where}: five pitches, and at least four realms' sets")
                elif sorted(sets) == sorted(REALMS):
                    for sub in itertools.combinations(REALMS, k):
                        if not solvable([x for r in sub for x in sets[r]], chord, True):
                            err(f"{where}: sets {sub} qualify but cannot finish the Anchor")
                    for sub in itertools.combinations(REALMS, k - 1):
                        if solvable([x for r in sub for x in sets[r]], chord, True):
                            err(f"{where}: sets {sub} finish the Anchor with fewer than {k} realms")
                writes(p["scene"], [p["on_win"]["flag"]], where)
                for e in endings_doc["endings"]:
                    for sub in (e["when"].get("all", []) if isinstance(e["when"], dict) else []):
                        if sub.get("is") == p["on_win"]["flag"] and sub.get("eq") is not True:
                            err(f"{where}: endings.json reads {p['on_win']['flag']} as {sub}")


if __name__ == "__main__":
    main()
    for e in errors:
        print(e)
    print("ok" if not errors else f"{len(errors)} problem(s)")
    sys.exit(1 if errors else 0)

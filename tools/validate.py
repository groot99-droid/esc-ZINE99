#!/usr/bin/env python3
"""Check every game's data folder against the shared rules in docs/PILLARS.md and docs/TECH.md.

Stdlib only. Usage: python tools/validate.py [slug ...]
Exits 0 when every game passes, 1 when any game fails, 2 on a usage error.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAMES = ROOT / "games"
LAYERS = {"3d", "2d", "1d"}
TRANSITIONS = {"cut", "fade", "push-in", "pull-out", "flatten"}
CMP_KEYS = ("eq", "gte", "gt", "lte", "lt")


def load(path, errors):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"missing {path.name}")
    except json.JSONDecodeError as exc:
        errors.append(f"{path.name}: not valid JSON ({exc})")
    return None


def need(obj, keys, where, errors):
    ok = True
    for key in keys:
        if not isinstance(obj, dict) or key not in obj:
            errors.append(f"{where}: missing '{key}'")
            ok = False
    return ok


def cond_names(cond, where, errors, out):
    """Collect state names a condition reads, and report malformed nodes."""
    if cond is True:
        return
    if not isinstance(cond, dict):
        errors.append(f"{where}: condition must be true or an object, got {cond!r}")
        return
    if "all" in cond or "any" in cond:
        key = "all" if "all" in cond else "any"
        if not isinstance(cond[key], list) or not cond[key]:
            errors.append(f"{where}: '{key}' needs a non-empty list")
            return
        for i, sub in enumerate(cond[key]):
            cond_names(sub, f"{where}.{key}[{i}]", errors, out)
    elif "not" in cond:
        cond_names(cond["not"], f"{where}.not", errors, out)
    elif "is" in cond:
        if not any(k in cond for k in CMP_KEYS):
            errors.append(f"{where}: 'is' needs one of {', '.join(CMP_KEYS)}")
        out.add(("value", cond["is"], where))
    elif "ledger" in cond:
        if "count_gte" not in cond and "count_lte" not in cond:
            errors.append(f"{where}: 'ledger' needs count_gte or count_lte")
        out.add(("ledger", cond["ledger"], where))
    else:
        errors.append(f"{where}: unknown condition {sorted(cond)}")


def check_game(folder):
    errors = []
    data = folder / "data"
    if not (folder / "DESIGN.md").is_file():
        errors.append("missing DESIGN.md")
    game = load(data / "game.json", errors)
    scenes = load(data / "scenes.json", errors)
    flags = load(data / "flags.json", errors)
    endings = load(data / "endings.json", errors)
    if None in (game, scenes, flags, endings):
        return errors

    # game.json
    chapter_ids = set()
    if need(game, ["slug", "title", "sources", "target_minutes", "players", "core_verb", "chapters"], "game.json", errors):
        if game["slug"] != folder.name:
            errors.append(f"game.json: slug '{game['slug']}' does not match folder '{folder.name}'")
        total = 0
        for i, ch in enumerate(game["chapters"]):
            if need(ch, ["id", "title", "minutes", "layers"], f"game.json chapters[{i}]", errors):
                chapter_ids.add(ch["id"])
                total += ch["minutes"]
                bad = set(ch["layers"]) - LAYERS
                if bad:
                    errors.append(f"game.json chapter {ch['id']}: unknown layers {sorted(bad)}")
        tm = game["target_minutes"]
        if not 45 <= total <= 180:
            errors.append(f"game.json: chapters add up to {total} minutes; must be 45 to 180")
        if isinstance(tm, dict) and not (tm.get("min", 0) <= total <= tm.get("max", 0)):
            errors.append(f"game.json: chapters add up to {total}, outside target {tm.get('min')}-{tm.get('max')}")
        if isinstance(tm, dict) and (tm.get("min", 0) < 45 or tm.get("max", 999) > 180):
            errors.append("game.json: target_minutes must lie within 45 to 180")

    # flags.json
    declared = {}
    if need(flags, ["state"], "flags.json", errors):
        for i, f in enumerate(flags["state"]):
            if not need(f, ["name", "type", "default", "description"], f"flags.json state[{i}]", errors):
                continue
            if f["name"] in declared:
                errors.append(f"flags.json: '{f['name']}' declared twice")
            declared[f["name"]] = f["type"]
            if f["type"] == "enum" and not f.get("values"):
                errors.append(f"flags.json: enum '{f['name']}' needs values")
            if f["type"] == "meter" and len(f.get("range", [])) != 2:
                errors.append(f"flags.json: meter '{f['name']}' needs a two-number range")
            if f["type"] == "ledger" and not f.get("fields"):
                errors.append(f"flags.json: ledger '{f['name']}' needs fields")

    # scenes.json
    scene_ids = set()
    if need(scenes, ["modes_2d", "games_1d", "scenes"], "scenes.json", errors):
        mode_ids = {m.get("id") for m in scenes["modes_2d"]}
        game_ids = {g.get("id") for g in scenes["games_1d"]}
        if len(mode_ids) < 2:
            errors.append("scenes.json: needs at least two 2D modes")
        if len(game_ids) < 4:
            errors.append("scenes.json: needs at least four 1D games")
        for m in scenes["modes_2d"]:
            if m.get("movement") not in ("scroll", "tilt"):
                errors.append(f"scenes.json: 2D mode {m.get('id')} movement must be scroll or tilt")
        counts = {"3d": 0, "2d": 0, "1d": 0}
        used_modes, used_games = set(), set()
        for i, s in enumerate(scenes["scenes"]):
            where = f"scenes.json scenes[{i}]"
            if not need(s, ["id", "layer", "name", "chapter"], where, errors):
                continue
            if s["id"] in scene_ids:
                errors.append(f"{where}: duplicate id '{s['id']}'")
            scene_ids.add(s["id"])
            if s["layer"] not in LAYERS:
                errors.append(f"{where}: unknown layer '{s['layer']}'")
                continue
            counts[s["layer"]] += 1
            if chapter_ids and s["chapter"] not in chapter_ids:
                errors.append(f"{where}: chapter '{s['chapter']}' not in game.json")
            if s["layer"] == "2d":
                if s.get("mode") not in mode_ids:
                    errors.append(f"{where}: 2D scene needs a mode from modes_2d")
                used_modes.add(s.get("mode"))
            if s["layer"] == "1d":
                if s.get("game") not in game_ids:
                    errors.append(f"{where}: 1D scene needs a game from games_1d")
                used_games.add(s.get("game"))
            for key in ("enter", "exit"):
                if key in s and s[key] not in TRANSITIONS:
                    errors.append(f"{where}: {key} '{s[key]}' is not a known transition")
            for key in ("reads", "writes"):
                for name in s.get(key, []):
                    if name not in declared:
                        errors.append(f"{where}: {key} '{name}' is not declared in flags.json")
        if counts["3d"] < 4:
            errors.append(f"scenes.json: {counts['3d']} 3D scenes; needs at least four")
        for m in mode_ids - used_modes:
            errors.append(f"scenes.json: 2D mode '{m}' is never used by a scene")
        for g in game_ids - used_games:
            errors.append(f"scenes.json: 1D game '{g}' is never used by a scene")
        for i, s in enumerate(scenes["scenes"]):
            for nxt in s.get("next", []):
                if nxt not in scene_ids:
                    errors.append(f"scenes.json scenes[{i}]: next '{nxt}' is not a scene id")

    # endings.json
    if need(endings, ["endings"], "endings.json", errors):
        ends = endings["endings"]
        if len(ends) < 4:
            errors.append(f"endings.json: {len(ends)} endings; needs at least four")
        written = [e.get("id") for e in ends if e.get("as_written") is True]
        if len(written) > 1:
            errors.append(f"endings.json: more than one as_written ending {written}")
        prios = [e.get("priority") for e in ends]
        if len(set(prios)) != len(prios):
            errors.append("endings.json: priorities must be unique")
        last = max(ends, key=lambda e: e.get("priority", -1)) if ends else None
        if last is not None and last.get("when") is not True:
            errors.append(f"endings.json: last ending by priority ('{last.get('id')}') must have when: true")
        for e in ends:
            where = f"endings.json {e.get('id')}"
            need(e, ["id", "name", "as_written", "priority", "when", "summary"], where, errors)
            names = set()
            cond_names(e.get("when"), where, errors, names)
            for kind, name, at in names:
                if name not in declared:
                    errors.append(f"{at}: '{name}' is not declared in flags.json")
                elif kind == "ledger" and declared[name] != "ledger":
                    errors.append(f"{at}: '{name}' is used as a ledger but declared as {declared[name]}")
                elif kind == "value" and declared[name] == "ledger":
                    errors.append(f"{at}: '{name}' is a ledger; use a ledger condition")
            for sid in e.get("final_scenes", []):
                if sid not in scene_ids:
                    errors.append(f"{where}: final scene '{sid}' is not a scene id")
    return errors


def main(argv):
    if not GAMES.is_dir():
        print("no games/ folder", file=sys.stderr)
        return 2
    folders = sorted(p for p in GAMES.iterdir() if p.is_dir())
    if argv:
        wanted = set(argv)
        unknown = wanted - {p.name for p in folders}
        if unknown:
            print(f"unknown game(s): {', '.join(sorted(unknown))}", file=sys.stderr)
            return 2
        folders = [p for p in folders if p.name in wanted]
    failed = 0
    for folder in folders:
        errors = check_game(folder)
        if errors:
            failed += 1
            print(f"FAIL {folder.name}")
            for err in errors:
                print(f"  - {err}")
        else:
            print(f"ok   {folder.name}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

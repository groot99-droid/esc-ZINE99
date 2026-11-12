#!/usr/bin/env python3
"""Check docs/STORYBOARDS.md against each game's data.

Every numbered panel must name a real scene id whose layer matches the panel's; every ending row
must name a scene; every reference still in games/<slug>/reference/ must appear exactly once, on a
link that resolves. Stdlib only. Exit 0 when clean, 1 when not.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOARDS = ROOT / "docs" / "STORYBOARDS.md"
SECTION = re.compile(r"^## \d+\. .+$", re.M)
SLUG_LINK = re.compile(r"\.\./games/([a-z0-9-]+)/reference/([^)]+)\.jpg")


def rows(section):
    for line in section.splitlines():
        if not line.startswith("| ") or line.startswith("| #") or line.startswith("| ---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        yield cells


def main():
    text = BOARDS.read_text(encoding="utf-8")
    starts = [m.start() for m in SECTION.finditer(text)] + [len(text)]
    problems = []
    seen_games = set()
    for a, b in zip(starts, starts[1:]):
        section = text[a:b]
        title = section.splitlines()[0]
        slugs = set(SLUG_LINK.findall(section))
        slug_names = {s for s, _ in slugs}
        if len(slug_names) != 1:
            problems.append(f"{title}: cannot tell which game this is (reference links name {sorted(slug_names)})")
            continue
        slug = slug_names.pop()
        seen_games.add(slug)
        scenes = json.loads((ROOT / "games" / slug / "data" / "scenes.json").read_text(encoding="utf-8"))
        layer_of = {s["id"]: s["layer"] for s in scenes["scenes"]}
        for cells in rows(section):
            if len(cells) != 7:
                problems.append(f"{slug}: row has {len(cells)} cells, expected 7: {cells[:3]}")
                continue
            num, layer, scene = cells[0], cells[1], cells[2].strip("`")
            if scene not in layer_of:
                problems.append(f"{slug} panel {num}: scene '{scene}' is not in scenes.json")
            elif num != "E" and layer.lower() != layer_of[scene]:
                problems.append(f"{slug} panel {num}: layer {layer} but scene '{scene}' is {layer_of[scene]}")
        stills = sorted(p.stem for p in (ROOT / "games" / slug / "reference").glob("*.jpg"))
        used = [stem for s, stem in SLUG_LINK.findall(section)]
        in_table = [stem for cells in rows(section) if len(cells) == 7
                    for _, stem in SLUG_LINK.findall(cells[6])]
        for stem in stills:
            n = in_table.count(stem)
            if n != 1:
                problems.append(f"{slug}: still '{stem}' is on {n} panels; it must be on exactly one")
        for stem in set(used) - set(stills):
            problems.append(f"{slug}: links to a missing still '{stem}'")
    missing = {p.name for p in (ROOT / "games").iterdir() if p.is_dir()} - seen_games
    for slug in sorted(missing):
        problems.append(f"{slug}: no storyboard section")
    for p in problems:
        print(p)
    print("ok   storyboards" if not problems else f"FAIL storyboards ({len(problems)} problems)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

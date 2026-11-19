#!/usr/bin/env python3
"""Build every gameplay pictograph, and the docs that list them.

    python tools/pictographs/build.py           # draw all games
    python tools/pictographs/build.py man-eater # draw one game
    python tools/pictographs/build.py --check   # draw nothing; check the SVGs and docs are current

Reads `docs/graphic_styles.json` (one graphic style per 2D mode and 1D game, none repeated) and each
game's `games/<slug>/pictographs/make.py`, which registers one drawing function per entry. Writes
`games/<slug>/pictographs/<key>.svg`, section 7 of `docs/COLLECTION.md`, and `docs/PICTOGRAPHS.md`.
Stdlib only. Exit 0 when clean, 1 when not.
"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import core  # noqa: E402

STYLES = ROOT / "docs" / "graphic_styles.json"
COLLECTION = ROOT / "docs" / "COLLECTION.md"
GALLERY = ROOT / "docs" / "PICTOGRAPHS.md"
SECTION = "## 7. Graphic styles: one owner each"
MAX_BYTES = 400_000
FORBIDDEN = re.compile(r"<script|<image|<foreignObject|href\s*=\s*\"(?!#)|url\((?!#)|@import", re.I)
TITLES = {}


def load_styles():
    data = json.loads(STYLES.read_text(encoding="utf-8"))["styles"]
    return data


def game_titles():
    if not TITLES:
        for p in sorted((ROOT / "games").iterdir()):
            g = p / "data" / "game.json"
            if g.is_file():
                TITLES[p.name] = json.loads(g.read_text(encoding="utf-8")).get("title", p.name)
    return TITLES


def load_game(slug):
    mk = ROOT / "games" / slug / "pictographs" / "make.py"
    if not mk.is_file():
        return False
    spec = importlib.util.spec_from_file_location(f"pictographs_{slug.replace('-', '_')}", mk)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return True


def draw(entry) -> str:
    fn = core.REGISTRY[(entry["game"], entry["key"])]
    desc = " ".join((fn.__doc__ or "").split())
    title = f"{entry['name']}: {entry['style']}"
    p = core.Pic(entry["game"], entry["key"], title, desc)
    fn(p)
    return p.svg()


def collection_section(styles) -> str:
    titles = game_titles()
    rows = ["| Game | Layer | Mode or game | Graphic style | What it looks like | Pictograph |",
            "| --- | --- | --- | --- | --- | --- |"]
    for s in styles:
        rows.append(f"| {titles.get(s['game'], s['game'])} | {s['kind'].upper()} | {s['name']} | **{s['style']}** | "
                    f"{s['look']} | [{s['key']}](../games/{s['game']}/pictographs/{s['key']}.svg) |")
    return (f"{SECTION}\n\n"
            "Each 2D mode and 1D game is drawn in its own graphic style, and no style appears twice in the\n"
            "collection. A game keeps one palette and one set of materials across its layers (its DESIGN.md\n"
            "section 15); the style is how that palette is drawn on that one page. Generated from\n"
            "`docs/graphic_styles.json` by `tools/pictographs/build.py`; edit the JSON, not this table.\n\n"
            + "\n".join(rows) + "\n")


def gallery(styles) -> str:
    titles = game_titles()
    out = ["# Gameplay pictographs", "",
           "One procedurally drawn vector pictograph for every 2D mode and 1D game, each in the graphic",
           "style it owns (`docs/COLLECTION.md` section 7). They show how a mode plays, not final art.",
           "Rebuild with `python tools/pictographs/build.py`; each game's drawing code is in",
           "`games/<slug>/pictographs/make.py`, seeded so a rebuild draws the same picture.", ""]
    for slug in dict.fromkeys(s["game"] for s in styles):
        out += [f"## {titles.get(slug, slug)}", ""]
        for s in [x for x in styles if x["game"] == slug]:
            out += [f"### {s['name']} ({s['kind'].upper()}): {s['style']}", "",
                    f"![{s['name']}](../games/{slug}/pictographs/{s['key']}.svg)", ""]
    return "\n".join(out)


def replace_section(text, new) -> str:
    if SECTION in text:
        a = text.index(SECTION)
        m = re.search(r"^## \d+\. ", text[a + len(SECTION):], re.M)
        b = a + len(SECTION) + m.start() if m else len(text)
        return text[:a] + new + ("\n" + text[b:] if m else "")
    return text.rstrip("\n") + "\n\n" + new


def check_svg(path: Path, problems: list[str]):
    raw = path.read_bytes()
    if len(raw) > MAX_BYTES:
        problems.append(f"{path.relative_to(ROOT)}: {len(raw)} bytes, over {MAX_BYTES}")
    s = raw.decode("utf-8")
    if FORBIDDEN.search(s):
        problems.append(f"{path.relative_to(ROOT)}: holds a script, raster or external reference")
    try:
        root = ET.fromstring(s)
    except ET.ParseError as e:
        problems.append(f"{path.relative_to(ROOT)}: not well-formed XML ({e})")
        return
    ns = "{http://www.w3.org/2000/svg}"
    if root.tag != ns + "svg" or root.find(ns + "title") is None or not (root.findtext(ns + "desc") or "").strip():
        problems.append(f"{path.relative_to(ROOT)}: needs an svg root with a title and a non-empty desc")


def main(argv):
    check = "--check" in argv
    only = [a for a in argv if not a.startswith("-")]
    styles = load_styles()
    problems = []
    seen_style, seen_key = {}, set()
    for s in styles:
        st = s["style"].lower()
        if st in seen_style:
            problems.append(f"style '{s['style']}' is used by {seen_style[st]} and {s['game']}/{s['key']}")
        seen_style[st] = f"{s['game']}/{s['key']}"
        if (s["game"], s["key"]) in seen_key:
            problems.append(f"{s['game']}/{s['key']} is listed twice")
        seen_key.add((s["game"], s["key"]))
    # every 2D mode and 1D game in COLLECTION sections 3 and 4 needs a style row
    coll = COLLECTION.read_text(encoding="utf-8")
    names = {(s["game"], s["name"].lower()) for s in styles}
    titles = {v: k for k, v in game_titles().items()}
    short = {"Lira Calyx": "lira-calyx", "Man Eater": "man-eater", "Heartstream": "heartstream"}
    for sec, col in (("## 3.", None), ("## 4.", 1)):
        a = coll.index(sec)
        b = coll.index("\n## ", a + 4)
        for line in coll[a:b].splitlines():
            if not line.startswith("| ") or line.startswith("| Game") or line.startswith("| ---"):
                continue
            cells = [c.strip() for c in line.strip("|").split("|")]
            slug = titles.get(cells[0]) or short.get(cells[0]) or next(
                (v for k, v in titles.items() if cells[0] in k), None)
            mode_names = ([re.match(r"\*\*(.+?)\*\*", c).group(1) for c in cells[1:3]] if col is None
                          else [cells[1]])
            for n in mode_names:
                if (slug, n.lower()) not in names:
                    problems.append(f"COLLECTION lists {cells[0]} / {n} but graphic_styles.json has no style for it")
    slugs = sorted(dict.fromkeys(s["game"] for s in styles))
    if only:
        slugs = [s for s in slugs if s in only]
    for slug in slugs:
        if not load_game(slug):
            problems.append(f"{slug}: no pictographs/make.py")
            continue
        for s in [x for x in styles if x["game"] == slug]:
            out = ROOT / "games" / slug / "pictographs" / f"{s['key']}.svg"
            if (slug, s["key"]) not in core.REGISTRY:
                problems.append(f"{slug}: make.py draws nothing for '{s['key']}'")
                continue
            svg = draw(s)
            if check:
                if not out.is_file() or out.read_text(encoding="utf-8") != svg:
                    problems.append(f"{out.relative_to(ROOT)}: stale or missing; run build.py")
            else:
                out.write_text(svg, encoding="utf-8")
            if out.is_file():
                check_svg(out, problems)
        extra = {k for g, k in core.REGISTRY if g == slug} - {s["key"] for s in styles if s["game"] == slug}
        for k in sorted(extra):
            problems.append(f"{slug}: make.py draws '{k}', which graphic_styles.json does not list")
    new_coll = replace_section(coll, collection_section(styles))
    new_gal = gallery(styles)
    if check:
        if new_coll != coll:
            problems.append("docs/COLLECTION.md section 7 is stale; run build.py")
        if not GALLERY.is_file() or GALLERY.read_text(encoding="utf-8") != new_gal:
            problems.append("docs/PICTOGRAPHS.md is stale; run build.py")
    elif not only:
        COLLECTION.write_text(new_coll, encoding="utf-8")
        GALLERY.write_text(new_gal, encoding="utf-8")
    for p in problems:
        print(p)
    n = sum(1 for s in styles if s["game"] in slugs)
    print(f"ok   pictographs ({n})" if not problems else f"FAIL pictographs ({len(problems)} problems)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

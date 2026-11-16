#!/usr/bin/env python3
"""Build the web site's data and assets from the games.

    python tools/web/build.py

Writes `web/data/catalog.js` (each game's title, length, verb, stills and its 2D modes and 1D games
with their graphic styles and pictographs), and copies each game's reference stills (resized to
1280 px wide) and pictographs into `web/assets/`. web/assets/ and web/data/ are generated and not
versioned. Needs Pillow for the stills.
"""
from __future__ import annotations

import json
import sys
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
WEB = ROOT / "web"


def art_bundle(slug):
    """Write web/assets/art/<slug>.json from games/<slug>/art/ (atomically). Returns its web path or None."""
    man = ROOT / "games" / slug / "art" / "art.json"
    if not man.is_file():
        return None
    adir = WEB / "assets" / "art"
    adir.mkdir(parents=True, exist_ok=True)
    bundle = {}
    for a in json.loads(man.read_text(encoding="utf-8"))["assets"]:
        svg = (man.parent / a["group"] / f"{a['id']}.svg").read_text(encoding="utf-8")
        bundle[a["id"]] = {"g": a["group"], "w": a["w"], "h": a["h"], "t": a["title"], "s": svg}
    tmp = adir / f".{slug}.json.tmp"
    tmp.write_text(json.dumps(bundle, separators=(",", ":")), encoding="utf-8")
    tmp.replace(adir / f"{slug}.json")
    return f"assets/art/{slug}.json"


def endings(slug, art):
    """The game's endings for its menu: name, whether it is the author's, what it costs, and its card."""
    f = ROOT / "games" / slug / "data" / "endings.json"
    if not f.is_file():
        return []
    d = json.loads(f.read_text(encoding="utf-8"))
    by = {}
    man = ROOT / "games" / slug / "keyart" / "keyart.json"
    if man.is_file():
        for a in json.loads(man.read_text(encoding="utf-8"))["images"]:
            if a.get("kind") == "ending":
                by[str(a.get("ending", "")).lower()] = a["id"]
                by[a["id"]] = a["id"]
    out = []
    for e in (d["endings"] if isinstance(d, dict) else d):
        kid = by.get(e["id"].lower()) or by.get(e.get("name", "").lower()) or by.get("ending-" + e["id"].replace("_", "-"))
        out.append({"id": e["id"], "name": e.get("name", e["id"]), "as_written": bool(e.get("as_written")),
                    "summary": e.get("summary", ""), "cost": e.get("cost", ""), "image": art.get(kid, "") if kid else ""})
    return out


RING = ["behind-the-peephole", "endless-temple", "heartstream", "lira-calyx", "lord-of-the-sea", "man-eater",
        "missing-campsites", "people-of-the-bark", "stuffed-ones", "wrymwretch"]   # each hides the one before it


def keyart(slug):
    """Copy the generated key art and ending cards into web/assets/keyart/<slug>/. Returns {id: path}."""
    man = ROOT / "games" / slug / "keyart" / "keyart.json"
    if not man.is_file():
        return {}
    out = WEB / "assets" / "keyart" / slug
    out.mkdir(parents=True, exist_ok=True)
    paths = {}
    for a in json.loads(man.read_text(encoding="utf-8"))["images"]:
        src = man.parent.parent / a["image"]
        if not src.is_file():
            continue
        im = Image.open(src).convert("RGB")
        im.thumbnail((1600, 1600))
        im.save(out / f"{a['id']}.jpg", quality=82, optimize=True)
        paths[a["id"]] = f"assets/keyart/{slug}/{a['id']}.jpg"
    return paths


def threads():
    """web/assets/threads.json: each game's own thread object and the one it hides (docs/DEEP_DIVE.md section 4)."""
    out = {}
    for i, slug in enumerate(RING):
        art = ROOT / "games" / slug / "art"
        man = art / "art.json"
        if not man.is_file():
            continue
        by = {a["id"]: a for a in json.loads(man.read_text(encoding="utf-8"))["assets"]}
        e = {"from": RING[i - 1]}
        for k in ("own", "guest"):
            a = by.get(f"thread-{k}")
            if a:
                e[k] = {"title": a["title"], "svg": (art / a["group"] / f"{a['id']}.svg").read_text(encoding="utf-8")}
        out[slug] = e
    (WEB / "assets").mkdir(parents=True, exist_ok=True)
    (WEB / "assets" / "threads.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--art":
        print(f"ok   web art: {sys.argv[2]} -> {art_bundle(sys.argv[2])}")
        return
    styles = json.loads((ROOT / "docs" / "graphic_styles.json").read_text(encoding="utf-8"))["styles"]
    order = list(dict.fromkeys(s["game"] for s in styles))
    games = []
    for slug in order:
        g = json.loads((ROOT / "games" / slug / "data" / "game.json").read_text(encoding="utf-8"))
        stills = []
        out = WEB / "assets" / "stills" / slug
        out.mkdir(parents=True, exist_ok=True)
        for f in sorted((ROOT / "games" / slug / "reference").glob("*.jpg")):
            im = Image.open(f).convert("RGB")
            im.thumbnail((1280, 720))
            im.save(out / f.name, quality=82, optimize=True)
            stills.append(f"assets/stills/{slug}/{f.name}")
        pdir = WEB / "assets" / "pictographs" / slug
        pdir.mkdir(parents=True, exist_ok=True)
        modes = []
        for s in [x for x in styles if x["game"] == slug]:
            src = ROOT / "games" / slug / "pictographs" / f"{s['key']}.svg"
            shutil.copyfile(src, pdir / src.name)
            modes.append({"key": s["key"], "name": s["name"], "layer": s["kind"], "style": s["style"],
                          "look": s["look"], "pictograph": f"assets/pictographs/{slug}/{s['key']}.svg",
                          "module": f"games/{slug}/{s['key']}.js"})
        art_path = art_bundle(slug)
        ka = keyart(slug)
        games.append({"slug": slug, "art": art_path, "keyart": ka, "endings": endings(slug, ka), "title": g["title"], "minutes": g.get("target_minutes"),
                      "players": g.get("players"), "verb": g.get("core_verb"), "stills": stills,
                      "loading": f"games/{slug}/loading.js", "modes": modes})
    threads()
    (WEB / "data").mkdir(exist_ok=True)
    (WEB / "data" / "catalog.js").write_text(
        "// Generated by tools/web/build.py. Do not edit.\nexport default " + json.dumps({"games": games}, indent=1) + ";\n",
        encoding="utf-8")
    print(f"ok   web: {len(games)} games, {sum(len(g['modes']) for g in games)} modes")


if __name__ == "__main__":
    main()

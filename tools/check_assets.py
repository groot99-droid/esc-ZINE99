#!/usr/bin/env python3
"""Check each game's 3D asset manifest: the Blender scene images and the Meshy object images.

    python tools/check_assets.py            # all games that have games/<slug>/assets/assets.json
    python tools/check_assets.py man-eater  # one game

A manifest lists the game's 3D locations (one establishing image each, the reference for building
the scene in Blender) and its objects (one isolated image each, the input for Meshy image-to-3D).
Every 3D scene in data/scenes.json must be covered by exactly one location; every scene a location
or object names must exist; every image must exist at its path and be the right shape. Stdlib only.
Exit 0 when clean, 1 when not.
"""
from __future__ import annotations

import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ID = re.compile(r"^[a-z0-9][a-z0-9-]*$")
ROLES = {"interact", "hero", "fill"}
URL = re.compile(r"https?://")


def image_size(path: Path):
    """(width, height) of a PNG or JPEG, without third-party libraries."""
    data = path.read_bytes()
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", data[16:24])
    if data[:2] == b"\xff\xd8":
        i = 2
        while i < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">HH", data[i + 5:i + 9])
                return w, h
            seg = struct.unpack(">H", data[i + 2:i + 4])[0]
            i += 2 + seg
    return None


def check(slug: str, problems: list[str]):
    folder = ROOT / "games" / slug
    man = folder / "assets" / "assets.json"
    if not man.is_file():
        problems.append(f"{slug}: no assets/assets.json")
        return
    raw = man.read_text(encoding="utf-8")
    if URL.search(raw):
        problems.append(f"{slug}: assets.json holds a URL; keep job ids, never links")
    m = json.loads(raw)
    scenes = json.loads((folder / "data" / "scenes.json").read_text(encoding="utf-8"))["scenes"]
    layer = {s["id"]: s["layer"] for s in scenes}
    covered: dict[str, str] = {}
    seen = set()
    for kind, key in (("location", "locations"), ("object", "objects")):
        items = m.get(key, [])
        if not items:
            problems.append(f"{slug}: no {key}")
        for it in items:
            iid = it.get("id", "")
            where = f"{slug} {kind} '{iid}'"
            if not ID.match(iid):
                problems.append(f"{where}: id must be lower-case words joined by hyphens")
            if (kind, iid) in seen:
                problems.append(f"{where}: listed twice")
            seen.add((kind, iid))
            for field in ("name", "prompt", "image"):
                if not str(it.get(field, "")).strip():
                    problems.append(f"{where}: missing {field}")
            for sid in it.get("scenes", []):
                if sid not in layer:
                    problems.append(f"{where}: scene '{sid}' is not in scenes.json")
                elif kind == "location":
                    if layer[sid] != "3d":
                        problems.append(f"{where}: scene '{sid}' is {layer[sid]}, not 3d")
                    elif sid in covered:
                        problems.append(f"{where}: scene '{sid}' is already covered by '{covered[sid]}'")
                    else:
                        covered[sid] = iid
            if kind == "location" and not it.get("scenes"):
                problems.append(f"{where}: names no scenes")
            if kind == "object":
                if it.get("role") not in ROLES:
                    problems.append(f"{where}: role must be one of {sorted(ROLES)}")
                size = it.get("size_m")
                if not (isinstance(size, list) and len(size) == 3 and all(isinstance(v, (int, float)) and v > 0 for v in size)):
                    problems.append(f"{where}: size_m must be [width, depth, height] in metres")
            img = folder / str(it.get("image", ""))
            if not img.is_file():
                problems.append(f"{where}: image {it.get('image')} is missing")
                continue
            wh = image_size(img)
            if not wh:
                problems.append(f"{where}: {it.get('image')} is not a PNG or JPEG")
                continue
            w, h = wh
            if kind == "location" and not (1.6 < w / h < 1.9 and w >= 1280):
                problems.append(f"{where}: location image should be 16:9 and at least 1280 wide, is {w}x{h}")
            if kind == "object" and not (abs(w - h) <= 2 and w >= 768):
                problems.append(f"{where}: object image should be square and at least 768 wide, is {w}x{h}")
    object_ids = {it.get("id") for it in m.get("objects", [])}
    placed = set()
    for loc in m.get("locations", []):
        for oid in loc.get("objects", []):
            placed.add(oid)
            if oid not in object_ids:
                problems.append(f"{slug} location '{loc.get('id')}': places object '{oid}', which is not listed")
    for oid in sorted(object_ids - placed):
        problems.append(f"{slug} object '{oid}': no location places it")
    for sid, lay in layer.items():
        if lay == "3d" and sid not in covered:
            problems.append(f"{slug}: 3D scene '{sid}' has no location")
    on_disk = {p.relative_to(folder).as_posix() for p in (folder / "assets").rglob("*")
               if p.suffix.lower() in (".jpg", ".jpeg", ".png")}
    listed = {str(it.get("image")) for k in ("locations", "objects") for it in m.get(k, [])}
    for stray in sorted(on_disk - listed):
        problems.append(f"{slug}: {stray} is on disk but not in assets.json")


def main(argv):
    slugs = argv or sorted(p.parent.parent.name for p in (ROOT / "games").glob("*/assets/assets.json"))
    problems: list[str] = []
    for slug in slugs:
        check(slug, problems)
    for p in problems:
        print(p)
    print(f"ok   assets ({len(slugs)} games)" if not problems else f"FAIL assets ({len(problems)} problems)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

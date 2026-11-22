#!/usr/bin/env python3
"""Contact sheets, owner sheet and ledger from a finished render run.

    python tools/render/finish.py dr-tox-rise <run dir> [--owner <png>]

<run dir> is the driver's output (<location>/<scene>/camera.png, <location>/_overview/overview.png,
<location>/<scene>.json). Writes renders/<game>/<location>.jpg (overview beside its reference image, then the
scene stills, 640x360 tiles, 1280 px wide so a phone reads it) and renders/<game>/ledger.json. The full-size
PNGs stay in the run dir (under build/, never committed). flags.json says what was done about each flagged scene.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
FONTS = ["C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]


def font(n):
    for f in FONTS:
        try:
            return ImageFont.truetype(f, n)
        except OSError:
            pass
    return ImageFont.load_default()


def tile(im, label, w=640, h=360, sub=""):
    t = Image.new("RGB", (w, h + 34), (22, 22, 22))
    t.paste(im.convert("RGB").resize((w, h), Image.LANCZOS), (0, 0))
    d = ImageDraw.Draw(t)
    d.text((8, h + 6), label, fill=(255, 255, 255), font=font(20))
    if sub:
        d.text((w - 8 - d.textlength(sub, font=font(16)), h + 9), sub, fill=(170, 170, 170), font=font(16))
    return t


def main(argv):
    slug, run = argv[0], Path(argv[1])
    owner = argv[argv.index("--owner") + 1] if "--owner" in argv else None
    outdir = ROOT / "renders" / slug
    outdir.mkdir(parents=True, exist_ok=True)
    plans = [e for e in json.loads((ROOT / "docs/blender_plans/plans.json").read_text(encoding="utf-8"))["scenes"]
             if e["game"] == slug]
    flags = json.loads((Path(__file__).parent / "flags.json").read_text(encoding="utf-8"))
    rig = json.loads((Path(__file__).parent / "rig.json").read_text(encoding="utf-8"))
    ledger = {"game": slug, "tiers": {"hero": "2560x1440, 256 samples", "standard": "1920x1080, 128 samples",
                                      "overview": "1920x1080, 128 samples"},
              "renderer": "Cycles (OptiX), OpenImageDenoise, Blender 5.2.1", "scenes": [], "overviews": []}
    locs = []
    for e in plans:
        if e["location"] not in locs:
            locs.append(e["location"])
    owner_rows = []
    for loc in locs:
        tiles = []
        ov = run / loc / "_overview" / "overview.png"
        ref = Image.open(ROOT / "games" / slug / "assets" / "locations" / f"{loc}.jpg")
        tiles.append(tile(Image.open(ov), "overview", sub="1920x1080 / 128 spp"))
        tiles.append(tile(ref, "reference image"))
        owner_rows.append((loc, Image.open(ov), ref))
        for e in [p for p in plans if p["location"] == loc]:
            rec = json.loads((run / loc / f"{e['scene']}.json").read_text(encoding="utf-8"))
            st = {s["still"]: s for s in rec["stills"]}
            cam = st["camera"]
            tiles.append(tile(Image.open(run / cam["file"]), e["scene"],
                              sub=f"{rec['tier']} {cam['resolution'][0]}x{cam['resolution'][1]} / {cam['samples']} spp"))
            ledger["scenes"].append({
                "scene": e["scene"], "location": loc, "tier": rec["tier"],
                "resolution": cam["resolution"], "samples": cam["samples"],
                "stills": [{"still": s["still"], "resolution": s["resolution"], "samples": s["samples"],
                            "render_seconds": s["seconds"]} for s in rec["stills"]],
                "props": [{"id": k, "object": v["object"], "source": v["source"]} for k, v in rec["props"].items()],
                "flagged_in_first_pass": e["flagged_in_first_pass"],
                "geometry_checks": rec["checks"],
                "render_time_overrides": sorted(k for k in rec["overrides"] if rec["overrides"][k]),
                "flag_status": flags.get(e["scene"], {"status": "not flagged"}),
            })
        ledger["overviews"].append({"location": loc, "scene_lighting": rig[loc]["overview_scene"],
                                    "camera": rig[loc]["overview"], "rig": {k: v for k, v in rig[loc].items()
                                                                          if k not in ("overview", "overview_scene")}})
        rows = (len(tiles) + 1) // 2
        sheet = Image.new("RGB", (1280, rows * 394), (22, 22, 22))
        for i, t in enumerate(tiles):
            sheet.paste(t, ((i % 2) * 640, (i // 2) * 394))
        sheet.save(outdir / f"{loc}.jpg", quality=84, optimize=True)
        print("sheet", loc, sheet.size)
    (outdir / "ledger.json").write_text(json.dumps(ledger, indent=1) + "\n", encoding="utf-8")
    if owner:
        W = 1280
        rows = [tile(ov, loc, 640, 360).copy() for loc, ov, _r in owner_rows]
        sheet = Image.new("RGB", (W, len(owner_rows) * 394), (22, 22, 22))
        for i, (loc, ov, r) in enumerate(owner_rows):
            sheet.paste(tile(ov, loc + "  (render)"), (0, i * 394))
            sheet.paste(tile(r, "reference"), (640, i * 394))
        sheet.save(owner)
        print("owner sheet", owner)


if __name__ == "__main__":
    main(sys.argv[1:])

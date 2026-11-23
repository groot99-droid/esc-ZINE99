#!/usr/bin/env python3
"""Contact sheets, owner sheet and ledger from a finished render run.

    python tools/render/finish.py dr-tox-rise <run dir> [--owner <png>] [--before <run dir>] [--refs <repo root of the reference images>]

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


def no_reference_card(slug, loc, w=1600, h=900):
    """A location without a reference image (dr-tox-altrulan: assets.json holds the prompt only): a text card with the
    location's lighting line, so the sheet says so instead of leaving a hole."""
    import textwrap
    a = json.loads((ROOT / "games" / slug / "assets" / "assets.json").read_text(encoding="utf-8"))
    loc_rec = next(x for x in a["locations"] if x["id"] == loc)
    im = Image.new("RGB", (w, h), (40, 36, 30))
    d = ImageDraw.Draw(im)
    d.text((60, 60), "NO REFERENCE IMAGE YET", fill=(255, 200, 120), font=font(64))
    d.text((60, 150), "assets.json holds the prompt only. Described lighting:", fill=(200, 200, 200), font=font(36))
    y = 220
    for line in textwrap.wrap(loc_rec.get("lighting", ""), 62)[:14]:
        d.text((60, y), line, fill=(235, 235, 235), font=font(36))
        y += 48
    return im


def text_card(title, lines, w=1600, h=900):
    """A plain text card standing in for a reference image (man-eater: no figure imagery, so a reference that shows or
    can be read as a figure is replaced by this card; rig.json "reference_card" holds the reason)."""
    import textwrap
    im = Image.new("RGB", (w, h), (40, 36, 30))
    d = ImageDraw.Draw(im)
    d.text((60, 60), title, fill=(255, 200, 120), font=font(64))
    y = 170
    for line in lines:
        for part in textwrap.wrap(line, 56):
            d.text((60, y), part, fill=(235, 235, 235), font=font(38))
            y += 50
        y += 20
    return im


def still(p):
    """The still as rendered (png) or, when only a downsized jpg copy was fetched from the render box, that."""
    p = Path(p)
    return Image.open(p if p.exists() else p.with_suffix(".jpg"))


def main(argv):
    slug, run = argv[0], Path(argv[1])
    owner = argv[argv.index("--owner") + 1] if "--owner" in argv else None
    before = Path(argv[argv.index("--before") + 1]) if "--before" in argv else None
    # --refs <repo root>: where games/<slug>/assets/locations/<id>.jpg is read from when the reference images are not in this
    # checkout (dr-tox-altrulan's live on another branch; read only, never copied into this branch)
    refs_root = Path(argv[argv.index("--refs") + 1]) if "--refs" in argv else ROOT
    outdir = ROOT / "renders" / slug
    outdir.mkdir(parents=True, exist_ok=True)
    plans = [e for e in json.loads((ROOT / "docs/blender_plans/plans.json").read_text(encoding="utf-8"))["scenes"]
             if e["game"] == slug]
    flags = json.loads((Path(__file__).parent / "flags.json").read_text(encoding="utf-8"))
    rig = json.loads((Path(__file__).parent / "rig.json").read_text(encoding="utf-8"))
    ledger = {"game": slug, "tiers": {"hero": "2560x1440, 256 samples", "standard": "1920x1080, 128 samples",
                                      "overview": "1920x1080, 128 samples"},
              "renderer": "Cycles (OptiX), OpenImageDenoise, Blender 5.2.1", "scenes": [], "overviews": []}
    def lrig(loc):  # rig.json keys may be namespaced "<game>/<location>" (creek-trail exists in two games)
        return rig.get(f"{slug}/{loc}", rig.get(loc, {}))

    locs = []
    for e in plans:
        if e["location"] not in locs:
            locs.append(e["location"])
    owner_rows = []
    for loc in locs:
        tiles = []
        ov = run / loc / "_overview" / "overview.png"
        rp = refs_root / "games" / slug / "assets" / "locations" / f"{loc}.jpg"
        card = lrig(loc).get("reference_card")
        if card:
            ref = text_card("REFERENCE LEFT OUT", [card])
        else:
            ref = Image.open(rp) if rp.exists() else no_reference_card(slug, loc)
        tiles.append(tile(still(ov), "overview", sub="1920x1080 / 128 spp"))
        tiles.append(tile(ref, "reference card (no figure imagery)" if card else "reference image" if rp.exists() else "no reference image yet"))
        owner_rows.append((loc, still(ov), ref))
        for e in [p for p in plans if p["location"] == loc]:
            rec = json.loads((run / loc / f"{e['scene']}.json").read_text(encoding="utf-8"))
            st = {s["still"]: s for s in rec["stills"]}
            cam = st["camera"]
            tiles.append(tile(still(run / cam["file"]), e["scene"],
                              sub=f"{rec['tier']} {cam['resolution'][0]}x{cam['resolution'][1]} / {cam['samples']} spp"))
            ledger["scenes"].append({
                "scene": e["scene"], "location": loc, "tier": rec["tier"],
                "resolution": cam["resolution"], "samples": cam["samples"],
                "stills": [{"still": s["still"], "resolution": s["resolution"], "samples": s["samples"],
                            "render_seconds": s["seconds"]} for s in rec["stills"]],
                "props": [{"id": k, "object": v["object"], "source": v["source"], **({"name": v["name"]} if v.get("name", k) != k else {}),
                           **({"fit": v["fit"]} if v.get("fit") else {})}
                          for k, v in rec["props"].items()],
                "flagged_in_first_pass": e["flagged_in_first_pass"],
                "geometry_checks": rec["checks"],
                "render_time_overrides": sorted(k for k in rec["overrides"] if rec["overrides"][k]),
                "flag_status": flags.get(e["scene"], {"status": "not flagged"}),
            })
        ledger["overviews"].append({"location": loc, "reference": (f"games/{slug}/assets/locations/{loc}.jpg" if rp.exists() else None) if not card else "left out (text card)",
                                    "location_scene_count": len([p for p in plans if p["location"] == loc]), "scene_lighting": lrig(loc)["overview_scene"],
                                    "camera": lrig(loc)["overview"], "rig": {k: v for k, v in lrig(loc).items()
                                                                          if k not in ("overview", "overview_scene")}})
        rows = (len(tiles) + 1) // 2
        sheet = Image.new("RGB", (1280, rows * 394), (22, 22, 22))
        for i, t in enumerate(tiles):
            sheet.paste(t, ((i % 2) * 640, (i // 2) * 394))
        sheet.save(outdir / f"{loc}.jpg", quality=84, optimize=True)
        print("sheet", loc, sheet.size)
    objs = {}  # per object id: how it was drawn (a model fitted to its box, or a named box proxy and why)
    for sc in ledger["scenes"]:
        for pr in sc["props"]:
            o = objs.setdefault(pr["object"], {"source": pr["source"].split(":")[0], "model": None, "props": 0, "fit": None, "note": None})
            o["props"] += 1
            if pr["source"].startswith("model:"):
                o["model"] = pr["source"][6:]
            if pr.get("fit"):
                o["fit"] = o["fit"] or pr["fit"]
                if pr["fit"].get("rejected"):
                    o["note"] = pr["fit"]["rejected"]
                if pr["fit"].get("model_skipped"):
                    o["note"] = "model skipped: " + pr["fit"]["model_skipped"]
    ledger["objects"] = dict(sorted(objs.items()))
    (outdir / "ledger.json").write_text(json.dumps(ledger, indent=1) + "\n", encoding="utf-8")
    if before:  # flagged-before-after.jpg: each scene in the "before" run (--no-overrides, quick) beside its final still
        pairs = []
        for jf in sorted(before.glob("*/*.json")):
            rec = json.loads(jf.read_text(encoding="utf-8"))
            b = before / rec["location"] / rec["scene"] / "camera.png"
            a = run / rec["location"] / rec["scene"] / "camera.png"
            pairs.append((rec["scene"], still(b), still(a)))
        sheet = Image.new("RGB", (1280, len(pairs) * 394), (22, 22, 22))
        for i, (sid, b, a) in enumerate(pairs):
            sheet.paste(tile(b, sid + "  before", sub="0.4 scale, 25% spp"), (0, i * 394))
            sheet.paste(tile(a, sid + "  after"), (640, i * 394))
        sheet.save(outdir / "flagged-before-after.jpg", quality=84, optimize=True)
        print("before/after", len(pairs))
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

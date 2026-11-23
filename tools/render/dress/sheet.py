"""Owner sheet: places stacked, each with its before picture above its after picture, 720 px wide (phone-readable).

    python sheet.py <sheet.json> <out.png>

sheet.json: {"title": "...", "places": [{"label": "...", "sub": "...", "before": "<image>", "after": "<image>", "caption": "..."}]}
Image paths are read as given (absolute or relative to the working folder); nothing is copied.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

W = 720


def font(size, bold=False):
    for name in (("arialbd.ttf", "DejaVuSans-Bold.ttf") if bold else ("arial.ttf", "DejaVuSans.ttf")):
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def fit(im, w=W):
    h = int(round(im.size[1] * w / im.size[0]))
    return im.convert("RGB").resize((w, h), Image.LANCZOS)


def build(spec, out):
    parts = []
    def _bar(text, sub=None, h=44, fill=(24, 24, 28), col=(240, 240, 235)):
        im = Image.new("RGB", (W, h + (22 if sub else 0)), fill)
        d = ImageDraw.Draw(im)
        d.text((14, 8), text, font=font(24, True), fill=col)
        if sub:
            d.text((14, h - 2), sub, font=font(17), fill=(190, 190, 185))
        return im

    if spec.get("title"):
        parts.append(_bar(spec["title"], spec.get("subtitle"), 52, (12, 12, 16), (255, 255, 255)))
    for pl in spec["places"]:
        parts.append(_bar(pl["label"], pl.get("sub"), 44, (40, 44, 58)))
        parts.append(_bar("BEFORE", None, 30, (70, 40, 40)))
        parts.append(fit(Image.open(pl["before"])))
        parts.append(_bar("AFTER", None, 30, (36, 70, 48)))
        parts.append(fit(Image.open(pl["after"])))
        if pl.get("caption"):
            im = Image.new("RGB", (W, 34), (18, 18, 22))
            ImageDraw.Draw(im).text((14, 6), pl["caption"], font=font(18), fill=(200, 200, 195))
            parts.append(im)
        parts.append(Image.new("RGB", (W, 10), (0, 0, 0)))
    H = sum(p.size[1] for p in parts)
    sheet = Image.new("RGB", (W, H), (0, 0, 0))
    y = 0
    for p in parts:
        sheet.paste(p, (0, y))
        y += p.size[1]
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    sheet.save(out, optimize=True)
    return sheet.size


if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as f:
        print(build(json.load(f), sys.argv[2]))

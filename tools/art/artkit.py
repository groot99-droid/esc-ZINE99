"""Game art drawn by code: the kit every `games/<slug>/art/src/*.py` imports.

    from artkit import Art, asset, f, sibling

    @asset("stuffed-ones", "card-ruth", group="cards", title="Ruth's peg card", w=300, h=420,
           row="Parlour peg cards")
    def card_ruth(a: Art):
        '''One sentence for the SVG's <desc>: what the picture shows.'''
        a.paper("#efe6d2", grain=0.3)
        ...

`Art` is the pictograph canvas (`tools/pictographs/core.py`: paper, hatch, stipple, halftone,
stitch, wobble, facets, pixels and the rest) at any size: `a.w` and `a.h` are the asset's own.
Register a family in a loop; each asset needs a unique id within its game. `row` names the row of
the game's DEEP_DIVE.md asset table the asset answers. Stdlib only. Plain SVG 1.1: no scripts, no
external links, no embedded rasters, generic font families only (serif, sans-serif, monospace,
cursive, fantasy).
"""
from __future__ import annotations

import hashlib
import importlib.util
import sys
from pathlib import Path
from xml.sax.saxutils import escape

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pictographs"))
import core as _picto  # noqa: E402
from core import Pic, attrs, f  # noqa: E402,F401

REGISTRY: dict[tuple[str, str], dict] = {}
GROUPS = ("title", "key-art", "figures", "backdrops", "cards", "pieces", "endings", "chapters", "ui",
          "documents", "maps", "thread")


def asset(game: str, id: str, group: str, title: str, w: int, h: int, row: str = ""):
    if group not in GROUPS:
        raise ValueError(f"{game}/{id}: group '{group}' is not one of {GROUPS}")

    def deco(fn):
        if (game, id) in REGISTRY:
            raise ValueError(f"{game}/{id} is registered twice")
        REGISTRY[(game, id)] = dict(game=game, id=id, group=group, title=title, w=int(w), h=int(h), row=row, fn=fn)
        return fn
    return deco


def sibling(here: str, name: str):
    """Load a helper module (a file whose name starts with '_') from the same src folder."""
    p = Path(here).resolve().parent / f"{name}.py"
    key = "art_" + hashlib.sha256(str(p).encode()).hexdigest()[:12]
    if key not in sys.modules:
        spec = importlib.util.spec_from_file_location(key, p)
        mod = importlib.util.module_from_spec(spec)
        sys.modules[key] = mod
        spec.loader.exec_module(mod)
    return sys.modules[key]


class Art(Pic):
    def __init__(self, game, id, title, desc, w, h, seed=None):
        super().__init__(game, id, title, desc, seed)
        self.w, self.h = w, h

    def svg(self) -> str:
        k = self.key
        parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" '
                 f'height="{self.h}" role="img" aria-labelledby="{k}-t {k}-d">',
                 f'<title id="{k}-t">{escape(self.title)}</title>', f'<desc id="{k}-d">{escape(self.desc)}</desc>']
        if self.defs:
            parts.append("<defs>" + "".join(self.defs) + "</defs>")
        parts += self.body
        parts.append("</svg>")
        return "\n".join(parts) + "\n"

    def paper(self, color="#f2ead8", grain=0.3, fibre=None):
        self.rect(0, 0, self.w, self.h, fill=color)
        if grain:
            fid = self.uid("grain")
            freq = 0.9 if fibre is None else fibre
            self.defn(f'<filter id="{fid}" x="0" y="0" width="100%" height="100%">'
                      f'<feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="2" seed="{self.seed % 997}"/>'
                      f'<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {f(grain)} 0"/></filter>')
            self.rect(0, 0, self.w, self.h, filter=f"url(#{fid})")

    def vignette(self, strength=0.6, color="#000"):
        gid = self.uid("vig")
        self.defn(f'<radialGradient id="{gid}" cx="50%" cy="50%" r="70%">'
                  f'<stop offset="55%" stop-color="{color}" stop-opacity="0"/>'
                  f'<stop offset="100%" stop-color="{color}" stop-opacity="{f(strength)}"/></radialGradient>')
        self.rect(0, 0, self.w, self.h, fill=f"url(#{gid})")

    def caption(self, s, x=None, y=None, size=22, family="serif", **kw):
        self.text(self.w * 0.04 if x is None else x, self.h - size * 1.4 if y is None else y, s, size=size,
                  family=family, **kw)

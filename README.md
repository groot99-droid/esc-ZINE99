# esc-ZINE99

Ten games adapted from the author's creative-writing vault. Each game is between 45 minutes and
3 hours long, has endings that depend on the player's choices, and is played in three layers: 3D
scenes, 2D spatial sequences and 1D games within the game.

Nothing is built yet. This repository holds the designs, the shared rules, the data each game will
run on, and a validator that keeps them consistent.

## The games

| Game | Folder | Type of game | Length |
| --- | --- | --- | --- |
| The Stuffed Ones | `games/stuffed-ones/` | Role-reversal horror: survive as a guest, then hunt as a stuffed one | 120–150 min |
| Behind the Peephole | `games/behind-the-peephole/` | Observation and deduction across seven nights | 120–150 min |
| Missing Campsites | `games/missing-campsites/` | Liminal exploration on a vanishing campground | 75–100 min |
| The Redacted Testament of Lira Calyx | `games/lira-calyx/` | Field-science investigation up a mountain | 160–180 min |
| WrymWretch | `games/wrymwretch/` | Party role-playing game in a world that forgets | 170–180 min |
| Project: Man Eater | `games/man-eater/` | Rules-based survival horror | 90–120 min |
| A Journey Into the Heartstream | `games/heartstream/` | Co-op river journey, played once | 50–70 min |
| People of the Bark | `games/people-of-the-bark/` | City-builder at the scale of tree bark | 150–180 min |
| The Endless Temple | `games/endless-temple/` | Hub adventure, one world per book | 120–160 min |
| The Lord of the Sea | `games/lord-of-the-sea/` | Open-sea adventure as a weakened sea god | 160–180 min |

## Where to read

| File | What it holds |
| --- | --- |
| `docs/PILLARS.md` | The rules every game follows: length, investment, endings, the three layers, fidelity |
| `docs/COLLECTION.md` | How the ten games stay different: which game owns which verb, 2D mode and 1D game |
| `docs/TECH.md` | The shared engine, the repository layout, saves, endings, accessibility, assets |
| `docs/DESIGN_TEMPLATE.md` | The 21 sections every game's design has |
| `docs/ADAPTATIONS.md` | The first round of adaptations, which the designs build on |
| `docs/STORYBOARDS.md` | How each game's scenes join through the three layers, panel by panel |
| `docs/PICTOGRAPHS.md` | One procedurally drawn pictograph per 2D mode and 1D game, each in its own graphic style |
| `docs/graphic_styles.json` | The graphic style each 2D mode and 1D game owns; no style is used twice |
| `games/<slug>/reference/` | Four reference stills per game (Higgsfield, Soul Cinema); mood references, not final art |
| `games/<slug>/DESIGN.md` | One game's full design |
| `games/<slug>/data/` | That game's chapters, scenes, state and endings, as JSON |
| `schemas/` | JSON Schemas for those data files |

## The three layers

| Layer | How it progresses | Example |
| --- | --- | --- |
| 3D | Through space, in depth | Walking a cabin at night |
| 2D | Through space, on a plane | Tilting an eye at a peephole; a side-scrolling run between scenes |
| 1D | By objective, with no travel | A map page, picking a lock, a card or board game, crafting, cooking |

## Checking the data

```bash
python tools/validate.py
```

It checks every game's data against the shared rules and prints `ok` or the problems it found.
Pass one or more slugs to check only those games.

```bash
python tools/check_storyboards.py
```

It checks every storyboard panel in `docs/STORYBOARDS.md` against the game's `scenes.json`, and
that each reference still sits on exactly one panel.

```bash
python tools/pictographs/build.py
```

It draws every gameplay pictograph (`games/<slug>/pictographs/*.svg`) from each game's
`pictographs/make.py`, and regenerates `docs/PICTOGRAPHS.md` and section 7 of `docs/COLLECTION.md`
from `docs/graphic_styles.json`. `--check` changes nothing and fails if anything is stale.

```bash
python tools/check_assets.py
```

It checks each game's `assets/assets.json`: the location images that are the reference for
building each 3D set in Blender (every 3D scene covered by exactly one location), and the isolated
object images on white that are the input for Meshy image-to-3D (every object placed in a location,
with its size in metres).

```bash
python tools/check_blender.py
python tools/blender/compile.py
```

The first checks each game's Blender build files (`games/<slug>/blender/<location>.build.json`);
the second compiles every 3D scene into a layout the studio's `assemble-3d` runs unchanged. See
`docs/BLENDER.md`.

```bash
python tools/web/build.py
node tools/web/smoke.mjs
```

The first builds the web site's catalog and assets; the second plays every route of `web/` in a
headless browser. `web/` is the hub, each game's loading screen, and every 2D mode and 1D game,
playable in the page. See `docs/WEB.md`.

## Sources

Every game adapts a work in the author's `Pipelines-Plugin` repository, under
`creative-writing/vault/`. Those works are never edited here. Lines quoted in the designs are
verbatim, and each design lists what was added for the game.

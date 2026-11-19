# esc-ZINE99

Eleven games adapted from the author's work: ten from the creative-writing vault, and Dr. Tox, in
four episodes, from the author's bible in `dr-tox/source/`. Each game (for Dr. Tox, each episode) is
between 45 minutes and 3 hours long, has endings that depend on the player's choices, and is played in three layers: 3D
scenes, 2D spatial sequences and 1D games within the game.

No game is finished, and the shared engine (`docs/TECH.md`) is not started. What exists is:

- each game's design, the data it will run on, and the checks that keep them consistent;
- a playable web prototype of every 2D mode and 1D game (63 in all), with each game's loading
  screen, menu and endings, in `web/` (`docs/WEB.md`);
- the art drawn by code for each game (`games/<slug>/art/`), its generated key art and ending cards
  (`games/<slug>/keyart/`), and one gameplay pictograph per 2D mode and 1D game;
- the reference images for every 3D set and Meshy prop (`games/<slug>/assets/`) and one Blender build
  file per 3D location (`games/<slug>/blender/`). No 3D scene has been built in Blender yet.

The development the author accepted on 2026-11-15 (`docs/DEEP_DIVE.md`) was carried into the designs,
the data and the web prototypes in three phases on 2026-11-15 and 2026-11-16. What each game still
lacks is listed at the end of its `DESIGN.md` section "Accepted development (2026-11-15)".

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
| Dr. Tox: Age of Glass & Greed | `games/dr-tox-rise/`, `-fall/`, `-finale/`, `-altrulan/` (Rise and Fall built; Finale and Altrulan not yet created) | Four episodes as a poisoned forensic scientist hunting the company that made him | 490–600 min in all |

## Where to read

| File | What it holds |
| --- | --- |
| `docs/PILLARS.md` | The rules every game follows: length, investment, endings, the three layers, fidelity |
| `docs/COLLECTION.md` | How the eleven games stay different: which game owns which verb, 2D mode and 1D game |
| `docs/TECH.md` | The proposed shared engine, the repository layout, saves, endings, accessibility, assets |
| `docs/DESIGN_TEMPLATE.md` | The sections every game's design has |
| `docs/STORYBOARDS.md` | How each game's scenes join through the three layers, panel by panel |
| `docs/PICTOGRAPHS.md` | One procedurally drawn pictograph per 2D mode and 1D game, each in its own graphic style (generated) |
| `docs/graphic_styles.json` | The graphic style each 2D mode and 1D game owns; no style is used twice |
| `docs/BLENDER.md` | The Blender build files and how a 3D scene is compiled for the studio's `assemble-3d` |
| `docs/WEB.md` | The web build: hub, loading screens and the playable 2D and 1D modes |
| `docs/ADAPTATIONS.md` | The first round of adaptations, which the designs build on (historical) |
| `docs/REFINE_ADDITIONS.md` | Lines written for the web modes in the refine pass of 2026-11-13 (historical) |
| `docs/DEEP_DIVE.md` | The collection-level development plan of 2026-11-14, accepted and built (historical) |
| `games/<slug>/DESIGN.md` | One game's full design |
| `games/<slug>/data/` | That game's chapters, scenes, state and endings, as JSON, plus any extra tables with their schemas in `data/schemas/` |
| `games/<slug>/tools/check_data.py` | Where a game has extra data files, the check for them; `tools/validate.py` runs it |
| `games/<slug>/reference/` | Four reference stills per game (Higgsfield, Soul Cinema); mood references, not final art |
| `games/<slug>/pictographs/` | The game's gameplay pictographs and the `make.py` that draws them |
| `games/<slug>/art/` | Art drawn by code: the code in `art/src/`, one SVG per asset, `art.json` and a generated gallery `README.md` |
| `games/<slug>/keyart/` | Generated key art and ending cards, with prompt, model and job id in `keyart.json` |
| `games/<slug>/assets/` | `assets.json`: one location image per 3D place and one isolated object image per Meshy prop |
| `games/<slug>/blender/` | One build file per 3D location (`<location>.build.json`) |
| `games/<slug>/DEEP_DIVE.md` | The game's development plan of 2026-11-14, accepted and built (historical) |
| `games/<slug>/storyboard_additions.md` | Storyboard rows written in phases 2 and 3, since merged into `docs/STORYBOARDS.md` (historical) |
| `games/man-eater/CONSULTATION_BRIEF.md` | The draft brief for the cultural consultant (blanks left for the author) |
| `web/` | The hub, each game's loading screen and one playable module per 2D mode and 1D game |
| `tools/` | The validator and the checks and builds below |
| `schemas/` | JSON Schemas for the four shared data files |
| `dr-tox/` | Dr. Tox's shared lore: the author's bible (`source/`), the accepted scope (`SCOPE.md`), the Episode 1 style rows waiting for Phase 1 (`styles_pending.json`), and a catalogue of the author's existing Higgsfield art: prompt, model, job id and thumbnail, no links |

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
python tools/art/build.py <slug>
```

It draws a game's art from `games/<slug>/art/src/` into one SVG per asset, and writes `art.json` and
the gallery `README.md`. `--check` changes nothing and fails if anything is stale.

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

The first builds the web site's catalog and assets (stills, pictographs, each game's art bundle and
key art, and the collection thread); the second plays every route of `web/` in a headless browser,
and takes slugs to test only those games. `web/` is the hub, each game's loading screen, and every 2D mode and 1D game,
playable in the page. See `docs/WEB.md`.

## Sources

Every game adapts a work in the author's `Pipelines-Plugin` repository, under
`creative-writing/vault/`, except Dr. Tox, which adapts the author's bible in `dr-tox/source/`,
cited by part and section. Those works are never edited here. Lines quoted in the designs are
verbatim, and each design lists what was added for the game.

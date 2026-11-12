# Technical architecture

One shared engine runs all ten games. Each game is data plus a thin layer of game-specific code.
This file is the proposal; the decisions marked **Decision** are for the author to confirm.

## Stack

| Part | Choice | Why |
| --- | --- | --- |
| Language | TypeScript | One language for engine, games and tools |
| 3D | Three.js | Already the author's stack: the Writing Museum's viewer is Three.js |
| 2D | Three.js with an orthographic camera | One renderer for both spatial layers, so 3D and 2D can share assets and cross-fade |
| 1D | HTML and CSS full pages, with a canvas where a game needs one | Flat games are easiest to make tactile, readable and accessible in the DOM |
| Build | Vite, one workspace per game | Fast reloads; each game builds on its own |
| Package manager | pnpm workspaces | Shared engine, separate games |
| Tests | Vitest for logic; Playwright for walk-throughs | Playwright is what the Writing Museum's walk test uses |
| Audio | Web Audio API, through a small engine wrapper | No dependency needed |
| Saves | IndexedDB, one record per save slot | Survives reloads, holds more than localStorage |
| Desktop build | Tauri, later | **Decision**: browser first, desktop wrapper once a game is complete |

**Decision**: the stack above. If the author prefers an engine such as Godot or Unity, the data
formats below still hold; only `engine/` changes.

## Repository layout

```
esc-zine99/
  README.md
  CLAUDE.md
  docs/                 PILLARS.md, COLLECTION.md, TECH.md, DESIGN_TEMPLATE.md, ADAPTATIONS.md
  schemas/              JSON Schemas for every data file a game ships
  tools/validate.py     checks every game's data against the schemas and against itself
  engine/               the shared engine (not yet written)
    core/               state store, flags, meters, ending resolver, save system, clock
    layers/             Layer3D, Layer2D, Layer1D and the transitions between them
    ui/                 shared HUD pieces, menus, subtitles, accessibility settings
    audio/
    input/              keyboard, mouse, gamepad, touch; remappable
  games/<slug>/
    DESIGN.md           the game's full design
    data/
      game.json         title, length, chapters, layers used
      scenes.json       every 3D scene, 2D sequence and 1D game, with ids
      flags.json        every flag and meter, with type, range and what sets it
      endings.json      every ending and its exact conditions
      schemas/          optional: schemas for any extra data files this game needs
    tools/check_data.py optional: checks those extra files; validate.py runs it
    src/                game-specific code (not yet written)
    assets/             models, textures, audio (not yet made)
```

## The engine

### Layers

A game is a sequence of **scenes**. Every scene has one layer: `3d`, `2d` or `1d`.

- `Layer3D`: perspective camera, character controller, interaction raycasts, triggers.
- `Layer2D`: orthographic camera on a plane. It supports two movement types: `scroll`
  (the player moves along X and Y, as in a side-scroller or top-down walk) and `tilt`
  (the view moves over a still scene, as an eye at a peephole).
- `Layer1D`: a full-page DOM view that hosts one 1D game. It pauses the world beneath it unless
  the scene says `world_runs: true` (for example, a lock picked while a guest approaches).

Transitions between layers are part of the design. Each scene names its `enter` and `exit`
transition: `cut`, `fade`, `push-in` (3D camera moves into a surface that becomes the 1D page),
`pull-out`, or `flatten` (3D camera rotates to orthographic, becoming 2D).
When a scene branches, its `exit` is the default; if the scene that follows names a different
`enter`, the following scene's `enter` wins for that branch.

Each `Layer2D` mode and `Layer1D` game is drawn in its own graphic style (`docs/graphic_styles.json`).
A game's palette and materials are shared across its layers; the style is a per-page render
treatment (line weight, fills, texture, type), so it lives in that page's theme, not in the shared
materials. The pictographs in `games/<slug>/pictographs/` are the reference for each theme.

### State

- **Flags**: booleans and enumerations, set once by events. `ritual_book_read: true`.
- **Meters**: numbers with a range, changed by events. `dread.guest_2: 0–100`.
- **Counters**: integers. `nights_survived`.
- **Ledgers**: ordered lists of recorded events, for games whose endings depend on history
  (Man Eater's meals; Lira's verified readings).

All are declared in `data/flags.json` before use. The validator rejects an undeclared name.

### Endings

`data/endings.json` lists every ending with a `when` condition. The resolver checks endings in
`priority` order at the game's end and returns the first whose condition is true. The last ending
in priority order has the condition `true`, so a run always ends somewhere. A condition is a small
expression tree (see `schemas/endings.schema.json`), never code, so it can be tested and shown in
a debug panel that explains which ending fired and why.

In a game with several players (Heartstream), each client's state store holds only its own
player's values for per-player names, written `self.<name>`, and the resolver runs once per
client, on that store, when the client leaves the shared session.

The ending the author wrote is marked `"as_written": true`. Exactly one ending per game may carry
it, and only if the author wrote one.

### Saves

Autosave at every chapter boundary and every layer change. Three manual slots. A save stores the
current scene id, every flag, meter, counter and ledger, and the playtime. A game may also keep a **profile**: one IndexedDB record beside the slots that survives a new
game. `flags.json` marks its names "PROFILE" and the game's `data/profile.json` declares them
(The Stuffed Ones uses it to put the last run's guests on the shelf). Heartstream is the
exception: it has no saves by design, and its session is resumable only if a player drops out.

### Accessibility (all games)

Remappable controls; subtitles for every spoken line; a colour-blind safe palette for every
meaningful colour; an option to slow or pause every timed 1D game and every 2D sequence; text size
settings in every 1D page; no information carried by sound alone. Horror games have a content
note at start that names what they contain.

## Asset pipeline

- 3D models are `.glb`. The author's studio already has 3D pipelines (`asset-3d` with Meshy, then
  `assemble-3d` in Blender) that produce `.glb`; models made there can be copied in.
- Textures: KTX2 where supported, PNG otherwise.
- Audio: Ogg Vorbis, with an MP3 fallback.
- Every asset has an entry in the game's asset list in its `DESIGN.md` before it is made.

## Validation

`python tools/validate.py` checks every `games/<slug>/data/` folder:

- each file parses and has the required keys;
- every flag a scene or ending uses is declared in `flags.json`;
- every scene id referenced exists in `scenes.json`;
- each game has at least four 3D scenes, two 2D modes and four 1D games;
- each game has at least four endings, at most one `as_written`, and a final catch-all ending;
- chapter minutes add up to a total between 45 and 180;
- if the game has `tools/check_data.py`, it runs and must exit 0.

**Extra data files.** A game whose design needs data the shared schemas do not cover (Behind the
Peephole's night scripts, answer tables and card deals, for example) adds the files to its own
`data/`, their schemas to `data/schemas/`, and a stdlib `tools/check_data.py` that checks them
against each other and the four shared files. `validate.py` runs that check, so one command still
covers everything.

Run it after any change to a game's data.

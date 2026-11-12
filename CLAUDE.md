# CLAUDE.md — esc-ZINE99

Ten games adapted from the author's creative-writing vault. Read `README.md` for the layout.

## Rules

- **The designs answer to `docs/PILLARS.md` and `docs/COLLECTION.md`.** PILLARS sets the rules
  every game meets (45 to 180 minutes, investment, conditional endings, 3D, 2D and 1D, fidelity).
  COLLECTION assigns each game its core verb, 2D modes and 1D games, and no game may take one that
  belongs to another. Change COLLECTION first if a design needs something another game owns.
- **The source works are the author's and are never edited.** They live in the `Pipelines-Plugin`
  repository under `creative-writing/vault/`. Quote them verbatim and cite the vault path. Every
  design's last section lists what was added for the game, so the author can approve or strike it.
- **The author's ending is marked `as_written` and is never removed.** It follows when the player
  keeps to the story's own path. Other endings come from choices. A game whose source has no
  ending has no `as_written` ending until the author supplies one.
- **Definitions of the layers are the author's.** 2D is spatial progression on a plane: tilting a
  view as an eye at a peephole, or a side-scrolling run between scenes. 1D is objective progression
  with no travel: map pages, locks, card and board games, crafting, cooking. The test: in 2D the
  player is getting somewhere; in 1D the player is working something out.
- **DESIGN.md and `data/` must agree.** After changing either, run `python tools/validate.py <slug>`
  and fix what it reports. Do not loosen the validator to make a game pass. After changing a
  game's scenes or `docs/STORYBOARDS.md`, run `python tools/check_storyboards.py` too.
- **Each 2D mode and 1D game owns one graphic style** (`docs/graphic_styles.json`, shown in
  `docs/COLLECTION.md` section 7); no style is used twice. Pictographs are drawn by code in
  `games/<slug>/pictographs/make.py`, never by hand: change the code and run
  `python tools/pictographs/build.py`; `--check` must pass before a commit.
- **3D assets start from `games/<slug>/assets/assets.json`**: one location image per 3D place (the
  Blender reference) and one isolated object image per Meshy prop. Keep the prompt, model and job
  id with each image, never a link. No characters or creatures are Meshy props. After changing
  scenes or assets, run `python tools/check_assets.py <slug>`.
- **Each 3D location has one Blender build file** (`games/<slug>/blender/<location>.build.json`,
  format in `docs/BLENDER.md`) covering every 3D scene played there. After changing scenes, assets
  or build files, run `python tools/check_blender.py <slug>`. `build/` is generated; never commit it.
- Horror games keep a cost in every ending; victims have interior lives; graphic detail is
  suggested, never instructed. These are the vault's own craft rules.
- Do not recreate an existing commercial game, its characters, levels or look.
- The Windigo in Project: Man Eater comes from the traditions of Algonquian-speaking peoples. Keep
  the horror aimed at the institution, and keep the cultural-consultation step in its build plan.

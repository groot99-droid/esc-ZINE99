# DESIGN.md template

Every `games/<slug>/DESIGN.md` has these sections, in this order, under these headings. A section
that does not apply says so in one line rather than being left out.

1. **Summary**: the game in two sentences; source work and vault path; target length; players;
   the core verb from `docs/COLLECTION.md`.
2. **Why this game**: what makes it different from the other nine, in a short table against the
   one or two games nearest to it.
3. **Source fidelity**: what the author wrote, in a short beat list with verbatim quotes and
   vault paths; and the author's ending, if there is one.
4. **Investment**: the hook in the first 5 minutes; what the player comes to care about and how
   the game makes them care before it threatens it; the question that pulls them to the end.
5. **Lore bible**: history and timeline; the rules of the world; places; factions or groups;
   objects that matter; for each item, how the player learns it (found, told, seen, done).
6. **Characters**: every named or speaking character, with want, fear, voice (two or three sample
   lines, verbatim from the source where the source has them), and their arc in each ending.
7. **Structure and pacing**: a chapter table (chapter, minutes, layers used, new mechanic or
   revelation, tension 1–5). Then a beat chart of the whole run. Minutes add up to the target.
8. **Levels**: one subsection per chapter. For each: goal, where it happens, the 3D scenes, 2D
   sequences and 1D games in order, encounters or obstacles, what the player learns, flags set,
   and how it ends.
9. **3D scenes**: one entry per scene: id, place, size, camera, controls, interactables, lighting
   and mood, audio, triggers, entry and exit transitions.
10. **2D modes**: for each of the game's two modes: movement type (`scroll` or `tilt`), controls,
    physics or rules, hazards, how it shows progress, failure and retry, and every sequence that
    uses it.
11. **1D games**: for each: purpose in the story, rules, the full-page layout, inputs, win or
    finish state, failure, difficulty curve across its appearances, hints, and what it writes to
    flags or meters.
12. **Core systems**: every meter, economy or rule outside the 1D games, with numbers: ranges,
    rates, thresholds, and what each threshold does.
13. **Endings**: each ending with its name, whether it is as written, its exact conditions in
    plain words and as they appear in `data/endings.json`, its final scenes, and its last line or
    image. Then a short "how a player reaches each one on purpose".
14. **UI and HUD**: every screen and what it shows; diegetic versus overlaid; menus; how the three
    layers look different from one another.
15. **Art direction**: palette, references by mood (not by copying any existing game), materials,
    lighting, how 3D, 2D and 1D share one look.
16. **Audio**: music by chapter; ambience; key sound effects; voice approach.
17. **Content list**: every model, texture set, 2D sprite sheet, 1D page layout, music cue, and
    voice line group, with a count, so the build can be estimated.
18. **Data files**: what this game's `data/` folder holds, and anything in it beyond the shared
    schemas.
19. **Build plan**: milestones from greybox to finished, each with what is playable at the end;
    the first vertical slice.
20. **Risks and open questions**: risks with mitigations; questions only the author can answer.
21. **Added for the game**: every element not in the author's text, so the author can approve or
    strike it.

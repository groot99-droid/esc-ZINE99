# Pillars: the rules every game in esc-ZINE99 follows

These rules come from the author. Every game's `DESIGN.md` has to meet all of them, and
`docs/COLLECTION.md` shows how the ten games meet them differently.

## 1. Length: 45 minutes to 3 hours

A first playthrough lasts at least 45 minutes and at most about 3 hours. Each design states its
own target, splits it into chapters with minutes per chapter, and the minutes add up to the
target. Replays to reach other endings do not count toward the 45 minutes.

## 2. Every game earns the player's investment

A game has to give the player a reason to keep playing, not only a premise. Every design names:

- **The hook in the first 5 minutes**: the image, question or action that holds the player.
- **What the player comes to care about**: a person, a place, a skill, or their own changing self.
  The player has to have it before the game threatens it.
- **The question that pulls them to the end**: something the player wants answered or decided.
- **Pacing**: a beat chart showing tension rising and falling. No stretch longer than 15 minutes
  without a new mechanic, place, revelation or choice.

## 3. Lore and immersion

Each game has a lore bible: history, rules of the world, places, people and objects, and how the
player learns each one in play (found, told, seen, or done). Lore is given through play first:
objects, environment and the 1D games, with dialogue sparse, as in the author's prose.

## 4. Conditional endings

A story ends how the author wrote it. The choices are what make it a game.

- The author's written ending is always in the game, marked **as written**, and it is what follows
  when the player keeps to the story's own path.
- Other endings open when the player chooses differently. Every game has at least four endings.
- Every ending has exact, testable conditions, stated as flags and meters in `data/endings.json`.
  A player must be able to reach each ending on purpose, and a designer must be able to say why a
  given run got the ending it did.
- No ending is unreachable, and no two endings can both be true at the end of a run.
- Where the author has not written an ending, every ending is a proposal and none is marked.
- The author's craft rules still apply. In a horror game the endings keep a cost: there is no tidy
  rescue, even in the kindest ending.

## 5. Three layers: 3D, 2D and 1D

Every game uses all three, in several scenes each.

| Layer | How it progresses | What the player does |
| --- | --- | --- |
| **3D** | Through space, in depth | Moves and looks freely through a scene. |
| **2D** | Through space, on a plane | Moves or tilts along X and Y while the world moves forward. Like tilting your eye at a peephole, or travelling between scenes like a side-scrolling level. Progress is spatial. |
| **1D** | By objective, with no travel | A full-page game within the game, flat in nature: searching a map page, picking a lock, a card game, a board game, crafting, cooking. The play is mental and passive in movement; you do not walk a path through it. |

The test for sorting anything: in 2D the player is **getting somewhere**; in 1D the player is
**working something out**.

Each game has at least four 3D scenes, two distinct 2D modes, and four distinct 1D games. Each 1D
game has rules, inputs, a win or finish state, a difficulty curve, and a reason in the story for
being played. A 1D game always feeds back into the story or the endings.

## 6. Original and diverse

No two games in the collection share a core verb, a 2D mode or a 1D game type. Where two games
touch the same idea (becoming the monster, losing memory, investigating), `docs/COLLECTION.md`
states how each one handles it differently, and the designs must keep to that.

## 7. Faithful to the source

- The author's works in the `Pipelines-Plugin` vault (`creative-writing/vault/`) are certified
  verbatim and are never edited. These games adapt them; they do not change them.
- Lines quoted from a work are verbatim and cited by vault path.
- Every design has a section listing what was **added** for the game and is not in the author's
  text, so the author can approve or strike it.
- Victims have interior lives and are never props (the vault's ethical-restraint rule). Graphic
  detail stays suggested, not instructed.

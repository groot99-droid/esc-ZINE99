# The deep dive: making the ten games better

> **Status, 2026-11-19:** Historical record, kept as written on 2026-11-14 (the acceptance note added 2026-11-15). Current state: the author accepted it on 2026-11-15, and its three phases were built on 2026-11-15 and 2026-11-16 into each game's `DESIGN.md` (section "Accepted development (2026-11-15)"), `data/` and `web/games/<slug>/`: the new endings are in each `data/endings.json`, the collection thread and the eleventh page are on the hub (`web/lib/app.js`, `tools/web/build.py`), the code-drawn art is in `games/<slug>/art/` and the key art and ending cards in `games/<slug>/keyart/`. The Blender renders are not made. Superseded by each game's `DESIGN.md`.

Written 2026-11-14 at the author's request: "perform a deep dive on how to make these games better and
more interesting. plan to make art for each game, add better obstacles puzzles and more. really lean
into your own development of the story."

This page is the collection-level view. Each game has its own full plan in
`games/<slug>/DEEP_DIVE.md` (about 3 600 words each): a diagnosis, the story developed, obstacles and
puzzles for every mode, an art plan, a roadmap, and a register of everything invented.

**Accepted by the author on 2026-11-15** ("i accept, make the 1444 drawn by code images"): the proposals here and in the ten game plans stand, and the code-drawn art is being made first (`tools/art/`, `games/<slug>/art/`). `DESIGN.md` and `data/` have not been updated to them yet.

**Nothing here is built yet.** Every new character, secret, scene and
ending was written for the games, not taken from the source. The source works are untouched, every `as_written`
ending stays, and each plan ends with an additions register for the author to approve or strike.

## 1. What is wrong, in all ten at once

Ten separate readings came back with the same four faults.

1. **The middle has no reversal.** Nine of ten games escalate and never turn. Things get harder;
   nothing the player believed turns out to be false.
2. **Nothing wants anything.** The protagonist has a task and no want. The opposing force is a
   hazard and has no reason. The companions are hint systems.
3. **The layers pay into meters, not into each other.** A 1D game changes a number; it does not
   change what the next 2D run looks like, or what a 3D room contains.
4. **Endings underpay.** Several are a button at the end. Few cost the player something the player
   chose.

A fifth, smaller one: the art is props without people. There are places and objects and almost no
faces.

So the plan for every game has the same spine: give the protagonist a want, give the opposition a
comprehensible one, plant a secret that is already seeded by a line on the author's page, turn the
middle on it, and make the ending charge for it.

## 2. The ten stories, developed

| Game | The question the game now asks | The secret under it (proposed) | The set-piece |
|---|---|---|---|
| Behind the Peephole | When someone behind the glass looks back and asks you to keep watching, do you stay a lens or become a witness? | Mara in 403 has known about the rose since night one. A brass dot on each night's watercolour logs when the lens went dark: she has been keeping a log of you. | **The Sitting.** Her eye fills the lens; the trained reflex to step back is wrong. |
| The Endless Temple | Can Elaris read a boy to the end of his desert without walking him to death to get there? | Keeper Maudric was the father's reader, and read him to his "last attempt". Every "one more page" does the same to the son. | **The Other Hand.** A green hand with a ring brings the cup into frame, and the player did not press Sip. |
| A Journey into the Heartstream | When you cannot keep the people you love, what do you put in their hands before the river takes them? | The pulse in the marrow walls is carried there by brothers swept away earlier; the raft is grown from elders who stayed. | **The Finished Board.** A backwater holds a dead raft, the only finished game, and four gifts. |
| The Redacted Testament of Lira Calyx | When the instruments, the record and her own hand can all be written on by someone else, what can one honest observer still vouch for? | The archivist is the Continuum's own redactor. The black bars are a second handwriting, and a cipher. | **The Excision Desk.** The player redacts Lira's own brief, under a quota. |
| The Lord of the Sea | Can Alexi pay what the sea owes without owning it again or selling what is left of it? | The tab. Alexi drank on credit for centuries; the Company bought every chit. The king stood surety, and the princess kept the writ in her sleeve. | **Schedule C.** The Charter's red thread leaves the page and ends at the bottle on the cabin wall. |
| Project: Man Eater | Can a man who survives by not minding make one act the base has not already scheduled? | "The same mistakes" means minds gone blank, so the project runs enrichment, as a zoo does. The lie, Jax, the card table: all protocol. Fisk finds his sheet with tomorrow typed. | **Frame 112.** Carry Jax 400 m and walk back in your own prints; the photo shows no crossing. |
| The Missing Campsites | When the record turns out to be what the place is collecting, will Tam keep the page or keep the people? | Marisol was a camper. The ranger's logbook is her old notebook. The far side is "packing". | Past post 24, switch the torch off and see a lit booth window where there is no ground. |
| People of the Bark | When the god comes to listen, what will the Trunk sound like? | **The Blank Card.** A rhythm from inside the wood wakes the city; the player pulls back, sees nothing, and the Backyard card turns over blank. | **Against the Tide.** Mossa runs the walls down the Long Crack while Lowridge climbs it. |
| The Stuffed Ones | Is holding on to the people you love the same as keeping them? | Ruth is the first one bound: Mabel's daughter, re-cut for sixty years to seem to age. The hunt is her playtime. | **"I swear I locked that door."** Five toys tip the chair and hold still in a heap under the hall light. |
| WrymWretch | When a world is held together by remembering, who is made to carry the memory, and did anyone ask them? | The dragons' dormancy was the price of the seal. The voice saying "I… remember… me…" is the prison's last witness. | **Concentration III.** Cendre's face is blank before the first flip. |

Nine of the ten plans also propose one new ending (Missing Campsites a sixth; the rest a fifth).
Each is the ending the secret makes possible, and each costs something.

## 3. Obstacles and puzzles: the method

Every 2D mode and 1D game gets the same three-step ladder, written out mode by mode in the game
plans:

- **Teach:** the rule, alone, with room to fail safely.
- **Test:** the rule under the mode's pressure, with two or three new named elements.
- **Twist:** the rule turned over. The safe move becomes the wrong one, the board is read from the
  other side, the helper lies.

Across each game:

- **Three hard links between layers.** Something done in a 1D game changes what a 2D run contains or
  what a 3D room holds, as a visible object, not a number.
- **One long puzzle** that runs from the first scene to the ending: the brass dots, the black bars,
  the eight chits, the sixty knots, the List.
- **A second playthrough that reads differently**, because the player now knows the secret.

## 4. The collection thread (my proposal)

Ten games in one zine should know about each other, lightly. Each plan named one small object from
its game. I propose a ring: **each game hides the thread of the game before it.**

| Hidden in | The thread it carries | From |
|---|---|---|
| The Endless Temple | a stopped clock at 2:14, or a knock: two quick, one slow | Behind the Peephole |
| Heartstream | the ring a cup leaves on a table | The Endless Temple |
| Lira Calyx | a game board left unfinished, one counter closed in a hand | Heartstream |
| Lord of the Sea | a left-slanted correction in blue-black ink in a margin | Lira Calyx |
| Man Eater | a blue-and-white tea caddy with the Company's mark | Lord of the Sea |
| Missing Campsites | an envelope stamped HOLD | Man Eater |
| People of the Bark | "You're at the far end", said through a window | Missing Campsites |
| The Stuffed Ones | a knock answered from the other side of a wall | People of the Bark |
| WrymWretch | a small felt cat with button eyes | The Stuffed Ones |
| Behind the Peephole | a name written on the inside of a thing | WrymWretch |

Finding a thread stamps that game's cover on the hub. Ten stamps open **the eleventh page**: a
back-cover spread, drawn by code, where the ten objects sit on one table. It claims nothing about
the stories sharing a world; it is a zine's colophon. It needs no new mode, only one found object
per game and one hub page.

## 5. The art programme

The ten plans list **1 912 assets**. Three quarters are drawn by code, as the pictographs are.

| Made how | Count | Notes |
|---|---|---|
| Drawn by code (SVG and canvas) | 1 444 | card and piece faces, stamps, chapter cards, ornaments, title lettering, most ending cards |
| Generated images | 351 | key art, portraits and figures, backdrops for the 2D modes |
| Blender renders | 117 | from the build files already written; they wait on Blender |

Each plan has a five-line style bible, a full asset table, three prompts written out, and its first
ten assets in order. Behind the Peephole asks for 132 generated images, far more than any other
(the rest ask for 10 to 49); I would cut it to about 40 before making any.

**Wave 1 (recommended): the first ten assets of each game, 100 in all.** That gives every game its
title lettering, key art, its leads as people, and its ending cards: the point at which each game
looks made. I will quote the generation cost in credits before generating anything.

Rules that hold: no character is a Meshy prop; in Man Eater the figure stays a backlit shape and its
new still goes to the cultural consultant first; horror is suggested.

## 6. Roadmap for the collection

Every game plan has three phases, and phase 1 is always the same kind of work: text, rules and SVG
inside modules that already exist.

1. **Decide (the author).** Each plan lists the story decisions it needs: about five a game. The
   largest are in section 7. Nothing below starts on a game until its decisions are made.
2. **Phase 1 across all ten: the reversal and the long puzzle.** The secret planted, the midpoint
   scene, the long puzzle's first and last step, and Wave 1 art. Then `DESIGN.md` and `data/` are
   updated, with the validators passing unloosened.
3. **Phase 2: the layers and the ladders.** The teach, test, twist ladders in all 63 web modes, the
   three layer links per game, the new characters' scenes, the collection thread and the eleventh page.
4. **Phase 3: endings and return.** The new endings, added costs on the old ones, second-playthrough
   changes, the remaining art, the Blender renders.

## 7. The decisions that matter most

Each of these changes how the author's own text reads, without changing a word of it. They are the
author's to make.

- **Behind the Peephole:** that Mara knows; that Wren was the first watcher.
- **The Endless Temple:** that Maudric was the father's reader.
- **Heartstream:** that the raft is grown from elders, and the walls' pulse is the lost brothers.
- **Lira Calyx:** that the archivist is the redactor. Also: the plan lands at the 180-minute ceiling.
- **Lord of the Sea:** that Alexi signed the sea away himself, on a bar tab.
- **Man Eater:** the enrichment reading, which makes Sam's lie deliberate; roster numbers on the
  crates. The consultant sees the Schedule's empty 22:00 slot and the new figure still first.
- **Missing Campsites:** that Marisol was a camper; that the notebook can be burned (the design says
  it is never threatened).
- **People of the Bark:** whether the game may say there is something in the wood at all.
- **The Stuffed Ones:** that Ruth is the first one bound. This overrules an earlier answer of the
  author's ("What Mabel and Ruth gain stays unsaid").
- **WrymWretch:** that the dormancy was the price of the seal.
- **All:** whether each game gets its new ending; whether the collection thread and the eleventh
  page are wanted.

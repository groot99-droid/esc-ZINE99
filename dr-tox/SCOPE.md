# Dr. Tox: scope of the eleventh game

**Status: ACCEPTED by the author 2026-11-19, all 13 recommendations** (section 8). Phase 0 is done
(section 9); nothing else is built. Source: the author's bible, `dr-tox/source/Dr_Tox_Compiled_Bible_Obsidian.md`
(cited by part and section), never edited. Anything the bible does not contain is an addition.

Two rulings from the author bind it: the game "can be much larger", and the two Catalysts are two
real, different people.

## 1. The game and its core verb

*Dr. Tox: Age of Glass & Greed* is a game in four episodes. A forensic scientist, poisoned as a child
by Rockcore Chemical Corp (RCC), lives inside a radioactive cage he built at fifteen and hunts the
company that made him; beside him run Reese, the boy RCC made its hero Aegis, and Cally, the girl it
reprinted to unmake him. Three episodes play the bible's Rise, Fall and Finale; the fourth plays the
Epic of Altrulan after the Reset. Its law is the bible's: "Medicine as violence. Containment as
identity." (Part VI, Dr. Tox §5).

**Core verb: Dose.** To give a measured amount to a body: his own (the amber cage), an enemy's ("He
only needs to break the skin.", §4), his followers' (the cult), a city's (the Reset), a pilgrim's
(Altrulan's sacrament).

Checked against `docs/COLLECTION.md`:

- **§1**: none of the ten verbs. Lira Calyx *measures* the world; Dr. Tox *administers* to bodies.
  Man Eater *eats*; Dr. Tox gives.
- **§3, §4**: no mode or 1D type below appears there. Designed out: the pin board with red string
  (Part II) is Peephole's Mosaic, so it stays bunker set dressing; Man Eater owns self-diagnosis and
  portioning, so no page here reads his own body or rations food.
- **§5**, a new handling each. *Becoming the monster*: sudden, involuntary, unremembered; the Toxin
  State takes the controls, never in the same form twice (Part VI §3). *Memory loss*: a leash
  someone else holds ("HOPE signals them to mean something to him on demand", Part VI, Aegis).
  *Investigation*: reconstructing what his own body did. *A god*: people the player knew, sincerely
  remembered as gods (Part III).

## 2. Size and the Pillars

**Four episodes, each a complete game under Pillars 1 to 5; the whole runs 8 to 10 hours.** Each is
its own slug (`dr-tox-rise`, `-fall`, `-finale`, `-altrulan`), so `tools/validate.py` checks each
unchanged. Shared lore lives in `dr-tox/`.

| Episode | Target | Lead(s) | 3D locations | Endings |
| --- | --- | --- | --- | --- |
| **1. Rise** (to 2228) | 160–180 min | Alexander; Reese, alternating | Idaho river town; hospital room; Sky Room; Trial 53 arena; Spire plaza; lower-ring corridor; Snakehead archive; printer room | 4, one as written |
| **2. Fall** (2228–2236) | 150–180 min | Dr. Tox; Reese; Cally (two chapters) | Snakehead fortress; salvage settlement; relief hall; Rostova's bloom district; Spire gala | 4, none marked |
| **3. Finale** (2236–2240) | 120–150 min | Dr. Tox; Reese at the end | Snakehead overrun; the march; the final arcology; clinical suite; central hub | 5, one as written |
| **4. Altrulan** | 60–90 min | a pilgrim-keeper (new), with The Ghost | Glass Mountains; metabolic city; the Light Bringer's shrine; Snakehead as holy site | 4, none marked |

Rise opens on the bible's first signature image, "The injection" (Part VI §10), as a fifteen-year-old's
first dose, and closes as Alexander, who does not know her, watches the girl the player played with
in Sky Room wake as Cycle 41. **Carry-over:** each episode starts from the bible's fixed point
(Finale from "Dr. Tox loses control of his cult", Part II); the last ending's flags carry as scars
(Self, who lived, which words were said), never as a changed premise. "Green Wins" is terminal.

**`docs/PILLARS.md`:**

- Line 4: "ten games" → "eleven games".
- After line 10: "**Episodic games.** A game the author names as episodic (now only Dr. Tox) meets
  this rule per episode, each episode its own slug, 45 minutes to about 3 hours. The whole may be
  longer."
- Line 35 and line 57: add "(an episodic game: per episode)".
- After line 65: "No two episodes of one game share a 2D mode or 1D game type."
- After line 70: "Dr. Tox adapts the author's bible in `dr-tox/source/` under the same rule, cited by
  part and section."

**`docs/COLLECTION.md`:** lines 1 and 3, "ten" → "eleven"; after line 22, row 11 (490–600 min,
**Dose**); after line 41, a tone row; after lines 56 and 107, the rows in section 4; in §5 (lines
109–149), the handlings above; after line 166, "Amber, Self and the Word"; §7 regenerates from 25 new
`graphic_styles.json` rows. `CLAUDE.md` and `README.md` also say "ten": the author's to change.

## 3. The two Catalysts, two people

| | Catalyst A | Catalyst B |
| --- | --- | --- |
| Who | Elena Rostova, role: The "Villain" solution (Part VI, Version A) | Cally, RCC53-Δ2, reprinted by Project Catalyst (Version B) |
| Power | "Biomass manipulation and spore generation" | "targeted affective destabilization"; "BOND INTEGRITY 94.6%" (Part VIII, Scene 3) |
| The player meets her | Fall, by her spore release; Finale, as the State's public villain | Rise, as a child in Sky Room, then waking at Cycle 41; Fall, played, aimed at Aegis; Finale, her crack |
| In narration and UI | **Rostova** | **Cally** (child and clone alike) |
| In State text | CATALYST | C-53, "SUBJECT DESIGNATION: CALLY (ARCHIVED)" |
| Colour | spore rust and ochre | Sky Room's painted blue |

**Proposed story reason** (Part IX Q11 asks for one): RCC names products, not people. Catalyst is a
product line, Rostova its first model, and the Biosynth Division reused the brand for the Cally line:
to RCC the two women are one SKU. The bare word "Catalyst" appears only in quoted State text and on
RCC hardware, always beside a portrait. The author's call (question 2).

## 4. 2D modes and 1D games

Episodes 1 to 3 use the bible's "Grounded, cynical, traditional comic styling", each page a
different comic idiom; Altrulan uses "Sculptural, textured, non-comic illustration" (Part I). Every
style was checked against the 63 in `docs/graphic_styles.json`; none appears there.

| Ep | 2D mode (all scroll) | Rule | Style |
| --- | --- | --- | --- |
| 1 | **Panel run** | Alexander's break-ins across a comic page; gutters skip time, the player picks the next panel | Noir spotted-black brush ink |
| 1 | **Barrier escort** | Aegis draws hard-light walls to bring a transport through the lower ring, and sees whom they pen in | Franco-Belgian *ligne claire* |
| 2 | **Crowd thread** | Through a relief-hall queue, breath radius kept off people; the shroud shrinks it | Underground comix crosshatch |
| 2 | **Reflection run** | Cally and her mirrored reflection through glass halls; sometimes the reflection refuses | Silkscreen pop-art repeats |
| 3 | **The airway** | The arcology's ducts on the airflow; the page inks itself as he passes | Non-photo-blue pencil roughs |
| 3 | **Procession** | Against the cult's march, to its front | Photocopied punk-zine collage |
| 4 | **Root-way** | Along vines between towers that swell on the city's breath | Carved stone frieze |
| 4 | **Fresco walk** | Along a scripture wall; cracks show the Age beneath | Buon fresco on cracked plaster |

Panel run is not Endless Temple's living illustration: it moves between panels, not along one page.

| Ep | 1D game | Family (new to the collection) | Style |
| --- | --- | --- | --- |
| 1 | **The Cage** | Titration: shielding against immune pressure | Comic colourist's flats |
| 1 | **Cat's Cradle** (the four children) | String figures | Chalk and poster paint on the painted sky |
| 1 | **The Window** | Timetable: a break-in window in guard rotations | Fumetti photo-comic |
| 1 | **Fiche** (the 999) | Indexed retrieval on microfiche | Scratchboard |
| 1 | **Aftermath** | Reconstruction: order the traces of what the body did (Rise only) | Manga screentone, evidence tents |
| 2 | **Triage** | Sorting patients under scarcity | Alcohol-marker sketch cards |
| 2 | **The Manifold** | Flow routing through the gauntlet's valves | Mail-order comic advert |
| 2 | **Persona** (Cally) | Deck-building to a target's attachment profile | 1950s romance comic |
| 2 | **Bloom** (Rostova) | Spread containment on a grid | Four-colour Ben-Day newsprint |
| 2 | **Composite** | Reconstruction from testimony: the form the body took, built from what witnesses saw (Fall only; added 2026-11-19 under the author's ruling below, proposed in `games/dr-tox-fall/DESIGN.md`) | Identikit acetate overlays |
| 3 | **The Creed** | Dominoes: his own past lines chain into doctrine | Pocket tract booklet |
| 3 | **Two Pans** | Balance: the ratio of the final dose | Two-colour pulp, red and black |
| 3 | **Switchboard** | Patching life-support circuits | Letterer's balloon page |
| 3 | **Panes** (Aegis) | Tangram tiling of a breach | Holographic foil trading card |
| 3 | **Split Field** | Reconstruction by attribution: each mark the State blames on him matched to what made it, by toolmark comparison (Finale only; added 2026-11-19 under the author's ruling below, proposed in `games/dr-tox-finale/DESIGN.md`) | Craftint Doubletone shading board |
| 4 | **Rubbing** | Reveal a relief by rubbing | Heelball brass rubbing |
| 4 | **The Measure** | Exact amounts with fixed vessels | Slip-glazed terracotta |
| 4 | **The Mill** | Board game, alignment (morris family) | Cast bronze with patina |
| 4 | **The Peal** | Change ringing on the towers' bells | Repoussé gold |

Cat's Cradle is the one Age page outside the comic idiom: it is memory, the bible's "Clinical white"
register (Part VI §6). Composite is proposed as a second: the witnesses' document, not the comic's
(the author's call, `games/dr-tox-fall/DESIGN.md` section 20). Split Field stays in the comic idiom:
Craftint board is a newspaper-strip shading technique. Near styles to watch: Ben-Day (four process colours, black keyline) against
Missing Campsites' two-colour risograph; scratchboard (white cut from black) against Heartstream's
scrimshaw.

## 5. Endings

**Finale, as written.** The bible gives it (Part VI, Dr. Tox, Story: The Finale): "Dr. Tox
infiltrates the final corporate arcology's central hub and overloads his glands, flooding the city's
life support with an aerosolized mix of 5-MeO-DMT and Bufadienolides. His heart fails. This is his
sacrifice". The section is marked "(stub)" and cites "the Blueprint", so the author confirms the mark.

**Rise, as written (proposed).** The Origin ends on a state: "Alexander is fully established as Dr.
Tox — armored, armed, based in Snakehead." (Part VI, Story: Origin). Fall and Altrulan have no written
ending; theirs are all proposals.

| Ep | Ending | Conditions (sketch) | Cost |
| --- | --- | --- | --- |
| 1 | **Fully Dr. Tox** (as written) | Escapes with the Observers, returns, claims Snakehead | The 999 are only names |
| 1 | The Cage Alone | Leaves the Observers to security | They are taken |
| 1 | Green in the Archive | Pulse reaches 100 in the escape | Self starts the Fall lower |
| 1 | The Spec Sheet | Takes the terminal's printout | He knows "Aegis"; security knows his face |
| 2 | The Following | Triage dosing high | Dependence; the bridge to the Finale |
| 2 | The Clinic | Refuses dependence | Bloom takes a settlement |
| 2 | First Word | Reese says "RCC" | HOPE pulls the leash mid-fight |
| 2 | Bond Held | Cally's bond on Aegis ≥ 94.6% | Reese breaks; Cally never says "RCC" |
| 3 | **The Reset** (as written) | Two Pans in the window, Self above the floor, hub reached | His heart; the peace after |
| 3 | The Cage Holds | Does not overload | He lives; the cult's own resin attack |
| 3 | Green Wins | Self at the floor in the hub | The dose without the sacrament; no peace; terminal |
| 3 | The Light Bringer's Wall | Reese still says "HOPE" and seals Panes | Tox dies outside; the glass stands |
| 3 | The First Word | Cally says "RCC" and opens the hub | The Reset, with her inside it |
| 4 | Scripture Kept | Every pilgrim dosed | Peace; the Age only as myth |
| 4 | The Stamp | Reads the RCC plate on the shrine aloud | Truth; the peace cracks |
| 4 | Two Readings | Both in balance | The keeper carries both alone |
| 4 | The Last Toad | Sacrament spent | No pilgrim ascends again |

No Altrulan ending treats scripture as a lie: "they genuinely remember it that way now" (Part III).

**Governing ideas as mechanics.** *The power and the price are the same organ* (Part IV): one blood.
Each dart drawn from the shunt raises **Pulse**; at 100 the Toxin State takes the controls, burns
**Amber** (the cage, made by hand in The Cage) and lowers **Self**, adopting the bible's two
recommended open items (Part IX Q1, Q2). Aegis absorbs toxins into **Load** that his barriers spend;
Cally's bonds are her weapon and her crack. *Medicine as violence*: every 1D page is a medical
instrument turned. *Colour grammar as HUD*: amber against green, never at equal weight (Part VI §6).
*Terminology Rule as a flag*: Reese and Cally choose "HOPE" or "RCC"; the first "RCC" is recorded
(Part III).

**Content.** The arena is played as the refusal; no child dies on screen; the cut is at the seam.
Sky Room comes first, so Cally, Carmy and Rolan are people before they die. Each child found in
Fiche keeps one detail of their own; Triage patients and the corridor's Insurgents have names and
wants. Real substances are named as the bible names them; 1D chemistry uses invented units, never a
real procedure, dose or route.

## 6. Art

The 41 catalogued images (thumbnails in `dr-tox/art/thumbs/`, originals on Higgsfield):

- **World stills, 3D location references:** `7b7a67f7`, `45e6b51e` (Idaho town); `20d976bc`
  (a Panel run facility); `c8c8d1f7` (Rise); `f9398896`, `ee8b72ec`, `6f93c88c` (Fall); `0d6ffb66`,
  `47cf480e` (Finale).
- **Story frames, loading stills and ending cards:** `ce8c5a1a`, `29e53fb4` (The Cage); `27630ced`,
  `f392a762`, `a9a2b0c1` (Aftermath); `66e9da0a` (the Toxin State); `7f4ff140` (Fall cover).
- **Character sheet (20):** the identity lock for all new key art (§13: "Lock the identity").

**New, about 60 generated images, priced in credits first:** Reese as a child and as Aegis (after
his design system, Part IX Q12); Cally at twelve and at Cycle 41; Carmy and Rolan (no violence);
Rostova; the four Observers; the other hero; Sky Room; the empty arena; the Spire plaza; the printer
room; the archive; four Altrulan places; four covers. **About 30 Meshy props, no characters**
(shielded syringe, amber vial, gauntlet, printer column). **Drawn by code:** about 120 per episode.

## 7. Build plan

| Phase | Work | Agent jobs |
| --- | --- | --- |
| 0. Decide | Section 8 answered; PILLARS and COLLECTION amended | 1 |
| 1. Rise (vertical slice) | DESIGN.md and data, validated; 7 style rows and pictographs; art kit; 7 web modes and loading screen; assets and 8 Blender files; wave-1 key art; checks and smoke | about 14 |
| 2. Fall | The same, 6 modes | about 12 |
| 3. Finale | The same, 6 modes, plus flag carry-over | about 13 |
| 4. Altrulan | The same, 6 modes | about 11 |
| 5. Series | One Dr. Tox hub cover opening an episode menu (`web/lib/app.js`); full verification | 2 |

**Effort:** about four existing games: 25 web modules, about 25 Blender files, about 60 images.

**Risks:** invention load (Fall, Finale and Altrulan are stubs, so Episodes 2 to 4 are mostly
additions; build Altrulan last); children in the arena (the author reviews that chapter first);
look-alikes (the bible's Venom, Hulk and *The Boys* stay contrast, never reference); canon drift
(no Aegis design system; 2226 open); the hub assumes ten covers.

## 8. Open questions

1. **Four episodes as four slugs, with the lines above?** Recommend yes; validators stay as they are.
2. **Catalyst names:** Rostova and Cally in play, "Catalyst" only in State text, RCC's product reuse
   as the reason? Recommend yes.
3. **Mark the Origin's end state as Rise's written ending?** Recommend yes.
4. **Timeline (Part IX Q4):** recommend the bible's own option: the arena predates 2226, and 2226 is
   Aegis's public mantling; Cycle 41 completes in 2228, when Alexander falls in. Proposed only.
5. **Aegis:** the Reese profile, with the stub's abilities and philosophy carried forward as the
   bible does, "Dr. Aris Thorne" unused? Recommend yes, and his design system before key art.
6. **Toxin State:** adopt the cost model and cumulative stake (Part IX Q1, Q2) as rules? Recommend
   yes; the mechanics rest on them.
7. **The cape (Q3):** recommend a functional shroud (it shrinks the breath radius).
8. **Arena:** Sky Room and the refusal only, deaths off-frame? Recommend yes.
9. **Altrulan lead:** recommend a new pilgrim-keeper, The Ghost as companion.
10. **Fall:** The Following as the default bridge to the Finale? Recommend yes.
11. **The other hero:** recommend unnamed, not Chitin.
12. **Hub:** one cover with an episode menu, outside the ring of ten threads? Recommend yes.
13. **Art:** download full-size originals for the web build, no links kept? Recommend yes.

## 9. Phase 0 edits (2026-11-19)

Made after the author accepted section 8. Nothing under `games/`, `web/` or `tools/` changed.

- **`docs/PILLARS.md`**: "ten" to "eleven"; the Episodic games rule after section 1; "(an episodic
  game: per episode)" in sections 4 and 5; "No two episodes of one game share a 2D mode or 1D game
  type." in section 6; the bible bullet in section 7. All as section 2 words them.
- **`docs/COLLECTION.md`**: "ten" to "eleven"; a note on the four slugs; row 11 in section 1
  (490–600 min, **Dose**; camera left to each episode's design); a tone row; the handlings from
  this file's section 1 in section 5 (becoming the monster, memory loss, investigation, a god);
  "Amber, Self and the Word" in section 6. **The 2D modes and 1D games of section 4 are listed as reserved, below the
  tables of COLLECTION sections 3 and 4, not as table rows.** `tools/pictographs/build.py --check`
  requires a `graphic_styles.json` row and a `pictographs/make.py` for every table row, and resolves
  a row's game from `games/<slug>/data/game.json`; none exists yet. Each episode's rows move into
  the tables in its own phase. Section 7 of COLLECTION is generated from `graphic_styles.json` and
  is unchanged.
- **`docs/graphic_styles.json`**: unchanged. The seven Rise rows (two 2D modes, five 1D games,
  Aftermath once) are in `dr-tox/styles_pending.json` in its exact schema, because adding them now
  fails `tools/pictographs/build.py --check` (no `make.py`) and stops `tools/web/build.py` (no
  `game.json`). Phase 1 moves them across. Their "look" lines are proposals. (Done 2026-11-19, Phase
  1 stage A: the rows are in `graphic_styles.json`, Rise's rows are in COLLECTION's tables, and the
  pending file is deleted.)
- **`README.md`, `CLAUDE.md`**: "ten" to "eleven", Dr. Tox's bible named as its source, the four
  slugs listed as not yet created.
- **Added wording for the author to approve or strike**: the tone row ("Grounded, cynical comic-book
  science fiction, body horror; Altrulan as sculptural myth" / "Fury at the company, then fear of his
  own body; in Altrulan, reverence"), the gloss of "Amber, Self and the Word", and the seven "look"
  lines.
- **Conflict resolved (the author's ruling, 2026-11-19)**: Aftermath belongs to Rise only. Fall and
  Finale will each get a different reconstruction-style page later, each its own 1D game type, so
  the PILLARS rule holds (no two episodes share a 1D game type). Each still has four 1D games
  without it. (Done for Fall 2026-11-19, Phase 2 stage A: its reconstruction page is **Composite**,
  a form assembled from testimony, styled as identikit acetate overlays; Fall's seven rows are in
  `graphic_styles.json` and its modes and games in COLLECTION's tables. Done for the Finale 2026-11-19,
  Phase 3 stage A: its reconstruction page is **Split Field**, reconstruction by attribution (toolmark
  comparison), styled as Craftint Doubletone shading board; the Finale's seven rows are in
  `graphic_styles.json` and its modes and games in COLLECTION's tables.)

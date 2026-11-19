# Project: Man Eater — brief for the cultural consultant

Draft for the author to review before sending. It follows `DESIGN.md` section 19 (milestones M0,
M6, M9) and section 20 ("Cultural care: the Windigo"). Paths are in the `esc-zine99` repository
unless marked as the vault. The source story is the author's: `03_Stories/07_Project_-_Man_Eater.md`
in `creative-writing/vault/` of the `Pipelines-Plugin` repository. Quotations below are from that
file, by line, and are only those `DESIGN.md` already quotes.

## 1. What the game is

A single-player game of about 90 to 120 minutes, adapted from a short story by the author. Agent
Fisk is posted to a military research base in the North Dakota woods. Over seven days and nights he
eats what he is served, is weighed and measured each morning, plays cards for bread with a crew whose
chairs empty one by one, and at 10:00 each night hears a sound that takes someone from the barracks.
The food is changing him. Each run ends in one of five endings, one of them the author's own.

The horror is aimed at the institution: a base whose gate is armoured on the inside, whose forms
and charts schedule what happens to each man a day ahead, whose rules forbid leaving at night, and
whose fence and searchlight keep men in. The base's staff use a story about the Windigo as their
justification. The game presents that as their claim, never as its own truth. The point is that the
institution took a people's tradition and turned it into a resource and a schedule.

## 2. What the game does, and does not do, with the Windigo tradition

**It currently does:**

- Show one figure, once (night 7, scene `n7_windigo`), only as the source describes it ("a man pale
  as snow, bones bare, and skin stretched thin", line 34), never closer than 6 m, lit from behind
  so it reads as a long pale shape. It speaks the source's one line, subtitled: "Beware the Windigo,
  for I am he. Follow in my footsteps, and you will become me." (line 34). It is heard playing a
  flute, then vanishes in a gust of mist.
- Play the call, a sound heard at 10:00 each night: "Low melodic groaning, almost flute-like"
  (line 30). It is heard, never seen. For players who cannot hear it, frost on screen marks it.
- Voice part of the base director Sam's speech in the cave (line 35) as the project's claim: that
  the base is "the first recorded birthplace of a Windigo" and that his superiors "wish to harvest
  this curse". Fisk answers: "We are not Windigos, nor will a single man in his right mind eat
  another human." (line 35).

**It deliberately does not:**

- Make any image of the figure beyond a backlit shape. No close-up, no face, no clothing.
- Use any ceremonial imagery, regalia, names, origin story, or Indigenous characters.
- Build the call from Indigenous instruments, scales or songs. It is made from processed breath,
  a tin whistle pitched down, and air through a steel pipe.
- Voice, caption or print the two sentences of Sam's speech that give the Windigo's origin and
  attribute it to a people (source line 35; cut by omission, `DESIGN.md` section 20, answer 1).
- Say who the figure was, or link it to the people held on the base.
- Put anything in the 22:00 box on the base's Schedule (see section 3). It is drawn empty on every
  day and no text refers to it.
- Link the game to a separate draft in the author's vault that uses the word as a designation
  (`DESIGN.md` section 20, answer 4).

## 3. Everything that touches the figure or the word

"Decide" says what you are asked to rule on. Every item can also be struck.

| Id | Kind | Where in the repo | What it is now | You are asked to decide |
| --- | --- | --- | --- | --- |
| `n7_windigo` | 3D scene, night 7 | `data/scenes.json`; `DESIGN.md` §9; `blender/tall-halls.build.json` | The corner: the figure backlit at 6 m or more, the flute, its line, the gust | Whether the figure appears at all, and how; whether its line stays |
| The figure's line | Spoken line | `DESIGN.md` §3 (beat 16), §16 ("processed breath with words") | Source line 34, verbatim | Keep, cut, or change how it is voiced |
| The figure | Character rig and 2D sprite | `DESIGN.md` §17 (silhouette-only rig; 2D sprite sheet) | Planned, not built | Whether to build it, and its limits |
| `reference/09-the-flute.jpg` | Reference still | `reference/`; withdrawn from the web hub (author, 2026-11-16; `WITHDRAWN` in `tools/web/build.py`) | Shows the figure close, frontal and dressed. Flagged for replacement (`DEEP_DIVE.md`; `DESIGN.md` §20). Kept in the repository for you to see; no longer displayed in the hub | Whether it is replaced or kept; what a replacement may show |
| The figure's replacement still | Image | `DESIGN.md` §20, §21 | Not made; waits for you | Whether one is made, and what it shows |
| The call | Sound brief | `DESIGN.md` §16, §17 (six intensities) | Breath, whistle, pipe; no Indigenous instrument or scale | Whether the brief is acceptable; review the audio at M6 |
| Call drone | Music | `DESIGN.md` §16 (drone tuned to the call's pitch, days 2 to 4) | Planned | As for the call |
| `n1_bunk_call`, every `n*_door`, `n7_bunk_stay` | 3D scenes | `data/scenes.json`; `DESIGN.md` §8, §12 | The call heard at 10:00; one person leaves | Whether the call, as sound, stays |
| `n7_halls`, other Follow nights | 2D scenes | `DESIGN.md` §10; `art/src/40_backdrops.py` ("toward the call") | The pull toward the sound; no figure drawn | As above |
| `n7_set_down`, `n7_snow_back` | 3D and 2D scenes | `data/scenes.json`; `DESIGN.md` §8; `docs/STORYBOARDS.md` section 6 | Call heard from the base, never seen; **pending you** | Treatment of the call here |
| Chapter 8 card | Code-drawn art | `art/src/20_chapters.py` (the call as frost under the door) | Built | Whether this image is acceptable |
| Web modes | Playable pages | `web/games/man-eater/silhouette-halls.js`, `snow-line.js` | The call quoted as text (line 30) and as a pull | As for the call |
| The 22:00 box | Schedule field | `data/schedule.json` (`empty_slot`, `pending_consultant`); `web/games/man-eater/chart.js`; `DESIGN.md` §11.3 | Empty on every day; no text refers to it. Day 7's typed line is itself timed 22:00 (STAY / FOLLOW / FENCE) | What, if anything, the box holds, or whether it stays empty |
| L14 "The flute" | List entry | `data/list_incidents.json`; `DESIGN.md` §12 | Fisk's guesses: "A vent / A radio / Doesn't matter"; broken at the corner | Whether this entry stays |
| `windigo_met` | Flag | `data/flags.json`, `data/list_incidents.json` | Internal name, never shown to players | Whether internal ids using the word should be renamed |
| `e_cave` | 3D scene, ending | `DESIGN.md` §9, §13, §20 answer 1 | Sam's speech minus the origin sentences; Fisk's reply | Whether the cut stands, is restored, or goes further |
| Source file prop | Prop, night 4 | `n4_office`; `DESIGN.md` §5, §20 | A cover sheet citing one secondhand account, "unverified" crossed out; no account shown | Whether the prop stays and what it may show |
| The Zoo | Ending (the author's) | `data/endings.json` (`the_zoo`) | Through `n7_windigo` and `e_cave` | Its handling in context (M6) |
| One Set of Prints | Ending | `data/endings.json` (`one_set_of_prints`) | Call heard, no figure | As above |
| Call Me Sam, Transferred | Endings | `data/endings.json` | "The call comes" in the bunk | As above |
| Rule Three | Ending | `data/endings.json` (`rule_three`) | The fence; the call's pull at the door only | As above |
| The word "Windigo" | Spoken text | Lines 34 and 35 as above | Three spoken uses: the figure, Sam, Fisk | Whether the word is used at all |

## 4. Questions

**M0, before anything touching the Windigo is made (weeks 1 to 3)**

1. Is it acceptable for this story to be adapted as a game at all, in this form?
2. Should the figure appear? If so, what may be shown: a backlit shape, a sound, nothing?
3. Should the figure's spoken line stay, change, or go?
4. Should the word "Windigo" be spoken in the game? If not, what replaces it, or should the lines
   carrying it be cut?
5. Does the cut to Sam's speech stand? Should more of it go, or should any of it be restored?
6. Is the call's sound brief acceptable? Is any "flute-like" sound a problem?
7. What, if anything, should the empty 22:00 box hold?
8. `09-the-flute.jpg` has been withdrawn from the hub (author, 2026-11-16) and stays in the repo for the consultant to see; should it be replaced or kept?
9. Are there words, sounds or images, beyond those listed, that the game should avoid?
10. What should the credits say about the tradition, and about your role?

**M6, with the built game (weeks 31 to 32)**

1. The built figure, at its distance and lighting: does it hold to what was agreed?
2. The call audio, all six intensities: approve, change or cut.
3. Sam's cave scene, in context: does the horror stay on the institution?
4. The source file prop: approve, change or cut.
5. Each ending in context, especially The Zoo and One Set of Prints.
6. The replacement figure still, if one is made.

**M9, the release candidate (weeks 45 to 46)**

1. Does the release candidate match what was agreed at M0 and M6?
2. Is anything left that should be struck before release?
3. Sign-off, and the final credit wording.

## 5. Terms

Already committed in `DESIGN.md`:

- The consultant is paid.
- The consultant is credited.
- The consultant may strike content, and may restore, cut further, or strike the word "Windigo"
  itself (section 20). The consultation can change or remove any of the game's Windigo content,
  including Sam's lines.
- Consultation happens before any art, audio or script touching the Windigo is made (M0), again on
  the built game (M6), and before release (M9). Release follows sign-off.

Left for the author to settle:

- Fee: `[ to be settled by the author ]`
- Contract: `[ to be settled by the author ]`
- Credit wording: `[ to be settled by the author ]`
- Dates for M0, M6 and M9: `[ to be settled by the author ]`

## 6. What you will be shown first

1. The Schedule's empty 22:00 box (`data/schedule.json`, and the Chart page in the web build).
2. The figure as currently planned, including `reference/09-the-flute.jpg`, which is to be replaced
   (`DESIGN.md` section 20).
3. The source story, with its lines 30, 34 and 35, and the two cut sentences of Sam's speech.
4. The call's sound brief (`DESIGN.md` section 16).
5. `DESIGN.md` section 20, "Cultural care: the Windigo", and the table in section 3 above.

# Storyboards

How each game's scenes join, panel by panel, through the three layers. The camera moves the player
between layers inside the world, so a 3D scene becomes a 2D or 1D page without a menu.

| Transition | What the camera does |
| --- | --- |
| Push-in | The 3D camera moves into a surface (a page, a lens, a table) and it becomes the full-page 1D game |
| Pull-out | The reverse |
| Flatten | The 3D camera swings side-on or overhead and goes orthographic; the scene becomes 2D |
| Fade, cut | Time passes, or the place changes |

Each board follows one first playthrough. Numbered panels name the scene id in the game's
`data/scenes.json`; rows marked **E** are the other endings. Reference stills were made with
Higgsfield (Soul Cinema) and live in each game's `reference/` folder; they are mood references, not
final art. `python tools/check_storyboards.py` checks every panel against the game's data.

## 1. The Stuffed Ones

Act 1 looks out from human height and ends in the ritual room; Acts 2 and 3 look out from a 28 cm shelf, and Act 3 rewinds to the door opening to tell the same three guests' stay again as the hunt it was. 3D hands off to the 1D pages by push-in and takes them back by pull-out, and flattens into the dollhouse and the labyrinth from above for the 2D games.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `a1_cabin_arrival` | Human height, inside the cabin: shelves of toys "arranged like they were frozen mid-conversation" | "They like company," Mabel said. "Don't move them," Ruth added. The only input is Laugh; the journal: "We shouldn't have." | Fade | [01-arrival](../games/stuffed-ones/reference/01-arrival.jpg) |
| 2 | 1D | `a1_stitch_strap` | Stitchwork: Marcus's torn pack strap under the lamp, the pattern card top left | Mend it in eight running stitches while the four play the counting game and choose their words | Pull-out |  |
| 3 | 3D | `a5_kitchen_bear` | Night three, the kitchen under one bulb: a bear upright on the counter, the deer only a shape in its shadow | "The bear turned its head toward us." Input locks; this one cannot be shelved | Cut | [04-the-bear-turns](../games/stuffed-ones/reference/04-the-bear-turns.jpg) |
| 4 | 1D | `a5_book_3` | The Hand-Sewn Book on the lectern: glyph strips left, thread-coloured slots right, glows tightening at the page edge | 180 seconds to translate what is left while the toys close in; with the book unfinished, the altar offers no choice | Pull-out |  |
| 5 | 3D | `b6_waking` | Shelf camera, blurred edges, a plastic sheen; Jamie, Lila, Marcus and Dani opposite with button eyes | "Warmth. / Pressure. / Then light." Ruth's voice and the controller pulse teach Still | Push-in on your own seams | [07-awakening](../games/stuffed-ones/reference/07-awakening.jpg) |
| 6 | 1D | `b6_stuffing_1` | Stuffing: your body laid open like a sewing pattern, six seams, memory patches in the tray | Pack what you keep; the rest go "dissolving into cotton and thread" | Pull-out |  |
| 7 | 3D | `b7_arrivals` | Fixed shelf view of the living room; three guests unpacking in front of you | "Car doors. / Laughter. / Footsteps on the porch." Hunger rises while they are near; release only when the room is empty | Cut |  |
| 8 | 3D | `b8_the_door` | Upstairs hall at toy height, the bedroom door ahead | Let go: "…I didn't fight it." Black; nothing behind the door is shown | Fade |  |
| 9 | 3D | `c9_new_guests` | The shelf view runs backward in fast light to the afternoon the same three arrived | "I wish I could say we attacked them right away… But that would be a lie." "We stayed still. / Perfectly still." Learn the three by watching | Flatten |  |
| 10 | 2D | `c10_dollhouse_sound` | Dollhouse cutaway at night, every room open, sleeping guests' cones flickering, warm toy glows | Join. Thump, Drag, Squeak, Taps from 23:00 to 05:00; move only when no cone is open | Push-in on the Stuffing page | [09-dollhouse-cutaway](../games/stuffed-ones/reference/09-dollhouse-cutaway.jpg) |
| 11 | 1D | `c11_parlour_1` | Parlour: the embroidered counting-game board from above, the scoresheet, your Notes strip, footsteps at the edge | The guests are on the hike: three tampers, the Personal one only for someone you watched | Pull-out |  |
| 12 | 2D | `c14_labyrinth_inner` | The labyrinth from above: wallpaper walls edge-on, the floor reddening toward the centre, guests running | "We didn't rush. We didn't pounce. / We herded them." Through the loop doors to the centre | Fade |  |
| 13 | 3D | `e_cycle_shelf` | The shelf at dawn, new stuffed ones beside you | The Cycle (as written): "I sit on my shelf now, waiting." Car doors, laughter; "And we are so very hungry." | Fade |  |
| E | 3D | `e_keeper_porch` | An ordinary afternoon on the porch, Mabel and Ruth either side, four toys on the shelf through the window | The Keeper: all six spreads read, you chose to stitch. A car comes up Ridgeway Road; Speak: "They like company." | Fade |  |
| E | 3D | `e_warning_unpick` | The kitchen table at toy height, Ruth's hands and the scissors, the view's edge widening to white | The Warning: the guests fled and you kept five memories; each one is played back as a seam opens. Last image: the listing on the fridge | Fade |  |
| E | 3D | `e_empty_toy` | The fixed shelf view, grey morning, the others gone from the shelf | The Empty Toy: you held at all five games. Mabel dusts around you. "And the worst part? / We were awake." | Fade |  |

![Panel 1](../games/stuffed-ones/reference/01-arrival.jpg)

![Panel 3](../games/stuffed-ones/reference/04-the-bear-turns.jpg)

![Panel 5](../games/stuffed-ones/reference/07-awakening.jpg)

![Panel 10](../games/stuffed-ones/reference/09-dollhouse-cutaway.jpg)

## 2. Behind the Peephole

Every night runs the same loop: the office, the shift at the six lenses and in the passage, then the Statement and the Mosaic. On night seven the knock comes at your own door. In 3D the camera pushes into a brass rose (the 2D eye) or into the desk, the card table or the cork board (the 1D pages), and pulls back out. The passage flattens side-on into the corridor race. A run with no special plan ends at dawn with the last lens.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `n1_arrival` | The staff alley at 22:35 in rain and sodium light; the staff door; the service stair | Lew lets you in and leads you up one flight | Fade |  |
| 2 | 3D | `n1_passage` | The valet passage, 64 m long, six brass roses lit along one wall | Lew leaves; you walk west to 406's rose; the prompt "Look" | Push-in on 406's rose | [01-service-corridor](../games/behind-the-peephole/reference/01-service-corridor.jpg) |
| 3 | 2D | `n1_first_look` | The eye: empty 406, the river report on the TV, one paper boat on the sill | You learn to look; the bell rings four times as a test | Pull-out |  |
| 4 | 3D | `n1_office` | The old linen room: a green desk lamp, the bell board, six guest cards, a locked drawer | The phone at 22:58: Wren says "Log the returns. Only the returns." | Push-in on the desk drawer |  |
| 5 | 1D | `n1_drawer` | Lockwork: a three-pin tumbler, world paused | Pick it; inside, the logbook and the deck | Pull-out |  |
| 6 | 2D | `n1_shift_eye` | The eye at 402: a guest at her own door with her keycard | "A trembling hand holding a keycard": it drops twice; the chain goes on seven times | Pull-out | [02-eye-at-the-hole](../games/behind-the-peephole/reference/02-eye-at-the-hole.jpg) |
| 7 | 1D | `n2_patience` | Night Patience on the card table, the clock running at 10× | A card from another deck: "They see the dark." | Pull-out |  |
| 8 | 2D | `n2_shift_race` | The passage side-on: six doors, the light-well windows, the pipe run, Dora's trolley | Two bells at once (405, then 406); pass the maid unseen to make both doors | Push-in on the desk (the Statement) |  |
| 9 | 1D | `n6_mosaic` | The Mosaic: guest cards, pins and red thread on the cork board | Thread one payer to all six rooms, then Wren to you | Pull-out | [08-the-mosaic](../games/behind-the-peephole/reference/08-the-mosaic.jpg) |
| 10 | 1D | `n7_account` | The Account on the desk before the shift | Wren: "The file closes tonight." Write the Account before the shift; tonight you only confirm | Pull-out |  |
| 11 | 3D | `n7_your_door` | The office at 02:14: a brass rose in your own door, lit from outside | Three knocks; an eye at the lens; "A trap." You stay at the desk, and the log goes down the chute at 05:00 | Fade |  |
| 12 | 3D | `dawn_lobby` | The lobby at 06:00 from the mezzanine rail, grey river light | The guests leave in the order the file predicted | Fade |  |
| 13 | 2D | `end_next_watcher` | The eye at a lens in the passage, looking into your lit office | The Next Watcher: a figure at the desk writing the log lifts its head toward the rose, face still in the lamp's shadow | Fade (end) | [11-the-knock](../games/behind-the-peephole/reference/11-the-knock.jpg) |
| E | 3D | `end_under_door` | The passage at 05:00: six dark roses, every room empty, seven paper boats on 406's sill | Under the Door: the pages have gone under the doors; three knocks at the office door behind you | Fade (end) |  |
| E | 3D | `end_wrong_picture` | The lobby floor by the desk | The Wrong Picture: a guest who did not do what you wrote is led out and looks up at the fourth floor | Fade (end) |  |
| E | 3D | `end_open_door` | The river wall at dawn, beside Fenn | The Open Door: you count the fourth-floor windows, and one is dark | Fade (end) |  |

![Panel 2](../games/behind-the-peephole/reference/01-service-corridor.jpg)

![Panel 6](../games/behind-the-peephole/reference/02-eye-at-the-hole.jpg)

![Panel 9](../games/behind-the-peephole/reference/08-the-mosaic.jpg)

![Panel 13](../games/behind-the-peephole/reference/11-the-knock.jpg)

## 3. Missing Campsites

Three days in first-person 3D on a loop that loses sites between scenes; every record is checked on a 1D paper page (push-in from a table, a fire or the booth counter, pull-out back), and each night walk flattens to a top-down torchlit 2D loop. After the crossing the lost sites come back as tree glyphs in the 2D pattern walk, and the run ends in 3D at whatever the five sites held.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `booth_day1` | 15:10, the van at the booth window; dust in the sun | Marisol hands over the paper map: "You're at the far end. Twenty through twenty-four." | Cut | [01-entrance](../games/missing-campsites/reference/01-entrance.jpg) |
| 2 | 3D | `loop_day1` | The loop road ahead of the idling van; the map lens raised | Posts 1–3 printed on the map, forest floor on the ground. "They just don’t exist." Photograph site 7 for Agnes | Cut |  |
| 3 | 1D | `reconcile_1` | The paper map and legend beside the notebook's Sites page | Three rows: Here, Gone, or Unknown, each written in Tam's hand; the first forecast | Pull-out |  |
| 4 | 2D | `torch_loop_1` | From above, a circle of torchlight on the road | Tick posts 19 to 4 down to the payphone; on the walk back 4, 5 and 6 are dark ground | Flatten | [03-torchlight-loop](../games/missing-campsites/reference/03-torchlight-loop.jpg) |
| 5 | 1D | `pack_list_1` | The fire ring from above, seats as cards | "I packed my bag." A blue kettle nobody added: catch it, or repeat it | Pull-out |  |
| 6 | 3D | `booth_day2` | Grey noon at the booth; the west leg ends at 12 | Marisol: "Numbering's always started at twelve." Write it down or accept | Push-in on the logbook |  |
| 7 | 1D | `rangers_book_1` | The logbook open across the page | Totals that do not add up; rebuild three missing rows | Pull-out |  |
| 8 | 3D | `dusk_choice` | Blue hour at the edge of site 20, the van | Rafe gives Tam the keys. No one is asked to stay; the Ashbys' lantern at 17 | Flatten | [08-five-sites](../games/missing-campsites/reference/08-five-sites.jpg) |
| 9 | 3D | `wrong_forest` | The five sites in even pearl light, trees beyond | "The sky is wrong." The phones show "no signal, no time, no date" | Push-in | [09-the-other-side](../games/missing-campsites/reference/09-the-other-side.jpg) |
| 10 | 1D | `foil_supper_3` | The camp table and cooler from above | Last breakfast from what came across, and things nobody packed | Pull-out |  |
| 11 | 2D | `pattern_walk_1` | From high above, sites 19 to 12 as glyphs of trees | Follow the path the trees spell by the Sites page; a wrong step whites out | Pull-out |  |
| 12 | 3D | `other_entrance` | An empty booth, a rack of maps showing 24 sites; headlights | Slipped Through: a car pulls in, and Tam says "You're at the far end. Twenty through twenty-four." | Fade |  |
| E | 3D | `other_entrance` | The guest at the booth window in the car's headlights | Brought Along: someone at home no longer knows to wait | Fade |  |
| E | 3D | `mothers_door` | Agnes's door in the evening | Held: Tam reads the site 21 line; Agnes: "That sounds like a lovely place." She does not know Tam | Fade |  |
| E | 3D | `drive_home` | The van on the highway; the notebook on the dash, shut | Nothing Missing: a seat with nobody in it; the radio gives the date | Fade |  |
| E | 3D | `recital` | A school hall, second row, a programme on the empty seat | The One Who Left: the notebook at Rafe's page: "Rafe. Four o'clock Monday. That's all I've got." | Fade |  |

![Panel 1](../games/missing-campsites/reference/01-entrance.jpg)

![Panel 4](../games/missing-campsites/reference/03-torchlight-loop.jpg)

![Panel 8](../games/missing-campsites/reference/08-five-sites.jpg)

![Panel 9](../games/missing-campsites/reference/09-the-other-side.jpg)

## 4. The Redacted Testament of Lira Calyx

A 3D cold open in the archivist's tunnel pushes into the journal, and each of Lira's four books then walks 3D places that push in to 1D journal pages and flatten into 2D cross-sections or the lens. After the choice on the Node Board, the playable epilogue hands the book to the archivist, and the run ends at one of four desks, the author's own last.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `co-tunnel` | A lamp cone in fresh rubble under Peak 12; the journal lies open | Dust falls on a 7-second rhythm; the last line is torn: "the Peaks are—" | Push-in on page 1, which becomes the terrace | [14-the-torn-journal](../games/lira-calyx/reference/14-the-torn-journal.jpg) |
| 2 | 3D | `b1-terrace` | Hollin Terrace by day, three tiers over a rope bridge | Lira counts Ridgeback Striders with Pell and sets the flood-siren baseline; Joren shows the relay mast | Push-in on the specimen shelf | [01-terrace](../games/lira-calyx/reference/01-terrace.jpg) |
| 3 | 1D | `b1-key-1` | The Key: a specimen card and a branching key in Lira's hand | The juvenile Ember Wolf pelt breaks the key; Lira writes a new couplet | Pull-out |  |
| 4 | 3D | `b1-valley` | Night; Spore-Weaver webs pulse cyan across the valley | Pulsing "like a single organism": Pattern α, node N1. Page 47: "Phase offset miscalculated. Re‑sample at 0.5 s resolution." "Who wrote this?" | Flatten | [02-pattern-alpha](../games/lira-calyx/reference/02-pattern-alpha.jpg) |
| 5 | 2D | `b1-climb` | The mountain in cross-section, the altitude scale filling | Juvenile Ember Wolves at 2,600 m, too high; at the top, the Aether-Vine azimuth: node N2 | Fade |  |
| 6 | 2D | `b1-lens-1` | Under the lens: the fragment's micro-filaments scroll past | Steer the focus down to a lattice too regular to be natural | Pull-out |  |
| 7 | 1D | `b2-assay-2` | The Assay: a spectrum strip and a cuvette from a Lowland well | Isotope ratios that are not natural: "evidence of deep‑earth seeding", node N5 | Pull-out |  |
| 8 | 3D | `b2-lab` | The corporate lab after hours, guard lamp cones in blue-white halls | The scrap behind the console: "She’s close. Move the logs." | Push-in on the fragment under the lab pulse |  |
| 9 | 1D | `b3-cipher-2` | Storm-Song Cipher: Mara's song on a staff beside the peak map | The Peakborn "sing phase offsets that match AFU spikes"; the song decodes into nodes N7 and N8 | Pull-out |  |
| 10 | 3D | `b3-city` | The subterranean city in core glow; a hooded archivist in the record hall | A misfiled coordinate card in the margin hand; Joren leads the guards in; Lira runs with the Second Genesis logs | Flatten |  |
| 11 | 3D | `b4-core` | The crystal cavern under Peak 12, Veylor by the emitter array | "the old world was weak; a hard reset is a mercy." | Push-in on the board table | [12-the-core](../games/lira-calyx/reference/12-the-core.jpg) |
| 12 | 1D | `b4-board-core` | The Node Board: twelve nodes on a contour map, Veylor's seeds hidden | Place the emitters; at the end, Trigger the pulses | Pull-out |  |
| 13 | 3D | `b4-collapse` | Strobing core light down 200 m of shearing tunnel | Some nodes damp, others amplify; a partial fracture; Lira cornered at a sealed exit as her lamp goes out | Fade |  |
| 14 | 1D | `ep-audit-3` | Journal Audit as the archivist: eight spreads, twelve black bars | Restore the testament; decide which names stay black | Pull-out |  |
| 15 | 3D | `end-written` | The archivist's desk under a single lamp | "If you are reading this, you are a target." Close the book or keep going; a knock | Fade |  |
| E | 3D | `end-in-time` | A safe room in morning light | The archivist reached her at the north shaft; Lira writes her name on the cover; "You are one of us now." | Fade |  |
| E | 3D | `end-resilience` | A sterile Continuum catalogue hall | She stood down; the Peaks reset; Lira catalogues the new world under the seal | Fade |  |
| E | 3D | `end-fire` | Ash over the rubble of the Mid-Slope terraces | Kade's charges took the core; the archivist digs the books out beside silent water lifts | Fade |  |

![Panel 1](../games/lira-calyx/reference/14-the-torn-journal.jpg)

![Panel 2](../games/lira-calyx/reference/01-terrace.jpg)

![Panel 4](../games/lira-calyx/reference/02-pattern-alpha.jpg)

![Panel 11](../games/lira-calyx/reference/12-the-core.jpg)

## 5. WrymWretch

Six one-pair prologues, each a 3D realm that pushes in to its own 1D game or flattens into a run or flight, then the party gathers at Wrymreach, and Act III (added) ends at the choice in the heart of the wound. None of the four endings is the author's; a first run that keeps watch ends in The Rememberer.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `s_cedar_grove` | Thalen at a tree split from within, black ichor, moss greying | The moss falls to dust "that didn’t even remember how to be soil" (WW 33); "Western Groves" fades on the map | Flatten | [01-the-split-tree](../games/wrymwretch/reference/01-the-split-tree.jpg) |
| 2 | 1D | `s_conc_ward` | Cards of the fevered sky-elves' faces and names | Concentration I: match each face to its name before it blanks, as "Remember me." (WW 49) threads the wind | Pull-out |  |
| 3 | 1D | `s_heart_rekindle` | The dying Heartstone and a tuned shard | Heartstone I: Rhyla keeps one memory: the founding, the vision, or the Stonekeepers' song | Pull-out |  |
| 4 | 3D | `s_seabed` | The seabed in lantern light, a monolith in the silt | Lunessa swaps lantern-crystals to reach "a monolith carved with symbols her mind refused to hold" (WW 71) | Push-in on the monolith | [06-the-monolith](../games/wrymwretch/reference/06-the-monolith.jpg) |
| 5 | 1D | `s_glyph_monolith` | The monolith's face as a page of slipping glyphs | The Slipping Glyph I: three rows read by what stays; the fourth cannot be read | Flatten |  |
| 6 | 3D | `s_forbidden_chamber` | Candles flare over a pedestal of bone | Kael reads "When the last memory fades, the Astral Architect shall rise." (WW 77); THE NAME enters the Record | Cut |  |
| 7 | 1D | `s_chart_priory` | The Priory's star dome as a chart | Star Chart I: as the third constellation closes, the lines become "The Sigil of Izladar." (WW 87) | Pull-out |  |
| 8 | 2D | `s_flight_six_roads` | Side-on: six pairs over a fading painted map | Twin flight VII: each pair flies its own road, then all six in formation through gates that need the right dragon in front | Flatten |  |
| 9 | 3D | `s_rim` | The Rim of Wrymreach: astral winds, wyrm bones, the six landing | The six meet and name themselves; a shared dream scouts the ambush | Cut | [11-wrymreach](../games/wrymwretch/reference/11-wrymreach.jpg) |
| 10 | 1D | `s_realms_stonekeepers` | The hex board at a Moot elder's table | Six Realms II: one watch of the night spent winning a tribe's trust | Pull-out |  |
| 11 | 2D | `s_run_bone_bridge` | Side-on: a bridge of wyrm ribs erasing behind | Forgetting run III: escort Ilvarra across before the Remnants unwrite it | Push-in on Ilvarra's memories |  |
| 12 | 3D | `s_choice` | The heart of the wound, the King and Queen's statues | Three answers: keep watch, speak his whole name, give back the bond | Fade | [14-the-veil](../games/wrymwretch/reference/14-the-veil.jpg) |
| 13 | 3D | `s_end_rememberer` | The keeper pair alone with the statues, years after | The Rememberer: one pair stays to hold the name; the seal holds and the world slowly remembers | Fade |  |
| E | 3D | `s_end_whole` | The six realms in whole colour | Remembered Whole: the world remembers who he was; the voice finishes its sentence; the dead stay dead | Fade |  |
| E | 3D | `s_end_dormant` | Six realms, one shot each, no dragons | Dormant Again: the bonds are given back; Thalen tracks a silver-antlered stag, alone | Fade |  |
| E | 3D | `s_end_architect` | The sky above the realms, full of nameless stars | The Architect Rises: too much was forgotten, and the shape Rhyla saw steps through | Fade |  |

![Panel 1](../games/wrymwretch/reference/01-the-split-tree.jpg)

![Panel 4](../games/wrymwretch/reference/06-the-monolith.jpg)

![Panel 9](../games/wrymwretch/reference/11-wrymreach.jpg)

![Panel 12](../games/wrymwretch/reference/14-the-veil.jpg)

## 6. Project: Man Eater

Seven days on one clock, then one of four endings: each day the 3D base pushes in to a 1D page (the Chart, the Tray, Floor Plan, Short Rations) and pulls back out, and each night the bunk door flattens into a 2D run (Silhouette halls or Snow line) that fades to morning or pulls out into a 3D place. This first run eats what is served and follows the call with Jax on night 7 to The Zoo; the other three endings are the E rows.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `c1_truck_gate` | From the truck bed: snow, the gate opening, armour plates bolted on its inside | "the facility is heavily armored but not to keep things out, but instead to keep them in." The list's first entry | Cut | [01-the-base](../games/man-eater/reference/01-the-base.jpg) |
| 2 | 3D | `c1_halls` | A hall at 1.66 m eye height, Sam ahead, claw marks high up, a lever at 2.4 m above a brass knob | "each about 4 feet wide but a whopping 15 feet high." | Cut | [02-tall-halls](../games/man-eater/reference/02-tall-halls.jpg) |
| 3 | 3D | `c1_bunk` | The bunk room; the rules card screwed to the door at the lever's height; the bunkmate already in his boots | Sam gives the three rules, word for word | Fade |  |
| 4 | 1D | `d1_tray` | The Tray: five pieces of pale meat, a timer, no orderly yet | "He didn't enjoy the taste, but he wanted more." Then the loaf: "They gave him a loaf of bread, which made him feel full" | Pull-out |  |
| 5 | 1D | `d1_rations` | Short Rations at a round table, six seats | Play for bread; the first bunkmate slides his to Fisk | Pull-out |  |
| 6 | 3D | `n1_bunk_call` | The bunk at night, the clock face at 10:00, breath in the air | "Low melodic groaning, almost flute-like". "Stop him" and "Say something" fade unpressed: "Fisk didn't even try to stop his bunkmate." | Fade |  |
| 7 | 2D | `n2_halls` | The tall halls side-on, black silhouettes against moonlit cream walls | Night two: past one guard to the latrine; a wet print 40 cm long freezes as Fisk watches | Fade | [06-silhouette-halls](../games/man-eater/reference/06-silhouette-halls.jpg) |
| 8 | 2D | `n3_snow` | The yard from above, the searchlight sweeping, Fisk's prints behind him | Snow line to the kennel shed: collars on hooks, the first bunkmate's boots, laces still tied | Fade |  |
| 9 | 1D | `d4_floorplan` | Floor Plan: the ground floor drawn from memory, its east side open | The halls do not close: 18 to 24 paces are missing | Pull-out |  |
| 10 | 1D | `d5_chart` | The Chart, the orderly's clipboard left on the scale | Fisk's numbers sit on a printed target curve, marked *on schedule* | Pull-out |  |
| 11 | 3D | `n7_windigo` | Night seven, round the last corner with Jax: a long pale shape backlit against frost, 6 m off | "Beware the Windigo, for I am he. Follow in my footsteps, and you will become me." A gust of mist; cloth, gas, black | Fade | [09-the-flute](../games/man-eater/reference/09-the-flute.jpg) |
| 12 | 3D | `e_cave` | Tied to a stalagmite, the camera fixed; Sam steps out of the dark at 4 m | Fisk: "We are not Windigos, nor will a single man in his right mind eat another human." Sam: "we won't make the same mistakes as we have with the rest." | Fade |  |
| 13 | 3D | `e_zoo_wake` | A white room; the camera cannot rise; Fisk's reflection in the door's small window, very tall, very thin | The Zoo (as written): "A tube ran through his arm." Caption: "He was like an animal in a zoo..." | Fade |  |
| E | 3D | `e_tree_line` | Dawn under the trees beyond the wire; Fisk's head among the low branches | Rule Three: his hands are not a man's; if Jax came, his prints stop in the snow behind. "Deep down, this would only spread." | Fade |  |
| E | 3D | `e_new_recruit` | The gate and the tall halls, a new recruit walking ahead; Sam at the hall's end | Call Me Sam: Fisk gives the three rules; the recruit answers "Sir yes Sir"; Sam nods | Fade |  |
| E | 3D | `e_transfer_truck` | From the truck bed, the gate closing, armour facing in | Transferred: too weak to be called, Fisk is driven out. If Jax is still on base, Sam in the hall: "your former bunkmate has been transferred, and he will no longer be stationed here." | Fade |  |

![Panel 1](../games/man-eater/reference/01-the-base.jpg)

![Panel 2](../games/man-eater/reference/02-tall-halls.jpg)

![Panel 7](../games/man-eater/reference/06-silhouette-halls.jpg)

![Panel 11](../games/man-eater/reference/09-the-flute.jpg)

## 7. A Journey Into the Heartstream

One unbroken session on the heartbeat clock: the marrow chapters hand each 3D place to a 1D page by push-in and take it back by pull-out or cut, the climb and the river flatten into 2D, and the heart cuts each player to red and his own ending. Endings resolve per player as each client leaves the session, so one raft usually ends several ways at once.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `s3_marrow` | Blue-lit marrow caverns breathing at 60 bpm; the hall of unfinished boards; the mark stone | The brothers wake, learn the pulse, choose a mark and a temperament | Push-in on the carving slab | [01-marrow-caverns](../games/heartstream/reference/01-marrow-caverns.jpg) |
| 2 | 3D | `s3_gallery` | The shedding gallery, chalky light, bone blanks on soft ledges | Find a good blank and your recipient's mark | Push-in on the blank |  |
| 3 | 1D | `s1_carve_gift` | A bone blank seen from above, grain lines, the chisel, notches for strokes | Too few strokes to make the tool perfect; cut his mark or not; then the exchange in the gallery | Pull-out |  |
| 4 | 1D | `s1_song_1` | A membrane of vertebra-like slots, each brother's phrases as beads | Compose verse one from the phrases hummed out of the singing hollow; everyone presses Sing | Cut |  |
| 5 | 1D | `s1_counters_2` | The bone board from above, your carved piece in your keep | Sow on the beat; mid-sowing, "The marrow lights dim."; one beat to pocket your piece or leave it | Fade |  |
| 6 | 3D | `s3_recognition` | The cavern of the elders dimming to 30%; arms reddening; the shaft opening; one empty seat on the bench | "The elders gather." Walk to the shaft and climb, or sit and stay; nothing prompts either | Push-in on the shaft mouth | [05-recognition](../games/heartstream/reference/05-recognition.jpg) |
| 7 | 2D | `s2_climb_2` | The shaft side-on, small figures, heat shimmer at the top edge, blue tint turning red | Holds firm only on the beat; brace and pull each other over the ledges | Flatten |  |
| 8 | 3D | `s3_river` | Crimson water between artery cliffs; the living raft at the bank | "It is not a tube. / It is a river." Board the raft, row and steer on the beat; one calm pool to talk | Flatten | [07-the-bloodstream](../games/heartstream/reference/07-the-bloodstream.jpg) |
| 9 | 2D | `s2_river_2` | The river in cross-section: raft above the surface line, glassy predators below, one beast's slow eye | The first patrol: row on the beat, lift from tendrils, hush when the eye opens | Flatten |  |
| 10 | 1D | `s1_chart_2` | Vellum membrane, vessels in red ink branching from the raft's glowing point | At the delta, three junctions, less time; each brother sets his piece on a branch; the raft keeps moving | Pull-out |  |
| 11 | 1D | `s1_song_2` | The membrane cut to four slots, the heart verse | Compose the verse that must end on height 1, home; its last note is the one to hold on | Flatten |  |
| 12 | 3D | `s3_heart` | The atrium: walls of muscle, beams of light, red turning gold | "The heart is not a chamber. / It is a cathedral." The song is sung back; grips drain and fail one per beat; voices are cut | Cut | [10-the-heart](../games/heartstream/reference/10-the-heart.jpg) |
| 13 | 3D | `s3_vessel` | A narrow vessel, one red glow; the player alone, holding the tool another carved for him | Carried Away (as written): the heart slows; "No one stays together." | Fade |  |
| E | 3D | `s3_vessel_two` | A shared chamber, two hands locked, two gifts, two glows | Two Together: they squeezed on the heart verse's last note; they hear each other and no one else | Fade |  |
| E | 3D | `s3_vessel` | The same narrow vessel, reached from inside the beast | Taken by the River: he watched the raft's glow draw away and rides on alone, still holding his gift | Fade |  |
| E | 3D | `s3_lamps` | The marrow lamps years on; a new group asleep in the alcoves; his group's unfinished board in the hall | The One Who Stayed: still blue, he dims the lamps; the child he taught may hold his counter and hum the song | Fade |  |

![Panel 1](../games/heartstream/reference/01-marrow-caverns.jpg)

![Panel 6](../games/heartstream/reference/05-recognition.jpg)

![Panel 8](../games/heartstream/reference/07-the-bloodstream.jpg)

![Panel 12](../games/heartstream/reference/10-the-heart.jpg)

## 8. People of the Bark

One year on the bark, Tremor to Shadow, seen from the 3D god camera, which pulls back on Tab to show what really happened. Each event pushes in to a 1D bark-paper page and pulls back out, the cracks flatten into side-on 2D runs and defences, and the last pull-out rises to the backyard.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `c1_city_dawn` | God camera on Highridge's grooves at dawn, glow-lichen lanterns | Wake the city, free Twig's kite, place the first sap tap; at 4:30 the Tremor, dust in sheets | Cut | [04-the-city](../games/people-of-the-bark/reference/04-the-city.jpg) |
| 2 | 3D | `c1_battlements` | Splinterwatch in dust-gold, shaking; then the camera rises to the trunk | Six warriors to the slots; first pull-back: "Meanwhile, the squirrel is just scratching an itch." | Push-in on Pell's spread | [01-the-tremor](../games/people-of-the-bark/reference/01-the-tremor.jpg) |
| 3 | 2D | `c2_run` | Side-on down the Long Crack to Lowridge | Mossa carries the year's reading; brace for the dawn tremor if the forecast was right | Flatten |  |
| 4 | 1D | `c2_kitchen` | Sap Kitchen: Old Resin's pot on bark-paper | Cook the spring sap into food; the Great Flake legend while it boils | Pull-out |  |
| 5 | 2D | `c3_beetle` | Crack defence, side-on: a beetle the size of a city in the crack | Read as monster, hold the lines; read as god, clear a lane and lay offerings | Flatten | [08-crack-defence](../games/people-of-the-bark/reference/08-crack-defence.jpg) |
| 6 | 1D | `c5_door` | The Ring Door: the Heartwood Door, five rings | Lay Pell in the heartwood and carve the living tree, or leave it sealed | Pull-out |  |
| 7 | 1D | `c5_tns` | Trunk and Shadow board at the winter festival | Twig adds a new piece, the Hand; winning rehearses the Shadow | Pull-out |  |
| 8 | 1D | `c6_scroll` | Tremor Scroll in late winter | A faint ripple at noon every seventh day, on all faces: forecast the next tread | Pull-out |  |
| 9 | 3D | `c6_shadow` | Zoom forced out; the dark crosses the bark west to east in 40 seconds | "It is enormous, stretching across their entire world." People to the knots; pull back: a hand, reaching | Flatten | [10-the-shadow](../games/people-of-the-bark/reference/10-the-shadow.jpg) |
| 10 | 1D | `c6_omen` | Omen Spread: the Reading of the Shadow | The heir lays one card of each sigil: a trial | Pull-out |  |
| 11 | 3D | `c6_stand` | Highridge and Splinterwatch in the dark, lit only by lanterns | The priests chant, the warriors stand ready, the scholars record | Cut |  |
| 12 | 3D | `c6_touch` | All the bark; the screen shakes on each tap | Three taps, a thumb pressed into a crack; it lifts away and light returns from the east | Pull-out |  |
| 13 | 3D | `c7_backyard` | The camera rises past the tree over an ordinary yard | A door closes; "Even the smallest world is a universe to the ones who live in it." | Fade |  |
| E | 2D | `c6_war` | Crack defence reversed: footholds up the knuckle | The War on the God: the warriors climb, Burr strikes the fingertip; the lost go on the Roll | Flatten |  |
| E | 3D | `c6_edge` | God camera following Fenn's party along the shadow's edge | The Edge of the World: twelve stakes trace the Shadow's outline; Fenn draws the first map with an edge | Cut |  |
| E | 3D | `c6_touch` | The over-tapped plate from the people's side | The Flake: the press breaks the plate and a district comes away; cut before the fall | Pull-out |  |

![Panel 1](../games/people-of-the-bark/reference/04-the-city.jpg)

![Panel 2](../games/people-of-the-bark/reference/01-the-tremor.jpg)

![Panel 5](../games/people-of-the-bark/reference/08-crack-defence.jpg)

![Panel 9](../games/people-of-the-bark/reference/10-the-shadow.jpg)

## 9. The Endless Temple

A temple hub in first-person 3D, where every brew is a 1D page that pushes into a book and every book is left by a pull-out back to the halls; inside the books, 3D flattens into the living illustration, and the hub's stacks flatten into 2D before pushing in on a clasp. The first playthrough ends on The Named Book; the other three endings branch at the herd and at the last cup.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `s3_abyss_dream` | First person on a rock edge, blue-grey mist, near-black | "For in the great darkness, no light can be found…" A step past the edge | Fade |  |
| 2 | 3D | `s3_room_morning` | A sunbeam across the floor of a cluttered room, onto Elaris | Elaris wakes, an 8-foot elf in monk's attire | Cut | [01-elaris-wakes](../games/endless-temple/reference/01-elaris-wakes.jpg) |
| 3 | 1D | `g_tea_c1` | The pantry table from above: three jars, the cup, the kettle dial | The first cup for the nameless sand book: depth 3 or more | Push-in on the page |  |
| 4 | 3D | `s3_circle` | Firelit round hut, first person as Xandri among the children | "My hand shot up almost by instinct." The cane: "We do not ride on the backs of the gods." | Cut | [05-storyteller-circle](../games/endless-temple/reference/05-storyteller-circle.jpg) |
| 5 | 3D | `s3_moonlit_dunes` | Silver sand, purple vines, a wave of sand rising, seen in third person as the tea fades | "The sand washed forward like a crashing wave of water." The first mark | Pull-out to the halls | [07-the-sand-sea](../games/endless-temple/reference/07-the-sand-sea.jpg) |
| 6 | 2D | `s2_stacks_c3` | The stacks side-on, shelves without end, sand motes drifting | Follow the sand to the clasped shelf | Push-in on the clasp |  |
| 7 | 2D | `s2_li_c4a` | The book's drawn page: Xandri riding torrent waves on leaf shoes | Ride the leaves "that looked like the ears of the Zorlop" through the heat | Flatten | [08-living-illustration](../games/endless-temple/reference/08-living-illustration.jpg) |
| 8 | 1D | `g_tablet_c6` | The gods' rules tablet, eight rules, the Way tiles below | Leaves + follow the track + be named lost: the loophole, breaking no rule | Pull-out |  |
| 9 | 1D | `g_clasp_c8` | The black book's cover, frost on its straps, bolt and gears | Open the compound clasp: the Lantern Country (F6) | Pull-out |  |
| 10 | 2D | `s2_li_c9` | The herd's smooth track past the father's marker; the drawing runs off the right margin | Xandri follows the track past his father's mark | Push-in on the title page |  |
| 11 | 1D | `g_name_c9` | The sand book's title page, empty cartouche, sand in the gutter | Elaris reads it back "and find out what to call it": Inscribe | Pull-out |  |
| 12 | 3D | `s3_last_cup` | Seated at the reading chair, the cup in his hand | The tea thins: set the cup down | Fade |  |
| 13 | 3D | `e_named` | The shelf, the named spine beside yesterday's book | The sand stops; he shelves the book | End |  |
| E | 3D | `e_stayed` | The chair from across the room, the book open, the cup full | He drank with steep at 60 or more: nobody watching, a second book leaks | End |  |
| E | 3D | `e_rider` | The title page writing itself in a hand not Elaris's | Xandri climbed a Xandrix and rode into white; he does not come home | End |  |
| E | 3D | `e_returned` | The temple, the nameless book still sifting sand | Xandri turned back and became the storyteller; Elaris sweeps the sand | End |  |

![Panel 2](../games/endless-temple/reference/01-elaris-wakes.jpg)

![Panel 4](../games/endless-temple/reference/05-storyteller-circle.jpg)

![Panel 5](../games/endless-temple/reference/07-the-sand-sea.jpg)

![Panel 7](../games/endless-temple/reference/08-living-illustration.jpg)

## 10. The Lord of the Sea

The two source chapters play in 3D, then the voyage moves between the layers: 3D pushes in on a deed, a dice table, a chart or a board to reach the 1D games, and flattens side-on for the Engraved Sea and the Deep. Everything turns on the tally at the chart table and the final Tea Board match, and the board ends back at the tideline it began at, where one choice after a win settles the ending.

| # | Layer | Scene | Shot | Beat | Into next | Still |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3D | `s-cabin-dawn` | The cabin at sunrise, bottles rolling, the walls crowded with a life | The first stir: the bottles chime into a wrong little tune | Cut | [01-the-cabin](../games/lord-of-the-sea/reference/01-the-cabin.jpg) |
| 2 | 3D | `s-beach-tideline` | Low camera at the tideline, water spiralling round his ankles | The sea answers; "A man between worlds." | Cut (to the chapter card) |  |
| 3 | 3D | `s-beach-princess` | A sand-covered princess and a hungover man who has just run into her | “Alexi!”; the collision; “Tea has a lord.” / “Everything has a lord,” she said. | Push-in on the deed | [03-the-princess](../games/lord-of-the-sea/reference/03-the-princess.jpg) |
| 4 | 1D | `g-charter-deed` | The Charter: the sale deed of the halls | Tutorial: find the clause that reaches the sea, "and all waters adjoining" (added); nothing can be struck yet | Pull-out |  |
| 5 | 2D | `e-cutter-heave-to` | Engraved Sea: a revenue cutter, a convoy, his stir a ripple | No power to fight: hide in the convoy's lee | Push-in on the tavern table (Tidewater) |  |
| 6 | 1D | `g-liars-tidewater` | Liar's Tide with Wenna and two dockhands | Dice for news of crews that still sing | Cut |  |
| 7 | 1D | `g-reckon-unwritten` | Dead Reckoning: dividers and tide tables in fog | Plot a leg off the chart's edge to the Unwritten | Flatten |  |
| 8 | 2D | `e-first-squall` | Engraved Sea: a wave under the cutter, the Gullwife crew singing | Devotion is power: the first weather Alexi has made in a long time | Fade | [05-engraved-sea](../games/lord-of-the-sea/reference/05-engraved-sea.jpg) |
| 9 | 3D | `s-cabin-tally` | The cabin by night lamp, the walls full, the chart table | After the four regions and the halls: the tally counts the wild regions; the narrator's slot | Flatten |  |
| 10 | 2D | `d-under-pilings` | The Deep: under the counting-house wharf, through mooring chains | With four or more regions wild, he goes under and comes up between the pilings | Push-in on the board |  |
| 11 | 1D | `g-tea-final` | The Tea Board against the Lord of Tea | The final match; he wins | Fade |  |
| 12 | 3D | `s-tideline-final` | The same beach at dawn, Alexi standing in the water | Keep the sea, or give it up: he gives it up | Fade |  |
| 13 | 3D | `s-end-no-lord` | Dawn, plain light, the dinghy | No Lord (the default): an ordinary man rows in with blistered hands; the Gullwife crew sings the hymn and he does not look round | End |  |
| E | 3D | `s-end-charter` | Dawn on the bay, half glassy, half moving; the ferry crossing a lane | The Charter: terms signed at 4–4 with the princess; the toll read out as the reason for the lanes | End |  |
| E | 3D | `s-end-wild-sea` | Alexi on the bowsprit in a storm he made, moorings lifting on the coast | The Wild Sea: he keeps the sea; every crew sings, and the toll is sung by name | End | [11-the-open-sea](../games/lord-of-the-sea/reference/11-the-open-sea.jpg) |
| E | 3D | `s-end-lords-peace` | Flat noon on the beach, buoy bells, a bottle in his hand | The Lord's Peace: he stirs the water at his ankles and nothing happens; the narrator says nothing | End |  |

![Panel 1](../games/lord-of-the-sea/reference/01-the-cabin.jpg)

![Panel 3](../games/lord-of-the-sea/reference/03-the-princess.jpg)

![Panel 8](../games/lord-of-the-sea/reference/05-engraved-sea.jpg)

![Panel E](../games/lord-of-the-sea/reference/11-the-open-sea.jpg)

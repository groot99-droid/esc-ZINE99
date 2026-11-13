# Lines added in the refine pass — for the author to keep or strike

Written 2026-11-13. Every line below was written for the games and is not the author's text, except where marked as a verbatim quote already in DESIGN.md. New rules and retuned numbers are listed too.

---

# behind-the-peephole

## Behind the Peephole: narrative lines added in the refine pass

None of these lines quotes the source. The only source quotes used are ones DESIGN.md section 3 already
quotes: "You never see their missions. / You only see their return." (loading.js, unchanged) and
"Their stories overlap. Their secrets rhyme. Their patterns converge." (mosaic.js, win ending).
Clue-card texts come from data/beats.json and are not listed. Lines marked (DESIGN) are character
lines already written in DESIGN.md section 6, reused here. Mechanical UI help text (key legends,
"Overset. Let the tension go…") is left out.

## web/games/behind-the-peephole/eye-at-the-hole.js
- Opening: "Night one, 23:34. Lew has gone back down the stair. The bell rang twice: 402 is on her way up."
- Goal: "Catch five of the six things she does tonight, without being felt."
- On start: "The keycard is at her lock. Find her hands."
- First catch: "Your pencil moves before you think. The log has its first line."
- 00:05: "She has come to the door to switch the set off. Do not be the dark she notices."
- 00:24: "She sleeps. The quiet hours go by on the watch's second hand."
- 02:14: "A knock at 2:14, at her main door, not yours. Feet go away down the hall. She does not open it."
- Unlock: "Crouch (C) to the gap under the valet door. She never feels it, but it sees only the floor."
- Unlock: "Your pocket watch: the night so far, and what is still to come. Raise it with Tab."
- Unlock (02:14): "The envelope lies on the carpet. The gap sees the floor."
- Subtitle: "[the television clicks off. She is close enough to hear breathing]"
- Subtitle: "[the lamp clicks off]"
- Subtitle (changed): "[a knock at her main door: two quick, one slow]"
- Step back in time: "You stepped back in time. She saw only brass."
- Full look: "She looked straight into the rose. Something in her face decides."
- Watch: "Something is happening now." / "Next: about HH:MM." / gentle: "Try the gap." / "Look where her hands are."
- Gap caption: "THE GAP UNDER THE VALET DOOR · she never feels it"; stepped back: "the rose lets its light through" (existing)
- End, blind: "She hung a towel over the rose; the rest of 402's night is terry cloth, and she will remember the dark behind the door. N of 6 in the log. …"
- End, win: "N of 6 lines in the log, and she never knew the rose was looking. …"
- End, done: "N of 6 in the log: enough for Wren, not enough for you. …"
- End, lose: "She was home three hours and the log has N lines. … Hold the eye still where her hands are, and use the gap when she stares."

## web/games/behind-the-peephole/corridor-race.js
- Opening: "Night two, 01:00. Dora's trolley is at the stair end and three guests are still out. The bell will tell you who, and when."
- Goal: "Be at each door as it opens: 401, 405, 406. Dora must not see you twice."
- 01:01: "Wheels at the stair end: Dora, with the linen. She doesn't speak to you. She tells Lew."
- 01:30: "The trolley goes down in the service lift. The passage is yours again."
- First threshold: "There. The door opens on someone who doesn't know you were waiting."
- 02:00: "Two bells inside a quarter hour, ten metres apart. Choose your floor."
- Unlock: "The pipe run, +0.60 under the light-well windows: nobody sees you up there. ▲ / W."
- Unlock: "Loose boards ahead, 38 to 41 m. Walk them, or hop one: Space."
- Unlock: "Between bells, an occupied rose is a glimpse for the log: hold E at its door. They feel it."
- End, seen twice: "Dora saw you twice and told Lew, and Lew told Wren. His next call keeps you on the line: tomorrow's shift starts at 23:15. …"
- End, ≤1 caught: "The bells rang and the doors opened without you. … Run the long stretches, walk the boards, and stand at the rose before it opens."
- End, win: "Every door, on time, and nobody felt the passage. …" (existing sentence)
- End, done: "… But 4xx covered the rose: someone behind that door now knows the dark has an eye in it." / "One door opened on an empty passage."

## web/games/behind-the-peephole/lockwork.js
- Opening: "Night three, 00:50. The stair door at the far end of the passage, locked from your side. Lew said only: \"Stair door's locked from your side. Someone's idea.\"" (Lew's line: DESIGN)
- Goal: "Set all five pins on the shear line S before your picks run out."
- First set: "Click. One of five. The brass is colder than the passage."
- Spool: "A false set. The plug gives, and lies to you. Ease off and lift again."
- Rake unlock: "The rake is in the roll: a stroke across every pin at once. Fast, and it does not care which pin it oversets."
- Three set: "Somewhere below the door, a steel box takes a page with a soft knock. Something has gone down the chute tonight already."
- Four set: "One pin left. Your hand is steadier than it was on night one."
- Plate texts: "PAT. No. 4·0·3", "Inventor: the night clerk"
- Feel readings: "stiff. This one binds." / "stiff, with a give in it. It binds, and it is a spool." / "springy. Not this one yet." / "No tension on the plug: every pin feels the same."
- End, win: "The plug turns and the stair door opens on the back stair, and the chute's steel box below it. Whoever empties it comes up this way. … Not one overset: a locksmith's opening."
- End, lose: "The last pick snaps in the keyway. The stair door stays locked tonight; it will be there again on night six, with one pick restored, and whatever goes down the chute goes down without you seeing where."

## web/games/behind-the-peephole/statement.js
- Opening: "The morning after night one. The office, the green-shaded lamp, the logbook open at a blank form. Wren wants it on paper before you go home: where each guest went tonight."
- Goal: "Place all six guests: one place to each room. Then sign, once."
- First tick: "The first row in your hand. On the carbon it already reads like a fact. You may ask the cards twice whether a row agrees with them."
- Three rows: "Lew puts his head round the door on his way off shift and leaves you a line, as if it were nothing." (the card itself is Lew's existing line)
- Six rows: "Six rows, six ticks. The pen is on the desk. Once you sign, the top copy goes down the chute and you keep the carbon."
- Signing: "Signed. The carbon takes the pressure of the pen."
- Form header: "FORM S-1 · INSTRUCTIONS TO THE NIGHT AUDITOR"
- End, win: "Six rows inked and stamped. Every return placed, and placed right. The top copy goes down the chute at 05:00; the carbon stays in your drawer, and so does the feeling that someone will read it closely."
- End, done: "N of 6 rows inked and stamped. The rest stay in pencil, struck through, and go down the chute anyway. Nobody calls to ask which."
- End, lose: "N of 6 rows inked. The rest stay in pencil, struck through. Read the closing times against the bell, and the traces against the city, before you sign again."

## web/games/behind-the-peephole/night-patience.js
- Opening: "Night three, 23:00: the quiet before the first bell. The worn deck from your drawer, dealt under six brass numbers. Someone has been in the drawer again."
- Goal: "Bring all fifty-two home, Ace to King by suit."
- After slipped card 3: "Not from this deck. The hand is careful, and it knows the passage."
- After slipped card 4: "Under the last face-down card of the sixth column, another stranger's card. It was put there for whoever got this far."
- New pass: "The stock turns over. The same cards, in the same order, and fewer chances."
- 26 home: "Half the deck home. Six rooms still dark behind the wall."
- End, win: "All fifty-two home in N moves, before the first bell. On the spike, N cards from another deck, in a hand you don't know, and the hand is trying to tell you something." (alt: "a space where the next one will go")
- End, lose: "… whatever lay under the sixth column stays there. The first bell will ring soon."
- End, fold: "You fold at N of 52 and leave the deal as it lies; it will keep until 05:00. …"

## web/games/behind-the-peephole/mosaic.js
- Opening: "The morning after night three. The cork board in the office, under the green lamp: six lives you know only by what they carry home, and six lengths of thread."
- Goal: "Pull at least five threads taut with six lengths."
- First taut: "It pulls taut. A question goes up, and questions are how you learn where to look tonight."
- First slack: "Slack. The thread hangs between two lives that never touched, as far as you know."
- Case card: "A new card goes up: THE CASE. Something came home with 403 that was not there the night before."
- Drost card: "A name goes up that the hotel never says aloud: DROST."
- Two lengths left: "Two lengths left on the spools, and the light in the office is turning grey."
- Reading-panel notes for the non-guest cards: Bonded House "A bonded warehouse on the river embankment, red clay underfoot. The city's traces card puts the clay there."; Case "A flat hard case under 403's bed."; Drost "The name behind the Bonded House."; Photograph "Seen on 401's desk: 403's guest at her own door."; Gala "The Assembly Rooms gala, rehearsing this week."; Stranger "Whoever knocks at 2:14."; You "The night auditor, fourth floor."
- End, win: [source quote] + "You can see it on the cork now, and you can see how little of it is yours to know."
- End, done: "Some of it holds. The rest hangs slack until another night's evidence comes home."
- End, lose: "Mostly slack thread, and few questions to carry into the night. Read the cards before you tie on: the clay, the tag, the phone."

## web/games/behind-the-peephole/loading.js
- No new narrative lines (adds a "TIP ·" label and a percentage bar).

---

# endless-temple

## The Endless Temple refine: narrative lines added for the game

Every line in the LINES lists below was written for the game in this pass and is not a quotation. `{x}` marks a number or name filled in at play. Approve or strike each.

## web/games/endless-temple/living-illustration.js

- `noon`: Noon. The sun stands straight over the sand sea, and the dunes throw only a little shade. Lean back in it to cool.
- `heat`: The heat swims in {my} eyes.
- `sipNew`: The tea is thinning: “I” is becoming “he”. Hold Sip to drink.
- `jumpOK`: {I} let go at the crest.
- `prickle`: Prickles. {I} lose{s} {my} pace.
- `web`: The vines catch the leaves.
- `page`: The page turns. {m} m.
- `ride`: {I} ride{s} the face of the wave.
- `dug`: Dug out, ten metres back.
- `checkpoint`: Three times under. The page turns back to the last checkpoint.
- `sip`: A long green hand brings the cup into the page.
- `empty`: The cup is empty now.
- `winI`: Six hundred metres of torrent waves, and the page turns with Xandri still saying “I”: the tea held at {tea}.
- `winHe`: Six hundred metres, and the page turns, but the tea is down to {tea}: by the end it was “he” who reached the moonlit vines, and the written line that steered.
- `lose`: The tea is gone at {x} m, {phase}. The lines thin to nothing, and the page closes on Xandri mid-stride.
- `gentle`: The cup is fuller this time, with a third sip in it.

## web/games/endless-temple/stacks.js

- `open`: Rain is falling somewhere in the stacks, where no rain should be. The weather book of Hollin is calling, and Elaris goes to find it.
- `first`: Follow the drops. Where they thicken, the way is right.
- `listen`: The drops are harder to read here. Stand and Listen (hold L), and they gather into one stream.
- `ladders`: Rolling ladders on the rails. Grab one (E) and push: it outruns the falling books.
- `wander`: The keeper's mind wanders, and the shelves go on: two more junctions have grown ahead.
- `right`: The drops thicken. Junction {n} of {N} behind you.
- `wrong`: The drops thin out here.
- `bend`: The aisle bends back. The same junction again; the shelves go on.
- `near`: The drops gather ahead. The calling book is close.
- `hit`: A book falls on you. You stagger.
- `winClean`: The weather book of Hollin, found by its own rain: {N} junctions in {t}, with no wrong turn. Its pages are damp under Elaris's long green hand.
- `win`: The weather book of Hollin, found: {N} junctions in {t}, with {w} wrong turn{ws} and {h} falling book{hs}. The shelves behind him have already rearranged themselves.

## web/games/endless-temple/tea-blending.js

- `open`: Morning in the pantry. Three books wait by the reading chair, and the kettle holds six pours.
- `opened`: The page opens. The tea will hold at {hold}.
- `failed`: Below the book's mark: the page stays plain text, and sand runs from the cover.
- `ring20`: The cup leaves a faint ring on the table.
- `ring40`: The ring darkens.
- `taste`: The ledger's margin, in another keeper's hand: taste before you pour. (Taste shows the cup's numbers; three sips.)
- `lastPot`: The last pot. No book asks anything of it. Whatever it binds is the last push on the steep.
- `endLight`: Three books open, and the last cup is light. Elaris sets it down when the clock coos, and the table under it is clean.
- `endEven`: Three books open. The last cup is ordinary; it will let him go when the pot is empty.
- `endHeavy`: Three books open, and the last cup is heavy with binding. The ring on the table is dark, and one more page sounds very reasonable.
- `lose`: The kettle is dry, and “{book}” stays shut. Opened {n} of 3.
- `gentle`: The kettle has been filled to the brim this time, and the ledger is a page ahead.

## web/games/endless-temple/naming.js

- `p1`: The weather book of Hollin lies quiet now that its storm has moved on. It still has no name, and rain beads in its gutter.
- `p2`: The road book. A few grains of sand have got between its pages from the book beside it.
- `p3`: The sand book itself, the one that started it. Its gutter runs with sand.
- `inked`: The ink sets in gold, and the gutter stops running.
- `foreign`: The ink beads and will not take: one of these tiles drifted in from another book.
- `fate`: This book was changed by what happened past the mark. Its name must carry the fate: Wake, or Past the Mark.
- `end`: Three books named, and three gutters dry: {names}. The books rest.
- `inspectNew`: New: Inspect a tile (I) to see which book it came from. Three glances a page.

## web/games/endless-temple/clasps.js

- `open`: The temple keeps some books shut. Elaris carries three of them to the reading table, each clasped a different way.
- `lever`: A slim book from the third gallery, its clasp a bank of five brass levers.
- `strap`: A ruling bound in leather: six straps folded across the cover, one over another.
- `gear`: The last book's clasp is a gear train. The knob turns one way; the latch must turn the other way round to open.
- `frag3`: Inside, a folded letter from another reader.
- `frag4`: Inside, the Wardens of the Shelves' ruling.
- `frag5`: Inside, Keeper Maudric's petition.
- `endPar`: Three clasps, three pages of the past, and hardly a wasted move. Elaris lays the letter, the ruling and the petition side by side, and reads them in order.
- `endOver`: Three clasps open at last, the table scattered with brass. Elaris lays the letter, the ruling and the petition side by side, and reads them in order.

## web/games/endless-temple/rule-tablet.js

- `c2open`: The lizard clan's village, the night Xandri means to leave. His father's leaf-cord and waterskin are in the shrine-store, and the shamans keep the store.
- `c2eye`: A shaman leans on his cane by the well-post, watching the store.
- `c2win`: The cord and the skin come out through the roof-gap at dusk, claimed for his father's house. No rule is broken.
- `c2break`: He takes his father's things, and the clan will remember how.
- `bridge`: Days later, at the edge of the sand sea, the herd passes. The shamans' second tablet is longer.
- `c6open`: The Xandrixes are moving toward the end. Xandri wants to go with them, and every rule of the gods stands in his way.
- `c6eye`: A shadow lies across the tablet's edge. Someone has seen him testing the gods' rules.
- `watcherCarves`: The watcher carves a new rule at the foot of the tablet. The clean way is closed; only Break remains for that plan.
- `c6win`: The leaves, not his foot, press the track; and “or is named lost” is a price he can pay.
- `endWinBoth`: Two tablets, and not one rule broken. Xandri walks behind the gods in their own track, wearing the Zorlop leaves, and lets the clan name him lost.
- `endWinMixed`: Xandri follows the gods' track cleanly, in the Zorlop leaves, named lost by his own choice. Only the shrine-store remembers a rule he broke.
- `endLose`: Xandri goes after the herd, but not cleanly. The broken rule is written down, and the loophole stays unfound.
- `gentle`: The clay is softer this time: the tablet shows its hints sooner.
## Other added text, outside the LINES lists

### living-illustration.js
- Plate caption on the how-to-play: "Plate IV. The torrent waves, mid-morning."
- Phase names shown in the margin: "mid-morning", "noon", "dusk on the vine sea" (the dusk phase borrows s2_li_c4b's vine webs and drops the heat).

### tea-blending.js
- Book-card notes: "A long reading of the sand sea." (c3); "A long road, walked by masked pilgrims." (c7). ("A book about a binding." for c5 is DESIGN.md's.)
- Last-pot ledger line: "No recipe. The binding is yours to choose."
- Lamp-ash joins the jars only for the last pot (DESIGN.md: all eight at g_tea_c8).

### naming.js
- Motif tiles for the weather book (g_name_c5), drawn from DESIGN.md section 5/6 lore: Place Hollin, Hill, Sky, Bell-loft; Person Pell, Clerk, Bakers, Bell-ringer; Want Tomorrow, Windows, Fair Weather.
- Motif tiles for the road book (g_name_c7): Place Road, Plain, Grey Grass, Dusk; Person Oda, Scribe, Pilgrims, Masks; Want City, Answer, Edge, Ending (plus the sand-book false friends Dunes, Xandri, Waves).
- Sand-book page adds the fate tile "Past the Mark" (DESIGN.md names it) beside "Wake"; "Hill" replaces "Storm" as a weather-book false friend.
- Inspect replies: "{tile}: the grain of this tile is not this book's. It drifted in from {book}." / "{tile}: a tile from {book}, gathered while reading it."
- The author's chapter title is still accepted on page 3 without a fate tile (the design's author_title rule outranks the fate rule here). Flag if you want it the other way.

### clasps.js
- Fragment texts F3, F4, F5 are DESIGN.md section 5's proposals, unchanged (still marked replaceable there).
- Fragment card headers ("Inside, a folded letter from another reader." etc.) are in LINES above.

### rule-tablet.js
- New reasons for the shrine-store tablet (g_tablet_c2) test results:
  - "Both feet over the threshold is entering."
  - "With no hour named, he goes when the village sleeps, after the moon clears the well-post."
  - "With no house speaking for him, his father is one of the dead, and his things are the gods'."
  - "The watcher's rule forbids the roof-gap itself."
  - "The shaman says the store keeps what it keeps. Nothing comes out."
  - "Nothing in this plan reaches the shelf."
  - "Dawn is too late: he leaves tonight." (DESIGN.md's reason, reworded)
- The gods' tablet reasons are carried unchanged from the earlier build.

## Verbatim source lines used (for reference, not additions)
All from creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md, as DESIGN.md section 3 quotes them:
- living-illustration.js: beat 24 (start), beat 20 (swallow), beat 19 (dusk phase), beat 22 (second swallow).
- tea-blending.js: beat 10 (how-to-play).
- naming.js: beat 8 (third page); the chapter title.
- rule-tablet.js: beat 18 (how-to-play); rule 1 of the gods' tablet (beat 13).
- loading.js: beat 8 (unchanged).

---

# heartstream

## Heartstream refine pass: narrative lines added (not verbatim quotes)

Every line below was written for the game in this pass and is shown to the player. None is presented
as a quotation from the source. Verbatim source quotes used (all already quoted in DESIGN.md section 3)
are listed at the end for reference, as are lines reused from DESIGN.md section 6 (the elders' and
brothers' added lines, already on the DESIGN.md additions list). `${...}` marks a number filled in at
play time.

## web/games/heartstream/river-section.js
- Scene: "The shaft is behind you. You sit at the stern of the living raft, your three brothers ahead of you, and the heart is somewhere downstream."
- Goal: "Row the raft to the heart without being noticed by what swims below."
- Card note: "Other strokes come as the river brings them."
- Beat (open water): "The raft answers when all four oars fall on the heartbeat. Row when the bead reaches the line."
- Beat (Trim unlock): "A valve fold hangs low ahead. Trim to the bow to pass under it; trim to the stern to ride a swell."
- Beat (Lift unlock): "Something glows below the raft. Hold Lift until the tendril has risen and gone." (after the one who fears's "Down.")
- Beat (Hush unlock): "When the drone sounds, hold Hush and keep still until the eye closes." (after the verbatim fragment and "Hush.")
- Beat (past the patrol): "The beast sinks out of sight behind you. The water warms."
- Beat (notice 60+): "The eye turns toward the stern. Toward you."
- Messages: "Early: a splash." / "Late: a splash." / "Under the fold." / "Over the swell." / "It rises past your lifted oar." / "Stung: two beats without your oar." / "The eye closes. Row on." / "A low drone: the eye is about to open. Hush." / "Together."
- Win: "Out of the narrows, still four." + one of "You kept the heart's time on ${n}% of your strokes, and the raft ran warm under all four of you." / "You kept time on ${n}% of your strokes; the raft forgave the rest." / "Your oar found the beat on only ${n}% of strokes; your brothers carried the time for you." + one of "The eye had turned your way once, and turned back." / "The folds stopped you ${n} times." / "Not a fold touched the bow."
- Loss: "The eye found the stern. You are lifted into the beast in one movement, without a struggle, and your seat stays empty. Your brothers row on with three. Taken by the river."

## web/games/heartstream/climb.js
- Scene: "You climb beside the one who dreams. The one who argues and the one who fears are already above you, small against the rock."
- Goal: "Reach the light at the top of the shaft, with your brother, before the heartbeats run out."
- Card note: "More moves come as the shaft asks for them."
- Beat (start): "The holds tighten on the heartbeat. Grab as the dab reaches the line."
- Beat (first ledge, Pull): "Too high for one. He braces at the foot; climb his shoulders on the beat, then reach down and pull him up on three beats."
- Beat (Reach unlock, after "Look up."): "The holds spread wider here. Reach for the one beyond: dead on the beat it gains two holds, but a miss slides you two."
- Beat (Brace unlock): "Your turn to be the step. Hold Brace at the foot of the ledge while he climbs you, then take his hand on the beat."
- Beat (heat, Cling): "The rock is warm now and the pulse is loud. When the holds glisten white, the next beat is slick for everyone: hold Brace and cling through it."
- Beat (near the top): "Light above, red and gold. The pulse is loud enough to feel in your teeth."
- Beat (30 left): "Thirty heartbeats left. The light is still above you."
- Messages: "A long reach. Two holds." / "Short of the far hold: one." / "The hold glistened: slick. Cling on those beats." / "Early: the hold is slick." / "Late: the hold is slick." / "You cling through the slick beat." / "The hold went slick under you. Brace when they glisten." / "Over the edge. Reach down: pull on three beats."
- Win: "Into the light at the top of the shaft, the one who dreams beside you. ${n} lifts made together, ${n}% of your grabs firm, ${n} slick beats clung through; the raft's sync will start at ${n}."
- Loss: "The count ran out ${n} m below the light. Nobody falls in the shaft; ${n} slips cost you the height. The heart keeps its own time: wait for it."

## web/games/heartstream/carving.js
- Scene: "An elder sets a bone blank on the slab in front of you. “Carve for him.” The tool is for the one who argues; it will ride with him to the end."
- Goal: "Make his tool from the blank in 24 strokes, as close to its form as you can."
- Card note: "Other tools lie on the slab; you will find them as you work."
- Beat (flute chosen, after "Not that one."): "He says it of everything. You carve it anyway."
- Beat (Rub the ink unlock): "The bone is not all one grain: knots hide under the surface, and a cut through one splits wide. Rub soot into the bone and they show."
- Beat (Elder's tool unlock): "The elder's own old tool lies at the edge of the slab, worn smooth. Look at it, and you see the form as it should be."
- Beat (Mark unlock): "His sign could go into the grip. It costs three strokes, and he would know whose hand cut it."
- Beat (likeness 60): "It is beginning to look like a ${form}."
- Beat (likeness 80): "True. You could stop here, and he would have the whole of it."
- Beat (mark cut): "His mark, in your hand's line. Whatever else the tool is, it is his."
- Beat (lamp half): "The lamp is half burned. The others are already polishing."
- Beat (lamp low): "The lamp gutters. Finish what you can."
- Messages: "A hidden knot split: the sliver came away three times as wide." / "Soot in the scratches: ${n} knots show as dark rings. Cut around them." / "The elder's own old tool: the form as it should be, and the bone still to come away."
- Ending: "A ${form} for the one who argues, ${true|rough|keepsake} (${n}% likeness), in ${n} strokes[, his mark cut in the grip]." + "A knot split under the chisel." / "The ink kept you clear of the knots." + one of "He will feel it in his hand. ${effect from DESIGN.md}" / "Rough, but it will serve: ${rough effect}." / "It will do nothing on the river. It rides with him to the last frame all the same."

## web/games/heartstream/marrow-song.js
- Scene: "The four of you have found your phrases in the hollow. Tonight the elders want one song from four throats. It will be the rowing chant, and it will be sung back at the heart."
- Goal: "Set your phrases into the verse so it sings true: harmony 75 or more."
- Beat (verse one at 75+): "The verse holds. You can hear the oars in it already."
- Beat (hint): "He hums it once, low, and looks at the slot."
- Beat (between verses, header): "Days later · a calm pool on the river" (over the verbatim BROTHERS quote)
- Beat (heart verse rules): "The heart verse: one phrase from each of you, in an order you choose. It must begin near where verse one ended, and end home, on the lowest bead."
- Beat (heart verse valid): "It comes home. Low, on the first note any of you ever learned."
- Beat (timer): "The soft timer is nearly out; your brothers will fill the verse." / "The pool is ending. The current takes the raft again soon."
- Messages: "Your brothers fill the empty slots, and the four of you sing it whole." / "The four of you sing it, quietly, so the river will not hear."
- Win/done: "Verse one sings true (${h}): on the river every brother's window widens by 15 ms." / "Verse one is a song you can row to (${h}), though not a true one." + "The pool ran out before you chose, and your brothers set the heart verse themselves." + "The heart verse comes home without a stumble (${h}); its last note falls on the sixteenth beat." / "The heart verse comes home, though it stumbles on the way (${h})." + "${n} of verse one's phrases are yours."
- Loss: "Verse one: harmony ${h}. It breaks in too many places to row to; on the river every brother's window will narrow by 10 ms. There is no heart verse to sing."

## web/games/heartstream/bone-counters.js
- Scene: "Around you hang the boards of every group before yours, none of them finished. An elder sets a new one between you and the one who argues. Your counter piece sits in your keep."
- Goal: "Have more in your keep than he has in his when the elders call you away."
- Beat (your first capture): "He looks at the empty hollow a long time. The one who argues does not like to lose one."
- Beat (your first ring): "It rings. A clear note, the first one this board has made."
- Beat (round one): "The first round is yours, ${a} to ${b}. The elder cuts a notch in your side of the rim and sets the counters out again." / "The first round is his, ${b} to ${a}. He cuts the notch in the rim himself, slowly, so you see it." / "The first round ends even, ${a} each. Nobody cuts a notch."
- Beat (second sitting): "Days pass in the marrow. The song is nearly found. You sit to the board again; the elders have stopped showing where counters land."
- Beat (the cut, after “It is time.”): "The elders are at the door. The counter you were sowing stays in your hand." / "The elders are at the door as the last counter of the round falls, before anyone counts the keeps."
- Message: "The match will not be finished. Your counter piece is in your keep: pocket it, or leave it on the board."
- Endings: "Rounds ${a} to ${b}; you were ahead (keeps: you ${a}, him ${b}) when the elders came." / "…he was ahead (keeps: you ${a}, him ${b}) when the elders came, and he will say so for as long as you are together." / "…it stood even when the elders came." + "You pocket your counter piece. It will be in your hand on the river." / "You leave your piece in your keep. The board goes up on the wall with the others, unfinished, and your piece with it." + "You dropped ${n}% of your counters on the beat: your hands have the heart's time (+15 ms on the river)." / "…: on the river your window will narrow (−10 ms)."

## web/games/heartstream/branch-chart.js
- Scene: "The raft drifts toward the first fork. The four of you spread the chart on the tissue and each takes out his counter piece. Something patrols some of these vessels; the chart does not say which."
- Goal: "Choose a way through five junctions to the heart that keeps the raft away from the beasts."
- Card note: "Other ways of knowing come as you need them." / (after two losses) "After two hard routes, your listening is sure this time."
- Beat (Listen unlock): "He only feels one. Hold your ear to a branch for three seconds: a beast's pulse is off the heart's beat. You will be right seven times in ten."
- Beat (Awl unlock): "The awl you were given has a point that finds what hides. Once on each chart it shows every patrol at a junction."
- Beat (last fork): "Four ways at the last fork, and only twenty heartbeats to choose."
- Beat (first patrol taken): "Below the raft, something long turns its eye up toward the tissue. Everyone stops talking."
- Beat (calm pool taken): "A calm pool. For a minute nobody rows, and you make the others laugh."
- Tie header: "A tie · the strongest current takes it" (over the verbatim line)
- Messages: "The one who fears sets his piece first, away from the vessel he feels." / "Fears feels it" (label) / "The delta: twenty seconds a junction, and some forks hide two beasts."
- Win: "A way to the heart with no beast in it. Your piece stood on ${n} of the five branches taken."
- Done: "One beast on the way. The raft will have to hush, and hold still, and hope."
- Loss: "The route runs through ${n} patrols. On the river the eyes will open over the raft again and again, and somebody will be noticed."

## web/games/heartstream/loading.js
- Tips (new or reworded): "On the river, row on the beat; when the drone sounds, hold Hush until the eye closes." / "In the shaft, a hold grabbed on the beat is firm. When the holds glisten, brace and cling." / "A Reach gains two holds on the very heart of the beat, and slides you two when it misses." / "Carve with the grain: a stroke across it costs two. Rub the ink to find the knots." / "In Marrow-Song, joins that step by one or less are smooth. The heart verse must end home, on 1."

## Rule readings added in this pass (for approval)
- Carving: knots are hidden until the ink is rubbed (1 stroke) or a cut finds one; the elder's tool limited to 3 looks.
- Climb: a Reach (two holds on ±60 ms, slide two on a miss); slick beats in the heat that glisten one beat ahead and are clung through with Brace.
- Bone Counters: a round one, then round two cut by the elders; the round-two tempo and "no glows" follow `s1_counters_2`.
- Branch Chart: the one who fears's felt patrol is shown on the chart; listening is always right after two losses.
- River section and climb: Gentle Current (±200 ms, DESIGN.md section 12) offered after two losses in a row.

## Verbatim source quotes used (DESIGN.md section 3), for reference
- "It is not a tube. / It is a river." (river) · "immune creatures watch from the shadows" (river) · "The river grows narrower. / The current grows faster. / The heart draws near." (river, chart)
- "A narrow shaft opens in the bone — … feeling the pulse grow louder." (climb)
- "They have grown up side by side, carved tools together, sung marrow‑songs together, dreamed of the world above the bone." (carving)
- "Their society is calm, cold, and ceremonial. …" and "The young men laugh, argue, dream, and fear — …" (marrow-song)
- "branching vessels split like river deltas", "The body simply moves them on." (chart)
- Reused DESIGN.md section 6 lines: "Carve for him." "Sing it whole." "Sow with the heart." "It is time." (elders); "Down." "Hush." (fears); "Look up." (dreams); "Not that one." (argues).

---

# lira-calyx

## lira-calyx refine pass: narrative lines added for the game

Every line below was written for the game. None is a quotation of the source unless marked
**[verbatim]**; verbatim fragments are quoted in DESIGN.md section 3 already and keep their
non-breaking hyphens. `${…}` marks a value filled in at play time. Strike any line you do not want.

## web/games/lira-calyx/loading.js
- Tip: "At a reading station the relay beacon is instant. Nobody has ever checked its numbers."
- Tip: "Pell counts glows faster than anyone on the terrace. Not always correctly."

## web/games/lira-calyx/cross-section-climb.js
- Intro goal: "Climb from 2 800 m to the summit camp at 4 600 m before your air gives out three times."
- Intro note: "Mara waits at the camp halfway. Reading stations on the way give you a choice when you reach them."
- Intro option (after two losses): "Climb at Mara’s pace: air drains 30% slower"
- Opening: "Base camp, 2 800 m, Book III. The Peakborn ledges are above you. A storm-singer is said to camp halfway up, and nobody works above 3 200 m without what she carries."
- Beat: "Above 3 200 m the air thins: it drains two and a half times faster. Camps refill it."
- Beat (Mara's camp): "Mara’s camp, 3 700 m. The storm-singer looks at your cracked mask, unbuckles her rebreather and holds it out: “Above here the air is thin as a song. Take it.” Gear tier 2: air lasts 50% longer." (Mara's spoken line is invented.)
- Beat: "High camp, 4 250 m: a tarp, a cairn, a tin of chalk. Air refilled. The last stretch is the pale rock above."
- Beat: "4 000 m. The rock goes pale and shimmers: low gravity. Jumps go twice as high, falls half as fast, and the fronts come quicker."
- Beat: "The summit flag is in sight. Mara’s voice comes up from below, singing the gaps between the gusts."
- Beat (first anchored front): "In the margin of the route, in her hand: ring held, front passed, 0 m lost."
- Station prompt: "${station}. Hold READ (R) still for 3 s to take it by hand, or press RELAY (B): instant, never verified."
- Station names: "Station 1: gravimeter", "Station 2: vine-sighting compass"
- "${station}: read by hand. The number goes in the journal in her own ink."
- "${station}: the relay beacon gives its number at once. You write it down in a smaller hand."
- "You moved: the needle settles again. Start the reading over."
- "Storm rock: it flashes twice, then bursts. Move on."
- "The page edge darkens: storm front in 3 s. Walk to a ring ○ and hold ANCHOR."
- Win endings (appended to the time line): "Both station readings are in her own hand, taken still and slow, and they will hold." / "One reading by hand, one from the relay, written smaller." / "One reading by hand; the other station was passed by." / "The station numbers came from the relay. They are quick, and nobody checked them." / "The stations were passed by; the page carries the route and nothing else."
- Lose ending: "${why} A third black-out at ${m}: the climb is called off and you are walked down on a short rope. The route ends in a broken line."

## web/games/lira-calyx/under-the-lens.js
- Intro goal: "Capture the lattice cells at three magnifications without losing the slide."
- Intro option: "Steadier hands: the flow runs 20% slower"
- Opening: "Book I. The fragment from the storm-struck outpost, threaded with micro‑filaments, clipped under the lens. ×100: capture five lattice cells." (**[verbatim]** "threaded with micro‑filaments" only)
- Beat (×100, two cells): "Joren, over your shoulder: “Bark doesn’t grow in hexagons, Doctor.” You say nothing yet. You count."
- Beat (plate 1): "… Hold your breath (Space or HOLD) to slow the flow for three seconds."
- Beat (first burst): "A filament flickers: a charge burst is coming down it. Steer clear, change plane, or hold your breath."
- Beat (×1 600, three cells): "Every cell the same width to the micron. Nothing that grows keeps time like this."
- Win: "Three plates go into the journal as evidence, without a single drift / after ${n} drifts. Under the living filaments sits a lattice that repeats to the cell: a pattern too regular to be natural. Lira writes the word “made” and does not cross it out."
- Lose: "The slide drifts a third time at ${mag} and the fragment slips out of the clip. ${n} lattice cells recorded, ${k} plates kept; whatever lies under the filaments stays unproven for now."

## web/games/lira-calyx/assay.js
- Intro goal: "Name the well sample: strike the card down to one, with one precise peak reading."
- Intro: "Pulse and ratio unlock on the bench." Option: "Kade’s bigger flask: 7 mass"
- Opening: "Book II, Cinder Reach. Kade carried this up from the Lowland well in a lead flask; the relay figure for N5 is on the Continuum's board, and you do not trust it."
- "Five compositions on the card. Start with a vial."
- Beat (first reagent): "Strike every card the result rules out. A drop proves a compound is there; no change proves it is not."
- Beat (first precise reading): "Now the ratio: a second precise peak, then RATIO compares their heights. Isotopes keep their proportions unless someone changes them."
- Beat (mass ≤ 2): "Kade raps twice on the archive door: a patrol on the Cinder road. Spend what is left with care."
- Ratio: "Ratio of the ${a} and ${b} lines: 1 : ${r}. Well water from the Lowlands runs close to 1 : 1. Something was put down this well."
- Re-run: "${why} Logged error. One re-run: Kade unstoppers a second flask. Fresh sample, the card restored."
- Win, with ratio: "The isotope lines stand at 1 : ${r}: evidence of deep‑earth seeding, in her own hand, at a bench nobody else touched." (**[verbatim]** "evidence of deep‑earth seeding" only)
- Win, without ratio: "The ratio was never read; what the well water says about its own origin stays in the cuvette."
- Lose: "… Entry N5 logged as error, unverified. Kade pours the last of the flask back into the dust; the well will have to be read some other way."

## web/games/lira-calyx/key.js
- Intro goal: "Name six specimens from the terrace by following the key, couplet by couplet."
- Intro option: "Lira’s annotated key: show the measure each couplet uses"
- Opening: "Book I, Hollin Terrace. Six jars on the bench from this week's walks, and Pell watching from the doorway. Two misclassified and the plate goes in unverified."
- Beat (specimen 2): "Pell drags a stool to the bench. “I can count glows faster than you. Ask me.” She means it. Her numbers are not always right."
- Pell's tally: "Pell, counting on her fingers: “${s} seconds, I promise.” She has ${n} counts left in her today." (Pell's counts are fixed per specimen; two are wrong across a threshold.)
- Beat (specimen 4): "A track cast from the upper bridge, still damp. Joren brought it down this morning, wrapped in his scarf."
- Anomaly keyed: "Couplet written in pencil. The juvenile is keyed as new: an Ember Wolf, too high. Lira underlines the altitude twice."
- Beat (specimen 5): "Lira looks at her new pencil couplet for a while before she picks up the next jar." / "The next jar. The wolf’s card stays at the edge of the bench."
- Misclassified: "${name}? The tag says ${alt}; the description says below 2 000 m. Lira writes it in, and it sits there wrong." / "${name}: logged misclassified. Pell’s count was off; she looks at her fingers and goes quiet." / "… It was not that."
- Stamps: "NAMED", "MISCLASSIFIED", "KEYED NEW"
- Win: "… The anomaly now has its own couplet in Lira's pencil, and the key is one branch truer than it was this morning. Pell asks why the wolf came up so high. Lira says she does not know yet, and writes that down too."
- Done (imperfect): "The anomaly has its couplet; one name on the plate is wrong and will stay wrong in the journal." / "The anomaly went in under the wrong name. Nothing on the page says the wolves are climbing."
- Lose: "… and Pell copies the wrong names into her own book in her careful capitals."

## web/games/lira-calyx/storm-song-cipher.js
- Intro goal: "Copy Mara’s song, then plot it to find N7 and N8."
- Opening: "Book III, the storm-singing ledge. Mara sings the storm-song once through, the way the Peakborn teach it, and three slots on the old staff have worn away. Mara: “Write where I breathe.”" (Mara's line as given in DESIGN.md section 11)
- Beat (after first Play): "Mara, watching you strain at the weathered bars: “I can sing you a bar, slow. Twice. Then the storm comes in.”"
- Ask Mara: "Mara sings bar ${n} slowly, holding one note long / and leaves a silence where the weathering is. You pencil it over the faded mark. She shakes her head: the rest you must hear."
- Beat (first breath written): "The first breath. Mara stops, breathes, and you write the mark where she did: N7 is somewhere along that line."
- Beat (second breath): "The second breath, higher up the song. Wind on the ledge now; Mara sings into it as if it were a second voice."
- Beat (all filled): "Every slot is filled. Lira reads it over once against the table before she trusts her pencil to the map."
- Wrong plot: "Mara: “You wrote a breath I did not take, or missed one I did. Listen to the weathered bars.”"
- Win: "… Mara reads the pencil path upside down and nods once: a Peakborn song, walked out on paper."
- Lose: "… and the storm takes the ledge before Mara can sing it a third time."

## web/games/lira-calyx/journal-audit.js
- Intro goal: "Find every line someone else wrote in your journal, and strike nothing that is yours."
- Intro option: "Keep a count of the forgeries left"
- Opening: "Book III, the hideout. The stolen log came back to you overwritten with false timestamps and fabricated sensor readings. Find their lines before they become your nodes." (**[verbatim]** "overwritten with false timestamps and fabricated sensor readings" only)
- Beat (7 lines checked): "Halfway. Above the hideout, boots cross the grating and stop, and go on. Lira does not look up from the page."
- Margin prompt: "The small hand, in the margin. Answer it?"
- Replies in Lira's voice: "“Then whose was it?”", "“Thank you. Who are you?”", "“Stay out of my book.”"
- Circle it writes "Who wrote this?" (**[verbatim]**, DESIGN.md section 3) with: "You circle it and write the question beside it, as you did on page 47."
- "You leave the note as it is." / "You write your answer under the note. Whoever reads this book will read that too."
- Second reply answered with "I can't say who. Not yet." (DESIGN.md section 12's line) and: "Under your second reply, while you were reading the other page, the small hand has answered."
- Two-minute note (was three minutes; text unchanged).
- Endings appended: "The journal is hers again, line by line." / "…and the nodes it names go into the dossier unverified." / "Most of the page is hers; the rest will follow her into the Peaks as it is."
- Margin endings: "You answered the small hand once/twice; the Continuum reads this book too, and now it knows someone writes back." / "You circled the small hand's notes and asked, and left it there."

## web/games/lira-calyx/node-board.js
- Intro goal: "Bring every node’s load to 2 or less with four emitters, then Trigger."
- Intro option: "Joren’s margin sketch: a hint for the heaviest node"
- Opening: "Book IV. Hollin Terrace is cracking under synchronized storms, and the coalition runs a drill on its six nodes before anyone goes near the core. Select a node to begin."
- Dossier entries (sources of each node's reading): "flood-siren baseline, taken from the relay beacon at N1"; "lift-cable gauge, read by hand with Joren"; "strider count on the bridge, by hand with Pell"; "photodiode on the schoolroom wall, by hand"; "spore density in the market awnings, by hand"; "river glow from your own bench, by hand"
- Dossier: "Relay. Lira wrote it in her smaller hand. Nobody has ever checked a relay number by hand." / "Hand, ok."
- Beat (2 emitters): "Below the map, Pell runs the drill list house to house. The terrace has heard the word “drill” before; it has never heard it said this quietly."
- Beat (4 emitters): "All four emitters out. The pencil Strain reads ${x} against the calm line of 4. It is only as honest as the readings under it. Trigger when you trust them."
- Hint: "Joren's sketch in the margin: the Market carries three heavy springs. Put the Market opposite the emitters around it, and keep those emitters in step with each other."
- Trigger: "The pulses fire, staggered by slot. The seeds show. Node by node, the terrace answers."
- Win: "… Hollin's drill holds, and the siren on H1 wails once and stops. The seed sat where no emitter went. It is the one complete calm this mountain will give you."
- Lose: "… It is only a drill. On the night it is not, those houses shake."

---

# lord-of-the-sea

## The Lord of the Sea: narrative lines added in the refine pass

Every line below is written for the game. None is a quotation from the source, and none is shown as
one. The only source words used in these modes are the loading screen's verbatim line (286, unchanged)
and the fragment "Everything has a lord," (336), which the factor now says on its own in the Tea
Board's loss text (it replaces the earlier added line "Everything has a lord, sir. That one is ours.").
Lines marked *(Voice)* are the Voice Beside (DESIGN.md section 12), set in sea-ink green italic.
Values in `${...}` are filled in by play (counts, times, distances).

## web/games/lord-of-the-sea/engraved-sea.js (chapter 4, `e-spice-chase`)

- Panel kicker: "PLATE I · CHAPTER IV · OFF THE SPICE MOUTH"
- Goal: "Reach the Spice Mouth, 1.2 miles on, before a revenue cutter's grapnel holds you four seconds."
- Opening: "The Company has had word of a boat that makes its own weather. Alexi has the tiller, a following sea, and a cutter two cables astern."
- Gentle note: "A gentler sea: the cutter starts further back this time."
- Start caption: "Stir behind the boat and surf the face you raise. Keep the cutter off your quarter."
- Beat (260 m): "The reef runs a hand under the water a cable ahead. Stir on it, clockwise, and the tide stands over it."
- Beat (420 m, unlocks Sing): "The Gullwife crew are aboard. Once this run, call them to sing (Sing, or C): for twelve seconds every stir runs one tier higher."
- Beat (760 m) *(Voice)*: "The water rose where he asked it. Along the shore the moorings lifted, and no one on the quay knew why."
- Beat (960 m): "The Strait light swings ahead. Its beam is the Company's eye: lay fog with four circles, or keep out of it."
- Beat (1420 m): "The second reef, and past it the Spice Mouth, where the dock-singers sing for no one yet."
- Beat (1950 m) *(Voice)*: "Behind us the sea kept every crest he had raised, and carried them toward the land."
- On Sing: "The Gullwife crew sing, off-key and loud. For a while the sea answers more than he asks."
- Song ends: "The song ends. The sea goes back to its own size."
- Second cutter: "Notice 50. A second cutter puts out from under the light."
- Half stir: "Not a full circle: the water does not answer."
- Win: "Into the Spice Mouth in ${time}, the cutter still beating up behind. ${n} crest(s) rolled on to the moorings along the coast; the Tide Reckoning will count them. Notice ${n}." / with no crests: "He raised almost nothing on the way, and the coast barely felt him pass."
- Loss: "The grapnel bites and holds: the cutter has him ${nm} nm short of the Spice Mouth. Caught, notice +10. Next time put a crest under her bow, or lay fog between you."
- (Kept from before: "Fog. The cutter loses you in it.", "… over the reef: the tide stands on it a while", "The cutter broaches on your crest.", "Broadside to the face: over she goes.", "Struck the reef: not enough water over it.")

## web/games/lord-of-the-sea/deep.js (chapter 3, `d-first-dive`)

- Panel caption: "PLATE IV · CHAPTER III · THE DEEP"; title "Down to the tender"
- Goal: "Swim down 80 m to the sunken tender, work its strongbox free, and carry it up before the pull closes the edges."
- Opening: "The Company's tender went down off Home Reach with Tidewater's harbour book locked in its strongbox. Whatever binds that harbour is written there. Alexi goes over the side with no breath to hold."
- Gentle note: "The deep is slower to close this time: the pull runs 150 seconds."
- Start: "Down. The pale ring far below marks the tender."
- 20 m *(Voice)*: "The light thinned to blue. He did not reach for air; there was none he needed."
- 60 m: "Below sixty metres only what glows gives light, and what he stirs."
- 75 m *(Voice)*: "The deep knew him. It wanted to keep us, gently, the way it keeps everything."
- First net (unlocks Grip): "A Company net. Fig. 4, Grip: hold Shift (or the Grip button) and swim against it to tear it open."
- In a net: "Caught in a Company net: hold Grip and swim to tear it."
- Pull low: "The edges are closing. Kick, and ride a current if you stir one."
- At the tender: "The strongbox, wedged in the tender's ribs, the Company's mark on its lid. Hold Grip to work it free."
- Halfway: "The hull groans and settles."
- Freed (the twist): "Free. Above, a second net comes down across the way up, and the dredge swings faster. Carrying halves your speed: stir currents upward."
- 30 m on the way up *(Voice)*: "Thirty metres. The light comes back to his hands, and the box is lighter than it was."
- Win: "The strongbox breaks the surface with ${s} s of the pull to spare, and ${n} Company net(s) torn on the way. Swollen, not locked: the harbour book of Tidewater is inside, and the princess is already reaching for it."
- Loss, carrying: "The strongbox was free, but the deep kept him. He settles gently to the floor beside it, and the dive will have to be made again from the last mark."
- Loss, before the tender: "The edges close before he reaches the tender. The deep keeps him a while, gently, and the dive will have to be made again."

## web/games/lord-of-the-sea/liars-tide.js (chapter 2, `g-liars-tidewater`)

- Goal: "Be the last at the table with dice."
- Rule line: "Each sailor hides three tide dice under a horn cup; the house spots the newcomer a fourth."
- Opening: "Chapter II, the Tidewater taproom. Wenna, who pilots the ferry, and two dockhands. Alexi cannot ask a straight question to save his life, so he plays for the news instead."
- Gentle note: "The princess has pulled up a stool: her whisper is free every turn this game, and the house spots you a fifth die."
- Start: Wenna: "“Stakes are news, sailor. Tell us something we don't know, or lose.”" (with "Wenna rattles her cup.")
- Round 2 (unlocks Stir): "The water jug at his elbow turns when he looks at it. Stir the cup: pick up to two of your dice and circle over them (or S) to roll them again. Every stir draws the sailors' eyes."
- Round 3 (unlocks Whisper): "The princess slides onto the bench beside him. Whisper (W): once a round she tells you the odds that the standing bid holds."
- Suspicion 50: "The tall dockhand glances at the jug, then at Alexi's hands."
- Suspicion 75: "Wenna has stopped looking at her own cup. One more stir and she will say something."
- Wenna out: "Wenna pushes back her stool. “The Gullwife crew fish past the chart's edge, where the Company's buoys stop. Go and find them.”"
- Tall dockhand out: "The tall dockhand drains his cup. “Kettle crew still sing at the Salt Steps. Under their breath, mind.”"
- Short dockhand out: "The short dockhand shrugs into his coat. “Ferry's late every Thursday. Company man counts the fares himself.”"
- Final duel with Wenna: "Just Wenna now. She counts under her breath when she holds three of a face. Listen for it." / with a dockhand: "Just the ${name} now, and the whole taproom watching."
- Down to one die *(Voice)*: "One die left under his cup. The sea's luck does not come to a man who stops looking at it."
- Illegal bid hint: "Raise the count, or keep ${q} and pick a later face."
- Win: "Last with dice, (and ${n} stir(s) the table never quite caught | and an honest cup). Two pieces of news: where the Gullwife crew fish past the chart's edge, and where the Kettle crew still sing. Devotion +3."
- Caught: "Caught stirring the cup, ${once too often | the nth time}. Wenna puts her hand flat over his; the stake is forfeit, and the news goes to someone else's table."
- Out of dice: "Out of dice (after seeing ${n} sailor(s) off the bench). One piece of news anyway, from a dockhand who pities him: the Gullwife crew fish off the chart's edge."

## web/games/lord-of-the-sea/charter.js (chapter 4, `g-charter-tidewater`)

- Goal: "Find the one clause that binds Tidewater, and break it."
- Opening: "Chapter IV, the cabin. The princess has fetched the Tidewater harbour book from the Company's office on her father's name. The clerk wants it back by the evening tide."
- Gentle note: "She has already circled one page tab in pencil."
- Start pencil: "The letters sit still at the chart table. Start where the obligations start, and follow what they are 'subject to'."
- Added clause (the amendment slip): "Amendment. The dues of clause 5 to be continued by the custom of the harbour, the Comptroller's hand to follow. (Unsigned.)"
- Loupe, page I: "Under the loupe: the Company's seal, and pressed into the wax beside it a quay lamp with a date in small capitals, MDCCIII. Seventeen hundred and three."
- Loupe, page III: "Under the loupe: the Comptroller's office seal, the wax still soft enough to take a thumbnail. This book is a fair copy, made this year."
- First loupe on page I: "A lamp in the wax, and a year. Worth remembering when something runs 'from the lighting of the quay lamp'."
- On pinning: "… (And the clerk has just pinned a new slip to page II. Look at it.)" added to the existing pencil line.
- Pointing at the slip: "Unsigned, so it adds nothing. But nor does it undo clause 5: custom is not a date. When did the forty years start?"
- After the break *(Voice)*, appended to the pencil: "Beside him something old and patient read it too, and was not surprised."
- Break hint: "Point at words in the book (they are underlined now), or pick up a thing below and lay it on clause ${n}."
- Clean finish suffix: "Not a drop of ink spilled."
- Loss: "The ink is gone, three clauses blotted, none of them the one. The clerk takes the harbour book back at the evening tide: notice +10, and Tidewater stays bound until it can be asked for again."
- (Strike, Rewrite and Leave texts kept from before.)

## web/games/lord-of-the-sea/tea-board.js (chapter 2, `g-tea-parlour`)

- Goal: "After six rounds, hold more ports than the factor. A tie, in his books, is his."
- Opening: "Chapter II, the Company's parlour at Tidewater. The factor sets out his board as a courtesy to the princess's guest: the same four ports Alexi can see from the window, painted in cobalt."
- Gentle note: "She has watched you lose twice: she will point five times this match, not three."
- Start (Low tide): "Low tide. His Chests on lanes by Tidewater count double while it lasts. The princess watches the board, not the factor."
- Rising (unlocks Ask her): "The tide turns to Rising. The factor straightens his cuffs: “Nothing counts double now, sir. Only skill.” She is at your shoulder: Ask her, and she will point at one good move."
- High *(Voice)* (unlocks Stir): "High water. Under the painted lanes something moved the way he looked at it. Stir: once this tide, push a Chest off a lane by the Unwritten."
- Last round: "Last round. The factor folds his hands and waits, as if the result were already written in a ledger somewhere."
- Factor table talk (one of): "The factor taps the board.", "“A courtesy, sir.”", "The factor moves without looking up.", "“Your move. Do take your time.”" (the first three kept from before)
- Win: "Alexi ${a} ports to ${c}(, the last of it with the water's help). The factor folds the board with a small bow and writes something in his book. The parlour is won: one more Hymn in the final match."
- Tie: "${a} ports to ${c}. “A tie, in my books, is mine.” The factor folds the board and enters the result before the princess can object." (the factor's line is DESIGN.md's own, section 11)
- Loss: "${a} ports to ${c}. The factor folds the board and smiles at the princess: “Everything has a lord.” Nothing is lost tonight but the parlour." (the quoted words are the source's, 336, verbatim)

## web/games/lord-of-the-sea/dead-reckoning.js (chapter 3, `g-reckon-unwritten`)

- Card header: "PLOTTING SHEET No. 3 · CH. III · FIX 0600"
- Goal: "Plot a course from the fix to the Gullwife boat, ending inside the red circle and clear of both rocks."
- Opening: "No chart reaches the Unwritten. The Gullwife crew fish out there, past the last Company buoy, and the only way to meet them is a pencil, a rose and the tide table."
- Gentle note: "The cabin's old maps hold a worked example in pencil: aim well north of the boat, the tide carries you south-east. She will check your leg three times."
- Start: "Six in the morning, the last buoy astern. The princess holds the lamp over the sheet; the boat holds its breath."
- First tide laid (unlocks Stir and Ask her): "The first triple arrow goes down in ink. The water out here is wild enough to argue with: click a tide arrow and circle on the sheet to turn it up to 30°. She will check the leg for you once."
- All tides laid *(Voice)*: "Every hour laid. Out past the buoys the fog is already coming down; whatever the pencil says is all he will have."
- Her check (one of): "“Lay the rest of the tide first. Without it you are only guessing.”", "“That line goes straight over it. Turn a tide arrow, or erase.”", "“That will find her. If the pencil is honest.”", "“You'll come up ${north of her | south of her | past her, to the east | short of her, to the west}, about ${n} miles out.”"
- Win: "Arrived, ${n} nm from the Gullwife boat: fifty metres off her bow when the fog lifts, and someone aboard is already singing. (The tide was stirred ${n} times: Wild ${n} in the Unwritten. | Not a stir: the pencil did it alone.)"
- Loss: "Arrived off-target: the pencil put him ${n} nm wide. He finds the Gullwife boat only by their singing, and comes up in fog, three hundred metres from the Gullwife boat instead of fifty. His mark fell ${south|north} of her; let the tide table do its share next time."

## web/games/lord-of-the-sea/loading.js

- Two tips added: "Once a run, call the crew to sing: for twelve seconds every stir runs one tier higher." and "Lift a seal to the loupe. The wax remembers dates the clerk would rather you forgot."

---

# man-eater

## Man Eater: narrative lines added in the refine pass

Every line below was written for the game. None of them is the author's text and none is presented
as a quotation. Quotations that stay in the modes are verbatim from DESIGN.md section 3 or the
added lines DESIGN.md section 21 already lists (marked "already in DESIGN.md" where reused). Strike
or approve each one.

Mechanical prompts that only name a control or a number (for example "Select at least two cells",
"The napkin holds three", "Warmth −10") are left out unless they carry story.

## web/games/man-eater/silhouette-halls.js (Silhouette halls)

Opening
- "Shadow theatre · Night 4 · 22:10"
- "Reach the officers' wing door at the east end of the hall."
- "Jax counted the chairs at supper. The transfer roster is kept in the officers' wing, and nobody has said where Pell and Duarte went."
- "Your shadow already reaches high up the sheet. Keep it out of the flashlights." (eater start)
- "Short and slow. The alcoves are your cover: crouch in one when a light comes." (refuser start)

During play
- "A floor drain. The cold comes up through the grating, from below the floor, not from outside. Warmth −10."
- "22:30. Keys at the east end: the check. One guard walks the whole hall, once, toward you. Get off the floor or out of the light."
- "The check's footsteps go round the corner at the bunk end. The hall is yours again."
- "Under the floor, the sound again: “Low melodic groaning, almost flute-like” (line 30). It is behind you now, west and down." (the quoted words are DESIGN.md section 3, beat 6; the framing is added)
- "Inside. A dark bunk room; someone breathes slowly by the wall. Wait for the light to pass, then E to step out."
- "Someone turns over in the dark room. You step back out before he wakes."
- "This door is locked. The other side doors are spent for tonight."
- "You pull yourself up onto the pipes. From here your shadow lies along the ceiling, longer than you are."
- "The officers' wing door. Two handles: the high steel lever, and the brass knob below it." (the two handles are already in DESIGN.md section 21)
- "The flashlight held you." / "He saw your shadow first." / "The check's flashlight found your shadow on the wall before it found you." / "You stood in the light from a door pane." / "The cold took your legs."
- Unlock lines: "This side door is unlocked. Slip into the dark room until the light passes. Two doors tonight." "The pipes run at 2.7 m. You are tall enough now. Up there the light passes under you." "Stand still, and the guards' footfalls show on the floor line, even beyond the sheet."

Endings
- Win: "The brass knob turns. On the duty desk the transfer roster lies open: the empty chairs by seat number, each with a date and the same word typed beside it, “transferred”." (the word "transferred" is the source's, line 32)
- Win, eater: "You came most of the way above the light, along the pipes, with the shadow ahead of you on the ceiling."
- Win, refuser: "You came the whole way on the floor, short and slow, and the shadow never reached the light."
- Loss: "Two orderlies walk Fisk back to the bunk and do not say a word on the way. Suspicion +20; the curfew break is logged as seen, and the roster stays in a room you have not been in."

Added mechanics with story weight: three unlocked side doors (two may be used), a dark bunk room
with a sleeper, the 22:30 check as a third guard walking the hall once (DESIGN.md section 10 names
the check; its form here is added).

## web/games/man-eater/snow-line.js (Snow line)

Opening
- "Sortie N3 · 22:47 H · Yard 1:600 · Frame 047"
- "Cross the yard to the kennel shed, top right, without being followed there."
- "Night 3. The first bunkmate was “transferred”. Transferred men take their boots. If his are still on the base, someone lied."
- "The barracks door shuts behind you. Every step you take from here is written in the snow."

During play
- "A drift. Half speed, and the prints you leave here are deep: they last twice as long."
- "Cover: the hatched shadow beside a building. The searchlight cannot see you here, and a retry starts from here."
- "The wind gets up from the trees. Your prints fill twice as fast now, and the tower crew quickens the searchlight's loop."
- "Through the mess window: the chairs are up on the tables for the night, all but one. Nobody has pushed Pell's back in."
- "The dog run. The snow inside the wire is smooth: nothing has walked in it all winter."
- "The patrol's lamp dips to the snow and stays there. It has found your trail, and it is walking it toward you."
- "The patrol lost the trail. The wind has your prints."
- "Flat in the snow, face down. The light slides over a white shape among white shapes."
- "You get up out of the snow, stiff."
- "You have nothing left to lie in the snow with. Your coat is soaked through."
- "Only the old prints are left in this frame." (retry)
- Causes: "The searchlight held you." "The patrol's lamp found you." "The cold stopped you."

Endings
- Win: "The kennel shed, with no dogs. On a shelf by the door, the first bunkmate's boots, laces still tied, the way he kept them so he could step straight into them. Transferred men take their boots." (the shed, the boots and the laced boots are already in DESIGN.md sections 6 and 21; the sentences are added)
- Win, trail: "Behind you N sharp prints lead here from the barracks door; by morning someone will have read them." / "Behind you only N sharp prints are left for anyone to read." / "Behind you the wind has filled every print. Nobody can say you were here."
- Loss: "Fisk is walked back to the bunk past his own prints, which no one bothers to fill. Suspicion +25; the curfew break is logged as seen. The shed stays shut, and “transferred” stays a word."

Added mechanics: lying flat (three times; four with story assist), the wind phase that halves print
life and tightens the searchlight loop.

## web/games/man-eater/short-rations.js (Short Rations)

Opening
- "Ration issue · Day 4 · Evening"; stamp "2 withdrawn"
- "Take exactly as many tricks as you bid. Exact bidders get a loaf."
- "Four seats tonight. Pell's chair and Duarte's are pushed in, and their suits are out of the deck. The basket holds three loaves for four men."

During play
- "Hand 2. You deal. Your Hands are trumps, and you bid last: your bid may not make the table's add up to 8."
- "Not N: the bids would add up to 8, and someone has to miss. Choose again."
- "Jax, without looking up: “Taps are high cards.”" (Jax's line is already in DESIGN.md sections 6 and 21; the framing is added)
- Seat captions reuse the crew lines already in DESIGN.md: Kimura "Nothing goes out. Everything comes in." Hollis "Next week. I mean it."
- Stamps: "Trick", "Bid made", "Over your bid", "A loaf", "No bread".
- "You made your bid, but the basket was empty by your turn."

Endings
- Loss: "No bread tonight: the basket ran out before your turn / you missed your bid both hands, and the basket passed you by. Without a loaf, staying in the bunk at 10:00 will cost more, and the call will be louder for it."
- Win, ate: "The bread makes you feel full, the first time in four days. At 10:00, staying in the bunk will be possible." (echoes the source's "which made him feel full", line 31, without quoting it)
- Win, kept: "The loaf is wrapped in your undershirt. Tomorrow evening it can buy you one night in the bunk."
- Done, gave all: "You go to the bunk with nothing. Feeding someone does not save them; it moves the call to someone else, one night at a time. Tonight it moves off NAME." (the middle sentence is DESIGN.md section 12's own wording)
- Settle lines: "banked one under your mattress", "ate one at the table (hunger −25)", "gave one to NAME".

Added mechanic: Watch Jax (his taps show only while you watch him).

## web/games/man-eater/tray.js (The Tray)

Opening
- "Table 3 · Seat 7 · Day 5 · Noon"
- "Get through the meal without being seen. How much you eat is yours to decide."
- "The orderly stands closer today. Jax is on your right, eating slowly. You are hungry, and the meat will make you hungrier."

During play
- Gaze band: "Watching you · N s" / "Looking away · N s" / "Eat, or wait. Do not pocket or pass." / "He is turning back." / "Pocket, pass or spit now."
- "Six pieces. Eat, pocket, pass or leave each one. The pill and the broth sit beside them."
- "Jax slides a heel of bread under the rim of your tray without looking at you. Bread quiets hunger and changes nothing. Tap it to eat it."
- "The heel is dry and it is bread. Hunger −10." / "The pieces stop creeping toward you." / "Bread in the napkin, for tonight." / "It was Jax's to give. He will not take it back."
- "The cook, from the hatch, to the whole room: “Eat up.” Nobody answers him." (the cook's "Eat up." is already in DESIGN.md section 21)
- "Trays are being collected from the far end of the table. Whatever is left on yours, he will count."
- "A piece is creeping toward your mouth. Tap it to push it back to the middle of the tray." / "Pushed back to the middle of the tray." / "A piece was in your mouth before you decided."
- "Broth, warm and thin." / "In your cheek, under the tongue. Spit it into the napkin when he looks away." / "Spat into the napkin, folded over. He did not see." / "Jax shakes his head at the pill."
- "Jax eats it, or hides it. Your tray looks cleaner." / "Pocketed. He was looking the other way."
- "Seen: WHAT. The orderly writes on the clipboard. Once more and he stops at your tray."
- "The tray is clear. You sit with your hands flat on the table."
- Ledger: "Pill swallowed at the collection, while he watched." (a pill left in its cup is now taken at the end)

Endings
- Loss: "The orderly stops at your tray and does not move on. He watches you finish, writes two lines, and the meal is over for you."
- Win: "The tray goes back clean and unremarked."
- Done: "The tray is collected with N pieces on it; the orderly counts them onto the clipboard." / "The tray is collected; the orderly remembers what he saw."
- By what was eaten: "You ate none of it. Logged as refused; tonight you will be yourself, and hungry." / "You ate N pieces. Your sleeves are shorter than they were this morning, and you want more." / "You ate N, and kept the rest of yourself back."

Added mechanic: the bread heel arrives from Jax at 35 s (DESIGN.md names a bread heel and Jax as a
source of bread; the timing and the delivery are added).

## web/games/man-eater/chart.js (The Chart)

Opening
- "Form 7-F · Daily measures · Infirmary"
- "Break the explanations you gave yourself, using your own numbers."
- "Four mornings. The orderly reads the tape aloud and writes; he never looks at your face. You are the evidence."

During play
- Margin lines in Fisk's hand, one a morning: "4 cm of wrist out of the sleeve this morning." / "Ate 5 yesterday. Wanted 6." / "Boots tight. Knuckles white." / "There is a second sheet under mine."
- "The orderly slides a second, printed sheet half under yours before he starts."
- "You ask what the numbers mean. The orderly: “LINE” He writes a line about the question. Fisk's pencil goes to one cell." (the orderly's lines "Down again.", "Up again.", "Next." and the words "on schedule" are already in DESIGN.md)
- Stamps: "Broken", "Shelved".

Endings
- "All four broken. The climate, the food, the hunger and the routine: none of it holds against your own numbers, and they keep to a printed curve, “on schedule”. Fisk knows it is a pattern."
- "N of 4 explanations broken. Your own numbers keep to a printed curve: “on schedule”. Fisk knows it is a pattern, even with one entry left standing on the list."
- "N of 4 broken. Fisk shelved the rest; the explanations stand, and the chart keeps to its curve whether he reads it or not."

Added mechanic: Ask the orderly (twice in four mornings).

## web/games/man-eater/floor-plan.js (Floor Plan)

Opening
- "Find where the halls do not close, and stamp the void there."
- "Day 4, the rec room table, after duty. On day 3 you paced the outside wall: 120 paces. Now draw the inside from memory and see if it fits."
- Title block: "Sheet G-1 · Scale 1 sq = 75 cm · Drawn Fisk, from memory"

During play
- "The bunk hall: 39 paces, walked on day 1, before anything changed."
- "The NAME was paced on day N. You were taller on day N, and your stride was longer."
- "That was not your stride on day N."
- "The plan does not close … But you were growing while you paced it, and some of these were never converted. A gap can be the stride's and not the building's."
- "Converted, every length at its own day's stride, it still does not close. N squares of the base that no hall reaches, east of the cold store."
- Note, drains: "Cold comes up through the drain at the end of the cold store, colder than the yard. Something under the east end is open to the ground."
- Note, file: "The project's file names a lower level under the east wing. No stair to it is drawn on any sheet in the file."
- Retry: "Something on the plan was paced on a later day and never converted at that day's stride." / "Look again at where the drawn rooms end and the wall goes on."

Endings
- Win: "The void is behind the cold store: about N squares of the base that no hall reaches, and the cold comes up from it. Void located, and the drains and the file agree with the paper. The halls never measured what they should; you did."
- Loss: "The void stamp is N squares out. The plan is saved as it stands, and on night 6 the stair is not where you look. A changed Fisk takes longer strides; the gap you drew was not the gap that is there."

## web/games/man-eater/loading.js

No new narrative lines. The quote ("Do not, under any circumstances, leave this room after 10:00
precisely.", line 29) and the tips are unchanged.

---

# missing-campsites

## Missing Campsites: narrative lines added in the refine pass

Every line below was written for the game; none is a quotation from the source. Exceptions noted: Rafe's "Did I? … I did, didn't I." (DESIGN.md section 11) and the postcard lines in reconcile.js (DESIGN.md section 12) are DESIGN.md's own text and are reused, not new.

Each file keeps all its narrative in one `TEXT` object; it is reproduced whole here. Lines outside `TEXT` follow each block.

## web/games/missing-campsites/torchlight-loop.js

```js
const TEXT = {
  when: "Day 2 · dusk · the carrying run",
  goal: "Carry three of posts 16 to 19 into the five sites before Dell calls the van.",
  warn: "A post goes the first moment no light is on it. Sixteen is furthest. It will go first.",
  gentle: "A gentler run: the posts hold on twenty-five seconds longer.",
  open: "Dusk. The five sites behind you, the road ahead. Sixteen is furthest.",
  firstPull: "Heavy. The post comes up with a clod of the road still on it.",
  raise: "Rafe, on the walkie: \"Point it up the road. Further. There.\" Hold Space to raise the torch.",
  tick: "Your pencil is in your pocket. T ticks a post in the Tally, and the Tally does not forget.",
  swap: "The torch is yellowing. You packed spare batteries: B swaps them, if you stand still.",
  gap: "The gravel narrows here by a hand's width. Nothing else to see.",
  slotted: "Set in a slot at the five sites. It stands straighter than the road ever let it.",
  dell: "Dell, on the walkie: \"Van at half past. Whatever you're doing, do it now.\"",
  lowBat: "The torch browns at the edges.",
  dark: "The torch shrinks to almost nothing.",
  full: "Two is the most you can carry.",
  swapping: "You stop and thumb the batteries out in the dark.",
  swapped: "Fresh batteries. The circle whitens and opens.",
  end: {
    june: "The torch dies. June's walkie crackles, and she comes down the road with a lantern and walks you home.",
    van: "Dell calls everyone to the van.",
    win: (held) => `${held} posts stand in the slots at the five sites, and the road behind them is forest floor. Whatever crosses tonight, they cross with it.`,
    done: (held, ticks) => `${held ? `Only ${held} post${held === 1 ? "" : "s"} made it` : "No post made it"} into the slots, but your Tally holds ${ticks} ticks in pencil. The counter disagrees with you. The pencil does not.`,
    lose: (held) => `${held ? `Only ${held} post${held === 1 ? "" : "s"} made it` : "No post made it"} into the slots. The rest went while nobody was looking, and nothing in your notebook says they were ever there.`,
  },
};
```

Outside TEXT:

- "No post in the light to tick."
- "Post N: ticked in pencil." / "Post N is already in the Tally."
- "Post N comes out of the ground." / "Posts N and M set in a slot."
- Prompt in the light: "hold E · post N"
- (kept from before: "Past 16 the road is only forest floor now.")

## web/games/missing-campsites/pattern-walk.js

```js
const TEXT = {
  when: "The other side · the path out · glyphs 19 to 12",
  goal: "Walk back down the loop, glyph by glyph, to 12, before the car reaches the booth.",
  rule: "Every lost site stands rebuilt in trees. Your Sites page says what was there; the true glyph carries it.",
  gentle: "A gentler walk: the car waits for six forgotten steps, not four.",
  open: "Pearl light, no shadows. The trees stand in exact rows, and the rows are sites.",
  ask: "Marisol walks beside you. \"I checked every one of these in. Ask me.\" (A: ask her, three times.)",
  count: "Fifteen is blank in your notebook. You never walked it. But the ranger's book kept its counts. (C: read them, twice.)",
  r17: "A ring of saplings, like a wheel lying down. Somebody's bike stood here.",
  r16: "One tree here is taller than the rest, and darker.",
  r13: "Thirteen: blank again. The rows of trees hum when you look straight at them.",
  r12: "The creek is not here. The ground still bends where it went.",
  drift1: "White. You are standing where you were, and the step you took is nowhere.",
  drift3: "Somewhere behind you, an engine idles. A car is on the road to the booth.",
  wrongAsk: "Marisol frowns at her own finger. \"No… the table was the other side.\"",
  askSays: (k) => `Marisol: "That one. Number ${k}. I'd swear to it."`,
  end: {
    clean: (d) => `Glyph 12, and the path runs on toward 11. ${d ? "One step forgotten." : "Not one step forgotten."} You walk it the way the loop went, and you are well ahead of the car.`,
    win: (d) => `Glyph 12, drift ${d}. The ground forgot ${d} steps, and you are still ahead of the car, but not by much.`,
    lose: (d, at) => `Glyph ${at}, drift ${d}. Too many steps forgotten. You find the path again, but by the time you reach the booth, the car is already at the window, and the passengers have taken a map from the rack themselves.`,
  },
};
```

Outside TEXT:

- Glyph key labels: post; table (left = creek side); fire ring · double; tent pad, ● = a sleeper; crooked pad; hammock; wheel of saplings; tall cedar
- Count note on a row: "book: N persons"

## web/games/missing-campsites/reconcile.js

```js
const TEXT = {
  sheet: "Sheet 2 · Day 2 · morning",
  goal: "Set every site's row against what the paper claims, then forecast where the loss will reach.",
  rule: "What you write holds, even when it is wrong. What the paper prints does not.",
  open: "Morning at the camp table. The map is still warm from the sun. Start at row 4: rows 1 to 3 you wrote yesterday.",
  tilt: "Your torch is still in your jacket. Hold F to tilt the page under it: lost lines leave grooves.",
  grooves: "Six grooves in the legend's blank band, pressed by type that is not there now.",
  photos: "Inés sits down with the camera. \"I took the whole loop yesterday. Look.\" The file numbers skip.",
  accept: "You rub the line out. The paper looks surer than you feel.",
  forecast: "Every row is set. Now the pencil line: where will it reach by noon, and by dark? Tap the map.",
  dell: "Dell, over your shoulder: \"Noon's an hour off. Where does that put it?\"",
  groovesLine: "the legend had six lines more",
  copy: "copied into the notebook. In your hand, it holds.",
  end: {
    rows: (right) => `${right} of 21 rows agree with what happened.`,
    accepted: (n) => `You corrected ${n} note${n > 1 ? "s" : ""} to match the paper, and the paper will not thank you.`,
    fcRight: "The forecast is right: 12 to 15 by noon, 16 to 19 by dark. It moves the way you drew it.",
    fcWrong: "The forecast is off: it reached 15 by noon and 19 by dark, faster than your pencil.",
    copied: (n) => `${n} of Mum's lines copied; they hold.`,
    noCopy: "None of Mum's lines copied.",
    grooves: "One line notes the legend's grooves, so the six missing entries are in your hand too.",
    winLead: "A page that holds.",
    doneLead: "The page is written. Some of it holds, some of it is wrong and holds anyway.",
  },
};
```

Outside TEXT:

- Copy feedback: "Site 12: copied into the notebook. In your hand, it holds." (prefix is the postcard line's first sentence)
- Notebook line written by tilting: "the legend had six lines more"

## web/games/missing-campsites/pack-list.js

```js
const TEXT = {
  when: "Night 1 · the first fire",
  goal: "Say the whole list back in order on your turn, and last the round.",
  rule: "Each friend says every item so far, then adds one. The words fade.",
  gentle: "\"Hold the chain\" is on: the words stay in the air this time.",
  open: "The fire is going. Five of you, five seats. June starts, because June always starts.",
  lap1: "Inés: \"Harder now. Second time round, nobody gets help.\"",
  notebookUnlock: "Your notebook is open on your knee. You've been writing down what each of them added, without meaning to. (B: check it, once.)",
  phantomHeard: "Something in Rafe's list sounds like it belongs to someone else's trip.",
  challengeUnlock: "If you heard something nobody added, say so: Nobody said that (N), then tap it.",
  challengeOn: "Nobody said that? Then tap the thing nobody said.",
  caught: "Rafe looks at the fire. \"Did I? … I did, didn't I.\"",
  caughtNote: `Notebook: "${PHANTOM}". Nobody packed it. Site 5's table, 16:10, day 1.`,
  falseCh: "\"I did say that.\" A small silence. (Warmth −1)",
  accepted: "You say the kettle as if someone packed it. Nobody blinks.",
  notebookShow: "Your notebook, in pencil: what each of them added, in order.",
  juneOut: "June: \"…and…a…\" She laughs into her sleeve. \"I'm out. I'm out!\"",
  yourTurn: "Your turn. Say it in order.",
  addNow: "Now add something of yours.",
  end: {
    win: (w) => `June is out, laughing, and the round is yours. You caught the kettle; the line is in your notebook, in your hand. Warmth ${w}.`,
    accepted: (w) => `June is out, laughing, and the round is yours. You repeated the kettle as if someone had packed it, and now it is packed. Warmth ${w}.`,
    missed: (w) => `June is out, laughing, and the round is yours. Nobody mentions the kettle again, and nobody remembers who said it. Warmth ${w}.`,
    lose: (w, wanted, caught) => `You said ${w} where ${wanted} went. Everyone laughs; nothing else is lost.${caught ? " The kettle line stays in your notebook." : ""}`,
  },
};
```

Outside TEXT:

- (kept from before: "<item>"? Everyone laughs. Dell: "Out! Tam's out."; "<name> adds <item>."; "You add <item>."; "Waiting by the fire.")
- Band label: "<name> speaks"; progress: "Said N of M", "Now one of yours."

## web/games/missing-campsites/foil-supper.js

```js
const TEXT = {
  when: "Day 2 · dusk · serves 6",
  goal: "Six foil packets before the coals go grey, averaging 1.5 or better.",
  steps: ["Pick something from the cooler.", "Lay it in a space: Base, Body, Fat, Flavour.", "The pencil number is what it would score: 3 the card's own, 2 a swap the card allows, 1 edible."],
  gentle: "A gentler supper: the coals last four minutes.",
  open: "Dusk. The store's things are gone from the cooler, and Marisol has come to eat with you. Six to feed from food for five.",
  folded: "Dell takes the first packet and folds it tight, three folds, the way the card says.",
  jar: "June, from the bottom of the cooler: \"Whose is this?\" A jar, no label. Nobody packed it. (T: taste it, 20 s of coal.)",
  tasted: "You taste it. Lard, or something like it. It will do for a Fat, and the card would allow it.",
  marisol: "Marisol: \"I'll eat whatever's going. I've had worse at the booth.\"",
  low: "The coals are greying at the edges.",
  pickFirst: "Pick something from the cooler first.",
  untasted: "Nobody knows what it is yet. It goes in as edible, and no more.",
  end: {
    lead: (timeUp) => (timeUp ? "The coals go grey; the packets cook as they are." : "Every sheet goes onto the coals."),
    stats: (made, avg) => `${made} of 6 packets made, average ${avg.toFixed(2)}.`,
    warm: (avg) => (avg >= 2 ? "Warmth +2." : avg >= 1 ? "Warmth +1." : "Nobody says much."),
    win: "Marisol eats with the five of you, and says it is the best thing she has had all summer.",
    done: "Everyone is fed. Dell says nothing about the card's blank lines, and neither do you.",
    share: (who) => (who.includes(",") ? `${who} share other people's packets, and pretend not to mind.` : `${who} shares someone else's packet, and pretends not to mind.`),
    thin: "Nobody eats much. The foil goes back in the box, folded flat.",
  },
};
```

Outside TEXT:

- Ingredient name after tasting: "The jar: lard" / "Lard"
- New ingredient: "A jar, no label"

## web/games/missing-campsites/rangers-book.js

```js
const TEXT = {
  when: "Day 2 · the booth · 17:00",
  goal: "Make Marisol's totals balance before the booth shuts at 18:00.",
  rule: "Names of lost sites have gone from her book and the lines have closed up. Her totals have not. Permits went out in arrival order, one per site.",
  gentle: "A gentler evening: the booth stays open till 18:00 on a slower clock, and Marisol's hints come sooner.",
  open: "Marisol slides the logbook across the counter. \"Yesterday's. It's never been wrong before.\"",
  firstSum: "The pencil sum sits beside her ink, and they disagree.",
  tilt: "Your torch is on the counter. Hold F to tilt the page under it: lost lines leave grooves.",
  tilted: "Under the low light, strokes where no line is: a tally you can count, words you can't read.",
  locked: "The ghost row locks. Your pencil holds where her ink has gone.",
  ask: "Marisol is reading over your shoulder now. \"Ask me if you're stuck.\" (A: ask, once.)",
  asked: (n) => `Marisol: "Permit ${n}. That would be… I don't remember it. I must have issued it."`,
  half: "17:30. The light over the counter comes on by itself.",
  noBlank: "No blank rows left in the tray. Rub one out first.",
  hint180: "Marisol, over your shoulder: \"Permit 402. That would be… two?\"",
  partial: "Partial sums, in the margin.",
  end: {
    win: (lines) => `Every total balances. Three parties stayed at sites nobody remembers: ${lines}. The world rewrote its own records, and missed the sums. Three lines in your notebook, and Marisol has stopped smiling.`,
    lose: (n) => `18:00. Marisol closes the book gently and takes it home. ${n ? `${n} ghost row${n > 1 ? "s" : ""} locked in your pencil; the rest did not.` : "Nothing locked."} The totals still don't add up, and nobody but you minds.`,
  },
};
```

Outside TEXT:

- (kept from before: column-sum messages "Persons: N. She wrote 35." etc.)

---

# people-of-the-bark

## People of the Bark: narrative lines added in the refine pass

Every line below was written for the game, or taken from a DESIGN.md section 6 *sample line*
(marked **[D6]**: those are proposals written for the game, not source quotes). None is a quotation
of the source. Templated parts are shown as `{…}`. The author approves or strikes each line.

Source quoted verbatim (from DESIGN.md section 3; not additions): "At dawn, the bark people wake to a
strange vibration." (loading.js, unchanged) and "Their temples are carved into knots." (ring-door.js).

## loading.js
- Caption under the quote: "People of the Bark · the Tremor" (a source label, not narrative).

## crack-runner.js
- Intro: "You are Mossa, the fastest runner in Highridge. The Knot has read the night's omen, and Lowridge must hear it from you before it hears the rumour."
- Intro goal: "Reach Lowridge before {limit}. A fall is caught by lichen, but costs 8 seconds."
- Start beat: "“If it shakes, I go faster. That's the rule.”" **[D6]** + "Spring rain is running down the groove: jump the beads, or they sweep you back."
- First fall: "“Not the Long Fall. Not today.” The lichen far below is soft, and slow to climb out of."
- After the tremor (labelled "Fenn's scroll would say"): "dawn, east face, strength two. Dust is loose all down the crack now: roll under the sheets."
- Segment 2 (a tapper at the checkpoint): "“The walls get tall past here. Cling if you must, child, and climb.”"
- Segment 3: "Below, the lanterns of Lowridge, and someone waving one. She stops counting her steps."
- Win: "Mossa reaches Lowridge in {time}, on time, and gives the Knot's reading before the rumour does. On time +1. {She braced through the tremor and kept her feet. | The tremor threw her down a ledge.} {The lichen caught her N times.} “Three hundred and— never mind. I'm here.”" **[D6 for the last sentence]**
- Lose: "Mossa reaches Lowridge in {time}, after the limit of {limit}. The rumour got there first, and it was worse than the reading; morale −3. {…} Next run the Knot will send her earlier: a longer limit, and an earlier brace marker."
- Feedback messages added: "BOUNCED OFF A RAIN BEAD", "SEGMENT n/3 · CHECKPOINT", "BRACED" (HUD).

## crack-defence.js
- Intro: "You are Captain Burr. You have never fought anything bigger than a mite. Something as big as a city is climbing the crack from the Under, and the Knot's reading will say what it is."
- Monster card: "Burr: “Small ones we fight. Big ones we bow to. Middling ones, we ask the Knot.”" **[D6]** + "The Knot has said: fight."
- God card: "The Knot has said: a god. Burr lowers his spear, and looks almost relieved."
- Monster start: "“Battlements! Everyone on the— yes, you too.”" **[D6, shortened]** + "Mites first: the small ones always come first."
- God start: "“Spears down. Heads down. Nobody stands in its road.”"
- Beetle arrives: "“I'm not afraid. I'm ready. They feel the same from inside.”" **[D6]**
- Will at half: "IT REARS. IT PUSHES HARDER" / "“It's tiring! Hold! Hold, and it turns!”"
- God, line 3 passed (a child in a side groove): "“It has six feet. Gods have six feet?” Someone hushes her."
- Hush: "HUSH! THE PEOPLE LIE FLAT (n LEFT)", "IT PASSES OVER THEM. NOBODY BREATHES", "NO MORE BREATH FOR A HUSH".
- The Roll of the Bark (names and habits; the first two are DESIGN.md 6's own examples): "Tamsin, who whistled through the gap in her teeth"; "Orrin, who carved his spear-notches crooked on purpose"; "Pip, who was afraid of the dark and stood the night watch anyway"; "Bryony, who knew every lichen by its taste"; "Fell, who sang the wrong words to every chant"; "Moss, who kept a dead beetle's wing case as a shield"; "Ash, who always offered to carry the planks".
- Monster win: "The Beetle's will is spent and it turns back into the Under. {n} of 5 lines still stand. {The Roll of the Bark gains … : names.| No one is lost, and Burr's spear is still unblooded; he is glad of it.} The Battlements +4."
- Monster lose: "The crack is breached and the Beetle walks on toward Highridge, not hurrying. Bark integrity −5, the Battlements −3. {On the Roll of the Bark: names. | No one was left on a falling line.} {Next time a sixth warrior joins the squad.}"
- God win: "The visitor passes on its own, up and away over the ridge. {n} of 5 lines laid an offering; {…}. Nobody is lost, and Burr is glad not to have needed his spear."
- God lose (kept from before, plus): "Next time Burr will have breath for a third hush."
- Unlock messages: "NEW ORDER: F POURS SAP-GLUE, SLOWING WHATEVER WALKS IN IT"; "NEW ORDER: R SOUNDS THE FALL-BACK. CALL THEM BEFORE THE LINE BREAKS"; "NEW: R SOUNDS THE HUSH…"; HUD notes "its will drains while warriors face it" / "no warrior faces it: its will holds" / "mites first".

## omen-spread.js
- Intro: "Summer, at the Knot's table in Highridge. Elder Pell reads by the notches on the card edges now; his eyes are going. Two things have happened this week, and the city waits to be told what they meant."
- Windstorm head: "Bands of wind sweep the bark. Towers lean. The Knot lays out a spread." Backyard card: "a summer gust, nothing more".
- Start: "“The Trunk does not shout twice. Write it down.”" **[D6]**
- First card laid: "He taps the card's edge twice. “A card means what we do after it.”" **[D6 for the quote]**
- Three laid, Backyard card unturned: "“Before you lay it: the Backyard card is yours to turn, not mine.”"
- Ask Pell: "He runs a thumb over the notches. “{card}. In the {slot}, I think. But you choose.”"; also "“Choose a card first. Then its place.”", "“Which card? Pick one with its number.”", "“The table is full. Take one back first.”"
- Wind laid: "“A trial. Yes. Lash the towers.” He does not know why it will work. It will." / "“So it is written.” He sets the cards back in the deck, in order."
- Beetle card: "The wind has hardly dropped when a runner from Splinterwatch falls through the door. Something as big as a city is climbing from the Under. Captain Burr, at the window: “Small ones we fight. Big ones we bow to. Middling ones, we ask the Knot.”" **[D6 for the quote]** + "Lives depend on which."
- Beetle laid: "Burr is already buckling his helmet." / "“Then we bow, and we get out of its way.”"
- Ending: "The wind was read as {belief}{, which fits the gust: the towers are lashed and the next storm does no harm}. The Beetle is read as {a monster: the warriors will hold the crack | a god: it will be escorted}. … Painted on the ridge: “{crown}” and “{crown}.” … You left {one Backyard card | both Backyard cards} face down."

## sap-kitchen.js
- Intro: "Old Resin's kitchen, the first warm week. Her book is mostly blank and she means to fill it before she dies. Today your hands do the lifting." + "“Sacred water. Lovely. Pass me the sacred water and a spoon.”" **[D6]**
- First recipe found: "“Too hot and it's glue. Too cold and it's a puddle. Like people.”" **[D6]**
- After two pots (a Knot novice at the door): "“Elder Pell asks, if there is anything gold in the pot today, for the shrine.” Resin: “Gold. Hm. Thin and sweet, then.”"
- Last pot: "One pot of sap left. Resin taps the book where it is still blank."
- Taste: "Resin licks the ladle. “It'll come out {thickness}{, and crumble}.” {n tastes left. | That's all the tasting you get.}"
- Cooking: "The pot rolls over. Resin hums." Empty: "“Start again.” The order is emptied and the paddle set down." Full pot: "“Three.” Three is all the pot will take."
- Three misses: "Resin, not looking up: “The {hint} one wants to be {thickness}.”"
- Start (gentle): "Resin has chalked the heat chart for you."
- Win: "Three new pages in Old Resin's book: {names}. She closes it with her ladle and tastes the ladle."
- Lose: "… Resin scrapes the pot: “Next time we taste first.” {Next visit she will fill in the heat chart for you, and spare 60 sap.}"

## ring-door.js
- Intro: "Elder Pell's eyes are failing, so tonight your hands are his. The door is the knot's own growth rings, cut free." (after the verbatim source sentence)
- New chronicle glyphs: "The First Temple: Knotholm was carved around this knot, ring by ring, so the door would always know its way."; "The Long Crack: The road first run from Lowridge to Knotholm, by a runner whose name is worn away."; "The Scroll House: Scholars began to write the tremors down, so the gods would not have to repeat themselves." (the last clause follows DESIGN.md 5's lore table).
- First move: "“See? Ring {n} moved too, the other way. The knot grew them together.”" / "“The heart ring turns alone. The others drag their neighbour.”"
- Ring revealed: "“{glyph}. The Trunk does not shout twice. Write it down.”" **[D6 for the quote]**
- One over par: "“Gently. Every extra turn is a cut in the living bark.”"
- Hint: "One ring glows where your hands keep missing it."; Pell's hand: "rests on ring n: “This way, with the sun.” / “Back. Against the sun.”"
- Reset: "“Back to how the knot was found. The Trunk remembers the turns.”"
- Start: "“Count before you cut.”" / (gentle) "“Take my hand when you need it. I have four turns of help in me tonight.”"
- Door opens: "swings in without a sound. A clean cut." / "swings in, grinding. {n} scars in the bark around it."
- Second door: "{The First Ring is open, clean. | …with n scars.} Pell leads you down, under Knotholm, to an older door. The second ring here is stiff with age: it moves two steps for one push."
- Win: "Both doors open on clean cuts: {…}. The Knot +{n}. Pell runs his thumb along the Great Flake ring and says nothing for a long time."
- Done: "Both doors open: {…}. The careless turns cost the bark {n} points of integrity{; the clean door pleases the Knot, +4}. The temples are open all the same. {Next time Pell will lend his hand more often.}"

## trunk-and-shadow.js
- Intro: "Lanterns in the square, the whole city watching. The festival board is a flat flake; you play the Folk, and Captain Burr, who has never fought anything bigger than a mite, plays the Shadow."
- Read Burr: "Burr glances at the board. That is where the Shadow will go, whatever you do now." / "Burr glances at the chanters and does not move."
- Wait: "The Folk hold where they are." Rain: "Rain: a blessing. This Folk moves again."
- First Folk on the Crown: "Somewhere in the crowd, Twig: “And then what?”" **[D6 for the quote]**
- Chant skip: "“…” Burr bows his head for the chant."
- Round 9: "“Louder, then! Let's hear it!” Burr waves the crowd on, grinning." / "The lanterns are lit and the whole square takes up the chant: the Eye card can be used once more."
- Burr's extra lines: "“I'm not afraid. I'm ready. They feel the same from inside.”" **[D6]**; "“Chant all you like!”"
- Hidden: "{n} Folk hidden by the Shadow. They will come back at the Root."
- Start: "New: tap Burr's portrait (W) to read where the Shadow will go next. Two looks a game." / (gentle) "Burr, cheerfully: “I'll go easy. Watch my eyes, if you like.”"
- Win: "“Well run! Well run.” He means it." / "Three Folk stand on the Crown in round {n}. Burr laughs, bows to the board and polishes his spear. The square cheers; the Battlements +4, morale +5. {The Shadow hid n Folk on the way. | Not one Folk was hidden.}"
- Lose: "Round 16 ends with {n} Folk on the Crown. Burr wins the festival game and looks almost sorry about it; a loss takes nothing. The Folk will try again at summer's festival. {Next time, Burr says, he will go easier, and let you read him more.}"

## tremor-scroll.js
- Intro: "The Scroll House, summer. Fenn has not slept. The drum has a line for every day the world shook, and the Battlements want to know when it will shake next."
- Start: "Fenn, in the margin: “Look at the dawns first. Then look at the storms.”" / (gentle) "has underlined what each column usually holds. “Look at the dawns first.”"
- Lamp: "Fenn's lamp lights every {weather} day in the record. “Look at what the {weather} days did.”"
- Wrong order: "Choose a face before a strength."
- Summer sealed: "“Dawn. East face. Strength two. Again.” She is almost smiling." **[D6]** / "“Close. The storms keep it in. Write that down.”" / "“Nothing. Then we were reading the wrong thing.”"
- Autumn card: "A leaf the size of a country has fallen past the Scroll House. The drum has turned on, and the tremors keep new hours: something now shakes the world at noon, every noon, from the north."
- Autumn start: "“It is not a god. Or it is a god with a routine.”" **[D6]**
- A runner's note pinned to the drum: "“Lowridge felt nothing at dusk on the twelfth, nor on the eighth. They thought the Trunk was sleeping.”"
- Win: "{n} of 9 forecasts right, {f} of them fine. The Scroll House +{n}. Fenn can now say when the world will shake, if not why. In the backyard, a squirrel keeps its hours."
- Lose: "{n} of 9 right; the Battlements laugh at the scribes, and the Scroll House gains only {n}. The pattern was on the drum: dawn east, dusk west, nothing in storms; in autumn a noon from the north, rain days only noon, and every fourth dusk empty. {Next sitting, Fenn will underline what each column usually holds.}"
- Kept from before: "Fenn holds the lamp while the drum turns."; "quietly: “It keeps hours. Like us.”"; "turns the drum back and reads it again."

---

# stuffed-ones

## The Stuffed Ones: narrative lines added in the refine pass

Every line below was written for the game. None is a quotation, so the author can approve or strike each one.
Lines in `${...}` fill in a name or a number. Verbatim source lines that are used, all already quoted in
DESIGN.md, are listed at the end and are not additions.

## web/games/stuffed-ones/stitchwork.js
- Intro goal: "The second night, before dawn. A seam split while the pack slept. Close it in ten stitches before Mabel comes with her sewing tin."
- Intro note: "Too tight tears the thread. More stitches unlock as you sew."
- Gentle offer: "Two seams left open. Gentle thread is ticked for you: more time, a slower pull, a wider beat."
- Opening beat, Lila: "Lila's seam. She was the hungriest, so hers split first. She lies open on the shelf beside you and does not move."
- Opening beat, own: "Your own seam. It opened along your side while you held still. Something warm is close to coming out."
- Beat (stitch 4): "The pulse. Across the room the pack's one heartbeat comes down the thread. When the chart flashes red, press Steady (S) or the needle slips."
- Beat (stitch 7): "Grey at the window. The first birds would be singing, if the forest let them. The thread pulls faster in the cold."
- Beat (20 s left): "Gravel on the path. Someone humming, coming up to the porch with a sewing tin."
- Win/done effects: "Lila's seam is closed, barely; the hunger will find the gaps." / "Your seam is closed, barely; nothing more will fit in it." / "Lila's hunger will rise more slowly now. She does not say thank you; she cannot. She is very still." / "Your seam can hold one more memory. You choose not to think about which." / "The pulse never once got into your hands."
- Ending text frame: "${grade} seam, ${q} percent, with ${n} s of dark to spare."
- Loss: "Mabel's key turns in the lock. You go still with the needle in the cloth, ${n} of 10 stitches in. The seam stays open, and she will see it when she dusts."
- Feedback: "in: perfect / good / off the point", "perfect stitch", "good stitch", "loose", "too tight: torn", "unpicked: −3 s", "steady", "between beats", "the pulse jerks the thread", "the needle slips", "The thread tore. Rethreading…".

## web/games/stuffed-ones/hand-sewn-book.js
- Intro goal: "Under the cabin, the third night. Your friends hold the doorway. Read three spreads before the glows reach the page."
- Slow-glows offer: "The glows took you twice. Slow glows are ticked for you."
- Beat (start): "Spread I. Four strips. Red thread is an act, black a thing, white who. The glossary names what Mabel's sampler taught you."
- Beat (spread III): "New glyphs. A hand, a mouth, a knot: you don't know these yet. The walls are covered in them. Read the walls (R) to learn their names, but the glows come on while your back is turned."
- Beat (spread V): "In your pocket. Mabel's sampler from the parlour wall: one line already solved in her small, even stitches. Use it (H) to set a strip, twice. One strip on this page fits no line at all."
- Beat (half time), framing line: "Marcus, from the doorway. He has his back to you, watching the glows." (his quoted line is DESIGN.md section 6's own added line, not new here)
- Beat (30 s left): "The edge of the page. The glows are at the margins now. Something soft leans against your ankle, and waits."
- Win: "All three spreads read, with ${n} s to spare[, and never once turning your back on the glows]. You know how to bind, how to feed it, and what the filling is:" (then the verbatim ch 12 line)
- Done: "The glows close over the margins and the page goes warm under your hands. You read spread ${list}; spread ${list} stays unread. What it says, you will learn the other way."
- Loss: "The glows close over the margins before a single line pulls taut. The book stays shut to you, and something soft leans against your ankle and waits."
- Feedback: "That slot is sewn in ${c}: it takes only ${c} thread.", "It sits, but a rule is broken.", "The spread pulls taut.", "The walls: ${names}.", "Mabel's even stitches show you where it goes.", "You already know every glyph on this page."
- Rule wording changed: "a needle comes right before its thread", "a knot ends the line".

## web/games/stuffed-ones/parlour.js
- Intro goal: "Day two, late morning. The guests are out on the hike; their counting game lies mid-play on the table. Move their pegs so the wrongness finds each of them, and be back on the shelf before anyone walks in."
- Slower-hike offer: "Caught twice. A slower hike is ticked for you."
- Beat (start): "Three tampers. Read your notes along the bottom. The pegs are big felt buttons; the spaces are stitched symbols. Pick what each of them will find."
- Beat (first tamper): "The first peg. It is still warm from their hands. Somewhere on the trail they are laughing about something else."
- Beat (first personal tamper): "You know where this one belongs. Nobody wrote it down. You watched, and you remembered. That is the worst of it."
- Beat (first window look): "A shadow at the window. Wes, on the porch with his camera, cups a hand to the glass. Hold still (Space, or hold the button) until he looks away."
- Beat (seen): "At the window. A shape in the glass, a hand cupped against the light. Then the porch boards creak toward the door." + "Wes saw something move on the table. He is coming in."
- Beat (footsteps): "Voices on the trail. The hike is coming back early, or right on time. Leave now and the climb takes four seconds."
- Notes heading: "what you watched from the shelf:"
- Win/done tails: "Back on the shelf before the door opens." / "When they sit down tonight, ${names} will find their own symbol under their peg, and say nothing about it to the others." / "Tonight they will argue about who moved the pegs. Nobody will think of the shelf." / "Someone will say the board got knocked. Nobody will quite believe it." / "Wes keeps glancing at the window."
- Done (nothing touched): "Back on the shelf having touched nothing. The pegs are where the guests left them, and the hunger has not been fed."
- Loss: "${Name} comes in while you are still on the table. A slip: one memory goes. For a moment ${Name} stares at the cat by the board; then a laugh, too loud, and you are carried back to the shelf by hand."
- Feedback: "Put back, as if nothing happened.", "He looks away.", "You are holding still. Let go first.", doorway states "voices outside / on the steps / at the door!", window states "porch / at the glass / looking in".

## web/games/stuffed-ones/stuffing.js
- Intro goal: "The second night, before Scent and Proximity. Your body lies open like a sewing pattern. What you pack is what you keep: keep five, keep something of each friend, and don't let the hunger lurch."
- Beat (start): "Gold thread. Spread 2 taught you to bind one slot. Choose it with Bind (B): whatever sits there, the night cannot take."
- Beat (Ruth's round, after four packed): "Ruth's evening round. She checks the windows, then the shelves. She turns you over, says nothing, and pulls your ${seam} seam tighter by hand. One hollow is gone; whatever was in it is back in the tray."
- Token recollections (shown when a token is first picked up):
  - My name: "Your own hand in the guestbook, under all the other names."
  - The drive up: "The forest road, four voices over the radio."
  - My hands: "The feel of a needle that was the right size for you."
  - Jamie's question: "At breakfast, the one who asked first."
  - Jamie's bad postcard: "Deliberately terrible, as every trip since you were nine."
  - Lila's hum: "Three notes, the same three, whenever she was nervous."
  - Lila's mushroom photo: "Crouched by the creek, so pleased with a small brown cap."
  - Marcus's strap: "The strap you mended at the table. It held."
  - Marcus's paper map: "Folded wrong, always, and always right about the way back."
  - The chili: "Camp-stove chili, though the cabin had a kitchen."
  - Dani names the toys: "She stood at the shelves and gave them names."
- Night log: "...(its own seam had nothing to give)."
- Endings: "Enough is left of you for the Warning, and something of each of them: Jamie, Lila, Marcus, Dani." / "The hunger lurched in the night and took what it wanted from the warmest seam." / "Nothing is left of ${names}. You know there was someone; you cannot think who." / "Too little is left of you for the Warning." / "You joined both games / one game." / "You held through both games."

## web/games/stuffed-ones/labyrinth.js
- Intro goal: "The third night, the Chase. You are the cat; Lila is with you. Herd Noor, Wes and Ana through two rings to the warm centre before dawn."
- Slower-night offer: "The herd scattered twice. A slower night is ticked for you."
- Beat (start), after the verbatim quote: "The outer ring. Come at them from behind, never too close. The door with the turning thread, down the left side, leads back."
- Beat (12 s): "Twitch, and hold. A twitch is seen without a step: it turns a guest without closing on them (T). And when you need nothing to move at all, the whole pack holds still (hold Space)."
- Beat (first loop door), after the verbatim quote: "${Name} steps through and is where the ring began."
- Beat (inner ring): "Jamie. ${Name} is in the inner ring. Behind you, Jamie has come down through the trapdoor; he stands below the far loop door and will hold there until you lead him. Step (S) is yours now: a step forward, seen from far off, and hungry work."
- Beat (first to the centre), after the verbatim quote: "${Name} stops in the warm room and does not turn round."
- Win: "All three went down to the centre in ${m:ss}, with ${n} memories left[ and no lurch]. The warmth rises through the floor." (then the verbatim ch 32 line)
- Loss (dawn): "Grey light comes through the boards. The herd scattered and the rhythm broke; the ring begins again from its entrance."
- Loss (memories): "The hunger lunged one time too many. Nothing of you is left to herd with; the rhythm breaks, and the ring begins again from its entrance without you."
- Feedback: "The hunger lurches you forward. One memory gone.", "A woven wall.", "froze", "lurch", "−15 hunger", "step · +12 hunger".

## web/games/stuffed-ones/dollhouse-cutaway.js
- Intro goal: "The first night of the hunt. Noor, Wes and Ana are asleep; Ana still reads in the parlour. Join the pack's Sound game: frighten them to 35 dread on average by 05:00 without being seen to move."
- Intro note: "Still in an open eye is safe; moving in one is a slip. More plates follow as the night goes on."
- Slower-night offer: "Two nights lost. The slower night is ticked for you."
- Beat (23:00): "The cat on the landing shelf, Jamie the bear in the kitchen. Three taps (4) need you both at one bedroom door, and Switch toy (Tab) moves him."
- Beat (first scare), framing: "From the bedrooms. Ana, then Wes, half asleep:" (then the verbatim ch 26 lines)
- Beat (01:00): "Ana's book closes on her finger. The parlour lamp goes out; the parlour eye is shut, for now."
- Beat (03:00): "Wes turns over and over. The lamp is still on; he sleeps lighter now, and his eye opens more often."
- Beat (hunger 75), framing: "The hunger. Ruth's whisper, from the day you woke:" (then a verbatim ch 17 excerpt)
- Beat (hall light): "The hall light. ${Name} gets up to look. The switch clicks: the hall and the landing are lit. Nothing in them may move until it goes off."
- Feedback: "In the hall light, ${Name} sees the cat / Jamie move.", "Click. The hall goes dark again.", "${Name} saw something shiver on the shelf.", "IN SIGHT: DON'T MOVE", "HOLDING STILL", "seen · −1 memory", "you shake", "lurch · −2 memories".
- Win: "05:00. Grey at the windows; the pack is back on the shelf. ... At breakfast ${Name} will ask who was up in the night, and nobody will say it was them."
- Done: "They will sleep late and laugh about the old cabin over coffee. The pack plays again tomorrow night."
- Loss: "One slip too many, one lurch too hard: nothing is left of you to hold still with. In the morning a cat plush lies on the landing floor, and someone puts it back on the shelf without a word."

## web/games/stuffed-ones/loading.js (new tips)
- "Dollhouse: Three taps at a bedroom door bring the guest out, and the hall light on."
- "Stitchwork: when the pack's pulse beats through the thread, Steady the needle."
- "Parlour: when a face comes to the window, hold still. A toy on the table is a toy someone left there."

## Verbatim source lines used (already quoted in DESIGN.md; not additions)
- Book intro: "Symbols stitched into the walls. / A circle of torn fabric skins. / A book made of hand-sewn pages." (ch 11; DESIGN 3.12). Book win: "The ritual had already begun the moment we stepped inside." (ch 12). Spread translations as before.
- Labyrinth: "The trapdoor opened on its own.", "We didn't rush. We didn't pounce. / We herded them." (ch 31); "Doors that led back to where we started.", "The deeper we went, the warmer the air became." (ch 11); "We were the hunters." (ch 32).
- Dollhouse: "Did you hear that?" / "Probably the house settling." (ch 26); "The hunger. Don't fight it. It's what keeps you alive." (ch 17, an excerpt of Ruth's line).
- Book, Marcus: "There's always a way out. You just haven't drawn it yet." is DESIGN.md section 6's own added line, not a source quote.
- Parlour notes (unchanged): Ana's "so she isn't alone" (ch 25).

---

# wrymwretch

## WrymWretch, refine pass: narrative lines added for the game

Every line below was written in this pass and is not a quotation. Where a line carries a verbatim
quotation (shown on screen with its WW line), only the words outside the quotation are added; the
quotations themselves are the ones DESIGN.md already quotes (WW 33, 39, 59, 61, 71, 73, 77, 79, 85,
87, 91, 93–95, 145, 149, 155). `{…}` is a value filled in at play time. Short UI prompts that only
name a control (for example "Pick a row's slot first") are left out; the how-to-play legends are
listed per file because they now carry each mode's goal line.

## web/games/wrymwretch/loading.js
- Tip: "Twin flight: when the sail tears, dive under Aeris before six seconds run out."
- Tip: "Forgetting run: tap Recall just before a faint ledge; lanterns and remembered ground give Focus back."
- Tip: "Star Chart: the ringed stars are the figure you are drawing. Name it before the grey cloud drifts over."
- Tip: "Concentration: faces blank to clear glass as you play. Lead a face you have seen and it will not blank."
- Tip: "Heartstone: still is right, a slow wobble is one step off, a fast one is far. Ring a shard to hear if it belongs at all."
- Progress caption: "{n} / 6 realms" … "remembered".

## web/games/wrymwretch/twin-flight.js
- Goal: "Bring Aeris down from the sky-cities to the far peak."
- Opening: "Aeris Galewing steps off the edge of the sky-city on a sky-sail. Her people sent her down to seek aid; the road below is cloud and confused wind."
- First gust: "The winds are confused: the brush strokes push one way, then the other."
- The tear: "The confused winds tear the sail. Aeris falls, and something vast and pale dives out of the cloud beneath the sky-cities."
- The catch (clean): "She lands on his neck as if she had always ridden there. Aetherius speaks into her mind:" + WW 145.
- The catch (late): "He reaches her only at the last, and her shoulder strikes his scales. Aetherius speaks into her mind:" + WW 145.
- Then WW 149, with the caption "thermals lift; flaps are weak, wind is everything".
- Second seal: "The second seal. Below the cloud the Galewing Peaks stand in ink, and the air smells of rain."
- Third seal: "The cloud breaks. Thermals rise off the peaks, and behind the pair the wind leaves" + "silver trails across the sky" (WW 155).
- Turned back: "The scroll rolls back to the last seal."
- Win: "Aetherius rides the last thermal over the far peak with Aeris on his neck{, her shoulder still bruised from the late catch}. {Turned back n times / Never turned back}, {n} scale hits on the way down{; she sang n times}. The help her people sent her for is below."
- Loss: "Sent back a third time, {the pair loses / Aeris loses} the road between the sky-cities in the cloud, {n seals short / before the first seal} of the far peak. The scroll rolls shut."

## web/games/wrymwretch/forgetting-run.js
- Goal: "Get Thalen to the outpost gates before the blank page catches him."
- Opening: "Thalen Cedarheart has seen the moss grey at the split tree. Behind him the western groves are going blank, and the outpost has to hear it from him."
- First outline: "The path ahead is only outline: the forest has half forgotten it."
- First post: "Past the split tree the moss is grey, crumbling" + WW 33.
- Second post: "A stag with silver antlers breaks from the pines ahead and runs where the ground still holds. The edge quickens."
- Third post: "Smoke from the outpost chimneys, drawn in two strokes."
- Lanterns: "A ranger's lantern, still lit. He remembers lighting it." / "The lantern at the old ford." / "The last lantern before the gates."
- Caught (first): "The white closes over his heels. Cedarheart memory −3."
- Fallen: "He falls through ground that was never remembered."
- Win: "The outpost gates ink in and Thalen is through, {after n setbacks / untouched by the edge}, with {n} Focus left. The rangers look up." + WW 39.
- Loss: "The blank page closes over the path a fourth time, {n}% of the way to the gates. The outpost never hears what Thalen saw at the split tree."

## web/games/wrymwretch/star-chart.js
- Plate caption and goal: "Plate I · The Priory"; "Redraw the three constellations the sky has lost, before dawn."
- Opening: "The Priory of First Light, at night. The constellations flicker" + "like dying embers" (WW 85) + ", and Scholar Seraphyne asks you to lay the lost lines back while the party still remembers them."
- Stag named: "The Stag takes the gold, and the Priory's scholars lean in to see. Then a grey cloud of forgetting comes over the glass from the west."
- Harp named: "Seraphyne's fingers tremble on the glass." + WW 91.
- Cloud: "The cloud passes and {n} lines forget themselves. Name a figure before it drifts over."
- Read a star: "Seraphyne reads the star: it holds {n} lines in its figure." / "…: it belongs to no figure tonight."
- Sigil: "The gold lines lift from the stars they were laid on."
- Win: "Three constellations gilded and recorded, {n} wrong namings{, n stars read}. The lines gather into" + WW 87 + ". The Priory elder asks," + "And the name?" + "Seraphyne answers:" + "Already fading." (WW 93–95).
- Loss: "Dawn comes up over the Priory. {The Stag … kept in gold; the rest / The three constellations} fade with the night, and the sigil Seraphyne feared stays unseen."

## web/games/wrymwretch/slipping-glyph.js
- Goal: "Read three rows of the monolith by what stays."
- Opening: "Lunessa Tidecaller dives through a sea that clings like oil, down to" + WW 71 ("a monolith carved with symbols her mind refused to hold").
- Row one read: "The first row holds in gold. Lunessa's chest is tight: the water clings to her skin like oil, and the fish have gone."
- Row two read: "Something in the stone stirs at being read. The glyphs slip faster now."
- Sketch: "Sketched (row {n}). The page will not keep it long."
- Purify: "Aquatica's Purify: the water clears, and row {n} holds still for five seconds."
- Win: "Three rows read from the monolith{, n wrong}{, n sketches lost to the water}. The fourth row has nothing that stays, and as Lunessa reaches for it the surface devours." + WW 73.
- Loss: "Three wrong runes{, n rows read}. The monolith devours what was read, and" + "the meaning slid away like a dream upon waking" (WW 71) + ". Lunessa kicks for the light with nothing she can keep. Tidecaller memory −3."

## web/games/wrymwretch/concentration.js
- Goal: "Keep 8 of the ten creatures before their faces go."
- Opening: "With the Tidecaller healers. The bestiary's creature pages are going blank with the plague, and the healers need eight of them whole to sing the healing song."
- First blank: "A face goes to clear glass. It is still a card: turn its partner, then the blank, and say This is the one."
- Plague quickens: "In the next room a sleeper cries out and forgets the healer's name. The plague quickens."
- Four kept: "A Tidecaller healer reads the kept pages aloud, one by one, so the room will not forget them twice."
- Eight kept: "Eight creatures held. The healers begin to hum the healing song the Galechanters asked for."
- Lead: "Lead set round the {creature} {picture/name}. It will not blank."
- Win: "{n} of 10 creatures kept{, n of them from clear glass}. The healing song is written into the Record for the Galechanters, and the kept pages ink back in. {Still clear glass: … / Not one face was lost.}"
- Loss: "{n} of 10 creatures kept, short of the 8 the healing song needs. The healers stop humming; {names} stay clear glass."

## web/games/wrymwretch/six-realms.js
- Goal: "Beat the Syndicate Elder at the tribes' own game."
- Opening (turn log): "Under the Syndicate's labyrinth, Kael Duskbane sits across from the Syndicate Elder. Behind the elder hangs the key to the forbidden chamber. “Play the tribes' game,” the elder says, “and I will know whether you understand the world.”"
- Your first capture: "The elder taps the taken piece twice, the Syndicate's way of saying well played, and does not look up."
- The elder's first capture: "“A tribe that forgets where its enemy stands,” the elder says, “is a tribe that will be forgotten.”"
- First tide: "The first home hex drops its tiles into the dark under the table. Ilvarra goes quiet: this is how the realms are going."
- Round 9: "The elder turns the tide-glass over. “The Tidecallers play it faster. So shall we.”"
- Recall opens: "You stand on Wrymreach with a tribe lost. Recall is open: once a game, bring it back to an empty home hex instead of moving."
- Ilvarra (new lines): "your Dark is face-down until it takes or an enemy stands beside it. Select it: it can also trade places with a friend within two hexes." / "Wood leaves a Grove where it stood; the elder cannot step there for two turns. Earth can raise a Stone instead of moving (twice)." / "'Show threats' marks every hex the elder can reach. Undo takes back one move, once." / "that piece cannot go there. The bone dots are where it can."
- Win: "{how} The Syndicate Elder sets down the key, and Kael opens the forbidden chamber. On the pedestal of bone:" + WW 77 + WW 79.
- Loss: "{how} The Syndicate keeps its key and its trust. Kael will have to go round through the guarded gallery instead."

## web/games/wrymwretch/heartstone.js
- Goal: "Tune one shard to each slot so the ring holds a memory."
- Opening: "The Heartstone hall, under the Stonekeepers' city. The great crystal is going dim and cannot be saved, but one shard tuned to it can keep {the founding / the vision / the song}. Elder Rhyla kneels at the bench."
- First still line: "One line lies still, and the stone answers it with a glow. Rhyla's hand is on the crystal." + WW 59.
- Tremor (after strike 2): "A tremor runs through the gem-lit hall, and dust falls from the vault. Shard {n} cracks in the tray." (caption: "The Deep Core is waking")
- Ring a shard: "Shard {n} rings and the ring hums back: its pitch is in the chord." / "Shard {n} rings dull against the ring: its pitch is not in the chord."
- Win: "Every line lies still. The Heartstone cannot be saved, but its tuned shard keeps {the tribe's founding / Rhyla's vision / the Stonekeepers' song}, with {n} strikes to spare. Mosswhisper's memory is anchored through the next two drains, and Rhyla sets out for the Deep Core."
- Loss: "{Too few shards are left whole to fill the ring. / The last strike fades with the lines still shaking.} The Heartstone goes dark, and {the founding of the tribe / the vision / the Stonekeepers' song} goes with it. Rhyla keeps her hand on the cold stone a long moment before she rises."

## Rules and numbers added or retuned in this pass (for approval with the lines)
- Twin flight: the sail phase, the tear and the six-second catch now play as phases (DESIGN.md 10 names them; their controls are added). After two losses: five hits per seal and gusts at 60%.
- Forgetting run: grey moss that crumbles (from WW 33), Dash (15 Focus), Focus +5 a second on remembered ground, Focus back to at least 50 after a setback. After two losses: the edge 30% slower (the design's own option).
- Star Chart: the current figure's stars are ringed; Read a star (3); the drifting cloud. After two losses: dawn at 8, five reads.
- The Slipping Glyph: the notebook (rule 4) is back; slips quicken to 1.1 s after row two. After two losses: 2 s slips, two Purifies.
- Concentration: Lead a face (2, a flip each); the interval drops by one at half the flips; a blank falls on an already-seen card when there is one. After two losses: 50 flips, interval 7.
- Six Realms: the tide forgets every second round from round 9. After two losses: two undos, two elder mistakes.
- Heartstone: Ring a shard (3, no crack); per-shard notes of past strikes; a tremor cracks one uncracked tray shard after strike 2. After two losses: seven strikes, Gaia twice.

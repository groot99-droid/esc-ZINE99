# The Redacted Testament of Lira Calyx: deep dive

Source: `05_Worldbuilding/02_The_Redacted_Testament_of_Lira_Calyx.md` in the `Pipelines-Plugin` vault (`creative-writing/vault/`). Lines quoted from the source are verbatim from that file; lines quoted from `DESIGN.md` are named as such. Everything new in sections 2 to 4 is a proposal, and section 6 lists each invention.

## 1. Where it stands

**What works.** The journal as the interface. Hand against relay: a slow true number against a fast poisoned one. The Node Board, which plays the author's stability criterion with a real eigenvalue. The margin hand, a relationship built in eight notes. The as-written ending is the default and is earned.

**What does not.**

1. **Lira has no want.** DESIGN.md gives her "To know what is true and to say it", which is a job description. Nothing is hers to lose but her life, and the sleepless final chapter is read at a desk, never played.
2. **The middle has one reversal and it arrives late.** Joren's betrayal comes at minute 106. The real twist, that the relay was poisoned years ago, is spoken by Veylor at minute 145, when the player can no longer act on it. The central system punishes in retrospect.
3. **The opposing force is absent.** Veylor has eight lines in the last half hour. Until then the antagonist is a seal on a page. The archivist is a hand with guilt and no history.
4. **Two endings are a button.** Stand down and Set the charges are chosen on the last screen with no preparation and no price to reach them.
5. **The layers barely touch.** A climb writes one node. The lens writes plates nobody reads again. Each mode repeats its first trick: the lens three times, the audit three times, the relay choice ten times.
6. **The art is three styles.** The existing stills are a photographic film frame (`reference/02-pattern-alpha.jpg`), a cel-painted background (`assets/locations/subterranean-city.jpg`) and clean studio object illustrations. The page itself, where the player spends the game, has no designed handwriting.

## 2. The story, developed

**Dramatic question.** When the instruments, the record and her own hand can all be written on by someone else, what can one honest observer still vouch for?

**Want and need.** Lira wants a clean result under her own name: one model, one author, vindication after being branded a saboteur. She needs the opposite: to let other hands into the book. A child's copy, a singer's breath, a censor's correction and an engineer's confession are the only data nobody seeded.

**The opposing force.** Veylor wants to be checked by someone good enough to check him. He belonged to "a lab consortium that ceased public operations months before the Convergence": they saw it coming and built ReGenesis as triage. The Mid-Slopes are "Dense forests grown from radiation‑resistant seeds", and the game says whose seeds. Hollin Terrace, the place the player is taught to love, is his first Genesis working. His argument: he was right once, and terraces trading compounds as currency are the old weakness growing back.

**Characters.**

| Character | Want | Secret | Scene |
| --- | --- | --- | --- |
| **The archivist** (unnamed, as in the source) | To keep her alive long enough to finish | They are a Continuum clerk of excisions. The surgical black bars are their other handwriting. "They were not the person Lira trusted" because Lira had reason. | **The Excision Desk** (NEW): the player is handed her brief, a black pen and a quota. |
| **Veylor** | A measurer honest enough for the world after | He wrote the dichotomous key Lira has used since minute 11. Its couplets are his prose. | **The Flyleaf** (NEW): in Cinder Reach, the key's first printing, initialled S.V., with the player's own Book I pencil couplet already written in his pencil. The source: "He reveals that he anticipated her model". |
| **Joren** | To raise the drowned terrace | He drowned it. He opened the sluices on a relay river level, the first false number anyone here trusted. | **The Sluice Log** (NEW): the logbook in the sluice house on his harvest terrace, the relay figure in his own hand. |
| **Pell** | To count as well as Lira | She copies Lira's numbers into her own book in capitals, every evening. It is the one off-site copy of Book I. | **Pell's Book** (NEW): while her family packs, she gives it to Lira. |

**The secret under the story.** "Coordinates are excised in a cipher." and "Pages arrive with black bars—some clumsy, some surgical." (both `05_Worldbuilding/02_The_Redacted_Testament_of_Lira_Calyx.md`). The clumsy bars are censorship; the surgical ones are a message. Each is ruled to a length and set on a line; laid under a four-line staff they are neumes, in the notation the sealed archive is written in. The scrap "She’s close. Move the logs." was an order to the archivist, who moved them into the one index Lira would learn to read. Twelve surgical bars across the four books spell a route from the core to the north shaft.

**Act structure.**

| # | Scene | Status |
| --- | --- | --- |
| 1 | **The Torn Book.** A lamp, rubble, "the Peaks are—". | DESIGN.md |
| 2 | **Baselines.** Striders on the bridge; Pell copies each number. | DESIGN.md; the copying is NEW |
| 3 | **Page 47.** Pattern α, the first note, "Who wrote this?" | Source |
| 4 | **The Flyleaf.** Veylor's key, and your couplet in it. | NEW |
| 5 | **The Ridge.** The hearing; the harvester; the scrap. | Source |
| 6 | **The Excision Desk** (midpoint). You redact her brief. From here the player knows the hand that helps is the hand that cuts; Lira does not. | NEW |
| 7 | **The Sluice Log.** Joren's terrace and what he trusted. | NEW inside a DESIGN.md scene |
| 8 | **The City.** The hooded archivist; Joren brings the guards. | Source |
| 9 | **Three Nights** (darkest moment). The hideout. "I have not slept in three nights." She writes a line, puts the loupe on it, and the loupe reports an uncrossed seven. Her own tells are failing. "Or maybe it’s him. Or maybe it’s me." | NEW, from the source's final chapter |
| 10 | **Pell's Book.** A control copy in a child's capitals. | NEW |
| 11 | **The Constant.** Veylor, the damping term, the board. | Source |
| 12 | **The Shear and the Desk.** | Source |

**Endings.** No condition in `data/endings.json` changes without the author's word.

- **The Redacted Testament (as written).** Unchanged. She dies. New cost made visible: in the epilogue the archivist decodes their own twelve bars, the route she never read.
- **The Archivist in Time.** The archivist breaks cover to reach her and loses the vault. Only six of the twelve bars can be lifted. The source's sentence inverts: the author survives, the knowledge does not, entirely.
- **Directed Resilience.** Lira's last act is a Journal Audit in which she rules the bars herself. She becomes the clerk the player was at the midpoint.
- **Fire.** As designed, plus this: the songs measured a core that is gone, and now decode to nothing.
- **Errata (NEW, a proposal).** Offered only if the damping was re-measured and the Flyleaf found: Lira withdraws her schedule and publishes the correction to her own model, unsigned. No pulse, no pause: the storms take the terraces, Hollin among them, evacuated on the siren baseline the player set in minute 6. The Continuum is unwounded. She lives with her name on nothing, and a hundred settlements start re-measuring.

**Sample writing (written for the game, not the author's text).**

> Strider count, bridge, 06:10: 17. Pell says 18. One of us is counting something the other cannot see.
>
> The bar is 41 mm long. I measured it. I do not know what else to do with it.
>
> *(the small hand)* I ruled that line. I am sorry for its length.
>
> *(Pell's book)* DOCTOR SAYS 0.44. I WROTE IT SAME.
>
> *(pencil, the flyleaf)* 2b. Found above 2 000 m: not yet. Leave room.
>
> 03:12. The seven is not crossed. I watched my hand not cross it.
>
> Method is what you do when you cannot trust yourself. I had not expected to need it so soon.
>
> *(Veylor)* You love that terrace. I planted it.

## 3. Obstacles and puzzles

All elements below are additions.

### Cross-section climb

- **Teach:** anchor through a front; watch your air (Book I).
- **Test:** low gravity and storm rock together (Book III).
- **Twist:** the survey sheet itself has been redacted. Black bars lie across the section.
- **New.** *Redacted strata*: inside a bar, lamp sweeps cannot see you and you cannot see ledges; dust falling on the 7-second period outlines a ledge for one beat. *Core drill*: at marked strata, hold for 4 s while air drains; each core adds a true line to the next Assay's reference card. *Sung gaps*: after Mara, each front shows a neume above it; a rest is a gap you can stand in unanchored.
- **Set-piece:** the escape from the city. You climb through the censor's bars, blind, counting to seven, with lamps crossing the white paper on either side.

### Under the lens

- **Teach:** only the focus plane is solid.
- **Test:** under the lab pulse the filaments rewire: on each pulse, the current plane swaps with the one below.
- **Twist:** the dream slide (in Three Nights). Ghost filaments flicker at 12 Hz, from "a 0.003 lux fluctuation at 12 Hz". They are the true channel. The thing you learned to avoid is the route.
- **New.** *Phase dye*: one use per slide; seeded lattice shows magenta for 5 s. Rewiring and ghost filaments, as above.
- **Set-piece:** at ×1 600 the lattice resolves into ruled lines and a maker's mark, a 9. DESIGN.md's margin note 4 already said "Batch 9 is not from the well."

### The Assay

- **Teach:** eliminate with reagents. **Test:** read a ratio from two precise peaks. **Twist:** in the third assay the printed reference card is a Continuum edition and one line on it is false.
- **New.** *Standard*: run your own Book I bark sample first (cost 1); if its 452 nm peak reads off, everything on the bench is shifted by that much. *Blank run* (cost 1): an empty cuvette shows what was put on the bench before you arrived.
- **Set-piece:** pulse the fragment and the scope draws Pattern α. The journal turns itself back to the sketch from the third night.

### The Key

- **Teach:** follow couplets to a name. **Test:** three breaks, on drifting specimens. **Twist:** reverse keying. The flyleaf holds couplets for species that do not exist yet; choose the measurements that would have to be true, and you have drawn what the Second Genesis selects for.
- **New.** *Whose couplet*: every couplet shows its hand (print, Lira's pencil, his pencil).
- **Set-piece:** the Flyleaf.

### Storm-Song Cipher

- **Teach:** three glyph lines give two names. **Test:** Mara's breaths mark nodes. **Twist:** the fourth song is not sung. It is the redacted brief.
- **New.** *Bar staff*: slide a page under the staff; a surgical bar's line is its pitch and its length its rests. *Dirge*: a song sung as a dirge is the same path walked backwards.
- **Set-piece:** Lira plays the bars aloud. Mara: "That is ours. Who taught your censor to sing?"

### Journal Audit

- **Teach:** the journal against the published brief. **Test:** forgeries caught only by the clock. **Twist:** Three Nights. The loupe fails her own lines; only the field card and physics still tell hands apart.
- **New.** *Pell's book*: a second field card for all of Book I, relay readings included, exactly as wrong as Lira was that day. *Bar gauge*: measure a bar; ruled with blue under the black is surgical, brushed is clumsy.
- **Set-piece:** the Excision Desk. Flagged terms must be covered. Cutting only the word saves the line for Lira but draws the supervisor's eye; three such and the page goes to a clumsy censor, its node lost. A crib in the desk drawer shows the bar lengths that carry the message.

### The Node Board

- **Teach:** the drill, with full information. **Test:** Veylor's hidden moves. **Twist:** if the damping was re-measured, the calm line drops across the map mid-match and safe nodes turn amber together.
- **New.** *Witnesses*: Pell's book, the sluice log, Mara's song and the bar cipher are each a token; a witness on a node bars seeds from it for one round. *Honest pencil*: mark a node as doubted and the projected Strain becomes a band, not a line.
- **Set-piece:** the calm line dropping, every node's tone rising at once.

### Across the game

**Links between layers.**

1. Bars cut at the Excision Desk (1D) decide which strata are black in the escape (2D) and which nodes show ■ on the board.
2. Cores drilled on a climb (2D) add true reference lines to the next Assay (1D); the fragment's ring-down measured there draws the beat marks on the rhythm platforms under Peak 12.
3. A couplet written in The Key (1D) changes what the climbs draw: keyed upland wolves appear as wolves whose trail marks warm ledges; misclassified, they are grey shapes that knock you back.

**The long puzzle: the twelve bars.** One surgical bar per stage, from the first redaction in Book I. Measured with the bar gauge, read on the staff from Book III, plotted before the descent. Solved, it is the route to the north shaft; unsolved, the archivist reads it alone in the epilogue.

**A second playthrough.** The player distrusts the relay from minute 8 and knows what each cut at the Excision Desk costs. "Keep going" at the last prompt opens the archivist's desk log, dated bar by bar, beside the same entries.

## 4. Art plan

**Style bible.**

1. **Palette.** Paper `#f1e8d2`, iron-gall `#3b2618`, seal red `#b3212b`, river cyan `#3fc4d0`, peak violet `#5a3f7a`, ochre `#c8913a`, the small hand `#3c5a8c`, bar black `#141414`. (the web modes' values).
2. **Line.** One iron-gall weight for everything Lira could have drawn; pencil grey for anything provisional.
3. **Texture.** Laid paper grain under every layer, 3D frames included; washes pool at edges; bars have fibrous ends.
4. **Lighting.** Bioluminescence or a single lamp. No sun above the Lowlands.
5. **Never shown.** The archivist's face (hands only). Veylor's face except as a fracture pattern in bark. What is under a bar, unless the player lifts it. Lira's death.

| Asset | Purpose | Made by | Count |
| --- | --- | --- | --- |
| Key art | Lira from behind at the valley's edge, one bar across the sky | Generated | 1 |
| Title lettering | Iron-gall title; the bar over "Redacted" lifts on load | Code (SVG) | 1 |
| Character plates | Lira, Mara, Joren, Kade, Pell, Veylor (bark fracture), the archivist (hands) | Generated, ink pass | 7 |
| Climb figures | Lira (six poses), three companions, crawler, wolf | Code (canvas) | 11 |
| Cross-section backdrops | One per climb, plus the redaction overlay | Code (SVG hatching) | 6 |
| Lens fields | Three slides and the dream slide | Generated textures | 4 |
| Assay bench | Scope, cuvette, six vials, the standard | Code (SVG) | 9 |
| Specimen plates | The Key's cards, iron-gall line | Generated | 24 |
| Key pages | Print, her pencil, his pencil; the flyleaf | Code | 3 |
| Cipher set | Fourteen neumes, peak map, bar staff | Code (SVG) | 16 |
| Audit set | Four hands as stroke sets, eight stamps, six pages of Pell's book | Code | 18 |
| Node Board maps | Hollin and the Peaks, hillshaded heightfields | Blender render | 2 |
| Board tokens | Emitter, seed, four witnesses | Code (SVG) | 6 |
| Ending cards | One per ending, Errata included | Generated | 5 |
| Chapter frontispieces | Cold open, four books, epilogue | Generated vignette, coded lettering | 6 |
| Interstitial cards | The Excision Desk; Three Nights | Generated | 2 |
| UI ornaments | Tabs, margin brackets, seals, dial faces, bar ends | Code (SVG) | 20 |
| Location frames | One hero frame per 3D place, paper and ink pass | Blender render | 14 |

Totals: 49 generated, 90 drawn by code, 16 Blender renders; 155 assets.

**Prompts.**

1. *Key art.* "Naturalist's field plate in iron-gall ink and thin watercolour wash on warm laid paper. A woman seen from behind, small in the frame, standing at the edge of a forested valley at night with an open notebook in her left hand. The valley is strung with fine webs that glow river cyan in travelling waves. A violet megapeak behind. One flat black redaction bar with fibrous ends crosses the sky, hiding the summit. Single ink line weight, no text, visible paper grain."
2. *Veylor.* "Specimen plate in iron-gall ink on warm laid paper, its label left blank. A slab of crystalline bark, translucent ochre and bone white, split by a storm. The fracture lines suggest a man's face in three-quarter view, implied only by cracks. Cool white-violet glow inside the cracks, a ruled scale bar at lower left, no text, no figure."
3. *The Excision Desk.* "Ink and wash on warm laid paper. A steel desk from directly above under one cold lamp. Two hands only, the left holding a steel rule on a typed page, the right drawing a black bar with a broad pen. A blue-black ink bottle, a red seal press, a stack of pages already barred. Matte black surround, seal red the only warm colour, no face, no legible text."

**The ten to make first.**

1. The four handwriting stroke sets.
2. The bar: ink, fibrous ends, the blue under the black.
3. Title lettering.
4. Lira's plate.
5. Key art.
6. Pell's book pages.
7. The redaction overlay for the cross-section.
8. The archivist's hands.
9. Veylor in bark.
10. The as-written ending card.

One to three fix the look of every page, and the game is a page. Four to six give it a face and a hook. Seven to nine carry the three new story ideas. Ten is the ending every run can reach.

## 5. Roadmap

**Phase 1: the page (largest gain, least work).** The four hands, the bar and the bar gauge. Pell's book as a tool in Journal Audit. Whose-couplet marks in The Key. The Flyleaf as one extra drawer in the existing archive scene. Sample lines.

**Phase 2: the midpoint.** The Excision Desk (4 min), Three Nights with the dream slide (3 min), the Sluice Log and Pell's Book inside existing scenes (1 min each). That adds 9 minutes to 176. Trim 5 (merge the outpost stealth into the escape; drop a camp from each of the first two climbs) to finish at 180.

**Phase 3: the long puzzle and the endings.** The bar staff in the cipher, the twelve bars, witnesses on the board, the redacted strata, the three layer links, the ending changes, the art in section 4.

**Needs the author's decision before work starts.**

- The archivist as the Continuum's redactor, and as the one told to move the logs.
- Veylor as author of the key and planter of the Mid-Slope forests.
- Joren drowning his own terrace on a relay reading.
- Errata as a fifth ending, and any change to ending conditions.
- Whether solving the bars may stand in for two of the six replies.
- The 180-minute ceiling and the trims.

## 6. Additions register

- The archivist as a Continuum clerk of excisions; the surgical bars as their work and as a neume cipher; the scrap as an order to them.
- The Excision Desk: the scene, the quota, the supervisor, the crib, its consequences.
- Veylor as author of the dichotomous key; the Flyleaf; his pencilled couplets; "You love that terrace. I planted it."; ReGenesis as the source of the Mid-Slope seeds.
- Veylor's want: to be checked by an honest measurer.
- Joren's secret and the Sluice Log.
- Pell copying Lira's numbers; Pell's Book as a control copy and an audit tool.
- Lira's want (a clean result under her own name) and need (other hands in the book).
- Three Nights as a playable scene; the loupe failing on her own hand; the dream slide and its ghost filaments.
- The maker's mark 9 on the lattice.
- Redacted strata, the core drill, sung gaps.
- Phase dye, rewiring planes; the standard, the blank run, the false line on the reference card, the scope drawing Pattern α.
- Whose-couplet marks; reverse keying.
- The bar staff, the bar gauge, the dirge rule; Mara's line "Who taught your censor to sing?"
- Witness tokens, the honest pencil, the calm line dropping mid-match.
- The three layer links; the twelve bars as the long puzzle.
- Ending changes: the archivist decoding their own bars; six liftable bars in The Archivist in Time; Lira ruling the bars in Directed Resilience; the songs decoding to nothing in Fire.
- The ending Errata and its condition.
- The archivist's desk log on a second playthrough.
- Every line under "Sample writing"; the never-shown list, assets and prompts of the art plan; the time trims.

**Thread:** a small left-slanted correction in blue-black ink, in a margin where nobody else should have been writing.

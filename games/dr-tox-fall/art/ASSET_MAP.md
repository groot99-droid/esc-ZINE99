# Dr. Tox: Fall: asset map for the web modules

183 code-drawn assets (`art.json`), read through `api.art` by id. Each module uses only its own
style's assets plus the shared ones listed for it; do not borrow another mode's art (one graphic style
per mode, `docs/graphic_styles.json`). Ids are stable and begin with the module key; the `row` in
`art.json` begins `<module> | ...`. Draw sizes are the intended on-screen sizes at a 1280 x 720 stage;
every asset is a vector and scales. Written from `art.json` at stage B; update it if an id changes.

## Loading screen and menu

Style: the game's own register (not a mode style). 10 own assets, plus shared: `chapter-1`, `chapter-2`, `chapter-3`, `chapter-4`, `chapter-5`, `chapter-6`, `chapter-7`, `chapter-8`, `chapter-9`, `chapter-10`, `chapter-11`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `loading-hall` | Loading backdrop: the relief hall at noon, 2229 | 1600x900 | covers the stage (object-fit: cover), under the still |
| `ending-bond-held` | Ending: Bond Held | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-first-word` | Ending: First Word | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-the-clinic` | Ending: The Clinic | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-the-following` | Ending: The Following | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `title-episodes` | Episode strip: Rise done, Fall open, Finale and Altrulan shut | 1200x180 | menu header, 600 to 900 px wide |
| `title-fall` | Title lettering: Dr. Tox: Fall | 1200x420 | full width of the loading screen, about 720 px wide |
| `loading-monitor-amber` | Loading monitor line, amber (held) | 1200x140 | full width, 70 to 140 px tall; amber at progress 0, crossfade to the Self-line strip by 0.6 and to the green-cornered strip at 1 |
| `loading-monitor-green` | Loading monitor line, at the line (green in the corners) | 1200x140 | full width, 70 to 140 px tall; amber at progress 0, crossfade to the Self-line strip by 0.6 and to the green-cornered strip at 1 |
| `loading-monitor-trigger` | Loading monitor line, amber under the Self line | 1200x140 | full width, 70 to 140 px tall; amber at progress 0, crossfade to the Self-line strip by 0.6 and to the green-cornered strip at 1 |

## Crowd thread (2D, `crowd-thread`)

Style: Underground comix crosshatch. 24 own assets, plus shared: `hud-margin-calm`, `hud-margin-edge`, `hud-margin-green`, `hud-pulse`, `hud-pulse-edge`, `hud-breath`, `hud-shroud-open`, `hud-shroud-closed`, `hud-self`, `hud-amber`, `hud-amber-empty`, `hud-word-rcc`.

Figures are transparent sprites, feet on the bottom edge. The ring is drawn under the figures and over the backdrop; scale it to the radius (1.0 m + Pulse/50 m, halved with the shroud closed). Use `crowd-thread-hall-*` for `s2_crowd_1` and `crowd-thread-gala-*` for `s2_crowd_2`; `crowd-thread-tox-dart` and `crowd-thread-security` are chapter 11 only. `crowd-thread-poster` only with `security_knows_face`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `crowd-thread-gala-far` | Crowd thread: the gala floor (far layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `crowd-thread-gala-mid` | Crowd thread: the gala floor (mid layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `crowd-thread-gala-near` | Crowd thread: the gala floor (near layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `crowd-thread-hall-far` | Crowd thread: relief hall (far layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `crowd-thread-hall-mid` | Crowd thread: relief hall (mid layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `crowd-thread-hall-near` | Crowd thread: relief hall (near layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `crowd-thread-guest` | Gala guest with a glass | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-kitchen-staff` | Ama Owusu and Lev Brandt at the service door | 320x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-queue-1` | Queue: a woman with a bucket | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-queue-2` | Queue: a man on a stick | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-queue-3` | Queue: an elder wrapped in a blanket | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-queue-4` | Queue: two people leaning together | 320x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-security` | Spire security with an earpiece | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-staff` | Relief staff with a baton | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-tox-closed` | Dr. Tox with the shroud drawn closed | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-tox-dart` | Dr. Tox throwing a dart (chapter 11) | 240x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-tox-turn` | Dr. Tox turned sideways (narrowing the ring) | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-tox-walk` | Dr. Tox walking, shroud open | 200x320 | 120 to 170 px tall (one scale for everyone; 320-wide sprites are two people) |
| `crowd-thread-poster` | State poster: REPORT THIS MAN | 200x280 | native size or half |
| `crowd-thread-ring` | The breath radius: a ring of bare paper | 480x220 | stretched to the radius; about 160 to 420 px wide |
| `crowd-thread-service-door` | The Spire's service door | 220x340 | at figure scale (the door about 1.3 times a figure) |
| `crowd-thread-shutter` | The relief hall's shutter, down | 480x420 | at figure scale (the door about 1.3 times a figure) |
| `crowd-thread-sight-cone` | A staff member's sight cone | 480x220 | stretched to the watcher's facing, 200 to 400 px long |
| `crowd-thread-sign-suspended` | Hand-lettered sign: RELIEF SUSPENDED | 520x120 | native size or half |

## Reflection run (2D, `reflection-run`)

Style: Silkscreen pop-art repeats. 19 own assets, no shared HUD.

Cally's pages have no HUD (DESIGN.md section 12). The floor line is at y = 270 of 540 in every backdrop layer and in the frames. `reflection-run-reflect-*` and `reflection-run-switch` are drawn already inverted (feet on the top edge): place their top edge on the floor line, do not flip them. Tint `reflection-run-frame-printed` per frame (CSS filter or a colour block under it) so the repeats change colour; a refused frame stays `reflection-run-frame`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `reflection-run-glass-far` | Reflection run: the glass hall (far layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `reflection-run-glass-mid` | Reflection run: the glass hall (mid layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `reflection-run-glass-near` | Reflection run: the glass hall (near layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `reflection-run-aegis` | Aegis across the glass | 240x320 | 120 to 170 px tall, at the floor line |
| `reflection-run-cally-wait` | Cally waiting in a camera's view | 200x320 | 120 to 170 px tall, at the floor line |
| `reflection-run-cally-walk` | Cally walking (two prints off register) | 200x320 | 120 to 170 px tall, at the floor line |
| `reflection-run-reflect-refuse` | The reflection refusing (back turned, inverted) | 200x320 | 120 to 170 px tall, at the floor line |
| `reflection-run-reflect-walk` | The reflection walking (inverted) | 200x320 | 120 to 170 px tall, at the floor line |
| `reflection-run-camera-cue` | The handler's cue: a printed camera | 160x160 | at figure scale; prompts 64 to 96 px |
| `reflection-run-column-rcc` | Refusal: the clean-air column's plate | 160x440 | at figure scale; prompts 64 to 96 px |
| `reflection-run-door` | A glass door | 160x300 | at figure scale; prompts 64 to 96 px |
| `reflection-run-door-rcc` | Refusal 1: a door plate stamped RCC | 200x100 | at figure scale; prompts 64 to 96 px |
| `reflection-run-force` | Force (hold): the reflection dragged on | 160x160 | at figure scale; prompts 64 to 96 px |
| `reflection-run-frame` | Repeat frame, unprinted | 240x540 | stage height, one per repeat, edge to edge |
| `reflection-run-frame-printed` | Repeat frame, printed | 240x540 | stage height, one per repeat, edge to edge |
| `reflection-run-mural-sky` | Refusal: a lobby mural of a painted sky | 480x300 | at figure scale; prompts 64 to 96 px |
| `reflection-run-stop` | Stop with it: the reflection walks on alone | 160x160 | at figure scale; prompts 64 to 96 px |
| `reflection-run-switch` | A switch in the glass world | 100x140 | at figure scale; prompts 64 to 96 px |
| `reflection-run-trolley-string` | Refusal: a loop of string on a cleaner's trolley | 240x200 | at figure scale; prompts 64 to 96 px |

## Triage (1D, `triage`)

Style: Alcohol-marker sketch cards. 24 own assets, plus shared: `hud-margin-calm`, `hud-margin-edge`, `hud-breath`, `hud-word-rcc`, `hud-word-hope`, `hud-load`.

One card per named patient (DESIGN.md section 6); `triage-card-nell` appears only if Rise released anyone (`barrier.released` >= 1). Lay marks into the card's two dashed `asks` slots (centres at (84, 393) and (118, 393) of 300x420). Stamp `triage-stamp-early` over a card's top-right corner in later pages. Triage 4 is Aegis's: use `hud-load` and `hud-word-hope` there, and no margin line.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `triage-table` | The triage table: NOW, WAIT, CANNOT | 1280x720 | covers the page (1280x720 stage) |
| `triage-card-arturo` | Patient card: Arturo Sol | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-back` | Patient card, back | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-bashir` | Patient card: Bashir Kade | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-dov` | Patient card: Dov Ashkenazi | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-ines` | Patient card: Ines Varga | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-kofi` | Patient card: Kofi Mensah | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-lupe` | Patient card: Lupe Andrade | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-marisol` | Patient card: Marisol Quiroga | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-mercy` | Patient card: Mercy Abiodun | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-nell` | Patient card: Nell Okafor | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-odile` | Patient card: Odile Marchetti | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-petra` | Patient card: Petra Lind | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-ren` | Patient card: Ren Sato | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-teo` | Patient card: Teo Halloran | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-wren` | Patient card: Wren Halloran | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-card-yusuf` | Patient card: Yusuf Demir | 300x420 | 150 to 210 px wide in a column; 300 px when picked up |
| `triage-cot` | A cot | 160x96 | 32 to 64 px |
| `triage-mark` | A mark of tincture (within need) | 64x64 | 20 to 32 px |
| `triage-mark-past` | A mark past the need | 64x64 | 20 to 32 px |
| `triage-stamp-early` | Corner stamp: CAME BACK EARLY | 300x120 | about half a card's width, rotated over its corner |
| `triage-time` | His time (a wristwatch) | 96x96 | 32 to 64 px |
| `triage-tray` | The tincture tray | 240x520 | the tray column at the left, about 230 px wide |
| `triage-water` | Water (a tin cup) | 96x96 | 32 to 64 px |

## The Manifold (1D, `manifold`)

Style: Mail-order comic advert. 14 own assets, plus shared: `hud-margin-calm`, `hud-pulse`.

Valve centres on `manifold-gauntlet` are at x = 220, 330, 440, 550, 660, 770, y = 150 (of 1000x260); lay the valve pieces there, scaled with the gauntlet. Barrels hang from the six drop tubes (bottom of the gauntlet at x of the valves you route to). The fifth-outlet piece sits at (930, 150) on the gauntlet; `manifold-headline-2` and the outlets are `s1_manifold_2` only. Fill the barrel by drawing a dark red rect inside it (inner box x 18 to 62, y 52 to 212; six marks, 26 apart).

| id | for | native | draw at |
| --- | --- | --- | --- |
| `manifold-advert` | The advert page (backdrop) | 1280x720 | covers the page (1280x720 stage) |
| `manifold-coupon` | The coupon corner: PULSE PER DART | 360x200 | bottom right corner, 280 to 360 px wide |
| `manifold-headline-1` | Headline: AMAZING! FOUR BARRELS FROM ONE LINE! | 1000x120 | in the advert's headline band, about 1000 px wide |
| `manifold-headline-2` | Headline: NEW! NOW WITH A FIFTH OUTLET! | 1000x120 | in the advert's headline band, about 1000 px wide |
| `manifold-backpressure` | Starburst: BACK-PRESSURE! | 260x180 | 120 to 260 px |
| `manifold-barrel` | A barrel (empty glass, fill marks) | 80x240 | at the gauntlet's scale, about 70 to 80 px wide |
| `manifold-bead` | A bead of flow | 32x32 | 12 to 24 px, animated along the line on a test draw |
| `manifold-burst` | Starburst (blank, for a number or a cry) | 200x200 | 120 to 260 px |
| `manifold-gauntlet` | The gauntlet: spine, line and numbered callouts | 1000x260 | about 900 to 1000 px wide across the page |
| `manifold-outlet-capped` | The fifth outlet, capped | 140x80 | on the socket at (930, 150) of the gauntlet |
| `manifold-outlet-open` | The fifth outlet, routed (the resin line) | 140x80 | on the socket at (930, 150) of the gauntlet |
| `manifold-valve-half` | Valve: half | 80x80 | on the gauntlet's sockets, at the gauntlet's scale (about 60 to 80 px) |
| `manifold-valve-open` | Valve: open | 80x80 | on the gauntlet's sockets, at the gauntlet's scale (about 60 to 80 px) |
| `manifold-valve-shut` | Valve: shut | 80x80 | on the gauntlet's sockets, at the gauntlet's scale (about 60 to 80 px) |

## Persona (1D, `persona`)

Style: 1950s romance comic. 20 own assets, no shared HUD.

Cally's pages have no HUD; the only number is the match. Size each balloon to its facet's hidden weight. Built cards carry a blank tag strip at the foot (x 30 to 200, y 284 to 306 of 240x340) for the facets the module assigns; the dealt cards have none.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `persona-page` | Persona: the romance page (backdrop) | 1280x720 | covers the page (1280x720 stage) |
| `persona-card-back` | Card back | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-blade` | Dealt card: Drop the blade | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-fell` | Dealt card: Leave the string where it fell | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-hand` | Card: Take his hand | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-hum` | Card: Hum four notes | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-laugh` | Card: Laugh at his joke | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-light` | Card: Stand in the warm light | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-paint` | Dealt card: Paint over the sky | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-scarf` | Card: Sky-blue scarf | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-card-string` | Card: Loop of string | 240x340 | 110 to 160 px wide in the hand; 240 px when drawn |
| `persona-heart-panel` | The heart panel: his profile | 720x480 | top centre, 480 to 720 px wide |
| `persona-balloon-amber` | Thought balloon: warm amber light | 360x210 | 160 to 360 px wide (the size is the facet's weight) |
| `persona-balloon-cally` | Thought balloon: Cally | 360x210 | 160 to 360 px wide (the size is the facet's weight) |
| `persona-balloon-carmy` | Thought balloon: Carmy | 360x210 | 160 to 360 px wide (the size is the facet's weight) |
| `persona-balloon-rolan` | Thought balloon: Rolan | 360x210 | 160 to 360 px wide (the size is the facet's weight) |
| `persona-balloon-sky` | Thought balloon: a painted sky | 360x210 | 160 to 360 px wide (the size is the facet's weight) |
| `persona-balloon-string` | Thought balloon: a loop of string | 360x210 | 160 to 360 px wide (the size is the facet's weight) |
| `persona-meter` | The match meter, marked at 94.6 | 1000x90 | full width of the foot of the page |
| `persona-tear` | A tear on a lash | 140x140 | 48 to 96 px |

## Bloom (1D, `bloom`)

Style: Four-colour Ben-Day newsprint. 18 own assets, plus shared: `hud-load`, `hud-word-hope`, `hud-margin-calm`, `hud-word-rcc`.

Cells are 120x120 and tile edge to edge; lay `bloom-cordon` (transparent) over a cell, `bloom-pane` on an edge (rotate 90 degrees for a vertical edge). Bloom 1 is Aegis's (`hud-load`, `hud-word-hope`); Bloom 2 is Dr. Tox's (`hud-margin-calm`). `bloom-cell-burned` and `bloom-twins-line` only with the Observers. The red settlement edge is drawn by the module (#c1272d, 8 px) round the two east columns.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `bloom-page` | Bloom: the newsprint page (backdrop) | 1280x720 | covers the page (1280x720 stage) |
| `bloom-masthead` | Masthead: THE MORNING BULLETIN | 1280x160 | full width at the top of the page |
| `bloom-portrait-catalyst` | Newsprint portrait: Rostova, captioned CATALYST | 300x400 | 160 to 240 px wide in the margin (chapter 3 and the rig, chapter 8) |
| `bloom-crew` | A crew member | 48x96 | 18 to 32 px tall, on cells |
| `bloom-resident` | A resident | 48x96 | 18 to 32 px tall, on cells |
| `bloom-cell` | District cell: clean | 120x120 | one grid cell, 56 to 80 px |
| `bloom-cell-absorbed` | District cell: absorbed (Aegis) | 120x120 | one grid cell, 56 to 80 px |
| `bloom-cell-burned` | District cell: burned clear (the Cauldron) | 120x120 | one grid cell, 56 to 80 px |
| `bloom-cell-marked` | District cell: marked (the residents changed) | 120x120 | one grid cell, 56 to 80 px |
| `bloom-cell-spore-1` | District cell: spores, level 1 | 120x120 | one grid cell, 56 to 80 px |
| `bloom-cell-spore-2` | District cell: spores, level 2 | 120x120 | one grid cell, 56 to 80 px |
| `bloom-cell-spore-3` | District cell: spores, level 3 | 120x120 | one grid cell, 56 to 80 px |
| `bloom-cordon` | Cordon: a crew's sheeting on a cell | 120x120 | one grid cell, 56 to 80 px |
| `bloom-pane` | Pane: hard light on a cell edge | 120x24 | one cell edge long |
| `bloom-source` | The source rooftop (the rig) | 120x120 | one grid cell, 56 to 80 px |
| `bloom-tick` | The tick counter box | 200x120 | in the margin, 140 to 200 px wide |
| `bloom-twins-line` | The Twins' line (a row of blocked edges) | 600x40 | five cell edges long |
| `bloom-wind` | The wind arrow | 200x120 | in the margin, 140 to 200 px wide |

## Composite (1D, `composite`)

Style: Identikit acetate overlays. 27 own assets, plus shared: `hud-self`, `hud-margin-green`.

The base and all twelve strips are 600x800 and register exactly: stack them at the same position and scale in the light box (`composite-lightbox` holds a 408x488 window at (436, 40)); show strips smaller in the racks. Each strip's grease tab (top right of its band) is blank for the witness numbers the module writes in red. Awed strips (halo, wings, back-light) and terrified ones (horns, tail) are printed askew with a red question mark. Witness cards for `s1_composite_1` are mercy, wren, bashir, dov, sato, yusuf (numbers 1 to 6, matching `composite-map-freeway`); for `s1_composite_2` ama, lev, corinne, desmond (1 to 4, `composite-map-gala`, drawn at about 255x170 in the light box's map frame).

| id | for | native | draw at |
| --- | --- | --- | --- |
| `composite-lightbox` | Composite: the light box (backdrop) | 1280x720 | covers the page (1280x720 stage) |
| `composite-witness-ama` | Witness 1: Ama Owusu | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-bashir` | Witness 3: Bashir Kade | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-corinne` | Witness 3: Corinne Vale | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-desmond` | Witness 4: Desmond Achebe | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-dov` | Witness 4: Dov Ashkenazi | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-lev` | Witness 2: Lev Brandt | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-mercy` | Witness 1: Mercy Abiodun | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-sato` | Witness 5: Ren Sato | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-wren` | Witness 2: Wren Halloran | 256x160 | 180 to 256 px wide along the rail |
| `composite-witness-yusuf` | Witness 6: Yusuf Demir | 256x160 | 180 to 256 px wide along the rail |
| `composite-map-freeway` | Inset map: under the freeway | 360x240 | about 255x170 in the map frame |
| `composite-map-gala` | Inset map: the gala floor and the balcony | 360x240 | about 255x170 in the map frame |
| `composite-base` | The base form, with the constants printed | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-pin` | Pin the composite | 120x120 | 48 to 96 px |
| `composite-strip-arms-joint` | Strip, arms: a joint too many | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-arms-reach` | Strip, arms: reach (the gala) | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-arms-wings` | Strip, arms: wings (awed) | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-back-light` | Strip, back: a light coming out of him (awed) | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-back-ridge` | Strip, back: the spine pulled into a ridge | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-gait-long` | Strip, gait: low and long | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-gait-tail` | Strip, gait: a tail (terrified) | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-head-halo` | Strip, head: a halo (awed) | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-head-horns` | Strip, head: horns (terrified) | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-head-sunk` | Strip, head: sunk between the shoulders | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-shoulders-high` | Strip, shoulders: too high | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |
| `composite-strip-shoulders-plate` | Strip, shoulders: scab plating (the raid) | 600x800 | stacked in the light box window (about 366x488); 120 to 180 px wide in the racks |

## Shared (chapter cards and the HUD)

Not in any mode's style: the game's own register (graded concrete, typed captions, the signal colours).
Dr. Tox's pages keep the Pulse margin; in Fall it fires at the Self line, so `hud-margin-edge` and
`hud-margin-green` draw that line as a pale dash along the top edge. Reese's pages have no margin (warm,
`hud-load` in the bloom district); Cally's have no HUD at all (DESIGN.md section 12, Colour as HUD). The
three Words are `hud-word-hope`, `hud-word-rcc` and `hud-word-silence` (saying nothing).

| id | for | native | draw at |
| --- | --- | --- | --- |
| `chapter-1` | Chapter I: The Knock | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-10` | Chapter X: The Gala | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-11` | Chapter XI: Clean Air | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-2` | Chapter II: Relief | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-3` | Chapter III: Containment | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-4` | Chapter IV: The Gauntlet | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-5` | Chapter V: Under the Freeway | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-6` | Chapter VI: Seventy-Two Hours | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-7` | Chapter VII: The Hero Comes Down | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-8` | Chapter VIII: Bloom | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-9` | Chapter IX: Resin | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `hud-amber` | HUD icon: Amber (a dose on hand) | 96x96 | 24 to 48 px |
| `hud-amber-empty` | HUD icon: Amber (an empty slot) | 96x96 | 24 to 48 px |
| `hud-breath` | HUD icon: the breath radius (a ring on the floor) | 96x96 | 24 to 48 px |
| `hud-caption` | Caption box (blank, for dated captions) | 600x96 | 300 to 600 px wide, text over it |
| `hud-load` | Load gauge (Aegis, pale gold) | 480x48 | 240 to 480 px wide |
| `hud-margin-calm` | Pulse margin line: calm (amber) | 1200x32 | full width of the page bottom, 12 to 32 px tall |
| `hud-margin-edge` | Pulse margin line: near the Self line (green spikes) | 1200x32 | full width of the page bottom, 12 to 32 px tall |
| `hud-margin-green` | Pulse margin line: at the line (green from the corners) | 1200x32 | full width of the page bottom, 12 to 32 px tall |
| `hud-pulse` | HUD icon: Pulse (calm) | 96x96 | 24 to 48 px |
| `hud-pulse-edge` | HUD icon: Pulse near the line (green spike) | 96x96 | 24 to 48 px |
| `hud-self` | HUD icon: Self (a struck word) | 96x96 | 24 to 48 px |
| `hud-shroud-closed` | HUD icon: shroud closed | 96x96 | 24 to 48 px |
| `hud-shroud-open` | HUD icon: shroud open | 96x96 | 24 to 48 px |
| `hud-word-hope` | Terminology Rule: HOPE (the insignia) | 240x96 | 120 to 240 px wide |
| `hud-word-rcc` | Terminology Rule: RCC (the plate) | 240x96 | 120 to 240 px wide |
| `hud-word-silence` | Terminology Rule: nothing (the held breath) | 240x96 | 120 to 240 px wide |

## Not drawn here

- No thread-guest: `docs/DEEP_DIVE.md` section 4's ring closes on the ten games (Behind the Peephole to
  WrymWretch and back), and `tools/web/build.py` `RING` lists those ten, so the ring has no slot for Fall.
- No faces and no portraits: characters appear as silhouettes, hands, gear and signs. Triage's "quick ink
  faces" are kept to a quick ink head and shoulders with no features; Aegis is a profile silhouette in
  Persona and a flat shape in the Reflection run (he has no design system yet); Rostova is a dotted
  silhouette beside the State's word CATALYST, and nowhere else. No child is drawn.
- The Toxin State is never drawn as an act: Composite assembles a shape from testimony on acetate, and the
  base carries only the bible's constants. Nothing shows a substance, a quantity, a source or a route:
  the tincture is an amber marker dot, the flow a bead, the resin line a tube leaving the frame.
- The rite and the blades' use are not drawn; chapter 9's card and The Following's plate show the blades
  laid out on a cloth.

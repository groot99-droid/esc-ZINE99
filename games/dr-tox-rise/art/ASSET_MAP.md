# Dr. Tox: Rise: asset map for the web modules

169 code-drawn assets (`art.json`), read through `api.art` by id. Each module uses only its own
style's assets plus the shared ones listed for it; do not borrow another mode's art (one graphic style
per mode, `docs/graphic_styles.json`). Ids are stable. Draw sizes are the intended on-screen sizes at a
1280 x 720 stage; every asset is a vector and scales. The `row` in `art.json` begins with the module key.
Written from `art.json` at stage B; update it if an id changes.

## Loading screen and menu

Style: the game's own register (not a mode style). 9 own assets, plus shared: `chapter-1`, `chapter-2`, `chapter-3`, `chapter-4`, `chapter-5`, `chapter-6`, `chapter-7`, `chapter-8`, `chapter-9`, `chapter-10`, `chapter-11`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `title-episodes` | Episode strip: Rise open, Fall, Finale and Altrulan shut | 1200x180 | menu header, 600 to 900 px wide |
| `title-rise` | Title lettering: Dr. Tox: Rise | 1200x420 | full width of the loading screen, about 720 px wide |
| `loading-room` | Loading backdrop: the hospital room, 2217 | 1600x900 | covers the stage (object-fit: cover), under the still |
| `ending-fully-dr-tox` | Ending: Fully Dr. Tox | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-green-in-the-archive` | Ending: Green in the Archive | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-the-cage-alone` | Ending: The Cage Alone | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-the-spec-sheet` | Ending: The Spec Sheet | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `loading-monitor-amber` | Loading monitor line, amber (the dose in) | 1200x140 | same box as the green strip |
| `loading-monitor-green` | Loading monitor line, green (before the dose) | 1200x140 | full width, 70 to 140 px tall; crossfade into the amber strip as progress goes 0 to 1 |

## Panel run (2D, `panel-run`)

Style: Noir spotted-black brush ink. 33 own assets, plus shared: `hud-margin-calm`, `hud-margin-edge`, `hud-margin-green`, `hud-pulse`, `hud-pulse-edge`, `hud-amber`, `hud-amber-empty`, `hud-self`, `hud-word-rcc`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `panel-run-alex-climb` | Alexander: climb a marked edge | 200x320 | about 110 to 160 px tall in a 540 px panel |
| `panel-run-alex-cover` | Alexander: in cover against a wall | 200x320 | about 110 to 160 px tall in a 540 px panel |
| `panel-run-alex-crouch` | Alexander: crouch | 200x320 | about 110 to 160 px tall in a 540 px panel |
| `panel-run-alex-dart` | Alexander: drawing a dart from the shunt | 200x320 | about 110 to 160 px tall in a 540 px panel |
| `panel-run-alex-walk` | Alexander: walk | 200x320 | about 110 to 160 px tall in a 540 px panel |
| `panel-run-cauldron` | The Cauldron (clears a doorway) | 200x320 | 100 to 160 px tall, in a gutter or at a panel edge |
| `panel-run-dog` | The depot dog | 320x200 | guard as Alexander; dog about 100 px tall |
| `panel-run-ghost` | The Ghost (walks ahead unseen) | 200x320 | 100 to 160 px tall, in a gutter or at a panel edge |
| `panel-run-guard` | Guard with a torch | 200x320 | guard as Alexander; dog about 100 px tall |
| `panel-run-split` | The Split (carries him over a gap) | 200x320 | 100 to 160 px tall, in a gutter or at a panel edge |
| `panel-run-twins` | The Resonance Twins (open the last wall) | 320x320 | 100 to 160 px tall, in a gutter or at a panel edge |
| `panel-run-depot-far` | Panel run: depot (far layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-depot-mid` | Panel run: depot (mid layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-depot-near` | Panel run: depot (near layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-research-far` | Panel run: research (far layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-research-mid` | Panel run: research (mid layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-research-near` | Panel run: research (near layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-snakehead-far` | Panel run: snakehead (far layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-snakehead-mid` | Panel run: snakehead (mid layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-snakehead-near` | Panel run: snakehead (near layer) | 1920x540 | panel height (about 400 to 540 px), tiled horizontally; far scrolls at 0.3, mid 0.6, near 1.2 of the camera |
| `panel-run-camera` | Security camera with its sweep | 320x240 | native size or half; torch cone stretched to the guard's facing |
| `panel-run-crate` | Crate (cover) | 220x180 | native size or half; torch cone stretched to the guard's facing |
| `panel-run-dart` | A dart from the shunt | 160x48 | native size or half; torch cone stretched to the guard's facing |
| `panel-run-exit` | Panel exit door | 200x320 | native size or half; torch cone stretched to the guard's facing |
| `panel-run-frame` | Panel frame (transparent centre) | 960x540 | frame stretched to each panel; arrow 60 to 100 px in the gutter |
| `panel-run-gutter-arrow` | Gutter arrow (choose the next panel) | 200x120 | frame stretched to each panel; arrow 60 to 100 px in the gutter |
| `panel-run-ledge` | Climbable edge marker | 200x80 | native size or half; torch cone stretched to the guard's facing |
| `panel-run-locker` | Arlo Benn's locker | 240x360 | plate 200 to 420 px wide when found; locker at panel scale |
| `panel-run-torch-cone` | Torch cone (a guard's light) | 480x220 | native size or half; torch cone stretched to the guard's facing |
| `panel-run-caption` | Panel caption box (blank) | 480x90 | 240 to 480 px wide, text set over it |
| `panel-run-caption-later` | Gutter caption: THREE MINUTES LATER. | 480x90 | 240 to 480 px wide, text set over it |
| `panel-run-rcc-plate` | The first RCC plate | 420x180 | plate 200 to 420 px wide when found; locker at panel scale |
| `panel-run-toxin-panel` | The Toxin State panel (the suit failing) | 960x540 | fills the panel it replaces |

## Barrier escort (2D, `barrier-escort`)

Style: Franco-Belgian ligne claire. 21 own assets, plus shared: `hud-word-hope`, `hud-word-rcc`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `barrier-escort-aegis` | Aegis running | 200x320 | 100 to 160 px tall |
| `barrier-escort-aegis-absorb` | Aegis absorbing a canister cloud | 200x320 | 100 to 160 px tall |
| `barrier-escort-bystander` | Bystander with a bundle | 200x320 | the same scale as Aegis; the child is half height by design |
| `barrier-escort-child` | A child, seen from behind | 200x320 | the same scale as Aegis; the child is half height by design |
| `barrier-escort-crew` | Barricade crew | 320x320 | the same scale as Aegis; the child is half height by design |
| `barrier-escort-insurgent` | Insurgent with a water drum | 200x320 | the same scale as Aegis; the child is half height by design |
| `barrier-escort-other-hero` | The other hero (a line of motion) | 200x320 | 100 to 160 px tall |
| `barrier-escort-far` | Barrier escort: lower ring (far layer) | 1920x540 | stage height, tiled; far 0.3, mid 0.6, near 1.2 |
| `barrier-escort-mid` | Barrier escort: lower ring (mid layer) | 1920x540 | stage height, tiled; far 0.3, mid 0.6, near 1.2 |
| `barrier-escort-near` | Barrier escort: lower ring (near layer) | 1920x540 | stage height, tiled; far 0.3, mid 0.6, near 1.2 |
| `barrier-escort-barricade` | Barricade | 360x220 | transport 320 to 480 px wide; barricade 180 to 260; debris 40 to 60 |
| `barrier-escort-canister` | Toxin canister | 100x160 | canister 40 to 60 px; cloud 150 to 240 px |
| `barrier-escort-cloud` | Canister cloud (absorb for Load) | 300x200 | canister 40 to 60 px; cloud 150 to 240 px |
| `barrier-escort-debris` | Thrown debris | 120x100 | transport 320 to 480 px wide; barricade 180 to 260; debris 40 to 60 |
| `barrier-escort-distance-bar` | Transport distance bar (frame) | 640x60 | gauge 240 to 320 px wide; distance bar 400 to 640 |
| `barrier-escort-emitter` | Barrier emitter stamped RCC | 200x240 | wall stretched along the dragged line, 24 to 40 px thick; cap 24 to 40 px; emitter 100 px |
| `barrier-escort-load-gauge` | Load gauge (frame) | 320x60 | gauge 240 to 320 px wide; distance bar 400 to 640 |
| `barrier-escort-name-tag` | Name tag (blank, for a penned person) | 180x60 | 90 to 140 px wide on the bar |
| `barrier-escort-transport` | The transport | 640x300 | transport 320 to 480 px wide; barricade 180 to 260; debris 40 to 60 |
| `barrier-escort-wall` | Hard-light wall (one bar) | 60x420 | wall stretched along the dragged line, 24 to 40 px thick; cap 24 to 40 px; emitter 100 px |
| `barrier-escort-wall-cap` | Hard-light wall end cap | 60x60 | wall stretched along the dragged line, 24 to 40 px thick; cap 24 to 40 px; emitter 100 px |

## The Cage (1D, `cage`)

Style: Comic colourist's flats. 14 own assets, plus shared: `hud-amber`, `hud-amber-empty`, `hud-margin-calm`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `cage-bench-2217` | The Cage backdrop: the bench in the hospital room (2217) | 1280x720 | covers the stage |
| `cage-lab` | The Cage backdrop: his own lab in Snakehead | 1280x720 | covers the stage |
| `cage-result-hot` | Batch result: Hot (3 doses) | 400x560 | 200 to 300 px wide at the finish |
| `cage-result-leaky` | Batch result: Leaky (4 doses) | 400x560 | 200 to 300 px wide at the finish |
| `cage-result-steady` | Batch result: Steady (4 doses) | 400x560 | 200 to 300 px wide at the finish |
| `cage-cap` | Flask cap (cap the batch) | 120x90 | flask about 40% of stage height; dropper about 60%; drop 20 to 30 px |
| `cage-counter` | Drop counter (frame) | 280x110 | side bar 60 to 70% of stage height; counter 180 to 280 px wide |
| `cage-drop` | A drop of A9 | 40x56 | flask about 40% of stage height; dropper about 60%; drop 20 to 30 px |
| `cage-dropper` | Dropper on its stand | 240x520 | flask about 40% of stage height; dropper about 60%; drop 20 to 30 px |
| `cage-flask` | Flask (standard) | 320x400 | flask about 40% of stage height; dropper about 60%; drop 20 to 30 px |
| `cage-flask-large` | Flask (large, for a batch to take outside) | 420x460 | flask about 40% of stage height; dropper about 60%; drop 20 to 30 px |
| `cage-shield-plate` | Lead shield plate | 140x320 | flask about 40% of stage height; dropper about 60%; drop 20 to 30 px |
| `cage-side-bar` | Side bar: LEAKY, ENDPOINT, HOT | 180x560 | side bar 60 to 70% of stage height; counter 180 to 280 px wide |
| `cage-syringe` | The lead-shielded syringe | 520x120 | 300 to 520 px wide |

## Cat's Cradle (1D, `cats-cradle`)

Style: Chalk and poster paint on the painted sky. 17 own assets.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `cats-cradle-play-mat` | Cat's Cradle: the play mat (the centre of the page) | 900x600 | covers the stage (sky wall) or the centre (play mat, 60% of stage) |
| `cats-cradle-sky-wall` | Cat's Cradle backdrop: Sky Room's painted wall | 1280x720 | covers the stage (sky wall) or the centre (play mat, 60% of stage) |
| `cats-cradle-figure-candles` | Target figure: Candles | 360x260 | 180 to 240 px wide, top of the page |
| `cats-cradle-figure-cradle` | Target figure: The Cradle | 360x260 | 180 to 240 px wide, top of the page |
| `cats-cradle-figure-diamonds` | Target figure: Diamonds | 360x260 | 180 to 240 px wide, top of the page |
| `cats-cradle-figure-soldiers-bed` | Target figure: Soldier's Bed | 360x260 | 180 to 240 px wide, top of the page |
| `cats-cradle-hand-cally` | Hand: Cally | 240x240 | 80 to 140 px, round the edge of the mat |
| `cats-cradle-hand-carmy` | Hand: Carmy | 240x240 | 80 to 140 px, round the edge of the mat |
| `cats-cradle-hand-ghost` | Hand: blank chalk ghost (the leash) | 240x240 | 80 to 140 px, round the edge of the mat |
| `cats-cradle-hand-reese` | Hand: Reese | 240x240 | 80 to 140 px, round the edge of the mat |
| `cats-cradle-hand-rolan` | Hand: Rolan | 240x240 | 80 to 140 px, round the edge of the mat |
| `cats-cradle-speaker` | The program's speaker on the painted wall | 200x200 | caption 240 to 480 px wide; speaker 60 to 120 px |
| `cats-cradle-gratitude` | Chalk caption: Gratitude. | 480x140 | caption 240 to 480 px wide; speaker 60 to 120 px |
| `cats-cradle-name-cally` | Chalk name: Cally | 240x90 | 120 to 200 px wide |
| `cats-cradle-name-carmy` | Chalk name: Carmy | 240x90 | 120 to 200 px wide |
| `cats-cradle-name-reese` | Chalk name: Reese | 240x90 | 120 to 200 px wide |
| `cats-cradle-name-rolan` | Chalk name: Rolan | 240x90 | 120 to 200 px wide |

## The Window (1D, `window`)

Style: Fumetti photo-comic. 14 own assets, plus shared: `hud-margin-calm`, `hud-caption`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `window-clue-ring` | Clue ring (tapped in a photo) | 160x120 | ring 60 to 120 px over the tapped detail; stamp 160 to 240 px |
| `window-guard-bar` | Rota bar (a guard's round) | 200x48 | rota sheet 320 to 640 px wide on the right; bars and segments stretched to their time span |
| `window-segment` | Route segment (his) | 200x48 | rota sheet 320 to 640 px wide on the right; bars and segments stretched to their time span |
| `window-segment-overlap` | Route segment (overlapping a round) | 200x48 | rota sheet 320 to 640 px wide on the right; bars and segments stretched to their time span |
| `window-stamp-clear` | Stamp: CLEAR | 320x120 | ring 60 to 120 px over the tapped detail; stamp 160 to 240 px |
| `window-stamp-tight` | Stamp: TIGHT | 320x120 | ring 60 to 120 px over the tapped detail; stamp 160 to 240 px |
| `window-caption` | Typed caption strip (blank) | 960x72 | 240 to 480 px wide, text set over it |
| `window-photo-depot-1` | Photo panel: depot 1 (01:48) | 480x360 | 240 to 400 px wide each, stacked left |
| `window-photo-depot-2` | Photo panel: depot 2 (02:05) | 480x360 | 240 to 400 px wide each, stacked left |
| `window-photo-depot-3` | Photo panel: depot 3 (02:22) | 480x360 | 240 to 400 px wide each, stacked left |
| `window-photo-research-1` | Photo panel: research 1 (02:10) | 480x360 | 240 to 400 px wide each, stacked left |
| `window-photo-research-2` | Photo panel: research 2 (02:31) | 480x360 | 240 to 400 px wide each, stacked left |
| `window-photo-research-3` | Photo panel: research 3 (02:44) | 480x360 | 240 to 400 px wide each, stacked left |
| `window-rota` | Guard rota sheet (blank strip) | 640x440 | rota sheet 320 to 640 px wide on the right; bars and segments stretched to their time span |

## Fiche (1D, `fiche`)

Style: Scratchboard. 14 own assets, plus shared: `hud-margin-calm`, `hud-word-rcc`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `fiche-mark-chalk` | Mark: chalk numbers on the kerb (June) | 240x240 | in a frame's marks field, 100 to 180 px |
| `fiche-mark-minnows` | Mark: a jar of minnows on a windowsill (Hollis) | 240x240 | in a frame's marks field, 100 to 180 px |
| `fiche-mark-scabs` | Mark: matching scabs (Mira and Pell Ostrowski) | 240x240 | in a frame's marks field, 100 to 180 px |
| `fiche-mark-wheel` | Mark: a training wheel left on (Dale) | 240x240 | in a frame's marks field, 100 to 180 px |
| `fiche-hood` | Reader hood (the screen) | 640x500 | sheet 480 to 720 px wide on the left; hood 320 to 560 px on the right |
| `fiche-knob` | Focus knob | 160x160 | knob 60 to 100 px; tray 320 to 480 px; lamp 40 to 60 px |
| `fiche-lamp` | Reader lamp (failing) | 120x160 | knob 60 to 100 px; tray 320 to 480 px; lamp 40 to 60 px |
| `fiche-see` | Cross-reference mark: SEE | 200x80 | inside the hood's screen (about 92% of it); SEE 80 to 120 px |
| `fiche-tray` | Carrier tray (sheet, row, column) | 640x180 | knob 60 to 100 px; tray 320 to 480 px; lamp 40 to 60 px |
| `fiche-frame-biosynth` | Cross-reference frame: BIOSYNTH, SEE CORRIDOR C | 480x320 | inside the hood's screen (about 92% of it); SEE 80 to 120 px |
| `fiche-frame-blank` | Subject frame (blank) | 480x320 | inside the hood's screen (about 92% of it); SEE 80 to 120 px |
| `fiche-frame-cmxcix` | Subject frame: CMXCIX (his own file) | 480x320 | inside the hood's screen (about 92% of it); SEE 80 to 120 px |
| `fiche-index-card` | Index card (a frame of its own) | 480x320 | inside the hood's screen (about 92% of it); SEE 80 to 120 px |
| `fiche-sheet` | A sheet of fiche (rows A to N, columns 1 to 12) | 960x680 | sheet 480 to 720 px wide on the left; hood 320 to 560 px on the right |

## Aftermath (1D, `aftermath`)

Style: Manga screentone, evidence tents. 25 own assets, plus shared: `hud-self`, `hud-margin-calm`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `aftermath-shape-blank` | Silhouette panel, unrevealed | 280x320 | a column on the right, 100 to 160 px wide each |
| `aftermath-shape-one` | Shape I: shoulders too high | 280x320 | a column on the right, 100 to 160 px wide each |
| `aftermath-shape-three` | Shape III: low and long | 280x320 | a column on the right, 100 to 160 px wide each |
| `aftermath-shape-two` | Shape II: a joint too many | 280x320 | a column on the right, 100 to 160 px wide each |
| `aftermath-archive` | Aftermath room: the archive (Green ending) | 1280x640 | the upper part of the stage, full width |
| `aftermath-depot-post` | Aftermath room: the depot guard post | 1280x640 | the upper part of the stage, full width |
| `aftermath-trace-clock` | Trace: Wall clock, stopped | 320x420 | a popup, 240 to 320 px wide |
| `aftermath-trace-dent` | Trace: Locker, dented | 320x420 | a popup, 240 to 320 px wide |
| `aftermath-trace-etch` | Trace: Etched doorway | 320x420 | a popup, 240 to 320 px wide |
| `aftermath-trace-light` | Trace: Strip light, failed | 320x420 | a popup, 240 to 320 px wide |
| `aftermath-trace-plate` | Trace: Lacquered flakes | 320x420 | a popup, 240 to 320 px wide |
| `aftermath-trace-scrape` | Trace: Long scrape to the door | 320x420 | a popup, 240 to 320 px wide |
| `aftermath-trace-strap` | Trace: Torn strap | 320x420 | a popup, 240 to 320 px wide |
| `aftermath-trace-torch` | Trace: Dropped torch | 320x420 | a popup, 240 to 320 px wide |
| `aftermath-set-aside` | Set-aside tray (not his) | 320x160 | slot 56 to 90 px wide each; tray 200 to 320 px |
| `aftermath-slot` | Ordering strip slot | 160x150 | slot 56 to 90 px wide each; tray 200 to 320 px |
| `aftermath-tent-1` | Evidence tent 1 | 140x120 | 48 to 80 px wide on the room and in the strip |
| `aftermath-tent-2` | Evidence tent 2 | 140x120 | 48 to 80 px wide on the room and in the strip |
| `aftermath-tent-3` | Evidence tent 3 | 140x120 | 48 to 80 px wide on the room and in the strip |
| `aftermath-tent-4` | Evidence tent 4 | 140x120 | 48 to 80 px wide on the room and in the strip |
| `aftermath-tent-5` | Evidence tent 5 | 140x120 | 48 to 80 px wide on the room and in the strip |
| `aftermath-tent-6` | Evidence tent 6 | 140x120 | 48 to 80 px wide on the room and in the strip |
| `aftermath-tent-7` | Evidence tent 7 | 140x120 | 48 to 80 px wide on the room and in the strip |
| `aftermath-tent-8` | Evidence tent 8 | 140x120 | 48 to 80 px wide on the room and in the strip |
| `aftermath-tent-9` | Evidence tent 9 | 140x120 | 48 to 80 px wide on the room and in the strip |

## Shared (chapter cards and the HUD)

Not in any mode's style: the game's own register (graded concrete, typed captions, the two signal colours).
Alexander's pages keep the Pulse margin; Reese's pages have none (DESIGN.md section 12, Colour as HUD).

| id | for | native | draw at |
| --- | --- | --- | --- |
| `chapter-1` | Chapter I: The First Dose | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-10` | Chapter X: The Observers | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-11` | Chapter XI: Snakehead | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-2` | Chapter II: Sky Room | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-3` | Chapter III: Subject CMXCIX | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-4` | Chapter IV: Trial 53 | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-5` | Chapter V: The Forging | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-6` | Chapter VI: Aegis, Mantled | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-7` | Chapter VII: The Hunt | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-8` | Chapter VIII: Containment Action | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `chapter-9` | Chapter IX: Two Years and One Week | 1280x720 | chapter card on the menu or before a mode opens; 640 to 1280 px wide |
| `hud-amber` | HUD icon: Amber (a dose on hand) | 96x96 | 24 to 40 px, one per dose (0 to 6) |
| `hud-amber-empty` | HUD icon: Amber (an empty slot) | 96x96 | 24 to 40 px, one per dose (0 to 6) |
| `hud-caption` | Caption box (blank, for dated captions) | 600x96 | 300 to 600 px wide, text over it |
| `hud-margin-calm` | Pulse margin line: calm (amber) | 1200x32 | full width of the page bottom, 12 to 32 px tall |
| `hud-margin-edge` | Pulse margin line: at the edge (amber, green spikes) | 1200x32 | full width of the page bottom, 12 to 32 px tall |
| `hud-margin-green` | Pulse margin line: 100 (green from the corners) | 1200x32 | full width of the page bottom, 12 to 32 px tall |
| `hud-pulse` | HUD icon: Pulse (calm) | 96x96 | 24 to 48 px |
| `hud-pulse-edge` | HUD icon: Pulse at the edge (green spikes) | 96x96 | 24 to 48 px |
| `hud-self` | HUD icon: Self (a struck word) | 96x96 | 24 to 40 px |
| `hud-word-hope` | Terminology Rule: HOPE (the insignia) | 240x96 | 120 to 240 px wide |
| `hud-word-rcc` | Terminology Rule: RCC (the plate) | 240x96 | 120 to 240 px wide |

## Not drawn here

- No thread-guest: `docs/DEEP_DIVE.md` section 4's ring closes on the ten games (Behind the Peephole to WrymWretch
  and back), and `tools/web/build.py` `RING` lists those ten, so the ring has no slot for Rise.
- No faces and no portraits: the character sheet is the author's generated art, for key art. Characters
  appear here as silhouettes, hands, gear and signs; children only as hands, from behind, or as their marks.
- The arena is not drawn; chapter 4's card shows the blades thrown down. The Toxin State is one panel of
  shape, cut before any act; Aftermath shows traces and shapes, never a body.

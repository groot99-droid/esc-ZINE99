# Dr. Tox: Finale: asset map for the web modules

199 code-drawn assets (`art.json`), read through `api.art` by id. Each module uses only its own
style's assets plus the shared ones listed for it; do not borrow another mode's art (one graphic style
per mode, `docs/graphic_styles.json`). Ids are stable and begin with the module key; the `row` in
`art.json` begins `<module> | ...`. Draw sizes are the intended on-screen sizes at a 1280 x 720 stage;
every asset is a vector and scales. Written from `art.json` at stage B; update it if an id changes.

## Loading screen and menu

Style: the game's own register (not a mode style). 11 own assets, plus shared: `chapter-1`, `chapter-2`, `chapter-3`, `chapter-4`, `chapter-5`, `chapter-6`, `chapter-7`, `chapter-8`, `chapter-9`, `chapter-10`, `hud-self-low`.

Endings in resolver order: `ending-the-light-bringers-wall`, `ending-green-wins`, `ending-the-cage-holds`, `ending-the-first-word`, `ending-the-reset` (as written). Each card leads with its cost. Mark a save with `hud-self-low` when Self is at or under 40.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `ending-green-wins` | Ending: Green Wins | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-the-cage-holds` | Ending: The Cage Holds | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-the-first-word` | Ending: The First Word | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-the-light-bringers-wall` | Ending: The Light Bringer's Wall | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `ending-the-reset` | Ending: The Reset | 1200x675 | menu ending cards, 360 to 600 px wide (fallback when no generated card) |
| `loading-monitor-amber` | Loading monitor line, amber (held) | 1200x140 | full width, 70 to 140 px tall; amber at progress 0, crossfade to the Self-line strip by 0.6 and to the floor strip at 1 |
| `loading-monitor-floor` | Loading monitor line, the Self line lowered to the floor | 1200x140 | full width, 70 to 140 px tall; amber at progress 0, crossfade to the Self-line strip by 0.6 and to the floor strip at 1 |
| `loading-monitor-trigger` | Loading monitor line, amber under the Self line | 1200x140 | full width, 70 to 140 px tall; amber at progress 0, crossfade to the Self-line strip by 0.6 and to the floor strip at 1 |
| `loading-plain` | Loading backdrop: the last city over the plain, 2240 | 1600x900 | covers the stage (object-fit: cover), under the still |
| `title-episodes` | Episode strip: Rise and Fall done, Finale open, Altrulan shut | 1200x180 | menu header, 600 to 900 px wide |
| `title-finale` | Title lettering: Dr. Tox: Finale | 1200x420 | full width of the loading screen, about 720 px wide |

## Shared (chapter cards and HUD)

Style: the game's own register (not a mode style). 30 own assets.

Chapter cards carry their own margin rule: Dr. Tox chapters (1 to 8) have the amber Pulse margin, chapter 9 (Reese) has none, chapter 10 (the core) is near-black with none. `hud-hold` is the only HUD in the core. 1D pages show no HUD (DESIGN.md section 14); these are for the 3D layer, menus and the two 2D modes.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `chapter-1` | Chapter I: Overrun | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-10` | Chapter X: The Reset | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-2` | Chapter II: The Station | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-3` | Chapter III: The Bench | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-4` | Chapter IV: The Last City | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-5` | Chapter V: Procession | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-6` | Chapter VI: The Perimeter | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-7` | Chapter VII: The Airway | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-8` | Chapter VIII: The Clinical Suite | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `chapter-9` | Chapter IX: The Light Bringer | 1280x720 | full stage (1280 x 720) between scenes, or 320 to 480 px wide in the pause and chapter menus |
| `hud-amber` | HUD icon: Amber (a dose on hand) | 96x96 | 40 to 56 px square in the HUD corner |
| `hud-amber-empty` | HUD icon: Amber (an empty slot) | 96x96 | 40 to 56 px square in the HUD corner |
| `hud-breath` | HUD icon: the breath radius (a ring on the floor) | 96x96 | 40 to 56 px square in the HUD corner |
| `hud-caption` | Caption box (blank, for dated captions) | 600x96 | 300 to 500 px wide, top left, text laid over it |
| `hud-hold` | The core's only prompt: HOLD | 360x120 | centred low on the stage, about 240 px wide; nothing else on screen but the lamp |
| `hud-load` | Load gauge (Aegis, pale gold) | 480x48 | 240 to 360 px wide, top of Reese's screens |
| `hud-margin-calm` | Pulse margin line: calm (amber) | 1200x32 | full width of the page, 16 to 24 px tall, along the bottom margin of every Dr. Tox page (none on Reese's pages or in the core) |
| `hud-margin-edge` | Pulse margin line: near the Self line (green spikes) | 1200x32 | full width of the page, 16 to 24 px tall, along the bottom margin of every Dr. Tox page (none on Reese's pages or in the core) |
| `hud-margin-green` | Pulse margin line: at the line (green from the corners) | 1200x32 | full width of the page, 16 to 24 px tall, along the bottom margin of every Dr. Tox page (none on Reese's pages or in the core) |
| `hud-pulse` | HUD icon: Pulse (calm) | 96x96 | 40 to 56 px square in the HUD corner |
| `hud-pulse-edge` | HUD icon: Pulse near the line (green spike) | 96x96 | 40 to 56 px square in the HUD corner |
| `hud-self` | HUD icon: Self (a struck word) | 96x96 | 40 to 56 px square in the HUD corner |
| `hud-self-floor` | Self gauge with the floor at 40 marked | 480x64 | 300 to 480 px wide in the pause screen and episode menu; never with a number |
| `hud-self-low` | Menu stamp: Self is low | 240x72 | 120 to 180 px wide on a save in the episode menu |
| `hud-shroud-closed` | HUD icon: shroud closed | 96x96 | 40 to 56 px square in the HUD corner |
| `hud-shroud-open` | HUD icon: shroud open | 96x96 | 40 to 56 px square in the HUD corner |
| `hud-word-him` | The cult's word: HIM (the tract's) | 240x96 | 120 to 180 px wide; 240 px at the hub's Word choice |
| `hud-word-hope` | Terminology Rule: HOPE (the insignia) | 240x96 | 120 to 180 px wide; 240 px at the hub's Word choice |
| `hud-word-rcc` | Terminology Rule: RCC (the plate) | 240x96 | 120 to 180 px wide; 240 px at the hub's Word choice |
| `hud-word-silence` | Terminology Rule: nothing (the held breath) | 240x96 | 120 to 180 px wide; 240 px at the hub's Word choice |

## Procession (2D, `procession`)

Style: Photocopied punk-zine collage. 32 own assets, plus shared: `hud-margin-calm`, `hud-margin-edge`, `hud-margin-green`, `hud-pulse`, `hud-pulse-edge`, `hud-breath`, `hud-shroud-open`, `hud-shroud-closed`, `hud-word-rcc`, `hud-word-him`.

Figures are transparent sprites, feet on the bottom edge; names, wants and one word go on `procession-name-tag`. Use `procession-road-*` for `s2_procession_1` and `procession-perimeter-*` for `s2_procession_2`; the masts, the shield line and `procession-tox-dart` are Procession 2 only. The ring goes under the figures and over the backdrop.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `procession-arrow` | Procession: the red tape arrow (him, to the front) | 300x80 | 80 to 120 px wide over the column strip |
| `procession-cart` | Procession: Dov's copier on its handcart | 360x260 | same scale as the figures (cart about 220 px wide, pole about 220 px tall) |
| `procession-front-banner` | Procession: the banner at the head of the march | 560x200 | about 300 px wide at the head of the march |
| `procession-go-home` | Procession: GO HOME. (ransom letters) | 480x110 | 120 to 260 px wide, over his hand or centred at the front |
| `procession-marcher-banner` | Procession: marcher (banner) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-marcher-home` | Procession: marcher (home) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-marcher-jerrican` | Procession: marcher (jerrican) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-marcher-reach` | Procession: marcher (reach) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-marcher-stopped` | Procession: marcher (stopped) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-marcher-walk-a` | Procession: marcher (walk-a) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-marcher-walk-b` | Procession: marcher (walk-b) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-mast-dark` | Procession: a floodlight mast, blacked out | 240x480 | 260 to 340 px tall on the mid line |
| `procession-mast-lit` | Procession: a floodlight mast, lit | 240x480 | 260 to 340 px tall on the mid line |
| `procession-name-tag` | Procession: a name tag (blank, for name, want and word) | 260x96 | 130 to 180 px wide above a follower |
| `procession-perimeter-far` | Procession: the floodlit perimeter (Procession 2) (far layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `procession-perimeter-mid` | Procession: the floodlit perimeter (Procession 2) (mid layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `procession-perimeter-near` | Procession: the floodlit perimeter (Procession 2) (near layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `procession-pole` | Procession: a banner pole planted in the road | 160x360 | same scale as the figures (cart about 220 px wide, pole about 220 px tall) |
| `procession-ring` | Procession: the breath ring (torn white circle) | 400x140 | under Dr. Tox, scaled to the breath radius (1.0 m + Pulse/50 m, halved with the shroud closed) |
| `procession-road-far` | Procession: the plain road at dawn (Procession 1) (far layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `procession-road-mid` | Procession: the plain road at dawn (Procession 1) (mid layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `procession-road-near` | Procession: the plain road at dawn (Procession 1) (near layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `procession-shield` | Procession: the shield line (State security) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-staple` | Procession: a staple (ornament) | 48x24 | ornament, native size or half |
| `procession-stop` | Procession: STOP. (ransom letters, red) | 300x110 | 120 to 260 px wide, over his hand or centred at the front |
| `procession-strip` | Procession: the column strip (the march from above) | 1200x80 | full width, 48 to 64 px tall, top of the page |
| `procession-tape` | Procession: a strip of tape (ornament) | 160x48 | ornament, native size or half |
| `procession-tox` | Procession: Dr. Tox, shroud closed (walking) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-tox-dart` | Procession: Dr. Tox, darting (Procession 2) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-tox-hand` | Procession: Dr. Tox, a hand raised (Stop.) | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-tox-open` | Procession: Dr. Tox, shroud open | 200x320 | 120 to 170 px tall, feet on the road line (one scale for everyone) |
| `procession-tract` | Procession: a tract page dropped on the road | 120x90 | 50 to 70 px wide on the road |

## The airway (2D, `airway`)

Style: Non-photo-blue pencil roughs. 26 own assets, plus shared: `hud-margin-calm`, `hud-margin-edge`, `hud-margin-green`, `hud-pulse`, `hud-pulse-edge`, `hud-shroud-open`, `hud-shroud-closed`, `hud-breath`.

Every duct piece has a `-blue` (rough, ahead or not taken) and an `-inked` (behind him) version at the same size: swap as he passes, and lay `airway-ink-edge` at his position. Use `airway-stack-*` for `s2_airway_1` and `airway-supply-*` for `s2_airway_2`. Rooms: `airway-room` with names lettered at run time; swap to `airway-room-exposed` when the plume passes an open grille.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `airway-arrow-blue` | Airway: arrow (blue rough) | 160x120 | 60 to 100 px wide inside the duct |
| `airway-arrow-inked` | Airway: arrow (inked) | 160x120 | 60 to 100 px wide inside the duct |
| `airway-branch-blue` | Airway: branch (blue rough) | 480x240 | one duct cell, 240 to 480 px wide; swap -blue for -inked as he passes |
| `airway-branch-inked` | Airway: branch (inked) | 480x240 | one duct cell, 240 to 480 px wide; swap -blue for -inked as he passes |
| `airway-damper-open` | Airway: a louvred damper, open | 180x220 | duct height (about 160 to 220 px tall), cycling open and shut |
| `airway-damper-shut` | Airway: a louvred damper, shut | 180x220 | duct height (about 160 to 220 px tall), cycling open and shut |
| `airway-duct-blue` | Airway: duct (blue rough) | 480x240 | one duct cell, 240 to 480 px wide; swap -blue for -inked as he passes |
| `airway-duct-inked` | Airway: duct (inked) | 480x240 | one duct cell, 240 to 480 px wide; swap -blue for -inked as he passes |
| `airway-fan-blue` | Airway: fan (blue rough) | 480x240 | one duct cell, 240 to 480 px wide; swap -blue for -inked as he passes |
| `airway-fan-inked` | Airway: fan (inked) | 480x240 | one duct cell, 240 to 480 px wide; swap -blue for -inked as he passes |
| `airway-grille-blue` | Airway: grille (blue rough) | 480x240 | one duct cell, 240 to 480 px wide; swap -blue for -inked as he passes |
| `airway-grille-inked` | Airway: grille (inked) | 480x240 | one duct cell, 240 to 480 px wide; swap -blue for -inked as he passes |
| `airway-ink-edge` | Airway: the inked edge, in progress | 120x240 | duct height, at his position |
| `airway-note-hold` | Airway: margin note, HOLD BREATH | 300x60 | 120 to 240 px wide |
| `airway-note-not-taken` | Airway: margin note, not taken | 240x60 | 120 to 240 px wide |
| `airway-plume` | Airway: his breath plume (grey wash) | 420x120 | trailing downstream from him, 200 to 420 px long |
| `airway-room` | Airway: a room under a grille (pencilled, names blank) | 320x200 | 160 to 260 px wide under a grille |
| `airway-room-exposed` | Airway: an exposed room (people leaving, coughing) | 320x200 | 160 to 260 px wide under a grille |
| `airway-stack-far` | Airway: the exhaust stack from the plinth (Airway 1) (far layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `airway-stack-mid` | Airway: the exhaust stack from the plinth (Airway 1) (mid layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `airway-supply-far` | Airway: the supply duct over the clinical suite (Airway 2) (far layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `airway-supply-mid` | Airway: the supply duct over the clinical suite (Airway 2) (mid layer) | 1920x540 | stage height (about 400 to 540 px), tiled horizontally; far 0.3, mid 0.6, near 1.2 of the camera |
| `airway-tox` | Airway: Dr. Tox (move) | 160x200 | 90 to 130 px tall inside the duct |
| `airway-tox-breath` | Airway: Dr. Tox (breath) | 160x200 | 90 to 130 px tall inside the duct |
| `airway-tox-grip` | Airway: Dr. Tox (grip) | 160x200 | 90 to 130 px tall inside the duct |
| `airway-tox-shroud` | Airway: Dr. Tox (shroud) | 160x200 | 90 to 130 px tall inside the duct |

## The Creed (1D, `creed`)

Style: Pocket tract booklet. 23 own assets.

A tile is `creed-tile-frame` with two `creed-end-<word>` panels in its slots (left slot x 10, right slot x 136, y 40, 114 x 132 at native size) and his line lettered across the top bar. Words: blank, ring, mark, need, amber, rcc, blood. `creed-tile-sky` and `creed-tile-string` are Cally's dealt tiles; `creed-tile-naming` is Creed 2's earned tile. No HUD on this page.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `creed-boneyard` | Creed: the boneyard (a stack of folded tracts) | 200x240 | 100 to 140 px wide at the left |
| `creed-cover-line` | Creed: the doctrine line on the cover (blank) | 640x60 | 320 to 480 px wide above the spread |
| `creed-dealer-hands` | Creed: the dealer's hands (Cally, dealing) | 360x220 | 180 to 300 px wide, at the table's edge |
| `creed-end-amber` | Creed: tile end, AMBER | 120x140 | one end of a tile, 60 to 90 px wide in the chain, 90 to 120 px in the hand |
| `creed-end-blank` | Creed: tile end, BLANK | 120x140 | one end of a tile, 60 to 90 px wide in the chain, 90 to 120 px in the hand |
| `creed-end-blood` | Creed: tile end, BLOOD | 120x140 | one end of a tile, 60 to 90 px wide in the chain, 90 to 120 px in the hand |
| `creed-end-mark` | Creed: tile end, MARK | 120x140 | one end of a tile, 60 to 90 px wide in the chain, 90 to 120 px in the hand |
| `creed-end-need` | Creed: tile end, NEED | 120x140 | one end of a tile, 60 to 90 px wide in the chain, 90 to 120 px in the hand |
| `creed-end-rcc` | Creed: tile end, RCC | 120x140 | one end of a tile, 60 to 90 px wide in the chain, 90 to 120 px in the hand |
| `creed-end-ring` | Creed: tile end, RING | 120x140 | one end of a tile, 60 to 90 px wide in the chain, 90 to 120 px in the hand |
| `creed-hand-tray` | Creed: his hand (strip along the bottom) | 1280x180 | full width, bottom 140 to 180 px of the stage |
| `creed-hint` | Creed: hint, an open end the lector can match with BLOOD | 140x160 | over an open end, at the end panel's size |
| `creed-lector` | Creed: the lector at the drum (Mercy, reading) | 320x420 | 180 to 260 px tall at the far side of the table |
| `creed-spread` | Creed: the tract open across the page | 1280x720 | full stage |
| `creed-tile-back` | Creed: tile face down | 260x180 | one tile, 130 to 200 px wide (the end panels sit in its two slots) |
| `creed-tile-frame` | Creed: tile frame (two ends and a line of his) | 260x180 | one tile, 130 to 200 px wide (the end panels sit in its two slots) |
| `creed-tile-naming` | Creed: the naming tile (Creed 2) | 260x180 | one tile, 130 to 200 px wide (the end panels sit in its two slots) |
| `creed-tile-sky` | Creed: the sky tile (dealt to him) | 260x180 | one tile, 130 to 200 px wide (the end panels sit in its two slots) |
| `creed-tile-string` | Creed: the string tile (dealt to him) | 260x180 | one tile, 130 to 200 px wide (the end panels sit in its two slots) |
| `creed-tox-hand` | Creed: his gloved hand laying a tile | 300x220 | 180 to 300 px wide, at the table's edge |
| `creed-tract-cover` | Creed: the tract's cover | 480x660 | 260 to 400 px tall, on the how-to-play and the finish |
| `creed-verse-blood` | Creed: verse, ALL OF IT IS HIS BLOOD. | 1100x100 | the spread's verse band, 900 to 1100 px wide |
| `creed-verse-ring` | Creed: verse, THE RING IS HOLY. | 1100x100 | the spread's verse band, 900 to 1100 px wide |

## Split Field (1D, `split-field`)

Style: Craftint Doubletone shading board. 21 own assets.

Lay the mark's striae in the circle's left half and the chosen reference's in the right half (clip each disc to its half), then the frame over both. Marks on the boards are already numbered in the art (station 8, perimeter 10); overlay `split-field-marker-locked` on a mark once attributed. False traces: `-rust`, `-bloom`, `-old-resin`. References: `-his`, `-theirs`, `-state-rim`, `-state-baton`, `-state-round`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `split-field-circle` | Split Field: the comparison circle (frame and hairline) | 440x480 | centre, 300 to 400 px; the striae sit under it |
| `split-field-marker` | Split Field: a mark's number badge (open) | 64x64 | 28 to 40 px on the board |
| `split-field-marker-locked` | Split Field: a mark's number badge (attributed) | 64x64 | 28 to 40 px on the board |
| `split-field-perimeter` | Split Field: the perimeter after (Split Field 2) | 1280x720 | upper part of the stage, 640 to 900 px wide |
| `split-field-record` | Split Field: the record strip (blank) | 320x600 | right strip, 220 to 300 px wide |
| `split-field-record-line` | Split Field: one record entry (filled tone band) | 300x100 | one entry, the record's width |
| `split-field-stamp-aside` | Split Field: stamp, NOT OF THIS DAY | 360x80 | 180 to 300 px wide |
| `split-field-stamp-pin` | Split Field: stamp, PIN THE BOARD | 300x80 | 180 to 300 px wide |
| `split-field-stamp-reconstructed` | Split Field: stamp, RECONSTRUCTED | 360x80 | 180 to 300 px wide |
| `split-field-station` | Split Field: the water station after (Split Field 1) | 1280x720 | upper part of the stage, 640 to 900 px wide |
| `split-field-striae-bloom` | Split Field: striae, bloom | 420x420 | the circle's size (300 to 400 px), clipped to one half |
| `split-field-striae-his` | Split Field: striae, his | 420x420 | the circle's size (300 to 400 px), clipped to one half |
| `split-field-striae-old-resin` | Split Field: striae, old-resin | 420x420 | the circle's size (300 to 400 px), clipped to one half |
| `split-field-striae-rust` | Split Field: striae, rust | 420x420 | the circle's size (300 to 400 px), clipped to one half |
| `split-field-striae-state-baton` | Split Field: striae, state-baton | 420x420 | the circle's size (300 to 400 px), clipped to one half |
| `split-field-striae-state-rim` | Split Field: striae, state-rim | 420x420 | the circle's size (300 to 400 px), clipped to one half |
| `split-field-striae-state-round` | Split Field: striae, state-round | 420x420 | the circle's size (300 to 400 px), clipped to one half |
| `split-field-striae-theirs` | Split Field: striae, theirs | 420x420 | the circle's size (300 to 400 px), clipped to one half |
| `split-field-tray-his` | Split Field: reference tray, HIS | 320x140 | 160 to 240 px wide, stacked at the left |
| `split-field-tray-state` | Split Field: reference tray, STATE | 320x140 | 160 to 240 px wide, stacked at the left |
| `split-field-tray-theirs` | Split Field: reference tray, THEIRS | 320x140 | 160 to 240 px wide, stacked at the left |

## Two Pans (1D, `two-pans`)

Style: Two-colour pulp, red and black. 23 own assets.

Assemble: stand at centre (pivot 150, 40), beam centred on the pivot and rotated, pans hung from the beam ends, dial above with the pointer's pivot (20, 240) on the dial's base centre (280, 250). Pointer angle: share of BLACK p maps to -90 + 180 p degrees from straight up. Window 70 to 78 percent; heart band 86 to 90 (`two-pans-dial-heart`, Two Pans 3 only). Covers: `-bench` for `s1_pans_1`, `-suite` for `s1_pans_2`, `-core` for `s1_pans_3`. Red and black only: do not tint these.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `two-pans-beam` | Two Pans: the beam (rotates about its centre) | 720x60 | 460 to 640 px wide on the stand's pivot |
| `two-pans-caption-heart` | Two Pans: caption, HERE, HIS HEART WOULD HOLD. | 360x110 | 180 to 320 px wide |
| `two-pans-caption-refuse` | Two Pans: caption, IT WILL NOT REST THERE. | 360x110 | 180 to 320 px wide |
| `two-pans-confirm` | Two Pans: REST IT (confirm) | 260x90 | 180 to 320 px wide |
| `two-pans-cover-bench` | Two Pans: cover (bench) | 1280x720 | full stage |
| `two-pans-cover-core` | Two Pans: cover (core) | 1280x720 | full stage |
| `two-pans-cover-suite` | Two Pans: cover (suite) | 1280x720 | full stage |
| `two-pans-dial` | Two Pans: the dial with the window | 560x300 | 400 to 520 px wide above the beam |
| `two-pans-dial-heart` | Two Pans: the dial with the window and the heart band | 560x300 | 400 to 520 px wide above the beam |
| `two-pans-jar` | Two Pans: a rite jar (Two Pans 1) | 160x200 | the load's picture beside the load plate, 100 to 220 px wide |
| `two-pans-load` | Two Pans: the load plate (number laid in) | 300x90 | 180 to 320 px wide |
| `two-pans-pan-black` | Two Pans: the BLACK pan | 260x290 | 170 to 230 px wide, hung from the beam's ends |
| `two-pans-pan-red` | Two Pans: the RED pan | 260x290 | 170 to 230 px wide, hung from the beam's ends |
| `two-pans-pointer` | Two Pans: the pointer (pivot at the bottom) | 40x260 | about 180 to 220 px tall, pivot on the dial's centre |
| `two-pans-rack` | Two Pans: RCC's rack of vials (Two Pans 2) | 420x220 | the load's picture beside the load plate, 100 to 220 px wide |
| `two-pans-stand` | Two Pans: the stand and pivot | 300x520 | about 300 to 420 px tall, centre |
| `two-pans-token-1` | Two Pans: pip token, 1 | 80x80 | 40 to 56 px; in the pans and the tray |
| `two-pans-token-2` | Two Pans: pip token, 2 | 80x80 | 40 to 56 px; in the pans and the tray |
| `two-pans-token-3` | Two Pans: pip token, 3 | 80x80 | 40 to 56 px; in the pans and the tray |
| `two-pans-token-4` | Two Pans: pip token, 4 | 80x80 | 40 to 56 px; in the pans and the tray |
| `two-pans-token-5` | Two Pans: pip token, 5 | 80x80 | 40 to 56 px; in the pans and the tray |
| `two-pans-token-6` | Two Pans: pip token, 6 | 80x80 | 40 to 56 px; in the pans and the tray |
| `two-pans-tray` | Two Pans: the token tray | 560x130 | 360 to 520 px wide along the bottom |

## Switchboard (1D, `switchboard`)

Style: Letterer's balloon page. 18 own assets.

Panels sit along the bottom of the page (y 380 to 680 at native size), with a socket at each panel's top centre; draw tails as inked cords from a balloon's tail point (bottom centre) to a socket, ending in `switchboard-jack`. `switchboard-page-1` for `s1_switchboard_1`, `switchboard-page-2` for `s1_switchboard_2`. A pulled last tail swaps its balloon for `switchboard-balloon-dead`.

| id | for | native | draw at |
| --- | --- | --- | --- |
| `switchboard-balloon-air-1` | Switchboard: balloon, AIR 1 | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-balloon-air-2` | Switchboard: balloon, AIR 2 | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-balloon-air-3` | Switchboard: balloon, AIR 3 | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-balloon-air-4` | Switchboard: balloon, AIR 4 | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-balloon-air-5` | Switchboard: balloon, AIR 5 | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-balloon-air-6` | Switchboard: balloon, AIR 6 | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-balloon-assist` | Switchboard: balloon, ASSIST | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-balloon-dead` | Switchboard: balloon, AIR | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-balloon-hub` | Switchboard: balloon, HUB | 300x150 | 180 to 240 px wide above the panels |
| `switchboard-balloon-lock` | Switchboard: balloon, LOCK | 220x120 | 120 to 170 px wide above the panels |
| `switchboard-confirm` | Switchboard: confirm (OK TO PRINT) | 280x90 | 220 to 420 px wide in the margin |
| `switchboard-jack` | Switchboard: a cord's jack (the tail's end) | 40x80 | 20 to 30 px wide at a tail's end |
| `switchboard-lock-note` | Switchboard: the interlock's note (red) | 520x110 | 220 to 420 px wide in the margin |
| `switchboard-note` | Switchboard: the letterer's margin note (blank) | 520x70 | 220 to 420 px wide in the margin |
| `switchboard-page-1` | Switchboard: page 1 (4 districts) | 1280x720 | full stage |
| `switchboard-page-2` | Switchboard: page 2 (5 districts) | 1280x720 | full stage |
| `switchboard-socket` | Switchboard: a panel socket (empty) | 48x48 | 24 to 32 px at a panel's top edge |
| `switchboard-socket-live` | Switchboard: a panel socket (live) | 48x48 | 24 to 32 px at a panel's top edge |

## Panes (1D, `panes`)

Style: Holographic foil trading card. 15 own assets, plus shared: `hud-load`, `hud-word-hope`, `hud-word-rcc`, `hud-word-silence`.

The breach in both cards is the tangram's 2 x 2 square at 120 px per unit, top-left at (160, 204) in the card; pieces are drawn at the same unit. The keystone is the medium triangle; in Panes 2 use `panes-keystone` for it, and `panes-piece-medium` in Panes 1. Card fronts: `panes-card-atrium` for `s1_panes_1`, `panes-card-hub` for `s1_panes_2`; `panes-card-back` holds the names at the crack (Panes 1).

| id | for | native | draw at |
| --- | --- | --- | --- |
| `panes-card-atrium` | Panes: the card for the atrium (Panes 1) | 560x780 | the card, 420 to 600 px tall, centre stage |
| `panes-card-back` | Panes: the card's back (names at the crack) | 560x780 | the card, 420 to 600 px tall, centre stage |
| `panes-card-hub` | Panes: the card for the hub (Panes 2) | 560x780 | the card, 420 to 600 px tall, centre stage |
| `panes-fumes` | Panes: fumes through a gap | 140x140 | 60 to 90 px at a gap |
| `panes-hope-seal` | Panes: the HOPE seal (the Word said) | 140x140 | 70 to 100 px on the card's corner |
| `panes-keystone` | Panes: the keystone (sets only on HOPE) | 186x101 | at the card's art-window scale: one tangram unit = the breach's unit (120 px native, so about 80 to 120 px) |
| `panes-piece-large-a` | Panes: piece, large a | 256x136 | at the card's art-window scale: one tangram unit = the breach's unit (120 px native, so about 80 to 120 px) |
| `panes-piece-large-b` | Panes: piece, large b | 136x256 | at the card's art-window scale: one tangram unit = the breach's unit (120 px native, so about 80 to 120 px) |
| `panes-piece-medium` | Panes: piece, medium | 136x136 | at the card's art-window scale: one tangram unit = the breach's unit (120 px native, so about 80 to 120 px) |
| `panes-piece-out` | Panes: a pane gone out (the flinch) | 186x101 | laid over each set pane during a flinch, at that pane's size |
| `panes-piece-parallelogram` | Panes: piece, parallelogram | 196x76 | at the card's art-window scale: one tangram unit = the breach's unit (120 px native, so about 80 to 120 px) |
| `panes-piece-small-a` | Panes: piece, small a | 76x136 | at the card's art-window scale: one tangram unit = the breach's unit (120 px native, so about 80 to 120 px) |
| `panes-piece-small-b` | Panes: piece, small b | 136x76 | at the card's art-window scale: one tangram unit = the breach's unit (120 px native, so about 80 to 120 px) |
| `panes-piece-square` | Panes: piece, square | 136x136 | at the card's art-window scale: one tangram unit = the breach's unit (120 px native, so about 80 to 120 px) |
| `panes-sticker` | Panes: a name sticker (blank) | 200x64 | 100 to 160 px wide on the card's back |

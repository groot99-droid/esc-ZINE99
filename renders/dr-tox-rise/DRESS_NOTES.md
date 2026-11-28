# Dressing notes: dr-tox-rise

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

7 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): conc_wall 5, conc_wall_damp 5, glass 3, painted_steel 3, asphalt 2, earth 2, conc_floor 2, paint_gloss 2, brick 1, steel_clean 1, marble 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): concrete-dark, river; P3 (vegetation): grass-dry.

## P1 gates

40 stills in 7 places, every gate per still against its own before.

Gate checks: 740 passed, 41 failed, 51 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 28 |
| G8 | repeat pattern | 13 |

Every failing check (place, scene/still, gate, value, limit):

- idaho-river-town s3_river_night/camera: G7 1.46 (limit 2.0)
- idaho-river-town s3_river_night/camera: G8 0.389 (limit 0.2)
- idaho-river-town s3_river_night/player: G8 0.264 (limit 0.2)
- idaho-river-town s3_river_town/player: G8 0.312 (limit 0.2)
- lower-ring-corridor s3_lower_ring/player: G7 1.13 (limit 2.0)
- lower-ring-corridor s3_lower_ring_after/player: G8 0.606 (limit 0.2)
- printer-room s3_printer_room/camera: G8 0.379 (limit 0.2)
- printer-room s3_printer_room/overview: G7 1.29 (limit 2.0)
- printer-room s3_printer_room/player: G8 0.371 (limit 0.2)
- printer-room s3_printer_room_after/camera: G7 1.08 (limit 2.0)
- printer-room s3_printer_room_after/player: G7 1.86 (limit 2.0)
- sky-room s3_skyroom_evening/camera: G7 1.24 (limit 1.656)
- sky-room s3_skyroom_evening/player: G7 1.25 (limit 1.643)
- sky-room s3_skyroom_evening/player: G8 0.574 (limit 0.2)
- sky-room s3_skyroom_small/camera: G7 1.09 (limit 1.712)
- sky-room s3_skyroom_small/overview: G7 1.26 (limit 1.7)
- sky-room s3_skyroom_small/overview: G8 0.395 (limit 0.2)
- sky-room s3_skyroom_small/player: G7 1.07 (limit 1.625)
- snakehead-archive s3_archive_alarm/camera: G7 1.14 (limit 2.0)
- snakehead-archive s3_archive_alarm/player: G7 1.04 (limit 2.0)
- snakehead-archive s3_archive_claimed/camera: G7 1.04 (limit 2.0)
- snakehead-archive s3_archive_claimed/player: G7 1.01 (limit 2.0)
- snakehead-archive s3_archive_empty/camera: G7 0.06 (limit 2.0)
- snakehead-archive s3_archive_empty/player: G7 0.05 (limit 2.0)
- snakehead-archive s3_archive_empty/player: G8 0.837 (limit 0.2)
- snakehead-archive s3_archive_fall/camera: G7 1.1 (limit 2.0)
- snakehead-archive s3_archive_fall/overview: G7 0.87 (limit 2.0)
- snakehead-archive s3_archive_fall/overview: G8 0.774 (limit 0.2)
- snakehead-archive s3_archive_fall/player: G7 1.05 (limit 2.0)
- snakehead-archive s3_archive_green/camera: G7 1.34 (limit 2.0)
- snakehead-archive s3_bunker_injection/camera: G7 1.16 (limit 2.0)
- spire-plaza s3_spire_ceremony/camera: G7 0.76 (limit 2.0)
- spire-plaza s3_spire_ceremony/overview: G7 1.51 (limit 2.0)
- spire-plaza s3_spire_ceremony/overview: G8 1.158 (limit 0.2)
- spire-plaza s3_spire_ceremony/player: G7 0.76 (limit 2.0)
- spire-plaza s3_spire_mirror/player: G8 0.242 (limit 0.2)
- trial-53-arena s3_arena/camera: G7 1.3 (limit 2.0)
- trial-53-arena s3_arena/overview: G7 1.04 (limit 2.0)
- trial-53-arena s3_arena/player: G7 1.57 (limit 2.0)
- trial-53-arena s3_arena_after/camera: G7 1.74 (limit 2.0)
- trial-53-arena s3_arena_after/camera: G8 0.478 (limit 0.2)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

10 stills in 2 places, every gate per still against its own before.

Gate checks: 183 passed, 1 failed, 24 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G11 | hero-prop light | 1 |

Every failing check (place, scene/still, gate, value, limit):

- idaho-river-town s3_river_night/camera: G11 0.1983 (limit 0.08262)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P3 gates (outdoor and forest kit; before = the P1 and P2b render)

5 stills in 1 places. Gate checks: 90 passed, 3 failed, 12 not applicable.
G7 (detail gain) is counted as not applicable: it averages every dressed region, most of which P1 already dressed.

- idaho-river-town s3_river_night/player: G4b 6.07 (limit 16.35)
- idaho-river-town s3_river_town/camera: G8 0.581 (limit 0.2)
- idaho-river-town s3_river_town/player: G8 0.31 (limit 0.2)

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

5 stills in 1 places. Gate checks: 93 passed, 0 failed, 12 not applicable (detail gain counted as n/a).


## P6 gates (skirting and conduit kits; before = the P1 to P5 render)

26 stills in 4 places. Gate checks: 485 passed, 2 failed, 55 not applicable (detail gain counted as n/a).

- snakehead-archive s3_archive_claimed/player: G4a 29.208 (limit 26.049)
- snakehead-archive s3_archive_empty/camera: G4a 12.556 (limit 12.225)

## P6b gates (fixture bodies, bookshelf bays; before = the P1 to P6 render)

26 stills in 4 places. Gate checks: 487 passed, 0 failed, 55 not applicable (detail gain counted as n/a).


## P6c gates (window frames, sills, mullions, door casings and leaves; before = the P1 to P6b render)

10 stills in 2 places. Gate checks: 188 passed, 0 failed, 21 not applicable (detail gain counted as n/a).


## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

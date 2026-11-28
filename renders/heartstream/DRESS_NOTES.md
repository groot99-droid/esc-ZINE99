# Dressing notes: heartstream

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

13 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): plaster 4, plaster_old 3.

Not dressed in P1 (later phases): P2 (sky or water pieces): backwater-grey-rose, blood-calm, blood-water, red-glow; P5 (per-game specials): crimson, crimson-deep, marrow-deep, marrow-floor, marrow-glow, marrow-tissue, membrane-red, membrane-white, muscle, tissue-pink.

Left as built (marks, voids, dark gaps or no fitting family): ochre-red.

## P1 gates

17 stills in 5 places, every gate per still against its own before.

Gate checks: 317 passed, 7 failed, 33 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4b | darkest pixels | 3 |
| G8 | repeat pattern | 3 |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- pulse-wall-chamber s3_marrow_pulse/overview: G6b 0.1574 (limit 0.1406)
- shedding-gallery s3_gallery/camera: G4b 72.11 (limit 73.39)
- shedding-gallery s3_gallery/camera: G8 0.367 (limit 0.2)
- shedding-gallery s3_gallery/overview: G8 0.41 (limit 0.2)
- shedding-gallery s3_gallery/player: G4b 65.48 (limit 67.9)
- shedding-gallery s3_gallery/player: G8 0.555 (limit 0.2)
- stencil-gallery s3_stencil_gallery/player: G4b 37.78 (limit 39.63)

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

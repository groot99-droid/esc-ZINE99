# Dressing notes: lira-calyx

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

14 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): timber 9, painted_steel 7, earth 5, plaster 4, ceiling 2, glass 2, plaster_clean 2, drystone 2, wood_deck 2, flagstone 2, fabric_fine 2, stone_block 2, conc_floor 1, tile_gloss 1, thatch 1, gravel 1, fabric 1, dry_ground 1, boards_v 1, wood_floor 1, timber_varnish 1, stove_iron 1, tile 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): flood, ice-wall, mesa, mist, peaks, puddle, river, river-glow, rock; P3 (vegetation): conifer, fungal-mat, grass, moss, moss-dark, moss-glow, roots; P4 (rock, snow, ice): cavern, cliff, crust, gorge-rock, ledge-rock, outcrop, ridge-rock, rock, rubble, snow; P5 (per-game specials): amber-crystal, bone, cavity, core-crystal, core-glow, fused-glass, rib, web-bark.

Left as built (marks, voids, dark gaps or no fitting family): matte-black, vault-black.

## P1 gates

62 stills in 14 places, every gate per still against its own before.

Gate checks: 1149 passed, 46 failed, 103 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 29 |
| G8 | repeat pattern | 12 |
| G6b | light/dark spread | 4 |
| G4b | darkest pixels | 1 |

Every failing check (place, scene/still, gate, value, limit):

- cinder-reach-archive b2-archive/overview: G7 1.18 (limit 2.0)
- cinder-reach-archive b2-archive/overview: G8 0.675 (limit 0.2)
- cinder-reach-archive b2-archive/player: G7 1.63 (limit 2.0)
- cinder-reach-archive b2-archive/player: G8 0.87 (limit 0.2)
- continuum-outpost b3-outpost/camera: G7 1.68 (limit 2.0)
- continuum-outpost b3-outpost/overview: G6b 0.5782 (limit 0.5125)
- continuum-outpost b3-outpost/overview: G7 1.13 (limit 2.0)
- continuum-outpost b3-outpost/player: G7 1.27 (limit 2.0)
- continuum-outpost b3-outpost/player: G8 0.436 (limit 0.2)
- corporate-lab b2-lab/camera: G8 0.658 (limit 0.2)
- corporate-lab b2-lab/overview: G7 1.31 (limit 2.0)
- corporate-lab b2-lab/player: G8 0.621 (limit 0.2)
- harvest-terrace b3-midlander/camera: G8 0.541 (limit 0.2)
- harvest-terrace b3-midlander/overview: G7 1.92 (limit 2.0)
- harvest-terrace b3-midlander/player: G8 0.588 (limit 0.2)
- hollin-terrace b1-terrace/overview: G7 1.72 (limit 2.0)
- hollin-terrace end-errata/player: G8 0.418 (limit 0.2)
- peak-core b4-core/camera: G7 0.99 (limit 2.0)
- peak-core b4-core/overview: G7 0.99 (limit 2.0)
- peak-core b4-core/player: G7 1.0 (limit 2.0)
- scorched-biome b2-lowlands/camera: G7 1.63 (limit 2.0)
- scorched-biome b2-lowlands/overview: G7 1.2 (limit 2.0)
- scorched-biome b2-lowlands/player: G7 1.72 (limit 2.0)
- shear-tunnel b4-collapse/camera: G7 1.91 (limit 2.0)
- shear-tunnel b4-collapse/player: G7 1.49 (limit 2.0)
- shear-tunnel co-tunnel/overview: G6b 0.7704 (limit 0.6914)
- shear-tunnel co-tunnel/overview: G7 1.69 (limit 2.0)
- small-room b3-hiding/camera: G4b 9.05 (limit 9.19)
- small-room b3-hiding/overview: G8 0.743 (limit 0.2)
- small-room b3-hiding/player: G7 1.2 (limit 2.0)
- small-room end-in-time/player: G7 1.08 (limit 2.0)
- small-room end-written/camera: G7 1.65 (limit 2.0)
- small-room end-written/camera: G8 0.777 (limit 0.2)
- small-room end-written/player: G7 1.17 (limit 2.0)
- small-room end-written/player: G8 0.472 (limit 0.2)
- spore-weaver-valley b1-valley/camera: G7 1.01 (limit 2.0)
- spore-weaver-valley b1-valley/overview: G6b 0.7441 (limit 0.67)
- spore-weaver-valley b1-valley/overview: G7 1.02 (limit 2.0)
- spore-weaver-valley b1-valley/player: G7 1.02 (limit 2.0)
- storm-singing-ledge b3-peakborn/camera: G7 1.3 (limit 2.0)
- storm-singing-ledge b3-peakborn/overview: G6b 0.5649 (limit 0.5084)
- storm-singing-ledge b3-peakborn/overview: G7 1.06 (limit 2.0)
- storm-singing-ledge b3-peakborn/player: G7 1.64 (limit 2.0)
- subterranean-city b3-city/overview: G7 1.49 (limit 2.0)
- subterranean-city end-resilience/player: G8 0.515 (limit 0.2)
- subterranean-city ep-vault/camera: G7 1.93 (limit 2.0)

## P2 gates (atmosphere and skies; before = the P1 render)

15 stills in 5 places, every gate per still against its own before.

Gate checks: 268 passed, 2 failed, 44 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G6b | light/dark spread | 2 |

Every failing check (place, scene/still, gate, value, limit):

- spore-weaver-valley b1-valley/overview: G6b 0.7483 (limit 0.6697)
- storm-singing-ledge b3-peakborn/overview: G6b 0.5641 (limit 0.5084)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2 is a first cut: sky plates and faint outdoor haze only; no dust, shafts, rain, snow, flames or water yet.
- Half-size look renders; the full-size pass is P7.

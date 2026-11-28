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

Gate checks: 1151 passed, 44 failed, 103 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 30 |
| G8 | repeat pattern | 10 |
| G6b | light/dark spread | 4 |

Every failing check (place, scene/still, gate, value, limit):

- cinder-reach-archive b2-archive/overview: G7 1.18 (limit 1.718)
- cinder-reach-archive b2-archive/overview: G8 0.675 (limit 0.2)
- cinder-reach-archive b2-archive/player: G7 1.63 (limit 1.644)
- cinder-reach-archive b2-archive/player: G8 0.87 (limit 0.2)
- continuum-outpost b3-outpost/camera: G7 1.68 (limit 2.0)
- continuum-outpost b3-outpost/overview: G6b 0.5782 (limit 0.5125)
- continuum-outpost b3-outpost/overview: G7 1.13 (limit 2.0)
- continuum-outpost b3-outpost/player: G7 1.27 (limit 2.0)
- continuum-outpost b3-outpost/player: G8 0.436 (limit 0.2)
- corporate-lab b2-lab/camera: G8 0.658 (limit 0.2)
- corporate-lab b2-lab/overview: G7 1.31 (limit 1.745)
- corporate-lab b2-lab/player: G8 0.621 (limit 0.2)
- harvest-terrace b3-midlander/camera: G8 0.567 (limit 0.2)
- harvest-terrace b3-midlander/overview: G7 2.0 (limit 2.0)
- harvest-terrace b3-midlander/player: G8 0.636 (limit 0.2)
- hollin-terrace end-errata/player: G8 0.418 (limit 0.2)
- peak-core b4-core/camera: G7 0.99 (limit 2.0)
- peak-core b4-core/overview: G7 0.99 (limit 2.0)
- peak-core b4-core/player: G7 1.0 (limit 2.0)
- scorched-biome b2-lowlands/camera: G7 1.63 (limit 2.0)
- scorched-biome b2-lowlands/overview: G7 1.2 (limit 2.0)
- scorched-biome b2-lowlands/player: G7 1.72 (limit 2.0)
- shear-tunnel b4-collapse/camera: G7 1.81 (limit 2.0)
- shear-tunnel b4-collapse/player: G7 1.65 (limit 2.0)
- shear-tunnel co-tunnel/overview: G6b 0.7699 (limit 0.6914)
- shear-tunnel co-tunnel/overview: G7 1.29 (limit 2.0)
- shear-tunnel co-tunnel/player: G7 1.81 (limit 2.0)
- shear-tunnel ep-tunnel/player: G7 1.88 (limit 2.0)
- small-room b3-hiding/player: G7 1.2 (limit 1.562)
- small-room end-in-time/player: G7 1.08 (limit 1.562)
- small-room end-written/camera: G7 1.54 (limit 1.66)
- small-room end-written/player: G7 1.18 (limit 1.562)
- small-room end-written/player: G8 0.468 (limit 0.2)
- spore-weaver-valley b1-valley/camera: G7 1.01 (limit 2.0)
- spore-weaver-valley b1-valley/overview: G6b 0.7441 (limit 0.67)
- spore-weaver-valley b1-valley/overview: G7 1.02 (limit 2.0)
- spore-weaver-valley b1-valley/player: G7 1.02 (limit 2.0)
- storm-singing-ledge b3-peakborn/camera: G7 1.3 (limit 1.994)
- storm-singing-ledge b3-peakborn/overview: G6b 0.5649 (limit 0.5084)
- storm-singing-ledge b3-peakborn/overview: G7 1.06 (limit 1.94)
- storm-singing-ledge b3-peakborn/player: G7 1.64 (limit 2.0)
- subterranean-city b3-city/overview: G7 1.49 (limit 1.912)
- subterranean-city end-resilience/player: G8 0.515 (limit 0.2)
- subterranean-city ep-vault/camera: G7 1.93 (limit 2.0)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

43 stills in 9 places, every gate per still against its own before.

Gate checks: 763 passed, 14 failed, 123 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4b | darkest pixels | 5 |
| G6b | light/dark spread | 3 |
| G3b | region colour | 2 |
| G8 | repeat pattern | 2 |
| G5 | colour specks | 1 |
| G4a | dark area | 1 |

Every failing check (place, scene/still, gate, value, limit):

- cinder-reach-archive b2-archive/camera: G3b 6.38 (limit 6.0)
- cinder-reach-archive b2-archive/camera: G4b 18.83 (limit 24.96)
- cinder-reach-archive b2-archive/camera: G8 0.513 (limit 0.2)
- cinder-reach-archive b2-archive/player: G3b 6.74 (limit 6.0)
- cinder-reach-archive b2-archive/player: G4b 14.76 (limit 18.25)
- cinder-reach-archive b2-archive/player: G8 1.032 (limit 0.2)
- hollin-terrace end-errata/camera: G5 1 (limit 0)
- shear-tunnel co-tunnel/overview: G6b 0.7698 (limit 0.6929)
- spore-weaver-valley b1-valley/camera: G4b 0.0 (limit 1.58)
- spore-weaver-valley b1-valley/overview: G4a 16.931 (limit 0.5)
- spore-weaver-valley b1-valley/overview: G4b 0.79 (limit 7.16)
- spore-weaver-valley b1-valley/overview: G6b 0.7623 (limit 0.6697)
- spore-weaver-valley b1-valley/player: G4b 0.0 (limit 1.58)
- storm-singing-ledge b3-peakborn/overview: G6b 0.5633 (limit 0.5084)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

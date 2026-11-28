# Dressing notes: wrymwretch

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

14 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): flagstone 3, earth 3, gravel 2, stone_block 2, paper 1, log_wall 1, path 1, drystone 1, dry_ground 1, brass 1, marble 1, glass 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): abyss, cloud, cosmic-dust, first-light, fissure, new-stars, realm-east, sea-oil, storm-sky, surface, veil, vortex; P3 (vegetation): moss, moss-roof, vine-glow; P4 (rock, snow, ice): cavern-rock, cliff, island-rock, island-top, obsidian, rock; P5 (per-game specials): bone, bone-dark, cloud-bone, cottage-silver, crystal-ash, crystal-out, crystal-wall, dead-coral, fern-silver, fused-bone, fused-gold, fused-silver, gem-ochre, moss-forgotten, moss-silver, realm-above, realm-below, realm-north, realm-south, realm-west, shell-string, silver, silver-crack.

Left as built (marks, voids, dark gaps or no fitting family): crack, pencil, void.

## P1 gates

57 stills in 11 places, every gate per still against its own before.

Gate checks: 1032 passed, 32 failed, 120 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 22 |
| G8 | repeat pattern | 9 |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- astral-expanse s_battle_unwriter/camera: G7 1.18 (limit 2.0)
- astral-expanse s_battle_unwriter/player: G7 1.72 (limit 2.0)
- astral-expanse s_expanse/camera: G7 0.93 (limit 2.0)
- astral-expanse s_expanse/overview: G7 0.97 (limit 2.0)
- duskbane-underworld s_duskbane_halls/camera: G8 0.221 (limit 0.2)
- duskbane-underworld s_duskbane_halls/overview: G7 1.58 (limit 2.0)
- duskbane-underworld s_duskbane_halls/overview: G8 0.346 (limit 0.2)
- duskbane-underworld s_duskbane_halls/player: G8 0.432 (limit 0.2)
- duskbane-underworld s_forbidden_chamber/player: G8 0.218 (limit 0.2)
- galewing-sky-city s_cloud_platform/camera: G7 1.15 (limit 2.0)
- galewing-sky-city s_cloud_platform/player: G7 1.02 (limit 2.0)
- galewing-sky-city s_cloud_platform/player: G8 0.804 (limit 0.2)
- galewing-sky-city s_galewing_ward/camera: G7 1.38 (limit 2.0)
- galewing-sky-city s_galewing_ward/camera: G8 0.51 (limit 0.2)
- galewing-sky-city s_galewing_ward/overview: G7 1.27 (limit 2.0)
- heartstone-caverns s_heartstone_hall/overview: G7 1.15 (limit 2.0)
- heartstone-caverns s_heartstone_hall/player: G7 1.66 (limit 2.0)
- ranger-outpost s_cedar_outpost/camera: G8 0.703 (limit 0.2)
- ranger-outpost s_cedar_outpost/overview: G6b 0.5927 (limit 0.545)
- ranger-outpost s_cedar_outpost/overview: G8 0.761 (limit 0.2)
- ranger-outpost s_cedar_outpost/player: G8 0.692 (limit 0.2)
- rim-of-wrymreach s_chasm_seal1/camera: G7 1.2 (limit 2.0)
- rim-of-wrymreach s_moot_camp/camera: G7 1.08 (limit 2.0)
- rim-of-wrymreach s_moot_camp/overview: G7 1.14 (limit 2.0)
- rim-of-wrymreach s_moot_camp/player: G7 1.13 (limit 2.0)
- rim-of-wrymreach s_rim/camera: G7 1.95 (limit 2.0)
- rim-of-wrymreach s_rim/player: G7 1.89 (limit 2.0)
- tidecaller-shore s_shore_night/overview: G7 1.8 (limit 2.0)
- western-groves s_cedar_grove/camera: G7 1.45 (limit 2.0)
- western-groves s_cedar_grove/player: G7 1.2 (limit 2.0)
- western-groves s_elder_tree/camera: G7 1.75 (limit 2.0)
- western-groves s_elder_tree/overview: G7 1.21 (limit 2.0)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

21 stills in 3 places, every gate per still against its own before.

Gate checks: 374 passed, 1 failed, 61 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4b | darkest pixels | 1 |

Every failing check (place, scene/still, gate, value, limit):

- rim-of-wrymreach s_chasm_seal2/camera: G4b 11.15 (limit 11.44)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

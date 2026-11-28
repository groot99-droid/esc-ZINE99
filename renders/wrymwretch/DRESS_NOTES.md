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

## P3 gates (outdoor and forest kit; before = the P1 and P2b render)

5 stills in 1 places. Gate checks: 93 passed, 7 failed, 5 not applicable.
G7 (detail gain) is counted as not applicable: it averages every dressed region, most of which P1 already dressed.

- western-groves s_cedar_grove/camera: G4b 10.96 (limit 20.06)
- western-groves s_cedar_grove/camera: G8 0.273 (limit 0.2)
- western-groves s_cedar_grove/player: G4b 14.86 (limit 19.64)
- western-groves s_cedar_grove/player: G8 0.392 (limit 0.2)
- western-groves s_elder_tree/camera: G2 0.1302 (limit 0.12)
- western-groves s_elder_tree/camera: G3a 4.222 (limit 4.0)
- western-groves s_elder_tree/overview: G11 0.1889 (limit 0.08262)

## P4 gates (rock, snow, frost and ice; before = the P1 to P3 render)

41 stills in 7 places. Gate checks: 762 passed, 36 failed, 50 not applicable.
G7 is listed but not meaningful for an incremental phase: it averages every dressed region, most unchanged since P1.

- astral-expanse s_battle_unwriter/camera: G7 1.0 (limit 2.0)
- astral-expanse s_battle_unwriter/player: G7 1.0 (limit 2.0)
- astral-expanse s_expanse/camera: G2 0.2594 (limit 0.12)
- duskbane-underworld s_duskbane_halls/camera: G7 1.0 (limit 2.0)
- duskbane-underworld s_duskbane_halls/overview: G7 1.0 (limit 2.0)
- duskbane-underworld s_duskbane_halls/player: G7 1.0 (limit 2.0)
- duskbane-underworld s_forbidden_chamber/camera: G7 1.0 (limit 2.0)
- duskbane-underworld s_forbidden_chamber/player: G7 1.0 (limit 2.0)
- duskbane-underworld s_underworld_tunnels/camera: G7 1.29 (limit 2.0)
- duskbane-underworld s_underworld_tunnels/camera: G14 0.12118962230077657 (limit 0.06)
- duskbane-underworld s_underworld_tunnels/player: G7 1.32 (limit 2.0)
- duskbane-underworld s_underworld_tunnels/player: G14 0.1493238530623881 (limit 0.06)
- galewing-sky-city s_cloud_platform/player: G7 1.0 (limit 2.0)
- galewing-sky-city s_galewing_ward/camera: G7 1.0 (limit 2.0)
- galewing-sky-city s_galewing_ward/overview: G7 1.0 (limit 2.0)
- galewing-sky-city s_galewing_ward/player: G4b 28.86 (limit 31.65)
- heartstone-caverns s_heartstone_hall/camera: G7 1.03 (limit 2.0)
- heartstone-caverns s_heartstone_hall/overview: G7 1.05 (limit 2.0)
- heartstone-caverns s_heartstone_hall/player: G7 1.03 (limit 2.0)
- rim-of-wrymreach s_chasm_seal1/camera: G7 1.28 (limit 2.0)
- rim-of-wrymreach s_moot_camp/camera: G7 1.01 (limit 2.0)
- rim-of-wrymreach s_moot_camp/overview: G7 0.99 (limit 2.0)
- rim-of-wrymreach s_moot_camp/player: G7 1.0 (limit 2.0)
- rim-of-wrymreach s_moot_dawn/camera: G7 1.46 (limit 2.0)
- rim-of-wrymreach s_moot_dawn/player: G7 1.14 (limit 2.0)
- rim-of-wrymreach s_rim/camera: G7 1.29 (limit 2.0)
- rim-of-wrymreach s_rim/player: G7 1.05 (limit 2.0)
- rim-of-wrymreach s_rim_ambush/camera: G7 1.0 (limit 2.0)
- rim-of-wrymreach s_rim_ambush/player: G7 1.01 (limit 2.0)
- seabed s_seabed/camera: G4b 35.62 (limit 38.05)
- seabed s_seabed/player: G4b 36.48 (limit 39.12)
- tidecaller-shore s_shore_night/camera: G7 1.0 (limit 2.0)
- tidecaller-shore s_shore_night/overview: G7 1.23 (limit 2.0)
- tidecaller-shore s_shore_night/player: G7 1.0 (limit 2.0)
- tidecaller-shore s_tide_shore/camera: G7 1.0 (limit 2.0)
- tidecaller-shore s_tide_shore/player: G7 1.0 (limit 2.0)

## P5 gates (per-game specials, rock relief, tree crowns; before = the P1 to P4 render)

47 stills in 9 places. Gate checks: 826 passed, 58 failed, 92 not applicable (detail gain counted as n/a).

- galewing-sky-city s_cloud_platform/camera: G2 0.416 (limit 0.12)
- galewing-sky-city s_cloud_platform/camera: G3a 11.201 (limit 4.0)
- galewing-sky-city s_cloud_platform/camera: G3b 17.09 (limit 6.0)
- galewing-sky-city s_cloud_platform/camera: G6b 0.2927 (limit 0.3575)
- galewing-sky-city s_cloud_platform/camera: G10b piece:platform-top (limit piece:platform-underside)
- galewing-sky-city s_galewing_ward/overview: G3b 14.77 (limit 6.0)
- galewing-sky-city s_galewing_ward/player: G2 0.2162 (limit 0.12)
- galewing-sky-city s_galewing_ward/player: G3a 7.807 (limit 4.0)
- galewing-sky-city s_galewing_ward/player: G3b 14.68 (limit 6.0)
- galewing-sky-city s_galewing_ward/player: G4a 1.397 (limit 0.5)
- galewing-sky-city s_galewing_ward/player: G4b 2.86 (limit 26.86)
- galewing-sky-city s_galewing_ward/player: G8 0.665 (limit 0.2)
- heartstone-caverns s_deep_core/camera: G3b 7.97 (limit 6.0)
- heartstone-caverns s_deep_core/camera: G4b 15.04 (limit 26.31)
- heartstone-caverns s_deep_core/camera: G8 0.272 (limit 0.2)
- heartstone-caverns s_deep_core/player: G2 0.1215 (limit 0.12)
- heartstone-caverns s_deep_core/player: G3b 8.09 (limit 6.0)
- heartstone-caverns s_deep_core/player: G4b 14.83 (limit 25.39)
- heartstone-caverns s_deep_core/player: G8 0.375 (limit 0.2)
- heartstone-caverns s_heartstone_hall/camera: G4b 9.35 (limit 14.56)
- heartstone-caverns s_heartstone_hall/camera: G8 1.053 (limit 0.2)
- heartstone-caverns s_heartstone_hall/overview: G8 0.744 (limit 0.2)
- heartstone-caverns s_heartstone_hall/player: G4b 11.42 (limit 15.77)
- ranger-outpost s_cedar_outpost/overview: G6b 0.5927 (limit 0.5334)
- rim-of-wrymreach s_chasm_seal1/camera: G2 0.1716 (limit 0.12)
- rim-of-wrymreach s_chasm_seal1/camera: G3a 5.1 (limit 4.0)
- rim-of-wrymreach s_chasm_seal1/camera: G3b 14.66 (limit 6.0)
- rim-of-wrymreach s_chasm_seal1/camera: G6b 0.5695 (limit 0.6396)
- rim-of-wrymreach s_chasm_seal2/camera: G3b 6.11 (limit 6.0)
- rim-of-wrymreach s_chasm_seal2/camera: G8 0.507 (limit 0.2)
- rim-of-wrymreach s_moot_camp/camera: G3b 10.29 (limit 6.0)
- rim-of-wrymreach s_moot_camp/camera: G4a 2.588 (limit 1.925)
- rim-of-wrymreach s_moot_camp/overview: G3b 11.63 (limit 6.0)
- rim-of-wrymreach s_moot_camp/overview: G8 0.957 (limit 0.2)
- rim-of-wrymreach s_moot_camp/player: G3b 6.52 (limit 6.0)
- rim-of-wrymreach s_moot_camp/player: G4a 23.044 (limit 22.513)
- rim-of-wrymreach s_moot_dawn/camera: G3b 9.69 (limit 6.0)
- rim-of-wrymreach s_moot_dawn/camera: G8 0.337 (limit 0.2)
- rim-of-wrymreach s_moot_dawn/player: G3b 9.78 (limit 6.0)
- rim-of-wrymreach s_rim/camera: G3b 10.11 (limit 6.0)
- rim-of-wrymreach s_rim/camera: G4b 6.86 (limit 28.35)
- rim-of-wrymreach s_rim/camera: G8 0.288 (limit 0.2)
- rim-of-wrymreach s_rim/player: G3b 9.95 (limit 6.0)
- rim-of-wrymreach s_rim_ambush/camera: G4a 2.516 (limit 1.055)
- rim-of-wrymreach s_rim_ambush/camera: G4b 4.71 (limit 5.57)
- rim-of-wrymreach s_rim_ambush/player: G4a 40.195 (limit 36.639)
- seabed s_seabed/camera: G3b 7.58 (limit 6.0)
- seabed s_seabed/camera: G4b 21.76 (limit 33.62)
- seabed s_seabed/camera: G8 0.234 (limit 0.2)
- seabed s_seabed/overview: G2 0.1685 (limit 0.12)
- seabed s_seabed/overview: G3a 4.923 (limit 4.0)
- seabed s_seabed/overview: G3b 7.55 (limit 6.0)
- seabed s_seabed/overview: G4b 20.96 (limit 22.83)
- seabed s_seabed/overview: G6b 0.1502 (limit 0.2425)
- seabed s_seabed/player: G3b 7.86 (limit 6.0)
- seabed s_seabed/player: G4b 23.53 (limit 34.48)
- seabed s_seabed/player: G8 0.225 (limit 0.2)
- tidecaller-shore s_shore_night/overview: G8 0.527 (limit 0.2)

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

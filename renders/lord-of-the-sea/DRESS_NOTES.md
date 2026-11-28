# Dressing notes: lord-of-the-sea

Render-side dressing only (tools/render/dress). No build file, assets.json, design or data file changed.
Look renders: half resolution, half samples. Before = the driver with `--no-dress 1`; after = the same driver, pack, models and seeds.

## P1: core surfaces and grime

13 places got P1 entries from `p1.py` (pilot places keep their hand-made R3 entries).
Presets used (place x material): fabric 7, stone_block 7, wood_deck 6, timber 4, sand 4, flagstone 3, boards_v 3, plaster 3, paper 2, thatch 2, timber_varnish 1, brass 1, marble 1, earth 1, brick 1, stove_iron 1.

Not dressed in P1 (later phases): P2 (sky or water pieces): dusk-sea, glass-lane, glassy-sea, harbour-water, haze, headland, hull, island, river, rough-sea, sand, sea, sea-dawn, shallows, trench, turquoise-sea; P3 (vegetation): forest, weed; P4 (rock, snow, ice): cliff, headland, rock, salt-hill; P5 (per-game specials): hull, ink-hull, reef, tarred-wood.

Left as built (marks, voids, dark gaps or no fitting family): company-blue, foam, ink-blue.

## P1 gates

64 stills in 12 places, every gate per still against its own before.

Gate checks: 1202 passed, 63 failed, 75 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 25 |
| G8 | repeat pattern | 19 |
| G4a | dark area | 7 |
| G14 | seams | 5 |
| G4b | darkest pixels | 3 |
| G2 | tone | 2 |
| G9 | texel density | 1 |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- boat-cabin s-cabin-dawn/camera: G7 1.77 (limit 2.0)
- boat-cabin s-cabin-dawn/camera: G8 0.876 (limit 0.2)
- boat-cabin s-cabin-dawn/overview: G4a 24.13 (limit 23.709)
- boat-cabin s-cabin-dawn/overview: G8 0.903 (limit 0.2)
- boat-cabin s-cabin-dawn/player: G4a 9.944 (limit 9.579)
- boat-cabin s-cabin-dawn/player: G7 1.55 (limit 2.0)
- boat-cabin s-cabin-dawn/player: G8 0.859 (limit 0.2)
- boat-cabin s-cabin-princess/camera: G8 0.962 (limit 0.2)
- boat-cabin s-cabin-tally/camera: G4a 35.578 (limit 35.066)
- boat-cabin s-cabin-tally/player: G4a 33.876 (limit 32.784)
- boat-cabin s-cabin-tally/player: G7 1.97 (limit 2.0)
- boat-cabin s-cabin-tally/player: G8 0.781 (limit 0.2)
- boat-cabin s-chart-table/player: G4a 10.51 (limit 9.998)
- boat-cabin s-chart-table/player: G7 1.97 (limit 2.0)
- boat-cabin s-the-inventory/camera: G7 1.68 (limit 2.0)
- boat-cabin s-the-inventory/player: G7 1.78 (limit 2.0)
- boat-cabin s-the-inventory/player: G8 0.864 (limit 0.2)
- chandlery s-chandlery/camera: G8 0.455 (limit 0.2)
- chandlery s-chandlery/overview: G8 0.63 (limit 0.2)
- chandlery s-chandlery/player: G4b 40.83 (limit 62.81)
- chandlery s-chandlery/player: G9 {'piece:wall-east': 0.58} (limit [0.7, 2.0])
- company-lane s-company-lane/camera: G7 1.02 (limit 1.5)
- company-lane s-company-lane/player: G7 1.08 (limit 1.5)
- counting-house s-counting-house/camera: G7 1.18 (limit 2.0)
- counting-house s-counting-house/camera: G14 0.0649480810388222 (limit 0.06)
- counting-house s-counting-house/overview: G6b 0.2 (limit 0.1729)
- counting-house s-counting-house/overview: G7 1.12 (limit 2.0)
- counting-house s-counting-house/overview: G14 0.06383278551422411 (limit 0.06)
- counting-house s-counting-house/player: G7 1.32 (limit 2.0)
- counting-house s-counting-house/player: G8 0.545 (limit 0.2)
- counting-house s-counting-house/player: G14 0.0890306637405226 (limit 0.06)
- counting-house s-the-cup/camera: G7 1.34 (limit 2.0)
- counting-house s-the-cup/camera: G8 0.641 (limit 0.2)
- counting-house s-the-cup/camera: G14 0.19278847191092652 (limit 0.06)
- counting-house s-the-cup/player: G7 1.05 (limit 2.0)
- counting-house s-the-cup/player: G14 0.28473163560401354 (limit 0.06)
- home-reach-beach s-end-charter/camera: G7 1.65 (limit 2.0)
- home-reach-beach s-end-no-lord/player: G8 0.319 (limit 0.2)
- kings-halls s-kings-halls/camera: G8 0.343 (limit 0.2)
- kings-halls s-kings-halls/overview: G7 1.59 (limit 1.79)
- kings-halls s-kings-halls/overview: G8 0.433 (limit 0.2)
- kings-halls s-kings-halls/player: G8 0.365 (limit 0.2)
- kings-halls s-second-collision/camera: G7 1.69 (limit 1.811)
- kings-halls s-second-collision/camera: G8 0.617 (limit 0.2)
- kings-halls s-second-collision/player: G7 1.68 (limit 1.812)
- kings-halls s-the-oars/camera: G8 0.587 (limit 0.2)
- lamplit-strait s-lamplit-strait/camera: G4a 4.805 (limit 1.807)
- lamplit-strait s-lamplit-strait/camera: G7 1.68 (limit 2.0)
- lamplit-strait s-lamplit-strait/camera: G8 0.353 (limit 0.2)
- lamplit-strait s-lamplit-strait/overview: G2 0.2074 (limit 0.12)
- lamplit-strait s-lamplit-strait/overview: G8 0.25 (limit 0.2)
- lamplit-strait s-lamplit-strait/player: G2 0.121 (limit 0.12)
- lamplit-strait s-lamplit-strait/player: G4a 8.322 (limit 3.272)
- lamplit-strait s-lamplit-strait/player: G7 1.98 (limit 2.0)
- lamplit-strait s-lamplit-strait/player: G8 0.246 (limit 0.2)
- pearl-banks s-pearl-banks/camera: G7 1.06 (limit 2.0)
- pearl-banks s-pearl-banks/overview: G7 1.03 (limit 2.0)
- pearl-banks s-pearl-banks/player: G7 1.05 (limit 2.0)
- salt-steps s-salt-steps/camera: G4b 75.03 (limit 86.03)
- salt-steps s-salt-steps/overview: G4b 78.09 (limit 78.16)
- salt-steps s-salt-steps/overview: G7 1.38 (limit 2.0)
- spice-mouth s-spice-mouth/overview: G7 1.28 (limit 2.0)
- tidewater s-tidewater/overview: G7 1.04 (limit 1.732)

## P2 and P2b gates (skies, water, motes, rain, flames, fog; before = the P1 render)

53 stills in 11 places, every gate per still against its own before.

Gate checks: 969 passed, 26 failed, 114 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G4b | darkest pixels | 13 |
| G8 | repeat pattern | 8 |
| G11 | hero-prop light | 2 |
| G6b | light/dark spread | 2 |
| G4a | dark area | 1 |

Every failing check (place, scene/still, gate, value, limit):

- boat-deck s-deck-dinghy/camera: G11 0.1768 (limit 0.08262)
- boat-deck s-deck-dinghy/player: G11 0.1224 (limit 0.08262)
- company-lane s-company-lane/camera: G4b 49.86 (limit 50.8)
- company-lane s-company-lane/overview: G8 0.421 (limit 0.2)
- company-lane s-company-lane/player: G4b 41.83 (limit 42.01)
- counting-house s-counting-house/overview: G6b 0.2 (limit 0.18)
- home-reach-beach s-beach-tideline/player: G4b 11.5 (limit 16.57)
- home-reach-beach s-end-charter/camera: G8 0.778 (limit 0.2)
- home-reach-beach s-end-lords-peace/camera: G8 0.589 (limit 0.2)
- home-reach-beach s-end-lords-peace/player: G8 0.52 (limit 0.2)
- home-reach-beach s-end-paid-in-kind/player: G4b 9.15 (limit 11.0)
- home-reach-beach s-end-wild-sea/camera: G8 0.889 (limit 0.2)
- home-reach-beach s-tideline-final/player: G4b 49.94 (limit 53.16)
- lamplit-strait s-lamplit-strait/camera: G8 0.946 (limit 0.2)
- lamplit-strait s-lamplit-strait/overview: G4a 37.034 (limit 33.302)
- pearl-banks s-pearl-banks/camera: G4b 47.71 (limit 48.46)
- pearl-banks s-pearl-banks/overview: G4b 29.31 (limit 30.96)
- pearl-banks s-pearl-banks/player: G4b 68.51 (limit 69.89)
- pearl-banks s-pearl-banks/player: G8 0.525 (limit 0.2)
- salt-steps s-salt-steps/overview: G4b 76.04 (limit 76.09)
- salt-steps s-salt-steps/player: G4b 93.86 (limit 106.86)
- spice-mouth s-spice-mouth/player: G4b 64.43 (limit 66.6)
- the-unwritten s-unwritten/camera: G6b 0.0674 (limit 0.068)
- the-unwritten s-unwritten/overview: G8 0.59 (limit 0.2)
- tidewater s-tidewater/camera: G4b 45.29 (limit 47.21)
- tidewater s-tidewater/player: G4b 64.51 (limit 67.35)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## P3 gates (outdoor and forest kit; before = the P1 and P2b render)

17 stills in 1 places. Gate checks: 331 passed, 0 failed, 26 not applicable.
G7 (detail gain) is counted as not applicable: it averages every dressed region, most of which P1 already dressed.


## P4 gates (rock, snow, frost and ice; before = the P1 to P3 render)

29 stills in 5 places. Gate checks: 540 passed, 32 failed, 34 not applicable.
G7 is listed but not meaningful for an incremental phase: it averages every dressed region, most unchanged since P1.

- home-reach-beach s-beach-princess/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-beach-princess/player: G7 1.0 (limit 2.0)
- home-reach-beach s-beach-tideline/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-beach-tideline/player: G7 1.0 (limit 2.0)
- home-reach-beach s-end-charter/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-end-lords-peace/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-end-lords-peace/player: G7 1.0 (limit 2.0)
- home-reach-beach s-end-no-lord/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-end-no-lord/player: G7 1.0 (limit 2.0)
- home-reach-beach s-end-paid-in-kind/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-end-paid-in-kind/player: G7 1.0 (limit 2.0)
- home-reach-beach s-end-wild-sea/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-home-tideline/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-home-tideline/player: G7 1.0 (limit 2.0)
- home-reach-beach s-tideline-final/camera: G7 1.0 (limit 2.0)
- home-reach-beach s-tideline-final/overview: G7 1.0 (limit 2.0)
- home-reach-beach s-tideline-final/player: G7 1.0 (limit 2.0)
- lamplit-strait s-lamplit-strait/camera: G7 1.04 (limit 2.0)
- lamplit-strait s-lamplit-strait/overview: G7 1.0 (limit 2.0)
- lamplit-strait s-lamplit-strait/player: G7 1.02 (limit 2.0)
- pearl-banks s-pearl-banks/camera: G7 1.02 (limit 2.0)
- pearl-banks s-pearl-banks/overview: G7 1.01 (limit 2.0)
- pearl-banks s-pearl-banks/player: G7 1.0 (limit 2.0)
- salt-steps s-salt-steps/camera: G7 1.09 (limit 1.992)
- salt-steps s-salt-steps/camera: G8 0.506 (limit 0.2)
- salt-steps s-salt-steps/overview: G7 1.03 (limit 2.0)
- salt-steps s-salt-steps/player: G7 1.13 (limit 1.99)
- salt-steps s-salt-steps/player: G8 0.547 (limit 0.2)
- the-unwritten s-unwritten/camera: G7 1.05 (limit 2.0)
- the-unwritten s-unwritten/overview: G4b 34.51 (limit 35.22)
- the-unwritten s-unwritten/overview: G7 1.16 (limit 2.0)
- the-unwritten s-unwritten/player: G7 1.1 (limit 2.0)

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2: no light shafts, falling snow, smoke or steam yet; flames only where the build has a fire piece. G7 is n/a in P2 and the P1 bar is 1.5 for clean painted, varnished, papered and fabric surfaces (ruling D1).
- Half-size look renders; the full-size pass is P7.

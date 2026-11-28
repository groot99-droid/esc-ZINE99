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

Gate checks: 1201 passed, 64 failed, 75 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G7 | detail gain | 26 |
| G8 | repeat pattern | 19 |
| G4a | dark area | 7 |
| G14 | seams | 5 |
| G4b | darkest pixels | 4 |
| G2 | tone | 2 |
| G6b | light/dark spread | 1 |

Every failing check (place, scene/still, gate, value, limit):

- boat-cabin s-cabin-dawn/camera: G7 1.77 (limit 2.0)
- boat-cabin s-cabin-dawn/camera: G8 0.877 (limit 0.2)
- boat-cabin s-cabin-dawn/overview: G4a 24.131 (limit 23.709)
- boat-cabin s-cabin-dawn/overview: G8 0.903 (limit 0.2)
- boat-cabin s-cabin-dawn/player: G4a 9.621 (limit 9.579)
- boat-cabin s-cabin-dawn/player: G7 1.5 (limit 2.0)
- boat-cabin s-cabin-princess/camera: G8 0.964 (limit 0.2)
- boat-cabin s-cabin-princess/player: G8 0.886 (limit 0.2)
- boat-cabin s-cabin-tally/camera: G4a 35.537 (limit 35.066)
- boat-cabin s-cabin-tally/player: G4a 34.131 (limit 32.784)
- boat-cabin s-cabin-tally/player: G7 1.9 (limit 2.0)
- boat-cabin s-cabin-tally/player: G8 0.784 (limit 0.2)
- boat-cabin s-chart-table/player: G4a 10.629 (limit 9.998)
- boat-cabin s-chart-table/player: G7 1.89 (limit 2.0)
- boat-cabin s-the-inventory/camera: G7 1.71 (limit 2.0)
- boat-cabin s-the-inventory/player: G7 1.71 (limit 2.0)
- boat-deck s-deck-dinghy/player: G8 0.565 (limit 0.2)
- chandlery s-chandlery/camera: G8 0.601 (limit 0.2)
- chandlery s-chandlery/overview: G8 0.951 (limit 0.2)
- chandlery s-chandlery/player: G4b 49.25 (limit 62.81)
- company-lane s-company-lane/camera: G7 1.02 (limit 2.0)
- company-lane s-company-lane/player: G7 1.08 (limit 2.0)
- counting-house s-counting-house/camera: G7 1.53 (limit 2.0)
- counting-house s-counting-house/camera: G14 0.06512926740100082 (limit 0.06)
- counting-house s-counting-house/overview: G6b 0.2 (limit 0.1729)
- counting-house s-counting-house/overview: G7 1.53 (limit 2.0)
- counting-house s-counting-house/overview: G14 0.06383278551422411 (limit 0.06)
- counting-house s-counting-house/player: G7 1.58 (limit 2.0)
- counting-house s-counting-house/player: G8 0.493 (limit 0.2)
- counting-house s-counting-house/player: G14 0.0881292425385839 (limit 0.06)
- counting-house s-the-cup/camera: G7 1.28 (limit 2.0)
- counting-house s-the-cup/camera: G8 0.483 (limit 0.2)
- counting-house s-the-cup/camera: G14 0.18868401024545844 (limit 0.06)
- counting-house s-the-cup/player: G7 1.1 (limit 2.0)
- counting-house s-the-cup/player: G14 0.2751141918894111 (limit 0.06)
- home-reach-beach s-end-charter/camera: G7 1.65 (limit 2.0)
- home-reach-beach s-end-no-lord/player: G8 0.319 (limit 0.2)
- kings-halls s-kings-halls/camera: G8 0.343 (limit 0.2)
- kings-halls s-kings-halls/overview: G7 1.59 (limit 2.0)
- kings-halls s-kings-halls/overview: G8 0.433 (limit 0.2)
- kings-halls s-kings-halls/player: G8 0.365 (limit 0.2)
- kings-halls s-second-collision/camera: G7 1.69 (limit 2.0)
- kings-halls s-second-collision/camera: G8 0.617 (limit 0.2)
- kings-halls s-second-collision/player: G7 1.68 (limit 2.0)
- kings-halls s-the-oars/camera: G8 0.587 (limit 0.2)
- kings-halls s-the-oars/player: G7 1.88 (limit 2.0)
- lamplit-strait s-lamplit-strait/camera: G4a 4.805 (limit 1.807)
- lamplit-strait s-lamplit-strait/camera: G7 1.68 (limit 2.0)
- lamplit-strait s-lamplit-strait/camera: G8 0.353 (limit 0.2)
- lamplit-strait s-lamplit-strait/overview: G2 0.2074 (limit 0.12)
- lamplit-strait s-lamplit-strait/overview: G8 0.25 (limit 0.2)
- lamplit-strait s-lamplit-strait/player: G2 0.121 (limit 0.12)
- lamplit-strait s-lamplit-strait/player: G4a 8.322 (limit 3.272)
- lamplit-strait s-lamplit-strait/player: G7 1.98 (limit 2.0)
- lamplit-strait s-lamplit-strait/player: G8 0.246 (limit 0.2)
- pearl-banks s-pearl-banks/camera: G7 1.09 (limit 2.0)
- pearl-banks s-pearl-banks/overview: G7 1.03 (limit 2.0)
- pearl-banks s-pearl-banks/player: G4b 70.94 (limit 71.82)
- pearl-banks s-pearl-banks/player: G7 1.05 (limit 2.0)
- salt-steps s-salt-steps/camera: G4b 75.03 (limit 86.03)
- salt-steps s-salt-steps/overview: G4b 78.09 (limit 78.16)
- salt-steps s-salt-steps/overview: G7 1.38 (limit 2.0)
- spice-mouth s-spice-mouth/overview: G7 1.28 (limit 2.0)
- tidewater s-tidewater/overview: G7 1.04 (limit 2.0)

## P2 gates (atmosphere and skies; before = the P1 render)

38 stills in 8 places, every gate per still against its own before.

Gate checks: 700 passed, 3 failed, 92 not applicable.

| Gate | What | Failed stills |
| --- | --- | ---: |
| G11 | hero-prop light | 2 |
| G4b | darkest pixels | 1 |

Every failing check (place, scene/still, gate, value, limit):

- boat-deck s-deck-dinghy/camera: G11 0.1762 (limit 0.08262)
- boat-deck s-deck-dinghy/player: G11 0.1237 (limit 0.08262)
- salt-steps s-salt-steps/player: G4b 101.14 (limit 106.86)

G7 (detail gain) is counted as not applicable in P2: the surfaces are the P1 ones in both renders. G9 misses are P1's own.

## Still weak

- Detail gain (G7) under 2x on clean painted, varnished and fabric surfaces; repeat-pattern (G8) misses listed above.
- Deferred materials (listed above) look as built until P3 to P5. Walls stay flat boxes (build-file work).
- P2 is a first cut: sky plates and faint outdoor haze only; no dust, shafts, rain, snow, flames or water yet.
- Half-size look renders; the full-size pass is P7.

// WrymWretch · Star Chart (1D, Gilded star atlas). DESIGN.md section 11, Star Chart.
// One page: s_chart_priory. Three constellations (the Stag, the Gale Harp, the First Light), their
// stars and fragments from data/star_chart.json. Drag star to star to lay a line (again to lift
// it); Name it checks every fragment and the line count. A wrong attempt dims one fragment for
// 10 s; after three on one constellation the strongest fragment is underlined. Seraphyne's Glimpse
// ghosts one correct line for 3 s, once. When all three are named, the lines move on their own
// into the Sigil of Izladar. The prototype adds a loss: six wrong attempts and dawn takes the sky.
// Refinements: the current constellation's stars are the ones the party remembers (ringed);
// Read a star (R, three a page) shows how many lines a star holds; after the Stag is named a cloud of
// forgetting drifts over the field and lifts any unnamed line it covers. After two losses in a row,
// dawn waits for eight wrong namings and five reads (api.store).
//
// Phase 1 (accepted 2026-11-15), "Stars become the route": each constellation gilded lights its realm's
// band, for good, in the descent down the chasm wall. The page shows the bands as it is played: a
// realm seal lights beside each gilded figure (flag stars_redrawn and the constellation's Record entry).
// Art (games/wrymwretch/art): atlas plate I under the field, with its answer layer stripped (the game's
// stars stand on the plate's own, by the data's coordinates); each figure's plate as it is gilded; the
// realm seals as the descent bands; the Sigil's plate and the Record behind the result; chapter card 6
// above the how-to. Without the plate the lapis, dust and graticule are drawn here, as before.
// Quoted, verbatim as DESIGN.md section 3 quotes them (creative-writing/vault/02_Novels/02_WrymWretch.md):
//   "The Sigil of Izladar." (WW 87)
//   "The prison weakens," she said. "The cosmos trembles. The Remnants move in shadow." (WW 91)
//   "And the name?" "Already fading." (WW 93–95)

import { png, opening } from "./_art.js";
import { staged } from "./_stages.js";

// Phase 2 (accepted 2026-11-15, built 2026-11-16): the ladder, one atlas plate a stage.
//   I   Teach, plate I, the Priory (s_chart_priory): fragments as constraints. As above.
//   II  Test, plate II, the sky-watch (s_chart_moot): false stars flicker among the true ones. The lying
//       strip (new): one fragment on the plate is in a Remnant hand (upright, on cold paper). A figure
//       named to it gilds black, lights a false band in the descent, and has to be unpicked.
//       The Second Reader (scene 7): the Scholar's Lamp has lost its last star. Before any strip says
//       where it goes, a line draws itself to the place, in Seraphyne's hand. Kael sees it.
//   III Twist, plate III, the Expanse (s_chart_expanse): the rule turns over. Until now you laid lines;
//       here the Sigil is already drawn and has to be lifted, line by line, to find the figure beneath.
//       Each line lifted gives the voice back part of what it says. The man beneath is one star short:
//       it is the star Seraphyne placed.
// Stars become the route (layer link 2): each figure gilded writes its realm to api.shared ("stars":
// gold or black), and the Ghost-fire descent (Twin flight III) lights that band, or a false one.
const LADDER = [
  { name: "The Priory sky", sub: "Fragments as constraints." },
  { name: "The sky-watch", sub: "False stars, and a strip in another hand." },
  { name: "The Sigil, lifted", sub: "Undo a figure to find the one beneath." },
];
const PLATE2 = {
  figs: [
    { id: "moons_tear", name: "The Moon's Tear", realm: "east", band: "the Tidecallers'",
      stars: [["mt1", 25, 40, 3], ["mt2", 33.7, 35, 3], ["mt3", 33.7, 25, 3], ["mt4", 25, 20, 1], ["mt5", 16.3, 25, 3], ["mt6", 16.3, 35, 3], ["mt7", 25, 12, 3]],
      lines: [["mt1", "mt2"], ["mt2", "mt3"], ["mt3", "mt4"], ["mt4", "mt5"], ["mt5", "mt6"], ["mt6", "mt1"], ["mt4", "mt7"]],
      fragments: ["The Tear is a ring of six", "One star falls from the ring's lowest point, and holds nothing else", "Seven lines, and none crosses another"] },
    { id: "delvers_lamp", name: "The Delver's Lamp", realm: "south", band: "Mosswhisper's",
      stars: [["dl1", 75, 55, 3], ["dl2", 75, 48, 3], ["dl3", 75, 41, 1], ["dl4", 68, 32, 3], ["dl5", 82, 32, 3], ["dl6", 75, 23, 3], ["dl7", 71, 15, 3], ["dl8", 79, 15, 3]],
      lines: [["dl1", "dl2"], ["dl2", "dl3"], ["dl3", "dl4"], ["dl3", "dl5"], ["dl4", "dl6"], ["dl5", "dl6"], ["dl6", "dl7"], ["dl6", "dl8"]],
      fragments: ["The Lamp's brightest star touches three others", "It hangs from a chain of three stars, straight down", "Its lowest corner holds four lines; eight in all"],
      lie: "Its lowest corner holds two lines, and nothing hangs beneath; six in all", lieLines: [["dl1", "dl2"], ["dl2", "dl3"], ["dl3", "dl4"], ["dl3", "dl5"], ["dl4", "dl6"], ["dl5", "dl6"]] },
    { id: "scholars_lamp", name: "The Scholar's Lamp", realm: "above", band: "",
      stars: [["sl1", 56, 90, 3], ["sl2", 61, 86, 3], ["sl3", 66, 82, 3], ["sl4", 71, 78, 3], ["sl5", 80, 80, 3], ["sl6", 82, 70, 1], ["sl7", 72, 68, 3], ["sl8", 88, 62, 3], ["sl9", 94, 55, 3]],
      lines: [["sl1", "sl2"], ["sl2", "sl3"], ["sl3", "sl4"], ["sl4", "sl5"], ["sl5", "sl6"], ["sl6", "sl7"], ["sl7", "sl4"], ["sl6", "sl8"], ["sl8", "sl9"]],
      fragments: ["Its handle is four stars, falling to the right", "Its body is a ring of four, closed at the handle's end", "Its light runs down and to the right through two stars from the body's brightest; the last is lost"],
      hidden: "sl9", second: ["sl8", "sl9"] },
  ],
  other: [["false1", 59.8, 9.1, 4, 1], ["false2", 14.6, 58.2, 4, 1], ["false3", 87.1, 22.8, 4, 1], ["false4", 76.4, 5.7, 4, 1], ["dim1", 5.7, 66.2, 4], ["dim2", 39.2, 6.3, 4]],
};
const JOINT = { sc1: "Head", sc2: "Throat", sc3: "Left Shoulder", sc4: "Right Shoulder", sc5: "Left Hand", sc6: "Right Hand", sc7: "Waist", sc8: "Left Knee", sc9: "Right Knee", sc10: "Left Foot", sc11: "Right Foot", sc12: "Book" };
const PLATE3 = {
  figs: [
    { id: "the_scholar", name: "The Scholar", realm: "above", band: "",
      stars: [["sc1", 50, 85, 1], ["sc2", 50, 75, 3], ["sc3", 40, 72, 3], ["sc4", 60, 72, 3], ["sc5", 32, 58, 3], ["sc6", 68, 58, 3], ["sc7", 50, 52, 3], ["sc8", 44, 35, 3], ["sc9", 56, 35, 3], ["sc10", 42, 18, 3], ["sc11", 58, 18, 3], ["sc12", 76, 52, 3]],
      lines: [["sc1", "sc2"], ["sc2", "sc3"], ["sc2", "sc4"], ["sc3", "sc5"], ["sc4", "sc6"], ["sc2", "sc7"], ["sc7", "sc8"], ["sc7", "sc9"], ["sc8", "sc10"], ["sc9", "sc11"], ["sc6", "sc12"]],
      fragments: ["The Head to the Throat; the Left Shoulder to the Left Hand; the Throat to the Waist; the Waist to the Left Knee; the Right Knee to the Right Foot",
        "The Head to the Throat; the Throat to the Left Shoulder; the Right Shoulder to the Right Hand; the Waist to the Left Knee; the Waist to the Right Knee; the Right Hand to the Book",
        "The Throat to the Left Shoulder; the Throat to the Right Shoulder; the Throat to the Waist; the Waist to the Right Knee; the Left Knee to the Left Foot"],
      lie: "The Head to the Left Hand; the Head to the Right Hand; the Left Hand to the Right Hand", lieAny: [["sc1", "sc5"], ["sc1", "sc6"], ["sc5", "sc6"]], hidden: "sc12", labels: true },
  ],
  other: [["false1", 39.1, 86.6, 4, 1], ["false2", 25.7, 35.8, 4, 1], ["false3", 27.8, 6.7, 4, 1], ["false4", 47.8, 92.1, 4, 1], ["false6", 90.5, 33.9, 4, 1], ["dim1", 15.4, 46.7, 4], ["dim2", 78, 86.1, 4], ["dim4", 88.9, 72.4, 4], ["dim5", 17.1, 60.4, 4], ["dim6", 70, 84.7, 4]],
  sigil: [["sc1", "sc5"], ["sc1", "sc6"], ["sc5", "sc10"], ["sc6", "sc11"], ["sc10", "sc11"], ["sc3", "sc4"], ["sc5", "sc6"]],
};
const VOICE = "I… remember… me…";   // WW 101, as DESIGN.md section 21 quotes it

const LAPIS = "#1d2f6e", DEEP = "#070c24", GOLD = "#e3b74a", GOLDHI = "#fff2b0", PAPER = "#efe2c4", INKBROWN = "#3b2a14";

const CONST1 = [
  { id: "stag", name: "The Stag", realm: "west", band: "Cedarheart's",
    stars: [["st1", 30, 40, 1], ["st2", 26, 48, 3], ["st3", 22, 55, 3], ["st4", 17, 63, 3], ["st5", 12, 70, 3], ["st6", 35, 33, 3], ["st7", 42, 26, 3]],
    lines: [["st1", "st2"], ["st2", "st3"], ["st3", "st4"], ["st4", "st5"], ["st1", "st6"], ["st6", "st7"]],
    fragments: ["The Stag's antlers are five stars climbing to the left", "From the root of the antlers, two stars run down and to the right"] },
  { id: "gale_harp", name: "The Gale Harp", realm: "north", band: "Galewing's",
    stars: [["gh1", 50, 85, 1], ["gh2", 60.2, 80.1, 3], ["gh3", 62.7, 69.1, 3], ["gh4", 55.6, 60.3, 3], ["gh5", 44.4, 60.3, 3], ["gh6", 37.3, 69.1, 3], ["gh7", 39.8, 80.1, 3]],
    lines: [["gh1", "gh2"], ["gh2", "gh3"], ["gh3", "gh4"], ["gh4", "gh5"], ["gh5", "gh6"], ["gh6", "gh7"], ["gh7", "gh1"]],
    fragments: ["No line of the Harp crosses another", "The Harp is one frame: every star of it holds two lines", "Seven strings, no more"] },
  { id: "first_light", name: "The First Light", realm: "above", band: "the High Realm's",
    stars: [["fl1", 78, 40, 1], ["fl2", 72, 48, 3], ["fl3", 84, 48, 3], ["fl4", 70, 33, 3], ["fl5", 86, 33, 3], ["fl6", 78, 53, 3]],
    lines: [["fl1", "fl2"], ["fl1", "fl3"], ["fl1", "fl4"], ["fl1", "fl5"], ["fl1", "fl6"]],
    fragments: ["The First Light's brightest star touches all the others", "Nothing joins the outer lights to one another"] },
];
const DIM1 = [["dim1", 74, 26.2, 4], ["dim2", 24.9, 65.2, 4], ["dim3", 62.9, 25.7, 4], ["dim4", 10, 83.4, 4], ["dim5", 7.9, 41, 4], ["dim6", 28.4, 10.2, 4]];
const SIGIL = [["st5", "gh6"], ["gh6", "gh3"], ["gh3", "fl6"], ["fl6", "fl1"], ["fl1", "st7"], ["st7", "st5"], ["gh1", "st1"]];
const READS = 3;

const CSS = `
.wrymwretch-star-chart-root{position:absolute;inset:0;display:flex;background:radial-gradient(ellipse at 40% 45%,${LAPIS} 0%,#16255a 55%,${DEEP} 100%);color:${GOLD};font-family:'Cormorant Garamond',Georgia,serif;overflow:auto}
.wrymwretch-star-chart-page{flex:1;display:flex;gap:14px;padding:12px;min-height:100%;box-sizing:border-box;border:3px double ${GOLD};margin:8px;border-radius:2px}
.wrymwretch-star-chart-field{flex:2 1 0;min-width:0;display:flex;flex-direction:column}
.wrymwretch-star-chart-name{font:700 clamp(22px,4vw,40px) 'Cinzel',Georgia,serif;letter-spacing:.32em;margin:4px 6px 6px;white-space:nowrap;overflow:hidden}
.wrymwretch-star-chart-name span{color:rgba(227,183,74,.4);transition:color .6s}
.wrymwretch-star-chart-name span.lit{color:${GOLD};text-shadow:0 0 10px rgba(255,242,176,.45)}
.wrymwretch-star-chart-field svg{flex:1;width:100%;min-height:260px;touch-action:none;display:block}
.wrymwretch-star-chart-star{cursor:pointer;outline:none}
.wrymwretch-star-chart-star:focus-visible .wrymwretch-star-chart-ring{stroke:${GOLDHI};stroke-width:.5}
.wrymwretch-star-chart-side{flex:1 1 0;min-width:230px;max-width:380px;display:flex;flex-direction:column;gap:12px;padding-top:6px}
.wrymwretch-star-chart-strip{background:${PAPER};color:${INKBROWN};font-style:italic;font-size:17px;line-height:1.3;padding:14px 16px 16px;clip-path:polygon(0 6%,4% 0,12% 5%,22% 1%,35% 6%,48% 0,61% 4%,73% 0,86% 5%,100% 1%,98% 52%,100% 96%,88% 100%,76% 95%,62% 100%,49% 94%,35% 100%,22% 95%,9% 100%,0 94%,2% 48%);transition:opacity .4s,filter .4s;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.wrymwretch-star-chart-strip.dim{opacity:.33;filter:grayscale(1)}
.wrymwretch-star-chart-strip.lie{font-style:normal;font-family:Georgia,serif;font-size:15.5px;letter-spacing:.01em;background:#d9dee2;color:#23262b;clip-path:none;border-left:3px solid #6f7780}
.wrymwretch-star-chart-strip.long{font-size:15px;line-height:1.25;padding:10px 14px 12px}
.wrymwretch-star-chart-false{animation:wrymwretch-star-chart-flick 2s steps(1) infinite}
@keyframes wrymwretch-star-chart-flick{0%{opacity:.95}50%{opacity:.18}}
.wrymwretch-star-chart-band.black .fig{border:1px solid #8E97A3;background:#05060c}
.wrymwretch-star-chart-band.black{color:#aab2bd}
.wrymwretch-star-chart-band.black .seal{opacity:1;box-shadow:0 0 10px rgba(164,42,28,.8)}
.wrymwretch-star-chart-strip.strong{text-decoration:underline;text-decoration-color:#a42a1c;text-underline-offset:3px}
.wrymwretch-star-chart-note{font-size:16px;color:#f0d690;min-height:1.3em;line-height:1.3}
.wrymwretch-star-chart-beat{background:rgba(7,12,36,.78);border:1px solid ${GOLD};border-left:5px solid ${GOLD};padding:10px 14px;font-size:17px;line-height:1.35;color:#f6e7bd;opacity:0;transition:opacity .5s;min-height:0}
.wrymwretch-star-chart-beat.on{opacity:1}
.wrymwretch-star-chart-beat q{font-style:italic}
.wrymwretch-star-chart-beat cite{display:block;font:600 13px 'Cinzel',Georgia,serif;font-style:normal;letter-spacing:.12em;color:${GOLD};margin-top:4px}
.wrymwretch-star-chart-field.bad svg{animation:wrymwretch-star-chart-shake .4s}
@keyframes wrymwretch-star-chart-shake{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.wrymwretch-star-chart-gild{stroke-dasharray:60;stroke-dashoffset:60;animation:wrymwretch-star-chart-gild 1.1s ease-out forwards}
@keyframes wrymwretch-star-chart-gild{to{stroke-dashoffset:0}}
.wrymwretch-star-chart-star:hover .wrymwretch-star-chart-ring{stroke:rgba(255,242,176,.7)}
.wrymwretch-star-chart-btn.on{background:${GOLD};color:${DEEP}}
.wrymwretch-star-chart-row{display:flex;flex-wrap:wrap;gap:8px}
.wrymwretch-star-chart-btn{font:700 14px 'Cinzel',Georgia,serif;letter-spacing:.14em;color:${GOLD};background:rgba(7,12,36,.5);border:1.5px solid ${GOLD};padding:9px 14px;cursor:pointer;min-height:42px}
.wrymwretch-star-chart-btn:hover:not(:disabled){background:rgba(227,183,74,.18)}
.wrymwretch-star-chart-btn:disabled{opacity:.35;cursor:default}
.wrymwretch-star-chart-dawn{font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:#f0d690}
.wrymwretch-star-chart-count{font-size:15px;color:#f0d690}
.wrymwretch-star-chart-dawn b{display:inline-block;margin-left:3px;color:${GOLD}}
.wrymwretch-star-chart-dawn b.out{color:rgba(227,183,74,.2)}
.wrymwretch-star-chart-bands{display:flex;gap:8px;align-items:flex-start}
.wrymwretch-star-chart-band{flex:1 1 0;min-width:0;text-align:center;font:700 11px 'Cinzel',Georgia,serif;letter-spacing:.08em;color:rgba(227,183,74,.5);line-height:1.25}
.wrymwretch-star-chart-band .fig{aspect-ratio:1;border:1px dashed rgba(227,183,74,.4);display:grid;place-items:center;font-size:22px;position:relative;background:rgba(7,12,36,.4)}
.wrymwretch-star-chart-band .fig img{width:100%;height:100%;display:block}
.wrymwretch-star-chart-band .seal{width:34px;height:34px;margin:-17px auto 2px;position:relative;display:block;border-radius:50%;background:${DEEP};border:1px solid rgba(227,183,74,.4);opacity:.5}
.wrymwretch-star-chart-band .seal img{width:100%;height:100%;display:block;filter:grayscale(1) brightness(.6)}
.wrymwretch-star-chart-band.lit{color:${GOLDHI}}
.wrymwretch-star-chart-band.lit .fig{border:1px solid ${GOLD}}
.wrymwretch-star-chart-band.lit .seal{opacity:1;box-shadow:0 0 12px rgba(255,242,176,.7)}
.wrymwretch-star-chart-band.lit .seal img{filter:none}
.wrymwretch-star-chart-bandh{font-size:14px;color:#d8c48f;margin:-4px 0 0;font-style:italic}
.wrymwretch-star-chart-intro{overflow:auto;position:absolute;inset:0;display:grid;place-items:center;background:rgba(7,12,36,.72);padding:16px;z-index:3}
.wrymwretch-star-chart-card{max-width:430px;width:100%;box-sizing:border-box;background:radial-gradient(ellipse at 50% 0%,#2a3f86,${LAPIS} 60%,#12204f);color:#f6e7bd;padding:20px 24px 22px;font-size:16px;line-height:1.4;border:4px double ${GOLD};box-shadow:0 0 0 6px ${DEEP},0 0 0 7px rgba(227,183,74,.5);position:relative}
.wrymwretch-star-chart-card .plate{font:600 13px 'Cinzel',Georgia,serif;letter-spacing:.3em;color:${GOLD};text-align:center}
.wrymwretch-star-chart-card h2{font:700 26px 'Cinzel',Georgia,serif;letter-spacing:.14em;margin:2px 0 4px;text-align:center;color:${GOLDHI};text-shadow:0 0 12px rgba(227,183,74,.5)}
.wrymwretch-star-chart-card .goal{font-style:italic;font-size:18px;text-align:center;margin:0 0 14px}
.wrymwretch-star-chart-card dl{display:grid;grid-template-columns:auto 1fr;gap:8px 12px;margin:0 0 14px;padding:12px 0;border-top:1px solid rgba(227,183,74,.45);border-bottom:1px solid rgba(227,183,74,.45)}
.wrymwretch-star-chart-card dt{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.08em;color:${GOLD};white-space:nowrap;padding-top:2px}
.wrymwretch-star-chart-card dd{margin:0}
.wrymwretch-star-chart-card .more{font-size:15px;color:#d8c48f;margin:0 0 14px}
.wrymwretch-star-chart-card button{display:block;margin:0 auto;font:700 15px 'Cinzel',Georgia,serif;letter-spacing:.14em;padding:10px 26px;min-height:44px;background:${GOLD};color:${DEEP};border:0;cursor:pointer}
.wrymwretch-star-chart-card button:hover{background:${GOLDHI}}
@media (max-width:720px){.wrymwretch-star-chart-page{flex-direction:column}.wrymwretch-star-chart-side{max-width:none}.wrymwretch-star-chart-field svg{min-height:300px}}
`;

const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

function play(root, api, ctx) {
    const ST = ctx.stage, PLATE = [{ figs: CONST1, other: DIM1 }, PLATE2, PLATE3][ST], CONST = PLATE.figs, DIM = PLATE.other;
    const BANDED = CONST.filter((c) => c.band);
    const PAGE = [{ t: "Star Chart I: the Priory sky", s: "High Realm page · chapter 6, The Sigil" }, { t: "Star Chart II: the sky-watch", s: "The Rim Moot · chapter 8" }, { t: "Star Chart III: the Sigil, lifted", s: "The Astral Expanse · chapter 11" }][ST];
    const getStars = () => { try { return (api.shared && api.shared.get("stars", null)) || {}; } catch { return {}; } };
    const setStar = (realm, v) => { try { const o = getStars(); if (v) o[realm] = v; else delete o[realm]; api.shared.set("stars", o); } catch { /* no storage */ } };
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    const DAWN = gentle ? 8 : 6;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-star-chart-root";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="wrymwretch-star-chart-page">
        <div class="wrymwretch-star-chart-field"><div class="wrymwretch-star-chart-name" aria-live="polite"></div>
          <svg viewBox="-2 -2 104 104" preserveAspectRatio="xMidYMid meet" role="application" aria-label="Star field"></svg></div>
        <div class="wrymwretch-star-chart-side">
          <div data-frags style="display:flex;flex-direction:column;gap:12px"></div>
          <div class="wrymwretch-star-chart-count"></div>
          <div class="wrymwretch-star-chart-bands" aria-label="The descent's bands">${BANDED.map((c) => `<div class="wrymwretch-star-chart-band" data-band="${c.id}"><div class="fig">?</div><span class="seal"></span>${c.realm === "above" ? "ABOVE" : c.realm.toUpperCase()} BAND</div>`).join("")}</div>
          <p class="wrymwretch-star-chart-bandh"${BANDED.length ? "" : " hidden"}>A figure gilded here lights its realm's band on the way down the chasm.</p>
          <div class="wrymwretch-star-chart-note" aria-live="polite"></div>
          <div class="wrymwretch-star-chart-row">
            <button type="button" class="wrymwretch-star-chart-btn" data-name>Name it</button>
            <button type="button" class="wrymwretch-star-chart-btn" data-unpick hidden>Unpick the black</button>
            <button type="button" class="wrymwretch-star-chart-btn" data-read>Read a star</button>
            <button type="button" class="wrymwretch-star-chart-btn" data-glimpse>${ctx.second ? "Her Glimpse" : "Glimpse"}</button>
            <button type="button" class="wrymwretch-star-chart-btn" data-clear>Clear</button>
          </div>
          <div class="wrymwretch-star-chart-beat" aria-live="polite"></div>
          <div class="wrymwretch-star-chart-dawn"></div>
        </div>
      </div>
      <div class="wrymwretch-star-chart-intro"><div class="wrymwretch-star-chart-card">
        <div class="plate">${["PLATE I · THE PRIORY", "PLATE II · THE SKY-WATCH", "PLATE III · THE EXPANSE"][ST]}</div>
        <h2>Star Chart</h2>
        <div data-tabs></div>
        ${[`<p class="goal">Redraw the three constellations the sky has lost, before dawn.</p>
        <dl>
          <dt>Drag star → star</dt><dd>lay a line (or tap one star, then another); again to lift it</dd>
          <dt>Torn strips</dt><dd>what the party remembers: every one must hold</dd>
          <dt>Name it</dt><dd>checks the figure. Each wrong naming brings dawn closer</dd>
        </dl>
        <p class="more">${gentle ? "Dawn is slower tonight: eight wrong namings, five reads. " : ""}More of Seraphyne's craft opens as you work.</p>`,
        `<p class="goal">Redraw three more, at the Moot's sky-watch, where not everything on the glass is true.</p>
        <dl>
          <dt>False stars</dt><dd>they flicker. No line of any figure touches one</dd>
          <dt>The lying strip</dt><dd>new: one strip on this plate is in another hand, upright, on cold paper. A figure named to it gilds black</dd>
          <dt>Black gilt</dt><dd>lights a false band in the descent. Unpick it, and lay the figure true</dd>
        </dl>
        <p class="more">${gentle ? "Dawn is slower tonight. " : ""}The last figure has lost a star. Lay what you can of it.</p>`,
        `<p class="goal">The Sigil is already drawn. Find who is under it.</p>
        <dl>
          <dt>Lift</dt><dd>turned over: drag along a silver line of the Sigil (or tap its two stars) to lift it. All seven</dd>
          <dt>Lay</dt><dd>then the figure beneath, by the strips that name its joints</dd>
          <dt>The lying strip</dt><dd>one strip is in the Remnant hand here too</dd>
        </dl>
        <p class="more">${gentle ? "Dawn is slower tonight. " : ""}Each line you lift gives something back to the voice.</p>`][ST]}
        <button type="button" data-start>Begin</button></div></div>`;
    root.appendChild(wrap);
    const beatEl = wrap.querySelector(".wrymwretch-star-chart-beat"), countEl = wrap.querySelector(".wrymwretch-star-chart-count");
    const fieldEl = wrap.querySelector(".wrymwretch-star-chart-field"), readBtn = wrap.querySelector("[data-read]");
    const svg = wrap.querySelector("svg"), nameEl = wrap.querySelector(".wrymwretch-star-chart-name");
    const fragsEl = wrap.querySelector("[data-frags]"), noteEl = wrap.querySelector(".wrymwretch-star-chart-note");
    const dawnEl = wrap.querySelector(".wrymwretch-star-chart-dawn");
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    const art = api.art;
    let dead = false;
    const stars = {};
    CONST.forEach((c) => c.stars.forEach(([id, x, y, m]) => (stars[id] = { id, x, y: 100 - y, m, c: c.id, hidden: c.hidden === id })));
    DIM.forEach(([id, x, y, m, f]) => (stars[id] = { id, x, y: 100 - y, m, c: null, false: !!f }));

    const st = { reads: gentle ? 5 : READS, reading: false, readT: new Map(), cloud: null, started: false, ci: 0, lines: new Set(), solved: new Set(), wrong: 0, wrongHere: 0, glimpse: true, sel: null, over: false, dim: new Map(), black: null, blackLines: new Set(), sigil: new Set(ST === 2 ? PLATE.sigil.map(([a, b]) => key(a, b)) : []), lifted: 0, second: false, self: new Set() };

    // ---- the page: lapis, gold dust, graticule ------------------------------------------------
    const defs = mk("defs", {}, svg);
    defs.innerHTML = `<radialGradient id="wwsc-glow"><stop offset="0" stop-color="${GOLDHI}" stop-opacity=".9"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
      <linearGradient id="wwsc-leaf" gradientUnits="userSpaceOnUse" spreadMethod="reflect" x1="0" y1="0" x2="9" y2="13"><stop offset="0" stop-color="#fff2b0"/><stop offset=".35" stop-color="#e3b74a"/><stop offset=".6" stop-color="#a87618"/><stop offset="1" stop-color="#f3d27a"/></linearGradient>`;
    mk("clipPath", { id: "wwsc-clip" }, defs).innerHTML = '<rect x="-1.5" y="-1.5" width="103" height="103"/>';
    const base = mk("g", { "clip-path": "url(#wwsc-clip)" }, svg);
    const r = api.rng(85);
    for (let i = 0; i < 260; i++) mk("circle", { cx: (r() * 104 - 2).toFixed(2), cy: (r() * 104 - 2).toFixed(2), r: (0.08 + r() * 0.22).toFixed(2), fill: GOLD, opacity: (0.2 + r() * 0.5).toFixed(2) }, base);
    for (let k = 0; k < 4; k++) mk("circle", { cx: 30, cy: 150, r: 70 + k * 18, fill: "none", stroke: GOLD, "stroke-width": 0.15, opacity: 0.45 }, base);
    for (let k = 0; k < 7; k++) mk("line", { x1: 30, y1: 150, x2: -20 + k * 24, y2: -2, stroke: GOLD, "stroke-width": 0.12, opacity: 0.35 }, base);
    mk("rect", { x: -1.5, y: -1.5, width: 103, height: 103, fill: "none", stroke: GOLD, "stroke-width": 0.4 }, base);
    // Atlas plate I under the field. The plate maps a star at (x, y) to (115 + 9.7x, 1100 - 9.3y) of 1200.
    png(art, ["chart-plate-priory", "chart-plate-moot", "chart-plate-expanse"][ST], { w: 1000, strip: [".answer"], jpeg: true }).then((u) => {
      if (!u || dead) return;
      [...base.children].forEach((n) => n.setAttribute("display", "none"));
      base.removeAttribute("clip-path");
      const [ox, kx, oy, ky] = ST === 2 ? [140, 9.2, 160, 9.6] : [115, 9.7, 170, 9.3];   // plate III is drawn on its own grid
      mk("image", { href: u, x: -ox / kx, y: -oy / ky, width: 1200 / kx, height: 1200 / ky, preserveAspectRatio: "none", "pointer-events": "none" }, base);
      svg.setAttribute("viewBox", `${(-ox / kx).toFixed(2)} ${(-oy / ky).toFixed(2)} ${(1200 / kx).toFixed(2)} ${(1200 / ky).toFixed(2)}`);
    });
    BANDED.forEach((c) => png(art, "ui-seal-" + c.realm, { w: 68, strip: [".plate"] }).then((u) => { if (!u || dead) return; const el = wrap.querySelector(`[data-band="${c.id}"] .seal`); if (el) el.innerHTML = `<img alt="" src="${u}">`; }));
    function lightBand(c) {
      const el = wrap.querySelector(`[data-band="${c.id}"]`); if (!el) return;
      el.classList.remove("black"); el.classList.add("lit"); el.querySelector(".fig").textContent = "✦";
      png(art, "chart-figure-" + c.id.replace(/_/g, "-"), { w: 160 }).then((u) => { if (u && !dead) el.querySelector(".fig").innerHTML = `<img alt="${c.name}, gilded" src="${u}">`; });
    }
    const gLines = mk("g", {}, svg), gGhost = mk("g", {}, svg), gTemp = mk("g", {}, svg), gStars = mk("g", {}, svg);
    const temp = mk("line", { stroke: GOLDHI, "stroke-width": 0.35, "stroke-dasharray": "1 1", opacity: 0 }, gTemp);

    for (const s of Object.values(stars)) {
      const g = mk("g", { class: "wrymwretch-star-chart-star", tabindex: 0, role: "button", "aria-label": `star ${s.id}`, "data-id": s.id }, gStars);
      const rad = s.m === 1 ? 1.25 : s.m === 3 ? 0.85 : 0.6;
      mk("circle", { cx: s.x, cy: s.y, r: 3.4, fill: "transparent" }, g);
      mk("circle", { cx: s.x, cy: s.y, r: rad * 2.6, fill: "url(#wwsc-glow)" }, g);
      s.ring = mk("circle", { class: "wrymwretch-star-chart-ring", cx: s.x, cy: s.y, r: rad + 0.9, fill: "none", stroke: "transparent", "stroke-width": 0.3 }, g);
      mk("path", { d: `M${s.x},${s.y - rad * 1.8} L${s.x + rad * 0.4},${s.y - rad * 0.4} L${s.x + rad * 1.8},${s.y} L${s.x + rad * 0.4},${s.y + rad * 0.4} L${s.x},${s.y + rad * 1.8} L${s.x - rad * 0.4},${s.y + rad * 0.4} L${s.x - rad * 1.8},${s.y} L${s.x - rad * 0.4},${s.y - rad * 0.4}Z`, fill: GOLDHI }, g);
      s.core = g.lastChild;
      s.pips = mk("text", { x: s.x + 2.2, y: s.y - 2, "font-size": 3.2, fill: GOLDHI, "font-family": "Cinzel, Georgia, serif", "font-weight": 700, "pointer-events": "none" }, g);
      s.el = g;
      if (s.hidden) g.setAttribute("display", "none");
      if (s.false && !api.reducedMotion) { g.setAttribute("class", "wrymwretch-star-chart-star wrymwretch-star-chart-false"); g.style.animationDelay = (-(s.x * 37 % 20) / 10).toFixed(1) + "s"; }
      if (JOINT[s.id] && CONST[0].labels) { const right = s.x >= 50; s.lab = mk("text", { x: s.x + (right ? 2.4 : -2.4), y: s.y + 4.2, "text-anchor": right ? "start" : "end", "font-size": 2.7, fill: "#f6e7bd", "font-family": "Cinzel, Georgia, serif", "font-weight": 700, "pointer-events": "none", opacity: 0, style: "paint-order:stroke;stroke:rgba(7,12,36,.85);stroke-width:.7px" }, g); s.lab.textContent = JOINT[s.id].toUpperCase(); }
    }
    const gCloud = mk("g", { "pointer-events": "none" }, svg);

    // ---- state rendering ----------------------------------------------------------------------
    const cur = () => CONST[st.ci];
    const solKeys = (c) => new Set(c.lines.map(([a, b]) => key(a, b)));
    function drawLines() {
      gLines.innerHTML = "";
      const sol = st.ci < CONST.length ? solKeys(cur()) : new Set();
      for (const k of st.solved) { const [a, b] = k.split("|"); const l = mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: "url(#wwsc-leaf)", "stroke-width": 0.9, "stroke-linecap": "round", pathLength: 60 }, gLines); if (st.fresh && st.fresh.has(k) && !api.reducedMotion) l.setAttribute("class", "wrymwretch-star-chart-gild"); }
      for (const k of st.sigil) { const [a, b] = k.split("|"); mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: "#d6dbe8", "stroke-width": 0.8, "stroke-linecap": "round", opacity: 0.95 }, gLines); }
      for (const k of st.blackLines) { const [a, b] = k.split("|"); mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: "#8E97A3", "stroke-width": 1.3, "stroke-linecap": "round" }, gLines); mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: "#05060c", "stroke-width": 0.9, "stroke-linecap": "round" }, gLines); }
      for (const k of st.self) if (st.lines.has(k)) { const [a, b] = k.split("|"); mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: "#d6dbe8", "stroke-width": 1, "stroke-dasharray": "0.5 1", "stroke-linecap": "round" }, gLines); }
      for (const k of st.lines) { const [a, b] = k.split("|"); mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: GOLDHI, "stroke-width": 0.4, "stroke-dasharray": sol.has(k) ? "none" : "none", opacity: 0.85 }, gLines); }
      const cid = st.ci < CONST.length ? cur().id : null;
      Object.values(stars).forEach((s) => {
        const mine = s.c === cid;
        s.ring.setAttribute("stroke", st.sel === s.id ? GOLDHI : mine ? "rgba(227,183,74,.55)" : "transparent");
        s.ring.setAttribute("stroke-width", st.sel === s.id ? 0.55 : 0.25);
        s.el.setAttribute("opacity", !cid || mine || st.solved.size && [...st.solved].some((k) => k.split("|").includes(s.id)) ? 1 : 0.42);
        s.pips.textContent = st.readT.has(s.id) ? "•".repeat(st.readT.get(s.id)) : "";
        if (s.lab) s.lab.setAttribute("opacity", st.sigil.size ? 0 : 0.9);
      });
      if (ST === 2 && st.sigil.size && !st.over) {   // the voice, coming back as the Sigil is lifted
        const n = Math.round((st.lifted / PLATE.sigil.length) * VOICE.replace(/[ …]/g, "").length); let i = 0;
        nameEl.innerHTML = ""; for (const ch of VOICE) { const sp = document.createElement("span"); sp.textContent = ch; if (!/[ …]/.test(ch)) { if (i < n) sp.className = "lit"; i++; } else if (i <= n && i > 0) sp.className = "lit"; nameEl.appendChild(sp); }
        countEl.textContent = `${st.sigil.size} of ${PLATE.sigil.length} lines of the Sigil still lie over him`;
        return;
      }
      if (st.ci < CONST.length) countEl.textContent = `${st.lines.size} line${st.lines.size === 1 ? "" : "s"} laid · the remembered stars are ringed`;
      // the name fills in as correct lines are laid
      if (st.ci < CONST.length) {
        let good = 0; for (const k of st.lines) if (sol.has(k)) good++;
        const bad = st.lines.size - good;
        const ratio = Math.max(0, (good - bad) / sol.size);
        const name = cur().name.toUpperCase();
        const n = Math.round(ratio * name.replace(/ /g, "").length);
        let i = 0;
        nameEl.innerHTML = "";
        for (const ch of name) { const sp = document.createElement("span"); sp.textContent = ch; if (ch !== " ") { if (i < n) sp.className = "lit"; i++; } nameEl.appendChild(sp); }
      }
    }
    function drawFrags() {
      fragsEl.innerHTML = "";
      if (st.ci >= CONST.length) return;
      if (ST === 2 && st.sigil.size) { const d = document.createElement("div"); d.className = "wrymwretch-star-chart-strip"; d.textContent = "The Sigil was laid over someone. Lift it, line by line."; fragsEl.appendChild(d); return; }
      const list = cur().fragments.map((t, i) => ({ t, i }));
      if (cur().lie) list.splice(cur().id === "the_scholar" ? 2 : 1, 0, { t: cur().lie, lie: true });
      list.forEach(({ t, i, lie }) => {
        const d = document.createElement("div");
        d.className = "wrymwretch-star-chart-strip" + (lie ? " lie" : "") + (cur().labels ? " long" : "") + (!lie && st.dim.has(i) ? " dim" : "") + (!lie && st.wrongHere >= 3 && i === 0 ? " strong" : "");
        d.textContent = t; if (lie) d.setAttribute("aria-label", "A strip in another hand, upright, on cold paper: " + t);
        fragsEl.appendChild(d);
      });
    }
    function drawDawn() {
      readBtn.textContent = `Read a star (${st.reads})`; readBtn.disabled = st.reads < 1 || st.over || !st.unlockRead; readBtn.hidden = !st.unlockRead; readBtn.classList.toggle("on", st.reading);
      dawnEl.innerHTML = "Before dawn " + Array.from({ length: DAWN }, (_, i) => `<b class="${i < st.wrong ? "out" : ""}">✦</b>`).join("");
      wrap.querySelector("[data-glimpse]").disabled = !st.glimpse || st.over;
    }
    const all = () => { drawLines(); drawFrags(); drawDawn(); };
    let beatTimer = null;
    function beat(html, ms = 7000) {
      beatEl.innerHTML = html; beatEl.classList.add("on");
      if (beatTimer) { clearTimeout(beatTimer); timers.delete(beatTimer); }
      beatTimer = later(() => beatEl.classList.remove("on"), ms);
    }
    function readStar(id) {
      if (st.reads < 1 || st.over) return;
      st.reads--; st.reading = false;
      const c = CONST.find((x) => x.id === stars[id].c);
      const n = c ? c.lines.filter(([a, b]) => a === id || b === id).length : 0;
      st.readT.set(id, n);
      noteEl.textContent = n ? `Seraphyne reads the star: it holds ${n} line${n === 1 ? "" : "s"} in its figure.` : "Seraphyne reads the star: it belongs to no figure tonight.";
      later(() => { st.readT.delete(id); drawLines(); }, 6000);
      all();
    }
    // the cloud of forgetting: after the Stag, a grey wash drifts across and lifts unnamed lines
    function cloudTick() {
      if (st.over || !st.cloud) return;
      const c = st.cloud;
      c.x += 0.35;
      if (c.x > 125) c.x = -25;
      c.el.setAttribute("cx", c.x.toFixed(1));
      let lifted = 0;
      for (const k of [...st.lines]) { const [a, b] = k.split("|"); const mx = (stars[a].x + stars[b].x) / 2, my = (stars[a].y + stars[b].y) / 2; if (((mx - c.x) / 11) ** 2 + ((my - c.y) / 8) ** 2 < 1) { st.lines.delete(k); lifted++; } }
      if (lifted) { noteEl.textContent = `The cloud passes and ${lifted} line${lifted > 1 ? "s" : ""} forget${lifted > 1 ? "" : "s"} themselves. Name a figure before it drifts over.`; drawLines(); }
      later(cloudTick, 100);
    }
    function startCloud() {
      const el = mk("ellipse", { cx: -25, cy: 50, rx: 11, ry: 8, fill: "rgba(200,206,220,.16)", stroke: "rgba(200,206,220,.35)", "stroke-width": 0.3, "stroke-dasharray": "1 1.2" }, gCloud);
      st.cloud = { x: -25, y: 55, el };
      el.setAttribute("cy", 55);
      cloudTick();
    }

    function toggle(a, b) {
      if (a === b || st.over) return;
      const k = key(a, b);
      if (st.solved.has(k) || st.blackLines.has(k)) return;
      if (st.sigil.has(k)) {   // III: lifting a line of the Sigil
        st.sigil.delete(k); st.lifted++;
        noteEl.textContent = st.sigil.size ? `A line of the Sigil lifts. ${st.sigil.size} left.` : "The Sigil is gone from the glass. Someone was under it.";
        if (st.lifted === 1) beat(`The silver line comes up off the glass like a hair, and somewhere under the Expanse a voice gets part of a word back. <cite>Each line lifted returns a little of what it says</cite>`, 7000);
        if (!st.sigil.size) { beat(`<q>${VOICE}</q> The whole of it, for the first time. Where the Sigil was there are twelve joints of a seated man, and the strips that name them. <cite>WW 101 · lay the one beneath · one strip is not the party's</cite>`, 10000); all(); return; }
        return drawLines();
      }
      if (st.sigil.size) { noteEl.textContent = "Nothing can be laid while the Sigil lies over the stars. Lift its lines first."; return; }
      st.lines.has(k) ? st.lines.delete(k) : st.lines.add(k);
      drawLines(); reader();
    }
    // The Second Reader (II), and the star she placed (III)
    function reader() {
      const c = st.ci < CONST.length ? cur() : null; if (!c || !c.hidden || st.second) return;
      const sol = solKeys(c); let good = 0; for (const k of st.lines) if (sol.has(k)) good++;
      if (good < (ST === 1 ? 4 : 10)) return;
      st.second = true; const h = stars[c.hidden]; h.hidden = false; h.el.removeAttribute("display");
      if (ST === 1) {
        const k = key(c.second[0], c.second[1]); st.lines.add(k); st.self.add(k);
        try { api.shared.set("second_reader", true); } catch { /* no storage */ }
        noteEl.textContent = "A line has drawn itself, to a star nobody had laid.";
        beat(`No strip says where the Lamp's last star went. A line draws itself to the place anyway, and a star is there. It is Seraphyne's hand on the glass. <q>You read it,</q> Kael said. Seraphyne looked at her hand. <q>Most of it.</q> <cite>The Second Reader · Kael watches her now, not the Remnants</cite>`, 12000);
      } else {
        let placed = false; try { placed = !!api.shared.get("second_reader", false); } catch { /* no storage */ }
        noteEl.textContent = "The man beneath is one star short. Then he is not.";
        beat(`The man beneath is one star short: the Book, at his right hand. Seraphyne reaches past you and sets it${placed ? ", exactly as she set the Lamp's" : ""}. She does not need a strip to know where. <cite>It is the star Seraphyne placed · lay the last line</cite>`, 11000);
        if (placed) ctx.link(wrap, `Because Seraphyne placed the Lamp's lost star <b>at the sky-watch</b> (Star Chart II), you know whose hand this is.`);
      }
      drawLines();
    }
    function unpick() {
      if (!st.black || st.over) return;
      const c = CONST.find((x) => x.id === st.black); st.blackLines.clear(); st.black = null; if (c.band) setStar(c.realm, null);
      if (c.lieAny) c.lieAny.forEach(([a, b]) => st.lines.delete(key(a, b)));
      const el = wrap.querySelector(`[data-band="${c.id}"]`); if (el) { el.classList.remove("black"); el.querySelector(".fig").textContent = "?"; }
      wrap.querySelector("[data-unpick]").hidden = true;
      noteEl.textContent = `The black leaf comes away. ${c.name} is unnamed again: lay it by the party's own strips.`;
      all();
    }
    function nameIt() {
      if (st.over || st.ci >= CONST.length) return;
      if (st.sigil.size) { noteEl.textContent = "The Sigil still lies over him. Lift its lines first."; return; }
      if (st.black) { noteEl.textContent = "A black-gilded figure is on the glass. Unpick it first."; return; }
      const sol = solKeys(cur());
      const ok = st.lines.size === sol.size && [...st.lines].every((k) => sol.has(k));
      const c0 = cur(), lieSet = c0.lieLines ? new Set(c0.lieLines.map(([a, b]) => key(a, b))) : null;
      const lied = lieSet ? st.lines.size === lieSet.size && [...st.lines].every((k) => lieSet.has(k)) : c0.lieAny ? c0.lieAny.some(([a, b]) => st.lines.has(key(a, b))) : false;
      if (lied) {   // named to the Remnant strip: black gilt, a false band, and it has to be unpicked
        st.black = c0.id;
        if (c0.lieLines) { st.lines.forEach((k) => st.blackLines.add(k)); st.lines.clear(); } else c0.lieAny.forEach(([a, b]) => { const k = key(a, b); if (st.lines.has(k)) st.blackLines.add(k); });
        if (c0.band) { setStar(c0.realm, "black"); const el = wrap.querySelector(`[data-band="${c0.id}"]`); if (el) { el.classList.add("black"); el.querySelector(".fig").textContent = "✦"; } }
        wrap.querySelector("[data-unpick]").hidden = false;
        noteEl.textContent = `${c0.name} takes the leaf, and the leaf goes black.`;
        beat(c0.lieLines ? `The figure answers to the strip in the upright hand, and gilds black. On the chasm wall, ${c0.band} band lights where there is no wall. <cite>Named to a Remnant's strip · Unpick the black, and lay it true</cite>` : `Those are the Sigil's own strokes, in another hand. The leaf goes black where they lie. <cite>Named to a Remnant's strip · Unpick the black</cite>`, 10000);
        return all();
      }
      if (ok) {
        st.fresh = new Set(st.lines);
        st.lines.forEach((k) => st.solved.add(k)); st.lines.clear();
        noteEl.textContent = `${cur().name} is gilded and recorded.${cur().band ? ` ${cur().band[0].toUpperCase() + cur().band.slice(1)} band of the descent is lit.` : ""}`;
        if (cur().band) { lightBand(cur()); setStar(cur().realm, "gold"); }
        st.ci++; st.wrongHere = 0; st.dim.clear(); st.sel = null; st.self.clear();
        if (st.ci >= CONST.length) return ST === 0 ? sigil() : won();
        all(); st.fresh = null;
        if (ST === 1) {
          if (st.ci === 1) beat(`The Tear holds. Around it the false stars go on flickering: lights the Remnants hung in the glass, to be joined to. <cite>Next: the Delver's Lamp · read whose hand each strip is in</cite>`, 9000);
          if (st.ci === 2) beat(`Mosswhisper's Lamp is back in gold. One figure left, and the party remembers all of it but the end. <cite>The Scholar's Lamp · its last star is lost</cite>`, 9000);
          return;
        }
        if (st.ci === 1) { st.unlockRead = true; drawDawn(); startCloud(); beat(`The Stag takes the gold, and the Priory's scholars lean in to see. Then a grey cloud of forgetting comes over the glass from the west. <cite>New: Read a star (R) · the cloud lifts unnamed lines</cite>`, 9000); }
        if (st.ci === 2) beat(`Seraphyne's fingers tremble on the glass. <i>“The prison weakens,” she said. “The cosmos trembles. The Remnants move in shadow.”</i><cite>WW 91 · one figure left</cite>`, 9000);
        return;
      }
      st.wrong++; st.wrongHere++;
      fieldEl.classList.remove("bad"); void fieldEl.offsetWidth; if (!api.reducedMotion) fieldEl.classList.add("bad");
      const frs = cur().fragments; const i = Math.floor(api.rng()() * frs.length);
      st.dim.set(i, true); later(() => { st.dim.delete(i); drawFrags(); }, 10000);
      noteEl.textContent = st.lines.size !== sol.size ? `Not yet: the sky does not hold it. (${st.lines.size} line${st.lines.size === 1 ? "" : "s"} laid.)` : "Not yet: a fragment does not hold.";
      if (st.wrong >= DAWN) {
        st.over = true; all();
        api.store.set("losses", losses + 1);
        later(() => { if (dead) return; ctx.done(wrap, { win: false, record: { realm: "above", title: PAGE.t, sub: PAGE.s, divider: 3, lines: [
          ...CONST.slice(0, st.ci).map((c) => ({ t: `${c.name}: gilded.${c.band ? ` ${c.band[0].toUpperCase() + c.band.slice(1)} band of the descent is lit.` : ""}`, kind: "link" })),
          ...CONST.slice(st.ci).map((c) => ({ t: `${c.name}: lost with the night.${c.band ? " Its band stays dark." : ""}`, kind: "lost" })),
          ST === 0 ? { t: "The Sigil: unseen.", kind: "lost" } : null] },
        text: ST === 0 ? `Dawn comes up over the Priory. ${st.solved.size ? CONST.slice(0, st.ci).map((c) => c.name).join(" and ") + " kept in gold; the rest" : "The three constellations"} fade with the night, and the sigil Seraphyne feared stays unseen.${losses + 1 >= 2 ? " Dawn will wait longer next time." : ""}`
          : ST === 1 ? `Dawn comes up over the Rim Moot and takes the sky-watch's glass with it. ${st.ci ? CONST.slice(0, st.ci).map((c) => c.name).join(" and ") + " kept in gold." : "Nothing was gilded."} A watch is spent.${losses + 1 >= 2 ? " Dawn will wait longer next time." : ""}`
          : `The Expanse has no dawn, but the glass clouds over all the same. Whoever is under the Sigil stays unnamed.${losses + 1 >= 2 ? " The glass will hold longer next time." : ""}` }); }, 600);
        return;
      }
      all();
    }
    function glimpse() {
      if (!st.glimpse || st.over || st.ci >= CONST.length) return;
      const miss = cur().lines.map(([a, b]) => key(a, b)).find((k) => !st.lines.has(k));
      if (!miss) return;
      st.glimpse = false; drawDawn();
      const [a, b] = miss.split("|");
      const l = mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: ctx.second ? "#c9786a" : GOLDHI, "stroke-width": 0.8, opacity: 0.55, "stroke-dasharray": "0.6 0.8" }, gGhost);
      noteEl.textContent = ctx.second ? "Seraphyne's Glimpse, in her own hand: one line, for three seconds. Kael checks it against the strips before he lets you lay it." : "Seraphyne's Glimpse: one true line, for three seconds.";
      later(() => l.remove(), 3000);
    }
    function won() {   // II and III
      st.over = true; all(); st.fresh = null; fragsEl.innerHTML = ""; api.store.set("losses", 0);
      const lit = BANDED.map((c) => ({ t: `${c.name}: gilded. ${c.band[0].toUpperCase() + c.band.slice(1)} band of the descent is lit.`, kind: "link" }));
      later(() => { if (dead) return; ctx.done(wrap, ST === 1 ? { win: true, record: { realm: "above", title: PAGE.t, sub: PAGE.s, divider: 3, pic: "chart-figure-scholars-lamp", lines: [...lit,
          { t: "The Scholar's Lamp: gilded. What Izladar was: one fragment more.", note: "Its last star was not in any strip. A line drew itself to it, in Seraphyne's hand." },
          { t: "The Second Reader: Kael saw whose hand it was.", kind: "link", note: "She has read the page Izladar read, and stopped one page short of him." }] },
        text: `Three figures gilded at the sky-watch, ${st.wrong} wrong naming${st.wrong === 1 ? "" : "s"}. The Scholar's Lamp has its lost star again, and no strip put it there: a line drew itself, in Seraphyne's hand. Kael has stopped watching the dark beyond the tents. He is watching her.` }
        : { win: true, record: { realm: "above", title: PAGE.t, sub: PAGE.s, divider: 3, pic: "chart-figure-the-scholar", lines: [
          "The Sigil of Izladar: lifted, all seven lines.", { t: `The voice, whole for once: “${VOICE}”`, note: "WW 101" },
          "The Scholar, beneath it: a seated man with a book. What Izladar was: one fragment more.",
          { t: "He was one star short. It was the star Seraphyne placed.", kind: "link" }] },
        text: `The Sigil is lifted and the figure under it is gilded: a man, seated, with a book at his right hand. ${st.wrong} wrong naming${st.wrong === 1 ? "" : "s"}. He was one star short, and Seraphyne set it without looking at a strip. The voice has all of its sentence back. It does not say it again.` }); }, 1500);
    }
    // the scripted end: the named lines move on their own into the Sigil
    function sigil() {
      st.over = true; nameEl.innerHTML = ""; fragsEl.innerHTML = ""; countEl.textContent = ""; if (st.cloud) st.cloud.el.remove();
      drawLines(); st.fresh = null;
      const title = "THE SIGIL OF IZLADAR";
      [...title].forEach((ch) => { const sp = document.createElement("span"); sp.textContent = ch; sp.className = "lit"; nameEl.appendChild(sp); });
      noteEl.textContent = "All three are named. Then the lines move on their own, and Seraphyne says what they are making a second before they have made it.";
      drawDawn();
      const old = [...gLines.children];
      SIGIL.forEach(([a, b], i) => {
        const src = old[i % old.length];
        const l = mk("line", { x1: src.getAttribute("x1"), y1: src.getAttribute("y1"), x2: src.getAttribute("x2"), y2: src.getAttribute("y2"), stroke: "#d6dbe8", "stroke-width": 0.7, "stroke-linecap": "round" }, gGhost);
        const to = { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y };
        if (api.reducedMotion) { for (const k in to) l.setAttribute(k, to[k]); return; }
        l.style.transition = "all 2.2s ease-in-out";
        later(() => { for (const k in to) l.setAttribute(k, to[k]); }, 300 + i * 120);
      });
      later(() => old.forEach((o) => o.setAttribute("opacity", "0.25")), 300);
      api.store.set("losses", 0);
      beat(`The gold lines lift from the stars they were laid on. <cite>The Sigil forms</cite>`, 4000);
      later(() => { if (dead) return; ctx.done(wrap, { win: true, record: { realm: "above", title: "Star Chart I: the Priory sky", sub: "High Realm page · chapter 6, The Sigil", divider: 3, pic: "chart-figure-sigil", lines: [
        ...CONST.map((c) => ({ t: `${c.name}: gilded. ${c.band[0].toUpperCase() + c.band.slice(1)} band of the descent is lit.`, kind: "link" })),
        { t: "The Sigil of Izladar, seen. What he was: one fragment more.", note: "Stars become the route: three of the six bands down the chasm wall are lit for good." }] },
        text: `Three constellations gilded and recorded, ${st.wrong} wrong naming${st.wrong === 1 ? "" : "s"}${st.reads < (gentle ? 5 : READS) ? `, ${(gentle ? 5 : READS) - st.reads} star${(gentle ? 5 : READS) - st.reads === 1 ? "" : "s"} read` : ""}. The lines gather into “The Sigil of Izladar.” (WW 87) The Priory elder asks, “And the name?” Seraphyne answers: “Already fading.” (WW 93–95)` }); }, api.reducedMotion ? 800 : 3600);
    }

    // ---- input --------------------------------------------------------------------------------
    const pt = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; };
    const nearest = (p) => { let best = null, bd = 4; for (const s of Object.values(stars)) { if (s.hidden) continue; const d = Math.hypot(s.x - p.x, s.y - p.y); if (d < bd) { bd = d; best = s.id; } } return best; };
    let drag = null;
    const down = (e) => {
      if (st.over) return;
      const id = nearest(pt(e)); if (!id) return;
      e.preventDefault();
      drag = { from: id, moved: false };
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!drag) return;
      const p = pt(e), s = stars[drag.from];
      if (Math.hypot(p.x - s.x, p.y - s.y) > 2.5) drag.moved = true;
      temp.setAttribute("x1", s.x); temp.setAttribute("y1", s.y); temp.setAttribute("x2", p.x); temp.setAttribute("y2", p.y);
      temp.setAttribute("opacity", drag.moved ? 1 : 0);
    };
    const up = (e) => {
      if (!drag) return;
      temp.setAttribute("opacity", 0);
      const id = nearest(pt(e));
      if (drag.moved) { if (id && id !== drag.from) toggle(drag.from, id); st.sel = null; }
      else if (st.reading) readStar(drag.from);
      else if (st.sel && st.sel !== drag.from) { toggle(st.sel, drag.from); st.sel = null; }
      else st.sel = st.sel === drag.from ? null : drag.from;
      drag = null; drawLines();
    };
    svg.addEventListener("pointerdown", down); svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", () => { drag = null; temp.setAttribute("opacity", 0); });
    const kd = (e) => {
      const g = e.target.closest && e.target.closest(".wrymwretch-star-chart-star");
      if (!g || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      const id = g.dataset.id;
      if (st.reading) { readStar(id); return; }
      if (st.sel && st.sel !== id) { toggle(st.sel, id); st.sel = null; } else st.sel = st.sel === id ? null : id;
      drawLines();
    };
    svg.addEventListener("keydown", kd);
    const toggleRead = () => { if (st.reads < 1 || st.over || !st.unlockRead) return; st.reading = !st.reading; noteEl.textContent = st.reading ? "Tap the star Seraphyne should read." : ""; drawDawn(); };
    readBtn.addEventListener("click", toggleRead);
    const gk = (e) => { if (!st.started || st.over || e.target.closest && e.target.closest("button")) return; const k = e.key.toLowerCase(); if (k === "r") { e.preventDefault(); toggleRead(); } else if (k === "n") { e.preventDefault(); nameIt(); } else if (k === "escape") { st.sel = null; st.reading = false; all(); } };
    addEventListener("keydown", gk);
    wrap.querySelector("[data-name]").addEventListener("click", nameIt);
    wrap.querySelector("[data-unpick]").addEventListener("click", unpick);
    wrap.querySelector("[data-clear]").hidden = false;
    wrap.querySelector("[data-glimpse]").addEventListener("click", glimpse);
    wrap.querySelector("[data-clear]").addEventListener("click", () => { if (st.over) return; st.lines.clear(); st.sel = null; drawLines(); });
    const intro = wrap.querySelector(".wrymwretch-star-chart-intro");
    const sb = wrap.querySelector("[data-start]");
    sb.addEventListener("click", () => {
      intro.remove(); st.started = true;
      const f0 = svg.querySelector(".wrymwretch-star-chart-star");
      if (ST === 1) { noteEl.textContent = "Begin with the Moon's Tear. Its seven stars are ringed; the flickering ones are false."; st.unlockRead = true; drawDawn();
        beat(`The sky-watch at the Rim Moot, a watch before dawn. Seraphyne has brought the Priory's glass. Somebody has been at the party's strips. <cite>Three figures · look at the hand each strip is in</cite>`, 9000); f0 && f0.focus(); return; }
      if (ST === 2) { noteEl.textContent = "Seven silver lines: the Sigil. Drag along one to lift it."; st.unlockRead = true; drawDawn();
        beat(`In the Expanse the sky is paper and the stars are ink. The Sigil of Izladar stands on it already, drawn by no hand of yours. Seraphyne says, very quietly: <i>lift it</i>. <cite>Undo the figure to find the one beneath</cite>`, 9000); f0 && f0.focus(); return; }
      noteEl.textContent = "Begin with the Stag. Its seven stars are ringed.";
      ctx.notice(wrap, "above", { after: 10000, stay: Infinity, key: "m", css: "right:12px;top:12px" });   // phase 3: the star in the dome
      beat(`The Priory of First Light, at night. The constellations flicker <q>like dying embers</q>, and Scholar Seraphyne asks you to lay the lost lines back while the party still remembers them. <cite>WW 85 · Cedarheart's Stag first</cite>`, 9000);
      const f = svg.querySelector(".wrymwretch-star-chart-star"); f && f.focus();
    });
    ctx.picker(intro.querySelector("[data-tabs]"));
    sb.focus();
    opening(art, intro, ["chapter-06", "chapter-08", "chapter-11"][ST]);
    all();

    return { unmount() { st.over = true; dead = true; timers.forEach(clearTimeout); timers.clear(); removeEventListener("keydown", gk); wrap.remove(); } };
}

export default staged({ stages: LADDER }, play);

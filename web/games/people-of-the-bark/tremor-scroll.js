// People of the Bark — Tremor Scroll (1D, seismograph drum).
// DESIGN.md 11.5, two appearances played as one sitting at the Scroll House drum:
//   Summer (c3_scroll): dawn east 2, dusk west 1 (running down); none on storm days. 3 forecasts.
//   Autumn (c4_scroll): caching. Dawn east 2, noon north 3, dusk west 1. On rain days only noon.
//                       Every fourth day, no dusk (it stays at the cache). 6 forecasts.
// A forecast is correct when the day-part and face are right (or "none" is right); fine when the
// strength is right too. Six of the nine correct and the scholars are vindicated.
// Phase 1 (DESIGN "Accepted development"): in autumn the drum grows a fourth column in cold chalk grey, the
// faceless row. Its marks come from no face of the Trunk; they are loud on sun days and faint on rain days.
// The two faceless cells are forecast by strength alone and do not count toward the nine. Each one placed
// shades a plate on the Pulse map (the long puzzle's first step); both right completes the map, which then
// shows where the second tap will land (its last step, played here as one choice of plate).
// Art (api.art): the glyph set and weather marks are cut from their sheets once into small images; the
// chapter cards, Fenn's mark, the faceless-row scroll and the Pulse map strip are shown as they are.
// Actions: mark a cell (face and strength, or none); Fenn's lamp (3 uses) lights every recorded day
// with the same weather as the chosen forecast day; seal a page of forecasts. After two lost
// sittings, Fenn underlines what each column usually holds (DESIGN 11.5 hints, standing 40+).

import * as kit from "./_art.js";
import * as ladder from "./_ladder.js";

// Phase 2: three sittings. Teach, summer: the squirrel's hours (two of three). Test, autumn: weather and
// caching, with the faceless row and the Pulse map as phase 1 built them (four of six). Twist, the winter
// sitting: only the faceless column is forecast. It followed warmth all autumn; now the days the council
// tapped hard or poured offerings are marked on the scroll, and on those days the row is loud whatever the
// weather. "It answers us." Listening posts (runners' notes from Lowridge, Highridge and Knotholm: loud,
// faint or nothing) come with each cell. The set-piece: the column being forecast is the city's own budget.
// A whole Pulse map is remembered (api.shared "pulse_map_whole") and keeps the runner's ticks lit in the dark.
const SPEC = { title: "Tremor Scroll", chip: "left:auto;right:8px;bottom:auto;top:4px", stages: [
  { name: "The squirrel's hours", blurb: "Summer. Dawn, dusk, and what a storm does to them." },
  { name: "Weather and caching", blurb: "Autumn. New hours, and a chalk column that comes from no face of the Trunk." },
  { name: "The faceless row", blurb: "The winter sitting. The chalk column stops following the weather alone." },
] };
const HEAVY = [2, 3, 6, 7, 9, 11];   // winter days the council tapped past three, or poured

const PARTS = ["dawn", "noon", "dusk"];
const PULSE = "pulse";   // the faceless column
const CHALK = "#b9c2c4";
const FACES = { E: { name: "east", ang: 0 }, S: { name: "south", ang: 90 }, W: { name: "west", ang: 180 }, N: { name: "north", ang: 270 } };
const PHASES = [
  {
    key: "summer", title: "SUMMER", days: 12, first: 11,
    weather: ["sun", "sun", "rain", "storm", "sun", "rain", "sun", "sun", "storm", "rain", "sun", "storm"],
    truth(day, part) {
      if (this.weather[day - 1] === "storm") return null;
      if (part === "dawn") return { face: "E", s: 2 };
      if (part === "dusk") return { face: "W", s: 1 };
      return null;
    },
    cells: [[11, "dawn"], [11, "dusk"], [12, "dawn"]],
  },
  {
    key: "autumn", title: "AUTUMN", days: 16, first: 15,
    weather: ["sun", "rain", "sun", "sun", "rain", "sun", "sun", "sun", "rain", "sun", "rain", "sun", "sun", "sun", "rain", "sun"],
    truth(day, part) {
      const w = this.weather[day - 1];
      if (part === "noon") return { face: "N", s: 3 };
      if (w === "rain") return null;
      if (part === "dawn") return { face: "E", s: 2 };
      if (part === "dusk") return day % 4 === 0 ? null : { face: "W", s: 1 };
      return null;
    },
    cells: [[15, "dawn"], [15, "noon"], [15, "dusk"], [15, PULSE], [16, "dawn"], [16, "noon"], [16, "dusk"], [16, PULSE]],
    pulse: true,
    // the faceless row follows warmth: loud on sun days, faint on rain days
    pulseAt(day) { return { s: this.weather[day - 1] === "sun" ? 3 : 1 }; },
  },
  {
    key: "winter", title: "WINTER", days: 12, first: 9,
    weather: ["rain", "frost", "rain", "frost", "sun", "frost", "sun", "frost", "frost", "frost", "rain", "sun"],
    heavy: HEAVY,
    // the squirrel sleeps through frost, and comes out at dawn otherwise
    truth(day, part) { return this.weather[day - 1] !== "frost" && part === "dawn" ? { face: "E", s: 2 } : null; },
    cells: [[9, PULSE], [10, PULSE], [11, PULSE], [12, PULSE]],
    pulse: true,
    // warmth still counts (sun 3, rain 1, frost silent); a day of heavy tapping or offerings is two louder
    pulseAt(day) { const w = this.weather[day - 1], base = w === "sun" ? 3 : w === "rain" ? 1 : 0, s = Math.min(3, base + (this.heavy.includes(day) ? 2 : 0)); return s ? { s } : null; },
  },
];
const WIN_AT = 6;
// The Pulse map (art/src/70_tremor_scroll.py): 4 plates across, 13 down, in a 420 x 1100 strip.
const MAP = { x0: 110, y0: 96, cw: 62, ch: 70, cols: 4, rows: 13, w: 420, h: 1100, tap: [2, 6],
  fenn: [[1, 5], [2, 5], [1, 6], [1, 7], [0, 6], [2, 7], [3, 7]], mine: [[3, 6], [3, 5]] };
const TRACE = "#efe2c4", GOLD = "#f0c050", AMBER = "#d9902a", RED = "#e0573a", LIME = "#c4d65a", MUTED = "#c9b99a", DRUM = "#141010";

export default {
  mount(root, api) { return ladder.run(root, api, SPEC, play); },
};

function play(root, api, stage) {
  {
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const NEED = [2, 4, 3][stage], OF = [3, 6, 4][stage];
    const P = "people-of-the-bark-tremor-scroll-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    let raf = 0;
    const art = api.art || { has: () => false, url: () => "", info: () => null };
    const urls = [];
    let ART = null, dead = false;
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;

    let ph = 0, guess = [], cur = 0, sealed = false, revealT = 0, lamps = 3, lampDay = null, marks = 0;
    const tally = { correct: 0, fine: 0, made: 0 };
    const results = []; // per phase: [{ok, fine}]
    const phase = () => PHASES[ph];
    const startPhase = (i) => { ph = i; guess = phase().cells.map(() => null); cur = 0; sealed = false; revealT = 0; lampDay = null; marks = 0; };
    const truthOf = (d, p) => (p === PULSE ? phase().pulseAt(d) : phase().truth(d, p));
    const isP = (i) => phase().cells[i][1] === PULSE;
    let faceless = 0, saidFaceless = false;
    startPhase(stage);

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;background:
 radial-gradient(ellipse at 50% 0%,rgba(217,144,42,.10),transparent 60%),
 repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 2px,transparent 2px 9px),
 linear-gradient(90deg,#24180f,#3a281c 50%,#24180f);color:#efe2c4;font-family:'Cormorant Garamond',Georgia,serif}
.${P}page{box-sizing:border-box;max-width:1120px;margin:0 auto;padding:10px 16px 18px;display:flex;flex-direction:column;gap:8px;min-height:100%}
.${P}top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.${P}ttl{font-family:'IM Fell English',Georgia,serif;font-size:22px;letter-spacing:.06em}
.${P}ttl small{font:13px ui-monospace,monospace;letter-spacing:.16em;color:${MUTED};margin-left:8px}
.${P}score{font:13px ui-monospace,monospace;letter-spacing:.1em;color:${MUTED}}
.${P}score b{color:${GOLD};font-weight:400}
.${P}row{display:flex;gap:10px;align-items:center;min-width:0}
.${P}row>svg{flex:1 1 auto;min-width:0;width:100%;display:block;max-height:calc(100vh - 250px);min-height:300px}
.${P}map{flex:none;width:clamp(96px,11vw,140px);position:relative;line-height:0;margin:0;box-shadow:0 2px 0 #0d0805,0 0 0 1px #7a5a40}
.${P}map img{width:100%;height:auto;display:block}
.${P}map i,.${P}pick i{position:absolute;background:repeating-linear-gradient(35deg,rgba(93,103,106,.9) 0 1.5px,rgba(185,194,196,.55) 1.5px 5px);pointer-events:none}
.${P}map i.${P}new{outline:2px solid ${GOLD}}
.${P}map figcaption{font:11px/1.3 ui-monospace,monospace;letter-spacing:.08em;color:${CHALK};text-align:center;padding:4px 0 0}
.${P}pick{position:relative;width:min(100%,230px);margin:0 auto 10px;line-height:0}
@media (min-width:761px){.${P}pick{width:min(230px,max(170px,calc((100vh - 390px)*.382)))}}
.${P}pick img{width:100%;height:auto;display:block}
.${P}pick button{position:absolute;background:transparent;border:0;padding:0;cursor:pointer}
.${P}pick button:hover,.${P}pick button:focus-visible{outline:3px solid ${AMBER};outline-offset:-2px;background:rgba(240,192,80,.3)}
.${P}pick button.${P}hit{outline:3px solid ${LIME};background:rgba(196,214,90,.35)}
.${P}pick button.${P}miss{outline:3px solid ${RED};background:rgba(224,87,58,.3)}
.${P}who{display:flex;gap:10px;align-items:center;margin:0 0 6px}
.${P}pic{display:block;width:100%;height:auto;margin:0 0 8px;border:1px solid #5a3d2b}
.${P}slip{max-height:100%;overflow:auto}
.${P}cell{cursor:pointer}
.${P}cell:hover rect{stroke:${GOLD}}
.${P}cell:focus{outline:none}
.${P}cell:focus rect{stroke:${LIME};stroke-width:2.5}
.${P}fenn{font-style:italic;font-size:17px;line-height:1.35;color:#f3e4c0;text-align:center;min-height:1.4em;padding:0 8px}
.${P}fenn b{font-style:normal;font:12px ui-monospace,monospace;letter-spacing:.14em;color:${LIME};margin-right:6px}
.${P}panel{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;justify-content:center;color:#2e2016;padding:10px 12px;border:1px solid #c9b99a;
 background:linear-gradient(180deg,#f3e7cb,#e7d6b0);box-shadow:0 2px 0 #1b120c}
.${P}lab{font:14px ui-monospace,monospace;letter-spacing:.1em;min-width:170px;text-align:center}
.${P}lab small{display:block;font-size:12px;color:#7a5a40;letter-spacing:.06em}
.${P}grp{display:flex;gap:4px;flex-wrap:wrap;justify-content:center}
.${P}b{font:14px ui-monospace,monospace;min-width:44px;min-height:40px;border:1px solid #2e2016;background:rgba(255,255,255,.35);color:#2e2016;cursor:pointer;padding:4px 8px;border-radius:2px}
.${P}b:hover:not(:disabled){background:#fff6dc}
.${P}b[aria-pressed=true]{background:#2e2016;color:#efe2c4}
.${P}b:disabled{opacity:.35;cursor:default}
.${P}b:focus-visible,.${P}seal:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}lamp{border-color:${AMBER}}
.${P}seal{font-family:'IM Fell English',Georgia,serif;font-size:19px;background:#b8402a;color:#efe2c4;border:0;padding:8px 16px;cursor:pointer;border-radius:2px;min-height:42px}
.${P}seal:disabled{opacity:.45;cursor:default}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(14,10,8,.9);z-index:4;padding:16px;overflow:auto}
.${P}slip{max-width:470px;width:100%;box-sizing:border-box;background:${DRUM};color:#efe2c4;padding:20px 22px 18px;border:1px solid #5a3d2b;
 box-shadow:0 0 0 6px #2a1d14,0 0 0 7px #7a5a40;position:relative}
.${P}slip svg{display:block;width:100%;height:34px;margin:2px 0 8px}
.${P}slip h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;letter-spacing:.04em}
.${P}slip .${P}beat{font-style:italic;font-size:17px;line-height:1.4;color:#e9d6ae;margin:6px 0 10px}
.${P}slip .${P}goal{font-size:18px;line-height:1.35;margin:0 0 10px;border-top:1px dashed #7d6c5a;padding-top:10px}
.${P}key{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:16px;line-height:1.3;margin:0 0 14px}
.${P}key kbd{font:13px ui-monospace,monospace;color:${GOLD};border:1px solid #7d6c5a;padding:2px 6px;border-radius:2px;white-space:nowrap;align-self:start}
@keyframes ${P}pop{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes ${P}shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.${P}bump{animation:${P}pop .35s}
.${P}no{animation:${P}shake .3s}
@media (max-width:760px){.${P}map{display:none}}
@media (max-width:560px){.${P}lab{min-width:0;width:100%}.${P}ttl{font-size:19px}.${P}row>svg{max-height:none}}
@media (prefers-reduced-motion:reduce){.${P}bump,.${P}no{animation:none}}
</style>
<div class="${P}page">
 <div class="${P}top"><div class="${P}ttl">The Tremor Scroll<small></small></div><div class="${P}score" aria-live="polite"></div></div>
 <div class="${P}row"><svg aria-label="The Tremor Scroll"></svg><figure class="${P}map" hidden></figure></div>
 <div class="${P}fenn" aria-live="polite"></div>
 <div class="${P}panel">
  <span class="${P}lab"></span>
  <div class="${P}grp"><button class="${P}b" data-f="none" type="button" title="no tremor (0)">none</button><button class="${P}b" data-f="E" type="button">E →</button><button class="${P}b" data-f="S" type="button">S ↓</button><button class="${P}b" data-f="W" type="button">W ←</button><button class="${P}b" data-f="N" type="button">N ↑</button></div>
  <div class="${P}grp"><button class="${P}b" data-s="1" type="button">1</button><button class="${P}b" data-s="2" type="button">2</button><button class="${P}b" data-s="3" type="button">3</button></div>
  <button class="${P}b ${P}lamp" type="button" title="Fenn's lamp (L)"></button>
  <button class="${P}seal" type="button" disabled>Seal the forecast</button>
 </div>
</div>
<div class="${P}intro"><div class="${P}slip" role="dialog" aria-label="How to play">
 ${kit.chapter(art, ["chapter-3-summer", "chapter-4-autumn", "chapter-5-winter"][stage])}
 <div class="${P}who">${kit.mark(art, "fenn", "Fenn of the Scroll House")}<h2>Tremor Scroll</h2></div>
 <svg viewBox="0 0 400 34" aria-hidden="true"><path d="M0 17 H120 l4 -9 l4 18 l4 -14 l4 10 l4 -5 H260 l3 -4 l3 8 l3 -4 H400" fill="none" stroke="${TRACE}" stroke-width="1.4"/></svg>
 <p class="${P}beat">${["The Scroll House, summer. Fenn has not slept. The drum has a line for every day the world shook, and the Battlements want to know when it will shake next.",
   "Autumn. A leaf the size of a country has fallen past the Scroll House, and the tremors keep new hours: something now shakes the world at noon, every noon, from the north. And under the hours Fenn has begun a row of her own, in chalk: small marks that come from no face of the Trunk at all.",
   "The winter sitting. Fenn unrolls a second scroll from home, the one the Scroll House forbids: nothing on it but the chalk row. “Is it me?” she asks. All autumn it followed the warmth. In the frost it should be silent. It is not always silent. She has marked, with a drop of sap, every day the council tapped past three or poured an offering."][stage]}</p>
 ${stage === 1 && art.has("scroll-faceless-row") ? `<img class="${P}pic" src="${art.url("scroll-faceless-row")}" alt="A stretch of scroll: the recorded tremors above, and a row of small marks with no face below" width="1600" height="420">` : ""}
 <p class="${P}goal"><b>Goal:</b> ${["forecast the three blank cells. Two right and the scholars are believed.",
   "six cells this time, and two in the <b style=\"color:" + CHALK + "\">faceless</b> column. Four of the six right wins the sitting. The faceless marks are not counted: they go on a map.",
   "forecast the <b style=\"color:" + CHALK + "\">faceless</b> column for four days. Three right and Fenn has her answer. Runners' notes from three listening posts come with each day."][stage]}</p>
 <div class="${P}key">
  <kbd>tap a cell</kbd><span>pick it (or <b>← →</b>)</span>
  ${stage === 2 ? "" : "<kbd>E S W N · 0</kbd><span>the face it will shake from, or none</span>"}
  <kbd>1 2 3${stage ? " · 0" : ""}</kbd><span>${stage === 2 ? "a faceless mark has no face: its strength, or none" : "its strength: the height of the burst"}</span>
  ${stage ? `<kbd>L</kbd><span>Fenn's lamp: light every day with the same weather as the cell you are on</span>` : ""}
 </div>
 <button class="${P}seal" type="button">Unroll the scroll</button>
</div></div>`;
    root.appendChild(wrap);
    kit.styles(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const svg = wrap.querySelector(`.${P}row>svg`), mapEl = $("map");
    const lab = $("lab"), fenn = $("fenn"), sealBtn = wrap.querySelector(`.${P}panel .${P}seal`), lampBtn = $("lamp"), scoreEl = $("score"), sub = wrap.querySelector(`.${P}ttl small`);
    const say = (who, text) => { fenn.innerHTML = (who ? `<b>${who}</b>` : "") + text; };

    // geometry: a wide drum, or a narrow one for phones
    let G = null;
    function geom() {
      const narrow = wrap.getBoundingClientRect().width < 640;
      const VW = narrow ? 440 : 860;
      const X0 = narrow ? 52 : 112, X1 = VW - (narrow ? 36 : 70);
      const span = X1 - X0;
      const four = !!phase().pulse;
      G = { narrow, VW, X0, X1, XP: four ? { dawn: X0 + span * 0.13, noon: X0 + span * 0.38, dusk: X0 + span * 0.63, pulse: X0 + span * 0.88 } : { dawn: X0 + span * 0.2, noon: X0 + span * 0.5, dusk: X0 + span * 0.8 },
        Y0: 58, DY: narrow ? 34 : 33, F: narrow ? 13 : 13, CW: narrow ? (four ? 64 : 70) : 92, TX: four ? X0 + span * 0.76 : X1 };
    }
    geom();
    const Yd = (d) => G.Y0 + (d - 1) * G.DY;
    const jit = api.rng(41);
    const jitter = Array.from({ length: 16 }, () => Array.from({ length: 160 }, () => (jit() - 0.5) * 1.6));

    function faceMark(x, y, face, col, size = 1) {
      const a = FACES[face].ang;
      return `<g transform="translate(${x} ${y - 10})"><g transform="rotate(${a}) scale(${size})"><path d="M-6 0 H5 M2 -3.5 L6 0 L2 3.5" stroke="${col}" stroke-width="1.6" fill="none"/></g><text x="9" y="4.5" font-family="ui-monospace,monospace" font-size="${G.F}" fill="${col}">${face}</text></g>`;
    }
    function trace(day, upto = 1, lit = false) {
      const y = Yd(day), pts = [];
      const bursts = PARTS.map((p) => ({ x: G.XP[p], t: phase().truth(day, p) })).filter((b) => b.t);
      const n = 159;
      for (let i = 0; i <= n; i++) {
        const x = G.X0 + (G.X1 - G.X0) * i / n;
        if ((x - G.X0) / (G.X1 - G.X0) > upto) break;
        let dy = jitter[day - 1][i];
        if (x > G.TX) break;
        const reach = G.narrow ? 18 : 30;
        if (!ART) for (const b of bursts) { const d = Math.abs(x - b.x); if (d < reach) dy += Math.sin(i * 2.6) * (b.t.s * 4.6) * (1 - d / reach); }
        pts.push(`${x.toFixed(1)},${(y + dy).toFixed(1)}`);
      }
      let s = pts.length > 1 ? `<polyline points="${pts.join(" ")}" fill="none" stroke="${lit ? GOLD : TRACE}" stroke-width="${lit ? 1.6 : 1.2}" opacity="${lit ? 1 : 0.88}"/>` : "";
      for (const b of bursts) if ((b.x - G.X0) / (G.X1 - G.X0) <= upto) s += ART ? glyphArt(b.x, y, b.t.face, b.t.s, lit) : faceMark(b.x + (G.narrow ? 14 : 30), y, b.t.face, lit ? GOLD : TRACE, G.narrow ? 0.8 : 1);
      if (phase().pulse && phase().pulseAt(day) && (G.XP.pulse - G.X0) / (G.X1 - G.X0) <= upto) s += ticks(G.XP.pulse, y, phase().pulseAt(day).s, day, lit ? "#e6eef0" : CHALK);
      return s;
    }
    // a cut of the glyph sheet: the burst, its face arrow and letter, and the strength strokes
    function glyphArt(x, y, face, s, lit) {
      const h = G.narrow ? 32 : 38, w = h * 202 / 110;
      return `<image href="${ART.g[face + s]}" x="${(x - w * 0.45).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h}" ${lit ? 'style="filter:sepia(1) saturate(4)"' : ""}/>`;
    }
    // the faceless marks: small chalk ticks with no arrow at all (the hand of art/documents/scroll-faceless-row)
    function ticks(x, y, n, seed, col) {
      let d = "";
      const r = api.rng(900 + seed * 7 + n);
      const k = n >= 3 ? 7 : n === 2 ? 4 : 2;
      for (let i = 0; i < k; i++) d += `M${(x - 22 + r() * 40).toFixed(1)} ${(y - 8 + r() * 14).toFixed(1)} l4 -2.4 l-0.8 4 l4.8 -1.6`;
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    function weather(d) { return weather0(d) + (phase().heavy && phase().heavy.includes(d) ? `<g transform="translate(${(G.narrow ? 20 : 84) + (G.narrow ? 13 : 20)} ${Yd(d)})"><path d="M0 -7 Q6 2 0 6 Q-6 2 0 -7Z" fill="${AMBER}" stroke="#1b120c" stroke-width=".8"/></g>` : ""); }
    function weather0(d) {
      const w = phase().weather[d - 1], y = Yd(d), x = G.narrow ? 20 : 84;
      if (w === "frost" && !(ART && ART.w[w])) return `<g transform="translate(${x} ${y})" stroke="#cfe3ea" stroke-width="1.5"><path d="M0 -8 V8 M-7 -4 L7 4 M-7 4 L7 -4"/></g>`;
      if (ART && ART.w[w]) return `<image href="${ART.w[w]}" x="${x - 12}" y="${y - 12}" width="24" height="24"/>`;
      if (w === "sun") return `<g transform="translate(${x} ${y})" stroke="#e7d6b0" fill="none" stroke-width="1.4"><circle r="4.5"/>${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M0 -7 V-10" transform="rotate(${a})"/>`).join("")}</g>`;
      if (w === "rain") return `<g transform="translate(${x} ${y})" fill="#8ab4d4"><path d="M-4 -7 q3 4.5 0 7 q-3 -2.5 0 -7Z"/><path d="M4 -2 q3 4.5 0 7 q-3 -2.5 0 -7Z"/></g>`;
      return `<g transform="translate(${x} ${y})"><path d="M-5 -10 L2 -1 L-3 0 L4 10" stroke="${GOLD}" stroke-width="1.8" fill="none"/></g>`;
    }
    function glyphFor(gs, x, y, col, pulse) {
      if (pulse && gs && !gs.none) return ticks(x, y, gs.s, 77, col === GOLD ? "#e6eef0" : CHALK) + `<text x="${x + G.CW / 2 - 6}" y="${y + 11}" text-anchor="end" font-family="ui-monospace,monospace" font-size="11" fill="${CHALK}">${gs.s}</text>`;
      if (ART && gs && !gs.none) return glyphArt(x, y, gs.face, gs.s, col === GOLD);
      if (ART && gs && gs.none && ART.none) return `<image href="${ART.none}" x="${x - 11}" y="${y - 11}" width="22" height="22"/>`;
      if (!gs) return `<text x="${x}" y="${y + 6}" text-anchor="middle" font-family="IM Fell English,serif" font-size="19" fill="${col}" opacity=".7">?</text>`;
      if (gs.none) return `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="15" fill="${col}">∅</text>`;
      const amp = gs.s * 3.6, w = G.narrow ? 12 : 18;
      return `<path d="M${x - w - 4} ${y} ${Array.from({ length: 7 }, (_, i) => `L${x - w + i * (w / 3)} ${y + (i % 2 ? -amp : amp) * (1 - Math.abs(i - 3) / 4)}`).join(" ")} L${x + w + 4} ${y}" stroke="${col}" stroke-width="1.6" fill="none"/>` + faceMark(x + w + (G.narrow ? 0 : 6), y, gs.face, col, 0.8);
    }
    const ok = (gs, t, pulse) => !!gs && (gs.none ? !t : !!t && (pulse ? gs.s === t.s : gs.face === t.face));
    // the most common entry per column in the record (gentle hint)
    function usual(part) {
      const c = {};
      for (let d = 1; d < phase().first; d++) { const t = phase().truth(d, part); const k = t ? t.face + t.s : "none"; c[k] = (c[k] || 0) + 1; }
      return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    }

    function draw() {
      const PH = phase(), H = G.DY * PH.days + 60;
      svg.setAttribute("viewBox", `0 0 ${G.VW} ${H + 30}`);
      const L = G.narrow ? 8 : 52, R = G.VW - (G.narrow ? 8 : 40);
      let s = `<defs><linearGradient id="${P}dr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2c2420"/><stop offset=".1" stop-color="${DRUM}"/><stop offset=".9" stop-color="${DRUM}"/><stop offset="1" stop-color="#2c2420"/></linearGradient>
<filter id="${P}soot" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  0 0 0 .07 0"/></filter></defs>
<rect x="${L}" y="30" width="${R - L}" height="${H - 8}" rx="10" fill="url(#${P}dr)"/><rect x="${L}" y="30" width="${R - L}" height="${H - 8}" rx="10" filter="url(#${P}soot)"/>
<rect x="${L - 10}" y="24" width="12" height="${H + 4}" rx="5" fill="#6b4a33"/><rect x="${R - 2}" y="24" width="12" height="${H + 4}" rx="5" fill="#6b4a33"/>`;
      if (PH.pulse) s += `<rect x="${G.XP.pulse - G.CW / 2 - 4}" y="34" width="${G.CW + 8}" height="${H - 16}" fill="${CHALK}" opacity=".07"/><text x="${G.XP.pulse}" y="20" text-anchor="middle" font-family="ui-monospace,monospace" font-size="${G.F}" letter-spacing="${G.narrow ? 1 : 3}" fill="${CHALK}">NO FACE</text>`;
      for (const p of PARTS) {
        s += `<text x="${G.XP[p]}" y="20" text-anchor="middle" font-family="ui-monospace,monospace" font-size="${G.F}" letter-spacing="3" fill="${MUTED}">${p.toUpperCase()}</text><line x1="${G.XP[p]}" y1="38" x2="${G.XP[p]}" y2="${Yd(PH.days) + 20}" stroke="${MUTED}" stroke-width=".6" opacity=".2"/>`;
        if (gentle) s += `<text x="${G.XP[p]}" y="${Yd(PH.first) - G.DY / 2 - 4}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="${G.F - 1}" fill="${LIME}">usually ${usual(p).replace("none", "∅")}</text>`;
      }
      const sameW = lampDay ? PH.weather[lampDay - 1] : null;
      for (let d = 1; d <= PH.days; d++) {
        const lit = sameW && d < PH.first && PH.weather[d - 1] === sameW;
        if (lit) s += `<rect x="${L + 4}" y="${Yd(d) - G.DY / 2 + 2}" width="${R - L - 8}" height="${G.DY - 4}" rx="4" fill="${GOLD}" opacity=".12"/>`;
        s += weather(d) + `<text x="${G.narrow ? G.VW - 30 : R + 14}" y="${Yd(d) + 4}" font-family="ui-monospace,monospace" font-size="${G.narrow ? 11 : 12}" fill="${MUTED}" ${G.narrow ? 'text-anchor="start"' : ""}>${G.narrow ? "" : String(d).padStart(2, "0")}</text>`;
        if (G.narrow) s += `<text x="${L + 22}" y="${Yd(d) + 4}" font-family="ui-monospace,monospace" font-size="11" fill="${MUTED}">${String(d).padStart(2, "0")}</text>`;
        if (d < PH.first) s += trace(d, 1, lit);
        else if (sealed) s += trace(d, Math.min(1, Math.max(0, revealT * 2 - (d - PH.first))));
        else s += `<line x1="${G.X0}" y1="${Yd(d)}" x2="${G.X1}" y2="${Yd(d)}" stroke="${TRACE}" stroke-width="1" stroke-dasharray="2 5" opacity=".4"/>`;
      }
      s += `<line x1="${L + 8}" y1="${Yd(PH.first) - G.DY / 2}" x2="${R - 8}" y2="${Yd(PH.first) - G.DY / 2}" stroke="${AMBER}" stroke-width="1.2" stroke-dasharray="6 4"/>
${G.narrow ? "" : `<text x="${R - 12}" y="${Yd(PH.first) - G.DY / 2 + 13}" text-anchor="end" font-family="ui-monospace,monospace" font-size="${G.F - 2}" letter-spacing="2" fill="${AMBER}">FORECAST</text>`}`;
      PH.cells.forEach(([d, p], i) => {
        const pulse = p === PULSE;
        const x = G.XP[p], y = Yd(d), t = truthOf(d, p), gs = guess[i], sel = i === cur && !sealed;
        let verdict = "";
        if (sealed && revealT >= 1) {
          const good = ok(gs, t, pulse);
          verdict = `<g class="${P}bump" style="transform-box:fill-box;transform-origin:center"><circle cx="${x - G.CW / 2 - 12}" cy="${y}" r="10" fill="${good ? LIME : RED}"/><text x="${x - G.CW / 2 - 12}" y="${y + 5}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="14" fill="${DRUM}">${good ? "✓" : "✗"}</text></g>`;
        }
        s += `<g class="${P}cell" data-i="${i}" tabindex="${sealed ? -1 : 0}" role="button" aria-label="Day ${d} ${pulse ? "no face" : p}${gs ? (gs.none ? ", none" : pulse ? `, strength ${gs.s}` : `, ${FACES[gs.face].name} ${gs.s}`) : ", blank"}"><rect x="${x - G.CW / 2}" y="${y - 15}" width="${G.CW}" height="30" rx="4" fill="${sel ? "rgba(240,192,80,.22)" : "rgba(239,226,196,.06)"}" stroke="${sel ? GOLD : pulse ? CHALK : "#8a7864"}" stroke-width="${sel ? 2.2 : 1}"/>${sealed ? "" : glyphFor(gs, x, y, sel ? GOLD : "#e7d6b0", pulse)}</g>${verdict}`;
        if (sealed && !pulse && !ART) s += `<g opacity=".6">${glyphFor(gs, x, y + 11, GOLD)}</g>`;
      });
      // the stylus arm: parked at the side until the drum turns
      const pivot = G.narrow ? G.VW - 14 : R + 30;
      const ty = sealed && revealT < 1 ? Yd(PH.first + Math.min(PH.days - PH.first, Math.floor(revealT * 2))) : Yd(PH.days) + 18;
      const tx = sealed && revealT < 1 ? G.X0 + (G.X1 - G.X0) * ((revealT * 2) % 1) : G.X1 + 4;
      s += `<line x1="${pivot}" y1="6" x2="${tx}" y2="${ty}" stroke="${AMBER}" stroke-width="3" stroke-linecap="round" opacity="${sealed && revealT < 1 ? 1 : 0.55}"/><circle cx="${pivot}" cy="8" r="7" fill="#5a3d2b" stroke="${AMBER}"/>`;
      svg.innerHTML = s;
      svg.querySelectorAll("." + P + "cell").forEach((el) => {
        el.addEventListener("click", () => pick(+el.dataset.i));
        el.addEventListener("keydown", (e) => { if (e.key === " ") { e.preventDefault(); pick(+el.dataset.i); } });
      });
    }
    function pick(i) {
      if (sealed) return;
      cur = i; panel(); draw();
      if (isP(i) && !saidFaceless) { saidFaceless = true; say("Fenn", "lowers her voice. “That column is mine. The House does not record a mark with no face. Strength only: faint, or loud, or nothing.”"); }
      const c = svg.querySelector(`[data-i="${i}"]`); c && c.focus({ preventScroll: true });
    }
    function panel() {
      const PH = phase(), [d, p] = PH.cells[cur], gs = guess[cur];
      const pulse = p === PULSE;
      const pt = pulse && stage === 2 ? PH.pulseAt(d) : null, ps = pt ? pt.s : 0;
      const posts = pulse && stage === 2 ? `<small style="color:#3d4a4f;opacity:1">listening posts · Lowridge: ${ps >= 2 ? "loud" : ps ? "faint" : "nothing"} · Highridge: ${ps === 3 ? "faint" : "nothing"} · Knotholm: nothing</small>` : "";
      lab.innerHTML = `DAY ${d} · ${pulse ? "NO FACE" : p.toUpperCase()}<small>${PH.weather[d - 1]}${PH.heavy ? (PH.heavy.includes(d) ? " · the council tapped hard" : " · a quiet day in council") : ""} · cell ${cur + 1} of ${PH.cells.length}${pulse ? " · strength only" : ""}</small>${posts}`;
      wrap.querySelectorAll("[data-f]").forEach((b) => { b.setAttribute("aria-pressed", String(!!gs && (gs.none ? b.dataset.f === "none" : !pulse && b.dataset.f === gs.face))); b.disabled = sealed || (pulse && b.dataset.f !== "none"); });
      wrap.querySelectorAll("[data-s]").forEach((b) => { b.setAttribute("aria-pressed", String(!!gs && !gs.none && gs.s === +b.dataset.s)); b.disabled = sealed || (!pulse && (!gs || !!gs.none)); });
      lampBtn.textContent = `lamp · ${lamps}`;
      lampBtn.disabled = sealed || lamps <= 0;
      const left = guess.filter((g) => !g).length;
      sealBtn.disabled = sealed || left > 0;
      sealBtn.textContent = left ? `${left} blank` : "Seal the forecast";
      sub.textContent = `${PH.title} · ${PH.cells.length} forecasts`;
      scoreEl.innerHTML = stage === 2 ? `<span style="color:${CHALK}">the faceless column</span> · need ${NEED} of ${OF}` : `correct <b>${tally.correct}</b> / ${tally.made} · need ${NEED} of ${OF}${PH.pulse ? ` · <span style="color:${CHALK}">faceless marks ${guess.filter((g, i) => isP(i) && g && !g.none).length} / 2</span>` : ""}`;
      drawMap();
    }
    // ---- the Pulse map strip, from the back pages of Old Resin's recipe book ----
    const plateBox = ([i, j]) => `left:${((MAP.x0 + i * MAP.cw + 4) / MAP.w * 100).toFixed(2)}%;top:${((MAP.y0 + j * MAP.ch + 4) / MAP.h * 100).toFixed(2)}%;width:${((MAP.cw - 8) / MAP.w * 100).toFixed(2)}%;height:${((MAP.ch - 8) / MAP.h * 100).toFixed(2)}%`;
    function shaded(final) {
      // Fenn's own plates, and one more for each faceless mark the player has placed (after the seal: each one right)
      const out = MAP.fenn.map((q) => ({ q, mine: false }));
      let k = 0;
      PHASES[1].cells.forEach(([d, p], i) => {
        if (p !== PULSE) return;
        const gs = ph === 1 ? guess[i] : null, n = k++;
        if (gs && !gs.none && (!final || ok(gs, PHASES[1].pulseAt(d), true))) out.push({ q: MAP.mine[n], mine: true });
      });
      return out;
    }
    let mapKey = "";
    function drawMap() {
      const show = ph === 1 && art.has("scroll-pulse-map-blank");
      mapEl.hidden = !show;
      if (!show) return;
      const sh = shaded(sealed && revealT >= 1), key = sh.map((x) => x.q.join()).join(";");
      if (key === mapKey) return;
      mapKey = key;
      mapEl.innerHTML = `<img src="${art.url("scroll-pulse-map-blank")}" alt="The Pulse map: a strip of the bark's plates">` + sh.map((x) => `<i class="${x.mine ? P + "new" : ""}" style="${plateBox(x.q)}"></i>`).join("") + `<figcaption>THE PULSE MAP</figcaption>`;
    }
    function flash(el, cls) { if (!el || api.reducedMotion) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
    function setFace(f) {
      if (sealed) return;
      if (isP(cur) && f !== "none") { flash(wrap.querySelector(`[data-f="${f}"]`), P + "no"); say("Fenn", "“It has no face. I gave it one twice, to make it fit. I scraped them off.”"); return; }
      const was = guess[cur];
      if (f === "none") guess[cur] = { none: true };
      else guess[cur] = { face: f, s: was && !was.none ? was.s : 1 };
      if (!was) onMarked();
      panel(); draw();
      flash(wrap.querySelector(`[data-f="${f}"]`), P + "bump");
      // move on to the next blank cell once a none is set (a face still wants its strength)
      if (f === "none") advance();
    }
    function setStr(n) {
      if (sealed) return;
      if (isP(cur)) {
        const was = guess[cur];
        guess[cur] = { s: n }; if (!was) onMarked();
        panel(); draw(); flash(wrap.querySelector(`[data-s="${n}"]`), P + "bump");
        if (stage !== 2) say("The Pulse map", "in the back of Resin's recipe book: a plate is shaded for the mark.");
        advance(); return;
      }
      if (!guess[cur] || guess[cur].none) { flash(wrap.querySelector(`[data-s="${n}"]`), P + "no"); say("Fenn", "Choose a face before a strength."); return; }
      guess[cur].s = n; panel(); draw(); flash(wrap.querySelector(`[data-s="${n}"]`), P + "bump");
      advance();
    }
    function advance() {
      const nxt = guess.findIndex((g, i) => !g && i !== cur);
      if (nxt >= 0) later(() => { if (!sealed) pick(nxt); }, 160);
    }
    function onMarked() {
      marks++;
      if (ph === 1 && marks === 3) say("A runner's note", "pinned to the drum: “Lowridge felt nothing at dusk on the twelfth, nor on the eighth. They thought the Trunk was sleeping.”");
    }
    function lamp() {
      if (sealed || lamps <= 0) { flash(lampBtn, P + "no"); return; }
      lamps--; lampDay = phase().cells[cur][0];
      const w = phase().weather[lampDay - 1];
      say("Fenn's lamp", `lights every ${w} day in the record. “Look at what the ${w} days did.”`);
      panel(); draw(); flash(lampBtn, P + "bump");
    }
    on(lampBtn, "click", lamp);
    wrap.querySelectorAll("[data-f]").forEach((b) => on(b, "click", () => setFace(b.dataset.f)));
    wrap.querySelectorAll("[data-s]").forEach((b) => on(b, "click", () => setStr(+b.dataset.s)));
    on(window, "keydown", (e) => {
      if (sealed || wrap.querySelector("." + P + "intro") || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (["E", "S", "W", "N"].includes(k)) setFace(k);
      else if (k === "0" || k === "X") setFace("none");
      else if (["1", "2", "3"].includes(k)) setStr(+k);
      else if (k === "L") lamp();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); pick((cur + 1) % guess.length); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); pick((cur + guess.length - 1) % guess.length); }
      else if (e.key === "Enter" && !sealBtn.disabled) { e.preventDefault(); seal(); }
    });

    function seal() {
      if (sealed || guess.some((g) => !g)) return;
      sealed = true; lampDay = null; panel();
      say("", "Fenn holds the lamp while the drum turns.");
      const t0 = performance.now(), dur = api.reducedMotion ? 1 : 2600;
      const step = (now) => {
        revealT = Math.min(1, (now - t0) / dur);
        draw();
        if (revealT < 1) raf = requestAnimationFrame(step); else score();
      };
      raf = requestAnimationFrame(step);
    }
    function score() {
      const PH = phase();
      let c = 0, f = 0;
      let n = 0;
      PH.cells.forEach(([d, p], i) => {
        const gs = guess[i];
        if (p === PULSE) { if (ok(gs, truthOf(d, p), true)) faceless++; if (stage !== 2) return; }
        n++;
        const t = PH.truth(d, p); if (ok(gs, t)) { c++; if (!gs.none && t.s === gs.s) f++; }
      });
      tally.correct += c; tally.fine += f; tally.made += n; results.push({ c, f, n });
      panel();
      if (ph === 2) {
        // the set-piece: what was being forecast
        const won = faceless >= NEED;
        api.store.set("losses", won ? 0 : losses + 1);
        say("Fenn", won ? "lays the council ledger beside the chalk row. They are the same shape. “It answers us.”" : "turns the scroll back. “Then I still do not know whose hand it is.”");
        if (won) { shared.set("faceless_read", true); ladder.pulse(api, 0); }
        later(() => api.end(won
          ? { outcome: "win", text: `${faceless} of 4 faceless marks forecast. Frost should have silenced the row, and on quiet days it did. On the days the council tapped past three or poured an offering, it was loud whatever the weather. Fenn lays the council's ledger beside her forbidden scroll and they are the same shape: the column you were forecasting was the city's own budget. “It answers us.” Lowridge heard every mark. Knotholm, where the offerings are poured, heard nothing.` }
          : { outcome: "lose", text: `${faceless} of 4 faceless marks forecast. The row did not keep to the weather: warmth still counts (sun three, rain one, frost silent), but a day the council tapped hard or poured is two louder. The sap drops beside the days said so.${losses + 1 >= 2 ? " Next sitting, Fenn will underline what each column usually holds." : ""}` }), api.reducedMotion ? 500 : 1700);
        return;
      }
      if (ph === 0) {
        say("Fenn", c === n ? "“Dawn. East face. Strength two. Again.” She is almost smiling."
          : c ? `${c} of ${n}. “Close. The storms keep it in. Write that down.”` : "“Nothing. Then we were reading the wrong thing.”");
        if (stage === 0) { finish(); return; }
        later(() => {
          const card = document.createElement("div");
          card.className = P + "intro";
          card.innerHTML = `<div class="${P}slip" role="dialog" aria-label="Autumn">
 ${kit.chapter(art, "chapter-4-autumn")}<h2>Autumn</h2>
 <p class="${P}beat">A leaf the size of a country has fallen past the Scroll House. The drum has turned on, and the tremors keep new hours: something now shakes the world at noon, every noon, from the north.</p>
 ${art.has("scroll-faceless-row") ? `<img class="${P}pic" src="${art.url("scroll-faceless-row")}" alt="A stretch of scroll: the recorded tremors above, and a row of small marks with no face below" width="1600" height="420">` : ""}
 <p class="${P}beat">And under the hours Fenn has begun a row of her own, in chalk: small marks that come from no face of the Trunk at all.</p>
 <p class="${P}goal">Six cells this time, and two in the <b style="color:${CHALK}">faceless</b> column. ${tally.correct} right so far; ${WIN_AT} of 9 wins the sitting. The faceless marks are not counted: they go on a map.</p>
 <div class="${P}key"><kbd>L</kbd><span>Fenn's lamp: light every day with the same weather as the cell you are on (${lamps} left)</span><kbd>1 2 3 · 0</kbd><span>a faceless mark has no face: give its strength only, or none</span></div>
 <button class="${P}seal" type="button">Turn the drum</button></div>`;
          wrap.appendChild(card);
          const b = card.querySelector("button");
          on(b, "click", () => { card.remove(); startPhase(1); geom(); panel(); draw(); say("Fenn", "“It is not a god. Or it is a god with a routine.”"); pick(0); });
          b.focus({ preventScroll: true });
        }, api.reducedMotion ? 600 : 1800);
      } else {
        say("Fenn", faceless === 2 ? "looks at the chalk column for a long time. “Warm days, loud. Cold days, faint. It answers us.”" : faceless ? "scrapes one chalk mark off the drum with her thumbnail, and leaves the other." : "scrapes both chalk marks off the drum. “Then it was my tired hand.”");
        later(sounding, api.reducedMotion ? 600 : 2000);
      }
    }
    // ---- the long puzzle's last step: where will the second tap land? ----
    let tapRight = null;
    function sounding() {
      if (!art.has("scroll-pulse-map-blank")) { finish(); return; }
      const complete = faceless === 2 && art.has("scroll-pulse-map");
      const card = document.createElement("div");
      card.className = P + "intro";
      const cells = [];
      for (let j = 0; j < MAP.rows; j++) for (let i = 0; i < MAP.cols; i++) cells.push(`<button type="button" data-i="${i}" data-j="${j}" aria-label="Plate ${i + 1} across, ${j + 1} down from the Crown" style="${plateBox([i, j])}"></button>`);
      card.innerHTML = `<div class="${P}slip" role="dialog" aria-label="The Pulse map">
 <h2>The Pulse map</h2>
 <p class="${P}beat">${complete ? "Both chalk marks held. Fenn shades the last plates and the map closes on itself: the marks gather under Highridge, around one plate. She rings it." : `The map is ${faceless ? "one plate" : "two plates"} short. The shading gathers under Highridge, but nothing is ringed.`} If something ever knocks on the Trunk from outside, she says, it will knock three times, and the second knock will land where the wood is thinnest.</p>
 <p class="${P}goal"><b>Choose the plate</b> the city should clear before then.${complete ? "" : " The marks lie all round it."}</p>
 <div class="${P}pick"><img src="${art.url(complete ? "scroll-pulse-map" : "scroll-pulse-map-blank")}" alt="The Pulse map">${complete ? "" : shaded(true).map((x) => `<i style="${plateBox(x.q)}"></i>`).join("")}${cells.join("")}</div>
 <p class="${P}beat ${P}res" aria-live="polite">Tap a plate, or move with the arrow keys and press Enter.</p></div>`;
      wrap.appendChild(card);
      const btns = [...card.querySelectorAll(`.${P}pick button`)];
      const at = (i, j) => btns[j * MAP.cols + i];
      let done = false;
      btns.forEach((b) => {
        on(b, "click", () => {
          if (done) return; done = true;
          tapRight = +b.dataset.i === MAP.tap[0] && +b.dataset.j === MAP.tap[1];
          b.classList.add(P + (tapRight ? "hit" : "miss")); if (!tapRight) at(...MAP.tap).classList.add(P + "hit");
          card.querySelector("." + P + "res").textContent = tapRight ? "Fenn nods once, and writes the plate's number on her wrist." : "Fenn shakes her head and touches another plate. “Here. I think. I am not sure.”";
          api.store.set("map", { marks: faceless, plate: tapRight });
          later(() => { card.remove(); finish(); }, api.reducedMotion ? 500 : 1600);
        });
        on(b, "keydown", (e) => {
          const i = +b.dataset.i, j = +b.dataset.j;
          const to = e.key === "ArrowRight" ? at(Math.min(MAP.cols - 1, i + 1), j) : e.key === "ArrowLeft" ? at(Math.max(0, i - 1), j) : e.key === "ArrowDown" ? at(i, Math.min(MAP.rows - 1, j + 1)) : e.key === "ArrowUp" ? at(i, Math.max(0, j - 1)) : null;
          if (to) { e.preventDefault(); to.focus(); }
        });
      });
      at(1, 5).focus({ preventScroll: true });
    }
    function finish() {
      const { correct, fine } = tally, scholars = correct * 2 + fine, won = correct >= NEED;
      if (stage === 1 && faceless === 2) shared.set("pulse_map_whole", true);
      if (stage === 0) {
        api.store.set("losses", won ? 0 : losses + 1);
        later(() => api.end(won
          ? { outcome: "win", text: `${correct} of 3 forecasts right, ${fine} of them fine. The Scroll House +${scholars}. Dawn from the east, dusk from the west, and nothing on a storm day. Fenn: “It is not a god. Or it is a god with a routine.” In the backyard, a squirrel keeps its hours.` }
          : { outcome: "lose", text: `${correct} of 3 right; the Battlements laugh at the scribes. The pattern was on the drum: dawn east at strength two, dusk west at strength one, and nothing at all on storm days.${losses + 1 >= 2 ? " Next sitting, Fenn will underline what each column usually holds." : ""}` }), 1300);
        return;
      }
      api.store.set("correct", correct);
      api.store.set("losses", won ? 0 : losses + 1);
      say("Fenn", won ? "quietly: “It keeps hours. Like us.”" : "turns the drum back and reads it again.");
      const pulse = tapRight == null ? "" : ` The faceless row: ${faceless} of 2 marks held${faceless === 2 ? ", and the Pulse map is whole" : ""}. ${tapRight ? "The plate you chose is the one the second tap will find; the city has time to clear it." : "The second tap will land on a plate nobody cleared."} Nothing in the backyard explains that row.`;
      later(() => api.end(won
        ? { outcome: "win", text: `${correct} of 6 forecasts right, ${fine} of them fine. The Scroll House +${scholars}. Fenn can now say when the world will shake, if not why. In the backyard, a squirrel keeps its hours.${pulse}` }
        : { outcome: "lose", text: `${correct} of 6 right; the Battlements laugh at the scribes, and the Scroll House gains only ${scholars}. The pattern was on the drum: dawn east, dusk west, nothing in storms; in autumn a noon from the north, rain days only noon, and every fourth dusk empty.${pulse}${losses + 1 >= 2 ? " Next sitting, Fenn will underline what each column usually holds." : ""}` }), 1300);
    }
    on(sealBtn, "click", seal);
    const startBtn = wrap.querySelector(`.${P}intro .${P}seal`);
    on(startBtn, "click", () => {
      wrap.querySelector("." + P + "intro").remove();
      say("Fenn", gentle ? "has underlined what each column usually holds. “Look at the dawns first.”" : "in the margin: “Look at the dawns first. Then look at the storms.”");
      if (stage === 1) say("Fenn", "“It is not a god. Or it is a god with a routine.” A runner's note is pinned to the drum for each post that listens.");
      if (stage === 2) say("Fenn", "“It has no face. I gave it one twice, to make it fit. I scraped them off.” The sap drops are the council's days.");
      geom(); panel(); draw();
      pick(0);
    });
    startBtn.focus({ preventScroll: true });
    // cut the sheets once: twelve glyphs, the none mark and the weather marks, as light-on-nothing images
    (async () => {
      if (!art.has("scroll-glyph-set")) return;
      const out = { g: {}, w: {}, none: "" };
      const cut = async (id, crop, w, h, floor) => { const u = await kit.blobUrl(kit.lumaAlpha(await kit.raster(art, id, w, h, crop), floor)); if (u) urls.push(u); return u; };
      const faces = ["E", "S", "W", "N"];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) out.g[faces[i] + (j + 1)] = await cut("scroll-glyph-set", [150 + i * 210 + 4, 120 + j * 118 + 4, 202, 110], 202, 110, 95);
      out.none = await cut("scroll-glyph-set", [1069, 161, 60, 60], 60, 60, 95);
      if (art.has("scroll-weather-marks")) { const ws = ["sun", "rain", "storm", "frost"]; for (let i = 0; i < 4; i++) out.w[ws[i]] = await cut("scroll-weather-marks", [118 + i * 188 - 52, 60, 104, 104], 72, 72, 110); }
      if (dead) { urls.forEach((u) => URL.revokeObjectURL(u)); return; }
      if (Object.values(out.g).every(Boolean)) { ART = out; draw(); }
    })();
    let rw = 0;
    const ro = new ResizeObserver(() => { const w = wrap.getBoundingClientRect().width; if (Math.abs(w - rw) > 2) { rw = w; geom(); draw(); } });
    ro.observe(wrap);
    draw(); panel();

    return { unmount() { dead = true; urls.forEach((u) => URL.revokeObjectURL(u)); cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); ro.disconnect(); wrap.remove(); } };
  }
}

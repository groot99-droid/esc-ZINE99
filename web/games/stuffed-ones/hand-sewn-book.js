// The Stuffed Ones: The Hand-Sewn Book (1D, translation), drawn as blackwork embroidery on linen.
//
// DESIGN.md section 11 "The Hand-Sewn Book", appearance 3 (`a5_book_3`): the world runs, 180
// seconds with the toys closing in (a ring of glows tightening at the page's edge). Three spreads
// in rising difficulty, as the design's difficulty table: S1 four strips and one rule, S3 six strips
// and two rules, S5 eight slots, three rules and one decoy strip that fits no slot. Each strip's
// thread colour is its role (red an act, black a thing, white who) and a slot takes only its
// colour. The order rules arrive one per spread here: a needle glyph comes before a thread glyph
// (directly before: the needle leads its thread); a knot glyph ends a line; a glyph doubled means
// "many" (it follows the glyph it repeats). When every slot holds a strip legally, the spread pulls
// taut and its translation appears in the journal hand.
//
// Actions: Place a strip (drag, or tap then tap; arrows and Enter). Read the walls (from spread III;
// R): turn to the glyphs stitched into the ritual room's walls to learn the names of this spread's
// glyphs, while the glows creep 8 seconds closer. Mabel's sampler (from spread V; H, twice): the
// design's one solved line, shown here as one strip set in its place. Outcomes: all three read (win),
// one or two read (done), none (lose).
//
// Translations are the spread table's lines, verbatim from the vault:
// creative-writing/vault/02_Novels/01_The_Stuffed_Ones.md (ch 11 and ch 12; DESIGN.md sections 3, 11).
// The opening quotes ch 11 as DESIGN.md section 3 item 12 does; Marcus's line is DESIGN.md
// section 6's (added). Other narrative lines are written for the game (refine additions list).
//
// The strips are the game's blackwork glyph cards (api.art): who in white thread, a thing in black,
// an act in red, as the cards are sewn. A card whose glyph you cannot read yet has a scrap tacked
// over its word. Reading the walls shows the whole stitched wall, all thirty glyphs. The segment
// glyphs stay as the fallback.
//
// Phase 2 (DESIGN.md section 21, built 2026-11-16): three stages. Teach: spread I alone, colour is
// role, no clock. Test: spreads III and V under the clock: order rules, the decoy, and a missing
// strip (spread III's act is gone; sew it from two glyphs you know: needle and mouth make feed).
// Twist: every strip has a back. Spreads I and III lie solved; turn each strip over and Ruth's line
// is there in a child's red wool, each back numbered with her own strokes, and read from the other
// side: her order runs right to left. A back whose mark you have met elsewhere (the Parlour cloth,
// your own pattern in Stuffing, the tapestry in the Labyrinth: api.shared "glossary") names itself;
// the walls name the rest, at the usual cost. Ruth's two lines are written for the game.
//
// Phase 3 (DESIGN.md section 21, built 2026-11-16): the twist turns three backs, spreads I, III and V,
// which are lines 1, 3 and 5 of Ruth's sentence, the selvage; each back pulled taut is a piece of it
// (stages.js). On a later playthrough (api.shared "turns") the backs are readable from the first
// sitting: spread I's back shows through the linen in the teach stage. And if a page was sewn in The
// Page (api.shared "page"), the twist ends on it: a page with no front, numbered with the sewer's
// strokes, read right to left like Ruth's. It is the line the last player wrote.
import { artKit } from "./art-kit.js";
import { runStages, stagePicker, linkNote, LINES } from "./stages.js";
const PRE = "stuffed-ones-hand-sewn-book-";
const C = { linen: "#e3d6bb", linenD: "#cdbd9c", silk: "#1d1712", red: "#b8322a", white: "#f6f1e4", black: "#1d1712",
  cedar: "#6b4a32", cedarD: "#3d2a1d", amber: "#e39a2d", ink: "#2a211b", moss: "#4f6b2c" };

// Glyphs on a 4 x 4 counted grid: [x1, y1, x2, y2] segments of black silk.
const GLYPHS = {
  needle: { name: "needle", art: "glyph-09-needle", segs: [[0, 2, 3, 2], [3, 2, 3.5, 1.5], [3.5, 1.5, 4, 2], [4, 2, 3.5, 2.5], [3.5, 2.5, 3, 2]] },
  thread: { name: "thread", art: "glyph-10-thread", segs: [[0, 2, 1, 1], [1, 1, 2, 3], [2, 3, 3, 1], [3, 1, 4, 2]] },
  knot: { name: "knot", art: "glyph-11-knot", segs: [[0, 3, 2, 1], [2, 1, 4, 3], [1, 2, 2, 3], [2, 3, 3, 2]] },
  mouth: { name: "mouth", art: "glyph-12-mouth", segs: [[1, 1, 3, 1], [3, 1, 4, 2], [4, 2, 3, 3], [3, 3, 1, 3], [1, 3, 0, 2], [0, 2, 1, 1], [1, 2, 3, 2], [2, 3, 2, 4]] },
  filling: { name: "filling", art: "glyph-19-filling", segs: [[1, 0, 3, 0], [3, 0, 4, 1], [4, 1, 3, 2], [3, 2, 1, 2], [1, 2, 0, 1], [0, 1, 1, 0], [0, 3, 4, 3], [0, 4, 4, 4], [1, 2.5, 1, 4], [2, 2.5, 2, 4], [3, 2.5, 3, 4]] },
  they: { name: "they", art: "glyph-01-they", segs: [[1, 0, 1, 1.5], [0, 0.7, 2, 0.7], [1, 1.5, 0, 2.2], [1, 1.5, 2, 2.2], [3, 2, 3, 3.5], [2, 2.7, 4, 2.7], [3, 3.5, 2, 4], [3, 3.5, 4, 4]] },
  we: { name: "we", art: "glyph-02-we", segs: [[2, 0, 2, 1.5], [1, 0.7, 3, 0.7], [2, 1.5, 1, 2.2], [2, 1.5, 3, 2.2], [1, 2.6, 3, 2.6], [3, 2.6, 4, 3.3], [4, 3.3, 3, 4], [3, 4, 1, 4], [1, 4, 0, 3.3], [0, 3.3, 1, 2.6]] },
  it: { name: "it", art: "glyph-03-it", segs: [[1, 0, 3, 0], [3, 0, 4, 1], [4, 1, 3, 2], [3, 2, 1, 2], [1, 2, 0, 1], [0, 1, 1, 0], [2, 2.4, 0.6, 4], [2, 2.4, 3.4, 4], [2, 3, 1.3, 4], [2, 3, 2.7, 4]] },
  summon: { name: "summon", art: "glyph-23-summon", segs: [[1, 0, 3, 0], [3, 0, 4, 0.7], [4, 0.7, 3, 1.4], [3, 1.4, 1, 1.4], [1, 1.4, 0, 0.7], [0, 0.7, 1, 0], [2, 1.4, 2, 2], [0, 4, 4, 4], [1.3, 4, 1.3, 2.6], [1.3, 2.6, 2.7, 2.6], [2.7, 2.6, 2.7, 4]] },
  feed: { name: "feed", art: "glyph-25-feed", segs: [[0, 1, 3, 1], [3, 1, 3.5, 0.5], [3.5, 0.5, 4, 1], [4, 1, 3.5, 1.5], [3.5, 1.5, 3, 1], [1, 2.6, 3, 2.6], [3, 2.6, 4, 3.3], [4, 3.3, 3, 4], [3, 4, 1, 4], [1, 4, 0, 3.3], [0, 3.3, 1, 2.6]] },
  begin: { name: "begin", art: "glyph-27-begin", segs: [[0, 0, 4, 0], [2, 0, 2, 2], [0, 2, 4, 2], [0, 4, 2, 2], [2, 2, 4, 4]] },
};
const ALL_GLYPHS = 30;
const RULES = [
  { id: "needle", text: "a needle comes right before its thread" },
  { id: "knot", text: "a knot ends the line" },
  { id: "many", text: "doubled means many: it follows what it repeats" },
];
const SPREADS = [
  { no: "I", title: "Summoned", rules: 1, slots: ["white", "red", "black", "black"],
    strips: [["they", "white"], ["summon", "red"], ["needle", "black"], ["thread", "black"]],
    text: ["They weren't made.", "They were summoned."] },
  { no: "III", title: "Fed", rules: 2, slots: ["red", "black", "white", "black", "black", "black"],
    strips: [["feed", "red"], ["mouth", "black"], ["it", "white"], ["needle", "black"], ["thread", "black"], ["knot", "black"]],
    text: ["how to feed it"] },
  { no: "V", title: "The filling", rules: 3, slots: ["white", "white", "red", "black", "black", "white", "black", "black"],
    strips: [["we", "white"], ["we", "white", true], ["begin", "red"], ["needle", "black"], ["thread", "black"], ["it", "white"], ["filling", "black"], ["knot", "black"], ["knot", "black", true]],
    text: ["We were the next filling.", "The ritual had already begun the moment we stepped inside."] },
];
const WALL_COST = 8, SAMPLER = 2, MAKE_COST = 4;
const STAGE_SPREADS = [[0], [1, 2], [0, 1, 2]], CLOCK = [0, 150, 175];
const BLURBS = ["Spread I: colour is role.", "Order rules, a decoy and a missing strip, under the clock.", "Every strip has a back."];
// the missing strip of spread III and the two glyphs it is sewn from; the radicals offered
const MISSING = { 1: "feed" }, MAKES = { feed: ["needle", "mouth"] }, RADICALS = ["thread", "needle", "they", "mouth", "knot"];
// Ruth's lines on the backs, in her order (her strokes count it); the art of each back
const BACKS = { 0: LINES[0].marks, 1: LINES[2].marks, 2: LINES[4].marks };
const RUTH = { 0: "{i} am {seven} {still}. {i} {play}.", 1: "When the {hunger} {play}s, {company} {stay}s, and {i} am {warm}.",
  2: "{unpick} the {seven}; {cut} while {mother} is {still}; {i} {go} {home}." };
const PAGE_B = [3, 6, 1, 5, 2, 4], PAGE_V = [3, 7, 1, 5, 8, 2, 6, 4];
const PIECE = { 0: 1, 1: 3, 2: 5 };
// a tally order that is neither Mabel's way nor Ruth's, for a page of n marks
const scramble = (n) => { const out = []; for (let k = 0; k < n; k++) out.push(((k * 3 + 1) % n) + 1); if (new Set(out).size !== n || out.every((v, i) => !i || out[i - 1] < v)) return Array.from({ length: n }, (_, k) => [2, 1, 3, 5, 4, 6].filter((v) => v <= n)[k] || k + 1); return out; };
const BACK_ART = { seven: "glyph-back-01-seven", play: "glyph-back-02-play", stay: "glyph-back-03-stay", warm: "glyph-back-04-warm", cold: "glyph-back-05-cold", company: "glyph-back-06-company",
  still: "glyph-back-07-still", go: "glyph-back-08-go", unpick: "glyph-back-09-unpick", cut: "glyph-back-10-cut", i: "glyph-back-11-i", mother: "glyph-back-12-mother", hunger: "glyph-back-13-hunger", home: "glyph-back-14-home" };

function kit() {
  const offs = [], timers = new Set(); let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    after(ms, fn) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); },
  };
}

// Rule check over a filled-or-partial row: returns a Set of violated rule ids and the bad slots.
function violations(row, nRules) {
  const bad = new Set(), at = new Set();
  const n = row.length;
  row.forEach((s, i) => {
    if (!s) return;
    if (nRules >= 1) {
      if (s.glyph === "needle" && !s.doubled) { const nx = row[i + 1]; if (i === n - 1 || (nx && !(nx.glyph === "thread" && !nx.doubled))) { bad.add("needle"); at.add(i); } }
      if (s.glyph === "thread" && !s.doubled) { const pv = row[i - 1]; if (i === 0 || (pv && !(pv.glyph === "needle" && !pv.doubled))) { bad.add("needle"); at.add(i); } }
    }
    if (nRules >= 2 && s.glyph === "knot" && !s.doubled && i !== n - 1) { bad.add("knot"); at.add(i); }
    if (nRules >= 3 && s.doubled) { const pv = row[i - 1]; if (i === 0 || (pv && !(pv.glyph === s.glyph && !pv.doubled))) { bad.add("many"); at.add(i); } }
  });
  return { bad, at };
}

export default { mount(root, api) { return runStages(root, api, run, BLURBS); } };

function run(root, api, flow) {
  {
    const stage = flow.stage, backMode = stage === 2;
    // a later playthrough: the backs show from the first sitting, and the page the last player sewed
    const turns = flow.S.turns(), mine = flow.S.get("page", []);
    const myPage = backMode && turns > 0 && Array.isArray(mine) && mine.length >= 3 ? mine.slice(0, 6) : null;
    const SPX = myPage ? SPREADS.concat([{ no: "VII", title: "A page with no front", rules: 0, page: true, slots: myPage.map(() => "red"),
      strips: myPage.map(() => ["needle", "red"]), text: ["A page with no front.", "Nobody sewed a front to it. The stitches are the size of yours."] }]) : SPREADS;
    const seq = myPage ? STAGE_SPREADS[stage].concat([3]) : STAGE_SPREADS[stage];
    const SP = (k = si) => SPX[seq[k]];
    const K = kit();
    const rng = api.rng("stuffed-ones/book");
    const A = artKit(api), ART = A.has("glyph-09-needle");
    const WALL_FRONT = A.art.list("pieces").filter((id) => /^glyph-\d/.test(id)).sort().slice(0, ALL_GLYPHS);
    const WALL_IDS = backMode ? Object.values(BACK_ART).filter((id) => A.has(id)) : WALL_FRONT;
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    const linenCss = `background-color:${C.linen};background-image:repeating-linear-gradient(0deg,rgba(120,95,60,.11) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(120,95,60,.11) 0 1px,transparent 1px 3px)`;
    const zig = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M0 6 L3 2 L6 6 L9 2 L12 6' fill='none' stroke='%231d1712' stroke-width='1.4'/%3E%3C/svg%3E")`;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.cedarD};overflow:hidden;touch-action:none;outline:none;font-family:Karla,Arial,sans-serif}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}acts{position:absolute;display:flex;gap:8px;z-index:2;flex-wrap:wrap;justify-content:flex-end}
.${PRE}acts button{font:600 14px Karla,Arial,sans-serif;${linenCss};color:${C.ink};border:2px solid ${C.silk};outline:1px dashed ${C.silk};outline-offset:-6px;padding:9px 14px;min-height:44px;cursor:pointer}
.${PRE}acts button small{font:12px Karla,Arial,sans-serif;opacity:.8;margin-left:4px}
.${PRE}acts button:hover:not(:disabled){outline-style:solid}
.${PRE}acts button:disabled{opacity:.45;cursor:not-allowed}
.${PRE}acts button[hidden]{display:none}
.${PRE}make{position:absolute;left:50%;transform:translateX(-50%);bottom:74px;width:min(420px,calc(100% - 24px));box-sizing:border-box;${linenCss};color:${C.ink};border:2px solid ${C.silk};outline:1px dashed ${C.red};outline-offset:-6px;padding:12px 14px;z-index:3;box-shadow:0 6px 18px rgba(0,0,0,.45);font:14px/1.4 Karla,Arial,sans-serif}
.${PRE}make[hidden]{display:none}
.${PRE}make b{display:block;font:italic 400 18px 'IM Fell English',Georgia,serif}
.${PRE}make div{display:flex;gap:6px;margin-top:8px;justify-content:space-between}
.${PRE}make button{flex:1;min-width:0;min-height:64px;padding:4px 2px;background:#ece2cb;border:1.5px solid ${C.silk};cursor:pointer;font:600 12px Karla,Arial,sans-serif;color:${C.ink};display:flex;flex-direction:column;align-items:center;gap:2px}
.${PRE}make button[aria-pressed=true]{outline:3px solid ${C.red};outline-offset:-3px;background:#fff}
.${PRE}make canvas{position:static!important;width:auto;height:auto}
.${PRE}beat{position:absolute;left:50%;transform:translateX(-50%);bottom:76px;width:min(500px,calc(100% - 32px));box-sizing:border-box;${linenCss};color:${C.ink};border:2px solid ${C.silk};padding:16px 18px 12px;font:15px/1.45 Karla,Arial,sans-serif;z-index:3;transition:opacity .5s;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.${PRE}beat::before{content:"";position:absolute;left:8px;right:8px;top:4px;height:8px;background:${zig} repeat-x}
.${PRE}beat b{font:italic 400 18px 'IM Fell English',Georgia,serif;display:block}
.${PRE}beat q{font:italic 17px 'IM Fell English',Georgia,serif;quotes:"“" "”"}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(29,23,18,.66);z-index:4;padding:16px;overflow:auto}
.${PRE}card{width:min(480px,100%);${linenCss};color:${C.ink};border:3px solid ${C.silk};padding:26px 24px 20px;position:relative}
.${PRE}card::before,.${PRE}card::after{content:"";position:absolute;left:10px;right:10px;height:8px;background:${zig} repeat-x}
.${PRE}card::before{top:8px}.${PRE}card::after{bottom:8px}
.${PRE}card h2{margin:0;font:400 34px/1.05 'IM Fell English',Georgia,serif}
.${PRE}card .${PRE}q{margin:8px 0 6px;font:italic 16px/1.4 'IM Fell English',Georgia,serif;opacity:.88}
.${PRE}card .${PRE}goal{margin:0 0 12px;font:15px/1.45 Karla,Arial,sans-serif}
.${PRE}legend{border-top:1.5px dashed ${C.silk};border-bottom:1.5px dashed ${C.silk};padding:6px 0}
.${PRE}legend div{display:grid;grid-template-columns:44px 1fr auto;gap:10px;align-items:center;font:15px Karla,Arial,sans-serif;padding:4px 0}
.${PRE}legend i{display:block;height:6px;border-radius:3px}
.${PRE}legend kbd{font:600 12px ui-monospace,Menlo,monospace;border:1px solid ${C.silk};padding:1px 6px;background:${C.white}}
.${PRE}card button{font:600 15px Karla,Arial,sans-serif;background:${C.silk};color:${C.linen};border:0;padding:11px 24px;cursor:pointer;margin-top:14px;min-height:44px}
.${PRE}card button:focus-visible{outline:3px solid ${C.red};outline-offset:2px}
.${PRE}card canvas{position:static;width:auto;height:auto}
.${PRE}card .${PRE}plate{margin:0 0 10px;border:2px solid ${C.silk}}
.${PRE}card label{font:14px Karla,Arial,sans-serif;display:flex;gap:8px;align-items:center;margin-top:10px}
.${PRE}card .${PRE}kind{margin:10px 0 0;font:italic 15px 'IM Fell English',Georgia,serif;color:${C.red}}
</style><canvas aria-label="An open hand-sewn book: loose glyph strips on the left page, coloured slots on the right"></canvas>
<div class="${PRE}acts"><button type="button" data-a="walls" hidden>Read the walls <small>R · −${WALL_COST} s</small></button><button type="button" data-a="sampler" hidden>Mabel's sampler <small>H · ×${SAMPLER}</small></button><button type="button" data-a="make" hidden>Make a strip <small>M</small></button></div>
<div class="${PRE}make" hidden role="group" aria-label="Make the missing strip"><b>The act is missing from this page.</b><span>Sew it from two glyphs you know: what does the feeding, over what is fed. A wrong pair costs ${MAKE_COST} s.</span><div></div></div>
<div class="${PRE}beat" aria-live="polite" style="opacity:0"></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const acts = wrap.querySelector("." + PRE + "acts"), beatEl = wrap.querySelector("." + PRE + "beat");
    const wallsBtn = acts.querySelector('[data-a="walls"]'), sampBtn = acts.querySelector('[data-a="sampler"]'), makeBtn = acts.querySelector('[data-a="make"]');
    const makeEl = wrap.querySelector("." + PRE + "make");
    let picked = [];
    function syncMake() { makeEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(picked.includes(b.dataset.g)))); }

    let started = false, over = false, speed = 1, total = CLOCK[stage] || 180, left = total, idle = 0;
    let missing = null, flips = 0, page = { said: false }, linkT = null;
    const namedBack = new Set();
    const knowsBack = (w) => namedBack.has(w) || flow.S.knows(w);
    const cap1 = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    const ruthLine = (k = si) => cap1((seq[k] === 3 ? myPage.map((w) => (knowsBack(w) ? (w === "i" ? "I" : w === "mother" ? "Mother" : w) : "▒▒")).join(" ") + "." : RUTH[seq[k]]).replace(/\{(\w+)\}/g, (_, w) => (knowsBack(w) ? (w === "i" ? "I" : w === "mother" ? "Mother" : w) : "▒▒")));
    let tautStart = 0, si = 0, strips = [], row = [], taut = 0, read = [];
    const named = new Set(["they", "needle", "thread", "summon"]);
    let wallT = 0, wallNew = [];
    let kbUsed = false, drag = null, held = null, cursor = 0, msg = "", msgT = 0, msgCol = C.red, shakeSlot = -1, shakeT = 0, hintPair = null;
    let samplers = SAMPLER, wallsUsed = 0, lastViol = 0, creep = 0, marcusSaid = false, edgeSaid = false, hover = null;
    const pops = [];
    let L = null, beatTimer = 0;

    function beat(title, text, quote, ms = 5000) {
      beatEl.innerHTML = "";
      const b = document.createElement("b"); b.textContent = title; beatEl.appendChild(b);
      if (quote) { const q = document.createElement("q"); q.textContent = quote; beatEl.appendChild(q); if (text) beatEl.appendChild(document.createTextNode(" ")); }
      if (text) beatEl.appendChild(document.createTextNode(text));
      beatEl.style.opacity = 1;
      clearTimeout(beatTimer); beatTimer = K.after(ms, () => (beatEl.style.opacity = 0));
    }
    function say(m, col = C.red) { msg = m; msgT = performance.now(); msgCol = col; }
    function pop(text, x, y, col) { pops.push({ text, x, y, col, t0: performance.now() }); }

    function loadSpread(k) {
      const sp = SP(k);
      row = sp.slots.map(() => null);
      missing = stage === 1 ? MISSING[seq[k]] || null : null;
      strips = sp.strips.filter(([glyph]) => glyph !== missing).map(([glyph, colour, doubled], i) => ({ i, glyph, colour, doubled: !!doubled, slot: null, rx: rng(), ry: rng(), rot: (rng() - 0.5) * 0.3 }));
      for (let i = strips.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [strips[i].rx, strips[j].rx] = [strips[j].rx, strips[i].rx]; }
      taut = 0; tautStart = 0; held = null; cursor = 0; idle = 0; hintPair = null;
      if (backMode) {
        // the front lies solved, as you left it; the backs are still face down
        if (sp.page) strips.forEach((s, q) => { s.slot = q; row[q] = s; });
        else solution().forEach((s, q) => { s.slot = q; row[q] = s; });
        // the decoy has no place in a solved line: it stays off the page
        strips = strips.filter((s) => s.slot !== null); strips.forEach((s, q) => (s.i = q));
        page = { said: false };
        if (seq[k] === 1) PAGE_B.forEach((tl, q) => { row[q].tally = tl; row[q].back = BACKS[1][tl - 1]; });
        if (seq[k] === 2) PAGE_V.forEach((tl, q) => { row[q].tally = tl; row[q].back = BACKS[2][tl - 1]; });
        if (sp.page) scramble(myPage.length).forEach((tl, q) => { row[q].tally = tl; row[q].back = myPage[tl - 1]; row[q].flipped = true; });
      }
      layout(); syncButtons();
    }

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight, wide = W >= 760;
      const pad = 14;
      const book = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 - (wide ? 0 : 58) };
      let lp, rp;
      if (wide) { const half = book.w / 2; lp = { x: book.x, y: book.y, w: half, h: book.h }; rp = { x: book.x + half, y: book.y, w: half, h: book.h }; }
      else { const hh = Math.min(book.h * 0.56, 440); rp = { x: book.x, y: book.y, w: book.w, h: hh }; lp = { x: book.x, y: book.y + hh, w: book.w, h: book.h - hh }; }
      const sp = SP();
      const n = sp.slots.length;
      const ASP = ART ? 320 / 220 : 1;
      const perRow = !wide && n > 4 ? Math.ceil(n / 2) : n;
      const sz = Math.round(Math.max(36, Math.min(84, (rp.w - 40) / perRow - 6, rp.h * (wide ? 0.2 : 0.125 * (n > 4 ? 1 : 1.5)))));
      const sh = Math.round(sz * ASP);
      const gap = Math.min(12, sz * 0.16);
      const rowW = perRow * sz + (perRow - 1) * gap;
      const slotY = rp.y + Math.max(wide ? 120 : 112, wide ? rp.h * 0.26 : 0);
      const slotPos = sp.slots.map((_, k) => ({ x: rp.x + (rp.w - rowW) / 2 + (k % perRow) * (sz + gap), y: slotY + Math.floor(k / perRow) * (sh + 12) }));
      const slotBottom = slotY + Math.ceil(n / perRow) * (sh + 12) - 12;
      const cols = Math.max(2, Math.min(Math.floor((lp.w - 40) / (sz * 1.3)), Math.ceil(Math.sqrt(strips.length * lp.w / Math.max(1, lp.h)))));
      const rows = Math.ceil(strips.length / cols);
      const cw = (lp.w - 40) / cols, ch = (lp.h - 70) / rows;
      const order = [...strips].sort((a, b) => a.rx - b.rx);
      order.forEach((s, k) => {
        const c = k % cols, r = Math.floor(k / cols);
        s.hx = lp.x + 20 + c * cw + (cw - sz) / 2 + (s.ry - 0.5) * Math.max(0, cw - sz) * 0.6;
        s.hy = lp.y + 34 + r * ch + (ch - sh - 16) / 2 + ((s.rx * 7 % 1) - 0.5) * Math.max(0, ch - sh - 16) * 0.5;
      });
      L = { W, H, wide, book, lp, rp, sz, sh, slotPos, slotBottom };
      strips.forEach((s) => { if (s.slot !== null) { s.x = slotPos[s.slot].x; s.y = slotPos[s.slot].y; } else { s.x = s.hx; s.y = s.hy; } });
      if (wide) { acts.style.right = (W - rp.x - rp.w + 18) + "px"; acts.style.bottom = "30px"; acts.style.left = "auto"; }
      else { acts.style.right = "14px"; acts.style.left = "14px"; acts.style.bottom = "10px"; acts.style.justifyContent = "center"; }
    }

    // ---- drawing ---------------------------------------------------------------------------
    function glyph(name, x, y, size, col = C.silk, lw) {
      const u = size / 4;
      g.strokeStyle = col; g.lineWidth = lw || Math.max(1.6, size / 14); g.lineCap = "square";
      g.beginPath();
      GLYPHS[name].segs.forEach(([a, b, c, d]) => { g.moveTo(x + a * u, y + b * u); g.lineTo(x + c * u, y + d * u); });
      g.stroke();
      g.fillStyle = "rgba(29,23,18,.25)";
      for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) g.fillRect(x + i * u - 0.6, y + j * u - 0.6, 1.2, 1.2);
    }
    function border(x, y, w, h, colour, dashed = true, lw = 2.2) {
      const col = colour === "red" ? C.red : colour === "white" ? C.white : C.black;
      if (colour === "white") { g.strokeStyle = "rgba(29,23,18,.55)"; g.lineWidth = lw + 2; g.setLineDash(dashed ? [5, 3] : []); g.strokeRect(x, y, w, h); }
      g.strokeStyle = col; g.lineWidth = lw; g.setLineDash(dashed ? [5, 3] : []); g.strokeRect(x, y, w, h); g.setLineDash([]);
    }
    function drawBack(s, x, y, sz, lift) {
      const sh = L.sh;
      g.fillStyle = lift ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.2)"; g.fillRect(x + (lift ? 7 : 3), y + (lift ? 9 : 4), sz, sh);
      const known = knowsBack(s.back);
      if (!A.draw(g, BACK_ART[s.back], x, y, sz, sh)) {
        g.fillStyle = "#d9c7a8"; g.fillRect(x, y, sz, sh); g.strokeStyle = C.red; g.lineWidth = 2; g.setLineDash([6, 4]); g.strokeRect(x + 4, y + 4, sz - 8, sh - 8); g.setLineDash([]);
        g.fillStyle = C.red; g.font = `italic ${Math.max(12, Math.round(sz * 0.2))}px 'IM Fell English',Georgia,serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(known ? s.back : "", x + sz / 2, y + sh * 0.5);
      }
      // her strokes along the top edge: the order she sewed them in
      g.fillStyle = "#e6d8bb"; g.fillRect(x + sz * 0.1, y + sh * 0.028, sz * 0.8, sh * 0.105);
      g.strokeStyle = C.red; g.lineWidth = Math.max(2, sz * 0.05); g.lineCap = "round";
      for (let n = 0; n < s.tally; n++) {
        const x0 = x + sz / 2 + (n - (s.tally - 1) / 2) * sz * 0.12, j = ((n * 7 + s.tally * 3) % 5 - 2) * sz * 0.012;
        g.beginPath(); g.moveTo(x0 + j + sz * 0.015, y + sh * 0.045); g.lineTo(x0 - j - sz * 0.015, y + sh * 0.118); g.stroke();
      }
      g.lineCap = "butt";
      if (!known) {
        g.fillStyle = "#cdbd9c"; g.fillRect(x + sz * 0.16, y + sh * 0.868, sz * 0.68, sh * 0.105);
        g.strokeStyle = C.silk; g.lineWidth = 1; g.setLineDash([2, 2]); g.strokeRect(x + sz * 0.16, y + sh * 0.868, sz * 0.68, sh * 0.105); g.setLineDash([]);
        g.fillStyle = C.silk; g.font = `700 ${Math.max(10, Math.round(sh * 0.085))}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", x + sz / 2, y + sh * 0.922);
      }
    }
    function drawStrip(s, x, y, sz, lift) {
      if (s.flipped) { drawBack(s, x, y, sz, lift); return; }
      const sh = L.sh, id = GLYPHS[s.glyph].art;
      if (ART && A.sprite(id, sz, sh)) {
        g.save();
        if (s.slot === null && !lift) { g.translate(x + sz / 2, y + sh / 2); g.rotate(s.rot * 0.6); g.translate(-x - sz / 2, -y - sh / 2); }
        g.fillStyle = lift ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.2)"; g.fillRect(x + (lift ? 7 : 3), y + (lift ? 9 : 4), sz, sh);
        A.draw(g, id, x, y, sz, sh);
        if (!named.has(s.glyph)) { // a scrap of linen tacked over the word you cannot read yet
          g.fillStyle = "#cdbd9c"; g.fillRect(x + sz * 0.2, y + sh * 0.585, sz * 0.6, sh * 0.105);
          g.strokeStyle = C.silk; g.lineWidth = 1; g.setLineDash([2, 2]); g.strokeRect(x + sz * 0.2, y + sh * 0.585, sz * 0.6, sh * 0.105); g.setLineDash([]);
          g.fillStyle = C.silk; g.font = `700 ${Math.max(10, Math.round(sh * 0.085))}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", x + sz / 2, y + sh * 0.64);
        }
        if (s.doubled) { // doubled: the same glyph sewn twice, so a second card peeps out behind and a stitched ×2
          const r = Math.max(9, sz * 0.2);
          g.fillStyle = C.silk; g.beginPath(); g.arc(x + sz - r * 0.7, y + r * 0.7, r, 0, 7); g.fill();
          g.strokeStyle = C.white; g.lineWidth = 1; g.setLineDash([2, 2]); g.beginPath(); g.arc(x + sz - r * 0.7, y + r * 0.7, r - 2.5, 0, 7); g.stroke(); g.setLineDash([]);
          g.fillStyle = C.white; g.font = `700 ${Math.round(r * 1.05)}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("×2", x + sz - r * 0.7, y + r * 0.7 + 0.5);
        }
        g.restore();
        return;
      }
      g.save();
      if (s.slot === null && !lift) { g.translate(x + sz / 2, y + sz / 2); g.rotate(s.rot); g.translate(-x - sz / 2, -y - sz / 2); }
      g.fillStyle = lift ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.18)"; g.fillRect(x + (lift ? 7 : 3), y + (lift ? 9 : 4), sz, sz);
      g.fillStyle = "#ece2cb"; g.fillRect(x, y, sz, sz);
      border(x + 3, y + 3, sz - 6, sz - 6, s.colour, true, 2.4);
      if (s.doubled) { const q = sz * 0.36; glyph(s.glyph, x + sz * 0.1, y + (sz - q) / 2, q); glyph(s.glyph, x + sz * 0.54, y + (sz - q) / 2, q); }
      else { const q = sz * 0.56; glyph(s.glyph, x + (sz - q) / 2, y + (sz - q) / 2, q); }
      g.restore();
      if (named.has(s.glyph) && !lift) {
        y += L.sh - sz;
        g.fillStyle = C.ink; g.font = "600 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "top";
        g.fillText(s.doubled ? `many ${s.glyph}s` : s.glyph, x + sz / 2, y + sz + 4);
      }
    }
    function linen(x, y, w, h) {
      g.fillStyle = C.linen; g.fillRect(x, y, w, h);
      g.fillStyle = "rgba(120,95,60,.10)";
      for (let k = 0; k < w; k += 3) g.fillRect(x + k, y, 1, h);
      for (let k = 0; k < h; k += 3) g.fillRect(x, y + k, w, 1);
    }
    function edgeBand(x, y, w) {
      g.strokeStyle = C.silk; g.lineWidth = 1.4; g.beginPath();
      for (let k = 0; k <= w - 16; k += 8) { g.moveTo(x + 8 + k, y); g.lineTo(x + 12 + k, y - 4); g.lineTo(x + 16 + k, y); }
      g.stroke();
    }
    function wrapText(t, x, y, max, lh) {
      const words = t.split(" "); let line = "";
      for (const w of words) { const s = line ? line + " " + w : w; if (g.measureText(s).width > max && line) { g.fillText(line, x, y); line = w; y += lh; } else line = s; }
      g.fillText(line, x, y);
      return y;
    }

    function draw(now) {
      if (!L) layout();
      const { W, H, lp, rp, sz, slotPos, book, wide } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sh = L.sh;
      g.fillStyle = C.cedarD; g.fillRect(0, 0, W, H);
      A.draw(g, "ground-altar", 0, 0, W, H, { cover: true, key: "bg" });
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(book.x + 6, book.y + 8, book.w, book.h);
      linen(lp.x, lp.y, lp.w, lp.h); linen(rp.x, rp.y, rp.w, rp.h);
      const gr = wide ? g.createLinearGradient(rp.x - 24, 0, rp.x + 24, 0) : g.createLinearGradient(0, lp.y - 18, 0, lp.y + 18);
      gr.addColorStop(0, "rgba(60,40,25,0)"); gr.addColorStop(0.5, "rgba(60,40,25,.35)"); gr.addColorStop(1, "rgba(60,40,25,0)");
      g.fillStyle = gr; if (wide) g.fillRect(rp.x - 24, book.y, 48, book.h); else g.fillRect(book.x, lp.y - 18, book.w, 36);
      [lp, rp].forEach((p) => { edgeBand(p.x, p.y + 18, p.w); edgeBand(p.x, p.y + p.h - 12, p.w); });
      const sp = SP();
      // right page: header with the spread and the time
      g.fillStyle = C.ink; g.textAlign = "left"; g.textBaseline = "alphabetic";
      g.font = `italic ${Math.round(Math.min(28, rp.w / 16))}px 'IM Fell English',Georgia,serif`;
      g.fillText(backMode ? `Spread ${sp.no} · the back` : `Spread ${sp.no} · ${sp.title}`, rp.x + 22, rp.y + 52);
      // the glows' distance, as a stitched bar: the pressure, always shown
      const frac = Math.max(0, left / total);
      const gloss = wide && rp.w > 560 && !backMode;
      const tbx = rp.x + 22, tby = rp.y + 66, tbw = Math.min(rp.w - 44, gloss ? 200 : 360);
      g.strokeStyle = C.silk; g.lineWidth = 1.2; g.strokeRect(tbx, tby, tbw, 12);
      const cells = Math.floor((tbw - 4) / 8);
      for (let k = 0; k < cells; k++) { if (k / cells > frac) break; g.fillStyle = frac < 0.2 ? C.red : C.silk; g.fillRect(tbx + 2 + k * 8, tby + 2, 6, 8); }
      g.font = `700 ${left < 30 * speed ? 15 : 14}px Karla,Arial,sans-serif`; g.fillStyle = left < 30 * speed ? C.red : C.ink; g.textAlign = "left";
      const pg = backMode ? `back ${si + 1} of ${seq.length}` : `spread ${si + 1} of ${seq.length}`;
      g.fillText(!stage ? "The glows are still at the door. Take your time." : rp.w > 520 ? `${Math.ceil(left)} s before the glows reach the page · ${pg}` : `${Math.ceil(left)} s to the glows · ${pg}`, tbx, tby + 30);
      // glossary, top right on wide pages
      if (gloss) {
        const gl = Object.keys(GLYPHS).filter((k) => strips.some((s) => s.glyph === k));
        g.font = "600 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.fillStyle = C.ink;
        const gs = 18, gx0 = rp.x + rp.w - 22 - gl.length * 52;
        g.textAlign = "left"; g.fillText("glossary", gx0 - 62, rp.y + 46); g.textAlign = "center";
        gl.forEach((k, i) => { const x = gx0 + i * 52 + 10; if (!(ART && named.has(k) && A.draw(g, GLYPHS[k].art, x - 4, rp.y + 22, 26, 38))) glyph(k, x, rp.y + 32, gs, C.silk, 1.4); g.fillText(named.has(k) ? k : "?", x + gs / 2, rp.y + 74); });
      }
      const { bad, at } = backMode ? { bad: new Set(), at: new Set() } : violations(row, sp.rules);
      // slots
      const shake = shakeT > 0 && !api.reducedMotion ? Math.sin(now / 25) * 5 * shakeT : 0;
      const target = drag ? slotAt(drag.x, drag.y, 20) : -1;
      slotPos.forEach((p, k) => {
        const sx = p.x + (k === shakeSlot ? shake : 0);
        const fits = drag && (backMode || sp.slots[k] === drag.s.colour);
        g.fillStyle = drag && k === target ? (fits ? "rgba(79,107,44,.25)" : "rgba(184,50,42,.2)") : "rgba(255,255,255,.18)"; g.fillRect(sx, p.y, sz, sh);
        border(sx, p.y, sz, sh, sp.slots[k], !taut, at.has(k) ? 4 : 2.6);
        if (at.has(k)) { g.fillStyle = C.red; g.font = "700 18px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText("×", sx + sz / 2, p.y - 6); }
        const focus = kbUsed && held !== null && kbList()[cursor] === "s" + k;
        if (focus || (hintPair && hintPair[1] === k)) { g.strokeStyle = C.amber; g.lineWidth = 3; g.strokeRect(sx - 5, p.y - 5, sz + 10, sh + 10); }
      });
      // rules
      let y = L.slotBottom + (wide ? 44 : 26);
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.font = `italic 16px 'IM Fell English',Georgia,serif`;
      (backMode ? [{ id: "a", text: "tap a strip to turn it over" }, { id: "b", text: "her strokes count her order: one, two, three" }, { id: "c", text: "a back is read from the other side" }] : RULES.slice(0, sp.rules)).forEach((r) => {
        const broken = bad.has(r.id);
        g.fillStyle = broken ? C.red : C.ink;
        g.fillText(`${broken ? "×" : "·"}  ${r.text}`, rp.x + 26, y); y += 22;
      });
      // a later playthrough: Ruth's red wool shows through the linen from the first sitting
      if (stage === 0 && turns) {
        const bw = Math.min(46, (rp.w - 80) / 5), bh = bw * 320 / 220, n = BACKS[0].length, x0 = rp.x + rp.w - 30 - n * (bw + 6);
        g.globalAlpha = 0.5;
        BACKS[0].slice().reverse().forEach((w, k) => A.draw(g, BACK_ART[w], x0 + k * (bw + 6), y - 18, bw, bh));
        g.globalAlpha = 1; g.font = "italic 13px 'IM Fell English',Georgia,serif"; g.fillStyle = C.red; g.textAlign = "right";
        g.fillText("red wool, through the linen", rp.x + rp.w - 30, y + bh - 6); g.textAlign = "left";
        y += bh - 10;
      }
      g.font = "14px Karla,Arial,sans-serif"; g.fillStyle = C.ink;
      g.fillStyle = C.red; g.fillText("red", rp.x + 26, y + 4); let xx = rp.x + 26 + g.measureText("red").width;
      g.fillStyle = C.ink; const rest = backMode ? " wool, every back: it fits any slot" : missing ? ": an act (missing: Make it) · black: a thing · white: who" : ": an act · black: a thing · white: who"; g.fillText(rest, xx, y + 4);
      y += 12;
      // translation in the journal hand
      if (taut > 0) {
        g.globalAlpha = Math.min(1, taut);
        g.fillStyle = C.ink; g.font = `italic ${Math.round(Math.min(26, rp.w / 18))}px 'IM Fell English',Georgia,serif`;
        let ty = Math.max(y + 36, Math.min(rp.y + rp.h - 30 - sp.text.length * 32, y + 80));
        (backMode ? [ruthLine()] : sp.text).forEach((t, i) => { g.fillStyle = backMode ? C.red : i ? "rgba(42,33,27,.78)" : C.ink; ty = wrapText(t, rp.x + 30, ty, rp.w - 60, 28) + 32; });
        g.globalAlpha = 1;
      }
      if (msg && now - msgT < 2600) { g.fillStyle = msgCol; g.textAlign = "center"; g.font = "600 15px Karla,Arial,sans-serif"; g.fillText(msg, rp.x + rp.w / 2, slotPos[0].y - 26); }
      // left page
      g.fillStyle = "rgba(42,33,27,.85)"; g.font = "italic 15px 'IM Fell English',Georgia,serif"; g.textAlign = "left"; g.textBaseline = "alphabetic";
      g.fillText(backMode ? (sp.page ? "where the front should be:" : "the front, as Mabel sewed it:") : "loose strips", lp.x + 22, backMode ? lp.y + 54 : lp.y + lp.h - 22);
      if (backMode) { g.font = `italic ${Math.round(Math.min(24, lp.w / 16))}px 'IM Fell English',Georgia,serif`; g.fillStyle = C.ink; let ty = lp.y + 92; sp.text.forEach((t) => { ty = wrapText(t, lp.x + 26, ty, lp.w - 52, 28) + 30; }); g.font = "14px Karla,Arial,sans-serif"; g.fillStyle = "rgba(42,33,27,.8)"; wrapText(`Turned: ${strips.filter((q) => q.flipped).length} of ${strips.length}. Drag a strip onto another to change their places.`, lp.x + 26, Math.min(lp.y + lp.h - 44, ty + 8), lp.w - 52, 18); }
      strips.forEach((s) => {
        if (drag && drag.s === s) return;
        drawStrip(s, s.x, s.y, sz);
        const kb = kbUsed && held === null && kbList()[cursor] === "t" + s.i;
        const hov = hover === s && held === null && !drag && !taut;
        if (held === s.i || kb || hov || (hintPair && hintPair[0] === s.i)) { g.strokeStyle = held === s.i ? C.red : hov ? C.ink : C.amber; g.lineWidth = held === s.i ? 3 : 2; g.strokeRect(s.x - 5, s.y - 5, sz + 10, sh + 10); }
      });
      if (drag) drawStrip(drag.s, drag.x - sz / 2, drag.y - sh / 2, sz, true);
      if (wallT > 0) drawWall(now);
      // the toys closing in: a ring of warm glows tightening at the page edge
      const t = stage ? Math.min(1, 1 - left / total + creep) : 0.04;
      const inset = 4 + t * Math.min(W, H) * 0.26;
      const n = 22;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + (api.reducedMotion ? 0 : now / 9000);
        const rx = W / 2 - inset, ry = H / 2 - inset;
        const gx = W / 2 + Math.cos(a) * rx * 1.05, gy = H / 2 + Math.sin(a) * ry * 1.05;
        const rr = 16 + t * 26;
        const rg = g.createRadialGradient(gx, gy, 1, gx, gy, rr);
        rg.addColorStop(0, `rgba(227,154,45,${0.55 + t * 0.35})`); rg.addColorStop(1, "rgba(227,154,45,0)");
        g.fillStyle = rg; g.beginPath(); g.arc(gx, gy, rr, 0, 7); g.fill();
      }
      creep = Math.max(0, creep - 0.0008);
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i], a = (now - p.t0) / 1400;
        if (a >= 1) { pops.splice(i, 1); continue; }
        const rise = api.reducedMotion ? 0 : a * 24;
        g.globalAlpha = 1 - a * a; g.font = "700 15px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillStyle = p.col; g.fillText(p.text, p.x, p.y - rise); g.globalAlpha = 1;
      }
      K.frame(draw);
    }

    // the ritual room's wall: every glyph of the script, the ones just read ringed in amber
    function drawWall(now) {
      const { W, H } = L, cols = W >= 760 ? 10 : 6, rows = Math.ceil(WALL_IDS.length / cols);
      const cw = Math.floor(Math.min(64, (W - 60) / cols - 6)), chh = Math.round(cw * 320 / 220);
      const pw = cols * (cw + 6) + 24, ph = rows * (chh + 6) + 54, px = (W - pw) / 2, py = Math.max(10, (H - ph) / 2 - 20);
      g.globalAlpha = Math.min(1, wallT * 3);
      g.fillStyle = "rgba(29,23,18,.6)"; g.fillRect(0, 0, W, H);
      g.fillStyle = "#3f5167"; g.fillRect(px, py, pw, ph);
      A.draw(g, "wallpaper-6-selvage", px, py, pw, ph, { cover: true, key: "wall" });
      g.strokeStyle = C.linen; g.lineWidth = 2; g.setLineDash([6, 4]); g.strokeRect(px + 4, py + 4, pw - 8, ph - 8); g.setLineDash([]);
      g.fillStyle = C.linen; g.font = "italic 18px 'IM Fell English',Georgia,serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("the walls", W / 2, py + 22);
      WALL_IDS.forEach((id, k) => {
        const x = px + 12 + (k % cols) * (cw + 6), y = py + 40 + Math.floor(k / cols) * (chh + 6);
        if (!A.draw(g, id, x, y, cw, chh)) { g.fillStyle = "#ece2cb"; g.fillRect(x, y, cw, chh); }
        if (wallNew.some((nm) => id.endsWith("-" + nm))) { g.strokeStyle = C.amber; g.lineWidth = 3; g.strokeRect(x - 2, y - 2, cw + 4, chh + 4); }
      });
      g.globalAlpha = 1;
    }

    // ---- placing ---------------------------------------------------------------------------
    function put(s, k) {
      const sp = SP();
      if (backMode) {
        if (k === null || k === s.slot || !row[k]) { layout(); return; }
        const occ = row[k]; row[s.slot] = occ; occ.slot = s.slot; row[k] = s; s.slot = k; idle = 0;
        layout(); checkBack(); return;
      }
      if (k === null) { if (s.slot !== null) row[s.slot] = null; s.slot = null; layout(); return; }
      if (sp.slots[k] !== s.colour) {
        say(`That slot is sewn in ${sp.slots[k]}: it takes only ${sp.slots[k]} thread.`); shakeSlot = k; shakeT = 1;
        return;
      }
      const occ = row[k];
      if (occ && occ !== s) { occ.slot = s.slot; if (s.slot !== null) row[s.slot] = occ; }
      else if (s.slot !== null) row[s.slot] = null;
      row[k] = s; s.slot = k; idle = 0; hintPair = null;
      layout();
      const v = violations(row, sp.rules);
      if (v.at.has(k)) { say("It sits, but a rule is broken."); }
      else pop("set", L.slotPos[k].x + L.sz / 2, L.slotPos[k].y - 10, C.moss);
      check();
    }
    // turning a strip over; on spread I the first one turned is the glyph for seven
    function flip(s) {
      if (!backMode || taut || over || !started) return;
      if (SP().page) { say("This page has no front. It is all back.", C.ink); return; }
      if (seq[si] === 0 && !strips.some((q) => q.back)) {
        const others = strips.filter((q) => q !== s).sort((a, b) => a.slot - b.slot);
        const seen = (rest) => { const t = []; others.forEach((q, n) => (t[q.slot] = rest[n])); t[s.slot] = 2; return t.join(""); };
        const rest = [[4, 1, 3], [1, 4, 3], [3, 4, 1]].find((r) => !["4321", "1234"].includes(seen(r)));
        s.tally = 2; s.back = "seven"; namedBack.add("seven");
        others.forEach((q, n) => { q.tally = rest[n]; q.back = BACKS[0][rest[n] - 1]; });
        beat("The back", "Neat black counted stitches on the front. On the back, big crooked ones in red wool, pulled too tight: seven strokes in a row, and a mark under them. A child sewed this. Turn the others.", null, 7000);
      }
      s.flipped = !s.flipped; flips++; idle = 0;
      if (!page.said && strips.every((q) => q.flipped)) {
        page.said = true;
        if (seq[si] === 0) beat("Her strokes", "Along the top edge of each back, small strokes: one, two, three, four. She numbered her line. But you are holding her page the way Mabel reads it.", null, 7000);
      }
      syncButtons(); checkBack();
    }
    function checkBack() {
      if (taut || !strips.every((q) => q.flipped)) return;
      const t = row.map((q) => q.tally);
      if (t.every((v, i) => !i || t[i - 1] < v)) { say("It counts up, but back to front: this is how Mabel would read it."); return; }
      if (!t.every((v, i) => !i || t[i - 1] > v)) return;
      taut = 0.01; read.push(SP().no); tautStart = performance.now();
      if (PIECE[seq[si]]) { const fresh = flow.S.piece(PIECE[seq[si]]); say(fresh ? `Her line pulls taut: line ${PIECE[seq[si]]} of the selvage.` : "Her line pulls taut.", C.moss); }
      else say("The page pulls taut. Somebody sewed this who knew her marks.", C.moss);
      K.after(api.reducedMotion ? 2600 : 4400, () => {
        if (over) return;
        if (si + 1 < seq.length) { si++; loadSpread(si); spreadBeat(); }
        else win();
      });
    }
    // the missing strip: two glyphs you know, sewn together
    function make(a, b) {
      if (!missing || over || taut) return;
      const need = MAKES[missing];
      if ([a, b].sort().join() === need.slice().sort().join()) {
        const sp = SP(), def = sp.strips.find(([gl]) => gl === missing);
        strips.push({ i: strips.length, glyph: missing, colour: def[1], doubled: false, slot: null, rx: 0.5, ry: 0.5, rot: 0.08 });
        named.add(missing); say(`A ${a} over a ${b === "mouth" && !named.has("mouth") ? "round" : b}: ${missing}.`, C.moss);
        missing = null; makeEl.hidden = true; layout(); syncButtons(); wrap.focus();
      } else { left -= MAKE_COST; pop(`−${MAKE_COST} s`, L.lp.x + L.lp.w / 2, L.lp.y + L.lp.h / 2, C.red); say("Those two make nothing this line needs."); }
    }
    function check() {
      const sp = SP();
      if (row.some((x) => !x)) return;
      if (violations(row, sp.rules).bad.size) return;
      taut = 0.01; read.push(sp.no);
      tautStart = performance.now();
      say("The spread pulls taut.", C.moss);
      K.after(api.reducedMotion ? 2200 : 3600, () => {
        if (over) return;
        if (si + 1 < seq.length) { si++; loadSpread(si); spreadBeat(); }
        else win();
      });
    }
    function spreadBeat() {
      if (backMode) {
        if (si === 1) beat("Spread III, the back", "Six this time, and the glows have not stopped. Turn them, and set her strokes in her order.", null, 5500);
        if (seq[si] === 2) beat("Spread V, the back", "Eight. The decoy strip has no back worth reading; it stays off the page. Her strokes run to eight, and her line runs on from the last one.", null, 6500);
        if (seq[si] === 3) beat("A page that was not here before", "Sewn in after the others, in red wool, with strokes along the top the size of your own. No front. Read it the way you read hers.", null, 7500);
        return;
      }
      if (seq[si] === 1) beat("New glyphs, and a gap", "It, a mouth, a knot: you don't know these yet; the walls do (R), but the glows come on while your back is turned. And the red strip is gone from this page. Make it (M): two glyphs sewn together, what does the feeding over what is fed.", null, 9000);
      if (seq[si] === 2) beat("In your pocket", "Mabel's sampler from the parlour wall: one line already solved in her small, even stitches. Use it (H) to set a strip, twice. One strip on this page fits no line at all.", null, 6500);
    }
    function solution() {
      const sp = SP();
      const out = [];
      const used = new Set();
      const tryAt = (k) => {
        if (k === sp.slots.length) return violations(out, sp.rules).bad.size === 0;
        for (const s of strips) {
          if (used.has(s) || s.colour !== sp.slots[k]) continue;
          out[k] = s; used.add(s);
          if (!violations(out.slice(0, k + 1).concat(Array(sp.slots.length - k - 1).fill(null)), sp.rules).bad.size && tryAt(k + 1)) return true;
          used.delete(s); out[k] = null;
        }
        return false;
      };
      tryAt(0);
      return out;
    }
    function readWalls() {
      if (!started || over || taut || stage === 0) return;
      if (backMode) {
        const marks = [...new Set(strips.filter((q) => q.back).map((q) => q.back))];
        if (!marks.length) { say("Turn a strip over first.", C.ink); return; }
        const unknownB = marks.filter((w) => !knowsBack(w));
        if (!unknownB.length) { say("You know every mark on this page.", C.ink); return; }
        unknownB.forEach((w) => namedBack.add(w));
        wallNew = unknownB; wallT = api.reducedMotion ? 1.6 : 2.4; left -= WALL_COST; creep = Math.min(0.25, creep + 0.05); wallsUsed++;
        say(`Low on the walls, in red: ${unknownB.join(", ")}.`, C.moss);
        pop(`−${WALL_COST} s`, L.rp.x + L.rp.w / 2, L.rp.y + 110, C.red);
        syncButtons(); return;
      }
      const unknown = [...new Set(strips.map((s) => s.glyph))].filter((k) => !named.has(k));
      if (!unknown.length) { say("You already know every glyph on this page.", C.ink); return; }
      unknown.forEach((k) => named.add(k));
      wallNew = unknown; wallT = api.reducedMotion ? 1.6 : 2.4;
      left -= WALL_COST; creep = Math.min(0.25, creep + 0.05); wallsUsed++;
      say(`The walls: ${unknown.join(", ")}.`, C.moss);
      pop(`−${WALL_COST} s`, L.rp.x + L.rp.w / 2, L.rp.y + 110, C.red);
      syncButtons();
    }
    function useSampler() {
      if (!started || over || taut || backMode || seq[si] < 2 || samplers <= 0) return;
      const sol = solution();
      const k = sol.findIndex((s, k2) => s && row[k2] !== s);
      if (k < 0) return;
      samplers--;
      const s = sol[k];
      if (row[k] && row[k] !== s) { const o = row[k]; o.slot = null; row[k] = null; }
      if (s.slot !== null) row[s.slot] = null;
      s.slot = null; put(s, k);
      say("Mabel's even stitches show you where it goes.", C.moss);
      syncButtons();
    }
    function syncButtons() {
      wallsBtn.hidden = stage === 0; sampBtn.hidden = backMode || seq[si] < 2; makeBtn.hidden = !missing;
      if (!missing) makeEl.hidden = true;
      const unknown = backMode ? strips.some((q) => q.back && !knowsBack(q.back)) : strips.some((s) => !named.has(s.glyph));
      wallsBtn.disabled = !unknown || !!taut;
      sampBtn.disabled = samplers <= 0 || !!taut;
      sampBtn.querySelector("small").textContent = `H · ×${samplers}`;
    }
    function outcome(kind, text) {
      if (over) return;
      over = true; if (linkT) linkT.remove();
      api.store.set("losses", kind === "lose" ? losses + 1 : 0);
      flow.done({ outcome: kind, text });
    }
    function win() {
      const best = api.store.get("best", 0); if (left > best) api.store.set("best", Math.round(left));
      if (stage === 0) outcome("win", "Spread I pulls taut: “They weren't made. / They were summoned.” White thread is who, red is what they do, black is what it is done with, and a needle leads its thread." + (turns ? ` And through the linen, this time, the red wool on the back shows from the first sitting: ${ruthLine(0)}` : ""));
      else if (stage === 1) outcome("win", `Both spreads read, with ${Math.ceil(left)} s to spare${wallsUsed ? "" : ", and never once turning your back on the glows"}. You know how to feed it, and what the filling is: “The ritual had already begun the moment we stepped inside.”`);
      else {
        const words = [...new Set(BACKS[0].concat(BACKS[1], BACKS[2]))].filter(knowsBack);
        flow.S.learn(words); flow.S.set("backs_read", 3);
        const lines = [ruthLine(0), ruthLine(1), ruthLine(2)].join(" ");
        const got = flow.S.pieces().length;
        outcome("win", `Three backs read, with ${Math.ceil(left)} s to spare. In red wool, right to left: ${ruthLine(0)} Under the page that says how to feed it: ${ruthLine(1)} And under the filling: ${ruthLine(2)} The front is a ritual. The back is somebody small, counting her own stitches, and telling you how a thing is let go.${myPage ? ` Last, the page with no front: ${ruthLine(3)} It is the line that was sewn in last time, in marks somebody learned here.` : ""} ${got >= 6 ? "Every line of her sentence is in your selvage: it can be read whole where the Chase ends, in the doorway." : `Lines 2, 4 and 6 are not in the book. She copied them onto her own patterns, about the cabin. (${got} of 6 in your selvage.)`}${lines.includes("▒") ? " (The marks you could not name are on the walls, and here and there about the cabin.)" : ""}`);
      }
    }
    function lose() {
      if (backMode) {
        if (read.length) { flow.S.set("backs_read", read.length); outcome("done", `The glows close over the margins. You read ${read.length === 1 ? "one back" : `${read.length} backs`}: ${read.map((_, k) => ruthLine(k)).join(" ")} The rest stay face down, and something soft leans against your ankle and waits.`); }
        else outcome("lose", "The glows close over the margins with her strips still out of order. The book stays shut to you, and something soft leans against your ankle and waits.");
        return;
      }
      const unread = seq.map((k) => SPREADS[k]).filter((s) => !read.includes(s.no)).map((s) => s.no).join(" and ");
      if (read.length) outcome("done", `The glows close over the margins and the page goes warm under your hands. You read spread ${read.join(" and ")}; spread ${unread} stays unread. What it says, you will learn the other way.`);
      else outcome("lose", "The glows close over the margins before a single line pulls taut. The book stays shut to you, and something soft leans against your ankle and waits.");
    }

    // ---- input -----------------------------------------------------------------------------
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    function stripAt(x, y) { for (let k = strips.length - 1; k >= 0; k--) { const s = strips[k]; if (x >= s.x - 4 && x <= s.x + L.sz + 4 && y >= s.y - 4 && y <= s.y + L.sh + 4) return s; } return null; }
    function slotAt(x, y, slack = 6) { return L.slotPos.findIndex((p) => x >= p.x - slack && x <= p.x + L.sz + slack && y >= p.y - slack && y <= p.y + L.sh + slack); }
    K.on(cv, "pointerdown", (e) => {
      if (!started || over || taut) return;
      const [x, y] = pt(e), s = stripAt(x, y);
      if (s) { drag = { s, x, y, sx: x, sy: y, moved: false }; cv.setPointerCapture(e.pointerId); return; }
      const k = slotAt(x, y);
      if (k >= 0 && held !== null) { put(strips[held], k); held = null; }
    });
    K.on(cv, "pointermove", (e) => {
      const [x, y] = pt(e);
      hover = stripAt(x, y);
      cv.style.cursor = drag ? "grabbing" : hover ? "grab" : "default";
      if (!drag) return; drag.x = x; drag.y = y; if (Math.hypot(x - drag.sx, y - drag.sy) > 6) drag.moved = true;
    });
    K.on(cv, "pointerup", (e) => {
      if (!drag) return;
      const [x, y] = pt(e), d = drag; drag = null;
      if (!d.moved) {
        if (backMode) { flip(d.s); return; }
        if (d.s.slot !== null && held === null) { put(d.s, null); return; }
        held = held === d.s.i ? null : d.s.i; return;
      }
      const k = slotAt(x, y, 20);
      put(d.s, k >= 0 ? k : null); held = null;
    });
    function kbList() {
      if (backMode) return row.map((_, k) => (held === null ? "t" + (row[k] ? row[k].i : -1) : "s" + k));
      return held === null ? [...strips].sort((a, b) => (a.slot === null ? 0 : 1) - (b.slot === null ? 0 : 1) || a.hx - b.hx).map((s) => "t" + s.i) : L.slotPos.map((_, k) => "s" + k);
    }
    K.on(wrap, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key.toLowerCase();
      if (k === "r") { readWalls(); return; }
      if (k === "h") { useSampler(); return; }
      if (k === "m" && missing) { makeEl.hidden = !makeEl.hidden; picked = []; syncMake(); if (!makeEl.hidden) { beatEl.style.opacity = 0; makeEl.querySelector("button").focus(); } return; }
      if (taut) return;
      if (backMode) {
        if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
        kbUsed = true; const n = row.length;
        if (["ArrowRight", "ArrowDown"].includes(e.key)) { cursor = (cursor + 1) % n; e.preventDefault(); }
        else if (["ArrowLeft", "ArrowUp"].includes(e.key)) { cursor = (cursor - 1 + n) % n; e.preventDefault(); }
        else if (k === "f") { if (row[cursor]) flip(row[cursor]); }
        else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (held === null) held = row[cursor].i; else { const s = strips[held]; held = null; put(s, cursor); } }
        else if (e.key === "Escape") held = null;
        return;
      }
      if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      kbUsed = true;
      const list = kbList();
      if (["ArrowRight", "ArrowDown"].includes(e.key)) { cursor = (cursor + 1) % list.length; e.preventDefault(); }
      else if (["ArrowLeft", "ArrowUp"].includes(e.key)) { cursor = (cursor - 1 + list.length) % list.length; e.preventDefault(); }
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = list[cursor];
        if (held === null) { held = +id.slice(1); cursor = 0; }
        else { put(strips[held], +id.slice(1)); held = null; cursor = 0; }
      } else if ((e.key === "Backspace" || e.key === "Delete") && held !== null) { put(strips[held], null); held = null; cursor = 0; }
      else if (e.key === "Escape") held = null;
    });
    K.on(wallsBtn, "click", () => { readWalls(); wrap.focus(); });
    K.on(sampBtn, "click", () => { useSampler(); wrap.focus(); });
    K.on(makeBtn, "click", () => { makeEl.hidden = !makeEl.hidden; picked = []; syncMake(); if (!makeEl.hidden) beatEl.style.opacity = 0; });
    RADICALS.forEach((gl) => {
      const b = document.createElement("button"); b.type = "button"; b.dataset.g = gl; b.setAttribute("aria-pressed", "false");
      const pic = A.picture(GLYPHS[gl].art, 34, { h: 34, cover: true, src: [30, 50, 160, 160], key: "rad", alt: gl });
      if (pic) b.appendChild(pic);
      const nm = document.createElement("span"); nm.textContent = gl; b.appendChild(nm);
      K.on(b, "click", () => {
        if (picked.includes(gl)) picked = picked.filter((x) => x !== gl); else picked.push(gl);
        syncMake();
        if (picked.length === 2) { const [a, c] = picked; picked = []; K.after(250, () => { syncMake(); make(a, c); }); }
      });
      makeEl.querySelector("div").appendChild(b);
    });

    let prev = performance.now(), tickRaf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) {
        if (!taut) { if (stage) left -= dt; idle += dt; }
        if (tautStart) taut = Math.max(0.01, Math.min(1, (now - tautStart) / (api.reducedMotion ? 1 : 900)));
        if (shakeT > 0) shakeT = Math.max(0, shakeT - dt * 2.5);
        if (wallT > 0) wallT = Math.max(0, wallT - dt);
        if (idle > 30 && !hintPair && !backMode) {
          const sol = solution();
          const k = sol.findIndex((s, k2) => s && row[k2] !== s);
          if (k >= 0) hintPair = [sol[k].i, k];
        }
        if (stage && !marcusSaid && left < total * 0.5) { marcusSaid = true; beat("Marcus, from the doorway", "He has his back to you, watching the glows.", "There's always a way out. You just haven't drawn it yet.", 5000); }
        if (!edgeSaid && left < 30 * speed) { edgeSaid = true; beat("The edge of the page", "The glows are at the margins now. Something soft leans against your ankle, and waits.", null, 4500); }
        if (stage && left <= 0) lose();
      }
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    // ---- how to play: a linen sampler -------------------------------------------------------
    const GOAL = [
      "Under the cabin, the third night. Your friends hold the doorway. The first spread of the book lies open: four loose strips, four sewn slots. Nothing is hurrying you yet.",
      "The glows have found the room. Read two more spreads before they reach the page. One of them has lost a strip, and one has a strip too many.",
      "You have read these fronts. Every strip has a back. Turn them over, and read what is sewn there before the glows reach the page.",
    ][stage];
    const LEG = backMode ? [
      [C.red, "Tap a strip to turn it over", "F"],
      [C.silk, "Drag one strip onto another to change their places", "arrows · Enter"],
      [C.white, "Her strokes count her order; a back is read from the other side", ""],
    ] : [
      [C.red, "Drag a strip into a slot sewn in its colour", "arrows · Enter"],
      [C.silk, "Keep the rules under the slots", "× = broken"],
      [C.white, "Tap a set strip to take it back", "Delete"],
    ];
    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div class="${PRE}card" role="dialog" aria-label="How to play The Hand-Sewn Book">
      <h2>The Hand-Sewn Book</h2>
      <p class="${PRE}q">“Symbols stitched into the walls. / A circle of torn fabric skins. / A book made of hand-sewn pages.”</p>
      <p class="${PRE}goal">${GOAL}</p>
      <div class="${PRE}legend">${LEG.map(([c, t, k2]) => `<div><i style="background:${c}${c === C.white ? `;box-shadow:0 0 0 1px ${C.silk}` : ""}"></i><span>${t}</span>${k2 ? `<kbd>${k2}</kbd>` : "<span></span>"}</div>`).join("")}</div>
      <p class="${PRE}kind" ${losses >= 2 ? "" : "hidden"}>The glows took you twice. Slow glows are ticked for you.</p>
      <label ${stage ? "" : "hidden"}><input type="checkbox" ${losses >= 2 ? "checked" : ""}> Slow glows (twice the time)</label>
      <div class="${PRE}pickhost"></div>
      <button type="button" data-start>${backMode ? "Turn the page over" : "Open the book"}</button>
    </div>`;
    wrap.appendChild(intro);
    {
      const cardEl = intro.querySelector("." + PRE + "card"), h2 = intro.querySelector("h2");
      const cw = Math.min(426, wrap.clientWidth - 86);
      const plate = A.picture("chapter-05", cw, { alt: "Chapter 5: The Cabin Turns" });
      if (plate) { plate.className = PRE + "plate"; cardEl.insertBefore(plate, h2); }
      const ttl = A.word("The hand sewn book", 30);
      if (ttl) { h2.textContent = ""; h2.appendChild(ttl); }
      const rule = A.picture("ui-rule-knots", Math.min(300, cw), { alt: "" });
      if (rule) { rule.style.margin = "10px 0 0"; cardEl.insertBefore(rule, cardEl.querySelector("." + PRE + "legend")); }
      stagePicker(intro.querySelector("." + PRE + "pickhost"), api, stage, BLURBS, (n) => flow.pick(n));
    }
    const sb = intro.querySelector("button[data-start]");
    K.on(sb, "click", () => {
      speed = intro.querySelector("input").checked ? 2 : 1; total = left = (CLOCK[stage] || 180) * speed; intro.remove(); started = true; wrap.focus();
      if (stage === 0) beat("Spread I", "Four strips. Red thread is an act, black a thing, white who. The glossary names what Mabel's sampler taught you.", null, 4500);
      else if (stage === 1) spreadBeat();
      else {
        beat("The backs", "Spread I lies solved, as you left it. Tap a strip and turn it over.", null, 5000);
        const met = [...new Set(BACKS[0].concat(BACKS[1], BACKS[2]))].filter((w) => flow.S.knows(w));
        if (met.length) K.after(5600, () => { if (!over) linkT = linkNote(wrap, api, `Because you met Ruth's marks elsewhere in the cabin, these backs name themselves: ${met.join(", ")}.`, 8000); });
      }
    });
    sb.focus();

    const ro = new ResizeObserver(() => { A.flush(); layout(); });
    ro.observe(wrap);
    // a read-only probe for automated play tests
    loadSpread(0); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); A.dispose(); ro.disconnect(); if (linkT) linkT.remove(); wrap.remove(); } };
  }
}

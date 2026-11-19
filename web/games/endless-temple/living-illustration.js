// The Endless Temple / Living illustration (2D, scroll). Style: Picture-book pen and watercolour.
// DESIGN.md section 10, Mode A, sequence s2_li_c4a: torrent waves at mid-morning, heat introduced,
// 600 m of the sand sea on Zorlop-leaf shoes. Section 12: the tea holding (tea_hold, pov, sips).
//
// Lean back to brake (A / Left), lean forward (D / Right), pump down the face of a wave (hold Space
// / Up), release the pump at a crest to jump. A breaking lip (a wave over 5 m) swallows a rider
// slower than 4 m/s: mash dig to get out, and lose 10 m. Three swallows send you back to the last
// page-turn checkpoint (every 150 m). Prickle bushes cost 3 m/s; the sun builds heat, dune shade
// cools it. The tea drains with each page beat; as it fades the narrator slips from "I" to "he",
// input lags and the written line takes the reins. Hold S to sip (two sips). Win: reach 600 m.
// Lose: the tea runs out and the page closes.
// Accepted development, phase 1 (DESIGN.md "Accepted development (2026-11-15)"):
//   The cup colours the page: choose the cup before the ride. Stormcress brings one squall (Q) that
//   lays the waves flat for 5 s; lamp-ash keeps the thin phase readable; ember root halves the heat
//   and gives the written line 20% more pull.
//   The Other Hand: past the 600 m, the book turns to a later plate where an older hand with a ring
//   brings a cup nobody asked for, and the player may Look away (hold) or read One more page.
// Art (api.art): the Xandri sprite, the six cup vignettes, the two hands, corner folds, fleurons,
// jar labels, glyphs and the chapter heading. Each is rasterised once into an offscreen canvas.
// Phase 2 (DEEP_DIVE.md section 3, Living illustration): three plates, a ladder.
//   Teach (s2_li_c4a, 240 m): pump and jump on torrent waves. No heat, no webs, a full cup.
//   Test (s2_li_c4b, 340 m): heat, webs and a thinning cup together: noon, then dusk on the vine sea.
//   Twist (s2_li_c6, 340 m): the page is an object. The gutter: each spread has a centre fold, and the
//     page dips into it; cross it at 8 m/s or more, in the air, or on the line, or drop into the binding
//     and lose a page beat of tea. Margin riding: a crest jump at 6.5 m/s or more carries above the plate's
//     top edge onto blank paper: no waves and no grip for 3 seconds. The written line (hold F): the
//     faint ink path is safe and fast; riding it lowers `own`, and what is ridden off it raises it.
//     Look away (hold L, ten seconds a ride): the plate holds still and Xandri acts alone. The set-piece:
//     near the end something dune-long surfaces under the plate, the illustration tilts twenty degrees,
//     the caption slides down the page, and the player rides the slope of the paper. Then The Other Hand.
// Layer links (api.shared): the taste of the last cup poured in Tea Blending is the cup here; each
// linger (One more page here, the old keeper's ribbon in the stacks) lowers the pace cap by 1 m/s and
// starts the boy on tired feet (`walked`). Winning the twist sets `passed_mark` for The Naming.
// Phase 3 (DEEP_DIVE.md sections 2 and 3; the shared rules are in _ledger.js):
//   Look away is a standing verb only once the ledger has been turned over (Tea Blending writes
//   ledger_turned). Before that it is offered once, at The Other Hand, as the design has it.
//   The Other Hand's choice is kept (other_hand_choice): it decides which ending the long puzzle earns.
//   The twist ends on that ending's card: One more page is The Reader Who Stayed; looking away, once the
//   Parting Cup is brewed, is The Unread Page.
//   Second run: Look away is offered from the first plate, and a hands-off ride (no sip) keeps the
//   captions in "I" as the tea fades: the boy is narrating himself.

import { mountNotebook, sharedOf, secondRun, solved, endingFor, endingCard, ENDINGS } from "./_ledger.js";

let LEN = 200;
const CHECK = 150;
// Source line for the swallow, verbatim (DESIGN.md section 3 beat 20):
// creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md
// The opening caption is DESIGN.md section 3 beat 24, verbatim, from the same file.
const START_LINE = "He then tied the leaves about his feet and began his journey again.";
const SWALLOW_LINE = "The sand washed forward like a crashing wave of water. He braced himself as the surge of sand swallowed him.";
// DESIGN.md section 3 beats 19 and 22, verbatim, from the same file.
const MOON_LINE = "The sand looked like shining sheets of silver dotted with splendid purple vines sprawled across the ground like thick webs. Small prickle bushes were scattered across the sand sea.";
const DANGER_LINE = "If he was not careful, he could be swallowed too deep to dig out and die.";
// Narration written for the game (not quotations).
const LINES = {
  noon: "Noon. The sun stands straight over the sand sea, and the dunes throw only a little shade. Lean back in it to cool.",
  heat: "The heat swims in {my} eyes.",
  sipNew: "The tea is thinning: \u201cI\u201d is becoming \u201che\u201d. Hold Sip to drink.",
  jumpOK: "{I} let go at the crest.",
  prickle: "Prickles. {I} lose{s} {my} pace.",
  web: "The vines catch the leaves.",
  page: "The page turns. {m} m.",
  ride: "{I} ride{s} the face of the wave.",
  dug: "Dug out, ten metres back.",
  checkpoint: "Three times under. The page turns back to the last checkpoint.",
  sip: "A long green hand brings the cup into the page.",
  empty: "The cup is empty now.",
  winI: "Six hundred metres of torrent waves, and the page turns with Xandri still saying \u201cI\u201d: the tea held at {tea}.",
  winHe: "Six hundred metres, and the page turns, but the tea is down to {tea}: by the end it was \u201che\u201d who reached the moonlit vines, and the written line that steered.",
  lose: "The tea is gone at {x} m, {phase}. The lines thin to nothing, and the page closes on Xandri mid-stride.",
  gentle: "The cup is fuller this time, with a third sip in it.",
  squall: "A squall comes off the cup, stormcress and rain: the waves lie down.",
  squallOver: "The squall passes. The sand begins to move again.",
  squallHint: "Stormcress in the cup: one squall (Q) will flatten the waves for five seconds.",
  // DEEP_DIVE.md sample line, written for the game:
  otherHand: "The hand that brought the cup was not his. It was older, and it wore a ring.",
  otherNote: "You did not press Sip.",
  lookedAway: "Elaris lifts his eyes from the page. The plate holds still, and whoever walks on it walks unwatched.",
  onePage: "One more page. The ringed hand has been here before him, and the walker on the plate goes on past his cairn.",
  // phase 2
  gutterNear: "The page dips toward its fold. Eight metres a second carries over it; anything less drops into the binding.",
  gutterOver: "{I} cross{es} the fold.",
  gutterDrop: "Into the gutter, where the pages meet. A page beat of tea goes with it.",
  lineHow: "A faint ink line runs ahead: the written line, the herd's own track. Hold Line (F) to ride it. It is safe and fast, and it is not his.",
  lineOn: "On the written line. The page does the riding.",
  margin: "{I} come{s} off the top of the plate, onto blank paper. No waves here, and no grip.",
  marginEnd: "The blank paper lets go.",
  awayHow: "Look away (hold L) and the plate holds still: what he does then, he does unwatched.",
  away: "Elaris has lifted his eyes. The plate holds still.",
  awayBack: "When he looks again the boy is {m} m further on, and nobody wrote it.",
  tilt: "Something dune-long is coming up under the plate. The page tips, and the words slide down it.",
  // DEEP_DIVE.md sample line, written for the game:
  oneMoreDune: "He woke two hundred paces from where he had lain down, and his feet knew the way he had come.",
  walkedLink: "Because you lingered ({why}), his pace is capped at {v} m/s on this plate.",
  cupLink: "Because you poured {cup} at the pantry table, that is the cup beside this page.",
  // phase 3
  awayLocked: "Look away is not his to use yet: the ledger has not been turned over.",
  handsOff: "The tea is thin, and the captions still say \u201cI\u201d. Nobody is narrating him now. He is.",
  awayFirst: "A second reading: Look away (hold L) is already his, from the first plate.",
  winTwist: "The herd's track across two spreads, down the slope of a tipped page: {own} m of it were his own, {line} m were the written line's{away}. The tea held at {tea}.",
  stop: " He closes the plate there, with the next one still unturned.",
};
const STG = [
  { name: "Teach: pump and jump", scene: "s2_li_c4a", plate: "Plate IV. The torrent waves, mid-morning.", len: 240, tea: 92, drain: 8, heat: false, webs: [], gutters: [], phases: [{ at: 0, name: "mid-morning", look: 0 }] },
  { name: "Test: heat, webs and a thinning cup", scene: "s2_li_c4b", plate: "Plate V. Noon, then the vine sea at dusk.", len: 340, tea: 56, drain: 6, heat: true, webs: [170, 200, 235, 270, 310], gutters: [], phases: [{ at: 0, name: "noon", look: 1 }, { at: 150, name: "dusk on the vine sea", look: 2 }] },
  { name: "Twist: the page is an object", scene: "s2_li_c6", plate: "Plate VII. The herd's track, across two spreads.", len: 340, tea: 72, drain: 8, heat: false, webs: [40, 120, 190], gutters: [75, 225], tiltAt: 275, line: true, phases: [{ at: 0, name: "the herd's track", look: 2 }] },
];
const CUPS = [
  { id: "mint", name: "Plain mint", art: "label-mint", note: "Nothing added. The page as it is drawn." },
  { id: "storm", name: "Stormcress", art: "label-stormcress", note: "One squall a ride (Q): the waves lie flat for 5 s." },
  { id: "lampash", name: "Lamp-ash", art: "label-lamp-ash", note: "The thin, pencil phase stays readable." },
  { id: "ember", name: "Ember root", art: "label-ember-root", note: "Half the heat; the written line pulls 20% harder." },
];
let PHASES = STG[0].phases;

export default {
  mount(root, api) {
    const P = "endless-temple-living-illustration-";
    const rng = api.rng("et-li-c4a");
    const losses = api.store.get("lossStreak", 0);
    const gentle = losses >= 2;
    const C = { page: "#f1e6cc", ink: "#2b1d12", ochre: "#c98a3a", sand: "#e0b56e", sky: "#b9cbd6", bruise: "#6e4a78", sage: "#8fa07a", honey: "#d4a23a", table: "#3a2a1d", silver: "#c9ccd3" };
    const timers = [];
    const art = api.art || { has: () => false, url: () => "", img: async () => null };
    const pic = (id, alt = "") => (art.has(id) ? `<img src="${art.url(id)}" alt="${alt}" draggable="false">` : "");
    // each piece of art is rasterised once, at a fixed bitmap size, and only blitted after that
    const spr = {};
    let alive = true;
    async function prep(id, w, h) {
      const im = await art.img(id);
      if (!im || !alive) return;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(im, 0, 0, w, h);
      spr[id] = c;
    }
    const VIG = ["cup-vignette-1-full", "cup-vignette-2-three-quarters", "cup-vignette-3-half", "cup-vignette-4-quarter", "cup-vignette-5-dregs", "cup-vignette-6-empty"];
    prep("sprite-xandri", 288, 360); prep("hand-elaris", 480, 240);
    VIG.forEach((id) => prep(id, 176, 176));
    for (const id of ["corner-fold-rest", "corner-fold-lifted", "corner-fold-turned"]) prep(id, 128, 128);
    for (const id of ["fleuron-wave", "fleuron-sand", "fleuron-moon"]) prep(id, 480, 96);
    let taste = "mint";
    const shared = sharedOf(api);
    const second = secondRun(shared);
    const canAway = second || !!shared.get("ledger_turned", false);
    const reached = Math.max(0, Math.min(2, api.store.get("stage", 0) | 0));
    let stage = 0;
    const stg = () => STG[stage];
    prep("hand-ringed", 480, 240);
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:hidden;background:${C.table};touch-action:none;user-select:none;-webkit-user-select:none}
    .${P}root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    .${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:10px 12px 12px;gap:8px;pointer-events:none}
    .${P}pad button{pointer-events:auto;font:600 15px 'EB Garamond',Georgia,serif;color:${C.ink};background:rgba(241,230,204,.86);border:2px solid ${C.ink};border-radius:40px;min-width:64px;min-height:56px;padding:0 14px;touch-action:none}
    .${P}pad button.${P}on{background:${C.honey}}
    .${P}pad .${P}big{min-width:110px;min-height:72px;font-size:17px}
    .${P}grp{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .${P}pad{flex-wrap:wrap}
    @media (max-width:520px){.${P}pad button{min-width:54px;min-height:52px;padding:0 8px;font-size:14px}.${P}pad .${P}big{min-width:84px;min-height:60px;font-size:15px}.${P}pad{gap:6px;padding:6px 8px 10px}.${P}grp{gap:6px}}
    @media (hover:hover) and (pointer:fine){.${P}pad{opacity:.75}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(43,29,18,.6);z-index:5;padding:16px;overflow:auto}
    .${P}plate{max-width:440px;background:${C.page};color:${C.ink};padding:16px 18px 20px;border:1.5px solid ${C.ink};box-shadow:6px 8px 0 rgba(0,0,0,.35);font-family:'EB Garamond',Georgia,serif;transform:rotate(-.6deg);
      background-image:radial-gradient(circle at 20% 15%,rgba(185,203,214,.55),transparent 40%),radial-gradient(circle at 80% 85%,rgba(224,181,110,.5),transparent 45%)}
    .${P}plate svg{display:block;width:100%;height:auto;margin-bottom:8px}
    .${P}plate small{display:block;font-style:italic;font-size:14px;text-align:center;margin-bottom:6px}
    .${P}plate h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;margin:0;font-size:28px;text-align:center}
    .${P}plate .${P}goal{margin:6px 0 10px;font-size:17px;text-align:center}
    .${P}plate ul{list-style:none;padding:0;margin:0 0 14px;font-size:16px}
    .${P}plate li{display:flex;gap:10px;align-items:baseline;margin:6px 0}
    .${P}plate kbd{flex:none;min-width:86px;text-align:center;font:600 14px 'EB Garamond',Georgia,serif;border:1.5px solid ${C.ink};border-radius:14px;padding:1px 8px;background:rgba(212,162,58,.35)}
    .${P}plate button{display:block;margin:0 auto;font:inherit;font-size:18px;padding:8px 28px;border:2px solid ${C.ink};background:${C.honey};cursor:pointer;border-radius:22px}
    .${P}plate button:hover,.${P}plate button:focus-visible{background:#e8bb55;outline:2px solid ${C.ink};outline-offset:2px}
    .${P}plate img.${P}head{display:block;width:100%;height:auto;margin-bottom:8px;border-radius:2px}
    .${P}cups{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:0 0 6px}
    .${P}plate .${P}cups button{margin:0;padding:3px;border-radius:8px;border:2px solid transparent;background:transparent;font-size:13px;line-height:1.1;display:flex;flex-direction:column;align-items:center;gap:2px}
    .${P}plate .${P}cups button[aria-pressed=true]{border-color:${C.ink};background:rgba(212,162,58,.45)}
    .${P}cups img{width:100%;height:auto;border-radius:4px}
    .${P}cupnote{font-size:15px;font-style:italic;margin:0 0 12px;min-height:2.4em;text-align:center}
    .${P}pad button img{width:26px;height:26px;vertical-align:middle;margin:-4px 4px -2px -6px}
    .${P}pad button[hidden]{display:none}
    .${P}start{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 10px}
    .${P}plate .${P}start button{display:inline-block;margin:0;font-size:14px;padding:5px 10px;background:transparent;border-width:1.5px;min-height:38px}
    .${P}plate .${P}start button[aria-pressed=true]{background:${C.ink};color:${C.page}}
    .${P}plate .${P}row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
    .${P}plate .${P}row button{margin:0}
    .${P}plate .${P}row button.${P}alt{background:transparent}
    .${P}brewed{font-size:14px;font-style:italic;text-align:center;margin:0 0 6px}
    .${P}coda{position:absolute;inset:0;z-index:6;display:grid;place-items:center;background:rgba(43,29,18,.72);padding:12px 12px 20px;overflow:auto;box-sizing:border-box}
    .${P}codap{position:relative;width:min(560px,100%);background:${C.page};color:${C.ink};border:1.5px solid ${C.ink};box-shadow:6px 8px 0 rgba(0,0,0,.35);padding:12px 14px 14px;font-family:'EB Garamond',Georgia,serif;box-sizing:border-box}
    .${P}codap small{display:block;font-style:italic;text-align:center;font-size:14px;margin:4px 0}
    .${P}scene{position:relative;overflow:hidden;border:1px solid ${C.ink};aspect-ratio:2/1;background:linear-gradient(#cdd3cc 0 46%,#e3c58c 46% 100%)}
    .${P}scene svg{position:absolute;inset:0;width:100%;height:100%}
    .${P}scene img{position:absolute;left:0;bottom:4%;width:62%;height:auto;transform:translateX(-102%);transition:transform 1.6s cubic-bezier(.2,.7,.2,1)}
    .${P}scene.${P}in img{transform:translateX(-6%)}
    .${P}scene.${P}still{filter:grayscale(.55)}
    .${P}codap p{margin:8px 0;font-size:17px;line-height:1.35;text-align:center}
    .${P}codap p.${P}n{font-style:italic;font-size:15px}
    .${P}choice{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
    .${P}choice button{position:relative;overflow:hidden;font:600 16px 'EB Garamond',Georgia,serif;color:${C.ink};background:rgba(241,230,204,.9);border:2px solid ${C.ink};border-radius:30px;min-height:52px;padding:4px 18px 4px 8px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;touch-action:none}
    .${P}choice button img{width:40px;height:40px;position:relative}
    .${P}choice button span{position:relative}
    .${P}choice button i{position:absolute;left:0;top:0;bottom:0;width:0;background:${C.honey}}
    .${P}choice button:hover,.${P}choice button:focus-visible{outline:2px solid ${C.honey};outline-offset:2px}
    @media (prefers-reduced-motion:reduce){.${P}scene img{transition:none}}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `<canvas aria-label="A storybook page: Xandri rides the sand waves left to right."></canvas>
      <div class="${P}pad">
        <div class="${P}grp"><button type="button" data-k="back">◀ Lean back</button><button type="button" data-k="fwd">Lean ▶</button></div>
        <div class="${P}grp"><button type="button" data-k="away" hidden>Look away</button><button type="button" data-k="line" hidden>Line</button><button type="button" data-k="squall" hidden>Squall</button><button type="button" data-k="sip">${pic("glyph-sip")}Sip</button><button type="button" class="${P}big" data-k="pump">Pump / Dig</button></div>
      </div>`;
    root.append(css, el);
    const cv = el.querySelector("canvas");
    const g = cv.getContext("2d");

    // ---- paper texture, made once ------------------------------------------------------------
    const paper = document.createElement("canvas");
    paper.width = 256; paper.height = 256;
    {
      const p = paper.getContext("2d");
      p.fillStyle = C.page; p.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2600; i++) { p.fillStyle = `rgba(90,61,39,${(rng() * 0.07).toFixed(3)})`; p.fillRect(rng() * 256, rng() * 256, 1 + rng() * 1.5, 1 + rng() * 1.5); }
    }
    const paperPat = g.createPattern(paper, "repeat");
    // stable ink wobble
    const wob = (x, k = 1) => Math.sin(x * 0.9 + k) * 0.06 + Math.sin(x * 2.3 + k * 3) * 0.035;

    // ---- world ---------------------------------------------------------------------------------
    let prickles = [], webs = [], shades = [], gutters = [];
    function buildWorld() {
      const G = stg();
      LEN = G.len; PHASES = G.phases; gutters = G.gutters.slice();
      prickles = []; webs = []; shades = [];
      for (let x = 40; x < LEN - 20; x += 32 + rng() * 34) if (!gutters.some((gx) => Math.abs(x - gx) < 14)) prickles.push({ x, hit: false });
      for (const x of G.webs) webs.push({ x, hit: false });
      if (G.heat) for (let x = 30; x < 150; x += 40 + rng() * 20) shades.push([x, x + 9 + rng() * 5]);
    }
    // the page dips into each gutter: 2.4 m down over 22 m on either side of the fold
    const dip = (x) => { let d = 0; for (const gx of gutters) { const u = Math.abs(x - gx); if (u < 22) d -= 2.4 * (1 - u / 22); } return d; };
    const base = (x) => 1.6 + 1.1 * Math.sin(x / 23) + 0.6 * Math.sin(x / 9.7 + 1) + dip(x);
    let waves = [];
    const WF = 6, WB = 14, CW = 7.2; // front width, back width, wave speed m/s
    let squallK = 1;   // a stormcress squall lays the waves flat
    function waveH(w) { const a = w.age; return squallK * (a < 7 ? 2 + 4 * Math.min(1, a / 6) : Math.max(0, 6 - (a - 7) * 2.5)); }
    function hAt(x) {
      let h = base(x);
      for (const w of waves) {
        const u = x - w.x, H = waveH(w);
        if (u >= 0 && u < WF) h += H * 0.5 * (1 + Math.cos((Math.PI * u) / WF));
        else if (u < 0 && u > -WB) h += H * 0.5 * (1 + Math.cos((Math.PI * u) / WB));
      }
      return h;
    }
    const slopeAt = (x) => (hAt(x + 0.3) - hAt(x - 0.3)) / 0.6;

    // ---- state ---------------------------------------------------------------------------------
    const S = {
      x: 4, v: 4, y: 0, vy: 0, air: false, tea: gentle ? 85 : 70, sips: gentle ? 3 : 2, phase: 0, fx: [], sipToldNew: false, cooled: 0, heat: 0, hot: 0, swallows: 0, check: 0,
      swallowed: null, snag: 0, beat: 50, t: 0, nextWave: 0.2, sipHold: 0, caption: "", capT: 0, done: false, started: false,
      maxX: 0, inputQ: [], squall: 0, squallLeft: 0, phaseT: 0, capQ: [],
      cap: 12, margin: 0, onLine: false, lineM: 0, ownM: 0, awayM: 0, away: false, awayLeft: 10, awayFrom: 0, tilt: 0, tiltOn: false, gutI: 0, gutDrops: 0, gutTold: false, lineTold: false,
    };
    const keys = { back: false, fwd: false, pump: false, sip: false, squall: false, line: false, away: false };
    let digPresses = 0;
    function say(t, secs = 3) { S.caption = t; S.capT = secs; }
    // voice: first person while the tea holds, third as it fades
    function V(t) {
      const I = band() === 0 || handsOff();
      return t.replace(/\{I\}/g, I ? "I" : "He").replace(/\{s\}/g, I ? "" : "s").replace(/\{my\}/g, I ? "my" : "his");
    }
    function fx(kind) { if (!api.reducedMotion) S.fx.push({ kind, x: S.x, y: S.air ? S.y : hAt(S.x), t: 0 }); }

    // ---- input ---------------------------------------------------------------------------------
    const KEYMAP = { a: "back", arrowleft: "back", d: "fwd", arrowright: "fwd", " ": "pump", w: "pump", arrowup: "pump", s: "sip", arrowdown: "sip", e: "dig", q: "squall", f: "line", l: "away" };
    const onDown = (e) => {
      if (coda) { if (codaKey) codaKey(e, true); return; }
      const k = KEYMAP[e.key.toLowerCase()];
      if (!k || !S.started) return;
      e.preventDefault();
      if (k === "dig" || (k === "pump" && S.swallowed)) { if (!e.repeat) digPresses++; if (k === "dig") return; }
      keys[k] = true;
    };
    const onUp = (e) => { if (coda) { if (codaKey) codaKey(e, false); return; } const k = KEYMAP[e.key.toLowerCase()]; if (k && k !== "dig" && k !== "squall") keys[k] = false; };
    addEventListener("keydown", onDown); addEventListener("keyup", onUp);
    const btns = [...el.querySelectorAll("[data-k]")];
    const squallBtn = el.querySelector('[data-k="squall"]');
    const lineBtn = el.querySelector('[data-k="line"]'), awayBtn = el.querySelector('[data-k="away"]');
    const ptr = [];
    for (const b of btns) {
      const k = b.dataset.k;
      const down = (e) => { e.preventDefault(); if (!S.started) return; keys[k] = true; b.classList.add(P + "on"); if (k === "pump" && S.swallowed) digPresses++; };
      const up = (e) => { e.preventDefault(); if (k !== "squall") keys[k] = false; b.classList.remove(P + "on"); };
      b.addEventListener("pointerdown", down); b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("pointerleave", up);
      ptr.push([b, down, up]);
    }

    // ---- update --------------------------------------------------------------------------------
    function band() { return S.tea >= 60 ? 0 : S.tea >= 30 ? 1 : S.tea > 0 ? 2 : 3; }
    // second run: a hands-off ride (no sip yet) keeps "I" as the tea fades
    const handsOff = () => second && !S.sipsTaken && S.tea > 0;
    function update(dt) {
      S.t += dt;
      if (S.capT > 0) S.capT -= dt;
      else if (S.capQ && S.capQ.length) { const [t, d] = S.capQ.shift(); say(t, d); }
      // waves spawn behind the rider every 4 to 7 s and roll right
      S.nextWave -= dt;
      if (S.nextWave <= 0) { waves.push({ x: S.x - 22 - rng() * 6, age: 0 }); S.nextWave = 4 + rng() * 3; }
      for (const w of waves) { w.age += dt; w.x += CW * dt; }
      // the squall (stormcress in the cup): once a ride, five seconds of flat sand
      if (keys.squall) { keys.squall = false; if (S.squallLeft > 0 && S.squall <= 0 && !S.swallowed) { S.squallLeft--; S.squall = 5; squallBtn.hidden = true; say(LINES.squall, 3); } }
      if (S.squall > 0) { S.squall -= dt; if (S.squall <= 0) say(LINES.squallOver, 2); }
      const kTo = S.squall > 0 ? 0.12 : 1;
      squallK += (kTo - squallK) * Math.min(1, dt * 3);
      if (S.phaseT > 0) S.phaseT -= dt;
      waves = waves.filter((w) => waveH(w) > 0.05 * squallK && w.x < S.x + 80);

      // tea: idle drain, sip
      S.tea -= dt / stg().drain;
      // Look away (the twist): the plate holds still, and Xandri acts alone
      const wantAway = S.canAway && keys.away && S.awayLeft > 0 && !S.swallowed;
      if (wantAway && !S.away) { S.away = true; S.awayFrom = S.x; S.awayDrawn = false; }
      else if (!wantAway && S.away) { S.away = false; say(LINES.awayBack.replace("{m}", Math.round(S.x - S.awayFrom)), 3.5); }
      if (S.away) {
        S.awayLeft -= dt; S.air = false; S.margin = 0; S.onLine = false;
        S.v += (7 - S.v) * Math.min(1, dt * 2);
        const d = S.v * dt; S.x += d; S.awayM += d; S.y = hAt(S.x);
        while (S.gutI < gutters.length && S.x >= gutters[S.gutI]) S.gutI++;
        if (S.x >= S.beat) S.beat += 50;   // nobody is reading: no page beat is paid
        S.maxX = Math.max(S.maxX, S.x);
        if (S.x >= LEN) finish(true); else if (S.tea <= 0) { S.tea = 0; finish(false); }
        return;
      }
      if (keys.sip && S.sips > 0 && S.tea < 100) {
        S.sipHold += dt;
        if (S.sipHold >= 1.5) { S.sips--; S.sipsTaken = (S.sipsTaken || 0) + 1; S.tea = Math.min(100, S.tea + 25); S.sipHold = 0; keys.sip = false; fx("sip"); say(S.sips ? LINES.sip : LINES.empty); }
      } else S.sipHold = 0;

      if (S.swallowed) {
        const sw = S.swallowed;
        sw.t += dt;
        sw.p += digPresses * 0.13 + dt * 0.25; digPresses = 0;
        if (sw.t >= 2 && sw.p >= 1) {
          S.swallowed = null; S.swallows++;
          if (S.swallows >= 3) { S.x = S.check + 2; S.swallows = 0; waves = []; S.nextWave = 2; say(LINES.checkpoint, 3.5); }
          else { S.x = Math.max(0, S.x - 10); say(S.swallows === 2 ? DANGER_LINE : LINES.dug, S.swallows === 2 ? 4 : 2); }
          S.v = 2; S.air = false;
        }
        return;
      }
      digPresses = 0;

      // input with lag and written-line authority as the tea fades
      const b = band();
      const lag = b === 0 ? 0 : b === 1 ? 0.15 : 0.35;
      S.inputQ.push({ t: S.t, back: keys.back, fwd: keys.fwd, pump: keys.pump });
      while (S.inputQ.length > 1 && S.inputQ[1].t <= S.t - lag) S.inputQ.shift();
      const inp = S.inputQ[0];
      const auth = (b === 0 ? 1 : b === 1 ? 1 - 0.3 * (60 - S.tea) / 30 : S.tea < 10 ? 0 : 0.35) * (taste === "ember" ? 0.8 : 1);
      const slope = slopeAt(S.x);
      const auto = { pump: slope < -0.05, back: false, fwd: false };
      const use = (k) => (rng() < auth ? inp[k] : auto[k]);
      const pump = use("pump"), back = use("back"), fwd = use("fwd");
      const G = stg(), x0 = S.x;
      // the tilt (the twist's set-piece): the plate tips, and the slope of the paper does the pulling
      if (G.tiltAt && S.x >= G.tiltAt && !S.tiltOn) { S.tiltOn = true; S.squall = Math.max(S.squall, 0); say(LINES.tilt, 9); S.tiltT = 0; }
      if (S.tiltOn) { S.tiltT += dt; S.tilt = api.reducedMotion ? 1 : Math.min(1, S.tilt + dt / 2.5); squallK += (0.15 - squallK) * Math.min(1, dt * 3); }
      S.onLine = !!G.line && keys.line && !S.air && S.margin <= 0;
      if (S.onLine && !S.lineSaid) { S.lineSaid = true; say(LINES.lineOn, 2.4); }

      const hHere = hAt(S.x);
      if (S.margin > 0) {
        // on the blank top margin: no waves and no grip, for three seconds
        S.margin -= dt; S.y += (marginY - S.y) * Math.min(1, dt * 6); S.vy = 0;
        if (S.margin <= 0) { S.air = true; say(LINES.marginEnd, 1.6); }
      } else if (S.onLine) {
        S.v += (Math.min(9, S.cap) - S.v) * Math.min(1, dt * 2.5); S.y = hHere; S.snag = 0;
      } else if (!S.air) {
        let a = -0.15 * S.v;
        if (slope < -0.05) a += 1.2 + (pump ? 2.5 : 0);
        if (slope > 0.05) a -= 2;
        if (back) a -= 3;
        if (fwd) a += 0.6;
        a += 5 * S.tilt;
        S.v = Math.max(1.5, Math.min(S.cap + 2 * S.tilt, S.v + a * dt));
        if (S.hot > 0) S.v = Math.min(6, S.v);
        if (S.snag > 0) { S.snag -= dt; S.v = 0.3; }
        // jump: release the pump at a crest
        if (S.wasPump && !pump && Math.abs(slope) < 0.18 && (hHere - base(S.x) > 1.5 || (G.line && S.v >= 6.5 && !S.tiltOn)) && S.v > 4.5) {
          S.air = true; S.y = hHere; S.vy = 3 + S.v * 0.35; fx("jump");
          if (G.line && S.v >= 6.5 && !S.tiltOn) { S.margin = 3; say(V(LINES.margin).replace("{es}", band() === 0 ? "" : "s"), 2.6); }
          else say(V(LINES.jumpOK).replace("He let ", "He lets "), 1.6);
        }
        S.y = hHere;
      } else {
        S.vy -= 12 * dt; S.y += S.vy * dt;
        if (S.y <= hAt(S.x)) { S.air = false; S.y = hAt(S.x); fx("land"); }
      }
      S.wasPump = pump;
      S.x += S.v * dt;
      if (G.line) { if (S.onLine) S.lineM += S.x - x0; else S.ownM += S.x - x0; }
      // the gutter: the fold in the middle of each spread
      if (S.gutI < gutters.length) {
        const gx = gutters[S.gutI];
        if (!S.gutTold && S.x > gx - 34) { S.gutTold = true; say(LINES.gutterNear + (S.lineTold ? "" : " " + LINES.lineHow), 6); S.lineTold = true; }
        if (S.x >= gx) {
          S.gutI++; S.gutTold = false;
          if (S.air || S.margin > 0 || S.onLine || S.v >= 8) say(V(LINES.gutterOver).replace("{es}", band() === 0 ? "" : "es"), 1.8);
          else { S.gutDrops++; S.tea -= 5; S.v = 1.5; S.snag = 0.8; fx("hit"); say(LINES.gutterDrop, 3); }
        }
      }

      // hazards
      const safe = S.onLine || S.margin > 0;
      for (const p of prickles) if (!p.hit && !S.air && !safe && Math.abs(S.x - p.x) < 0.8) { p.hit = true; S.v = Math.max(1.5, S.v - 3); fx("hit"); say(V(LINES.prickle), 1.6); }
      for (const w of webs) if (!w.hit && !S.air && !safe && Math.abs(S.x - w.x) < 0.8) { w.hit = true; S.snag = 1; fx("hit"); say(LINES.web, 1.4); }
      if (S.x > CHECK * (Math.floor(S.check / CHECK) + 1) && S.x < LEN) { S.check = Math.floor(S.x / CHECK) * CHECK; S.pageFlash = 0.6; if (!S.capT || S.capT < 1) say(LINES.page.replace("{m}", S.check), 1.6); for (const p of prickles) if (p.x > S.check) p.hit = false; }
      // phases
      const pi = PHASES.filter((q) => S.x >= q.at).length - 1, ph = PHASES[pi].look;
      S.phaseName = PHASES[pi].name;
      if (ph !== S.phase) { S.phase = ph; S.phaseT = 5; say(ph === 1 ? LINES.noon : MOON_LINE, 5); if (ph === 2) { S.heat = 0; S.hot = 0; } }
      if (b >= 1 && !S.sipToldNew && S.sips > 0 && S.capT < 0.5) { S.sipToldNew = true; say(handsOff() ? LINES.handsOff : LINES.sipNew, 4); }

      // swallowed by a breaking lip
      for (const w of waves) {
        const u = S.x - w.x;
        if (waveH(w) > 5 && !S.air && !safe && u > -1 && u < 2.5 && S.v < 3.6) {
          S.swallowed = { t: 0, p: 0 }; digPresses = 0; S.totalSwallows = (S.totalSwallows || 0) + 1; fx("hit");
          say(SWALLOW_LINE, 3.6);
          return;
        }
      }

      // heat: sun by day, dune shade cools
      const shade = shades.some(([a, c]) => S.x > a && S.x < c);
      const sun = !G.heat ? -10 : (S.phase === 0 ? 3 : S.phase === 1 ? 6 : -10) * (taste === "ember" && S.phase < 2 ? 0.5 : 1);
      S.heat = Math.max(0, Math.min(100, S.heat + (shade ? -12 : sun) * dt));
      if (shade && S.heat > 0 && S.v < 3) S.cooled += dt;
      if (S.hot > 0) { S.hot -= dt; if (S.hot <= 0) S.heat = 60; }
      else if (S.heat >= 100) { S.hot = 5; fx("hit"); say(V(LINES.heat), 2); }

      // page beats drain the tea
      if (S.x >= S.beat) { S.beat += 50; S.tea -= 5; }
      S.maxX = Math.max(S.maxX, S.x);
      if (S.capT <= 0 && S.v > 7.5 && !S.air && rng() < 0.02) say(V(LINES.ride), 1.8);
      if (S.pageFlash > 0) S.pageFlash -= dt;
      for (const f of S.fx) f.t += dt;
      S.fx = S.fx.filter((f) => f.t < (f.kind === "sip" ? 1.8 : 0.8));

      if (S.x >= LEN) finish(true);
      else if (S.tea <= 0) { S.tea = 0; finish(false); }
    }
    function finish(win) {
      if (S.done) return;
      S.done = true;
      api.store.set("lossStreak", win ? 0 : losses + 1);
      const G = stg();
      const tea = Math.max(0, Math.round(S.tea));
      const sw = S.totalSwallows ? ` The sand had him ${S.totalSwallows} time${S.totalSwallows > 1 ? "s" : ""}.` : " The sand never had him.";
      if (!win) {
        timers.push(setTimeout(() => api.end({ outcome: "lose", text: LINES.lose.replace("{x}", Math.round(S.x)).replace("{phase}", S.phaseName || PHASES[0].name) + (S.sips ? ` ${S.sips === 1 ? "One sip was" : S.sips + " sips were"} still in the cup.` : "") }), api.reducedMotion ? 100 : 700));
        return;
      }
      let winText;
      if (G.line) {
        const own = Math.round(S.ownM), line = Math.round(S.lineM);
        winText = LINES.winTwist.replace("{own}", own).replace("{line}", line).replace("{away}", S.awayM > 1 ? `, and ${Math.round(S.awayM)} m nobody watched` : "").replace("{tea}", tea) + (S.gutDrops ? ` The gutter had him ${S.gutDrops} time${S.gutDrops > 1 ? "s" : ""}.` : "") + sw;
        // `own`: what the boy did himself. Riding the line lowers it; leaving it, and looking away, raise it.
        const dOwn = Math.round((S.ownM + S.awayM - S.lineM) / 100);
        shared.set("own", Math.max(0, (shared.get("own", 0) | 0) + dOwn));
        shared.set("passed_mark", true);
      } else {
        const what = stage === 0 ? `${G.len} metres of torrent waves` : `${G.len} metres of noon and vine sea`;
        winText = (tea >= 60 ? LINES.winI : LINES.winHe).replace("Six hundred metres of torrent waves", what).replace("Six hundred metres,", what + ",").replace("{tea}", tea) + sw;
      }
      if (stage >= STG.length - 1) { timers.push(setTimeout(() => otherHand(winText), api.reducedMotion ? 100 : 900)); return; }
      timers.push(setTimeout(() => {
        const c = document.createElement("div");
        c.className = P + "intro";
        c.innerHTML = `<div class="${P}plate" role="dialog" aria-label="The page turns"><small></small><h2>The page turns</h2><p class="${P}goal"></p><p class="${P}cupnote"></p>
          <div class="${P}row"><button type="button" data-a="go">Turn the page</button><button type="button" class="${P}alt" data-a="stop">Stop here</button></div></div>`;
        c.querySelector("small").textContent = STG[stage + 1].plate;
        c.querySelector("." + P + "goal").textContent = winText;
        c.querySelector("." + P + "cupnote").textContent = `Next, ${STG[stage + 1].name.toLowerCase()}.`;
        el.appendChild(c);
        c.querySelector('[data-a="go"]').addEventListener("click", () => { c.remove(); startStage(stage + 1); });
        c.querySelector('[data-a="stop"]').addEventListener("click", () => { c.remove(); api.end({ outcome: "win", text: winText + LINES.stop }); });
        c.querySelector('[data-a="go"]').focus();
      }, api.reducedMotion ? 100 : 900));
    }
    // a plate begins: one rung of the ladder
    function startStage(i) {
      stage = i;
      const G = stg();
      api.store.set("stage", Math.max(reached, api.store.get("stage", 0) | 0, i));
      buildWorld(); waves = []; squallK = 1; digPresses = 0;
      for (const k of Object.keys(keys)) keys[k] = false;
      const walked = Math.max(0, shared.get("walked", 0) | 0);
      Object.assign(S, {
        x: 4, v: 4, y: 0, vy: 0, air: false, tea: G.tea + (gentle ? 15 : 0), sips: gentle ? 3 : 2, phase: G.phases[0].look, phaseName: G.phases[0].name, fx: [], sipToldNew: false, cooled: 0, heat: 0, hot: 0, swallows: 0, check: 0,
        swallowed: null, snag: 0, beat: 50, t: 0, nextWave: 0.2, sipHold: 0, caption: "", capT: 0, done: false, started: true, maxX: 0, inputQ: [], squall: 0, squallLeft: taste === "storm" ? 1 : 0, phaseT: 0, totalSwallows: 0, pageFlash: 0, wasPump: false,
        sipsTaken: 0, canAway: canAway, cap: 12 - Math.min(3, walked), margin: 0, onLine: false, lineM: 0, ownM: 0, awayM: 0, away: false, awayLeft: 10, tilt: 0, tiltOn: false, tiltT: 0, gutI: 0, gutDrops: 0, gutTold: false, lineTold: false, lineSaid: false,
      });
      squallBtn.hidden = S.squallLeft <= 0; lineBtn.hidden = !G.line; awayBtn.hidden = !S.canAway;
      el.querySelector("." + P + "pad").hidden = false;
      last = last2 = performance.now();
      S.capQ = [];
      const first = [i === 0 ? START_LINE : i === 1 ? LINES.noon : canAway ? LINES.awayHow : LINES.lineHow, 5];
      if (walked > 0) { say(LINES.oneMoreDune + " " + LINES.walkedLink.replace("{why}", walked === 1 ? "once" : walked + " times").replace("{v}", S.cap), 6.5); S.capQ.push(first); }
      else say(first[0], first[1]);
      if (brewedNote) S.capQ.push([brewedNote, 4.5]);
      if (taste === "storm") S.capQ.push([LINES.squallHint, 4.5]);
      if (second && i < 2) S.capQ.push([LINES.awayFirst, 4.5]);
    }
    let brewedNote = "", marginY = 14;
    // ---- The Other Hand: the reversal's first appearance (a later plate of the same book) --------
    let coda = null, holdRaf = 0;
    function otherHand(winText) {
      if (!alive) return;
      el.querySelector("." + P + "pad").hidden = true;
      coda = document.createElement("div");
      coda.className = P + "coda";
      coda.innerHTML = `<div class="${P}codap" role="dialog" aria-label="The Other Hand">
        <small>The book turns itself to a later plate: the father's last walk.</small>
        <div class="${P}scene">
          <svg viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
            <circle cx="330" cy="40" r="16" fill="${C.honey}" opacity=".55" stroke="${C.ink}" stroke-width="1"/>
            <path d="M0 112 C60 96 110 120 170 104 C230 88 300 116 400 98 L400 200 L0 200Z" fill="${C.sand}" opacity=".8"/>
            <path d="M0 112 C60 96 110 120 170 104 C230 88 300 116 400 98" fill="none" stroke="${C.ink}" stroke-width="1.6"/>
            <path d="M0 150 C80 138 150 160 240 144 C300 134 350 150 400 140" fill="none" stroke="${C.ink}" stroke-width="1" opacity=".5"/>
            <g fill="${C.ink}"><circle cx="186" cy="100" r="2.6"/><circle cx="193" cy="98" r="2.6"/><circle cx="200" cy="99" r="2.6"/><circle cx="190" cy="94" r="2.4"/><circle cx="197" cy="93" r="2.4"/></g>
            <g stroke="${C.ink}" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M292 96 l3 -14 l-2 -12 M293 82 l-7 6 M293 80 l8 5 M295 96 l5 0 M290 96 l-5 1"/><circle cx="293" cy="65" r="4" fill="${C.page}"/></g>
            <g fill="${C.ink}" opacity=".55"><circle cx="214" cy="101" r="1.4"/><circle cx="228" cy="100" r="1.4"/><circle cx="243" cy="99" r="1.4"/><circle cx="258" cy="98" r="1.4"/><circle cx="273" cy="97" r="1.4"/></g>
          </svg>
          ${art.has("hand-ringed") ? pic("hand-ringed", "An older hand with a brass ring brings a cup into the plate.") : ""}
        </div>
        <p></p><p class="${P}n"></p>
        <div class="${P}choice">
          <button type="button" data-a="away"><i></i>${pic("glyph-look-away")}<span>Look away (hold, L)</span></button>
          <button type="button" data-a="page">${pic("glyph-one-more-page")}<span>One more page (Enter)</span></button>
        </div></div>`;
      const ps = coda.querySelectorAll("p");
      ps[0].textContent = LINES.otherHand; ps[1].textContent = LINES.otherNote;
      el.appendChild(coda);
      const scene = coda.querySelector("." + P + "scene");
      timers.push(setTimeout(() => scene.classList.add(P + "in"), 60));
      api.store.set("otherHandSeen", true);
      const away = coda.querySelector('[data-a="away"]'), page = coda.querySelector('[data-a="page"]'), bar = away.querySelector("i");
      let t0h = 0, chosen = false;
      const choose = (which) => {
        if (chosen) return; chosen = true;
        cancelAnimationFrame(holdRaf);
        if (which === "away") scene.classList.add(P + "still");
        away.disabled = page.disabled = true;
        ps[0].textContent = which === "away" ? LINES.lookedAway : LINES.onePage; ps[1].textContent = "";
        // a linger walks the boy further; looking away is his own
        if (which === "page") shared.set("walked", (shared.get("walked", 0) | 0) + 1); else shared.set("own", (shared.get("own", 0) | 0) + 1);
        shared.set("other_hand_seen", true); shared.set("other_hand_choice", which);
        notebook.refresh();
        // the twist ends on an ending's image: one more page is the ringed hand's way; looking away pays off once the cup is brewed
        const e = which === "page" ? ENDINGS.stayed : solved(shared) ? endingFor(shared) : null;
        if (e) endingCard(root, api, e, which === "page" ? LINES.onePage : LINES.lookedAway);
        api.end({ outcome: "win", text: `${winText} ${which === "away" ? LINES.lookedAway : LINES.onePage}` });
      };
      const tickHold = (now) => {
        if (!t0h || chosen) return;
        const k = Math.min(1, (now - t0h) / 900);
        bar.style.width = k * 100 + "%";
        if (k >= 1) choose("away"); else holdRaf = requestAnimationFrame(tickHold);
      };
      const down = (e) => { if (e) e.preventDefault(); if (chosen || t0h) return; t0h = performance.now(); holdRaf = requestAnimationFrame(tickHold); };
      const up = () => { if (chosen) return; t0h = 0; bar.style.width = "0"; cancelAnimationFrame(holdRaf); };
      away.addEventListener("pointerdown", down); away.addEventListener("pointerup", up); away.addEventListener("pointerleave", up); away.addEventListener("pointercancel", up);
      page.addEventListener("click", () => choose("page"));
      codaKey = (e, isDown) => {
        const k = e.key.toLowerCase();
        if (k === "l") { e.preventDefault(); if (isDown) { if (!e.repeat) down(); } else up(); }
        else if (k === "enter" && isDown && document.activeElement !== away) { e.preventDefault(); choose("page"); }
      };
      page.focus();
    }
    let codaKey = null;

    // ---- draw ----------------------------------------------------------------------------------
    let W = 0, H = 0, dpr = 1;
    function resize() { dpr = Math.min(2, devicePixelRatio || 1); W = el.clientWidth; H = el.clientHeight; cv.width = W * dpr; cv.height = H * dpr; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    function inkLine(pts, w, col, k) {
      g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + wob(x * 0.05, k) * 6) : g.moveTo(x, y))); g.stroke();
    }
    function drawAway() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!S.awayDrawn) { S.awayDrawn = true; g.fillStyle = "rgba(128,124,116,.5)"; g.fillRect(0, 0, W, H); }
      const bw = Math.min(W - 24, 470), bx = W / 2 - bw / 2, by = H * 0.4 - 34;
      g.fillStyle = C.page; g.fillRect(bx, by, bw, 68); g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(bx, by, bw, 68);
      g.fillStyle = C.ink; g.textAlign = "center"; g.font = "italic 17px 'EB Garamond',Georgia,serif";
      g.fillText(W < 480 ? "The plate holds still." : LINES.away, W / 2, by + 27);
      g.font = "600 15px 'EB Garamond',Georgia,serif"; g.fillText(`${Math.max(0, Math.ceil(S.awayLeft))} s of looking away left`, W / 2, by + 52);
      g.textAlign = "left";
    }
    function draw() {
      if (S.away && !S.done) { drawAway(); return; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = C.table; g.fillRect(0, 0, W, H);
      const G = stg();
      if (S.tilt > 0) {
        // the set-piece: only a back, dune-long, coming up under the plate; and the plate tips twenty degrees
        const k = S.tilt;
        g.fillStyle = "#3d2f45"; g.beginPath(); g.ellipse(W * 0.16, H * 1.04, W * 0.8, H * 0.46 * k, 0, Math.PI, 0); g.fill();
        g.strokeStyle = "rgba(201,204,211,.5)"; g.lineWidth = 1.5;
        for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(W * 0.16, H * 1.04, W * (0.8 - i * 0.07), H * 0.46 * k * (1 - i * 0.08), 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
        g.translate(W / 2, H / 2); g.rotate((k * 20 * Math.PI) / 180); g.scale(1 - 0.2 * k, 1 - 0.2 * k); g.translate(-W / 2, -H / 2);
      }
      const b = band();
      // the page: margins widen as the tea fades
      const zoom = b === 0 ? 1 : b === 1 ? 0.9 : 0.8;
      const mx = W * (1 - zoom) / 2 + 10, my = H * (1 - zoom) / 2 + 8;
      const padEl = el.querySelector("." + P + "pad"), padH = padEl && !padEl.hidden ? padEl.offsetHeight : 0;
      const pw = W - mx * 2, ph = H - my * 2 - Math.max(Math.min(90, H * 0.12), W < 520 ? padH - 6 : 0);
      // page edges stacked at the right, and the shadow
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(mx + 8, my + 8, pw, ph);
      for (let i = 4; i > 0; i--) { g.fillStyle = i % 2 ? "#e2d4b0" : "#cfbf98"; g.fillRect(mx + i * 2.5, my + i * 1.5, pw, ph); }
      g.save();
      g.beginPath(); g.rect(mx, my, pw, ph); g.clip();
      g.fillStyle = paperPat; g.fillRect(mx, my, pw, ph);
      const thin = b >= 2 && taste !== "lampash";
      const inkC = thin ? "rgba(90,90,90,.75)" : C.ink;
      const inkW = thin ? 0.9 : 1.8;
      const washA = thin ? 0.25 : 0.55;
      const s = Math.max(12, Math.min(26, pw / 34)); // px per metre
      const camX = S.x - (pw * 0.32) / s;
      const groundY = my + ph * 0.86;
      const X = (x) => mx + (x - camX) * s, Y = (h) => groundY - h * s;
      // sky wash and sun
      const dusk = S.phase === 2;
      g.globalAlpha = washA; g.fillStyle = dusk ? "#8d86a8" : S.phase === 1 ? "#cfd6c8" : C.sky; g.fillRect(mx, my, pw, ph * 0.5);
      if (dusk) { g.globalAlpha = washA * 0.6; g.fillStyle = C.bruise; g.fillRect(mx, my, pw, ph * 0.22); }
      const sx = mx + pw * 0.82, sy = my + ph * (dusk ? 0.2 : 0.18);
      if (!dusk) {
        g.globalAlpha = washA * (0.3 + S.heat / 140); g.fillStyle = C.honey;
        g.beginPath(); g.arc(sx, sy, 28 + S.heat * 0.14 + S.phase * 6, 0, 7); g.fill();
        g.globalAlpha = 1; g.strokeStyle = inkC; g.lineWidth = inkW * 0.7;
        g.beginPath(); g.arc(sx, sy, 24, 0, 7); g.stroke();
        for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283 + S.t * 0.05; const r0 = 32, r1 = 42 + (i % 2) * 6 + S.phase * 6; g.beginPath(); g.moveTo(sx + r0 * Math.cos(a), sy + r0 * Math.sin(a)); g.lineTo(sx + r1 * Math.cos(a), sy + r1 * Math.sin(a)); g.stroke(); }
      } else {
        g.globalAlpha = 0.9; g.fillStyle = C.silver; g.beginPath(); g.arc(sx, sy, 22, 0, 7); g.fill();
        g.globalAlpha = 1; g.strokeStyle = inkC; g.lineWidth = inkW * 0.7; g.beginPath(); g.arc(sx, sy, 22, 0, 7); g.stroke();
        g.fillStyle = "#f6f2e6"; for (let i = 0; i < 18; i++) g.fillRect(mx + ((i * 97) % 1000) / 1000 * pw, my + 30 + ((i * 53) % 100) / 100 * ph * 0.3, 1.6, 1.6);
      }
      g.globalAlpha = 1;
      // far dunes (parallax wash)
      g.globalAlpha = washA * 0.6; g.fillStyle = C.ochre;
      g.beginPath(); g.moveTo(mx, groundY);
      for (let px = 0; px <= pw + 8; px += 8) { const wx = camX * 0.35 + px / s; g.lineTo(mx + px, groundY - s * (5 + 2 * Math.sin(wx / 17) + Math.sin(wx / 6.1))); }
      g.lineTo(mx + pw, groundY + 40); g.lineTo(mx, groundY + 40); g.fill(); g.globalAlpha = 1;
      // the tall dunes that cast the shade: a back wash behind each shade zone
      for (const [a, c] of shades) {
        if (X(c + 10) < mx || X(a - 10) > mx + pw) continue;
        const mid = (a + c) / 2, half = (c - a) / 2 + 9;
        g.globalAlpha = washA * 0.9; g.fillStyle = C.ochre; g.beginPath(); g.moveTo(X(mid - half), groundY);
        for (let t = 0; t <= 1.0001; t += 0.05) { const xx = mid - half + t * 2 * half; g.lineTo(X(xx), Y(base(xx) + 8 * Math.sin(Math.PI * t) ** 1.5)); }
        g.lineTo(X(mid + half), groundY + 40); g.lineTo(X(mid - half), groundY + 40); g.fill(); g.globalAlpha = 1;
        g.strokeStyle = inkC; g.lineWidth = inkW * 0.7; g.beginPath();
        for (let t = 0; t <= 1.0001; t += 0.05) { const xx = mid - half + t * 2 * half; const yy = Y(base(xx) + 8 * Math.sin(Math.PI * t) ** 1.5); t ? g.lineTo(X(xx), yy) : g.moveTo(X(xx), yy); }
        g.stroke();
      }
      // the ground: two watercolour washes with a pooled edge, then the ink line
      const pts = [];
      for (let px = -8; px <= pw + 8; px += 5) { const wx = camX + px / s; pts.push([mx + px, Y(hAt(wx))]); }
      for (const [off, col, a] of (S.phase === 2 ? [[3, C.silver, washA * 1.2], [-2, "#a59cb8", washA * 0.6]] : [[3, C.sand, washA], [-2, C.ochre, washA * 0.6]])) {
        g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1] + off);
        for (const [x, y] of pts) g.lineTo(x, y + off + wob(x * 0.03, 2) * 5);
        g.lineTo(mx + pw + 8, my + ph); g.lineTo(mx - 8, my + ph); g.fill();
      }
      g.globalAlpha = 1;
      for (const [a, c] of shades) {
        if (X(c) < mx || X(a) > mx + pw) continue;
        g.save(); g.beginPath(); g.moveTo(X(a), Y(hAt(a)));
        for (let xx = a; xx <= c; xx += 0.5) g.lineTo(X(xx), Y(hAt(xx)));
        g.lineTo(X(c), my + ph); g.lineTo(X(a), my + ph); g.closePath();
        g.globalAlpha = washA * 0.7; g.fillStyle = C.bruise; g.fill(); g.clip(); g.globalAlpha = 1;
        g.strokeStyle = thin ? "rgba(110,74,120,.35)" : "rgba(110,74,120,.75)"; g.lineWidth = 0.8;
        for (let hx = X(a) - 40; hx < X(c); hx += 7) { g.beginPath(); g.moveTo(hx, my + ph); g.lineTo(hx + 40, groundY - 6 * s); g.stroke(); }
        g.restore();
        g.fillStyle = inkC; g.font = "italic 14px 'EB Garamond',Georgia,serif"; g.fillText("dune shade", X(a), Y(hAt(a)) - 8);
      }
      inkLine(pts, inkW, inkC, 1);
      // the gutter: the fold in the middle of the spread, where the two pages meet
      for (const gx of gutters) {
        const x = X(gx); if (x < mx - 40 || x > mx + pw + 40) continue;
        const gr = g.createLinearGradient(x - 34, 0, x + 34, 0);
        gr.addColorStop(0, "rgba(43,29,18,0)"); gr.addColorStop(0.5, "rgba(43,29,18,.42)"); gr.addColorStop(1, "rgba(43,29,18,0)");
        g.fillStyle = gr; g.fillRect(x - 34, my, 68, ph);
        g.strokeStyle = C.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, my); g.lineTo(x, my + ph); g.stroke();
        g.strokeStyle = "rgba(241,230,204,.8)"; g.lineWidth = 2; g.setLineDash([8, 12]); g.beginPath(); g.moveTo(x + 2, my + 60); g.lineTo(x + 2, my + ph); g.stroke(); g.setLineDash([]);
        g.fillStyle = "rgba(241,230,204,.92)"; g.fillRect(x - 62, Y(hAt(gx)) - 74, 124, 22);
        g.fillStyle = C.ink; g.font = "italic 14px 'EB Garamond',Georgia,serif"; g.textAlign = "center"; g.fillText("the gutter: 8 m/s", x, Y(hAt(gx)) - 58); g.textAlign = "left";
      }
      // the written line: a faint ink path above the sand; it darkens while it is ridden
      if (G.line) {
        g.strokeStyle = S.onLine ? C.honey : thin ? "rgba(90,90,90,.5)" : "rgba(43,29,18,.45)"; g.lineWidth = S.onLine ? 3 : 1.1; g.setLineDash(S.onLine ? [] : [10, 7]);
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - 0.9 * s) : g.moveTo(x, y - 0.9 * s))); g.stroke(); g.setLineDash([]);
        // the plate's top edge: above it the paper is blank, and a fast crest jump lands a rider there
        const bandB = my + (pw < 520 ? 72 : 54), edgeY = bandB + Math.max(118, Math.min(150, s * 5.4));
        marginY = (groundY - edgeY) / s;
        g.fillStyle = "rgba(241,230,204,.9)"; g.fillRect(mx, bandB, pw, edgeY - bandB);
        g.strokeStyle = "rgba(43,29,18,.45)"; g.lineWidth = 1; g.setLineDash([2, 6]); g.beginPath(); g.moveTo(mx, edgeY); g.lineTo(mx + pw, edgeY); g.stroke(); g.setLineDash([]);
        g.fillStyle = "rgba(43,29,18,.6)"; g.font = "italic 14px 'EB Garamond',Georgia,serif"; g.fillText("the plate's top edge; blank paper above", mx + 16, edgeY + 16);
      }
      // breaking lips: an ink curl with spray
      for (const w of waves) {
        const Hh = waveH(w);
        if (Hh < 4) continue;
        const cx = X(w.x), cy = Y(hAt(w.x));
        const curl = Math.min(1, (Hh - 4) / 2) * s * 1.6;
        g.strokeStyle = inkC; g.lineWidth = inkW * 1.1;
        g.beginPath(); g.moveTo(cx - s, cy + 4); g.quadraticCurveTo(cx + curl * 0.6, cy - curl * 0.9, cx + curl * 1.4, cy + curl * 0.4); g.stroke();
        if (Hh > 5) {
          g.globalAlpha = washA; g.fillStyle = C.ochre; g.beginPath(); g.moveTo(cx - s, cy + 4); g.quadraticCurveTo(cx + curl * 0.6, cy - curl * 0.9, cx + curl * 1.4, cy + curl * 0.4); g.lineTo(cx + curl, cy + curl); g.fill(); g.globalAlpha = 1;
          g.fillStyle = inkC;
          for (let i = 0; i < 14; i++) { const t = (i * 37 + Math.floor(S.t * 10)) % 23; g.fillRect(cx + curl * 1.2 + (t % 7) * 3, cy + curl * 0.3 + (t % 5) * 4 - 6, 1.5, 1.5); }
          g.font = "italic 14px 'EB Garamond',Georgia,serif"; g.fillText("breaking", cx - 14, cy - curl - 8);
        }
      }
      // prickles and webs
      for (const p of prickles) {
        const x = X(p.x); if (x < mx - 20 || x > mx + pw + 20) continue;
        const y = Y(hAt(p.x));
        g.globalAlpha = washA; g.fillStyle = C.sage; g.beginPath(); g.ellipse(x, y - 6, 12, 8, 0, 0, 7); g.fill(); g.globalAlpha = 1;
        g.strokeStyle = inkC; g.lineWidth = inkW * 0.6;
        for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + Math.cos(a) * 15, y - 4 + Math.sin(a) * 12); g.stroke(); }
      }
      for (const w of webs) {
        const x = X(w.x); if (x < mx - 30 || x > mx + pw + 30) continue;
        const y = Y(hAt(w.x));
        g.strokeStyle = thin ? "rgba(110,74,120,.5)" : C.bruise; g.lineWidth = inkW * 0.8;
        for (let i = 0; i < 8; i++) { const a = Math.PI + (i / 7) * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 18); g.stroke(); }
        for (const r of [8, 15, 21]) { g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.stroke(); }
      }
      // the rider
      const rx = X(S.x), ry = Y(S.air ? S.y : hAt(S.x) + (S.onLine ? 0.9 : 0));
      const slope = S.air ? 0 : slopeAt(S.x);
      const lean = (keys.back ? -0.35 : keys.fwd ? 0.25 : 0) + Math.atan(-slope) * 0.4;
      const xs = spr["sprite-xandri"];
      if (xs) {
        // the Xandri figure: feet (the leaf shoes) at the sand, leaning with the slope and the stick
        const hpx = Math.max(74, Math.min(120, s * 4.6)), wpx = hpx * 0.8;
        const crouch2 = keys.pump && !S.air ? 0.9 : 1;
        g.save(); g.translate(rx, ry); g.rotate(Math.atan(-slope) * 0.7 + lean * 0.5);
        g.globalAlpha = thin ? 0.55 : 1;
        g.drawImage(xs, -wpx * 0.52, -hpx * 0.86 * crouch2, wpx, hpx * crouch2);
        g.restore(); g.globalAlpha = 1;
      } else {
      g.save(); g.translate(rx, ry); g.rotate(Math.atan(-slope) * 0.7);
      g.globalAlpha = washA + 0.2; g.fillStyle = "#6f8f3a"; g.beginPath(); g.ellipse(0, -2, 18, 5, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = inkC; g.lineWidth = inkW; g.beginPath(); g.ellipse(0, -2, 18, 5, 0, 0, 7); g.stroke();
      g.rotate(lean);
      const crouch = keys.pump && !S.air ? 6 : 0;
      g.beginPath(); g.moveTo(-7, -4); g.lineTo(-2, -18 + crouch); g.lineTo(0, -34 + crouch); g.moveTo(7, -4); g.lineTo(3, -18 + crouch); g.lineTo(0, -34 + crouch);
      g.moveTo(0, -34 + crouch); g.lineTo(2, -50 + crouch); g.moveTo(1, -46 + crouch); g.lineTo(-14, -38 + crouch); g.moveTo(1, -46 + crouch); g.lineTo(16, -52 + crouch); g.stroke();
      g.globalAlpha = washA + 0.2; g.fillStyle = "#8a5a3a"; g.beginPath(); g.ellipse(-6, -40 + crouch, 6, 9, -0.3, 0, 7); g.fill(); g.globalAlpha = 1; // the patched pack
      g.fillStyle = C.page; g.beginPath(); g.arc(3, -57 + crouch, 7, 0, 7); g.fill(); g.stroke();
      g.restore();
      }
      if (S.swallowed) {
        g.globalAlpha = 0.8; g.fillStyle = C.sand; g.beginPath(); g.ellipse(rx, ry - 20, 34, 30, 0, 0, 7); g.fill(); g.globalAlpha = 1;
        g.strokeStyle = inkC; g.lineWidth = inkW; g.beginPath(); g.ellipse(rx, ry - 20, 34, 30, 0, 0, 7); g.stroke();
        g.fillStyle = C.ink; g.font = "600 17px 'EB Garamond',Georgia,serif"; g.textAlign = "center";
        g.fillText("Dig! Tap Pump / Dig fast (E)", rx, ry - 64);
        g.fillStyle = C.honey; g.fillRect(rx - 40, ry - 56, 80 * Math.min(1, S.swallowed.p), 6); g.strokeRect(rx - 40, ry - 56, 80, 6); g.textAlign = "left";
      }
      // flourishes: ink splash on a jump, a puff on landing, a red blot on a hit, a green ring on a sip
      for (const f of S.fx) {
        const fxX = X(f.x), fyY = Y(f.y), k = f.t / 0.8;
        g.globalAlpha = 1 - k;
        if (f.kind === "jump") { g.strokeStyle = C.ink; g.lineWidth = 1.5; for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; g.beginPath(); g.moveTo(fxX + Math.cos(a) * 10, fyY + Math.sin(a) * 6); g.lineTo(fxX + Math.cos(a) * (14 + k * 26), fyY + Math.sin(a) * (8 + k * 18)); g.stroke(); } }
        else if (f.kind === "land") { g.fillStyle = S.phase === 2 ? C.silver : C.ochre; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(fxX + (i - 4) * 5 * (1 + k), fyY - k * 10 - (i % 3) * 3, 2.2, 0, 7); g.fill(); } }
        else if (f.kind === "hit") { g.fillStyle = "rgba(168,67,44,.55)"; g.beginPath(); g.arc(X(S.x), Y(S.air ? S.y : hAt(S.x)) - 28, 18 + k * 30, 0, 7); g.fill(); }
        else if (f.kind === "sip") {
          const hs = spr["hand-elaris"], kk = f.t / 1.8;
          if (hs) { const hw = Math.min(360, pw * 0.62), hh = hw / 2, slide = kk < 0.3 ? kk / 0.3 : kk > 0.75 ? (1 - kk) / 0.25 : 1; g.globalAlpha = 1; g.drawImage(hs, mx - hw * (1 - slide) - hw * 0.08, my + ph - hh - 62, hw, hh); }
          else { g.globalAlpha = Math.max(0, 1 - kk); g.strokeStyle = C.sage; g.lineWidth = 4; g.beginPath(); g.arc(mx + 46, my + ph - 52, 30 + kk * 40, 0, 7); g.stroke(); }
        }
      }
      g.globalAlpha = 1;
      if (S.pageFlash > 0 && !api.reducedMotion) {
        const k = S.pageFlash / 0.6, cw = pw * 0.25 * k;
        g.fillStyle = "rgba(255,250,235,.85)"; g.beginPath(); g.moveTo(mx + pw, my); g.lineTo(mx + pw - cw, my); g.quadraticCurveTo(mx + pw - cw * 0.4, my + ph * 0.5, mx + pw, my + ph); g.fill();
        g.strokeStyle = C.ink; g.lineWidth = 1; g.stroke();
      }
      if (S.hot > 0) {
        // the heat blurs the page: a honey haze and a shimmer drawn in ink
        g.fillStyle = "rgba(212,162,58,.28)"; g.fillRect(mx, my, pw, ph);
        g.strokeStyle = "rgba(43,29,18,.25)"; g.lineWidth = 1;
        for (let k = 0; k < 6; k++) {
          const yy = my + ph * (0.35 + k * 0.08);
          g.beginPath(); for (let xx = 0; xx <= pw; xx += 12) { const v = yy + Math.sin(xx * 0.05 + S.t * (api.reducedMotion ? 0 : 6) + k) * 3; xx ? g.lineTo(mx + xx, v) : g.moveTo(mx + xx, v); } g.stroke();
        }
      }
      // the top margin: the map that draws itself, on a band of clean paper
      const foldOn = !!spr["corner-fold-rest"], foldS = pw < 520 ? 44 : 54;
      const my0 = my + 16, mlx = mx + 20, mlw = Math.max(110, pw - 130 - (foldOn ? foldS : 0));
      const bandH = pw < 520 ? 72 : 54;
      g.fillStyle = "rgba(241,230,204,.92)"; g.fillRect(mx, my, pw, bandH);
      g.strokeStyle = "rgba(43,29,18,.35)"; g.beginPath(); g.moveTo(mx, my + bandH); g.lineTo(mx + pw, my + bandH); g.stroke();
      g.strokeStyle = C.ink; g.lineWidth = 1.6; g.beginPath();
      const prog = Math.min(1, S.maxX / LEN);
      for (let i = 0; i <= 60 * prog; i++) { const t = i / 60; const x = mlx + t * mlw, y = my0 + 6 + Math.sin(t * 19) * 3; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      g.setLineDash([3, 4]); g.lineWidth = 1; g.beginPath(); g.moveTo(mlx + prog * mlw, my0 + 6); g.lineTo(mlx + mlw, my0 + 6); g.stroke(); g.setLineDash([]);
      for (let c = CHECK; c < LEN; c += CHECK) { g.beginPath(); g.moveTo(mlx + (c / LEN) * mlw, my0); g.lineTo(mlx + (c / LEN) * mlw, my0 + 12); g.stroke(); }
      for (const P2 of PHASES.slice(1)) { g.fillStyle = C.bruise; g.beginPath(); g.arc(mlx + (P2.at / LEN) * mlw, my0 + 6, 3, 0, 7); g.fill(); }
      g.beginPath(); g.moveTo(mlx + mlw, my0 + 14); g.lineTo(mlx + mlw, my0 - 10); g.stroke();
      g.fillStyle = C.ochre; g.beginPath(); g.moveTo(mlx + mlw, my0 - 10); g.lineTo(mlx + mlw + 12, my0 - 6); g.lineTo(mlx + mlw, my0 - 2); g.fill();
      g.fillStyle = C.ink; g.font = "italic 14px 'EB Garamond',Georgia,serif"; g.fillText("the mark", mlx + mlw + 16, my0 + 2);
      g.font = "600 14px 'EB Garamond',Georgia,serif";
      const hud0 = `${Math.floor(S.x)} m · ${S.phaseName || PHASES[0].name}`;
      g.fillText(hud0, mlx, my0 + 30);
      const tw0 = g.measureText(hud0).width;
      let hx = mlx + tw0 + 22, hy = my0 + 30;
      if (hx + 190 > mx + pw) { hx = mlx; hy = my0 + 50; }   // narrow page: heat on its own line
      if (G.line) g.fillText(`his own ${Math.round(S.ownM)} m · the line's ${Math.round(S.lineM)} m`, hx, hy);
      else if (S.cap < 12) g.fillText(`tired feet: ${S.cap} m/s at most`, hx, hy);
      if (G.heat && S.phase < 2) {
        g.fillText("heat", hx, hy);
        g.strokeRect(hx + 34, hy - 10, 80, 11); g.fillStyle = S.hot > 0 || S.heat > 80 ? "#a8432c" : C.honey; g.fillRect(hx + 34, hy - 10, 0.8 * S.heat, 11);
        if (S.hot > 0) { g.fillStyle = "#a8432c"; g.fillText("too hot", hx + 120, hy); }
      }
      g.fillStyle = C.ink;
      const swText = `under ${S.swallows}/3`, swW = g.measureText(swText).width;
      const swx = mx + pw - swW - 16 - (foldOn ? foldS : 0), swy = (hy === my0 + 30 && swx < hx + 190 && (S.phase < 2 || G.line || S.cap < 12)) || swx < mlx + tw0 + 16 ? my0 + 50 : my0 + 30;
      g.fillText(swText, swx, swy);
      // page number
      g.fillText(`~ ${47 + Math.floor(S.x / CHECK)} ~`, mx + pw / 2 - 14, my + ph - 10);
      // the page's corner fold: it lifts as a page turns
      if (foldOn) {
        const fid = S.done && S.x >= LEN ? "corner-fold-turned" : S.pageFlash > 0 ? "corner-fold-lifted" : "corner-fold-rest";
        g.drawImage(spr[fid] || spr["corner-fold-rest"], mx + pw - foldS, my, foldS, foldS);
        g.strokeStyle = "rgba(43,29,18,.5)"; g.lineWidth = 1; g.strokeRect(mx + pw - foldS + 0.5, my + 0.5, foldS - 1, foldS - 1);
      }
      // the squall: slanted rain over the plate
      if (S.squall > 0) {
        g.strokeStyle = "rgba(93,111,134,.55)"; g.lineWidth = 1.2; g.beginPath();
        for (let i = 0; i < 46; i++) { const rx0 = mx + ((i * 73 + Math.floor(S.t * (api.reducedMotion ? 0 : 240))) % Math.max(1, Math.floor(pw))), ry0 = my + bandH + ((i * 131) % Math.max(1, Math.floor(ph - bandH - 20))); g.moveTo(rx0, ry0); g.lineTo(rx0 - 6, ry0 + 16); }
        g.stroke();
        g.fillStyle = "rgba(241,230,204,.9)"; g.fillRect(mx + pw / 2 - 70, my + ph - 48, 140, 22); g.fillStyle = C.ink; g.textAlign = "center"; g.fillText(`squall ${Math.ceil(S.squall)} s`, mx + pw / 2, my + ph - 32); g.textAlign = "left";
      }
      g.restore();

      // the cup vignette, bottom-left of the page
      const cx = mx + 46, cy = my + ph - 52;
      const vig = spr[VIG[S.tea >= 85 ? 0 : S.tea >= 65 ? 1 : S.tea >= 45 ? 2 : S.tea >= 25 ? 3 : S.tea > 5 ? 4 : 5]];
      if (vig) g.drawImage(vig, cx - 40, cy - 44, 80, 80);
      else {
      g.fillStyle = "rgba(241,230,204,.9)"; g.strokeStyle = C.ink; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(cx - 24, cy - 24); g.lineTo(cx - 18, cy + 18); g.quadraticCurveTo(cx, cy + 26, cx + 18, cy + 18); g.lineTo(cx + 24, cy - 24); g.closePath(); g.fill(); g.stroke();
      const lvl = Math.max(0, Math.min(1, S.tea / 100));
      g.save(); g.clip(); g.fillStyle = C.sage; g.fillRect(cx - 26, cy + 24 - lvl * 48, 52, 48); g.restore();
      g.beginPath(); g.moveTo(cx - 24, cy - 24); g.lineTo(cx - 18, cy + 18); g.quadraticCurveTo(cx, cy + 26, cx + 18, cy + 18); g.lineTo(cx + 24, cy - 24); g.stroke();
      g.beginPath(); g.arc(cx + 28, cy - 4, 9, -1.4, 1.4); g.stroke();
      }
      if (S.sipHold > 0) { g.strokeStyle = C.honey; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 34, -1.57, -1.57 + (S.sipHold / 1.5) * 6.283); g.stroke(); }
      g.fillStyle = "rgba(241,230,204,.9)"; g.fillRect(cx - 34, cy + 30, 150, 20);
      g.fillStyle = b >= 1 ? "#7a2f1e" : C.ink; g.font = "600 14px 'EB Garamond',Georgia,serif";
      g.fillText(`tea ${Math.round(S.tea)} · “${handsOff() ? "I" : ["I", "he", "he", "—"][b]}”${b === 2 ? (handsOff() ? " (his own)" : " (thin)") : ""}`, cx - 30, cy + 45);
      if (taste !== "mint" && pw >= 520) { const tn = CUPS.find((c) => c.id === taste).name.toLowerCase() + " in the cup"; g.font = "italic 14px 'EB Garamond',Georgia,serif"; const tw = g.measureText(tn).width; g.fillStyle = "rgba(241,230,204,.9)"; g.fillRect(cx + 122, cy + 30, tw + 12, 20); g.fillStyle = C.ink; g.fillText(tn, cx + 128, cy + 45); g.font = "600 14px 'EB Garamond',Georgia,serif"; }
      if (b >= 1 && S.sips > 0 && !S.done) { g.fillStyle = "rgba(241,230,204,.9)"; g.fillRect(cx + 40, cy - 26, 196, 22); g.fillStyle = C.ink; g.fillText(`hold Sip (S): ${S.sips} sip${S.sips > 1 ? "s" : ""} left`, cx + 44, cy - 10); }
      // caption, bottom centre
      if (S.capT > 0 && S.caption) {
        g.font = "italic 17px 'EB Garamond',Georgia,serif"; g.textAlign = "center";
        const maxW = Math.max(160, Math.min(pw - 40, 620));
        const words = S.caption.split(" "), lines = []; let line = "";
        for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
        lines.push(line);
        const cyc = my + (pw < 520 ? 96 : 78) + (S.tilt > 0 ? Math.min(1, (S.tiltT || 0) / 5) * ph * 0.42 : 0) + (G.line && S.tilt <= 0 ? Math.max(118, Math.min(150, s * 5.4)) + 22 : 0);
        g.fillStyle = "rgba(241,230,204,.93)"; g.fillRect(mx + pw / 2 - maxW / 2 - 10, cyc - 18, maxW + 20, lines.length * 21 + 10);
        g.strokeStyle = "rgba(43,29,18,.4)"; g.lineWidth = 1; g.strokeRect(mx + pw / 2 - maxW / 2 - 10, cyc - 18, maxW + 20, lines.length * 21 + 10);
        g.fillStyle = C.ink; lines.forEach((l, i) => g.fillText(l, mx + pw / 2, cyc + i * 21));
        g.textAlign = "left";
        // a fleuron under the caption as the day turns
        const fl = S.phaseT > 0 ? spr[S.phase === 1 ? "fleuron-sand" : "fleuron-moon"] : S.t < 3.5 ? spr["fleuron-wave"] : null;
        if (fl) { const fw = Math.min(240, maxW); g.drawImage(fl, mx + pw / 2 - fw / 2, cyc - 8 + lines.length * 21, fw, fw / 5); }
      }
    }

    let raf = 0, last = performance.now(), last2 = performance.now();
    function loop(now) {
      last = now;
      const real = Math.min(0.25, (now - last2) / 1000); last2 = now;
      if (S.started && !S.done) { let r = real; while (r > 1e-4 && !S.done) { const st = Math.min(0.03, r); update(st); r -= st; } }
      draw();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}plate" role="dialog" aria-label="How to play">
      ${art.has("heading-c4") ? `<img class="${P}head" src="${art.url("heading-c4")}" alt="">` : ""}
      <svg viewBox="0 0 400 90" aria-hidden="true" ${art.has("heading-c4") ? 'style="display:none"' : ""}><rect x="1" y="1" width="398" height="88" fill="none" stroke="${C.ink}"/>
        <path d="M0 70 C60 66 90 30 130 34 C160 37 170 60 200 62 C250 66 280 28 330 36 C360 40 380 58 400 60 L400 90 L0 90Z" fill="${C.sand}" opacity=".7"/>
        <path d="M0 70 C60 66 90 30 130 34 C160 37 170 60 200 62 C250 66 280 28 330 36 C360 40 380 58 400 60" fill="none" stroke="${C.ink}" stroke-width="1.6"/>
        <path d="M118 36 l4 -14 l3 -12 M120 22 l-10 6 M121 20 l10 -4" stroke="${C.ink}" stroke-width="1.6" fill="none"/><circle cx="125" cy="6" r="4" fill="${C.page}" stroke="${C.ink}"/>
        <circle cx="350" cy="18" r="10" fill="${C.honey}" opacity=".6" stroke="${C.ink}"/></svg>
      <small class="${P}platename">Plate IV. The torrent waves, mid-morning.</small>
      <h2>Living illustration</h2>
      <p class="${P}goal"><b>Goal:</b> ride Xandri across each plate before the tea runs out. Three plates: teach, test, twist. You can stop after any of them.</p>
      <ul>
        <li><kbd>Pump · Space</kbd><span>Hold down a wave's face to gain speed. Let go at a crest to jump.</span></li>
        <li><kbd>Jump</kbd><span>Clears prickle bushes and, later, vine webs.</span></li>
      </ul>
      <p style="font-size:15px;margin:0 0 12px;font-style:italic">Slow under a breaking lip, and the sand swallows you. More controls arrive as the day turns.${gentle ? " " + LINES.gentle : ""}</p>
      <div class="${P}cups" role="group" aria-label="The cup you brewed">${CUPS.map((c) => `<button type="button" data-cup="${c.id}" aria-pressed="${c.id === "mint"}">${pic(c.art)}<span>${c.name}</span></button>`).join("")}</div>
      <p class="${P}cupnote"></p>
      ${reached > 0 ? `<div class="${P}start" role="group" aria-label="Start at">${STG.slice(0, reached + 1).map((n, k) => `<button type="button" data-s="${k}" aria-pressed="${k === 0}">${k + 1}. ${n.name.split(":")[0]}</button>`).join("")}</div>` : ""}
      <button type="button" class="${P}go">Begin the page</button></div>`;
    el.appendChild(intro);
    const cupNote = intro.querySelector("." + P + "cupnote");
    const setCup = (id) => { if (!CUPS.some((c) => c.id === id)) id = "mint"; taste = id; intro.querySelectorAll("[data-cup]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cup === id))); cupNote.textContent = "The cup colours the page. " + CUPS.find((c) => c.id === id).note; };
    intro.querySelectorAll("[data-cup]").forEach((b) => b.addEventListener("click", () => setCup(b.dataset.cup)));
    // layer link: the cup poured at the pantry table is the cup beside this page
    const brewed = shared.get("tea_played", false) ? shared.get("cup_taste", "mint") : null;
    setCup(brewed || api.store.get("cup", "mint"));
    if (brewed) {
      const bn = CUPS.find((c) => c.id === brewed) || CUPS[0];
      brewedNote = LINES.cupLink.replace("{cup}", bn.name.toLowerCase());
      const n = document.createElement("p"); n.className = P + "brewed"; n.textContent = brewedNote;
      intro.querySelector("." + P + "cups").before(n);
    }
    let startAt = 0;
    intro.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => {
      startAt = +b.dataset.s; intro.querySelectorAll("[data-s]").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
      intro.querySelector("." + P + "platename").textContent = STG[startAt].plate;
    }));
    intro.querySelector("." + P + "go").addEventListener("click", () => {
      intro.remove(); api.store.set("cup", taste);
      if (brewed && taste !== brewed) brewedNote = "";
      startStage(startAt);
    });
    intro.querySelector("." + P + "go").focus();
    const notebook = mountNotebook(root, api, { into: el.querySelector("." + P + "pad ." + P + "grp"), short: true });

    return {
      unmount() {
        alive = false; cancelAnimationFrame(holdRaf); notebook.unmount();
        cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro.disconnect();
        removeEventListener("keydown", onDown); removeEventListener("keyup", onUp);
        for (const [b, d, u] of ptr) { b.removeEventListener("pointerdown", d); b.removeEventListener("pointerup", u); b.removeEventListener("pointercancel", u); b.removeEventListener("pointerleave", u); }
      },
    };
  },
};

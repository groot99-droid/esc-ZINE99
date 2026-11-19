// The Endless Temple / The Naming (1D, word assembly). Style: Bookbinder's gold tooling.
// DESIGN.md section 11, The Naming, played as three title pages in one sitting, as the design's
// appearances table grows: g_name_c5 (the weather book of Hollin: 2 templates), g_name_c7 (the road
// book: 3 templates, sand-book tiles drift in as false friends), g_name_c9 (the sand book: 4
// templates, a tile from the fate must be used, tiles from the other books drift in).
// Elaris's task, in the source's words, is on the third page: DESIGN.md section 3 beat 8, verbatim,
// from creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md. The chapter
// title "The Never-Ending Dunes and The Wondering Xandrixes" is the source's; rebuilding it adds the
// design's (added) line on the final card. Book One's motif tiles are the design's list; the Hollin
// and Procession tiles are drawn from the design's lore bible (section 5 and 6) for the game.
//
// Actions: choose a template; set a tile in a slot (or clear one); Inspect a tile (three glances
// back into the books per page: says which book a tile came from); Inscribe when the rules hold.
// There is no failure: the page waits, and the gutter runs until the book is named.
// Art (api.art): every motif tile is its tooling stamp (pieces/stamp-*), each book shows its own
// cartouche plate, a figure from the book stands by the page, and the last card is the ninth
// frontispiece. The lettered tiles stay as the fallback.
// Phase 2 (DEEP_DIVE.md section 3, The Naming): the three pages are a ladder. Teach: three threads.
// Test: false friends, and blind tooling (a tile for something only heard about, never witnessed,
// presses without gold; one blind tile a title). Twist: the name must be true. True ink: "End" takes
// in no title, because no page shows it; "Proof" takes only if Xandri passed the mark (the living
// illustration ridden to its end). The set-piece: tilt the lamp (K) and the sand book's cartouche
// shows a title scraped away in the old keeper's hand, "The Desert That Ends". He could not make it take.
// A page can be the last: after each inscription the player may stop with a result. api.store keeps
// the stage reached; api.shared is read for passed_mark.
// Phase 3 (DEEP_DIVE.md section 3; shared rules in _ledger.js): the scraped title is a piece of the
// long puzzle. The lamp rakes from three sides (K turns it: from the left, from the right, from above),
// and each side raises a different part of the old keeper's title; read whole, it is written to
// api.shared (scraped_title). True ink will not take over another hand's title until it has been read.
// The twist ends on The Named Book's card. Second run: the scraped title shows through without the lamp.

import { mountNotebook, sharedOf, secondRun, endingCard, ENDINGS } from "./_ledger.js";

const SOURCE_TASK = "Well, I guess since this one doesn't have a name, I'll just have to read this one and find out what to call it,";
const AUTHOR = ["Never-Ending", "Dunes", "Wondering", "Xandrixes"];
const ADDED_AUTHOR_LINE = "Elaris thought the name had been waiting for him."; // DESIGN.md section 11 (added line)

// Narration written for the game (not quotations).
const LINES = {
  p1: "The weather book of Hollin lies quiet now that its storm has moved on. It still has no name, and rain beads in its gutter.",
  p2: "The road book. A few grains of sand have got between its pages from the book beside it.",
  p3: "The sand book itself, the one that started it. Its gutter runs with sand.",
  inked: "The ink sets in gold, and the gutter stops running.",
  foreign: "The ink beads and will not take: one of these tiles drifted in from another book.",
  fate: "This book was changed by what happened past the mark. Its name must carry the fate: Wake, or Past the Mark.",
  end: "Three books named, and three gutters dry: {names}. The books rest.",
  inspectNew: "New: Inspect a tile (I) to see which book it came from. Three glances a page.",
  blindNew: "And a tile for a thing only heard about, never seen on a page, presses blind, without gold. A title carries one blind tile at most.",
  blindTwo: "Two of these were only ever heard about. A title carries one blind tile at most.",
  trueNew: "Here the ink is true ink: it takes only what a page has shown. Tilt the lamp (K) to look at the cartouche.",
  trueEnd: "<b>End</b> will not take. No page he has read shows the end of the desert, and true ink does not write what was never there to read.",
  trueProof: "<b>Proof</b> will not take. In the pages read so far Xandri has not passed the mark.",
  proofLink: "Because you rode the living illustration past the mark, Proof takes the ink here.",
  raking: "Under the raking light the cartouche shows a title scraped away, in the old keeper's hand: \u201cThe Desert That Ends\u201d. He could not make it take.",
  // phase 3
  rakeSides: ["From the left, the lamp raises two scraped words: \u201cThe Desert\u201d.", "From the right, one word between them: \u201cThat\u201d.", "From above, the last word, pressed hardest: \u201cEnds\u201d."],
  rakeMore: " Turn the lamp again (K): {n} more side{s}.",
  overTitle: "The ink will not take over another hand's title. Something was scraped out of this cartouche: rake the lamp across it (K) and read what is under it first.",
  secondShow: "A second reading: the scraped title shows through the cartouche now without the lamp, in the old keeper's slanted hand.",
  endShort: "The sand book is named: {names}. Its gutter is dry, and the book rests.",
  stop1: "One book named: {names}. It rests, and its gutter is dry. The road book and the sand book still wait on the table.",
  stop2: "Two books named: {names}. They rest. The sand book still runs in its gutter.",
};
const STAGE_NAMES = ["Teach: three threads", "Test: false friends", "Twist: the name must be true"];

const CONNECTORS = ["The", "of", "and", "Who", "-less", "Never-"];
const T1 = ["The", null, null, "of", null], T2 = [null, "and the", null, null], T3 = ["The", null, "Who", null, "the", null], T4 = ["The", null, null, "and The", null, null];
const PAGES = [
  { scene: "g_name_c5", book: "the weather book", fluid: "rain", open: LINES.p1, templates: [T1, T2],
    threads: { Place: ["Hollin", "Hill", "Sky", "Bell-loft"], Person: ["Pell", "Clerk", "Bakers", "Bell-ringer"], Want: ["Tomorrow", "Windows", "Fair Weather"] }, foreign: {}, heard: [] },
  { scene: "g_name_c7", book: "the road book", fluid: "ink", open: LINES.p2, templates: [T1, T2, T3],
    threads: { Place: ["Road", "Plain", "Grey Grass", "Dusk", "Dunes", "Waves"], Person: ["Oda", "Scribe", "Pilgrims", "Masks", "Xandri"], Want: ["City", "Answer", "Edge", "Ending"] },
    foreign: { Dunes: "the sand book", Xandri: "the sand book", Waves: "the sand book" }, heard: ["City", "Answer"] },
  { scene: "g_name_c9", book: "the sand book", fluid: "sand", open: LINES.p3, templates: [T1, T2, T3, T4], fate: ["Wake", "Past the Mark"], quote: SOURCE_TASK,
    threads: { Place: ["Desert", "Eternity", "Sand Sea", "Dunes", "Never-Ending", "Silver", "Moon", "Vines", "Waves", "Hill", "Road"],
      Person: ["Xandri", "Explorer", "Father", "Son", "Xadra", "Shaman", "Storyteller", "Xandrixes", "Wondering", "Lizard", "Zorlop", "Clerk", "Pilgrims"],
      Want: ["End", "Proof", "Further", "Leaf", "Wake", "Past the Mark", "Windows", "City"] },
    foreign: { Hill: "the weather book", Road: "the road book", Clerk: "the weather book", Pilgrims: "the road book", Windows: "the weather book", City: "the road book" },
    heard: ["Zorlop", "End", "Eternity"], trueInk: true },
];

const PAGE_ART = [
  { plate: "cartouche-c5", figure: "figure-pell", mote: "mote-rain" },
  { plate: "cartouche-c7", figure: "figure-oda", mote: "mote-ink" },
  { plate: "cartouche-c9", figure: "figure-xandri", mote: "mote-sand" },
];
const stampId = (w) => "stamp-" + w.toLowerCase().replace(/[^a-z]+/g, "-");

// join words, gluing "Never-" to the next word and "-less" to the one before
function compose(words) {
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === "-less" && out.length) { out[out.length - 1] += "less"; continue; }
    if (w === "Never-" && i + 1 < words.length && words[i + 1] !== "-less") { out.push("Never-" + words[++i].toLowerCase()); continue; }
    out.push(w);
  }
  return out.join(" ").replace(/\s+/g, " ");
}

export default {
  mount(root, api) {
    const P = "endless-temple-naming-";
    const C = { leather: "#4a2416", leather2: "#2f160d", gold: "#d9a93c", gold2: "#f2d27a", blind: "#3a1b10", cream: "#f3ead2", bad: "#ff9a7a" };
    const rm = api.reducedMotion;
    const timers = [];
    const art = api.art || { has: () => false, url: () => "", info: () => null };
    const pic = (id, cls, alt = "") => (art.has(id) ? `<img class="${P}${cls}" src="${art.url(id)}" alt="${alt}" draggable="false">` : "");
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:radial-gradient(120% 100% at 40% 20%,${C.leather},${C.leather2});color:${C.gold};font-family:'EB Garamond',Georgia,serif;font-size:16px}
    .${P}root::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.5;background-image:radial-gradient(rgba(0,0,0,.35) 1px,transparent 1.5px),radial-gradient(rgba(255,200,150,.06) 1px,transparent 1.5px);background-size:5px 5px,8px 8px;background-position:0 0,2px 3px}
    .${P}cover{position:relative;max-width:1100px;margin:8px auto 0;padding:30px 52px 120px 30px;box-sizing:border-box;min-height:calc(100% - 8px)}
    .${P}fillet{position:absolute;inset:8px 38px 8px 8px;border:2px solid ${C.gold};outline:1px solid ${C.gold};outline-offset:-7px;pointer-events:none;border-radius:2px}
    .${P}fillet::after{content:"";position:absolute;inset:12px;border:3px dotted ${C.gold};opacity:.7}
    .${P}orn{position:absolute;width:30px;height:30px;fill:${C.gold}}
    .${P}gutter{position:absolute;right:8px;top:8px;bottom:8px;width:22px;border:1px solid ${C.gold};overflow:hidden;background:#24100a}
    .${P}gutter canvas{width:100%;height:100%;display:block}
    .${P}head{text-align:center;position:relative}
    .${P}head small{font-size:14px;letter-spacing:.24em;text-transform:uppercase;color:${C.gold}}
    .${P}pages{display:inline-flex;gap:6px;margin-left:8px;vertical-align:middle}
    .${P}pages i{width:12px;height:16px;border:1.5px solid ${C.gold};display:inline-block}
    .${P}pages i.${P}done{background:${C.gold}}
    .${P}beat{margin:6px auto 0;max-width:62ch;font-style:italic;color:${C.cream};font-size:16px;line-height:1.4;min-height:1.4em}
    .${P}quote{margin:6px auto 0;max-width:62ch;font-style:italic;color:${C.gold2};font-size:16px}
    .${P}tpls{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;position:relative;margin-top:12px}
    .${P}tpl{font:inherit;font-size:15px;color:${C.gold2};background:${C.blind};border:1.5px solid ${C.gold};border-radius:20px;padding:5px 12px;cursor:pointer;display:flex;gap:5px;align-items:center;min-height:38px}
    .${P}tpl i{display:inline-block;width:18px;height:11px;border:1px solid ${C.gold};box-shadow:inset 0 1px 2px rgba(0,0,0,.7)}
    .${P}tpl:hover,.${P}tpl:focus-visible{background:#5b2c1a;outline:none}
    .${P}tpl[aria-pressed=true]{background:${C.gold};color:${C.blind}}
    .${P}tpl[aria-pressed=true] i{background:${C.blind}}
    .${P}cart{position:relative;margin:18px auto 8px;max-width:780px;padding:24px 26px;border:2px solid ${C.gold};border-radius:90px;box-shadow:inset 0 0 0 6px ${C.leather},inset 0 0 0 7px ${C.gold},inset 0 0 30px rgba(0,0,0,.4);text-align:center;min-height:90px;display:flex;flex-wrap:wrap;gap:10px 12px;justify-content:center;align-items:center;transition:box-shadow .6s}
    .${P}cart.${P}set{box-shadow:inset 0 0 0 6px ${C.leather},inset 0 0 0 7px ${C.gold},0 0 40px rgba(242,210,122,.6)}
    .${P}cart.${P}shake{animation:${P}shake .45s}
    @keyframes ${P}shake{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
    .${P}tool{font-family:'IM Fell English',Georgia,serif;font-size:clamp(18px,2.4vw,26px);letter-spacing:.14em;text-transform:uppercase;color:${C.gold2};text-shadow:0 1px 0 #7a4a10,0 -1px 0 rgba(0,0,0,.6)}
    .${P}slot{font:inherit;font-family:'IM Fell English',Georgia,serif;min-width:110px;min-height:42px;padding:4px 10px;border-radius:4px;border:0;cursor:pointer;background:${C.blind};box-shadow:inset 0 2px 5px rgba(0,0,0,.8),0 1px 0 rgba(255,210,140,.18);color:${C.gold2};font-size:clamp(16px,2vw,22px);letter-spacing:.12em;text-transform:uppercase}
    .${P}slot:hover,.${P}slot:focus-visible{outline:1px dashed ${C.gold2};outline-offset:2px}
    .${P}slot.${P}act{outline:2px solid ${C.gold2};outline-offset:3px}
    .${P}slot.${P}set{background:transparent;box-shadow:none;text-shadow:0 1px 0 #7a4a10,0 -1px 0 rgba(0,0,0,.6)}
    .${P}status{text-align:center;color:${C.cream};font-size:16px;min-height:2.8em;margin:4px auto 10px;max-width:780px;line-height:1.45}
    .${P}status b{color:${C.gold2};font-weight:600}
    .${P}status .${P}x{color:${C.bad}}
    .${P}status .${P}v{color:#b9e08a}
    .${P}trays{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    @media (max-width:760px){.${P}trays{grid-template-columns:1fr}.${P}cover{padding:34px 46px 120px 30px}.${P}fillet{inset:6px 32px 6px 6px}.${P}gutter{width:18px;right:6px}.${P}cart{padding:18px 12px;border-radius:40px}}
    .${P}tray{position:relative;border:1.5px solid ${C.gold};padding:26px 8px 10px;border-radius:3px;overflow:hidden;transition:box-shadow .8s}
    .${P}tray h3{position:absolute;top:5px;left:0;right:0;margin:0;text-align:center;font-size:14px;letter-spacing:.3em;font-weight:600}
    .${P}tray.${P}drift{box-shadow:inset 0 -30px 24px -8px rgba(217,180,106,.6)}
    .${P}tray.${P}drift h3::after{content:" · sand gathers here";letter-spacing:.06em;font-style:italic;font-weight:400}
    .${P}tiles{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}
    .${P}tile{font:inherit;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:${C.gold2};background:linear-gradient(#5b2c1a,#3e1d11);border:1px solid ${C.gold};border-radius:3px;padding:7px 9px;cursor:pointer;box-shadow:0 2px 3px rgba(0,0,0,.5);transition:transform .12s,background .12s}
    .${P}tile:hover,.${P}tile:focus-visible{background:#7a4126;transform:translateY(-2px);outline:none}
    .${P}tile.${P}st{padding:3px 3px 4px;width:74px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11.5px;letter-spacing:.04em;line-height:1.1;background:transparent;border-color:transparent;box-shadow:none}
    .${P}tile.${P}st img{width:66px;height:66px;display:block;border-radius:5px;box-shadow:0 2px 4px rgba(0,0,0,.55)}
    .${P}tile.${P}st span{display:block;min-height:2.2em;text-align:center;color:${C.cream}}
    .${P}tile.${P}st:hover,.${P}tile.${P}st:focus-visible{background:rgba(242,210,122,.16);border-color:${C.gold}}
    .${P}tile.${P}st.${P}known img{outline:2px dashed ${C.bad};outline-offset:1px}
    .${P}tile.${P}st.${P}fate img{box-shadow:0 0 0 2px ${C.gold2},0 2px 4px rgba(0,0,0,.55)}
    .${P}tile.${P}st.${P}fate{box-shadow:none}
    @media (max-width:760px){.${P}tile.${P}st{width:62px}.${P}tile.${P}st img{width:56px;height:56px}}
    .${P}plate{display:block;width:min(520px,100%);height:auto;margin:10px auto 0;border-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,.5);transition:filter .6s,box-shadow .6s}
    .${P}plate.${P}set{box-shadow:0 0 40px rgba(242,210,122,.7);filter:brightness(1.15)}
    .${P}who{display:flex;gap:12px;align-items:center;justify-content:center;max-width:70ch;margin:6px auto 0;text-align:left}
    .${P}who img.${P}fig{flex:none;width:64px;height:80px;object-fit:cover;border:1px solid ${C.gold};border-radius:3px}
    .${P}who .${P}beat{margin:0}
    .${P}pagename img{width:26px;height:26px;border-radius:50%;vertical-align:middle;margin-right:8px;border:1px solid ${C.gold}}
    .${P}spine img.${P}c1{display:block;width:100%;height:auto;margin:0 0 12px;border-radius:3px}
    .${P}endc{position:absolute;inset:0;z-index:6;display:grid;place-items:center;background:rgba(20,8,4,.85);padding:16px 16px 170px;box-sizing:border-box;overflow:auto}
    .${P}endc figure{margin:0;max-width:340px;text-align:center}
    .${P}endc img{display:block;margin:0 auto;height:auto}
    .${P}endc img.${P}fr{width:min(230px,56vw);box-shadow:0 10px 30px rgba(0,0,0,.6)}
    .${P}endc img.${P}hd{width:min(340px,86vw);margin-top:10px}
    .${P}tile.${P}used{opacity:.55}
    .${P}slot.${P}blind{color:#8a5a3c;text-shadow:0 1px 0 rgba(255,210,150,.18),0 -1px 0 rgba(0,0,0,.8);background:${C.blind}}
    .${P}platewrap{position:relative;width:min(520px,100%);margin:10px auto 0}
    .${P}platewrap .${P}plate{margin:0;width:100%}
    .${P}scrape{position:absolute;left:8%;right:8%;top:50%;transform:translateY(-50%) rotate(-2deg);text-align:center;font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:clamp(17px,3.4vw,26px);letter-spacing:.06em;color:rgba(40,20,10,.0);text-shadow:0 1px 0 rgba(255,236,190,.0);pointer-events:none;transition:color .8s,text-shadow .8s}
    .${P}platewrap.${P}rake .${P}plate{filter:contrast(1.35) brightness(1.12) sepia(.25)}
    .${P}platewrap.${P}rake::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:4px;background:linear-gradient(100deg,rgba(255,230,160,.5),rgba(255,230,160,0) 55%)}
    .${P}platewrap.${P}rake .${P}scrape{color:rgba(40,20,10,.62);text-shadow:0 1px 0 rgba(255,236,190,.55)}
    .${P}platewrap[data-side="2"]::after{background:linear-gradient(260deg,rgba(255,230,160,.5),rgba(255,230,160,0) 55%)}
    .${P}platewrap[data-side="3"]::after{background:linear-gradient(180deg,rgba(255,230,160,.55),rgba(255,230,160,0) 60%)}
    .${P}platewrap.${P}ghost .${P}plate{filter:contrast(1.3) brightness(1.1) sepia(.2)}
    .${P}lamp{font:inherit;font-size:15px;color:${C.gold2};background:transparent;border:1.5px solid ${C.gold};border-radius:20px;padding:6px 14px;cursor:pointer;min-height:38px}
    .${P}lamp[aria-pressed=true]{background:${C.gold2};color:${C.blind}}
    .${P}lamp[hidden]{display:none}
    .${P}platewrap.${P}rake .${P}plate{filter:contrast(1.5) brightness(1.2) sepia(.3)}
    .${P}start{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 12px}
    .${P}start button{font:inherit;font-size:14px;color:${C.gold2};background:transparent;border:1.5px solid ${C.gold};border-radius:18px;padding:5px 10px;cursor:pointer;min-height:38px}
    .${P}start button[aria-pressed=true]{background:${C.gold};color:${C.blind}}
    .${P}link{font-size:15px;color:${C.gold2};border:1px dashed ${C.gold};border-radius:4px;padding:4px 10px;margin:6px auto 0;max-width:62ch}
    .${P}link[hidden]{display:none}
    .${P}spine .${P}row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
    .${P}spine .${P}btn.${P}alt{background:transparent;color:${C.gold2}}
    .${P}tile.${P}known{border-style:dashed;color:${C.bad}}
    .${P}tile.${P}fate{box-shadow:0 0 0 2px ${C.gold2},0 2px 3px rgba(0,0,0,.5)}
    .${P}tools{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;align-items:center}
    .${P}conn{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center}
    .${P}conn span{font-size:14px;letter-spacing:.2em;margin-right:4px}
    .${P}inspect{font:inherit;font-size:15px;color:${C.gold2};background:transparent;border:1.5px solid ${C.gold};border-radius:20px;padding:6px 14px;cursor:pointer;min-height:38px}
    .${P}inspect[aria-pressed=true]{background:${C.gold2};color:${C.blind}}
    .${P}inspect:disabled{opacity:.45;cursor:not-allowed}
    .${P}inspect[hidden]{display:none}
    .${P}ink{display:flex;justify-content:center;margin-top:16px}
    .${P}btn{font:inherit;font-variant:small-caps;letter-spacing:.18em;font-size:19px;padding:8px 30px;border-radius:22px;border:2px solid ${C.gold};background:${C.gold};color:${C.blind};cursor:pointer}
    .${P}btn:hover:not(:disabled),.${P}btn:focus-visible{background:${C.gold2};outline:2px solid ${C.gold2};outline-offset:2px}
    .${P}btn:disabled{background:transparent;color:${C.gold};opacity:.55;cursor:not-allowed}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,8,4,.75);z-index:5;padding:16px;overflow:auto}
    .${P}spine{max-width:430px;padding:26px 26px 22px;border:2px solid ${C.gold};outline:1px solid ${C.gold};outline-offset:-8px;background:radial-gradient(120% 100% at 40% 20%,#5b2c1a,${C.leather2});color:${C.cream};text-align:center;position:relative;box-shadow:0 18px 40px rgba(0,0,0,.6)}
    .${P}spine h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;color:${C.gold2};margin:0 0 6px;letter-spacing:.16em;text-transform:uppercase;font-size:26px;text-shadow:0 1px 0 #7a4a10}
    .${P}spine .${P}goal{margin:0 0 12px;font-size:17px;border-top:1px solid ${C.gold};border-bottom:1px solid ${C.gold};padding:8px 0}
    .${P}spine ul{list-style:none;margin:0 0 16px;padding:0;text-align:left;font-size:16px}
    .${P}spine li{margin:6px 0;display:flex;gap:10px;align-items:baseline}
    .${P}spine li span:first-child{flex:none;min-width:84px;text-align:center;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${C.gold2};border:1px solid ${C.gold};padding:2px 4px;background:#3e1d11}
    @media (prefers-reduced-motion:reduce){.${P}cart.${P}shake{animation:none}}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    const fleur = `<path d="M15 2 C18 9 24 10 28 15 C24 20 18 21 15 28 C12 21 6 20 2 15 C6 10 12 9 15 2Z"/><circle cx="15" cy="15" r="3" fill="${C.leather}"/>`;
    el.innerHTML = `
      <div class="${P}cover" tabindex="-1" style="outline:none">
        <div class="${P}fillet"></div>
        <svg class="${P}orn" style="left:14px;top:14px" viewBox="0 0 30 30" aria-hidden="true">${fleur}</svg>
        <svg class="${P}orn" style="right:44px;top:14px" viewBox="0 0 30 30" aria-hidden="true">${fleur}</svg>
        <svg class="${P}orn" style="left:14px;bottom:14px" viewBox="0 0 30 30" aria-hidden="true">${fleur}</svg>
        <svg class="${P}orn" style="right:44px;bottom:14px" viewBox="0 0 30 30" aria-hidden="true">${fleur}</svg>
        <div class="${P}gutter" aria-hidden="true"><canvas></canvas></div>
        <div class="${P}head"><small class="${P}pagename"></small><span class="${P}pages" aria-hidden="true"></span>
          <div class="${P}who"><img class="${P}fig" alt="" hidden><p class="${P}beat" aria-live="polite"></p></div><p class="${P}quote" hidden></p>
          <div class="${P}platewrap"><img class="${P}plate" alt="" hidden></div>
          <div style="margin-top:8px"><button type="button" class="${P}lamp" aria-pressed="false" hidden>Tilt the lamp (K)</button></div>
          <p class="${P}link" hidden></p></div>
        <div class="${P}tpls" role="group" aria-label="Title templates"></div>
        <div class="${P}cart" aria-label="The title"></div>
        <div class="${P}status" aria-live="polite"></div>
        <div class="${P}trays"></div>
        <div class="${P}tools"><div class="${P}conn"><span>CONNECTORS</span></div>
          <button type="button" class="${P}inspect" aria-pressed="false" hidden>Inspect a tile (I)</button></div>
        <div class="${P}ink"><button type="button" class="${P}btn ${P}inscribe">Inscribe</button></div>
      </div>`;
    root.append(css, el);
    const q = (c) => el.querySelector("." + P + c);

    let pi = 0, PG = PAGES[0], tpl = 0, fill = [], active = 0, over = false, busy = false, lastChange = performance.now();
    let glances = 3, inspecting = false, known = new Set(), triedForeign = false, authorTitle = false;
    const names = [];
    let trays = {};
    const shared = sharedOf(api);
    const reached = Math.max(0, Math.min(2, api.store.get("stage", 0) | 0));
    let raked = false, rakeSide = 0, rakeSeen = new Set();
    const second = secondRun(shared);
    let titleRead = second || !!shared.get("scraped_title", false);
    const passedMark = !!shared.get("passed_mark", false);
    const isBlind = (w) => !!w && (PG.heard || []).includes(w);
    const threadOf = (w) => Object.keys(PG.threads).find((t) => PG.threads[t].includes(w)) || null;
    const slotCount = () => PG.templates[tpl].filter((x) => x === null).length;
    const resetFill = () => { fill = new Array(slotCount()).fill(null); active = 0; };

    function setPage(i) {
      pi = i; PG = PAGES[i]; tpl = 0; resetFill(); busy = false; glances = 3; inspecting = false; known = new Set(); triedForeign = false;
      const PA = PAGE_ART[i];
      q("pagename").innerHTML = pic(PA.mote, "m");
      q("pagename").append(`${STAGE_NAMES[i]} · page ${i + 1} of ${PAGES.length}: ${PG.book}`);
      const fig = q("fig"); if (art.has(PA.figure)) { fig.src = art.url(PA.figure); fig.hidden = false; } else fig.hidden = true;
      const plate = q("plate"); plate.classList.remove(P + "set");
      if (art.has(PA.plate)) { plate.src = art.url(PA.plate); plate.alt = `The cartouche on the cover of ${PG.book}, still blank.`; plate.hidden = false; } else plate.hidden = true;
      q("pages").innerHTML = PAGES.map((_, k) => `<i class="${k < i ? P + "done" : ""}"></i>`).join("");
      q("beat").textContent = PG.open + (PG.fate ? " " + LINES.fate : "") + (i === 1 ? " " + LINES.inspectNew + " " + LINES.blindNew : "") + (PG.trueInk ? " " + LINES.trueNew : "");
      raked = false; rakeSide = 0; q("platewrap").classList.remove(P + "rake"); q("lamp").hidden = !PG.trueInk; q("lamp").setAttribute("aria-pressed", "false");
      drawScrape();
      if (PG.trueInk && second) q("beat").textContent += " " + LINES.secondShow;
      const lk = q("link"); lk.hidden = !(PG.trueInk && passedMark); if (!lk.hidden) lk.textContent = LINES.proofLink;
      api.store.set("stage", Math.max(reached, api.store.get("stage", 0) | 0, i));
      const qe = q("quote"); qe.hidden = !PG.quote; if (PG.quote) qe.textContent = `“${PG.quote}” (Elaris, on the first day)`;
      q("inspect").hidden = !Object.keys(PG.foreign).length;
      q("cart").classList.remove(P + "set");
      leaking = true;
      // templates
      const tplBox = q("tpls"); tplBox.innerHTML = "";
      tplBtns = PG.templates.map((t, k) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "tpl";
        b.setAttribute("aria-label", "Template: " + t.map((x) => x ?? "blank").join(" "));
        b.innerHTML = t.map((x) => (x === null ? "<i></i>" : `<span>${x}</span>`)).join("");
        b.addEventListener("click", () => { if (over || busy) return; tpl = k; resetFill(); touched(); draw(); });
        tplBox.appendChild(b); return b;
      });
      // trays
      const tb = q("trays"); tb.innerHTML = ""; trays = {};
      for (const t of Object.keys(PG.threads)) {
        const box = document.createElement("section");
        box.className = P + "tray";
        box.innerHTML = `<h3>${t.toUpperCase()}</h3><div class="${P}tiles"></div>`;
        const tiles = box.querySelector("." + P + "tiles");
        for (const w of PG.threads[t]) tiles.appendChild(tileBtn(w, true));
        tb.appendChild(box); trays[t] = box;
      }
      draw();
    }
    let tplBtns = [];
    for (const w of CONNECTORS) q("conn").appendChild(tileBtn(w, false));
    function tileBtn(w, motif) {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "tile"; b.textContent = w; b.dataset.w = w;
      if (motif) b.dataset.motif = "1";
      if (motif && art.has(stampId(w))) {
        b.classList.add(P + "st"); b.textContent = "";
        b.innerHTML = `<img src="${art.url(stampId(w))}" alt="" draggable="false"><span></span>`;
        b.querySelector("span").textContent = w;
        b.setAttribute("aria-label", w);
      }
      b.addEventListener("click", () => (inspecting && motif ? inspect(w) : place(w)));
      b.addEventListener("mousedown", (e) => e.preventDefault());   // a mouse click does not steal focus, so Enter still inscribes
      return b;
    }
    function inspect(w) {
      inspecting = false;
      if (glances <= 0) return;
      glances--;
      const from = PG.foreign[w];
      if (from) known.add(w);
      say(from ? `<b>${w}</b>: the grain of this tile is not this book's. It drifted in from ${from}.` : `<b>${w}</b>: a tile from ${PG.book}, gathered while reading it.`);
      draw();
    }
    let sayT = null;
    function say(html) { sayT = { html, until: performance.now() + 5000 }; draw(); }
    function place(w) {
      if (over || busy) return;
      let i = fill[active] == null ? active : fill.indexOf(null);
      if (i < 0) i = active;
      fill[i] = w;
      const next = fill.indexOf(null);
      active = next < 0 ? i : next;
      touched(); draw();
    }
    function touched() { lastChange = performance.now(); }

    function check() {
      const motifs = fill.filter((w) => w && threadOf(w));
      const threads = new Set(motifs.map(threadOf));
      const foreign = fill.filter((w) => w && PG.foreign[w]);
      const empty = fill.filter((w) => !w).length;
      const author = !!PG.fate && PG.templates[tpl] === T4 && AUTHOR.every((w, i) => fill[i] === w);
      const fate = !PG.fate || fill.some((w) => PG.fate.includes(w));
      const shape = !empty && (author || (motifs.length >= 3 && threads.size === 3 && fate));
      const blind = fill.filter(isBlind);
      // true ink (the twist): what no page has shown will not take
      const untrue = PG.trueInk ? fill.filter((w) => w === "End" || (w === "Proof" && !passedMark)) : [];
      return { motifs, threads, foreign, empty, fate, author, shape, blind, untrue, ok: shape && !foreign.length && blind.length <= 1 && !untrue.length };
    }
    function words() {
      const out = []; let k = 0;
      for (const x of PG.templates[tpl]) {
        if (x === null) { const w = fill[k++]; if (w) out.push(w); }
        else out.push(...x.split(" "));
      }
      return out;
    }

    function draw() {
      tplBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(i === tpl)));
      const cart = q("cart"); cart.innerHTML = "";
      let k = 0;
      for (const x of PG.templates[tpl]) {
        if (x !== null) { const s = document.createElement("span"); s.className = P + "tool"; s.textContent = x; cart.appendChild(s); continue; }
        const i = k++;
        const b = document.createElement("button");
        b.type = "button";
        b.className = P + "slot" + (i === active && !busy ? " " + P + "act" : "") + (busy ? " " + P + "set" : "") + (isBlind(fill[i]) ? " " + P + "blind" : "");
        b.textContent = fill[i] || " ";
        b.setAttribute("aria-label", fill[i] ? `Slot ${i + 1}: ${fill[i]}. Press again to clear.` : `Empty slot ${i + 1}`);
        b.addEventListener("click", () => { if (over || busy) return; if (fill[i] && active === i) fill[i] = null; active = i; touched(); draw(); });
        cart.appendChild(b);
      }
      const used = new Set(fill.filter(Boolean));
      el.querySelectorAll("." + P + "tile").forEach((t) => {
        t.classList.toggle(P + "used", used.has(t.dataset.w));
        t.classList.toggle(P + "known", known.has(t.dataset.w));
        t.classList.toggle(P + "fate", !!PG.fate && PG.fate.includes(t.dataset.w));
      });
      const c = check();
      const mk = (ok, t) => `<span class="${ok ? P + "v" : P + "x"}">${t} ${ok ? "✓" : "✗"}</span>`;
      let s = `${mk(c.motifs.length >= 3, `Motif tiles ${c.motifs.length} of 3`)} · ${mk(c.threads.has("Place"), "Place")} · ${mk(c.threads.has("Person"), "Person")} · ${mk(c.threads.has("Want"), "Want")}`;
      if (PG.fate) s += ` · ${mk(c.fate, "Fate")}`;
      if ((PG.heard || []).length) s += ` · ${mk(c.blind.length <= 1, `Blind tiles ${c.blind.length} of 1`)}`;
      if (c.empty) s += ` · ${c.empty} slot${c.empty > 1 ? "s" : ""} open`;
      if (sayT && performance.now() < sayT.until) s += `<br>${sayT.html}`;
      else if (c.author) s += `<br>The ink is ready, though no Want is named: <b>${compose(words())}</b>`;
      else if (c.shape) s += `<br>The ink is ready: <b>${compose(words())}</b>`;
      q("status").innerHTML = s;
      q("inscribe").disabled = !c.shape || over || busy;
      const ib = q("inspect");
      ib.textContent = inspecting ? "Tap a tile to inspect it" : `Inspect a tile (I) · ${glances} glance${glances === 1 ? "" : "s"} left`;
      ib.setAttribute("aria-pressed", String(inspecting));
      ib.disabled = glances <= 0 || busy;
    }
    q("inspect").addEventListener("click", () => { if (glances > 0 && !busy) { inspecting = !inspecting; draw(); } });
    // the scraped title, raked from three sides: each side raises a different part of it
    const SCRAPED = ["The Desert", "That", "Ends"];
    function drawScrape() {
      // the cartouche art carries the scraped title itself; the lamp's light (and, on a second reading, the
      // eye that knows where to look) brings it up
      q("platewrap").classList.toggle(P + "ghost", !!PG.trueInk && second && !raked);
      const pl = q("plate");
      if (PG.trueInk) pl.alt = raked || second ? `The sand book's cartouche, with a title scraped away under it: ${SCRAPED.map((w, i) => (rakeSeen.has(i) || second || titleRead ? w : "…")).join(" ")}.` : "The cartouche on the cover of the sand book, still blank.";
      const lamp = q("lamp");
      lamp.textContent = !raked ? "Tilt the lamp (K)" : ["Lamp: from the left (K)", "Lamp: from the right (K)", "Lamp: from above (K)"][rakeSide - 1];
    }
    function rake() {
      if (!PG.trueInk || busy || over) return;
      rakeSide = (rakeSide + 1) % 4; raked = rakeSide > 0;
      q("platewrap").classList.toggle(P + "rake", raked); q("lamp").setAttribute("aria-pressed", String(raked));
      q("platewrap").dataset.side = String(rakeSide);
      if (raked) {
        rakeSeen.add(rakeSide - 1);
        const left = 3 - rakeSeen.size;
        let t = LINES.rakeSides[rakeSide - 1];
        if (left === 0 && !titleRead) { titleRead = true; shared.set("scraped_title", true); notebook.refresh(); t += " " + LINES.raking; }
        else if (left > 0 && !titleRead) t += LINES.rakeMore.replace("{n}", left).replace("{s}", left === 1 ? "" : "s");
        else if (left === 0) t = LINES.raking;
        say(t);
        q("platewrap").scrollIntoView({ block: "center", behavior: rm ? "auto" : "smooth" });
      } else draw();
      drawScrape();
    }
    q("lamp").addEventListener("click", rake);

    q("inscribe").addEventListener("click", inscribe);
    function inscribe() {
      const c = check();
      if (!c.shape || over || busy) return;
      if (c.foreign.length) {
        triedForeign = true;
        say(LINES.foreign + (q("inspect").hidden ? "" : " Inspect the tiles to find which."));
        const cart = q("cart");
        if (!rm) { cart.classList.remove(P + "shake"); void cart.offsetWidth; cart.classList.add(P + "shake"); }
        surge = 2;
        return;
      }
      if (PG.trueInk && !titleRead) {
        say(LINES.overTitle);
        const cart = q("cart");
        if (!rm) { cart.classList.remove(P + "shake"); void cart.offsetWidth; cart.classList.add(P + "shake"); }
        surge = 2; refused++;
        return;
      }
      if (c.blind.length > 1 || c.untrue.length) {
        say(c.untrue.includes("End") ? LINES.trueEnd : c.untrue.length ? LINES.trueProof : LINES.blindTwo);
        const cart = q("cart");
        if (!rm) { cart.classList.remove(P + "shake"); void cart.offsetWidth; cart.classList.add(P + "shake"); }
        surge = 2; refused++;
        return;
      }
      busy = true; leaking = false;
      const name = compose(words());
      names.push(name);
      if (c.author) authorTitle = true;
      q("cart").classList.add(P + "set"); q("plate").classList.add(P + "set");
      say(`${LINES.inked} <b>“${name}”</b>.`);
      draw();
      timers.push(setTimeout(() => {
        if (pi + 1 < PAGES.length) { between(); return; }
        over = true;
        let text = (names.length === 3 ? LINES.end : LINES.endShort).replace("{names}", names.map((n) => `“${n}”`).join(", "));
        if (refused) text += ` The true ink refused ${refused} title${refused === 1 ? "" : "s"} first.`;
        if (raked || q("platewrap").classList.contains(P + "rake")) text += " The scraped title stays scraped.";
        if (authorTitle) text += " " + ADDED_AUTHOR_LINE;
        // the twist ends on an ending's image: the named book on its shelf
        if (endingCard(root, api, names.length ? { ...ENDINGS.named } : null, `\u201c${name}\u201d`)) { /* the card stands behind the result */ }
        else if (art.has("frontis-c9")) {
          const c = document.createElement("div");
          c.className = P + "endc";
          c.innerHTML = `<figure>${pic("frontis-c9", "fr", "The ninth chapter's frontispiece: The End of the Sand.")}${pic("heading-c9", "hd")}</figure>`;
          root.appendChild(c);
        }
        api.end({ outcome: "win", text });
      }, rm ? 400 : 2000));
    }

    // between two pages: go on, or stop here with a result
    let refused = 0;
    function between() {
      const c = document.createElement("div");
      c.className = P + "intro";
      const next = PAGES[pi + 1];
      c.innerHTML = `<div class="${P}spine" role="dialog" aria-label="The book is named">
        <h2>${pi === 0 ? "Named" : "Named again"}</h2>
        <p class="${P}goal"></p>
        <p style="margin:0 0 14px;font-size:16px"></p>
        <div class="${P}row"><button type="button" class="${P}btn" data-a="go">Open ${next.book}</button><button type="button" class="${P}btn ${P}alt" data-a="stop">Stop here</button></div></div>`;
      c.querySelector("." + P + "goal").textContent = `\u201c${names[names.length - 1]}\u201d. ${LINES.inked}`;
      c.querySelectorAll("p")[1].textContent = `Next, ${STAGE_NAMES[pi + 1].toLowerCase()}.`;
      el.appendChild(c);
      c.querySelector('[data-a="go"]').addEventListener("click", () => { c.remove(); setPage(pi + 1); touched(); q("cover").focus(); });
      c.querySelector('[data-a="stop"]').addEventListener("click", () => {
        c.remove(); over = true;
        api.end({ outcome: "win", text: (pi === 0 ? LINES.stop1 : LINES.stop2).replace("{names}", names.map((n) => `\u201c${n}\u201d`).join(", ")) });
      });
      c.querySelector('[data-a="go"]').focus();
    }

    // the gutter: rain, ink or sand runs until the book is named; after 30 s idle, sand gathers at a missing thread
    const cv = q("gutter").querySelector("canvas");
    const g = cv.getContext("2d");
    let raf = 0, leaking = true, surge = 0, t0 = performance.now(), grains = [];
    function loop(now) {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      g.clearRect(0, 0, w, h);
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
      if (surge > 0) surge -= dt;
      const col = PG.fluid === "rain" ? "#9fb3c8" : PG.fluid === "ink" ? "#c9b8a0" : "#d9b46a";
      if (leaking && !rm && grains.length < (surge > 0 ? 260 : 120)) for (let k = 0; k < (surge > 0 ? 4 : 1); k++) grains.push({ x: Math.random() * w, y: -2, v: 20 + Math.random() * 50 });
      g.fillStyle = col;
      for (let i = grains.length - 1; i >= 0; i--) {
        const p = grains[i]; p.y += p.v * dt * (leaking ? (surge > 0 ? 2.2 : 1) : 0.4);
        if (p.y > h) { grains.splice(i, 1); continue; }
        if (PG.fluid === "rain") g.fillRect(p.x, p.y, 1.2, 4); else g.fillRect(p.x, p.y, 1.8, 1.8);
      }
      if (rm && leaking) { g.fillStyle = col; g.globalAlpha = 0.5; g.fillRect(w / 2 - 1, 0, 2, h); g.globalAlpha = 1; }
      const c = check();
      const idle = now - lastChange > 30000;
      for (const t of Object.keys(trays)) trays[t].classList.toggle(P + "drift", !over && !busy && idle && !c.threads.has(t));
      if (sayT && now > sayT.until && now < sayT.until + 60) draw();
      raf = requestAnimationFrame(loop);
    }

    const onKey = (e) => {
      if (over || busy || el.querySelector("." + P + "intro")) return;
      if (e.target && e.target.tagName === "BUTTON" && !e.target.disabled && (e.key === "Enter" || e.key === " ")) return;
      if (e.key === "Backspace" || e.key === "Delete") { fill[active] = null; touched(); draw(); }
      else if (e.key === "ArrowRight") { active = Math.min(fill.length - 1, active + 1); draw(); }
      else if (e.key === "ArrowLeft") { active = Math.max(0, active - 1); draw(); }
      else if ((e.key === "i" || e.key === "I") && !q("inspect").hidden) { if (glances > 0) { inspecting = !inspecting; draw(); } }
      else if ((e.key === "k" || e.key === "K") && PG.trueInk) rake();
      else if (e.key === "Enter") inscribe();
      else if (e.key >= "1" && e.key <= "4" && tplBtns[+e.key - 1]) { tpl = +e.key - 1; resetFill(); touched(); draw(); }
      else return;
      e.preventDefault();
    };
    addEventListener("keydown", onKey);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}spine" role="dialog" aria-label="How to play">
      ${pic("cartouche-c1", "c1", "A blank cartouche on a book's cover.")}
      <h2>The Naming</h2>
      <p class="${P}goal"><b>Goal:</b> give three books a name. A named book rests.</p>
      <ul>
        <li><span>Template</span><span>Pick a title shape (1 to 4).</span></li>
        <li><span>Tile</span><span>Tap tiles to fill the open slots. Tap a slot twice to clear it.</span></li>
        <li><span>Rule</span><span>At least three motif tiles, one each of Place, Person, Want.</span></li>
        <li><span>Inscribe</span><span>When the rules hold (Enter).</span></li>
        <li><span>Three pages</span><span>Teach, test, twist. You can stop after any of them.</span></li>
      </ul>
      ${reached > 0 ? `<div class="${P}start" role="group" aria-label="Start at">${STAGE_NAMES.slice(0, reached + 1).map((n, k) => `<button type="button" data-s="${k}" aria-pressed="${k === 0}">${k + 1}. ${n.split(":")[0]}</button>`).join("")}</div>` : ""}
      <button type="button" class="${P}btn ${P}open">Open the first book</button></div>`;
    el.appendChild(intro);
    let startAt = 0;
    intro.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => {
      startAt = +b.dataset.s; intro.querySelectorAll("[data-s]").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
      intro.querySelector("." + P + "open").textContent = startAt ? `Open ${PAGES[startAt].book}` : "Open the first book";
    }));
    intro.querySelector("." + P + "open").addEventListener("click", () => { intro.remove(); if (startAt) setPage(startAt); touched(); q("cover").focus(); });
    intro.querySelector("." + P + "open").focus();

    const notebook = mountNotebook(root, api, { at: { left: "8px", bottom: "8px" } });
    setPage(0);
    raf = requestAnimationFrame(loop);
    return { unmount() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); removeEventListener("keydown", onKey); notebook.unmount(); } };
  },
};

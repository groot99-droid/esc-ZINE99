// Missing Campsites / Reconcile (1D, topographic survey print).
//
// DESIGN.md section 11, Reconcile, at reconcile_2 (day 2 morning, after erasure step 2): rows 1 to
// 24 against four sources. Ground: stamps from the walks (1–11 not here, 12 here, 13–15 not
// walked, 16–24 here). Map: still prints 7–24 (paper lags the land). Legend: lists 7–24, a blank
// band at its bottom where six lines were. Photos: the site 7 photo shows a clearing; file numbers
// skip. Set each row Here, Gone or Unknown and write one detail Tam saw there. When the map or
// legend disagrees with a Gone note, "Correct your note to match." is offered (accepted +1).
// Then the forecast: mark where the loss will reach by noon and by dark (12–15 by noon, 16–19 by
// dark; right within one site). Rows 1–3 come already written from day 1.
//
// Actions (the refine pass), from DESIGN.md sections 11 and 12:
//   Set      Here / Gone / Unknown (H, G, U) on the selected row (↑ ↓ or click).
//   Write    one detail Tam saw (1–3), which makes the row a line in Tam's hand.
//   Tilt     hold F (or the button): the low torch shows the grooves of lost lines in the legend's
//            blank band and on the postcard. Noting the grooves writes a line of its own.
//   Accept   "Correct your note to match." rubs a Gone note out to agree with the paper.
//   Copy     a postcard line into the notebook, where it holds.
//   Forecast tap the map twice: noon, then dark.
// The Photos source arrives halfway (Inés brings the camera); tilt unlocks after the first Gone.
// No fail state: a good page (17 rows right, the forecast right) is a win; anything else is done.
// Every narrative line in TEXT is written for the game (listed for approval), not quoted; the
// postcard lines are DESIGN.md section 12's own.
//
// Art (api.art): the survey sheet printing 7 to 24 is the map itself (the hit squares sit on the art's
// own sites); the legend strip of step 2; the three ground stamps on the Ground chip; Agnes's postcard
// as it reads after night 1, under the torch when tilted, and its picture side; Agnes's outline; the
// compass rose and chapter 3's card on the how-to; and behind the result the two sheets still to come
// (12 to 24 by noon, 16 to 24 by dark) under the title lettering. The old drawn map is the fallback.

//
// Phase 2 (2026-11-16): the ladder. Three sheets, each an appearance of DESIGN.md section 11:
//   1 Teach  reconcile_1: rows 1 to 3. Map, legend and the booth's master map agree with each other
//            and not with the ground. One forecast, written as a line.
//   2 Test   reconcile_2, rows 7 to 19 (the rest written on the walks): three sources wrong in three
//            ways, and the scale bar (M): it shortens one step behind the loop, so measuring the road
//            with it gives the size of the steps.
//   3 Twist  reconcile_3 with a fifth source, the first page of Marisol's book: a line for every row,
//            the same numbers, a different campground. The safe move of the first two sheets (fill the
//            row from what a source says) is now the wrong one: rows 13 to 15 were never walked, and
//            the right note for them is Unknown. Three Sure stamps (S): a stamped row cannot be
//            corrected, and a stamped row that is wrong is built as written on the pattern walk
//            (api.shared "sure"). It ends in the set-piece: two notebooks side by side by headlamp,
//            row 21 one sentence in two hands.
// Link read here: "first_page_read" (The Ranger's Book's twist) marks the rows of hers that Tam ringed.

import { pic, chapterCard, resultCard, ladder, stageTabs, linkNote } from "./kit.js";

const NAMES = ["Three rows", "Three ways wrong", "Her page"];
// Marisol's first page, rows 12 to 21: her campground, eleven summers ago. `spec` is how a row of hers
// stands in trees if Tam copies it and stamps it Sure (the pattern walk's glyph details).
const HERS = {
  12: ["a footbridge; three slept here", { persons: 3 }], 13: ["two slept here, a hammock", { persons: 2, hammock: true }],
  14: ["three slept here", { persons: 3 }], 15: ["four slept here; a tall cedar", { persons: 4, cedar: true }],
  16: ["a flagpole; one slept here", { cedar: false, persons: 1 }], 17: ["a pump; a tent pitched square", { wheel: false, crooked: false }],
  18: ["table on the far side", { table: 1 }], 19: ["three of them, a stone oven", { hammock: false, persons: 3 }],
  20: ["our car, the long tent", null], 21: ["the split boulder, slept in the crack", null],
};
const ROW21 = "the split boulder, slept in the crack";

const GREEN = "#2f6b3a", GRAPH = "#4a4a4c", CREAM = "#f1ead6", BROWN = "#9b6a3c", RED = "#9c3b30";

const GROUND2 = (n) => (n <= 11 ? "not here" : n === 12 ? "here" : n <= 15 ? "not walked" : "here");
const PHOTOS = { 4: "IMG_0004 · a clearing", 7: "IMG_0007 · a clearing, needles undisturbed", 12: "IMG_0011 · table, fire ring, the creek bend", 16: "IMG_0014 · the tall cedar", 17: "IMG_0015 · a bike against the table", 21: "IMG_0019 · the split boulder" };
const TRUTH2 = (n) => (n <= 11 ? "Gone" : n <= 15 && n >= 13 ? "Unknown" : "Here");
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const STAGE = {
  1: { sheet: "map-all", legend: "legend-24", pc: "postcard-whole", active: [1, 2, 3], from: 1, fc: ["morning"], gone: [],
    ground: (n) => (n <= 3 ? "not here" : "not walked"), map: () => true, leg: () => true, truth: () => "Gone", pre: () => null },
  2: { sheet: "map-from-7", legend: "legend-18", pc: "postcard-after-night-1", active: range(7, 19), from: 7, fc: ["noon", "dark"], gone: ["7", "9"],
    ground: GROUND2, map: (n) => n >= 7, leg: (n) => n >= 7, truth: TRUTH2,
    pre: (n) => (n <= 6 ? ["Gone", "needles undisturbed"] : n >= 20 ? ["Here", DETAILS(n)[0]] : null) },
  3: { sheet: "map-the-five", legend: "legend-5", pc: "postcard-after-dusk", active: range(12, 20), from: 12, fc: [], gone: ["7", "9", "12", "16"],
    ground: (n) => (n >= 20 ? "here" : n >= 13 && n <= 15 ? "not walked" : "not here"), map: (n) => n >= 20, leg: (n) => n >= 20,
    truth: (n) => (n >= 20 ? "Here" : n >= 13 && n <= 15 ? "Unknown" : "Gone"),
    pre: (n) => (n <= 11 ? ["Gone", "needles undisturbed"] : n === 21 ? ["Here", ROW21] : n >= 22 ? ["Here", DETAILS(n)[0]] : null) },
};
const MINE = { 12: "the creek bend", 16: "the tall cedar", 17: "a bike, onions", 18: "table by the creek", 19: "a hammock", 20: "the van", 21: ROW21 };
const LEG_WHAT = ["tent pad", "table", "fire ring"];
const DETAILS = (n) => {
  if (n <= 11) return ["needles undisturbed", "no fire ring", "no post, no ruts"];
  if (n >= 13 && n <= 15) return [];
  if (n > 24) return [];
  return {
    12: ["the creek bend", "trail register by the post"], 16: ["the tall cedar", "a cooler left open"],
    17: ["a bike, onions", "a tent pitched crooked"], 18: ["table by the creek", "three chairs"],
    19: ["a hammock", "a radio on low"], 20: ["the van", "our tarp"], 21: ["the split boulder", "Mum's site"],
    22: ["the shared fire ring", "Dell's cooler"], 23: ["June's tent", "the washing line"], 24: ["Inés's tripod", "the last post"],
  }[n];
};
// Agnes's postcard lines (DESIGN.md section 12). After step 2, 7 and 9 are gone: grooves only.
const POSTCARD = [
  { k: "7", text: "Site 7. The owl box. Count to a hundred and it calls." }, { k: "9", text: "Site 9. The shallow pool. You learned to float there." },
  { k: "12", text: "Site 12. The creek bend. Cold enough to keep the milk." },
  { k: "16", text: "Site 16. The tall cedar. You fell out of it once, and laughed." },
  { k: "heron", text: "The heron sign. Wave at it on the way in. We always did." },
  { k: "21", text: "Site 21. The split boulder. You slept in the crack of it." },
];

const TEXT = {
  sheet: ["Sheet 1 · Day 1 · the table at 21", "Sheet 2 · Day 2 · morning", "Sheet 3 · Night 2 · by headlamp"],
  goal: ["Set rows 1 to 3 against what the paper claims, then say where it will be by morning.", "Set rows 7 to 19 against what the paper claims, then forecast where the loss will reach.", "Nothing is left on the ground to check. Go through your own rows 12 to 20, and fill only what you saw."],
  rule: ["What you write holds, even when it is wrong. What the paper prints does not.", "Three sources, wrong in three ways. The scale bar is paper too: it is one step behind the road.", "Marisol's book lies open at its first page: a line for every row, the same numbers. Before you copy one, look at the rows you both have."],
  open: ["Golden hour at the table at 21. The map prints twenty-four squares. You drove past the first three and there was nothing there.", "Morning at the camp table. The map is still warm from the sun. Rows 1 to 6 you wrote on the walks; start at 7.", "Night at the table, headlamp on. Your page has gaps at 13, 14 and 15: you never walked them. Her page has no gaps at all."],
  measure: "By the map's scale bar the loop is 630 m: eighteen sites of road. Yesterday at the table the same bar gave 840. Your feet this morning: thirteen sites. The bar is one step behind the ground, and the steps so far are three sites, three, then five. It does not take one at a time.",
  measureBtn: "Measure with the scale bar (M)",
  hers: "Her line, in your hand now. It reads well. It has the right number on it.",
  hersBlank: "You never walked this one. Now the row says you did.",
  stamped: "Stamped Sure. It cannot be corrected now, whatever it says.",
  stampedNo: "That row is stamped Sure. It cannot be corrected.",
  noStamps: "Three stamps a sheet, and they are used.",
  ringed: "≠ ringed by you: not ours",
  lay: "Every row from 12 to 20 is set. One row is left that both pages have. Lay the two notebooks side by side.",
  sp: {
    cap: "Row 21, hers and yours. One sentence, in two hands, eleven years apart.",
    agnes: "And the postcard, in a third: \"Site 21. The split boulder. You slept in the crack of it.\"",
    close: "Close both books",
  },
  tilt: "Your torch is still in your jacket. Hold F to tilt the page under it: lost lines leave grooves.",
  grooves: "Six grooves in the legend's blank band, pressed by type that is not there now.",
  photos: "Inés sits down with the camera. \"I took the whole loop yesterday. Look.\" The file numbers skip.",
  accept: "You rub the line out. The paper looks surer than you feel.",
  forecast1: "Three rows set. Now the pencil line: where will it be by morning? Tap a site on the map.",
  forecast: "Every row is set. Now the pencil line: where will it reach by noon, and by dark? Tap the map.",
  dell: "Dell, over your shoulder: \"Noon's an hour off. Where does that put it?\"",
  groovesLine: "the legend had six lines more",
  copy: "copied into the notebook. In your hand, it holds.",
  end: {
    t1: (right) => `${right} of 3 rows agree with the ground. Your forecast is a line in the notebook now; by morning you will know how good it was.`,
    t3: (right, hers) => `${right} of 9 rows hold what you saw.${hers ? ` ${hers} ${hers > 1 ? "are" : "is"} in your hand and from her campground.` : " Not one line of hers is in your book."}`,
    t3sure: (ok, bad) => `${ok + bad ? `Stamped Sure: ${ok} right${bad ? `, ${bad} wrong. A wrong row stamped Sure is not a mistake any more. It is a place.` : "."}` : "No row stamped."}`,
    t3lead: "Row 21 is one sentence in two hands, and you have stopped being sure whose memory the boulder is.",
    rows: (right) => `${right} of 13 rows agree with what happened.`,
    accepted: (n) => `You corrected ${n} note${n > 1 ? "s" : ""} to match the paper, and the paper will not thank you.`,
    fcRight: "The forecast is right: 12 to 15 by noon, 16 to 19 by dark. It moves the way you drew it.",
    fcWrong: "The forecast is off: it reached 15 by noon and 19 by dark, faster than your pencil.",
    copied: (n) => `${n} of Mum's lines copied; they hold.`,
    noCopy: "None of Mum's lines copied.",
    grooves: "One line notes the legend's grooves, so the six missing entries are in your hand too.",
    winLead: "A page that holds.",
    doneLead: "The page is written. Some of it holds, some of it is wrong and holds anyway.",
  },
};

const P = "missing-campsites-reconcile-";
const CSS = `
.${P}wrap{position:absolute;inset:0;background:${CREAM};color:#222;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:14px;padding:14px;box-sizing:border-box;overflow:auto;font-family:'IBM Plex Mono',ui-monospace,monospace;background-image:repeating-linear-gradient(90deg,rgba(120,90,40,.035) 0 1px,transparent 1px 5px),radial-gradient(rgba(120,90,40,.05) 1px,transparent 1.4px);background-size:auto,6px 6px}
.${P}left{min-width:0;display:flex;flex-direction:column;gap:10px}
.${P}map{background:#f6f0dc;border:2.5px solid #3b3426;outline:1px solid #3b3426;outline-offset:3px;width:100%;height:auto;display:block;touch-action:manipulation}
.${P}map .sq{cursor:pointer}
.${P}map .sq:hover .hl{stroke:${RED};stroke-width:2.5}
.${P}tilt .${P}map{filter:contrast(1.08) brightness(.93)}
.${P}legend{border:2px solid ${GREEN};color:${GREEN};padding:8px 10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 12px;font-size:14px;position:relative}
.${P}legend h4{grid-column:1/-1;margin:0 0 4px;letter-spacing:.3em;font-size:14px;display:flex;justify-content:space-between}
.${P}legend span{height:22px;display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden}
.${P}legend span i{width:11px;height:11px;background:${GREEN};display:inline-block;flex:none}
.${P}legend span.gv{color:transparent;letter-spacing:.3em;transition:color .25s}
.${P}tilt .${P}legend span.gv{color:rgba(60,50,30,.5);text-shadow:0 1px 0 rgba(255,255,255,.7)}
.${P}legend .note{font:600 13px 'IBM Plex Mono',monospace;color:${GREEN};border:1.5px solid ${GREEN};background:#fff;padding:3px 8px;cursor:pointer;letter-spacing:0}
.${P}legend .note[hidden]{display:none}
.${P}right{min-width:0;display:flex;flex-direction:column;gap:10px}
.${P}panel{background:#fbf8ee;border:1.5px solid #b9b09a;padding:10px}
.${P}title{font-size:15px;font-weight:600;margin-bottom:6px;display:flex;justify-content:space-between;gap:8px}
.${P}title small{font-size:12px;font-weight:400;color:${GRAPH}}
.${P}chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.${P}chip{border:1.5px solid ${GREEN};border-radius:14px;padding:5px 10px;font-size:14px;color:#24402a;background:#fff;min-height:34px;line-height:1.25}
.${P}chip b{display:block;font-size:12px;letter-spacing:.12em;color:${GREEN}}
.${P}chip.off{opacity:.45;border-style:dashed}
.${P}chip.pulse{animation:${P}pulse 1s 2}
@keyframes ${P}pulse{50%{background:#f4d9a8}}
.${P}acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.${P}acts button,.${P}fc button,.${P}card button,.${P}tb{font:600 14px 'IBM Plex Mono',monospace;border:1.5px solid ${GRAPH};background:#fff;color:#222;padding:7px 11px;cursor:pointer;min-height:38px}
.${P}acts button:hover,.${P}fc button:hover,.${P}tb:hover{border-color:${RED}}
.${P}acts button.on{background:${GRAPH};color:#fff}
.${P}acts .det{font-family:Caveat,'Segoe Print',cursive;font-size:19px;font-weight:600;border-style:dashed}
.${P}acts .det.on{background:#fff3df;color:#222;border-style:solid;border-color:${RED}}
.${P}acts .accept{font-family:'Zilla Slab',Georgia,serif;border-color:${GREEN};color:${GREEN};flex-basis:100%}
.${P}tb.on{background:#3a2a14;color:#ffd9a0}
.${P}book{background:#fbf8ee;border:1.5px solid #b9b09a;flex:1;min-height:240px;overflow:auto;position:relative}
.${P}book table{width:100%;border-collapse:collapse;font-size:14px}
.${P}book th{position:sticky;top:0;background:#fbf8ee;color:${GREEN};text-align:left;padding:5px 4px;font-size:12px;border-bottom:1.5px solid ${GREEN};z-index:1}
.${P}book td{border-bottom:1px solid #a9c3cf;padding:2px 4px;height:26px}
.${P}book td.h{font-family:Caveat,'Segoe Print',cursive;font-size:20px;color:#3a3a3c;line-height:1}
.${P}book tr{cursor:pointer}
.${P}book tr:hover td{background:#fff8ea}
.${P}book tr.sel td{background:#fff0d6}
.${P}book tr.sel td:first-child{box-shadow:inset 4px 0 ${RED}}
.${P}book tr.arrow td:first-child::before{content:"→ ";color:${RED}}
.${P}book tr.ink td.h{animation:${P}ink .7s}
@keyframes ${P}ink{0%{color:${RED};text-shadow:0 0 6px rgba(156,59,48,.4)}}
.${P}card{background:#fff;border:1px solid #d4c9ad;padding:8px 10px;font-family:Caveat,'Segoe Print',cursive;font-size:18px;color:#6a4a2a;line-height:1.15;box-shadow:2px 3px 0 rgba(0,0,0,.08);transform:rotate(-.6deg)}
.${P}card>b{display:block;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#6b6b6b}
.${P}card div{display:flex;gap:8px;align-items:center;justify-content:space-between;margin:3px 0}
.${P}card .groove{color:transparent;letter-spacing:.2em;transition:color .25s}
.${P}tilt .${P}card .groove{color:#b7ab92}
.${P}card button{font-size:12px;min-height:30px;padding:3px 8px}
.${P}fc{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px}
.${P}fc button.on{outline:3px solid ${RED}}
.${P}fc button:disabled{opacity:.4;cursor:default}
.${P}say{font-family:Caveat,'Segoe Print',cursive;font-size:21px;line-height:1.15;color:#2a2a2c;border-left:4px solid ${RED};padding:2px 10px;min-height:24px}
.${P}book tr.off td{opacity:.5}
.${P}book tr.off{cursor:default}
.${P}book td.h img{width:24px;height:24px;vertical-align:middle;margin-left:4px}
.${P}book td.h.hers{font-style:italic;color:#5a4a6a}
.${P}acts .hers{font-family:Georgia,serif;font-style:italic;border-color:#5a4a6a;color:#5a4a6a;flex-basis:100%;text-align:left}
.${P}acts .sure{border-color:${RED};color:${RED}}
.${P}acts .sure img{width:26px;height:26px;vertical-align:middle;margin:-4px 4px -4px -2px}
.${P}acts button:disabled{opacity:.4;cursor:default}
.${P}chip .ring{display:block;font:600 12px 'IBM Plex Mono',monospace;color:${RED}}
.${P}sp{position:absolute;inset:0;z-index:6;background:#0a0d12;display:grid;place-items:center;padding:14px;box-sizing:border-box;overflow:auto}
.${P}sp .in{width:min(760px,100%);display:grid;gap:12px}
.${P}sp .pages{display:grid;grid-template-columns:1fr 1fr;gap:10px;position:relative}
.${P}sp .pg{background:#f1ead6;padding:10px 12px;min-width:0;background-image:repeating-linear-gradient(180deg,transparent 0 37px,#a9c3cf 37px 38px);position:relative}
.${P}sp .pg b{display:block;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.12em;color:${GREEN};height:38px;line-height:38px}
.${P}sp .pg div{height:38px;line-height:38px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:clamp(15px,2.6vw,22px);opacity:.3}
.${P}sp .pg div.r21{opacity:1;background:radial-gradient(closest-side,rgba(255,240,200,.95),rgba(255,240,200,0));white-space:normal;height:76px;line-height:38px}
.${P}sp .hers div{font-family:Georgia,serif;font-style:italic;color:#4a4a5c}
.${P}sp .mine div{font-family:Caveat,'Segoe Print',cursive;color:#3a3a3c;font-size:clamp(18px,3vw,26px)}
.${P}sp p{margin:0;font-family:Caveat,'Segoe Print',cursive;font-size:23px;line-height:1.2;color:#f1e9d6;text-align:center}
.${P}sp p.ag{font-size:20px;color:#d9c9a8}
.${P}sp button{justify-self:center;font:600 15px 'IBM Plex Mono',monospace;background:#f1ead6;color:#222;border:0;padding:11px 22px;cursor:pointer;min-height:44px}
.${P}sp button:focus-visible{outline:3px solid #c9a862;outline-offset:3px}
@media (max-width:520px){.${P}sp .pages{grid-template-columns:1fr}}
.${P}legend.art{display:block;padding:0;border-width:1.5px}
.${P}legend.art>img{display:block;width:100%;height:auto}
.${P}legend.art h4{position:absolute;right:6px;top:4px;margin:0}
.${P}legend.art h4>span{display:none}
.${P}legend .gvs{display:none;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 12px;padding:2px 10px;font-size:14px}
.${P}tilt .${P}legend .gvs{display:grid}
.${P}chip img{float:right;width:46px;height:46px;margin:-2px -4px -2px 6px}
.${P}card .pc{display:block;width:100%;height:auto;margin:4px 0 6px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.${P}card .hd{display:flex;align-items:center;justify-content:flex-start;gap:8px}
.${P}card .hd img{width:34px;height:42px;object-fit:cover;object-position:50% 18%;border:1px solid #b9b09a}
.${P}card .hd button{margin-left:auto}
.${P}plate .rose{float:right;width:84px;height:84px;margin:0 0 6px 10px}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(241,234,214,.93);z-index:4;padding:16px;overflow:auto}
.${P}plate{max-width:480px;width:100%;box-sizing:border-box;background:#fbf8ee;border:3px double ${GREEN};padding:18px 22px;color:#222;position:relative;
  background-image:repeating-radial-gradient(circle at 115% -10%,transparent 0 22px,rgba(155,106,60,.16) 22px 23.5px)}
.${P}plate .sheet{font-size:12px;letter-spacing:.2em;color:${GREEN};text-transform:uppercase;border-bottom:1.5px solid ${GREEN};padding-bottom:4px}
.${P}plate h2{margin:8px 0 4px;font:700 32px 'Zilla Slab',Georgia,serif;color:${GREEN};letter-spacing:.06em;text-transform:uppercase}
.${P}plate .goal{font-size:16px;line-height:1.4;margin:0 0 8px}
.${P}plate .rule{font-family:Caveat,'Segoe Print',cursive;font-size:21px;margin:0 0 10px;color:#3a3a3c}
.${P}plate table{border-collapse:collapse;font-size:14px;margin:0 0 12px;width:100%}
.${P}plate td{border-top:1px solid #b9b09a;padding:5px 6px 5px 0;vertical-align:top}
.${P}plate td:first-child{color:${GREEN};font-weight:600;white-space:nowrap}
.${P}plate kbd{font:600 13px 'IBM Plex Mono',monospace;border:1px solid ${GREEN};padding:0 4px;background:#fff}
.${P}plate .scale{display:flex;margin:0 0 12px}.${P}plate .scale i{width:30px;height:6px;border:1px solid #222}.${P}plate .scale i:nth-child(odd){background:#222}
.${P}plate button{font:600 15px 'IBM Plex Mono',monospace;background:${GREEN};color:#fff;border:0;padding:11px 22px;cursor:pointer}
.${P}plate button:focus-visible{outline:3px solid ${RED};outline-offset:3px}
@media (max-width:760px){.${P}wrap{grid-template-columns:1fr;padding:10px}.${P}right{order:-1}.${P}legend{grid-template-columns:repeat(2,minmax(0,1fr))}.${P}book{min-height:280px;max-height:52vh}.${P}chips{grid-template-columns:1fr 1fr}.${P}chip{font-size:13px}}
`;

export default { mount(root, api) { return ladder(root, api, mountStage, NAMES); } };

function mountStage(root, api, stage) {
  {
    const CFG = STAGE[stage], GROUND = CFG.ground, MAP = CFG.map, LEGEND = CFG.leg, TRUTH = CFG.truth;
    const ACTIVE = new Set(CFG.active);
    const ringed = stage === 3 && !!(api.shared && api.shared.get("first_page_read", false));
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}left"><svg class="${P}map" viewBox="0 0 700 440" role="img" aria-label="The paper map of Hollin Creek"></svg>
        <div class="${P}legend"><h4><span>LEGEND</span><button type="button" class="note" hidden>Note the grooves</button></h4></div>
        <div class="${P}panel ${P}fc"><b>FORECAST</b><span class="fcmsg">Set every row first.</span></div>
        <div class="${P}card" aria-label="Agnes's postcard"></div></div>
      <div class="${P}right">
        <div class="${P}panel"><div class="${P}title"><span class="st"></span><small class="prog"></small></div><div class="${P}chips"></div><div class="${P}acts"></div></div>
        <div class="${P}say" aria-live="polite"></div>
        <div class="${P}book"><table><thead><tr><th>#</th><th>Seen</th><th>Map</th><th>Leg.</th><th>Note</th></tr></thead><tbody></tbody></table></div>
        <div><button type="button" class="${P}tb" hidden>Tilt to the torch (hold F)</button></div>
      </div>
      <div class="${P}intro"><div class="${P}plate"><div class="sheet"></div><h2>Reconcile</h2>
        <p class="goal"></p><p class="rule"></p>
        <table><tr><td>Pick a row</td><td>click it, or <kbd>↑</kbd> <kbd>↓</kbd></td></tr>
          <tr><td>Set it</td><td>Here <kbd>H</kbd> · Gone <kbd>G</kbd> · Unknown <kbd>U</kbd> (not walked)</td></tr>
          <tr><td>Write it</td><td>tap a detail you saw, or <kbd>1</kbd>–<kbd>3</kbd></td></tr>
          ${stage === 2 ? "<tr><td>Measure</td><td><kbd>M</kbd>: lay the scale bar along the loop</td></tr>" : ""}
          ${stage === 3 ? "<tr><td>Stamp</td><td><kbd>S</kbd>: Sure, three a sheet. A stamped row cannot be corrected</td></tr>" : ""}</table>
        <div class="scale"><i></i><i></i><i></i><i></i></div>
        <button type="button">Open the map</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".sheet").textContent = TEXT.sheet[stage - 1]; $(`.${P}plate .goal`).textContent = TEXT.goal[stage - 1]; $(`.${P}plate .rule`).textContent = TEXT.rule[stage - 1];
    stageTabs(api, $(`.${P}plate>button`));
    if (ringed) linkNote($(`.${P}right`), "Because you read the first page in The Ranger's Book, the rows of hers you ringed there are marked here: not this campground.");
    const NS = "http://www.w3.org/2000/svg";
    const svg = $(`.${P}map`);
    const mk = (tag, a, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };
    const sayEl = $(`.${P}say`);
    const say = (t) => { sayEl.textContent = t; };
    const said = new Set();
    const beat = (k, t) => { if (said.has(k)) return false; said.add(k); say(t); return true; };
    const art = api.art;
    const sheet = art && art.has(CFG.sheet);
    chapterCard(art, ["chapter-1", "chapter-3", "chapter-5"][stage - 1], $(`.${P}plate`));
    { const rose = pic(art, "compass-rose", "rose", ""); if (rose) $(`.${P}plate h2`).before(rose); }

    // ---- the survey print: the art's sheet, or (without it) the drawn one ----
    let CX = 360, CY = 215, RX = 255, RY = 150, U = 1;
    let sitePos = (n) => { const a = (150 + (n - 0.5) * 15) * Math.PI / 180; return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), a }; };
    if (sheet) {
      // the sheet is 1100 x 800; its sites stand where art/src/40_maps.py puts them
      svg.setAttribute("viewBox", "0 0 1100 800");
      mk("image", { x: 0, y: 0, width: 1100, height: 800 }).setAttribute("href", art.url(CFG.sheet));
      CX = 560; CY = 440; RX = 300; RY = 250; U = 1.5;
      const theta = (n) => (n <= 12 ? 106 + (n - 1) * 156 / 11 : 74 - (n - 13) * 156 / 11) * Math.PI / 180;
      sitePos = (n) => ({ x: CX + RX * 1.12 * Math.cos(theta(n)), y: CY + RY * 1.12 * Math.sin(theta(n)) });
    } else {
    const hgt = (x, y) => [[220, 150, 110, 1], [500, 300, 100, 0.7], [470, 100, 80, 0.45], [120, 360, 90, -0.35]]
      .reduce((v, [px, py, s, a]) => v + a * Math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * s * s)), 0) + 0.06 * Math.sin(x / 47) * Math.cos(y / 61);
    const step = 10;
    for (let li = 0; li < 22; li++) {          // contour lines by marching squares
      const lev = -0.3 + li * 0.065;
      let d = "";
      for (let y = 0; y < 440; y += step) for (let x = 0; x < 700; x += step) {
        const c = [hgt(x, y), hgt(x + step, y), hgt(x + step, y + step), hgt(x, y + step)];
        const pts = [];
        const e = (a, b, ax, ay, bx, by) => { if ((c[a] - lev) * (c[b] - lev) < 0) { const t = (lev - c[a]) / (c[b] - c[a]); pts.push([ax + (bx - ax) * t, ay + (by - ay) * t]); } };
        e(0, 1, x, y, x + step, y); e(1, 2, x + step, y, x + step, y + step); e(2, 3, x + step, y + step, x, y + step); e(3, 0, x, y + step, x, y);
        if (pts.length >= 2) d += `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}L${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`;
      }
      if (d) mk("path", { d, fill: "none", stroke: BROWN, "stroke-width": li % 5 === 0 ? 1.8 : 0.8, opacity: 0.8, "stroke-linecap": "round" });
    }
    mk("path", { d: "M0 400 C80 360 150 410 230 430 S330 440 360 440", fill: "none", stroke: "#3d7fa6", "stroke-width": 3 });
    let road = "";
    for (let k = 0; k <= 96; k++) { const a = k / 96 * Math.PI * 2; road += `${k ? "L" : "M"}${(CX + RX * Math.cos(a)).toFixed(1)} ${(CY + RY * Math.sin(a)).toFixed(1)}`; }
    mk("path", { d: road + "Z", fill: "none", stroke: "#222", "stroke-width": 9 });
    mk("path", { d: road + "Z", fill: "none", stroke: "#f6f0dc", "stroke-width": 5 });
    const ent = sitePos(0.4);
    mk("path", { d: `M0 420 Q60 380 ${ent.x} ${ent.y}`, fill: "none", stroke: "#222", "stroke-width": 9 });
    mk("path", { d: `M0 420 Q60 380 ${ent.x} ${ent.y}`, fill: "none", stroke: "#f6f0dc", "stroke-width": 5 });
    mk("rect", { x: 10, y: 400, width: 22, height: 16, fill: RED });
    mk("path", { d: "M660 26 L670 66 L660 58 L650 66 Z", fill: "#222" });
    const nt = mk("text", { x: 653, y: 86, "font-size": 15, "font-family": "Georgia,serif" }); nt.textContent = "N";
    for (let k = 0; k < 4; k++) mk("rect", { x: 520 + k * 28, y: 412, width: 28, height: 6, fill: k % 2 ? "#f6f0dc" : "#222", stroke: "#222" });
    const ttl = mk("text", { x: 22, y: 34, "font-size": 20, "font-weight": 700, "letter-spacing": 4, fill: "#222", "font-family": "'Zilla Slab',Georgia,serif" });
    ttl.textContent = "HOLLIN CREEK";
    }
    const fcLayer = mk("g", {});
    const selRing = mk("circle", { r: 17 * U, fill: "none", stroke: RED, "stroke-width": 3 * U, "stroke-dasharray": "5 3", visibility: "hidden", "pointer-events": "none" });
    const squares = {};
    for (let n = 1; n <= 24; n++) {
      const s = sitePos(n);
      const sx = sheet ? s.x : s.x + (s.x - CX) * 0.13, sy = sheet ? s.y : s.y + (s.y - CY) * 0.17;
      const g = mk("g", { class: "sq" });
      mk("rect", { class: "hl", x: sx - 14 * U * (sheet ? 1.3 : 1), y: sy - 14 * U * (sheet ? 1.3 : 1), width: 28 * U * (sheet ? 1.3 : 1), height: 28 * U * (sheet ? 1.3 : 1), fill: "transparent", stroke: "none" }, g);   // hit area
      if (MAP(n) && !sheet) {
        mk("rect", { x: sx - 8, y: sy - 8, width: 16, height: 16, fill: "#222" }, g);
        const t = mk("text", { x: sx + (s.x >= CX ? 13 : -13), y: sy + 6, "text-anchor": s.x >= CX ? "start" : "end", "font-size": 16, "font-family": "'IBM Plex Mono',monospace", fill: "#222" }, g);
        t.textContent = n;
      }
      g.addEventListener("click", () => forecastAt(n));
      squares[n] = { x: sx, y: sy, g };
    }

    // ---- legend: entries 7–24, the box keeps its height; six grooves in the blank band ----
    const lg = $(`.${P}legend`);
    const strip = pic(art, CFG.legend, "", "The legend strip, as it prints on this sheet");
    let gvBox = lg;
    if (strip) { lg.classList.add("art"); lg.appendChild(strip); gvBox = document.createElement("div"); gvBox.className = "gvs"; lg.appendChild(gvBox); }
    else for (let n = 1; n <= 24; n++) { if (!LEGEND(n)) continue; const s = document.createElement("span"); s.innerHTML = `<i></i><b>${n}</b> ${LEG_WHAT[n % 3]}`; lg.appendChild(s); }
    for (let k = 0; k < (stage === 1 ? 0 : 6); k++) { const s = document.createElement("span"); s.className = "gv"; s.textContent = "▪ ~~ ~~~~~~"; gvBox.appendChild(s); }

    // ---- notebook ----
    const rows = {};
    for (let n = 1; n <= 24; n++) { const pre = ACTIVE.has(n) ? null : CFG.pre(n); rows[n] = { status: pre ? pre[0] : null, note: pre ? pre[1] : "", accepted: false }; }
    let stamps = 3;
    const tbody = $("tbody");
    const trs = {};
    for (let n = 1; n <= 24; n++) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${n}</td><td class="h"></td><td>${MAP(n) ? "■" : "–"}</td><td style="color:${GREEN}">${LEGEND(n) ? "■" : "–"}</td><td class="h"></td>`;
      tr.addEventListener("click", () => select(n));
      if (!ACTIVE.has(n) && !rows[n].status) tr.classList.add("off");
      tbody.appendChild(tr);
      trs[n] = tr;
    }
    let sel = CFG.from, accepted = 0, measured = false, copied = new Set(), phase = "rows", fcMode = CFG.fc[0] || "noon", fc = {}, idle = 0, over = false;
    let photos = false, tiltOk = false, grooveLine = false;

    function paintRow(n, fresh) {
      const r = rows[n], td = trs[n].children;
      td[1].textContent = r.status || "";
      td[4].textContent = r.note; td[4].classList.toggle("hers", !!r.hers);
      if (r.sure) { const st = pic(art, "stamp-sure", "", "Sure"); if (st) td[4].appendChild(st); else td[4].appendChild(document.createTextNode(" [SURE]")); }
      if (fresh && !api.reducedMotion) { trs[n].classList.remove("ink"); void trs[n].offsetWidth; trs[n].classList.add("ink"); }
    }
    const setCount = () => CFG.active.filter((n) => rows[n].status).length;
    function select(n) {
      sel = n; idle = 0;
      Object.values(trs).forEach((t) => t.classList.remove("sel", "arrow"));
      trs[n].classList.add("sel");
      trs[n].scrollIntoView?.({ block: "nearest" });
      selRing.setAttribute("cx", squares[n].x); selRing.setAttribute("cy", squares[n].y); selRing.setAttribute("visibility", "visible");
      const mine = ACTIVE.has(n);
      $(".st").textContent = `Site ${n}${mine ? "" : rows[n].status ? " · already written" : " · not walked yet"}`;
      $(".prog").textContent = `rows set ${setCount()}/${CFG.active.length}`;
      const chips = $(`.${P}chips`);
      chips.innerHTML = "";
      const src = [["GROUND", GROUND(n)], ["MAP", MAP(n) ? "printed square" : "nothing printed"], ["LEGEND", LEGEND(n) ? `■ ${n} ${LEG_WHAT[n % 3]}` : "no entry"],
        stage === 1 ? ["BOOTH MAP", "printed square"] : stage === 3 ? ["HER PAGE", HERS[n] ? `${n}. ${HERS[n][0]}` : "an older page"] : ["PHOTOS", photos ? (PHOTOS[n] || "none") : "not yet"]];
      if (stage === 3) src[0] = ["YOUR PAGE", MINE[n] ? `${n}. ${MINE[n]}` : n >= 13 && n <= 15 ? "blank: never walked" : rows[n].note || "written"];
      src.forEach(([h, v], i) => {
        const c = document.createElement("div"); c.className = P + "chip" + (i === 3 && stage === 2 && !photos ? " off" : "");
        if (i === 3 && ringed && HERS[n] && MINE[n] && n !== 21) { const rg = document.createElement("span"); rg.className = "ring"; rg.textContent = TEXT.ringed; c.appendChild(rg); }
        if (i === 0 && stage !== 3) { const st = pic(art, { "here": "stamp-here", "not here": "stamp-gone", "not walked": "stamp-not-walked" }[v], "", ""); if (st) c.appendChild(st); }
        const hb = document.createElement("b"); hb.textContent = h; c.appendChild(hb);
        c.appendChild(document.createTextNode(v)); chips.appendChild(c);
      });
      const acts = $(`.${P}acts`);
      acts.innerHTML = "";
      if (!mine) return;
      [["Here", "H"], ["Gone", "G"], ["Unknown", "U"]].forEach(([s, k]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = `${s} (${k})`;
        if (rows[n].status === s) b.classList.add("on");
        b.addEventListener("click", () => setStatus(n, s));
        acts.appendChild(b);
      });
      if (rows[n].status && rows[n].status !== "Unknown") DETAILS(n).forEach((d, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "det" + (rows[n].note === d ? " on" : ""); b.textContent = `${i + 1} · ${d}`;
        b.addEventListener("click", () => writeDetail(n, i));
        acts.appendChild(b);
      });
      if (rows[n].status === "Gone" && (MAP(n) || LEGEND(n))) {
        const b = document.createElement("button"); b.type = "button"; b.className = "accept";
        b.textContent = "Correct your note to match.";
        b.addEventListener("click", () => { rows[n].status = "Here"; rows[n].note = ""; rows[n].accepted = true; accepted++; paintRow(n, true); say(TEXT.accept); select(n); check(); });
        acts.appendChild(b);
      }
      if (stage === 3 && HERS[n]) {
        const b = document.createElement("button"); b.type = "button"; b.className = "hers"; b.textContent = `Copy her row: “${HERS[n][0]}”`;
        b.disabled = !!rows[n].sure;
        b.addEventListener("click", () => copyHers(n));
        acts.appendChild(b);
      }
      if (stage === 3 && rows[n].status) {
        const b = document.createElement("button"); b.type = "button"; b.className = "sure";
        const im = pic(art, "stamp-sure", "", ""); if (im) b.appendChild(im);
        b.appendChild(document.createTextNode(rows[n].sure ? "Stamped Sure" : `Stamp it Sure (S) · ${stamps} left`));
        b.disabled = !!rows[n].sure || stamps <= 0;
        b.addEventListener("click", () => stamp(n));
        acts.appendChild(b);
      }
    }
    function copyHers(n) {
      if (phase !== "rows" || !ACTIVE.has(n) || !HERS[n]) return;
      if (rows[n].sure) { say(TEXT.stampedNo); return; }
      rows[n].status = n >= 20 ? "Here" : "Gone"; rows[n].note = HERS[n][0]; rows[n].hers = true;
      paintRow(n, true); say(MINE[n] ? TEXT.hers : TEXT.hersBlank); select(n); check();
    }
    function stamp(n) {
      if (stage !== 3 || phase !== "rows" && phase !== "lay") return;
      if (!ACTIVE.has(n) || !rows[n].status || rows[n].sure) return;
      if (stamps <= 0) { say(TEXT.noStamps); return; }
      rows[n].sure = true; stamps--; paintRow(n, true); say(TEXT.stamped); select(n);
    }
    function writeDetail(n, i) {
      const d = DETAILS(n)[i];
      if (!d || !ACTIVE.has(n) || !rows[n].status || rows[n].status === "Unknown") return;
      if (rows[n].sure) { say(TEXT.stampedNo); return; }
      rows[n].note = d; rows[n].hers = false; paintRow(n, true);
      select(nextUnset(n) || n);
    }
    function nextUnset(from) { for (let k = 1; k <= 24; k++) { const m = ((from + k - 1) % 24) + 1; if (ACTIVE.has(m) && !rows[m].status) return m; } return null; }
    function setStatus(n, s) {
      if (phase === "done" || !ACTIVE.has(n)) return;
      if (rows[n].sure) { say(TEXT.stampedNo); return; }
      rows[n].status = s; rows[n].hers = false;
      if (stage === 3 && rows[n].note && !DETAILS(n).includes(rows[n].note)) rows[n].note = "";
      if (s === "Unknown") rows[n].note = "not walked";
      else if (rows[n].note === "not walked") rows[n].note = "";
      paintRow(n, true);
      if (s === "Gone" && !tiltOk && stage === 2) { tiltOk = true; $(`.${P}tb`).hidden = false; beat("tilt", TEXT.tilt); }
      if (stage === 2 && !photos && setCount() >= 6) { photos = true; beat("photos", TEXT.photos); }
      select(s === "Unknown" ? (nextUnset(n) || n) : n);
      check();
    }
    function check() {
      const left = CFG.active.filter((n) => !rows[n].status);
      if (!left.length && phase === "rows" && stage === 3) {
        phase = "lay"; say(TEXT.lay);
        const f = $(`.${P}fc`); f.innerHTML = "<b>ROW 21</b>";
        const b = document.createElement("button"); b.type = "button"; b.className = "lay"; b.textContent = "Lay the two notebooks side by side";
        b.addEventListener("click", setPiece); f.appendChild(b); b.focus();
        return;
      }
      if (!left.length && phase === "rows") {
        phase = "forecast";
        say(stage === 1 ? TEXT.forecast1 : TEXT.forecast);
        drawForecastUI();
        svg.scrollIntoView?.({ block: "nearest", behavior: api.reducedMotion ? "auto" : "smooth" });
      }
    }

    // ---- forecast ----
    function drawForecastUI() {
      const f = $(`.${P}fc`);
      f.innerHTML = "<b>FORECAST</b>";
      const msg = document.createElement("span"); msg.textContent = `Tap the map: by ${fcMode}`;
      f.appendChild(msg);
      if (stage === 2) {
        const mb = document.createElement("button"); mb.type = "button"; mb.className = "meas"; mb.textContent = TEXT.measureBtn;
        mb.disabled = measured; mb.addEventListener("click", measure); f.appendChild(mb);
      }
      for (const m of CFG.fc) {
        const b = document.createElement("button"); b.type = "button"; b.textContent = `by ${m}${fc[m] ? ": " + fc[m] : ""}`;
        if (fcMode === m) b.classList.add("on");
        b.addEventListener("click", () => { fcMode = m; drawForecastUI(); });
        f.appendChild(b);
      }
      const w = document.createElement("button"); w.type = "button"; w.textContent = "Write it in the notebook";
      w.disabled = !CFG.fc.every((m) => fc[m]);
      w.addEventListener("click", finish);
      f.appendChild(w);
    }
    function forecastAt(n) {
      if (phase !== "forecast") { if (phase === "rows") select(n); return; }
      fc[fcMode] = n;
      fcLayer.innerHTML = "";
      for (const m of CFG.fc) {
        if (!fc[m]) continue;
        const s = squares[fc[m]];
        mk("path", { d: `M${CX} ${CY} L${s.x} ${s.y}`, stroke: GRAPH, "stroke-width": 3.5 * U, "stroke-linecap": "round", fill: "none" }, fcLayer);
        mk("circle", { cx: s.x, cy: s.y, r: 13 * U, fill: "none", stroke: GRAPH, "stroke-width": 2.5 * U }, fcLayer);
        const t = mk("text", { x: (CX + s.x) / 2 + 6, y: (CY + s.y) / 2 - 6, "font-size": 24 * U, fill: GRAPH, stroke: "#f4edd9", "stroke-width": 5 * U, "paint-order": "stroke", "font-family": "Caveat,cursive", "font-weight": 700 }, fcLayer);
        t.textContent = `by ${m}`;
      }
      if (stage === 2 && fcMode === "noon" && !fc.dark) { fcMode = "dark"; beat("dell", TEXT.dell); }
      drawForecastUI();
    }

    // ---- the scale bar (stage 2): paper too, and one step behind the road ----
    const measLayer = mk("g", { "pointer-events": "none" });
    function measure() {
      if (stage !== 2 || measured || over || $(`.${P}intro`)) return;
      measured = true; say(TEXT.measure);
      [[3, "3"], [6, "3"], [11, "5"]].forEach(([n, lab]) => {
        const s = squares[n], t = mk("text", { x: s.x, y: s.y - 20 * U, "text-anchor": "middle", "font-size": 22 * U, fill: GRAPH, stroke: "#f4edd9", "stroke-width": 4 * U, "paint-order": "stroke", "font-family": "Caveat,cursive", "font-weight": 700 }, measLayer);
        t.textContent = `⌒ ${lab} sites`;
      });
      if (phase === "forecast") drawForecastUI();
    }
    // ---- the set-piece (stage 3): two notebooks side by side by headlamp ----
    function setPiece() {
      if (over || wrap.querySelector(`.${P}sp`)) return;
      const sp = document.createElement("div"); sp.className = P + "sp"; sp.setAttribute("role", "dialog"); sp.setAttribute("aria-label", "Two notebooks, side by side");
      const row = (n, t, c) => `<div class="${c}">${n}. ${t}</div>`;
      sp.innerHTML = `<div class="in"><div class="pages">
        <div class="pg hers"><b>HER FIRST PAGE · PENCIL</b>${row(20, HERS[20][0], "")}${row(21, ROW21, "r21")}<div>22. the shared ring</div></div>
        <div class="pg mine"><b>YOUR SITES PAGE · PENCIL</b>${row(20, rows[20].note || "the van", "")}${row(21, ROW21, "r21")}<div>22. ${rows[22].note}</div></div></div>
        <p></p><p class="ag"></p><button type="button"></button></div>`;
      sp.querySelector("p").textContent = TEXT.sp.cap; sp.querySelector(".ag").textContent = TEXT.sp.agnes;
      const b = sp.querySelector("button"); b.textContent = TEXT.sp.close; b.addEventListener("click", () => { finish(); });
      wrap.scrollTop = 0; wrap.style.overflow = "hidden"; wrap.appendChild(sp); b.focus();
    }

    // ---- postcard in the margin ----
    const card = $(`.${P}card`);
    card.innerHTML = `<b>AGNES'S POSTCARD</b>`;
    const pcIds = { front: CFG.pc, torch: "postcard-under-torch", back: "postcard-picture-side" };
    const pc = pic(art, pcIds.front, "pc", "The postcard's written side: four lines left, and two blank where lines were");
    let pcSide = "front";
    const paintPc = () => {
      if (!pc) return;
      const id = pcSide === "back" ? pcIds.back : wrap.classList.contains(P + "tilt") && art.has(pcIds.torch) ? pcIds.torch : pcIds.front;
      pc.src = art.url(id);
    };
    if (pc) {
      const hd = document.createElement("div"); hd.className = "hd";
      const ag = pic(art, "outline-agnes", "", ""); if (ag) hd.appendChild(ag);
      const lab = document.createElement("b"); lab.textContent = "AGNES'S POSTCARD"; lab.style.cssText = "font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#6b6b6b";
      hd.appendChild(lab);
      if (art.has(pcIds.back)) {
        const fl = document.createElement("button"); fl.type = "button"; fl.textContent = "Turn it over";
        fl.addEventListener("click", () => { pcSide = pcSide === "back" ? "front" : "back"; fl.textContent = pcSide === "back" ? "The written side" : "Turn it over"; paintPc(); });
        hd.appendChild(fl);
      }
      card.innerHTML = ""; card.append(hd, pc);
    }
    for (const line of POSTCARD) {
      const d = document.createElement("div");
      if (CFG.gone.includes(line.k)) { d.innerHTML = `<span class="groove">— — — — — — — — —</span>`; card.appendChild(d); continue; }
      const s = document.createElement("span"); s.textContent = line.text; d.appendChild(s);
      const b = document.createElement("button"); b.type = "button"; b.textContent = "Copy";
      b.addEventListener("click", () => { copied.add(line.k); b.textContent = "Copied"; b.disabled = true; say(`${line.text.split(".")[0]}: ${TEXT.copy}`); });
      d.appendChild(b); card.appendChild(d);
    }

    // ---- tilt to the torch ----
    const noteBtn = $(".note");
    const tiltOn = () => { if (!tiltOk || over) return; wrap.classList.add(P + "tilt"); $(`.${P}tb`).classList.add("on"); if (!grooveLine) noteBtn.hidden = false; paintPc(); };
    const tiltOff = () => { wrap.classList.remove(P + "tilt"); $(`.${P}tb`).classList.remove("on"); paintPc(); };
    const tb = $(`.${P}tb`);
    tb.addEventListener("pointerdown", (e) => { e.preventDefault(); tiltOn(); });
    for (const ev of ["pointerup", "pointerleave", "pointercancel"]) tb.addEventListener(ev, tiltOff);
    noteBtn.addEventListener("click", () => { grooveLine = true; noteBtn.hidden = true; say(`${TEXT.grooves} Notebook: "${TEXT.groovesLine}."`); });

    function finish() {
      if (over) return;
      over = true; phase = "done";
      let right = 0;
      for (const n of CFG.active) if (rows[n].status === TRUTH(n) && !rows[n].hers) right++;
      const E0 = TEXT.end;
      if (api.shared) api.shared.set("mother_lines_kept", Math.max(copied.size, api.shared.get("mother_lines_kept", 0) || 0));
      if (stage === 1) {
        const ok = right === 3 && !accepted;
        tiltOff();
        resultCard(wrap, art, { cards: ["map-from-7"], lost: ok ? 0 : 1 + accepted, caption: "The sheet to come: by morning.", reducedMotion: api.reducedMotion });
        api.end({ outcome: ok ? "win" : "done", text: [ok ? E0.winLead : E0.doneLead, E0.t1(right), accepted ? E0.accepted(accepted) : "", copied.size ? E0.copied(copied.size) : E0.noCopy].filter(Boolean).join(" "), next: "Day 2: thirteen rows, and the sources disagree three ways." });
        return;
      }
      if (stage === 3) {
        const hers = CFG.active.filter((n) => rows[n].hers).length;
        const sure = {}; let sOk = 0, sBad = 0;
        for (const n of CFG.active) {
          if (!rows[n].sure) continue;
          const ok = rows[n].status === TRUTH(n) && !rows[n].hers;
          if (ok) sOk++; else sBad++;
          if (n <= 19) sure[n] = ok ? { right: true } : { right: false, line: rows[n].hers ? rows[n].note : `${rows[n].status}${rows[n].note ? ": " + rows[n].note : ""}`, spec: rows[n].hers && HERS[n][1] ? HERS[n][1] : { empty: true } };
        }
        if (api.shared) api.shared.set("sure", sure);                 // stamps to trees: the pattern walk builds these
        const good3 = right >= 7 && !sBad;
        api.store.set("last", { right, hers, sure_right: sOk, sure_wrong: sBad });
        const spEl = wrap.querySelector(`.${P}sp`); if (spEl) spEl.remove(); wrap.style.overflow = "";
        resultCard(wrap, art, { cards: ["logbook-first-page"], lost: good3 ? 0 : Math.min(5, 1 + hers + sBad), reducedMotion: api.reducedMotion });
        api.end({ outcome: good3 ? "win" : "done", text: [E0.t3lead, E0.t3(right, hers), E0.t3sure(sOk, sBad), copied.size ? E0.copied(copied.size) : ""].filter(Boolean).join(" ") });
        return;
      }
      const fr = Math.abs(fc.noon - 15) <= 1 && Math.abs(fc.dark - 19) <= 1;
      const good = right >= 11 && fr;
      api.store.set("last", { right, accepted, forecast_right: fr, mother_lines_kept: copied.size, grooves: grooveLine });
      const E = TEXT.end;
      tiltOff();
      resultCard(wrap, art, { cards: ["map-from-12", "map-from-16"], lost: good ? 0 : Math.min(5, 1 + accepted + (fr ? 0 : 1)), caption: "The sheets to come: by noon, by dark.", reducedMotion: api.reducedMotion });
      api.end({
        outcome: good ? "win" : "done",
        text: [good ? E.winLead : E.doneLead, E.rows(right), accepted ? E.accepted(accepted) : "", fr ? E.fcRight : E.fcWrong,
          copied.size ? E.copied(copied.size) : E.noCopy, grooveLine ? E.grooves : ""].filter(Boolean).join(" "),
        next: "Night 2: nothing left to check on the ground, and another book on the table.",
      });
    }

    // ---- keys and hints ----
    const kd = (e) => {
      if (over || $(`.${P}intro`)) return;
      const k = e.key.toLowerCase();
      if (wrap.querySelector(`.${P}sp`)) return;
      if (k === "m") measure();
      else if (k === "s") stamp(sel);
      else if (k === "arrowdown") { e.preventDefault(); select(Math.min(24, sel + 1)); }
      else if (k === "arrowup") { e.preventDefault(); select(Math.max(1, sel - 1)); }
      else if (k === "h") setStatus(sel, "Here");
      else if (k === "g") setStatus(sel, "Gone");
      else if (k === "u") setStatus(sel, "Unknown");
      else if (/^[1-3]$/.test(k)) writeDetail(sel, +k - 1);
      else if (k === "f" && !e.repeat) tiltOn();
    };
    const ku = (e) => { if (e.key.toLowerCase() === "f") tiltOff(); };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const bump = () => { idle = 0; };
    wrap.addEventListener("pointerdown", bump);
    const hint = setInterval(() => {
      if (over || $(`.${P}intro`)) return;
      idle++;
      if (idle === 45) {   // the source that disagrees with the others pulses once
        const chips = [...wrap.querySelectorAll(`.${P}chip`)];
        if (MAP(sel) !== (GROUND(sel) === "here") && chips[0]) chips[0].classList.add("pulse");
      }
      if (idle === 90) {
        const next = nextUnset(sel);
        if (next) trs[next].classList.add("arrow");
      }
    }, 1000);

    for (let n = 1; n <= 24; n++) paintRow(n);
    select(CFG.from);
    const go = $(`.${P}plate>button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); select(CFG.from); say(TEXT.open[stage - 1]); });
    go.focus();

    return {
      unmount() {
        over = true;
        clearInterval(hint);
        window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      },
    };
  }
}

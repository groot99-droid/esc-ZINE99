// Missing Campsites / The Ranger's Book (1D, ledger in graphite).
//
// DESIGN.md section 11, The Ranger's Book, at rangers_book_1: one day, three rows missing (sites 2,
// 5 and 9). Rows naming a lost site are gone and the lines close up; Marisol's totals do not name
// sites, so they stay. Tap a column to sum it in pencil beside her total. For each shortfall insert
// a ghost row at a seam and fill it: persons from the persons gap, fee at $18 a night, permit from
// the skipped sequence (permits went out in arrival order), site from where the permit falls. A
// ghost row that fits locks in pencil; one that breaks a total stays loose.
//
// Actions (the refine pass), from DESIGN.md sections 11 and 12:
//   Sum      tap a column heading (or S, P, M... see the legend) to sum it in pencil.
//   Insert   + at a seam between two rows puts a blank ghost row there; fill it with − / +.
//   Tilt     hold F (or the button): under a low torch the paper shows the grooves of each lost
//            line, tally strokes you can count (its persons), words you cannot read. Unlocks after
//            the first sum.
//   Rub out  × removes a ghost row and gives the blank back to the tray.
//   Ask      Marisol, once, after the first ghost locks: she reads the permit sequence over your
//            shoulder and pencils the next skipped permit into a loose ghost row.
// The booth shuts at 18:00 (six minutes; this clock is the prototype's, DESIGN.md gives the page no
// timer). Hints by idle time: 60 s partial sums, 120 s the disagreeing total underlined, 180 s a
// ghost filled. After two losses in a row the clock runs eight minutes and hints come twice as fast.
// Lines in TEXT are written for the game (listed for approval), not quoted.
//
// Phase 1 (accepted 2026-11-15, DESIGN.md "Accepted development"): the first page. When the totals
// balance, Marisol turns to the front "to show you how a book is kept", and the front is a notebook's
// Sites page in pencil. Tam has four looks before she turns back (seven things can be looked at; five
// of them do not belong in a ranger's logbook). Three or more of the five and the page is read: the
// game's midpoint reversal, and the row 21 that is the same sentence as Tam's. Fewer, and the totals
// still balance but the page goes unread. (In the design this page belongs to The Ranger's Book 2;
// the prototype plays book 1, so it follows book 1's totals here.)
// Art (api.art): the first-page spread, unread and read; the spread of book 1 on the how-to and behind
// a loss; the drop-box envelope, the seam notch under the torch, the time units over the clock,
// Marisol's outline on Ask, chapter 3's card, and the title lettering behind the result.

import { pic, chapterCard, resultCard } from "./kit.js";

const P = "missing-campsites-rangers-book-";
const ROWS = [
  { site: 1, party: "Okafor", pers: 2, permit: 401 }, { site: 3, party: "Lund", pers: 4, permit: 403 },
  { site: 4, party: "Diaz", pers: 3, permit: 404 }, { site: 6, party: "Moss", pers: 2, permit: 406 },
  { site: 7, party: "Pryce", pers: 5, permit: 407 }, { site: 8, party: "Hale", pers: 1, permit: 408 },
  { site: 10, party: "Kerr", pers: 2, permit: 410 }, { site: 11, party: "Abe", pers: 4, permit: 411 },
  { site: 12, party: "Wren", pers: 3, permit: 412 },
];
const LOST = { 2: 3, 5: 4, 9: 2 };          // site -> persons, felt only as grooves
const TOTALS = { sites: 12, persons: 35, fees: 216, envelopes: 12 };
const FEE = 18, GHOSTS = 3;

const TEXT = {
  when: "Day 2 · the booth · 17:00",
  goal: "Make Marisol's totals balance before the booth shuts at 18:00.",
  rule: "Names of lost sites have gone from her book and the lines have closed up. Her totals have not. Permits went out in arrival order, one per site.",
  gentle: "A gentler evening: the booth stays open till 18:00 on a slower clock, and Marisol's hints come sooner.",
  open: "Marisol slides the logbook across the counter. \"Yesterday's. It's never been wrong before.\"",
  firstSum: "The pencil sum sits beside her ink, and they disagree.",
  tilt: "Your torch is on the counter. Hold F to tilt the page under it: lost lines leave grooves.",
  tilted: "Under the low light, strokes where no line is: a tally you can count, words you can't read.",
  locked: "The ghost row locks. Your pencil holds where her ink has gone.",
  ask: "Marisol is reading over your shoulder now. \"Ask me if you're stuck.\" (A: ask, once.)",
  asked: (n) => `Marisol: "Permit ${n}. That would be… I don't remember it. I must have issued it."`,
  half: "17:30. The light over the counter comes on by itself.",
  noBlank: "No blank rows left in the tray. Rub one out first.",
  hint180: "Marisol, over your shoulder: \"Permit 402. That would be… two?\"",
  partial: "Partial sums, in the margin.",
  fp: {
    turn: "Marisol: \"Let me show you how a book is kept.\" She turns to the front. The front is not a ledger.",
    task: "Four looks before she turns back. What on this page does not belong in a ranger's logbook?",
    keep: "Marisol, not looking at it: \"I've never been able to throw that page out.\"",
    left: (n) => (n ? `${n} look${n > 1 ? "s" : ""} left` : "She turns back to today"),
    read: " Then Marisol turned to the front to show you how a book is kept, and the front is in pencil: a party of five at 20 to 24, no check-out, and a row 21 that is the same sentence as yours, and older. \"I've never been able to throw that page out.\" The question was what is taking this place. Now it is what keeping a record made of her.",
    unread: " Then Marisol turned to the front to show you how a book is kept, and turned back before you had seen enough of it. Pencil, where there should be ink; nothing you could write down.",
  },
  end: {
    win: (lines) => `Every total balances. Three parties stayed at sites nobody remembers: ${lines}. The world rewrote its own records, and missed the sums. Three lines in your notebook, and Marisol has stopped smiling.`,
    lose: (n) => `18:00. Marisol closes the book gently and takes it home. ${n ? `${n} ghost row${n > 1 ? "s" : ""} locked in your pencil; the rest did not.` : "Nothing locked."} The totals still don't add up, and nobody but you minds.`,
  },
};

// The first page: where each thing is on the spread (left, top, width, height, in % of the art), what
// Tam sees, and the line it writes. `odd` marks the five that do not belong in a logbook.
const LOOKS = [
  { k: "heading", label: "the heading", box: [8.5, 7, 10, 7.5], odd: true, see: "\"Sites.\" Not ink. Pencil, in a younger hand than the one that keeps this book.", line: "The front is in pencil." },
  { k: "row21", label: "row 21", box: [5, 23.5, 36, 8], odd: true, see: "21, the split boulder, slept in the crack. You open your own Sites page at row 21.", line: "Her row 21 and my row 21 are the same sentence. Hers is older. Check." },
  { k: "party", label: "the party of five", box: [9.5, 55, 24, 7], odd: true, see: "A party of five, 20 to 24. Five strokes, and not your five.", line: "A party of five at 20 to 24, in pencil. Not us." },
  { k: "out", label: "the check-out", box: [9.5, 68.5, 22, 7], odd: true, see: "In: August. Out: a pencil rule with nothing written on it.", line: "No check-out." },
  { k: "teague", label: "the first ink row", box: [52, 12.5, 44, 6], odd: true, see: "Permit 0001. Sites 20–24, five persons, no nights, no fee. Party: Teague.", line: "Permit 0001 is hers. The hand that kept the book." },
  { k: "cols", label: "the ruled columns", box: [31, 7, 14, 5.5], odd: false, see: "PERS., NTS, FEE, ruled in ink over the pencil, later. That is only how a notebook gets to be a logbook.", line: "" },
  { k: "rows", label: "permits 0002, 0003", box: [52, 18.6, 44, 8.4], odd: false, see: "Sites 3 and 9, two people and four. Ordinary rows. They add up.", line: "" },
];
const FP_LOOKS = 4, FP_NEED = 3;

function tally(n) {
  let s = "";
  for (let k = 0; k < Math.min(n, 4); k++) s += `<line x1="${3 + k * 6}" y1="2" x2="${3 + k * 6}" y2="16"/>`;
  if (n >= 5) s += `<line x1="0" y1="14" x2="24" y2="4"/>`;
  for (let k = 5; k < n; k++) s += `<line x1="${30 + (k - 5) * 6}" y1="2" x2="${30 + (k - 5) * 6}" y2="16"/>`;
  return `<svg width="${n > 5 ? 52 : 28}" height="18" viewBox="0 0 ${n > 5 ? 52 : 28} 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" role="img" aria-label="${n}">${s}</svg>`;
}

const CSS = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:#2b2a27;padding:12px;box-sizing:border-box;font-family:Georgia,'Times New Roman',serif;color:#33302c}
.${P}book{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);background:#ece6d6;max-width:1180px;margin:0 auto;box-shadow:0 10px 30px #000;position:relative;
  background-image:radial-gradient(rgba(80,70,50,.06) 1px,transparent 1.3px);background-size:4px 4px}
.${P}book::after{content:"";position:absolute;top:0;bottom:0;left:57.4%;width:18px;margin-left:-9px;background:linear-gradient(90deg,transparent,rgba(0,0,0,.18),transparent);pointer-events:none}
.${P}page{padding:14px 16px 16px;min-width:0}
.${P}left{border-right:1px solid #c9bfa8;padding-left:34px;position:relative;background-image:repeating-linear-gradient(180deg,transparent 0 35px,#9fb9c4 35px 36px);background-position:0 46px;background-repeat:repeat-y}
.${P}left::before{content:"";position:absolute;left:26px;top:0;bottom:0;width:1.5px;background:#c98a80}
.${P}grid{display:grid;grid-template-columns:3.4em minmax(4em,1fr) 4.6em 3em 3.6em 5.2em;align-items:center;column-gap:6px}
.${P}hd{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.1em;color:#5a6a70;height:34px;display:flex;align-items:center;border:0;background:none;padding:0;cursor:default;text-align:left}
button.${P}hd{cursor:pointer;color:#1d4a5c;text-decoration:underline dotted 2px;text-underline-offset:4px}
button.${P}hd:hover,button.${P}hd:focus-visible{background:rgba(29,74,92,.1);outline:none}
button.${P}hd.done{text-decoration:none;color:#5a6a70}
.${P}cell{height:36px;display:flex;align-items:center;font-size:17px;white-space:nowrap;overflow:hidden}
.${P}cell.it{font-style:italic}
.${P}seam{grid-column:1/-1;height:0;position:relative}
.${P}seam button{position:absolute;left:-32px;top:-12px;width:24px;height:24px;border-radius:50%;border:1.5px dashed #5b5b5d;background:#ece6d6;color:#333;font:600 15px 'IBM Plex Mono',monospace;line-height:1;cursor:pointer;padding:0;z-index:1}
.${P}seam button:hover,.${P}seam button:focus-visible{background:#fff;border-style:solid;outline:none;box-shadow:0 0 0 3px rgba(74,74,76,.25)}
.${P}groove{position:absolute;left:44px;top:-12px;color:rgba(70,60,40,0);transition:color .2s;pointer-events:none;font:14px 'IBM Plex Mono',monospace;letter-spacing:.3em;display:flex;gap:16px;align-items:center}
.${P}tilt .${P}groove{color:rgba(60,50,30,.62)}
.${P}tilt .${P}book{background-color:#d9cfb6}
.${P}ghost{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;padding:6px 8px;margin:4px 0;font:14px 'IBM Plex Mono',monospace;color:#3d3d3f;outline:2px dashed #7a7a7c;outline-offset:-2px;background:rgba(255,255,255,.35)}
.${P}ghost.lock{outline:2px solid #3d3d3f;background:rgba(74,74,76,.08)}
.${P}ghost.lock.fresh{animation:${P}lock .7s}
@keyframes ${P}lock{0%{background:rgba(74,74,76,.35)}}
.${P}ghost .lab{font-size:12px;letter-spacing:.08em;color:#5a6a70;margin-right:2px}
.${P}ghost .tag{font-family:Caveat,cursive;font-size:20px;color:#3d3d3f}
.${P}st{display:inline-flex;align-items:center;gap:3px}
.${P}st button{font:600 15px 'IBM Plex Mono',monospace;width:30px;height:30px;border:1.5px solid #8a8a8a;background:#f6f2e6;cursor:pointer;padding:0;color:#222}
.${P}st button:hover{border-color:#222}
.${P}st span{min-width:2.4em;text-align:center;font-family:Caveat,cursive;font-size:22px;font-weight:700}
.${P}x{border:1.5px solid #9c3b30;background:none;color:#9c3b30;font:600 13px 'IBM Plex Mono',monospace;cursor:pointer;padding:4px 8px;margin-left:auto}
.${P}right h3{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#5a6a70;margin:4px 0 10px;display:flex;justify-content:space-between}
.${P}tot{display:grid;grid-template-columns:1fr auto auto auto;gap:4px 12px;align-items:baseline;padding:6px 0 10px;border-bottom:1px solid #c9bfa8}
.${P}tot span:first-child{font-size:16px}
.${P}tot .ink{font-size:25px;font-weight:700;font-style:italic;color:#22303a}
.${P}tot .pen{font-family:Caveat,'Segoe Print',cursive;font-size:28px;color:#3d3d3f;min-width:2.5em;text-align:right}
.${P}tot .gap{font-family:Caveat,cursive;font-size:24px;color:#3d3d3f;min-width:3em}
.${P}tot .gap.bad{border:1.5px solid #3d3d3f;border-radius:50%;padding:0 6px}
.${P}tot .gap.ok{color:#2f6b3a;font-weight:700}
.${P}tot.under .ink{text-decoration:underline 2px #9c3b30}
.${P}tray{margin-top:12px;font:13px 'IBM Plex Mono',monospace;color:#4a4a4c;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.${P}tray i{display:inline-block;width:56px;height:16px;border:1.5px dashed #6b6b6d}
.${P}ctl{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.${P}ctl button{font:600 14px 'IBM Plex Mono',monospace;border:1.5px solid #4a4a4c;background:#f6f2e6;padding:9px 12px;cursor:pointer;touch-action:none;color:#222}
.${P}ctl button.on{background:#3a2a14;color:#ffd9a0}
.${P}ctl button[hidden]{display:none}
.${P}ctl button:disabled{opacity:.4;cursor:default}
.${P}clock{font:600 14px 'IBM Plex Mono',monospace;color:#9c3b30;display:flex;flex-direction:column;gap:3px;margin-top:10px}
.${P}clock i{display:block;height:5px;background:#d3c8ae}.${P}clock i b{display:block;height:100%;background:#9c3b30;transition:width 1s linear}
.${P}msg{margin-top:10px;font-family:Caveat,cursive;font-size:22px;line-height:1.15;color:#2e2e30;min-height:26px;border-left:3px solid #9c3b30;padding-left:8px}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(43,42,39,.88);z-index:4;padding:16px;overflow:auto}
.${P}lcard{max-width:480px;width:100%;box-sizing:border-box;background:#ece6d6;padding:18px 22px 18px 42px;position:relative;box-shadow:0 12px 34px #000;
  background-image:repeating-linear-gradient(180deg,transparent 0 27px,#9fb9c4 27px 28px);background-position:0 12px}
.${P}lcard::before{content:"";position:absolute;left:30px;top:0;bottom:0;width:1.5px;background:#c98a80}
.${P}lcard h2{margin:0;font:italic 700 30px Georgia,serif;color:#22303a;line-height:1.1}
.${P}lcard .when{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#5a6a70;text-transform:uppercase;margin:4px 0 8px}
.${P}lcard .goal{font-size:17px;line-height:1.4;margin:0 0 6px;font-weight:700}
.${P}lcard .rule{font-size:15px;line-height:1.45;margin:0 0 10px}
.${P}lcard table{border-collapse:collapse;font-size:14px;margin:0 0 12px;width:100%}
.${P}lcard td{padding:4px 8px 4px 0;border-bottom:1px solid #b7ae98;vertical-align:top}
.${P}lcard td:first-child{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.1em;color:#1d4a5c;white-space:nowrap;padding-top:6px}
.${P}lcard .gentle{font-size:14px;color:#2f6b3a;margin:0 0 10px}
.${P}lcard button{font:600 15px 'IBM Plex Mono',monospace;background:#33302c;color:#ece6d6;border:0;padding:11px 22px;cursor:pointer}
.${P}lcard button:focus-visible{outline:3px solid #9c3b30;outline-offset:3px}
.${P}fp{position:absolute;inset:0;z-index:5;background:#2b2a27;overflow:auto;padding:12px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:8px}
.${P}fp .spx{width:100%;overflow-x:auto;flex:none}
.${P}fp .sp{position:relative;width:min(1100px,100%,calc((100vh - 370px)*1.6));min-width:min(760px,200vw);margin:0 auto;box-shadow:0 10px 30px #000}
.${P}fp .swipe{display:none;font:600 12px 'IBM Plex Mono',monospace;color:#d9cfb6;letter-spacing:.08em}
@media (max-width:780px){.${P}fp .swipe{display:block}}
.${P}fp .sp>img{display:block;width:100%;height:auto;aspect-ratio:1600/1000;background:#ece6d6}
.${P}fp .sp.noart{background:#ece6d6;aspect-ratio:1600/1000}
.${P}fp .hot{position:absolute;border:2px dashed rgba(43,93,138,.0);background:transparent;cursor:pointer;padding:0;border-radius:6px}
.${P}fp .hot:hover,.${P}fp .hot:focus-visible{border-color:#2b5d8a;background:rgba(43,93,138,.12);outline:none}
.${P}fp .hot.seen{border:2.5px solid #4a4a48;border-radius:50%/60%;background:transparent;cursor:default}
.${P}fp .hot.seen.plain{border-style:dotted;border-radius:6px;opacity:.6}
.${P}fp .hot:disabled:not(.seen){cursor:default;border-color:transparent;background:transparent}
.${P}fp .pane{width:min(1100px,100%);background:#ece6d6;padding:10px 14px;box-sizing:border-box;display:grid;gap:8px}
.${P}fp .task{font:600 14px 'IBM Plex Mono',monospace;color:#22303a;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.${P}fp .task b{color:#9c3b30}
.${P}fp .chips{display:flex;flex-wrap:wrap;gap:6px}
.${P}fp .chips button{font:600 14px 'IBM Plex Mono',monospace;border:1.5px solid #4a4a4c;background:#f6f2e6;color:#222;padding:8px 10px;min-height:40px;cursor:pointer}
.${P}fp .chips button:hover:not(:disabled),.${P}fp .chips button:focus-visible{background:#22303a;color:#ece6d6;outline:none}
.${P}fp .chips button:disabled{opacity:.45;cursor:default}
.${P}fp .chips button.seen{background:#d9cfb6;text-decoration:line-through}
.${P}fp .see{font-family:Caveat,cursive;font-size:22px;line-height:1.15;color:#2e2e30;border-left:3px solid #9c3b30;padding-left:8px;min-height:26px}
.${P}fp .nb{font-family:Caveat,cursive;font-size:21px;line-height:1.2;color:#3d3d3f;background:#f6f1e2;padding:4px 10px;border-left:3px solid #d58a7a;background-image:repeating-linear-gradient(180deg,transparent 0 24px,#a9c3cf 24px 25px)}
.${P}fp .nb:empty{display:none}
.${P}fp .nb div::before{content:"✎ ";color:#9c3b30}
.${P}fp .done{font:600 15px 'IBM Plex Mono',monospace;background:#33302c;color:#ece6d6;border:0;padding:11px 22px;cursor:pointer;justify-self:start}
.${P}fp .done[hidden]{display:none}
.${P}tu{display:block;width:150px;max-width:60%;height:auto;margin-top:10px}
.${P}env{width:44px;height:44px;vertical-align:middle;margin-left:8px}
.${P}ctl button img{width:22px;height:27px;object-fit:cover;object-position:50% 20%;vertical-align:middle;margin-right:6px;border:1px solid #4a4a4c}
.${P}groove img{width:22px;height:22px;opacity:.75}
.${P}lcard .spread{display:block;width:100%;height:auto;margin:0 0 10px;box-shadow:0 2px 8px rgba(0,0,0,.4)}
@media (max-width:860px){.${P}book{grid-template-columns:1fr}.${P}book::after{display:none}.${P}left{border-right:0;border-bottom:1px solid #c9bfa8}}
@media (max-width:480px){.${P}wrap{padding:6px}.${P}grid{grid-template-columns:2em minmax(3em,1fr) 3.3em 1.6em 2.8em 3.8em;column-gap:3px}.${P}cell{font-size:14px}.${P}hd{font-size:12px;letter-spacing:0}.${P}page{padding:10px 8px}.${P}left{padding-left:32px}.${P}left::before{left:24px}.${P}tot .ink{font-size:21px}.${P}tot .pen{font-size:24px}.${P}lcard{padding-left:36px}}
`;

export default {
  mount(root, api) {
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const CLOSE_S = gentle ? 480 : 360, HINT = gentle ? 0.5 : 1;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}book">
        <div class="${P}page ${P}left"><div class="${P}grid lg"></div></div>
        <div class="${P}page ${P}right"><h3><span>DAY TOTALS</span><span>TAM'S SUM</span></h3><div class="tots"></div>
          <div class="${P}tray"></div>
          <div class="${P}msg" aria-live="polite"></div>
          <div class="${P}ctl"><button type="button" class="tiltb" hidden>Tilt to the torch (hold F)</button><button type="button" class="askb" hidden>Ask Marisol (A)</button></div>
          <div class="${P}clock"><span class="ct">17:00 · booth shuts 18:00</span><i><b style="width:100%"></b></i></div></div>
      </div>
      <div class="${P}intro"><div class="${P}lcard"><h2>The Ranger's Book</h2><div class="when"></div>
        <p class="goal"></p><p class="rule"></p>
        <table><tr><td>SUM</td><td>tap a column heading: Pers., Fee, or Site to count rows</td></tr>
          <tr><td>INSERT</td><td>press + between two rows where a line is missing</td></tr>
          <tr><td>FILL</td><td>− / + on the ghost row's site, persons, nights and permit until it locks</td></tr>
          <tr><td>AFTER</td><td>when it balances, she shows you the front of the book: you get four looks</td></tr></table>
        <p class="gentle" hidden></p>
        <button type="button">Open the book</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when; $(".goal").textContent = TEXT.goal; $(".rule").textContent = TEXT.rule;
    if (gentle) { $(".gentle").hidden = false; $(".gentle").textContent = TEXT.gentle; }
    const grid = $(".lg"), msgEl = $(`.${P}msg`);
    const art = api.art;
    chapterCard(art, "chapter-3", $(`.${P}lcard`));
    { const tu = pic(art, "time-units", P + "tu", "Time units: four spent"); if (tu) $(`.${P}clock`).before(tu);
      const mf = pic(art, "outline-marisol", "", ""); if (mf) $(".askb").prepend(mf); }
    let ghosts = [];            // { after: index into ROWS (-1..8), site, pers, nights, permit, locked }
    const summed = new Set();
    let running = false, over = false, iv = 0, t = 0, idle = 0, partial = false, underline = false, hinted = false, asked = false;
    const said = new Set();
    const say = (s) => { msgEl.textContent = s; };
    const beat = (k, s) => { if (said.has(k)) return false; said.add(k); say(s); return true; };

    function ordered() {
      const out = [];
      for (let i = -1; i < ROWS.length; i++) {
        if (i >= 0) out.push({ kind: "row", ...ROWS[i], nights: 1, idx: i });
        ghosts.filter((g) => g.after === i).forEach((g) => out.push({ kind: "ghost", g }));
      }
      return out;
    }
    const all = () => ordered().map((r) => (r.kind === "row" ? r : { site: r.g.site, pers: r.g.pers, nights: r.g.nights, permit: r.g.permit, ghost: r.g }));
    function sums() {
      const a = all();
      return { sites: a.length, persons: a.reduce((s, r) => s + r.pers, 0), fees: a.reduce((s, r) => s + FEE * r.nights, 0), envelopes: a.length };
    }

    function fits(g) {
      const list = ordered();
      const at = list.findIndex((r) => r.kind === "ghost" && r.g === g);
      const prev = [...list.slice(0, at)].reverse().find((r) => r.kind === "row");
      const next = list.slice(at + 1).find((r) => r.kind === "row");
      const lo = prev ? prev : { site: 0, permit: 400 }, hi = next ? next : { site: 25, permit: 499 };
      if (!(g.permit > lo.permit && g.permit < hi.permit)) return false;
      if (!(g.site > lo.site && g.site < hi.site)) return false;
      if (g.site !== g.permit - 400) return false;         // permits went out site by site in arrival order
      if (ghosts.some((o) => o !== g && (o.site === g.site || o.permit === g.permit))) return false;
      const s = sums();
      return s.persons <= TOTALS.persons && s.fees <= TOTALS.fees;
    }

    function stepper(label, val, fmt, on, gi = 0) {
      const w = document.createElement("span"); w.className = P + "st";
      const l = document.createElement("span"); l.className = "lab"; l.textContent = label;
      const m = document.createElement("button"); m.type = "button"; m.textContent = "−"; m.setAttribute("aria-label", `Ghost ${gi + 1} ${label} less`);
      const v = document.createElement("span"); v.textContent = fmt(val);
      const p = document.createElement("button"); p.type = "button"; p.textContent = "+"; p.setAttribute("aria-label", `Ghost ${gi + 1} ${label} more`);
      m.addEventListener("click", () => on(-1)); p.addEventListener("click", () => on(1));
      w.append(l, m, v, p);
      return w;
    }

    function render() {
      const active = document.activeElement && wrap.contains(document.activeElement) ? document.activeElement.getAttribute("aria-label") : null;
      grid.innerHTML = "";
      const heads = [["SITE", "sites"], ["PARTY", null], ["PERS.", "persons"], ["NTS", null], ["FEE", "fees"], ["PERMIT", null]];
      heads.forEach(([h, key]) => {
        const el = document.createElement(key ? "button" : "div");
        el.className = P + "hd";
        el.textContent = h;
        if (key) { el.type = "button"; el.title = key === "sites" ? "Count the rows" : "Sum this column"; el.setAttribute("aria-label", `Sum ${h}`); el.addEventListener("click", () => sumCol(key)); if (summed.has(key)) el.classList.add("done"); }
        grid.appendChild(el);
      });
      const seam = (after) => {
        const s = document.createElement("div"); s.className = P + "seam";
        const b = document.createElement("button"); b.type = "button"; b.textContent = "+"; b.setAttribute("aria-label", `Insert a ghost row after ${after >= 0 ? "site " + ROWS[after].site : "the top"}`);
        b.title = "Insert a ghost row here";
        b.addEventListener("click", () => insert(after));
        s.appendChild(b);
        const lostHere = Object.keys(LOST).map(Number).find((site) => {
          const prev = after >= 0 ? ROWS[after].site : 0, next = after + 1 < ROWS.length ? ROWS[after + 1].site : 25;
          return site > prev && site < next;
        });
        if (lostHere && !ghosts.some((g) => g.site === lostHere && g.locked)) {
          const gv = document.createElement("span"); gv.className = P + "groove";
          gv.innerHTML = `<span>~~~~~~</span>${tally(LOST[lostHere])}<span>~~~~</span>`;
          const notch = pic(art, "seam-notch", "", ""); if (notch) gv.prepend(notch);
          s.appendChild(gv);
        }
        grid.appendChild(s);
      };
      seam(-1);
      for (const r of ordered()) {
        if (r.kind === "row") {
          [r.site, r.party, tally(r.pers), "1", "$" + FEE, "0" + r.permit].forEach((v, k) => {
            const c = document.createElement("div"); c.className = P + "cell" + (k === 1 ? " it" : "");
            if (k === 2) c.innerHTML = v; else c.textContent = v;
            grid.appendChild(c);
          });
          seam(r.idx);
        } else {
          const g = r.g;
          const was = g.locked, gi = ghosts.indexOf(g);
          g.locked = fits(g);
          const row = document.createElement("div");
          row.className = P + "ghost" + (g.locked ? " lock" : "") + (g.locked && !was ? " fresh" : "");
          const tag = document.createElement("span"); tag.className = "tag"; tag.textContent = g.locked ? "locked ✓" : "ghost row";
          row.append(tag,
            stepper("SITE", g.site, String, (d) => { g.site = Math.max(1, Math.min(24, g.site + d)); touched(); }, gi),
            stepper("PERS.", g.pers, String, (d) => { g.pers = Math.max(1, Math.min(8, g.pers + d)); touched(); }, gi),
            stepper("NTS", g.nights, String, (d) => { g.nights = Math.max(1, Math.min(3, g.nights + d)); touched(); }, gi),
            stepper("PERMIT", g.permit, (v) => "0" + v, (d) => { g.permit = Math.max(400, Math.min(413, g.permit + d)); touched(); }, gi));
          const fee = document.createElement("span"); fee.className = "lab"; fee.textContent = `fee $${FEE * g.nights}`; row.appendChild(fee);
          const x = document.createElement("button"); x.type = "button"; x.className = P + "x"; x.textContent = "× rub out"; x.setAttribute("aria-label", "Rub out this ghost row");
          x.addEventListener("click", () => { ghosts = ghosts.filter((o) => o !== g); touched(); });
          row.appendChild(x);
          grid.appendChild(row);
          if (g.locked && !was) onLock();
        }
      }
      renderTotals();
      if (active) { const el = [...wrap.querySelectorAll("[aria-label]")].find((e) => e.getAttribute("aria-label") === active); el?.focus(); }
    }

    function renderTotals() {
      const s = sums();
      const tots = $(".tots");
      tots.innerHTML = "";
      const names = { sites: "Occupied sites", persons: "Persons", fees: "Fees", envelopes: "Envelopes in the drop box" };
      for (const k of Object.keys(TOTALS)) {
        const row = document.createElement("div"); row.className = P + "tot";
        const show = summed.has(k) || partial || (k === "envelopes" && summed.has("sites"));
        const money = k === "fees" ? "$" : "";
        const gap = TOTALS[k] - s[k];
        if (underline && show && gap !== 0) row.classList.add("under");
        row.innerHTML = `<span></span><span class="ink">${money}${TOTALS[k]}</span><span class="pen">${show ? money + s[k] : ""}</span><span class="gap ${show ? (gap ? "bad" : "ok") : ""}">${show ? (gap ? "≠ " + money + gap : "= ✓") : ""}</span>`;
        row.firstChild.textContent = names[k];
        if (k === "envelopes") { const env = pic(art, "thread-guest", P + "env", ""); if (env) row.firstChild.appendChild(env); }
        tots.appendChild(row);
      }
      const left = GHOSTS - ghosts.length;
      $(`.${P}tray`).innerHTML = `GHOST ROWS ${"<i></i>".repeat(left)}${left ? "" : "(all in use)"}`;
    }

    function onLock() {
      const n = ghosts.filter((g) => g.locked).length;
      if (n === 1) {
        beat("locked", TEXT.locked);
        if (!asked) { $(".askb").hidden = false; timers.push(setTimeout(() => { if (!over) beat("ask", TEXT.ask); }, 2500)); }
      }
    }
    const timers = [];

    function sumCol(k) {
      if (!running) return;
      summed.add(k); if (k === "sites") summed.add("envelopes");
      idle = 0;
      render();
      const s = sums()[k];
      if (!beat("sum", TEXT.firstSum)) say(k === "persons" ? `Persons: ${s}. She wrote ${TOTALS.persons}.` : k === "fees" ? `Fees: $${s}. She wrote $${TOTALS.fees}.` : `${s} rows. She wrote ${TOTALS.sites} sites, and ${TOTALS.envelopes} envelopes.`);
      if ($(".tiltb").hidden) { $(".tiltb").hidden = false; timers.push(setTimeout(() => { if (!over) beat("tilt", TEXT.tilt); }, 2200)); }
    }
    function insert(after) {
      if (!running) return;
      if (ghosts.length >= GHOSTS) { say(TEXT.noBlank); return; }
      const prev = after >= 0 ? ROWS[after] : { site: 0, permit: 400 };
      ghosts.push({ after, site: prev.site + 1, pers: 1, nights: 1, permit: prev.permit, locked: false });
      idle = 0;
      touched();
    }
    function ask() {
      if (!running || asked || $(".askb").hidden) return;
      const g = ghosts.find((x) => !x.locked);
      const skipped = [402, 405, 409].find((n) => !ghosts.some((x) => x.locked && x.permit === n));
      if (!skipped) return;
      asked = true; $(".askb").disabled = true;
      if (g) g.permit = skipped;
      say(TEXT.asked("0" + skipped));
      touched();
    }
    function touched() {
      idle = 0;
      render();
      const s = sums();
      const balanced = Object.keys(TOTALS).every((k) => s[k] === TOTALS[k]);
      if (balanced && ghosts.length === GHOSTS && ghosts.every((g) => g.locked)) win();
    }
    function win() {
      if (over) return;
      over = true; running = false; clearInterval(iv);
      api.store.set("losses", 0);
      const lines = ghosts.map((g) => `site ${g.site}, ${g.pers} ${g.pers === 1 ? "person" : "people"}`).sort();
      const base = TEXT.end.win(lines.join("; "));
      say(TEXT.fp.turn);
      timers.push(setTimeout(() => firstPage(base), api.reducedMotion ? 300 : 2200));
    }

    // ---- the first page (phase 1): four looks at the front of the book ----
    let fpOpen = false;
    function firstPage(base) {
      fpOpen = true;
      const fp = document.createElement("div"); fp.className = P + "fp";
      fp.innerHTML = `<div class="spx" tabindex="0" aria-label="The front of the logbook (scrolls sideways)"><div class="sp"></div></div><div class="swipe">← drag the book sideways to read both pages →</div><div class="pane"><div class="task"><span></span><b class="left"></b></div>
        <div class="chips" role="group" aria-label="Things on the page to look at"></div>
        <div class="see" aria-live="polite"></div><div class="nb" aria-label="Your notebook"></div>
        <button type="button" class="done" hidden>Close the book</button></div>`;
      wrap.appendChild(fp);
      const sp = fp.querySelector(".sp");
      const page = pic(art, "logbook-first-page-unread", "", "The front of the logbook: a Sites page in pencil, ink columns ruled over it") || pic(art, "logbook-first-page", "", "The front of the logbook");
      if (page) sp.appendChild(page); else sp.classList.add("noart");
      fp.querySelector(".task span").textContent = TEXT.fp.task;
      const see = fp.querySelector(".see"), nb = fp.querySelector(".nb"), chips = fp.querySelector(".chips"), doneB = fp.querySelector(".done");
      see.textContent = TEXT.fp.turn;
      let looks = FP_LOOKS, odd = 0;
      const seen = new Set(), btns = {};
      const left = () => { fp.querySelector(".left").textContent = TEXT.fp.left(looks); };
      function close() {
        if (!fpOpen) return;
        fpOpen = false;
        const read = odd >= FP_NEED;
        api.store.set("last", { first_page_seen: read, looks: [...seen] });
        fp.remove();
        resultCard(wrap, art, { cards: [read ? "logbook-first-page" : "logbook-1"], lost: read ? 0 : 1, reducedMotion: api.reducedMotion });
        api.end({ outcome: "win", text: base + (read ? TEXT.fp.read : TEXT.fp.unread) });
      }
      function look(L) {
        if (!fpOpen || looks <= 0 || seen.has(L.k)) return;
        looks--; seen.add(L.k); if (L.odd) odd++;
        see.textContent = L.see;
        if (L.line) { const d = document.createElement("div"); d.textContent = L.line; nb.appendChild(d); }
        btns[L.k].forEach((b) => { b.classList.add("seen"); if (!L.odd) b.classList.add("plain"); b.disabled = true; });
        left();
        if (looks <= 0) {
          Object.values(btns).flat().forEach((b) => { b.disabled = true; });
          if (odd >= FP_NEED && page && art.has("logbook-first-page")) page.src = art.url("logbook-first-page");   // Tam's ring and lines are on it now
          timers.push(setTimeout(() => { if (!fpOpen) return; see.textContent = TEXT.fp.keep; doneB.hidden = false; doneB.focus(); }, api.reducedMotion ? 200 : 1800));
        }
      }
      LOOKS.forEach((L) => {
        const hot = document.createElement("button"); hot.type = "button"; hot.className = "hot"; hot.tabIndex = -1;
        hot.setAttribute("aria-hidden", "true");
        [hot.style.left, hot.style.top, hot.style.width, hot.style.height] = L.box.map((v) => v + "%");
        const chip = document.createElement("button"); chip.type = "button"; chip.textContent = L.label;
        btns[L.k] = [hot, chip];
        for (const b of btns[L.k]) b.addEventListener("click", () => look(L));
        if (page) sp.appendChild(hot);
        chips.appendChild(chip);
      });
      doneB.addEventListener("click", close);
      left();
      chips.querySelector("button").focus();
    }

    // tilt to the torch: hold F or the button
    const tiltOn = () => { if (!running || $(".tiltb").hidden) return; wrap.classList.add(P + "tilt"); $(".tiltb").classList.add("on"); beat("tilted", TEXT.tilted); };
    const tiltOff = () => { wrap.classList.remove(P + "tilt"); $(".tiltb").classList.remove("on"); };
    const tb = $(".tiltb");
    tb.addEventListener("pointerdown", (e) => { e.preventDefault(); tiltOn(); });
    for (const ev of ["pointerup", "pointerleave", "pointercancel"]) tb.addEventListener(ev, tiltOff);
    $(".askb").addEventListener("click", ask);
    const kd = (e) => {
      const k = e.key.toLowerCase();
      if (k === "f" && !e.repeat) tiltOn();
      else if (k === "a" && !e.repeat) ask();
    };
    const ku = (e) => { if (e.key.toLowerCase() === "f") tiltOff(); };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const bump = () => { idle = 0; };
    wrap.addEventListener("pointerdown", bump);

    function tick() {
      if (!running) return;
      t++; idle++;
      const left = CLOSE_S - t;
      const mins = Math.floor(t / CLOSE_S * 60);
      $(".ct").textContent = `17:${String(Math.min(59, mins)).padStart(2, "0")} · booth shuts 18:00`;
      $(`.${P}clock b`).style.width = Math.max(0, left / CLOSE_S * 100) + "%";
      if (mins >= 30) beat("half", TEXT.half);
      if (idle === Math.round(60 * HINT) && !partial) { partial = true; renderTotals(); say(TEXT.partial); }
      if (idle === Math.round(120 * HINT) && !underline) { underline = true; renderTotals(); }
      if (idle === Math.round(180 * HINT) && !hinted) {
        hinted = true;
        const after = ROWS.findIndex((r) => r.site === 1);
        const free = ghosts.find((g) => !g.locked) || (ghosts.length < GHOSTS ? (ghosts.push({ after, site: 2, pers: 1, nights: 1, permit: 402 }), ghosts[ghosts.length - 1]) : null);
        if (free) { Object.assign(free, { after, site: 2, permit: 402, pers: 3, nights: 1 }); say(TEXT.hint180); touched(); }
      }
      if (left <= 0) {
        over = true; running = false; clearInterval(iv);
        api.store.set("losses", losses + 1);
        const nl = ghosts.filter((g) => g.locked).length;
        resultCard(wrap, art, { cards: ["logbook-1"], lost: 5 - nl, reducedMotion: api.reducedMotion });
        api.end({ outcome: "lose", text: TEXT.end.lose(nl) });
      }
    }

    render();
    const go = $(`.${P}lcard button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); running = true; say(TEXT.open); iv = setInterval(tick, 1000); grid.querySelector("button")?.focus(); });
    go.focus();

    return {
      unmount() {
        over = true; running = false; fpOpen = false; clearInterval(iv);
        timers.forEach(clearTimeout);
        window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      },
    };
  },
};

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

//
// Phase 2 (2026-11-16): the ladder. Three books:
//   1 Teach  rangers_book_1: one day, persons and permit order, three ghost rows.
//   2 Test   rangers_book_2: two days and a refund line that confuses the fee sum, plus the envelope
//            stubs: each drop-box envelope carries a permit number, its nights and a licence plate, and
//            numbers hold. A stub with no row is a ghost's; tapping it pencils its permit and nights
//            into a loose ghost row. Link (stubs to cars, 1D to 3D): a locked ghost row's plate is
//            written down (api.shared "ghost_plates"); the 3D scene at the booth reads it.
//   3 Twist  the first page (phase 1's four looks; the set-piece is its first ink row, whose permit
//            holder is the hand that kept the book), and then book 3, read from the other side: no
//            names, no sites, only counts in arrival order, and the counts are trees. Match each row to
//            the glyph that slept that many (api.shared "pattern_key", "first_page_read").
// The collection thread: on book 3's page lies an envelope stamped HOLD (art "thread-guest").

import { pic, chapterCard, resultCard, ladder, stageTabs } from "./kit.js";

const NAMES = ["One day", "Two days and a refund", "The first page"];

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
const FEE = 18;
// Book 2, the second day's page: permits 0420 to 0427 for sites 12 to 19; 13 and 14 have closed up.
const ROWS2 = [
  { site: 12, party: "Wren", pers: 3, permit: 420, nights: 2 }, { site: 15, party: "Brandt", pers: 2, permit: 423, nights: 1 },
  { site: 16, party: "Osei", pers: 2, permit: 424, nights: 2 }, { site: 17, party: "Ashby", pers: 3, permit: 425, nights: 2 },
  { site: 18, party: "Quill", pers: 3, permit: 426, nights: 1 }, { site: 19, party: "Varo", pers: 2, permit: 427, nights: 1 },
];
const STUBS = [[420, "4RT 118", 2], [421, "7KD 204", 1], [422, "2HN 880", 2], [423, "9BX 031", 1], [424, "5LW 662", 2], [425, "3CA 417", 2], [426, "8MP 905", 1], [427, "6JE 250", 1]];
const STAGE = {
  1: { rows: ROWS, lost: LOST, nights: {}, totals: TOTALS, base: 400, refund: 0, close: 300 },
  2: { rows: ROWS2, lost: { 13: 4, 14: 1 }, nights: { 13: 1, 14: 2 }, totals: { sites: 8, persons: 20, fees: 198, envelopes: 8 }, base: 408, refund: 18, close: 300 },
  3: { rows: ROWS, lost: {}, nights: {}, totals: TOTALS, base: 400, refund: 0, close: 1e9 },
};
// Book 3: persons per row, in arrival order; and the trees that slept that many.
const BOOK3 = [3, 4, 2, 5, 1];

const TEXT = {
  when: ["Day 2 · the booth · noon", "Day 2 · the booth · 17:00", "Day 2 · the booth · she turns to the front"],
  goal: ["Make Marisol's totals balance before the booth shuts.", "Two days of totals, a refund, and a strip of envelope stubs. Make it balance before 18:00.", "Four looks at the front of the book. Then the back of it, where only counts are left."],
  rule: ["Names of lost sites have gone from her book and the lines have closed up. Her totals have not. Permits went out in arrival order, one per site.", "A refund is a row that takes money out. Every drop-box envelope has a stub: permit, nights paid, a licence plate. Names go. Numbers hold.", "So far you have put rows back from totals. The last pages work the other way: the rows are still there, and what they count is standing somewhere in trees."],
  stub: (pl, n) => `Stub ${n}: plate ${pl}. No row in the book for this envelope. Somebody put money in the box.`,
  stubRow: (n) => `Stub ${n} has its row. They agree.`,
  stubFill: (pl, n) => `You pencil stub ${n} into the ghost row: its permit, its nights. Plate ${pl}.`,
  plate: (pl) => `Notebook: "Plate ${pl}. No name, no site. A number plate is bolted to something."`,
  refund: "Quill left a night early; she gave the eighteen dollars back. The fee total already has that taken out.",
  b3: {
    turn: "She turns to the back. The last pages have no names and no sites: a count of persons on every row, in the order they arrived.",
    task: "Each row is a site that stands somewhere in trees. Pick a row, then the glyph that slept that many.",
    ok: (n) => `${n} ${n === 1 ? "stroke" : "strokes"}, ${n} ${n === 1 ? "tree" : "trees"} in the pad. It sits.`,
    no: (a, b) => `${a} ${a === 1 ? "stroke" : "strokes"} on the row, ${b} in the pad. The count does not sit.`,
    pick: "Pick a row first.",
    done: " At the back of the book only the counts were left, and you set each one against the trees that slept that many. The book is a key now, for a place you have not walked yet.",
    shut: "Marisol's hand comes down flat on the page. \"That's enough guessing in my book.\"",
    lose: "Three counts set against the wrong trees, and Marisol has closed the book. Whatever the back pages are for, you could not read them.",
    hold: "An envelope, stamped HOLD, with nothing written where the plate goes. Not one of this drop box's. You leave it where it lies.",
  },
  gentle: "A gentler evening: the booth stays open till 18:00 on a slower clock, and Marisol's hints come sooner.",
  open: ["Marisol slides the logbook across the counter. \"Yesterday's. It's never been wrong before.\"", "Marisol turns the page for you. \"Today's. And the drop box, I haven't banked it.\" She tips the envelope stubs onto the counter.", ""],
  firstSum: "The pencil sum sits beside her ink, and they disagree.",
  tilt: "Your torch is on the counter. Hold F to tilt the page under it: lost lines leave grooves.",
  tilted: "Under the low light, strokes where no line is: a tally you can count, words you can't read.",
  locked: "The ghost row locks. Your pencil holds where her ink has gone.",
  ask: "Marisol is reading over your shoulder now. \"Ask me if you're stuck.\" (A: ask, once.)",
  asked: (n) => `Marisol: "Permit ${n}. That would be… I don't remember it. I must have issued it."`,
  half: "17:30. The light over the counter comes on by itself.",
  noBlank: "No blank rows left in the tray. Rub one out first.",
  hint180: (n, s) => `Marisol, over your shoulder: "Permit 0${n}. That would be… ${s}?"`,
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
    win2: (lines, plates) => `Two days balance, refund and all. Two parties paid for sites nobody remembers: ${lines}. Their names are gone from the book. Their envelopes are not: plates ${plates}, in your notebook. Marisol reads them over your shoulder and says nothing for a while.`,
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
.${P}stubs{margin-top:10px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}
.${P}stubs button{font:600 12px/1.25 'IBM Plex Mono',monospace;background:#d9be8a;color:#33302c;border:1.5px solid #a88f5e;padding:5px 3px;cursor:pointer;min-height:54px;text-align:center}
.${P}stubs button:hover,.${P}stubs button:focus-visible{background:#ecd6a6;outline:2px solid #33302c}
.${P}stubs button.ghost{box-shadow:inset 0 0 0 2px #9c3b30}
.${P}stubs button.used{opacity:.55}
.${P}stubs b{display:block;font-size:13px}
.${P}refund{grid-column:1/-1;font:italic 15px Georgia,serif;color:#9c3b30;height:36px;display:flex;align-items:center;gap:10px;cursor:help}
.${P}b3{position:absolute;inset:0;z-index:5;background:#2b2a27;overflow:auto;padding:12px;box-sizing:border-box}
.${P}b3 .pg{max-width:900px;margin:0 auto;background:#ece6d6;padding:14px 16px 18px 40px;position:relative;box-shadow:0 10px 30px #000;background-image:repeating-linear-gradient(180deg,transparent 0 35px,#9fb9c4 35px 36px)}
.${P}b3 .pg::before{content:"";position:absolute;left:30px;top:0;bottom:0;width:1.5px;background:#c98a80}
.${P}b3 h3{margin:0 0 4px;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#5a6a70}
.${P}b3 .see{font-family:Caveat,cursive;font-size:22px;line-height:1.15;color:#2e2e30;border-left:3px solid #9c3b30;padding-left:8px;min-height:52px;margin:6px 0 10px}
.${P}b3 .cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:14px;align-items:start}
.${P}b3 .rws{display:grid;gap:6px}
.${P}b3 .rw{display:flex;align-items:center;gap:8px;font:600 14px 'IBM Plex Mono',monospace;background:rgba(255,255,255,.4);border:1.5px solid #8a8a8a;padding:6px 8px;min-height:44px;cursor:pointer;color:#33302c;text-align:left}
.${P}b3 .rw.sel{border-color:#9c3b30;box-shadow:inset 4px 0 #9c3b30;background:#fff}
.${P}b3 .rw.done{border-style:solid;border-color:#33302c;cursor:default;background:rgba(74,74,76,.1)}
.${P}b3 .rw svg.mini{width:34px;height:34px;margin-left:auto}
.${P}b3 .gls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.${P}b3 .gl{background:#f4f3ef;border:1.5px solid #8a8a8a;padding:0;cursor:pointer;aspect-ratio:1;min-width:0}
.${P}b3 .gl:hover:not(:disabled),.${P}b3 .gl:focus-visible{border-color:#111;outline:3px solid rgba(46,106,92,.4)}
.${P}b3 .gl:disabled{opacity:.3;cursor:default}
.${P}b3 .gl svg{width:100%;height:100%;display:block}
.${P}b3 .env{display:block;width:104px;height:104px;padding:0;border:0;background:none;cursor:pointer;margin:14px 0 0 auto;transform:rotate(4deg)}
.${P}b3 .env img{width:100%;height:100%;display:block}
.${P}b3 .env:focus-visible{outline:2px solid #33302c;outline-offset:2px}
.${P}b3 .slips{font:600 13px 'IBM Plex Mono',monospace;color:#9c3b30;margin-top:8px}
@media (max-width:560px){.${P}b3 .cols{grid-template-columns:1fr}.${P}b3 .gls{grid-template-columns:repeat(3,minmax(0,1fr))}.${P}stubs{grid-template-columns:repeat(4,minmax(0,1fr))}.${P}stubs button{font-size:12px}}
.${P}tu{display:block;width:150px;max-width:60%;height:auto;margin-top:10px}
.${P}env{width:44px;height:44px;vertical-align:middle;margin-left:8px}
.${P}ctl button img{width:22px;height:27px;object-fit:cover;object-position:50% 20%;vertical-align:middle;margin-right:6px;border:1px solid #4a4a4c}
.${P}groove img{width:22px;height:22px;opacity:.75}
.${P}lcard .spread{display:block;width:100%;height:auto;margin:0 0 10px;box-shadow:0 2px 8px rgba(0,0,0,.4)}
@media (max-width:860px){.${P}book{grid-template-columns:1fr}.${P}book::after{display:none}.${P}left{border-right:0;border-bottom:1px solid #c9bfa8}}
@media (max-width:480px){.${P}wrap{padding:6px}.${P}grid{grid-template-columns:2em minmax(3em,1fr) 3.3em 1.6em 2.8em 3.8em;column-gap:3px}.${P}cell{font-size:14px}.${P}hd{font-size:12px;letter-spacing:0}.${P}page{padding:10px 8px}.${P}left{padding-left:32px}.${P}left::before{left:24px}.${P}tot .ink{font-size:21px}.${P}tot .pen{font-size:24px}.${P}lcard{padding-left:36px}}
`;

export default { mount(root, api) { return ladder(root, api, mountStage, NAMES); } };

function mountStage(root, api, stage) {
  {
    const CFG = STAGE[stage], ROWS = CFG.rows, LOST = CFG.lost, TOTALS = CFG.totals, BASE = CFG.base, GHOSTS = Object.keys(LOST).length;
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const CLOSE_S = CFG.close + (gentle ? 120 : 0), HINT = gentle ? 0.5 : 1;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}book">
        <div class="${P}page ${P}left"><div class="${P}grid lg"></div></div>
        <div class="${P}page ${P}right"><h3><span>DAY TOTALS</span><span>TAM'S SUM</span></h3><div class="tots"></div>
          <div class="${P}tray"></div>${stage === 2 ? `<div class="${P}stubs" role="group" aria-label="Drop-box envelope stubs"></div>` : ""}
          <div class="${P}msg" aria-live="polite"></div>
          <div class="${P}ctl"><button type="button" class="tiltb" hidden>Tilt to the torch (hold F)</button><button type="button" class="askb" hidden>Ask Marisol (A)</button></div>
          <div class="${P}clock"><span class="ct">17:00 · booth shuts 18:00</span><i><b style="width:100%"></b></i></div></div>
      </div>
      <div class="${P}intro"><div class="${P}lcard"><h2>The Ranger's Book</h2><div class="when"></div>
        <p class="goal"></p><p class="rule"></p>
        <table><tr><td>SUM</td><td>tap a column heading: Pers., Fee, or Site to count rows</td></tr>
          <tr><td>INSERT</td><td>press + between two rows where a line is missing</td></tr>
          <tr><td>FILL</td><td>− / + on the ghost row's site, persons, nights and permit until it locks</td></tr>
          ${stage === 2 ? "<tr><td>STUBS</td><td>tap an envelope stub: one with no row is a ghost's, and fills a loose ghost row</td></tr>" : ""}</table>
        <p class="gentle" hidden></p>
        <button type="button">Open the book</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when[stage - 1]; $(".goal").textContent = TEXT.goal[stage - 1]; $(".rule").textContent = TEXT.rule[stage - 1];
    stageTabs(api, $(`.${P}lcard>button`));
    if (stage === 3) { $(`.${P}lcard table`).remove(); $(`.${P}lcard>button`).textContent = "Look at the front"; }
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
        if (i >= 0) out.push({ kind: "row", ...ROWS[i], nights: ROWS[i].nights || 1, idx: i });
        ghosts.filter((g) => g.after === i).forEach((g) => out.push({ kind: "ghost", g }));
      }
      return out;
    }
    const all = () => ordered().map((r) => (r.kind === "row" ? r : { site: r.g.site, pers: r.g.pers, nights: r.g.nights, permit: r.g.permit, ghost: r.g }));
    function sums() {
      const a = all();
      return { sites: a.length, persons: a.reduce((s, r) => s + r.pers, 0), fees: a.reduce((s, r) => s + FEE * r.nights, 0) - CFG.refund, envelopes: a.length };
    }

    function fits(g) {
      const list = ordered();
      const at = list.findIndex((r) => r.kind === "ghost" && r.g === g);
      const prev = [...list.slice(0, at)].reverse().find((r) => r.kind === "row");
      const next = list.slice(at + 1).find((r) => r.kind === "row");
      const lo = prev ? prev : { site: 0, permit: BASE }, hi = next ? next : { site: 25, permit: 499 };
      if (!(g.permit > lo.permit && g.permit < hi.permit)) return false;
      if (!(g.site > lo.site && g.site < hi.site)) return false;
      if (g.site !== g.permit - BASE) return false;         // permits went out site by site in arrival order
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
          [r.site, r.party, tally(r.pers), String(r.nights), "$" + FEE * r.nights, "0" + r.permit].forEach((v, k) => {
            const c = document.createElement("div"); c.className = P + "cell" + (k === 1 ? " it" : "");
            if (k === 2) c.innerHTML = v; else c.textContent = v;
            grid.appendChild(c);
          });
          if (CFG.refund && r.site === 18) {
            const rf = document.createElement("div"); rf.className = P + "refund"; rf.tabIndex = 0;
            rf.textContent = `refund · site 18 left a night early · −$${CFG.refund}`; rf.title = TEXT.refund;
            rf.addEventListener("click", () => say(TEXT.refund));
            grid.appendChild(rf);
          }
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
            stepper("PERMIT", g.permit, (v) => "0" + v, (d) => { g.permit = Math.max(BASE, Math.min(BASE + 20, g.permit + d)); touched(); }, gi));
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
        tots.appendChild(row);
      }
      const left = GHOSTS - ghosts.length;
      $(`.${P}tray`).innerHTML = `GHOST ROWS ${"<i></i>".repeat(left)}${left ? "" : "(all in use)"}`;
    }

    // ---- envelope stubs (stage 2): permit, nights, a licence plate. Numbers hold. ----
    const plates = new Set();
    function paintStubs() {
      const box = $(`.${P}stubs`); if (!box) return;
      box.innerHTML = "";
      STUBS.forEach(([permit, plate, nights]) => {
        const hasRow = ROWS.some((r) => r.permit === permit), locked = ghosts.some((g) => g.locked && g.permit === permit);
        const b = document.createElement("button"); b.type = "button";
        b.className = (hasRow ? "" : "ghost") + (locked ? " used" : "");
        b.innerHTML = `<b>0${permit}</b>${plate}<br>${nights} nt · $${FEE * nights}`;
        b.setAttribute("aria-label", `Envelope stub, permit 0${permit}, plate ${plate}, ${nights} ${nights === 1 ? "night" : "nights"}${hasRow ? "" : ", no row in the book"}`);
        b.addEventListener("click", () => {
          if (!running) return;
          idle = 0;
          if (hasRow) { say(TEXT.stubRow("0" + permit)); return; }
          const g = ghosts.find((x) => !x.locked);
          if (!g || locked) { say(TEXT.stub(plate, "0" + permit)); return; }
          g.permit = permit; g.nights = nights; say(TEXT.stubFill(plate, "0" + permit)); touched();
        });
        box.appendChild(b);
      });
    }
    function onLock() {
      if (stage === 2) {
        const got = ghosts.filter((g) => g.locked).map((g) => (STUBS.find((s) => s[0] === g.permit) || [])[1]).filter(Boolean);
        const fresh = got.find((pl) => !plates.has(pl));
        got.forEach((pl) => plates.add(pl));
        if (api.shared) api.shared.set("ghost_plates", [...plates]);      // stubs to cars: the booth lot reads this
        if (fresh) timers.push(setTimeout(() => { if (!over) say(TEXT.plate(fresh)); }, 1500));
      }
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
      const prev = after >= 0 ? ROWS[after] : { site: 0, permit: BASE };
      ghosts.push({ after, site: prev.site + 1, pers: 1, nights: 1, permit: prev.permit, locked: false });
      idle = 0;
      touched();
    }
    function ask() {
      if (!running || asked || $(".askb").hidden) return;
      const g = ghosts.find((x) => !x.locked);
      const skipped = Object.keys(LOST).map((s) => +s + BASE).find((n) => !ghosts.some((x) => x.locked && x.permit === n));
      if (!skipped) return;
      asked = true; $(".askb").disabled = true;
      if (g) g.permit = skipped;
      say(TEXT.asked("0" + skipped));
      touched();
    }
    function touched() {
      idle = 0;
      render(); paintStubs();
      const s = sums();
      const balanced = Object.keys(TOTALS).every((k) => s[k] === TOTALS[k]);
      if (balanced && ghosts.length === GHOSTS && ghosts.every((g) => g.locked)) win();
    }
    function win() {
      if (over) return;
      over = true; running = false; clearInterval(iv);
      api.store.set("losses", 0);
      const lines = ghosts.map((g) => `site ${g.site}, ${g.pers} ${g.pers === 1 ? "person" : "people"}`).sort();
      const base = stage === 2 ? TEXT.end.win2(lines.join("; "), [...plates].join(" and ")) : TEXT.end.win(lines.join("; "));
      if (api.shared && stage === 2) api.shared.set("ranger_doubts", true);
      resultCard(wrap, art, { cards: [stage === 2 ? "logbook-2" : "logbook-1"], lost: 0, reducedMotion: api.reducedMotion });
      api.end({ outcome: "win", text: base, next: stage === 1 ? "Two days, a refund, and the envelope stubs." : "She wants to show you how a book is kept." });
    }

    // ---- book 3 (stage 3, after the first page): only counts are left, and the counts are trees ----
    function book3(base, read) {
      const NS = "http://www.w3.org/2000/svg";
      const b3 = document.createElement("div"); b3.className = P + "b3";
      b3.innerHTML = `<div class="pg"><h3>THE LAST PAGES · PERSONS, IN ARRIVAL ORDER</h3><div class="see" aria-live="polite"></div>
        <div class="cols"><div><div class="rws" role="group" aria-label="Rows of the book"></div><div class="slips"></div></div>
        <div><div class="gls" role="group" aria-label="Glyphs of trees"></div><button type="button" class="env" aria-label="An envelope on the page"></button></div></div></div>`;
      wrap.appendChild(b3);
      const see = b3.querySelector(".see"), rws = b3.querySelector(".rws"), gls = b3.querySelector(".gls"), envB = b3.querySelector(".env");
      see.textContent = `${TEXT.b3.turn} ${TEXT.b3.task}`;
      const env = pic(art, "thread-guest", "", ""); if (env) envB.appendChild(env); else envB.remove();
      envB.addEventListener("click", () => { api.thread.found(); see.textContent = TEXT.b3.hold; });   // the collection thread: quiet, and it stays
      const mkS = (tag, a, parent) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };
      function glyphSvg(n, small) {                        // the pattern walk's grammar: post, table, ring, pad; a dark tree for each sleeper
        const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 120 120"); s.setAttribute("aria-hidden", "true"); if (small) s.setAttribute("class", "mini");
        [9, 6, 3].forEach((r, i) => mkS("circle", { cx: 24, cy: 26, r, fill: "none", stroke: i === 1 ? "#111" : "#2e6a5c", "stroke-width": 2 }, s));
        [[58, 14], [78, 14], [58, 28], [78, 28]].forEach(([x, y]) => { mkS("circle", { cx: x, cy: y, r: 4, fill: "none", stroke: "#2e6a5c", "stroke-width": 1.6 }, s); mkS("circle", { cx: x, cy: y, r: 1.4, fill: "#0f3a33" }, s); });
        for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283; mkS("circle", { cx: 88 + Math.cos(a) * 15, cy: 76 + Math.sin(a) * 15, r: 3, fill: "none", stroke: "#2e6a5c", "stroke-width": 1.5 }, s); }
        for (let k = 0; k < 6; k++) for (const [a, b] of [[k, 0], [k, 5], [0, k], [5, k]]) mkS("circle", { cx: 14 + a * 9, cy: 56 + b * 9, r: 2, fill: "none", stroke: "#2e6a5c", "stroke-width": 1.2 }, s);
        [[26, 68], [44, 86], [44, 68], [26, 86], [35, 77]].slice(0, n).forEach(([x, y]) => mkS("circle", { cx: x, cy: y, r: 4.6, fill: "#111" }, s));
        return s;
      }
      let sel = -1, slips = 0, left = BOOK3.length, shut = false;
      const rowB = BOOK3.map((n, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "rw";
        b.innerHTML = `<span>${i + 1}.</span>${tally(n)}<span>${n === 1 ? "person" : "persons"}</span>`;
        b.setAttribute("aria-label", `Row ${i + 1}: ${n} ${n === 1 ? "person" : "persons"}`);
        b.addEventListener("click", () => { if (shut || b.classList.contains("done")) return; sel = i; rowB.forEach((x, k) => x.classList.toggle("sel", k === i)); });
        rws.appendChild(b); return b;
      });
      const order = BOOK3.map((n, i) => [n, (i * 3 + 2) % BOOK3.length]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
      order.forEach((n) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "gl";
        b.setAttribute("aria-label", `A glyph: post, table, fire ring, and a tent pad with ${n} ${n === 1 ? "sleeper" : "sleepers"}`);
        b.appendChild(glyphSvg(n));
        b.addEventListener("click", () => {
          if (shut || b.disabled) return;
          if (sel < 0) { see.textContent = TEXT.b3.pick; return; }
          if (BOOK3[sel] === n) {
            b.disabled = true; rowB[sel].classList.add("done"); rowB[sel].classList.remove("sel"); rowB[sel].appendChild(glyphSvg(n, true));
            see.textContent = TEXT.b3.ok(n); sel = -1; left--;
            if (!left) finish(true);
          } else {
            slips++; see.textContent = TEXT.b3.no(BOOK3[sel], n);
            b3.querySelector(".slips").textContent = `counts set wrong: ${slips} of 3`;
            if (slips >= 3) finish(false);
          }
        });
        gls.appendChild(b);
      });
      function finish(ok) {
        shut = true;
        if (ok && api.shared) api.shared.set("pattern_key", true);
        api.store.set("losses", ok ? 0 : losses + 1);
        if (!ok) see.textContent = TEXT.b3.shut;
        timers.push(setTimeout(() => {
          b3.remove();
          resultCard(wrap, art, { cards: [ok ? (read ? "logbook-first-page" : "logbook-3") : "logbook-3"], lost: ok ? (read ? 0 : 1) : 4, reducedMotion: api.reducedMotion });
          api.end({ outcome: ok ? "win" : "lose", text: ok ? base + TEXT.b3.done : TEXT.b3.lose });
        }, api.reducedMotion ? 200 : 1400));
      }
      rowB[0].focus();
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
        if (read && api.shared) api.shared.set("first_page_read", true);
        fp.remove();
        book3(base + (read ? TEXT.fp.read : TEXT.fp.unread), read);
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
        const ls = +Object.keys(LOST).find((s) => !ghosts.some((g) => g.locked && g.site === +s));
        if (free && ls) { Object.assign(free, { after: ROWS.reduce((a, r, i) => (r.site < ls ? i : a), -1), site: ls, permit: ls + BASE, pers: LOST[ls], nights: CFG.nights[ls] || 1 }); say(TEXT.hint180(ls + BASE, LOST[ls])); touched(); }
      }
      if (left <= 0) {
        over = true; running = false; clearInterval(iv);
        api.store.set("losses", losses + 1);
        const nl = ghosts.filter((g) => g.locked).length;
        resultCard(wrap, art, { cards: ["logbook-1"], lost: 5 - nl, reducedMotion: api.reducedMotion });
        api.end({ outcome: "lose", text: TEXT.end.lose(nl) });
      }
    }

    render(); paintStubs();
    const go = $(`.${P}lcard>button`);
    go.addEventListener("click", () => {
      $(`.${P}intro`).remove();
      if (stage === 3) { firstPage("The totals balance; Marisol has stopped smiling."); return; }
      running = true; say(TEXT.open[stage - 1]); iv = setInterval(tick, 1000); grid.querySelector("button")?.focus();
    });
    go.focus();

    return {
      unmount() {
        over = true; running = false; fpOpen = false; clearInterval(iv);
        timers.forEach(clearTimeout);
        window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      },
    };
  }
}

// The Lord of the Sea: The Charter (1D, engrossed deed with wax seal).
// `g-charter-tidewater` from DESIGN.md section 11: the Tidewater harbour book, three pages, nine
// clauses, one decoy. Find: follow the references (a red thread joins them in the index) and pin
// the clause every other obligation routes through; three ink, a wrong pin costs one, at none the
// clerk takes the paper back. Break: the dues ran "for forty years from the lighting of the quay
// lamp", and the lamp's date is on page I: point at it, or try a thing from the evidence drawer.
// Decide: Strike, Rewrite (her trust is 52 here, so she can) or Leave.
// Every clause below is written for the game (DESIGN.md section 22: the harbour book is added).
// Refine pass: a loupe over the seals (section 11, "Seals can be lifted to a loupe view"), an unsigned
// amendment slip that the clerk pins to page II once you have pinned the binding clause (a lure for the
// break), a phase strip with the ink always in view, and the beats and closing lines, all written for
// the game.
// Phase 1 (accepted 2026-11-15): Schedule C. Clause 5 holds the water itself "by the title recited in Schedule
// C", and once the dues are broken the red thread runs through the Schedule, off the page and across the cabin
// to the bottle on the wall: chit No. 1, in his own hand (a new step, Trace, between Break and Decide). The
// same card opens the last Charter of the game, the tab at the tally (_tab.js). The page's seals, the loupe,
// the evidence, the cabin wall and the result cards are drawn with the game's art (api.art).
import { pic, endCard, chapterStrip, circleGesture } from "./_art.js";
import { mountTab } from "./_tab.js";

const INK = "#2a2118", RED = "#8C2B2B", PAPER = "#F4F1E8", VELLUM = "#efe3c4", WOOD = "#6B4A2B", BLUE = "#1F2E4A", GREEN = "#2F6B5E", GOLD = "#E7A93B";
const TRUST = 52;

const CLAUSES = [
  { n: 1, page: 0, text: `Whereas the Great British Tea Company did light the quay lamp of Tidewater upon <span data-pt="lamp">the first day of March, in the year seventeen hundred and three</span>, the harbour from that day is the Company's to keep, as hereinafter set out.` },
  { n: 2, page: 0, text: `The ferry of Tidewater shall cross the harbour once in every <span data-pt="six">six minutes</span>, its pilot licensed by the Company, subject to the dues of <a data-ref="5">clause 5</a>.` },
  { n: 3, page: 0, text: `Every vessel moored within the harbour shall pay the mooring penny at the Company's office, as set out in <a data-ref="8">the Schedule (clause 8)</a> and levied under <a data-ref="5">clause 5</a>.` },
  { n: 4, page: 1, decoy: true, text: `Any master refusing what is owed shall FORFEIT HIS VESSEL to the Company, without appeal or remedy, notwithstanding anything in <a data-ref="7">clause 7</a>.` },
  { n: 5, page: 1, bind: true, text: `All vessels, and all souls that sail from Tidewater, are bound to the Company by the harbour dues, which shall run <span data-pt="forty">for forty years from the lighting of the quay lamp</span> (<a data-ref="1">clause 1</a>); the water itself the Company holds by the title recited in <a data-ref="13">Schedule C</a>.` },
  { n: 6, page: 1, text: `Fish landed at the Company's steps shall be weighed on the Company's scales, the weighing fee to be taken with the dues of <a data-ref="5">clause 5</a>.` },
  { n: 7, page: 2, text: `The Company shall keep the quay lamp burning, and the harbour lit, for so long as the dues of <a data-ref="5">clause 5</a> are paid.` },
  { n: 8, page: 2, text: `Schedule. The mooring penny: <span data-pt="penny">one penny the day</span> for a skiff, fourpence for a lighter, a shilling for a ship of burden; all levied as dues under <a data-ref="5">clause 5</a>.` },
  { n: 9, page: 2, slip: true, text: `Copied fair and entered <span data-pt="today">this ninth day of June, 1745</span>, by order of the Comptroller. <a data-ref="4">Clause 4</a> to be read with <a data-ref="2">clause 2</a>.` },
  { n: 11, page: 3, sched: "C1", tick: true, text: `The quay and its steps: by purchase of the town, the price paid in full.` },
  { n: 12, page: 3, sched: "C2", tick: true, text: `The quay lamp: by the Company's own building, as recited in <a data-ref="1">clause 1</a>.` },
  { n: 13, page: 3, sched: "C3", text: `The water of the harbour, its footing and its steadiness: by assignment of a note of hand, No. 1, drawn “pays next tide”, the drawer's mark as below; <a data-thread="1">the instrument not lodged with this book</a>.` },
];
const PAGES = ["I", "II", "III", "C"];
const SUMMARY = [
  "p. I: when the lamp was lit, the ferry, the mooring penny. All of it 'subject to' something on p. II.",
  "p. II: a loud threat, the dues themselves, the fish scales. Read what the threat actually rests on.",
  "p. III: the lamp, the price list, and a clerk's note with today's date.",
  "Schedule C: what the Company says it owns here, and how it came by each. Two of the three he has ticked.",
];
const SLIP = { n: 10, page: 1, slip: true, amend: true, text: `Amendment. The dues of <a data-ref="5">clause 5</a> to be continued <span data-pt="custom">by the custom of the harbour</span>, the Comptroller's hand to follow. <i>(Unsigned.)</i>` };
const LOUPE = [
  "Under the loupe: the Company's seal, and pressed into the wax beside it a quay lamp with a date in small capitals, MDCCIII. Seventeen hundred and three.",
  "",
  "Under the loupe: the Comptroller's office seal, the wax still soft enough to take a thumbnail. This book is a fair copy, made this year.",
];
const EVIDENCE = [
  { id: "token", name: "Wenna's ferry token", note: "Proves she crosses every six minutes. The book says as much." },
  { id: "song", name: "A song sheet, Gullwife crew", note: "Lovely. It breaks nothing written here." },
  { id: "deed", name: "The deed of sale, p. 4", note: "'All waters adjoining' binds the halls, not this harbour." },
  { id: "dues", name: "A mooring-penny receipt", note: "Paid, and dated this week. It shows the dues still taken, not that they are owed." },
];

export default {
  mount(root, api) {
    const P = "lord-of-the-sea-charter-";
    const art = api.art;
    const S = { chit: false, bottleSeen: false, schedSeen: false, page: 0, ink: 3, phase: "find", pinned: null, wrongPins: new Set(), threads: [], held: null, read: false, pencil: "", flash: null, loupe: -1, loupes: new Set(), slip: false, shake: null, splash: false, tries: 0 };
    const losses = +api.store.get("losses", 0) || 0;
    const clauses = () => (S.slip ? CLAUSES.concat([SLIP]) : CLAUSES);
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };

    root.innerHTML = `
    <style>
      .${P}w { position:absolute; inset:0; overflow:auto; color:${INK}; font-family:'IM Fell English',Georgia,serif;
        background: repeating-linear-gradient(92deg, rgba(0,0,0,.08) 0 2px, transparent 2px 19px), repeating-linear-gradient(88deg, rgba(255,255,255,.04) 0 1px, transparent 1px 7px), ${WOOD}; }
      .${P}desk { display:grid; grid-template-columns: 90px minmax(0,1fr) 230px; gap:16px; padding:16px clamp(10px,2.5vw,28px) 24px; max-width:1180px; margin:0 auto; align-items:start; }
      .${P}index { background:rgba(244,241,232,.9); border:1px solid ${INK}; padding:8px 6px; position:sticky; top:8px; }
      .${P}index h3, .${P}drawer h3 { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.14em; font-size:12px; margin:0 0 6px; text-align:center; }
      .${P}index svg { display:block; width:100%; height:auto; }
      .${P}index text { font-family:'IM Fell English',Georgia,serif; cursor:pointer; }
      .${P}paper { position:relative; background: radial-gradient(ellipse at 30% 20%, #faf3e2, ${VELLUM} 70%, #e2d2ac); border:1px solid #b9a578; box-shadow: 0 10px 26px rgba(0,0,0,.45), inset 0 0 40px rgba(120,90,40,.25); padding: 22px clamp(16px,4vw,48px) 30px; min-height:520px; }
      .${P}tabs { display:flex; gap:6px; margin:0 0 -1px 18px; }
      .${P}tabs button { font:inherit; font-size:16px; padding:5px 16px 4px; background:#e2d2ac; color:${INK}; border:1px solid #b9a578; border-bottom:0; cursor:pointer; border-radius:6px 6px 0 0; }
      .${P}tabs button.on { background:#faf3e2; font-weight:600; }
      .${P}title { font-family:'Pinyon Script',cursive; font-size:clamp(30px,4.5vw,46px); line-height:1.1; margin:4px 0 2px; text-align:center; }
      .${P}flour { text-align:center; color:${INK}; opacity:.7; margin-bottom:12px; }
      .${P}cl { position:relative; display:grid; grid-template-columns: 2.4em minmax(0,1fr); gap:6px; padding:9px 8px; margin:2px -8px; font-size:clamp(16px,1.6vw,19px); line-height:1.5; border-radius:3px; cursor:pointer; }
      .${P}cl:hover { background:rgba(140,43,43,.06); }
      .${P}cl .no { font-family:'Pinyon Script',cursive; font-size:1.5em; line-height:1; color:${RED}; }
      .${P}cl.decoy .tx { letter-spacing:.01em; }
      .${P}cl.flash { animation:${P}fl 1.2s; }
      @keyframes ${P}fl { 0%,40% { background:rgba(231,169,59,.45); } 100% { background:transparent; } }
      .${P}cl.pinned .tx { text-decoration: underline ${RED} 2px; text-underline-offset:4px; }
      .${P}cl.pinned::after { content:""; position:absolute; right:-14px; top:6px; width:16px; height:16px; border-radius:50%; background:${RED}; box-shadow: inset -3px -3px 0 rgba(0,0,0,.25); }
      .${P}cl.wrong .tx { text-decoration: line-through rgba(42,33,24,.4); }
      .${P}cl.lit { background:rgba(231,169,59,.28); }
      .${P}cl.slip { background:#fffaf0; border:1px solid #c9b88e; transform:rotate(-1deg); margin:14px 0 4px; box-shadow:2px 3px 6px rgba(0,0,0,.2); font-size:15px; }
      .${P}cl a { color:${RED}; text-decoration:underline dotted; cursor:pointer; }
      .${P}cl span[data-pt] { border-bottom:1px dashed transparent; }
      .${P}w.breaking .${P}cl span[data-pt] { border-bottom-color:${RED}; cursor:crosshair; background:rgba(140,43,43,.06); }
      .${P}pinbtn { font:inherit; font-size:13px; margin-left:8px; padding:1px 8px; background:transparent; border:1px solid ${RED}; color:${RED}; cursor:pointer; vertical-align:middle; }
      .${P}seal { position:absolute; right:clamp(10px,4vw,40px); bottom:16px; width:86px; }
      .${P}pencil { font-family:'IM Fell English',Georgia,serif; font-style:italic; color:#5d5a54; font-size:16px; min-height:1.4em; margin:12px 0 0; border-top:1px solid rgba(42,33,24,.2); padding-top:8px; padding-right:90px; }
      .${P}drawer { background:#3d2a18; color:${PAPER}; border:1px solid #20150b; padding:10px; position:sticky; top:8px; display:grid; gap:8px; }
      .${P}ink { display:flex; gap:6px; justify-content:center; align-items:center; }
      .${P}item { font:inherit; font-size:15px; text-align:left; background:${PAPER}; color:${INK}; border:1px solid #b9a578; padding:7px 9px; cursor:pointer; transform:rotate(-.6deg); box-shadow:1px 2px 4px rgba(0,0,0,.35); }
      .${P}item:nth-child(odd) { transform:rotate(.8deg); }
      .${P}item.held { outline:3px solid ${GOLD}; }
      .${P}acts { display:grid; gap:6px; }
      .${P}acts button, .${P}how button { font:inherit; font-size:17px; padding:7px 12px; cursor:pointer; border:1px solid ${INK}; background:${PAPER}; color:${INK}; }
      .${P}acts button.strike { background:${RED}; color:${PAPER}; }
      .${P}acts button:disabled { opacity:.45; cursor:default; }
      .${P}phase { font-size:15px; line-height:1.35; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(40,28,16,.74); z-index:3; padding:14px; overflow:auto; }
      .${P}deed { position:relative; max-width:540px; box-sizing:border-box; margin:8px; background:radial-gradient(ellipse at 30% 20%, #faf3e2, ${VELLUM} 70%, #e2d2ac); border:1px solid #b9a578; padding:20px 26px 18px; box-shadow:0 10px 30px rgba(0,0,0,.5), inset 0 0 30px rgba(120,90,40,.25); }
      .${P}deed h2 { font-family:'Pinyon Script',cursive; font-weight:400; font-size:clamp(38px,8vw,48px); margin:0; text-align:center; line-height:1.1; }
      .${P}deed .goal { text-align:center; font-size:18px; margin:4px 0 6px; }
      .${P}deed .open { font-style:italic; text-align:center; font-size:15px; line-height:1.4; margin:0 0 12px; color:#4b3f30; }
      .${P}deed ol { list-style:none; margin:0 0 14px; padding:10px 0 0; border-top:1px solid rgba(42,33,24,.35); display:grid; gap:8px; counter-reset:it; }
      .${P}deed li { display:grid; grid-template-columns:auto minmax(0,1fr); gap:10px; font-size:16px; line-height:1.35; }
      .${P}deed li::before { content:counter(it, lower-roman) "."; counter-increment:it; font-family:'Pinyon Script',cursive; color:${RED}; font-size:22px; line-height:1; min-width:1.4em; }
      .${P}deed li b { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.06em; color:${RED}; }
      .${P}deed kbd { font-family:inherit; border:1px solid ${INK}; padding:0 4px; font-size:14px; }
      .${P}deed .gentle { text-align:center; font-style:italic; color:${GREEN}; font-size:15px; margin:0 0 10px; }
      .${P}deed .foot { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .${P}deed .foot svg { width:64px; height:auto; flex:none; }
      .${P}deed button { font:inherit; font-size:18px; padding:8px 22px; cursor:pointer; border:1px solid ${INK}; background:${RED}; color:${PAPER}; }
      .${P}deed button:hover, .${P}deed button:focus-visible { background:${INK}; }
      .${P}thumb { width:58px; height:auto; flex:none; box-shadow:1px 2px 5px rgba(0,0,0,.4); transform:rotate(-3deg); }
      .${P}deed .alt { margin-top:12px; padding-top:10px; border-top:1px solid rgba(42,33,24,.35); display:flex; flex-wrap:wrap; gap:8px 12px; align-items:center; justify-content:space-between; font-size:14px; font-style:italic; }
      .${P}deed .alt button { font-size:15px; padding:5px 12px; background:${PAPER}; color:${INK}; font-style:normal; }
      .${P}deed .alt button:hover, .${P}deed .alt button:focus-visible { background:${INK}; color:${PAPER}; }
      img.${P}seal { height:auto; filter:drop-shadow(1px 2px 3px rgba(0,0,0,.35)); border-radius:50%; }
      .${P}lens img { width:96px; height:96px; border-radius:50%; }
      .${P}lens.art { grid-template-columns:96px minmax(0,1fr); }
      .${P}cl .tk { color:#2E7A46; font-family:Georgia,serif; font-size:15px; white-space:nowrap; margin-left:6px; }
      .${P}cl a[data-thread] { text-decoration:underline solid ${RED}; }
      .${P}mark { display:block; width:54px; height:54px; margin:2px 0 0 2.6em; }
      .${P}schedttl { text-align:center; font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.2em; font-size:20px; margin:6px 0 0; }
      .${P}schedsub { text-align:center; font-style:italic; color:${WOOD}; margin:0 0 6px; }
      .${P}wallstrip { display:flex; align-items:flex-end; gap:8px; justify-content:center; background:#2c1e12; border:1px solid #1a120a; padding:0 6px 4px; min-height:92px;
        background-image:repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 2px, transparent 2px 40px); }
      .${P}wallstrip button { background:none; border:0; padding:0; cursor:pointer; align-self:flex-start; }
      .${P}wallstrip button img { height:88px; width:auto; display:block; transform-origin:50% 0; }
      .${P}wallstrip button.pull img { animation:${P}sway 1.6s ease-in-out infinite; filter:drop-shadow(0 0 6px ${RED}); }
      @keyframes ${P}sway { 0%,100% { transform:rotate(-4deg); } 50% { transform:rotate(4deg); } }
      .${P}wallstrip .shelf { height:54px; width:auto; opacity:.92; border-bottom:3px solid #1a120a; }
      .${P}item { display:flex; align-items:center; gap:8px; }
      .${P}item img { width:26px; height:auto; flex:none; box-shadow:1px 1px 2px rgba(0,0,0,.4); }
      .${P}item.got { cursor:default; outline:2px solid ${GREEN}; }
      .${P}item.got img { width:64px; }
      .${P}scene { position:absolute; inset:0; z-index:4; background:rgba(26,18,10,.9); display:grid; place-items:center; padding:12px; overflow:auto; }
      .${P}scene .card { max-width:880px; width:100%; box-sizing:border-box; display:grid; grid-template-columns:minmax(0,1.05fr) minmax(0,1fr); gap:16px; align-items:center;
        background:radial-gradient(ellipse at 30% 20%, #faf3e2, ${VELLUM} 70%, #e2d2ac); border:1px solid #b9a578; padding:16px; box-shadow:0 12px 34px rgba(0,0,0,.6); }
      .${P}scene .picbox { position:relative; }
      .${P}scene .picbox > img { width:100%; height:auto; display:block; box-shadow:0 4px 12px rgba(0,0,0,.4); }
      .${P}scene .hot { position:absolute; left:76%; top:11%; width:22%; height:50%; background:none; border:2px dashed ${GOLD}; border-radius:10px; cursor:pointer; }
      .${P}scene .hot:hover, .${P}scene .hot:focus-visible { background:rgba(231,169,59,.2); }
      .${P}scene p { font-size:17px; line-height:1.4; margin:0 0 10px; }
      .${P}scene p.v { font-style:italic; color:#3C7A6A; }
      .${P}scene p.q { padding-left:12px; border-left:3px solid ${RED}; }
      .${P}scene button.go { font:inherit; font-size:17px; padding:7px 16px; cursor:pointer; border:1px solid ${INK}; background:${RED}; color:${PAPER}; }
      .${P}scene .two { display:flex; flex-wrap:wrap; gap:8px; }
      .${P}scene .two button { font:inherit; font-size:16px; padding:6px 12px; cursor:pointer; border:1px solid ${INK}; background:${PAPER}; color:${INK}; }
      .${P}pad { width:150px; height:150px; border:1px dashed ${INK}; border-radius:50%; margin:0 0 10px; cursor:crosshair; background:rgba(255,250,240,.7) center/70% no-repeat; display:grid; place-items:center; font-style:italic; font-size:14px; text-align:center; color:#5d5a54; }
      .${P}scene .since { width:150px; height:auto; float:right; margin:0 0 6px 10px; border:1px solid rgba(42,33,24,.5); }
      @media (prefers-reduced-motion: reduce) { .${P}wallstrip button.pull img { animation:none; } }
      @media (max-width:700px) { .${P}scene .card { grid-template-columns:minmax(0,1fr); padding:12px; } .${P}scene p { font-size:16px; } .${P}scene .since { width:110px; } }
      .${P}steps { display:flex; flex-wrap:wrap; gap:3px; justify-content:center; font-family:'IM Fell English SC',Georgia,serif; font-size:11.5px; letter-spacing:.06em; }
      .${P}steps span { padding:2px 5px; border:1px solid rgba(244,241,232,.4); opacity:.55; }
      .${P}steps span.on { opacity:1; background:${PAPER}; color:${INK}; }
      .${P}steps span.done { opacity:.85; text-decoration:line-through; }
      .${P}strip { display:none; }
      .${P}cl.shake { animation:${P}shk .45s; }
      @keyframes ${P}shk { 0%,100% { transform:none; } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }
      .${P}ink svg.spill { animation:${P}spill .8s; }
      @keyframes ${P}spill { 0% { transform:scale(1.6); filter:drop-shadow(0 0 4px ${RED}); } 100% { transform:none; } }
      .${P}cl.pinned .tx { animation:${P}ul .6s; }
      @keyframes ${P}ul { from { text-decoration-color:transparent; } to { text-decoration-color:${RED}; } }
      .${P}loupe { position:absolute; right:clamp(8px,3vw,30px); bottom:130px; font:inherit; font-size:14px; padding:3px 9px; background:${PAPER}; color:${INK}; border:1px solid ${INK}; cursor:pointer; border-radius:12px; }
      .${P}loupe:hover { background:#fff; }
      .${P}lens { margin:10px 0 0; display:grid; grid-template-columns:76px minmax(0,1fr); gap:12px; align-items:center; padding:10px; border:1px solid #b9a578; background:rgba(255,250,240,.7); font-size:16px; line-height:1.35; }
      .${P}lens svg { width:76px; height:76px; border-radius:50%; box-shadow:0 0 0 3px ${WOOD}, 0 0 0 5px ${GOLD}; }
      .${P}tabs button.circled { box-shadow:0 0 0 2px #5d5a54; border-radius:50%; }
      .${P}cl.amend { border-color:${RED}; }
      .${P}drawer .why { font-size:14px; font-style:italic; opacity:.9; }
      @media (prefers-reduced-motion: reduce) { .${P}cl.shake, .${P}ink svg.spill, .${P}cl.pinned .tx { animation:none; } }
      @media (max-width:820px) { .${P}strip { display:flex; position:sticky; top:0; z-index:2; justify-content:space-between; align-items:center; gap:8px; margin:-16px -10px 0; padding:8px 12px; background:#3d2a18; color:${PAPER}; box-shadow:0 3px 8px rgba(0,0,0,.4); font-size:15px; }
        .${P}strip .${P}ink { gap:3px; } .${P}loupe { bottom:130px; } }
      @media (max-width:820px) { .${P}desk { grid-template-columns:minmax(0,1fr); } .${P}index, .${P}drawer { position:static; } .${P}index svg { max-height:90px; } }
    </style>
    <div class="${P}w"><div class="${P}desk"></div>
      <div class="${P}how" role="dialog" aria-label="How to play"><div class="${P}deed">
        ${chapterStrip(art, 5, "Chapter V: The Open Chart")}
        <h2>The Charter</h2>
        <p class="goal">Find the one clause that binds Tidewater, and break it.</p>
        <p class="open">Chapter IV, the cabin. The princess has fetched the Tidewater harbour book from the Company's office on her father's name. The clerk wants it back by the evening tide.</p>
        ${losses >= 2 ? `<p class="gentle">She has already circled one page tab in pencil.</p>` : ""}
        <ol>
          <li><span><b>Follow</b> a red reference (click it, or Tab and Enter): a red thread joins the clauses in the index.</span></li>
          <li><span><b>Pin</b> the clause every other obligation routes through. Three ink; a wrong pin spills one.</span></li>
          <li><span><b>Loupe</b>: lift a seal to read what is pressed into the wax. <kbd>←</kbd><kbd>→</kbd> turn the pages.</span></li>
        </ol>
        <div class="foot">${pic(art, "charter-harbour-book", "", `class="${P}thumb"`) || `<svg viewBox="0 0 100 120" aria-hidden="true"><path d="M38 60 L22 116 L36 106 L44 118 L50 64Z M62 60 L78 116 L64 106 L56 118 L50 64Z" fill="${BLUE}"/><path d="M50 8 C68 6 82 18 86 34 C92 52 80 70 62 74 C44 80 20 72 14 52 C8 32 28 10 50 8Z" fill="${RED}"/><circle cx="50" cy="41" r="21" fill="none" stroke="#5e1b1b" stroke-width="2"/></svg>`}<button type="button" data-go="book">Open the book</button></div>
        <div class="alt"><span>Or the last Charter of the game, at the tally in chapter VI:</span><button type="button" data-go="tab">The tab: pin eight chits</button></div>
      </div></div>
    </div>`;
    const w = root.querySelector("." + P + "w");
    const desk = w.querySelector("." + P + "desk");
    const how = w.querySelector("." + P + "how");

    function seal() {
      const sid = S.page === 0 ? "seal-tidewater" : "seal-company";
      if (art.has(sid)) return pic(art, sid, "", `class="${P}seal"`);
      return `<svg class="${P}seal" viewBox="0 0 100 120" aria-hidden="true">
        <path d="M38 60 L22 116 L36 106 L44 118 L50 64Z M62 60 L78 116 L64 106 L56 118 L50 64Z" fill="${BLUE}" stroke="#14203a"/>
        <path d="M50 8 C68 6 82 18 86 34 C92 52 80 70 62 74 C44 80 20 72 14 52 C8 32 28 10 50 8Z" fill="${RED}" stroke="#5e1b1b" stroke-width="2"/>
        <circle cx="50" cy="41" r="21" fill="none" stroke="#5e1b1b" stroke-width="2"/>
        <path d="M38 48 Q50 24 62 48 Z M50 30 L50 52" fill="none" stroke="#5e1b1b" stroke-width="2.4"/>
        <ellipse cx="40" cy="28" rx="7" ry="3" fill="#fff" opacity=".25" transform="rotate(-30 40 28)"/></svg>`;
    }
    function indexSvg() {
      const hz = w.clientWidth < 820;
      const into = (n) => S.threads.filter(([, b]) => b === n).length;
      if (hz) { // a row under narrow screens: threads arc above the numbers
        const x = (n) => 18 + (n - 1) * 38;
        let arcs = "";
        for (const [a, b] of S.threads.filter(([x0, y0]) => x0 <= 9 && y0 <= 9)) { const xa = x(a), xb = x(b), r = Math.abs(xb - xa) / 2; arcs += `<path d="M${xa} 40 C ${xa} ${40 - Math.min(34, 8 + r * 0.5)}, ${xb} ${40 - Math.min(34, 8 + r * 0.5)}, ${xb} 40" fill="none" stroke="${RED}" stroke-width="1.4"/>`; }
        const nums = CLAUSES.map((c) => `<g data-goto="${c.n}"><circle cx="${x(c.n)}" cy="40" r="2" fill="${INK}"/><text x="${x(c.n) - 6}" y="62" font-size="19" fill="${S.pinned === c.n ? RED : INK}" ${S.wrongPins.has(c.n) ? 'text-decoration="line-through"' : ""}>${c.n}.</text>
          ${Array.from({ length: into(c.n) }, (_, i) => `<circle cx="${x(c.n) - 6 + i * 6}" cy="72" r="2.4" fill="${RED}"/>`).join("")}</g>`).join("");
        return `<svg viewBox="0 0 ${36 + 8 * 38} 80" aria-label="Clause index; red threads show the references you have followed">${arcs}${nums}</svg>`;
      }
      const h = 9 * 34 + 10;
      const y = (n) => 20 + (n - 1) * 34;
      let arcs = "";
      for (const [a, b] of S.threads.filter(([x0, y0]) => x0 <= 9 && y0 <= 9)) {
        const ya = y(a), yb = y(b), r = Math.abs(yb - ya) / 2;
        arcs += `<path d="M30 ${ya} C ${30 - Math.min(26, 8 + r * 0.4)} ${ya}, ${30 - Math.min(26, 8 + r * 0.4)} ${yb}, 30 ${yb}" fill="none" stroke="${RED}" stroke-width="1.4"/>`;
      }
      const nums = CLAUSES.map((c) => `<g data-goto="${c.n}"><text x="${40}" y="${y(c.n) + 6}" font-size="19" fill="${S.pinned === c.n ? RED : INK}" ${S.wrongPins.has(c.n) ? 'text-decoration="line-through"' : ""}>${c.n}.</text>
        ${Array.from({ length: into(c.n) }, (_, i) => `<circle cx="${68 + i * 6}" cy="${y(c.n)}" r="2.4" fill="${RED}"/>`).join("")}<circle cx="30" cy="${y(c.n)}" r="2" fill="${INK}"/></g>`).join("");
      return `<svg viewBox="0 0 110 ${h}" aria-label="Clause index; red threads show the references you have followed">${arcs}${nums}</svg>`;
    }
    function render() {
      const cls = clauses().filter((c) => c.page === S.page);
      const breaking = S.phase === "break";
      w.classList.toggle("breaking", breaking);
      const phaseText = {
        find: `<b>Find.</b> Click a red reference to follow it. Pin the clause that binds.`,
        break: `<b>Break.</b> Clause ${S.pinned} is pinned. Point at the fact in the book that undoes it, or lay a thing from the drawer on it.`,
        trace: `<b>Trace.</b> The dues are dead. But clause 5 holds the water itself by Schedule C: follow that reference to the end of its thread.`,
        decide: `<b>Decide.</b> The clause is lit. What will you do with it?`,
        done: "",
      }[S.phase];
      const drops = Array.from({ length: 3 }, (_, i) => `<svg viewBox="0 0 20 26" width="18" height="24" aria-hidden="true"${S.splash && i === S.ink ? ` class="spill"` : ""}><path d="M10 2 C14 10 18 14 18 18 A8 8 0 0 1 2 18 C2 14 6 10 10 2Z" fill="${i < S.ink ? BLUE : "none"}" stroke="${i < S.ink ? PAPER : RED}" stroke-width="1.4"/></svg>`).join("");
      const order = ["find", "break", "trace", "decide"];
      const steps = `<div class="${P}steps" aria-label="Phase">${order.map((k, i) => `<span class="${S.phase === k ? "on" : order.indexOf(S.phase) > i || S.phase === "done" ? "done" : ""}">${k.toUpperCase()}</span>`).join("")}</div>`;
      const hasSeal = S.page === 0 || S.page === 2;
      const lensArt = S.page === 0 ? "seal-tidewater" : "seal-company";
      const lens = S.loupe === S.page && LOUPE[S.page] && art.has(lensArt) ? `<div class="${P}lens art">${pic(art, lensArt, "")}<span>${LOUPE[S.page]}</span></div>`
        : S.loupe === S.page && LOUPE[S.page] ? `<div class="${P}lens"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="40" fill="${RED}"/><circle cx="40" cy="40" r="30" fill="none" stroke="#5e1b1b" stroke-width="2"/>${S.page === 0 ? `<path d="M34 54 h12 M36 54 V36 h8 V54 M33 36 h14 l-3 -6 h-8z" stroke="#f3d7c8" stroke-width="2" fill="none"/><text x="40" y="68" font-size="9" text-anchor="middle" fill="#f3d7c8" font-family="Georgia">MDCCIII</text>` : `<path d="M28 48 Q40 24 52 48 Z M40 30 V52" stroke="#f3d7c8" stroke-width="2.4" fill="none"/>`}</svg><span>${LOUPE[S.page]}</span></div>` : "";
      const circled = losses >= 2 ? 1 : -1;
      desk.innerHTML = `
        <div class="${P}strip"><span>${{ find: "Find the binding clause", break: "Break it", trace: "Trace Schedule C", decide: "Decide", done: "" }[S.phase]}</span><span class="${P}ink" aria-label="${S.ink} ink left">${drops}</span></div>
        <nav class="${P}index"><h3>INDEX</h3>${indexSvg()}</nav>
        <section>
          <div class="${P}tabs" role="tablist">${PAGES.map((p, i) => `<button type="button" role="tab" aria-selected="${i === S.page}" class="${i === S.page ? "on" : ""}${i === circled ? " circled" : ""}" data-page="${i}">${p}</button>`).join("")}</div>
          <article class="${P}paper">
            ${S.page === 0 ? `<div class="${P}title">The Harbour Book of Tidewater</div><div class="${P}flour">~ ❦ ~</div>` : S.page === 3 ? `<div class="${P}schedttl">SCHEDULE C</div><div class="${P}schedsub">Of the Company's title at Tidewater</div>` : `<div class="${P}flour" style="margin-top:6px">${PAGES[S.page]}</div>`}
            ${cls.map((c) => `<div class="${P}cl${c.slip ? " slip" : ""}${c.decoy ? " decoy" : ""}${S.pinned === c.n ? " pinned" : ""}${S.wrongPins.has(c.n) ? " wrong" : ""}${S.phase === "decide" && S.pinned === c.n ? " lit" : ""}${S.flash === c.n ? " flash" : ""}${S.shake === c.n ? " shake" : ""}${c.amend ? " amend" : ""}" data-cl="${c.n}">
              <span class="no"${c.sched ? ' style="font-size:1.15em"' : ""}>${c.slip ? "†" : c.sched || c.n}</span><span class="tx">${c.text}${c.tick ? `<span class="tk" title="Balanced, and initialled by the Lord of Tea">✓ T.</span>` : ""}${S.phase === "find" && !S.wrongPins.has(c.n) ? `<button type="button" class="${P}pinbtn" data-pin="${c.n}" aria-label="Pin clause ${c.sched || c.n}">pin</button>` : ""}</span></div>`).join("")}
            ${S.page === 3 ? `<svg class="${P}mark" viewBox="0 0 60 60" role="img" aria-label="The drawer's mark: a clockwise spiral"><path d="M30 30 C32 26 37 28 36 33 C35 39 26 40 23 34 C19 26 27 17 36 19 C47 22 49 37 41 44 C31 52 14 46 13 32 C12 20 22 10 34 10" fill="none" stroke="#3C7A6A" stroke-width="2.6" stroke-linecap="round"/></svg>` : ""}
            ${lens}
            <p class="${P}pencil" aria-live="polite">${S.pencil}</p>
            ${hasSeal ? seal() + `<button type="button" class="${P}loupe" data-a="loupe" aria-label="Lift the seal to the loupe (L)">${S.loupe === S.page ? "lower the seal" : "loupe ⌕"}</button>` : ""}
          </article>
        </section>
        <aside class="${P}drawer">
          ${steps}
          <div class="${P}wallstrip" aria-label="The cabin wall">${art.has("sprite-bottle-chit") ? `<button type="button" data-a="bottle" class="${S.phase === "trace" && S.thread ? "pull" : ""}" aria-label="A bottle hanging on the cabin wall">${pic(art, "sprite-bottle-chit", "")}</button>` : `<button type="button" data-a="bottle" style="color:${PAPER};font:inherit;align-self:center">a bottle on the wall</button>`}${pic(art, "thread-own", "", `class="shelf"`)}</div>
          <h3>INK</h3><div class="${P}ink" aria-label="${S.ink} ink left">${drops}</div>
          <div class="${P}phase">${phaseText}</div>
          ${S.phase === "find" && !S.read ? `<div class="${P}acts"><button type="button" data-a="read" title="Trust 40+: she reads one page aloud">Ask her to read this page (once)</button></div>` : ""}
          ${S.phase === "break" ? `<div class="why">Point at words in the book (they are underlined now), or pick up a thing below and lay it on clause ${S.pinned}.</div>` : ""}
          ${S.phase === "decide" ? `<div class="${P}acts">
              <button type="button" class="strike" data-a="strike">Strike</button>
              <button type="button" data-a="rewrite" ${TRUST >= 50 ? "" : "disabled"} title="She redrafts it (trust ${TRUST}, needs 50)">Rewrite</button>
              <button type="button" data-a="leave">Leave</button></div>` : ""}
          <h3 style="margin-top:6px">EVIDENCE</h3>
          ${EVIDENCE.map((e) => `<button type="button" class="${P}item${S.held === e.id ? " held" : ""}" data-ev="${e.id}">${e.id === "deed" ? pic(art, "charter-deed", "") : ""}<span>${e.name}</span></button>`).join("")}
          ${S.chit ? `<div class="${P}item got">${pic(art, "chit-1-bottle-neck", "")}<span>Chit No. 1, from the bottle: “one pair land legs, hardly used”</span></div>` : ""}
        </aside>`;
      S.splash = false; S.shake = null;
      wire();
    }
    function setPencil(t) { S.pencil = t; }
    function seeSched() { if (S.page === 3 && !S.schedSeen) { S.schedSeen = true; setPencil("Schedule C: what the Company says it owns at Tidewater, and how it came by each. Two of three are ticked in green ink and initialled. Someone balances these, and could not balance the third."); } }
    function follow(from, to) {
      if (!S.threads.some(([a, b]) => a === from && b === to)) S.threads.push([from, to]);
      const c = clauses().find((x) => x.n === to);
      S.page = c.page; S.flash = to; seeSched();
      render();
      later(() => { S.flash = null; }, 1200);
    }
    function pin(n) {
      if (S.phase !== "find") return;
      const c = clauses().find((x) => x.n === n);
      if (c.bind) {
        S.pinned = n; S.phase = "break"; S.slip = true;
        setPencil("Yes. Everything else is 'subject to' that one. Now: what in this book says it no longer holds? (And the clerk has just pinned a new slip to page II. Look at it.)");
      } else {
        S.ink--; S.wrongPins.add(n); S.splash = true; S.shake = n;
        setPencil(c.decoy ? "Loud, isn't it? But it only enforces something else. Follow what it rests on." : c.sched ? "A schedule recites what the Company says it holds. It binds nobody by itself." : c.slip ? "A clerk's note. It binds nobody." : `Clause ${n} hangs on another clause. Follow its reference.`);
        if (S.ink <= 0) { S.phase = "done"; render(); api.store.set("losses", losses + 1); later(() => { endCard(root, art, "port-seal-bound", "THE PORT OF TIDEWATER"); api.end({ outcome: "lose", text: `The ink is gone, three clauses blotted, none of them the one. The clerk takes the harbour book back at the evening tide: notice +10, and Tidewater stays bound until it can be asked for again.` }); }, 700); return; }
      }
      render();
    }
    function point(pt) {
      if (S.phase !== "break") return;
      S.tries++;
      if (pt === "lamp") {
        S.phase = "trace"; S.flash = S.pinned;
        later(() => { S.flash = null; }, 1300);
        setPencil("Lit in seventeen hundred and three; dues for forty years; and the clerk dates his copy 1745. The dues ran out two years ago. — But read the end of clause 5 again. The dues were only the rent. The water itself they hold “by the title recited in Schedule C”.");
      } else if (pt === "custom") setPencil("Unsigned, so it adds nothing. But nor does it undo clause 5: custom is not a date. When did the forty years start?");
      else if (pt === "today") setPencil("That is today's date. Forty years from when, though?");
      else if (pt === "forty") setPencil("Forty years, yes. From the lighting of the lamp. When was that?");
      else setPencil("That is true, and it breaks nothing.");
      render();
    }
    function useEvidence(id, n) {
      if (S.phase !== "break") return;
      const e = EVIDENCE.find((x) => x.id === id);
      setPencil(n === S.pinned ? e.note : "Lay it on the clause you pinned, if anywhere.");
      S.held = null; render();
    }
    function decide(a) {
      if (S.phase !== "decide") return;
      S.phase = "done"; render();
      const text = {
        strike: "Struck. The port of Tidewater goes broken, and the Company's order goes with it: Wild in the Lanes 10 → 25. One clause token for the Tea Board; her trust +5.",
        rewrite: "Rewritten in her hand: the dues end, the ferry and the lamp stay, and a safe lane is kept there for nothing. Wild unchanged. One clause token; her trust +5.",
        leave: "Left bound. The ferry keeps its six minutes and the penny keeps being taken. She watched you find it: trust −5.",
      }[a] + " Schedule C stands whatever is done to the dues: the water was not taken, it was bought, with a chit in his own hand. Chit No. 1 goes on the cabin wall, the first of eight." + (S.ink === 3 ? " Not a drop of ink spilled." : "");
      api.store.set("losses", 0);
      endCard(root, art, { strike: "port-seal-broken", rewrite: "port-seal-rewritten", leave: "port-seal-bound" }[a], "THE PORT OF TIDEWATER");
      api.end({ outcome: a === "leave" ? "done" : "win", text });
    }
    // ---- Schedule C: the thread that leaves the page ----
    function thread() {
      if (S.phase !== "trace") { setPencil(S.phase === "decide" ? "The instrument is in the drawer now." : "“Not lodged with this book.” One thing at a time: find what binds the port, and break it, first."); render(); return; }
      S.thread = true;
      openWall();
    }
    let scene = null, ungest = null;
    function closeWall() { if (ungest) { ungest(); ungest = null; } if (scene) { scene.remove(); scene = null; } }
    function openWall(step = 0) {
      closeWall();
      scene = document.createElement("div");
      scene.className = P + "scene"; scene.setAttribute("role", "dialog"); scene.setAttribute("aria-label", "Schedule C and the cabin wall");
      const pictures = [
        `<div class="picbox">${pic(art, "charter-schedule-c", "Schedule C on the writing slope; a red thread runs off the page to a bottle hanging on the cabin wall") || `<div style="padding:30px;border:1px solid ${INK}">Schedule C. A red thread runs off the page, across the cabin, to a bottle on the wall.</div>`}<button type="button" class="hot" data-w="take" aria-label="Take the bottle down"></button></div>`,
        `<div class="picbox">${pic(art, "chit-1-bottle-neck", "Chit No. 1: one pair land legs, hardly used; pays next tide; signed with a clockwise spiral") || `<div style="padding:30px;border:1px solid ${INK}">Chit No. 1</div>`}</div>`,
      ];
      const texts = [
        `<p>The red thread runs to the edge of Schedule C and does not stop. It leaves the slope, crosses the cabin, and ends at a bottle on the wall.</p><p>It has hung there since the first morning.</p><button type="button" class="go" data-w="take">Take the bottle down</button>`,
        `${pic(art, "chapter-01", "", `class="since"`)}<p>A paper tied at its neck. <b>No. 1.</b> <i>One pair land legs, hardly used. Pays next tide.</i> Signed with a spiral; stamped, later, with the Company's leaf.</p>
         <p class="q">“I pawned my legs?”<br>“Hardly used, it says.”</p>
         <p>Schedule C gives “the drawer's mark as below”. Make the mark: one circle on the pad, the way the hand goes by itself.</p>
         <div class="${P}pad" data-w="pad" aria-label="Draw one circle here">${S.sigMsg || "draw one circle"}</div>
         <div class="two"><button type="button" data-w="cw">↻ Clockwise (E)</button><button type="button" data-w="ccw">↺ Counter-clockwise (Q)</button></div>`,
        `<p class="v">Every spiral ran clockwise. So does everything he does when he is not thinking.</p>
         <p>The mark on the chit, the mark in Schedule C, and the mark he has just made are one mark.</p>
         <p class="q">“Then they did not take this harbour, Alexi. They bought it. Lawfully, and from you.”</p>
         <button type="button" class="go" data-w="keep">Put the chit in the drawer</button>`,
      ];
      scene.innerHTML = `<div class="card">${pictures[Math.min(step, 1)]}<div>${texts[step]}</div></div>`;
      w.appendChild(scene);
      const sign = (dir) => {
        if (dir > 0) openWall(2);
        else { S.sigMsg = "He tried it the other way. It did not look like his."; openWall(1); }
      };
      scene.querySelectorAll("[data-w]").forEach((b) => {
        const k = b.dataset.w;
        if (k === "pad") { ungest = circleGesture(b, sign); return; }
        b.addEventListener("click", () => {
          if (k === "take") openWall(1);
          if (k === "cw") sign(1);
          if (k === "ccw") sign(-1);
          if (k === "keep") { closeWall(); S.chit = true; S.phase = "decide"; S.page = 1; S.flash = S.pinned; later(() => { S.flash = null; }, 1300); setPencil("So: the dues are two years dead, and the title under them is your own note of hand. Strike the dues, rewrite them, or leave them. Schedule C will stand either way, until the tab is answered."); render(); }
        });
      });
      S.sceneStep = step;
      (scene.querySelector("button.go") || scene.querySelector("[data-w=cw]")).focus();
    }
    function loupe() {
      if (!(S.page === 0 || S.page === 2)) return;
      if (S.loupe === S.page) { S.loupe = -1; render(); return; }
      S.loupe = S.page;
      if (!S.loupes.has(S.page)) { S.loupes.add(S.page); if (S.page === 0 && S.phase !== "decide") setPencil("A lamp in the wax, and a year. Worth remembering when something runs 'from the lighting of the quay lamp'."); }
      render();
    }
    function wire() {
      desk.querySelectorAll("[data-page]").forEach((b) => b.addEventListener("click", () => { S.page = +b.dataset.page; seeSched(); render(); }));
      desk.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => { const c = clauses().find((x) => x.n === +b.dataset.goto); S.page = c.page; S.flash = c.n; render(); }));
      desk.querySelectorAll("a[data-ref]").forEach((a) => a.addEventListener("click", (e) => { e.stopPropagation(); follow(+a.closest("[data-cl]").dataset.cl, +a.dataset.ref); }));
      desk.querySelectorAll("a[data-thread]").forEach((a) => a.addEventListener("click", (e) => { e.stopPropagation(); thread(); }));
      desk.querySelectorAll("[data-pin]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); pin(+b.dataset.pin); }));
      desk.querySelectorAll("span[data-pt]").forEach((sp) => sp.addEventListener("click", (e) => { if (S.phase !== "break") return; e.stopPropagation(); point(sp.dataset.pt); }));
      desk.querySelectorAll("[data-cl]").forEach((c) => c.addEventListener("click", () => { if (S.held) useEvidence(S.held, +c.dataset.cl); }));
      desk.querySelectorAll("[data-ev]").forEach((b) => b.addEventListener("click", () => {
        if (S.phase !== "break") { setPencil("Keep it in the drawer until a clause is pinned."); render(); return; }
        S.held = S.held === b.dataset.ev ? null : b.dataset.ev;
        setPencil(S.held ? "Now lay it on a clause." : ""); render();
      }));
      desk.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "read") { S.read = true; setPencil("She reads it out plainly — " + SUMMARY[S.page]); render(); }
        else if (a === "bottle") { if (S.phase === "trace" && S.thread) openWall(); else if (S.chit) { setPencil("An empty bottle on a cord. The paper that was at its neck is in the drawer now."); render(); } else { S.bottleSeen = true; setPencil("A bottle on a cord, with a bit of paper tied at its neck. There are a great many bottles on this boat."); render(); } }
        else if (a === "loupe") loupe();
        else decide(a);
      }));
    }
    const onKey = (e) => {
      if (how.isConnected) return;
      if (scene) { if (S.sceneStep === 1 && (e.key === "e" || e.key === "E")) scene.querySelector("[data-w=cw]").click(); if (S.sceneStep === 1 && (e.key === "q" || e.key === "Q")) scene.querySelector("[data-w=ccw]").click(); return; }
      if (e.target.closest && e.target.closest("button,a")) return;
      if (e.key === "ArrowRight") { S.page = Math.min(3, S.page + 1); seeSched(); render(); }
      if (e.key === "ArrowLeft") { S.page = Math.max(0, S.page - 1); render(); }
      if (/^[1234]$/.test(e.key)) { S.page = +e.key - 1; seeSched(); render(); }
      if (e.key === "l" || e.key === "L") loupe();
    };
    addEventListener("keydown", onKey);
    // references are links without href: make them reachable by keyboard
    const obs = new MutationObserver(() => desk.querySelectorAll("a[data-ref], a[data-thread], span[data-pt]").forEach((a) => {
      if (a.tagName === "A" || w.classList.contains("breaking")) { a.tabIndex = 0; a.setAttribute("role", "button"); }
      if (!a._k) { a._k = true; a.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); a.click(); } }); }
    }));
    obs.observe(desk, { childList: true });
    render();
    const b = how.querySelector("[data-go=book]");
    b.addEventListener("click", () => { how.remove(); setPencil("The letters sit still at the chart table. Start where the obligations start, and follow what they are 'subject to'."); render(); });
    b.focus();
    let tab = null;
    const stopBook = () => { timers.forEach(clearTimeout); timers.clear(); removeEventListener("keydown", onKey); obs.disconnect(); closeWall(); };
    how.querySelector("[data-go=tab]").addEventListener("click", () => { stopBook(); tab = mountTab(root, api); });
    return {
      unmount() { stopBook(); if (tab) tab.unmount(); },
    };
  },
};

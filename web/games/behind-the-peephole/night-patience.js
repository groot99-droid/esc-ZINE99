// Behind the Peephole / Night Patience (1D, solitaire). Style: art deco playing cards, gold on
// green baize, one card from another deck. The deal is `n3_patience` from
// games/behind-the-peephole/data/deals.json (3 passes, proven winnable), with slipped cards 3 and 4
// (DESIGN.md section 11). The clock runs at 10x and is only shown; it ends nothing.
// Actions: MOVE (a card or a run, to a column or home), DRAW from the stock, PEEK (once a pass),
// HINT (three, one legal move each), UNDO (three: put back your last move) and the SPIKE (read the
// slipped cards). Phases: the first pass and slipped card A; column six and slipped card B; the
// last passes, when the stock runs thin.
// Art (games/behind-the-peephole/art): the deco deck's fifty-two faces and the hotel's own back; the
// slipped cards and their nicked rose back (Fenn's deck); cards 1 and 2 already on the spike from
// night two; the brass number plates over the columns; the deco divider and chapter card three.

// Phase 2 (2026-11-16): the ladder. Three short deals from a cut deck, each proven winnable by the
// scratch solver: TEACH (night three, Ace to 8, unlimited passes), TEST (night four, Ace to 10, two
// passes, the second card under column six; REPLY CARDS: leave one of three questions on the spike and
// the card under column six answers it) and TWIST (night seven, Ace to 8, one pass: two cards slipped
// into the drawer give opposite advice, and only one has Fenn's nicked back; under column six, the
// card with the brass dot). QUIET COLUMNS: a column cleared under a room number is written to
// api.shared ("quiet"), and the eye at the hole gives that room a longer first window.
// Cuts: one reply exchange, not three; the cut decks.
import { staged } from "./_stages.js";
import { mark, isSecond, shiftOf } from "./_seventh.js";
// Phase 3 (2026-11-16): Fenn's answer under column six (TEST, after a reply card) carries, copied small
// beneath it, the booking ledger's seventh line: the fifth mark of the seventh row (api.shared
// "seventh"). Second shift: your own reply card from the first shift is already on the spike on night
// three, in your hand, before you have written anything.

const STAGES = [
  { night: 3, top: 8, passes: Infinity, columns: [["7D"], ["2H", "6S"], ["6D", "8S", "5C"], ["3S", "4C", "4H", "3H"], ["AH", "6C", "AS", "AD", "8H"], ["7C", "4D", "7H", "5H", "2C", "7S"]], stock: ["3C", "5S", "2S", "4S", "2D", "8C", "AC", "8D", "6H", "5D", "3D"],
    slipA: { no: 3, text: "Past 404 the boards talk. Walk them.", at: 4 }, slipB: { no: 4, text: "The chute doesn't go to a manager." },
    goal: "Bring all thirty-two home, Ace to 8 by suit. Turn the stock as often as you like.",
    open: "Night three, 23:00: the quiet before the first bell. The worn deck from your drawer, cut down to the low cards, dealt under six brass numbers. Someone has been in the drawer again." },
  { night: 4, top: 10, passes: 2, columns: [["AC"], ["6S", "4S"], ["3S", "3D", "6D"], ["2S", "5H", "7D", "9S"], ["TS", "5D", "2C", "8S", "AH"], ["7H", "TD", "9C", "9H", "7C", "8D"]], stock: ["5S", "AD", "5C", "6H", "4D", "TH", "3H", "8H", "4H", "7S", "3C", "TC", "8C", "9D", "4C", "AS", "2H", "6C", "2D"],
    slipA: { no: 5, text: "The man who books is called Wren. Like the bird.", at: 5 }, slipB: { no: 6, text: "Lost property. Bottom drawer. My old book." },
    goal: "Bring all forty home, Ace to 10 by suit. Two passes through the stock.",
    open: "Night four, 23:00. Two passes tonight, and the second stranger's card lies under the whole of column six. The hotel's own cards are in the drawer too, blank on one side." },
  { night: 7, top: 8, passes: 1, columns: [["2C"], ["7C", "5C"], ["6C", "7S", "AD"], ["7H", "AC", "4S", "5S"], ["4D", "3C", "5D", "6S", "5H"], ["2D", "3D", "3H", "8D", "8S", "4C"]], stock: ["2S", "AH", "3S", "6D", "8H", "6H", "AS", "4H", "7D", "2H", "8C"],
    slipA: null, slipB: { no: 0, dotted: true, text: "A hotel card, blank but for a brass dot in watercolour in one corner. Filled in." },
    goal: "Bring all thirty-two home. One pass. Two cards were in the drawer, and they do not agree.",
    open: "Night seven, 23:00. One pass. Two cards from another deck were in the drawer with yours, and they give opposite advice. Fenn's deck has one petal of the rose nicked. Somebody else's does not." },
];
const ADVICE = [
  { no: "?", text: "The ace onto the two of clubs, before anything. The four can wait.", back: "back-fenn", fenn: true },
  { no: "?", text: "The four of clubs onto the five of hearts. First thing.", back: "back-second-hand", fenn: false },
];
const REPLIES = [
  { id: "who-paid", ask: "Who paid?", card: { no: 10, text: "Wren's account ends in the time I knock." } },
  { id: "who-watches", ask: "Who watches?", card: { no: 11, text: "Look at your own door." } },
  { id: "who-was-here", ask: "Who was here?", card: { no: 12, text: "I stopped writing it down. They didn't stop me." } },
];
const RANKS = "A23456789TJQK";
const SUITS = { S: "♠", H: "♥", D: "♦", C: "♣" };
const rank = (c) => RANKS.indexOf(c[0]) + 1;
const red = (c) => c[1] === "H" || c[1] === "D";
const label = (c) => (c[0] === "T" ? "10" : c[0]) + SUITS[c[1]];
const NOTES = {
  open: "Night three, 23:00: the quiet before the first bell. The worn deck from your drawer, dealt under six brass numbers. Someone has been in the drawer again.",
  slipA: "Not from this deck. The hand is careful, and it knows the passage.",
  pass: "The stock turns over. The same cards, in the same order, and fewer chances.",
  half: "Half the deck home. Six rooms still dark behind the wall.",
  slipB: "Under the last face-down card of the sixth column, another stranger's card. It was put there for whoever got this far.",
  answer: "Under column six, the same careful hand, and it is an answer. He read what you left on the spike.",
  dotted: "Not Fenn's hand, and not the other one's. A hotel card with a brass dot painted in its corner, and the dot is filled.",
  quiet: (n) => `Column ${n} is clear before the bell. Whoever sleeps behind ${n} will give you a longer first look tonight.`,
};

const FAN = (col) => `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'><g fill='none' stroke='${col}' stroke-width='1.3'>` +
  [0, 1, 2, 3, 4, 5, 6].map((i) => { const a = Math.PI * (0.12 + i * 0.127); return `<line x1='30' y1='38' x2='${(30 - 26 * Math.cos(a)).toFixed(1)}' y2='${(38 - 26 * Math.sin(a)).toFixed(1)}'/>`; }).join("") +
  `<path d='M8 38 A22 22 0 0 1 52 38'/><path d='M15 38 A15 15 0 0 1 45 38'/><path d='M22 38 h16 v-4 h-4 v-4 h-8 v4 h-4z'/></g></svg>`)}")`;
const SUN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 70'><rect x='4' y='4' width='42' height='62' fill='none' stroke='#b8913f' stroke-width='1.2'/>` +
  `<rect x='8' y='8' width='34' height='54' fill='none' stroke='#b8913f' stroke-width='.6'/><g stroke='#e3c47a' stroke-width='.8'>` +
  Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (i / 12); return `<line x1='25' y1='52' x2='${(25 - 15 * Math.cos(a)).toFixed(1)}' y2='${(52 - 15 * Math.sin(a)).toFixed(1)}'/>`; }).join("") +
  `</g><path d='M15 52 h20 v-3 h-3 v-3 h-14 v3 h-3z M18 22 h14 l-7 -8z' fill='#b8913f'/></svg>`)}")`;
const CORNER = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><g fill='none' stroke='#b8913f' stroke-width='1.2' opacity='.55'>` +
  Array.from({ length: 9 }, (_, i) => { const a = Math.PI / 2 * (i / 8); return `<line x1='4' y1='4' x2='${(4 + 110 * Math.cos(a)).toFixed(1)}' y2='${(4 + 110 * Math.sin(a)).toFixed(1)}'/>`; }).join("") +
  `<path d='M4 64 A60 60 0 0 0 64 4'/><path d='M4 88 A84 84 0 0 0 88 4'/><path d='M4 40 h16 v-8 h8 v-8 h8 v-20'/></g></svg>`)}")`;

const P = "behind-the-peephole-night-patience-";
export default staged(P, ["unlimited passes", "two passes, a reply", "one pass, two hands"], function play(root, api, stage) {
    const DEAL = STAGES[stage.stage], TOTAL = DEAL.top * 4;
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const RM = api.reducedMotion;
    const streak = api.store.get("lossStreak", 0);
    let gentle = api.store.get("gentle", false);
    const st = document.createElement("style");
    st.textContent = `
    .${P}felt{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#2f5a40,#1f3d2c 55%,#13271c);font-family:'Cormorant Garamond',Georgia,serif;color:#e3c47a;user-select:none;touch-action:manipulation}
    .${P}felt::before{content:"";position:absolute;inset:8px;border:1px solid rgba(184,145,63,.5);outline:1px solid rgba(184,145,63,.25);outline-offset:4px;pointer-events:none;
      background:${CORNER} left top/110px no-repeat,${CORNER} right top/110px no-repeat,${CORNER} left bottom/110px no-repeat,${CORNER} right bottom/110px no-repeat}
    .${P}felt::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;background:repeating-linear-gradient(45deg,rgba(0,0,0,.05) 0 2px,transparent 2px 4px),repeating-linear-gradient(-45deg,rgba(255,255,255,.03) 0 2px,transparent 2px 5px)}
    .${P}felt>.${P}fl{position:absolute;right:16px;top:12px;font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#e3c47a}
    .${P}card{position:absolute;border-radius:6px;box-sizing:border-box;cursor:pointer;transition:left .16s,top .16s,box-shadow .15s}
    .${P}face{background:#f4ecd6;border:1.5px solid #b8913f;box-shadow:inset 0 0 0 3px #f4ecd6,inset 0 0 0 4px rgba(184,145,63,.6),0 2px 3px #0006;color:#1c1a17}
    .${P}face:hover{box-shadow:inset 0 0 0 3px #f4ecd6,inset 0 0 0 4px rgba(184,145,63,.9),0 0 0 2px rgba(246,207,134,.6),0 2px 3px #0006}
    .${P}face.r{color:#a3302a}
    .${P}face .c{position:absolute;left:7%;top:4%;font-weight:700;line-height:.9;font-size:var(--fs)}
    .${P}face .m{position:absolute;left:15%;right:15%;top:30%;height:34%;background-repeat:no-repeat;background-position:center;background-size:contain}
    .${P}face .s{position:absolute;right:0;left:0;bottom:8%;text-align:center;font-size:calc(var(--fs)*1.5)}
    .${P}back{background:#1f3d2c ${SUN} center/88% 92% no-repeat;border:1.5px solid #b8913f;box-shadow:0 2px 3px #0006}
    .${P}face.art{background-size:100% 100%;background-color:#f4ecd6;border:0;box-shadow:0 2px 3px #0006;overflow:hidden}
    .${P}face.art:hover{box-shadow:0 0 0 2px rgba(246,207,134,.8),0 2px 3px #0006}
    .${P}face.art .ix{position:absolute;left:0;top:0;background:#f4ecd6;color:#1c1a17;font:700 var(--fs)/1 'IBM Plex Mono',monospace;padding:2px 3px 2px 2px;border-radius:5px 0 5px 0}
    .${P}face.art .ix.r{color:#a3302a}
    .${P}back.art{background-size:100% 100%;background-color:#12241b;border:0}
    .${P}slip.art{background-size:100% 100%;background-color:#e9e9e4;padding:0;border:0;box-shadow:0 2px 3px #0006}
    .${P}plate.art{background-color:transparent;background-size:300% 200%;border-radius:3px;color:transparent;box-shadow:0 1px 2px #0008}
    .${P}big div.art{background:none;border:0;padding:0;box-shadow:none;display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-content:center;width:min(92vw,720px);aspect-ratio:auto}
    .${P}big div.art img{width:min(300px,72vw);height:auto;border-radius:10px;box-shadow:0 10px 40px #000;display:block}
    .${P}big div.art.many img{width:min(158px,42vw)}
    .${P}big div.art small{flex-basis:100%;text-align:center;color:#f6cf86;margin-top:6px}
    .${P}deco img.ch{display:block;width:calc(100% + 44px);max-width:none;margin:-22px -22px 10px;height:84px;object-fit:cover;object-position:0 0;border-radius:9px 9px 0 0}
    .${P}deco img.dv{display:block;width:min(300px,90%);height:auto;margin:0 auto 2px}
    .${P}slot{position:absolute;border:1.5px dashed rgba(184,145,63,.6);border-radius:6px;box-sizing:border-box;display:grid;place-items:center;font-size:calc(var(--fs)*1.4);color:rgba(227,196,122,.7)}
    .${P}sel{outline:3px solid #f6cf86;outline-offset:1px;z-index:5}
    .${P}bad{animation:${P}bad .35s}
    @keyframes ${P}bad{25%{transform:translateX(-5px);outline:3px solid #d0402e}75%{transform:translateX(5px);outline:3px solid #d0402e}}
    .${P}home{animation:${P}home .6s ease-out}
    @keyframes ${P}home{0%{box-shadow:0 0 0 0 rgba(246,207,134,.9)}100%{box-shadow:0 0 0 16px rgba(246,207,134,0)}}
    .${P}pulse{animation:${P}p 1s ease-in-out infinite}
    @keyframes ${P}p{50%{outline:3px solid #f6cf86;outline-offset:3px}}
    .${P}plate{position:absolute;background:linear-gradient(#e3c47a,#b8913f);color:#1c1a17;font:600 12px 'IBM Plex Mono',monospace;text-align:center;border-radius:2px;padding:1px 0}
    .${P}hud{position:absolute;font:13px 'IBM Plex Mono',monospace;letter-spacing:.1em;color:#e3c47a;display:flex;flex-wrap:wrap;gap:6px;align-items:center;z-index:6}
    .${P}btn{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.08em;color:#e3c47a;background:rgba(19,39,28,.85);border:1px solid #b8913f;padding:7px 10px;cursor:pointer;min-height:42px}
    .${P}btn:hover,.${P}btn:focus-visible{background:#2f5a40;outline:none;box-shadow:0 0 0 2px rgba(246,207,134,.5)}
    .${P}btn[disabled]{opacity:.4;cursor:default}
    .${P}btn[hidden]{display:none}
    .${P}btn.new{animation:${P}n 1s ease-in-out 3}
    @keyframes ${P}n{50%{box-shadow:0 0 0 3px #f6cf86}}
    .${P}story{position:absolute;left:50%;transform:translateX(-50%);bottom:12px;width:min(620px,calc(100% - 32px));text-align:center;font:italic 500 18px/1.3 'Cormorant Garamond',Georgia,serif;color:#f6cf86;text-shadow:0 1px 4px #000;pointer-events:none;transition:opacity .6s}
    .${P}slip{overflow:hidden;background:#fbfbf7;border:1.5px solid #6b3a2a;color:#2a1a10;font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;font-size:calc(var(--fs)*.5);line-height:1.1;padding:7%;transform:rotate(4deg);display:flex;align-items:center;text-align:center}
    .${P}big{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,20,14,.72);z-index:10}
    .${P}big div{width:min(300px,72vw);aspect-ratio:5/7;background:#fbfbf7;border:2px solid #6b3a2a;border-radius:10px;box-shadow:0 10px 40px #000;display:grid;place-items:center;padding:28px;box-sizing:border-box;font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;color:#2a1a10;font-size:clamp(20px,4vw,26px);text-align:center;transform:rotate(-3deg)}
    .${P}big.in div{animation:${P}lift .5s ease-out}
    @keyframes ${P}lift{0%{transform:rotate(8deg) scale(.4);opacity:0}100%{transform:rotate(-3deg) scale(1);opacity:1}}
    .${P}big small{display:block;font:13px 'IBM Plex Mono',monospace;color:#6b3a2a;margin-top:14px}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;z-index:12;background:rgba(10,20,14,.84);padding:12px;overflow:auto}
    .${P}deco{max-width:470px;width:100%;box-sizing:border-box;border:1.5px solid #b8913f;outline:1px solid rgba(184,145,63,.5);outline-offset:5px;border-radius:10px;background:#13271c ${CORNER} left top/90px no-repeat;padding:22px 22px 18px;color:#efe6cf;font:14px/1.5 'IBM Plex Mono',monospace;text-align:center}
    .${P}deco h2{font:700 32px/1 'Cormorant Garamond',Georgia,serif;color:#f6cf86;margin:4px 0 6px;letter-spacing:.04em}
    .${P}deco .fan{width:120px;height:40px;margin:0 auto;background:${FAN("#e3c47a")} center/contain no-repeat}
    .${P}deco .goal{font:italic 500 19px/1.3 'Cormorant Garamond',Georgia,serif;color:#f6cf86;margin:0 0 8px}
    .${P}deco .open{margin:0 0 10px;color:#cfc4a6}
    .${P}deco dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;text-align:left;margin:0 auto 12px;max-width:380px}
    .${P}deco dt{color:#e3c47a;font-weight:600;letter-spacing:.08em}
    .${P}deco dd{margin:0}
    .${P}deco label{display:block;margin:0 0 10px;font-size:13px}
    `;
    root.appendChild(st);
    const art = api.art || { has: () => false, url: () => "" };
    const SUITN = { S: "spades", H: "hearts", D: "diamonds", C: "clubs" }, RANKN = { A: "ace", T: "10", J: "jack", Q: "queen", K: "king" };
    const deckId = (c) => `deck-${SUITN[c[1]]}-${RANKN[c[0]] || c[0]}`;
    const slipId = (s) => (s.dotted ? "card-dotted" : s.reply ? "reply-" + s.reply : "slip-" + String(s.no).padStart(2, "0"));
    const felt = document.createElement("div");
    felt.className = P + "felt";
    root.appendChild(felt);
    const story = document.createElement("div"); story.className = P + "story"; story.setAttribute("aria-live", "polite"); felt.appendChild(story);
    let storyT = 0;
    const tell = (s) => { story.textContent = s; story.style.opacity = 1; storyT = performance.now(); };

    // ---- state
    let cols = DEAL.columns.map((c) => c.map((card, i) => ({ c: card, up: i === c.length - 1 })));
    let stock = DEAL.stock.slice(), waste = [], found = { S: [], H: [], D: [], C: [] };
    // the spike already holds night two's cards (DESIGN.md section 11, slipped cards 1 and 2)
    const OLD = [{ no: 1, text: "Don't watch one door too long. They see the dark." }, { no: 2, text: "The bell gives you less time than you think. Run." }, { no: 3, text: "Past 404 the boards talk. Walk them." }, { no: 4, text: "The chute doesn't go to a manager." }];
    let spike = stage.stage === 0 ? OLD.slice(0, 2) : stage.stage === 1 ? OLD.slice() : ADVICE.map((a) => ({ ...a }));
    let replied = null;
    const SECOND = isSecond(shared), OWN = REPLIES.find((x) => x.id === (shiftOf(shared).reply || shared.get("reply", "")));
    if (SECOND && OWN && stage.stage === 0) spike.push({ no: "yours", text: OWN.ask, reply: OWN.id });
    const quiet = shared.get("quiet", {}) || {};
    let pass = 1, turnsThisPass = 0, peeked = false, peekShow = false, hints = gentle ? 5 : 3, undos = 3, sel = null, over = false;
    let slipAShown = false, slipBShown = false, modal = null, pulse = null, lastAct = performance.now();
    let moves = 0, history = [], fxHome = null, fxBad = null;
    const told = new Set();
    const t0 = performance.now();
    const timers = [], listeners = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const homeCount = () => Object.values(found).reduce((a, f) => a + f.length, 0);

    const snapshot = () => JSON.stringify({ cols, stock, waste, found, pass, turnsThisPass, peeked, moves });
    function restore(s) { const o = JSON.parse(s); cols = o.cols; stock = o.stock; waste = o.waste; found = o.found; pass = o.pass; turnsThisPass = o.turnsThisPass; peeked = o.peeked; moves = o.moves; }
    function remember() { history.push(snapshot()); if (history.length > 40) history.shift(); }

    // ---- rules
    const fits = (card, dst) => dst.length === 0 ? rank(card) === DEAL.top : (() => { const t = dst[dst.length - 1]; return t.up && rank(t.c) === rank(card) + 1 && red(t.c) !== red(card); })();
    const toFound = (card) => found[card[1]].length === rank(card) - 1;
    function flipTops() {
      cols.forEach((col, i) => {
        if (col.length && !col[col.length - 1].up) {
          col[col.length - 1].up = true;
          if (i === 5 && col.length === 1 && !slipBShown) { slipBShown = true; const r = REPLIES.find((x) => x.id === replied); if (DEAL.slipB.dotted) showSlip(DEAL.slipB, NOTES.dotted); else if (r) { mark(shared, "ledger"); showSlip(r.card, NOTES.answer + " Under it, copied small in the same hand: “400 · linen room · night auditor. Booked W.” A seventh line, out of the booking ledger."); } else showSlip(DEAL.slipB, NOTES.slipB); }
        }
      });
    }
    function legalMoves() {
      const out = [];
      const w = waste[waste.length - 1];
      if (w) {
        if (toFound(w.c)) out.push({ from: "w", to: "F" });
        cols.forEach((d, j) => { if (fits(w.c, d)) out.push({ from: "w", to: j }); });
      }
      cols.forEach((col, i) => {
        if (!col.length) return;
        const top = col[col.length - 1];
        if (toFound(top.c)) out.push({ from: i, idx: col.length - 1, to: "F" });
        const first = col.findIndex((x) => x.up);
        for (let k = first; k < col.length; k++) {
          cols.forEach((d, j) => {
            if (j === i || !fits(col[k].c, d)) return;
            if (k === 0 && d.length === 0) return;
            out.push({ from: i, idx: k, to: j });
          });
        }
      });
      return out;
    }
    const canDraw = () => stock.length > 0 || (waste.length > 0 && pass < DEAL.passes);

    function draw() {
      if (over || modal) return;
      if (stock.length === 0) {
        if (waste.length && pass < DEAL.passes) { remember(); stock = waste.map((x) => x.c); waste = []; pass++; turnsThisPass = 0; peeked = false; peekShow = false; tell(NOTES.pass + (isFinite(DEAL.passes) ? ` Pass ${pass} of ${DEAL.passes}.` : "")); }
        act(); return;
      }
      remember();
      turnsThisPass++;
      peekShow = false;
      waste.push({ c: stock.shift(), up: true });
      if (DEAL.slipA && pass === 1 && turnsThisPass === DEAL.slipA.at && !slipAShown) { slipAShown = true; showSlip(DEAL.slipA, NOTES.slipA); if (stage.stage === 1) unlock("reply", ""); }
      unlock("peek", "PEEK (P): once a pass, see the next stock card without turning it.");
      act();
    }
    function moveTo(src, dst) {
      let cards;
      if (src.from === "w") { const w = waste[waste.length - 1]; if (!w) return false; cards = [w]; }
      else { const col = cols[src.from]; if (!col[src.idx] || !col[src.idx].up) return false; cards = col.slice(src.idx); }
      if (dst === "F") {
        if (cards.length !== 1 || !toFound(cards[0].c)) return false;
        remember();
        found[cards[0].c[1]].push(cards[0].c);
        fxHome = cards[0].c[1];
      } else {
        if (!fits(cards[0].c, cols[dst])) return false;
        remember();
        cols[dst].push(...cards);
      }
      if (src.from === "w") waste.pop(); else cols[src.from].splice(src.idx);
      moves++;
      flipTops();
      unlock("undo", "UNDO (U): three times tonight, put back your last move.");
      return true;
    }
    function act() {
      sel = null; pulse = null; lastAct = performance.now();
      if (!stock.length && !waste.length && cols.every((c) => c.every((x) => x.up))) {
        let any = true;
        while (any) { any = false; cols.forEach((c, i) => { if (c.length && toFound(c[c.length - 1].c)) { found[c[c.length - 1].c[1]].push(c.pop().c); any = true; } }); }
      }
      // quiet columns: a column cleared under a room number, before the bell (read by the eye at the hole)
      cols.forEach((c, i) => { const r = "r40" + (i + 1); if (!c.length && !told.has("q" + i) && !over) { told.add("q" + i); if (!quiet[r]) { quiet[r] = true; shared.set("quiet", quiet); } if (!modal) tell(NOTES.quiet(r.slice(1))); } });
      if (homeCount() >= TOTAL / 2 && !told.has("half")) { told.add("half"); tell(NOTES.half); }
      layout();
      checkEnd();
    }
    function bad() { fxBad = performance.now(); layout(); }
    function checkEnd() {
      if (over || modal) return;
      const n = homeCount();
      if (n === TOTAL) {
        over = true;
        api.store.set("wins", api.store.get("wins", 0) + 1); api.store.set("lossStreak", 0);
        const q = Object.keys(quiet).filter((r) => told.has("q" + (+r.slice(3) - 1))).map((r) => r.slice(1));
        const tail = stage.stage === 2 ? "Fenn's card had the nick in its rose; the other hand's did not. And under column six, a brass dot that nobody in this deck painted." : `On the spike, ${spike.length} cards from another deck${replied ? ", and one of the hotel's own, in your hand, answered" : ""}.`;
        later(() => api.end({ outcome: "win", text: `All ${TOTAL} home in ${moves} moves, before the first bell. ${tail}${q.length ? ` Quiet columns: ${q.join(", ")}.` : ""}` }), 700);
      } else if (!canDraw() && !legalMoves().length) {
        over = true;
        api.store.set("lossStreak", streak + 1);
        later(() => api.end({ outcome: "lose", text: `The passes are spent and nothing moves: ${n} of ${TOTAL} home. On the spike, ${spike.length} slipped card${spike.length === 1 ? "" : "s"}${slipBShown ? "" : "; whatever lay under the sixth column stays there"}. The first bell will ring soon.` }), 700);
      }
    }
    function showSlip(s, line) {
      spike.push(s);
      modal = document.createElement("div");
      modal.className = P + "big" + (RM ? "" : " in");
      if (art.has(slipId(s))) {
        // the back first (the rose with one petal nicked), then its face
        const bk = s.dotted ? "back-hotel" : "back-fenn", back = art.has(bk) && !RM;
        modal.innerHTML = `<div class="art"><img alt="" src="${art.url(back ? bk : slipId(s))}"><small>${s.dotted ? "A HOTEL CARD · UNDER COLUMN SIX" : `CARD ${s.no} · FROM ANOTHER DECK · TO THE SPIKE`}</small></div>`;
        const im = modal.querySelector("img"); im.alt = s.text;
        if (back) later(() => { im.src = art.url(slipId(s)); }, 700);
      } else {
        modal.innerHTML = `<div><span></span><small>CARD ${s.no} · FROM ANOTHER DECK · TO THE SPIKE</small></div>`;
        modal.querySelector("span").textContent = s.text;
      }
      felt.appendChild(modal);
      later(() => { if (modal) { modal.remove(); modal = null; tell(line); layout(); checkEnd(); } }, RM ? 2200 : 3000);
    }
    const unlocked = new Set();
    function unlock(a, text) {
      if (unlocked.has(a)) return; unlocked.add(a);
      const b = hud.querySelector(`[data-b="${a}"]`); if (b) { b.hidden = false; b.classList.add("new"); later(() => b.classList.remove("new"), 3200); }
      if (text && !modal) tell(text);
    }

    // ---- input
    function clickCard(where, i, idx) {
      if (over || modal) return;
      if (where === "stock") { draw(); return; }
      if (where === "found") { if (sel) { if (moveTo(sel, "F")) act(); else { bad(); sel = null; layout(); } } return; }
      if (where === "waste") {
        if (sel && sel.from === "w") { if (moveTo(sel, "F")) act(); else { sel = null; layout(); } return; }
        if (waste.length) { sel = { from: "w" }; layout(); }
        return;
      }
      if (where === "col") {
        const col = cols[i];
        if (sel) {
          if (sel.from === i) {
            if (sel.idx === col.length - 1 && moveTo(sel, "F")) { act(); return; }
            sel = null; layout(); return;
          }
          if (tryInto(sel, i)) { act(); return; }
          bad(); sel = null; layout(); return;
        }
        if (idx != null && col[idx] && col[idx].up) { sel = { from: i, idx }; layout(); }
        else { sel = null; layout(); }
      }
    }
    function tryInto(s, j) {
      if (s.from === "w") return moveTo(s, j);
      const col = cols[s.from];
      if (moveTo(s, j)) return true;
      for (let k = col.findIndex((x) => x.up); k < col.length; k++) if (moveTo({ from: s.from, idx: k }, j)) return true;
      return false;
    }
    function doPeek() { if (over || modal || peeked || !stock.length || !unlocked.has("peek")) return; peeked = true; peekShow = true; lastAct = performance.now(); layout(); }
    function doHint() {
      if (over || modal || hints <= 0) return;
      hints--; pulse = legalMoves()[0] || (canDraw() ? { from: "stock" } : null); lastAct = performance.now(); layout();
    }
    function doUndo() {
      if (over || modal || undos <= 0 || !history.length || !unlocked.has("undo")) return;
      undos--; restore(history.pop()); sel = null; pulse = null; layout();
    }

    // ---- layout
    function layout() {
      felt.querySelectorAll(`.${P}card,.${P}slot,.${P}plate`).forEach((e) => e.remove());
      const W = felt.clientWidth, H = felt.clientHeight;
      const narrow = W < 640;
      const gap = Math.max(6, Math.min(16, W * 0.012));
      let cw = Math.min(104, (W - 32 - 6 * gap) / 7, (H - (narrow ? 190 : 140)) / 4.4);
      cw = Math.max(40, cw);
      const ch = cw * 1.4;
      const left = (W - (7 * cw + 6 * gap)) / 2;
      const x = (slot) => left + slot * (cw + gap);
      const yTop = narrow ? 40 : 22, yCols = yTop + ch + 34;
      felt.style.setProperty("--fs", Math.max(12, cw * 0.2) + "px");
      const mk = (cls, l, t, attrs = {}) => {
        const d = document.createElement("div");
        d.className = cls; d.style.left = l + "px"; d.style.top = t + "px"; d.style.width = cw + "px"; d.style.height = ch + "px";
        for (const k in attrs) d.dataset[k] = attrs[k];
        felt.appendChild(d); return d;
      };
      const face = (card, l, t, attrs) => {
        if (art.has(deckId(card))) {
          const d = mk(`${P}card ${P}face art`, l, t, attrs);
          d.style.backgroundImage = `url(${art.url(deckId(card))})`; d.setAttribute("role", "img"); d.setAttribute("aria-label", label(card));
          // on a small card the art's own index is too fine to read: set it again, larger
          if (cw < 66) { const ix = document.createElement("span"); ix.className = "ix" + (red(card) ? " r" : ""); ix.textContent = label(card); d.appendChild(ix); }
          return d;
        }
        const d = mk(`${P}card ${P}face${red(card) ? " r" : ""}`, l, t, attrs);
        d.innerHTML = `<span class="c">${label(card).replace(/(.)$/, "<br>$1")}</span><span class="m" style="background-image:${FAN(red(card) ? "#a3302a" : "#b8913f")}"></span><span class="s">${SUITS[card[1]]}</span>`;
        d.setAttribute("aria-label", label(card));
        return d;
      };
      const BACK = art.has("back-hotel") ? ` art` : "";
      const backOf = (d) => { if (BACK) d.style.backgroundImage = `url(${art.url("back-hotel")})`; return d; };
      const isPulse = (m) => pulse && Object.keys(m).every((k) => pulse[k] === m[k]);
      const badNow = fxBad && performance.now() - fxBad < 400 && !RM;
      if (stock.length) { const b = backOf(mk(`${P}card ${P}back${BACK}`, x(0), yTop, { w: "stock" })); if (pulse && pulse.from === "stock") b.classList.add(P + "pulse"); }
      else { const s = mk(`${P}slot`, x(0), yTop, { w: "stock" }); s.textContent = pass < DEAL.passes && waste.length ? "↺" : "×"; s.style.cursor = "pointer"; }
      if (waste.length) {
        if (waste.length > 1) face(waste[waste.length - 2].c, x(1), yTop, { w: "waste" });
        const d = face(waste[waste.length - 1].c, x(1), yTop, { w: "waste" });
        if (sel && sel.from === "w") d.classList.add(P + "sel");
        if (pulse && pulse.from === "w") d.classList.add(P + "pulse");
      } else mk(`${P}slot`, x(1), yTop, { w: "waste" });
      if (peekShow && stock.length) { const d = face(stock[0], x(0) + cw * 0.18, yTop + ch * 0.32, { w: "stock" }); d.style.opacity = 0.88; d.style.transform = "rotate(-6deg)"; }
      const sp = mk(`${P}slot`, x(2), yTop, { w: "spike" }); sp.textContent = "⟟"; sp.title = "The spike: tap to read";
      spike.forEach((s, i) => { const d = mk(`${P}card ${P}slip`, x(2) + cw * 0.1 + i * 4, yTop + ch * 0.1 + i * 6, { w: "spike", n: i }); d.style.width = cw * 0.8 + "px"; d.style.height = ch * 0.8 + "px"; if (art.has(slipId(s))) { d.classList.add("art"); d.style.backgroundImage = `url(${art.url(slipId(s))})`; d.setAttribute("aria-label", s.text); } else d.textContent = s.text; });
      ["S", "H", "D", "C"].forEach((s, i) => {
        const f = found[s];
        if (f.length) { const d = face(f[f.length - 1], x(3 + i), yTop, { w: "found" }); if (fxHome === s && !RM) d.classList.add(P + "home"); }
        else { const sl = mk(`${P}slot`, x(3 + i), yTop, { w: "found" }); sl.textContent = SUITS[s]; }
        if (pulse && pulse.to === "F") { /* the pulsing source card shows the move */ }
      });
      fxHome = null;
      const avail = H - yCols - (narrow ? 120 : 70);
      cols.forEach((col, i) => {
        const pl = document.createElement("div");
        pl.className = P + "plate"; pl.textContent = "40" + (i + 1);
        pl.style.left = x(i) + cw * 0.2 + "px"; pl.style.width = cw * 0.6 + "px"; pl.style.top = yCols - 22 + "px";
        if (art.has("ui-number-plates") && cw >= 60) { pl.classList.add("art"); pl.style.backgroundImage = `url(${art.url("ui-number-plates")})`; pl.style.backgroundPosition = `${(i % 3) * 50}% ${Math.floor(i / 3) * 100}%`; pl.style.height = cw * 0.6 * 0.4 + "px"; pl.style.top = yCols - cw * 0.6 * 0.4 - 4 + "px"; }
        felt.appendChild(pl);
        if (!col.length) { mk(`${P}slot`, x(i), yCols, { w: "col", i, idx: "" }).textContent = RANKS[DEAL.top - 1] === "T" ? "10" : RANKS[DEAL.top - 1]; return; }
        let dDown = ch * 0.16, dUp = ch * 0.27;
        const need = col.reduce((a, c, k) => a + (k === col.length - 1 ? 0 : c.up ? dUp : dDown), 0);
        if (need > avail - ch && need > 0) { const f = Math.max(0.3, (avail - ch) / need); dDown *= f; dUp *= f; }
        let y = yCols;
        col.forEach((c, k) => {
          const d = c.up ? face(c.c, x(i), y, { w: "col", i, idx: k }) : backOf(mk(`${P}card ${P}back${BACK}`, x(i), y, { w: "col", i, idx: k }));
          if (sel && sel.from === i && k >= sel.idx) { d.classList.add(P + "sel"); if (badNow) d.classList.add(P + "bad"); }
          if (isPulse({ from: i, idx: k })) d.classList.add(P + "pulse");
          y += c.up ? dUp : dDown;
        });
      });
      if (narrow) { hud.style.left = "12px"; hud.style.right = "12px"; hud.style.top = "auto"; hud.style.bottom = "12px"; hud.style.width = "auto"; story.style.bottom = "118px"; }
      else { hud.style.left = x(6) + "px"; hud.style.top = yCols + "px"; hud.style.width = cw + 20 + "px"; hud.style.right = "auto"; hud.style.bottom = "auto"; story.style.bottom = "14px"; }
      passEl.textContent = `PASS ${pass}${isFinite(DEAL.passes) ? "/" + DEAL.passes : ""} · STOCK ${stock.length}`;
      hintBtn.textContent = `HINT ${hints}`; hintBtn.disabled = hints <= 0;
      undoBtn.textContent = `UNDO ${undos}`; undoBtn.disabled = undos <= 0 || !history.length;
      peekBtn.disabled = peeked || !stock.length;
      homeEl.textContent = `HOME ${homeCount()}/${TOTAL}`;
    }

    const hud = document.createElement("div");
    hud.className = P + "hud";
    hud.innerHTML = `<span class="pass"></span><span class="home"></span><button type="button" class="${P}btn" data-b="peek" hidden>PEEK · P</button><button type="button" class="${P}btn" data-b="hint">HINT</button><button type="button" class="${P}btn" data-b="undo" hidden>UNDO</button><button type="button" class="${P}btn" data-b="reply" hidden>REPLY · R</button><button type="button" class="${P}btn" data-b="fold">FOLD</button>`;
    felt.appendChild(hud);
    const passEl = hud.querySelector(".pass"), homeEl = hud.querySelector(".home"), peekBtn = hud.querySelector('[data-b="peek"]'), hintBtn = hud.querySelector('[data-b="hint"]'), undoBtn = hud.querySelector('[data-b="undo"]');
    const clock = document.createElement("div");
    clock.className = P + "fl";
    felt.appendChild(clock);

    // reply cards: one of three questions, in your hand, on one of the hotel's own cards, left on the spike
    function doReply() {
      if (over || modal || replied || stage.stage !== 1 || !unlocked.has("reply")) return;
      const m = document.createElement("div"); m.className = P + "big"; modal = m;
      m.innerHTML = `<div class="art many">${REPLIES.map((r) => `<button type="button" data-r="${r.id}" style="border:0;padding:0;background:none;cursor:pointer">${art.has("reply-" + r.id) ? `<img alt="${r.ask}" src="${art.url("reply-" + r.id)}">` : `<span style="display:block;background:#fbfbf7;color:#2a1a10;padding:26px 14px;border-radius:8px;font:italic 20px Georgia,serif">${r.ask}</span>`}</button>`).join("")}<small>WRITE ONE ON A HOTEL CARD AND LEAVE IT ON THE SPIKE · ESC TO KEEP THE PEN CAPPED</small></div>`;
      const close = () => { m.remove(); modal = null; layout(); };
      m.querySelectorAll("button").forEach((b) => on(b, "click", () => { const r = REPLIES.find((x) => x.id === b.dataset.r); replied = r.id; shared.set("reply", r.id); spike.push({ no: "yours", text: r.ask, reply: r.id }); hud.querySelector('[data-b="reply"]').hidden = true; close(); tell(`“${r.ask}” In your own hand, on the spike, where the other hand will find it.`); }));
      on(m, "pointerdown", (e) => { if (e.target === m) close(); });
      m.dataset.reply = "1";
      felt.appendChild(m); m.querySelector("button").focus();
    }
    on(hud.querySelector('[data-b="reply"]'), "click", doReply);
    on(peekBtn, "click", doPeek);
    on(hintBtn, "click", doHint);
    on(undoBtn, "click", doUndo);
    on(hud.querySelector('[data-b="fold"]'), "click", () => {
      if (over) return;
      over = true;
      const n = homeCount();
      api.end({ outcome: "done", text: `You fold at ${n} of ${TOTAL} and leave the deal as it lies; it will keep until 05:00. The spike holds ${spike.length} slipped card${spike.length === 1 ? "" : "s"}.` });
    });
    on(felt, "pointerdown", (e) => {
      const d = e.target.closest(`.${P}card,.${P}slot`);
      if (!d || !felt.contains(d) || d.closest(`.${P}hud`)) return;
      const w = d.dataset.w;
      if (w === "spike") {
        if (spike.length) { const m = document.createElement("div"); m.className = P + "big"; if (spike.every((x) => art.has(slipId(x)))) { m.innerHTML = `<div class="art${spike.length > 1 ? " many" : ""}">${spike.map((x) => `<img alt="" src="${art.url(slipId(x))}">`).join("")}<small>THE SPIKE · TAP TO CLOSE</small></div>`; m.querySelectorAll("img").forEach((im, k) => { im.alt = spike[k].text; }); } else { m.innerHTML = `<div><span></span><small>THE SPIKE · TAP TO CLOSE</small></div>`; m.querySelector("span").textContent = spike.map((x) => x.text).join(" / "); } if (stage.stage === 2) { m.innerHTML = `<div class="art many">${spike.map((x, k) => `<button type="button" data-k="${k}" style="border:0;padding:0;background:none;cursor:pointer;width:min(158px,42vw)">${x.dotted ? `<img alt="" src="${art.url("card-dotted")}">` : `<span data-f style="display:grid;place-items:center;aspect-ratio:5/7;background:#fbfbf7;color:#2a1a10;border-radius:8px;padding:10px;box-sizing:border-box;font:16px/1.25 'Bradley Hand','Segoe Print',cursive;box-shadow:0 6px 20px #000">${x.text}</span>`}</button>`).join("")}<small>THE SPIKE · TAP A CARD TO TURN IT OVER · TAP OUTSIDE TO CLOSE</small></div>`; m.querySelectorAll("button").forEach((b) => on(b, "click", () => { const x = spike[+b.dataset.k], sp = b.querySelector("[data-f]"); if (!sp || !x.back) return; if (sp.dataset.back) { delete sp.dataset.back; sp.style.backgroundImage = ""; sp.textContent = x.text; } else { sp.dataset.back = x.fenn ? "nicked" : "whole"; sp.textContent = art.has(x.back) ? "" : x.fenn ? "(the rose, one petal nicked)" : "(the rose, whole)"; if (art.has(x.back)) { sp.style.backgroundImage = `url(${art.url(x.back)})`; sp.style.backgroundSize = "100% 100%"; } sp.setAttribute("aria-label", x.fenn ? "The back: the rose, one petal nicked" : "The back: the rose, whole"); if (!told.has("backs")) { told.add("backs"); tell(x.fenn ? "One petal nicked: Fenn's deck." : "A whole rose. This card was never in Fenn's deck."); } } })); on(m, "pointerdown", (e) => { if (e.target === m) m.remove(); }); } else on(m, "pointerdown", () => m.remove()); felt.appendChild(m); }
        return;
      }
      clickCard(w, d.dataset.i != null ? +d.dataset.i : null, d.dataset.idx !== "" && d.dataset.idx != null ? +d.dataset.idx : null);
    });
    // keys: a column digit picks its top card; the same digit again reaches one card further up the
    // run; another digit moves the selection there; F sends it home; W picks the waste.
    on(window, "keydown", (e) => {
      if (felt.querySelector(`.${P}intro`) || over || (modal && !(e.key === "Escape"))) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "d") { e.preventDefault(); draw(); }
      else if (k === "w") clickCard("waste");
      else if (k === "f") clickCard("found");
      else if (k === "p") doPeek();
      else if (k === "h") doHint();
      else if (k === "u") doUndo();
      else if (k === "r") doReply();
      else if (k === "escape") { if (modal && modal.dataset.reply) { modal.remove(); modal = null; } sel = null; layout(); }
      else if (/^[1-6]$/.test(k)) {
        const i = +k - 1, col = cols[i];
        if (sel && sel.from === i) {
          const first = col.findIndex((x) => x.up);
          if (sel.idx > first) { sel = { from: i, idx: sel.idx - 1 }; layout(); }
          else { sel = { from: i, idx: col.length - 1 }; layout(); }
          return;
        }
        if (sel) { clickCard("col", i, null); return; }
        if (col.length && col[col.length - 1].up) clickCard("col", i, col.length - 1);
      }
    });
    const ro = new ResizeObserver(() => layout());
    ro.observe(felt);

    let raf = 0;
    const tick = (now) => {
      const gm = Math.floor(((now - t0) / 1000) * 10 / 60);
      const h = (23 + Math.floor(gm / 60)) % 24, m = gm % 60;
      clock.textContent = `◷ ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (!over && !modal && !pulse && now - lastAct > 20000) { const lm = legalMoves()[0]; pulse = lm || (canDraw() ? { from: "stock" } : null); layout(); }
      if (now - storyT > 7000) story.style.opacity = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}deco">${art.has("chapter-n" + DEAL.night) ? `<img class="ch" alt="Night ${DEAL.night}" src="${art.url("chapter-n" + DEAL.night)}">` : ""}${art.has("ui-deco-divider") ? `<img class="dv" alt="" src="${art.url("ui-deco-divider")}">` : `<div class="fan"></div>`}<h2>Night Patience</h2>
      <p class="goal"></p>
      <p class="open"></p>
      <dl>
        <dt>MOVE</dt><dd>tap a card, then where it goes; down in alternate colours. Keys 1–6, W, F.</dd>
        <dt>DRAW</dt><dd>tap the stock or Space. ${isFinite(DEAL.passes) ? (DEAL.passes === 1 ? "One pass." : "Two passes.") : "Any number of passes."}</dd>
        ${stage.stage === 1 ? "<dt>REPLY</dt><dd>after the first stranger's card: R, and choose what to ask.</dd>" : stage.stage === 2 ? "<dt>SPIKE</dt><dd>tap it, then tap a card to see its back.</dd>" : ""}
        <dt>HOME</dt><dd>tap a top card twice, or F.</dd>
      </dl>
      ${streak >= 2 ? `<label><input type="checkbox" ${gentle ? "checked" : ""}> five hints tonight</label>` : ""}
      <button type="button" class="${P}btn">DEAL</button></div>`;
    intro.querySelector(".open").textContent = DEAL.open; intro.querySelector(".goal").textContent = DEAL.goal;
    intro.querySelector("dl").after(stage.row(P + "btn"));
    felt.appendChild(intro);
    const gbox = intro.querySelector("input");
    if (gbox) on(gbox, "change", () => { gentle = gbox.checked; api.store.set("gentle", gentle); hints = gentle ? 5 : 3; layout(); });
    const startBtn = [...intro.querySelectorAll("button")].pop();
    on(startBtn, "click", () => { intro.remove(); lastAct = performance.now(); layout(); tell(stage.stage === 2 ? "Two cards on the spike, and they cannot both be right. Look at their backs." : SECOND && OWN && stage.stage === 0 ? `On the spike, with his two, one of the hotel's own cards in your hand: “${OWN.ask}” You have not written it yet this season.` : "Someone keeps slipping cards into this deck."); });
    layout();
    startBtn.focus();

    return {
      unmount() {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        ro.disconnect();
        for (const [el, ev, fn, o] of listeners) el.removeEventListener(ev, fn, o);
        root.innerHTML = "";
      },
    };
}, { vii: "right:8px;top:8px" });

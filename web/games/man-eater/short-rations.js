// Project: Man Eater — Short Rations (1D, trick-taking). Graphic style: stencilled ration-issue cards.
// DESIGN.md section 11.1, cut to one evening: d4_rations, four seats (Fisk, Jax, Kimura, Hollis),
// 32 cards, two hands. Trumps are the dealer's suit; bid 0 to 8, the dealer may not make the bids
// add up to 8; follow suit; only exact bidders take a loaf, and the basket holds one fewer than the
// seats. Jax taps once per card above 5 he holds in the led suit. Pell's and Duarte's chairs are
// pushed in and their suits are stamped withdrawn. Table lines are the crew's lines from DESIGN.md 6.
//
// Phase 1 of the accepted development: the withdrawn 8. Each empty chair's 8 stays in the deck,
// stamped WITHDRAWN, and is handed out face up after the deal (the dealer first, then his left). It
// follows no suit and wins nothing: the one clean way to duck a trick. Its holder has nine cards for
// eight tricks, and the one he never plays is burned.
// Art (api.art): the card faces, the back and the WITHDRAWN overprint; each seat's hands; the stamp.
//
// Actions: bid; play a card; watch Jax (read his taps before you play); settle each loaf won (keep,
// eat, or give to a seat). Phases: hand one (Hollis deals, Stars are trumps); hand two (you deal,
// Hands are trumps, and your bid may not make the table's add up to eight); the settling.

const P = { ink: "#1B1D1F", cream: "#D9D2BF", steel: "#8A8F93", green: "#5E7363", sodium: "#D9A441", card: "#e9e2cf", red: "#9b2f22" };
const SUITS = {
  hands: "M-.5-.1h1v.9h-1z M-.5-.85h.2v.8h-.2z M-.23-.85h.2v.8h-.2z M.04-.85h.2v.8h-.2z M.31-.85h.2v.8h-.2z M.45.2L.85-.3L.95-.15L.5.5z",
  keys: "M-.45 0m-.42 0a.42 .42 0 1 0 .84 0a.42 .42 0 1 0-.84 0 M-.1-.1h1v.2h-1z M.55 0h.15v.35h-.15z M.8 0h.15v.25h-.15z",
  anchors: "M-.08-.8h.16v1.5h-.16z M-.45-.55h.9v.14h-.9z M-.8.1Q0 1.2 .8.1L.6.25Q0 .85-.6.25z",
  houses: "M-.8-.1L0-.85L.8-.1z M-.6-.05h1.2v.85h-1.2z",
  sparks: "M.2-1L-.5.1H-.05L-.25 1L.5-.15H.05z",
  stars: "M0-1L.24-.33L.95-.31L.39.12L.59.81L0 .41L-.59.81L-.39.12L-.95-.31L-.24-.33z",
};
const SEATS = [
  { name: "Fisk", suit: "hands", pos: "s" },
  { name: "Jax", suit: "keys", pos: "w" },
  { name: "Kimura", suit: "sparks", pos: "n" },
  { name: "Hollis", suit: "stars", pos: "e" },
];
const EMPTY = [{ name: "Pell", suit: "anchors", pos: "nw" }, { name: "Duarte", suit: "houses", pos: "ne" }];
// the crew's own lines (DESIGN.md section 6 and 11.1), one per hand
const LINES = { 1: ["", ""], 2: ["Nothing goes out. Everything comes in.", ""], 3: ["Next week. I mean it.", "Next week. I mean it."] };

//
// Phase 2 (the ladder; DEEP_DIVE.md section 3, DESIGN.md 11.1 rules 9 and 10). Three stages:
//   teach, day 2: four at the table, no withdrawn cards, the tracker and a pencil count; bid exact.
//   test, day 4: the evening above; the tracker goes in the second hand; one of the three loaves is
//     wrapped in a white napkin (the staff loaf: nobody at the table takes it, and Fisk may).
//   twist, day 6: open hands. Two seats, sixteen cards and the four withdrawn 8s, all face up, one
//     loaf, a fixed deal. Fisk deals, so the two bids cannot add up to eight: only one man can be
//     exact. Turned over: the hand is won by playing so that Jax makes his bid. Jax taps anyway.
//     The deal has 170,592 lines of play; 3,672 of them (2%) give Jax the loaf. One is in WIN_LINE.
// Layer links (api.shared): the staff loaf, and a loaf given to Hollis, change the gaze in The Tray;
// a loaf given away is an entry the Chart's twist can use.
import { artKit, ladder, week } from "./kit.js";

const NAMES = { 1: "Day 2 · bid exact", 2: "Day 4 · the deck shrinks", 3: "Day 6 · open hands" };
const OPEN = { fisk: "h1 h8 k1 k2 k3 k4 k7 k8", jax: "h2 h3 h4 h5 h6 h7 k5 k6" };
const WIN_LINE = "k8 h8 h1 k7 k4 k3 k2 k1"; // Fisk's eight cards, in order, against Jax's bid of 3

const suitSvg = (s, cls, fill = P.ink) => `<svg class="${cls}" viewBox="-1.1 -1.1 2.2 2.2" aria-hidden="true"><path d="${SUITS[s]}" fill="${fill}"/></svg>`;

export default {
  mount(root, api) {
    const lad = ladder(api, NAMES);
    let cur = null;
    const go = (n) => { if (cur) cur.unmount(); cur = run(n); };
    go(lad.reached());
    return { unmount() { if (cur) cur.unmount(); cur = null; lad.dispose(); } };

    function run(stage) {
    const teach = stage === 1, twist = stage === 3, sh = api.shared;
    const PLAYERS = twist ? [0, 1] : [0, 1, 2, 3], N = PLAYERS.length;
    const nextP = (p) => PLAYERS[(PLAYERS.indexOf(p) + 1) % N];
    const GONE = teach ? [] : twist ? [...EMPTY, { ...SEATS[2], pos: "n" }, { ...SEATS[3], pos: "e" }] : EMPTY;
    const HANDS = twist ? 1 : 2, DAY = teach ? 2 : twist ? 6 : 4;
    const K = "man-eater-short-rations-";
    const reduce = api.reducedMotion;
    const rng = api.rng();
    const losses = api.store.get("losses", 0);
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, reduce ? Math.min(ms, 250) : ms); timers.push(t); return t; };
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;overflow-x:hidden;background:radial-gradient(ellipse at 50% 45%,#2b302d 0%,${P.ink} 70%);color:${P.cream};font-family:'Courier Prime','Courier New',monospace}
      .${K}stage{position:relative;min-height:100%;display:grid;grid-template-rows:auto 1fr auto;gap:4px;padding:8px 16px 10px;box-sizing:border-box;max-width:1100px;margin:0 auto}
      .${K}top{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:start}
      .${K}box{background:rgba(27,29,31,.9);border:1px solid rgba(217,210,191,.35);padding:8px 10px;font-size:13px;line-height:1.45;min-width:0}
      .${K}box h4{margin:0 0 4px;font-family:'Stardos Stencil',monospace;letter-spacing:.2em;font-size:12px;color:${P.sodium}}
      .${K}box svg{width:13px;height:13px;vertical-align:-2px;margin-right:4px}
      .${K}bidrow{display:flex;justify-content:space-between;gap:8px}
      .${K}bidrow.me{color:#fff;font-weight:700}
      .${K}trk{display:grid;grid-template-columns:auto repeat(8,1fr);gap:1px 3px;font-size:12px;text-align:center}
      .${K}trk s{opacity:.3}
      .${K}tracker{justify-self:end;width:100%;max-width:240px;box-sizing:border-box}
      .${K}need{margin-top:6px;padding:4px 6px;border:1px dashed ${P.sodium};color:${P.sodium};font-weight:700;font-size:13px}
      .${K}table{position:relative;width:max(260px,min(92vw,520px,calc(100vh - 430px)));aspect-ratio:1;margin:6px auto;border-radius:50%;background:radial-gradient(circle at 50% 45%,${P.green},#3d4c41 70%,#2c362f);box-shadow:inset 0 0 0 10px #2a2f2b,inset 0 0 40px rgba(0,0,0,.6),0 20px 40px rgba(0,0,0,.5)}
      .${K}table::before{content:"";position:absolute;inset:10px;border-radius:50%;background-image:radial-gradient(rgba(0,0,0,.12) 1px,transparent 1.4px);background-size:4px 4px;pointer-events:none}
      .${K}seat{position:absolute;transform:translate(-50%,-50%);text-align:center;font-size:13px;width:128px;pointer-events:none}
      .${K}seat .n{font-family:'Stardos Stencil',monospace;font-weight:700;letter-spacing:.12em;font-size:14px;text-transform:uppercase;background:${P.ink};padding:3px 8px;display:inline-block;border:1px solid rgba(217,210,191,.45)}
      .${K}seat .n svg{width:13px;height:13px;vertical-align:-2px;margin-right:4px}
      .${K}seat.turn .n{border-color:${P.sodium};color:${P.sodium};box-shadow:0 0 0 2px ${P.sodium}}
      .${K}seat .b{display:block;white-space:nowrap;margin-top:3px;font-size:13px;background:rgba(27,29,31,.6);padding:0 4px}
      .${K}seat .c{display:block;margin-top:2px;font-size:13px;font-style:italic;color:#f1ebd9;min-height:1.3em;text-shadow:0 1px 2px #000;line-height:1.3}
      .${K}seat .t{font-style:normal;letter-spacing:.2em;color:${P.sodium};font-weight:700}
      .${K}seat.empty .n{opacity:.45;background:transparent}
      .${K}seat .chair{width:44px;height:16px;margin:0 auto 4px;background:#2a2f2b;border:1px solid rgba(217,210,191,.25)}
      .${K}trick{position:absolute;inset:0;z-index:1}
      .${K}basket{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:26%;aspect-ratio:1.6;border-radius:50%;background:repeating-linear-gradient(35deg,#6b5536 0 4px,#5c482c 4px 8px);box-shadow:inset 0 0 0 5px #4d3b23;display:flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:3px}
      .${K}loaf{width:28%;aspect-ratio:1.5;border-radius:50% 50% 40% 40%;background:#c99a5b;box-shadow:inset 0 -3px 0 #9c7240;transition:transform .4s,opacity .4s}
      .${K}loaf.go{transform:translateY(160%) scale(.6);opacity:0}
      .${K}card{--w:clamp(46px,9.5vw,76px);width:var(--w);aspect-ratio:120/172;background:${P.card};color:${P.ink};border-radius:6px;box-shadow:2px 3px 0 rgba(0,0,0,.35);position:relative;border:1px solid #7b7258;box-sizing:border-box;padding:0;font:inherit;display:block;background-image:radial-gradient(ellipse at 30% 70%,rgba(183,171,138,.35) 0 8%,transparent 9%),radial-gradient(ellipse at 75% 25%,rgba(183,171,138,.3) 0 6%,transparent 7%),repeating-linear-gradient(90deg,rgba(123,114,88,.06) 0 1px,transparent 1px 3px)}
      .${K}card::before{content:"";position:absolute;inset:6%;border:1.5px dashed ${P.ink};border-radius:3px;opacity:.85}
      .${K}card .r{position:absolute;left:12%;top:5%;font-family:'Stardos Stencil',monospace;font-weight:700;font-size:calc(var(--w)*.38);line-height:1}
      .${K}card .s{position:absolute;left:28%;top:36%;width:44%;height:auto}
      .${K}card .l{position:absolute;left:0;right:0;bottom:8%;text-align:center;font-family:'Stardos Stencil',monospace;font-size:max(10px,calc(var(--w)*.14));letter-spacing:.04em;color:#4d4638;text-transform:uppercase}
      .${K}card.trump::after{content:"TRUMP";position:absolute;right:6%;top:6%;font-size:max(8px,calc(var(--w)*.1));font-weight:700;color:${P.red};letter-spacing:.04em;writing-mode:vertical-rl}
      .${K}trick .${K}card{position:absolute;transform:translate(-50%,-50%);--w:clamp(44px,8vw,64px);transition:box-shadow .2s,transform .3s}
      .${K}trick .${K}card.best{box-shadow:0 0 0 3px ${P.sodium},2px 3px 0 rgba(0,0,0,.35)}
      .${K}trick .${K}card.won{transform:translate(-50%,-50%) scale(1.12)}
      .${K}hand{display:flex;justify-content:center;flex-wrap:nowrap;padding:16px 0 4px;min-height:110px}
      .${K}hand.tremble{animation:${K}shake .18s infinite}
      @keyframes ${K}shake{0%{transform:translate(0,0)}25%{transform:translate(2px,-1px)}50%{transform:translate(-1px,1px)}75%{transform:translate(1px,2px)}100%{transform:translate(0,0)}}
      .${K}hand .${K}card{margin:0 -5px;cursor:pointer;transition:transform .12s,filter .12s}
      .${K}hand .${K}card[disabled]{cursor:not-allowed;filter:brightness(.55) grayscale(.4)}
      .${K}hand .${K}card:not([disabled]):hover,.${K}hand .${K}card:not([disabled]):focus-visible{transform:translateY(-14px);outline:none;box-shadow:0 0 0 3px ${P.sodium},2px 3px 0 rgba(0,0,0,.35);z-index:1}
      .${K}hand .${K}card.win::after{content:"";position:absolute;left:18%;right:18%;bottom:3%;height:3px;background:${P.red};opacity:.8}
      .${K}hand .${K}card.nope{animation:${K}nope .3s}
      @keyframes ${K}nope{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
      .${K}bar{display:block;min-height:46px;font-size:15px;text-align:center;line-height:1.4;padding:2px 0}
      .${K}bar button{margin:3px}
      .${K}bar b{color:#fff}
      .${K}bar button,.${K}cardin button,.${K}watch{font:inherit;font-weight:700;background:${P.cream};color:${P.ink};border:0;min-width:42px;min-height:42px;padding:6px 12px;cursor:pointer;font-size:15px}
      .${K}bar button:hover,.${K}cardin button:hover,.${K}watch:hover{background:#fff}
      .${K}bar button[disabled]{opacity:.25;cursor:not-allowed;text-decoration:line-through}
      .${K}bar button:focus-visible,.${K}cardin button:focus-visible,.${K}watch:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}watch{background:transparent;color:${P.cream};border:1.5px solid ${P.cream};font-size:14px}
      .${K}watch[aria-pressed=true]{background:${P.sodium};color:${P.ink};border-color:${P.sodium}}
      .${K}watch[hidden]{display:none}
      .${K}toast{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:'Stardos Stencil',monospace;font-size:22px;letter-spacing:.12em;padding:6px 14px;border:3px solid currentColor;color:${P.sodium};background:rgba(27,29,31,.85);pointer-events:none;z-index:3;white-space:nowrap}
      .${K}toast.bad{color:#d9826f}
      .${K}toast.in{animation:${K}stamp .5s ease-out}
      @keyframes ${K}stamp{0%{transform:translate(-50%,-50%) scale(1.8) rotate(-8deg);opacity:0}100%{transform:translate(-50%,-50%) scale(1) rotate(-4deg);opacity:1}}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,29,31,.86);z-index:5;padding:16px;overflow:auto}
      .${K}cardin{width:min(520px,100%);box-sizing:border-box;background:${P.card};color:${P.ink};padding:20px 22px;border:2px dashed ${P.ink};outline:10px solid ${P.card};position:relative;background-image:radial-gradient(ellipse at 80% 20%,rgba(183,171,138,.35) 0 10%,transparent 11%),repeating-linear-gradient(90deg,rgba(123,114,88,.05) 0 1px,transparent 1px 3px)}
      .${K}issue-no{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.2em;border-bottom:2px solid ${P.ink};padding-bottom:5px;margin-bottom:8px}
      .${K}cardin h2{margin:0 0 6px;font-family:'Stardos Stencil',monospace;font-size:clamp(28px,7vw,36px);letter-spacing:.08em;text-transform:uppercase;line-height:1}
      .${K}goal{margin:0 0 8px;font-size:16px;font-weight:700;line-height:1.35}
      .${K}beat{margin:0 0 10px;font-size:14px;line-height:1.45;font-style:italic}
      .${K}key{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 12px;font-size:14px;line-height:1.3}
      .${K}key dt{font-family:'Stardos Stencil',monospace;font-weight:700;letter-spacing:.08em;white-space:nowrap}
      .${K}key dd{margin:0}
      .${K}stamp{display:inline-block;border:2px solid ${P.red};color:${P.red};font-family:'Stardos Stencil',monospace;font-size:12px;padding:0 4px;transform:rotate(-8deg);letter-spacing:.1em}
      .${K}cardin .${K}stamp{position:absolute;right:20px;top:62px;font-size:14px}
      .${K}cardin [data-start]{background:${P.ink};color:${P.card};padding:10px 22px}.${K}cardin [data-start]:hover{background:#3a3d40}
      .${K}card.art{background-size:100% 100%;background-color:transparent;border-color:transparent;box-shadow:none;filter:drop-shadow(1px 2px 1px rgba(0,0,0,.4))}
      .${K}card.art::before,.${K}card.art>.r,.${K}card.art>.s,.${K}card.art>.l{display:none}
      .${K}card .wd{position:absolute;left:4%;right:4%;top:38%;text-align:center;font-family:'Stardos Stencil',monospace;font-size:max(8px,calc(var(--w)*.13));color:${P.red};border:1.5px solid ${P.red};transform:rotate(-14deg);letter-spacing:.02em;background:rgba(233,226,207,.8)}
      .${K}card.art>.wd{display:none}
      .${K}card.w8{filter:saturate(.7)}
      .${K}seat .hd{display:block;width:92px;height:auto;aspect-ratio:640/440;margin:0 auto 3px;border-radius:5px;box-shadow:0 2px 6px rgba(0,0,0,.5);opacity:.95}
      .${K}seat .bk{display:inline-block;vertical-align:middle;width:17px;height:24px;margin-left:5px;background:#3d4c41 var(--back,none) center/100% 100%;border-radius:2px;color:#fff;font-size:12px;line-height:24px;font-weight:700;text-shadow:0 1px 2px #000;font-style:normal}
      .${K}seat.empty .hd{filter:grayscale(1) brightness(.6);opacity:.6;width:64px}
      .${K}stampart{display:inline-block;height:26px;width:auto;vertical-align:middle;transform:rotate(-6deg)}
      .${K}cardin .${K}stampart{position:absolute;right:14px;top:56px;height:44px}
      .${K}suits{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin:0 0 10px}
      .${K}suits figure{margin:0;position:relative;text-align:center;font-size:11px;line-height:1.2;letter-spacing:.02em}
      .${K}suits img.h{display:block;width:100%;height:auto;aspect-ratio:640/440;border-radius:3px}
      .${K}suits figure.out img.h{filter:grayscale(1) brightness(.75)}
      .${K}suits figure.out::after{content:"";position:absolute;left:0;right:0;top:26%;border-top:2px solid ${P.red};transform:rotate(-12deg)}
      .${K}suits figure.not img.h{opacity:.45}
      .${K}new{color:${P.sodium};font-weight:700}
      .${K}loaf.staff{background:#f4f1e8;box-shadow:inset 0 -3px 0 #cfc8b6,0 0 0 1.5px ${P.ink}}
      .${K}open{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;align-items:center;margin:2px 0 0;font-size:12px;letter-spacing:.12em}
      .${K}open .${K}card{--w:clamp(26px,8.2vw,40px);box-shadow:1px 1px 0 rgba(0,0,0,.35)}
      .${K}open b{flex-basis:100%;text-align:center;font-family:'Stardos Stencil',monospace;color:${P.sodium};font-weight:400}
      .${K}hand .${K}card.keep{outline:2px dashed ${P.sodium};outline-offset:2px}
      .${K}cardin .new{border-left:4px solid ${P.red};padding-left:8px;margin:0 0 10px;font-size:14px;line-height:1.4}
      @media (max-width:640px){.${K}top{grid-template-columns:1fr 1fr}.${K}top>.${K}box:nth-child(2){display:none}.${K}tracker{justify-self:stretch;max-width:none}.${K}box{font-size:12px;padding:6px 8px}.${K}table{width:min(92vw,calc(100vh - 500px));min-width:250px}}
      @media (max-width:520px){.${K}stage{padding:8px 8px 10px}.${K}seat{width:112px}.${K}seat .hd{width:60px}.${K}seat.empty .hd{width:44px}.${K}suits figure{font-size:9px}.${K}seat .n{font-size:12px;padding:2px 5px}.${K}seat .b,.${K}seat .c{font-size:12px}
        .${K}hand{padding-top:14px}.${K}hand .${K}card{--w:calc((100vw - 20px) / var(--n,8) - 2px);margin:0 1px}.${K}hand .${K}card .s{top:40%}.${K}trk{font-size:12px}.${K}cardin .${K}stamp{display:none}}
    </style>
    <div class="${K}stage">
      <div class="${K}top">
        <div class="${K}box ${K}bids"><h4>BIDS · TAKEN</h4><div></div></div>
        <div class="${K}box" style="text-align:center"><h4>IN ISSUE</h4><div class="${K}issue"></div></div>
        <div class="${K}box ${K}tracker"><h4>TRACKER · PLAYED</h4><div class="${K}trk"></div></div>
      </div>
      <div>${twist ? `<div class="${K}open" aria-label="Jax's hand, face up"></div>` : ""}<div class="${K}table"><div class="${K}trick"></div><div class="${K}basket" aria-label="Bread basket"></div></div></div>
      <div><div class="${K}bar" aria-live="polite"></div><div style="text-align:center"><button type="button" class="${K}watch" aria-pressed="false" hidden>Watch Jax (W)</button></div><div class="${K}hand" role="group" aria-label="Your hand"></div></div>
    </div>
    <div class="${K}intro"><div class="${K}cardin">
      <div class="${K}issue-no"><span>RATION ISSUE · DAY ${DAY}</span><span>EVENING</span></div>
      ${teach ? "" : `<span class="${K}stamp" data-wdfb>${GONE.length} WITHDRAWN</span><img class="${K}stampart" data-wd alt="Withdrawn" hidden>`}
      <h2>Short Rations</h2>
      <p class="${K}goal">${twist ? "One loaf, two men, every card face up. Find the line of play that gives it to him." : "Take exactly as many tricks as you bid. Exact bidders get a loaf."}</p>
      <div class="${K}suits" aria-label="The seven suits, and who still sits behind each"></div>
      ${teach ? `<p class="${K}beat">Day 2. Jax has the first bunkmate's chair and his Keys. Pell and Duarte are on boiler duty tonight, so four of you play. The basket holds three loaves for four men, and Fisk keeps a pencil count.</p>`
      : twist ? `<p class="${K}beat">Day 6. Kimura's chair is pushed in. Hollis's was empty at breakfast. You deal, so your Hands are trumps, and both hands lie open on the table with the four withdrawn 8s. Jax bids first. He taps anyway.</p>
      <p class="new"><b>Turned over.</b> Until tonight you played to make your own bid. Tonight the dealer's bid may not make the two add up to eight, so only one of you can be exact, and you can see every card. Play so that Jax takes exactly what he bid.</p>`
      : `<p class="${K}beat">Four seats tonight. Pell's chair and Duarte's are pushed in and their suits are out of the deck, all but each man's 8. Those stay in, stamped WITHDRAWN: they follow no suit and win nothing. The basket holds three loaves for four men.</p>
      <p class="new"><b>New tonight.</b> One of the three loaves is wrapped in a white napkin: staff bread. Nobody at the table takes it. And in the second hand the count of played cards will not stay in your head.</p>`}
      <dl class="${K}key">
        <dt>BID</dt><dd>number keys, or the row of buttons: how many of the 8 tricks you will take</dd>
        <dt>PLAY</dt><dd>click a card, or ← → and Enter. Follow the led suit if you can; trumps beat everything</dd>
        ${teach ? "" : `<dt>DUCK</dt><dd>a WITHDRAWN 8 may be played on any trick, and loses it</dd>`}
      </dl>
      <button type="button" data-start>Deal</button>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const tableEl = $("table"), trickEl = $("trick"), basketEl = $("basket"), barEl = $("bar"), handEl = $("hand"), watchBtn = $("watch");
    const intro = $("intro");

    const POS = { s: [50, 88], w: [9, 50], n: [50, 8], e: [91, 50], nw: [20, 18], ne: [80, 18] };
    const TRICK_POS = [[50, 66], [29, 50], [50, 36], [71, 50]];
    const seatEls = [];
    for (const [i, st] of [...SEATS, ...EMPTY].entries()) {
      const gone = GONE.some((g) => g.name === st.name);
      if (i >= 4 && !gone) continue; // not at this table tonight
      const d = document.createElement("div");
      d.className = K + "seat" + (gone ? " " + K + "empty empty" : "");
      d.style.left = POS[st.pos][0] + "%"; d.style.top = POS[st.pos][1] + "%";
      const hd = i === 0 ? "" : `<img class="hd" data-hands="${st.name.toLowerCase()}" alt="" hidden>`;
      d.innerHTML = gone ? `${hd}<div class="chair"></div><span class="n">${suitSvg(st.suit, "", P.cream)}</span>` : `${st.pos === "n" ? "" : hd}<span class="n">${suitSvg(st.suit, "", P.cream)}${st.name}</span><span class="b"></span>${st.pos === "n" ? hd : ""}<span class="c"></span><span class="c t"></span>`;
      if (gone) d.querySelector(".n").setAttribute("aria-label", `${st.name}'s chair, pushed in`);
      tableEl.appendChild(d);
      if (i < 4) seatEls.push(d);
    }
    seatEls[0].style.top = "95%";

    // ---- art: faces are rasterised once, in the background, and cards switch to them as they arrive
    const kit = artKit(api);
    const faceUrl = {};
    const faceId = (c) => `card-${c.suit}-${c.rank}`;
    const dress = (el, c) => {
      const set = () => {
        const u = faceUrl[faceId(c)]; if (!u) return false;
        el.style.backgroundImage = c.wd && faceUrl.wd ? `url("${faceUrl.wd}"),url("${u}")` : `url("${u}")`;
        el.classList.add("art"); return true;
      };
      if (!set()) el.dataset.face = faceId(c);
    };
    const WD = GONE.map((e) => ({ suit: e.suit, rank: 8, wd: true, of: e.name }));
    (async () => {
      const want = [];
      for (const p of PLAYERS) for (let r = 1; r <= 8; r++) want.push(`card-${SEATS[p].suit}-${r}`);
      for (const c of WD) want.push(faceId(c));
      faceUrl.wd = await kit.png("card-withdrawn-overprint", 110);
      faceUrl.back = await kit.png("card-back", 40);
      if (faceUrl.back) wrap.style.setProperty("--back", `url("${faceUrl.back}")`);
      for (const id of want) {
        const u = await kit.png(id, 110);
        if (!u) continue;
        faceUrl[id] = u;
        wrap.querySelectorAll(`[data-face="${id}"]`).forEach((el) => { el.style.backgroundImage = /-8$/.test(id) && el.classList.contains("w8") && faceUrl.wd ? `url("${faceUrl.wd}"),url("${u}")` : `url("${u}")`; el.classList.add("art"); el.removeAttribute("data-face"); });
      }
    })();
    wrap.querySelectorAll("[data-hands]").forEach((im) => kit.png("hands-" + im.dataset.hands, 92).then((u) => { if (u) { im.src = u; im.hidden = false; } }));
    kit.png("stamp-withdrawn", 110).then((u) => { if (!u) return; wrap.dataset.wd = u; wrap.querySelectorAll("[data-wd]").forEach((im) => { im.src = u; im.hidden = false; }); wrap.querySelectorAll("[data-wdfb]").forEach((x) => x.remove()); });
    kit.dressIntro(intro, intro.querySelector("." + K + "cardin"), "chapter-" + (DAY + 1));
    lad.picker(intro.querySelector("." + K + "cardin"), intro.querySelector("[data-start]"), stage, go, P.ink, P.card);
    const wk = week(api);
    if (wk.second()) { const n = document.createElement("p"); n.dataset.week = wk.n(); n.style.cssText = "border-left:4px solid #9b2f22;padding-left:8px;margin:0 0 10px;font-size:14px;line-height:1.4;position:relative;z-index:1"; n.textContent = `Week ${wk.n()}, in pencil: ` + (teach ? "Jax taps once for every high card he holds. Last week you trusted every tap. His file says “companion (uninformed)”, and you have read it." : twist ? "He will tap anyway, with every card face up. You know why now: it is the one thing at this table nobody typed for him." : "The basket will hold one loaf too few, as it did. The empty chairs are an item on a sheet: “Card table. Loss to witness.”"); intro.querySelector("[data-start]").before(n); }
    kit.sock(root);
    {
      const strip = intro.querySelector("." + K + "suits");
      const out = (n) => (GONE.some((g) => g.name === n) ? "out" : teach && (n === "Pell" || n === "Duarte") ? "not" : "");
      const all = [["fisk", "Fisk", ""], ["jax", "Jax", ""], ["kimura", "Kimura", out("Kimura")], ["hollis", "Hollis", out("Hollis")], ["pell", "Pell", out("Pell")], ["duarte", "Duarte", out("Duarte")], ["sam", "Sam", "not"]];
      for (const [id, name, cls] of all) {
        if (!kit.has("hands-" + id)) continue;
        const f = document.createElement("figure"); f.className = cls;
        const im = kit.img("hands-" + id, 80, ""); im.className = "h";
        f.append(im, document.createTextNode(cls === "out" ? name + " ✗" : cls === "not" ? "(" + name + ")" : name));
        strip.appendChild(f);
      }
    }
    if (twist) tableEl.style.width = "max(230px,min(92vw,480px,calc(100vh - 505px)))";
    if (matchMedia("(max-width:520px)").matches) { seatEls[1].style.left = "14%"; seatEls[3].style.left = "86%"; }

    // ---- game state
    let hand = 0, dealer = twist ? 0 : 3, hands = [[], [], [], []], bids = [null, null, null, null], taken = [0, 0, 0, 0];
    let trick = [], leader = 0, turn = 0, played = [], loaves = 3, fiskBread = 0, phase = "intro", sel = 0;
    let watching = twist, watchedAny = false, exactHands = 0, w8Told = false, ducked = 0, staffTaken = false, jaxLoaf = false;
    const trump = () => SEATS[dealer].suit;
    const hunger = teach ? 40 : 72; // from day 4 the evening hunger is over 70, and the hand trembles
    const mk = (spec) => spec.split(" ").map((x) => ({ suit: x[0] === "h" ? "hands" : "keys", rank: +x[1] }));
    const short = (c) => (c.wd ? "W" : c.suit[0] + c.rank);

    function deal() {
      const deck = [];
      for (const p of PLAYERS) for (let r = 1; r <= 8; r++) deck.push({ suit: SEATS[p].suit, rank: r });
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      hands = [0, 1, 2, 3].map((p) => (PLAYERS.includes(p) ? deck.slice(PLAYERS.indexOf(p) * 8, PLAYERS.indexOf(p) * 8 + 8).sort((a, b) => (a.suit === b.suit ? a.rank - b.rank : Object.keys(SUITS).indexOf(a.suit) - Object.keys(SUITS).indexOf(b.suit))) : []));
      if (twist) { hands[0] = mk(OPEN.fisk); hands[1] = mk(OPEN.jax); } // open hands are a set piece: one fixed deal
      // the withdrawn 8s, face up: the dealer's first, then the seat on his left
      WD.forEach((c, k) => hands[PLAYERS[(PLAYERS.indexOf(dealer) + k) % N]].push(c));
      bids = [null, null, null, null]; taken = [0, 0, 0, 0]; played = []; trick = []; loaves = twist ? 1 : 3;
      leader = nextP(dealer); turn = leader;
    }
    const cardHtml = (c) => `<span class="r">${c.rank}</span>${suitSvg(c.suit, "s")}<span class="l">${c.suit.slice(0, 5)}</span>${c.wd ? `<span class="wd">WITHDRAWN</span>` : ""}`;
    const label = (c) => (c.wd ? `${c.of}'s withdrawn 8 of ${c.suit}` : `${c.rank} of ${c.suit}`);
    // a withdrawn 8 beats nothing, and anything beats it
    const beats = (a, b) => (a.wd ? false : b.wd ? true : a.suit === b.suit ? a.rank > b.rank : a.suit === trump());
    const ledOf = (tr) => tr.find((t) => !t.card.wd)?.card.suit ?? null;
    const ledSuit = () => ledOf(trick);
    function winnerOf(tr) { let w = tr[0]; for (const t of tr.slice(1)) if (beats(t.card, w.card)) w = t; return w; }
    function legalOf(h, tr) {
      const led = ledOf(tr);
      if (!led) return h.slice();
      const f = h.filter((c) => !c.wd && c.suit === led);
      return f.length ? [...f, ...h.filter((c) => c.wd)] : h.slice();
    }
    const legal = (p) => legalOf(hands[p], trick);

    // ---- AI
    function estimate(p) {
      let e = 0;
      for (const c of hands[p]) {
        if (c.wd) continue;
        if (c.suit === trump()) e += c.rank >= 6 ? 1 : c.rank >= 4 ? 0.5 : 0.15;
        else e += c.rank === 8 ? 0.7 : c.rank === 7 ? 0.35 : 0;
      }
      return e;
    }
    function aiBid(p) {
      let b = Math.round(estimate(p));
      if (p === 3) b = Math.max(0, b - 1); // Hollis bids low
      if (p === dealer) { const sum = bids.reduce((a, x) => a + (x ?? 0), 0); if (sum + b === 8) b = b > 0 ? b - 1 : b + 1; }
      return Math.max(0, Math.min(8, b));
    }
    const aiPlay = (p) => aiPick(hands[p], trick, bids[p] - taken[p]);
    function aiPick(h, trick, need) {
      const all = legalOf(h, trick);
      const wd = all.filter((c) => c.wd);
      const L = all.filter((c) => !c.wd).sort((a, b) => a.rank - b.rank + (a.suit === trump()) * 10 - (b.suit === trump()) * 10);
      if (!L.length) return wd[0];
      if (!ledOf(trick)) {
        if (need > 0) { const hi = L.filter((c) => c.suit !== trump() && c.rank >= 7); if (hi.length) return hi[hi.length - 1]; }
        if (need <= 0 && wd.length && !trick.length) return wd[0]; // on his bid: he leads the empty chair's card
        return L[0];
      }
      const cur = winnerOf(trick).card;
      const wins = L.filter((c) => beats(c, cur));
      const loses = L.filter((c) => !beats(c, cur));
      if (need > 0 && wins.length) return wins[0];
      if (need <= 0 && loses.length) return loses[loses.length - 1];
      if (need <= 0 && wd.length) return wd[0]; // every card he holds would win: he ducks with the withdrawn 8
      return L[0];
    }
    // Open hands only: is there still a line of play on which Jax takes exactly his bid? (Fisk's pencil.)
    function alive(hF, hJ, tr, turnP, tF, tJ) {
      if (tF + tJ >= 8) return tJ === bids[1];
      if (tJ > bids[1]) return false;
      if (tr.length === 2) { const w = winnerOf(tr); return alive(hF, hJ, [], w.p, tF + (w.p === 0), tJ + (w.p === 1)); }
      if (turnP === 1) { const c = aiPick(hJ, tr, bids[1] - tJ); return alive(hF, hJ.filter((x) => x !== c), [...tr, { p: 1, card: c }], 0, tF, tJ); }
      const seen = new Set();
      for (const c of legalOf(hF, tr)) { const k = short(c); if (seen.has(k)) continue; seen.add(k); if (alive(hF.filter((x) => x !== c), hJ, [...tr, { p: 0, card: c }], 1, tF, tJ)) return true; }
      return false;
    }
    const keeps = (c) => alive(hands[0].filter((x) => x !== c), hands[1], [...trick, { p: 0, card: c }], 1, taken[0], taken[1]);

    // ---- render
    function renderTop() {
      const bidsBox = $("bids").querySelector("div");
      const need = bids[0] == null ? null : bids[0] - taken[0];
      const tricksLeft = 8 - taken.reduce((a, b) => a + b, 0);
      bidsBox.innerHTML = PLAYERS.map((i) => [SEATS[i], i]).map(([st, i]) => `<div class="${K}bidrow${i === 0 ? " me" : ""}"><span>${suitSvg(st.suit, "", P.cream)}${st.name}</span><span>${bids[i] ?? "–"} · ${taken[i]}${bids[i] != null && bids[i] === taken[i] && phase !== "bid" ? " ✓" : bids[i] != null && taken[i] > bids[i] ? " ✗" : ""}</span></div>`).join("")
        + `<div style="margin-top:4px;color:${P.sodium}">TRUMPS ${suitSvg(trump(), "", P.sodium)}${trump().toUpperCase()} · HAND ${Math.max(1, hand)}/${Math.max(HANDS, hand)}</div>`
        + (twist && phase === "play" && bids[1] != null ? `<div class="${K}need">${bids[1] - taken[1] > 0 ? `JAX NEEDS ${bids[1] - taken[1]} MORE of ${tricksLeft}` : bids[1] === taken[1] ? `JAX IS EXACT · HE MUST LOSE THE REST` : `JAX IS OVER BY ${taken[1] - bids[1]}`}</div>`
          : phase === "play" && need != null ? `<div class="${K}need">${need > 0 ? `TAKE ${need} MORE of ${tricksLeft}` : need === 0 ? `EXACT · LOSE THE REST` : `OVER BY ${-need} · NO LOAF`}</div>` : "");
      const holder = (c) => { const i = hands.findIndex((h) => h.includes(c)); return played.includes(c) ? "played" : i < 0 ? "burned" : i === 0 ? "you hold it" : SEATS[i].name + " holds it"; };
      const wdMark = wrap.dataset.wd ? `<img class="${K}stampart" alt="withdrawn" src="${wrap.dataset.wd}">` : `<span class="${K}stamp">WITHDRAWN</span>`;
      $("issue").innerHTML = `<div style="font-family:'Stardos Stencil',monospace;font-size:22px;line-height:1">${8 * N}${WD.length ? ` + ${WD.length} ${wdMark}` : " CARDS"}</div>${WD.map((c) => `<div style="font-size:12px;white-space:nowrap">${suitSvg(c.suit, "", P.cream)}8 · ${holder(c)}</div>`).join("")}`;
      const trkGone = stage === 2 && hand >= 2;
      $("tracker").querySelector("h4").textContent = trkGone ? "TRACKER · GONE" : "TRACKER · PLAYED";
      $("trk").style.display = trkGone ? "block" : "";
      $("trk").innerHTML = trkGone ? `<span style="display:block;text-align:left;font-size:12px;line-height:1.35">The count will not stay in your head tonight. Watch the table.</span>` : PLAYERS.map((p) => SEATS[p]).map((st) => `<span>${suitSvg(st.suit, "", P.cream)}</span>` + [1, 2, 3, 4, 5, 6, 7, 8].map((r) => (played.some((c) => c.suit === st.suit && c.rank === r) ? `<s>${r}</s>` : `<span>${r}</span>`)).join("")).join("");
      if (twist) {
        const op = $("open");
        op.innerHTML = `<b>JAX'S HAND · FACE UP</b>`;
        for (const c of hands[1]) { const d = document.createElement("div"); d.className = K + "card" + (!c.wd && c.suit === trump() ? " trump" : "") + (c.wd ? " w8" : ""); d.innerHTML = cardHtml(c); dress(d, c); d.setAttribute("aria-label", label(c)); op.appendChild(d); }
      }
      seatEls.forEach((el, i) => {
        if (!PLAYERS.includes(i)) return;
        el.classList.toggle("turn", turn === i && phase === "play");
        const b = el.querySelector(".b");
        b.textContent = bids[i] == null ? "" : `bid ${bids[i]} · took ${taken[i]}`;
        if (i > 0 && (phase === "bid" || phase === "play")) { const k = document.createElement("i"); k.className = "bk"; k.textContent = hands[i].length; k.setAttribute("aria-label", `${hands[i].length} cards in hand`); b.appendChild(k); }
      });
      const have = basketEl.children.length;
      if (have !== loaves) basketEl.innerHTML = Array.from({ length: loaves }, (_, i) => `<div class="${K}loaf${stage === 2 && i === 0 ? " staff" : ""}"${stage === 2 && i === 0 ? ' title="Wrapped in a white napkin: staff bread"' : ""}></div>`).join("");
      basketEl.setAttribute("aria-label", `Bread basket, ${loaves} loaves`);
    }
    function renderTrick(won) {
      trickEl.innerHTML = "";
      const best = trick.length ? winnerOf(trick) : null;
      for (const t of trick) {
        const d = document.createElement("div");
        d.className = K + "card" + (!t.card.wd && t.card.suit === trump() ? " trump" : "") + (t.card.wd ? " w8" : "") + (best === t ? " best" : "") + (won && best === t ? " won" : "");
        d.innerHTML = cardHtml(t.card); dress(d, t.card);
        d.style.left = TRICK_POS[t.p][0] + "%"; d.style.top = TRICK_POS[t.p][1] + "%";
        d.setAttribute("aria-label", `${SEATS[t.p].name} played ${label(t.card)}`);
        trickEl.appendChild(d);
      }
    }
    function renderHand() {
      handEl.innerHTML = "";
      handEl.style.setProperty("--n", Math.max(8, hands[0].length));
      handEl.classList.toggle("tremble", !reduce && hunger >= 70);
      const myTurn = phase === "play" && turn === 0;
      const L = myTurn ? legal(0) : [];
      const cur = trick.length ? winnerOf(trick).card : null;
      hands[0].forEach((c) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = K + "card" + (!c.wd && c.suit === trump() ? " trump" : "") + (c.wd ? " w8" : ""); b.innerHTML = cardHtml(c); dress(b, c);
        const ok = L.includes(c);
        if (!ok) b.setAttribute("disabled", "");
        if (ok && cur && beats(c, cur)) b.classList.add("win");
        if (ok && twist && losses >= 2 && bids[1] != null && keeps(c)) { b.classList.add("keep"); b.title = "Fisk's pencil: this card keeps it possible"; }
        b.setAttribute("aria-label", label(c) + (c.wd ? ": follows no suit, wins nothing" : "") + (ok ? (cur && beats(c, cur) ? ", would win the trick so far" : "") : ", cannot play now"));
        b.addEventListener("click", () => fiskPlay(c));
        // a pointer on a card you may not play still answers: it shakes
        b.addEventListener("pointerdown", () => { if (b.hasAttribute("disabled") && !reduce) { b.classList.remove("nope"); void b.offsetWidth; b.classList.add("nope"); } });
        handEl.appendChild(b);
      });
      if (myTurn) { const btns = [...handEl.querySelectorAll("button:not([disabled])")]; sel = Math.min(sel, btns.length - 1); btns[Math.max(0, sel)]?.focus({ preventScroll: true }); }
    }
    const caption = (p, text) => { seatEls[p].querySelector(".c").textContent = text; };
    const bar = (html) => { barEl.innerHTML = html; };
    function toast(text, bad) {
      const t = document.createElement("div");
      t.className = K + "toast" + (bad ? " bad" : "") + (reduce ? "" : " in");
      t.textContent = text; tableEl.appendChild(t);
      later(() => t.remove(), 1100);
    }
    function showTaps() {
      const t = seatEls[1].querySelector(".t");
      const led = ledSuit();
      if (!watching || !led) { t.textContent = twist && watching ? "(his fingers on the table edge)" : ""; return; }
      const n = hands[1].filter((x) => !x.wd && x.suit === led && x.rank > 5).length + (trick.some((x) => x.p === 1) ? 0 : 0);
      t.textContent = trick.some((x) => x.p === 1) ? "(played)" : n ? "tap ".repeat(n).trim() : "no taps";
    }

    // ---- flow
    function startHand() {
      hand++;
      dealer = twist ? 0 : hand % 2 === 1 ? 3 : 0;
      deal();
      phase = "bid";
      PLAYERS.filter((p) => p).forEach((p) => caption(p, twist ? "" : LINES[p][hand - 1] || ""));
      if (stage === 2) watchBtn.hidden = false; // by day 4 the taps need no explaining
      renderTop(); renderTrick(); renderHand(); showTaps();
      bar(twist ? `One hand. <b>You deal.</b> Your Hands are trumps. Jax bids first; your bid may not make the two add up to 8.` : dealer === 3 ? `Hand ${hand}. Hollis deals; his Stars are trumps.` : `Hand ${hand}. <b>You deal.</b> Your Hands are trumps, and you bid last: your bid may not make the table's add up to 8.`);
      later(nextBid, hand === 1 ? 900 : 1600);
    }
    const bidOrder = () => PLAYERS.map((_, k) => PLAYERS[(PLAYERS.indexOf(dealer) + k + 1) % N]);
    function nextBid() {
      const p = bidOrder().find((q) => bids[q] == null);
      if (p == null) { phase = "play"; turn = leader; renderTop(); bar(`Bids are in: ${bids.reduce((a, b) => a + b, 0)} of 8. ${SEATS[leader].name} leads.`); return later(step, 800); }
      if (p !== 0) { bids[p] = aiBid(p); renderTop(); return later(nextBid, 450); }
      const sum = bids.reduce((a, x) => a + (x ?? 0), 0);
      const forbid = dealer === 0 ? 8 - sum : -1;
      const est = Math.round(estimate(0));
      const hint = (losses >= 2 || teach) && !twist ? ` <span style="color:${P.sodium}">Pencil count: about ${est === forbid ? est + (est > 0 ? -1 : 1) : est}.</span>` : "";
      bar(`<span>Your bid${dealer === 0 ? ` (you deal: not ${forbid})` : ""}:${hint}</span>` + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<button type="button" data-bid="${n}" ${n === forbid ? "disabled" : ""} aria-label="Bid ${n}">${n}</button>`).join(""));
      barEl.querySelectorAll("[data-bid]").forEach((b) => b.addEventListener("click", () => fiskBid(+b.dataset.bid)));
      barEl.querySelector("[data-bid]:not([disabled])")?.focus();
    }
    function fiskBid(n) {
      if (phase !== "bid" || bids[0] != null) return;
      const sum = bids.reduce((a, x) => a + (x ?? 0), 0);
      if (dealer === 0 && sum + n === 8) { bar(`Not ${n}: the bids would add up to 8, and someone has to miss. Choose again.`); return later(nextBid, 1200); }
      bids[0] = n; renderTop(); bar(`You bid ${n}.`); later(nextBid, 350);
    }
    function step() {
      if (phase !== "play") return;
      renderTop(); showTaps();
      if (trick.length === N) return later(resolveTrick, twist ? 500 : 300);
      if (turn === 0) {
        const need = bids[0] - taken[0];
        const mine = hands[0].find((c) => c.wd);
        const w8 = mine && !w8Told ? ` <span class="${K}new">NEW · ${mine.of}'s 8 is in your hand, stamped WITHDRAWN. It follows no suit and wins nothing: play it on any trick you want to lose. You hold nine cards for eight tricks.</span>` : mine && need <= 0 ? " The WITHDRAWN 8 loses any trick." : "";
        if (mine) w8Told = true;
        const led = ledSuit();
        if (twist) { const jn = bids[1] - taken[1]; bar(`${led ? `Jax led <b>${led}</b>.` : trick.length ? "A withdrawn 8 was led: it sets no suit." : "Your lead."} He needs <b>${jn > 0 ? jn + " more" : jn === 0 ? "no more: he has to lose the rest" : "nothing: he is over"}</b> of the ${8 - taken[0] - taken[1]} left. A red underline marks a card that would take this trick from him.${losses >= 2 ? " Fisk's pencil rings the cards that keep it possible." : ""}`); renderHand(); return; }
        bar((led ? `Your play. Follow <b>${led}</b> if you can.${need > 0 ? " A red underline marks a card that would win it so far." : " You want to lose this one."}` : trick.length ? `A withdrawn 8 was led: it sets no suit. Yours does.` : `Your lead.${need > 0 ? " You still need tricks." : " You are on your bid: lead low."}`) + w8);
        renderHand(); return;
      }
      later(() => { playCard(turn, aiPlay(turn)); }, twist ? 800 : 560);
    }
    function playCard(p, c) {
      hands[p] = hands[p].filter((x) => x !== c);
      trick.push({ p, card: c }); played.push(c);
      if (c.wd) { caption(p, p === 0 ? "" : `plays ${c.of}'s 8`); if (p === 0) ducked++; }
      turn = nextP(p);
      renderTrick(); renderTop();
      if (p === 0) renderHand();
      step();
    }
    function fiskPlay(c) {
      if (phase !== "play" || turn !== 0 || !legal(0).includes(c)) return;
      playCard(0, c);
    }
    function resolveTrick() {
      const w = winnerOf(trick);
      taken[w.p]++;
      renderTrick(true);
      const mine = w.p === 0, over = !twist && taken[0] > bids[0];
      bar(`${mine ? "You take" : SEATS[w.p].name + " takes"} the trick with the ${label(w.card)}.${trick.some((t) => t.card.wd && t.p === 0) ? " Your withdrawn 8 took nothing, as it was stamped to." : ""}`);
      if (twist) { if (taken[1] > bids[1]) toast("JAX IS OVER", true); else if (taken[1] === bids[1] && !mine) toast("JAX: BID MADE"); }
      else if (mine) toast(over ? "OVER YOUR BID" : taken[0] === bids[0] ? "BID MADE" : "TRICK", over);
      renderTop();
      // the table talks once, after the first trick of the evening
      if (teach && hand === 1 && taken.reduce((a, b) => a + b, 0) === 1) {
        caption(1, "Taps are high cards.");
        watchBtn.hidden = false; if (!reduce) watchBtn.animate?.([{ background: P.sodium }, { background: "transparent" }], { duration: 900, iterations: 2 });
        later(() => bar(`Jax, without looking up: “Taps are high cards.” <b>New:</b> Watch Jax (W) before you play, and his fingers show how many cards above 5 he holds in the led suit.`), 950);
      }
      later(() => {
        trick = []; renderTrick(); leader = w.p; turn = w.p;
        if (taken.reduce((a, b) => a + b, 0) >= 8) return endHand();
        step();
      }, 1200);
    }
    function endHand() {
      phase = "settle";
      const exact = PLAYERS.filter((p) => bids[p] === taken[p]).sort((a, b) => bids[b] - bids[a]);
      const got = [];
      const plainLeft = () => loaves - (stage === 2 ? 1 : 0); // the wrapped loaf stays in the basket: nobody at the table takes it
      for (const p of exact) { if (plainLeft() > 0) { loaves--; got.push(p); if (p === 0) fiskBread++; } }
      if (twist) return endOpen(got);
      if (bids[0] === taken[0]) exactHands++;
      // the loaves leave the basket toward their seats
      [...basketEl.children].slice(-got.length || 99).forEach((l) => l.classList.add("go"));
      later(renderTop, reduce ? 0 : 450);
      const missed = exact.filter((p) => !got.includes(p));
      const others = got.filter((p) => p);
      const burned = hands[0].length ? ` The card you never played, the ${label(hands[0][0])}, is burned.` : "";
      hands = [[], [], [], []]; renderHand();
      const fisk = burned + " " + (got.includes(0) ? "You took exactly your bid: <b>a loaf</b>." : bids[0] === taken[0] ? "You made your bid, but the basket was empty by your turn." : `You bid ${bids[0]} and took ${taken[0]}. <b>No bread.</b>`);
      toast(got.includes(0) ? "A LOAF" : "NO BREAD", !got.includes(0));
      bar(`<span>${fisk} ${others.length ? others.map((p) => SEATS[p].name).join(", ") + " took bread." : "No one else took bread."}${missed.length && !missed.includes(0) ? " " + missed.map((p) => SEATS[p].name).join(", ") + " made the bid and went without." : ""}</span> <button type="button" data-next>${more() ? (hand >= 2 ? "One more hand" : "Next hand") : "Settle the bread"}</button>`);
      if (hand === 1) caption(3, "Next week. I mean it.");
      const nb = barEl.querySelector("[data-next]");
      nb.addEventListener("click", () => (more() ? startHand() : settle()));
      nb.focus();
    }
    // teach: a third hand if the first two brought no bread (room to fail safely)
    const more = () => hand < HANDS || (teach && hand === 2 && !fiskBread);
    // open hands: one loaf, and at most one man exact
    function endOpen(got) {
      phase = "done"; handEl.innerHTML = "";
      [...basketEl.children].forEach((l) => l.classList.add("go"));
      later(renderTop, reduce ? 0 : 450);
      hands = [[], [], [], []];
      if (got.includes(1)) {
        jaxLoaf = true; api.store.set("losses", 0);
        caption(1, "takes the loaf");
        toast("HIS LOAF");
        bar(`Jax took exactly his ${bids[1]}. The loaf is his.`);
        return lad.conclude(wrap, kit, stage, { card: "hands-jax", caption: "RATION ISSUE · DAY 6 · OPEN HANDS" }, { outcome: "win", text: `Jax bid ${bids[1]} and took ${taken[1]}; you bid ${bids[0]} and took ${taken[0]}. The loaf is his, and every card that gave it to him was face up on the table. He tapped the whole hand through all the same, for nobody: there was nothing left to tell. He breaks the loaf and does not offer you half, because you would not take it. His pull −15.${ducked ? ` You ducked ${ducked} trick${ducked > 1 ? "s" : ""} with an empty chair's 8.` : ""}` }, go);
      }
      if (got.includes(0)) { toast("A LOAF"); bar("You took exactly your bid. The loaf is yours."); return settle(); }
      api.store.set("losses", losses + 1);
      toast("NO BREAD", true);
      lad.conclude(wrap, kit, stage, { card: "chapter-7", stamp: "stamp-withdrawn", caption: "RATION ISSUE · DAY 6 · NO BREAD" }, { outcome: "lose", text: `Jax bid ${bids[1]} and took ${taken[1]}; you bid ${bids[0]} and took ${taken[0]}. Nobody was exact, with every card showing. The loaf goes back to the hatch in its basket, and the two of you look at the table.` }, go);
    }
    function settle() {
      phase = "done";
      handEl.innerHTML = ""; watchBtn.hidden = true;
      // the staff loaf (test): still in the basket after the last hand; taking it is Fisk's to decide
      if (stage === 2 && !settle.asked) {
        settle.asked = true;
        bar(`<span>The wrapped loaf is still in the basket: staff bread, in a white napkin. Nobody at the table has touched it.</span><button type="button" data-staff="take">Take it</button><button type="button" data-staff="leave">Leave it</button>`);
        barEl.querySelectorAll("[data-staff]").forEach((b) => b.addEventListener("click", () => { staffTaken = b.dataset.staff === "take"; if (staffTaken) { fiskBread++; loaves = 0; renderTop(); } sh.set("staff_loaf", staffTaken); settle(); }));
        barEl.querySelector("[data-staff]").focus();
        return;
      }
      if (!fiskBread) {
        bar("No bread tonight.");
        api.store.set("losses", losses + 1);
        return lad.conclude(wrap, kit, stage, { card: "chapter-" + (DAY + 2), stamp: "stamp-withdrawn", caption: `RATION ISSUE · DAY ${DAY} · NO BREAD` }, { outcome: "lose", text: `No bread tonight: ${exactHands ? "the basket ran out before your turn" : "you missed your bid every hand"}, and the basket passed you by. Without a loaf, staying in the bunk at 10:00 will cost more, and the call will be louder for it.` }, go);
      }
      api.store.set("losses", 0);
      const out = [];
      let i = 0;
      const ask = () => {
        if (i >= fiskBread) {
          const gave = out.filter((o) => o !== "keep" && o !== "eat");
          const kept = out.filter((o) => o === "keep").length, ate = out.filter((o) => o === "eat").length;
          const lines = out.map((o) => (o === "keep" ? "banked one under your mattress" : o === "eat" ? "ate one at the table (hunger −25)" : `gave one to ${o} (his pull −15${o === "Jax" ? ", Jax's trust +10" : ""})`));
          const close = gave.length === fiskBread
            ? `You go to the bunk with nothing. Feeding someone does not save them; it moves the call to someone else, one night at a time. Tonight it moves off ${[...new Set(gave)].join(" and ")}.`
            : ate ? "The bread makes you feel full, the first time in four days. At 10:00, staying in the bunk will be possible." : "The loaf is wrapped in your undershirt. Tomorrow evening it can buy you one night in the bunk.";
          if (!twist) { sh.set("bread_hollis", gave.includes("Hollis")); sh.set("bread_given", gave[0] || ""); }
          else if (gave.length) sh.set("bread_given", "Jax");
          const staff = staffTaken ? " One of them is the wrapped loaf: staff bread buys a quiet night, and tomorrow the gaze at the Tray rests on you a second longer." : "";
          const open = twist ? (gave.length ? " You won it with every card showing, and then handed it across. He takes it. It was not what the hand was for." : " You could see the line that gave it to him, and you played the other one. Jax tapped the whole hand through all the same.") : "";
          return lad.conclude(wrap, kit, stage, { card: twist ? "hands-fisk" : "hands-hollis", caption: `RATION ISSUE · DAY ${DAY} · BREAD` }, { outcome: twist || gave.length === fiskBread ? "done" : "win", text: `Bread: ${fiskBread} ${fiskBread > 1 ? "loaves" : "loaf"}. You ${lines.join("; ")}.${ducked ? ` You ducked ${ducked} trick${ducked > 1 ? "s" : ""} with an empty chair's 8.` : ""}${staff}${open} ${close}` }, go);
        }
        bar(`<span>Loaf ${i + 1} of ${fiskBread}:</span><button type="button" data-o="keep">Keep it</button><button type="button" data-o="eat">Eat it now</button>` + PLAYERS.filter((p) => p).map((p) => `<button type="button" data-o="${SEATS[p].name}">Give to ${SEATS[p].name}</button>`).join(""));
        barEl.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { out.push(b.dataset.o); i++; ask(); }));
        barEl.querySelector("[data-o]").focus();
      };
      ask();
    }
    function toggleWatch() {
      if (watchBtn.hidden) return;
      watching = !watching; watchedAny = true;
      watchBtn.setAttribute("aria-pressed", String(watching));
      watchBtn.textContent = watching ? "Watching Jax (W)" : "Watch Jax (W)";
      showTaps();
    }
    watchBtn.addEventListener("click", toggleWatch);

    // ---- keyboard
    const onKey = (e) => {
      if (phase === "bid" && bids[0] == null && /^[0-8]$/.test(e.key) && barEl.querySelector("[data-bid]")) { fiskBid(+e.key); e.preventDefault(); return; }
      if ((e.key === "w" || e.key === "W") && phase === "play") { toggleWatch(); e.preventDefault(); return; }
      if (phase === "play" && turn === 0 && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        const btns = [...handEl.querySelectorAll("button:not([disabled])")];
        if (!btns.length) return;
        const cur = btns.indexOf(document.activeElement);
        sel = (Math.max(0, cur) + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length;
        btns[sel].focus(); e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { intro.remove(); startHand(); };
    startBtn.addEventListener("click", start);
    deal(); renderTop(); renderHand();
    later(() => startBtn.focus(), 30);

    return {
      unmount() {
        timers.forEach(clearTimeout);
        window.removeEventListener("keydown", onKey);
        startBtn.removeEventListener("click", start);
        watchBtn.removeEventListener("click", toggleWatch);
        kit.dispose();
        wrap.remove();
      },
    };
    }
  },
};

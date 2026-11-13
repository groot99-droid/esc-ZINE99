// Project: Man Eater — Short Rations (1D, trick-taking). Graphic style: stencilled ration-issue cards.
// DESIGN.md section 11.1, cut to one evening: d4_rations, four seats (Fisk, Jax, Kimura, Hollis),
// 32 cards, two hands. Trumps are the dealer's suit; bid 0 to 8, the dealer may not make the bids
// add up to 8; follow suit; only exact bidders take a loaf, and the basket holds one fewer than the
// seats. Jax taps once per card above 5 he holds in the led suit. Pell's and Duarte's chairs are
// pushed in and their suits are stamped withdrawn. Table lines are the crew's lines from DESIGN.md 6.
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

const suitSvg = (s, cls, fill = P.ink) => `<svg class="${cls}" viewBox="-1.1 -1.1 2.2 2.2" aria-hidden="true"><path d="${SUITS[s]}" fill="${fill}"/></svg>`;

export default {
  mount(root, api) {
    const K = "man-eater-short-rations-";
    const reduce = api.reducedMotion;
    const rng = api.rng();
    const losses = api.store.get("losses", 0);
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, reduce ? Math.min(ms, 250) : ms); timers.push(t); return t; };
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;background:radial-gradient(ellipse at 50% 45%,#2b302d 0%,${P.ink} 70%);color:${P.cream};font-family:'Courier Prime','Courier New',monospace}
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
      @media (max-width:640px){.${K}top{grid-template-columns:1fr 1fr}.${K}top>.${K}box:nth-child(2){display:none}.${K}tracker{justify-self:stretch;max-width:none}.${K}box{font-size:12px;padding:6px 8px}.${K}table{width:min(92vw,calc(100vh - 500px));min-width:250px}}
      @media (max-width:520px){.${K}stage{padding:8px 8px 10px}.${K}seat{width:112px}.${K}seat .n{font-size:12px;padding:2px 5px}.${K}seat .b,.${K}seat .c{font-size:12px}
        .${K}hand{padding-top:14px}.${K}hand .${K}card{--w:calc((100vw - 24px) / 8);margin:0 1px}.${K}hand .${K}card .s{top:40%}.${K}trk{font-size:12px}.${K}cardin .${K}stamp{display:none}}
    </style>
    <div class="${K}stage">
      <div class="${K}top">
        <div class="${K}box ${K}bids"><h4>BIDS · TAKEN</h4><div></div></div>
        <div class="${K}box" style="text-align:center"><h4>IN ISSUE</h4><div class="${K}issue"></div></div>
        <div class="${K}box ${K}tracker"><h4>TRACKER · PLAYED</h4><div class="${K}trk"></div></div>
      </div>
      <div><div class="${K}table"><div class="${K}trick"></div><div class="${K}basket" aria-label="Bread basket"></div></div></div>
      <div><div class="${K}bar" aria-live="polite"></div><div style="text-align:center"><button type="button" class="${K}watch" aria-pressed="false" hidden>Watch Jax (W)</button></div><div class="${K}hand" role="group" aria-label="Your hand"></div></div>
    </div>
    <div class="${K}intro"><div class="${K}cardin">
      <div class="${K}issue-no"><span>RATION ISSUE · DAY 4</span><span>EVENING</span></div>
      <span class="${K}stamp">2 WITHDRAWN</span>
      <h2>Short Rations</h2>
      <p class="${K}goal">Take exactly as many tricks as you bid. Exact bidders get a loaf.</p>
      <p class="${K}beat">Four seats tonight. Pell's chair and Duarte's are pushed in, and their suits are out of the deck. The basket holds three loaves for four men.</p>
      <dl class="${K}key">
        <dt>BID</dt><dd>number keys, or the row of buttons: how many of the 8 tricks you will take</dd>
        <dt>PLAY</dt><dd>click a card, or ← → and Enter. Follow the led suit if you can; trumps beat everything</dd>
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
      const d = document.createElement("div");
      d.className = K + "seat" + (i >= 4 ? " " + K + "empty empty" : "");
      d.style.left = POS[st.pos][0] + "%"; d.style.top = POS[st.pos][1] + "%";
      d.innerHTML = i >= 4 ? `<div class="chair"></div><span class="n">${suitSvg(st.suit, "", P.cream)}</span>` : `<span class="n">${suitSvg(st.suit, "", P.cream)}${st.name}</span><span class="b"></span><span class="c"></span><span class="c t"></span>`;
      if (i >= 4) d.querySelector(".n").setAttribute("aria-label", `${st.name}'s chair, pushed in`);
      tableEl.appendChild(d);
      if (i < 4) seatEls.push(d);
    }
    seatEls[0].style.top = "95%";
    if (matchMedia("(max-width:520px)").matches) { seatEls[1].style.left = "14%"; seatEls[3].style.left = "86%"; }

    // ---- game state
    let hand = 0, dealer = 3, hands = [[], [], [], []], bids = [null, null, null, null], taken = [0, 0, 0, 0];
    let trick = [], leader = 0, turn = 0, played = [], loaves = 3, fiskBread = 0, phase = "intro", sel = 0;
    let watching = false, watchedAny = false, exactHands = 0;
    const trump = () => SEATS[dealer].suit;
    const hunger = 72; // day 4 evening: hunger over 70 makes the hand tremble

    function deal() {
      const deck = [];
      for (const st of SEATS) for (let r = 1; r <= 8; r++) deck.push({ suit: st.suit, rank: r });
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      hands = [0, 1, 2, 3].map((p) => deck.slice(p * 8, p * 8 + 8).sort((a, b) => (a.suit === b.suit ? a.rank - b.rank : Object.keys(SUITS).indexOf(a.suit) - Object.keys(SUITS).indexOf(b.suit))));
      bids = [null, null, null, null]; taken = [0, 0, 0, 0]; played = []; trick = []; loaves = 3;
      leader = (dealer + 1) % 4; turn = leader;
    }
    const cardHtml = (c) => `<span class="r">${c.rank}</span>${suitSvg(c.suit, "s")}<span class="l">${c.suit.slice(0, 5)}</span>`;
    const label = (c) => `${c.rank} of ${c.suit}`;
    const beats = (a, b) => (a.suit === b.suit ? a.rank > b.rank : a.suit === trump());
    function winnerOf(tr) { let w = tr[0]; for (const t of tr.slice(1)) if (beats(t.card, w.card)) w = t; return w; }
    function legal(p) {
      const h = hands[p];
      if (!trick.length) return h.slice();
      const led = trick[0].card.suit;
      const f = h.filter((c) => c.suit === led);
      return f.length ? f : h.slice();
    }

    // ---- AI
    function estimate(p) {
      let e = 0;
      for (const c of hands[p]) {
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
    function aiPlay(p) {
      const L = legal(p).sort((a, b) => a.rank - b.rank + (a.suit === trump()) * 10 - (b.suit === trump()) * 10);
      const need = bids[p] - taken[p];
      if (!trick.length) {
        if (need > 0) { const hi = L.filter((c) => c.suit !== trump() && c.rank >= 7); if (hi.length) return hi[hi.length - 1]; }
        return L[0];
      }
      const cur = winnerOf(trick).card;
      const wins = L.filter((c) => beats(c, cur));
      const loses = L.filter((c) => !beats(c, cur));
      if (need > 0 && wins.length) return wins[0];
      if (need <= 0 && loses.length) return loses[loses.length - 1];
      return L[0];
    }

    // ---- render
    function renderTop() {
      const bidsBox = $("bids").querySelector("div");
      const need = bids[0] == null ? null : bids[0] - taken[0];
      const tricksLeft = 8 - taken.reduce((a, b) => a + b, 0);
      bidsBox.innerHTML = SEATS.map((st, i) => `<div class="${K}bidrow${i === 0 ? " me" : ""}"><span>${suitSvg(st.suit, "", P.cream)}${st.name}</span><span>${bids[i] ?? "–"} · ${taken[i]}${bids[i] != null && bids[i] === taken[i] && phase !== "bid" ? " ✓" : bids[i] != null && taken[i] > bids[i] ? " ✗" : ""}</span></div>`).join("")
        + `<div style="margin-top:4px;color:${P.sodium}">TRUMPS ${suitSvg(trump(), "", P.sodium)}${trump().toUpperCase()} · HAND ${Math.max(1, hand)}/2</div>`
        + (phase === "play" && need != null ? `<div class="${K}need">${need > 0 ? `TAKE ${need} MORE of ${tricksLeft}` : need === 0 ? `EXACT · LOSE THE REST` : `OVER BY ${-need} · NO LOAF`}</div>` : "");
      $("issue").innerHTML = `<div style="font-family:'Stardos Stencil',monospace;font-size:28px;line-height:1">32</div><div style="font-size:12px">cards</div><div>${EMPTY.map((e) => `${suitSvg(e.suit, "", P.cream)}<span class="${K}stamp">WITHDRAWN</span>`).join("<br>")}</div>`;
      $("trk").innerHTML = SEATS.map((st) => `<span>${suitSvg(st.suit, "", P.cream)}</span>` + [1, 2, 3, 4, 5, 6, 7, 8].map((r) => (played.some((c) => c.suit === st.suit && c.rank === r) ? `<s>${r}</s>` : `<span>${r}</span>`)).join("")).join("");
      seatEls.forEach((el, i) => { el.classList.toggle("turn", turn === i && phase === "play"); el.querySelector(".b").textContent = bids[i] == null ? "" : `bid ${bids[i]} · took ${taken[i]}`; });
      const have = basketEl.children.length;
      if (have !== loaves) basketEl.innerHTML = `<div class="${K}loaf"></div>`.repeat(loaves);
      basketEl.setAttribute("aria-label", `Bread basket, ${loaves} loaves`);
    }
    function renderTrick(won) {
      trickEl.innerHTML = "";
      const best = trick.length ? winnerOf(trick) : null;
      for (const t of trick) {
        const d = document.createElement("div");
        d.className = K + "card" + (t.card.suit === trump() ? " trump" : "") + (best === t ? " best" : "") + (won && best === t ? " won" : "");
        d.innerHTML = cardHtml(t.card);
        d.style.left = TRICK_POS[t.p][0] + "%"; d.style.top = TRICK_POS[t.p][1] + "%";
        d.setAttribute("aria-label", `${SEATS[t.p].name} played ${label(t.card)}`);
        trickEl.appendChild(d);
      }
    }
    function renderHand() {
      handEl.innerHTML = "";
      handEl.classList.toggle("tremble", !reduce && hunger >= 70);
      const myTurn = phase === "play" && turn === 0;
      const L = myTurn ? legal(0) : [];
      const cur = trick.length ? winnerOf(trick).card : null;
      hands[0].forEach((c) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = K + "card" + (c.suit === trump() ? " trump" : ""); b.innerHTML = cardHtml(c);
        const ok = L.includes(c);
        if (!ok) b.setAttribute("disabled", "");
        if (ok && cur && beats(c, cur)) b.classList.add("win");
        b.setAttribute("aria-label", label(c) + (ok ? (cur && beats(c, cur) ? ", would win the trick so far" : "") : ", cannot play now"));
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
      if (!watching || !trick.length) { t.textContent = ""; return; }
      const led = trick[0].card.suit;
      const n = hands[1].filter((x) => x.suit === led && x.rank > 5).length + (trick.some((x) => x.p === 1) ? 0 : 0);
      t.textContent = trick.some((x) => x.p === 1) ? "(played)" : n ? "tap ".repeat(n).trim() : "no taps";
    }

    // ---- flow
    function startHand() {
      hand++;
      dealer = hand === 1 ? 3 : 0;
      deal();
      phase = "bid";
      [1, 2, 3].forEach((p) => caption(p, LINES[p][hand - 1] || ""));
      renderTop(); renderTrick(); renderHand(); showTaps();
      bar(hand === 1 ? `Hand 1. Hollis deals; his Stars are trumps.` : `Hand 2. <b>You deal.</b> Your Hands are trumps, and you bid last: your bid may not make the table's add up to 8.`);
      later(nextBid, hand === 1 ? 900 : 1600);
    }
    const bidOrder = () => [1, 2, 3, 4].map((k) => (dealer + k) % 4);
    function nextBid() {
      const p = bidOrder().find((q) => bids[q] == null);
      if (p == null) { phase = "play"; turn = leader; renderTop(); bar(`Bids are in: ${bids.reduce((a, b) => a + b, 0)} of 8. ${SEATS[leader].name} leads.`); return later(step, 800); }
      if (p !== 0) { bids[p] = aiBid(p); renderTop(); return later(nextBid, 450); }
      const sum = bids.reduce((a, x) => a + (x ?? 0), 0);
      const forbid = dealer === 0 ? 8 - sum : -1;
      const est = Math.round(estimate(0));
      const hint = losses >= 2 ? ` <span style="color:${P.sodium}">Pencil count: about ${est === forbid ? est + (est > 0 ? -1 : 1) : est}.</span>` : "";
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
      if (trick.length === 4) return later(resolveTrick, 300);
      if (turn === 0) {
        const need = bids[0] - taken[0];
        bar(trick.length ? `Your play. Follow <b>${trick[0].card.suit}</b> if you can.${need > 0 ? " A red underline marks a card that would win it so far." : " You want to lose this one."}` : `Your lead.${need > 0 ? " You still need tricks." : " You are on your bid: lead low."}`);
        renderHand(); return;
      }
      later(() => { playCard(turn, aiPlay(turn)); }, 560);
    }
    function playCard(p, c) {
      hands[p] = hands[p].filter((x) => x !== c);
      trick.push({ p, card: c }); played.push(c);
      turn = (p + 1) % 4;
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
      const mine = w.p === 0, over = taken[0] > bids[0];
      bar(`${mine ? "You take" : SEATS[w.p].name + " takes"} the trick with the ${label(w.card)}.`);
      if (mine) toast(over ? "OVER YOUR BID" : taken[0] === bids[0] ? "BID MADE" : "TRICK", over);
      renderTop();
      // the table talks once, after the first trick of the evening
      if (hand === 1 && taken.reduce((a, b) => a + b, 0) === 1) {
        caption(1, "Taps are high cards.");
        watchBtn.hidden = false; if (!reduce) watchBtn.animate?.([{ background: P.sodium }, { background: "transparent" }], { duration: 900, iterations: 2 });
        later(() => bar(`Jax, without looking up: “Taps are high cards.” <b>New:</b> Watch Jax (W) before you play, and his fingers show how many cards above 5 he holds in the led suit.`), 950);
      }
      later(() => {
        trick = []; renderTrick(); leader = w.p; turn = w.p;
        if (hands[0].length === 0) return endHand();
        step();
      }, 1200);
    }
    function endHand() {
      phase = "settle";
      const exact = [0, 1, 2, 3].filter((p) => bids[p] === taken[p]).sort((a, b) => bids[b] - bids[a]);
      const got = [];
      for (const p of exact) { if (loaves > 0) { loaves--; got.push(p); if (p === 0) fiskBread++; } }
      if (bids[0] === taken[0]) exactHands++;
      // the loaves leave the basket toward their seats
      [...basketEl.children].slice(-got.length || 99).forEach((l) => l.classList.add("go"));
      later(renderTop, reduce ? 0 : 450);
      const missed = exact.filter((p) => !got.includes(p));
      const others = got.filter((p) => p);
      const fisk = got.includes(0) ? "You took exactly your bid: <b>a loaf</b>." : bids[0] === taken[0] ? "You made your bid, but the basket was empty by your turn." : `You bid ${bids[0]} and took ${taken[0]}. <b>No bread.</b>`;
      toast(got.includes(0) ? "A LOAF" : "NO BREAD", !got.includes(0));
      bar(`<span>${fisk} ${others.length ? others.map((p) => SEATS[p].name).join(", ") + " took bread." : "No one else took bread."}${missed.length && !missed.includes(0) ? " " + missed.map((p) => SEATS[p].name).join(", ") + " made the bid and went without." : ""}</span> <button type="button" data-next>${hand < 2 ? "Next hand" : "Settle the bread"}</button>`);
      if (hand === 1) caption(3, "Next week. I mean it.");
      const nb = barEl.querySelector("[data-next]");
      nb.addEventListener("click", () => (hand < 2 ? startHand() : settle()));
      nb.focus();
    }
    function settle() {
      phase = "done";
      handEl.innerHTML = ""; watchBtn.hidden = true;
      if (!fiskBread) {
        bar("No bread tonight.");
        api.store.set("losses", losses + 1);
        return api.end({ outcome: "lose", text: `No bread tonight: ${exactHands ? "the basket ran out before your turn" : "you missed your bid both hands"}, and the basket passed you by. Without a loaf, staying in the bunk at 10:00 will cost more, and the call will be louder for it.` });
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
            ? `You go to the bunk with nothing. Feeding someone does not save them; it moves the call to someone else, one night at a time. Tonight it moves off ${gave.join(" and ")}.`
            : ate ? "The bread makes you feel full, the first time in four days. At 10:00, staying in the bunk will be possible." : "The loaf is wrapped in your undershirt. Tomorrow evening it can buy you one night in the bunk.";
          return api.end({ outcome: gave.length === fiskBread ? "done" : "win", text: `Bread: ${fiskBread} ${fiskBread > 1 ? "loaves" : "loaf"}. You ${lines.join("; ")}. ${close}` });
        }
        bar(`<span>Loaf ${i + 1} of ${fiskBread}:</span><button type="button" data-o="keep">Keep it</button><button type="button" data-o="eat">Eat it now</button>` + [1, 2, 3].map((p) => `<button type="button" data-o="${SEATS[p].name}">Give to ${SEATS[p].name}</button>`).join(""));
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
        wrap.remove();
      },
    };
  },
};

// Project: Man Eater — Short Rations (1D, trick-taking). Graphic style: stencilled ration-issue cards.
// DESIGN.md section 11.1, cut to one evening: d4_rations, four seats (Fisk, Jax, Kimura, Hollis),
// 32 cards, two hands. Trumps are the dealer's suit; bid 0 to 8, the dealer may not make the bids
// add up to 8; follow suit; only exact bidders take a loaf, and the basket holds one fewer than the
// seats. Jax taps once per card above 5 he holds in the led suit. Pell's and Duarte's chairs are
// pushed in and their suits are stamped withdrawn. Table lines are the crew's lines from DESIGN.md 6.

const P = { ink: "#1B1D1F", cream: "#D9D2BF", steel: "#8A8F93", green: "#5E7363", sodium: "#D9A441", card: "#e9e2cf" };
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
const LINES = { 1: ["Taps are high cards.", ""], 2: ["Nothing goes out. Everything comes in.", "Nothing goes out. Everything comes in."], 3: ["Next week. I mean it.", "Next week. I mean it."] };

const suitSvg = (s, cls, fill = P.ink) => `<svg class="${cls}" viewBox="-1.1 -1.1 2.2 2.2" aria-hidden="true"><path d="${SUITS[s]}" fill="${fill}"/></svg>`;

export default {
  mount(root, api) {
    const K = "man-eater-short-rations-";
    const reduce = api.reducedMotion;
    const rng = api.rng();
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, reduce ? Math.min(ms, 250) : ms); timers.push(t); return t; };
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;background:radial-gradient(ellipse at 50% 45%,#2b302d 0%,${P.ink} 70%);color:${P.cream};font-family:'Courier Prime','Courier New',monospace}
      .${K}stage{position:relative;min-height:100%;display:grid;grid-template-rows:auto 1fr auto;gap:4px;padding:8px 16px 10px;box-sizing:border-box;max-width:1100px;margin:0 auto}
      .${K}top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
      .${K}box{background:rgba(27,29,31,.88);border:1px solid rgba(217,210,191,.3);padding:6px 10px;font-size:11.5px;line-height:1.4;min-width:150px}
      .${K}box h4{margin:0 0 4px;font-family:'Stardos Stencil',monospace;letter-spacing:.2em;font-size:12px;color:${P.sodium}}
      .${K}box svg{width:12px;height:12px;vertical-align:-2px;margin-right:4px}
      .${K}trk{display:grid;grid-template-columns:auto repeat(8,1fr);gap:1px 4px;font-size:11px}
      .${K}trk s{opacity:.35}
      .${K}table{position:relative;width:max(240px,min(92vw,560px,calc(100vh - 400px)));aspect-ratio:1;margin:4px auto;border-radius:50%;background:radial-gradient(circle at 50% 45%,${P.green},#3d4c41 70%,#2c362f);box-shadow:inset 0 0 0 10px #2a2f2b,inset 0 0 40px rgba(0,0,0,.6),0 20px 40px rgba(0,0,0,.5)}
      .${K}seat{position:absolute;transform:translate(-50%,-50%);text-align:center;font-size:12px;width:120px;pointer-events:none}
      .${K}seat .n{font-family:'Stardos Stencil',monospace;font-weight:700;letter-spacing:.12em;font-size:13px;text-transform:uppercase;background:${P.ink};padding:2px 8px;display:inline-block;border:1px solid rgba(217,210,191,.4)}
      .${K}seat .n svg{width:12px;height:12px;vertical-align:-2px;margin-right:4px}
      .${K}seat.turn .n{border-color:${P.sodium};color:${P.sodium}}
      .${K}seat .b{display:block;margin-top:3px;font-size:11.5px}
      .${K}seat .c.t{font-style:normal;letter-spacing:.2em;color:${P.sodium};min-height:0}.${K}seat .c{display:block;margin-top:2px;font-size:11px;font-style:italic;color:#e8e1cd;min-height:1.3em;text-shadow:0 1px 2px #000}
      .${K}seat.empty .n{opacity:.4;background:transparent}
      .${K}seat .chair{width:44px;height:16px;margin:0 auto 4px;background:#2a2f2b;border:1px solid rgba(217,210,191,.25)}
      .${K}trick{position:absolute;inset:0}
      .${K}basket{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:26%;aspect-ratio:1.6;border-radius:50%;background:#6b5536;box-shadow:inset 0 0 0 5px #4d3b23;display:flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:3px}
      .${K}loaf{width:28%;aspect-ratio:1.5;border-radius:50% 50% 40% 40%;background:#c99a5b;box-shadow:inset 0 -3px 0 #9c7240}
      .${K}card{--w:clamp(44px,9.5vw,74px);width:var(--w);aspect-ratio:120/172;background:${P.card};color:${P.ink};border-radius:6px;box-shadow:2px 3px 0 rgba(0,0,0,.35);position:relative;border:1px solid #7b7258;box-sizing:border-box;padding:0;font:inherit;display:block;background-image:radial-gradient(ellipse at 30% 70%,rgba(183,171,138,.35) 0 8%,transparent 9%),radial-gradient(ellipse at 75% 25%,rgba(183,171,138,.3) 0 6%,transparent 7%)}
      .${K}card::before{content:"";position:absolute;inset:6%;border:1.5px dashed ${P.ink};border-radius:3px;opacity:.85}
      .${K}card .r{position:absolute;left:12%;top:5%;font-family:'Stardos Stencil',monospace;font-weight:700;font-size:calc(var(--w)*.38);line-height:1}
      .${K}card .s{position:absolute;left:28%;top:36%;width:44%;height:auto}
      .${K}card .l{position:absolute;left:0;right:0;bottom:8%;text-align:center;font-family:'Stardos Stencil',monospace;font-size:calc(var(--w)*.13);letter-spacing:.06em;color:#4d4638;text-transform:uppercase}
      .${K}trick .${K}card{position:absolute;transform:translate(-50%,-50%);--w:clamp(40px,8vw,62px)}
      .${K}hand{display:flex;justify-content:center;flex-wrap:nowrap;padding:6px 0 4px;min-height:96px}
      .${K}hand.tremble{animation:${K}shake .18s infinite}
      @keyframes ${K}shake{0%{transform:translate(0,0)}25%{transform:translate(2px,-1px)}50%{transform:translate(-1px,1px)}75%{transform:translate(1px,2px)}100%{transform:translate(0,0)}}
      .${K}hand .${K}card{margin:0 -6px;cursor:pointer;transition:transform .12s}
      .${K}hand .${K}card[disabled]{cursor:default;filter:brightness(.62)}
      .${K}hand .${K}card:not([disabled]):hover,.${K}hand .${K}card:not([disabled]):focus-visible{transform:translateY(-12px);outline:none;box-shadow:0 0 0 3px ${P.sodium},2px 3px 0 rgba(0,0,0,.35)}
      .${K}hand .${K}card.win::after{content:"";position:absolute;left:18%;right:18%;bottom:3%;height:2px;background:#9b2f22;opacity:.7}
      .${K}bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;min-height:44px;font-size:13.5px;text-align:center}
      .${K}bar button,.${K}intro button{font:inherit;font-weight:700;background:${P.cream};color:${P.ink};border:0;min-width:40px;min-height:40px;padding:6px 12px;cursor:pointer}
      .${K}bar button[disabled]{opacity:.25;cursor:not-allowed;text-decoration:line-through}
      .${K}bar button:focus-visible,.${K}intro button:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,29,31,.84);z-index:5;padding:16px}
      .${K}panel{max-width:560px;background:${P.card};color:${P.ink};padding:22px;border:2px dashed ${P.ink};outline:10px solid ${P.card}}
      .${K}panel h2{margin:0 0 8px;font-family:'Stardos Stencil',monospace;font-size:30px;letter-spacing:.08em;text-transform:uppercase}
      .${K}panel p{margin:0 0 10px;font-size:14.5px;line-height:1.45}
      .${K}stamp{display:inline-block;border:2px solid #9b2f22;color:#9b2f22;font-family:'Stardos Stencil',monospace;font-size:10px;padding:0 4px;transform:rotate(-8deg);letter-spacing:.1em}
      @media (max-width:520px){.${K}seat{width:96px}.${K}box{min-width:0;flex:1}.${K}hand .${K}card{margin:0 -9px}}
    </style>
    <div class="${K}stage">
      <div class="${K}top">
        <div class="${K}box ${K}bids"><h4>BIDS</h4><div></div></div>
        <div class="${K}box" style="text-align:center"><h4>IN ISSUE</h4><div class="${K}issue"></div></div>
        <div class="${K}box ${K}tracker"><h4>TRACKER</h4><div class="${K}trk"></div></div>
      </div>
      <div><div class="${K}table"><div class="${K}trick"></div><div class="${K}basket" aria-label="Bread basket"></div></div></div>
      <div><div class="${K}bar" aria-live="polite"></div><div class="${K}hand" role="group" aria-label="Your hand"></div></div>
    </div>
    <div class="${K}intro"><div class="${K}panel">
      <h2>Short Rations</h2>
      <p>Day 4, the evening game. Four seats, one suit each, 32 cards. Bid how many of the 8 tricks you will take, then follow suit; the dealer's suit is trumps.</p>
      <p><b>Only players who take exactly their bid get a loaf</b>, and the basket holds one fewer than the seats. Two hands. Jax taps the table before he plays.</p>
      <p style="font-size:12.5px;color:#4d4638">Click a card or use the arrow keys and Enter. Number keys bid. Pell's and Duarte's chairs are pushed in. <span class="${K}stamp">WITHDRAWN</span></p>
      <button type="button" data-start>Deal</button>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const tableEl = $("table"), trickEl = $("trick"), basketEl = $("basket"), barEl = $("bar"), handEl = $("hand");
    const intro = $("intro");

    const POS = { s: [50, 88], w: [9, 50], n: [50, 8], e: [91, 50], nw: [20, 18], ne: [80, 18] };
    const TRICK_POS = [[50, 66], [29, 50], [50, 37], [71, 50]];
    const seatEls = [];
    for (const [i, st] of [...SEATS, ...EMPTY].entries()) {
      const d = document.createElement("div");
      d.className = K + "seat" + (i >= 4 ? " " + K + "empty empty" : "");
      d.style.left = POS[st.pos][0] + "%"; d.style.top = POS[st.pos][1] + "%";
      d.innerHTML = i >= 4 ? `<div class="chair"></div><span class="n">${suitSvg(st.suit, "", P.cream)}</span>` : `<span class="n">${suitSvg(st.suit, "", P.cream)}${st.name}</span><span class="b"></span><span class="c"></span><span class="c t"></span>`;
      if (i >= 4) d.querySelector(".n").setAttribute("aria-label", "An empty chair, pushed in");
      tableEl.appendChild(d);
      if (i < 4) seatEls.push(d);
    }
    // seat label positions at the table edge are inside the round; keep south label above the hand
    seatEls[0].style.top = "95%";

    // ---- game state
    let hand = 0, dealer = 3, hands = [[], [], [], []], bids = [null, null, null, null], taken = [0, 0, 0, 0];
    let trick = [], leader = 0, turn = 0, played = [], loaves = 3, fiskBread = 0, phase = "intro", sel = 0;
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
    const cardHtml = (c, cls = "") => `<span class="r">${c.rank}</span>${suitSvg(c.suit, "s")}<span class="l">${c.suit.slice(0, 5)}</span>`;
    const label = (c) => `${c.rank} of ${c.suit}`;
    // b is the card winning so far (always the led suit or a trump)
    const beats = (a, b) => (a.suit === b.suit ? a.rank > b.rank : a.suit === trump());
    function winnerOf(tr) {
      let w = tr[0];
      for (const t of tr.slice(1)) if (beats(t.card, w.card, tr[0].card.suit)) w = t;
      return w;
    }
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
      if (p === dealer) {
        const sum = bids.reduce((a, x) => a + (x ?? 0), 0);
        if (sum + b === 8) b = b > 0 ? b - 1 : b + 1;
      }
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
      const led = trick[0].card.suit;
      const wins = L.filter((c) => beats(c, cur, led));
      const loses = L.filter((c) => !beats(c, cur, led));
      if (need > 0 && wins.length) return wins[0];
      if (need <= 0 && loses.length) return loses[loses.length - 1];
      return L[0];
    }

    // ---- render
    function renderTop() {
      const bidsBox = $("bids").querySelector("div");
      bidsBox.innerHTML = SEATS.map((st, i) => `<div>${suitSvg(st.suit, "", P.cream)}${st.name.padEnd(7, " ")} ${bids[i] ?? "–"} · took ${taken[i]}</div>`).join("") + `<div style="margin-top:4px;color:${P.sodium}">TRUMPS: ${trump().toUpperCase()} · HAND ${hand}/2</div>`;
      $("issue").innerHTML = `<div style="font-family:'Stardos Stencil',monospace;font-size:26px;line-height:1">32</div><div>${EMPTY.map((e) => `${suitSvg(e.suit, "", P.cream)}<span class="${K}stamp">WITHDRAWN</span>`).join("<br>")}</div>`;
      const trk = $("trk");
      trk.innerHTML = SEATS.map((st) => `<span>${suitSvg(st.suit, "", P.cream)}</span>` + [1, 2, 3, 4, 5, 6, 7, 8].map((r) => (played.some((c) => c.suit === st.suit && c.rank === r) ? `<s>${r}</s>` : `<span>${r}</span>`)).join("")).join("");
      seatEls.forEach((el, i) => { el.classList.toggle("turn", turn === i && phase === "play"); el.querySelector(".b").textContent = bids[i] == null ? "" : `bid ${bids[i]} · took ${taken[i]}`; });
      basketEl.innerHTML = `<div class="${K}loaf"></div>`.repeat(loaves);
      basketEl.setAttribute("aria-label", `Bread basket, ${loaves} loaves`);
    }
    function renderTrick() {
      trickEl.innerHTML = "";
      for (const t of trick) {
        const d = document.createElement("div");
        d.className = K + "card"; d.innerHTML = cardHtml(t.card);
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
        b.type = "button"; b.className = K + "card"; b.innerHTML = cardHtml(c);
        const ok = L.includes(c);
        b.disabled = !ok;
        if (ok && cur && beats(c, cur, trick[0].card.suit)) b.classList.add("win");
        b.setAttribute("aria-label", label(c) + (ok ? "" : ", cannot play now"));
        b.addEventListener("click", () => fiskPlay(c));
        handEl.appendChild(b);
      });
      if (myTurn) { const btns = [...handEl.querySelectorAll("button:not([disabled])")]; sel = Math.min(sel, btns.length - 1); btns[Math.max(0, sel)]?.focus({ preventScroll: true }); }
    }
    const caption = (p, text) => { seatEls[p].querySelector(".c").textContent = text; };
    const bar = (html) => { barEl.innerHTML = html; };

    // ---- flow
    function startHand() {
      hand++;
      dealer = hand === 1 ? 3 : 0;
      deal();
      phase = "bid";
      [1, 2, 3].forEach((p) => caption(p, LINES[p][hand - 1] || "")); seatEls[1].querySelector(".t").textContent = "";
      renderTop(); renderTrick(); renderHand();
      bar(`Hand ${hand}. ${SEATS[dealer].name} deals; trumps are <b>${trump()}</b>.`);
      later(nextBid, 700);
    }
    const bidOrder = () => [1, 2, 3, 4].map((k) => (dealer + k) % 4);
    function nextBid() {
      const p = bidOrder().find((q) => bids[q] == null);
      if (p == null) { phase = "play"; turn = leader; renderTop(); bar(`Bids are in: ${bids.reduce((a, b) => a + b, 0)} of 8. ${SEATS[leader].name} leads.`); return later(step, 700); }
      if (p !== 0) { bids[p] = aiBid(p); renderTop(); return later(nextBid, 450); }
      // Fisk bids
      const sum = bids.reduce((a, x) => a + (x ?? 0), 0);
      const forbid = dealer === 0 ? 8 - sum : -1;
      bar(`<span>Your bid${dealer === 0 ? " (you deal: not " + forbid + ")" : ""}:</span>` + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<button type="button" data-bid="${n}" ${n === forbid ? "disabled" : ""}>${n}</button>`).join(""));
      barEl.querySelectorAll("[data-bid]").forEach((b) => b.addEventListener("click", () => fiskBid(+b.dataset.bid)));
      barEl.querySelector("[data-bid]:not([disabled])")?.focus();
    }
    function fiskBid(n) {
      if (phase !== "bid" || bids[0] != null) return;
      const sum = bids.reduce((a, x) => a + (x ?? 0), 0);
      if (dealer === 0 && sum + n === 8) return;
      bids[0] = n; renderTop(); bar(`You bid ${n}.`); later(nextBid, 350);
    }
    function step() {
      if (phase !== "play") return;
      renderTop();
      if (trick.length === 4) return later(resolveTrick, 250);
      if (turn === 0) { bar(trick.length ? `Your play. Follow ${trick[0].card.suit} if you can.` : "Your lead."); renderHand(); return; }
      later(() => { playCard(turn, aiPlay(turn)); }, 520);
    }
    function playCard(p, c) {
      hands[p] = hands[p].filter((x) => x !== c);
      trick.push({ p, card: c }); played.push(c);
      // Jax taps as soon as the suit is led: one tap per card above 5 he holds in it
      if (trick.length === 1 && p !== 1) {
        const n = hands[1].filter((x) => x.suit === c.suit && x.rank > 5).length;
        seatEls[1].querySelector(".t").textContent = n ? "tap ".repeat(n).trim() : "(no taps)";
      }
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
      bar(`${w.p === 0 ? "You take" : SEATS[w.p].name + " takes"} the trick with the ${label(w.card)}.`);
      renderTop();
      later(() => {
        trick = []; renderTrick(); leader = w.p; turn = w.p;
        if (hands[0].length === 0) return endHand();
        step();
      }, 900);
    }
    function endHand() {
      phase = "settle";
      // exact bidders take a loaf, higher bids first; the basket runs out
      const exact = [0, 1, 2, 3].filter((p) => bids[p] === taken[p]).sort((a, b) => bids[b] - bids[a]);
      const got = [];
      for (const p of exact) { if (loaves > 0) { loaves--; got.push(p); if (p === 0) fiskBread++; } }
      renderTop();
      const missed = exact.filter((p) => !got.includes(p));
      const fisk = got.includes(0) ? "You took exactly your bid: a loaf." : bids[0] === taken[0] ? "You made your bid, but the basket was empty." : `You bid ${bids[0]} and took ${taken[0]}. No bread.`;
      bar(`<span>${fisk} ${got.filter((p) => p).map((p) => SEATS[p].name).join(", ") || "No one else"} ${got.filter((p) => p).length ? "took" : "took"} bread.${missed.length && !missed.includes(0) ? " " + missed.map((p) => SEATS[p].name).join(", ") + " went without." : ""}</span> <button type="button" data-next>${hand < 2 ? "Next hand" : "Settle the bread"}</button>`);
      const nb = barEl.querySelector("[data-next]");
      nb.addEventListener("click", () => (hand < 2 ? startHand() : settle()));
      nb.focus();
    }
    function settle() {
      phase = "done";
      handEl.innerHTML = "";
      if (!fiskBread) {
        bar("No bread tonight.");
        return api.end({ outcome: "lose", text: "No bread tonight. Missing your bid means the basket passes you by, and the night will be harder: without a loaf, staying in the bunk at 10:00 costs more." });
      }
      const out = [];
      let i = 0;
      const ask = () => {
        if (i >= fiskBread) {
          const kept = out.filter((o) => o === "keep").length;
          return api.end({ outcome: "win", text: `Bread: ${fiskBread} ${fiskBread > 1 ? "loaves" : "loaf"}. ${out.map((o) => (o === "keep" ? "Banked one" : o === "eat" ? "Ate one now (hunger −25)" : `Gave one to ${o} (pull −15${o === "Jax" ? ", trust +10" : ""})`)).join(". ")}.${kept ? "" : ""} Feeding someone does not save them; it moves the call to someone else, one night at a time.` });
        }
        bar(`<span>Loaf ${i + 1} of ${fiskBread}:</span><button type="button" data-o="keep">Keep it</button><button type="button" data-o="eat">Eat it now</button>` + [1, 2, 3].map((p) => `<button type="button" data-o="${SEATS[p].name}">Give to ${SEATS[p].name}</button>`).join(""));
        barEl.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { out.push(b.dataset.o); i++; ask(); }));
        barEl.querySelector("[data-o]").focus();
      };
      ask();
    }

    // ---- keyboard
    const onKey = (e) => {
      if (phase === "bid" && bids[0] == null && /^[0-8]$/.test(e.key) && barEl.querySelector("[data-bid]")) { fiskBid(+e.key); e.preventDefault(); return; }
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
        wrap.remove();
      },
    };
  },
};

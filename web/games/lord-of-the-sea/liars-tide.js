// The Lord of the Sea: Liar's Tide (1D, sailor's tattoo flash).
// `g-liars-tidewater` from DESIGN.md section 11: Alexi against Wenna and two dockhands, the stake
// is news. Tide dice (1 Gull, 2 Shell, 3 Rope, 4 Bottle, 5 Lantern, 6 Wave); Gulls are wild until
// someone bids on Gulls that round; one shared tide die counts for everyone. Bid a quantity and a
// face, or call the tide. Once a round Alexi may stir the cup: secretly re-roll up to two of his
// dice, and the table's suspicion rises 25 (Tidewater's Wild is 10, so no "sea's luck"); it falls
// 10 a round he does not stir. At 100 he is caught. Last with dice wins.
// Cut to fit: four dice each instead of five, so a game is a few minutes.

const RED = "#8C2B2B", GREEN = "#2F6B5E", GOLD = "#E7A93B", INK = "#17140f", SKIN = "#F1E3C6", PAPER = "#E9DBBB", BLUE = "#1F2E4A";
const FACES = ["", "Gull", "Shell", "Rope", "Bottle", "Lantern", "Wave"];
const PLURAL = ["", "Gulls", "Shells", "Ropes", "Bottles", "Lanterns", "Waves"];
const NUMW = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen"];
const DICE = 4;

function icon(face, s = 40, col = INK) {
  const st = `fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const body = {
    1: `<path d="M3 15 Q10 6 20 14 Q30 6 37 15 Q30 12 22 19 L20 27 L18 19 Q10 12 3 15Z" fill="${BLUE}" ${st.replace('fill="none" ', "")}/><path d="M18 27 L20 33 L22 27" ${st}/>`,
    2: `<path d="M20 33 L5 17 Q8 6 20 6 Q32 6 35 17 Z" fill="${SKIN}" ${st.replace('fill="none" ', "")}/><path d="M20 33 L11 9 M20 33 L20 6 M20 33 L29 9 M20 33 L6 15 M20 33 L34 15" ${st}/>`,
    3: `<path d="M8 28 Q4 12 16 10 Q28 8 26 20 Q24 30 14 24 Q6 18 18 14 Q34 10 34 26" ${st} stroke-width="3.4" stroke="${GOLD}"/><path d="M8 28 Q4 12 16 10 Q28 8 26 20 Q24 30 14 24 Q6 18 18 14 Q34 10 34 26" ${st}/>`,
    4: `<path d="M16 4 h8 v8 q6 3 6 10 v12 q0 3 -3 3 h-14 q-3 0 -3 -3 v-12 q0 -7 6 -10z" fill="${GREEN}" ${st.replace('fill="none" ', "")}/><path d="M14 22 h12" ${st} stroke="${SKIN}"/>`,
    5: `<path d="M14 9 h12 l3 4 v16 l-3 4 h-12 l-3 -4 v-16z" fill="${GOLD}" ${st.replace('fill="none" ', "")}/><circle cx="20" cy="6" r="3" ${st}/><path d="M20 15 q4 5 0 11 q-4 -6 0 -11z" fill="${RED}" stroke="${INK}" stroke-width="1.6"/>`,
    6: `<path d="M3 30 Q8 14 20 14 Q30 14 30 22 Q30 27 25 27 Q21 27 22 22 Q16 22 16 30" fill="${GREEN}" ${st.replace('fill="none" ', "")}/><path d="M3 34 h34" ${st}/>`,
  }[face];
  return `<svg viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true">${body}</svg>`;
}

export default {
  mount(root, api) {
    const P = "lord-of-the-sea-liars-tide-";
    const rng = api.rng();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, api.reducedMotion ? Math.min(ms, 350) : ms); timers.add(id); };
    const roll = () => 1 + Math.floor(rng() * 6);

    const players = [
      { name: "Alexi", you: true, dice: [], count: DICE },
      { name: "Wenna", dice: [], count: DICE, bluff: 0.1, thresh: 0.65, eye: GREEN, tell: true },
      { name: "Dockhand", dice: [], count: DICE, bluff: 0.2, thresh: 0.5, eye: RED },
      { name: "Dockhand", dice: [], count: DICE, bluff: 0.2, thresh: 0.5, eye: BLUE },
    ];
    players[2].name = "Tall dockhand"; players[3].name = "Short dockhand";
    const S = {
      phase: "how", turn: 0, starter: 0, bid: null, bidder: -1, gullBid: false, tide: 1, ledger: [], round: 0,
      suspicion: 0, stirredThisRound: false, stirring: false, pick: new Set(), selQ: 1, selF: 2, speech: {}, hintUsed: false,
      reveal: null, log: "",
    };

    root.innerHTML = `
    <style>
      .${P}w { position:absolute; inset:0; overflow:auto; background:${PAPER}; color:${INK}; font-family:'IM Fell English',Georgia,serif;
        background-image: radial-gradient(${INK}22 1px, transparent 1.4px); background-size: 9px 9px; }
      .${P}frame { min-height:100%; box-sizing:border-box; border:10px solid ${GOLD}; outline:3px solid ${INK}; outline-offset:-13px; padding:16px clamp(10px,3vw,30px) 22px; display:grid; gap:12px; align-content:start; }
      .${P}rye { font-family:'Rye','IM Fell English',Georgia,serif; letter-spacing:.03em; }
      .${P}sailors { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; text-align:center; }
      .${P}sailor { min-width:0; display:grid; justify-items:center; gap:2px; padding:6px 4px; border:3px solid ${INK}; background:${SKIN}; border-radius:14px; position:relative; }
      .${P}sailor.turn { box-shadow:0 0 0 4px ${GOLD}; }
      .${P}sailor.out { opacity:.4; }
      .${P}sailor .nm { font-size:clamp(14px,1.7vw,19px); }
      .${P}sailor .cup { display:flex; gap:3px; flex-wrap:wrap; justify-content:center; min-height:26px; }
      .${P}pip { width:16px; height:16px; border:2.5px solid ${INK}; border-radius:4px; background:${SKIN}; }
      .${P}say { font-size:15px; min-height:2.6em; font-style:italic; line-height:1.25; max-width:24ch; }
      .${P}sus { display:flex; align-items:center; gap:10px; justify-content:center; }
      .${P}bar { width:min(320px,42vw); height:16px; border:3px solid ${INK}; background:${SKIN}; border-radius:10px; overflow:hidden; }
      .${P}bar i { display:block; height:100%; background:${RED}; transition:width .4s; }
      .${P}mid { display:grid; grid-template-columns:auto minmax(0,1fr) minmax(120px,190px); gap:14px; align-items:center; }
      .${P}tide { display:grid; justify-items:center; gap:4px; font-size:13px; letter-spacing:.12em; }
      .${P}die { display:grid; place-items:center; width:58px; height:58px; border:3.5px solid ${INK}; border-radius:12px; background:${SKIN}; box-shadow:4px 4px 0 ${INK}; position:relative; }
      .${P}die.tide { background:${GOLD}; width:70px; height:70px; }
      .${P}die.hit { background:#bfe0c9; }
      .${P}banner { text-align:center; position:relative; z-index:0; }
      .${P}swal { display:inline-block; vertical-align:middle; margin:0 22px; }
      @media (max-width:560px) { .${P}swal { display:none; } }
      .${P}ribbon { display:inline-block; background:${RED}; color:${SKIN}; padding:10px 26px; border:3px solid ${INK}; font-size:clamp(18px,3vw,30px); position:relative; box-shadow:4px 4px 0 ${INK}; }
      .${P}ribbon::before, .${P}ribbon::after { content:""; position:absolute; top:10px; width:22px; height:100%; background:${RED}; border:3px solid ${INK}; z-index:-1; }
      .${P}ribbon::before { left:-18px; clip-path:polygon(0 0,100% 0,100% 100%,0 100%,40% 50%); }
      .${P}ribbon::after { right:-18px; clip-path:polygon(0 0,100% 0,60% 50%,100% 100%,0 100%); }
      .${P}note { margin-top:10px; font-size:16px; min-height:1.3em; }
      .${P}ledger { background:#2b2a26; color:#efe9da; border:3px solid ${INK}; border-radius:6px; padding:8px 10px; font-size:14px; max-height:190px; overflow:auto; line-height:1.35; }
      .${P}ledger b { font-family:'Rye',Georgia,serif; font-weight:400; font-size:12px; letter-spacing:.1em; display:block; margin-bottom:4px; color:${GOLD}; }
      .${P}you { display:grid; gap:10px; justify-items:center; border:3px solid ${INK}; border-radius:16px; background:${SKIN}; padding:12px; }
      .${P}mine { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; touch-action:none; padding:10px 18px; border-radius:50%/40%; background:${GREEN}; border:3.5px solid ${INK}; }
      .${P}mine .${P}die { cursor:pointer; }
      .${P}mine .${P}die.pick { transform:translateY(-8px) rotate(-6deg); box-shadow:4px 10px 0 ${INK}; background:${GOLD}; }
      .${P}ctl { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; align-items:center; }
      .${P}ctl button, .${P}how button { font:inherit; font-size:17px; color:${INK}; background:${SKIN}; border:3px solid ${INK}; border-radius:10px; padding:7px 14px; cursor:pointer; box-shadow:3px 3px 0 ${INK}; }
      .${P}ctl button:disabled { opacity:.4; cursor:default; box-shadow:none; }
      .${P}ctl button.main { background:${RED}; color:${SKIN}; }
      .${P}ctl button.stir { background:${GREEN}; color:${SKIN}; }
      .${P}pickbid { display:flex; align-items:center; gap:6px; border:3px solid ${INK}; border-radius:10px; padding:4px 8px; background:#fff8e6; }
      .${P}pickbid .q { font-family:'Rye',Georgia,serif; font-size:24px; min-width:2ch; text-align:center; }
      .${P}pickbid button { padding:3px 10px; box-shadow:none; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:${PAPER}ee; z-index:3; padding:16px; }
      .${P}how div { max-width:520px; background:${SKIN}; border:4px solid ${INK}; border-radius:18px; padding:20px 22px; box-shadow:6px 6px 0 ${INK}; }
      .${P}how h2 { margin:0 0 8px; font-weight:400; font-size:30px; color:${RED}; }
      .${P}how p { margin:0 0 10px; font-size:16px; line-height:1.4; }
      @media (max-width:480px) { .${P}pip { width:11px; height:11px; border-width:2px; } .${P}sailor .nm { font-size:13px; } .${P}frame { padding-left:8px; padding-right:8px; } }
      @media (max-width:720px) { .${P}mid { grid-template-columns:1fr; justify-items:center; } .${P}ledger { width:100%; box-sizing:border-box; max-height:110px; } }
    </style>
    <div class="${P}w"><div class="${P}frame"></div>
      <div class="${P}how" role="dialog" aria-label="How to play"><div>
        <h2 class="${P}rye">Liar's Tide</h2>
        <p>You, Wenna and two dockhands each hide four tide dice under a horn cup; one tide die in the middle counts for everyone, and Gulls are wild until someone bids on Gulls. Bid how many of a face are on the whole table, raising each time, or <b>call the tide</b>: if the bid fails the bidder loses a die, if it holds the caller does.</p>
        <p>Once a round you may <b>stir the cup</b>: pick up to two of your dice and circle over the cup to re-roll them. Every stir draws the sailors' eyes. Last with dice wins the news.</p>
        <button type="button">Take a seat</button>
      </div></div>
    </div>`;
    const w = root.querySelector("." + P + "w");
    const frame = w.querySelector("." + P + "frame");
    const how = w.querySelector("." + P + "how");

    const active = () => players.map((p, i) => i).filter((i) => players[i].count > 0);
    const nextActive = (i) => { for (let k = 1; k <= 4; k++) { const j = (i + k) % 4; if (players[j].count > 0) return j; } return i; };
    const totalDice = () => players.reduce((a, p) => a + p.count, 0) + 1;
    const wild = (face) => face !== 1 && !S.gullBid;
    const bidName = (b) => `${NUMW[b.q] || b.q} ${b.q === 1 ? FACES[b.f] : PLURAL[b.f]}`;
    const legal = (q, f) => !S.bid || q > S.bid.q || (q === S.bid.q && f > S.bid.f);

    function binomTail(n, p, k) { // P(X >= k)
      if (k <= 0) return 1; if (k > n) return 0;
      let s = 0, c = 1;
      for (let i = 0; i <= n; i++) { if (i > 0) c = (c * (n - i + 1)) / i; if (i >= k) s += c * p ** i * (1 - p) ** (n - i); }
      return s;
    }
    function probHolds(pi, q, f, gullsNotWild) {
      const me = players[pi];
      const w2 = f !== 1 && !gullsNotWild;
      const match = (v) => v === f || (w2 && v === 1);
      const known = me.dice.filter(match).length + (match(S.tide) ? 1 : 0);
      const unknown = totalDice() - 1 - me.count;
      return binomTail(unknown, w2 ? 2 / 6 : 1 / 6, q - known);
    }
    function trueCount(q, f) {
      const w2 = wild(f);
      const match = (v) => v === f || (w2 && v === 1);
      let n = match(S.tide) ? 1 : 0;
      for (const p of players) n += p.dice.filter(match).length;
      return n;
    }

    function newRound(starter) {
      S.round++;
      for (const p of players) p.dice = Array.from({ length: p.count }, roll);
      S.tide = roll(); S.bid = null; S.bidder = -1; S.gullBid = false; S.reveal = null; S.speech = {};
      if (!S.stirredThisRound && S.round > 1) S.suspicion = Math.max(0, S.suspicion - 10);
      S.stirredThisRound = false; S.stirring = false; S.pick.clear(); S.hintUsed = false;
      S.starter = players[starter].count ? starter : nextActive(starter);
      S.turn = S.starter; S.phase = "play";
      S.ledger.push({ round: S.round });
      S.selQ = 1; S.selF = 2;
      S.log = S.turn === 0 ? "You open the bidding." : `${players[S.turn].name} opens.`;
      render();
      if (S.turn !== 0) later(aiTurn, 1100);
    }

    function placeBid(pi, q, f) {
      S.bid = { q, f }; S.bidder = pi;
      if (f === 1) S.gullBid = true;
      S.ledger.push({ who: players[pi].name, text: bidName(S.bid) });
      if (pi !== 0) S.speech[pi] = `“${cap(bidName(S.bid))}.”`;
      S.turn = nextActive(pi);
      S.log = pi === 0 ? `You bid ${bidName(S.bid)}.` : `${players[pi].name} bids ${bidName(S.bid)}.`;
      if (S.turn !== 0) { const p = players[S.turn]; if (p.tell && hasThree(p)) S.speech[S.turn] = "(counting under her breath: one, two, three…)"; }
      render();
      if (S.turn !== 0) later(aiTurn, 1200);
      else { S.selQ = S.bid.q; S.selF = S.bid.f; bumpSel(); render(); }
    }
    const hasThree = (p) => [1, 2, 3, 4, 5, 6].some((f) => p.dice.filter((v) => v === f).length >= 3);
    const cap = (s) => s[0].toUpperCase() + s.slice(1);

    function aiTurn() {
      if (S.phase !== "play") return;
      const pi = S.turn, me = players[pi];
      if (S.bid) {
        const pc = probHolds(pi, S.bid.q, S.bid.f, S.gullBid);
        if (pc < 0.3) { callTide(pi); return; }
      }
      // candidate raises: the smallest legal quantity for each face, and one more
      let best = null;
      for (let f = 1; f <= 6; f++) {
        let q = S.bid ? (f > S.bid.f ? S.bid.q : S.bid.q + 1) : 1;
        for (const qq of [q, q + 1]) {
          if (qq > totalDice()) continue;
          const pr = probHolds(pi, qq, f, S.gullBid || f === 1);
          const score = pr - (qq - q) * 0.05;
          if (!best || score > best.score) best = { q: qq, f, pr, score };
        }
      }
      if (best && best.pr >= me.thresh) { placeBid(pi, best.q, best.f); return; }
      if (rng() < me.bluff || !S.bid) {
        const counts = [0, 0, 0, 0, 0, 0, 0]; me.dice.forEach((v) => counts[v]++);
        const f = 2 + counts.slice(2).indexOf(Math.max(...counts.slice(2)));
        const q = S.bid ? (f > S.bid.f ? S.bid.q : S.bid.q + 1) : Math.max(1, counts[f] + 1);
        if (q <= totalDice()) { placeBid(pi, q, f); return; }
      }
      if (S.bid && probHolds(pi, S.bid.q, S.bid.f, S.gullBid) < 0.5) { callTide(pi); return; }
      if (best) placeBid(pi, best.q, best.f); else callTide(pi);
    }

    function callTide(pi) {
      const n = trueCount(S.bid.q, S.bid.f);
      const holds = n >= S.bid.q;
      const loser = holds ? pi : S.bidder;
      players[loser].count--;
      S.reveal = { caller: pi, n, holds, loser, face: S.bid.f, wild: wild(S.bid.f) };
      S.ledger.push({ who: players[pi].name, text: "calls the tide", strong: true });
      S.speech[pi] = pi === 0 ? "" : "“Lift the cups.”";
      S.log = `${pi === 0 ? "You call" : players[pi].name + " calls"} the tide. ${cap(NUMW[n] || String(n))} on the table: the bid ${holds ? "holds" : "fails"}. ${loser === 0 ? "You lose" : players[loser].name + " loses"} a die.`;
      S.phase = "reveal";
      S.nextStarter = loser;
      render();
      if (players[0].count === 0) later(() => end(false), 1800);
      else if (active().length === 1) later(() => end(true), 1800);
    }

    function end(won, caught) {
      if (S.phase === "over") return;
      S.phase = "over"; render();
      if (caught) api.end({ outcome: "lose", text: "Caught stirring the cup. The sailors' eyes were on him the whole time; the stake is forfeit and the news goes elsewhere." });
      else if (won) api.end({ outcome: "win", text: "Last with dice. Two pieces of news: where the Gullwife crew fish where they should not, and where the Kettle crew sing. Devotion +3." });
      else api.end({ outcome: "lose", text: "Out of dice. One piece of news anyway, from a dockhand who pities him: the Gullwife crew fish off the chart's edge." });
    }

    function doStir() {
      if (!S.pick.size) return;
      for (const i of S.pick) players[0].dice[i] = roll();
      S.pick.clear(); S.stirring = false; S.stirredThisRound = true;
      S.suspicion = Math.min(100, S.suspicion + 25);
      S.log = "You stir the cup. The water in the jug beside it turns too.";
      S.ledger.push({ who: "Alexi", text: "(a stir)", faint: true });
      render();
      if (S.suspicion >= 100) later(() => end(false, true), 900);
    }
    function bumpSel() { // smallest legal bid at or above the selection
      if (!S.bid) return;
      if (!legal(S.selQ, S.selF)) { if (S.selF < 6 && S.selQ === S.bid.q) S.selF = S.bid.f + 1; else { S.selQ = S.bid.q + 1; } }
    }

    // ---- render ----
    function render() {
      const you = players[0];
      const eyesToward = S.suspicion / 100;
      const sailor = (i) => {
        const p = players[i];
        const px = 0, py = eyesToward * 5; // pupils drop toward the player
        const eye = (cx) => `<g transform="translate(${cx},20)"><path d="M-17 0 Q0 -14 17 0 Q0 14 -17 0Z" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${px}" cy="${py.toFixed(1)}" r="${6 + eyesToward * 2}" fill="${p.eye}" stroke="${INK}" stroke-width="2"/><circle cx="${px}" cy="${py.toFixed(1)}" r="2.5" fill="${INK}"/>${S.suspicion >= 50 ? `<path d="M-14 -13 L14 ${-13 + eyesToward * 8}" stroke="${INK}" stroke-width="3"/>` : ""}</g>`;
        const showDice = S.phase !== "play" && S.reveal;
        const cupHtml = showDice
          ? p.dice.map((v) => `<span class="${P}die" style="width:30px;height:30px;border-width:2.5px;box-shadow:2px 2px 0 ${INK}${matchesReveal(v) ? ";background:#bfe0c9" : ""}">${icon(v, 22)}</span>`).join("")
          : Array.from({ length: p.count }, () => `<span class="${P}pip"></span>`).join("");
        return `<div class="${P}sailor${S.turn === i && S.phase === "play" ? " turn" : ""}${p.count ? "" : " out"}">
          <svg viewBox="-40 0 80 40" style="width:100%;max-width:90px;height:auto" aria-hidden="true">${eye(-19)}${eye(19)}</svg>
          <div class="nm ${P}rye">${p.name}</div><div class="cup" aria-label="${p.count} dice">${cupHtml}</div>
          <div class="${P}say">${S.speech[i] || (p.count ? "" : "out")}</div></div>`;
      };
      const matchesReveal = (v) => S.reveal && (v === S.reveal.face || (S.reveal.wild && v === 1));
      const myTurn = S.phase === "play" && S.turn === 0;
      const canStir = S.phase === "play" && !S.stirredThisRound && you.count > 0;
      const ledger = S.ledger.slice(-18).map((l) => (l.round ? `<div style="opacity:.6">─ round ${l.round} ─</div>` : `<div${l.faint ? ' style="opacity:.5"' : ""}>${l.strong ? "<u>" : ""}${l.who}: ${l.text}${l.strong ? "</u>" : ""}</div>`)).join("");
      frame.innerHTML = `
        <div class="${P}sailors">${[1, 2, 3].map(sailor).join("")}</div>
        <div class="${P}sus"><span class="${P}rye" style="font-size:13px;letter-spacing:.15em">SUSPICION</span><span class="${P}bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${S.suspicion}" aria-label="Suspicion"><i style="width:${S.suspicion}%"></i></span><span>${S.suspicion}</span></div>
        <div class="${P}mid">
          <div class="${P}tide"><span class="${P}rye">TIDE DIE</span><span class="${P}die tide${matchesReveal(S.tide) ? " hit" : ""}">${icon(S.tide, 48)}</span><span>${FACES[S.tide]}</span></div>
          <div class="${P}banner">
            ${swallow(false)}<span class="${P}ribbon ${P}rye">${S.bid ? bidName(S.bid).toUpperCase() : "NO BID YET"}</span>${swallow(true)}
            <div class="${P}note" aria-live="polite">${esc(S.log)}${S.gullBid ? " <i>(Gulls are bid: not wild this round.)</i>" : ""}</div>
          </div>
          <div class="${P}ledger" aria-label="Bid ledger"><b>THE CHALK</b>${ledger}</div>
        </div>
        <div class="${P}you">
          <div class="${P}mine" aria-label="Your dice under the cup">${you.dice.map((v, i) => `<button type="button" class="${P}die${S.pick.has(i) ? " pick" : ""}${S.reveal && matchesReveal(v) ? " hit" : ""}" data-i="${i}" aria-label="${FACES[v]}${S.stirring ? (S.pick.has(i) ? ", picked to re-roll" : ", pick to re-roll") : ""}">${icon(v, 42)}</button>`).join("") || "<i>no dice</i>"}</div>
          <div class="${P}ctl">${controls(myTurn, canStir)}</div>
        </div>`;
      wire();
    }
    function controls(myTurn, canStir) {
      if (S.phase === "reveal") return players[0].count === 0 || active().length === 1 ? "<i>The cups are lifted.</i>" : `<button type="button" class="main" data-a="next">Next round</button>`;
      if (S.phase !== "play") return "";
      if (S.stirring) return `<span>Pick up to two dice, then circle over the cup (or press Stir).</span><button type="button" class="stir" data-a="dostir" ${S.pick.size ? "" : "disabled"}>Stir ${S.pick.size || ""}</button><button type="button" data-a="cancelstir">Leave it</button>`;
      const hint = !S.hintUsed && S.bid ? `<button type="button" data-a="hint" title="Trust 40+: the princess whispers the odds once a round">Whisper</button>` : "";
      return `<span class="${P}pickbid" aria-label="Your bid"><button type="button" data-a="q-" aria-label="Fewer">−</button><span class="q">${S.selQ}</span><button type="button" data-a="q+" aria-label="More">+</button>
        <button type="button" data-a="f-" aria-label="Previous face">◀</button>${icon(S.selF, 34)}<button type="button" data-a="f+" aria-label="Next face">▶</button></span>
        <button type="button" class="main" data-a="bid" ${myTurn && legal(S.selQ, S.selF) ? "" : "disabled"}>Bid ${S.selQ} ${S.selQ === 1 ? FACES[S.selF] : PLURAL[S.selF]}</button>
        <button type="button" data-a="call" ${myTurn && S.bid ? "" : "disabled"}>Call the tide</button>
        <button type="button" class="stir" data-a="stir" ${canStir ? "" : "disabled"}>Stir the cup</button>${hint}`;
    }
    function act(a) {
      if (a === "q+") S.selQ = Math.min(totalDice(), S.selQ + 1);
      if (a === "q-") S.selQ = Math.max(1, S.selQ - 1);
      if (a === "f+") S.selF = S.selF % 6 + 1;
      if (a === "f-") S.selF = ((S.selF + 4) % 6) + 1;
      if (a === "bid" && S.turn === 0 && S.phase === "play" && legal(S.selQ, S.selF)) { placeBid(0, S.selQ, S.selF); return; }
      if (a === "call" && S.turn === 0 && S.bid && S.phase === "play") { callTide(0); return; }
      if (a === "stir") { S.stirring = true; S.pick.clear(); }
      if (a === "cancelstir") { S.stirring = false; S.pick.clear(); }
      if (a === "dostir") { doStir(); return; }
      if (a === "hint" && S.bid) { S.hintUsed = true; const p = probHolds(0, S.bid.q, S.bid.f, S.gullBid); S.log = `The princess, low: “About ${Math.round(p * 100)} in a hundred that it holds.”`; }
      if (a === "next" && S.phase === "reveal" && players[0].count > 0 && active().length > 1) { newRound(S.nextStarter); return; }
      render();
    }
    // the circle gesture over the cup
    const gest = { on: false, ang: 0, last: null, cx: 0, cy: 0 };
    function wire() {
      frame.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => act(b.dataset.a)));
      frame.querySelectorAll(`.${P}mine [data-i]`).forEach((b) => b.addEventListener("click", () => {
        if (!S.stirring) { if (S.phase === "play" && !S.stirredThisRound) { S.stirring = true; } else return; }
        const i = +b.dataset.i;
        if (S.pick.has(i)) S.pick.delete(i); else if (S.pick.size < 2) S.pick.add(i);
        render();
      }));
      const cup = frame.querySelector("." + P + "mine");
      if (cup) {
        cup.addEventListener("pointerdown", (e) => { if (!S.stirring || !S.pick.size) return; const r = cup.getBoundingClientRect(); gest.on = true; gest.ang = 0; gest.last = null; gest.cx = r.left + r.width / 2; gest.cy = r.top + r.height / 2; });
        cup.addEventListener("pointermove", (e) => {
          if (!gest.on) return;
          const a = Math.atan2(e.clientY - gest.cy, e.clientX - gest.cx);
          if (gest.last != null) { let d = a - gest.last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; gest.ang += d; }
          gest.last = a;
          if (Math.abs(gest.ang) > Math.PI * 2 * 0.9) { gest.on = false; doStir(); }
        });
      }
    }
    const onUp = () => { gest.on = false; };
    addEventListener("pointerup", onUp);
    const onKey = (e) => {
      if (S.phase !== "play" && S.phase !== "reveal") return;
      const k = e.key;
      const map = { ArrowUp: "q+", ArrowDown: "q-", ArrowRight: "f+", ArrowLeft: "f-", b: "bid", c: "call", s: S.stirring ? "dostir" : "stir", n: "next" };
      if (k === "Enter" && S.phase === "reveal") { act("next"); e.preventDefault(); return; }
      if (map[k] && !(e.target instanceof HTMLButtonElement && k === "Enter")) { if (k.startsWith("Arrow")) e.preventDefault(); act(map[k]); }
      if (S.stirring && /^[1-4]$/.test(k)) { const i = +k - 1; if (i < players[0].dice.length) { S.pick.has(i) ? S.pick.delete(i) : S.pick.size < 2 && S.pick.add(i); render(); } }
    };
    addEventListener("keydown", onKey);
    const startBtn = how.querySelector("button");
    startBtn.addEventListener("click", () => { how.remove(); newRound(0); });
    startBtn.focus();
    // the table under the panel
    for (const p of players) p.dice = Array.from({ length: p.count }, roll);
    S.phase = "idle"; render();

    return {
      unmount() {
        timers.forEach(clearTimeout); timers.clear();
        removeEventListener("pointerup", onUp); removeEventListener("keydown", onKey);
        S.phase = "over";
      },
    };
  },
};

function swallow(flip) {
  return `<svg class="lord-of-the-sea-liars-tide-swal" viewBox="0 0 70 50" width="62" height="44" aria-hidden="true" style="${flip ? "transform:scaleX(-1)" : ""}">
    <path d="M6 30 Q20 8 44 14 L66 4 L54 18 Q62 22 66 30 L50 26 Q40 40 18 38 Q8 36 6 30Z" fill="${BLUE}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M10 31 Q22 36 40 28" fill="none" stroke="${RED}" stroke-width="5"/><path d="M10 31 Q22 36 40 28" fill="none" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="16" cy="25" r="2.4" fill="${INK}"/><path d="M6 30 L0 28 L5 33Z" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/></svg>`;
}
function esc(s) { return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

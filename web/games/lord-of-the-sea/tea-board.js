// The Lord of the Sea: The Tea Board (1D, blue-and-white export porcelain).
// `g-tea-parlour` from DESIGN.md section 11: the factor teaches the Company's parlour game as a
// courtesy. Six rounds, four ports (Home, Tidewater, Unwritten, Salt) on lanes L1, L2, L3, L5,
// three slots a lane, Debt off, fixed seed of two pieces each. One action a turn: Place, Shift,
// or (Alexi, at High tide, once) Stir a Chest off a lane touching a Wild port. A lane is held by
// more pieces; a port by more of its lanes, ties keep the holder. The tide clock doubles Chests
// near Ordered ports at Low and Hymns near Wild ports at High. More ports wins; a tie is the
// Company's. The factor is greedy, one move ahead, and plays at random three times in ten.

const COB = "#24448f", DEEP = "#1F2E4A", WHITE = "#F4F1E8", GLAZE = "#fbfbf8", GOLD = "#E7A93B", RED = "#8C2B2B";
const PORTS = {
  home: { name: "Home Reach", x: 190, y: 330, wild: 50, ly: -112 },
  tide: { name: "Tidewater", x: 500, y: 150, wild: 10 },
  unw: { name: "The Unwritten", x: 430, y: 520, wild: 85 },
  salt: { name: "Salt Steps", x: 790, y: 390, wild: 45 },
};
const LANES = [
  { id: "L1", a: "home", b: "tide", bend: -50 },
  { id: "L2", a: "home", b: "unw", bend: 40 },
  { id: "L3", a: "home", b: "salt", bend: -20 },
  { id: "L5", a: "unw", b: "salt", bend: 40 },
];
const PHASES = ["Low", "Low", "Rising", "Rising", "High", "High"];
const ROUNDS = 6;

export default {
  mount(root, api) {
    const P = "lord-of-the-sea-tea-board-";
    const rng = api.rng();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, api.reducedMotion ? Math.min(ms, 300) : ms); timers.add(id); };

    const S = {
      slots: { L1: [null, "C", null], L2: ["A", null, null], L3: [null, "C", null], L5: [null, "A", null] },
      reserve: { A: 5, C: 6 },
      holder: { home: "A", unw: "A", tide: "C", salt: "C" },
      round: 1, turn: "C", acted: { C: false, A: false },
      sel: null, stirMode: false, stirUsed: false, hints: 3, hint: null,
      ledger: [], msg: "", over: false, started: false,
    };

    root.innerHTML = `
    <style>
      .${P}w { position:absolute; inset:0; overflow:auto; background:${WHITE}; color:${DEEP}; font-family:'IM Fell English',Georgia,serif; }
      .${P}lay { display:grid; grid-template-columns: 170px minmax(0,1fr); gap:12px; padding:12px clamp(8px,2vw,22px) 18px; max-width:1240px; margin:0 auto; }
      .${P}ledger { border:2px solid ${COB}; background:${GLAZE}; padding:8px; font-size:14px; line-height:1.35; max-height:560px; overflow:auto; }
      .${P}ledger h3, .${P}res h3 { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; font-size:13px; letter-spacing:.14em; margin:0 0 6px; color:${COB}; }
      .${P}ledger div { border-bottom:1px dotted ${COB}55; padding:2px 0; }
      .${P}main { display:grid; gap:10px; min-width:0; }
      .${P}board { width:100%; height:auto; max-height:calc(100vh - 160px); display:block; margin:0 auto; background:${GLAZE}; border-radius:6px; }
      .${P}board [data-slot], .${P}board [data-piece] { cursor:pointer; }
      .${P}board [tabindex]:focus { outline:none; }
      .${P}board [tabindex]:focus-visible > circle:first-child { stroke:${GOLD}; stroke-width:5; }
      .${P}bar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; }
      .${P}res { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
      .${P}res button { font:inherit; display:flex; align-items:center; gap:6px; background:${GLAZE}; border:2px solid ${COB}; color:${DEEP}; padding:5px 10px; cursor:pointer; font-size:16px; }
      .${P}res button.on { background:${COB}; color:${WHITE}; }
      .${P}res button:disabled { opacity:.45; cursor:default; }
      .${P}msg { font-size:17px; min-height:1.4em; flex:1 1 260px; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(244,241,232,.88); z-index:3; padding:16px; }
      .${P}how div { max-width:540px; background:${GLAZE}; border:3px solid ${COB}; outline:6px solid ${GLAZE}; box-shadow:0 0 0 9px ${COB}; padding:20px 22px; }
      .${P}how h2 { font-weight:400; font-size:30px; margin:0 0 8px; color:${COB}; }
      .${P}how p { margin:0 0 10px; font-size:16px; line-height:1.4; }
      .${P}how button { font:inherit; font-size:18px; padding:8px 22px; background:${COB}; color:${WHITE}; border:0; cursor:pointer; }
      @media (max-width:760px) { .${P}lay { grid-template-columns:1fr; } .${P}ledger { order:2; max-height:120px; } }
    </style>
    <div class="${P}w"><div class="${P}lay">
      <aside class="${P}ledger" aria-label="Move ledger"><h3>THE LEDGER</h3><div class="${P}rows"></div></aside>
      <div class="${P}main">
        <svg class="${P}board" viewBox="0 0 1000 680" role="group" aria-label="The Tea Board"></svg>
        <div class="${P}bar">
          <div class="${P}res" aria-label="Reserves and actions"></div>
          <div class="${P}msg" aria-live="polite"></div>
        </div>
      </div>
    </div>
    <div class="${P}how" role="dialog" aria-label="How to play"><div>
      <h2>The Tea Board</h2>
      <p>The factor's parlour game, on a printed chart. Your white <b>Hymns</b> against his blue <b>Chests</b>. Each turn: place a Hymn on a lane touching a port you hold (or no one holds), or shift one to a neighbouring lane. More pieces hold a lane; more lanes hold a port.</p>
      <p>The tide clock turns every two rounds: at Low his Chests near Tidewater count double; at High your Hymns near the Unwritten do, and you may <b>Stir</b> once, pushing a Chest off a lane by the wild water. After six rounds, more ports wins. A tie, in his books, is his.</p>
      <button type="button">Sit down</button>
    </div></div>
    </div>`;
    const w = root.querySelector("." + P + "w");
    const svg = w.querySelector("svg");
    const resEl = w.querySelector("." + P + "res");
    const msgEl = w.querySelector("." + P + "msg");
    const rowsEl = w.querySelector("." + P + "rows");
    const how = w.querySelector("." + P + "how");

    // ---- rules ----
    const phase = (st) => PHASES[Math.min(ROUNDS, st.round) - 1];
    const lanesOf = (port) => LANES.filter((l) => l.a === port || l.b === port);
    const touches = (lane, test) => test(PORTS[lane.a]) || test(PORTS[lane.b]);
    function weight(st, lane, side) {
      const ph = phase(st);
      if (side === "C" && ph === "Low" && touches(lane, (p) => p.wild <= 40)) return 2;
      if (side === "A" && ph === "High" && touches(lane, (p) => p.wild >= 60)) return 2;
      return 1;
    }
    function laneHolder(st, lane) {
      const s = st.slots[lane.id];
      const a = s.filter((x) => x === "A").length * weight(st, lane, "A");
      const c = s.filter((x) => x === "C").length * weight(st, lane, "C");
      return a > c ? "A" : c > a ? "C" : null;
    }
    function updatePorts(st) {
      for (const k of Object.keys(PORTS)) {
        let a = 0, c = 0;
        for (const l of lanesOf(k)) { const h = laneHolder(st, l); if (h === "A") a++; if (h === "C") c++; }
        if (a > c) st.holder[k] = "A"; else if (c > a) st.holder[k] = "C";
      }
    }
    const portCount = (st, side) => Object.values(st.holder).filter((h) => h === side).length;
    const laneById = (id) => LANES.find((l) => l.id === id);
    const neighbours = (lane) => LANES.filter((l) => l !== lane && (l.a === lane.a || l.a === lane.b || l.b === lane.a || l.b === lane.b));
    function moves(st, side) {
      const out = [];
      if (st.reserve[side] > 0) for (const l of LANES) {
        const ok = [l.a, l.b].some((p) => st.holder[p] === side || !st.holder[p]);
        if (ok) st.slots[l.id].forEach((v, i) => { if (!v) out.push({ kind: "place", lane: l.id, i }); });
      }
      for (const l of LANES) st.slots[l.id].forEach((v, i) => {
        if (v !== side) return;
        for (const n of neighbours(l)) st.slots[n.id].forEach((u, j) => { if (!u) out.push({ kind: "shift", from: l.id, fi: i, lane: n.id, i: j }); });
      });
      return out;
    }
    function stirTargets(st) { // Chests on lanes touching a Wild port
      const out = [];
      for (const l of LANES) if (touches(l, (p) => p.wild >= 60)) st.slots[l.id].forEach((v, i) => { if (v === "C") out.push({ lane: l.id, i }); });
      return out;
    }
    function apply(st, side, m) {
      if (m.kind === "place") { st.slots[m.lane][m.i] = side; st.reserve[side]--; }
      if (m.kind === "shift") { st.slots[m.from][m.fi] = null; st.slots[m.lane][m.i] = side; }
      if (m.kind === "stir") { st.slots[m.from][m.fi] = null; if (m.lane) st.slots[m.lane][m.i] = "C"; }
      updatePorts(st);
    }
    const clone = (st) => ({ ...st, slots: Object.fromEntries(Object.entries(st.slots).map(([k, v]) => [k, v.slice()])), reserve: { ...st.reserve }, holder: { ...st.holder } });
    function evalFor(st, side) {
      const other = side === "A" ? "C" : "A";
      let lanes = 0; for (const l of LANES) { const h = laneHolder(st, l); if (h === side) lanes++; if (h === other) lanes--; }
      return (portCount(st, side) - portCount(st, other)) * 10 + lanes * 2 + st.reserve[side] * 0.1;
    }
    function bestMove(st, side) {
      let best = null;
      for (const m of moves(st, side)) { const c = clone(st); apply(c, side, m); const v = evalFor(c, side) + rng() * 0.01; if (!best || v > best.v) best = { m, v }; }
      return best && best.m;
    }
    const describe = (side, m) => {
      const who = side === "A" ? "Alexi" : "Factor";
      if (m.kind === "place") return `${who}: places on ${m.lane}`;
      if (m.kind === "shift") return `${who}: shifts ${m.from} → ${m.lane}`;
      if (m.kind === "stir") return `Alexi stirs a Chest off ${m.from}${m.lane ? " onto " + m.lane : ", off the board"}`;
      return who + ": passes";
    };

    // ---- turn flow ----
    function afterAction(side, m) {
      S.ledger.push(m ? describe(side, m) : `${side === "A" ? "Alexi" : "Factor"}: passes`);
      S.acted[side] = true; S.sel = null; S.stirMode = false; S.hint = null;
      if (S.acted.A && S.acted.C) {
        S.round++; S.acted = { A: false, C: false };
        if (S.round > ROUNDS) { S.round = ROUNDS; finish(); render(); return; }
        if (PHASES[S.round - 1] !== PHASES[S.round - 2]) { S.ledger.push(`─ the tide: ${PHASES[S.round - 1]} ─`); updatePorts(S); }
        if (PHASES[S.round - 1] === "High" && PHASES[S.round - 2] !== "High") S.stirUsed = false;
      }
      S.turn = side === "A" ? "C" : "A";
      render();
      if (S.turn === "C") later(factor, 1000);
      else if (!moves(S, "A").length && !(phase(S) === "High" && !S.stirUsed && stirTargets(S).length)) { S.msg = "No move for you: you pass."; later(() => afterAction("A", null), 900); }
    }
    function factor() {
      if (S.over) return;
      const ms = moves(S, "C");
      if (!ms.length) { afterAction("C", null); return; }
      const m = rng() < 0.3 ? ms[Math.floor(rng() * ms.length)] : bestMove(S, "C");
      apply(S, "C", m);
      S.msg = ["The factor taps the board.", "“A courtesy, sir.”", "The factor moves without looking up."][Math.floor(rng() * 3)];
      afterAction("C", m);
    }
    function finish() {
      S.over = true;
      const a = portCount(S, "A"), c = portCount(S, "C");
      const won = a > c;
      S.msg = `Ports: Alexi ${a}, the factor ${c}.`;
      render();
      later(() => api.end({ outcome: won ? "win" : "lose", text: won
        ? `Alexi ${a} ports to ${c}. The factor folds the board with a small bow. The parlour is won: one more Hymn in the final match.`
        : `${a} ports to ${c}.${a === c ? " “A tie, in my books, is mine.”" : ""} The factor folds the board: “Everything has a lord, sir. That one is ours.”` }), 900);
    }

    // ---- input ----
    function clickSlot(lane, i) {
      if (S.turn !== "A" || S.over || !S.started) return;
      const v = S.slots[lane][i];
      if (S.stirMode) {
        if (S.sel && S.sel.stir && !v) {
          const m = { kind: "stir", from: S.sel.lane, fi: S.sel.i, lane, i };
          if (!neighbours(laneById(S.sel.lane)).some((n) => n.id === lane)) return;
          S.stirUsed = true; apply(S, "A", m); S.msg = "The water turns, and the Chest goes with it."; afterAction("A", m); return;
        }
        if (v === "C" && stirTargets(S).some((t) => t.lane === lane && t.i === i)) {
          S.sel = { stir: true, lane, i };
          const dests = neighbours(laneById(lane)).flatMap((n) => S.slots[n.id].map((u, j) => (!u ? 1 : 0))).reduce((x, y) => x + y, 0);
          if (!dests) { const m = { kind: "stir", from: lane, fi: i }; S.stirUsed = true; apply(S, "A", m); S.msg = "No room beside it: the Chest goes off the board."; afterAction("A", m); return; }
          S.msg = "Now the empty slot on a neighbouring lane to push it into.";
          render();
        }
        return;
      }
      if (v === "A") { S.sel = S.sel && S.sel.lane === lane && S.sel.i === i ? null : { piece: true, lane, i }; render(); return; }
      if (!v && S.sel) {
        const ms = moves(S, "A");
        const m = S.sel.reserve ? ms.find((x) => x.kind === "place" && x.lane === lane && x.i === i)
          : ms.find((x) => x.kind === "shift" && x.from === S.sel.lane && x.fi === S.sel.i && x.lane === lane && x.i === i);
        if (m) { apply(S, "A", m); S.msg = ""; afterAction("A", m); }
        else { S.msg = S.sel.reserve ? "Place only on a lane touching a port you hold, or one no one holds." : "Shift only to a lane that shares a port with this one."; render(); }
      }
    }
    function legalTargets() {
      if (S.turn !== "A" || !S.sel) return [];
      if (S.stirMode && S.sel.stir) return neighbours(laneById(S.sel.lane)).flatMap((n) => S.slots[n.id].map((u, j) => (!u ? `${n.id}:${j}` : null))).filter(Boolean);
      return moves(S, "A").filter((m) => (S.sel.reserve ? m.kind === "place" : m.kind === "shift" && m.from === S.sel.lane && m.fi === S.sel.i)).map((m) => `${m.lane}:${m.i}`);
    }

    // ---- drawing ----
    const bez = (l, t) => {
      const A = PORTS[l.a], B = PORTS[l.b];
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, m = Math.hypot(dx, dy);
      const cx = mx - (dy / m) * l.bend, cy = my + (dx / m) * l.bend;
      return [(1 - t) ** 2 * A.x + 2 * (1 - t) * t * cx + t * t * B.x, (1 - t) ** 2 * A.y + 2 * (1 - t) * t * cy + t * t * B.y, cx, cy];
    };
    function teahouse(x, y, holder) {
      const fill = holder === "C" ? COB : holder === "A" ? GLAZE : WHITE;
      const line = holder === "C" ? GLAZE : COB;
      return `<circle cx="${x}" cy="${y}" r="44" fill="${fill}" stroke="${COB}" stroke-width="4"/>
        <circle cx="${x}" cy="${y}" r="37" fill="none" stroke="${line}" stroke-width="1.5"/>
        <g stroke="${line}" stroke-width="2.4" fill="none" stroke-linejoin="round">
          <path d="M${x - 24} ${y - 4} Q${x} ${y - 24} ${x + 24} ${y - 4} Z"/><path d="M${x - 16} ${y - 2} V${y + 18} H${x + 16} V${y - 2}"/>
          <path d="M${x - 5} ${y + 18} V${y + 6} H${x + 5} V${y + 18}"/><path d="M${x} ${y - 16} V${y - 24}"/></g>`;
    }
    function hymn(x, y, dbl) { return `<circle cx="${x}" cy="${y}" r="17" fill="${GLAZE}" stroke="${COB}" stroke-width="3"/><path d="M${x - 10} ${y + 2} q5 -7 10 0 t10 0" fill="none" stroke="${COB}" stroke-width="2.4"/>${dbl ? `<circle cx="${x}" cy="${y}" r="22" fill="none" stroke="${COB}" stroke-width="1.5" stroke-dasharray="3 3"/>` : ""}`; }
    function chest(x, y, dbl) { return `<rect x="${x - 15}" y="${y - 13}" width="30" height="26" rx="3" fill="${COB}" stroke="${DEEP}" stroke-width="2"/><path d="M${x - 15} ${y - 3} H${x + 15}" stroke="${GLAZE}" stroke-width="2"/><rect x="${x - 3}" y="${y - 6}" width="6" height="6" fill="${GLAZE}"/>${dbl ? `<rect x="${x - 21}" y="${y - 19}" width="42" height="38" rx="5" fill="none" stroke="${COB}" stroke-width="1.5" stroke-dasharray="3 3"/>` : ""}`; }
    function border() {
      let s = `<rect x="8" y="8" width="984" height="664" rx="10" fill="none" stroke="${COB}" stroke-width="10"/><rect x="24" y="24" width="952" height="632" fill="none" stroke="${COB}" stroke-width="2"/>`;
      let key = "";
      for (let x = 40; x < 960; x += 24) key += `<path d="M${x} 46 v-12 h14 v8 h-8 v-4" fill="none" stroke="${COB}" stroke-width="2"/><path d="M${x} 646 v-12 h14 v8 h-8 v-4" fill="none" stroke="${COB}" stroke-width="2"/>`;
      // willow-pattern touches: a footbridge, two birds, a fence
      s += key + `<path d="M640 610 q60 -40 120 0" fill="none" stroke="${COB}" stroke-width="3"/>${[652, 670, 688, 706, 724, 742].map((x) => `<path d="M${x} ${610 - Math.sin(((x - 640) / 120) * Math.PI) * 26} v12" stroke="${COB}" stroke-width="2"/>`).join("")}
        <path d="M620 92 q10 -10 20 0 q10 -10 20 0" fill="none" stroke="${COB}" stroke-width="2.5"/><path d="M670 112 q8 -8 16 0 q8 -8 16 0" fill="none" stroke="${COB}" stroke-width="2.5"/>
        <path d="M60 560 h120 M60 545 h120 ${[60, 84, 108, 132, 156, 180].map((x) => `M${x} 530 v40`).join(" ")}" stroke="${COB}" stroke-width="2" fill="none"/>
        <path d="M70 140 q20 -60 30 0 q-10 -40 20 -20 M100 140 q14 -50 30 10" stroke="${COB}" stroke-width="2.5" fill="none"/>`;
      // water hatching
      for (let y = 70; y < 620; y += 26) s += `<path d="M40 ${y} ${Array.from({ length: 23 }, (_, i) => `q10 -6 20 0 t20 0`).join(" ")}" fill="none" stroke="${COB}" stroke-opacity=".12" stroke-width="1.4"/>`;
      return s;
    }
    function dial() {
      const cx = 880, cy = 116, r = 66, idx = Math.min(ROUNDS, S.round) - 1;
      const names = ["Low", "Rising", "High", "Falling"];
      const cur = names.indexOf(PHASES[idx]);
      let s = `<circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="${GLAZE}" stroke="${COB}" stroke-width="3"/>`;
      names.forEach((n, i) => {
        const a0 = -Math.PI / 2 + (i * Math.PI) / 2, a1 = a0 + Math.PI / 2;
        s += `<path d="M${cx} ${cy} L${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A${r} ${r} 0 0 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} Z" fill="${i === cur ? COB : GLAZE}" stroke="${COB}" stroke-width="1.5"/>`;
        const am = (a0 + a1) / 2;
        s += `<text x="${cx + Math.cos(am) * r * 0.58}" y="${cy + Math.sin(am) * r * 0.58 + 5}" text-anchor="middle" font-size="11" fill="${i === cur ? GLAZE : COB}" font-family="IM Fell English SC, Georgia, serif">${n.toUpperCase()}</text>`;
      });
      return s + `<text x="${cx}" y="${cy + r + 30}" text-anchor="middle" font-size="18" fill="${COB}" font-family="IM Fell English, Georgia, serif">round ${Math.min(ROUNDS, S.round)} of ${ROUNDS}</text>`;
    }
    function render() {
      const targets = new Set(legalTargets());
      const stirable = S.stirMode && !(S.sel && S.sel.stir) ? new Set(stirTargets(S).map((t) => `${t.lane}:${t.i}`)) : new Set();
      let out = border() + dial();
      for (const l of LANES) {
        const A = PORTS[l.a], B = PORTS[l.b], [, , cx, cy] = bez(l, 0);
        const h = laneHolder(S, l);
        out += `<path d="M${A.x} ${A.y} Q${cx} ${cy} ${B.x} ${B.y}" fill="none" stroke="${COB}" stroke-width="${h ? 7 : 3}" stroke-dasharray="${h === "A" ? "2 10" : h === "C" ? "" : "10 8"}" stroke-linecap="round"/>`;
        const [lx, ly] = bez(l, 0.5);
        out += `<text x="${lx}" y="${ly - 30}" text-anchor="middle" font-size="16" fill="${COB}" font-style="italic" font-family="IM Fell English, Georgia, serif">${l.id}</text>`;
        S.slots[l.id].forEach((v, i) => {
          const [x, y] = bez(l, 0.27 + i * 0.23);
          const key = `${l.id}:${i}`;
          const sel = S.sel && !S.sel.reserve && S.sel.lane === l.id && S.sel.i === i;
          const isT = targets.has(key), isS = stirable.has(key), isH = S.hint && S.hint.lane === l.id && S.hint.i === i;
          out += `<g data-slot="${key}" tabindex="0" role="button" aria-label="${l.id} slot ${i + 1}: ${v === "A" ? "your Hymn" : v === "C" ? "a Chest" : "empty"}">
            <circle cx="${x}" cy="${y}" r="24" fill="${isT ? "#dfe6f6" : GLAZE}" stroke="${isT || isS || sel ? GOLD : COB}" stroke-width="${isT || isS || sel ? 4 : 2}" ${isT ? 'stroke-dasharray="5 4"' : ""}/>
            ${v === "A" ? hymn(x, y, weight(S, l, "A") > 1) : v === "C" ? chest(x, y, weight(S, l, "C") > 1) : ""}
            ${isH ? `<circle cx="${x}" cy="${y}" r="31" fill="none" stroke="${RED}" stroke-width="2.5" stroke-dasharray="2 4"/>` : ""}</g>`;
        });
      }
      for (const [k, p] of Object.entries(PORTS)) {
        out += teahouse(p.x, p.y, S.holder[k]);
        out += `<text x="${p.x}" y="${p.y + (p.ly || 66)}" text-anchor="middle" font-size="18" fill="${COB}" font-family="IM Fell English SC, Georgia, serif" letter-spacing="2">${p.name.toUpperCase()}</text>`;
        out += `<text x="${p.x}" y="${p.y + (p.ly || 66) + 18}" text-anchor="middle" font-size="13" fill="${COB}" font-style="italic" font-family="IM Fell English, Georgia, serif">${p.wild <= 40 ? "Ordered" : p.wild >= 60 ? "Wild" : "Contested"} · ${S.holder[k] === "A" ? "yours" : S.holder[k] === "C" ? "the Company's" : "no one's"}</text>`;
      }
      svg.innerHTML = out;
      svg.querySelectorAll("[data-slot]").forEach((g) => {
        const [lane, i] = g.dataset.slot.split(":");
        g.addEventListener("click", () => clickSlot(lane, +i));
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clickSlot(lane, +i); } });
      });
      const myTurn = S.turn === "A" && !S.over && S.started;
      const canStir = myTurn && phase(S) === "High" && !S.stirUsed && stirTargets(S).length > 0;
      resEl.innerHTML = `<button type="button" data-r="hymn" class="${S.sel && S.sel.reserve ? "on" : ""}" ${myTurn && S.reserve.A > 0 ? "" : "disabled"}><svg width="26" height="26" viewBox="0 0 40 40">${hymn(20, 20)}</svg>Hymns × ${S.reserve.A}</button>
        <span style="display:flex;align-items:center;gap:6px"><svg width="26" height="26" viewBox="0 0 40 40">${chest(20, 20)}</svg>Chests × ${S.reserve.C}</span>
        <button type="button" data-r="stir" class="${S.stirMode ? "on" : ""}" ${canStir || S.stirMode ? "" : "disabled"} title="High tide only, once: push a Chest off a lane by the Unwritten">Stir</button>
        <button type="button" data-r="hint" ${myTurn && S.hints > 0 ? "" : "disabled"} title="Trust 40+: she shows one good move, three times a match">Ask her (${S.hints})</button>
        <span>Ports: you ${portCount(S, "A")} · factor ${portCount(S, "C")}</span>`;
      resEl.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => {
        const r = b.dataset.r;
        if (r === "hymn") { S.stirMode = false; S.sel = S.sel && S.sel.reserve ? null : { reserve: true }; S.msg = S.sel ? "Choose a lit slot." : ""; }
        if (r === "stir") { S.stirMode = !S.stirMode; S.sel = null; S.msg = S.stirMode ? "Pick a Chest on a lane by the Unwritten." : ""; }
        if (r === "hint" && S.hints > 0) { S.hints--; const m = bestMove(S, "A"); if (m) { S.hint = { lane: m.lane, i: m.i }; S.msg = `She points: ${m.kind === "place" ? "a Hymn there" : `the Hymn on ${m.from}, moved there`}.`; } }
        render();
      }));
      if (!S.over) msgEl.textContent = S.msg || (S.started ? (myTurn ? `Your move. The tide is ${phase(S)}.` : "The factor considers.") : "");
      else msgEl.textContent = S.msg;
      rowsEl.innerHTML = S.ledger.slice().reverse().map((r) => `<div>${r}</div>`).join("");
    }
    const onKey = (e) => {
      if (!S.started) return;
      if (e.key === "Escape") { S.sel = null; S.stirMode = false; S.msg = ""; render(); }
      if (e.key === "h" || e.key === "H") resEl.querySelector('[data-r="hymn"]')?.click();
    };
    addEventListener("keydown", onKey);
    S.ledger.push("─ the tide: Low ─");
    render();
    const b = how.querySelector("button");
    b.addEventListener("click", () => { how.remove(); S.started = true; S.msg = "The factor moves first, as a courtesy to the house."; render(); later(factor, 900); });
    b.focus();
    return { unmount() { timers.forEach(clearTimeout); timers.clear(); removeEventListener("keydown", onKey); S.over = true; } };
  },
};

// The Lord of the Sea: The Tea Board (1D, blue-and-white export porcelain).
// `g-tea-parlour` from DESIGN.md section 11: the factor teaches the Company's parlour game as a
// courtesy. Six rounds, four ports (Home, Tidewater, Unwritten, Salt) on lanes L1, L2, L3, L5,
// three slots a lane, Debt off, fixed seed of two pieces each. One action a turn: Place, Shift,
// or (Alexi, at High tide, once) Stir a Chest off a lane touching a Wild port. A lane is held by
// more pieces; a port by more of its lanes, ties keep the holder. The tide clock doubles Chests
// near Ordered ports at Low and Hymns near Wild ports at High. More ports wins; a tie is the
// Company's. The factor is greedy, one move ahead, and plays at random three times in ten.
// Refine pass: Stir and the princess's pointing unlock as the match goes on, the factor's last move is
// ringed, ports pulse when they change hands, and the factor's table talk, the tide beats and the
// closing lines are written for the game (refine additions list).
// Art pass (2026-11-15): the board is the game's porcelain plate (tea-board-parlour), laid under the play at its
// own 1600 x 900; the ports and slots below sit where the plate draws them. Hymns and Chests are the piece
// tiles, the tide clock is the dial with the game's own hand. Without the art the old drawing still runs.
import { pic, pieceCrop, chapterStrip, endCard } from "./_art.js";
import { ladder, note, flag, setFlag } from "./_ladder.js";

const COB = "#24448f", DEEP = "#1F2E4A", WHITE = "#F4F1E8", GLAZE = "#fbfbf8", GOLD = "#E7A93B", RED = "#8C2B2B";
const PORTS = {
  home: { name: "Home Reach", x: 190, y: 330, wild: 50, ly: -112, short: "Home", nx: 112, ny: 410 },
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
// The same four ports and four lanes as the plate draws them (art/src/70_teaboard.py, style 0).
const ART_XY = { home: [420, 439.4], tide: [847.5, 250], unw: [752.5, 640], salt: [1180, 495.1] };
const ART_BOW = { L1: -26, L2: 26, L3: -26, L5: -26 };
const SEA = "#2F6B5E";
let PHASES = ["Low", "Low", "Rising", "Rising", "High", "High"];
let ROUNDS = 6;
// Phase 2 (accepted 2026-11-15, built 2026-11-16): the ladder, all three on the parlour's four ports. Teach is the
// factor's match above. Test is the Comptroller's (`g-tea-comptroller`), eight rounds, with Debt: he may Lend a Debt to
// a port (two Debts hold it for the Company whatever the lanes say), and a Clause token removes one. Twist is the Lord
// of Tea's (`g-tea-final`, cut to these four ports): a second Stir in one High tide cracks the porcelain, so that lane
// scores for no one, ever; he may Insure one Chest against the stir at the price of a reserve piece; and in the last
// four rounds each Debt he plays is a name read out of the Wreck Book.
const TOLL = [
  ["Corran", "Lamp-keeper. A light went out."],
  ["Wenna", "Ferry pilot. A crest came in on the sixth minute."],
  ["Old Marrow", "Reef-fisher. The tide stood where it never stood."],
  ["Ide", "Diver. The bank was not slack that day."],
];
const LADDER = {
  title: "The Tea Board", kicker: "1D · EXPORT PORCELAIN · THREE MATCHES",
  stages: {
    teach: { name: "The Parlour", where: "Chapter II, against the factor: majority, and the tide clock.", line: "Majority, and the tide clock." },
    test: { name: "The Comptroller's Board", where: "Chapter IV, the Spice Mouth: Debt takes a port without a lane.", line: "Eight rounds against the Comptroller, who lends." },
    twist: { name: "The Wreck Book", where: "Chapter VI, against the Lord of Tea: the board can be damaged, and every Debt has a name.", line: "The Lord of Tea. The porcelain can crack, and every Debt has a name." },
  },
};
export default { mount(root, api) { return ladder(root, api, LADDER, (r, a) => game.mount(r, a)); } };

const game = {
  mount(root, api) {
    const P = "lord-of-the-sea-tea-board-";
    const stage = api.stage || "teach", teach = stage === "teach", debtOn = !teach, final = stage === "twist";
    ROUNDS = teach ? 6 : 8;
    PHASES = teach ? ["Low", "Low", "Rising", "Rising", "High", "High"] : ["Low", "Low", "Rising", "Rising", "High", "High", "Falling", "Falling"];
    const WHO = teach ? "factor" : final ? "Lord of Tea" : "Comptroller", Who = teach ? "Factor" : WHO;
    // link: each ship named by its bell in the Deep answers one name in the Wreck Book
    const bells = final ? (Array.isArray(flag(api, "bells", [])) ? flag(api, "bells", []) : []) : [];
    const answered = Math.min(TOLL.length, bells.length);
    const rng = api.rng();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, api.reducedMotion ? Math.min(ms, 300) : ms); timers.add(id); };

    const art = api.art;
    const A = art.has("tea-board-parlour");
    if (A) { for (const k of Object.keys(PORTS)) { PORTS[k].x = ART_XY[k][0]; PORTS[k].y = ART_XY[k][1]; } for (const l of LANES) l.bend = ART_BOW[l.id]; }
    const T0 = A ? 0.3 : 0.27, DT = A ? 0.2 : 0.23;
    const pieceIcon = (id, fallback) => (pieceCrop(art, id) ? `<span style="display:inline-block;width:30px;height:30px;border-radius:50%;${pieceCrop(art, id)}"></span>` : fallback);
    const S = {
      slots: { L1: [null, "C", null], L2: ["A", null, null], L3: [null, "C", null], L5: [null, "A", null] },
      reserve: { A: 5, C: 6 },
      holder: { home: "A", unw: "A", tide: "C", salt: "C" },
      round: 1, turn: "C", acted: { C: false, A: false },
      sel: null, stirMode: false, stirUsed: false, hints: 3, hint: null,
      ledger: [], msg: "", over: false, started: false, last: null, flips: [], beat: "", voice: false, flipCount: 0,
      debt: { home: 0, tide: 0, unw: 0, salt: 0 }, names: { home: [], tide: [], unw: [], salt: [] }, clauses: debtOn ? 2 + (final && flag(api, "tea.comptroller") ? 1 : 0) : 0, clauseMode: false, lends: 0, named: "",
      cracked: {}, insured: null, stirs: 0, book: final ? TOLL.slice(answered) : [], read: 0,
    };
    if (stage === "test") S.debt.salt = 1;
    const losses = +api.store.get("losses", 0) || 0;
    if (losses >= 2) S.hints = 5;
    const TIDE_BEATS = {
      Falling: { text: final ? "The tide falls. He is reading from the book now and not looking at the board at all." : "The tide falls. Nothing counts double. The Comptroller counts what is owed instead of what is held.", voice: false },
      Rising: teach ? null : { text: final ? "Rising. Nothing counts double. He takes a cup of hot water, not tea, and holds the table's edge as the floor moves." : "The tide turns to Rising. “Lanes are opinion, sir. Debt is fact.” A port with two Debts is his whatever the lanes say. A Clause removes one: Clause, then the port.", voice: false },
      RisingTeach: { text: "The tide turns to Rising. The factor straightens his cuffs: “Nothing counts double now, sir. Only skill.” She is at your shoulder: Ask her, and she will point at one good move.", voice: false },
      High: { text: "High water. Under the painted lanes something moved the way he looked at it. Stir: once this tide, push a Chest off a lane by the Unwritten.", voice: true },
    };

    root.innerHTML = `
    <style>
      .${P}w { position:absolute; inset:0; overflow:auto; background:${WHITE}; color:${DEEP}; font-family:'IM Fell English',Georgia,serif; }
      .${P}lay { display:grid; grid-template-columns: 170px minmax(0,1fr); gap:12px; padding:12px clamp(8px,2vw,22px) 18px; max-width:1240px; margin:0 auto; }
      .${P}ledger { border:2px solid ${COB}; background:${GLAZE}; padding:8px; font-size:14px; line-height:1.35; max-height:560px; overflow:auto; }
      .${P}ledger h3, .${P}res h3 { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; font-size:13px; letter-spacing:.14em; margin:0 0 6px; color:${COB}; }
      .${P}ledger div { border-bottom:1px dotted ${COB}55; padding:2px 0; }
      .${P}main { display:grid; gap:10px; min-width:0; }
      .${P}board { width:100%; height:auto; max-height:calc(100vh - 240px); display:block; margin:0 auto; background:${GLAZE}; border-radius:6px; }
      .${P}board [data-slot], .${P}board [data-piece] { cursor:pointer; }
      .${P}board [tabindex]:focus { outline:none; }
      .${P}board [tabindex]:focus-visible > circle:first-child { stroke:${GOLD}; stroke-width:5; }
      .${P}bar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; }
      .${P}res { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
      .${P}res button { font:inherit; display:flex; align-items:center; gap:6px; background:${GLAZE}; border:2px solid ${COB}; color:${DEEP}; padding:5px 10px; cursor:pointer; font-size:16px; }
      .${P}res button.on { background:${COB}; color:${WHITE}; }
      .${P}res button:disabled { opacity:.45; cursor:default; }
      .${P}msg { font-size:17px; min-height:1.4em; flex:1 1 260px; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(244,241,232,.9); z-index:3; padding:14px; overflow:auto; }
      .${P}plate { position:relative; max-width:540px; box-sizing:border-box; margin:10px; background:${GLAZE}; border-radius:40px; padding:26px 28px 20px; border:3px solid ${COB};
        box-shadow:0 0 0 8px ${GLAZE}, 0 0 0 11px ${COB}, 0 0 0 13px ${GLAZE}, 0 0 0 15px ${COB}, 0 14px 30px rgba(31,46,74,.35);
        background-image: repeating-radial-gradient(circle at 50% 120%, transparent 0 14px, rgba(36,68,143,.06) 14px 16px); }
      .${P}plate .rim { position:absolute; left:20px; right:20px; top:8px; height:10px; background: repeating-linear-gradient(90deg, ${COB} 0 2px, transparent 2px 6px, ${COB} 6px 14px, transparent 14px 18px); opacity:.55; border-radius:4px; }
      .${P}plate h2 { font-weight:400; font-size:clamp(28px,6vw,36px); margin:6px 0 2px; color:${COB}; text-align:center; letter-spacing:.02em; }
      .${P}plate .goal { text-align:center; font-size:18px; margin:0 0 6px; }
      .${P}plate .open { text-align:center; font-style:italic; font-size:15px; line-height:1.4; margin:0 0 12px; color:#36477a; }
      .${P}plate dl { margin:0 0 14px; display:grid; grid-template-columns:auto minmax(0,1fr); gap:8px 12px; align-items:center; border-top:2px solid ${COB}; padding-top:10px; }
      .${P}plate dt { display:flex; align-items:center; gap:6px; font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.06em; color:${COB}; font-size:16px; }
      .${P}plate dd { margin:0; font-size:16px; line-height:1.3; }
      .${P}plate kbd { font-family:inherit; border:1.5px solid ${COB}; border-radius:4px; padding:0 4px; font-size:14px; }
      .${P}plate .gentle { text-align:center; color:${COB}; font-style:italic; font-size:15px; margin:0 0 10px; }
      .${P}plate button { display:block; margin:0 auto; font:inherit; font-size:18px; padding:8px 26px; background:${COB}; color:${WHITE}; border:0; border-radius:20px; cursor:pointer; }
      .${P}plate button:hover, .${P}plate button:focus-visible { background:${DEEP}; }
      .${P}shelf { display:block; width:100%; height:auto; margin-top:10px; border:1px solid ${COB}; opacity:.95; }
      @media (max-width:760px) { .${P}shelf { display:none; } }
      .${P}beat { border:2px solid ${COB}; border-radius:14px; background:${GLAZE}; padding:7px 12px; font-size:16px; line-height:1.35; color:${DEEP}; }
      .${P}beat.voice { font-style:italic; color:#2F6B5E; border-color:#2F6B5E; }
      .${P}beat:empty { display:none; }
      .${P}board [data-slot]:hover > circle:first-child { stroke:${GOLD}; stroke-width:4; }
      .${P}res button:not(:disabled):hover { background:#dfe6f6; }
      .${P}res button.on:hover { background:${DEEP}; }
      .${P}score { font-size:17px; }
      .${P}score b { font-weight:400; font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.06em; }
      .${P}pulse { animation:${P}pulse 1.2s ease-out; transform-box:fill-box; transform-origin:center; }
      @keyframes ${P}pulse { 0% { opacity:1; transform:scale(.8); } 100% { opacity:0; transform:scale(1.6); } }
      @media (prefers-reduced-motion: reduce) { .${P}pulse { animation:none; opacity:.6; } }
      @media (max-width:760px) { .${P}lay { grid-template-columns:1fr; } .${P}ledger { order:2; max-height:120px; } .${P}board { max-height:none; } .${P}res { gap:8px; } .${P}res button { font-size:15px; padding:6px 8px; } }
    </style>
    <div class="${P}w"><div class="${P}lay">
      <aside class="${P}ledger" aria-label="Move ledger"><h3>THE LEDGER</h3><div class="${P}rows"></div>${pic(art, "thread-own", "", `class="${P}shelf"`)}</aside>
      <div class="${P}main">
        <svg class="${P}board" viewBox="${A ? "0 0 1600 900" : "0 0 1000 680"}" role="group" aria-label="The Tea Board"></svg>
        <div class="${P}beat" aria-live="polite"></div>
        <div class="${P}bar">
          <div class="${P}res" aria-label="Reserves and actions"></div>
          <div class="${P}msg" aria-live="polite"></div>
        </div>
      </div>
    </div>
    <div class="${P}how" role="dialog" aria-label="How to play"><div class="${P}plate">
      <div class="rim"></div>
      ${chapterStrip(art, teach ? 3 : final ? 7 : 5, teach ? "Chapter III: The Ordered Sea" : final ? "Chapter VII: The Lord of Tea" : "Chapter V: The Open Chart")}
      <h2>${teach ? "The Tea Board" : final ? "The Wreck Book" : "The Comptroller's Board"}</h2>
      <p class="goal">After ${teach ? "six" : "eight"} rounds, hold more ports than the ${WHO}. A tie, in his books, is his.</p>
      <p class="open">${teach ? "Chapter II, the Company's parlour at Tidewater. The factor sets out his board as a courtesy to the princess's guest: the same four ports Alexi can see from the window, painted in cobalt."
        : final ? "Chapter VI, the counting-house. The Lord of Tea plays on the parlour's own four ports, to be fair. Beside the board lies the Wreck Book, open. He has never been to sea; the floor moves under him and he plays on."
        : "Chapter IV, the Spice Mouth. The Comptroller plays the same board with one more kind of piece. One Debt already lies on the Salt Steps."}</p>
      ${debtOn ? `<p class="open" style="font-style:normal;text-align:left">${pieceIcon("piece-debt", "").replace("display:inline-block;", "display:inline-block;vertical-align:middle;margin-right:6px;")}<b>Debt.</b> He may <b>Lend</b> a Debt to a port. Two Debts hold it for him whatever the lanes say. ${pieceIcon("piece-clause", "").replace("display:inline-block;", "display:inline-block;vertical-align:middle;margin:0 6px;")}<b>Clause</b> (<kbd>C</kbd>, then the port): spend a token and your turn to strike one Debt off. You have two.</p>` : ""}
      ${final ? `<p class="open" style="font-style:normal;text-align:left"><b>The porcelain cracks.</b> You may Stir <b>twice</b> at High tide. The second Stir cracks the lane it pushes from: that lane scores for no one, ever, and no safe lane can be laid along it. He may <b>Insure</b> one Chest against the stir. In the last four rounds he reads a name out of the Wreck Book before each move: a Debt, and then his move as well.${flag(api, "tea.comptroller") ? " The Comptroller's match was won: a third Clause token." : ""}</p>` : ""}
      ${losses >= 2 ? `<p class="gentle">She has watched you lose twice: she will point five times this match, not three.</p>` : ""}
      <dl>
        <dt>${pieceIcon("piece-hymn", `<svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="${GLAZE}" stroke="${COB}" stroke-width="3"/><path d="M10 22 q5 -7 10 0 t10 0" fill="none" stroke="${COB}" stroke-width="2.4"/></svg>`)}Place</dt><dd>Press <b>Hymns</b> (or <kbd>H</kbd>), then a lit slot on a lane by a port you hold or no one holds.</dd>
        <dt><svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 20 h22 m-6 -6 l6 6 l-6 6" fill="none" stroke="${COB}" stroke-width="3"/></svg>Shift</dt><dd>Click one of your Hymns, then a lit slot on a lane that shares a port with it.</dd>
        <dt style="grid-column:1/-1;display:block;font-family:inherit;letter-spacing:0;color:${DEEP};font-size:15px">${pieceIcon("piece-chest", "").replace("display:inline-block;", "display:inline-block;vertical-align:middle;margin-right:6px;")}His pieces are Chests. More pieces hold a lane; more lanes hold a port. The tide clock turns every two rounds and changes what counts double.</dt>
      </dl>
      <button type="button">Sit down</button>
    </div></div>
    </div>`;
    const w = root.querySelector("." + P + "w");
    const svg = w.querySelector("svg");
    const resEl = w.querySelector("." + P + "res");
    const msgEl = w.querySelector("." + P + "msg");
    const rowsEl = w.querySelector("." + P + "rows");
    const beatEl = w.querySelector("." + P + "beat");
    function beat(text, voice) { S.beat = text; S.voice = !!voice; }
    const how = w.querySelector("." + P + "how");

    // ---- rules ----
    const phase = (st) => PHASES[Math.min(ROUNDS, st.round) - 1];
    const lanesOf = (port) => LANES.filter((l) => l.a === port || l.b === port);
    const touches = (lane, test) => test(PORTS[lane.a]) || test(PORTS[lane.b]);
    function weight(st, lane, side) {
      const ph = phase(st);
      if (st.cracked[lane.id]) return 0;
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
        if (st.debt[k] >= 2) st.holder[k] = "C";            // two Debts hold a port whatever the lanes say
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
      for (const l of LANES) if (touches(l, (p) => p.wild >= 60) && !st.cracked[l.id]) st.slots[l.id].forEach((v, i) => { if (v === "C" && st.insured !== `${l.id}:${i}`) out.push({ lane: l.id, i }); });
      return out;
    }
    function apply(st, side, m) {
      if (m.kind === "place") { st.slots[m.lane][m.i] = side; st.reserve[side]--; }
      if (m.kind === "shift") { st.slots[m.from][m.fi] = null; st.slots[m.lane][m.i] = side; }
      if (m.kind === "stir") { st.slots[m.from][m.fi] = null; if (m.lane) st.slots[m.lane][m.i] = "C"; if (m.crack) st.cracked = { ...st.cracked, [m.from]: true }; }
      if (m.kind === "lend") { st.debt = { ...st.debt, [m.port]: st.debt[m.port] + 1 }; }
      if (m.kind === "clause") { st.debt = { ...st.debt, [m.port]: Math.max(0, st.debt[m.port] - 1) }; }
      const before = { ...st.holder };
      updatePorts(st);
      if (st === S) for (const k of Object.keys(PORTS)) if (before[k] !== st.holder[k]) { S.flips.push(k); S.flipCount++; }
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
      const who = side === "A" ? "Alexi" : Who;
      if (m.kind === "lend") return `${who}: lends a Debt to ${PORTS[m.port].name}${m.name ? " (" + m.name + ")" : ""}`;
      if (m.kind === "clause") return `Alexi: a Clause strikes a Debt off ${PORTS[m.port].name}`;
      if (m.kind === "insure") return `${who}: insures the Chest on ${m.lane}`;
      if (m.kind === "stir" && m.crack) return `Alexi stirs again: ${m.from} cracks`;
      if (m.kind === "place") return `${who}: places on ${m.lane}`;
      if (m.kind === "shift") return `${who}: shifts ${m.from} → ${m.lane}`;
      if (m.kind === "stir") return `Alexi stirs a Chest off ${m.from}${m.lane ? " onto " + m.lane : ", off the board"}`;
      return who + ": passes";
    };

    // ---- turn flow ----
    function afterAction(side, m) {
      S.ledger.push(m ? describe(side, m) : `${side === "A" ? "Alexi" : Who}: passes`);
      S.acted[side] = true; S.sel = null; S.stirMode = false; S.hint = null; S.clauseMode = false;
      if (S.acted.A && S.acted.C) {
        S.round++; S.acted = { A: false, C: false };
        if (S.round > ROUNDS) { S.round = ROUNDS; finish(); render(); return; }
        if (PHASES[S.round - 1] !== PHASES[S.round - 2]) { S.ledger.push(`─ the tide: ${PHASES[S.round - 1]} ─`); const before = { ...S.holder }; updatePorts(S); for (const k of Object.keys(PORTS)) if (before[k] !== S.holder[k]) S.flips.push(k); const tb = TIDE_BEATS[teach && PHASES[S.round - 1] === "Rising" ? "RisingTeach" : PHASES[S.round - 1]]; if (tb) beat(tb.text, tb.voice); }
        if (S.round === ROUNDS) beat(final ? "Last round. He closes the Wreck Book on one finger, to keep the place." : `Last round. The ${WHO} folds his hands and waits, as if the result were already written in a ledger somewhere.`, false);
        if (PHASES[S.round - 1] === "High" && PHASES[S.round - 2] !== "High") { S.stirUsed = false; S.stirs = 0; if (final) beat("High water. Stir, twice this tide if you will. The first is the sea's. The second is too much for porcelain: the lane you push from cracks, and scores for no one, ever.", true); }
      }
      S.turn = side === "A" ? "C" : "A";
      render();
      if (S.turn === "C") later(factor, 1000);
      else if (!moves(S, "A").length && !(phase(S) === "High" && !S.stirUsed && stirTargets(S).length) && !(S.clauses > 0 && Object.values(S.debt).some((v) => v > 0))) { S.msg = "No move for you: you pass."; later(() => afterAction("A", null), 900); }
    }
    function factor() {
      if (S.over) return;
      const ms = moves(S, "C");
      if (debtOn) { // Lend, Insure, and the Wreck Book
        const notHis = Object.keys(PORTS).filter((k) => S.holder[k] !== "C" && S.debt[k] < 2);
        const pick = notHis.slice().sort((a, b) => S.debt[b] - S.debt[a])[0];
        if (final && S.round > ROUNDS - 4 && S.book.length && pick) {
          const [nm, what] = S.book.shift(); S.read++;
          const m = { kind: "lend", port: pick, name: nm };
          apply(S, "C", m); S.names[pick].push(nm); S.last = { port: pick };
          beat(`He reads from the Wreck Book. “${nm}. ${what}” Click. A Debt on ${PORTS[pick].name}.`, false);
          S.ledger.push(describe("C", m));
          S.named = `A Named Debt on ${PORTS[pick].name}: ${S.debt[pick]} of 2.${S.debt[pick] >= 2 ? " It is his, whatever the lanes say." : ""} `;   // read, and then he moves as well
        } else S.named = "";
        if (final && !S.insured && S.round === 4 && S.reserve.C > 0) {
          const tgt = LANES.filter((l) => touches(l, (p) => p.wild >= 60)).flatMap((l) => S.slots[l.id].map((v, i) => (v === "C" ? { lane: l.id, i } : null))).filter(Boolean)[0];
          if (tgt) { S.insured = `${tgt.lane}:${tgt.i}`; S.reserve.C--; S.last = tgt; S.msg = `“Insured.” He sets a reserve Chest aside and initials the one on ${tgt.lane}: it cannot be stirred off.`; afterAction("C", { kind: "insure", lane: tgt.lane }); return; }
        }
        const finish2 = notHis.find((k) => S.debt[k] === 1);
        if (!final && S.lends < 3 && (finish2 ? rng() < 0.75 : S.round >= 3 && pick && rng() < 0.3)) {
          const port = finish2 || pick, m = { kind: "lend", port };
          S.lends++; apply(S, "C", m); S.last = { port };
          S.msg = `“On account.” A Debt on ${PORTS[port].name}: ${S.debt[port]} of 2.${S.debt[port] >= 2 ? " It is his, whatever the lanes say." : ""}`;
          if (S.lends === 1) beat("He does not move a Chest. He writes a line in a book and sets a red disc on the port. Two of those and the port is his. Clause (C), then the port, strikes one off.", false);
          afterAction("C", m); return;
        }
      }
      if (!ms.length) { S.msg = S.named; afterAction("C", null); return; }
      const m = rng() < (teach ? 0.3 : final ? 0.08 : 0.18) ? ms[Math.floor(rng() * ms.length)] : bestMove(S, "C");
      apply(S, "C", m);
      S.last = S.named && S.last && S.last.port ? { lane: m.lane, i: m.i, port: S.last.port } : { lane: m.lane, i: m.i };
      S.msg = (teach ? ["The factor taps the board.", "“A courtesy, sir.”", "The factor moves without looking up.", "“Your move. Do take your time.”"] : final ? ["He moves, and grips the table's edge.", "“In my books it is called unpaid.”", "He moves without hurry.", "He sips hot water. “Tea is for selling.”"] : ["The Comptroller moves and makes a note.", "“Entered.”", "He moves without looking up.", "“Your move, sir. It is all one to the ledger.”"])[Math.floor(rng() * 4)] + ` (${m.kind === "place" ? "a Chest on " + m.lane : "a Chest shifted to " + m.lane}, ringed)`
      if (S.named) { S.msg = S.named + S.msg; S.named = ""; }
      afterAction("C", m);
    }
    function finish() {
      S.over = true;
      const a = portCount(S, "A"), c = portCount(S, "C");
      const won = a > c;
      S.msg = `Ports: Alexi ${a}, the ${WHO} ${c}.`;
      render();
      api.store.set("losses", won ? 0 : losses + 1);
      const cracks = Object.keys(S.cracked);
      if (cracks.length) setFlag(api, "tea.cracked", cracks);
      if (stage === "test") { if (won) setFlag(api, "tea.comptroller", true);
        later(() => { endCard(root, art, won ? "chit-6-under-the-board-raised" : "piece-debt", won ? "CHIT No. 6 · A FAIR WIND, TO ORDER" : "DEBT IS FACT", "#14203a"); api.end({ outcome: won ? "win" : "lose", text: won
          ? `Alexi ${a} ${a === 1 ? "port" : "ports"} to ${c}, with ${S.clauses} Clause ${S.clauses === 1 ? "token" : "tokens"} unspent. The Comptroller lifts his board to fold it, and a slip of paper is stuck to the foot-ring underneath: chit No. 6, struck out and smudged, “a fair wind, to order”. The Spice Mouth goes broken, one clause token more, and the sixth of eight is in his hand.`
          : a === c ? `${a} to ${c}. “A tie, in my books, is mine.” The Spice Mouth stays bound, and notice +15. A port with two Debts is his whatever the lanes say: keep a Clause for the second disc.`
          : `${a} ${a === 1 ? "port" : "ports"} to ${c}. The Comptroller enters it. The Spice Mouth stays bound, and notice +15. A port with two Debts is his whatever the lanes say: keep a Clause for the second disc.` }); }, 900);
        return; }
      if (final) {
        later(() => { endCard(root, art, won ? "wreck-book-open-year" : "wreck-book-lost-list", won ? "THE WRECK BOOK · THE BOARD IS HIS NO LONGER" : "THE WRECK BOOK · THE LOST LIST", "#14203a"); api.end({ outcome: won ? "win" : "lose", text: (won
          ? `Alexi ${a} ${a === 1 ? "port" : "ports"} to ${c}. The Lord of Tea looks at the board for a long time, and then at the book.`
          : a === c ? `${a} to ${c}. “A tie, in my books, is mine.” He does not smile. He looks seasick.` : `${a} ${a === 1 ? "port" : "ports"} to ${c}. “You call it wild. In my books it is called unpaid.”`)
          + ` He read ${S.read} ${S.read === 1 ? "name" : "names"} out of the Wreck Book${answered ? `; ${answered} ${answered === 1 ? "was" : "were"} already answered for` : ""}.`
          + (cracks.length ? ` ${cracks.join(" and ")} ${cracks.length === 1 ? "is" : "are"} cracked across: no one will ever score ${cracks.length === 1 ? "it" : "them"}, and no safe lane can be laid there.` : " The porcelain is whole.")
          + (won ? " What is done with the win waits for the tideline." : "") }); }, 900);
        return; }
      later(() => api.end({ outcome: won ? "win" : "lose", text: won
        ? `Alexi ${a} ${a === 1 ? "port" : "ports"} to ${c}${S.stirUsed ? ", the last of it with the water's help" : ""}. The factor folds the board with a small bow and writes something in his book. The parlour is won: one more Hymn in the final match.`
        : a === c ? `${a} ${a === 1 ? "port" : "ports"} to ${c}. “A tie, in my books, is mine.” The factor folds the board and enters the result before the princess can object.`
        : `${a} ${a === 1 ? "port" : "ports"} to ${c}. The factor folds the board and smiles at the princess: “Everything has a lord.” Nothing is lost tonight but the parlour.` }), 900);
    }

    // ---- input ----
    function clickSlot(lane, i) {
      if (S.turn !== "A" || S.over || !S.started) return;
      const v = S.slots[lane][i];
      if (S.stirMode) {
        if (S.sel && S.sel.stir && !v) {
          const m = { kind: "stir", from: S.sel.lane, fi: S.sel.i, lane, i };
          if (!neighbours(laneById(S.sel.lane)).some((n) => n.id === lane)) return;
          stirCount(m); apply(S, "A", m); S.msg = "The water turns, and the Chest goes with it."; afterAction("A", m); return;
        }
        if (v === "C" && stirTargets(S).some((t) => t.lane === lane && t.i === i)) {
          S.sel = { stir: true, lane, i };
          const dests = neighbours(laneById(lane)).flatMap((n) => S.slots[n.id].map((u, j) => (!u ? 1 : 0))).reduce((x, y) => x + y, 0);
          if (!dests) { const m = { kind: "stir", from: lane, fi: i }; stirCount(m); apply(S, "A", m); S.msg = "No room beside it: the Chest goes off the board."; afterAction("A", m); return; }
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
        if (m) { apply(S, "A", m); S.msg = S.flips.length ? `${S.flips.map((k) => PORTS[k].name).join(" and ")} change${S.flips.length === 1 ? "s" : ""} hands.` : ""; afterAction("A", m); }
        else { S.msg = S.sel.reserve ? "Place only on a lane touching a port you hold, or one no one holds." : "Shift only to a lane that shares a port with this one."; render(); }
      }
    }
    function stirCount(m) { S.stirs++; if (S.stirs >= (final ? 2 : 1)) S.stirUsed = true; if (final && S.stirs === 2) { m.crack = true; beat(`The second stir is too much. A crack runs the length of ${m.from}, through the glaze and the lane under it. It scores for no one now, and it never will.`, true); } }
    function clickPort(k) {
      if (S.turn !== "A" || S.over || !S.started || !S.clauseMode) return;
      if (!S.debt[k]) { S.msg = "No Debt on that port."; render(); return; }
      const m = { kind: "clause", port: k };
      S.clauses--; const nm = S.names[k].pop(); apply(S, "A", m);
      S.msg = nm ? `The Clause strikes ${nm}'s line through. The Debt comes off ${PORTS[k].name}.` : `The Clause strikes a Debt off ${PORTS[k].name}.`;
      afterAction("A", m);
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
      const idx = Math.min(ROUNDS, S.round) - 1;
      const names = ["Low", "Rising", "High", "Falling"];
      const cur = names.indexOf(PHASES[idx]);
      if (A && art.has("tide-dial")) { // the porcelain dial; its quadrants run Low, Rising, High, Falling from the upper left, two rounds a quadrant
        const cx = 1165, cy = 232, r = 92, narrow = w.clientWidth < 640;
        const first = idx === 0 || PHASES[idx - 1] !== PHASES[idx];
        const ang = ((-180 + cur * 90 + (first ? 22.5 : 67.5)) * Math.PI) / 180;
        const hx = cx + Math.cos(ang) * r * 0.62, hy = cy + Math.sin(ang) * r * 0.62;
        return `<image href="${art.url("tide-dial")}" x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" clip-path="circle(${r - 2}px at ${r}px ${r}px)" style="clip-path:circle(49.5%)"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${COB}" stroke-width="3"/>
          <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="${DEEP}" stroke-width="7" stroke-linecap="round"/><circle cx="${hx}" cy="${hy}" r="8" fill="${RED}" stroke="${DEEP}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="6" fill="${DEEP}"/>
          <text x="${cx}" y="${cy + r + (narrow ? 40 : 32)}" text-anchor="middle" font-size="${narrow ? 36 : 25}" fill="${COB}" font-family="IM Fell English SC, Georgia, serif" stroke="${GLAZE}" stroke-width="6" paint-order="stroke">${names[cur].toUpperCase()} · ${narrow ? "" : "round "}${Math.min(ROUNDS, S.round)} of ${ROUNDS}</text>`;
      }
      const cx = 880, cy = 116, r = 66;
      let s = `<circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="${GLAZE}" stroke="${COB}" stroke-width="3"/>`;
      names.forEach((n, i) => {
        const a0 = -Math.PI / 2 + (i * Math.PI) / 2, a1 = a0 + Math.PI / 2;
        s += `<path d="M${cx} ${cy} L${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A${r} ${r} 0 0 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} Z" fill="${i === cur ? COB : GLAZE}" stroke="${COB}" stroke-width="1.5"/>`;
        const am = (a0 + a1) / 2;
        s += `<text x="${cx + Math.cos(am) * r * 0.58}" y="${cy + Math.sin(am) * r * 0.58 + 5}" text-anchor="middle" font-size="${w.clientWidth < 640 ? 0 : 12}" fill="${i === cur ? GLAZE : COB}" font-family="IM Fell English SC, Georgia, serif">${n.toUpperCase()}</text>`;
      });
      const nk = w.clientWidth < 640 ? 1.9 : 1;
      return s + (nk > 1 ? `<text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="30" fill="${cur === 2 ? COB : GLAZE}" stroke="${cur === 2 ? GLAZE : COB}" stroke-width="5" paint-order="stroke" font-family="IM Fell English SC, Georgia, serif">${names[cur].toUpperCase()}</text>` : "") + `<text x="${cx}" y="${cy + r + 30 * nk}" text-anchor="middle" font-size="${18 * nk}" fill="${COB}" font-family="IM Fell English, Georgia, serif">round ${Math.min(ROUNDS, S.round)} of ${ROUNDS}</text>`;
    }
    // a piece tile cropped to the piece, set on a slot
    const tile = (id, x, y, r) => `<svg x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" viewBox="44 56 152 152" style="pointer-events:none"><image href="${art.url(id)}" width="240" height="240"/></svg>`;
    function render() {
      const narrow = w.clientWidth < 640, ks = narrow ? 1.75 : 1;
      const Z = A ? (narrow ? 1.9 : 1.4) : 1;   // the plate is 1600 wide: text and rings are drawn larger on it
      if (A) svg.setAttribute("viewBox", narrow ? "338 126 924 650" : "0 0 1600 900");
      const targets = new Set(legalTargets());
      const stirable = S.stirMode && !(S.sel && S.sel.stir) ? new Set(stirTargets(S).map((t) => `${t.lane}:${t.i}`)) : new Set();
      let out = A ? `<image href="${art.url("tea-board-parlour")}" x="0" y="0" width="1600" height="900"/>` + dial() : border() + dial();
      const hasPieces = A && art.has("piece-hymn") && art.has("piece-chest");
      for (const l of LANES) {
        const PA = PORTS[l.a], PB = PORTS[l.b], [, , cx, cy] = bez(l, 0);
        const h = laneHolder(S, l);
        if (!A) out += `<path d="M${PA.x} ${PA.y} Q${cx} ${cy} ${PB.x} ${PB.y}" fill="none" stroke="${COB}" stroke-width="${h ? 7 : 3}" stroke-dasharray="${h === "A" ? "2 10" : h === "C" ? "" : "10 8"}" stroke-linecap="round"/>`;
        else if (h) out += `<path d="M${PA.x} ${PA.y} Q${cx} ${cy} ${PB.x} ${PB.y}" fill="none" stroke="${h === "A" ? SEA : COB}" stroke-width="22" stroke-opacity=".3" stroke-linecap="round"/>`;
        const [lx, ly] = bez(l, 0.5);
        const nrm = Math.hypot(PB.x - PA.x, PB.y - PA.y), nx = -(PB.y - PA.y) / nrm, ny = (PB.x - PA.x) / nrm, sg = Math.sign(l.bend) || 1;
        if (!A) out += `<text x="${lx}" y="${ly - 30}" text-anchor="middle" font-size="${16 * (narrow ? 1.5 : 1)}" fill="${COB}" font-style="italic" font-family="IM Fell English, Georgia, serif">${l.id}${h && !narrow ? (h === "A" ? " · yours" : " · his") : ""}</text>`;
        else if (h) out += `<text x="${lx + nx * sg * 62}" y="${ly + ny * sg * 62 + 8}" text-anchor="middle" font-size="${17 * Z}" fill="${h === "A" ? SEA : COB}" font-style="italic" font-family="IM Fell English, Georgia, serif" stroke="${GLAZE}" stroke-width="6" paint-order="stroke">${h === "A" ? "yours" : "his"}</text>`;
        S.slots[l.id].forEach((v, i) => {
          const [x, y] = bez(l, T0 + i * DT);
          const key = `${l.id}:${i}`;
          const sel = S.sel && !S.sel.reserve && S.sel.lane === l.id && S.sel.i === i;
          const isT = targets.has(key), isS = stirable.has(key), isH = S.hint && S.hint.lane === l.id && S.hint.i === i;
          const dbl = v && weight(S, l, v) > 1;
          out += `<g data-slot="${key}" tabindex="0" role="button" aria-label="${l.id} slot ${i + 1}: ${v === "A" ? "your Hymn" : v === "C" ? "a Chest" : "empty"}">
            <circle cx="${x}" cy="${y}" r="${A ? 26 : 24}" fill="${isT ? "#dfe6f6" : A ? "transparent" : GLAZE}" stroke="${isT || isS || sel ? GOLD : A ? "transparent" : COB}" stroke-width="${isT || isS || sel ? (A ? 6 : 4) : 2}" ${isT ? 'stroke-dasharray="5 4"' : ""}/>
            ${A ? `<circle cx="${x}" cy="${y}" r="38" fill="transparent"/>` : ""}
            ${!v ? "" : hasPieces ? tile(v === "A" ? "piece-hymn" : "piece-chest", x, y, 30) + (dbl ? `<circle cx="${x}" cy="${y}" r="33" fill="none" stroke="${v === "A" ? SEA : COB}" stroke-width="3" stroke-dasharray="4 4"/><text x="${x + 30}" y="${y - 24}" font-size="${15 * Z}" fill="${v === "A" ? SEA : COB}" font-family="Georgia,serif" stroke="${GLAZE}" stroke-width="5" paint-order="stroke">×2</text>` : "") : v === "A" ? hymn(x, y, dbl) : chest(x, y, dbl)}
            ${isH ? `<circle cx="${x}" cy="${y}" r="${A ? 38 : 31}" fill="none" stroke="${RED}" stroke-width="${A ? 4 : 2.5}" stroke-dasharray="2 4"/>` : ""}
            ${S.last && S.last.lane === l.id && S.last.i === i ? `<circle cx="${x}" cy="${y}" r="${A ? 35 : 29}" fill="none" stroke="${GOLD}" stroke-width="${A ? 5 : 3}"/>` : ""}</g>`;
        });
      }
      for (const l of LANES) if (S.cracked[l.id]) { // the porcelain, cracked along a lane
        const [mx, my] = bez(l, 0.5), PA = PORTS[l.a], PB = PORTS[l.b], ang = (Math.atan2(PB.y - PA.y, PB.x - PA.x) * 180) / Math.PI, len = Math.hypot(PB.x - PA.x, PB.y - PA.y) * 0.8;
        out += art.has("tea-board-crack") ? `<image href="${art.url("tea-board-crack")}" x="${mx - len / 2}" y="${my - len * 0.1875}" width="${len}" height="${len * 0.375}" transform="rotate(${ang} ${mx} ${my})" style="pointer-events:none;mix-blend-mode:multiply" opacity=".9"/>` : `<path d="M${PA.x} ${PA.y} L${mx - 14} ${my + 10} L${mx + 12} ${my - 12} L${PB.x} ${PB.y}" fill="none" stroke="${DEEP}" stroke-width="3" style="pointer-events:none"/>`;
        out += `<text x="${mx}" y="${my - 44}" text-anchor="middle" font-size="${17 * Z}" fill="${RED}" font-style="italic" font-family="IM Fell English, Georgia, serif" stroke="${GLAZE}" stroke-width="6" paint-order="stroke">cracked: no one's, ever</text>`;
      }
      if (S.insured) { const [il, ii] = S.insured.split(":"); if (S.slots[il][+ii] === "C") { const [x, y] = bez(laneById(il), T0 + +ii * DT); out += `<circle cx="${x}" cy="${y}" r="${A ? 37 : 30}" fill="none" stroke="${GOLD}" stroke-width="5" style="pointer-events:none"/><text x="${x}" y="${y - (A ? 44 : 36)}" text-anchor="middle" font-size="${15 * Z}" fill="${DEEP}" font-style="italic" font-family="IM Fell English, Georgia, serif" stroke="${GLAZE}" stroke-width="5" paint-order="stroke">insured</text>`; } }
      for (const [k, p] of Object.entries(PORTS)) {
        const hold = S.holder[k];
        if (debtOn) { // Debt markers beside the port, and the port as a target for a Clause
          const r = A ? 27 : 20, dx = A ? 92 : 62;
          for (let i = 0; i < S.debt[k]; i++) {
            const x = p.x + dx + i * (r * 2 + 6), y = p.y - (A ? 62 : 44), nm = S.names[k][i - (S.debt[k] - S.names[k].length)];
            out += A && art.has("piece-debt") ? tile("piece-debt", x, y, r) : `<circle cx="${x}" cy="${y}" r="${r}" fill="${RED}" stroke="${DEEP}" stroke-width="2"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="18" fill="${GLAZE}" font-style="italic" font-family="Georgia,serif">Dr.</text>`;
            if (nm) out += `<text x="${x}" y="${y - r - 6}" text-anchor="middle" font-size="${15 * Z}" fill="${RED}" font-style="italic" font-family="IM Fell English, Georgia, serif" stroke="${GLAZE}" stroke-width="6" paint-order="stroke">${nm}</text>`;
          }
          if (S.last && S.last.port === k && S.debt[k]) { const x = p.x + dx + (S.debt[k] - 1) * (r * 2 + 6), y = p.y - (A ? 62 : 44); out += `<circle cx="${x}" cy="${y}" r="${r + 5}" fill="none" stroke="${GOLD}" stroke-width="4"/>`; }
          out += `<g data-port="${k}" ${S.clauseMode && S.debt[k] ? `tabindex="0" role="button"` : ""} aria-label="${p.name}: ${hold === "A" ? "yours" : hold === "C" ? "the Company's" : "no one's"}, ${S.debt[k]} Debt${S.debt[k] === 1 ? "" : "s"}"><circle cx="${p.x}" cy="${p.y}" r="${A ? 70 : 52}" fill="transparent" stroke="${S.clauseMode && S.debt[k] ? GOLD : "transparent"}" stroke-width="6" stroke-dasharray="6 5" style="${S.clauseMode && S.debt[k] ? "cursor:pointer" : "pointer-events:none"}"/></g>`;
        }
        if (!A) out += teahouse(p.x, p.y, hold);
        else if (hold) out += `<circle cx="${p.x}" cy="${p.y}" r="56" fill="${hold === "C" ? COB : SEA}" fill-opacity=".2" stroke="${hold === "C" ? COB : SEA}" stroke-width="9"/>${hold === "A" ? `<circle cx="${p.x}" cy="${p.y}" r="66" fill="none" stroke="${SEA}" stroke-width="3" stroke-dasharray="3 7"/>` : ""}`;
        if (S.flips.includes(k)) out += `<circle class="${P}pulse" cx="${p.x}" cy="${p.y}" r="${A ? 66 : 50}" fill="none" stroke="${GOLD}" stroke-width="6"/>`;
        if (A) {
          const who = hold === "A" ? "yours" : hold === "C" ? (narrow ? "his" : "the Company's") : "no one's";
          out += `<text x="${p.x}" y="${p.y + 96 + 19 * Z}" text-anchor="middle" font-size="${17 * Z}" fill="${hold === "A" ? SEA : COB}" font-style="italic" font-family="IM Fell English, Georgia, serif" stroke="${GLAZE}" stroke-width="7" paint-order="stroke">${narrow ? "" : (p.wild <= 40 ? "Ordered" : p.wild >= 60 ? "Wild" : "Contested") + " · "}${who}</text>`;
          continue;
        }
        const ly = narrow && p.ny ? p.ny : p.y + (p.ly || 66) * (narrow ? 1.05 : 1), lx = narrow && p.nx ? p.nx : p.x;
        out += `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="${18 * ks}" fill="${COB}" font-family="IM Fell English SC, Georgia, serif" letter-spacing="${narrow ? 0 : 2}" stroke="${GLAZE}" stroke-width="${narrow ? 6 : 0}" paint-order="stroke">${(narrow ? p.short || p.name.replace("The ", "") : p.name).toUpperCase()}</text>`;
        out += `<text x="${lx}" y="${ly + 18 * ks}" text-anchor="middle" font-size="${13 * (narrow ? 1.9 : 1)}" fill="${COB}" font-style="italic" font-family="IM Fell English, Georgia, serif" stroke="${GLAZE}" stroke-width="${narrow ? 6 : 0}" paint-order="stroke">${narrow ? "" : (p.wild <= 40 ? "Ordered" : p.wild >= 60 ? "Wild" : "Contested") + " · "}${S.holder[k] === "A" ? "yours" : S.holder[k] === "C" ? (narrow ? "his" : "the Company's") : "no one's"}</text>`;
      }
      svg.innerHTML = out;
      svg.querySelectorAll("[data-port]").forEach((g) => {
        g.addEventListener("click", () => clickPort(g.dataset.port));
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clickPort(g.dataset.port); } });
      });
      svg.querySelectorAll("[data-slot]").forEach((g) => {
        const [lane, i] = g.dataset.slot.split(":");
        g.addEventListener("click", () => clickSlot(lane, +i));
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clickSlot(lane, +i); } });
      });
      const myTurn = S.turn === "A" && !S.over && S.started;
      const canStir = myTurn && phase(S) === "High" && !S.stirUsed && stirTargets(S).length > 0;
      svg.setAttribute("aria-label", myTurn ? "The Tea Board: your move" : "The Tea Board");
      resEl.innerHTML = `<button type="button" data-r="hymn" class="${S.sel && S.sel.reserve ? "on" : ""}" ${myTurn && S.reserve.A > 0 ? "" : "disabled"}>${pieceIcon("piece-hymn", `<svg width="26" height="26" viewBox="0 0 40 40">${hymn(20, 20)}</svg>`)}Hymns × ${S.reserve.A}</button>
        <span style="display:flex;align-items:center;gap:6px">${pieceIcon("piece-chest", `<svg width="26" height="26" viewBox="0 0 40 40">${chest(20, 20)}</svg>`)}Chests × ${S.reserve.C}</span>
        ${phase(S) === "High" || S.stirUsed ? `<button type="button" data-r="stir" class="${S.stirMode ? "on" : ""}" ${canStir || S.stirMode ? "" : "disabled"} title="High tide only: push a Chest off a lane by the Unwritten (S)">${final && S.stirs === 1 && !S.stirUsed ? "Stir again: it will crack" : "Stir"}${S.stirUsed ? " (used)" : ""}</button>` : ""}
        ${debtOn ? `<button type="button" data-r="clause" class="${S.clauseMode ? "on" : ""}" ${myTurn && S.clauses > 0 && Object.values(S.debt).some((v) => v > 0) ? "" : "disabled"} title="Spend a Clause token and your turn to strike one Debt off a port (C)">${pieceIcon("piece-clause", "")}Clause × ${S.clauses}</button>` : ""}
        ${S.round >= 3 ? `<button type="button" data-r="hint" ${myTurn && S.hints > 0 ? "" : "disabled"} title="Trust 40+: she shows one good move (A)">Ask her (${S.hints})</button>` : ""}
        <span class="${P}score"><b>PORTS</b> you ${portCount(S, "A")} · ${teach ? "factor" : "he"} ${portCount(S, "C")}${final ? ` · <b>WRECK BOOK</b> ${S.book.length} ${S.book.length === 1 ? "name" : "names"} unread` : ""}</span>`;
      resEl.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => {
        const r = b.dataset.r;
        if (r === "hymn") { S.stirMode = false; S.sel = S.sel && S.sel.reserve ? null : { reserve: true }; S.msg = S.sel ? "Choose a lit slot." : "";
          if (S.sel && !moves(S, "A").some((m) => m.kind === "place")) { S.sel = null; S.msg = "No free slot on a lane you can reach. Shift one of your Hymns instead: click it, then a lit slot."; } }
        if (r === "clause") { S.clauseMode = !S.clauseMode; S.stirMode = false; S.sel = null; S.msg = S.clauseMode ? "Choose the port (ringed) to strike a Debt off." : ""; }
        if (r === "stir") { S.clauseMode = false; S.stirMode = !S.stirMode; S.sel = null; S.msg = S.stirMode ? "Pick a Chest on a lane by the Unwritten." : ""; }
        if (r === "hint" && S.hints > 0) { S.hints--; const m = bestMove(S, "A"); if (m) { S.hint = { lane: m.lane, i: m.i }; S.msg = `She points: ${m.kind === "place" ? "a Hymn there" : `the Hymn on ${m.from}, moved there`}.`; } }
        render();
      }));
      if (!S.over) msgEl.textContent = S.msg || (S.started ? (myTurn ? `Your move. The tide is ${phase(S)}.` : `The ${WHO} considers.`) : "");
      else msgEl.textContent = S.msg;
      rowsEl.innerHTML = S.ledger.slice().reverse().map((r) => `<div>${r}</div>`).join("");
      beatEl.textContent = S.beat; beatEl.classList.toggle("voice", S.voice);
      S.flips = [];
    }
    const onKey = (e) => {
      if (!S.started) return;
      if (e.key === "Escape") { S.sel = null; S.stirMode = false; S.clauseMode = false; S.msg = ""; render(); }
      if (e.key === "c" || e.key === "C") resEl.querySelector('[data-r="clause"]:not(:disabled)')?.click();
      if (e.key === "h" || e.key === "H") resEl.querySelector('[data-r="hymn"]')?.click();
      if (e.key === "s" || e.key === "S") resEl.querySelector('[data-r="stir"]:not(:disabled)')?.click();
      if (e.key === "a" || e.key === "A") resEl.querySelector('[data-r="hint"]:not(:disabled)')?.click();
    };
    addEventListener("keydown", onKey);
    S.ledger.push("─ the tide: Low ─");
    render();
    const b = how.querySelector("button");
    let unnote = null;
    b.addEventListener("click", () => {
      how.remove(); S.started = true; S.msg = teach ? "The factor moves first, as a courtesy to the house." : `The ${WHO} moves first.`;
      beat(final ? "Low tide. His Chests by Tidewater count double. The Wreck Book lies open at his elbow, face down on its own spine." : teach ? "Low tide. His Chests on lanes by Tidewater count double while it lasts. The princess watches the board, not the factor." : "Low tide. His Chests by Tidewater count double, and a red disc already sits on the Salt Steps: one Debt. A second would make it his.", false);
      render(); later(factor, 900);
      if (final && answered) unnote = note(w, `Because you rang ${answered === 1 ? "the bell" : "the bells"} of ${bells.slice(0, answered).join(", ")} in The Deep, ${answered} ${answered === 1 ? "name" : "names"} in his Wreck Book ${answered === 1 ? "is" : "are"} answered for: ${TOLL.slice(0, answered).map((x) => x[0]).join(", ")}. He has ${TOLL.length - answered} left to read.`, 11000, true);
    });
    b.focus();
    return { unmount() { timers.forEach(clearTimeout); timers.clear(); removeEventListener("keydown", onKey); S.over = true; if (unnote) unnote(); } };
  },
};

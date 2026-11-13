// People of the Bark — Trunk and Shadow (1D, knotwork board).
// DESIGN.md 11.4, cut to the spring festival (c2_tns) against Captain Burr, who charges the nearest
// Folk and looks one move ahead. Old Rules: 4 Folk start on the Root row; move one Folk up to 2
// squares along open cracks (the bands); the 2 × 2 Shadow then moves 1 square in any direction, and
// any Folk under it (not on a knot square) is hidden and comes back to the Root row 2 rounds later.
// Win: 3 Folk on the Crown row. Lose: round 16 ends first.
// Spring's rule cards: Blessing (3 rain squares: a Folk ending there moves again), Tremor (every 4th
// round all Folk shift one square along the printed pattern), and the Eye policy card (once, a
// chant: the Shadow skips a turn).

const COLS = 5, ROWS = 8, ROUNDS = 16;
const GOLD = "#f0c050", AMBER = "#d9902a", DARK = "#1b120c", UMBER = "#5a3d2b", BARK = "#7a5a40", SAGE = "#8fa37a", LIME = "#c4d65a", LANT = "#e8742a", PAPER = "#efe2c4", BLUE = "#6f9ab8";
const KNOTS = [[1, 2], [3, 3], [0, 5], [4, 5]];      // [col, row], row 0 = Root
const RAIN = [[2, 1], [4, 2], [1, 4]];
const TREMOR_PATTERN = { 4: [0, 1, "up"], 8: [1, 0, "right"], 12: [0, 1, "up"], 16: [-1, 0, "left"] };
const BURR_LINES = ["Forward! The nearest first.", "Hold still and I'll have you.", "A Folk in the open is a Folk for the Shadow.", "Ha! Run, then.", "No knot will save you twice."];

export default {
  mount(root, api) {
    const P = "people-of-the-bark-trunk-and-shadow-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const rnd = api.rng();

    // ---- the cracks: which sides of each square are open ----
    const up = [], right = []; // up[r][c]: edge (c,r)-(c,r+1); right[r][c]: edge (c,r)-(c+1,r)
    for (let r = 0; r < ROWS; r++) { up.push([]); right.push([]); for (let c = 0; c < COLS; c++) { up[r].push(r < ROWS - 1 && rnd() < 0.8); right[r].push(c < COLS - 1 && rnd() < 0.5); } }
    // make sure every square connects (union-find over random extra edges)
    const par = Array.from({ length: COLS * ROWS }, (_, i) => i);
    const find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
    const id = (c, r) => r * COLS + c;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (up[r][c]) par[find(id(c, r))] = find(id(c, r + 1)); if (right[r][c]) par[find(id(c, r))] = find(id(c + 1, r)); }
    for (let guard = 0; guard < 500; guard++) {
      const roots = new Set(par.map((_, i) => find(i))); if (roots.size === 1) break;
      const c = Math.floor(rnd() * COLS), r = Math.floor(rnd() * ROWS);
      if (rnd() < 0.5 && r < ROWS - 1 && find(id(c, r)) !== find(id(c, r + 1))) { up[r][c] = true; par[find(id(c, r))] = find(id(c, r + 1)); }
      else if (c < COLS - 1 && find(id(c, r)) !== find(id(c + 1, r))) { right[r][c] = true; par[find(id(c, r))] = find(id(c + 1, r)); }
    }
    const open = (c, r, dc, dr) => {
      const c2 = c + dc, r2 = r + dr;
      if (c2 < 0 || c2 >= COLS || r2 < 0 || r2 >= ROWS) return false;
      if (dr === 1) return up[r][c]; if (dr === -1) return up[r2][c];
      if (dc === 1) return right[r][c]; return right[r][c2];
    };
    const isKnot = (c, r) => KNOTS.some(([x, y]) => x === c && y === r);
    const isRain = (c, r) => RAIN.some(([x, y]) => x === c && y === r);

    const S = {
      round: 1, turn: "player", folk: [0, 1, 3, 4].map((c, i) => ({ i, c, r: 0, hidden: 0 })),
      shadow: { c: 1, r: 6 }, sel: null, again: null, chantUsed: false, skipNext: false, over: false, line: BURR_LINES[0], fired: null, log: "",
    };
    const under = (f, sh = S.shadow) => f.c >= sh.c && f.c <= sh.c + 1 && f.r >= sh.r && f.r <= sh.r + 1;
    const occupied = (c, r, except) => S.folk.some((f) => f !== except && !f.hidden && f.c === c && f.r === r);
    function reach(f) {
      const seen = new Map([[f.c + "," + f.r, 0]]), q = [[f.c, f.r, 0]], out = [];
      while (q.length) {
        const [c, r, d] = q.shift(); if (d === 2) continue;
        for (const [dc, dr] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          if (!open(c, r, dc, dr)) continue;
          const k = (c + dc) + "," + (r + dr); if (seen.has(k)) continue;
          seen.set(k, d + 1); q.push([c + dc, r + dr, d + 1]);
          if (!occupied(c + dc, r + dr, f)) out.push([c + dc, r + dr]);
        }
      }
      return out;
    }

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;background:radial-gradient(ellipse at 50% 40%,#2e2016,#1b120c 80%);color:${PAPER};font-family:'Cormorant Garamond',Georgia,serif}
.${P}page{box-sizing:border-box;min-height:100%;max-width:1200px;margin:0 auto;padding:16px clamp(12px,3vw,32px);display:grid;grid-template-columns:180px minmax(0,1fr) 200px;gap:18px;align-items:center}
.${P}cards{display:flex;flex-direction:column;gap:10px}
.${P}rc{border:1.5px solid #5a4a3a;border-radius:6px;padding:8px 10px;background:rgba(58,40,28,.6);text-align:center;position:relative}
.${P}rc::before{content:"";position:absolute;left:10px;right:10px;top:4px;height:5px;background:repeating-radial-gradient(circle at 3px 2.5px,transparent 0 1.6px,#8fa37a 1.7px 2.4px,transparent 2.5px) 0 0/7px 5px}
.${P}rc b{display:block;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:19px;letter-spacing:.08em;margin-top:6px}
.${P}rc i{font-size:14px;color:#c9b99a}
.${P}rc.${P}fire{border-color:${GOLD};box-shadow:0 0 0 2px rgba(240,192,80,.4)}
.${P}rc button{font:inherit;font-size:14px;margin-top:6px;background:${AMBER};color:${DARK};border:0;padding:4px 10px;cursor:pointer;border-radius:3px}
.${P}rc button:disabled{opacity:.35;cursor:default}
.${P}board{min-width:0;display:grid;place-items:center}
.${P}board svg{height:min(calc(100vh - 140px),760px);max-width:100%;min-height:360px;display:block;touch-action:manipulation}
.${P}sq{cursor:pointer}
.${P}opp{text-align:center}
.${P}opp h3{margin:6px 0 0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:20px;letter-spacing:.1em}
.${P}opp p{margin:2px 0 10px;font-style:italic;color:#c9b99a;font-size:15px}
.${P}say{font-family:'IM Fell English',Georgia,serif;font-size:17px;min-height:2.6em;color:${GOLD}}
.${P}dots{display:grid;grid-template-columns:repeat(8,14px);gap:5px;justify-content:center;margin:12px 0 6px}
.${P}dots i{width:14px;height:14px;border-radius:50%;border:1.5px solid ${AMBER}}
.${P}dots i.${P}d{background:${AMBER}}
.${P}rd{font:12px ui-monospace,monospace;letter-spacing:.2em}
.${P}stat{font-size:15px;margin-top:8px;color:#d8c8a4}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,18,12,.9);z-index:4;padding:16px}
.${P}intro div{max-width:480px;border:1.5px solid ${GOLD};background:#2e2016;padding:20px 22px}
.${P}intro h2{margin:0 0 6px;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;color:${GOLD}}
.${P}intro p{margin:0 0 10px;font-size:18px;line-height:1.35}
.${P}intro button{font:inherit;font-size:18px;background:${AMBER};color:${DARK};border:0;padding:7px 16px;cursor:pointer;border-radius:3px}
@media (max-width:820px){.${P}page{grid-template-columns:1fr 1fr;grid-template-areas:"board board" "cards opp"}.${P}board{grid-area:board}.${P}cards{grid-area:cards}.${P}opp{grid-area:opp}.${P}board svg{height:auto;width:100%;min-height:0;max-height:70vh}}
</style>
<div class="${P}page">
 <div class="${P}cards"></div>
 <div class="${P}board"><svg viewBox="-34 -56 368 590" aria-label="The board: five columns, eight rows"></svg></div>
 <div class="${P}opp">
  <svg viewBox="-60 -60 120 120" width="120" height="120" aria-hidden="true">
   ${Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2; return `<circle cx="${Math.cos(a) * 50}" cy="${Math.sin(a) * 50}" r="6" fill="none" stroke="${SAGE}" stroke-width="2"/>`; }).join("")}
   <path d="M-22 30 V-6 Q-22 -26 0 -26 Q22 -26 22 -6 V30 H8 V6 H-8 V30Z" fill="#7d6c5a" stroke="${DARK}" stroke-width="2"/>
   <path d="M-6 -30 Q14 -48 34 -34 Q16 -34 6 -22Z" fill="${LANT}"/>
  </svg>
  <h3>CAPTAIN BURR</h3><p>charges the nearest</p>
  <div class="${P}say" aria-live="polite"></div>
  <div class="${P}dots"></div><div class="${P}rd"></div>
  <div class="${P}stat"></div>
 </div>
</div>
<div class="${P}intro"><div>
 <h2>Trunk and Shadow</h2>
 <p>The festival game. Get <b>three Folk</b> onto the Crown row before round 16 ends. Tap a Folk, then a glowing square: up to 2 steps, only along the bands.</p>
 <p>After each move the Shadow steps one square. Folk under it are hidden for two rounds, unless they stand on a knot. Rain squares give a second move. Every 4th round a tremor shifts every Folk.</p>
 <button type="button">Sit down to play</button>
</div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg[aria-label]");
    const cardsEl = wrap.querySelector("." + P + "cards"), sayEl = wrap.querySelector("." + P + "say"), dots = wrap.querySelector("." + P + "dots"), rd = wrap.querySelector("." + P + "rd"), stat = wrap.querySelector("." + P + "stat");
    const Z = 60, X = (c) => c * Z + Z / 2, Y = (r) => (ROWS - 1 - r) * Z + Z / 2;

    function drawBoard() {
      let s = `<defs><pattern id="${P}hat" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-width="2" opacity=".35"/></pattern></defs>`;
      // flake outline and the braided border
      s += `<path d="M-14 -12 Q150 -26 314 -12 Q328 240 314 492 Q150 506 -14 492 Q-28 240 -14 -12Z" fill="#6b4c33" stroke="${DARK}" stroke-width="3"/>`;
      for (let x = 0; x <= 300; x += 15) { s += `<ellipse cx="${x}" cy="-28" rx="7" ry="4" fill="none" stroke="${SAGE}" stroke-width="2"/><ellipse cx="${x}" cy="508" rx="7" ry="4" fill="none" stroke="${SAGE}" stroke-width="2"/>`; }
      for (let y = 0; y <= 480; y += 15) { s += `<ellipse cx="-26" cy="${y}" rx="4" ry="7" fill="none" stroke="${SAGE}" stroke-width="2"/><ellipse cx="326" cy="${y}" rx="4" ry="7" fill="none" stroke="${SAGE}" stroke-width="2"/>`; }
      s += `<text x="150" y="-38" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" letter-spacing="4" fill="${PAPER}" opacity=".85" dy="-6">CROWN</text>
<text x="150" y="530" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" letter-spacing="4" fill="${PAPER}" opacity=".85">ROOT</text>`;
      // squares
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        s += `<rect class="${P}sq" data-c="${c}" data-r="${r}" x="${c * Z + 1}" y="${(ROWS - 1 - r) * Z + 1}" width="${Z - 2}" height="${Z - 2}" fill="${(c + r) % 2 ? "#8a6a4a" : "#80603f"}" opacity=".9"/>`;
      }
      // bands: outline pass, then gold pass, then the over-strands at alternate crossings
      const segs = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (up[r][c]) segs.push({ x1: X(c), y1: Y(r), x2: X(c), y2: Y(r + 1), v: true, c, r });
        if (right[r][c]) segs.push({ x1: X(c), y1: Y(r), x2: X(c + 1), y2: Y(r), v: false, c, r });
      }
      const line = (q, w, col, extra = "", cap = "round") => `<line x1="${q.x1}" y1="${q.y1}" x2="${q.x2}" y2="${q.y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="${cap}" pointer-events="none" ${extra}/>`;
      segs.forEach((q) => (s += line(q, 15, DARK)));
      segs.forEach((q) => (s += line(q, 10, GOLD)));
      segs.forEach((q) => (s += line(q, 2, AMBER, 'opacity=".7"')));
      // interlace: at squares on one checker colour, the vertical band passes over
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if ((c + r) % 2) continue;
        // only at true crossings: bands run through on both axes
        if (up[r][c] && r > 0 && up[r - 1][c] && right[r][c] && c > 0 && right[r][c - 1]) {
          const o = { x1: X(c), y1: Y(r) - 16, x2: X(c), y2: Y(r) + 16 };
          s += line(o, 15, DARK, "", "butt") + line(o, 10, GOLD, "", "butt") + line(o, 2, AMBER, 'opacity=".7"', "butt");
        }
      }
      // knots and rain
      for (const [c, r] of KNOTS) s += `<g transform="translate(${X(c)} ${Y(r)})" pointer-events="none"><circle r="15" fill="${UMBER}" stroke="${LANT}" stroke-width="2.5"/><circle r="9" fill="none" stroke="${LANT}" stroke-width="2"/><circle r="3.5" fill="${LANT}"/></g>`;
      for (const [c, r] of RAIN) s += `<g transform="translate(${X(c) + 17} ${Y(r) - 17})" pointer-events="none"><path d="M0 -9 Q7 1 0 7 Q-7 1 0 -9Z" fill="${BLUE}" stroke="${DARK}" stroke-width="1"/></g>`;
      s += `<g class="${P}dyn"></g>`;
      svg.innerHTML = s;
    }
    drawBoard();
    const dyn = svg.querySelector("." + P + "dyn");

    function drawDyn() {
      let s = "";
      // the Shadow's reach, shaded
      if (S.turn === "player" && !S.over) {
        const sh = S.shadow;
        const c0 = Math.max(0, sh.c - 1), c1 = Math.min(COLS - 1, sh.c + 2), r0 = Math.max(0, sh.r - 1), r1 = Math.min(ROWS - 1, sh.r + 2);
        s += `<rect x="${c0 * Z}" y="${(ROWS - 1 - r1) * Z}" width="${(c1 - c0 + 1) * Z}" height="${(r1 - r0 + 1) * Z}" fill="#000" opacity=".16" pointer-events="none"/>`;
      }
      // reachable squares
      if (S.sel && !S.over) for (const [c, r] of reach(S.sel)) s += `<circle cx="${X(c)}" cy="${Y(r)}" r="11" fill="${LIME}" opacity=".85" stroke="${DARK}" stroke-width="1.5" pointer-events="none"/>`;
      // folk
      for (const f of S.folk) {
        if (f.hidden) continue;
        const sel = S.sel === f;
        s += `<g class="${P}sq" data-f="${f.i}" transform="translate(${X(f.c)} ${Y(f.r)})">
<circle r="17" fill="${sel ? GOLD : LIME}" stroke="${DARK}" stroke-width="2.5"/><circle r="12" fill="${SAGE}" stroke="${DARK}" stroke-width="1.5"/>
<circle cy="-3" r="4" fill="${DARK}"/><path d="M-7 8 Q0 -2 7 8" fill="${DARK}"/>${isKnot(f.c, f.r) ? `<circle r="21" fill="none" stroke="${LANT}" stroke-width="1.5" stroke-dasharray="3 3"/>` : ""}</g>`;
      }
      // the Shadow
      const sh = S.shadow;
      s += `<g pointer-events="none" style="transition:transform .35s" transform="translate(${sh.c * Z + 4} ${(ROWS - 2 - sh.r) * Z + 4})">
<rect width="${2 * Z - 8}" height="${2 * Z - 8}" rx="14" fill="#1a1020" opacity=".72" stroke="#5a4a6a" stroke-width="2"/><rect width="${2 * Z - 8}" height="${2 * Z - 8}" rx="14" fill="url(#${P}hat)"/>
<text x="${Z - 4}" y="${Z}" text-anchor="middle" font-family="IM Fell English,serif" font-size="13" fill="#b8a8c8" letter-spacing="2">SHADOW</text></g>`;
      dyn.innerHTML = s;
    }

    function drawSide() {
      const t = S.round;
      const cards = [
        { k: "old", t: "OLD RULES", d: "a Folk on a knot cannot be hidden" },
        { k: "rain", t: "BLESSING", d: "end on rain: move again" },
        { k: "tremor", t: "TREMOR", d: "every 4th round: ↑ → ↑ ←" },
        { k: "eye", t: "EYE", d: "once, a chant: the Shadow skips a turn", btn: true },
      ];
      cardsEl.innerHTML = cards.map((c) => `<div class="${P}rc ${S.fired === c.k ? P + "fire" : ""}"><b>${c.t}</b><i>${c.d}</i>${c.btn ? `<br><button type="button" ${S.chantUsed || S.over || S.turn !== "player" ? "disabled" : ""}>${S.chantUsed ? "chanted" : S.skipNext ? "chanting…" : "Chant"}</button>` : ""}</div>`).join("");
      const b = cardsEl.querySelector("button"); if (b) b.onclick = () => { if (!S.chantUsed) { S.chantUsed = true; S.skipNext = true; S.log = "The Folk chant. The Shadow will skip its next turn."; refresh(); } };
      dots.innerHTML = Array.from({ length: ROUNDS }, (_, i) => `<i class="${i < t - 1 ? P + "d" : ""}"></i>`).join("");
      rd.textContent = `ROUND ${Math.min(t, ROUNDS)} / ${ROUNDS}`;
      const crown = S.folk.filter((f) => !f.hidden && f.r === ROWS - 1).length, hid = S.folk.filter((f) => f.hidden).length;
      stat.innerHTML = `On the Crown: <b>${crown}</b> / 3${hid ? ` · hidden: ${hid}` : ""}${S.log ? `<br><i>${S.log}</i>` : ""}`;
      sayEl.textContent = `“${S.line}”`;
    }
    function refresh() { drawDyn(); drawSide(); }

    function checkWin() {
      if (S.folk.filter((f) => !f.hidden && f.r === ROWS - 1).length >= 3) {
        S.over = true; refresh();
        later(() => api.end({ outcome: "win", text: `Three Folk stand on the Crown in round ${S.round}. Burr laughs and polishes his spear. The Battlements +4, morale +5.` }), 500);
        return true;
      }
      return false;
    }

    function playerMove(f, c, r) {
      f.c = c; f.r = r; S.sel = null; S.log = "";
      if (checkWin()) return;
      if (isRain(c, r) && S.again !== f) { S.again = f; S.sel = f; S.log = "Rain: this Folk moves again."; S.fired = "rain"; refresh(); return; }
      S.again = null;
      S.turn = "shadow"; refresh();
      later(shadowTurn, api.reducedMotion ? 150 : 520);
    }

    function shadowTurn() {
      if (S.over) return;
      S.fired = null;
      if (S.skipNext) { S.skipNext = false; S.line = "…" ; S.log = "The Shadow stands still for the chant."; S.fired = "eye"; return endRound(); }
      const opts = [];
      for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
        const c = S.shadow.c + dc, r = S.shadow.r + dr;
        if (c < 0 || c > COLS - 2 || r < 0 || r > ROWS - 2) continue;
        const sh = { c, r };
        const caught = S.folk.filter((f) => !f.hidden && under(f, sh) && !isKnot(f.c, f.r));
        const live = S.folk.filter((f) => !f.hidden && !(under(f, sh) && !isKnot(f.c, f.r)));
        let near = 99;
        for (const f of live) { const dx = Math.max(0, c - f.c, f.c - (c + 1)), dy = Math.max(0, r - f.r, f.r - (r + 1)); near = Math.min(near, Math.max(dx, dy)); }
        opts.push({ sh, score: caught.length * 10 + caught.reduce((a, f) => a + f.r, 0) * 0.5 - near + rnd() * 0.3 });
      }
      opts.sort((a, b) => b.score - a.score);
      S.shadow = opts[0].sh;
      const caught = S.folk.filter((f) => !f.hidden && under(f) && !isKnot(f.c, f.r));
      for (const f of caught) f.hidden = 3; // returns when the counter runs out (2 full rounds)
      S.line = caught.length ? "Got you! Back to the Root with you." : BURR_LINES[Math.floor(rnd() * BURR_LINES.length)];
      S.log = caught.length ? `${caught.length} Folk hidden by the Shadow.` : "";
      endRound();
    }

    function endRound() {
      S.round++;
      // hidden Folk count down and return to the Root row
      for (const f of S.folk) if (f.hidden) {
        f.hidden--;
        if (!f.hidden) {
          const free = [0, 1, 2, 3, 4].filter((c) => !occupied(c, 0, f) && !under({ c, r: 0 }));
          if (free.length) { f.c = free[0]; f.r = 0; } else f.hidden = 1;
        }
      }
      if (S.round > ROUNDS) {
        S.over = true; refresh();
        const crown = S.folk.filter((f) => !f.hidden && f.r === ROWS - 1).length;
        later(() => api.end({ outcome: "lose", text: `Round 16 ends with ${crown} Folk on the Crown. Burr wins the festival game; a loss takes nothing. The Folk will try again at summer's festival.` }), 500);
        return;
      }
      // the Tremor card
      const tp = TREMOR_PATTERN[S.round];
      if (tp) {
        S.fired = "tremor";
        const [dc, dr, name] = tp;
        const order = S.folk.filter((f) => !f.hidden).sort((a, b) => (dr ? b.r - a.r : dc > 0 ? b.c - a.c : a.c - b.c));
        for (const f of order) if (open(f.c, f.r, dc, dr) && !occupied(f.c + dc, f.r + dr, f)) { f.c += dc; f.r += dr; }
        S.log = (S.log ? S.log + " " : "") + `A tremor: every Folk shifts ${name} where a band runs.`;
        if (checkWin()) return;
      }
      S.turn = "player"; refresh();
    }

    // ---- input ----
    on(svg, "click", (e) => {
      if (S.over || S.turn !== "player") return;
      const t = e.target.closest("[data-f],[data-c]");
      if (!t) return;
      if (t.dataset.f != null) {
        const f = S.folk[+t.dataset.f];
        if (S.again && S.again !== f) return;
        S.sel = S.sel === f ? (S.again ? f : null) : f; refresh(); return;
      }
      const c = +t.dataset.c, r = +t.dataset.r;
      if (S.sel && reach(S.sel).some(([x, y]) => x === c && y === r)) playerMove(S.sel, c, r);
      else { const f = S.folk.find((q) => !q.hidden && q.c === c && q.r === r); if (f && !S.again) { S.sel = f; refresh(); } }
    });
    // keyboard: 1–4 pick a Folk, arrows step it (each press one step; Enter ends a 1-step move)
    let kpath = null;
    on(window, "keydown", (e) => {
      if (S.over || S.turn !== "player" || wrap.querySelector("." + P + "intro")) return;
      if (/^Digit[1-4]$/.test(e.code)) { const f = S.folk[+e.code.slice(5) - 1]; if (!f.hidden && (!S.again || S.again === f)) { S.sel = f; kpath = { c: f.c, r: f.r, n: 0 }; refresh(); } return; }
      const dirs = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (dirs[e.key] && S.sel) {
        e.preventDefault();
        if (!kpath) kpath = { c: S.sel.c, r: S.sel.r, n: 0 };
        const [dc, dr] = dirs[e.key];
        if (!open(kpath.c, kpath.r, dc, dr)) return;
        kpath = { c: kpath.c + dc, r: kpath.r + dr, n: kpath.n + 1 };
        if (kpath.n === 2) { const k = kpath; kpath = null; if (!occupied(k.c, k.r, S.sel)) playerMove(S.sel, k.c, k.r); }
        else { dyn.insertAdjacentHTML("beforeend", `<circle cx="${X(kpath.c)}" cy="${Y(kpath.r)}" r="7" fill="${GOLD}"/>`); }
      }
      if (e.key === "Enter" && kpath && kpath.n === 1 && !occupied(kpath.c, kpath.r, S.sel)) { const k = kpath; kpath = null; playerMove(S.sel, k.c, k.r); }
    });
    const startBtn = wrap.querySelector(`.${P}intro button`);
    on(startBtn, "click", () => wrap.querySelector("." + P + "intro").remove());
    startBtn.focus();
    refresh();

    return { unmount() { timers.forEach(clearTimeout); offs.forEach((f) => f()); wrap.remove(); } };
  },
};

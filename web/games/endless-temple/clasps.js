// The Endless Temple / The Clasps (1D, mechanical puzzle). Style: Clockwork cutaway.
// DESIGN.md section 11, g_clasp_c7 (gear train): place gears from the tray on a 5 x 4 peg board so
// the turning knob drives the latch gear clockwise; adjacent gears reverse direction. Parity is the
// puzzle. To make parity solvable on a square board, two large gears also mesh corner to corner
// (and cannot sit side by side). There is no failure (reset is free); the clasp is scored in moves.
// The hint sigil glows after 90 seconds and shows one correct next move.

const COLS = 5, ROWS = 4, SP = 100;          // peg spacing in board units
const RAD = { 1: 32, 2: 44, 3: 62 };
const KNOB = { x: 0, y: 1, s: 2 }, LATCH = { x: 4, y: 2, s: 2 };
const TRAY = [1, 1, 2, 2, 3, 3];
const SOLUTION = [{ x: 1, y: 1, s: 1 }, { x: 2, y: 1, s: 3 }, { x: 3, y: 2, s: 3 }];

function gearPath(r, rot = 0) {
  const n = Math.max(8, Math.round(r / 5.2)), depth = 8, pts = [];
  for (let i = 0; i < n; i++) {
    const a0 = rot + (2 * Math.PI * i) / n, st = (2 * Math.PI) / n;
    for (const [t, rr] of [[0, r - depth / 2], [0.18, r + depth / 2], [0.5, r + depth / 2], [0.68, r - depth / 2]]) {
      const a = a0 + t * st; pts.push(`${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`);
    }
  }
  return "M" + pts.join(" L") + "Z";
}

// the train: meshes, directions (1 = clockwise), jam
function analyse(gears) {
  const all = [KNOB, LATCH, ...gears];
  const adj = all.map(() => []);
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const dx = Math.abs(all[i].x - all[j].x), dy = Math.abs(all[i].y - all[j].y);
    const big = all[i].s === 3 && all[j].s === 3;
    if ((dx + dy === 1 && !big) || (dx === 1 && dy === 1 && big)) { adj[i].push(j); adj[j].push(i); }
  }
  const dir = new Array(all.length).fill(0); dir[0] = 1;
  const st = [0]; let jam = false;
  while (st.length) {
    const i = st.pop();
    for (const j of adj[i]) {
      if (!dir[j]) { dir[j] = -dir[i]; st.push(j); } else if (dir[j] === dir[i]) jam = true;
    }
  }
  return { all, adj, dir, jam, latch: dir[1] };
}
function blocked(gears, x, y, s) {
  if ((x === KNOB.x && y === KNOB.y) || (x === LATCH.x && y === LATCH.y)) return "That peg holds a fixed gear.";
  if (s === 3) for (const g of [KNOB, LATCH, ...gears]) if (g.s === 3 && Math.abs(g.x - x) + Math.abs(g.y - y) === 1) return "Two large gears side by side would grind.";
  return null;
}

export default {
  mount(root, api) {
    const P = "endless-temple-clasps-";
    const M = { brass: "#c9973a", brassD: "#8a6224", copper: "#b8643a", copperD: "#7a3f22", steel: "#a9adb2", steelD: "#6d7176", leather: "#3b2216", plate: "#4a3524", verd: "#6fa08a", cream: "#f3ead2" };
    const COLORS = { 1: [M.steel, M.steelD], 2: [M.brass, M.brassD], 3: [M.copper, M.copperD] };
    const timers = [];
    let raf = 0;
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:repeating-linear-gradient(0deg,#2e1a10 0 3px,#33201a 3px 6px);color:${M.cream};font-family:'EB Garamond',Georgia,serif;display:flex;flex-direction:column;align-items:center;padding:10px 12px 110px;box-sizing:border-box}
    .${P}top{display:flex;justify-content:space-between;align-items:center;width:100%;max-width:900px;gap:8px;flex-wrap:wrap}
    .${P}btn{font:inherit;color:${M.cream};background:${M.plate};border:1.5px solid ${M.brass};border-radius:4px;padding:7px 14px;cursor:pointer;min-height:40px}
    .${P}btn:hover{background:#5d4330}
    .${P}btn:disabled{opacity:.4;cursor:not-allowed}
    .${P}moves{font-family:ui-monospace,Menlo,monospace;border:1.5px solid ${M.brass};padding:7px 12px;background:#1d120b;color:${M.brass}}
    .${P}svg{flex:none;width:100%;max-width:900px;max-height:calc(100vh - 230px);height:auto;touch-action:manipulation;user-select:none}
    .${P}msg{max-width:900px;text-align:center;min-height:2.8em;margin:4px 0;font-size:16px}
    .${P}msg b{color:${M.brass}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(15,8,4,.72);z-index:5;padding:16px}
    .${P}intro div{max-width:460px;padding:24px;border:2px solid ${M.brass};background:${M.plate};text-align:center;border-radius:6px}
    .${P}intro h2{margin:0 0 8px;font-family:'IM Fell English',Georgia,serif;font-weight:400;color:${M.brass}}
    .${P}intro p{margin:0 0 10px}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `
      <div class="${P}top"><button type="button" class="${P}btn ${P}reset" title="Reset (R)">↺ Reset lever</button>
        <button type="button" class="${P}btn ${P}turn" title="Turn the knob (T)">Turn the knob ↻</button>
        <span class="${P}moves">MOVES 00</span></div>
      <svg class="${P}svg" viewBox="-40 -30 660 600" role="application" aria-label="Gear train. Choose a gear from the tray, then a peg."></svg>
      <p class="${P}msg" aria-live="polite">Pick a gear from the tray, then a peg. Turn the knob to test the train.</p>`;
    root.append(css, el);
    const svg = el.querySelector("svg");
    const msg = el.querySelector("." + P + "msg");
    const NS = "http://www.w3.org/2000/svg";
    const ox = 60, oy = 40;                      // board origin in svg units
    const px = (x) => ox + x * SP, py = (y) => oy + y * SP;

    let gears = [], tray = TRAY.slice(), sel = null, moves = 0, over = false, turning = false;
    let cursor = { x: 1, y: 1 }, rot = 0, t0 = performance.now(), hintLevel = 0, lastHintAt = performance.now();
    let spin = null; // { until, latchDir, jam }

    function hint() {
      for (const g of gears) if (!SOLUTION.some((s) => s.x === g.x && s.y === g.y && s.s === g.s)) return { remove: g };
      const next = SOLUTION.find((s) => !gears.some((g) => g.x === s.x && g.y === s.y));
      return next ? { place: next } : null;
    }

    function draw() {
      const now = performance.now();
      const A = analyse(gears);
      const spinning = spin && now < spin.until;
      const ang = (i) => (spinning && A.dir[i] && !spin.jam ? A.dir[i] * rot * (2 / A.all[i].s) : 0);
      let s = `
        <defs><pattern id="${P}grain" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke="rgba(0,0,0,.18)" stroke-width="1"/></pattern></defs>
        <path d="M-30 -20 L600 -24 L612 470 L-34 476 Z" fill="${M.leather}" stroke="#1a0d07" stroke-width="3"/>
        <path d="M-30 -20 L600 -24 L612 470 L-34 476 Z" fill="none" stroke="${M.brass}" stroke-width="1.2" stroke-dasharray="6 5" transform="translate(0 0) scale(.985) translate(4 4)"/>
        <rect x="${ox - 60}" y="${oy - 55}" width="${(COLS - 1) * SP + 120}" height="${(ROWS - 1) * SP + 110}" rx="10" fill="${M.plate}" stroke="${M.brassD}" stroke-width="3"/>
        <rect x="${ox - 60}" y="${oy - 55}" width="${(COLS - 1) * SP + 120}" height="${(ROWS - 1) * SP + 110}" rx="10" fill="url(#${P}grain)"/>`;
      // pegs
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        s += `<circle data-peg="${x},${y}" cx="${px(x)}" cy="${py(y)}" r="22" fill="transparent" style="cursor:pointer"/>
              <circle cx="${px(x)}" cy="${py(y)}" r="5" fill="#d8d2c4" stroke="#1d120b" pointer-events="none"/>`;
      }
      // bolt and rack driven by the latch
      const boltOpen = over ? 70 : 0;
      s += `<rect x="${px(4) + 20}" y="${py(2) + 52}" width="10" height="10" fill="${M.steelD}"/>
        <rect x="${px(3) + 10 + boltOpen}" y="${py(2) + 44}" width="${SP + 40}" height="12" fill="${M.brass}" stroke="${M.brassD}"/>
        ${Array.from({ length: 12 }, (_, i) => `<rect x="${px(3) + 14 + boltOpen + i * 11}" y="${py(2) + 38}" width="6" height="6" fill="${M.brass}"/>`).join("")}
        <rect x="${px(4) + 64 + boltOpen}" y="${py(2) + 24}" width="60" height="48" rx="4" fill="${M.steel}" stroke="${M.steelD}" stroke-width="2"/>
        <text x="${px(4) + 94 + boltOpen}" y="${py(2) + 53}" font-size="13" text-anchor="middle" fill="#2a2a2a" font-family="ui-monospace,monospace">BOLT</text>
        <path d="M${px(4) + 40} ${py(2) - 86} h50" stroke="${M.verd}" stroke-width="4" marker-end="url(#${P}ah)"/>
        <defs><marker id="${P}ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="${M.verd}"/></marker></defs>
        <text x="${px(4) + 98}" y="${py(2) - 82}" font-size="13" text-anchor="start" fill="${M.verd}">needs ↻</text>`;
      // mesh marks
      for (let i = 0; i < A.all.length; i++) for (const j of A.adj[i]) if (j > i) {
        const a = A.all[i], b = A.all[j];
        s += `<circle cx="${(px(a.x) + px(b.x)) / 2}" cy="${(py(a.y) + py(b.y)) / 2}" r="4" fill="${A.jam ? "#d0503a" : M.verd}" pointer-events="none"/>`;
      }
      // gears
      A.all.forEach((g, i) => {
        const [c, d] = i === 0 ? [M.brass, M.brassD] : i === 1 ? [M.steel, M.steelD] : COLORS[g.s];
        const r = RAD[g.s];
        const fixed = i < 2;
        s += `<g transform="translate(${px(g.x)} ${py(g.y)})" ${fixed ? "" : `data-gear="${i - 2}" style="cursor:pointer"`}>
          <g transform="rotate(${(ang(i) * 180) / Math.PI})">
            <path d="${gearPath(r)}" fill="${c}" stroke="${d}" stroke-width="2"/>
            <circle r="${r * 0.62}" fill="none" stroke="${d}" stroke-width="2"/>
            ${[0, 1, 2, 3].map((k) => `<circle cx="${(r * 0.38 * Math.cos((k * Math.PI) / 2)).toFixed(1)}" cy="${(r * 0.38 * Math.sin((k * Math.PI) / 2)).toFixed(1)}" r="${r * 0.12}" fill="${d}"/>`).join("")}
          </g><circle r="7" fill="#1d120b" stroke="${M.cream}" stroke-width="1.5"/></g>`;
        if (A.dir[i] && !A.jam && (spinning || !fixed)) {
          const cw = A.dir[i] === 1, rr = r + 14, a0 = cw ? -2.4 : -0.6, a1 = cw ? -0.6 : -2.4;
          s += `<path d="M${(px(g.x) + rr * Math.cos(a0)).toFixed(1)} ${(py(g.y) + rr * Math.sin(a0)).toFixed(1)} A${rr} ${rr} 0 0 ${cw ? 1 : 0} ${(px(g.x) + rr * Math.cos(a1)).toFixed(1)} ${(py(g.y) + rr * Math.sin(a1)).toFixed(1)}" fill="none" stroke="${M.verd}" stroke-width="3" opacity=".8" pointer-events="none"/>`;
        }
      });
      // crank on the knob
      const ka = spinning ? rot * 2 / KNOB.s : 0;
      s += `<g transform="translate(${px(0)} ${py(1)}) rotate(${(ka * 180) / Math.PI})" pointer-events="none"><rect x="-4" y="-4" width="52" height="8" rx="3" fill="${M.steel}"/><circle cx="50" r="9" fill="#5a2f1c"/></g>
        <text x="${px(0)}" y="${py(1) + 70}" text-anchor="middle" font-size="13" fill="${M.cream}">knob ↻</text>
        <text x="${px(4)}" y="${py(2) - 56}" text-anchor="middle" font-size="13" fill="${M.cream}">latch</text>`;
      // cursor
      s += `<rect x="${px(cursor.x) - 26}" y="${py(cursor.y) - 26}" width="52" height="52" fill="none" stroke="${M.cream}" stroke-dasharray="4 4" opacity=".6" pointer-events="none"/>`;
      // hint sigil
      const hintOn = !over && now - lastHintAt > (hintLevel === 0 ? 90000 : 60000);
      const h = hintLevel > 0 && !over ? hint() : null;
      if (h && h.place) s += `<circle cx="${px(h.place.x)}" cy="${py(h.place.y)}" r="${RAD[h.place.s]}" fill="none" stroke="#ffe08a" stroke-width="3" stroke-dasharray="8 6" pointer-events="none"/>`;
      if (h && h.remove) s += `<circle cx="${px(h.remove.x)}" cy="${py(h.remove.y)}" r="${RAD[h.remove.s] + 8}" fill="none" stroke="#ff8a6a" stroke-width="3" stroke-dasharray="8 6" pointer-events="none"/>`;
      s += `<g data-hint="1" style="cursor:pointer" transform="translate(568 438)"><circle r="26" fill="${hintOn ? "#e8c35a" : "#3a2a1a"}" stroke="${M.brass}" stroke-width="2"/>
        <path d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4Z" fill="${hintOn ? "#fff6d0" : M.brass}"/></g>`;
      // tray
      s += `<rect x="40" y="478" width="${TRAY.length * 78 + 20}" height="0" />`;
      s += `<rect x="20" y="470" width="500" height="80" rx="8" fill="#1d120b" stroke="${M.brass}" stroke-width="1.5"/>`;
      tray.forEach((sz, i) => {
        const cx = 60 + i * 80, cy = 510, r = RAD[sz] * 0.55;
        const [c, d] = COLORS[sz];
        s += `<g data-tray="${i}" style="cursor:pointer" transform="translate(${cx} ${cy})"><circle r="36" fill="${sel === i ? "rgba(232,195,90,.25)" : "transparent"}" stroke="${sel === i ? "#ffe08a" : "none"}" stroke-width="2"/>
          <path d="${gearPath(r)}" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle r="4" fill="#1d120b"/>
          <text y="33" font-size="11" text-anchor="middle" fill="${M.cream}">${sz === 1 ? "small" : sz === 2 ? "medium" : "large"}</text></g>`;
      });
      svg.innerHTML = s;
      el.querySelector("." + P + "moves").textContent = "MOVES " + String(moves).padStart(2, "0");
    }

    function placeAt(x, y) {
      if (over || turning) return;
      const i = gears.findIndex((g) => g.x === x && g.y === y);
      if (i >= 0) { tray.push(gears[i].s); tray.sort(); gears.splice(i, 1); moves++; sel = null; msg.textContent = "Gear returned to the tray."; draw(); return; }
      if (sel == null) { msg.textContent = "Choose a gear from the tray first (or press 1, 2 or 3)."; return; }
      const s = tray[sel];
      const why = blocked(gears, x, y, s);
      if (why) { msg.textContent = why; return; }
      gears.push({ x, y, s }); tray.splice(sel, 1); moves++;
      sel = tray.length ? Math.min(sel, tray.length - 1) : null;
      const A = analyse(gears);
      msg.innerHTML = A.jam ? "<b>The train would lock:</b> two meshed gears are forced the same way." : A.latch ? `The knob reaches the latch. It would turn <b>${A.latch === 1 ? "clockwise" : "counter-clockwise"}</b>.` : "Placed.";
      draw();
    }
    function turn() {
      if (over || turning) return;
      const A = analyse(gears);
      turning = true;
      spin = { until: performance.now() + (api.reducedMotion ? 300 : 1600), jam: A.jam };
      let text;
      if (A.jam) text = "<b>The train locks.</b> Somewhere two meshed gears are forced the same way; look for a closed loop.";
      else if (!A.latch) text = "The knob spins freely. The train does not reach the latch.";
      else if (A.latch === -1) text = "<b>The latch turns counter-clockwise</b> and drives the bolt into its stop. Count the meshes: an even number turns it your way.";
      else text = "<b>The latch turns clockwise.</b> The rack draws the bolt back, and the clasp opens.";
      msg.innerHTML = text;
      moves++;
      timers.push(setTimeout(() => {
        turning = false; spin = null; rot = 0;
        if (A.latch === 1 && !A.jam) {
          over = true; draw();
          timers.push(setTimeout(() => api.end({ outcome: "win", text: `The clasp opens in ${moves} moves (a clean train needs 3 gears and one turn: par 4). Inside, a folded page waits.` }), api.reducedMotion ? 100 : 900));
        } else draw();
      }, api.reducedMotion ? 300 : 1600));
    }
    function reset() { if (over || turning) return; gears = []; tray = TRAY.slice(); sel = null; moves = 0; msg.textContent = "Reset. The tray is full again."; draw(); }

    svg.addEventListener("click", (e) => {
      const t = e.target.closest("[data-peg],[data-gear],[data-tray],[data-hint]");
      if (!t) return;
      if (t.dataset.tray != null) { sel = +t.dataset.tray; draw(); return; }
      if (t.dataset.hint) { if (performance.now() - lastHintAt > (hintLevel === 0 ? 90000 : 60000)) { hintLevel++; lastHintAt = performance.now(); msg.textContent = "The sigil marks a move."; } else msg.textContent = "The sigil is not yet lit."; draw(); return; }
      const g = t.dataset.gear != null ? gears[+t.dataset.gear] : null;
      const [x, y] = g ? [g.x, g.y] : t.dataset.peg.split(",").map(Number);
      cursor = { x, y };
      placeAt(x, y);
    });
    el.querySelector("." + P + "turn").addEventListener("click", turn);
    el.querySelector("." + P + "reset").addEventListener("click", reset);
    const onKey = (e) => {
      if (intro.isConnected || over) return;
      const k = e.key;
      if (k === "ArrowLeft") cursor.x = Math.max(0, cursor.x - 1);
      else if (k === "ArrowRight") cursor.x = Math.min(COLS - 1, cursor.x + 1);
      else if (k === "ArrowUp") cursor.y = Math.max(0, cursor.y - 1);
      else if (k === "ArrowDown") cursor.y = Math.min(ROWS - 1, cursor.y + 1);
      else if (k === "1" || k === "2" || k === "3") { const i = tray.indexOf(+k); sel = i >= 0 ? i : sel; if (i < 0) msg.textContent = "None of that size left in the tray."; }
      else if (k === "Enter" || k === " ") { placeAt(cursor.x, cursor.y); e.preventDefault(); return; }
      else if (k === "t" || k === "T") { turn(); return; }
      else if (k === "r" || k === "R") { reset(); return; }
      else return;
      e.preventDefault(); draw();
    };
    addEventListener("keydown", onKey);

    let lastSigil = false;
    function loop(now) {
      const dt = (now - t0) / 1000; t0 = now;
      const sig = !over && now - lastHintAt > (hintLevel === 0 ? 90000 : 60000);
      if (spin) { rot += dt * 2.4; draw(); }
      else if (sig !== lastSigil) draw();
      lastSigil = sig;
      raf = requestAnimationFrame(loop);
    }

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>The Clasps</h2>
      <p>The road book is clasped shut by a gear train. Place gears on the pegs so the knob drives the latch <b>clockwise</b>. Gears side by side turn opposite ways; two large gears also mesh corner to corner.</p>
      <p>Tap a tray gear, then a peg; tap a placed gear to take it back. Keys: arrows, 1/2/3, Enter, T to turn, R to reset.</p>
      <button type="button" class="${P}btn">Start</button></div>`;
    el.appendChild(intro);
    intro.querySelector("button").addEventListener("click", () => { intro.remove(); lastHintAt = performance.now(); });
    intro.querySelector("button").focus();

    draw();
    raf = requestAnimationFrame(loop);
    return { unmount() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); removeEventListener("keydown", onKey); } };
  },
};

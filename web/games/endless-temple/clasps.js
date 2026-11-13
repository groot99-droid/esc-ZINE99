// The Endless Temple / The Clasps (1D, mechanical puzzle). Style: Clockwork cutaway.
// DESIGN.md section 11, The Clasps, played as three clasps in one sitting, each built differently:
//   g_clasp_c3b  lever bank: five levers; pressing one flips it and its neighbours; all must lie flat.
//   g_clasp_c5   strap fold: six straps; a strap lifts only when no other strap lies across it; then the hasp.
//   g_clasp_c7   gear train: place gears on a 5 x 4 peg board so the knob drives the latch clockwise.
//                To make parity solvable on a square board, two large gears also mesh corner to corner.
// Each clasp opens a book holding a fragment of the past (DESIGN.md section 5, "The past, in slots":
// F3, F4, F5). The fragment texts are the design's own proposals, marked there as replaceable.
// There is no failure (reset is free); the clasps are scored in moves against par. The hint sigil
// glows after 90 seconds on a clasp and shows one correct next move; after another 60 it can be
// pressed again.

// Narration written for the game (not quotations). Fragment texts below are DESIGN.md's (section 5).
const LINES = {
  open: "The temple keeps some books shut. Elaris carries three of them to the reading table, each clasped a different way.",
  lever: "A slim book from the third gallery, its clasp a bank of five brass levers.",
  strap: "A ruling bound in leather: six straps folded across the cover, one over another.",
  gear: "The last book's clasp is a gear train. The knob turns one way; the latch must turn the other way round to open.",
  frag3: "Inside, a folded letter from another reader.",
  frag4: "Inside, the Wardens of the Shelves' ruling.",
  frag5: "Inside, Keeper Maudric's petition.",
  endPar: "Three clasps, three pages of the past, and hardly a wasted move. Elaris lays the letter, the ruling and the petition side by side, and reads them in order.",
  endOver: "Three clasps open at last, the table scattered with brass. Elaris lays the letter, the ruling and the petition side by side, and reads them in order.",
};
const FRAG = {
  F3: "He read the Lantern Country as its narrator for a season, and would not set the cup down. While he stayed, its story could not end, and its lamps burned down one by one. “They are all in the dark now.”",
  F4: "The sentence: to be shelved inside the dark book, reading forever into a world with no light.",
  F5: "“Let him keep them all, since he could not keep one.” Maudric asked for this as he was dying.",
};

// ---- lever bank (c3b) ----
const LEVERS0 = [1, 0, 1, 0, 1];      // three raised; par 3 (press 1, 3, 5 or 2, 3, 4)
// ---- strap fold (c5): centre lines in board units, z = layer order (higher lies on top) ----
const STRAPS = [
  { id: "A", a: [40, 120], b: [560, 120], z: 5, col: "#7a4a2a" },
  { id: "B", a: [40, 310], b: [560, 310], z: 2, col: "#6a3a22" },
  { id: "C", a: [170, 30], b: [170, 410], z: 3, col: "#8a5634" },
  { id: "D", a: [430, 30], b: [430, 410], z: 6, col: "#5e3420" },
  { id: "E", a: [60, 50], b: [540, 390], z: 4, col: "#94603a" },
  { id: "F", a: [540, 50], b: [300, 410], z: 1, col: "#70402a" },
];
function segX(p, q, r, s) {
  const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
  if (!d) return false;
  const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
  const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
  return t > 0 && t < 1 && u > 0 && u < 1;
}
const CROSS = STRAPS.map((s) => STRAPS.filter((o) => o !== s && segX(s.a, s.b, o.a, o.b)).map((o) => o.id));
// ---- gear train (c7) ----
const COLS = 5, ROWS = 4, SP = 100;
const RAD = { 1: 32, 2: 44, 3: 62 };
const KNOB = { x: 0, y: 1, s: 2 }, LATCH = { x: 4, y: 2, s: 2 };
const TRAY = [1, 1, 2, 2, 3, 3];
const SOLUTION = [{ x: 1, y: 1, s: 1 }, { x: 2, y: 1, s: 3 }, { x: 3, y: 2, s: 3 }];

const STAGES = [
  { key: "lever", name: "The lever bank", scene: "g_clasp_c3b", par: 3, intro: LINES.lever, frag: "F3", found: LINES.frag3,
    help: "Press a lever (tap, or 1 to 5). It flips, and so do its neighbours. Lay all five flat." },
  { key: "strap", name: "The strap fold", scene: "g_clasp_c5", par: 7, intro: LINES.strap, frag: "F4", found: LINES.frag4,
    help: "Lift a strap (tap, or A to F) only when nothing lies across it. Then open the hasp (H)." },
  { key: "gear", name: "The gear train", scene: "g_clasp_c7", par: 4, intro: LINES.gear, frag: "F5", found: LINES.frag5,
    help: "Pick a tray gear (1, 2, 3), then a peg (arrows, Enter). Turn the knob (T) to test. Side by side, gears turn opposite ways; two large gears also mesh corner to corner." },
];

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
const pop = (m) => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };
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
    for (const j of adj[i]) { if (!dir[j]) { dir[j] = -dir[i]; st.push(j); } else if (dir[j] === dir[i]) jam = true; }
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
    const M = { brass: "#c9973a", brassD: "#8a6224", brassL: "#e8c36a", copper: "#b8643a", copperD: "#7a3f22", steel: "#a9adb2", steelD: "#6d7176", leather: "#3b2216", plate: "#4a3524", verd: "#7fb79c", cream: "#f3ead2", red: "#e0644a" };
    const COLORS = { 1: [M.steel, M.steelD], 2: [M.brass, M.brassD], 3: [M.copper, M.copperD] };
    const rm = api.reducedMotion;
    const timers = [];
    let raf = 0;
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:repeating-linear-gradient(0deg,#2e1a10 0 3px,#33201a 3px 6px);color:${M.cream};font-family:'EB Garamond',Georgia,serif;display:flex;flex-direction:column;align-items:center;padding:10px 12px 120px;box-sizing:border-box;font-size:16px}
    .${P}top{display:flex;justify-content:space-between;align-items:center;width:100%;max-width:900px;gap:8px;flex-wrap:wrap}
    .${P}btn{font:inherit;font-size:15px;color:${M.cream};background:${M.plate};border:1.5px solid ${M.brass};border-radius:4px;padding:7px 14px;cursor:pointer;min-height:42px}
    .${P}btn:hover,.${P}btn:focus-visible{background:#6a4a30;outline:2px solid ${M.brassL};outline-offset:1px}
    .${P}btn:disabled{opacity:.4;cursor:not-allowed}
    .${P}btn[hidden]{display:none}
    .${P}stage{flex:1;min-width:150px;text-align:center}
    .${P}stage b{display:block;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:20px;color:${M.brassL}}
    .${P}stage span{font-size:14px;font-variant:small-caps;letter-spacing:.12em;opacity:.9}
    .${P}moves{font-family:ui-monospace,Menlo,monospace;font-size:15px;border:1.5px solid ${M.brass};padding:7px 12px;background:#1d120b;color:${M.brassL};text-align:right;line-height:1.15}
    .${P}moves small{display:block;font-size:12px;color:${M.cream};opacity:.8}
    .${P}moves.${P}over{color:${M.red}}
    .${P}beat{max-width:900px;width:100%;margin:8px 0 2px;font-style:italic;font-size:16px;color:#e7d6b3;text-align:center;min-height:1.4em}
    .${P}svg{flex:none;width:100%;max-width:900px;max-height:calc(100vh - 270px);min-height:240px;height:auto;touch-action:manipulation;user-select:none}
    .${P}msg{max-width:900px;text-align:center;min-height:2.8em;margin:4px 0;font-size:16px;line-height:1.35}
    .${P}msg b{color:${M.brassL}}
    .${P}msg.${P}bad{color:#ffb39f}
    .${P}frag{position:absolute;inset:0;display:grid;place-items:center;background:rgba(15,8,4,.6);z-index:4;padding:16px}
    .${P}frag div{max-width:440px;background:#efe3c4;color:#2f1d10;padding:20px 22px;font-size:17px;line-height:1.4;box-shadow:0 10px 30px rgba(0,0,0,.6);transform:rotate(-1deg);border:1px solid #8a6224}
    .${P}frag small{display:block;font-variant:small-caps;letter-spacing:.12em;font-size:14px;color:#7a5a2a;margin-bottom:6px}
    .${P}frag p{margin:0 0 12px}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(15,8,4,.75);z-index:5;padding:16px;overflow:auto}
    .${P}plate{max-width:440px;padding:20px 22px;border:2px solid ${M.brass};background:linear-gradient(160deg,#5a4330,#3e2c1d);border-radius:8px;position:relative;box-shadow:inset 0 0 0 5px #3e2c1d,inset 0 0 0 6px ${M.brassD},0 18px 40px rgba(0,0,0,.6)}
    .${P}plate::before,.${P}plate::after{content:"";position:absolute;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,${M.brassL},${M.brassD});top:10px;left:10px;box-shadow:calc(100% + 0px) 0 0 0 transparent}
    .${P}plate::after{left:auto;right:10px}
    .${P}plate h2{margin:0 0 4px;font-family:'IM Fell English',Georgia,serif;font-weight:400;color:${M.brassL};font-size:28px;text-align:center}
    .${P}plate .${P}goal{text-align:center;margin:0 0 12px;font-size:17px}
    .${P}plate dl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 14px;font-size:16px}
    .${P}plate dt{font-family:ui-monospace,Menlo,monospace;font-size:14px;color:#1d120b;background:${M.brass};padding:1px 8px;border-radius:3px;align-self:start;text-align:center}
    .${P}plate dd{margin:0}
    .${P}plate .${P}go{display:block;margin:0 auto}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `
      <div class="${P}top"><button type="button" class="${P}btn ${P}reset" title="Reset (R)">↺ Reset lever</button>
        <div class="${P}stage"><b></b><span></span></div>
        <button type="button" class="${P}btn ${P}turn" title="Turn the knob (T)" hidden>Turn the knob ↻</button>
        <span class="${P}moves">MOVES 00<small>par 3</small></span></div>
      <p class="${P}beat" aria-live="polite"></p>
      <svg class="${P}svg" viewBox="-40 -30 660 600" role="application" aria-label="The clasp mechanism"></svg>
      <p class="${P}msg" aria-live="polite"></p>`;
    root.append(css, el);
    const svg = el.querySelector("svg");
    const msg = el.querySelector("." + P + "msg");
    const beat = el.querySelector("." + P + "beat");
    const turnBtn = el.querySelector("." + P + "turn");
    const ox = 60, oy = 40;
    const px = (x) => ox + x * SP, py = (y) => oy + y * SP;

    let si = 0, stage = STAGES[0], over = false, busy = false, moves = 0, totalMoves = 0;
    let stageStart = performance.now(), hintLevel = 0, lastHintAt = performance.now(), flash = null;
    // lever state
    let levers = LEVERS0.slice(), levCur = 0, changed = [];
    // strap state
    let lifted = new Set(), blockedBy = null, shake = null, hasp = false, strapCur = 0;
    // gear state
    let gears = [], tray = TRAY.slice(), sel = null, turning = false, cursor = { x: 1, y: 1 }, rot = 0, spin = null, t0 = performance.now();

    function say(t, bad) { msg.innerHTML = t; msg.classList.toggle(P + "bad", !!bad); }
    const sigilLit = () => !over && !busy && performance.now() - lastHintAt > (hintLevel === 0 ? 90000 : 60000);

    function setStage(i) {
      si = i; stage = STAGES[i]; moves = 0; over = false; busy = false; hintLevel = 0; lastHintAt = performance.now(); stageStart = performance.now();
      levers = LEVERS0.slice(); changed = []; lifted = new Set(); hasp = false; blockedBy = null; gears = []; tray = TRAY.slice(); sel = null;
      el.querySelector("." + P + "stage b").textContent = stage.name;
      el.querySelector("." + P + "stage span").textContent = `Clasp ${i + 1} of ${STAGES.length}`;
      turnBtn.hidden = stage.key !== "gear";
      beat.textContent = stage.intro;
      say(stage.help);
      draw();
    }
    function bump() { moves++; totalMoves++; }

    // ---- hint for the current clasp ----
    function hint() {
      if (stage.key === "lever") {
        // press any raised lever whose press reduces the raised count most, or the middle
        // the smallest set of presses that lays every lever flat (brute force over 32 sets)
        const sets = Array.from({ length: 31 }, (_, k) => k + 1).sort((a, b) => pop(a) - pop(b));
        for (const m of sets) {
          const s = levers.slice();
          for (let k = 0; k < 5; k++) if (m >> k & 1) for (const j of [k - 1, k, k + 1]) if (j >= 0 && j < 5) s[j] ^= 1;
          if (s.every((v) => !v)) { for (let k = 0; k < 5; k++) if (m >> k & 1) return { lever: k }; }
        }
        return null;
      }
      if (stage.key === "strap") {
        const s = STRAPS.find((s) => !lifted.has(s.id) && canLift(s));
        return s ? { strap: s.id } : { hasp: true };
      }
      for (const g of gears) if (!SOLUTION.some((s) => s.x === g.x && s.y === g.y && s.s === g.s)) return { remove: g };
      const next = SOLUTION.find((s) => !gears.some((g) => g.x === s.x && g.y === s.y));
      return next ? { place: next } : { turn: true };
    }

    // ---- drawing ----
    function frame() {
      return `<defs><pattern id="${P}grain" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke="rgba(0,0,0,.18)" stroke-width="1"/></pattern>
          <pattern id="${P}hide" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="rgba(0,0,0,.22)"/><circle cx="6" cy="7" r=".7" fill="rgba(255,220,180,.08)"/></pattern>
          <marker id="${P}ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="${M.verd}"/></marker></defs>
        <path d="M-30 -20 L600 -24 L612 470 L-34 476 Z" fill="${M.leather}" stroke="#1a0d07" stroke-width="3"/>
        <path d="M-30 -20 L600 -24 L612 470 L-34 476 Z" fill="url(#${P}hide)"/>
        <path d="M-30 -20 L600 -24 L612 470 L-34 476 Z" fill="none" stroke="${M.brass}" stroke-width="1.2" stroke-dasharray="6 5" transform="scale(.985) translate(4 4)"/>`;
    }
    function sigil() {
      const lit = sigilLit();
      return `<g data-hint="1" style="cursor:pointer" transform="translate(568 438)" role="button" aria-label="Hint sigil"><circle r="28" fill="${lit ? "#e8c35a" : "#3a2a1a"}" stroke="${M.brass}" stroke-width="2"/>
        <path d="M0 -17 L4 -4 L17 0 L4 4 L0 17 L-4 4 L-17 0 L-4 -4Z" fill="${lit ? "#fff6d0" : M.brass}"/>
        ${lit && !rm ? `<circle r="28" fill="none" stroke="#ffe08a" stroke-width="3"><animate attributeName="r" values="28;40;28" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite"/></circle>` : ""}</g>
        <text x="568" y="488" text-anchor="middle" font-size="18" fill="${M.cream}" opacity=".85">hint</text>`;
    }
    function drawLevers() {
      const h = hintLevel > 0 && !over ? hint() : null;
      let s = `<rect x="20" y="40" width="560" height="380" rx="14" fill="${M.plate}" stroke="${M.brassD}" stroke-width="3"/>
        <rect x="20" y="40" width="560" height="380" rx="14" fill="url(#${P}grain)"/>
        <rect x="60" y="244" width="480" height="12" rx="6" fill="${M.brassD}"/><text x="40" y="200" font-size="18" fill="${M.cream}" opacity=".7" text-anchor="middle" transform="rotate(-90 40 200)">raised</text><text x="40" y="310" font-size="18" fill="${M.cream}" opacity=".7" text-anchor="middle" transform="rotate(-90 40 310)">flat</text>
        <text x="300" y="90" text-anchor="middle" font-size="22" fill="${M.cream}">lay all five flat</text>`;
      levers.forEach((up, i) => {
        const x = 110 + i * 95, y = 250;
        const ang = up ? 0 : 180;
        const hot = i === levCur && !over;
        const ch = changed.includes(i) && flash && performance.now() < flash;
        s += `<g data-lever="${i}" style="cursor:pointer" role="button" aria-label="Lever ${i + 1}, ${up ? "raised" : "flat"}">
          <rect x="${x - 44}" y="130" width="88" height="270" fill="transparent"/>
          <g transform="translate(${x} ${y}) rotate(${ang})">
            <rect x="-8" y="-100" width="16" height="100" rx="5" fill="${up ? M.copper : M.brass}" stroke="${up ? M.copperD : M.brassD}" stroke-width="2"/>
            <circle cx="0" cy="-100" r="16" fill="${up ? M.copper : M.brassL}" stroke="${up ? M.copperD : M.brassD}" stroke-width="2"/>
          </g>
          <circle cx="${x}" cy="${y}" r="13" fill="${M.steel}" stroke="${M.steelD}" stroke-width="2"/>
          ${ch ? `<circle cx="${x}" cy="${y}" r="30" fill="none" stroke="${M.brassL}" stroke-width="3" opacity=".8"/>` : ""}
          ${hot ? `<rect x="${x - 42}" y="132" width="84" height="266" fill="none" stroke="${M.cream}" stroke-dasharray="5 5" opacity=".7"/>` : ""}
          ${h && h.lever === i ? `<circle cx="${x}" cy="${y}" r="40" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="8 6"/>` : ""}
          <text x="${x}" y="384" text-anchor="middle" font-size="22" fill="${M.cream}">${i + 1}</text>
          <text x="${x}" y="408" text-anchor="middle" font-size="18" fill="${up ? "#ffb39f" : M.verd}">${up ? "raised" : "flat"}</text></g>`;
      });
      const open = over ? 90 : 0;
      s += `<rect x="${250 + open}" y="430" width="100" height="34" rx="5" fill="${M.steel}" stroke="${M.steelD}" stroke-width="2"/><text x="${300 + open}" y="454" text-anchor="middle" font-size="18" fill="#222">CATCH</text>`;
      return s;
    }
    function canLift(st) { return !STRAPS.some((o) => !lifted.has(o.id) && o.z > st.z && CROSS[STRAPS.indexOf(st)].includes(o.id)); }
    function drawStraps() {
      const h = hintLevel > 0 && !over ? hint() : null;
      const now = performance.now();
      let s = `<rect x="0" y="10" width="600" height="420" rx="8" fill="#5a3826" stroke="#2a160c" stroke-width="3"/><rect x="0" y="10" width="600" height="420" rx="8" fill="url(#${P}hide)"/>`;
      // the hasp in the middle
      const all = lifted.size === STRAPS.length;
      s += `<g data-hasp="1" style="cursor:${all ? "pointer" : "default"}" role="button" aria-label="The hasp"><rect x="262" y="190" width="76" height="60" rx="10" fill="${hasp ? M.verd : M.brass}" stroke="${M.brassD}" stroke-width="3"/>
        <circle cx="300" cy="220" r="12" fill="#1d120b"/><rect x="296" y="220" width="8" height="18" fill="#1d120b"/>
        ${all && !hasp ? `<rect x="254" y="182" width="92" height="76" rx="14" fill="none" stroke="#ffe08a" stroke-width="3"/>` : ""}</g>`;
      const order = STRAPS.slice().sort((a, b) => a.z - b.z);
      for (const st of order) {
        const i = STRAPS.indexOf(st);
        const up = lifted.has(st.id);
        const sh = shake && shake.id === st.id && now < shake.until ? Math.sin(now / 25) * 5 : 0;
        const blk = blockedBy && blockedBy.ids.includes(st.id) && now < blockedBy.until;
        const ang = Math.atan2(st.b[1] - st.a[1], st.b[0] - st.a[0]);
        const len = Math.hypot(st.b[0] - st.a[0], st.b[1] - st.a[1]);
        const mx = (st.a[0] + st.b[0]) / 2, my = (st.a[1] + st.b[1]) / 2;
        const hot = i === strapCur && !over;
        s += `<g data-strap="${st.id}" style="cursor:pointer" role="button" aria-label="Strap ${st.id}${up ? ", lifted" : ""}" transform="translate(${mx + sh} ${my}) rotate(${(ang * 180) / Math.PI})" opacity="${up ? 0.22 : 1}">
          <rect x="${-len / 2}" y="-24" width="${len}" height="48" fill="transparent"/>
          <rect x="${-len / 2}" y="-18" width="${len}" height="36" rx="4" fill="${st.col}" stroke="${blk ? M.red : "#2a160c"}" stroke-width="${blk ? 4 : 2}"/>
          <line x1="${-len / 2 + 8}" y1="-11" x2="${len / 2 - 8}" y2="-11" stroke="#d9b98a" stroke-dasharray="7 6" stroke-width="1.5" opacity=".8"/>
          <line x1="${-len / 2 + 8}" y1="11" x2="${len / 2 - 8}" y2="11" stroke="#d9b98a" stroke-dasharray="7 6" stroke-width="1.5" opacity=".8"/>
          <rect x="${len / 2 - 30}" y="-22" width="24" height="44" rx="3" fill="none" stroke="${M.brass}" stroke-width="4"/>
          ${hot ? `<rect x="${-len / 2 - 4}" y="-24" width="${len + 8}" height="48" fill="none" stroke="${M.cream}" stroke-dasharray="6 5"/>` : ""}
          ${h && h.strap === st.id ? `<rect x="${-len / 2 - 6}" y="-27" width="${len + 12}" height="54" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="10 6"/>` : ""}
          <g transform="translate(${-len / 2 + 34} 0) rotate(${(-ang * 180) / Math.PI})"><circle r="15" fill="#1d120b" stroke="${M.brass}" stroke-width="2"/><text y="7" text-anchor="middle" font-size="20" fill="${M.brassL}">${st.id}</text></g></g>`;
      }
      if (h && h.hasp) s += `<rect x="248" y="176" width="104" height="88" rx="16" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="10 6"/>`;
      return s;
    }
    function drawGears() {
      const now = performance.now();
      const A = analyse(gears);
      const spinning = spin && now < spin.until;
      const ang = (i) => (spinning && A.dir[i] && !spin.jam ? A.dir[i] * rot * (2 / A.all[i].s) : (spinning && spin.jam && !rm ? Math.sin(now / 30) * 0.03 : 0));
      let s = `<rect x="${ox - 60}" y="${oy - 55}" width="${(COLS - 1) * SP + 120}" height="${(ROWS - 1) * SP + 110}" rx="10" fill="${M.plate}" stroke="${M.brassD}" stroke-width="3"/>
        <rect x="${ox - 60}" y="${oy - 55}" width="${(COLS - 1) * SP + 120}" height="${(ROWS - 1) * SP + 110}" rx="10" fill="url(#${P}grain)"/>`;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const hov = cursor.x === x && cursor.y === y;
        s += `<circle data-peg="${x},${y}" cx="${px(x)}" cy="${py(y)}" r="30" fill="${hov && sel != null ? "rgba(232,195,90,.18)" : "transparent"}" style="cursor:pointer"/>
              <circle cx="${px(x)}" cy="${py(y)}" r="6" fill="#d8d2c4" stroke="#1d120b" pointer-events="none"/>`;
      }
      const boltOpen = over ? 70 : 0;
      s += `<rect x="${px(3) + 10 + boltOpen}" y="${py(2) + 44}" width="${SP + 40}" height="12" fill="${M.brass}" stroke="${M.brassD}"/>
        ${Array.from({ length: 12 }, (_, i) => `<rect x="${px(3) + 14 + boltOpen + i * 11}" y="${py(2) + 38}" width="6" height="6" fill="${M.brass}"/>`).join("")}
        <rect x="${px(4) + 64 + boltOpen}" y="${py(2) + 24}" width="64" height="48" rx="4" fill="${M.steel}" stroke="${M.steelD}" stroke-width="2"/>
        <text x="${px(4) + 96 + boltOpen}" y="${py(2) + 55}" font-size="18" text-anchor="middle" fill="#222">BOLT</text>
        <path d="M${px(4) + 36} ${py(2) - 90} h40" stroke="${M.verd}" stroke-width="4" marker-end="url(#${P}ah)"/>
        <text x="${px(4) - 4}" y="${py(2) - 104}" font-size="20" text-anchor="start" fill="${M.verd}">needs ↻</text>`;
      for (let i = 0; i < A.all.length; i++) for (const j of A.adj[i]) if (j > i) {
        const a = A.all[i], b = A.all[j];
        s += `<circle cx="${(px(a.x) + px(b.x)) / 2}" cy="${(py(a.y) + py(b.y)) / 2}" r="5" fill="${A.jam ? M.red : M.verd}" pointer-events="none"/>`;
      }
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
        if (A.dir[i] && !A.jam && (spinning || !fixed || i === 1)) {
          const cw = A.dir[i] === 1, rr = r + 14, a0 = cw ? -2.4 : -0.6, a1 = cw ? -0.6 : -2.4;
          const col = i === 1 ? (cw ? M.verd : M.red) : M.verd;
          s += `<path d="M${(px(g.x) + rr * Math.cos(a0)).toFixed(1)} ${(py(g.y) + rr * Math.sin(a0)).toFixed(1)} A${rr} ${rr} 0 0 ${cw ? 1 : 0} ${(px(g.x) + rr * Math.cos(a1)).toFixed(1)} ${(py(g.y) + rr * Math.sin(a1)).toFixed(1)}" fill="none" stroke="${col}" stroke-width="4" opacity=".9" pointer-events="none" marker-end="url(#${P}ah)"/>`;
        }
      });
      const ka = spinning ? rot * 2 / KNOB.s : 0;
      s += `<g transform="translate(${px(0)} ${py(1)}) rotate(${(ka * 180) / Math.PI})" pointer-events="none"><rect x="-4" y="-4" width="52" height="8" rx="3" fill="${M.steel}"/><circle cx="50" r="9" fill="#5a2f1c"/></g>
        <text x="${px(0)}" y="${py(1) + 78}" text-anchor="middle" font-size="20" fill="${M.cream}">knob ↻</text>
        <text x="${px(4)}" y="${py(2) - 60}" text-anchor="middle" font-size="20" fill="${M.cream}">latch</text>`;
      if (!over) s += `<rect x="${px(cursor.x) - 30}" y="${py(cursor.y) - 30}" width="60" height="60" fill="none" stroke="${M.cream}" stroke-dasharray="5 5" opacity=".75" pointer-events="none"/>`;
      const h = hintLevel > 0 && !over ? hint() : null;
      if (h && h.place) s += `<circle cx="${px(h.place.x)}" cy="${py(h.place.y)}" r="${RAD[h.place.s]}" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="8 6" pointer-events="none"/><text x="${px(h.place.x)}" y="${py(h.place.y) + 6}" text-anchor="middle" font-size="18" fill="#ffe08a" pointer-events="none">${["", "small", "medium", "large"][h.place.s]}</text>`;
      if (h && h.remove) s += `<circle cx="${px(h.remove.x)}" cy="${py(h.remove.y)}" r="${RAD[h.remove.s] + 8}" fill="none" stroke="#ff8a6a" stroke-width="4" stroke-dasharray="8 6" pointer-events="none"/>`;
      s += `<rect x="-10" y="474" width="530" height="96" rx="8" fill="#1d120b" stroke="${M.brass}" stroke-width="1.5"/>`;
      tray.forEach((sz, i) => {
        const cx = 36 + i * 82, cy = 510, r = RAD[sz] * 0.55;
        const [c, d] = COLORS[sz];
        s += `<g data-tray="${i}" style="cursor:pointer" transform="translate(${cx} ${cy})" role="button" aria-label="${["", "small", "medium", "large"][sz]} gear"><circle r="38" fill="${sel === i ? "rgba(232,195,90,.3)" : "transparent"}" stroke="${sel === i ? "#ffe08a" : "none"}" stroke-width="3"/>
          <path d="${gearPath(r)}" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle r="4" fill="#1d120b"/>
          <text y="50" font-size="17" text-anchor="middle" fill="${M.cream}">${sz === 1 ? "small" : sz === 2 ? "medium" : "large"}</text></g>`;
      });
      return s;
    }
    function draw() {
      let s = frame();
      s += stage.key === "lever" ? drawLevers() : stage.key === "strap" ? drawStraps() : drawGears();
      s += sigil();
      // on a narrow screen the board shrinks; grow its lettering so it stays legible
      const F = Math.max(1, Math.min(1.7, 600 / Math.max(300, svg.getBoundingClientRect().width || 600)));
      if (F > 1.05) s = s.replace(/font-size="(\d+)"/g, (m, n) => `font-size="${Math.round(n * F)}"`);
      svg.innerHTML = s;
      const mv = el.querySelector("." + P + "moves");
      mv.innerHTML = `MOVES ${String(moves).padStart(2, "0")}<small>par ${stage.par}</small>`;
      mv.classList.toggle(P + "over", moves > stage.par);
    }

    // ---- actions ----
    function pressLever(i) {
      if (over || busy) return;
      levCur = i;
      changed = [i - 1, i, i + 1].filter((j) => j >= 0 && j < 5);
      for (const j of changed) levers[j] ^= 1;
      flash = performance.now() + (rm ? 0 : 450);
      bump();
      const up = levers.filter(Boolean).length;
      say(up ? `Lever ${i + 1} flips${changed.length > 1 ? `, and ${changed.filter((j) => j !== i).map((j) => j + 1).join(" and ")} with it` : ""}. ${up} still raised.` : "<b>All five lie flat.</b> The catch slides back.");
      if (!up) solve();
      draw();
    }
    function liftStrap(id) {
      if (over || busy) return;
      const st = STRAPS.find((s) => s.id === id);
      strapCur = STRAPS.indexOf(st);
      if (lifted.has(id)) { say(`Strap ${id} is already lifted.`); draw(); return; }
      bump();
      if (!canLift(st)) {
        const ids = STRAPS.filter((o) => !lifted.has(o.id) && o.z > st.z && CROSS[strapCur].includes(o.id)).map((o) => o.id);
        blockedBy = { ids, until: performance.now() + 1200 };
        shake = { id, until: performance.now() + (rm ? 0 : 400) };
        say(`Strap ${id} will not lift: ${ids.join(" and ")} ${ids.length > 1 ? "lie" : "lies"} across it.`, true);
      } else {
        lifted.add(id);
        say(lifted.size === STRAPS.length ? "Every strap is lifted. <b>Open the hasp</b> (tap it, or H)." : `Strap ${id} folds back. ${STRAPS.length - lifted.size} to go.`);
      }
      draw();
    }
    function openHasp() {
      if (over || busy) return;
      if (lifted.size < STRAPS.length) { say("The hasp will not move while a strap still holds it.", true); bump(); draw(); return; }
      bump(); hasp = true; say("<b>The hasp springs.</b> The ruling falls open."); solve(); draw();
    }
    function placeAt(x, y) {
      if (over || busy || turning) return;
      cursor = { x, y };
      const i = gears.findIndex((g) => g.x === x && g.y === y);
      if (i >= 0) { tray.push(gears[i].s); tray.sort(); gears.splice(i, 1); bump(); sel = null; say("Gear returned to the tray."); draw(); return; }
      if (sel == null) { say("Choose a gear from the tray first (or press 1, 2 or 3).", true); draw(); return; }
      const s = tray[sel];
      const why = blocked(gears, x, y, s);
      if (why) { say(why, true); draw(); return; }
      gears.push({ x, y, s }); tray.splice(sel, 1); bump();
      sel = tray.length ? Math.min(sel, tray.length - 1) : null;
      const A = analyse(gears);
      say(A.jam ? "<b>The train would lock:</b> two meshed gears are forced the same way." : A.latch ? `The knob reaches the latch. It would turn <b>${A.latch === 1 ? "clockwise" : "counter-clockwise"}</b>.` : "Placed. The train does not reach the latch yet.", A.jam);
      draw();
    }
    function turn() {
      if (over || busy || turning || stage.key !== "gear") return;
      const A = analyse(gears);
      turning = true;
      spin = { until: performance.now() + (rm ? 300 : 1600), jam: A.jam };
      let text, bad = true;
      if (A.jam) text = "<b>The train locks.</b> Somewhere two meshed gears are forced the same way; look for a closed loop.";
      else if (!A.latch) text = "The knob spins freely. The train does not reach the latch.";
      else if (A.latch === -1) text = "<b>The latch turns counter-clockwise</b> and drives the bolt into its stop. Count the meshes: an even number turns it your way.";
      else { text = "<b>The latch turns clockwise.</b> The rack draws the bolt back."; bad = false; }
      say(text, bad);
      bump();
      timers.push(setTimeout(() => {
        turning = false; spin = null; rot = 0;
        if (A.latch === 1 && !A.jam) solve();
        draw();
      }, rm ? 300 : 1600));
    }
    function reset() {
      if (over || busy || turning) return;
      levers = LEVERS0.slice(); lifted = new Set(); hasp = false; gears = []; tray = TRAY.slice(); sel = null; moves = 0;
      say("Reset. The clasp is as it was."); draw();
    }
    function useHint() {
      if (!sigilLit()) { say(`The sigil is not yet lit. Keep working; it warms in ${Math.ceil(((hintLevel === 0 ? 90000 : 60000) - (performance.now() - lastHintAt)) / 1000)} s.`); return; }
      hintLevel++; lastHintAt = performance.now();
      say("The sigil marks a move.");
      draw();
    }
    function solve() {
      over = true; busy = true;
      const secs = Math.round((performance.now() - stageStart) / 1000);
      timers.push(setTimeout(() => {
        const f = document.createElement("div");
        f.className = P + "frag";
        f.innerHTML = `<div role="dialog" aria-label="Found"><small>${stage.name} · open in ${moves} move${moves === 1 ? "" : "s"} (par ${stage.par}), ${secs} s</small><p><i></i></p><p></p><button type="button" class="${P}btn">${si + 1 < STAGES.length ? "Next clasp" : "Close the books"}</button></div>`;
        f.querySelector("i").textContent = stage.found;
        f.querySelectorAll("p")[1].textContent = FRAG[stage.frag];
        el.appendChild(f);
        const b = f.querySelector("button");
        b.focus();
        b.addEventListener("click", () => {
          f.remove();
          if (si + 1 < STAGES.length) setStage(si + 1);
          else {
            const par = STAGES.reduce((a, s) => a + s.par, 0);
            api.end({ outcome: "win", text: `${totalMoves <= par + 4 ? LINES.endPar : LINES.endOver} (${totalMoves} moves; par ${par}.)` });
          }
        });
      }, rm ? 200 : 1100));
    }

    svg.addEventListener("click", (e) => {
      if (intro.isConnected) return;
      const t = e.target.closest("[data-peg],[data-gear],[data-tray],[data-hint],[data-lever],[data-strap],[data-hasp]");
      if (!t) return;
      if (t.dataset.hint) { useHint(); return; }
      if (t.dataset.lever != null) { pressLever(+t.dataset.lever); return; }
      if (t.dataset.strap) { liftStrap(t.dataset.strap); return; }
      if (t.dataset.hasp) { openHasp(); return; }
      if (t.dataset.tray != null) { if (!over) { sel = +t.dataset.tray; say(`A ${["", "small", "medium", "large"][tray[sel]]} gear in hand. Now a peg.`); draw(); } return; }
      const g = t.dataset.gear != null ? gears[+t.dataset.gear] : null;
      const [x, y] = g ? [g.x, g.y] : t.dataset.peg.split(",").map(Number);
      placeAt(x, y);
    });
    svg.addEventListener("pointermove", (e) => {
      if (stage.key !== "gear" || over) return;
      const t = e.target.closest("[data-peg]");
      if (t) { const [x, y] = t.dataset.peg.split(",").map(Number); if (x !== cursor.x || y !== cursor.y) { cursor = { x, y }; draw(); } }
    });
    turnBtn.addEventListener("click", turn);
    el.querySelector("." + P + "reset").addEventListener("click", reset);
    const onKey = (e) => {
      if (intro.isConnected || over || busy) return;
      if (e.target && e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      const k = e.key;
      const kl = k.toLowerCase();
      if (kl === "r") { reset(); e.preventDefault(); return; }
      if (kl === "?" || kl === "h" && stage.key !== "strap") { useHint(); e.preventDefault(); return; }
      if (stage.key === "lever") {
        if (k >= "1" && k <= "5") pressLever(+k - 1);
        else if (k === "ArrowLeft") { levCur = Math.max(0, levCur - 1); draw(); }
        else if (k === "ArrowRight") { levCur = Math.min(4, levCur + 1); draw(); }
        else if (k === "Enter" || k === " ") pressLever(levCur);
        else return;
      } else if (stage.key === "strap") {
        const idx = "abcdef".indexOf(kl);
        if (idx >= 0 && kl.length === 1) liftStrap(STRAPS[idx].id);
        else if (kl === "h") openHasp();
        else if (k === "ArrowLeft" || k === "ArrowUp") { strapCur = (strapCur + 5) % 6; draw(); }
        else if (k === "ArrowRight" || k === "ArrowDown") { strapCur = (strapCur + 1) % 6; draw(); }
        else if (k === "Enter" || k === " ") { lifted.size === STRAPS.length ? openHasp() : liftStrap(STRAPS[strapCur].id); }
        else return;
      } else {
        if (k === "ArrowLeft") cursor.x = Math.max(0, cursor.x - 1);
        else if (k === "ArrowRight") cursor.x = Math.min(COLS - 1, cursor.x + 1);
        else if (k === "ArrowUp") cursor.y = Math.max(0, cursor.y - 1);
        else if (k === "ArrowDown") cursor.y = Math.min(ROWS - 1, cursor.y + 1);
        else if (k === "1" || k === "2" || k === "3") { const i = tray.indexOf(+k); if (i >= 0) { sel = i; say(`A ${["", "small", "medium", "large"][+k]} gear in hand.`); } else say("None of that size left in the tray.", true); }
        else if (k === "Enter" || k === " ") { placeAt(cursor.x, cursor.y); e.preventDefault(); return; }
        else if (kl === "t") { turn(); return; }
        else return;
        draw();
      }
      e.preventDefault();
    };
    addEventListener("keydown", onKey);

    let lastSigil = false;
    function loop(now) {
      const dt = (now - t0) / 1000; t0 = now;
      const sig = sigilLit();
      const anim = spin || (flash && now < flash + 50) || (shake && now < shake.until + 50) || (blockedBy && now < blockedBy.until + 50);
      if (spin) rot += dt * 2.4;
      if (anim || sig !== lastSigil) draw();
      lastSigil = sig;
      raf = requestAnimationFrame(loop);
    }

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}plate" role="dialog" aria-label="How to play">
      <h2>The Clasps</h2>
      <p class="${P}goal">${LINES.open}<br><b>Goal:</b> open all three, near par.</p>
      <dl>
        <dt>tap</dt><dd>Work the clasp: press a lever, lift a strap, place a gear.</dd>
        <dt>R</dt><dd>The reset lever puts a clasp back. It is free.</dd>
        <dt>✦</dt><dd>The hint sigil warms after 90 s and marks one move.</dd>
      </dl>
      <button type="button" class="${P}btn ${P}go">Open the first book</button></div>`;
    el.appendChild(intro);
    intro.querySelector("button").addEventListener("click", () => { intro.remove(); setStage(0); });
    intro.querySelector("button").focus();

    setStage(0);
    raf = requestAnimationFrame(loop);
    return { unmount() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); removeEventListener("keydown", onKey); } };
  },
};

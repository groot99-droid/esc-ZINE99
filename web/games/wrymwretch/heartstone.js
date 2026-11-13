// WrymWretch · Heartstone (1D, Low-poly crystal facets). DESIGN.md section 11, Heartstone.
// One page: s_heart_rekindle. First choose which memory the Heartstone keeps (founding, vision or
// song; each has its own chord). Three slots, eight shards, six strikes. Each shard has a hidden
// pitch on a 12-step wheel. Strike: each slot's beat line shows fast wobble (far), slow wobble (one
// step off) or still (right); every placed shard takes a crack, and three cracks shatter it. Win:
// every slot still on one strike. Gaia's hint (once): one slot glows when its shard is chosen.
// Shards and chords: data/heartstone.json.
// Refinements: Ring a shard (added; three a page) taps one shard against the ring without a strike or a
// crack, and says whether its pitch is in the chord at all. Each shard keeps a note of what it sounded
// in each slot. After the second strike a tremor runs through the hall and cracks one shard in the
// tray. After two losses in a row: seven strikes and Gaia twice (api.store).
// Quoted, verbatim as DESIGN.md sections 3 and 11 quote them (creative-writing/vault/02_Novels/02_WrymWretch.md):
//   "Its power was tied to memory" (WW 61)   "Not yet," she whispered. "You cannot fade. Not now." (WW 59)

const OCHRE = "#c88a2e", MOLTEN = "#e8571c", GOLD = "#d4a72c", BONE = "#f3eee2", NIGHT = "#140f12", LEAD = "#0d0a0b";
const TRAY = [["r1", 0, 0], ["r2", 4, 1], ["r3", 7, 0], ["r4", 3, 0], ["r5", 8, 1], ["r6", 2, 0], ["r7", 5, 0], ["r8", 9, 1]];
const CHOICES = [["founding", "The founding", [0, 4, 7]], ["vision", "The vision", [0, 3, 8]], ["song", "The song", [2, 5, 9]]];
const SHATTER = 3, RINGS = 3;
const NUM = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const CSS = `
.wrymwretch-heartstone-root{position:absolute;inset:0;background:${NIGHT};color:${BONE};font-family:'Cormorant Garamond',Georgia,serif;display:flex;flex-direction:column;overflow:hidden}
.wrymwretch-heartstone-root svg{flex:1;min-height:0;width:100%;display:block;touch-action:manipulation}
.wrymwretch-heartstone-hit{cursor:pointer;outline:none}
.wrymwretch-heartstone-hit:focus-visible .wrymwretch-heartstone-focus{stroke:#fff;stroke-width:4;stroke-dasharray:6 4}
.wrymwretch-heartstone-hit:hover .wrymwretch-heartstone-focus{stroke:#fff2b0;stroke-width:3}
.wrymwretch-heartstone-bar{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;padding:8px 14px;background:#1d1518;border-top:1px solid #4a3528;font-size:16px}
.wrymwretch-heartstone-btn:hover:not(:disabled){filter:brightness(1.18)}
.wrymwretch-heartstone-btn.on{background:#fff2b0;color:${NIGHT}}
.wrymwretch-heartstone-beat{position:absolute;left:50%;top:10px;transform:translateX(-50%);width:min(540px,calc(100% - 24px));box-sizing:border-box;background:linear-gradient(135deg,#3a2a22,#241a1c 60%,#3a2420);border:2px solid ${GOLD};color:${BONE};padding:10px 18px;font-size:17px;line-height:1.35;clip-path:polygon(3% 0,97% 0,100% 50%,97% 100%,3% 100%,0 50%);opacity:0;transition:opacity .5s;pointer-events:none;z-index:2;text-align:center}
.wrymwretch-heartstone-beat.on{opacity:1}
.wrymwretch-heartstone-beat q{font-style:italic;color:#f6e3b4}
.wrymwretch-heartstone-beat cite{display:block;font:600 13px 'Cinzel',Georgia,serif;font-style:normal;letter-spacing:.1em;color:${GOLD};margin-top:3px}
.wrymwretch-heartstone-root.shake svg{animation:wrymwretch-heartstone-shake .5s}
@keyframes wrymwretch-heartstone-shake{20%{transform:translate(-4px,2px)}40%{transform:translate(4px,-2px)}60%{transform:translate(-3px,1px)}80%{transform:translate(2px,0)}}
.wrymwretch-heartstone-bar i{flex:1 1 240px}
.wrymwretch-heartstone-btn{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.1em;color:${NIGHT};background:${GOLD};border:0;padding:9px 14px;cursor:pointer;min-height:40px;clip-path:polygon(8% 0,92% 0,100% 50%,92% 100%,8% 100%,0 50%)}
.wrymwretch-heartstone-btn.ghost{background:#4a3528;color:${BONE}}
.wrymwretch-heartstone-btn:disabled{opacity:.35;cursor:default}
.wrymwretch-heartstone-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,15,18,.78);padding:16px;z-index:3}
.wrymwretch-heartstone-card{width:min(450px,100%);box-sizing:border-box;background:linear-gradient(155deg,#4a3226 0 18%,#2c2022 18% 46%,#38262a 46% 70%,#241a1c 70%);border:2px solid ${GOLD};padding:22px 26px;font-size:16px;line-height:1.4;clip-path:polygon(10% 0,90% 0,100% 12%,100% 88%,90% 100%,10% 100%,0 88%,0 12%)}
.wrymwretch-heartstone-card h2{font:700 25px 'Cinzel',Georgia,serif;color:${GOLD};margin:0;text-align:center}
.wrymwretch-heartstone-card .goal{font-style:italic;font-size:17px;text-align:center;margin:4px 0 12px}
.wrymwretch-heartstone-card dl{display:grid;grid-template-columns:auto 1fr;gap:7px 12px;margin:0 0 12px;padding:10px 0;border-top:1px solid ${GOLD};border-bottom:1px solid ${GOLD}}
.wrymwretch-heartstone-card dt{font:700 13px 'Cinzel',Georgia,serif;color:${GOLD};white-space:nowrap;padding-top:2px}
.wrymwretch-heartstone-card dd{margin:0}
.wrymwretch-heartstone-card .more{font-size:15px;margin:0 0 10px;color:#e9d8b0}
.wrymwretch-heartstone-card p{margin:0 0 10px}
.wrymwretch-heartstone-choices{justify-content:center}
.wrymwretch-heartstone-card q{font-style:italic;color:#e9d8b0}
.wrymwretch-heartstone-choices{display:flex;flex-wrap:wrap;gap:8px}
`;

export default {
  mount(root, api) {
    const R = api.rng();
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    const STRIKES = gentle ? 7 : 6;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-heartstone-root";
    wrap.innerHTML = `<style>${CSS}</style><svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" role="application" aria-label="The Stonekeeper's workbench"></svg>
      <div class="wrymwretch-heartstone-bar"><i aria-live="polite">Choose a shard from the tray, then a slot in the ring.</i>
        <button type="button" class="wrymwretch-heartstone-btn ghost" data-ring hidden>Ring a shard</button>
        <button type="button" class="wrymwretch-heartstone-btn ghost" data-gaia hidden>Gaia listens</button>
        <button type="button" class="wrymwretch-heartstone-btn" data-strike>Strike</button></div>
      <div class="wrymwretch-heartstone-beat" aria-live="polite"></div>
      <div class="wrymwretch-heartstone-intro"><div class="wrymwretch-heartstone-card">
        <h2>Heartstone</h2>
        <p class="goal">Tune one shard to each slot so the ring holds a memory.</p>
        <dl>
          <dt>Shard → slot</dt><dd>pick a shard in the tray, then a slot in the ring</dd>
          <dt>Strike</dt><dd>each slot's line: <b>still</b> is right, a slow wobble one step off, a fast one far</dd>
          <dt>Cracks</dt><dd>every strike cracks the shards it sounds; three cracks shatter one</dd>
        </dl>
        <p class="more">${gentle ? "Seven strikes this time, and Gaia will listen twice. " : ""}<q>Its power was tied to memory.</q> First, choose which memory the stone keeps:</p>
        <div class="wrymwretch-heartstone-choices">${CHOICES.map(([id, label]) => `<button type="button" class="wrymwretch-heartstone-btn" data-choice="${id}">${label}</button>`).join("")}</div></div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg"), note = wrap.querySelector(".wrymwretch-heartstone-bar i");
    const strikeBtn = wrap.querySelector("[data-strike]"), gaiaBtn = wrap.querySelector("[data-gaia]"), ringBtn = wrap.querySelector("[data-ring]");
    const beatEl = wrap.querySelector(".wrymwretch-heartstone-beat");
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${[n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f)))).join(",")})`; };

    // ---- low-poly ground ----------------------------------------------------------------------
    {
      const pts = [];
      for (let y = -300; y <= 1300; y += 95) for (let x = -500; x <= 1500; x += 110) pts.push([x + (R() - 0.5) * 70, y + (R() - 0.5) * 60]);
      const cols = Math.floor(2000 / 110) + 1;
      for (let i = 0; i + cols + 1 < pts.length; i++) {
        if ((i + 1) % cols === 0) continue;
        const a = pts[i], b = pts[i + 1], c = pts[i + cols], d = pts[i + cols + 1];
        const warm = Math.max(0, Math.min(1.2, (a[1] - 300) / 600));
        const base = (f) => `rgb(${Math.round(30 + warm * 90 * f + R() * 14)},${Math.round(22 + warm * 30 * f + R() * 10)},${Math.round(30 - warm * 10 + R() * 12)})`;
        mk("polygon", { points: `${a} ${b} ${c}`, fill: base(1) }, svg);
        mk("polygon", { points: `${b} ${d} ${c}`, fill: base(0.8) }, svg);
      }
    }
    const gTop = mk("g", {}, svg), gRing = mk("g", {}, svg), gSlots = mk("g", {}, svg), gTray = mk("g", {}, svg), gHud = mk("g", {}, svg), gBeat = mk("g", {}, svg);

    // ---- state ----------------------------------------------------------------------------------
    const shards = TRAY.map(([id, pitch, cracks], i) => ({ id, pitch, cracks, col: i, slot: -1, gone: false, notes: {}, rung: null }));
    for (let i = shards.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [shards[i], shards[j]] = [shards[j], shards[i]]; }
    // numbered by where they lie in the tray, so the numbering says nothing about the pitch
    shards.forEach((s, i) => { s.tray = i; s.n = i; });
    const st = { chord: null, memory: "", strikes: STRIKES, sel: null, beats: [null, null, null], hint: -1, gaia: gentle ? 2 : 1, rings: RINGS, ringing: false, over: false, started: false, phase: 0, said: new Set(), struck: 0 };
    const timersB = { t: null };
    function beat(html, ms = 7000) {
      beatEl.innerHTML = html; beatEl.classList.add("on");
      if (timersB.t) { clearTimeout(timersB.t); timers.delete(timersB.t); }
      timersB.t = setTimeout(() => { timers.delete(timersB.t); beatEl.classList.remove("on"); }, ms); timers.add(timersB.t);
    }
    // two layouts: a wide bench, and a tall one for phones
    const LAYOUTS = {
      wide: { vb: "0 0 1000 700", cx: 380, cy: 330, wave: "240,18 760,18 790,58 760,98 240,98 210,58", tx: 262, wx: 260, ww: 480,
        tray: "60,560 940,560 975,625 940,690 60,690 25,625", pos: (i) => [115 + i * 110, 615], ham: (i) => [770 + (i % 3) * 58, 190 + Math.floor(i / 3) * 62], hl: [770, 170], beat: null },
      tall: { vb: "0 0 600 1000", cx: 300, cy: 320, wave: "70,18 530,18 560,58 530,98 70,98 40,58", tx: 92, wx: 90, ww: 420,
        tray: "30,722 570,722 592,850 570,978 30,978 8,850", pos: (i) => [105 + (i % 4) * 130, 790 + Math.floor(i / 4) * 125], ham: (i) => [130 + i * 58, 640], hl: [130, 626], beat: (k) => [50 + k * 190, 548] },
    };
    let L = LAYOUTS.wide, CX = L.cx, CY = L.cy;
    const RING = 150;
    const slotPos = (k) => { const a = (-90 + st.chord[k] * 30) * Math.PI / 180; return [CX + Math.cos(a) * RING, CY + Math.sin(a) * RING]; };
    const beatPos = (k) => { if (L.beat) return L.beat(k); const [x, y] = slotPos(k); const dx = x - CX; return [x + (dx >= -5 ? 70 : -200), y - 20]; };

    function shardPoly(s, cx, cy, size) {
      const r = api.rng(s.id.charCodeAt(1) * 31 + 7);
      const n = 6 + Math.floor(r() * 2);
      const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2 + (r() - 0.5) * 0.4; const rr = size * (i % 2 ? 0.62 : 1) * (0.85 + r() * 0.3); return [cx + Math.cos(a) * rr * 0.7, cy + Math.sin(a) * rr]; });
      const col = s.col % 2 ? OCHRE : MOLTEN;
      const g = mk("g", {});
      pts.forEach((p, i) => { const q = pts[(i + 1) % n]; mk("polygon", { points: `${cx},${cy} ${p} ${q}`, fill: shade(col, 0.6 + ((i * 37) % 9) / 14), stroke: shade(col, 0.45), "stroke-width": 0.8 }, g); });
      mk("polygon", { class: "wrymwretch-heartstone-focus", points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: LEAD, "stroke-width": 1.6 }, g);
      for (let c = 0; c < s.cracks; c++) { const a = r() * Math.PI * 2; mk("path", { d: `M${cx},${cy} l${Math.cos(a) * size * 0.5},${Math.sin(a) * size * 0.5} l${(r() - 0.5) * size * 0.4},${(r() - 0.5) * size * 0.4}`, stroke: LEAD, "stroke-width": 2, fill: "none" }, g); }
      return g;
    }

    function drawStatic() {
      gTop.innerHTML = ""; gRing.innerHTML = "";
      // target chord, a still waveform in a faceted frame
      mk("polygon", { points: L.wave, fill: "rgba(13,10,11,.75)", stroke: GOLD, "stroke-width": 2 }, gTop);
      mk("text", { x: L.tx, y: 40, fill: GOLD, "font-size": 13, "font-family": "Cinzel, Georgia, serif", "letter-spacing": 3 }, gTop).textContent = `TARGET CHORD · ${st.memory.toUpperCase()}`;
      let d = "";
      for (let x = 0; x <= L.ww; x += 3) { const t = x / L.ww * 6 * Math.PI; const y = st.chord.reduce((acc, p) => acc + Math.sin(t * Math.pow(2, p / 12) * 2), 0) / st.chord.length; d += `${x ? "L" : "M"}${L.wx + x},${66 - y * 22}`; }
      mk("path", { d, fill: "none", stroke: BONE, "stroke-width": 2 }, gTop);
      // the wheel and ring setting
      for (let i = 0; i < 12; i++) {
        const a0 = (-105 + i * 30) * Math.PI / 180, a1 = (-75 + i * 30) * Math.PI / 180;
        mk("polygon", { points: `${CX},${CY} ${CX + Math.cos(a0) * 110},${CY + Math.sin(a0) * 110} ${CX + Math.cos(a1) * 110},${CY + Math.sin(a1) * 110}`, fill: i % 2 ? "#3a2a22" : "#5a3e2a", stroke: LEAD, "stroke-width": 1 }, gRing);
      }
      mk("circle", { cx: CX, cy: CY, r: 18, fill: LEAD }, gRing);
      mk("circle", { cx: CX, cy: CY, r: RING, fill: "none", stroke: shade(GOLD, 0.7), "stroke-width": 34 }, gRing);
      for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180; mk("line", { x1: CX + Math.cos(a) * (RING - 17), y1: CY + Math.sin(a) * (RING - 17), x2: CX + Math.cos(a) * (RING + 17), y2: CY + Math.sin(a) * (RING + 17), stroke: i % 2 ? shade(GOLD, 1.1) : shade(GOLD, 0.5), "stroke-width": 1.4 }, gRing); }
      mk("circle", { cx: CX, cy: CY, r: RING + 17, fill: "none", stroke: LEAD, "stroke-width": 1.5 }, gRing);
    }

    function drawBeats() {
      gBeat.innerHTML = "";
      if (!st.chord) return;
      st.chord.forEach((_, k) => {
        const [bx, by] = beatPos(k);
        mk("polygon", { points: `${bx},${by} ${bx + 120},${by} ${bx + 130},${by + 20} ${bx + 120},${by + 40} ${bx},${by + 40} ${bx - 10},${by + 20}`, fill: "rgba(13,10,11,.8)", stroke: k === 0 ? shade(GOLD, 0.8) : GOLD, "stroke-width": 1.5 }, gBeat);
        const b = st.beats[k];
        const amp = b == null ? 0 : b === 0 ? 0 : b === 1 ? 9 : 13, freq = b === 1 ? 1.2 : 5;
        let d = "";
        for (let i = 0; i <= 110; i += 2) { const w = amp * Math.sin(i / 110 * Math.PI * 2 * freq + st.phase * (b === 1 ? 2 : 9)) * Math.sin(i / 110 * Math.PI); d += `${i ? "L" : "M"}${bx + 5 + i},${by + 20 + w}`; }
        mk("path", { d, fill: "none", stroke: b == null ? "rgba(243,238,226,.25)" : b === 0 ? "#fff2b0" : BONE, "stroke-width": b === 0 ? 3 : 2 }, gBeat);
        if (b === 0) mk("polygon", { points: `${bx - 10},${by + 20} ${bx},${by} ${bx + 120},${by} ${bx + 130},${by + 20} ${bx + 120},${by + 40} ${bx},${by + 40}`, fill: "rgba(255,242,176,.12)", stroke: "#fff2b0", "stroke-width": 2.5 }, gBeat);
        mk("text", { x: bx + 60, y: L.beat ? by + 60 : by - 8, "text-anchor": "middle", fill: b === 0 ? "#fff2b0" : "rgba(243,238,226,.85)", "font-size": 16, "font-style": "italic", "font-family": "Georgia, serif" }, gBeat).textContent = b == null ? `slot ${k + 1}` : b === 0 ? `slot ${k + 1}: still` : b === 1 ? `slot ${k + 1}: slow, one off` : `slot ${k + 1}: fast, far`;
      });
    }
    function render() {
      gSlots.innerHTML = ""; gTray.innerHTML = ""; gHud.innerHTML = ""; drawBeats();
      st.chord.forEach((_, k) => {
        const [x, y] = slotPos(k);
        const g = mk("g", { class: "wrymwretch-heartstone-hit", tabindex: 0, role: "button", "aria-label": `slot ${k + 1}`, "data-slot": k }, gSlots);
        const sel = st.sel && shards.find((s) => s.id === st.sel);
        const glow = st.hint === k && sel && sel.pitch === st.chord[k];
        mk("circle", { cx: x, cy: y, r: 40, fill: glow ? "rgba(246,210,122,.55)" : "rgba(13,10,11,.85)", stroke: glow ? "#fff2b0" : GOLD, "stroke-width": glow ? 5 : 3 }, g);
        mk("circle", { class: "wrymwretch-heartstone-focus", cx: x, cy: y, r: 40, fill: "none", stroke: "none" }, g);
        const s = shards.find((z) => z.slot === k && !z.gone);
        if (s) g.appendChild(shardPoly(s, x, y, 30));
        else mk("text", { x, y: y + 6, "text-anchor": "middle", fill: "rgba(243,238,226,.75)", "font-size": 17, "font-family": "Cinzel, Georgia, serif" }, g).textContent = "slot " + (k + 1);
      });
      // the tray
      mk("polygon", { points: L.tray, fill: "rgba(13,10,11,.7)", stroke: GOLD, "stroke-width": 2 }, gTray);
      shards.forEach((s) => {
        const [x, y] = L.pos(s.tray);
        const g = mk("g", { class: "wrymwretch-heartstone-hit", tabindex: 0, role: "button", "aria-label": `shard ${NUM[s.n]}, ${s.cracks} crack${s.cracks === 1 ? "" : "s"}${s.gone ? ", shattered" : s.slot >= 0 ? ", set in slot " + (s.slot + 1) : ""}`, "data-shard": s.id }, gTray);
        if (s.gone) { mk("ellipse", { cx: x, cy: y + 26, rx: 26, ry: 6, fill: LEAD }, g); for (let k = 0; k < 4; k++) mk("polygon", { points: `${x - 20 + k * 12},${y + 22} ${x - 14 + k * 12},${y + 10} ${x - 9 + k * 12},${y + 24}`, fill: shade(OCHRE, 0.5) }, g); return; }
        if (s.slot >= 0) { mk("circle", { cx: x, cy: y, r: 24, fill: "none", stroke: "rgba(243,238,226,.25)", "stroke-dasharray": "4 4" }, g); }
        else g.appendChild(shardPoly(s, x, y - 4, 38));
        if (st.sel === s.id) mk("circle", { cx: x, cy: y - 4, r: 44, fill: "none", stroke: "#fff2b0", "stroke-width": 3 }, g);
        mk("text", { x, y: y + 50, "text-anchor": "middle", fill: "rgba(243,238,226,.9)", "font-size": 17, "font-family": "Cinzel, Georgia, serif" }, g).textContent = NUM[s.n] + (s.rung === true ? " ♪" : s.rung === false ? " ·" : "");
        const nt = Object.entries(s.notes).map(([k, v]) => `${+k + 1}${v === 0 ? "✓" : v === 1 ? "~" : "×"}`).join(" ");
        if (nt) mk("text", { x, y: y + 68, "text-anchor": "middle", fill: "#e9c77a", "font-size": 15, "font-family": "Georgia, serif" }, g).textContent = nt;
      });
      // the strike budget: a row of small hammers
      mk("text", { x: L.hl[0], y: L.hl[1], fill: GOLD, "font-size": 16, "font-family": "Cinzel, Georgia, serif", "letter-spacing": 2 }, gHud).textContent = `STRIKES ${st.strikes}`;
      for (let i = 0; i < STRIKES; i++) {
        const [x, y] = L.ham(i), on = i < st.strikes;
        mk("rect", { x, y, width: 44, height: 14, fill: on ? "#d9dde2" : "#3a3236", stroke: LEAD }, gHud);
        mk("rect", { x: x + 18, y: y + 14, width: 8, height: 34, fill: on ? "#7a5634" : "#2a2224" }, gHud);
      }
      strikeBtn.disabled = st.over || !shards.some((s) => s.slot >= 0 && !s.gone);
      gaiaBtn.disabled = st.gaia < 1 || st.over; gaiaBtn.textContent = `Gaia listens (${st.gaia})`;
      ringBtn.disabled = st.rings < 1 || st.over; ringBtn.textContent = st.ringing ? "Pick a shard to ring" : `Ring a shard (${st.rings})`; ringBtn.classList.toggle("on", st.ringing);
    }

    // ---- audio: each sounded slot plays its shard against the target, so the beats can be heard
    let ac = null;
    function sound(pairs) {
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const t0 = ac.currentTime;
        pairs.forEach(([target, pitch], k) => [target, pitch].forEach((p) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = "sine"; o.frequency.value = 330 * Math.pow(2, p / 12);
          g.gain.setValueAtTime(0, t0 + k * 0.18); g.gain.linearRampToValueAtTime(0.05, t0 + k * 0.18 + 0.02); g.gain.exponentialRampToValueAtTime(0.0005, t0 + k * 0.18 + 1.6);
          o.connect(g).connect(ac.destination); o.start(t0 + k * 0.18); o.stop(t0 + k * 0.18 + 1.7);
        }));
      } catch { /* no audio */ }
    }

    function strike() {
      if (st.over || !st.started) return;
      const placed = shards.filter((s) => s.slot >= 0 && !s.gone);
      if (!placed.length) return;
      st.strikes--; st.struck++;
      if (!api.reducedMotion) { wrap.classList.remove("shake"); void wrap.offsetWidth; wrap.classList.add("shake"); }
      st.beats = st.chord.map((t, k) => { const s = placed.find((z) => z.slot === k); if (!s) return null; const d = Math.abs(s.pitch - t) % 12; return Math.min(d, 12 - d) >= 2 ? 2 : Math.min(d, 12 - d); });
      st.beats.forEach((b, k) => { const s = placed.find((z) => z.slot === k); if (s && b != null) s.notes[k] = b; });
      if (st.struck === 1) { ringBtn.hidden = false; gaiaBtn.hidden = false; }
      if (st.beats.some((b) => b === 0) && !st.said.has("still")) { st.said.add("still"); beat(`One line lies still, and the stone answers it with a glow. Rhyla's hand is on the crystal. <i>“Not yet,” she whispered. “You cannot fade. Not now.”</i><cite>WW 59</cite>`, 8000); }
      sound(st.chord.map((t, k) => { const s = placed.find((z) => z.slot === k); return s ? [t, s.pitch] : null; }).filter(Boolean));
      const won = st.beats.every((b) => b === 0);
      if (won) {
        st.over = true; render();
        note.textContent = "Every line lies still. The crystal is set.";
        api.store.set("losses", 0);
        const kept = { founding: "the tribe's founding", vision: "Rhyla's vision", song: "the Stonekeepers' song" }[st.memId];
        return later(() => api.end({ outcome: "win", text: `Every line lies still. The Heartstone cannot be saved, but its tuned shard keeps ${kept}, with ${st.strikes} strike${st.strikes === 1 ? "" : "s"} to spare. Mosswhisper's memory is anchored through the next two drains, and Rhyla sets out for the Deep Core.` }), 1200);
      }
      const broke = [];
      placed.forEach((s) => { s.cracks++; if (s.cracks >= SHATTER) { s.gone = true; s.slot = -1; broke.push(NUM[s.n]); } });
      if (st.struck === 2) {
        const pool = shards.filter((z) => !z.gone && z.slot < 0 && z.cracks === 0);   // a tremor never shatters a shard
        if (pool.length) { const z = pool[Math.floor(R() * pool.length)]; z.cracks++;
          beat(`A tremor runs through the gem-lit hall, and dust falls from the vault. Shard ${NUM[z.n]} cracks in the tray. <cite>The Deep Core is waking · ${st.strikes} strikes left</cite>`, 7000); }
      }
      const left = shards.filter((s) => !s.gone).length;
      note.textContent = `${st.beats.map((b, k) => b == null ? `slot ${k + 1} empty` : `slot ${k + 1} ${b === 0 ? "still" : b === 1 ? "slow" : "fast"}`).join(" · ")}.${broke.length ? ` Shard ${broke.join(", ")} shatters.` : ""}`;
      if (st.strikes <= 0 || left < st.chord.length) {
        st.over = true; render();
        api.store.set("losses", losses + 1);
        const lostMem = { founding: "the founding of the tribe", vision: "the vision", song: "the Stonekeepers' song" }[st.memId];
        return later(() => api.end({ outcome: "lose", text: `${left < st.chord.length ? "Too few shards are left whole to fill the ring." : "The last strike fades with the lines still shaking."} The Heartstone goes dark, and ${lostMem} goes with it. Rhyla keeps her hand on the cold stone a long moment before she rises.${losses + 1 >= 2 ? " Next time: seven strikes, and Gaia twice." : ""}` }), 1200);
      }
      render();
    }

    function clickShard(id) {
      if (st.over || !st.started) return;
      const s = shards.find((z) => z.id === id); if (!s || s.gone) return;
      if (st.ringing) {
        st.ringing = false; st.rings--; s.rung = st.chord.includes(s.pitch);
        sound([[s.pitch, s.pitch]]);
        note.textContent = s.rung ? `Shard ${NUM[s.n]} rings and the ring hums back: its pitch is in the chord.` : `Shard ${NUM[s.n]} rings dull against the ring: its pitch is not in the chord.`;
        return render();
      }
      if (s.slot >= 0) { s.slot = -1; st.sel = null; note.textContent = `Shard ${NUM[s.n]} is back in the tray.`; }
      else st.sel = st.sel === id ? null : id;
      render();
    }
    function clickSlot(k) {
      if (st.over || !st.started) return;
      const cur = shards.find((z) => z.slot === k && !z.gone);
      if (!st.sel) { if (cur) { cur.slot = -1; note.textContent = `Shard ${NUM[cur.n]} is back in the tray.`; render(); } return; }
      if (cur) cur.slot = -1;
      const s = shards.find((z) => z.id === st.sel); s.slot = k; st.sel = null;
      note.textContent = `Shard ${NUM[s.n]} set in slot ${k + 1}.`;
      render();
    }
    svg.addEventListener("click", (e) => {
      const h = e.target.closest(".wrymwretch-heartstone-hit"); if (!h) return;
      h.dataset.shard ? clickShard(h.dataset.shard) : clickSlot(+h.dataset.slot);
    });
    svg.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const h = e.target.closest(".wrymwretch-heartstone-hit"); if (!h) return;
      e.preventDefault(); const id = h.dataset.shard; id ? clickShard(id) : clickSlot(+h.dataset.slot);
      const again = svg.querySelector(id ? `[data-shard="${id}"]` : `[data-slot="${h.dataset.slot}"]`); again && again.focus();
    });
    strikeBtn.addEventListener("click", strike);
    ringBtn.addEventListener("click", () => { if (st.rings < 1 || st.over || !st.started) return; st.ringing = !st.ringing; note.textContent = st.ringing ? "Choose a shard in the tray to ring against the setting. No strike, no crack." : ""; render(); });
    gaiaBtn.addEventListener("click", () => {
      if (st.gaia < 1 || st.over || !st.started) return;
      st.gaia--; st.hint = st.beats.findIndex((b) => b !== 0); if (st.hint < 0) st.hint = 0;
      note.textContent = `Gaia listens: slot ${st.hint + 1} will glow when its true shard is chosen.`;
      render();
    });

    let raf = 0;
    const tick = () => { if (!api.reducedMotion && st.started && st.beats.some((b) => b)) { st.phase += 0.05; drawBeats(); } raf = requestAnimationFrame(tick); };
    const intro = wrap.querySelector(".wrymwretch-heartstone-intro");
    intro.querySelectorAll("[data-choice]").forEach((b) => b.addEventListener("click", () => {
      const c = CHOICES.find((x) => x[0] === b.dataset.choice);
      st.memory = c[1]; st.memId = c[0]; st.chord = c[2]; st.started = true; intro.remove();
      drawStatic(); render();
      note.textContent = `The stone will keep ${c[1].toLowerCase()}. Choose a shard from the tray, then a slot in the ring.`;
      beat(`The Heartstone hall, under the Stonekeepers' city. The great crystal is going dim and cannot be saved, but one shard tuned to it can keep ${c[1].toLowerCase()}. Elder Rhyla kneels at the bench. <cite>Set three shards, then Strike</cite>`, 8000);
      const first = svg.querySelector("[data-shard]"); first && first.focus();
    }));
    intro.querySelector("[data-choice]").focus();
    st.chord = CHOICES[0][2];
    const relayout = () => {
      const tall = wrap.clientWidth / Math.max(1, svg.clientHeight || wrap.clientHeight) < 0.85;
      const next = tall ? LAYOUTS.tall : LAYOUTS.wide;
      if (next === L && svg.getAttribute("viewBox") === L.vb) return;
      L = next; CX = L.cx; CY = L.cy; svg.setAttribute("viewBox", L.vb); drawStatic(); render();
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(relayout) : null;
    ro && ro.observe(wrap);
    drawStatic(); render(); relayout();
    raf = requestAnimationFrame(tick);

    return { unmount() { st.over = true; cancelAnimationFrame(raf); ro && ro.disconnect(); timers.forEach(clearTimeout); try { ac && ac.close(); } catch { /* closed */ } wrap.remove(); } };
  },
};

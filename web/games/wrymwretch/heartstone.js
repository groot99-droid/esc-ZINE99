// WrymWretch · Heartstone (1D, Low-poly crystal facets). DESIGN.md section 11, Heartstone.
// One page: s_heart_rekindle. First choose which memory the Heartstone keeps (founding, vision or
// song; each has its own chord). Three slots, eight shards, six strikes. Each shard has a hidden
// pitch on a 12-step wheel. Strike: each slot's beat line shows fast wobble (far), slow wobble (one
// step off) or still (right); every placed shard takes a crack, and three cracks shatter it. Win:
// every slot still on one strike. Gaia's hint (once): one slot glows when its shard is chosen.
// Shards and chords: data/heartstone.json.
// Quoted on the page, verbatim as DESIGN.md section 11 quotes it:
//   "Its power was tied to memory" creative-writing/vault/02_Novels/02_WrymWretch.md, line 61 (WW 61)

const OCHRE = "#c88a2e", MOLTEN = "#e8571c", GOLD = "#d4a72c", BONE = "#f3eee2", NIGHT = "#140f12", LEAD = "#0d0a0b";
const TRAY = [["r1", 0, 0], ["r2", 4, 1], ["r3", 7, 0], ["r4", 3, 0], ["r5", 8, 1], ["r6", 2, 0], ["r7", 5, 0], ["r8", 9, 1]];
const CHOICES = [["founding", "The founding", [0, 4, 7]], ["vision", "The vision", [0, 3, 8]], ["song", "The song", [2, 5, 9]]];
const STRIKES = 6, SHATTER = 3;
const NUM = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const CSS = `
.wrymwretch-heartstone-root{position:absolute;inset:0;background:${NIGHT};color:${BONE};font-family:'Cormorant Garamond',Georgia,serif;display:flex;flex-direction:column;overflow:hidden}
.wrymwretch-heartstone-root svg{flex:1;min-height:0;width:100%;display:block;touch-action:manipulation}
.wrymwretch-heartstone-hit{cursor:pointer;outline:none}
.wrymwretch-heartstone-hit:focus-visible .wrymwretch-heartstone-focus{stroke:#fff;stroke-width:4;stroke-dasharray:6 4}
.wrymwretch-heartstone-bar{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;padding:8px 14px;background:#1d1518;border-top:1px solid #4a3528;font-size:16px}
.wrymwretch-heartstone-bar i{flex:1 1 240px}
.wrymwretch-heartstone-btn{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.1em;color:${NIGHT};background:${GOLD};border:0;padding:9px 14px;cursor:pointer;min-height:40px;clip-path:polygon(8% 0,92% 0,100% 50%,92% 100%,8% 100%,0 50%)}
.wrymwretch-heartstone-btn.ghost{background:#4a3528;color:${BONE}}
.wrymwretch-heartstone-btn:disabled{opacity:.35;cursor:default}
.wrymwretch-heartstone-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,15,18,.78);padding:16px;z-index:3}
.wrymwretch-heartstone-card{max-width:470px;background:#241a1c;border:2px solid ${GOLD};padding:20px 22px;font-size:17px;line-height:1.4;clip-path:polygon(4% 0,96% 0,100% 6%,100% 94%,96% 100%,4% 100%,0 94%,0 6%)}
.wrymwretch-heartstone-card h2{font:700 21px 'Cinzel',Georgia,serif;color:${GOLD};margin:0 0 8px}
.wrymwretch-heartstone-card p{margin:0 0 10px}
.wrymwretch-heartstone-card q{font-style:italic;color:#e9d8b0}
.wrymwretch-heartstone-choices{display:flex;flex-wrap:wrap;gap:8px}
`;

export default {
  mount(root, api) {
    const R = api.rng();
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-heartstone-root";
    wrap.innerHTML = `<style>${CSS}</style><svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" role="application" aria-label="The Stonekeeper's workbench"></svg>
      <div class="wrymwretch-heartstone-bar"><i aria-live="polite">Choose a shard from the tray, then a slot in the ring.</i>
        <button type="button" class="wrymwretch-heartstone-btn ghost" data-gaia>Gaia listens</button>
        <button type="button" class="wrymwretch-heartstone-btn" data-strike>Strike</button></div>
      <div class="wrymwretch-heartstone-intro"><div class="wrymwretch-heartstone-card">
        <h2>Heartstone · the rekindling</h2>
        <p><q>Its power was tied to memory.</q> Set three shards in the ring and strike. A beat line that lies still is right; a slow wobble is one step off; a fast one is far.</p>
        <p>Every strike cracks the shards it sounds, and three cracks shatter one. Six strikes. First, choose which memory the stone keeps:</p>
        <div class="wrymwretch-heartstone-choices">${CHOICES.map(([id, label]) => `<button type="button" class="wrymwretch-heartstone-btn" data-choice="${id}">${label}</button>`).join("")}</div></div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg"), note = wrap.querySelector(".wrymwretch-heartstone-bar i");
    const strikeBtn = wrap.querySelector("[data-strike]"), gaiaBtn = wrap.querySelector("[data-gaia]");
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
    const shards = TRAY.map(([id, pitch, cracks], i) => ({ id, pitch, cracks, n: i, slot: -1, gone: false })).sort(() => R() - 0.5);
    shards.forEach((s, i) => (s.tray = i));
    const st = { chord: null, memory: "", strikes: STRIKES, sel: null, beats: [null, null, null], hint: -1, hintUsed: false, over: false, started: false, phase: 0 };
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
      const col = s.n % 2 ? OCHRE : MOLTEN;
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
        if (b != null) mk("text", { x: bx + 60, y: by + 56, "text-anchor": "middle", fill: "rgba(243,238,226,.7)", "font-size": 12, "font-style": "italic" }, gBeat).textContent = b === 0 ? "still" : b === 1 ? "slow: one step off" : "fast: far";
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
        else mk("text", { x, y: y + 5, "text-anchor": "middle", fill: "rgba(243,238,226,.4)", "font-size": 13, "font-family": "Cinzel, Georgia, serif" }, g).textContent = "slot " + (k + 1);
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
        mk("text", { x, y: y + 52, "text-anchor": "middle", fill: "rgba(243,238,226,.75)", "font-size": 13, "font-family": "Cinzel, Georgia, serif" }, g).textContent = NUM[s.n];
      });
      // the strike budget: a row of small hammers
      mk("text", { x: L.hl[0], y: L.hl[1], fill: GOLD, "font-size": 13, "font-family": "Cinzel, Georgia, serif", "letter-spacing": 3 }, gHud).textContent = `STRIKES ${st.strikes}`;
      for (let i = 0; i < STRIKES; i++) {
        const [x, y] = L.ham(i), on = i < st.strikes;
        mk("rect", { x, y, width: 44, height: 14, fill: on ? "#d9dde2" : "#3a3236", stroke: LEAD }, gHud);
        mk("rect", { x: x + 18, y: y + 14, width: 8, height: 34, fill: on ? "#7a5634" : "#2a2224" }, gHud);
      }
      strikeBtn.disabled = st.over || !shards.some((s) => s.slot >= 0 && !s.gone);
      gaiaBtn.disabled = st.hintUsed || st.over;
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
      st.strikes--;
      st.beats = st.chord.map((t, k) => { const s = placed.find((z) => z.slot === k); if (!s) return null; const d = Math.abs(s.pitch - t) % 12; return Math.min(d, 12 - d) >= 2 ? 2 : Math.min(d, 12 - d); });
      sound(st.chord.map((t, k) => { const s = placed.find((z) => z.slot === k); return s ? [t, s.pitch] : null; }).filter(Boolean));
      const won = st.beats.every((b) => b === 0);
      if (won) {
        st.over = true; render();
        note.textContent = "Every line lies still. The crystal is set.";
        return later(() => api.end({ outcome: "win", text: `The Heartstone is rekindled and keeps ${st.memory.toLowerCase()}, with ${st.strikes} strike${st.strikes === 1 ? "" : "s"} to spare. Mosswhisper's memory is anchored through the next two drains.` }), 1200);
      }
      const broke = [];
      placed.forEach((s) => { s.cracks++; if (s.cracks >= SHATTER) { s.gone = true; s.slot = -1; broke.push(NUM[s.n]); } });
      const left = shards.filter((s) => !s.gone).length;
      note.textContent = `${st.beats.map((b, k) => b == null ? `slot ${k + 1} empty` : `slot ${k + 1} ${b === 0 ? "still" : b === 1 ? "slow" : "fast"}`).join(" · ")}.${broke.length ? ` Shard ${broke.join(", ")} shatters.` : ""}`;
      if (st.strikes <= 0 || left < st.chord.length) {
        st.over = true; render();
        return later(() => api.end({ outcome: "lose", text: left < st.chord.length ? "Too few shards are left whole to fill the ring. The Heartstone stays dark." : "The last strike fades with the lines still shaking. The Heartstone stays dark, and what it held goes with it." }), 1200);
      }
      render();
    }

    function clickShard(id) {
      if (st.over || !st.started) return;
      const s = shards.find((z) => z.id === id); if (!s || s.gone) return;
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
    gaiaBtn.addEventListener("click", () => {
      if (st.hintUsed || st.over || !st.started) return;
      st.hintUsed = true; st.hint = st.beats.findIndex((b) => b !== 0); if (st.hint < 0) st.hint = 0;
      note.textContent = `Gaia listens: slot ${st.hint + 1} will glow when its true shard is chosen.`;
      render();
    });

    let raf = 0;
    const tick = () => { if (!api.reducedMotion && st.started && st.beats.some((b) => b)) { st.phase += 0.05; drawBeats(); } raf = requestAnimationFrame(tick); };
    const intro = wrap.querySelector(".wrymwretch-heartstone-intro");
    intro.querySelectorAll("[data-choice]").forEach((b) => b.addEventListener("click", () => {
      const c = CHOICES.find((x) => x[0] === b.dataset.choice);
      st.memory = c[1]; st.chord = c[2]; st.started = true; intro.remove();
      drawStatic(); render();
      note.textContent = `The stone will keep ${c[1].toLowerCase()}. Choose a shard from the tray, then a slot in the ring.`;
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

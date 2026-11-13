// Storm-Song Cipher (1D, Neume chant notation). DESIGN.md section 11, cut to one song modelled on
// b3-cipher-2 (Mara's storm-song, nodes N7 and N8), 6 bars instead of 16. Each held note's interval
// from the drone is a bearing, one step = 30 degrees; each rest is one beat = 100 m along the current
// bearing; a breath marks a node ("Write where I breathe"). Two bars are weathered on the original
// staff and must be heard. Transcribe, plot, and land each node within one grid square. One free
// retry; a second wrong plot loses the song.
const P = "lira-calyx-storm-song-cipher-";
const INK = "#3b2618", RED = "#b3212b", PAPER = "#e9dcbd", BLUE = "#2f4c86", GOLD = "#c8913a", PENCIL = "#6f6a62";
const SONG = [2, "r", "r", "r", 1, "r", "r", "B", 0, "r", "r", "r", 3, "r", "r", "r", 5, "r", "r", "B", 4, "r", "r", "r"];
const WEATHERED = new Set([8, 13, 16]);
const NODES = ["N7", "N8"];
const SEMI = [0, 2, 4, 5, 7, 9, 11];
const START = { x: 1, y: 1 };

function walk(seq) {
  let x = START.x, y = START.y, b = null;
  const pts = [[x, y]], nodes = [];
  for (const s of seq) {
    if (typeof s === "number") b = s * 30;
    else if (s === "r" && b != null) { x += Math.sin(b * Math.PI / 180); y += Math.cos(b * Math.PI / 180); pts.push([x, y]); }
    else if (s === "B") nodes.push([x, y]);
  }
  return { pts, nodes };
}

export default {
  mount(root, api) {
    const off = [], timers = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    root.style.background = "#d9c9a3";
    const TRUE = walk(SONG);
    const st = { mine: SONG.map((s) => (s === "B" ? "B" : null)), cur: 0, pitch: 3, tries: 0, over: false, plotted: null };
    const el = document.createElement("div"); el.className = P + "wrap";
    el.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;overflow:auto;background:#d9c9a3;color:${INK};font-family:'IM Fell English',Georgia,serif}
      .${P}spread{display:flex;flex-wrap:wrap;gap:14px;max-width:1320px;margin:10px auto;padding:0 10px}
      .${P}page{background:${PAPER};padding:14px 16px;box-shadow:3px 4px 0 rgba(59,38,24,.25);min-width:0}
      .${P}left{flex:1.6 1 440px}.${P}right{flex:1 1 300px}
      .${P}title{display:flex;align-items:center;gap:10px;margin:0 0 8px;font:italic 18px 'IM Fell English',Georgia,serif}
      .${P}title span.S{display:inline-grid;place-items:center;width:38px;height:38px;background:${BLUE};color:${GOLD};font:400 30px 'IM Fell English',Georgia,serif;font-style:normal}
      .${P}bars{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px 6px}
      .${P}bar{min-width:0}
      .${P}bar svg{display:block;width:100%;max-width:300px;height:auto;touch-action:manipulation}
      .${P}bar .lbl{display:flex;justify-content:space-between;align-items:center;font:12px 'Courier Prime',monospace;color:${PENCIL};padding:0 4px}
      .${P}wrap button{font:15px 'IM Fell English',Georgia,serif;color:${INK};background:transparent;border:1px solid ${INK};padding:7px 12px;cursor:pointer;min-height:40px}
      .${P}wrap button:hover{background:rgba(59,38,24,.08)}
      .${P}bar .lbl button{min-height:28px;padding:2px 8px;font-size:12px}
      .${P}row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 4px;align-items:center}
      .${P}tbl{width:100%;border-collapse:collapse;font:15px Georgia,serif;margin-bottom:10px}
      .${P}tbl td{border-bottom:1px solid rgba(59,38,24,.25);padding:3px 4px}.${P}tbl td:last-child{color:${RED};text-align:right}
      .${P}map svg{width:100%;height:auto;display:block;background:#f1e8d0;border:1px solid ${INK}}
      .${P}msg{font:italic 15px Georgia,serif;min-height:2.6em;margin:6px 0}
      .${P}help{font:13px 'Courier Prime',monospace;color:${PENCIL};margin:6px 0 0}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(217,201,163,.85);z-index:5;padding:16px}
      .${P}card{max-width:480px;background:${PAPER};border:1.5px solid ${INK};padding:18px 20px}
      .${P}card h2{font:400 26px/1.1 'IM Fell English',Georgia,serif;margin:0 0 8px}.${P}card p{margin:0 0 10px;font:15px/1.45 Georgia,serif}
    </style>
    <div class="${P}spread">
      <section class="${P}page ${P}left" aria-label="Staffs">
        <div class="${P}title"><span class="S">S</span>Storm-song of the Peakborn, as sung, above; your transcription below</div>
        <div class="${P}bars"></div>
        <div class="${P}row"><button type="button" data-a="play">▶ Play the song</button><button type="button" data-a="mine">▶ Play mine</button><button type="button" data-a="plot">Plot the path</button></div>
        <p class="${P}help">Click a line or space on your staff to place a note; click under the staff for a rest; click again to clear. Keys: ←→ slot, ↑↓ pitch, Enter note, R rest, Delete clear.</p>
      </section>
      <section class="${P}page ${P}right" aria-label="Correlation table and peak map">
        <div class="${P}title" style="font-style:normal">Lira's correlation table</div>
        <table class="${P}tbl"><tbody>
          ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<tr><td>interval ${k} ${k === 0 ? "(the drone)" : ""}</td><td>bearing ${k * 30}°</td></tr>`).join("")}
          <tr><td>rest, one beat</td><td>100 m</td></tr><tr><td>breath</td><td>a node</td></tr></tbody></table>
        <div class="${P}title" style="font-style:normal">Peak map, sheet 3 (one square, 100 m)</div>
        <div class="${P}map"><svg viewBox="0 0 100 100"></svg></div>
        <p class="${P}msg" aria-live="polite">Mara: “Write where I breathe.”</p>
      </section>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const msg = (t) => { $("." + P + "msg").textContent = t; };

    // ---- staff drawing: four lines, the drone on the bottom line; positions 0..6 = line, space, line...
    const SLOT = 38, X0 = 18;
    const yPos = (top, pos) => top + 36 - pos * 6;
    const neume = (x, y, col, op = 1) => `<rect x="${x - 6}" y="${y - 5}" width="12" height="10" fill="${col}" opacity="${op}"/><rect x="${x + 5}" y="${y - 5}" width="2" height="15" fill="${col}" opacity="${op}"/>`;
    const restMark = (x, top, col, op = 1) => `<rect x="${x - 1.5}" y="${top + 10}" width="3" height="16" fill="${col}" opacity="${op}"/>`;
    const staff = (top, col) => [0, 2, 4, 6].map((p) => `<line x1="4" x2="172" y1="${yPos(top, p)}" y2="${yPos(top, p)}" stroke="${col}" stroke-width="1"/>`).join("") + `<rect x="4" y="${yPos(top, 0) - 3}" width="6" height="6" fill="none" stroke="${col}"/>`;
    const barsEl = $("." + P + "bars");
    const renderBars = () => {
      barsEl.innerHTML = "";
      for (let b = 0; b < SONG.length / 4; b++) {
        const box = document.createElement("div"); box.className = P + "bar";
        let s = `<svg viewBox="0 0 176 118" role="group" aria-label="Bar ${b + 1}">`;
        s += staff(4, RED) + staff(62, PENCIL);
        for (let j = 0; j < 4; j++) {
          const i = b * 4 + j, x = X0 + j * SLOT + 8, o = SONG[i], w = WEATHERED.has(i);
          // original, as sung
          if (o === "B") s += `<text x="${x}" y="10" font-size="18" text-anchor="middle" fill="${RED}">’</text>`;
          else if (o === "r") s += restMark(x, 4, INK, w ? 0.12 : 1);
          else s += neume(x, yPos(4, o), INK, w ? 0.12 : 1);
          if (w) s += `<ellipse cx="${x}" cy="22" rx="15" ry="18" fill="#c9b48a" opacity=".55"/>`;
          // transcription
          const m = st.mine[i], cur = i === st.cur;
          if (cur) s += `<rect x="${x - 15}" y="56" width="30" height="58" fill="rgba(47,76,134,.12)" stroke="${BLUE}" stroke-dasharray="2 2"/>`;
          if (m === "B") s += `<text x="${x}" y="68" font-size="18" text-anchor="middle" fill="${RED}">’</text>`;
          else if (m === "r") s += restMark(x, 62, INK);
          else if (typeof m === "number") s += neume(x, yPos(62, m), INK);
          else if (cur) s += neume(x, yPos(62, st.pitch), BLUE, 0.35);
          s += `<rect class="hit" data-i="${i}" x="${x - SLOT / 2}" y="54" width="${SLOT}" height="64" fill="transparent" style="cursor:pointer"/>`;
        }
        s += `<line x1="172" x2="172" y1="${yPos(4, 6)}" y2="${yPos(4, 0)}" stroke="${RED}"/><line x1="172" x2="172" y1="${yPos(62, 6)}" y2="${yPos(62, 0)}" stroke="${PENCIL}"/></svg>`;
        box.innerHTML = `<div class="lbl"><span>bar ${b + 1}${[...WEATHERED].some((i) => Math.floor(i / 4) === b) ? " · weathered" : ""}</span><button type="button" data-loop="${b}">▶ bar</button></div>` + s;
        barsEl.appendChild(box);
      }
    };
    on(barsEl, "click", (e) => {
      const lp = e.target.closest("[data-loop]");
      if (lp) { play(SONG.slice(+lp.dataset.loop * 4, +lp.dataset.loop * 4 + 4)); return; }
      const hit = e.target.closest(".hit"); if (!hit || st.over) return;
      const i = +hit.dataset.i; if (SONG[i] === "B") return;
      const svg = hit.ownerSVGElement, r = svg.getBoundingClientRect();
      const y = (e.clientY - r.top) / r.height * 118;
      const pos = Math.round((yPos(62, 0) - y) / 6);
      let val = pos < -1 ? "r" : Math.max(0, Math.min(6, pos));
      st.mine[i] = st.mine[i] === val ? null : val; st.cur = i;
      if (typeof val === "number") { st.pitch = val; tone(val, 0.35); }
      renderBars();
    });
    on(window, "keydown", (e) => {
      if (document.querySelector("." + P + "intro") || st.over || e.target.tagName === "BUTTON" && e.key === "Enter") return;
      const move = (d) => { let i = st.cur; do { i = (i + d + SONG.length) % SONG.length; } while (SONG[i] === "B"); st.cur = i; };
      if (e.key === "ArrowRight") move(1); else if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowUp") st.pitch = Math.min(6, st.pitch + 1); else if (e.key === "ArrowDown") st.pitch = Math.max(0, st.pitch - 1);
      else if (e.key === "Enter") { st.mine[st.cur] = st.pitch; tone(st.pitch, 0.35); move(1); }
      else if (e.key === "r" || e.key === "R") { st.mine[st.cur] = "r"; move(1); }
      else if (e.key === "Delete" || e.key === "Backspace") st.mine[st.cur] = null;
      else return;
      e.preventDefault(); renderBars();
    });

    // ---- audio: a drone and held notes (Web Audio, made on first use)
    let ac = null, drone = null;
    const audio = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } } return ac; };
    const tone = (k, dur, when = 0) => {
      const a = audio(); if (!a) return;
      const t = a.currentTime + when, o = a.createOscillator(), gn = a.createGain();
      o.type = "triangle"; o.frequency.value = 196 * Math.pow(2, SEMI[k] / 12);
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.18, t + 0.04); gn.gain.setValueAtTime(0.18, t + dur - 0.08); gn.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(gn).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
    };
    let playing = [];
    const play = (seq) => {
      const a = audio(); if (!a) { msg("No audio here: read the staff, and use the faint marks in the weathered bars."); return; }
      if (a.state === "suspended") a.resume();
      playing.forEach(clearTimeout); playing = [];
      if (drone) { try { drone.stop(); } catch {} }
      const beat = 0.42, total = seq.length * beat;
      drone = a.createOscillator(); const dg = a.createGain(); drone.type = "sine"; drone.frequency.value = 98; dg.gain.value = 0.07;
      drone.connect(dg).connect(a.destination); drone.start(); drone.stop(a.currentTime + total + 0.2);
      seq.forEach((s, j) => { if (typeof s === "number") tone(s, beat * 0.95, j * beat); });
    };

    // ---- the map
    const mapSvg = $("." + P + "map svg");
    const all = [...TRUE.pts, [START.x - 1, START.y - 1]];
    const minX = Math.floor(Math.min(...all.map((p) => p[0]))) - 1, maxX = Math.ceil(Math.max(...all.map((p) => p[0]))) + 2;
    const minY = Math.floor(Math.min(...all.map((p) => p[1]))) - 1, maxY = Math.ceil(Math.max(...all.map((p) => p[1]))) + 2;
    const GW = maxX - minX, GH = maxY - minY, U = 100 / Math.max(GW, GH);
    const mx = (x) => (x - minX) * U, my = (y) => (maxY - y) * U;
    mapSvg.setAttribute("viewBox", `0 0 ${GW * U} ${GH * U}`);
    const drawMap = () => {
      let s = "";
      for (let i = 0; i <= GW; i++) s += `<line x1="${i * U}" x2="${i * U}" y1="0" y2="${GH * U}" stroke="#bfae8a" stroke-width=".25"/>`;
      for (let j = 0; j <= GH; j++) s += `<line y1="${j * U}" y2="${j * U}" x1="0" x2="${GW * U}" stroke="#bfae8a" stroke-width=".25"/>`;
      const pk = [mx(TRUE.nodes[1][0] + 0.6), my(TRUE.nodes[1][1] + 1.2)];
      for (let r = 1; r <= 8; r++) { let d = ""; for (let a = 0; a <= 36; a++) { const t = a / 36 * Math.PI * 2, rr = r * U * 0.9 * (1 + 0.18 * Math.sin(t * 3 + r)); d += `${a ? "L" : "M"}${pk[0] + Math.cos(t) * rr * 1.2},${pk[1] + Math.sin(t) * rr}`; } s += `<path d="${d}Z" fill="none" stroke="#8a7a5c" stroke-width=".3"/>`; }
      s += `<path d="M${mx(START.x) - 2},${my(START.y) + 2} l2,-4 l2,4z" fill="${INK}"/><text x="${mx(START.x) + 3}" y="${my(START.y) + 3}" font-size="3" fill="${INK}" font-style="italic">Mara's ledge</text>`;
      s += `<text x="${GW * U - 2}" y="4" font-size="3" text-anchor="end" fill="${INK}">N ↑</text>`;
      if (st.plotted) {
        const { pts, nodes } = st.plotted;
        s += `<path d="M${pts.map((p) => `${mx(p[0])},${my(p[1])}`).join(" L")}" fill="none" stroke="${PENCIL}" stroke-width=".8" stroke-dasharray="1.5 1"/>`;
        nodes.forEach((n, k) => {
          const t = TRUE.nodes[k], ok = t && Math.hypot(n[0] - t[0], n[1] - t[1]) <= 1;
          s += `<circle cx="${mx(n[0])}" cy="${my(n[1])}" r="${U * 0.45}" fill="none" stroke="${ok ? "#2f6b3f" : RED}" stroke-width=".8"/><text x="${mx(n[0]) + U * 0.6}" y="${my(n[1]) + 1}" font-size="3.4" fill="${ok ? "#2f6b3f" : RED}">${NODES[k] || "?"}${ok ? "" : " ?"}</text>`;
        });
      }
      mapSvg.innerHTML = s;
    };

    const act = (a) => {
      if (st.over) return;
      if (a === "play") { play(SONG); msg("The drone holds; each note above it is a bearing."); }
      if (a === "mine") play(st.mine.map((s) => (s == null ? "r" : s)));
      if (a === "plot") {
        const empty = st.mine.filter((s) => s == null).length;
        if (empty) { msg(`${empty} slot${empty > 1 ? "s" : ""} still blank on your staff.`); return; }
        st.plotted = walk(st.mine); drawMap();
        const res = TRUE.nodes.map((t, k) => { const n = st.plotted.nodes[k]; return n && Math.hypot(n[0] - t[0], n[1] - t[1]) <= 1; });
        if (res.every(Boolean)) { st.over = true; api.end({ outcome: "win", text: `N7 and N8 located within a square each. Entries: cipher, ok. They never passed through the relay.` }); return; }
        st.tries++;
        const bad = NODES.filter((_, k) => !res[k]).join(" and ");
        if (st.tries >= 2) { st.over = true; api.end({ outcome: "lose", text: `${bad} still off the ledges after the retry. Entry logged error; the song keeps its coordinates.` }); return; }
        msg(`${bad} lands off the ledges. One free retry: listen to the weathered bars again.`);
      }
    };
    el.querySelectorAll("[data-a]").forEach((b) => on(b, "click", () => act(b.dataset.a)));
    renderBars(); drawMap();

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>Storm-Song Cipher</h2>
      <p>Transcribe Mara's storm-song onto the blank staff. Each note's interval above the drone (the bottom line) is a bearing, 30° a step; each rest is 100 m along it; each breath marks a node.</p>
      <p>Three slots are weathered on the original: play the bar and listen. Then plot: land N7 and N8 within one square. One free retry.</p>
      <button type="button">Begin</button></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); });
    sb.focus();
    return { unmount() { timers.forEach(clearTimeout); playing.forEach(clearTimeout); try { drone && drone.stop(); } catch {} try { ac && ac.close(); } catch {} off.forEach((f) => f()); } };
  },
};

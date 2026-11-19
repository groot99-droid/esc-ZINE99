// Storm-Song Cipher (1D, Neume chant notation). DESIGN.md section 11, cut to one song modelled on
// b3-cipher-2 (Mara's storm-song, nodes N7 and N8), 6 bars instead of 16. Each held note's interval
// from the drone is a bearing, one step = 30 degrees; each rest is one beat = 100 m along the current
// bearing; a breath marks a node ("Write where I breathe"). Two bars are weathered on the original
// staff and must be heard. Transcribe, plot, and land each node within one grid square. One free
// retry; a second wrong plot loses the song.
// Added in the refine pass: Ask Mara (two uses, three after two lost songs) sings one weathered slot
// slowly and pencils it faintly over the weathering, so at least one must be heard or reasoned out.
// The plotted path draws itself on the map; beats follow the transcription and the plots.
// Drawn with the game's art (api.art): Mara's fourteen neume cards as a rail that also enters notes,
// rests and pitch for touch players; the peak map under the grid; Mara's plate beside her voice.
// Phase 2 (DEEP_DIVE section 3): three stages. Teach (Book II, the sealed archive index): three
// legible glyph lines, two breaths, two names. Test (Book III): Mara's song, as before. Twist: the
// fourth song is not sung. It is the redacted brief: slide the page under the staff and a ruled bar's
// line is its pitch and its length its rests (14 mm a beat); a brushed bar is only ink and is left
// out; and the page is a dirge, the same path walked backwards from the mark. Set-piece: Lira plays
// the bars aloud. It reads four of the twelve bars; where all twelve lead waits for phase 3.
import { runStages } from "./_stages.js";
import { record, got } from "./_bars.js";
const P = "lira-calyx-storm-song-cipher-";
const INK = "#3b2618", RED = "#b3212b", PAPER = "#e9dcbd", BLUE = "#2f4c86", GOLD = "#c8913a", PENCIL = "#6f6a62";
const STG = [
  { song: [2, "r", "r", "B", 4, "r", "r", "r", 1, "r", "r", "B"], weathered: [], nodes: ["VEYLOR, S.", "REGENESIS"], tries: 3, start: "index mark", sheet: "Sealed archive index, sheet 1 (one square, one drawer)" },
  { song: [2, "r", "r", "r", 1, "r", "r", "B", 0, "r", "r", "r", 3, "r", "r", "r", 5, "r", "r", "B", 4, "r", "r", "r"], weathered: [8, 13, 16], nodes: ["N7", "N8"], tries: 2, start: "Mara's ledge", sheet: "Peak map, sheet 3 (one square, 100 m)" },
  { song: [3, "r", "r", "r", null, null, null, null, 0, "r", "r", null, 5, "r", null, null, 2, "r", "r", "r"], weathered: [], nodes: ["the blank square"], tries: 3, start: "the mark", sheet: "Peak map, sheet 5, under Peak 12 (one square, 100 m)",
    page: [{ k: "s", mm: 41 }, { k: "c" }, { k: "s", mm: 28 }, { k: "s", mm: 14 }, { k: "s", mm: 41 }] },
];
const SEMI = [0, 2, 4, 5, 7, 9, 11];
const START = { x: 1, y: 1 };

function walk(seq, dirge, end) {
  let x = START.x, y = START.y, b = null;
  const pts = [[x, y]], nodes = [], sg = dirge ? -1 : 1;
  for (const s of seq) {
    if (typeof s === "number") b = s * 30;
    else if (s === "r" && b != null) { x += sg * Math.sin(b * Math.PI / 180); y += sg * Math.cos(b * Math.PI / 180); pts.push([x, y]); }
    else if (s === "B") nodes.push([x, y]);
  }
  if (end) nodes.push([x, y]);
  return { pts, nodes };
}

function mountStage(root, api, stage) {
  {
    const S = STG[stage], SONG = S.song, WEATHERED = new Set(S.weathered), NODES = S.nodes, TW = stage === 2;
    const off = [], timers = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    const A = api.art || { has: () => false, url: () => "" };
    const pic = (id, cls = "", alt = "") => (A.has(id) ? `<img class="${cls}" src="${A.url(id)}" alt="${alt}" draggable="false">` : "");
    root.style.background = "#d9c9a3";
    const TRUE = walk(SONG, TW, TW);
    const losses = api.store.get("losses", 0);
    const st = { mine: SONG.map((s) => (s === "B" ? "B" : null)), cur: 0, pitch: 3, tries: 0, over: false, plotted: null, asks: stage === 0 ? 0 : losses >= 2 ? 3 : 2, asked: new Set(), beats: {}, flashI: -1, slid: !TW, dirge: false, gauged: new Set() };
    const el = document.createElement("div"); el.className = P + "wrap";
    el.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;overflow:auto;background:#d9c9a3;color:${INK};font-family:'IM Fell English',Georgia,serif}
      .${P}spread{display:flex;flex-wrap:wrap;gap:14px;max-width:1320px;margin:10px auto;padding:0 10px}
      .${P}page{background:${PAPER};padding:14px 16px;box-shadow:3px 4px 0 rgba(59,38,24,.25);min-width:0}
      .${P}left{flex:1.6 1 440px}.${P}right{flex:1 1 300px}
      .${P}title{display:flex;align-items:center;gap:10px;margin:0 0 8px;font:italic 18px 'IM Fell English',Georgia,serif}
      .${P}title span.S{display:inline-grid;place-items:center;width:38px;height:38px;background:${BLUE};color:${GOLD};font:400 30px 'IM Fell English',Georgia,serif;font-style:normal}
      .${P}bars{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:12px 8px}
      .${P}bar{min-width:0}
      .${P}bar svg{display:block;width:100%;max-width:300px;height:auto;touch-action:manipulation}
      .${P}bar .lbl{display:flex;justify-content:space-between;align-items:center;font:12px 'Courier Prime',monospace;color:${PENCIL};padding:0 4px}
      .${P}wrap button{font:15px 'IM Fell English',Georgia,serif;color:${INK};background:transparent;border:1px solid ${INK};padding:7px 12px;cursor:pointer;min-height:40px}
      .${P}wrap button:hover:not(:disabled){background:rgba(59,38,24,.1)}
      .${P}wrap button:disabled{opacity:.4;cursor:default}
      .${P}wrap button.mara{border-color:${BLUE};color:${BLUE}}
      .${P}wrap button[hidden]{display:none}
      .${P}wrap button[aria-pressed=true],.${P}wrap button[aria-pressed=true]:hover:not(:disabled){background:${INK};color:${PAPER}}
      .${P}bar .lbl button{min-height:32px;padding:2px 10px;font-size:14px}
      .${P}bar .lbl{font-size:13px!important}
      .${P}bar .hit:hover{fill:rgba(47,76,134,.08)}
      .${P}bar.fresh svg{animation:${P}ink .5s}
      @keyframes ${P}ink{from{filter:drop-shadow(0 0 4px ${GOLD})}}
      .${P}path{stroke-dasharray:400;stroke-dashoffset:400;animation:${P}draw 2.4s forwards}
      @keyframes ${P}draw{to{stroke-dashoffset:0}}
      .${P}voice{font:italic 16px/1.4 'IM Fell English',Georgia,serif;color:${BLUE};border-left:3px solid ${GOLD};padding-left:10px;margin:8px 0}
      .${P}row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 4px;align-items:center}
      .${P}tbl{width:100%;border-collapse:collapse;font:15px Georgia,serif;margin-bottom:10px}
      .${P}tbl td{border-bottom:1px solid rgba(59,38,24,.25);padding:3px 4px}.${P}tbl td:last-child{color:${RED};text-align:right}
      .${P}map svg{width:100%;height:auto;display:block;background:#f1e8d0;border:1px solid ${INK}}
      .${P}msg{font:italic 16px/1.4 'IM Fell English',Georgia,serif;min-height:2.8em;margin:6px 0}
      .${P}msg.bad{color:${RED}}
      .${P}help{font:14px/1.45 'Courier Prime',monospace;color:#5b5650;margin:6px 0 0}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(217,201,163,.88);z-index:5;padding:14px;overflow:auto}
      .${P}card{width:min(470px,100%);background:${PAPER};border:1.5px solid ${INK};padding:18px 20px;display:grid;grid-template-columns:auto 1fr;gap:4px 14px;box-shadow:3px 4px 0 rgba(59,38,24,.25)}
      .${P}card .S{grid-row:span 2;width:62px;height:62px;display:grid;place-items:center;background:${BLUE};color:${GOLD};font:400 50px/1 'IM Fell English',Georgia,serif;border:3px double ${GOLD}}
      .${P}card h2{font:400 28px/1.05 'IM Fell English',Georgia,serif;margin:0;align-self:end}
      .${P}card .goal{font:italic 16px/1.35 'IM Fell English',Georgia,serif;margin:0;color:${RED}}
      .${P}card svg{grid-column:1/-1;width:100%;height:auto;margin:8px 0 2px}
      .${P}card ul{grid-column:1/-1;list-style:none;margin:0 0 10px;padding:0;font:15px/1.45 Georgia,serif}
      .${P}card li b{font:700 13px 'Courier Prime',monospace;display:inline-block;min-width:6.5em}
      .${P}card button{grid-column:1/-1;justify-self:start;background:${INK};color:${PAPER};font-size:17px;padding:10px 22px}
      .${P}card button:hover{background:${RED}!important}
      .${P}card .mf{grid-column:1/-1;display:flex;gap:10px;align-items:center;font:italic 15px/1.35 'IM Fell English',Georgia,serif;color:${BLUE}}.${P}card .mf img{width:64px;height:auto;border:1px solid ${INK}}
      .${P}rail{display:flex;gap:6px;overflow-x:auto;padding:4px 2px 8px;margin:8px 0 0;scrollbar-width:thin}
      .${P}rail button{flex:0 0 auto;padding:0!important;border:1px solid ${INK}!important;min-height:0!important;width:62px;height:62px;background:${PAPER}!important}
      .${P}rail button img{display:block;width:100%;height:100%}
      .${P}rail button.tool{outline:2px solid ${BLUE};outline-offset:1px}
      .${P}rl{font:12px 'Courier Prime',monospace;color:${PENCIL};margin:8px 0 0}
      .${P}vw{display:flex;gap:10px;align-items:flex-start}.${P}vw img{width:54px;height:auto;border:1px solid ${INK};flex:0 0 auto}.${P}vw .${P}voice{flex:1;margin:0}
      .${P}title img.tab{height:30px;width:auto;margin-left:auto}
      .${P}wrap button.mara img{height:24px;width:24px;vertical-align:middle;margin:-4px 6px -2px -2px}
    </style>
    <div class="${P}spread">
      <section class="${P}page ${P}left" aria-label="Staffs">
        <div class="${P}title"><span class="S">S</span>${["The archive index, as written, above; your copy below", "Storm-song of the Peakborn, as sung, above; your transcription below", "The redacted brief, above; what its bars would sing, below"][stage]}</div>
        <div class="${P}bars"></div>
        <div class="${P}row"><button type="button" data-a="play" ${TW ? "hidden" : ""}>▶ Play the ${stage ? "song" : "lines"}</button><button type="button" data-a="slide" ${TW ? "" : "hidden"}>Slide the page under the staff</button><button type="button" data-a="mine">▶ Play mine</button><button type="button" class="mara" data-a="ask" hidden>Ask Mara (2)</button><button type="button" data-a="dirge" aria-pressed="false" ${TW ? "" : "hidden"}>Walk it as a dirge: off</button><button type="button" data-a="plot">Plot the path</button></div>
        <p class="${P}help">Tap a line or space on your staff for a note, below it for a rest; tap again to clear. Keys: ← → slot · ↑ ↓ pitch · Enter note · R rest · Delete clear · M ask Mara.</p>
        ${A.has("neume-punctum") ? `<p class="${P}rl">MARA’S NEUME CARDS · tap one: the outlined cards write on your staff</p><div class="${P}rail" role="group" aria-label="Neume cards"></div>` : ""}
        <div class="${P}vw">${pic("fig-mara", "", "Mara, storm-singer")}<p class="${P}voice" aria-live="polite"></p></div>
      </section>
      <section class="${P}page ${P}right" aria-label="Correlation table and peak map">
        <div class="${P}title" style="font-style:normal">Lira's correlation table${pic("tab-songs", "tab")}</div>
        <table class="${P}tbl"><tbody>
          ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<tr><td>interval ${k} ${k === 0 ? "(the drone)" : ""}</td><td>bearing ${k * 30}°</td></tr>`).join("")}
          <tr><td>rest, one beat</td><td>${stage ? "100 m" : "one drawer"}</td></tr><tr><td>breath</td><td>${stage ? "a node" : "a name"}</td></tr>
          ${TW ? `<tr><td>a ruled bar on a line</td><td>a note on that line</td></tr><tr><td>its length</td><td>14 mm a rest</td></tr><tr><td>a dirge</td><td>the same path, backwards</td></tr>` : ""}</tbody></table>
        <div class="${P}title" style="font-style:normal">${S.sheet}</div>
        <div class="${P}map"><svg viewBox="0 0 100 100"></svg></div>
        <p class="${P}msg" aria-live="polite">${stage === 1 ? "Mara: “Write where I breathe.”" : ""}</p>
      </section>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const msg = (t, bad) => { const m = $("." + P + "msg"); m.textContent = t; m.classList.toggle("bad", !!bad); };
    const voice = (t) => { $("." + P + "voice").textContent = t; };
    const askBtn = $("[data-a=ask]");
    const syncAsk = () => { askBtn.innerHTML = `${pic("token-witness-song")}Ask Mara (${st.asks})`; askBtn.disabled = st.asks <= 0 || (!TW && [...WEATHERED].every((i) => st.asked.has(i))); };

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
        if (TW) { // a strip of the redacted page; slid under the staff, a ruled bar sits on a line
          const pg = S.page[b], o0 = SONG[b * 4], n = SONG.slice(b * 4, b * 4 + 4).filter((v) => v === "r").length;
          s += `<rect x="2" y="0" width="172" height="50" fill="#f4efe2" stroke="rgba(59,38,24,.35)"/>` + [10, 20, 31, 42].map((yy, q) => `<line x1="8" x2="${168 - (q * 37) % 50}" y1="${yy}" y2="${yy}" stroke="rgba(59,38,24,.22)" stroke-width="2" stroke-dasharray="${9 + q * 3} 4"/>`).join("");
          if (st.slid) s += staff(4, RED);
          if (pg.k === "s") { const y = st.slid ? yPos(4, o0) : 26 + ((b * 7) % 5) - 2, x0 = X0 + 8 - 8, w = n * SLOT + 16;
            s += `<rect x="${x0 - 3}" y="${y + 2.4}" width="${w + 6}" height="1.2" fill="${BLUE}" opacity=".8"/><rect x="${x0}" y="${y - 3.5}" width="${w}" height="7" fill="#141414"/>`;
            if (st.gauged.has(b)) s += `<rect x="${x0 + w - 44}" y="${y < 20 ? y + 6 : y - 17}" width="44" height="12" fill="#f4efe2" stroke="${BLUE}" stroke-width=".6"/><text x="${x0 + w - 22}" y="${y < 20 ? y + 15 : y - 8}" font-size="10" text-anchor="middle" fill="${BLUE}" font-family="Courier Prime,monospace">${pg.mm} mm</text>`; }
          else s += A.has("bar-clumsy") ? `<image href="${A.url("bar-clumsy")}" x="20" y="13" width="118" height="20" preserveAspectRatio="none" transform="rotate(-4 80 24)"/>` : `<path d="M22,18 l40,-4 l60,5 l14,6 l-30,7 l-70,-2z" fill="#141414"/>`;
          s += `<rect class="pgb" data-pg="${b}" x="2" y="0" width="172" height="50" fill="transparent" style="cursor:pointer"/>`;
        } else s += staff(4, RED);
        s += staff(62, PENCIL);
        for (let j = 0; j < 4; j++) {
          const i = b * 4 + j, x = X0 + j * SLOT + 8, o = SONG[i], w = WEATHERED.has(i);
          // original, as sung
          if (TW) { /* the page strip above stands in for the sung line */ }
          else if (o === "B") s += `<text x="${x}" y="10" font-size="18" text-anchor="middle" fill="${RED}">’</text>`;
          else if (o === "r") s += restMark(x, 4, INK, w ? 0.12 : 1);
          else s += neume(x, yPos(4, o), INK, w ? 0.12 : 1);
          if (w) s += `<ellipse cx="${x}" cy="22" rx="15" ry="18" fill="#c9b48a" opacity=".55"/>`;
          if (w && st.asked.has(i)) s += o === "r" ? restMark(x, 4, BLUE, 0.7) : neume(x, yPos(4, o), BLUE, 0.7);
          // transcription
          const m = st.mine[i], cur = i === st.cur;
          if (cur) s += `<rect x="${x - 15}" y="56" width="30" height="58" fill="rgba(47,76,134,.12)" stroke="${BLUE}" stroke-dasharray="2 2"/>`;
          if (m === "B") s += `<text x="${x}" y="68" font-size="18" text-anchor="middle" fill="${RED}">’</text>`;
          else if (m === "r") s += restMark(x, 62, INK);
          else if (typeof m === "number") s += neume(x, yPos(62, m), INK);
          else if (cur) s += neume(x, yPos(62, st.pitch), BLUE, 0.35);
          s += `<rect class="hit" data-i="${i}" x="${x - SLOT / 2}" y="54" width="${SLOT}" height="64" fill="transparent" style="cursor:pointer"/>`;
        }
        s += `${TW ? "" : `<line x1="172" x2="172" y1="${yPos(4, 6)}" y2="${yPos(4, 0)}" stroke="${RED}"/>`}<line x1="172" x2="172" y1="${yPos(62, 6)}" y2="${yPos(62, 0)}" stroke="${PENCIL}"/></svg>`;
        if (Math.floor(st.flashI / 4) === b) box.classList.add("fresh");
        box.innerHTML = `<div class="lbl"><span>${TW ? `page line ${b + 1}` : `${stage ? "bar" : "line"} ${b + 1}`}${[...WEATHERED].some((i) => Math.floor(i / 4) === b) ? " · weathered" : ""}</span>${TW ? `<button type="button" data-clr="${b}">clear</button>` : `<button type="button" data-loop="${b}">▶ ${stage ? "bar" : "line"}</button>`}</div>` + s;
        barsEl.appendChild(box);
      }
    };
    on(barsEl, "click", (e) => {
      const lp = e.target.closest("[data-loop]");
      if (lp) { play(SONG.slice(+lp.dataset.loop * 4, +lp.dataset.loop * 4 + 4)); return; }
      const clr = e.target.closest("[data-clr]");
      if (clr && !st.over) { for (let j = 0; j < 4; j++) st.mine[+clr.dataset.clr * 4 + j] = null; renderBars(); return; }
      const pgb = e.target.closest(".pgb");
      if (pgb && !st.over) { const b = +pgb.dataset.pg, pg = S.page[b]; st.gauged.add(b);
        msg(pg.k === "s" ? `Bar gauge, page line ${b + 1}: ruled, blue under the black, ${pg.mm} mm. ${st.slid ? `On the staff: ${Math.round(pg.mm / 14)} beat${Math.round(pg.mm / 14) > 1 ? "s" : ""} after its note.` : "Slide the page under the staff to see which line it sits on."}` : `Bar gauge, page line ${b + 1}: it will not sit. Brushed. It lies on no line of the staff: it is only ink.`);
        renderBars(); return; }
      const hit = e.target.closest(".hit"); if (!hit || st.over) return;
      const i = +hit.dataset.i; if (SONG[i] === "B") return;
      const svg = hit.ownerSVGElement, r = svg.getBoundingClientRect();
      const y = (e.clientY - r.top) / r.height * 118;
      const pos = Math.round((yPos(62, 0) - y) / 6);
      let val = pos < -1 ? "r" : Math.max(0, Math.min(6, pos));
      st.mine[i] = st.mine[i] === val ? null : val; st.cur = i; st.flashI = i;
      if (typeof val === "number") { st.pitch = val; tone(val, 0.35); }
      renderBars(); progressBeats();
    });
    on(window, "keydown", (e) => {
      if (el.querySelector("." + P + "intro") || st.over || e.target.tagName === "BUTTON" && e.key === "Enter") return;
      const move = (d) => { let i = st.cur; do { i = (i + d + SONG.length) % SONG.length; } while (SONG[i] === "B"); st.cur = i; };
      if (e.key === "ArrowRight") move(1); else if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowUp") st.pitch = Math.min(6, st.pitch + 1); else if (e.key === "ArrowDown") st.pitch = Math.max(0, st.pitch - 1);
      else if (e.key === "Enter") { st.mine[st.cur] = st.pitch; tone(st.pitch, 0.35); move(1); }
      else if (e.key === "r" || e.key === "R") { st.mine[st.cur] = "r"; move(1); }
      else if (e.key === "Delete" || e.key === "Backspace") st.mine[st.cur] = null;
      else if (e.key === "m" || e.key === "M") { act("ask"); return; }
      else return;
      st.flashI = st.cur; e.preventDefault(); renderBars(); progressBeats();
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
    const all = [...TRUE.pts, [START.x - 1, START.y - 1], ...(TW ? walk(SONG, false).pts : [])];
    const minX = Math.floor(Math.min(...all.map((p) => p[0]))) - 1, maxX = Math.ceil(Math.max(...all.map((p) => p[0]))) + 2;
    const minY = Math.floor(Math.min(...all.map((p) => p[1]))) - 1, maxY = Math.ceil(Math.max(...all.map((p) => p[1]))) + 2;
    const GW = maxX - minX, GH = maxY - minY, U = 100 / Math.max(GW, GH);
    const mx = (x) => (x - minX) * U, my = (y) => (maxY - y) * U;
    mapSvg.setAttribute("viewBox", `0 0 ${GW * U} ${GH * U}`);
    const drawMap = () => {
      let s = A.has("peak-map") ? `<image href="${A.url("peak-map")}" x="0" y="0" width="${GW * U}" height="${GH * U}" preserveAspectRatio="xMidYMid slice" opacity=".5"/>` : "";
      for (let i = 0; i <= GW; i++) s += `<line x1="${i * U}" x2="${i * U}" y1="0" y2="${GH * U}" stroke="#bfae8a" stroke-width=".25"/>`;
      for (let j = 0; j <= GH; j++) s += `<line y1="${j * U}" y2="${j * U}" x1="0" x2="${GW * U}" stroke="#bfae8a" stroke-width=".25"/>`;
      const lastN = TRUE.nodes[TRUE.nodes.length - 1], pk = [mx(lastN[0] + 0.6), my(lastN[1] + 1.2)];
      for (let r = 1; r <= 8; r++) { let d = ""; for (let a = 0; a <= 36; a++) { const t = a / 36 * Math.PI * 2, rr = r * U * 0.9 * (1 + 0.18 * Math.sin(t * 3 + r)); d += `${a ? "L" : "M"}${pk[0] + Math.cos(t) * rr * 1.2},${pk[1] + Math.sin(t) * rr}`; } s += `<path d="${d}Z" fill="none" stroke="#8a7a5c" stroke-width=".3"/>`; }
      s += `<path d="M${mx(START.x) - 2},${my(START.y) + 2} l2,-4 l2,4z" fill="${INK}"/><text x="${mx(START.x) + 3}" y="${my(START.y) + 3}" font-size="4" fill="${INK}" font-style="italic">${S.start}</text>`;
      s += `<text x="${GW * U - 2}" y="5" font-size="4.5" text-anchor="end" fill="${INK}">N ↑</text>`;
      if (st.plotted) {
        const { pts, nodes } = st.plotted;
        s += `<path class="${api.reducedMotion ? "" : P + "path"}" pathLength="400" d="M${pts.map((p) => `${mx(p[0])},${my(p[1])}`).join(" L")}" fill="none" stroke="${INK}" stroke-width="1"/>`;
        nodes.forEach((n, k) => {
          const t = TRUE.nodes[k], ok = t && Math.hypot(n[0] - t[0], n[1] - t[1]) <= 1;
          if (!ok && TW) return void (s += `<circle cx="${mx(n[0])}" cy="${my(n[1])}" r="${U * 0.45}" fill="none" stroke="${RED}" stroke-width=".8"/><text x="${mx(n[0]) - U * 0.6}" y="${my(n[1]) + 1}" font-size="4.2" font-weight="700" text-anchor="end" fill="${RED}">off the sheet's rock</text>`);
          s += `<rect x="${mx(n[0]) - U * 0.5}" y="${my(n[1]) - U * 0.5}" width="${U}" height="${U}" fill="${ok ? "rgba(47,107,63,.18)" : "rgba(179,33,43,.15)"}"/><circle cx="${mx(n[0])}" cy="${my(n[1])}" r="${U * 0.45}" fill="none" stroke="${ok ? "#2f6b3f" : RED}" stroke-width=".8"/><text x="${mx(n[0]) + U * 0.6}" y="${my(n[1]) + 1}" font-size="4.2" font-weight="700" fill="${ok ? "#2f6b3f" : RED}">${ok ? NODES[k] || "?" : stage ? NODES[k] || "?" : "an empty drawer"}${ok ? " ✓" : " ?"}</text>`;
        });
      }
      mapSvg.innerHTML = s;
    };

    const progressBeats = () => {
      const filled = (a, b) => st.mine.slice(a, b).every((x) => x != null);
      if (stage === 0) { if (st.mine.every((x) => x != null) && !st.beats.b3) { st.beats.b3 = 1; voice("Three lines copied. Each note is a turn along the drawer wall, each rest one drawer; the two breath marks are where the clerk stopped."); } return; }
      if (TW) { const n = st.mine.filter((x) => typeof x === "number").length; if (n >= 2 && !st.beats.b1) { st.beats.b1 = 1; voice("A note where each ruled bar sits, a rest for every 14 mm of it. Lira hums the first two under her breath and stops."); } return; }
      if (filled(0, 8) && !st.beats.b1) { st.beats.b1 = 1; voice("The first breath. Mara stops, breathes, and you write the mark where she did: N7 is somewhere along that line."); }
      if (filled(8, 20) && !st.beats.b2) { st.beats.b2 = 1; voice("The second breath, higher up the song. Wind on the ledge now; Mara sings into it as if it were a second voice."); }
      if (st.mine.every((x) => x != null) && !st.beats.b3) { st.beats.b3 = 1; voice("Every slot is filled. Lira reads it over once against the table before she trusts her pencil to the map."); }
    };
    const act = (a) => {
      if (st.over) return;
      if (a === "ask") {
        if (TW) { if (st.asks <= 0) return; const b = Math.floor(st.cur / 4), pg = S.page[b]; st.asks--; syncAsk();
          voice(pg.k === "s" ? `Mara looks at page line ${b + 1} for a long moment, then sings one note, low: ${["the drone itself", "one above the drone", "two above", "three above", "four above", "five above", "six above"][SONG[b * 4]]}. “That one is written by someone who has stood on our ledge.”` : `Mara, at page line ${b + 1}: “That is only ink. Nobody sings that.”`); return; }
        const left = [...WEATHERED].filter((i) => !st.asked.has(i));
        if (st.asks <= 0 || !left.length) return;
        const i = left.includes(st.cur) ? st.cur : left[0];
        st.asks--; st.asked.add(i); st.flashI = i;
        const o = SONG[i]; if (typeof o === "number") { if (audio()) { audio().state === "suspended" && audio().resume(); tone(o, 1.2); } }
        voice(`Mara sings bar ${Math.floor(i / 4) + 1} slowly, ${typeof o === "number" ? "holding one note long" : "and leaves a silence where the weathering is"}. You pencil it over the faded mark.${st.asks ? "" : " She shakes her head: the rest you must hear."}`);
        syncAsk(); renderBars(); return;
      }
      if (a === "slide") { st.slid = !st.slid; renderBars(); $("[data-a=slide]").textContent = st.slid ? "Slide the page back out" : "Slide the page under the staff"; msg(st.slid ? "The page under the four red lines. The ruled bars each sit square on a line or in a space. The brushed one lies across two." : "The page as it came back to you: black bars, and nothing to read them against."); if (st.slid && askBtn.hidden) { askBtn.hidden = false; syncAsk(); } return; }
      if (a === "dirge") { st.dirge = !st.dirge; const b = $("[data-a=dirge]"); b.setAttribute("aria-pressed", st.dirge); b.textContent = `Walk it as a dirge: ${st.dirge ? "on" : "off"}`; msg(st.dirge ? "A dirge: the same path, walked backwards from the mark." : "As a song: forwards from the mark."); return; }
      if (a === "play") { play(SONG); msg("The drone holds; each note above it is a bearing."); if (askBtn.hidden && stage === 1) { askBtn.hidden = false; syncAsk(); voice("Mara, watching you strain at the weathered bars: “I can sing you a bar, slow. Twice. Then the storm comes in.”"); } }
      if (a === "mine") { play(st.mine.map((s) => (s == null ? "r" : s)));
        if (TW && st.mine.filter((x) => typeof x === "number").length >= 3 && !st.beats.sing) { st.beats.sing = 1; voice("Lira plays the bars aloud, one held note for each. Mara, from the doorway, very still: “That is ours. Who taught your censor to sing?”"); } }
      if (a === "plot") {
        const empty = st.mine.filter((s) => s == null).length;
        if (empty && !TW) { msg(`${empty} slot${empty > 1 ? "s" : ""} still blank on your staff.`, true); return; }
        if (TW && st.mine.filter((x) => typeof x === "number").length < 2) { msg("Nothing to walk yet: write a note where a ruled bar sits.", true); return; }
        st.plotted = walk(st.mine, TW && st.dirge, TW); drawMap();
        const res = TRUE.nodes.map((t, k) => { const n = st.plotted.nodes[k]; return n && Math.hypot(n[0] - t[0], n[1] - t[1]) <= 1; });
        if (res.every(Boolean)) { st.over = true; api.store.set("losses", 0); if (stage === 1) api.shared.set("song", true); if (TW) { api.shared.set("bars_read", true); S.page.filter((q) => q.k === "s").forEach((q, i) => record(api, 7 + i, q.mm)); if (api.ledger) api.ledger.refresh(); }
          const text = stage === 0 ? `Two drawers, two names${st.tries ? `, on plot ${st.tries + 1}` : ""}: Dr. Solace Veylor, and Operation ReGenesis. The rest of the index is in a notation you cannot fully read yet, and the coordinates stay locked. Someone wrote a filing system as a song.`
            : stage === 1 ? `N7 and N8 located within a square each${st.tries ? ", on the second plot" : ""}. Entries: cipher, ok. They never passed through the relay. Mara reads the pencil path upside down and nods once: a Peakborn song, walked out on paper.`
            : `Four ruled bars, read as neumes and walked as a dirge, end on a square the survey leaves blank${st.tries ? ", on the second plot" : ""}. The brushed bar sang nothing. ${st.beats.sing ? "Mara is still in the doorway. “Who taught your censor to sing?”" : "Mara reads the page over your shoulder and says, slowly: “That is ours. Who taught your censor to sing?”"} ${Object.keys(got(api)).length >= 12 ? "Four bars of twelve, and with these the ledger holds all twelve: open it (the ruled bar in the strip above) and lay them under this staff." : `Four bars of twelve, in the ledger now (${Object.keys(got(api)).length} of 12); the others are in other books, and this path stops where they begin. When all twelve are measured, the ledger lays them under this staff.`}`;
          const t = setTimeout(() => api.end({ outcome: "win", text }), api.reducedMotion ? 0 : 2400); timers.push(t); return; }
        st.tries++;
        const bad = TW ? "The path" : NODES.filter((_, k) => !res[k]).join(" and ");
        if (TW && st.tries < S.tries) { msg(`The path runs off the rock. ${S.tries - st.tries > 1 ? "Two more tries." : "One more try."}`, true); voice(st.dirge ? "Mara: “Not every black mark is a note. One of those was put on with a brush.”" : "Mara, looking at the page: “That is no storm-song. That is how we sing the dead: from the end. Walk it backwards.”"); return; }
        if (st.tries >= S.tries) { st.over = true; api.store.set("losses", losses + 1); const t = setTimeout(() => api.end({ outcome: "lose", text: stage === 0 ? `${bad} still open on empty drawers. The index keeps its names for now, and the archive closes at dusk.` : TW ? "The bars walk off the sheet a second time. The page goes back in the journal, black where it was black; whatever its censor ruled into it stays unsung." : `${bad} still off the ledges after the retry. Entry logged error; the song keeps its coordinates, and the storm takes the ledge before Mara can sing it a third time.` }), api.reducedMotion ? 0 : 2400); timers.push(t); return; }
        msg(stage === 0 ? `${bad}: not that drawer. ${S.tries - st.tries > 1 ? "Try again; nobody is counting yet." : "One more try."}` : `${bad} lands off the ledges. One free retry.`, true);
        voice(stage === 0 ? "Check each note against the line above it: a note one step too high turns the whole wall by thirty degrees." : "Mara: “You wrote a breath I did not take, or missed one I did. Listen to the weathered bars.”");
      }
    };
    el.querySelectorAll("[data-a]").forEach((b) => on(b, "click", () => { act(b.dataset.a); if (b.dataset.a !== "plot") b.blur(); }));
    renderBars(); drawMap();

    // ---- the neume cards: a legend, and for touch a way to write (note, rest, pitch up and down)
    const CARDS = [["punctum", "One note: writes the pencilled pitch in the slot.", "note"], ["rest", "A rest: one beat, 100 m along the bearing.", "rest"], ["drone", "The drone: interval 0, bearing 0°.", "drone"],
      ["pes", "Pes: one step up, +30°.", "up"], ["clivis", "Clivis: one step down, −30°.", "down"], ["breath", "A breath: a node. Mara's breaths are already on your staff.", null], ["virga", "Virga: one note, held.", null],
      ["scandicus", "Scandicus: two steps up.", null], ["climacus", "Climacus: two steps down.", null], ["torculus", "Torculus: up, then back.", null], ["porrectus", "Porrectus: down, then back.", null],
      ["quilisma", "Quilisma: up slowly; the storm is close.", null], ["clef", "The clef: the line of do. Count intervals from the drone.", null], ["custos", "Custos: where the next line begins.", null]];
    const rail = $("." + P + "rail");
    if (rail) {
      rail.innerHTML = CARDS.filter(([n]) => A.has("neume-" + n)).map(([n, t, k]) => `<button type="button" data-n="${n}" class="${k ? "tool" : ""}" title="${t}" aria-label="${n}. ${t}">${pic("neume-" + n)}</button>`).join("");
      on(rail, "click", (e) => {
        const b = e.target.closest("[data-n]"); if (!b || st.over) return;
        const [, t, k] = CARDS.find((c) => c[0] === b.dataset.n);
        const move = () => { let i = st.cur; do { i = (i + 1) % SONG.length; } while (SONG[i] === "B"); st.cur = i; };
        if (SONG[st.cur] === "B" && k) move();
        if (k === "note") { st.mine[st.cur] = st.pitch; tone(st.pitch, 0.35); st.flashI = st.cur; move(); }
        else if (k === "rest") { st.mine[st.cur] = "r"; st.flashI = st.cur; move(); }
        else if (k === "drone") { st.pitch = 0; st.mine[st.cur] = 0; tone(0, 0.35); st.flashI = st.cur; move(); }
        else if (k === "up") { st.pitch = Math.min(6, st.pitch + 1); tone(st.pitch, 0.25); }
        else if (k === "down") { st.pitch = Math.max(0, st.pitch - 1); tone(st.pitch, 0.25); }
        msg(t); if (k) { renderBars(); progressBeats(); }
      });
    }

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play"><span class="S">S</span><h2>${["Storm-Song Cipher: the index", "Storm-Song Cipher", "Storm-Song Cipher: the fourth song"][stage]}</h2>
      <p class="goal">${["Copy the three lines of the archive index, then plot them: the two breaths are two names.", "Copy Mara’s song, then plot it to find N7 and N8.", "The brief came back barred. Read its ruled bars as a song, then plot it. It is not a storm-song."][stage]}</p>
      <svg viewBox="0 0 300 40" aria-hidden="true">${[0, 2, 4, 6].map((p) => `<line x1="0" x2="300" y1="${34 - p * 4.5}" y2="${34 - p * 4.5}" stroke="${RED}"/>`).join("")}
        <rect x="20" y="${34 - 3 * 4.5 - 4}" width="10" height="8" fill="${INK}"/><text x="40" y="22" font-size="11" fill="${INK}">note: bearing</text>
        <rect x="132" y="10" width="3" height="16" fill="${INK}"/><text x="142" y="22" font-size="11" fill="${INK}">rest: 100 m</text>
        <text x="232" y="16" font-size="18" fill="${RED}">’</text><text x="242" y="22" font-size="11" fill="${INK}">breath: node</text></svg>
      <ul><li><b>tap staff</b>a note on a line or space; below it, a rest</li>
      ${TW ? `<li><b>slide</b>put the page under the staff: a ruled bar’s line is its pitch</li><li><b>tap a bar</b>the gauge: 14 mm of bar is one rest</li><li><b>dirge</b>walks the same path backwards from the mark</li>` : `<li><b>▶ play</b>listen to the ${stage ? "song, or one bar" : "lines"}</li>`}
      <li><b>plot</b>walk the path from ${S.start}; ${S.tries > 2 ? "two free retries" : "one free retry"}</li></ul>
      ${A.has("fig-mara") && stage === 1 ? `<div class="mf">${pic("fig-mara")}<span>“Don't write the words. Write where I breathe.”</span></div>` : ""}
      <button type="button">Begin</button></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); msg(["Book II, the sealed archive at Cinder Reach. The index is not in letters. Three lines of square notes on a red staff, and a table you have only begun to trust.", "Book III, the storm-singing ledge. Mara sings the storm-song once through, the way the Peakborn teach it, and three slots on the old staff have worn away. Mara: “Write where I breathe.”", "Book III, after the audit. The published brief lies beside the bar staff: five black bars where your coordinates were. You have measured one of them already. 41 mm."][stage]); });
    sb.focus();
    return { unmount() { timers.forEach(clearTimeout); playing.forEach(clearTimeout); try { drone && drone.stop(); } catch {} try { ac && ac.close(); } catch {} off.forEach((f) => f()); } };
  }
}

export default {
  mount(root, api) {
    return runStages(root, api, { names: ["The index", "Mara’s song", "The fourth song"], colors: { bg: "#2f4c86", fg: "#e9dcbd", accent: "#c8913a", paper: PAPER, ink: INK }, mount: mountStage });
  },
};

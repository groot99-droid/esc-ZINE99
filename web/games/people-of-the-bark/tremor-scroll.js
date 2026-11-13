// People of the Bark — Tremor Scroll (1D, seismograph drum).
// DESIGN.md 11.5, the summer scroll (c3_scroll): the squirrel lands at dawn on the east face
// (strength 2) and runs down at dusk on the west face (strength 1); on storm days it stays in.
// Ten days are recorded; the forecast days' weather is marked. Fill five forecast cells with a
// face and a strength, or "none", and seal. A forecast is correct when the day-part and face are
// right (or "none" is right); fine when the strength is right too. Four or more correct wins.

const DAYS = 12, FIRST_FORECAST = 11;
const WEATHER = ["sun", "sun", "rain", "storm", "sun", "rain", "sun", "sun", "storm", "rain", "sun", "storm"];
const PARTS = ["dawn", "noon", "dusk"];
const FACES = { E: { name: "east", ang: 0 }, S: { name: "south", ang: 90 }, W: { name: "west", ang: 180 }, N: { name: "north", ang: 270 } };
const truth = (day, part) => {
  if (WEATHER[day - 1] === "storm") return null;
  if (part === "dawn") return { face: "E", s: 2 };
  if (part === "dusk") return { face: "W", s: 1 };
  return null;
};
const CELLS = [[11, "dawn"], [11, "noon"], [11, "dusk"], [12, "dawn"], [12, "dusk"]];
const TRACE = "#efe2c4", GOLD = "#f0c050", AMBER = "#d9902a", RED = "#b8402a", LIME = "#c4d65a", DRUM = "#141010";

export default {
  mount(root, api) {
    const P = "people-of-the-bark-tremor-scroll-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    let raf = 0;

    const guess = CELLS.map(() => null); // null = unset, {none:true} or {face, s}
    let cur = 0, sealed = false, revealT = 0;

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;background:linear-gradient(90deg,#2e2016,#3a281c 50%,#2e2016);color:#efe2c4;font-family:'Cormorant Garamond',Georgia,serif}
.${P}page{box-sizing:border-box;max-width:1100px;margin:0 auto;padding:12px clamp(10px,3vw,30px) 20px;display:flex;flex-direction:column;gap:10px;min-height:100%}
.${P}page svg{width:100%;display:block;max-height:calc(100vh - 230px);min-height:340px}
.${P}cell{cursor:pointer}
.${P}panel{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:center;background:#efe2c4;color:#2e2016;padding:10px 14px;border:1px solid #c9b99a}
.${P}panel .${P}lab{font:12px ui-monospace,monospace;letter-spacing:.12em;min-width:150px;text-align:center}
.${P}grp{display:flex;gap:4px;flex-wrap:wrap}
.${P}b{font:13px ui-monospace,monospace;min-width:40px;min-height:36px;border:1px solid #2e2016;background:transparent;color:#2e2016;cursor:pointer;padding:4px 8px}
.${P}b[aria-pressed=true]{background:#2e2016;color:#efe2c4}
.${P}seal{font-family:'IM Fell English',Georgia,serif;font-size:18px;background:${RED};color:#efe2c4;border:0;padding:8px 14px;cursor:pointer}
.${P}seal:disabled{opacity:.4;cursor:default}
.${P}fenn{font-style:italic;font-size:16px;color:#d8c8a4;text-align:center;min-height:1.3em}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,16,16,.9);z-index:4;padding:16px}
.${P}intro div{max-width:480px;border:1px solid #c9b99a;background:#efe2c4;color:#2e2016;padding:20px 22px}
.${P}intro h2{margin:0 0 6px;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px}
.${P}intro p{margin:0 0 10px;font-size:18px;line-height:1.35}
</style>
<div class="${P}page">
 <svg viewBox="0 0 820 560" aria-label="The Tremor Scroll"></svg>
 <div class="${P}fenn" aria-live="polite"></div>
 <div class="${P}panel">
  <span class="${P}lab"></span>
  <div class="${P}grp ${P}faces"><button class="${P}b" data-f="none">none</button><button class="${P}b" data-f="E">E →</button><button class="${P}b" data-f="S">S ↓</button><button class="${P}b" data-f="W">W ←</button><button class="${P}b" data-f="N">N ↑</button></div>
  <div class="${P}grp ${P}str"><button class="${P}b" data-s="1">1</button><button class="${P}b" data-s="2">2</button><button class="${P}b" data-s="3">3</button></div>
  <button class="${P}seal" type="button" disabled>Seal the forecast</button>
 </div>
</div>
<div class="${P}intro"><div>
 <h2>Tremor Scroll</h2>
 <p>The Scroll House drum: one scratched line per day, with tremors at dawn, noon and dusk. Each burst has a <b>face</b> (the arrow and letter) and a <b>strength</b> (its height, 1 to 3).</p>
 <p>Read the pattern and forecast the five blank cells at the bottom: a face and strength, or <b>none</b>. Weather is marked on the left. Four right and the scholars are vindicated.</p>
 <button class="${P}seal" type="button">Unroll the scroll</button>
</div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg");
    const lab = wrap.querySelector("." + P + "lab"), fenn = wrap.querySelector("." + P + "fenn"), sealBtn = wrap.querySelector(`.${P}panel .${P}seal`);
    const X0 = 120, X1 = 760, XP = { dawn: 250, noon: 440, dusk: 630 }, Y0 = 62, DY = 38;
    const Yd = (d) => Y0 + (d - 1) * DY;
    const jit = api.rng(41);
    const jitter = Array.from({ length: DAYS }, () => Array.from({ length: 140 }, () => (jit() - 0.5) * 1.6));

    function trace(day, upto = 1) {
      // a scratched line with bursts where tremors fell
      const y = Yd(day), pts = [];
      const bursts = PARTS.map((p) => ({ x: XP[p], t: truth(day, p) })).filter((b) => b.t);
      for (let i = 0; i <= 139; i++) {
        const x = X0 + (X1 - X0) * i / 139;
        if ((x - X0) / (X1 - X0) > upto) break;
        let dy = jitter[day - 1][i];
        for (const b of bursts) { const d = Math.abs(x - b.x); if (d < 30) dy += Math.sin(i * 2.6) * (b.t.s * 5.5) * (1 - d / 30); }
        pts.push(`${x.toFixed(1)},${(y + dy).toFixed(1)}`);
      }
      let s = pts.length > 1 ? `<polyline points="${pts.join(" ")}" fill="none" stroke="${TRACE}" stroke-width="1.2" opacity=".9"/>` : "";
      for (const b of bursts) if ((b.x - X0) / (X1 - X0) <= upto) s += faceMark(b.x + 34, y, b.t.face, TRACE);
      return s;
    }
    function faceMark(x, y, face, col) {
      const a = FACES[face].ang;
      return `<g transform="translate(${x} ${y - 9})"><g transform="rotate(${a})"><path d="M-6 0 H5 M2 -3 L6 0 L2 3" stroke="${col}" stroke-width="1.4" fill="none"/></g><text x="10" y="4" font-family="ui-monospace,monospace" font-size="10" fill="${col}">${face}</text></g>`;
    }
    function weather(d) {
      const w = WEATHER[d - 1], y = Yd(d), x = 92;
      if (w === "sun") return `<g transform="translate(${x} ${y})" stroke="#c9b99a" fill="none" stroke-width="1.3"><circle r="4"/>${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M0 -6 V-9" transform="rotate(${a})"/>`).join("")}</g>`;
      if (w === "rain") return `<g transform="translate(${x} ${y})" fill="#6f9ab8"><path d="M-4 -6 q3 4 0 6 q-3 -2 0 -6Z"/><path d="M4 -2 q3 4 0 6 q-3 -2 0 -6Z"/></g>`;
      return `<g transform="translate(${x} ${y})"><path d="M-6 -8 L1 -1 L-3 0 L4 8" stroke="${GOLD}" stroke-width="1.6" fill="none"/></g>`;
    }
    function glyphFor(gs, x, y, col) {
      if (!gs) return `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="IM Fell English,serif" font-size="18" fill="${col}" opacity=".6">?</text>`;
      if (gs.none) return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" fill="${col}">∅</text>`;
      const amp = gs.s * 4;
      return `<path d="M${x - 22} ${y} ${Array.from({ length: 9 }, (_, i) => `L${x - 16 + i * 4} ${y + (i % 2 ? -amp : amp) * (1 - Math.abs(i - 4) / 5)}`).join(" ")} L${x + 22} ${y}" stroke="${col}" stroke-width="1.4" fill="none"/>` + faceMark(x + 30, y, gs.face, col);
    }

    function draw() {
      let s = `<defs><linearGradient id="${P}dr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2a2222"/><stop offset=".12" stop-color="${DRUM}"/><stop offset=".88" stop-color="${DRUM}"/><stop offset="1" stop-color="#2a2222"/></linearGradient>
<radialGradient id="${P}soot" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient></defs>
<rect x="56" y="30" width="740" height="${DY * DAYS + 50}" rx="10" fill="url(#${P}dr)"/><rect x="56" y="30" width="740" height="${DY * DAYS + 50}" rx="10" fill="url(#${P}soot)"/>
<rect x="44" y="24" width="14" height="${DY * DAYS + 62}" rx="6" fill="#5a3d2b"/><rect x="794" y="24" width="14" height="${DY * DAYS + 62}" rx="6" fill="#5a3d2b"/>`;
      for (const p of PARTS) s += `<text x="${XP[p]}" y="22" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" letter-spacing="3" fill="#c9b99a">${p.toUpperCase()}</text><line x1="${XP[p]}" y1="40" x2="${XP[p]}" y2="${Yd(DAYS) + 22}" stroke="#c9b99a" stroke-width=".5" opacity=".18"/>`;
      for (let d = 1; d <= DAYS; d++) {
        s += weather(d) + `<text x="812" y="${Yd(d) + 4}" font-family="ui-monospace,monospace" font-size="10" fill="#c9b99a">${String(d).padStart(2, "0")}</text>`;
        if (d < FIRST_FORECAST) s += trace(d);
        else if (sealed) s += trace(d, Math.min(1, Math.max(0, revealT * 2 - (d - FIRST_FORECAST))));
        else s += `<line x1="${X0}" y1="${Yd(d)}" x2="${X1}" y2="${Yd(d)}" stroke="${TRACE}" stroke-width="1" stroke-dasharray="2 5" opacity=".4"/>`;
      }
      s += `<line x1="64" y1="${Yd(FIRST_FORECAST) - DY / 2}" x2="788" y2="${Yd(FIRST_FORECAST) - DY / 2}" stroke="${AMBER}" stroke-width="1" stroke-dasharray="6 4"/>
<text x="70" y="${Yd(FIRST_FORECAST) - DY / 2 - 5}" font-family="ui-monospace,monospace" font-size="9" letter-spacing="2" fill="${AMBER}">FORECAST</text>`;
      // forecast cells
      CELLS.forEach(([d, p], i) => {
        const x = XP[p], y = Yd(d);
        const t = truth(d, p), gs = guess[i];
        let verdict = "";
        if (sealed && revealT >= 1) {
          const ok = gs && (gs.none ? !t : t && gs.face === t.face);
          verdict = `<text x="${x - 54}" y="${y + 5}" font-family="ui-monospace,monospace" font-size="15" fill="${ok ? LIME : RED}">${ok ? "✓" : "✗"}</text>`;
        }
        s += `<g class="${P}cell" data-i="${i}" tabindex="0" role="button" aria-label="Day ${d} ${p}"><rect x="${x - 40}" y="${y - 17}" width="80" height="34" rx="4" fill="${i === cur && !sealed ? "rgba(240,192,80,.18)" : "rgba(239,226,196,.05)"}" stroke="${i === cur && !sealed ? GOLD : "#7d6c5a"}" stroke-width="${i === cur && !sealed ? 2 : 1}"/>${sealed ? "" : glyphFor(gs, x, y, GOLD)}</g>${verdict}`;
        if (sealed) s += `<g opacity=".55">${glyphFor(gs, x, y + 12, GOLD)}</g>`;
      });
      // the stylus arm
      const ty = sealed && revealT < 1 ? Yd(FIRST_FORECAST + Math.min(1, Math.floor(revealT * 2))) : Yd(DAYS) + 26;
      const tx = sealed && revealT < 1 ? X0 + (X1 - X0) * ((revealT * 2) % 1) : X0 - 12;
      s += `<line x1="430" y1="4" x2="${tx}" y2="${ty}" stroke="${AMBER}" stroke-width="3" stroke-linecap="round"/><circle cx="430" cy="6" r="7" fill="#5a3d2b" stroke="${AMBER}"/>`;
      svg.innerHTML = s;
      svg.querySelectorAll("." + P + "cell").forEach((el) => {
        el.addEventListener("click", () => { if (!sealed) { cur = +el.dataset.i; panel(); draw(); } });
      });
    }
    function panel() {
      const [d, p] = CELLS[cur], gs = guess[cur];
      lab.textContent = `DAY ${d} · ${p.toUpperCase()} · ${WEATHER[d - 1].toUpperCase()}`;
      wrap.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(!!gs && (gs.none ? b.dataset.f === "none" : b.dataset.f === gs.face))));
      wrap.querySelectorAll("[data-s]").forEach((b) => { b.setAttribute("aria-pressed", String(!!gs && !gs.none && gs.s === +b.dataset.s)); b.disabled = !gs || !!gs.none; });
      sealBtn.disabled = sealed || guess.some((g) => !g);
    }
    function setFace(f) {
      if (sealed) return;
      if (f === "none") guess[cur] = { none: true };
      else guess[cur] = { face: f, s: guess[cur] && !guess[cur].none ? guess[cur].s : 1 };
      panel(); draw();
    }
    function setStr(s) { if (sealed || !guess[cur] || guess[cur].none) return; guess[cur].s = s; panel(); draw(); }
    wrap.querySelectorAll("[data-f]").forEach((b) => on(b, "click", () => setFace(b.dataset.f)));
    wrap.querySelectorAll("[data-s]").forEach((b) => on(b, "click", () => setStr(+b.dataset.s)));
    on(window, "keydown", (e) => {
      if (sealed || wrap.querySelector("." + P + "intro")) return;
      const k = e.key.toUpperCase();
      if (["E", "S", "W", "N"].includes(k)) setFace(k);
      else if (k === "0" || k === "X") setFace("none");
      else if (["1", "2", "3"].includes(k)) setStr(+k);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); cur = (cur + 1) % CELLS.length; panel(); draw(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); cur = (cur + CELLS.length - 1) % CELLS.length; panel(); draw(); }
      else if (e.key === "Enter" && !sealBtn.disabled) seal();
    });

    function seal() {
      if (sealed || guess.some((g) => !g)) return;
      sealed = true; panel();
      fenn.textContent = "Fenn holds the lamp while the drum turns.";
      const t0 = performance.now(), dur = api.reducedMotion ? 1 : 2600;
      const step = (now) => {
        revealT = Math.min(1, (now - t0) / dur);
        draw();
        if (revealT < 1) raf = requestAnimationFrame(step); else finish();
      };
      raf = requestAnimationFrame(step);
    }
    function finish() {
      let correct = 0, fine = 0;
      CELLS.forEach(([d, p], i) => {
        const t = truth(d, p), gs = guess[i];
        if (gs.none ? !t : t && gs.face === t.face) { correct++; if (!gs.none && t.s === gs.s) fine++; }
      });
      const scholars = correct * 2 + fine;
      api.store.set("correct", correct);
      fenn.textContent = correct >= 4 ? "Fenn, quietly: “It keeps hours. Like us.”" : "Fenn turns the drum back and reads it again.";
      timers.push(setTimeout(() => api.end(correct >= 4
        ? { outcome: "win", text: `${correct} of 5 forecasts correct, ${fine} of them fine. The Scroll House +${scholars}. The scholars now know the shape of the morning, though not what makes it.` }
        : { outcome: "lose", text: `${correct} of 5 forecasts correct${fine ? `, ${fine} fine` : ""}. The Scroll House +${scholars}. The pattern was there: east at dawn, west at dusk, nothing on storm days.` }), 1100));
    }
    on(sealBtn, "click", seal);
    const startBtn = wrap.querySelector(`.${P}intro .${P}seal`);
    on(startBtn, "click", () => { wrap.querySelector("." + P + "intro").remove(); fenn.textContent = "Fenn's note in the margin: “Look at the dawns first.”"; });
    startBtn.focus();
    draw(); panel();

    return { unmount() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); wrap.remove(); } };
  },
};

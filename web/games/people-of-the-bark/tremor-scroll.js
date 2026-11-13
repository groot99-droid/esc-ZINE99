// People of the Bark — Tremor Scroll (1D, seismograph drum).
// DESIGN.md 11.5, two appearances played as one sitting at the Scroll House drum:
//   Summer (c3_scroll): dawn east 2, dusk west 1 (running down); none on storm days. 3 forecasts.
//   Autumn (c4_scroll): caching. Dawn east 2, noon north 3, dusk west 1. On rain days only noon.
//                       Every fourth day, no dusk (it stays at the cache). 6 forecasts.
// A forecast is correct when the day-part and face are right (or "none" is right); fine when the
// strength is right too. Six of the nine correct and the scholars are vindicated.
// Actions: mark a cell (face and strength, or none); Fenn's lamp (3 uses) lights every recorded day
// with the same weather as the chosen forecast day; seal a page of forecasts. After two lost
// sittings, Fenn underlines what each column usually holds (DESIGN 11.5 hints, standing 40+).

const PARTS = ["dawn", "noon", "dusk"];
const FACES = { E: { name: "east", ang: 0 }, S: { name: "south", ang: 90 }, W: { name: "west", ang: 180 }, N: { name: "north", ang: 270 } };
const PHASES = [
  {
    key: "summer", title: "SUMMER", days: 12, first: 11,
    weather: ["sun", "sun", "rain", "storm", "sun", "rain", "sun", "sun", "storm", "rain", "sun", "storm"],
    truth(day, part) {
      if (this.weather[day - 1] === "storm") return null;
      if (part === "dawn") return { face: "E", s: 2 };
      if (part === "dusk") return { face: "W", s: 1 };
      return null;
    },
    cells: [[11, "dawn"], [11, "dusk"], [12, "dawn"]],
  },
  {
    key: "autumn", title: "AUTUMN", days: 16, first: 15,
    weather: ["sun", "rain", "sun", "sun", "rain", "sun", "sun", "sun", "rain", "sun", "rain", "sun", "sun", "sun", "rain", "sun"],
    truth(day, part) {
      const w = this.weather[day - 1];
      if (part === "noon") return { face: "N", s: 3 };
      if (w === "rain") return null;
      if (part === "dawn") return { face: "E", s: 2 };
      if (part === "dusk") return day % 4 === 0 ? null : { face: "W", s: 1 };
      return null;
    },
    cells: [[15, "dawn"], [15, "noon"], [15, "dusk"], [16, "dawn"], [16, "noon"], [16, "dusk"]],
  },
];
const WIN_AT = 6;
const TRACE = "#efe2c4", GOLD = "#f0c050", AMBER = "#d9902a", RED = "#e0573a", LIME = "#c4d65a", MUTED = "#c9b99a", DRUM = "#141010";

export default {
  mount(root, api) {
    const P = "people-of-the-bark-tremor-scroll-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    let raf = 0;
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;

    let ph = 0, guess = [], cur = 0, sealed = false, revealT = 0, lamps = 3, lampDay = null, marks = 0;
    const tally = { correct: 0, fine: 0, made: 0 };
    const results = []; // per phase: [{ok, fine}]
    const phase = () => PHASES[ph];
    const startPhase = (i) => { ph = i; guess = phase().cells.map(() => null); cur = 0; sealed = false; revealT = 0; lampDay = null; marks = 0; };
    startPhase(0);

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;background:
 radial-gradient(ellipse at 50% 0%,rgba(217,144,42,.10),transparent 60%),
 repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 2px,transparent 2px 9px),
 linear-gradient(90deg,#24180f,#3a281c 50%,#24180f);color:#efe2c4;font-family:'Cormorant Garamond',Georgia,serif}
.${P}page{box-sizing:border-box;max-width:1120px;margin:0 auto;padding:10px 16px 18px;display:flex;flex-direction:column;gap:8px;min-height:100%}
.${P}top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.${P}ttl{font-family:'IM Fell English',Georgia,serif;font-size:22px;letter-spacing:.06em}
.${P}ttl small{font:13px ui-monospace,monospace;letter-spacing:.16em;color:${MUTED};margin-left:8px}
.${P}score{font:13px ui-monospace,monospace;letter-spacing:.1em;color:${MUTED}}
.${P}score b{color:${GOLD};font-weight:400}
.${P}page>svg{width:100%;display:block;max-height:calc(100vh - 250px);min-height:300px}
.${P}cell{cursor:pointer}
.${P}cell:hover rect{stroke:${GOLD}}
.${P}cell:focus{outline:none}
.${P}cell:focus rect{stroke:${LIME};stroke-width:2.5}
.${P}fenn{font-style:italic;font-size:17px;line-height:1.35;color:#f3e4c0;text-align:center;min-height:1.4em;padding:0 8px}
.${P}fenn b{font-style:normal;font:12px ui-monospace,monospace;letter-spacing:.14em;color:${LIME};margin-right:6px}
.${P}panel{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;justify-content:center;color:#2e2016;padding:10px 12px;border:1px solid #c9b99a;
 background:linear-gradient(180deg,#f3e7cb,#e7d6b0);box-shadow:0 2px 0 #1b120c}
.${P}lab{font:14px ui-monospace,monospace;letter-spacing:.1em;min-width:170px;text-align:center}
.${P}lab small{display:block;font-size:12px;color:#7a5a40;letter-spacing:.06em}
.${P}grp{display:flex;gap:4px;flex-wrap:wrap;justify-content:center}
.${P}b{font:14px ui-monospace,monospace;min-width:44px;min-height:40px;border:1px solid #2e2016;background:rgba(255,255,255,.35);color:#2e2016;cursor:pointer;padding:4px 8px;border-radius:2px}
.${P}b:hover:not(:disabled){background:#fff6dc}
.${P}b[aria-pressed=true]{background:#2e2016;color:#efe2c4}
.${P}b:disabled{opacity:.35;cursor:default}
.${P}b:focus-visible,.${P}seal:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}lamp{border-color:${AMBER}}
.${P}seal{font-family:'IM Fell English',Georgia,serif;font-size:19px;background:#b8402a;color:#efe2c4;border:0;padding:8px 16px;cursor:pointer;border-radius:2px;min-height:42px}
.${P}seal:disabled{opacity:.45;cursor:default}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(14,10,8,.9);z-index:4;padding:16px;overflow:auto}
.${P}slip{max-width:470px;width:100%;box-sizing:border-box;background:${DRUM};color:#efe2c4;padding:20px 22px 18px;border:1px solid #5a3d2b;
 box-shadow:0 0 0 6px #2a1d14,0 0 0 7px #7a5a40;position:relative}
.${P}slip svg{display:block;width:100%;height:34px;margin:2px 0 8px}
.${P}slip h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;letter-spacing:.04em}
.${P}slip .${P}beat{font-style:italic;font-size:17px;line-height:1.4;color:#e9d6ae;margin:6px 0 10px}
.${P}slip .${P}goal{font-size:18px;line-height:1.35;margin:0 0 10px;border-top:1px dashed #7d6c5a;padding-top:10px}
.${P}key{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:16px;line-height:1.3;margin:0 0 14px}
.${P}key kbd{font:13px ui-monospace,monospace;color:${GOLD};border:1px solid #7d6c5a;padding:2px 6px;border-radius:2px;white-space:nowrap;align-self:start}
@keyframes ${P}pop{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes ${P}shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.${P}bump{animation:${P}pop .35s}
.${P}no{animation:${P}shake .3s}
@media (max-width:560px){.${P}lab{min-width:0;width:100%}.${P}ttl{font-size:19px}.${P}page>svg{max-height:none}}
@media (prefers-reduced-motion:reduce){.${P}bump,.${P}no{animation:none}}
</style>
<div class="${P}page">
 <div class="${P}top"><div class="${P}ttl">The Tremor Scroll<small></small></div><div class="${P}score" aria-live="polite"></div></div>
 <svg aria-label="The Tremor Scroll"></svg>
 <div class="${P}fenn" aria-live="polite"></div>
 <div class="${P}panel">
  <span class="${P}lab"></span>
  <div class="${P}grp"><button class="${P}b" data-f="none" type="button" title="no tremor (0)">none</button><button class="${P}b" data-f="E" type="button">E →</button><button class="${P}b" data-f="S" type="button">S ↓</button><button class="${P}b" data-f="W" type="button">W ←</button><button class="${P}b" data-f="N" type="button">N ↑</button></div>
  <div class="${P}grp"><button class="${P}b" data-s="1" type="button">1</button><button class="${P}b" data-s="2" type="button">2</button><button class="${P}b" data-s="3" type="button">3</button></div>
  <button class="${P}b ${P}lamp" type="button" title="Fenn's lamp (L)"></button>
  <button class="${P}seal" type="button" disabled>Seal the forecast</button>
 </div>
</div>
<div class="${P}intro"><div class="${P}slip" role="dialog" aria-label="How to play">
 <h2>Tremor Scroll</h2>
 <svg viewBox="0 0 400 34" aria-hidden="true"><path d="M0 17 H120 l4 -9 l4 18 l4 -14 l4 10 l4 -5 H260 l3 -4 l3 8 l3 -4 H400" fill="none" stroke="${TRACE}" stroke-width="1.4"/></svg>
 <p class="${P}beat">The Scroll House, summer. Fenn has not slept. The drum has a line for every day the world shook, and the Battlements want to know when it will shake next.</p>
 <p class="${P}goal"><b>Goal:</b> forecast the blank cells. ${WIN_AT} of 9 right over two seasons and the scholars are believed.</p>
 <div class="${P}key">
  <kbd>tap a cell</kbd><span>pick it (or <b>← →</b>)</span>
  <kbd>E S W N · 0</kbd><span>the face it will shake from, or none</span>
  <kbd>1 2 3</kbd><span>its strength: the height of the burst</span>
 </div>
 <button class="${P}seal" type="button">Unroll the scroll</button>
</div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const svg = wrap.querySelector(`.${P}page>svg`);
    const lab = $("lab"), fenn = $("fenn"), sealBtn = wrap.querySelector(`.${P}panel .${P}seal`), lampBtn = $("lamp"), scoreEl = $("score"), sub = wrap.querySelector(`.${P}ttl small`);
    const say = (who, text) => { fenn.innerHTML = (who ? `<b>${who}</b>` : "") + text; };

    // geometry: a wide drum, or a narrow one for phones
    let G = null;
    function geom() {
      const narrow = wrap.getBoundingClientRect().width < 640;
      const VW = narrow ? 440 : 860;
      const X0 = narrow ? 52 : 112, X1 = VW - (narrow ? 36 : 70);
      const span = X1 - X0;
      G = { narrow, VW, X0, X1, XP: { dawn: X0 + span * 0.2, noon: X0 + span * 0.5, dusk: X0 + span * 0.8 }, Y0: 58, DY: narrow ? 34 : 33, F: narrow ? 13 : 13, CW: narrow ? 70 : 92 };
    }
    geom();
    const Yd = (d) => G.Y0 + (d - 1) * G.DY;
    const jit = api.rng(41);
    const jitter = Array.from({ length: 16 }, () => Array.from({ length: 160 }, () => (jit() - 0.5) * 1.6));

    function faceMark(x, y, face, col, size = 1) {
      const a = FACES[face].ang;
      return `<g transform="translate(${x} ${y - 10})"><g transform="rotate(${a}) scale(${size})"><path d="M-6 0 H5 M2 -3.5 L6 0 L2 3.5" stroke="${col}" stroke-width="1.6" fill="none"/></g><text x="9" y="4.5" font-family="ui-monospace,monospace" font-size="${G.F}" fill="${col}">${face}</text></g>`;
    }
    function trace(day, upto = 1, lit = false) {
      const y = Yd(day), pts = [];
      const bursts = PARTS.map((p) => ({ x: G.XP[p], t: phase().truth(day, p) })).filter((b) => b.t);
      const n = 159;
      for (let i = 0; i <= n; i++) {
        const x = G.X0 + (G.X1 - G.X0) * i / n;
        if ((x - G.X0) / (G.X1 - G.X0) > upto) break;
        let dy = jitter[day - 1][i];
        const reach = G.narrow ? 18 : 30;
        for (const b of bursts) { const d = Math.abs(x - b.x); if (d < reach) dy += Math.sin(i * 2.6) * (b.t.s * 4.6) * (1 - d / reach); }
        pts.push(`${x.toFixed(1)},${(y + dy).toFixed(1)}`);
      }
      let s = pts.length > 1 ? `<polyline points="${pts.join(" ")}" fill="none" stroke="${lit ? GOLD : TRACE}" stroke-width="${lit ? 1.6 : 1.2}" opacity="${lit ? 1 : 0.88}"/>` : "";
      for (const b of bursts) if ((b.x - G.X0) / (G.X1 - G.X0) <= upto) s += faceMark(b.x + (G.narrow ? 14 : 30), y, b.t.face, lit ? GOLD : TRACE, G.narrow ? 0.8 : 1);
      return s;
    }
    function weather(d) {
      const w = phase().weather[d - 1], y = Yd(d), x = G.narrow ? 20 : 84;
      if (w === "sun") return `<g transform="translate(${x} ${y})" stroke="#e7d6b0" fill="none" stroke-width="1.4"><circle r="4.5"/>${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M0 -7 V-10" transform="rotate(${a})"/>`).join("")}</g>`;
      if (w === "rain") return `<g transform="translate(${x} ${y})" fill="#8ab4d4"><path d="M-4 -7 q3 4.5 0 7 q-3 -2.5 0 -7Z"/><path d="M4 -2 q3 4.5 0 7 q-3 -2.5 0 -7Z"/></g>`;
      return `<g transform="translate(${x} ${y})"><path d="M-5 -10 L2 -1 L-3 0 L4 10" stroke="${GOLD}" stroke-width="1.8" fill="none"/></g>`;
    }
    function glyphFor(gs, x, y, col) {
      if (!gs) return `<text x="${x}" y="${y + 6}" text-anchor="middle" font-family="IM Fell English,serif" font-size="19" fill="${col}" opacity=".7">?</text>`;
      if (gs.none) return `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="15" fill="${col}">∅</text>`;
      const amp = gs.s * 3.6, w = G.narrow ? 12 : 18;
      return `<path d="M${x - w - 4} ${y} ${Array.from({ length: 7 }, (_, i) => `L${x - w + i * (w / 3)} ${y + (i % 2 ? -amp : amp) * (1 - Math.abs(i - 3) / 4)}`).join(" ")} L${x + w + 4} ${y}" stroke="${col}" stroke-width="1.6" fill="none"/>` + faceMark(x + w + (G.narrow ? 0 : 6), y, gs.face, col, 0.8);
    }
    const ok = (gs, t) => !!gs && (gs.none ? !t : !!t && gs.face === t.face);
    // the most common entry per column in the record (gentle hint)
    function usual(part) {
      const c = {};
      for (let d = 1; d < phase().first; d++) { const t = phase().truth(d, part); const k = t ? t.face + t.s : "none"; c[k] = (c[k] || 0) + 1; }
      return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    }

    function draw() {
      const PH = phase(), H = G.DY * PH.days + 60;
      svg.setAttribute("viewBox", `0 0 ${G.VW} ${H + 30}`);
      const L = G.narrow ? 8 : 52, R = G.VW - (G.narrow ? 8 : 40);
      let s = `<defs><linearGradient id="${P}dr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2c2420"/><stop offset=".1" stop-color="${DRUM}"/><stop offset=".9" stop-color="${DRUM}"/><stop offset="1" stop-color="#2c2420"/></linearGradient>
<filter id="${P}soot" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  0 0 0 .07 0"/></filter></defs>
<rect x="${L}" y="30" width="${R - L}" height="${H - 8}" rx="10" fill="url(#${P}dr)"/><rect x="${L}" y="30" width="${R - L}" height="${H - 8}" rx="10" filter="url(#${P}soot)"/>
<rect x="${L - 10}" y="24" width="12" height="${H + 4}" rx="5" fill="#6b4a33"/><rect x="${R - 2}" y="24" width="12" height="${H + 4}" rx="5" fill="#6b4a33"/>`;
      for (const p of PARTS) {
        s += `<text x="${G.XP[p]}" y="20" text-anchor="middle" font-family="ui-monospace,monospace" font-size="${G.F}" letter-spacing="3" fill="${MUTED}">${p.toUpperCase()}</text><line x1="${G.XP[p]}" y1="38" x2="${G.XP[p]}" y2="${Yd(PH.days) + 20}" stroke="${MUTED}" stroke-width=".6" opacity=".2"/>`;
        if (gentle) s += `<text x="${G.XP[p]}" y="${Yd(PH.first) - G.DY / 2 - 4}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="${G.F - 1}" fill="${LIME}">usually ${usual(p).replace("none", "∅")}</text>`;
      }
      const sameW = lampDay ? PH.weather[lampDay - 1] : null;
      for (let d = 1; d <= PH.days; d++) {
        const lit = sameW && d < PH.first && PH.weather[d - 1] === sameW;
        if (lit) s += `<rect x="${L + 4}" y="${Yd(d) - G.DY / 2 + 2}" width="${R - L - 8}" height="${G.DY - 4}" rx="4" fill="${GOLD}" opacity=".12"/>`;
        s += weather(d) + `<text x="${G.narrow ? G.VW - 30 : R + 14}" y="${Yd(d) + 4}" font-family="ui-monospace,monospace" font-size="${G.narrow ? 11 : 12}" fill="${MUTED}" ${G.narrow ? 'text-anchor="start"' : ""}>${G.narrow ? "" : String(d).padStart(2, "0")}</text>`;
        if (G.narrow) s += `<text x="${L + 22}" y="${Yd(d) + 4}" font-family="ui-monospace,monospace" font-size="11" fill="${MUTED}">${String(d).padStart(2, "0")}</text>`;
        if (d < PH.first) s += trace(d, 1, lit);
        else if (sealed) s += trace(d, Math.min(1, Math.max(0, revealT * 2 - (d - PH.first))));
        else s += `<line x1="${G.X0}" y1="${Yd(d)}" x2="${G.X1}" y2="${Yd(d)}" stroke="${TRACE}" stroke-width="1" stroke-dasharray="2 5" opacity=".4"/>`;
      }
      s += `<line x1="${L + 8}" y1="${Yd(PH.first) - G.DY / 2}" x2="${R - 8}" y2="${Yd(PH.first) - G.DY / 2}" stroke="${AMBER}" stroke-width="1.2" stroke-dasharray="6 4"/>
${G.narrow ? "" : `<text x="${R - 12}" y="${Yd(PH.first) - G.DY / 2 + 13}" text-anchor="end" font-family="ui-monospace,monospace" font-size="${G.F - 2}" letter-spacing="2" fill="${AMBER}">FORECAST</text>`}`;
      PH.cells.forEach(([d, p], i) => {
        const x = G.XP[p], y = Yd(d), t = PH.truth(d, p), gs = guess[i], sel = i === cur && !sealed;
        let verdict = "";
        if (sealed && revealT >= 1) {
          const good = ok(gs, t);
          verdict = `<g class="${P}bump" style="transform-box:fill-box;transform-origin:center"><circle cx="${x - G.CW / 2 - 12}" cy="${y}" r="10" fill="${good ? LIME : RED}"/><text x="${x - G.CW / 2 - 12}" y="${y + 5}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="14" fill="${DRUM}">${good ? "✓" : "✗"}</text></g>`;
        }
        s += `<g class="${P}cell" data-i="${i}" tabindex="${sealed ? -1 : 0}" role="button" aria-label="Day ${d} ${p}${gs ? (gs.none ? ", none" : `, ${FACES[gs.face].name} ${gs.s}`) : ", blank"}"><rect x="${x - G.CW / 2}" y="${y - 15}" width="${G.CW}" height="30" rx="4" fill="${sel ? "rgba(240,192,80,.22)" : "rgba(239,226,196,.06)"}" stroke="${sel ? GOLD : "#8a7864"}" stroke-width="${sel ? 2.2 : 1}"/>${sealed ? "" : glyphFor(gs, x, y, sel ? GOLD : "#e7d6b0")}</g>${verdict}`;
        if (sealed) s += `<g opacity=".6">${glyphFor(gs, x, y + 11, GOLD)}</g>`;
      });
      // the stylus arm: parked at the side until the drum turns
      const pivot = G.narrow ? G.VW - 14 : R + 30;
      const ty = sealed && revealT < 1 ? Yd(PH.first + Math.min(PH.days - PH.first, Math.floor(revealT * 2))) : Yd(PH.days) + 18;
      const tx = sealed && revealT < 1 ? G.X0 + (G.X1 - G.X0) * ((revealT * 2) % 1) : G.X1 + 4;
      s += `<line x1="${pivot}" y1="6" x2="${tx}" y2="${ty}" stroke="${AMBER}" stroke-width="3" stroke-linecap="round" opacity="${sealed && revealT < 1 ? 1 : 0.55}"/><circle cx="${pivot}" cy="8" r="7" fill="#5a3d2b" stroke="${AMBER}"/>`;
      svg.innerHTML = s;
      svg.querySelectorAll("." + P + "cell").forEach((el) => {
        el.addEventListener("click", () => pick(+el.dataset.i));
        el.addEventListener("keydown", (e) => { if (e.key === " ") { e.preventDefault(); pick(+el.dataset.i); } });
      });
    }
    function pick(i) {
      if (sealed) return;
      cur = i; panel(); draw();
      const c = svg.querySelector(`[data-i="${i}"]`); c && c.focus({ preventScroll: true });
    }
    function panel() {
      const PH = phase(), [d, p] = PH.cells[cur], gs = guess[cur];
      lab.innerHTML = `DAY ${d} · ${p.toUpperCase()}<small>${PH.weather[d - 1]} · cell ${cur + 1} of ${PH.cells.length}</small>`;
      wrap.querySelectorAll("[data-f]").forEach((b) => { b.setAttribute("aria-pressed", String(!!gs && (gs.none ? b.dataset.f === "none" : b.dataset.f === gs.face))); b.disabled = sealed; });
      wrap.querySelectorAll("[data-s]").forEach((b) => { b.setAttribute("aria-pressed", String(!!gs && !gs.none && gs.s === +b.dataset.s)); b.disabled = sealed || !gs || !!gs.none; });
      lampBtn.textContent = `lamp · ${lamps}`;
      lampBtn.disabled = sealed || lamps <= 0;
      const left = guess.filter((g) => !g).length;
      sealBtn.disabled = sealed || left > 0;
      sealBtn.textContent = left ? `${left} blank` : "Seal the forecast";
      sub.textContent = `${PH.title} · ${PH.cells.length} forecasts`;
      scoreEl.innerHTML = `correct <b>${tally.correct}</b> / ${tally.made} · need ${WIN_AT} of 9`;
    }
    function flash(el, cls) { if (!el || api.reducedMotion) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
    function setFace(f) {
      if (sealed) return;
      const was = guess[cur];
      if (f === "none") guess[cur] = { none: true };
      else guess[cur] = { face: f, s: was && !was.none ? was.s : 1 };
      if (!was) onMarked();
      panel(); draw();
      flash(wrap.querySelector(`[data-f="${f}"]`), P + "bump");
      // move on to the next blank cell once a none is set (a face still wants its strength)
      if (f === "none") advance();
    }
    function setStr(n) {
      if (sealed) return;
      if (!guess[cur] || guess[cur].none) { flash(wrap.querySelector(`[data-s="${n}"]`), P + "no"); say("Fenn", "Choose a face before a strength."); return; }
      guess[cur].s = n; panel(); draw(); flash(wrap.querySelector(`[data-s="${n}"]`), P + "bump");
      advance();
    }
    function advance() {
      const nxt = guess.findIndex((g, i) => !g && i !== cur);
      if (nxt >= 0) later(() => { if (!sealed) pick(nxt); }, 160);
    }
    function onMarked() {
      marks++;
      if (ph === 1 && marks === 3) say("A runner's note", "pinned to the drum: “Lowridge felt nothing at dusk on the twelfth, nor on the eighth. They thought the Trunk was sleeping.”");
    }
    function lamp() {
      if (sealed || lamps <= 0) { flash(lampBtn, P + "no"); return; }
      lamps--; lampDay = phase().cells[cur][0];
      const w = phase().weather[lampDay - 1];
      say("Fenn's lamp", `lights every ${w} day in the record. “Look at what the ${w} days did.”`);
      panel(); draw(); flash(lampBtn, P + "bump");
    }
    on(lampBtn, "click", lamp);
    wrap.querySelectorAll("[data-f]").forEach((b) => on(b, "click", () => setFace(b.dataset.f)));
    wrap.querySelectorAll("[data-s]").forEach((b) => on(b, "click", () => setStr(+b.dataset.s)));
    on(window, "keydown", (e) => {
      if (sealed || wrap.querySelector("." + P + "intro") || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (["E", "S", "W", "N"].includes(k)) setFace(k);
      else if (k === "0" || k === "X") setFace("none");
      else if (["1", "2", "3"].includes(k)) setStr(+k);
      else if (k === "L") lamp();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); pick((cur + 1) % guess.length); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); pick((cur + guess.length - 1) % guess.length); }
      else if (e.key === "Enter" && !sealBtn.disabled) { e.preventDefault(); seal(); }
    });

    function seal() {
      if (sealed || guess.some((g) => !g)) return;
      sealed = true; lampDay = null; panel();
      say("", "Fenn holds the lamp while the drum turns.");
      const t0 = performance.now(), dur = api.reducedMotion ? 1 : 2600;
      const step = (now) => {
        revealT = Math.min(1, (now - t0) / dur);
        draw();
        if (revealT < 1) raf = requestAnimationFrame(step); else score();
      };
      raf = requestAnimationFrame(step);
    }
    function score() {
      const PH = phase();
      let c = 0, f = 0;
      PH.cells.forEach(([d, p], i) => { const t = PH.truth(d, p), gs = guess[i]; if (ok(gs, t)) { c++; if (!gs.none && t.s === gs.s) f++; } });
      tally.correct += c; tally.fine += f; tally.made += PH.cells.length; results.push({ c, f, n: PH.cells.length });
      panel();
      if (ph === 0) {
        say("Fenn", c === PH.cells.length ? "“Dawn. East face. Strength two. Again.” She is almost smiling."
          : c ? `${c} of ${PH.cells.length}. “Close. The storms keep it in. Write that down.”` : "“Nothing. Then we were reading the wrong thing.”");
        later(() => {
          const card = document.createElement("div");
          card.className = P + "intro";
          card.innerHTML = `<div class="${P}slip" role="dialog" aria-label="Autumn">
 <h2>Autumn</h2><svg viewBox="0 0 400 34" aria-hidden="true"><path d="M0 17 H80 l3 -6 l3 12 l3 -6 H200 l4 -12 l4 24 l4 -18 l4 12 H320 l3 -4 l3 8 l3 -4 H400" fill="none" stroke="${TRACE}" stroke-width="1.4"/></svg>
 <p class="${P}beat">A leaf the size of a country has fallen past the Scroll House. The drum has turned on, and the tremors keep new hours: something now shakes the world at noon, every noon, from the north.</p>
 <p class="${P}goal">Six cells this time. ${tally.correct} right so far; ${WIN_AT} of 9 wins the sitting.</p>
 <div class="${P}key"><kbd>L</kbd><span>Fenn's lamp: light every day with the same weather as the cell you are on (${lamps} left)</span></div>
 <button class="${P}seal" type="button">Turn the drum</button></div>`;
          wrap.appendChild(card);
          const b = card.querySelector("button");
          on(b, "click", () => { card.remove(); startPhase(1); panel(); draw(); say("Fenn", "“It is not a god. Or it is a god with a routine.”"); pick(0); });
          b.focus();
        }, api.reducedMotion ? 600 : 1800);
      } else finish();
    }
    function finish() {
      const { correct, fine } = tally, scholars = correct * 2 + fine, won = correct >= WIN_AT;
      api.store.set("correct", correct);
      api.store.set("losses", won ? 0 : losses + 1);
      say("Fenn", won ? "quietly: “It keeps hours. Like us.”" : "turns the drum back and reads it again.");
      later(() => api.end(won
        ? { outcome: "win", text: `${correct} of 9 forecasts right, ${fine} of them fine. The Scroll House +${scholars}. Fenn can now say when the world will shake, if not why. In the backyard, a squirrel keeps its hours.` }
        : { outcome: "lose", text: `${correct} of 9 right; the Battlements laugh at the scribes, and the Scroll House gains only ${scholars}. The pattern was on the drum: dawn east, dusk west, nothing in storms; in autumn a noon from the north, rain days only noon, and every fourth dusk empty.${losses + 1 >= 2 ? " Next sitting, Fenn will underline what each column usually holds." : ""}` }), 1300);
    }
    on(sealBtn, "click", seal);
    const startBtn = wrap.querySelector(`.${P}intro .${P}seal`);
    on(startBtn, "click", () => {
      wrap.querySelector("." + P + "intro").remove();
      say("Fenn", gentle ? "has underlined what each column usually holds. “Look at the dawns first.”" : "in the margin: “Look at the dawns first. Then look at the storms.”");
      pick(0);
    });
    startBtn.focus();
    let rw = 0;
    const ro = new ResizeObserver(() => { const w = wrap.getBoundingClientRect().width; if (Math.abs(w - rw) > 2) { rw = w; geom(); draw(); } });
    ro.observe(wrap);
    draw(); panel();
    wrap._test = { get phase() { return ph; }, truth: (d, p) => phase().truth(d, p), cells: () => phase().cells };

    return { unmount() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); ro.disconnect(); wrap.remove(); } };
  },
};

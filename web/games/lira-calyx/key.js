// The Key (1D, Iron-gall botanical plate). DESIGN.md section 11, cut to b1-key-1: six specimens from
// the terrace collection, one anomaly (a juvenile Ember Wolf found at 2 640 m, when the key's name
// says below 2 000 m). Measure the trait each couplet asks for (stopwatch on the glow, rule, altimeter
// tag), follow it to a name, and either name the specimen or key the anomaly by writing a new couplet.
// Two misclassified specimens lose the plate.
const P = "lira-calyx-key-";
const INK = "#3b2618", PAPER = "#ebe0c4", PENCIL = "#7d7a74", SEAL = "#b3212b", TEAL = "#25c2a8";
const NAMES = {
  "Glassleaf": { glow: [1, 3], len: [45, 80], alt: [1500, 3000], text: "Crystalline-barked frond." },
  "Ash-fern": { glow: [2, 3.5], len: [15, 40], alt: [0, 2000], text: "Pinnate fern of the lower slopes; found below 2 000 m." },
  "Spire-moss": { glow: [1, 3.5], len: [10, 40], alt: [2000, 4000], text: "Upright moss; found above 2 000 m." },
  "Spore-Weaver strand": { glow: [4, 6], len: [20, 60], alt: [1800, 3200], text: "A single web thread, beaded." },
  "Ridgeback Strider": { glow: [4, 6], len: [70, 110], alt: [1500, 3000], text: "Dorsal plate of a strider." },
  "Ember Wolf": { glow: [6, 9], len: [60, 90], alt: [0, 2000], text: "Track cast of a Lowland predator; found below 2 000 m." },
  "Ember Wolf, upland form (new)": { glow: [6, 9], len: [60, 90], alt: [2000, 4000], text: "Keyed in pencil by Lira: found above 2 000 m." },
};
const TRAIT = { glow: "Glow period", len: "Length", alt: "Found at" };
const fmt = (t, v) => (t === "glow" ? `${v.toFixed(1)} s` : t === "len" ? `${Math.round(v)} mm` : `${String(Math.round(v)).replace(/(\d)(\d{3})$/, "$1 $2")} m`);
const SPECS = [
  { id: 1, kind: "frond", glow: 2.2, len: 58, alt: 2300, name: "Glassleaf", label: "Frond, terrace edge" },
  { id: 2, kind: "fern", glow: 3.1, len: 28, alt: 1700, name: "Ash-fern", label: "Fern, river stair" },
  { id: 3, kind: "strand", glow: 5.0, len: 44, alt: 2100, name: "Spore-Weaver strand", label: "Thread, valley web" },
  { id: 4, kind: "track", glow: 7.2, len: 74, alt: 2640, name: "Ember Wolf", anomaly: true, label: "Track cast, upper bridge" },
  { id: 5, kind: "moss", glow: 1.6, len: 22, alt: 2450, name: "Spire-moss", label: "Moss, schoolroom wall" },
  { id: 6, kind: "plate", glow: 4.6, len: 92, alt: 2200, name: "Ridgeback Strider", label: "Dorsal plate, bridge" },
];

export default {
  mount(root, api) {
    const off = []; let raf = 0;
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    root.style.background = "#d8cba8";
    const el = document.createElement("div"); el.className = P + "wrap";
    el.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;overflow:auto;background:#d8cba8;color:${INK};font-family:'IM Fell English',Georgia,serif}
      .${P}plate{max-width:1240px;margin:12px auto;background:${PAPER};border:1.5px solid ${INK};outline:1px solid ${INK};outline-offset:-8px;padding:16px 18px 18px;display:flex;flex-wrap:wrap;gap:18px;box-shadow:0 6px 20px rgba(59,38,24,.25)}
      .${P}plate h2{width:100%;text-align:center;font:400 22px 'IM Fell English',Georgia,serif;letter-spacing:.25em;margin:2px 0 0}
      .${P}left{flex:1.2 1 340px;min-width:0}.${P}right{flex:1 1 300px;min-width:0;border-left:1px solid rgba(59,38,24,.35);padding-left:16px}
      @media (max-width:700px){.${P}right{border-left:0;padding-left:0;border-top:1px solid rgba(59,38,24,.35);padding-top:10px}}
      .${P}left svg{width:100%;height:auto;display:block;touch-action:none}
      .${P}wrap button{font:15px 'IM Fell English',Georgia,serif;color:${INK};background:transparent;border:1px solid ${INK};padding:7px 12px;cursor:pointer;min-height:40px}
      .${P}wrap button:hover:not(:disabled){background:rgba(59,38,24,.08)}
      .${P}wrap button:disabled{opacity:.4;cursor:default}
      .${P}kit{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
      .${P}meas{font:15px Georgia,serif;display:grid;grid-template-columns:auto 1fr;gap:2px 12px;margin:6px 0}
      .${P}meas b{font-weight:400;font-style:italic}
      .${P}cp{display:grid;grid-template-columns:2.6em 1fr auto;gap:2px 8px;padding:3px 6px;font-size:15px;align-items:baseline}
      .${P}cp.lit{background:#e2cf98}
      .${P}cp.pencil{color:${PENCIL};font-style:italic}
      .${P}cp button.${P}go{grid-column:1/-1;display:grid;grid-template-columns:2.6em 1fr auto;text-align:left;border:0;padding:4px 0;min-height:34px;font-size:15px}
      .${P}cp .h{grid-column:2/-1;color:${PENCIL};font:italic 13px Georgia,serif}
      .${P}box{border:1px solid ${INK};padding:10px 12px;margin-top:10px;font:15px Georgia,serif;background:rgba(255,255,255,.25)}
      .${P}box p{margin:0 0 8px}
      .${P}row{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}
      .${P}row button.sel{background:${INK};color:${PAPER}}
      .${P}log{font:italic 14px Georgia,serif;color:${PENCIL};margin-top:8px}
      .${P}tally{font:13px 'Courier Prime',monospace;letter-spacing:.06em;margin:4px 0 8px}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(216,203,168,.85);z-index:5;padding:16px}
      .${P}card{max-width:470px;background:${PAPER};border:1.5px solid ${INK};padding:18px 20px}
      .${P}card h3{font:400 26px/1.1 'IM Fell English',Georgia,serif;margin:0 0 8px}.${P}card p{margin:0 0 10px;font:15px/1.45 Georgia,serif}
    </style>
    <div class="${P}plate"><h2>PLATE XIV · THE TERRACE COLLECTION</h2>
      <section class="${P}left" aria-label="Specimen card">
        <div class="${P}tally"></div>
        <svg viewBox="0 0 400 270" aria-label="Specimen drawing with rule"></svg>
        <div class="${P}kit">
          <button type="button" data-t="tap">Stopwatch: tap at each glow</button>
          <button type="button" data-t="rule">Read the rule</button>
          <button type="button" data-t="tag">Read the altimeter tag</button>
        </div>
        <div class="${P}meas" aria-live="polite"></div>
        <div class="${P}log" aria-live="polite"></div>
      </section>
      <section class="${P}right" aria-label="The key"><div class="${P}key"></div><div class="${P}act"></div></section>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const svg = $("svg");

    const KEY = [
      { id: 1, t: "glow", a: { txt: "Glow period under 4 s", go: 2 }, b: { txt: "Glow period 4 s or more", go: 4 }, test: (v) => (v < 4 ? "a" : "b") },
      { id: 2, t: "len", a: { txt: "Length over 40 mm", go: "Glassleaf" }, b: { txt: "Length 40 mm or less", go: 3 }, test: (v) => (v > 40 ? "a" : "b") },
      { id: 3, t: "alt", a: { txt: "Found below 2 000 m", go: "Ash-fern" }, b: { txt: "Found 2 000 m or above", go: "Spire-moss" }, test: (v) => (v < 2000 ? "a" : "b") },
      { id: 4, t: "len", a: { txt: "Length over 60 mm", go: 5 }, b: { txt: "Length 60 mm or less", go: "Spore-Weaver strand" }, test: (v) => (v > 60 ? "a" : "b") },
      { id: 5, t: "glow", a: { txt: "Glow period 6 s or more", go: "Ember Wolf" }, b: { txt: "Glow period under 6 s", go: "Ridgeback Strider" }, test: (v) => (v >= 6 ? "a" : "b") },
    ];
    const st = { i: 0, cp: 1, path: [], m: {}, taps: [], misses: 0, misclassified: 0, keyedNew: 0, named: 0, anomaly: null, jaw: 60, over: false, started: false, t0: performance.now() };
    const spec = () => SPECS[st.i];
    const log = (t) => { $("." + P + "log").textContent = t; };

    // ---- specimen drawing (iron-gall ink, lying along the rule; 3 px per mm from x = 30)
    const X0 = 30, MM = 3, CY = 118;
    const drawSpec = () => {
      const s = spec(), L = s.len * MM, x1 = X0 + L;
      let d = `<defs><radialGradient id="${P}glow"><stop offset="0" stop-color="${TEAL}" stop-opacity=".85"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></radialGradient>
        <pattern id="${P}hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width=".6"/></pattern></defs>
        <rect x="4" y="4" width="392" height="262" fill="none" stroke="${INK}" stroke-width=".8"/>
        <ellipse class="${P}halo" cx="${X0 + L / 2}" cy="${CY}" rx="${Math.max(50, L / 2 + 26)}" ry="70" fill="url(#${P}glow)" opacity="0"/>`;
      const g = [];
      const ink = `fill="none" stroke="${INK}" stroke-linecap="round"`;
      if (s.kind === "frond" || s.kind === "fern") {
        g.push(`<path d="M${X0},${CY + 6} Q${X0 + L / 2},${CY - 8} ${x1},${CY}" ${ink} stroke-width="1.8"/>`);
        const n = s.kind === "frond" ? 7 : 11;
        for (let k = 1; k <= n; k++) {
          const t = k / (n + 1), x = X0 + L * t, y = CY + 6 - 14 * t * (1 - t) * 2 - 6 * t, side = k % 2 ? -1 : 1;
          const ll = (s.kind === "frond" ? 34 : 16) * (1 - t * 0.6);
          const ex = x + ll * 0.5, ey = y + side * ll * 0.8;
          g.push(`<path d="M${x},${y} Q${ex - 6},${ey} ${ex + 4},${ey + side * 2} Q${ex + 6},${y + side * 4} ${x},${y}" fill="${s.kind === "frond" ? "rgba(185,216,234,.35)" : "rgba(124,138,106,.3)"}" stroke="${INK}" stroke-width="1"/>`);
          g.push(`<path d="M${x},${y} L${ex + 2},${ey + side}" ${ink} stroke-width=".5"/>`);
          if (s.kind === "fern") g.push(`<path d="M${x},${y} L${x + 4},${y - side * ll * 0.7}" ${ink} stroke-width=".7"/>`);
        }
        if (s.kind === "frond") g.push(`<circle cx="${X0 + L * 0.3}" cy="${CY - 62}" r="26" fill="${PAPER}" stroke="${INK}"/>` + [...Array(12)].map((_, j) => `<polygon points="${[0, 1, 2, 3, 4, 5].map((q) => { const a = Math.PI / 3 * q, cx = X0 + L * 0.3 - 15 + (j % 4) * 10 + (Math.floor(j / 4) % 2) * 5, cy = CY - 72 + Math.floor(j / 4) * 9; return `${cx + 5 * Math.cos(a)},${cy + 5 * Math.sin(a)}`; }).join(" ")}" fill="none" stroke="${INK}" stroke-width=".5"/>`).join("") + `<text x="${X0 + L * 0.3 + 30}" y="${CY - 80}" font-size="10" font-style="italic" fill="${INK}">fig. 2, facets</text>`);
      } else if (s.kind === "strand") {
        let p = `M${X0},${CY}`;
        for (let k = 1; k <= 24; k++) p += ` L${X0 + L * k / 24},${CY + 8 * Math.sin(k * 1.3)}`;
        g.push(`<path d="${p}" ${ink} stroke-width="1.3"/>`);
        for (let k = 2; k < 24; k += 4) g.push(`<circle cx="${X0 + L * k / 24}" cy="${CY + 8 * Math.sin(k * 1.3)}" r="3.2" fill="rgba(63,196,208,.35)" stroke="${INK}"/>`);
      } else if (s.kind === "moss") {
        g.push(`<path d="M${X0},${CY + 22} L${x1},${CY + 22}" ${ink} stroke-width="1.2"/>`);
        for (let k = 0; k <= 10; k++) { const x = X0 + L * k / 10, h = 18 + 10 * Math.sin(k * 2.1); g.push(`<path d="M${x},${CY + 22} Q${x - 3},${CY + 22 - h / 2} ${x + 1},${CY + 22 - h}" ${ink} stroke-width="1"/><circle cx="${x + 1}" cy="${CY + 21 - h}" r="1.6" fill="${INK}"/>`); }
      } else if (s.kind === "plate") {
        g.push(`<path d="M${X0},${CY} C${X0 + L * 0.15},${CY - 40} ${X0 + L * 0.85},${CY - 36} ${x1},${CY} C${X0 + L * 0.85},${CY + 36} ${X0 + L * 0.15},${CY + 40} ${X0},${CY}Z" fill="url(#${P}hatch)" stroke="${INK}" stroke-width="1.6"/>`);
        for (let k = 1; k < 9; k++) { const x = X0 + L * k / 9, hh = 34 * Math.sin(Math.PI * k / 9); g.push(`<path d="M${x},${CY - hh} Q${x + 6},${CY} ${x},${CY + hh}" ${ink} stroke-width="1"/>`); }
        g.push(`<path d="M${X0 + 8},${CY} L${x1 - 6},${CY}" ${ink} stroke-width="2"/>`);
      } else if (s.kind === "track") {
        g.push(`<ellipse cx="${X0 + L * 0.3}" cy="${CY}" rx="${L * 0.28}" ry="${L * 0.24}" fill="url(#${P}hatch)" stroke="${INK}" stroke-width="1.6"/>`);
        [[-0.62, 0.5], [-0.2, 0.36], [0.2, 0.36], [0.62, 0.5]].forEach(([dy, dx]) => {
          const cx = X0 + L * (0.6 + dx * 0.4), cy = CY + dy * L * 0.42;
          g.push(`<ellipse cx="${cx}" cy="${cy}" rx="${L * 0.1}" ry="${L * 0.075}" fill="rgba(156,74,37,.2)" stroke="${INK}" stroke-width="1.3"/>`);
        });
        g.push(`<path d="M${x1 - L * 0.05},${CY - L * 0.06} L${x1},${CY} L${x1 - L * 0.05},${CY + L * 0.06}" ${ink} stroke-width="1.4"/>`);
      }
      d += `<g>${g.join("")}</g>`;
      // rule
      const RY = 226;
      d += `<rect x="${X0 - 6}" y="${RY}" width="${110 * MM + 12}" height="22" fill="#e7d6a8" stroke="${INK}"/>`;
      for (let mm = 0; mm <= 110; mm++) { const x = X0 + mm * MM, h = mm % 10 === 0 ? 10 : mm % 5 === 0 ? 7 : 4; d += `<line x1="${x}" x2="${x}" y1="${RY}" y2="${RY + h}" stroke="${INK}" stroke-width=".6"/>`; if (mm % 10 === 0) d += `<text x="${x}" y="${RY + 20}" font-size="8" text-anchor="middle" fill="${INK}" font-family="Courier Prime,monospace">${mm}</text>`; }
      d += `<line x1="${X0}" x2="${X0}" y1="${CY - 50}" y2="${RY}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 3"/>`;
      d += `<g class="${P}jaw" tabindex="0" role="slider" aria-label="Rule jaw, millimetres" style="cursor:ew-resize"><rect class="${P}jhit" x="-14" y="${CY - 60}" width="28" height="${RY - CY + 86}" fill="transparent"/><line x1="0" x2="0" y1="${CY - 56}" y2="${RY + 22}" stroke="${SEAL}" stroke-width="1.6"/><path d="M-7,${RY + 24} L0,${RY + 14} L7,${RY + 24}Z" fill="${SEAL}"/></g>`;
      d += `<text x="390" y="20" text-anchor="end" font-size="12" font-style="italic" fill="${INK}">fig. ${s.id}. ${s.label}</text>`;
      d += `<g class="${P}tag"><rect x="320" y="150" width="62" height="34" fill="#f3ead0" stroke="${INK}"/><circle cx="328" cy="167" r="3" fill="none" stroke="${INK}"/><text x="352" y="164" font-size="8" text-anchor="middle" fill="${INK}" font-family="Courier Prime,monospace">ALT TAG</text><text x="352" y="178" font-size="10" text-anchor="middle" fill="${INK}" font-family="Courier Prime,monospace">${st.m.alt != null ? fmt("alt", s.alt) : "· · ·"}</text></g>`;
      svg.innerHTML = d;
      placeJaw();
    };
    const placeJaw = () => { const j = svg.querySelector("." + P + "jaw"); if (j) { j.setAttribute("transform", `translate(${X0 + st.jaw * MM},0)`); j.setAttribute("aria-valuenow", st.jaw); } };
    const svgX = (e) => { const r = svg.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 400; };
    let drag = false;
    on(svg, "pointerdown", (e) => { if (!st.started || st.over) return; const x = svgX(e); if (Math.abs(x - (X0 + st.jaw * MM)) < 30 || e.target.closest("." + P + "jaw")) { drag = true; try { svg.setPointerCapture(e.pointerId); } catch {} } });
    on(svg, "pointermove", (e) => { if (!drag) return; st.jaw = Math.max(0, Math.min(110, Math.round((svgX(e) - X0) / MM * 2) / 2)); placeJaw(); });
    on(svg, "pointerup", () => { drag = false; });
    on(svg, "keydown", (e) => { if (!e.target.closest("." + P + "jaw")) return; if (e.key === "ArrowLeft") st.jaw = Math.max(0, st.jaw - (e.shiftKey ? 0.5 : 1)); else if (e.key === "ArrowRight") st.jaw = Math.min(110, st.jaw + (e.shiftKey ? 0.5 : 1)); else return; e.preventDefault(); placeJaw(); });

    // glow: flashes once per period (opacity only)
    const loop = (now) => {
      const h = svg.querySelector("." + P + "halo");
      if (h && st.started) { const per = spec().glow * 1000, ph = ((now - st.t0) % per) / per; h.setAttribute("opacity", ph < 0.12 ? 1 - ph / 0.12 * 0.3 : 0.12); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // ---- measuring kit
    const renderMeas = () => {
      const s = spec(), m = st.m;
      $("." + P + "meas").innerHTML = ["glow", "len", "alt"].map((t) => `<b>${TRAIT[t]}</b><span>${m[t] != null ? fmt(t, m[t]) : t === "glow" && st.taps.length ? `${st.taps.length} tap${st.taps.length > 1 ? "s" : ""}…` : "not measured"}</span>`).join("");
      $("." + P + "tally").textContent = `SPECIMEN ${st.i + 1} OF 6 · NAMED ${st.named} · KEYED NEW ${st.keyedNew} · MISCLASSIFIED ${st.misclassified}`;
      void s;
    };
    const tool = (t) => {
      if (st.over || !st.started) return;
      const s = spec();
      if (t === "tap") {
        const now = performance.now();
        if (st.taps.length && now - st.taps[st.taps.length - 1] > 12000) st.taps = [];
        st.taps.push(now);
        if (st.taps.length >= 4) {
          const iv = (st.taps[3] - st.taps[0]) / 3000;
          st.m.glow = Math.round(iv * 10) / 10; st.taps = [];
          log(`Three glow intervals: ${fmt("glow", st.m.glow)}.`);
        } else log(`Tap ${st.taps.length} of 4: tap again as it glows.`);
      }
      if (t === "rule") { st.m.len = st.jaw; log(st.jaw === 0 ? "Drag the red jaw along the rule to the specimen's tip first." : `Rule read at ${fmt("len", st.jaw)}.`); if (st.jaw === 0) delete st.m.len; }
      if (t === "tag") { st.m.alt = s.alt; log(`Altimeter tag: ${fmt("alt", s.alt)}.`); drawSpec(); }
      renderMeas(); renderKey();
    };
    el.querySelectorAll("[data-t]").forEach((b) => on(b, "click", () => tool(b.dataset.t)));

    // ---- the key
    const keyEl = $("." + P + "key"), act = $("." + P + "act");
    const nameText = (n) => typeof n === "number" ? `${n}` : n;
    function renderKey() {
      keyEl.innerHTML = `<div class="${P}tally">THE KEY · couplets in pencil are Lira's</div>`;
      for (const c of KEY) {
        const lit = st.cp === c.id && !st.anomaly && !st.atName;
        const row = document.createElement("div"); row.className = P + "cp" + (lit ? " lit" : "") + (c.pencil ? " pencil" : "");
        for (const side of ["a", "b"]) {
          const br = c[side];
          const lab = `${c.id}${side}.`, dest = typeof br.go === "number" ? br.go : br.go;
          if (lit) {
            const b = document.createElement("button"); b.type = "button"; b.className = P + "go";
            b.innerHTML = `<span>${lab}</span><span>${br.txt} ……</span><span>${nameText(dest)}</span>`;
            b.disabled = st.m[c.t] == null;
            on(b, "click", () => choose(c, side));
            row.appendChild(b);
          } else row.insertAdjacentHTML("beforeend", `<span>${lab}</span><span>${br.txt} ……</span><span style="text-align:right">${nameText(dest)}</span>`);
        }
        if (lit && st.m[c.t] == null) row.insertAdjacentHTML("beforeend", `<span class="h">Measure ${TRAIT[c.t].toLowerCase()} first.</span>`);
        if (lit && st.misses >= 2) row.insertAdjacentHTML("beforeend", `<span class="h">${TRAIT[c.t]}: ${fmt(c.t, spec()[c.t])} (the measure to use)</span>`);
        keyEl.appendChild(row);
      }
    }
    const choose = (c, side) => {
      const s = spec();
      if (c.test(s[c.t]) !== side) st.misses++;
      st.path.push(c.id);
      const go = c[side].go;
      if (typeof go === "number") { st.cp = go; renderKey(); return; }
      st.atName = go; st.leaf = { c, side }; renderKey(); renderName();
    };
    const renderName = () => {
      const n = NAMES[st.atName], m = st.m;
      const rng2 = (t) => (t === "alt" && n.alt[0] === 0 ? `below ${fmt("alt", n.alt[1])}` : t === "alt" && n.alt[1] === 4000 ? `above ${fmt("alt", n.alt[0])}` : `${fmt(t, n[t][0])}–${fmt(t, n[t][1])}`);
      act.innerHTML = `<div class="${P}box"><p><i>${st.atName}.</i> ${n.text}</p><p>Glow ${rng2("glow")}; length ${rng2("len")}; ${rng2("alt")}.</p>
        <p style="font-style:italic">Your measures: ${["glow", "len", "alt"].map((t) => (m[t] != null ? fmt(t, m[t]) : "—")).join(" · ")}</p>
        <div class="${P}row"><button type="button" data-n="name">Name it</button><button type="button" data-n="anom">Anomaly: write a couplet</button><button type="button" data-n="back">Back to couplet 1</button></div></div>`;
      act.querySelectorAll("[data-n]").forEach((b) => on(b, "click", () => {
        const k = b.dataset.n;
        if (k === "back") { st.atName = null; st.cp = 1; act.innerHTML = ""; renderKey(); return; }
        if (k === "name") return settle(st.atName === spec().name && !spec().anomaly, st.atName);
        const s = spec();
        if (!s.anomaly) { log(s.name === st.atName ? "Every measure sits inside the description; nothing to separate." : "It does not fit, but not as an anomaly: retrace the couplets."); return; }
        if (st.atName !== s.name) { log("Retrace the couplets first: this name is not where the specimen leads."); return; }
        st.anomaly = { trait: null, thr: null, at: null, tries: 0 }; renderAnomaly();
      }));
    };
    const renderAnomaly = () => {
      const a = st.anomaly, n = NAMES[st.atName], s = spec();
      const thrs = a.trait ? [...new Set([n[a.trait][0], n[a.trait][1], st.m[a.trait] ?? s[a.trait]])].filter((v) => v > 0 && v < 4000).sort((x, y) => x - y) : [];
      act.innerHTML = `<div class="${P}box"><p>Which measured trait separates it from <i>${st.atName}</i>?</p>
        <div class="${P}row">${["glow", "len", "alt"].map((t) => `<button type="button" data-tr="${t}" class="${a.trait === t ? "sel" : ""}" ${st.m[t] == null ? "disabled" : ""}>${TRAIT[t]}</button>`).join("")}</div>
        ${a.trait ? `<p>Threshold</p><div class="${P}row">${thrs.map((v) => `<button type="button" data-th="${v}" class="${a.thr === v ? "sel" : ""}">${fmt(a.trait, v)}</button>`).join("")}</div>` : ""}
        <p>Insert the couplet</p><div class="${P}row">${[["top", "before couplet 1"], ["c4", `at couplet 4`], ["leaf", `at ${st.leaf.c.id}${st.leaf.side}, before the name`]].map(([k, l]) => `<button type="button" data-at="${k}" class="${a.at === k ? "sel" : ""}">${l}</button>`).join("")}</div>
        <div class="${P}row"><button type="button" data-w="1" ${a.trait && a.thr != null && a.at ? "" : "disabled"}>Write it in pencil</button></div></div>`;
      act.querySelectorAll("[data-tr]").forEach((b) => on(b, "click", () => { a.trait = b.dataset.tr; a.thr = null; renderAnomaly(); }));
      act.querySelectorAll("[data-th]").forEach((b) => on(b, "click", () => { a.thr = +b.dataset.th; renderAnomaly(); }));
      act.querySelectorAll("[data-at]").forEach((b) => on(b, "click", () => { a.at = b.dataset.at; renderAnomaly(); }));
      const w = act.querySelector("[data-w]");
      on(w, "click", () => {
        const ok = a.trait === "alt" && a.thr === 2000 && a.at === "leaf";
        if (!ok) {
          a.tries++;
          log(a.tries >= 2 ? "Lira's note: the tag says 2 640 m; the description says below 2 000 m. Separate there, just before the name." : "That couplet does not separate it from the name it reached. Try again.");
          return;
        }
        const id = KEY.length + 1;
        st.leaf.c[st.leaf.side].go = id;
        KEY.push({ id, t: "alt", pencil: true, a: { txt: "Found below 2 000 m", go: "Ember Wolf" }, b: { txt: "Found 2 000 m or above", go: "Ember Wolf, upland form (new)" }, test: (v) => (v < 2000 ? "a" : "b") });
        st.keyedNew++; log("Couplet written in pencil. The juvenile is keyed as new.");
        next();
      });
    };
    const settle = (ok, name) => {
      if (ok) { st.named++; log(`${name}: named.`); }
      else { st.misclassified++; log(`${name}: logged misclassified.`); }
      if (st.misclassified >= 2) { st.over = true; renderMeas(); api.end({ outcome: "lose", text: `Two specimens misclassified. The terrace collection goes into the journal unverified (${st.named} named, ${st.keyedNew} keyed new).` }); return; }
      next();
    };
    const next = () => {
      st.i++; st.cp = 1; st.m = {}; st.taps = []; st.atName = null; st.anomaly = null; st.path = []; st.jaw = 0; act.innerHTML = "";
      if (st.i >= SPECS.length) {
        st.over = true; st.i = SPECS.length - 1;
        const clean = st.misclassified === 0 && st.keyedNew === 1;
        api.end({ outcome: "win", text: `All six specimens keyed: ${st.named} named, ${st.keyedNew} keyed as new${st.misclassified ? `, ${st.misclassified} misclassified` : ""}. ${clean ? "The anomaly now has its own couplet in Lira's pencil." : st.keyedNew ? "" : "The anomaly went in under the wrong name."}` });
        return;
      }
      st.t0 = performance.now(); drawSpec(); renderMeas(); renderKey();
    };

    st.jaw = 0; drawSpec(); renderMeas(); renderKey();
    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h3>The Key</h3>
      <p>Key six specimens from the terrace. Each lit couplet asks for one trait: time the glow with the stopwatch (tap four times as it glows), drag the red jaw to the tip and read the rule, or read the altimeter tag.</p>
      <p>Follow the couplets to a name. If the specimen contradicts the name's description, it is an anomaly: write a new couplet. Two misclassified specimens lose the plate.</p>
      <button type="button">Open the collection</button></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); st.started = true; st.t0 = performance.now(); });
    sb.focus();
    return { unmount() { cancelAnimationFrame(raf); off.forEach((f) => f()); } };
  },
};
